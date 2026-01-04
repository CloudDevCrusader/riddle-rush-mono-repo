<template>
  <div
    id="app"
    class="app-container"
  >
    <SplashScreen
      v-if="showSplash"
      @complete="onSplashComplete"
    />
    <NuxtLayout v-show="!showSplash">
      <Transition
        name="page"
        mode="out-in"
      >
        <NuxtPage :key="$route.path" />
      </Transition>
    </NuxtLayout>
    <Toast />
    <DebugPanel v-show="!showSplash" />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useSettingsStore } from '~/stores/settings'
import type { BeforeInstallPromptEvent } from '@riddle-rush/types/game'

const gameStore = useGameStore()
const settingsStore = useSettingsStore()

const showSplash = ref(true)
const config = useRuntimeConfig()
const gaId = config.public.googleAnalyticsId

const onSplashComplete = () => {
  showSplash.value = false
}

const handleOnline = () => gameStore.setOnlineStatus(true)
const handleOffline = () => gameStore.setOnlineStatus(false)
const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  gameStore.setInstallPrompt(e as BeforeInstallPromptEvent)
}
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault()
    settingsStore.toggleDebugMode()
  }
}

onMounted(() => {
  // Load persisted state
  gameStore.loadFromDB()
  settingsStore.loadSettings()

  // Monitor online status
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

  // Debug mode shortcut: Ctrl+Shift+D
  window.addEventListener('keydown', handleKeydown)

  // Load Google Analytics if configured
  if (gaId && typeof window !== 'undefined') {
    // Load GA4 script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', gaId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('keydown', handleKeydown)
})

// Fonts are handled by @nuxt/fonts module
// Google Analytics is loaded manually in onMounted
useHead({
  link: [
    // Preconnect to Google Fonts for faster loading
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    // Google Analytics preconnect (if enabled)
    ...(gaId
      ? [
          { rel: 'preconnect', href: 'https://www.googletagmanager.com' },
          { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
        ]
      : []),
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
