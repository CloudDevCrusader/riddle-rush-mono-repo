<script setup lang="ts">
/**
 * Session chrome: back (left), optional center slot, pause (right).
 * Matches spacing/visual weight of the in-round game header.
 */
const { t } = usePageSetup();
const { getAssetPath } = useAssets();

withDefaults(
  defineProps<{
    backDisabled?: boolean;
    pauseDisabled?: boolean;
    /** Show pause control (e.g. off on settings / options where it is not needed). */
    showPause?: boolean;
    backTestId?: string;
    pauseTestId?: string;
  }>(),
  {
    backDisabled: false,
    pauseDisabled: false,
    showPause: true,
    backTestId: 'session-top-bar-back',
    pauseTestId: 'session-top-bar-pause',
  }
);

defineEmits<{
  back: [];
  pause: [];
}>();
</script>

<template>
  <header class="game-session-top-bar">
    <button
      type="button"
      class="game-back-btn game-back-btn--red tap-highlight no-select"
      :data-testid="backTestId"
      :disabled="backDisabled"
      :aria-label="t('common.back')"
      @click="$emit('back')"
    >
      <img
        :src="getAssetPath('assets/alphabets/back.png')"
        :alt="t('common.back')"
        class="game-session-top-bar__back-icon"
        loading="eager"
        width="32"
        height="32"
      />
    </button>

    <div class="game-session-top-bar__center">
      <slot />
    </div>

    <button
      v-if="showPause"
      type="button"
      class="game-session-top-bar__pause pause-btn tap-highlight no-select"
      :data-testid="pauseTestId"
      :disabled="pauseDisabled"
      :aria-label="t('game.pause')"
      @click="$emit('pause')"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </svg>
    </button>
    <div v-else class="game-session-top-bar__spacer" aria-hidden="true" />
  </header>
</template>

<style scoped>
.game-session-top-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-md);
  padding-top: max(var(--spacing-lg), env(safe-area-inset-top, 0px));
  z-index: var(--z-base, 2);
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.game-session-top-bar__back-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.game-session-top-bar__center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  padding-inline: var(--spacing-sm);
}

/* Same footprint as `.game-back-btn` so the title stays centered when pause is hidden */
.game-session-top-bar__spacer {
  flex-shrink: 0;
  width: clamp(44px, 10vw, 64px);
  height: clamp(44px, 10vw, 64px);
}

.pause-btn,
.game-session-top-bar__pause {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(180deg, #44c8ff 0%, #0a6bc2 100%);
  border: 4px solid #ffaa00;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform var(--transition-base),
    opacity var(--transition-base),
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
  box-shadow:
    0 8px 0 rgba(0, 0, 0, 0.2),
    var(--shadow-lg);
  color: var(--color-white);
  position: relative;
  overflow: hidden;
}

.pause-btn::before,
.game-session-top-bar__pause::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.pause-btn:active:not(:disabled),
.game-session-top-bar__pause:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow:
    0 4px 0 rgba(0, 0, 0, 0.2),
    var(--shadow-md);
}

.pause-btn:disabled,
.game-session-top-bar__pause:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pause-btn svg,
.game-session-top-bar__pause svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  z-index: 1;
}

@media (max-width: 768px) {
  .game-session-top-bar {
    padding: var(--spacing-md);
    padding-top: max(var(--spacing-md), env(safe-area-inset-top, 0px));
  }

  .game-session-top-bar .game-back-btn,
  .game-session-top-bar__pause {
    width: clamp(50px, 12vw, 64px);
    height: clamp(50px, 12vw, 64px);
    border-width: 3px;
  }

  .game-session-top-bar__back-icon {
    width: clamp(24px, 6vw, 32px);
    height: clamp(24px, 6vw, 32px);
  }
}

@media (max-width: 480px) {
  .game-session-top-bar {
    padding: var(--spacing-sm);
    padding-top: max(var(--spacing-sm), env(safe-area-inset-top, 0px));
  }

  .game-session-top-bar .game-back-btn,
  .game-session-top-bar__pause {
    width: clamp(44px, 11vw, 56px);
    height: clamp(44px, 11vw, 56px);
    border-width: 2px;
  }
}
</style>
