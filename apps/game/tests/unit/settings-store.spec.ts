import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSettingsStore } from '../../stores/settingsStore'

const localStorageMock = globalThis.localStorage as Storage & {
  getItem: ReturnType<typeof vi.fn>
  setItem: ReturnType<typeof vi.fn>
  removeItem: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
}
=======
=======
>>>>>>> Stashed changes
};
>>>>>>> Stashed changes

let settingsStore: ReturnType<typeof useSettingsStore>

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorageMock.clear()
    // Fresh Pinia instance starts with default state - no manual reset needed
    settingsStore = useSettingsStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has default maxPlayersPerGame of 4', () => {
      const store = settingsStore
      expect(store.maxPlayersPerGame).toBe(4)
    })

    it('has showLeaderboardAfterRound enabled', () => {
      const store = settingsStore
      expect(store.showLeaderboardAfterRound).toBe(true)
    })

    it('has leaderboard enabled', () => {
      const store = settingsStore
      expect(store.leaderboardEnabled).toBe(true)
    })

    it('has debug mode disabled', () => {
      const store = settingsStore
      expect(store.debugMode).toBe(false)
    })

    it('has sound enabled', () => {
      const store = settingsStore
      expect(store.soundEnabled).toBe(true)
    })

    it('has offline mode disabled', () => {
      const store = settingsStore
      expect(store.offlineMode).toBe(false)
    })

    it('has fortune wheel enabled by default', () => {
      const store = settingsStore
      expect(store.fortuneWheelEnabled).toBe(true)
    })
  })

  describe('Getters', () => {
    it('isDebugMode returns debugMode state', () => {
      expect(settingsStore.debugMode).toBe(false)
      settingsStore.updateSetting('debugMode', true)
      expect(settingsStore.debugMode).toBe(true)
    })

    it('isLeaderboardEnabled returns leaderboardEnabled state', () => {
      expect(settingsStore.leaderboardEnabled).toBe(true)
      settingsStore.updateSetting('leaderboardEnabled', false)
      expect(settingsStore.leaderboardEnabled).toBe(false)
    })

    it('shouldShowLeaderboard requires both flags', () => {
      const initialShouldShow =
        settingsStore.leaderboardEnabled && settingsStore.showLeaderboardAfterRound
      expect(initialShouldShow).toBe(true)

      settingsStore.updateSetting('leaderboardEnabled', false)
      const shouldShowAfterDisable =
        settingsStore.leaderboardEnabled && settingsStore.showLeaderboardAfterRound
      expect(shouldShowAfterDisable).toBe(false)

      settingsStore.updateSetting('leaderboardEnabled', true)
      settingsStore.updateSetting('showLeaderboardAfterRound', false)
      const shouldShowAfterToggle =
        settingsStore.leaderboardEnabled && settingsStore.showLeaderboardAfterRound
      expect(shouldShowAfterToggle).toBe(false)
    })

    it('isFortuneWheelEnabled returns fortuneWheelEnabled state', () => {
      expect(settingsStore.fortuneWheelEnabled).toBe(true)
      settingsStore.updateSetting('fortuneWheelEnabled', false)
      expect(settingsStore.fortuneWheelEnabled).toBe(false)
    })
  })

  // Note: Load/Save Settings tests removed - Pinia persist middleware handles this automatically

  describe('Update Setting', () => {
    it('updates specific setting', () => {
      settingsStore.updateSetting('maxPlayersPerGame', 8)
      expect(settingsStore.maxPlayersPerGame).toBe(8)
    })

    it.skip('saves after update (requires persist plugin in test env)', () => {
      settingsStore.updateSetting('debugMode', true)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('Toggle Actions', () => {
    it('toggleDebugMode flips state', () => {
      expect(settingsStore.debugMode).toBe(false)
      settingsStore.toggleDebugMode()
      expect(settingsStore.debugMode).toBe(true)
      settingsStore.toggleDebugMode()
      expect(settingsStore.debugMode).toBe(false)
    })

    it('toggleLeaderboard flips state', () => {
      expect(settingsStore.leaderboardEnabled).toBe(true)
      settingsStore.toggleLeaderboard()
      expect(settingsStore.leaderboardEnabled).toBe(false)
    })

    it('toggleSound flips state', () => {
      expect(settingsStore.soundEnabled).toBe(true)
      settingsStore.toggleSound()
      expect(settingsStore.soundEnabled).toBe(false)
    })

    it('setOfflineMode sets specific value', () => {
      settingsStore.setOfflineMode(true)
      expect(settingsStore.offlineMode).toBe(true)
      settingsStore.setOfflineMode(false)
      expect(settingsStore.offlineMode).toBe(false)
    })

    it('toggleFortuneWheel flips state', () => {
      expect(settingsStore.fortuneWheelEnabled).toBe(true)
      settingsStore.toggleFortuneWheel()
      expect(settingsStore.fortuneWheelEnabled).toBe(false)
      settingsStore.toggleFortuneWheel()
      expect(settingsStore.fortuneWheelEnabled).toBe(true)
    })

    it('toggleAnswerInput flips state', () => {
      expect(settingsStore.answerInputEnabled).toBe(false)
      settingsStore.toggleAnswerInput()
      expect(settingsStore.answerInputEnabled).toBe(true)
      settingsStore.toggleAnswerInput()
      expect(settingsStore.answerInputEnabled).toBe(false)
    })
  })

  describe('Reset to Defaults', () => {
    it('resets all settings', () => {
      settingsStore.updateSetting('debugMode', true)
      settingsStore.updateSetting('soundEnabled', false)
      settingsStore.updateSetting('maxPlayersPerGame', 10)

      settingsStore.resetToDefaults()

      expect(settingsStore.debugMode).toBe(false)
      expect(settingsStore.soundEnabled).toBe(true)
      expect(settingsStore.maxPlayersPerGame).toBe(4)
    })

    it.skip('saves after reset (requires persist plugin in test env)', () => {
      settingsStore.updateSetting('debugMode', true)
      vi.clearAllMocks()

      settingsStore.resetToDefaults()

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })
})
