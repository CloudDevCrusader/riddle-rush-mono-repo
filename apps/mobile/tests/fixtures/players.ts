import type { Player, Category } from '~/utils/index'

export const mockPlayers: Player[] = [
  { id: 'player-1', name: 'Alice', score: 15 },
  { id: 'player-2', name: 'Bob', score: 5 },
  { id: 'player-3', name: 'Carol', score: 10 },
]

export const mockCategories: Category[] = [
  { id: 1, name: 'Animals' },
  { id: 2, name: 'Cities' },
  { id: 3, name: 'Food' },
  { id: 4, name: 'Famous People' },
  { id: 5, name: 'Sports' },
]
