/** Category row / chip before the wheel resolves a pick (round-start). */
export const FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_LABEL = '-'
export const FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_EMOJI = '*'

/** One wedge on the alphabet fortune wheel (letter only). */
export interface AlphabetWheelSegment {
  id: number
  letter: string
  weight?: number
}

export interface FortuneWheelSelection {
  categoryId: number
  letter: string
}

/** Live category line state for parents that render the category outside the wheel. */
export interface FortuneWheelCategoryDisplay {
  categoryId: number | null
  label: string
  isSpinning: boolean
  landedPulse: boolean
}
