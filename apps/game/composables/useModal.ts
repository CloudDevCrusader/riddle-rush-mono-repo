/**
 * Composable for managing modal state
 * Provides reusable modal logic with Vue 3 Composition API
 */
export function useModal<T = unknown>(initialState = false) {
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
    }
    else {
      open()
    }
  }

  return {
    isOpen: readonly(isOpen),
    data: readonly(data),
    open,
    close,
    toggle,
  }
}

/**
 * Composable for managing multiple modals
 */
export function useModals<T extends string>(modalNames: T[]) {
  const modals = reactive({} as Record<T, ReturnType<typeof useModal>>)
  const modalMap = modals as Record<T, ReturnType<typeof useModal>>

  modalNames.forEach((name) => {
    modalMap[name] = useModal()
  })

  const openModal = <D = unknown>(name: T, modalData?: D) => {
    modalMap[name].open(modalData)
  }

  const closeModal = (name: T) => {
    modalMap[name].close()
  }

  const closeAll = () => {
    modalNames.forEach((name) => {
      modalMap[name].close()
    })
  }

  return {
    modals: readonly(modals),
    openModal,
    closeModal,
    closeAll,
  }
}
