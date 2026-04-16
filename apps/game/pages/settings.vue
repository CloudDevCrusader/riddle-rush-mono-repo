<template>
  <GameBackground>
    <div class="settings-page">
      <!-- Header -->
      <GameHeader color="gold">
        <template #left>
          <button class="game-back-btn tap-highlight no-select" @click="goBack">
            <span class="back-btn__arrow">&#8592;</span>
          </button>
        </template>
        {{ t('menu.options') }}
      </GameHeader>

      <!-- Settings Panel -->
      <GamePanel class="settings-panel">
        <!-- Sound slider -->
        <div class="slider-row">
          <GameSlider v-model="soundVolume" icon="🔊" muted-icon="🔇" @change="handleSoundChange" />
          <span class="slider-label">{{ t('settings.sound') }}</span>
        </div>

        <!-- Music slider -->
        <div class="slider-row">
          <GameSlider v-model="musicVolume" icon="🎵" muted-icon="🔇" @change="handleMusicChange" />
          <span class="slider-label">{{ t('settings.music') }}</span>
        </div>

        <div v-if="isFortuneWheelEnabled" class="fortune-wheel-setting">
          <button
            type="button"
            class="fortune-wheel-toggle tap-highlight"
            :aria-pressed="fortuneWheelAllowRedraw"
            :aria-label="t('settings.fortune_wheel_redraw')"
            @click="settings.toggleFortuneWheelAllowRedraw()"
          >
            <span class="fortune-wheel-toggle__track" :class="{ 'is-on': fortuneWheelAllowRedraw }">
              <span class="fortune-wheel-toggle__thumb" />
            </span>
            <span class="fortune-wheel-toggle__label">{{
              t('settings.fortune_wheel_redraw')
            }}</span>
          </button>
          <p class="fortune-wheel-setting__hint">{{ t('settings.fortune_wheel_redraw_hint') }}</p>
        </div>
      </GamePanel>

      <!-- OK Button -->
      <GameButton variant="primary" size="lg" class="ok-btn" @click="handleOk">{{
        t('common.ok')
      }}</GameButton>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'slide-right', mode: 'out-in' } });

const { t, router } = usePageSetup();
const settings = useSettings();
const { isFortuneWheelEnabled } = useFeatureFlags();

const fortuneWheelAllowRedraw = computed(() => settings.fortuneWheelAllowRedraw.value);

// Local refs for slider values
const soundVolume = ref(settings.soundVolume.value);
const musicVolume = ref(settings.musicVolume.value);

// Preview sound throttling
let lastSoundPreviewTime = 0;
const SOUND_PREVIEW_THROTTLE = 500; // ms

// Handle sound volume change
const handleSoundChange = (value: number) => {
  settings.updateSetting('soundVolume', value);
  settings.updateSetting('soundEnabled', value > 0);

  // Play preview sound (throttled)
  const now = Date.now();
  if (now - lastSoundPreviewTime > SOUND_PREVIEW_THROTTLE && value > 0) {
    lastSoundPreviewTime = now;
    // Play preview sound via audio composable if available
    // For now, this is a placeholder for future audio implementation
  }
};

// Handle music volume change
const handleMusicChange = (value: number) => {
  settings.updateSetting('musicVolume', value);
  settings.updateSetting('musicEnabled', value > 0);
};

// Navigate back
const goBack = () => {
  router.back();
};

// Handle OK button
const handleOk = () => {
  router.back();
};

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    goBack();
  }
};

// Load settings on mount
onMounted(() => {
  soundVolume.value = settings.soundVolume.value;
  musicVolume.value = settings.musicVolume.value;

  // Add escape key listener
  window.addEventListener('keydown', handleEscape);
});

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape);
});

useLocalizedPageSeo({
  title: () => t('settings.title'),
  description: () => t('settings.meta_description'),
});
</script>

<style scoped lang="scss">
@use 'assets/scss/design-system' as *;

.settings-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  padding: var(--spacing-md);
  gap: var(--spacing-lg);
}

.back-btn__arrow {
  font-size: clamp(20px, 4vw, 28px);
  font-weight: var(--font-weight-bold);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  width: 100%;
}

.slider-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

.slider-label {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-dark);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  text-transform: lowercase;
}

.fortune-wheel-setting {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
  margin-top: var(--spacing-sm);
}

.fortune-wheel-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.fortune-wheel-toggle__track {
  position: relative;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 14px;
  background: linear-gradient(180deg, #c4b59a 0%, #a89478 100%);
  border: 2px solid #8b6914;
  transition: background 0.2s ease;
}

.fortune-wheel-toggle__track.is-on {
  background: linear-gradient(180deg, #9dff4d 0%, #5fc423 100%);
}

.fortune-wheel-toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fffef8;
  border: 2px solid rgba(139, 69, 19, 0.35);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.fortune-wheel-toggle__track.is-on .fortune-wheel-toggle__thumb {
  transform: translateX(24px);
}

.fortune-wheel-toggle__label {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-dark);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

.fortune-wheel-setting__hint {
  margin: 0;
  padding-left: calc(52px + var(--spacing-md));
  font-size: var(--font-size-sm);
  line-height: 1.4;
  color: #5c4a3a;
}

.ok-btn {
  min-width: clamp(150px, 30vw, 200px);
  margin-top: var(--spacing-md);
}

// Small phone adjustments
@include small-mobile {
  .settings-page {
    padding: var(--spacing-sm);
    gap: var(--spacing-md);
  }

  .settings-panel {
    gap: var(--spacing-lg);
    padding: var(--spacing-md);
  }

  .slider-label {
    font-size: var(--font-size-base);
  }
}

@include tiny-mobile {
  .settings-panel {
    gap: var(--spacing-md);
    padding: var(--spacing-sm);
  }
}
</style>
