import { reactive, computed } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
  createdAt: number
}

interface ToastState {
  toasts: Toast[]
}

const state = reactive<ToastState>({
  toasts: [],
})

let toastIdCounter = 0

export function useToast() {
  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`
    const toast: Toast = {
      id,
      message,
      type,
      duration,
      createdAt: Date.now(),
    }

    state.toasts.push(toast)

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id: string) => {
    const index = state.toasts.findIndex((t) => t.id === id)
    if (index !== -1) {
      state.toasts.splice(index, 1)
    }
  }

  const clear = () => {
    state.toasts.splice(0, state.toasts.length)
  }

  const success = (message: string, duration = 3000) => {
    return show(message, 'success', duration)
  }

  const error = (message: string, duration = 4000) => {
    return show(message, 'error', duration)
  }

  const info = (message: string, duration = 3000) => {
    return show(message, 'info', duration)
  }

  const warning = (message: string, duration = 3500) => {
    return show(message, 'warning', duration)
  }

  return {
    toasts: computed(() => state.toasts),
    show,
    remove,
    clear,
    success,
    error,
    info,
    warning,
  }
}
