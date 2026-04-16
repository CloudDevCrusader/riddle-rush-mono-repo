/**
 * Lodash utilities composable
 *
 * Provides commonly used lodash-es functions with tree-shaking support.
 * Uses dynamic imports for better performance and smaller initial bundle.
 */

export const useLodash = () => {
  return {
    // Debounce & Throttle - Lazy loaded for performance
    get debounce() {
      return import('lodash-es/debounce').then((module) => module.default)
    },
    get throttle() {
      return import('lodash-es/throttle').then((module) => module.default)
    },

    // Array utilities - Lazy loaded for performance
    get shuffle() {
      return import('lodash-es/shuffle').then((module) => module.default)
    },
    get sample() {
      return import('lodash-es/sample').then((module) => module.default)
    },
    get sampleSize() {
      return import('lodash-es/sampleSize').then((module) => module.default)
    },
    get uniq() {
      return import('lodash-es/uniq').then((module) => module.default)
    },
    get uniqBy() {
      return import('lodash-es/uniqBy').then((module) => module.default)
    },
    get groupBy() {
      return import('lodash-es/groupBy').then((module) => module.default)
    },
    get orderBy() {
      return import('lodash-es/orderBy').then((module) => module.default)
    },
    get chunk() {
      return import('lodash-es/chunk').then((module) => module.default)
    },
    get flatten() {
      return import('lodash-es/flatten').then((module) => module.default)
    },

    // Object utilities - Lazy loaded for performance
    get cloneDeep() {
      return import('lodash-es/cloneDeep').then((module) => module.default)
    },
    get isEqual() {
      return import('lodash-es/isEqual').then((module) => module.default)
    },
    get isEmpty() {
      return import('lodash-es/isEmpty').then((module) => module.default)
    },
    get get() {
      return import('lodash-es/get').then((module) => module.default)
    },
    get set() {
      return import('lodash-es/set').then((module) => module.default)
    },
    get has() {
      return import('lodash-es/has').then((module) => module.default)
    },
    get omit() {
      return import('lodash-es/omit').then((module) => module.default)
    },
    get pick() {
      return import('lodash-es/pick').then((module) => module.default)
    },
  }
}

// Type-safe helpers
export type { DebouncedFunc } from 'lodash-es'

// Synchronous version for immediate use (smaller functions only)
export const useLodashSync = () => {
  return {
    // Small utility functions that are safe to load synchronously
    isEmpty: (value: unknown) => {
      if (value == null) return true
      if (Array.isArray(value) || typeof value === 'string') return value.length === 0
      if (typeof value === 'object') return Object.keys(value).length === 0
      return false
    },

    // Lightweight clone for simple objects
    clone: <T>(value: T): T => {
      if (Array.isArray(value)) return [...value] as T
      if (typeof value === 'object' && value !== null) return { ...value }
      return value
    },

    // Lightweight shuffle implementation for small arrays
    shuffle: <T>(array: T[]): T[] => {
      if (!Array.isArray(array)) return []
      const result = [...array]
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = result[i] as T
        result[i] = result[j] as T
        result[j] = temp as T
      }
      return result
    },

    // Lightweight sample implementation
    sample: <T>(array: T[]): T => {
      if (!Array.isArray(array) || array.length === 0)
        throw new Error('Cannot sample from empty array')
      return array[Math.floor(Math.random() * array.length)] as T
    },

    // Lightweight sampleSize implementation
    sampleSize: <T>(array: T[], size: number = 1): T[] => {
      if (!Array.isArray(array) || array.length === 0) return []
      const result: T[] = []
      const copy = [...array]
      const take = Math.min(size, copy.length)

      for (let i = 0; i < take; i++) {
        const randomIndex = Math.floor(Math.random() * copy.length)
        result.push(copy[randomIndex] as T)
        copy.splice(randomIndex, 1)
      }

      return result
    },
  }
}
