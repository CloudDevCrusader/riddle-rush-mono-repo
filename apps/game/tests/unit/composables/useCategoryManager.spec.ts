import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Category } from '@riddle-rush/types/game'

// Mock useCategoryEmoji before importing the composable
vi.mock('~/composables/useCategoryEmoji', () => ({
  useCategoryEmoji: () => ({
    resolve: (name?: string | null) => {
      if (!name) return '🎯'
      if (name.toLowerCase().includes('tier')) return '🐾'
      return '🎯'
    },
  }),
}))

// Mock useLodash before importing the composable
vi.mock('~/composables/useLodash', () => ({
  useLodashSync: () => ({
    shuffle: (arr: unknown[]) => [...arr].reverse(), // deterministic: reverses array
  }),
  useLodash: () => ({}),
}))

// Mock useLogger
vi.mock('~/composables/useLogger', () => ({
  useLogger: () => ({
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }),
}))

import { useCategoryManager } from '../../../composables/useCategoryManager'

// Helper factory
function createCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1,
    name: 'Test Category',
    searchWord: 'test',
    key: 'test',
    searchProvider: 'offline',
    ...overrides,
  } as Category
}

describe('useCategoryManager', () => {
  let manager: ReturnType<typeof useCategoryManager>

  beforeEach(() => {
    manager = useCategoryManager()
  })

  // ──────────────────────────────────────────
  // loadMoreCategories
  // ──────────────────────────────────────────
  describe('loadMoreCategories', () => {
    it('increases displayedCategoryCount by step when below categories.length', () => {
      const state = {
        displayedCategoryCount: 3,
        categories: Array.from({ length: 20 }, (_, i) => createCategory({ id: i + 1 })),
      }

      manager.loadMoreCategories(state, 9)

      expect(state.displayedCategoryCount).toBe(12)
    })

    it('uses default step of 9 when step not provided', () => {
      const state = {
        displayedCategoryCount: 0,
        categories: Array.from({ length: 20 }, (_, i) => createCategory({ id: i + 1 })),
      }

      manager.loadMoreCategories(state)

      expect(state.displayedCategoryCount).toBe(9)
    })

    it('does not exceed categories.length', () => {
      const state = {
        displayedCategoryCount: 15,
        categories: Array.from({ length: 18 }, (_, i) => createCategory({ id: i + 1 })),
      }

      manager.loadMoreCategories(state, 9)

      expect(state.displayedCategoryCount).toBe(18)
    })

    it('does nothing when displayedCategoryCount >= categories.length', () => {
      const state = {
        displayedCategoryCount: 20,
        categories: Array.from({ length: 20 }, (_, i) => createCategory({ id: i + 1 })),
      }

      manager.loadMoreCategories(state, 9)

      expect(state.displayedCategoryCount).toBe(20)
    })

    it('does nothing when categories array is empty', () => {
      const state = {
        displayedCategoryCount: 0,
        categories: [] as Category[],
      }

      manager.loadMoreCategories(state, 9)

      expect(state.displayedCategoryCount).toBe(0)
    })
  })

  // ──────────────────────────────────────────
  // resetDisplayedCategories
  // ──────────────────────────────────────────
  describe('resetDisplayedCategories', () => {
    it('sets displayedCategoryCount to count when count <= categories.length', () => {
      const state = {
        displayedCategoryCount: 20,
        categories: Array.from({ length: 30 }, (_, i) => createCategory({ id: i + 1 })),
      }

      manager.resetDisplayedCategories(state, 9)

      expect(state.displayedCategoryCount).toBe(9)
    })

    it('uses default count of 9', () => {
      const state = {
        displayedCategoryCount: 20,
        categories: Array.from({ length: 30 }, (_, i) => createCategory({ id: i + 1 })),
      }

      manager.resetDisplayedCategories(state)

      expect(state.displayedCategoryCount).toBe(9)
    })

    it('caps count at categories.length when count > categories.length', () => {
      const state = {
        displayedCategoryCount: 0,
        categories: Array.from({ length: 5 }, (_, i) => createCategory({ id: i + 1 })),
      }

      manager.resetDisplayedCategories(state, 9)

      expect(state.displayedCategoryCount).toBe(5)
    })

    it('uses count when categories array is empty', () => {
      // When categories is empty, state.categories.length || count falls back to count
      const state = {
        displayedCategoryCount: 20,
        categories: [] as Category[],
      }

      manager.resetDisplayedCategories(state, 9)

      expect(state.displayedCategoryCount).toBe(9)
    })
  })

  // ──────────────────────────────────────────
  // getCategoryById
  // ──────────────────────────────────────────
  describe('getCategoryById', () => {
    it('returns the correct Category when ID matches', () => {
      const categories = [
        createCategory({ id: 1, name: 'Animals' }),
        createCategory({ id: 2, name: 'Plants' }),
        createCategory({ id: 3, name: 'Cities' }),
      ]

      const result = manager.getCategoryById(categories, 2)

      expect(result).not.toBeNull()
      expect(result!.id).toBe(2)
      expect(result!.name).toBe('Plants')
    })

    it('returns null when ID is not found', () => {
      const categories = [createCategory({ id: 1 }), createCategory({ id: 2 })]

      const result = manager.getCategoryById(categories, 99)

      expect(result).toBeNull()
    })

    it('returns null for empty categories array', () => {
      const result = manager.getCategoryById([], 1)

      expect(result).toBeNull()
    })
  })

  // ──────────────────────────────────────────
  // getRandomCategory
  // ──────────────────────────────────────────
  describe('getRandomCategory', () => {
    it('returns a Category from the array', () => {
      const categories = [
        createCategory({ id: 1, name: 'Animals' }),
        createCategory({ id: 2, name: 'Plants' }),
        createCategory({ id: 3, name: 'Cities' }),
      ]

      const result = manager.getRandomCategory(categories)

      expect(result).not.toBeNull()
      expect(categories.some((c) => c.id === result!.id)).toBe(true)
    })

    it('returns null for empty categories array', () => {
      const result = manager.getRandomCategory([])

      expect(result).toBeNull()
    })

    it('returns the only category when array has one element', () => {
      const categories = [createCategory({ id: 42, name: 'Solo' })]

      const result = manager.getRandomCategory(categories)

      expect(result).not.toBeNull()
      expect(result!.id).toBe(42)
    })
  })

  // ──────────────────────────────────────────
  // getCategoryEmoji
  // ──────────────────────────────────────────
  describe('getCategoryEmoji', () => {
    it('returns emoji string from useCategoryEmoji', () => {
      const result = manager.getCategoryEmoji('Tier')

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      expect(result).toBe('🐾')
    })

    it('returns default emoji when name is null', () => {
      const result = manager.getCategoryEmoji(null)

      expect(result).toBe('🎯')
    })

    it('returns default emoji when name is undefined', () => {
      const result = manager.getCategoryEmoji(undefined)

      expect(result).toBe('🎯')
    })

    it('returns default emoji for unknown category names', () => {
      const result = manager.getCategoryEmoji('UnknownCategory')

      expect(result).toBe('🎯')
    })
  })
})
