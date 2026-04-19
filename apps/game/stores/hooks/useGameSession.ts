import { computed } from '#imports';
import { useGameStore } from '~/stores/gameStore';
import { usePlayerManager } from '~/composables/usePlayerManager';

export function useGameSession() {
  const playerManager = usePlayerManager();
  const store = useGameStore();

  return {
    // State
    currentSession: computed(() => store.currentSession),
    history: computed(() => store.history),
    isOnline: computed(() => store.isOnline),
    pendingPlayerNames: computed(() => store.pendingPlayerNames),
    selectedLetter: computed(() => store.selectedLetter),

    // Getters
    hasActiveSession: computed(() => store.hasActiveSession),
    isGameCompleted: computed(() => store.isGameCompleted),
    gameStatus: computed(() => store.gameStatus),
    currentRound: computed(() => store.currentRound),
    postRoundDecisionPending: computed(() => store.postRoundDecisionPending),
    gameMode: computed(() => store.gameMode),
    isCurrentRoundCompleted: computed(() => store.isCurrentRoundCompleted),
    nextRoundNumber: computed(() => store.nextRoundNumber),
    flowState: computed(() => store.flowState),
    currentCategory: computed(() => store.currentCategory),
    currentLetter: computed(() => store.currentLetter),
    players: computed(() => store.players),
    currentPlayerTurn: computed(() => store.currentPlayerTurn),
    allPlayersSubmitted: computed(() => store.allPlayersSubmitted),
    leaderboard: computed(() => store.leaderboard),

    // Actions
    resumeOrStartNewGame: store.resumeOrStartNewGame,
    startNewGame: store.startNewGame,
    endGame: store.endGame,
    completeGame: store.completeGame,
    abandonGame: store.abandonGame,
    clearSession: store.clearSession,
    clearSessionForNewGame: store.clearSessionForNewGame,
    loadFromDB: store.loadFromDB,
    saveSessionToDB: store.saveSessionToDB,
    saveHistoryToDB: store.saveHistoryToDB,
    loadSessionById: store.loadSessionById,
    setupPlayers: store.setupPlayers,
    advanceToConfiguredRound: store.advanceToConfiguredRound,
    generateLetter: store.generateLetter,
    setOnlineStatus: store.setOnlineStatus,
    setPendingPlayerNames: store.setPendingPlayerNames,
  };
}
