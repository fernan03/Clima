// Función para formatear la fecha
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Función para formatear el día de la semana
function formatDay(date) {
    const options = { weekday: 'short' };
    return date.toLocaleDateString('es-ES', options);
}

// Función para filtrar el pronóstico diario (cada 24 horas)
function filterDailyForecasts(forecastList) {
    const dailyForecasts = [];
    const today = new Date().getDate();
    
    // Filtrar un pronóstico por día
    for (let i = 0; i < forecastList.length; i++) {
        const forecastDate = new Date(forecastList[i].dt * 1000);
        const forecastDay = forecastDate.getDate();
        
        // Si es un nuevo día y no es hoy
        if (forecastDay !== today && !dailyForecasts.some(f => new Date(f.dt * 1000).getDate() === forecastDay)) {
            dailyForecasts.push(forecastList[i]);
            
            // Limitar a 5 días
            if (dailyForecasts.length >= 5) break;
        }
    }
    
    return dailyForecasts;
}

// Función para guardar la última ciudad buscada
function saveLastCity(city) {
    localStorage.setItem('lastCity', city);
}

// Función para obtener la última ciudad buscada
function getLastCity() {
    return localStorage.getItem('lastCity');
}

export { formatDate, formatDay, filterDailyForecasts, saveLastCity, getLastCity };