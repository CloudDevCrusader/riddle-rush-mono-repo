<template>
  <div class="round-start-page">
    <NuxtImg
      :src="`${baseUrl}assets/alphabets/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
      format="webp"
      quality="80"
      preset="background"
      loading="eager"
<<<<<<< Updated upstream
      preload
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
=======
      fetchpriority="high"
      width="1920"
      height="1080"
    >

    <header class="round-start-header">
      <button
        type="button"
        class="game-back-btn game-back-btn--red tap-highlight no-select"
        data-testid="round-start-back-button"
        :disabled="startingGame"
        :aria-label="t('common.back')"
        @click="handleRoundStartBack"
      >
        <img
          :src="getAssetPath('assets/alphabets/back.png')"
          :alt="t('common.back')"
          class="round-start-back-icon"
          loading="eager"
          width="32"
          height="32"
        >
      </button>
    </header>

    <div class="container">
      <div
        v-if="isFortuneWheelEnabled && !startingGame"
        class="round-start-wheel-block"
      >
        <GameHeader
          color="gold"
          class="round-start-headline"
          data-testid="round-start-headline"
        >
          {{ t('game.round_start_title') }}
        </GameHeader>
        <div
          v-if="showRoundStartCategoryLine"
          class="round-start-category-selection"
          data-testid="round-start-category-row"
        >
          <div class="round-start-selection-row">
            <span class="round-start-selection-row__label">{{ t('common.category', 'Category') }}:</span>
            <div
              class="round-start-category-strip"
              :class="{
                'round-start-category-strip--spinning': fortuneCategoryDisplay?.isSpinning,
                'round-start-category-strip--settled': categoryStripSettled,
                'round-start-category-strip--placeholder': categoryStripPlaceholder,
                'round-start-category-strip--land-pulse': fortuneCategoryDisplay?.landedPulse,
              }"
              role="group"
              :aria-label="t('common.category', 'Category')"
            >
              <div
                v-for="slot in categoryStripSlots"
                :key="slot.offset"
                class="round-start-strip-cell"
                :data-offset="slot.offset"
                :class="{ 'round-start-strip-cell--center': slot.offset === 0 }"
              >
                <span
                  class="round-start-strip-cell__emoji"
                  aria-hidden="true"
                >{{
                  slot.emoji
                }}</span>
                <span
                  class="round-start-strip-cell__text"
                  :data-testid="slot.offset === 0 ? 'fortune-wheel-selected-category' : undefined"
                >{{ slot.label }}</span>
              </div>
            </div>
          </div>
        </div>
        <FortuneAlphabetWheel
          :categories="allCategories"
          :embed-category-row="false"
          @category-display="onFortuneCategoryDisplay"
          @selection-ready="onSelectionReady"
        />
      </div>
>>>>>>> Stashed changes

      <div
        v-if="startingGame"
        class="loading-container"
        data-testid="round-loading"
      >
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

const { baseUrl, toast, t } = usePageSetup()
const { goToGame } = useNavigation()
const { startConfiguredRound } = useGameActions()
const { gameStore } = useGameState()
const { isFortuneWheelEnabled } = useFeatureFlags()

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const startingGame = ref(false)

const allCategories = ref<Category[]>([])

<<<<<<< Updated upstream
const currentRoundNumber = computed(() => {
  const session = gameStore.currentSession.value
  if (!session) return 1
  const isCurrentRoundCompleted = session.roundHistory.length >= session.currentRound
  return isCurrentRoundCompleted ? session.currentRound + 1 : session.currentRound
})
=======
function handleRoundStartBack() {
  if (startingGame.value) return;
  void goToPlayers();
}

function onFortuneCategoryDisplay(payload: FortuneWheelCategoryDisplay) {
  fortuneCategoryDisplay.value = payload;
}

const showRoundStartCategoryLine = computed(
  () => isFortuneWheelEnabled.value && !startingGame.value && allCategories.value.length > 0,
);

/** No pick yet (or idle) — centre shows * / -, side slots hidden. */
const categoryStripPlaceholder = computed(() => {
  const d = fortuneCategoryDisplay.value;
  if (!d) return true;
  return !d.isSpinning && d.categoryId == null;
});

/** Side neighbours visible while spinning; after stop only the centre remains. */
const categoryStripSettled = computed(() => {
  const d = fortuneCategoryDisplay.value;
  return !!(d && !d.isSpinning && d.categoryId != null);
});

const STRIP_OFFSETS = [-2, -1, 0, 1, 2] as const;

function categoryIndexAtOffset(centerIdx: number, offset: number, n: number): number {
  if (n <= 0) return 0;
  return (centerIdx + offset + n * 100) % n;
}

const centerCategoryIndex = computed(() => {
  const d = fortuneCategoryDisplay.value;
  const id = d?.categoryId;
  if (id == null) return 0;
  const list = allCategories.value;
  const idx = list.findIndex(c => c.id === id);
  return idx >= 0 ? idx : 0;
});

const categoryStripSlots = computed(() => {
  const list = allCategories.value;
  const n = list.length;
  const d = fortuneCategoryDisplay.value;
  const placeholder = !d || (!d.isSpinning && d.categoryId == null);

  if (placeholder) {
    return STRIP_OFFSETS.map(offset => ({
      offset,
      category: null as Category | null,
      label: offset === 0 ? FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_LABEL : '\u00A0',
      emoji: offset === 0 ? FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_EMOJI : '',
    }));
  }

  const ci = centerCategoryIndex.value;
  return STRIP_OFFSETS.map((offset) => {
    const cat = n ? list[categoryIndexAtOffset(ci, offset, n)]! : null;
    return {
      offset,
      category: cat,
      label: cat ? t(`categories.${cat.searchWord}`, cat.name) : '—',
      emoji: gameStore.categoryEmoji(cat?.name ?? null),
    };
  });
});
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    (category) => category.id === selection.categoryId
  )
=======
=======
>>>>>>> Stashed changes
    category => category.id === selection.categoryId,
  );
>>>>>>> Stashed changes

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
