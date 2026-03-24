<template>
  <div class="wheel-container">
    <!-- Wheel Pointer/Arrow -->
    <div class="wheel-pointer">
      <div class="pointer-arrow">
        <div class="pointer-inner" />
        <div class="pointer-glow" />
      </div>
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
            :style="{
              transform: `rotate(-${Number(wheelRotation) + Number(index) * Number(angleStep)}deg)`,
            }"
          >
            {{ getItemIcon(item) }}
          </span>
          <span
            class="segment-text"
            :style="{
              transform: `rotate(-${Number(wheelRotation) + Number(index) * Number(angleStep)}deg)`,
            }"
          >
            {{ getItemLabel(item) }}
          </span>
        </div>
      </button>
    </div>

    <!-- Center Circle -->
    <div class="wheel-center">
      <div class="center-glow" />
      <div class="center-ring" />
      <div class="center-circle">
        <div class="center-ornament" />
        <span v-if="selectedItem && getItemIcon(selectedItem as T)" class="selected-icon">
          {{ getItemIcon(selectedItem as T) }}
        </span>
        <span v-else class="center-icon">{{ centerIcon }}</span>
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

// Enhanced color palette with more vibrant colors for better mobile visibility
const defaultColors = [
  '#1e3a8a', // deep blue
  '#2563eb', // bright blue
  '#3b82f6', // lighter blue
  '#60a5fa', // light blue
  '#93c5fd', // very light blue
  '#1d4ed8', // medium blue
  '#7c3aed', // purple
  '#a855f7', // light purple
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

const spinWheel = (targetRotation: number) => {
  isSpinning.value = true

  // Use requestAnimationFrame for smoother animation
  const startTime = performance.now()
  const duration = 2000 // 2 seconds for more dramatic spin
  const startRotation = wheelRotation.value
  const rotationDiff = targetRotation - startRotation

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Enhanced ease-out animation with bounce effect
    const easedProgress = 1 - Math.pow(1 - progress, 4)

    // Add slight bounce at the end
    const bounceProgress =
      progress < 0.9 ? easedProgress : 1 - Math.pow((1 - progress) / 0.1, 2) * 0.1 + easedProgress

    wheelRotation.value = startRotation + rotationDiff * bounceProgress

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isSpinning.value = false
      wheelRotation.value = targetRotation // Ensure exact final position
    }
  }

  requestAnimationFrame(animate)
}

const selectItem = (item: T, index: number) => {
  if (isSpinning.value || !item) return

  selectedItem.value = item
  emit('update:modelValue', item)

  // Calculate rotation to bring selected item to top
  const targetAngle = -(index * angleStep.value) + 90

  // Add 4-6 full rotations for more dramatic effect
  const fullRotations = 4 + Math.floor(Math.random() * 3)
  const finalRotation = targetAngle - 360 * fullRotations

  spinWheel(finalRotation)

  // Emit spin complete after animation
  setTimeout(() => {
    if (item) emit('spin-complete', item)
  }, 1800)
}

// Expose spin method for parent components
const spinRandom = () => {
  if (isSpinning.value || props.items.length === 0) return null

  // Pick a random item
  const randomIndex = Math.floor(Math.random() * props.items.length)
  const randomItem = props.items[randomIndex]

  if (!randomItem) return null

  // Calculate rotation to land on selected item
  const targetAngle = -(randomIndex * angleStep.value) + 90

  // Add 4-6 full rotations for dramatic effect
  const fullRotations = 4 + Math.floor(Math.random() * 3)
  const finalRotation = targetAngle - 360 * fullRotations

  spinWheel(finalRotation)

  // Set selected item after spin completes
  setTimeout(() => {
    if (randomItem) {
      selectedItem.value = randomItem
      emit('update:modelValue', randomItem)
      emit('spin-complete', randomItem)
    }
  }, 2000)

  return randomItem
}

defineExpose({
  spinRandom,
  isSpinning,
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue: unknown) => {
    selectedItem.value = newValue
  }
)
</script>

<style scoped>
/* Wheel Container — enhanced fluid sizing for better mobile experience */
.wheel-container {
  position: relative;
  width: min(85vw, 85dvh, 440px);
  height: min(85vw, 85dvh, 440px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* Enhanced responsive sizing for mobile */
@media (max-width: 768px) {
  .wheel-container {
    width: min(80vw, 80dvh, 380px);
    height: min(80vw, 80dvh, 380px);
  }
}

/* Smaller override for very narrow viewports */
@media (max-width: 400px) {
  .wheel-container {
    width: min(75vw, 75dvh, 320px);
    height: min(75vw, 75dvh, 320px);
  }
}

/* Wheel Pointer */
.wheel-pointer {
  position: absolute;
  top: calc(-1 * clamp(24px, 6vw, 36px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

/* Enhanced pointer design with multiple layers */
.pointer-arrow {
  position: relative;
  font-size: 0;
  display: block;
  width: clamp(24px, 6vw, 36px);
  height: clamp(28px, 7vw, 42px);
  animation: pointer-pulse 2s ease-in-out infinite;
}

.pointer-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4, #45b7d1);
  clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 16px rgba(255, 107, 107, 0.8));
  animation: gradient-shift 3s ease-in-out infinite;
}

.pointer-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.3));
  clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
  opacity: 0.7;
}

@keyframes pointer-pulse {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-2px) scale(1.05);
  }
  50% {
    transform: translateY(2px) scale(0.95);
  }
  75% {
    transform: translateY(-1px) scale(1.02);
  }
}

@keyframes gradient-shift {
  0%,
  100% {
    filter: hue-rotate(0deg) brightness(1);
  }
  50% {
    filter: hue-rotate(180deg) brightness(1.1);
  }
}

/* Fortune Wheel — enhanced with multiple gradients and effects */
.fortune-wheel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 2s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
  border: clamp(8px, 2.5vw, 14px) solid;
  border-image: linear-gradient(45deg, #ffd700, #ffb347, #ff6b6b, #4ecdc4, #45b7d1, #ffd700) 1;
  box-shadow:
    0 0 0 clamp(4px, 1.2vw, 8px) rgba(0, 0, 0, 0.3),
    0 0 40px rgba(255, 215, 0, 0.4),
    0 12px 40px rgba(0, 0, 0, 0.5),
    inset 0 0 30px rgba(255, 255, 255, 0.1),
    inset 0 0 60px rgba(255, 215, 0, 0.1);
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), transparent 50%);
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
  transition:
    filter 0.3s ease,
    transform 0.2s ease,
    box-shadow 0.3s ease,
    z-index 0.1s ease;
  clip-path: polygon(
    50% 50%,
    50% 0%,
    calc(50% + 50% * sin(var(--angle, 30deg))) calc(50% - 50% * cos(var(--angle, 30deg)))
  );
  overflow: hidden;
  z-index: 1;
}

/* Enhanced segment styling with gradients */
.wheel-segment::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.1) 30%,
      transparent 70%
    ),
    linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 100%
    );
  opacity: 0.8;
  pointer-events: none;
}

.wheel-segment::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.1) 100%);
  pointer-events: none;
}

.wheel-segment:hover {
  filter: brightness(1.15) saturate(1.1);
  transform: scale(1.02);
  z-index: 10;
  box-shadow:
    inset 0 0 20px rgba(255, 255, 255, 0.3),
    0 0 15px var(--segment-color);
}

.wheel-segment:active {
  filter: brightness(0.9) saturate(1.2);
  transform: scale(0.98);
}

.wheel-segment.selected {
  filter: brightness(1.3) saturate(1.2);
  box-shadow:
    inset 0 0 25px rgba(255, 255, 255, 0.6),
    inset 0 -3px 12px rgba(0, 0, 0, 0.3),
    0 0 30px var(--segment-color),
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(255, 255, 255, 0.3);
  z-index: 15;
  animation: selected-pulse 0.6s ease-out;
}

@keyframes selected-pulse {
  0% {
    transform: scale(1);
    filter: brightness(1) saturate(1);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.4) saturate(1.3);
  }
  100% {
    transform: scale(1);
    filter: brightness(1.3) saturate(1.2);
  }
}

.segment-content {
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  pointer-events: none;
  z-index: 2;
}

.segment-icon {
  font-size: clamp(18px, 5.5vw, 34px);
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
  animation: icon-float 3s ease-in-out infinite;
}

.segment-text {
  font-family: var(--font-display);
  font-size: clamp(10px, 3vw, 16px);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow:
    0 2px 6px rgba(0, 0, 0, 0.7),
    0 0 12px rgba(255, 255, 255, 0.3);
  text-align: center;
  max-width: clamp(45px, 13vw, 85px);
  line-height: 1.3;
  letter-spacing: 0.5px;
}

@keyframes icon-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* Enhanced Wheel Center */
.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  pointer-events: none;
}

.center-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(120px, 25vw, 160px);
  height: clamp(120px, 25vw, 160px);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.8) 0%,
    rgba(255, 182, 71, 0.6) 30%,
    rgba(255, 107, 107, 0.4) 60%,
    transparent 80%
  );
  animation: glow-pulse 2.5s ease-in-out infinite;
}

.center-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(90px, 22vw, 130px);
  height: clamp(90px, 22vw, 130px);
  border-radius: 50%;
  border: clamp(3px, 0.8vw, 5px) solid rgba(255, 255, 255, 0.8);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 182, 71, 0.2));
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.6),
    inset 0 0 15px rgba(255, 255, 255, 0.2);
}

.center-circle {
  position: relative;
  width: clamp(70px, 20vw, 130px);
  height: clamp(70px, 20vw, 130px);
  border-radius: 50%;
  background:
    linear-gradient(135deg, #ffd700, #ffb347),
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 60%);
  border: clamp(3px, 1vw, 5px) solid var(--color-white);
  box-shadow:
    0 0 25px rgba(255, 215, 0, 0.9),
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 0 25px rgba(255, 255, 255, 0.4),
    inset 0 0 15px rgba(255, 215, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: center-rotate 20s linear infinite;
}

.center-ornament {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #ffd700, #ffb347, #ff6b6b, #4ecdc4, #45b7d1, #ffd700);
  opacity: 0.3;
  animation: ornament-rotate 15s linear infinite reverse;
}

.selected-icon,
.center-icon {
  position: relative;
  z-index: 3;
  font-size: clamp(28px, 7vw, 44px);
  animation: bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.5));
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.15);
  }
}

@keyframes center-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ornament-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0% {
    transform: scale(0) rotate(0deg);
  }
  50% {
    transform: scale(1.3) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}

/* Mobile-specific optimizations */
@media (max-width: 768px) {
  .segment-text {
    font-size: clamp(9px, 3.5vw, 14px);
    max-width: clamp(40px, 12vw, 70px);
  }

  .segment-icon {
    font-size: clamp(16px, 5vw, 28px);
  }

  .center-glow {
    width: clamp(100px, 24vw, 140px);
    height: clamp(100px, 24vw, 140px);
  }

  .center-ring {
    width: clamp(80px, 20vw, 110px);
    height: clamp(80px, 20vw, 110px);
  }

  .center-circle {
    width: clamp(60px, 18vw, 110px);
    height: clamp(60px, 18vw, 110px);
  }

  .selected-icon,
  .center-icon {
    font-size: clamp(24px, 6.5vw, 38px);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .wheel-segment {
    border: 1px solid rgba(255, 255, 255, 0.8);
  }

  .segment-text {
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.9),
      0 0 8px rgba(255, 255, 255, 0.5);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .fortune-wheel {
    transition: transform 0.5s ease;
  }

  .pointer-arrow,
  .center-glow,
  .center-circle,
  .center-ornament,
  .segment-icon {
    animation: none;
  }

  .wheel-segment.selected {
    animation: none;
  }
}
</style>
