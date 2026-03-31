import { computed } from '#imports'
import { useGameStore } from '~/stores/gameStore'

export function useCategories() {
  const store = useGameStore()

  return {
    // State
    categories: computed(() => store.categories),
    categoriesLoaded: computed(() => store.categoriesLoaded),
    categoriesLoading: computed(() => store.categoriesLoading),
    displayedCategoryCount: computed(() => store.displayedCategoryCount),
    categoryLoadError: computed(() => store.categoryLoadError),

    // Getters
    displayedCategories: computed(() => store.displayedCategories),
    hasMoreCategories: computed(() => store.hasMoreCategories),

    // Actions
    fetchCategories: store.fetchCategories,
    loadMoreCategories: store.loadMoreCategories,
    resetDisplayedCategories: store.resetDisplayedCategories,
    getCategoryById: store.getCategoryById,
    getRandomCategory: store.getRandomCategory,
    categoryEmoji: store.categoryEmoji,
  }
}
