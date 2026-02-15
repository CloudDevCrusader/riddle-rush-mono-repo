import type { GameSession } from '@riddle-rush/types/game'
import type { IDBPDatabase } from 'idb'
import { useLogger } from './useLogger'

// Store constants
const GAME_SESSION_STORE = 'gameSession'
const GAME_SESSIONS_BY_ID_STORE = 'gameSessionsById'

/**
 * Composable for managing the current game session in IndexedDB.
 * Handles saving, retrieving, and clearing the active game session.
 */
export function useGameSessionDB(getDB: () => Promise<IDBPDatabase>) {
  const logger = useLogger()

  const saveGameSession = async (session: GameSession) => {
    try {
      const db = await getDB()

      // Only serialize if the session is not already a plain object
      const serialized =
        session && typeof session === 'object' ? JSON.parse(JSON.stringify(session)) : session

      // Use transaction for atomic operations
      const tx = db.transaction([GAME_SESSION_STORE, GAME_SESSIONS_BY_ID_STORE], 'readwrite')

      // Save as current session
      await tx.objectStore(GAME_SESSION_STORE).put(serialized, 'current')

      // Also save by ID for direct access if ID exists
      if (session.id) {
        try {
          await tx.objectStore(GAME_SESSIONS_BY_ID_STORE).put(serialized)
        } catch (idSaveError) {
          logger.warn('Failed to save session by ID (non-critical):', idSaveError)
          // Continue even if ID storage fails
        }
      }

      await tx.done
    } catch (error) {
      logger.error('Error saving game session:', error)
      throw error // Re-throw to ensure calling code knows about the failure
    }
  }

  const getGameSession = async (): Promise<GameSession | null> => {
    try {
      const db = await getDB()
      const session = await db.get(GAME_SESSION_STORE, 'current')
      return session || null
    } catch (error) {
      logger.error('Error getting game session:', error)
      return null
    }
  }

  const getGameSessionById = async (sessionId: string): Promise<GameSession | null> => {
    try {
      const db = await getDB()
      const session = await db.get(GAME_SESSIONS_BY_ID_STORE, sessionId)
      return session || null
    } catch (error) {
      logger.error('Error getting game session by ID:', error)
      return null
    }
  }

  const clearGameSession = async () => {
    try {
      const db = await getDB()
      await db.delete(GAME_SESSION_STORE, 'current')
    } catch (error) {
      logger.error('Error clearing game session:', error)
    }
  }

  return {
    saveGameSession,
    getGameSession,
    getGameSessionById,
    clearGameSession,
  }
}
