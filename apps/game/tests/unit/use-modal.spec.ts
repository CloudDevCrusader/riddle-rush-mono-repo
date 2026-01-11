import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useModal, useModals } from '../../composables/useModal'

describe('useModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with closed state by default', () => {
      const modal = useModal()
      expect(modal.isOpen.value).toBe(false)
      expect(modal.data.value).toBeNull()
    })

    it('should initialize with open state when specified', () => {
      const modal = useModal(true)
      expect(modal.isOpen.value).toBe(true)
    })
  })

  describe('open', () => {
    it('should open the modal', () => {
      const modal = useModal()
      modal.open()
      expect(modal.isOpen.value).toBe(true)
    })

    it('should open with data', () => {
      const modal = useModal()
      const testData = { id: 1, name: 'Test' }
      modal.open(testData)

      expect(modal.isOpen.value).toBe(true)
      expect(modal.data.value).toEqual(testData)
    })

    it('should update data when opened multiple times', () => {
      const modal = useModal()
      modal.open({ id: 1 })
      modal.open({ id: 2 })

      expect(modal.data.value).toEqual({ id: 2 })
    })
  })

  describe('close', () => {
    it('should close the modal', () => {
      const modal = useModal(true)
      modal.close()
      expect(modal.isOpen.value).toBe(false)
    })

    it('should clear data after delay', () => {
      const modal = useModal()
      modal.open({ id: 1 })
      modal.close()

      expect(modal.data.value).toEqual({ id: 1 })

      vi.advanceTimersByTime(300)

      expect(modal.data.value).toBeNull()
    })
  })

  describe('toggle', () => {
    it('should toggle modal from closed to open', () => {
      const modal = useModal()
      modal.toggle()
      expect(modal.isOpen.value).toBe(true)
    })

    it('should toggle modal from open to closed', () => {
      const modal = useModal(true)
      modal.toggle()
      expect(modal.isOpen.value).toBe(false)
    })

    it('should toggle multiple times', () => {
      const modal = useModal()
      modal.toggle()
      expect(modal.isOpen.value).toBe(true)
      modal.toggle()
      expect(modal.isOpen.value).toBe(false)
      modal.toggle()
      expect(modal.isOpen.value).toBe(true)
    })
  })

  describe('readonly properties', () => {
    it('should expose readonly isOpen', () => {
      const modal = useModal()
      expect(modal.isOpen.value).toBe(false)
    })

    it('should expose readonly data', () => {
      const modal = useModal()
      modal.open({ test: true })
      expect(modal.data.value).toEqual({ test: true })
    })
  })
})

describe('useModals', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize all modals in closed state', () => {
      const { modals } = useModals(['modal1', 'modal2', 'modal3'])

      expect(modals.modal1).toBeDefined()
      expect(modals.modal2).toBeDefined()
      expect(modals.modal3).toBeDefined()
      expect(modals.modal1.isOpen.value).toBe(false)
      expect(modals.modal2.isOpen.value).toBe(false)
      expect(modals.modal3.isOpen.value).toBe(false)
    })

    it('should handle empty modal list', () => {
      const { modals } = useModals([])
      expect(Object.keys(modals)).toHaveLength(0)
    })
  })

  describe('openModal', () => {
    it('should open a specific modal', () => {
      const { modals, openModal } = useModals(['modal1', 'modal2'])

      openModal('modal1')

      expect(modals.modal1.isOpen.value).toBe(true)
      expect(modals.modal2.isOpen.value).toBe(false)
    })

    it('should open modal with data', () => {
      const { modals, openModal } = useModals(['modal1'])
      const testData = { userId: 123 }

      openModal('modal1', testData)

      expect(modals.modal1.isOpen.value).toBe(true)
      expect(modals.modal1.data.value).toEqual(testData)
    })
  })

  describe('closeModal', () => {
    it('should close a specific modal', () => {
      const { modals, openModal, closeModal } = useModals(['modal1', 'modal2'])

      openModal('modal1')
      openModal('modal2')
      closeModal('modal1')

      expect(modals.modal1.isOpen.value).toBe(false)
      expect(modals.modal2.isOpen.value).toBe(true)
    })
  })

  describe('closeAll', () => {
    it('should close all modals', () => {
      const { modals, openModal, closeAll } = useModals(['modal1', 'modal2', 'modal3'])

      openModal('modal1')
      openModal('modal2')
      openModal('modal3')

      closeAll()

      expect(modals.modal1.isOpen.value).toBe(false)
      expect(modals.modal2.isOpen.value).toBe(false)
      expect(modals.modal3.isOpen.value).toBe(false)
    })

    it('should work when no modals are open', () => {
      const { modals, closeAll } = useModals(['modal1', 'modal2'])

      expect(() => closeAll()).not.toThrow()

      expect(modals.modal1.isOpen.value).toBe(false)
      expect(modals.modal2.isOpen.value).toBe(false)
    })
  })

  describe('multiple modals', () => {
    it('should manage multiple modals independently', () => {
      const { modals, openModal, closeModal } = useModals(['pause', 'settings', 'quit'])

      openModal('pause', { reason: 'user' })
      openModal('settings', { page: 'audio' })

      expect(modals.pause.isOpen.value).toBe(true)
      expect(modals.pause.data.value).toEqual({ reason: 'user' })
      expect(modals.settings.isOpen.value).toBe(true)
      expect(modals.settings.data.value).toEqual({ page: 'audio' })
      expect(modals.quit.isOpen.value).toBe(false)

      closeModal('pause')

      expect(modals.pause.isOpen.value).toBe(false)
      expect(modals.settings.isOpen.value).toBe(true)
    })
  })
})
