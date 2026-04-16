<template>
  <transition name="fade-out">
    <div v-if="visible" class="splash-screen" data-testid="splash-screen">
      <!-- Background Image -->
      <img
        :src="getAssetPath('assets/splash/background.png')"
        alt="Background"
        class="splash-bg"
        width="1920"
        height="1080"
      />

      <!-- Logo -->
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

      <!-- Loading Bar -->
      <div class="loading-container animate-slide-up">
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
              class="loading-bar-fill-img"
              loading="eager"
              width="512"
              height="64"
              :style="{ clipPath: `inset(0 ${100 - progress}% 0 0)` }"
            />
          </div>
        </div>
        <div class="loading-percentage">{{ Math.round(progress) }}%</div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const { getAssetPath } = useAssets();

const visible = ref(true);
const progress = ref(0);

const emit = defineEmits<{
  complete: [];
}>();

const simulateLoading = () => {
  const duration = 2500; // 2.5 seconds
  const intervalTime = 20; // Update every 20ms
  const steps = duration / intervalTime;
  const increment = 100 / steps;

  const interval = setInterval(() => {
    progress.value = Math.min(progress.value + increment, 100);

    if (progress.value >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        visible.value = false;
        setTimeout(() => {
          emit('complete');
        }, 500); // Wait for fade out animation
      }, 300); // Show 100% briefly
    }
  }, intervalTime);
};

onMounted(() => {
  simulateLoading();
});
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #1a1a2e;
}

/* Background Image */
.splash-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Logo Container */
.logo-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: clamp(4rem, 10vh, 8rem);
}

.logo-image {
  width: clamp(200px, 40vw, 400px);
  height: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
}

/* Loading Container */
.loading-container {
  position: relative;
  z-index: 2;
  width: clamp(300px, 50vw, 500px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.loading-text {
  width: clamp(100px, 20vw, 150px);
  height: auto;
  margin-bottom: var(--spacing-sm);
}

.loading-bar-wrapper {
  width: 100%;
  position: relative;
  height: clamp(20px, 3vw, 32px);
}

.loading-bar-bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.loading-bar-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.loading-bar-fill-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  transition: clip-path 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-percentage {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-base), 2.5vw, var(--font-size-xl));
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.05em;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out 0.3s backwards;
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
  .logo-image {
    width: min(250px, 60vw);
  }

  .loading-container {
    width: 85%;
  }

  .loading-bar-wrapper {
    height: 20px;
  }
}
</style>
