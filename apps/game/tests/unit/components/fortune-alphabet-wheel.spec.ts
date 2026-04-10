import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FortuneAlphabetWheel from '../../../components/game/FortuneAlphabetWheel.vue'
import type { Category } from '@riddle-rush/types/game'

vi.mock('vue-fortune-wheel', () => ({
  default: {
    name: 'FortuneWheel',
    props: ['prizeId'],
    emits: ['rotateStart', 'rotateEnd'],
    template: '<div data-testid="mock-wheel" />',
  },
}))

const categories: Category[] = [
  {
    id: 1,
    name: 'Animals',
    searchWord: 'animal',
    key: 'animals',
    searchProvider: 'offline',
  },
]

const createWrapper = (props: { categories: Category[]; letters?: string[] }) =>
  mount(FortuneAlphabetWheel, {
    props,
    global: {
      stubs: {
        ClientOnly: {
          template: '<slot />',
        },
        GameButton: {
          template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
          emits: ['click'],
        },
      },
    },
  })

describe('FortuneAlphabetWheel', () => {
  it('renders required fortune wheel test ids', () => {
    const wrapper = createWrapper({ categories })

    expect(wrapper.find('[data-testid="fortune-wheel-container"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="fortune-wheel-spin-button"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="fortune-wheel-selected-category"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="fortune-wheel-selected-letter"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="fortune-wheel-confirm-button"]').exists()).toBe(true)
  })

  it('does not emit selection-ready for invalid segment payload', async () => {
    const wrapper = createWrapper({ categories })

    await wrapper.findComponent({ name: 'FortuneWheel' }).vm.$emit('rotateEnd', { id: 999 })
    await wrapper.find('[data-testid="fortune-wheel-confirm-button"]').trigger('click')

    expect(wrapper.emitted('selection-ready')).toBeFalsy()
  })

  it('emits normalized selection-ready payload exactly once after valid spin completion', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const wrapper = createWrapper({ categories, letters: ['q'] })

    await wrapper.find('[data-testid="fortune-wheel-spin-button"]').trigger('click')
    await wrapper.findComponent({ name: 'FortuneWheel' }).vm.$emit('rotateStart', () => {})
    await wrapper.findComponent({ name: 'FortuneWheel' }).vm.$emit('rotateEnd', { id: 1 })
    await wrapper.find('[data-testid="fortune-wheel-confirm-button"]').trigger('click')

    const emitted = wrapper.emitted('selection-ready')
    expect(emitted).toHaveLength(1)
    expect(emitted?.[0]?.[0]).toEqual({ categoryId: 1, letter: 'Q' })

    randomSpy.mockRestore()
  })
})
