import { defineStore } from 'pinia'

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  websocketEnabled: boolean
=======
  /** When true, user can spin again and must tap OK. When false, advances to game automatically after spin. */
  fortuneWheelAllowRedraw: boolean
>>>>>>> Stashed changes
=======
  /** When true, user can spin again and must tap OK. When false, advances to game automatically after spin. */
  fortuneWheelAllowRedraw: boolean
>>>>>>> Stashed changes
  answerInputEnabled: boolean
  inputFieldEnabled: boolean
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
  inputFieldEnabled: true,
}

export const useSettingsStore = defineStore('settings', {
  state: (): GameSettings => ({
    ...DEFAULT_SETTINGS,
  }),

  getters: {
    isDebugMode(state): boolean {
      return state.debugMode
    },
    isLeaderboardEnabled(state): boolean {
      return state.leaderboardEnabled
    },
    shouldShowLeaderboard(state): boolean {
      return state.leaderboardEnabled && state.showLeaderboardAfterRound
    },
    isFortuneWheelEnabled(state): boolean {
      return state.fortuneWheelEnabled
    },
    isWebSocketEnabled(state): boolean {
      return state.websocketEnabled
    },
    isAnswerInputEnabled(state): boolean {
      return state.answerInputEnabled
    },
    isInputFieldEnabled(state): boolean {
      return state.inputFieldEnabled
    },
  },

  actions: {
    updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
      this.$patch((state) => {
        state[key] = value
      })
    },
    toggleDebugMode() {
      this.debugMode = !this.debugMode
    },
    toggleLeaderboard() {
      this.leaderboardEnabled = !this.leaderboardEnabled
    },
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
    },
    toggleFortuneWheel() {
      this.fortuneWheelEnabled = !this.fortuneWheelEnabled
    },
    toggleWebSocket() {
      this.websocketEnabled = !this.websocketEnabled
    },
    toggleAnswerInput() {
      this.answerInputEnabled = !this.answerInputEnabled
    },
    toggleInputField() {
      this.inputFieldEnabled = !this.inputFieldEnabled
    },
    setOfflineMode(enabled: boolean) {
      this.offlineMode = enabled
    },
    resetToDefaults() {
      this.$patch(DEFAULT_SETTINGS)
    },
    setLanguage(lang: string) {
      this.language = lang
    },
    getLanguage(): string {
      return this.language
    },
    getState(): GameSettings {
      return this.$state
    },
  },
  persist: true,
})

export const settingsStore = useSettingsStore
