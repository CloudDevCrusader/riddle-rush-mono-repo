<template>
  <div class="answer-input-section">
    <div class="player-turn-indicator">
      <span class="turn-label">{{ t('game.current_turn', 'Current Turn') }}:</span>
      <span class="turn-name">{{ currentPlayer.name }}</span>
    </div>
    <form class="answer-form" @submit.prevent="handleSubmit">
      <input
        v-model="inputValue"
        type="text"
        class="answer-input"
        :placeholder="t('game.your_answer', 'Your answer...')"
        autocomplete="off"
        autocapitalize="words"
        maxlength="50"
        data-testid="answer-input"
        @input="sanitizeInput"
        @keyup.enter="handleSubmit"
      />
      <GameButton
        type="submit"
        variant="primary"
        size="md"
        full-width
        data-testid="submit-answer-btn"
      >
        {{ t('game.submit', 'Submit') }}
      </GameButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '@riddle-rush/types'

interface Props {
  currentPlayer: Player
}

defineProps<Props>()

const emit = defineEmits<{
  submit: [answer: string]
}>()

const { t } = useI18n()
const inputValue = ref('')

/**
 * Sanitize input to prevent XSS and limit special characters.
 * Direct mutation is faster than debouncing for simple sanitization.
 */
const sanitizeInput = () => {
  // Remove potentially dangerous characters
  inputValue.value = inputValue.value.replace(/[<>]/g, '')
  // Limit length (backup for maxlength attribute)
  if (inputValue.value.length > 50) {
    inputValue.value = inputValue.value.slice(0, 50)
  }
}

const handleSubmit = () => {
  const answer = inputValue.value.trim()
  emit('submit', answer)
  inputValue.value = ''
}

// Expose for testing
defineExpose({
  inputValue,
  sanitizeInput,
  handleSubmit,
})
</script>

<style scoped>
.answer-input-section {
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  border: 4px solid #ffaa00;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow:
    0 8px 0 rgba(0, 0, 0, 0.15),
    var(--shadow-lg);
}

.player-turn-indicator {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.turn-label {
  font-family: var(--font-display);
  font-size: clamp(0.9rem, 2vw, 1.2rem);
  font-weight: var(--font-weight-semibold);
  color: var(--color-dark);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.turn-name {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  display: block;
}

.answer-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.answer-input {
  width: 100%;
  padding: var(--spacing-lg);
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  font-weight: var(--font-weight-semibold);
  border: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-dark);
  text-align: center;
  transition: all var(--transition-base);
}

.answer-input:focus {
  outline: none;
  border-color: #ffaa00;
  box-shadow: 0 0 0 4px rgba(255, 170, 0, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .answer-input-section {
    max-width: calc(100% - var(--spacing-md) * 2);
  }
}

@media (max-width: 480px) {
  .answer-input-section {
    max-width: calc(100% - var(--spacing-sm) * 2);
    padding: var(--spacing-md);
  }

  .answer-input {
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    padding: var(--spacing-md);
  }
}
</style>
