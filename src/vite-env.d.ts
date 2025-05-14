/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MS_CLIENT_ID: string;
    readonly VITE_MS_TENANT_ID: string;
    readonly VITE_MS_REDIRECT_URI: string;
    readonly MODE: 'development' | 'production';
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
