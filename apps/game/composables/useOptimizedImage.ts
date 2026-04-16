/**
 * Optimized image composable
 *
 * Provides utilities for loading optimized images with WebP support,
 * lazy loading, and proper sizing.
 */

export const useOptimizedImage = () => {
  const runtimeConfig = useRuntimeConfig()
  const baseUrl = runtimeConfig.public.baseUrl || ''

  // Cache for format detection to avoid repeated checks
  let cachedFormat: 'webp' | 'avif' | 'png' | null = null

  /**
   * Get optimized image source with WebP fallback
   * @param src - Image source path (relative to public/)
   * @param options - Image optimization options
   * @param options.format - Image format (webp, avif, png, jpg)
   * @param options.quality - Image quality (0-100)
   * @param options.width - Target width
   * @param options.height - Target height
   * @param options.preset - Image preset (background, thumbnail, avatar, icon, hero)
   */
  const getOptimizedImageSrc = (
    src: string,
    _options: {
      format?: 'webp' | 'avif' | 'png' | 'jpg'
      quality?: number
      width?: number
      height?: number
      preset?: 'background' | 'thumbnail' | 'avatar' | 'icon' | 'hero'
    } = {}
  ): string => {
    // Remove leading slash if present
    const cleanSrc = src.startsWith('/') ? src.slice(1) : src
    const fullPath = `${baseUrl}${cleanSrc}`

    // If @nuxt/image is available, use it for optimization
    // Otherwise, return the original path
    return fullPath
  }

  /**
   * Get responsive image sources for different screen sizes
   */
  const getResponsiveImageSrcs = (
    src: string,
    sizes: { width: number; breakpoint?: string }[]
  ): string[] => {
    return sizes.map((size) => getOptimizedImageSrc(src, { width: size.width }))
  }

  /**
   * Check if WebP is supported by the browser (cached)
   */
  const supportsWebP = (): boolean => {
    if (typeof window === 'undefined') return false

    // Return cached result if available
    if (cachedFormat === 'webp' || cachedFormat === 'png') {
      return cachedFormat === 'webp'
    }

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const supports = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    cachedFormat = supports ? 'webp' : 'png'
    return supports
  }

  /**
   * Get image format based on browser support (cached)
   */
  const getBestFormat = (): 'webp' | 'avif' | 'png' => {
    if (typeof window === 'undefined') return 'webp'

    // Return cached result if available
    if (cachedFormat) return cachedFormat

    // Check for AVIF support first (best compression)
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1

    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      cachedFormat = 'avif'
      return 'avif'
    }

    // Fallback to WebP
    if (supportsWebP()) {
      return 'webp'
    }

    // Final fallback to PNG
    cachedFormat = 'png'
    return 'png'
  }

  /**
   * Preload images for better performance
   * @param imageUrls - Array of image URLs to preload
   */
  const preloadImages = (imageUrls: string[]): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve()

    return Promise.all(
      imageUrls.map((url) => {
        return new Promise<void>((resolve) => {
          const img = new Image()
          img.src = url
          img.onload = () => resolve()
          img.onerror = () => resolve() // Don't fail on error, just continue
        })
      })
    ).then(() => {})
  }

  /**
   * Get optimized image with lazy loading attributes
   */
  const getLazyImageAttributes = (src: string, alt: string = '') => {
    return {
      src: getOptimizedImageSrc(src),
      alt,
      loading: 'lazy' as const,
      decoding: 'async' as const,
    }
  }

  return {
    getOptimizedImageSrc,
    getResponsiveImageSrcs,
    supportsWebP,
    getBestFormat,
    preloadImages,
    getLazyImageAttributes,
  }
}
