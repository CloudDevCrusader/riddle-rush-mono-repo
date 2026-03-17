import { computed, ref, onScopeDispose } from '#imports'
import { settingsStore } from '../settingsStore'
import type { GameSettings } from '../settingsStore'

export type { GameSettings }

export function useSettings() {
  const version = ref(0)
  const unsubscribe = settingsStore.subscribe(() => {
    version.value++
  })
  onScopeDispose(() => unsubscribe())

  return {
    // State
    maxPlayersPerGame: computed(() => {
      void version.value
      return settingsStore.getState().maxPlayersPerGame
    }),
    showLeaderboardAfterRound: computed(() => {
      void version.value
      return settingsStore.getState().showLeaderboardAfterRound
    }),
    leaderboardEnabled: computed(() => {
      void version.value
      return settingsStore.getState().leaderboardEnabled
    }),
    debugMode: computed(() => {
      void version.value
      return settingsStore.getState().debugMode
    }),
    soundEnabled: computed(() => {
      void version.value
      return settingsStore.getState().soundEnabled
    }),
    soundVolume: computed(() => {
      void version.value
      return settingsStore.getState().soundVolume
    }),
    musicEnabled: computed(() => {
      void version.value
      return settingsStore.getState().musicEnabled
    }),
    musicVolume: computed(() => {
      void version.value
      return settingsStore.getState().musicVolume
    }),
    offlineMode: computed(() => {
      void version.value
      return settingsStore.getState().offlineMode
    }),
    language: computed(() => {
      void version.value
      return settingsStore.getState().language
    }),
    fortuneWheelEnabled: computed(() => {
      void version.value
      return settingsStore.getState().fortuneWheelEnabled
    }),
    websocketEnabled: computed(() => {
      void version.value
      return settingsStore.getState().websocketEnabled
    }),
    answerInputEnabled: computed(() => {
      void version.value
      return settingsStore.getState().answerInputEnabled
    }),

    // Getters
    isDebugMode: computed(() => {
      void version.value
      return settingsStore.getState().isDebugMode
    }),
    isLeaderboardEnabled: computed(() => {
      void version.value
      return settingsStore.getState().isLeaderboardEnabled
    }),
    shouldShowLeaderboard: computed(() => {
      void version.value
      return settingsStore.getState().shouldShowLeaderboard
    }),
    isFortuneWheelEnabled: computed(() => {
      void version.value
      return settingsStore.getState().isFortuneWheelEnabled
    }),
    isWebSocketEnabled: computed(() => {
      void version.value
      return settingsStore.getState().isWebSocketEnabled
    }),
    isAnswerInputEnabled: computed(() => {
      void version.value
      return settingsStore.getState().isAnswerInputEnabled
    }),

    // Actions
    updateSetting: settingsStore.getState().updateSetting,
    toggleDebugMode: settingsStore.getState().toggleDebugMode,
    toggleLeaderboard: settingsStore.getState().toggleLeaderboard,
    toggleSound: settingsStore.getState().toggleSound,
    toggleFortuneWheel: settingsStore.getState().toggleFortuneWheel,
    toggleWebSocket: settingsStore.getState().toggleWebSocket,
    toggleAnswerInput: settingsStore.getState().toggleAnswerInput,
    setOfflineMode: settingsStore.getState().setOfflineMode,
    resetToDefaults: settingsStore.getState().resetToDefaults,
    setLanguage: settingsStore.getState().setLanguage,
    getLanguage: settingsStore.getState().getLanguage,
  }
}
