// =====================================================
// Typer för API-svaren
// =====================================================
// Vi beskriver bara de fält vi faktiskt använder.
// Tips: titta på svaret i F12 (console.log) och bygg typen därifrån.

// Delas av både aktuellt väder och prognosen
export interface WeatherCondition {
  id: number;
  main: string;         // t.ex. "Clouds"
  description: string;  // t.ex. "molnigt" (med lang=sv)
  icon: string;         // t.ex. "04d"
}

// Geocoding API: /geo/1.0/direct  -> svaret är en ARRAY av dessa
export interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;       // ? = finns inte alltid
}

// Current Weather API: /data/2.5/weather
export interface CurrentWeather {
  name: string;
  timezone: number;     // sekunder från UTC
  visibility: number;   // meter
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    country: string;
    sunrise: number;    // Unix-tid i sekunder
    sunset: number;
  };
}

// Ett enskilt värde i prognosen (var 3:e timme)
export interface ForecastItem {
  dt: number;
  dt_txt: string;       // "2026-11-24 12:00:00" (UTC)
  weather: WeatherCondition[];
  main: {
    temp: number;
  };
}

// Forecast API: /data/2.5/forecast
export interface Forecast {
  list: ForecastItem[];
  city: {
    name: string;
    timezone: number;
  };
}

export interface Coordinates {
  lat: number;
  lon: number;
}
