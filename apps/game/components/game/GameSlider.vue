<script setup lang="ts">
/**
 * GameSlider Component
 *
 * A game-styled volume slider with custom track, fill, and thumb styling.
 * Features wooden peg aesthetic matching the game's playful design.
 *
 * Usage:
 * - Volume control: <GameSlider v-model="volume" icon="🔊" muted-icon="🔇" />
 * - With label: <GameSlider v-model="volume" icon="🎵" label="Music" />
 */

interface Props {
  /** Current value (0-100) */
  modelValue: number
  /** Minimum value (default: 0) */
  min?: number
  /** Maximum value (default: 100) */
  max?: number
  /** Icon to display (emoji) */
  icon?: string
  /** Icon to display when muted/value is 0 (emoji) */
  mutedIcon?: string
  /** Optional label text */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  icon: '',
  mutedIcon: '',
  label: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

// Refs
const trackRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

// Computed values
const displayIcon = computed(() => {
  if (props.modelValue === 0 && props.mutedIcon) {
    return props.mutedIcon
  }
  return props.icon
})

const percentage = computed(() => {
  const range = props.max - props.min
  if (range === 0) return 0
  return ((props.modelValue - props.min) / range) * 100
})

const fillStyle = computed(() => ({
  width: `${percentage.value}%`,
}))

const thumbStyle = computed(() => ({
  left: `${percentage.value}%`,
}))

// Methods
const calculateValueFromPosition = (clientX: number): number => {
  if (!trackRef.value) return props.modelValue

  const rect = trackRef.value.getBoundingClientRect()
  const relativeX = clientX - rect.left
  const percentage = Math.max(0, Math.min(1, relativeX / rect.width))
  const range = props.max - props.min
  const newValue = Math.round(props.min + percentage * range)

  return newValue
}

const handleTrackClick = (event: MouseEvent) => {
  const newValue = calculateValueFromPosition(event.clientX)
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const handleDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return

  let clientX: number
  if ('touches' in event) {
    const touch = event.touches[0]
    if (!touch) return
    clientX = touch.clientX
  } else {
    clientX = event.clientX
  }
  const newValue = calculateValueFromPosition(clientX)
  emit('update:modelValue', newValue)
}

const startDrag = (event: MouseEvent | TouchEvent) => {
  event.preventDefault()
  isDragging.value = true

  // Initial position update
  let clientX: number
  if ('touches' in event) {
    const touch = event.touches[0]
    if (!touch) return
    clientX = touch.clientX
  } else {
    clientX = event.clientX
  }
  const newValue = calculateValueFromPosition(clientX)
  emit('update:modelValue', newValue)

  // Add listeners
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('touchend', endDrag)
}

const endDrag = () => {
  if (isDragging.value) {
    isDragging.value = false
    emit('change', props.modelValue)
  }

  // Remove listeners
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', endDrag)
}

// Handle native input for accessibility
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = Number(target.value)
  emit('update:modelValue', newValue)
}

const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = Number(target.value)
  emit('change', newValue)
}

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', endDrag)
})
</script>

<template>
  <div class="game-slider">
    <!-- Icon -->
    <div v-if="icon" class="game-slider__icon">
      {{ displayIcon }}
    </div>

    <!-- Slider track container -->
    <div
      ref="trackRef"
      class="game-slider__track-container"
      @click="handleTrackClick"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <!-- Track background -->
      <div class="game-slider__track">
        <!-- Fill (green portion) -->
        <div class="game-slider__fill" :style="fillStyle" />
      </div>

      <!-- Thumb (draggable peg) -->
      <div
        class="game-slider__thumb"
        :style="thumbStyle"
        :class="{ 'game-slider__thumb--dragging': isDragging }"
      />

      <!-- Hidden input for accessibility -->
      <input
        type="range"
        class="game-slider__input"
        :value="modelValue"
        :min="min"
        :max="max"
        :aria-label="label || 'Volume slider'"
        @input="handleInput"
        @change="handleInputChange"
      />
    </div>

    <!-- Optional label -->
    <span v-if="label" class="game-slider__label">{{ label }}</span>
  </div>
</template>

<style scoped lang="scss">
@use 'assets/scss/design-system' as *;

.game-slider {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  user-select: none;

  // Icon container
  &__icon {
    flex-shrink: 0;
    font-size: clamp(28px, 5vw, 40px);
    line-height: 1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  // Track container - holds track, fill, thumb, and input
  &__track-container {
    position: relative;
    flex: 1;
    height: clamp(36px, 6vw, 48px);
    cursor: pointer;
    touch-action: none;
  }

  // Track background - wooden barrel appearance
  &__track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: clamp(16px, 2.5vw, 22px);
    transform: translateY(-50%);
    background: linear-gradient(180deg, #c4956a 0%, #8b5e3c 40%, #6d4429 100%);
    border-radius: var(--radius-lg);
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 -1px 2px rgba(255, 255, 255, 0.1),
      0 2px 4px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  // Fill - green progress portion
  &__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(180deg, #b7ff6d 0%, #7ed321 50%, #5fc423 100%);
    border-radius: var(--radius-lg) 0 0 var(--radius-lg);
    transition: width 0.05s ease-out;
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.4),
      inset 0 -1px 2px rgba(0, 0, 0, 0.1);
  }

  // Thumb - wooden peg appearance
  &__thumb {
    position: absolute;
    top: 50%;
    width: clamp(28px, 4.5vw, 36px);
    height: clamp(28px, 4.5vw, 36px);
    transform: translate(-50%, -50%);
    background: linear-gradient(180deg, #ffe0b0 0%, #ffb84d 30%, #e89330 70%, #cc7700 100%);
    border: 3px solid #ffd54f;
    border-radius: 50%;
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.3),
      inset 0 1px 2px rgba(255, 255, 255, 0.5),
      inset 0 -1px 2px rgba(0, 0, 0, 0.2);
    transition:
      transform 0.1s ease-out,
      box-shadow 0.1s ease-out;
    pointer-events: none;

    &--dragging {
      transform: translate(-50%, -50%) scale(1.1);
      box-shadow:
        0 4px 8px rgba(0, 0, 0, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2);
    }
  }

  // Hidden input for keyboard accessibility
  &__input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
  }

  // Optional label
  &__label {
    flex-shrink: 0;
    font-family: var(--font-display);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-white);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
}
</style>
