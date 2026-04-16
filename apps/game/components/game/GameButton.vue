<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span v-if="loading" class="game-button__spinner" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** Play UI click sound (Web Audio). Disable when the parent plays a custom sound for the same action. */
  soundOnClick?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
  soundOnClick: true,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const audio = useAudio();

const buttonClasses = computed(() => [
  'game-button',
  `game-button--${props.variant}`,
  `game-button--${props.size}`,
  {
    'game-button--disabled': props.disabled || props.loading,
    'game-button--loading': props.loading,
    'game-button--full-width': props.fullWidth,
  },
]);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    if (props.soundOnClick) {
      void audio.playClick();
    }
    emit('click', event);
  }
};
</script>

<style scoped lang="scss">
@use 'assets/scss/effects/glossy' as *;

.game-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-lg);
  border: 3px solid rgba(255, 255, 255, 0.35);
  cursor: pointer;
  touch-action: manipulation;
  transition:
    transform var(--transition-fast),
    opacity var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  color: white;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  // Hover effect
  &:hover:not(:disabled) {
    filter: brightness(1.05);
  }

  // Active/press state - 3D press effect
  &:active:not(:disabled) {
    transform: translateY(4px);
    // Reduce shadow offset by 4px to match the translateY
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      inset 0 -2px 6px rgba(0, 0, 0, 0.12),
      0 6px 0 var(--shadow-color),
      0 12px 28px rgba(0, 0, 0, 0.18);
  }

  // Focus visible for keyboard navigation
  &:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.8);
    outline-offset: 4px;
  }
}

// Size variants
.game-button--sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  min-height: 44px;
}

.game-button--md {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-md);
  min-height: 52px;
}

.game-button--lg {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
  min-height: 64px;
}

// Small phone adjustments
@media (max-width: 480px) {
  .game-button--md {
    padding: var(--spacing-sm) var(--spacing-md);
    min-height: 48px;
  }

  .game-button--lg {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-md);
    min-height: 56px;
  }
}

@media (max-width: 360px) {
  .game-button--lg {
    padding: var(--spacing-sm) var(--spacing-md);
    min-height: 48px;
  }
}

// Color variants using glossy-button mixin
.game-button--primary {
  @include glossy-button(
    var(--color-btn-green-light),
    var(--color-btn-green-dark),
    var(--color-btn-green-shadow)
  );
  --shadow-color: var(--color-btn-green-shadow);
}

.game-button--secondary {
  @include glossy-button(
    var(--color-btn-blue-light),
    var(--color-btn-blue-dark),
    var(--color-btn-blue-shadow)
  );
  --shadow-color: var(--color-btn-blue-shadow);
}

.game-button--warning {
  @include glossy-button(
    var(--color-btn-orange-light),
    var(--color-btn-orange-dark),
    var(--color-btn-orange-shadow)
  );
  --shadow-color: var(--color-btn-orange-shadow);
}

.game-button--danger {
  @include glossy-button(
    var(--color-btn-red-light),
    var(--color-btn-red-dark),
    var(--color-btn-red-shadow)
  );
  --shadow-color: var(--color-btn-red-shadow);
}

// Disabled state
.game-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

// Full width
.game-button--full-width {
  width: 100%;
}

// Loading spinner
.game-button__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
