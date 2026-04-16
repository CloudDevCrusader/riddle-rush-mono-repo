export interface FortuneWheelSegment {
  id: number
  categoryId: number
  categoryKey: string
  categoryName: string
  letter: string
  weight?: number
}

export interface FortuneWheelSelection {
  categoryId: number
  letter: string
}
