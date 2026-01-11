import { ref } from 'vue'

/**
 * Composable for managing modal state
 * Provides reusable modal logic with Vue 3 Composition API
 */
export function useModal<T = any>(initialState = false) {
  const isOpen = ref(initialState)
  const data = ref<T | null>(null)

  const open = (modalData?: T) => {
    isOpen.value = true
    if (modalData !== undefined) {
      data.value = modalData
    }
  }

  const close = () => {
    isOpen.value = false
    // Clear data after transition
    setTimeout(() => {
      data.value = null
    }, 300)
  }

  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  }
}

/**
 * Composable for managing multiple modals
 */
export function useModals<T extends string>(modalNames: T[]) {
  // Create a simple object to store modals with proper typing
  const modals = {} as Record<T, ReturnType<typeof useModal>>

  // Initialize all modals
  modalNames.forEach((name) => {
    modals[name] = useModal()
  })

  const openModal = <D = any>(name: T, data?: D) => {
    if (modals[name]) {
      modals[name].open(data)
    }
  }

  const closeModal = (name: T) => {
    if (modals[name]) {
      modals[name].close()
    }
  }

  const closeAll = () => {
    modalNames.forEach((name) => {
      if (modals[name]) {
        modals[name].close()
      }
    })
  }

  return {
    modals,
    openModal,
    closeModal,
    closeAll,
  }
}
