/// <reference types="vite/client" />

// Talar om för TypeScript vilka miljövariabler som finns i .env.local
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
