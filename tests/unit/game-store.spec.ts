import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../stores/game'
import { createCategoryList, createCategory, createGameSession } from '../utils/factories'
import type { Category } from '../../types/game'

// Mock setup
const mockSaveGameSession = vi.fn().mockResolvedValue(undefined)
const mockGetGameSession = vi.fn().mockResolvedValue(null)
const mockSaveGameHistory = vi.fn().mockResolvedValue(undefined)
const mockGetGameHistory = vi.fn().mockResolvedValue([])
const mockUpdateStatistics = vi.fn().mockResolvedValue(undefined)

vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    saveGameSession: mockSaveGameSession,
    getGameSession: mockGetGameSession,
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

describe('Game Store', () => {
  let mockCategories: Category[]

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockCategories = createCategoryList(10)
    fetchMock.mockResolvedValue(mockCategories)
    mockGetGameSession.mockResolvedValue(null)
    mockGetGameHistory.mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllTimers()
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
      expect(store.displayedCategoryCount).toBe(9)
    })

    it('hasActiveSession is false when no session', () => {
      const store = useGameStore()
      expect(store.hasActiveSession).toBe(false)
    })

    it('currentScore is 0 when no session', () => {
      const store = useGameStore()
      expect(store.currentScore).toBe(0)
    })

    it('currentAttempts is empty when no session', () => {
      const store = useGameStore()
      expect(store.currentAttempts).toEqual([])
    })
  })

  describe('Category Fetching', () => {
    it('fetches categories', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(fetchMock).toHaveBeenCalled()
      expect(store.categories).toEqual(mockCategories)
    })

    it('sets categoriesLoaded after fetch', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(store.categoriesLoaded).toBe(true)
    })

    it('does not refetch if already loaded', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      await store.fetchCategories()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('refetches when force=true', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      await store.fetchCategories(true)
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('handles API error gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))
      const store = useGameStore()
      await expect(store.fetchCategories()).rejects.toThrow('Network error')
      expect(store.categoriesLoaded).toBe(false)
    })

    it('limits displayed categories', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(store.displayedCategories.length).toBeLessThanOrEqual(9)
    })
  })

  describe('Category Lookup', () => {
    it('finds category by id', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      const target = mockCategories[3]
      expect(store.getCategoryById(target.id)).toEqual(target)
    })

    it('returns null for unknown id', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(store.getCategoryById(999999)).toBeNull()
    })

    it('returns null when categories empty', () => {
      const store = useGameStore()
      expect(store.getCategoryById(1)).toBeNull()
    })
  })

  describe('Load More Categories', () => {
    it('increases displayed count by 9', () => {
      const store = useGameStore()
      store.categories = createCategoryList(30)
      store.loadMoreCategories()
      expect(store.displayedCategoryCount).toBe(18)
    })

    it('caps at total category count', () => {
      const store = useGameStore()
      store.categories = createCategoryList(5)
      store.displayedCategoryCount = 9
      store.loadMoreCategories()
      expect(store.displayedCategories.length).toBe(5)
    })
  })

  describe('Start New Game', () => {
    it('creates session with category', async () => {
      const store = useGameStore()
      const session = await store.startNewGame()
      expect(session).toBeDefined()
      expect(session.category).toBeDefined()
      expect(session.category.name.length).toBeGreaterThan(0)
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

    it('uses specific category when provided', async () => {
      const store = useGameStore()
      const target = mockCategories[2]
      await store.startNewGame({ categoryId: target.id })
      expect(store.currentSession?.category.id).toBe(target.id)
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
      expect(store.currentScore).toBe(10)
      expect(store.currentAttempts).toHaveLength(1)
      expect(store.currentAttempts[0].found).toBe(true)
    })

    it('adds incorrect attempt without score', async () => {
      const store = useGameStore()
      await store.submitAttempt('wrong', false)
      expect(store.currentScore).toBe(0)
      expect(store.currentAttempts[0].found).toBe(false)
    })

    it('accumulates score for multiple correct', async () => {
      const store = useGameStore()
      await store.submitAttempt('a', true)
      await store.submitAttempt('b', true)
      await store.submitAttempt('c', true)
      expect(store.currentScore).toBe(30)
    })

    it('records attempt term', async () => {
      const store = useGameStore()
      await store.submitAttempt('my answer', true)
      expect(store.currentAttempts[0].term).toBe('my answer')
    })

    it('records attempt timestamp', async () => {
      const store = useGameStore()
      const before = Date.now()
      await store.submitAttempt('test', true)
      const after = Date.now()
      expect(store.currentAttempts[0].timestamp).toBeGreaterThanOrEqual(before)
      expect(store.currentAttempts[0].timestamp).toBeLessThanOrEqual(after)
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
      expect(store.currentAttempts[0].term).toBe('')
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

    it('adds session to history', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(store.history).toHaveLength(1)
    })

    it('preserves score in history', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(store.history[0].score).toBe(10)
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

    it('sets endTime on session', async () => {
      const store = useGameStore()
      const before = Date.now()
      await store.endGame()
      expect(store.history[0].endTime).toBeGreaterThanOrEqual(before)
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

  describe('Category Emoji', () => {
    it('returns emoji for Weiblicher Vorname', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Weiblicher Vorname')).toBe('👩')
    })

    it('returns emoji for Männlicher Vorname', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Männlicher Vorname')).toBe('👨')
    })

    it('returns emoji for Blumen', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Blumen')).toBe('🌸')
    })

    it('returns default for unknown', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Random Category')).toBe('🎯')
    })

    it('returns default for null', () => {
      const store = useGameStore()
      expect(store.categoryEmoji(null)).toBe('🎯')
    })

    it('returns default for undefined', () => {
      const store = useGameStore()
      expect(store.categoryEmoji(undefined)).toBe('🎯')
    })

    it('returns default for empty string', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('')).toBe('🎯')
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

    it('uses pending category', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      const target = mockCategories[4]
      store.setPendingCategory(target.id)
      await store.resumeOrStartNewGame()
      expect(store.currentSession?.category.id).toBe(target.id)
    })

    it('clears pending category after use', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      store.setPendingCategory(mockCategories[0].id)
      await store.resumeOrStartNewGame()
      expect(store.pendingCategoryId).toBeNull()
    })
  })

  describe('Pending Category', () => {
    it('sets pending category', () => {
      const store = useGameStore()
      store.setPendingCategory(123)
      expect(store.pendingCategoryId).toBe(123)
    })

    it('clears pending category with null', () => {
      const store = useGameStore()
      store.setPendingCategory(123)
      store.setPendingCategory(null)
      expect(store.pendingCategoryId).toBeNull()
    })
  })
})
