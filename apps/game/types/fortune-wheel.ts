<<<<<<< Updated upstream
export interface FortuneWheelSegment {
  id: number
  categoryId: number
  categoryKey: string
  categoryName: string
=======
/** Category row / chip before the wheel resolves a pick (round-start). */
export const FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_LABEL = '-';
export const FORTUNE_WHEEL_CATEGORY_PLACEHOLDER_EMOJI = '*';

/** One wedge on the alphabet fortune wheel (letter only). */
export interface AlphabetWheelSegment {
  id: number
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  letter: string
  weight?: number
}

export interface FortuneWheelSelection {
  categoryId: number
  letter: string
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
}

/** Live category line state for parents that render the category outside the wheel. */
export interface FortuneWheelCategoryDisplay {
  categoryId: number | null
  label: string
  isSpinning: boolean
  landedPulse: boolean
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}
