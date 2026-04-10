import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hideDevtools } from './helpers/game-flow'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const enLocalePath = path.resolve(__dirname, '../../translations/locales/en.json')
const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf-8'))

test.describe('Translation Checks', () => {
  test('should not show raw translation keys on home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Wait for splash screen to finish and actual page content to render
    await expect(page.locator('[data-testid="main-menu-play"]')).toBeVisible({ timeout: 15000 })

    // Use innerText to get only visible text (excludes <script>/<style> content)
    const bodyText = await page.locator('body').innerText()
    // Pattern for keys like "menu.play"
    const keyPattern = /\b[a-z]+\.[a-z_]+\b/g
    const matches = bodyText.match(keyPattern)

    if (matches) {
      console.log('Found potential missing keys:', matches)
    }
    expect(matches).toBeNull()
  })

  test('should show category in English and not as a key', async ({ page }) => {
    // 1. Switch to English via language page
    await page.goto('/language')
    await page.waitForLoadState('networkidle')
    // Wait for splash screen to finish and language page to render
    await expect(page.locator('[data-testid="language-ok-button"]')).toBeVisible({ timeout: 15000 })

    await page.locator('[data-testid="language-option-english"]').click()
    // Clicking OK triggers window.location.reload() — use proven waitForNavigation pattern
    const okButton = page.locator('[data-testid="language-ok-button"]')
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), okButton.click()])
    await page.waitForLoadState('networkidle')

    // 2. Go to Home with ?lang=en to reliably activate English locale
    //    (route query has highest priority in i18n.client.ts locale resolution)
    await page.goto('/?lang=en')
    await page.waitForLoadState('networkidle')
    await hideDevtools(page)
    const playBtn = page.locator('[data-testid="main-menu-play"]')
    await expect(playBtn).toBeVisible({ timeout: 15000 })
    await playBtn.click()

    // 3. Check Players Page
    await page.waitForURL('**/players')
    const startBtn = page.locator('[data-testid="players-start-button"]')
    await expect(startBtn).toBeVisible()
    // Should NOT show the key
    await expect(startBtn).not.toHaveText('players.start')
    // Should show the English translation
    await expect(startBtn).toHaveText('Start Game', { ignoreCase: true })
    await startBtn.click()

    // 4. Check Round Start OR Game Page
    // Depending on feature flags, we might be on round-start (with wheels) or directly in game
    await page.waitForURL(
      (url) => url.pathname.includes('round-start') || url.pathname.includes('game')
    )

    const isRoundStart = page.url().includes('round-start')

    let categoryName = ''
    if (isRoundStart) {
      // Wait for wheels to complete and results to show
      const resultText = page.locator('[data-testid="round-category-display"]').first()
      // It might skip directly to game if it navigates fast, so we handle both
      try {
        await expect(resultText).toBeVisible({ timeout: 10000 })
        categoryName = (await resultText.textContent()) ?? ''
      } catch {
        // Maybe already navigated to game
        await page.waitForURL('**/game/**')
        const gameCatName = page.locator('[data-testid="game-category-info"]')
        await expect(gameCatName).toBeVisible()
        categoryName = (await gameCatName.textContent()) ?? ''
      }
    } else {
      const gameCatName = page.locator('[data-testid="game-category-info"]')
      await expect(gameCatName).toBeVisible()
      categoryName = (await gameCatName.textContent()) ?? ''
    }

    console.log('Detected category name:', categoryName)

    // Should not be a key
    expect(categoryName).not.toContain('categories.')
    expect(categoryName).not.toEqual('LOADING...')

    // Verify it's one of the English category names (case-insensitive)
    const englishCategories = Object.values(enLocale.categories).map((c) =>
      (c as string).toLowerCase()
    )
    const found = englishCategories.some(
      (cat) => categoryName.toLowerCase().includes(cat) || cat.includes(categoryName.toLowerCase())
    )
    expect(
      found,
      `Category name "${categoryName}" should match one of the English category names`
    ).toBe(true)
  })
})
