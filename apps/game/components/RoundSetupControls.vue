<template>
  <!-- Dual Wheels Phase (only shown if feature is enabled) -->
  <transition name="wheel-fade">
    <div v-if="showWheels && !wheelsComplete" class="wheels-container">
      <div class="wheel-wrapper">
        <div class="wheel-label">
          {{ t('common.category', 'Category') }}
        </div>
        <FortuneWheel
          ref="categoryWheelRef"
          v-model="selectedCategory"
          :items="displayCategories"
          :get-item-key="(cat, idx) => cat?.searchWord || idx"
          :get-item-label="(cat) => t(`categories.${cat.searchWord}`, cat.name)"
          :get-item-icon="getCategoryIcon"
          center-icon="🎯"
          @spin-complete="onCategoryComplete"
        />
      </div>

      <div class="wheel-wrapper">
        <div class="wheel-label">
          {{ t('common.letter', 'Letter') }}
        </div>
        <FortuneWheel
          ref="letterWheelRef"
          v-model="selectedLetter"
          :items="alphabet"
          :get-item-key="(letter) => letter"
          :get-item-label="(letter) => letter"
          :get-item-icon="() => ''"
          center-icon="🎯"
          @spin-complete="onLetterComplete"
        />
      </div>
    </div>
  </transition>

  <!-- Selected Values Display Phase (only shown if fortune wheel was used) -->
  <transition name="results-fade">
    <div v-if="showWheels && wheelsComplete && !hideResults" class="results-display">
      <div class="result-item animate-scale-in">
        <div class="result-label">
          {{ t('common.category', 'Category') }}
        </div>
        <div class="result-value">
          <span class="result-icon">{{ selectedCategoryIcon }}</span>
          <span class="result-text">{{ selectedCategoryName }}</span>
        </div>
      </div>

      <div class="divider">×</div>

      <div class="result-item animate-scale-in" style="animation-delay: 0.2s">
        <div class="result-label">
          {{ t('common.letter', 'Letter') }}
        </div>
        <div class="result-value">
          <span class="result-text result-letter">{{ selectedLetter }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { Category } from '@riddle-rush/types/game'
import { WHEEL_FADE_DELAY_MS, RESULTS_DISPLAY_DURATION_MS } from '@riddle-rush/shared/constants'
import { WHEEL_AUTO_SPIN_DELAY_MS } from '~/utils/animation-constants'

const { t } = useI18n()

interface Props {
  categories: Category[]
  showWheels: boolean
  hideResults?: boolean
}

interface Emits {
  (e: 'setup-complete', category: Category, letter: string): void
}

const props = withDefaults(defineProps<Props>(), {
  hideResults: false,
})

const emit = defineEmits<Emits>()

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const selectedCategory = ref<Category | null>(null)
const selectedLetter = ref<string | null>(null)
const displayCategories = ref<Category[]>([])
const categoryWheelRef = ref()
const letterWheelRef = ref()

const categorySpinComplete = ref(false)
const letterSpinComplete = ref(false)
const wheelsComplete = ref(false)

const categoryIconMap: Record<string, string> = {
  female_name: '👩',
  male_name: '👨',
  water_vehicle: '⛵',
  flowers: '🌸',
  plants: '🌿',
  profession: '👔',
  insect: '🐛',
  animal: '🦁',
  city: '🏙️',
  country: '🌍',
  food: '🍕',
  drink: '🧃',
  sport: '⚽',
  music: '🎵',
  movie: '🎬',
}

const selectedCategoryIcon = computed(() => {
  if (!selectedCategory.value) return '📦'
  return getCategoryIcon(selectedCategory.value)
})

const selectedCategoryName = computed(() => {
  if (!selectedCategory.value) return ''
  return t(`categories.${selectedCategory.value.searchWord}`, selectedCategory.value.name)
})

const getCategoryIcon = (category: Category): string => {
  return categoryIconMap[category.searchWord] || '📦'
}

const onCategoryComplete = (category: Category) => {
  selectedCategory.value = category
  categorySpinComplete.value = true
  checkBothComplete()
}

const onLetterComplete = (letter: string) => {
  selectedLetter.value = letter
  letterSpinComplete.value = true
  checkBothComplete()
}

const checkBothComplete = () => {
  if (categorySpinComplete.value && letterSpinComplete.value) {
    // Both wheels have completed spinning
    // Wait a moment, then fade out wheels
    setTimeout(() => {
      wheelsComplete.value = true

      // After showing results, emit setup complete
      setTimeout(() => {
        if (selectedCategory.value && selectedLetter.value) {
          emit('setup-complete', selectedCategory.value, selectedLetter.value)
        }
      }, RESULTS_DISPLAY_DURATION_MS)
    }, WHEEL_FADE_DELAY_MS)
  }
}

/**
 * Select random category and letter without showing wheels
 * Used when fortune wheel feature is disabled
 */
const selectRandom = (): { category: Category; letter: string } | null => {
  if (props.categories.length === 0) return null

  const randomCategory = props.categories[Math.floor(Math.random() * props.categories.length)]
  const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)]

  if (!randomCategory || !randomLetter) return null

  selectedCategory.value = randomCategory
  selectedLetter.value = randomLetter

  return { category: randomCategory, letter: randomLetter }
}

/**
 * Start the wheel spins
 * Called by parent after component is mounted and ready
 */
const startWheelSpins = () => {
  // Select up to 12 categories for the wheel
  displayCategories.value = props.categories.slice(0, 12)

  // Auto-spin both wheels after a short delay
  setTimeout(() => {
    categoryWheelRef.value?.spinRandom()
    letterWheelRef.value?.spinRandom()
  }, WHEEL_AUTO_SPIN_DELAY_MS)
}

defineExpose({
  selectRandom,
  startWheelSpins,
  selectedCategory,
  selectedLetter,
})
</script>

<style scoped>
/* Dual Wheels Container */
.wheels-container {
  display: flex;
  gap: clamp(var(--spacing-xl), 5vw, var(--spacing-3xl));
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
}

.wheel-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  max-width: 420px;
}

.wheel-label {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-xl), 3vw, var(--font-size-2xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Results Display */
.results-display {
  display: flex;
  gap: clamp(var(--spacing-2xl), 6vw, var(--spacing-3xl));
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 900px;
}

.result-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  padding: clamp(var(--spacing-xl), 4vw, var(--spacing-3xl));
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 0 40px rgba(255, 215, 0, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.result-label {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-base), 2vw, var(--font-size-lg));
  font-weight: var(--font-weight-semibold);
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.result-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.result-icon {
  font-size: clamp(48px, 8vw, 72px);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.result-text {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-2xl), 4vw, var(--font-size-3xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(255, 215, 0, 0.6);
}

.result-letter {
  font-size: clamp(64px, 10vw, 96px);
  background: linear-gradient(135deg, #ffd700, #ffa500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.divider {
  font-size: clamp(var(--font-size-3xl), 6vw, var(--font-size-4xl));
  font-weight: var(--font-weight-black);
  color: rgba(255, 215, 0, 0.5);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Transitions */
.wheel-fade-enter-active,
.wheel-fade-leave-active {
  transition: all 0.8s ease-out;
}

.wheel-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.wheel-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.results-fade-enter-active {
  transition: all 0.8s ease-out;
}

.results-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out backwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive - Stack wheels vertically on mobile */
@media (max-width: 768px) {
  .wheels-container {
    flex-direction: column;
    gap: var(--spacing-2xl);
    width: 100%;
    max-width: 500px;
  }

  .wheel-wrapper {
    width: 100%;
    max-width: 380px;
  }

  .wheel-label {
    font-size: clamp(var(--font-size-lg), 4vw, var(--font-size-xl));
  }

  .results-display {
    flex-direction: column;
    gap: var(--spacing-xl);
    width: calc(100% - 2rem);
  }

  .result-item {
    width: 100%;
    max-width: 400px;
  }

  .divider {
    transform: rotate(90deg);
  }
}

@media (max-width: 480px) {
  .wheels-container {
    gap: var(--spacing-xl);
    max-width: 100%;
  }

  .wheel-wrapper {
    width: 100%;
    max-width: 320px;
  }

  .results-display {
    width: calc(100% - 2rem);
  }

  .result-text {
    font-size: clamp(var(--font-size-xl), 5vw, var(--font-size-2xl));
  }

  .result-letter {
    font-size: clamp(48px, 12vw, 72px);
  }
}

/* Pixel 7 Pro specific (412px width, tall screen) */
@media (min-width: 390px) and (max-width: 480px) {
  .wheels-container {
    gap: var(--spacing-xl);
    max-width: 100%;
  }

  .wheel-wrapper {
    width: 100%;
    max-width: 340px;
  }

  .results-display {
    width: calc(100% - 2rem);
  }
}

@media (min-width: 769px) and (max-height: 700px) {
  /* Landscape mode on tablets/small screens */
  .wheels-container {
    gap: var(--spacing-lg);
  }

  .wheel-wrapper {
    max-width: 320px;
  }
}
</style>
