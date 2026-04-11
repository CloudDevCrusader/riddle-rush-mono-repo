<template>
  <div class="round-start-page">
    <img
      :src="getAssetPath('assets/alphabets/background.png')"
      alt=""
      class="page-bg"
      loading="eager"
      fetchpriority="high"
      width="1920"
      height="1080"
    />

    <div class="top-bar">
      <div class="round-indicator" data-testid="round-indicator">
        <div class="round-text">{{ t('game.round', 'Round') }} {{ currentRoundNumber }}</div>
      </div>
    </div>

    <div class="container">
      <FortuneAlphabetWheel
        v-if="isFortuneWheelEnabled && !startingGame"
        :categories="allCategories"
        @selection-ready="onSelectionReady"
      />

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
import type { FortuneWheelSelection } from '~/types/fortune-wheel'

const { toast, t } = usePageSetup()
const { getAssetPath } = useAssets()
const { goToGame } = useNavigation()
const { startConfiguredRound } = useGameActions()
const { gameStore } = useGameState()
const { isFortuneWheelEnabled } = useFeatureFlags()

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const startingGame = ref(false)

const allCategories = ref<Category[]>([])

const currentRoundNumber = computed(() => {
  const session = gameStore.currentSession.value
  if (!session) return 1
  const isCurrentRoundCompleted = session.roundHistory.length >= session.currentRound
  return isCurrentRoundCompleted ? session.currentRound + 1 : session.currentRound
})

async function startGame(category: Category, letter: string) {
  await gameStore.fetchCategories()
  startingGame.value = true

  try {
    const session = await startConfiguredRound(category, letter)
    if (!session) {
      startingGame.value = false
      return
    }

    const gameId = gameStore.currentSession.value?.id
    if (gameId) {
      await goToGame(gameId)
    } else {
      await goToGame()
    }
  } catch (error) {
    const logger = useLogger()
    logger.error('Failed to start game:', error)
    startingGame.value = false
    toast.error(t('game.error_starting', 'Failed to start game. Please try again.'))
  }
}

async function startFallbackRound(categories: Category[]) {
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]
  const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)]

  if (!randomCategory || !randomLetter) {
    toast.error(t('game.error_starting', 'Failed to start game. Please try again.'))
    return
  }

  await startGame(randomCategory, randomLetter)
}

async function onSelectionReady(selection: FortuneWheelSelection) {
  if (startingGame.value) return

  const selectedCategory = allCategories.value.find(
    (category) => category.id === selection.categoryId
  )

  if (!selectedCategory) {
    toast.error(t('game.error_starting', 'Failed to start game. Please try again.'))
    return
  }

  await startGame(selectedCategory, selection.letter)
}

onMounted(async () => {
  await gameStore.fetchCategories()
  const categories = gameStore.categories.value
  allCategories.value = categories

  if (!categories.length) {
    toast.error(t('game.error_starting', 'Failed to start game. Please try again.'))
    return
  }

  if (!isFortuneWheelEnabled.value) {
    await startFallbackRound(categories)
  }
})

useLocalizedPageSeo({
  title: () => t('game.round_start_title'),
  description: () => t('game.round_start_description'),
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

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

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
</style>
