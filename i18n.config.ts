import de from './locales/de.json'
import en from './locales/en.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  messages: {
    de,
    en,
  },
}))
