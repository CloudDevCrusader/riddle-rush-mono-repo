import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as Vue from 'vue'
import * as VueRouter from 'vue-router'
import * as Pinia from 'pinia'
import { useStatistics } from '../../composables/useStatistics'
import { createGameSession, createCategory, createGameStatistics } from '../utils/factories'
import type { GameStatistics } from '@riddle-rush/types/game'

// Make Vue, VueRouter, and Pinia exports globally available (workspace config has no setupFiles)
Object.assign(globalThis, Vue, VueRouter, Pinia)

// Mutable stats store that tests can manipulate
let storedStats: GameStatistics | null = null

const mockGetStatistics = vi.fn(async () => storedStats)
const mockSaveStatistics = vi.fn(async (stats: GameStatistics) => {
  storedStats = stats
})
const mockInitializeStatistics = vi.fn(async () => {
  const initial: GameStatistics = {
    totalGames: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    totalScore: 0,
    totalPlayTime: 0,
    categoriesPlayed: {},
    lastPlayed: Date.now(),
    bestScore: 0,
    averageScore: 0,
    streakCurrent: 0,
    streakBest: 0,
  }
  storedStats = initial
  return initial
})
const mockSaveLeaderboardEntry = vi.fn().mockResolvedValue(undefined)

vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    getStatistics: mockGetStatistics,
    saveStatistics: mockSaveStatistics,
    initializeStatistics: mockInitializeStatistics,
    saveLeaderboardEntry: mockSaveLeaderboardEntry,
  }),
}))

describe('useStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    storedStats = null
  })

  describe('getStats', () => {
    it('returns existing stats from DB', async () => {
      const existing = createGameStatistics({ totalGames: 5 })
      storedStats = existing

      const { getStats } = useStatistics()
      const result = await getStats()

      expect(result.totalGames).toBe(5)
    })

    it('initializes stats when none exist', async () => {
      storedStats = null

      const { getStats } = useStatistics()
      const result = await getStats()

      expect(mockInitializeStatistics).toHaveBeenCalledOnce()
      expect(result.totalGames).toBe(0)
    })
  })

  describe('resetStatistics', () => {
    it('calls initializeStatistics', async () => {
      const { resetStatistics } = useStatistics()
      await resetStatistics()
      expect(mockInitializeStatistics).toHaveBeenCalledOnce()
    })

    it('returns a fresh stats object with zeroed values', async () => {
      const { resetStatistics } = useStatistics()
      const result = await resetStatistics()
      expect(result.totalGames).toBe(0)
      expect(result.bestScore).toBe(0)
    })
  })

  describe('updateStatistics', () => {
    it('does nothing when session has no endTime', async () => {
      const session = createGameSession()
      // Ensure no endTime
      delete (session as Partial<typeof session>).endTime

      const { updateStatistics } = useStatistics()
      await updateStatistics(session as typeof session)

      expect(mockSaveStatistics).not.toHaveBeenCalled()
    })

    it('does nothing for multiplayer sessions (players array not empty)', async () => {
      const category = createCategory()
      const session = createGameSession({
        category,
        endTime: Date.now(),
        players: [
          {
            id: '1',
            name: 'Alice',
            totalScore: 10,
            currentRoundScore: 0,
            currentRoundAnswer: '',
            hasSubmitted: true,
          },
        ],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      expect(mockSaveStatistics).not.toHaveBeenCalled()
    })

    it('increments totalGames for single-player sessions', async () => {
      storedStats = createGameStatistics({ totalGames: 3 })

      const category = createCategory({ key: 'animals' })
      const session = createGameSession({
        category,
        endTime: Date.now(),
        score: 20,
        attempts: [
          { term: 'Ant', found: true, timestamp: Date.now() },
          { term: 'Bear', found: false, timestamp: Date.now() },
        ],
        players: [],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      expect(mockSaveStatistics).toHaveBeenCalledOnce()
      const savedStats = mockSaveStatistics.mock.calls[0]![0] as GameStatistics
      expect(savedStats.totalGames).toBe(4)
    })

    it('accumulates totalAttempts and correctAttempts', async () => {
      storedStats = createGameStatistics({
        totalGames: 1,
        totalAttempts: 5,
        correctAttempts: 2,
        totalScore: 20,
        averageScore: 20,
      })

      const category = createCategory({ key: 'cities' })
      const session = createGameSession({
        category,
        endTime: Date.now(),
        score: 30,
        attempts: [
          { term: 'Berlin', found: true, timestamp: Date.now() },
          { term: 'Bonn', found: true, timestamp: Date.now() },
          { term: 'Brno', found: false, timestamp: Date.now() },
        ],
        players: [],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      const savedStats = mockSaveStatistics.mock.calls[0]![0] as GameStatistics
      expect(savedStats.totalAttempts).toBe(8)
      expect(savedStats.correctAttempts).toBe(4)
    })

    it('updates bestScore when session score exceeds current best', async () => {
      storedStats = createGameStatistics({
        bestScore: 50,
        totalGames: 1,
        totalScore: 50,
        averageScore: 50,
      })

      const category = createCategory()
      const session = createGameSession({
        category,
        endTime: Date.now(),
        score: 120,
        attempts: [{ term: 'test', found: true, timestamp: Date.now() }],
        players: [],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      const savedStats = mockSaveStatistics.mock.calls[0]![0] as GameStatistics
      expect(savedStats.bestScore).toBe(120)
    })

    it('does not lower bestScore if current session score is lower', async () => {
      storedStats = createGameStatistics({
        bestScore: 100,
        totalGames: 1,
        totalScore: 100,
        averageScore: 100,
      })

      const category = createCategory()
      const session = createGameSession({
        category,
        endTime: Date.now(),
        score: 40,
        attempts: [{ term: 'test', found: true, timestamp: Date.now() }],
        players: [],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      const savedStats = mockSaveStatistics.mock.calls[0]![0] as GameStatistics
      expect(savedStats.bestScore).toBe(100)
    })

    it('increments streakCurrent when player gets at least one correct answer', async () => {
      storedStats = createGameStatistics({
        streakCurrent: 2,
        streakBest: 3,
        totalGames: 2,
        totalScore: 20,
        averageScore: 10,
      })

      const category = createCategory()
      const session = createGameSession({
        category,
        endTime: Date.now(),
        score: 10,
        attempts: [{ term: 'Apple', found: true, timestamp: Date.now() }],
        players: [],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      const savedStats = mockSaveStatistics.mock.calls[0]![0] as GameStatistics
      expect(savedStats.streakCurrent).toBe(3)
    })

    it('resets streakCurrent to 0 when no correct answers', async () => {
      storedStats = createGameStatistics({
        streakCurrent: 5,
        totalGames: 5,
        totalScore: 50,
        averageScore: 10,
      })

      const category = createCategory()
      const session = createGameSession({
        category,
        endTime: Date.now(),
        score: 0,
        attempts: [{ term: 'Zzz', found: false, timestamp: Date.now() }],
        players: [],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      const savedStats = mockSaveStatistics.mock.calls[0]![0] as GameStatistics
      expect(savedStats.streakCurrent).toBe(0)
    })

    it('saves leaderboard entry when score >= 10', async () => {
      storedStats = createGameStatistics()

      const category = createCategory()
      const session = createGameSession({
        category,
        endTime: Date.now(),
        score: 10,
        attempts: [{ term: 'Ant', found: true, timestamp: Date.now() }],
        players: [],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      expect(mockSaveLeaderboardEntry).toHaveBeenCalledOnce()
    })

    it('does not save leaderboard entry when score < 10', async () => {
      storedStats = createGameStatistics()

      const category = createCategory()
      const session = createGameSession({
        category,
        endTime: Date.now(),
        score: 5,
        attempts: [{ term: 'test', found: false, timestamp: Date.now() }],
        players: [],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      expect(mockSaveLeaderboardEntry).not.toHaveBeenCalled()
    })

    it('tracks category in categoriesPlayed', async () => {
      storedStats = createGameStatistics({ totalGames: 0, totalScore: 0, averageScore: 0 })
      storedStats.categoriesPlayed = {}

      const category = createCategory({ key: 'food' })
      const session = createGameSession({
        category,
        endTime: Date.now(),
        score: 20,
        attempts: [{ term: 'Apple', found: true, timestamp: Date.now() }],
        players: [],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      const savedStats = mockSaveStatistics.mock.calls[0]![0] as GameStatistics
      expect(savedStats.categoriesPlayed['food']).toBe(1)
    })

    it('recalculates averageScore correctly', async () => {
      storedStats = createGameStatistics({
        totalGames: 3,
        totalScore: 90,
        averageScore: 30,
      })

      const category = createCategory()
      const session = createGameSession({
        category,
        endTime: Date.now(),
        score: 10,
        attempts: [{ term: 'test', found: true, timestamp: Date.now() }],
        players: [],
      })

      const { updateStatistics } = useStatistics()
      await updateStatistics(session)

      const savedStats = mockSaveStatistics.mock.calls[0]![0] as GameStatistics
      // (90 + 10) / 4 = 25
      expect(savedStats.averageScore).toBe(25)
    })
  })

  describe('getBadges', () => {
    it('returns an array of badge objects', async () => {
      storedStats = createGameStatistics()
      const { getBadges } = useStatistics()
      const badges = await getBadges()
      expect(Array.isArray(badges)).toBe(true)
      expect(badges.length).toBeGreaterThan(0)
    })

    it('first-steps badge unlocked when totalGames >= 1', async () => {
      storedStats = createGameStatistics({ totalGames: 1 })
      const { getBadges } = useStatistics()
      const badges = await getBadges()
      const badge = badges.find((b) => b.id === 'first-steps')
      expect(badge?.unlocked).toBe(true)
    })

    it('first-steps badge locked when totalGames === 0', async () => {
      storedStats = createGameStatistics({ totalGames: 0 })
      const { getBadges } = useStatistics()
      const badges = await getBadges()
      const badge = badges.find((b) => b.id === 'first-steps')
      expect(badge?.unlocked).toBe(false)
    })

    it('high-roller badge unlocked when bestScore >= 100', async () => {
      storedStats = createGameStatistics({ bestScore: 100 })
      const { getBadges } = useStatistics()
      const badges = await getBadges()
      const badge = badges.find((b) => b.id === 'high-roller')
      expect(badge?.unlocked).toBe(true)
    })

    it('high-roller badge locked when bestScore < 100', async () => {
      storedStats = createGameStatistics({ bestScore: 99 })
      const { getBadges } = useStatistics()
      const badges = await getBadges()
      const badge = badges.find((b) => b.id === 'high-roller')
      expect(badge?.unlocked).toBe(false)
    })

    it('streak-master badge unlocked when streakBest >= 5', async () => {
      storedStats = createGameStatistics({ streakBest: 5 })
      const { getBadges } = useStatistics()
      const badges = await getBadges()
      const badge = badges.find((b) => b.id === 'streak-master')
      expect(badge?.unlocked).toBe(true)
    })

    it('variety-lover badge unlocked when 5 different categories played', async () => {
      storedStats = createGameStatistics({
        categoriesPlayed: {
          animals: 1,
          cities: 2,
          food: 1,
          sports: 3,
          countries: 1,
        },
      })
      const { getBadges } = useStatistics()
      const badges = await getBadges()
      const badge = badges.find((b) => b.id === 'variety-lover')
      expect(badge?.unlocked).toBe(true)
    })

    it('variety-lover badge locked when fewer than 5 categories played', async () => {
      storedStats = createGameStatistics({
        categoriesPlayed: { animals: 1, cities: 2, food: 1 },
      })
      const { getBadges } = useStatistics()
      const badges = await getBadges()
      const badge = badges.find((b) => b.id === 'variety-lover')
      expect(badge?.unlocked).toBe(false)
    })

    it('each badge has id, name, emoji, description, and unlocked fields', async () => {
      storedStats = createGameStatistics()
      const { getBadges } = useStatistics()
      const badges = await getBadges()

      for (const badge of badges) {
        expect(badge).toHaveProperty('id')
        expect(badge).toHaveProperty('name')
        expect(badge).toHaveProperty('emoji')
        expect(badge).toHaveProperty('description')
        expect(badge).toHaveProperty('unlocked')
      }
    })
  })
})
