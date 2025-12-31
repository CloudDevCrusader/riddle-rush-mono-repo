<template>
  <div class="wheel-container">
    <!-- Wheel Pointer/Arrow -->
    <div class="wheel-pointer">
      <div class="pointer-arrow">
        ▼
      </div>
    </div>

    <!-- Rotating Wheel -->
    <div
      class="fortune-wheel"
      :style="{ transform: `rotate(${wheelRotation}deg)` }"
    >
      <!-- Segments -->
      <button
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        class="wheel-segment tap-highlight no-select"
        :class="{ selected: selectedItem && getItemKey(selectedItem as T, -1) === getItemKey(item, index) }"
        :style="getSegmentStyle(index)"
        @click="selectItem(item, index)"
      >
        <div class="segment-content">
          <span
            v-if="getItemIcon(item)"
            class="segment-icon"
            :style="{ transform: `rotate(-${wheelRotation + (index * angleStep)}deg)` }"
          >
            {{ getItemIcon(item) }}
          </span>
          <span
            class="segment-text"
            :style="{ transform: `rotate(-${wheelRotation + (index * angleStep)}deg)` }"
          >
            {{ getItemLabel(item) }}
          </span>
        </div>
      </button>
    </div>

    <!-- Center Circle -->
    <div class="wheel-center">
      <div class="center-glow" />
      <div class="center-circle">
        <span
          v-if="selectedItem && getItemIcon(selectedItem as T)"
          class="selected-icon"
        >
          {{ getItemIcon(selectedItem as T) }}
        </span>
        <span
          v-else
          class="center-icon"
        >{{ centerIcon }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
interface Props {
  items: T[]
  getItemKey: (item: T, index: number) => string | number
  getItemLabel: (item: T) => string
  getItemIcon?: (item: T) => string
  getItemColor?: (item: T, index: number) => string
  centerIcon?: string
  modelValue?: T | null
}

interface Emits {
  (e: 'update:modelValue', value: T | null): void
  (e: 'spin-complete', value: T): void
}

const props = withDefaults(defineProps<Props>(), {
  getItemIcon: () => () => '',
  getItemColor: undefined,
  centerIcon: '🎯',
  modelValue: null,
})

const emit = defineEmits<Emits>()

const selectedItem = ref<T | null>(props.modelValue)
const wheelRotation = ref(0)
const isSpinning = ref(false)

const angleStep = computed(() => 360 / props.items.length)

// Default color palette - soft blues matching game aesthetic
const defaultColors = [
  '#6BA8D8', '#5B9DC9', '#4A92BA', '#6BB5D8',
  '#5BAAC9', '#4A9FBA', '#6BC2D8', '#5BB7C9',
  '#4AACBA', '#75BBE0', '#65B0D1', '#55A5C2',
]

const getSegmentStyle = (index: number) => {
  const angle = index * angleStep.value
  const color = props.getItemColor
    ? props.getItemColor(props.items[index]!, index)
    : defaultColors[index % defaultColors.length]

  return {
    transform: `rotate(${angle}deg)`,
    transformOrigin: '50% 50%',
    background: color,
    '--segment-color': color,
  }
}

const spinWheel = (targetRotation: number) => {
  isSpinning.value = true
  wheelRotation.value = targetRotation
  setTimeout(() => {
    isSpinning.value = false
  }, 1500)
}

const selectItem = (item: T, index: number) => {
  if (isSpinning.value || !item)
    return

  selectedItem.value = item
  emit('update:modelValue', item)

  // Calculate rotation to bring selected item to top
  const targetAngle = -(index * angleStep.value) + 90

  // Add full rotations for dramatic effect
  const fullRotations = 3
  const finalRotation = targetAngle - (360 * fullRotations)

  spinWheel(finalRotation)

  // Emit spin complete after animation
  setTimeout(() => {
    if (item)
      emit('spin-complete', item)
  }, 1500)
}

// Expose spin method for parent components
const spinRandom = () => {
  if (isSpinning.value || props.items.length === 0)
    return null

  // Pick a random item
  const randomIndex = Math.floor(Math.random() * props.items.length)
  const randomItem = props.items[randomIndex]

  if (!randomItem)
    return null

  // Calculate rotation to land on selected item
  const targetAngle = -(randomIndex * angleStep.value) + 90

  // Add 3-5 full rotations for dramatic effect
  const fullRotations = 3 + Math.floor(Math.random() * 3)
  const finalRotation = targetAngle - (360 * fullRotations)

  spinWheel(finalRotation)

  // Set selected item after spin completes
  setTimeout(() => {
    if (randomItem) {
      selectedItem.value = randomItem
      emit('update:modelValue', randomItem)
      emit('spin-complete', randomItem)
    }
  }, 1500)

  return randomItem
}

defineExpose({
  spinRandom,
  isSpinning,
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  selectedItem.value = newValue
})
</script>

<style scoped>
/* Wheel Container */
.wheel-container {
  position: relative;
  width: min(85vw, 85vh, 420px);
  height: min(85vw, 85vh, 420px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* Wheel Pointer */
.wheel-pointer {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.pointer-arrow {
  font-size: clamp(40px, 8vw, 60px);
  color: #FFD700;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))
          drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.1) translateY(4px);
  }
}

/* Fortune Wheel */
.fortune-wheel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 1.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.4),
              0 8px 30px rgba(0, 0, 0, 0.4),
              inset 0 0 60px rgba(255, 255, 255, 0.1);
  will-change: transform;
}

/* Wheel Segments */
.wheel-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: filter 0.3s ease, transform 0.2s ease;
  clip-path: polygon(
    50% 50%,
    50% 0%,
    calc(50% + 50% * sin(var(--angle, 30deg))) calc(50% - 50% * cos(var(--angle, 30deg)))
  );
  /* 3D button effect */
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.4),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    0 2px 6px rgba(0, 0, 0, 0.3);
}

.wheel-segment:hover {
  filter: brightness(1.15);
  transform: scale(1.02);
  box-shadow:
    inset 0 2px 6px rgba(255, 255, 255, 0.5),
    inset 0 -2px 6px rgba(0, 0, 0, 0.25),
    0 4px 8px rgba(0, 0, 0, 0.4);
}

.wheel-segment:active {
  transform: scale(0.98);
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.2);
}

.wheel-segment.selected {
  filter: brightness(1.25);
  box-shadow:
    inset 0 3px 8px rgba(255, 255, 255, 0.6),
    inset 0 -3px 8px rgba(0, 0, 0, 0.3),
    0 0 20px var(--segment-color),
    0 4px 12px rgba(0, 0, 0, 0.4);
}

.segment-content {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  pointer-events: none;
}

.segment-icon {
  font-size: clamp(24px, 4vw, 32px);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.segment-text {
  font-family: var(--font-display);
  font-size: clamp(10px, 2vw, 14px);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  text-align: center;
  max-width: 80px;
  line-height: 1.2;
}

/* Wheel Center */
.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  pointer-events: none;
}

.center-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(100px, 20vw, 140px);
  height: clamp(100px, 20vw, 140px);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.6), transparent 70%);
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.center-circle {
  position: relative;
  width: clamp(80px, 18vw, 120px);
  height: clamp(80px, 18vw, 120px);
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border: 4px solid var(--color-white);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.8),
              0 4px 15px rgba(0, 0, 0, 0.4),
              inset 0 0 20px rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-icon,
.center-icon {
  font-size: clamp(32px, 7vw, 48px);
  animation: bounce 0.5s ease-out;
}

@keyframes bounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .wheel-container {
    width: min(90vw, 90vh, 360px);
    height: min(90vw, 90vh, 360px);
  }

  .segment-icon {
    font-size: clamp(20px, 5vw, 28px);
  }

  .segment-text {
    font-size: clamp(9px, 2.2vw, 12px);
  }

  .center-circle {
    width: clamp(70px, 16vw, 100px);
    height: clamp(70px, 16vw, 100px);
  }

  .selected-icon,
  .center-icon {
    font-size: clamp(28px, 6vw, 40px);
  }
}
</style>
