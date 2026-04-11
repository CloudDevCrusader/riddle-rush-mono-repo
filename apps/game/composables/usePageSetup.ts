/**
 * Common page setup composable
 * Provides commonly used utilities across pages to reduce duplication
 */
export function usePageSetup() {
  const router = useRouter()
  const { t } = useI18n()
  const { baseUrl, getAssetPath } = useAssets()
  const toast = useToast()

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
