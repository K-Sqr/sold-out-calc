/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REPORT_ENDPOINT_URL?: string;
  readonly VITE_DIAGNOSTIC_ENDPOINT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
