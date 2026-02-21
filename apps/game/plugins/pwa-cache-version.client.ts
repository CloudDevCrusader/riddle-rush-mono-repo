import { useRuntimeConfig } from '#app'
import type { GameSession } from '@riddle-rush/types'

const CACHE_VERSION_KEY = 'pwa-cache-version'
const CACHE_VERSION_KEY_START_URL = 'start-url'
const CACHE_VERSION_KEY_IMAGES = 'images'
const CACHE_VERSION_KEY_FONTS = 'fonts'
const CACHE_VERSION_KEY_GOOGLE_FONTS_STYLESHEETS = 'google-fonts-stylesheets'
const CACHE_VERSION_KEY_GOOGLE_FONTS_WEBFONTS = 'google-fonts-webfonts'

export default defineNuxtPlugin({
  setup() {
    if (import.meta.client) {
      const version = useRuntimeConfig().public.appVersion
      const currentVersion = getPWAVersion()

      console.log(`[PWA Cache] Version Check`, { version, currentVersion })

      if (currentVersion && currentVersion !== version) {
        console.log(`[PWA Cache] Version changed, cleaning up old caches`, {
          previous: currentVersion,
          current: version,
        })

        // Clean up all old cache versions
        cleanupOldCaches().catch((error) => {
          console.error('[PWA Cache] Failed to cleanup old caches:', error)
        })
        savePWAVersion(version).catch((error) => {
          console.error('[PWA Cache] Failed to save version to storage:', error)
        })
      } else if (!currentVersion) {
        // First install, save current version
        savePWAVersion(version).catch((error) => {
          console.error('[PWA Cache] Failed to save version to storage:', error)
        })
        console.log(`[PWA Cache] First install, initialized cache version`, { version })
      }

      // Update cache names in runtime caching config
      updateCacheNames(version).catch((error) => {
        console.error('[PWA Cache] Failed to update cache names:', error)
      })
    }
  },
})

function getPWAVersion(): string | null {
  try {
    return localStorage.getItem(CACHE_VERSION_KEY)
  } catch (error) {
    console.error('[PWA Cache] Failed to read PWA version from storage:', error)
    return null
  }
}

function savePWAVersion(version: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(CACHE_VERSION_KEY, version)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

async function cleanupOldCaches(): Promise<void> {
  try {
    if (!('caches' in window)) {
      console.warn('[PWA Cache] Cache API not available')
      return
    }

    const cacheNames = await caches.keys()

    // Pattern to match cache names (with or without version suffix)
    const cachePattern =
      /^(start-url|images|fonts|google-fonts-stylesheets|google-fonts-webfonts)(?:-v\d+\.\d+\.\d+)?$/i

    for (const cacheName of cacheNames) {
      // Skip the version key itself
      if (cacheName === CACHE_VERSION_KEY) {
        continue
      }

      // Skip cache names that don't match our pattern (may be user-specific or other apps)
      if (!cachePattern.test(cacheName)) {
        continue
      }

      console.log(`[PWA Cache] Deleting old cache:`, cacheName)
      await caches.delete(cacheName)
    }

    console.log(`[PWA Cache] Cache cleanup completed`)
  } catch (error) {
    console.error('[PWA Cache] Failed to cleanup caches:', error)
    throw error
  }
}

async function updateCacheNames(version: string): Promise<void> {
  try {
    if (!('caches' in window)) {
      console.warn('[PWA Cache] Cache API not available')
      return
    }

    // Update start-url cache
    await caches.open(`${CACHE_VERSION_KEY_START_URL}-v${version}`)

    // Update images cache
    await caches.open(`${CACHE_VERSION_KEY_IMAGES}-v${version}`)

    // Update fonts cache
    await caches.open(`${CACHE_VERSION_KEY_FONTS}-v${version}`)

    // Update Google Fonts stylesheets cache
    await caches.open(`${CACHE_VERSION_KEY_GOOGLE_FONTS_STYLESHEETS}-v${version}`)

    // Update Google Fonts webfonts cache
    await caches.open(`${CACHE_VERSION_KEY_GOOGLE_FONTS_WEBFONTS}-v${version}`)
  } catch (error) {
    console.error('[PWA Cache] Failed to update cache names:', error)
    throw error
  }
}
