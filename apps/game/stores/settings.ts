import { defineStore } from 'pinia'
import { useLogger } from '../composables/useLogger'

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
  fortuneWheelEnabled: false,
}

const STORAGE_KEY = 'game-settings'

export const useSettingsStore = defineStore('settings', {
  state: (): GameSettings => ({ ...DEFAULT_SETTINGS }),

  getters: {
    isDebugMode: (state) => state.debugMode,
    isLeaderboardEnabled: (state) => state.leaderboardEnabled,
    shouldShowLeaderboard: (state) => state.leaderboardEnabled && state.showLeaderboardAfterRound,
    isFortuneWheelEnabled: (state) => state.fortuneWheelEnabled,
  },

  actions: {
    loadSettings() {
      if (typeof window === 'undefined') return

      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          Object.assign(this, { ...DEFAULT_SETTINGS, ...parsed })
        }
      } catch (e) {
        const logger = useLogger()
        logger.warn('Failed to load settings:', e)
      }
    },

    saveSettings() {
      if (typeof window === 'undefined') return

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
      } catch (e) {
        const logger = useLogger()
        logger.warn('Failed to save settings:', e)
      }
    },

    updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
      ;(this.$state as GameSettings)[key] = value
      this.saveSettings()
    },

    toggleDebugMode() {
      this.debugMode = !this.debugMode
      this.saveSettings()
    },

    toggleLeaderboard() {
      this.leaderboardEnabled = !this.leaderboardEnabled
      this.saveSettings()
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled
      this.saveSettings()
    },

    toggleFortuneWheel() {
      this.fortuneWheelEnabled = !this.fortuneWheelEnabled
      this.saveSettings()
    },

    setOfflineMode(enabled: boolean) {
      this.offlineMode = enabled
      this.saveSettings()
    },

    resetToDefaults() {
      Object.assign(this, DEFAULT_SETTINGS)
      this.saveSettings()
    },

    setLanguage(lang: string) {
      this.language = lang
      this.saveSettings()
    },

    getLanguage() {
      return this.language
    },
  },
})
