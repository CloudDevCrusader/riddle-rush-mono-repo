<script setup lang="ts">
const { goHome } = useNavigation()

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
</script>

<template>
  <div class="splash-page" @click="handleSkip">
    <img src="~/assets/figma/background-1.png" class="splash-bg" alt="background" />
    <div class="splash-container">
      <img src="~/assets/figma/logo-2.png" class="splash-logo" alt="Riddle Rush Logo" />
      <div class="splash-loading">
        <img src="~/assets/figma/loading-1.png" class="loading-text" alt="Loading..." />
        <div class="loading-bar">
          <img
            src="~/assets/figma/loading-down-1.png"
            class="loading-bar-track"
            alt="Loading bar track"
          />
          <div class="loading-bar-fill-container" :style="{ width: `${progress}%` }">
            <img
              src="~/assets/figma/loading-top-1.png"
              class="loading-bar-fill"
              alt="Loading bar fill"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.splash-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.splash-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.splash-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
}

.splash-logo {
  width: 80%;
  max-width: 400px;
  margin-bottom: 20vh;
}

.splash-loading {
  position: absolute;
  bottom: 10vh;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: 500px;
}

.loading-text {
  width: 150px;
  margin-bottom: 1rem;
}

.loading-bar {
  position: relative;
  width: 100%;
  height: 20px;
}

.loading-bar-track {
  width: 100%;
  height: 100%;
}

.loading-bar-fill-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  overflow: hidden;
  transition: width 0.1s linear;
}

.loading-bar-fill {
  width: 100%;
  height: 100%;
  // Since the container width is animated, the image width should be 100% of the container
  // but we need to match the parent's (loading-bar) width.
  // This is a bit tricky. Let's set a fixed width on the parent and use that.
}

// Let's refine the loading bar.
.loading-bar {
  width: 100%;
  max-width: 500px; /* or whatever the image aspect ratio dictates */
  position: relative;
}

.loading-bar-track,
.loading-bar-fill {
  display: block;
  width: 100%;
}

.loading-bar-fill-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 0%; /* Start at 0 */
  height: 100%;
  overflow: hidden;
  transition: width 0.1s linear;
}

.loading-bar-fill {
  /* This is tricky because the fill image needs to be as wide as the track image */
  /* Let's try to set the width of the fill image to the width of the track image */
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100vw; /* This is a hack, but it might work */
  max-width: 500px;
}
</style>
