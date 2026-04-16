/**
 * Player management composable
 *
 * Extracts player-related logic from the game store into focused utility functions.
 * These functions are **stateless** — they accept data as parameters and return results.
 * The game store delegates to these functions while still owning all reactive state.
 */

import type { Player, PlayerWithRank } from '@riddle-rush/types/game'
import { generateUUID } from '~/utils/uuid'

/**
 * Composable providing player management utilities.
 *
 * @example
 * ```ts
 * const playerManager = usePlayerManager()
 * const players = playerManager.createPlayers(['Alice', 'Bob'])
 * const leader = playerManager.buildLeaderboard(players, false)
 * ```
 */
export function usePlayerManager() {
  /**
   * Create Player objects from an array of player names.
   * Each player gets a unique ID and zeroed-out scores.
   *
   * @param playerNames - Array of player name strings
   * @returns Array of initialized Player objects
   */
  function createPlayers(playerNames: string[]): Player[] {
    return playerNames.map((name, index) => ({
      id: generateUUID(),
      name: name || `Player ${index + 1}`,
      totalScore: 0,
      currentRoundScore: 0,
      currentRoundAnswer: undefined,
      hasSubmitted: false,
    }))
  }

  /**
   * Find the index of a player by their ID.
   *
   * @param players - Array of players to search
   * @param playerId - The player ID to find
   * @returns The index of the player, or -1 if not found
   */
  function findPlayerIndex(players: Player[], playerId: string): number {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    return players.findIndex((p) => p.id === playerId)
=======
    return players.findIndex(p => p.id === playerId);
>>>>>>> Stashed changes
=======
    return players.findIndex(p => p.id === playerId);
>>>>>>> Stashed changes
  }

  /**
   * Find a player by their ID.
   *
   * @param players - Array of players to search
   * @param playerId - The player ID to find
   * @returns The matching Player, or null if not found
   */
  function getPlayerById(players: Player[], playerId: string): Player | null {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    return players.find((p) => p.id === playerId) ?? null
=======
    return players.find(p => p.id === playerId) ?? null;
>>>>>>> Stashed changes
=======
    return players.find(p => p.id === playerId) ?? null;
>>>>>>> Stashed changes
  }

  /**
   * Set a player's answer and mark them as submitted.
   * Mutates the player object directly (caller owns reactivity).
   *
   * @param player - The player to update
   * @param answer - The answer to submit
   */
  function submitPlayerAnswer(player: Player, answer: string): void {
    player.currentRoundAnswer = answer
    player.hasSubmitted = true
  }

  /**
   * Assign a score to a player using idempotent delta calculation.
   * Calling with the same value multiple times is safe (delta = 0).
   * Mutates the player object directly (caller owns reactivity).
   *
   * @param player - The player to update
   * @param points - The score to assign for the current round
   */
  function assignPlayerScore(player: Player, points: number): void {
    const delta = points - player.currentRoundScore
    player.totalScore += delta
    player.currentRoundScore = points
  }

  /**
   * Set a player's avatar URL.
   * Mutates the player object directly (caller owns reactivity).
   *
   * @param player - The player to update
   * @param avatarUrl - The avatar URL to set
   */
  function updatePlayerAvatar(player: Player, avatarUrl: string): void {
    player.avatar = avatarUrl
  }

  /**
   * Reset all submission-related state for all players.
   *
   * This helper is used when an in-progress round is restarted/refreshed and
   * must behave deterministically: no stale answers, no stale round scores,
   * and no submitted flags from a previous attempt.
   *
   * Mutates player objects directly (caller owns reactivity).
   *
   * @param players - Array of players to reset
   */
  function resetPlayerSubmissions(players: Player[]): void {
    players.forEach((player) => {
      player.hasSubmitted = false
      player.currentRoundAnswer = undefined
      player.currentRoundScore = 0
    })
  }

  /**
   * Reset round-specific state for all players (score, answer, submission).
   * Used when starting a new round. Mutates player objects directly.
   *
   * @param players - Array of players to reset
   */
  function resetPlayerRoundState(players: Player[]): void {
    players.forEach((player) => {
      player.currentRoundScore = 0
      player.currentRoundAnswer = undefined
      player.hasSubmitted = false
    })
  }

  /**
   * Build a ranked leaderboard from the players array.
   * Players are sorted by totalScore descending. The top player is marked
   * as winner only when the game is completed and their score is > 0.
   *
   * @param players - Array of players to rank
   * @param isGameCompleted - Whether the game has ended
   * @returns Ranked player array with rank and isWinner fields
   */
  function buildLeaderboard(players: Player[], isGameCompleted: boolean): PlayerWithRank[] {
    if (players.length === 0) return []

    const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore)
    const topScore = sorted[0]?.totalScore ?? 0

    return sorted.map((player, index) => ({
      ...player,
      rank: index + 1,
      isWinner: isGameCompleted && index === 0 && topScore > 0,
    }))
  }

  /**
   * Get the current player by index.
   * Returns null when the index is out of bounds (all turns done).
   *
   * @param players - Array of players to check
   * @param currentPlayerIndex - The index of the current player
   * @returns The player at the given index, or null if index is out of bounds
   */
  function getCurrentPlayerTurn(players: Player[], currentPlayerIndex: number): Player | null {
    return players[currentPlayerIndex] ?? null
  }

  /**
   * Advance the player index by 1.
   * Does NOT wrap — when index >= playerCount, the getter returns null (all turns done).
   *
   * @param currentIndex - The current player index
   * @param _playerCount - The total number of players (reserved for future use)
   * @returns The next player index
   */
  function advancePlayerIndex(currentIndex: number, _playerCount: number): number {
    return currentIndex + 1
  }

  /**
   * Check whether all players have submitted their answers.
   *
   * @param players - Array of players to check
   * @returns True if all players have submitted, false if array is empty or any haven't
   */
  function allPlayersSubmitted(players: Player[]): boolean {
<<<<<<< Updated upstream
    if (players.length === 0) return false
    return players.every((p) => p.hasSubmitted)
=======
    if (players.length === 0) return false;
    return players.every(p => p.hasSubmitted);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  }

  return {
    createPlayers,
    findPlayerIndex,
    getPlayerById,
    submitPlayerAnswer,
    assignPlayerScore,
    updatePlayerAvatar,
    resetPlayerSubmissions,
    resetPlayerRoundState,
    buildLeaderboard,
    getCurrentPlayerTurn,
    advancePlayerIndex,
    allPlayersSubmitted,
  }
}
