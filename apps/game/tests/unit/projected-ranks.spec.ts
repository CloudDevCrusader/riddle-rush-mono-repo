import { describe, it, expect } from 'vitest'
import orderBy from 'lodash-es/orderBy'

/**
 * Mirrors `projectedRanks` in `pages/results/[[gameId]].vue` (orderBy + Map ranks).
 */
interface PlayerForRank {
  id: string
  totalScore: number
}

function computeProjectedRanks(
  players: PlayerForRank[],
  pendingScores: Map<string, number>
): Map<string, number> {
  const ranked = orderBy(
    players.map((p) => ({
      id: p.id,
      projected: p.totalScore + (pendingScores.get(p.id) ?? 0),
    })),
    ['projected'],
    ['desc']
  )

  const ranks = new Map<string, number>()
  ranked.forEach((p, i) => ranks.set(p.id, i + 1))
  return ranks
}

describe('computeProjectedRanks', () => {
  it('ranks by totalScore + pending descending', () => {
    const players: PlayerForRank[] = [
      { id: 'p1', totalScore: 5 },
      { id: 'p2', totalScore: 10 },
      { id: 'p3', totalScore: 3 },
    ]
    const pending = new Map<string, number>([
      ['p1', 2],
      ['p2', 0],
      ['p3', 1],
    ])

    const ranks = computeProjectedRanks(players, pending)

    expect(ranks.get('p2')).toBe(1)
    expect(ranks.get('p1')).toBe(2)
    expect(ranks.get('p3')).toBe(3)
  })

  it('stable order for tied projected scores (lodash orderBy)', () => {
    const players: PlayerForRank[] = [
      { id: 'p1', totalScore: 5 },
      { id: 'p2', totalScore: 3 },
    ]
    const pending = new Map<string, number>([
      ['p1', 0],
      ['p2', 2],
    ])

    const ranks = computeProjectedRanks(players, pending)

    expect(ranks.get('p1')).toBe(1)
    expect(ranks.get('p2')).toBe(2)
  })

  it('handles single player and empty list', () => {
    const solo = computeProjectedRanks([{ id: 'solo', totalScore: 42 }], new Map([['solo', 3]]))
    expect(solo.get('solo')).toBe(1)
    expect(computeProjectedRanks([], new Map()).size).toBe(0)
  })

  it('defaults missing pending to 0 and can reorder by pending', () => {
    const players: PlayerForRank[] = [
      { id: 'p1', totalScore: 10 },
      { id: 'p2', totalScore: 5 },
    ]
    const pending = new Map<string, number>([['p1', 3]])

    const ranks = computeProjectedRanks(players, pending)

    expect(ranks.get('p1')).toBe(1)
    expect(ranks.get('p2')).toBe(2)
  })

  it('pending can flip leader', () => {
    const players: PlayerForRank[] = [
      { id: 'leader', totalScore: 20 },
      { id: 'underdog', totalScore: 5 },
    ]
    const pending = new Map<string, number>([
      ['leader', 0],
      ['underdog', 20],
    ])

    const ranks = computeProjectedRanks(players, pending)

    expect(ranks.get('underdog')).toBe(1)
    expect(ranks.get('leader')).toBe(2)
  })
})
