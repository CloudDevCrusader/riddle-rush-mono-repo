import { computed, ref, onScopeDispose } from '#imports'
import { loadingStore } from '../loadingStore'
import { gameStore } from '../gameStore'

export function useLoading() {
  const version = ref(0)
  const unsubscribe = loadingStore.subscribe(() => {
    version.value++
  })
  onScopeDispose(() => unsubscribe())

  return {
    // State
    isLoading: computed(() => {
      void version.value
      return loadingStore.getState().isLoading
    }),
    progress: computed(() => {
      void version.value
      return loadingStore.getState().progress
    }),
    showProgress: computed(() => {
      void version.value
      return loadingStore.getState().showProgress
    }),

    // Actions
    showLoading: loadingStore.getState().showLoading,
    hideLoading: loadingStore.getState().hideLoading,
    setProgress: loadingStore.getState().setProgress,

    // Convenience: setOnlineStatus from gameStore
    setOnlineStatus: gameStore.getState().setOnlineStatus,
  }
}
