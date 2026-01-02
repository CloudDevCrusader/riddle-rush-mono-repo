import { useIndexedDB } from '../composables/useIndexedDB'
import { useStatistics } from '../composables/useStatistics'
import { useLogger } from '../composables/useLogger'
import { useCategoryEmoji } from '../composables/useCategoryEmoji'
import {
  ALPHABET,
  SCORE_PER_CORRECT_ANSWER,
  DEFAULT_DISPLAYED_CATEGORIES,
} from '../utils/constants'
import type { GameSession, GameAttempt, GameState, Category, BeforeInstallPromptEvent, Player, PlayerWithRank } from '../types/game'

const randomLetter = () => {
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
    displayedCategories: (state) =>
      state.categories.slice(0, state.displayedCategoryCount),
    hasMoreCategories: (state) =>
      state.displayedCategoryCount < state.categories.length,
    categoryEmoji: () => {
      const { resolve } = useCategoryEmoji()
      return (name?: string | null) => resolve(name)
    },

    // Multi-player getters
    players: (state) => state.currentSession?.players ?? [],
    currentRound: (state) => state.currentSession?.currentRound ?? 0,
    allPlayersSubmitted: (state) => {
      const players = state.currentSession?.players ?? []
      if (players.length === 0) return false
      return players.every((p) => p.hasSubmitted)
    },
    currentPlayerTurn: (state) => {
      const players = state.currentSession?.players ?? []
      return players.find((p) => !p.hasSubmitted) ?? null
    },
    leaderboard: (state): PlayerWithRank[] => {
      const players = state.currentSession?.players ?? []
      const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore)

      const isGameCompleted = state.currentSession?.status === 'completed'
      const topScore = sorted[0]?.totalScore ?? 0

      return sorted.map((player, index) => ({
        ...player,
        rank: index + 1,
        isWinner: isGameCompleted && index === 0 && topScore > 0,
      }))
    },
    isGameCompleted: (state) => state.currentSession?.status === 'completed',
    gameStatus: (state) => state.currentSession?.status ?? 'active',
  },

  actions: {
    async fetchCategories(force = false) {
      if (this.categoriesLoaded && !force) {
        return this.categories
      }

      try {
        const categories = await $fetch<Category[]>('/data/categories.json')

        if (!categories || categories.length === 0) {
          throw new Error('No categories found in data file')
        }

        this.categories = categories
        this.categoriesLoaded = true
        this.categoryLoadError = null

        return categories
      } catch (error) {
        const logger = useLogger()
        const errorMessage = error instanceof Error ? error.message : 'Failed to load categories'
        this.categoryLoadError = errorMessage
        logger.error('Error fetching categories:', error)

        // Don't throw if we have cached categories
        if (this.categories.length > 0) {
          logger.warn('Using cached categories due to fetch error')
          return this.categories
        }

        throw new Error(errorMessage)
      }
    },

    loadMoreCategories(step = 9) {
      if (!this.hasMoreCategories) return

      this.displayedCategoryCount = Math.min(
        this.displayedCategoryCount + step,
        this.categories.length,
      )
    },

    resetDisplayedCategories(count = 9) {
      this.displayedCategoryCount = Math.min(
        count,
        this.categories.length || count,
      )
    },

    getCategoryById(categoryId: number): Category | null {
      return this.categories.find((category: Category) => category.id === categoryId) ?? null
    },

    getRandomCategory(): Category | null {
      if (!this.categories.length) return null

      const index = Math.floor(Math.random() * this.categories.length)
      return this.categories[index] ?? null
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
      await this.fetchCategories()

      const category = this.getRandomCategory()

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
        const session: GameSession = {
          id: crypto.randomUUID(),
          userId: 'default-user',
          category: { ...category, letter },
          letter,
          startTime: Date.now(),
          score: 0,
          attempts: [],
          players: [],
          currentRound: 0,
          roundHistory: [],
        }

        this.currentSession = session
        await this.saveSessionToDB()
        return session
      }
    },

    async submitAttempt(term: string, found: boolean) {
      if (!this.currentSession) return

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
      if (found) {
        this.currentSession.score += SCORE_PER_CORRECT_ANSWER
      }

      await this.saveSessionToDB()
    },

    async endGame() {
      if (!this.currentSession) return

      this.currentSession.endTime = Date.now()
      this.history.push({ ...this.currentSession })

      await this.saveSessionToDB()
      await this.saveHistoryToDB()

      const { updateStatistics } = useStatistics()
      await updateStatistics(this.currentSession)

      this.currentSession = null
    },

    async completeGame() {
      if (!this.currentSession) return

      this.currentSession.status = 'completed'
      this.currentSession.endTime = Date.now()

      await this.saveSessionToDB()
      await this.saveHistoryToDB()

      const { updateStatistics } = useStatistics()
      await updateStatistics(this.currentSession)

      // Don't clear session - keep it so leaderboard can display winner
      return this.currentSession
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

    clearSession() {
      this.currentSession = null
    },

    // Multi-player actions
    async setupPlayers(playerNames: string[], gameName?: string, customLetter?: string, customCategory?: Category) {
      await this.fetchCategories()

      const category = customCategory || this.getRandomCategory()
      if (!category) {
        throw new Error('Unable to start game without categories')
      }

      const letter = customLetter || this.generateLetter()

      const players: Player[] = playerNames.map((name, index) => ({
        id: crypto.randomUUID(),
        name: name || `Player ${index + 1}`,
        totalScore: 0,
        currentRoundScore: 0,
        currentRoundAnswer: undefined,
        hasSubmitted: false,
      }))

      const session: GameSession = {
        id: crypto.randomUUID(),
        gameName,
        players,
        currentRound: 1,
        category: { ...category, letter },
        letter,
        startTime: Date.now(),
        status: 'active',
        roundHistory: [],
      }

      this.currentSession = session
      await this.saveSessionToDB()

      return session
    },

    async submitPlayerAnswer(playerId: string, answer: string) {
      if (!this.currentSession) return

      const player = this.currentSession.players.find((p) => p.id === playerId)
      if (!player) return

      player.currentRoundAnswer = answer
      player.hasSubmitted = true

      await this.saveSessionToDB()
    },

    async assignPlayerScore(playerId: string, points: number) {
      if (!this.currentSession) return

      const player = this.currentSession.players.find((p) => p.id === playerId)
      if (!player) return

      player.currentRoundScore = points
      player.totalScore += points

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

      // Use provided category and letter, or pick random ones
      const selectedCategory = category || this.getRandomCategory()
      if (!selectedCategory) {
        throw new Error('Unable to start round without categories')
      }

      const selectedLetter = letter || this.generateLetter()

      // Reset player round state
      this.currentSession.players.forEach((player) => {
        player.currentRoundScore = 0
        player.currentRoundAnswer = undefined
        player.hasSubmitted = false
      })

      this.currentSession.currentRound += 1
      this.currentSession.category = { ...selectedCategory, letter: selectedLetter }
      this.currentSession.letter = selectedLetter

      await this.saveSessionToDB()

      return this.currentSession
    },

    async resetPlayerSubmissions() {
      if (!this.currentSession) return

      this.currentSession.players.forEach((player) => {
        player.hasSubmitted = false
      })

      await this.saveSessionToDB()
    },

    getPlayerById(playerId: string): Player | null {
      if (!this.currentSession) return null
      return this.currentSession.players.find((p) => p.id === playerId) ?? null
    },
  },
})
