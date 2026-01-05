
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./', import.meta.url)) }
    ]
  },
  // 'base' ini penting supaya link (assets) tidak pecah bila di GitHub Pages
  base: './', 
})
