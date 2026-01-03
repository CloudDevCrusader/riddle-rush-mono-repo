import { test, expect } from '@playwright/test'

const waitForSplash = async (page: import('@playwright/test').Page) => {
  await page.waitForTimeout(2000)
  const splashScreen = page.locator('.splash-screen')
  await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
}

const submitAnswersForCurrentRound = async (page: import('@playwright/test').Page) => {
  const answerInput = page.getByTestId('game-answer-input')
  const submitBtn = page.getByTestId('game-submit-answer')
  const turnName = page.getByTestId('game-turn-name')

  for (let i = 0; i < 4; i++) {
    if (!(await answerInput.isVisible())) {
      break
    }
    await expect(turnName).toBeVisible()
    await answerInput.fill(`RoundAnswer${i + 1}`)
    await submitBtn.click()
    await page.waitForTimeout(400)
  }
}

test.describe('Workflow TDD', () => {
  test('happy path: menu -> players -> round-start -> game -> results -> leaderboard', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await waitForSplash(page)

    await page.getByTestId('menu-play').click()
    await expect(page).toHaveURL(/\/players/)

    await expect(page.getByTestId('players-list')).toBeVisible()
    await page.getByTestId('players-start').click()

    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

    await expect(page.getByTestId('game-round')).toBeVisible()
    await expect(page.getByTestId('game-category')).toBeVisible()
    await expect(page.getByTestId('game-letter')).toBeVisible()

    await submitAnswersForCurrentRound(page)

    const nextBtn = page.getByTestId('next-button')
    await expect(nextBtn).toBeVisible()
    await nextBtn.click()

    await expect(page).toHaveURL(/\/results/)
    await expect(page.getByTestId('results-list')).toBeVisible()

    await page.getByTestId('results-next').click()
    await expect(page).toHaveURL(/\/leaderboard/)
    await expect(page.getByTestId('leaderboard-list')).toBeVisible()
  })

  test('multi-round: leaderboard OK starts next round with incremented round number', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await waitForSplash(page)

    await page.getByTestId('menu-play').click()
    await page.getByTestId('players-start').click()

    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

    await submitAnswersForCurrentRound(page)
    await page.getByTestId('next-button').click()
    await expect(page).toHaveURL(/\/results/)

    await page.getByTestId('results-next').click()
    await expect(page).toHaveURL(/\/leaderboard/)

    await page.getByTestId('leaderboard-ok').click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

    const roundText = await page.getByTestId('game-round').textContent()
    expect(roundText).toContain('02')

    await expect(page.getByTestId('game-answer-input')).toHaveValue('')
    await expect(page.getByTestId('game-turn-name')).toContainText('Player 1')
  })
})
