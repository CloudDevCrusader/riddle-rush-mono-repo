/**
 * Analytics composable for tracking events
 * Currently a no-op implementation that can be extended with any analytics solution
 * (Google Analytics, Plausible, Umami, etc.)
 */
export const useAnalytics = () => {
  /**
   * Track a custom event
   * @param eventName - Name of the event (e.g., 'game_start', 'answer_correct')
   * @param params - Additional parameters for the event
   */
  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (import.meta.client) {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[Analytics]', eventName, params)
      }

      // Add your analytics implementation here
      // Example: gtag('event', eventName, params)
      // Example: plausible(eventName, { props: params })
    }
  }

  /**
   * Track a page view
   * @param pagePath - Path of the page
   * @param pageTitle - Title of the page
   */
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (import.meta.client) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[Analytics] Page View:', pagePath, pageTitle)
      }

      // Add your analytics implementation here
    }
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
