<template>
  <transition name="fade-out">
    <div
      v-if="visible"
      class="splash-screen"
    >
      <!-- Background Pattern -->
      <div class="bg-pattern" />

      <!-- Logo Container -->
      <div class="logo-container animate-fade-in">
        <!-- Game Title -->
        <h1 class="game-title">
          <span class="title-word riddle">RIDDLE</span>
          <span class="title-word rush">RUSH</span>
        </h1>

        <!-- Sparkle Effect -->
        <div class="sparkles">
          <div
            v-for="i in 12"
            :key="i"
            class="sparkle"
            :style="sparkleStyle(i)"
          />
        </div>
      </div>

      <!-- Loading Bar -->
      <div class="loading-container">
        <div class="loading-label">
          LOADING...
        </div>
        <div class="loading-bar-wrapper">
          <div class="loading-bar-bg">
            <div
              class="loading-bar-fill"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>
        <div class="loading-percentage">
          {{ Math.round(progress) }}%
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const visible = ref(true)
const progress = ref(0)

const emit = defineEmits<{
  complete: []
}>()

const sparkleStyle = (index: number) => {
  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
  const angle = angles[index % 12] || 0
  const distance = 120 + (index % 3) * 20
  const x = Math.cos((angle * Math.PI) / 180) * distance
  const y = Math.sin((angle * Math.PI) / 180) * distance
  const delay = (index * 0.1) % 1

  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    animationDelay: `${delay}s`,
  }
}

const simulateLoading = () => {
  const duration = 2000 // 2 seconds
  const intervalTime = 20 // Update every 20ms
  const steps = duration / intervalTime
  const increment = 100 / steps

  const interval = setInterval(() => {
    progress.value = Math.min(progress.value + increment, 100)

    if (progress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        visible.value = false
        setTimeout(() => {
          emit('complete')
        }, 500) // Wait for fade out animation
      }, 300) // Show 100% briefly
    }
  }, intervalTime)
}

onMounted(() => {
  simulateLoading()
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-gradient-main);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* Logo Container */
.logo-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-3xl);
}

/* Game Title */
.game-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  position: relative;
  z-index: 2;
}

.title-word {
  font-family: var(--font-display);
  font-size: clamp(3rem, 12vw, 6rem);
  font-weight: var(--font-weight-black);
  letter-spacing: 0.1em;
  text-align: center;
  line-height: 1;
  animation: title-glow 2s ease-in-out infinite;
}

.title-word.riddle {
  color: #FFD700;
  text-shadow:
    0 0 20px rgba(255, 215, 0, 0.8),
    0 0 40px rgba(255, 215, 0, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.3),
    -3px -3px 0 #FF8C00,
    3px 3px 0 #FF8C00;
}

.title-word.rush {
  color: #FFD700;
  text-shadow:
    0 0 20px rgba(255, 215, 0, 0.8),
    0 0 40px rgba(255, 215, 0, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.3),
    -3px -3px 0 #FF8C00,
    3px 3px 0 #FF8C00;
}

@keyframes title-glow {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}

/* Sparkles */
.sparkles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--color-white);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  animation: sparkle-twinkle 1s ease-in-out infinite;
  transform: translate(-50%, -50%);
}

@keyframes sparkle-twinkle {
  0%, 100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Loading Container */
.loading-container {
  position: absolute;
  bottom: var(--spacing-3xl);
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.loading-label {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.2em;
  animation: loading-pulse 1.5s ease-in-out infinite;
}

@keyframes loading-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.loading-bar-wrapper {
  width: 100%;
  position: relative;
}

.loading-bar-bg {
  width: 100%;
  height: 32px;
  background: linear-gradient(180deg, #8B5A2B 0%, #6B4423 100%);
  border-radius: var(--radius-full);
  border: 4px solid rgba(139, 90, 43, 0.5);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
}

.loading-bar-fill {
  height: 100%;
  background: linear-gradient(90deg,
    #FF8C00 0%,
    #FFA500 25%,
    #FFD700 50%,
    #FFA500 75%,
    #FF8C00 100%
  );
  border-radius: var(--radius-full);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 0 10px rgba(255, 215, 0, 0.6),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.loading-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: loading-shine 1.5s infinite;
}

@keyframes loading-shine {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

.loading-percentage {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.05em;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Fade Out Transition */
.fade-out-leave-active {
  transition: opacity 0.5s ease-out;
}

.fade-out-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .loading-container {
    bottom: var(--spacing-2xl);
    width: 85%;
  }

  .loading-label {
    font-size: var(--font-size-lg);
  }

  .loading-bar-bg {
    height: 24px;
  }
}
</style>
