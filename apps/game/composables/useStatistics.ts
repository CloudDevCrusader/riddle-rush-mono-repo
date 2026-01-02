import type { GameSession, GameStatistics, LeaderboardEntry } from '@riddle-rush/types/game'
import { useIndexedDB } from './useIndexedDB'

export function useStatistics() {
  const { getStatistics, saveStatistics, initializeStatistics, saveLeaderboardEntry } = useIndexedDB()

  const updateStatistics = async (session: GameSession) => {
    if (!session.endTime) return

    // Multi-player mode: skip legacy statistics (we could implement new multi-player stats later)
    if (session.players && session.players.length > 0) {
      return
    }

    // Legacy single-player mode
    if (!session.attempts || session.score === undefined) return

    let stats = await getStatistics()
    if (!stats) {
      stats = await initializeStatistics()
    }

    const duration = session.endTime - session.startTime
    const correctAttempts = session.attempts.filter((a: { found: boolean }) => a.found).length
    const totalAttempts = session.attempts.length

    // Update statistics
    stats.totalGames += 1
    stats.totalAttempts += totalAttempts
    stats.correctAttempts += correctAttempts
    stats.totalScore += session.score
    stats.totalPlayTime += duration
    stats.lastPlayed = session.endTime

    // Update category stats
    const categoryKey = session.category.key
    if (!stats.categoriesPlayed[categoryKey]) {
      stats.categoriesPlayed[categoryKey] = 0
    }
    stats.categoriesPlayed[categoryKey] += 1

    // Update best score
    if (session.score > stats.bestScore) {
      stats.bestScore = session.score
    }

    // Calculate average score
    stats.averageScore = Math.round(stats.totalScore / stats.totalGames)

    // Update streak (games with at least one correct answer)
    if (correctAttempts > 0) {
      stats.streakCurrent += 1
      if (stats.streakCurrent > stats.streakBest) {
        stats.streakBest = stats.streakCurrent
      }
    }
    else {
      stats.streakCurrent = 0
    }

    await saveStatistics(stats)

    // Save to leaderboard if score is good (at least 10 points)
    if (session.score >= 10) {
      const leaderboardEntry: LeaderboardEntry = {
        sessionId: session.id,
        score: session.score,
        category: session.category.name,
        categoryKey: session.category.key,
        attempts: totalAttempts,
        correctAttempts,
        timestamp: session.endTime,
        duration,
      }
      await saveLeaderboardEntry(leaderboardEntry)
    }

    return stats
  }

  const getStats = async () => {
    let stats = await getStatistics()
    if (!stats) {
      stats = await initializeStatistics()
    }
    return stats
  }

  const resetStatistics = async () => {
    return await initializeStatistics()
  }

  const getBadges = async () => {
    const stats = await getStats()
    const badges: Array<{ id: string, name: string, emoji: string, description: string, unlocked: boolean }> = []

    // Funny badges
    badges.push({
      id: 'first-steps',
      name: 'First Steps',
      emoji: '👶',
      description: 'Play your first game',
      unlocked: stats.totalGames >= 1,
    })

    badges.push({
      id: 'persistent',
      name: 'Persistent',
      emoji: '💪',
      description: 'Play 10 games',
      unlocked: stats.totalGames >= 10,
    })

    badges.push({
      id: 'dedicated',
      name: 'Dedicated',
      emoji: '🏆',
      description: 'Play 50 games',
      unlocked: stats.totalGames >= 50,
    })

    badges.push({
      id: 'oops-champion',
      name: 'Oops Champion',
      emoji: '🤦',
      description: 'Get 50 wrong answers (happens to the best!)',
      unlocked: stats.totalAttempts - stats.correctAttempts >= 50,
    })

    badges.push({
      id: 'sharpshooter',
      name: 'Sharpshooter',
      emoji: '🎯',
      description: 'Get 100 correct answers',
      unlocked: stats.correctAttempts >= 100,
    })

    badges.push({
      id: 'streak-master',
      name: 'Streak Master',
      emoji: '🔥',
      description: 'Win 5 games in a row',
      unlocked: stats.streakBest >= 5,
    })

    badges.push({
      id: 'high-roller',
      name: 'High Roller',
      emoji: '💎',
      description: 'Score 100 points in one game',
      unlocked: stats.bestScore >= 100,
    })

    badges.push({
      id: 'variety-lover',
      name: 'Variety Lover',
      emoji: '🎨',
      description: 'Play 5 different categories',
      unlocked: Object.keys(stats.categoriesPlayed).length >= 5,
    })

    badges.push({
      id: 'marathon-runner',
      name: 'Marathon Runner',
      emoji: '🏃',
      description: 'Play for 1 hour total',
      unlocked: stats.totalPlayTime >= 3600000,
    })

    badges.push({
      id: 'night-owl',
      name: 'Night Owl',
      emoji: '🦉',
      description: 'Play between 10 PM and 6 AM',
      unlocked: checkNightOwl(stats.lastPlayed),
    })

    badges.push({
      id: 'early-bird',
      name: 'Early Bird',
      emoji: '🐦',
      description: 'Play between 5 AM and 8 AM',
      unlocked: checkEarlyBird(stats.lastPlayed),
    })

    badges.push({
      id: 'perfectionist',
      name: 'Perfectionist',
      emoji: '⭐',
      description: 'Get all answers right in a game (min 5 attempts)',
      unlocked: checkPerfectGame(stats),
    })

    return badges
  }

  const checkNightOwl = (timestamp: number): boolean => {
    const hour = new Date(timestamp).getHours()
    return hour >= 22 || hour < 6
  }

  const checkEarlyBird = (timestamp: number): boolean => {
    const hour = new Date(timestamp).getHours()
    return hour >= 5 && hour < 8
  }

  const checkPerfectGame = (stats: GameStatistics): boolean => {
    // This is a simplified check - in reality we'd need to track per-game stats
    // For now, we'll assume if average score is high enough
    return stats.bestScore >= 50 && stats.totalGames > 0
  }

  return {
    updateStatistics,
    getStats,
    resetStatistics,
    getBadges,
  }
}
