import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { Category } from '@riddle-rush/types/game'
import { createCategory, createCategoryList } from '../../utils/factories'

// Module-level cache state for useAnswerCheck — reset between tests
// The composable uses module-level cache variables, so we must re-import each test

// Mock $fetch globally (used by getCategories and searchOffline)
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock as unknown as typeof $fetch)

// Mock global fetch (used by searchPetScan)
const globalFetchMock = vi.fn()
vi.stubGlobal('fetch', globalFetchMock)

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

describe('useAnswerCheck', () => {
  let useAnswerCheck: typeof import('../../../composables/useAnswerCheck').useAnswerCheck

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Dynamic import to get fresh module with reset cache
    // We invalidate the module cache to reset the module-level categoriesCache
    vi.resetModules()
    const mod = await import('../../../composables/useAnswerCheck')
    useAnswerCheck = mod.useAnswerCheck
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('checkAnswer - PetScan provider', () => {
    const petscanCategory: Category = createCategory({
      id: 1,
      name: 'Animals',
      searchWord: 'Tier',
      key: 'animals',
      searchProvider: 'petscan',
    })

    beforeEach(() => {
      // $fetch returns category list
      fetchMock.mockResolvedValue([petscanCategory])
    })

    it('should return found=true when PetScan response contains the term', async () => {
      const petscanResponse = {
        '*': [
          {
            a: {
              '*': [{ title: 'Tiger' }, { title: 'Taube' }, { title: 'Truthahn' }],
            },
          },
        ],
      }

      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(petscanResponse),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Tier', 'T', 'Tiger')

      expect(result.found).toBe(true)
      expect(result.other).toEqual(expect.arrayContaining(['Taube']))
    })

    it('should return found=false when term is not in PetScan results', async () => {
      const petscanResponse = {
        '*': [
          {
            a: {
              '*': [{ title: 'Tiger' }, { title: 'Taube' }],
            },
          },
        ],
      }

      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(petscanResponse),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Tier', 'T', 'Zebra')

      expect(result.found).toBe(false)
    })

    it('should handle empty PetScan results gracefully', async () => {
      const petscanResponse = {
        '*': [
          {
            a: {
              '*': [],
            },
          },
        ],
      }

      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(petscanResponse),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Tier', 'T', 'Tiger')

      expect(result.found).toBe(false)
      expect(result.other).toEqual([])
    })

    it('should handle missing PetScan result fields gracefully', async () => {
      const petscanResponse = { '*': [] }

      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(petscanResponse),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Tier', 'T', 'Tiger')

      expect(result.found).toBe(false)
      expect(result.other).toEqual([])
    })

    it('should handle PetScan API HTTP error by returning empty results', async () => {
      globalFetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Tier', 'T', 'Tiger')

      expect(result.found).toBe(false)
      expect(result.other).toEqual([])
    })

    it('should handle PetScan network error by returning empty results', async () => {
      globalFetchMock.mockRejectedValue(new Error('Network error'))

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Tier', 'T', 'Tiger')

      expect(result.found).toBe(false)
      expect(result.other).toEqual([])
    })

    it('should filter results by letter (case-insensitive)', async () => {
      const petscanResponse = {
        '*': [
          {
            a: {
              '*': [{ title: 'Tiger' }, { title: 'Adler' }, { title: 'Taube' }],
            },
          },
        ],
      }

      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(petscanResponse),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Tier', 'T', 'Tiger')

      // Only T-words should be in results; Adler should be filtered out
      expect(result.found).toBe(true)
      expect(result.other).not.toContain('Adler')
    })

    it('should parse title by splitting on underscore', async () => {
      const petscanResponse = {
        '*': [
          {
            a: {
              '*': [{ title: 'Tiger_Bengal' }, { title: 'Taube_Wild' }],
            },
          },
        ],
      }

      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(petscanResponse),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Tier', 'T', 'Tiger')

      expect(result.found).toBe(true)
    })

    it('should exclude the category searchWord from results', async () => {
      const petscanResponse = {
        '*': [
          {
            a: {
              '*': [{ title: 'Tier' }, { title: 'Tiger' }],
            },
          },
        ],
      }

      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(petscanResponse),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Tier', 'T', 'Tiger')

      expect(result.found).toBe(true)
      // 'Tier' (the category searchWord) is excluded from the list
      expect(result.other).not.toContain('Tier')
    })
  })

  describe('checkAnswer - Offline provider', () => {
    const offlineCategory: Category = createCategory({
      id: 2,
      name: 'Cities',
      searchWord: 'Stadt',
      key: 'cities',
      searchProvider: 'offline',
    })

    it('should load offline data and find matching term', async () => {
      // First call returns categories, second returns offline data
      fetchMock.mockResolvedValueOnce([offlineCategory]).mockResolvedValueOnce({
        Stadt: {
          b: ['Berlin', 'Bremen', 'Bonn'],
          m: ['Muenchen', 'Mannheim'],
        },
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Stadt', 'B', 'Berlin')

      expect(result.found).toBe(true)
      expect(result.other).toContain('Bremen')
    })

    it('should return found=false when term not in offline data', async () => {
      fetchMock.mockResolvedValueOnce([offlineCategory]).mockResolvedValueOnce({
        Stadt: {
          b: ['Berlin', 'Bremen'],
        },
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Stadt', 'B', 'Budapest')

      expect(result.found).toBe(false)
    })

    it('should handle missing category in offline data', async () => {
      fetchMock.mockResolvedValueOnce([offlineCategory]).mockResolvedValueOnce({
        Beruf: { a: ['Arzt'] },
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Stadt', 'B', 'Berlin')

      expect(result.found).toBe(false)
      expect(result.other).toEqual([])
    })

    it('should handle missing letter key in offline data', async () => {
      fetchMock.mockResolvedValueOnce([offlineCategory]).mockResolvedValueOnce({
        Stadt: {
          b: ['Berlin'],
        },
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Stadt', 'Z', 'Zurich')

      expect(result.found).toBe(false)
      expect(result.other).toEqual([])
    })

    it('should handle offline data fetch error gracefully', async () => {
      fetchMock
        .mockResolvedValueOnce([offlineCategory])
        .mockRejectedValueOnce(new Error('Offline data unavailable'))

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Stadt', 'B', 'Berlin')

      expect(result.found).toBe(false)
      expect(result.other).toEqual([])
    })

    it('should normalize letter to lowercase for offline lookup', async () => {
      fetchMock.mockResolvedValueOnce([offlineCategory]).mockResolvedValueOnce({
        Stadt: {
          b: ['Berlin', 'Bremen'],
        },
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('Stadt', 'B', 'Berlin')

      // Offline lookup uses letter.toLowerCase() so 'B' => 'b'
      expect(result.found).toBe(true)
    })
  })

  describe('checkAnswer - Category lookup', () => {
    it('should throw error for unknown searchWord', async () => {
      fetchMock.mockResolvedValue([
        createCategory({ searchWord: 'known_category', searchProvider: 'offline' }),
      ])

      const { checkAnswer } = useAnswerCheck()

      await expect(checkAnswer('unknown_category', 'A', 'Apple')).rejects.toThrow(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        'Category not found: unknown_category'
      )
    })
=======
=======
>>>>>>> Stashed changes
        'Category not found: unknown_category',
      );
    });
>>>>>>> Stashed changes

    it('should throw error for unsupported search provider', async () => {
      fetchMock.mockResolvedValue([
        createCategory({ searchWord: 'wiki_cat', searchProvider: 'wikipedia' }),
      ])

      const { checkAnswer } = useAnswerCheck()

      await expect(checkAnswer('wiki_cat', 'A', 'Apple')).rejects.toThrow(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        'Wikipedia search provider not yet implemented'
      )
    })
  })
=======
=======
>>>>>>> Stashed changes
        'Wikipedia search provider not yet implemented',
      );
    });
  });
>>>>>>> Stashed changes

  describe('Category caching (getCategories)', () => {
    const categories = createCategoryList(3, [
      { searchWord: 'cat1', searchProvider: 'offline' },
      { searchWord: 'cat2', searchProvider: 'offline' },
      { searchWord: 'cat3', searchProvider: 'offline' },
    ])

    it('should fetch categories on first call', async () => {
      fetchMock
        .mockResolvedValueOnce(categories) // getCategories
        .mockResolvedValueOnce({ cat1: { a: ['Apple'] } }) // searchOffline

      const { checkAnswer } = useAnswerCheck()
      await checkAnswer('cat1', 'A', 'Apple')

      // First call should be for categories
      expect(fetchMock).toHaveBeenCalledWith('/data/categories.json')
    })

    it('should cache categories and not re-fetch within 5 minutes', async () => {
      fetchMock
        .mockResolvedValueOnce(categories) // first getCategories
        .mockResolvedValueOnce({ cat1: { a: ['Apple'] } }) // first searchOffline
        .mockResolvedValueOnce({ cat1: { a: ['Apple'] } }) // second searchOffline (no getCategories refetch)

      const { checkAnswer } = useAnswerCheck()

      await checkAnswer('cat1', 'A', 'Apple')
      // Second call within 5 minutes should use cache
      await checkAnswer('cat1', 'A', 'Avocado')

      // $fetch should be called 3 times: 1 categories + 2 offline data
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('should re-fetch categories after cache expires (5 minutes)', async () => {
      fetchMock
        .mockResolvedValueOnce(categories) // first getCategories
        .mockResolvedValueOnce({ cat1: { a: ['Apple'] } }) // first searchOffline
        .mockResolvedValueOnce(categories) // second getCategories (after cache expiry)
        .mockResolvedValueOnce({ cat1: { a: ['Apple'] } }) // second searchOffline

      const { checkAnswer } = useAnswerCheck()

      await checkAnswer('cat1', 'A', 'Apple')

      // Advance time past 5-minute cache
      vi.advanceTimersByTime(5 * 60 * 1000 + 1)

      await checkAnswer('cat1', 'A', 'Avocado')

      // Categories should be fetched twice (cache expired)
      const categoryCalls = fetchMock.mock.calls.filter(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        (call) => call[0] === '/data/categories.json'
      )
      expect(categoryCalls).toHaveLength(2)
    })
  })
=======
=======
>>>>>>> Stashed changes
        call => call[0] === '/data/categories.json',
      );
      expect(categoryCalls).toHaveLength(2);
    });
  });
>>>>>>> Stashed changes

  describe('generateResult - additionalData merging', () => {
    it('should merge additionalData with PetScan results', async () => {
      const categoryWithAdditional: Category = createCategory({
        id: 10,
        name: 'Cities with extra',
        searchWord: 'StadtExtra',
        key: 'cities_extra',
        searchProvider: 'petscan',
        additionalData: { extra1: 'Tokio', extra2: 'Toronto' },
      })

      fetchMock.mockResolvedValue([categoryWithAdditional])

      const petscanResponse = {
        '*': [
          {
            a: {
              '*': [{ title: 'Taipei' }],
            },
          },
        ],
      }

      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(petscanResponse),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('StadtExtra', 'T', 'Tokio')

      // Tokio comes from additionalData and starts with T
      expect(result.found).toBe(true)
    })

    it('should handle additionalData as array', async () => {
      const categoryWithArrayData: Category = createCategory({
        id: 11,
        name: 'Animals extra',
        searchWord: 'TierExtra',
        key: 'animals_extra',
        searchProvider: 'petscan',
        additionalData: ['Tukan', 'Tapir'] as unknown as Record<string, unknown>,
      })

      fetchMock.mockResolvedValue([categoryWithArrayData])

      const petscanResponse = {
        '*': [{ a: { '*': [] } }],
      }

      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(petscanResponse),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('TierExtra', 'T', 'Tukan')

      expect(result.found).toBe(true)
    })

    it('should limit suggestions to MAX_SUGGESTIONS', async () => {
      const categoryWithMany: Category = createCategory({
        id: 12,
        name: 'Many results',
        searchWord: 'ManyResults',
        key: 'many',
        searchProvider: 'petscan',
      })

      fetchMock.mockResolvedValue([categoryWithMany])

      const petscanResponse = {
        '*': [
          {
            a: {
              '*': [
                { title: 'Alpha' },
                { title: 'Ape' },
                { title: 'Ant' },
                { title: 'Antelope' },
                { title: 'Albatross' },
                { title: 'Alligator' },
                { title: 'Anaconda' },
              ],
            },
          },
        ],
      }

      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(petscanResponse),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('ManyResults', 'A', 'Alpha')

      // MAX_SUGGESTIONS is 4 — other should have at most 4 entries
      expect(result.other.length).toBeLessThanOrEqual(4)
    })
  })

  describe('Edge cases', () => {
    it('should handle completely empty API response', async () => {
      const cat: Category = createCategory({
        searchWord: 'EmptyCat',
        searchProvider: 'petscan',
      })

      fetchMock.mockResolvedValue([cat])
      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('EmptyCat', 'A', 'Apple')

      expect(result.found).toBe(false)
      expect(result.other).toEqual([])
    })

    it('should handle null response from PetScan API', async () => {
      const cat: Category = createCategory({
        searchWord: 'NullCat',
        searchProvider: 'petscan',
      })

      fetchMock.mockResolvedValue([cat])
      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('NullCat', 'A', 'Apple')

      expect(result.found).toBe(false)
      expect(result.other).toEqual([])
    })

    it('should handle category with no additionalData', async () => {
      const cat: Category = createCategory({
        searchWord: 'NoAdditional',
        searchProvider: 'petscan',
        additionalData: undefined,
      })
      // Remove additionalData explicitly using Partial cast (additionalData is optional)
      const mutableCat: Partial<Category> & Omit<Category, 'additionalData'> = cat
      delete mutableCat.additionalData

      fetchMock.mockResolvedValue([cat])
      globalFetchMock.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            '*': [{ a: { '*': [{ title: 'Apple' }] } }],
          }),
      })

      const { checkAnswer } = useAnswerCheck()
      const result = await checkAnswer('NoAdditional', 'A', 'Apple')

      expect(result.found).toBe(true)
    })
  })
})
