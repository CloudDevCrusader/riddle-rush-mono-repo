import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

// Navigation steps
Given('I navigate to {string}', async ({ page }, path: string) => {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  // Wait for splash screen to disappear (takes ~3.3s)
  await page.waitForSelector('.splash-screen', { state: 'hidden', timeout: 5000 }).catch(() => {
    // Splash screen might not exist on all pages
  })
})

// Visibility checks
Then('I should see {string}', async ({ page }, selector: string) => {
  await expect(page.locator(selector)).toBeVisible({ timeout: 10000 })
})

Then('I should not see {string}', async ({ page }, selector: string) => {
  await expect(page.locator(selector)).not.toBeVisible()
})

// Count checks
Then(
  'I should see {int} elements matching {string}',
  async ({ page }, count: number, selector: string) => {
    await expect(page.locator(selector)).toHaveCount(count)
  }
)

// Text checks
Then('I should see text {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

// Click actions
When('I click {string}', async ({ page }, selector: string) => {
  await page.locator(selector).click()
  await page.waitForTimeout(500)
})

// URL checks
Then('the URL should be {string}', async ({ page }, url: string) => {
  await expect(page).toHaveURL(url)
})

Then('the URL should contain {string}', async ({ page }, urlPart: string) => {
  await expect(page).toHaveURL(new RegExp(urlPart))
})

// Input actions
When('I type {string} into {string}', async ({ page }, text: string, selector: string) => {
  await page.locator(selector).fill(text)
})

Then(
  'the input {string} should have value {string}',
  async ({ page }, selector: string, value: string) => {
    await expect(page.locator(selector)).toHaveValue(value)
  }
)

// Wait actions
When('I wait {int} ms', async ({ page }, ms: number) => {
  await page.waitForTimeout(ms)
})
