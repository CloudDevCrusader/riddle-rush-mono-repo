import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UnleashClient } from 'unleash-proxy-client'

const mockUseNuxtApp = vi.fn()
const mockUseRuntimeConfig = vi.fn()
const mockWarn = vi.fn()

vi.stubGlobal('useNuxtApp', mockUseNuxtApp)
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)
vi.stubGlobal('useLogger', () => ({ warn: mockWarn }))

const mockSettingsState = {
  fortuneWheelEnabled: true,
  answerInputEnabled: false,
  websocketEnabled: false,
}

vi.mock('~/stores/settingsStore', () => ({
  settingsStore: {
    getState: () => mockSettingsState,
  },
}))

const mockClientFactory = () =>
  ({
    isEnabled: vi.fn<(flagName: string) => boolean>(),
    getVariant: vi.fn<(flagName: string) => { name: string; enabled: boolean }>(),
    on: vi.fn(),
    off: vi.fn(),
  }) satisfies Partial<UnleashClient>

const resetSettings = () => {
  mockSettingsState.fortuneWheelEnabled = true
  mockSettingsState.answerInputEnabled = false
  mockSettingsState.websocketEnabled = false
}

const getFlags = async () => {
  const module = await import('../../composables/useFeatureFlags')
  return module.useFeatureFlags()
}

describe('useFeatureFlags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    resetSettings()

    mockUseRuntimeConfig.mockReturnValue({
      public: {
        featureAnswerInput: true,
      },
    })

    mockUseNuxtApp.mockReturnValue({
      $featureFlags: null,
    })
  })

  describe('fortune-wheel precedence contract', () => {
    it('uses GitLab value when client is configured and returns false', async () => {
      const client = mockClientFactory()
      client.isEnabled.mockImplementation((flagName) =>
        flagName === 'fortune-wheel' ? false : true
      )

      mockSettingsState.fortuneWheelEnabled = true
      mockUseNuxtApp.mockReturnValue({ $featureFlags: client })

      const { isFortuneWheelEnabled, isEnabled } = await getFlags()

      expect(isFortuneWheelEnabled.value).toBe(false)
      expect(isEnabled('fortune-wheel', true)).toBe(false)
      expect(client.isEnabled).toHaveBeenCalledWith('fortune-wheel')
    })

    it('uses local store value when GitLab is unavailable', async () => {
      mockSettingsState.fortuneWheelEnabled = false

      const { isFortuneWheelEnabled, isEnabled } = await getFlags()

      expect(isFortuneWheelEnabled.value).toBe(false)
      expect(isEnabled('fortune-wheel', true)).toBe(false)
    })

    it('keeps fallback default enabled when GitLab throws unexpectedly', async () => {
      const client = mockClientFactory()
      client.isEnabled.mockImplementation(() => {
        throw new Error('unleash error')
      })
      mockUseNuxtApp.mockReturnValue({ $featureFlags: client })

      const { isFortuneWheelEnabled, isEnabled } = await getFlags()

      expect(isFortuneWheelEnabled.value).toBe(true)
      expect(isEnabled('fortune-wheel', true)).toBe(true)
      expect(mockWarn).toHaveBeenCalled()
    })
  })

  describe('answer-input precedence contract', () => {
    it('runtime config false force-disables answer input over GitLab and local values', async () => {
      const client = mockClientFactory()
      client.isEnabled.mockImplementation((flagName) =>
        flagName === 'answer-input' ? true : false
      )

      mockSettingsState.answerInputEnabled = true
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          featureAnswerInput: false,
        },
      })
      mockUseNuxtApp.mockReturnValue({ $featureFlags: client })

      const { isAnswerInputEnabled, isEnabled } = await getFlags()

      expect(isAnswerInputEnabled.value).toBe(false)
      expect(isEnabled('answer-input', true)).toBe(false)
      expect(client.isEnabled).not.toHaveBeenCalledWith('answer-input')
    })

    it('uses local store value when GitLab is unavailable', async () => {
      mockSettingsState.answerInputEnabled = true

      const { isAnswerInputEnabled, isEnabled } = await getFlags()

      expect(isAnswerInputEnabled.value).toBe(true)
      expect(isEnabled('answer-input', false)).toBe(true)
    })
  })

  describe('websocket contract', () => {
    it('keeps unchanged fallback behavior using local settings when GitLab is unavailable', async () => {
      mockSettingsState.websocketEnabled = true

      const { isWebSocketEnabled, isEnabled } = await getFlags()

      expect(isWebSocketEnabled.value).toBe(true)
      expect(isEnabled('websocket', false)).toBe(true)
    })

    it('uses GitLab value when client is configured', async () => {
      const client = mockClientFactory()
      client.isEnabled.mockImplementation((flagName) => (flagName === 'websocket' ? false : true))
      mockSettingsState.websocketEnabled = true
      mockUseNuxtApp.mockReturnValue({ $featureFlags: client })

      const { isWebSocketEnabled } = await getFlags()

      expect(isWebSocketEnabled.value).toBe(false)
    })
  })

  describe('shared API behavior', () => {
    it('returns disabled variant when no GitLab client is configured', async () => {
      const { getVariant } = await getFlags()

      expect(getVariant('fortune-wheel')).toEqual({
        name: 'disabled',
        enabled: false,
      })
    })

    it('falls back to provided default for unmanaged flags without GitLab', async () => {
      const { isEnabled } = await getFlags()

      expect(isEnabled('unknown-flag', false)).toBe(false)
      expect(isEnabled('unknown-flag', true)).toBe(true)
    })
  })
})
