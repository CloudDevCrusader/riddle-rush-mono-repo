import { ROUTES, getGameRoute, getResultsRoute } from '@riddle-rush/shared/routes'
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
        await new Promise((resolve) => setTimeout(resolve, 300))
        setProgress(70)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      await router.push(route)
    } finally {
      hideLoading()
    }
  }

  const goBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back()
    } else {
      // Fallback to home if no history available
      navigateWithLoading(ROUTES.HOME, true)
    }
  }

  return {
    goHome: () => navigateWithLoading(ROUTES.HOME, true),
    goToPlayers: () => navigateWithLoading(ROUTES.PLAYERS, true),
    goToRoundStart: () => navigateWithLoading(ROUTES.ROUND_START, true),
    goToGame: (gameId?: string) =>
      navigateWithLoading(gameId ? getGameRoute(gameId) : ROUTES.GAME, true),
    goToResults: (gameId?: string) =>
      navigateWithLoading(gameId ? getResultsRoute(gameId) : ROUTES.RESULTS, true),
    goToLeaderboard: () => navigateWithLoading(ROUTES.LEADERBOARD, true),
    goToSettings: () => navigateWithLoading(ROUTES.SETTINGS, true),
    goToLanguage: () => navigateWithLoading(ROUTES.LANGUAGE, true),
    goToCredits: () => navigateWithLoading(ROUTES.CREDITS, true),
    goBack,
  }
}
