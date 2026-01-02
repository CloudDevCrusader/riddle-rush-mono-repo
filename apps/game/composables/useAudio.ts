import type { CategorySettings } from '@riddle-rush/types/game'

export function useAudio() {
  let audioContext: AudioContext | null = null

  const initAudioContext = () => {
    if (!audioContext && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContext = new AudioContextClass()
    }
    return audioContext
  }

  const playTone = (
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3,
  ) => {
    const ctx = initAudioContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }

  const playSuccess = () => {
    const ctx = initAudioContext()
    if (!ctx) return

    // Play a triumphant major chord with harmonics for a richer sound
    const frequencies = [
      { freq: 523.25, delay: 0, duration: 0.25, vol: 0.25 }, // C5
      { freq: 659.25, delay: 50, duration: 0.25, vol: 0.25 }, // E5
      { freq: 783.99, delay: 100, duration: 0.35, vol: 0.3 }, // G5
      { freq: 1046.50, delay: 150, duration: 0.2, vol: 0.2 }, // C6 (octave)
    ]

    frequencies.forEach(({ freq, delay, duration, vol }) => {
      setTimeout(() => {
        // Add harmonics for richer sound
        playTone(freq, duration, 'sine', vol)
        playTone(freq * 2, duration * 0.5, 'sine', vol * 0.3) // Harmonic
      }, delay)
    })

    // Add a sparkle effect at the end
    setTimeout(() => {
      playTone(1046.50, 0.1, 'triangle', 0.15) // High sparkle
      setTimeout(() => {
        playTone(1318.51, 0.1, 'triangle', 0.1) // Even higher sparkle
      }, 50)
    }, 200)
  }

  const playError = () => {
    const ctx = initAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Create a more dramatic "buzz" with multiple oscillators
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Two oscillators slightly detuned for a "buzzing" effect
    osc1.frequency.setValueAtTime(300, now)
    osc1.frequency.exponentialRampToValueAtTime(150, now + 0.25)
    osc1.type = 'sawtooth'

    osc2.frequency.setValueAtTime(310, now) // Slightly detuned
    osc2.frequency.exponentialRampToValueAtTime(155, now + 0.25)
    osc2.type = 'sawtooth'

    // Low-pass filter for a muffled, "wrong" sound
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(500, now)
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.25)

    gainNode.gain.setValueAtTime(0.25, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.25)
    osc2.stop(now + 0.25)
  }

  const playClick = () => {
    const ctx = initAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Create a crisp, satisfying click with a quick frequency sweep
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(1200, now)
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.03)
    oscillator.type = 'square'

    gainNode.gain.setValueAtTime(0.15, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03)

    oscillator.start(now)
    oscillator.stop(now + 0.03)
  }

  const playNewRound = () => {
    const ctx = initAudioContext()
    if (!ctx) return

    // Play an exciting fanfare for new round - ascending major scale with flourish
    const notes = [
      { freq: 261.63, delay: 0, duration: 0.12, vol: 0.2 }, // C4
      { freq: 329.63, delay: 60, duration: 0.12, vol: 0.2 }, // E4
      { freq: 392.00, delay: 120, duration: 0.12, vol: 0.2 }, // G4
      { freq: 523.25, delay: 180, duration: 0.2, vol: 0.25 }, // C5
    ]

    notes.forEach(({ freq, delay, duration, vol }) => {
      setTimeout(() => {
        playTone(freq, duration, 'triangle', vol)
        // Add octave for richness
        playTone(freq * 2, duration * 0.6, 'sine', vol * 0.4)
      }, delay)
    })

    // Add a final celebratory chord
    setTimeout(() => {
      playTone(523.25, 0.15, 'sine', 0.2) // C5
      setTimeout(() => {
        playTone(659.25, 0.15, 'sine', 0.2) // E5
        setTimeout(() => {
          playTone(783.99, 0.2, 'sine', 0.25) // G5
        }, 50)
      }, 50)
    }, 250)
  }

  const playRoundComplete = () => {
    const ctx = initAudioContext()
    if (!ctx) return

    const notes = [
      { freq: 392.00, delay: 0, duration: 0.15, vol: 0.2 }, // G4
      { freq: 493.88, delay: 80, duration: 0.15, vol: 0.2 }, // B4
      { freq: 523.25, delay: 160, duration: 0.15, vol: 0.2 }, // C5
      { freq: 659.25, delay: 240, duration: 0.2, vol: 0.25 }, // E5
      { freq: 783.99, delay: 320, duration: 0.3, vol: 0.3 }, // G5
    ]

    notes.forEach(({ freq, delay, duration, vol }) => {
      setTimeout(() => {
        playTone(freq, duration, 'sine', vol)
      }, delay)
    })
  }

  const playButtonHover = () => {
    // Subtle sound for button hover (optional, can be disabled)
    playTone(600, 0.02, 'sine', 0.05)
  }

  const playScoreIncrease = () => {
    const ctx = initAudioContext()
    if (!ctx) return

    // Quick ascending notes for score increase
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, 0.08, 'triangle', 0.15)
      }, index * 40)
    })
  }

  const getSettings = async (): Promise<CategorySettings> => {
    const { getSettings } = useIndexedDB()
    const settings = await getSettings()
    return settings || { enabledCategories: [], soundEnabled: true }
  }

  const playSoundIfEnabled = async (soundFn: () => void) => {
    const settings = await getSettings()
    if (settings.soundEnabled) {
      soundFn()
    }
  }

  return {
    playSuccess: () => playSoundIfEnabled(playSuccess),
    playError: () => playSoundIfEnabled(playError),
    playClick: () => playSoundIfEnabled(playClick),
    playNewRound: () => playSoundIfEnabled(playNewRound),
    playRoundComplete: () => playSoundIfEnabled(playRoundComplete),
    playButtonHover: () => playSoundIfEnabled(playButtonHover),
    playScoreIncrease: () => playSoundIfEnabled(playScoreIncrease),
  }
}
