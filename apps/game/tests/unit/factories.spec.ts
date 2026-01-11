import { describe, it, expect } from 'vitest'
import {
  createCategory,
  createGameAttempt,
  createGameSession,
  createPlayer,
  createPlayerList,
} from '../utils/factories'

describe('Test Factories with Faker', () => {
  it('should create category with realistic data', () => {
    const category = createCategory()

    expect(category).toHaveProperty('id')
    expect(category).toHaveProperty('name')
    expect(category).toHaveProperty('searchWord')
    expect(category).toHaveProperty('letter')

    // Name should be realistic based on the template
    expect(category.name.length).toBeGreaterThan(0)
    expect(typeof category.name).toBe('string')
  })

  it('should create game attempt with realistic term', () => {
    const attempt = createGameAttempt()

    expect(attempt).toHaveProperty('term')
    expect(attempt).toHaveProperty('found')
    expect(attempt).toHaveProperty('timestamp')

    // Term should be realistic words
    expect(attempt.term.length).toBeGreaterThan(0)
    expect(typeof attempt.term).toBe('string')
  })

  it('should create game session with UUID', () => {
    const session = createGameSession()

    expect(session).toHaveProperty('id')
    expect(session).toHaveProperty('userId')
    expect(session).toHaveProperty('players')
    expect(session).toHaveProperty('category')

    // ID should be a UUID format
    expect(session.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('should create player with realistic name', () => {
    const player = createPlayer()

    expect(player).toHaveProperty('id')
    expect(player).toHaveProperty('name')
    expect(player).toHaveProperty('totalScore')
    expect(player).toHaveProperty('currentRoundScore')
    expect(player).toHaveProperty('currentRoundAnswer')
    expect(player).toHaveProperty('hasSubmitted')

    // Name should be realistic
    expect(player.name.length).toBeGreaterThan(0)
    expect(typeof player.name).toBe('string')

    // ID should be a UUID format
    expect(player.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('should create player list with multiple players', () => {
    const players = createPlayerList(3)

    expect(players).toHaveLength(3)
    expect(players[0].name).toBe('Player 1')
    expect(players[1].name).toBe('Player 2')
    expect(players[2].name).toBe('Player 3')

    // Each player should have realistic data
    players.forEach((player) => {
      expect(player).toHaveProperty('id')
      expect(player).toHaveProperty('name')
      expect(player.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })
  })

  it('should create different categories each time', () => {
    const category1 = createCategory()
    const category2 = createCategory()

    // Categories should generally be different (though there's a small chance of collision)
    expect(category1).not.toEqual(category2)
  })

  it('should create game session with realistic game name', () => {
    const session = createGameSession()

    expect(session.gameName).toBeDefined()
    expect(session.gameName?.length).toBeGreaterThan(0)
    expect(typeof session.gameName).toBe('string')

    // Game name should be two words
    const words = session.gameName?.split(' ') ?? []
    expect(words.length).toBe(2)
  })
})
