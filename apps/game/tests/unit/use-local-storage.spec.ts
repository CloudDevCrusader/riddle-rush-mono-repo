import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLocalStorage } from '../../composables/useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      Reflect.deleteProperty(store, key)
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  describe('get', () => {
    it('should return default value when key does not exist', () => {
      const { get } = useLocalStorage('test-key', { count: 0 })
      expect(get()).toEqual({ count: 0 })
    })

    it('should return stored value when key exists', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ count: 5 }))

      const { get } = useLocalStorage('test-key', { count: 0 })
      expect(get()).toEqual({ count: 5 })
    })

    it('should parse JSON correctly', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ name: 'Test', active: true }))

      const { get } = useLocalStorage('test-key', { name: '', active: false })
      expect(get()).toEqual({ name: 'Test', active: true })
    })

    it('should handle string values', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify('hello'))

      const { get } = useLocalStorage('test-key', 'default')
      expect(get()).toBe('hello')
    })

    it('should handle number values', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(42))

      const { get } = useLocalStorage('test-key', 0)
      expect(get()).toBe(42)
    })

    it('should handle boolean values', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(true))

      const { get } = useLocalStorage('test-key', false)
      expect(get()).toBe(true)
    })

    it('should handle array values', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([1, 2, 3]))

      const { get } = useLocalStorage('test-key', [] as number[])
      expect(get()).toEqual([1, 2, 3])
    })

    it('should return default value on parse error', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json')

      const { get } = useLocalStorage('test-key', { count: 0 })
      expect(get()).toEqual({ count: 0 })
    })

    it('should return default value when localStorage throws', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })

      const { get } = useLocalStorage('test-key', { count: 0 })
      expect(get()).toEqual({ count: 0 })
    })

    it('should return default value in SSR context', () => {
      const originalWindow = global.window
      // @ts-expect-error - Testing SSR context
      delete global.window

      const { get } = useLocalStorage('test-key', { count: 0 })
      expect(get()).toEqual({ count: 0 })

      global.window = originalWindow
    })
  })

  describe('set', () => {
    it('should save value to localStorage', () => {
      const { set } = useLocalStorage('test-key', { count: 0 })
      set({ count: 10 })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({ count: 10 })
      )
    })

    it('should stringify objects', () => {
      const { set } = useLocalStorage('test-key', { name: '', age: 0 })
      set({ name: 'Alice', age: 30 })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', '{"name":"Alice","age":30}')
    })

    it('should handle string values', () => {
      const { set } = useLocalStorage('test-key', '')
      set('hello world')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', '"hello world"')
    })

    it('should handle number values', () => {
      const { set } = useLocalStorage('test-key', 0)
      set(123)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', '123')
    })

    it('should handle null values', () => {
      const { set } = useLocalStorage('test-key', null)
      set(null)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', 'null')
    })

    it('should not throw when localStorage fails', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full')
      })

      const { set } = useLocalStorage('test-key', { count: 0 })
      expect(() => set({ count: 5 })).not.toThrow()
    })

    it('should do nothing in SSR context', () => {
      const originalWindow = global.window
      // @ts-expect-error - Testing SSR context
      delete global.window

      const { set } = useLocalStorage('test-key', { count: 0 })
      set({ count: 5 })

      expect(localStorageMock.setItem).not.toHaveBeenCalled()

      global.window = originalWindow
    })
  })

  describe('remove', () => {
    it('should remove item from localStorage', () => {
      const { remove } = useLocalStorage('test-key', { count: 0 })
      remove()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should do nothing in SSR context', () => {
      const originalWindow = global.window
      // @ts-expect-error - Testing SSR context
      delete global.window

      const { remove } = useLocalStorage('test-key', { count: 0 })
      remove()

      expect(localStorageMock.removeItem).not.toHaveBeenCalled()

      global.window = originalWindow
    })
  })

  describe('integration', () => {
    it('should set and get values', () => {
      const storage = useLocalStorage('integration-test', { value: 0 })

      storage.set({ value: 42 })
      const result = storage.get()

      expect(result).toEqual({ value: 42 })
    })

    it('should handle multiple instances with same key', () => {
      const storage1 = useLocalStorage('shared-key', 0)
      const storage2 = useLocalStorage('shared-key', 0)

      storage1.set(100)

      // Both instances should read the same value
      expect(storage2.get()).toBe(100)
    })

    it('should handle set-remove-get cycle', () => {
      const storage = useLocalStorage('cycle-test', { active: false })

      storage.set({ active: true })
      storage.remove()
      const result = storage.get()

      expect(result).toEqual({ active: false })
    })
  })
})
