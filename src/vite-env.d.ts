/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MS_CLIENT_ID: string;
    readonly VITE_MS_TENANT_ID: string;
    readonly VITE_MS_CLIENT_SECRET: string;
    readonly VITE_MS_REDIRECT_URI: string;
    readonly VITE_API_BASE_URL: string;
    readonly MODE: 'development' | 'production';
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
