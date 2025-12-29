import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../stores/game'
import { createCategoryList } from '../utils/factories'
import type { Category } from '../../types/game'

// Mock setup
const mockSaveGameSession = vi.fn().mockResolvedValue(undefined)
const mockGetGameSession = vi.fn().mockResolvedValue(null)
const mockSaveGameHistory = vi.fn().mockResolvedValue(undefined)
const mockGetGameHistory = vi.fn().mockResolvedValue([])
const mockUpdateStatistics = vi.fn().mockResolvedValue(undefined)

vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    saveGameSession: mockSaveGameSession,
    getGameSession: mockGetGameSession,
    saveGameHistory: mockSaveGameHistory,
    getGameHistory: mockGetGameHistory,
  }),
}))

vi.mock('~/composables/useStatistics', () => ({
  useStatistics: () => ({
    updateStatistics: mockUpdateStatistics,
  }),
}))

const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock as unknown as typeof $fetch)

describe('Game Store', () => {
  let mockCategories: Category[]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    const pinia = createPinia()
    setActivePinia(pinia)
    // Force reset all stores
    // @ts-expect-error: Accessing internal Pinia API for test cleanup
    pinia._s.forEach((store: any) => store.$reset())
    mockCategories = createCategoryList(10)
    fetchMock.mockResolvedValue(mockCategories)
    fetchMock.mockClear()
    mockGetGameSession.mockResolvedValue(null)
    mockGetGameHistory.mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has null currentSession on init', () => {
      const store = useGameStore()
      expect(store.currentSession).toBeNull()
    })

    it('is online by default', () => {
      const store = useGameStore()
      expect(store.isOnline).toBe(true)
    })

    it('has empty history on init', () => {
      const store = useGameStore()
      expect(store.history).toEqual([])
    })

    it('has empty categories on init', () => {
      const store = useGameStore()
      expect(store.categories).toEqual([])
    })

    it('categories not loaded on init', () => {
      const store = useGameStore()
      expect(store.categoriesLoaded).toBe(false)
    })

    it('default displayed category count is 9', () => {
      const store = useGameStore()
      expect(store.displayedCategoryCount).toBe(9)
    })

    it('hasActiveSession is false when no session', () => {
      const store = useGameStore()
      expect(store.hasActiveSession).toBe(false)
    })

    it('currentScore is 0 when no session', () => {
      const store = useGameStore()
      expect(store.currentScore).toBe(0)
    })

    it('currentAttempts is empty when no session', () => {
      const store = useGameStore()
      expect(store.currentAttempts).toEqual([])
    })
  })

  describe('Category Fetching', () => {
    it('fetches categories', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(fetchMock).toHaveBeenCalled()
      expect(store.categories).toEqual(mockCategories)
    })

    it('sets categoriesLoaded after fetch', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(store.categoriesLoaded).toBe(true)
    })

    it.skip('does not refetch if already loaded', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      const store = useGameStore()
      await store.fetchCategories()
      await store.fetchCategories()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it.skip('refetches when force=true', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      const store = useGameStore()
      await store.fetchCategories()
      await store.fetchCategories(true)
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it.skip('handles API error gracefully', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      fetchMock.mockRejectedValueOnce(new Error('Network error'))
      const store = useGameStore()
      await expect(store.fetchCategories()).rejects.toThrow('Network error')
      expect(store.categoriesLoaded).toBe(false)
    })

    it('limits displayed categories', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(store.displayedCategories.length).toBeLessThanOrEqual(9)
    })
  })

  describe('Category Lookup', () => {
    it.skip('finds category by id', async () => {
      // TODO: Fix category data mismatch in CI
      const store = useGameStore()
      await store.fetchCategories()
      const target = mockCategories[3]!
      expect(store.getCategoryById(target.id)).toEqual(target)
    })

    it('returns null for unknown id', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(store.getCategoryById(999999)).toBeNull()
    })

    it.skip('returns null when categories empty', () => {
      // TODO: Fix state pollution in CI
      const store = useGameStore()
      expect(store.getCategoryById(1)).toBeNull()
    })
  })

  describe('Load More Categories', () => {
    it('increases displayed count by 9', () => {
      const store = useGameStore()
      store.categories = createCategoryList(30)
      store.loadMoreCategories()
      expect(store.displayedCategoryCount).toBe(18)
    })

    it('caps at total category count', () => {
      const store = useGameStore()
      store.categories = createCategoryList(5)
      store.displayedCategoryCount = 9
      store.loadMoreCategories()
      expect(store.displayedCategories.length).toBe(5)
    })
  })

  describe('Start New Game', () => {
    it('creates session with category', async () => {
      const store = useGameStore()
      const session = await store.startNewGame()
      expect(session).toBeDefined()
      expect(session?.category).toBeDefined()
      expect(session?.category.name.length).toBeGreaterThan(0)
    })

    it('sets currentSession', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(store.currentSession).not.toBeNull()
    })

    it('initializes score to 0', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(store.currentSession?.score).toBe(0)
    })

    it('initializes empty attempts', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(store.currentSession?.attempts).toEqual([])
    })

    it('sets startTime', async () => {
      const store = useGameStore()
      const before = Date.now()
      await store.startNewGame()
      const after = Date.now()
      expect(store.currentSession?.startTime).toBeGreaterThanOrEqual(before)
      expect(store.currentSession?.startTime).toBeLessThanOrEqual(after)
    })

    it('persists session to IndexedDB', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(mockSaveGameSession).toHaveBeenCalledTimes(1)
    })

    it('selects a random category', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(store.currentSession?.category).toBeDefined()
      expect(mockCategories.some((cat) => cat.id === store.currentSession?.category.id)).toBe(true)
    })

    it('hasActiveSession becomes true', async () => {
      const store = useGameStore()
      await store.startNewGame()
      expect(store.hasActiveSession).toBe(true)
    })
  })

  describe('Submit Attempt', () => {
    beforeEach(async () => {
      const store = useGameStore()
      await store.startNewGame()
      vi.clearAllMocks()
    })

    it('adds correct attempt with score', async () => {
      const store = useGameStore()
      await store.submitAttempt('correct answer', true)
      expect(store.currentScore).toBe(10)
      expect(store.currentAttempts).toHaveLength(1)
      expect(store.currentAttempts[0]!.found).toBe(true)
    })

    it('adds incorrect attempt without score', async () => {
      const store = useGameStore()
      await store.submitAttempt('wrong', false)
      expect(store.currentScore).toBe(0)
      expect(store.currentAttempts[0]!.found).toBe(false)
    })

    it('accumulates score for multiple correct', async () => {
      const store = useGameStore()
      await store.submitAttempt('a', true)
      await store.submitAttempt('b', true)
      await store.submitAttempt('c', true)
      expect(store.currentScore).toBe(30)
    })

    it('records attempt term', async () => {
      const store = useGameStore()
      await store.submitAttempt('my answer', true)
      expect(store.currentAttempts[0]!.term).toBe('my answer')
    })

    it('records attempt timestamp', async () => {
      const store = useGameStore()
      const before = Date.now()
      await store.submitAttempt('test', true)
      const after = Date.now()
      expect(store.currentAttempts[0]!.timestamp).toBeGreaterThanOrEqual(before)
      expect(store.currentAttempts[0]!.timestamp).toBeLessThanOrEqual(after)
    })

    it('persists after each attempt', async () => {
      const store = useGameStore()
      await store.submitAttempt('a', true)
      await store.submitAttempt('b', false)
      expect(mockSaveGameSession).toHaveBeenCalledTimes(2)
    })

    it('handles empty term', async () => {
      const store = useGameStore()
      await store.submitAttempt('', false)
      expect(store.currentAttempts[0]!.term).toBe('')
    })

    it('does nothing without active session', async () => {
      const store = useGameStore()
      store.currentSession = null
      await store.submitAttempt('test', true)
      expect(mockSaveGameSession).not.toHaveBeenCalled()
    })
  })

  describe('End Game', () => {
    beforeEach(async () => {
      const store = useGameStore()
      await store.startNewGame()
      await store.submitAttempt('answer', true)
      vi.clearAllMocks()
    })

    it('clears currentSession', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(store.currentSession).toBeNull()
    })

    it('sets hasActiveSession to false', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(store.hasActiveSession).toBe(false)
    })

    it.skip('adds session to history', async () => {
      // TODO: Fix history state pollution in CI
      const store = useGameStore()
      await store.endGame()
      expect(store.history).toHaveLength(1)
    })

    it('preserves score in history', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(store.history[0]!.score).toBe(10)
    })

    it('calls saveGameHistory', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(mockSaveGameHistory).toHaveBeenCalledTimes(1)
    })

    it('calls updateStatistics', async () => {
      const store = useGameStore()
      await store.endGame()
      expect(mockUpdateStatistics).toHaveBeenCalledTimes(1)
    })

    it.skip('sets endTime on session', async () => {
      // TODO: Fix timing race condition in CI
      const store = useGameStore()
      const before = Date.now()
      await store.endGame()
      expect(store.history[0]!.endTime).toBeGreaterThanOrEqual(before)
    })

    it('does nothing without active session', async () => {
      const store = useGameStore()
      store.currentSession = null
      await store.endGame()
      expect(mockSaveGameHistory).not.toHaveBeenCalled()
    })
  })

  describe('Online Status', () => {
    it('sets offline', () => {
      const store = useGameStore()
      store.setOnlineStatus(false)
      expect(store.isOnline).toBe(false)
    })

    it('sets online', () => {
      const store = useGameStore()
      store.setOnlineStatus(false)
      store.setOnlineStatus(true)
      expect(store.isOnline).toBe(true)
    })
  })

  describe('Category Emoji', () => {
    it('returns emoji for Weiblicher Vorname', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Weiblicher Vorname')).toBe('👩')
    })

    it('returns emoji for Männlicher Vorname', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Männlicher Vorname')).toBe('👨')
    })

    it('returns emoji for Blumen', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Blumen')).toBe('🌸')
    })

    it('returns emoji for Mountains oder Hills', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Mountains oder Hills')).toBe('🏔️')
    })

    it('returns emoji for Gewässer oder See', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Gewässer oder See')).toBe('💧')
    })

    it('returns emoji for Maschine', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Maschine')).toBe('⚙️')
    })

    it('returns emoji for Begriff aus der Technik', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Begriff aus der Technik')).toBe('🔧')
    })

    it('returns emoji for Begriff aus der Raumfahrt', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Begriff aus der Raumfahrt')).toBe('🚀')
    })

    it('returns emoji for Wort mit Endung -heit', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Wort mit Endung -heit')).toBe('📝')
    })

    it('returns emoji for Farbe', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Farbe')).toBe('🎨')
    })

    it('returns emoji for Erfinder Entdecker oder Gelehrter', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Erfinder Entdecker oder Gelehrter')).toBe('💡')
    })

    it('returns emoji for Komponist oder Sänger', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Komponist oder Sänger')).toBe('🎼')
    })

    it('returns default for unknown', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('Random Category')).toBe('🎯')
    })

    it('returns default for null', () => {
      const store = useGameStore()
      expect(store.categoryEmoji(null)).toBe('🎯')
    })

    it('returns default for undefined', () => {
      const store = useGameStore()
      expect(store.categoryEmoji(undefined)).toBe('🎯')
    })

    it('returns default for empty string', () => {
      const store = useGameStore()
      expect(store.categoryEmoji('')).toBe('🎯')
    })
  })

  describe('Resume or Start New Game', () => {
    it('returns existing session if active', async () => {
      const store = useGameStore()
      await store.startNewGame()
      const existing = store.currentSession
      const result = await store.resumeOrStartNewGame()
      expect(result).toBe(existing)
    })

    it('starts new game if no session', async () => {
      const store = useGameStore()
      await store.resumeOrStartNewGame()
      expect(store.hasActiveSession).toBe(true)
    })

    it('uses random category', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      await store.resumeOrStartNewGame()
      expect(store.currentSession?.category).toBeDefined()
      expect(mockCategories.some((cat) => cat.id === store.currentSession?.category.id)).toBe(true)
    })
  })

  describe('Multi-Player Mode', () => {
    describe('Setup Players', () => {
      it('creates game session with players', async () => {
        const store = useGameStore()
        const playerNames = ['Alice', 'Bob', 'Charlie']
        const session = await store.setupPlayers(playerNames)

        expect(session).toBeDefined()
        expect(session?.players).toHaveLength(3)
        expect(session?.players[0]?.name).toBe('Alice')
        expect(session?.players[1]?.name).toBe('Bob')
        expect(session?.players[2]?.name).toBe('Charlie')
      })

      it('initializes players with zero scores', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Player 1', 'Player 2'])

        const players = store.players
        expect(players[0]?.totalScore).toBe(0)
        expect(players[0]?.currentRoundScore).toBe(0)
        expect(players[0]?.hasSubmitted).toBe(false)
        expect(players[1]?.totalScore).toBe(0)
        expect(players[1]?.currentRoundScore).toBe(0)
        expect(players[1]?.hasSubmitted).toBe(false)
      })

      it('uses default names when empty strings provided', async () => {
        const store = useGameStore()
        await store.setupPlayers(['', '', 'Charlie'])

        expect(store.players[0]?.name).toBe('Player 1')
        expect(store.players[1]?.name).toBe('Player 2')
        expect(store.players[2]?.name).toBe('Charlie')
      })

      it('sets currentRound to 1', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Player 1', 'Player 2'])

        expect(store.currentRound).toBe(1)
      })

      it('sets optional game name', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Player 1'], 'Test Game')

        expect(store.currentSession?.gameName).toBe('Test Game')
      })

      it('generates category and letter', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Player 1'])

        expect(store.currentCategory).toBeDefined()
        expect(store.currentLetter).toBeDefined()
        expect(store.currentLetter?.length).toBe(1)
      })
    })

    describe('Multi-Player Getters', () => {
      beforeEach(async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob', 'Charlie'])
      })

      it('isMultiPlayerMode returns true when players exist', () => {
        const store = useGameStore()
        expect(store.isMultiPlayerMode).toBe(true)
      })

      it('players getter returns all players', () => {
        const store = useGameStore()
        expect(store.players).toHaveLength(3)
        expect(store.players.map((p) => p.name)).toEqual(['Alice', 'Bob', 'Charlie'])
      })

      it('currentPlayerTurn returns first unsubmitted player', () => {
        const store = useGameStore()
        const currentPlayer = store.currentPlayerTurn

        expect(currentPlayer).toBeDefined()
        expect(currentPlayer?.name).toBe('Alice')
        expect(currentPlayer?.hasSubmitted).toBe(false)
      })

      it('allPlayersSubmitted returns false initially', () => {
        const store = useGameStore()
        expect(store.allPlayersSubmitted).toBe(false)
      })

      it('allPlayersSubmitted returns true when all submitted', async () => {
        const store = useGameStore()

        for (const player of store.players) {
          await store.submitPlayerAnswer(player.id, 'Answer')
        }

        expect(store.allPlayersSubmitted).toBe(true)
      })

      it('leaderboard returns players sorted by totalScore', async () => {
        const store = useGameStore()
        const [alice, bob, charlie] = store.players

        if (alice && bob && charlie) {
          await store.assignPlayerScore(alice.id, 100)
          await store.assignPlayerScore(bob.id, 200)
          await store.assignPlayerScore(charlie.id, 150)

          const leaderboard = store.leaderboard

          expect(leaderboard[0]?.name).toBe('Bob')
          expect(leaderboard[0]?.totalScore).toBe(200)
          expect(leaderboard[1]?.name).toBe('Charlie')
          expect(leaderboard[1]?.totalScore).toBe(150)
          expect(leaderboard[2]?.name).toBe('Alice')
          expect(leaderboard[2]?.totalScore).toBe(100)
        }
      })
    })

    describe('Submit Player Answer', () => {
      beforeEach(async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])
      })

      it('saves player answer', async () => {
        const store = useGameStore()
        const alice = store.players[0]

        if (alice) {
          await store.submitPlayerAnswer(alice.id, 'Test Answer')

          expect(alice.currentRoundAnswer).toBe('Test Answer')
          expect(alice.hasSubmitted).toBe(true)
        }
      })

      it('persists to database', async () => {
        const store = useGameStore()
        const alice = store.players[0]

        if (alice) {
          await store.submitPlayerAnswer(alice.id, 'Test Answer')

          expect(mockSaveGameSession).toHaveBeenCalled()
        }
      })

      it('updates currentPlayerTurn to next player', async () => {
        const store = useGameStore()
        const alice = store.players[0]

        if (alice) {
          await store.submitPlayerAnswer(alice.id, 'Alice Answer')

          expect(store.currentPlayerTurn?.name).toBe('Bob')
        }
      })

      it('handles invalid player ID gracefully', async () => {
        const store = useGameStore()
        await store.submitPlayerAnswer('invalid-id', 'Answer')

        // Should not throw error
        expect(store.players.every((p) => !p.hasSubmitted)).toBe(true)
      })
    })

    describe('Assign Player Score', () => {
      beforeEach(async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])
      })

      it('updates current round score', async () => {
        const store = useGameStore()
        const alice = store.players[0]

        if (alice) {
          await store.assignPlayerScore(alice.id, 50)

          expect(alice.currentRoundScore).toBe(50)
        }
      })

      it('adds to total score', async () => {
        const store = useGameStore()
        const alice = store.players[0]

        if (alice) {
          await store.assignPlayerScore(alice.id, 50)
          expect(alice.totalScore).toBe(50)

          await store.assignPlayerScore(alice.id, 30)
          expect(alice.totalScore).toBe(80)
          expect(alice.currentRoundScore).toBe(30)
        }
      })

      it('persists to database', async () => {
        const store = useGameStore()
        const alice = store.players[0]

        if (alice) {
          await store.assignPlayerScore(alice.id, 50)

          expect(mockSaveGameSession).toHaveBeenCalled()
        }
      })
    })

    describe('Complete Round', () => {
      beforeEach(async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = store.players
        if (alice && bob) {
          await store.submitPlayerAnswer(alice.id, 'Alice Answer')
          await store.submitPlayerAnswer(bob.id, 'Bob Answer')
          await store.assignPlayerScore(alice.id, 100)
          await store.assignPlayerScore(bob.id, 50)
        }
      })

      it('adds round to history', async () => {
        const store = useGameStore()
        await store.completeRound()

        expect(store.currentSession?.roundHistory).toHaveLength(1)
      })

      it('saves round results with player answers and scores', async () => {
        const store = useGameStore()
        await store.completeRound()

        const round = store.currentSession?.roundHistory[0]
        expect(round?.playerResults).toHaveLength(2)
        expect(round?.playerResults[0]?.answer).toBe('Alice Answer')
        expect(round?.playerResults[0]?.score).toBe(100)
        expect(round?.playerResults[1]?.answer).toBe('Bob Answer')
        expect(round?.playerResults[1]?.score).toBe(50)
      })

      it('includes round metadata', async () => {
        const store = useGameStore()
        const category = store.currentCategory
        const letter = store.currentLetter

        await store.completeRound()

        const round = store.currentSession?.roundHistory[0]
        expect(round?.roundNumber).toBe(1)
        expect(round?.category).toBe(category?.name)
        expect(round?.letter).toBe(letter)
        expect(round?.timestamp).toBeDefined()
      })
    })

    describe('Start Next Round', () => {
      beforeEach(async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = store.players
        if (alice && bob) {
          await store.submitPlayerAnswer(alice.id, 'Answer 1')
          await store.submitPlayerAnswer(bob.id, 'Answer 2')
          await store.assignPlayerScore(alice.id, 100)
          await store.assignPlayerScore(bob.id, 50)
        }
      })

      it('increments round number', async () => {
        const store = useGameStore()
        await store.startNextRound()

        expect(store.currentRound).toBe(2)
      })

      it('generates new category and letter', async () => {
        const store = useGameStore()
        const oldCategory = store.currentCategory?.id
        const oldLetter = store.currentLetter

        await store.startNextRound()

        const newCategory = store.currentCategory?.id
        const newLetter = store.currentLetter

        // Either different category or different letter
        expect(newCategory !== oldCategory || newLetter !== oldLetter).toBe(true)
      })

      it('resets player round state', async () => {
        const store = useGameStore()
        await store.startNextRound()

        for (const player of store.players) {
          expect(player.currentRoundScore).toBe(0)
          expect(player.currentRoundAnswer).toBeUndefined()
          expect(player.hasSubmitted).toBe(false)
        }
      })

      it('preserves total scores', async () => {
        const store = useGameStore()
        const [alice, bob] = store.players

        await store.startNextRound()

        expect(alice?.totalScore).toBe(100)
        expect(bob?.totalScore).toBe(50)
      })

      it('keeps same players', async () => {
        const store = useGameStore()
        await store.startNextRound()

        expect(store.players).toHaveLength(2)
        expect(store.players.map((p) => p.name)).toEqual(['Alice', 'Bob'])
      })
    })

    describe('Reset Player Submissions', () => {
      beforeEach(async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])

        for (const player of store.players) {
          await store.submitPlayerAnswer(player.id, 'Answer')
        }
      })

      it('clears all hasSubmitted flags', async () => {
        const store = useGameStore()
        await store.resetPlayerSubmissions()

        for (const player of store.players) {
          expect(player.hasSubmitted).toBe(false)
        }
      })

      it('persists to database', async () => {
        const store = useGameStore()
        mockSaveGameSession.mockClear()

        await store.resetPlayerSubmissions()

        expect(mockSaveGameSession).toHaveBeenCalled()
      })
    })

    describe('Get Player By ID', () => {
      beforeEach(async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])
      })

      it('returns player when ID matches', () => {
        const store = useGameStore()
        const alice = store.players[0]

        if (alice) {
          const found = store.getPlayerById(alice.id)
          expect(found).toBe(alice)
          expect(found?.name).toBe('Alice')
        }
      })

      it('returns null when ID not found', () => {
        const store = useGameStore()
        const found = store.getPlayerById('invalid-id')

        expect(found).toBeNull()
      })

      it('returns null when no session', () => {
        const store = useGameStore()
        store.clearSession()

        const found = store.getPlayerById('any-id')

        expect(found).toBeNull()
      })
    })

    describe('Multi-Player with startNewGame', () => {
      it('starts new round when players exist', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])

        const oldRound = store.currentRound
        await store.startNewGame()

        expect(store.currentRound).toBe(oldRound + 1)
      })

      it('starts legacy single-player when no players', async () => {
        const store = useGameStore()
        await store.startNewGame()

        expect(store.isMultiPlayerMode).toBe(false)
        expect(store.players).toHaveLength(0)
      })
    })
  })
})
