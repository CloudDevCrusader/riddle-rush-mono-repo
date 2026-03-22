import { describe, it, expect, beforeEach } from 'vitest'
import { loadingStore } from '../../stores/loadingStore'
import { useLoading } from '../../stores/hooks/useLoading'

describe('loadingStore', () => {
  beforeEach(() => {
    // Reset loading store state
    loadingStore.setState({
      isLoading: false,
      loadingCount: 0,
      progress: 0,
      showProgress: false,
    })
  })

  describe('initial state', () => {
    it('should start with loading disabled', () => {
      const store = loadingStore.getState()
      expect(store.isLoading).toBe(false)
    })

    it('should start with zero loading count', () => {
      const store = loadingStore.getState()
      expect(store.loadingCount).toBe(0)
    })

    it('should start with zero progress', () => {
      const store = loadingStore.getState()
      expect(store.progress).toBe(0)
    })

    it('should start with progress hidden', () => {
      const store = loadingStore.getState()
      expect(store.showProgress).toBe(false)
    })
  })

  describe('showLoading', () => {
    it('should enable loading', () => {
      loadingStore.getState().showLoading()
      expect(loadingStore.getState().isLoading).toBe(true)
    })

    it('should increment loading count', () => {
      loadingStore.getState().showLoading()
      expect(loadingStore.getState().loadingCount).toBe(1)
      loadingStore.getState().showLoading()
      expect(loadingStore.getState().loadingCount).toBe(2)
    })

    it('should reset progress', () => {
      loadingStore.getState().setProgress(50)
      loadingStore.getState().showLoading()
      expect(loadingStore.getState().progress).toBe(0)
    })

    it('should hide progress indicator', () => {
      loadingStore.getState().setProgress(50)
      loadingStore.getState().showLoading()
      expect(loadingStore.getState().showProgress).toBe(false)
    })
  })

  describe('hideLoading', () => {
    it('should decrement loading count', () => {
      loadingStore.getState().showLoading()
      loadingStore.getState().showLoading()
      expect(loadingStore.getState().loadingCount).toBe(2)

      loadingStore.getState().hideLoading()
      expect(loadingStore.getState().loadingCount).toBe(1)
    })

    it('should disable loading when count reaches zero', () => {
      loadingStore.getState().showLoading()
      loadingStore.getState().hideLoading()
      expect(loadingStore.getState().isLoading).toBe(false)
    })

    it('should not go below zero', () => {
      loadingStore.getState().hideLoading()
      expect(loadingStore.getState().loadingCount).toBe(0)
    })

    it('should keep loading enabled for nested calls', () => {
      loadingStore.getState().showLoading()
      loadingStore.getState().showLoading()
      loadingStore.getState().hideLoading()
      expect(loadingStore.getState().isLoading).toBe(true)
      expect(loadingStore.getState().loadingCount).toBe(1)
    })

    it('should reset progress when fully hidden', () => {
      loadingStore.getState().showLoading()
      loadingStore.getState().setProgress(75)
      loadingStore.getState().hideLoading()
      expect(loadingStore.getState().progress).toBe(0)
    })

    it('should hide progress indicator when fully hidden', () => {
      loadingStore.getState().showLoading()
      loadingStore.getState().setProgress(75)
      loadingStore.getState().hideLoading()
      expect(loadingStore.getState().showProgress).toBe(false)
    })
  })

  describe('setProgress', () => {
    it('should set progress value', () => {
      loadingStore.getState().setProgress(50)
      expect(loadingStore.getState().progress).toBe(50)
    })

    it('should show progress indicator', () => {
      loadingStore.getState().setProgress(50)
      expect(loadingStore.getState().showProgress).toBe(true)
    })

    it('should clamp progress to 0-100 range', () => {
      loadingStore.getState().setProgress(-10)
      expect(loadingStore.getState().progress).toBe(0)

      loadingStore.getState().setProgress(150)
      expect(loadingStore.getState().progress).toBe(100)
    })

    it('should accept boundary values', () => {
      loadingStore.getState().setProgress(0)
      expect(loadingStore.getState().progress).toBe(0)

      loadingStore.getState().setProgress(100)
      expect(loadingStore.getState().progress).toBe(100)
    })

    it('should accept fractional values', () => {
      loadingStore.getState().setProgress(33.33)
      expect(loadingStore.getState().progress).toBe(33.33)
    })
  })

  describe('nested loading calls', () => {
    it('should handle multiple show/hide correctly', () => {
      loadingStore.getState().showLoading() // count: 1
      expect(loadingStore.getState().isLoading).toBe(true)

      loadingStore.getState().showLoading() // count: 2
      expect(loadingStore.getState().isLoading).toBe(true)

      loadingStore.getState().showLoading() // count: 3
      expect(loadingStore.getState().isLoading).toBe(true)

      loadingStore.getState().hideLoading() // count: 2
      expect(loadingStore.getState().isLoading).toBe(true)

      loadingStore.getState().hideLoading() // count: 1
      expect(loadingStore.getState().isLoading).toBe(true)

      loadingStore.getState().hideLoading() // count: 0
      expect(loadingStore.getState().isLoading).toBe(false)
    })
  })
})

describe('useLoading', () => {
  beforeEach(() => {
    // Reset loading store state
    loadingStore.setState({
      isLoading: false,
      loadingCount: 0,
      progress: 0,
      showProgress: false,
    })
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
