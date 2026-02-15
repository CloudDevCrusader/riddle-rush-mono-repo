import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../stores/game'
import { createCategoryList } from '../utils/factories'
import type { Category } from '@riddle-rush/types/game'

/**
 * Game Store - Multiplayer Tests
 *
 * This file tests multiplayer-related functionality:
 * - Setup players
 * - Multi-player getters
 * - Submit player answer
 * - Assign player score
 * - Complete round
 * - Start next round
 * - Reset player submissions
 * - Get player by ID
 * - Multi-player with startNewGame
 * - Round counter logic
 * - Game start scenarios
 */

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

describe('Game Store - Multiplayer', () => {
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
    mockGetGameSessionById.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

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

    it('players exist after setup', () => {
      const store = useGameStore()
      expect(store.players.length).toBeGreaterThan(0)
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

      expect(store.players).toHaveLength(0)
      expect(store.currentSession).toBeDefined()
    })
  })

  describe('Round Counter Logic', () => {
    describe('isCurrentRoundCompleted helper logic', () => {
      it('round is NOT completed when roundHistory is empty and currentRound is 1', async () => {
        const store = useGameStore()
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
        const store = useGameStore()
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
        const store = useGameStore()
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
        const store = useGameStore()
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
        const store = useGameStore()
        // No session exists
        expect(store.currentSession).toBeNull()

        // Display logic: return 1 when no session
        const displayRound = store.currentSession ? store.currentSession.currentRound : 1
        expect(displayRound).toBe(1)
      })

      it('should show round 1 after setupPlayers (round not completed)', async () => {
        const store = useGameStore()
        await store.setupPlayers(['Alice', 'Bob'])

        // Display logic: if round NOT completed, show currentRound
        const session = store.currentSession!
        const isCompleted = session.roundHistory.length >= session.currentRound
        const displayRound = isCompleted ? session.currentRound + 1 : session.currentRound
        expect(displayRound).toBe(1)
      })

      it('should show round 2 after round 1 is completed', async () => {
        const store = useGameStore()
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
        const store = useGameStore()
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
        const store = useGameStore()

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
        const store = useGameStore()
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
        const store = useGameStore()
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
        const store = useGameStore()
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
})
