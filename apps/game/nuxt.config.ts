export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@vite-pwa/nuxt', '@nuxt/eslint', '@vueuse/nuxt'],

  ssr: false,

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  imports: {
    dirs: ['stores', 'composables'],
  },
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Riddle Rush - Fun Party Game',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
        },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
    },
  },

  css: ['~/assets/scss/design-system.scss'],

  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || '',
      environment: process.env.NODE_ENV || 'development',
      appVersion: process.env.npm_package_version || '1.0.0',
      cloudWatchEndpoint: process.env.CLOUDWATCH_ENDPOINT || '',
      cloudWatchApiKey: process.env.CLOUDWATCH_API_KEY || '',
      debugErrorSync: process.env.DEBUG_ERROR_SYNC === 'true',
    },
  },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',

  vite: {
    optimizeDeps: {
      include: ['pinia', '@vueuse/core'],
    },
    build: {
      minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        types: ['@pinia/nuxt', '@nuxtjs/i18n'],
      },
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  i18n: {
    langDir: 'locales',
    defaultLocale: 'en',
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
      { code: 'de', iso: 'de-DE', file: 'de.json', name: 'Deutsch' },
    ],
    strategy: 'no_prefix',
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Riddle Rush',
      short_name: 'RiddleRush',
      theme_color: '#ff6b35',
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/(?!api\/)/],
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^\/$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'start-url',
            networkTimeoutSeconds: 3,
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
})
