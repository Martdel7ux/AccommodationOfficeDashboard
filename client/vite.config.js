import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['unic-logo.png', 'unic-logo-white.png', 'unic-campus.jpg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'UNIC Accommodation Office',
        short_name: 'UNIC Accom',
        description: 'The Off Campus Accommodation Database of the University of Nicosia',
        theme_color: '#C41230',
        background_color: '#C41230',
        display: 'standalone',
        start_url: '/dashboard',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-cache', networkTimeoutSeconds: 10 },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ['xlsx'],
  },
  define: {
    global: 'globalThis',
  },
});
