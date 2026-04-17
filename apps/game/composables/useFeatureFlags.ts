import { useSettingsStore } from '~/stores/settingsStore';

const POLL_INTERVAL_MS = 30_000;
const CACHE_KEY = 'riddle-rush:feature-flags';

const DEFAULT_FLAGS: Record<string, boolean> = {
  'fortune-wheel': true,
  'answer-input': false,
};

const flagVersion = ref(0);
let pollTimer: ReturnType<typeof setInterval> | null = null;
let remoteFlags: Record<string, boolean> | null = null;

const bump = () => {
  flagVersion.value++;
};

function loadCachedFlags(): Record<string, boolean> | null {
  if (!import.meta.client) return null;

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { flags: Record<string, boolean>; ts: number };
    const age = Date.now() - parsed.ts;

    if (age > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return { ...DEFAULT_FLAGS, ...parsed.flags };
  } catch {
    return null;
  }
}

function saveCachedFlags(flags: Record<string, boolean>) {
  if (!import.meta.client) return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ flags, ts: Date.now() }));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function useFeatureFlags() {
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
      if (remoteFlags && flagName in remoteFlags) {
        return remoteFlags[flagName]!;
      }

      const localValue = useSettingsStore()[settingsKey];
      return typeof localValue === 'boolean' ? localValue : defaultValue;
    } catch (error) {
      logger.warn(`Failed to resolve feature flag ${flagName}:`, error);
      return defaultValue;
    }
  };

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
        runtimeForceDisabled: config.public.featureAnswerInput === false,
      });
    }

    try {
      if (remoteFlags && flagName in remoteFlags) {
        return remoteFlags[flagName]!;
      }
    } catch (error) {
      logger.warn(`Failed to check feature flag ${flagName}:`, error);
    }

    return defaultValue;
  };

  const getVariant = (_flagName: string) => {
    return { name: 'disabled', enabled: false };
  };

  const isFortuneWheelEnabled = computed(() => {
    void flagVersion.value;
    return isEnabled('fortune-wheel', true);
  });

  const isAnswerInputEnabled = computed(() => {
    void flagVersion.value;
    return isEnabled('answer-input', false);
  });

  return {
    isEnabled,
    getVariant,
    isAnswerInputEnabled,
    isFortuneWheelEnabled,
  };
}

async function fetchFlags(baseUrl: string) {
  try {
    const url = `${baseUrl}api/flags`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    return (data?.flags as Record<string, boolean>) || null;
  } catch {
    return null;
  }
}

export function useFeatureFlagsInit() {
  const config = useRuntimeConfig();
  const logger = useLogger();
  const { baseUrl } = config.public;

  if (import.meta.client) {
    onMounted(async () => {
      const cached = loadCachedFlags();
      if (cached) {
        remoteFlags = cached;
        bump();
        logger.debug('[Feature Flags] Restored from cache:', cached);
      }

      const fresh = await fetchFlags(baseUrl);
      if (fresh) {
        remoteFlags = fresh;
        saveCachedFlags(fresh);
        bump();
        logger.debug('[Feature Flags] Fetched from Edge Config:', fresh);
      } else if (!cached) {
        logger.info('[Feature Flags] /api/flags unreachable — using defaults and local settings');
      }

      pollTimer = setInterval(async () => {
        const updated = await fetchFlags(baseUrl);
        if (updated) {
          const prev = remoteFlags;
          remoteFlags = updated;
          saveCachedFlags(updated);
          bump();
          const changed = Object.entries(updated).filter(([k, v]) => prev?.[k] !== v);
          if (changed.length > 0) {
            logger.debug('[Feature Flags] Updated from Edge Config:', Object.fromEntries(changed));
          }
        }
      }, POLL_INTERVAL_MS);
    });

    onScopeDispose(() => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    });

    if (import.meta.dev) {
      logger.debug('[Feature Flags] Polling /api/flags every 30s');
    }
  }
}
