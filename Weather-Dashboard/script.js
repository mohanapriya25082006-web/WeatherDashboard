const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const searchButton = document.querySelector("#searchButton");
const statusMessage = document.querySelector("#statusMessage");
const weatherContent = document.querySelector("#weatherContent");

const weatherDescriptions = {
  0: ["Clear sky", "☀️", "🌙"],
  1: ["Mainly clear", "🌤️", "🌙"],
  2: ["Partly cloudy", "⛅", "☁️"],
  3: ["Overcast", "☁️", "☁️"],
  45: ["Fog", "🌫️", "🌫️"],
  48: ["Depositing rime fog", "🌫️", "🌫️"],
  51: ["Light drizzle", "🌦️", "🌧️"],
  53: ["Moderate drizzle", "🌦️", "🌧️"],
  55: ["Dense drizzle", "🌧️", "🌧️"],
  56: ["Light freezing drizzle", "🌧️", "🌧️"],
  57: ["Dense freezing drizzle", "🌧️", "🌧️"],
  61: ["Slight rain", "🌦️", "🌧️"],
  63: ["Moderate rain", "🌧️", "🌧️"],
  65: ["Heavy rain", "🌧️", "🌧️"],
  66: ["Light freezing rain", "🌧️", "🌧️"],
  67: ["Heavy freezing rain", "🌧️", "🌧️"],
  71: ["Slight snow", "🌨️", "🌨️"],
  73: ["Moderate snow", "🌨️", "🌨️"],
  75: ["Heavy snow", "❄️", "❄️"],
  77: ["Snow grains", "🌨️", "🌨️"],
  80: ["Slight rain showers", "🌦️", "🌧️"],
  81: ["Moderate rain showers", "🌧️", "🌧️"],
  82: ["Violent rain showers", "⛈️", "⛈️"],
  85: ["Slight snow showers", "🌨️", "🌨️"],
  86: ["Heavy snow showers", "❄️", "❄️"],
  95: ["Thunderstorm", "⛈️", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️", "⛈️"],
  99: ["Thunderstorm with heavy hail", "⛈️", "⛈️"]
};

function getWeatherInfo(code, isDay = 1) {
  const info = weatherDescriptions[code] || ["Weather conditions unavailable", "🌡️", "🌡️"];
  return { description: info[0], icon: isDay ? info[1] : info[2] };
}

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`.trim();
}

function displayValue(value, digits = 0) {
  return Number.isFinite(value) ? Number(value).toFixed(digits) : "--";
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`The weather service returned an error (${response.status}). Please try again.`);
  }

  const data = await response.json();

  // Some APIs return an error object even when the HTTP response succeeds.
  if (data.error) {
    throw new Error(data.reason || "The weather service could not process this request.");
  }

  return data;
}

async function searchCity(cityName) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name: cityName,
    count: "1",
    language: "en",
    format: "json"
  });

  const data = await getJson(url);

  if (!data.results || data.results.length === 0) {
    throw new Error(`We couldn't find "${cityName}". Check the spelling or try another city.`);
  }

  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m"
    ].join(","),
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    timezone: "auto",
    forecast_days: "5"
  });

  return getJson(url);
}

function renderForecast(daily) {
  const forecastGrid = document.querySelector("#forecastGrid");
  forecastGrid.replaceChildren();

  daily.time.forEach((dateString, index) => {
    const date = new Date(`${dateString}T12:00:00`);
    const dayLabel = index === 0
      ? "Today"
      : date.toLocaleDateString(undefined, { weekday: "short" });

    const info = getWeatherInfo(daily.weather_code[index], 1);
    const card = document.createElement("article");
    card.className = "forecast-card";

    const day = document.createElement("p");
    day.className = "forecast-day";
    day.textContent = dayLabel;

    const icon = document.createElement("div");
    icon.className = "forecast-icon";
    icon.textContent = info.icon;
    icon.setAttribute("aria-hidden", "true");

    const description = document.createElement("p");
    description.className = "forecast-desc";
    description.textContent = info.description;

    const temperatures = document.createElement("p");
    temperatures.className = "forecast-temps";
    temperatures.textContent = `${displayValue(daily.temperature_2m_max[index])}°`;

    const low = document.createElement("span");
    low.textContent = `${displayValue(daily.temperature_2m_min[index])}°`;
    temperatures.append(low);

    card.append(day, icon, description, temperatures);
    forecastGrid.append(card);
  });
}

function renderWeather(place, data) {
  const current = data.current;
  const info = getWeatherInfo(current.weather_code, current.is_day);

  const placeParts = [place.name, place.admin1, place.country].filter(Boolean);
  document.querySelector("#locationName").textContent = [...new Set(placeParts)].join(", ");
  document.querySelector("#currentDate").textContent =
    new Date(current.time).toLocaleString(undefined, {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
    });

  document.querySelector("#timezoneLabel").textContent = data.timezone || "Local time";
  document.querySelector("#temperature").textContent = displayValue(current.temperature_2m);
  document.querySelector("#weatherDescription").textContent = info.description;
  document.querySelector("#weatherIcon").textContent = info.icon;
  document.querySelector("#feelsLike").textContent = `${displayValue(current.apparent_temperature)}°C`;
  document.querySelector("#humidity").textContent = displayValue(current.relative_humidity_2m);
  document.querySelector("#windSpeed").textContent = displayValue(current.wind_speed_10m, 1);
  document.querySelector("#precipitation").textContent = displayValue(current.precipitation, 1);
  document.querySelector("#windDirection").textContent = displayValue(current.wind_direction_10m);
  document.querySelector("#dayNightLabel").textContent = current.is_day ? "☀ Daytime" : "☾ Nighttime";

  renderForecast(data.daily);
  weatherContent.hidden = false;
}

async function handleSearch(event) {
  event.preventDefault();

  const cityName = cityInput.value.trim();
  if (!cityName) {
    showStatus("Please enter a city name.", "error");
    cityInput.focus();
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "Searching…";
  showStatus(`Finding weather for ${cityName}…`);
  weatherContent.hidden = true;

  try {
    // First request: convert the city name into latitude and longitude.
    const place = await searchCity(cityName);

    // Second request: use those coordinates to retrieve weather JSON.
    const weatherData = await getWeather(place.latitude, place.longitude);

    // Render the nested current and daily JSON objects on the page.
    renderWeather(place, weatherData);
    showStatus(`Weather loaded for ${place.name}.`, "success");
  } catch (error) {
    console.error("Weather dashboard error:", error);
    showStatus(error.message || "Something went wrong. Check your connection and try again.", "error");
  } finally {
    searchButton.disabled = false;
    searchButton.innerHTML = 'Search <span aria-hidden="true">→</span>';
  }
}

searchForm.addEventListener("submit", handleSearch);
