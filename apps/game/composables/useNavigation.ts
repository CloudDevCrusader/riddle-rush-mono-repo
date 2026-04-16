import { ROUTES, getGameRoute, getResultsRoute } from '@riddle-rush/shared/routes'

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

        await router.push(route)

        setProgress(100)
        await new Promise((resolve) => setTimeout(resolve, 250))
      } else {
        await router.push(route)
      }
    } finally {
      hideLoading()
    }
  }

  /**
   * Serialize navigations so rapid taps don't interleave, and callers can
   * `await` until the route transition has finished (unlike a debounced
   * fire-and-forget).
   */
  let navigationChain: Promise<void> = Promise.resolve()

  const queueNavigation = (route: string, simulateLoading = false): Promise<void> => {
    navigationChain = navigationChain
      .then(() => navigateWithLoading(route, simulateLoading))
      .catch(() => {})
    return navigationChain
  }

  const goBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back()
    } else {
      // Fallback to home if no history available
      void queueNavigation(ROUTES.HOME, true)
    }
  }

  return {
    goHome: () => queueNavigation(ROUTES.HOME, true),
    goToPlayers: () => queueNavigation(ROUTES.PLAYERS, true),
    goToRoundStart: () => queueNavigation(ROUTES.ROUND_START, true),
    goToGame: (gameId?: string) => queueNavigation(gameId ? getGameRoute(gameId) : '/game', true),
    goToResults: (gameId?: string) =>
      queueNavigation(gameId ? getResultsRoute(gameId) : '/results', true),
    goToLeaderboard: () => queueNavigation(ROUTES.LEADERBOARD, true),
    goToSettings: () => queueNavigation(ROUTES.SETTINGS, true),
    goToLanguage: () => queueNavigation(ROUTES.LANGUAGE, true),
    goToCredits: () => queueNavigation(ROUTES.CREDITS, true),
    goBack,
  }
}
