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
        <div class="round-text">{{ $t('game.round', 'Round') }} {{ currentRoundNumber }}</div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="container">
      <!-- Dual Wheels Phase (only shown if feature is enabled) -->
      <transition name="wheel-fade">
        <div v-if="isFortuneWheelEnabled && !wheelsComplete" class="wheels-container">
          <div class="wheel-wrapper">
            <div class="wheel-label">
              {{ $t('common.category', 'Category') }}
            </div>
            <FortuneWheel
              ref="categoryWheelRef"
              v-model="selectedCategory"
              :items="displayCategories"
              :get-item-key="(cat, idx) => cat?.searchWord || idx"
              :get-item-label="(cat) => $t(`categories.${cat.searchWord}`, cat.name)"
              :get-item-icon="getCategoryIcon"
              center-icon="🎯"
              @spin-complete="onCategoryComplete"
            />
          </div>

          <div class="wheel-wrapper">
            <div class="wheel-label">
              {{ $t('common.letter', 'Letter') }}
            </div>
            <FortuneWheel
              ref="letterWheelRef"
              v-model="selectedLetter"
              :items="alphabet"
              :get-item-key="(letter, idx) => letter"
              :get-item-label="(letter) => letter"
              :get-item-icon="() => ''"
              center-icon="🎯"
              @spin-complete="onLetterComplete"
            />
          </div>
        </div>
      </transition>

      <!-- Selected Values Display Phase (only shown if fortune wheel was used) -->
      <transition name="results-fade">
        <div
          v-if="isFortuneWheelEnabled && wheelsComplete && !startingGame"
          class="results-display"
        >
          <div class="result-item animate-scale-in">
            <div class="result-label">
              {{ $t('common.category', 'Category') }}
            </div>
            <div class="result-value">
              <span class="result-icon">{{ selectedCategoryIcon }}</span>
              <span class="result-text">{{ selectedCategoryName }}</span>
            </div>
          </div>

          <div class="divider">×</div>

          <div class="result-item animate-scale-in" style="animation-delay: 0.2s">
            <div class="result-label">
              {{ $t('common.letter', 'Letter') }}
            </div>
            <div class="result-value">
              <span class="result-text result-letter">{{ selectedLetter }}</span>
            </div>
          </div>
        </div>
      </transition>

      <!-- Loading indicator -->
      <div v-if="startingGame" class="loading-container">
        <Spinner />
        <p class="loading-text">
          {{ $t('home.starting_game', 'Starting game...') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '@riddle-rush/types/game'
import { WHEEL_FADE_DELAY_MS, RESULTS_DISPLAY_DURATION_MS } from '@riddle-rush/shared/constants'

const { baseUrl, toast, t } = usePageSetup()
const { goToGame } = useNavigation()
const { gameStore } = useGameState()
const { isFortuneWheelEnabled } = useFeatureFlags()

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const selectedCategory = ref<Category | null>(null)
const selectedLetter = ref<string | null>(null)
const displayCategories = ref<Category[]>([])
const categoryWheelRef = ref()
const letterWheelRef = ref()

const categorySpinComplete = ref(false)
const letterSpinComplete = ref(false)
const wheelsComplete = ref(false)
const startingGame = ref(false)

const categoryIconMap: Record<string, string> = {
  female_name: '👩',
  male_name: '👨',
  water_vehicle: '⛵',
  flowers: '🌸',
  plants: '🌿',
  profession: '👔',
  insect: '🐛',
  animal: '🦁',
  city: '🏙️',
  country: '🌍',
  food: '🍕',
  drink: '🧃',
  sport: '⚽',
  music: '🎵',
  movie: '🎬',
}

const selectedCategoryIcon = computed(() => {
  if (!selectedCategory.value) return '📦'
  return getCategoryIcon(selectedCategory.value)
})

const selectedCategoryName = computed(() => {
  if (!selectedCategory.value) return ''
  return t(`categories.${selectedCategory.value.searchWord}`, selectedCategory.value.name)
})

const currentRoundNumber = computed(() => {
  // If there's an active session, show next round number
  // Otherwise show round 1
  return gameStore.currentSession ? gameStore.currentSession.currentRound + 1 : 1
})

onMounted(async () => {
  // Fetch all categories
  await gameStore.fetchCategories()
  const allCategories = gameStore.categories

  // If fortune wheel is disabled, skip directly to game
  if (!isFortuneWheelEnabled.value) {
    // Select random category and letter
    const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)]
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)]

    selectedCategory.value = randomCategory ?? null
    selectedLetter.value = randomLetter ?? null

    // Start game immediately
    await startGame()
    return
  }

  // Select up to 12 categories for the wheel
  displayCategories.value = allCategories.slice(0, 12)

  // Auto-spin both wheels immediately (will complete within 5 seconds)
  setTimeout(() => {
    categoryWheelRef.value?.spinRandom()
    letterWheelRef.value?.spinRandom()
  }, 100)
})

const getCategoryIcon = (category: Category): string => {
  return categoryIconMap[category.searchWord] || '📦'
}

const onCategoryComplete = (category: Category) => {
  selectedCategory.value = category
  categorySpinComplete.value = true
  checkBothComplete()
}

const onLetterComplete = (letter: string) => {
  selectedLetter.value = letter
  letterSpinComplete.value = true
  checkBothComplete()
}

const checkBothComplete = () => {
  if (categorySpinComplete.value && letterSpinComplete.value) {
    // Both wheels have completed spinning
    // Wait a moment, then fade out wheels
    setTimeout(() => {
      wheelsComplete.value = true

      // After showing results, start the game
      setTimeout(() => {
        startGame()
      }, RESULTS_DISPLAY_DURATION_MS)
    }, WHEEL_FADE_DELAY_MS)
  }
}

const startGame = async () => {
  if (!selectedCategory.value || !selectedLetter.value) return

  startingGame.value = true

  try {
    // Check if this is a next round (active session exists) or initial setup
    const isNextRound = !!gameStore.currentSession

    if (isNextRound) {
      // This is a next round - update the existing session
      await gameStore.startNextRound(selectedCategory.value, selectedLetter.value)
    } else {
      // This is initial setup - create new session with players
      const playerNames =
        gameStore.pendingPlayerNames.length > 0 ? gameStore.pendingPlayerNames : ['Player 1'] // Fallback

      await gameStore.setupPlayers(
        playerNames,
        undefined,
        selectedLetter.value,
        selectedCategory.value
      )

      // Clear pending state
      gameStore.pendingPlayerNames = []
      gameStore.selectedLetter = null
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

/* Dual Wheels Container */
.wheels-container {
  display: flex;
  gap: clamp(var(--spacing-xl), 5vw, var(--spacing-3xl));
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
}

.wheel-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  max-width: 420px;
}

.wheel-label {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-xl), 3vw, var(--font-size-2xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Results Display */
.results-display {
  display: flex;
  gap: clamp(var(--spacing-2xl), 6vw, var(--spacing-3xl));
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 900px;
}

.result-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  padding: clamp(var(--spacing-xl), 4vw, var(--spacing-3xl));
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 0 40px rgba(255, 215, 0, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.result-label {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-base), 2vw, var(--font-size-lg));
  font-weight: var(--font-weight-semibold);
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.result-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.result-icon {
  font-size: clamp(48px, 8vw, 72px);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.result-text {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-2xl), 4vw, var(--font-size-3xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(255, 215, 0, 0.6);
}

.result-letter {
  font-size: clamp(64px, 10vw, 96px);
  background: linear-gradient(135deg, #ffd700, #ffa500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.divider {
  font-size: clamp(var(--font-size-3xl), 6vw, var(--font-size-4xl));
  font-weight: var(--font-weight-black);
  color: rgba(255, 215, 0, 0.5);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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

/* Transitions */
.wheel-fade-enter-active,
.wheel-fade-leave-active {
  transition: all 0.8s ease-out;
}

.wheel-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.wheel-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.results-fade-enter-active {
  transition: all 0.8s ease-out;
}

.results-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out backwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive - Stack wheels vertically on mobile */
@media (max-width: 768px) {
  .container {
    padding: clamp(var(--spacing-xl), 6vh, var(--spacing-2xl)) var(--spacing-lg);
  }

  .wheels-container {
    flex-direction: column;
    gap: var(--spacing-2xl);
    width: 100%;
    max-width: 500px;
  }

  .wheel-wrapper {
    width: 100%;
    max-width: 380px;
  }

  .wheel-label {
    font-size: clamp(var(--font-size-lg), 4vw, var(--font-size-xl));
  }

  .results-display {
    flex-direction: column;
    gap: var(--spacing-xl);
    width: calc(100% - 2rem);
  }

  .result-item {
    width: 100%;
    max-width: 400px;
  }

  .divider {
    transform: rotate(90deg);
  }

  .round-text {
    font-size: clamp(var(--font-size-lg), 4vw, var(--font-size-xl));
  }
}

@media (max-width: 480px) {
  .container {
    padding: clamp(var(--spacing-lg), 5vh, var(--spacing-xl)) var(--spacing-lg);
  }

  .wheels-container {
    gap: var(--spacing-xl);
    max-width: 100%;
  }

  .wheel-wrapper {
    width: 100%;
    max-width: 320px;
  }

  .results-display {
    width: calc(100% - 2rem);
  }

  .result-text {
    font-size: clamp(var(--font-size-xl), 5vw, var(--font-size-2xl));
  }

  .result-letter {
    font-size: clamp(48px, 12vw, 72px);
  }
}

/* Pixel 7 Pro specific (412px width, tall screen) */
@media (min-width: 390px) and (max-width: 480px) {
  .container {
    padding: clamp(var(--spacing-xl), 6vh, var(--spacing-2xl)) var(--spacing-lg);
  }

  .wheels-container {
    gap: var(--spacing-xl);
    max-width: 100%;
  }

  .wheel-wrapper {
    width: 100%;
    max-width: 340px;
  }

  .results-display {
    width: calc(100% - 2rem);
  }
}

@media (min-width: 769px) and (max-height: 700px) {
  /* Landscape mode on tablets/small screens */
  .wheels-container {
    gap: var(--spacing-lg);
  }

  .wheel-wrapper {
    max-width: 320px;
  }
}
</style>
