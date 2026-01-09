import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Kita guna './' bermaksud folder utama sekarang
  const env = loadEnv(mode, './', '');
  
  return {
    plugins: [react()],
    define: {
      // Suntikan rahsia untuk hantar kunci ke Awang
      '__GEMINI_KEY__': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
  }
})