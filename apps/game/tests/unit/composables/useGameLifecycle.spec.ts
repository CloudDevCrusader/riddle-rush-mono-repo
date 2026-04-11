import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameSession, Player, Category } from '@riddle-rush/types/game'
import { gameSessionTestFixture } from '@riddle-rush/types/schemas'

// Mock useStatistics
const mockUpdateStatistics = vi.fn()
vi.mock('../../../composables/useStatistics', () => ({
  useStatistics: () => ({
    updateStatistics: mockUpdateStatistics,
  }),
}))

// Mock useLogger
const mockLoggerError = vi.fn()
vi.mock('../../../composables/useLogger', () => ({
  useLogger: () => ({
    log: vi.fn(),
    warn: vi.fn(),
    error: mockLoggerError,
    debug: vi.fn(),
    info: vi.fn(),
  }),
}))

// Import after mocks are set up
const { useGameLifecycle } = await import('../../../composables/useGameLifecycle')

// Helper to create a mock Category
function createMockCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1,
    name: 'Fruits',
    searchWord: 'fruits',
    key: 'fruits',
    searchProvider: 'offline',
    ...overrides,
  }
}

// Helper to create a mock Player
function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    name: 'Alice',
    totalScore: 10,
    currentRoundScore: 5,
    currentRoundAnswer: 'apple',
    hasSubmitted: true,
    ...overrides,
  }
}

// Helper to create a mock GameSession
function createMockSession(overrides: Partial<GameSession> = {}): GameSession {
  return gameSessionTestFixture({
    id: 'test-session-1',
    players: [
      createMockPlayer(),
      createMockPlayer({
        id: 'player-2',
        name: 'Bob',
        totalScore: 3,
        currentRoundScore: 0,
        currentRoundAnswer: '',
        hasSubmitted: true,
      }),
    ],
    currentRound: 2,
    currentPlayerIndex: 0,
    category: createMockCategory(),
    letter: 'A',
    startTime: Date.now() - 60000,
    status: 'active',
    roundHistory: [],
    ...overrides,
  })
}

describe('useGameLifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ──────────────────────────────────────────
  // createAttempt
  // ──────────────────────────────────────────
  describe('createAttempt', () => {
    it('should return a GameAttempt with correct structure', () => {
      const { createAttempt } = useGameLifecycle()
      const attempt = createAttempt('apple', true)

      expect(attempt).toHaveProperty('term')
      expect(attempt).toHaveProperty('found')
      expect(attempt).toHaveProperty('timestamp')
    })

    it('should include timestamp as a number (Date.now format)', () => {
      const { createAttempt } = useGameLifecycle()
      const before = Date.now()
      const attempt = createAttempt('banana', false)
      const after = Date.now()

      expect(typeof attempt.timestamp).toBe('number')
      expect(attempt.timestamp).toBeGreaterThanOrEqual(before)
      expect(attempt.timestamp).toBeLessThanOrEqual(after)
    })

    it('should store term property matching input', () => {
      const { createAttempt } = useGameLifecycle()
      const attempt = createAttempt('cherry', true)

      expect(attempt.term).toBe('cherry')
    })

    it('should store found property matching input when true', () => {
      const { createAttempt } = useGameLifecycle()
      const attempt = createAttempt('date', true)

      expect(attempt.found).toBe(true)
    })

    it('should store found property matching input when false', () => {
      const { createAttempt } = useGameLifecycle()
      const attempt = createAttempt('elderberry', false)

      expect(attempt.found).toBe(false)
    })

    it('should handle empty term string', () => {
      const { createAttempt } = useGameLifecycle()
      const attempt = createAttempt('', false)

      expect(attempt.term).toBe('')
      expect(attempt.found).toBe(false)
    })
  })

  // ──────────────────────────────────────────
  // buildRoundResult
  // ──────────────────────────────────────────
  describe('buildRoundResult', () => {
    it('should return object with roundNumber from session', () => {
      const { buildRoundResult } = useGameLifecycle()
      const session = createMockSession({ currentRound: 3 })
      const result = buildRoundResult(session)

      expect(result.roundNumber).toBe(3)
    })

    it('should include category name from session', () => {
      const { buildRoundResult } = useGameLifecycle()
      const session = createMockSession()
      const result = buildRoundResult(session)

      expect(result.category).toBe('Fruits')
    })

    it('should include letter from session', () => {
      const { buildRoundResult } = useGameLifecycle()
      const session = createMockSession({ letter: 'Z' })
      const result = buildRoundResult(session)

      expect(result.letter).toBe('Z')
    })

    it('should include timestamp property', () => {
      const { buildRoundResult } = useGameLifecycle()
      const session = createMockSession()
      const before = Date.now()
      const result = buildRoundResult(session)
      const after = Date.now()

      expect(typeof result.timestamp).toBe('number')
      expect(result.timestamp).toBeGreaterThanOrEqual(before)
      expect(result.timestamp).toBeLessThanOrEqual(after)
    })

    it('should have playerResults array matching session players', () => {
      const { buildRoundResult } = useGameLifecycle()
      const session = createMockSession()
      const result = buildRoundResult(session)

      expect(result.playerResults).toHaveLength(2)
    })

    it('should include correct structure for each player result', () => {
      const { buildRoundResult } = useGameLifecycle()
      const session = createMockSession()
      const result = buildRoundResult(session)

      const firstPlayer = result.playerResults[0]
      expect(firstPlayer).toHaveProperty('playerId')
      expect(firstPlayer).toHaveProperty('playerName')
      expect(firstPlayer).toHaveProperty('answer')
      expect(firstPlayer).toHaveProperty('score')
    })

    it('should map player data correctly', () => {
      const { buildRoundResult } = useGameLifecycle()
      const session = createMockSession()
      const result = buildRoundResult(session)

      expect(result.playerResults[0]).toEqual({
        playerId: 'player-1',
        playerName: 'Alice',
        answer: 'apple',
        score: 5,
      })

      expect(result.playerResults[1]).toEqual({
        playerId: 'player-2',
        playerName: 'Bob',
        answer: '',
        score: 0,
      })
    })

    it('should use empty string when currentRoundAnswer is undefined', () => {
      const { buildRoundResult } = useGameLifecycle()
      const session = createMockSession({
        players: [
          createMockPlayer({
            id: 'player-1',
            name: 'Alice',
            totalScore: 0,
            currentRoundScore: 0,
            currentRoundAnswer: undefined,
            hasSubmitted: false,
          }),
        ],
      })
      const result = buildRoundResult(session)

      expect(result.playerResults[0]!.answer).toBe('')
    })
  })

  // ──────────────────────────────────────────
  // updateStatisticsForSession
  // ──────────────────────────────────────────
  describe('updateStatisticsForSession', () => {
    it('should call useStatistics().updateStatistics with session', async () => {
      const { updateStatisticsForSession } = useGameLifecycle()
      const session = createMockSession()

      await updateStatisticsForSession(session)

      expect(mockUpdateStatistics).toHaveBeenCalledWith(session)
    })

    it('should log error via useLogger when updateStatistics throws', async () => {
      const testError = new Error('Statistics update failed')
      mockUpdateStatistics.mockRejectedValueOnce(testError)

      const { updateStatisticsForSession } = useGameLifecycle()
      const session = createMockSession()

      await updateStatisticsForSession(session)

      expect(mockLoggerError).toHaveBeenCalledWith('Error updating statistics:', testError)
    })

    it('should not throw error when updateStatistics fails', async () => {
      mockUpdateStatistics.mockRejectedValueOnce(new Error('DB error'))

      const { updateStatisticsForSession } = useGameLifecycle()
      const session = createMockSession()

      // Should not throw
      await expect(updateStatisticsForSession(session)).resolves.toBeUndefined()
    })

    it('should resolve without error on success', async () => {
      mockUpdateStatistics.mockResolvedValueOnce(undefined)

      const { updateStatisticsForSession } = useGameLifecycle()
      const session = createMockSession()

      await expect(updateStatisticsForSession(session)).resolves.toBeUndefined()
    })
  })

  // ──────────────────────────────────────────
  // Return shape
  // ──────────────────────────────────────────
  describe('return value', () => {
    it('should return all expected functions', () => {
      const lifecycle = useGameLifecycle()

      expect(lifecycle).toHaveProperty('createAttempt')
      expect(lifecycle).toHaveProperty('buildRoundResult')
      expect(lifecycle).toHaveProperty('updateStatisticsForSession')
      expect(typeof lifecycle.createAttempt).toBe('function')
      expect(typeof lifecycle.buildRoundResult).toBe('function')
      expect(typeof lifecycle.updateStatisticsForSession).toBe('function')
    })
  })
})
