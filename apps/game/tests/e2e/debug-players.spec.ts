import { test, expect } from '@playwright/test'

test.describe('debug players page', () => {
  test('debug players page elements', async ({ page }) => {
    await page.goto('/players', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Wait for page to be ready
    await page.waitForTimeout(2000)

    // Take screenshot to see what's on the page
    await page.screenshot({ path: 'debug-players-page.png' })

    // Try to find players page elements
    const playersTitle = page.locator('h1, h2, .players-title, [data-testid="players-title"]')
    const titleText = (await playersTitle.first().textContent()) || 'not found'
    console.log('Players title:', titleText)

    // Look for stepper elements
    const stepper = page.locator('.stepper, [data-testid^="stepper"]')
    const stepperCount = await stepper.count()
    console.log('Stepper elements found:', stepperCount)

    // Look for increase button specifically
    const increaseBtn = page.locator('[data-testid="players-increase-button"]')
    const increaseBtnCount = await increaseBtn.count()
    console.log('Increase buttons found:', increaseBtnCount)

    if (increaseBtnCount > 0) {
      console.log('Increase button text:', await increaseBtn.first().textContent())
    } else {
      // Look for any button that might be the increase button
      const allButtons = page.locator('button')
      const buttonCount = await allButtons.count()
      console.log('All buttons found:', buttonCount)

      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = allButtons.nth(i)
        const text = (await button.textContent()) || ''
        const ariaLabel = (await button.getAttribute('aria-label')) || ''
        console.log(`Button ${i}: text="${text}", aria-label="${ariaLabel}"`)
      }
    }

    // Look for player name inputs
    const playerInputs = page.locator('[data-testid^="players-name-input"]')
    console.log('Player inputs found:', await playerInputs.count())

    // Look for start button
    const startBtn = page.locator('[data-testid="players-start-button"], button[type="submit"]')
    console.log('Start button found:', await startBtn.count())

    // Check URL
    console.log('Current URL:', page.url())

    // If we can't find the increase button, fail with helpful message
    if (increaseBtnCount === 0) {
      console.log('ERROR: Could not find players-increase-button')
      console.log('Available elements with data-testid:')
      const allWithTestId = page.locator('[data-testid]')
      const testIdCount = await allWithTestId.count()
      for (let i = 0; i < Math.min(testIdCount, 20); i++) {
        const element = allWithTestId.nth(i)
        const testId = (await element.getAttribute('data-testid')) || 'unknown'
        const text = (await element.textContent()) || ''
        console.log(`  [data-testid="${testId}"]: ${text}`)
      }
    }

    expect(increaseBtnCount).toBeGreaterThan(0)
  })
})
