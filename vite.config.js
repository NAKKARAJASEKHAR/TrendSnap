import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the local backend server to avoid CORS issues
      // and 404s during development. This assumes your server.js is running
      // on port 3000. Change the target if your backend port is different.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true, // Recommended for virtual hosted sites
      },
    },
  },
})