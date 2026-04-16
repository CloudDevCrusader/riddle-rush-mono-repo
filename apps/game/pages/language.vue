<template>
  <GameBackground>
    <div class="language-page" data-testid="language-page">
      <!-- Back button -->
      <button
        class="back-btn"
        :aria-label="t('common.back')"
        data-testid="language-back-button"
        @click="goBack"
      >
        <span class="back-icon">&#x2190;</span>
      </button>

      <!-- Header -->
      <GameHeader color="gold">{{ t('language.title', 'LANGUAGE') }}</GameHeader>

      <!-- Language selection panel -->
      <GamePanel class="language-panel" data-testid="language-card">
        <div class="language-options">
          <!-- English option -->
          <button
            class="language-row"
            :class="{ selected: selectedLocale === 'en' }"
            data-testid="language-option-english"
            @click="selectLanguage('en')"
          >
            <div class="flag-container" data-testid="language-flag-en">
              <span class="flag-emoji">&#x1F1EC;&#x1F1E7;</span>
            </div>
            <span class="language-name">{{ t('language.english') }}</span>
            <div
              class="checkbox"
              :class="{ checked: selectedLocale === 'en' }"
              data-testid="language-checkmark-en"
            >
              <Transition name="checkmark">
                <span v-if="selectedLocale === 'en'" class="checkmark">&#x2713;</span>
              </Transition>
            </div>
          </button>

          <!-- German option -->
          <button
            class="language-row"
            :class="{ selected: selectedLocale === 'de' }"
            data-testid="language-option-german"
            @click="selectLanguage('de')"
          >
            <div class="flag-container" data-testid="language-flag-de">
              <span class="flag-emoji">&#x1F1E9;&#x1F1EA;</span>
            </div>
            <span class="language-name">{{ t('language.german') }}</span>
            <div
              class="checkbox"
              :class="{ checked: selectedLocale === 'de' }"
              data-testid="language-checkmark-de"
            >
              <Transition name="checkmark">
                <span v-if="selectedLocale === 'de'" class="checkmark">&#x2713;</span>
              </Transition>
            </div>
          </button>
        </div>
      </GamePanel>

      <!-- OK Button -->
      <GameButton
        variant="primary"
        size="lg"
        data-testid="language-ok-button"
        @click="confirmSelection"
      >
        {{ t('common.ok') }}
      </GameButton>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
const { goBack, router } = usePageSetup();
const { locale, setLocale, t } = useI18n();
const { settingsStore } = useGameState();
const route = useRoute();

// Stage selection locally (does not apply until OK pressed)
const selectedLocale = ref(locale.value);

// Update the reactive selectedLocale when the actual locale changes
watch(
  locale,
  (newLocale) => {
    if (newLocale && newLocale !== selectedLocale.value) {
      selectedLocale.value = newLocale;
    }
  },
  { immediate: true }
);

type LocaleCode = 'de' | 'en';

const selectLanguage = (lang: LocaleCode) => {
  selectedLocale.value = lang;
};

const confirmSelection = async () => {
  const lang = selectedLocale.value as LocaleCode;
  try {
    settingsStore.setLanguage(lang);
    await setLocale(lang);

    if (typeof window === 'undefined') {
      return;
    }

    const query = { ...route.query, lang } as Record<string, string | string[] | undefined>;
    await router.push({ path: '/', query });
  } catch (error) {
    console.error('Failed to change language:', error);
    await router.push({ path: '/', query: { lang } });
  }
};

useLocalizedPageSeo({
  title: () => t('language.title'),
  description: () => t('language.description'),
});
</script>

<style scoped lang="scss">
.language-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--spacing-xl);
  padding-top: var(--spacing-3xl);
  gap: var(--spacing-2xl);
  position: relative;
}

/* Back Button */
.back-btn {
  position: absolute;
  top: var(--spacing-xl);
  left: var(--spacing-xl);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(180deg, #ff9d4d 0%, #e87a1f 100%);
  border: 3px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    opacity var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  box-shadow:
    0 4px 0 #b85c0a,
    0 6px 12px rgba(0, 0, 0, 0.25);

  &:hover {
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(2px);
    box-shadow:
      0 2px 0 #b85c0a,
      0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.8);
    outline-offset: 4px;
  }
}

.back-icon {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
  line-height: 1;
}

/* Language Panel */
.language-panel {
  padding: var(--spacing-xl);
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Language Row */
.language-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  min-height: 70px;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(180deg, #f5e6c8 0%, #d9c7a0 100%);
  border: 3px solid #c9a45c;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    opacity var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  box-shadow:
    0 4px 0 #9a7a3a,
    0 6px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    filter: brightness(1.02);
    border-color: #ddb96a;
  }

  &:active {
    transform: translateY(2px) scale(0.99);
    box-shadow:
      0 2px 0 #9a7a3a,
      0 4px 8px rgba(0, 0, 0, 0.12);
  }

  &.selected {
    border-color: #e0b84c;
    box-shadow:
      0 4px 0 #9a7a3a,
      0 6px 12px rgba(0, 0, 0, 0.2),
      inset 0 0 0 2px rgba(255, 255, 255, 0.2);
  }

  &:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.8);
    outline-offset: 4px;
  }
}

/* Flag Container */
.flag-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: white;
  border: 2px solid #c9a45c;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  overflow: hidden;
}

.flag-emoji {
  font-size: 2rem;
  line-height: 1;
}

/* Language Name */
.language-name {
  flex: 1;
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-lg), 3vw, var(--font-size-2xl));
  font-weight: var(--font-weight-bold);
  color: #3a2817;
  text-align: left;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}

/* Checkbox */
.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: white;
  border: 2px solid #7a6a4a;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition:
    transform var(--transition-fast),
    opacity var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);

  &.checked {
    background: #4caf50;
    border-color: #388e3c;
  }
}

.checkmark {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Checkmark Animation */
.checkmark-enter-active {
  animation: checkmark-in 0.25s ease-out;
}

.checkmark-leave-active {
  animation: checkmark-in 0.15s ease-in reverse;
}

@keyframes checkmark-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .language-page {
    padding: var(--spacing-md);
    padding-top: var(--spacing-2xl);
    gap: var(--spacing-xl);
  }

  .back-btn {
    width: 44px;
    height: 44px;
    top: var(--spacing-md);
    left: var(--spacing-md);
  }

  .back-icon {
    font-size: 1.25rem;
  }

  .language-panel {
    padding: var(--spacing-md);
  }

  .language-row {
    min-height: 60px;
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .flag-container {
    width: 48px;
    height: 48px;
  }

  .flag-emoji {
    font-size: 1.75rem;
  }

  .checkbox {
    width: 32px;
    height: 32px;
  }

  .checkmark {
    font-size: 1.25rem;
  }
}

@media (max-width: 360px) {
  .language-page {
    padding: var(--spacing-sm);
    padding-top: var(--spacing-xl);
    gap: var(--spacing-lg);
  }

  .back-btn {
    width: 40px;
    height: 40px;
    top: var(--spacing-sm);
    left: var(--spacing-sm);
  }

  .language-row {
    min-height: 52px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .flag-container {
    width: 40px;
    height: 40px;
  }

  .flag-emoji {
    font-size: 1.5rem;
  }

  .checkbox {
    width: 28px;
    height: 28px;
  }

  .checkmark {
    font-size: 1rem;
  }
}
</style>
