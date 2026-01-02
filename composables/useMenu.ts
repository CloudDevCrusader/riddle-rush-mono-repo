/**
 * Composable for managing menu state and navigation
 * Uses Vue 3 Composition API for reactive state management
 */
export function useMenu() {
  const isOpen = ref(false)
  const activeItem = ref<string | null>(null)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    activeItem.value = null
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const setActiveItem = (item: string) => {
    activeItem.value = item
  }

  // Close menu on route change
  const route = useRoute()
  watch(() => route.path, () => {
    close()
  })

  return {
    isOpen: readonly(isOpen),
    activeItem: readonly(activeItem),
    open,
    close,
    toggle,
    setActiveItem,
  }
}
