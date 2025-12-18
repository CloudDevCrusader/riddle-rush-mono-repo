import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../stores/game'
import { createCategoryList } from '../utils/factories'
import type { Category } from '../../types/game'

const mockSaveGameSession = vi.fn()
const mockGetGameSession = vi.fn().mockResolvedValue(null)
const mockSaveGameHistory = vi.fn()
const mockGetGameHistory = vi.fn().mockResolvedValue([])
const mockUpdateStatistics = vi.fn()

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

let mockCategories: Category[] = []

describe('Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    mockCategories = createCategoryList(8)
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(mockCategories)

    mockSaveGameSession.mockReset()
    mockGetGameSession.mockReset()
    mockGetGameSession.mockResolvedValue(null)
    mockSaveGameHistory.mockReset()
    mockGetGameHistory.mockReset()
    mockGetGameHistory.mockResolvedValue([])
    mockUpdateStatistics.mockReset()
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useGameStore()

      expect(store.currentSession).toBeNull()
      expect(store.isOnline).toBe(true)
      expect(store.history).toEqual([])
      expect(store.categories).toEqual([])
      expect(store.categoriesLoaded).toBe(false)
      expect(store.displayedCategoryCount).toBe(9)
    })

    it('should have no active session initially', () => {
      const store = useGameStore()
      expect(store.hasActiveSession).toBe(false)
    })

    it('should return 0 score when no session', () => {
      const store = useGameStore()
      expect(store.currentScore).toBe(0)
    })
  })

  describe('Category Management', () => {
    it('should fetch and store categories', async () => {
      const store = useGameStore()

      await store.fetchCategories()

      expect(store.categories).toEqual(mockCategories)
      expect(store.categoriesLoaded).toBe(true)
      expect(store.displayedCategories).toHaveLength(Math.min(9, mockCategories.length))
    })

    it('should not refetch if already loaded', async () => {
      const store = useGameStore()

      await store.fetchCategories()
      await store.fetchCategories()

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('should force refetch when requested', async () => {
      const store = useGameStore()

      await store.fetchCategories()
      const refreshedCategories = createCategoryList(5)
      fetchMock.mockResolvedValue(refreshedCategories)

      await store.fetchCategories(true)

      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(store.categories).toEqual(refreshedCategories)
    })

    it('should get category by id', async () => {
      const store = useGameStore()
      await store.fetchCategories()

      const target = mockCategories[0]
      const category = store.getCategoryById(target.id)
      expect(category).toEqual(target)
    })

    it('should return null for non-existent category', async () => {
      const store = useGameStore()
      await store.fetchCategories()

      const category = store.getCategoryById(999999)
      expect(category).toBeNull()
    })

    it('should load more categories', async () => {
      const store = useGameStore()
      store.categories = createCategoryList(20)
      store.displayedCategoryCount = 9

      store.loadMoreCategories()

      expect(store.displayedCategoryCount).toBe(18)
    })
  })

  describe('Game Session', () => {
    it('should create new game session with valid category', async () => {
      const store = useGameStore()

      const session = await store.startNewGame()

      expect(session.category.name.length).toBeGreaterThan(0)
      expect(store.currentSession).not.toBeNull()
      expect(store.hasActiveSession).toBe(true)
      expect(store.currentSession?.score).toBe(0)
      expect(store.currentSession?.attempts).toEqual([])
      expect(mockSaveGameSession).toHaveBeenCalledTimes(1)
    })

    it('should start game with specific category', async () => {
      const store = useGameStore()
      const target = mockCategories[1]

      await store.startNewGame({ categoryId: target.id })

      expect(store.currentSession?.category.id).toBe(target.id)
      expect(store.currentSession?.category.name).toBe(target.name)
    })

    it('should submit correct attempt and add score', async () => {
      const store = useGameStore()
      await store.startNewGame()

      await store.submitAttempt('test answer', true)

      expect(store.currentScore).toBe(10)
      expect(store.currentAttempts).toHaveLength(1)
      expect(store.currentAttempts[0].found).toBe(true)
      expect(mockSaveGameSession).toHaveBeenCalledTimes(2)
    })

    it('should submit incorrect attempt without score', async () => {
      const store = useGameStore()
      await store.startNewGame()

      await store.submitAttempt('wrong answer', false)

      expect(store.currentScore).toBe(0)
      expect(store.currentAttempts).toHaveLength(1)
      expect(store.currentAttempts[0].found).toBe(false)
    })

    it('should accumulate score for multiple correct attempts', async () => {
      const store = useGameStore()
      await store.startNewGame()

      await store.submitAttempt('answer1', true)
      await store.submitAttempt('answer2', true)
      await store.submitAttempt('answer3', false)

      expect(store.currentScore).toBe(20)
      expect(store.currentAttempts).toHaveLength(3)
    })

    it('should clear session on end game', async () => {
      const store = useGameStore()
      await store.startNewGame()

      await store.endGame()

      expect(store.currentSession).toBeNull()
      expect(store.hasActiveSession).toBe(false)
      expect(mockSaveGameHistory).toHaveBeenCalledTimes(1)
      expect(mockUpdateStatistics).toHaveBeenCalledTimes(1)
    })

    it('should add session to history on end game', async () => {
      const store = useGameStore()
      await store.startNewGame()
      await store.submitAttempt('test', true)

      await store.endGame()

      expect(store.history).toHaveLength(1)
      expect(store.history[0].score).toBe(10)
    })
  })

  describe('Online Status', () => {
    it('should update online status', () => {
      const store = useGameStore()

      store.setOnlineStatus(false)
      expect(store.isOnline).toBe(false)

      store.setOnlineStatus(true)
      expect(store.isOnline).toBe(true)
    })
  })

  describe('Category Emoji', () => {
    it('should return correct emoji for known category', () => {
      const store = useGameStore()

      expect(store.categoryEmoji('Weiblicher Vorname')).toBe('👩')
      expect(store.categoryEmoji('Männlicher Vorname')).toBe('👨')
      expect(store.categoryEmoji('Blumen')).toBe('🌸')
    })

    it('should return default emoji for unknown category', () => {
      const store = useGameStore()

      expect(store.categoryEmoji('Unknown Category')).toBe('🎯')
    })

    it('should return default emoji for null/undefined', () => {
      const store = useGameStore()

      expect(store.categoryEmoji(null)).toBe('🎯')
      expect(store.categoryEmoji(undefined)).toBe('🎯')
    })
  })

  describe('Resume Game', () => {
    it('should return existing session if active', async () => {
      const store = useGameStore()
      await store.startNewGame()
      const existingSession = store.currentSession

      const session = await store.resumeOrStartNewGame()

      expect(session).toBe(existingSession)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('should start new game if no active session', async () => {
      const store = useGameStore()

      await store.resumeOrStartNewGame()

      expect(store.hasActiveSession).toBe(true)
    })

    it('should use pending category when resuming', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      const pending = mockCategories[2]
      store.setPendingCategory(pending.id)

      await store.resumeOrStartNewGame()

      expect(store.currentSession?.category.id).toBe(pending.id)
      expect(store.pendingCategoryId).toBeNull()
    })
  })
})
