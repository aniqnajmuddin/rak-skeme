import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // @ts-ignore - Kita guna ni supaya TypeScript tak bising pasal 'process'
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // JAMBATAN: Kita buat process.env.API_KEY wujud dalam browser
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
  }
})