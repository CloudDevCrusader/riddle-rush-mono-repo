<script setup lang="ts">
/**
 * GameDisplay Component
 *
 * Yellow/gold text display with glow effects for scores, letters, and counters.
 *
 * Usage:
 * - Scores: <GameDisplay size="md">1250</GameDisplay>
 * - Letters: <GameDisplay size="lg">A</GameDisplay>
 * - Hero display: <GameDisplay size="xl" tag="h1">B</GameDisplay>
 * - Without glow: <GameDisplay :glow="false">Text</GameDisplay>
 */

interface Props {
  /** Visual size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Enable glow effect */
  glow?: boolean
  /** HTML tag for semantic flexibility */
  tag?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  glow: true,
  tag: 'span',
})

const displayClasses = computed(() => [
  'game-display',
  `game-display--${props.size}`,
  props.glow && 'game-display--glow',
])
</script>

<template>
  <component :is="tag" :class="displayClasses">
    <slot />
  </component>
</template>

<style scoped lang="scss">
@use 'assets/scss/effects/shadows' as *;

.game-display {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-yellow);
  line-height: 1.1;
  text-align: center;

  // Size variants using responsive font-size tokens
  &--sm {
    font-size: var(--font-size-lg); // Small counters
  }

  &--md {
    font-size: var(--font-size-2xl); // Score displays
  }

  &--lg {
    font-size: var(--font-size-3xl); // Category letters
  }

  &--xl {
    font-size: var(--font-size-display); // Hero letter display
  }

  // Glow effect modifier
  &--glow {
    @include text-glow(); // Uses default params: yellow text, gold glow
  }
}

// Small phone adjustments
@media (max-width: 480px) {
  .game-display {
    &--md {
      font-size: var(--font-size-xl);
    }

    &--lg {
      font-size: var(--font-size-2xl);
    }

    &--xl {
      font-size: var(--font-size-3xl);
    }
  }
}
</style>
