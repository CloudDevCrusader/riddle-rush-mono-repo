import { ROUTES, getGameRoute, getResultsRoute } from '@riddle-rush/shared/routes';

/**
 * Navigation composable
 * Type-safe helpers for common routes. Uses client-side router only (no full
 * document reload). Avoids the global splash overlay here so route changes feel
 * like SPA content swaps; use `useLoading` directly when a long operation needs it.
 */
export function useNavigation() {
  const router = useRouter();
  const logger = useLogger();

  /**
   * Serialize navigations so rapid taps don't interleave, and callers can
   * `await` until the route transition has finished (unlike a debounced
   * fire-and-forget).
   */
  let navigationChain: Promise<void> = Promise.resolve();

  const queueNavigation = (route: string): Promise<void> => {
    navigationChain = navigationChain
      .then(() => {
        logger.debug(`Navigating to: ${route}`);
        router.push(route);
      })
      .catch((err) => {
        logger.error(`Navigation to "${route}" failed`, err, { targetRoute: route });
      });
    return navigationChain;
  };

  const goBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to home if no history available
      void queueNavigation(ROUTES.HOME);
    }
  };

  return {
    goHome: () => queueNavigation(ROUTES.HOME),
    goToPlayers: () => queueNavigation(ROUTES.PLAYERS),
    goToRoundStart: () => queueNavigation(ROUTES.ROUND_START),
    goToGame: (gameId?: string) => queueNavigation(gameId ? getGameRoute(gameId) : '/game'),
    goToResults: (gameId?: string) =>
      queueNavigation(gameId ? getResultsRoute(gameId) : '/results'),
    goToLeaderboard: () => queueNavigation(ROUTES.LEADERBOARD),
    goToSettings: () => queueNavigation(ROUTES.SETTINGS),
    goToLanguage: () => queueNavigation(ROUTES.LANGUAGE),
    goToCredits: () => queueNavigation(ROUTES.CREDITS),
    goBack,
  };
}
