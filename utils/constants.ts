/**
 * Shared constants across the application
 * Centralized location for magic numbers and configuration values
 */

// Game Constants
export const SCORE_PER_CORRECT_ANSWER = 10
export const SCORE_INCREMENT = 10
export const MIN_ROUND_NUMBER = 1
export const MAX_PLAYERS = 6
export const MAX_SUGGESTIONS = 4
export const DEFAULT_DISPLAYED_CATEGORIES = 9

// Timing Constants (in milliseconds)
export const NAVIGATION_DELAY_MS = 500
export const WHEEL_FADE_DELAY_MS = 800
export const RESULTS_DISPLAY_DURATION_MS = 2000

// PetScan API Constants
export const PETSCAN_MAX_SITELINK_COUNT = '9999'
export const PETSCAN_MAX_RESULTS = '9999995'
export const PETSCAN_LANGUAGE = 'de'
export const PETSCAN_PROJECT = 'wikipedia'

// Alphabet
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// IndexedDB Constants
export const DB_NAME = 'guess-game-db'
export const DB_VERSION = 2
export const DEFAULT_HISTORY_LIMIT = 50
export const DEFAULT_LEADERBOARD_LIMIT = 10
