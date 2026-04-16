/**
 * Session management composable
 *
 * Extracts session lifecycle logic from the game store into focused utility functions.
 * These functions are **stateless** — they accept data as parameters and return results.
 * The game store delegates to these functions while still owning all reactive state.
 */

import type { GameSession, Category, Player } from '@riddle-rush/types/game';
import cloneDeep from 'lodash-es/cloneDeep';
import { generateUUID } from '~/utils/uuid';

/**
 * Composable providing game session lifecycle utilities.
 *
 * @example
 * ```ts
 * const sessionManager = useSessionManager()
 * const session = sessionManager.createSession(players, category, 'a')
 * const clone = sessionManager.cloneSessionForHistory(session)
 * ```
 */
export function useSessionManager() {
  /**
   * Create a new game session object with the given players, category, and letter.
   * This is used for multi-player game setup.
   *
   * @param players - Array of player objects
   * @param category - The selected category for this session
   * @param letter - The selected letter for this session
   * @param gameName - Optional name for the game
   * @returns A new GameSession object
   */
  function createSession(
    players: Player[],
    category: Category,
    letter: string,
    gameName?: string
  ): GameSession {
    return {
      id: generateUUID(),
      gameName,
      players,
      currentRound: 1,
      currentPlayerIndex: 0,
      category: { ...category, letter },
      letter,
      startTime: Date.now(),
      status: 'active',
      roundHistory: [],
    };
  }

  /**
   * Create a legacy single-player session (no players array).
   *
   * @param category - The selected category
   * @param letter - The selected letter
   * @returns A new GameSession object configured for single-player
   */
  function createSinglePlayerSession(category: Category, letter: string): GameSession {
    return {
      id: generateUUID(),
      userId: 'default-user',
      category: { ...category, letter },
      letter,
      startTime: Date.now(),
      score: 0,
      attempts: [],
      players: [],
      currentRound: 0,
      currentPlayerIndex: 0,
      roundHistory: [],
      status: 'active',
    };
  }

  /**
   * Deep clone a session for storing in history.
   *
   * @param session - The session to clone
   * @returns A deep-cloned copy of the session
   */
  function cloneSessionForHistory(session: GameSession): GameSession {
    return cloneDeep(session);
  }

  /**
   * Check whether a session is currently active.
   *
   * @param session - The session to check, or null
   * @returns True if the session exists and has 'active' status
   */
  function isSessionActive(session: GameSession | null): boolean {
    return session !== null && session.status === 'active';
  }

  /**
   * Calculate the duration of a session in milliseconds.
   * Returns 0 if session is null or has no start time.
   *
   * @param session - The session to measure
   * @returns Duration in milliseconds
   */
  function getSessionDuration(session: GameSession | null): number {
    if (!session) return 0;
    const endTime = session.endTime ?? Date.now();
    return endTime - session.startTime;
  }

  return {
    createSession,
    createSinglePlayerSession,
    cloneSessionForHistory,
    isSessionActive,
    getSessionDuration,
  };
}
