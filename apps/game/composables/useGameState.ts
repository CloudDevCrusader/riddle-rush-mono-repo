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

  // Return combined API with all actions for backward compatibility
  const canProceedToResults = computed(() => {
    const hasMultiplayerPlayers = gameSession.players.value.length > 0
    if (!hasMultiplayerPlayers) return true

    return (
      gameSession.flowState.value === 'round-complete' || gameSession.flowState.value === 'decision'
    )
  })

  const canConfirmRoundScores = computed(() => gameSession.flowState.value === 'in-round')

  return {
    // Backward compatibility: return hooks as "store" objects
    // gameStore now provides ALL actions from all hooks
    gameStore: {
      ...gameSession,
      ...categories,
      ...playerActions,
    },
    settingsStore: settingsHook,

    // Convenience: destructured common computed refs
    currentCategory: gameSession.currentCategory,
    currentLetter: gameSession.currentLetter,
    currentRound: gameSession.currentRound,
    nextRoundNumber: gameSession.nextRoundNumber,
    gameMode: gameSession.gameMode,
    flowState: gameSession.flowState,
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
