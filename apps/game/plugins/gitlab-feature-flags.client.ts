import { UnleashClient } from 'unleash-proxy-client'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const logger = useLogger()

  // GitLab Feature Flags uses the Unleash protocol
  // URL format: https://gitlab.com/api/v4/feature_flags/unleash/:project_id
  const gitlabConfig = {
    url: config.public.gitlabFeatureFlagsUrl || '',
    clientKey: config.public.gitlabFeatureFlagsToken || '',
    appName: 'riddle-rush',
    environment: config.public.environment || 'development',
    refreshInterval: 30, // Refresh every 30 seconds
  }

  // Only initialize if both URL and token are configured
  if (!gitlabConfig.url || !gitlabConfig.clientKey) {
    if (import.meta.dev) {
      logger.warn(
        '[Feature Flags] GitLab Feature Flags not configured. Using fallback to local settings.'
      )
    }
    nuxtApp.provide('featureFlags', null)
    return
  }

  try {
    const unleashClient = new UnleashClient(gitlabConfig)

    // Handle errors
    unleashClient.on('error', (error: Error) => {
      logger.error('[Feature Flags] Error:', { error })
    })

    // Log when ready (only in dev)
    if (import.meta.dev) {
      unleashClient.on('ready', () => {
        logger.info('[Feature Flags] GitLab client ready')
      })
    }

    // Start the client
    unleashClient.start()

    // Make available globally
    nuxtApp.provide('featureFlags', unleashClient)
  } catch (error) {
    logger.error('[Feature Flags] Failed to initialize:', { error })
    nuxtApp.provide('featureFlags', null)
  }
})
