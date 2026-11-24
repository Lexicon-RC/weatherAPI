// =====================================================
// Väderkollen: hämta väder från ett API och visa det
// =====================================================
// 1. Användaren skriver en stad och trycker Sök
// 2. Vi frågar API:et om vädret i den staden
// 3. Vi visar svaret på sidan

import "./style.css";
import type { Vader } from "./types";

// ---------- STEG 1: Inställningar ----------
const API_NYCKEL = import.meta.env.VITE_API_KEY;

// true = sidan använder exempel.json i stället för det riktiga API:et.
// Bra när man bygger sidan, eller om nyckeln inte fungerar än.
const ANVAND_EXEMPEL = false;

// ---------- STEG 2: Hämta elementen från HTML ----------
// "!" betyder: "Jag lovar att elementet finns i HTML."
const formular = document.querySelector<HTMLFormElement>("#sok-formular")!;
const stadInput = document.querySelector<HTMLInputElement>("#stad-input")!;
const meddelande = document.querySelector<HTMLParagraphElement>("#meddelande")!;
const vaderKort = document.querySelector<HTMLElement>("#vader-kort")!;
const ikon = document.querySelector<HTMLImageElement>("#ikon")!;

// ---------- STEG 3: Fråga API:et ----------
async function hamtaVader(stad: string): Promise<Vader> {
  const url = ANVAND_EXEMPEL
    ? "/exempel.json"
    : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(stad)}&units=metric&lang=sv&appid=${API_NYCKEL}`;

  const svar = await fetch(url);

  // Vi testade felen i webbläsaren innan vi kodade.
  // Därför vet vi vilka siffror (statuskoder) API:et skickar när något går fel.
  if (svar.status === 401) {
    throw new Error("API-nyckeln fungerar inte. Nya nycklar kan ta ett par timmar att bli aktiva.");
  }
  if (svar.status === 404) {
    throw new Error(`Hittade ingen stad som heter "${stad}". Kolla stavningen.`);
  }
  if (!svar.ok) {
    throw new Error("Något gick fel. Försök igen om en stund.");
  }

  return await svar.json();
}

// ---------- STEG 4: Visa vädret på sidan ----------
function visaVader(vader: Vader): void {
  const vaderInfo = vader.weather[0];   // weather är en lista, vi tar första

  skrivText("#stad-namn", vader.name);
  skrivText("#temp", `${Math.round(vader.main.temp)} °C`);
  skrivText("#beskrivning", vaderInfo.description);
  skrivText("#kanns-som", `${Math.round(vader.main.feels_like)} °C`);
  skrivText("#vind", `${Math.round(vader.wind.speed)} m/s`);
  skrivText("#fukt", `${vader.main.humidity} %`);

  ikon.src = `https://openweathermap.org/img/wn/${vaderInfo.icon}@2x.png`;

  vaderKort.hidden = false;   // visa kortet
}

// ---------- Hjälpfunktioner ----------
function skrivText(selector: string, text: string): void {
  document.querySelector(selector)!.textContent = text;
}

// TILLGÄNGLIGHET: vi skriver "Fel:" i texten. Då förstår man att det är ett fel
// även om man inte ser den röda färgen.
function visaMeddelande(text: string, arFel = false): void {
  meddelande.textContent = arFel ? `Fel: ${text}` : text;
  meddelande.classList.toggle("fel", arFel);
}

// ---------- STEG 5: Gör något när man trycker Sök ----------
async function sok(stad: string): Promise<void> {
  visaMeddelande("Hämtar väder...");

  try {
    const vader = await hamtaVader(stad);
    console.log("Svar från API:et:", vader);   // titta i F12 → Console
    visaVader(vader);
    visaMeddelande(`Vädret i ${vader.name} är hämtat.`);   // läses upp av skärmläsare
  } catch (error) {
    const text = error instanceof Error ? error.message : "Okänt fel.";
    visaMeddelande(text, true);
    stadInput.focus();   // TILLGÄNGLIGHET: markören hamnar i sökrutan så man kan försöka igen
  }
}

formular.addEventListener("submit", (event) => {
  event.preventDefault();   // stoppa att sidan laddas om

  const stad = stadInput.value.trim();
  if (stad) {
    sok(stad);
  }
});

// ---------- Start ----------
if (!API_NYCKEL && !ANVAND_EXEMPEL) {
  visaMeddelande("API-nyckel saknas. Skapa filen .env.local och starta om npm run dev.", true);
} else {
  sok("Hudiksvall");
}
