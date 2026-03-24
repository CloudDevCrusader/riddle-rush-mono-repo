<template>
  <GameBackground>
    <div class="round-start-page">
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
            v-if="isFortuneWheelEnabled && !wheelsComplete"
            class="wheels-container"
            data-testid="round-wheels-container"
          >
            <div class="wheel-wrapper">
              <div class="wheel-label">
                {{ t('common.category', 'Category') }}
              </div>
              <FortuneWheel
                ref="categoryWheelRef"
                v-model="selectedCategory"
                :items="displayCategories"
                :get-item-key="(cat: any, idx: number) => cat?.searchWord || idx"
                :get-item-label="(cat: any) => t(`categories.${cat.searchWord}`, cat.name)"
                :get-item-icon="getCategoryIcon"
                center-icon="🎯"
                @spin-complete="onCategoryComplete"
              />
            </div>

            <div class="wheel-wrapper">
              <div class="wheel-label">
                {{ t('common.letter', 'Letter') }}
              </div>
              <FortuneWheel
                ref="letterWheelRef"
                v-model="selectedLetter"
                :items="alphabet"
                :get-item-key="(letter: string, idx: number) => letter"
                :get-item-label="(letter: string) => letter"
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
            data-testid="round-results-display"
          >
            <div class="result-item animate-scale-in" data-testid="round-category-display">
              <div class="result-label">
                {{ t('common.category', 'Category') }}
              </div>
              <div class="result-value">
                <span class="result-icon">{{ selectedCategoryIcon }}</span>
                <span class="result-text">{{ selectedCategoryName }}</span>
              </div>
            </div>

            <div class="divider">×</div>

            <div
              class="result-item animate-scale-in"
              style="animation-delay: 0.2s"
              data-testid="round-letter-display"
            >
              <div class="result-label">
                {{ t('common.letter', 'Letter') }}
              </div>
              <div class="result-value">
                <span class="result-text result-letter">{{ selectedLetter }}</span>
              </div>
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
  </GameBackground>
</template>

<script setup lang="ts">
import type { Category } from '@riddle-rush/types/game'
import { WHEEL_FADE_DELAY_MS, RESULTS_DISPLAY_DURATION_MS } from '@riddle-rush/shared/constants'

definePageMeta({ pageTransition: { name: 'slide-left', mode: 'out-in' } })

const { toast, t } = usePageSetup()
const { goToGame, goToPlayers } = useNavigation()
const { gameStore, nextRoundNumber } = useGameState()
const { isFortuneWheelEnabled } = useFeatureFlags()
const logger = useLogger()
const { startConfiguredRound } = useGameActions()

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
let wheelStartTimer: ReturnType<typeof setTimeout> | null = null
let wheelFadeTimer: ReturnType<typeof setTimeout> | null = null
let resultStartTimer: ReturnType<typeof setTimeout> | null = null
let wheelFallbackTimer: ReturnType<typeof setTimeout> | null = null

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

const fallbackCategory: Category = {
  id: 0,
  name: 'General',
  searchWord: 'general',
  key: 'general',
  searchProvider: 'offline',
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
  return nextRoundNumber.value || 1
})

onMounted(async () => {
  // Fetch all categories
  await gameStore.fetchCategories().catch((error: unknown) => {
    logger.warn('Falling back to local round-start category due fetch error', error)
  })
  const fetchedCategories = gameStore.categories.value ?? []
  const allCategories = fetchedCategories.length > 0 ? fetchedCategories : [fallbackCategory]

  // Always ensure deterministic fallback values are present
  selectedCategory.value =
    allCategories[Math.floor(Math.random() * allCategories.length)] ?? fallbackCategory
  selectedLetter.value = alphabet[Math.floor(Math.random() * alphabet.length)] ?? 'A'

  // If fortune wheel is disabled, skip directly to game
  if (!isFortuneWheelEnabled.value) {
    // Start game immediately
    await startGame()
    return
  }

  // Select up to 12 categories for the wheel
  displayCategories.value = allCategories.slice(0, 12)

  // Auto-spin both wheels immediately (will complete within 5 seconds)
  wheelStartTimer = setTimeout(() => {
    categoryWheelRef.value?.spinRandom()
    letterWheelRef.value?.spinRandom()
  }, 100)

  // Fallback: if wheel callbacks fail to fire, continue round start deterministically
  wheelFallbackTimer = setTimeout(() => {
    if (startingGame.value || wheelsComplete.value) return

    if (!selectedCategory.value) {
      selectedCategory.value =
        allCategories[Math.floor(Math.random() * allCategories.length)] ?? fallbackCategory
    }
    if (!selectedLetter.value) {
      selectedLetter.value = alphabet[Math.floor(Math.random() * alphabet.length)] ?? 'A'
    }

    if (selectedCategory.value && selectedLetter.value) {
      wheelsComplete.value = true
      void startGame()
    }
  }, 7000)
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
    wheelFadeTimer = setTimeout(() => {
      wheelsComplete.value = true

      // After showing results, start the game
      resultStartTimer = setTimeout(() => {
        void startGame()
      }, RESULTS_DISPLAY_DURATION_MS)
    }, WHEEL_FADE_DELAY_MS)
  }
}

const startGame = async () => {
  if (!selectedCategory.value || !selectedLetter.value) return

  startingGame.value = true
  if (wheelFallbackTimer) {
    clearTimeout(wheelFallbackTimer)
    wheelFallbackTimer = null
  }

  try {
    const currentSession = gameStore.currentSession.value
    const pendingNames = gameStore.pendingPlayerNames.value
    if (!currentSession && (!pendingNames || pendingNames.length === 0)) {
      // No players configured -- redirect to player setup instead of creating a ghost session
      await goToPlayers()
      return
    }

    const session = await startConfiguredRound(selectedCategory.value, selectedLetter.value)
    if (!session) {
      startingGame.value = false
      return
    }

    // Ensure proper flow transition after session creation
    // The store should automatically transition to in-round state

    // Navigate to game with game ID
    const gameId = session.id ?? gameStore.currentSession.value?.id
    if (gameId) {
      await goToGame(gameId)
    } else {
      await goToGame()
    }

    // CRITICAL: Ensure spinner is turned off on success
    startingGame.value = false
  } catch (error) {
    logger.error('Failed to start game:', error)
    startingGame.value = false
    // Show error to user
    toast.error(t('game.error_starting', 'Failed to start game. Please try again.'))
  }
}

onUnmounted(() => {
  if (wheelStartTimer) clearTimeout(wheelStartTimer)
  if (wheelFadeTimer) clearTimeout(wheelFadeTimer)
  if (resultStartTimer) clearTimeout(resultStartTimer)
  if (wheelFallbackTimer) clearTimeout(wheelFallbackTimer)
})

const pageTitle = computed(() => t('game.round_start_title'))

useHead({
  title: pageTitle,
  meta: [
    {
      name: 'description',
      content: () => t('game.round_start_description'),
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
  width: 100%;
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
  padding: 0 var(--spacing-md);
}

.wheel-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(var(--spacing-md), 3vw, var(--spacing-lg));
  max-width: 440px;
  padding: var(--spacing-md);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 0 20px rgba(255, 215, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.wheel-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.3),
    inset 0 0 25px rgba(255, 215, 0, 0.1);
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
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 182, 71, 0.1));
  border: 1px solid rgba(255, 215, 0, 0.3);
  backdrop-filter: blur(3px);
  animation: label-glow 2s ease-in-out infinite alternate;
}

@keyframes label-glow {
  0% {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }
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

/* Responsive - Stack wheels vertically on mobile */
@media (max-width: 768px) {
  .container {
    padding: clamp(var(--spacing-xl), 6vh, var(--spacing-2xl)) var(--spacing-lg);
  }

  .wheels-container {
    flex-direction: column;
    gap: clamp(var(--spacing-xl), 4vw, var(--spacing-2xl));
    width: 100%;
    max-width: 500px;
    padding: 0 var(--spacing-sm);
  }

  .wheel-wrapper {
    width: 100%;
    max-width: 400px;
    padding: var(--spacing-md);
    min-height: 480px;
    justify-content: center;
  }

  .wheel-label {
    font-size: clamp(var(--font-size-lg), 4vw, var(--font-size-xl));
    padding: var(--spacing-xs) var(--spacing-md);
  }

  .results-display {
    flex-direction: column;
    gap: clamp(var(--spacing-xl), 4vw, var(--spacing-2xl));
    width: calc(100% - 2rem);
    padding: 0 var(--spacing-sm);
  }

  .result-item {
    width: 100%;
    max-width: 400px;
    padding: clamp(var(--spacing-lg), 4vw, var(--spacing-xl));
  }

  .divider {
    transform: rotate(90deg);
    margin: var(--spacing-md) 0;
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
    gap: clamp(var(--spacing-lg), 3vw, var(--spacing-xl));
    max-width: 100%;
    padding: 0 var(--spacing-xs);
  }

  .wheel-wrapper {
    width: 100%;
    max-width: 340px;
    padding: var(--spacing-sm);
    min-height: 420px;
  }

  .wheel-label {
    font-size: clamp(var(--font-size-md), 4.5vw, var(--font-size-lg));
    padding: var(--spacing-xs) var(--spacing-sm);
    letter-spacing: 1px;
  }

  .results-display {
    width: calc(100% - 1.5rem);
    gap: clamp(var(--spacing-lg), 4vw, var(--spacing-xl));
  }

  .result-text {
    font-size: clamp(var(--font-size-xl), 5vw, var(--font-size-2xl));
  }

  .result-letter {
    font-size: clamp(48px, 12vw, 72px);
  }
}

/* Extra small mobile devices */
@media (max-width: 360px) {
  .wheels-container {
    gap: var(--spacing-md);
  }

  .wheel-wrapper {
    max-width: 300px;
    min-height: 380px;
    padding: var(--spacing-xs);
  }

  .wheel-label {
    font-size: clamp(var(--font-size-base), 5vw, var(--font-size-md));
  }

  .results-display {
    gap: var(--spacing-md);
  }

  .result-item {
    padding: var(--spacing-md);
  }
}

/* Pixel 7 Pro specific (412px width, tall screen) */
@media (min-width: 390px) and (max-width: 480px) {
  .container {
    padding: clamp(var(--spacing-xl), 6vh, var(--spacing-2xl)) var(--spacing-lg);
  }

  .wheels-container {
    gap: clamp(var(--spacing-lg), 3vw, var(--spacing-xl));
    max-width: 100%;
    padding: 0 var(--spacing-sm);
  }

  .wheel-wrapper {
    width: 100%;
    max-width: 360px;
    min-height: 440px;
    padding: var(--spacing-sm);
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
