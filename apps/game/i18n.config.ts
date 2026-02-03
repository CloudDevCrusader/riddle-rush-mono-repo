import en from './i18n/locales/en.json'
import de from './i18n/locales/de.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  messages: {
    en,
    de,
  },
}))
