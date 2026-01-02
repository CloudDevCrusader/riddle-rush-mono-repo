<template>
  <Transition name="quit-fade">
    <div
      v-if="visible"
      class="quit-overlay"
      @click.self="handleNo"
    >
      <div class="quit-modal">
        <!-- Background Image -->
        <img
          :src="`${baseUrl}assets/quit/BACKGROUND.png`"
          alt="Background"
          class="quit-bg"
        >

        <!-- Back Button -->
        <button
          class="back-btn tap-highlight no-select"
          @click="handleNo"
        >
          <img
            :src="`${baseUrl}assets/quit/back.png`"
            alt="Back"
          >
        </button>

        <!-- Title -->
        <div class="title-container">
          <img
            :src="`${baseUrl}assets/quit/QUIT GAME.png`"
            alt="Quit Game"
            class="title-image"
          >
        </div>

        <!-- Message -->
        <div class="message-container">
          <img
            :src="`${baseUrl}assets/quit/Are you sure you want  to quit game_.png`"
            alt="Are you sure you want to quit game?"
            class="message-image"
          >
        </div>

        <!-- Action Buttons -->
        <div class="actions-container">
          <!-- Yes Button -->
          <button
            class="action-btn yes-btn tap-highlight no-select"
            @click="handleYes"
          >
            <img
              :src="`${baseUrl}assets/quit/yes.png`"
              alt="Yes"
            >
          </button>

          <!-- No Button -->
          <button
            class="action-btn no-btn tap-highlight no-select"
            @click="handleNo"
          >
            <img
              :src="`${baseUrl}assets/quit/no.png`"
              alt="No"
            >
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { baseUrl } = usePageSetup()
const { goHome } = useNavigation()
const { gameStore } = useGameState()
const audio = useAudio()

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleYes = async () => {
  audio.playClick()
  // Abandon the current game session
  if (gameStore.hasActiveSession) {
    await gameStore.abandonGame()
  }
  emit('confirm')
  goHome()
}

const handleNo = () => {
  audio.playClick()
  emit('cancel')
}
</script>

<style scoped>
.quit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(var(--spacing-lg), env(safe-area-inset-top, 0px)) 
           max(var(--spacing-lg), env(safe-area-inset-right, 0px))
           max(var(--spacing-lg), env(safe-area-inset-bottom, 0px))
           max(var(--spacing-lg), env(safe-area-inset-left, 0px));
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.quit-modal {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.3s ease-out;
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

.quit-bg {
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

.title-container {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-xl) var(--spacing-xl);
}

.title-image {
  width: clamp(250px, 40vw, 400px);
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.message-container {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: 0 var(--spacing-xl) var(--spacing-2xl);
}

.message-image {
  width: clamp(200px, 35vw, 350px);
  height: auto;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.actions-container {
  position: relative;
  z-index: 2;
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-xl) var(--spacing-3xl);
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
  width: 100%;
  max-width: 200px;
}

.action-btn img {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn:active {
  transform: translateY(0) scale(0.98);
}

/* Transitions */
.quit-fade-enter-active,
.quit-fade-leave-active {
  transition: opacity 0.3s ease;
}

.quit-fade-enter-from,
.quit-fade-leave-to {
  opacity: 0;
}

/* Responsive - Optimized for Pixel 7 Pro */
@media (max-width: 640px) {
  .quit-overlay {
    padding: max(var(--spacing-md), env(safe-area-inset-top, 0px))
             max(var(--spacing-md), env(safe-area-inset-right, 0px))
             max(var(--spacing-md), env(safe-area-inset-bottom, 0px))
             max(var(--spacing-md), env(safe-area-inset-left, 0px));
  }

  .quit-modal {
    max-width: calc(100vw - max(var(--spacing-md), env(safe-area-inset-right, 0px)) * 2);
    max-height: calc(100vh - max(var(--spacing-md), env(safe-area-inset-top, 0px)) - max(var(--spacing-md), env(safe-area-inset-bottom, 0px)));
    width: 100%;
    box-sizing: border-box;
  }

  .back-btn {
    top: max(var(--spacing-md), env(safe-area-inset-top, 0px) + var(--spacing-xs));
    left: max(var(--spacing-md), env(safe-area-inset-left, 0px) + var(--spacing-xs));
  }

  .title-image {
    width: clamp(220px, 60vw, 280px);
  }

  .message-image {
    width: clamp(180px, 55vw, 240px);
  }

  .action-btn {
    max-width: min(180px, calc(50% - var(--spacing-md)));
    min-width: 140px;
  }

  .back-btn img {
    width: clamp(36px, 8vw, 48px);
    min-width: 36px;
  }

  .actions-container {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    justify-content: center;
  }

  .title-container {
    padding: var(--spacing-2xl) var(--spacing-lg) var(--spacing-lg);
  }

  .message-container {
    padding: 0 var(--spacing-lg) var(--spacing-xl);
  }
}

/* Pixel 7 Pro specific (412px width, tall screen) */
@media (max-width: 450px) and (min-height: 800px) {
  .quit-modal {
    max-width: calc(100vw - max(var(--spacing-lg), env(safe-area-inset-right, 0px)) * 2);
    max-height: calc(100vh - max(var(--spacing-lg), env(safe-area-inset-top, 0px)) - max(var(--spacing-lg), env(safe-area-inset-bottom, 0px)));
  }

  .title-image {
    width: clamp(240px, 65vw, 300px);
  }

  .message-image {
    width: clamp(200px, 60vw, 260px);
  }

  .action-btn {
    max-width: min(200px, calc(50% - var(--spacing-lg)));
    min-width: 160px;
  }

  .actions-container {
    gap: var(--spacing-lg);
  }
}
</style>
