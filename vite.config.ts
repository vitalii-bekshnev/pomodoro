import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Set base path for GitHub Pages deployment
  // In development, use root path for easier local testing
  base: process.env.NODE_ENV === 'production' ? '/pomodoro/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
})

