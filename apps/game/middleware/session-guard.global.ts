import { gameStore } from '~/stores/gameStore'

const getRouteGameId = (to: { params?: Record<string, unknown>; path: string }) => {
  const fromParam = to.params?.gameId
  if (typeof fromParam === 'string' && fromParam.length > 0) {
    return fromParam
  }

  const pathMatch = to.path.match(/^\/(game|results)\/([^/?#]+)/)
  return pathMatch?.[2] ?? null
}

const isGuardedRoute = (path: string) => path.startsWith('/game') || path.startsWith('/results')

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client || !isGuardedRoute(to.path)) {
    return
  }

  const state = gameStore.getState()
  const routeGameId = getRouteGameId(to)

  // Always hydrate persisted session first to make route boundary canonical.
  await state.loadFromDB()

  let session = gameStore.getState().currentSession

  if (routeGameId) {
    const loaded = await gameStore.getState().loadSessionById(routeGameId)
    // Route id is authoritative on id-based routes.
    // Never keep a stale in-memory session if the requested id cannot be loaded.
    session = loaded ?? null
  }

  const pending = gameStore.getState().pendingPlayerNames

  // If players are pending and current session is not a multiplayer round,
  // force canonical bootstrap through round-start.
  if (pending.length > 0 && (!session || (session.players?.length ?? 0) === 0)) {
    return navigateTo('/round-start')
  }

  if (!session) {
    return navigateTo('/players')
  }

  const canonicalGamePath = `/game/${session.id}`
  const canonicalResultsPath = `/results/${session.id}`

  if (to.path.startsWith('/game') && to.path !== canonicalGamePath) {
    return navigateTo(canonicalGamePath)
  }

  if (to.path.startsWith('/results') && to.path !== canonicalResultsPath) {
    return navigateTo(canonicalResultsPath)
  }
})
