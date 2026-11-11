
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const statusText = document.getElementById("status");
const weatherInfo = document.getElementById("weather-info");
const cityName = document.getElementById("city-name");
const temperatureText = document.getElementById("temperature");
const weatherDescription = document.getElementById("weather-description");
const packedItems = document.getElementById("packed-items");
const packingList = document.getElementById("packing-list");
const button = form.querySelector("button");

const items = {
  tshirt: {
    name: "T-shirt",
    image: "tshirt.png",
    width: 48
  },
  jacket: {
    name: "Light Jacket",
    image: "jacket.png",
    width: 52
  },
  shirt: {
    name: "Shirt",
    image: "shirt.png",
    width: 47
  },
  scarf: {
    name: "Scarf",
    image: "scarf.png",
    width: 30
  },
  puffer: {
    name: "Puffer Jacket",
    image: "puffer-jacket.png",
    width: 55
  },
  cardigan: {
    name: "Cardigan",
    image: "cardigan.png",
    width: 52
  },
  jeans: {
    name: "Jeans",
    image: "jeans.png",
    width: 48
  },
  beanie: {
    name: "Beanie",
    image: "beanie.png",
    width: 28
  },
  cap: {
    name: "Cap",
    image: "cap.png",
    width: 29
  },
  gloves: {
    name: "Gloves",
    image: "gloves.png",
    width: 27
  },
  pants: {
    name: "Pants",
    image: "pants.png",
    width: 47
  },
  umbrella: {
    name: "Umbrella",
    image: "umbrella.png",
    width: 23
  },
  sunglasses: {
    name: "Sunglasses",
    image: "sunglasses.png",
    width: 26
  }
};

const layouts = {
  3: [
    { x: 29, y: 31 },
    { x: 72, y: 31 },
    { x: 50, y: 74 }
  ],
  4: [
    { x: 28, y: 30 },
    { x: 73, y: 30 },
    { x: 28, y: 74 },
    { x: 73, y: 74 }
  ],
  5: [
    { x: 28, y: 28 },
    { x: 73, y: 28 },
    { x: 24, y: 75 },
    { x: 52, y: 75 },
    { x: 79, y: 75 }
  ],
  6: [
    { x: 25, y: 27 },
    { x: 72, y: 27 },
    { x: 23, y: 75 },
    { x: 51, y: 75 },
    { x: 78, y: 75 },
    { x: 51, y: 48 }
  ]
};

function getWeatherDescription(code) {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Rainy";
  if (code >= 85 && code <= 86) return "Snowy";
  if (code >= 95) return "Thunderstorm";
  return "Mixed Weather";
}

function getPackingItems(temp, code) {
  let selected = [];

  if (temp >= 25) {
    selected = ["tshirt", "pants", "cap", "sunglasses"];
  } else if (temp >= 15) {
    selected = ["shirt", "jacket", "jeans"];
  } else if (temp >= 5) {
    selected = ["cardigan", "jeans", "scarf", "beanie"];
  } else {
    selected = ["puffer", "cardigan", "pants", "beanie", "gloves"];
  }

  const rainy =
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99);

  const snowy =
    (code >= 71 && code <= 77) ||
    (code >= 85 && code <= 86);

  if (rainy) {
    selected.push("umbrella");
  }

  if (snowy && !selected.includes("gloves")) {
    selected.push("gloves");
  }

  if (snowy && !selected.includes("beanie")) {
    selected.push("beanie");
  }

  return selected;
}

function positionImage(image, item, position) {
  const areaWidth = packedItems.clientWidth;
  const areaHeight = packedItems.clientHeight;

  if (!areaWidth || !areaHeight) return;

  const ratio = image.naturalWidth / image.naturalHeight;

  let width = areaWidth * item.width / 100;
  let height = width / ratio;

  const maxHeight = areaHeight * 0.54;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  const margin = 3;
  const maxWidth = areaWidth - margin * 2;
  const maxTotalHeight = areaHeight - margin * 2;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / ratio;
  }

  if (height > maxTotalHeight) {
    height = maxTotalHeight;
    width = height * ratio;
  }

  let x = areaWidth * position.x / 100;
  let y = areaHeight * position.y / 100;

  x = Math.max(width / 2 + margin,
    Math.min(areaWidth - width / 2 - margin, x));

  y = Math.max(height / 2 + margin,
    Math.min(areaHeight - height / 2 - margin, y));

  image.style.width = width + "px";
  image.style.left = x + "px";
  image.style.top = y + "px";
}

function displayPackingList(selected) {
  packedItems.innerHTML = "";
  packingList.innerHTML = "";

  const layout = layouts[selected.length] || layouts[6];

  selected.forEach(function(key, index) {
    const item = items[key];
    const position = layout[index];

    if (!position) return;

    const image = document.createElement("img");
    image.src = "images/" + item.image;
    image.alt = item.name;
    image.className = "packed-item";
    image.style.animationDelay = index * 0.12 + "s";

    image.addEventListener("load", function() {
      positionImage(image, item, position);
    });

    packedItems.appendChild(image);

    if (image.complete && image.naturalWidth > 0) {
      positionImage(image, item, position);
    }

    const listItem = document.createElement("li");
    listItem.textContent = item.name;
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

  const selected = getPackingItems(temp, code);
  displayPackingList(selected);
}

form.addEventListener("submit", async function(event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") return;

  button.disabled = true;
  statusText.textContent = "Checking the weather and packing your bag...";
  weatherInfo.classList.add("hidden");
  packedItems.innerHTML = "";
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

window.addEventListener("resize", function() {
  const images = packedItems.querySelectorAll(".packed-item");
  const layout = layouts[images.length] || layouts[6];

  images.forEach(function(image, index) {
    const key = Object.keys(items).find(function(itemKey) {
      return items[itemKey].name === image.alt;
    });

    if (key && layout[index] && image.naturalWidth > 0) {
      positionImage(image, items[key], layout[index]);
    }
  });
});
