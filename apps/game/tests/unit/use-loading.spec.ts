import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLoading, useLoadingStore } from '../../composables/useLoading'

describe('useLoadingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should start with loading disabled', () => {
      const store = useLoadingStore()
      expect(store.isLoading).toBe(false)
    })

    it('should start with zero loading count', () => {
      const store = useLoadingStore()
      expect(store.loadingCount).toBe(0)
    })

    it('should start with zero progress', () => {
      const store = useLoadingStore()
      expect(store.progress).toBe(0)
    })

    it('should start with progress hidden', () => {
      const store = useLoadingStore()
      expect(store.showProgress).toBe(false)
    })
  })

  describe('showLoading', () => {
    it('should enable loading', () => {
      const store = useLoadingStore()
      store.showLoading()
      expect(store.isLoading).toBe(true)
    })

    it('should increment loading count', () => {
      const store = useLoadingStore()
      store.showLoading()
      expect(store.loadingCount).toBe(1)
      store.showLoading()
      expect(store.loadingCount).toBe(2)
    })

    it('should reset progress', () => {
      const store = useLoadingStore()
      store.setProgress(50)
      store.showLoading()
      expect(store.progress).toBe(0)
    })

    it('should hide progress indicator', () => {
      const store = useLoadingStore()
      store.setProgress(50)
      store.showLoading()
      expect(store.showProgress).toBe(false)
    })
  })

  describe('hideLoading', () => {
    it('should decrement loading count', () => {
      const store = useLoadingStore()
      store.showLoading()
      store.showLoading()
      expect(store.loadingCount).toBe(2)

      store.hideLoading()
      expect(store.loadingCount).toBe(1)
    })

    it('should disable loading when count reaches zero', () => {
      const store = useLoadingStore()
      store.showLoading()
      store.hideLoading()
      expect(store.isLoading).toBe(false)
    })

    it('should not go below zero', () => {
      const store = useLoadingStore()
      store.hideLoading()
      expect(store.loadingCount).toBe(0)
    })

    it('should keep loading enabled for nested calls', () => {
      const store = useLoadingStore()
      store.showLoading()
      store.showLoading()
      store.hideLoading()
      expect(store.isLoading).toBe(true)
      expect(store.loadingCount).toBe(1)
    })

    it('should reset progress when fully hidden', () => {
      const store = useLoadingStore()
      store.showLoading()
      store.setProgress(75)
      store.hideLoading()
      expect(store.progress).toBe(0)
    })

    it('should hide progress indicator when fully hidden', () => {
      const store = useLoadingStore()
      store.showLoading()
      store.setProgress(75)
      store.hideLoading()
      expect(store.showProgress).toBe(false)
    })
  })

  describe('setProgress', () => {
    it('should set progress value', () => {
      const store = useLoadingStore()
      store.setProgress(50)
      expect(store.progress).toBe(50)
    })

    it('should show progress indicator', () => {
      const store = useLoadingStore()
      store.setProgress(50)
      expect(store.showProgress).toBe(true)
    })

    it('should clamp progress to 0-100 range', () => {
      const store = useLoadingStore()
      store.setProgress(-10)
      expect(store.progress).toBe(0)

      store.setProgress(150)
      expect(store.progress).toBe(100)
    })

    it('should accept boundary values', () => {
      const store = useLoadingStore()
      store.setProgress(0)
      expect(store.progress).toBe(0)

      store.setProgress(100)
      expect(store.progress).toBe(100)
    })

    it('should accept fractional values', () => {
      const store = useLoadingStore()
      store.setProgress(33.33)
      expect(store.progress).toBe(33.33)
    })
  })

  describe('nested loading calls', () => {
    it('should handle multiple show/hide correctly', () => {
      const store = useLoadingStore()

      store.showLoading() // count: 1
      expect(store.isLoading).toBe(true)

      store.showLoading() // count: 2
      expect(store.isLoading).toBe(true)

      store.showLoading() // count: 3
      expect(store.isLoading).toBe(true)

      store.hideLoading() // count: 2
      expect(store.isLoading).toBe(true)

      store.hideLoading() // count: 1
      expect(store.isLoading).toBe(true)

      store.hideLoading() // count: 0
      expect(store.isLoading).toBe(false)
    })
  })
})

describe('useLoading', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('composable wrapper', () => {
    it('should expose computed isLoading', () => {
      const { isLoading, showLoading } = useLoading()
      expect(isLoading.value).toBe(false)

      showLoading()
      expect(isLoading.value).toBe(true)
    })

    it('should expose computed progress', () => {
      const { progress, setProgress } = useLoading()
      expect(progress.value).toBe(0)

      setProgress(60)
      expect(progress.value).toBe(60)
    })

    it('should expose computed showProgress', () => {
      const { showProgress, setProgress } = useLoading()
      expect(showProgress.value).toBe(false)

      setProgress(30)
      expect(showProgress.value).toBe(true)
    })

    it('should expose showLoading method', () => {
      const { isLoading, showLoading } = useLoading()
      showLoading()
      expect(isLoading.value).toBe(true)
    })

    it('should expose hideLoading method', () => {
      const { isLoading, showLoading, hideLoading } = useLoading()
      showLoading()
      hideLoading()
      expect(isLoading.value).toBe(false)
    })

    it('should expose setProgress method', () => {
      const { progress, setProgress } = useLoading()
      setProgress(45)
      expect(progress.value).toBe(45)
    })

    it('should share state across multiple instances', () => {
      const loading1 = useLoading()
      const loading2 = useLoading()

      loading1.showLoading()
      expect(loading2.isLoading.value).toBe(true)

      loading1.setProgress(80)
      expect(loading2.progress.value).toBe(80)
    })
  })
})
