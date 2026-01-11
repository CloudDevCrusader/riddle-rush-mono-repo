import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock useSwipe from @vueuse/core
const mockUseSwipe = vi.fn()
vi.mock('@vueuse/core', () => ({
  useSwipe: mockUseSwipe,
}))

const { usePageSwipe } = await import('../../composables/usePageSwipe')

describe('usePageSwipe', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default useSwipe mock implementation
    mockUseSwipe.mockReturnValue({
      isSwiping: { value: false },
      direction: { value: 'none' },
      lengthX: { value: 0 },
      lengthY: { value: 0 },
    })
  })

  describe('initialization', () => {
    it('should initialize with default options', () => {
      usePageSwipe()

      expect(mockUseSwipe).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          threshold: 50,
          onSwipeEnd: expect.any(Function),
        })
      )
    })

    it('should use custom threshold when provided', () => {
      usePageSwipe({ threshold: 100 })

      expect(mockUseSwipe).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          threshold: 100,
        })
      )
    })

    it('should initialize without callbacks', () => {
      const result = usePageSwipe()

      expect(result).toHaveProperty('pageElement')
      expect(result).toHaveProperty('isSwiping')
      expect(result).toHaveProperty('direction')
      expect(result).toHaveProperty('lengthX')
      expect(result).toHaveProperty('lengthY')
    })
  })

  describe('swipe callbacks', () => {
    it('should call onSwipeLeft when swiping left', () => {
      const onSwipeLeft = vi.fn()
      let swipeEndCallback: (e: Event, dir: string) => void

      mockUseSwipe.mockImplementation((el, options) => {
        swipeEndCallback = options.onSwipeEnd
        return {
          isSwiping: ref(false),
          direction: ref('left'),
          lengthX: ref(100),
          lengthY: ref(0),
        }
      })

      usePageSwipe({ onSwipeLeft })

      // Simulate swipe end
      swipeEndCallback!(new Event('touchend'), 'left')

      expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    })

    it('should call onSwipeRight when swiping right', () => {
      const onSwipeRight = vi.fn()
      let swipeEndCallback: (e: Event, dir: string) => void

      mockUseSwipe.mockImplementation((el, options) => {
        swipeEndCallback = options.onSwipeEnd
        return {
          isSwiping: ref(false),
          direction: ref('right'),
          lengthX: ref(-100),
          lengthY: ref(0),
        }
      })

      usePageSwipe({ onSwipeRight })

      swipeEndCallback!(new Event('touchend'), 'right')

      expect(onSwipeRight).toHaveBeenCalledTimes(1)
    })

    it('should call onSwipeUp when swiping up', () => {
      const onSwipeUp = vi.fn()
      let swipeEndCallback: (e: Event, dir: string) => void

      mockUseSwipe.mockImplementation((el, options) => {
        swipeEndCallback = options.onSwipeEnd
        return {
          isSwiping: ref(false),
          direction: ref('up'),
          lengthX: ref(0),
          lengthY: ref(100),
        }
      })

      usePageSwipe({ onSwipeUp })

      swipeEndCallback!(new Event('touchend'), 'up')

      expect(onSwipeUp).toHaveBeenCalledTimes(1)
    })

    it('should call onSwipeDown when swiping down', () => {
      const onSwipeDown = vi.fn()
      let swipeEndCallback: (e: Event, dir: string) => void

      mockUseSwipe.mockImplementation((el, options) => {
        swipeEndCallback = options.onSwipeEnd
        return {
          isSwiping: ref(false),
          direction: ref('down'),
          lengthX: ref(0),
          lengthY: ref(-100),
        }
      })

      usePageSwipe({ onSwipeDown })

      swipeEndCallback!(new Event('touchend'), 'down')

      expect(onSwipeDown).toHaveBeenCalledTimes(1)
    })

    it('should not call callbacks when direction does not match', () => {
      const onSwipeLeft = vi.fn()
      const onSwipeRight = vi.fn()
      let swipeEndCallback: (e: Event, dir: string) => void

      mockUseSwipe.mockImplementation((el, options) => {
        swipeEndCallback = options.onSwipeEnd
        return {
          isSwiping: ref(false),
          direction: ref('up'),
          lengthX: ref(0),
          lengthY: ref(100),
        }
      })

      usePageSwipe({ onSwipeLeft, onSwipeRight })

      swipeEndCallback!(new Event('touchend'), 'up')

      expect(onSwipeLeft).not.toHaveBeenCalled()
      expect(onSwipeRight).not.toHaveBeenCalled()
    })

    it('should not throw when callback is not provided', () => {
      let swipeEndCallback: (e: Event, dir: string) => void

      mockUseSwipe.mockImplementation((el, options) => {
        swipeEndCallback = options.onSwipeEnd
        return {
          isSwiping: ref(false),
          direction: ref('left'),
          lengthX: ref(100),
          lengthY: ref(0),
        }
      })

      usePageSwipe()

      expect(() => {
        swipeEndCallback!(new Event('touchend'), 'left')
      }).not.toThrow()
    })
  })

  describe('return values', () => {
    it('should return pageElement ref', () => {
      const result = usePageSwipe()

      expect(result.pageElement).toBeDefined()
      expect(result.pageElement.value).toBeNull()
    })

    it('should return isSwiping from useSwipe', () => {
      const mockIsSwiping = { value: true }
      mockUseSwipe.mockReturnValue({
        isSwiping: mockIsSwiping,
        direction: ref('none'),
        lengthX: ref(0),
        lengthY: ref(0),
      })

      const result = usePageSwipe()

      expect(result.isSwiping.value).toBe(true)
    })

    it('should return direction from useSwipe', () => {
      const mockDirection = { value: 'left' }
      mockUseSwipe.mockReturnValue({
        isSwiping: ref(false),
        direction: mockDirection,
        lengthX: ref(100),
        lengthY: ref(0),
      })

      const result = usePageSwipe()

      expect(result.direction.value).toBe('left')
    })

    it('should return lengthX from useSwipe', () => {
      const mockLengthX = { value: 150 }
      mockUseSwipe.mockReturnValue({
        isSwiping: ref(false),
        direction: ref('left'),
        lengthX: mockLengthX,
        lengthY: ref(0),
      })

      const result = usePageSwipe()

      expect(result.lengthX.value).toBe(150)
    })

    it('should return lengthY from useSwipe', () => {
      const mockLengthY = { value: 200 }
      mockUseSwipe.mockReturnValue({
        isSwiping: ref(false),
        direction: ref('up'),
        lengthX: ref(0),
        lengthY: mockLengthY,
      })

      const result = usePageSwipe()

      expect(result.lengthY.value).toBe(200)
    })
  })

  describe('multiple callbacks', () => {
    it('should support all callbacks at once', () => {
      const callbacks = {
        onSwipeLeft: vi.fn(),
        onSwipeRight: vi.fn(),
        onSwipeUp: vi.fn(),
        onSwipeDown: vi.fn(),
      }

      let swipeEndCallback: (e: Event, dir: string) => void

      mockUseSwipe.mockImplementation((el, options) => {
        swipeEndCallback = options.onSwipeEnd
        return {
          isSwiping: ref(false),
          direction: ref('none'),
          lengthX: ref(0),
          lengthY: ref(0),
        }
      })

      usePageSwipe(callbacks)

      // Test each direction
      swipeEndCallback!(new Event('touchend'), 'left')
      expect(callbacks.onSwipeLeft).toHaveBeenCalledTimes(1)

      swipeEndCallback!(new Event('touchend'), 'right')
      expect(callbacks.onSwipeRight).toHaveBeenCalledTimes(1)

      swipeEndCallback!(new Event('touchend'), 'up')
      expect(callbacks.onSwipeUp).toHaveBeenCalledTimes(1)

      swipeEndCallback!(new Event('touchend'), 'down')
      expect(callbacks.onSwipeDown).toHaveBeenCalledTimes(1)
    })
  })
})
