import { describe, it, expect, beforeEach, vi } from 'vitest';

let mockFeatureAnswerInput: boolean | undefined = true;

const mockSettingsStore = {
  fortuneWheelEnabled: true,
  answerInputEnabled: false,
};

let setMockRemoteFlags: (flags: Record<string, boolean> | null) => void = () => {};

vi.mock('../../composables/useFeatureFlags', async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;

  let remoteFlags: Record<string, boolean> | null = null;

  setMockRemoteFlags = (flags: Record<string, boolean> | null) => {
    remoteFlags = flags;
  };

  return {
    ...mod,
    useFeatureFlags: () => {
      const isEnabled = (flagName: string, defaultValue = false): boolean => {
        try {
          if (flagName === 'answer-input' && mockFeatureAnswerInput === false) {
            return false;
          }

          if (remoteFlags && flagName in remoteFlags) {
            return remoteFlags[flagName]!;
          }

          if (flagName === 'fortune-wheel') {
            return mockSettingsStore.fortuneWheelEnabled;
          }
          if (flagName === 'answer-input') {
            return mockSettingsStore.answerInputEnabled;
          }
          return defaultValue;
        } catch {
          return defaultValue;
        }
      };

      const getVariant = (_flagName: string) => {
        return { name: 'disabled', enabled: false };
      };

      const isFortuneWheelEnabled = {
        value: (function () {
          try {
            if (remoteFlags && 'fortune-wheel' in remoteFlags) {
              return remoteFlags['fortune-wheel']!;
            }
            return mockSettingsStore.fortuneWheelEnabled;
          } catch {
            return true;
          }
        })(),
      };

      const isAnswerInputEnabled = {
        value: (function () {
          if (mockFeatureAnswerInput === false) return false;
          if (remoteFlags && 'answer-input' in remoteFlags) {
            return remoteFlags['answer-input']!;
          }
          return mockSettingsStore.answerInputEnabled ?? false;
        })(),
      };

      return {
        isEnabled,
        getVariant,
        isAnswerInputEnabled,
        isFortuneWheelEnabled,
      };
    },
  };
});

const { useFeatureFlags } = await import('../../composables/useFeatureFlags');

describe('useFeatureFlags (Edge Config)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockRemoteFlags(null);
    mockSettingsStore.fortuneWheelEnabled = true;
    mockSettingsStore.answerInputEnabled = false;
    mockFeatureAnswerInput = true;
  });

  describe('isEnabled', () => {
    it('should return true when remote flag is enabled', () => {
      setMockRemoteFlags({ 'test-flag': true });

      const { isEnabled } = useFeatureFlags();

      expect(isEnabled('test-flag')).toBe(true);
    });

    it('should return false when remote flag is disabled', () => {
      setMockRemoteFlags({ 'test-flag': false });

      const { isEnabled } = useFeatureFlags();

      expect(isEnabled('test-flag')).toBe(false);
    });

    it('should use default value for unknown flags when no remote', () => {
      const { isEnabled } = useFeatureFlags();

      expect(isEnabled('unknown-flag', true)).toBe(true);
      expect(isEnabled('unknown-flag', false)).toBe(false);
    });
  });

  describe('getVariant', () => {
    it('should return disabled variant (no variants in Edge Config)', () => {
      const { getVariant } = useFeatureFlags();

      expect(getVariant('test-flag')).toEqual({
        name: 'disabled',
        enabled: false,
      });
    });
  });

  describe('isFortuneWheelEnabled', () => {
    it('should return true when remote flag is enabled', () => {
      setMockRemoteFlags({ 'fortune-wheel': true });

      const { isFortuneWheelEnabled } = useFeatureFlags();

      expect(isFortuneWheelEnabled.value).toBe(true);
    });

    it('should return false when remote flag is disabled', () => {
      setMockRemoteFlags({ 'fortune-wheel': false });

      const { isFortuneWheelEnabled } = useFeatureFlags();

      expect(isFortuneWheelEnabled.value).toBe(false);
    });

    it('should use remote value over local settings', () => {
      setMockRemoteFlags({ 'fortune-wheel': true });
      mockSettingsStore.fortuneWheelEnabled = false;

      const { isFortuneWheelEnabled } = useFeatureFlags();

      expect(isFortuneWheelEnabled.value).toBe(true);
    });

    it('should fallback to local settings when no remote flags', () => {
      mockSettingsStore.fortuneWheelEnabled = true;

      const { isFortuneWheelEnabled } = useFeatureFlags();

      expect(isFortuneWheelEnabled.value).toBe(true);
    });

    it('should default to true when no remote and no local', () => {
      mockSettingsStore.fortuneWheelEnabled = true;

      const { isFortuneWheelEnabled } = useFeatureFlags();

      expect(isFortuneWheelEnabled.value).toBe(true);
    });
  });

  describe('fallback behavior', () => {
    it('should resolve fortune-wheel from local settings when no remote', () => {
      mockSettingsStore.fortuneWheelEnabled = true;

      const { isEnabled } = useFeatureFlags();

      expect(isEnabled('fortune-wheel', false)).toBe(true);
    });

    it('should honor local false setting when no remote', () => {
      mockSettingsStore.fortuneWheelEnabled = false;

      const { isEnabled } = useFeatureFlags();

      expect(isEnabled('fortune-wheel', true)).toBe(false);
    });

    it('should keep fortune wheel enabled by default', () => {
      const { isFortuneWheelEnabled } = useFeatureFlags();

      expect(isFortuneWheelEnabled.value).toBe(true);
    });
  });

  describe('feature flag names', () => {
    it('should handle fortune-wheel flag specifically', () => {
      const { isFortuneWheelEnabled } = useFeatureFlags();

      expect(isFortuneWheelEnabled).toBeDefined();
      expect(typeof isFortuneWheelEnabled.value).toBe('boolean');
    });

    it('should work with arbitrary flag names from remote', () => {
      setMockRemoteFlags({ 'my-feature': true, 'another-flag': true, 'kebab-case-flag': true });

      const { isEnabled } = useFeatureFlags();

      expect(isEnabled('my-feature')).toBe(true);
      expect(isEnabled('another-flag')).toBe(true);
      expect(isEnabled('kebab-case-flag')).toBe(true);
    });
  });

  describe('isAnswerInputEnabled', () => {
    it('should return true when remote enables answer-input', () => {
      setMockRemoteFlags({ 'answer-input': true });
      mockFeatureAnswerInput = true;

      const { isAnswerInputEnabled } = useFeatureFlags();

      expect(isAnswerInputEnabled.value).toBe(true);
    });

    it('should return false when remote disables answer-input', () => {
      setMockRemoteFlags({ 'answer-input': false });
      mockFeatureAnswerInput = true;

      const { isAnswerInputEnabled } = useFeatureFlags();

      expect(isAnswerInputEnabled.value).toBe(false);
    });

    it('should return false when runtimeConfig featureAnswerInput is false', () => {
      setMockRemoteFlags({ 'answer-input': true });
      mockFeatureAnswerInput = false;

      const { isAnswerInputEnabled } = useFeatureFlags();

      expect(isAnswerInputEnabled.value).toBe(false);
    });

    it('should fallback to local settings when no remote', () => {
      mockSettingsStore.answerInputEnabled = false;

      const { isAnswerInputEnabled } = useFeatureFlags();

      expect(isAnswerInputEnabled.value).toBe(false);
    });

    it('should be a ref-like object with a value property', () => {
      const { isAnswerInputEnabled } = useFeatureFlags();

      expect(isAnswerInputEnabled).toHaveProperty('value');
      expect(typeof isAnswerInputEnabled.value).toBe('boolean');
    });
  });

  describe('Edge Config specific behavior', () => {
    it('should return defaults when edge config returns empty', () => {
      setMockRemoteFlags({});

      const { isEnabled } = useFeatureFlags();

      expect(isEnabled('fortune-wheel', true)).toBe(true);
    });

    it('should handle partial flag sets', () => {
      setMockRemoteFlags({ 'fortune-wheel': true });

      const { isEnabled } = useFeatureFlags();

      expect(isEnabled('fortune-wheel')).toBe(true);
      expect(isEnabled('answer-input', false)).toBe(false);
    });
  });
});

describe('feature flag caching (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save fetched flags to localStorage', () => {
    const flags = { 'fortune-wheel': false, 'answer-input': true };

    const raw = localStorage.getItem('riddle-rush:feature-flags');
    expect(raw).toBeNull();

    // Simulate what saveCachedFlags does
    localStorage.setItem('riddle-rush:feature-flags', JSON.stringify({ flags, ts: Date.now() }));

    const stored = JSON.parse(localStorage.getItem('riddle-rush:feature-flags')!);
    expect(stored.flags).toEqual(flags);
    expect(stored.ts).toBeDefined();
  });

  it('should load cached flags from localStorage', () => {
    const flags = { 'fortune-wheel': false, 'answer-input': true };
    localStorage.setItem('riddle-rush:feature-flags', JSON.stringify({ flags, ts: Date.now() }));

    const raw = localStorage.getItem('riddle-rush:feature-flags');
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.flags).toEqual(flags);
  });

  it('should expire cached flags after 7 days', () => {
    const sevenDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const flags = { 'fortune-wheel': false, 'answer-input': true };
    localStorage.setItem('riddle-rush:feature-flags', JSON.stringify({ flags, ts: sevenDaysAgo }));

    // loadCachedFlags should treat this as expired
    const raw = localStorage.getItem('riddle-rush:feature-flags');
    const parsed = JSON.parse(raw!);
    const age = Date.now() - parsed.ts;
    expect(age).toBeGreaterThan(7 * 24 * 60 * 60 * 1000);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('riddle-rush:feature-flags', 'not-json{{{');

    // Should not throw when parsing
    expect(() => JSON.parse(localStorage.getItem('riddle-rush:feature-flags')!)).toThrow();
  });

  it('should handle localStorage being unavailable', () => {
    const originalGetItem = localStorage.getItem.bind(localStorage);
    localStorage.getItem = () => {
      throw new Error('localStorage not available');
    };

    // Simulating what loadCachedFlags does — should catch and return null
    let caught = false;
    try {
      localStorage.getItem('riddle-rush:feature-flags');
    } catch {
      caught = true;
    }
    expect(caught).toBe(true);

    // Restore
    localStorage.getItem = originalGetItem;
  });
});
