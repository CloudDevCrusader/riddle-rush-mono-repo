<template>
  <div class="menu-page">
    <GameBackground>
      <!-- Main Container -->
      <div class="container">
        <!-- Logo -->
        <div class="logo-container">
          <img
            :src="getAssetPath('assets/splash/logo.png')"
            :alt="t('app.title')"
            class="logo-image"
            width="512"
            height="512"
            decoding="async"
            fetchpriority="high"
          />
        </div>

        <!-- Menu Buttons -->
        <div v-show="!showMenu" class="menu-buttons menu-shelf">
          <GameButton
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 0 } }"
            variant="primary"
            size="lg"
            full-width
            data-testid="main-menu-play"
            @click="handlePlay"
          >
            {{ t('menu.play', 'PLAY') }}
          </GameButton>
          <GameButton
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 80 } }"
            variant="secondary"
            size="lg"
            full-width
            data-testid="main-menu-menu"
            @click="toggleMenu"
          >
            {{ t('menu.menu', 'MENU') }}
          </GameButton>
          <GameButton
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 160 } }"
            variant="warning"
            size="lg"
            full-width
            data-testid="main-menu-options"
            @click="wrappedGoToSettings"
          >
            {{ t('menu.options', 'OPTIONS') }}
          </GameButton>
          <GameButton
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 240 } }"
            variant="danger"
            size="lg"
            full-width
            data-testid="main-menu-credits"
            @click="wrappedGoToCredits"
          >
            {{ t('menu.credits', 'CREDITS') }}
          </GameButton>
        </div>

        <!-- Menu Panel (when toggled) -->
        <transition name="menu-fade">
          <div v-if="showMenu" class="menu-panel menu-shelf">
            <GameButton
              variant="secondary"
              size="md"
              full-width
              data-testid="main-menu-language"
              @click="wrappedGoToLanguage"
            >
              🌐 {{ t('menu.language', 'Language') }}
            </GameButton>
            <GameButton
              variant="secondary"
              size="md"
              full-width
              data-testid="main-menu-settings"
              @click="wrappedGoToSettings"
            >
              ⚙️ {{ t('menu.settings', 'Settings') }}
            </GameButton>
          </div>
        </transition>
      </div>
    </GameBackground>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'slide-right', mode: 'out-in' } })

const { router, toast, t } = usePageSetup()
const { goToPlayers, goToSettings, goToCredits, goToLanguage } = useNavigation()
const { getAssetPath } = useAssets()
const route = useRoute()

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

onMounted(() => {
  if (route.query.needsGame === 'true') {
    toast.warning(t('game.no_active_session', 'Please start a game first'))
    router.replace({ query: {} })
  }
})

const handlePlay = () => {
  showMenu.value = false
  goToPlayers()
}

const wrappedGoToSettings = () => {
  showMenu.value = false
  goToSettings()
}

const wrappedGoToCredits = () => {
  showMenu.value = false
  goToCredits()
}

const wrappedGoToLanguage = () => {
  showMenu.value = false
  goToLanguage()
}

useLocalizedPageSeo({
  title: () => t('home.page_title'),
  description: () => t('app.description'),
})
</script>

<style scoped>
.menu-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
}

.container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  gap: var(--spacing-3xl);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: clamp(200px, 40vw, 400px);
  height: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
}

/* Shared width for main menu + submenu (320px-first: stays within padded viewport) */
.menu-shelf {
  width: 100%;
  max-width: min(400px, 100%);
  box-sizing: border-box;
  min-width: 0;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--spacing-md);
}

/* Figma main-menu pills: thick golden-brown rim, full pill radius, embossed white caps */
.menu-buttons :deep(.game-button.game-button--lg) {
  border-radius: var(--radius-full);
  border: 4px solid var(--color-border-gold-darker);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: var(--font-weight-black);
  text-shadow:
    0 1px 0 rgb(255 255 255 / 0.55),
    0 2px 4px rgb(0 0 0 / 0.35);
  box-shadow:
    inset 0 3px 0 rgb(255 255 255 / 0.78),
    inset 0 -2px 6px rgb(0 0 0 / 0.14),
    0 10px 0 var(--shadow-color),
    0 16px 28px rgb(0 0 0 / 0.2);
}

.menu-buttons :deep(.game-button.game-button--lg:active:not(:disabled)) {
  box-shadow:
    inset 0 2px 0 rgb(255 255 255 / 0.65),
    inset 0 -2px 6px rgb(0 0 0 / 0.12),
    0 6px 0 var(--shadow-color),
    0 12px 28px rgb(0 0 0 / 0.18);
}

/* CREDITS: red-orange stack (distinct from golden OPTIONS) */
.menu-buttons :deep(.game-button.game-button--danger.game-button--lg) {
  background: linear-gradient(180deg, #ff9a62 0%, #e85d22 100%);
  --shadow-color: #a84a18;
}

.menu-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 4px solid #ffaa00;
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow:
    0 12px 0 rgba(0, 0, 0, 0.2),
    var(--shadow-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.3s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .container {
    padding: var(--spacing-2xl) var(--spacing-xl);
    gap: var(--spacing-2xl);
  }

  .menu-buttons {
    gap: var(--spacing-sm);
  }

  .menu-panel {
    padding: var(--spacing-xl);
  }
}

@media (max-width: 480px) {
  .container {
    padding: var(--spacing-xl) var(--spacing-lg);
    gap: var(--spacing-xl);
  }

  .logo-image {
    width: min(250px, 60vw);
  }

  .menu-shelf {
    max-width: min(350px, 100%);
  }

  .menu-buttons {
    gap: var(--spacing-sm);
  }

  .menu-panel {
    padding: var(--spacing-lg);
  }
}

/* Pixel 7 / Pixel 7 Pro (412px - 480px width) */
@media (min-width: 390px) and (max-width: 480px) {
  .container {
    padding: var(--spacing-2xl) var(--spacing-xl);
    gap: var(--spacing-2xl);
  }

  .menu-shelf {
    max-width: min(360px, 100%);
  }

  .menu-buttons {
    gap: var(--spacing-md);
  }
}

/* Ultra-small phones (<360px, e.g. iPhone SE 1st gen, Galaxy S3) */
@media (max-width: 360px) {
  .container {
    padding: var(--spacing-lg) var(--spacing-md);
    gap: var(--spacing-lg);
  }

  .menu-shelf {
    max-width: min(300px, 100%);
  }

  .menu-buttons {
    gap: var(--spacing-xs);
  }

  .menu-panel {
    padding: var(--spacing-md);
  }
}

/* Minimum common phone width */
@media (max-width: 320px) {
  .container {
    padding: var(--spacing-md) var(--spacing-sm);
    gap: var(--spacing-md);
  }

  .logo-image {
    width: min(200px, 70vw);
  }

  .menu-shelf {
    max-width: 100%;
  }
}
</style>
