import { defineStore } from 'pinia'

/**
 * Loading state store
 * Provides global loading state management with progress tracking
 * Uses Pinia to ensure all instances share the same state
 */
export const useLoadingStore = defineStore('loading', {
  state: () => ({
    isLoading: false,
    loadingCount: 0,
    progress: 0,
    showProgress: false,
  }),

  actions: {
    showLoading() {
      this.loadingCount++
      this.isLoading = true
      this.progress = 0
      this.showProgress = false
    },

    hideLoading() {
      this.loadingCount--
      if (this.loadingCount <= 0) {
        this.loadingCount = 0
        this.isLoading = false
        this.progress = 0
        this.showProgress = false
      }
    },

    setProgress(value: number) {
      this.progress = Math.min(100, Math.max(0, value))
      this.showProgress = true
    },
  },
})

/**
 * Composable wrapper for backward compatibility
 */
export function useLoading() {
  const store = useLoadingStore()
  return {
    isLoading: computed(() => store.isLoading),
    progress: computed(() => store.progress),
    showProgress: computed(() => store.showProgress),
    showLoading: () => store.showLoading(),
    hideLoading: () => store.hideLoading(),
    setProgress: (value: number) => store.setProgress(value),
  }
}
