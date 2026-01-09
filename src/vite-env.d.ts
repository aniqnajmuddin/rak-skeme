/// <reference types="vite/client" />

// Definisi untuk 'import.meta.env' (Standard Vite/VSCode)
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Fallback untuk 'process.env' (Vercel/Node environment)
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}

// Ubat untuk error "Cannot find module '@google/genai'"
// Kita declare module ni supaya TypeScript tak marah walaupun kita guna importmap
declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(config: { apiKey: string | undefined });
    models: {
      generateContent(params: any): Promise<any>;
      generateContentStream(params: any): Promise<any>;
      generateImages(params: any): Promise<any>;
      generateVideos(params: any): Promise<any>;
    };
    chats: {
      create(config: any): any;
    };
  }
}