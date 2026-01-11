/**
 * Composable for managing asset paths
 * Handles baseURL and asset organization
 */
export function useAssets() {
  const {
    public: { baseUrl },
  } = useRuntimeConfig()

  /**
   * Get asset path with baseURL prefix
   */
  const getAssetPath = (path: string): string => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${baseUrl}${cleanPath}`
  }

  /**
   * Get menu asset path
   */
  const getMenuAsset = (filename: string): string => {
    return getAssetPath(`assets/main-menu/${filename}`)
  }

  /**
   * Get game asset path
   */
  const getGameAsset = (filename: string): string => {
    return getAssetPath(`assets/game/${filename}`)
  }

  /**
   * Get settings asset path
   */
  const getSettingsAsset = (filename: string): string => {
    return getAssetPath(`assets/settings/${filename}`)
  }

  /**
   * Get icon asset path
   */
  const getIconAsset = (filename: string): string => {
    return getAssetPath(`assets/icons/${filename}`)
  }

  /**
   * Preload image for better performance
   */
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }

  /**
   * Preload multiple images
   */
  const preloadImages = async (paths: string[]): Promise<void> => {
    await Promise.all(paths.map(preloadImage))
  }

  return {
    baseUrl,
    getAssetPath,
    getMenuAsset,
    getGameAsset,
    getSettingsAsset,
    getIconAsset,
    preloadImage,
    preloadImages,
  }
}
