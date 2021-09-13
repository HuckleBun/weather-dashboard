var searchBtn = document.getElementById("submit");
var inputVal = document.getElementById("inputValue");
var ulEl = document.getElementById("recentSearch");
var cityNameEl = document.querySelector(".inputName");
var tempEl = document.querySelector(".inputTemp");
var windEl = document.querySelector(".inputWind");
var humidityEl = document.querySelector(".inputHumidity");
var indexEl = document.querySelector(".inputIndex");
var forecastResults = document.querySelector(".forecastResults");
var api_key = "8b0769860076b7ac68c5f1cb425ed25d";
var cityList;
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

if(localStorage.getItem("city")) {
    cityList = JSON.parse(localStorage.getItem("city"));
} else {
    cityList = [];
}

function recentSearch(city) {
    var liEl = document.createElement("li");
    var btnEl = document.createElement("button");
    btnEl.textContent = city
    btnEl.setAttribute("class", "recentBtn")
    btnEl.addEventListener("click", function(event) {
        fetchCoords(event.target.innerHTML)
    })
    liEl.appendChild(btnEl);
    ulEl.appendChild(liEl)
}

function saveToLocalStorage(city) {
    cityList.push(city)
    localStorage.setItem("city", JSON.stringify(cityList));
}

function appendList() {
    for(var i = 0; i < cityList.length; i++) {
        recentSearch(cityList[i]);
    }
}  

function currentWeather(city, weather, timezone) {
    console.log(city)
    var date = dayjs().tz(timezone).format('M/D/YYYY');

    var icon = document.createElement('img');
    var temperature = weather.temp
    var windSpeed = weather.wind_speed;
    var humidity = weather.humidity;
    var uvi = weather.uvi;
    var iconUrl = `http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`;
    var iconDescription = weather.weather[0].description || weather[0].main;

    cityNameEl.textContent = `${city} (${date})`;
    tempEl.textContent = `Temp: ${temperature}`;
    windEl.textContent = `Wind: ${windSpeed}`;
    humidityEl.textContent = `Humidity: ${humidity}%`;
    indexEl.textContent = `UV Index: ${uvi}`;
    icon.setAttribute('src', iconUrl);
    icon.setAttribute('alt', iconDescription);
    icon.setAttribute('class', 'weather-img');
    cityNameEl.append(icon)


}

function forecast(forecast, timezone) {
    var startDt = dayjs().tz(timezone).add(1, 'day').startOf('day').unix();
    var endDt = dayjs().tz(timezone).add(6, 'day').startOf('day').unix();
  
    for (var i = 0; i < forecast.length; i++) {
      if (forecast[i].dt >= startDt && forecast[i].dt < endDt) {
        forecastCard(forecast[i], timezone);
      }
    }
}

function forecastCard() {
    // ADD CODE HERE
}

function renderItems(city, data) {
    currentWeather(city, data.current, data.timezone);
    forecast(data.daily, data.timezone);
}  

function fetchWeather(location) {
    var { lat } = location;
    var { lon } = location;
    var city = location.name;
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${api_key}`;

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => renderItems(city, data));
}
    
function fetchCoords(search) {
    var apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search}&limit=5&appid=${api_key}`;

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            if (!data[0]) {
                alert('Location not found');
            } else {
                fetchWeather(data[0]);
            }
        })
        .catch(err => console.error(err));
}

function handleSearchFormSubmit(e) {
    if (!inputVal.value) {
      return;
    }
  
    e.preventDefault();
    var search = inputVal.value.trim();
    fetchCoords(search);
    recentSearch(search);
    saveToLocalStorage(search);
    inputVal.value = '';
}

searchBtn.addEventListener('click', handleSearchFormSubmit);
appendList();