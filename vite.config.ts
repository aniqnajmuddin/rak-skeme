import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // @ts-ignore - Kita paksa ambil path folder utama
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Kita suntik terus ke dalam sistem Vercel masa build
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      '__GEMINI_KEY__': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
  }
})