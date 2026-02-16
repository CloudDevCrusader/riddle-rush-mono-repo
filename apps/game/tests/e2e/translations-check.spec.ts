import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const enLocalePath = path.resolve(__dirname, '../../i18n/locales/en.json')
const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf-8'))

test.describe('Translation Checks', () => {
  test('should not show raw translation keys on home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const bodyText = (await page.locator('body').textContent()) ?? ''
    // Pattern for keys like "menu.play"
    const keyPattern = /\b[a-z]+\.[a-z_]+\b/g
    const matches = bodyText.match(keyPattern)

    if (matches) {
      // eslint-disable-next-line no-console
      console.log('Found potential missing keys:', matches)
    }
    expect(matches).toBeNull()
  })

  test('should show category in English and not as a key', async ({ page }) => {
    // 1. Switch to English via language page
    await page.goto('/language')
    await page.getByText('ENGLISH').click()
    await page.getByRole('button', { name: 'OK' }).click()
    await page.waitForLoadState('networkidle')

    // 2. Go to Home and Start Game
    await page.goto('/')
    const playBtn = page.locator('button').filter({ hasText: /Play/i }).first()
    await expect(playBtn).toBeVisible()
    await playBtn.click()

    // 3. Check Players Page
    await page.waitForURL('**/players')
    const startBtn = page.locator('.start-button')
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
      const resultText = page.locator('.result-text').first()
      // It might skip directly to game if it navigates fast, so we handle both
      try {
        await expect(resultText).toBeVisible({ timeout: 10000 })
        categoryName = (await resultText.textContent()) ?? ''
      } catch {
        // Maybe already navigated to game
        await page.waitForURL('**/game/**')
        const gameCatName = page.locator('.category-name')
        await expect(gameCatName).toBeVisible()
        categoryName = (await gameCatName.textContent()) ?? ''
      }
    } else {
      const gameCatName = page.locator('.category-name')
      await expect(gameCatName).toBeVisible()
      categoryName = (await gameCatName.textContent()) ?? ''
    }

    // eslint-disable-next-line no-console
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
