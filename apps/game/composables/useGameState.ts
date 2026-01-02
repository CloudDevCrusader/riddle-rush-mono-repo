/**
 * Game state composable
 * Provides centralized access to commonly used game store computeds
 * Reduces duplication across pages
 */
export function useGameState() {
  const gameStore = useGameStore()

  // Common computeds from game store
  const currentCategory = computed(() => gameStore.currentCategory)
  const currentLetter = computed(() => gameStore.currentLetter)
  const currentRound = computed(() => gameStore.currentRound)
  const players = computed(() => gameStore.players)
  const currentPlayerTurn = computed(() => gameStore.currentPlayerTurn)
  const allPlayersSubmitted = computed(() => gameStore.allPlayersSubmitted)
  const isGameCompleted = computed(() => gameStore.isGameCompleted)
  const leaderboard = computed(() => gameStore.leaderboard)
  const hasActiveSession = computed(() => gameStore.hasActiveSession)
  const gameStatus = computed(() => gameStore.gameStatus)

  return {
    gameStore,
    currentCategory,
    currentLetter,
    currentRound,
    players,
    currentPlayerTurn,
    allPlayersSubmitted,
    isGameCompleted,
    leaderboard,
    hasActiveSession,
    gameStatus,
  }
}
