import { computed } from '#imports'
import { useLoadingStore as loadingStore } from '../loadingStore'
import { useGameStore } from '~/stores/gameStore'

export function useLoading() {
  const store = loadingStore()
  const game = useGameStore()

  return {
    // State
    isLoading: computed(() => store.isLoading),
    progress: computed(() => store.progress),
    showProgress: computed(() => store.showProgress),

    // Actions
    showLoading: store.showLoading,
    hideLoading: store.hideLoading,
    setProgress: store.setProgress,

    // Convenience: setOnlineStatus from gameStore
    setOnlineStatus: game.setOnlineStatus,
  }
}
