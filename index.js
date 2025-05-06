import { getWeather, getForecast,getLocationWeatjer } from './App/api.js';
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
                    displayForecast(forecast);
                    //return getForecast(data.name);
                })
                //.then(displayForecast)
                .catch(error => {
                    console.error(error);
                    showError("Error al obtener la ubicación");
                })
                .finally(hideLoading);
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
            return getForecast(city);
        })
        .then(forecastData => {
            displayForecast(forecastData);
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