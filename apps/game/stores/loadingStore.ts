import { defineStore } from 'pinia'

const LOADING_SAFETY_TIMEOUT_MS = 10_000

let _safetyTimer: ReturnType<typeof setTimeout> | null = null

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    isLoading: false,
    loadingCount: 0,
    progress: 0,
    showProgress: false,
  }),

  actions: {
    showLoading() {
      this.loadingCount += 1
      this.isLoading = true
      this.progress = 0
      this.showProgress = false
      this._startSafetyTimer()
    },

    hideLoading() {
      const newCount = this.loadingCount - 1
      this.loadingCount = newCount <= 0 ? 0 : newCount
      this.isLoading = newCount <= 0 ? false : this.isLoading
      this.progress = newCount <= 0 ? 0 : this.progress
      this.showProgress = newCount <= 0 ? false : this.showProgress

      if (!this.isLoading) {
        this._clearSafetyTimer()
      }
    },

    forceHide() {
      this._clearSafetyTimer()
      this.loadingCount = 0
      this.isLoading = false
      this.progress = 0
      this.showProgress = false
    },

    setProgress(value: number) {
      this.progress = Math.min(100, Math.max(0, value))
      this.showProgress = true
    },

    getState(): {
      isLoading: boolean
      loadingCount: number
      progress: number
      showProgress: boolean
    } {
      return this.$state
    },

    _startSafetyTimer() {
      this._clearSafetyTimer()
      _safetyTimer = setTimeout(() => {
        if (this.isLoading) {
          if (import.meta.dev) {
            console.warn(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
              `[loadingStore] Safety timeout: loading stuck for ${LOADING_SAFETY_TIMEOUT_MS}ms, force-hiding (count was ${this.loadingCount})`
            )
=======
=======
>>>>>>> Stashed changes
              `[loadingStore] Safety timeout: loading stuck for ${LOADING_SAFETY_TIMEOUT_MS}ms, force-hiding (count was ${this.loadingCount})`,
            );
>>>>>>> Stashed changes
          }
          this.forceHide()
        }
      }, LOADING_SAFETY_TIMEOUT_MS)
    },

    _clearSafetyTimer() {
      if (_safetyTimer) {
        clearTimeout(_safetyTimer)
        _safetyTimer = null
      }
    },
  },
})

export const loadingStore = useLoadingStore
