import type { I18nOptions } from 'vue-i18n'

import de from './locales/de.json'
import en from './locales/en.json'

export default {
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  messages: {
    en,
    de,
  },
} satisfies I18nOptions
