/**
 * Application route constants
 * Provides type-safe route paths to prevent typos
 */
export const ROUTES = {
  HOME: '/',
  PLAYERS: '/players',
  ROUND_START: '/round-start',
  GAME: '/game',
  RESULTS: '/results',
  LEADERBOARD: '/leaderboard',
  SETTINGS: '/settings',
  LANGUAGE: '/language',
  CREDITS: '/credits',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = typeof ROUTES[RouteKey]
