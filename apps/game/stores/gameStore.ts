import { defineStore } from 'pinia'
import { useCategoryEmoji } from '../composables/useCategoryEmoji'
import { useCategoryManager } from '../composables/useCategoryManager'
import { useSessionManager } from '../composables/useSessionManager'
import { usePlayerManager } from '../composables/usePlayerManager'
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

// Game flow state types for unified state management
export type GameFlowState = 'setup' | 'in-round' | 'round-complete' | 'decision' | 'completed'

// Round action that may trigger state transitions
export type RoundAction =
  | {
      type: 'setup'
      payload: { players: string[]; category?: Category; letter?: string; gameName?: string }
    }
  | { type: 'submit-answer'; payload: { playerId: string; answer: string } }
  | { type: 'assign-score'; payload: { playerId: string; points: number } }
  | { type: 'complete-round' }
  | { type: 'next-round'; payload: { category?: Category; letter?: string } }
  | { type: 'complete-game' }
  | { type: 'reset-submissions' }

const randomLetter = () => {
  if (!ALPHABET || ALPHABET.length === 0) {
    throw new Error('ALPHABET constant is not defined or empty')
  }
  const index = Math.floor(Math.random() * ALPHABET.length)
  return ALPHABET.charAt(index).toLowerCase()
}

const PENDING_PLAYERS_STORAGE_KEY = 'rr:pending-player-names'

const persistPendingPlayerNames = (names: string[]) => {
  if (!import.meta.client) return
  try {
    if (names.length === 0) {
      window.sessionStorage.removeItem(PENDING_PLAYERS_STORAGE_KEY)
      return
    }
    window.sessionStorage.setItem(PENDING_PLAYERS_STORAGE_KEY, JSON.stringify(names))
  } catch {
    // Non-critical for gameplay; in-memory store remains source of truth.
  }
}

const loadPendingPlayerNames = (): string[] => {
  if (!import.meta.client) return []
  try {
    const raw = window.sessionStorage.getItem(PENDING_PLAYERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((name): name is string => typeof name === 'string' && name.length > 0)
  } catch {
    return []
  }
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
    postRoundDecisionPending: false,
  }),

  getters: {
    gameMode(state): 'single' | 'multiplayer' {
      return (state.currentSession?.players.length ?? 0) > 0 ? 'multiplayer' : 'single'
    },
    isCurrentRoundCompleted(state): boolean {
      const session = state.currentSession
      if (!session) return false
      return session.roundHistory.length >= session.currentRound
    },
    nextRoundNumber(state): number {
      const session = state.currentSession
      if (!session) return 1
      return this.isCurrentRoundCompleted ? session.currentRound + 1 : session.currentRound
    },
    flowState(state): GameFlowState {
      const session = state.currentSession
      if (!session) return 'setup'
      if (session.status === 'completed') return 'completed'
      if (state.postRoundDecisionPending) return 'decision'
      if (this.isCurrentRoundCompleted) return 'round-complete'
      return 'in-round'
    },

    hasActiveSession(state): boolean {
      return state.currentSession !== null
    },
    canInstall(state): boolean {
      return state.installPromptEvent !== null
    },
    currentCategory(state): Category | null {
      return state.currentSession?.category ?? null
    },
    currentLetter(state): string {
      return state.currentSession?.letter ?? ''
    },
    displayedCategories(state): Category[] {
      return state.categories.slice(0, state.displayedCategoryCount)
    },
    hasMoreCategories(state): boolean {
      return state.displayedCategoryCount < state.categories.length
    },
    categoryEmoji(): (name?: string | null) => string {
      return (name?: string | null) => {
        const { resolve } = useCategoryEmoji()
        return resolve(name)
      }
    },
    players(state): Player[] {
      return state.currentSession?.players ?? []
    },
    currentRound(state): number {
      return state.currentSession?.currentRound ?? 0
    },
    allPlayersSubmitted(state): boolean {
      const playerManager = usePlayerManager()
      return playerManager.allPlayersSubmitted(state.currentSession?.players ?? [])
    },
    currentPlayerTurn(state): Player | null {
      const playerManager = usePlayerManager()
      return playerManager.getCurrentPlayerTurn(
        state.currentSession?.players ?? [],
        state.currentSession?.currentPlayerIndex ?? 0
      )
    },
    leaderboard(state): PlayerWithRank[] {
      const playerManager = usePlayerManager()
      const players = state.currentSession?.players ?? []
      const isCompleted = state.currentSession?.status === 'completed'
      return playerManager.buildLeaderboard(players, isCompleted ?? false)
    },
    isGameCompleted(state): boolean {
      return state.currentSession?.status === 'completed'
    },
    gameStatus(state): string {
      return state.currentSession?.status ?? 'active'
    },
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
      const currentPlayers = this.currentSession?.players
      const hasPlayers = currentPlayers && currentPlayers.length > 0

      if (hasPlayers) {
        const nextRound = await this.startNextRound()
        if (!nextRound) throw new Error('Failed to start next round')
        return nextRound
      } else {
        const session = sessionManager.createSinglePlayerSession(category, letter)
        this.currentSession = session
        this.postRoundDecisionPending = false
        await this.saveSessionToDB()
        return session
      }
    },
    async endGame() {
      const session = this.currentSession
      if (!session) return

      const sessionManager = useSessionManager()
      const lifecycle = useGameLifecycle()

      session.endTime = Date.now()
      this.history = [...this.history, sessionManager.cloneSessionForHistory(session)]

      await this.saveSessionToDB()
      await this.saveHistoryToDB()
      await lifecycle.updateStatisticsForSession(session)

      this.currentSession = null
      this.postRoundDecisionPending = false
    },
    async completeGame() {
      const session = this.currentSession
      if (!session) return

      const sessionManager = useSessionManager()
      const lifecycle = useGameLifecycle()

      session.status = 'completed'
      session.endTime = Date.now()

      this.history = [...this.history, sessionManager.cloneSessionForHistory(session)]

      await this.saveSessionToDB()
      await this.saveHistoryToDB()
      await lifecycle.updateStatisticsForSession(session)

      // Explicit flow transition: decision → completed
      this.transitionToCompleted()

      // Don't clear session - keep it so leaderboard can display winner
      return session
    },
    async abandonGame() {
      const session = this.currentSession
      if (!session) return

      session.status = 'abandoned'
      session.endTime = Date.now()

      await this.saveSessionToDB()
      await this.saveHistoryToDB()

      this.currentSession = null
      this.postRoundDecisionPending = false
    },
    setOnlineStatus(status: boolean) {
      this.isOnline = status
    },
    setInstallPrompt(event: BeforeInstallPromptEvent | null) {
      this.installPromptEvent = event
    },
    setPendingPlayerNames(playerNames: string[]) {
      const names = [...playerNames]
      this.pendingPlayerNames = names
      persistPendingPlayerNames(names)
    },
    async showInstallPrompt() {
      const promptEvent = this.installPromptEvent
      if (!promptEvent) return false
      await promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      if (outcome === 'accepted') this.installPromptEvent = null
      return outcome === 'accepted'
    },
    async loadFromDB() {
      const persistence = usePersistence()

      const session = await persistence.loadSessionFromDB()
      this.currentSession = session ?? null

      const history = await persistence.loadHistoryFromDB()
      this.history = history ?? []
    },
    async saveSessionToDB() {
      const session = this.currentSession
      if (!session) return
      const persistence = usePersistence()
      await persistence.saveSessionToDB(session)
    },
    async saveHistoryToDB() {
      const persistence = usePersistence()
      await persistence.saveHistoryToDB(this.history)
    },
    async loadSessionById(sessionId: string) {
      const persistence = usePersistence()
      const currentSession = this.currentSession
      let session: import('@riddle-rush/types/game').GameSession | null = null

      try {
        session = await persistence.loadSessionById(sessionId)
      } catch {
        // Fallback handled below (current session + "current" DB slot)
      }

      // Primary lookup: direct ID store hit.
      if (session) {
        this.currentSession = session
        this.postRoundDecisionPending = false
        return session
      }

      // Keep in-memory session when route transitions race DB writes.
      if (currentSession?.id === sessionId) {
        this.currentSession = currentSession
        this.postRoundDecisionPending = false
        return currentSession
      }

      // Secondary lookup: the current-session slot can exist even when ID index is stale.
      const currentFromDB = await persistence.loadSessionFromDB()
      if (currentFromDB?.id === sessionId) {
        this.currentSession = currentFromDB
        this.postRoundDecisionPending = false
        return currentFromDB
      }

      return null
    },
    clearSession() {
      this.currentSession = null
      this.postRoundDecisionPending = false
    },
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
      this.postRoundDecisionPending = false
      this.pendingPlayerNames = []

      // Explicit flow transition: setup → in-round
      this.transitionToInRound()
      persistPendingPlayerNames([])
      await this.saveSessionToDB()
      return session
    },
    async submitPlayerAnswer(playerId: string, answer: string) {
      const session = this.currentSession
      if (!session) return

      const playerManager = usePlayerManager()
      const playerIndex = playerManager.findPlayerIndex(session.players, playerId)
      if (playerIndex === -1) return

      // Only the active player's submission can advance turn progression.
      if (playerIndex !== session.currentPlayerIndex) return

      const player = session.players[playerIndex]
      if (!player) return
      if (player.hasSubmitted) return

      playerManager.submitPlayerAnswer(player, answer)

      // For single player games, don't advance index since there's no next player
      if (session.players.length > 1) {
        session.currentPlayerIndex = playerManager.advancePlayerIndex(
          session.currentPlayerIndex,
          session.players.length
        )
      }

      // Check if all players submitted and transition to round-complete
      if (playerManager.allPlayersSubmitted(session.players)) {
        this.transitionToRoundComplete()
      }

      void this.saveSessionToDB()
    },

    // Flow state transition helpers for unified state management
    transitionToSetup() {
      this.currentSession = null
      this.postRoundDecisionPending = false
    },

    transitionToInRound() {
      this.postRoundDecisionPending = false
    },

    transitionToRoundComplete() {
      const session = this.currentSession
      if (session) {
        // INVARIANT: Do NOT set postRoundDecisionPending here — completeRound() owns that transition.
        if (session.roundHistory.length < session.currentRound) {
          session.roundHistory.push({
            roundNumber: session.currentRound,
            category: session.category.name,
            letter: session.letter,
            timestamp: Date.now(),
            playerResults: session.players.map((player: Player) => ({
              playerId: player.id,
              playerName: player.name,
              answer: player.currentRoundAnswer || '',
              score: player.currentRoundScore,
            })),
          })
        }
      }
    },

    transitionToDecision() {
      this.postRoundDecisionPending = true
    },

    transitionToCompleted() {
      const session = this.currentSession
      if (session) {
        session.status = 'completed'
        this.postRoundDecisionPending = false
      }
    },

    async assignPlayerScore(playerId: string, points: number) {
      const session = this.currentSession
      if (!session) return

      const playerManager = usePlayerManager()
      const playerIndex = playerManager.findPlayerIndex(session.players, playerId)
      if (playerIndex === -1) return

      const player = session.players[playerIndex]
      if (!player) return
      playerManager.assignPlayerScore(player, points)

      void this.saveSessionToDB()
    },
    async updatePlayerAvatar(playerId: string, avatarUrl: string) {
      const session = this.currentSession
      if (!session) return

      const playerManager = usePlayerManager()
      const playerIndex = playerManager.findPlayerIndex(session.players, playerId)
      if (playerIndex === -1) return

      const player = session.players[playerIndex]
      if (!player) return
      playerManager.updatePlayerAvatar(player, avatarUrl)

      void this.saveSessionToDB()
    },
    async completeRound() {
      const session = this.currentSession
      if (!session) return

      // Prevent incomplete round snapshots in multiplayer mode.
      if (session.players.length > 0) {
        const playerManager = usePlayerManager()
        if (!playerManager.allPlayersSubmitted(session.players)) {
          return
        }
      }

      if (session.players.length === 0 && session.status !== 'active') {
        return
      }

      // Idempotency guard: avoid duplicate history entries for the same round.
      if (this.isCurrentRoundCompleted) {
        this.transitionToDecision()
        return
      }

      const lifecycle = useGameLifecycle()
      const roundResult = lifecycle.buildRoundResult(session)

      session.roundHistory.push(roundResult)
      await this.saveSessionToDB()
      // Explicit flow transition: round-complete → decision
      this.transitionToDecision()
    },
    async startNextRound(category?: Category, letter?: string) {
      const session = this.currentSession
      if (!session) return null

      const categoryManager = useCategoryManager()
      const playerManager = usePlayerManager()

      const selectedCategory = category || categoryManager.getRandomCategory(this.categories)
      if (!selectedCategory) throw new Error('Unable to start round without categories')

      const selectedLetter = letter || this.generateLetter()
      playerManager.resetPlayerRoundState(session.players)
      session.currentPlayerIndex = 0

      session.currentRound += 1
      session.category = { ...selectedCategory, letter: selectedLetter }
      session.letter = selectedLetter

      await this.saveSessionToDB()
      // Explicit flow transition: decision → in-round
      this.transitionToInRound()
      return session
    },
    async advanceToConfiguredRound(category: Category, letter: string) {
      const session = this.currentSession
      const inMemoryPendingPlayers = this.pendingPlayerNames
      const restoredPendingPlayers =
        inMemoryPendingPlayers.length > 0 ? inMemoryPendingPlayers : loadPendingPlayerNames()
      const hasPendingPlayers = restoredPendingPlayers.length > 0

      if (!session || hasPendingPlayers) {
        if (!hasPendingPlayers) {
          return null
        }

        const createdSession = await this.setupPlayers(
          restoredPendingPlayers,
          undefined,
          letter,
          category
        )

        this.pendingPlayerNames = []
        this.selectedLetter = null
        this.postRoundDecisionPending = false

        return createdSession
      }

      // Round-start flow must only advance existing multiplayer sessions.
      // A players-empty session indicates stale single-player state and is not valid
      // for configured round progression.
      if ((session.players?.length ?? 0) === 0) {
        return null
      }

      if (this.isCurrentRoundCompleted) {
        return this.startNextRound(category, letter)
      }

      // Refresh within an active round: keep round counter stable, update round context,
      // and reset submissions for a fair restart.
      session.category = { ...category, letter }
      session.letter = letter
      await this.resetPlayerSubmissions()
      this.postRoundDecisionPending = false
      return session
    },
    async resetPlayerSubmissions() {
      const session = this.currentSession
      if (!session) return

      const playerManager = usePlayerManager()
      playerManager.resetPlayerSubmissions(session.players)
      session.currentPlayerIndex = 0

      await this.saveSessionToDB()
      this.postRoundDecisionPending = false
    },
    getPlayerById(playerId: string): Player | null {
      const session = this.currentSession
      if (!session) return null
      const playerManager = usePlayerManager()
      return playerManager.getPlayerById(session.players, playerId)
    },
    getState(): ReturnType<typeof useGameStore> {
      return this as ReturnType<typeof useGameStore>
    },
  },
})

export const gameStore = useGameStore
