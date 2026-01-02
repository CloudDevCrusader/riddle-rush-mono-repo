/**
 * Logger utility for SonarCloud compliance
 * Only logs in development mode to avoid console statements in production
 */
export const useLogger = () => {
  const isDev = import.meta.dev

  const log = (message: string, ...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(message, ...args)
    }
  }

  const warn = (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(message, ...args)
    }
  }

  const error = (message: string, error?: unknown) => {
    if (isDev) {
      console.error(message, error)
    }
    // In production, could send to error tracking service
  }

  return {
    log,
    warn,
    error,
  }
}
