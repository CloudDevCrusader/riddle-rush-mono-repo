import { MIN_PLAYERS, MAX_PLAYERS, DEFAULT_PLAYERS } from '@riddle-rush/shared/constants'
import { getTerraformOutputsFromEnv } from '../../nuxt.config.terraform'
import { getBuildPlugins, getDevPlugins } from '@riddle-rush/config/vite'
import { filterSsrPlugins } from './utils/filter-ssr-plugins'
import { withTrailingSlash } from 'ufo'
import type { NuxtApp as NuxtAppSchema, NuxtPlugin } from '@nuxt/schema'
import type { Manifest as ViteBundleManifest } from 'vue-bundle-renderer'

// Disable minification for development and debug builds
// Use DEBUG_BUILD=true to generate unminified production builds for debugging
const isDev = process.env.NODE_ENV !== 'production'
const isDebugBuild = process.env.DEBUG_BUILD === 'true'
const isLocalhostBuild = [
  process.env.BASE_URL,
  process.env.NUXT_PUBLIC_BASE_URL,
  process.env.PLAYWRIGHT_TEST_BASE_URL,
  process.env.HOST,
  process.env.NUXT_HOST,
]
  .filter(Boolean)
  .some((value) => value?.includes('localhost') || value?.includes('127.0.0.1'))

const shouldMinify = isDev || isLocalhostBuild || isDebugBuild ? false : 'esbuild'
const resolvedBaseUrl = (() => {
  const baseUrl = process.env.BASE_URL || process.env.NUXT_PUBLIC_BASE_URL || ''
  return baseUrl ? withTrailingSlash(baseUrl) : '/'
})()

// Helper function to filter out problematic i18n plugins
function filterProblematicPlugins(app: NuxtAppSchema) {
  if (app.plugins && Array.isArray(app.plugins)) {
    const originalLength = app.plugins.length
    app.plugins = app.plugins.filter((plugin: NuxtPlugin) => {
      const src = plugin.src
      if (src && typeof src === 'string') {
        // Remove SSR-only plugins that cause "Cannot access 'NuxtPluginIndicator' before initialization"
        // NOTE: Do NOT filter the preload plugin — it's required to load locale messages
        const isProblematicPlugin =
          src.includes('switch-locale-path-ssr') ||
          src.includes('i18n-ssr') ||
          src.includes('locale-detector-ssr') ||
          src.includes('route-locale-detect') ||
          src.includes('ssg-detect') ||
          src.includes('@nuxtjs/i18n/runtime/plugins/switch-locale-path-ssr') ||
          src.includes('@nuxtjs/i18n/runtime/plugins/route-locale-detect')

        if (isProblematicPlugin) {
          // Only log in development to avoid cluttering production logs
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[nuxt.config] Filtering out problematic plugin: ${src}`)
          }
          return false
        }
      }
      return true
    })
    // Only log in development
    if (process.env.NODE_ENV === 'development' && app.plugins.length < originalLength) {
      console.log(
        `[nuxt.config] Filtered ${originalLength - app.plugins.length} problematic plugin(s)`
      )
    }
  }
}

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt', // Load Pinia first since stores are used everywhere
    '@nuxtjs/i18n', // Load i18n early but after Pinia
    '@unocss/nuxt', // Load UnoCSS after Pinia/i18n, before PWA
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
  // Client-only SPA (IndexedDB and PWA require client-side rendering)

  // Explicitly disable problematic i18n plugins
  plugins: [{ src: '~/plugins/00.init-plugin-system.client.ts', mode: 'client' }],
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
    enabled: process.env.NODE_ENV === 'development' && process.env.NUXT_DEVTOOLS !== 'false',
    timeline: {
      enabled: process.env.NODE_ENV === 'development' && process.env.NUXT_DEVTOOLS !== 'false',
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
        { name: 'mobile-web-app-capable', content: 'yes' },
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
      baseUrl: resolvedBaseUrl,
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
      // Feature flags - simple booleans (override via NUXT_PUBLIC_FEATURE_ANSWER_INPUT=false)
      featureAnswerInput: process.env.NUXT_PUBLIC_FEATURE_ANSWER_INPUT !== 'false',
      // Game configuration - env vars override shared constants
      minPlayers: Number(process.env.NUXT_PUBLIC_MIN_PLAYERS) || MIN_PLAYERS,
      maxPlayers: Number(process.env.NUXT_PUBLIC_MAX_PLAYERS) || MAX_PLAYERS,
      defaultPlayers: Number(process.env.NUXT_PUBLIC_DEFAULT_PLAYERS) || DEFAULT_PLAYERS,
      // Additional variables with safe Terraform fallback
      ...((): Record<string, string> => {
        const terraform = getTerraformOutputsFromEnv()
        return {
          cdnURL: process.env.CDN_URL || '',
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

  sourcemap: {
    server: isDev || isDebugBuild,
    client: isDev || isDebugBuild,
  },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',

  // Nitro configuration for SSR deployment
  nitro: {
    preset: process.env.NITRO_PRESET || (process.env.VERCEL ? 'vercel-static' : 'node-server'),
    serveStatic: true,
    compressPublicAssets: true,
    routeRules: {
      '/': {
        headers: {
          'cache-control': 'public, max-age=0, must-revalidate',
        },
      },
      '/**': {
        headers: {
          'cache-control': 'public, max-age=0, must-revalidate',
        },
      },
      '/_nuxt/**': {
        headers: {
          'cache-control': 'public, max-age=31536000, immutable',
        },
      },
      '/assets/**': {
        headers: {
          'cache-control': 'public, max-age=31536000, immutable',
        },
      },
      '/sw.js': {
        headers: {
          'cache-control': 'public, max-age=0, must-revalidate',
        },
      },
      '/workbox-*.js': {
        headers: {
          'cache-control': 'public, max-age=0, must-revalidate',
        },
      },
      '/manifest.webmanifest': {
        headers: {
          'cache-control': 'public, max-age=0, must-revalidate',
        },
      },
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Resolve bare SCSS imports like `@use 'assets/scss/...'` during Vercel builds
          // Sass @use doesn't understand Vite aliases (@/, ~/), so we add the app root
          // as a load path so `assets/scss/...` resolves relative to the app directory
          loadPaths: [new URL('.', import.meta.url).pathname],
        },
      },
    },
    resolve: {
      preserveSymlinks: false, // Keep default behavior
      dedupe: ['vue'], // Deduplicate Vue to ensure a single instance
    },
    plugins: [
      // Filter out SSR plugins at build time (must be first)
      // @ts-expect-error Vite plugin types differ across workspace packages due to duplicate rollup resolutions
      filterSsrPlugins(),
      // Inspector already enabled via devtools
      // Note: Build plugins are conditionally loaded in shared config
      // @ts-expect-error Vite plugin types differ across workspace packages due to duplicate rollup resolutions
      ...(process.env.NODE_ENV === 'production'
        ? getBuildPlugins({ isDev: false })
        : getDevPlugins({ isDev: true })),
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
      minify: shouldMinify, // Disabled in dev mode for debugging
      rollupOptions: {
        // Better handling of circular dependencies
        onwarn(warning, warn) {
          // Suppress circular dependency warnings in production, but log them in debug
          if (warning.code === 'CIRCULAR_DEPENDENCY') {
            if (isDebugBuild || isDev) {
              console.warn('Circular dependency detected:', warning.message)
              console.warn(
                'Check this before deploying, might fail after build',
                JSON.stringify(warning, null, 2)
              )
            }
            return
          }
          warn(warning)
        },
        // NOTE: Do not use manualChunks here. Vue, Nuxt runtime, and @nuxtjs/i18n
        // have circular module dependencies. Splitting them into separate chunks causes
        // "Cannot access 'X' before initialization" TDZ errors at runtime.
        // Let Rollup handle chunking automatically to respect module init order.
      },
      chunkSizeWarningLimit: 1000, // Increase warning limit for chunks
      // Enable CSS code splitting for better performance
      cssCodeSplit: true,
      // Enable sourcemaps in development and debug builds
      sourcemap: isDev || isDebugBuild ? 'inline' : false,
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

  // Fix plugin initialization order issues
  hooks: {
    'modules:done': () => {
      // Ensure plugins are loaded in the correct order
      // This helps prevent "Cannot access 'NuxtPluginIndicator' before initialization" errors
      if (process.env.NODE_ENV === 'development') {
        // Log only in development mode for debugging
        console.warn('Development mode: Ensuring proper plugin initialization order')
      }
    },
    // Filter out problematic i18n plugins at app resolution stage
    'app:resolve': (app: NuxtAppSchema) => {
      filterProblematicPlugins(app)
    },
    // build:manifest receives the Vite/Webpack bundle manifest (asset map), not app plugins —
    // plugin filtering is handled in app:resolve above. This hook is kept as a no-op placeholder.
    'build:manifest': (_manifest: ViteBundleManifest) => {
      // Plugin filtering is handled in app:resolve; bundle manifest has no plugin list.
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
    // @nuxtjs/i18n v10 resolves langDir and vueI18n relative to <rootDir>/<restructureDir>/
    // The default restructureDir is "i18n", so all paths would be prefixed with i18n/.
    // Set to '.' so paths resolve from the project root directly.
    restructureDir: '.',
    // langDir is intentionally omitted: messages are statically bundled via vueI18n/i18n.config.ts.
    // Adding langDir + file properties would trigger runtime lazy-loading which conflicts with
    // the static bundle and causes intermittent missing key race conditions (especially with PWA).
    vueI18n: 'translations/i18n.config',
    defaultLocale: 'de',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'de', iso: 'de-DE', name: 'Deutsch' },
    ],
    strategy: 'no_prefix',
    // Completely disable browser language detection - handled by client plugin
    detectBrowserLanguage: {
      useCookie: true,
      fallbackLocale: 'en',
    },
    // Disable the problematic SSR switch locale path plugin
    skipSettingLocaleOnNavigate: true,
    // Completely disable SSR features for client-only app
    differentDomains: false,
    // Disable SSR-specific compilation
    compilation: {
      strictMessage: false,
      escapeHtml: false,
    },
    // Try to disable SSR plugin loading by using custom locale detector
    // This might prevent SSR plugins from being registered
    experimental: {
      localeDetector: undefined, // Disable SSR locale detector
    },
    // Bundle configuration - ensure messages are included
    bundle: {
      compositionOnly: false,
      runtimeOnly: false,
      fullInstall: true,
      dropMessageCompiler: false,
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
        { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      categories: ['games', 'entertainment'],
    },
    workbox: {
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/(?!api\/)/],
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2,json}'],
      // Allow larger files in debug/development builds (unminified code with sourcemaps)
      maximumFileSizeToCacheInBytes: isDebugBuild || isDev ? 5 * 1024 * 1024 : 2 * 1024 * 1024,
      // Performance: Optimize cache strategies
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      // Runtime caching configuration
      // Note: Cache names are dynamically managed by pwa-cache-version.client.ts plugin
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
