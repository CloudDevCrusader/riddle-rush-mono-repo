<template>
  <div class="settings-page">
    <!-- Background Image -->
    <img :src="`${baseUrl}assets/settings/BACKGROUND.png`" alt="Background" class="page-bg" />

    <!-- Back Button - Always visible -->
    <button class="emergency-back-btn tap-highlight no-select" @click="forceGoHome">
      <img :src="`${baseUrl}assets/settings/back.png`" alt="Back" />
    </button>

    <!-- Settings Modal (Lazy Loaded) -->
    <LazySettingsModal
      v-if="showSettings"
      v-model="showSettings"
      @update:model-value="handleModalClose"
    />
  </div>
</template>

<script setup lang="ts">
const { baseUrl } = usePageSetup()
const router = useRouter()

const showSettings = ref(true)

// Force navigation home - emergency exit
const forceGoHome = () => {
  console.log('Force navigate home')
  showSettings.value = false
  router.push('/')
}

// Handle modal close explicitly
const handleModalClose = (value: boolean) => {
  console.log('Settings modal close event:', value)
  if (!value) {
    forceGoHome()
  }
}

useHead({
  title: 'Settings',
  meta: [
    {
      name: 'description',
      content: 'Game settings',
    },
  ],
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
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

.emergency-back-btn {
  position: fixed;
  top: var(--spacing-xl);
  left: var(--spacing-xl);
  z-index: 99999;
  background: rgba(255, 107, 53, 0.9);
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  padding: var(--spacing-sm);
  transition: transform var(--transition-base);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.emergency-back-btn img {
  width: clamp(40px, 5vw, 60px);
  height: auto;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.emergency-back-btn:active {
  transform: scale(0.95);
}

.emergency-back-btn:hover {
  background: rgba(255, 107, 53, 1);
}
</style>
