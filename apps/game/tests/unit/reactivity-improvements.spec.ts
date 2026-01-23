import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../stores/game'
import { createCategoryList } from '../utils/factories'
import type { Category } from '@riddle-rush/types/game'

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

describe('Reactivity Improvements - Player State Mutations', () => {
  let mockCategories: Category[]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    const pinia = createPinia()
    setActivePinia(pinia)
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

  describe('Index-based Player Mutations', () => {
    describe('submitPlayerAnswer - Reactivity via Index', () => {
      it('updates player at correct index when submitting answer', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const aliceId = store.players[0]!.id
        const bobId = store.players[1]!.id

        // Submit answer for Alice (first player)
        await store.submitPlayerAnswer(aliceId, 'Alice Answer')

        // Verify Alice's state changed using reactive array index access
        expect(store.players[0]!.currentRoundAnswer).toBe('Alice Answer')
        expect(store.players[0]!.hasSubmitted).toBe(true)

        // Verify Bob hasn't been affected
        expect(store.players[1]!.hasSubmitted).toBe(false)

        // Submit answer for Bob
        await store.submitPlayerAnswer(bobId, 'Bob Answer')

        // Verify Bob's state changed
        expect(store.players[1]!.currentRoundAnswer).toBe('Bob Answer')
        expect(store.players[1]!.hasSubmitted).toBe(true)
      })

      it('properly triggers currentPlayerTurn reactive update', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const aliceId = store.players[0]!.id

        // Initial state: Alice should be current player
        expect(store.currentPlayerTurn?.name).toBe('Alice')

        // Submit Alice's answer
        await store.submitPlayerAnswer(aliceId, 'Alice Answer')

        // Current player should switch to Bob
        expect(store.currentPlayerTurn?.name).toBe('Bob')
      })

      it('ensures reactivity works with allPlayersSubmitted getter', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = store.players

        // Initially no one has submitted
        expect(store.allPlayersSubmitted).toBe(false)

        // Alice submits
        await store.submitPlayerAnswer(alice!.id, 'Alice Answer')
        expect(store.allPlayersSubmitted).toBe(false)

        // Bob submits
        await store.submitPlayerAnswer(bob!.id, 'Bob Answer')
        expect(store.allPlayersSubmitted).toBe(true)
      })
    })

    describe('assignPlayerScore - Reactivity via Index', () => {
      it('updates player score at correct index', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const aliceId = store.players[0]!.id
        const bobId = store.players[1]!.id

        // Assign scores using index-based mutation
        await store.assignPlayerScore(aliceId, 100)
        await store.assignPlayerScore(bobId, 50)

        // Verify scores updated at correct indices
        expect(store.players[0]!.currentRoundScore).toBe(100)
        expect(store.players[0]!.totalScore).toBe(100)

        expect(store.players[1]!.currentRoundScore).toBe(50)
        expect(store.players[1]!.totalScore).toBe(50)
      })

      it('accumulates total score correctly with multiple rounds', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])

        const aliceId = store.players[0]!.id

        // Round 1
        await store.assignPlayerScore(aliceId, 100)
        expect(store.players[0]!.totalScore).toBe(100)
        expect(store.players[0]!.currentRoundScore).toBe(100)

        // Simulate starting next round (reset current round score)
        store.players[0]!.currentRoundScore = 0

        // Round 2
        await store.assignPlayerScore(aliceId, 75)
        expect(store.players[0]!.totalScore).toBe(175)
        expect(store.players[0]!.currentRoundScore).toBe(75)
      })

      it('maintains leaderboard ranking after score updates', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const alice = store.players[0]!
        const bob = store.players[1]!
        const charlie = store.players[2]!

        // Assign different scores
        await store.assignPlayerScore(alice.id, 50)
        await store.assignPlayerScore(bob.id, 100)
        await store.assignPlayerScore(charlie.id, 75)

        // Leaderboard should rank by total score descending
        expect(store.leaderboard[0]!.name).toBe('Bob') // 100
        expect(store.leaderboard[1]!.name).toBe('Charlie') // 75
        expect(store.leaderboard[2]!.name).toBe('Alice') // 50
      })
    })

    describe('updatePlayerAvatar - Reactivity via Index', () => {
      it('updates avatar at correct player index', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const aliceId = store.players[0]!.id
        const bobId = store.players[1]!.id

        const aliceAvatarUrl = 'data:image/png;base64,alice'
        const bobAvatarUrl = 'data:image/png;base64,bob'

        // Update avatars
        await store.updatePlayerAvatar(aliceId, aliceAvatarUrl)
        await store.updatePlayerAvatar(bobId, bobAvatarUrl)

        // Verify avatars updated at correct indices
        expect(store.players[0]!.avatar).toBe(aliceAvatarUrl)
        expect(store.players[1]!.avatar).toBe(bobAvatarUrl)
        expect(store.players[2]!.avatar).toBeUndefined()
      })

      it('persists avatar updates to database', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice'])

        const alice = store.players[0]!
        const avatarUrl = 'data:image/png;base64,test'

        await store.updatePlayerAvatar(alice.id, avatarUrl)

        // Verify database save was called
        expect(mockSaveGameSession).toHaveBeenCalled()
      })
    })

    describe('Complex Multiplayer Workflow', () => {
      it('handles complete round with multiple players correctly', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

        const [alice, bob, charlie] = store.players

        // Submit answers in order
        await store.submitPlayerAnswer(alice!.id, 'Apple')
        expect(store.currentPlayerTurn?.name).toBe('Bob')

        await store.submitPlayerAnswer(bob!.id, 'Banana')
        expect(store.currentPlayerTurn?.name).toBe('Charlie')

        await store.submitPlayerAnswer(charlie!.id, 'Cherry')
        expect(store.allPlayersSubmitted).toBe(true)

        // Assign scores
        await store.assignPlayerScore(alice!.id, 100)
        await store.assignPlayerScore(bob!.id, 75)
        await store.assignPlayerScore(charlie!.id, 50)

        // Verify final leaderboard
        expect(store.leaderboard[0]!.name).toBe('Alice')
        expect(store.leaderboard[0]!.totalScore).toBe(100)
        expect(store.leaderboard[1]!.name).toBe('Bob')
        expect(store.leaderboard[1]!.totalScore).toBe(75)
        expect(store.leaderboard[2]!.name).toBe('Charlie')
        expect(store.leaderboard[2]!.totalScore).toBe(50)
      })

      it('supports multiple rounds with proper state reset', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])

        const [alice, bob] = store.players

        // Round 1: Submit answers and assign scores
        await store.submitPlayerAnswer(alice!.id, 'R1-Alice')
        await store.submitPlayerAnswer(bob!.id, 'R1-Bob')

        expect(store.allPlayersSubmitted).toBe(true)

        await store.assignPlayerScore(alice!.id, 100)
        await store.assignPlayerScore(bob!.id, 50)

        // Complete round and start next
        await store.completeRound()
        await store.startNextRound()

        // Verify Round 2 state is clean
        expect(store.players[0]!.hasSubmitted).toBe(false)
        expect(store.players[1]!.hasSubmitted).toBe(false)
        expect(store.players[0]!.currentRoundAnswer).toBeUndefined()
        expect(store.players[1]!.currentRoundAnswer).toBeUndefined()
        expect(store.currentPlayerTurn?.name).toBe('Alice')

        // Round 2: Submit new answers
        await store.submitPlayerAnswer(alice!.id, 'R2-Alice')
        expect(store.currentPlayerTurn?.name).toBe('Bob')
      })
    })
  })

  describe('Edge Cases - Reactivity', () => {
    it('handles rapid consecutive updates without race conditions', async () => {
      const store = useGameStore()
      await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

      const [alice, bob, charlie] = store.players

      // Rapid-fire updates
      await Promise.all([
        store.submitPlayerAnswer(alice!.id, 'Answer1'),
        store.submitPlayerAnswer(bob!.id, 'Answer2'),
        store.submitPlayerAnswer(charlie!.id, 'Answer3'),
      ])

      // All should have submitted
      expect(store.allPlayersSubmitted).toBe(true)
      expect(store.players.every((p) => p.hasSubmitted)).toBe(true)
    })

    it('updates leaderboard reactively after score changes', async () => {
      const store = useGameStore()
      await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

      const [alice, bob, charlie] = store.players

      // Initial scores
      await store.assignPlayerScore(alice!.id, 50)
      await store.assignPlayerScore(bob!.id, 100)
      await store.assignPlayerScore(charlie!.id, 75)

      // Verify initial order
      expect(store.leaderboard[0]!.name).toBe('Bob')

      // Update scores
      await store.assignPlayerScore(alice!.id, 200) // Now 250 total (50 + 200)
      await store.assignPlayerScore(bob!.id, 100) // Still 100 total (no change, same score)

      // Verify order changed reactively
      expect(store.leaderboard[0]!.name).toBe('Alice')
      expect(store.leaderboard[0]!.totalScore).toBe(250)
      expect(store.leaderboard[1]!.name).toBe('Bob')
      expect(store.leaderboard[1]!.totalScore).toBe(100)
    })

    it('handles update of nonexistent player gracefully', async () => {
      const store = useGameStore()
      await store.setupPlayers(['Alice', 'Bob'])

      const initialState = JSON.stringify(store.players)

      // Try to update nonexistent player
      await store.submitPlayerAnswer('nonexistent-id', 'Answer')

      // Store state should be unchanged
      expect(JSON.stringify(store.players)).toBe(initialState)
    })
  })
})
