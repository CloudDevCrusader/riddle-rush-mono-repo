import { computed } from '#imports'
import { useSettingsStore as settingsStore } from '../settingsStore'

export function useSettings() {
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
    fortuneWheelAllowRedraw: computed(() => store.fortuneWheelAllowRedraw ?? true),
    answerInputEnabled: computed(() => store.answerInputEnabled),

    // Getters
    isDebugMode: computed(() => store.isDebugMode),
    isLeaderboardEnabled: computed(() => store.isLeaderboardEnabled),
    shouldShowLeaderboard: computed(() => store.shouldShowLeaderboard),
    isFortuneWheelEnabled: computed(() => store.isFortuneWheelEnabled),
    isAnswerInputEnabled: computed(() => store.isAnswerInputEnabled),

    // Actions
    updateSetting: store.updateSetting,
    toggleDebugMode: store.toggleDebugMode,
    toggleLeaderboard: store.toggleLeaderboard,
    toggleSound: store.toggleSound,
    toggleFortuneWheel: store.toggleFortuneWheel,
    toggleFortuneWheelAllowRedraw: store.toggleFortuneWheelAllowRedraw,
    toggleAnswerInput: store.toggleAnswerInput,
    setOfflineMode: store.setOfflineMode,
    resetToDefaults: store.resetToDefaults,
    setLanguage: store.setLanguage,
    getLanguage: store.getLanguage,
  }
}
