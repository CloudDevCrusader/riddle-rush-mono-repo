import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed, reactive } from 'vue'

import { useGameState } from '../../../composables/useGameState'

vi.stubGlobal('computed', computed)

// --- Mock Zustand hook response (reactive for computed tracking) ---

const mockGameSessionState = reactive({
  currentCategory: null as string | null,
  currentLetter: '',
  currentRound: 0,
  nextRoundNumber: 1,
  gameMode: 'single' as 'single' | 'multiplayer',
  flowState: 'setup' as 'setup' | 'in-round' | 'round-complete' | 'decision' | 'completed',
  isCurrentRoundCompleted: false,
  postRoundDecisionPending: false,
  players: [] as Array<{ name: string, totalScore: number, hasSubmitted: boolean }>,
  currentPlayerTurn: null as { name: string } | null,
  allPlayersSubmitted: false,
  isGameCompleted: false,
  leaderboard: [] as Array<{ name: string, totalScore: number, rank: number }>,
  hasActiveSession: false,
  gameStatus: 'active' as string,
})

// Create computed refs that wrap the mock state
const createGameSessionMock = () => ({
  currentCategory: computed(() => mockGameSessionState.currentCategory),
  currentLetter: computed(() => mockGameSessionState.currentLetter),
  currentRound: computed(() => mockGameSessionState.currentRound),
  nextRoundNumber: computed(() => mockGameSessionState.nextRoundNumber),
  gameMode: computed(() => mockGameSessionState.gameMode),
  flowState: computed(() => mockGameSessionState.flowState),
  isCurrentRoundCompleted: computed(() => mockGameSessionState.isCurrentRoundCompleted),
  postRoundDecisionPending: computed(() => mockGameSessionState.postRoundDecisionPending),
  players: computed(() => mockGameSessionState.players),
  currentPlayerTurn: computed(() => mockGameSessionState.currentPlayerTurn),
  allPlayersSubmitted: computed(() => mockGameSessionState.allPlayersSubmitted),
  isGameCompleted: computed(() => mockGameSessionState.isGameCompleted),
  leaderboard: computed(() => mockGameSessionState.leaderboard),
  hasActiveSession: computed(() => mockGameSessionState.hasActiveSession),
  gameStatus: computed(() => mockGameSessionState.gameStatus),
})

// Stub Nuxt auto-imported globals
vi.stubGlobal('useGameSession', createGameSessionMock)
vi.stubGlobal('useSettings', () => ({}))
vi.stubGlobal('useCategories', () => ({}))
vi.stubGlobal('usePlayerActions', () => ({}))
vi.stubGlobal('useGameActions', () => ({}))

describe('useGameState', () => {
  beforeEach(() => {
    // Reset game session mock state
    mockGameSessionState.currentCategory = null
    mockGameSessionState.currentLetter = ''
    mockGameSessionState.currentRound = 0
    mockGameSessionState.nextRoundNumber = 1
    mockGameSessionState.gameMode = 'single'
    mockGameSessionState.flowState = 'setup'
    mockGameSessionState.isCurrentRoundCompleted = false
    mockGameSessionState.postRoundDecisionPending = false
    mockGameSessionState.players = []
    mockGameSessionState.currentPlayerTurn = null
    mockGameSessionState.allPlayersSubmitted = false
    mockGameSessionState.isGameCompleted = false
    mockGameSessionState.leaderboard = []
    mockGameSessionState.hasActiveSession = false
    mockGameSessionState.gameStatus = 'active'
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

    it('should return 1 for nextRoundNumber when no session', () => {
      const state = useGameState()
      expect(state.nextRoundNumber.value).toBe(1)
    })

    it('should return single for gameMode by default', () => {
      const state = useGameState()
      expect(state.gameMode.value).toBe('single')
    })

    it('should return setup flowState by default', () => {
      const state = useGameState()
      expect(state.flowState.value).toBe('setup')
    })

    it('should return false for isCurrentRoundCompleted by default', () => {
      const state = useGameState()
      expect(state.isCurrentRoundCompleted.value).toBe(false)
    })

    it('should return false for postRoundDecisionPending by default', () => {
      const state = useGameState()
      expect(state.postRoundDecisionPending.value).toBe(false)
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
      mockGameSessionState.currentCategory = 'Animals'
      const state = useGameState()
      expect(state.currentCategory.value).toBe('Animals')
    })

    it('should reflect currentLetter from store', () => {
      mockGameSessionState.currentLetter = 'Z'
      const state = useGameState()
      expect(state.currentLetter.value).toBe('Z')
    })

    it('should reflect currentRound from store', () => {
      mockGameSessionState.currentRound = 3
      const state = useGameState()
      expect(state.currentRound.value).toBe(3)
    })

    it('should reflect nextRoundNumber from store', () => {
      mockGameSessionState.nextRoundNumber = 4
      const state = useGameState()
      expect(state.nextRoundNumber.value).toBe(4)
    })

    it('should reflect gameMode from store', () => {
      mockGameSessionState.gameMode = 'multiplayer'
      const state = useGameState()
      expect(state.gameMode.value).toBe('multiplayer')
    })

    it('should reflect flowState from store', () => {
      mockGameSessionState.flowState = 'decision'
      const state = useGameState()
      expect(state.flowState.value).toBe('decision')
    })

    it('should reflect isCurrentRoundCompleted from store', () => {
      mockGameSessionState.isCurrentRoundCompleted = true
      const state = useGameState()
      expect(state.isCurrentRoundCompleted.value).toBe(true)
    })

    it('should reflect postRoundDecisionPending from store', () => {
      mockGameSessionState.postRoundDecisionPending = true
      const state = useGameState()
      expect(state.postRoundDecisionPending.value).toBe(true)
    })

    it('should reflect players from store', () => {
      const players = [
        { name: 'Alice', totalScore: 10, hasSubmitted: true },
        { name: 'Bob', totalScore: 5, hasSubmitted: false },
      ]
      mockGameSessionState.players = players
      const state = useGameState()
      expect(state.players.value).toEqual(players)
    })

    it('should reflect currentPlayerTurn from store', () => {
      const player = { name: 'Bob' }
      mockGameSessionState.currentPlayerTurn = player
      const state = useGameState()
      expect(state.currentPlayerTurn.value).toEqual(player)
    })

    it('should reflect allPlayersSubmitted from store', () => {
      mockGameSessionState.allPlayersSubmitted = true
      const state = useGameState()
      expect(state.allPlayersSubmitted.value).toBe(true)
    })

    it('should reflect isGameCompleted from store', () => {
      mockGameSessionState.isGameCompleted = true
      const state = useGameState()
      expect(state.isGameCompleted.value).toBe(true)
    })

    it('should reflect leaderboard from store', () => {
      const leaderboard = [
        { name: 'Alice', totalScore: 20, rank: 1 },
        { name: 'Bob', totalScore: 10, rank: 2 },
      ]
      mockGameSessionState.leaderboard = leaderboard
      const state = useGameState()
      expect(state.leaderboard.value).toEqual(leaderboard)
    })

    it('should reflect hasActiveSession from store', () => {
      mockGameSessionState.hasActiveSession = true
      const state = useGameState()
      expect(state.hasActiveSession.value).toBe(true)
    })

    it('should reflect gameStatus from store', () => {
      mockGameSessionState.gameStatus = 'completed'
      const state = useGameState()
      expect(state.gameStatus.value).toBe('completed')
    })
  })

  // ──────────────────────────────────────────
  // Return shape
  // ──────────────────────────────────────────
  describe('return value', () => {
    it('should return all expected computed properties', () => {
      const state = useGameState()

      // Computed properties (each is a ComputedRef)
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
        // Each computed has a .value (ComputedRef)
        expect((state as Record<string, any>)[key]).toHaveProperty('value')
      }
    })

    it('should not include extra unexpected properties', () => {
      const state = useGameState()
      const keys = Object.keys(state)
      expect(keys).toHaveLength(20)
      expect(keys).toEqual(
        expect.arrayContaining([
          'gameState',
          'gameStore',
          'settingsStore',
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        ])
      )
    })
  })
=======
=======
>>>>>>> Stashed changes
        ]),
      );
    });
  });
>>>>>>> Stashed changes

  // ──────────────────────────────────────────
  // Reactivity
  // ──────────────────────────────────────────
  describe('reactivity', () => {
    it('should track store changes through computed properties', () => {
      const state = useGameState()

      // Initially no active session
      expect(state.hasActiveSession.value).toBe(false)
      expect(state.gameStatus.value).toBe('active')

      // Mutate mock store
      mockGameSessionState.hasActiveSession = true
      mockGameSessionState.gameStatus = 'playing'

      // Computed re-evaluates on access
      expect(state.hasActiveSession.value).toBe(true)
      expect(state.gameStatus.value).toBe('playing')
    })

    it('should track player list changes', () => {
      const state = useGameState()
      expect(state.players.value).toEqual([])

      mockGameSessionState.players = [{ name: 'Charlie', totalScore: 0, hasSubmitted: false }]

      expect(state.players.value).toHaveLength(1)
      expect(state.players.value[0]!.name).toBe('Charlie')
    })

    it('should derive proceed and confirm states from flowState', () => {
      const state = useGameState()
      mockGameSessionState.players = [{ name: 'Alice', totalScore: 0, hasSubmitted: false }]

      mockGameSessionState.flowState = 'in-round'
      expect(state.canConfirmRoundScores.value).toBe(false)
      expect(state.canProceedToResults.value).toBe(false)

      mockGameSessionState.flowState = 'round-complete'
      expect(state.canConfirmRoundScores.value).toBe(true)
      expect(state.canProceedToResults.value).toBe(true)

      mockGameSessionState.flowState = 'decision'
      expect(state.canConfirmRoundScores.value).toBe(false)
      expect(state.canProceedToResults.value).toBe(true)
    })

    it('should always allow proceed for single-player sessions', () => {
      const state = useGameState()

      mockGameSessionState.players = []
      mockGameSessionState.flowState = 'in-round'

      expect(state.canProceedToResults.value).toBe(true)
    })
  })
})
