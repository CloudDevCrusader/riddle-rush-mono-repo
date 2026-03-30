import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useGameState } from '../../../composables/useGameState'

// --- Mock reactive state backing the composable hooks ---

const mockSessionState = reactive({
  currentCategory: null as string | null,
  currentLetter: '',
  currentRound: 0,
  nextRoundNumber: 1,
  gameMode: 'multiplayer' as string,
  flowState: 'setup' as string,
  players: [] as Array<{ name: string; totalScore: number; hasSubmitted: boolean }>,
  currentPlayerTurn: null as { name: string } | null,
  allPlayersSubmitted: false,
  isCurrentRoundCompleted: false,
  postRoundDecisionPending: false,
  isGameCompleted: false,
  leaderboard: [] as Array<{ name: string; totalScore: number; rank: number }>,
  hasActiveSession: false,
  gameStatus: 'active' as string,
})

const mockSettingsState = reactive({
  soundEnabled: true,
  debugMode: false,
  language: 'de',
})

// --- Build mock composable returns ---

function buildMockGameSession() {
  return {
    currentCategory: computed(() => mockSessionState.currentCategory),
    currentLetter: computed(() => mockSessionState.currentLetter),
    currentRound: computed(() => mockSessionState.currentRound),
    nextRoundNumber: computed(() => mockSessionState.nextRoundNumber),
    gameMode: computed(() => mockSessionState.gameMode),
    flowState: computed(() => mockSessionState.flowState),
    players: computed(() => mockSessionState.players),
    currentPlayerTurn: computed(() => mockSessionState.currentPlayerTurn),
    allPlayersSubmitted: computed(() => mockSessionState.allPlayersSubmitted),
    isCurrentRoundCompleted: computed(() => mockSessionState.isCurrentRoundCompleted),
    postRoundDecisionPending: computed(() => mockSessionState.postRoundDecisionPending),
    isGameCompleted: computed(() => mockSessionState.isGameCompleted),
    leaderboard: computed(() => mockSessionState.leaderboard),
    hasActiveSession: computed(() => mockSessionState.hasActiveSession),
    gameStatus: computed(() => mockSessionState.gameStatus),
    currentSession: computed(() => null),
    history: computed(() => []),
    isOnline: computed(() => true),
    pendingPlayerNames: computed(() => []),
    selectedLetter: computed(() => ''),
    resumeOrStartNewGame: vi.fn(),
    startNewGame: vi.fn(),
    endGame: vi.fn(),
    completeGame: vi.fn(),
    abandonGame: vi.fn(),
    clearSession: vi.fn(),
    loadFromDB: vi.fn(),
    saveSessionToDB: vi.fn(),
    saveHistoryToDB: vi.fn(),
    loadSessionById: vi.fn(),
    setupPlayers: vi.fn(),
    advanceToConfiguredRound: vi.fn(),
    generateLetter: vi.fn(),
    setOnlineStatus: vi.fn(),
    setPendingPlayerNames: vi.fn(),
  }
}

function buildMockSettings() {
  return {
    soundEnabled: computed(() => mockSettingsState.soundEnabled),
    debugMode: computed(() => mockSettingsState.debugMode),
    language: computed(() => mockSettingsState.language),
    maxPlayersPerGame: computed(() => 10),
    showLeaderboardAfterRound: computed(() => true),
    leaderboardEnabled: computed(() => true),
    soundVolume: computed(() => 1),
    musicEnabled: computed(() => true),
    musicVolume: computed(() => 1),
    offlineMode: computed(() => false),
    fortuneWheelEnabled: computed(() => true),
    websocketEnabled: computed(() => false),
    answerInputEnabled: computed(() => true),
    isDebugMode: computed(() => false),
    isLeaderboardEnabled: computed(() => true),
    shouldShowLeaderboard: computed(() => true),
    isFortuneWheelEnabled: computed(() => true),
    isWebSocketEnabled: computed(() => false),
    isAnswerInputEnabled: computed(() => true),
    updateSetting: vi.fn(),
    toggleDebugMode: vi.fn(),
    toggleLeaderboard: vi.fn(),
    toggleSound: vi.fn(),
    toggleFortuneWheel: vi.fn(),
    toggleWebSocket: vi.fn(),
    toggleAnswerInput: vi.fn(),
    setOfflineMode: vi.fn(),
    resetToDefaults: vi.fn(),
    setLanguage: vi.fn(),
    getLanguage: vi.fn(),
  }
}

function buildMockCategories() {
  return {
    categories: computed(() => []),
    categoriesLoaded: computed(() => false),
    categoriesLoading: computed(() => false),
    displayedCategoryCount: computed(() => 0),
    categoryLoadError: computed(() => null),
    displayedCategories: computed(() => []),
    hasMoreCategories: computed(() => false),
    fetchCategories: vi.fn(),
    loadMoreCategories: vi.fn(),
    resetDisplayedCategories: vi.fn(),
    getCategoryById: vi.fn(),
    getRandomCategory: vi.fn(),
    categoryEmoji: vi.fn(),
  }
}

function buildMockPlayerActions() {
  return {
    submitPlayerAnswer: vi.fn(),
    assignPlayerScore: vi.fn(),
    updatePlayerAvatar: vi.fn(),
    completeRound: vi.fn(),
    startNextRound: vi.fn(),
    resetPlayerSubmissions: vi.fn(),
    getPlayerById: vi.fn(),
  }
}

function buildMockGameActions() {
  return {
    startNewGame: vi.fn(),
    resumeOrStartGame: vi.fn(),
    endGame: vi.fn(),
    shareScore: vi.fn(),
    setupMultiplayerGame: vi.fn(),
    startNextRound: vi.fn(),
    startConfiguredRound: vi.fn(),
    transitionToRoundComplete: vi.fn(),
  }
}

// Stub Nuxt auto-imported composables
const mockGameSession = buildMockGameSession()
const mockSettings = buildMockSettings()
const mockCategories = buildMockCategories()
const mockPlayerActions = buildMockPlayerActions()
const mockGameActions = buildMockGameActions()

vi.stubGlobal('useGameSession', () => mockGameSession)
vi.stubGlobal('useSettings', () => mockSettings)
vi.stubGlobal('useCategories', () => mockCategories)
vi.stubGlobal('usePlayerActions', () => mockPlayerActions)
vi.stubGlobal('useGameActions', () => mockGameActions)

describe('useGameState', () => {
  beforeEach(() => {
    // Reset session state
    mockSessionState.currentCategory = null
    mockSessionState.currentLetter = ''
    mockSessionState.currentRound = 0
    mockSessionState.nextRoundNumber = 1
    mockSessionState.gameMode = 'multiplayer'
    mockSessionState.flowState = 'setup'
    mockSessionState.players = []
    mockSessionState.currentPlayerTurn = null
    mockSessionState.allPlayersSubmitted = false
    mockSessionState.isCurrentRoundCompleted = false
    mockSessionState.postRoundDecisionPending = false
    mockSessionState.isGameCompleted = false
    mockSessionState.leaderboard = []
    mockSessionState.hasActiveSession = false
    mockSessionState.gameStatus = 'active'

    // Reset settings state
    mockSettingsState.soundEnabled = true
    mockSettingsState.debugMode = false
    mockSettingsState.language = 'de'
  })

  // ──────────────────────────────────────────
  // Store references
  // ──────────────────────────────────────────
  describe('store references', () => {
    it('should expose gameStore and settingsStore', () => {
      const state = useGameState()

      expect(state.gameStore).toBeDefined()
      expect(state.gameState).toBeDefined()
      expect(state.settingsStore).toBeDefined()
    })

    it('should alias gameStore to gameState', () => {
      const state = useGameState()
      expect(state.gameStore).toBe(state.gameState)
    })
  })

  // ──────────────────────────────────────────
  // Computed properties - default values
  // ──────────────────────────────────────────
  describe('computed properties - defaults', () => {
    it('should return null for currentCategory when no session', () => {
      const state = useGameState()
      expect(state.currentCategory.value).toBeNull()
    })

    it('should return empty string for currentLetter when no session', () => {
      const state = useGameState()
      expect(state.currentLetter.value).toBe('')
    })

    it('should return 0 for currentRound when no session', () => {
      const state = useGameState()
      expect(state.currentRound.value).toBe(0)
    })

    it('should return empty array for players when no session', () => {
      const state = useGameState()
      expect(state.players.value).toEqual([])
    })

    it('should return null for currentPlayerTurn when no session', () => {
      const state = useGameState()
      expect(state.currentPlayerTurn.value).toBeNull()
    })

    it('should return false for allPlayersSubmitted when no session', () => {
      const state = useGameState()
      expect(state.allPlayersSubmitted.value).toBe(false)
    })

    it('should return false for isGameCompleted when no session', () => {
      const state = useGameState()
      expect(state.isGameCompleted.value).toBe(false)
    })

    it('should return empty array for leaderboard when no session', () => {
      const state = useGameState()
      expect(state.leaderboard.value).toEqual([])
    })

    it('should return false for hasActiveSession when no session', () => {
      const state = useGameState()
      expect(state.hasActiveSession.value).toBe(false)
    })

    it('should return "active" for gameStatus when no session', () => {
      const state = useGameState()
      expect(state.gameStatus.value).toBe('active')
    })
  })

  // ──────────────────────────────────────────
  // Computed properties - with store data
  // ──────────────────────────────────────────
  describe('computed properties - with data', () => {
    it('should reflect currentCategory from store', () => {
      mockSessionState.currentCategory = 'Animals'
      const state = useGameState()
      expect(state.currentCategory.value).toBe('Animals')
    })

    it('should reflect currentLetter from store', () => {
      mockSessionState.currentLetter = 'Z'
      const state = useGameState()
      expect(state.currentLetter.value).toBe('Z')
    })

    it('should reflect currentRound from store', () => {
      mockSessionState.currentRound = 3
      const state = useGameState()
      expect(state.currentRound.value).toBe(3)
    })

    it('should reflect players from store', () => {
      const players = [
        { name: 'Alice', totalScore: 10, hasSubmitted: true },
        { name: 'Bob', totalScore: 5, hasSubmitted: false },
      ]
      mockSessionState.players = players
      const state = useGameState()
      expect(state.players.value).toEqual(players)
    })

    it('should reflect currentPlayerTurn from store', () => {
      const player = { name: 'Bob' }
      mockSessionState.currentPlayerTurn = player
      const state = useGameState()
      expect(state.currentPlayerTurn.value).toEqual(player)
    })

    it('should reflect allPlayersSubmitted from store', () => {
      mockSessionState.allPlayersSubmitted = true
      const state = useGameState()
      expect(state.allPlayersSubmitted.value).toBe(true)
    })

    it('should reflect isGameCompleted from store', () => {
      mockSessionState.isGameCompleted = true
      const state = useGameState()
      expect(state.isGameCompleted.value).toBe(true)
    })

    it('should reflect leaderboard from store', () => {
      const leaderboard = [
        { name: 'Alice', totalScore: 20, rank: 1 },
        { name: 'Bob', totalScore: 10, rank: 2 },
      ]
      mockSessionState.leaderboard = leaderboard
      const state = useGameState()
      expect(state.leaderboard.value).toEqual(leaderboard)
    })

    it('should reflect hasActiveSession from store', () => {
      mockSessionState.hasActiveSession = true
      const state = useGameState()
      expect(state.hasActiveSession.value).toBe(true)
    })

    it('should reflect gameStatus from store', () => {
      mockSessionState.gameStatus = 'completed'
      const state = useGameState()
      expect(state.gameStatus.value).toBe('completed')
    })
  })

  // ──────────────────────────────────────────
  // Return shape
  // ──────────────────────────────────────────
  describe('return value', () => {
    it('should return all expected properties (3 store refs + 17 computed refs)', () => {
      const state = useGameState()

      // Store object references
      expect(state).toHaveProperty('gameState')
      expect(state).toHaveProperty('gameStore')
      expect(state).toHaveProperty('settingsStore')

      // Computed properties from useGameSession (each has .value)
      const computedKeys = [
        'currentCategory',
        'currentLetter',
        'currentRound',
        'nextRoundNumber',
        'gameMode',
        'flowState',
        'canProceedToResults',
        'canConfirmRoundScores',
        'isCurrentRoundCompleted',
        'postRoundDecisionPending',
        'players',
        'currentPlayerTurn',
        'allPlayersSubmitted',
        'isGameCompleted',
        'leaderboard',
        'hasActiveSession',
        'gameStatus',
      ]

      for (const key of computedKeys) {
        expect(state).toHaveProperty(key)
        expect((state as Record<string, any>)[key]).toHaveProperty('value')
      }
    })

    it('should not include extra unexpected properties', () => {
      const state = useGameState()
      const keys = Object.keys(state)
      // 3 store refs (gameState, gameStore, settingsStore) + 17 computed refs
      expect(keys).toHaveLength(20)
    })
  })

  // ──────────────────────────────────────────
  // Reactivity
  // ──────────────────────────────────────────
  describe('reactivity', () => {
    it('should track store changes through computed properties', () => {
      const state = useGameState()

      // Initially no active session
      expect(state.hasActiveSession.value).toBe(false)
      expect(state.gameStatus.value).toBe('active')

      // Mutate mock state
      mockSessionState.hasActiveSession = true
      mockSessionState.gameStatus = 'playing'

      // Computed re-evaluates on access
      expect(state.hasActiveSession.value).toBe(true)
      expect(state.gameStatus.value).toBe('playing')
    })

    it('should track player list changes', () => {
      const state = useGameState()
      expect(state.players.value).toEqual([])

      mockSessionState.players = [{ name: 'Charlie', totalScore: 0, hasSubmitted: false }]

      expect(state.players.value).toHaveLength(1)
      expect(state.players.value[0]!.name).toBe('Charlie')
    })
  })

  // ──────────────────────────────────────────
  // canProceedToResults logic
  // ──────────────────────────────────────────
  describe('canProceedToResults', () => {
    it('should be true when no players (single-player mode)', () => {
      const state = useGameState()
      expect(state.canProceedToResults.value).toBe(true)
    })

    it('should be true when all players submitted', () => {
      mockSessionState.players = [{ name: 'A', totalScore: 0, hasSubmitted: true }]
      mockSessionState.allPlayersSubmitted = true
      const state = useGameState()
      expect(state.canProceedToResults.value).toBe(true)
    })

    it('should be true when flowState is round-complete', () => {
      mockSessionState.players = [{ name: 'A', totalScore: 0, hasSubmitted: false }]
      mockSessionState.flowState = 'round-complete'
      const state = useGameState()
      expect(state.canProceedToResults.value).toBe(true)
    })

    it('should be true when flowState is decision', () => {
      mockSessionState.players = [{ name: 'A', totalScore: 0, hasSubmitted: false }]
      mockSessionState.flowState = 'decision'
      const state = useGameState()
      expect(state.canProceedToResults.value).toBe(true)
    })

    it('should be false when players exist but none submitted and in-round', () => {
      mockSessionState.players = [{ name: 'A', totalScore: 0, hasSubmitted: false }]
      mockSessionState.flowState = 'in-round'
      const state = useGameState()
      expect(state.canProceedToResults.value).toBe(false)
    })
  })

  // ──────────────────────────────────────────
  // canConfirmRoundScores logic
  // ──────────────────────────────────────────
  describe('canConfirmRoundScores', () => {
    it('should be true only when flowState is round-complete', () => {
      mockSessionState.flowState = 'round-complete'
      const state = useGameState()
      expect(state.canConfirmRoundScores.value).toBe(true)
    })

    it('should be false for other flow states', () => {
      mockSessionState.flowState = 'in-round'
      const state = useGameState()
      expect(state.canConfirmRoundScores.value).toBe(false)
    })
  })
})
