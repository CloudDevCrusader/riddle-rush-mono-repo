<template>
  <transition name="fade">
    <div v-if="isLoading" class="global-loading-overlay">
      <div class="loading-container">
        <!-- Game-Themed Loading Animation -->
        <div class="loading-animation">
          <div class="game-icon">
            <svg viewBox="0 0 100 100" class="game-svg">
              <path
                d="M20,20 Q50,5 80,20 Q95,50 80,80 Q50,95 20,80 Q5,50 20,20"
                fill="var(--color-primary)"
              />
              <circle cx="50" cy="50" r="15" fill="var(--color-secondary)" />
            </svg>
          </div>
          <div class="loading-spinner">
            <div class="spinner-circle" />
          </div>
        </div>

        <!-- Loading Text with Game Style -->
        <div class="loading-text">Loading</div>

        <!-- Progress Bar Inspired by Splash Screen -->
        <div v-if="showProgress" class="progress-container">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${progress}%` }">
              <div class="progress-glow" />
            </div>
          </div>
          <div class="progress-percentage">{{ Math.round(progress) }}%</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const { isLoading, progress, showProgress } = useLoading()
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(11, 59, 118, 0.85), rgba(10, 123, 218, 0.75));
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  width: 85%;
  max-width: 400px;
  padding: var(--spacing-2xl);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 241, 211, 0.92) 100%);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 3px solid rgba(255, 255, 255, 0.65);
}

/* Game-Themed Loading Animation */
.loading-animation {
  position: relative;
  width: 100px;
  height: 100px;
  animation: float 3s ease-in-out infinite;
}

.game-icon {
  width: 100%;
  height: 100%;
  position: relative;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
}

.game-svg {
  width: 100%;
  height: 100%;
  animation: rotate 8s linear infinite;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border: 4px solid rgba(11, 180, 255, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

/* Loading Text with Game Style */
.loading-text {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-dark);
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Progress Bar Inspired by Splash Screen */
.progress-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.progress-track {
  position: relative;
  width: 100%;
  height: 12px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
  border-radius: var(--radius-full);
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--radius-full);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), transparent);
  animation: glow-pulse 2s infinite;
}

.progress-percentage {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-dark);
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .loading-container {
    width: 90%;
    padding: var(--spacing-xl);
  }

  .loading-animation {
    width: 80px;
    height: 80px;
  }

  .loading-text {
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 480px) {
  .loading-container {
    width: 95%;
    padding: var(--spacing-lg);
  }

  .loading-animation {
    width: 70px;
    height: 70px;
  }

  .loading-text {
    font-size: var(--font-size-base);
  }
}
</style>
