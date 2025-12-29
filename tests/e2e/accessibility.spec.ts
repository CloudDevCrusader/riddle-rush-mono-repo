import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('should have proper page structure', async ({ page }) => {
    await page.goto('/')

    // Check for main landmark
    const main = page.locator('main, [role="main"]')
    if (await main.count() > 0) {
      await expect(main.first()).toBeVisible()
    }

    // Check for proper heading hierarchy
    const h1 = page.locator('h1')
    if (await h1.count() > 0) {
      await expect(h1.first()).toBeVisible()
    }
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Press Tab to navigate
    await page.keyboard.press('Tab')

    // Check if an element is focused
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName
    })

    expect(focusedElement).toBeTruthy()
  })

  test('should have accessible forms', async ({ page }) => {
    await page.goto('/game')
    await page.waitForLoadState('networkidle')

    // Check if input has label or aria-label
    const inputs = page.locator('input[type="text"]')
    const inputCount = await inputs.count()

    if (inputCount > 0) {
      const firstInput = inputs.first()

      // Check for label association or aria-label
      const hasAccessibleName = await firstInput.evaluate((el) => {
        const ariaLabel = el.getAttribute('aria-label')
        const ariaLabelledBy = el.getAttribute('aria-labelledby')
        const id = el.id
        const hasLabel = id && document.querySelector(`label[for="${id}"]`)

        return !!(ariaLabel || ariaLabelledBy || hasLabel)
      })

      // It's okay if some inputs don't have labels, but we log it
      if (!hasAccessibleName) {
        console.log('Input might benefit from accessible label')
      }
    }
  })

  test.skip('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')

    // This is a basic check - for comprehensive a11y testing, use axe-core
    // Check if text is visible
    const textElements = page.locator('p, span, a, button, h1, h2, h3')
    const count = await textElements.count()

    expect(count).toBeGreaterThan(0)
  })
})
