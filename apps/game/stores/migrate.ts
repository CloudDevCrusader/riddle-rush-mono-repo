/**
 * One-time localStorage migration from Pinia format to Zustand persist envelope.
 *
 * Pinia stored settings as flat JSON: { "maxPlayersPerGame": 4, ... }
 * Zustand persist expects: { "state": { "maxPlayersPerGame": 4, ... }, "version": 0 }
 *
 * Call migrateFromPinia() once before any store access (e.g., in a Nuxt plugin).
 * On failure the key is removed so Zustand persist falls back to defaults.
 */

const SETTINGS_KEY = 'game-settings'

function isZustandEnvelope(data: unknown): boolean {
  return typeof data === 'object' && data !== null && 'state' in data && 'version' in data
}

function isPiniaFormat(data: unknown): boolean {
  // Pinia stored flat settings object -- has at least one known settings key
  // and does NOT have the Zustand envelope structure
  if (typeof data !== 'object' || data === null) return false
  if (isZustandEnvelope(data)) return false

  const knownKeys = ['maxPlayersPerGame', 'soundEnabled', 'language', 'debugMode']
  return knownKeys.some((key) => key in (data as Record<string, unknown>))
}

export function migrateFromPinia(): void {
  if (typeof window === 'undefined') return

  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw)

    // Already in Zustand format -- nothing to do
    if (isZustandEnvelope(parsed)) return

    // Pinia flat format detected -- wrap in Zustand persist envelope
    if (isPiniaFormat(parsed)) {
      const envelope = { state: parsed, version: 0 }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(envelope))
      return
    }

    // Unknown format -- remove so Zustand persist uses defaults
    localStorage.removeItem(SETTINGS_KEY)
  } catch {
    // Parse error or storage error -- remove corrupt data
    try {
      localStorage.removeItem(SETTINGS_KEY)
    } catch {
      // Storage completely unavailable -- nothing we can do
    }
  }
}
