import { ROUTES, getGameRoute, getResultsRoute } from '@riddle-rush/shared/routes'
import { useLoading } from './useLoading'
import { useLodash } from './useLodash'
import type { DebouncedFunc } from './useLodash'

/**
 * Navigation composable
 * Provides type-safe navigation helpers for common routes with loading indicators
 */
export function useNavigation() {
  const router = useRouter()
  const { showLoading, hideLoading, setProgress } = useLoading()
  const { debounce } = useLodash()
  let debouncedNavigate: DebouncedFunc<(route: string, simulateLoading?: boolean) => void> | null =
    null
  let debounceInit: Promise<void> | null = null

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

  const initDebouncedNavigate = async () => {
    if (debouncedNavigate) return
    if (!debounceInit) {
      debounceInit = debounce.then((debounceFunc) => {
        debouncedNavigate = debounceFunc(
          (route: string, simulateLoading = false) => {
            void navigateWithLoading(route, simulateLoading)
          },
          200,
          { leading: true, trailing: false }
        )
      })
    }
    await debounceInit
  }

  const queueNavigation = async (route: string, simulateLoading = false) => {
    try {
      await initDebouncedNavigate()
      if (debouncedNavigate) {
        debouncedNavigate(route, simulateLoading)
        return
      }
    } catch {
      // Fall back to direct navigation when debounce is unavailable.
    }

    await navigateWithLoading(route, simulateLoading)
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
    goToGame: (gameId?: string) =>
      queueNavigation(gameId ? getGameRoute(gameId) : ROUTES.GAME, true),
    goToResults: (gameId?: string) =>
      queueNavigation(gameId ? getResultsRoute(gameId) : ROUTES.RESULTS, true),
    goToLeaderboard: () => queueNavigation(ROUTES.LEADERBOARD, true),
    goToSettings: () => queueNavigation(ROUTES.SETTINGS, true),
    goToLanguage: () => queueNavigation(ROUTES.LANGUAGE, true),
    goToCredits: () => queueNavigation(ROUTES.CREDITS, true),
    goBack,
  }
}
