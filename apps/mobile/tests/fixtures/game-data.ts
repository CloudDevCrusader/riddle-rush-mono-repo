import { mockPlayers, mockCategories } from './players'

export type GameStatus = 'lobby' | 'active' | 'paused' | 'finished'

export interface GameRound {
  roundNumber: number
  categoryId: number
  letter: string
  answers: Record<string, string>
}

export interface GameSession {
  id: string
  players: typeof mockPlayers
  currentRound: number
  totalRounds: number
  letter: string
  categoryId: number
  status: GameStatus
  startTime: number
  rounds: GameRound[]
}

export const mockGameSession: GameSession = {
  id: 'test-session-1',
  players: [...mockPlayers],
  currentRound: 1,
  totalRounds: 3,
  letter: 'A',
  categoryId: mockCategories[0].id,
  status: 'active',
  startTime: 1_700_000_000_000,
  rounds: [
    {
      roundNumber: 1,
      categoryId: 1,
      letter: 'A',
      answers: {
        'player-1': 'Ant',
        'player-2': 'Alligator',
        'player-3': 'Ape',
      },
    },
  ],
}

export const mockFinishedSession: GameSession = {
  ...mockGameSession,
  id: 'test-session-2',
  status: 'finished',
  currentRound: 3,
}

export const mockGameHistory: GameSession[] = [mockGameSession, mockFinishedSession]
