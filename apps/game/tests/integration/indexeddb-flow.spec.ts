/**
 * Integration tests for IndexedDB flow using useIndexedDB composable.
 *
 * Tests cover the full persistence lifecycle:
 * - Game session save/retrieve/clear
 * - Game session lookup by ID
 * - Game history save/retrieve/clear
 * - Statistics save/retrieve/initialize
 * - Leaderboard save/retrieve
 * - Settings save/retrieve/initialize
 * - Data integrity across multiple save-load cycles
 * - Concurrent-write behaviour
 *
 * fake-indexeddb/auto provides a real in-memory IDBFactory that fully conforms
 * to the IndexedDB spec, so we exercise the actual composable without a browser.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import type {
  GameSession,
  GameStatistics,
  LeaderboardEntry,
  CategorySettings,
} from '@riddle-rush/types/game'

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────

vi.mock('../../composables/useLogger', () => ({
  useLogger: () => ({
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }),
}))

// ──────────────────────────────────────────────
// Type alias for dynamic re-import
// ──────────────────────────────────────────────

let useIndexedDB: typeof import('../../composables/useIndexedDB').useIndexedDB

// ──────────────────────────────────────────────
// Test factories
// ──────────────────────────────────────────────

function createTestSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    id: overrides.id ?? `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    players: overrides.players ?? [],
    currentRound: overrides.currentRound ?? 1,
    currentPlayerIndex: overrides.currentPlayerIndex ?? 0,
    category: overrides.category ?? {
      id: 1,
      name: 'Animals',
      searchWord: 'animals',
      key: 'animals',
      searchProvider: 'offline',
    },
    letter: overrides.letter ?? 'A',
    startTime: overrides.startTime ?? Date.now() - 60_000,
    endTime: overrides.endTime ?? Date.now(),
    score: overrides.score ?? 10,
    attempts: overrides.attempts ?? [],
    status: overrides.status ?? 'completed',
    roundHistory: overrides.roundHistory ?? [],
    ...overrides,
  }
}

function createTestStats(overrides: Partial<GameStatistics> = {}): GameStatistics {
  return {
    totalGames: 5,
    totalAttempts: 50,
    correctAttempts: 40,
    totalScore: 200,
    totalPlayTime: 3600,
    categoriesPlayed: { animals: 3, vehicles: 2 },
    lastPlayed: Date.now(),
    bestScore: 80,
    averageScore: 40,
    streakCurrent: 2,
    streakBest: 5,
    ...overrides,
  }
}

function createTestLeaderboardEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    sessionId: overrides.sessionId ?? `session-${Math.random().toString(36).slice(2)}`,
    score: overrides.score ?? 50,
    category: overrides.category ?? 'Animals',
    categoryKey: overrides.categoryKey ?? 'animals',
    playerName: overrides.playerName ?? 'Alice',
    attempts: overrides.attempts ?? 10,
    correctAttempts: overrides.correctAttempts ?? 5,
    letter: overrides.letter ?? 'A',
    timestamp: overrides.timestamp ?? Date.now(),
    duration: overrides.duration ?? 120,
    ...overrides,
  }
}

// ──────────────────────────────────────────────
// Reset IndexedDB + composable module per test
// ──────────────────────────────────────────────

beforeEach(async () => {
  // Clear module registry so the cached dbInstance/dbPromise singletons are reset
  vi.resetModules()

  // Install a fresh IDBFactory — fake-indexeddb/auto's global singleton persists
  // across vi.resetModules(), so we must swap it out explicitly.
  const freshFactory = new IDBFactory()
  globalThis.indexedDB = freshFactory

  // Re-import fresh module
  const mod = await import('../../composables/useIndexedDB')
  useIndexedDB = mod.useIndexedDB
})

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe('IndexedDB', () => {
  // ----------------------------------------------------------------
  // 1. Game session CRUD
  // ----------------------------------------------------------------
  describe('game session persistence', () => {
    it('saves and retrieves the current game session', async () => {
      const db = useIndexedDB()
      const session = createTestSession({ id: 'test-save-retrieve', score: 42 })

      await db.saveGameSession(session)
      const retrieved = await db.getGameSession()

      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe('test-save-retrieve')
      expect(retrieved!.score).toBe(42)
    })

    it('returns null when no session has been saved', async () => {
      const db = useIndexedDB()
      const session = await db.getGameSession()
      expect(session).toBeNull()
    })

    it('preserves all required fields on roundtrip', async () => {
      const db = useIndexedDB()
      const session = createTestSession({
        id: 'full-fields',
        letter: 'Z',
        score: 99,
        status: 'completed',
        currentRound: 3,
        currentPlayerIndex: 1,
      })

      await db.saveGameSession(session)
      const retrieved = await db.getGameSession()

      expect(retrieved!.letter).toBe('Z')
      expect(retrieved!.score).toBe(99)
      expect(retrieved!.status).toBe('completed')
      expect(retrieved!.currentRound).toBe(3)
      expect(retrieved!.currentPlayerIndex).toBe(1)
    })

    it('overwrites the previous session when saved again', async () => {
      const db = useIndexedDB()
      await db.saveGameSession(createTestSession({ id: 'first', score: 10 }))
      await db.saveGameSession(createTestSession({ id: 'second', score: 20 }))

      const retrieved = await db.getGameSession()
      expect(retrieved!.id).toBe('second')
      expect(retrieved!.score).toBe(20)
    })

    it('clears the current session with clearGameSession()', async () => {
      const db = useIndexedDB()
      await db.saveGameSession(createTestSession({ id: 'to-clear' }))

      await db.clearGameSession()
      const retrieved = await db.getGameSession()

      expect(retrieved).toBeNull()
    })
  })

  // ----------------------------------------------------------------
  // 2. getGameSessionById
  // ----------------------------------------------------------------
  describe('getGameSessionById()', () => {
    it('retrieves a saved session by its ID', async () => {
      const db = useIndexedDB()
      const session = createTestSession({ id: 'find-by-id', score: 77 })

      await db.saveGameSession(session)
      const found = await db.getGameSessionById('find-by-id')

      expect(found).not.toBeNull()
      expect(found!.id).toBe('find-by-id')
      expect(found!.score).toBe(77)
    })

    it('returns null when the ID does not exist', async () => {
      const db = useIndexedDB()
      const found = await db.getGameSessionById('no-such-id')
      expect(found).toBeNull()
    })

    it('can store and retrieve multiple sessions by ID', async () => {
      const db = useIndexedDB()
      const sessionA = createTestSession({ id: 'id-alpha', score: 10 })
      const sessionB = createTestSession({ id: 'id-beta', score: 20 })
      const sessionC = createTestSession({ id: 'id-gamma', score: 30 })

      await db.saveGameSession(sessionA)
      await db.saveGameSession(sessionB)
      await db.saveGameSession(sessionC)

      const foundA = await db.getGameSessionById('id-alpha')
      const foundC = await db.getGameSessionById('id-gamma')

      expect(foundA!.score).toBe(10)
      expect(foundC!.score).toBe(30)
    })
  })

  // ----------------------------------------------------------------
  // 3. Game history
  // ----------------------------------------------------------------
  describe('game history persistence', () => {
    it('saves and retrieves game history', async () => {
      const db = useIndexedDB()
      const history = [
        createTestSession({ id: 'hist-1', startTime: Date.now() - 3000 }),
        createTestSession({ id: 'hist-2', startTime: Date.now() - 2000 }),
        createTestSession({ id: 'hist-3', startTime: Date.now() - 1000 }),
      ]

      await db.saveGameHistory(history)
      const retrieved = await db.getGameHistory()

      expect(retrieved).toHaveLength(3)
    })

    it('returns empty array when no history exists', async () => {
      const db = useIndexedDB()
      const history = await db.getGameHistory()
      expect(history).toEqual([])
    })

    it('respects the limit parameter', async () => {
      const db = useIndexedDB()
      const history = Array.from({ length: 10 }, (_, i) =>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        createTestSession({ id: `limit-${i}`, startTime: Date.now() - (10 - i) * 1000 })
      )
      await db.saveGameHistory(history)
=======
=======
>>>>>>> Stashed changes
        createTestSession({ id: `limit-${i}`, startTime: Date.now() - (10 - i) * 1000 }),
      );
      await db.saveGameHistory(history);
>>>>>>> Stashed changes

      const retrieved = await db.getGameHistory(5)
      expect(retrieved.length).toBeLessThanOrEqual(5)
    })

    it('returns sessions sorted newest-first (descending startTime)', async () => {
      const db = useIndexedDB()
      const now = Date.now()
      const history = [
        createTestSession({ id: 'old', startTime: now - 5000 }),
        createTestSession({ id: 'mid', startTime: now - 3000 }),
        createTestSession({ id: 'new', startTime: now - 1000 }),
      ]

      await db.saveGameHistory(history)
      const retrieved = await db.getGameHistory()

      // Newest first
      expect(retrieved[0]!.startTime).toBeGreaterThanOrEqual(retrieved[1]!.startTime)
      expect(retrieved[1]!.startTime).toBeGreaterThanOrEqual(retrieved[2]!.startTime)
    })

    it('clears all history with clearGameHistory()', async () => {
      const db = useIndexedDB()
      await db.saveGameHistory([
        createTestSession({ id: 'clear-hist-1' }),
        createTestSession({ id: 'clear-hist-2' }),
      ])

      await db.clearGameHistory()
      const retrieved = await db.getGameHistory()

      expect(retrieved).toEqual([])
    })
  })

  // ----------------------------------------------------------------
  // 4. Statistics
  // ----------------------------------------------------------------
  describe('statistics persistence', () => {
    it('saves and retrieves statistics', async () => {
      const db = useIndexedDB()
      const stats = createTestStats({ totalGames: 12, bestScore: 100 })

      await db.saveStatistics(stats)
      const retrieved = await db.getStatistics()

      expect(retrieved).not.toBeNull()
      expect(retrieved!.totalGames).toBe(12)
      expect(retrieved!.bestScore).toBe(100)
    })

    it('returns null when no statistics exist', async () => {
      const db = useIndexedDB()
      const stats = await db.getStatistics()
      expect(stats).toBeNull()
    })

    it('initializeStatistics creates default statistics', async () => {
      const db = useIndexedDB()
      const stats = await db.initializeStatistics()

      expect(stats.totalGames).toBe(0)
      expect(stats.totalScore).toBe(0)
      expect(stats.streakCurrent).toBe(0)

      const retrieved = await db.getStatistics()
      expect(retrieved).not.toBeNull()
    })
  })

  // ----------------------------------------------------------------
  // 5. Leaderboard
  // ----------------------------------------------------------------
  describe('leaderboard persistence', () => {
    it('saves and retrieves a leaderboard entry', async () => {
      const db = useIndexedDB()
      const entry = createTestLeaderboardEntry({ score: 75, attempts: 8 })

      await db.saveLeaderboardEntry(entry)
      const leaderboard = await db.getLeaderboard()

      expect(leaderboard).toHaveLength(1)
      expect(leaderboard[0]!.score).toBe(75)
      expect(leaderboard[0]!.playerName).toBe('Alice')
      expect(leaderboard[0]!.attempts).toBe(8)
    })

    it('returns entries sorted highest-score-first', async () => {
      const db = useIndexedDB()
      await db.saveLeaderboardEntry(
        createTestLeaderboardEntry({
          sessionId: 'entry-low',
          score: 30,
          timestamp: Date.now() - 1000,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        })
      )
      await db.saveLeaderboardEntry(
        createTestLeaderboardEntry({ sessionId: 'entry-high', score: 90, timestamp: Date.now() })
      )
=======
        }),
=======
        }),
      );
      await db.saveLeaderboardEntry(
        createTestLeaderboardEntry({ sessionId: 'entry-high', score: 90, timestamp: Date.now() }),
>>>>>>> Stashed changes
      );
      await db.saveLeaderboardEntry(
        createTestLeaderboardEntry({ sessionId: 'entry-high', score: 90, timestamp: Date.now() }),
      );
>>>>>>> Stashed changes
      await db.saveLeaderboardEntry(
        createTestLeaderboardEntry({
          sessionId: 'entry-mid',
          score: 60,
          timestamp: Date.now() - 500,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        })
      )
=======
=======
>>>>>>> Stashed changes
        }),
      );
>>>>>>> Stashed changes

      const leaderboard = await db.getLeaderboard()
      expect(leaderboard[0]!.score).toBeGreaterThanOrEqual(leaderboard[1]!.score)
      expect(leaderboard[1]!.score).toBeGreaterThanOrEqual(leaderboard[2]!.score)
    })

    it('returns empty array when no entries exist', async () => {
      const db = useIndexedDB()
      const leaderboard = await db.getLeaderboard()
      expect(leaderboard).toEqual([])
    })

    it('respects the limit parameter', async () => {
      const db = useIndexedDB()
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

      const top5 = await db.getLeaderboard(5)
      expect(top5.length).toBeLessThanOrEqual(5)
    })
  })

  // ----------------------------------------------------------------
  // 6. Settings
  // ----------------------------------------------------------------
  describe('settings persistence', () => {
    it('saves and retrieves settings', async () => {
      const db = useIndexedDB()
      const settings: CategorySettings = {
        enabledCategories: ['animals', 'vehicles'],
        soundEnabled: false,
      }

      await db.saveSettings(settings)
      const retrieved = await db.getSettings()

      expect(retrieved).not.toBeNull()
      expect(retrieved!.enabledCategories).toEqual(['animals', 'vehicles'])
      expect(retrieved!.soundEnabled).toBe(false)
    })

    it('returns null when no settings exist', async () => {
      const db = useIndexedDB()
      const settings = await db.getSettings()
      expect(settings).toBeNull()
    })

    it('initializeSettings creates default settings', async () => {
      const db = useIndexedDB()
      const settings = await db.initializeSettings()

      expect(settings.enabledCategories).toEqual([])
      expect(settings.soundEnabled).toBe(true)

      const retrieved = await db.getSettings()
      expect(retrieved).not.toBeNull()
    })
  })

  // ----------------------------------------------------------------
  // 7. Data integrity across multiple cycles
  // ----------------------------------------------------------------
  describe('data integrity across save-load cycles', () => {
    it('preserves timestamps on repeated save-load roundtrips', async () => {
      const db = useIndexedDB()
      const startTime = Date.now() - 90_000
      const endTime = Date.now()
      const session = createTestSession({ id: 'timestamp-check', startTime, endTime })

      await db.saveGameSession(session)
      const first = await db.getGameSession()
      await db.saveGameSession(first!)
      const second = await db.getGameSession()

      expect(second!.startTime).toBe(startTime)
      expect(second!.endTime).toBe(endTime)
    })

    it('session and history stores are independent', async () => {
      const db = useIndexedDB()
      const currentSession = createTestSession({ id: 'current' })
      const historicalSessions = [
        createTestSession({ id: 'hist-a' }),
        createTestSession({ id: 'hist-b' }),
      ]

      await db.saveGameSession(currentSession)
      await db.saveGameHistory(historicalSessions)

      const current = await db.getGameSession()
      const history = await db.getGameHistory()

      expect(current!.id).toBe('current')
      expect(history).toHaveLength(2)
    })

    it('clearGameSession does not affect game history', async () => {
      const db = useIndexedDB()
      const history = [createTestSession({ id: 'safe-hist' })]
      await db.saveGameHistory(history)
      await db.saveGameSession(createTestSession({ id: 'to-delete' }))

      await db.clearGameSession()

      const retrievedHistory = await db.getGameHistory()
      expect(retrievedHistory).toHaveLength(1)
      expect(retrievedHistory[0]!.id).toBe('safe-hist')
    })
  })

  // ----------------------------------------------------------------
  // 8. Concurrent writes
  // ----------------------------------------------------------------
  describe('concurrent write handling', () => {
    it('handles concurrent session saves without corruption', async () => {
      const db = useIndexedDB()
      const sessions = Array.from({ length: 5 }, (_, i) =>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        createTestSession({ id: `concurrent-${i}`, score: i * 10 })
      )

      // Fire all saves in parallel
      await Promise.all(sessions.map((s) => db.saveGameSession(s)))
=======
=======
>>>>>>> Stashed changes
        createTestSession({ id: `concurrent-${i}`, score: i * 10 }),
      );

      // Fire all saves in parallel
      await Promise.all(sessions.map(s => db.saveGameSession(s)));
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

      // At least one session must be stored as current
      const current = await db.getGameSession()
      expect(current).not.toBeNull()
      expect(current!.id).toMatch(/^concurrent-/)
    })

    it('handles concurrent history entries without data loss', async () => {
      const db = useIndexedDB()
      const batches = [
        [createTestSession({ id: 'batch-a-1' }), createTestSession({ id: 'batch-a-2' })],
        [createTestSession({ id: 'batch-b-1' }), createTestSession({ id: 'batch-b-2' })],
      ]

<<<<<<< Updated upstream
<<<<<<< Updated upstream
      await Promise.all(batches.map((batch) => db.saveGameHistory(batch)))
=======
      await Promise.all(batches.map(batch => db.saveGameHistory(batch)));
>>>>>>> Stashed changes
=======
      await Promise.all(batches.map(batch => db.saveGameHistory(batch)));
>>>>>>> Stashed changes

      const history = await db.getGameHistory(10)
      // Both batches should be present (4 unique IDs)
      expect(history.length).toBeGreaterThanOrEqual(2)
    })
  })
})
