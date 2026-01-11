import { describe, it, expect } from 'vitest'
import { getGameRoute, getResultsRoute } from '@riddle-rush/shared/routes'

/**
 * Tests for useNavigation UUID support
 * Note: Full integration tests are in e2e tests due to complexity of mocking Nuxt auto-imports
 * These tests verify the route generation logic works correctly
 */
describe('useNavigation UUID Support', () => {
  describe('Game Route Generation', () => {
    it('should generate game route with UUID', () => {
      const gameId = '123e4567-e89b-12d3-a456-426614174000'
      const route = getGameRoute(gameId)

      expect(route).toBe(`/game/${gameId}`)
      expect(route).toContain(gameId)
    })

    it('should generate game route with short ID', () => {
      const gameId = 'abc123'
      const route = getGameRoute(gameId)

      expect(route).toBe('/game/abc123')
    })

    it('should handle game ID with special characters', () => {
      const gameId = 'game-123_test-456'
      const route = getGameRoute(gameId)

      expect(route).toBe('/game/game-123_test-456')
    })

    it('should handle numeric game ID', () => {
      const gameId = '12345'
      const route = getGameRoute(gameId)

      expect(route).toBe('/game/12345')
    })

    it('should handle full UUID format', () => {
      const gameId = '550e8400-e29b-41d4-a716-446655440000'
      const route = getGameRoute(gameId)

      expect(route).toBe(`/game/${gameId}`)
      expect(route.split('/')[1]).toBe('game')
      expect(route.split('/')[2]).toBe(gameId)
    })
  })

  describe('Results Route Generation', () => {
    it('should generate results route with UUID', () => {
      const gameId = '123e4567-e89b-12d3-a456-426614174000'
      const route = getResultsRoute(gameId)

      expect(route).toBe(`/results/${gameId}`)
      expect(route).toContain(gameId)
    })

    it('should generate results route with short ID', () => {
      const gameId = 'xyz789'
      const route = getResultsRoute(gameId)

      expect(route).toBe('/results/xyz789')
    })

    it('should handle results ID with special characters', () => {
      const gameId = 'result-789_test-abc'
      const route = getResultsRoute(gameId)

      expect(route).toBe('/results/result-789_test-abc')
    })

    it('should handle numeric results ID', () => {
      const gameId = '67890'
      const route = getResultsRoute(gameId)

      expect(route).toBe('/results/67890')
    })

    it('should handle full UUID format', () => {
      const gameId = '550e8400-e29b-41d4-a716-446655440000'
      const route = getResultsRoute(gameId)

      expect(route).toBe(`/results/${gameId}`)
      expect(route.split('/')[1]).toBe('results')
      expect(route.split('/')[2]).toBe(gameId)
    })
  })

  describe('Route Consistency', () => {
    it('should use same ID for both game and results', () => {
      const gameId = '123e4567-e89b-12d3-a456-426614174000'
      const gameRoute = getGameRoute(gameId)
      const resultsRoute = getResultsRoute(gameId)

      const gameIdFromRoute = gameRoute.split('/')[2]
      const resultsIdFromRoute = resultsRoute.split('/')[2]

      expect(gameIdFromRoute).toBe(resultsIdFromRoute)
      expect(gameIdFromRoute).toBe(gameId)
    })

    it('should generate different paths for game and results', () => {
      const gameId = 'same-id-123'
      const gameRoute = getGameRoute(gameId)
      const resultsRoute = getResultsRoute(gameId)

      expect(gameRoute).not.toBe(resultsRoute)
      expect(gameRoute).toContain('/game/')
      expect(resultsRoute).toContain('/results/')
    })

    it('should preserve ID format in generated routes', () => {
      const gameIds = ['123e4567-e89b-12d3-a456-426614174000', 'abc123', 'game-test_123', '12345']

      gameIds.forEach((gameId) => {
        const gameRoute = getGameRoute(gameId)
        const resultsRoute = getResultsRoute(gameId)

        expect(gameRoute).toContain(gameId)
        expect(resultsRoute).toContain(gameId)
      })
    })
  })

  describe('URL Structure', () => {
    it('should have correct path segments for game route', () => {
      const gameId = 'test-123'
      const route = getGameRoute(gameId)
      const segments = route.split('/')

      expect(segments).toHaveLength(3) // ['', 'game', 'test-123']
      expect(segments[0]).toBe('')
      expect(segments[1]).toBe('game')
      expect(segments[2]).toBe(gameId)
    })

    it('should have correct path segments for results route', () => {
      const gameId = 'test-456'
      const route = getResultsRoute(gameId)
      const segments = route.split('/')

      expect(segments).toHaveLength(3) // ['', 'results', 'test-456']
      expect(segments[0]).toBe('')
      expect(segments[1]).toBe('results')
      expect(segments[2]).toBe(gameId)
    })

    it('should start with forward slash', () => {
      const gameId = 'test-789'

      expect(getGameRoute(gameId)).toMatch(/^\//)
      expect(getResultsRoute(gameId)).toMatch(/^\//)
    })

    it('should not end with forward slash', () => {
      const gameId = 'test-abc'

      expect(getGameRoute(gameId)).not.toMatch(/\/$/)
      expect(getResultsRoute(gameId)).not.toMatch(/\/$/)
    })
  })
})
