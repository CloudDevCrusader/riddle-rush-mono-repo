import { useGameStore } from '~/stores/gameStore'
import { useSettingsStore } from '~/stores/settingsStore'
import { useLoadingStore } from '~/stores/loadingStore'

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const game = useGameStore()
    const settings = useSettingsStore()
    const loading = useLoadingStore()

    // Expose stores for E2E testing
    ;(window as any).__pinia_stores__ = {
      game,
      settings,
      loading,
    }
  }
})
