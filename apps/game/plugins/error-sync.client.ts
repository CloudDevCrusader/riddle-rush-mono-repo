/**
 * Error Sync Plugin
 * Initializes global error handling and synchronization
 */
import type { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp: any) => {
  const { syncErrorLog, setupPeriodicSync } = useErrorSync()

  // Setup periodic sync
  setupPeriodicSync()

  // Global error handler with detailed logging
  if (import.meta.client) {
    window.addEventListener('error', (event: ErrorEvent) => {
      console.error('[Runtime Error Handler] Global error caught:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      })

      // Log detailed error information
      if (event.error) {
        console.error('[Runtime Error Handler] Error details:', {
          name: event.error.name,
          message: event.error.message,
          stack: event.error.stack,
        })
      }

      syncErrorLog('error', 'Unhandled error', event.error, {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message,
        stack: event.error?.stack,
      })
    })

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      console.error('[Runtime Error Handler] Unhandled promise rejection:', {
        reason: event.reason,
        timestamp: new Date().toISOString(),
      })

      if (event.reason instanceof Error) {
        console.error('[Runtime Error Handler] Rejection error details:', {
          name: event.reason.name,
          message: event.reason.message,
          stack: event.reason.stack,
        })
      }

      syncErrorLog('error', 'Unhandled promise rejection', event.reason, {
        type: 'unhandled_rejection',
        message: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
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
