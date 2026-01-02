/**
 * Game Type Definitions
 * Core types for the Riddle Rush game
 */

// Category types
export interface Category {
  id: number
  name: string
  searchWord: string
  key: string
  searchProvider: 'petscan' | 'offline' | 'wikipedia'
  additionalData?: Record<string, unknown>
  letter?: string
}

// Game attempt
export interface GameAttempt {
  term: string
  found: boolean
  timestamp: number
}

// Player types
export interface Player {
  id: string
  name: string
  totalScore: number
  currentRoundScore: number
  currentRoundAnswer?: string
  hasSubmitted: boolean
  avatar?: string
}

export interface PlayerWithRank extends Player {
  rank: number
  isWinner: boolean
}

// Game session
export interface GameSession {
  id: string
  userId?: string
  gameName?: string
  players: Player[]
  currentRound: number
  category: Category
  letter: string
  startTime: number
  endTime?: number
  score?: number // Legacy single-player
  attempts?: GameAttempt[] // Legacy single-player
  status: 'active' | 'completed' | 'abandoned'
  roundHistory: Array<{
    roundNumber: number
    category: string
    letter: string
    timestamp: number
    playerResults: Array<{
      playerId: string
      playerName: string
      answer: string
      score: number
    }>
  }>
}

// Game state
export interface GameState {
  currentSession: GameSession | null
  isOnline: boolean
  installPromptEvent: BeforeInstallPromptEvent | null
  history: GameSession[]
  categories: Category[]
  categoriesLoaded: boolean
  categoriesLoading: boolean
  displayedCategoryCount: number
  categoryLoadError: string | null
  selectedLetter: string | null
  pendingPlayerNames: string[]
}

// PWA install prompt
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Statistics
export interface GameStatistics {
  totalGames: number
  totalAttempts: number
  correctAttempts: number
  totalScore: number
  totalPlayTime: number
  categoriesPlayed: Record<string, number>
  lastPlayed: number
  bestScore: number
  averageScore: number
  streakCurrent: number
  streakBest: number
}

// Leaderboard
export interface LeaderboardEntry {
  sessionId: string
  score: number
  category: string
  categoryKey: string
  attempts: number
  correctAttempts: number
  timestamp: number
  duration: number
}

// Settings
export interface CategorySettings {
  enabledCategories: string[]
  soundEnabled: boolean
}

// Answer check response
export interface CheckAnswerResponse {
  found: boolean
  other: string[]
}
