import { openDB, type IDBPDatabase } from 'idb'
import type { CategorySettings } from '@riddle-rush/types/game'
import { useLogger } from './useLogger'
import { useGameSessionDB } from './useGameSessionDB'
import { useGameHistoryDB } from './useGameHistoryDB'
import { useStatisticsDB } from './useStatisticsDB'
import { useLeaderboardDB } from './useLeaderboardDB'

// Database configuration
const DB_NAME = 'riddle-rush-db'
const DB_VERSION = 3

// Store names (exported for domain composables and testing)
export const GAME_SESSION_STORE = 'gameSession'
export const GAME_SESSIONS_BY_ID_STORE = 'gameSessionsById'
export const GAME_HISTORY_STORE = 'gameHistory'
export const STATISTICS_STORE = 'statistics'
export const LEADERBOARD_STORE = 'leaderboard'
export const SETTINGS_STORE = 'settings'

// Module-level singleton for database connection
let dbInstance: IDBPDatabase | null = null
let dbPromise: Promise<IDBPDatabase> | null = null

/**
 * Get the shared IndexedDB instance.
 * Uses a singleton pattern to ensure only one connection is opened.
 */
export async function getDB(): Promise<IDBPDatabase> {
  // Return cached instance if available
  if (dbInstance) return dbInstance

  // Return existing promise if DB is being opened
  if (dbPromise) return dbPromise

  // Create new promise to open DB
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion) {
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(GAME_SESSION_STORE)) {
        db.createObjectStore(GAME_SESSION_STORE)
      }
      if (!db.objectStoreNames.contains(GAME_SESSIONS_BY_ID_STORE)) {
        db.createObjectStore(GAME_SESSIONS_BY_ID_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(GAME_HISTORY_STORE)) {
        const historyStore = db.createObjectStore(GAME_HISTORY_STORE, {
          keyPath: 'id',
        })
        historyStore.createIndex('startTime', 'startTime')
      }
      if (!db.objectStoreNames.contains(STATISTICS_STORE)) {
        db.createObjectStore(STATISTICS_STORE)
      }
      if (!db.objectStoreNames.contains(LEADERBOARD_STORE)) {
        const leaderboardStore = db.createObjectStore(LEADERBOARD_STORE, {
          keyPath: 'sessionId',
        })
        leaderboardStore.createIndex('score', 'score')
        leaderboardStore.createIndex('timestamp', 'timestamp')
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE)
      }
    },
  })

  try {
    dbInstance = await dbPromise
    dbPromise = null // Clear promise cache
    return dbInstance
  } catch (error) {
    dbPromise = null // Clear promise cache on error
    throw error
  }
}

/**
 * Main IndexedDB composable that combines all domain-specific operations.
 * Maintains backwards compatibility with existing call sites.
 *
 * For new code, consider using the domain-specific composables directly:
 * - useGameSessionDB: Game session operations
 * - useGameHistoryDB: Game history operations
 * - useStatisticsDB: Statistics operations
 * - useLeaderboardDB: Leaderboard operations
 */
export function useIndexedDB() {
  const logger = useLogger()

  // Initialize domain composables with shared getDB
  const sessionDB = useGameSessionDB(getDB)
  const historyDB = useGameHistoryDB(getDB)
  const statisticsDB = useStatisticsDB(getDB)
  const leaderboardDB = useLeaderboardDB(getDB)

  // Settings operations (kept inline as they're simpler and not in a separate domain composable)
  const getSettings = async (): Promise<CategorySettings | null> => {
    try {
      const db = await getDB()
      const settings = await db.get(SETTINGS_STORE, 'current')
      return settings || null
    } catch (error) {
      logger.error('Error getting settings:', error)
      return null
    }
  }

  const saveSettings = async (settings: CategorySettings) => {
    try {
      const db = await getDB()
      await db.put(SETTINGS_STORE, settings, 'current')
    } catch (error) {
      logger.error('Error saving settings:', error)
    }
  }

  const initializeSettings = async (): Promise<CategorySettings> => {
    const settings: CategorySettings = {
      enabledCategories: [],
      soundEnabled: true,
    }
    await saveSettings(settings)
    return settings
  }

  return {
    // Game session operations
    saveGameSession: sessionDB.saveGameSession,
    getGameSession: sessionDB.getGameSession,
    getGameSessionById: sessionDB.getGameSessionById,
    clearGameSession: sessionDB.clearGameSession,
    // Game history operations
    saveGameHistory: historyDB.saveGameHistory,
    getGameHistory: historyDB.getGameHistory,
    clearGameHistory: historyDB.clearGameHistory,
    // Statistics operations
    getStatistics: statisticsDB.getStatistics,
    saveStatistics: statisticsDB.saveStatistics,
    initializeStatistics: statisticsDB.initializeStatistics,
    // Leaderboard operations
    getLeaderboard: leaderboardDB.getLeaderboard,
    saveLeaderboardEntry: leaderboardDB.saveLeaderboardEntry,
    // Settings operations
    getSettings,
    saveSettings,
    initializeSettings,
  }
}
