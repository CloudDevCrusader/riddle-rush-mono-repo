/**
 * Session Validation Demo Utilities
 * Provides utilities for testing and demonstrating session validation scenarios
 */

import type { GameSession } from '@riddle-rush/types/game'

/**
 * Creates a mock corrupted session for testing validation
 * Law of Intentional Naming: Function name clearly states test purpose
 */
export function createCorruptedSession(): Partial<GameSession> {
  return {
    // Missing required id field - should trigger corruption validation
    startTime: Date.now(),
    status: 'active',
    category: {
      id: 1,
      name: 'Animals',
      searchWord: 'animals',
      key: 'animals',
      searchProvider: 'offline',
    },
    letter: 'A',
    players: [],
    currentRound: 1,
    roundHistory: [],
  }
}

/**
 * Creates an expired session for testing timeout validation
 * Law of Parse Don't Validate: Creates known expired state for testing
 */
export function createExpiredSession(): GameSession {
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000

  return {
    id: 'expired-session-test',
    startTime: threeDaysAgo, // 3 days old - should trigger expiry
    status: 'active',
    category: {
      id: 1,
      name: 'Animals',
      searchWord: 'animals',
      key: 'animals',
      searchProvider: 'offline',
    },
    letter: 'A',
    players: [
      {
        id: 'player1',
        name: 'Test Player',
        totalScore: 0,
        currentRoundScore: 0,
        hasSubmitted: false,
      },
    ],
    currentRound: 1,
    roundHistory: [],
  }
}

/**
 * Creates a session with mismatched ID for testing URL validation
 * Law of Fail Fast: Creates known mismatch scenario for testing
 */
export function createMismatchedSession(actualId: string, _expectedId: string): GameSession {
  return {
    id: actualId, // Different from what URL expects
    startTime: Date.now(),
    status: 'active',
    category: {
      id: 1,
      name: 'Animals',
      searchWord: 'animals',
      key: 'animals',
      searchProvider: 'offline',
    },
    letter: 'A',
    players: [
      {
        id: 'player1',
        name: 'Test Player',
        totalScore: 0,
        currentRoundScore: 0,
        hasSubmitted: false,
      },
    ],
    currentRound: 1,
    roundHistory: [],
  }
}

/**
 * Creates a valid session for testing successful validation
 * Law of Atomic Predictability: Creates consistent valid state
 */
export function createValidSession(sessionId: string = 'valid-session-test'): GameSession {
  return {
    id: sessionId,
    startTime: Date.now(),
    status: 'active',
    category: {
      id: 1,
      name: 'Animals',
      searchWord: 'animals',
      key: 'animals',
      searchProvider: 'offline',
    },
    letter: 'A',
    players: [
      {
        id: 'player1',
        name: 'Player 1',
        totalScore: 0,
        currentRoundScore: 0,
        hasSubmitted: false,
      },
      {
        id: 'player2',
        name: 'Player 2',
        totalScore: 0,
        currentRoundScore: 0,
        hasSubmitted: false,
      },
    ],
    currentRound: 1,
    roundHistory: [],
  }
}

/**
 * Creates a completed session for testing results page validation
 */
export function createCompletedSession(): GameSession {
  return {
    id: 'completed-session-test',
    startTime: Date.now() - 60 * 60 * 1000, // 1 hour ago
    endTime: Date.now(),
    status: 'completed',
    category: {
      id: 1,
      name: 'Animals',
      searchWord: 'animals',
      key: 'animals',
      searchProvider: 'offline',
    },
    letter: 'A',
    players: [
      {
        id: 'player1',
        name: 'Winner',
        totalScore: 100,
        currentRoundScore: 0,
        hasSubmitted: true,
        currentRoundAnswer: 'Antelope',
      },
      {
        id: 'player2',
        name: 'Second Place',
        totalScore: 80,
        currentRoundScore: 0,
        hasSubmitted: true,
        currentRoundAnswer: 'Alligator',
      },
    ],
    currentRound: 3,
    roundHistory: [
      {
        roundNumber: 1,
        category: 'Animals',
        letter: 'A',
        timestamp: Date.now() - 30 * 60 * 1000,
        playerResults: [
          { playerId: 'player1', playerName: 'Winner', answer: 'Antelope', score: 50 },
          { playerId: 'player2', playerName: 'Second Place', answer: 'Alligator', score: 50 },
        ],
      },
      {
        roundNumber: 2,
        category: 'Food',
        letter: 'B',
        timestamp: Date.now() - 15 * 60 * 1000,
        playerResults: [
          { playerId: 'player1', playerName: 'Winner', answer: 'Banana', score: 50 },
          { playerId: 'player2', playerName: 'Second Place', answer: 'Bread', score: 30 },
        ],
      },
    ],
  }
}

export const SessionTestScenarios = {
  VALID: 'valid',
  CORRUPTED: 'corrupted',
  EXPIRED: 'expired',
  MISMATCHED_ID: 'mismatch',
  COMPLETED: 'completed',
  NO_SESSION: 'none',
} as const

export type SessionTestScenario = (typeof SessionTestScenarios)[keyof typeof SessionTestScenarios]
