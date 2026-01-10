import { defineWorkspace, defineProject } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import type { PluginOption } from 'vite'

export default defineWorkspace([
  // Unit tests - run in happy-dom environment
  defineProject({
    plugins: [vue() as PluginOption],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./', import.meta.url)),
      },
    },
    test: {
      name: 'unit',
      globals: true,
      environment: 'happy-dom',
      include: ['tests/unit/**/*.{test,spec}.ts'],
      exclude: ['node_modules', '.nuxt', '.output', 'tests/e2e'],
    },
  }),
])
