/**
 * Lodash utilities composable
 *
 * Provides commonly used lodash-es functions with tree-shaking support.
 * Import only what you need to keep bundle size small.
 */

import {
  debounce,
  throttle,
  cloneDeep,
  shuffle,
  sample,
  sampleSize,
  uniq,
  uniqBy,
  groupBy,
  orderBy,
  chunk,
  flatten,
  isEqual,
  isEmpty,
  get,
  set,
  has,
  omit,
  pick,
} from 'lodash-es'

export const useLodash = () => {
  return {
    // Debounce & Throttle
    debounce,
    throttle,

    // Array utilities
    shuffle, // Randomize array order
    sample, // Get random item
    sampleSize, // Get N random items
    uniq, // Remove duplicates
    uniqBy, // Remove duplicates by property
    groupBy, // Group array by property
    orderBy, // Sort array by multiple properties
    chunk, // Split array into chunks
    flatten, // Flatten nested arrays

    // Object utilities
    cloneDeep, // Deep clone objects
    isEqual, // Deep equality check
    isEmpty, // Check if empty
    get, // Safe property access
    set, // Safe property set
    has, // Check property exists
    omit, // Remove properties
    pick, // Select properties
  }
}

// Type-safe helpers
export type { DebouncedFunc } from 'lodash-es'
