import { ref, reactive } from 'vue'

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
  // Create initial object with all modal properties
  const initialModals: Record<string, ReturnType<typeof useModal>> = {}
  modalNames.forEach((name) => {
    initialModals[name] = useModal()
  })

  const modals = reactive<Record<T, ReturnType<typeof useModal>>>(initialModals as any)

  const openModal = (name: T, data?: any) => {
    // TypeScript can't guarantee T is a key, but we know it is from initialization

    ;(modals as any)[name].open(data)
  }

  const closeModal = (name: T) => {
    // TypeScript can't guarantee T is a key, but we know it is from initialization

    ;(modals as any)[name].close()
  }

  const closeAll = () => {
    modalNames.forEach((name) => {
      // TypeScript can't guarantee T is a key, but we know it is from initialization

      ;(modals as any)[name].close()
    })
  }

  return {
    // TypeScript can't represent the complex union type, so we use a type assertion

    modals: modals as any,
    openModal,
    closeModal,
    closeAll,
  }
}
