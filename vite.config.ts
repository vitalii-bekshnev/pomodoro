import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Set base path for GitHub Pages deployment
  // GitHub Pages serves repository pages from https://<username>.github.io/<repo>/
  base: '/pomodoro/',
  plugins: [react()],
  server: {
    port: 5173,
  },
})

