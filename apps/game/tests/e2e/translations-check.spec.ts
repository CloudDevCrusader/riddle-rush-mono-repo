import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const enLocalePath = path.resolve(__dirname, '../../i18n/locales/en.json')
const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf-8'))

test.describe('Translation Checks', () => {
  
  test('should not show translation keys on home page in English', async ({ page }) => {
    // 1. Force English via URL
    await page.goto('/?lang=en')
    await page.waitForLoadState('networkidle')

    // 2. Scan for text that looks like a key (e.g. "menu.options")
    // We exclude common patterns like filenames or URLs if any
    const bodyText = await page.innerText('body')
    const keyPattern = /\b[a-z]+\.[a-z_]+\b/g
    const matches = bodyText.match(keyPattern)
    
    // Filter out potential false positives if necessary
    // For now, assume any "word.word" is a missing key
    if (matches) {
        console.log('Found potential missing keys:', matches)
    }
    expect(matches).toBeNull()
  })

  test('should show category in English after starting game', async ({ page }) => {
    // 1. Force English
    await page.goto('/?lang=en')
    await page.waitForLoadState('networkidle')

    // 2. Click Play
    const playBtn = page.locator('button').filter({ hasText: 'PLAY' }).first()
    await expect(playBtn).toBeVisible()
    await playBtn.click()

    // 3. Wait for players page
    await page.waitForURL('**/players')
    
    // 4. Click Start Game
    // Text should be "Start Game" in English
    const startBtn = page.locator('.start-button')
    await expect(startBtn).toBeVisible()
    await expect(startBtn).toHaveText('Start Game', { ignoreCase: true })
    await startBtn.click()

    // 5. Wait for round start page
    await page.waitForURL('**/round-start')
    
    // 6. Check for category name
    // The category names are in enLocale.categories values.
    const englishCategories = Object.values(enLocale.categories)
    
    // Wait for one of these to appear
    await expect.poll(async () => {
        const text = await page.innerText('body')
        // Check if any english category is present
        // Note: some categories might be sub-strings of others, but strict check is hard.
        // We just want to ensure we don't see raw keys or German-only names (if possible).
        return englishCategories.some(cat => text.includes(cat as string))
    }, {
        message: 'Expected to find an English category name on the screen',
        timeout: 10000
    }).toBe(true)
  })
})
