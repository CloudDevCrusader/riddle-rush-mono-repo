import { test, expect } from '@playwright/test'

test.describe('Debug Console Errors', () => {
  test('should capture console errors and page content', async ({ page }) => {
    const consoleMessages: string[] = []
    const consoleErrors: string[] = []

    // Capture all console messages
    page.on('console', (msg) => {
      const text = msg.text()
      consoleMessages.push(`[${msg.type()}] ${text}`)
      if (msg.type() === 'error') {
        consoleErrors.push(text)
      }
    })

    // Capture page errors
    page.on('pageerror', (error) => {
      consoleErrors.push(`PAGE ERROR: ${error.message}\n${error.stack}`)
    })

    // Navigate to credits page
    await page.goto('/credits')
    await page.waitForLoadState('networkidle')

    // Wait a bit for any delayed errors
    await page.waitForTimeout(2000)

    // Get the page HTML
    const html = await page.content()

    // Log everything
    console.log('\n=== CONSOLE MESSAGES ===')
    consoleMessages.forEach((msg) => console.log(msg))

    console.log('\n=== CONSOLE ERRORS ===')
    consoleErrors.forEach((err) => console.log(err))

    console.log('\n=== PAGE HTML (first 2000 chars) ===')
    console.log(html.substring(0, 2000))

    console.log('\n=== #__nuxt content ===')
    const nuxtDiv = await page
      .locator('#__nuxt')
      .innerHTML()
      .catch(() => 'NOT FOUND')
    console.log(nuxtDiv)

    // This test always "passes" - it's just for diagnostics
    expect(consoleMessages.length).toBeGreaterThan(0)
  })
})
