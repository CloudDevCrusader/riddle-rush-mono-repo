<template>
  <div class="game-page">
    <!-- Background -->
    <div class="game-bg" />

    <!-- Header -->
    <header class="game-header">
      <button
        data-testid="back-button"
        class="back-btn tap-highlight no-select"
        @click="goHome"
      >
        <span>←</span>
      </button>

      <div
        class="score-display"
        data-testid="score-display"
      >
        <div class="score-item">
          <span class="score-label">{{ $t('game.score') }}</span>
          <span
            class="score-value"
            data-testid="score-value"
          >{{ gameStore.currentScore }}</span>
        </div>
        <div class="score-divider" />
        <div class="score-item">
          <span class="score-label">{{ $t('game.attempts') }}</span>
          <span
            class="score-value"
            data-testid="attempts-value"
          >{{ gameStore.currentAttempts.length }}</span>
        </div>
      </div>

      <button
        data-testid="menu-button"
        class="menu-btn tap-highlight no-select"
        @click="showMenu = !showMenu"
      >
        <span>⋮</span>
      </button>
    </header>

    <!-- Main Game Area -->
    <div class="game-container">
      <!-- Category Card -->
      <div class="category-display animate-scale-in">
        <div class="category-badge">
          <span class="category-emoji">{{ categoryEmoji }}</span>
        </div>
        <h2
          class="category-title"
          data-testid="category-name"
        >
          {{ currentCategory?.name || $t('game.category_loading') }}
        </h2>
        <div class="letter-display">
          <span class="letter-label">{{ $t('game.starts_with') }}</span>
          <span
            class="letter-value"
            data-testid="letter-value"
          >{{ currentLetter ? currentLetter.toUpperCase() : '' }}</span>
        </div>
      </div>

      <!-- Input Card -->
      <div class="input-card animate-slide-up">
        <form
          class="answer-form"
          @submit.prevent="validateWord"
        >
          <div class="input-wrapper">
            <input
              id="term"
              ref="answerInput"
              v-model="result"
              type="text"
              data-testid="answer-input"
              class="answer-input tap-highlight"
              :placeholder="$t('game.your_answer')"
              :disabled="loading || !currentCategory"
              autocomplete="off"
              autocapitalize="words"
            >
            <button
              type="submit"
              data-testid="submit-answer-button"
              class="submit-btn tap-highlight no-select"
              :disabled="loading || !result.trim()"
              :class="{ loading }"
            >
              <span
                v-if="!loading"
                class="submit-icon"
              >✓</span>
              <span
                v-else
                class="loading-spinner"
              />
            </button>
          </div>
        </form>
      </div>

      <!-- Feedback Display -->
      <transition name="feedback">
        <div
          v-if="output"
          class="feedback-card"
          :class="feedbackClass"
        >
          <div class="feedback-icon">
            {{ feedbackIcon }}
          </div>
          <p class="feedback-text">
            {{ output }}
          </p>
        </div>
      </transition>

      <!-- Other Answers -->
      <transition name="slide-up">
        <div
          v-if="otherAnswers.length > 0"
          class="other-answers-card"
        >
          <h3 class="other-answers-title">
            {{ $t('game.other_answers') }}
          </h3>
          <div class="answers-grid">
            <div
              v-for="(answer, index) in otherAnswers"
              :key="answer"
              class="answer-chip"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              {{ answer }}
            </div>
          </div>
        </div>
      </transition>

      <!-- Attempts List -->
      <div
        v-if="gameStore.currentAttempts.length > 0"
        class="attempts-section"
      >
        <h3 class="attempts-title">
          {{ $t('game.your_attempts') }}
        </h3>
        <div class="attempts-list">
          <div
            v-for="(attempt, index) in gameStore.currentAttempts.slice().reverse()"
            :key="index"
            class="attempt-item"
            :class="{ correct: attempt.found }"
          >
            <span class="attempt-text">{{ attempt.term }}</span>
            <span class="attempt-icon">{{ attempt.found ? '✓' : '✗' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button
        data-testid="skip-button"
        class="btn btn-outline tap-highlight no-select"
        :disabled="loading"
        @click="skipQuestion"
      >
        <span>{{ $t('game.skip') }}</span>
        <span class="btn-icon">→</span>
      </button>
      <button
        data-testid="new-round-button"
        class="btn btn-secondary tap-highlight no-select"
        :disabled="loading"
        @click="startGame"
      >
        <span>{{ $t('game.new_round') }}</span>
        <span class="btn-icon">↻</span>
      </button>
    </div>

    <!-- Menu Overlay -->
    <transition name="fade">
      <div
        v-if="showMenu"
        class="menu-overlay"
        @click="showMenu = false"
      >
        <div
          class="menu-card"
          @click.stop
        >
          <h3 class="menu-title">
            {{ $t('menu.title') }}
          </h3>
          <button
            class="menu-item tap-highlight"
            @click="endGame"
          >
            <span class="menu-icon">🏁</span>
            <span>{{ $t('menu.end_game') }}</span>
          </button>
          <button
            class="menu-item tap-highlight"
            @click="goHome"
          >
            <span class="menu-icon">🏠</span>
            <span>{{ $t('menu.home') }}</span>
          </button>
          <button
            class="menu-item tap-highlight"
            @click="shareScore"
          >
            <span class="menu-icon">📤</span>
            <span>{{ $t('menu.share_score') }}</span>
          </button>
          <button
            class="menu-item menu-close tap-highlight"
            @click="showMenu = false"
          >
            <span>{{ $t('menu.close') }}</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { CheckAnswerResponse } from '~/types/game'
import { useGameStore } from '~/stores/game'

const gameStore = useGameStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const audio = useAudio()

const result = ref('')
const output = ref('')
const otherAnswers = ref<string[]>([])
const loading = ref(false)
const valid = ref(false)
const showMenu = ref(false)
const answerInput = ref<HTMLInputElement | null>(null)

const currentCategory = computed(() => gameStore.currentCategory)
const currentLetter = computed(() => gameStore.currentLetter)
const categoryEmoji = computed(() => gameStore.categoryEmoji(currentCategory.value?.name))

const feedbackClass = computed(() => (valid.value ? 'correct' : 'incorrect'))
const feedbackIcon = computed(() => (valid.value ? '🎉' : '😕'))

const resetRoundState = () => {
  output.value = ''
  result.value = ''
  otherAnswers.value = []
  valid.value = false
}

const focusInput = () => {
  nextTick(() => {
    answerInput.value?.focus()
  })
}

const initializeGame = async (categoryId?: number) => {
  resetRoundState()
  loading.value = true

  try {
    await gameStore.startNewGame({ categoryId })
    audio.playNewRound()
    focusInput()
  } catch (error) {
    console.error('Error starting game:', error)
    output.value = t('game.error_checking')
  } finally {
    loading.value = false
  }
}

const resumeGameOnMount = async () => {
  const rawCategoryParam = Array.isArray(route.query.categoryId)
    ? route.query.categoryId[0]
    : route.query.categoryId

  const parsedCategoryId = rawCategoryParam !== undefined ? Number(rawCategoryParam) : undefined
  const categoryId = typeof parsedCategoryId === 'number' && !Number.isNaN(parsedCategoryId)
    ? parsedCategoryId
    : undefined
  const hadSession = gameStore.hasActiveSession

  try {
    await gameStore.resumeOrStartNewGame({ categoryId })
    resetRoundState()

    if (!hadSession || typeof categoryId === 'number') {
      audio.playNewRound()
    }

    focusInput()

    if (typeof categoryId === 'number') {
      await router.replace({ path: '/game' })
    }
  } catch (error) {
    console.error('Error resuming game:', error)
    output.value = t('game.error_checking')
  }
}

const startGame = async () => {
  await initializeGame()
}

const skipQuestion = async () => {
  await initializeGame()
}

const validateWord = async () => {
  const category = currentCategory.value
  const letter = currentLetter.value
  const term = result.value.trim()

  if (!category || !letter || !term) return

  try {
    loading.value = true

    const response = await $fetch<CheckAnswerResponse>('/api/check-answer', {
      method: 'POST',
      body: {
        letter,
        term,
        searchWord: category.searchWord,
      },
    })

    valid.value = response.found
    otherAnswers.value = response.other || []

    await gameStore.submitAttempt(term, response.found)

    if (response.found) {
      output.value = t('game.correct')
      audio.playSuccess()
    } else {
      output.value = t('game.incorrect')
      audio.playError()
    }

    result.value = ''

    setTimeout(() => {
      output.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error validating word:', error)
    output.value = t('game.error_checking')
  } finally {
    loading.value = false
  }
}

const endGame = async () => {
  await gameStore.endGame()
  router.push('/')
}

const goHome = () => {
  router.push('/')
}

const shareScore = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: t('share.score_title'),
        text: t('share.score_text', { score: gameStore.currentScore }),
        url: window.location.origin,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }
}

onMounted(async () => {
  await resumeGameOnMount()
})

useHead({
  title: () => `${t('app.title')} - ${t('game.title', 'Spielen')}`,
  meta: [
    {
      name: 'description',
      content: () => t('app.description'),
    },
  ],
})
</script>

<style scoped>
.game-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-gradient-cool);
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.game-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* Header */
.game-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
}

.back-btn,
.menu-btn {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-white);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.back-btn:active,
.menu-btn:active {
  transform: scale(0.95);
}

.score-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  background: var(--color-white);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.score-value {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.score-divider {
  width: 2px;
  height: 32px;
  background: var(--color-light);
}

/* Game Container */
.game-container {
  flex: 1;
  position: relative;
  padding: var(--spacing-xl) var(--spacing-md);
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Category Display */
.category-display {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.category-badge {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-lg);
  background: var(--color-secondary-gradient);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.category-emoji {
  font-size: 48px;
}

.category-title {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
  margin: 0 0 var(--spacing-lg) 0;
}

.letter-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.letter-label {
  font-size: var(--font-size-base);
  color: var(--color-gray);
  font-weight: var(--font-weight-medium);
}

.letter-value {
  font-family: var(--font-display);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-black);
  color: var(--color-primary);
  width: 64px;
  height: 64px;
  background: var(--color-primary-gradient);
  color: var(--color-white);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

/* Input Card */
.input-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
}

.input-wrapper {
  display: flex;
  gap: var(--spacing-md);
}

.answer-input {
  flex: 1;
  padding: var(--spacing-lg);
  font-family: var(--font-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  border: 2px solid var(--color-light);
  border-radius: var(--radius-md);
  background: var(--color-light);
  transition: all var(--transition-base);
}

.answer-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-white);
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
}

.answer-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-primary-gradient);
  color: var(--color-white);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
}

.submit-btn:not(:disabled):active {
  transform: scale(0.95);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-icon {
  display: block;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--color-white);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Feedback Card */
.feedback-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
}

.feedback-card.correct {
  background: var(--bg-gradient-success);
  color: var(--color-white);
}

.feedback-card.incorrect {
  background: var(--bg-gradient-error);
  color: var(--color-white);
}

.feedback-icon {
  font-size: 48px;
}

.feedback-text {
  flex: 1;
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

/* Transitions */
.feedback-enter-active {
  animation: scaleIn var(--transition-base) ease-out;
}

.feedback-leave-active {
  animation: scaleIn var(--transition-base) ease-out reverse;
}

/* Other Answers */
.other-answers-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.other-answers-title {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-dark);
  margin: 0 0 var(--spacing-md) 0;
  text-align: center;
}

.answers-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
}

.answer-chip {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-secondary-gradient);
  color: var(--color-white);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  animation: scaleIn var(--transition-base) ease-out backwards;
}

.slide-up-enter-active {
  animation: slideInUp var(--transition-slow) ease-out;
}

.slide-up-leave-active {
  animation: slideInUp var(--transition-slow) ease-out reverse;
}

/* Attempts */
.attempts-section {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  max-height: 300px;
  overflow-y: auto;
}

.attempts-title {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-dark);
  margin: 0 0 var(--spacing-md) 0;
  text-align: center;
}

.attempts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.attempt-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.attempt-item.correct {
  background: rgba(46, 204, 113, 0.1);
  border-left: 4px solid var(--color-accent-green);
}

.attempt-text {
  font-weight: var(--font-weight-medium);
  color: var(--color-dark);
}

.attempt-icon {
  font-size: 20px;
}

/* Action Buttons */
.action-buttons {
  position: relative;
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
}

.action-buttons .btn {
  flex: 1;
}

/* Menu Overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.menu-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  animation: scaleIn var(--transition-base) ease-out;
}

.menu-title {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
  margin: 0 0 var(--spacing-xl) 0;
  text-align: center;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-light);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-dark);
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: var(--spacing-sm);
}

.menu-item:last-child {
  margin-bottom: 0;
}

.menu-item:hover {
  background: var(--color-gray-light);
  transform: translateX(4px);
}

.menu-item:active {
  transform: translateX(2px);
}

.menu-icon {
  font-size: 24px;
}

.menu-close {
  background: var(--color-primary);
  color: var(--color-white);
  margin-top: var(--spacing-lg);
  justify-content: center;
}

.menu-close:hover {
  background: var(--color-primary-dark);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .score-display {
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .score-value {
    font-size: var(--font-size-xl);
  }
}
</style>
