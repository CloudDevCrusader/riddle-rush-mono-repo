/**
 * Nuxt i18n locale setup
 * Uses @nuxtjs/i18n's instance for locale persistence and detection.
 */

import { useSettingsStore } from '~/stores/settingsStore'

type LocaleCode = 'de' | 'en'
const supportedLocales = new Set<LocaleCode>(['de', 'en'])

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = (nuxtApp as { $i18n?: any }).$i18n
  const i18nGlobal = i18n?.global ?? i18n
  const router = nuxtApp.$router as
    | { currentRoute?: { value?: { query?: Record<string, unknown> } } }
    | undefined

  if (!i18nGlobal?.locale?.value) return

  // Helper functions for locale detection
  const resolveBrowserLocale = (): LocaleCode | null => {
    if (typeof navigator === 'undefined') return null

    const candidates = [...(navigator.languages ?? []), navigator.language].filter(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      (locale): locale is string => Boolean(locale)
    )
=======
=======
>>>>>>> Stashed changes
      (locale): locale is string => Boolean(locale),
    );
>>>>>>> Stashed changes

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

  // Load settings from Pinia store
  const settingsStore = useSettingsStore()
  const hasStoredSettings = Boolean(settingsStore.language)
  const storedLanguage = settingsStore.language

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
    hasStoredSettings
    && storedLanguage
    && supportedLocales.has(storedLanguage as LocaleCode)
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
    (newLocale: string | undefined) => {
      if (!newLocale) return

      if (!skipLocalePersistence) {
        settingsStore.setLanguage(newLocale as string)
      }
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      skipLocalePersistence = false
    }
  )
=======
=======
>>>>>>> Stashed changes
      skipLocalePersistence = false;
    },
  );
>>>>>>> Stashed changes

  // Keep locale in sync when query lang changes after app boot.
  watch(
    () => router?.currentRoute?.value?.query?.lang,
    (rawLang) => {
      const langCandidate = Array.isArray(rawLang) ? rawLang[0] : rawLang
      if (!langCandidate) return

      const normalized = langCandidate.toString().toLowerCase().split('-')[0] as LocaleCode
      if (!normalized || !supportedLocales.has(normalized)) return
      if (normalized === i18nGlobal.locale.value) return

<<<<<<< Updated upstream
      skipLocalePersistence = true
      i18nGlobal.locale.value = normalized
    }
  )
=======
      skipLocalePersistence = true;
      i18nGlobal.locale.value = normalized;
    },
  );
>>>>>>> Stashed changes

  return {}
})
