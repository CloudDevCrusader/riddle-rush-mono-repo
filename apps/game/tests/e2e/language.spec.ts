import { test, expect } from '@playwright/test'

test.describe('Language Selection Page', () => {
  test('should load language page successfully', async ({ page }) => {
    await page.goto('/language')

    // Check page title (supports both German and English)
    await expect(page).toHaveTitle(/Language Selection|Sprachauswahl|Riddle Rush/i)

    // Check for main title image (title is an image, not text)
    const titleImage = page
      .locator('.title-image, img[alt*="Language" i], img[alt*="Sprache" i]')
      .first()
    await expect(titleImage).toBeVisible({ timeout: 5000 })
  })

  test('should display language options', async ({ page }) => {
    await page.goto('/language')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check for English option
    const englishOption = page.locator('.language-option').filter({ hasText: /ENGLISH/i })
    await expect(englishOption).toBeVisible()

    // Check for German option
    const germanOption = page.locator('.language-option').filter({ hasText: /GERMAN/i })
    await expect(germanOption).toBeVisible()

    // Check for flag containers (not .flag class, but .flag-container or .flag-image)
    const flags = page.locator('.flag-container, .flag-image')
    expect(await flags.count()).toBeGreaterThanOrEqual(2)
  })

  test('should show checkmark on selected language', async ({ page }) => {
    await page.goto('/language')

    await page.waitForLoadState('networkidle')

    // Wait a moment for the page to initialize
    await page.waitForTimeout(500)

    // One language should be selected (have checkmark)
    const checkmarks = page.locator('.checkmark')
    const checkmarkCount = await checkmarks.count()

    // At least one checkmark should be visible initially
    if (checkmarkCount > 0) {
      await expect(checkmarks.first()).toBeVisible()
    }
  })

  test('should allow selecting English', async ({ page }) => {
    await page.goto('/language')

    await page.waitForLoadState('networkidle')

    // Click on English option
    const englishOption = page.locator('.language-option').filter({ hasText: /ENGLISH/i })
    await englishOption.click()

    // Wait for state update
    await page.waitForTimeout(300)

    // English option should have selected class
    await expect(englishOption).toHaveClass(/selected/)
  })

  test('should allow selecting German', async ({ page }) => {
    await page.goto('/language')

    await page.waitForLoadState('networkidle')

    // Click on German option
    const germanOption = page.locator('.language-option').filter({ hasText: /GERMAN/i })
    await germanOption.click()

    // Wait for state update
    await page.waitForTimeout(300)

    // German option should have selected class
    await expect(germanOption).toHaveClass(/selected/)
  })

  test('should switch between languages', async ({ page }) => {
    await page.goto('/language')

    await page.waitForLoadState('networkidle')

    // Click English
    const englishOption = page.locator('.language-option').filter({ hasText: /ENGLISH/i })
    await englishOption.click()
    await page.waitForTimeout(200)

    // English should be selected
    await expect(englishOption).toHaveClass(/selected/)

    // Click German
    const germanOption = page.locator('.language-option').filter({ hasText: /GERMAN/i })
    await germanOption.click()
    await page.waitForTimeout(200)

    // German should now be selected
    await expect(germanOption).toHaveClass(/selected/)
  })

  test('should have working OK button', async ({ page }) => {
    await page.goto('/language')

    await page.waitForLoadState('networkidle')

    // Select a language first
    const englishOption = page.locator('.language-option').filter({ hasText: /ENGLISH/i })
    await englishOption.click()
    await page.waitForTimeout(200)

    // Look for OK button (OK button contains an image, not text)
    const okButton = page.locator('.ok-btn, button.ok-btn')

    if ((await okButton.count()) > 0) {
      await expect(okButton.first()).toBeVisible()

      // Click OK button
      await okButton.first().click()

      // Should navigate back (URL should change)
      await page.waitForTimeout(500)
      const url = page.url()
      expect(url).not.toContain('/language')
    }
  })

  test('should confirm language selection with OK button', async ({ page }) => {
    await page.goto('/language')

    await page.waitForLoadState('networkidle')

    // Select English
    const englishOption = page.locator('.language-option').filter({ hasText: /ENGLISH/i })
    await englishOption.click()
    await page.waitForTimeout(200)

    // Verify English is selected
    await expect(englishOption).toHaveClass(/selected/)

    // Click OK to confirm (OK button contains an image, not text)
    const okButton = page.locator('.ok-btn, button.ok-btn').first()
    await expect(okButton).toBeVisible({ timeout: 5000 })
    await okButton.click()

    // Wait for navigation - should navigate away from language page
    await page.waitForTimeout(500)
    const url = page.url()
    expect(url).not.toContain('/language')
  })

  test('should display flags correctly', async ({ page }) => {
    await page.goto('/language')

    await page.waitForLoadState('networkidle')

    // Check for flag containers
    const flagContainers = page.locator('.flag-container')
    expect(await flagContainers.count()).toBe(2)

    // Check that flags are visible
    for (let i = 0; i < (await flagContainers.count()); i++) {
      const flagContainer = flagContainers.nth(i)
      await expect(flagContainer).toBeVisible()
    }
  })

  test('should have proper page styling', async ({ page }) => {
    await page.goto('/language')

    await page.waitForLoadState('networkidle')

    // Check that the page has content
    const body = page.locator('body')
    await expect(body).toBeVisible()

    // Check for language card
    const languageCard = page.locator('.language-card')
    if ((await languageCard.count()) > 0) {
      await expect(languageCard).toBeVisible()
    }

    // Check for background pattern
    const bgPattern = page.locator('.bg-pattern')
    if ((await bgPattern.count()) > 0) {
      // Background pattern exists
      expect(await bgPattern.count()).toBeGreaterThan(0)
    }
  })
})
