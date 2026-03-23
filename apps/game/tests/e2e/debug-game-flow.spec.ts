import { test, expect } from '@playwright/test'
import { setupMultiplayerGame, submitPlayerAnswers } from './helpers/game-flow'

test.describe('debug game flow', () => {
  test('debug game flow after submit', async ({ page }) => {
    await setupMultiplayerGame(page, ['Player 1', 'Player 2'])

    // Submit answers for round 1
    await submitPlayerAnswers(page, 2, ['', ''])

    // Wait a bit to see what happens
    await page.waitForTimeout(3000)

    // Take screenshot
    await page.screenshot({ path: 'debug-after-submit.png' })

    // Check what elements are available
    const nextBtn = page.locator('[data-testid="next-button"]')
    const allSubmitted = page.locator('[data-testid="game-all-submitted"]')
    const gameAnswerInput = page.locator('[data-testid="game-answer-input"]')
    const submitBtn = page.locator('[data-testid="game-submit-button"]')

    console.log('Next button visible:', await nextBtn.isVisible())
    console.log('All submitted visible:', await allSubmitted.isVisible())
    console.log('Answer input visible:', await gameAnswerInput.isVisible())
    console.log('Submit button visible:', await submitBtn.isVisible())

    // Check URL
    console.log('Current URL:', page.url())

    // Check console for errors
    const consoleLogs: string[] = []
    page.on('console', (msg) => {
      consoleLogs.push(msg.text())
      console.log('Console:', msg.text())
    })

    // Check game state
    const gameState = await page.evaluate(() => {
      const zustand = (window as unknown as Record<string, unknown>).__zustand__ as
        | { game?: { getState: () => Record<string, unknown> } }
        | undefined

      const state = zustand?.game?.getState() as
        | {
            currentSession?: {
              currentPlayerIndex?: number
              players?: Array<{ hasSubmitted?: boolean }>
              flowState?: string
            }
          }
        | undefined

      return {
        flowState: state?.currentSession?.flowState,
        currentPlayerIndex: state?.currentSession?.currentPlayerIndex,
        players:
          state?.currentSession?.players?.map((p) => ({ hasSubmitted: p.hasSubmitted })) || [],
      }
    })

    console.log('Game state:', gameState)

    // Try to find any elements with data-testid
    const allWithTestId = page.locator('[data-testid]')
    const count = await allWithTestId.count()
    console.log('Total elements with data-testid:', count)

    for (let i = 0; i < Math.min(count, 20); i++) {
      const element = allWithTestId.nth(i)
      const testId = (await element.getAttribute('data-testid')) || 'unknown'
      const text = (await element.textContent()) || ''
      console.log(`  [data-testid="${testId}"]: "${text}"`)
    }
  })
})
