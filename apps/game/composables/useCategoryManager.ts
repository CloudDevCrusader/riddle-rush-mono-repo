/**
 * Category management composable
 *
 * Extracts category-related logic from the game store into focused utility functions.
 * These functions are **stateless** — they accept data as parameters and return results.
 * The game store delegates to these functions while still owning all reactive state.
 */

import { useLogger } from './useLogger'
import { useCategoryEmoji } from './useCategoryEmoji'
import { useLodashSync } from './useLodash'
import type { Category } from '@riddle-rush/types/game'

/**
 * Composable providing category management utilities.
 *
 * @example
 * ```ts
 * const categoryManager = useCategoryManager()
 * const category = categoryManager.getCategoryById(categories, 42)
 * const random = categoryManager.getRandomCategory(categories)
 * ```
 */
export function useCategoryManager() {
  /**
   * Fetch categories from the data file.
   * Handles caching, loading guard (race condition prevention), and error recovery.
   *
   * @param state - Mutable state object with category-related properties
   * @param state.categories - Array of loaded categories
   * @param state.categoriesLoaded - Whether categories have been loaded
   * @param state.categoriesLoading - Whether categories are currently loading
   * @param state.categoryLoadError - Error message from last load attempt
   * @param force - Whether to bypass cache and force re-fetch
   * @returns The fetched (or cached) categories array
   * @throws Error if no categories found and none cached
   */
  async function fetchCategories(
    state: {
      categories: Category[]
      categoriesLoaded: boolean
      categoriesLoading: boolean
      categoryLoadError: string | null
    },
    force = false
  ): Promise<Category[]> {
    // Return cached categories if already loaded
    if (state.categoriesLoaded && !force) {
      return state.categories
    }

    // Wait if already loading (race condition guard)
    if (state.categoriesLoading) {
      const maxAttempts = 100
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        if (!state.categoriesLoading) {
          return state.categories
        }
      }
      throw new Error('Category loading timeout')
    }

    state.categoriesLoading = true

    try {
      const categories = await $fetch<Category[]>('/data/categories.json')

      if (!categories || categories.length === 0) {
        throw new Error('No categories found in data file')
      }

      state.categories = categories
      state.categoriesLoaded = true
      state.categoryLoadError = null

      return categories
    } catch (error) {
      const logger = useLogger()
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories'
      state.categoryLoadError = errorMessage
      logger.error('Error fetching categories:', error)

      // Don't throw if we have cached categories
      if (state.categories.length > 0) {
        logger.warn('Using cached categories due to fetch error')
        return state.categories
      }

      throw new Error(errorMessage)
    } finally {
      state.categoriesLoading = false
    }
  }

  /**
   * Increase the number of displayed categories by a step amount.
   *
   * @param state - Mutable state with displayedCategoryCount and categories
   * @param state.displayedCategoryCount - Current number of displayed categories
   * @param state.categories - Array of all categories
   * @param step - Number of additional categories to display (default: 9)
   */
  function loadMoreCategories(
    state: { displayedCategoryCount: number; categories: Category[] },
    step = 9
  ): void {
    if (state.displayedCategoryCount >= state.categories.length) return

    state.displayedCategoryCount = Math.min(
      state.displayedCategoryCount + step,
      state.categories.length
    )
  }

  /**
   * Reset the displayed category count to a given value.
   *
   * @param state - Mutable state with displayedCategoryCount and categories
   * @param state.displayedCategoryCount - Current number of displayed categories
   * @param state.categories - Array of all categories
   * @param count - Target count to reset to (default: 9)
   */
  function resetDisplayedCategories(
    state: { displayedCategoryCount: number; categories: Category[] },
    count = 9
  ): void {
    state.displayedCategoryCount = Math.min(count, state.categories.length || count)
  }

  /**
   * Find a category by its numeric ID.
   *
   * @param categories - Array of categories to search
   * @param categoryId - The ID to find
   * @returns The matching category, or null if not found
   */
  function getCategoryById(categories: Category[], categoryId: number): Category | null {
    return categories.find((category: Category) => category.id === categoryId) ?? null
  }

  /**
   * Select a random category from the provided list.
   * Uses a lightweight Fisher-Yates shuffle for randomization.
   *
   * @param categories - Array of categories to pick from
   * @returns A randomly selected category, or null if the array is empty
   */
  function getRandomCategory(categories: Category[]): Category | null {
    if (!categories.length) return null

    const { shuffle } = useLodashSync()
    const shuffled = shuffle(categories)
    return shuffled[0] ?? null
  }

  /**
   * Resolve an emoji for a category name.
   * Delegates to useCategoryEmoji composable.
   *
   * @param name - Category name to resolve emoji for
   * @returns The matching emoji, or the default 🎯
   */
  function getCategoryEmoji(name?: string | null): string {
    const { resolve } = useCategoryEmoji()
    return resolve(name)
  }

  return {
    fetchCategories,
    loadMoreCategories,
    resetDisplayedCategories,
    getCategoryById,
    getRandomCategory,
    getCategoryEmoji,
  }
}
