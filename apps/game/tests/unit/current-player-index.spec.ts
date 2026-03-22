import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { gameStore } from '../../stores/gameStore'
import { usePlayerManager } from '../../composables/usePlayerManager'
import { createCategoryList } from '../utils/factories'
import type { Category, Player } from '@riddle-rush/types/game'

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

describe('currentPlayerIndex - Index-based Player Turn Tracking', () => {
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

  describe('usePlayerManager.getCurrentPlayerTurn with index', () => {
    it('returns players[0] when currentPlayerIndex is 0', () => {
      const playerManager = usePlayerManager()
      const players: Player[] = [
        { id: '1', name: 'Alice', totalScore: 0, currentRoundScore: 0, hasSubmitted: false },
        { id: '2', name: 'Bob', totalScore: 0, currentRoundScore: 0, hasSubmitted: false },
        { id: '3', name: 'Charlie', totalScore: 0, currentRoundScore: 0, hasSubmitted: false },
      ]

      const result = playerManager.getCurrentPlayerTurn(players, 0)
      expect(result?.name).toBe('Alice')
    })

    it('returns players[1] when currentPlayerIndex is 1', () => {
      const playerManager = usePlayerManager()
      const players: Player[] = [
        { id: '1', name: 'Alice', totalScore: 0, currentRoundScore: 0, hasSubmitted: false },
        { id: '2', name: 'Bob', totalScore: 0, currentRoundScore: 0, hasSubmitted: false },
        { id: '3', name: 'Charlie', totalScore: 0, currentRoundScore: 0, hasSubmitted: false },
      ]

      const result = playerManager.getCurrentPlayerTurn(players, 1)
      expect(result?.name).toBe('Bob')
    })

    it('returns null when currentPlayerIndex is beyond players length', () => {
      const playerManager = usePlayerManager()
      const players: Player[] = [
        { id: '1', name: 'Alice', totalScore: 0, currentRoundScore: 0, hasSubmitted: false },
        { id: '2', name: 'Bob', totalScore: 0, currentRoundScore: 0, hasSubmitted: false },
      ]

      const result = playerManager.getCurrentPlayerTurn(players, 5)
      expect(result).toBeNull()
    })
  })

  describe('usePlayerManager.advancePlayerIndex', () => {
    it('advances index by 1', () => {
      const playerManager = usePlayerManager()
      expect(playerManager.advancePlayerIndex(0, 3)).toBe(1)
    })

    it('does not wrap when reaching playerCount', () => {
      const playerManager = usePlayerManager()
      expect(playerManager.advancePlayerIndex(2, 3)).toBe(3)
    })
  })

  describe('Store integration - currentPlayerIndex', () => {
    it('new session via setupPlayers has currentPlayerIndex 0', async () => {
      const session = await gameStore.getState().setupPlayers(['Alice', 'Bob', 'Charlie'])

      expect(session.currentPlayerIndex).toBe(0)
    })

    it('submitPlayerAnswer advances currentPlayerIndex by 1', async () => {
      const session = await gameStore.getState().setupPlayers(['Alice', 'Bob', 'Charlie'])

      const aliceId = session.players[0]!.id
      await gameStore.getState().submitPlayerAnswer(aliceId, 'Apple')

      expect(gameStore.getState().currentSession?.currentPlayerIndex).toBe(1)
    })

    it('after submitting all players, currentPlayerIndex equals player count', async () => {
      const session = await gameStore.getState().setupPlayers(['Alice', 'Bob', 'Charlie'])

      for (const player of session.players) {
        await gameStore.getState().submitPlayerAnswer(player.id, 'Answer')
      }

      expect(gameStore.getState().currentSession?.currentPlayerIndex).toBe(3)
    })

    it('startNextRound resets currentPlayerIndex to 0', async () => {
      const session = await gameStore.getState().setupPlayers(['Alice', 'Bob', 'Charlie'])

      // Submit some answers to advance the index
      await gameStore.getState().submitPlayerAnswer(session.players[0]!.id, 'A')
      await gameStore.getState().submitPlayerAnswer(session.players[1]!.id, 'B')
      expect(gameStore.getState().currentSession?.currentPlayerIndex).toBe(2)

      // Start next round
      await gameStore.getState().startNextRound()

      expect(gameStore.getState().currentSession?.currentPlayerIndex).toBe(0)
    })

    it('resetPlayerSubmissions resets currentPlayerIndex to 0', async () => {
      const session = await gameStore.getState().setupPlayers(['Alice', 'Bob'])

      await gameStore.getState().submitPlayerAnswer(session.players[0]!.id, 'A')
      expect(gameStore.getState().currentSession?.currentPlayerIndex).toBe(1)

      await gameStore.getState().resetPlayerSubmissions()

      expect(gameStore.getState().currentSession?.currentPlayerIndex).toBe(0)
    })

    it('currentPlayerTurn getter uses currentPlayerIndex', async () => {
      const session = await gameStore.getState().setupPlayers(['Alice', 'Bob', 'Charlie'])

      const playerManager = usePlayerManager()
      const getTurn = () =>
        playerManager.getCurrentPlayerTurn(
          gameStore.getState().currentSession?.players ?? [],
          gameStore.getState().currentSession?.currentPlayerIndex ?? 0
        )

      // Index 0 -> Alice
      expect(getTurn()?.name).toBe('Alice')

      // Submit Alice -> index becomes 1 -> Bob
      await gameStore.getState().submitPlayerAnswer(session.players[0]!.id, 'A')
      expect(getTurn()?.name).toBe('Bob')

      // Submit Bob -> index becomes 2 -> Charlie
      await gameStore.getState().submitPlayerAnswer(session.players[1]!.id, 'B')
      expect(getTurn()?.name).toBe('Charlie')

      // Submit Charlie -> index becomes 3 -> null (all done)
      await gameStore.getState().submitPlayerAnswer(session.players[2]!.id, 'C')
      expect(getTurn()).toBeNull()
    })
  })
})
