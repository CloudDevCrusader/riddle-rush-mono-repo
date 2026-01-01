/**
 * Mobile-friendly page swipe navigation composable
 * Wraps VueUse's useSwipe for easy page navigation
 */
export function usePageSwipe(options?: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}) {
  const pageElement = ref<HTMLElement | null>(null)

  const {
    isSwiping,
    direction,
    lengthX,
    lengthY,
  } = useSwipe(pageElement, {
    threshold: options?.threshold ?? 50,
    onSwipeEnd: (e, dir) => {
      // Call appropriate callback based on swipe direction
      if (dir === 'left' && options?.onSwipeLeft) {
        options.onSwipeLeft()
      } else if (dir === 'right' && options?.onSwipeRight) {
        options.onSwipeRight()
      } else if (dir === 'up' && options?.onSwipeUp) {
        options.onSwipeUp()
      } else if (dir === 'down' && options?.onSwipeDown) {
        options.onSwipeDown()
      }
    },
  })

  return {
    pageElement,
    isSwiping,
    direction,
    lengthX,
    lengthY,
  }
}
