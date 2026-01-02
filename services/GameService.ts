/**
 * Game Service Layer
 * Abstracts game business logic from components
 * Uses dependency injection pattern for better testability
 */
import type { Category, GameSession, Player } from '~/types/game'

export class GameService {
  /**
   * Generate a random letter from the alphabet
   */
  static generateRandomLetter(alphabet: string): string {
    if (!alphabet || alphabet.length === 0) {
      throw new Error('Alphabet cannot be empty')
    }
    const index = Math.floor(Math.random() * alphabet.length)
    return alphabet.charAt(index).toLowerCase()
  }

  /**
   * Calculate score for a correct answer
   */
  static calculateScore(baseScore: number, timeBonus = 0): number {
    return Math.max(0, baseScore + timeBonus)
  }

  /**
   * Create a new game session
   */
  static createSession(
    category: Category,
    letter: string,
    players: Player[],
    gameName?: string,
  ): GameSession {
    return {
      id: crypto.randomUUID(),
      gameName,
      players,
      currentRound: 1,
      category,
      letter,
      startTime: Date.now(),
      status: 'active',
      roundHistory: [],
    }
  }

  /**
   * Create a new player
   */
  static createPlayer(name: string, avatar?: string): Player {
    return {
      id: crypto.randomUUID(),
      name,
      totalScore: 0,
      currentRoundScore: 0,
      hasSubmitted: false,
      avatar,
    }
  }

  /**
   * Validate player name
   */
  static validatePlayerName(name: string, existingPlayers: Player[]): {
    valid: boolean
    error?: string
  } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Player name cannot be empty' }
    }

    if (name.length > 20) {
      return { valid: false, error: 'Player name must be 20 characters or less' }
    }

    const isDuplicate = existingPlayers.some(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
    )

    if (isDuplicate) {
      return { valid: false, error: 'Player name already exists' }
    }

    return { valid: true }
  }

  /**
   * Check if all players have submitted
   */
  static allPlayersSubmitted(players: Player[]): boolean {
    return players.length > 0 && players.every((p) => p.hasSubmitted)
  }

  /**
   * Get current turn player
   */
  static getCurrentTurnPlayer(players: Player[]): Player | null {
    return players.find((p) => !p.hasSubmitted) ?? null
  }

  /**
   * Calculate game duration
   */
  static calculateDuration(startTime: number, endTime?: number): number {
    const end = endTime ?? Date.now()
    return Math.max(0, end - startTime)
  }

  /**
   * Format duration for display
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }

  /**
   * Get player rank by score
   */
  static getPlayerRank(player: Player, allPlayers: Player[]): number {
    const sorted = [...allPlayers].sort((a, b) => b.totalScore - a.totalScore)
    return sorted.findIndex((p) => p.id === player.id) + 1
  }

  /**
   * Determine if player is winner
   */
  static isWinner(player: Player, allPlayers: Player[]): boolean {
    const rank = GameService.getPlayerRank(player, allPlayers)
    return rank === 1 && player.totalScore > 0
  }

  /**
   * Shuffle array (Fisher-Yates algorithm)
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Get random categories
   */
  static getRandomCategories(
    categories: Category[],
    count: number,
  ): Category[] {
    if (count >= categories.length) {
      return GameService.shuffle(categories)
    }
    return GameService.shuffle(categories).slice(0, count)
  }

  /**
   * Normalize answer for comparison
   */
  static normalizeAnswer(answer: string): string {
    return answer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036F]/g, '') // Remove diacritics
  }

  /**
   * Check if answers are similar (fuzzy match)
   */
  static areSimilarAnswers(
    answer1: string,
    answer2: string,
    threshold = 0.8,
  ): boolean {
    const norm1 = GameService.normalizeAnswer(answer1)
    const norm2 = GameService.normalizeAnswer(answer2)

    if (norm1 === norm2) return true

    // Levenshtein distance for fuzzy matching
    const distance = GameService.levenshteinDistance(norm1, norm2)
    const maxLength = Math.max(norm1.length, norm2.length)
    const similarity = 1 - distance / maxLength

    return similarity >= threshold
  }

  /**
   * Calculate Levenshtein distance
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }
}
