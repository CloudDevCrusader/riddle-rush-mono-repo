<template>
  <div class="game-background">
    <slot />
  </div>
</template>

<script setup lang="ts">
// This component has no script logic.
</script>

<style scoped lang="scss">
@use '@/assets/scss/design-system' as *;

.game-background {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background: var(--bg-gradient-main);
  overflow-y: auto;
}
</style>
