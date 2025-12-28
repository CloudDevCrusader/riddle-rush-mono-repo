<template>
  <div class="alphabet-page">
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

      <!-- Coin Bar -->
      <div class="coin-bar">
        <img
          :src="`${baseUrl}assets/alphabets/COIN BAR.png`"
          alt="Coin bar"
        >
      </div>
    </div>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <div class="title-container animate-fade-in">
        <img
          :src="`${baseUrl}assets/alphabets/alphabet.png`"
          alt="Alphabet"
          class="title-image"
        >
      </div>

      <!-- Category Display -->
      <div class="category-display animate-scale-in">
        <img
          :src="`${baseUrl}assets/alphabets/CATEGORY.png`"
          alt="Category"
          class="category-label"
        >
        <span class="category-name">{{ selectedCategory || 'Animals' }}</span>
      </div>

      <!-- Alphabet Grid -->
      <div class="alphabet-grid animate-slide-up">
        <button
          v-for="letter in alphabet"
          :key="letter"
          class="letter-btn tap-highlight no-select"
          :class="{ selected: selectedLetter === letter }"
          @click="selectLetter(letter)"
        >
          <img
            :src="`${baseUrl}assets/alphabets/a.png`"
            alt="Letter button"
            class="letter-bg"
          >
          <span class="letter-text">{{ letter }}</span>
        </button>
      </div>

      <!-- Next Button -->
      <button
        :disabled="!selectedLetter"
        class="next-btn tap-highlight no-select"
        :class="{ disabled: !selectedLetter }"
        @click="startGame"
      >
        <img
          :src="`${baseUrl}assets/alphabets/next.png`"
          alt="Next"
        >
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const router = useRouter()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl
const gameStore = useGameStore()

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const selectedLetter = ref<string | null>(null)
const selectedCategory = ref<string>('')

onMounted(() => {
  // Get category from game store or use default
  selectedCategory.value = gameStore.currentSession?.category?.name || 'Animals'
})

const selectLetter = (letter: string) => {
  selectedLetter.value = letter
}

const startGame = () => {
  if (selectedLetter.value) {
    // Start game with selected letter
    router.push('/game')
  }
}

const goBack = () => {
  router.back()
}

useHead({
  title: 'Select Letter',
  meta: [
    {
      name: 'description',
      content: 'Choose a starting letter',
    },
  ],
})
</script>

<style scoped>
.alphabet-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow-x: hidden;
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
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.round-indicator img,
.coin-bar img {
  height: clamp(30px, 4vw, 50px);
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
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
  padding: var(--spacing-3xl) var(--spacing-md);
  gap: var(--spacing-xl);
}

/* Title */
.title-container {
  display: flex;
  justify-content: center;
}

.title-image {
  width: clamp(250px, 35vw, 400px);
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

/* Category Display */
.category-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.category-label {
  width: clamp(120px, 18vw, 180px);
  height: auto;
}

.category-name {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-xl), 3vw, var(--font-size-3xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

/* Alphabet Grid */
.alphabet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: var(--spacing-md);
  width: 100%;
  max-width: 800px;
  padding: var(--spacing-lg);
}

.letter-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  aspect-ratio: 1;
  transition: transform var(--transition-base);
}

.letter-btn:hover {
  transform: translateY(-4px) scale(1.1);
}

.letter-btn:active {
  transform: translateY(-2px) scale(0.98);
}

.letter-btn.selected {
  transform: scale(1.15);
}

.letter-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  transition: filter var(--transition-base);
}

.letter-btn.selected .letter-bg {
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5)) brightness(1.2);
}

.letter-text {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-2xl), 4vw, var(--font-size-4xl));
  font-weight: var(--font-weight-black);
  color: #2a1810;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Next Button */
.next-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
  margin-top: var(--spacing-lg);
}

.next-btn:hover:not(.disabled) {
  transform: translateY(-4px) scale(1.05);
}

.next-btn:active:not(.disabled) {
  transform: translateY(-2px) scale(0.98);
}

.next-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-btn img {
  width: clamp(200px, 35vw, 300px);
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
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

.animate-scale-in {
  animation: scaleIn 0.6s ease-out 0.2s backwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out 0.4s backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .back-btn img {
    width: 40px;
  }

  .title-image {
    width: 250px;
  }

  .alphabet-grid {
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    max-width: 100%;
  }

  .next-btn img {
    width: 200px;
  }
}
</style>
