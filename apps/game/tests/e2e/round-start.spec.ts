import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';
import {
  applyE2EGameSettings,
  completeFortuneWheel,
  setupMultiplayerGame,
} from './helpers/game-flow';

test.setTimeout(120000);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Window with exposed Pinia stores for E2E testing. */
interface PiniaWindow extends Window {
  __pinia_stores__?: {
    game?: { clearSession?: () => void; pendingPlayerNames?: string[] };
    settings?: { fortuneWheelAllowRedraw: boolean };
  };
}

async function resetPersistedGameState(page: Page) {
  await page.goto('/players');
  await expect(page).toHaveURL(/\/players/);
  await page.evaluate(() => {
    indexedDB.deleteDatabase('riddle-rush-db');
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page).toHaveURL(/\/players/);
}

async function startGameFromPlayers(page: Page) {
  await setupMultiplayerGame(page, ['Player 1', 'Player 2'], false);
  await expect(page).toHaveURL(/\/round-start/, { timeout: 30000 });

  // Wait for any global loading overlay to clear (it blocks pointer events)
  await page
    .locator('.global-loading-overlay')
    .waitFor({ state: 'hidden', timeout: 15000 })
    .catch(() => {});
  // Dev/HMR often prevents networkidle from settling on mobile projects.
  await page.waitForLoadState('load');
}

/** Set the fortuneWheelAllowRedraw setting via the Pinia settings store. */
async function setAllowRedraw(page: Page, value: boolean) {
  await applyE2EGameSettings(page, { fortuneWheelAllowRedraw: value });
}

// ---------------------------------------------------------------------------
// Round-start page UI and back navigation
// ---------------------------------------------------------------------------

test.describe('round-start page', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page);
    await startGameFromPlayers(page);
  });

  test('round-start has no back control (use system or pause flow elsewhere)', async ({ page }) => {
    await expect(page.locator('[data-testid="round-start-back-button"]')).toHaveCount(0);
  });

  test('shows wheel UI with correct initial state', async ({ page }) => {
    const wheelContainer = page.locator('[data-testid="fortune-wheel-container"]');

    await expect(wheelContainer).toBeVisible({ timeout: 8000 });
    await expect(page.locator('[data-testid="fortune-wheel-spin-button"]')).toBeVisible();

    // Category row in parent (round-start strip) shows placeholder
    const categoryRow = page.locator('[data-testid="round-start-category-row"]');
    await expect(categoryRow).toBeVisible({ timeout: 8000 });
    await expect(page.locator('[data-testid="fortune-wheel-selected-category"]')).toHaveText('-', {
      timeout: 8000,
    });

    // Inline category chip on wheel card shows placeholder emoji (*) and label (-)
    const inlineCategory = page.locator('[data-testid="fortune-wheel-inline-category"]');
    await expect(inlineCategory).toBeVisible();
    await expect(inlineCategory).toContainText('-');
    await expect(inlineCategory).toContainText('*');
  });
});

// ---------------------------------------------------------------------------
// Fortune wheel modes: respin (allowRedraw=true) vs auto-advance (allowRedraw=false)
// ---------------------------------------------------------------------------

test.describe('fortune wheel respin mode (allowRedraw=true)', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page);
    await startGameFromPlayers(page);
    await setAllowRedraw(page, true);
  });

  test('spin button and OK button are both visible', async ({ page }) => {
    await expect(page.locator('[data-testid="fortune-wheel-spin-button"]')).toBeVisible({
      timeout: 8000,
    });
    await expect(page.locator('[data-testid="fortune-wheel-confirm-button"]')).toBeVisible();
  });

  test('can respin and then OK navigates to game', async ({ page }) => {
    const spinButton = page.locator('[data-testid="fortune-wheel-spin-button"]');
    const confirmButton = page.locator('[data-testid="fortune-wheel-confirm-button"]');
    const selectedLetter = page.locator('[data-testid="fortune-wheel-selected-letter"]');

    await expect(spinButton).toBeVisible({ timeout: 8000 });

    // Categories must load before the wheel accepts spins (spin stays disabled otherwise).
    await expect
      .poll(async () => spinButton.isDisabled().catch(() => true), { timeout: 15000 })
      .toBe(false);

    // Hub shows "?" until a validated selection lands; OK is disabled while spinning or
    // when there is no pendingSelection — poll on OK + letter, retrying spin if the canvas
    // swallowed the first tap (common on mobile emulation).
    await expect
      .poll(
        async () => {
          if (!(await confirmButton.isDisabled().catch(() => true))) {
            const letterText = (await selectedLetter.textContent().catch(() => ''))?.trim() ?? '';
            return /^[A-Z]$/.test(letterText);
          }
          await spinButton.click({ force: true }).catch(() => {});
          return false;
        },
        { timeout: 45000, intervals: [400, 800, 1500, 2500, 4000] }
      )
      .toBe(true);

    // Verify we can respin: spin button should be enabled again
    await expect
      .poll(async () => spinButton.isDisabled().catch(() => true), { timeout: 10000 })
      .toBe(false);

    // Second spin (respin): click, then wait for confirm to go disabled (spin started)
    await spinButton.click({ force: true });
    await expect
      .poll(async () => confirmButton.isDisabled().catch(() => false), {
        timeout: 5000,
        intervals: [200, 300, 500],
      })
      .toBe(true);

    // Wait for respin to complete (confirm re-enabled)
    await expect
      .poll(async () => confirmButton.isDisabled().catch(() => true), { timeout: 30000 })
      .toBe(false);

    // Click OK → navigates to game
    await confirmButton.click();
    await expect(page).toHaveURL(/\/game/, { timeout: 35000 });
  });
});

test.describe('fortune wheel auto-advance mode (allowRedraw=false)', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page);
    await startGameFromPlayers(page);
    await setAllowRedraw(page, false);
  });

  test('spin and confirm buttons are both hidden when redraw is disabled', async ({ page }) => {
    await expect(page.locator('[data-testid="fortune-wheel-spin-button"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="fortune-wheel-confirm-button"]')).toHaveCount(0);
  });

  test('wheel auto-spins and navigates to game without any user interaction', async ({ page }) => {
    // No clicks — the wheel should auto-start and auto-advance once allowRedraw=false.
    await expect(page).toHaveURL(/\/game/, { timeout: 45000 });
  });
});

// ---------------------------------------------------------------------------
// Round counter logic
// ---------------------------------------------------------------------------

test.describe('Round Counter Logic', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page);
  });

  test('should display round 1 on game screen after first wheel completion', async ({ page }) => {
    await startGameFromPlayers(page);
    await completeFortuneWheel(page);
    await expect(page).toHaveURL(/\/game\//, { timeout: 35000 });
    await expect(page.locator('[data-testid="game-round-indicator"]')).toContainText('1');
  });

  test('page refresh should not increment round counter', async ({ page }) => {
    await startGameFromPlayers(page);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/round-start/);
    await completeFortuneWheel(page);
    await expect(page).toHaveURL(/\/game\//, { timeout: 35000 });
    await expect(page.locator('[data-testid="game-round-indicator"]')).toContainText('1');
  });

  test('navigating back to round-start during active game should not increment round', async ({
    page,
  }) => {
    await startGameFromPlayers(page);

    await completeFortuneWheel(page);
    await expect(page).toHaveURL(/\/game\//, { timeout: 35000 });

    const gameUrl = page.url();

    await page.goto('/round-start');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/round-start/);

    await page.goto(gameUrl);
    await expect(page).toHaveURL(new RegExp(gameUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page.locator('[data-testid="game-round-indicator"]')).toContainText('1');
  });
});
