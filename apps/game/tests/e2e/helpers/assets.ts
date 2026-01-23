import type { Page } from '@playwright/test';

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 100;

/**
 * Verify all images on page are loaded
 */
export async function verifyImagesLoaded(
  page: Page,
  timeout: number = DEFAULT_TIMEOUT
): Promise<{ loaded: number; failed: string[] }> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await page.evaluate(() => {
      const images = Array.from(document.images);
      const loaded: string[] = [];
      const failed: string[] = [];

      for (const img of images) {
        // Skip lazy-loaded images that haven't started loading
        if (img.loading === 'lazy' && !img.complete && !img.src) {
          continue;
        }

        if (img.complete && img.naturalWidth > 0) {
          loaded.push(img.src);
        } else if (img.complete && img.naturalWidth === 0) {
          // Image failed to load
          failed.push(img.src || img.dataset.src || 'unknown');
        }
      }

      const pending = images.filter(
        (img) => !img.complete && img.src && img.loading !== 'lazy'
      ).length;

      return { loaded: loaded.length, failed, pending };
    });

    if (result.pending === 0) {
      return { loaded: result.loaded, failed: result.failed };
    }

    await page.waitForTimeout(100);
  }

  // Timeout reached, return current state
  return page.evaluate(() => {
    const images = Array.from(document.images);
    const loaded = images.filter((img) => img.complete && img.naturalWidth > 0);
    const failed = images
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.src || img.dataset.src || 'unknown');

    return { loaded: loaded.length, failed };
  });
}

/**
 * Wait for specific image to load by src
 */
export async function waitForImageLoaded(
  page: Page,
  src: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const isLoaded = await page.evaluate((imgSrc) => {
      const images = Array.from(document.images);
      const img = images.find(
        (i) => i.src === imgSrc || i.src.endsWith(imgSrc) || i.dataset.src === imgSrc
      );

      if (!img) {
        return null; // Image not found in DOM
      }

      if (img.complete && img.naturalWidth > 0) {
        return true;
      }

      if (img.complete && img.naturalWidth === 0) {
        return false; // Failed to load
      }

      return null; // Still loading
    }, src);

    if (isLoaded === true) {
      return true;
    }

    if (isLoaded === false) {
      console.error(`[Assets] Image failed to load: ${src}`);
      return false;
    }

    await page.waitForTimeout(50);
  }

  console.error(`[Assets] Timeout waiting for image: ${src}`);
  return false;
}

/**
 * Verify web font is loaded
 */
export async function verifyFontLoaded(
  page: Page,
  fontFamily: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const isLoaded = await page.evaluate(async (family) => {
      // Check if document.fonts API is available
      if (!document.fonts) {
        // Fallback: assume font is loaded if we can't check
        return true;
      }

      try {
        // Check if font is already loaded
        const fontFaceSet = document.fonts;
        const loaded = fontFaceSet.check(`12px "${family}"`);

        if (loaded) {
          return true;
        }

        // Try to load the font
        await fontFaceSet.load(`12px "${family}"`);
        return fontFaceSet.check(`12px "${family}"`);
      } catch {
        return false;
      }
    }, fontFamily);

    if (isLoaded) {
      return true;
    }

    await page.waitForTimeout(100);
  }

  console.error(`[Assets] Timeout waiting for font: ${fontFamily}`);
  return false;
}

/**
 * Get loading performance metrics using Resource Timing API
 */
export async function getLoadingMetrics(page: Page): Promise<{
  images: { src: string; duration: number; status: 'loaded' | 'failed' }[];
  fonts: { family: string; loaded: boolean }[];
  totalLoadTime: number;
}> {
  return page.evaluate(() => {
    // Get image metrics from Resource Timing API
    const resourceEntries = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    const imageEntries = resourceEntries.filter((entry) => {
      const url = entry.name.toLowerCase();
      return (
        url.endsWith('.png') ||
        url.endsWith('.jpg') ||
        url.endsWith('.jpeg') ||
        url.endsWith('.gif') ||
        url.endsWith('.webp') ||
        url.endsWith('.svg') ||
        entry.initiatorType === 'img'
      );
    });

    // Check actual DOM images for load status
    const domImages = Array.from(document.images);
    const imageStatusMap = new Map<string, 'loaded' | 'failed'>();

    for (const img of domImages) {
      if (img.complete) {
        imageStatusMap.set(
          img.src,
          img.naturalWidth > 0 ? 'loaded' : 'failed'
        );
      }
    }

    const images = imageEntries.map((entry) => ({
      src: entry.name,
      duration: Math.round(entry.responseEnd - entry.startTime),
      status: imageStatusMap.get(entry.name) || ('loaded' as const),
    }));

    // Get font metrics
    const fonts: { family: string; loaded: boolean }[] = [];

    if (document.fonts) {
      const seenFamilies = new Set<string>();

      document.fonts.forEach((fontFace: FontFace) => {
        const family = fontFace.family.replace(/['"]/g, '');
        if (!seenFamilies.has(family)) {
          seenFamilies.add(family);
          fonts.push({
            family,
            loaded: fontFace.status === 'loaded',
          });
        }
      });
    }

    // Calculate total load time
    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    const totalLoadTime = navigationEntry
      ? Math.round(navigationEntry.loadEventEnd - navigationEntry.startTime)
      : 0;

    return { images, fonts, totalLoadTime };
  });
}

/**
 * Wait for all critical game assets (images, fonts, etc.)
 */
export async function waitForCriticalAssets(
  page: Page,
  options?: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  }
): Promise<{ success: boolean; failures: string[] }> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const retries = options?.retries ?? DEFAULT_RETRIES;
  const baseDelay = options?.retryDelay ?? DEFAULT_RETRY_DELAY;

  const failures: string[] = [];
  let attempt = 0;

  while (attempt < retries) {
    const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff: 100ms, 200ms, 400ms

    if (attempt > 0) {
      console.log(
        `[Assets] Retry attempt ${attempt + 1}/${retries} after ${delay}ms delay`
      );
      await page.waitForTimeout(delay);
    }

    // Wait for document to be ready
    await page.waitForLoadState('domcontentloaded');

    // Setup Performance Observer for tracking
    await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      if (!win.__assetLoadTracker) {
        const tracker = {
          images: new Map<string, { startTime: number; loaded: boolean }>(),
          errors: [] as string[],
        };

        // Track image loads via Performance Observer
        if (typeof PerformanceObserver !== 'undefined') {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'resource') {
                const resourceEntry = entry as PerformanceResourceTiming;
                if (
                  resourceEntry.initiatorType === 'img' ||
                  resourceEntry.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
                ) {
                  tracker.images.set(resourceEntry.name, {
                    startTime: resourceEntry.startTime,
                    loaded: true,
                  });
                }
              }
            }
          });

          try {
            observer.observe({ entryTypes: ['resource'] });
          } catch {
            // Observer not supported for this entry type
          }
        }

        // Track image errors
        window.addEventListener(
          'error',
          (event) => {
            const target = event.target as HTMLElement;
            if (target?.tagName === 'IMG') {
              const src =
                (target as HTMLImageElement).src ||
                (target as HTMLImageElement).dataset.src ||
                'unknown';
              tracker.errors.push(src);
            }
          },
          true
        );

        win.__assetLoadTracker = tracker;
      }
    });

    // Verify images
    const imageResult = await verifyImagesLoaded(page, timeout);

    // Verify common game fonts
    const commonFonts = ['Game Font', 'Arial', 'sans-serif'];
    const fontResults = await Promise.all(
      commonFonts.map(async (font) => {
        const loaded = await verifyFontLoaded(page, font, 2000);
        return { font, loaded };
      })
    );

    // Collect failures
    const currentFailures = [
      ...imageResult.failed,
      ...fontResults
        .filter((f) => !f.loaded && f.font !== 'Arial' && f.font !== 'sans-serif')
        .map((f) => `font:${f.font}`),
    ];

    if (currentFailures.length === 0) {
      logDiagnostics(page, 'success', []);
      return { success: true, failures: [] };
    }

    // Try to retry failed images
    if (imageResult.failed.length > 0 && attempt < retries - 1) {
      const stillFailed = await retryFailedImages(page, 1);
      if (stillFailed.length === 0) {
        logDiagnostics(page, 'success after retry', []);
        return { success: true, failures: [] };
      }
    }

    failures.length = 0;
    failures.push(...currentFailures);
    attempt++;
  }

  // Log diagnostics on final failure
  await logDiagnostics(page, 'failure', failures);

  return { success: false, failures };
}

/**
 * Retry loading failed images with exponential backoff
 */
export async function retryFailedImages(
  page: Page,
  maxRetries: number = DEFAULT_RETRIES
): Promise<string[]> {
  let attempt = 0;
  let failedImages: string[] = [];

  while (attempt < maxRetries) {
    const delay = DEFAULT_RETRY_DELAY * Math.pow(2, attempt); // 100ms, 200ms, 400ms

    if (attempt > 0) {
      await page.waitForTimeout(delay);
    }

    failedImages = await page.evaluate(() => {
      const images = Array.from(document.images);
      const failed: string[] = [];

      for (const img of images) {
        // Check if image failed to load
        if (img.complete && img.naturalWidth === 0 && img.src) {
          const originalSrc = img.src;

          // Force reload by resetting src
          img.src = '';
          img.src = originalSrc;

          failed.push(originalSrc);
        }
      }

      return failed;
    });

    if (failedImages.length === 0) {
      return [];
    }

    // Wait for retried images to potentially load
    await page.waitForTimeout(500);

    // Check if any are still failed
    failedImages = await page.evaluate(() => {
      const images = Array.from(document.images);
      return images
        .filter((img) => img.complete && img.naturalWidth === 0 && img.src)
        .map((img) => img.src);
    });

    if (failedImages.length === 0) {
      return [];
    }

    attempt++;
  }

  console.error(`[Assets] Failed images after ${maxRetries} retries:`, failedImages);
  return failedImages;
}

/**
 * Diagnostic helper for debugging asset failures
 */
async function logDiagnostics(
  page: Page,
  status: string,
  failures: string[]
): Promise<void> {
  const metrics = await getLoadingMetrics(page);

  const diagnostics = {
    status,
    timestamp: new Date().toISOString(),
    url: page.url(),
    failures,
    metrics: {
      totalImages: metrics.images.length,
      loadedImages: metrics.images.filter((i) => i.status === 'loaded').length,
      failedImages: metrics.images.filter((i) => i.status === 'failed').length,
      totalFonts: metrics.fonts.length,
      loadedFonts: metrics.fonts.filter((f) => f.loaded).length,
      totalLoadTime: metrics.totalLoadTime,
    },
    slowestImages: metrics.images
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map((i) => ({ src: i.src.split('/').pop(), duration: `${i.duration}ms` })),
  };

  if (status === 'failure') {
    console.error('[Assets] Diagnostics:', JSON.stringify(diagnostics, null, 2));
  } else {
    console.log('[Assets] Diagnostics:', JSON.stringify(diagnostics, null, 2));
  }
}

/**
 * Get detailed asset loading diagnostics for debugging
 */
export async function getAssetDiagnostics(page: Page): Promise<{
  url: string;
  documentReady: boolean;
  images: {
    total: number;
    loaded: number;
    failed: number;
    pending: number;
    details: { src: string; status: string; naturalWidth: number }[];
  };
  fonts: {
    total: number;
    loaded: number;
    details: { family: string; status: string }[];
  };
  resourceTiming: {
    imageCount: number;
    fontCount: number;
    avgImageLoadTime: number;
    slowestResource: { name: string; duration: number } | null;
  };
  errors: string[];
}> {
  return page.evaluate(() => {
    // Image diagnostics
    const images = Array.from(document.images);
    const imageDetails = images.map((img) => {
      let status = 'pending';
      if (img.complete && img.naturalWidth > 0) {
        status = 'loaded';
      } else if (img.complete && img.naturalWidth === 0) {
        status = 'failed';
      } else if (img.loading === 'lazy') {
        status = 'lazy';
      }

      return {
        src: img.src || img.dataset.src || 'unknown',
        status,
        naturalWidth: img.naturalWidth,
      };
    });

    const loadedImages = imageDetails.filter((i) => i.status === 'loaded').length;
    const failedImages = imageDetails.filter((i) => i.status === 'failed').length;
    const pendingImages = imageDetails.filter(
      (i) => i.status === 'pending' || i.status === 'lazy'
    ).length;

    // Font diagnostics
    const fontDetails: { family: string; status: string }[] = [];
    if (document.fonts) {
      const seenFamilies = new Set<string>();
      document.fonts.forEach((fontFace: FontFace) => {
        const family = fontFace.family.replace(/['"]/g, '');
        if (!seenFamilies.has(family)) {
          seenFamilies.add(family);
          fontDetails.push({ family, status: fontFace.status });
        }
      });
    }

    const loadedFonts = fontDetails.filter((f) => f.status === 'loaded').length;

    // Resource timing diagnostics
    const resourceEntries = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    const imageResources = resourceEntries.filter(
      (e) =>
        e.initiatorType === 'img' ||
        e.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
    );

    const fontResources = resourceEntries.filter(
      (e) =>
        e.initiatorType === 'css' ||
        e.name.match(/\.(woff2?|ttf|otf|eot)$/i)
    );

    const avgImageLoadTime =
      imageResources.length > 0
        ? Math.round(
            imageResources.reduce(
              (sum, e) => sum + (e.responseEnd - e.startTime),
              0
            ) / imageResources.length
          )
        : 0;

    const allResources = [...imageResources, ...fontResources];
    const slowestResource =
      allResources.length > 0
        ? allResources.reduce((slowest, current) => {
            const currentDuration = current.responseEnd - current.startTime;
            const slowestDuration = slowest.responseEnd - slowest.startTime;
            return currentDuration > slowestDuration ? current : slowest;
          })
        : null;

    // Get tracked errors
    const win = window as unknown as Record<string, unknown>;
    const tracker = win.__assetLoadTracker as { errors: string[] } | undefined;
    const errors = tracker?.errors || [];

    return {
      url: window.location.href,
      documentReady: document.readyState === 'complete',
      images: {
        total: images.length,
        loaded: loadedImages,
        failed: failedImages,
        pending: pendingImages,
        details: imageDetails,
      },
      fonts: {
        total: fontDetails.length,
        loaded: loadedFonts,
        details: fontDetails,
      },
      resourceTiming: {
        imageCount: imageResources.length,
        fontCount: fontResources.length,
        avgImageLoadTime,
        slowestResource: slowestResource
          ? {
              name: slowestResource.name.split('/').pop() || slowestResource.name,
              duration: Math.round(
                slowestResource.responseEnd - slowestResource.startTime
              ),
            }
          : null,
      },
      errors,
    };
  });
}
