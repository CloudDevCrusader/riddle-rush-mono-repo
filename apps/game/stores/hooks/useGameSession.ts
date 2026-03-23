import { computed, ref, onScopeDispose } from '#imports'
import { gameStore } from '~/stores/gameStore'
import { usePlayerManager } from '~/composables/usePlayerManager'

export function useGameSession() {
  const playerManager = usePlayerManager()
  const version = ref(0)
  const unsubscribe = gameStore.subscribe(() => {
    version.value++
  })
  onScopeDispose(() => unsubscribe())

  return {
    // State
    currentSession: computed(() => {
      void version.value
      return gameStore.getState().currentSession
    }),
    history: computed(() => {
      void version.value
      return gameStore.getState().history
    }),
    isOnline: computed(() => {
      void version.value
      return gameStore.getState().isOnline
    }),
    pendingPlayerNames: computed(() => {
      void version.value
      return gameStore.getState().pendingPlayerNames
    }),
    selectedLetter: computed(() => {
      void version.value
      return gameStore.getState().selectedLetter
    }),

    // Getters
    hasActiveSession: computed(() => {
      void version.value
      return gameStore.getState().hasActiveSession()
    }),
    isGameCompleted: computed(() => {
      void version.value
      return gameStore.getState().isGameCompleted()
    }),
    gameStatus: computed(() => {
      void version.value
      return gameStore.getState().gameStatus()
    }),
    currentRound: computed(() => {
      void version.value
      return gameStore.getState().currentSession?.currentRound ?? 0
    }),
    postRoundDecisionPending: computed(() => {
      void version.value
      return gameStore.getState().postRoundDecisionPending
    }),
    gameMode: computed(() => {
      void version.value
      return gameStore.getState().gameMode()
    }),
    isCurrentRoundCompleted: computed(() => {
      void version.value
      return gameStore.getState().isCurrentRoundCompleted()
    }),
    nextRoundNumber: computed(() => {
      void version.value
      return gameStore.getState().nextRoundNumber()
    }),
    flowState: computed(() => {
      void version.value
      return gameStore.getState().flowState()
    }),
    currentCategory: computed(() => {
      void version.value
      return gameStore.getState().currentSession?.category ?? null
    }),
    currentLetter: computed(() => {
      void version.value
      return gameStore.getState().currentSession?.letter ?? ''
    }),
    players: computed(() => {
      void version.value
      return gameStore.getState().currentSession?.players ?? []
    }),
    currentPlayerTurn: computed(() => {
      void version.value
      const session = gameStore.getState().currentSession
      const players = session?.players ?? []
      const currentPlayerIndex = session?.currentPlayerIndex ?? 0
      return playerManager.getCurrentPlayerTurn(players, currentPlayerIndex)
    }),
    allPlayersSubmitted: computed(() => {
      void version.value
      const players = gameStore.getState().currentSession?.players ?? []
      return playerManager.allPlayersSubmitted(players)
    }),
    leaderboard: computed(() => {
      void version.value
      const session = gameStore.getState().currentSession
      const players = session?.players ?? []
      const isCompleted = session?.status === 'completed'
      return playerManager.buildLeaderboard(players, isCompleted)
    }),

    // Actions (stable references -- no computed needed)
    resumeOrStartNewGame: gameStore.getState().resumeOrStartNewGame,
    startNewGame: gameStore.getState().startNewGame,
    endGame: gameStore.getState().endGame,
    completeGame: gameStore.getState().completeGame,
    abandonGame: gameStore.getState().abandonGame,
    clearSession: gameStore.getState().clearSession,
    loadFromDB: gameStore.getState().loadFromDB,
    saveSessionToDB: gameStore.getState().saveSessionToDB,
    saveHistoryToDB: gameStore.getState().saveHistoryToDB,
    loadSessionById: gameStore.getState().loadSessionById,
    setupPlayers: gameStore.getState().setupPlayers,
    advanceToConfiguredRound: gameStore.getState().advanceToConfiguredRound,
    generateLetter: gameStore.getState().generateLetter,
    setOnlineStatus: gameStore.getState().setOnlineStatus,
    setPendingPlayerNames: gameStore.getState().setPendingPlayerNames,
  }
}
