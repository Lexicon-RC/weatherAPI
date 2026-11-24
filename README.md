# Väderkollen

En liten webbsida som hämtar vädret från ett API och visar det.

Vi bygger den i tre delar:

1. **Testa API:et**, innan vi skriver någon kod
2. **Bygg sidan**
3. **Kolla att alla kan använda sidan** (tillgänglighet)

---

## Kom igång

```
npm install
copy .env.example .env.local
npm run dev
```

Öppna `.env.local` och klistra in din API-nyckel efter `VITE_API_KEY=`.
Starta sedan om (`Ctrl + C`, sedan `npm run dev`).

---

## Del 1: Testa API:et först

> **Varför?** Tänk dig att du ska baka en kaka. Först kollar du vad som finns i
> skafferiet, sedan börjar du baka. Här kollar vi först vad API:et ger oss,
> sedan bygger vi sidan.

### 1. Fråga API:et direkt i webbläsaren

Klistra in den här adressen i webbläsaren. Byt `DIN_NYCKEL` mot din nyckel.

```
https://api.openweathermap.org/data/2.5/weather?q=Hudiksvall&units=metric&lang=sv&appid=DIN_NYCKEL
```

Adressen består av flera delar:

| Del | Betyder |
|---|---|
| `q=Hudiksvall` | Vilken stad? |
| `units=metric` | Grader i Celsius |
| `lang=sv` | Svenska ord |
| `appid=...` | Din nyckel (som ett lösenord) |

Du får tillbaka text som kallas **JSON**. Det är vad API:et svarar.
Tips: Firefox visar JSON snyggt. Klicka på "Rådata" och "Snygga till" för att växla.

### 2. Leta upp det vi behöver

Svaret innehåller mycket. Vi behöver bara några saker. Hitta dem i svaret:

| Vad vi vill visa | Var det finns i svaret |
|---|---|
| Stadens namn | `name` |
| Temperatur | `main.temp` |
| Känns som | `main.feels_like` |
| Luftfuktighet | `main.humidity` |
| Vind | `wind.speed` |
| Beskrivning | `weather[0].description` |
| Bild | `weather[0].icon` |

`weather[0]` betyder: `weather` är en lista, och vi tar den **första** saken i listan.

Den här tabellen blir sedan filen `src/types.ts`.

### 3. Testa vad som händer när det går fel

En bra programmerare testar också det som kan gå fel. Prova:

| Testa så här | Vad API:et svarar |
|---|---|
| Stavar staden fel: `q=Hudiksvalll` | `404`, "city not found" |
| Skriver fel nyckel: `appid=fel` | `401`, "Invalid API key" |

Siffran (404, 401) kallas **statuskod**. Nu vet vi vad sidan ska säga
när det går fel. Det står i `hamtaVader()` i `main.ts`.

### 4. Spara ett svar som exempel

Spara ett riktigt svar som `public/exempel.json` (det finns redan ett där).
Sätt sedan `ANVAND_EXEMPEL = true` i `main.ts`.

Nu kan du bygga sidan **utan internet och utan nyckel**. Det är också bra om
nyckeln inte har blivit aktiv än.

---

## Del 2: Bygg sidan

Följ kommentarerna `STEG 1` till `STEG 5` i `src/main.ts`:

1. **Inställningar**: nyckeln och om vi använder exempeldata
2. **Hämta elementen** från HTML
3. **Fråga API:et** med `fetch`
4. **Visa vädret** genom att skriva in texten i HTML
5. **Gör något när man trycker Sök**

Tips: öppna `F12`, sedan `Console`. Där syns svaret från API:et.

---

## Del 3: Kan alla använda sidan?

> **Varför?** Alla använder inte en dator på samma sätt. Vissa ser dåligt,
> vissa kan inte använda mus, vissa får sidan uppläst av datorn.

### Det här har vi gjort i koden

Leta efter ordet `TILLGÄNGLIGHET` i filerna.

| Vad | Varför |
|---|---|
| `lang="sv"` | Datorn läser upp texten med svenskt uttal |
| `<label>` till sökrutan | Man vet vad rutan är till för |
| Knappen har texten "Sök" | En ikon säger ingenting för den som inte ser den |
| `aria-live` på meddelandet | Datorn läser upp "Hämtar väder..." och fel |
| `alt=""` på väderbilden | Beskrivningen står redan i texten bredvid |
| `aria-hidden` på emojin | Den är bara pynt |
| Skriver "Fel:" i felmeddelandet | Man förstår att det är fel även utan att se färgen |
| Tydliga färger | Texten syns bra mot bakgrunden |
| Blå ram vid Tab | Man ser var man är utan mus |
| Storlekar i `rem` | Allt växer om man väljer större text |

### Testa själv

1. **Utan mus:** tryck bara `Tab`, `Shift + Tab` och `Enter`. Kan du söka på en stad?
2. **Zooma:** tryck `Ctrl` och `+` tills det står 200 %. Syns allt fortfarande?
3. **Låt datorn läsa:** starta Skärmläsaren i Windows med `Windows + Ctrl + Enter`.
   Sök på en stad. Hör du vädret? Stäng av med samma kortkommando.
4. **Låt Chrome kolla:** `F12`, sedan fliken `Lighthouse`. Kryssa bara i
   `Accessibility` och tryck `Analyze page load`.

---

## Bra att veta

- **Nyckeln syns.** När sidan körs syns nyckeln i `F12` under `Network`.
  `.env.local` ligger i `.gitignore` så att den inte hamnar på GitHub.
- **Ny nyckel?** Det kan ta upp till ett par timmar innan den fungerar.
  Använd `ANVAND_EXEMPEL = true` så länge.
- **Sökning på stadsnamn (`q=`)** är enklast för nybörjare. OpenWeatherMap
  rekommenderar egentligen att man först gör om staden till koordinater
  med deras Geocoding API. Det passar bra som extrauppgift.

## Extrauppgifter

- Visa soluppgång och solnedgång (`sys.sunrise`, `sys.sunset`)
- Lägg till en knapp "Använd min plats"
- Visa en prognos för kommande dagar (`/data/2.5/forecast`)
