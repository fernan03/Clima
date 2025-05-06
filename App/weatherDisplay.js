import { elements, showError } from './dom.js';
import { ICON_URL, convertTemperature } from './api.js';
import { formatDate, formatDay, filterDailyForecasts } from './funciones.js';

// Variable para mantener las unidades actuales
let usingFahrenheit = false;

// Datos del clima actual (para conversión de unidades sin nueva petición)
let currentWeatherData = null;
let currentForecastData = null;

// Función para mostrar el clima actual
function displayCurrentWeather(data) {
    // Guardar datos para posible cambio de unidades
    currentWeatherData = data;
    
    const { name, main, weather, wind, sys } = data;
    
    // Mostrar información de la ciudad y fecha
    elements.cityNameEl.textContent =sys && sys.country ? `${name}, ${sys.country}`:name;
    elements.dateEl.textContent = formatDate(new Date());
    
    // Calcular temperatura según unidades seleccionadas
    const temp = usingFahrenheit ? 
        convertTemperature(main.temp, true) : 
        main.temp;
    
    const feelsLike = usingFahrenheit ? 
        convertTemperature(main.feels_like, true) : 
        main.feels_like;
    
    // Mostrar información del clima
    elements.tempEl.textContent = `${Math.round(temp)}${usingFahrenheit ? '°F' : '°C'}`;
    elements.feelsLikeEl.textContent = `${Math.round(feelsLike)}${usingFahrenheit ? '°F' : '°C'}`;
    elements.humidityEl.textContent = `${main.humidity}%`;
    
    // Convertir velocidad del viento según unidades (km/h o mph)
    const windSpeed = wind.speed * 3.6; // Convertir a km/h
    const displayWindSpeed = usingFahrenheit ? 
        (windSpeed * 0.621371) : // Convertir km/h a mph
        windSpeed;
    
    elements.windEl.textContent = `${Math.round(displayWindSpeed)} ${usingFahrenheit ? 'mph' : 'km/h'}`;
    
    // Mostrar imagen y descripción del clima
    elements.weatherIconEl.src = `${ICON_URL}${weather[0].icon}@2x.png`;
    elements.weatherIconEl.alt = weather[0].description;
    elements.weatherDescriptionEl.textContent = weather[0].description;
    
    // Mostrar el contenedor del clima actual
    elements.currentWeatherEl.style.display = 'block';
}

// Función para mostrar el pronóstico
function displayForecast(data) {
    if(!data || !Array.isArray(data.list)) {
        console.error("Datos de pronóstico inválidos:", data);
        showError("Error al obtener el pronóstico");
        return;
    }
    // Guardar datos para posible cambio de unidades
    currentForecastData = data;
    
    // Limpiar el contenedor del pronóstico
    elements.forecastEl.innerHTML = '';
    
    console.log("Datos recibidos en displayForecast:", data);
    // Obtener un pronóstico para cada día (cada 24 horas)
    const dailyForecasts = filterDailyForecasts(data.list);
    
    // Mostrar el pronóstico para cada día
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = formatDay(date);
        
        // Calcular temperatura según unidades seleccionadas
        const temp = usingFahrenheit ? 
            convertTemperature(forecast.main.temp, true) : 
            forecast.main.temp;
        
        const icon = forecast.weather[0].icon;
        const description = forecast.weather[0].description;
        
        const forecastDayEl = document.createElement('div');
        forecastDayEl.className = 'forecast-day';
        forecastDayEl.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <img src="${ICON_URL}${icon}.png" alt="${description}">
            <div class="forecast-temp">${Math.round(temp)}${usingFahrenheit ? '°F' : '°C'}</div>
            <div>${description}</div>
        `;
        
        elements.forecastEl.appendChild(forecastDayEl);
    });
}

// Función para actualizar las unidades sin hacer nuevas peticiones
function updateUnits(toFahrenheit) {
    // Actualizar estado global
    usingFahrenheit = toFahrenheit;
    
    // Actualizar botones de unidades
    elements.celsiusBtn.classList.toggle('active', !toFahrenheit);
    elements.fahrenheitBtn.classList.toggle('active', toFahrenheit);
    
    // Si hay datos cargados, actualizar visualización
    if (currentWeatherData) {
        displayCurrentWeather(currentWeatherData);
    }
    
    if (currentForecastData) {
        displayForecast(currentForecastData);
    }
    
    // Guardar preferencia en localStorage
    localStorage.setItem('usingFahrenheit', toFahrenheit);
}

// Función para mostrar errores personalizados
function displayError(errorType, errorMessage) {
    // Ocultar pantalla de carga
    elements.loadingEl.style.display = 'none';
    
    // Ocultar contenido del clima
    elements.currentWeatherEl.style.display = 'none';
    elements.forecastEl.innerHTML = '';
    
    // Personalizar mensaje según tipo de error
    let iconClass = 'error-network';
    let message = errorMessage || 'Ha ocurrido un error. Intenta de nuevo.';
    
    switch(errorType) {
        case 'not_found':
            iconClass = 'error-not-found';
            break;
        case 'network_error':
            iconClass = 'error-network';
            break;
        case 'api_limit_exceeded':
            iconClass = 'error-limit';
            message = `${message}. Intenta de nuevo más tarde.`;
            break;
    }
    
    // Mostrar mensaje de error
    elements.errorEl.className = `error ${iconClass}`;
    elements.errorMessageEl.textContent = message;
    elements.errorEl.style.display = 'flex';
}

// Función para mostrar notificaciones temporales (toast)
function showToast(message, type = 'info', duration = 3000) {
    const toast = elements.toastEl;
    const toastContent = elements.toastContentEl;
    
    // Establecer mensaje y tipo
    toastContent.textContent = message;
    toast.className = `toast ${type}`;
    
    // Mostrar toast
    toast.style.display = 'block';
    
    // Ocultar después de la duración
    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

// Función para actualizar contador de peticiones restantes
function updateRemainingRequests(count) {
    elements.remainingRequestsEl.textContent = count;
}

// Función para mostrar sugerencias de ciudades
function displayCitySuggestions(suggestions) {
    const suggestionsList = elements.suggestionsListEl;
    
    // Limpiar lista
    suggestionsList.innerHTML = '';
    
    if (suggestions.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }
    
    // Crear elementos para cada sugerencia
    suggestions.forEach(city => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = city.fullName;
        
        // Añadir evento click
        item.addEventListener('click', () => {
            elements.cityInputEl.value = city.fullName;
            suggestionsList.style.display = 'none';
        });
        
        suggestionsList.appendChild(item);
    });
    
    // Mostrar lista
    suggestionsList.style.display = 'block';
}

// Función para mostrar búsquedas recientes
function displayRecentSearches(searches) {
    const recentSearchesList = elements.recentSearchesListEl;
    
    // Limpiar lista
    recentSearchesList.innerHTML = '';
    
    if (searches.length === 0) {
        elements.recentSearchesEl.style.display = 'none';
        return;
    }
    
    // Crear elementos para cada búsqueda reciente
    searches.forEach(search => {
        const item = document.createElement('li');
        
        // Crear botón para buscar
        const searchBtn = document.createElement('button');
        searchBtn.className = 'recent-search-btn';
        searchBtn.textContent = search;
        
        // Crear botón para eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'recent-search-delete';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Eliminar de la lista';
        
        // Añadir elementos a la lista
        item.appendChild(searchBtn);
        item.appendChild(deleteBtn);
        recentSearchesList.appendChild(item);
    });
    
    // Mostrar contenedor
    elements.recentSearchesEl.style.display = 'block';
}

// Inicializar unidades desde localStorage
function initUnits() {
    // Recuperar preferencia guardada
    const savedPreference = localStorage.getItem('usingFahrenheit');
    
    // Si hay preferencia guardada
    if (savedPreference !== null) {
        usingFahrenheit = savedPreference === 'true';
        
        // Actualizar UI
        elements.celsiusBtn.classList.toggle('active', !usingFahrenheit);
        elements.fahrenheitBtn.classList.toggle('active', usingFahrenheit);
    }
}

// Exportar todas las funciones
export { 
    displayCurrentWeather, 
    displayForecast, 
    updateUnits, 
    displayError, 
    showToast,
    updateRemainingRequests,
    displayCitySuggestions,
    displayRecentSearches,
    initUnits
};