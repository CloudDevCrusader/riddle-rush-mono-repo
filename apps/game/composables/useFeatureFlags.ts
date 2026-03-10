import type { UnleashClient } from 'unleash-proxy-client'

/**
 * Module-level reactive bridge between the Unleash EventEmitter and Vue's
 * reactivity system. Lives for the full module/app lifetime — intentional for
 * a SPA where the Unleash client is initialized once at startup.
 *
 * Increments on every Unleash `update`/`ready` event. Computed properties
 * that read this ref will re-evaluate when flags change.
 */
const flagVersion = ref(0)
let attachedClient: UnleashClient | null = null

/**
 * Attach Unleash event listeners that bridge into Vue reactivity.
 * Idempotent per client instance — safe to call multiple times.
 * Should be called from the plugin before `client.start()` to avoid
 * missing the initial `ready` event.
 */
export function attachUnleashListener(client: UnleashClient) {
  if (attachedClient === client) return
  attachedClient = client

  const bump = () => {
    flagVersion.value++
  }
  client.on('update', bump)
  client.on('ready', bump)
}

/**
 * Composable for accessing GitLab Feature Flags
 * GitLab Feature Flags uses the Unleash protocol
 */
export function useFeatureFlags() {
  const { $featureFlags } = useNuxtApp()
  const gitlabClient = $featureFlags as UnleashClient | null

  const config = useRuntimeConfig()

  // Lazy fallback: attach listener if the plugin didn't already
  if (gitlabClient) {
    attachUnleashListener(gitlabClient)
  }

  /**
   * Check if a feature flag is enabled.
   *
   * NOTE: This is a plain function, not a reactive computed. Calling it
   * inside a Vue `computed()` will NOT automatically re-evaluate when
   * Unleash updates. For reactive flag values, use the named computeds
   * (isFortuneWheelEnabled, isAnswerInputEnabled, isWebSocketEnabled).
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
      if (flagName === 'answer-input') {
        return settingsStore.answerInputEnabled
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
    void flagVersion.value // reactive dependency: re-run when flags update

    // GitLab is authoritative when available
    if (gitlabClient) {
      return isEnabled('fortune-wheel', false)
    }

    // Only use local settings when no GitLab client is configured
    const settingsStore = useSettingsStore()
    return settingsStore.fortuneWheelEnabled
  })

  /**
   * Check if answer input feature is enabled
   */
  const isAnswerInputEnabled = computed(() => {
    void flagVersion.value // reactive dependency: re-run when flags update

    // Runtime config boolean takes precedence
    if (config.public.featureAnswerInput === false) {
      return false
    }

    // GitLab is authoritative when available
    if (gitlabClient) {
      return isEnabled('answer-input', true)
    }

    // Only use local settings when no GitLab client is configured
    const settingsStore = useSettingsStore()
    return settingsStore.answerInputEnabled
  })

  /**
   * Check if WebSocket feature is enabled
   */
  const isWebSocketEnabled = computed(() => {
    void flagVersion.value // reactive dependency: re-run when flags update

    // GitLab is authoritative when available
    if (gitlabClient) {
      return isEnabled('websocket', false)
    }

    // Only use local settings when no GitLab client is configured
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
