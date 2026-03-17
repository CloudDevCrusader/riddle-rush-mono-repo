import { create } from 'zustand'
import { useCategoryEmoji } from '../../composables/useCategoryEmoji'
import { useCategoryManager } from '../../composables/useCategoryManager'
import { useSessionManager } from '../../composables/useSessionManager'
import { usePlayerManager } from '../../composables/usePlayerManager'
import { usePersistence } from '../../composables/usePersistence'
import { useGameLifecycle } from '../../composables/useGameLifecycle'
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

export const useGameStore = create<
  GameState & {
    // Getters
    hasActiveSession: boolean
    canInstall: boolean
    currentCategory: Category | null
    currentLetter: string
    displayedCategories: Category[]
    hasMoreCategories: boolean
    categoryEmoji: (name?: string | null) => string
    players: Player[]
    currentRound: number
    allPlayersSubmitted: boolean
    currentPlayerTurn: Player | null
    leaderboard: PlayerWithRank[]
    isGameCompleted: boolean
    gameStatus: string

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
    resetPlayerSubmissions: () => Promise<void>
    getPlayerById: (playerId: string) => Player | null
  }
>()((set, get) => ({
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

  // Getters
  get hasActiveSession() {
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
  get isGameCompleted() {
    return get().currentSession?.status === 'completed'
  },
  get gameStatus() {
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
      set({ currentSession: session })
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

    set({ currentSession: null })
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

    set({ currentSession: null })
  },
  setOnlineStatus(status: boolean) {
    set({ isOnline: status })
  },
  setInstallPrompt(event: BeforeInstallPromptEvent | null) {
    set({ installPromptEvent: event })
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
    if (session) set({ currentSession: session })

    const history = await persistence.loadHistoryFromDB()
    if (history) set({ history })
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
    const session = await persistence.loadSessionById(sessionId)
    set({ currentSession: session })
    return session
  },
  clearSession() {
    set({ currentSession: null })
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

    set({ currentSession: session })
    await get().saveSessionToDB()
    return session
  },
  async submitPlayerAnswer(playerId: string, answer: string) {
    const session = get().currentSession
    if (!session) return

    const playerManager = usePlayerManager()
    const playerIndex = playerManager.findPlayerIndex(session.players, playerId)
    if (playerIndex === -1) return

    const player = session.players[playerIndex]
    if (!player) return
    playerManager.submitPlayerAnswer(player, answer)
    session.currentPlayerIndex = playerManager.advancePlayerIndex(
      session.currentPlayerIndex,
      session.players.length
    )

    await get().saveSessionToDB()
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

    await get().saveSessionToDB()
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

    await get().saveSessionToDB()
  },
  async completeRound() {
    const session = get().currentSession
    if (!session) return

    const lifecycle = useGameLifecycle()
    const roundResult = lifecycle.buildRoundResult(session)

    session.roundHistory.push(roundResult)
    await get().saveSessionToDB()
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
    return session
  },
  async resetPlayerSubmissions() {
    const session = get().currentSession
    if (!session) return

    const playerManager = usePlayerManager()
    playerManager.resetPlayerSubmissions(session.players)
    session.currentPlayerIndex = 0

    await get().saveSessionToDB()
  },
  getPlayerById(playerId: string): Player | null {
    const session = get().currentSession
    if (!session) return null
    const playerManager = usePlayerManager()
    return playerManager.getPlayerById(session.players, playerId)
  },
}))
