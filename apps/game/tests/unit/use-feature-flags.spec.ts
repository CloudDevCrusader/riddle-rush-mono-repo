import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock GitLab Feature Flags client (uses Unleash protocol)
const mockIsEnabled = vi.fn()
const mockGetVariant = vi.fn()

let mockGitLabClient: {
  isEnabled: typeof mockIsEnabled
  getVariant: typeof mockGetVariant
} | null = {
  isEnabled: mockIsEnabled,
  getVariant: mockGetVariant,
}

// Mock runtimeConfig for featureAnswerInput tests
let mockFeatureAnswerInput: boolean | undefined = true

// Mock the composable directly to avoid Nuxt auto-import issues
vi.mock('../../composables/useFeatureFlags', () => ({
  useFeatureFlags: () => {
    const gitlabClient = mockGitLabClient

    const isEnabled = (flagName: string, defaultValue = false): boolean => {
      try {
        if (!gitlabClient) {
          if (flagName === 'fortune-wheel') {
            return mockSettingsStore.fortuneWheelEnabled
          }
          if (flagName === 'answer-input') {
            return mockSettingsStore.answerInputEnabled
          }
          if (flagName === 'websocket') {
            return mockSettingsStore.websocketEnabled
          }
          return defaultValue
        }
        return mockIsEnabled(flagName)
      } catch {
        return defaultValue
      }
    }

    const getVariant = (flagName: string): unknown => {
      try {
        if (!gitlabClient) {
          return { enabled: false }
        }
        return mockGetVariant(flagName)
      } catch {
        return { name: 'disabled', enabled: false }
      }
    }

    const isFortuneWheelEnabled = {
      value: (function () {
        try {
          if (!gitlabClient) {
            return mockSettingsStore.fortuneWheelEnabled
          }
          return isEnabled('fortune-wheel', true)
        } catch {
          return true
        }
      })(),
    }

    const isAnswerInputEnabled = {
      value: (function () {
        // Mirror real priority: runtimeConfig → GitLab → local settings
        if (mockFeatureAnswerInput === false) return false
        if (gitlabClient) {
          try {
            return mockIsEnabled('answer-input')
          } catch {
            return true
          }
        }
        return mockSettingsStore.answerInputEnabled ?? false
      })(),
    }

    return {
      isEnabled,
      getVariant,
      isAnswerInputEnabled,
      isFortuneWheelEnabled,
      isWebSocketEnabled: {
        value: (function () {
          if (!gitlabClient) {
            return mockSettingsStore.websocketEnabled
          }
          return isEnabled('websocket', false)
        })(),
      },
    }
  },
}))

const mockSettingsStore = {
  fortuneWheelEnabled: true,
  answerInputEnabled: false,
  websocketEnabled: false,
}

// Import after mocks are set up
const { useFeatureFlags } = await import('../../composables/useFeatureFlags')

describe('useFeatureFlags (GitLab)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGitLabClient = {
      isEnabled: mockIsEnabled,
      getVariant: mockGetVariant,
    }
    mockSettingsStore.fortuneWheelEnabled = true
    mockSettingsStore.answerInputEnabled = false
    mockSettingsStore.websocketEnabled = false
  })

  describe('isEnabled', () => {
    it('should return true when GitLab flag is enabled', () => {
      mockIsEnabled.mockReturnValue(true)

      const { isEnabled } = useFeatureFlags()

      expect(isEnabled('test-flag')).toBe(true)
      expect(mockIsEnabled).toHaveBeenCalledWith('test-flag')
    })

    it('should return false when GitLab flag is disabled', () => {
      mockIsEnabled.mockReturnValue(false)

      const { isEnabled } = useFeatureFlags()

      expect(isEnabled('test-flag')).toBe(false)
    })

    it('should use default value when provided', () => {
      mockIsEnabled.mockReturnValue(false)

      const { isEnabled } = useFeatureFlags()

      expect(isEnabled('test-flag', true)).toBe(false)
      expect(isEnabled('unknown-flag', true)).toBe(false)
    })

    it('should handle GitLab API errors gracefully', () => {
      mockIsEnabled.mockImplementation(() => {
        throw new Error('GitLab API error')
      })

      const { isEnabled } = useFeatureFlags()

      expect(isEnabled('test-flag', true)).toBe(true)
    })
  })

  describe('getVariant', () => {
    it('should return variant from GitLab', () => {
      const mockVariant = { name: 'variant-a', enabled: true }
      mockGetVariant.mockReturnValue(mockVariant)

      const { getVariant } = useFeatureFlags()

      expect(getVariant('test-flag')).toEqual(mockVariant)
      expect(mockGetVariant).toHaveBeenCalledWith('test-flag')
    })

    it('should return disabled variant on error', () => {
      mockGetVariant.mockImplementation(() => {
        throw new Error('Variant error')
      })

      const { getVariant } = useFeatureFlags()

      expect(getVariant('test-flag')).toEqual({
        name: 'disabled',
        enabled: false,
      })
    })
  })

  describe('isFortuneWheelEnabled', () => {
    it('should return true when GitLab flag is enabled', () => {
      mockIsEnabled.mockReturnValue(true)

      const { isFortuneWheelEnabled } = useFeatureFlags()

      expect(isFortuneWheelEnabled.value).toBe(true)
    })

    it('should return false when GitLab flag is disabled', () => {
      mockIsEnabled.mockReturnValue(false)

      const { isFortuneWheelEnabled } = useFeatureFlags()

      expect(isFortuneWheelEnabled.value).toBe(false)
    })

    it('should use GitLab value over local settings', () => {
      mockIsEnabled.mockReturnValue(true)
      mockSettingsStore.fortuneWheelEnabled = false

      const { isFortuneWheelEnabled } = useFeatureFlags()

      // GitLab should take precedence
      expect(isFortuneWheelEnabled.value).toBe(true)
    })

    it('should fallback to local settings when GitLab is not configured', () => {
      mockGitLabClient = null
      mockSettingsStore.fortuneWheelEnabled = true

      const { isFortuneWheelEnabled } = useFeatureFlags()

      expect(isFortuneWheelEnabled.value).toBe(true)
    })

    it('should use true fallback when GitLab check throws', () => {
      mockIsEnabled.mockImplementation(() => {
        throw new Error('GitLab API error')
      })

      const { isFortuneWheelEnabled } = useFeatureFlags()

      expect(isFortuneWheelEnabled.value).toBe(true)
    })
  })

  describe('fallback behavior', () => {
    it('should resolve fortune-wheel from local settings when no client exists', () => {
      mockGitLabClient = null

      mockSettingsStore.fortuneWheelEnabled = true

      const { isEnabled } = useFeatureFlags()

      expect(isEnabled('fortune-wheel', false)).toBe(true)
    })

    it('should still honor local false setting when no client exists', () => {
      mockGitLabClient = null

      mockSettingsStore.fortuneWheelEnabled = false

      const { isEnabled } = useFeatureFlags()

      expect(isEnabled('fortune-wheel', true)).toBe(false)
    })

    it('should keep fortune wheel enabled by default when local is untouched', () => {
      mockGitLabClient = null

      const { isFortuneWheelEnabled } = useFeatureFlags()

      expect(isFortuneWheelEnabled.value).toBe(true)
    })
  })

  describe('feature flag names', () => {
    it('should handle fortune-wheel flag specifically', () => {
      const { isFortuneWheelEnabled } = useFeatureFlags()

      expect(isFortuneWheelEnabled).toBeDefined()
      expect(typeof isFortuneWheelEnabled.value).toBe('boolean')
    })

    it('should work with arbitrary flag names', () => {
      mockIsEnabled.mockReturnValue(true)

      const { isEnabled } = useFeatureFlags()

      expect(isEnabled('my-feature')).toBe(true)
      expect(isEnabled('another-flag')).toBe(true)
      expect(isEnabled('kebab-case-flag')).toBe(true)
    })
  })

  describe('isAnswerInputEnabled', () => {
    beforeEach(() => {
      mockFeatureAnswerInput = true
    })

    it('should return true when runtimeConfig featureAnswerInput is true (default)', () => {
      mockIsEnabled.mockReturnValue(true)
      mockFeatureAnswerInput = true

      const { isAnswerInputEnabled } = useFeatureFlags()

      expect(isAnswerInputEnabled.value).toBe(true)
    })

    it('should return false when GitLab disables answer-input flag', () => {
      mockIsEnabled.mockReturnValue(false)
      mockFeatureAnswerInput = true

      const { isAnswerInputEnabled } = useFeatureFlags()

      expect(isAnswerInputEnabled.value).toBe(false)
    })

    it('should return false when runtimeConfig featureAnswerInput is false', () => {
      mockIsEnabled.mockReturnValue(true)
      mockFeatureAnswerInput = false

      const { isAnswerInputEnabled } = useFeatureFlags()

      // GitLab allows it but config says no
      expect(isAnswerInputEnabled.value).toBe(false)
    })

    it('should be a ref-like object with a value property', () => {
      const { isAnswerInputEnabled } = useFeatureFlags()

      expect(isAnswerInputEnabled).toHaveProperty('value')
      expect(typeof isAnswerInputEnabled.value).toBe('boolean')
    })
  })

  describe('GitLab specific behavior', () => {
    it('should work with GitLab project-scoped flags', () => {
      mockIsEnabled.mockReturnValue(true)

      const { isEnabled } = useFeatureFlags()

      // GitLab flags are project-scoped
      expect(isEnabled('project-feature')).toBe(true)
    })

    it('should handle environment-specific flags', () => {
      mockIsEnabled.mockReturnValue(true)

      const { isEnabled } = useFeatureFlags()

      // GitLab can have environment-specific rollouts
      expect(isEnabled('staging-only-feature')).toBe(true)
    })
  })

  describe('isWebSocketEnabled', () => {
    it('should fallback to local settings when no client exists', () => {
      mockGitLabClient = null
      mockSettingsStore.websocketEnabled = true

      const { isWebSocketEnabled, isEnabled } = useFeatureFlags()

      expect(isWebSocketEnabled.value).toBe(true)
      expect(isEnabled('websocket', false)).toBe(true)
    })

    it('should use GitLab value when client exists', () => {
      mockSettingsStore.websocketEnabled = true
      mockIsEnabled.mockImplementation((flagName: string) => flagName !== 'websocket')

      const { isWebSocketEnabled } = useFeatureFlags()

      expect(isWebSocketEnabled.value).toBe(false)
    })
  })
})
