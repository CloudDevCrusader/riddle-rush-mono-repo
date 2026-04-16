import cloneDeep from 'lodash-es/cloneDeep';
import { openDB, type IDBPDatabase } from 'idb';
import { useLogger } from './useLogger';
import type {
  GameSession,
  GameStatistics,
  LeaderboardEntry,
  CategorySettings,
} from '@riddle-rush/types/game';
import {
  safeParseCategorySettings,
  safeParseGameSession,
  safeParseGameStatistics,
  safeParseLeaderboardEntry,
} from '@riddle-rush/types/schemas';

const DB_NAME = 'riddle-rush-db';
const DB_VERSION = 3;
const GAME_SESSION_STORE = 'gameSession';
const GAME_SESSIONS_BY_ID_STORE = 'gameSessionsById';
const GAME_HISTORY_STORE = 'gameHistory';
const STATISTICS_STORE = 'statistics';
const LEADERBOARD_STORE = 'leaderboard';
const SETTINGS_STORE = 'settings';

let dbInstance: IDBPDatabase | null = null;
let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB() {
  // Return cached instance if available
  if (dbInstance) return dbInstance;

  // Return existing promise if DB is being opened
  if (dbPromise) return dbPromise;

  // Create new promise to open DB
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    blocking() {
      dbInstance?.close();
      dbInstance = null;
      dbPromise = null;
    },
    upgrade(db, _oldVersion) {
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(GAME_SESSION_STORE)) {
        db.createObjectStore(GAME_SESSION_STORE);
      }
      if (!db.objectStoreNames.contains(GAME_SESSIONS_BY_ID_STORE)) {
        db.createObjectStore(GAME_SESSIONS_BY_ID_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(GAME_HISTORY_STORE)) {
        const historyStore = db.createObjectStore(GAME_HISTORY_STORE, {
          keyPath: 'id',
        });
        historyStore.createIndex('startTime', 'startTime');
      }
      if (!db.objectStoreNames.contains(STATISTICS_STORE)) {
        db.createObjectStore(STATISTICS_STORE);
      }
      if (!db.objectStoreNames.contains(LEADERBOARD_STORE)) {
        const leaderboardStore = db.createObjectStore(LEADERBOARD_STORE, {
          keyPath: 'sessionId',
        });
        leaderboardStore.createIndex('score', 'score');
        leaderboardStore.createIndex('timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE);
      }
    },
  });

  try {
    dbInstance = await dbPromise;
    dbPromise = null; // Clear promise cache
    return dbInstance;
  } catch (error) {
    dbPromise = null; // Clear promise cache on error
    throw error;
  }
}

export function useIndexedDB() {
  const logger = useLogger();

  const saveGameSession = async (session: GameSession) => {
    try {
      const db = await getDB();

      // Deep clone plain objects so IndexedDB gets a serializable snapshot
      const serialized = session && typeof session === 'object' ? cloneDeep(session) : session;

      // Use transaction for atomic operations
      const tx = db.transaction([GAME_SESSION_STORE, GAME_SESSIONS_BY_ID_STORE], 'readwrite');

      // Save as current session
      await tx.objectStore(GAME_SESSION_STORE).put(serialized, 'current');

      // Also save by ID for direct access if ID exists
      if (session.id) {
        try {
          await tx.objectStore(GAME_SESSIONS_BY_ID_STORE).put(serialized);
        } catch (idSaveError) {
          logger.warn('Failed to save session by ID (non-critical):', idSaveError);
          // Continue even if ID storage fails
        }
      }

      await tx.done;
    } catch (error) {
      logger.error('Error saving game session:', error);
      throw error; // Re-throw to ensure calling code knows about the failure
    }
  };

  const getGameSession = async (): Promise<GameSession | null> => {
    try {
      const db = await getDB();
      const raw = await db.get(GAME_SESSION_STORE, 'current');
      if (raw == null) return null;
      const parsed = safeParseGameSession(raw);
      if (!parsed.success) {
        logger.warn('Invalid stored game session', parsed.error.flatten());
        return null;
      }
      return parsed.data as GameSession;
    } catch (error) {
      logger.error('Error getting game session:', error);
      return null;
    }
  };

  const getGameSessionById = async (sessionId: string): Promise<GameSession | null> => {
    try {
      const db = await getDB();
      const raw = await db.get(GAME_SESSIONS_BY_ID_STORE, sessionId);
      if (raw == null) return null;
      const parsed = safeParseGameSession(raw);
      if (!parsed.success) {
        logger.warn('Invalid game session by id', sessionId, parsed.error.flatten());
        return null;
      }
      return parsed.data as GameSession;
    } catch (error) {
      logger.error('Error getting game session by ID:', error);
      return null;
    }
  };

  const clearGameSession = async () => {
    try {
      const db = await getDB();
      await db.delete(GAME_SESSION_STORE, 'current');
    } catch (error) {
      logger.error('Error clearing game session:', error);
    }
  };

  const saveGameHistory = async (history: GameSession[]) => {
    try {
      const db = await getDB();
      const tx = db.transaction(GAME_HISTORY_STORE, 'readwrite');

      for (const session of history) {
        await tx.store.put(session);
      }

      await tx.done;
    } catch (error) {
      logger.error('Error saving game history:', error);
    }
  };

  const getGameHistory = async (limit = 50): Promise<GameSession[]> => {
    try {
      const db = await getDB();
      const index = db.transaction(GAME_HISTORY_STORE).store.index('startTime');

      // Use cursor for better performance with large datasets
      const sessions: GameSession[] = [];
      let cursor = await index.openCursor(null, 'prev'); // Start from end (newest first)

      while (cursor && sessions.length < limit) {
        const parsed = safeParseGameSession(cursor.value);
        if (parsed.success) sessions.push(parsed.data as GameSession);
        else logger.warn('Skipping invalid history session', parsed.error.flatten());
        cursor = await cursor.continue();
      }

      return sessions;
    } catch (error) {
      logger.error('Error getting game history:', error);
      return [];
    }
  };

  const clearGameHistory = async () => {
    try {
      const db = await getDB();
      await db.clear(GAME_HISTORY_STORE);
    } catch (error) {
      logger.error('Error clearing game history:', error);
    }
  };

  const getStatistics = async (): Promise<GameStatistics | null> => {
    try {
      const db = await getDB();
      const raw = await db.get(STATISTICS_STORE, 'current');
      if (raw == null) return null;
      const parsed = safeParseGameStatistics(raw);
      if (!parsed.success) {
        logger.warn('Invalid stored statistics', parsed.error.flatten());
        return null;
      }
      return parsed.data as GameStatistics;
    } catch (error) {
      logger.error('Error getting statistics:', error);
      return null;
    }
  };

  const saveStatistics = async (stats: GameStatistics) => {
    try {
      const db = await getDB();
      await db.put(STATISTICS_STORE, stats, 'current');
    } catch (error) {
      logger.error('Error saving statistics:', error);
    }
  };

  const initializeStatistics = async (): Promise<GameStatistics> => {
    const stats: GameStatistics = {
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
    };
    await saveStatistics(stats);
    return stats;
  };

  const getLeaderboard = async (limit = 10): Promise<LeaderboardEntry[]> => {
    try {
      const db = await getDB();
      const index = db.transaction(LEADERBOARD_STORE).store.index('score');

      // Use cursor for better performance with large datasets
      const entries: LeaderboardEntry[] = [];
      let cursor = await index.openCursor(null, 'prev'); // Start from highest scores

      while (cursor && entries.length < limit) {
        const parsed = safeParseLeaderboardEntry(cursor.value);
        if (parsed.success) entries.push(parsed.data as LeaderboardEntry);
        else logger.warn('Skipping invalid leaderboard row', parsed.error.flatten());
        cursor = await cursor.continue();
      }

      return entries;
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      return [];
    }
  };

  const saveLeaderboardEntry = async (entry: LeaderboardEntry) => {
    try {
      const db = await getDB();
      await db.put(LEADERBOARD_STORE, entry);
    } catch (error) {
      logger.error('Error saving leaderboard entry:', error);
    }
  };

  const getSettings = async (): Promise<CategorySettings | null> => {
    try {
      const db = await getDB();
      const raw = await db.get(SETTINGS_STORE, 'current');
      if (raw == null) return null;
      const parsed = safeParseCategorySettings(raw);
      if (!parsed.success) {
        logger.warn('Invalid stored settings', parsed.error.flatten());
        return null;
      }
      return parsed.data as CategorySettings;
    } catch (error) {
      logger.error('Error getting settings:', error);
      return null;
    }
  };

  const saveSettings = async (settings: CategorySettings) => {
    try {
      const db = await getDB();
      await db.put(SETTINGS_STORE, settings, 'current');
    } catch (error) {
      logger.error('Error saving settings:', error);
    }
  };

  const initializeSettings = async (): Promise<CategorySettings> => {
    const settings: CategorySettings = {
      enabledCategories: [],
      soundEnabled: true,
    };
    await saveSettings(settings);
    return settings;
  };

  return {
    saveGameSession,
    getGameSession,
    getGameSessionById,
    clearGameSession,
    saveGameHistory,
    getGameHistory,
    clearGameHistory,
    getStatistics,
    saveStatistics,
    initializeStatistics,
    getLeaderboard,
    saveLeaderboardEntry,
    getSettings,
    saveSettings,
    initializeSettings,
  };
}
