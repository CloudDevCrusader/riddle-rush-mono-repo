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
        :aria-label="`Select ${getItemLabel(item)}`"
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

    <!-- Screen Reader Announcement -->
    <div class="sr-only" aria-live="polite">
      {{
        isSpinning
          ? 'Wheel is spinning...'
          : selectedItem
            ? `Selected: ${getItemLabel(selectedItem as T)}`
            : 'Wheel ready to spin'
      }}
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

/* Wheel Container - Enhanced with comprehensive design system integration */
.wheel-container {
  position: relative;
  width: clamp(240px, 65vmin, 420px);
  height: clamp(240px, 65vmin, 420px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  /* Enhanced with design system utilities for better visual hierarchy */
  filter: drop-shadow(var(--shadow-lg));
  transition: filter var(--transition-duration-normal) var(--transition-base);
  /* Enhanced responsive spacing with design system - better for mobile */
  padding: var(--spacing-sm);
  /* Add subtle background gradient for depth using design system colors */
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), transparent 40%),
    radial-gradient(circle at 70% 70%, rgba(255, 215, 0, 0.1), transparent 60%),
    radial-gradient(circle at center, rgba(255, 255, 255, 0.08), transparent 70%);
  border-radius: var(--radius-xl);
  /* Enhanced with better accessibility and visual feedback */
  position: relative;
  overflow: visible;
  /* Add subtle border using design system colors */
  border: 1px solid rgba(255, 215, 0, 0.2);

  /* Enhanced responsive behavior for different screen sizes */
  @media (max-width: 768px) {
    width: clamp(200px, 60vmin, 340px);
    height: clamp(200px, 60vmin, 340px);
    padding: var(--spacing-xs);
  }

  @media (max-width: 480px) {
    width: clamp(160px, 55vmin, 280px);
    height: clamp(160px, 55vmin, 280px);
    padding: var(--spacing-xs);
  }
}

/* Wheel Pointer - Enhanced with design system integration */
.wheel-pointer {
  position: absolute;
  top: calc(-6vmin - var(--spacing-md));
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-tooltip);
  /* Enhanced pointer base with design system spacing */
  padding: var(--spacing-xs);
  /* Enhanced responsive behavior */
  @media (max-width: 768px) {
    top: calc(-5vmin - var(--spacing-sm));
  }

  @media (max-width: 480px) {
    top: calc(-4vmin - var(--spacing-xs));
    padding: calc(var(--spacing-xs) * 0.5);
  }
}

.pointer-arrow {
  font-size: clamp(24px, 6vmin, 48px);
  width: 0;
  height: 0;
  border-left: 0.6em solid transparent;
  border-right: 0.6em solid transparent;
  border-top: 1em solid var(--color-border-gold);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  /* Enhanced with sophisticated lighting effects using design system */
  filter: drop-shadow(var(--shadow-lg)) drop-shadow(0 0 20px var(--color-border-gold))
    drop-shadow(0 0 40px rgba(255, 215, 0, 0.4)) drop-shadow(0 0 60px rgba(255, 215, 0, 0.2));
  /* Enhanced animation with design system timing */
  animation: pointerPulse var(--transition-duration-bounce) ease-in-out infinite;
  /* Add subtle metallic gradient */
  position: relative;
  /* Enhanced with better contrast for accessibility */
  transition: all var(--transition-base);
  /* Enhanced responsive sizing */
  @media (max-width: 768px) {
    font-size: clamp(20px, 5vmin, 36px);
    border-left-width: 0.5em;
    border-right-width: 0.5em;
    border-top-width: 0.8em;
  }

  @media (max-width: 480px) {
    font-size: clamp(16px, 4vmin, 28px);
    border-left-width: 0.4em;
    border-right-width: 0.4em;
    border-top-width: 0.6em;
  }
}

.pointer-arrow::before {
  content: '';
  position: absolute;
  top: -0.08em;
  left: -0.08em;
  right: -0.08em;
  bottom: -0.08em;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    var(--color-border-gold) 25%,
    var(--color-border-gold-dark) 50%,
    var(--color-border-gold) 75%,
    rgba(255, 215, 0, 0.9) 100%
  );
  border-radius: inherit;
  z-index: -1;
  opacity: 0.9;
  /* Enhanced border with design system */
  border: 1px solid var(--color-border-gold-dark);
  /* Enhanced with design system for better metallic effect */
  filter: brightness(1.1) contrast(1.05);
}

@keyframes pointerPulse {
  0%,
  100% {
    transform: scale(1) translateY(0);
    filter: drop-shadow(var(--shadow-lg)) drop-shadow(0 0 20px var(--color-border-gold))
      drop-shadow(0 0 40px rgba(255, 215, 0, 0.4));
  }
  50% {
    transform: scale(1.08) translateY(3px);
    filter: drop-shadow(var(--shadow-lg)) drop-shadow(0 0 30px var(--color-border-gold))
      drop-shadow(0 0 60px rgba(255, 215, 0, 0.6));
  }
}

/* Fortune Wheel - Enhanced 3D effect with sophisticated lighting and design system */
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
  /* Enhanced game show outer ring with sophisticated lighting effects using design system */
  box-shadow:
    /* Outer ring - enhanced with multiple lighting layers using design system */
    0 0 0 4px var(--color-border-gold),
    0 0 0 8px var(--color-border-gold-dark),
    0 0 0 12px var(--color-border-gold-darker),
    0 0 0 16px var(--color-secondary-light),
    0 0 0 20px rgba(255, 255, 255, 0.1),
    /* Enhanced outer glow with multiple light sources */ 0 0 100px var(--color-border-gold),
    0 0 150px rgba(255, 215, 0, 0.6),
    0 0 200px rgba(255, 215, 0, 0.3),
    0 12px 40px var(--shadow-xl),
    /* Inner depth with enhanced lighting */ inset 0 0 80px rgba(255, 255, 255, 0.5),
    inset 0 0 120px rgba(255, 255, 255, 0.3),
    inset 0 0 160px rgba(255, 215, 0, 0.2),
    /* Subtle inner rim glow */ inset 0 0 2px rgba(255, 215, 0, 0.9),
    /* Enhanced inner depth */ inset 0 0 4px rgba(0, 0, 0, 0.2),
    /* Subtle animated rim effect */ inset 0 0 1px rgba(255, 255, 255, 0.8);
  /* Enhanced background with sophisticated gradient overlay using design system */
  background: 
    /* Base gradient for depth with design system colors */
    radial-gradient(circle at 25% 25%, var(--color-text-white) 0%, transparent 50%),
    /* Radial gradient for inner glow with design system colors */
    radial-gradient(circle at 75% 75%, rgba(255, 215, 0, 0.3), transparent 60%),
    /* Conic gradient for segment separation using design system colors */
    conic-gradient(
        from 0deg at 50% 50%,
        rgba(255, 255, 255, 0.2) 0deg,
        rgba(255, 255, 255, 0.5) 45deg,
        transparent 90deg,
        rgba(255, 255, 255, 0.2) 135deg,
        rgba(255, 255, 255, 0.5) 180deg,
        transparent 225deg,
        rgba(255, 255, 255, 0.2) 270deg,
        rgba(255, 255, 255, 0.5) 315deg,
        rgba(255, 255, 255, 0.2) 360deg
      ),
    /* Sophisticated base gradient with design system colors */
    linear-gradient(
        135deg,
        var(--color-secondary-light) 0%,
        transparent 25%,
        var(--color-primary-dark) 75%,
        transparent 100%
      ),
    /* Enhanced texture overlay using design system */
    linear-gradient(
        45deg,
        rgba(255, 215, 0, 0.1) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 215, 0, 0.1) 50%,
        rgba(255, 215, 0, 0.1) 75%,
        transparent 75%,
        transparent
      );
  background-size:
    100% 100%,
    100% 100%,
    100% 100%,
    100% 100%,
    24px 24px;
  /* Add subtle animated texture overlay */
  position: relative;
  /* Enhanced with design system border radius */
  border: 2px solid transparent;
  /* Enhanced border gradient using design system */
  background-clip: padding-box;
  /* Enhanced with subtle animated effect */
  animation: wheelShimmer 4s ease-in-out infinite;
  /* Performance optimization */
  transform-style: preserve-3d;

  /* Enhanced responsive behavior */
  @media (max-width: 768px) {
    box-shadow:
      0 0 0 3px var(--color-border-gold),
      0 0 0 6px var(--color-border-gold-dark),
      0 0 0 9px var(--color-border-gold-darker),
      0 0 0 12px var(--color-secondary-light),
      0 0 60px var(--color-border-gold),
      0 0 90px rgba(255, 215, 0, 0.4),
      0 8px 25px var(--shadow-xl),
      inset 0 0 60px rgba(255, 255, 255, 0.4),
      inset 0 0 90px rgba(255, 255, 255, 0.2),
      inset 0 0 120px rgba(255, 215, 0, 0.15),
      inset 0 0 2px rgba(255, 215, 0, 0.9),
      inset 0 0 3px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 480px) {
    box-shadow:
      0 0 0 2px var(--color-border-gold),
      0 0 0 4px var(--color-border-gold-dark),
      0 0 0 6px var(--color-border-gold-darker),
      0 0 0 8px var(--color-secondary-light),
      0 0 40px var(--color-border-gold),
      0 0 60px rgba(255, 215, 0, 0.3),
      0 6px 20px var(--shadow-lg),
      inset 0 0 40px rgba(255, 255, 255, 0.3),
      inset 0 0 60px rgba(255, 255, 255, 0.15),
      inset 0 0 80px rgba(255, 215, 0, 0.1),
      inset 0 0 2px rgba(255, 215, 0, 0.9),
      inset 0 0 2px rgba(0, 0, 0, 0.15);
  }
}

@keyframes wheelShimmer {
  0%,
  100% {
    filter: brightness(1) contrast(1);
  }
  50% {
    filter: brightness(1.05) contrast(1.02);
  }
}

/* Wheel Segments - Enhanced with sophisticated hover effects and design system */
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
  will-change: transform;
  backface-visibility: hidden;
  clip-path: polygon(
    50% 50%,
    50% 0%,
    calc(50% + 50% * sin(var(--angle, 30deg))) calc(50% - 50% * cos(var(--angle, 30deg)))
  );
  /* Enhanced 3D button effect with sophisticated lighting using design system */
  box-shadow:
    inset 0 2px 8px rgba(255, 255, 255, 0.7),
    inset 0 -2px 8px rgba(0, 0, 0, 0.3),
    var(--shadow-md);
  /* Add sophisticated gradient overlay for depth */
  position: relative;
  overflow: hidden;
  /* Enhanced hover state preparation */
  transform: scale(1);
  /* Enhanced with better accessibility */
  min-height: 60px;
  min-width: 60px;
  /* Add touch-friendly sizing with design system */
  padding: var(--spacing-xs);
  /* Enhanced with subtle border using design system */
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* Enhanced responsive behavior */
  @media (max-width: 768px) {
    min-height: 50px;
    min-width: 50px;
    padding: calc(var(--spacing-xs) * 0.75);
  }

  @media (max-width: 480px) {
    min-height: 40px;
    min-width: 40px;
    padding: calc(var(--spacing-xs) * 0.5);
  }
}

.wheel-segment::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.3) 40%,
    transparent 100%
  );
  opacity: 0.85;
  pointer-events: none;
  /* Enhanced gradient animation on hover */
  transition: all var(--transition-base) ease;
  /* Enhanced with design system border radius */
  border-radius: inherit;
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
  transform: scale(1.05);
  z-index: var(--z-dropdown);
  filter: brightness(1.15) saturate(1.3);
  /* Enhanced with better accessibility */
  outline: 2px solid var(--color-text-white);
  outline-offset: 2px;
}

.wheel-segment:hover::before {
  opacity: 1;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.5) 40%,
    transparent 100%
  );
}

.wheel-segment:hover::after {
  width: 100%;
  height: 100%;
  opacity: 0.4;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent 60%);
}

.wheel-segment:active {
  filter: brightness(0.85) saturate(0.8);
  transform: scale(0.95);
  /* Enhanced with better feedback */
  transition: all var(--transition-fast);
}

.wheel-segment.selected {
  filter: brightness(1.3) saturate(1.4);
  box-shadow:
    inset 0 5px 15px rgba(255, 255, 255, 0.9),
    inset 0 -5px 15px rgba(0, 0, 0, 0.5),
    var(--shadow-xl),
    0 0 30px rgba(255, 215, 0, 0.6);
  transform: scale(1.08);
  z-index: var(--z-modal);
  /* Add pulsing glow animation for selected segments */
  animation: selectedPulse var(--transition-duration-base) ease-in-out infinite;
  /* Enhanced with better accessibility */
  border: 2px solid var(--color-border-gold);
}

@keyframes selectedPulse {
  0%,
  100% {
    filter: brightness(1.3) saturate(1.4) drop-shadow(0 0 20px var(--segment-color))
      drop-shadow(0 0 40px rgba(255, 215, 0, 0.6));
    transform: scale(1.08);
  }
  50% {
    filter: brightness(1.5) saturate(1.6) drop-shadow(0 0 30px var(--segment-color))
      drop-shadow(0 0 60px rgba(255, 215, 0, 0.8));
    transform: scale(1.08);
  }
}

.segment-content {
  position: absolute;
  top: 18%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  pointer-events: none;
  /* Enhanced with design system spacing for better layout */
  padding: var(--spacing-xs);
  /* Add subtle background for better readability using design system */
  background: rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(4px);
  /* Enhanced with design system for better contrast */
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* Enhanced responsive behavior */
  @media (max-width: 768px) {
    top: 16%;
    padding: calc(var(--spacing-xs) * 0.75);
  }

  @media (max-width: 480px) {
    top: 14%;
    padding: calc(var(--spacing-xs) * 0.5);
    gap: calc(var(--spacing-xs) * 0.5);
  }
}

.segment-icon {
  font-size: clamp(24px, 5vmin, 32px);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  /* Enhanced with design system for better responsiveness */
  @media (max-width: 768px) {
    font-size: clamp(20px, 4.5vmin, 28px);
  }

  @media (max-width: 480px) {
    font-size: clamp(16px, 4vmin, 24px);
  }
}

.segment-text {
  font-family: var(--font-display);
  font-size: clamp(10px, 2.5vmin, 14px);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-white);
  /* Enhanced text shadow with design system */
  text-shadow: var(--text-shadow-embossed-white);
  text-align: center;
  max-width: 80px;
  line-height: 1.2;
  /* Enhanced for accessibility */
  letter-spacing: 0.02em;
  word-spacing: 0.05em;
  /* Enhanced with design system for better readability */
  text-transform: uppercase;
  /* Add stroke effect for better contrast */
  -webkit-text-stroke: 1px rgba(0, 0, 0, 0.3);
  /* Enhanced with design system for better responsiveness */
  @media (max-width: 768px) {
    font-size: clamp(8px, 2.2vmin, 12px);
    max-width: 70px;
  }

  @media (max-width: 480px) {
    font-size: clamp(7px, 2vmin, 10px);
    max-width: 60px;
    line-height: 1.1;
  }
}

/* Wheel Center - Enhanced with design system integration */
.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-fixed);
  pointer-events: none;
  /* Enhanced with design system spacing */
  padding: var(--spacing-sm);
  /* Enhanced responsive behavior */
  @media (max-width: 768px) {
    padding: var(--spacing-xs);
  }

  @media (max-width: 480px) {
    padding: calc(var(--spacing-xs) * 0.75);
  }
}

.center-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(100px, 25vmin, 140px);
  height: clamp(100px, 25vmin, 140px);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 215, 0, 0.8), transparent 60%),
    radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent 80%);
  animation: glow var(--transition-duration-slow) ease-in-out infinite;
  /* Enhanced with better performance */
  will-change: transform, opacity;
  /* Enhanced with design system for better visual effects */
  mix-blend-mode: screen;
  /* Enhanced responsive behavior */
  @media (max-width: 768px) {
    width: clamp(80px, 22vmin, 120px);
    height: clamp(80px, 22vmin, 120px);
  }

  @media (max-width: 480px) {
    width: clamp(60px, 20vmin, 100px);
    height: clamp(60px, 20vmin, 100px);
  }
}

@keyframes glow {
  0%,
  100% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1);
    filter: brightness(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.08);
    filter: brightness(1.2);
  }
}

.center-circle {
  position: relative;
  width: clamp(80px, 18vmin, 120px);
  height: clamp(80px, 18vmin, 120px);
  border-radius: 50%;
  /* Enhanced 3D golden orb with layered radial gradients using design system */
  background:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.95), transparent 35%),
    radial-gradient(circle at 75% 75%, rgba(255, 215, 0, 0.8), transparent 45%),
    radial-gradient(circle at 50% 50%, var(--color-border-gold), var(--color-secondary-dark)),
    radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.4), transparent 60%);
  border: 4px solid var(--color-text-white);
  box-shadow:
    0 0 50px var(--color-border-gold),
    0 12px 35px var(--shadow-xl),
    inset 0 0 40px rgba(255, 255, 255, 0.6),
    inset 0 0 30px rgba(255, 215, 0, 0.5),
    inset 0 0 15px rgba(0, 0, 0, 0.2),
    0 0 80px rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  /* Enhanced with better performance */
  will-change: transform;
  /* Enhanced with design system for better visual effects */
  animation: centerPulse var(--transition-duration-slow) ease-in-out infinite;

  /* Enhanced responsive behavior */
  @media (max-width: 768px) {
    width: clamp(70px, 16vmin, 100px);
    height: clamp(70px, 16vmin, 100px);
    border-width: 3px;
    box-shadow:
      0 0 40px var(--color-border-gold),
      0 10px 25px var(--shadow-xl),
      inset 0 0 30px rgba(255, 255, 255, 0.5),
      inset 0 0 20px rgba(255, 215, 0, 0.4),
      inset 0 0 10px rgba(0, 0, 0, 0.2),
      0 0 60px rgba(255, 215, 0, 0.2);
  }

  @media (max-width: 480px) {
    width: clamp(60px, 14vmin, 80px);
    height: clamp(60px, 14vmin, 80px);
    border-width: 2px;
    box-shadow:
      0 0 30px var(--color-border-gold),
      0 8px 20px var(--shadow-lg),
      inset 0 0 20px rgba(255, 255, 255, 0.4),
      inset 0 0 15px rgba(255, 215, 0, 0.3),
      inset 0 0 8px rgba(0, 0, 0, 0.15),
      0 0 40px rgba(255, 215, 0, 0.15);
  }
}

.center-circle::before {
  content: '';
  position: absolute;
  top: 12%;
  left: 12%;
  width: 35%;
  height: 35%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.95), transparent 70%);
  border-radius: 50%;
  filter: blur(3px);
  /* Enhanced with subtle animation */
  animation: centerHighlight 3s ease-in-out infinite;
}

@keyframes centerHighlight {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.selected-icon,
.center-icon {
  font-size: clamp(32px, 7vmin, 48px);
  animation: bounce var(--transition-duration-base) ease-out;
  /* Enhanced with better text readability */
  text-shadow: var(--text-shadow-embossed-gold);
  /* Enhanced with design system for better accessibility */
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  /* Enhanced with design system for better visual effects */
  mix-blend-mode: screen;
  /* Enhanced responsive behavior */
  @media (max-width: 768px) {
    font-size: clamp(28px, 6vmin, 40px);
  }

  @media (max-width: 480px) {
    font-size: clamp(24px, 5vmin, 32px);
  }
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

/* Sparkles - Enhanced with design system integration */
.sparkles-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: var(--z-dropdown);
  opacity: 0.6;
  transition: opacity var(--transition-base);
  /* Enhanced with better performance */
  will-change: opacity, transform;
  /* Enhanced with design system for better visual effects */
  mix-blend-mode: screen;
  /* Enhanced responsive behavior */
  @media (max-width: 768px) {
    opacity: 0.5;
  }

  @media (max-width: 480px) {
    opacity: 0.4;
  }
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
    0 0 12px var(--color-border-gold),
    0 0 16px var(--color-text-white),
    0 0 20px rgba(255, 215, 0, 0.6);
  transform-origin: center center;
  animation: twinkle var(--transition-duration-base) ease-in-out infinite alternate;
  /* Enhanced with better accessibility and performance */
  will-change: transform, opacity;
  /* Enhanced with more sophisticated animation */
  mix-blend-mode: screen;
}

@keyframes twinkle {
  0% {
    opacity: 0.3;
    transform: var(--transform-base) scale(0.7);
    filter: brightness(0.8);
  }
  25% {
    opacity: 0.8;
    transform: var(--transform-base) scale(1);
    filter: brightness(1.2);
  }
  50% {
    opacity: 1;
    transform: var(--transform-base) scale(1.3);
    filter: brightness(1.5);
  }
  75% {
    opacity: 0.6;
    transform: var(--transform-base) scale(1);
    filter: brightness(1);
  }
  100% {
    opacity: 0.3;
    transform: var(--transform-base) scale(0.7);
    filter: brightness(0.8);
  }
}
</style>
