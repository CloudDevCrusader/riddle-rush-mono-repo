/**
 * Nuxt i18n locale setup
 * Uses @nuxtjs/i18n's instance for locale persistence and detection.
 */

type LocaleCode = 'de' | 'en'
const supportedLocales = new Set<LocaleCode>(['de', 'en'])

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = (nuxtApp as { $i18n?: any }).$i18n
  const i18nGlobal = i18n?.global ?? i18n

  if (!i18nGlobal?.locale?.value) return

  // Helper functions for locale detection
  const resolveBrowserLocale = (): LocaleCode | null => {
    if (typeof navigator === 'undefined') return null

    const candidates = [...(navigator.languages ?? []), navigator.language].filter(
      (locale): locale is string => Boolean(locale)
    )

    for (const locale of candidates) {
      const normalized = locale.toLowerCase().split('-')[0] as LocaleCode
      if (normalized && supportedLocales.has(normalized)) {
        return normalized
      }
    }

    return null
  }

  const resolveRouteLocale = (): LocaleCode | null => {
    const router = nuxtApp.$router as any
    const route = router?.currentRoute?.value
    if (!route) return null

    const rawLang = route.query.lang
    const langCandidate = Array.isArray(rawLang) ? rawLang[0] : rawLang
    if (!langCandidate) return null

    const normalized = langCandidate.toString().toLowerCase().split('-')[0] as LocaleCode
    if (normalized && supportedLocales.has(normalized)) {
      return normalized
    }

    return null
  }

  // Load settings and set initial locale
  const settingsStore = useSettingsStore()
  const hasStoredSettings = settingsStore.hasStoredSettings()
  settingsStore.loadSettings()
  const storedLanguage = settingsStore.getLanguage()

  let skipLocalePersistence = false

  const setInitialLocale = (locale: LocaleCode, options?: { fromRoute?: boolean }) => {
    if (!locale || locale === i18nGlobal.locale.value) return

    if (options?.fromRoute) {
      skipLocalePersistence = true
    }

    i18nGlobal.locale.value = locale
  }

  // Determine initial locale: route > stored settings > browser > fallback
  const routeLocale = resolveRouteLocale()

  if (routeLocale) {
    setInitialLocale(routeLocale, { fromRoute: true })
  } else if (
    hasStoredSettings &&
    storedLanguage &&
    supportedLocales.has(storedLanguage as LocaleCode)
  ) {
    setInitialLocale(storedLanguage as LocaleCode)
  } else {
    const browserLocale = resolveBrowserLocale()
    const fallbackLocale = browserLocale ?? 'de'
    setInitialLocale(fallbackLocale)
  }

  // Watch for locale changes and update settings
  watch(
    () => i18nGlobal.locale.value,
    (newLocale) => {
      if (!newLocale) return

      const persist = settingsStore.hasStoredSettings() && !skipLocalePersistence
      settingsStore.setLanguage(newLocale as string, persist)
      skipLocalePersistence = false
    }
  )

  return {}
})
