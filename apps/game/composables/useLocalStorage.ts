import { useLogger } from './useLogger'

/**
 * localStorage utility composable
 * Provides type-safe localStorage access with consistent error handling
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const logger = useLogger()

  const get = (): T => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    }
    catch (e) {
      logger.warn(`Failed to load from localStorage (${key}):`, e)
      return defaultValue
    }
  }

  const set = (value: T): void => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    }
    catch (e) {
      logger.warn(`Failed to save to localStorage (${key}):`, e)
    }
  }

  const remove = (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }

  return { get, set, remove }
}
