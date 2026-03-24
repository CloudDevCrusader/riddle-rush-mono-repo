/**
 * Mobile app utility functions for Riddle Rush NativeScript app.
 */

// ---------------------------------------------------------------------------
// UUID generation (safe for environments without crypto.randomUUID)
// ---------------------------------------------------------------------------

/**
 * Generates a UUID v4 string using Math.random as a fallback.
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

/** Capitalises the first letter of a string. */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/** Truncates a string to `maxLength` characters, appending `…` if needed. */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}

// ---------------------------------------------------------------------------
// Number helpers
// ---------------------------------------------------------------------------

/** Pads a number to at least `width` digits with leading zeros. */
export function padNumber(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

/** Clamps a value between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ---------------------------------------------------------------------------
// Simple in-memory storage (replaces NativeScript ApplicationSettings in tests)
// ---------------------------------------------------------------------------

export type StorageValue = string | number | boolean

const _store = new Map<string, StorageValue>()

export const storage = {
  setItem(key: string, value: StorageValue): void {
    _store.set(key, value)
  },
  getItem(key: string): StorageValue | undefined {
    return _store.get(key)
  },
  removeItem(key: string): void {
    _store.delete(key)
  },
  clear(): void {
    _store.clear()
  },
  has(key: string): boolean {
    return _store.has(key)
  },
}

// ---------------------------------------------------------------------------
// Game-specific helpers
// ---------------------------------------------------------------------------

export interface Player {
  id: string
  name: string
  score: number
}

export interface Category {
  id: number
  name: string
}

/**
 * Creates a new player with a generated ID and zero score.
 */
export function createPlayer(name: string): Player {
  return { id: generateUUID(), name: name.trim(), score: 0 }
}

/**
 * Adds `points` to a player's score, returning a new player object.
 * Score is clamped to a minimum of 0.
 */
export function addScore(player: Player, points: number): Player {
  return { ...player, score: Math.max(0, player.score + points) }
}

/**
 * Sorts players by score descending (highest first).
 */
export function rankPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score)
}

/**
 * Picks a random letter from A-Z.
 */
export function randomLetter(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return letters[Math.floor(Math.random() * letters.length)]
}

/**
 * Validates that a player name is non-empty and within the allowed length.
 */
export function validatePlayerName(name: string, maxLength = 20): boolean {
  const trimmed = name.trim()
  return trimmed.length > 0 && trimmed.length <= maxLength
}
