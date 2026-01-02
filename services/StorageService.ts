/**
 * Storage Service Layer
 * Abstracts storage operations (IndexedDB, LocalStorage)
 * Provides fallback mechanisms and error handling
 */
export class StorageService {
  private static readonly LOCAL_STORAGE_PREFIX = 'riddle_rush_'

  /**
   * Check if storage is available
   */
  static isStorageAvailable(type: 'localStorage' | 'sessionStorage' = 'localStorage'): boolean {
    try {
      const storage = window[type]
      const test = '__storage_test__'
      storage.setItem(test, test)
      storage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Get item from localStorage with prefix
   */
  static getItem<T = any>(key: string, defaultValue?: T): T | null {
    if (!this.isStorageAvailable()) {
      return defaultValue ?? null
    }

    try {
      const prefixedKey = `${this.LOCAL_STORAGE_PREFIX}${key}`
      const item = localStorage.getItem(prefixedKey)

      if (item === null) {
        return defaultValue ?? null
      }

      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error getting item ${key}:`, error)
      return defaultValue ?? null
    }
  }

  /**
   * Set item to localStorage with prefix
   */
  static setItem<T = any>(key: string, value: T): boolean {
    if (!this.isStorageAvailable()) {
      return false
    }

    try {
      const prefixedKey = `${this.LOCAL_STORAGE_PREFIX}${key}`
      localStorage.setItem(prefixedKey, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error setting item ${key}:`, error)
      return false
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): boolean {
    if (!this.isStorageAvailable()) {
      return false
    }

    try {
      const prefixedKey = `${this.LOCAL_STORAGE_PREFIX}${key}`
      localStorage.removeItem(prefixedKey)
      return true
    } catch (error) {
      console.error(`Error removing item ${key}:`, error)
      return false
    }
  }

  /**
   * Clear all items with prefix
   */
  static clear(): boolean {
    if (!this.isStorageAvailable()) {
      return false
    }

    try {
      const keysToRemove: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.LOCAL_STORAGE_PREFIX)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.error('Error clearing storage:', error)
      return false
    }
  }

  /**
   * Get storage size estimation
   */
  static getStorageSize(): number {
    if (!this.isStorageAvailable()) {
      return 0
    }

    let size = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.LOCAL_STORAGE_PREFIX)) {
        const value = localStorage.getItem(key) ?? ''
        size += key.length + value.length
      }
    }

    return size
  }

  /**
   * Export all data as JSON
   */
  static exportData(): Record<string, any> {
    const data: Record<string, any> = {}

    if (!this.isStorageAvailable()) {
      return data
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.LOCAL_STORAGE_PREFIX)) {
        const cleanKey = key.replace(this.LOCAL_STORAGE_PREFIX, '')
        const value = localStorage.getItem(key)
        if (value) {
          try {
            data[cleanKey] = JSON.parse(value)
          } catch {
            data[cleanKey] = value
          }
        }
      }
    }

    return data
  }

  /**
   * Import data from JSON
   */
  static importData(data: Record<string, any>): boolean {
    if (!this.isStorageAvailable()) {
      return false
    }

    try {
      Object.entries(data).forEach(([key, value]) => {
        this.setItem(key, value)
      })
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}

/**
 * IndexedDB Service
 * Wrapper for IndexedDB operations with promises
 */
export class IndexedDBService {
  private dbName: string
  private version: number

  constructor(dbName: string, version = 1) {
    this.dbName = dbName
    this.version = version
  }

  /**
   * Open database connection
   */
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  /**
   * Check if IndexedDB is available
   */
  static isAvailable(): boolean {
    return typeof indexedDB !== 'undefined'
  }

  /**
   * Get database size estimation
   */
  async getSize(): Promise<number> {
    if (!IndexedDBService.isAvailable()) {
      return 0
    }

    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        return estimate.usage ?? 0
      }
      return 0
    } catch {
      return 0
    }
  }

  /**
   * Clear all data from database
   */
  async clearAll(): Promise<boolean> {
    if (!IndexedDBService.isAvailable()) {
      return false
    }

    try {
      await indexedDB.deleteDatabase(this.dbName)
      return true
    } catch (error) {
      console.error('Error clearing IndexedDB:', error)
      return false
    }
  }
}
