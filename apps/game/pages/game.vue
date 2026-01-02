<template>
  <div class="game-page">
    <!-- Background -->
    <div class="game-bg"></div>

    <!-- Top Bar -->
    <header class="game-header">
      <!-- Back Button -->
      <button
        data-testid="back-button"
        class="back-btn tap-highlight no-select"
        @click="handleBack"
      >
        <img
          src="/assets/alphabets/back.png"
          alt="Back"
          class="back-icon"
        />
      </button>

      <!-- Round Indicator -->
      <div class="round-indicator">
        <span class="round-text">
          ROUND {{ formattedRound }}
        </span>
      </div>

      <!-- Pause Button -->
      <button
        class="pause-btn tap-highlight no-select"
        aria-label="Pause game"
        @click="showPauseModal = true"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect
            x="6"
            y="4"
            width="4"
            height="16"
          />
          <rect
            x="14"
            y="4"
            width="4"
            height="16"
          />
        </svg>
      </button>
    </header>

    <!-- Main Game Area -->
    <div class="game-container">
      <!-- Category Panel -->
      <div class="category-panel">
        <img
          :src="`${baseUrl}assets/alphabets/CATEGORY.png`"
          alt="Category"
          class="category-label-image"
        />
        <div class="category-label">
          CATEGORY
        </div>
        <div class="category-name">
          {{ currentCategory?.name?.toUpperCase() || 'LOADING...' }}
        </div>
      </div>

      <!-- Large Letter Display -->
      <div class="letter-display">
        <span class="letter-value">
          {{ currentLetter ? currentLetter.toUpperCase() : 'A' }}
        </span>
      </div>

      <!-- Player Answer Input (for multiplayer) -->
      <div
        v-if="players.length > 0 && currentPlayerTurn && !allPlayersSubmitted"
        class="answer-input-section"
      >
        <div class="player-turn-indicator">
          <span class="turn-label">{{ $t('game.current_turn', 'Current Turn') }}:</span>
          <span class="turn-name">{{ currentPlayerTurn.name }}</span>
        </div>
        <form
          class="answer-form"
          @submit.prevent="submitAnswer"
        >
          <input
            v-model="playerAnswer"
            type="text"
            class="answer-input"
            :placeholder="$t('game.your_answer', 'Your answer...')"
            autocomplete="off"
            autocapitalize="words"
            maxlength="50"
            @input="sanitizeInput"
          />
          <button
            type="submit"
            class="submit-answer-btn"
            :disabled="!playerAnswer.trim()"
          >
            {{ $t('game.submit', 'Submit') }}
          </button>
        </form>
      </div>

      <!-- All Players Submitted Message -->
      <div
        v-if="allPlayersSubmitted"
        class="all-submitted-message"
      >
        <p>{{ $t('game.all_submitted', 'All players have submitted!') }}</p>
      </div>
    </div>

    <!-- Pause Modal (Lazy Loaded) -->
    <LazyPauseModal
      v-if="showPauseModal"
      :visible="showPauseModal"
      @resume="showPauseModal = false"
      @restart="handleRestart"
      @home="showPauseModal = false"
    />

    <!-- Quit Modal (Lazy Loaded) -->
    <LazyQuitModal
      v-if="showQuitModal"
      :visible="showQuitModal"
      @confirm="showQuitModal = false"
      @cancel="showQuitModal = false"
    />

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <button
        v-if="allPlayersSubmitted || players.length === 0"
        data-testid="next-button"
        class="next-btn btn-primary tap-highlight no-select"
        @click="handleNext"
      >
        <img
          src="/assets/alphabets/next.png"
          alt="Next"
          class="next-icon"
        />
        <span class="next-text">NEXT</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { baseUrl, toast, t, goHome: navigateToHome } = usePageSetup()
const { goToResults } = useNavigation()
const {
  gameStore,
  currentCategory,
  currentLetter,
  currentRound,
  players,
  currentPlayerTurn,
  allPlayersSubmitted,
} = useGameState()
const gameActions = useGameActions()

const playerAnswer = ref('')
const showPauseModal = ref(false)
const showQuitModal = ref(false)

const formattedRound = computed(() => {
  const round = currentRound.value || 1
  return round.toString().padStart(2, '0')
})

const goHome = () => {
  navigateToHome()
}

const handleBack = () => {
  if (gameStore.hasActiveSession) {
    showQuitModal.value = true
  }
  else {
    goHome()
  }
}

// Sanitize input to prevent XSS and limit special characters
const sanitizeInput = () => {
  // Remove potentially dangerous characters
  playerAnswer.value = playerAnswer.value.replace(/[<>]/g, '')
  // Limit length
  if (playerAnswer.value.length > 50) {
    playerAnswer.value = playerAnswer.value.slice(0, 50)
  }
}

const submitAnswer = async () => {
  const player = currentPlayerTurn.value
  if (!player || !playerAnswer.value.trim()) {
    return
  }

  try {
    await gameStore.submitPlayerAnswer(player.id, playerAnswer.value.trim())
    toast.success(t('game.answer_submitted', `Answer submitted for ${player.name}`))
    playerAnswer.value = ''

    // If all players submitted, show message
    if (allPlayersSubmitted.value) {
      toast.info(t('game.all_submitted', 'All players have submitted!'))
    }
  }
  catch (error) {
    const logger = useLogger()
    logger.error('Error submitting answer:', error)
    toast.error(t('game.error_submitting', 'Failed to submit answer'))
  }
}

const handleNext = async () => {
  // In round-based flow, NEXT goes to results/scoring screen
  if (players.value.length > 0 && !allPlayersSubmitted.value) {
    toast.warning(t('game.wait_for_players', 'Please wait for all players to submit'))
    return
  }
  goToResults()
}

const handleRestart = () => {
  showPauseModal.value = false
  // Navigate to players page to start new game
  const { goToPlayers } = useNavigation()
  goToPlayers()
}

// Handle ESC key to pause
onMounted(async () => {
  // Ensure game is initialized
  await gameActions.resumeOrStartGame()

  // Add ESC key listener for pause
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !showPauseModal.value) {
      showPauseModal.value = true
    }
  }

  window.addEventListener('keydown', handleKeyDown)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
})

useHead({
  title: () => `${t('app.title')} - ${t('game.title', 'Game')}`,
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
  background: var(--bg-gradient-main);
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
  background-image: url('/assets/alphabets/BACKGROUND.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 1;
  pointer-events: none;
  z-index: 0;
}

/* Header */
.game-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-md);
  z-index: var(--z-base);
}

.back-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff4444 0%, #cc0000 100%);
  border: 4px solid #ffaa00;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.2), var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.back-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.back-btn:active {
  transform: translateY(2px);
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2), var(--shadow-md);
}

.back-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.round-indicator {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.round-text {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  color: #ffd700;
  text-shadow:
    0 0 10px rgba(255, 215, 0, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.3);
  letter-spacing: 2px;
}

.pause-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(180deg, #44c8ff 0%, #0a6bc2 100%);
  border: 4px solid #ffaa00;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.2), var(--shadow-lg);
  color: var(--color-white);
  position: relative;
  overflow: hidden;
}

.pause-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.pause-btn:active {
  transform: translateY(2px);
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2), var(--shadow-md);
}

.pause-btn svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  z-index: 1;
}

/* Game Container */
.game-container {
  flex: 1;
  position: relative;
  padding: var(--spacing-xl) var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3xl);
  z-index: var(--z-base);
  min-height: 0; /* Allow flex shrinking */
}

/* Category Panel */
.category-panel {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(180deg, rgba(255, 200, 100, 0.95) 0%, rgba(255, 220, 150, 0.95) 100%);
  border: 6px solid #ff8800;
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl) var(--spacing-2xl);
  box-shadow:
    0 12px 0 rgba(0, 0, 0, 0.2),
    inset 0 2px 10px rgba(255, 255, 255, 0.3),
    var(--shadow-xl);
  position: relative;
  overflow: hidden;
}

.category-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(255, 150, 50, 0.9) 0%, transparent 100%);
  pointer-events: none;
}

.category-label-image {
  position: absolute;
  top: var(--spacing-md);
  left: 50%;
  transform: translateX(-50%);
  width: clamp(120px, 15vw, 180px);
  height: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  z-index: 1;
}

.category-label {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
  margin-bottom: var(--spacing-md);
  letter-spacing: 1px;
  opacity: 0;
  pointer-events: none;
}

.category-name {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: var(--font-weight-black);
  color: #ffd700;
  text-shadow:
    0 0 10px rgba(255, 215, 0, 0.5),
    0 3px 6px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(255, 215, 0, 0.3);
  text-align: center;
  letter-spacing: 2px;
}

/* Letter Display */
.letter-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
}

.letter-value {
  font-family: var(--font-display);
  font-size: clamp(8rem, 25vw, 18rem);
  font-weight: var(--font-weight-black);
  color: #44c8ff;
  text-shadow:
    0 0 20px rgba(68, 200, 255, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(68, 200, 255, 0.4),
    inset 0 -20px 30px rgba(10, 107, 194, 0.3);
  line-height: 1;
  letter-spacing: -0.05em;
  position: relative;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

.letter-value::before {
  content: attr(data-letter);
  position: absolute;
  top: 0;
  left: 0;
  color: rgba(255, 255, 255, 0.2);
  transform: translate(2px, 2px);
  z-index: -1;
}

/* Answer Input Section */
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

.submit-answer-btn {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--bg-gradient-success);
  border: 3px solid #ffaa00;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 6px 0 rgba(58, 140, 20, 0.3);
}

.submit-answer-btn:not(:disabled):active {
  transform: translateY(2px);
  box-shadow: 0 3px 0 rgba(58, 140, 20, 0.3);
}

.submit-answer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.all-submitted-message {
  width: 100%;
  max-width: 500px;
  background: var(--bg-gradient-success);
  border: 4px solid #ffaa00;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.all-submitted-message p {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}

/* Bottom Navigation */
.bottom-nav {
  position: relative;
  padding: var(--spacing-xl) var(--spacing-md);
  display: flex;
  justify-content: center;
  z-index: var(--z-base);
}

.next-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  min-width: 200px;
  padding: var(--spacing-lg) var(--spacing-3xl);
  background: var(--bg-gradient-success);
  border: 4px solid #ffaa00;
  border-radius: var(--radius-lg);
  box-shadow:
    0 12px 0 rgba(58, 140, 20, 0.4),
    inset 0 2px 10px rgba(255, 255, 255, 0.3),
    var(--shadow-xl);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.next-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
  pointer-events: none;
}

.next-btn:active {
  transform: translateY(4px);
  box-shadow:
    0 6px 0 rgba(58, 140, 20, 0.4),
    inset 0 2px 10px rgba(255, 255, 255, 0.2),
    var(--shadow-lg);
}

.next-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.next-text {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

/* Responsive */
@media (max-width: 640px) {
  .game-header {
    padding: var(--spacing-md);
  }

  .back-btn,
  .pause-btn {
    width: 56px;
    height: 56px;
  }

  .back-icon {
    width: 28px;
    height: 28px;
  }

  .category-panel {
    padding: var(--spacing-lg) var(--spacing-xl);
  }

  .game-container {
    gap: var(--spacing-2xl);
  }
}
</style>
