/**
 * Game lifecycle composable
 *
 * Extracts game lifecycle orchestration logic from the game store into focused utility functions.
 * Handles attempt creation, round result building, and statistics updates.
 * These functions are **stateless** — they accept data as parameters and return results.
 * The game store delegates to these functions while still owning all reactive state.
 */

import { useStatistics } from './useStatistics'
import { useLogger } from './useLogger'
import type { GameAttempt, GameSession } from '@riddle-rush/types/game'

/**
 * Composable providing game lifecycle utilities.
 *
 * @example
 * ```ts
 * const lifecycle = useGameLifecycle()
 * const attempt = lifecycle.createAttempt('apple', true)
 * const roundResult = lifecycle.buildRoundResult(session)
 * await lifecycle.updateStatisticsForSession(session)
 * ```
 */
export function useGameLifecycle() {
  /**
   * Create a GameAttempt object with the current timestamp.
   *
   * @param term - The term that was attempted
   * @param found - Whether the term was found/correct
   * @returns A new GameAttempt object
   */
  function createAttempt(term: string, found: boolean): GameAttempt {
    return {
      term,
      found,
      timestamp: Date.now(),
    }
  }

  /**
   * Build a round result object from the current session state.
   * Captures the current round number, category, letter, and all player results.
   *
   * @param session - The current game session
   * @returns A round result object suitable for storing in roundHistory
   */
  function buildRoundResult(session: GameSession) {
    return {
      roundNumber: session.currentRound,
      category: session.category.name,
      letter: session.letter,
      timestamp: Date.now(),
      playerResults: session.players.map((p) => ({
        playerId: p.id,
        playerName: p.name,
        answer: p.currentRoundAnswer || '',
        score: p.currentRoundScore,
      })),
    }
  }

  /**
   * Update statistics for a completed game session.
   * Wraps the useStatistics call with error handling — errors are logged but not thrown.
   *
   * @param session - The completed game session
   */
  async function updateStatisticsForSession(session: GameSession): Promise<void> {
    try {
      const { updateStatistics } = useStatistics()
      await updateStatistics(session)
    } catch (error) {
      const logger = useLogger()
      logger.error('Error updating statistics:', error)
    }
  }

  return {
    createAttempt,
    buildRoundResult,
    updateStatisticsForSession,
  }
}
