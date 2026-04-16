import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';
import { generatePlayerName } from './helpers/faker';
import {
  assignScores,
  confirmScoresAndWaitForModal,
  finishGame,
  goToNextRound,
  navigateToResults,
  setupMultiplayerGame,
  startGameWithDefaults,
  submitPlayerAnswers,
} from './helpers/game-flow';

// ---------------------------------------------------------------------------
// Reload tracker — counts load events per named phase and logs a summary
// ---------------------------------------------------------------------------

interface ReloadEvent {
  phase: string;
  timestamp: number;
  url: string;
}

class ReloadTracker {
  private events: ReloadEvent[] = [];
  private currentPhase = 'init';
  private listener: (() => void) | null = null;

  constructor(private page: Page) {}

  /** Start listening for load events. */
  start(): void {
    this.listener = () => {
      this.events.push({
        phase: this.currentPhase,
        timestamp: Date.now(),
        url: this.page.url(),
      });
    };
    this.page.on('load', this.listener);
  }

  /** Label the current phase so reload events are attributed correctly. */
  setPhase(name: string): void {
    this.currentPhase = name;
  }

  /** Total number of load events recorded. */
  get totalReloads(): number {
    return this.events.length;
  }

  /** Number of load events in the current (or a given) phase. */
  reloadsInPhase(phase?: string): number {
    const target = phase ?? this.currentPhase;
    return this.events.filter((e) => e.phase === target).length;
  }

  /** Reset the counter — call after a legitimate navigation. */
  reset(): void {
    this.events = [];
  }

  /** Log a summary to stdout (visible in Playwright test output). */
  logSummary(label: string): void {
    if (this.events.length === 0) {
      console.log(`[ReloadTracker] ${label}: 0 reloads — OK`);
      return;
    }
    console.log(`[ReloadTracker] ${label}: ${this.events.length} reload(s) detected!`);
    for (const event of this.events) {
      console.log(`  └─ phase="${event.phase}" url="${event.url}" at ${new Date(event.timestamp).toISOString()}`);
    }
  }

  /** Stop listening. */
  dispose(): void {
    if (this.listener) {
      this.page.removeListener('load', this.listener);
      this.listener = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Sentinel helpers
// ---------------------------------------------------------------------------

type SentinelWindow = Window & { __E2E_RELOAD_SENTINEL__?: number };

async function injectReloadSentinel(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as SentinelWindow).__E2E_RELOAD_SENTINEL__ = Date.now();
  });
}

async function isSentinelAlive(page: Page): Promise<boolean> {
  return page.evaluate(
    () => typeof (window as SentinelWindow).__E2E_RELOAD_SENTINEL__ === 'number',
  );
}

/**
 * Assert that no unexpected reload happened.
 * Combines sentinel + tracker check and logs the reload count.
 */
async function expectNoReload(page: Page, tracker: ReloadTracker, label: string): Promise<void> {
  const alive = await isSentinelAlive(page);
  const reloads = tracker.reloadsInPhase();
  tracker.logSummary(label);
  expect(alive, `Sentinel lost during "${label}" — page reloaded`).toBe(true);
  expect(reloads, `${reloads} unexpected reload(s) during "${label}"`).toBe(0);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Page Stability — No Unexpected Reloads', () => {
  test('game page should not reload during single-round gameplay', async ({ page }) => {
    await startGameWithDefaults(page);

    const tracker = new ReloadTracker(page);
    tracker.start();
    await injectReloadSentinel(page);

    // --- gameplay phase ---
    tracker.setPhase('player-submissions');
    await submitPlayerAnswers(page, 2);
    await expectNoReload(page, tracker, 'after player submissions');

    // --- results navigation (legitimate) ---
    await navigateToResults(page);
    await injectReloadSentinel(page);
    tracker.reset();

    // --- scoring phase ---
    tracker.setPhase('scoring');
    await assignScores(page, [2, 1]);
    await expectNoReload(page, tracker, 'after scoring');

    tracker.setPhase('confirm-scores');
    await confirmScoresAndWaitForModal(page);
    await expectNoReload(page, tracker, 'after confirm scores');

    tracker.logSummary('single-round final');
    tracker.dispose();
  });

  test('game page should not reload during multi-round gameplay', async ({ page }) => {
    test.slow();

    const players = ['Player 1', generatePlayerName(), generatePlayerName()];
    await setupMultiplayerGame(page, players);

    const tracker = new ReloadTracker(page);
    tracker.start();
    await injectReloadSentinel(page);

    // ===== ROUND 1 =====
    tracker.setPhase('round-1-submissions');
    await submitPlayerAnswers(page, 3);
    await expectNoReload(page, tracker, 'round 1 submissions');

    await navigateToResults(page);
    await injectReloadSentinel(page);
    tracker.reset();

    tracker.setPhase('round-1-scoring');
    await assignScores(page, [1, 2, 1]);
    await expectNoReload(page, tracker, 'round 1 scoring');

    tracker.setPhase('round-1-confirm');
    await confirmScoresAndWaitForModal(page);
    await expectNoReload(page, tracker, 'round 1 confirm');

    // Next round — legitimate navigation
    await goToNextRound(page);
    await injectReloadSentinel(page);
    tracker.reset();

    // ===== ROUND 2 =====
    tracker.setPhase('round-2-submissions');
    await submitPlayerAnswers(page, 3);
    await expectNoReload(page, tracker, 'round 2 submissions');

    await navigateToResults(page);
    await injectReloadSentinel(page);
    tracker.reset();

    tracker.setPhase('round-2-scoring');
    await assignScores(page, [2, 1, 3]);
    await expectNoReload(page, tracker, 'round 2 scoring');

    tracker.setPhase('round-2-confirm');
    await confirmScoresAndWaitForModal(page);
    await expectNoReload(page, tracker, 'round 2 confirm');

    // Finish → leaderboard (legitimate navigation)
    await finishGame(page);
    await injectReloadSentinel(page);
    tracker.reset();

    tracker.setPhase('leaderboard');
    const leaderboard = page.locator('[data-testid="leaderboard-container"]');
    await expect(leaderboard).toBeVisible({ timeout: 10000 });
    await expectNoReload(page, tracker, 'leaderboard');

    tracker.logSummary('multi-round final');
    tracker.dispose();
  });

  test('game page should remain stable during idle period', async ({ page }) => {
    await startGameWithDefaults(page);

    const tracker = new ReloadTracker(page);
    tracker.start();
    tracker.setPhase('idle');
    await injectReloadSentinel(page);

    // Sit idle for 10 seconds, checking every 2 seconds
    const checkIntervalMs = 2000;
    const checks = 5;

    for (let i = 1; i <= checks; i++) {
      await page.waitForTimeout(checkIntervalMs);
      await expectNoReload(page, tracker, `idle check ${i}/${checks}`);
    }

    // Verify the game UI is still interactive
    const roundIndicator = page.locator('[data-testid="game-round-indicator"]');
    await expect(roundIndicator).toBeVisible();
    const pauseBtn = page.locator('[data-testid="game-pause-button"]');
    await expect(pauseBtn).toBeVisible();

    tracker.logSummary('idle final');
    tracker.dispose();
  });

  test('game page should not reload when interacting with UI controls', async ({ page }) => {
    await startGameWithDefaults(page);

    const tracker = new ReloadTracker(page);
    tracker.start();
    await injectReloadSentinel(page);

    // --- pause modal ---
    tracker.setPhase('pause-modal');
    const pauseBtn = page.locator('[data-testid="game-pause-button"]');
    await pauseBtn.click();
    await page.waitForTimeout(500);

    const resumeBtn = page.locator(
      '[data-testid="pause-resume-button"], [data-testid="pause-modal-close"]',
    );
    if (await resumeBtn.first().isVisible().catch(() => false)) {
      await resumeBtn.first().click();
      await page.waitForTimeout(500);
    }
    await expectNoReload(page, tracker, 'pause modal open/close');

    // --- answer input ---
    tracker.setPhase('answer-input');
    const answerInput = page.locator('[data-testid="game-answer-input"]');
    if (await answerInput.isVisible().catch(() => false)) {
      await answerInput.fill('test answer');
      await page.waitForTimeout(300);
      await answerInput.clear();
      await page.waitForTimeout(300);
      await expectNoReload(page, tracker, 'answer input fill/clear');
    }

    // --- final UI check ---
    tracker.setPhase('final-check');
    const submitBtn = page
      .locator('[data-testid="game-submit-button"], [data-testid="game-verbal-turn-done"]')
      .first();
    await expect(submitBtn).toBeVisible();
    await expectNoReload(page, tracker, 'UI controls final');

    tracker.logSummary('UI controls final');
    tracker.dispose();
  });
});
