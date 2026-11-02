# Weatherly – Real-Time Weather Dashboard

A responsive weather dashboard built with HTML, CSS and vanilla JavaScript. It uses the Fetch API, async/await and JSON to search for a city and display current weather plus a five-day forecast.

## Features
- Search weather by city name
- Current temperature and feels-like temperature
- Relative humidity, wind speed, precipitation and wind direction
- Five-day forecast
- Responsive layout for desktop and mobile
- Loading, empty-result, API and network error handling
- No API key required for the Open-Meteo free non-commercial API

## Project files
- `index.html` – page structure
- `style.css` – responsive styling
- `script.js` – API requests, JSON processing and rendering

## Run in Visual Studio Code
1. Extract the ZIP file.
2. Open the `Weather-Dashboard` folder in VS Code.
3. Install the **Live Server** extension (by Ritwick Dey), if it is not already installed.
4. Right-click `index.html`.
5. Select **Open with Live Server**.
6. Search for a city, such as Mumbai, Nashik, London or Tokyo.

You can also run the project with any local static web server. Avoid opening the HTML file directly with `file://` if browser restrictions interfere with requests.

## APIs used
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`

The geocoding request finds a city's coordinates. The forecast request uses those coordinates to retrieve current and daily weather data.

## Important
Open-Meteo's free API is intended for non-commercial use. Review the provider's terms and attribution requirements before public or commercial deployment.

Documentation: https://open-meteo.com/en/docs
