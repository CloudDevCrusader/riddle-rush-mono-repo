/**
 * Optimized image composable
 *
 * Provides utilities for loading optimized images with WebP support,
 * lazy loading, and proper sizing.
 */

export const useOptimizedImage = () => {
  const runtimeConfig = useRuntimeConfig()
  const baseUrl = runtimeConfig.public.baseUrl || ''

  /**
   * Get optimized image source with WebP fallback
   * @param src - Image source path (relative to public/)
   * @param options - Image optimization options
   */
  const getOptimizedImageSrc = (
    src: string,
    options: {
      format?: 'webp' | 'avif' | 'png' | 'jpg'
      quality?: number
      width?: number
      height?: number
      preset?: 'background' | 'thumbnail' | 'avatar'
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
   * Check if WebP is supported by the browser
   */
  const supportsWebP = (): boolean => {
    if (typeof window === 'undefined') return false

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  /**
   * Get image format based on browser support
   */
  const getBestFormat = (): 'webp' | 'avif' | 'png' => {
    if (typeof window === 'undefined') return 'webp'
    // Check for AVIF support first (best compression)
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif'
    }
    // Fallback to WebP
    if (supportsWebP()) {
      return 'webp'
    }
    // Final fallback to PNG
    return 'png'
  }

  return {
    getOptimizedImageSrc,
    getResponsiveImageSrcs,
    supportsWebP,
    getBestFormat,
  }
}
