<template>
  <div class="game-layout">
    <!-- Background Image -->
    <img
      v-if="backgroundImage"
      :src="backgroundImage"
      alt="Background"
      class="page-bg"
    />

    <!-- Back Button -->
    <button
      v-if="showBackButton"
      class="back-btn tap-highlight no-select"
      @click="handleBack"
    >
      <img
        :src="backButtonImage"
        alt="Back"
      />
    </button>

    <!-- Main Content Container -->
    <div class="container">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Game Layout
 * Standard layout for game pages with background and back button
 */
const { baseUrl } = useRuntimeConfig().public
const router = useRouter()

// Layout state
const backgroundImage = ref<string | null>(null)
const backButtonImage = ref<string>(`${baseUrl}assets/players/back.png`)
const showBackButton = ref(true)
const onBackCallback = ref<(() => void) | null>(null)

// Provide methods for pages to customize layout
provide('setBackground', (src: string) => {
  backgroundImage.value = src
})

provide('setBackButton', (config: {
  visible?: boolean
  image?: string
  onBack?: () => void
}) => {
  if (config.visible !== undefined) showBackButton.value = config.visible
  if (config.image) backButtonImage.value = config.image
  if (config.onBack) onBackCallback.value = config.onBack
})

// Handle back button click
const handleBack = () => {
  if (onBackCallback.value) {
    onBackCallback.value()
  }
  else {
    router.back()
  }
}
</script>

<style scoped>
.game-layout {
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
  opacity: 0.7;
}

.container {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-md);
  gap: var(--spacing-2xl);
}

@media (max-width: 640px) {
  .back-btn img {
    width: 40px;
  }

  .container {
    padding: var(--spacing-2xl) var(--spacing-sm);
  }
}
</style>
