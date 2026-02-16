/**
 * Scoring engine composable
 *
 * Extracts scoring-related logic from the game store into focused utility functions.
 * These are **pure functions** — no state, no side effects. Accept data, return results.
 */

import { SCORE_PER_CORRECT_ANSWER } from '@riddle-rush/shared/constants'
import type { Player } from '@riddle-rush/types/game'

/**
 * Composable providing scoring and display utilities.
 *
 * @example
 * ```ts
 * const scoring = useScoringEngine()
 * const points = scoring.calculateAttemptScore(true)  // 10
 * const suffix = scoring.getRankSuffix(1)             // "1st"
 * const display = scoring.getScoreDisplay(5)           // "+5"
 * ```
 */
export function useScoringEngine() {
  /**
   * Calculate the score for a single attempt.
   *
   * @param found - Whether the term was found
   * @returns SCORE_PER_CORRECT_ANSWER if found, 0 otherwise
   */
  function calculateAttemptScore(found: boolean): number {
    return found ? SCORE_PER_CORRECT_ANSWER : 0
  }

  /**
   * Get the ordinal suffix for a rank number.
   *
   * @param rank - The rank number (1-based)
   * @returns The rank with ordinal suffix (e.g., "1st", "2nd", "3rd", "4th")
   */
  function getRankSuffix(rank: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd']
    const remainder = rank % 100

    // Special case for 11th, 12th, 13th
    if (remainder >= 11 && remainder <= 13) {
      return `${rank}th`
    }

    return `${rank}${suffixes[rank % 10] || 'th'}`
  }

  /**
   * Format a score for display with a sign prefix.
   *
   * @param score - The score to format
   * @returns Formatted string: "+5", "-3", or "0"
   */
  function getScoreDisplay(score: number): string {
    if (score > 0) return `+${score}`
    if (score < 0) return `${score}`
    return '0'
  }

  /**
   * Determine the winning player(s) — those with the highest score.
   * Returns all players tied for the highest score.
   *
   * @param players - Array of players to evaluate
   * @returns Array of players with the highest score, or empty array if no players
   */
  function determineWinners(players: Player[]): Player[] {
    if (players.length === 0) return []

    const maxScore = Math.max(...players.map((p) => p.totalScore))
    if (maxScore <= 0) return []

    return players.filter((p) => p.totalScore === maxScore)
  }

  return {
    calculateAttemptScore,
    getRankSuffix,
    getScoreDisplay,
    determineWinners,
  }
}
