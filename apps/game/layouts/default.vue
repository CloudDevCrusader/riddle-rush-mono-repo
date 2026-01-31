<template>
  <div class="layout-container">
    <!-- Connection Status Indicator -->
    <div v-if="isWebSocketEnabled" class="connection-indicator">
      <ConnectionStatus />
    </div>

    <!-- Background Image (if provided by page) -->
    <img v-if="backgroundImage" :src="backgroundImage" alt="Background" class="page-bg" />

    <!-- Main Content -->
    <div class="page-content">
      <slot />
    </div>

    <!-- Global Loading Overlay -->
    <GlobalLoading />
    <div class="footer" />
  </div>
</template>

<script setup lang="ts">
/**
 * Default Layout
 * Provides basic page structure with optional background image
 */

const { isWebSocketEnabled } = useFeatureFlags()

// Accept background image from page
const backgroundImage = ref<string | null>(null)

// Provide method for pages to set background
provide('setBackground', (src: string) => {
  backgroundImage.value = src
})
</script>
