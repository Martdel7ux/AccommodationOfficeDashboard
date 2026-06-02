import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // When using `vercel dev`, the API runs on the same origin — no proxy needed.
    // Uncomment the proxy below only if you're running the legacy Express server locally:
    // proxy: {
    //   '/api':     { target: 'http://localhost:3001', changeOrigin: true },
    //   '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
    // },
  },
});
