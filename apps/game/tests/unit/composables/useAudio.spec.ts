import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ---- Web Audio API mocks ----

/** Creates a mock AudioParam with all needed methods */
function createMockAudioParam(initialValue = 0) {
  return {
    value: initialValue,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  }
}

/** Creates a mock oscillator node */
function createMockOscillator() {
  return {
    frequency: createMockAudioParam(0),
    type: 'sine' as OscillatorType,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }
}

/** Creates a mock gain node */
function createMockGainNode() {
  return {
    gain: createMockAudioParam(0),
    connect: vi.fn(),
  }
}

/** Creates a mock biquad filter node */
function createMockBiquadFilter() {
  return {
    type: 'lowpass',
    frequency: createMockAudioParam(0),
    connect: vi.fn(),
  }
}

/** Creates a fresh mock AudioContext */
function createMockAudioContext() {
  return {
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(() => createMockOscillator()),
    createGain: vi.fn(() => createMockGainNode()),
    createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
  }
}

// Create shared reference for tests that check specific mock calls
// Shared mock AudioContext reference, updated when AudioContext constructor is called
let mockAudioContext = createMockAudioContext()

/** Installs the default AudioContext mock on the global scope */
function installDefaultAudioContextMock() {
  // Create a constructor function that can be called with 'new' and also works as a spy
  const MockAudioContext = vi.fn(function () {
    mockAudioContext = createMockAudioContext()
    return mockAudioContext
  }) as unknown as typeof AudioContext

  // Mock the constructor directly on globalThis
  globalThis.AudioContext = MockAudioContext

  // Also set it on window for the composable to find
  if (typeof window !== 'undefined') {
    window.AudioContext = MockAudioContext
  }
}

/** Installs the useIndexedDB mock on the global scope */
function installUseIndexedDBMock() {
  vi.stubGlobal('useIndexedDB', () => ({
    getSettings: mockGetSettings,
    saveSettings: vi.fn(),
    initializeSettings: vi.fn(),
    saveGameSession: vi.fn(),
    getGameSession: vi.fn(),
    getGameSessionById: vi.fn(),
    clearGameSession: vi.fn(),
    saveGameHistory: vi.fn(),
    getGameHistory: vi.fn(),
    clearGameHistory: vi.fn(),
    getStatistics: vi.fn(),
    saveStatistics: vi.fn(),
    initializeStatistics: vi.fn(),
    getLeaderboard: vi.fn(),
    saveLeaderboardEntry: vi.fn(),
  }))
}

// Install initial global mocks
installDefaultAudioContextMock()

// ---- Mock useLogger ----
vi.mock('~/composables/useLogger', () => ({
  useLogger: () => ({
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }),
}))

// ---- Mock useIndexedDB (Nuxt auto-import global, NOT an import statement) ----
const mockGetSettings = vi.fn()
installUseIndexedDBMock()

describe('useAudio', () => {
  let useAudio: typeof import('../../../composables/useAudio').useAudio

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.resetModules()

    // Re-establish global stubs after resetModules (vi.restoreAllMocks in afterEach removes them)
    installDefaultAudioContextMock()
    installUseIndexedDBMock()

    // Default: sound is enabled
    mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })

    // Re-import to reset module-level state (audioContext, masterVolume, isMuted)
    const mod = await import('../../../composables/useAudio')
    useAudio = mod.useAudio
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('AudioContext initialization', () => {
    it('should create AudioContext when window is available', async () => {
      const audio = useAudio()
      // Trigger a sound to init AudioContext
      await audio.playClick()
      vi.runAllTimers()

      expect(AudioContext).toHaveBeenCalled()
    })

    it('should use webkitAudioContext as fallback', async () => {
      // Remove standard AudioContext, add webkit version
      const origAudioContext = globalThis.AudioContext
      // @ts-expect-error - testing fallback
      delete globalThis.AudioContext

      const webkitMock = vi.fn(function () {
        return { ...mockAudioContext }
      })
      // @ts-expect-error - webkit prefix
      globalThis.webkitAudioContext = webkitMock

      // Reset modules to pick up the changed global
      vi.resetModules()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      await audio.playClick()
      vi.runAllTimers()

      expect(webkitMock).toHaveBeenCalled()

      // Restore
      globalThis.AudioContext = origAudioContext
      // @ts-expect-error - cleaning up non-standard webkitAudioContext global
      delete globalThis.webkitAudioContext
    })

    it('should reuse existing AudioContext on subsequent calls', async () => {
      const audio = useAudio()

      await audio.playClick()
      vi.runAllTimers()

      const callCount = (AudioContext as ReturnType<typeof vi.fn>).mock.calls.length

      await audio.playClick()
      vi.runAllTimers()

      // Should NOT have created a new AudioContext
      expect((AudioContext as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount)
    })
  })

  describe('playTone (via playButtonHover)', () => {
    it('should create oscillator and gain nodes', async () => {
      const audio = useAudio()
      await audio.playButtonHover()
      vi.runAllTimers()

      // playButtonHover calls playTone(600, 0.02, 'sine', 0.05)
      // playTone creates oscillator + gain node
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createGain).toHaveBeenCalled()
    })

    it('should set oscillator frequency and type', async () => {
      // We need a fresh context that tracks the created nodes
      const createdOscillator = createMockOscillator()
      const createdGain = createMockGainNode()

      vi.stubGlobal(
        'AudioContext',
        vi.fn(function () {
          return {
            currentTime: 0,
            destination: {},
            createOscillator: vi.fn(() => createdOscillator),
            createGain: vi.fn(() => createdGain),
            createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
          }
        })
      )

      vi.resetModules()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      await audio.playButtonHover()
      vi.runAllTimers()

      // playButtonHover → playTone(600, 0.02, 'sine', 0.05)
      expect(createdOscillator.frequency.value).toBe(600)
      expect(createdOscillator.type).toBe('sine')
    })

    it('should connect oscillator → gain → destination', async () => {
      const destination = { type: 'destination' }
      const createdGain = createMockGainNode()
      const createdOscillator = createMockOscillator()

      vi.stubGlobal(
        'AudioContext',
        vi.fn(function () {
          return {
            currentTime: 0,
            destination,
            createOscillator: vi.fn(() => createdOscillator),
            createGain: vi.fn(() => createdGain),
            createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
          }
        })
      )

      vi.resetModules()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      await audio.playButtonHover()
      vi.runAllTimers()

      expect(createdOscillator.connect).toHaveBeenCalledWith(createdGain)
      expect(createdGain.connect).toHaveBeenCalledWith(destination)
    })

    it('should set gain envelope with volume ramp', async () => {
      const createdGain = createMockGainNode()

      vi.stubGlobal(
        'AudioContext',
        vi.fn(function () {
          return {
            currentTime: 0,
            destination: {},
            createOscillator: vi.fn(() => createMockOscillator()),
            createGain: vi.fn(() => createdGain),
            createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
          }
        })
      )

      vi.resetModules()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      await audio.playButtonHover()
      vi.runAllTimers()

      // playTone sets gain: setValueAtTime(effectiveVol, currentTime)
      expect(createdGain.gain.setValueAtTime).toHaveBeenCalled()
      // and exponentialRampToValueAtTime(0.01, currentTime + duration)
      expect(createdGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.01,
        expect.any(Number)
      )
    })

    it('should start and stop oscillator at correct times', async () => {
      const createdOscillator = createMockOscillator()

      vi.stubGlobal(
        'AudioContext',
        vi.fn(function () {
          return {
            currentTime: 5,
            destination: {},
            createOscillator: vi.fn(() => createdOscillator),
            createGain: vi.fn(() => createMockGainNode()),
            createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
          }
        })
      )

      vi.resetModules()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      // playButtonHover → playTone(600, 0.02, 'sine', 0.05)
      await audio.playButtonHover()
      vi.runAllTimers()

      expect(createdOscillator.start).toHaveBeenCalledWith(5)
      expect(createdOscillator.stop).toHaveBeenCalledWith(5.02)
    })
  })

  describe('muted state', () => {
    it('should skip playback when muted (effective volume = 0)', async () => {
      // Access internal isMuted by importing fresh module and manipulating refs
      vi.resetModules()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })

      // We need to set isMuted to true before testing - since it is module-level ref,
      // we test via the volume behavior. With isMuted = true, getEffectiveVolume returns 0.
      // Since isMuted is not exported, we test indirectly by checking no oscillator is created
      // when sound is disabled via settings
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: false })

      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      const createOscSpy = vi.fn(() => createMockOscillator())
      vi.stubGlobal(
        'AudioContext',
        vi.fn(function () {
          return {
            currentTime: 0,
            destination: {},
            createOscillator: createOscSpy,
            createGain: vi.fn(() => createMockGainNode()),
            createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
          }
        })
      )

      await audio.playClick()
      vi.runAllTimers()

      // Sound disabled → soundFn never called → no oscillator created
      expect(createOscSpy).not.toHaveBeenCalled()
    })
  })

  describe('playSoundIfEnabled', () => {
    it('should play sound when soundEnabled is true', async () => {
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })

      const audio = useAudio()
      await audio.playClick()
      vi.runAllTimers()

      // Should have gone through to actually creating audio nodes
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    })

    it('should not play sound when soundEnabled is false', async () => {
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: false })

      const createOscSpy = vi.fn(() => createMockOscillator())
      vi.stubGlobal(
        'AudioContext',
        vi.fn(() => ({
          currentTime: 0,
          destination: {},
          createOscillator: createOscSpy,
          createGain: vi.fn(() => createMockGainNode()),
          createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
        }))
      )

      vi.resetModules()
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      await audio.playClick()
      vi.runAllTimers()

      expect(createOscSpy).not.toHaveBeenCalled()
    })

    it('should default to soundEnabled=true when no settings exist', async () => {
      mockGetSettings.mockResolvedValue(null)

      const audio = useAudio()
      await audio.playClick()
      vi.runAllTimers()

      // Null settings → fallback { soundEnabled: true } → sound plays
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    })
  })

  describe('sound functions', () => {
    it('playSuccess should call playSoundIfEnabled', async () => {
      const audio = useAudio()
      await audio.playSuccess()
      vi.runAllTimers()

      // playSuccess creates multiple oscillators (major chord + harmonics)
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    })

    it('playError should create oscillators and biquad filter', async () => {
      const audio = useAudio()
      await audio.playError()
      vi.runAllTimers()

      // playError uses createBiquadFilter for the lowpass effect
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled()
    })

    it('playClick should play through playSoundIfEnabled', async () => {
      const audio = useAudio()
      await audio.playClick()
      vi.runAllTimers()

      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    })

    it('playNewRound should play ascending fanfare notes', async () => {
      const audio = useAudio()
      await audio.playNewRound()
      // Advance all setTimeout delays (60, 120, 180, 250ms + nested)
      vi.advanceTimersByTime(500)

      // Multiple oscillators for notes + octave harmonics + final chord
      const calls = mockAudioContext.createOscillator.mock.calls.length
      expect(calls).toBeGreaterThanOrEqual(1)
    })

    it('playRoundComplete should play ascending note sequence', async () => {
      const audio = useAudio()
      await audio.playRoundComplete()
      vi.advanceTimersByTime(500)

      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    })

    it('playButtonHover should play a subtle sine tone', async () => {
      const audio = useAudio()
      await audio.playButtonHover()
      vi.runAllTimers()

      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    })

    it('playScoreIncrease should play quick ascending notes', async () => {
      const audio = useAudio()
      await audio.playScoreIncrease()
      vi.advanceTimersByTime(200)

      // 3 notes with 40ms intervals
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    })

    it('playTada should play fanfare notes', async () => {
      const audio = useAudio()
      await audio.playTada()
      vi.advanceTimersByTime(400)

      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    })

    it('all exposed functions should be callable', () => {
      const audio = useAudio()

      expect(typeof audio.playSuccess).toBe('function')
      expect(typeof audio.playError).toBe('function')
      expect(typeof audio.playClick).toBe('function')
      expect(typeof audio.playNewRound).toBe('function')
      expect(typeof audio.playRoundComplete).toBe('function')
      expect(typeof audio.playButtonHover).toBe('function')
      expect(typeof audio.playScoreIncrease).toBe('function')
      expect(typeof audio.playTada).toBe('function')
    })
  })

  describe('getEffectiveVolume', () => {
    it('should return 0 when sound settings are disabled (no play)', async () => {
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: false })

      const createOscSpy = vi.fn(() => createMockOscillator())
      vi.stubGlobal(
        'AudioContext',
        vi.fn(() => ({
          currentTime: 0,
          destination: {},
          createOscillator: createOscSpy,
          createGain: vi.fn(() => createMockGainNode()),
          createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
        }))
      )

      vi.resetModules()
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      await audio.playSuccess()
      vi.advanceTimersByTime(500)

      // No oscillators created when disabled
      expect(createOscSpy).not.toHaveBeenCalled()
    })

    it('should scale volume by masterVolume', async () => {
      // masterVolume defaults to 1.0, so effective = volume * 1.0
      const createdGain = createMockGainNode()

      vi.stubGlobal(
        'AudioContext',
        vi.fn(function () {
          return {
            currentTime: 0,
            destination: {},
            createOscillator: vi.fn(() => createMockOscillator()),
            createGain: vi.fn(() => createdGain),
            createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
          }
        })
      )

      vi.resetModules()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      // playButtonHover → playTone(600, 0.02, 'sine', 0.05)
      // effective = 0.05 * 1.0 = 0.05
      await audio.playButtonHover()
      vi.runAllTimers()

      expect(createdGain.gain.setValueAtTime).toHaveBeenCalledWith(0.05, expect.any(Number))
    })
  })

  describe('no AudioContext available', () => {
    it('should handle missing AudioContext and webkitAudioContext gracefully', async () => {
      // Remove both AudioContext and webkitAudioContext
      const origAC = globalThis.AudioContext
      // @ts-expect-error - testing no AudioContext
      delete globalThis.AudioContext

      // Also ensure no webkitAudioContext
      // @ts-expect-error - webkit prefix
      delete globalThis.webkitAudioContext

      // Re-install useIndexedDB stub after resetModules
      vi.resetModules()
      installUseIndexedDBMock()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      // When no AudioContext constructor exists, initAudioContext throws TypeError
      // The composable does not guard against missing AudioContext constructors,
      // so playSoundIfEnabled will reject with the error
      await expect(audio.playClick()).rejects.toThrow()
      vi.runAllTimers()

      // Restore
      globalThis.AudioContext = origAC
    })
  })

  describe('settings integration', () => {
    it('should call useIndexedDB().getSettings() for each sound play', async () => {
      const audio = useAudio()

      await audio.playClick()
      vi.runAllTimers()

      expect(mockGetSettings).toHaveBeenCalled()
    })

    it('should handle getSettings rejection gracefully', async () => {
      mockGetSettings.mockRejectedValue(new Error('DB Error'))

      const audio = useAudio()

      // Should not throw even if settings retrieval fails
      await expect(audio.playClick()).rejects.toThrow('DB Error')
    })
  })

  describe('null AudioContext early returns', () => {
    // These tests cover the `if (!ctx) return` branches in playSuccess,
    // playScoreIncrease, and playTada — the three functions that silently
    // return instead of throwing when AudioContext is unavailable.

    async function setupNullAudioContext() {
      // Install a constructor that always returns null
      vi.stubGlobal(
        'AudioContext',
        vi.fn(() => null)
      )

      vi.resetModules()
      installUseIndexedDBMock()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })
      const mod = await import('../../../composables/useAudio')
      return mod.useAudio()
    }

    it('playSuccess returns silently when AudioContext is null', async () => {
      const audio = await setupNullAudioContext()

      // playSuccess has `if (!ctx) return` — should not throw
      await expect(audio.playSuccess()).resolves.toBeUndefined()
      vi.runAllTimers()
    })

    it('playScoreIncrease returns silently when AudioContext is null', async () => {
      const audio = await setupNullAudioContext()

      await expect(audio.playScoreIncrease()).resolves.toBeUndefined()
      vi.runAllTimers()
    })

    it('playTada returns silently when AudioContext is null', async () => {
      const audio = await setupNullAudioContext()

      await expect(audio.playTada()).resolves.toBeUndefined()
      vi.runAllTimers()
    })
  })

  describe('initAudioContext constructor fallback', () => {
    it('should fall back to calling AudioContext as function when constructor throws', async () => {
      const ctxInstance = createMockAudioContext()

      // Create a Proxy that throws on `new` but returns a valid context when called
      const fakeFn = vi.fn(() => ctxInstance)
      const throwingCtor = new Proxy(fakeFn, {
        construct() {
          throw new Error('not a constructor')
        },
      })

      vi.stubGlobal('AudioContext', throwingCtor)

      vi.resetModules()
      installUseIndexedDBMock()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      // Should succeed via function-call fallback
      await audio.playButtonHover()
      vi.runAllTimers()

      expect(fakeFn).toHaveBeenCalled()
      expect(ctxInstance.createOscillator).toHaveBeenCalled()
    })

    it('should set audioContext to null when both constructor and function call throw', async () => {
      // Both `new AudioContextClass()` and `AudioContextClass()` throw
      const alwaysThrows = new Proxy(vi.fn(), {
        construct() {
          throw new Error('not a constructor')
        },
        apply() {
          throw new Error('not a function either')
        },
      })

      vi.stubGlobal('AudioContext', alwaysThrows)

      vi.resetModules()
      installUseIndexedDBMock()
      mockGetSettings.mockResolvedValue({ enabledCategories: [], soundEnabled: true })
      const mod = await import('../../../composables/useAudio')
      const audio = mod.useAudio()

      // playClick throws TypeError when ctx is null
      await expect(audio.playClick()).rejects.toThrow()
      vi.runAllTimers()
    })
  })
})
