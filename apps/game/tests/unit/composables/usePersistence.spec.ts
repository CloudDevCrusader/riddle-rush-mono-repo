import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameSession } from '@riddle-rush/types/game'

import { usePersistence } from '~/composables/usePersistence'

// Mock useIndexedDB before importing composable
const mockGetGameSession = vi.fn()
const mockGetGameHistory = vi.fn()
const mockSaveGameSession = vi.fn()
const mockSaveGameHistory = vi.fn()
const mockGetGameSessionById = vi.fn()

vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: vi.fn(() => ({
    getGameSession: mockGetGameSession,
    getGameHistory: mockGetGameHistory,
    saveGameSession: mockSaveGameSession,
    saveGameHistory: mockSaveGameHistory,
    getGameSessionById: mockGetGameSessionById,
  })),
}))

// Mock useLogger before importing composable
const mockLoggerError = vi.fn()

vi.mock('~/composables/useLogger', () => ({
  useLogger: vi.fn(() => ({
    log: vi.fn(),
    warn: vi.fn(),
    error: mockLoggerError,
    debug: vi.fn(),
    info: vi.fn(),
  })),
}))

const mockSession: GameSession = {
  id: 'session-123',
  players: [
    {
      id: 'player-1',
      name: 'Alice',
      totalScore: 10,
      currentRoundScore: 0,
      hasSubmitted: false,
    },
  ],
  currentRound: 1,
  currentPlayerIndex: 0,
  category: {
    id: 1,
    name: 'Animals',
    searchWord: 'animal',
    key: 'animals',
    searchProvider: 'offline',
    letter: 'A',
  },
  letter: 'A',
  startTime: 1000000,
  status: 'active',
  roundHistory: [],
}

const mockHistory: GameSession[] = [
  { ...mockSession, id: 'hist-1', status: 'completed' },
  { ...mockSession, id: 'hist-2', status: 'completed' },
]

describe('usePersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadSessionFromDB', () => {
    it('should return session when IndexedDB succeeds', async () => {
      mockGetGameSession.mockResolvedValueOnce(mockSession)
      const { loadSessionFromDB } = usePersistence()

      const result = await loadSessionFromDB()

      expect(result).toEqual(mockSession)
      expect(mockGetGameSession).toHaveBeenCalledTimes(1)
    })

    it('should return null when IndexedDB throws error', async () => {
      mockGetGameSession.mockRejectedValueOnce(new Error('DB error'))
      const { loadSessionFromDB } = usePersistence()

      const result = await loadSessionFromDB()

      expect(result).toBeNull()
    })

    it('should log error when load fails', async () => {
      const dbError = new Error('DB connection failed')
      mockGetGameSession.mockRejectedValueOnce(dbError)
      const { loadSessionFromDB } = usePersistence()

      await loadSessionFromDB()

      expect(mockLoggerError).toHaveBeenCalledWith('Error loading session from IndexedDB:', dbError)
    })

    it('should return null (not throw) when IndexedDB fails', async () => {
      mockGetGameSession.mockRejectedValueOnce(new Error('Fatal error'))
      const { loadSessionFromDB } = usePersistence()

      // Should NOT throw
      await expect(loadSessionFromDB()).resolves.toBeNull()
    })
  })

  describe('loadHistoryFromDB', () => {
    it('should return history array when IndexedDB succeeds', async () => {
      mockGetGameHistory.mockResolvedValueOnce(mockHistory)
      const { loadHistoryFromDB } = usePersistence()

      const result = await loadHistoryFromDB()

      expect(result).toEqual(mockHistory)
      expect(mockGetGameHistory).toHaveBeenCalledTimes(1)
    })

    it('should return null when IndexedDB throws error', async () => {
      mockGetGameHistory.mockRejectedValueOnce(new Error('DB error'))
      const { loadHistoryFromDB } = usePersistence()

      const result = await loadHistoryFromDB()

      expect(result).toBeNull()
    })

    it('should log error when load fails', async () => {
      const dbError = new Error('History load failed')
      mockGetGameHistory.mockRejectedValueOnce(dbError)
      const { loadHistoryFromDB } = usePersistence()

      await loadHistoryFromDB()

      expect(mockLoggerError).toHaveBeenCalledWith('Error loading history from IndexedDB:', dbError)
    })

    it('should return null (not throw) when IndexedDB fails', async () => {
      mockGetGameHistory.mockRejectedValueOnce(new Error('Fatal error'))
      const { loadHistoryFromDB } = usePersistence()

      await expect(loadHistoryFromDB()).resolves.toBeNull()
    })
  })

  describe('saveSessionToDB', () => {
    it('should call IndexedDB saveGameSession with session', async () => {
      mockSaveGameSession.mockResolvedValueOnce(undefined)
      const { saveSessionToDB } = usePersistence()

      await saveSessionToDB(mockSession)

      expect(mockSaveGameSession).toHaveBeenCalledWith(mockSession)
      expect(mockSaveGameSession).toHaveBeenCalledTimes(1)
    })

    it('should not throw when IndexedDB throws error', async () => {
      mockSaveGameSession.mockRejectedValueOnce(new Error('Save failed'))
      const { saveSessionToDB } = usePersistence()

      // Should NOT throw
      await expect(saveSessionToDB(mockSession)).resolves.toBeUndefined()
    })

    it('should log error when save fails', async () => {
      const dbError = new Error('Save failed')
      mockSaveGameSession.mockRejectedValueOnce(dbError)
      const { saveSessionToDB } = usePersistence()

      await saveSessionToDB(mockSession)

      expect(mockLoggerError).toHaveBeenCalledWith('Error saving session to IndexedDB:', dbError)
    })

    it('should continue execution even on error', async () => {
      mockSaveGameSession.mockRejectedValueOnce(new Error('Intermittent DB error'))
      const { saveSessionToDB } = usePersistence()

      let completed = false
      await saveSessionToDB(mockSession)
      completed = true

      expect(completed).toBe(true)
    })
  })

  describe('saveHistoryToDB', () => {
    it('should call IndexedDB saveGameHistory with history array', async () => {
      mockSaveGameHistory.mockResolvedValueOnce(undefined)
      const { saveHistoryToDB } = usePersistence()

      await saveHistoryToDB(mockHistory)

      expect(mockSaveGameHistory).toHaveBeenCalledWith(mockHistory)
      expect(mockSaveGameHistory).toHaveBeenCalledTimes(1)
    })

    it('should not throw when IndexedDB throws error', async () => {
      mockSaveGameHistory.mockRejectedValueOnce(new Error('Save history failed'))
      const { saveHistoryToDB } = usePersistence()

      await expect(saveHistoryToDB(mockHistory)).resolves.toBeUndefined()
    })

    it('should log error when save history fails', async () => {
      const dbError = new Error('History save error')
      mockSaveGameHistory.mockRejectedValueOnce(dbError)
      const { saveHistoryToDB } = usePersistence()

      await saveHistoryToDB(mockHistory)

      expect(mockLoggerError).toHaveBeenCalledWith('Error saving history to IndexedDB:', dbError)
    })

    it('should continue execution even on error', async () => {
      mockSaveGameHistory.mockRejectedValueOnce(new Error('DB unavailable'))
      const { saveHistoryToDB } = usePersistence()

      let completed = false
      await saveHistoryToDB(mockHistory)
      completed = true

      expect(completed).toBe(true)
    })
  })

  describe('loadSessionById', () => {
    it('should return session when found in IndexedDB', async () => {
      mockGetGameSessionById.mockResolvedValueOnce(mockSession)
      const { loadSessionById } = usePersistence()

      const result = await loadSessionById('session-123')

      expect(result).toEqual(mockSession)
      expect(mockGetGameSessionById).toHaveBeenCalledWith('session-123')
    })

    it('should throw error when session is not found (returns null)', async () => {
      mockGetGameSessionById.mockResolvedValueOnce(null)
      const { loadSessionById } = usePersistence()

      await expect(loadSessionById('missing-id')).rejects.toThrow('Failed to load game session')
    })

    it('should throw error when IndexedDB lookup fails', async () => {
      mockGetGameSessionById.mockRejectedValueOnce(new Error('DB error'))
      const { loadSessionById } = usePersistence()

      await expect(loadSessionById('session-123')).rejects.toThrow('Failed to load game session')
    })

    it('should log error when load by ID fails', async () => {
      mockGetGameSessionById.mockRejectedValueOnce(new Error('Lookup error'))
      const { loadSessionById } = usePersistence()

      try {
        await loadSessionById('session-123')
      } catch {
        // expected to throw
      }

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error loading game session by ID:',
        expect.any(Error)
      )
    })

    it('should log error when session not found (null result)', async () => {
      mockGetGameSessionById.mockResolvedValueOnce(null)
      const { loadSessionById } = usePersistence()

      try {
        await loadSessionById('missing-id')
      } catch {
        // expected to throw
      }

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error loading game session by ID:',
        expect.any(Error)
      )
    })
  })

  describe('return value', () => {
    it('should return all expected functions', () => {
      const persistence = usePersistence()

      expect(typeof persistence.loadSessionFromDB).toBe('function')
      expect(typeof persistence.loadHistoryFromDB).toBe('function')
      expect(typeof persistence.saveSessionToDB).toBe('function')
      expect(typeof persistence.saveHistoryToDB).toBe('function')
      expect(typeof persistence.loadSessionById).toBe('function')
    })
  })
})
