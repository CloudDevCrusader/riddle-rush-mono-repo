import { test, expect } from '@playwright/test'

/**
 * E2E test: Verify that no raw translation keys are displayed in the UI.
 *
 * Raw keys look like "menu.play", "scoring.title", "leaderboard.ranking"
 * — dotted identifiers that should never appear in user-facing text.
 *
 * The regex matches patterns like "word.word" or "word.word_word"
 * while excluding common false positives (URLs, file extensions, CSS classes).
 */

/** Known false positives that may appear in visible text */
const ALLOWED_PATTERNS = [
  /riddle-rush/i, // App name in URLs
  /localhost:\d+/, // Dev server URL
  /\d+\.\d+/, // Version numbers like "1.0.0"
  /\.png|\.jpg|\.svg|\.webp|\.json/i, // File extensions
  /0\.0\.0/, // Placeholder version
]

/**
 * Check if a string fragment looks like an untranslated i18n key.
 * Translation keys follow the pattern: "section.key_name" (all lowercase, dots and underscores).
 */
function findRawTranslationKeys(text: string): string[] {
  // Split text into words and check each for dotted key patterns
  // Using simple word extraction instead of complex regex to avoid backtracking issues
  const words = text.split(/[\s,;:!?()[\]{}'"<>]+/)
  const matches: string[] = []

  for (const word of words) {
    // Must contain a dot and look like "section.key_name"
    if (!word.includes('.')) continue

    // Each segment must be lowercase letters/underscores/digits, starting with a letter
    const segments = word.split('.')
    if (segments.length < 2 || segments.length > 4) continue

    const isKey = segments.every((seg) => seg.length >= 2 && /^[a-z][a-z0-9_]*$/.test(seg))
    if (!isKey) continue

    // Skip known false positives
    const isAllowed = ALLOWED_PATTERNS.some((pattern) => pattern.test(word))
    if (isAllowed) continue

    matches.push(word)
  }

  return [...new Set(matches)]
}

test.describe('i18n: No raw translation keys in UI', () => {
  // Pages that can be visited without game state
  const pages = [
    { path: '/', name: 'Main Menu' },
    { path: '/settings', name: 'Settings' },
    { path: '/credits', name: 'Credits' },
    { path: '/language', name: 'Language' },
    { path: '/players', name: 'Players' },
  ]

  for (const { path, name } of pages) {
    test(`${name} page (${path}) should not show raw translation keys`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      // Wait for Vue to mount and i18n to load
      await page.waitForTimeout(1500)

      // Get all visible text content from the page body
      const bodyText = (await page.locator('body').textContent()) ?? ''

      const rawKeys = findRawTranslationKeys(bodyText)

      expect(
        rawKeys,
        `Found raw translation keys on "${name}" page (${path}):\n${rawKeys.map((k) => `  - "${k}"`).join('\n')}\nThese keys should be translated, not shown as-is to users.`
      ).toEqual([])
    })
  }

  test('Main Menu buttons should show translated text, not keys', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // The menu should show translated button text, not raw keys
    const menuButtons = page.locator('.menu-buttons .game-button, .menu-buttons button')

    const buttonCount = await menuButtons.count()
    for (let i = 0; i < buttonCount; i++) {
      const buttonText = (await menuButtons.nth(i).textContent()) ?? ''
      const trimmed = buttonText.trim()

      // Button text should not look like a translation key
      expect(trimmed, `Menu button ${i} shows what looks like a raw key: "${trimmed}"`).not.toMatch(
        /^[a-z]+\.[a-z_]+$/
      )

      // Button text should not be empty
      expect(trimmed.length, `Menu button ${i} has empty text`).toBeGreaterThan(0)
    }
  })
})
