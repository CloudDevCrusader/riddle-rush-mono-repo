<template>
  <div class="relative min-h-dvh min-h-screen overflow-hidden">
    <GameBackground>
      <!-- Main Container: mobile-first spacing → roomier on sm+ -->
      <div
        class="relative z-[1] box-border flex min-h-dvh min-h-screen w-full max-w-full flex-col items-center justify-center gap-lg px-md py-xl sm:gap-xl sm:px-lg sm:py-2xl md:gap-2xl md:px-xl md:py-3xl lg:gap-3xl"
      >
        <!-- Logo -->
        <div class="flex items-center justify-center">
          <img
            :src="getAssetPath('assets/splash/logo.png')"
            :alt="t('app.title')"
            class="h-auto max-w-full w-[clamp(12.5rem,40vw,25rem)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] max-[480px]:w-[min(15.625rem,60vw)] max-[360px]:w-[min(12.5rem,85vw)] max-[320px]:w-[min(12.5rem,70vw)]"
            width="512"
            height="512"
            decoding="async"
            fetchpriority="high"
          />
        </div>

        <!-- Menu Buttons -->
        <div
          v-show="!showMenu"
          class="menu-shelf menu-shelf--primary flex flex-col items-stretch gap-sm sm:gap-md md:gap-md"
        >
          <GameButton
            variant="primary"
            size="lg"
            full-width
            data-testid="main-menu-play"
            @click="handlePlay"
          >
            {{ t('menu.play', 'PLAY') }}
          </GameButton>
          <GameButton
            variant="secondary"
            size="lg"
            full-width
            data-testid="main-menu-menu"
            @click="toggleMenu"
          >
            {{ t('menu.menu', 'MENU') }}
          </GameButton>
          <GameButton
            variant="warning"
            size="lg"
            full-width
            data-testid="main-menu-options"
            @click="wrappedGoToSettings"
          >
            {{ t('menu.options', 'OPTIONS') }}
          </GameButton>
          <GameButton
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
          <div
            v-if="showMenu"
            class="menu-shelf flex flex-col gap-md rounded-xl border-4 border-[#ffaa00] bg-white/95 p-lg shadow-[0_12px_0_rgba(0,0,0,0.2)] shadow-xl sm:p-xl md:p-2xl"
          >
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
definePageMeta({ pageTransition: { name: 'slide-right', mode: 'out-in' } });

const { router, toast, t } = usePageSetup();
const { goToPlayers, goToSettings, goToCredits, goToLanguage } = useNavigation();
const { getAssetPath } = useAssets();
const route = useRoute();

const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

onMounted(() => {
  if (route.query.needsGame === 'true') {
    toast.warning(t('game.no_active_session', 'Please start a game first'));
    router.replace({ query: {} });
  }
});

const handlePlay = () => {
  showMenu.value = false;
  goToPlayers();
};

const wrappedGoToSettings = () => {
  showMenu.value = false;
  goToSettings();
};

const wrappedGoToCredits = () => {
  showMenu.value = false;
  goToCredits();
};

const wrappedGoToLanguage = () => {
  showMenu.value = false;
  goToLanguage();
};

useLocalizedPageSeo({
  title: () => t('home.page_title'),
  description: () => t('app.description'),
});
</script>

<style scoped>
/* Shared width for main menu + submenu — fluid max-width across breakpoints */
.menu-shelf {
  width: 100%;
  max-width: min(400px, 100%);
  box-sizing: border-box;
  min-width: 0;
}

@media (max-width: 480px) {
  .menu-shelf {
    max-width: min(350px, 100%);
  }
}

@media (max-width: 360px) {
  .menu-shelf {
    max-width: min(300px, 100%);
  }
}

@media (max-width: 320px) {
  .menu-shelf {
    max-width: 100%;
  }
}

/* Entrance: CSS only so buttons are never stuck at opacity 0 if motion directives fail on SFCs */
.menu-shelf--primary :deep(.game-button.game-button--lg) {
  animation: main-menu-btn-in 0.4s cubic-bezier(0.34, 1.45, 0.64, 1) both;
}

.menu-shelf--primary :deep(.game-button.game-button--lg:nth-child(1)) {
  animation-delay: 0ms;
}

.menu-shelf--primary :deep(.game-button.game-button--lg:nth-child(2)) {
  animation-delay: 70ms;
}

.menu-shelf--primary :deep(.game-button.game-button--lg:nth-child(3)) {
  animation-delay: 140ms;
}

.menu-shelf--primary :deep(.game-button.game-button--lg:nth-child(4)) {
  animation-delay: 210ms;
}

@keyframes main-menu-btn-in {
  from {
    opacity: 0;
    transform: translateY(1.125rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-shelf--primary :deep(.game-button.game-button--lg) {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

/* Figma main-menu pills: thick golden-brown rim, full pill radius, embossed white caps */
.menu-shelf :deep(.game-button.game-button--lg) {
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

.menu-shelf :deep(.game-button.game-button--lg:active:not(:disabled)) {
  box-shadow:
    inset 0 2px 0 rgb(255 255 255 / 0.65),
    inset 0 -2px 6px rgb(0 0 0 / 0.12),
    0 6px 0 var(--shadow-color),
    0 12px 28px rgb(0 0 0 / 0.18);
}

/* CREDITS: red-orange stack (distinct from golden OPTIONS) */
.menu-shelf :deep(.game-button.game-button--danger.game-button--lg) {
  background: linear-gradient(180deg, #ff9a62 0%, #e85d22 100%);
  --shadow-color: #a84a18;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.3s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
</style>
