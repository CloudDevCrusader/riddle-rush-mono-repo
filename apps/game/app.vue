<template>
  <div id="app" class="app-container">
    <SplashScreen v-if="showSplash" @complete="onSplashComplete" />
    <NuxtLayout v-show="!showSplash">
      <NuxtPage :key="routeKey" />
    </NuxtLayout>
    <Toast />
    <DebugPanel v-show="!showSplash" />
    <StoryboardDevOverlay />
  </div>
</template>

<script setup lang="ts">
import type { BeforeInstallPromptEvent } from '@riddle-rush/types/game'

const route = useRoute()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()
const { setLocale } = useI18n()

// Force route update by using full route path
const routeKey = computed(() => {
  // Use full path to ensure component remounts on route changes
  return route.fullPath
})

const showSplash = ref(true)

const onSplashComplete = () => {
  showSplash.value = false
}

onMounted(async () => {
  // Load persisted state
  gameStore.loadFromDB()
  settingsStore.loadSettings()

  // Set the saved language preference
  const savedLanguage = settingsStore.getLanguage()
  if (savedLanguage) {
    try {
      await setLocale(savedLanguage)
    } catch (error) {
      console.error('Failed to set saved language:', error)
    }
  }

  // Monitor online status
  window.addEventListener('online', () => gameStore.setOnlineStatus(true))
  window.addEventListener('offline', () => gameStore.setOnlineStatus(false))

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    gameStore.setInstallPrompt(e as BeforeInstallPromptEvent)
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
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap',
    },
  ],
})
</script>

<style lang="scss">
@use '~/assets/scss/design-system.scss';

.app-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  max-width: 100vw;
  position: relative;
  overflow-x: hidden;
  /* Mobile-first: Optimize rendering */
  -webkit-overflow-scrolling: touch;
  /* Prevent layout shifts */
  contain: layout style paint;
}

/* Page Transition Animations - Mobile Optimized */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: opacity 0.15s ease;
  }
}
</style>
