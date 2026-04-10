import type { Category } from '@riddle-rush/types/game'
import type { FortuneWheelSegment, FortuneWheelSelection } from '~/types/fortune-wheel'

const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function normalizeLetter(letter: string): string | null {
  const normalized = letter.trim().toUpperCase()
  return /^[A-Z]$/.test(normalized) ? normalized : null
}

function mapCategoriesToSegments(
  categories: Category[],
  letters: string[] = DEFAULT_ALPHABET
): FortuneWheelSegment[] {
  if (categories.length === 0 || letters.length === 0) return []

  return categories.map((category, index) => {
    const mappedLetter = letters[index % letters.length] ?? 'A'
    return {
      id: index + 1,
      categoryId: category.id,
      categoryKey: category.key,
      categoryName: category.name,
      letter: normalizeLetter(mappedLetter) ?? 'A',
      weight: 1,
    }
  })
}

function validateSelection(
  segment: Partial<FortuneWheelSegment> | null | undefined,
  categories: Category[]
): FortuneWheelSelection | null {
  if (!segment || typeof segment.categoryId !== 'number' || typeof segment.letter !== 'string') {
    return null
  }

  const trustedCategory = categories.find((category) => category.id === segment.categoryId)
  if (!trustedCategory) {
    return null
  }

  const validLetter = normalizeLetter(segment.letter)
  if (!validLetter) {
    return null
  }

  return {
    categoryId: trustedCategory.id,
    letter: validLetter,
  }
}

export function useFortuneWheelSelection() {
  return {
    mapCategoriesToSegments,
    normalizeLetter,
    validateSelection,
  }
}
