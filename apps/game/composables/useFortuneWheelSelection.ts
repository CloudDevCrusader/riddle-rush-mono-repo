import type { Category } from '@riddle-rush/types/game'
import type { AlphabetWheelSegment, FortuneWheelSelection } from '~/types/fortune-wheel'

const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function normalizeLetter(letter: string): string | null {
  const normalized = letter.trim().toUpperCase()
  return /^[A-Z]$/.test(normalized) ? normalized : null
}

/**
 * Map a letter list to wheel wedges (ids 1…n). Invalid letters are skipped.
 */
function mapAlphabetToSegments(letters: string[] = DEFAULT_ALPHABET): AlphabetWheelSegment[] {
  if (letters.length === 0) return []

  const seen = new Set<string>()
  const segments: AlphabetWheelSegment[] = []
  let id = 1

  for (const raw of letters) {
    const letter = normalizeLetter(raw)
    if (!letter || seen.has(letter)) continue
    seen.add(letter)
    segments.push({ id: id++, letter, weight: 1 })
  }

  return segments
}

function validateSelection(
  segment: { categoryId?: number; letter?: string } | null | undefined,
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
    mapAlphabetToSegments,
    normalizeLetter,
    validateSelection,
  }
}
