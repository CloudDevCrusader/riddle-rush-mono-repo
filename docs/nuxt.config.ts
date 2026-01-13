// Documentation-specific Nuxt configuration
// This extends the main nuxt.config.ts for documentation builds

import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // Documentation-specific settings
  app: {
    baseURL: '/',
  },

  // @ts-expect-error - content module config not fully typed in Nuxt 4
  content: {
    sources: {
      docs: {
        driver: 'fs',
        prefix: '/',
        base: './content',
      },
    },
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 3,
      },
    },
    highlight: {
      theme: 'github-dark',
      preload: ['typescript', 'vue', 'bash', 'json'],
    },
  },
})
