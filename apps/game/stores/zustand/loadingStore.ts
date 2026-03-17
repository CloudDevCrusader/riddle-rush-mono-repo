import { create } from 'zustand'

export const useLoadingStore = create<{
  isLoading: boolean
  loadingCount: number
  progress: number
  showProgress: boolean

  showLoading: () => void
  hideLoading: () => void
  setProgress: (value: number) => void
}>()((set) => ({
  // State
  isLoading: false,
  loadingCount: 0,
  progress: 0,
  showProgress: false,

  // Actions
  showLoading: () => {
    set((state) => ({
      loadingCount: state.loadingCount + 1,
      isLoading: true,
      progress: 0,
      showProgress: false,
    }))
  },

  hideLoading: () => {
    set((state) => {
      const newCount = state.loadingCount - 1
      return {
        loadingCount: newCount <= 0 ? 0 : newCount,
        isLoading: newCount <= 0 ? false : state.isLoading,
        progress: newCount <= 0 ? 0 : state.progress,
        showProgress: newCount <= 0 ? false : state.showProgress,
      }
    })
  },

  setProgress: (value: number) => {
    set({
      progress: Math.min(100, Math.max(0, value)),
      showProgress: true,
    })
  },
}))

/**
 * Composable wrapper for backward compatibility
 */
export function useLoading() {
  const store = useLoadingStore()
  return {
    isLoading: store.isLoading,
    progress: store.progress,
    showProgress: store.showProgress,
    showLoading: store.showLoading,
    hideLoading: store.hideLoading,
    setProgress: store.setProgress,
  }
}
