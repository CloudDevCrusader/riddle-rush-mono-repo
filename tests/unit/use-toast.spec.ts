import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToast } from '~/composables/useToast'

describe('useToast', () => {
  let toast: ReturnType<typeof useToast>

  beforeEach(() => {
    toast = useToast()
    toast.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('show', () => {
    it('should add a toast to the list', () => {
      toast.show('Test message', 'info', 3000)

      expect(toast.toasts.value).toHaveLength(1)
      expect(toast.toasts.value[0].message).toBe('Test message')
      expect(toast.toasts.value[0].type).toBe('info')
      expect(toast.toasts.value[0].duration).toBe(3000)
    })

    it('should generate unique IDs for each toast', () => {
      toast.show('Message 1', 'info', 3000)
      toast.show('Message 2', 'success', 3000)

      expect(toast.toasts.value).toHaveLength(2)
      expect(toast.toasts.value[0].id).not.toBe(toast.toasts.value[1].id)
    })

    it('should auto-remove toast after duration', () => {
      toast.show('Test message', 'info', 1000)

      expect(toast.toasts.value).toHaveLength(1)

      vi.advanceTimersByTime(1000)

      expect(toast.toasts.value).toHaveLength(0)
    })

    it('should not auto-remove toast with 0 duration', () => {
      toast.show('Persistent message', 'info', 0)

      expect(toast.toasts.value).toHaveLength(1)

      vi.advanceTimersByTime(10000)

      expect(toast.toasts.value).toHaveLength(1)
    })

    it('should return toast ID', () => {
      const id = toast.show('Test', 'info', 3000)

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
      expect(toast.toasts.value[0].id).toBe(id)
    })
  })

  describe('success', () => {
    it('should add a success toast', () => {
      toast.success('Success message')

      expect(toast.toasts.value).toHaveLength(1)
      expect(toast.toasts.value[0].type).toBe('success')
      expect(toast.toasts.value[0].message).toBe('Success message')
    })

    it('should use default duration of 3000ms', () => {
      toast.success('Success message')

      expect(toast.toasts.value[0].duration).toBe(3000)
    })

    it('should accept custom duration', () => {
      toast.success('Success message', 5000)

      expect(toast.toasts.value[0].duration).toBe(5000)
    })
  })

  describe('error', () => {
    it('should add an error toast', () => {
      toast.error('Error message')

      expect(toast.toasts.value).toHaveLength(1)
      expect(toast.toasts.value[0].type).toBe('error')
      expect(toast.toasts.value[0].message).toBe('Error message')
    })

    it('should use default duration of 4000ms', () => {
      toast.error('Error message')

      expect(toast.toasts.value[0].duration).toBe(4000)
    })

    it('should accept custom duration', () => {
      toast.error('Error message', 6000)

      expect(toast.toasts.value[0].duration).toBe(6000)
    })
  })

  describe('info', () => {
    it('should add an info toast', () => {
      toast.info('Info message')

      expect(toast.toasts.value).toHaveLength(1)
      expect(toast.toasts.value[0].type).toBe('info')
      expect(toast.toasts.value[0].message).toBe('Info message')
    })

    it('should use default duration of 3000ms', () => {
      toast.info('Info message')

      expect(toast.toasts.value[0].duration).toBe(3000)
    })
  })

  describe('warning', () => {
    it('should add a warning toast', () => {
      toast.warning('Warning message')

      expect(toast.toasts.value).toHaveLength(1)
      expect(toast.toasts.value[0].type).toBe('warning')
      expect(toast.toasts.value[0].message).toBe('Warning message')
    })

    it('should use default duration of 3500ms', () => {
      toast.warning('Warning message')

      expect(toast.toasts.value[0].duration).toBe(3500)
    })
  })

  describe('remove', () => {
    it('should remove a specific toast by ID', () => {
      const id1 = toast.show('Message 1', 'info', 0)
      const id2 = toast.show('Message 2', 'info', 0)

      expect(toast.toasts.value).toHaveLength(2)

      toast.remove(id1)

      expect(toast.toasts.value).toHaveLength(1)
      expect(toast.toasts.value[0].id).toBe(id2)
    })

    it('should do nothing if toast ID does not exist', () => {
      toast.show('Message 1', 'info', 0)

      expect(toast.toasts.value).toHaveLength(1)

      toast.remove('non-existent-id')

      expect(toast.toasts.value).toHaveLength(1)
    })
  })

  describe('clear', () => {
    it('should remove all toasts', () => {
      toast.show('Message 1', 'info', 0)
      toast.show('Message 2', 'success', 0)
      toast.show('Message 3', 'error', 0)

      expect(toast.toasts.value).toHaveLength(3)

      toast.clear()

      expect(toast.toasts.value).toHaveLength(0)
    })

    it('should work when no toasts exist', () => {
      expect(toast.toasts.value).toHaveLength(0)

      toast.clear()

      expect(toast.toasts.value).toHaveLength(0)
    })
  })

  describe('multiple toasts', () => {
    it('should handle multiple toasts simultaneously', () => {
      toast.success('Success 1')
      toast.error('Error 1')
      toast.warning('Warning 1')
      toast.info('Info 1')

      expect(toast.toasts.value).toHaveLength(4)
    })

    it('should auto-remove toasts independently', () => {
      toast.show('Fast', 'info', 1000)
      toast.show('Slow', 'info', 3000)

      expect(toast.toasts.value).toHaveLength(2)

      vi.advanceTimersByTime(1000)

      expect(toast.toasts.value).toHaveLength(1)
      expect(toast.toasts.value[0].message).toBe('Slow')

      vi.advanceTimersByTime(2000)

      expect(toast.toasts.value).toHaveLength(0)
    })
  })

  describe('toast properties', () => {
    it('should set createdAt timestamp', () => {
      const now = Date.now()
      toast.show('Test', 'info', 3000)

      expect(toast.toasts.value[0].createdAt).toBeGreaterThanOrEqual(now)
    })

    it('should contain all required properties', () => {
      toast.show('Test', 'success', 2000)

      const toastItem = toast.toasts.value[0]

      expect(toastItem).toHaveProperty('id')
      expect(toastItem).toHaveProperty('message')
      expect(toastItem).toHaveProperty('type')
      expect(toastItem).toHaveProperty('duration')
      expect(toastItem).toHaveProperty('createdAt')
    })
  })
})
