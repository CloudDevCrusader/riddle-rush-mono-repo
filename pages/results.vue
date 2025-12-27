<template>
  <div class="results-page">
    <!-- Background Pattern -->
    <div class="bg-pattern" />

    <!-- Confetti (only for win) -->
    <div
      v-if="isWin"
      class="confetti-container"
    >
      <div
        v-for="i in 50"
        :key="i"
        class="confetti"
        :style="confettiStyle(i)"
      />
    </div>

    <!-- Main Container -->
    <div class="container">
      <!-- Results Card -->
      <div class="results-card animate-scale-in">
        <!-- Stars -->
        <div class="stars-container">
          <div
            v-for="i in 3"
            :key="i"
            class="star"
            :class="{ filled: isWin, empty: !isWin }"
            :style="{ animationDelay: `${i * 100}ms` }"
          >
            {{ isWin ? '⭐' : '★' }}
          </div>
        </div>

        <!-- Result Text -->
        <h1
          class="result-text"
          :class="{ win: isWin, lose: !isWin }"
        >
          {{ resultText }}
        </h1>

        <!-- Score Display -->
        <div class="score-container">
          <span class="score-label">{{ $t('results.your_score', 'Your Score') }} :</span>
          <span class="score-value">{{ finalScore }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <!-- Next/Restart Button -->
          <button
            v-if="isWin"
            class="btn btn-large btn-next tap-highlight no-select"
            @click="playNext"
          >
            <span class="btn-icon">▶</span>
            <span>{{ $t('results.next', 'Next') }}</span>
          </button>
          <button
            v-else
            class="btn btn-large btn-restart tap-highlight no-select"
            @click="restart"
          >
            <span class="btn-icon">↻</span>
            <span>{{ $t('results.restart', 'Restart') }}</span>
          </button>

          <!-- Home Button -->
          <button
            class="btn btn-large btn-home tap-highlight no-select"
            @click="goHome"
          >
            <span class="btn-icon">🏠</span>
            <span>{{ $t('results.home', 'Home') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

// Get result data from query params or use defaults
const finalScore = computed(() => {
  const score = route.query.score
  return typeof score === 'string' ? Number.parseInt(score) : 0
})

const isWin = computed(() => {
  const win = route.query.win
  return win === 'true' || finalScore.value > 0
})

const resultText = computed(() => {
  return isWin.value
    ? 'YOU WIN'
    : 'YOU LOSE'
})

const confettiStyle = (_index: number) => {
  const colors = ['#FF6B35', '#F7931E', '#4ECDC4', '#9B59B6', '#3498DB', '#2ECC71', '#F1C40F', '#E74C3C']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomLeft = Math.random() * 100
  const randomDelay = Math.random() * 3
  const randomDuration = 3 + Math.random() * 2

  return {
    left: `${randomLeft}%`,
    backgroundColor: randomColor,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`,
  }
}

const playNext = () => {
  router.push('/game')
}

const restart = () => {
  router.push('/game')
}

const goHome = () => {
  router.push('/')
}

useHead({
  title: 'Riddle Rush - Results',
  meta: [
    {
      name: 'description',
      content: 'Game results',
    },
  ],
})
</script>

<style scoped>
.results-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  background: var(--bg-gradient-main);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* Confetti Animation */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: confetti-fall linear infinite;
}

@keyframes confetti-fall {
  to {
    transform: translateY(100vh) rotate(360deg);
  }
}

/* Container */
.container {
  position: relative;
  max-width: 700px;
  width: 100%;
  padding: var(--spacing-xl) var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Results Card */
.results-card {
  width: 100%;
  background: linear-gradient(180deg, #E0F7FF 0%, #95D7EE 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl) var(--spacing-2xl);
  box-shadow:
    var(--shadow-xl),
    inset 0 2px 0 rgba(255, 255, 255, 0.5);
  border: 4px solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
}

/* Stars */
.stars-container {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.star {
  font-size: 80px;
  animation: star-bounce 0.6s ease-out backwards;
}

.star.filled {
  filter: drop-shadow(0 4px 8px rgba(255, 215, 0, 0.5));
}

.star.empty {
  color: #999;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

@keyframes star-bounce {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(20deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Result Text */
.result-text {
  font-family: var(--font-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  margin: 0;
  text-align: center;
  letter-spacing: 0.05em;
  animation: result-appear 0.5s ease-out 0.3s backwards;
}

.result-text.win {
  color: #FFD700;
  text-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2),
    -2px -2px 0 #FF8C00,
    2px 2px 0 #FF8C00;
}

.result-text.lose {
  color: #E74C3C;
  text-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2),
    -2px -2px 0 #C0392B,
    2px 2px 0 #C0392B;
}

@keyframes result-appear {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Score Container */
.score-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  background: #2C5F8D;
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 400px;
  animation: score-slide 0.5s ease-out 0.5s backwards;
}

.score-label {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.score-value {
  font-family: var(--font-display);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes score-slide {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 400px;
  animation: buttons-appear 0.5s ease-out 0.7s backwards;
}

@keyframes buttons-appear {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.btn-next {
  background: linear-gradient(180deg, #7ED321 0%, #5FB31F 100%);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    var(--shadow-lg),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
}

.btn-restart {
  background: linear-gradient(180deg, #4ECDC4 0%, #3AAFA9 100%);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    var(--shadow-lg),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
}

.btn-home {
  background: linear-gradient(180deg, #FF8C61 0%, #FF6B35 100%);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    var(--shadow-lg),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
}

.btn-next:hover,
.btn-restart:hover,
.btn-home:hover {
  transform: translateY(-2px);
  box-shadow:
    0 20px 52px rgba(0, 0, 0, 0.25),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
}

.btn-next:active,
.btn-restart:active,
.btn-home:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.2em;
}

/* Responsive */
@media (max-width: 640px) {
  .results-card {
    padding: var(--spacing-2xl) var(--spacing-xl);
  }

  .star {
    font-size: 60px;
  }

  .result-text {
    font-size: var(--font-size-3xl);
  }

  .score-label {
    font-size: var(--font-size-lg);
  }

  .score-value {
    font-size: var(--font-size-2xl);
  }
}
</style>
