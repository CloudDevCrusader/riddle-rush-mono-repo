<template>
  <div class="layout-container">
    <!-- Connection Status Indicator -->
    <div v-if="isWebSocketEnabled" class="connection-indicator">
      <ConnectionStatus />
    </div>

    <!-- Background Image (if provided by page) -->
    <img
      v-if="backgroundImage"
      :src="backgroundImage"
      alt="Background"
      class="page-bg"
      width="1920"
      height="1080"
    >

    <!-- Main Content -->
    <div class="page-content">
      <slot />
    </div>

    <!-- Global Loading Overlay -->
    <GlobalLoading />
    <div class="footer">
      <div v-if="isDev" class="version-tag">v{{ appVersion }} ({{ environment }})</div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Default Layout
 * Provides basic page structure with optional background image
 */

const config = useRuntimeConfig()
const { isWebSocketEnabled } = useFeatureFlags()

// App version and environment for dev footer
const appVersion = config.public.appVersion
const environment = config.public.environment
const isDev = environment === 'development'

// Accept background image from page
const backgroundImage = ref<string | null>(null)

// Provide method for pages to set background
provide('setBackground', (src: string) => {
  backgroundImage.value = src
})
</script>

<style scoped lang="scss">
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 100;
  display: flex;
  justify-content: center;
  padding-bottom: env(safe-area-inset-bottom, 8px);
}

.version-tag {
  background-color: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  padding: 2px 6px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  pointer-events: auto;
}
</style>
