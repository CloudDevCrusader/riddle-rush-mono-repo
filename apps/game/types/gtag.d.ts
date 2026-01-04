/**
 * Google Analytics 4 (gtag) type declarations
 * Used for manual GA4 implementation (replacing nuxt-gtag which is incompatible with Nuxt 4)
 */

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export {}
