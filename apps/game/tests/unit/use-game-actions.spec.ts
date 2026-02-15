import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameActions } from '../../composables/useGameActions'
import * as Vue from 'vue'
import * as VueRouter from 'vue-router'
import * as Pinia from 'pinia'

// Make Vue, VueRouter, and Pinia exports globally available (workspace config has no setupFiles)
Object.assign(globalThis, Vue, VueRouter, Pinia)

// --- Mock all Nuxt auto-imports used inside useGameActions ---

const mockPush = vi.fn().mockResolvedValue(undefined)

const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockToastInfo = vi.fn()
vi.mock('~/composables/useToast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
  }),
}))

const mockPlayNewRound = vi.fn()
vi.mock('~/composables/useAudio', () => ({
  useAudio: () => ({
    playNewRound: mockPlayNewRound,
  }),
}))

// Game store mocks
const mockStartNewGame = vi.fn().mockResolvedValue(undefined)
const mockResumeOrStartNewGame = vi.fn().mockResolvedValue(undefined)
const mockEndGame = vi.fn().mockResolvedValue(undefined)
const mockSetupPlayers = vi.fn().mockResolvedValue(undefined)
const mockStartNextRound = vi.fn().mockResolvedValue(undefined)

// IndexedDB mocks (required by the game store)
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

// Mock the game store itself so we control exactly what each action does
vi.mock('~/stores/game', () => ({
  useGameStore: () => ({
    startNewGame: mockStartNewGame,
    resumeOrStartNewGame: mockResumeOrStartNewGame,
    endGame: mockEndGame,
    setupPlayers: mockSetupPlayers,
    startNextRound: mockStartNextRound,
    hasActiveSession: false,
    currentSession: null,
  }),
}))

// Also mock useLogger used by useGameActions
vi.mock('~/composables/useLogger', () => ({
  useLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}))

// Also mock useI18n (Nuxt auto-import)
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, fallback?: string | Record<string, unknown>) =>
      typeof fallback === 'string' ? fallback : key,
  }),
}))

const fetchMock = vi.fn().mockResolvedValue([])
vi.stubGlobal('$fetch', fetchMock as unknown as typeof $fetch)

// Register Nuxt auto-imported globals that composables use directly
const mockUseGameStore = () => ({
  startNewGame: mockStartNewGame,
  resumeOrStartNewGame: mockResumeOrStartNewGame,
  endGame: mockEndGame,
  setupPlayers: mockSetupPlayers,
  startNextRound: mockStartNextRound,
  hasActiveSession: false,
  currentSession: null,
})

const mockUseToast = () => ({
  success: mockToastSuccess,
  error: mockToastError,
  info: mockToastInfo,
})

const mockUseAudio = () => ({
  playNewRound: mockPlayNewRound,
})

const mockUseI18n = () => ({
  t: (key: string, fallback?: string | Record<string, unknown>) =>
    typeof fallback === 'string' ? fallback : key,
})

Object.assign(globalThis, {
  useGameStore: mockUseGameStore,
  useToast: mockUseToast,
  useAudio: mockUseAudio,
  useI18n: mockUseI18n,
  // Override setup.ts useRouter with one that uses our mockPush
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), forward: vi.fn() }),
})

describe('useGameActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('startNewGame', () => {
    it('calls gameStore.startNewGame', async () => {
      const { startNewGame } = useGameActions()
      await startNewGame()
      expect(mockStartNewGame).toHaveBeenCalledOnce()
    })

    it('plays new round sound on success', async () => {
      const { startNewGame } = useGameActions()
      await startNewGame()
      expect(mockPlayNewRound).toHaveBeenCalledOnce()
    })

    it('shows success toast on success', async () => {
      const { startNewGame } = useGameActions()
      await startNewGame()
      expect(mockToastSuccess).toHaveBeenCalledOnce()
    })

    it('returns true on success', async () => {
      const { startNewGame } = useGameActions()
      const result = await startNewGame()
      expect(result).toBe(true)
    })

    it('shows error toast when store throws', async () => {
      mockStartNewGame.mockRejectedValueOnce(new Error('DB error'))
      const { startNewGame } = useGameActions()
      await startNewGame()
      expect(mockToastError).toHaveBeenCalledOnce()
    })

    it('returns false when store throws', async () => {
      mockStartNewGame.mockRejectedValueOnce(new Error('DB error'))
      const { startNewGame } = useGameActions()
      const result = await startNewGame()
      expect(result).toBe(false)
    })
  })

  describe('resumeOrStartGame', () => {
    it('calls gameStore.resumeOrStartNewGame', async () => {
      const { resumeOrStartGame } = useGameActions()
      await resumeOrStartGame()
      expect(mockResumeOrStartNewGame).toHaveBeenCalledOnce()
    })

    it('returns true on success', async () => {
      const { resumeOrStartGame } = useGameActions()
      const result = await resumeOrStartGame()
      expect(result).toBe(true)
    })

    it('returns false when store throws', async () => {
      mockResumeOrStartNewGame.mockRejectedValueOnce(new Error('load error'))
      const { resumeOrStartGame } = useGameActions()
      const result = await resumeOrStartGame()
      expect(result).toBe(false)
    })

    it('shows error toast when store throws', async () => {
      mockResumeOrStartNewGame.mockRejectedValueOnce(new Error('load error'))
      const { resumeOrStartGame } = useGameActions()
      await resumeOrStartGame()
      expect(mockToastError).toHaveBeenCalledOnce()
    })
  })

  describe('endGame', () => {
    it('calls gameStore.endGame', async () => {
      const { endGame } = useGameActions()
      await endGame()
      expect(mockEndGame).toHaveBeenCalledOnce()
    })

    it('shows success toast on success', async () => {
      const { endGame } = useGameActions()
      await endGame()
      expect(mockToastSuccess).toHaveBeenCalledOnce()
    })

    it('navigates to home on success', async () => {
      const { endGame } = useGameActions()
      await endGame()
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('returns true on success', async () => {
      const { endGame } = useGameActions()
      const result = await endGame()
      expect(result).toBe(true)
    })

    it('shows error toast when store throws', async () => {
      mockEndGame.mockRejectedValueOnce(new Error('save error'))
      const { endGame } = useGameActions()
      await endGame()
      expect(mockToastError).toHaveBeenCalledOnce()
    })

    it('returns false when store throws', async () => {
      mockEndGame.mockRejectedValueOnce(new Error('save error'))
      const { endGame } = useGameActions()
      const result = await endGame()
      expect(result).toBe(false)
    })
  })

  describe('shareScore', () => {
    it('shows info toast when navigator.share is not available', async () => {
      // Ensure no share API
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
      const { shareScore } = useGameActions()
      const result = await shareScore(42)
      expect(mockToastInfo).toHaveBeenCalledOnce()
      expect(result).toBe(false)
    })

    it('calls navigator.share and returns true on success', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'share', { value: mockShare, configurable: true })

      const { shareScore } = useGameActions()
      const result = await shareScore(99)
      expect(mockShare).toHaveBeenCalledOnce()
      expect(result).toBe(true)
    })

    it('returns false silently when user aborts share', async () => {
      const abortError = new Error('Share aborted')
      abortError.name = 'AbortError'
      const mockShare = vi.fn().mockRejectedValue(abortError)
      Object.defineProperty(navigator, 'share', { value: mockShare, configurable: true })

      const { shareScore } = useGameActions()
      const result = await shareScore(50)
      expect(result).toBe(false)
      // No error toast for user cancellation
      expect(mockToastError).not.toHaveBeenCalled()
    })

    it('shows error toast for non-abort share errors', async () => {
      const mockShare = vi.fn().mockRejectedValue(new Error('permission denied'))
      Object.defineProperty(navigator, 'share', { value: mockShare, configurable: true })

      const { shareScore } = useGameActions()
      const result = await shareScore(50)
      expect(result).toBe(false)
      expect(mockToastError).toHaveBeenCalledOnce()
    })
  })

  describe('setupMultiplayerGame', () => {
    it('calls gameStore.setupPlayers with player names', async () => {
      const { setupMultiplayerGame } = useGameActions()
      await setupMultiplayerGame(['Alice', 'Bob', 'Charlie'])
      expect(mockSetupPlayers).toHaveBeenCalledWith(
        ['Alice', 'Bob', 'Charlie'],
        undefined,
        undefined
      )
    })

    it('passes optional gameName and customLetter', async () => {
      const { setupMultiplayerGame } = useGameActions()
      await setupMultiplayerGame(['Alice'], 'Fun Game', 'k')
      expect(mockSetupPlayers).toHaveBeenCalledWith(['Alice'], 'Fun Game', 'k')
    })

    it('returns true on success', async () => {
      const { setupMultiplayerGame } = useGameActions()
      const result = await setupMultiplayerGame(['Alice'])
      expect(result).toBe(true)
    })

    it('shows success toast on success', async () => {
      const { setupMultiplayerGame } = useGameActions()
      await setupMultiplayerGame(['Alice', 'Bob'])
      expect(mockToastSuccess).toHaveBeenCalledOnce()
    })

    it('shows error toast and returns false when store throws', async () => {
      mockSetupPlayers.mockRejectedValueOnce(new Error('setup failed'))
      const { setupMultiplayerGame } = useGameActions()
      const result = await setupMultiplayerGame(['Alice'])
      expect(result).toBe(false)
      expect(mockToastError).toHaveBeenCalledOnce()
    })
  })

  describe('startNextRound', () => {
    it('calls gameStore.startNextRound', async () => {
      const { startNextRound } = useGameActions()
      await startNextRound()
      expect(mockStartNextRound).toHaveBeenCalledOnce()
    })

    it('plays new round sound on success', async () => {
      const { startNextRound } = useGameActions()
      await startNextRound()
      expect(mockPlayNewRound).toHaveBeenCalledOnce()
    })

    it('returns true on success', async () => {
      const { startNextRound } = useGameActions()
      const result = await startNextRound()
      expect(result).toBe(true)
    })

    it('shows error toast and returns false when store throws', async () => {
      mockStartNextRound.mockRejectedValueOnce(new Error('round error'))
      const { startNextRound } = useGameActions()
      const result = await startNextRound()
      expect(result).toBe(false)
      expect(mockToastError).toHaveBeenCalledOnce()
    })
  })
})
