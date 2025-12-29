import { useIndexedDB } from '../composables/useIndexedDB'
import { useStatistics } from '../composables/useStatistics'
import type { GameSession, GameAttempt, GameState, Category, BeforeInstallPromptEvent, Player } from '../types/game'

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  'Weiblicher Vorname': '👩',
  'Männlicher Vorname': '👨',
  'Wasser Fahrzeug': '⛵',
  Blumen: '🌸',
  Pflanzen: '🌿',
  'Beruf oder Gewerbe': '💼',
  Insekt: '🐛',
  Tier: '🐾',
  Stadt: '🏙️',
  Land: '🌍',
  Essen: '🍽️',
  Getränk: '🥤',
  Sport: '⚽',
  Musik: '🎵',
  Film: '🎬',
  Berg: '⛰️',
  Mountains: '🏔️',
  Hills: '⛰️',
  Gewässer: '💧',
  See: '🌊',
  Maschine: '⚙️',
  Technik: '🔧',
  Raumfahrt: '🚀',
  '-heit': '📝',
  '-ung': '📝',
  '-keit': '📝',
  Farbe: '🎨',
  Erfinder: '💡',
  Entdecker: '🔍',
  Gelehrter: '👨‍🎓',
  Maler: '🎨',
  Bildhauer: '🗿',
  Komponist: '🎼',
  Sänger: '🎤',
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const resolveCategoryEmoji = (name?: string | null) => {
  if (!name) return '🎯'

  for (const [key, emoji] of Object.entries(CATEGORY_EMOJI_MAP)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return emoji
    }
  }

  return '🎯'
}

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
    displayedCategoryCount: 9,
    categoryLoadError: null,
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
    categoryEmoji: () => (name?: string | null) => resolveCategoryEmoji(name),

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
    isMultiPlayerMode: (state) => {
      const players = state.currentSession?.players ?? []
      return players.length > 0
    },
    leaderboard: (state) => {
      const players = state.currentSession?.players ?? []
      return [...players].sort((a, b) => b.totalScore - a.totalScore)
    },
  },

  actions: {
    async fetchCategories(force = false) {
      if (this.categoriesLoaded && !force) {
        return this.categories
      }

      try {
        const categories = await $fetch<Category[]>('/data/categories.json')

        this.categories = categories
        this.categoriesLoaded = true
        this.categoryLoadError = null

        return categories
      } catch (error) {
        this.categoryLoadError = 'Failed to load categories'
        throw error
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
        this.currentSession.score += 10
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
      const { getGameSession, getGameHistory } = useIndexedDB()

      const session = await getGameSession()
      if (session) {
        this.currentSession = session
      }

      const history = await getGameHistory()
      if (history) {
        this.history = history
      }
    },

    async saveSessionToDB() {
      if (!this.currentSession) return
      const { saveGameSession } = useIndexedDB()
      await saveGameSession(this.currentSession)
    },

    async saveHistoryToDB() {
      const { saveGameHistory } = useIndexedDB()
      await saveGameHistory(this.history)
    },

    clearSession() {
      this.currentSession = null
    },

    // Multi-player actions
    async setupPlayers(playerNames: string[], gameName?: string) {
      await this.fetchCategories()

      const category = this.getRandomCategory()
      if (!category) {
        throw new Error('Unable to start game without categories')
      }

      const letter = this.generateLetter()

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

    async startNextRound() {
      if (!this.currentSession) return

      const category = this.getRandomCategory()
      if (!category) {
        throw new Error('Unable to start round without categories')
      }

      const letter = this.generateLetter()

      // Reset player round state
      this.currentSession.players.forEach((player) => {
        player.currentRoundScore = 0
        player.currentRoundAnswer = undefined
        player.hasSubmitted = false
      })

      this.currentSession.currentRound += 1
      this.currentSession.category = { ...category, letter }
      this.currentSession.letter = letter

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
