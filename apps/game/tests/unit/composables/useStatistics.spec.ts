import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import type { GameSession, GameStatistics } from '@riddle-rush/types/game'

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
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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
      { term: 'Xylophone', found: false, timestamp: Date.now() - 30000 },
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

// Dynamic import references refreshed per test
let useStatistics: typeof import('../../../composables/useStatistics').useStatistics
let useIndexedDB: typeof import('../../../composables/useIndexedDB').useIndexedDB

describe('useStatistics', () => {
  let statistics: ReturnType<typeof useStatistics>
  let indexedDB: ReturnType<typeof useIndexedDB>

  beforeEach(async () => {
    // Reset modules to clear the cached dbInstance/dbPromise singletons
    vi.resetModules()

    // Create a fresh IDBFactory for each test to avoid data leaking between tests.
    // fake-indexeddb's global `indexedDB` is a singleton that persists across vi.resetModules(),
    // so we install a brand new factory on the global scope before each test.
    globalThis.indexedDB = new IDBFactory()

    // Re-import fresh module instances
    const statsModule = await import('../../../composables/useStatistics')
    const dbModule = await import('../../../composables/useIndexedDB')
    useStatistics = statsModule.useStatistics
    useIndexedDB = dbModule.useIndexedDB

    statistics = useStatistics()
    indexedDB = useIndexedDB()
  })

  describe('getStats', () => {
    it('should return initialized default stats when no stats exist', async () => {
      const stats = await statistics.getStats()

      expect(stats).toBeDefined()
      expect(stats.totalGames).toBe(0)
      expect(stats.totalScore).toBe(0)
      expect(stats.totalAttempts).toBe(0)
      expect(stats.correctAttempts).toBe(0)
      expect(stats.bestScore).toBe(0)
      expect(stats.averageScore).toBe(0)
      expect(stats.streakCurrent).toBe(0)
      expect(stats.streakBest).toBe(0)
      expect(stats.totalPlayTime).toBe(0)
      expect(stats.categoriesPlayed).toEqual({})
    })

    it('should return existing stats when they exist', async () => {
      const existingStats = createTestStats({
        totalGames: 5,
        totalScore: 100,
        bestScore: 50,
      })
      await indexedDB.saveStatistics(existingStats)

      const stats = await statistics.getStats()

      expect(stats.totalGames).toBe(5)
      expect(stats.totalScore).toBe(100)
      expect(stats.bestScore).toBe(50)
    })
  })

  describe('updateStatistics', () => {
    it('should update stats for a completed single-player session', async () => {
      const session = createTestSession({
        score: 30,
        attempts: [
          { term: 'Ant', found: true, timestamp: Date.now() - 50000 },
          { term: 'Axolotl', found: true, timestamp: Date.now() - 40000 },
          { term: 'Xyz', found: false, timestamp: Date.now() - 30000 },
        ],
      })

      const result = await statistics.updateStatistics(session)

      expect(result).toBeDefined()
      expect(result!.totalGames).toBe(1)
      expect(result!.totalAttempts).toBe(3)
      expect(result!.correctAttempts).toBe(2)
      expect(result!.totalScore).toBe(30)
    })

    it('should skip sessions without endTime', async () => {
      const session = createTestSession({ endTime: undefined })

      const result = await statistics.updateStatistics(session)

      expect(result).toBeUndefined()
    })

    it('should skip multi-player sessions (players array non-empty)', async () => {
      const session = createTestSession({
        players: [
          { id: 'p1', name: 'Alice', totalScore: 10, currentRoundScore: 0, hasSubmitted: false },
        ],
      })

      const result = await statistics.updateStatistics(session)

      expect(result).toBeUndefined()
    })

    it('should skip sessions without attempts', async () => {
      const session = createTestSession({ attempts: undefined })

      const result = await statistics.updateStatistics(session)

      expect(result).toBeUndefined()
    })

    it('should skip sessions without a score', async () => {
      const session = createTestSession({ score: undefined })

      const result = await statistics.updateStatistics(session)

      expect(result).toBeUndefined()
    })

    it('should accumulate stats across multiple sessions', async () => {
      const session1 = createTestSession({
        id: 'sess-1',
        score: 20,
        attempts: [
          { term: 'Ant', found: true, timestamp: Date.now() },
          { term: 'Bad', found: false, timestamp: Date.now() },
        ],
        category: {
          id: 1,
          name: 'Animals',
          searchWord: 'animals',
          key: 'animals',
          searchProvider: 'offline',
        },
      })

      const session2 = createTestSession({
        id: 'sess-2',
        score: 30,
        attempts: [
          { term: 'Berlin', found: true, timestamp: Date.now() },
          { term: 'Boston', found: true, timestamp: Date.now() },
          { term: 'Xyz', found: false, timestamp: Date.now() },
        ],
        category: {
          id: 2,
          name: 'Cities',
          searchWord: 'cities',
          key: 'cities',
          searchProvider: 'offline',
        },
      })

      await statistics.updateStatistics(session1)
      const result = await statistics.updateStatistics(session2)

      expect(result!.totalGames).toBe(2)
      expect(result!.totalAttempts).toBe(5)
      expect(result!.correctAttempts).toBe(3)
      expect(result!.totalScore).toBe(50)
    })

    it('should calculate average score correctly', async () => {
      const session1 = createTestSession({ id: 'sess-1', score: 20 })
      const session2 = createTestSession({ id: 'sess-2', score: 40 })

      await statistics.updateStatistics(session1)
      const result = await statistics.updateStatistics(session2)

      expect(result!.averageScore).toBe(30) // (20+40)/2
    })

    it('should update best score when new session exceeds it', async () => {
      const session1 = createTestSession({ id: 'sess-1', score: 20 })
      const session2 = createTestSession({ id: 'sess-2', score: 50 })

      await statistics.updateStatistics(session1)
      const result = await statistics.updateStatistics(session2)

      expect(result!.bestScore).toBe(50)
    })

    it('should not lower best score when new session scores less', async () => {
      const session1 = createTestSession({ id: 'sess-1', score: 50 })
      const session2 = createTestSession({ id: 'sess-2', score: 10 })

      await statistics.updateStatistics(session1)
      const result = await statistics.updateStatistics(session2)

      expect(result!.bestScore).toBe(50)
    })

    it('should track play duration', async () => {
      const startTime = Date.now() - 120000 // 2 minutes ago
      const endTime = Date.now()
      const session = createTestSession({ startTime, endTime })

      const result = await statistics.updateStatistics(session)

      expect(result!.totalPlayTime).toBe(endTime - startTime)
    })

    it('should track category usage', async () => {
      const session1 = createTestSession({
        id: 'sess-1',
        category: {
          id: 1,
          name: 'Animals',
          searchWord: 'animals',
          key: 'animals',
          searchProvider: 'offline',
        },
      })
      const session2 = createTestSession({
        id: 'sess-2',
        category: {
          id: 1,
          name: 'Animals',
          searchWord: 'animals',
          key: 'animals',
          searchProvider: 'offline',
        },
      })
      const session3 = createTestSession({
        id: 'sess-3',
        category: {
          id: 2,
          name: 'Cities',
          searchWord: 'cities',
          key: 'cities',
          searchProvider: 'offline',
        },
      })

      await statistics.updateStatistics(session1)
      await statistics.updateStatistics(session2)
      const result = await statistics.updateStatistics(session3)

      expect(result!.categoriesPlayed).toEqual({ animals: 2, cities: 1 })
    })

    it('should update lastPlayed timestamp', async () => {
      const endTime = Date.now()
      const session = createTestSession({ endTime })

      const result = await statistics.updateStatistics(session)

      expect(result!.lastPlayed).toBe(endTime)
    })
  })

  describe('streak tracking', () => {
    it('should increment streak when session has correct answers', async () => {
      const session = createTestSession({
        attempts: [{ term: 'Ant', found: true, timestamp: Date.now() }],
      })

      const result = await statistics.updateStatistics(session)

      expect(result!.streakCurrent).toBe(1)
    })

    it('should reset streak when session has zero correct answers', async () => {
      const session1 = createTestSession({
        id: 'sess-1',
        attempts: [{ term: 'Ant', found: true, timestamp: Date.now() }],
      })
      const session2 = createTestSession({
        id: 'sess-2',
        attempts: [{ term: 'Bad', found: false, timestamp: Date.now() }],
      })

      await statistics.updateStatistics(session1)
      const result = await statistics.updateStatistics(session2)

      expect(result!.streakCurrent).toBe(0)
    })

    it('should track best streak across multiple sessions', async () => {
      // Build a 3-game streak
      for (let i = 1; i <= 3; i++) {
        await statistics.updateStatistics(
          createTestSession({
            id: `sess-${i}`,
            attempts: [{ term: 'Word', found: true, timestamp: Date.now() }],
          })
        )
      }
      // Break the streak
      await statistics.updateStatistics(
        createTestSession({
          id: 'sess-break',
          attempts: [{ term: 'Wrong', found: false, timestamp: Date.now() }],
        })
      )
      // Start a 2-game streak
      for (let i = 5; i <= 6; i++) {
        await statistics.updateStatistics(
          createTestSession({
            id: `sess-${i}`,
            attempts: [{ term: 'Word', found: true, timestamp: Date.now() }],
          })
        )
      }

      const stats = await statistics.getStats()
      expect(stats.streakBest).toBe(3)
      expect(stats.streakCurrent).toBe(2)
    })
  })

  describe('leaderboard integration', () => {
    it('should save to leaderboard when score >= 10', async () => {
      const session = createTestSession({ score: 15 })

      await statistics.updateStatistics(session)

      const leaderboard = await indexedDB.getLeaderboard()
      expect(leaderboard).toHaveLength(1)
      expect(leaderboard[0]!.score).toBe(15)
    })

    it('should not save to leaderboard when score < 10', async () => {
      const session = createTestSession({ score: 5 })

      await statistics.updateStatistics(session)

      const leaderboard = await indexedDB.getLeaderboard()
      expect(leaderboard).toHaveLength(0)
    })

    it('should save leaderboard entry with correct fields', async () => {
      const startTime = Date.now() - 120000
      const endTime = Date.now()
      const session = createTestSession({
        id: 'test-session-id',
        score: 25,
        startTime,
        endTime,
        attempts: [
          { term: 'Ant', found: true, timestamp: Date.now() },
          { term: 'Bad', found: false, timestamp: Date.now() },
        ],
        category: {
          id: 1,
          name: 'Animals',
          searchWord: 'animals',
          key: 'animals',
          searchProvider: 'offline',
        },
      })

      await statistics.updateStatistics(session)

      const leaderboard = await indexedDB.getLeaderboard()
      const entry = leaderboard[0]!
      expect(entry.sessionId).toBe('test-session-id')
      expect(entry.score).toBe(25)
      expect(entry.category).toBe('Animals')
      expect(entry.categoryKey).toBe('animals')
      expect(entry.attempts).toBe(2)
      expect(entry.correctAttempts).toBe(1)
      expect(entry.timestamp).toBe(endTime)
      expect(entry.duration).toBe(endTime - startTime)
    })
  })

  describe('resetStatistics', () => {
    it('should reset all stats to defaults', async () => {
      // First build some stats
      await statistics.updateStatistics(createTestSession({ score: 50 }))

      const resetStats = await statistics.resetStatistics()

      expect(resetStats.totalGames).toBe(0)
      expect(resetStats.totalScore).toBe(0)
      expect(resetStats.bestScore).toBe(0)
      expect(resetStats.streakCurrent).toBe(0)
      expect(resetStats.streakBest).toBe(0)
    })

    it('should persist reset to IndexedDB', async () => {
      await statistics.updateStatistics(createTestSession({ score: 50 }))
      await statistics.resetStatistics()

      const stats = await statistics.getStats()
      expect(stats.totalGames).toBe(0)
    })
  })

  describe('getBadges', () => {
    it('should return all badges with unlocked status', async () => {
      const badges = await statistics.getBadges()

      expect(badges).toBeInstanceOf(Array)
      expect(badges.length).toBeGreaterThan(0)
      // Each badge should have required fields
      for (const badge of badges) {
        expect(badge).toHaveProperty('id')
        expect(badge).toHaveProperty('name')
        expect(badge).toHaveProperty('emoji')
        expect(badge).toHaveProperty('description')
        expect(badge).toHaveProperty('unlocked')
      }
    })

    it('should unlock first-steps badge after 1 game', async () => {
      await statistics.updateStatistics(createTestSession({ score: 10 }))

      const badges = await statistics.getBadges()
      const firstSteps = badges.find((b) => b.id === 'first-steps')

      expect(firstSteps!.unlocked).toBe(true)
    })

    it('should not unlock persistent badge with fewer than 10 games', async () => {
      await statistics.updateStatistics(createTestSession({ score: 10 }))

      const badges = await statistics.getBadges()
      const persistent = badges.find((b) => b.id === 'persistent')

      expect(persistent!.unlocked).toBe(false)
    })

    it('should unlock persistent badge after 10 games', async () => {
      for (let i = 0; i < 10; i++) {
        await statistics.updateStatistics(createTestSession({ id: `sess-${i}`, score: 10 }))
      }

      const badges = await statistics.getBadges()
      const persistent = badges.find((b) => b.id === 'persistent')

      expect(persistent!.unlocked).toBe(true)
    })

    it('should unlock oops-champion badge after 50 wrong answers', async () => {
      const stats = createTestStats({
        totalGames: 10,
        totalAttempts: 100,
        correctAttempts: 40, // 60 wrong
      })
      await indexedDB.saveStatistics(stats)

      const badges = await statistics.getBadges()
      const oops = badges.find((b) => b.id === 'oops-champion')

      expect(oops!.unlocked).toBe(true)
    })

    it('should unlock sharpshooter badge after 100 correct answers', async () => {
      const stats = createTestStats({
        totalGames: 20,
        correctAttempts: 100,
        totalAttempts: 150,
      })
      await indexedDB.saveStatistics(stats)

      const badges = await statistics.getBadges()
      const sharpshooter = badges.find((b) => b.id === 'sharpshooter')

      expect(sharpshooter!.unlocked).toBe(true)
    })

    it('should unlock streak-master badge with best streak >= 5', async () => {
      const stats = createTestStats({ streakBest: 5 })
      await indexedDB.saveStatistics(stats)

      const badges = await statistics.getBadges()
      const streakMaster = badges.find((b) => b.id === 'streak-master')

      expect(streakMaster!.unlocked).toBe(true)
    })

    it('should unlock high-roller badge with best score >= 100', async () => {
      const stats = createTestStats({ bestScore: 100 })
      await indexedDB.saveStatistics(stats)

      const badges = await statistics.getBadges()
      const highRoller = badges.find((b) => b.id === 'high-roller')

      expect(highRoller!.unlocked).toBe(true)
    })

    it('should unlock variety-lover badge with 5 different categories', async () => {
      const stats = createTestStats({
        categoriesPlayed: { animals: 3, cities: 2, food: 1, sports: 4, music: 1 },
      })
      await indexedDB.saveStatistics(stats)

      const badges = await statistics.getBadges()
      const variety = badges.find((b) => b.id === 'variety-lover')

      expect(variety!.unlocked).toBe(true)
    })

    it('should unlock marathon-runner badge after 1 hour of play', async () => {
      const stats = createTestStats({ totalPlayTime: 3600000 }) // 1 hour
      await indexedDB.saveStatistics(stats)

      const badges = await statistics.getBadges()
      const marathon = badges.find((b) => b.id === 'marathon-runner')

      expect(marathon!.unlocked).toBe(true)
    })

    it('should have all time-independent badges locked for fresh stats', async () => {
      const badges = await statistics.getBadges()

      // night-owl and early-bird depend on current time, so exclude them
      const timeIndependentBadges = badges.filter(
        (b) => b.id !== 'night-owl' && b.id !== 'early-bird'
      )
      const unlockedTimeIndependent = timeIndependentBadges.filter((b) => b.unlocked)

      expect(unlockedTimeIndependent).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle a session with zero attempts correctly', async () => {
      const session = createTestSession({
        score: 0,
        attempts: [],
      })

      const result = await statistics.updateStatistics(session)

      expect(result!.totalGames).toBe(1)
      expect(result!.totalAttempts).toBe(0)
      expect(result!.correctAttempts).toBe(0)
      expect(result!.streakCurrent).toBe(0)
    })

    it('should handle a session where all attempts are correct', async () => {
      const session = createTestSession({
        score: 30,
        attempts: [
          { term: 'A', found: true, timestamp: Date.now() },
          { term: 'B', found: true, timestamp: Date.now() },
          { term: 'C', found: true, timestamp: Date.now() },
        ],
      })

      const result = await statistics.updateStatistics(session)

      expect(result!.correctAttempts).toBe(3)
      expect(result!.streakCurrent).toBe(1)
    })

    it('should save to leaderboard when score is exactly 10', async () => {
      const session = createTestSession({ score: 10 })

      await statistics.updateStatistics(session)

      const leaderboard = await indexedDB.getLeaderboard()
      expect(leaderboard).toHaveLength(1)
    })

    it('should not save to leaderboard when score is 9', async () => {
      const session = createTestSession({ score: 9 })

      await statistics.updateStatistics(session)

      const leaderboard = await indexedDB.getLeaderboard()
      expect(leaderboard).toHaveLength(0)
    })

    it('should correctly round average score', async () => {
      // 10 + 11 = 21, 21/2 = 10.5, Math.round = 11
      const session1 = createTestSession({ id: 'sess-1', score: 10 })
      const session2 = createTestSession({ id: 'sess-2', score: 11 })

      await statistics.updateStatistics(session1)
      const result = await statistics.updateStatistics(session2)

      // (10 + 11) / 2 = 10.5 -> Math.round -> 11
      expect(result!.averageScore).toBe(11)
    })

    it('should handle single game average score', async () => {
      const session = createTestSession({ score: 42 })

      const result = await statistics.updateStatistics(session)

      expect(result!.averageScore).toBe(42)
    })
  })
})
