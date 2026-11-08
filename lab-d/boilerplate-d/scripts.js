const API_KEY = 'f89d9f44fd4bf928fdc048ff00f4a28c';

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastSection = document.getElementById('forecast-section');
const forecastContainer = document.getElementById('forecast-container');

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert('Proszę podać nazwę miejscowości!');
    return;
  }

  fetchCurrentWeatherXHR(city);

  fetchForecastFetch(city);
});

function fetchCurrentWeatherXHR(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onload = function() {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);

      console.log('Odpowiedź Current Weather (XMLHttpRequest):', data);

      renderCurrentWeather(data);
    } else {
      console.error('Błąd pobierania bieżącej pogody:', xhr.statusText);
      alert('Nie znaleziono miejscowości lub błąd klucza API.');
    }
  };

  xhr.onerror = function() {
    console.error('Błąd sieciowy przy zapytaniu XHR.');
  };

  xhr.send();
}

function fetchForecastFetch(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Odpowiedź Forecast (Fetch API):', data);

      renderForecast(data);
    })
    .catch(error => {
      console.error('Błąd pobierania prognozy:', error);
    });
}

function renderCurrentWeather(data) {
  currentWeatherDiv.classList.remove('hidden');
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  currentWeatherDiv.innerHTML = `
    <h2>${data.name}, ${data.sys.country} (Bieżąca pogoda)</h2>
    <img src="${iconUrl}" alt="${data.weather[0].description}">
    <div class="temp-main">${Math.round(data.main.temp)}°C</div>
    <p>Odczuwalna: ${Math.round(data.main.feels_like)}°C</p>
    <p>Warunki: <strong>${data.weather[0].description}</strong></p>
    <p>Wilgotność: ${data.main.humidity}% | Ciśnienie: ${data.main.pressure} hPa</p>
  `;
}

function renderForecast(data) {
  forecastSection.classList.remove('hidden');
  forecastContainer.innerHTML = '';

  data.list.forEach(item => {
    const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
    const dateText = item.dt_txt;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'forecast-item';
    itemDiv.innerHTML = `
      <div class="date">${dateText.substring(5, 16)}</div>
      <img src="${iconUrl}" alt="${item.weather[0].description}">
      <div class="temp">${Math.round(item.main.temp)}°C</div>
      <div style="font-size:0.75rem; color:#555;">Odcz.: ${Math.round(item.main.feels_like)}°C</div>
      <div style="font-size:0.75rem;">${item.weather[0].description}</div>
    `;
    forecastContainer.appendChild(itemDiv);
  });
}
