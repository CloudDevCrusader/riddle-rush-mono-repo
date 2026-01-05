/**
 * Loading state composable
 * Provides global loading state management with progress tracking
 */
export function useLoading() {
  const isLoading = ref(false)
  const loadingCount = ref(0)
  const progress = ref(0)
  const showProgress = ref(false)

  const showLoading = () => {
    loadingCount.value++
    isLoading.value = true
    progress.value = 0
    showProgress.value = false
  }

  const hideLoading = () => {
    loadingCount.value--
    if (loadingCount.value <= 0) {
      loadingCount.value = 0
      isLoading.value = false
      progress.value = 0
      showProgress.value = false
    }
  }

  const setProgress = (value: number) => {
    progress.value = Math.min(100, Math.max(0, value))
    showProgress.value = true
  }

  return {
    isLoading,
    progress,
    showProgress,
    showLoading,
    hideLoading,
    setProgress,
  }
}
