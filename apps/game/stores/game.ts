import { defineStore } from 'pinia'
import { useIndexedDB } from '../composables/useIndexedDB'
import { useStatistics } from '../composables/useStatistics'
import { useLogger } from '../composables/useLogger'
import { useCategoryEmoji } from '../composables/useCategoryEmoji'
import { useCategoryManager } from '../composables/useCategoryManager'
import { useSessionManager } from '../composables/useSessionManager'
import { usePlayerManager } from '../composables/usePlayerManager'
import { useScoringEngine } from '../composables/useScoringEngine'
import { ALPHABET, DEFAULT_DISPLAYED_CATEGORIES } from '@riddle-rush/shared/constants'
import type {
  GameAttempt,
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
    currentScore: (state) => state.currentSession?.score ?? 0, // Legacy support
    currentAttempts: (state) => state.currentSession?.attempts ?? [], // Legacy support
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
      return playerManager.getCurrentPlayerTurn(state.currentSession?.players ?? [])
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

    async resumeOrStartNewGame() {
      if (this.currentSession) {
        return this.currentSession
      }

      return this.startNewGame()
    },

    async startNewGame() {
      const categoryManager = useCategoryManager()
      const sessionManager = useSessionManager()

      await this.fetchCategories()

      const category = categoryManager.getRandomCategory(this.categories)

      if (!category) {
        throw new Error('Unable to start game without categories')
      }

      const letter = this.generateLetter()

      // Check if we have players (multi-player mode) or use legacy single-player
      const hasPlayers = this.currentSession?.players && this.currentSession.players.length > 0

      if (hasPlayers) {
        // Multi-player: start new round
        return this.startNextRound()
      } else {
        // Legacy single-player mode
        const session = sessionManager.createSinglePlayerSession(category, letter)

        this.currentSession = session
        await this.saveSessionToDB()
        return session
      }
    },

    async submitAttempt(term: string, found: boolean) {
      if (!this.currentSession) return

      const scoringEngine = useScoringEngine()

      const attempt: GameAttempt = {
        term,
        found,
        timestamp: Date.now(),
      }

      // Legacy single-player support
      if (!this.currentSession.attempts) {
        this.currentSession.attempts = []
      }
      if (this.currentSession.score === undefined) {
        this.currentSession.score = 0
      }

      this.currentSession.attempts.push(attempt)
      this.currentSession.score += scoringEngine.calculateAttemptScore(found)

      await this.saveSessionToDB()
    },

    async endGame() {
      if (!this.currentSession) return

      const sessionManager = useSessionManager()
      const session = this.currentSession
      session.endTime = Date.now()
      this.history.push(sessionManager.cloneSessionForHistory(session))

      await this.saveSessionToDB()
      await this.saveHistoryToDB()

      try {
        const { updateStatistics } = useStatistics()
        await updateStatistics(session)
      } catch (error) {
        const logger = useLogger()
        logger.error('Error updating statistics on endGame:', error)
      }

      this.currentSession = null
    },

    async completeGame() {
      if (!this.currentSession) return

      const session = this.currentSession

      session.status = 'completed'
      session.endTime = Date.now()

      await this.saveSessionToDB()
      await this.saveHistoryToDB()

      try {
        const { updateStatistics } = useStatistics()
        await updateStatistics(session)
      } catch (error) {
        const logger = useLogger()
        logger.error('Error updating statistics on completeGame:', error)
      }

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

      if (outcome === 'accepted') {
        this.installPromptEvent = null
      }

      return outcome === 'accepted'
    },

    async loadFromDB() {
      try {
        const { getGameSession, getGameHistory } = useIndexedDB()

        const session = await getGameSession()
        if (session) {
          this.currentSession = session
        }

        const history = await getGameHistory()
        if (history) {
          this.history = history
        }
      } catch (error) {
        const logger = useLogger()
        logger.error('Error loading from IndexedDB:', error)
        // Continue without persisted data
      }
    },

    async saveSessionToDB() {
      if (!this.currentSession) return

      try {
        const { saveGameSession } = useIndexedDB()
        await saveGameSession(this.currentSession)
      } catch (error) {
        const logger = useLogger()
        logger.error('Error saving session to IndexedDB:', error)
        // Don't throw - allow game to continue even if save fails
      }
    },

    async saveHistoryToDB() {
      try {
        const { saveGameHistory } = useIndexedDB()
        await saveGameHistory(this.history)
      } catch (error) {
        const logger = useLogger()
        logger.error('Error saving history to IndexedDB:', error)
        // Don't throw - allow game to continue even if save fails
      }
    },

    async loadSessionById(sessionId: string) {
      try {
        const { getGameSessionById } = useIndexedDB()
        const session = await getGameSessionById(sessionId)

        if (!session) {
          throw new Error(`Game session with ID ${sessionId} not found`)
        }

        this.currentSession = session
        return session
      } catch (error) {
        const logger = useLogger()
        logger.error('Error loading game session by ID:', error)
        throw new Error('Failed to load game session')
      }
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
      if (!category) {
        throw new Error('Unable to start game without categories')
      }

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

      // Update player using index to ensure reactivity
      const player = this.currentSession.players[playerIndex]
      if (!player) return
      playerManager.submitPlayerAnswer(player, answer)

      await this.saveSessionToDB()
    },

    async assignPlayerScore(playerId: string, points: number) {
      if (!this.currentSession) return

      const playerManager = usePlayerManager()
      const playerIndex = playerManager.findPlayerIndex(this.currentSession.players, playerId)
      if (playerIndex === -1) return

      // Update player using index to ensure reactivity
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

      // Update player using index to ensure reactivity
      const player = this.currentSession.players[playerIndex]
      if (!player) return
      playerManager.updatePlayerAvatar(player, avatarUrl)

      await this.saveSessionToDB()
    },

    async completeRound() {
      if (!this.currentSession) return

      const roundResult = {
        roundNumber: this.currentSession.currentRound,
        category: this.currentSession.category.name,
        letter: this.currentSession.letter,
        timestamp: Date.now(),
        playerResults: this.currentSession.players.map((p) => ({
          playerId: p.id,
          playerName: p.name,
          answer: p.currentRoundAnswer || '',
          score: p.currentRoundScore,
        })),
      }

      this.currentSession.roundHistory.push(roundResult)
      await this.saveSessionToDB()
    },

    async startNextRound(category?: Category, letter?: string) {
      if (!this.currentSession) return

      const categoryManager = useCategoryManager()
      const playerManager = usePlayerManager()

      // Use provided category and letter, or pick random ones
      const selectedCategory = category || categoryManager.getRandomCategory(this.categories)
      if (!selectedCategory) {
        throw new Error('Unable to start round without categories')
      }

      const selectedLetter = letter || this.generateLetter()

      // Reset player round state
      playerManager.resetPlayerRoundState(this.currentSession.players)

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

      await this.saveSessionToDB()
    },

    getPlayerById(playerId: string): Player | null {
      if (!this.currentSession) return null
      const playerManager = usePlayerManager()
      return playerManager.getPlayerById(this.currentSession.players, playerId)
    },
  },
})
