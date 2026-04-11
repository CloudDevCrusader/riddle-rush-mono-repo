import { describe, expect, it } from 'vitest'
import type { Category } from '@riddle-rush/types/game'
import { useFortuneWheelSelection } from '../../../composables/useFortuneWheelSelection'

const categories: Category[] = [
  {
    id: 10,
    name: 'Animals',
    searchWord: 'animal',
    key: 'animals',
    searchProvider: 'offline',
  },
  {
    id: 11,
    name: 'Cities',
    searchWord: 'city',
    key: 'cities',
    searchProvider: 'offline',
  },
]

describe('useFortuneWheelSelection', () => {
  it('maps alphabet letters to wheel segments with normalized letters and stable ids', () => {
    const { mapAlphabetToSegments } = useFortuneWheelSelection()
    const segments = mapAlphabetToSegments(['a', ' b ', 'A'])

    expect(segments).toHaveLength(2)
    expect(segments[0]).toMatchObject({
      id: 1,
      letter: 'A',
    })
    expect(segments[1]).toMatchObject({
      id: 2,
      letter: 'B',
    })
  })

  it('rejects invalid category and invalid letter combinations', () => {
    const { validateSelection } = useFortuneWheelSelection()

    expect(validateSelection({ categoryId: 999, letter: 'A' }, categories)).toBeNull()
    expect(validateSelection({ categoryId: 10, letter: 'AB' }, categories)).toBeNull()
    expect(validateSelection({ categoryId: 10, letter: '1' }, categories)).toBeNull()
    expect(validateSelection(null, categories)).toBeNull()
  })

  it('returns normalized uppercase payload for valid selection', () => {
    const { validateSelection } = useFortuneWheelSelection()

    expect(validateSelection({ categoryId: 10, letter: ' z ' }, categories)).toEqual({
      categoryId: 10,
      letter: 'Z',
    })
  })
})
