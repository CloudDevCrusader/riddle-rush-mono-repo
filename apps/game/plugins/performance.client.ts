/**
 * Performance monitoring plugin
 * Automatically tracks key performance metrics throughout the app lifecycle
 */

/** Dev-only: log when a Nuxt page swap takes longer than this (client-side route). */
const SLOW_PAGE_TRANSITION_MS = 500;

/** Dev-only: log full document navigation when total time exceeds this (cold load / hard refresh). */
const SLOW_DOCUMENT_LOAD_MS = 2500;

export default defineNuxtPlugin((nuxtApp) => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const { mark, measure, measureFn, logReport, isSupported } = usePerformance()
  const { log } = useLogger()
=======
  const { mark, measure, measureFn, logReport, isSupported, getNavigationTiming } = usePerformance();
  const { log, warn } = useLogger();
>>>>>>> Stashed changes
=======
  const { mark, measure, measureFn, logReport, isSupported, getNavigationTiming } = usePerformance();
  const { log, warn } = useLogger();
>>>>>>> Stashed changes

  if (!isSupported) {
    log('Performance API not supported')
    return
  }

  // Mark app initialization
  mark('app-init')

  // Measure app mount time
  nuxtApp.hook('app:mounted', () => {
<<<<<<< Updated upstream
    measure('app-init')
    log('App mounted')
  })
=======
    measure('app-init');
    log('App mounted');

    if (import.meta.dev) {
      const nav = getNavigationTiming();
      if (nav && nav.totalTime >= SLOW_DOCUMENT_LOAD_MS) {
        warn('[slow-initial-load] Full document load exceeded threshold', {
          totalMs: Math.round(nav.totalTime),
          thresholdMs: SLOW_DOCUMENT_LOAD_MS,
          domProcessingMs: Math.round(nav.domProcessing),
          requestMs: Math.round(nav.request),
        });
      }
    }
  });
>>>>>>> Stashed changes

  // Measure page transitions
  nuxtApp.hook('page:start', () => {
    mark('page-transition')
  })

  nuxtApp.hook('page:finish', () => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    measure('page-transition')
  })
=======
=======
>>>>>>> Stashed changes
    const durationMs = measure('page-transition');
    if (import.meta.dev && durationMs != null && durationMs >= SLOW_PAGE_TRANSITION_MS) {
      const router = useRouter();
      warn('[slow-page] Page transition exceeded threshold', {
        durationMs: Math.round(durationMs),
        thresholdMs: SLOW_PAGE_TRANSITION_MS,
        path: router.currentRoute.value.fullPath,
      });
    }
  });
>>>>>>> Stashed changes

  // Measure Vue component rendering
  nuxtApp.hook('vue:setup', () => {
    mark('vue-setup')
  })

  nuxtApp.hook('app:rendered', () => {
    measure('vue-setup')
  })

  // Log performance report in development on app error
  if (process.env.NODE_ENV === 'development') {
    nuxtApp.hook('app:error', () => {
      logReport()
    })

    // Expose performance utils globally in development
    if (import.meta.client) {
      ;(window as any).__performance__ = {
        mark,
        measure,
        measureFn,
        logReport,
      }
      log('Performance tools available at window.__performance__')
    }
  }

  // Provide performance utilities to the app
  return {
    provide: {
      perf: {
        mark,
        measure,
        measureFn,
        logReport,
      },
    },
  }
})
