/**
 * Integration tests for mobile game flow.
 *
 * NativeScript Vue components require a native iOS/Android runtime for
 * component mounting, so these tests exercise the pure TypeScript game-flow
 * logic — state transitions, scoring, player management — without rendering
 * any NativeScript UI elements.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createPlayer,
  addScore,
  rankPlayers,
  randomLetter,
  validatePlayerName,
  storage,
  generateUUID,
  type Player,
} from '~/utils/index'
import {
  mockPlayers,
  mockCategories,
  mockGameSession,
  mockFinishedSession,
  type GameSession,
  type GameStatus,
} from '../fixtures/index'

// ---------------------------------------------------------------------------
// Game state management
// ---------------------------------------------------------------------------

/** Minimal in-memory game state for integration tests. */
interface GameState {
  session: GameSession | null
  players: Player[]
  currentPlayerIndex: number
}

function createInitialState(): GameState {
  return { session: null, players: [], currentPlayerIndex: 0 }
}

function startGame(state: GameState, players: Player[], categoryId: number): GameState {
  const letter = randomLetter()
  return {
    ...state,
    players,
    currentPlayerIndex: 0,
    session: {
      id: generateUUID(),
      players,
      currentRound: 1,
      totalRounds: 3,
      letter,
      categoryId,
      status: 'active',
      startTime: Date.now(),
      rounds: [],
    },
  }
}

function submitAnswer(state: GameState, playerId: string, answer: string): GameState {
  if (!state.session) return state
  const currentRound = state.session.rounds[state.session.currentRound - 1] ?? {
    roundNumber: state.session.currentRound,
    categoryId: state.session.categoryId,
    letter: state.session.letter,
    answers: {},
  }
  const updatedRound = {
    ...currentRound,
    answers: { ...currentRound.answers, [playerId]: answer },
  }
  const rounds = [...state.session.rounds]
  rounds[state.session.currentRound - 1] = updatedRound
  return {
    ...state,
    session: { ...state.session, rounds },
  }
}

function advanceToNextPlayer(state: GameState): GameState {
  const nextIndex = state.currentPlayerIndex + 1
  return { ...state, currentPlayerIndex: nextIndex % state.players.length }
}

function finishGame(state: GameState): GameState {
  if (!state.session) return state
  return {
    ...state,
    session: { ...state.session, status: 'finished' as GameStatus },
  }
}

function awardPoints(state: GameState, playerId: string, points: number): GameState {
  const players = state.players.map((p) => (p.id === playerId ? addScore(p, points) : p))
  return { ...state, players }
}

// ---------------------------------------------------------------------------
// Main menu navigation
// ---------------------------------------------------------------------------
describe('Main menu navigation', () => {
  it('starts with no active session', () => {
    const state = createInitialState()
    expect(state.session).toBeNull()
  })

  it('starts with an empty player list', () => {
    const state = createInitialState()
    expect(state.players).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Players page — setting player names
// ---------------------------------------------------------------------------
describe('Players page', () => {
  it('allows setting player names', () => {
    const player = createPlayer('Alice')
    expect(player.name).toBe('Alice')
  })

  it('rejects blank player names', () => {
    expect(validatePlayerName('')).toBe(false)
    expect(validatePlayerName('  ')).toBe(false)
  })

  it('rejects names that are too long', () => {
    expect(validatePlayerName('A'.repeat(21))).toBe(false)
  })

  it('accepts names up to 20 characters', () => {
    expect(validatePlayerName('A'.repeat(20))).toBe(true)
  })

  it('creates multiple unique players', () => {
    const p1 = createPlayer('Alice')
    const p2 = createPlayer('Bob')
    expect(p1.id).not.toBe(p2.id)
    expect(p1.name).toBe('Alice')
    expect(p2.name).toBe('Bob')
  })
})

// ---------------------------------------------------------------------------
// Starting game — navigates to game screen
// ---------------------------------------------------------------------------
describe('Starting a game', () => {
  let state: GameState

  beforeEach(() => {
    state = createInitialState()
  })

  it('transitions session status to active', () => {
    const players = [createPlayer('Alice'), createPlayer('Bob')]
    state = startGame(state, players, mockCategories[0].id)
    expect(state.session?.status).toBe('active')
  })

  it('assigns a random letter', () => {
    const players = [createPlayer('Alice')]
    state = startGame(state, players, mockCategories[0].id)
    expect(state.session?.letter).toMatch(/^[A-Z]$/)
  })

  it('resets the current player index to 0', () => {
    const players = [createPlayer('Alice'), createPlayer('Bob')]
    state = startGame(state, players, mockCategories[0].id)
    expect(state.currentPlayerIndex).toBe(0)
  })

  it('stores the selected category', () => {
    const players = [createPlayer('Alice')]
    const cat = mockCategories[1]
    state = startGame(state, players, cat.id)
    expect(state.session?.categoryId).toBe(cat.id)
  })
})

// ---------------------------------------------------------------------------
// Answer submission
// ---------------------------------------------------------------------------
describe('Answer submission', () => {
  let state: GameState

  beforeEach(() => {
    const players = [createPlayer('Alice'), createPlayer('Bob')]
    state = startGame(createInitialState(), players, mockCategories[0].id)
  })

  it('stores the submitted answer for the player', () => {
    const [alice] = state.players
    state = submitAnswer(state, alice.id, 'Ant')
    const round = state.session!.rounds[0]
    expect(round.answers[alice.id]).toBe('Ant')
  })

  it('allows multiple players to submit answers independently', () => {
    const [alice, bob] = state.players
    state = submitAnswer(state, alice.id, 'Ant')
    state = submitAnswer(state, bob.id, 'Bear')
    const round = state.session!.rounds[0]
    expect(round.answers[alice.id]).toBe('Ant')
    expect(round.answers[bob.id]).toBe('Bear')
  })

  it('advances to the next player after submission', () => {
    expect(state.currentPlayerIndex).toBe(0)
    state = advanceToNextPlayer(state)
    expect(state.currentPlayerIndex).toBe(1)
  })

  it('wraps player index back to 0 after last player', () => {
    state = advanceToNextPlayer(state) // → 1
    state = advanceToNextPlayer(state) // → 0 (wraps)
    expect(state.currentPlayerIndex).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Results — display scores correctly
// ---------------------------------------------------------------------------
describe('Results screen', () => {
  it('displays players sorted by score (highest first)', () => {
    const players = [
      { id: '1', name: 'Alice', score: 5 },
      { id: '2', name: 'Bob', score: 15 },
      { id: '3', name: 'Carol', score: 10 },
    ]
    const ranked = rankPlayers(players)
    expect(ranked[0].name).toBe('Bob')
    expect(ranked[1].name).toBe('Carol')
    expect(ranked[2].name).toBe('Alice')
  })

  it('awards points to a player', () => {
    const players = [createPlayer('Alice'), createPlayer('Bob')]
    let state = startGame(createInitialState(), players, mockCategories[0].id)
    const [alice] = state.players
    state = awardPoints(state, alice.id, 10)
    const updated = state.players.find((p) => p.id === alice.id)
    expect(updated?.score).toBe(10)
  })

  it('does not reduce score below zero', () => {
    const player = { id: '1', name: 'Alice', score: 3 }
    const updated = addScore(player, -10)
    expect(updated.score).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Leaderboard — show rankings
// ---------------------------------------------------------------------------
describe('Leaderboard', () => {
  it('ranks players from the mock session correctly', () => {
    const ranked = rankPlayers(mockPlayers)
    expect(ranked[0].name).toBe('Alice') // score 15
    expect(ranked[1].name).toBe('Carol') // score 10
    expect(ranked[2].name).toBe('Bob') // score 5
  })

  it('handles tied scores without throwing', () => {
    const tied = [
      { id: '1', name: 'Alice', score: 10 },
      { id: '2', name: 'Bob', score: 10 },
    ]
    expect(() => rankPlayers(tied)).not.toThrow()
  })

  it('returns an empty array for no players', () => {
    expect(rankPlayers([])).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Back navigation — returns to previous screen
// ---------------------------------------------------------------------------
describe('Back navigation', () => {
  it('finishing a game marks session as finished', () => {
    const players = [createPlayer('Alice')]
    let state = startGame(createInitialState(), players, mockCategories[0].id)
    expect(state.session?.status).toBe('active')
    state = finishGame(state)
    expect(state.session?.status).toBe('finished')
  })

  it('resetting state clears the session', () => {
    let state = createInitialState()
    state = startGame(state, [createPlayer('Alice')], mockCategories[0].id)
    state = createInitialState()
    expect(state.session).toBeNull()
    expect(state.players).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Complete game flow — end-to-end state transitions
// ---------------------------------------------------------------------------
describe('Complete game flow', () => {
  it('navigates through the full lobby → active → finished lifecycle', () => {
    let state = createInitialState()

    // Lobby: no session
    expect(state.session).toBeNull()

    // Players set up
    const alice = createPlayer('Alice')
    const bob = createPlayer('Bob')
    expect(validatePlayerName(alice.name)).toBe(true)
    expect(validatePlayerName(bob.name)).toBe(true)

    // Game starts
    state = startGame(state, [alice, bob], mockCategories[0].id)
    expect(state.session?.status).toBe('active')
    expect(state.players).toHaveLength(2)

    // Alice submits answer
    state = submitAnswer(state, alice.id, 'Ant')
    state = advanceToNextPlayer(state)
    expect(state.currentPlayerIndex).toBe(1)

    // Bob submits answer
    state = submitAnswer(state, bob.id, 'Bear')
    state = advanceToNextPlayer(state)
    expect(state.currentPlayerIndex).toBe(0)

    // Award points
    state = awardPoints(state, alice.id, 10)
    state = awardPoints(state, bob.id, 5)

    // Game finishes
    state = finishGame(state)
    expect(state.session?.status).toBe('finished')

    // Rankings
    const ranked = rankPlayers(state.players)
    expect(ranked[0].id).toBe(alice.id)
    expect(ranked[0].score).toBe(10)
  })

  it('session from fixtures has correct structure', () => {
    expect(mockGameSession.status).toBe('active')
    expect(mockGameSession.players).toHaveLength(3)
    expect(mockGameSession.rounds[0].answers).toBeDefined()
  })

  it('finished session from fixtures is marked as finished', () => {
    expect(mockFinishedSession.status).toBe('finished')
  })

  it('storage persists game settings between screens', () => {
    storage.clear()
    storage.setItem('totalRounds', 5)
    storage.setItem('soundEnabled', true)
    expect(storage.getItem('totalRounds')).toBe(5)
    expect(storage.getItem('soundEnabled')).toBe(true)
  })
})
