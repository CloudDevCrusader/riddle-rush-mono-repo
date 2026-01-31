<template>
  <div class="game-panel">
    <slot />
  </div>
</template>

<script setup lang="ts">
// This component has no script logic.
</script>

<style scoped lang="scss">
@use 'assets/scss/mixins' as *;
@use 'assets/scss/variables' as *;

.game-panel {
  @include embossed-panel;

  width: 100%;
  max-width: 600px; // Example max-width
  padding: 2rem;
  background-color: $bg-dark-blue;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
}
</style>
