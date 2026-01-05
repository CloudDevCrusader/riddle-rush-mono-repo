<template>
  <Transition name="fade">
    <div v-if="modelValue" class="settings-overlay" @click="closeModal">
      <div class="settings-card" @click.stop>
        <!-- Background Image -->
        <img
          :src="`${baseUrl}assets/settings/BACKGROUND.png`"
          alt="Background"
          class="settings-bg"
        />

        <!-- Back Button -->
        <button class="back-btn tap-highlight no-select" @click="closeModal">
          <img :src="`${baseUrl}assets/settings/back.png`" alt="Back" />
        </button>

        <!-- Title -->
        <div class="title-container">
          <img :src="`${baseUrl}assets/settings/options.png`" alt="OPTIONS" class="title-image" />
        </div>

        <!-- Settings Panel -->
        <div class="settings-panel">
          <!-- Sound Control -->
          <div class="control-item">
            <div class="control-icon-wrapper">
              <img :src="`${baseUrl}assets/settings/Sound.png`" alt="Sound" class="control-icon" />
            </div>
            <div class="control-content">
              <div class="control-label">sound</div>
              <div class="slider-container">
                <input
                  v-model.number="soundVolume"
                  type="range"
                  min="0"
                  max="100"
                  class="volume-slider"
                  @input="updateSoundVolume"
                />
                <div class="slider-track">
                  <div class="slider-fill" :style="{ width: `${soundVolume}%` }" />
                  <div class="slider-thumb" :style="{ left: `${soundVolume}%` }" />
                </div>
              </div>
            </div>
          </div>

          <!-- Music Control -->
          <div class="control-item">
            <div class="control-icon-wrapper">
              <img :src="`${baseUrl}assets/settings/Music.png`" alt="Music" class="control-icon" />
            </div>
            <div class="control-content">
              <div class="control-label">Music</div>
              <div class="slider-container">
                <input
                  v-model.number="musicVolume"
                  type="range"
                  min="0"
                  max="100"
                  class="volume-slider"
                  @input="updateMusicVolume"
                />
                <div class="slider-track">
                  <div class="slider-fill" :style="{ width: `${musicVolume}%` }" />
                  <div class="slider-thumb" :style="{ left: `${musicVolume}%` }" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- OK Button -->
        <button class="ok-btn tap-highlight no-select" @click="closeModal">
          <img :src="`${baseUrl}assets/settings/OK.png`" alt="OK" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl
const settingsStore = useSettingsStore()
const router = useRouter()

const soundVolume = ref(settingsStore.soundVolume)
const musicVolume = ref(settingsStore.musicVolume)

const closeModal = () => {
  emit('update:modelValue', false)
  // If on settings page, navigate back
  if (window.location.pathname === '/settings') {
    setTimeout(() => {
      router.push('/')
    }, 300)
  }
}

const updateSoundVolume = () => {
  settingsStore.updateSetting('soundVolume', soundVolume.value)
  settingsStore.updateSetting('soundEnabled', soundVolume.value > 0)
}

const updateMusicVolume = () => {
  settingsStore.updateSetting('musicVolume', musicVolume.value)
  settingsStore.updateSetting('musicEnabled', musicVolume.value > 0)
}

// Load settings on mount
onMounted(() => {
  settingsStore.loadSettings()
  soundVolume.value = settingsStore.soundVolume
  musicVolume.value = settingsStore.musicVolume
})
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: max(var(--spacing-lg), env(safe-area-inset-top, 0px))
    max(var(--spacing-lg), env(safe-area-inset-right, 0px))
    max(var(--spacing-lg), env(safe-area-inset-bottom, 0px))
    max(var(--spacing-lg), env(safe-area-inset-left, 0px));
}

.settings-card {
  position: relative;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.3s ease-out;
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

.settings-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

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

.back-btn:active {
  transform: scale(0.95);
}

.title-container {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-xl) var(--spacing-xl);
}

.title-image {
  width: clamp(200px, 30vw, 300px);
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.settings-panel {
  position: relative;
  z-index: 2;
  background: linear-gradient(180deg, rgba(68, 200, 255, 0.95) 0%, rgba(10, 107, 194, 0.95) 100%);
  border: 6px solid #ff8800;
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  margin: 0 var(--spacing-xl) var(--spacing-xl);
  box-shadow:
    0 12px 0 rgba(0, 0, 0, 0.2),
    inset 0 2px 10px rgba(255, 255, 255, 0.3),
    var(--shadow-xl);
}

.control-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.control-item:last-child {
  margin-bottom: 0;
}

.control-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(68, 200, 255, 0.9) 0%, rgba(10, 107, 194, 0.9) 100%);
  border: 4px solid #ffd700;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.control-icon {
  width: 50px;
  height: 50px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.control-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.control-label {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-transform: lowercase;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 40px;
}

.volume-slider {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 3;
}

.slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 20px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, #7ed321 0%, #5fc423 50%, #8b4513 100%);
  border-radius: 10px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #7ed321 0%, #5fc423 100%);
  border-radius: 10px;
  transition: width 0.1s ease;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  width: 24px;
  height: 24px;
  background: #ff5b5b;
  border: 3px solid #ff8800;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: left 0.1s ease;
  pointer-events: none;
}

.ok-btn {
  position: relative;
  z-index: 2;
  display: block;
  margin: 0 auto var(--spacing-xl);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.ok-btn img {
  width: clamp(150px, 25vw, 200px);
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.ok-btn:active {
  transform: scale(0.95);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive - Optimized for Pixel 7 Pro */
@media (max-width: 640px) {
  .settings-overlay {
    padding: max(var(--spacing-md), env(safe-area-inset-top, 0px))
      max(var(--spacing-md), env(safe-area-inset-right, 0px))
      max(var(--spacing-md), env(safe-area-inset-bottom, 0px))
      max(var(--spacing-md), env(safe-area-inset-left, 0px));
  }

  .settings-card {
    max-width: calc(100vw - max(var(--spacing-md), env(safe-area-inset-right, 0px)) * 2);
    max-height: calc(
      100vh - max(var(--spacing-md), env(safe-area-inset-top, 0px)) -
        max(var(--spacing-md), env(safe-area-inset-bottom, 0px))
    );
    width: 100%;
    box-sizing: border-box;
  }

  .back-btn {
    top: max(var(--spacing-md), env(safe-area-inset-top, 0px) + var(--spacing-xs));
    left: max(var(--spacing-md), env(safe-area-inset-left, 0px) + var(--spacing-xs));
  }

  .title-image {
    width: clamp(160px, 45vw, 240px);
  }

  .control-icon-wrapper {
    width: clamp(56px, 12vw, 70px);
    height: clamp(56px, 12vw, 70px);
    min-width: 56px;
    min-height: 56px;
  }

  .control-icon {
    width: clamp(36px, 8vw, 48px);
    height: clamp(36px, 8vw, 48px);
  }

  .settings-panel {
    padding: var(--spacing-lg);
    margin: 0 var(--spacing-md) var(--spacing-md);
  }

  .control-label {
    font-size: clamp(1rem, 2.2vw, 1.5rem);
  }

  .back-btn img {
    width: clamp(36px, 8vw, 48px);
    min-width: 36px;
  }
}

/* Very small screens (< 360px) */
@media (max-width: 360px) {
  .settings-overlay {
    padding: max(var(--spacing-sm), env(safe-area-inset-top, 0px))
      max(var(--spacing-sm), env(safe-area-inset-right, 0px))
      max(var(--spacing-sm), env(safe-area-inset-bottom, 0px))
      max(var(--spacing-sm), env(safe-area-inset-left, 0px));
  }

  .settings-card {
    max-width: calc(100vw - max(var(--spacing-sm), env(safe-area-inset-right, 0px)) * 2);
  }

  .back-btn {
    top: max(var(--spacing-sm), env(safe-area-inset-top, 0px));
    left: max(var(--spacing-sm), env(safe-area-inset-left, 0px));
  }

  .title-image {
    width: clamp(140px, 42vw, 180px);
  }

  .control-icon-wrapper {
    width: clamp(48px, 11vw, 60px);
    height: clamp(48px, 11vw, 60px);
  }

  .control-icon {
    width: clamp(32px, 7vw, 40px);
    height: clamp(32px, 7vw, 40px);
  }

  .settings-panel {
    padding: var(--spacing-md);
    margin: 0 var(--spacing-sm) var(--spacing-sm);
  }

  .control-item {
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  .control-label {
    font-size: clamp(0.95rem, 2vw, 1.3rem);
  }

  .back-btn img {
    width: clamp(32px, 7vw, 40px);
  }
}

/* Pixel 7 Pro specific (412px width, tall screen) */
@media (max-width: 450px) and (min-height: 800px) {
  .settings-card {
    max-width: calc(100vw - max(var(--spacing-lg), env(safe-area-inset-right, 0px)) * 2);
    max-height: calc(
      100vh - max(var(--spacing-lg), env(safe-area-inset-top, 0px)) -
        max(var(--spacing-lg), env(safe-area-inset-bottom, 0px))
    );
  }

  .title-image {
    width: clamp(180px, 50vw, 240px);
  }

  .control-icon-wrapper {
    width: clamp(56px, 12vw, 70px);
    height: clamp(56px, 12vw, 70px);
  }

  .control-icon {
    width: clamp(36px, 8vw, 48px);
    height: clamp(36px, 8vw, 48px);
  }

  .settings-panel {
    padding: var(--spacing-lg);
    margin: 0 var(--spacing-md) var(--spacing-md);
  }
}
</style>
