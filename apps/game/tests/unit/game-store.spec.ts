import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { gameStore } from '../../stores/gameStore'
import { createCategoryList } from '../utils/factories'
import type { Category, Player } from '@riddle-rush/types/game'

// Mock setup
const mockSaveGameSession = vi.fn().mockResolvedValue(undefined)
const mockGetGameSession = vi.fn().mockResolvedValue(null)
const mockSaveGameHistory = vi.fn().mockResolvedValue(undefined)
const mockGetGameHistory = vi.fn().mockResolvedValue([])
const mockUpdateStatistics = vi.fn().mockResolvedValue(undefined)

const mockGetGameSessionById = vi.fn().mockResolvedValue(null)

vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    saveGameSession: mockSaveGameSession,
    getGameSession: mockGetGameSession,
    getGameSessionById: mockGetGameSessionById,
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
    // Reset Zustand store state
    gameStore.setState({
      currentSession: null,
      history: [],
      categories: [],
      categoriesLoaded: false,
      categoriesLoading: false,
      displayedCategoryCount: 9,
      categoryLoadError: null,
      selectedLetter: null,
      isOnline: true,
      installPromptEvent: null,
      pendingPlayerNames: [],
    })
    mockCategories = createCategoryList(10)
    fetchMock.mockResolvedValue(mockCategories)
    fetchMock.mockClear()
    mockGetGameSession.mockResolvedValue(null)
    mockGetGameHistory.mockResolvedValue([])
    mockGetGameSessionById.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has null currentSession on init', () => {
      const store = gameStore.getState()
      expect(store.currentSession).toBeNull()
    })

    it('is online by default', () => {
      const store = gameStore.getState()
      expect(store.isOnline).toBe(true)
    })

    it('has empty history on init', () => {
      const store = gameStore.getState()
      expect(store.history).toEqual([])
    })

    it('has empty categories on init', () => {
      const store = gameStore.getState()
      expect(store.categories).toEqual([])
    })

    it('categories not loaded on init', () => {
      const store = gameStore.getState()
      expect(store.categoriesLoaded).toBe(false)
    })

    it('default displayed category count is 9', () => {
      const store = gameStore.getState()
      expect(store.displayedCategoryCount).toBe(9) // DEFAULT_DISPLAYED_CATEGORIES
    })

    it('hasActiveSession is false when no session', () => {
      const store = gameStore.getState()
      expect(store.hasActiveSession).toBe(false)
    })
  })

  describe('Category Fetching', () => {
    it('fetches categories', async () => {
      const store = gameStore.getState()
      await store.fetchCategories()
      expect(fetchMock).toHaveBeenCalled()
      expect(store.categories).toEqual(mockCategories)
    })

    it('sets categoriesLoaded after fetch', async () => {
      const store = gameStore.getState()
      await store.fetchCategories()
      expect(store.categoriesLoaded).toBe(true)
    })

    it.skip('does not refetch if already loaded', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      const store = gameStore.getState()
      await store.fetchCategories()
      await store.fetchCategories()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it.skip('refetches when force=true', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      const store = gameStore.getState()
      await store.fetchCategories()
      await store.fetchCategories(true)
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it.skip('handles API error gracefully', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      fetchMock.mockRejectedValueOnce(new Error('Network error'))
      const store = gameStore.getState()
      await expect(store.fetchCategories()).rejects.toThrow('Network error')
      expect(store.categoriesLoaded).toBe(false)
    })

    it('limits displayed categories', async () => {
      const store = gameStore.getState()
      await store.fetchCategories()
      expect(store.displayedCategories.length).toBeLessThanOrEqual(9)
    })
  })

  describe('Category Lookup', () => {
    it.skip('finds category by id', async () => {
      // TODO: Fix category data mismatch in CI
      const store = gameStore.getState()
      await store.fetchCategories()
      const target = mockCategories[3]!
      expect(store.getCategoryById(target.id)).toEqual(target)
    })

    it('returns null for unknown id', async () => {
      const store = gameStore.getState()
      await store.fetchCategories()
      expect(store.getCategoryById(999999)).toBeNull()
    })

    it.skip('returns null when categories empty', () => {
      // TODO: Fix state pollution in CI
      const store = gameStore.getState()
      expect(store.getCategoryById(1)).toBeNull()
    })
  })

  describe('Load More Categories', () => {
    it('increases displayed count by 9', () => {
      const store = gameStore.getState()
      store.categories = createCategoryList(30)
      store.loadMoreCategories()
      expect(store.displayedCategoryCount).toBe(18)
    })

    it('caps at total category count', () => {
      const store = gameStore.getState()
      store.categories = createCategoryList(5)
      store.displayedCategoryCount = 9 // DEFAULT_DISPLAYED_CATEGORIES
      store.loadMoreCategories()
      expect(store.displayedCategories.length).toBe(5)
    })
  })

  describe('Start New Game', () => {
    it('creates session with category', async () => {
      const store = gameStore.getState()
      const session = await store.startNewGame()
      expect(session).toBeDefined()
      expect(session?.category).toBeDefined()
      expect(session?.category.name.length).toBeGreaterThan(0)
    })

    it('sets currentSession', async () => {
      const store = gameStore.getState()
      await store.startNewGame()
      expect(store.currentSession).not.toBeNull()
    })

    it('initializes score to 0', async () => {
      const store = gameStore.getState()
      await store.startNewGame()
      expect(store.currentSession?.score).toBe(0)
    })

    it('initializes empty attempts', async () => {
      const store = gameStore.getState()
      await store.startNewGame()
      expect(store.currentSession?.attempts).toEqual([])
    })

    it('sets startTime', async () => {
      const store = gameStore.getState()
      const before = Date.now()
      await store.startNewGame()
      const after = Date.now()
      expect(store.currentSession?.startTime).toBeGreaterThanOrEqual(before)
      expect(store.currentSession?.startTime).toBeLessThanOrEqual(after)
    })

    it('persists session to IndexedDB', async () => {
      const store = gameStore.getState()
      await store.startNewGame()
      expect(mockSaveGameSession).toHaveBeenCalledTimes(1)
    })

    it('selects a random category', async () => {
      const store = gameStore.getState()
      await store.startNewGame()
      expect(store.currentSession?.category).toBeDefined()
      expect(mockCategories.some((cat) => cat.id === store.currentSession?.category.id)).toBe(true)
    })

    it('hasActiveSession becomes true', async () => {
      const store = gameStore.getState()
      await store.startNewGame()
      expect(store.hasActiveSession).toBe(true)
    })
  })

  describe('End Game', () => {
    beforeEach(async () => {
      const store = gameStore.getState()
      await store.startNewGame()
      // Create a session with some test data
      if (store.currentSession) {
        store.currentSession.score = 10
        store.currentSession.attempts = [
          {
            term: 'answer',
            found: true,
            timestamp: Date.now(),
          },
        ]
      }
      vi.clearAllMocks()
    })

    it('clears currentSession', async () => {
      const store = gameStore.getState()
      await store.endGame()
      expect(store.currentSession).toBeNull()
    })

    it('sets hasActiveSession to false', async () => {
      const store = gameStore.getState()
      await store.endGame()
      expect(store.hasActiveSession).toBe(false)
    })

    it.skip('adds session to history', async () => {
      // TODO: Fix history state pollution in CI
      const store = gameStore.getState()
      await store.endGame()
      expect(store.history).toHaveLength(1)
    })

    it('preserves score in history', async () => {
      const store = gameStore.getState()
      await store.endGame()
      expect(store.history[0]!.score).toBe(10)
    })

    it('calls saveGameHistory', async () => {
      const store = gameStore.getState()
      await store.endGame()
      expect(mockSaveGameHistory).toHaveBeenCalledTimes(1)
    })

    it('calls updateStatistics', async () => {
      const store = gameStore.getState()
      await store.endGame()
      expect(mockUpdateStatistics).toHaveBeenCalledTimes(1)
    })

    it('does not throw if updateStatistics fails', async () => {
      const store = gameStore.getState()
      mockUpdateStatistics.mockRejectedValueOnce(new Error('stats failed'))

      await expect(store.endGame()).resolves.toBeUndefined()
      expect(store.currentSession).toBeNull()
    })

    it.skip('sets endTime on session', async () => {
      // TODO: Fix timing race condition in CI
      const store = gameStore.getState()
      const before = Date.now()
      await store.endGame()
      expect(store.history[0]!.endTime).toBeGreaterThanOrEqual(before)
    })

    it('does nothing without active session', async () => {
      const store = gameStore.getState()
      store.currentSession = null
      await store.endGame()
      expect(mockSaveGameHistory).not.toHaveBeenCalled()
    })
  })

  describe('Online Status', () => {
    it('sets offline', () => {
      const store = gameStore.getState()
      store.setOnlineStatus(false)
      expect(store.isOnline).toBe(false)
    })

    it('sets online', () => {
      const store = gameStore.getState()
      store.setOnlineStatus(false)
      store.setOnlineStatus(true)
      expect(store.isOnline).toBe(true)
    })
  })

  describe('Category Emoji', () => {
    it('returns emoji for Weiblicher Vorname', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Weiblicher Vorname')).toBe('👩')
    })

    it('returns emoji for Männlicher Vorname', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Männlicher Vorname')).toBe('👨')
    })

    it('returns emoji for Blumen', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Blumen')).toBe('🌸')
    })

    it('returns emoji for Mountains oder Hills', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Mountains oder Hills')).toBe('🏔️')
    })

    it('returns emoji for Gewässer oder See', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Gewässer oder See')).toBe('💧')
    })

    it('returns emoji for Maschine', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Maschine')).toBe('⚙️')
    })

    it('returns emoji for Begriff aus der Technik', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Begriff aus der Technik')).toBe('🔧')
    })

    it('returns emoji for Begriff aus der Raumfahrt', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Begriff aus der Raumfahrt')).toBe('🚀')
    })

    it('returns emoji for Wort mit Endung -heit', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Wort mit Endung -heit')).toBe('📝')
    })

    it('returns emoji for Farbe', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Farbe')).toBe('🎨')
    })

    it('returns emoji for Erfinder Entdecker oder Gelehrter', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Erfinder Entdecker oder Gelehrter')).toBe('💡')
    })

    it('returns emoji for Komponist oder Sänger', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Komponist oder Sänger')).toBe('🎼')
    })

    it('returns default for unknown', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('Random Category')).toBe('🎯')
    })

    it('returns default for null', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji(null)).toBe('🎯')
    })

    it('returns default for undefined', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji(undefined)).toBe('🎯')
    })

    it('returns default for empty string', () => {
      const store = gameStore.getState()
      expect(store.categoryEmoji('')).toBe('🎯')
    })
  })

  describe('Resume or Start New Game', () => {
    it('returns existing session if active', async () => {
      const store = gameStore.getState()
      await store.startNewGame()
      const existing = store.currentSession
      const result = await store.resumeOrStartNewGame()
      expect(result).toBe(existing)
    })

    it('starts new game if no session', async () => {
      const store = gameStore.getState()
      await store.resumeOrStartNewGame()
      expect(store.hasActiveSession).toBe(true)
    })

    it('uses random category', async () => {
      const store = gameStore.getState()
      await store.fetchCategories()
      await store.resumeOrStartNewGame()
      expect(store.currentSession?.category).toBeDefined()
      expect(mockCategories.some((cat) => cat.id === store.currentSession?.category.id)).toBe(true)
    })
  })

  describe('Multi-Player Mode', () => {
    describe('Setup Players', () => {
      it('creates game session with players', async () => {
        const store = gameStore.getState()
        const playerNames = ['Alice', 'Bob', 'Charlie']
        const session = await store.setupPlayers(playerNames)

        expect(session).toBeDefined()
        expect(session?.players).toHaveLength(3)
        expect(session?.players[0]?.name).toBe('Alice')
        expect(session?.players[1]?.name).toBe('Bob')
        expect(session?.players[2]?.name).toBe('Charlie')
      })

      it('initializes players with zero scores', async () => {
        const store = gameStore.getState()
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
        const store = gameStore.getState()
        await store.setupPlayers(['', '', 'Charlie'])

        expect(store.players[0]?.name).toBe('Player 1')
        expect(store.players[1]?.name).toBe('Player 2')
        expect(store.players[2]?.name).toBe('Charlie')
      })

      it('sets currentRound to 1', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Player 1', 'Player 2'])

        expect(store.currentRound).toBe(1)
      })

      it('sets optional game name', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Player 1'], 'Test Game')

        expect(store.currentSession?.gameName).toBe('Test Game')
      })

      it('generates category and letter', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Player 1'])

        expect(store.currentCategory).toBeDefined()
        expect(store.currentLetter).toBeDefined()
        expect(store.currentLetter?.length).toBe(1)
      })
    })

    describe('Multi-Player Getters', () => {
      beforeEach(async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob', 'Charlie'])
      })

      it('players exist after setup', () => {
        const store = gameStore.getState()
        expect(store.players.length).toBeGreaterThan(0)
      })

      it('players getter returns all players', () => {
        const store = gameStore.getState()
        expect(store.players).toHaveLength(3)
        expect(store.players.map((p: Player) => p.name)).toEqual(['Alice', 'Bob', 'Charlie'])
      })

      it('currentPlayerTurn returns first unsubmitted player', () => {
        const store = gameStore.getState()
        const currentPlayer = store.currentPlayerTurn

        expect(currentPlayer).toBeDefined()
        expect(currentPlayer?.name).toBe('Alice')
        expect(currentPlayer?.hasSubmitted).toBe(false)
      })

      it('allPlayersSubmitted returns false initially', () => {
        const store = gameStore.getState()
        expect(store.allPlayersSubmitted).toBe(false)
      })

      it('allPlayersSubmitted returns true when all submitted', async () => {
        const store = gameStore.getState()

        for (const player of store.players) {
          await store.submitPlayerAnswer(player.id, 'Answer')
        }

        expect(store.allPlayersSubmitted).toBe(true)
      })

      it('leaderboard returns players sorted by totalScore', async () => {
        const store = gameStore.getState()
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
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])
      })

      it('saves player answer', async () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          await store.submitPlayerAnswer(alice.id, 'Test Answer')

          expect(alice.currentRoundAnswer).toBe('Test Answer')
          expect(alice.hasSubmitted).toBe(true)
        }
      })

      it('persists to database', async () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          await store.submitPlayerAnswer(alice.id, 'Test Answer')

          expect(mockSaveGameSession).toHaveBeenCalled()
        }
      })

      it('updates currentPlayerTurn to next player', async () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          await store.submitPlayerAnswer(alice.id, 'Alice Answer')

          expect(store.currentPlayerTurn?.name).toBe('Bob')
        }
      })

      it('handles invalid player ID gracefully', async () => {
        const store = gameStore.getState()
        await store.submitPlayerAnswer('invalid-id', 'Answer')

        // Should not throw error
        expect(store.players.every((p: Player) => !p.hasSubmitted)).toBe(true)
      })
    })

    describe('Assign Player Score', () => {
      beforeEach(async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])
      })

      it('updates current round score', async () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          await store.assignPlayerScore(alice.id, 50)

          expect(alice.currentRoundScore).toBe(50)
        }
      })

      it('0→10: totalScore increases by 10', async () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          expect(alice.totalScore).toBe(0)
          await store.assignPlayerScore(alice.id, 10)
          expect(alice.totalScore).toBe(10)
          expect(alice.currentRoundScore).toBe(10)
        }
      })

      it('10→20: totalScore increases by 10 (not 20)', async () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          await store.assignPlayerScore(alice.id, 10)
          expect(alice.totalScore).toBe(10)

          await store.assignPlayerScore(alice.id, 20)
          expect(alice.totalScore).toBe(20)
          expect(alice.currentRoundScore).toBe(20)
        }
      })

      it('20→10: totalScore decreases by 10', async () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          await store.assignPlayerScore(alice.id, 20)
          expect(alice.totalScore).toBe(20)

          await store.assignPlayerScore(alice.id, 10)
          expect(alice.totalScore).toBe(10)
          expect(alice.currentRoundScore).toBe(10)
        }
      })

      it('10→10: totalScore unchanged (delta = 0)', async () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          await store.assignPlayerScore(alice.id, 10)
          expect(alice.totalScore).toBe(10)

          await store.assignPlayerScore(alice.id, 10)
          expect(alice.totalScore).toBe(10)
          expect(alice.currentRoundScore).toBe(10)
        }
      })

      it('replaces score correctly when adjusting up then down', async () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          await store.assignPlayerScore(alice.id, 50)
          expect(alice.totalScore).toBe(50)

          // Delta-based score update: when updating from 50 to 30, delta = 30 - 50 = -20
          // Total score: 50 + (-20) = 30
          await store.assignPlayerScore(alice.id, 30)
          expect(alice.totalScore).toBe(30)
          expect(alice.currentRoundScore).toBe(30)
        }
      })

      it('persists to database', async () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          await store.assignPlayerScore(alice.id, 50)

          expect(mockSaveGameSession).toHaveBeenCalled()
        }
      })

      it('does nothing for invalid player ID', async () => {
        const store = gameStore.getState()
        mockSaveGameSession.mockClear()

        await store.assignPlayerScore('invalid-id', 50)

        expect(mockSaveGameSession).not.toHaveBeenCalled()
      })

      it('does nothing without active session', async () => {
        const store = gameStore.getState()
        store.currentSession = null
        mockSaveGameSession.mockClear()

        await store.assignPlayerScore('any-id', 50)

        expect(mockSaveGameSession).not.toHaveBeenCalled()
      })
    })

    describe('Complete Round', () => {
      beforeEach(async () => {
        const store = gameStore.getState()
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
        const store = gameStore.getState()
        await store.completeRound()

        expect(store.currentSession?.roundHistory).toHaveLength(1)
      })

      it('saves round results with player answers and scores', async () => {
        const store = gameStore.getState()
        await store.completeRound()

        const round = store.currentSession?.roundHistory[0]
        expect(round?.playerResults).toHaveLength(2)
        expect(round?.playerResults[0]?.answer).toBe('Alice Answer')
        expect(round?.playerResults[0]?.score).toBe(100)
        expect(round?.playerResults[1]?.answer).toBe('Bob Answer')
        expect(round?.playerResults[1]?.score).toBe(50)
      })

      it('includes round metadata', async () => {
        const store = gameStore.getState()
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
        const store = gameStore.getState()
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
        const store = gameStore.getState()
        await store.startNextRound()

        expect(store.currentRound).toBe(2)
      })

      it('generates new category and letter', async () => {
        const store = gameStore.getState()
        const oldCategory = store.currentCategory?.id
        const oldLetter = store.currentLetter

        await store.startNextRound()

        const newCategory = store.currentCategory?.id
        const newLetter = store.currentLetter

        // Either different category or different letter
        expect(newCategory !== oldCategory || newLetter !== oldLetter).toBe(true)
      })

      it('resets player round state', async () => {
        const store = gameStore.getState()
        await store.startNextRound()

        for (const player of store.players) {
          expect(player.currentRoundScore).toBe(0)
          expect(player.currentRoundAnswer).toBeUndefined()
          expect(player.hasSubmitted).toBe(false)
        }
      })

      it('preserves total scores', async () => {
        const store = gameStore.getState()
        const [alice, bob] = store.players

        await store.startNextRound()

        expect(alice?.totalScore).toBe(100)
        expect(bob?.totalScore).toBe(50)
      })

      it('keeps same players', async () => {
        const store = gameStore.getState()
        await store.startNextRound()

        expect(store.players).toHaveLength(2)
        expect(store.players.map((p: Player) => p.name)).toEqual(['Alice', 'Bob'])
      })
    })

    describe('Reset Player Submissions', () => {
      beforeEach(async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        for (const player of store.players) {
          await store.submitPlayerAnswer(player.id, 'Answer')
        }
      })

      it('clears all hasSubmitted flags', async () => {
        const store = gameStore.getState()
        await store.resetPlayerSubmissions()

        for (const player of store.players) {
          expect(player.hasSubmitted).toBe(false)
        }
      })

      it('persists to database', async () => {
        const store = gameStore.getState()
        mockSaveGameSession.mockClear()

        await store.resetPlayerSubmissions()

        expect(mockSaveGameSession).toHaveBeenCalled()
      })
    })

    describe('Get Player By ID', () => {
      beforeEach(async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])
      })

      it('returns player when ID matches', () => {
        const store = gameStore.getState()
        const alice = store.players[0]

        if (alice) {
          const found = store.getPlayerById(alice.id)
          expect(found).toBe(alice)
          expect(found?.name).toBe('Alice')
        }
      })

      it('returns null when ID not found', () => {
        const store = gameStore.getState()
        const found = store.getPlayerById('invalid-id')

        expect(found).toBeNull()
      })

      it('returns null when no session', () => {
        const store = gameStore.getState()
        store.clearSession()

        const found = store.getPlayerById('any-id')

        expect(found).toBeNull()
      })
    })

    describe('Multi-Player with startNewGame', () => {
      it('starts new round when players exist', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        const oldRound = store.currentRound
        await store.startNewGame()

        expect(store.currentRound).toBe(oldRound + 1)
      })

      it('starts legacy single-player when no players', async () => {
        const store = gameStore.getState()
        await store.startNewGame()

        expect(store.players).toHaveLength(0)
        expect(store.currentSession).toBeDefined()
      })
    })
  })

  describe('Round Counter Logic', () => {
    describe('isCurrentRoundCompleted helper logic', () => {
      it('round is NOT completed when roundHistory is empty and currentRound is 1', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        // After setup: currentRound = 1, roundHistory = []
        expect(store.currentSession?.currentRound).toBe(1)
        expect(store.currentSession?.roundHistory.length).toBe(0)

        // isCurrentRoundCompleted = roundHistory.length >= currentRound = 0 >= 1 = false
        const isCompleted =
          (store.currentSession?.roundHistory.length ?? 0) >=
          (store.currentSession?.currentRound ?? 0)
        expect(isCompleted).toBe(false)
      })

      it('round IS completed after completeRound is called', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = store.players
        if (alice && bob) {
          await store.submitPlayerAnswer(alice.id, 'Answer 1')
          await store.submitPlayerAnswer(bob.id, 'Answer 2')
          await store.completeRound()
        }

        // After completeRound: currentRound = 1, roundHistory = [round1]
        expect(store.currentSession?.currentRound).toBe(1)
        expect(store.currentSession?.roundHistory.length).toBe(1)

        // isCurrentRoundCompleted = roundHistory.length >= currentRound = 1 >= 1 = true
        const isCompleted =
          (store.currentSession?.roundHistory.length ?? 0) >=
          (store.currentSession?.currentRound ?? 0)
        expect(isCompleted).toBe(true)
      })

      it('round is NOT completed after startNextRound', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = store.players
        if (alice && bob) {
          await store.submitPlayerAnswer(alice.id, 'Answer 1')
          await store.submitPlayerAnswer(bob.id, 'Answer 2')
          await store.completeRound()
          await store.startNextRound()
        }

        // After startNextRound: currentRound = 2, roundHistory = [round1]
        expect(store.currentSession?.currentRound).toBe(2)
        expect(store.currentSession?.roundHistory.length).toBe(1)

        // isCurrentRoundCompleted = roundHistory.length >= currentRound = 1 >= 2 = false
        const isCompleted =
          (store.currentSession?.roundHistory.length ?? 0) >=
          (store.currentSession?.currentRound ?? 0)
        expect(isCompleted).toBe(false)
      })

      it('round IS completed after second round completeRound', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = store.players
        if (alice && bob) {
          // Round 1
          await store.submitPlayerAnswer(alice.id, 'Answer 1')
          await store.submitPlayerAnswer(bob.id, 'Answer 2')
          await store.completeRound()
          await store.startNextRound()

          // Round 2
          await store.submitPlayerAnswer(alice.id, 'Answer 3')
          await store.submitPlayerAnswer(bob.id, 'Answer 4')
          await store.completeRound()
        }

        // After second completeRound: currentRound = 2, roundHistory = [round1, round2]
        expect(store.currentSession?.currentRound).toBe(2)
        expect(store.currentSession?.roundHistory.length).toBe(2)

        // isCurrentRoundCompleted = roundHistory.length >= currentRound = 2 >= 2 = true
        const isCompleted =
          (store.currentSession?.roundHistory.length ?? 0) >=
          (store.currentSession?.currentRound ?? 0)
        expect(isCompleted).toBe(true)
      })
    })

    describe('Round number display scenarios', () => {
      it('should show round 1 on initial setup (no session)', () => {
        const store = gameStore.getState()
        // No session exists
        expect(store.currentSession).toBeNull()

        // Display logic: return 1 when no session
        const displayRound = store.currentSession ? store.currentSession.currentRound : 1
        expect(displayRound).toBe(1)
      })

      it('should show round 1 after setupPlayers (round not completed)', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        // Display logic: if round NOT completed, show currentRound
        const session = store.currentSession!
        const isCompleted = session.roundHistory.length >= session.currentRound
        const displayRound = isCompleted ? session.currentRound + 1 : session.currentRound
        expect(displayRound).toBe(1)
      })

      it('should show round 2 after round 1 is completed', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = store.players
        if (alice && bob) {
          await store.submitPlayerAnswer(alice.id, 'Answer 1')
          await store.submitPlayerAnswer(bob.id, 'Answer 2')
          await store.completeRound()
        }

        // Display logic: if round IS completed, show currentRound + 1
        const session = store.currentSession!
        const isCompleted = session.roundHistory.length >= session.currentRound
        const displayRound = isCompleted ? session.currentRound + 1 : session.currentRound
        expect(displayRound).toBe(2)
      })

      it('should show round 2 after startNextRound (round 2 not completed)', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = store.players
        if (alice && bob) {
          await store.submitPlayerAnswer(alice.id, 'Answer 1')
          await store.submitPlayerAnswer(bob.id, 'Answer 2')
          await store.completeRound()
          await store.startNextRound()
        }

        // Display logic: after startNextRound, round 2 is NOT completed
        const session = store.currentSession!
        const isCompleted = session.roundHistory.length >= session.currentRound
        const displayRound = isCompleted ? session.currentRound + 1 : session.currentRound
        expect(displayRound).toBe(2)
      })
    })

    describe('Game start scenarios', () => {
      it('initial setup: pendingPlayerNames triggers setupPlayers', async () => {
        const store = gameStore.getState()

        // Simulate coming from players page
        store.pendingPlayerNames = ['Alice', 'Bob']

        // The round-start page logic
        const hasSession = !!store.currentSession
        const hasPendingPlayers = store.pendingPlayerNames.length > 0

        expect(hasSession).toBe(false)
        expect(hasPendingPlayers).toBe(true)

        // This would trigger setupPlayers
        await store.setupPlayers(store.pendingPlayerNames)
        store.pendingPlayerNames = []

        expect(store.currentSession?.currentRound).toBe(1)
        expect(store.players).toHaveLength(2)
      })

      it('next round: session exists and round completed triggers startNextRound', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = store.players
        if (alice && bob) {
          await store.submitPlayerAnswer(alice.id, 'Answer 1')
          await store.submitPlayerAnswer(bob.id, 'Answer 2')
          await store.completeRound()
        }

        // The round-start page logic for next round
        const hasSession = !!store.currentSession
        const hasPendingPlayers = store.pendingPlayerNames.length > 0
        const session = store.currentSession!
        const isCurrentRoundCompleted = session.roundHistory.length >= session.currentRound

        expect(hasSession).toBe(true)
        expect(hasPendingPlayers).toBe(false)
        expect(isCurrentRoundCompleted).toBe(true)

        // This should trigger startNextRound
        await store.startNextRound()

        expect(store.currentSession?.currentRound).toBe(2)
      })

      it('refresh during round: session exists but round NOT completed - no increment', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        // Simulate refresh - session exists but round not completed
        const hasSession = !!store.currentSession
        const hasPendingPlayers = store.pendingPlayerNames.length > 0
        const session = store.currentSession!
        const isCurrentRoundCompleted = session.roundHistory.length >= session.currentRound

        expect(hasSession).toBe(true)
        expect(hasPendingPlayers).toBe(false)
        expect(isCurrentRoundCompleted).toBe(false)

        // On refresh, should NOT call startNextRound
        // Instead, just reset submissions
        await store.resetPlayerSubmissions()

        // Round should still be 1
        expect(store.currentSession?.currentRound).toBe(1)
      })

      it('refresh after partial answers: should not increment round', async () => {
        const store = gameStore.getState()
        await store.setupPlayers(['Alice', 'Bob'])

        // One player submits
        const alice = store.players[0]
        if (alice) {
          await store.submitPlayerAnswer(alice.id, 'Answer 1')
        }

        // Simulate refresh
        const session = store.currentSession!
        const isCurrentRoundCompleted = session.roundHistory.length >= session.currentRound

        expect(isCurrentRoundCompleted).toBe(false)
        expect(store.currentSession?.currentRound).toBe(1)
      })
    })
  })

  describe('Load Session By ID', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      // Mock is already defined at the top level
      mockGetGameSessionById.mockResolvedValue(null)
    })

    it('should load session by ID', async () => {
      const store = gameStore.getState()
      const mockSession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        category: mockCategories[0],
        startTime: Date.now(),
        endTime: null,
        currentLetter: 'A',
        answer: '',
        timeSpent: 0,
        players: [],
        currentPlayerIndex: 0,
        rounds: [],
        currentRoundIndex: 0,
      }

      mockGetGameSessionById.mockResolvedValue(mockSession)

      const result = await store.loadSessionById(mockSession.id)

      expect(mockGetGameSessionById).toHaveBeenCalledWith(mockSession.id)
      expect(result).toEqual(mockSession)
      expect(store.currentSession).toEqual(mockSession)
    })

    it('should throw error when session not found', async () => {
      const store = gameStore.getState()
      const gameId = 'non-existent-id'

      mockGetGameSessionById.mockResolvedValue(null)

      await expect(store.loadSessionById(gameId)).rejects.toThrow('Failed to load game session')
    })

    it('should handle IndexedDB errors', async () => {
      const store = gameStore.getState()
      const gameId = '123e4567-e89b-12d3-a456-426614174000'

      mockGetGameSessionById.mockRejectedValue(new Error('Database error'))

      await expect(store.loadSessionById(gameId)).rejects.toThrow('Failed to load game session')
    })

    it('should load session with UUID format', async () => {
      const store = gameStore.getState()
      const uuidGameId = '550e8400-e29b-41d4-a716-446655440000'
      const mockSession = {
        id: uuidGameId,
        category: mockCategories[1],
        startTime: Date.now(),
        endTime: null,
        currentLetter: 'B',
        answer: '',
        timeSpent: 0,
        players: [
          { name: 'Alice', currentAnswer: '', roundScores: [], totalScore: 0 },
          { name: 'Bob', currentAnswer: '', roundScores: [], totalScore: 0 },
        ],
        currentPlayerIndex: 0,
        rounds: [],
        currentRoundIndex: 0,
      }

      mockGetGameSessionById.mockResolvedValue(mockSession)

      const result = await store.loadSessionById(uuidGameId)

      expect(result!.id).toBe(uuidGameId)
      expect(result!.players).toHaveLength(2)
    })

    it('should throw descriptive error with session ID', async () => {
      const store = gameStore.getState()
      const gameId = 'test-game-123'

      mockGetGameSessionById.mockResolvedValue(null)

      try {
        await store.loadSessionById(gameId)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.message).toContain('Failed to load game session')
      }
    })
  })

  describe('Complete Game', () => {
    beforeEach(async () => {
      const store = gameStore.getState()
      await store.setupPlayers(['Alice', 'Bob'])

      const [alice, bob] = store.players
      if (alice && bob) {
        await store.submitPlayerAnswer(alice.id, 'Answer 1')
        await store.submitPlayerAnswer(bob.id, 'Answer 2')
        await store.assignPlayerScore(alice.id, 100)
        await store.assignPlayerScore(bob.id, 50)
        await store.completeRound()
      }
    })

    it('sets status to completed', async () => {
      const store = gameStore.getState()
      await store.completeGame()

      expect(store.currentSession?.status).toBe('completed')
    })

    it('sets endTime', async () => {
      const store = gameStore.getState()
      const before = Date.now()

      await store.completeGame()

      const after = Date.now()
      expect(store.currentSession?.endTime).toBeGreaterThanOrEqual(before)
      expect(store.currentSession?.endTime).toBeLessThanOrEqual(after)
    })

    it('keeps session for leaderboard display', async () => {
      const store = gameStore.getState()
      await store.completeGame()

      // Session should NOT be cleared (unlike endGame)
      expect(store.currentSession).not.toBeNull()
      expect(store.hasActiveSession).toBe(true)
    })

    it('returns the completed session', async () => {
      const store = gameStore.getState()
      const result = await store.completeGame()

      expect(result).toBeDefined()
      expect(result?.status).toBe('completed')
    })

    it('persists to database', async () => {
      const store = gameStore.getState()
      mockSaveGameSession.mockClear()
      mockSaveGameHistory.mockClear()

      await store.completeGame()

      expect(mockSaveGameSession).toHaveBeenCalled()
      expect(mockSaveGameHistory).toHaveBeenCalled()
    })

    it('calls updateStatistics', async () => {
      const store = gameStore.getState()
      mockUpdateStatistics.mockClear()

      await store.completeGame()

      expect(mockUpdateStatistics).toHaveBeenCalled()
    })

    it('does nothing without active session', async () => {
      const store = gameStore.getState()
      store.currentSession = null
      mockSaveGameSession.mockClear()

      await store.completeGame()

      expect(mockSaveGameSession).not.toHaveBeenCalled()
    })

    it('isGameCompleted getter returns true after completeGame', async () => {
      const store = gameStore.getState()

      expect(store.isGameCompleted).toBe(false)

      await store.completeGame()

      expect(store.isGameCompleted).toBe(true)
    })

    it('gameStatus getter returns completed after completeGame', async () => {
      const store = gameStore.getState()

      expect(store.gameStatus).toBe('active')

      await store.completeGame()

      expect(store.gameStatus).toBe('completed')
    })
  })

  describe('Leaderboard Winner Logic', () => {
    beforeEach(async () => {
      const store = gameStore.getState()
      await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

      const [alice, bob, charlie] = store.players
      if (alice && bob && charlie) {
        await store.assignPlayerScore(alice.id, 100)
        await store.assignPlayerScore(bob.id, 200)
        await store.assignPlayerScore(charlie.id, 150)
      }
    })

    it('isWinner is false for all players when game is active', () => {
      const store = gameStore.getState()
      const leaderboard = store.leaderboard

      expect(leaderboard.every((p: { isWinner: boolean }) => p.isWinner === false)).toBe(true)
    })

    it('isWinner is true only for first place when game is completed', async () => {
      const store = gameStore.getState()
      await store.completeGame()

      const leaderboard = store.leaderboard

      // Bob has highest score (200) and should be winner
      expect(leaderboard[0]?.name).toBe('Bob')
      expect(leaderboard[0]?.isWinner).toBe(true)

      // Others should not be winners
      expect(leaderboard[1]?.isWinner).toBe(false)
      expect(leaderboard[2]?.isWinner).toBe(false)
    })

    it('isWinner is false when top score is 0', async () => {
      const store = gameStore.getState()

      // Reset all scores to 0
      for (const player of store.players) {
        await store.assignPlayerScore(player.id, 0)
      }

      await store.completeGame()

      const leaderboard = store.leaderboard

      // No winner when all scores are 0
      expect(leaderboard.every((p: { isWinner: boolean }) => p.isWinner === false)).toBe(true)
    })

    it('rank is assigned correctly', () => {
      const store = gameStore.getState()
      const leaderboard = store.leaderboard

      expect(leaderboard[0]?.rank).toBe(1)
      expect(leaderboard[1]?.rank).toBe(2)
      expect(leaderboard[2]?.rank).toBe(3)
    })

    it('players are sorted by totalScore descending', () => {
      const store = gameStore.getState()
      const leaderboard = store.leaderboard

      expect(leaderboard[0]?.name).toBe('Bob')
      expect(leaderboard[0]?.totalScore).toBe(200)
      expect(leaderboard[1]?.name).toBe('Charlie')
      expect(leaderboard[1]?.totalScore).toBe(150)
      expect(leaderboard[2]?.name).toBe('Alice')
      expect(leaderboard[2]?.totalScore).toBe(100)
    })
  })
})
