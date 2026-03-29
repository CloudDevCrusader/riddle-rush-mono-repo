<template>
  <div class="wheel-container">
    <!-- Wheel Pointer/Arrow -->
    <div class="wheel-pointer">
      <div class="pointer-arrow" aria-hidden="true" />
    </div>

    <!-- Rotating Wheel -->
    <div class="fortune-wheel" :style="{ transform: `rotate(${wheelRotation}deg)` }">
      <!-- Segments -->
      <button
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        class="wheel-segment tap-highlight no-select"
        :class="{
          selected: selectedItem && getItemKey(selectedItem as T, -1) === getItemKey(item, index),
        }"
        :style="getSegmentStyle(index)"
        @click="selectItem(item, index)"
      >
        <div class="segment-content">
          <span
            v-if="getItemIcon(item)"
            class="segment-icon"
            :style="{ transform: `rotate(-${wheelRotation + Number(index) * angleStep}deg)` }"
          >
            {{ getItemIcon(item) }}
          </span>
          <span
            class="segment-text"
            :style="{ transform: `rotate(-${wheelRotation + Number(index) * angleStep}deg)` }"
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
        <span v-if="selectedItem && getItemIcon(selectedItem as T)" class="selected-icon">
          {{ getItemIcon(selectedItem as T) }}
        </span>
        <span v-else class="center-icon">{{ centerIcon }}</span>
      </div>
    </div>

    <!-- Sparkles -->
    <div class="sparkles-container" aria-hidden="true" :class="{ 'is-spinning': isSpinning }">
      <div v-for="i in 12" :key="`sparkle-${i}`" class="sparkle" :style="getSparkleStyle(i)" />
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
let animationFrameId: number | null = null

const angleStep = computed(() => 360 / props.items.length)

// Enhanced color palette using design system variables for perfect contrast
const defaultColors = [
  'var(--color-btn-red-dark)',
  'var(--color-btn-blue-dark)',
  'var(--color-btn-green-dark)',
  'var(--color-btn-orange-dark)',
  'var(--color-primary-dark)',
  'var(--color-secondary-dark)',
  'var(--color-accent-red)',
  'var(--color-accent-blue)',
  'var(--color-accent-green)',
  'var(--color-dark-light)',
  'var(--color-figma-blue)',
  'var(--color-border-gold-darker)',
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
    '--angle': `${angleStep.value}deg`,
  }
}

const getSparkleStyle = (index: number) => {
  const angle = (index * 360) / 12
  const delay = (index * 0.2) % 2
  const distance = 52 + (index % 3) * 5 // 52% to 62% from center
  const size = 4 + (index % 4) * 2 // 4px to 10px

  return {
    '--transform-base': `rotate(${angle}deg) translateY(-${distance}%)`,
    transform: `var(--transform-base)`,
    animationDelay: `${delay}s`,
    width: `${size}px`,
    height: `${size}px`,
  }
}

// Animate wheel rotation via requestAnimationFrame with completion callback.
// No CSS transition on .fortune-wheel — rAF is the sole animation driver.
const spinWheel = (targetRotation: number, onComplete?: () => void) => {
  isSpinning.value = true

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }

  const startTime = performance.now()
  const duration = 2400
  const startRotation = wheelRotation.value
  const rotationDiff = targetRotation - startRotation

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Ease-out cubic for natural deceleration
    const easedProgress = 1 - Math.pow(1 - progress, 3)

    wheelRotation.value = startRotation + rotationDiff * easedProgress

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      wheelRotation.value = targetRotation
      isSpinning.value = false
      animationFrameId = null
      onComplete?.()
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

// Calculate the wheel rotation that centers segment `index` under the top pointer.
// Segment i spans from (i * angleStep) to ((i+1) * angleStep) degrees.
// Its midpoint is at (i * angleStep + angleStep / 2).
// To place that midpoint at 0° (top), rotate by the negative of that value.
const getTargetAngle = (index: number): number => {
  return -(index * angleStep.value) - angleStep.value / 2
}

// Ensure the wheel always spins forward (counter-clockwise = decreasing value)
// with at least `fullRotations` complete turns from the current position.
const getFinalRotation = (targetAngle: number, fullRotations: number): number => {
  let finalRotation = targetAngle - 360 * fullRotations
  // If calculated position is ahead of (greater than) current, add extra rotations
  let guard = 0
  while (finalRotation >= wheelRotation.value && guard < 20) {
    finalRotation -= 360
    guard++
  }
  return finalRotation
}

const selectItem = (item: T, index: number) => {
  if (isSpinning.value || !item) return

  // Immediately show which segment was tapped
  selectedItem.value = item
  emit('update:modelValue', item)

  const targetAngle = getTargetAngle(index)
  const finalRotation = getFinalRotation(targetAngle, 3)

  spinWheel(finalRotation, () => {
    emit('spin-complete', item)
  })
}

// Expose spin method for parent components
const spinRandom = () => {
  if (isSpinning.value || props.items.length === 0) return null

  const randomIndex = Math.floor(Math.random() * props.items.length)
  const randomItem = props.items[randomIndex]

  if (!randomItem) return null

  const targetAngle = getTargetAngle(randomIndex)
  const finalRotation = getFinalRotation(targetAngle, 3 + Math.floor(Math.random() * 3))

  spinWheel(finalRotation, () => {
    selectedItem.value = randomItem
    emit('update:modelValue', randomItem)
    emit('spin-complete', randomItem)
  })

  return randomItem
}

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})

defineExpose({
  spinRandom,
  isSpinning,
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue: T | null) => {
    selectedItem.value = newValue
  }
)
</script>

<style scoped lang="scss">
@use '~/assets/scss/design-system.scss' as *;

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
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.pointer-arrow {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 35px solid var(--color-border-gold);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  filter: drop-shadow(var(--shadow-lg)) drop-shadow(0 0 20px var(--color-border-gold));
  animation: pulse var(--transition-base) ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.1) translateY(4px);
  }
}

/* Fortune Wheel - Enhanced 3D effect with sophisticated lighting */
/* NO CSS transition on transform — requestAnimationFrame drives the rotation.
   A CSS transition here would fight each rAF frame update, causing the wheel
   to stutter or not spin at all. */
.fortune-wheel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  will-change: transform;
  contain: layout paint style;
  backface-visibility: hidden;
  transform: translateZ(0);
  /* Enhanced game show outer ring with sophisticated lighting effects */
  box-shadow:
    /* Outer ring - enhanced with multiple lighting layers */
    0 0 0 4px var(--color-border-gold),
    0 0 0 8px var(--color-border-gold-dark),
    0 0 0 12px var(--color-border-gold-darker),
    0 0 0 16px var(--color-secondary-light),
    /* Enhanced outer glow with multiple light sources */ 0 0 60px var(--color-border-gold),
    0 0 100px rgba(255, 215, 0, 0.4),
    0 8px 30px var(--shadow-lg),
    /* Inner depth with enhanced lighting */ inset 0 0 80px rgba(255, 255, 255, 0.3),
    inset 0 0 120px rgba(255, 255, 255, 0.15),
    /* Subtle inner rim glow */ inset 0 0 2px rgba(255, 215, 0, 0.8);
  /* Enhanced background with sophisticated gradient overlay */
  background: 
    /* Base gradient for depth */
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 60%),
    /* Conic gradient for segment separation */
    conic-gradient(
        from 0deg at 50% 50%,
        rgba(255, 255, 255, 0.2) 0deg,
        rgba(255, 255, 255, 0.4) 90deg,
        rgba(255, 255, 255, 0.2) 180deg,
        rgba(255, 255, 255, 0.4) 270deg,
        rgba(255, 255, 255, 0.2) 360deg
      ),
    /* Base color with subtle pattern */
    linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent 50%);

  /* Add subtle animated texture overlay */
  position: relative;
}

/* Wheel Segments - Enhanced with sophisticated hover effects */
.wheel-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: var(--transition-base);
  will-change: transform, filter;
  backface-visibility: hidden;
  clip-path: polygon(
    50% 50%,
    50% 0%,
    calc(50% + 50% * sin(var(--angle, 30deg))) calc(50% - 50% * cos(var(--angle, 30deg)))
  );
  /* Enhanced 3D button effect with sophisticated lighting */
  box-shadow:
    inset 0 2px 8px rgba(255, 255, 255, 0.5),
    inset 0 -2px 8px rgba(0, 0, 0, 0.3),
    var(--shadow-md);
  /* Add sophisticated gradient overlay for depth */
  position: relative;
  overflow: hidden;
  /* Enhanced hover state preparation */
  transform: scale(1);
}

.wheel-segment::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.2) 40%,
    transparent 100%
  );
  opacity: 0.9;
  pointer-events: none;
  /* Enhanced gradient animation on hover */
  transition: all var(--transition-base) ease;
}

.wheel-segment::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent 70%);
  transform: translate(-50%, -50%);
  transition: all 0.6s ease-out;
  pointer-events: none;
}

/* Enhanced hover state with sophisticated animations */
.wheel-segment:hover {
  transform: scale(1.02);
  z-index: 2;
  filter: brightness(1.1) saturate(1.2);
}

.wheel-segment:hover::before {
  opacity: 1;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.3) 40%,
    transparent 100%
  );
}

.wheel-segment:hover::after {
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.wheel-segment:active {
  filter: brightness(0.9) saturate(0.9);
  transform: scale(0.98);
}

.wheel-segment.selected {
  filter: brightness(1.2) saturate(1.3);
  box-shadow:
    inset 0 4px 12px rgba(255, 255, 255, 0.8),
    inset 0 -4px 12px rgba(0, 0, 0, 0.4),
    0 0 35px var(--segment-color),
    0 0 60px rgba(255, 255, 255, 0.4),
    0 0 80px var(--segment-color),
    var(--shadow-lg);
  transform: scale(1.05);
  z-index: 3;
  /* Add pulsing glow animation for selected segments */
  animation: selectedPulse 2s ease-in-out infinite;
}

@keyframes selectedPulse {
  0%,
  100% {
    box-shadow:
      inset 0 4px 12px rgba(255, 255, 255, 0.8),
      inset 0 -4px 12px rgba(0, 0, 0, 0.4),
      0 0 35px var(--segment-color),
      0 0 60px rgba(255, 255, 255, 0.4),
      0 0 80px var(--segment-color),
      var(--shadow-lg);
  }
  50% {
    box-shadow:
      inset 0 4px 12px rgba(255, 255, 255, 0.8),
      inset 0 -4px 12px rgba(0, 0, 0, 0.4),
      0 0 45px var(--segment-color),
      0 0 80px rgba(255, 255, 255, 0.6),
      0 0 100px var(--segment-color),
      var(--shadow-lg);
  }
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
  color: var(--color-text-white);
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
  0%,
  100% {
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
  /* Enhanced 3D golden orb with layered radial gradients */
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 40%),
    radial-gradient(circle at 70% 70%, rgba(255, 215, 0, 0.6), transparent 50%),
    radial-gradient(circle at 50% 50%, var(--color-border-gold), var(--color-secondary-dark));
  border: 4px solid var(--color-text-white);
  box-shadow:
    0 0 30px var(--color-border-gold),
    0 6px 20px var(--shadow-lg),
    inset 0 0 25px rgba(255, 255, 255, 0.4),
    inset 0 0 15px rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.center-circle::before {
  content: '';
  position: absolute;
  top: 15%;
  left: 15%;
  width: 30%;
  height: 30%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent 70%);
  border-radius: 50%;
  filter: blur(2px);
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

/* Sparkles */
.sparkles-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
  opacity: 0.6;
  transition: opacity var(--transition-base);
}

.sparkles-container.is-spinning {
  opacity: 1;
}

.sparkle {
  position: absolute;
  top: 50%;
  left: 50%;
  background: var(--color-text-white);
  border-radius: 50%;
  box-shadow:
    0 0 8px var(--color-border-gold),
    0 0 12px var(--color-text-white);
  transform-origin: center center;
  animation: twinkle 2s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% {
    opacity: 0.2;
    transform: var(--transform-base) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: var(--transform-base) scale(1.2);
  }
  100% {
    opacity: 0.2;
    transform: var(--transform-base) scale(0.8);
  }
}

/* Responsive - replaced with fluid units */
.wheel-container {
  width: clamp(280px, 70vmin, 420px);
  height: clamp(280px, 70vmin, 420px);
}

.segment-icon {
  font-size: clamp(18px, 4.5vw, 32px);
}

.segment-text {
  font-size: clamp(8px, 2vw, 14px);
  max-width: clamp(60px, 15vmin, 80px);
}

.center-circle {
  width: clamp(60px, 15vmin, 120px);
  height: clamp(60px, 15vmin, 120px);
}

.selected-icon,
.center-icon {
  font-size: clamp(24px, 6vw, 48px);
}

.pointer-arrow {
  font-size: clamp(32px, 7vw, 60px);
}
</style>
