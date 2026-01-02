/**
 * Common page setup composable
 * Provides commonly used utilities across pages to reduce duplication
 */
export function usePageSetup() {
  const router = useRouter()
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl
  const toast = useToast()

  // Common navigation helpers
  const goHome = () => router.push('/')
  const goBack = () => router.back()

  return {
    router,
    t,
    baseUrl,
    toast,
    goHome,
    goBack,
  }
}
