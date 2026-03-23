import { useGameStore } from '~/stores/gameStore'

export function usePlayerActions() {
  const store = useGameStore()

  return {
    // Actions (all stable references from the store)
    submitPlayerAnswer: store.submitPlayerAnswer,
    assignPlayerScore: store.assignPlayerScore,
    updatePlayerAvatar: store.updatePlayerAvatar,
    completeRound: store.completeRound,
    startNextRound: store.startNextRound,
    resetPlayerSubmissions: store.resetPlayerSubmissions,
    getPlayerById: store.getPlayerById,
  }
}
