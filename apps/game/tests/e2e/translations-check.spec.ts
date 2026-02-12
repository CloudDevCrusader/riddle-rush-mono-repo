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

    const bodyText = await page.innerText('body')
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

    // 4. Check Round Start Page
    await page.waitForURL('**/round-start')
    
    // Wait for the result text to appear (after wheel spin)
    // Increase timeout for the wheel spin
    const resultText = page.locator('.result-text').first()
    await expect(resultText).toBeVisible({ timeout: 15000 })
    
    const categoryName = await resultText.innerText()
    console.log('Detected category name:', categoryName)
    
    // Should not be a key
    expect(categoryName).not.toContain('categories.')
    
    // Verify it's one of the English category names
    const englishCategories = Object.values(enLocale.categories)
    const found = englishCategories.some(cat => categoryName.includes(cat as string) || (cat as string).includes(categoryName))
    expect(found, `Category name "${categoryName}" should be one of the English category names`).toBe(true)
  })
})
