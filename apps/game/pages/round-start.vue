<template>
  <div class="round-start-page">
    <!-- Background Image -->
    <NuxtImg
      :src="`${baseUrl}assets/alphabets/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
      format="webp"
      quality="80"
      preset="background"
      loading="eager"
      preload
    />

    <!-- Top Bar -->
    <div class="top-bar">
      <!-- Round Indicator -->
      <div class="round-indicator">
        <div class="round-text">{{ t('game.round', 'Round') }} {{ currentRoundNumber }}</div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="container">
      <!-- Round Setup Controls (wheels + results display) -->
      <RoundSetupControls
        ref="roundSetupRef"
        :categories="gameStore.categories"
        :show-wheels="isFortuneWheelEnabled"
        :hide-results="startingGame"
        @setup-complete="onSetupComplete"
      />

      <!-- Loading indicator -->
      <div v-if="startingGame" class="loading-container">
        <Spinner />
        <p class="loading-text">
          {{ t('home.starting_game', 'Starting game...') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '@riddle-rush/types/game'
import type RoundSetupControls from '~/components/RoundSetupControls.vue'

const { baseUrl, toast, t } = usePageSetup()
const { goToGame } = useNavigation()
const { gameStore } = useGameState()
const { isFortuneWheelEnabled } = useFeatureFlags()

const roundSetupRef = ref<InstanceType<typeof RoundSetupControls> | null>(null)
const startingGame = ref(false)

const currentRoundNumber = computed(() => {
  // No session yet = first round setup
  if (!gameStore.currentSession) return 1

  const session = gameStore.currentSession
  // Check if current round has been completed (saved to roundHistory)
  const isCurrentRoundCompleted = session.roundHistory.length >= session.currentRound

  // If current round is completed, we're about to start the next round
  // Otherwise, show the current round number (e.g., on refresh)
  return isCurrentRoundCompleted ? session.currentRound + 1 : session.currentRound
})

onMounted(async () => {
  // Fetch all categories
  await gameStore.fetchCategories()

  // If fortune wheel is disabled, skip directly to game
  if (!isFortuneWheelEnabled.value) {
    const randomSelection = roundSetupRef.value?.selectRandom()
    if (randomSelection) {
      await startGame(randomSelection.category, randomSelection.letter)
    }
    return
  }

  // Start the wheel spins
  roundSetupRef.value?.startWheelSpins()
})

const onSetupComplete = async (category: Category, letter: string) => {
  await startGame(category, letter)
}

const startGame = async (selectedCategory: Category, selectedLetter: string) => {
  startingGame.value = true

  try {
    const hasSession = !!gameStore.currentSession
    const hasPendingPlayers = gameStore.pendingPlayerNames.length > 0

    // Determine if this is initial setup or a new round
    // Initial setup: no session OR pending players from players page
    if (!hasSession || hasPendingPlayers) {
      // This is initial setup - create new session with players
      const playerNames = hasPendingPlayers ? gameStore.pendingPlayerNames : ['Player 1'] // Fallback

      await gameStore.setupPlayers(playerNames, undefined, selectedLetter, selectedCategory)

      // Clear pending state
      gameStore.pendingPlayerNames = []
      gameStore.selectedLetter = null
    } else {
      // Session exists - check if current round is completed
      const session = gameStore.currentSession
      if (!session) return // Safety check

      const isCurrentRoundCompleted = session.roundHistory.length >= session.currentRound

      if (isCurrentRoundCompleted) {
        // Current round completed - start new round (increment counter)
        await gameStore.startNextRound(selectedCategory, selectedLetter)
      } else {
        // Refresh during same round - update category/letter but don't increment round
        session.category = { ...selectedCategory, letter: selectedLetter }
        session.letter = selectedLetter
        // Reset player submissions for fair restart on refresh
        await gameStore.resetPlayerSubmissions()
        await gameStore.saveSessionToDB()
      }
    }

    // Navigate to game with game ID
    const gameId = gameStore.currentSession?.id
    if (gameId) {
      await goToGame(gameId)
    } else {
      await goToGame()
    }

    // CRITICAL: Ensure spinner is turned off on success
    startingGame.value = false
  } catch (error) {
    const logger = useLogger()
    logger.error('Failed to start game:', error)
    startingGame.value = false
    // Show error to user
    toast.error(t('game.error_starting', 'Failed to start game. Please try again.'))
  }
}

useHead({
  title: 'Round Start',
  meta: [
    {
      name: 'description',
      content: 'Spinning for category and letter',
    },
  ],
})
</script>

<style scoped>
.round-start-page {
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
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}

.round-indicator {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md) var(--spacing-xl);
  border: 2px solid rgba(255, 215, 0, 0.3);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
}

.round-text {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-xl), 3vw, var(--font-size-2xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 2px;
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
  padding: clamp(var(--spacing-xl), 8vh, var(--spacing-3xl)) var(--spacing-xl);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.loading-text {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-lg), 3vw, var(--font-size-2xl));
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: clamp(var(--spacing-xl), 6vh, var(--spacing-2xl)) var(--spacing-lg);
  }

  .round-text {
    font-size: clamp(var(--font-size-lg), 4vw, var(--font-size-xl));
  }
}

@media (max-width: 480px) {
  .container {
    padding: clamp(var(--spacing-lg), 5vh, var(--spacing-xl)) var(--spacing-lg);
  }
}

/* Pixel 7 Pro specific (412px width, tall screen) */
@media (min-width: 390px) and (max-width: 480px) {
  .container {
    padding: clamp(var(--spacing-xl), 6vh, var(--spacing-2xl)) var(--spacing-lg);
  }
}
</style>
