import type { UnleashClient } from 'unleash-proxy-client'

/**
 * Composable for accessing GitLab Feature Flags
 * GitLab Feature Flags uses the Unleash protocol
 */
export function useFeatureFlags() {
  const { $featureFlags } = useNuxtApp()
  const gitlabClient = $featureFlags as UnleashClient | null

  const config = useRuntimeConfig()

  /**
   * Check if a feature flag is enabled
   */
  const isEnabled = (flagName: string, defaultValue = false): boolean => {
    // Priority: runtime config overrides → GitLab → local settings → default
    try {
      if (gitlabClient) {
        return gitlabClient.isEnabled(flagName)
      }

      const settingsStore = useSettingsStore()
      if (flagName === 'fortune-wheel') {
        return settingsStore.fortuneWheelEnabled
      }
      if (flagName === 'websocket') {
        return settingsStore.websocketEnabled
      }
    } catch (error) {
      const logger = useLogger()
      logger.warn(`Failed to check feature flag ${flagName}:`, error)
    }

    return defaultValue
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
   * Check if answer input feature is enabled
   */
  const isAnswerInputEnabled = computed(() => {
    // Runtime config boolean takes precedence
    if (config.public.featureAnswerInput === false) {
      return false
    }

    if (gitlabClient) {
      const gitlabEnabled = isEnabled('answer-input', true)
      if (!gitlabEnabled) return false
    }

    return true
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
    isAnswerInputEnabled,
    isFortuneWheelEnabled,
    isWebSocketEnabled,
  }
}
