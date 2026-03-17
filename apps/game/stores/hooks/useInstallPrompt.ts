import { computed, ref, onScopeDispose } from '#imports'
import { gameStore } from '../gameStore'

export function useInstallPrompt() {
  const version = ref(0)
  const unsubscribe = gameStore.subscribe(() => {
    version.value++
  })
  onScopeDispose(() => unsubscribe())

  return {
    // State
    installPromptEvent: computed(() => {
      void version.value
      return gameStore.getState().installPromptEvent
    }),

    // Getters
    canInstall: computed(() => {
      void version.value
      return gameStore.getState().canInstall
    }),

    // Actions
    setInstallPrompt: gameStore.getState().setInstallPrompt,
    showInstallPrompt: gameStore.getState().showInstallPrompt,
  }
}
