const API_KEY = 'a629b2d199718c4ffa62e169c068994d'; 
const CURRENT_WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API = 'https://api.openweathermap.org/data/2.5/forecast';
const ICON_URL = 'https://openweathermap.org/img/wn/';
const GEO_API = 'https://api.openweathermap.org/geo/1.0/direct';


const ERROR_TYPES = {
    NOT_FOUND: 'not_found',
    NETWORK:'network_error',
    API_LIMIT:'api_limit_exceeded',
    GENERIC:'generic_error'
};

let dailyRequestCount = 0;
const MAX_DAILY_REQUESTS = 950;

const cache ={
    weather: {},
    forecast:{},
    timestamp:{}
};

function canUseCache(city,type){
    if(!cache.timestamp[city] || !cache[type][city]) return false;
    
    const now = new Date().getTime();
    const cacheTime = cache.timestamp[city];
    const thirtyMinutesInMs = 30 * 60 * 1000;

    return (now - cacheTime) < thirtyMinutesInMs;
}

async function getWeather(city) {
    if (canUseCache(city,'weather')){
        return cache.weather[city];
    }

    dailyRequestCount++;

    if(dailyRequestCount >=MAX_DAILY_REQUESTS){
        throw {
            type:ERROR_TYPES.API_LIMIT,
            message:'Se ha alcanzado el limite diario de peticiones a la API'
        };
    }

    const url = `${CURRENT_WEATHER_API}?q=${city}&appid=${API_KEY}&units=metric&lang=es`;
    
    try {
        if(!navigator.onLine){
            throw{
                type:ERROR_TYPES.NETWORK,
                message:'No hay conexion a internet'
            };
        }

        const response = await fetch(url);
        if (!response.ok) {
            if(response.status ===404){
                throw{
                    type:ERROR_TYPES.NOT_FOUND,
                    message:'Ciudad no encontrada'
                };
            } else if(response.status === 429){
                throw{
                    type:ERROR_TYPES.API_LIMIT,
                    message:'Se ha excedido el limite de peticiones a la API'
                };
            } else{
                throw{
                    type:ERROR_TYPES.GENERIC,
                    message:`Error ${response.status}: ${response.statusText}`
                };
            }  
        } 

        const data = await response.json();

        cache.weather[city] = data;
        cache.timestamp[city]= new Date().getTime();
        
        return data

    } catch (error) {
        if(error.type){
            throw error;
        }
        if (error.name ==='TypeError' && error.message.includes('fetch')){
        throw{
            type:ERROR_TYPES.NETWORK,
            message:'Error de conexion. Verifica tu conexion a internet.'
            };
        }
    
        throw{
            type:ERROR_TYPES.GENERIC,
            message:error.message || 'Ocurrio un error al obtener los datos del clima'
        };
        
    }
}


async function getForecast(city) {
    if (canUseCache(city,'forecast')){
        return cache.forecast[city];
    }

    dailyRequestCount++;

    if(dailyRequestCount >=MAX_DAILY_REQUESTS){
        throw {
            type:ERROR_TYPES.API_LIMIT,
            message:'Se ha alcanzado el limite diario de peticiones a la API'
        };
    }
    const url = `${FORECAST_API}?q=${city}&appid=${API_KEY}&units=metric&lang=es`;
    
    try {
        if(!navigator.onLine){
            throw{
                type:ERROR_TYPES.NETWORK,
                message:'No hay conexion a internet'
            };
        }

        const response = await fetch(url);

        if (!response.ok) {
            if(response.status===404){
                throw{
                    type:ERROR_TYPES.NOT_FOUND,
                    message:'Ciudad no encontrada'
                };
            }else if(response.status===429){
                throw{
                    type:ERROR_TYPES.API_LIMIT,
                    message:'Se ha excedido el limite de peticiones a la API'
                };
            }else{
                throw{
                    type:ERROR_TYPES.GENERIC,
                    message:`Error ${response.status}: ${response.statusText}`
                };
            }
        }
        
        const data= await response.json();
        cache.forecast[city] = data;
        cache.timestamp[city] = new Date().getTime();

        return data
    } catch (error) {
        if(error.type){
            throw error;
        }
        if (error.name ==='TypeError' && error.message.includes('fetch')){
            throw{
                type:ERROR_TYPES.NETWORK,
                message:'Error de conexion. Verifica tu conexion a internet.'
            };
        }
        
        throw{
            type:ERROR_TYPES.GENERIC,
            message:error.message || 'Ocurrio un error al obtener los datos del clima'
        };  
    }
}

async function getLocationWeatjer(){
    return new Promise((resolve,reject)=>{
        if(!navigator.geolocation){
            reject({
                type:ERROR_TYPES.GENERIC,
                message:"La geolocalizacion no esta disponible en este navegador"
            });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async(position)=>{
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try{
                    const weatherUrl = `${CURRENT_WEATHER_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
                    const forecastUrl = `${FORECAST_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
                    dailyRequestCount +=2;

                    if (dailyRequestCount >= MAX_DAILY_REQUESTS) {
                        throw {
                            type: ERROR_TYPES.API_LIMIT,
                            message: 'Se ha alcanzado el límite diario de peticiones a la API'
                        };
                    }
                    const [weatherResponse, forecastResponse]= await Promise.all([
                        fetch(weatherUrl),
                        fetch(forecastUrl)
                    ]);
                    if(!weatherResponse.ok || !forecastResponse.ok){
                        throw{
                            type:ERROR_TYPES.GENERIC,
                            message:'Error al obtener datos para tu ubicacion'
                        };
                    }
                    const weatherData = await weatherResponse.json();
                    const forecastData = await forecastResponse.json();
                    
                    const cityName = weatherData.name;
                    cache.weather[cityName] = weatherData,
                    cache.forecast[cityName] = forecastData,
                    cache.timestamp[cityName] = new Date().getTime();

                    resolve({
                        weather:weatherData,
                        forecast:forecastData
                    });
                } catch(error){
                    reject({
                        type:error.type || ERROR_TYPES,
                        message: error.message || 'Error al obtener datos para tu ubicacion'
                    });
                }
            },
            (error)=>{
                let message = 'Error al obtener tu ubicacion';

                switch(error.code){
                    case error.PERMISSION_DENIED:
                        message = 'Permiso de ubicacion denegado';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Informacion de ubicacion no disponible';
                        break;
                    case error.TIMEOUT:
                        message = 'Tiempo de espera agotado para obtener ubicacion';
                        break
                }
                reject({
                    type:ERROR_TYPES.GENERIC,
                    message:message
                });
            }
        );
    });
}

async function getCitySuggestions(query){
    if(!query || query.length < 3) return [];
    dailyRequestCount++;

    if (dailyRequestCount >= MAX_DAILY_REQUESTS) {
        throw {
            type: ERROR_TYPES.API_LIMIT,
            message: 'Se ha alcanzado el límite diario de peticiones a la API'
        };
    }

    const url = `${GEO_API}?q=${query}&limit=5&appid=${API_KEY}`;
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw{
                type:ERROR_TYPES.GENERIC,
                message:'Error al buscar ciudades'
            };
        }
        const data = await response.json();

        return data.map(city=>({
            name: city.name,
            country:city.country,
            state:city.state || '',
            fullName: `${city.name}, ${city.state ? `${city.state},` : ''}${city.country}`
        }));
    }catch(error){
        throw{
            type:error.type || ERROR_TYPES.GENERIC,
            message:error.message || 'Error al buscar ciudades'
        };
    }
}

function getRemainigRequests(){
    return MAX_DAILY_REQUESTS - dailyRequestCount;
}

 export function convertTemperature(celsius, toFahrenheit ){
    return toFahrenheit ? (celsius * 9)/ 5 + 32 : ((celsius - 32) * 5) / 9;
}







export { 
    getWeather, 
    getForecast,
    getLocationWeatjer,
    getCitySuggestions,
    convertTemperature,
    getRemainigRequests, 
    ICON_URL 
};