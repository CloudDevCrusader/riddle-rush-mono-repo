<template>
  <div class="game-panel">
    <slot />
  </div>
</template>

<script setup lang="ts">
// This component has no script logic.
</script>

<style scoped lang="scss">
@use 'assets/scss/design-system' as *;

.game-panel {
  @include embossed-panel;

  width: 100%;
  max-width: 600px;
  padding: 2rem;
  background: var(--bg-gradient-panel);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

// Small phone adjustments
@include small-mobile {
  .game-panel {
    max-width: calc(100% - var(--spacing-sm) * 2);
    padding: var(--spacing-md);
    border-radius: var(--radius-lg);
  }
}

@include tiny-mobile {
  .game-panel {
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
  }
}
</style>
