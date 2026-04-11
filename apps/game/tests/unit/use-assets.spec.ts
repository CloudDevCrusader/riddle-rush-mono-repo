import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Create a mock for useRuntimeConfig BEFORE any modules import it
const mockUseRuntimeConfig = vi.fn(() => ({
  public: {
    baseUrl: '/test-base/',
  },
}))

// Make useRuntimeConfig globally available for auto-import in the composable
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)

// Mock useRuntimeConfig from #app
vi.mock('#app', () => ({
  useRuntimeConfig: mockUseRuntimeConfig,
}))

const { useAssets } = await import('../../composables/useAssets')

/** Shape of the Image mock instances used in preload tests. */
interface MockImageElement {
  src: string
  onload: (() => void) | null
  onerror: ((error: Error) => void) | null
}

/** Returns a class-based Image stub that appends each instance to `instances`. */
function makeImageStub(instances: MockImageElement[]) {
  return class implements MockImageElement {
    src = ''
    onload: (() => void) | null = null
    onerror: ((error: Error) => void) | null = null
    constructor() {
      // push(this) passes `this` as an argument — no local alias, no lint error
      instances.push(this)
    }
  }
}

describe('useAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('baseUrl', () => {
    it('should expose baseUrl from runtime config', () => {
      const assets = useAssets()

      expect(assets.baseUrl).toBe('/test-base/')
    })
  })

  describe('getAssetPath', () => {
    it('should return path with baseUrl prefix', () => {
      const assets = useAssets()

      const result = assets.getAssetPath('image.png')

      expect(result).toBe('/test-base/image.png')
    })

    it('should handle paths with leading slash', () => {
      const assets = useAssets()

      const result = assets.getAssetPath('/image.png')

      expect(result).toBe('/test-base/image.png')
    })

    it('should handle paths with multiple segments', () => {
      const assets = useAssets()

      const result = assets.getAssetPath('folder/subfolder/image.png')

      expect(result).toBe('/test-base/folder/subfolder/image.png')
    })

    it('should handle paths with leading slash and multiple segments', () => {
      const assets = useAssets()

      const result = assets.getAssetPath('/folder/subfolder/image.png')

      expect(result).toBe('/test-base/folder/subfolder/image.png')
    })

    it('should prefix canonical assets path for relative and slash-prefixed paths', () => {
      const assets = useAssets()

      expect(assets.getAssetPath('assets/splash/logo.png')).toBe(
        '/test-base/assets/splash/logo.png'
      )
      expect(assets.getAssetPath('/assets/splash/logo.png')).toBe(
        '/test-base/assets/splash/logo.png'
      )
    })

    it('should handle empty string', () => {
      const assets = useAssets()

      const result = assets.getAssetPath('')

      expect(result).toBe('/test-base/')
    })
  })

  describe('getMenuAsset', () => {
    it('should return menu asset path', () => {
      const assets = useAssets()

      const result = assets.getMenuAsset('background.jpg')

      expect(result).toBe('/test-base/assets/main-menu/background.jpg')
    })

    it('should handle different menu asset filenames', () => {
      const assets = useAssets()

      expect(assets.getMenuAsset('logo.png')).toBe('/test-base/assets/main-menu/logo.png')
      expect(assets.getMenuAsset('button.svg')).toBe('/test-base/assets/main-menu/button.svg')
    })
  })

  describe('getSettingsAsset', () => {
    it('should return settings asset path', () => {
      const assets = useAssets()

      const result = assets.getSettingsAsset('icon.svg')

      expect(result).toBe('/test-base/assets/settings/icon.svg')
    })

    it('should handle different settings asset filenames', () => {
      const assets = useAssets()

      expect(assets.getSettingsAsset('slider.png')).toBe('/test-base/assets/settings/slider.png')
      expect(assets.getSettingsAsset('toggle.svg')).toBe('/test-base/assets/settings/toggle.svg')
    })
  })

  describe('getSplashAsset', () => {
    it('should return splash asset path', () => {
      const assets = useAssets()
      expect(assets.getSplashAsset('logo.png')).toBe('/test-base/assets/splash/logo.png')
    })
  })

  describe('getAlphabetAsset', () => {
    it('should return alphabet asset path', () => {
      const assets = useAssets()
      expect(assets.getAlphabetAsset('A.png')).toBe('/test-base/assets/alphabets/A.png')
    })
  })

  describe('getPlayersAsset', () => {
    it('should return players asset path', () => {
      const assets = useAssets()
      expect(assets.getPlayersAsset('avatar.png')).toBe('/test-base/assets/players/avatar.png')
    })
  })

  describe('source contracts', () => {
    it('should not reference dead assets/icons or assets/game helper paths', () => {
      const sourcePath = resolve(process.cwd(), 'composables/useAssets.ts')
      const source = readFileSync(sourcePath, 'utf-8')

      expect(source).not.toContain('assets/icons/')
      expect(source).not.toContain('assets/game/')
    })

    it('should not define a duplicate getAssetPath in usePageSetup', () => {
      const sourcePath = resolve(process.cwd(), 'composables/usePageSetup.ts')
      const source = readFileSync(sourcePath, 'utf-8')

      expect(source).not.toContain('const getAssetPath =')
    })
  })

  describe('preloadImage', () => {
    it('should resolve when image loads successfully', async () => {
      const assets = useAssets()
      const instances: MockImageElement[] = []
      vi.stubGlobal('Image', makeImageStub(instances))

      const promise = assets.preloadImage('/test/image.png')
      // The composable creates the Image instance synchronously; access via array
      instances[0]!.onload?.()

      await expect(promise).resolves.toBeUndefined()
      expect(instances[0]!.src).toBe('/test/image.png')
    })

    it('should reject when image fails to load', async () => {
      const assets = useAssets()
      const instances: MockImageElement[] = []
      vi.stubGlobal('Image', makeImageStub(instances))

      const promise = assets.preloadImage('/test/broken.png')
      const error = new Error('Load failed')
      instances[0]!.onerror?.(error)

      await expect(promise).rejects.toThrow('Load failed')
    })

    it('should resolve when Image is not available', async () => {
      const assets = useAssets()
      // Make Image throw on construction AND on function call
      vi.stubGlobal('Image', null)

      await expect(assets.preloadImage('/test/image.png')).resolves.toBeUndefined()
    })

    it('should fall back to function call when constructor throws', async () => {
      const assets = useAssets()
      const instances: MockImageElement[] = []

      // First `new Image()` throws, then fallback `Image()` works
      let callCount = 0
      const fakeFn = function (this: MockImageElement) {
        callCount++
        const img: MockImageElement = { src: '', onload: null, onerror: null }
        instances.push(img)
        return img
      }
      // Make it throw when called with `new`
      Object.defineProperty(fakeFn, Symbol.hasInstance, { value: () => true })
      const throwingCtor = new Proxy(fakeFn, {
        construct() {
          throw new Error('not a constructor')
        },
      })
      vi.stubGlobal('Image', throwingCtor)

      const promise = assets.preloadImage('/test/fallback.png')
      instances[0]!.onload?.()

      await expect(promise).resolves.toBeUndefined()
      expect(instances[0]!.src).toBe('/test/fallback.png')
    })
  })

  describe('preloadImages', () => {
    it('should preload multiple images successfully', async () => {
      const assets = useAssets()
      const mockImages: MockImageElement[] = []
      vi.stubGlobal('Image', makeImageStub(mockImages))

      const paths = ['/image1.png', '/image2.png', '/image3.png']
      const promise = assets.preloadImages(paths)

      // Simulate all images loading
      mockImages.forEach((img) => img.onload?.())

      await expect(promise).resolves.toBeUndefined()
      expect(mockImages).toHaveLength(3)
      expect(mockImages[0]!.src).toBe('/image1.png')
      expect(mockImages[1]!.src).toBe('/image2.png')
      expect(mockImages[2]!.src).toBe('/image3.png')
    })

    it('should reject if any image fails to load', async () => {
      const assets = useAssets()
      const mockImages: MockImageElement[] = []
      vi.stubGlobal('Image', makeImageStub(mockImages))

      const paths = ['/image1.png', '/image2.png', '/image3.png']
      const promise = assets.preloadImages(paths)

      // Simulate first two loading, third failing
      mockImages[0]!.onload?.()
      mockImages[1]!.onload?.()
      const error = new Error('Load failed')
      mockImages[2]!.onerror?.(error)

      await expect(promise).rejects.toThrow('Load failed')
    })

    it('should handle empty array', async () => {
      const assets = useAssets()

      await expect(assets.preloadImages([])).resolves.toBeUndefined()
    })
  })

  describe('return value', () => {
    it('should return all asset methods and properties', () => {
      const assets = useAssets()

      expect(assets).toHaveProperty('baseUrl')
      expect(assets).toHaveProperty('getAssetPath')
      expect(assets).toHaveProperty('getMenuAsset')
      expect(assets).toHaveProperty('getSplashAsset')
      expect(assets).toHaveProperty('getSettingsAsset')
      expect(assets).toHaveProperty('getAlphabetAsset')
      expect(assets).toHaveProperty('getPlayersAsset')
      expect(assets).toHaveProperty('preloadImage')
      expect(assets).toHaveProperty('preloadImages')
      expect(typeof assets.getAssetPath).toBe('function')
      expect(typeof assets.getMenuAsset).toBe('function')
      expect(typeof assets.getSplashAsset).toBe('function')
      expect(typeof assets.getSettingsAsset).toBe('function')
      expect(typeof assets.getAlphabetAsset).toBe('function')
      expect(typeof assets.getPlayersAsset).toBe('function')
      expect(typeof assets.preloadImage).toBe('function')
      expect(typeof assets.preloadImages).toBe('function')
    })
  })
})
