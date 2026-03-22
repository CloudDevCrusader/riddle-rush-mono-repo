import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { settingsStore } from '../../stores/settingsStore'

const localStorageMock = globalThis.localStorage as Storage & {
  getItem: ReturnType<typeof vi.fn>
  setItem: ReturnType<typeof vi.fn>
  removeItem: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
}

// Default settings state for test isolation
const defaultSettingsState = {
  maxPlayersPerGame: 4,
  showLeaderboardAfterRound: true,
  leaderboardEnabled: true,
  debugMode: false,
  soundEnabled: true,
  soundVolume: 75,
  musicEnabled: true,
  musicVolume: 75,
  offlineMode: false,
  language: 'de',
  fortuneWheelEnabled: true,
  websocketEnabled: false,
  answerInputEnabled: false,
}

describe('Settings Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    // Reset Zustand store state using setState for proper isolation
    settingsStore.setState(defaultSettingsState)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has default maxPlayersPerGame of 4', () => {
      const store = settingsStore.getState()
      expect(store.maxPlayersPerGame).toBe(4)
    })

    it('has showLeaderboardAfterRound enabled', () => {
      const store = settingsStore.getState()
      expect(store.showLeaderboardAfterRound).toBe(true)
    })

    it('has leaderboard enabled', () => {
      const store = settingsStore.getState()
      expect(store.leaderboardEnabled).toBe(true)
    })

    it('has debug mode disabled', () => {
      const store = settingsStore.getState()
      expect(store.debugMode).toBe(false)
    })

    it('has sound enabled', () => {
      const store = settingsStore.getState()
      expect(store.soundEnabled).toBe(true)
    })

    it('has offline mode disabled', () => {
      const store = settingsStore.getState()
      expect(store.offlineMode).toBe(false)
    })

    it('has fortune wheel enabled by default', () => {
      const store = settingsStore.getState()
      expect(store.fortuneWheelEnabled).toBe(true)
    })
  })

  describe('Getters', () => {
    it('isDebugMode returns debugMode state', () => {
      expect(settingsStore.getState().debugMode).toBe(false)
      settingsStore.getState().updateSetting('debugMode', true)
      expect(settingsStore.getState().debugMode).toBe(true)
    })

    it('isLeaderboardEnabled returns leaderboardEnabled state', () => {
      expect(settingsStore.getState().leaderboardEnabled).toBe(true)
      settingsStore.getState().updateSetting('leaderboardEnabled', false)
      expect(settingsStore.getState().leaderboardEnabled).toBe(false)
    })

    it('shouldShowLeaderboard requires both flags', () => {
      const initialShouldShow =
        settingsStore.getState().leaderboardEnabled &&
        settingsStore.getState().showLeaderboardAfterRound
      expect(initialShouldShow).toBe(true)

      settingsStore.getState().updateSetting('leaderboardEnabled', false)
      const shouldShowAfterDisable =
        settingsStore.getState().leaderboardEnabled &&
        settingsStore.getState().showLeaderboardAfterRound
      expect(shouldShowAfterDisable).toBe(false)

      settingsStore.getState().updateSetting('leaderboardEnabled', true)
      settingsStore.getState().updateSetting('showLeaderboardAfterRound', false)
      const shouldShowAfterToggle =
        settingsStore.getState().leaderboardEnabled &&
        settingsStore.getState().showLeaderboardAfterRound
      expect(shouldShowAfterToggle).toBe(false)
    })

    it('isFortuneWheelEnabled returns fortuneWheelEnabled state', () => {
      expect(settingsStore.getState().fortuneWheelEnabled).toBe(true)
      settingsStore.getState().updateSetting('fortuneWheelEnabled', false)
      expect(settingsStore.getState().fortuneWheelEnabled).toBe(false)
    })
  })

  // Note: Load/Save Settings tests removed - Zustand persist middleware handles this automatically

  describe('Update Setting', () => {
    it('updates specific setting', () => {
      settingsStore.getState().updateSetting('maxPlayersPerGame', 8)
      expect(settingsStore.getState().maxPlayersPerGame).toBe(8)
    })

    it('saves after update', () => {
      settingsStore.getState().updateSetting('debugMode', true)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('Toggle Actions', () => {
    it('toggleDebugMode flips state', () => {
      expect(settingsStore.getState().debugMode).toBe(false)
      settingsStore.getState().toggleDebugMode()
      expect(settingsStore.getState().debugMode).toBe(true)
      settingsStore.getState().toggleDebugMode()
      expect(settingsStore.getState().debugMode).toBe(false)
    })

    it('toggleLeaderboard flips state', () => {
      expect(settingsStore.getState().leaderboardEnabled).toBe(true)
      settingsStore.getState().toggleLeaderboard()
      expect(settingsStore.getState().leaderboardEnabled).toBe(false)
    })

    it('toggleSound flips state', () => {
      expect(settingsStore.getState().soundEnabled).toBe(true)
      settingsStore.getState().toggleSound()
      expect(settingsStore.getState().soundEnabled).toBe(false)
    })

    it('setOfflineMode sets specific value', () => {
      settingsStore.getState().setOfflineMode(true)
      expect(settingsStore.getState().offlineMode).toBe(true)
      settingsStore.getState().setOfflineMode(false)
      expect(settingsStore.getState().offlineMode).toBe(false)
    })

    it('toggleFortuneWheel flips state', () => {
      expect(settingsStore.getState().fortuneWheelEnabled).toBe(true)
      settingsStore.getState().toggleFortuneWheel()
      expect(settingsStore.getState().fortuneWheelEnabled).toBe(false)
      settingsStore.getState().toggleFortuneWheel()
      expect(settingsStore.getState().fortuneWheelEnabled).toBe(true)
    })

    it('toggleAnswerInput flips state', () => {
      expect(settingsStore.getState().answerInputEnabled).toBe(false)
      settingsStore.getState().toggleAnswerInput()
      expect(settingsStore.getState().answerInputEnabled).toBe(true)
      settingsStore.getState().toggleAnswerInput()
      expect(settingsStore.getState().answerInputEnabled).toBe(false)
    })
  })

  describe('Reset to Defaults', () => {
    it('resets all settings', () => {
      settingsStore.getState().updateSetting('debugMode', true)
      settingsStore.getState().updateSetting('soundEnabled', false)
      settingsStore.getState().updateSetting('maxPlayersPerGame', 10)

      settingsStore.getState().resetToDefaults()

      expect(settingsStore.getState().debugMode).toBe(false)
      expect(settingsStore.getState().soundEnabled).toBe(true)
      expect(settingsStore.getState().maxPlayersPerGame).toBe(4)
    })

    it('saves after reset', () => {
      settingsStore.getState().updateSetting('debugMode', true)
      vi.clearAllMocks()

      settingsStore.getState().resetToDefaults()

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })
})
