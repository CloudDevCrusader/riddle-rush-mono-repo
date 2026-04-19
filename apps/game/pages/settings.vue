<template>
  <GameBackground>
    <div class="settings-page-wrap">
      <GameSessionTopBar back-test-id="settings-toolbar-back" :show-pause="false" @back="goBack">
        <span class="settings-page__toolbar-title">{{ t('menu.options') }}</span>
      </GameSessionTopBar>

      <div class="settings-page">
        <!-- Settings Panel -->
        <GamePanel class="settings-panel">
          <!-- Sound slider -->
          <div class="slider-row">
            <span class="slider-label">{{ t('settings.sound') }}</span>
            <GameSlider
              v-model="soundVolume"
              icon="🔊"
              muted-icon="🔇"
              @change="handleSoundChange"
            />
          </div>

          <GameButton
            variant="secondary"
            size="md"
            full-width
            class="settings-language-btn"
            data-testid="settings-language-button"
            @click="goToLanguage"
          >
            🌐 {{ t('menu.language') }}
          </GameButton>

          <div v-if="isFortuneWheelEnabled" class="fortune-wheel-setting">
            <button
              type="button"
              class="fortune-wheel-toggle tap-highlight"
              :aria-pressed="fortuneWheelAllowRedraw"
              :aria-label="t('settings.fortune_wheel_redraw')"
              @click="settings.toggleFortuneWheelAllowRedraw()"
            >
              <span
                class="fortune-wheel-toggle__track"
                :class="{ 'is-on': fortuneWheelAllowRedraw }"
              >
                <span class="fortune-wheel-toggle__thumb" />
              </span>
              <span class="fortune-wheel-toggle__label">{{
                t('settings.fortune_wheel_redraw')
              }}</span>
            </button>
            <p class="fortune-wheel-setting__hint">{{ t('settings.fortune_wheel_redraw_hint') }}</p>
          </div>

          <div class="fortune-wheel-setting">
            <button
              type="button"
              class="fortune-wheel-toggle tap-highlight"
              :aria-pressed="dedicatedPlayerRoundsOn"
              data-testid="settings-dedicated-player-rounds"
              :aria-label="t('settings.dedicated_player_rounds')"
              @click="settings.toggleDedicatedPlayerRounds()"
            >
              <span
                class="fortune-wheel-toggle__track"
                :class="{ 'is-on': dedicatedPlayerRoundsOn }"
              >
                <span class="fortune-wheel-toggle__thumb" />
              </span>
              <span class="fortune-wheel-toggle__label">{{
                t('settings.dedicated_player_rounds')
              }}</span>
            </button>
            <p class="fortune-wheel-setting__hint">
              {{ t('settings.dedicated_player_rounds_hint') }}
            </p>
          </div>
        </GamePanel>

        <!-- OK Button -->
        <GameButton variant="primary" size="lg" class="ok-btn" @click="handleOk">{{
          t('common.ok')
        }}</GameButton>
      </div>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'slide-right', mode: 'out-in' } });

const { t, router } = usePageSetup();
const { goToLanguage } = useNavigation();
const route = useRoute();
const loadingStore = useLoadingStore();
const settings = useSettings();
const { isFortuneWheelEnabled } = useFeatureFlags();

// #region agent log
const dbgSettingsSnapshot = (reason: string, hypothesisId: string) => {
  if (typeof document === 'undefined') return;
  const main = document.querySelector('.main-content');
  const app = document.querySelector('#app');
  const lay = document.querySelector('.layout-main-col');
  const firstLay = lay?.firstElementChild;
  fetch('http://127.0.0.1:7575/ingest/422f9074-ce7d-4e2e-922f-3c062bff8a71', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '4f7476' },
    body: JSON.stringify({
      sessionId: '4f7476',
      location: 'settings.vue:snapshot',
      message: reason,
      hypothesisId,
      data: {
        route: route.fullPath,
        visibility: document.visibilityState,
        isLoading: loadingStore.isLoading,
        loadingCount: loadingStore.loadingCount,
        mainOpacity: main ? getComputedStyle(main).opacity : null,
        appOpacity: app ? getComputedStyle(app).opacity : null,
        firstLayOpacity: firstLay ? getComputedStyle(firstLay).opacity : null,
        firstLayClass: firstLay?.className ?? null,
        splashInDom: Boolean(document.querySelector('[data-testid="splash-screen"]')),
        globalLoadingInDom: Boolean(document.querySelector('.global-loading-overlay')),
        settingsPageInDom: Boolean(document.querySelector('.settings-page')),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
// #endregion

let dbgVisibilityHandler: (() => void) | null = null;
let dbgIntervalId: number | null = null;

const fortuneWheelAllowRedraw = computed(() => settings.fortuneWheelAllowRedraw.value);
/** UI on = each player submits in turn (`skipRoundsEnabled` false). */
const dedicatedPlayerRoundsOn = computed(() => !settings.skipRoundsEnabled.value);

// Local refs for slider values
const soundVolume = ref(settings.soundVolume.value);

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

// Navigate back
const goBack = () => {
  router.back();
};

// Handle OK button
const handleOk = () => {
  router.back();
};

// Load settings on mount
onMounted(() => {
  soundVolume.value = settings.soundVolume.value;

  // #region agent log
  dbgSettingsSnapshot('settings mounted', 'H3');
  dbgVisibilityHandler = () => dbgSettingsSnapshot(`visibility ${document.visibilityState}`, 'H4');
  document.addEventListener('visibilitychange', dbgVisibilityHandler);
  dbgIntervalId = window.setInterval(() => dbgSettingsSnapshot('interval tick', 'H3'), 8000);
  // #endregion
});

// Cleanup on unmount
onUnmounted(() => {
  // #region agent log
  if (dbgVisibilityHandler) {
    document.removeEventListener('visibilitychange', dbgVisibilityHandler);
  }
  if (dbgIntervalId) {
    clearInterval(dbgIntervalId);
  }
  // #endregion
});

useLocalizedPageSeo({
  title: () => t('settings.title'),
  description: () => t('settings.meta_description'),
});
</script>

<style scoped lang="scss">
@use 'assets/scss/design-system' as *;

.settings-page-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  box-sizing: border-box;
}

.settings-page__toolbar-title {
  font-family: var(--font-display);
  font-size: clamp(1rem, 3vw, 1.45rem);
  font-weight: var(--font-weight-black);
  color: #ffd700;
  -webkit-text-stroke: clamp(1px, 0.25vw, 2px) #8b4513;
  paint-order: stroke fill;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 0 10px rgba(255, 215, 0, 0.25);
  letter-spacing: 0.04em;
  max-width: min(100%, 12rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  flex: 1 1 auto;
  padding: var(--spacing-md);
  gap: var(--spacing-lg);
  box-sizing: border-box;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  width: 100%;
}

.settings-language-btn {
  margin-top: var(--spacing-xs);
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
