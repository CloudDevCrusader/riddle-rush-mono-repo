/**
 * Re-export useI18n from vue-i18n for auto-import support
 * Provides backward compatibility with @nuxtjs/i18n API
 */
import { useI18n as vueUseI18n } from 'vue-i18n'

type LocaleCode = 'de' | 'en'
const supportedLocales = new Set<LocaleCode>(['de', 'en'])

export function useI18n() {
  const i18n = vueUseI18n()

  // Provide setLocale function for backward compatibility with @nuxtjs/i18n API
  const setLocale = async (locale: string) => {
    if (supportedLocales.has(locale as LocaleCode)) {
      i18n.locale.value = locale as LocaleCode
    }
  }

  return {
    ...i18n,
    setLocale,
  }
}
