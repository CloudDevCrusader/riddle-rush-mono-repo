import { test, expect } from '@playwright/test'

test.describe('Simple Test', () => {
  test('should load the page', async ({ page }) => {
    console.warn('Starting test...')

    // Try to navigate to the page
    try {
      await page.goto('http://localhost:3000/', { timeout: 30000 })
      console.warn('Page loaded successfully')

      // Wait for network idle
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      console.warn('Network idle')

      // Check if the page has any content
      const title = await page.title()
      console.warn('Page title:', title)

      // Check if the page has the expected content
      const html = await page.content()
      console.warn('Page content length:', html.length)

      expect(title).toContain('Riddle Rush')
      expect(html).toContain('Riddle Rush')
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  })
})
