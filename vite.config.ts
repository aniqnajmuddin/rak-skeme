import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Ubat untuk error "Cannot find name 'process'"
declare const process: any;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // PENTING: Cari kunci API dalam pelbagai variasi nama.
  // Vercel kadang-kadang simpan dalam process.env, kadang dalam env object.
  // Kita utamakan VITE_GEMINI_API_KEY, tapi terima juga API_KEY sebagai backup.
  const apiKey = env.VITE_GEMINI_API_KEY || 
                 env.API_KEY || 
                 process.env.VITE_GEMINI_API_KEY || 
                 process.env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // PENTING: Kita "hardcode" nilai kunci ini ke dalam kod JS semasa build.
      // SDK Awang mencari 'process.env.API_KEY', jadi kita sediakan ia di sini.
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  }
})