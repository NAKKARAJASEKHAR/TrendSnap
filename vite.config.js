import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the local backend server to avoid CORS issues.
      // During development, any request from the frontend to a path starting
      // with `/api` will be forwarded to the target server.
      '/api': {
        // This assumes your server.js is running on port 3000.
        // Change the target if your backend port is different.
        target: 'http://localhost:3000',
        changeOrigin: true,
        // IMPORTANT: The rewrite removes the '/api' prefix from the request path
        // before forwarding it to the backend. This is useful if your backend
        // routes are defined without the '/api' prefix (e.g., '/collection', '/videos').
        // If your backend routes *do* include '/api', you can remove this line.
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
