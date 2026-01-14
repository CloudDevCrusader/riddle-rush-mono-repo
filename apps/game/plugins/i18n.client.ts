/**
 * Vue i18n Plugin
 * Sets up vue-i18n for the application with locale persistence and detection
 */
import { createI18n } from 'vue-i18n'

// Import translation files
import de from '~/i18n/locales/de.json'
import en from '~/i18n/locales/en.json'

type LocaleCode = 'de' | 'en'
const messages = { de, en }
const supportedLocales = new Set<LocaleCode>(['de', 'en'])

export default defineNuxtPlugin((nuxtApp) => {
  // Create i18n instance
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'de',
    fallbackLocale: 'de',
    messages,
    datetimeFormats: {
      en: {
        short: {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        },
        long: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: 'numeric',
          minute: 'numeric',
        },
      },
      de: {
        short: {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        },
        long: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: 'numeric',
          minute: 'numeric',
        },
      },
    },
    numberFormats: {
      en: {
        currency: {
          style: 'currency',
          currency: 'USD',
          notation: 'standard',
        },
        decimal: {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
        percent: {
          style: 'percent',
          useGrouping: false,
        },
      },
      de: {
        currency: {
          style: 'currency',
          currency: 'EUR',
          notation: 'standard',
        },
        decimal: {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
        percent: {
          style: 'percent',
          useGrouping: false,
        },
      },
    },
  })

  // Install i18n
  nuxtApp.vueApp.use(i18n)

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
    if (!locale || locale === i18n.global.locale.value) return

    if (options?.fromRoute) {
      skipLocalePersistence = true
    }

    i18n.global.locale.value = locale
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
    () => i18n.global.locale.value,
    (newLocale) => {
      if (!newLocale) return

      const persist = settingsStore.hasStoredSettings() && !skipLocalePersistence
      settingsStore.setLanguage(newLocale as string, persist)
      skipLocalePersistence = false
    }
  )

  // Provide setLocale function for compatibility with existing code
  const setLocale = (locale: string) => {
    if (supportedLocales.has(locale as LocaleCode)) {
      i18n.global.locale.value = locale as LocaleCode
    }
  }

  // Provide i18n instance and helper functions
  return {
    provide: {
      i18n: i18n.global,
      setLocale,
    },
  }
})
