/**
 * Performance monitoring plugin
 * Automatically tracks key performance metrics throughout the app lifecycle
 */

export default defineNuxtPlugin((nuxtApp) => {
  const { mark, measure, measureFn, logReport, isSupported } = usePerformance()
  const { log } = useLogger()

  if (!isSupported) {
    log('Performance API not supported')
    return
  }

  // Mark app initialization
  mark('app-init')

  // Measure app mount time
  nuxtApp.hook('app:mounted', () => {
    measure('app-init')
    log('App mounted')
  })

  // Measure page transitions
  nuxtApp.hook('page:start', () => {
    mark('page-transition')
  })

  nuxtApp.hook('page:finish', () => {
    measure('page-transition')
  })

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
