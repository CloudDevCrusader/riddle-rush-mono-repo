import { computed } from '#imports'
import { useGameStore } from '~/stores/gameStore'

export function useInstallPrompt() {
  const store = useGameStore()

  return {
    // State
    installPromptEvent: computed(() => store.installPromptEvent),

    // Getters
    canInstall: computed(() => store.canInstall),

    // Actions
    setInstallPrompt: store.setInstallPrompt,
    showInstallPrompt: store.showInstallPrompt,
  }
}
