import { ROUTES } from '@riddle-rush/shared/routes'
import { useLoading } from './useLoading'

/**
 * Navigation composable
 * Provides type-safe navigation helpers for common routes with loading indicators
 */
export function useNavigation() {
  const router = useRouter()
  const { showLoading, hideLoading, setProgress } = useLoading()

  const navigateWithLoading = async (route: string, simulateLoading = false) => {
    try {
      showLoading()

      // Simulate loading for better UX on fast transitions
      if (simulateLoading) {
        setProgress(30)
        await new Promise(resolve => setTimeout(resolve, 300))
        setProgress(70)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      await router.push(route)
    }
    finally {
      hideLoading()
    }
  }

  return {
    goHome: () => navigateWithLoading(ROUTES.HOME, true),
    goToPlayers: () => navigateWithLoading(ROUTES.PLAYERS, true),
    goToRoundStart: () => navigateWithLoading(ROUTES.ROUND_START, true),
    goToGame: () => navigateWithLoading(ROUTES.GAME, true),
    goToResults: () => navigateWithLoading(ROUTES.RESULTS, true),
    goToLeaderboard: () => navigateWithLoading(ROUTES.LEADERBOARD, true),
    goToSettings: () => navigateWithLoading(ROUTES.SETTINGS, true),
    goToLanguage: () => navigateWithLoading(ROUTES.LANGUAGE, true),
    goToCredits: () => navigateWithLoading(ROUTES.CREDITS, true),
    goBack: () => router.back(),
  }
}
