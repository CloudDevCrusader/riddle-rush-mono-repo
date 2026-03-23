import { gameStore } from '~/stores/gameStore'

export function usePlayerActions() {
  return {
    // Actions (all stable references from the store)
    submitPlayerAnswer: gameStore.getState().submitPlayerAnswer,
    assignPlayerScore: gameStore.getState().assignPlayerScore,
    updatePlayerAvatar: gameStore.getState().updatePlayerAvatar,
    completeRound: gameStore.getState().completeRound,
    startNextRound: gameStore.getState().startNextRound,
    resetPlayerSubmissions: gameStore.getState().resetPlayerSubmissions,
    getPlayerById: gameStore.getState().getPlayerById,
  }
}
