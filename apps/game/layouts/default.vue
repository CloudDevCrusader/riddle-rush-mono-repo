<template>
  <div class="layout-container">
    <!-- Background Image (if provided by page) -->
    <img
      v-if="backgroundImage"
      :src="backgroundImage"
      alt="Background"
      class="page-bg"
      width="1920"
      height="1080"
    />

    <!-- Main Content -->
    <div class="page-content">
      <slot />
    </div>

    <!-- Global Loading Overlay -->
    <GlobalLoading />
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

<style scoped lang="scss">
/* Full-bleed layout: avoids gray bands when a child only fills partial viewport on mobile */
.layout-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

.page-content {
  flex: 1 0 auto;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
