import { describe, it, expect, beforeEach, vi } from 'vitest'
import { migrateFromPinia } from '../../stores/migrate'

// Mock localStorage — untyped vi.fn() gives full Mock API (.mockReturnValue, .mock.calls)
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  get length() {
    return 0
  },
  key: vi.fn().mockReturnValue(null),
}

beforeEach(() => {
  vi.clearAllMocks()
  // Replace global localStorage with mock (MockStorage satisfies Storage)
  globalThis.localStorage = mockLocalStorage as unknown as Storage
})

describe('migrateFromPinia', () => {
  describe('Old Pinia format detected', () => {
    it('migrates flat JSON to Zustand envelope format', () => {
      // Set old Pinia format in localStorage
      const oldPiniaData = {
        maxPlayersPerGame: 4,
        soundVolume: 50,
        showLeaderboardAfterRound: true,
        leaderboardEnabled: true,
        debugMode: false,
        soundEnabled: true,
        offlineMode: false,
        fortuneWheelEnabled: true,
        answerInputEnabled: false,
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldPiniaData))

      // Call migration
      migrateFromPinia()

      // Verify new format
      const expectedNewFormat = {
        state: oldPiniaData,
        version: 0,
      }
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'game-settings',
        JSON.stringify(expectedNewFormat)
      )
    })

    it('preserves all settings fields during migration', () => {
      const oldPiniaData = {
        maxPlayersPerGame: 6,
        soundVolume: 75,
        showLeaderboardAfterRound: false,
        leaderboardEnabled: true,
        debugMode: true,
        soundEnabled: false,
        offlineMode: true,
        fortuneWheelEnabled: false,
        answerInputEnabled: true,
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldPiniaData))

      migrateFromPinia()

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0]![1]!)
      expect(savedData.state).toEqual(oldPiniaData)
      expect(savedData.version).toBe(0)
    })
  })

  describe('Already Zustand format', () => {
    it('does not modify already migrated data', () => {
      const zustandFormat = {
        state: {
          maxPlayersPerGame: 4,
          soundVolume: 50,
        },
        version: 0,
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(zustandFormat))

      migrateFromPinia()

      // Should not call setItem since data is already in correct format
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('does not modify data with higher version', () => {
      const newerFormat = {
        state: {
          maxPlayersPerGame: 4,
          soundVolume: 50,
        },
        version: 1,
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(newerFormat))

      migrateFromPinia()

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('No stored settings', () => {
    it('does nothing when localStorage has no game-settings key', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      migrateFromPinia()

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
    })

    it('does nothing when game-settings key does not exist', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'game-settings') return null
        return null
      })

      migrateFromPinia()

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
    })
  })

  describe('Corrupted data', () => {
    it('removes corrupted data and does not create migration', () => {
      mockLocalStorage.getItem.mockReturnValue('not json')

      migrateFromPinia()

      // Should remove the corrupted key
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('game-settings')
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('handles null/undefined values gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('null')

      migrateFromPinia()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('game-settings')
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('handles empty string gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('')

      migrateFromPinia()

      // Empty string should be treated as corrupted and either removed or not modified
      // Important: should not try to set corrupted data
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('SSR guard', () => {
    it('returns early when window is undefined', () => {
      // Delete window object
      const originalWindow = globalThis.window
      delete (globalThis as Record<string, unknown>).window

      migrateFromPinia()

      // Should not throw error and should not access localStorage
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()

      // Restore window
      globalThis.window = originalWindow
    })

    it('handles missing localStorage gracefully', () => {
      const originalLocalStorage = globalThis.localStorage
      // @ts-expect-error - intentionally deleting localStorage for SSR guard test
      delete globalThis.localStorage

      migrateFromPinia()

      // Should not throw error
      expect(() => migrateFromPinia()).not.toThrow()

      // Restore localStorage
      globalThis.localStorage = originalLocalStorage
    })
  })

  describe('Partial migration', () => {
    it('migrates even when some fields are missing', () => {
      const partialData = {
        maxPlayersPerGame: 4,
        soundVolume: 50,
        // Missing some fields
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialData))

      migrateFromPinia()

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0]![1]!)
      expect(savedData.state).toEqual(partialData)
      expect(savedData.version).toBe(0)
    })

    it('handles extra fields gracefully', () => {
      const dataWithExtraFields = {
        maxPlayersPerGame: 4,
        soundVolume: 50,
        unknownField: 'value',
        anotherUnknown: 123,
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(dataWithExtraFields))

      migrateFromPinia()

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0]![1]!)
      expect(savedData.state).toEqual(dataWithExtraFields)
      expect(savedData.version).toBe(0)
    })
  })
})
