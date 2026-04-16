import { describe, it, expect } from 'vitest'

/**
 * Tests for the projected ranks computation logic used in the scoring page.
 * This is the pure function extracted from pages/results/[[gameId]].vue
 */

interface PlayerForRank {
  id: string
  totalScore: number
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
  /** Included in totalScore until pending replaces it (see assignPlayerScore). */
  currentRoundScore?: number
>>>>>>> Stashed changes
=======
  /** Included in totalScore until pending replaces it (see assignPlayerScore). */
  currentRoundScore?: number
>>>>>>> Stashed changes
}

function computeProjectedRanks(
  players: PlayerForRank[],
  pendingScores: Map<string, number>,
): Map<string, number> {
<<<<<<< Updated upstream
  const ranked = [...players]
    .map((p) => ({
      id: p.id,
      projected: p.totalScore + (pendingScores.get(p.id) ?? 0),
    }))
    .sort((a, b) => b.projected - a.projected)
=======
  const ranked = orderBy(
    players.map(p => ({
      id: p.id,
      projected: p.totalScore - (p.currentRoundScore ?? 0) + (pendingScores.get(p.id) ?? 0),
    })),
    ['projected'],
    ['desc'],
  );
>>>>>>> Stashed changes

  const ranks = new Map<string, number>()
  ranked.forEach((p, i) => ranks.set(p.id, i + 1))
  return ranks
}

describe('computeProjectedRanks', () => {
  it('should rank players by totalScore + pendingScore descending', () => {
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

    // p2: 10+0=10 → #1, p1: 5+2=7 → #2, p3: 3+1=4 → #3
    expect(ranks.get('p2')).toBe(1)
    expect(ranks.get('p1')).toBe(2)
    expect(ranks.get('p3')).toBe(3)
  })

  it('should handle tied projected scores', () => {
    const players: PlayerForRank[] = [
      { id: 'p1', totalScore: 5 },
      { id: 'p2', totalScore: 3 },
    ]
    const pending = new Map<string, number>([
      ['p1', 0],
      ['p2', 2],
    ])

    const ranks = computeProjectedRanks(players, pending)

    // Both project to 5 — stable sort preserves input order
    expect(ranks.get('p1')).toBe(1)
    expect(ranks.get('p2')).toBe(2)
  })

  it('should return rank 1 for a single player', () => {
    const players: PlayerForRank[] = [{ id: 'solo', totalScore: 42 }]
    const pending = new Map<string, number>([['solo', 3]])

    const ranks = computeProjectedRanks(players, pending)

    expect(ranks.get('solo')).toBe(1)
    expect(ranks.size).toBe(1)
  })

  it('should return empty Map for empty players array', () => {
    const ranks = computeProjectedRanks([], new Map())

    expect(ranks.size).toBe(0)
  })

  it('should default to 0 for players without pending scores', () => {
    const players: PlayerForRank[] = [
      { id: 'p1', totalScore: 10 },
      { id: 'p2', totalScore: 5 },
    ]
    // Only p1 has a pending score
    const pending = new Map<string, number>([['p1', 3]])

    const ranks = computeProjectedRanks(players, pending)

    // p1: 10+3=13 → #1, p2: 5+0=5 → #2
    expect(ranks.get('p1')).toBe(1)
    expect(ranks.get('p2')).toBe(2)
  })

  it('should handle pending scores changing rank order', () => {
    const players: PlayerForRank[] = [
      { id: 'leader', totalScore: 20 },
      { id: 'underdog', totalScore: 5 },
    ]
    const pending = new Map<string, number>([
      ['leader', 0],
      ['underdog', 20],
    ])

    const ranks = computeProjectedRanks(players, pending)

    // underdog: 5+20=25 → #1, leader: 20+0=20 → #2
    expect(ranks.get('underdog')).toBe(1)
    expect(ranks.get('leader')).toBe(2)
  })
})
