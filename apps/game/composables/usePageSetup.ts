/**
 * Common page setup composable
 * Provides commonly used utilities across pages to reduce duplication
 */
export function usePageSetup() {
  const router = useRouter()
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const rawBaseUrl = (config.public as any).baseUrl || ''

  const baseUrl = (() => {
    const value = String(rawBaseUrl || '').trim()
    if (!value) return '/'

    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value.endsWith('/') ? value : `${value}/`
    }

    const withLeadingSlash = value.startsWith('/') ? value : `/${value}`
    return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
  })()
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
    if (!rawBaseUrl || (rawBaseUrl as unknown) === '/' || (rawBaseUrl as unknown) === '') {
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
  const goBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back()
    } else {
      // Fallback to home if no history available
      router.push('/')
    }
  }

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
