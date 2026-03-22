import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { gameStore } from '../../stores/gameStore'
import { usePlayerManager } from '../../composables/usePlayerManager'
import { createCategoryList } from '../utils/factories'
import type { Category, Player } from '@riddle-rush/types/game'

// Mock setup (same as game-store.spec.ts)
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

const getSession = () => gameStore.getState().currentSession
const getPlayers = () => getSession()?.players ?? []
const getCurrentPlayerTurn = () => {
  const playerManager = usePlayerManager()
  return playerManager.getCurrentPlayerTurn(getPlayers(), getSession()?.currentPlayerIndex ?? 0)
}
const areAllPlayersSubmitted = () => {
  const playerManager = usePlayerManager()
  return playerManager.allPlayersSubmitted(getPlayers())
}
const getLeaderboard = () => {
  const playerManager = usePlayerManager()
  return playerManager.buildLeaderboard(getPlayers(), false)
}

describe('Reactivity Improvements - Player State Mutations', () => {
  let mockCategories: Category[]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    // Reset Zustand store data properties for test isolation.
    // Direct mutation preserves JS getter properties on the store.
    const state = gameStore.getState()
    state.currentSession = null
    state.history = []
    state.categories = []
    state.categoriesLoaded = false
    state.categoriesLoading = false
    state.displayedCategoryCount = 9
    state.categoryLoadError = null
    state.selectedLetter = null
    state.isOnline = true
    state.installPromptEvent = null
    state.pendingPlayerNames = []
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

  describe('Index-based Player Mutations', () => {
    describe('submitPlayerAnswer - Reactivity via Index', () => {
      it('updates player at correct index when submitting answer', async () => {
        const store = gameStore.getState()
        const session = await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const aliceId = session.players[0]!.id
        const bobId = session.players[1]!.id

        // Submit answer for Alice (first player)
        await store.submitPlayerAnswer(aliceId, 'Alice Answer')

        // Verify Alice's state changed using reactive array index access
        const updatedPlayers = getPlayers()
        expect(updatedPlayers[0]!.currentRoundAnswer).toBe('Alice Answer')
        expect(updatedPlayers[0]!.hasSubmitted).toBe(true)

        // Verify Bob hasn't been affected
        expect(updatedPlayers[1]!.hasSubmitted).toBe(false)

        // Submit answer for Bob
        await store.submitPlayerAnswer(bobId, 'Bob Answer')

        // Verify Bob's state changed
        const updatedAfterBob = getPlayers()
        expect(updatedAfterBob[1]!.currentRoundAnswer).toBe('Bob Answer')
        expect(updatedAfterBob[1]!.hasSubmitted).toBe(true)
      })

      it('properly triggers currentPlayerTurn reactive update', async () => {
        const store = gameStore.getState()
        const session = await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const aliceId = session.players[0]!.id

        // Initial state: Alice should be current player
        expect(getCurrentPlayerTurn()?.name).toBe('Alice')

        // Submit Alice's answer
        await store.submitPlayerAnswer(aliceId, 'Alice Answer')

        // Current player should switch to Bob
        expect(getCurrentPlayerTurn()?.name).toBe('Bob')
      })

      it('ensures reactivity works with allPlayersSubmitted getter', async () => {
        const store = gameStore.getState()
        const session = await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = session.players

        // Initially no one has submitted
        expect(areAllPlayersSubmitted()).toBe(false)

        // Alice submits
        await store.submitPlayerAnswer(alice!.id, 'Alice Answer')
        expect(areAllPlayersSubmitted()).toBe(false)

        // Bob submits
        await store.submitPlayerAnswer(bob!.id, 'Bob Answer')
        expect(areAllPlayersSubmitted()).toBe(true)
      })
    })

    describe('assignPlayerScore - Reactivity via Index', () => {
      it('updates player score at correct index', async () => {
        const store = gameStore.getState()
        const session = await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const aliceId = session.players[0]!.id
        const bobId = session.players[1]!.id

        // Assign scores using index-based mutation
        await store.assignPlayerScore(aliceId, 100)
        await store.assignPlayerScore(bobId, 50)

        // Verify scores updated at correct indices
        const updatedPlayers = getPlayers()
        expect(updatedPlayers[0]!.currentRoundScore).toBe(100)
        expect(updatedPlayers[0]!.totalScore).toBe(100)

        expect(updatedPlayers[1]!.currentRoundScore).toBe(50)
        expect(updatedPlayers[1]!.totalScore).toBe(50)
      })

      it('accumulates total score correctly with multiple rounds', async () => {
        const store = gameStore.getState()
        const session = await store.setupPlayers(['Alice', 'Bob'])

        const aliceId = session.players[0]!.id

        // Round 1
        await store.assignPlayerScore(aliceId, 100)
        let updatedPlayers = getPlayers()
        expect(updatedPlayers[0]!.totalScore).toBe(100)
        expect(updatedPlayers[0]!.currentRoundScore).toBe(100)

        // Simulate starting next round (reset current round score)
        updatedPlayers[0]!.currentRoundScore = 0

        // Round 2
        await store.assignPlayerScore(aliceId, 75)
        updatedPlayers = getPlayers()
        expect(updatedPlayers[0]!.totalScore).toBe(175)
        expect(updatedPlayers[0]!.currentRoundScore).toBe(75)
      })

      it('maintains leaderboard ranking after score updates', async () => {
        const store = gameStore.getState()
        const session = await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const alice = session.players[0]!
        const bob = session.players[1]!
        const charlie = session.players[2]!

        // Assign different scores
        await store.assignPlayerScore(alice.id, 50)
        await store.assignPlayerScore(bob.id, 100)
        await store.assignPlayerScore(charlie.id, 75)

        // Leaderboard should rank by total score descending
        const leaderboard = getLeaderboard()
        expect(leaderboard[0]!.name).toBe('Bob') // 100
        expect(leaderboard[1]!.name).toBe('Charlie') // 75
        expect(leaderboard[2]!.name).toBe('Alice') // 50
      })
    })

    describe('updatePlayerAvatar - Reactivity via Index', () => {
      it('updates avatar at correct player index', async () => {
        const store = gameStore.getState()
        const session = await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const aliceId = session.players[0]!.id
        const bobId = session.players[1]!.id

        const aliceAvatarUrl = 'data:image/png;base64,alice'
        const bobAvatarUrl = 'data:image/png;base64,bob'

        // Update avatars
        await store.updatePlayerAvatar(aliceId, aliceAvatarUrl)
        await store.updatePlayerAvatar(bobId, bobAvatarUrl)

        // Verify avatars updated at correct indices
        const updatedPlayers = getPlayers()
        expect(updatedPlayers[0]!.avatar).toBe(aliceAvatarUrl)
        expect(updatedPlayers[1]!.avatar).toBe(bobAvatarUrl)
        expect(updatedPlayers[2]!.avatar).toBeUndefined()
      })

      it('persists avatar updates to database', async () => {
        const store = gameStore.getState()
        const session = await store.setupPlayers(['Alice'])

        const alice = session.players[0]!
        const avatarUrl = 'data:image/png;base64,test'

        await store.updatePlayerAvatar(alice.id, avatarUrl)

        // Verify database save was called
        expect(mockSaveGameSession).toHaveBeenCalled()
      })
    })

    describe('Complex Multiplayer Workflow', () => {
      it('handles complete round with multiple players correctly', async () => {
        const store = gameStore.getState()
        const session = await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const [alice, bob, charlie] = session.players

        // Submit answers in order
        await store.submitPlayerAnswer(alice!.id, 'Apple')
        expect(getCurrentPlayerTurn()?.name).toBe('Bob')

        await store.submitPlayerAnswer(bob!.id, 'Banana')
        expect(getCurrentPlayerTurn()?.name).toBe('Charlie')

        await store.submitPlayerAnswer(charlie!.id, 'Cherry')
        expect(areAllPlayersSubmitted()).toBe(true)

        // Assign scores
        await store.assignPlayerScore(alice!.id, 100)
        await store.assignPlayerScore(bob!.id, 75)
        await store.assignPlayerScore(charlie!.id, 50)

        // Verify final leaderboard
        const leaderboard = getLeaderboard()
        expect(leaderboard[0]!.name).toBe('Alice')
        expect(leaderboard[0]!.totalScore).toBe(100)
        expect(leaderboard[1]!.name).toBe('Bob')
        expect(leaderboard[1]!.totalScore).toBe(75)
        expect(leaderboard[2]!.name).toBe('Charlie')
        expect(leaderboard[2]!.totalScore).toBe(50)
      })

      it('supports multiple rounds with proper state reset', async () => {
        const store = gameStore.getState()
        const session = await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = session.players

        // Round 1: Submit answers and assign scores
        await store.submitPlayerAnswer(alice!.id, 'R1-Alice')
        await store.submitPlayerAnswer(bob!.id, 'R1-Bob')

        expect(areAllPlayersSubmitted()).toBe(true)

        await store.assignPlayerScore(alice!.id, 100)
        await store.assignPlayerScore(bob!.id, 50)

        // Complete round and start next
        await store.completeRound()
        await store.startNextRound()

        // Verify Round 2 state is clean
        const updatedPlayers = getPlayers()
        expect(updatedPlayers[0]!.hasSubmitted).toBe(false)
        expect(updatedPlayers[1]!.hasSubmitted).toBe(false)
        expect(updatedPlayers[0]!.currentRoundAnswer).toBeUndefined()
        expect(updatedPlayers[1]!.currentRoundAnswer).toBeUndefined()
        expect(getCurrentPlayerTurn()?.name).toBe('Alice')

        // Round 2: Submit new answers
        await store.submitPlayerAnswer(alice!.id, 'R2-Alice')
        expect(getCurrentPlayerTurn()?.name).toBe('Bob')
      })
    })
  })

  describe('Edge Cases - Reactivity', () => {
    it('handles rapid consecutive updates without race conditions', async () => {
      const store = gameStore.getState()
      const session = await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

      const [alice, bob, charlie] = session.players

      // Rapid-fire updates
      await Promise.all([
        store.submitPlayerAnswer(alice!.id, 'Answer1'),
        store.submitPlayerAnswer(bob!.id, 'Answer2'),
        store.submitPlayerAnswer(charlie!.id, 'Answer3'),
      ])

      // All should have submitted
      expect(areAllPlayersSubmitted()).toBe(true)
      expect(getPlayers().every((p: Player) => p.hasSubmitted)).toBe(true)
    })

    it('updates leaderboard reactively after score changes', async () => {
      const store = gameStore.getState()
      const session = await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

      const [alice, bob, charlie] = session.players

      // Initial scores
      await store.assignPlayerScore(alice!.id, 50)
      await store.assignPlayerScore(bob!.id, 100)
      await store.assignPlayerScore(charlie!.id, 75)

      // Verify initial order
      expect(getLeaderboard()[0]!.name).toBe('Bob')

      // Update scores using delta-based calculation
      // Alice: delta = 200 - 50 = 150, total = 50 + 150 = 200
      await store.assignPlayerScore(alice!.id, 200)
      // Bob: delta = 100 - 100 = 0, total = 100 + 0 = 100
      await store.assignPlayerScore(bob!.id, 100)

      // Verify order changed reactively
      const updatedLeaderboard = getLeaderboard()
      expect(updatedLeaderboard[0]!.name).toBe('Alice')
      expect(updatedLeaderboard[0]!.totalScore).toBe(200)
      expect(updatedLeaderboard[1]!.name).toBe('Bob')
      expect(updatedLeaderboard[1]!.totalScore).toBe(100)
    })

    it('handles update of nonexistent player gracefully', async () => {
      const store = gameStore.getState()
      const session = await store.setupPlayers(['Alice', 'Bob'])

      const initialState = JSON.stringify(session.players)

      // Try to update nonexistent player
      await store.submitPlayerAnswer('nonexistent-id', 'Answer')

      // Store state should be unchanged
      expect(JSON.stringify(getPlayers())).toBe(initialState)
    })
  })
})
