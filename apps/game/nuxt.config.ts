import { getTerraformOutputsFromEnv } from '../../nuxt.config.terraform'
import { getBuildPlugins, getDevPlugins } from '@riddle-rush/config/vite'

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
    'nuxt-security',
  ],
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

  vite: {
    plugins: [
      // Inspector already enabled via devtools
      // Note: Build plugins are conditionally loaded in shared config
      ...(process.env.NODE_ENV === 'production'
        ? (getBuildPlugins({ isDev: false }) as any)
        : (getDevPlugins({ isDev: true }) as any)),
    ],
    optimizeDeps: {
      include: ['pinia', '@vueuse/core', '@vueuse/motion', 'lodash-es'],
      exclude: ['vue-demi'],
      esbuildOptions: {
        // Ensure lodash-es is tree-shaken properly
        treeShaking: true,
      },
    },
    build: {
      minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
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
              return 'vendor'
            }
          },
        },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      chunkSizeWarningLimit: 1000, // Increase warning limit for chunks
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

  // Image optimization
  image: {
    quality: 85,
    format: ['webp', 'avif', 'png'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    providers: {
      ipx: {},
    },
    presets: {
      avatar: {
        modifiers: {
          format: 'webp',
          width: 100,
          height: 100,
        },
      },
      background: {
        modifiers: {
          format: 'webp',
          quality: 80,
        },
      },
      thumbnail: {
        modifiers: {
          format: 'webp',
          width: 200,
          quality: 75,
        },
      },
    },
  },

  // Security headers
  security: {
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
