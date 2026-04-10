import { useGameStore } from '~/stores/gameStore'
import { useLoadingStore } from '~/stores/loadingStore'

const getRouteGameId = (to: { params?: Record<string, unknown>; path: string }) => {
  const fromParam = to.params?.gameId
  if (typeof fromParam === 'string' && fromParam.length > 0) {
    return fromParam
  }

  const pathMatch = to.path.match(/^\/(game|results)\/([^/?#]+)/)
  return pathMatch?.[2] ?? null
}

const isGuardedRoute = (path: string) => path.startsWith('/game') || path.startsWith('/results')

/**
 * Force-hide loading before redirecting away from the guarded route.
 * Middleware redirects bypass useNavigation's hideLoading, leaving the
 * reference count unbalanced.  Calling forceHide() here resets it.
 */
const redirectSafe = (path: string) => {
  const loading = useLoadingStore()
  loading.forceHide()
  return navigateTo(path)
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client || !isGuardedRoute(to.path)) {
    return
  }

  const store = useGameStore()
  const routeGameId = getRouteGameId(to)

  let session = store.currentSession

  if (!session || (routeGameId && session.id !== routeGameId)) {
    await store.loadFromDB()
    session = store.currentSession
  }

  if (routeGameId && (!session || session.id !== routeGameId)) {
    const loaded = await store.loadSessionById(routeGameId)
    session = loaded ?? null
  }

  const pending = store.pendingPlayerNames

  if (pending.length > 0 && (!session || (session.players?.length ?? 0) === 0)) {
    return redirectSafe('/round-start')
  }

  if (!session) {
    return redirectSafe('/players')
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
