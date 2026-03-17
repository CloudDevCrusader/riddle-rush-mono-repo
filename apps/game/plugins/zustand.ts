import { defineNuxtPlugin } from '#app'
import { useGameStore as useZustandGameStore } from '~/stores/zustand/gameStore'
import { useSettingsStore as useZustandSettingsStore } from '~/stores/zustand/settingsStore'
import { useLoadingStore as useZustandLoadingStore } from '~/stores/zustand/loadingStore'

export default defineNuxtPlugin((nuxtApp) => {
  // Initialize stores when plugin is installed
  // This ensures stores are available globally

  // Pre-load settings on client side
  if (import.meta.client) {
    const settingsStore = useZustandSettingsStore.getState()
    settingsStore.loadSettings()
  }

  // Provide stores to the app
  nuxtApp.provide('zustand', {
    game: useZustandGameStore,
    settings: useZustandSettingsStore,
    loading: useZustandLoadingStore,
  })
})
