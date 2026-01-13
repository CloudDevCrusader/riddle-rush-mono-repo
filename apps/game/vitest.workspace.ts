import { defineWorkspace, defineProject } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'

export default defineWorkspace([
  // Unit tests - run in happy-dom environment
  defineProject({
    plugins: [vue() as any],
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
      pool: 'forks', // Use forks to avoid --localstorage-file warning with happy-dom
      include: ['tests/unit/**/*.{test,spec}.ts'],
      exclude: ['node_modules', '.nuxt', '.output', 'tests/e2e'],
    },
  }),
])
