/**
 * Error Sync Plugin
 * Initializes global error handling and synchronization
 */
import type { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp: any) => {
  const { syncErrorLog, setupPeriodicSync } = useErrorSync()

  // Setup periodic sync
  setupPeriodicSync()

  // Global error handler
  if (import.meta.client) {
    window.addEventListener('error', (event: ErrorEvent) => {
      syncErrorLog('error', 'Unhandled error', event.error, {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      syncErrorLog('error', 'Unhandled promise rejection', event.reason, {
        type: 'unhandled_rejection',
      })
    })

    // Vue error handler
    nuxtApp.vueApp.config.errorHandler = (error: unknown, instance: any, info: string) => {
      syncErrorLog('error', 'Vue component error', error, {
        type: 'vue_error',
        component: instance?.$options?.name || 'unknown',
        info,
      })
    }

    // Pinia error handler
    const pinia = nuxtApp.$pinia as Pinia
    if (pinia) {
      pinia.use(({ store }: { store: any }) => {
        store.$onAction((action: any) => {
          const after = action.after
          action.after = (result: unknown) => {
            after?.(result)
          }
          const onError = action.onError
          action.onError = (err: unknown) => {
            syncErrorLog('error', `Pinia action error: ${action.name}`, err, {
              type: 'pinia_error',
              store: store.$id,
            })
            onError?.(err)
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
