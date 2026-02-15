import type { LeaderboardEntry } from '@riddle-rush/types/game'
import type { IDBPDatabase } from 'idb'
import { useLogger } from './useLogger'

// Store constant
const LEADERBOARD_STORE = 'leaderboard'

/**
 * Composable for managing the leaderboard in IndexedDB.
 * Handles saving and retrieving high score entries.
 */
export function useLeaderboardDB(getDB: () => Promise<IDBPDatabase>) {
  const logger = useLogger()

  const getLeaderboard = async (limit = 10): Promise<LeaderboardEntry[]> => {
    try {
      const db = await getDB()
      const index = db.transaction(LEADERBOARD_STORE).store.index('score')

      // Use cursor for better performance with large datasets
      const entries: LeaderboardEntry[] = []
      let cursor = await index.openCursor(null, 'prev') // Start from highest scores

      while (cursor && entries.length < limit) {
        entries.push(cursor.value)
        cursor = await cursor.continue()
      }

      return entries
    } catch (error) {
      logger.error('Error getting leaderboard:', error)
      return []
    }
  }

  const saveLeaderboardEntry = async (entry: LeaderboardEntry) => {
    try {
      const db = await getDB()
      await db.put(LEADERBOARD_STORE, entry)
    } catch (error) {
      logger.error('Error saving leaderboard entry:', error)
    }
  }

  return {
    getLeaderboard,
    saveLeaderboardEntry,
  }
}
