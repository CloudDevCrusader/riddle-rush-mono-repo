import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateUUID,
  capitalize,
  truncate,
  padNumber,
  clamp,
  storage,
  createPlayer,
  addScore,
  rankPlayers,
  randomLetter,
  validatePlayerName,
} from '~/utils/index'

// ---------------------------------------------------------------------------
// UUID generation
// ---------------------------------------------------------------------------
describe('generateUUID', () => {
  it('returns a string of 36 characters', () => {
    const uuid = generateUUID()
    expect(uuid).toHaveLength(36)
  })

  it('has the correct UUID v4 format (8-4-4-4-12)', () => {
    const uuid = generateUUID()
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it('generates unique values on each call', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateUUID()))
    expect(ids.size).toBe(20)
  })
})

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------
describe('capitalize', () => {
  it('capitalises the first letter and lowercases the rest', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('WORLD')).toBe('World')
  })

  it('returns an empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles single-character strings', () => {
    expect(capitalize('a')).toBe('A')
  })
})

describe('truncate', () => {
  it('returns the string unchanged when within the limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('appends ellipsis when the string exceeds the limit', () => {
    expect(truncate('hello world', 5)).toBe('hello…')
  })

  it('returns the full string when length equals maxLength', () => {
    expect(truncate('exact', 5)).toBe('exact')
  })
})

// ---------------------------------------------------------------------------
// Number helpers
// ---------------------------------------------------------------------------
describe('padNumber', () => {
  it('pads a number with leading zeros to the specified width', () => {
    expect(padNumber(5, 3)).toBe('005')
    expect(padNumber(42, 4)).toBe('0042')
  })

  it('does not truncate numbers that exceed the width', () => {
    expect(padNumber(12345, 3)).toBe('12345')
  })
})

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to min when value is below range', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
  })

  it('clamps to max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('handles boundary values', () => {
    expect(clamp(0, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// Storage helper
// ---------------------------------------------------------------------------
describe('storage', () => {
  beforeEach(() => {
    storage.clear()
  })

  it('stores and retrieves a string value', () => {
    storage.setItem('name', 'Alice')
    expect(storage.getItem('name')).toBe('Alice')
  })

  it('stores and retrieves a numeric value', () => {
    storage.setItem('score', 42)
    expect(storage.getItem('score')).toBe(42)
  })

  it('returns undefined for non-existent keys', () => {
    expect(storage.getItem('missing')).toBeUndefined()
  })

  it('removes an item', () => {
    storage.setItem('temp', 'value')
    storage.removeItem('temp')
    expect(storage.getItem('temp')).toBeUndefined()
  })

  it('clears all stored values', () => {
    storage.setItem('a', 1)
    storage.setItem('b', 2)
    storage.clear()
    expect(storage.getItem('a')).toBeUndefined()
    expect(storage.getItem('b')).toBeUndefined()
  })

  it('reports whether a key exists', () => {
    storage.setItem('exists', true)
    expect(storage.has('exists')).toBe(true)
    expect(storage.has('missing')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Game helpers
// ---------------------------------------------------------------------------
describe('createPlayer', () => {
  it('creates a player with a UUID id', () => {
    const player = createPlayer('Alice')
    expect(player.id).toHaveLength(36)
    expect(player.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('trims the player name', () => {
    const player = createPlayer('  Bob  ')
    expect(player.name).toBe('Bob')
  })

  it('initialises score to zero', () => {
    const player = createPlayer('Carol')
    expect(player.score).toBe(0)
  })
})

describe('addScore', () => {
  it('adds positive points to a player score', () => {
    const player = createPlayer('Alice')
    const updated = addScore(player, 10)
    expect(updated.score).toBe(10)
  })

  it('does not allow score below zero', () => {
    const player = { ...createPlayer('Bob'), score: 5 }
    const updated = addScore(player, -10)
    expect(updated.score).toBe(0)
  })

  it('returns a new player object (immutable)', () => {
    const player = createPlayer('Carol')
    const updated = addScore(player, 5)
    expect(updated).not.toBe(player)
    expect(player.score).toBe(0)
  })
})

describe('rankPlayers', () => {
  it('sorts players by score descending', () => {
    const players = [
      { id: '1', name: 'Alice', score: 5 },
      { id: '2', name: 'Bob', score: 15 },
      { id: '3', name: 'Carol', score: 10 },
    ]
    const ranked = rankPlayers(players)
    expect(ranked[0].name).toBe('Bob')
    expect(ranked[1].name).toBe('Carol')
    expect(ranked[2].name).toBe('Alice')
  })

  it('does not mutate the original array', () => {
    const players = [
      { id: '1', name: 'Alice', score: 5 },
      { id: '2', name: 'Bob', score: 15 },
    ]
    rankPlayers(players)
    expect(players[0].name).toBe('Alice')
  })
})

describe('randomLetter', () => {
  it('returns a single uppercase letter', () => {
    const letter = randomLetter()
    expect(letter).toHaveLength(1)
    expect(letter).toMatch(/^[A-Z]$/)
  })

  it('returns letters from A-Z only', () => {
    const letters = new Set(Array.from({ length: 100 }, () => randomLetter()))
    for (const letter of letters) {
      expect(letter.charCodeAt(0)).toBeGreaterThanOrEqual(65) // A
      expect(letter.charCodeAt(0)).toBeLessThanOrEqual(90) // Z
    }
  })
})

describe('validatePlayerName', () => {
  it('accepts valid non-empty names', () => {
    expect(validatePlayerName('Alice')).toBe(true)
  })

  it('rejects empty strings', () => {
    expect(validatePlayerName('')).toBe(false)
    expect(validatePlayerName('   ')).toBe(false)
  })

  it('rejects names exceeding maxLength', () => {
    expect(validatePlayerName('A'.repeat(21))).toBe(false)
  })

  it('accepts names exactly at maxLength', () => {
    expect(validatePlayerName('A'.repeat(20))).toBe(true)
  })

  it('uses a custom maxLength', () => {
    expect(validatePlayerName('Hi', 2)).toBe(true)
    expect(validatePlayerName('Hey', 2)).toBe(false)
  })
})
