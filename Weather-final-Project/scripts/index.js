const OPEN_WEATHER = {
    API_KEY: "691ac0267ff69aea88b780e2223ae9f4",
    DOMAIN: "https://api.openweathermap.org",
  };
  
  const CURRENT_DATE = dayjs().format("DD/MM/YYYY");
  
  const LOCALE_STORAGE_KEY = "history";
  
  const DEFAULT_CITIES = [
    "London",
    "Birmingham",
    "Tokyo",
    "Paris",
    "New York",
    "Sydney",
    "Sofia",
    "Berlin",
    "Cairo",
    "Manchester",
    "Liverpool",
    "Dublin",
    "Bristol",
  ];
  
  const HISTORY_LENGTH_LIMIT = DEFAULT_CITIES.length;
  
  const HISTORY_SECTION_EL = $("#history");
  const TODAY_FORECAST_SECTION_EL = $("#today");
  const FORECAST_WEATHER_SECTION_EL = $("#forecast");
  const REFRESH_HISTORY_BTN = $("#refresh-history-btn");
  const CLEAR_HISTORY_BTN = $("#clear-history-btn");
  const SEARCH_FORM = $("#search-form");
  const SEARCH_INPUT = $("#search-input");
  const INVALID_CITY_NAME_MODAL = $("#invalid-city-name-modal");
  
  let history = [];
  let weather = {};
  
  /**
   * Generates a URL for retrieving geolocation data based on the provided city name.
   *
   * @param {string} cityName - The name of the city for which geolocation data is requested
   * @return {string} The URL for retrieving geolocation data
   */
  const getGeolocationDataUrl = (cityName) => {
    /**
     * The limit parameter is the maximum number of results to return,
     * it is set to 1 as we only need the geolocation data of the city.
     * @type {number}
     */
    let limit = 1;
  
    console.log("URL for geolocation data is set up successfully...");
    return `${OPEN_WEATHER.DOMAIN}/geo/1.0/direct?q=${cityName}&limit=${limit}&appid=${OPEN_WEATHER.API_KEY}`;
  };
  
  /**
   * Generates the URL for retrieving today's weather data based on the provided latitude and longitude.
   *
   * @param {number} lat - The latitude of the location.
   * @param {number} lon - The longitude of the location.
   * @return {string} The URL for retrieving today's weather data.
   */
  const getTodayWeatherDataUrl = (lat, lon) => {
    /**
     * The units parameter is the unit system of the data, it can be either "metric" or "imperial".
     * @type {string}
     */
    let units = "metric";
    /**
     * The lang parameter is the language of the data, it can be either "en", "ru", etc.
     * @type {string}
     */
    let lang = "en";
  
    console.log("URL for today's weather data is set up successfully...");
    return `${OPEN_WEATHER.DOMAIN}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${OPEN_WEATHER.API_KEY}`;
  };
  
  /**
   * Generates the URL for retrieving forecast weather data based on the provided latitude and longitude.
   *
   * @param {number} lat - The latitude of the location.
   * @param {number} lon - The longitude of the location.
   * @return {string} The URL for retrieving forecast weather data.
   */
  const getForecastWeatherDataURL = (lat, lon) => {
    /**
     * Units of measurement. standard, metric and imperial units are available. If you do not use the units parameter, standard units will be applied by default
     * @type {string}
     */
    let units = "metric";
    /**
     * You can use the lang parameter to get the output in your language.
     * @type {string}
     */
    let lang = "en";
  
    console.log("URL for forecast weather data is set up successfully...");
    return `${OPEN_WEATHER.DOMAIN}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${OPEN_WEATHER.API_KEY}`;
  };

  
  /**
   * Fetches geolocation data for a given city name.
   * @param {string} cityName - The name of the city to fetch geolocation data for.
   * @return {Object} The geolocation data object containing name, latitude, longitude, and countryCode code.
   */
  const getGeolocationData = async (cityName) => {
    try {
      let url = getGeolocationDataUrl(cityName);
  
      let response = await fetch(url);
  
      let data = await response.json();
  
      let geoData = {
        name: data[0].name,
        lat: data[0].lat,
        lon: data[0].lon,
        countryCode: data[0].country,
      };
  
      console.log("Geo data is fetched successfully...");
      return geoData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  /**
   * Fetches today's weather data based on the provided latitude and longitude.
   * @param {number} lat - The latitude coordinate
   * @param {number} lon - The longitude coordinate
   * @return {object} The weather information for today
   */
  const getTodayWeatherData = async (lat, lon) => {
    try {
      let url = getTodayWeatherDataUrl(lat, lon);
  
      let response = await fetch(url);
  
      let data = await response.json();
  
      let weatherInfo = {
        temp: data.main.temp,
        tempFeelsLike: data.main.feels_like,
        tempMin: data.main.temp_min,
        tempMax: data.main.temp_max,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        date: data.dt,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        description: data.weather[0].main,
        weatherIcon: data.weather[0].icon,
      };
  
      console.log("Today's weather data is fetched successfully...");
      return weatherInfo;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  /**
   * Retrieves the forecast weather data for a given latitude and longitude.
   * @param {number} lat - The latitude of the location.
   * @param {number} lon - The longitude of the location.
   * @return {Array} An array of weather data objects.
   */
  const getForecastWeatherData = async (lat, lon) => {
    try {
      let url = getForecastWeatherDataURL(lat, lon);
  
      let response = await fetch(url);
  
      let data = await response.json();
  
      let weatherDataList = [];
      let uniqueDates = new Set();
  
      data.list.forEach((day) => {
        let formattedDate = getFormattedTimestamp(day.dt, "date");
        if (!uniqueDates.has(formattedDate)) {
          let weatherData = {
            date: day.dt,
            temp: day.main.temp,
            tempFeelsLike: day.main.feels_like,
            tempMin: day.main.temp_min,
            tempMax: day.main.temp_max,
            pressure: day.main.pressure,
            humidity: day.main.humidity,
            windSpeed: day.wind.speed,
            description: day.weather[0].main,
            weatherIcon: day.weather[0].icon,
            wind: day.wind.speed,
          };
          weatherDataList.push(weatherData);
          uniqueDates.add(formattedDate);
        }
      });
  
      console.log(
        "🚀 ~ getForecastWeatherData ~ weatherDataList:",
        weatherDataList
      );
  
      console.log("Forecast weather data is fetched successfully...");
      return weatherDataList;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  /**
   * Loads the default history data for a given list of cities.
   * @param {Array} cities - An array of city names.
   * @return {Promise<Array>} A promise that resolves to an array of history data objects.
   */
  const loadDefaultHistory = async (cities) => {
    let history = await Promise.all(
      cities.map(async (city) => {
        let geoData = await getGeolocationData(city);
  
        let todayWeatherData = await getTodayWeatherData(
          geoData.lat,
          geoData.lon
        );
  
        let forecastWeatherData = await getForecastWeatherData(
          geoData.lat,
          geoData.lon
        );
  
        console.log(
          "History data is fetched successfully with default cities..."
        );
        return {
          geolocation: geoData,
          todayWeatherData: todayWeatherData,
          forecastWeatherData: forecastWeatherData,
        };
      })
    );
  
    return history;
  };
  
  /**
   * Checks if the specified key in local storage is empty or not, and logs the result.
   *
   * @param {string} key - The key to check in local storage
   * @return {boolean} true if the specified key is empty, false otherwise
   */
  const isLocaleStorageEmpty = (key) => {
    if (!localStorage.getItem(key)) {
      console.log("Locale storage IS EMPTY");
      return true;
    } else {
      console.log("Locale storage is NOT EMPTY");
      return false;
    }
  };
  
  /**
   * Saves the history to the local storage.
   * @param {string} key - The key to store the history under.
   * @param {any} value - The value to be stored in the local storage.
   * @return {void} This function does not return anything.
   */
  const saveHistoryToLocaleStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  
    console.log("History is saved successfully in locale storage...");
  };
  
  /**
   * Retrieves and returns the history data from local storage based on the provided key.
   * @param {string} key - The key used to fetch the history data from local storage.
   * @return {any} The history data fetched from local storage.
   */
  const getHistoryFromLocaleStorage = (key) => {
    let history = JSON.parse(localStorage.getItem(key));
  
    console.log("History is fetched successfully from locale storage...");
  
    return history;
  };
  
  /**
   * Updates the weather data by retrieving today's weather data and the forecast weather data
   * based on the provided geolocation data.
   * @param {Object} geoData - The geolocation data containing the latitude and longitude.
   * @return {Promise<Object>} A promise that resolves to an object containing the updated weather data.
   */
  const updateWeatherData = async (geoData) => {
    let todayWeatherData = await getTodayWeatherData(geoData.lat, geoData.lon);
  
    let forecastWeatherData = await getForecastWeatherData(
      geoData.lat,
      geoData.lon
    );
  
    let weatherData = {
      geolocation: geoData,
      todayWeatherData: todayWeatherData,
      forecastWeatherData: forecastWeatherData,
    };
  
    console.log("Weather data is updated successfully...");
    return weatherData;
  };
  
  /**
   * Renders the history section with buttons for each city in the history.
   * @param {Array} history - The array of city objects representing the search history
   * @return {void}
   */
  const renderHistorySection = (history) => {
    history.forEach((city) => {
      let historyBtn = $("<button>")
        .text(city.geolocation.name + ", " + city.geolocation.countryCode)
        .addClass("btn btn-light-primary btn-sm m-1 border");
  
      historyBtn.on("click", () => {
        handleSearch(city.geolocation.name);
      });
  
      HISTORY_SECTION_EL.append(historyBtn);
    });
  
    console.log("History section is rendered successfully...");
  };
  
  /**
   * Returns a formatted timestamp based on the given format.
   * @param {number} timestamp - The timestamp to format.
   * @param {string} format - The format to use for the timestamp. Valid values are "date", "time", and "weekday".
   * @return {string} The formatted timestamp.
   */
  const getFormattedTimestamp = (timestamp, format) => {
    switch (format) {
      case "date":
        return dayjs(timestamp * 1000).format("DD/MM/YYYY");
      case "date-time":
        return dayjs(timestamp * 1000).format("DD/MM/YYYY HH:mm");
      case "date-full-month-year":
        return dayjs(timestamp * 1000).format("DD MMM YYYY");
      case "time":
        return dayjs(timestamp * 1000).format("HH:mm");
      case "weekday":
        return dayjs(timestamp * 1000).format("dddd");
      case "weekday-short":
        return dayjs(timestamp * 1000).format("ddd");
      default:
        console.error("Invalid format");
        return;
    }
  };
  
  /**
   * Returns the URL of the weather icon based on the provided icon code.
   * @param {string} iconCode - The code representing the weather icon.
   * @return {string} The URL of the weather icon.
   */
  const getWeatherIconUrl = (iconCode) => {
    return `${OPEN_WEATHER.DOMAIN}/img/w/${iconCode}.png`;
  };
  
  /**
   * Creates a weather card for today's weather with the given information.
   * @param {string} cityName - The name of the city.
   * @param {string} date - The date of the weather.
   * @param {string} weekDay - The day of the week.
   * @param {string} iconUrl - The URL of the weather icon.
   * @param {string} sunrise - The time of sunrise.
   * @param {string} sunset - The time of sunset.
   * @param {number} temp - The temperature in Celsius.
   * @param {number} humidity - The humidity in percentage.
   * @param {number} pressure - The pressure in hectopascals.
   * @param {number} windSpeed - The wind speed in kilometers per hour.
   * @param {string} description - The description of the weather.
   * @param {number} tempMin - The minimum temperature in Celsius.
   * @param {number} tempMax - The maximum temperature in Celsius.
   * @param {number} feelsLike - The "feels like" temperature in Celsius.
   * @return {string} The HTML code for the weather card.
   */
  const createTodayWeatherCard = (
    cityName,
    date,
    weekDay,
    iconUrl,
    sunrise,
    sunset,
    temp,
    humidity,
    pressure,
    windSpeed,
    description,
    tempMin,
    tempMax,
    feelsLike
  ) => {
    let backgroundImgURL = "assets/day-night-bg.jpg";
  
    return `<div class="container-fluid">
      <div class="row">
        <div class="col">
          <div class="card">
            <div class="card-header bg-primary text-white">
            <h5 class="card-title d-flex justify-content-between align-items-center">
            <span>
              ${cityName} <img src=${iconUrl} alt="Weather Icon">
            </span>
            <span>${date} ${weekDay}</span>
          </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <p class="card-text">
                    <span id="temperature">
                      <i class="fas fa-temperature-high"></i>
                      <span id="humidity-label" class="d-inline-block">Temp</span>
                      ${temp} °C
                    </span>
                  </p>
                  <p class="card-text">
                    <span id="feels-like">
                      <i class="fas fa-thermometer"></i>
                      <span id="humidity-label" class="d-inline-block">Feels</span>
                      ${feelsLike} °C
                    </span>
                  </p>
                  <p class="card-text">
                    <span id="min-temperature">
                    <i class="fas fa-arrow-down"></i>
                      <span id="humidity-label" class="d-inline-block">Min</span>
                      ${tempMin} °C
                    </span>
                  </p>
                  <p class="card-text">
                    <span id="max-temperature">
                    <i class="fas fa-arrow-up"></i>
                      <span id="humidity-label" class="d-inline-block">Max</span>
                      ${tempMax} °C
                    </span>
                  </p>
                </div>
                <div class="col-md-3">
                  <p class="card-text">
                    <span id="humidity">
                      <i class="fas fa-tint"></i>
                      <span id="humidity-label" class="d-inline-block">Humidity</span>
                      ${humidity} %
                    </span>
                  </p>
                  <p class="card-text">
                    <span id="pressure">
                      <i class="fas fa-tachometer-alt"></i>
                      <span id="humidity-label" class="d-inline-block">Pressure</span>
                      ${pressure} hPa
                    </span>
                  </p>
                  <p class="card-text">
                    <span id="wind-speed">
                      <i class="fas fa-wind"></i>
                      <span id="humidity-label" class="d-inline-block">Wind</span>
                      ${windSpeed} KPH
                    </span>
                  </p>
                  <p class="card-text">
                    <i class="fas fa-info-circle"></i>
                    <span id="description">Description</span>
                    ${description}
                  </p>
                </div>
                <div class="col-md-6 d-flex flex-column justify-content-between position-relative" style="background-image: url(${backgroundImgURL}); background-size: cover; background-position: center; border-radius: 10px; overflow: hidden; box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);">
                  <div class="sunrise-container d-flex align-items-center justify-content-start" style="position: absolute; bottom: 0; left: 10px;">
                  <i class="fas fa-sun"></i>
                    <p class="card-text">${sunrise}</p>
                  </div>
                  <div class="sunset-container d-flex align-items-center justify-content-end text-white" style="position: absolute; bottom: 0; right: 10px;">
                  <i class="fas fa-moon"></i>
                    <p class="card-text">${sunset}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  };
  
  /**
   * Renders the today's weather section using the provided weather and geographical data.
   * @param {object} weatherData - the weather data to render
   * @param {object} geoData - the geographical data to render
   */
  const renderTodayWeatherSection = (weatherData, geoData) => {
    let card = createTodayWeatherCard(
      geoData.name,
      getFormattedTimestamp(weatherData.date, "date-full-month-year"),
      getFormattedTimestamp(weatherData.date, "weekday"),
      getWeatherIconUrl(weatherData.weatherIcon),
      getFormattedTimestamp(weatherData.sunrise, "time"),
      getFormattedTimestamp(weatherData.sunset, "time"),
      weatherData.temp,
      weatherData.humidity,
      weatherData.pressure,
      weatherData.windSpeed,
      weatherData.description,
      weatherData.tempMin,
      weatherData.tempMax,
      weatherData.tempFeelsLike
    );
  
    TODAY_FORECAST_SECTION_EL.empty();
  
    TODAY_FORECAST_SECTION_EL.append(card);
  
    console.log("Today weather section is rendered successfully...");
  };
  
  /**
   * Generates a forecast weather card HTML string based on the provided weather data.
   * @param {Object} weatherData - The weather data object containing the following properties:
   *   - date: The date of the forecast (string).
   *   - weekday: The weekday of the forecast (string).
   *   - weatherIcon: The icon representing the weather (string).
   *   - temp: The temperature in Celsius (number).
   *   - tempFeelsLike: The "feels like" temperature in Celsius (number).
   *   - tempMin: The minimum temperature in Celsius (number).
   *   - tempMax: The maximum temperature in Celsius (number).
   *   - humidity: The humidity percentage (number).
   *   - pressure: The pressure in hectopascals (number).
   *   - windSpeed: The wind speed in kilometers per hour (number).
   *   - description: The description of the weather (string).
   * @return {string} The forecast weather card HTML string.
   */
  const createForecastWeatherCard = (weatherData) => {
    let date = getFormattedTimestamp(weatherData.date, "date-full-month-year");
    let weekday = getFormattedTimestamp(weatherData.date, "weekday-short");
    let weatherIconUrl = getWeatherIconUrl(weatherData.weatherIcon);
  
    let forecastWeatherCard = `
    <div class="col-md-4">
      <div class="card m-3">
        <div class="card-header bg-primary text-white">
          <h5 class="card-title">
            ${date} ${weekday}
            <img src=${weatherIconUrl} alt="Weather Icon">
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p class="card-text">
                <span id="temperature">
                <i class="fa-solid fa-temperature-high"></i>
                ${weatherData.temp} °C
                </span>
              </p>
              <p class="card-text">
                <span id="feels-like">
                <i class="fa-solid fa-thermometer"></i> 
                ${weatherData.tempFeelsLike} °C 
                </span>
              </p>
              <p class="card-text">
                <span id="min-temperature">
                <i class="fas fa-arrow-down"></i>
                ${weatherData.tempMin}°C 
                </span>
              </p>
              <p class="card-text">
                <span id="max-temperature">
                <i class="fas fa-arrow-up"></i>
                ${weatherData.tempMax}°C
                </span>
              </p>
            </div>
            <div class="col-md-6">
              <p class="card-text">
                <span id="humidity">
                <i class="fas fa-tint"></i>
                ${weatherData.humidity}%
                </span>
              </p>
              <p class="card-text">
                <span id="pressure">
                <i class="fas fa-tachometer-alt"></i>
                ${weatherData.pressure}hPa 
                </span>
              </p>
              <p class="card-text">
                <span id="wind-speed">
                <i class="fas fa-wind"></i>
                ${weatherData.windSpeed}KPH
                </span>
              </p>
              <p class="card-text">
                <span id="description">
                <i class="fas fa-info-circle"></i>
                ${weatherData.description}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  
    return forecastWeatherCard;
  };

 
  
  /**
   * Renders the forecast weather section with the provided forecast data.
   * @param {Array} forecastData - An array of weather data objects representing the forecast.
   * @return {void} This function does not return a value.
   */
  const renderForecastWeatherSection = (forecastData) => {
    FORECAST_WEATHER_SECTION_EL.empty();
  
    forecastData.map((weatherData) => {
      let card = createForecastWeatherCard(weatherData);
  
      FORECAST_WEATHER_SECTION_EL.append(card);
    });
  
    console.log("Forecast weather section is rendered successfully...");
  };
  
  const getCityNameIndexFromHistory = (cityName) => {
    return history.findIndex((city) => city.geolocation.name === cityName);
  };
  
  const isCityNameExistInHistory = (cityName) => {
    return history.some((city) => city.geolocation.name === cityName);
  };
  
  const handleSearch = async (cityName) => {
    let geoData = await getGeolocationData(cityName);
  
    let todayWeather = await getTodayWeatherData(geoData.lat, geoData.lon);
  
    let forecastWeather = await getForecastWeatherData(geoData.lat, geoData.lon);
  
    let tempHistory = history;
  
    if (isCityNameExistInHistory(cityName)) {
      let index = getCityNameIndexFromHistory(cityName);
  
      tempHistory.splice(index, 1);
  
      tempHistory.unshift({
        geolocation: geoData,
        todayWeatherData: todayWeather,
        forecastWeatherData: forecastWeather,
      });
    } else {
      tempHistory.unshift({
        geolocation: geoData,
        todayWeatherData: todayWeather,
        forecastWeatherData: forecastWeather,
      });
    }
  
    if (tempHistory.length > HISTORY_LENGTH_LIMIT) {
      tempHistory.pop();
    }
  
    history = [];
    history = tempHistory;
  
    saveHistoryToLocaleStorage(LOCALE_STORAGE_KEY, history);
  
    HISTORY_SECTION_EL.empty();
  
    renderHistorySection(history);
  
    renderTodayWeatherSection(
      history[0].todayWeatherData,
      history[0].geolocation
    );
  
    renderForecastWeatherSection(history[0].forecastWeatherData);
  };
  
  $(document).ready(async () => {
    console.log("jQuery is ready...");
  
    if (isLocaleStorageEmpty(LOCALE_STORAGE_KEY)) {
      try {
        history = await loadDefaultHistory(DEFAULT_CITIES);
        saveHistoryToLocaleStorage(LOCALE_STORAGE_KEY, history);
      } catch (error) {
        console.error("Error loading history data:", error);
      }
    } else {
      history = getHistoryFromLocaleStorage(LOCALE_STORAGE_KEY);
    }
  
    try {
      weather = await updateWeatherData(history[0].geolocation);
    } catch (error) {
      console.error("Error updating weather data:", error);
    }
  
    console.log(weather);
    console.log(history);
  
    renderHistorySection(history);
    renderTodayWeatherSection(weather.todayWeatherData, weather.geolocation);
    renderForecastWeatherSection(weather.forecastWeatherData);
  
    REFRESH_HISTORY_BTN.on("click", (event) => {
      event.preventDefault();
      history.forEach(async (city, i) => {
        history[i].weatherData = await updateWeatherData(city.geolocation);
      });
  
      saveHistoryToLocaleStorage(LOCALE_STORAGE_KEY, history);
  
      console.log("History is refreshed successfully...");
    });
  
    CLEAR_HISTORY_BTN.on("click", (event) => {
      event.preventDefault();
      history = [];
  
      localStorage.removeItem(LOCALE_STORAGE_KEY);
  
      HISTORY_SECTION_EL.empty();
  
      HISTORY_SECTION_EL.append(
        `<p class="text-center text-muted">No search history yet.</p>`
      );
    });
  
    //TODO: Im here with the refactoring
    SEARCH_FORM.on("submit", (event) => {
      event.preventDefault();
  
      let cityNameRegex = /^[a-zA-Z\s]+$/;
      let cityName = SEARCH_INPUT.val().trim();
  
      if (!cityName || !cityNameRegex.test(cityName)) {
        INVALID_CITY_NAME_MODAL.modal("show");
        return;
      }
  
      handleSearch(cityName);
    });
  });