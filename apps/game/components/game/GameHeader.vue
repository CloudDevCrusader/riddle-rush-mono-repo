<script setup lang="ts">
/**
 * GameHeader Component
 *
 * Page header with 3D text effect and optional left/right slots.
 * Used for page titles with consistent styling across the app.
 *
 * Usage:
 * - Simple title: <GameHeader>Page Title</GameHeader>
 * - With back button: <GameHeader color="gold"><template #left><button>←</button></template>Settings</GameHeader>
 * - With right content: <GameHeader><template #right><span>1/3</span></template>Round 1</GameHeader>
 * - Color variants: <GameHeader color="green">Winner!</GameHeader>
 */

interface Props {
  /** Text color variant with 3D depth effect */
  color?: 'white' | 'gold' | 'green' | 'blue' | 'orange'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'white',
})

const headerClasses = computed(() => ['game-header', `game-header--${props.color}`])
</script>

<template>
  <header :class="headerClasses">
    <!-- Left slot: Optional back button or left content -->
    <div v-if="$slots.left" class="game-header__left">
      <slot name="left" />
    </div>

    <!-- Title: Main header text with 3D effect -->
    <h1 class="game-header__title">
      <slot />
    </h1>

    <!-- Right slot: Optional right content (counter, icon, etc.) -->
    <div v-if="$slots.right" class="game-header__right">
      <slot name="right" />
    </div>
  </header>
</template>

<style scoped lang="scss">
@use 'assets/scss/effects/text-3d' as *;

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  padding: var(--spacing-md) 0;
  gap: var(--spacing-sm);

  // Left/right slots with min touch target width
  &__left,
  &__right {
    min-width: 44px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__left {
    justify-content: flex-start;
  }

  &__right {
    justify-content: flex-end;
  }

  // Title: centered, 3D text effect
  &__title {
    flex: 1;
    text-align: center;
    font-family: var(--font-display);
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    line-height: 1.1;
    margin: 0;
  }

  // Color variants with 3D depth effects
  &--white &__title {
    color: var(--color-text-white);
    @include text-3d-white;
  }

  &--gold &__title {
    color: var(--color-text-yellow);
    @include text-3d-gold;
  }

  &--green &__title {
    color: var(--color-btn-green-light);
    @include text-3d-green;
  }

  &--blue &__title {
    color: var(--color-btn-blue-light);
    @include text-3d-blue;
  }

  &--orange &__title {
    color: var(--color-btn-orange-light);
    @include text-3d-orange;
  }
}
</style>
