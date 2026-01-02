<template>
  <div class="menu-layout">
    <!-- Background Image -->
    <img
      v-if="backgroundImage"
      :src="backgroundImage"
      alt="Background"
      class="page-bg"
    >

    <!-- Main Content Container -->
    <div class="container">
      <slot />
    </div>

    <!-- Menu Toggle Button (bottom right) -->
    <button
      v-if="showMenuButton"
      class="menu-icon-btn tap-highlight no-select"
      @click="toggleMenu"
    >
      <img
        :src="menuButtonImage"
        alt="Menu"
        class="menu-icon"
      >
    </button>

    <!-- Menu Panel Slot -->
    <transition name="menu-fade">
      <slot
        v-if="isMenuOpen"
        name="menu"
        :close-menu="closeMenu"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
/**
 * Menu Layout
 * Layout for main menu pages with menu toggle button
 */
const { baseUrl } = useRuntimeConfig().public

// Layout state
const backgroundImage = ref<string | null>(null)
const menuButtonImage = ref<string>(`${baseUrl}assets/main-menu/MENU.png`)
const showMenuButton = ref(true)
const isMenuOpen = ref(false)

// Provide methods for pages to customize layout
provide('setBackground', (src: string) => {
  backgroundImage.value = src
})

provide('setMenuButton', (config: {
  visible?: boolean
  image?: string
}) => {
  if (config.visible !== undefined) showMenuButton.value = config.visible
  if (config.image) menuButtonImage.value = config.image
})

provide('menuState', {
  isOpen: readonly(isMenuOpen),
  open: () => { isMenuOpen.value = true },
  close: () => { isMenuOpen.value = false },
  toggle: () => { isMenuOpen.value = !isMenuOpen.value },
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<style scoped>
.menu-layout {
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
  gap: var(--spacing-3xl);
}

.menu-icon-btn {
  position: absolute;
  bottom: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: 3;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.menu-icon-btn:active {
  transform: scale(0.95);
}

.menu-icon {
  width: clamp(50px, 6vw, 70px);
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.3s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .container {
    padding: var(--spacing-2xl) var(--spacing-sm);
  }

  .menu-icon {
    width: 50px;
  }
}
</style>
