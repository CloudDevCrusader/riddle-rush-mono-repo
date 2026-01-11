import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock GitLab Feature Flags client (uses Unleash protocol)
const mockIsEnabled = vi.fn()
const mockGetVariant = vi.fn()

const mockGitLabClient = {
  isEnabled: mockIsEnabled,
  getVariant: mockGetVariant,
}

// Mock useNuxtApp before importing the composable
vi.mock('#imports', () => ({
  useNuxtApp: () => ({
    $featureFlags: mockGitLabClient,
  }),
}))

// Also mock the direct import path
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $featureFlags: mockGitLabClient,
  }),
}))

// Import after mocks are set up
const { useFeatureFlags } = await import('../../composables/useFeatureFlags')

describe('useFeatureFlags (GitLab)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
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

      // Fallback to settings store (which defaults to false)
      expect(isFortuneWheelEnabled.value).toBe(false)
    })

    it('should use GitLab value over local settings', () => {
      mockIsEnabled.mockReturnValue(true)
      const settingsStore = useSettingsStore()
      settingsStore.fortuneWheelEnabled = false

      const { isFortuneWheelEnabled } = useFeatureFlags()

      // GitLab should take precedence
      expect(isFortuneWheelEnabled.value).toBe(true)
    })

    it('should fallback to local settings when GitLab is disabled', () => {
      mockIsEnabled.mockReturnValue(false)
      const settingsStore = useSettingsStore()
      settingsStore.fortuneWheelEnabled = true

      const { isFortuneWheelEnabled } = useFeatureFlags()

      expect(isFortuneWheelEnabled.value).toBe(true)
    })
  })

  describe('fallback behavior', () => {
    it('should use local settings when GitLab is not configured', () => {
      // Mock GitLab client as null
      vi.mock('#app', () => ({
        useNuxtApp: () => ({
          $featureFlags: null,
        }),
      }))

      const settingsStore = useSettingsStore()
      settingsStore.fortuneWheelEnabled = true

      const { isEnabled } = useFeatureFlags()

      expect(isEnabled('fortune-wheel', false)).toBe(true)
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
})
