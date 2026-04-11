import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { completeFortuneWheel, hideDevtools, waitForSplashComplete } from './helpers/game-flow'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const enLocalePath = path.resolve(__dirname, '../../translations/locales/en.json')
const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf-8'))
const deLocalePath = path.resolve(__dirname, '../../translations/locales/de.json')
const deLocale = JSON.parse(fs.readFileSync(deLocalePath, 'utf-8'))

async function startFromPlayers(page: import('@playwright/test').Page) {
  const start = page.locator('[data-testid="players-start-button"]').first()
  await expect(start).toBeVisible({ timeout: 15000 })

  for (let attempt = 0; attempt < 8; attempt++) {
    if (/\/(round-start|game)/.test(page.url())) {
      break
    }

    if (!(await start.isVisible().catch(() => false))) {
      await page.waitForTimeout(250)
      continue
    }

    try {
      await start.click({ timeout: 2000 })
    } catch {
      await start.click({ force: true, timeout: 1000 }).catch(() => {})
    }
    await page.waitForTimeout(250)
  }

  await expect.poll(() => /\/(round-start|game)/.test(page.url()), { timeout: 45000 }).toBe(true)
}

test.describe('Translation Checks', () => {
  test('should not show raw translation keys on home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await hideDevtools(page)
    await waitForSplashComplete(page)
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
    test.setTimeout(120000)
    // 1. Switch to English via language page
    await page.goto('/language')
    await page.waitForLoadState('domcontentloaded')
    await hideDevtools(page)
    await waitForSplashComplete(page)
    // Wait for splash screen to finish and language page to render
    await expect(page.locator('[data-testid="language-ok-button"]')).toBeVisible({ timeout: 15000 })

    await page.locator('[data-testid="language-option-english"]').click()
    // Clicking OK triggers window.location.reload() — use proven waitForNavigation pattern
    const okButton = page.locator('[data-testid="language-ok-button"]')
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), okButton.click()])
    await page.waitForLoadState('domcontentloaded')

    // 2. Go to Home with ?lang=en to reliably activate English locale
    //    (route query has highest priority in i18n.client.ts locale resolution)
    await page.goto('/?lang=en').catch(async () => {
      await page.goto('/')
    })
    await page.waitForLoadState('domcontentloaded')
    await hideDevtools(page)
    await waitForSplashComplete(page)
    const playBtn = page.locator('[data-testid="main-menu-play"]')
    await expect(playBtn).toBeVisible({ timeout: 15000 })
    await playBtn.click()

    // 3. Check Players Page
    await page.waitForURL('**/players')
    const startBtn = page.locator('[data-testid="players-start-button"]')
    await expect(startBtn).toBeVisible()
    // Should NOT show the key
    await expect(startBtn).not.toHaveText('players.start')
    // Should show a translated label (not raw key)
    await expect(startBtn).not.toHaveText('players.start')

    await startFromPlayers(page)

    if (page.url().includes('/round-start')) {
      await completeFortuneWheel(page)
    }

    await expect(page).toHaveURL(/\/game/, { timeout: 35000 })
    const gameCatName = page.locator('[data-testid="game-category-info"]')
    await expect(gameCatName).toBeVisible()
    const categoryName = (await gameCatName.textContent()) ?? ''

    console.log('Detected category name:', categoryName)

    // Should not be a key
    expect(categoryName).not.toContain('categories.')
    expect(categoryName).not.toEqual('LOADING...')

    // Verify category matches one of known translated category names (de/en)
    const translatedCategories = [
      ...Object.values(enLocale.categories),
      ...Object.values(deLocale.categories),
    ].map((c) => (c as string).toLowerCase())
    const found = translatedCategories.some(
      (cat) => categoryName.toLowerCase().includes(cat) || cat.includes(categoryName.toLowerCase())
    )
    expect(found, `Category name "${categoryName}" should match one translated category name`).toBe(
      true
    )
  })
})
