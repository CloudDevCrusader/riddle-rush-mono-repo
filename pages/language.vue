<template>
  <div class="language-page">
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/language/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
    >

    <!-- Back Button -->
    <button
      class="back-btn tap-highlight no-select"
      @click="goBack"
    >
      <img
        :src="`${baseUrl}assets/language/back.png`"
        alt="Back"
      >
    </button>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <div class="title-container animate-fade-in">
        <img
          :src="`${baseUrl}assets/language/LANGUAGE.png`"
          alt="Language"
          class="title-image"
        >
      </div>

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
              <img
                :src="`${baseUrl}assets/language/Eng%20Flag.png`"
                alt="English"
                class="flag-image"
              >
            </div>
            <img
              :src="`${baseUrl}assets/language/Language%20button.png`"
              alt="Language button"
              class="button-bg"
            >
            <span class="language-name">ENGLISH</span>
            <div
              v-if="currentLocale === 'en'"
              class="check-mark"
            >
              <img
                :src="`${baseUrl}assets/language/mark.png`"
                alt="Selected"
              >
            </div>
          </button>

          <!-- German -->
          <button
            class="language-option tap-highlight no-select"
            :class="{ selected: currentLocale === 'de' }"
            @click="selectLanguage('de')"
          >
            <div class="flag-container">
              <img
                :src="`${baseUrl}assets/language/German%20Flag.png`"
                alt="German"
                class="flag-image"
              >
            </div>
            <img
              :src="`${baseUrl}assets/language/Language%20button.png`"
              alt="Language button"
              class="button-bg"
            >
            <span class="language-name">GERMAN</span>
            <div
              v-if="currentLocale === 'de'"
              class="check-mark"
            >
              <img
                :src="`${baseUrl}assets/language/mark.png`"
                alt="Selected"
              >
            </div>
          </button>
        </div>
      </div>

      <!-- OK Button -->
      <button
        class="ok-btn tap-highlight no-select animate-slide-up"
        @click="confirmSelection"
      >
        <img
          :src="`${baseUrl}assets/language/OK.png`"
          alt="OK"
        >
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { locale, setLocale } = useI18n()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl

const currentLocale = ref(locale.value)

type LocaleCode = 'de' | 'en'

const selectLanguage = (lang: LocaleCode) => {
  currentLocale.value = lang
}

const confirmSelection = async () => {
  await setLocale(currentLocale.value as LocaleCode)
  router.push('/')
}

const goBack = () => {
  router.back()
}

useHead({
  title: 'Language Selection',
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
  overflow-x: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
}

/* Background Image */
.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Back Button */
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

.back-btn:hover {
  transform: scale(1.05);
}

.back-btn:active {
  transform: scale(0.95);
}

/* Container */
.container {
  position: relative;
  z-index: 2;
  max-width: 800px;
  width: 100%;
  padding: var(--spacing-xl) var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3xl);
}

/* Title */
.title-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-2xl);
}

.title-image {
  width: clamp(200px, 30vw, 300px);
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

/* Language Card */
.language-card {
  width: 100%;
  max-width: 600px;
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.language-option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 100px;
  padding: 0;
}

.language-option:hover {
  transform: translateY(-4px) scale(1.02);
}

.language-option:active {
  transform: translateY(-2px) scale(0.98);
}

.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.language-option.selected .button-bg {
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3)) brightness(1.1);
}

.flag-container {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  width: clamp(60px, 8vw, 80px);
  height: clamp(60px, 8vw, 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.flag-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.language-name {
  position: relative;
  z-index: 2;
  flex: 1;
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-xl), 3vw, var(--font-size-3xl));
  font-weight: var(--font-weight-black);
  color: #3a2817;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.check-mark {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  animation: scaleIn 0.3s ease-out;
}

.check-mark img {
  width: clamp(24px, 3vw, 32px);
  height: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* OK Button */
.ok-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.ok-btn img {
  width: clamp(200px, 40vw, 300px);
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.ok-btn:hover {
  transform: translateY(-4px) scale(1.05);
}

.ok-btn:active {
  transform: translateY(-2px) scale(0.95);
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out 0.2s backwards;
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

.animate-slide-up {
  animation: slideUp 0.6s ease-out 0.4s backwards;
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

/* Responsive */
@media (max-width: 640px) {
  .back-btn img {
    width: 40px;
  }

  .title-image {
    width: 200px;
  }

  .language-option {
    min-height: 80px;
  }

  .ok-btn img {
    width: 200px;
  }
}
</style>
