import { test, expect } from '@playwright/test'

test('GamePanel visual verification', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.game-panel')).toBeVisible()
  await page.screenshot({ path: '.playwright-mcp/game-panel-verification.png' })
})
