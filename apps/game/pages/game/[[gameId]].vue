<template>
  <div class="game-page">
    <!-- Background -->
    <div class="game-bg" />

    <!-- Top Bar -->
    <header class="game-header">
      <!-- Back Button -->
      <button
        data-testid="back-button"
        class="back-btn tap-highlight no-select"
        @click="handleBack"
      >
        <img
          :src="`${baseUrl}assets/alphabets/back.png`"
          alt="Back"
          class="back-icon"
          loading="eager"
        />
      </button>

      <!-- Round Indicator -->
      <div class="round-indicator" data-testid="game-round-indicator">
        <span class="round-text">{{ t('game.round') }} {{ formattedRound }}</span>
      </div>

      <!-- Pause Button -->
      <button
        class="pause-btn tap-highlight no-select"
        aria-label="Pause game"
        data-testid="game-pause-button"
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
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      </button>
    </header>

    <!-- Main Game Area -->
    <div class="game-container">
      <!-- Category Panel -->
      <div class="category-panel" data-testid="game-category-info">
        <img
          :src="`${baseUrl}assets/alphabets/CATEGORY.png`"
          alt="Category"
          class="category-label-image"
          loading="lazy"
        />
        <div class="category-label">{{ t('common.category').toUpperCase() }}</div>
        <div class="category-name">
          {{
            currentCategory
              ? t(`categories.${currentCategory.searchWord}`, currentCategory.name).toUpperCase()
              : 'LOADING...'
          }}
        </div>
      </div>

      <!-- Large Letter Display -->
      <div class="letter-display" data-testid="game-letter-info">
        <span class="letter-value">
          {{ currentLetter ? currentLetter.toUpperCase() : 'A' }}
        </span>
      </div>

      <!-- Player Turn Section (for multiplayer) -->
      <div
        v-if="players.length > 0 && currentPlayerTurn && !allPlayersSubmitted"
        class="answer-input-section"
      >
        <div class="player-turn-indicator" data-testid="game-player-turn">
          <span class="turn-label">{{ t('game.current_turn', 'Current Turn') }}:</span>
          <span class="turn-name" data-testid="game-player-name">{{ currentPlayerTurn.name }}</span>
        </div>
        <form class="answer-form" @submit.prevent="submitAnswer">
          <input
            v-if="isAnswerInputEnabled"
            v-model="playerAnswer"
            type="text"
            class="answer-input"
            data-testid="game-answer-input"
            :placeholder="t('game.your_answer', 'Your answer...')"
            autocomplete="off"
            autocapitalize="words"
            maxlength="50"
            @input="sanitizeInput"
            @keyup.enter="submitAnswer"
          />
          <button
            type="submit"
            class="submit-answer-btn"
            data-testid="game-submit-button"
            :disabled="false"
          >
            {{ isAnswerInputEnabled ? t('game.submit', 'Submit') : t('common.confirm') }}
          </button>
        </form>
      </div>

      <!-- All Players Submitted Message -->
      <div
        v-if="allPlayersSubmitted"
        class="all-submitted-message"
        data-testid="game-all-submitted"
      >
        <p>{{ t('game.all_submitted', 'All players have submitted!') }}</p>
      </div>
    </div>

    <!-- Pause Modal (Lazy Loaded) -->
    <LazyPauseModal
      v-model="showPauseModal"
      @resume="handleResume"
      @restart="handleRestart"
      @home="handleHome"
    />

    <!-- Quit Modal (Lazy Loaded) -->
    <LazyQuitModal
      v-model="showQuitModal"
      @confirm="handleQuitConfirmed"
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
          :src="`${baseUrl}assets/alphabets/next.png`"
          alt="Next"
          class="next-icon"
          loading="lazy"
        />
        <span class="next-text">{{ t('common.next') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { baseUrl, toast, t, goHome: navigateToHome } = usePageSetup()
const { goToResults, goToPlayers } = useNavigation()
const {
  gameSession,
  currentCategory,
  currentLetter,
  currentRound,
  players,
  currentPlayerTurn,
  allPlayersSubmitted,
} = useGameState()
const playerActions = usePlayerActions()
const { isAnswerInputEnabled } = useFeatureFlags()
const logger = useLogger()
const gameActions = useGameActions()
const route = useRoute()

// Handle game ID from route parameter
const gameId = computed(() => route.params.gameId as string | undefined)

const playerAnswer = ref('')
const showPauseModal = ref(false)
const showQuitModal = ref(false)

// Clear stale input when flag toggles off mid-session
watch(isAnswerInputEnabled, (enabled: boolean) => {
  if (!enabled) {
    playerAnswer.value = ''
  }
})

const formattedRound = computed(() => {
  const round = currentRound.value || 1
  return round.toString().padStart(2, '0')
})

const goHome = () => {
  navigateToHome()
}

const handleBack = () => {
  if (gameSession.hasActiveSession.value) {
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
  const player = currentPlayerTurn.value
  if (!player) {
    return
  }

  try {
    // Allow empty answers (player can skip their turn)
    const answer = playerAnswer.value.trim() || ''
    await playerActions.submitPlayerAnswer(player.id, answer)

    if (answer) {
      toast.success(t('game.answer_submitted', [player.name]))
    } else {
      toast.info(t('game.answer_skipped', [player.name]))
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
  }
}

const handleNext = async () => {
  // In round-based flow, NEXT goes to results/scoring screen
  if (players.value.length > 0 && !allPlayersSubmitted.value) {
    toast.warning(t('game.wait_for_players', 'Please wait for all players to submit'))
    return
  }

  // Navigate to results with game ID
  const currentGameId = gameSession.currentSession.value?.id ?? gameId.value
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
  goToPlayers()
}

const handleHome = () => {
  // Modal already handles abandonGame, navigation, and sets showPauseModal to false
  // No additional logic needed
}

// Handle ESC key to pause
onMounted(async () => {
  // Load game session based on route parameter
  if (gameId.value) {
    try {
      await gameSession.loadSessionById(gameId.value)
    } catch (error) {
      logger.error('Failed to load game session:', error)
      toast.error(t('game.error_loading', 'Failed to load game session'))
      // Fallback to starting a new game
      await gameActions.resumeOrStartGame()
    }
  } else if (!gameSession.hasActiveSession.value) {
    // No game ID in route and no active session - start new game
    await gameActions.resumeOrStartGame()
  }

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
  title: 'Riddle Rush - Game',
  meta: [
    {
      name: 'description',
      content:
        'An exciting word guessing game for friends and family. Play offline, perfect for game nights!',
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
  /* Background image optimized via Nuxt Image in template */
  /* background-image: url('/assets/alphabets/BACKGROUND.png'); */
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
  box-shadow:
    0 8px 0 rgba(0, 0, 0, 0.2),
    var(--shadow-lg);
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
  box-shadow:
    0 4px 0 rgba(0, 0, 0, 0.2),
    var(--shadow-md);
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

/* Gold text with brown outline matching mockup */
.round-text {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4vw, 2.5rem);
  font-weight: var(--font-weight-black);
  color: #ffd700;
  /* Brown/dark outline using text-stroke */
  -webkit-text-stroke: clamp(1px, 0.3vw, 2px) #8b4513;
  paint-order: stroke fill;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 0 10px rgba(255, 215, 0, 0.3);
  letter-spacing: 3px;
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
  box-shadow:
    0 8px 0 rgba(0, 0, 0, 0.2),
    var(--shadow-lg);
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
  box-shadow:
    0 4px 0 rgba(0, 0, 0, 0.2),
    var(--shadow-md);
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

/* Category Panel - Two-part design matching mockup */
.category-panel {
  width: 100%;
  max-width: 600px;
  border: 5px solid #e89520;
  border-radius: var(--radius-xl);
  box-shadow:
    0 8px 0 rgba(0, 0, 0, 0.15),
    var(--shadow-lg);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Orange header section */
.category-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(180deg, #ffb347 0%, #e89520 100%);
  pointer-events: none;
  z-index: 0;
}

/* Cream/beige body section */
.category-panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(180deg, #fff5e0 0%, #ffe6b8 100%);
  pointer-events: none;
  z-index: 0;
}

.category-label-image {
  display: none; /* Hide the image, using CSS text instead */
}

.category-label {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3.5vw, 2rem);
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    -1px -1px 0 #8b4513,
    1px -1px 0 #8b4513,
    -1px 1px 0 #8b4513,
    1px 1px 0 #8b4513,
    0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
  padding: var(--spacing-md) var(--spacing-xl);
  letter-spacing: 2px;
  opacity: 1;
}

.category-name {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 6vw, 3.5rem);
  font-weight: var(--font-weight-black);
  /* Gold 3D text effect */
  color: #d4a017;
  text-shadow:
    -2px -2px 0 #8b6914,
    2px -2px 0 #8b6914,
    -2px 2px 0 #8b6914,
    2px 2px 0 #8b6914,
    0 4px 0 #7a5c12,
    0 6px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  letter-spacing: 3px;
}

/* Letter Display - Light blue with dark blue outline and 3D shadow */
.letter-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  position: relative;
}

/* Cyan glow underneath the letter */
.letter-display::before {
  content: '';
  position: absolute;
  bottom: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 30%;
  background: radial-gradient(ellipse at center, rgba(100, 200, 255, 0.4) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(20px);
}

.letter-value {
  font-family: var(--font-display);
  font-size: clamp(10rem, 30vw, 20rem);
  font-weight: var(--font-weight-black);
  /* Light blue fill color matching mockup */
  color: #7ec8e3;
  /* Dark blue outline using text-stroke + 3D shadow */
  -webkit-text-stroke: clamp(4px, 1vw, 8px) #2b5b84;
  paint-order: stroke fill;
  text-shadow:
    /* 3D depth shadow - offset down-right */
    6px 6px 0 #1a3d5c,
    8px 8px 0 #153250,
    10px 10px 0 #102844,
    /* Soft blur shadow for depth */ 12px 12px 20px rgba(0, 0, 0, 0.4);
  line-height: 1;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

/* Inner highlight for 3D effect */
.letter-value::before {
  content: attr(data-letter);
  position: absolute;
  top: -2px;
  left: -2px;
  color: #a8dff0;
  -webkit-text-stroke: 0;
  z-index: -1;
  opacity: 0.5;
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

/* NEXT Button - Bright green glossy gradient with gold border */
.next-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  min-width: 220px;
  padding: var(--spacing-lg) var(--spacing-3xl);
  /* Bright green glossy gradient matching mockup */
  background: linear-gradient(180deg, #9dff4d 0%, #5fc423 50%, #4aab18 100%);
  border: 4px solid #e89520;
  border-radius: var(--radius-xl);
  box-shadow:
    0 8px 0 #3a8c14,
    0 12px 20px rgba(0, 0, 0, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

/* Glossy highlight on top half */
.next-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.1) 100%);
  pointer-events: none;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

/* 3D press effect */
.next-btn:active {
  transform: translateY(4px);
  box-shadow:
    0 4px 0 #3a8c14,
    0 6px 12px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.next-icon {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

.next-text {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3.5vw, 2rem);
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  /* White text with shadow for contrast */
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 8px rgba(0, 0, 0, 0.2);
  letter-spacing: 3px;
}

/* Responsive */
@media (max-width: 768px) {
  .game-header {
    padding: var(--spacing-md);
  }

  .back-btn,
  .pause-btn {
    width: clamp(50px, 12vw, 64px);
    height: clamp(50px, 12vw, 64px);
    border: 3px solid #ffaa00;
  }

  .back-icon {
    width: clamp(24px, 6vw, 32px);
    height: clamp(24px, 6vw, 32px);
  }

  .round-text {
    font-size: clamp(1.3rem, 3vw, 1.8rem);
  }

  .category-panel {
    max-width: calc(100% - var(--spacing-md) * 2);
  }

  .category-label {
    font-size: clamp(1.1rem, 3vw, 1.5rem);
    padding: var(--spacing-sm) var(--spacing-lg);
  }

  .category-name {
    font-size: clamp(1.8rem, 5vw, 2.5rem);
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .letter-display {
    max-width: calc(100% - var(--spacing-md) * 2);
  }

  .letter-value {
    font-size: clamp(8rem, 22vw, 16rem);
    -webkit-text-stroke: clamp(3px, 0.8vw, 6px) #2b5b84;
  }

  .answer-input-section {
    max-width: calc(100% - var(--spacing-md) * 2);
  }

  .game-container {
    gap: var(--spacing-2xl);
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .bottom-nav {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .next-btn {
    min-width: 180px;
    padding: var(--spacing-md) var(--spacing-2xl);
  }

  .next-text {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
  }
}

@media (max-width: 480px) {
  .game-header {
    padding: var(--spacing-sm);
  }

  .back-btn,
  .pause-btn {
    width: clamp(44px, 11vw, 56px);
    height: clamp(44px, 11vw, 56px);
    border: 2px solid #ffaa00;
  }

  .round-text {
    font-size: clamp(1.1rem, 2.8vw, 1.4rem);
  }

  .category-panel {
    max-width: calc(100% - var(--spacing-sm) * 2);
    border-width: 4px;
  }

  .category-label {
    font-size: clamp(1rem, 2.5vw, 1.3rem);
    padding: var(--spacing-xs) var(--spacing-md);
  }

  .category-name {
    font-size: clamp(1.5rem, 4vw, 2rem);
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .letter-value {
    font-size: clamp(6rem, 18vw, 12rem);
    -webkit-text-stroke: clamp(2px, 0.6vw, 4px) #2b5b84;
  }

  .answer-input-section {
    max-width: calc(100% - var(--spacing-sm) * 2);
    padding: var(--spacing-md);
  }

  .answer-input {
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    padding: var(--spacing-md);
  }

  .game-container {
    gap: var(--spacing-xl);
    padding: var(--spacing-md) var(--spacing-sm);
  }

  .bottom-nav {
    padding: var(--spacing-md) var(--spacing-sm);
  }

  .next-btn {
    min-width: 160px;
    padding: var(--spacing-sm) var(--spacing-xl);
    border-width: 3px;
  }

  .next-text {
    font-size: clamp(1rem, 2.5vw, 1.3rem);
  }
}
</style>
