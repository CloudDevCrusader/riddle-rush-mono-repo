import { computed, ref, onScopeDispose } from '#imports'
import { gameStore } from '~/stores/gameStore'

export function useCategories() {
  const version = ref(0)
  const unsubscribe = gameStore.subscribe(() => {
    version.value++
  })
  onScopeDispose(() => unsubscribe())

  return {
    // State
    categories: computed(() => {
      void version.value
      return gameStore.getState().categories
    }),
    categoriesLoaded: computed(() => {
      void version.value
      return gameStore.getState().categoriesLoaded
    }),
    categoriesLoading: computed(() => {
      void version.value
      return gameStore.getState().categoriesLoading
    }),
    displayedCategoryCount: computed(() => {
      void version.value
      return gameStore.getState().displayedCategoryCount
    }),
    categoryLoadError: computed(() => {
      void version.value
      return gameStore.getState().categoryLoadError
    }),

    // Getters
    displayedCategories: computed(() => {
      void version.value
      const state = gameStore.getState()
      return state.categories.slice(0, state.displayedCategoryCount)
    }),
    hasMoreCategories: computed(() => {
      void version.value
      const state = gameStore.getState()
      return state.displayedCategoryCount < state.categories.length
    }),

    // Actions
    fetchCategories: gameStore.getState().fetchCategories,
    loadMoreCategories: gameStore.getState().loadMoreCategories,
    resetDisplayedCategories: gameStore.getState().resetDisplayedCategories,
    getCategoryById: gameStore.getState().getCategoryById,
    getRandomCategory: gameStore.getState().getRandomCategory,
    categoryEmoji: gameStore.getState().categoryEmoji,
  }
}
