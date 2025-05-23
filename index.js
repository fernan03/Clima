import { getWeather, getForecast,getLocationWeatjer, getUVIndex } from './App/api.js';
import { elements, showLoading, hideLoading, showError } from './App/dom.js';
import { saveLastCity, getLastCity } from './App/funciones.js';
import { displayCurrentWeather, displayForecast } from './App/weatherDisplay.js';


elements.searchBtn.addEventListener('click', searchWeather);
elements.cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchWeather();
    }
});
elements.locationBtnEl.addEventListener('click', ()=> {
    if(!navigator.geolocation) {
        showError('Geolocalización no soportada en este navegador');
        return;
    }
    showLoading();
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            console.log("Ubicacion obtenida:", latitude, longitude);
            getLocationWeatjer()
                .then(({weather,forecast})=>{
                    if(!weather || !forecast) {
                        throw new Error("datos incompletos de la API");
                    }
                    displayCurrentWeather(weather);
                    
                    getUVIndex(latitude,longitude).then(uvIndex => {
                        elements.uvIndexEl.textContent = `Indice UV: ${uvIndex}`;
                    }). catch(error => {
                        console.warn('No se pudo obtener el indice UV',error)
                    });
                    
                    displayForecast(forecast);
                    //return getForecast(data.name);
                })
                //.then(displayForecast)
                .catch(error => {
                    console.error(error);
                    showError("Error al obtener la ubicación");
                })
                .finally(hideLoading); //comentario
        },
        error => {
            console.error(error);
            showError("Error al obtener la ubicación");
            hideLoading();
        }
    );
});

function searchWeather() {
    const city = elements.cityInput.value.trim();
    if (!city) return;
    
   
    saveLastCity(city);
    
   
    showLoading();
   
    getWeather(city)
        .then(weatherData => {
            displayCurrentWeather(weatherData);
            const { lat, lon } = weatherData.coord;
            return Promise.all([
                getForecast(city),
                getUVIndex(lat,lon)
            ]).then(([forecastData, uvIndex]) => {
                displayForecast(forecastData);
                elements.uvIndexEl.textContent = `Indice UV: ${uvIndex}`;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showError();
        })
        .finally(() => {
            hideLoading();
        });
}

// Función para inicializar la aplicación
function init() {
    const lastCity = getLastCity();
    if (lastCity) {
        elements.cityInput.value = lastCity;
        searchWeather();
    } else {
        elements.cityInput.value = 'Medellin';
        searchWeather();
    }
}

// Iniciar la aplicación
init();