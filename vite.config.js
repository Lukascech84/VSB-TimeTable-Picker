import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tento base path je nutný pro správné načítání na GitHub Pages
  base: '/VSB-TimeTable-Picker/',
})
