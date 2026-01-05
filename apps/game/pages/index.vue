<template>
  <div class="menu-page">
    <!-- Background Image -->
    <img :src="`${baseUrl}assets/main-menu/BACKGROUND.png`" alt="Background" class="page-bg" />

    <!-- Main Container -->
    <div class="container">
      <!-- Logo -->
      <div class="logo-container animate-fade-in">
        <img :src="`${baseUrl}assets/main-menu/LOGO.png`" alt="Logo" class="logo-image" />
      </div>

      <!-- Menu Buttons -->
      <div v-show="!showMenu" class="menu-buttons animate-slide-up">
        <!-- Play Button -->
        <button
          class="menu-btn play-btn tap-highlight no-select"
          aria-label="Play Game"
          @click="handlePlay"
        >
          <img :src="`${baseUrl}assets/main-menu/PLAY.png`" alt="Play" class="btn-image" />
          <img
            :src="`${baseUrl}assets/main-menu/PLAY-1.png`"
            alt="Play hover"
            class="btn-image-hover"
          />
        </button>

        <!-- Options Button -->
        <button class="menu-btn options-btn tap-highlight no-select" @click="wrappedGoToSettings">
          <img :src="`${baseUrl}assets/main-menu/OPTIONS.png`" alt="Options" class="btn-image" />
          <img
            :src="`${baseUrl}assets/main-menu/OPTION.png`"
            alt="Options hover"
            class="btn-image-hover"
          />
        </button>

        <!-- Credits Button -->
        <button class="menu-btn credits-btn tap-highlight no-select" @click="wrappedGoToCredits">
          <img :src="`${baseUrl}assets/main-menu/CREDITS.png`" alt="Credits" class="btn-image" />
          <img
            :src="`${baseUrl}assets/main-menu/CREDITS-1.png`"
            alt="Credits hover"
            class="btn-image-hover"
          />
        </button>
      </div>

      <!-- Menu Panel (when toggled) -->
      <transition name="menu-fade">
        <div v-if="showMenu" class="menu-panel animate-scale-in">
          <button
            class="menu-item tap-highlight no-select"
            aria-label="Play Game"
            @click="handlePlay"
          >
            <span>🎮</span>
            <span>{{ $t('menu.play', 'Play') }}</span>
          </button>
          <button
            class="menu-item tap-highlight no-select"
            aria-label="Change Language"
            @click="wrappedGoToLanguage"
          >
            <span>🌐</span>
            <span>{{ $t('menu.language', 'Language') }}</span>
          </button>
          <button
            class="menu-item tap-highlight no-select"
            aria-label="Open Settings"
            @click="wrappedGoToSettings"
          >
            <span>⚙️</span>
            <span>{{ $t('menu.settings', 'Settings') }}</span>
          </button>
          <button
            class="menu-item tap-highlight no-select"
            aria-label="View Credits"
            @click="wrappedGoToCredits"
          >
            <span>📖</span>
            <span>{{ $t('menu.credits', 'Credits') }}</span>
          </button>
        </div>
      </transition>
    </div>

    <!-- Menu Toggle Button (bottom right) -->
    <button class="menu-icon-btn tap-highlight no-select" @click="toggleMenu">
      <img :src="`${baseUrl}assets/main-menu/MENU.png`" alt="Menu" class="menu-icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
const { router, baseUrl, toast, t } = usePageSetup()
const { goToPlayers, goToSettings, goToCredits, goToLanguage } = useNavigation()
const route = useRoute()

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

onMounted(() => {
  if (route.query.needsGame === 'true') {
    toast.warning(t('game.no_active_session', 'Please start a game first'))
    router.replace({ query: {} })
  }
})

const handlePlay = () => {
  showMenu.value = false
  goToPlayers()
}

const wrappedGoToSettings = () => {
  showMenu.value = false
  goToSettings()
}

const wrappedGoToCredits = () => {
  showMenu.value = false
  goToCredits()
}

const wrappedGoToLanguage = () => {
  showMenu.value = false
  goToLanguage()
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

.menu-btn:active {
  opacity: 0.8;
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

.menu-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 4px solid #ffaa00;
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow:
    0 12px 0 rgba(0, 0, 0, 0.2),
    var(--shadow-xl);
  min-width: 250px;
  max-width: 400px;
  width: 100%;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-light);
  border: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: var(--spacing-md);
  text-align: left;
}

.menu-item:last-child {
  margin-bottom: 0;
}

.menu-item:hover {
  background: var(--color-primary);
  color: var(--color-white);
  transform: translateX(4px);
}

.menu-item:active {
  transform: translateX(2px);
}

.menu-item span:first-child {
  font-size: 24px;
}

.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate3d(0, -20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate3d(0, 30px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.3s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .container {
    padding: var(--spacing-2xl) var(--spacing-md);
    gap: var(--spacing-2xl);
  }

  .logo-image {
    width: clamp(200px, 40vw, 380px);
  }

  .menu-buttons {
    max-width: 100%;
    gap: var(--spacing-md);
  }

  .menu-icon {
    width: clamp(44px, 6vw, 60px);
  }

  .menu-panel {
    width: 100%;
    max-width: 350px;
    padding: var(--spacing-xl);
  }

  .menu-item {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
    font-size: clamp(var(--font-size-base), 2.5vw, var(--font-size-lg));
  }

  .menu-item span:first-child {
    font-size: clamp(18px, 4vw, 24px);
  }
}

@media (max-width: 480px) {
  .container {
    padding: var(--spacing-xl) var(--spacing-sm);
    gap: var(--spacing-xl);
  }

  .logo-image {
    width: clamp(150px, 35vw, 250px);
    margin-top: calc(var(--spacing-xl) * -1);
  }

  .menu-buttons {
    width: 100%;
    gap: var(--spacing-sm);
  }

  .menu-btn {
    width: 100%;
  }

  .menu-icon-btn {
    bottom: var(--spacing-md);
    right: var(--spacing-md);
  }

  .menu-icon {
    width: clamp(40px, 5vw, 50px);
  }

  .menu-panel {
    width: calc(100% - var(--spacing-sm) * 2);
    max-width: 280px;
    padding: var(--spacing-lg);
    min-width: auto;
  }

  .menu-item {
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-md);
    font-size: clamp(var(--font-size-sm), 2vw, var(--font-size-base));
    margin-bottom: var(--spacing-sm);
  }

  .menu-item:last-child {
    margin-bottom: 0;
  }

  .menu-item span:first-child {
    font-size: clamp(16px, 3.5vw, 20px);
  }
}
</style>
