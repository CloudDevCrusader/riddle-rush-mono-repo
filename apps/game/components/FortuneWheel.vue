<template>
  <div class="wheel-wrapper">
    <FortuneWheel
      ref="wheelEl"
      class="fortune-wheel"
      :style="{ width: '100%', height: '100%' }"
      :type="'canvas'"
      :use-weight="false"
      :disabled="true"
      :verify="false"
      :prize-id="prizeId"
      :prizes="mappedPrizes"
      :canvas="canvasOptions"
      :duration="2400"
      :timing-fun="'cubic-bezier(0.25, 0.1, 0.25, 1)'"
      :angle-base="3"
      @rotate-start="onRotateStart"
      @rotate-end="onRotateEnd"
    />
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
import FortuneWheel from 'vue-fortune-wheel'
import 'vue-fortune-wheel/style.css'

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

const wheelEl = ref()
const isSpinning = ref(false)
const selectedItem = ref<T | null>(props.modelValue)

// Use the exact original colors
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

// To resolve CSS variables to hex for the canvas
const resolveCssColor = (colorVar: string): string => {
  if (typeof window === 'undefined') return '#000000'
  const tempEl = document.createElement('div')
  tempEl.style.color = colorVar
  document.body.appendChild(tempEl)
  const computedColor = window.getComputedStyle(tempEl).color
  document.body.removeChild(tempEl)

  // convert rgb to hex since vue-fortune-wheel might prefer hex
  const rgbMatch = computedColor.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
  if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
    return (
      '#' +
      ('0' + parseInt(rgbMatch[1], 10).toString(16)).slice(-2) +
      ('0' + parseInt(rgbMatch[2], 10).toString(16)).slice(-2) +
      ('0' + parseInt(rgbMatch[3], 10).toString(16)).slice(-2)
    )
  }
  return colorVar
}

const mappedPrizes = computed(() => {
  return props.items.map((item: T, index: number) => {
    const rawColor = props.getItemColor
      ? props.getItemColor(item, index)
      : defaultColors[index % defaultColors.length]

    // We try to resolve the CSS variable, fallback to some colors if SSR
    const bgColor = rawColor?.startsWith('var(') ? resolveCssColor(rawColor) : rawColor || '#45ace9'

    const icon = props.getItemIcon ? props.getItemIcon(item) : ''
    const label = props.getItemLabel(item)
    // Add icon to the label if it exists
    const name = icon ? `${icon} ${label}` : label

    return {
      id: index + 1, // id must be > 0
      name: name,
      value: props.getItemKey(item, index),
      bgColor: bgColor || '#45ace9', // Fallback color
      color: '#ffffff',
      probability: 100 / props.items.length,
    }
  })
})

const prizeId = ref(0)

const canvasOptions = {
  radius: 200,
  textRadius: 150,
  textLength: 12,
  textDirection: 'horizontal',
  lineHeight: 20,
  borderWidth: 6,
  borderColor: 'transparent',
  btnText: '', // We hide the button text as requested by the vertical stack design
  btnWidth: 0, // Hide the button completely to use a custom one in the middle
  fontSize: 16,
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

const spinRandom = () => {
  if (isSpinning.value || props.items.length === 0) return null

  const randomIndex = Math.floor(Math.random() * props.items.length)
  const randomItem = props.items[randomIndex]

  if (!randomItem) return null

  prizeId.value = randomIndex + 1 // id is index + 1
  selectedItem.value = randomItem
  emit('update:modelValue', randomItem)

  // Add a tiny delay to ensure prizeId is updated before spinning
  setTimeout(() => {
    wheelEl.value?.startRotate()
  }, 50)

  return randomItem
}

const onRotateStart = () => {
  isSpinning.value = true
}

const onRotateEnd = (prize: any) => {
  isSpinning.value = false
  // Find the original item based on the key
  const originalItem = props.items.find(
    (item: T, index: number) => props.getItemKey(item, index) === prize.value
  )

  if (originalItem) {
    emit('spin-complete', originalItem as T)
  }
}

defineExpose({
  spinRandom,
  isSpinning,
})

watch(
  () => props.modelValue,
  (newValue: T | null) => {
    selectedItem.value = newValue
  }
)
</script>

<style scoped lang="scss">
@use '~/assets/scss/design-system.scss' as *;

.wheel-wrapper {
  position: relative;
  width: clamp(240px, 65vmin, 420px);
  height: clamp(240px, 65vmin, 420px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  filter: drop-shadow(var(--shadow-lg));
  transition: filter var(--transition-duration-normal) var(--transition-base);
  padding: var(--spacing-sm);
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), transparent 40%),
    radial-gradient(circle at 70% 70%, rgba(255, 215, 0, 0.1), transparent 60%),
    radial-gradient(circle at center, rgba(255, 255, 255, 0.08), transparent 70%);
  border-radius: var(--radius-xl);
  overflow: visible;
  border: 1px solid rgba(255, 215, 0, 0.2);

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

.fortune-wheel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow:
    0 0 0 4px var(--color-border-gold),
    0 0 0 8px var(--color-border-gold-dark),
    0 0 0 12px var(--color-border-gold-darker),
    0 0 0 16px var(--color-secondary-light),
    0 0 0 20px rgba(255, 255, 255, 0.1),
    0 0 100px var(--color-border-gold),
    0 0 150px rgba(255, 215, 0, 0.6),
    0 0 200px rgba(255, 215, 0, 0.3),
    0 12px 40px var(--shadow-xl),
    inset 0 0 80px rgba(255, 255, 255, 0.5),
    inset 0 0 120px rgba(255, 255, 255, 0.3),
    inset 0 0 160px rgba(255, 215, 0, 0.2),
    inset 0 0 2px rgba(255, 215, 0, 0.9),
    inset 0 0 4px rgba(0, 0, 0, 0.2),
    inset 0 0 1px rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;
  background-clip: padding-box;
  animation: wheelShimmer 4s ease-in-out infinite;

  :deep(.fw-wheel) {
    border-radius: 50%;
  }

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
  will-change: opacity, transform;
  mix-blend-mode: screen;

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
  will-change: transform, opacity;
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
