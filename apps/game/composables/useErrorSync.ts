/**
 * Error Synchronization Utility
 * Syncs error logs to CloudWatch and other services
 */
/* eslint-disable no-console */

import { openDB } from 'idb'

interface ErrorLog {
  level: 'error' | 'warning' | 'info'
  message: string
  error?: unknown
  context?: Record<string, unknown>
  timestamp: string
  environment: string
  appVersion: string
  url: string
  userAgent: string
}

export const useErrorSync = () => {
  // Import runtime config dynamically to avoid issues in test environment
  const runtimeConfig =
    typeof useRuntimeConfig !== 'undefined'
      ? useRuntimeConfig()
      : {
          public: {
            environment: process.env.NODE_ENV || 'development',
            appVersion: process.env.APP_VERSION || '1.0.0',
            cloudWatchEndpoint: process.env.CLOUDWATCH_ENDPOINT || '',
            cloudWatchApiKey: process.env.CLOUDWATCH_API_KEY || '',
            debugErrorSync: process.env.DEBUG_ERROR_SYNC === 'true',
          },
        }

  const isProduction = process.env.NODE_ENV === 'production'

  /**
   * Sync error logs to CloudWatch via API Gateway
   */
  const syncErrorLog = async (
    level: 'error' | 'warning' | 'info',
    message: string,
    error?: unknown,
    context: Record<string, unknown> = {}
  ) => {
    try {
      // Only sync in production or if explicitly enabled
      if (!isProduction && !runtimeConfig.public.debugErrorSync) {
        return
      }

      const errorLog: ErrorLog = {
        level,
        message,
        error: error ? formatError(error) : undefined,
        context,
        timestamp: new Date().toISOString(),
        environment: runtimeConfig.public.environment,
        appVersion: runtimeConfig.public.appVersion,
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      }

      // Store in IndexedDB for offline sync
      await storeErrorLocally(errorLog)

      // Try to sync immediately if online
      if (navigator.onLine) {
        await syncErrorsToCloudWatch()
      }
    } catch (syncError) {
      console.error('Failed to sync error log:', syncError)
      // If syncing fails, we'll rely on the offline queue
    }
  }

  /**
   * Format error for serialization
   */
  const formatError = (error: unknown): string => {
    if (error instanceof Error) {
      return JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
        // @ts-expect-error - cause property may not exist in all Error types
        cause: error.cause,
      })
    }
    return String(error)
  }

  // Export for testing
  if (process.env.NODE_ENV === 'test') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useErrorSync as any).formatError = formatError
  }

  /**
   * Store error locally for offline sync
   */
  const storeErrorLocally = async (errorLog: ErrorLog) => {
    try {
      const db = await openDB('ErrorLogs', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('errors')) {
            db.createObjectStore('errors', { keyPath: 'timestamp' })
          }
        },
      })

      const tx = db.transaction('errors', 'readwrite')
      const store = tx.store
      await store.put(errorLog)
      await tx.done
    } catch (error) {
      console.error('Failed to store error locally:', error)
      // Fallback to localStorage if IndexedDB fails
      try {
        const existingErrors = JSON.parse(localStorage.getItem('errorLogsQueue') || '[]')
        existingErrors.push(errorLog)
        localStorage.setItem('errorLogsQueue', JSON.stringify(existingErrors))
      } catch (fallbackError) {
        console.error('Failed to store error in localStorage:', fallbackError)
      }
    }
  }

  /**
   * Sync stored errors to CloudWatch
   */
  const syncErrorsToCloudWatch = async () => {
    try {
      // Check if we have errors to sync
      let errorsToSync: ErrorLog[] = []

      // Try IndexedDB first
      try {
        const db = await openDB('ErrorLogs', 1)
        const tx = db.transaction('errors', 'readwrite')
        const store = tx.store
        const allErrors = await store.getAll()

        if (allErrors.length > 0) {
          errorsToSync = allErrors
          // Clear the store after reading
          const clearTx = db.transaction('errors', 'readwrite')
          await clearTx.store.clear()
        }
      } catch (indexedDBError) {
        console.warn('IndexedDB not available, trying localStorage:', indexedDBError)
        // Fallback to localStorage
        const storedErrors = localStorage.getItem('errorLogsQueue')
        if (storedErrors) {
          errorsToSync = JSON.parse(storedErrors)
          localStorage.removeItem('errorLogsQueue')
        }
      }

      if (errorsToSync.length === 0) {
        return
      }

      // Send to CloudWatch via API Gateway
      const cloudWatchEndpoint =
        runtimeConfig.public.cloudWatchEndpoint ||
        'https://your-api-gateway.execute-api.region.amazonaws.com/prod/logs'

      const response = await fetch(cloudWatchEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': runtimeConfig.public.cloudWatchApiKey || '',
        },
        body: JSON.stringify({
          app: 'riddle-rush-pwa',
          environment: runtimeConfig.public.environment,
          version: runtimeConfig.public.appVersion,
          logs: errorsToSync,
        }),
      })

      if (!response.ok) {
        throw new Error(`CloudWatch sync failed: ${response.status} ${response.statusText}`)
      }

      console.log(`Successfully synced ${errorsToSync.length} error logs to CloudWatch`)
    } catch (error) {
      console.error('Failed to sync errors to CloudWatch:', error)
      // Errors will remain in storage and be retried later
    }
  }

  /**
   * Setup periodic sync for offline errors
   */
  const setupPeriodicSync = () => {
    if (typeof window !== 'undefined') {
      // Sync every 5 minutes
      setInterval(syncErrorsToCloudWatch, 5 * 60 * 1000)

      // Sync when coming back online
      window.addEventListener('online', syncErrorsToCloudWatch)

      // Sync on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          syncErrorsToCloudWatch()
        }
      })
    }
  }

  // Initialize periodic sync
  if (isProduction) {
    setupPeriodicSync()
  }

  return {
    syncErrorLog,
    syncErrorsToCloudWatch,
    setupPeriodicSync,
  }
}

export type { ErrorLog }
