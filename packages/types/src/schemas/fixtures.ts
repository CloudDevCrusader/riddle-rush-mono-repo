/**
 * Zod-backed test fixtures — every object is validated with the same schemas as IndexedDB reads.
 */
import type { Category, GameSession } from '../game'
import { categorySchema, gameSessionSchema } from './game-schemas'

const defaultCategory: Category = {
  id: 1,
  name: 'Animals',
  searchWord: 'animals',
  key: 'animals',
  searchProvider: 'offline',
}

/**
 * Build a {@link GameSession} for tests; merges partial overrides and runs `gameSessionSchema.parse`.
 */
export function gameSessionTestFixture(overrides: Partial<GameSession> = {}): GameSession {
  const category: Category = categorySchema.parse({
    ...defaultCategory,
    ...(overrides.category ?? {}),
  })

  const base: GameSession = {
    id: 'test-session',
    players: [],
    currentRound: 1,
    currentPlayerIndex: 0,
    category,
    letter: 'A',
    startTime: Date.now(),
    status: 'active',
    roundHistory: [],
  }

  const merged: GameSession = {
    ...base,
    ...overrides,
    category,
    players: overrides.players ?? base.players,
    roundHistory: overrides.roundHistory ?? base.roundHistory,
  }

  return gameSessionSchema.parse(merged) as GameSession
}
