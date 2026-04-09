/**
 * Persistence composable
 *
 * Extracts IndexedDB persistence logic from the game store into focused utility functions.
 * These functions are **stateless** — they wrap useIndexedDB calls with error handling and logging.
 * The game store delegates to these functions while still owning all reactive state.
 */

import { useIndexedDB } from './useIndexedDB'
import { useLogger } from './useLogger'
import type { GameSession } from '@riddle-rush/types/game'

/**
 * Composable providing persistence utilities for game data.
 *
 * @example
 * ```ts
 * const persistence = usePersistence()
 * const session = await persistence.loadSessionFromDB()
 * await persistence.saveSessionToDB(session)
 * ```
 */
export function usePersistence() {
  /**
   * Load the current game session from IndexedDB.
   *
   * @returns The stored session, or null if none found or on error
   */
  async function loadSessionFromDB(): Promise<GameSession | null> {
    try {
      const { getGameSession } = useIndexedDB()
      return await getGameSession()
    } catch (error) {
      const logger = useLogger()
      logger.error('Error loading session from IndexedDB:', error)
      return null
    }
  }

  /**
   * Load game history from IndexedDB.
   *
   * @returns The stored history array, or null if none found or on error
   */
  async function loadHistoryFromDB(): Promise<GameSession[] | null> {
    try {
      const { getGameHistory } = useIndexedDB()
      return await getGameHistory()
    } catch (error) {
      const logger = useLogger()
      logger.error('Error loading history from IndexedDB:', error)
      return null
    }
  }

  /**
   * Save a game session to IndexedDB with error handling.
   * Errors are logged but not thrown — the game continues even if save fails.
   *
   * @param session - The session to save
   */
  async function saveSessionToDB(session: GameSession): Promise<void> {
    try {
      const { saveGameSession } = useIndexedDB()
      await saveGameSession(session)
    } catch (error) {
      const logger = useLogger()
      logger.error('Error saving session to IndexedDB:', error)
      // Don't throw - allow game to continue even if save fails
    }
  }

  /**
   * Save game history to IndexedDB with error handling.
   * Errors are logged but not thrown — the game continues even if save fails.
   *
   * @param history - The history array to save
   */
  async function saveHistoryToDB(history: GameSession[]): Promise<void> {
    try {
      const { saveGameHistory } = useIndexedDB()
      await saveGameHistory(history)
    } catch (error) {
      const logger = useLogger()
      logger.error('Error saving history to IndexedDB:', error)
      // Don't throw - allow game to continue even if save fails
    }
  }

  /**
   * Load a specific game session by its ID from IndexedDB.
   * Throws an error if the session is not found or on database error.
   *
   * @param sessionId - The session ID to look up
   * @returns The matching session
   * @throws Error if session not found or database error occurs
   */
  async function loadSessionById(sessionId: string): Promise<GameSession> {
    let session: GameSession | null
    try {
      const { getGameSessionById } = useIndexedDB()
      session = await getGameSessionById(sessionId)
    } catch (error) {
      const logger = useLogger()
      logger.error('Error loading game session by ID:', error)
      throw new Error(`Database error loading session ${sessionId}`)
    }
    if (!session) {
      throw new Error(`Game session with ID ${sessionId} not found`)
    }
    return session
  }

  return {
    loadSessionFromDB,
    loadHistoryFromDB,
    saveSessionToDB,
    saveHistoryToDB,
    loadSessionById,
  }
}
