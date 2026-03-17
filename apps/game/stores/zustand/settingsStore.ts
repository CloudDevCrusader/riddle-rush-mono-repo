import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useLogger } from '../../composables/useLogger'

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

export const useSettingsStore = create<
  GameSettings & {
    // Getters
    isDebugMode: boolean
    isLeaderboardEnabled: boolean
    shouldShowLeaderboard: boolean
    isFortuneWheelEnabled: boolean
    isWebSocketEnabled: boolean
    isAnswerInputEnabled: boolean

    // Actions
    loadSettings: () => void
    saveSettings: () => void
    updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void
    toggleDebugMode: () => void
    toggleLeaderboard: () => void
    toggleSound: () => void
    toggleFortuneWheel: () => void
    toggleWebSocket: () => void
    toggleAnswerInput: () => void
    setOfflineMode: (enabled: boolean) => void
    resetToDefaults: () => void
    setLanguage: (lang: string, persist?: boolean) => void
    getLanguage: () => string
    hasStoredSettings: () => boolean
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
      loadSettings: () => {
        if (typeof window === 'undefined') return

        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            set({ ...DEFAULT_SETTINGS, ...parsed })
          }
        } catch (e) {
          const logger = useLogger()
          logger.warn('Failed to load settings:', e)
        }
      },

      saveSettings: () => {
        if (typeof window === 'undefined') return

        try {
          const currentState = get()
          // Extract only the settings properties (not getters/actions)
          const settingsToSave = {
            maxPlayersPerGame: currentState.maxPlayersPerGame,
            showLeaderboardAfterRound: currentState.showLeaderboardAfterRound,
            leaderboardEnabled: currentState.leaderboardEnabled,
            debugMode: currentState.debugMode,
            soundEnabled: currentState.soundEnabled,
            soundVolume: currentState.soundVolume,
            musicEnabled: currentState.musicEnabled,
            musicVolume: currentState.musicVolume,
            offlineMode: currentState.offlineMode,
            language: currentState.language,
            fortuneWheelEnabled: currentState.fortuneWheelEnabled,
            websocketEnabled: currentState.websocketEnabled,
            answerInputEnabled: currentState.answerInputEnabled,
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave))
        } catch (e) {
          const logger = useLogger()
          logger.warn('Failed to save settings:', e)
        }
      },

      updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        set({ [key]: value } as unknown as Partial<GameSettings>)
        get().saveSettings()
      },

      toggleDebugMode: () => {
        const newValue = !get().debugMode
        set({ debugMode: newValue })
        get().saveSettings()
      },

      toggleLeaderboard: () => {
        const newValue = !get().leaderboardEnabled
        set({ leaderboardEnabled: newValue })
        get().saveSettings()
      },

      toggleSound: () => {
        const newValue = !get().soundEnabled
        set({ soundEnabled: newValue })
        get().saveSettings()
      },

      toggleFortuneWheel: () => {
        const newValue = !get().fortuneWheelEnabled
        set({ fortuneWheelEnabled: newValue })
        get().saveSettings()
      },

      toggleWebSocket: () => {
        const newValue = !get().websocketEnabled
        set({ websocketEnabled: newValue })
        get().saveSettings()
      },

      toggleAnswerInput: () => {
        const newValue = !get().answerInputEnabled
        set({ answerInputEnabled: newValue })
        get().saveSettings()
      },

      setOfflineMode: (enabled: boolean) => {
        set({ offlineMode: enabled })
        get().saveSettings()
      },

      resetToDefaults: () => {
        set(DEFAULT_SETTINGS)
        get().saveSettings()
      },

      setLanguage: (lang: string, persist = true) => {
        set({ language: lang })
        if (persist) {
          get().saveSettings()
        }
      },

      getLanguage: () => {
        return get().language
      },

      hasStoredSettings: () => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem(STORAGE_KEY) !== null
      },
    }),
    {
      name: STORAGE_KEY,
      // Disable default persistence since we handle it manually
      // This allows us to control exactly what gets saved
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
