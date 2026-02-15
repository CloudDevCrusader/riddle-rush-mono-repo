import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../stores/game'
import { createCategoryList } from '../utils/factories'
import type { Category } from '@riddle-rush/types/game'

/**
 * Game Store - Session Lifecycle Tests
 *
 * This file tests session-related functionality:
 * - Initial state
 * - Start new game
 * - Submit attempt
 * - End game
 * - Resume or start new game
 * - Online status
 * - Load session by ID
 */

// Mock setup
const mockSaveGameSession = vi.fn().mockResolvedValue(undefined)
const mockGetGameSession = vi.fn().mockResolvedValue(null)
const mockSaveGameHistory = vi.fn().mockResolvedValue(undefined)
const mockGetGameHistory = vi.fn().mockResolvedValue([])
const mockUpdateStatistics = vi.fn().mockResolvedValue(undefined)
const mockGetGameSessionById = vi.fn().mockResolvedValue(null)

vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    saveGameSession: mockSaveGameSession,
    getGameSession: mockGetGameSession,
    getGameSessionById: mockGetGameSessionById,
    saveGameHistory: mockSaveGameHistory,
    getGameHistory: mockGetGameHistory,
  }),
}))

vi.mock('~/composables/useStatistics', () => ({
  useStatistics: () => ({
    updateStatistics: mockUpdateStatistics,
  }),
}))

const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock as unknown as typeof $fetch)

describe('Game Store - Session Lifecycle', () => {
  let mockCategories: Category[]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    const pinia = createPinia()
    setActivePinia(pinia)
    // Force reset all stores
    // @ts-expect-error: Accessing internal Pinia API for test cleanup
    pinia._s.forEach((store: any) => store.$reset())
    mockCategories = createCategoryList(10)
    fetchMock.mockResolvedValue(mockCategories)
    fetchMock.mockClear()
    mockGetGameSession.mockResolvedValue(null)
    mockGetGameHistory.mockResolvedValue([])
    mockGetGameSessionById.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has null currentSession on init', () => {
      const store = useGameStore()
      expect(store.currentSession).toBeNull()
    })

    it('is online by default', () => {
      const store = useGameStore()
      expect(store.isOnline).toBe(true)
    })

    it('has empty history on init', () => {
      const store = useGameStore()
      expect(store.history).toEqual([])
    })

    it('has empty categories on init', () => {
      const store = useGameStore()
      expect(store.categories).toEqual([])
    })

    it('categories not loaded on init', () => {
      const store = useGameStore()
      expect(store.categoriesLoaded).toBe(false)
    })

    it('default displayed category count is 9', () => {
      const store = useGameStore()
      expect(store.displayedCategoryCount).toBe(9) // DEFAULT_DISPLAYED_CATEGORIES
    })

    it('hasActiveSession is false when no session', () => {
      const store = useGameStore()
      expect(store.hasActiveSession).toBe(false)
    })

    it('session score is undefined when no session', () => {
      const store = useGameStore()
      expect(store.currentSession?.score).toBeUndefined()
    })

    it('session attempts is undefined when no session', () => {
      const store = useGameStore()
      expect(store.currentSession?.attempts).toBeUndefined()
    })
  })

  describe('Start New Game', () => {
    it('creates session with category', async () => {
      const store = useGameStore()
      const session = await store.startNewGame()
      expect(session).toBeDefined()
      expect(session?.category).toBeDefined()
      expect(session?.category.name.length).toBeGreaterThan(0)
    })

    it('sets currentSession', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(store.currentSession).not.toBeNull()
    })

    it('initializes score to 0', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(store.currentSession?.score).toBe(0)
    })

    it('initializes empty attempts', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(store.currentSession?.attempts).toEqual([])
    })

    it('sets startTime', async () => {
      const store = useGameStore()
      const before = Date.now()
      await store.startNewGame()
      const after = Date.now()
      expect(store.currentSession?.startTime).toBeGreaterThanOrEqual(before)
      expect(store.currentSession?.startTime).toBeLessThanOrEqual(after)
    })

    it('persists session to IndexedDB', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(mockSaveGameSession).toHaveBeenCalledTimes(1)
    })

    it('selects a random category', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(store.currentSession?.category).toBeDefined()
      expect(mockCategories.some((cat) => cat.id === store.currentSession?.category.id)).toBe(true)
    })

    it('hasActiveSession becomes true', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(store.hasActiveSession).toBe(true)
    })
  })

  describe('Submit Attempt', () => {
    beforeEach(async () => {
      const store = useGameStore()
      await store.startNewGame()
      vi.clearAllMocks()
    })

    it('adds correct attempt with score', async () => {
      const store = useGameStore()
      await store.submitAttempt('correct answer', true)
      expect(store.currentSession?.score).toBe(10)
      expect(store.currentSession?.attempts).toHaveLength(1)
      expect(store.currentSession?.attempts?.[0]!.found).toBe(true)
    })

    it('adds incorrect attempt without score', async () => {
      const store = useGameStore()
      await store.submitAttempt('wrong', false)
      expect(store.currentSession?.score).toBe(0)
      expect(store.currentSession?.attempts?.[0]!.found).toBe(false)
    })

    it('accumulates score for multiple correct', async () => {
      const store = useGameStore()
      await store.submitAttempt('a', true)
      await store.submitAttempt('b', true)
      await store.submitAttempt('c', true)
      expect(store.currentSession?.score).toBe(30)
    })

    it('records attempt term', async () => {
      const store = useGameStore()
      await store.submitAttempt('my answer', true)
      expect(store.currentSession?.attempts?.[0]!.term).toBe('my answer')
    })

    it('records attempt timestamp', async () => {
      const store = useGameStore()
      const before = Date.now()
      await store.submitAttempt('test', true)
      const after = Date.now()
      expect(store.currentSession?.attempts?.[0]!.timestamp).toBeGreaterThanOrEqual(before)
      expect(store.currentSession?.attempts?.[0]!.timestamp).toBeLessThanOrEqual(after)
    })

    it('persists after each attempt', async () => {
      const store = useGameStore()
      await store.submitAttempt('a', true)
      await store.submitAttempt('b', false)
      expect(mockSaveGameSession).toHaveBeenCalledTimes(2)
    })

    it('handles empty term', async () => {
      const store = useGameStore()
      await store.submitAttempt('', false)
      expect(store.currentSession?.attempts?.[0]!.term).toBe('')
    })

    it('does nothing without active session', async () => {
      const store = useGameStore()
      store.currentSession = null
      await store.submitAttempt('test', true)
      expect(mockSaveGameSession).not.toHaveBeenCalled()
    })
  })

  describe('End Game', () => {
    beforeEach(async () => {
      const store = useGameStore()
      await store.startNewGame()
      await store.submitAttempt('answer', true)
      vi.clearAllMocks()
    })

    it('clears currentSession', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(store.currentSession).toBeNull()
    })

    it('sets hasActiveSession to false', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(store.hasActiveSession).toBe(false)
    })

    it.skip('adds session to history', async () => {
      // TODO: Fix history state pollution in CI
      const store = useGameStore()
      await store.endGame()
      expect(store.history).toHaveLength(1)
    })

    it('preserves score in history', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(store.history[0]!.score).toBe(10)
    })

    it('calls saveGameHistory', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(mockSaveGameHistory).toHaveBeenCalledTimes(1)
    })

    it('calls updateStatistics', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(mockUpdateStatistics).toHaveBeenCalledTimes(1)
    })

    it('does not throw if updateStatistics fails', async () => {
      const store = useGameStore()
      mockUpdateStatistics.mockRejectedValueOnce(new Error('stats failed'))

      await expect(store.endGame()).resolves.toBeUndefined()
      expect(store.currentSession).toBeNull()
    })

    it.skip('sets endTime on session', async () => {
      // TODO: Fix timing race condition in CI
      const store = useGameStore()
      const before = Date.now()
      await store.endGame()
      expect(store.history[0]!.endTime).toBeGreaterThanOrEqual(before)
    })

    it('does nothing without active session', async () => {
      const store = useGameStore()
      store.currentSession = null
      await store.endGame()
      expect(mockSaveGameHistory).not.toHaveBeenCalled()
    })
  })

  describe('Online Status', () => {
    it('sets offline', () => {
      const store = useGameStore()
      store.setOnlineStatus(false)
      expect(store.isOnline).toBe(false)
    })

    it('sets online', () => {
      const store = useGameStore()
      store.setOnlineStatus(false)
      store.setOnlineStatus(true)
      expect(store.isOnline).toBe(true)
    })
  })

  describe('Resume or Start New Game', () => {
    it('returns existing session if active', async () => {
      const store = useGameStore()
      await store.startNewGame()
      const existing = store.currentSession
      const result = await store.resumeOrStartNewGame()
      expect(result).toBe(existing)
    })

    it('starts new game if no session', async () => {
      const store = useGameStore()
      await store.resumeOrStartNewGame()
      expect(store.hasActiveSession).toBe(true)
    })

    it('uses random category', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      await store.resumeOrStartNewGame()
      expect(store.currentSession?.category).toBeDefined()
      expect(mockCategories.some((cat) => cat.id === store.currentSession?.category.id)).toBe(true)
    })
  })

  describe('Load Session By ID', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      mockGetGameSessionById.mockResolvedValue(null)
    })

    it('should load session by ID', async () => {
      const store = useGameStore()
      const mockSession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        category: mockCategories[0],
        startTime: Date.now(),
        endTime: null,
        currentLetter: 'A',
        answer: '',
        timeSpent: 0,
        players: [],
        currentPlayerIndex: 0,
        rounds: [],
        currentRoundIndex: 0,
      }

      mockGetGameSessionById.mockResolvedValue(mockSession)

      const result = await store.loadSessionById(mockSession.id)

      expect(mockGetGameSessionById).toHaveBeenCalledWith(mockSession.id)
      expect(result).toEqual(mockSession)
      expect(store.currentSession).toEqual(mockSession)
    })

    it('should throw error when session not found', async () => {
      const store = useGameStore()
      const gameId = 'non-existent-id'

      mockGetGameSessionById.mockResolvedValue(null)

      await expect(store.loadSessionById(gameId)).rejects.toThrow('Failed to load game session')
    })

    it('should handle IndexedDB errors', async () => {
      const store = useGameStore()
      const gameId = '123e4567-e89b-12d3-a456-426614174000'

      mockGetGameSessionById.mockRejectedValue(new Error('Database error'))

      await expect(store.loadSessionById(gameId)).rejects.toThrow('Failed to load game session')
    })

    it('should load session with UUID format', async () => {
      const store = useGameStore()
      const uuidGameId = '550e8400-e29b-41d4-a716-446655440000'
      const mockSession = {
        id: uuidGameId,
        category: mockCategories[1],
        startTime: Date.now(),
        endTime: null,
        currentLetter: 'B',
        answer: '',
        timeSpent: 0,
        players: [
          { name: 'Alice', currentAnswer: '', roundScores: [], totalScore: 0 },
          { name: 'Bob', currentAnswer: '', roundScores: [], totalScore: 0 },
        ],
        currentPlayerIndex: 0,
        rounds: [],
        currentRoundIndex: 0,
      }

      mockGetGameSessionById.mockResolvedValue(mockSession)

      const result = await store.loadSessionById(uuidGameId)

      expect(result.id).toBe(uuidGameId)
      expect(result.players).toHaveLength(2)
    })

    it('should throw descriptive error with session ID', async () => {
      const store = useGameStore()
      const gameId = 'test-game-123'

      mockGetGameSessionById.mockResolvedValue(null)

      try {
        await store.loadSessionById(gameId)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.message).toContain('Failed to load game session')
      }
    })
  })
})
