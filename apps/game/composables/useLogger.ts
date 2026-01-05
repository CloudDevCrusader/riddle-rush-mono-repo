/**
 * Structured logging utility for the game application
 * Provides consistent logging with levels and context
 */
/* eslint-disable no-console */
export const useLogger = () => {
  // Import runtime config dynamically to avoid issues in test environment
  const runtimeConfig =
    typeof useRuntimeConfig !== 'undefined'
      ? useRuntimeConfig()
      : {
          public: {
            environment: process.env.NODE_ENV || 'development',
            appVersion: process.env.APP_VERSION || '1.0.0',
            debugErrorSync: false,
          },
        }

  // Import error sync dynamically
  const { syncErrorLog } =
    typeof useErrorSync !== 'undefined'
      ? useErrorSync()
      : {
          syncErrorLog: async () => {},
        }

  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'

  const log = (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[LOG] ${message}`, ...args)
    }
    // In production, we don't log regular messages to avoid performance impact
  }

  const warn = (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args)
    }
    // In production, we could send warnings to monitoring
    if (isProduction) {
      syncErrorLog('warning', message, ...args)
    }
  }

  const error = (message: string, error?: unknown, context: Record<string, unknown> = {}) => {
    const errorContext = {
      timestamp: new Date().toISOString(),
      environment: runtimeConfig.public.environment,
      appVersion: runtimeConfig.public.appVersion,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    }

    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error, errorContext)
    }

    // Always sync errors in production and development for debugging
    syncErrorLog('error', message, error, errorContext)
  }

  const debug = (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  const info = (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  return {
    log,
    warn,
    error,
    debug,
    info,
  }
}
