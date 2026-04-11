<template>
  <div class="fortune-wheel-wrapper" data-testid="fortune-wheel-container">
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
    </div>

    <div class="fortune-wheel-selection">
      <div class="selection-row">
        <span>{{ t('common.category', 'Category') }}:</span>
        <strong data-testid="fortune-wheel-selected-category">{{ selectedCategoryLabel }}</strong>
      </div>
      <div class="selection-row">
        <span>{{ t('common.letter', 'Letter') }}:</span>
        <strong data-testid="fortune-wheel-selected-letter">{{ selectedLetterLabel }}</strong>
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
  name: string
  value: string
  weight: number
  bgColor: string
  color: string
}

/** Canvas wedge colors — vue-fortune-wheel draws `name` / `bgColor` / `color` in canvas mode. */
const WHEEL_SEGMENT_PALETTE: ReadonlyArray<{ bg: string; fg: string }> = [
  { bg: '#0b7ad6', fg: '#ffffff' },
  { bg: '#5fc423', fg: '#0b3b76' },
  { bg: '#44c8ff', fg: '#0b3b76' },
  { bg: '#ff9500', fg: '#ffffff' },
  { bg: '#9bb6da', fg: '#0b3b76' },
  { bg: '#ffd54f', fg: '#0b3b76' },
]

const wheelCanvasOptions = {
  borderColor: 'rgba(255, 213, 79, 0.55)',
  borderWidth: 4,
  btnText: ' ',
  fontSize: 28,
  textLength: 8,
  lineHeight: 22,
}

interface RotateStartCallback {
  (): void
}

interface WheelRef {
  startRotate: () => void
}

const props = defineProps<{
  categories: Category[]
  letters?: string[]
}>()

const emit = defineEmits<{
  (event: 'selection-ready', payload: FortuneWheelSelection): void
}>()

const { t } = useI18n()
const { mapCategoriesToSegments, validateSelection } = useFortuneWheelSelection()

const wheelRef = ref<WheelRef | null>(null)
const isSpinning = ref(false)
const targetPrizeId = ref(1)
const pendingSegment = ref<FortuneWheelSegment | null>(null)
const pendingSelection = ref<FortuneWheelSelection | null>(null)
const fallbackTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const segments = computed(() => mapCategoriesToSegments(props.categories, props.letters))
const hasSegments = computed(() => segments.value.length > 0)

const wheelPrizes = computed<WheelPrize[]>(() =>
  segments.value.map((segment, index) => {
    const { bg, fg } = WHEEL_SEGMENT_PALETTE[index % WHEEL_SEGMENT_PALETTE.length]!
    const shortLabel =
      segment.categoryName.length > 14
        ? `${segment.categoryName.slice(0, 12)}…`
        : segment.categoryName
    return {
      id: segment.id,
      name: `${segment.letter}\n${shortLabel}`,
      value: `${segment.categoryName} · ${segment.letter}`,
      weight: segment.weight ?? 1,
      bgColor: bg,
      color: fg,
    }
  })
)

watch(
  () => segments.value,
  (next) => {
    if (!next.length) return
    const valid = next.some((s) => s.id === targetPrizeId.value)
    if (!valid) {
      targetPrizeId.value = next[0]!.id
    }
  },
  { immediate: true }
)

const selectedCategoryLabel = computed(() => {
  if (!pendingSelection.value) return '-'
  const category = props.categories.find((entry) => entry.id === pendingSelection.value?.categoryId)
  return category ? t(`categories.${category.searchWord}`, category.name) : '-'
})

const selectedLetterLabel = computed(() => pendingSelection.value?.letter ?? '-')

function chooseRandomSegment(): FortuneWheelSegment | null {
  if (!segments.value.length) return null
  const index = Math.floor(Math.random() * segments.value.length)
  return segments.value[index] ?? null
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

  isSpinning.value = false

  const resolvedPrizeId =
    typeof prize.id === 'number' ? prize.id : typeof prize.id === 'string' ? Number(prize.id) : NaN

  const selectedSegment =
    segments.value.find((segment) => segment.id === resolvedPrizeId) ?? pendingSegment.value

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
  align-items: baseline;
  gap: var(--spacing-md);
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-base), 2.8vw, var(--font-size-xl));
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  text-shadow:
    0 1px 4px rgba(0, 0, 0, 0.45),
    0 0 12px rgba(11, 59, 118, 0.35);
}

.selection-row strong {
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-align: right;
}

.fortune-wheel-actions {
  display: flex;
  gap: var(--spacing-md);
}
</style>
