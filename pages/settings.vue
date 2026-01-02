<template>
  <div class="settings-page">
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/settings/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
    >

    <!-- Back Button -->
    <button
      class="back-btn tap-highlight no-select"
      @click="goBack"
    >
      <img
        :src="`${baseUrl}assets/settings/back.png`"
        alt="Back"
      >
    </button>

    <!-- Settings Modal (Lazy Loaded) -->
    <LazySettingsModal
      v-if="showSettings"
      v-model="showSettings"
    />
  </div>
</template>

<script setup lang="ts">
const { router, baseUrl } = usePageSetup()

const showSettings = ref(true)

const goBack = () => {
  showSettings.value = false
  setTimeout(() => {
    router.push('/')
  }, 300)
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

.back-btn {
  position: absolute;
  top: var(--spacing-xl);
  left: var(--spacing-xl);
  z-index: 3;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.back-btn img {
  width: clamp(40px, 5vw, 60px);
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.back-btn:active {
  transform: scale(0.95);
}
</style>
