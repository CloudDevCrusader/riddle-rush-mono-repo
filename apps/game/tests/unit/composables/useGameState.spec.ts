import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useGameState } from '../../../composables/useGameState'

// --- Mock store state (Vue reactive for computed tracking) ---

const mockGameStoreState = reactive({
  currentCategory: null as string | null,
  currentLetter: '',
  currentRound: 0,
  players: [] as Array<{ name: string; totalScore: number; hasSubmitted: boolean }>,
  currentPlayerTurn: null as { name: string } | null,
  allPlayersSubmitted: false,
  isGameCompleted: false,
  leaderboard: [] as Array<{ name: string; totalScore: number; rank: number }>,
  hasActiveSession: false,
  gameStatus: 'active' as string,
})

const mockSettingsStoreState = reactive({
  soundEnabled: true,
  debugMode: false,
  language: 'de',
})

// Stub Nuxt auto-imported globals
vi.stubGlobal('useGameStore', () => mockGameStoreState)
vi.stubGlobal('useSettingsStore', () => mockSettingsStoreState)

describe('useGameState', () => {
  beforeEach(() => {
    // Reset game store mock state
    mockGameStoreState.currentCategory = null
    mockGameStoreState.currentLetter = ''
    mockGameStoreState.currentRound = 0
    mockGameStoreState.players = []
    mockGameStoreState.currentPlayerTurn = null
    mockGameStoreState.allPlayersSubmitted = false
    mockGameStoreState.isGameCompleted = false
    mockGameStoreState.leaderboard = []
    mockGameStoreState.hasActiveSession = false
    mockGameStoreState.gameStatus = 'active'

    // Reset settings store mock state
    mockSettingsStoreState.soundEnabled = true
    mockSettingsStoreState.debugMode = false
    mockSettingsStoreState.language = 'de'
  })

  // ──────────────────────────────────────────
  // Store references
  // ──────────────────────────────────────────
  describe('store references', () => {
    it('should expose gameStore and settingsStore directly', () => {
      const state = useGameState()

      expect(state.gameStore).toBe(mockGameStoreState)
      expect(state.settingsStore).toBe(mockSettingsStoreState)
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
      mockGameStoreState.currentCategory = 'Animals'
      const state = useGameState()
      expect(state.currentCategory.value).toBe('Animals')
    })

    it('should reflect currentLetter from store', () => {
      mockGameStoreState.currentLetter = 'Z'
      const state = useGameState()
      expect(state.currentLetter.value).toBe('Z')
    })

    it('should reflect currentRound from store', () => {
      mockGameStoreState.currentRound = 3
      const state = useGameState()
      expect(state.currentRound.value).toBe(3)
    })

    it('should reflect players from store', () => {
      const players = [
        { name: 'Alice', totalScore: 10, hasSubmitted: true },
        { name: 'Bob', totalScore: 5, hasSubmitted: false },
      ]
      mockGameStoreState.players = players
      const state = useGameState()
      expect(state.players.value).toEqual(players)
    })

    it('should reflect currentPlayerTurn from store', () => {
      const player = { name: 'Bob' }
      mockGameStoreState.currentPlayerTurn = player
      const state = useGameState()
      expect(state.currentPlayerTurn.value).toEqual(player)
    })

    it('should reflect allPlayersSubmitted from store', () => {
      mockGameStoreState.allPlayersSubmitted = true
      const state = useGameState()
      expect(state.allPlayersSubmitted.value).toBe(true)
    })

    it('should reflect isGameCompleted from store', () => {
      mockGameStoreState.isGameCompleted = true
      const state = useGameState()
      expect(state.isGameCompleted.value).toBe(true)
    })

    it('should reflect leaderboard from store', () => {
      const leaderboard = [
        { name: 'Alice', totalScore: 20, rank: 1 },
        { name: 'Bob', totalScore: 10, rank: 2 },
      ]
      mockGameStoreState.leaderboard = leaderboard
      const state = useGameState()
      expect(state.leaderboard.value).toEqual(leaderboard)
    })

    it('should reflect hasActiveSession from store', () => {
      mockGameStoreState.hasActiveSession = true
      const state = useGameState()
      expect(state.hasActiveSession.value).toBe(true)
    })

    it('should reflect gameStatus from store', () => {
      mockGameStoreState.gameStatus = 'completed'
      const state = useGameState()
      expect(state.gameStatus.value).toBe('completed')
    })
  })

  // ──────────────────────────────────────────
  // Return shape
  // ──────────────────────────────────────────
  describe('return value', () => {
    it('should return all 12 properties (2 stores + 10 computeds)', () => {
      const state = useGameState()

      // Direct store references
      expect(state).toHaveProperty('gameStore')
      expect(state).toHaveProperty('settingsStore')

      // Computed properties (each is a ComputedRef)
      const computedKeys = [
        'currentCategory',
        'currentLetter',
        'currentRound',
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
      expect(keys).toHaveLength(12) // 2 stores + 10 computeds
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

      // Mutate mock store
      mockGameStoreState.hasActiveSession = true
      mockGameStoreState.gameStatus = 'playing'

      // Computed re-evaluates on access
      expect(state.hasActiveSession.value).toBe(true)
      expect(state.gameStatus.value).toBe('playing')
    })

    it('should track player list changes', () => {
      const state = useGameState()
      expect(state.players.value).toEqual([])

      mockGameStoreState.players = [{ name: 'Charlie', totalScore: 0, hasSubmitted: false }]

      expect(state.players.value).toHaveLength(1)
      expect(state.players.value[0]!.name).toBe('Charlie')
    })
  })
})
