<template>
  <div
    id="app"
    class="app-container"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <FeedbackWidget />
    <DebugPanel />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useSettingsStore } from '~/stores/settings'

const gameStore = useGameStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  // Load persisted state
  gameStore.loadFromDB()
  settingsStore.loadSettings()

  // Monitor online status
  window.addEventListener('online', () => gameStore.setOnlineStatus(true))
  window.addEventListener('offline', () => gameStore.setOnlineStatus(false))

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    gameStore.setInstallPrompt(e)
  })

  // Debug mode shortcut: Ctrl+Shift+D
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault()
      settingsStore.toggleDebugMode()
    }
  })
})

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Poppins:wght@400;500;600;700;900&display=swap' },
  ],
})
</script>

<style>
@import '~/assets/css/design-system.css';

.app-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  position: relative;
}
</style>
