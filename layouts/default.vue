<template>
  <div class="layout-container">
    <slot />
  </div>
</template>

<style scoped>
.layout-container {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  /* Mobile-first: Prevent horizontal overflow */
  max-width: 100vw;
  overflow-x: hidden;
  position: relative;
  /* Optimize for mobile rendering */
  -webkit-overflow-scrolling: touch;
  /* Ensure proper positioning for page transitions */
  isolation: isolate;
}
</style>
