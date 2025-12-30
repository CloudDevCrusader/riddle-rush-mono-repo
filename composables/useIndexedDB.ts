import { openDB, type IDBPDatabase } from 'idb'
import type { GameSession, GameStatistics, LeaderboardEntry, CategorySettings } from '../types/game'

const DB_NAME = 'guess-game-db'
const DB_VERSION = 2
const GAME_SESSION_STORE = 'gameSession'
const GAME_HISTORY_STORE = 'gameHistory'
const STATISTICS_STORE = 'statistics'
const LEADERBOARD_STORE = 'leaderboard'
const SETTINGS_STORE = 'settings'

let dbInstance: IDBPDatabase | null = null

async function getDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion) {
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(GAME_SESSION_STORE)) {
        db.createObjectStore(GAME_SESSION_STORE)
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

  return dbInstance
}

export function useIndexedDB() {
  const saveGameSession = async (session: GameSession) => {
    try {
      const db = await getDB()
      // Serialize the session to ensure it's compatible with IndexedDB
      const serialized = JSON.parse(JSON.stringify(session))
      await db.put(GAME_SESSION_STORE, serialized, 'current')
    } catch (error) {
      console.error('Error saving game session:', error)
    }
  }

  const getGameSession = async (): Promise<GameSession | null> => {
    try {
      const db = await getDB()
      const session = await db.get(GAME_SESSION_STORE, 'current')
      return session || null
    } catch (error) {
      console.error('Error getting game session:', error)
      return null
    }
  }

  const clearGameSession = async () => {
    try {
      const db = await getDB()
      await db.delete(GAME_SESSION_STORE, 'current')
    } catch (error) {
      console.error('Error clearing game session:', error)
    }
  }

  const saveGameHistory = async (history: GameSession[]) => {
    try {
      const db = await getDB()
      const tx = db.transaction(GAME_HISTORY_STORE, 'readwrite')

      for (const session of history) {
        await tx.store.put(session)
      }

      await tx.done
    } catch (error) {
      console.error('Error saving game history:', error)
    }
  }

  const getGameHistory = async (limit = 50): Promise<GameSession[]> => {
    try {
      const db = await getDB()
      const index = db
        .transaction(GAME_HISTORY_STORE)
        .store.index('startTime')

      const sessions = await index.getAll()
      return sessions
        .sort((a, b) => b.startTime - a.startTime)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting game history:', error)
      return []
    }
  }

  const clearGameHistory = async () => {
    try {
      const db = await getDB()
      await db.clear(GAME_HISTORY_STORE)
    } catch (error) {
      console.error('Error clearing game history:', error)
    }
  }

  const getStatistics = async (): Promise<GameStatistics | null> => {
    try {
      const db = await getDB()
      const stats = await db.get(STATISTICS_STORE, 'current')
      return stats || null
    } catch (error) {
      console.error('Error getting statistics:', error)
      return null
    }
  }

  const saveStatistics = async (stats: GameStatistics) => {
    try {
      const db = await getDB()
      await db.put(STATISTICS_STORE, stats, 'current')
    } catch (error) {
      console.error('Error saving statistics:', error)
    }
  }

  const initializeStatistics = async (): Promise<GameStatistics> => {
    const stats: GameStatistics = {
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
    }
    await saveStatistics(stats)
    return stats
  }

  const getLeaderboard = async (limit = 10): Promise<LeaderboardEntry[]> => {
    try {
      const db = await getDB()
      const index = db
        .transaction(LEADERBOARD_STORE)
        .store.index('score')

      const entries = await index.getAll()
      return entries
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }

  const saveLeaderboardEntry = async (entry: LeaderboardEntry) => {
    try {
      const db = await getDB()
      await db.put(LEADERBOARD_STORE, entry)
    } catch (error) {
      console.error('Error saving leaderboard entry:', error)
    }
  }

  const getSettings = async (): Promise<CategorySettings | null> => {
    try {
      const db = await getDB()
      const settings = await db.get(SETTINGS_STORE, 'current')
      return settings || null
    } catch (error) {
      console.error('Error getting settings:', error)
      return null
    }
  }

  const saveSettings = async (settings: CategorySettings) => {
    try {
      const db = await getDB()
      await db.put(SETTINGS_STORE, settings, 'current')
    } catch (error) {
      console.error('Error saving settings:', error)
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
    saveGameSession,
    getGameSession,
    clearGameSession,
    saveGameHistory,
    getGameHistory,
    clearGameHistory,
    getStatistics,
    saveStatistics,
    initializeStatistics,
    getLeaderboard,
    saveLeaderboardEntry,
    getSettings,
    saveSettings,
    initializeSettings,
  }
}
