<template>
  <transition name="fade-out">
    <div v-if="isLoading" class="global-loading-overlay">
      <!-- Background Image -->
      <img
        :src="getAssetPath('assets/splash/background.png')"
        alt="Background"
        class="splash-bg"
        width="1920"
        height="1080"
      />

      <div class="loading-container">
        <!-- Logo with Fade In Animation -->
        <div class="logo-container animate-fade-in">
          <img
            :src="getAssetPath('assets/splash/logo.png')"
            alt="Logo"
            class="logo-image"
            loading="eager"
            fetchpriority="high"
            width="512"
            height="512"
          />
        </div>

        <!-- Loading Bar Container with Slide Up Animation -->
        <div v-if="showProgress" class="loading-bar-container animate-slide-up">
          <img
            :src="getAssetPath('assets/splash/loading.png')"
            alt="Loading"
            class="loading-text"
            loading="eager"
            width="256"
            height="64"
          />
          <div class="loading-bar-wrapper">
            <img
              :src="getAssetPath('assets/splash/loading-down.png')"
              alt="Loading bar background"
              class="loading-bar-bg-img"
              loading="eager"
              width="512"
              height="64"
            />
            <div class="loading-bar-track">
              <img
                :src="getAssetPath('assets/splash/loading-top.png')"
                alt="Loading bar fill"
                :style="{ clipPath: `inset(0 ${100 - progress}% 0 0)` }"
                class="loading-bar-fill-img"
                loading="eager"
                width="512"
                height="64"
              />
            </div>
          </div>
          <div class="loading-percentage">{{ Math.round(progress) }}%</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
const { getAssetPath } = useAssets();

const { isLoading, progress, showProgress } = useLoading();
</script>

<style lang="scss" scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #1a1a2e;
}

.splash-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.loading-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  padding: var(--spacing-2xl);
}

.logo-container {
  width: 100%;
  max-width: 450px;
  margin-bottom: var(--spacing-3xl);
}

.logo-image {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
}

.loading-bar-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.loading-text {
  height: clamp(24px, 4vw, 32px);
  width: auto;
}

.loading-bar-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.loading-bar-bg-img {
  width: 100%;
  display: block;
}

.loading-bar-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.loading-bar-fill-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: clip-path 0.2s linear;
}

.loading-percentage {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-base), 2.5vw, var(--font-size-xl));
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.05em;
  margin-top: var(--spacing-xs);
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out 0.2s both;
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

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-out-enter-active,
.fade-out-leave-active {
  transition: opacity 0.5s ease;
}

.fade-out-enter-from,
.fade-out-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .logo-container {
    max-width: 80%;
  }

  .logo-image {
    width: min(250px, 60vw);
  }

  .loading-bar-wrapper {
    max-width: 90%;
  }
}
</style>
