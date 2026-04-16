import type { UnleashClient } from 'unleash-proxy-client';
import { useSettingsStore } from '~/stores/settingsStore';

/**
 * Module-level reactive bridge between the Unleash EventEmitter and Vue's
 * reactivity system. Lives for the full module/app lifetime — intentional for
 * a SPA where the Unleash client is initialized once at startup.
 *
 * Increments on every Unleash `update`/`ready` event. Computed properties
 * that read this ref will re-evaluate when flags change.
 */
const flagVersion = ref(0);
let attachedClient: UnleashClient | null = null;

// Stable reference so the same function can be passed to both on() and off()
const bump = () => {
  flagVersion.value++;
};

/**
 * Attach Unleash event listeners that bridge into Vue reactivity.
 * Idempotent per client instance — safe to call multiple times.
 * Cleans up listeners from previous client on replacement (HMR).
 * Should be called from the plugin before `client.start()` to avoid
 * missing the initial `ready` event.
 */
export function attachUnleashListener(client: UnleashClient) {
  if (attachedClient === client) return;

  // Clean up listeners from the previous client instance
  if (attachedClient) {
    attachedClient.off('update', bump);
    attachedClient.off('ready', bump);
  }

  attachedClient = client;
  client.on('update', bump);
  client.on('ready', bump);
}

/**
 * Composable for accessing GitLab Feature Flags
 * GitLab Feature Flags uses the Unleash protocol
 */
export function useFeatureFlags() {
  const { $featureFlags } = useNuxtApp();
  const gitlabClient = $featureFlags as UnleashClient | null;

  const config = useRuntimeConfig();

  const logger = useLogger();

  type ManagedFlag = 'fortune-wheel' | 'answer-input';
  type SettingsFlagKey = 'fortuneWheelEnabled' | 'answerInputEnabled';

  interface ResolveManagedFlagOptions {
    flagName: ManagedFlag;
    settingsKey: SettingsFlagKey;
    defaultValue: boolean;
    runtimeForceDisabled?: boolean;
  }

  /**
   * Single feature-flag resolution contract used by all managed flags.
   *
   * Precedence (highest to lowest):
   * 1) Runtime force-disable (only for answer-input, via featureAnswerInput=false)
   * 2) GitLab/Unleash (authoritative when client is configured)
   * 3) Local persisted settings store (fallback when GitLab is unavailable)
   * 4) Static default (safety fallback for unexpected states/errors)
   */
  const resolveManagedFlag = ({
    flagName,
    settingsKey,
    defaultValue,
    runtimeForceDisabled = false,
  }: ResolveManagedFlagOptions): boolean => {
    if (runtimeForceDisabled) {
      return false;
    }

    try {
      if (gitlabClient) {
        return gitlabClient.isEnabled(flagName);
      }

      const localValue = useSettingsStore()[settingsKey];
      return typeof localValue === 'boolean' ? localValue : defaultValue;
    } catch (error) {
      logger.warn(`Failed to resolve feature flag ${flagName}:`, error);
      return defaultValue;
    }
  };

  // Lazy fallback: attach listener if the plugin didn't already
  if (gitlabClient) {
    attachUnleashListener(gitlabClient);
  }

  /**
   * Check if a feature flag is enabled.
   *
   * NOTE: This is a plain function, not a reactive computed. Calling it
   * inside a Vue `computed()` will NOT automatically re-evaluate when
   * Unleash updates. For reactive flag values, use the named computeds
   * (isFortuneWheelEnabled, isAnswerInputEnabled).
   */
  const isEnabled = (flagName: string, defaultValue = false): boolean => {
    if (flagName === 'fortune-wheel') {
      return resolveManagedFlag({
        flagName,
        settingsKey: 'fortuneWheelEnabled',
        defaultValue,
      });
    }

    if (flagName === 'answer-input') {
      return resolveManagedFlag({
        flagName,
        settingsKey: 'answerInputEnabled',
        defaultValue,
        // Runtime config override is intentionally supported only for answer input,
        // so E2E/dev can hard-disable this UI path regardless of remote/local flags.
        runtimeForceDisabled: config.public.featureAnswerInput === false,
      });
    }

    try {
      if (gitlabClient) {
        return gitlabClient.isEnabled(flagName);
      }
    } catch (error) {
      logger.warn(`Failed to check feature flag ${flagName}:`, error);
    }

    return defaultValue;
  };

  /**
   * Get variant for a feature flag
   */
  const getVariant = (flagName: string) => {
    if (!gitlabClient) {
      return { name: 'disabled', enabled: false };
    }

    try {
      return gitlabClient.getVariant(flagName);
    } catch (error) {
      logger.warn(`Failed to get variant for ${flagName}:`, error);
      return { name: 'disabled', enabled: false };
    }
  };

  /**
   * Check if fortune wheel feature is enabled
   */
  const isFortuneWheelEnabled = computed(() => {
    void flagVersion.value; // reactive dependency: re-run when flags update
    return isEnabled('fortune-wheel', true);
  });

  /**
   * Check if answer input feature is enabled
   */
  const isAnswerInputEnabled = computed(() => {
    void flagVersion.value; // reactive dependency: re-run when flags update
    return isEnabled('answer-input', false);
  });

  return {
    isEnabled,
    getVariant,
    isAnswerInputEnabled,
    isFortuneWheelEnabled,
  };
}
