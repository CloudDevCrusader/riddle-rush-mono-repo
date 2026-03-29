<template>
  <div class="game-page">
    <img src="~/assets/figma/background-1-6.png" class="game-bg" alt="background" />

    <header class="game-header">
      <img src="~/assets/figma/back-1-3.png" class="back-btn" alt="Back" @click="handleBack" />
      <div class="round-indicator">
        <img src="~/assets/figma/round-01-1.png" alt="Round" />
      </div>
      <div class="coin-bar">
        <img src="~/assets/figma/coin-bar-1-4.png" alt="Coin bar" />
        <span class="coin-bar-text">100</span>
      </div>
    </header>

    <div class="game-container">
      <div class="category-panel">
        <img src="~/assets/figma/back-1-2.png" class="category-bg" alt="Category background" />
        <div class="category-text">
          <img src="~/assets/figma/category-1.png" class="category-title" alt="Category" />
          <img src="~/assets/figma/animal-1.png" class="category-name" alt="Animal" />
        </div>
      </div>

      <div class="letter-display">
        <img src="~/assets/figma/a-1.png" class="letter-image" alt="Letter A" />
      </div>

      <div
        v-if="players.length > 0 && currentPlayerTurn && !allPlayersSubmitted"
        class="answer-input-section"
      >
        <div class="player-turn-indicator" data-testid="game-player-turn">
          <span class="turn-label">{{ t('game.current_turn', 'Current Turn') }}:</span>
          <span class="turn-name" data-testid="game-player-name">{{ currentPlayerTurn.name }}</span>
        </div>
        <form v-if="isInputFieldEnabled" class="answer-form" @submit.prevent="submitAnswer">
          <input
            v-model="playerAnswer"
            type="text"
            class="answer-input"
            data-testid="game-answer-input"
            :placeholder="t('game.your_answer', 'Your answer...')"
            autocomplete="off"
            autocapitalize="words"
            maxlength="50"
            @input="sanitizeInput"
          />
          <button
            type="submit"
            class="submit-answer-btn"
            data-testid="game-submit-button"
            :disabled="isSubmitting"
          >
            {{ t('game.submit', 'Submit') }}
          </button>
        </form>
        <div v-else class="skip-actions">
          <button
            class="skip-player-btn"
            data-testid="game-skip-button"
            :disabled="isSubmitting"
            @click="submitAnswer"
          >
            {{ t('game.skip', 'Skip') }}
          </button>
        </div>
      </div>

      <div
        v-if="allPlayersSubmitted"
        class="all-submitted-message"
        data-testid="game-all-submitted"
      >
        <p>{{ t('game.all_submitted', 'All players have submitted!') }}</p>
      </div>
    </div>

    <LazyPauseModal
      v-model="showPauseModal"
      @resume="handleResume"
      @restart="handleRestart"
      @home="handleHome"
    />

    <LazyQuitModal
      v-model="showQuitModal"
      @confirm="handleQuitConfirmed"
      @cancel="showQuitModal = false"
    />

    <div class="bottom-nav">
      <img src="~/assets/figma/next-1.png" class="next-btn" alt="Next" @click="handleNext" />
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
const logger = useLogger()
const gameActions = useGameActions()
const { isInputFieldEnabled } = useFeatureFlags()
const route = useRoute()

// Handle game ID from route parameter
const gameId = computed(() => route.params.gameId as string | undefined)

const playerAnswer = ref('')
const isSubmitting = ref(false)
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
  } else {
    goHome()
  }
}

const handleQuitConfirmed = () => {
  showQuitModal.value = false
  goHome()
}

// Sanitize input to prevent XSS and limit special characters
// Optimized: Direct mutation is faster than debouncing for simple sanitization
const sanitizeInput = () => {
  // Remove potentially dangerous characters
  playerAnswer.value = playerAnswer.value.replace(/[<>]/g, '')
  // Limit length
  if (playerAnswer.value.length > 50) {
    playerAnswer.value = playerAnswer.value.slice(0, 50)
  }
}

const submitAnswer = async () => {
  // Guard against double submission (form submit + keyup.enter race, or rapid clicks)
  if (isSubmitting.value) return

  const player = currentPlayerTurn.value
  if (!player) {
    return
  }

  isSubmitting.value = true

  try {
    // Allow empty answers (player can skip their turn)
    const answer = playerAnswer.value.trim() || ''
    await gameStore.submitPlayerAnswer(player.id, answer)

    if (answer) {
      toast.success(t('game.answer_submitted', `Answer submitted for ${player.name}`))
    } else {
      toast.info(t('game.answer_skipped', `${player.name} skipped their turn`))
    }

    playerAnswer.value = ''

    // If all players submitted, show message
    if (allPlayersSubmitted.value) {
      toast.info(t('game.all_submitted', 'All players have submitted!'))
    }
  } catch (error) {
    const logger = useLogger()
    logger.error('Error submitting answer:', error)
    toast.error(t('game.error_submitting', 'Failed to submit answer'))
  } finally {
    isSubmitting.value = false
  }
}

const handleNext = async () => {
  // In round-based flow, NEXT goes to results/scoring screen
  if (players.value.length > 0 && !allPlayersSubmitted.value) {
    toast.warning(t('game.wait_for_players', 'Please wait for all players to submit'))
    return
  }

  // Navigate to results with game ID
  const currentGameId = gameStore.currentSession?.id
  if (currentGameId) {
    goToResults(currentGameId)
  } else {
    goToResults()
  }
}

const handleResume = () => {
  // Modal already sets showPauseModal to false via v-model
  // No additional logic needed - game continues
}

const handleRestart = () => {
  // Modal already handles abandonGame and sets showPauseModal to false
  // Navigate to players page to start new game
  const { goToPlayers } = useNavigation()
  goToPlayers()
}

const handleHome = () => {
  // Modal already handles abandonGame, navigation, and sets showPauseModal to false
  // No additional logic needed
}

// ESC key handler for pause — defined outside onMounted so cleanup can be
// registered synchronously (onUnmounted must be called during setup, not
// after an await inside onMounted where the component instance is lost).
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !showPauseModal.value) {
    showPauseModal.value = true
  }
}

onMounted(async () => {
  // Load game session based on route parameter
  if (gameId.value) {
    try {
      await gameStore.loadSessionById(gameId.value)
    } catch (error) {
      logger.error('Failed to load game session:', error)
      toast.error(t('game.error_loading', 'Failed to load game session'))
      // Fallback to starting a new game
      await gameActions.resumeOrStartGame()
    }
  } else if (!gameStore.hasActiveSession) {
    // No game ID in route and no active session - start new game
    await gameActions.resumeOrStartGame()
  }

  // Add ESC key listener for pause
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

useHead({
  title: t('game.page_title', 'Riddle Rush - Game'),
  meta: [
    {
      name: 'description',
      content: t(
        'game.meta_description',
        'An exciting word guessing game for friends and family. Play offline, perfect for game nights!'
      ),
    },
  ],
})
</script>

<style scoped>
.game-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.game-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.back-btn {
  width: 64px;
  cursor: pointer;
}

.round-indicator {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}

.round-indicator img {
  width: 150px;
}

.coin-bar {
  position: relative;
  width: 120px;
}

.coin-bar img {
  width: 100%;
}

.coin-bar-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.game-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 1rem;
}

.category-panel {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.category-bg {
  width: 100%;
}

.category-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.category-title {
  width: 120px;
}

.category-name {
  width: 200px;
}

.letter-display {
  width: 100%;
  max-width: 300px;
}

.letter-image {
  width: 100%;
}

.answer-input-section {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 1rem;
  border: 2px solid #ffaa00;
}

.player-turn-indicator {
  text-align: center;
  margin-bottom: 1rem;
}

.turn-label {
  font-weight: bold;
}

.turn-name {
  font-style: italic;
}

.answer-form {
  display: flex;
  gap: 1rem;
}

.answer-input {
  flex-grow: 1;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.submit-answer-btn {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

.skip-actions {
  display: flex;
  justify-content: center;
}

.skip-player-btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  background-color: #ff9800;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.2s;
}

.skip-player-btn:hover {
  background-color: #f57c00;
}

.skip-player-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.all-submitted-message {
  text-align: center;
  font-weight: bold;
  color: #4caf50;
}

.bottom-nav {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.next-btn {
  width: 100%;
  max-width: 300px;
  cursor: pointer;
}
</style>
