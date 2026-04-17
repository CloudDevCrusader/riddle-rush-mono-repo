/**
 * Error Sync Plugin
 * Initializes global error handling and synchronization
 */

export default defineNuxtPlugin((nuxtApp: any) => {
  const { syncErrorLog, setupPeriodicSync } = useErrorSync();

  // Setup periodic sync
  setupPeriodicSync();

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
      });

      // Log detailed error information
      if (event.error) {
        console.error('[Runtime Error Handler] Error details:', {
          name: event.error.name,
          message: event.error.message,
          stack: event.error.stack,
        });
      }

      syncErrorLog('error', 'Unhandled error', event.error, {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      console.error('[Runtime Error Handler] Unhandled promise rejection:', {
        reason: event.reason,
        timestamp: new Date().toISOString(),
      });

      if (event.reason instanceof Error) {
        console.error('[Runtime Error Handler] Rejection error details:', {
          name: event.reason.name,
          message: event.reason.message,
          stack: event.reason.stack,
        });
      }

      syncErrorLog('error', 'Unhandled promise rejection', event.reason, {
        type: 'unhandled_rejection',
        message: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
      });
    });

    // Vue error handler — log loudly in dev (syncErrorLog no-ops unless DEBUG_ERROR_SYNC)
    const vueErrorHandler = nuxtApp.vueApp.config.errorHandler;
    nuxtApp.vueApp.config.errorHandler = (error: unknown, instance: unknown, info: string) => {
      if (import.meta.dev) {
        const tag =
          instance && typeof instance === 'object' && '$options' in instance
            ? (instance as { $options?: { name?: string } }).$options?.name || 'Anonymous'
            : 'unknown';
        console.error(`[Vue error] ${info} (component: ${tag})`, error);
        if (error instanceof Error && error.stack) {
          console.error(error.stack);
        }
      }

      void syncErrorLog('error', 'Vue component error', error, {
        type: 'vue_error',
        component:
          instance && typeof instance === 'object' && '$options' in instance
            ? (instance as { $options?: { name?: string } }).$options?.name || 'unknown'
            : 'unknown',
        info,
      });

      if (typeof vueErrorHandler === 'function') {
        vueErrorHandler(error, instance, info);
      }
    };
  }

  // Add to nuxtApp for global access
  nuxtApp.provide('errorSync', {
    syncErrorLog,
  });
});
