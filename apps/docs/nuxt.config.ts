// https://nuxt.com/docs/api/configuration/nuxt-config

import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxt/content'],

  ssr: false,

  devtools: { enabled: false },

  app: {
    // Docs are served from the domain root (e.g., https://docs.riddlerush.de/)
    baseURL: process.env.BASE_URL || '/',
  },

  // @ts-expect-error - content module config not fully typed in Nuxt 4
  content: {
    experimental: {
      sqliteConnector: 'native',
    },
    sources: {
      content: {
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
