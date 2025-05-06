// Elementos del DOM
const elements = {
    //Elementos de busqueda
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    locationBtnEl: document.getElementById('location-btn'),
    suggestionsListEl:document.getElementById('suggestions-btn'),

    //Elementos de UI principales
    loadingEl: document.getElementById('loading'),
    errorEl: document.getElementById('error'),
    errorMessageEl: document.getElementById('error-message'),
    retryBtnEl: document.getElementById('retry-message'),

    //Elementos de clima actual
    currentWeatherEl: document.getElementById('current-weather'),
    cityNameEl: document.getElementById('city-name'),
    dateEl: document.getElementById('date'),
    tempEl: document.getElementById('temp'),
    weatherIconEl: document.getElementById('weather-icon'),
    weatherDescriptionEl: document.getElementById('weather-description'),
    feelsLikeEl: document.getElementById('feels-like'),
    humidityEl: document.getElementById('humidity'),
    windEl: document.getElementById('wind'),

    //Elemento de pronostico
    forecastEl: document.getElementById('forecast'),

    //Elemento de unidades
    celsiusBtn:document.getElementById('celsius-btn'),
    fahrenheiBtn:document.getElementById('fahrenheit-btn'),

    //Elementos de notificacion
    toastEl: document.getElementById('toast'),
    toastContentEl:document.getElementById('toast-content'),

    //Elementos de busqueda recientes
    recentSearchesEl: document.getElementById('recent-searches'),
    recentSearchesListEl: document.getElementById('recent-searches-list'),

    //Estado de API
    remainingRequestsEl: document.getElementById('remaining-requests')
};

// Función para mostrar el indicador de carga
function showLoading() {
    elements.loadingEl.style.display = 'block';
    elements.errorEl.style.display = 'none';
}

// Función para ocultar el indicador de carga
function hideLoading() {
    elements.loadingEl.style.display = 'none';
}

// Función para mostrar un error
function showError() {
    elements.errorEl.style.display = 'block';
}

export { elements, showLoading, hideLoading, showError };