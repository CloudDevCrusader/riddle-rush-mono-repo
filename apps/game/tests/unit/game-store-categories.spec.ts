import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../stores/game'
import { createCategoryList } from '../utils/factories'
import type { Category } from '@riddle-rush/types/game'

/**
 * Game Store - Categories Tests
 *
 * This file tests category-related functionality:
 * - Category fetching
 * - Category lookup
 * - Load more categories
 * - Category emoji mapping
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

describe('Game Store - Categories', () => {
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

    it.skip('does not refetch if already loaded', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      const store = useGameStore()
      await store.fetchCategories()
      await store.fetchCategories()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it.skip('refetches when force=true', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      const store = useGameStore()
      await store.fetchCategories()
      await store.fetchCategories(true)
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it.skip('handles API error gracefully', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
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
    it.skip('finds category by id', async () => {
      // TODO: Fix category data mismatch in CI
      const store = useGameStore()
      await store.fetchCategories()
      const target = mockCategories[3]!
      expect(store.getCategoryById(target.id)).toEqual(target)
    })

    it('returns null for unknown id', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(store.getCategoryById(999999)).toBeNull()
    })

    it.skip('returns null when categories empty', () => {
      // TODO: Fix state pollution in CI
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
      store.displayedCategoryCount = 9 // DEFAULT_DISPLAYED_CATEGORIES
      store.loadMoreCategories()
      expect(store.displayedCategories.length).toBe(5)
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

    it('returns emoji for Mountains oder Hills', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Mountains oder Hills')).toBe('🏔️')
    })

    it('returns emoji for Gewässer oder See', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Gewässer oder See')).toBe('💧')
    })

    it('returns emoji for Maschine', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Maschine')).toBe('⚙️')
    })

    it('returns emoji for Begriff aus der Technik', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Begriff aus der Technik')).toBe('🔧')
    })

    it('returns emoji for Begriff aus der Raumfahrt', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Begriff aus der Raumfahrt')).toBe('🚀')
    })

    it('returns emoji for Wort mit Endung -heit', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Wort mit Endung -heit')).toBe('📝')
    })

    it('returns emoji for Farbe', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Farbe')).toBe('🎨')
    })

    it('returns emoji for Erfinder Entdecker oder Gelehrter', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Erfinder Entdecker oder Gelehrter')).toBe('💡')
    })

    it('returns emoji for Komponist oder Sänger', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Komponist oder Sänger')).toBe('🎼')
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
})
