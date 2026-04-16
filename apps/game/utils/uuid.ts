/**
 * Generate a UUID v4 string with cross-browser compatibility.
 *
 * Uses `crypto.randomUUID()` when available (modern browsers, secure contexts).
 * Falls back to a `crypto.getRandomValues()`-based implementation for older
 * browsers (e.g., Safari < 15.4) or non-secure HTTP contexts.
 *
 * @returns A lowercase UUID v4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
export function generateUUID(): string {
  const c = globalThis.crypto;

  // Use native randomUUID when available (modern browsers + secure context)
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }

  // Fallback: RFC 4122 version 4 UUID using crypto.getRandomValues()
  // getRandomValues() is supported in all browsers (Safari 11+) including non-secure contexts
  if (!c) {
    throw new Error('Web Crypto API is not available');
  }

  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);

  // Set version (4) and variant (10xx) bits per RFC 4122
  // Uint8Array(16) is guaranteed to have indices 0-15
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
