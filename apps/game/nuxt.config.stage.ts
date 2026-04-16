// apps/game/nuxt.config.stage.ts
// Import this in your main nuxt.config.ts to handle stage-specific configuration

/**
 * Get stage-specific Nuxt configuration
 */
export function getStageConfig() {
  const stage = process.env.STAGE || process.env.VERCEL_ENV || 'development'
  const isProduction = stage === 'production'
  const isDevelopment = stage === 'development'
  const isPreview = stage === 'preview'

  // Determine base URL based on stage
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const baseUrl =
    process.env.NUXT_PUBLIC_SITE_URL ||
    (isProduction
      ? 'https://riddle-rush.vercel.app'
      : isPreview && process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000')
=======
=======
>>>>>>> Stashed changes
  const baseUrl
    = process.env.NUXT_PUBLIC_SITE_URL
      || (isProduction
        ? 'https://riddle-rush.vercel.app'
        : isPreview && process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000');
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

  return {
    // Runtime config that can be overridden by environment variables
    runtimeConfig: {
      public: {
        stage,
        isProduction,
        isDevelopment,
        isPreview,
        siteUrl: baseUrl,
        // Feature flags based on stage
        enableAnalytics: isProduction || process.env.ENABLE_ANALYTICS === 'true',
        enableDebugPanel: !isProduction || process.env.ENABLE_DEBUG_PANEL === 'true',
        enablePwa: isProduction || process.env.ENABLE_PWA === 'true',
        // Analytics
        googleAnalyticsId:
          process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_ID || process.env.GOOGLE_ANALYTICS_ID || '',
      },
    },

    // App configuration
    app: {
      head: {
        title: isProduction ? 'Riddle Rush' : `Riddle Rush (${stage})`,
        htmlAttrs: {
          'lang': 'en',
          'data-stage': stage,
        },
      },
    },

    // Nitro preset based on deployment target
    nitro: {
      preset: process.env.NITRO_PRESET || 'vercel-static',
      // Stage-specific headers
      routeRules: {
        '/**': {
          headers: {
            'X-Stage': stage,
            ...(isProduction
              ? {
                  'X-Robots-Tag': 'index, follow',
                }
              : {
                  'X-Robots-Tag': 'noindex, nofollow',
                }),
          },
        },
      },
    },

    // Development tools
    devtools: {
      enabled: isDevelopment || isPreview,
    },

    // Source maps for debugging
    sourcemap: {
      server: !isProduction,
      client: !isProduction,
    },

    // Telemetry based on stage
    telemetry: isProduction ? false : true,
  }
}

/**
 * Helper to log current stage configuration
 */
export function logStageInfo() {
  const stage = process.env.STAGE || 'development'
  const vercelEnv = process.env.VERCEL_ENV
  const nodeEnv = process.env.NODE_ENV

  console.log('🚀 Stage Configuration:')
  console.log(`  STAGE: ${stage}`)
  console.log(`  NODE_ENV: ${nodeEnv}`)
  console.log(`  VERCEL_ENV: ${vercelEnv || 'not set'}`)
  console.log(`  Build Mode: ${stage === 'production' ? 'Optimized' : 'Debug'}`)
}
