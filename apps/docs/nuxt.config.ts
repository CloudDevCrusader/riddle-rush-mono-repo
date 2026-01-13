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

  // Content module configuration commented out due to Nuxt 4 type incompatibility
  // Content module will use default configuration
  // content: {
  //   driver: 'fs',
  //   sources: {
  //     content: {
  //       driver: 'fs',
  //       prefix: '/docs',
  //       base: './content',
  //     },
  //   },
  //   markdown: {
  //     toc: {
  //       depth: 3,
  //       searchDepth: 3,
  //     },
  //   },
  //   highlight: {
  //     theme: 'github-dark',
  //     preload: ['typescript', 'vue', 'bash', 'json'],
  //   },
  // },
})
