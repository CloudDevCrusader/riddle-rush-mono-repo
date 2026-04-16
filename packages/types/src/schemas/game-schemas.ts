/**
 * Zod schemas for game domain types — runtime validation for IndexedDB, APIs, and imports.
 * Static types remain in `game.ts`; keep field shapes in sync when either side changes.
 */
import { z } from 'zod';

export const searchProviderSchema = z.enum(['petscan', 'offline', 'wikipedia']);

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  searchWord: z.string(),
  key: z.string(),
  /** Older IndexedDB rows may omit this; treat as offline. */
  searchProvider: searchProviderSchema.default('offline'),
  additionalData: z.record(z.string(), z.unknown()).optional(),
  letter: z.string().optional(),
});

export const gameAttemptSchema = z.object({
  term: z.string(),
  found: z.boolean(),
  timestamp: z.number(),
});

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  totalScore: z.number(),
  /** Legacy rows may omit round score / submission flags. */
  currentRoundScore: z.number().default(0),
  currentRoundAnswer: z.string().optional(),
  hasSubmitted: z.boolean().default(false),
  avatar: z.string().optional(),
});

export const playerWithRankSchema = playerSchema.extend({
  rank: z.number(),
  isWinner: z.boolean(),
});

const roundPlayerResultSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  answer: z.string(),
  score: z.number(),
});

const roundHistoryEntrySchema = z.object({
  roundNumber: z.number(),
  category: z.string(),
  letter: z.string(),
  timestamp: z.number(),
  playerResults: z.array(roundPlayerResultSchema),
});

export const gameSessionSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  gameName: z.string().optional(),
  players: z.array(playerSchema).default([]),
  currentRound: z.number(),
  currentPlayerIndex: z.number(),
  category: categorySchema,
  letter: z.string(),
  startTime: z.number(),
  endTime: z.number().optional(),
  score: z.number().optional(),
  attempts: z.array(gameAttemptSchema).optional(),
  status: z.enum(['active', 'completed', 'abandoned']),
  roundHistory: z.array(roundHistoryEntrySchema).default([]),
});

export const gameStatisticsSchema = z.object({
  totalGames: z.number(),
  totalAttempts: z.number(),
  correctAttempts: z.number(),
  totalScore: z.number(),
  totalPlayTime: z.number(),
  categoriesPlayed: z.record(z.string(), z.number()).default({}),
  lastPlayed: z.number(),
  bestScore: z.number(),
  averageScore: z.number(),
  streakCurrent: z.number(),
  streakBest: z.number(),
});

export const leaderboardEntrySchema = z.object({
  sessionId: z.string(),
  score: z.number(),
  category: z.string(),
  categoryKey: z.string(),
  playerName: z.string(),
  attempts: z.number(),
  correctAttempts: z.number(),
  timestamp: z.number(),
  duration: z.number(),
  letter: z.string(),
});

export const categorySettingsSchema = z.object({
  enabledCategories: z.array(z.string()).default([]),
  soundEnabled: z.boolean().default(true),
});

export const checkAnswerResponseSchema = z.object({
  found: z.boolean(),
  other: z.array(z.string()),
});

/** Inferred shapes — use when you want schema-derived types without importing interfaces. */
export type CategoryParsed = z.infer<typeof categorySchema>;
export type GameAttemptParsed = z.infer<typeof gameAttemptSchema>;
export type PlayerParsed = z.infer<typeof playerSchema>;
export type PlayerWithRankParsed = z.infer<typeof playerWithRankSchema>;
export type GameSessionParsed = z.infer<typeof gameSessionSchema>;
export type GameStatisticsParsed = z.infer<typeof gameStatisticsSchema>;
export type LeaderboardEntryParsed = z.infer<typeof leaderboardEntrySchema>;
export type CategorySettingsParsed = z.infer<typeof categorySettingsSchema>;
export type CheckAnswerResponseParsed = z.infer<typeof checkAnswerResponseSchema>;

export function parseCategory(data: unknown): CategoryParsed {
  return categorySchema.parse(data);
}

export function parseGameSession(data: unknown): GameSessionParsed {
  return gameSessionSchema.parse(data);
}

export function safeParseGameSession(data: unknown) {
  return gameSessionSchema.safeParse(data);
}

export function parsePlayer(data: unknown): PlayerParsed {
  return playerSchema.parse(data);
}

export function parseGameStatistics(data: unknown): GameStatisticsParsed {
  return gameStatisticsSchema.parse(data);
}

export function safeParseGameStatistics(data: unknown) {
  return gameStatisticsSchema.safeParse(data);
}

export function parseLeaderboardEntry(data: unknown): LeaderboardEntryParsed {
  return leaderboardEntrySchema.parse(data);
}

export function safeParseLeaderboardEntry(data: unknown) {
  return leaderboardEntrySchema.safeParse(data);
}

export function parseCategorySettings(data: unknown): CategorySettingsParsed {
  return categorySettingsSchema.parse(data);
}

export function safeParseCategorySettings(data: unknown) {
  return categorySettingsSchema.safeParse(data);
}

export function parseCheckAnswerResponse(data: unknown): CheckAnswerResponseParsed {
  return checkAnswerResponseSchema.parse(data);
}
