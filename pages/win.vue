<template>
  <div class="win-page">
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/win/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
    >

    <!-- Main Container -->
    <div class="container">
      <!-- You Win Title -->
      <div class="title-container animate-bounce-in">
        <img
          :src="`${baseUrl}assets/win/you-win.png`"
          alt="You Win"
          class="title-image"
        >
      </div>

      <!-- Pop-up Card -->
      <div class="win-card animate-scale-in">
        <img
          :src="`${baseUrl}assets/win/pop up.png`"
          alt="Win card"
          class="card-bg"
        >

        <!-- Stars -->
        <div class="stars-container">
          <img
            v-for="n in stars"
            :key="`star-${n}`"
            :src="`${baseUrl}assets/win/Star.png`"
            alt="Star"
            class="star"
            :style="{ animationDelay: `${n * 0.2}s` }"
          >
          <img
            v-for="n in (3 - stars)"
            :key="`star-empty-${n}`"
            :src="`${baseUrl}assets/win/Star copy.png`"
            alt="Star empty"
            class="star empty"
          >
        </div>

        <!-- Score Bar -->
        <div class="score-container">
          <img
            :src="`${baseUrl}assets/win/score bar.png`"
            alt="Score bar"
            class="score-bar"
          >
          <span class="score-text">{{ score }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons animate-slide-up">
        <!-- Home Button -->
        <button
          class="action-btn home-btn tap-highlight no-select"
          @click="goHome"
        >
          <img
            :src="`${baseUrl}assets/win/home.png`"
            alt="Home"
          >
        </button>

        <!-- Next Button -->
        <button
          class="action-btn next-btn tap-highlight no-select"
          @click="nextRound"
        >
          <img
            :src="`${baseUrl}assets/win/next.png`"
            alt="Next"
          >
        </button>
      </div>
    </div>

    <!-- Back Button (optional) -->
    <button
      class="back-btn tap-highlight no-select"
      @click="goBack"
    >
      <img
        :src="`${baseUrl}assets/win/back.png`"
        alt="Back"
      >
    </button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl

// Mock data - replace with actual game data
const score = ref(850)
const stars = ref(3) // 1-3 stars based on score

onMounted(() => {
  // Calculate stars based on score
  if (score.value >= 800) {
    stars.value = 3
  } else if (score.value >= 500) {
    stars.value = 2
  } else {
    stars.value = 1
  }
})

const goHome = () => {
  router.push('/menu')
}

const nextRound = () => {
  // Go to scoring screen or next round
  router.push('/results')
}

const goBack = () => {
  router.back()
}

useHead({
  title: 'You Win!',
  meta: [
    {
      name: 'description',
      content: 'Victory screen',
    },
  ],
})
</script>

<style scoped>
.win-page {
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
  gap: var(--spacing-2xl);
}

/* Title */
.title-container {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
}

.title-image {
  width: clamp(250px, 40vw, 400px);
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.5));
}

/* Win Card */
.win-card {
  position: relative;
  width: clamp(350px, 60vw, 600px);
  aspect-ratio: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2xl);
}

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4));
}

/* Stars */
.stars-container {
  position: relative;
  z-index: 2;
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-3xl);
}

.star {
  width: clamp(50px, 8vw, 80px);
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(255, 215, 0, 0.6));
  animation: starPop 0.5s ease-out backwards;
}

.star.empty {
  opacity: 0.3;
  filter: none;
  animation: none;
}

@keyframes starPop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  70% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

/* Score */
.score-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  margin-top: var(--spacing-lg);
}

.score-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.score-text {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-3xl), 5vw, var(--font-size-5xl));
  font-weight: var(--font-weight-black);
  color: #fff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  padding: var(--spacing-md);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--spacing-xl);
  align-items: center;
  justify-content: center;
  margin-top: var(--spacing-lg);
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.action-btn:hover {
  transform: translateY(-4px) scale(1.05);
}

.action-btn:active {
  transform: translateY(-2px) scale(0.98);
}

.action-btn img {
  width: clamp(140px, 22vw, 200px);
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

/* Animations */
.animate-bounce-in {
  animation: bounceIn 1s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-100px);
  }
  50% {
    transform: scale(1.1) translateY(0);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.8s ease-out 0.3s backwards;
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

.animate-slide-up {
  animation: slideUp 0.6s ease-out 0.8s backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
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

  .win-card {
    width: 90vw;
  }

  .star {
    width: 50px;
  }

  .action-btn img {
    width: 140px;
  }
}
</style>
