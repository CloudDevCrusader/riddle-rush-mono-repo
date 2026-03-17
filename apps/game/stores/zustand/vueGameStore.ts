import { useGameStore as useZustandGameStore } from './gameStore'
import { computed } from '#imports'

export function useGameStore() {
  const store = useZustandGameStore()

  return {
    // State
    currentSession: computed(() => store.currentSession),
    isOnline: computed(() => store.isOnline),
    installPromptEvent: computed(() => store.installPromptEvent),
    history: computed(() => store.history),
    categories: computed(() => store.categories),
    categoriesLoaded: computed(() => store.categoriesLoaded),
    categoriesLoading: computed(() => store.categoriesLoading),
    displayedCategoryCount: computed(() => store.displayedCategoryCount),
    categoryLoadError: computed(() => store.categoryLoadError),
    selectedLetter: computed(() => store.selectedLetter),
    pendingPlayerNames: computed(() => store.pendingPlayerNames),

    // Getters
    hasActiveSession: computed(() => store.hasActiveSession),
    canInstall: computed(() => store.canInstall),
    currentCategory: computed(() => store.currentCategory),
    currentLetter: computed(() => store.currentLetter),
    displayedCategories: computed(() => store.displayedCategories),
    hasMoreCategories: computed(() => store.hasMoreCategories),
    categoryEmoji: (name?: string | null) => store.categoryEmoji(name),
    players: computed(() => store.players),
    currentRound: computed(() => store.currentRound),
    allPlayersSubmitted: computed(() => store.allPlayersSubmitted),
    currentPlayerTurn: computed(() => store.currentPlayerTurn),
    leaderboard: computed(() => store.leaderboard),
    isGameCompleted: computed(() => store.isGameCompleted),
    gameStatus: computed(() => store.gameStatus),

    // Actions
    fetchCategories: store.fetchCategories,
    loadMoreCategories: store.loadMoreCategories,
    resetDisplayedCategories: store.resetDisplayedCategories,
    getCategoryById: store.getCategoryById,
    getRandomCategory: store.getRandomCategory,
    generateLetter: store.generateLetter,
    resumeOrStartNewGame: store.resumeOrStartNewGame,
    startNewGame: store.startNewGame,
    endGame: store.endGame,
    completeGame: store.completeGame,
    abandonGame: store.abandonGame,
    setOnlineStatus: store.setOnlineStatus,
    setInstallPrompt: store.setInstallPrompt,
    showInstallPrompt: store.showInstallPrompt,
    loadFromDB: store.loadFromDB,
    saveSessionToDB: store.saveSessionToDB,
    saveHistoryToDB: store.saveHistoryToDB,
    loadSessionById: store.loadSessionById,
    clearSession: store.clearSession,
    setupPlayers: store.setupPlayers,
    submitPlayerAnswer: store.submitPlayerAnswer,
    assignPlayerScore: store.assignPlayerScore,
    updatePlayerAvatar: store.updatePlayerAvatar,
    completeRound: store.completeRound,
    startNextRound: store.startNextRound,
    resetPlayerSubmissions: store.resetPlayerSubmissions,
    getPlayerById: store.getPlayerById,
  }
}
