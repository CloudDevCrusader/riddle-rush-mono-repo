<script setup lang="ts">
const { goHome } = useNavigation()
const { t } = useI18n()

const progress = ref(0)
const canSkip = ref(false)
const isNavigating = ref(false)

let progressInterval: ReturnType<typeof setInterval> | null = null
let navTimeout: ReturnType<typeof setTimeout> | null = null
let skipTimeout: ReturnType<typeof setTimeout> | null = null

const handleSkip = () => {
  if (!canSkip.value || isNavigating.value) return
  isNavigating.value = true
  void goHome()
}

onMounted(() => {
  const intervalMs = 50
  const step = 100 / (2000 / intervalMs)

  progressInterval = setInterval(() => {
    progress.value = Math.min(100, progress.value + step)

    if (progress.value >= 100) {
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }

      if (!isNavigating.value) {
        isNavigating.value = true
        navTimeout = setTimeout(() => {
          void goHome()
        }, 300)
      }
    }
  }, intervalMs)

  skipTimeout = setTimeout(() => {
    canSkip.value = true
  }, 1000)
})

onBeforeUnmount(() => {
  if (progressInterval) clearInterval(progressInterval)
  if (navTimeout) clearTimeout(navTimeout)
  if (skipTimeout) clearTimeout(skipTimeout)
})

useHead({
  title: t('app.title'),
  meta: [
    {
      name: 'description',
      content: t('app.description'),
    },
  ],
})
</script>

<template>
  <div class="splash-page" @click="handleSkip">
    <GameBackground />

    <div class="splash-container">
      <GameHeader color="gold" class="splash-title">{{ t('app.title') }}</GameHeader>

      <div class="splash-loading">
        <div class="loading-bar">
          <div class="loading-bar__track">
            <div class="loading-bar__fill" :style="{ width: `${progress}%` }" />
          </div>
        </div>
        <p class="loading-text">{{ t('common.loading') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.splash-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.splash-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3xl);
  width: 100%;
  padding: var(--spacing-2xl);
}

.splash-title {
  :deep(.game-header__title) {
    font-size: var(--font-size-display);
    text-transform: uppercase;
  }
}

.splash-loading {
  position: absolute;
  bottom: var(--spacing-3xl);
  left: var(--spacing-xl);
  right: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.loading-bar {
  width: 100%;
  max-width: 500px;

  &__track {
    width: 100%;
    height: 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-full);
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.4);
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-btn-orange-light), var(--color-btn-orange-dark));
    border-radius: var(--radius-full);
    transition: width 0.1s linear;
  }
}

.loading-text {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-white);
  text-shadow: var(--text-shadow-embossed-white);
  letter-spacing: 2px;
}

@media (max-width: 768px) {
  .splash-loading {
    bottom: var(--spacing-2xl);
    left: var(--spacing-lg);
    right: var(--spacing-lg);
  }
}
</style>
