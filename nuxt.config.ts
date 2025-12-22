// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n',
  '@nuxt/test-utils/module', '@pinia/nuxt', '@vite-pwa/nuxt', 'nuxt-viewport', '@nuxt/scripts', '@vueuse/nuxt', '@nuxthub/core'],
  ssr: false,
  devtools: { enabled: true },

  app: {
    baseURL: process.env.BASE_URL || '/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
  },

  runtimeConfig: {
    // Server-side only
    apiSecret: process.env.API_SECRET || '',
    // Public (exposed to client)
    public: {
      baseUrl: process.env.BASE_URL || '/',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
      appVersion: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  },

  experimental: {
    typedPages: true,
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    compressPublicAssets: true,
  },

  typescript: { strict: true },

  i18n: {
    locales: [{ code: 'de', language: 'de-DE', file: 'de.json', name: 'Deutsch' }],
    defaultLocale: 'de',
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Guess Game',
      short_name: 'GuessGame',
      description: 'A fun word guessing game with Wikipedia categories',
      theme_color: '#667eea',
      background_color: '#667eea',
      display: 'standalone',
      orientation: 'portrait',
      categories: ['games', 'entertainment'],
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json,woff2}'],
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: /\/data\/.*\.json$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'game-data-cache',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /^https:\/\/petscan\.wmflabs\.org\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'petscan-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            cacheableResponse: { statuses: [0, 200] },
            networkTimeoutSeconds: 10,
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-stylesheets',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
    devOptions: { enabled: true, type: 'module' },
  },
})