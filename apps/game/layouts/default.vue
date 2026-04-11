<template>
  <div class="layout-container">
    <!-- Browser online/offline (no Socket.IO) -->
    <div class="connection-indicator">
      <NetworkStatusIndicator />
    </div>

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
