/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly SAMPLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
