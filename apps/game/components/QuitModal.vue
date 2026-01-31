<template>
  <Transition name="quit-fade">
    <div v-if="visible" class="quit-overlay" @click.self="handleNo">
      <div class="quit-modal">
        <!-- Title Bar -->
        <div class="quit-title-bar">
          <span class="quit-title text-embossed-white">{{ t('game.quitGame') }}</span>
        </div>

        <!-- Body -->
        <div class="quit-body">
          <!-- Message -->
          <p class="quit-message">{{ t('game.quitConfirmation') }}</p>

          <!-- Action Buttons -->
          <div class="quit-actions">
            <button class="quit-btn quit-btn--no tap-highlight no-select" @click="handleNo">
              {{ t('common.no') }}
            </button>
            <button class="quit-btn quit-btn--yes tap-highlight no-select" @click="handleYes">
              {{ t('common.yes') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { t } = usePageSetup()
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
  padding: var(--spacing-lg);
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
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius-xl);
  border: 3px solid var(--color-border-gold);
  box-shadow:
    0 0 20px rgba(255, 213, 79, 0.3),
    0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
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

/* Red title bar matching mockup */
.quit-title-bar {
  background: var(--bg-gradient-btn-red);
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
  border-bottom: 2px solid rgba(0, 0, 0, 0.15);
}

.quit-title {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Cream/panel body matching mockup */
.quit-body {
  background: var(--bg-gradient-panel);
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md);
  text-align: center;
}

.quit-message {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  color: var(--color-text-dark);
  text-shadow: var(--text-shadow-embossed-dark);
  margin: 0 0 var(--spacing-lg);
  line-height: 1.3;
}

.quit-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.quit-btn {
  flex: 1;
  max-width: 140px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-lg);
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-white);
  text-shadow: var(--text-shadow-embossed-white);
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow:
    0 4px 0 rgba(0, 0, 0, 0.2),
    0 6px 12px rgba(0, 0, 0, 0.3);
}

.quit-btn:active {
  transform: translateY(2px) scale(0.98);
  box-shadow:
    0 2px 0 rgba(0, 0, 0, 0.2),
    0 3px 6px rgba(0, 0, 0, 0.3);
}

/* Red NO button */
.quit-btn--no {
  background: var(--bg-gradient-btn-red);
  border-color: var(--color-btn-red-shadow);
}

/* Green YES button */
.quit-btn--yes {
  background: var(--bg-gradient-btn-green);
  border-color: var(--color-btn-green-shadow);
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

@media (max-width: 640px) {
  .quit-modal {
    max-width: calc(100vw - var(--spacing-lg) * 2);
  }
}
</style>
