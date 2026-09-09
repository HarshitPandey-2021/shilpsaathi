import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    // LAN/mobile dev: bind all interfaces so http://<LAPTOP-LAN-IP>:5173 works.
    // Run: npm run dev -- --host 0.0.0.0 --port 5173
    host: '0.0.0.0',
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['SIH.png'],
      manifest: {
        name: 'ShilpSaathi - शिल्पसाथी',
        short_name: 'ShilpSaathi',
        description: 'AI-Powered Virtual Business Manager for Marginalized Artisans',
        theme_color: '#A44932',
        background_color: '#FFF9F0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
});