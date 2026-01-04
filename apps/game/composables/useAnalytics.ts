/**
 * Analytics composable for tracking events
 * Uses Google Analytics 4 (manual implementation, compatible with Nuxt 4)
 */
export const useAnalytics = () => {
  const resolveGtag = () => {
    if (!import.meta.client) return null

    // Check for global gtag function (loaded manually in app.vue)
    const globalGtag = (globalThis as { gtag?: (...args: unknown[]) => void }).gtag
    if (typeof globalGtag === 'function') return globalGtag

    // Fallback: check if dataLayer exists and create a wrapper
    const dataLayer = (globalThis as { dataLayer?: unknown[] }).dataLayer
    if (Array.isArray(dataLayer)) {
      return (...args: unknown[]) => {
        dataLayer.push(args)
      }
    }

    return null
  }

  /**
   * Track a custom event
   * @param eventName - Name of the event (e.g., 'game_start', 'answer_correct')
   * @param params - Additional parameters for the event
   */
  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    const gtag = resolveGtag()
    if (!gtag) return
    // Track with Google Analytics
    gtag('event', eventName, params)
  }

  /**
   * Track a page view
   * @param pagePath - Path of the page
   * @param pageTitle - Title of the page
   */
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    const gtag = resolveGtag()
    if (!gtag) return
    // Track with Google Analytics
    gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    })
  }

  /**
   * Track game-specific events
   */
  const trackGameEvent = {
    start: (category?: string) => {
      trackEvent('game_start', { category })
    },
    answerCorrect: (category: string, itemName: string) => {
      trackEvent('answer_correct', { category, item_name: itemName })
    },
    answerIncorrect: (category: string, itemName: string) => {
      trackEvent('answer_incorrect', { category, item_name: itemName })
    },
    gameComplete: (category: string, score: number, duration: number) => {
      trackEvent('game_complete', {
        category,
        score,
        duration_seconds: duration,
      })
    },
    categorySelect: (category: string) => {
      trackEvent('category_select', { category })
    },
    skipItem: (category: string, itemName: string) => {
      trackEvent('skip_item', { category, item_name: itemName })
    },
  }

  return {
    trackEvent,
    trackPageView,
    trackGameEvent,
  }
}
