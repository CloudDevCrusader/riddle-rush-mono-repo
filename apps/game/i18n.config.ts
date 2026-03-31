import en from './translations/locales/en.json'
import de from './translations/locales/de.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  messages: {
    en,
    de,
  },
}))
