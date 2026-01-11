/**
 * i18n Initialization Plugin
 * Loads language preference from settings store and applies it to i18n
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Access i18n through nuxtApp context to avoid setup function requirement

  const i18n = (nuxtApp as any).$i18n
  const settingsStore = useSettingsStore()

  const supportedLocales = new Set(['de', 'en'])

  const resolveBrowserLocale = () => {
    if (typeof navigator === 'undefined') return null

    const candidates = [...(navigator.languages ?? []), navigator.language].filter(
      (locale): locale is string => Boolean(locale)
    )

    for (const locale of candidates) {
      const normalized = locale.toLowerCase().split('-')[0]
      if (normalized && supportedLocales.has(normalized)) {
        return normalized
      }
    }

    return null
  }

  const resolveRouteLocale = () => {
    // Safely get route - it might not be ready yet during plugin initialization

    const router = nuxtApp.$router as any
    const route = router?.currentRoute?.value
    if (!route) return null

    const rawLang = route.query.lang
    const langCandidate = Array.isArray(rawLang) ? rawLang[0] : rawLang
    if (!langCandidate) return null

    const normalized = langCandidate.toString().toLowerCase().split('-')[0]
    if (normalized && supportedLocales.has(normalized)) {
      return normalized
    }

    return null
  }

  // Load settings from localStorage
  const hasStoredSettings = settingsStore.hasStoredSettings()
  settingsStore.loadSettings()
  const storedLanguage = settingsStore.getLanguage()

  let skipLocalePersistence = false

  const setInitialLocale = (locale: string, options?: { fromRoute?: boolean }) => {
    if (!locale || locale === i18n.locale.value) return

    if (options?.fromRoute) {
      skipLocalePersistence = true
    }

    i18n.setLocale(locale)
  }

  const routeLocale = resolveRouteLocale()

  if (routeLocale) {
    setInitialLocale(routeLocale, { fromRoute: true })
  } else if (hasStoredSettings && storedLanguage) {
    setInitialLocale(storedLanguage)
  } else {
    const browserLocale = resolveBrowserLocale()
    const fallbackLocale = browserLocale ?? (i18n.locale.value as string)
    setInitialLocale(fallbackLocale)
  }

  // Watch for locale changes and update settings (persist only when a preference was stored)
  watch(
    () => i18n.locale.value,
    (newLocale) => {
      if (!newLocale) return

      const persist = settingsStore.hasStoredSettings() && !skipLocalePersistence
      settingsStore.setLanguage(newLocale as string, persist)
      skipLocalePersistence = false
    }
  )
})
