import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GameSettings {
  maxPlayersPerGame: number
  showLeaderboardAfterRound: boolean
  leaderboardEnabled: boolean
  debugMode: boolean
  soundEnabled: boolean
  soundVolume: number
  musicEnabled: boolean
  musicVolume: number
  offlineMode: boolean
  language: string
  fortuneWheelEnabled: boolean
  websocketEnabled: boolean
  answerInputEnabled: boolean
}

const DEFAULT_SETTINGS: GameSettings = {
  maxPlayersPerGame: 4,
  showLeaderboardAfterRound: true,
  leaderboardEnabled: true,
  debugMode: false,
  soundEnabled: true,
  soundVolume: 75,
  musicEnabled: true,
  musicVolume: 75,
  offlineMode: false,
  language: 'de',
  fortuneWheelEnabled: true,
  websocketEnabled: false,
  answerInputEnabled: false,
}

const STORAGE_KEY = 'game-settings'

export const settingsStore = create<
  GameSettings & {
    // Getters
    isDebugMode: boolean
    isLeaderboardEnabled: boolean
    shouldShowLeaderboard: boolean
    isFortuneWheelEnabled: boolean
    isWebSocketEnabled: boolean
    isAnswerInputEnabled: boolean

    // Actions
    updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void
    toggleDebugMode: () => void
    toggleLeaderboard: () => void
    toggleSound: () => void
    toggleFortuneWheel: () => void
    toggleWebSocket: () => void
    toggleAnswerInput: () => void
    setOfflineMode: (enabled: boolean) => void
    resetToDefaults: () => void
    setLanguage: (lang: string) => void
    getLanguage: () => string
  }
>()(
  persist(
    (set, get) => ({
      // State
      ...DEFAULT_SETTINGS,

      // Getters
      get isDebugMode() {
        return get().debugMode
      },
      get isLeaderboardEnabled() {
        return get().leaderboardEnabled
      },
      get shouldShowLeaderboard() {
        return get().leaderboardEnabled && get().showLeaderboardAfterRound
      },
      get isFortuneWheelEnabled() {
        return get().fortuneWheelEnabled
      },
      get isWebSocketEnabled() {
        return get().websocketEnabled
      },
      get isAnswerInputEnabled() {
        return get().answerInputEnabled
      },

      // Actions
      updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        set({ [key]: value } as unknown as Partial<GameSettings>)
      },

      toggleDebugMode: () => {
        set({ debugMode: !get().debugMode })
      },

      toggleLeaderboard: () => {
        set({ leaderboardEnabled: !get().leaderboardEnabled })
      },

      toggleSound: () => {
        set({ soundEnabled: !get().soundEnabled })
      },

      toggleFortuneWheel: () => {
        set({ fortuneWheelEnabled: !get().fortuneWheelEnabled })
      },

      toggleWebSocket: () => {
        set({ websocketEnabled: !get().websocketEnabled })
      },

      toggleAnswerInput: () => {
        set({ answerInputEnabled: !get().answerInputEnabled })
      },

      setOfflineMode: (enabled: boolean) => {
        set({ offlineMode: enabled })
      },

      resetToDefaults: () => {
        set(DEFAULT_SETTINGS)
      },

      setLanguage: (lang: string) => {
        set({ language: lang })
      },

      getLanguage: () => {
        return get().language
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        maxPlayersPerGame: state.maxPlayersPerGame,
        showLeaderboardAfterRound: state.showLeaderboardAfterRound,
        leaderboardEnabled: state.leaderboardEnabled,
        debugMode: state.debugMode,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        musicEnabled: state.musicEnabled,
        musicVolume: state.musicVolume,
        offlineMode: state.offlineMode,
        language: state.language,
        fortuneWheelEnabled: state.fortuneWheelEnabled,
        websocketEnabled: state.websocketEnabled,
        answerInputEnabled: state.answerInputEnabled,
      }),
    }
  )
)
