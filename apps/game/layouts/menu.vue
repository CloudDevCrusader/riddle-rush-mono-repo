<template>
  <div
    class="relative min-h-dvh min-h-screen overflow-hidden bg-[#1a1a2e] pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
  >
    <!-- Background Image -->
    <img v-if="backgroundImage" :src="backgroundImage" alt="Background" class="page-bg-cover" />

    <!-- Main Content Container -->
    <div
      class="relative z-20 box-border flex min-h-dvh min-h-screen w-full max-w-full flex-col items-center justify-center gap-2xl px-sm py-2xl sm:gap-3xl sm:px-md sm:py-3xl"
    >
      <slot />
    </div>

    <!-- Menu Toggle Button (bottom right) -->
    <button
      v-if="showMenuButton"
      class="tap-highlight no-select absolute right-md bottom-lg z-10 cursor-pointer border-none bg-transparent p-0 transition-transform active:scale-95 sm:right-xl sm:bottom-xl"
      type="button"
      @click="toggleMenu"
    >
      <img
        :src="menuButtonImage"
        alt="Menu"
        class="h-auto w-[clamp(3.125rem,6vw,4.375rem)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] max-sm:w-[3.125rem]"
      />
    </button>

    <!-- Menu Panel Slot -->
    <transition name="menu-fade">
      <slot v-if="isMenuOpen" name="menu" :close-menu="closeMenu" />
    </transition>
  </div>
</template>

<script setup lang="ts">
/**
 * Menu Layout
 * Layout for main menu pages with menu toggle button
 */
const { getAssetPath } = useAssets();

// Layout state
const backgroundImage = ref<string | null>(null);
const menuButtonImage = ref<string>(getAssetPath('assets/main-menu/menu.png'));
const showMenuButton = ref(true);
const isMenuOpen = ref(false);

// Provide methods for pages to customize layout
provide('setBackground', (src: string) => {
  backgroundImage.value = src;
});

provide('setMenuButton', (config: { visible?: boolean; image?: string }) => {
  if (config.visible !== undefined) showMenuButton.value = config.visible;
  if (config.image) menuButtonImage.value = config.image;
});

provide('menuState', {
  isOpen: readonly(isMenuOpen),
  open: () => {
    isMenuOpen.value = true;
  },
  close: () => {
    isMenuOpen.value = false;
  },
  toggle: () => {
    isMenuOpen.value = !isMenuOpen.value;
  },
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<style scoped>
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.3s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
</style>
