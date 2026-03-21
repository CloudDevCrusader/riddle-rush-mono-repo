import { settingsStore } from '../settingsStore'
import { computed } from '#imports'

export function useSettingsStore() {
  const store = settingsStore()

  return {
    // State
    maxPlayersPerGame: computed(() => store.maxPlayersPerGame),
    showLeaderboardAfterRound: computed(() => store.showLeaderboardAfterRound),
    leaderboardEnabled: computed(() => store.leaderboardEnabled),
    debugMode: computed(() => store.debugMode),
    soundEnabled: computed(() => store.soundEnabled),
    soundVolume: computed(() => store.soundVolume),
    musicEnabled: computed(() => store.musicEnabled),
    musicVolume: computed(() => store.musicVolume),
    offlineMode: computed(() => store.offlineMode),
    language: computed(() => store.language),
    fortuneWheelEnabled: computed(() => store.fortuneWheelEnabled),
    websocketEnabled: computed(() => store.websocketEnabled),
    answerInputEnabled: computed(() => store.answerInputEnabled),

    // Getters
    isDebugMode: computed(() => store.isDebugMode),
    isLeaderboardEnabled: computed(() => store.isLeaderboardEnabled),
    shouldShowLeaderboard: computed(() => store.shouldShowLeaderboard),
    isFortuneWheelEnabled: computed(() => store.isFortuneWheelEnabled),
    isWebSocketEnabled: computed(() => store.isWebSocketEnabled),
    isAnswerInputEnabled: computed(() => store.isAnswerInputEnabled),

    // Actions
    updateSetting: store.updateSetting,
    toggleDebugMode: store.toggleDebugMode,
    toggleLeaderboard: store.toggleLeaderboard,
    toggleSound: store.toggleSound,
    toggleFortuneWheel: store.toggleFortuneWheel,
    toggleWebSocket: store.toggleWebSocket,
    toggleAnswerInput: store.toggleAnswerInput,
    setOfflineMode: store.setOfflineMode,
    resetToDefaults: store.resetToDefaults,
    setLanguage: store.setLanguage,
    getLanguage: store.getLanguage,
  }
}

export type { GameSettings } from '../settingsStore'
