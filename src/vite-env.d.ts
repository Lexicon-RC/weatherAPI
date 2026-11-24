/// <reference types="vite/client" />

// Talar om för TypeScript att .env.local har en variabel som heter VITE_API_KEY
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
