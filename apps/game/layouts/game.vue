<template>
  <div class="game-layout">
    <!-- Background Image -->
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <img v-if="backgroundImage" :src="backgroundImage" alt="Background" class="page-bg" />

    <!-- Back Button -->
    <button v-if="showBackButton" class="back-btn tap-highlight no-select" @click="handleBack">
      <img :src="backButtonImage" alt="Back" />
=======
=======
>>>>>>> Stashed changes
    <img
      v-if="backgroundImage"
      :src="backgroundImage"
      alt="Background"
      class="page-bg-cover"
    >

    <!-- Back Button -->
    <button
      v-if="showBackButton"
      class="tap-highlight no-select absolute left-md top-lg z-10 cursor-pointer border-none bg-transparent p-0 transition-transform active:scale-95 active:opacity-70 sm:left-xl sm:top-xl"
      type="button"
      @click="handleBack"
    >
      <img
        :src="backButtonImage"
        alt="Back"
        class="h-auto w-[clamp(2.5rem,5vw,3.75rem)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] max-sm:w-10"
      >
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    </button>

    <!-- Main Content Container -->
    <div class="container">
      <slot />
    </div>

    <div class="footer">
      <div v-if="isDev" class="version-tag">v{{ appVersion }} ({{ environment }})</div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Game Layout
 * Standard layout for game pages with background and back button
 */
const config = useRuntimeConfig()
const { baseUrl } = config.public
const router = useRouter()

// App version and environment for dev footer
const appVersion = config.public.appVersion
const environment = config.public.environment
const isDev = environment === 'development'

// Layout state
const backgroundImage = ref<string | null>(null)
const backButtonImage = ref<string>(`${baseUrl}assets/players/back.png`)
const showBackButton = ref(true)
const onBackCallback = ref<(() => void) | null>(null)

// Provide methods for pages to customize layout
provide('setBackground', (src: string) => {
  backgroundImage.value = src
})

<<<<<<< Updated upstream
<<<<<<< Updated upstream
provide('setBackButton', (config: { visible?: boolean; image?: string; onBack?: () => void }) => {
  if (config.visible !== undefined) showBackButton.value = config.visible
  if (config.image) backButtonImage.value = config.image
  if (config.onBack) onBackCallback.value = config.onBack
})
=======
=======
>>>>>>> Stashed changes
provide('setBackButton', (config: { visible?: boolean, image?: string, onBack?: () => void }) => {
  if (config.visible !== undefined) showBackButton.value = config.visible;
  if (config.image) backButtonImage.value = config.image;
  if (config.onBack) onBackCallback.value = config.onBack;
});
>>>>>>> Stashed changes

// Handle back button click
const handleBack = () => {
  if (onBackCallback.value) {
    onBackCallback.value()
  } else {
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
