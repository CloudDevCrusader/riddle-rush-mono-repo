<template>
  <div id="app" class="app-container">
    <!-- Token Test Section - Remove after Phase 1 verification -->
    <div v-if="showTokenTest" class="token-test">
      <div class="token-test__header">
        <h2 class="title-lg text-embossed-gold">Design Token Test</h2>
        <button class="close-btn" @click="showTokenTest = false">Close</button>
      </div>

      <!-- Color Tokens -->
      <section class="token-test__section">
        <h3 class="title-md text-embossed-white">Button Colors</h3>
        <div class="flex flex-wrap gap-md">
          <div class="color-swatch" style="background: var(--bg-gradient-btn-green)">Green</div>
          <div class="color-swatch" style="background: var(--bg-gradient-btn-blue)">Blue</div>
          <div class="color-swatch" style="background: var(--bg-gradient-btn-orange)">Orange</div>
          <div class="color-swatch" style="background: var(--bg-gradient-btn-red)">Red</div>
        </div>
      </section>

      <!-- Typography Scale -->
      <section class="token-test__section">
        <h3 class="title-md text-embossed-white">Typography Scale</h3>
        <p style="font-size: var(--font-size-xs)">XS - Extra Small Text</p>
        <p style="font-size: var(--font-size-sm)">SM - Small Text</p>
        <p style="font-size: var(--font-size-base)">Base - Body Text</p>
        <p style="font-size: var(--font-size-lg)">LG - Large Text</p>
        <p style="font-size: var(--font-size-xl)">XL - Extra Large</p>
        <p style="font-size: var(--font-size-2xl)">2XL - Heading</p>
        <p style="font-size: var(--font-size-3xl)">3XL - Title</p>
        <p class="font-display" style="font-size: var(--font-size-display)">Display</p>
      </section>

      <!-- Embossed Text Effects -->
      <section class="token-test__section">
        <h3 class="title-md text-embossed-white">Text Effects</h3>
        <p class="title-display text-embossed-gold">RIDDLE RUSH</p>
        <p class="title-lg text-embossed-white">White Embossed</p>
        <p class="title-md text-glow-gold">Golden Glow</p>
      </section>

      <!-- Spacing Scale -->
      <section class="token-test__section">
        <h3 class="title-md text-embossed-white">Spacing Scale</h3>
        <div class="flex flex-col gap-sm">
          <div class="spacing-demo" style="width: var(--spacing-xs)">xs</div>
          <div class="spacing-demo" style="width: var(--spacing-sm)">sm</div>
          <div class="spacing-demo" style="width: var(--spacing-md)">md</div>
          <div class="spacing-demo" style="width: var(--spacing-lg)">lg</div>
          <div class="spacing-demo" style="width: var(--spacing-xl)">xl</div>
          <div class="spacing-demo" style="width: var(--spacing-2xl)">2xl</div>
        </div>
      </section>

      <!-- UnoCSS Utilities Test -->
      <section class="token-test__section">
        <h3 class="title-md text-embossed-white">UnoCSS Utilities</h3>
        <div
          class="flex items-center gap-md p-md rounded-lg"
          style="background: rgba(0, 0, 0, 0.2)"
        >
          <span class="text-game-yellow">Yellow Text</span>
          <span class="text-btn-green-light">Green Text</span>
          <span class="text-white">White Text</span>
        </div>
      </section>
    </div>

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
const gameStore = useGameStore()
const settingsStore = useSettingsStore()
const { setLocale } = useI18n()

// Token test component - set to false after verification
const showTokenTest = ref(true)

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

onMounted(async () => {
  // Load persisted state
  gameStore.loadFromDB()
  settingsStore.loadSettings()

  // Set the saved language preference
  if (settingsStore.hasStoredSettings()) {
    const savedLanguage = settingsStore.getLanguage()
    if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
      try {
        await setLocale(savedLanguage as 'de' | 'en')
      } catch (error) {
        console.error('Failed to set saved language:', error)
      }
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

/* Token Test Component Styles */
.token-test {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--bg-gradient-main);
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.token-test__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.close-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-gradient-btn-red);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  cursor: pointer;
}

.token-test__section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  background: rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-lg);
}

.color-swatch {
  width: 100px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.spacing-demo {
  height: 30px;
  background: var(--color-btn-blue-light);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-xs);
}
</style>
