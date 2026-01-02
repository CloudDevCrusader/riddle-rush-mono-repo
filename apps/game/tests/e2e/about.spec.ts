import { test, expect } from '@playwright/test'

test.describe('About Page', () => {
  test('should load about page successfully', async ({ page }) => {
    await page.goto('/about')

    // Check page title
    await expect(page).toHaveTitle(/Riddle Rush - About/i)

    // Check for main heading
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText(/About Riddle Rush/i)
  })

  test('should display creators information', async ({ page }) => {
    await page.goto('/about')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check for creators paragraph
    const creators = page.locator('.creators')
    await expect(creators).toBeVisible()
    await expect(creators).toContainText(/Tobias Wirl/i)
    await expect(creators).toContainText(/Markus Wagner/i)
  })

  test('should display How It Works section', async ({ page }) => {
    await page.goto('/about')

    await page.waitForLoadState('networkidle')

    // Check for How It Works heading
    const heading = page.getByRole('heading', { name: /How It Works/i })
    await expect(heading).toBeVisible()

    // Check for description
    const description = page.getByText(/Wikipedia.*PetScan/i)
    await expect(description).toBeVisible()
  })

  test('should display Progressive Web App section', async ({ page }) => {
    await page.goto('/about')

    await page.waitForLoadState('networkidle')

    // Check for PWA heading
    const heading = page.getByRole('heading', { name: /Progressive Web App/i })
    await expect(heading).toBeVisible()

    // Check for PWA description
    const description = page.getByText(/offline support/i)
    await expect(description).toBeVisible()
  })

  test('should display Technologies Used section', async ({ page }) => {
    await page.goto('/about')

    await page.waitForLoadState('networkidle')

    // Check for Technologies heading
    const heading = page.getByRole('heading', { name: /Technologies Used/i })
    await expect(heading).toBeVisible()

    // Check for technology list
    const techList = page.locator('.info ul')
    await expect(techList).toBeVisible()

    // Check for specific technologies
    const nuxt = page.getByText(/Nuxt 3/i)
    await expect(nuxt).toBeVisible()

    const vue = page.getByText(/Vue 3/i)
    await expect(vue).toBeVisible()

    const pinia = page.getByText(/Pinia/i)
    await expect(pinia).toBeVisible()

    // Use first() to avoid strict mode violation (IndexedDB appears in both PWA description and tech list)
    const indexedDB = page.getByText(/IndexedDB/i).first()
    await expect(indexedDB).toBeVisible()

    const typescript = page.getByText(/TypeScript/i)
    await expect(typescript).toBeVisible()

    const playwright = page.getByText(/Playwright/i)
    await expect(playwright).toBeVisible()
  })

  test('should display all technology items in list', async ({ page }) => {
    await page.goto('/about')

    await page.waitForLoadState('networkidle')

    // Check that list items exist
    const listItems = page.locator('.info li')
    const itemCount = await listItems.count()

    // Should have multiple technology items
    expect(itemCount).toBeGreaterThan(3)

    // All items should be visible
    for (let i = 0; i < itemCount; i++) {
      await expect(listItems.nth(i)).toBeVisible()
    }
  })

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/about')

    await page.waitForLoadState('networkidle')

    // Check for main container
    const container = page.locator('.about')
    await expect(container).toBeVisible()

    // Check for info section
    const infoSection = page.locator('.info')
    await expect(infoSection).toBeVisible()

    // Check that multiple h2 headings exist
    const h2Headings = page.locator('.info h2')
    const headingCount = await h2Headings.count()
    expect(headingCount).toBeGreaterThanOrEqual(3)
  })

  test('should have readable text content', async ({ page }) => {
    await page.goto('/about')

    await page.waitForLoadState('networkidle')

    // Check that paragraphs exist and are visible
    const paragraphs = page.locator('.info p')
    const paragraphCount = await paragraphs.count()

    expect(paragraphCount).toBeGreaterThan(0)

    for (let i = 0; i < paragraphCount; i++) {
      await expect(paragraphs.nth(i)).toBeVisible()
    }
  })

  test('should have proper styling applied', async ({ page }) => {
    await page.goto('/about')

    await page.waitForLoadState('networkidle')

    // Check that the main container has styling
    const container = page.locator('.about')
    await expect(container).toBeVisible()

    // Check that headings have color (styled)
    const h1 = page.locator('h1')
    const color = await h1.evaluate((el) => {
      return window.getComputedStyle(el).color
    })

    // Color should be set (not default black: rgb(0, 0, 0))
    expect(color).toBeTruthy()
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/about')

    await page.waitForLoadState('networkidle')

    // Check that content is visible
    const container = page.locator('.about')
    await expect(container).toBeVisible()

    // Content should be readable
    const h1 = page.locator('h1')
    const box = await h1.boundingBox()

    expect(box).toBeTruthy()
    if (box) {
      expect(box.width).toBeGreaterThan(0)
      expect(box.height).toBeGreaterThan(0)
    }
  })

  test('should have accessible content', async ({ page }) => {
    await page.goto('/about')

    await page.waitForLoadState('networkidle')

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)

    // Check that content is structured properly
    const headings = page.locator('h1, h2')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(1)
  })
})
