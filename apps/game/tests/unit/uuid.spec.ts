import { describe, it, expect, vi, afterEach } from 'vitest'
import { generateUUID } from '../../utils/uuid'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('generateUUID', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a valid UUID v4 string', () => {
    const uuid = generateUUID()
    expect(uuid).toMatch(UUID_REGEX)
  })

  it('generates unique values', () => {
    const uuids = new Set(Array.from({ length: 100 }, () => generateUUID()))
    expect(uuids.size).toBe(100)
  })

  it('uses crypto.randomUUID when available', () => {
    const spy = vi.spyOn(globalThis.crypto, 'randomUUID')
    generateUUID()
    expect(spy).toHaveBeenCalledOnce()
  })

  it('falls back to getRandomValues when randomUUID is unavailable', () => {
    const original = globalThis.crypto.randomUUID
    // Remove randomUUID to trigger fallback
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    const spy = vi.spyOn(globalThis.crypto, 'getRandomValues')
    const uuid = generateUUID()
    expect(uuid).toMatch(UUID_REGEX)
    expect(spy).toHaveBeenCalledOnce()

    // Restore
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: original,
      writable: true,
      configurable: true,
    })
  })

  it('fallback sets correct version and variant bits', () => {
    const original = globalThis.crypto.randomUUID
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    // Generate multiple to confirm version/variant consistency
    for (let i = 0; i < 20; i++) {
      const uuid = generateUUID()
      // Version nibble (position 14) must be '4'
      expect(uuid[14]).toBe('4')
      // Variant nibble (position 19) must be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(uuid[19])
    }

    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: original,
      writable: true,
      configurable: true,
    })
  })

  it('throws when crypto is completely unavailable', () => {
    vi.stubGlobal('crypto', undefined)

    expect(() => generateUUID()).toThrow('Web Crypto API is not available')

    vi.unstubAllGlobals()
  })
})
