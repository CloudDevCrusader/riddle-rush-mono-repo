<template>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  <div class="fortune-wheel-wrapper" data-testid="fortune-wheel-container">
    <div class="fortune-wheel-canvas">
      <ClientOnly>
        <FortuneWheel
          ref="wheelRef"
          :verify="true"
          :disabled="isSpinning || !hasSegments"
          :prizes="wheelPrizes"
          :prize-id="targetPrizeId"
          @rotate-start="onRotateStart"
          @rotate-end="onRotateEnd"
        />
      </ClientOnly>
    </div>

    <div class="fortune-wheel-selection">
      <div class="selection-row">
        <span>{{ t('common.category', 'Category') }}:</span>
        <strong data-testid="fortune-wheel-selected-category">{{ selectedCategoryLabel }}</strong>
      </div>
      <div class="selection-row">
        <span>{{ t('common.letter', 'Letter') }}:</span>
        <strong data-testid="fortune-wheel-selected-letter">{{ selectedLetterLabel }}</strong>
=======
=======
>>>>>>> Stashed changes
  <div
    class="fortune-wheel-wrapper"
    data-testid="fortune-wheel-container"
  >
    <!-- Category on the wheel card (round-start); strip above stays the main “picker” animation. -->
    <div
      v-if="!embedCategoryRow"
      class="fortune-wheel-category-chip"
      data-testid="fortune-wheel-inline-category"
    >
      <span
        class="fortune-wheel-category-chip__emoji"
        aria-hidden="true"
      >{{
        wheelCategoryEmoji
      }}</span>
      <span
        class="fortune-wheel-category-chip__label"
        :class="{
          'category-label--flipping': isSpinning,
          'category-label--landed': showCategoryLandPulse,
        }"
      >{{ selectedCategoryLabel }}</span>
    </div>

    <div class="fortune-wheel-stage">
      <div class="fortune-wheel-canvas">
        <ClientOnly>
          <FortuneWheel
            ref="wheelRef"
            :verify="true"
            :use-weight="true"
            :disabled="isSpinning || !hasSegments"
            :canvas="wheelCanvasOptions"
            :prizes="wheelPrizes"
            :prize-id="targetPrizeId"
            @rotate-start="onRotateStart"
            @rotate-end="onRotateEnd"
          />
        </ClientOnly>
        <div
          class="fortune-wheel-hub"
          aria-live="polite"
        >
          <span
            class="fortune-wheel-hub-letter"
            data-testid="fortune-wheel-selected-letter"
            :class="{
              'fortune-wheel-hub-letter--idle': hubLetterIdle,
              'fortune-wheel-hub-letter--spinning': isSpinning,
              'fortune-wheel-hub-letter--landed': showCategoryLandPulse && !!pendingSelection,
            }"
          >{{ hubLetterDisplay }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="embedCategoryRow"
      class="fortune-wheel-selection"
    >
      <div class="selection-row selection-row--mockup">
        <span class="selection-row__prefix">{{ t('common.category', 'Category') }}:</span>
        <strong
          data-testid="fortune-wheel-selected-category"
          class="selection-row__value"
          :class="{
            'category-label--flipping': isSpinning,
            'category-label--landed': showCategoryLandPulse,
          }"
        >{{ selectedCategoryLabel }}</strong>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      </div>
    </div>

    <div class="fortune-wheel-actions">
      <GameButton
        data-testid="fortune-wheel-spin-button"
        :disabled="isSpinning || !hasSegments"
        @click="startSpin"
      >
        {{ t('game.spin_letter', 'Spin Letter') }}
      </GameButton>

      <GameButton
        data-testid="fortune-wheel-confirm-button"
        :disabled="isSpinning || !pendingSelection"
        @click="confirmSelection"
      >
        {{ t('common.ok', 'OK') }}
      </GameButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import FortuneWheel from 'vue-fortune-wheel'
import 'vue-fortune-wheel/style.css'
import type { Category } from '@riddle-rush/types/game'
import type { FortuneWheelSegment, FortuneWheelSelection } from '~/types/fortune-wheel'
import { useFortuneWheelSelection } from '~/composables/useFortuneWheelSelection'

interface WheelPrize {
  id: number
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  value: string
  weight: number
}

=======
=======
>>>>>>> Stashed changes
  name: string
  value: string
  weight: number
  bgColor: string
  color: string
}

/** Canvas wedge colors — vue-fortune-wheel draws `name` / `bgColor` / `color` in canvas mode. */
const WHEEL_SEGMENT_PALETTE: ReadonlyArray<{ bg: string, fg: string }> = [
  { bg: '#0b7ad6', fg: '#ffffff' },
  { bg: '#5fc423', fg: '#0b3b76' },
  { bg: '#44c8ff', fg: '#0b3b76' },
  { bg: '#ff9500', fg: '#ffffff' },
  { bg: '#9bb6da', fg: '#0b3b76' },
  { bg: '#ffd54f', fg: '#0b3b76' },
];

/** How often the preview category advances while the wheel spins (round-start strip + embedded row). */
const CATEGORY_FLIP_INTERVAL_MS = 132;

>>>>>>> Stashed changes
interface RotateStartCallback {
  (): void
}

interface WheelRef {
  startRotate: () => void
}

<<<<<<< Updated upstream
const props = defineProps<{
  categories: Category[]
  letters?: string[]
}>()

const emit = defineEmits<{
  (event: 'selection-ready', payload: FortuneWheelSelection): void
}>()
=======
const props = withDefaults(
  defineProps<{
    categories: Category[]
    letters?: string[]
    /** When false, omit the category row here; parent should listen to `category-display`. */
    embedCategoryRow?: boolean
  }>(),
  { letters: () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), embedCategoryRow: true },
);

const emit = defineEmits<{
  (event: 'selection-ready', payload: FortuneWheelSelection): void
  (event: 'category-display', payload: FortuneWheelCategoryDisplay): void
}>();
>>>>>>> Stashed changes

const { t } = useI18n()
const { mapCategoriesToSegments, validateSelection } = useFortuneWheelSelection()

const wheelRef = ref<WheelRef | null>(null)
const isSpinning = ref(false)
const targetPrizeId = ref(0)
const pendingSegment = ref<FortuneWheelSegment | null>(null)
const pendingSelection = ref<FortuneWheelSelection | null>(null)
const fallbackTimer = ref<ReturnType<typeof setTimeout> | null>(null)

<<<<<<< Updated upstream
const segments = computed(() => mapCategoriesToSegments(props.categories, props.letters))
const hasSegments = computed(() => segments.value.length > 0)

const wheelPrizes = computed<WheelPrize[]>(() =>
  segments.value.map((segment) => ({
    id: segment.id,
    value: `${segment.categoryName} · ${segment.letter}`,
    weight: segment.weight ?? 1,
  }))
)
=======
const segments = computed(() => mapAlphabetToSegments(props.letters));
const hasSegments = computed(() => segments.value.length > 0 && props.categories.length > 0);

const spinButtonDisabled = computed(
  () =>
    isSpinning.value
    || !hasSegments.value
    || (!fortuneWheelAllowRedraw.value && !!pendingSelection.value),
);

const wheelCanvasOptions = computed(() => {
  const n = segments.value.length;
  const fontSize = n > 20 ? 15 : n > 14 ? 20 : 26;
  return {
    borderColor: 'rgba(255, 213, 79, 0.55)',
    borderWidth: 4,
    btnText: ' ',
    fontSize,
    textLength: 2,
    lineHeight: Math.max(14, fontSize - 2),
  };
});

const wheelPrizes = computed<WheelPrize[]>(() =>
  segments.value.map((segment, index) => {
    const { bg, fg } = WHEEL_SEGMENT_PALETTE[index % WHEEL_SEGMENT_PALETTE.length]!;
    return {
      id: segment.id,
      name: segment.letter,
      value: segment.letter,
      weight: segment.weight ?? 1,
      bgColor: bg,
      color: fg,
    };
  }),
);

watch(
  () => props.categories.map(c => c.id).join(','),
  () => {
    pickedCategoryId.value = null;
    pendingSelection.value = null;
    spinOutcomeCategoryId.value = null;
  },
);

watch(
  () => segments.value,
  (next) => {
    if (!next.length) return;
    const valid = next.some(s => s.id === targetPrizeId.value);
    if (!valid) {
      targetPrizeId.value = next[0]!.id;
    }
  },
  { immediate: true },
);

function labelForCategoryId(id: number | null): string {
  if (id == null) return FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_LABEL;
  const category = props.categories.find(entry => entry.id === id);
  return category ? t(`categories.${category.searchWord}`, category.name) : '—';
}
>>>>>>> Stashed changes

const selectedCategoryLabel = computed(() => {
  if (!pendingSelection.value) return '-'
  const category = props.categories.find((entry) => entry.id === pendingSelection.value?.categoryId)
  return category ? t(`categories.${category.searchWord}`, category.name) : '-'
})

const selectedLetterLabel = computed(() => pendingSelection.value?.letter ?? '-')

<<<<<<< Updated upstream
function chooseRandomSegment(): FortuneWheelSegment | null {
  if (!segments.value.length) return null
  const index = Math.floor(Math.random() * segments.value.length)
  return segments.value[index] ?? null
=======
const categoryDisplayPayload = computed<FortuneWheelCategoryDisplay>(() => ({
  categoryId: displayedCategoryId.value,
  label: selectedCategoryLabel.value,
  isSpinning: isSpinning.value,
  landedPulse: showCategoryLandPulse.value,
}));

watch(
  categoryDisplayPayload,
  (payload) => {
    if (!props.embedCategoryRow) {
      emit('category-display', payload);
    }
  },
  { immediate: true },
);

const wheelCategoryEmoji = computed(() => {
  const id = displayedCategoryId.value;
  if (id == null) return FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_EMOJI;
  const cat = props.categories.find(c => c.id === id);
  return resolveCategoryEmoji(cat?.name);
});

/** Large letter in wheel hub (game screen–style); not the legacy “Letter:” row. */
const hubLetterDisplay = computed(() => {
  const settled = pendingSelection.value?.letter;
  if (settled) return settled.toUpperCase();
  if (isSpinning.value && pendingSegment.value?.letter) {
    return pendingSegment.value.letter.toUpperCase();
  }
  return '?';
});

const hubLetterIdle = computed(
  () => !isSpinning.value && !pendingSelection.value && !pendingSegment.value,
);

function chooseRandomSegment(): AlphabetWheelSegment | null {
  if (!segments.value.length) return null;
  const index = Math.floor(Math.random() * segments.value.length);
  return segments.value[index] ?? null;
}

function resolvePendingFromLetter(letter: string) {
  const catId = pickedCategoryId.value;
  if (catId == null) return null;
  return validateSelection({ categoryId: catId, letter }, props.categories);
}

function stopCategoryFlip() {
  if (categoryFlipIntervalId.value) {
    clearInterval(categoryFlipIntervalId.value);
    categoryFlipIntervalId.value = null;
  }
}

function startCategoryFlip() {
  stopCategoryFlip();
  const n = props.categories.length;
  if (n) {
    categoryFlipIndex.value = Math.floor(Math.random() * n);
    categoryFlipDirection.value = Math.random() < 0.5 ? 1 : -1;
  }

  const tick = () => {
    const len = props.categories.length;
    if (!len) return;
    // Mostly move one slot (neighbours on the strip update smoothly); rare jump avoids a mechanical feel.
    if (Math.random() < 0.09) {
      categoryFlipIndex.value = Math.floor(Math.random() * len);
    } else {
      const d = categoryFlipDirection.value;
      categoryFlipIndex.value = (categoryFlipIndex.value + d + len * 32) % len;
    }
    if (Math.random() < 0.07) {
      categoryFlipDirection.value *= -1;
    }
  };
  tick();
  categoryFlipIntervalId.value = setInterval(tick, CATEGORY_FLIP_INTERVAL_MS);
}

function finalizeSpin(letter: string | null) {
  stopCategoryFlip();
  isSpinning.value = false;

  const outcomeId = spinOutcomeCategoryId.value;
  if (outcomeId != null) {
    pickedCategoryId.value = outcomeId;
  }

  pendingSelection.value = letter ? resolvePendingFromLetter(letter) : null;
  pendingSegment.value = null;
  spinOutcomeCategoryId.value = null;

  const sel = pendingSelection.value;
  if (sel) {
    showCategoryLandPulse.value = true;
    setTimeout(() => {
      showCategoryLandPulse.value = false;
    }, 550);
  }

  if (sel && !fortuneWheelAllowRedraw.value) {
    if (autoAdvanceTimer.value) {
      clearTimeout(autoAdvanceTimer.value);
    }
    autoAdvanceTimer.value = setTimeout(() => {
      autoAdvanceTimer.value = null;
      emit('selection-ready', sel);
    }, 720);
  }
>>>>>>> Stashed changes
}

function startSpin() {
  if (isSpinning.value || !hasSegments.value) return

  const nextSegment = chooseRandomSegment()
  if (!nextSegment) return

  isSpinning.value = true
  pendingSelection.value = null
  pendingSegment.value = nextSegment
  targetPrizeId.value = nextSegment.id

  if (fallbackTimer.value) {
    clearTimeout(fallbackTimer.value)
  }

  fallbackTimer.value = setTimeout(() => {
    if (!pendingSelection.value && pendingSegment.value) {
      pendingSelection.value = validateSelection(pendingSegment.value, props.categories)
    }
    pendingSegment.value = null
    isSpinning.value = false
  }, 4500)

  const startRotate = wheelRef.value?.startRotate
  if (typeof startRotate === 'function') {
    startRotate()
  }
}

function onRotateStart(rotate?: RotateStartCallback) {
  isSpinning.value = true
  if (typeof rotate === 'function') {
    rotate()
  }
}

function onRotateEnd(prize: { id?: number }) {
  if (fallbackTimer.value) {
    clearTimeout(fallbackTimer.value)
    fallbackTimer.value = null
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  isSpinning.value = false

  const resolvedPrizeId =
    typeof prize.id === 'number' ? prize.id : typeof prize.id === 'string' ? Number(prize.id) : NaN

  const selectedSegment =
    segments.value.find((segment) => segment.id === resolvedPrizeId) ?? pendingSegment.value
=======
  const resolvedPrizeId
    = typeof prize.id === 'number' ? prize.id : typeof prize.id === 'string' ? Number(prize.id) : Number.NaN;
=======
  const resolvedPrizeId
    = typeof prize.id === 'number' ? prize.id : typeof prize.id === 'string' ? Number(prize.id) : Number.NaN;

  const selectedSegment
    = segments.value.find(segment => segment.id === resolvedPrizeId) ?? pendingSegment.value;
>>>>>>> Stashed changes

  const selectedSegment
    = segments.value.find(segment => segment.id === resolvedPrizeId) ?? pendingSegment.value;
>>>>>>> Stashed changes

  pendingSelection.value = validateSelection(selectedSegment, props.categories)
  pendingSegment.value = null
}

function confirmSelection() {
  if (!pendingSelection.value || isSpinning.value) return
  emit('selection-ready', pendingSelection.value)
}

onBeforeUnmount(() => {
  if (fallbackTimer.value) {
    clearTimeout(fallbackTimer.value)
  }
})
</script>

<style scoped>
.fortune-wheel-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  align-items: center;
  width: 100%;
}

.fortune-wheel-canvas {
  width: min(420px, 100%);
}

.fortune-wheel-selection {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

.selection-row {
  display: flex;
  justify-content: space-between;
}

.fortune-wheel-actions {
  display: flex;
  gap: var(--spacing-md);
}
</style>
