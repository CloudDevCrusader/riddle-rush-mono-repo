import type { CategorySettings } from '~/types/game'

export function useAudio() {
  let audioContext: AudioContext | null = null

  const initAudioContext = () => {
    if (!audioContext && typeof window !== 'undefined') {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
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

    // Play a pleasant chord progression for success
    const _now = ctx.currentTime

    // Root note
    playTone(523.25, 0.15, 'sine', 0.2) // C5

    setTimeout(() => {
      playTone(659.25, 0.15, 'sine', 0.2) // E5
    }, 80)

    setTimeout(() => {
      playTone(783.99, 0.3, 'sine', 0.25) // G5
    }, 160)
  }

  const playError = () => {
    const ctx = initAudioContext()
    if (!ctx) return

    // Play a descending tone for error
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    const _now = ctx.currentTime

    oscillator.frequency.setValueAtTime(400, now)
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.2)
    oscillator.type = 'sawtooth'

    gainNode.gain.setValueAtTime(0.2, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)

    oscillator.start(now)
    oscillator.stop(now + 0.2)
  }

  const playClick = () => {
    playTone(800, 0.05, 'square', 0.1)
  }

  const playNewRound = () => {
    const ctx = initAudioContext()
    if (!ctx) return

    // Ascending scale for new round
    const notes = [261.63, 329.63, 392.00] // C4, E4, G4
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, 0.1, 'triangle', 0.15)
      }, index * 70)
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
  }
}
