import { defineNuxtPlugin } from '#app'
import { useGameStore as useZustandGameStore } from '~/stores/zustand/gameStore'
import { settingsStore as useZustandSettingsStore } from '~/stores/settingsStore'
import { loadingStore as useZustandLoadingStore } from '~/stores/loadingStore'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('zustand', {
    game: useZustandGameStore,
    settings: useZustandSettingsStore,
    loading: useZustandLoadingStore,
  })
})
