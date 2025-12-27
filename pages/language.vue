<template>
  <div class="language-page">
    <!-- Background Pattern -->
    <div class="bg-pattern" />

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <h1 class="title animate-fade-in">
        {{ $t('language.title', 'LANGUAGE') }}
      </h1>

      <!-- Language Card -->
      <div class="language-card animate-scale-in">
        <div class="language-options">
          <!-- English -->
          <button
            class="language-option tap-highlight no-select"
            :class="{ selected: currentLocale === 'en' }"
            @click="selectLanguage('en')"
          >
            <div class="flag-container">
              <span class="flag">🇬🇧</span>
            </div>
            <span class="language-name">ENGLISH</span>
            <div class="check-container">
              <span
                v-if="currentLocale === 'en'"
                class="checkmark"
              >✓</span>
            </div>
          </button>

          <!-- German -->
          <button
            class="language-option tap-highlight no-select"
            :class="{ selected: currentLocale === 'de' }"
            @click="selectLanguage('de')"
          >
            <div class="flag-container">
              <span class="flag">🇩🇪</span>
            </div>
            <span class="language-name">GERMAN</span>
            <div class="check-container">
              <span
                v-if="currentLocale === 'de'"
                class="checkmark"
              >✓</span>
            </div>
          </button>
        </div>
      </div>

      <!-- OK Button -->
      <button
        class="btn btn-large btn-ok tap-highlight no-select animate-slide-up"
        @click="confirmSelection"
      >
        <span>{{ $t('common.ok', 'OK') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { locale, setLocale } = useI18n()

const currentLocale = ref(locale.value)

type LocaleCode = 'de' | 'en'

const selectLanguage = (lang: LocaleCode) => {
  currentLocale.value = lang
}

const confirmSelection = async () => {
  await setLocale(currentLocale.value as LocaleCode)
  router.back()
}

useHead({
  title: 'Riddle Rush - Language Selection',
  meta: [
    {
      name: 'description',
      content: 'Choose your preferred language',
    },
  ],
})
</script>

<style scoped>
.language-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  background: var(--bg-gradient-main);
  overflow-x: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* Container */
.container {
  position: relative;
  max-width: 800px;
  width: 100%;
  padding: var(--spacing-xl) var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3xl);
}

/* Title */
.title {
  font-family: var(--font-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2);
  margin: 0;
  text-align: center;
  letter-spacing: 0.05em;
}

/* Language Card */
.language-card {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(180deg, #E0F7FF 0%, #B3E5FC 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl) var(--spacing-2xl);
  box-shadow:
    var(--shadow-xl),
    inset 0 2px 0 rgba(255, 255, 255, 0.5);
  border: 4px solid rgba(255, 255, 255, 0.5);
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.language-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  background: linear-gradient(180deg, #FFF8DC 0%, #F5E6C8 100%);
  padding: var(--spacing-xl) var(--spacing-2xl);
  border-radius: var(--radius-xl);
  border: 4px solid rgba(139, 90, 43, 0.3);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 80px;
}

.language-option:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.language-option:active {
  transform: translateY(0);
}

.language-option.selected {
  background: linear-gradient(180deg, #FFE4B5 0%, #FFD68A 100%);
  border-color: rgba(139, 90, 43, 0.5);
  box-shadow: var(--shadow-lg);
}

.flag-container {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.flag {
  font-size: 40px;
}

.language-name {
  flex: 1;
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: #8B5A2B;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.check-container {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 90, 43, 0.2);
  border-radius: var(--radius-md);
}

.checkmark {
  font-size: 32px;
  color: var(--color-accent-green);
  font-weight: var(--font-weight-black);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: scaleIn var(--transition-base) ease-out;
}

/* OK Button */
.btn-ok {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(180deg, #7ED321 0%, #5FB31F 100%);
  color: var(--color-white);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-black);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    var(--shadow-xl),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
}

.btn-ok:hover {
  transform: translateY(-2px);
  box-shadow:
    0 20px 52px rgba(0, 0, 0, 0.25),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
}

.btn-ok:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 640px) {
  .title {
    font-size: var(--font-size-3xl);
  }

  .language-card {
    padding: var(--spacing-2xl) var(--spacing-xl);
  }

  .language-option {
    padding: var(--spacing-lg) var(--spacing-xl);
    gap: var(--spacing-lg);
    min-height: 70px;
  }

  .flag-container {
    width: 50px;
    height: 50px;
  }

  .flag {
    font-size: 32px;
  }

  .language-name {
    font-size: var(--font-size-xl);
  }

  .check-container {
    width: 40px;
    height: 40px;
  }

  .checkmark {
    font-size: 28px;
  }
}
</style>
