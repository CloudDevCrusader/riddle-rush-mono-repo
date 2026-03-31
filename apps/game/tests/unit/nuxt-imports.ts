type AnyFn = (...args: any[]) => any

const getGlobal = <T>(key: string, fallback: T): T => {
  const value = (globalThis as Record<string, unknown>)[key]
  return (value as T) ?? fallback
}

// Mock implementations for Vue reactive functions in test environment
export const ref = <T>(initialValue: T) => {
  const value = { current: initialValue }
  return {
    get value(): T {
      return value.current
    },
    set value(newValue: T) {
      value.current = newValue
    },
  }
}

export const computed = <T>(getter: () => T) => {
  const currentValue = getter()
  return {
    get value(): T {
      // Call the getter every time to get current store state
      return getter()
    },
  }
}

export const reactive = <T extends object>(target: T): T => {
  return { ...target }
}

export const onScopeDispose = (fn: () => void) => {
  // In test environment, just call the function immediately
  fn()
}

export const useRuntimeConfig = () => {
  const globalFn = getGlobal<AnyFn | undefined>('useRuntimeConfig', undefined)
  return typeof globalFn === 'function' ? globalFn() : { public: {} }
}

export const useRoute = () => {
  const globalFn = getGlobal<AnyFn | undefined>('useRoute', undefined)
  return typeof globalFn === 'function' ? globalFn() : { path: '/', params: {}, query: {} }
}

export const useRouter = () => {
  const globalFn = getGlobal<AnyFn | undefined>('useRouter', undefined)
  return typeof globalFn === 'function'
    ? globalFn()
    : { push: () => Promise.resolve(), replace: () => Promise.resolve(), back: () => {} }
}

export const useNuxtApp = () => {
  const globalFn = getGlobal<AnyFn | undefined>('useNuxtApp', undefined)
  return typeof globalFn === 'function' ? globalFn() : { $i18n: { t: (key: string) => key } }
}

export const useI18n = () => {
  const globalFn = getGlobal<AnyFn | undefined>('useI18n', undefined)
  if (typeof globalFn === 'function') return globalFn()

  return {
    t: (key: string, fallback?: string | Record<string, unknown>) =>
      typeof fallback === 'string' ? fallback : key,
  }
}
