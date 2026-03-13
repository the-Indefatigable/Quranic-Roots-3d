import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'fonts/**/*'],
      manifest: {
        name: 'Quranic Verb Roots — 3D Explorer',
        short_name: 'Quranic Verbs',
        description: 'Interactive 3D visualization of Quranic Arabic verb roots with conjugation tables and quiz mode.',
        theme_color: '#050510',
        background_color: '#050510',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Precache app shell + small always-needed data files
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        additionalManifestEntries: [
          { url: '/data/index.json',       revision: null },
          { url: '/data/surahIndex.json',  revision: null },
          { url: '/data/quizSamples.json', revision: null },
        ],
        runtimeCaching: [
          // Per-root detail files — cache on first fetch, serve offline forever after
          {
            urlPattern: /\/data\/roots\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'root-details',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Small data files (index, surahIndex, quizSamples) — belt-and-suspenders
          {
            urlPattern: /\/data\/(index|surahIndex|quizSamples)\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-data',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /fonts\.googleapis\.com|fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  server: {
    port: 5173,
    open: false,
  },
})
