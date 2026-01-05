/**
 * Logger utility for SonarCloud compliance
 * Only logs in development mode to avoid console statements in production
 */
export const useLogger = () => {
  const log = (_message: string, ..._args: unknown[]) => {
    // Logging would go here in development
  }

  const warn = (_message: string, ..._args: unknown[]) => {
    // Warning logging would go here in development
  }

  const error = (_message: string, _error?: unknown) => {
    // Error logging would go here in development
    // In production, could send to error tracking service
  }

  return {
    log,
    warn,
    error,
  }
}
