import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameSession, Category, Player } from '@riddle-rush/types/game'

// Mock generateUUID before importing composable
vi.mock('~/utils/uuid', () => ({
  generateUUID: vi.fn(() => 'mock-uuid-1234'),
}))

import { useSessionManager } from '~/composables/useSessionManager'
import { generateUUID } from '~/utils/uuid'

const mockGenerateUUID = vi.mocked(generateUUID)

const mockCategory: Category = {
  id: 1,
  name: 'Animals',
  searchWord: 'animal',
  key: 'animals',
  searchProvider: 'offline',
}

const mockPlayers: Player[] = [
  {
    id: 'player-1',
    name: 'Alice',
    totalScore: 0,
    currentRoundScore: 0,
    hasSubmitted: false,
  },
  {
    id: 'player-2',
    name: 'Bob',
    totalScore: 0,
    currentRoundScore: 0,
    hasSubmitted: false,
  },
]

describe('useSessionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerateUUID.mockReturnValue('mock-uuid-1234')
  })

  describe('createSession', () => {
    it('should return GameSession with correct structure', () => {
      const { createSession } = useSessionManager()
      const session = createSession(mockPlayers, mockCategory, 'A')

      expect(session).toMatchObject({
        id: expect.any(String),
        players: mockPlayers,
        currentRound: 1,
        currentPlayerIndex: 0,
        letter: 'A',
        status: 'active',
        roundHistory: [],
      })
      expect(typeof session.startTime).toBe('number')
    })

    it('should generate unique session ID', () => {
      const { createSession } = useSessionManager()

      mockGenerateUUID.mockReturnValueOnce('uuid-aaa').mockReturnValueOnce('uuid-bbb')
      const session1 = createSession(mockPlayers, mockCategory, 'A')
      const session2 = createSession(mockPlayers, mockCategory, 'B')

      expect(session1.id).toBe('uuid-aaa')
      expect(session2.id).toBe('uuid-bbb')
      expect(session1.id).not.toBe(session2.id)
    })

    it('should include players, category and letter', () => {
      const { createSession } = useSessionManager()
      const session = createSession(mockPlayers, mockCategory, 'Z')

      expect(session.players).toEqual(mockPlayers)
      expect(session.category.key).toBe('animals')
      expect(session.category.letter).toBe('Z')
      expect(session.letter).toBe('Z')
    })

    it('should merge letter into category', () => {
      const { createSession } = useSessionManager()
      const session = createSession(mockPlayers, mockCategory, 'M')

      expect(session.category).toMatchObject({
        ...mockCategory,
        letter: 'M',
      })
    })

    it('should include optional gameName when provided', () => {
      const { createSession } = useSessionManager()
      const session = createSession(mockPlayers, mockCategory, 'A', 'My Game')

      expect(session.gameName).toBe('My Game')
    })

    it('should have undefined gameName when not provided', () => {
      const { createSession } = useSessionManager()
      const session = createSession(mockPlayers, mockCategory, 'A')

      expect(session.gameName).toBeUndefined()
    })

    it('should have startTime as a number timestamp', () => {
      const { createSession } = useSessionManager()
      const before = Date.now()
      const session = createSession(mockPlayers, mockCategory, 'A')
      const after = Date.now()

      expect(session.startTime).toBeGreaterThanOrEqual(before)
      expect(session.startTime).toBeLessThanOrEqual(after)
    })
  })

  describe('createSinglePlayerSession', () => {
    it('should return GameSession with required properties', () => {
      const { createSinglePlayerSession } = useSessionManager()
      const session = createSinglePlayerSession(mockCategory, 'B')

      expect(session).toMatchObject({
        id: expect.any(String),
        userId: 'default-user',
        players: [],
        currentRound: 0,
        currentPlayerIndex: 0,
        score: 0,
        attempts: [],
        status: 'active',
        roundHistory: [],
      })
    })

    it('should have userId: default-user', () => {
      const { createSinglePlayerSession } = useSessionManager()
      const session = createSinglePlayerSession(mockCategory, 'B')

      expect(session.userId).toBe('default-user')
    })

    it('should have empty players array', () => {
      const { createSinglePlayerSession } = useSessionManager()
      const session = createSinglePlayerSession(mockCategory, 'B')

      expect(session.players).toEqual([])
    })

    it('should have currentRound: 0 for single-player', () => {
      const { createSinglePlayerSession } = useSessionManager()
      const session = createSinglePlayerSession(mockCategory, 'B')

      expect(session.currentRound).toBe(0)
    })

    it('should have score: 0 and attempts: [] as single-player legacy fields', () => {
      const { createSinglePlayerSession } = useSessionManager()
      const session = createSinglePlayerSession(mockCategory, 'B')

      expect(session.score).toBe(0)
      expect(session.attempts).toEqual([])
    })
  })

  describe('cloneSessionForHistory', () => {
    it('should return object identical to input', () => {
      const { createSession, cloneSessionForHistory } = useSessionManager()
      const original = createSession(mockPlayers, mockCategory, 'A', 'Test')
      const clone = cloneSessionForHistory(original)

      expect(clone).toEqual(original)
    })

    it('should create a deep copy (mutations do not affect original)', () => {
      const { createSession, cloneSessionForHistory } = useSessionManager()
      const original = createSession(mockPlayers, mockCategory, 'A')
      const clone = cloneSessionForHistory(original)

      // Mutate clone
      clone.letter = 'Z'
      clone.players.push({
        id: 'extra',
        name: 'Extra',
        totalScore: 99,
        currentRoundScore: 0,
        hasSubmitted: false,
      })

      // Original should not be affected
      expect(original.letter).toBe('A')
      expect(original.players).toHaveLength(mockPlayers.length)
    })

    it('should preserve all properties including nested structures', () => {
      const { createSession, cloneSessionForHistory } = useSessionManager()
      const original = createSession(mockPlayers, mockCategory, 'A')
      const clone = cloneSessionForHistory(original)

      expect(clone.id).toBe(original.id)
      expect(clone.category).toEqual(original.category)
      expect(clone.players).toEqual(original.players)
      expect(clone.startTime).toBe(original.startTime)
      expect(clone.status).toBe(original.status)
      expect(clone.roundHistory).toEqual(original.roundHistory)
    })
  })

  describe('isSessionActive', () => {
    it('should return true when session exists and status is active', () => {
      const { createSession, isSessionActive } = useSessionManager()
      const session = createSession(mockPlayers, mockCategory, 'A')

      expect(isSessionActive(session)).toBe(true)
    })

    it('should return false when session is null', () => {
      const { isSessionActive } = useSessionManager()

      expect(isSessionActive(null)).toBe(false)
    })

    it('should return false when session status is not active', () => {
      const { createSession, isSessionActive } = useSessionManager()
      const session = createSession(mockPlayers, mockCategory, 'A')
      const completedSession: GameSession = { ...session, status: 'completed' }
      const abandonedSession: GameSession = { ...session, status: 'abandoned' }

      expect(isSessionActive(completedSession)).toBe(false)
      expect(isSessionActive(abandonedSession)).toBe(false)
    })
  })

  describe('getSessionDuration', () => {
    it('should return 0 when session is null', () => {
      const { getSessionDuration } = useSessionManager()

      expect(getSessionDuration(null)).toBe(0)
    })

    it('should calculate correct duration when endTime is set', () => {
      const { getSessionDuration } = useSessionManager()
      const startTime = 1000000
      const endTime = 1005000
      const session: GameSession = {
        id: 'test',
        players: [],
        currentRound: 1,
        currentPlayerIndex: 0,
        category: mockCategory,
        letter: 'A',
        startTime,
        endTime,
        status: 'completed',
        roundHistory: [],
      }

      expect(getSessionDuration(session)).toBe(5000)
    })

    it('should use Date.now() when endTime is undefined', () => {
      const { getSessionDuration } = useSessionManager()
      const startTime = Date.now() - 3000
      const session: GameSession = {
        id: 'test',
        players: [],
        currentRound: 1,
        currentPlayerIndex: 0,
        category: mockCategory,
        letter: 'A',
        startTime,
        status: 'active',
        roundHistory: [],
      }

      const duration = getSessionDuration(session)
      // Should be approximately 3000ms
      expect(duration).toBeGreaterThanOrEqual(2900)
      expect(duration).toBeLessThanOrEqual(3500)
    })

    it('should return correct duration in milliseconds', () => {
      const { getSessionDuration } = useSessionManager()
      const startTime = 500
      const endTime = 1500
      const session: GameSession = {
        id: 'test',
        players: [],
        currentRound: 1,
        currentPlayerIndex: 0,
        category: mockCategory,
        letter: 'A',
        startTime,
        endTime,
        status: 'completed',
        roundHistory: [],
      }

      expect(getSessionDuration(session)).toBe(1000)
    })
  })

  describe('return value', () => {
    it('should return all expected functions', () => {
      const manager = useSessionManager()

      expect(typeof manager.createSession).toBe('function')
      expect(typeof manager.createSinglePlayerSession).toBe('function')
      expect(typeof manager.cloneSessionForHistory).toBe('function')
      expect(typeof manager.isSessionActive).toBe('function')
      expect(typeof manager.getSessionDuration).toBe('function')
    })
  })
})
