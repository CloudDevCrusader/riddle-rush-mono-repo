<template>
  <transition name="fade">
    <div v-if="isLoading" class="global-loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-circle" />
        <div class="spinner-text">Loading...</div>
      </div>

      <!-- Optional progress bar for longer operations -->
      <div v-if="showProgress" class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }" />
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-circle {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-text {
  color: white;
  font-size: 18px;
  font-weight: 500;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 24px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #4ecdc4);
  border-radius: 4px;
  transition: width 0.3s ease;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
