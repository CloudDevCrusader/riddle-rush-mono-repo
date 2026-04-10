<template>
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
  value: string
  weight: number
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
const targetPrizeId = ref(0)
const pendingSelection = ref<FortuneWheelSelection | null>(null)

const segments = computed(() => mapCategoriesToSegments(props.categories, props.letters))
const hasSegments = computed(() => segments.value.length > 0)

const wheelPrizes = computed<WheelPrize[]>(() =>
  segments.value.map((segment) => ({
    id: segment.id,
    value: `${segment.categoryName} · ${segment.letter}`,
    weight: segment.weight ?? 1,
  }))
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

  pendingSelection.value = null
  targetPrizeId.value = nextSegment.id
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
  isSpinning.value = false

  const selectedSegment = segments.value.find((segment) => segment.id === prize.id)
  pendingSelection.value = validateSelection(selectedSegment, props.categories)
}

function confirmSelection() {
  if (!pendingSelection.value || isSpinning.value) return
  emit('selection-ready', pendingSelection.value)
}
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
