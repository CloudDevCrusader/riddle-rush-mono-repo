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
        />
      </button>
    </header>

    <div class="container">
      <div v-if="isFortuneWheelEnabled && !startingGame" class="round-start-wheel-block">
        <GameHeader color="gold" class="round-start-headline" data-testid="round-start-headline">
          {{ t('game.round_start_title') }}
        </GameHeader>
        <div
          v-if="showRoundStartCategoryLine"
          class="round-start-category-selection"
          data-testid="round-start-category-row"
        >
          <div class="round-start-selection-row">
            <span class="round-start-selection-row__label"
              >{{ t('common.category', 'Category') }}:</span
            >
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
                <span class="round-start-strip-cell__emoji" aria-hidden="true">{{
                  slot.emoji
                }}</span>
                <span
                  class="round-start-strip-cell__text"
                  :data-testid="slot.offset === 0 ? 'fortune-wheel-selected-category' : undefined"
                  >{{ slot.label }}</span
                >
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
import {
  type FortuneWheelCategoryDisplay,
  type FortuneWheelSelection,
  FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_EMOJI,
  FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_LABEL,
} from '~/types/fortune-wheel'

const { toast, t } = usePageSetup()
const { getAssetPath } = useAssets()
const { goToGame, goToPlayers } = useNavigation()
const { startConfiguredRound } = useGameActions()
const { gameStore } = useGameState()
const { isFortuneWheelEnabled } = useFeatureFlags()

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const startingGame = ref(false)

const allCategories = ref<Category[]>([])
const fortuneCategoryDisplay = ref<FortuneWheelCategoryDisplay | null>(null)

function handleRoundStartBack() {
  if (startingGame.value) return
  void goToPlayers()
}

function onFortuneCategoryDisplay(payload: FortuneWheelCategoryDisplay) {
  fortuneCategoryDisplay.value = payload
}

const showRoundStartCategoryLine = computed(
  () => isFortuneWheelEnabled.value && !startingGame.value && allCategories.value.length > 0
)

/** No pick yet (or idle) — centre shows * / -, side slots hidden. */
const categoryStripPlaceholder = computed(() => {
  const d = fortuneCategoryDisplay.value
  if (!d) return true
  return !d.isSpinning && d.categoryId == null
})

/** Side neighbours visible while spinning; after stop only the centre remains. */
const categoryStripSettled = computed(() => {
  const d = fortuneCategoryDisplay.value
  return !!(d && !d.isSpinning && d.categoryId != null)
})

const STRIP_OFFSETS = [-2, -1, 0, 1, 2] as const

function categoryIndexAtOffset(centerIdx: number, offset: number, n: number): number {
  if (n <= 0) return 0
  return (centerIdx + offset + n * 100) % n
}

const centerCategoryIndex = computed(() => {
  const d = fortuneCategoryDisplay.value
  const id = d?.categoryId
  if (id == null) return 0
  const list = allCategories.value
  const idx = list.findIndex((c) => c.id === id)
  return idx >= 0 ? idx : 0
})

const categoryStripSlots = computed(() => {
  const list = allCategories.value
  const n = list.length
  const d = fortuneCategoryDisplay.value
  const placeholder = !d || (!d.isSpinning && d.categoryId == null)

  if (placeholder) {
    return STRIP_OFFSETS.map((offset) => ({
      offset,
      category: null as Category | null,
      label: offset === 0 ? FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_LABEL : '\u00a0',
      emoji: offset === 0 ? FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_EMOJI : '',
    }))
  }

  const ci = centerCategoryIndex.value
  return STRIP_OFFSETS.map((offset) => {
    const cat = n ? list[categoryIndexAtOffset(ci, offset, n)]! : null
    return {
      offset,
      category: cat,
      label: cat ? t(`categories.${cat.searchWord}`, cat.name) : '—',
      emoji: gameStore.categoryEmoji(cat?.name ?? null),
    }
  })
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

    // Always pass the session id. Navigating to `/game` triggers session-guard to
    // `navigateTo(/game/:id)` — a second navigation that feels like a double reload.
    if (!session.id) {
      const logger = useLogger()
      logger.error('startGame: session missing id after startConfiguredRound')
      startingGame.value = false
      toast.error(t('game.error_starting', 'Failed to start game. Please try again.'))
      return
    }

    await goToGame(session.id)
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #1a1a2e;
}

.round-start-header {
  position: relative;
  z-index: 3;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: max(var(--spacing-md), env(safe-area-inset-top)) var(--spacing-md) var(--spacing-sm);
}

.round-start-back-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
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

.container {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-xl) max(var(--spacing-xl), env(safe-area-inset-bottom));
}

.round-start-wheel-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.round-start-headline {
  width: 100%;
  max-width: min(420px, 100%);
  margin-bottom: clamp(var(--spacing-md), 2vh, var(--spacing-xl));
}

.round-start-category-selection {
  width: 100%;
  max-width: min(420px, 100%);
  margin-bottom: var(--spacing-md);
}

.round-start-selection-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--spacing-sm);
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-base), 2.8vw, var(--font-size-xl));
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  text-shadow:
    0 1px 4px rgba(0, 0, 0, 0.45),
    0 0 12px rgba(11, 59, 118, 0.35);
}

.round-start-selection-row__label {
  flex-shrink: 0;
}

/* Horizontal “picker”: centre = current category; sides fade while spinning, then collapse. */
.round-start-category-strip {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: clamp(0.25rem, 1.5vw, 0.65rem);
  width: 100%;
  min-height: 3.25rem;
  padding: var(--spacing-xs) 0;
  mask-image: linear-gradient(90deg, transparent 0%, black 9%, black 91%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 9%, black 91%, transparent 100%);
}

.round-start-category-strip--spinning {
  animation: round-start-strip-reveal 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes round-start-strip-reveal {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.round-start-strip-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.15em;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 22%;
  text-align: center;
  opacity: 0.38;
  transform: scale(0.9);
  filter: blur(0.35px);
  transition:
    opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    max-width 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    flex 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    margin 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    padding 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.round-start-strip-cell[data-offset='-1'],
.round-start-strip-cell[data-offset='1'] {
  opacity: 0.52;
  transform: scale(0.94);
  filter: blur(0.15px);
}

.round-start-strip-cell--center {
  opacity: 1;
  transform: scale(1.06);
  max-width: 46%;
  filter: none;
  z-index: 1;
}

.round-start-strip-cell__emoji {
  font-size: clamp(1.15rem, 3.8vw, 1.65rem);
  line-height: 1;
  transition:
    opacity 0.22s cubic-bezier(0.25, 0.8, 0.35, 1),
    transform 0.26s cubic-bezier(0.25, 0.8, 0.35, 1);
}

.round-start-strip-cell__text {
  display: block;
  width: 100%;
  font-size: 0.72em;
  font-weight: var(--font-weight-bold);
  line-height: 1.15;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    opacity 0.22s cubic-bezier(0.25, 0.8, 0.35, 1),
    transform 0.26s cubic-bezier(0.25, 0.8, 0.35, 1);
}

.round-start-strip-cell--center .round-start-strip-cell__emoji {
  font-size: clamp(1.35rem, 4.5vw, 1.95rem);
}

.round-start-strip-cell--center .round-start-strip-cell__text {
  font-size: 0.88em;
  font-weight: var(--font-weight-black);
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* After spin: only the winner stays; neighbours disappear */
.round-start-category-strip--settled .round-start-strip-cell:not(.round-start-strip-cell--center) {
  opacity: 0;
  max-width: 0;
  min-width: 0;
  flex: 0 0 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  transform: scale(0.88);
  filter: blur(5px);
  pointer-events: none;
}

.round-start-category-strip--settled {
  mask-image: none;
  -webkit-mask-image: none;
}

/* Before spin: only centre placeholder (* / -). */
.round-start-category-strip--placeholder
  .round-start-strip-cell:not(.round-start-strip-cell--center) {
  opacity: 0;
  max-width: 0;
  min-width: 0;
  flex: 0 0 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  pointer-events: none;
}

.round-start-category-strip--placeholder {
  mask-image: none;
  -webkit-mask-image: none;
}

.round-start-category-strip--placeholder .round-start-strip-cell--center {
  max-width: 100%;
  flex: 1 1 auto;
  transform: scale(1);
  opacity: 1;
  filter: none;
}

.round-start-category-strip--settled .round-start-strip-cell--center {
  max-width: 100%;
  flex: 1 1 auto;
  transform: scale(1);
}

.round-start-category-strip--land-pulse .round-start-strip-cell--center {
  animation: round-start-strip-land-pop 0.62s cubic-bezier(0.28, 1.15, 0.4, 1);
}

@keyframes round-start-strip-land-pop {
  0% {
    transform: scale(0.96);
    opacity: 0.88;
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Narrow: three slots (offsets -1, 0, +1) */
@media (max-width: 520px) {
  .round-start-strip-cell[data-offset='-2'],
  .round-start-strip-cell[data-offset='2'] {
    display: none;
  }

  .round-start-strip-cell:not(.round-start-strip-cell--center) {
    max-width: 28%;
  }

  .round-start-strip-cell--center {
    max-width: 52%;
  }
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
