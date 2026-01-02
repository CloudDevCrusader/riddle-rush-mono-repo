import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '../../stores/settings'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { Reflect.deleteProperty(store, key) }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('Settings Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has default maxPlayersPerGame of 4', () => {
      const store = useSettingsStore()
      expect(store.maxPlayersPerGame).toBe(4)
    })

    it('has showLeaderboardAfterRound enabled', () => {
      const store = useSettingsStore()
      expect(store.showLeaderboardAfterRound).toBe(true)
    })

    it('has leaderboard enabled', () => {
      const store = useSettingsStore()
      expect(store.leaderboardEnabled).toBe(true)
    })

    it('has debug mode disabled', () => {
      const store = useSettingsStore()
      expect(store.debugMode).toBe(false)
    })

    it('has sound enabled', () => {
      const store = useSettingsStore()
      expect(store.soundEnabled).toBe(true)
    })

    it('has offline mode disabled', () => {
      const store = useSettingsStore()
      expect(store.offlineMode).toBe(false)
    })
  })

  describe('Getters', () => {
    it('isDebugMode returns debugMode state', () => {
      const store = useSettingsStore()
      expect(store.isDebugMode).toBe(false)
      store.debugMode = true
      expect(store.isDebugMode).toBe(true)
    })

    it('isLeaderboardEnabled returns leaderboardEnabled state', () => {
      const store = useSettingsStore()
      expect(store.isLeaderboardEnabled).toBe(true)
      store.leaderboardEnabled = false
      expect(store.isLeaderboardEnabled).toBe(false)
    })

    it('shouldShowLeaderboard requires both flags', () => {
      const store = useSettingsStore()
      expect(store.shouldShowLeaderboard).toBe(true)

      store.leaderboardEnabled = false
      expect(store.shouldShowLeaderboard).toBe(false)

      store.leaderboardEnabled = true
      store.showLeaderboardAfterRound = false
      expect(store.shouldShowLeaderboard).toBe(false)
    })
  })

  describe('Load Settings', () => {
    it('loads settings from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        debugMode: true,
        soundEnabled: false,
      }))

      const store = useSettingsStore()
      store.loadSettings()

      expect(store.debugMode).toBe(true)
      expect(store.soundEnabled).toBe(false)
    })

    it('uses defaults for missing keys', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        debugMode: true,
      }))

      const store = useSettingsStore()
      store.loadSettings()

      expect(store.debugMode).toBe(true)
      expect(store.maxPlayersPerGame).toBe(4)
    })

    it('handles invalid JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json')

      const store = useSettingsStore()
      expect(() => store.loadSettings()).not.toThrow()
      expect(store.debugMode).toBe(false)
    })

    it('handles missing localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce(null)

      const store = useSettingsStore()
      expect(() => store.loadSettings()).not.toThrow()
    })
  })

  describe('Save Settings', () => {
    it('saves settings to localStorage', () => {
      const store = useSettingsStore()
      store.debugMode = true
      store.saveSettings()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'game-settings',
        expect.stringContaining('"debugMode":true'),
      )
    })
  })

  describe('Update Setting', () => {
    it('updates specific setting', () => {
      const store = useSettingsStore()
      store.updateSetting('maxPlayersPerGame', 8)
      expect(store.maxPlayersPerGame).toBe(8)
    })

    it('saves after update', () => {
      const store = useSettingsStore()
      store.updateSetting('debugMode', true)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('Toggle Actions', () => {
    it('toggleDebugMode flips state', () => {
      const store = useSettingsStore()
      expect(store.debugMode).toBe(false)
      store.toggleDebugMode()
      expect(store.debugMode).toBe(true)
      store.toggleDebugMode()
      expect(store.debugMode).toBe(false)
    })

    it('toggleLeaderboard flips state', () => {
      const store = useSettingsStore()
      expect(store.leaderboardEnabled).toBe(true)
      store.toggleLeaderboard()
      expect(store.leaderboardEnabled).toBe(false)
    })

    it('toggleSound flips state', () => {
      const store = useSettingsStore()
      expect(store.soundEnabled).toBe(true)
      store.toggleSound()
      expect(store.soundEnabled).toBe(false)
    })

    it('setOfflineMode sets specific value', () => {
      const store = useSettingsStore()
      store.setOfflineMode(true)
      expect(store.offlineMode).toBe(true)
      store.setOfflineMode(false)
      expect(store.offlineMode).toBe(false)
    })
  })

  describe('Reset to Defaults', () => {
    it('resets all settings', () => {
      const store = useSettingsStore()
      store.debugMode = true
      store.soundEnabled = false
      store.maxPlayersPerGame = 10

      store.resetToDefaults()

      expect(store.debugMode).toBe(false)
      expect(store.soundEnabled).toBe(true)
      expect(store.maxPlayersPerGame).toBe(4)
    })

    it('saves after reset', () => {
      const store = useSettingsStore()
      store.debugMode = true
      vi.clearAllMocks()

      store.resetToDefaults()

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })
})
