import { defineStore } from 'pinia'

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
    },

    hideLoading() {
      const newCount = this.loadingCount - 1
      this.loadingCount = newCount <= 0 ? 0 : newCount
      this.isLoading = newCount <= 0 ? false : this.isLoading
      this.progress = newCount <= 0 ? 0 : this.progress
      this.showProgress = newCount <= 0 ? false : this.showProgress
    },

    setProgress(value: number) {
      this.progress = Math.min(100, Math.max(0, value))
      this.showProgress = true
    },
    getState(): any {
      return this
    },
  },
})

export const loadingStore = useLoadingStore
