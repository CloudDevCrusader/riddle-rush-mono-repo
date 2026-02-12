import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * Recursively flatten a nested JSON object into dot-notation keys.
 * Example: { "menu": { "play": "Play" } } → ["menu.play"]
 */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

/**
 * Recursively collect all files matching given extensions from a directory.
 */
function collectFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = []
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      // Skip node_modules, .nuxt, .output, tests directories
      if (
        entry === 'node_modules' ||
        entry === '.nuxt' ||
        entry === '.output' ||
        entry === 'tests'
      ) {
        continue
      }
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        files.push(...collectFiles(fullPath, extensions))
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        files.push(fullPath)
      }
    }
  } catch {
    // Directory doesn't exist or permission denied — skip silently
  }
  return files
}

/**
 * Extract translation keys used in source code via t('key') or $t('key') calls.
 * Handles both single and double quotes.
 */
function extractUsedKeys(content: string): string[] {
  const keys: string[] = []
  // Match t('key') and $t('key') patterns with single or double quotes
  // Also match the form t('key', ...) with a second argument (fallback)
  const regex = /\$?t\(\s*['"]([a-zA-Z][\w.]+)['"]/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const key = match[1]
    // Skip keys that look like event names or non-translation patterns
    if (
      key &&
      !key.startsWith('update:') &&
      !key.includes('spin-') &&
      !key.startsWith('v-') &&
      key.includes('.')
    ) {
      keys.push(key)
    }
  }
  return keys
}

describe('i18n Translation Key Coverage', () => {
  const gameRoot = resolve(__dirname, '../../')
  const localesDir = join(gameRoot, 'i18n', 'locales')

  // Load both locale files
  const deJson = JSON.parse(readFileSync(join(localesDir, 'de.json'), 'utf-8'))
  const enJson = JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf-8'))

  const deKeys = new Set(flattenKeys(deJson))
  const enKeys = new Set(flattenKeys(enJson))

  // Collect all source files
  const sourceFiles = [
    ...collectFiles(join(gameRoot, 'pages'), ['.vue']),
    ...collectFiles(join(gameRoot, 'components'), ['.vue']),
    ...collectFiles(join(gameRoot, 'composables'), ['.ts']),
    ...collectFiles(join(gameRoot, 'stores'), ['.ts']),
    ...collectFiles(join(gameRoot, 'plugins'), ['.ts']),
  ]

  // Extract all used keys
  const usedKeysMap = new Map<string, string[]>()
  for (const file of sourceFiles) {
    const content = readFileSync(file, 'utf-8')
    const keys = extractUsedKeys(content)
    for (const key of keys) {
      const relativePath = file.replace(gameRoot, '')
      if (!usedKeysMap.has(key)) {
        usedKeysMap.set(key, [])
      }
      usedKeysMap.get(key)!.push(relativePath)
    }
  }

  const usedKeys = [...usedKeysMap.keys()].sort()

  it('should find translation keys in source code', () => {
    expect(usedKeys.length).toBeGreaterThan(0)
  })

  it('should have all used translation keys in de.json', () => {
    const missingInDe = usedKeys.filter((key) => !deKeys.has(key))
    if (missingInDe.length > 0) {
      const details = missingInDe
        .map((key) => {
          const files = usedKeysMap.get(key)?.join(', ') || 'unknown'
          return `  "${key}" (used in: ${files})`
        })
        .join('\n')
      expect(missingInDe, `Missing keys in de.json:\n${details}`).toEqual([])
    }
  })

  it('should have all used translation keys in en.json', () => {
    const missingInEn = usedKeys.filter((key) => !enKeys.has(key))
    if (missingInEn.length > 0) {
      const details = missingInEn
        .map((key) => {
          const files = usedKeysMap.get(key)?.join(', ') || 'unknown'
          return `  "${key}" (used in: ${files})`
        })
        .join('\n')
      expect(missingInEn, `Missing keys in en.json:\n${details}`).toEqual([])
    }
  })

  it('should have identical key sets in de.json and en.json', () => {
    const onlyInDe = [...deKeys].filter((key) => !enKeys.has(key))
    const onlyInEn = [...enKeys].filter((key) => !deKeys.has(key))

    expect(onlyInDe, `Keys only in de.json: ${onlyInDe.join(', ')}`).toEqual([])
    expect(onlyInEn, `Keys only in en.json: ${onlyInEn.join(', ')}`).toEqual([])
  })
})
