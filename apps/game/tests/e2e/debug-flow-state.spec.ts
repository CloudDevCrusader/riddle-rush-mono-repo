import { test, expect } from '@playwright/test'
import { setupMultiplayerGame, submitPlayerAnswers } from './helpers/game-flow'

test.describe('debug flow state', () => {
  test('debug flow state values', async ({ page }) => {
    await setupMultiplayerGame(page, ['Player 1', 'Player 2'])

    // Before submit
    console.log('=== BEFORE SUBMIT ===')
    const beforeState = await page.evaluate(() => {
      const zustand = (window as unknown as Record<string, unknown>).__zustand__ as
        | { game?: { getState: () => Record<string, unknown> } }
        | undefined

      const state = zustand?.game?.getState() as
        | {
            currentSession?: {
              flowState?: string
              players?: Array<{ hasSubmitted?: boolean }>
            }
          }
        | undefined

      return {
        flowState: state?.currentSession?.flowState,
        players: state?.currentSession?.players?.length || 0,
        allSubmitted: state?.currentSession?.players?.every((p) => p.hasSubmitted) || false,
      }
    })
    console.log('Before state:', beforeState)

    // Submit answers
    await submitPlayerAnswers(page, 2, ['', ''])

    // After submit
    console.log('=== AFTER SUBMIT ===')
    await page.waitForTimeout(2000)

    const afterState = await page.evaluate(() => {
      const zustand = (window as unknown as Record<string, unknown>).__zustand__ as
        | { game?: { getState: () => Record<string, unknown> } }
        | undefined

      const state = zustand?.game?.getState() as
        | {
            currentSession?: {
              flowState?: string
              players?: Array<{ hasSubmitted?: boolean }>
            }
          }
        | undefined

      return {
        flowState: state?.currentSession?.flowState,
        players: state?.currentSession?.players?.length || 0,
        allSubmitted: state?.currentSession?.players?.every((p) => p.hasSubmitted) || false,
      }
    })
    console.log('After state:', afterState)

    // Check template condition
    const templateCondition = await page.evaluate(() => {
      const flowState = (window as any).__NUXT__?.state?.game?.flowState
      const players = (window as any).__NUXT__?.state?.game?.players || []
      return {
        flowState,
        playersLength: players.length,
        condition:
          flowState === 'round-complete' || flowState === 'decision' || players.length === 0,
      }
    })
    console.log('Template condition:', templateCondition)
  })
})
