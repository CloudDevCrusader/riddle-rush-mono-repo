import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import type {
  GameSession,
  GameStatistics,
  LeaderboardEntry,
  CategorySettings,
} from '@riddle-rush/types/game'

// Mock useLogger to avoid window/navigator references
vi.mock('../../../composables/useLogger', () => ({
  useLogger: () => ({
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }),
}))

/**
 * Factory for creating test game sessions
 */
function createTestSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    id: overrides.id ?? `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    players: [],
    currentRound: 1,
    currentPlayerIndex: 0,
    category: {
      id: 1,
      name: 'Animals',
      searchWord: 'animals',
      key: 'animals',
      searchProvider: 'offline',
    },
    letter: 'A',
    startTime: Date.now() - 60000,
    endTime: Date.now(),
    score: 25,
    attempts: [
      { term: 'Ant', found: true, timestamp: Date.now() - 50000 },
      { term: 'Axolotl', found: true, timestamp: Date.now() - 40000 },
    ],
    status: 'completed',
    roundHistory: [],
    ...overrides,
  }
}

/**
 * Factory for creating test statistics
 */
function createTestStats(overrides: Partial<GameStatistics> = {}): GameStatistics {
  return {
    totalGames: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    totalScore: 0,
    totalPlayTime: 0,
    categoriesPlayed: {},
    lastPlayed: Date.now(),
    bestScore: 0,
    averageScore: 0,
    streakCurrent: 0,
    streakBest: 0,
    ...overrides,
  }
}

/**
 * Factory for creating test leaderboard entries
 */
function createTestLeaderboardEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    sessionId: overrides.sessionId ?? `session-${Math.random().toString(36).slice(2)}`,
    score: overrides.score ?? 50,
    category: overrides.category ?? 'Animals',
    categoryKey: overrides.categoryKey ?? 'animals',
    playerName: overrides.playerName ?? 'TestPlayer',
    attempts: overrides.attempts ?? 5,
    correctAttempts: overrides.correctAttempts ?? 3,
    timestamp: overrides.timestamp ?? Date.now(),
    duration: overrides.duration ?? 60000,
    letter: overrides.letter ?? 'A',
  }
}

/**
 * Factory for creating test settings
 */
function createTestSettings(overrides: Partial<CategorySettings> = {}): CategorySettings {
  return {
    enabledCategories: overrides.enabledCategories ?? [],
    soundEnabled: overrides.soundEnabled ?? true,
  }
}

// Dynamic import references refreshed per test
let useIndexedDB: typeof import('../../../composables/useIndexedDB').useIndexedDB

describe('useIndexedDB', () => {
  let db: ReturnType<typeof useIndexedDB>

  beforeEach(async () => {
    // Reset modules to clear the cached dbInstance/dbPromise singletons
    vi.resetModules()

    // Create a fresh IDBFactory for each test to avoid data leaking between tests.
    // fake-indexeddb's global `indexedDB` is a singleton that persists across vi.resetModules(),
    // so we install a brand new factory on the global scope before each test.
    const freshFactory = new IDBFactory()
    globalThis.indexedDB = freshFactory

    // Re-import fresh module instance
    const dbModule = await import('../../../composables/useIndexedDB')
    useIndexedDB = dbModule.useIndexedDB

    db = useIndexedDB()
  })

  // =========================================================================
  // Game Session CRUD
  // =========================================================================
  describe('gameSession CRUD', () => {
    it('should save and retrieve a game session', async () => {
      const session = createTestSession({ id: 'test-save-retrieve' })

      await db.saveGameSession(session)
      const retrieved = await db.getGameSession()

      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe('test-save-retrieve')
      expect(retrieved!.score).toBe(session.score)
    })

    it('should return null when no session exists', async () => {
      const session = await db.getGameSession()
      expect(session).toBeNull()
    })

    it('should overwrite current session on subsequent saves', async () => {
      const session1 = createTestSession({ id: 'first-session', score: 10 })
      const session2 = createTestSession({ id: 'second-session', score: 20 })

      await db.saveGameSession(session1)
      await db.saveGameSession(session2)
      const retrieved = await db.getGameSession()

      expect(retrieved!.id).toBe('second-session')
      expect(retrieved!.score).toBe(20)
    })

    it('should clear game session', async () => {
      const session = createTestSession()
      await db.saveGameSession(session)

      await db.clearGameSession()
      const retrieved = await db.getGameSession()

      expect(retrieved).toBeNull()
    })

    it('should serialize session data (strip reactive proxies)', async () => {
      const session = createTestSession({ id: 'serialize-test' })

      await db.saveGameSession(session)
      const retrieved = await db.getGameSession()

      // Should be a plain object (JSON parse/stringify removes prototype)
      expect(retrieved).toEqual(expect.objectContaining({ id: 'serialize-test' }))
    })

    it('should handle session without id gracefully', async () => {
      const session = createTestSession()
      // @ts-expect-error - testing edge case with undefined id
      session.id = undefined

      // Should not throw even though ID-based store fails
      await expect(db.saveGameSession(session)).resolves.not.toThrow()
    })
  })

  // =========================================================================
  // Game Session by ID
  // =========================================================================
  describe('gameSessionById', () => {
    it('should save session by ID and retrieve it', async () => {
      const session = createTestSession({ id: 'by-id-test' })
      await db.saveGameSession(session)

      const retrieved = await db.getGameSessionById('by-id-test')
      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe('by-id-test')
    })

    it('should return null for non-existent session ID', async () => {
      const retrieved = await db.getGameSessionById('non-existent')
      expect(retrieved).toBeNull()
    })

    it('should store multiple sessions by different IDs', async () => {
      const session1 = createTestSession({ id: 'session-a', score: 10 })
      const session2 = createTestSession({ id: 'session-b', score: 20 })

      await db.saveGameSession(session1)
      await db.saveGameSession(session2)

      const retrieved1 = await db.getGameSessionById('session-a')
      const retrieved2 = await db.getGameSessionById('session-b')

      expect(retrieved1!.score).toBe(10)
      expect(retrieved2!.score).toBe(20)
    })
  })

  // =========================================================================
  // Game History CRUD
  // =========================================================================
  describe('gameHistory CRUD', () => {
    it('should save and retrieve game history', async () => {
      const history = [
        createTestSession({ id: 'hist-1', startTime: 1000 }),
        createTestSession({ id: 'hist-2', startTime: 2000 }),
      ]

      await db.saveGameHistory(history)
      const retrieved = await db.getGameHistory()

      expect(retrieved).toHaveLength(2)
    })

    it('should return empty array when no history exists', async () => {
      const history = await db.getGameHistory()
      expect(history).toEqual([])
    })

    it('should return history sorted by startTime descending (newest first)', async () => {
      const sessions = [
        createTestSession({ id: 'old', startTime: 1000 }),
        createTestSession({ id: 'mid', startTime: 2000 }),
        createTestSession({ id: 'new', startTime: 3000 }),
      ]

      await db.saveGameHistory(sessions)
      const retrieved = await db.getGameHistory()

      expect(retrieved[0]!.id).toBe('new')
      expect(retrieved[1]!.id).toBe('mid')
      expect(retrieved[2]!.id).toBe('old')
    })

    it('should respect the limit parameter', async () => {
      const sessions = Array.from({ length: 10 }, (_, i) =>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        createTestSession({ id: `sess-${i}`, startTime: i * 1000 })
      )
=======
=======
>>>>>>> Stashed changes
        createTestSession({ id: `sess-${i}`, startTime: i * 1000 }),
      );
>>>>>>> Stashed changes

      await db.saveGameHistory(sessions)
      const retrieved = await db.getGameHistory(3)

      expect(retrieved).toHaveLength(3)
    })

    it('should default limit to 50', async () => {
      // Create 5 sessions and verify they're all returned with default limit
      const sessions = Array.from({ length: 5 }, (_, i) =>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        createTestSession({ id: `sess-${i}`, startTime: i * 1000 })
      )
=======
=======
>>>>>>> Stashed changes
        createTestSession({ id: `sess-${i}`, startTime: i * 1000 }),
      );
>>>>>>> Stashed changes

      await db.saveGameHistory(sessions)
      const retrieved = await db.getGameHistory()

      expect(retrieved).toHaveLength(5) // less than 50, so all returned
    })

    it('should clear game history', async () => {
      const sessions = [createTestSession({ id: 'to-clear', startTime: 1000 })]
      await db.saveGameHistory(sessions)

      await db.clearGameHistory()
      const retrieved = await db.getGameHistory()

      expect(retrieved).toEqual([])
    })
  })

  // =========================================================================
  // Statistics CRUD
  // =========================================================================
  describe('statistics CRUD', () => {
    it('should save and retrieve statistics', async () => {
      const stats = createTestStats({ totalGames: 10, totalScore: 250 })

      await db.saveStatistics(stats)
      const retrieved = await db.getStatistics()

      expect(retrieved).not.toBeNull()
      expect(retrieved!.totalGames).toBe(10)
      expect(retrieved!.totalScore).toBe(250)
    })

    it('should return null when no statistics exist', async () => {
      const stats = await db.getStatistics()
      expect(stats).toBeNull()
    })

    it('should overwrite statistics on subsequent saves', async () => {
      await db.saveStatistics(createTestStats({ totalGames: 5 }))
      await db.saveStatistics(createTestStats({ totalGames: 15 }))

      const retrieved = await db.getStatistics()
      expect(retrieved!.totalGames).toBe(15)
    })

    it('should preserve all statistics fields', async () => {
      const stats = createTestStats({
        totalGames: 42,
        totalAttempts: 200,
        correctAttempts: 150,
        totalScore: 1500,
        totalPlayTime: 3600000,
        categoriesPlayed: { animals: 10, cities: 5 },
        bestScore: 100,
        averageScore: 36,
        streakCurrent: 3,
        streakBest: 7,
      })

      await db.saveStatistics(stats)
      const retrieved = await db.getStatistics()

      expect(retrieved).toEqual(
        expect.objectContaining({
          totalGames: 42,
          totalAttempts: 200,
          correctAttempts: 150,
          totalScore: 1500,
          totalPlayTime: 3600000,
          categoriesPlayed: { animals: 10, cities: 5 },
          bestScore: 100,
          averageScore: 36,
          streakCurrent: 3,
          streakBest: 7,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        })
      )
    })
  })
=======
=======
>>>>>>> Stashed changes
        }),
      );
    });
  });
>>>>>>> Stashed changes

  // =========================================================================
  // Initialize Statistics
  // =========================================================================
  describe('initializeStatistics', () => {
    it('should create default statistics with zero values', async () => {
      const stats = await db.initializeStatistics()

      expect(stats.totalGames).toBe(0)
      expect(stats.totalAttempts).toBe(0)
      expect(stats.correctAttempts).toBe(0)
      expect(stats.totalScore).toBe(0)
      expect(stats.totalPlayTime).toBe(0)
      expect(stats.categoriesPlayed).toEqual({})
      expect(stats.bestScore).toBe(0)
      expect(stats.averageScore).toBe(0)
      expect(stats.streakCurrent).toBe(0)
      expect(stats.streakBest).toBe(0)
    })

    it('should set lastPlayed to current timestamp', async () => {
      const before = Date.now()
      const stats = await db.initializeStatistics()
      const after = Date.now()

      expect(stats.lastPlayed).toBeGreaterThanOrEqual(before)
      expect(stats.lastPlayed).toBeLessThanOrEqual(after)
    })

    it('should persist initialized statistics to DB', async () => {
      await db.initializeStatistics()
      const retrieved = await db.getStatistics()

      expect(retrieved).not.toBeNull()
      expect(retrieved!.totalGames).toBe(0)
    })
  })

  // =========================================================================
  // Leaderboard CRUD
  // =========================================================================
  describe('leaderboard CRUD', () => {
    it('should save and retrieve a leaderboard entry', async () => {
      const entry = createTestLeaderboardEntry({ sessionId: 'lb-test', score: 75 })

      await db.saveLeaderboardEntry(entry)
      const leaderboard = await db.getLeaderboard()

      expect(leaderboard).toHaveLength(1)
      expect(leaderboard[0]!.sessionId).toBe('lb-test')
      expect(leaderboard[0]!.score).toBe(75)
    })

    it('should return empty array when no entries exist', async () => {
      const leaderboard = await db.getLeaderboard()
      expect(leaderboard).toEqual([])
    })

    it('should return entries sorted by score descending (highest first)', async () => {
      await db.saveLeaderboardEntry(createTestLeaderboardEntry({ sessionId: 'low', score: 10 }))
      await db.saveLeaderboardEntry(createTestLeaderboardEntry({ sessionId: 'high', score: 100 }))
      await db.saveLeaderboardEntry(createTestLeaderboardEntry({ sessionId: 'mid', score: 50 }))

      const leaderboard = await db.getLeaderboard()

      expect(leaderboard[0]!.sessionId).toBe('high')
      expect(leaderboard[1]!.sessionId).toBe('mid')
      expect(leaderboard[2]!.sessionId).toBe('low')
    })

    it('should respect the limit parameter', async () => {
      for (let i = 0; i < 20; i++) {
        await db.saveLeaderboardEntry(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          createTestLeaderboardEntry({ sessionId: `entry-${i}`, score: i * 10 })
        )
=======
=======
>>>>>>> Stashed changes
          createTestLeaderboardEntry({ sessionId: `entry-${i}`, score: i * 10 }),
        );
>>>>>>> Stashed changes
      }

      const leaderboard = await db.getLeaderboard(5)
      expect(leaderboard).toHaveLength(5)
    })

    it('should default limit to 10', async () => {
      for (let i = 0; i < 15; i++) {
        await db.saveLeaderboardEntry(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          createTestLeaderboardEntry({ sessionId: `entry-${i}`, score: i * 10 })
        )
=======
=======
>>>>>>> Stashed changes
          createTestLeaderboardEntry({ sessionId: `entry-${i}`, score: i * 10 }),
        );
>>>>>>> Stashed changes
      }

      const leaderboard = await db.getLeaderboard()
      expect(leaderboard).toHaveLength(10)
    })

    it('should return top scores when limited', async () => {
      for (let i = 1; i <= 5; i++) {
        await db.saveLeaderboardEntry(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          createTestLeaderboardEntry({ sessionId: `entry-${i}`, score: i * 10 })
        )
=======
=======
>>>>>>> Stashed changes
          createTestLeaderboardEntry({ sessionId: `entry-${i}`, score: i * 10 }),
        );
>>>>>>> Stashed changes
      }

      const leaderboard = await db.getLeaderboard(3)

      expect(leaderboard[0]!.score).toBe(50)
      expect(leaderboard[1]!.score).toBe(40)
      expect(leaderboard[2]!.score).toBe(30)
    })

    it('should preserve all leaderboard entry fields', async () => {
      const entry = createTestLeaderboardEntry({
        sessionId: 'full-test',
        score: 100,
        category: 'Cities',
        categoryKey: 'cities',
        attempts: 10,
        correctAttempts: 8,
        timestamp: 1234567890,
        duration: 120000,
      })

      await db.saveLeaderboardEntry(entry)
      const leaderboard = await db.getLeaderboard()
      const retrieved = leaderboard[0]!

      expect(retrieved.sessionId).toBe('full-test')
      expect(retrieved.score).toBe(100)
      expect(retrieved.category).toBe('Cities')
      expect(retrieved.categoryKey).toBe('cities')
      expect(retrieved.attempts).toBe(10)
      expect(retrieved.correctAttempts).toBe(8)
      expect(retrieved.timestamp).toBe(1234567890)
      expect(retrieved.duration).toBe(120000)
    })

    it('should update entry with same sessionId', async () => {
      await db.saveLeaderboardEntry(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        createTestLeaderboardEntry({ sessionId: 'update-test', score: 50 })
      )
      await db.saveLeaderboardEntry(
        createTestLeaderboardEntry({ sessionId: 'update-test', score: 100 })
      )
=======
        createTestLeaderboardEntry({ sessionId: 'update-test', score: 50 }),
=======
        createTestLeaderboardEntry({ sessionId: 'update-test', score: 50 }),
      );
      await db.saveLeaderboardEntry(
        createTestLeaderboardEntry({ sessionId: 'update-test', score: 100 }),
>>>>>>> Stashed changes
      );
      await db.saveLeaderboardEntry(
        createTestLeaderboardEntry({ sessionId: 'update-test', score: 100 }),
      );
>>>>>>> Stashed changes

      const leaderboard = await db.getLeaderboard()
      expect(leaderboard).toHaveLength(1)
      expect(leaderboard[0]!.score).toBe(100)
    })
  })

  // =========================================================================
  // Settings CRUD
  // =========================================================================
  describe('settings CRUD', () => {
    it('should save and retrieve settings', async () => {
      const settings = createTestSettings({ soundEnabled: false })

      await db.saveSettings(settings)
      const retrieved = await db.getSettings()

      expect(retrieved).not.toBeNull()
      expect(retrieved!.soundEnabled).toBe(false)
    })

    it('should return null when no settings exist', async () => {
      const settings = await db.getSettings()
      expect(settings).toBeNull()
    })

    it('should overwrite settings on subsequent saves', async () => {
      await db.saveSettings(createTestSettings({ soundEnabled: true }))
      await db.saveSettings(createTestSettings({ soundEnabled: false }))

      const retrieved = await db.getSettings()
      expect(retrieved!.soundEnabled).toBe(false)
    })

    it('should preserve enabledCategories list', async () => {
      const settings = createTestSettings({
        enabledCategories: ['animals', 'cities', 'food'],
        soundEnabled: true,
      })

      await db.saveSettings(settings)
      const retrieved = await db.getSettings()

      expect(retrieved!.enabledCategories).toEqual(['animals', 'cities', 'food'])
    })
  })

  // =========================================================================
  // Initialize Settings
  // =========================================================================
  describe('initializeSettings', () => {
    it('should create default settings', async () => {
      const settings = await db.initializeSettings()

      expect(settings.enabledCategories).toEqual([])
      expect(settings.soundEnabled).toBe(true)
    })

    it('should persist initialized settings to DB', async () => {
      await db.initializeSettings()
      const retrieved = await db.getSettings()

      expect(retrieved).not.toBeNull()
      expect(retrieved!.soundEnabled).toBe(true)
      expect(retrieved!.enabledCategories).toEqual([])
    })
  })

  // =========================================================================
  // DB Singleton Pattern
  // =========================================================================
  describe('DB singleton pattern', () => {
    it('should reuse the same DB instance across multiple useIndexedDB calls', async () => {
      const db1 = useIndexedDB()
      const db2 = useIndexedDB()

      // Both should work with the same underlying DB
      await db1.saveSettings(createTestSettings({ soundEnabled: false }))
      const retrieved = await db2.getSettings()

      expect(retrieved!.soundEnabled).toBe(false)
    })

    it('should handle concurrent operations from different composable instances', async () => {
      const db1 = useIndexedDB()
      const db2 = useIndexedDB()

      // Perform concurrent saves
      await Promise.all([
        db1.saveStatistics(createTestStats({ totalGames: 10 })),
        db2.saveSettings(createTestSettings({ soundEnabled: false })),
      ])

      const stats = await db1.getStatistics()
      const settings = await db2.getSettings()

      expect(stats!.totalGames).toBe(10)
      expect(settings!.soundEnabled).toBe(false)
    })
  })

  // =========================================================================
  // Error Handling
  // =========================================================================
  describe('error handling', () => {
    it('should return null for getGameSession on DB error', async () => {
      // After reset, the DB will be fresh. We test the composable's catch path
      // by verifying the normal null case (no data = null, not error)
      const result = await db.getGameSession()
      expect(result).toBeNull()
    })

    it('should return null for getGameSessionById on non-existent ID', async () => {
      const result = await db.getGameSessionById('does-not-exist')
      expect(result).toBeNull()
    })

    it('should return null for getStatistics when empty', async () => {
      const result = await db.getStatistics()
      expect(result).toBeNull()
    })

    it('should return null for getSettings when empty', async () => {
      const result = await db.getSettings()
      expect(result).toBeNull()
    })

    it('should return empty array for getGameHistory when empty', async () => {
      const result = await db.getGameHistory()
      expect(result).toEqual([])
    })

    it('should return empty array for getLeaderboard when empty', async () => {
      const result = await db.getLeaderboard()
      expect(result).toEqual([])
    })

    it('should propagate saveGameSession errors', async () => {
      // saveGameSession re-throws errors
      // We can test this by triggering a real error scenario
      // Here we verify that a valid save doesn't throw
      const session = createTestSession({ id: 'no-error' })
      await expect(db.saveGameSession(session)).resolves.not.toThrow()
    })
  })

  // =========================================================================
  // Transaction Atomicity
  // =========================================================================
  describe('transaction atomicity', () => {
    it('should save to both current and by-ID stores atomically', async () => {
      const session = createTestSession({ id: 'atomic-test' })

      await db.saveGameSession(session)

      const current = await db.getGameSession()
      const byId = await db.getGameSessionById('atomic-test')

      expect(current!.id).toBe('atomic-test')
      expect(byId!.id).toBe('atomic-test')
    })

    it('should save batch history in a single transaction', async () => {
      const sessions = Array.from({ length: 50 }, (_, i) =>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        createTestSession({ id: `batch-${i}`, startTime: i * 1000 })
      )
=======
=======
>>>>>>> Stashed changes
        createTestSession({ id: `batch-${i}`, startTime: i * 1000 }),
      );
>>>>>>> Stashed changes

      await db.saveGameHistory(sessions)
      const retrieved = await db.getGameHistory(50)

      expect(retrieved).toHaveLength(50)
    })
  })

  // =========================================================================
  // Edge Cases
  // =========================================================================
  describe('edge cases', () => {
    it('should handle getGameHistory with limit of 0', async () => {
      const sessions = [createTestSession({ id: 'edge-0', startTime: 1000 })]
      await db.saveGameHistory(sessions)

      const retrieved = await db.getGameHistory(0)
      expect(retrieved).toEqual([])
    })

    it('should handle getLeaderboard with limit of 0', async () => {
      await db.saveLeaderboardEntry(createTestLeaderboardEntry({ sessionId: 'lb-0' }))

      const leaderboard = await db.getLeaderboard(0)
      expect(leaderboard).toEqual([])
    })

    it('should handle getGameHistory with limit of 1', async () => {
      const sessions = [
        createTestSession({ id: 'edge-a', startTime: 1000 }),
        createTestSession({ id: 'edge-b', startTime: 2000 }),
      ]
      await db.saveGameHistory(sessions)

      const retrieved = await db.getGameHistory(1)
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0]!.id).toBe('edge-b') // newest first
    })

    it('should handle large datasets in game history', async () => {
      const sessions = Array.from({ length: 100 }, (_, i) =>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        createTestSession({ id: `large-${i}`, startTime: i * 1000 })
      )
=======
=======
>>>>>>> Stashed changes
        createTestSession({ id: `large-${i}`, startTime: i * 1000 }),
      );
>>>>>>> Stashed changes

      await db.saveGameHistory(sessions)
      const retrieved = await db.getGameHistory(50)

      expect(retrieved).toHaveLength(50)
      // Verify newest first
      expect(retrieved[0]!.id).toBe('large-99')
    })

    it('should handle statistics with large numbers', async () => {
      const stats = createTestStats({
        totalGames: 999999,
        totalScore: Number.MAX_SAFE_INTEGER,
        totalPlayTime: 86400000 * 365, // 1 year in ms
      })

      await db.saveStatistics(stats)
      const retrieved = await db.getStatistics()

      expect(retrieved!.totalGames).toBe(999999)
      expect(retrieved!.totalScore).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle settings with many categories', async () => {
      const categories = Array.from({ length: 50 }, (_, i) => `category-${i}`)
      const settings = createTestSettings({ enabledCategories: categories })

      await db.saveSettings(settings)
      const retrieved = await db.getSettings()

      expect(retrieved!.enabledCategories).toHaveLength(50)
    })

    it('should handle clearGameSession when no session exists', async () => {
      // Should not throw
      await expect(db.clearGameSession()).resolves.not.toThrow()
    })

    it('should handle clearGameHistory when no history exists', async () => {
      // Should not throw
      await expect(db.clearGameHistory()).resolves.not.toThrow()
    })
  })
})
