import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as Vue from 'vue'
import * as VueRouter from 'vue-router'
import * as Pinia from 'pinia'
import type {
  GameSession,
  GameStatistics,
  LeaderboardEntry,
  CategorySettings,
} from '@riddle-rush/types/game'
import { createGameSession, createCategory, createGameStatistics } from '../utils/factories'

// Make Vue, VueRouter, and Pinia exports globally available (workspace config has no setupFiles)
Object.assign(globalThis, Vue, VueRouter, Pinia)

// ---- Mock idb ----
// We need a fake IDBPDatabase that simulates the idb API.
// The module-level singleton in useIndexedDB.ts means we must mock idb
// before any import of useIndexedDB resolves.

// In-memory stores
const memStores: Record<string, Map<unknown, unknown>> = {
  gameSession: new Map(),
  gameSessionsById: new Map(),
  gameHistory: new Map(),
  statistics: new Map(),
  leaderboard: new Map(),
  settings: new Map(),
}

const resetStores = () => {
  for (const store of Object.values(memStores)) {
    store.clear()
  }
}

// Helper: create a fake cursor iterator over a map
type FakeCursor = null | { value: unknown; continue: () => Promise<FakeCursor> }

const createFakeCursor = (
  entries: Array<[unknown, unknown]>,
  direction: 'prev' | 'next' = 'next'
) => {
  const sorted = direction === 'prev' ? [...entries].reverse() : [...entries]
  let index = 0

  const makeCursor = (): FakeCursor => {
    if (index >= sorted.length) return null
    const entry = sorted[index++]
    return {
      value: entry![1],
      continue: async () => makeCursor(),
    }
  }

  return async () => makeCursor()
}

// Fake transaction store
const fakeStore = (storeName: string) => ({
  put: vi.fn(async (value: unknown, key?: unknown) => {
    const k =
      key !== undefined
        ? key
        : ((value as { id?: unknown; sessionId?: unknown })?.id ??
          (value as { id?: unknown; sessionId?: unknown })?.sessionId)
    memStores[storeName]?.set(k, value)
  }),
  delete: vi.fn(async (key: unknown) => {
    memStores[storeName]?.delete(key)
  }),
  index: vi.fn((_indexName: string) => {
    const store = memStores[storeName]!
    return {
      openCursor: createFakeCursor([...store.entries()]),
    }
  }),
  done: Promise.resolve(),
})

// Fake transaction
const fakeTx = (storeNames: string | string[]) => {
  const names = Array.isArray(storeNames) ? storeNames : [storeNames]
  const stores: Record<string, ReturnType<typeof fakeStore>> = {}
  for (const name of names) {
    stores[name] = fakeStore(name)
  }
  return {
    objectStore: (name: string) => stores[name]!,
    store: stores[names[0]!]!,
    done: Promise.resolve(),
  }
}

// Fake DB object
const fakeDB = {
  get: vi.fn(async (storeName: string, key: unknown) => {
    return memStores[storeName]?.get(key) ?? undefined
  }),
  put: vi.fn(async (storeName: string, value: unknown, key?: unknown) => {
    const v = value as { id?: unknown; sessionId?: unknown }
    const k = key !== undefined ? key : (v?.id ?? v?.sessionId)
    memStores[storeName]?.set(k, value)
  }),
  delete: vi.fn(async (storeName: string, key: unknown) => {
    memStores[storeName]?.delete(key)
  }),
  clear: vi.fn(async (storeName: string) => {
    memStores[storeName]?.clear()
  }),
  transaction: vi.fn((storeNames: string | string[]) => fakeTx(storeNames)),
}

vi.mock('idb', () => ({
  openDB: vi.fn(async () => fakeDB),
}))

// Reset module registry so the module-level singleton is re-created per test file run
// (This is important because useIndexedDB.ts has module-level `dbInstance`)

describe('useIndexedDB', () => {
  // Dynamic import to ensure mocks are applied before module evaluation
  // (The module-level singleton `dbInstance` must be fresh per test suite)
  let useIndexedDB: () => ReturnType<typeof import('../../composables/useIndexedDB').useIndexedDB>

  beforeEach(async () => {
    resetStores()
    vi.clearAllMocks()
    // Re-import to pick up fresh module state (reset singleton)
    vi.resetModules()
    const mod = await import('../../composables/useIndexedDB')
    useIndexedDB = mod.useIndexedDB
  })

  // ---- Game Session ----
  describe('saveGameSession / getGameSession', () => {
    it('saves a session and retrieves it as "current"', async () => {
      const category = createCategory()
      const session = createGameSession({ category })
      const db = useIndexedDB()

      await db.saveGameSession(session)
      const retrieved = await db.getGameSession()

      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe(session.id)
    })

    it('returns null when no session has been saved', async () => {
      const db = useIndexedDB()
      const result = await db.getGameSession()
      expect(result).toBeNull()
    })
  })

  describe('clearGameSession', () => {
    it('removes the current session', async () => {
      const category = createCategory()
      const session = createGameSession({ category })
      const db = useIndexedDB()

      await db.saveGameSession(session)
      await db.clearGameSession()
      const result = await db.getGameSession()

      expect(result).toBeNull()
    })
  })

  describe('getGameSessionById', () => {
    it('retrieves a session by its id', async () => {
      const category = createCategory()
      const session = createGameSession({ category, id: 'session-abc' })
      const db = useIndexedDB()

      await db.saveGameSession(session)
      const retrieved = await db.getGameSessionById('session-abc')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.id).toBe('session-abc')
    })

    it('returns null for unknown id', async () => {
      const db = useIndexedDB()
      const result = await db.getGameSessionById('does-not-exist')
      expect(result).toBeNull()
    })
  })

  // ---- Game History ----
  describe('saveGameHistory / getGameHistory', () => {
    it('saves multiple sessions to history', async () => {
      const category = createCategory()
      const sessions: GameSession[] = [
        createGameSession({ category, id: 'h1', startTime: 1000 }),
        createGameSession({ category, id: 'h2', startTime: 2000 }),
      ]
      const db = useIndexedDB()

      await db.saveGameHistory(sessions)

      // Both are now in history store
      expect(memStores['gameHistory']!.size).toBe(2)
    })
  })

  describe('clearGameHistory', () => {
    it('empties the history store', async () => {
      const category = createCategory()
      const sessions: GameSession[] = [createGameSession({ category, id: 'h1' })]
      const db = useIndexedDB()

      await db.saveGameHistory(sessions)
      await db.clearGameHistory()

      expect(memStores['gameHistory']!.size).toBe(0)
    })
  })

  // ---- Statistics ----
  describe('getStatistics / saveStatistics / initializeStatistics', () => {
    it('returns null when no statistics exist', async () => {
      const db = useIndexedDB()
      const result = await db.getStatistics()
      expect(result).toBeNull()
    })

    it('saves and retrieves statistics', async () => {
      const stats = createGameStatistics({ totalGames: 7 })
      const db = useIndexedDB()

      await db.saveStatistics(stats)
      const retrieved = await db.getStatistics()

      expect(retrieved?.totalGames).toBe(7)
    })

    it('initializes statistics with all-zero values', async () => {
      const db = useIndexedDB()
      const stats = await db.initializeStatistics()

      expect(stats.totalGames).toBe(0)
      expect(stats.bestScore).toBe(0)
      expect(stats.streakCurrent).toBe(0)
    })

    it('initializeStatistics persists to DB', async () => {
      const db = useIndexedDB()
      await db.initializeStatistics()

      const retrieved: GameStatistics | null = await db.getStatistics()
      expect(retrieved).not.toBeNull()
      expect(retrieved?.totalGames).toBe(0)
    })
  })

  // ---- Leaderboard ----
  describe('saveLeaderboardEntry', () => {
    it('saves an entry to the leaderboard store', async () => {
      const entry: LeaderboardEntry = {
        sessionId: 'session-xyz',
        score: 80,
        category: 'Animals',
        categoryKey: 'animals',
        attempts: 5,
        correctAttempts: 4,
        timestamp: Date.now(),
        duration: 60000,
      }
      const db = useIndexedDB()

      await db.saveLeaderboardEntry(entry)

      expect(memStores['leaderboard']!.has('session-xyz')).toBe(true)
    })
  })

  // ---- Settings ----
  describe('getSettings / saveSettings / initializeSettings', () => {
    it('returns null when no settings exist', async () => {
      const db = useIndexedDB()
      const result = await db.getSettings()
      expect(result).toBeNull()
    })

    it('saves and retrieves settings', async () => {
      const settings: CategorySettings = {
        enabledCategories: ['animals', 'cities'],
        soundEnabled: false,
      }
      const db = useIndexedDB()

      await db.saveSettings(settings)
      const retrieved = await db.getSettings()

      expect(retrieved?.soundEnabled).toBe(false)
      expect(retrieved?.enabledCategories).toEqual(['animals', 'cities'])
    })

    it('initializes settings with defaults', async () => {
      const db = useIndexedDB()
      const settings = await db.initializeSettings()

      expect(settings.soundEnabled).toBe(true)
      expect(settings.enabledCategories).toEqual([])
    })
  })
})
