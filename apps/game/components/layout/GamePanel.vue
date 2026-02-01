<template>
  <div class="game-panel">
    <slot />
  </div>
</template>

<script setup lang="ts">
// This component has no script logic.
</script>

<style scoped lang="scss">
@use '@/assets/scss/design-system' as *;

.game-panel {
  @include embossed-panel;

  width: 100%;
  max-width: 600px;
  padding: 2rem;
  background: var(--bg-gradient-panel);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}
</style>
