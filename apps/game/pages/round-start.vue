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
      <!-- Flip-through animation (only shown if feature is enabled) -->
      <transition name="flip-fade">
        <div
          v-if="isFortuneWheelEnabled && !startingGame"
          class="flip-through-layout"
          data-testid="flip-container"
        >
          <!-- Category flip -->
          <div class="flip-section">
            <div class="flip-label">{{ t('common.category', 'Category') }}</div>
            <div class="flip-window" data-testid="flip-category">
              <div class="flip-track" :class="{ settled: categorySettled }">
                <div class="flip-item" :class="{ active: categorySettled }">
                  <span class="flip-icon">{{ currentCategoryIcon }}</span>
                  <span class="flip-text">{{ currentCategoryName }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Letter flip -->
          <div class="flip-section">
            <div class="flip-label">{{ t('common.letter', 'Letter') }}</div>
            <div class="flip-window" data-testid="flip-letter">
              <div class="flip-track" :class="{ settled: letterSettled }">
                <div class="flip-item" :class="{ active: letterSettled }">
                  <span class="flip-text flip-letter-text">{{ currentLetter }}</span>
                </div>
              </div>
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

const allCategories = ref<Category[]>([])
const categorySettled = ref(false)
const letterSettled = ref(false)
const currentDisplayCategory = ref<Category | null>(null)
const currentDisplayLetter = ref<string>('A')

const currentCategoryIcon = computed(() => {
  if (!currentDisplayCategory.value) return '📦'
  return categoryIconMap[currentDisplayCategory.value.searchWord] || '📦'
})

const currentCategoryName = computed(() => {
  if (!currentDisplayCategory.value) return ''
  return t(
    `categories.${currentDisplayCategory.value.searchWord}`,
    currentDisplayCategory.value.name
  )
})

const currentLetter = computed(() => currentDisplayLetter.value)

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

function runFlipAnimation<T>(
  items: T[],
  totalDuration: number,
  onTick: (item: T) => void
): Promise<T> {
  return new Promise((resolve) => {
    const finalIndex = Math.floor(Math.random() * items.length)
    const finalItem = items[finalIndex]!
    const startTime = Date.now()
    const minInterval = 50 // fastest flip speed (ms)
    const maxInterval = 400 // slowest before settling (ms)
    let lastTick = 0

    function tick() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / totalDuration, 1)

      // Quadratic ease-out: starts fast, slows down
      const eased = progress * progress
      const currentInterval = minInterval + (maxInterval - minInterval) * eased

      if (elapsed - lastTick >= currentInterval) {
        lastTick = elapsed
        if (progress < 0.85) {
          // Random item during animation
          const randomIdx = Math.floor(Math.random() * items.length)
          onTick(items[randomIdx]!)
        } else {
          // In the final stretch, show the target
          onTick(finalItem)
        }
      }

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        onTick(finalItem)
        resolve(finalItem)
      }
    }

    requestAnimationFrame(tick)
  })
}

onMounted(async () => {
  // Fetch all categories
  await gameStore.fetchCategories()
  const cats = gameStore.categories.value

  // If fortune wheel is disabled, skip directly to game
  if (!isFortuneWheelEnabled.value) {
    // Select random category and letter
    const randomCategory = cats[Math.floor(Math.random() * cats.length)]
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)]

    selectedCategory.value = randomCategory ?? null
    selectedLetter.value = randomLetter ?? null

    // Start game immediately
    await startGame()
    return
  }

  allCategories.value = cats

  // Start category flip
  const chosenCategory = await runFlipAnimation(cats, 2500, (cat) => {
    currentDisplayCategory.value = cat
  })
  categorySettled.value = true
  selectedCategory.value = chosenCategory

  // Brief pause then letter flip
  await new Promise((r) => setTimeout(r, 300))

  const chosenLetter = await runFlipAnimation(alphabet, 2000, (letter) => {
    currentDisplayLetter.value = letter
  })
  letterSettled.value = true
  selectedLetter.value = chosenLetter

  // Show results briefly then start game
  setTimeout(() => {
    startGame()
  }, RESULTS_DISPLAY_DURATION_MS)
})

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

/* Flip Through Layout */
.flip-through-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  gap: clamp(var(--spacing-xl), 5vh, var(--spacing-3xl));
}

.flip-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.flip-label {
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

.flip-window {
  width: 100%;
  max-width: 400px;
  height: 80px;
  overflow: hidden;
  position: relative;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 2px solid rgba(255, 215, 0, 0.3);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
}

.flip-track {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  transition: none;
}

.flip-track:not(.settled) .flip-item {
  animation: flipPulse 0.08s ease-in-out;
}

.flip-track.settled .flip-item {
  animation: flipSettle 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.flip-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
}

.flip-track.settled .flip-item.active {
  filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.6));
}

.flip-icon {
  font-size: clamp(28px, 5vw, 40px);
}

.flip-text {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-xl), 4vw, var(--font-size-2xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.flip-letter-text {
  font-size: clamp(var(--font-size-2xl), 6vw, 48px);
  background: linear-gradient(135deg, #ffd700, #ffa500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes flipPulse {
  0% {
    opacity: 0.3;
    transform: translateY(-8px);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0.3;
    transform: translateY(8px);
  }
}

@keyframes flipSettle {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
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

/* Transition for the flip layout */
.flip-fade-enter-active,
.flip-fade-leave-active {
  transition: all 0.8s ease-out;
}

.flip-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.flip-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 480px) {
  .flip-window {
    height: 70px;
    max-width: 320px;
  }
}

@media (max-height: 600px) {
  .flip-through-layout {
    gap: var(--spacing-lg);
  }
  .flip-window {
    height: 60px;
  }
}
</style>
