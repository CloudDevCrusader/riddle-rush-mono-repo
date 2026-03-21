import { defineNuxtPlugin } from '#app'
import { gameStore } from '~/stores/gameStore'
import { settingsStore } from '~/stores/settingsStore'
import { loadingStore } from '~/stores/loadingStore'
import { migrateFromPinia } from '~/stores/migrate'

export default defineNuxtPlugin((nuxtApp) => {
  // Auto-migrate old Pinia localStorage data on first load
  if (import.meta.client) {
    migrateFromPinia()
  }

  // Provide stores for backward compatibility (if needed)
  nuxtApp.provide('zustand', {
    game: gameStore,
    settings: settingsStore,
    loading: loadingStore,
  })
})
