import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useGameStore } from '../../stores/gameStore'
import { usePlayerManager } from '../../composables/usePlayerManager'
import { createCategoryList } from '../utils/factories'
import type { Category } from '@riddle-rush/types/game'

/**
 * Regression test for POLISH-05: multiplayer round 1 flow bug.
 *
 * Bug report: "With 2 players, the last player in round 1 is skipped."
 *
 * These tests verify the complete 2-player round 1 sequence:
 * - Player 1 submits → allPlayersSubmitted returns false
 * - Player 2 submits → allPlayersSubmitted returns true, flow transitions to round-complete
 * - After startNextRound(), all players have hasSubmitted = false
 * - submitPlayerAnswer for non-current player does not advance turn
 */

let gameStore: ReturnType<typeof useGameStore>

// Mock IndexedDB persistence (store calls saveSessionToDB internally)
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

describe('multiplayer round 1 flow - 2 players (POLISH-05 regression)', () => {
  let mockCategories: Category[]

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    gameStore = useGameStore()
    mockCategories = createCategoryList(10)
    fetchMock.mockResolvedValue(mockCategories)
    mockGetGameSession.mockResolvedValue(null)
    mockGetGameHistory.mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('allPlayersSubmitted is false after only player 1 submits', async () => {
    const session = await gameStore.setupPlayers(['Alice', 'Bob'])

    // Verify initial state
    expect(session.players).toHaveLength(2)
    expect(session.currentPlayerIndex).toBe(0)
    expect(session.currentRound).toBe(1)
    expect(gameStore.allPlayersSubmitted).toBe(false)

    // Player 1 (Alice) submits
    await gameStore.submitPlayerAnswer(session.players[0]!.id, 'Apple')

    // After player 1 submits, allPlayersSubmitted should still be false
    expect(gameStore.allPlayersSubmitted).toBe(false)
    expect(gameStore.currentSession?.currentPlayerIndex).toBe(1)
    expect(session.players[0]!.hasSubmitted).toBe(true)
    expect(session.players[1]!.hasSubmitted).toBe(false)
  })

  it('allPlayersSubmitted is true after both players submit', async () => {
    const session = await gameStore.setupPlayers(['Alice', 'Bob'])

    // Player 1 (Alice) submits
    await gameStore.submitPlayerAnswer(session.players[0]!.id, 'Apple')
    expect(gameStore.allPlayersSubmitted).toBe(false)

    // Player 2 (Bob) submits
    await gameStore.submitPlayerAnswer(session.players[1]!.id, 'Banana')

    // After both players submit, allPlayersSubmitted should be true
    expect(gameStore.allPlayersSubmitted).toBe(true)
    expect(session.players[0]!.hasSubmitted).toBe(true)
    expect(session.players[1]!.hasSubmitted).toBe(true)
    expect(gameStore.currentSession?.currentPlayerIndex).toBe(2)
  })

  it('transitions to round-complete after both players submit', async () => {
    const session = await gameStore.setupPlayers(['Alice', 'Bob'])

    // Before submissions, flow is in-round
    expect(gameStore.flowState).toBe('in-round')

    // Player 1 submits
    await gameStore.submitPlayerAnswer(session.players[0]!.id, 'Apple')
    expect(gameStore.flowState).toBe('in-round')

    // Player 2 submits
    await gameStore.submitPlayerAnswer(session.players[1]!.id, 'Banana')

    // INVARIANT: transitionToRoundComplete produces 'round-complete', not 'decision'.
    // 'decision' only occurs after completeRound() → transitionToDecision().
    expect(gameStore.flowState).toBe('round-complete')
    expect(gameStore.postRoundDecisionPending).toBe(false)
  })

  it('hasSubmitted resets for all players after startNextRound', async () => {
    const session = await gameStore.setupPlayers(['Alice', 'Bob'])

    // Both players submit
    await gameStore.submitPlayerAnswer(session.players[0]!.id, 'Apple')
    await gameStore.submitPlayerAnswer(session.players[1]!.id, 'Banana')
    expect(gameStore.allPlayersSubmitted).toBe(true)

    // Start next round
    await gameStore.startNextRound()

    // All players should have hasSubmitted = false
    expect(session.players[0]!.hasSubmitted).toBe(false)
    expect(session.players[1]!.hasSubmitted).toBe(false)
    expect(gameStore.allPlayersSubmitted).toBe(false)
    expect(gameStore.currentSession?.currentPlayerIndex).toBe(0)
    expect(gameStore.currentSession?.currentRound).toBe(2)
  })

  it('submitPlayerAnswer for non-current player does not advance turn', async () => {
    const session = await gameStore.setupPlayers(['Alice', 'Bob'])

    // Try to submit for Bob (index 1) when Alice (index 0) is current
    await gameStore.submitPlayerAnswer(session.players[1]!.id, 'Banana')

    // Nothing should change - Bob's submission is rejected
    expect(gameStore.currentSession?.currentPlayerIndex).toBe(0)
    expect(session.players[1]!.hasSubmitted).toBe(false)
    expect(gameStore.allPlayersSubmitted).toBe(false)
  })

  it('full 2-player round 1 sequence with scoring and next round', async () => {
    const session = await gameStore.setupPlayers(['Alice', 'Bob'])

    // Verify initial round state
    expect(session.currentRound).toBe(1)
    expect(session.roundHistory).toHaveLength(0)

    // --- Round 1 ---
    // Alice submits
    await gameStore.submitPlayerAnswer(session.players[0]!.id, 'Apple')
    expect(gameStore.currentSession?.currentPlayerIndex).toBe(1)

    // Bob submits (last player in round 1)
    await gameStore.submitPlayerAnswer(session.players[1]!.id, 'Banana')

    // Both submitted - round should be complete (not decision yet)
    expect(gameStore.allPlayersSubmitted).toBe(true)
    expect(gameStore.flowState).toBe('round-complete')

    // Assign scores
    await gameStore.assignPlayerScore(session.players[0]!.id, 10)
    await gameStore.assignPlayerScore(session.players[1]!.id, 5)
    expect(session.players[0]!.totalScore).toBe(10)
    expect(session.players[1]!.totalScore).toBe(5)

    // Complete round transitions to 'decision', then start next round
    await gameStore.completeRound()
    expect(gameStore.flowState).toBe('decision')
    await gameStore.startNextRound()

    expect(gameStore.currentSession?.currentRound).toBe(2)
    expect(gameStore.currentSession?.currentPlayerIndex).toBe(0)
    expect(gameStore.flowState).toBe('in-round')

    // Both players can submit again in round 2
    expect(session.players[0]!.hasSubmitted).toBe(false)
    expect(session.players[1]!.hasSubmitted).toBe(false)

    // Alice submits in round 2
    await gameStore.submitPlayerAnswer(session.players[0]!.id, 'Avocado')
    expect(gameStore.currentSession?.currentPlayerIndex).toBe(1)

    // Bob submits in round 2 (last player should NOT be skipped)
    await gameStore.submitPlayerAnswer(session.players[1]!.id, 'Blueberry')
    expect(gameStore.allPlayersSubmitted).toBe(true)
    expect(gameStore.flowState).toBe('round-complete')
  })

  describe('usePlayerManager unit checks', () => {
    it('allPlayersSubmitted returns false with empty array', () => {
      const pm = usePlayerManager()
      expect(pm.allPlayersSubmitted([])).toBe(false)
    })

    it('allPlayersSubmitted returns false when one player has not submitted', () => {
      const pm = usePlayerManager()
      const players = [
        { id: '1', name: 'Alice', totalScore: 0, currentRoundScore: 0, hasSubmitted: true },
        { id: '2', name: 'Bob', totalScore: 0, currentRoundScore: 0, hasSubmitted: false },
      ]
      expect(pm.allPlayersSubmitted(players)).toBe(false)
    })

    it('allPlayersSubmitted returns true when all players have submitted', () => {
      const pm = usePlayerManager()
      const players = [
        { id: '1', name: 'Alice', totalScore: 0, currentRoundScore: 0, hasSubmitted: true },
        { id: '2', name: 'Bob', totalScore: 0, currentRoundScore: 0, hasSubmitted: true },
      ]
      expect(pm.allPlayersSubmitted(players)).toBe(true)
    })

    it('resetPlayerRoundState clears all submission state', () => {
      const pm = usePlayerManager()
      const players = [
        {
          id: '1',
          name: 'Alice',
          totalScore: 10,
          currentRoundScore: 5,
          currentRoundAnswer: 'Apple',
          hasSubmitted: true,
        },
        {
          id: '2',
          name: 'Bob',
          totalScore: 5,
          currentRoundScore: 3,
          currentRoundAnswer: 'Banana',
          hasSubmitted: true,
        },
      ]

      pm.resetPlayerRoundState(players)

      expect(players[0]!.hasSubmitted).toBe(false)
      expect(players[0]!.currentRoundAnswer).toBeUndefined()
      expect(players[0]!.currentRoundScore).toBe(0)
      expect(players[0]!.totalScore).toBe(10) // totalScore preserved
      expect(players[1]!.hasSubmitted).toBe(false)
      expect(players[1]!.currentRoundAnswer).toBeUndefined()
      expect(players[1]!.currentRoundScore).toBe(0)
      expect(players[1]!.totalScore).toBe(5) // totalScore preserved
    })
  })
})
