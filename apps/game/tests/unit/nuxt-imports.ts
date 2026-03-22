import { computed, ref, reactive, onScopeDispose } from '#imports'

type AnyFn = (...args: any[]) => any

const getGlobal = <T>(key: string, fallback: T): T => {
  const value = (globalThis as Record<string, unknown>)[key]
  return (value as T) ?? fallback
}

export { computed, ref, reactive, onScopeDispose }

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
