import { browser, expect } from '@wdio/globals'

import { switchToCapacitorWebView } from '../helpers/webview'

describe('Riddle Rush (Capacitor WebView)', () => {
  it('shows the main menu after splash and opens the players screen', async () => {
    await switchToCapacitorWebView(browser)

    const play = await browser.$('[data-testid="main-menu-play"]')
    await play.waitForDisplayed({ timeout: 120_000 })
    await expect(play).toBeDisplayed()

    await play.click()

    const start = await browser.$('[data-testid="players-start-button"]')
    await start.waitForDisplayed({ timeout: 30_000 })
    await expect(start).toBeDisplayed()
  })
})
