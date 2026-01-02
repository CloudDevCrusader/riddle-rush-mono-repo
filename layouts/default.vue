<template>
  <div class="layout-container">
    <!-- Background Image (if provided by page) -->
    <img
      v-if="backgroundImage"
      :src="backgroundImage"
      alt="Background"
      class="page-bg"
    >

    <!-- Main Content -->
    <div class="page-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Default Layout
 * Provides basic page structure with optional background image
 */

// Accept background image from page
const backgroundImage = ref<string | null>(null)

// Provide method for pages to set background
provide('setBackground', (src: string) => {
  backgroundImage.value = src
})
</script>

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
  background: #1a1a2e;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.page-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
