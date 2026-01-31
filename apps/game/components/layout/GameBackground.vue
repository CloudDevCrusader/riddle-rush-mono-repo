<template>
  <div class="game-background">
    <slot />
  </div>
</template>

<script setup lang="ts">
// This component has no script logic.
</script>

<style scoped lang="scss">
@use 'assets/scss/variables' as *;

.game-background {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background-color: $bg-dark-blue;
  background-image: radial-gradient(
    circle at 50% 50%,
    rgba($bg-light-blue, 0.8) 0%,
    rgba($bg-dark-blue, 0.9) 70%,
    $bg-dark-blue 100%
  );
  overflow-y: auto;
}
</style>
