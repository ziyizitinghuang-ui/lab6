const form = document.querySelector("#search-form");
const input = document.querySelector("#artist-input");
const container = document.querySelector("#album-container");
const statusText = document.querySelector("#status");

async function getAlbums(artist) {
  const query = encodeURIComponent(
    `artist:"${artist}" AND primarytype:album`
  );

  const url = `https://musicbrainz.org/ws/2/release-group/?query=${query}&fmt=json&limit=12`;

  statusText.textContent = "Searching...";
  container.innerHTML = "";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();
    const albums = data["release-groups"];

    if (albums.length === 0) {
      statusText.textContent = "No albums found.";
      return;
    }

    statusText.textContent = `Showing albums by ${artist}`;

    albums.forEach(album => {
      const card = document.createElement("div");
      card.className = "album-card";

      const vinyl = document.createElement("div");
      vinyl.className = "vinyl";

      const title = document.createElement("h3");
      title.textContent = album.title;

      const year = document.createElement("p");
      year.textContent = album["first-release-date"]?.slice(0, 4) || "Unknown year";

      card.appendChild(vinyl);
      card.appendChild(title);
      card.appendChild(year);

      container.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    statusText.textContent = "Something went wrong. Please try again.";
  }
}

form.addEventListener("submit", function(event) {
  event.preventDefault();
  getAlbums(input.value.trim());
});