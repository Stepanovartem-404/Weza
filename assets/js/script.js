document.addEventListener("DOMContentLoaded", () => {
    const apiKey = '35cddef8235bf0e8f8367a0d854b1ecf';
    const defaultLocation = [50.4501, 30.5234]; // Coordinates of Kyiv for example

    const map = L.map('map').setView(defaultLocation, 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false
    })
    .on('markgeocode', function(e) {
        const latlng = e.geocode.center;
        map.setView(latlng, 10);
        fetchWeatherData(latlng.lat, latlng.lng);
    })
    .addTo(map);

    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 10);
            fetchWeatherData(latitude, longitude);
        }, () => {
            // Use default location if user denies permission
            fetchWeatherData(defaultLocation[0], defaultLocation[1]);
        });
    } else {
        // Use default location if geolocation is not supported
        fetchWeatherData(defaultLocation[0], defaultLocation[1]);
    }

    function updateWeatherInfo(weatherData) {
        const weatherInfo = document.getElementById('weather-info');
        const weatherIcon = document.getElementById('weather-icon');
        const loading = document.getElementById('loading');

        weatherInfo.innerHTML = `
            <p>Temperature: ${weatherData.main.temp}°C</p>
            <p>Weather: ${weatherData.weather[0].description}</p>
            <p>Humidity: ${weatherData.main.humidity}%</p>
            <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
        `;

        let iconUrl = '';
        switch (weatherData.weather[0].main.toLowerCase()) {
            case 'clear':
                iconUrl = 'assets/img/sunny.png';
                break;
            case 'clouds':
                iconUrl = 'assets/img/cloudy.png';
                break;
            case 'rain':
                iconUrl = 'assets/img/rainy.png';
                break;
            default:
                iconUrl = '';
        }

        if (iconUrl) {
            weatherIcon.src = iconUrl;
            weatherIcon.style.display = 'block';
        } else {
            weatherIcon.style.display = 'none';
        }

        loading.style.display = 'none';
    }

    function fetchWeatherData(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    updateWeatherInfo(data);
                } else {
                    throw new Error('Failed to load weather data.');
                }
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                document.getElementById('loading').textContent = 'Failed to load weather data.';
            });
    }
});
