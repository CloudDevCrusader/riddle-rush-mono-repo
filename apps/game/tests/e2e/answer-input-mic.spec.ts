import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';
import { applyE2EGameSettings, startGameWithDefaults } from './helpers/game-flow';

interface FakeSpeechRecognition {
  emit: (transcript: string) => void;
}

interface FakeSpeechWindow extends Window {
  __fakeSR__?: FakeSpeechRecognition;
}

/**
 * Install a deterministic stub for the Web Speech API before any app scripts run.
 * Exposes `window.__fakeSR__.emit(transcript)` so the test can feed results through
 * @vueuse/core's useSpeechRecognition pipeline without needing real microphone access.
 */
async function stubSpeechRecognition(page: Page): Promise<void> {
  await page.addInitScript(() => {
    interface FakeResult {
      transcript: string;
      confidence: number;
    }

    class FakeSpeechRecognitionImpl {
      public lang = 'en-US';
      public continuous = false;
      public interimResults = false;
      public maxAlternatives = 1;
      public onresult: ((event: unknown) => void) | null = null;
      public onend: (() => void) | null = null;
      public onstart: (() => void) | null = null;
      public onerror: ((event: unknown) => void) | null = null;
      public onaudiostart: (() => void) | null = null;
      public onaudioend: (() => void) | null = null;
      public onsoundstart: (() => void) | null = null;
      public onsoundend: (() => void) | null = null;
      public onspeechstart: (() => void) | null = null;
      public onspeechend: (() => void) | null = null;
      public onnomatch: (() => void) | null = null;

      start(): void {
        queueMicrotask(() => this.onstart?.());
        (window as FakeSpeechWindow).__fakeSR__ = {
          emit: (transcript: string) => {
            const results: FakeResult[][] = [[{ transcript, confidence: 1 }]];
            this.onresult?.({ resultIndex: 0, results });
          },
        };
      }

      stop(): void {
        queueMicrotask(() => this.onend?.());
      }

      abort(): void {
        this.stop();
      }

      addEventListener(): void {}
      removeEventListener(): void {}
      dispatchEvent(): boolean {
        return true;
      }
    }

    type SpeechWindow = Window & {
      SpeechRecognition?: typeof FakeSpeechRecognitionImpl;
      webkitSpeechRecognition?: typeof FakeSpeechRecognitionImpl;
    };

    const win = window as SpeechWindow;
    win.SpeechRecognition = FakeSpeechRecognitionImpl;
    win.webkitSpeechRecognition = FakeSpeechRecognitionImpl;
  });
}

async function enableAnswerInputFlag(page: Page): Promise<void> {
  await applyE2EGameSettings(page, { answerInputEnabled: true });
}

test.describe('Answer input — microphone button', () => {
  test('is hidden while answer-input feature flag is off', async ({ page }) => {
    await stubSpeechRecognition(page);
    await startGameWithDefaults(page);

    // Flag default is off → typed answer form is replaced with the verbal-turn button.
    await expect(page.locator('[data-testid="game-answer-input"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="game-mic-button"]')).toHaveCount(0);
  });

  test('appears when flag is on and speech recognition is supported', async ({ page }) => {
    await stubSpeechRecognition(page);
    await startGameWithDefaults(page);
    await enableAnswerInputFlag(page);

    const mic = page.locator('[data-testid="game-mic-button"]');
    await expect(mic).toBeVisible({ timeout: 5000 });
    await expect(mic).toHaveAttribute('aria-pressed', 'false');
  });

  test('toggles aria-pressed when clicked and populates the answer via transcript', async ({
    page,
  }) => {
    await stubSpeechRecognition(page);
    await startGameWithDefaults(page);
    await enableAnswerInputFlag(page);

    const mic = page.locator('[data-testid="game-mic-button"]');
    const input = page.locator('[data-testid="game-answer-input"]');

    await expect(mic).toBeVisible({ timeout: 5000 });
    await mic.click();
    await expect(mic).toHaveAttribute('aria-pressed', 'true');

    // Feed a transcript through the stubbed recognizer.
    await page.evaluate(() => {
      (window as FakeSpeechWindow).__fakeSR__?.emit('Apfel');
    });
    await expect(input).toHaveValue('Apfel');

    await mic.click();
    await expect(mic).toHaveAttribute('aria-pressed', 'false');
  });

  test('strips disallowed characters from a dictated transcript', async ({ page }) => {
    await stubSpeechRecognition(page);
    await startGameWithDefaults(page);
    await enableAnswerInputFlag(page);

    const mic = page.locator('[data-testid="game-mic-button"]');
    const input = page.locator('[data-testid="game-answer-input"]');

    await expect(mic).toBeVisible({ timeout: 5000 });
    await mic.click();

    await page.evaluate(() => {
      (window as FakeSpeechWindow).__fakeSR__?.emit('<script>alert(1)</script>Banana');
    });

    // sanitizeInput() strips < and > and caps length at 50 — same contract as typed input.
    const value = await input.inputValue();
    expect(value).not.toContain('<');
    expect(value).not.toContain('>');
    expect(value.length).toBeLessThanOrEqual(50);
    expect(value).toContain('Banana');
  });
});
