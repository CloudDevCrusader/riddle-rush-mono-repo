import type { GameSession } from '@riddle-rush/types/game'
import type { IDBPDatabase } from 'idb'
import { useLogger } from './useLogger'

// Store constant
const GAME_HISTORY_STORE = 'gameHistory'

/**
 * Composable for managing game history in IndexedDB.
 * Handles saving completed game sessions and retrieving history.
 */
export function useGameHistoryDB(getDB: () => Promise<IDBPDatabase>) {
  const logger = useLogger()

  const saveGameHistory = async (history: GameSession[]) => {
    try {
      const db = await getDB()
      const tx = db.transaction(GAME_HISTORY_STORE, 'readwrite')

      for (const session of history) {
        await tx.store.put(session)
      }

      await tx.done
    } catch (error) {
      logger.error('Error saving game history:', error)
    }
  }

  const getGameHistory = async (limit = 50): Promise<GameSession[]> => {
    try {
      const db = await getDB()
      const index = db.transaction(GAME_HISTORY_STORE).store.index('startTime')

      // Use cursor for better performance with large datasets
      const sessions: GameSession[] = []
      let cursor = await index.openCursor(null, 'prev') // Start from end (newest first)

      while (cursor && sessions.length < limit) {
        sessions.push(cursor.value)
        cursor = await cursor.continue()
      }

      return sessions
    } catch (error) {
      logger.error('Error getting game history:', error)
      return []
    }
  }

  const clearGameHistory = async () => {
    try {
      const db = await getDB()
      await db.clear(GAME_HISTORY_STORE)
    } catch (error) {
      logger.error('Error clearing game history:', error)
    }
  }

  return {
    saveGameHistory,
    getGameHistory,
    clearGameHistory,
  }
}
