<template>
  <div id="app" class="app-container">
    <Transition name="splash-fade" mode="out-in">
      <SplashScreen v-if="showSplash" @complete="onSplashComplete" />
      <div v-else class="main-content">
        <NuxtLayout>
          <NuxtPage :key="routeKey" />
        </NuxtLayout>
        <Toast />
        <DebugPanel />
        <StoryboardDevOverlay />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { BeforeInstallPromptEvent } from '@riddle-rush/types/game'

const route = useRoute()
const gameSession = useGameSession()
const installPrompt = useInstallPrompt()
const settings = useSettings()
const { setLocale } = useI18n()

// Force route update by using full route path
const routeKey = computed(() => {
  // Use full path to ensure component remounts on route changes
  return route.fullPath
})

// Disable splash screen in E2E tests
const isE2E =
  process.env.NODE_ENV === 'test' ||
  (typeof window !== 'undefined' &&
    (window as Window & { playwrightTest?: boolean }).playwrightTest)
const showSplash = ref(!isE2E)

const onSplashComplete = () => {
  showSplash.value = false
}

// Named handlers for proper cleanup
const handleOnline = () => gameSession.setOnlineStatus(true)
const handleOffline = () => gameSession.setOnlineStatus(false)
const handleInstallPrompt = (e: Event) => {
  e.preventDefault()
  installPrompt.setInstallPrompt(e as BeforeInstallPromptEvent)
}
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault()
    settings.toggleDebugMode()
  }
}

onMounted(async () => {
  // Load persisted state
  await gameSession.loadFromDB()

  // Set the saved language preference
  const savedLanguage = settings.getLanguage()
  if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
    try {
      await setLocale(savedLanguage as 'de' | 'en')
    } catch (error) {
      const logger = useLogger()
      logger.error('Failed to set saved language:', error)
    }
  }

  // Monitor online status
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', handleInstallPrompt)

  // Debug mode shortcut: Ctrl+Shift+D
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  window.removeEventListener('keydown', handleKeydown)
})

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap',
    },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'apple-touch-startup-image', href: '/pwa-512x512.png' },
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

/* Splash Screen Transition */
.splash-fade-enter-active,
.splash-fade-leave-active {
  transition: opacity 0.5s ease;
}

.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}

.main-content {
  min-height: 100vh;
  min-height: 100dvh;
}

/* Forward navigation: slide left */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 250ms ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Back navigation: slide right */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 250ms ease;
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: opacity 0.15s ease;
  }

  .slide-left-enter-from,
  .slide-left-leave-to,
  .slide-right-enter-from,
  .slide-right-leave-to {
    transform: none;
  }
}
</style>
