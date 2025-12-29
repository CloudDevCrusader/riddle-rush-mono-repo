<template>
  <div class="menu-page">
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/main-menu/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
    >

    <!-- Top Bar -->
    <div class="top-bar">
      <!-- Coin Bar -->
      <div class="coin-bar">
        <img
          :src="`${baseUrl}assets/main-menu/COIN BAR.png`"
          alt="Coin bar"
          class="coin-bar-bg"
        >
        <img
          :src="`${baseUrl}assets/main-menu/100.png`"
          alt="Coins"
          class="coin-icon"
        >
        <span class="coin-amount">{{ coins }}</span>
      </div>

      <!-- Profile Icon -->
      <button
        class="profile-btn tap-highlight no-select"
        @click="goToProfile"
      >
        <img
          :src="`${baseUrl}assets/main-menu/profile icon  (Double Click to edit smart object).png`"
          alt="Profile"
          class="profile-icon"
        >
      </button>
    </div>

    <!-- Main Container -->
    <div class="container">
      <!-- Logo -->
      <div class="logo-container animate-fade-in">
        <img
          :src="`${baseUrl}assets/main-menu/LOGO.png`"
          alt="Logo"
          class="logo-image"
        >
      </div>

      <!-- Menu Buttons -->
      <div class="menu-buttons animate-slide-up">
        <!-- Play Button -->
        <button
          class="menu-btn play-btn tap-highlight no-select"
          @click="handlePlay"
        >
          <img
            :src="`${baseUrl}assets/main-menu/PLAY.png`"
            alt="Play"
            class="btn-image"
          >
          <img
            :src="`${baseUrl}assets/main-menu/PLAY-1.png`"
            alt="Play hover"
            class="btn-image-hover"
          >
        </button>

        <!-- Options Button -->
        <button
          class="menu-btn options-btn tap-highlight no-select"
          @click="goToSettings"
        >
          <img
            :src="`${baseUrl}assets/main-menu/OPTIONS.png`"
            alt="Options"
            class="btn-image"
          >
          <img
            :src="`${baseUrl}assets/main-menu/OPTION.png`"
            alt="Options hover"
            class="btn-image-hover"
          >
        </button>

        <!-- Credits Button -->
        <button
          class="menu-btn credits-btn tap-highlight no-select"
          @click="goToCredits"
        >
          <img
            :src="`${baseUrl}assets/main-menu/CREDITS.png`"
            alt="Credits"
            class="btn-image"
          >
          <img
            :src="`${baseUrl}assets/main-menu/CREDITS-1.png`"
            alt="Credits hover"
            class="btn-image-hover"
          >
        </button>

        <!-- Exit Button -->
        <button
          class="menu-btn exit-btn tap-highlight no-select"
          @click="handleExit"
        >
          <img
            :src="`${baseUrl}assets/main-menu/EXIT.png`"
            alt="Exit"
            class="btn-image"
          >
        </button>
      </div>
    </div>

    <!-- Menu Icon (bottom right) -->
    <button
      class="menu-icon-btn tap-highlight no-select"
      @click="toggleMenu"
    >
      <img
        :src="`${baseUrl}assets/main-menu/MENU.png`"
        alt="Menu"
        class="menu-icon"
      >
    </button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl

// Mock coin amount - replace with actual game store data
const coins = ref(100)

const handlePlay = () => {
  router.push('/players')
}

const goToSettings = () => {
  router.push('/settings')
}

const goToCredits = () => {
  router.push('/credits')
}

const goToProfile = () => {
  router.push('/profile')
}

const handleExit = () => {
  // Show quit confirmation dialog
  // For now, just go back
  if (confirm('Are you sure you want to exit?')) {
    window.close()
  }
}

const toggleMenu = () => {
  // Toggle menu options
  // TODO: Implement menu toggle functionality
}

useHead({
  title: 'Main Menu',
  meta: [
    {
      name: 'description',
      content: 'Game main menu',
    },
  ],
})
</script>

<style scoped>
.menu-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  background: #1a1a2e;
}

/* Background Image */
.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Top Bar */
.top-bar {
  position: absolute;
  top: var(--spacing-xl);
  left: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

/* Coin Bar */
.coin-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  min-width: 150px;
}

.coin-bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.coin-icon {
  position: relative;
  z-index: 2;
  width: clamp(20px, 3vw, 30px);
  height: auto;
}

.coin-amount {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-lg), 2vw, var(--font-size-xl));
  font-weight: var(--font-weight-black);
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Profile Button */
.profile-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.profile-btn:hover {
  transform: scale(1.1);
}

.profile-btn:active {
  transform: scale(0.95);
}

.profile-icon {
  width: clamp(50px, 6vw, 70px);
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

/* Container */
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

/* Logo */
.logo-container {
  display: flex;
  justify-content: center;
  margin-top: calc(var(--spacing-3xl) * -1);
}

.logo-image {
  width: clamp(250px, 40vw, 450px);
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4));
}

/* Menu Buttons */
.menu-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 400px;
}

.menu-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 100%;
  transition: transform var(--transition-base);
}

.menu-btn:hover {
  transform: translateY(-4px) scale(1.05);
}

.menu-btn:active {
  transform: translateY(-2px) scale(0.98);
}

.btn-image {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
  transition: opacity var(--transition-base);
}

.btn-image-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
  opacity: 0;
  transition: opacity var(--transition-base);
}

.menu-btn:hover .btn-image {
  opacity: 0;
}

.menu-btn:hover .btn-image-hover {
  opacity: 1;
}

/* Menu Icon (bottom right) */
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

.menu-icon-btn:hover {
  transform: scale(1.1);
}

.menu-icon-btn:active {
  transform: scale(0.95);
}

.menu-icon {
  width: clamp(50px, 6vw, 70px);
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out 0.3s backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .top-bar {
    top: var(--spacing-md);
    left: var(--spacing-md);
    right: var(--spacing-md);
  }

  .coin-bar {
    min-width: 120px;
    padding: var(--spacing-xs) var(--spacing-md);
  }

  .profile-icon {
    width: 50px;
  }

  .logo-image {
    width: 250px;
  }

  .menu-buttons {
    max-width: 320px;
    gap: var(--spacing-md);
  }

  .menu-icon {
    width: 50px;
  }

  .menu-icon-btn,
  .top-bar {
    bottom: var(--spacing-md);
    right: var(--spacing-md);
  }
}
</style>
