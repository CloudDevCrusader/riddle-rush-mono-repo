import type { Category, CheckAnswerResponse } from '@riddle-rush/types/game'
import { useLogger } from './useLogger'
import {
  PETSCAN_MAX_SITELINK_COUNT,
  PETSCAN_MAX_RESULTS,
  PETSCAN_LANGUAGE,
  PETSCAN_PROJECT,
  MAX_SUGGESTIONS,
} from '@riddle-rush/shared/constants'

interface PetScanResult {
  found: boolean
  other: string[]
}

// Cache categories to avoid repeated fetches
let categoriesCache: Category[] | null = null
let categoriesCacheTime = 0
const CATEGORIES_CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

export function useAnswerCheck() {
  const logger = useLogger()

  async function searchPetScan(category: string): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        'max_sitelink_count': PETSCAN_MAX_SITELINK_COUNT,
        'categories': category,
        'project': PETSCAN_PROJECT,
        'language': PETSCAN_LANGUAGE,
        'cb_labels_yes_l': '1',
        'edits[flagged]': 'both',
        'edits[bots]': 'both',
        'search_max_results': PETSCAN_MAX_RESULTS,
        'cb_labels_any_l': '1',
        'cb_labels_no_l': '1',
        'format': 'json',
        'interface_language': PETSCAN_LANGUAGE,
        'edits[anons]': 'both',
        'ns[0]': '1',
        'doit': '',
      })

      const url = `https://petscan.wmflabs.org/?${params.toString()}`

      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`PetScan API error: ${res.status} ${res.statusText}`)
      }
      const data = (await res.json()) as {
        '*'?: Array<{ a?: { '*'?: Array<{ title: string }> } }>
      }
      const results = data?.['*']?.[0]?.['a']?.['*']

      if (!results) {
        return []
      }

      return results
        .map((e: { title: string }) => e.title.split('_')[0])
        .filter((e): e is string => !!e && e !== category)
    }
    catch (error) {
      logger.error('Error fetching from PetScan:', error)
      return []
    }
  }

  type OfflineAnswers = Record<string, Record<string, string[]>>

  async function searchOffline(category: string, letter: string): Promise<string[]> {
    try {
      const offlineAnswers = await $fetch<OfflineAnswers>('/data/offlineAnswers.json')
      const categoryAnswers = offlineAnswers[category]

      if (!categoryAnswers) {
        logger.warn(`No offline data for category: ${category}`)
        return []
      }

      return categoryAnswers[letter.toLowerCase()] || []
    }
    catch (error) {
      logger.error('Error loading offline answers:', error)
      return []
    }
  }

  function generateResult(
    list: string[],
    letter: string,
    term: string,
    categoryItem: Category,
  ): PetScanResult {
    let items = list

    if (categoryItem.additionalData) {
      // Convert additionalData values to array if it's an object
      const additionalItems = Array.isArray(categoryItem.additionalData)
        ? categoryItem.additionalData
        : Object.values(categoryItem.additionalData).filter(
            (v): v is string => typeof v === 'string',
          )
      items = [...items, ...additionalItems]
    }

    const results = items.filter(e => e.toUpperCase().startsWith(letter.toUpperCase()))

    const found = results.includes(term)
    const other = results.filter(res => res !== term).slice(0, MAX_SUGGESTIONS)

    return { found, other }
  }

  async function getCategories(): Promise<Category[]> {
    const now = Date.now()
    // Return cached categories if still valid
    if (categoriesCache && now - categoriesCacheTime < CATEGORIES_CACHE_DURATION_MS) {
      return categoriesCache
    }

    // Fetch and cache
    const categories = await $fetch<Category[]>('/data/categories.json')
    categoriesCache = categories
    categoriesCacheTime = now
    return categories
  }

  async function checkAnswer(
    searchWord: string,
    letter: string,
    term: string,
  ): Promise<CheckAnswerResponse> {
    const categories = await getCategories()
    const currentCategory = categories.find(e => e.searchWord === searchWord)

    if (!currentCategory) {
      throw new Error(`Category not found: ${searchWord}`)
    }

    let result: string[]
    switch (currentCategory.searchProvider) {
      case 'petscan':
        result = await searchPetScan(currentCategory.searchWord)
        return generateResult(result, letter, term, currentCategory)
      case 'offline':
        result = await searchOffline(currentCategory.searchWord, letter)
        return generateResult(result, letter, term, currentCategory)
      case 'wikipedia':
        throw new Error('Wikipedia search provider not yet implemented')
      default:
        throw new Error(`Unknown search provider: ${currentCategory.searchProvider}`)
    }
  }

  return {
    checkAnswer,
  }
}
