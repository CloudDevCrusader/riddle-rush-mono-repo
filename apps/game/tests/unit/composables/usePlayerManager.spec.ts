import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player } from '@riddle-rush/types/game'

import { usePlayerManager } from '../../../composables/usePlayerManager'

// Mock generateUUID to produce predictable IDs
let uuidCounter = 0
vi.mock('~/utils/uuid', () => ({
  generateUUID: () => `test-uuid-${++uuidCounter}`,
}))

// Helper factory
function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    name: 'Test Player',
    totalScore: 0,
    currentRoundScore: 0,
    currentRoundAnswer: undefined,
    hasSubmitted: false,
    ...overrides,
  }
}

describe('usePlayerManager', () => {
  let manager: ReturnType<typeof usePlayerManager>

  beforeEach(() => {
    uuidCounter = 0
    manager = usePlayerManager()
  })

  // ──────────────────────────────────────────
  // createPlayers
  // ──────────────────────────────────────────
  describe('createPlayers', () => {
    it('creates Player objects with correct structure', () => {
      const players = manager.createPlayers(['Alice'])

      expect(players).toHaveLength(1)
      expect(players[0]).toMatchObject({
        name: 'Alice',
        totalScore: 0,
        currentRoundScore: 0,
        hasSubmitted: false,
      })
      expect(players[0]!.currentRoundAnswer).toBeUndefined()
    })

    it('generates unique IDs for each player', () => {
      const players = manager.createPlayers(['Alice', 'Bob', 'Charlie'])

      const ids = players.map((p) => p.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(3)
    })

    it('uses default names when input is empty string', () => {
      const players = manager.createPlayers(['', ''])

      expect(players[0]!.name).toBe('Player 1')
      expect(players[1]!.name).toBe('Player 2')
    })

    it('creates multiple players from array', () => {
      const players = manager.createPlayers(['Alice', 'Bob'])

      expect(players).toHaveLength(2)
      expect(players[0]!.name).toBe('Alice')
      expect(players[1]!.name).toBe('Bob')
    })

    it('assigns zeroed-out scores to all players', () => {
      const players = manager.createPlayers(['Alice', 'Bob'])

      players.forEach((p) => {
        expect(p.totalScore).toBe(0)
        expect(p.currentRoundScore).toBe(0)
        expect(p.hasSubmitted).toBe(false)
      })
    })
  })

  // ──────────────────────────────────────────
  // findPlayerIndex
  // ──────────────────────────────────────────
  describe('findPlayerIndex', () => {
    it('returns correct index when player ID matches', () => {
      const players = [
        createPlayer({ id: 'a' }),
        createPlayer({ id: 'b' }),
        createPlayer({ id: 'c' }),
      ]

      expect(manager.findPlayerIndex(players, 'b')).toBe(1)
    })

    it('returns -1 when player ID not found', () => {
      const players = [createPlayer({ id: 'a' }), createPlayer({ id: 'b' })]

      expect(manager.findPlayerIndex(players, 'z')).toBe(-1)
    })

    it('returns -1 for empty players array', () => {
      expect(manager.findPlayerIndex([], 'any')).toBe(-1)
    })
  })

  // ──────────────────────────────────────────
  // getPlayerById
  // ──────────────────────────────────────────
  describe('getPlayerById', () => {
    it('returns correct Player object when ID matches', () => {
      const target = createPlayer({ id: 'target', name: 'Target Player' })
      const players = [createPlayer({ id: 'a' }), target, createPlayer({ id: 'b' })]

      const result = manager.getPlayerById(players, 'target')

      expect(result).not.toBeNull()
      expect(result!.name).toBe('Target Player')
    })

    it('returns null when ID not found', () => {
      const players = [createPlayer({ id: 'a' }), createPlayer({ id: 'b' })]

      const result = manager.getPlayerById(players, 'z')

      expect(result).toBeNull()
    })

    it('returns null for empty array', () => {
      const result = manager.getPlayerById([], 'any')

      expect(result).toBeNull()
    })
  })

  // ──────────────────────────────────────────
  // submitPlayerAnswer
  // ──────────────────────────────────────────
  describe('submitPlayerAnswer', () => {
    it('sets answer, marks submitted, mutates same reference', () => {
      const player = createPlayer({ hasSubmitted: false })
      const originalRef = player

      manager.submitPlayerAnswer(player, 'Tiger')

      expect(player).toBe(originalRef)
      expect(player.currentRoundAnswer).toBe('Tiger')
      expect(player.hasSubmitted).toBe(true)
    })
  })

  // ──────────────────────────────────────────
  // assignPlayerScore
  // ──────────────────────────────────────────
  describe('assignPlayerScore', () => {
    it('updates totalScore by delta (points - currentRoundScore)', () => {
      const player = createPlayer({ totalScore: 10, currentRoundScore: 0 })

      manager.assignPlayerScore(player, 5)

      expect(player.totalScore).toBe(15)
      expect(player.currentRoundScore).toBe(5)
    })

    it('is idempotent: calling twice with same score results in no additional change', () => {
      const player = createPlayer({ totalScore: 0, currentRoundScore: 0 })

      manager.assignPlayerScore(player, 10)
      expect(player.totalScore).toBe(10)

      manager.assignPlayerScore(player, 10)
      expect(player.totalScore).toBe(10) // No change the second time
      expect(player.currentRoundScore).toBe(10)
    })

    it('correctly calculates delta when overwriting existing round score', () => {
      const player = createPlayer({ totalScore: 20, currentRoundScore: 5 })

      manager.assignPlayerScore(player, 10)

      // delta = 10 - 5 = 5, so totalScore = 20 + 5 = 25
      expect(player.totalScore).toBe(25)
      expect(player.currentRoundScore).toBe(10)
    })
  })

  // ──────────────────────────────────────────
  // updatePlayerAvatar
  // ──────────────────────────────────────────
  describe('updatePlayerAvatar', () => {
    it('sets avatar property to provided URL', () => {
      const player = createPlayer()

      manager.updatePlayerAvatar(player, 'https://example.com/avatar.png')

      expect(player.avatar).toBe('https://example.com/avatar.png')
    })

    it('overwrites existing avatar', () => {
      const player = createPlayer({ avatar: 'old-url' })

      manager.updatePlayerAvatar(player, 'new-url')

      expect(player.avatar).toBe('new-url')
    })
  })

  // ──────────────────────────────────────────
  // resetPlayerSubmissions
  // ──────────────────────────────────────────
  describe('resetPlayerSubmissions', () => {
    it('clears submission flags, answers, and round scores', () => {
      const players = [
        createPlayer({
          hasSubmitted: true,
          currentRoundAnswer: 'Tiger',
          currentRoundScore: 10,
        }),
        createPlayer({
          hasSubmitted: true,
          currentRoundAnswer: 'Lion',
          currentRoundScore: 5,
        }),
      ]

      manager.resetPlayerSubmissions(players)

      players.forEach((p) => {
        expect(p.hasSubmitted).toBe(false)
        expect(p.currentRoundAnswer).toBeUndefined()
        expect(p.currentRoundScore).toBe(0)
      })
    })

    it('handles empty players array without error', () => {
      expect(() => manager.resetPlayerSubmissions([])).not.toThrow()
    })
  })

  // ──────────────────────────────────────────
  // resetPlayerRoundState
  // ──────────────────────────────────────────
  describe('resetPlayerRoundState', () => {
    it('clears round state for all players', () => {
      const players = [
        createPlayer({ currentRoundScore: 10, currentRoundAnswer: 'answer', hasSubmitted: true }),
        createPlayer({ currentRoundScore: 5, currentRoundAnswer: 'other', hasSubmitted: true }),
      ]

      manager.resetPlayerRoundState(players)

      players.forEach((p) => {
        expect(p.currentRoundScore).toBe(0)
        expect(p.currentRoundAnswer).toBeUndefined()
        expect(p.hasSubmitted).toBe(false)
      })
    })

    it('does not affect totalScore', () => {
      const players = [createPlayer({ totalScore: 100, currentRoundScore: 10 })]

      manager.resetPlayerRoundState(players)

      expect(players[0]!.totalScore).toBe(100)
    })
  })

  // ──────────────────────────────────────────
  // buildLeaderboard
  // ──────────────────────────────────────────
  describe('buildLeaderboard', () => {
    it('returns array sorted by totalScore descending', () => {
      const players = [
        createPlayer({ id: 'a', name: 'Alice', totalScore: 5 }),
        createPlayer({ id: 'b', name: 'Bob', totalScore: 20 }),
        createPlayer({ id: 'c', name: 'Charlie', totalScore: 10 }),
      ]

      const leaderboard = manager.buildLeaderboard(players, false)

      expect(leaderboard[0]!.name).toBe('Bob')
      expect(leaderboard[1]!.name).toBe('Charlie')
      expect(leaderboard[2]!.name).toBe('Alice')
    })

    it('assigns rank as 1-based index', () => {
      const players = [
        createPlayer({ id: 'a', totalScore: 20 }),
        createPlayer({ id: 'b', totalScore: 10 }),
        createPlayer({ id: 'c', totalScore: 5 }),
      ]

      const leaderboard = manager.buildLeaderboard(players, false)

      expect(leaderboard[0]!.rank).toBe(1)
      expect(leaderboard[1]!.rank).toBe(2)
      expect(leaderboard[2]!.rank).toBe(3)
    })

    it('marks isWinner true for rank 1 when isGameCompleted and score > 0', () => {
      const players = [
        createPlayer({ id: 'a', totalScore: 20 }),
        createPlayer({ id: 'b', totalScore: 10 }),
      ]

      const leaderboard = manager.buildLeaderboard(players, true)

      expect(leaderboard[0]!.isWinner).toBe(true)
      expect(leaderboard[1]!.isWinner).toBe(false)
    })

    it('does not mark isWinner when isGameCompleted is false', () => {
      const players = [createPlayer({ id: 'a', totalScore: 20 })]

      const leaderboard = manager.buildLeaderboard(players, false)

      expect(leaderboard[0]!.isWinner).toBe(false)
    })

    it('does not mark isWinner when top score is 0', () => {
      const players = [
        createPlayer({ id: 'a', totalScore: 0 }),
        createPlayer({ id: 'b', totalScore: 0 }),
      ]

      const leaderboard = manager.buildLeaderboard(players, true)

      leaderboard.forEach((p) => expect(p.isWinner).toBe(false))
    })

    it('returns empty array for empty input', () => {
      const leaderboard = manager.buildLeaderboard([], false)

      expect(leaderboard).toEqual([])
    })
  })

  // ──────────────────────────────────────────
  // getCurrentPlayerTurn
  // ──────────────────────────────────────────
  describe('getCurrentPlayerTurn', () => {
    it('returns player at currentPlayerIndex', () => {
      const players = [
        createPlayer({ id: 'a', name: 'Alice' }),
        createPlayer({ id: 'b', name: 'Bob' }),
      ]

      const result = manager.getCurrentPlayerTurn(players, 1)

      expect(result!.name).toBe('Bob')
    })

    it('returns null when index is out of bounds', () => {
      const players = [createPlayer({ id: 'a' }), createPlayer({ id: 'b' })]

      const result = manager.getCurrentPlayerTurn(players, 5)

      expect(result).toBeNull()
    })

    it('returns null for empty players array', () => {
      const result = manager.getCurrentPlayerTurn([], 0)

      expect(result).toBeNull()
    })
  })

  // ──────────────────────────────────────────
  // advancePlayerIndex
  // ──────────────────────────────────────────
  describe('advancePlayerIndex', () => {
    it('returns currentIndex + 1', () => {
      expect(manager.advancePlayerIndex(0, 3)).toBe(1)
      expect(manager.advancePlayerIndex(1, 3)).toBe(2)
      expect(manager.advancePlayerIndex(2, 3)).toBe(3)
    })

    it('does not wrap around (can exceed playerCount)', () => {
      const result = manager.advancePlayerIndex(2, 3)

      expect(result).toBe(3) // Index 3 with 3 players means all turns done
    })
  })

  // ──────────────────────────────────────────
  // allPlayersSubmitted
  // ──────────────────────────────────────────
  describe('allPlayersSubmitted', () => {
    it('returns true when all players have hasSubmitted: true', () => {
      const players = [createPlayer({ hasSubmitted: true }), createPlayer({ hasSubmitted: true })]

      expect(manager.allPlayersSubmitted(players)).toBe(true)
    })

    it('returns false for empty array', () => {
      expect(manager.allPlayersSubmitted([])).toBe(false)
    })

    it('returns false when any player has hasSubmitted: false', () => {
      const players = [createPlayer({ hasSubmitted: true }), createPlayer({ hasSubmitted: false })]

      expect(manager.allPlayersSubmitted(players)).toBe(false)
    })

    it('returns false when no players have submitted', () => {
      const players = [createPlayer({ hasSubmitted: false }), createPlayer({ hasSubmitted: false })]

      expect(manager.allPlayersSubmitted(players)).toBe(false)
    })
  })
})
