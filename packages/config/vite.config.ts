import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/**
 * Shared Vite configuration utilities for the monorepo
 */

export interface ViteConfigOptions {
  root?: string
  workspaceRoot?: string
  isDev?: boolean
}

/**
 * Get workspace package aliases for Vite
 */
export function getWorkspaceAliases(workspaceRoot: string = process.cwd()) {
  return {
    '@riddle-rush/shared': resolve(workspaceRoot, 'packages/shared/src'),
    '@riddle-rush/types': resolve(workspaceRoot, 'packages/types/src'),
    '@riddle-rush/config': resolve(workspaceRoot, 'packages/config'),
  }
}

/**
 * Shared Vite plugins for development
 */
export function getDevPlugins(options: ViteConfigOptions = {}): Plugin[] {
  const plugins: Plugin[] = []

  // Only include dev plugins in development
  if (options.isDev !== false) {
    try {
      // Vite plugin for inspecting the transformation pipeline
      const { default: inspect } = require('vite-plugin-inspect')
      plugins.push(
        inspect({
          enabled: true,
          build: false,
        }),
      )
    }
    catch {
      // Plugin not installed, skip
    }

    try {
      // Vue DevTools for better debugging
      const { VueDevTools } = require('vite-plugin-vue-devtools')
      plugins.push(
        VueDevTools({
          enabled: true,
          componentInspector: true,
        }),
      )
    }
    catch {
      // Plugin not installed, skip
    }

    try {
      // Type checking and linting during dev
      const { checker } = require('vite-plugin-checker')
      plugins.push(
        checker({
          typescript: {
            tsconfigPath: options.root ? resolve(options.root, 'tsconfig.json') : 'tsconfig.json',
            root: options.root || process.cwd(),
          },
          eslint: {
            lintCommand: 'eslint "./**/*.{ts,tsx,vue}"',
            dev: {
              logLevel: ['error', 'warning'],
            },
          },
          vueTsc: {
            tsconfigPath: options.root ? resolve(options.root, 'tsconfig.json') : 'tsconfig.json',
          },
        }),
      )
    }
    catch {
      // Plugin not installed, skip
    }

    try {
      // Visualize bundle size

      const { visualizer } = require('rollup-plugin-visualizer')
      plugins.push(
        visualizer({
          filename: '.vite/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        }) as Plugin,
      )
    }
    catch {
      // Plugin not installed, skip
    }
  }

  return plugins
}

/**
 * Shared Vite plugins for production builds
 */
export function getBuildPlugins(_options: ViteConfigOptions = {}): Plugin[] {
  const plugins: Plugin[] = []

  try {
    // Visualize bundle size in production
    const { visualizer } = require('rollup-plugin-visualizer')
    plugins.push(
      visualizer({
        filename: '.vite/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // or 'sunburst', 'network'
      }) as Plugin,
    )
  }
  catch {
    // Plugin not installed, skip
  }

  return plugins
}

/**
 * Shared optimizeDeps configuration
 */
export function getOptimizeDeps() {
  return {
    include: [
      'pinia',
      '@vueuse/core',
      '@vueuse/nuxt',
      'idb',
    ],
    exclude: [
      '@nuxt/test-utils',
    ],
  }
}

/**
 * Shared build configuration
 */
export function getBuildConfig() {
  return {
    build: {
      // Enable tree shaking
      modulePreload: { polyfill: true },
      // Chunk size warnings
      chunkSizeWarningLimit: 500,
      // Source maps only in development
      sourcemap: process.env.NODE_ENV !== 'production',
      // Minification options
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production',
          pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : [],
        },
        format: {
          comments: false,
        },
      },
      // Optimize chunk splitting
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Vendor chunk for node_modules
            if (id.includes('node_modules')) {
              // Separate large libraries
              if (id.includes('pinia')) return 'vendor-pinia'
              if (id.includes('@vueuse')) return 'vendor-vueuse'
              if (id.includes('howler')) return 'vendor-howler'
              return 'vendor'
            }
            // Separate layouts
            if (id.includes('/layouts/')) return 'layouts'
            // Return null to use default chunking
            return null
          },
          // Optimize asset naming
          chunkFileNames: '_nuxt/[name]-[hash].js',
          entryFileNames: '_nuxt/[name]-[hash].js',
          assetFileNames: '_nuxt/[name]-[hash][extname]',
        },
      },
    },
  }
}
