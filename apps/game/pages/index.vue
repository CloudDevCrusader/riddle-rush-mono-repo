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

        <!-- Main actions — Figma main menu (thick gold rim, stacked 3D pills) -->
        <div class="menu-shelf menu-shelf--primary">
          <GameButtonGroup layout="stack" relaxed class="menu-shelf__actions">
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
              variant="warning"
              size="lg"
              full-width
              data-testid="main-menu-options"
              @click="wrappedGoToSettings"
            >
              {{ t('menu.options', 'Options') }}
            </GameButton>
            <GameButton
              variant="danger"
              size="lg"
              full-width
              data-testid="main-menu-credits"
              @click="goToCredits"
            >
              {{ t('menu.credits', 'CREDITS') }}
            </GameButton>
          </GameButtonGroup>
        </div>
      </div>
    </GameBackground>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'slide-right', mode: 'out-in' } });

const { router, toast, t } = usePageSetup();
const { goToPlayers, goToSettings, goToCredits } = useNavigation();
const { getAssetPath } = useAssets();
const route = useRoute();

onMounted(() => {
  if (route.query.needsGame === 'true') {
    toast.warning(t('game.no_active_session', 'Please start a game first'));
    router.replace({ query: {} });
  }
});

const handlePlay = () => {
  goToPlayers();
};

const wrappedGoToSettings = () => {
  goToSettings();
};

useLocalizedPageSeo({
  title: () => t('home.page_title'),
  description: () => t('app.description'),
});
</script>

<style scoped>
/* Shared width for main menu — fluid max-width across breakpoints */
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
.menu-shelf--primary :deep(.menu-shelf__actions.game-button-group > .game-button.game-button--lg) {
  animation: main-menu-btn-in 0.4s cubic-bezier(0.34, 1.45, 0.64, 1) both;
}

.menu-shelf--primary
  :deep(.menu-shelf__actions.game-button-group > .game-button.game-button--lg:nth-child(1)) {
  animation-delay: 0ms;
}

.menu-shelf--primary
  :deep(.menu-shelf__actions.game-button-group > .game-button.game-button--lg:nth-child(2)) {
  animation-delay: 70ms;
}

.menu-shelf--primary
  :deep(.menu-shelf__actions.game-button-group > .game-button.game-button--lg:nth-child(3)) {
  animation-delay: 140ms;
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
  .menu-shelf--primary
    :deep(.menu-shelf__actions.game-button-group > .game-button.game-button--lg) {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

/*
 * Figma main menu (node ~9-2): candy / arcade pills — bright face, dark “stack” depth,
 * double gold rim (warm highlight + deep brown outer ring).
 */
.menu-shelf :deep(.menu-shelf__actions.game-button-group > .game-button.game-button--lg) {
  position: relative;
  border-radius: var(--radius-full);
  border: 5px solid #f5d565;
  min-height: clamp(3.35rem, 10vw, 4.1rem);
  padding-block: 1rem;
  padding-inline: clamp(1.25rem, 5vw, 2rem);
  font-size: clamp(1rem, 3.6vw, 1.2rem);
  text-transform: uppercase;
  letter-spacing: 0.11em;
  font-weight: var(--font-weight-black);
  box-shadow:
    0 0 0 2px rgba(255, 248, 210, 0.95),
    0 0 0 5px #6b4816,
    inset 0 4px 0 rgb(255 255 255 / 0.82),
    inset 0 -3px 10px rgb(0 0 0 / 0.18),
    0 12px 0 var(--menu-btn-depth, var(--color-btn-green-shadow)),
    0 22px 36px rgb(0 0 0 / 0.28);
}

.menu-shelf
  :deep(
    .menu-shelf__actions.game-button-group > .game-button.game-button--lg:active:not(:disabled)
  ) {
  transform: translateY(6px);
  box-shadow:
    0 0 0 2px rgba(255, 248, 210, 0.9),
    0 0 0 5px #6b4816,
    inset 0 3px 0 rgb(255 255 255 / 0.72),
    inset 0 -2px 8px rgb(0 0 0 / 0.16),
    0 6px 0 var(--menu-btn-depth, var(--color-btn-green-shadow)),
    0 14px 28px rgb(0 0 0 / 0.22);
}

/* PLAY — lime face, forest label (readable on bright green) */
.menu-shelf :deep(.menu-shelf__actions .game-button--primary.game-button--lg) {
  --menu-btn-depth: #2f7a12;
  --shadow-color: #2f7a12;
  color: #153209;
  text-shadow:
    0 1px 0 rgb(255 255 255 / 0.55),
    0 2px 0 rgb(0 0 0 / 0.06);
  background: linear-gradient(180deg, #d8ff8f 0%, #7fe038 42%, #4fc41e 100%);
}

/* OPTIONS — warm gold (distinct from PLAY green) */
.menu-shelf :deep(.menu-shelf__actions .game-button--warning.game-button--lg) {
  --menu-btn-depth: #8a5a0e;
  --shadow-color: #8a5a0e;
  color: #4a2f00;
  text-shadow:
    0 1px 0 rgb(255 255 255 / 0.55),
    0 1px 2px rgb(0 0 0 / 0.12);
  background: linear-gradient(180deg, #ffe97a 0%, #f0a82e 48%, #c77f12 100%);
}

/* CREDITS — coral / red-orange */
.menu-shelf :deep(.menu-shelf__actions .game-button--danger.game-button--lg) {
  --menu-btn-depth: #7a3010;
  --shadow-color: #7a3010;
  color: #fff8f2;
  text-shadow:
    0 1px 2px rgb(0 0 0 / 0.45),
    0 -1px 0 rgb(0 0 0 / 0.12);
  background: linear-gradient(180deg, #ffb090 0%, #f06828 45%, #c94818 100%);
}
</style>
