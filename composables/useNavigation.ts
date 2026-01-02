import { ROUTES } from '~/utils/routes'

/**
 * Navigation composable
 * Provides type-safe navigation helpers for common routes
 */
export function useNavigation() {
  const router = useRouter()

  return {
    goHome: () => router.push(ROUTES.HOME),
    goToPlayers: () => router.push(ROUTES.PLAYERS),
    goToRoundStart: () => router.push(ROUTES.ROUND_START),
    goToGame: () => router.push(ROUTES.GAME),
    goToResults: () => router.push(ROUTES.RESULTS),
    goToLeaderboard: () => router.push(ROUTES.LEADERBOARD),
    goToSettings: () => router.push(ROUTES.SETTINGS),
    goToLanguage: () => router.push(ROUTES.LANGUAGE),
    goToCredits: () => router.push(ROUTES.CREDITS),
    goBack: () => router.back(),
  }
}
