<template>
  <div
    class="relative min-h-dvh min-h-screen overflow-hidden bg-[#1a1a2e] pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
  >
    <!-- Background Image -->
    <img v-if="backgroundImage" :src="backgroundImage" alt="Background" class="page-bg-cover" />

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
      />
    </button>

    <!-- Main Content Container -->
    <div
      class="relative z-20 box-border flex min-h-dvh min-h-screen w-full max-w-full flex-col items-center justify-center gap-2xl px-sm py-2xl sm:px-md sm:py-3xl"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Game Layout
 * Standard layout for game pages with background and back button
 */
const { getAssetPath } = useAssets()
const router = useRouter()

// Layout state
const backgroundImage = ref<string | null>(null)
const backButtonImage = ref<string>(getAssetPath('assets/players/back.png'))
const showBackButton = ref(true)
const onBackCallback = ref<(() => void) | null>(null)

// Provide methods for pages to customize layout
provide('setBackground', (src: string) => {
  backgroundImage.value = src
})

provide('setBackButton', (config: { visible?: boolean; image?: string; onBack?: () => void }) => {
  if (config.visible !== undefined) showBackButton.value = config.visible
  if (config.image) backButtonImage.value = config.image
  if (config.onBack) onBackCallback.value = config.onBack
})

// Handle back button click
const handleBack = () => {
  if (onBackCallback.value) {
    onBackCallback.value()
  } else {
    router.back()
  }
}
</script>
