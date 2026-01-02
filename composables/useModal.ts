/**
 * Composable for managing modal state
 * Provides reusable modal logic with Vue 3 Composition API
 */
export function useModal(initialState = false) {
  const isOpen = ref(initialState)
  const data = ref<any>(null)

  const open = (modalData?: any) => {
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
  const modals = reactive<Record<T, ReturnType<typeof useModal>>>({} as any)

  modalNames.forEach((name) => {
    modals[name] = useModal()
  })

  const openModal = (name: T, data?: any) => {
    modals[name].open(data)
  }

  const closeModal = (name: T) => {
    modals[name].close()
  }

  const closeAll = () => {
    modalNames.forEach((name) => {
      modals[name].close()
    })
  }

  return {
    modals: readonly(modals),
    openModal,
    closeModal,
    closeAll,
  }
}
