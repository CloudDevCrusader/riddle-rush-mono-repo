/**
 * Error Sync Plugin
 * Initializes global error handling and synchronization
 */
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp: any) => {
  const runtimeConfig = useRuntimeConfig()
  const { syncErrorLog, setupPeriodicSync } = useErrorSync()

  // Setup periodic sync
  setupPeriodicSync()

  // Global error handler
  if (import.meta.client) {
    window.addEventListener('error', (event: any) => {
      syncErrorLog('error', 'Unhandled error', event.error, {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    window.addEventListener('unhandledrejection', (event: any) => {
      syncErrorLog('error', 'Unhandled promise rejection', event.reason, {
        type: 'unhandled_rejection',
      })
    })

    // Vue error handler
    nuxtApp.vueApp.config.errorHandler = (error: any, instance: any, info: any) => {
      syncErrorLog('error', 'Vue component error', error, {
        type: 'vue_error',
        component: instance?.$options?.name || 'unknown',
        info: info,
      })
    }

    // Pinia error handler
    const pinia = nuxtApp.$pinia
    if (pinia) {
      pinia.use(({ store }: any) => {
        store.$onAction((action: any) => {
          const after = action.after
          action.after = (result: any) => {
            after?.(result)
          }
          const error = action.onError
          action.onError = (error: any) => {
            syncErrorLog('error', `Pinia action error: ${action.name}`, error, {
              type: 'pinia_error',
              store: store.$id,
            })
            error?.(error)
          }
        })
      })
    }
  }

  // Add to nuxtApp for global access
  nuxtApp.provide('errorSync', {
    syncErrorLog,
  })
})

declare module '#app' {
  interface NuxtApp {
    $errorSync: {
      syncErrorLog: (
        level: 'error' | 'warning' | 'info',
        message: string,
        error?: unknown,
        context?: Record<string, unknown>,
      ) => Promise<void>
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $errorSync: {
      syncErrorLog: (
        level: 'error' | 'warning' | 'info',
        message: string,
        error?: unknown,
        context?: Record<string, unknown>,
      ) => Promise<void>
    }
  }
}
