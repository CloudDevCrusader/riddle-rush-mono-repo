/**
 * Game state composable
 * Provides centralized access to commonly used game state computeds
 * Reduces duplication across pages
 */
export function useGameState() {
  const gameSession = useGameSession()
  const settings = useSettings()

  return {
    gameSession,
    settings,
    // Spread commonly used game session computeds for convenience
    currentCategory: gameSession.currentCategory,
    currentLetter: gameSession.currentLetter,
    currentRound: gameSession.currentRound,
    players: gameSession.players,
    currentPlayerTurn: gameSession.currentPlayerTurn,
    allPlayersSubmitted: gameSession.allPlayersSubmitted,
    isGameCompleted: gameSession.isGameCompleted,
    leaderboard: gameSession.leaderboard,
    hasActiveSession: gameSession.hasActiveSession,
    gameStatus: gameSession.gameStatus,
  }
}
