import type { UnleashClient } from 'unleash-proxy-client'

/**
 * Composable for accessing GitLab Feature Flags
 * GitLab Feature Flags uses the Unleash protocol
 */
export function useFeatureFlags() {
  const { $featureFlags } = useNuxtApp()
  const gitlabClient = $featureFlags as UnleashClient | null

  /**
   * Check if a feature flag is enabled
   */
  const isEnabled = (flagName: string, defaultValue = false): boolean => {
    if (!gitlabClient) {
      // Fallback to local setting if GitLab is not configured
      const settingsStore = useSettingsStore()
      if (flagName === 'fortune-wheel') {
        return settingsStore.fortuneWheelEnabled
      }
      if (flagName === 'websocket') {
        return settingsStore.websocketEnabled
      }
      return defaultValue
    }

    try {
      return gitlabClient.isEnabled(flagName)
    } catch (error) {
      const logger = useLogger()
      logger.warn(`Failed to check feature flag ${flagName}:`, error)
      return defaultValue
    }
  }

  /**
   * Get variant for a feature flag
   */
  const getVariant = (flagName: string) => {
    if (!gitlabClient) {
      return { name: 'disabled', enabled: false }
    }

    try {
      return gitlabClient.getVariant(flagName)
    } catch (error) {
      const logger = useLogger()
      logger.warn(`Failed to get variant for ${flagName}:`, error)
      return { name: 'disabled', enabled: false }
    }
  }

  /**
   * Check if fortune wheel feature is enabled
   */
  const isFortuneWheelEnabled = computed(() => {
    // First check GitLab Feature Flags
    if (gitlabClient) {
      const gitlabEnabled = isEnabled('fortune-wheel', false)
      if (gitlabEnabled) return true
    }

    // Fallback to local settings
    const settingsStore = useSettingsStore()
    return settingsStore.fortuneWheelEnabled
  })

  /**
   * Check if WebSocket feature is enabled
   */
  const isWebSocketEnabled = computed(() => {
    // First check GitLab Feature Flags
    if (gitlabClient) {
      const gitlabEnabled = isEnabled('websocket', false)
      if (gitlabEnabled) return true
    }

    // Fallback to local settings
    const settingsStore = useSettingsStore()
    return settingsStore.websocketEnabled
  })

  return {
    isEnabled,
    getVariant,
    isFortuneWheelEnabled,
    isWebSocketEnabled,
  }
}
