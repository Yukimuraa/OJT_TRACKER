import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const NAVY = '#142b49'
const LIGHT_BACKGROUND = '#FCFCFB'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,

      includeAssets: [
        'favicon.svg',
        'offline.html',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-maskable-512.png',
        'icons/apple-touch-icon.png',
      ],

      manifest: {
        id: '/',
        name: 'OJT Hours Tracker',
        short_name: 'OJT Tracker',
        description:
          'A web application for managing OJT attendance, rendered hours, and daily training tasks.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: NAVY,
        background_color: LIGHT_BACKGROUND,
        lang: 'en',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        importScripts: ['sw-custom.js'],
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff,woff2,webmanifest}',
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /\/offline\.html$/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.method === 'GET' &&
              url.origin === self.origin &&
              ['style', 'script', 'worker', 'font', 'image'].includes(
                request.destination,
              ),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'ojt-static-assets',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],

  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: [
      'hamster-prelude-schnapps.ngrok-free.dev',
    ],
  },
})
