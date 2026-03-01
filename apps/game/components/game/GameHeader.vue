<script setup lang="ts">
/**
 * GameHeader Component
 *
 * Page header with a simple, clean design.
 * Used for page titles with consistent styling across the app.
 */
</script>

<template>
  <header class="game-header">
    <!-- Left slot: Optional back button or left content -->
    <div v-if="$slots.left" class="game-header__left">
      <slot name="left" />
    </div>

    <!-- Title: Main header text -->
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

  // Title: centered
  &__title {
    flex: 1;
    text-align: center;
    font-family: var(--font-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-black);
    color: var(--color-figma-blue);
    line-height: 1.1;
    margin: 0;
  }
}
</style>
