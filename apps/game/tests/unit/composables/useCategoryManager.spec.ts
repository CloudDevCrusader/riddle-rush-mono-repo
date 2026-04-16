import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Category } from '@riddle-rush/types/game'

import { useCategoryManager } from '../../../composables/useCategoryManager'

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

// Mock $fetch (Nuxt auto-import)
const mock$fetch = vi.fn()
vi.stubGlobal('$fetch', mock$fetch)

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

  // ──────────────────────────────────────────
  // fetchCategories
  // ──────────────────────────────────────────
  describe('fetchCategories', () => {
    function createFetchState(overrides: Partial<{
      categories: Category[]
      categoriesLoaded: boolean
      categoriesLoading: boolean
      categoryLoadError: string | null
    }> = {}) {
      return {
        categories: [] as Category[],
        categoriesLoaded: false,
        categoriesLoading: false,
        categoryLoadError: null,
        ...overrides,
      }
    }

    beforeEach(() => {
      mock$fetch.mockReset()
    })

    it('returns cached categories when already loaded and force is false', async () => {
      const cached = [createCategory({ id: 1 }), createCategory({ id: 2 })]
      const state = createFetchState({ categories: cached, categoriesLoaded: true })

      const result = await manager.fetchCategories(state)

      expect(result).toBe(cached)
      expect(mock$fetch).not.toHaveBeenCalled()
    })

    it('bypasses cache when force is true', async () => {
      const cached = [createCategory({ id: 1 })]
      const fresh = [createCategory({ id: 10 }), createCategory({ id: 20 })]
      mock$fetch.mockResolvedValue(fresh)

      const state = createFetchState({ categories: cached, categoriesLoaded: true })
      const result = await manager.fetchCategories(state, true)

      expect(mock$fetch).toHaveBeenCalledWith('/data/categories.json')
      expect(result).toBe(fresh)
      expect(state.categories).toBe(fresh)
    })

    it('fetches and stores categories on first load', async () => {
      const fetched = [createCategory({ id: 1 }), createCategory({ id: 2 })]
      mock$fetch.mockResolvedValue(fetched)

      const state = createFetchState()
      const result = await manager.fetchCategories(state)

      expect(state.categories).toBe(fetched)
      expect(state.categoriesLoaded).toBe(true)
      expect(state.categoryLoadError).toBeNull()
      expect(state.categoriesLoading).toBe(false)
      expect(result).toEqual(fetched)
    })

    it('throws when fetched categories array is empty', async () => {
      mock$fetch.mockResolvedValue([])

      const state = createFetchState()

      await expect(manager.fetchCategories(state)).rejects.toThrow('No categories found in data file')
      expect(state.categoriesLoading).toBe(false)
    })

    it('throws when fetched categories is null', async () => {
      mock$fetch.mockResolvedValue(null)

      const state = createFetchState()

      await expect(manager.fetchCategories(state)).rejects.toThrow('No categories found in data file')
    })

    it('returns cached categories on fetch error when cache exists', async () => {
      const cached = [createCategory({ id: 99 })]
      mock$fetch.mockRejectedValue(new Error('Network error'))

      const state = createFetchState({ categories: cached })
      const result = await manager.fetchCategories(state)

      expect(result).toBe(cached)
      expect(state.categoryLoadError).toBe('Network error')
      expect(state.categoriesLoading).toBe(false)
    })

    it('re-throws on fetch error when no cached categories exist', async () => {
      mock$fetch.mockRejectedValue(new Error('Network error'))

      const state = createFetchState()

      await expect(manager.fetchCategories(state)).rejects.toThrow('Network error')
      expect(state.categoryLoadError).toBe('Network error')
      expect(state.categoriesLoading).toBe(false)
    })

    it('uses generic message for non-Error thrown values', async () => {
      mock$fetch.mockRejectedValue('string failure')

      const state = createFetchState()

      await expect(manager.fetchCategories(state)).rejects.toThrow('Failed to load categories')
      expect(state.categoryLoadError).toBe('Failed to load categories')
    })

    it('waits for concurrent loading to finish and returns result', async () => {
      const loaded = [createCategory({ id: 5 })]

      // Simulate another caller already loading — will "finish" after 200ms
      const state = createFetchState({ categoriesLoading: true })

      // After a short delay, simulate the other loader completing
      setTimeout(() => {
        state.categoriesLoading = false
        state.categories = loaded
      }, 150)

      const result = await manager.fetchCategories(state)

      expect(result).toBe(loaded)
      // $fetch should NOT have been called — we piggy-backed on the other loader
      expect(mock$fetch).not.toHaveBeenCalled()
    })

    it('throws timeout when concurrent loading never finishes', async () => {
      // categoriesLoading stays true forever → 100 attempts × 100ms → timeout
      const state = createFetchState({ categoriesLoading: true })

      await expect(manager.fetchCategories(state)).rejects.toThrow('Category loading timeout')
    }, 15_000)

    it('resets categoriesLoading in finally block on success', async () => {
      mock$fetch.mockResolvedValue([createCategory({ id: 1 })])

      const state = createFetchState()
      await manager.fetchCategories(state)

      expect(state.categoriesLoading).toBe(false)
    })

    it('resets categoriesLoading in finally block on error', async () => {
      mock$fetch.mockRejectedValue(new Error('fail'))

      const state = createFetchState()
      await manager.fetchCategories(state).catch(() => {})

      expect(state.categoriesLoading).toBe(false)
    })
  })
})
