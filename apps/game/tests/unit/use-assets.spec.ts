import { describe, it, expect, beforeEach, vi } from 'vitest'

// Create a mock for useRuntimeConfig BEFORE any modules import it
const mockUseRuntimeConfig = vi.fn(() => ({
  public: {
    baseUrl: '/test-base/',
  },
}))

// Make useRuntimeConfig globally available for auto-import in the composable
;(globalThis as any).useRuntimeConfig = mockUseRuntimeConfig

// Mock useRuntimeConfig from #app
vi.mock('#app', () => ({
  useRuntimeConfig: mockUseRuntimeConfig,
}))

const { useAssets } = await import('../../composables/useAssets')

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

  describe('getGameAsset', () => {
    it('should return game asset path', () => {
      const assets = useAssets()

      const result = assets.getGameAsset('character.png')

      expect(result).toBe('/test-base/assets/game/character.png')
    })

    it('should handle different game asset filenames', () => {
      const assets = useAssets()

      expect(assets.getGameAsset('tile.png')).toBe('/test-base/assets/game/tile.png')
      expect(assets.getGameAsset('sprite.gif')).toBe('/test-base/assets/game/sprite.gif')
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

      expect(assets.getSettingsAsset('slider.png')).toBe(
        '/test-base/assets/settings/slider.png'
      )
      expect(assets.getSettingsAsset('toggle.svg')).toBe(
        '/test-base/assets/settings/toggle.svg'
      )
    })
  })

  describe('getIconAsset', () => {
    it('should return icon asset path', () => {
      const assets = useAssets()

      const result = assets.getIconAsset('star.svg')

      expect(result).toBe('/test-base/assets/icons/star.svg')
    })

    it('should handle different icon asset filenames', () => {
      const assets = useAssets()

      expect(assets.getIconAsset('heart.svg')).toBe('/test-base/assets/icons/heart.svg')
      expect(assets.getIconAsset('trophy.png')).toBe('/test-base/assets/icons/trophy.png')
    })
  })

  describe('preloadImage', () => {
    it('should resolve when image loads successfully', async () => {
      const assets = useAssets()

      // Mock Image constructor
      const mockImage = {
        src: '',
        onload: null as (() => void) | null,
        onerror: null as ((error: Error) => void) | null,
      }

      global.Image = vi.fn(() => mockImage) as any

      const promise = assets.preloadImage('/test/image.png')

      // Simulate successful load
      mockImage.onload?.()

      await expect(promise).resolves.toBeUndefined()
      expect(mockImage.src).toBe('/test/image.png')
    })

    it('should reject when image fails to load', async () => {
      const assets = useAssets()

      const mockImage = {
        src: '',
        onload: null as (() => void) | null,
        onerror: null as ((error: Error) => void) | null,
      }

      global.Image = vi.fn(() => mockImage) as any

      const promise = assets.preloadImage('/test/broken.png')

      // Simulate load error
      const error = new Error('Load failed')
      mockImage.onerror?.(error)

      await expect(promise).rejects.toThrow('Load failed')
    })
  })

  describe('preloadImages', () => {
    it('should preload multiple images successfully', async () => {
      const assets = useAssets()

      const mockImages: Array<{ src: string; onload: (() => void) | null; onerror: ((error: Error) => void) | null }> = []
      global.Image = vi.fn(() => {
        const img = {
          src: '',
          onload: null as (() => void) | null,
          onerror: null as ((error: Error) => void) | null,
        }
        mockImages.push(img)
        return img
      }) as any

      const paths = ['/image1.png', '/image2.png', '/image3.png']
      const promise = assets.preloadImages(paths)

      // Simulate all images loading
      mockImages.forEach((img) => img.onload?.())

      await expect(promise).resolves.toBeUndefined()
      expect(mockImages).toHaveLength(3)
      expect(mockImages[0].src).toBe('/image1.png')
      expect(mockImages[1].src).toBe('/image2.png')
      expect(mockImages[2].src).toBe('/image3.png')
    })

    it('should reject if any image fails to load', async () => {
      const assets = useAssets()

      const mockImages: Array<{ src: string; onload: (() => void) | null; onerror: ((error: Error) => void) | null }> = []
      global.Image = vi.fn(() => {
        const img = {
          src: '',
          onload: null as (() => void) | null,
          onerror: null as ((error: Error) => void) | null,
        }
        mockImages.push(img)
        return img
      }) as any

      const paths = ['/image1.png', '/image2.png', '/image3.png']
      const promise = assets.preloadImages(paths)

      // Simulate first two loading, third failing
      mockImages[0].onload?.()
      mockImages[1].onload?.()
      const error = new Error('Load failed')
      mockImages[2].onerror?.(error)

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
      expect(assets).toHaveProperty('getGameAsset')
      expect(assets).toHaveProperty('getSettingsAsset')
      expect(assets).toHaveProperty('getIconAsset')
      expect(assets).toHaveProperty('preloadImage')
      expect(assets).toHaveProperty('preloadImages')
      expect(typeof assets.getAssetPath).toBe('function')
      expect(typeof assets.getMenuAsset).toBe('function')
      expect(typeof assets.getGameAsset).toBe('function')
      expect(typeof assets.getSettingsAsset).toBe('function')
      expect(typeof assets.getIconAsset).toBe('function')
      expect(typeof assets.preloadImage).toBe('function')
      expect(typeof assets.preloadImages).toBe('function')
    })
  })
})
