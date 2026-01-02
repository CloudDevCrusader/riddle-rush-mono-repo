// https://nuxt.com/docs/api/configuration/nuxt-config

import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxt/content'],

  ssr: false,

  devtools: { enabled: false },

  app: {
    // GitLab Pages serves from repo root, so baseURL should be the repo path
    baseURL: process.env.BASE_URL || (process.env.CI ? '/riddle-rush-nuxt-pwa/' : '/'),
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
