import { getTerraformOutputsFromEnv } from '../../nuxt.config.terraform'
import { getBuildPlugins, getDevPlugins } from '@riddle-rush/config/vite'

// Disable minification when building for localhost (e.g., local E2E) to keep bundles debuggable
const isLocalhostBuild = [
  process.env.BASE_URL,
  process.env.NUXT_PUBLIC_BASE_URL,
  process.env.PLAYWRIGHT_TEST_BASE_URL,
  process.env.HOST,
  process.env.NUXT_HOST,
]
  .filter(Boolean)
  .some((value) => value?.includes('localhost') || value?.includes('127.0.0.1'))

const shouldMinify = process.env.NODE_ENV === 'production' && !isLocalhostBuild ? 'esbuild' : false

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@vueuse/motion/nuxt',
    '@nuxtjs/fontaine',
    '@nuxtjs/color-mode',
    '@nuxtjs/device',
    '@nuxt/image',
    // Disable nuxt-security for E2E tests - it causes 500 errors on static assets
    ...(process.env.DISABLE_SECURITY !== 'true' ? ['nuxt-security'] : []),
  ],
  ssr: false, // Client-only SPA (IndexedDB and PWA require client-side rendering)

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  imports: {
    dirs: ['stores', 'composables'],
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

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

  // Color mode configuration
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'riddle-rush-color-mode',
    dataValue: 'theme', // Adds data-theme="light/dark" to <html>
  },

  runtimeConfig: {
    public: {
      // Environment variables take precedence over Terraform outputs
      baseUrl: process.env.BASE_URL || '',
      environment: process.env.NODE_ENV || 'development',
      appVersion: process.env.npm_package_version || '1.0.0',
      // CloudWatch configuration - env vars override Terraform
      cloudWatchEndpoint: process.env.CLOUDWATCH_ENDPOINT || '',
      cloudWatchApiKey: process.env.CLOUDWATCH_API_KEY || '',
      debugErrorSync: process.env.DEBUG_ERROR_SYNC === 'true',
      // Feature flags - env vars override Terraform
      gitlabFeatureFlagsUrl: process.env.GITLAB_FEATURE_FLAGS_URL || '',
      gitlabFeatureFlagsToken: process.env.GITLAB_FEATURE_FLAGS_TOKEN || '',
      gtagId: process.env.GTAG_ID || '',
      // Additional variables with safe Terraform fallback
      ...((): Record<string, string> => {
        const terraform = getTerraformOutputsFromEnv()
        return {
          awsRegion: process.env.AWS_REGION || terraform.aws_region || 'eu-central-1',
          cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN || terraform.cloudfront_domain_name || '',
          websiteUrl: process.env.WEBSITE_URL || terraform.website_url || '',
          cloudfrontDistributionId:
            process.env.CLOUDFRONT_DISTRIBUTION_ID || terraform.cloudfront_distribution_id || '',
          // Only add bucket_name if it exists in Terraform and no env var
          ...(terraform.bucket_name && !process.env.BASE_URL
            ? { bucket_name: terraform.bucket_name }
            : {}),
        }
      })(),
    },
  },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',

  // Nitro configuration for SSR deployment
  nitro: {
    preset: process.env.NITRO_PRESET || 'node-server',
    serveStatic: true,
    compressPublicAssets: true,
  },

  vite: {
    resolve: {
      preserveSymlinks: false, // Keep default behavior
      dedupe: ['vue', '@nuxtjs/i18n'], // Deduplicate these modules to avoid circular deps
    },
    plugins: [
      // Inspector already enabled via devtools
      // Note: Build plugins are conditionally loaded in shared config
      ...(process.env.NODE_ENV === 'production'
        ? (getBuildPlugins({ isDev: false }) as unknown as Plugin[])
        : (getDevPlugins({ isDev: true }) as unknown as Plugin[])),
    ],
    optimizeDeps: {
      include: ['pinia', '@vueuse/core', '@vueuse/motion', 'lodash-es'],
      exclude: ['vue-demi'],
      esbuildOptions: {
        // Ensure lodash-es is tree-shaken properly
        treeShaking: true,
        // Enable more aggressive optimizations
        legalComments: 'none',
        target: 'es2020',
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true, // Help handle circular dependencies
      },
      minify: shouldMinify, // Keep minification off for localhost builds (helps Playwright debugging)
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Better lodash tree-shaking - group all lodash functions together
            if (id.includes('lodash-es')) {
              return 'vendor-lodash'
            }
            // Other vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('vue') || id.includes('pinia')) {
                return 'vendor-vue'
              }
              if (id.includes('@vueuse')) {
                return 'vendor-vueuse'
              }
              if (id.includes('@nuxtjs/i18n')) {
                return 'vendor-i18n'
              }
              if (id.includes('idb')) {
                return 'vendor-idb'
              }
              if (id.includes('@capacitor')) {
                return 'vendor-capacitor'
              }
              return 'vendor'
            }
          },
        },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
          // More aggressive tree shaking
          unknownGlobalSideEffects: false,
        },
      },
      chunkSizeWarningLimit: 1000, // Increase warning limit for chunks
      // Enable CSS code splitting for better performance
      cssCodeSplit: true,
      // Enable sourcemap in development only
      sourcemap: process.env.NODE_ENV !== 'production',
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
      stylistic: false, // Use root config instead
    },
  },

  // Font optimization
  fontMetrics: {
    fonts: ['Inter', 'system-ui'],
  },

  i18n: {
    langDir: 'locales',
    defaultLocale: 'de',
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
      { code: 'de', iso: 'de-DE', file: 'de.json', name: 'Deutsch' },
    ],
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'riddle-rush-i18n',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'de',
    },
  },

  // Image optimization - Enhanced for better performance
  image: {
    quality: 80, // Reduced from 85 for better compression
    format: ['webp', 'avif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    // Explicitly use sharp for image processing
    sharp: {
      enabled: true,
      // Advanced sharp options for better compression
      quality: 80,
      progressive: true,
      withoutEnlargement: true,
      withoutReduction: false,
    },
    providers: {
      ipx: {
        // Enable lazy loading by default
        lazy: true,
        // Add loading="lazy" attribute
        loading: 'lazy',
        // Enable responsive images
        responsive: true,
        // Use modern formats
        format: ['webp', 'avif'],
      },
    },
    presets: {
      avatar: {
        modifiers: {
          format: 'webp',
          width: 100,
          height: 100,
          quality: 75, // Reduced for better performance
        },
      },
      background: {
        modifiers: {
          format: 'webp',
          quality: 70, // Reduced for better performance
        },
      },
      thumbnail: {
        modifiers: {
          format: 'webp',
          width: 200,
          quality: 70, // Reduced for better performance
        },
      },
      // New optimized presets
      icon: {
        modifiers: {
          format: 'webp',
          width: 64,
          height: 64,
          quality: 80, // Reduced for better performance
        },
      },
      hero: {
        modifiers: {
          format: 'webp',
          quality: 75, // Reduced for better performance
          width: 1200,
        },
      },
      // New: Low quality image placeholder (LQIP) preset
      lqip: {
        modifiers: {
          format: 'webp',
          quality: 20,
          width: 20,
          height: 20,
          blur: 5,
        },
      },
    },
  },

  // Motion animation defaults
  motion: {
    directives: {
      'pop-bottom': {
        initial: {
          scale: 0,
          opacity: 0,
          y: 100,
        },
        visible: {
          scale: 1,
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 250,
            damping: 25,
          },
        },
      },
      'slide-left': {
        initial: {
          x: -100,
          opacity: 0,
        },
        visible: {
          x: 0,
          opacity: 1,
        },
      },
      'slide-right': {
        initial: {
          x: 100,
          opacity: 0,
        },
        visible: {
          x: 0,
          opacity: 1,
        },
      },
      fade: {
        initial: {
          opacity: 0,
        },
        visible: {
          opacity: 1,
        },
      },
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Riddle Rush',
      short_name: 'RiddleRush',
      description: 'Fun multiplayer party word game',
      theme_color: '#ff6b35',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
      categories: ['games', 'entertainment'],
    },
    workbox: {
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/(?!api\/)/],
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      // Performance: Optimize cache strategies
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: /^\/$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'start-url',
            networkTimeoutSeconds: 3,
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
        {
          urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'fonts',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-stylesheets',
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 365 * 24 * 60 * 60,
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  // Security headers
  security: {
    nonce: false, // Disable nonces for Playwright compatibility
    headers: {
      crossOriginEmbedderPolicy:
        process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
      contentSecurityPolicy: {
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'script-src': ["'self'", 'https:', "'unsafe-inline'", "'unsafe-eval'"],
        'upgrade-insecure-requests': process.env.NODE_ENV === 'production',
      },
    },
  },
})
