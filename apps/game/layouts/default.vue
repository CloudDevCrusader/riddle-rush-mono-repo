<template>
  <div
    class="layout-viewport pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
  >
    <!-- Background Image (if provided by page) -->
    <img
      v-if="backgroundImage"
      :src="backgroundImage"
      alt="Background"
      class="page-bg-cover"
      width="1920"
      height="1080"
    />

    <!-- Main Content -->
    <div class="layout-main-col">
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
