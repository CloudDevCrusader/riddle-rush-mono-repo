/**
 * i18n Initialization Plugin
 * Loads language preference from settings store and applies it to i18n
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Access i18n through nuxtApp context to avoid setup function requirement
  const i18n = (nuxtApp as any).$i18n
  const settingsStore = useSettingsStore()

  // Load settings from localStorage
  settingsStore.loadSettings()

  // Check if stored language differs from current locale
  const storedLanguage = settingsStore.getLanguage()

  if (storedLanguage && storedLanguage !== i18n.locale.value) {
    // Set the stored language as the current locale
    i18n.setLocale(storedLanguage)
  }

  // Watch for locale changes and update settings
  watch(
    () => i18n.locale.value,
    (newLocale) => {
      if (newLocale) {
        settingsStore.setLanguage(newLocale as string)
      }
    }
  )
})
