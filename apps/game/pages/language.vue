<template>
  <div class="language-page">
    <img src="~/assets/figma/background-1.png" class="language-bg" alt="background" />
    <div class="language-container">
      <img
        src="~/assets/figma/back-3.png"
        class="language-panel-bg"
        alt="Language panel background"
      />
      <div class="language-content">
        <img src="~/assets/figma/language-1.png" class="language-title" alt="Language" />
        <div class="language-options">
          <div class="language-option" @click="selectLanguage('en')">
            <img
              src="~/assets/figma/language-button-1.png"
              class="language-btn-bg"
              alt="Language button"
            />
            <img src="~/assets/figma/eng-flag-1.png" class="flag" alt="English flag" />
            <img
              v-if="selectedLocale === 'en'"
              src="~/assets/figma/mark-1.png"
              class="checkmark"
              alt="Checkmark"
            />
          </div>
          <div class="language-option" @click="selectLanguage('de')">
            <img
              src="~/assets/figma/language-button-2.png"
              class="language-btn-bg"
              alt="Language button"
            />
            <img src="~/assets/figma/german-flag-1.png" class="flag" alt="German flag" />
            <img
              v-if="selectedLocale === 'de'"
              src="~/assets/figma/mark-1.png"
              class="checkmark"
              alt="Checkmark"
            />
          </div>
        </div>
        <img src="~/assets/figma/ok-1.png" class="ok-btn" alt="OK" @click="confirmSelection" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { goBack, router } = usePageSetup()
const { locale, setLocale, t } = useI18n()
const { settingsStore } = useGameState()
const route = useRoute()

// Stage selection locally (does not apply until OK pressed)
const selectedLocale = ref(locale.value)

type LocaleCode = 'de' | 'en'

const selectLanguage = (lang: LocaleCode) => {
  selectedLocale.value = lang
}

const confirmSelection = async () => {
  try {
    // Save language preference first
    settingsStore.setLanguage(selectedLocale.value as LocaleCode)

    // Set the locale
    await setLocale(selectedLocale.value as LocaleCode)

    await updateLanguageQuery(selectedLocale.value as LocaleCode)

    // Force page reload to ensure all translations update
    // This is the most reliable way to handle language switching in SPAs
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  } catch (error) {
    console.error('Failed to change language:', error)
    // Fallback: navigate back without reload
    goBack()
  }
}

const updateLanguageQuery = async (lang: LocaleCode) => {
  if (typeof window === 'undefined') return

  const query = { ...route.query } as Record<string, string | string[] | undefined>
  query.lang = lang
  await router.replace({ query })
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
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.language-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.language-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.language-panel-bg {
  width: 100%;
}

.language-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 80%;
}

.language-title {
  width: 100%;
  max-width: 200px;
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.language-option {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.language-btn-bg {
  width: 100%;
}

.flag {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  width: 48px;
}

.checkmark {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  width: 32px;
}

.ok-btn {
  width: 100%;
  max-width: 200px;
  cursor: pointer;
}
</style>
