/**
 * Environment Configuration Helper
 * Manages environment-specific settings based on STAGE variable
 */

export type Stage = 'development' | 'production' | 'preview'

export interface EnvironmentConfig {
  stage: Stage
  isDevelopment: boolean
  isProduction: boolean
  isPreview: boolean
  apiUrl: string
  analyticsEnabled: boolean
  debugEnabled: boolean
  pwaEnabled: boolean
  baseUrl: string
}

/**
 * Get the current deployment stage
 */
export function getStage(): Stage {
  const stage = process.env.STAGE || process.env.VERCEL_ENV || 'development'

  // Map Vercel environments to our stages
  if (stage === 'production' || stage === 'prod') return 'production'
  if (stage === 'preview') return 'preview'
  return 'development'
}

/**
 * Get environment configuration based on current stage
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const stage = getStage()
  const isDevelopment = stage === 'development'
  const isProduction = stage === 'production'
  const isPreview = stage === 'preview'

  // Get base URL from environment or use defaults
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const baseUrl =
    process.env.NUXT_PUBLIC_SITE_URL ||
    (isProduction
      ? 'https://riddle-rush.vercel.app'
      : isPreview
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000')
=======
=======
>>>>>>> Stashed changes
  const baseUrl
    = process.env.NUXT_PUBLIC_SITE_URL
      || (isProduction
        ? 'https://riddle-rush.vercel.app'
        : isPreview
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000');
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

  return {
    stage,
    isDevelopment,
    isProduction,
    isPreview,
    baseUrl,
    apiUrl: process.env.API_URL || `${baseUrl}/api`,
    analyticsEnabled: isProduction || process.env.ENABLE_ANALYTICS === 'true',
    debugEnabled: !isProduction || process.env.ENABLE_DEBUG_PANEL === 'true',
    pwaEnabled: isProduction || process.env.ENABLE_PWA === 'true',
  }
}

/**
 * Log current environment configuration (only in development)
 */
export function logEnvironment(): void {
  const config = getEnvironmentConfig()

  if (config.isDevelopment || config.debugEnabled) {
    console.log('🚀 Environment Configuration:')
    console.log('  Stage:', config.stage)
    console.log('  Base URL:', config.baseUrl)
    console.log('  Analytics:', config.analyticsEnabled ? '✅' : '❌')
    console.log('  Debug Panel:', config.debugEnabled ? '✅' : '❌')
    console.log('  PWA:', config.pwaEnabled ? '✅' : '❌')
  }
}
