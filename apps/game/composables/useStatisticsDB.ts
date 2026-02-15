import type { GameStatistics } from '@riddle-rush/types/game'
import type { IDBPDatabase } from 'idb'
import { useLogger } from './useLogger'

// Store constant
const STATISTICS_STORE = 'statistics'

/**
 * Composable for managing game statistics in IndexedDB.
 * Handles saving, retrieving, and initializing player statistics.
 */
export function useStatisticsDB(getDB: () => Promise<IDBPDatabase>) {
  const logger = useLogger()

  const getStatistics = async (): Promise<GameStatistics | null> => {
    try {
      const db = await getDB()
      const stats = await db.get(STATISTICS_STORE, 'current')
      return stats || null
    } catch (error) {
      logger.error('Error getting statistics:', error)
      return null
    }
  }

  const saveStatistics = async (stats: GameStatistics) => {
    try {
      const db = await getDB()
      await db.put(STATISTICS_STORE, stats, 'current')
    } catch (error) {
      logger.error('Error saving statistics:', error)
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

  return {
    getStatistics,
    saveStatistics,
    initializeStatistics,
  }
}
