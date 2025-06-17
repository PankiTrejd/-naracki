/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_DATABASE_HOST: string;
  readonly VITE_DATABASE_PORT: string;
  readonly VITE_DATABASE_USER: string;
  readonly VITE_DATABASE_PASSWORD: string;
  readonly VITE_DATABASE_NAME: string;
  readonly VITE_DO_SPACES_ENDPOINT: string;
  readonly VITE_DO_SPACES_REGION: string;
  readonly VITE_DO_SPACES_KEY: string;
  readonly VITE_DO_SPACES_SECRET: string;
  readonly VITE_DO_SPACES_BUCKET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
