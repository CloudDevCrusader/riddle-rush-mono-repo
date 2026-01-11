import { describe, it, expect } from 'vitest'
import { getGameRoute, getResultsRoute, ROUTES } from '@riddle-rush/shared/routes'

describe('Routes', () => {
  describe('ROUTES constants', () => {
    it('should have game route with optional gameId parameter', () => {
      expect(ROUTES.GAME).toBe('/game/:gameId?')
    })

    it('should have results route with optional gameId parameter', () => {
      expect(ROUTES.RESULTS).toBe('/results/:gameId?')
    })

    it('should have other static routes', () => {
      expect(ROUTES.HOME).toBe('/')
      expect(ROUTES.PLAYERS).toBe('/players')
      expect(ROUTES.ROUND_START).toBe('/round-start')
      expect(ROUTES.LEADERBOARD).toBe('/leaderboard')
      expect(ROUTES.SETTINGS).toBe('/settings')
      expect(ROUTES.LANGUAGE).toBe('/language')
      expect(ROUTES.CREDITS).toBe('/credits')
    })
  })

  describe('getGameRoute', () => {
    it('should generate game route with UUID', () => {
      const gameId = '123e4567-e89b-12d3-a456-426614174000'
      const route = getGameRoute(gameId)
      expect(route).toBe(`/game/${gameId}`)
    })

    it('should generate route with short UUID', () => {
      const gameId = 'abc123'
      const route = getGameRoute(gameId)
      expect(route).toBe('/game/abc123')
    })

    it('should generate route with any string ID', () => {
      const gameId = 'test-game-id-123'
      const route = getGameRoute(gameId)
      expect(route).toBe('/game/test-game-id-123')
    })

    it('should handle special characters in ID', () => {
      const gameId = 'game-123_abc'
      const route = getGameRoute(gameId)
      expect(route).toBe('/game/game-123_abc')
    })
  })

  describe('getResultsRoute', () => {
    it('should generate results route with UUID', () => {
      const gameId = '123e4567-e89b-12d3-a456-426614174000'
      const route = getResultsRoute(gameId)
      expect(route).toBe(`/results/${gameId}`)
    })

    it('should generate route with short UUID', () => {
      const gameId = 'abc123'
      const route = getResultsRoute(gameId)
      expect(route).toBe('/results/abc123')
    })

    it('should generate route with any string ID', () => {
      const gameId = 'test-game-id-456'
      const route = getResultsRoute(gameId)
      expect(route).toBe('/results/test-game-id-456')
    })

    it('should handle special characters in ID', () => {
      const gameId = 'result-789_xyz'
      const route = getResultsRoute(gameId)
      expect(route).toBe('/results/result-789_xyz')
    })
  })

  describe('route consistency', () => {
    it('should generate different routes for game and results', () => {
      const gameId = '123e4567-e89b-12d3-a456-426614174000'
      const gameRoute = getGameRoute(gameId)
      const resultsRoute = getResultsRoute(gameId)

      expect(gameRoute).not.toBe(resultsRoute)
      expect(gameRoute).toContain('/game/')
      expect(resultsRoute).toContain('/results/')
    })

    it('should use same ID in both routes', () => {
      const gameId = 'same-id-123'
      const gameRoute = getGameRoute(gameId)
      const resultsRoute = getResultsRoute(gameId)

      expect(gameRoute).toContain(gameId)
      expect(resultsRoute).toContain(gameId)
    })
  })
})
