import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { settingsStore } from '../../stores/settingsStore'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      Reflect.deleteProperty(store, key)
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('Settings Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    // Reset Zustand store to defaults
    settingsStore.getState().resetToDefaults()
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
      const store = settingsStore.getState()
      expect(store.isDebugMode).toBe(false)
      store.debugMode = true
      expect(store.isDebugMode).toBe(true)
    })

    it('isLeaderboardEnabled returns leaderboardEnabled state', () => {
      const store = settingsStore.getState()
      expect(store.isLeaderboardEnabled).toBe(true)
      store.leaderboardEnabled = false
      expect(store.isLeaderboardEnabled).toBe(false)
    })

    it('shouldShowLeaderboard requires both flags', () => {
      const store = settingsStore.getState()
      expect(store.shouldShowLeaderboard).toBe(true)

      store.leaderboardEnabled = false
      expect(store.shouldShowLeaderboard).toBe(false)

      store.leaderboardEnabled = true
      store.showLeaderboardAfterRound = false
      expect(store.shouldShowLeaderboard).toBe(false)
    })

    it('isFortuneWheelEnabled returns fortuneWheelEnabled state', () => {
      const store = settingsStore.getState()
      expect(store.isFortuneWheelEnabled).toBe(true)
      store.fortuneWheelEnabled = false
      expect(store.isFortuneWheelEnabled).toBe(false)
    })
  })

  // Note: Load/Save Settings tests removed - Zustand persist middleware handles this automatically

  describe('Update Setting', () => {
    it('updates specific setting', () => {
      const store = settingsStore.getState()
      store.updateSetting('maxPlayersPerGame', 8)
      expect(store.maxPlayersPerGame).toBe(8)
    })

    it('saves after update', () => {
      const store = settingsStore.getState()
      store.updateSetting('debugMode', true)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('Toggle Actions', () => {
    it('toggleDebugMode flips state', () => {
      const store = settingsStore.getState()
      expect(store.debugMode).toBe(false)
      store.toggleDebugMode()
      expect(store.debugMode).toBe(true)
      store.toggleDebugMode()
      expect(store.debugMode).toBe(false)
    })

    it('toggleLeaderboard flips state', () => {
      const store = settingsStore.getState()
      expect(store.leaderboardEnabled).toBe(true)
      store.toggleLeaderboard()
      expect(store.leaderboardEnabled).toBe(false)
    })

    it('toggleSound flips state', () => {
      const store = settingsStore.getState()
      expect(store.soundEnabled).toBe(true)
      store.toggleSound()
      expect(store.soundEnabled).toBe(false)
    })

    it('setOfflineMode sets specific value', () => {
      const store = settingsStore.getState()
      store.setOfflineMode(true)
      expect(store.offlineMode).toBe(true)
      store.setOfflineMode(false)
      expect(store.offlineMode).toBe(false)
    })

    it('toggleFortuneWheel flips state', () => {
      const store = settingsStore.getState()
      expect(store.fortuneWheelEnabled).toBe(true)
      store.toggleFortuneWheel()
      expect(store.fortuneWheelEnabled).toBe(false)
      store.toggleFortuneWheel()
      expect(store.fortuneWheelEnabled).toBe(true)
    })

    it('toggleAnswerInput flips state', () => {
      const store = settingsStore.getState()
      expect(store.answerInputEnabled).toBe(false)
      store.toggleAnswerInput()
      expect(store.answerInputEnabled).toBe(true)
      store.toggleAnswerInput()
      expect(store.answerInputEnabled).toBe(false)
    })
  })

  describe('Reset to Defaults', () => {
    it('resets all settings', () => {
      const store = settingsStore.getState()
      store.debugMode = true
      store.soundEnabled = false
      store.maxPlayersPerGame = 10

      store.resetToDefaults()

      expect(store.debugMode).toBe(false)
      expect(store.soundEnabled).toBe(true)
      expect(store.maxPlayersPerGame).toBe(4)
    })

    it('saves after reset', () => {
      const store = settingsStore.getState()
      store.debugMode = true
      vi.clearAllMocks()

      store.resetToDefaults()

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })
})
