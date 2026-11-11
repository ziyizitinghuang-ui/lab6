const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const statusText = document.getElementById("status");
const weatherInfo = document.getElementById("weather-info");
const cityName = document.getElementById("city-name");
const temperatureText = document.getElementById("temperature");
const weatherDescription = document.getElementById("weather-description");
const packedCombination = document.getElementById("packed-combination");
const packingList = document.getElementById("packing-list");
const button = form.querySelector("button");

const combinations = {
  hot: {
    image: "01_hot_weather.png",
    items: ["T-shirt", "Light Pants", "Cap", "Sunglasses"]
  },
  warm: {
    image: "02_warm_weather.png",
    items: ["Shirt", "Light Jacket", "Jeans"]
  },
  cool: {
    image: "03_cool_weather.png",
    items: ["Cardigan", "Jeans", "Scarf", "Beanie"]
  },
  cold: {
    image: "04_cold_weather.png",
    items: ["Puffer Jacket", "Sweater", "Scarf", "Beanie", "Gloves"]
  },
  mildRain: {
    image: "05_mild_rain.png",
    items: ["Rain Jacket", "Cardigan", "Jeans", "Umbrella"]
  },
  coldRain: {
    image: "06_cold_rain.png",
    items: ["Rain Jacket", "Cardigan", "Scarf", "Beanie", "Umbrella"]
  },
  snowy: {
    image: "07_snowy_weather.png",
    items: ["Puffer Jacket", "Cardigan", "Scarf", "Beanie", "Gloves"]
  },
  coolRain: {
    image: "08_cool_rain.png",
    items: ["Light Jacket", "Cardigan", "Jeans", "Umbrella"]
  },
  hotRain: {
    image: "09_hot_rain.png",
    items: ["T-shirt", "Light Pants", "Cap", "Sunglasses", "Umbrella"]
  },
  warmScarf: {
    image: "10_warm_with_scarf.png",
    items: ["Shirt", "Light Jacket", "Jeans", "Scarf"]
  },
  winterLayers: {
    image: "11_winter_layers.png",
    items: ["Puffer Jacket", "Cardigan", "Scarf", "Beanie", "Gloves"]
  },
  coolLayers: {
    image: "12_cool_layers.png",
    items: ["Rain Jacket", "Sweater", "Jeans", "Scarf", "Beanie"]
  }
};

function getWeatherDescription(code) {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Cloudy";
  if (code === 45 || code === 48) return "Foggy";

  if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82)
  ) {
    return "Rainy";
  }

  if (
    (code >= 71 && code <= 77) ||
    (code >= 85 && code <= 86)
  ) {
    return "Snowy";
  }

  if (code >= 95) return "Thunderstorm";

  return "Mixed Weather";
}

function getCombination(temp, code) {
  const rainy =
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99);

  const snowy =
    (code >= 71 && code <= 77) ||
    (code >= 85 && code <= 86);

  if (snowy) {
    return "snowy";
  }

  if (rainy) {
    if (temp >= 25) return "hotRain";
    if (temp >= 15) return "mildRain";
    if (temp >= 5) return "coolRain";
    return "coldRain";
  }

  if (temp >= 25) return "hot";

  if (temp >= 15) {
    if (temp < 18) return "warmScarf";
    return "warm";
  }

  if (temp >= 5) {
    if (temp < 8) return "coolLayers";
    return "cool";
  }

  if (temp < 0) return "winterLayers";

  return "cold";
}

function displayCombination(key) {
  const combination = combinations[key];

  packedCombination.classList.add("hidden");

  packedCombination.alt =
    "Packed suitcase with " + combination.items.join(", ");

  packedCombination.onload = function() {
    packedCombination.classList.remove("hidden");
  };

  packedCombination.onerror = function() {
    statusText.textContent = "Unable to load the packing image.";
  };

  packedCombination.src = "images/" + combination.image;

  if (
    packedCombination.complete &&
    packedCombination.naturalWidth > 0
  ) {
    packedCombination.classList.remove("hidden");
  }

  packingList.innerHTML = "";

  combination.items.forEach(function(item) {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    packingList.appendChild(listItem);
  });
}

async function getWeather(city) {
  const geoURL =
    "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(city) +
    "&count=1&language=en&format=json";

  const geoResponse = await fetch(geoURL);

  if (!geoResponse.ok) {
    throw new Error("Unable to find the city.");
  }

  const geoData = await geoResponse.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error("City not found. Please try another city.");
  }

  const location = geoData.results[0];

  const weatherURL =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    location.latitude +
    "&longitude=" +
    location.longitude +
    "&current=temperature_2m,weather_code&timezone=auto";

  const weatherResponse = await fetch(weatherURL);

  if (!weatherResponse.ok) {
    throw new Error("Unable to load the weather.");
  }

  const weatherData = await weatherResponse.json();

  if (!weatherData.current) {
    throw new Error("Weather information is unavailable.");
  }

  const temp = weatherData.current.temperature_2m;
  const code = weatherData.current.weather_code;

  cityName.textContent = location.name + ", " + location.country;
  temperatureText.textContent = Math.round(temp) + "°C";
  weatherDescription.textContent = getWeatherDescription(code);

  weatherInfo.classList.remove("hidden");

  const combinationKey = getCombination(temp, code);
  displayCombination(combinationKey);
}

form.addEventListener("submit", async function(event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") return;

  button.disabled = true;

  statusText.textContent =
    "Checking the weather and packing your bag...";

  weatherInfo.classList.add("hidden");
  packedCombination.classList.add("hidden");
  packingList.innerHTML = "";

  try {
    await getWeather(city);
    statusText.textContent = "Your suitcase is ready!";
  } catch (error) {
    statusText.textContent = error.message;
    packingList.innerHTML =
      "<li>Try searching for another city.</li>";
  } finally {
    button.disabled = false;
  }
});