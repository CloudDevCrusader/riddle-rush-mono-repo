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

      <!-- Fortune Wheel -->
      <div class="wheel-container animate-slide-up">
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
          <button
            v-for="(letter, index) in alphabet"
            :key="letter"
            class="letter-btn tap-highlight no-select"
            :class="{ selected: selectedLetter === letter }"
            :style="getLetterPosition(index)"
            @click="selectLetter(letter, index)"
          >
            <img
              :src="`${baseUrl}assets/alphabets/a.png`"
              alt="Letter button"
              class="letter-bg"
            >
            <span
              class="letter-text"
              :style="{ transform: `rotate(-${wheelRotation + (index * angleStep)}deg)` }"
            >{{ letter }}</span>
          </button>
        </div>

        <!-- Center Circle Decoration -->
        <div class="wheel-center">
          <div class="center-glow" />
        </div>
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
const wheelRotation = ref(0)
const angleStep = 360 / 26 // 26 letters in alphabet
const isSpinning = ref(false)

onMounted(async () => {
  // Fetch categories and pick a random one to display
  await gameStore.fetchCategories()
  const randomCategory = gameStore.getRandomCategory()
  selectedCategory.value = randomCategory?.name || 'Animals'

  // Initial spin animation
  setTimeout(() => {
    spinWheel(Math.random() * 360)
  }, 500)
})

const getLetterPosition = (index: number) => {
  const angle = index * angleStep
  const radius = 180 // Distance from center in pixels

  return {
    transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`,
  }
}

const spinWheel = (targetRotation: number) => {
  isSpinning.value = true
  wheelRotation.value = targetRotation
  setTimeout(() => {
    isSpinning.value = false
  }, 1000)
}

const selectLetter = (letter: string, index: number) => {
  if (isSpinning.value) return

  selectedLetter.value = letter

  // Calculate rotation to bring selected letter to top
  // We want the letter to be at the top (12 o'clock position)
  const targetAngle = -(index * angleStep) + 90 // 90 degrees offset to align to top

  // Add multiple full rotations for dramatic effect
  const fullRotations = 2
  const finalRotation = targetAngle - (360 * fullRotations)

  spinWheel(finalRotation)
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

/* Fortune Wheel Container */
.wheel-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--spacing-lg) auto;
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
  font-size: 3rem;
  color: #FFD700;
  filter: drop-shadow(0 4px 12px rgba(255, 215, 0, 0.8))
          drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  animation: pointerPulse 2s ease-in-out infinite;
}

@keyframes pointerPulse {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-5px) scale(1.1);
    opacity: 0.9;
  }
}

/* Fortune Wheel */
.fortune-wheel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

/* Wheel Center */
.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow:
    0 0 20px rgba(102, 126, 234, 0.6),
    0 0 40px rgba(118, 75, 162, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.3);
  z-index: 5;
  pointer-events: none;
}

.center-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
  animation: centerPulse 3s ease-in-out infinite;
}

@keyframes centerPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
}

/* Letter Buttons on Wheel */
.letter-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transform-origin: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.letter-btn:hover {
  z-index: 3;
}

.letter-btn:hover .letter-bg {
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.5));
  transform: scale(1.15);
}

.letter-btn.selected .letter-bg {
  filter: drop-shadow(0 8px 20px rgba(255, 215, 0, 0.8))
          drop-shadow(0 0 30px rgba(255, 215, 0, 0.6));
  transform: scale(1.3);
}

.letter-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
  pointer-events: none;
}

.letter-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: var(--font-weight-black);
  color: #2a1810;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  transition: transform 0.3s ease;
  will-change: transform;
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

  .wheel-container {
    max-width: 350px;
  }

  .letter-btn {
    width: 45px;
    height: 45px;
  }

  .letter-text {
    font-size: 1.2rem;
  }

  .wheel-center {
    width: 60px;
    height: 60px;
  }

  .center-glow {
    width: 45px;
    height: 45px;
  }

  .pointer-arrow {
    font-size: 2rem;
  }

  .next-btn img {
    width: 200px;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .wheel-container {
    max-width: 450px;
  }

  .letter-btn {
    width: 55px;
    height: 55px;
  }
}
</style>
