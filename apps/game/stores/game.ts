import { defineStore } from 'pinia'
import { useCategoryEmoji } from '../composables/useCategoryEmoji'
import { useCategoryManager } from '../composables/useCategoryManager'
import { useSessionManager } from '../composables/useSessionManager'
import { usePlayerManager } from '../composables/usePlayerManager'
import { useScoringEngine } from '../composables/useScoringEngine'
import { usePersistence } from '../composables/usePersistence'
import { useGameLifecycle } from '../composables/useGameLifecycle'
import { ALPHABET, DEFAULT_DISPLAYED_CATEGORIES } from '@riddle-rush/shared/constants'
import type {
  GameState,
  Category,
  BeforeInstallPromptEvent,
  Player,
  PlayerWithRank,
} from '@riddle-rush/types/game'

const randomLetter = () => {
  if (!ALPHABET || ALPHABET.length === 0) {
    throw new Error('ALPHABET constant is not defined or empty')
  }
  const index = Math.floor(Math.random() * ALPHABET.length)
  return ALPHABET.charAt(index).toLowerCase()
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    currentSession: null,
    isOnline: true,
    installPromptEvent: null,
    history: [],
    categories: [],
    categoriesLoaded: false,
    categoriesLoading: false,
    displayedCategoryCount: DEFAULT_DISPLAYED_CATEGORIES,
    categoryLoadError: null,
    selectedLetter: null,
    pendingPlayerNames: [],
  }),

  getters: {
    hasActiveSession: (state) => state.currentSession !== null,
    canInstall: (state) => state.installPromptEvent !== null,
    currentCategory: (state) => state.currentSession?.category ?? null,
    currentLetter: (state) => state.currentSession?.letter ?? '',
    displayedCategories: (state) => state.categories.slice(0, state.displayedCategoryCount),
    hasMoreCategories: (state) => state.displayedCategoryCount < state.categories.length,
    categoryEmoji: () => {
      const { resolve } = useCategoryEmoji()
      return (name?: string | null) => resolve(name)
    },

    // Multi-player getters
    players: (state) => state.currentSession?.players ?? [],
    currentRound: (state) => state.currentSession?.currentRound ?? 0,
    allPlayersSubmitted: (state) => {
      const playerManager = usePlayerManager()
      return playerManager.allPlayersSubmitted(state.currentSession?.players ?? [])
    },
    currentPlayerTurn: (state) => {
      const playerManager = usePlayerManager()
      return playerManager.getCurrentPlayerTurn(
        state.currentSession?.players ?? [],
        state.currentSession?.currentPlayerIndex ?? 0
      )
    },
    leaderboard(state): PlayerWithRank[] {
      const playerManager = usePlayerManager()
      const players = state.currentSession?.players ?? []
      const isGameCompleted = state.currentSession?.status === 'completed'
      return playerManager.buildLeaderboard(players, isGameCompleted ?? false)
    },
    isGameCompleted: (state) => state.currentSession?.status === 'completed',
    gameStatus: (state) => state.currentSession?.status ?? 'active',
  },

  actions: {
    // Category actions
    async fetchCategories(force = false) {
      const categoryManager = useCategoryManager()
      return categoryManager.fetchCategories(this, force)
    },
    loadMoreCategories(step = 9) {
      const categoryManager = useCategoryManager()
      categoryManager.loadMoreCategories(this, step)
    },
    resetDisplayedCategories(count = 9) {
      const categoryManager = useCategoryManager()
      categoryManager.resetDisplayedCategories(this, count)
    },
    getCategoryById(categoryId: number): Category | null {
      const categoryManager = useCategoryManager()
      return categoryManager.getCategoryById(this.categories, categoryId)
    },
    getRandomCategory(): Category | null {
      const categoryManager = useCategoryManager()
      return categoryManager.getRandomCategory(this.categories)
    },

    generateLetter() {
      return randomLetter()
    },

    // Session lifecycle
    async resumeOrStartNewGame() {
      if (this.currentSession) return this.currentSession
      return this.startNewGame()
    },

    async startNewGame() {
      const categoryManager = useCategoryManager()
      const sessionManager = useSessionManager()

      await this.fetchCategories()
      const category = categoryManager.getRandomCategory(this.categories)
      if (!category) throw new Error('Unable to start game without categories')

      const letter = this.generateLetter()
      const hasPlayers = this.currentSession?.players && this.currentSession.players.length > 0

      if (hasPlayers) {
        return this.startNextRound()
      } else {
        const session = sessionManager.createSinglePlayerSession(category, letter)
        this.currentSession = session
        await this.saveSessionToDB()
        return session
      }
    },

    async endGame() {
      if (!this.currentSession) return

      const sessionManager = useSessionManager()
      const lifecycle = useGameLifecycle()
      const session = this.currentSession

      session.endTime = Date.now()
      this.history.push(sessionManager.cloneSessionForHistory(session))

      await this.saveSessionToDB()
      await this.saveHistoryToDB()
      await lifecycle.updateStatisticsForSession(session)

      this.currentSession = null
    },

    async completeGame() {
      if (!this.currentSession) return

      const sessionManager = useSessionManager()
      const lifecycle = useGameLifecycle()
      const session = this.currentSession

      session.status = 'completed'
      session.endTime = Date.now()

      this.history.push(sessionManager.cloneSessionForHistory(session))

      await this.saveSessionToDB()
      await this.saveHistoryToDB()
      await lifecycle.updateStatisticsForSession(session)

      // Don't clear session - keep it so leaderboard can display winner
      return session
    },

    async abandonGame() {
      if (!this.currentSession) return

      this.currentSession.status = 'abandoned'
      this.currentSession.endTime = Date.now()

      await this.saveSessionToDB()
      await this.saveHistoryToDB()

      this.currentSession = null
    },

    setOnlineStatus(status: boolean) {
      this.isOnline = status
    },
    setInstallPrompt(event: BeforeInstallPromptEvent | null) {
      this.installPromptEvent = event
    },

    async showInstallPrompt() {
      if (!this.installPromptEvent) return false
      await this.installPromptEvent.prompt()
      const { outcome } = await this.installPromptEvent.userChoice
      if (outcome === 'accepted') this.installPromptEvent = null
      return outcome === 'accepted'
    },

    // Persistence actions (delegate to usePersistence)
    async loadFromDB() {
      const persistence = usePersistence()

      const session = await persistence.loadSessionFromDB()
      if (session) this.currentSession = session

      const history = await persistence.loadHistoryFromDB()
      if (history) this.history = history
    },

    async saveSessionToDB() {
      if (!this.currentSession) return
      const persistence = usePersistence()
      await persistence.saveSessionToDB(this.currentSession)
    },

    async saveHistoryToDB() {
      const persistence = usePersistence()
      await persistence.saveHistoryToDB(this.history)
    },

    async loadSessionById(sessionId: string) {
      const persistence = usePersistence()
      const session = await persistence.loadSessionById(sessionId)
      this.currentSession = session
      return session
    },

    clearSession() {
      this.currentSession = null
    },

    // Multi-player actions
    async setupPlayers(
      playerNames: string[],
      gameName?: string,
      customLetter?: string,
      customCategory?: Category
    ) {
      const categoryManager = useCategoryManager()
      const sessionManager = useSessionManager()
      const playerManager = usePlayerManager()

      await this.fetchCategories()
      const category = customCategory || categoryManager.getRandomCategory(this.categories)
      if (!category) throw new Error('Unable to start game without categories')

      const letter = customLetter || this.generateLetter()
      const players = playerManager.createPlayers(playerNames)
      const session = sessionManager.createSession(players, category, letter, gameName)

      this.currentSession = session
      await this.saveSessionToDB()
      return session
    },

    async submitPlayerAnswer(playerId: string, answer: string) {
      if (!this.currentSession) return

      const playerManager = usePlayerManager()
      const playerIndex = playerManager.findPlayerIndex(this.currentSession.players, playerId)
      if (playerIndex === -1) return

      const player = this.currentSession.players[playerIndex]
      if (!player) return
      playerManager.submitPlayerAnswer(player, answer)
      this.currentSession.currentPlayerIndex = playerManager.advancePlayerIndex(
        this.currentSession.currentPlayerIndex,
        this.currentSession.players.length
      )

      await this.saveSessionToDB()
    },

    async assignPlayerScore(playerId: string, points: number) {
      if (!this.currentSession) return

      const playerManager = usePlayerManager()
      const playerIndex = playerManager.findPlayerIndex(this.currentSession.players, playerId)
      if (playerIndex === -1) return

      const player = this.currentSession.players[playerIndex]
      if (!player) return
      playerManager.assignPlayerScore(player, points)

      await this.saveSessionToDB()
    },

    async updatePlayerAvatar(playerId: string, avatarUrl: string) {
      if (!this.currentSession) return

      const playerManager = usePlayerManager()
      const playerIndex = playerManager.findPlayerIndex(this.currentSession.players, playerId)
      if (playerIndex === -1) return

      const player = this.currentSession.players[playerIndex]
      if (!player) return
      playerManager.updatePlayerAvatar(player, avatarUrl)

      await this.saveSessionToDB()
    },

    async completeRound() {
      if (!this.currentSession) return

      const lifecycle = useGameLifecycle()
      const roundResult = lifecycle.buildRoundResult(this.currentSession)

      this.currentSession.roundHistory.push(roundResult)
      await this.saveSessionToDB()
    },

    async startNextRound(category?: Category, letter?: string) {
      if (!this.currentSession) return

      const categoryManager = useCategoryManager()
      const playerManager = usePlayerManager()

      const selectedCategory = category || categoryManager.getRandomCategory(this.categories)
      if (!selectedCategory) throw new Error('Unable to start round without categories')

      const selectedLetter = letter || this.generateLetter()
      playerManager.resetPlayerRoundState(this.currentSession.players)
      this.currentSession.currentPlayerIndex = 0

      this.currentSession.currentRound += 1
      this.currentSession.category = { ...selectedCategory, letter: selectedLetter }
      this.currentSession.letter = selectedLetter

      await this.saveSessionToDB()
      return this.currentSession
    },

    async resetPlayerSubmissions() {
      if (!this.currentSession) return

      const playerManager = usePlayerManager()
      playerManager.resetPlayerSubmissions(this.currentSession.players)
      this.currentSession.currentPlayerIndex = 0

      await this.saveSessionToDB()
    },

    getPlayerById(playerId: string): Player | null {
      if (!this.currentSession) return null
      const playerManager = usePlayerManager()
      return playerManager.getPlayerById(this.currentSession.players, playerId)
    },
  },
})
