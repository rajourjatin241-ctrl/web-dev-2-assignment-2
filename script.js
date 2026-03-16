const API_KEY = "0f957dc1df8afe17f385f698d92021ac";

let cityInput = document.querySelector("#cityInput");
let form = document.querySelector("form");
let weather = document.querySelector("#fetchData");
let searchedCities = document.querySelector(".searchedCities");
let consoleOutput = document.querySelector("#consoleOutput");

function log(message, type) {
    console.log(message);

    let entry = document.createElement("div");
    entry.classList.add("log", type || "sync");

    let dot = document.createElement("div");
    dot.classList.add("log-dot");

    let text = document.createElement("span");
    text.textContent = message;

    entry.appendChild(dot);
    entry.appendChild(text);
    consoleOutput.appendChild(entry);
}

function getHistory() {
    return JSON.parse(localStorage.getItem("cities")) || [];
}

function saveToHistory(cityName) {
    let history = getHistory();
    history = history.filter(c => c.toLowerCase() !== cityName.toLowerCase());
    history.unshift(cityName);
    if (history.length > 5) history = history.slice(0, 5);
    localStorage.setItem("cities", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    let history = getHistory();
    searchedCities.innerHTML = "";

    if (history.length === 0) {
        searchedCities.innerHTML = "<p>No recent searches.</p>";
        return;
    }

    history.forEach(function(city) {
        let chip = document.createElement("span");
        chip.textContent = city;
        chip.classList.add("chip");
        chip.addEventListener("click", function() {
            cityInput.value = city;
            getWeatherInfo(city);
        });
        searchedCities.appendChild(chip);
    });
}

async function getWeatherInfo(city) {

    consoleOutput.innerHTML = "";

    log("Sync Start", "sync");
    log("Sync End", "sync");

    if (!city || city.trim() === "") {
        weather.innerHTML = "<p class='error'>Please enter a city name.</p>";
        return;
    }

    weather.innerHTML = "<p>Loading...</p>";

    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    log("[ASYNC] Start fetching", "async");

    try {
        let response = await fetch(url);

        let data = await response.json().then(function(json) {
            log("Promise.then (Microtask)", "async");
            return json;
        });

        setTimeout(function() {
            log("setTimeout (Macrotask)", "macro");
        }, 0);

        if (!response.ok) {
            throw new Error(data.message);
        }

        log("[ASYNC] Data received", "async");

        weather.innerHTML = `
            <div class="weather-row"><span class="label">City</span><span class="value">${data.name}, ${data.sys.country}</span></div>
            <div class="weather-row"><span class="label">Temp</span><span class="value">${data.main.temp} °C</span></div>
            <div class="weather-row"><span class="label">Weather</span><span class="value">${data.weather[0].main}</span></div>
            <div class="weather-row"><span class="label">Humidity</span><span class="value">${data.main.humidity}%</span></div>
            <div class="weather-row"><span class="label">Wind</span><span class="value">${data.wind.speed} m/s</span></div>
        `;

        saveToHistory(data.name);

    } catch (error) {
        Promise.reject(error).catch(function(e) {
            log("[ERROR] " + e.message, "error");
        });

        weather.innerHTML = "<p class='error'>City not found</p>";

    } finally {
        console.log("[SYNC] finally block — cleanup done");
    }
}

form.addEventListener("submit", function(e) {
    e.preventDefault();
    getWeatherInfo(cityInput.value);
});

renderHistory();