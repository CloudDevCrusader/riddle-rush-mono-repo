import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameState } from '../../composables/useGameState'
import { useGameStore } from '../../stores/game'
import { useSettingsStore } from '../../stores/settings'
import { createCategory, createGameSession, createPlayer } from '../utils/factories'
import * as Vue from 'vue'
import * as VueRouter from 'vue-router'
import * as Pinia from 'pinia'

// Make Vue, VueRouter, and Pinia exports globally available (workspace config has no setupFiles)
Object.assign(globalThis, Vue, VueRouter, Pinia)

// Mock dependencies of the game store
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

const fetchMock = vi.fn().mockResolvedValue([])
vi.stubGlobal('$fetch', fetchMock as unknown as typeof $fetch)

// Register store functions as globals (Nuxt auto-imports them, but Vitest doesn't)
Object.assign(globalThis, { useGameStore, useSettingsStore })

describe('useGameState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  describe('initial state', () => {
    it('returns gameStore and settingsStore instances', () => {
      const state = useGameState()
      expect(state.gameStore).toBeDefined()
      expect(state.settingsStore).toBeDefined()
    })

    it('hasActiveSession is false when no session exists', () => {
      const state = useGameState()
      expect(state.hasActiveSession.value).toBe(false)
    })

    it('currentCategory is null when no session exists', () => {
      const state = useGameState()
      expect(state.currentCategory.value).toBeNull()
    })

    it('currentLetter is empty string when no session exists', () => {
      const state = useGameState()
      expect(state.currentLetter.value).toBe('')
    })

    it('currentRound is 0 when no session exists', () => {
      const state = useGameState()
      expect(state.currentRound.value).toBe(0)
    })

    it('players is empty array when no session exists', () => {
      const state = useGameState()
      expect(state.players.value).toEqual([])
    })

    it('currentPlayerTurn is null when no session exists', () => {
      const state = useGameState()
      expect(state.currentPlayerTurn.value).toBeNull()
    })

    it('allPlayersSubmitted is false when no session exists', () => {
      const state = useGameState()
      expect(state.allPlayersSubmitted.value).toBe(false)
    })

    it('isGameCompleted is false when no session exists', () => {
      const state = useGameState()
      expect(state.isGameCompleted.value).toBe(false)
    })

    it('leaderboard is empty array initially', () => {
      const state = useGameState()
      expect(state.leaderboard.value).toEqual([])
    })

    it('gameStatus is "active" when no session exists (store default)', () => {
      const state = useGameState()
      expect(state.gameStatus.value).toBe('active')
    })
  })

  describe('reactive updates', () => {
    it('hasActiveSession becomes true when session is set', () => {
      const state = useGameState()
      const gameStore = useGameStore()

      expect(state.hasActiveSession.value).toBe(false)

      const category = createCategory()
      const session = createGameSession({ category })
      gameStore.currentSession = session

      expect(state.hasActiveSession.value).toBe(true)
    })

    it('currentCategory reflects current session category', () => {
      const state = useGameState()
      const gameStore = useGameStore()

      const category = createCategory({ name: 'Animals', key: 'animal' })
      const session = createGameSession({ category })
      gameStore.currentSession = session

      expect(state.currentCategory.value?.name).toBe('Animals')
      expect(state.currentCategory.value?.key).toBe('animal')
    })

    it('currentLetter reflects session letter', () => {
      const state = useGameState()
      const gameStore = useGameStore()

      const category = createCategory()
      const session = createGameSession({ category, letter: 'z' })
      gameStore.currentSession = session

      expect(state.currentLetter.value).toBe('z')
    })

    it('currentRound reflects session currentRound', () => {
      const state = useGameState()
      const gameStore = useGameStore()

      const category = createCategory()
      const session = createGameSession({ category, currentRound: 3 })
      gameStore.currentSession = session

      expect(state.currentRound.value).toBe(3)
    })

    it('players reflects session players', () => {
      const state = useGameState()
      const gameStore = useGameStore()

      const category = createCategory()
      const players = [createPlayer({ name: 'Alice' }), createPlayer({ name: 'Bob' })]
      const session = createGameSession({ category, players })
      gameStore.currentSession = session

      expect(state.players.value).toHaveLength(2)
      expect(state.players.value[0]!.name).toBe('Alice')
    })

    it('currentPlayerTurn is the first unsubmitted player', () => {
      const state = useGameState()
      const gameStore = useGameStore()

      const category = createCategory()
      const pendingPlayer = createPlayer({ name: 'Alice', hasSubmitted: false })
      const donePlayer = createPlayer({ name: 'Bob', hasSubmitted: true })
      const session = createGameSession({ category, players: [pendingPlayer, donePlayer] })
      gameStore.currentSession = session

      expect(state.currentPlayerTurn.value?.name).toBe('Alice')
    })

    it('allPlayersSubmitted is true when all players have submitted', () => {
      const state = useGameState()
      const gameStore = useGameStore()

      const category = createCategory()
      const players = [createPlayer({ hasSubmitted: true }), createPlayer({ hasSubmitted: true })]
      const session = createGameSession({ category, players })
      gameStore.currentSession = session

      expect(state.allPlayersSubmitted.value).toBe(true)
    })

    it('allPlayersSubmitted is false when some players have not submitted', () => {
      const state = useGameState()
      const gameStore = useGameStore()

      const category = createCategory()
      const players = [createPlayer({ hasSubmitted: true }), createPlayer({ hasSubmitted: false })]
      const session = createGameSession({ category, players })
      gameStore.currentSession = session

      expect(state.allPlayersSubmitted.value).toBe(false)
    })

    it('gameStatus reflects session status', () => {
      const state = useGameState()
      const gameStore = useGameStore()

      const category = createCategory()
      const session = createGameSession({ category, status: 'active' })
      gameStore.currentSession = session

      expect(state.gameStatus.value).toBe('active')
    })
  })

  describe('store reactivity is shared', () => {
    it('two instances of useGameState share the same store', () => {
      const stateA = useGameState()
      const stateB = useGameState()

      const gameStore = useGameStore()
      const category = createCategory()
      const session = createGameSession({ category })
      gameStore.currentSession = session

      // Both computed refs should reflect the same underlying store
      expect(stateA.hasActiveSession.value).toBe(true)
      expect(stateB.hasActiveSession.value).toBe(true)
    })
  })
})
