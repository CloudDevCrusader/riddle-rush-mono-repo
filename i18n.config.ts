import de from './locales/de.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  messages: {
    de,
  },
}))
