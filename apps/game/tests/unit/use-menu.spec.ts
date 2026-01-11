import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock useRoute
const mockRoute = { path: '/' }
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}))

const { useMenu } = await import('../../composables/useMenu')

describe('useMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.path = '/'
  })

  describe('initial state', () => {
    it('should start with menu closed', () => {
      const menu = useMenu()

      expect(menu.isOpen.value).toBe(false)
    })

    it('should start with no active item', () => {
      const menu = useMenu()

      expect(menu.activeItem.value).toBeNull()
    })
  })

  describe('open', () => {
    it('should open the menu', () => {
      const menu = useMenu()

      menu.open()

      expect(menu.isOpen.value).toBe(true)
    })

    it('should keep active item when opening', () => {
      const menu = useMenu()
      menu.setActiveItem('home')

      menu.open()

      expect(menu.activeItem.value).toBe('home')
    })
  })

  describe('close', () => {
    it('should close the menu', () => {
      const menu = useMenu()
      menu.open()

      menu.close()

      expect(menu.isOpen.value).toBe(false)
    })

    it('should clear active item when closing', () => {
      const menu = useMenu()
      menu.setActiveItem('settings')
      menu.open()

      menu.close()

      expect(menu.activeItem.value).toBeNull()
    })
  })

  describe('toggle', () => {
    it('should toggle menu from closed to open', () => {
      const menu = useMenu()

      menu.toggle()

      expect(menu.isOpen.value).toBe(true)
    })

    it('should toggle menu from open to closed', () => {
      const menu = useMenu()
      menu.open()

      menu.toggle()

      expect(menu.isOpen.value).toBe(false)
    })

    it('should toggle multiple times', () => {
      const menu = useMenu()

      menu.toggle() // open
      expect(menu.isOpen.value).toBe(true)

      menu.toggle() // close
      expect(menu.isOpen.value).toBe(false)

      menu.toggle() // open again
      expect(menu.isOpen.value).toBe(true)
    })
  })

  describe('setActiveItem', () => {
    it('should set the active item', () => {
      const menu = useMenu()

      menu.setActiveItem('profile')

      expect(menu.activeItem.value).toBe('profile')
    })

    it('should update active item', () => {
      const menu = useMenu()
      menu.setActiveItem('home')

      menu.setActiveItem('settings')

      expect(menu.activeItem.value).toBe('settings')
    })

    it('should accept different item types', () => {
      const menu = useMenu()

      menu.setActiveItem('item-1')
      expect(menu.activeItem.value).toBe('item-1')

      menu.setActiveItem('another-item')
      expect(menu.activeItem.value).toBe('another-item')
    })
  })

  describe('readonly properties', () => {
    it('should expose isOpen as readonly', () => {
      const menu = useMenu()

      expect(menu.isOpen).toBeDefined()
      // Readonly refs can still be read
      expect(menu.isOpen.value).toBe(false)
    })

    it('should expose activeItem as readonly', () => {
      const menu = useMenu()

      expect(menu.activeItem).toBeDefined()
      expect(menu.activeItem.value).toBeNull()
    })
  })

  describe('return value', () => {
    it('should return all menu methods and properties', () => {
      const menu = useMenu()

      expect(menu).toHaveProperty('isOpen')
      expect(menu).toHaveProperty('activeItem')
      expect(menu).toHaveProperty('open')
      expect(menu).toHaveProperty('close')
      expect(menu).toHaveProperty('toggle')
      expect(menu).toHaveProperty('setActiveItem')
      expect(typeof menu.open).toBe('function')
      expect(typeof menu.close).toBe('function')
      expect(typeof menu.toggle).toBe('function')
      expect(typeof menu.setActiveItem).toBe('function')
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete menu workflow', () => {
      const menu = useMenu()

      // User clicks menu button
      menu.toggle()
      expect(menu.isOpen.value).toBe(true)

      // User selects an item
      menu.setActiveItem('profile')
      expect(menu.activeItem.value).toBe('profile')

      // User closes menu
      menu.close()
      expect(menu.isOpen.value).toBe(false)
      expect(menu.activeItem.value).toBeNull()
    })

    it('should handle rapid toggling', () => {
      const menu = useMenu()

      for (let i = 0; i < 10; i++) {
        menu.toggle()
      }

      // After even number of toggles, should be closed
      expect(menu.isOpen.value).toBe(false)
    })
  })
})
