import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Import after mocks are set up
import { useGameActions } from '../../../composables/useGameActions'

// Hoist mockRouterPush so it can be referenced inside the vi.mock factory below.
// vi.mock is hoisted before imports, so variables used in its factory must also
// be hoisted via vi.hoisted().
const { mockRouterPush } = vi.hoisted(() => ({ mockRouterPush: vi.fn() }))

// Mock vue-router at module level to intercept the auto-imported useRouter.
// unplugin-auto-import transforms composables to use direct ES module imports,
// so vi.stubGlobal alone is not sufficient — the module mock takes precedence.
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: mockRouterPush, replace: vi.fn(), back: vi.fn() })),
  useRoute: vi.fn(() => ({ path: '/', params: {}, query: {} })),
}))

// --- Mock dependencies as globals (Nuxt auto-imports) ---

const mockStartNewGame = vi.fn()
const mockResumeOrStartNewGame = vi.fn()
const mockEndGame = vi.fn()
const mockSetupPlayers = vi.fn()
const mockStartNextRound = vi.fn()

let mockHasActiveSession = false
let mockCurrentScore = 42

const mockGameStore = {
  startNewGame: mockStartNewGame,
  resumeOrStartNewGame: mockResumeOrStartNewGame,
  endGame: mockEndGame,
  setupPlayers: mockSetupPlayers,
  startNextRound: mockStartNextRound,
  get hasActiveSession() {
    return mockHasActiveSession
  },
  get currentSession() {
    return {
      score: mockCurrentScore,
      attempts: [],
      id: '1',
      status: 'active',
      category: null,
      letter: '',
      players: [],
      currentRound: 0,
      roundHistory: [],
    }
  },
}

// Stub Nuxt auto-imported globals (belt-and-suspenders alongside the module mock)
vi.stubGlobal('useGameStore', () => mockGameStore)
vi.stubGlobal('useRouter', () => ({ push: mockRouterPush, replace: vi.fn(), back: vi.fn() }))

// Mock vue-router explicitly in case it's auto-imported
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useRoute: vi.fn(),
}))

const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockToastInfo = vi.fn()

vi.stubGlobal('useToast', () => ({
  success: mockToastSuccess,
  error: mockToastError,
  info: mockToastInfo,
  warning: vi.fn(),
  show: vi.fn(),
}))

const mockPlayNewRound = vi.fn()

vi.stubGlobal('useAudio', () => ({
  playNewRound: mockPlayNewRound,
  playCorrect: vi.fn(),
  playWrong: vi.fn(),
}))

const mockT = vi.fn((key: string, fallback?: string | Record<string, unknown>) =>
  typeof fallback === 'string' ? fallback : key
)

vi.stubGlobal('useI18n', () => ({ t: mockT }))

const mockLoggerError = vi.fn()

vi.mock('~/composables/useLogger', () => ({
  useLogger: () => ({
    log: vi.fn(),
    warn: vi.fn(),
    error: mockLoggerError,
    debug: vi.fn(),
    info: vi.fn(),
  }),
}))

describe('useGameActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHasActiveSession = false
    mockCurrentScore = 42
  })

  // ──────────────────────────────────────────
  // startNewGame
  // ──────────────────────────────────────────
  describe('startNewGame', () => {
    it('should call gameStore.startNewGame, play audio, show toast, and return true', async () => {
      mockStartNewGame.mockResolvedValue(undefined)
      const { startNewGame } = useGameActions()

      const result = await startNewGame()

      expect(result).toBe(true)
      expect(mockStartNewGame).toHaveBeenCalledOnce()
      expect(mockPlayNewRound).toHaveBeenCalledOnce()
      expect(mockToastSuccess).toHaveBeenCalledOnce()
    })

    it('should return false and show error toast on failure', async () => {
      mockStartNewGame.mockRejectedValue(new Error('network error'))
      const { startNewGame } = useGameActions()

      const result = await startNewGame()

      expect(result).toBe(false)
      expect(mockLoggerError).toHaveBeenCalledWith('Error starting new game:', expect.any(Error))
      expect(mockToastError).toHaveBeenCalledOnce()
      expect(mockPlayNewRound).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────
  // resumeOrStartGame
  // ──────────────────────────────────────────
  describe('resumeOrStartGame', () => {
    it('should play audio and show welcome toast when no prior session exists', async () => {
      mockHasActiveSession = false
      mockResumeOrStartNewGame.mockResolvedValue(undefined)
      const { resumeOrStartGame } = useGameActions()

      const result = await resumeOrStartGame()

      expect(result).toBe(true)
      expect(mockResumeOrStartNewGame).toHaveBeenCalledOnce()
      expect(mockPlayNewRound).toHaveBeenCalledOnce()
      expect(mockToastInfo).toHaveBeenCalledOnce()
      // welcome toast, not resumed
      expect(mockT).toHaveBeenCalledWith('game.welcome', expect.any(String))
    })

    it('should show resumed toast and skip audio when session exists', async () => {
      mockHasActiveSession = true
      mockResumeOrStartNewGame.mockResolvedValue(undefined)
      const { resumeOrStartGame } = useGameActions()

      const result = await resumeOrStartGame()

      expect(result).toBe(true)
      expect(mockPlayNewRound).not.toHaveBeenCalled()
      expect(mockToastInfo).toHaveBeenCalledOnce()
      expect(mockT).toHaveBeenCalledWith('game.resumed', expect.any(String))
    })

    it('should return false and show error toast on failure', async () => {
      mockResumeOrStartNewGame.mockRejectedValue(new Error('DB error'))
      const { resumeOrStartGame } = useGameActions()

      const result = await resumeOrStartGame()

      expect(result).toBe(false)
      expect(mockLoggerError).toHaveBeenCalledWith('Error resuming game:', expect.any(Error))
      expect(mockToastError).toHaveBeenCalledOnce()
    })
  })

  // ──────────────────────────────────────────
  // endGame
  // ──────────────────────────────────────────
  describe('endGame', () => {
    it('should call store, show success toast, navigate to home, and return true', async () => {
      mockEndGame.mockResolvedValue(undefined)
      const { endGame } = useGameActions()

      const result = await endGame()

      expect(result).toBe(true)
      expect(mockEndGame).toHaveBeenCalledOnce()
      expect(mockToastSuccess).toHaveBeenCalledOnce()
      expect(mockRouterPush).toHaveBeenCalledWith('/')
    })

    it('should return false and show error toast on failure', async () => {
      mockEndGame.mockRejectedValue(new Error('save failed'))
      const { endGame } = useGameActions()

      const result = await endGame()

      expect(result).toBe(false)
      expect(mockLoggerError).toHaveBeenCalledWith('Error ending game:', expect.any(Error))
      expect(mockToastError).toHaveBeenCalledOnce()
      expect(mockRouterPush).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────
  // shareScore
  // ──────────────────────────────────────────
  describe('shareScore', () => {
    const originalNavigator = globalThis.navigator

    beforeEach(() => {
      // Default: navigator.share is available
      Object.defineProperty(globalThis, 'navigator', {
        value: { ...originalNavigator, share: vi.fn().mockResolvedValue(undefined) },
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      })
    })

    it('should return false when navigator.share is not available', async () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { ...originalNavigator, share: undefined },
        writable: true,
        configurable: true,
      })
      const { shareScore } = useGameActions()

      const result = await shareScore()

      expect(result).toBe(false)
      expect(mockToastInfo).toHaveBeenCalledOnce()
    })

    it('should share with store score when no score argument provided', async () => {
      mockCurrentScore = 99
      const shareFn = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(globalThis, 'navigator', {
        value: { ...originalNavigator, share: shareFn },
        writable: true,
        configurable: true,
      })
      const { shareScore } = useGameActions()

      const result = await shareScore()

      expect(result).toBe(true)
      expect(shareFn).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.any(String),
        })
      )
      expect(mockToastSuccess).toHaveBeenCalledOnce()
    })

    it('should share with provided score when argument given', async () => {
      const shareFn = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(globalThis, 'navigator', {
        value: { ...originalNavigator, share: shareFn },
        writable: true,
        configurable: true,
      })
      const { shareScore } = useGameActions()

      const result = await shareScore(200)

      expect(result).toBe(true)
      expect(mockT).toHaveBeenCalledWith('share.score_text', { score: 200 })
    })

    it('should suppress AbortError (user cancelled share)', async () => {
      const abortError = new Error('Share cancelled')
      abortError.name = 'AbortError'
      const shareFn = vi.fn().mockRejectedValue(abortError)
      Object.defineProperty(globalThis, 'navigator', {
        value: { ...originalNavigator, share: shareFn },
        writable: true,
        configurable: true,
      })
      const { shareScore } = useGameActions()

      const result = await shareScore()

      expect(result).toBe(false)
      // Should NOT show error toast or log for AbortError
      expect(mockLoggerError).not.toHaveBeenCalled()
      expect(mockToastError).not.toHaveBeenCalled()
    })

    it('should show error toast for non-AbortError share failures', async () => {
      const shareFn = vi.fn().mockRejectedValue(new Error('Share failed'))
      Object.defineProperty(globalThis, 'navigator', {
        value: { ...originalNavigator, share: shareFn },
        writable: true,
        configurable: true,
      })
      const { shareScore } = useGameActions()

      const result = await shareScore()

      expect(result).toBe(false)
      expect(mockLoggerError).toHaveBeenCalledWith('Error sharing:', expect.any(Error))
      expect(mockToastError).toHaveBeenCalledOnce()
    })
  })

  // ──────────────────────────────────────────
  // setupMultiplayerGame
  // ──────────────────────────────────────────
  describe('setupMultiplayerGame', () => {
    it('should call store.setupPlayers, show success toast, and return true', async () => {
      mockSetupPlayers.mockResolvedValue(undefined)
      const { setupMultiplayerGame } = useGameActions()

      const result = await setupMultiplayerGame(['Alice', 'Bob'])

      expect(result).toBe(true)
      expect(mockSetupPlayers).toHaveBeenCalledWith(['Alice', 'Bob'], undefined, undefined)
      expect(mockToastSuccess).toHaveBeenCalledOnce()
    })

    it('should pass gameName and customLetter to store', async () => {
      mockSetupPlayers.mockResolvedValue(undefined)
      const { setupMultiplayerGame } = useGameActions()

      await setupMultiplayerGame(['Alice', 'Bob'], 'MyGame', 'Z')

      expect(mockSetupPlayers).toHaveBeenCalledWith(['Alice', 'Bob'], 'MyGame', 'Z')
    })

    it('should return false and show error toast on failure', async () => {
      mockSetupPlayers.mockRejectedValue(new Error('setup failed'))
      const { setupMultiplayerGame } = useGameActions()

      const result = await setupMultiplayerGame(['Alice'])

      expect(result).toBe(false)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error setting up multiplayer game:',
        expect.any(Error)
      )
      expect(mockToastError).toHaveBeenCalledOnce()
    })
  })

  // ──────────────────────────────────────────
  // startNextRound
  // ──────────────────────────────────────────
  describe('startNextRound', () => {
    it('should call store, play audio, show success toast, and return true', async () => {
      mockStartNextRound.mockResolvedValue(undefined)
      const { startNextRound } = useGameActions()

      const result = await startNextRound()

      expect(result).toBe(true)
      expect(mockStartNextRound).toHaveBeenCalledOnce()
      expect(mockPlayNewRound).toHaveBeenCalledOnce()
      expect(mockToastSuccess).toHaveBeenCalledOnce()
    })

    it('should return false and show error toast on failure', async () => {
      mockStartNextRound.mockRejectedValue(new Error('round failed'))
      const { startNextRound } = useGameActions()

      const result = await startNextRound()

      expect(result).toBe(false)
      expect(mockLoggerError).toHaveBeenCalledWith('Error starting next round:', expect.any(Error))
      expect(mockToastError).toHaveBeenCalledOnce()
      expect(mockPlayNewRound).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────
  // Return shape
  // ──────────────────────────────────────────
  describe('return value', () => {
    it('should return all six action functions', () => {
      const actions = useGameActions()

      expect(actions).toHaveProperty('startNewGame')
      expect(actions).toHaveProperty('resumeOrStartGame')
      expect(actions).toHaveProperty('endGame')
      expect(actions).toHaveProperty('shareScore')
      expect(actions).toHaveProperty('setupMultiplayerGame')
      expect(actions).toHaveProperty('startNextRound')
      expect(typeof actions.startNewGame).toBe('function')
      expect(typeof actions.resumeOrStartGame).toBe('function')
      expect(typeof actions.endGame).toBe('function')
      expect(typeof actions.shareScore).toBe('function')
      expect(typeof actions.setupMultiplayerGame).toBe('function')
      expect(typeof actions.startNextRound).toBe('function')
    })
  })
})
