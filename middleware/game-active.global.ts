// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (import.meta.server) return

  const gameStore = useGameStore()

  // Pages that require an active game session
  // Note: /alphabet is NOT protected - players select letter BEFORE creating session
  const protectedPages = ['/game']

  // Check if current route requires active game
  const requiresActiveGame = protectedPages.some((page) => to.path.startsWith(page))

  if (requiresActiveGame && !gameStore.hasActiveSession) {
    // Redirect to home page with query param to show message
    return navigateTo({
      path: '/',
      query: { needsGame: 'true' },
    })
  }
})
