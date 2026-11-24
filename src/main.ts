// =====================================================
// Väderkollen – hämta data från ett API och visa den
// =====================================================
// Flöde:  användaren söker stad
//      -> Geocoding API (stad -> lat/lon)
//      -> Current Weather API + Forecast API (lat/lon -> väder)
//      -> vi bygger HTML av JSON-svaret

import "./style.css";
import type { Coordinates, CurrentWeather, Forecast, GeoLocation } from "./types";

// ---------- STEG 4: Konstanter ----------
const API_KEY: string = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://api.openweathermap.org";
const SETTINGS = "units=metric&lang=sv"; // Celsius + svenska beskrivningar

// ---------- STEG 5: Hämta element från DOM:en ----------
// Generisk hjälpfunktion: kastar fel direkt om id:t saknas i HTML,
// och ger oss rätt typ (t.ex. HTMLInputElement) utan "!" överallt.
function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Hittade inget element med id="${id}"`);
  return el as T;
}

const form = $<HTMLFormElement>("search-form");
const cityInput = $<HTMLInputElement>("city-input");
const geoBtn = $<HTMLButtonElement>("geo-btn");
const statusEl = $<HTMLParagraphElement>("status");
const currentEl = $("current");
const forecastSection = $("forecast-section");
const forecastEl = $<HTMLDivElement>("forecast");
const iconEl = $<HTMLImageElement>("weather-icon");

// ---------- STEG 6: En återanvändbar, GENERISK fetch-funktion ----------
// <T> = "du talar om vilken typ svaret har när du anropar funktionen"
async function getJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);

  // fetch kastar INTE fel vid 401/404 – det måste vi kolla själva
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Ogiltig API-nyckel (nya nycklar kan ta upp till ett par timmar att aktiveras).");
    }
    throw new Error(`Något gick fel (HTTP ${response.status}).`);
  }

  return (await response.json()) as T;
}

// ---------- STEG 7: Stad -> koordinater (Geocoding API) ----------
async function getCoordinates(city: string): Promise<Coordinates> {
  const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
  const data = await getJSON<GeoLocation[]>(url);

  const first = data[0];
  if (!first) {
    throw new Error(`Hittade ingen stad som heter "${city}".`);
  }

  return { lat: first.lat, lon: first.lon };
}

// ---------- STEG 8: Koordinater -> väder ----------
async function loadWeather({ lat, lon }: Coordinates): Promise<void> {
  showStatus("Hämtar väder...");

  try {
    // Två anrop parallellt – TypeScript vet typen på båda!
    const [current, forecast] = await Promise.all([
      getJSON<CurrentWeather>(`${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&${SETTINGS}&appid=${API_KEY}`),
      getJSON<Forecast>(`${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&${SETTINGS}&appid=${API_KEY}`)
    ]);

    console.log("Aktuellt väder:", current); // Jämför med types.ts i F12
    console.log("Prognos:", forecast);

    renderCurrent(current);
    renderForecast(forecast);
    showStatus("");
  } catch (error) {
    showStatus(errorMessage(error), true);
  }
}

// ---------- STEG 9: Visa aktuellt väder ----------
function renderCurrent(data: CurrentWeather): void {
  const weather = data.weather[0]; // weather är en array

  setText("city-name", `${data.name}, ${data.sys.country}`);
  setText("date", new Date().toLocaleDateString("sv-SE", {
    weekday: "long", day: "numeric", month: "long"
  }));
  setText("temp", `${Math.round(data.main.temp)}°`);
  setText("description", weather.description);
  setText("feels-like", `Känns som ${Math.round(data.main.feels_like)}°`);

  iconEl.src = iconUrl(weather.icon);
  iconEl.alt = weather.description;

  setText("wind", `${data.wind.speed.toFixed(1)} m/s`);
  setText("humidity", `${data.main.humidity} %`);
  setText("pressure", `${data.main.pressure} hPa`);
  setText("visibility", `${(data.visibility / 1000).toFixed(1)} km`);
  setText("sunrise", formatTime(data.sys.sunrise, data.timezone));
  setText("sunset", formatTime(data.sys.sunset, data.timezone));

  currentEl.classList.remove("hidden");
}

// ---------- STEG 10: Visa prognosen ----------
// API:et ger 40 värden (var 3:e timme i 5 dygn).
// Enkel lösning: plocka bara värdet kl 12:00 (UTC) varje dag.
function renderForecast(data: Forecast): void {
  const middays = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  forecastEl.innerHTML = ""; // töm gamla kort

  middays.forEach(item => {
    const dayName = new Date(item.dt * 1000).toLocaleDateString("sv-SE", { weekday: "short" });
    const weather = item.weather[0];

    const div = document.createElement("div");
    div.className = "day";
    div.innerHTML = `
      <p class="day-name">${dayName}</p>
      <img src="${iconUrl(weather.icon)}" alt="${weather.description}">
      <p class="day-temp">${Math.round(item.main.temp)}°</p>
      <p class="day-desc">${weather.description}</p>
    `;
    forecastEl.appendChild(div);
  });

  forecastSection.classList.remove("hidden");
}

// ---------- Hjälpfunktioner ----------
function setText(id: string, text: string): void {
  $(id).textContent = text;
}

function iconUrl(code: string): string {
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

// Unix-tid (sekunder) + stadens tidszon (sekunder från UTC) -> "07:42"
function formatTime(unixSeconds: number, timezoneOffset: number): string {
  const date = new Date((unixSeconds + timezoneOffset) * 1000);
  return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

function showStatus(message: string, isError = false): void {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

// I en catch är felet av typen "unknown" – vi måste kolla vad det är
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Okänt fel.";
}

// ---------- STEG 11: Händelser ----------
form.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault(); // stoppa att sidan laddas om

  const city = cityInput.value.trim();
  if (!city) return;

  try {
    showStatus("Söker stad...");
    const coords = await getCoordinates(city);
    await loadWeather(coords);
  } catch (error) {
    showStatus(errorMessage(error), true);
  }
});

// Bonus: webbläsarens platstjänst
geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showStatus("Din webbläsare stödjer inte platstjänster.", true);
    return;
  }
  showStatus("Hämtar din plats...");
  navigator.geolocation.getCurrentPosition(
    (pos: GeolocationPosition) => loadWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
    () => showStatus("Kunde inte hämta din plats.", true)
  );
});

// ---------- Start ----------
if (!API_KEY) {
  showStatus("API-nyckel saknas – skapa .env.local med VITE_API_KEY=din_nyckel och starta om npm run dev.", true);
} else {
  loadWeather({ lat: 59.3293, lon: 18.0686 }); // Stockholm
}
