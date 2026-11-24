// =====================================================
// Så här ser svaret från API:et ut
// =====================================================
// Vi skrev den här typen EFTER att vi tittat på svaret i webbläsaren.
// Vi tar bara med de fält vi använder på sidan, inte allt API:et skickar.

export interface Vader {
  name: string;                 // stadens namn, t.ex. "Hudiksvall"
  weather: {
    description: string;        // t.ex. "lätt snöfall"
    icon: string;               // t.ex. "13d" (koden för bilden)
  }[];                          // [] = en lista (array)
  main: {
    temp: number;               // temperatur i grader
    feels_like: number;         // hur kallt eller varmt det känns
    humidity: number;           // luftfuktighet i procent
  };
  wind: {
    speed: number;              // vind i meter per sekund
  };
}
