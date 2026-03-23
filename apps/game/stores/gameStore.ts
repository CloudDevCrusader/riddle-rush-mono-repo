import { create, type StoreApi, type UseBoundStore } from 'zustand'
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

type GameStoreShape = GameState & {
  /**
   * Flow state machine — single source of truth for game mode and round transitions.
   *
   * States:
   *   setup          → No active session yet (players page, initial state)
   *   in-round       → Active session with an ongoing round (game page)
   *   round-complete → Current round data recorded in roundHistory (internal, auto-transitions to decision)
   *   decision       → Post-round modal is active: next round / new game / leaderboard (results page)
   *   completed      → Session status is 'completed', game is over (leaderboard page)
   *
   * Transitions:
   *   setup          → in-round        via setupPlayers / advanceToConfiguredRound
   *   in-round       → round-complete   via completeRound (when all players submitted)
   *   round-complete → decision         via completeRound setting postRoundDecisionPending
   *   decision       → in-round         via startNextRound (next round chosen)
   *   decision       → completed        via completeGame (leaderboard or new game chosen)
   *   completed      → setup            via endGame / clearSession (return to menu)
   */
  gameMode: () => 'single' | 'multiplayer'
  isCurrentRoundCompleted: () => boolean
  nextRoundNumber: () => number
  flowState: () => 'setup' | 'in-round' | 'round-complete' | 'decision' | 'completed'

  // Getters
  hasActiveSession: () => boolean
  canInstall: boolean
  currentCategory: Category | null
  currentLetter: string
  displayedCategories: Category[]
  hasMoreCategories: boolean
  categoryEmoji: (name?: string | null) => string
  players: Player[]
  currentRound: number
  postRoundDecisionPending: boolean
  allPlayersSubmitted: boolean
  currentPlayerTurn: Player | null
  leaderboard: PlayerWithRank[]
  isGameCompleted: () => boolean
  gameStatus: () => string

  // Actions
  fetchCategories: (force?: boolean) => Promise<Category[]>
  loadMoreCategories: (step?: number) => void
  resetDisplayedCategories: (count?: number) => void
  getCategoryById: (categoryId: number) => Category | null
  getRandomCategory: () => Category | null
  generateLetter: () => string
  resumeOrStartNewGame: () => Promise<import('@riddle-rush/types/game').GameSession | null>
  startNewGame: () => Promise<import('@riddle-rush/types/game').GameSession>
  endGame: () => Promise<void>
  completeGame: () => Promise<import('@riddle-rush/types/game').GameSession | undefined>
  abandonGame: () => Promise<void>
  setOnlineStatus: (status: boolean) => void
  setInstallPrompt: (event: BeforeInstallPromptEvent | null) => void
  setPendingPlayerNames: (playerNames: string[]) => void
  showInstallPrompt: () => Promise<boolean>
  loadFromDB: () => Promise<void>
  saveSessionToDB: () => Promise<void>
  saveHistoryToDB: () => Promise<void>
  loadSessionById: (
    sessionId: string
  ) => Promise<import('@riddle-rush/types/game').GameSession | null>
  clearSession: () => void
  setupPlayers: (
    playerNames: string[],
    gameName?: string,
    customLetter?: string,
    customCategory?: Category
  ) => Promise<import('@riddle-rush/types/game').GameSession>
  submitPlayerAnswer: (playerId: string, answer: string) => Promise<void>
  assignPlayerScore: (playerId: string, points: number) => Promise<void>
  updatePlayerAvatar: (playerId: string, avatarUrl: string) => Promise<void>
  completeRound: () => Promise<void>
  startNextRound: (
    category?: Category,
    letter?: string
  ) => Promise<import('@riddle-rush/types/game').GameSession | null>
  advanceToConfiguredRound: (
    category: Category,
    letter: string
  ) => Promise<import('@riddle-rush/types/game').GameSession | null>
  resetPlayerSubmissions: () => Promise<void>
  getPlayerById: (playerId: string) => Player | null

  // Flow state transition helpers
  transitionToSetup: () => void
  transitionToInRound: () => void
  transitionToRoundComplete: () => void
  transitionToDecision: () => void
  transitionToCompleted: () => void
}

type GameStoreInstance = UseBoundStore<StoreApi<GameStoreShape>>

const createGameStore = (): GameStoreInstance =>
  create<GameStoreShape>()((set, get) => ({
    // State
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

    gameMode() {
      return (get().currentSession?.players.length ?? 0) > 0 ? 'multiplayer' : 'single'
    },
    isCurrentRoundCompleted() {
      const session = get().currentSession
      if (!session) return false
      return session.roundHistory.length >= session.currentRound
    },
    nextRoundNumber() {
      const session = get().currentSession
      if (!session) return 1
      return get().isCurrentRoundCompleted() ? session.currentRound + 1 : session.currentRound
    },
    flowState() {
      const session = get().currentSession
      if (!session) return 'setup'
      if (session.status === 'completed') return 'completed'
      if (get().postRoundDecisionPending) return 'decision'
      if (get().isCurrentRoundCompleted()) return 'round-complete'
      return 'in-round'
    },

    // Getters
    hasActiveSession() {
      return get().currentSession !== null
    },
    get canInstall() {
      return get().installPromptEvent !== null
    },
    get currentCategory() {
      return get().currentSession?.category ?? null
    },
    get currentLetter() {
      return get().currentSession?.letter ?? ''
    },
    get displayedCategories() {
      return get().categories.slice(0, get().displayedCategoryCount)
    },
    get hasMoreCategories() {
      return get().displayedCategoryCount < get().categories.length
    },
    categoryEmoji(name?: string | null) {
      const { resolve } = useCategoryEmoji()
      return resolve(name)
    },
    get players() {
      return get().currentSession?.players ?? []
    },
    get currentRound() {
      return get().currentSession?.currentRound ?? 0
    },
    get allPlayersSubmitted() {
      const playerManager = usePlayerManager()
      return playerManager.allPlayersSubmitted(get().currentSession?.players ?? [])
    },
    get currentPlayerTurn() {
      const playerManager = usePlayerManager()
      return playerManager.getCurrentPlayerTurn(
        get().currentSession?.players ?? [],
        get().currentSession?.currentPlayerIndex ?? 0
      )
    },
    get leaderboard() {
      const playerManager = usePlayerManager()
      const players = get().currentSession?.players ?? []
      const isGameCompleted = get().currentSession?.status === 'completed'
      return playerManager.buildLeaderboard(players, isGameCompleted ?? false)
    },
    isGameCompleted() {
      return get().currentSession?.status === 'completed'
    },
    gameStatus() {
      return get().currentSession?.status ?? 'active'
    },

    // Actions
    async fetchCategories(force = false) {
      const categoryManager = useCategoryManager()
      return categoryManager.fetchCategories(get(), force)
    },
    loadMoreCategories(step = 9) {
      const categoryManager = useCategoryManager()
      categoryManager.loadMoreCategories(get(), step)
    },
    resetDisplayedCategories(count = 9) {
      const categoryManager = useCategoryManager()
      categoryManager.resetDisplayedCategories(get(), count)
    },
    getCategoryById(categoryId: number): Category | null {
      const categoryManager = useCategoryManager()
      return categoryManager.getCategoryById(get().categories, categoryId)
    },
    getRandomCategory(): Category | null {
      const categoryManager = useCategoryManager()
      return categoryManager.getRandomCategory(get().categories)
    },
    generateLetter() {
      return randomLetter()
    },
    async resumeOrStartNewGame() {
      if (get().currentSession) return get().currentSession
      return get().startNewGame()
    },
    async startNewGame() {
      const categoryManager = useCategoryManager()
      const sessionManager = useSessionManager()

      await get().fetchCategories()
      const category = categoryManager.getRandomCategory(get().categories)
      if (!category) throw new Error('Unable to start game without categories')

      const letter = get().generateLetter()
      const currentPlayers = get().currentSession?.players
      const hasPlayers = currentPlayers && currentPlayers.length > 0

      if (hasPlayers) {
        const nextRound = await get().startNextRound()
        if (!nextRound) throw new Error('Failed to start next round')
        return nextRound
      } else {
        const session = sessionManager.createSinglePlayerSession(category, letter)
        set({ currentSession: session, postRoundDecisionPending: false })
        await get().saveSessionToDB()
        return session
      }
    },
    async endGame() {
      const session = get().currentSession
      if (!session) return

      const sessionManager = useSessionManager()
      const lifecycle = useGameLifecycle()

      session.endTime = Date.now()
      const newHistory = [...get().history, sessionManager.cloneSessionForHistory(session)]
      set({ history: newHistory })

      await get().saveSessionToDB()
      await get().saveHistoryToDB()
      await lifecycle.updateStatisticsForSession(session)

      set({ currentSession: null, postRoundDecisionPending: false })
    },
    async completeGame() {
      const session = get().currentSession
      if (!session) return

      const sessionManager = useSessionManager()
      const lifecycle = useGameLifecycle()

      session.status = 'completed'
      session.endTime = Date.now()

      const newHistory = [...get().history, sessionManager.cloneSessionForHistory(session)]
      set({ history: newHistory })

      await get().saveSessionToDB()
      await get().saveHistoryToDB()
      await lifecycle.updateStatisticsForSession(session)

      // Explicit flow transition: decision → completed
      get().transitionToCompleted()

      // Don't clear session - keep it so leaderboard can display winner
      return session
    },
    async abandonGame() {
      const session = get().currentSession
      if (!session) return

      session.status = 'abandoned'
      session.endTime = Date.now()

      await get().saveSessionToDB()
      await get().saveHistoryToDB()

      set({ currentSession: null, postRoundDecisionPending: false })
    },
    setOnlineStatus(status: boolean) {
      set({ isOnline: status })
    },
    setInstallPrompt(event: BeforeInstallPromptEvent | null) {
      set({ installPromptEvent: event })
    },
    setPendingPlayerNames(playerNames: string[]) {
      const names = [...playerNames]
      set({ pendingPlayerNames: names })
      persistPendingPlayerNames(names)
    },
    async showInstallPrompt() {
      const promptEvent = get().installPromptEvent
      if (!promptEvent) return false
      await promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      if (outcome === 'accepted') set({ installPromptEvent: null })
      return outcome === 'accepted'
    },
    async loadFromDB() {
      const persistence = usePersistence()

      const session = await persistence.loadSessionFromDB()
      set({ currentSession: session ?? null })

      const history = await persistence.loadHistoryFromDB()
      set({ history: history ?? [] })
    },
    async saveSessionToDB() {
      const session = get().currentSession
      if (!session) return
      const persistence = usePersistence()
      await persistence.saveSessionToDB(session)
    },
    async saveHistoryToDB() {
      const persistence = usePersistence()
      await persistence.saveHistoryToDB(get().history)
    },
    async loadSessionById(sessionId: string) {
      const persistence = usePersistence()
      const currentSession = get().currentSession
      let session: import('@riddle-rush/types/game').GameSession | null = null

      try {
        session = await persistence.loadSessionById(sessionId)
      } catch {
        // Fallback handled below (current session + "current" DB slot)
      }

      // Primary lookup: direct ID store hit.
      if (session) {
        set({ currentSession: session, postRoundDecisionPending: false })
        return session
      }

      // Keep in-memory session when route transitions race DB writes.
      if (currentSession?.id === sessionId) {
        set({ currentSession, postRoundDecisionPending: false })
        return currentSession
      }

      // Secondary lookup: the current-session slot can exist even when ID index is stale.
      const currentFromDB = await persistence.loadSessionFromDB()
      if (currentFromDB?.id === sessionId) {
        set({ currentSession: currentFromDB, postRoundDecisionPending: false })
        return currentFromDB
      }

      return null
    },
    clearSession() {
      set({ currentSession: null, postRoundDecisionPending: false })
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

      await get().fetchCategories()
      const category = customCategory || categoryManager.getRandomCategory(get().categories)
      if (!category) throw new Error('Unable to start game without categories')

      const letter = customLetter || get().generateLetter()
      const players = playerManager.createPlayers(playerNames)
      const session = sessionManager.createSession(players, category, letter, gameName)

      set({ currentSession: session, postRoundDecisionPending: false, pendingPlayerNames: [] })
      // Explicit flow transition: setup → in-round
      get().transitionToInRound()
      persistPendingPlayerNames([])
      await get().saveSessionToDB()
      return session
    },
    async submitPlayerAnswer(playerId: string, answer: string) {
      const session = get().currentSession
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

      // Trigger reactive updates for Vue subscribers consuming Zustand hooks.
      set({
        currentSession: {
          ...session,
          players: [...session.players],
        },
      })

      // Check if all players submitted and transition to round-complete
      if (playerManager.allPlayersSubmitted(session.players)) {
        get().transitionToRoundComplete()
      }

      void get().saveSessionToDB()
    },

    // Flow state transition helpers for unified state management
    transitionToSetup() {
      set({ currentSession: null, postRoundDecisionPending: false })
    },

    transitionToInRound() {
      set({ postRoundDecisionPending: false })
    },

    transitionToRoundComplete() {
      const session = get().currentSession
      if (session) {
        // Mark the current round as completed by adding it to roundHistory
        // This ensures flowState returns 'round-complete'
        if (session.roundHistory.length < session.currentRound) {
          session.roundHistory.push({
            roundNumber: session.currentRound,
            category: session.category.name,
            letter: session.letter,
            timestamp: Date.now(),
            playerResults: session.players.map((player) => ({
              playerId: player.id,
              playerName: player.name,
              answer: player.currentRoundAnswer || '',
              score: player.currentRoundScore,
            })),
          })
        }
        set({
          currentSession: { ...session },
          postRoundDecisionPending: true,
        })
      }
    },

    transitionToDecision() {
      set({ postRoundDecisionPending: true })
    },

    transitionToCompleted() {
      const session = get().currentSession
      if (session) {
        session.status = 'completed'
        set({ currentSession: { ...session }, postRoundDecisionPending: false })
      }
    },

    async assignPlayerScore(playerId: string, points: number) {
      const session = get().currentSession
      if (!session) return

      const playerManager = usePlayerManager()
      const playerIndex = playerManager.findPlayerIndex(session.players, playerId)
      if (playerIndex === -1) return

      const player = session.players[playerIndex]
      if (!player) return
      playerManager.assignPlayerScore(player, points)

      // Trigger reactive updates for score-dependent UI projections.
      set({
        currentSession: {
          ...session,
          players: [...session.players],
        },
      })

      void get().saveSessionToDB()
    },
    async updatePlayerAvatar(playerId: string, avatarUrl: string) {
      const session = get().currentSession
      if (!session) return

      const playerManager = usePlayerManager()
      const playerIndex = playerManager.findPlayerIndex(session.players, playerId)
      if (playerIndex === -1) return

      const player = session.players[playerIndex]
      if (!player) return
      playerManager.updatePlayerAvatar(player, avatarUrl)

      // Trigger reactive updates for avatar-dependent UI.
      set({
        currentSession: {
          ...session,
          players: [...session.players],
        },
      })

      void get().saveSessionToDB()
    },
    async completeRound() {
      const session = get().currentSession
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
      if (get().isCurrentRoundCompleted()) {
        set({ postRoundDecisionPending: true })
        return
      }

      const lifecycle = useGameLifecycle()
      const roundResult = lifecycle.buildRoundResult(session)

      session.roundHistory.push(roundResult)
      await get().saveSessionToDB()
      // Explicit flow transition: round-complete → decision
      get().transitionToDecision()
    },
    async startNextRound(category?: Category, letter?: string) {
      const session = get().currentSession
      if (!session) return null

      const categoryManager = useCategoryManager()
      const playerManager = usePlayerManager()

      const selectedCategory = category || categoryManager.getRandomCategory(get().categories)
      if (!selectedCategory) throw new Error('Unable to start round without categories')

      const selectedLetter = letter || get().generateLetter()
      playerManager.resetPlayerRoundState(session.players)
      session.currentPlayerIndex = 0

      session.currentRound += 1
      session.category = { ...selectedCategory, letter: selectedLetter }
      session.letter = selectedLetter

      await get().saveSessionToDB()
      // Explicit flow transition: decision → in-round
      get().transitionToInRound()
      return session
    },
    async advanceToConfiguredRound(category: Category, letter: string) {
      const session = get().currentSession
      const inMemoryPendingPlayers = get().pendingPlayerNames
      const restoredPendingPlayers =
        inMemoryPendingPlayers.length > 0 ? inMemoryPendingPlayers : loadPendingPlayerNames()
      const hasPendingPlayers = restoredPendingPlayers.length > 0

      if (!session || hasPendingPlayers) {
        if (!hasPendingPlayers) {
          return null
        }

        const createdSession = await get().setupPlayers(
          restoredPendingPlayers,
          undefined,
          letter,
          category
        )

        set({
          pendingPlayerNames: [],
          selectedLetter: null,
          postRoundDecisionPending: false,
        })

        return createdSession
      }

      // Round-start flow must only advance existing multiplayer sessions.
      // A players-empty session indicates stale single-player state and is not valid
      // for configured round progression.
      if ((session.players?.length ?? 0) === 0) {
        return null
      }

      if (get().isCurrentRoundCompleted()) {
        return get().startNextRound(category, letter)
      }

      // Refresh within an active round: keep round counter stable, update round context,
      // and reset submissions for a fair restart.
      session.category = { ...category, letter }
      session.letter = letter
      await get().resetPlayerSubmissions()
      set({ postRoundDecisionPending: false })
      return session
    },
    async resetPlayerSubmissions() {
      const session = get().currentSession
      if (!session) return

      const playerManager = usePlayerManager()
      playerManager.resetPlayerSubmissions(session.players)
      session.currentPlayerIndex = 0

      await get().saveSessionToDB()
      set({ postRoundDecisionPending: false })
    },
    getPlayerById(playerId: string): Player | null {
      const session = get().currentSession
      if (!session) return null
      const playerManager = usePlayerManager()
      return playerManager.getPlayerById(session.players, playerId)
    },
  }))

const gameStoreGlobal = globalThis as typeof globalThis & {
  __RR_GAME_STORE__?: GameStoreInstance
}

export const gameStore = gameStoreGlobal.__RR_GAME_STORE__ ?? createGameStore()

if (!gameStoreGlobal.__RR_GAME_STORE__) {
  gameStoreGlobal.__RR_GAME_STORE__ = gameStore
}
