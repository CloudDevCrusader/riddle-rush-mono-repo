export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface Category {
  id: number
  name: string
  searchWord: string
  key: string
  searchProvider: string
  additionalData?: string[]
  letter?: string
}

export interface GameSession {
  id: string
  userId: string
  category: Category
  letter: string
  startTime: number
  endTime?: number
  score: number
  attempts: GameAttempt[]
}

export interface GameAttempt {
  term: string
  found: boolean
  timestamp: number
}

export interface CheckAnswerResponse {
  found: boolean
  other: string[]
}

export interface GameState {
  currentSession: GameSession | null
  isOnline: boolean
  installPromptEvent: BeforeInstallPromptEvent | null
  history: GameSession[]
  categories: Category[]
  categoriesLoaded: boolean
  displayedCategoryCount: number
  pendingCategoryId: number | null
  categoryLoadError: string | null
}

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

export interface CategorySettings {
  enabledCategories: string[]
  soundEnabled: boolean
}
