<template>
  <div class="categories-page">
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/alphabets/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
    >

    <!-- Back Button -->
    <button
      class="back-btn tap-highlight no-select"
      @click="goBack"
    >
      <img
        :src="`${baseUrl}assets/alphabets/back.png`"
        alt="Back"
      >
    </button>

    <!-- Top Bar -->
    <div class="top-bar">
      <!-- Round Indicator -->
      <div class="round-indicator">
        <img
          :src="`${baseUrl}assets/alphabets/ROUND 01.png`"
          alt="Round 01"
        >
      </div>
    </div>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <div class="title-container animate-fade-in">
        <h1 class="main-title">
          {{ $t('home.category_title', 'Select Category') }}
        </h1>
      </div>

      <!-- Fortune Wheel -->
      <div class="animate-slide-up">
        <FortuneWheel
          ref="wheelRef"
          v-model="selectedCategory"
          :items="displayCategories"
          :get-item-key="(cat, idx) => cat?.searchWord || idx"
          :get-item-label="(cat) => $t(`categories.${cat.searchWord}`, cat.name)"
          :get-item-icon="getCategoryIcon"
          center-icon="🎯"
          @spin-complete="onSpinComplete"
        />
      </div>

      <!-- Spin/Next Button -->
      <button
        v-if="!selectedCategory"
        class="spin-btn tap-highlight no-select"
        :disabled="isSpinning"
        @click="spinWheel"
      >
        <img
          :src="`${baseUrl}assets/alphabets/next.png`"
          alt="Spin"
        >
        <span class="btn-text">{{ isSpinning ? $t('common.loading', 'SPINNING...') : 'SPIN!' }}</span>
      </button>
      <button
        v-else
        class="next-btn tap-highlight no-select"
        @click="goToAlphabet"
      >
        <img
          :src="`${baseUrl}assets/alphabets/next.png`"
          alt="Next"
        >
        <span class="btn-text">{{ $t('common.next', 'NEXT') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import type { Category } from '~/types/game'

const router = useRouter()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl
const gameStore = useGameStore()

const selectedCategory = ref<Category | null>(null)
const displayCategories = ref<Category[]>([])
const wheelRef = ref()

const isSpinning = computed(() => wheelRef.value?.isSpinning ?? false)

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

onMounted(async () => {
  // Fetch all categories
  await gameStore.fetchCategories()
  const allCategories = gameStore.categories

  // Select up to 12 categories for the wheel
  displayCategories.value = allCategories.slice(0, 12)
})

const getCategoryIcon = (category: Category): string => {
  return categoryIconMap[category.searchWord] || '📦'
}

const spinWheel = () => {
  wheelRef.value?.spinRandom()
}

const onSpinComplete = (category: Category) => {
  selectedCategory.value = category
}

const goToAlphabet = () => {
  if (selectedCategory.value) {
    // Navigate to alphabet page
    // TODO: Pass selected category to alphabet page
    router.push('/alphabet')
  }
}

const goBack = () => {
  router.back()
}

useHead({
  title: 'Select Category',
  meta: [
    {
      name: 'description',
      content: 'Choose a category for your game',
    },
  ],
})
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  background: #1a1a2e;
}

/* Background Image */
.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Back Button */
.back-btn {
  position: absolute;
  top: var(--spacing-xl);
  left: var(--spacing-xl);
  z-index: 3;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.back-btn img {
  width: clamp(40px, 5vw, 60px);
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.back-btn:hover {
  transform: scale(1.05);
}

.back-btn:active {
  transform: scale(0.95);
}

/* Top Bar */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}

.round-indicator img {
  width: clamp(120px, 20vw, 180px);
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

/* Container */
.container {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(var(--spacing-xl), 8vh, var(--spacing-3xl)) var(--spacing-md);
  gap: clamp(var(--spacing-md), 3vh, var(--spacing-xl));
}

/* Title */
.title-container {
  text-align: center;
}

.main-title {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-3xl), 6vw, var(--font-size-4xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5),
               0 0 30px rgba(255, 215, 0, 0.6);
  margin: 0;
  letter-spacing: 2px;
}

/* Spin and Next Buttons */
.spin-btn,
.next-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all var(--transition-base);
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.spin-btn img,
.next-btn img {
  width: clamp(140px, 30vw, 200px);
  height: auto;
  display: block;
}

.btn-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-display);
  font-size: clamp(16px, 4vw, 24px);
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  letter-spacing: 1px;
}

.spin-btn:hover:not(:disabled),
.next-btn:hover {
  transform: translateY(-4px) scale(1.05);
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))
          drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
}

.spin-btn:active:not(:disabled),
.next-btn:active {
  transform: translateY(-2px) scale(1.02);
}

.spin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.3) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out 0.2s backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .main-title {
    font-size: clamp(24px, 7vw, 36px);
  }

  .round-indicator img {
    width: clamp(100px, 18vw, 140px);
  }

  .spin-btn img,
  .next-btn img {
    width: clamp(120px, 35vw, 160px);
  }

  .btn-text {
    font-size: clamp(14px, 4.5vw, 20px);
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: clamp(20px, 6vw, 28px);
  }
}

@media (min-height: 800px) and (max-width: 640px) {
  .container {
    gap: clamp(var(--spacing-xl), 5vh, var(--spacing-2xl));
  }
}
</style>
