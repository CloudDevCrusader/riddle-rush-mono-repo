import { computed, ref, onScopeDispose } from '#imports'
import { gameStore } from '../gameStore'

export function useGameSession() {
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
      return gameStore.getState().hasActiveSession
    }),
    isGameCompleted: computed(() => {
      void version.value
      return gameStore.getState().isGameCompleted
    }),
    gameStatus: computed(() => {
      void version.value
      return gameStore.getState().gameStatus
    }),
    currentRound: computed(() => {
      void version.value
      return gameStore.getState().currentRound
    }),
    currentCategory: computed(() => {
      void version.value
      return gameStore.getState().currentCategory
    }),
    currentLetter: computed(() => {
      void version.value
      return gameStore.getState().currentLetter
    }),
    players: computed(() => {
      void version.value
      return gameStore.getState().players
    }),
    currentPlayerTurn: computed(() => {
      void version.value
      return gameStore.getState().currentPlayerTurn
    }),
    allPlayersSubmitted: computed(() => {
      void version.value
      return gameStore.getState().allPlayersSubmitted
    }),
    leaderboard: computed(() => {
      void version.value
      return gameStore.getState().leaderboard
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
    generateLetter: gameStore.getState().generateLetter,
  }
}
