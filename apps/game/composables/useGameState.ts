/**
 * Game state composable
 * Provides centralized access to commonly used game store computeds
 * Reduces duplication across pages
 */

export function useGameState() {
  const gameSession = useGameSession()
  const settingsHook = useSettings()
  const categories = useCategories()
  const playerActions = usePlayerActions()
  const gameActions = useGameActions()

  // Return combined API with all actions for backward compatibility
  // gameState now provides ALL actions from all hooks
  const gameState = {
    ...gameSession,
    ...categories,
    ...playerActions,
    ...gameActions,
  }

  // Maintain backward compatibility by also exposing gameStore alias
  const gameStore = gameState
  const settingsStore = settingsHook

  // Convenience: destructured common computed refs
  const currentCategory = gameSession.currentCategory
  const currentLetter = gameSession.currentLetter
  const currentRound = gameSession.currentRound
  const nextRoundNumber = gameSession.nextRoundNumber
  const gameMode = gameSession.gameMode
  const flowState = gameSession.flowState
  const canProceedToResults = computed(() => {
    const hasMultiplayerPlayers = gameSession.players.value.length > 0
    if (!hasMultiplayerPlayers) return true

    // Game -> results transition is allowed once all players submitted answers.
    if (gameSession.allPlayersSubmitted.value) return true

    return (
      gameSession.flowState.value === 'round-complete' || gameSession.flowState.value === 'decision'
    )
  })

  const canConfirmRoundScores = computed(() => gameSession.flowState.value === 'in-round')

  return {
    // Backward compatibility: return hooks as "store" objects
    // gameState now provides ALL actions from all hooks
    gameState,
    gameStore,
    settingsStore: settingsHook,

    // Convenience: destructured common computed refs
    currentCategory,
    currentLetter,
    currentRound,
    nextRoundNumber,
    gameMode,
    flowState,
    canProceedToResults,
    canConfirmRoundScores,
    isCurrentRoundCompleted: gameSession.isCurrentRoundCompleted,
    postRoundDecisionPending: gameSession.postRoundDecisionPending,
    players: gameSession.players,
    currentPlayerTurn: gameSession.currentPlayerTurn,
    allPlayersSubmitted: gameSession.allPlayersSubmitted,
    isGameCompleted: gameSession.isGameCompleted,
    leaderboard: gameSession.leaderboard,
    hasActiveSession: gameSession.hasActiveSession,
    gameStatus: gameSession.gameStatus,
  }
}
