import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../stores/game'
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
    const pinia = createPinia()
    setActivePinia(pinia)
    // @ts-expect-error: Accessing internal Pinia API for test cleanup
    pinia._s.forEach((store: { $reset: () => void }) => store.$reset())
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
      const store = useGameStore()
      await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

      expect(store.currentSession?.currentPlayerIndex).toBe(0)
    })

    it('submitPlayerAnswer advances currentPlayerIndex by 1', async () => {
      const store = useGameStore()
      await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

      const aliceId = store.players[0]!.id
      await store.submitPlayerAnswer(aliceId, 'Apple')

      expect(store.currentSession?.currentPlayerIndex).toBe(1)
    })

    it('after submitting all players, currentPlayerIndex equals player count', async () => {
      const store = useGameStore()
      await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

      for (const player of store.players) {
        await store.submitPlayerAnswer(player.id, 'Answer')
      }

      expect(store.currentSession?.currentPlayerIndex).toBe(3)
    })

    it('startNextRound resets currentPlayerIndex to 0', async () => {
      const store = useGameStore()
      await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

      // Submit some answers to advance the index
      await store.submitPlayerAnswer(store.players[0]!.id, 'A')
      await store.submitPlayerAnswer(store.players[1]!.id, 'B')
      expect(store.currentSession?.currentPlayerIndex).toBe(2)

      // Start next round
      await store.startNextRound()

      expect(store.currentSession?.currentPlayerIndex).toBe(0)
    })

    it('resetPlayerSubmissions resets currentPlayerIndex to 0', async () => {
      const store = useGameStore()
      await store.setupPlayers(['Alice', 'Bob'])

      await store.submitPlayerAnswer(store.players[0]!.id, 'A')
      expect(store.currentSession?.currentPlayerIndex).toBe(1)

      await store.resetPlayerSubmissions()

      expect(store.currentSession?.currentPlayerIndex).toBe(0)
    })

    it('currentPlayerTurn getter uses currentPlayerIndex', async () => {
      const store = useGameStore()
      await store.setupPlayers(['Alice', 'Bob', 'Charlie'])

      // Index 0 -> Alice
      expect(store.currentPlayerTurn?.name).toBe('Alice')

      // Submit Alice -> index becomes 1 -> Bob
      await store.submitPlayerAnswer(store.players[0]!.id, 'A')
      expect(store.currentPlayerTurn?.name).toBe('Bob')

      // Submit Bob -> index becomes 2 -> Charlie
      await store.submitPlayerAnswer(store.players[1]!.id, 'B')
      expect(store.currentPlayerTurn?.name).toBe('Charlie')

      // Submit Charlie -> index becomes 3 -> null (all done)
      await store.submitPlayerAnswer(store.players[2]!.id, 'C')
      expect(store.currentPlayerTurn).toBeNull()
    })
  })
})
