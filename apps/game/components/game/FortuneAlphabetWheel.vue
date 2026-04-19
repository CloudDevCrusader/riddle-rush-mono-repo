<template>
  <div class="fortune-wheel-wrapper" data-testid="fortune-wheel-container">
    <!-- Category on the wheel card (round-start); strip above stays the main “picker” animation. -->
    <div
      v-if="!embedCategoryRow"
      class="fortune-wheel-category-chip"
      data-testid="fortune-wheel-inline-category"
    >
      <span class="fortune-wheel-category-chip__emoji" aria-hidden="true">{{
        wheelCategoryEmoji
      }}</span>
      <span
        class="fortune-wheel-category-chip__label"
        :class="{
          'category-label--flipping': isSpinning,
          'category-label--landed': showCategoryLandPulse,
        }"
        >{{ selectedCategoryLabel }}</span
      >
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
        <div class="fortune-wheel-hub" aria-live="polite">
          <span
            class="fortune-wheel-hub-letter"
            data-testid="fortune-wheel-selected-letter"
            :class="{
              'fortune-wheel-hub-letter--idle': hubLetterIdle,
              'fortune-wheel-hub-letter--spinning': isSpinning,
              'fortune-wheel-hub-letter--landed': showCategoryLandPulse && !!pendingSelection,
            }"
            >{{ hubLetterDisplay }}</span
          >
        </div>
      </div>
    </div>

    <div v-if="embedCategoryRow" class="fortune-wheel-selection">
      <div class="selection-row selection-row--mockup">
        <span class="selection-row__prefix">{{ t('common.category', 'Category') }}:</span>
        <strong
          data-testid="fortune-wheel-selected-category"
          class="selection-row__value"
          :class="{
            'category-label--flipping': isSpinning,
            'category-label--landed': showCategoryLandPulse,
          }"
          >{{ selectedCategoryLabel }}</strong
        >
      </div>
    </div>

    <GameButtonGroup layout="row" justify="center" relaxed wrap class="fortune-wheel-actions">
      <GameButton
        v-if="fortuneWheelAllowRedraw"
        data-testid="fortune-wheel-spin-button"
        :disabled="spinButtonDisabled"
        @click="startSpin"
      >
        {{ t('game.fortune_wheel_spin') }}
      </GameButton>

      <GameButton
        v-if="fortuneWheelAllowRedraw"
        data-testid="fortune-wheel-confirm-button"
        :disabled="isSpinning || !pendingSelection"
        @click="confirmSelection"
      >
        {{ t('common.ok', 'OK') }}
      </GameButton>
    </GameButtonGroup>
  </div>
</template>

<script setup lang="ts">
import FortuneWheel from 'vue-fortune-wheel';
import 'vue-fortune-wheel/style.css';
import type { Category } from '@riddle-rush/types/game';
import {
  type AlphabetWheelSegment,
  type FortuneWheelCategoryDisplay,
  type FortuneWheelSelection,
  FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_EMOJI,
  FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_LABEL,
} from '~/types/fortune-wheel';
import { useCategoryEmoji } from '~/composables/useCategoryEmoji';
import { useFortuneWheelSelection } from '~/composables/useFortuneWheelSelection';

const { resolve: resolveCategoryEmoji } = useCategoryEmoji();

interface WheelPrize {
  id: number;
  name: string;
  value: string;
  weight: number;
  bgColor: string;
  color: string;
}

/** Canvas wedge colors — vue-fortune-wheel draws `name` / `bgColor` / `color` in canvas mode. */
const WHEEL_SEGMENT_PALETTE: ReadonlyArray<{ bg: string; fg: string }> = [
  { bg: '#0b7ad6', fg: '#ffffff' },
  { bg: '#5fc423', fg: '#0b3b76' },
  { bg: '#44c8ff', fg: '#0b3b76' },
  { bg: '#ff9500', fg: '#ffffff' },
  { bg: '#9bb6da', fg: '#0b3b76' },
  { bg: '#ffd54f', fg: '#0b3b76' },
];

/** How often the preview category advances while the wheel spins (round-start strip + embedded row). */
const CATEGORY_FLIP_INTERVAL_MS = 132;

interface RotateStartCallback {
  (): void;
}

interface WheelRef {
  startRotate: () => void;
}

const props = withDefaults(
  defineProps<{
    categories: Category[];
    letters?: string[];
    /** When false, omit the category row here; parent should listen to `category-display`. */
    embedCategoryRow?: boolean;
  }>(),
  { letters: () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), embedCategoryRow: true }
);

const emit = defineEmits<{
  (event: 'selection-ready', payload: FortuneWheelSelection): void;
  (event: 'category-display', payload: FortuneWheelCategoryDisplay): void;
}>();

const { t } = useI18n();
const { mapAlphabetToSegments, validateSelection } = useFortuneWheelSelection();
const { fortuneWheelAllowRedraw } = useSettings();

const wheelRef = ref<WheelRef | null>(null);
const isSpinning = ref(false);
const targetPrizeId = ref(1);
const pendingSegment = ref<AlphabetWheelSegment | null>(null);
const pendingSelection = ref<FortuneWheelSelection | null>(null);
const fallbackTimer = ref<ReturnType<typeof setTimeout> | null>(null);
/** Set when the spin ends — pairs with the letter from the wheel. */
const pickedCategoryId = ref<number | null>(null);
/** Random category chosen at spin start; revealed when the wheel stops. */
const spinOutcomeCategoryId = ref<number | null>(null);
/** Index into `categories` while spinning — steps like a carousel for smoother motion. */
const categoryFlipIndex = ref(0);
/** +1 / -1 while flipping; occasional reversal adds variety without random jumps. */
const categoryFlipDirection = ref(1);
const categoryFlipIntervalId = ref<ReturnType<typeof setInterval> | null>(null);
const autoAdvanceTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const showCategoryLandPulse = ref(false);

const segments = computed(() => mapAlphabetToSegments(props.letters));
const hasSegments = computed(() => segments.value.length > 0 && props.categories.length > 0);

const spinButtonDisabled = computed(
  () =>
    isSpinning.value ||
    !hasSegments.value ||
    (!fortuneWheelAllowRedraw.value && !!pendingSelection.value)
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
  })
);

watch(
  () => props.categories.map((c) => c.id).join(','),
  () => {
    pickedCategoryId.value = null;
    pendingSelection.value = null;
    spinOutcomeCategoryId.value = null;
  }
);

watch(
  () => segments.value,
  (next) => {
    if (!next.length) return;
    const valid = next.some((s) => s.id === targetPrizeId.value);
    if (!valid) {
      targetPrizeId.value = next[0]!.id;
    }
  },
  { immediate: true }
);

const hasAutoSpun = ref(false);
watch(
  [hasSegments, fortuneWheelAllowRedraw],
  async ([ready, allowRedraw]) => {
    if (!ready || hasAutoSpun.value || allowRedraw) return;
    if (isSpinning.value || pendingSelection.value || pickedCategoryId.value != null) return;
    hasAutoSpun.value = true;
    await nextTick();
    startSpin();
  },
  { immediate: true }
);

function labelForCategoryId(id: number | null): string {
  if (id == null) return FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_LABEL;
  const category = props.categories.find((entry) => entry.id === id);
  return category ? t(`categories.${category.searchWord}`, category.name) : '—';
}

const selectedCategoryLabel = computed(() => {
  if (isSpinning.value && props.categories.length) {
    const category = props.categories[categoryFlipIndex.value % props.categories.length];
    return category
      ? t(`categories.${category.searchWord}`, category.name)
      : FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_LABEL;
  }
  return labelForCategoryId(pendingSelection.value?.categoryId ?? pickedCategoryId.value);
});

const displayedCategoryId = computed(() => {
  if (isSpinning.value && props.categories.length) {
    const category = props.categories[categoryFlipIndex.value % props.categories.length];
    return category?.id ?? null;
  }
  return pendingSelection.value?.categoryId ?? pickedCategoryId.value;
});

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
  { immediate: true }
);

const wheelCategoryEmoji = computed(() => {
  const id = displayedCategoryId.value;
  if (id == null) return FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_EMOJI;
  const cat = props.categories.find((c) => c.id === id);
  return resolveCategoryEmoji(cat?.name);
});

/** Large letter in wheel hub — only the final outcome after the wheel stops (not the pre-picked target while spinning). */
const hubLetterDisplay = computed(() => {
  const settled = pendingSelection.value?.letter;
  if (settled) return settled.toUpperCase();
  return '?';
});

const hubLetterIdle = computed(
  () => !isSpinning.value && !pendingSelection.value && !pendingSegment.value
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
}

function startSpin() {
  if (autoAdvanceTimer.value) {
    clearTimeout(autoAdvanceTimer.value);
    autoAdvanceTimer.value = null;
  }

  if (isSpinning.value || !hasSegments.value) return;

  const nextSegment = chooseRandomSegment();
  if (!nextSegment) return;

  const list = props.categories;
  const categoryIdx = Math.floor(Math.random() * list.length);
  spinOutcomeCategoryId.value = list[categoryIdx]!.id;

  isSpinning.value = true;
  pendingSelection.value = null;
  pendingSegment.value = nextSegment;
  targetPrizeId.value = nextSegment.id;
  startCategoryFlip();

  if (fallbackTimer.value) {
    clearTimeout(fallbackTimer.value);
  }

  fallbackTimer.value = setTimeout(() => {
    if (!pendingSegment.value) return;
    const letter = pendingSegment.value.letter;
    if (!pendingSelection.value) {
      finalizeSpin(letter);
    }
  }, 4500);

  const startRotate = wheelRef.value?.startRotate;
  if (typeof startRotate === 'function') {
    startRotate();
  }
}

function onRotateStart(rotate?: RotateStartCallback) {
  isSpinning.value = true;
  if (typeof rotate === 'function') {
    rotate();
  }
}

function onRotateEnd(prize: { id?: number }) {
  if (fallbackTimer.value) {
    clearTimeout(fallbackTimer.value);
    fallbackTimer.value = null;
  }

  const resolvedPrizeId =
    typeof prize.id === 'number' ? prize.id : typeof prize.id === 'string' ? Number(prize.id) : NaN;

  const selectedSegment =
    segments.value.find((segment) => segment.id === resolvedPrizeId) ?? pendingSegment.value;

  const letter = selectedSegment?.letter ?? null;
  finalizeSpin(letter);
}

function confirmSelection() {
  if (!pendingSelection.value || isSpinning.value) return;
  emit('selection-ready', pendingSelection.value);
}

onBeforeUnmount(() => {
  stopCategoryFlip();
  if (fallbackTimer.value) {
    clearTimeout(fallbackTimer.value);
  }
  if (autoAdvanceTimer.value) {
    clearTimeout(autoAdvanceTimer.value);
  }
});
</script>

<style scoped>
.fortune-wheel-wrapper {
  --fortune-wheel-max: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: stretch;
  width: 100%;
  max-width: var(--fortune-wheel-max);
  margin-inline: auto;
}

.fortune-wheel-category-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45em;
  flex-wrap: wrap;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-xl, 1.25rem);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.06) 100%);
  border: 1px solid rgba(255, 213, 79, 0.4);
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  font-family: var(--font-display);
  color: var(--color-white);
  text-align: center;
}

.fortune-wheel-category-chip__emoji {
  font-size: 1.35em;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
  transition:
    opacity 0.2s cubic-bezier(0.25, 0.8, 0.35, 1),
    transform 0.24s cubic-bezier(0.25, 0.8, 0.35, 1);
}

.fortune-wheel-category-chip__label {
  font-size: clamp(0.78rem, 3.1vw, 0.95rem);
  font-weight: var(--font-weight-bold);
  line-height: 1.25;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
  transition:
    opacity 0.2s cubic-bezier(0.25, 0.8, 0.35, 1),
    transform 0.24s cubic-bezier(0.25, 0.8, 0.35, 1);
}

.fortune-wheel-stage {
  width: 100%;
  display: flex;
  justify-content: center;
}

.fortune-wheel-canvas {
  position: relative;
  width: 100%;
  max-width: min(100%, 380px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.fortune-wheel-canvas :deep(.fw-container) {
  max-width: 100%;
}

.fortune-wheel-hub {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}

/* Match game screen letter treatment, scaled for wheel hub (mockup). */
.fortune-wheel-hub-letter {
  font-family: var(--font-display);
  font-size: clamp(2.65rem, 15vw, 4.1rem);
  font-weight: var(--font-weight-black);
  color: #7ec8e3;
  -webkit-text-stroke: clamp(2px, 0.55vw, 4px) #2b5b84;
  paint-order: stroke fill;
  text-shadow:
    3px 3px 0 #1a3d5c,
    5px 5px 0 #153250,
    6px 6px 14px rgba(0, 0, 0, 0.35);
  line-height: 1;
  letter-spacing: -0.03em;
}

.fortune-wheel-hub-letter--idle {
  color: rgba(126, 200, 227, 0.42);
  -webkit-text-stroke-color: rgba(43, 91, 132, 0.5);
  transform: scale(0.9);
  text-shadow: 2px 2px 0 rgba(26, 61, 92, 0.35);
}

.fortune-wheel-hub-letter--spinning {
  animation: fortune-hub-letter-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes fortune-hub-letter-pulse {
  from {
    opacity: 0.9;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1.02);
  }
}

.fortune-wheel-hub-letter--landed {
  animation: fortune-hub-letter-pop 0.55s cubic-bezier(0.34, 1.45, 0.64, 1);
}

@keyframes fortune-hub-letter-pop {
  0% {
    transform: scale(0.86);
  }
  60% {
    transform: scale(1.09);
  }
  100% {
    transform: scale(1);
  }
}

.fortune-wheel-selection {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

.selection-row {
  display: flex;
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-base), 2.8vw, var(--font-size-xl));
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  text-shadow:
    0 1px 4px rgba(0, 0, 0, 0.45),
    0 0 12px rgba(11, 59, 118, 0.35);
}

.selection-row--mockup {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--spacing-xs);
}

.selection-row__prefix {
  font-size: 0.88em;
  opacity: 0.92;
}

.selection-row__value {
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  max-width: 100%;
  line-height: 1.25;
  transition: opacity 0.2s cubic-bezier(0.25, 0.8, 0.35, 1);
}

/* Reinforce pill shape (some global resets flatten game buttons on this screen). */
.fortune-wheel-actions :deep(.game-button) {
  border-radius: var(--radius-xl, 1.25rem);
}

.category-label--flipping {
  display: inline-block;
  font-variant-numeric: tabular-nums;
  animation: category-preview-breathe 0.55s ease-in-out infinite alternate;
  transform-origin: 50% 50%;
}

@keyframes category-preview-breathe {
  from {
    opacity: 0.9;
  }
  to {
    opacity: 1;
  }
}

.category-label--landed {
  display: inline-block;
  animation: category-land-pop 0.55s cubic-bezier(0.34, 1.45, 0.64, 1);
}

@keyframes category-land-pop {
  0% {
    opacity: 0.65;
    transform: scale(0.92);
  }
  60% {
    opacity: 1;
    transform: scale(1.06);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
