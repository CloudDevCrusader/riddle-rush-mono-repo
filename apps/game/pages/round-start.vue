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
      <div class="round-indicator" data-testid="round-indicator">
        <div class="round-text">{{ t('game.round', 'Round') }} {{ currentRoundNumber }}</div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="container">
      <!-- Dual Wheels Phase (only shown if feature is enabled) -->
      <transition name="wheel-fade">
        <div
          v-if="isFortuneWheelEnabled && !startingGame"
          class="double-wheel-layout"
          data-testid="round-wheels-container"
        >
          <!-- Top Wheel (Category) -->
          <div class="wheel-wrapper top-wheel">
            <div class="wheel-label">
              {{ t('common.category', 'Category') }}
            </div>
            <div class="wheel-container flipped">
              <FortuneWheel
                ref="categoryWheelRef"
                v-model="selectedCategory"
                :items="displayCategories"
                :get-item-key="getCategoryKey"
                :get-item-label="getCategoryLabel"
                :get-item-icon="getCategoryIcon"
                center-icon="🎯"
                @spin-complete="onCategoryComplete"
              />
            </div>
            <transition name="result-pop">
              <div
                v-if="categorySpinComplete"
                class="inline-result"
                data-testid="round-category-inline-result"
              >
                <span class="inline-result-icon">{{ selectedCategoryIcon }}</span>
                <span class="inline-result-text">{{ selectedCategoryName }}</span>
              </div>
            </transition>
          </div>

          <!-- Central Spin Button -->
          <div class="spin-button-zone">
            <button
              data-testid="spin-button"
              @click="spinBothWheels"
              class="spin-button tap-highlight"
              :disabled="categorySpinComplete || letterSpinComplete || isSpinning"
            >
              <div class="spin-button-inner">
                <span class="spin-text">SPIN</span>
              </div>
            </button>
          </div>

          <!-- Bottom Wheel (Letter) -->
          <div class="wheel-wrapper bottom-wheel">
            <div class="wheel-label">
              {{ t('common.letter', 'Letter') }}
            </div>
            <div class="wheel-container">
              <FortuneWheel
                ref="letterWheelRef"
                v-model="selectedLetter"
                :items="alphabet"
                :get-item-key="getLetterKey"
                :get-item-label="getLetterLabel"
                :get-item-icon="getNoIcon"
                center-icon="🎯"
                @spin-complete="onLetterComplete"
              />
            </div>
            <transition name="result-pop">
              <div
                v-if="letterSpinComplete"
                class="inline-result"
                data-testid="round-letter-inline-result"
              >
                <span class="inline-result-text inline-result-letter">{{ selectedLetter }}</span>
              </div>
            </transition>
          </div>
        </div>
      </transition>

      <!-- Loading indicator -->
      <div v-if="startingGame" class="loading-container" data-testid="round-loading">
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
import { RESULTS_DISPLAY_DURATION_MS } from '@riddle-rush/shared/constants'

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
const isSpinning = ref(false)

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
  // No session yet = first round setup
  const session = gameStore.currentSession.value
  if (!session) return 1

  // Check if current round has been completed (saved to roundHistory)
  const isCurrentRoundCompleted = session.roundHistory.length >= session.currentRound

  // If current round is completed, we're about to start the next round
  // Otherwise, show the current round number (e.g., on refresh)
  return isCurrentRoundCompleted ? session.currentRound + 1 : session.currentRound
})

onMounted(async () => {
  // Fetch all categories
  await gameStore.fetchCategories()
  const allCategories = gameStore.categories.value

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
})

const spinBothWheels = () => {
  if (isSpinning.value) return
  isSpinning.value = true
  categorySpinComplete.value = false
  letterSpinComplete.value = false

  categoryWheelRef.value?.spinRandom()

  // Stagger the spins slightly for better visual effect
  setTimeout(() => {
    letterWheelRef.value?.spinRandom()
  }, 150)
}

const getCategoryIcon = (category: Category): string => {
  return categoryIconMap[category.searchWord] || '📦'
}

const getCategoryKey = (cat: Category, idx: number): string | number => cat?.searchWord || idx
const getCategoryLabel = (cat: Category): string => t(`categories.${cat.searchWord}`, cat.name)
const getLetterKey = (letter: string, _idx: number): string => letter
const getLetterLabel = (letter: string): string => letter
const getNoIcon = (): string => ''

const onCategoryComplete = (category: Category) => {
  if (!isSpinning.value) return
  selectedCategory.value = category
  categorySpinComplete.value = true
  checkBothComplete()
}

const onLetterComplete = (letter: string) => {
  if (!isSpinning.value) return
  selectedLetter.value = letter
  letterSpinComplete.value = true
  checkBothComplete()
}

const checkBothComplete = () => {
  if (categorySpinComplete.value && letterSpinComplete.value) {
    if (wheelsComplete.value) return
    isSpinning.value = false
    wheelsComplete.value = true
    // Brief pause to let users see both results, then navigate
    setTimeout(() => {
      startGame()
    }, RESULTS_DISPLAY_DURATION_MS)
  }
}

const startGame = async () => {
  if (!selectedCategory.value || !selectedLetter.value) return

  startingGame.value = true

  try {
    await gameStore.advanceToConfiguredRound(selectedCategory.value, selectedLetter.value)

    const gameId = gameStore.currentSession.value?.id
    if (gameId) {
      await goToGame(gameId)
    } else {
      await goToGame()
    }
    // Do not set startingGame to false on success so the spinner stays visible during navigation
  } catch (error) {
    const logger = useLogger()
    logger.error('Failed to start game:', error)
    startingGame.value = false
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

/* Vertical Double Wheel Layout */
.double-wheel-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  position: relative;
  gap: 0; /* Remove gap so we can control overlap */
}

.wheel-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.wheel-container {
  width: 100%;
  max-width: 380px;
  position: relative;
}

.wheel-container.flipped {
  /* Rotate top wheel so pointer is pointing down towards center button */
  transform: rotate(180deg);
}

/* Fix text rotation in flipped wheel label */
.wheel-wrapper.top-wheel .wheel-label {
  margin-bottom: var(--spacing-md);
}

.wheel-wrapper.bottom-wheel .wheel-label {
  margin-top: var(--spacing-md);
  order: 2; /* Put label below wheel */
}

/* Make wheels overlap slightly with the central button */
.top-wheel {
  margin-bottom: -30px;
}

.bottom-wheel {
  margin-top: -30px;
}

/* Central Spin Button */
.spin-button-zone {
  z-index: 10;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spin-button {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--color-border-gold);
  border: 4px solid var(--color-white);
  padding: 6px;
  cursor: pointer;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(255, 215, 0, 0.4),
    inset 0 4px 10px rgba(255, 255, 255, 0.6),
    inset 0 -4px 10px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
}

.spin-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(255, 215, 0, 0.6),
    inset 0 4px 10px rgba(255, 255, 255, 0.7);
}

.spin-button:active:not(:disabled) {
  transform: scale(0.95);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(255, 215, 0, 0.3),
    inset 0 6px 15px rgba(0, 0, 0, 0.3);
}

.spin-button:disabled {
  filter: grayscale(0.5) brightness(0.8);
  cursor: not-allowed;
  transform: scale(0.95);
}

.spin-button-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ff5252 0%, #d32f2f 70%);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow:
    inset 0 -4px 8px rgba(0, 0, 0, 0.4),
    inset 0 4px 8px rgba(255, 255, 255, 0.4);
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.spin-text {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  letter-spacing: 2px;
}

.wheel-label {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-lg), 4vw, var(--font-size-xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Inline Results (appear under wheel on completion) */
.inline-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(255, 215, 0, 0.15);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  border: 2px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.inline-result-icon {
  font-size: clamp(24px, 4vw, 36px);
}

.inline-result-text {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-lg), 3vw, var(--font-size-xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.4);
}

.inline-result-letter {
  font-size: clamp(var(--font-size-xl), 4vw, var(--font-size-2xl));
  background: linear-gradient(135deg, #ffd700, #ffa500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

/* Result pop transition */
.result-pop-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.result-pop-enter-from {
  opacity: 0;
  transform: scale(0.5) translateY(-10px);
}

/* Responsive */
@media (max-width: 480px) {
  .spin-button {
    width: 100px;
    height: 100px;
  }

  .spin-text {
    font-size: 22px;
  }

  .top-wheel {
    margin-bottom: -20px;
  }

  .bottom-wheel {
    margin-top: -20px;
  }
}

/* Extremely tall/narrow screens might need adjustment to fit both wheels */
@media (max-height: 800px) {
  .wheel-container {
    max-width: 300px; /* Make wheels slightly smaller to fit vertically */
  }

  .spin-button {
    width: 90px;
    height: 90px;
    border-width: 3px;
  }

  .spin-text {
    font-size: 20px;
  }

  .top-wheel {
    margin-bottom: -15px;
  }

  .bottom-wheel {
    margin-top: -15px;
  }
}
</style>
