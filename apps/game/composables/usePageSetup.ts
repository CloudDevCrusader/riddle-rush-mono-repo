/**
 * Common page setup composable
 * Provides commonly used utilities across pages to reduce duplication
 */
export function usePageSetup() {
  const router = useRouter()
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const baseUrl = (config.public as any).baseUrl || ''
  const toast = useToast()

  // Helper function to resolve asset paths correctly
  const getAssetPath = (path: string): string => {
    if (!path) {
      return ''
    }

    // Handle absolute URLs
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // Remove 'assets/' prefix if present
    const cleanPath = path.startsWith('assets/') ? path.substring(7) : path

    // Handle local development (empty baseUrl or '/')
    if (!baseUrl || (baseUrl as unknown) === '/' || (baseUrl as unknown) === '') {
      // For local development, assets are in public folder
      return `/${cleanPath}`
    }

    // For production/deployment, use baseUrl
    // Ensure no double slashes
    const normalizedBaseUrl = (baseUrl as any).endsWith('/')
      ? (baseUrl as any).slice(0, -1)
      : baseUrl
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath
    return `${normalizedBaseUrl}/${normalizedPath}`
  }

  // Common navigation helpers
  const goHome = () => router.push('/')
  const goBack = () => router.back()

  return {
    router,
    t,
    baseUrl,
    getAssetPath,
    toast,
    goHome,
    goBack,
  }
}
