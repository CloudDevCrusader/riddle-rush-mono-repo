<template>
  <div id="app" class="app-container">
    <SplashScreen v-if="showSplash" @complete="onSplashComplete" />
    <NuxtLayout v-show="!showSplash">
      <Transition name="page" mode="out-in">
        <NuxtPage :key="route.path" />
      </Transition>
    </NuxtLayout>
    <Toast />
    <DebugPanel v-show="!showSplash" />
  </div>
</template>

<script setup lang="ts">
import type { BeforeInstallPromptEvent } from '@riddle-rush/types/game'

const route = useRoute()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()

const showSplash = ref(true)

const onSplashComplete = () => {
  showSplash.value = false
}

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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: opacity 0.15s ease;
  }

  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
}

/* Mobile-first: Ensure smooth transitions on touch devices */
@media (max-width: 640px) {
  .page-enter-active,
  .page-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .page-enter-from {
    transform: translateX(15px);
  }

  .page-leave-to {
    transform: translateX(-15px);
  }
}
</style>
