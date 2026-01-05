// https://nuxt.com/docs/api/configuration/nuxt-config
import {
  getDevPlugins,
  getBuildPlugins,
  getOptimizeDeps,
  getBuildConfig,
} from '@riddle-rush/config/vite'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
  ],

  plugins: ['~/plugins/i18n-init.client.ts', '~/plugins/error-sync.client.ts'],
  ssr: false,

  // Auto-import configuration
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    {
      path: '~/components/Base',
      prefix: 'Base',
      pathPrefix: false,
    },
  ],

  // Component configuration (removed lazy loading as it's not supported in current Nuxt version)
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    {
      path: '~/components/Base',
      prefix: 'Base',
    },
  ],

  imports: {
    dirs: ['composables', 'composables/**', 'services'],
  },
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  app: {
    baseURL: process.env.BASE_URL || (process.env.CI ? '/riddle-rush-nuxt-pwa/' : '/'),
    head: {
      charset: 'utf-8',
      viewport:
        'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover',
      title: 'Riddle Rush - The Ultimate Guessing Game',
      meta: [
        {
          name: 'description',
          content:
            'An exciting word guessing game for friends and family. Play offline, perfect for game nights!',
        },
        {
          name: 'keywords',
          content: 'riddle, guessing game, word game, family game, offline game, PWA',
        },
        { name: 'author', content: 'Riddle Rush' },
        { name: 'theme-color', content: '#667eea' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Riddle Rush' },
        { name: 'format-detection', content: 'telephone=no' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Riddle Rush - The Ultimate Guessing Game' },
        {
          property: 'og:description',
          content:
            'An exciting word guessing game for friends and family. Play offline, perfect for game nights!',
        },
        { property: 'og:image', content: '/pwa-512x512.png' },
        { property: 'og:site_name', content: 'Riddle Rush' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Riddle Rush - The Ultimate Guessing Game' },
        {
          name: 'twitter:description',
          content:
            'An exciting word guessing game for friends and family. Play offline, perfect for game nights!',
        },
        { name: 'twitter:image', content: '/pwa-512x512.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || (process.env.CI ? '/riddle-rush-nuxt-pwa/' : '/'),
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
      appVersion: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      // Terraform outputs (set by sync-terraform-outputs.sh or get-terraform-outputs.sh)
      cloudfrontDomain:
        process.env.NUXT_PUBLIC_CLOUDFRONT_DOMAIN || process.env.CLOUDFRONT_DOMAIN || '',
      websiteUrl: process.env.NUXT_PUBLIC_WEBSITE_URL || process.env.WEBSITE_URL || '',
      awsRegion: process.env.AWS_REGION || 'eu-central-1',
      // CloudWatch configuration
      cloudWatchEndpoint: process.env.CLOUDWATCH_ENDPOINT || '',
      cloudWatchApiKey: process.env.CLOUDWATCH_API_KEY || '',
      debugErrorSync: process.env.DEBUG_ERROR_SYNC === 'true',
      // Amplify configuration (optional)
      amplifyConfig: {
        region: process.env.AWS_REGION || 'eu-central-1',
        userPoolId: process.env.COGNITO_USER_POOL_ID || '',
        userPoolWebClientId: process.env.COGNITO_USER_POOL_WEB_CLIENT_ID || '',
        identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID || '',
      },
    },
  },

  experimental: {
    typedPages: true,
    payloadExtraction: true,
    renderJsonPayloads: true,
    viewTransition: true,
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    compressPublicAssets: true,
    minify: true,
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },

  // Workspace packages - use Vite alias for proper resolution
  vite: {
    ...getBuildConfig(),
    resolve: {
      alias: {
        '@riddle-rush/shared': new URL('../../packages/shared/src', import.meta.url).pathname,
        '@riddle-rush/types': new URL('../../packages/types/src', import.meta.url).pathname,
        '@riddle-rush/config': new URL('../../packages/config', import.meta.url).pathname,
      },
    },
    plugins: [
      ...getDevPlugins({
        isDev: process.env.NODE_ENV !== 'production',
        root: new URL('.', import.meta.url).pathname,
      }),
      ...(process.env.NODE_ENV === 'production' ? getBuildPlugins() : []),
    ],
    optimizeDeps: getOptimizeDeps(),
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          additionalData: '@use "sass:math";',
        },
      },
    },
    // Performance optimizations
    server: {
      fs: {
        strict: true,
      },
    },
  },

  typescript: { strict: true },

  i18n: {
    locales: [
      { code: 'de', language: 'de-DE', file: 'de.json', name: 'Deutsch' },
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
    ],
    defaultLocale: 'de',
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      fallbackLocale: 'de',
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Riddle Rush - The Ultimate Guessing Game',
      short_name: 'Riddle Rush',
      description:
        'An exciting word guessing game for friends and family. Play offline, perfect for game nights!',
      theme_color: '#667eea',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      display_override: ['standalone', 'fullscreen'],
      prefer_related_applications: false,
      categories: ['games', 'entertainment'],
      lang: 'en',
      dir: 'ltr',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/pwa-72x72.png', sizes: '72x72', type: 'image/png' },
        { src: '/pwa-96x96.png', sizes: '96x96', type: 'image/png' },
        { src: '/pwa-128x128.png', sizes: '128x128', type: 'image/png' },
        { src: '/pwa-144x144.png', sizes: '144x144', type: 'image/png' },
        { src: '/pwa-152x152.png', sizes: '152x152', type: 'image/png' },
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/pwa-384x384.png', sizes: '384x384', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        {
          src: '/pwa-512x512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      screenshots: [
        {
          src: '/assets/splash/Splash screen.png',
          sizes: '1170x2532',
          type: 'image/png',
          form_factor: 'narrow',
        },
      ],
      shortcuts: [
        {
          name: 'Quick Start',
          short_name: 'Play',
          description: 'Start a new game instantly',
          url: '/',
          icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
        },
        {
          name: 'Statistics',
          short_name: 'Stats',
          description: 'View your game statistics',
          url: '/statistics',
          icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
        },
        {
          name: 'Settings',
          short_name: 'Settings',
          description: 'Adjust game settings',
          url: '/settings',
          icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
        },
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
    devOptions: {
      enabled: process.env.NODE_ENV !== 'production',
      type: 'module',
      /* Suppress warnings about missing files in dev mode */
      suppressWarnings: process.env.NODE_ENV !== 'production',
    },
  },
})
