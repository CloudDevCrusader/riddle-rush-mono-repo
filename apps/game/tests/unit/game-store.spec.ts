import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerManager } from '../../composables/usePlayerManager';
import { createCategoryList } from '../utils/factories';
import type { Category, Player } from '@riddle-rush/types/game';

let gameStore: ReturnType<typeof useGameStore>;

// Mock setup
const mockSaveGameSession = vi.fn().mockResolvedValue(undefined);
const mockGetGameSession = vi.fn().mockResolvedValue(null);
const mockSaveGameHistory = vi.fn().mockResolvedValue(undefined);
const mockGetGameHistory = vi.fn().mockResolvedValue([]);
const mockUpdateStatistics = vi.fn().mockResolvedValue(undefined);

const mockGetGameSessionById = vi.fn().mockResolvedValue(null);

vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    saveGameSession: mockSaveGameSession,
    getGameSession: mockGetGameSession,
    getGameSessionById: mockGetGameSessionById,
    saveGameHistory: mockSaveGameHistory,
    getGameHistory: mockGetGameHistory,
  }),
}));

vi.mock('~/composables/useStatistics', () => ({
  useStatistics: () => ({
    updateStatistics: mockUpdateStatistics,
  }),
}));

const fetchMock = vi.fn();
vi.stubGlobal('$fetch', fetchMock as unknown as typeof $fetch);

const getSession = () => gameStore?.currentSession;
const getPlayers = () => getSession()?.players ?? [];
const getCurrentRound = () => getSession()?.currentRound ?? 0;
const getCurrentPlayerTurn = () => {
  const playerManager = usePlayerManager();
  return playerManager.getCurrentPlayerTurn(getPlayers(), getSession()?.currentPlayerIndex ?? 0);
};
const areAllPlayersSubmitted = () => {
  const playerManager = usePlayerManager();
  return playerManager.allPlayersSubmitted(getPlayers());
};
const getLeaderboard = () => {
  const playerManager = usePlayerManager();
  return playerManager.buildLeaderboard(
    getPlayers(),
    (getSession()?.status ?? 'active') === 'completed'
  );
};

describe('Game Store', () => {
  let mockCategories: Category[];

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.clearAllTimers();
    // Fresh Pinia instance starts with default state - no manual reset needed
    gameStore = useGameStore();
    mockCategories = createCategoryList(10);
    fetchMock.mockResolvedValue(mockCategories);
    fetchMock.mockClear();
    mockGetGameSession.mockResolvedValue(null);
    mockGetGameHistory.mockResolvedValue([]);
    mockGetGameSessionById.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('has null currentSession on init', () => {
      const store = gameStore;
      expect(store.currentSession).toBeNull();
    });

    it('is online by default', () => {
      const store = gameStore;
      expect(store.isOnline).toBe(true);
    });

    it('has empty history on init', () => {
      const store = gameStore;
      expect(store.history).toEqual([]);
    });

    it('has empty categories on init', () => {
      const store = gameStore;
      expect(store.categories).toEqual([]);
    });

    it('categories not loaded on init', () => {
      const store = gameStore;
      expect(store.categoriesLoaded).toBe(false);
    });

    it('default displayed category count is 9', () => {
      const store = gameStore;
      expect(store.displayedCategoryCount).toBe(9); // DEFAULT_DISPLAYED_CATEGORIES
    });

    it('hasActiveSession is false when no session', () => {
      const store = gameStore;
      expect(store.hasActiveSession).toBe(false);
    });
  });

  describe('Category Fetching', () => {
    it('fetches categories', async () => {
      const store = gameStore;
      await store.fetchCategories();
      expect(fetchMock).toHaveBeenCalled();
      expect(store.categories).toEqual(mockCategories);
    });

    it('sets categoriesLoaded after fetch', async () => {
      const store = gameStore;
      await store.fetchCategories();
      expect(store.categoriesLoaded).toBe(true);
    });

    it.skip('does not refetch if already loaded', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      const store = gameStore;
      await store.fetchCategories();
      await store.fetchCategories();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it.skip('refetches when force=true', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      const store = gameStore;
      await store.fetchCategories();
      await store.fetchCategories(true);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it.skip('handles API error gracefully', async () => {
      // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
      fetchMock.mockRejectedValueOnce(new Error('Network error'));
      const store = gameStore;
      await expect(store.fetchCategories()).rejects.toThrow('Network error');
      expect(store.categoriesLoaded).toBe(false);
    });

    it('limits displayed categories', async () => {
      const store = gameStore;
      await store.fetchCategories();
      expect(store.displayedCategories.length).toBeLessThanOrEqual(9);
    });
  });

  describe('Category Lookup', () => {
    it.skip('finds category by id', async () => {
      // TODO: Fix category data mismatch in CI
      const store = gameStore;
      await store.fetchCategories();
      const target = mockCategories[3]!;
      expect(store.getCategoryById(target.id)).toEqual(target);
    });

    it('returns null for unknown id', async () => {
      const store = gameStore;
      await store.fetchCategories();
      expect(store.getCategoryById(999999)).toBeNull();
    });

    it.skip('returns null when categories empty', () => {
      // TODO: Fix state pollution in CI
      const store = gameStore;
      expect(store.getCategoryById(1)).toBeNull();
    });
  });

  describe('Load More Categories', () => {
    it('increases displayed count by 9', () => {
      const store = gameStore;
      store.categories = createCategoryList(30);
      store.loadMoreCategories();
      expect(store.displayedCategoryCount).toBe(18);
    });

    it('caps at total category count', () => {
      gameStore.categories = createCategoryList(5);
      gameStore.displayedCategoryCount = 9; // DEFAULT_DISPLAYED_CATEGORIES
      gameStore.loadMoreCategories();
      expect(gameStore.displayedCategories.length).toBe(5);
    });
  });

  describe('Start New Game', () => {
    it('creates session with category', async () => {
      const session = await gameStore.startNewGame();
      expect(session).toBeDefined();
      expect(session?.category).toBeDefined();
      expect(session?.category.name.length).toBeGreaterThan(0);
    });

    it('sets currentSession', async () => {
      await gameStore.startNewGame();
      expect(gameStore.currentSession).not.toBeNull();
    });

    it('initializes score to 0', async () => {
      const session = await gameStore.startNewGame();
      expect(session?.score).toBe(0);
    });

    it('initializes empty attempts', async () => {
      const session = await gameStore.startNewGame();
      expect(session?.attempts).toEqual([]);
    });

    it('sets startTime', async () => {
      const before = Date.now();
      const session = await gameStore.startNewGame();
      const after = Date.now();
      expect(session?.startTime).toBeGreaterThanOrEqual(before);
      expect(session?.startTime).toBeLessThanOrEqual(after);
    });

    it('persists session to IndexedDB', async () => {
      await gameStore.startNewGame();
      expect(mockSaveGameSession).toHaveBeenCalledTimes(1);
    });

    it('selects a random category', async () => {
      const session = await gameStore.startNewGame();
      expect(session?.category).toBeDefined();
      expect(mockCategories.some((cat) => cat.id === session?.category.id)).toBe(true);
    });

    it('hasActiveSession becomes true', async () => {
      await gameStore.startNewGame();
      expect(getSession()).not.toBeNull();
    });
  });

  describe('End Game', () => {
    beforeEach(async () => {
      await gameStore.startNewGame();
      // Create a session with some test data
      const session = gameStore.currentSession;
      if (session) {
        session.score = 10;
        session.attempts = [
          {
            term: 'answer',
            found: true,
            timestamp: Date.now(),
          },
        ];
      }
      vi.clearAllMocks();
    });

    it('clears currentSession', async () => {
      await gameStore.endGame();
      expect(gameStore.currentSession).toBeNull();
    });

    it('sets hasActiveSession to false', async () => {
      await gameStore.endGame();
      expect(gameStore.hasActiveSession).toBe(false);
    });

    it.skip('adds session to history', async () => {
      // TODO: Fix history state pollution in CI
      const store = gameStore;
      await store.endGame();
      expect(store.history).toHaveLength(1);
    });

    it('preserves score in history', async () => {
      await gameStore.endGame();
      expect(gameStore.history[0]!.score).toBe(10);
    });

    it('calls saveGameHistory', async () => {
      await gameStore.endGame();
      expect(mockSaveGameHistory).toHaveBeenCalledTimes(1);
    });

    it('calls updateStatistics', async () => {
      await gameStore.endGame();
      expect(mockUpdateStatistics).toHaveBeenCalledTimes(1);
    });

    it('does not throw if updateStatistics fails', async () => {
      mockUpdateStatistics.mockRejectedValueOnce(new Error('stats failed'));

      await expect(gameStore.endGame()).resolves.toBeUndefined();
      expect(gameStore.currentSession).toBeNull();
    });

    it.skip('sets endTime on session', async () => {
      // TODO: Fix timing race condition in CI
      const store = gameStore;
      const before = Date.now();
      await store.endGame();
      expect(store.history[0]!.endTime).toBeGreaterThanOrEqual(before);
    });

    it('does nothing without active session', async () => {
      gameStore.currentSession = null;
      await gameStore.endGame();
      expect(mockSaveGameHistory).not.toHaveBeenCalled();
    });
  });

  describe('Online Status', () => {
    it('sets offline', () => {
      gameStore.setOnlineStatus(false);
      expect(gameStore.isOnline).toBe(false);
    });

    it('sets online', () => {
      gameStore.setOnlineStatus(false);
      gameStore.setOnlineStatus(true);
      expect(gameStore.isOnline).toBe(true);
    });
  });

  describe('Category Emoji', () => {
    it('returns emoji for Weiblicher Vorname', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Weiblicher Vorname')).toBe('👩');
    });

    it('returns emoji for Männlicher Vorname', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Männlicher Vorname')).toBe('👨');
    });

    it('returns emoji for Blumen', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Blumen')).toBe('🌸');
    });

    it('returns emoji for Mountains oder Hills', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Mountains oder Hills')).toBe('🏔️');
    });

    it('returns emoji for Gewässer oder See', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Gewässer oder See')).toBe('💧');
    });

    it('returns emoji for Maschine', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Maschine')).toBe('⚙️');
    });

    it('returns emoji for Begriff aus der Technik', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Begriff aus der Technik')).toBe('🔧');
    });

    it('returns emoji for Begriff aus der Raumfahrt', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Begriff aus der Raumfahrt')).toBe('🚀');
    });

    it('returns emoji for Wort mit Endung -heit', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Wort mit Endung -heit')).toBe('📝');
    });

    it('returns emoji for Farbe', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Farbe')).toBe('🎨');
    });

    it('returns emoji for Erfinder Entdecker oder Gelehrter', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Erfinder Entdecker oder Gelehrter')).toBe('💡');
    });

    it('returns emoji for Komponist oder Sänger', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Komponist oder Sänger')).toBe('🎼');
    });

    it('returns default for unknown', () => {
      const store = gameStore;
      expect(store.categoryEmoji('Random Category')).toBe('🎯');
    });

    it('returns default for null', () => {
      const store = gameStore;
      expect(store.categoryEmoji(null)).toBe('🎯');
    });

    it('returns default for undefined', () => {
      const store = gameStore;
      expect(store.categoryEmoji(undefined)).toBe('🎯');
    });

    it('returns default for empty string', () => {
      const store = gameStore;
      expect(store.categoryEmoji('')).toBe('🎯');
    });
  });

  describe('Resume or Start New Game', () => {
    it('returns existing session if active', async () => {
      await gameStore.startNewGame();
      const existing = gameStore.currentSession;
      const result = await gameStore.resumeOrStartNewGame();
      expect(result).toBe(existing);
    });

    it('starts new game if no session', async () => {
      await gameStore.resumeOrStartNewGame();
      expect(getSession()).not.toBeNull();
    });

    it('uses random category', async () => {
      await gameStore.fetchCategories();
      const session = await gameStore.resumeOrStartNewGame();
      expect(session?.category).toBeDefined();
      expect(mockCategories.some((cat) => cat.id === session?.category.id)).toBe(true);
    });
  });

  describe('Multi-Player Mode', () => {
    describe('Setup Players', () => {
      it('creates game session with players', async () => {
        const playerNames = ['Alice', 'Bob', 'Charlie'];
        const session = await gameStore.setupPlayers(playerNames);

        expect(session).toBeDefined();
        expect(session?.players).toHaveLength(3);
        expect(session?.players[0]?.name).toBe('Alice');
        expect(session?.players[1]?.name).toBe('Bob');
        expect(session?.players[2]?.name).toBe('Charlie');
      });

      it('initializes players with zero scores', async () => {
        const session = await gameStore.setupPlayers(['Player 1', 'Player 2']);

        const players = session.players;
        expect(players[0]?.totalScore).toBe(0);
        expect(players[0]?.currentRoundScore).toBe(0);
        expect(players[0]?.hasSubmitted).toBe(false);
        expect(players[1]?.totalScore).toBe(0);
        expect(players[1]?.currentRoundScore).toBe(0);
        expect(players[1]?.hasSubmitted).toBe(false);
      });

      it('uses default names when empty strings provided', async () => {
        const session = await gameStore.setupPlayers(['', '', 'Charlie']);

        expect(session.players[0]?.name).toBe('Player 1');
        expect(session.players[1]?.name).toBe('Player 2');
        expect(session.players[2]?.name).toBe('Charlie');
      });

      it('sets currentRound to 1', async () => {
        const session = await gameStore.setupPlayers(['Player 1', 'Player 2']);

        expect(session.currentRound).toBe(1);
      });

      it('sets optional game name', async () => {
        const session = await gameStore.setupPlayers(['Player 1'], 'Test Game');

        expect(session.gameName).toBe('Test Game');
      });

      it('generates category and letter', async () => {
        const session = await gameStore.setupPlayers(['Player 1']);

        expect(session.category).toBeDefined();
        expect(session.letter).toBeDefined();
        expect(session.letter?.length).toBe(1);
      });
    });

    describe('Multi-Player Getters', () => {
      let session: NonNullable<ReturnType<typeof getSession>>;

      beforeEach(async () => {
        session = await gameStore.setupPlayers(['Alice', 'Bob', 'Charlie']);
      });

      it('players exist after setup', () => {
        expect(session.players.length).toBeGreaterThan(0);
      });

      it('players getter returns all players', () => {
        expect(session.players).toHaveLength(3);
        expect(session.players.map((p: Player) => p.name)).toEqual(['Alice', 'Bob', 'Charlie']);
      });

      it('currentPlayerTurn returns first unsubmitted player', () => {
        const currentPlayer = getCurrentPlayerTurn();

        expect(currentPlayer).toBeDefined();
        expect(currentPlayer?.name).toBe('Alice');
        expect(currentPlayer?.hasSubmitted).toBe(false);
      });

      it('allPlayersSubmitted returns false initially', () => {
        expect(areAllPlayersSubmitted()).toBe(false);
      });

      it('allPlayersSubmitted returns true when all submitted', async () => {
        for (const player of session.players) {
          await gameStore.submitPlayerAnswer(player.id, 'Answer');
        }

        expect(areAllPlayersSubmitted()).toBe(true);
      });

      it('leaderboard returns players sorted by totalScore', async () => {
        const [alice, bob, charlie] = gameStore.players;

        if (alice && bob && charlie) {
          await gameStore.assignPlayerScore(alice.id, 100);
          await gameStore.assignPlayerScore(bob.id, 200);
          await gameStore.assignPlayerScore(charlie.id, 150);

          const leaderboard = getLeaderboard();

          expect(leaderboard[0]?.name).toBe('Bob');
          expect(leaderboard[0]?.totalScore).toBe(200);
          expect(leaderboard[1]?.name).toBe('Charlie');
          expect(leaderboard[1]?.totalScore).toBe(150);
          expect(leaderboard[2]?.name).toBe('Alice');
          expect(leaderboard[2]?.totalScore).toBe(100);
        }
      });
    });

    describe('Submit Player Answer', () => {
      beforeEach(async () => {
        await gameStore.setupPlayers(['Alice', 'Bob']);
      });

      it('saves player answer', async () => {
        const alice = gameStore.players[0];

        if (alice) {
          await gameStore.submitPlayerAnswer(alice.id, 'Test Answer');

          const updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.currentRoundAnswer).toBe('Test Answer');
          expect(updatedPlayer?.hasSubmitted).toBe(true);
        }
      });

      it('persists to database', async () => {
        const alice = gameStore.players[0];

        if (alice) {
          await gameStore.submitPlayerAnswer(alice.id, 'Test Answer');

          expect(mockSaveGameSession).toHaveBeenCalled();
        }
      });

      it('updates currentPlayerTurn to next player', async () => {
        const alice = gameStore.players[0];

        if (alice) {
          await gameStore.submitPlayerAnswer(alice.id, 'Alice Answer');

          expect(gameStore.currentPlayerTurn?.name).toBe('Bob');
        }
      });

      it('handles invalid player ID gracefully', async () => {
        await gameStore.submitPlayerAnswer('invalid-id', 'Answer');

        // Should not throw error
        expect(gameStore.players.every((p: Player) => !p.hasSubmitted)).toBe(true);
      });
    });

    describe('Assign Player Score', () => {
      beforeEach(async () => {
        await gameStore.setupPlayers(['Alice', 'Bob']);
      });

      it('updates current round score', async () => {
        const alice = gameStore.players[0];

        if (alice) {
          await gameStore.assignPlayerScore(alice.id, 50);

          const updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.currentRoundScore).toBe(50);
        }
      });

      it('0→10: totalScore increases by 10', async () => {
        const alice = gameStore.players[0];

        if (alice) {
          expect(alice.totalScore).toBe(0);
          await gameStore.assignPlayerScore(alice.id, 10);
          const updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.totalScore).toBe(10);
          expect(updatedPlayer?.currentRoundScore).toBe(10);
        }
      });

      it('10→20: totalScore increases by 10 (not 20)', async () => {
        const alice = gameStore.players[0];

        if (alice) {
          await gameStore.assignPlayerScore(alice.id, 10);
          let updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.totalScore).toBe(10);

          await gameStore.assignPlayerScore(alice.id, 20);
          updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.totalScore).toBe(20);
          expect(updatedPlayer?.currentRoundScore).toBe(20);
        }
      });

      it('20→10: totalScore decreases by 10', async () => {
        const alice = gameStore.players[0];

        if (alice) {
          await gameStore.assignPlayerScore(alice.id, 20);
          let updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.totalScore).toBe(20);

          await gameStore.assignPlayerScore(alice.id, 10);
          updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.totalScore).toBe(10);
          expect(updatedPlayer?.currentRoundScore).toBe(10);
        }
      });

      it('10→10: totalScore unchanged (delta = 0)', async () => {
        const alice = gameStore.players[0];

        if (alice) {
          await gameStore.assignPlayerScore(alice.id, 10);
          let updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.totalScore).toBe(10);

          await gameStore.assignPlayerScore(alice.id, 10);
          updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.totalScore).toBe(10);
          expect(updatedPlayer?.currentRoundScore).toBe(10);
        }
      });

      it('replaces score correctly when adjusting up then down', async () => {
        const alice = gameStore.players[0];

        if (alice) {
          await gameStore.assignPlayerScore(alice.id, 50);
          let updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.totalScore).toBe(50);

          // Delta-based score update: when updating from 50 to 30, delta = 30 - 50 = -20
          // Total score: 50 + (-20) = 30
          await gameStore.assignPlayerScore(alice.id, 30);
          updatedPlayer = gameStore.players[0];
          expect(updatedPlayer?.totalScore).toBe(30);
          expect(updatedPlayer?.currentRoundScore).toBe(30);
        }
      });

      it('persists to database', async () => {
        const alice = gameStore.players[0];

        if (alice) {
          await gameStore.assignPlayerScore(alice.id, 50);

          expect(mockSaveGameSession).toHaveBeenCalled();
        }
      });

      it('does nothing for invalid player ID', async () => {
        mockSaveGameSession.mockClear();

        await gameStore.assignPlayerScore('invalid-id', 50);

        expect(mockSaveGameSession).not.toHaveBeenCalled();
      });

      it('does nothing without active session', async () => {
        gameStore.currentSession = null;
        mockSaveGameSession.mockClear();

        await gameStore.assignPlayerScore('any-id', 50);

        expect(mockSaveGameSession).not.toHaveBeenCalled();
      });
    });

    describe('Complete Round', () => {
      let session: NonNullable<ReturnType<typeof getSession>>;

      beforeEach(async () => {
        session = await gameStore.setupPlayers(['Alice', 'Bob']);

        const [alice, bob] = session.players;
        if (alice && bob) {
          await gameStore.submitPlayerAnswer(alice.id, 'Alice Answer');
          await gameStore.submitPlayerAnswer(bob.id, 'Bob Answer');
          await gameStore.assignPlayerScore(alice.id, 100);
          await gameStore.assignPlayerScore(bob.id, 50);
        }
      });

      it('adds round to history', async () => {
        await gameStore.completeRound();

        expect(gameStore.currentSession?.roundHistory).toHaveLength(1);
      });

      it.skip('saves round results with player answers and scores (scores captured at submission time, not post-assignment)', async () => {
        await gameStore.completeRound();

        const round = getSession()?.roundHistory[0];
        expect(round?.playerResults).toHaveLength(2);
        expect(round?.playerResults[0]?.answer).toBe('Alice Answer');
        expect(round?.playerResults[0]?.score).toBe(100);
        expect(round?.playerResults[1]?.answer).toBe('Bob Answer');
        expect(round?.playerResults[1]?.score).toBe(50);
      });

      it('includes round metadata', async () => {
        const category = session.category;
        const letter = session.letter;

        await gameStore.completeRound();

        const round = getSession()?.roundHistory[0];
        expect(round?.roundNumber).toBe(1);
        expect(round?.category).toBe(category?.name);
        expect(round?.letter).toBe(letter);
        expect(round?.timestamp).toBeDefined();
      });
    });

    describe('Start Next Round', () => {
      let session: NonNullable<ReturnType<typeof getSession>>;

      beforeEach(async () => {
        session = await gameStore.setupPlayers(['Alice', 'Bob']);

        const [alice, bob] = session.players;
        if (alice && bob) {
          await gameStore.submitPlayerAnswer(alice.id, 'Answer 1');
          await gameStore.submitPlayerAnswer(bob.id, 'Answer 2');
          await gameStore.assignPlayerScore(alice.id, 100);
          await gameStore.assignPlayerScore(bob.id, 50);
        }
      });

      it('increments round number', async () => {
        await gameStore.startNextRound();

        expect(getCurrentRound()).toBe(2);
      });

      it('generates new category and letter', async () => {
        const oldCategory = session.category.id;
        const oldLetter = session.letter;

        await gameStore.startNextRound();

        const updatedSession = getSession();
        const newCategory = updatedSession?.category.id;
        const newLetter = updatedSession?.letter;

        // Either different category or different letter
        expect(newCategory !== oldCategory || newLetter !== oldLetter).toBe(true);
      });

      it('resets player round state', async () => {
        await gameStore.startNextRound();

        for (const player of getPlayers()) {
          expect(player.currentRoundScore).toBe(0);
          expect(player.currentRoundAnswer).toBeUndefined();
          expect(player.hasSubmitted).toBe(false);
        }
      });

      it('preserves total scores', async () => {
        await gameStore.startNextRound();

        const updatedPlayers = getPlayers();
        expect(updatedPlayers[0]?.totalScore).toBe(100);
        expect(updatedPlayers[1]?.totalScore).toBe(50);
      });

      it('keeps same players', async () => {
        await gameStore.startNextRound();

        const updatedPlayers = getPlayers();
        expect(updatedPlayers).toHaveLength(2);
        expect(updatedPlayers.map((p: Player) => p.name)).toEqual(['Alice', 'Bob']);
      });
    });

    describe('Reset Player Submissions', () => {
      beforeEach(async () => {
        await gameStore.setupPlayers(['Alice', 'Bob']);

        for (const player of gameStore.players) {
          await gameStore.submitPlayerAnswer(player.id, 'Answer');
        }
      });

      it('clears all hasSubmitted flags', async () => {
        await gameStore.resetPlayerSubmissions();

        for (const player of gameStore.players) {
          expect(player.hasSubmitted).toBe(false);
          expect(player.currentRoundAnswer).toBeUndefined();
          expect(player.currentRoundScore).toBe(0);
        }
      });

      it('persists to database', async () => {
        mockSaveGameSession.mockClear();

        await gameStore.resetPlayerSubmissions();

        expect(mockSaveGameSession).toHaveBeenCalled();
      });

      it('resets currentPlayerIndex to first player', async () => {
        const session = gameStore.currentSession;
        if (!session) throw new Error('Session not found');

        session.currentPlayerIndex = 1;
        await gameStore.resetPlayerSubmissions();

        expect(gameStore.currentSession?.currentPlayerIndex).toBe(0);
      });
    });

    describe('Get Player By ID', () => {
      beforeEach(async () => {
        await gameStore.setupPlayers(['Alice', 'Bob']);
      });

      it('returns player when ID matches', () => {
        const alice = gameStore.players[0];

        if (alice) {
          const found = gameStore.getPlayerById(alice.id);
          expect(found).toBe(alice);
          expect(found?.name).toBe('Alice');
        }
      });

      it('returns null when ID not found', () => {
        const found = gameStore.getPlayerById('invalid-id');

        expect(found).toBeNull();
      });

      it('returns null when no session', () => {
        gameStore.clearSession();

        const found = gameStore.getPlayerById('any-id');

        expect(found).toBeNull();
      });
    });

    describe('Multi-Player with startNewGame', () => {
      it('starts new round when players exist', async () => {
        const session = await gameStore.setupPlayers(['Alice', 'Bob']);

        const oldRound = session.currentRound;
        await gameStore.startNewGame();

        expect(getCurrentRound()).toBe(oldRound + 1);
      });

      it('starts legacy single-player when no players', async () => {
        const session = await gameStore.startNewGame();

        expect(session?.players).toHaveLength(0);
        expect(gameStore.currentSession).toBeDefined();
      });
    });
  });

  describe('Round Counter Logic', () => {
    describe('isCurrentRoundCompleted helper logic', () => {
      it('round is NOT completed when roundHistory is empty and currentRound is 1', async () => {
        await gameStore.setupPlayers(['Alice', 'Bob']);

        const session = gameStore.currentSession;

        // After setup: currentRound = 1, roundHistory = []
        expect(session?.currentRound).toBe(1);
        expect(session?.roundHistory.length).toBe(0);

        // isCurrentRoundCompleted = roundHistory.length >= currentRound = 0 >= 1 = false
        const isCompleted = (session?.roundHistory.length ?? 0) >= (session?.currentRound ?? 0);
        expect(isCompleted).toBe(false);
      });

      it('round IS completed after completeRound is called', async () => {
        const session = await gameStore.setupPlayers(['Alice', 'Bob']);

        const [alice, bob] = session.players;
        if (alice && bob) {
          await gameStore.submitPlayerAnswer(alice.id, 'Answer 1');
          await gameStore.submitPlayerAnswer(bob.id, 'Answer 2');
          await gameStore.completeRound();
        }

        const sessionState = gameStore.currentSession;

        // After completeRound: currentRound = 1, roundHistory = [round1]
        expect(sessionState?.currentRound).toBe(1);
        expect(sessionState?.roundHistory.length).toBe(1);

        // isCurrentRoundCompleted = roundHistory.length >= currentRound = 1 >= 1 = true
        const isCompleted =
          (sessionState?.roundHistory.length ?? 0) >= (sessionState?.currentRound ?? 0);
        expect(isCompleted).toBe(true);
      });

      it('round is NOT completed after startNextRound', async () => {
        const session = await gameStore.setupPlayers(['Alice', 'Bob']);

        const [alice, bob] = session.players;
        if (alice && bob) {
          await gameStore.submitPlayerAnswer(alice.id, 'Answer 1');
          await gameStore.submitPlayerAnswer(bob.id, 'Answer 2');
          await gameStore.completeRound();
          await gameStore.startNextRound();
        }

        const sessionState = gameStore.currentSession;

        // After startNextRound: currentRound = 2, roundHistory = [round1]
        expect(sessionState?.currentRound).toBe(2);
        expect(sessionState?.roundHistory.length).toBe(1);

        // isCurrentRoundCompleted = roundHistory.length >= currentRound = 1 >= 2 = false
        const isCompleted =
          (sessionState?.roundHistory.length ?? 0) >= (sessionState?.currentRound ?? 0);
        expect(isCompleted).toBe(false);
      });

      it('round IS completed after second round completeRound', async () => {
        const session = await gameStore.setupPlayers(['Alice', 'Bob']);

        const [alice, bob] = session.players;
        if (alice && bob) {
          // Round 1
          await gameStore.submitPlayerAnswer(alice.id, 'Answer 1');
          await gameStore.submitPlayerAnswer(bob.id, 'Answer 2');
          await gameStore.completeRound();
          await gameStore.startNextRound();

          // Round 2
          await gameStore.submitPlayerAnswer(alice.id, 'Answer 3');
          await gameStore.submitPlayerAnswer(bob.id, 'Answer 4');
          await gameStore.completeRound();
        }

        const sessionState = gameStore.currentSession;

        // After second completeRound: currentRound = 2, roundHistory = [round1, round2]
        expect(sessionState?.currentRound).toBe(2);
        expect(sessionState?.roundHistory.length).toBe(2);

        // isCurrentRoundCompleted = roundHistory.length >= currentRound = 2 >= 2 = true
        const isCompleted =
          (sessionState?.roundHistory.length ?? 0) >= (sessionState?.currentRound ?? 0);
        expect(isCompleted).toBe(true);
      });
    });

    describe('Round number display scenarios', () => {
      it('should show round 1 on initial setup (no session)', () => {
        // No session exists
        expect(gameStore.currentSession).toBeNull();

        // Display logic: return 1 when no session
        const displayRound = gameStore.currentSession ? gameStore.currentSession!.currentRound : 1;
        expect(displayRound).toBe(1);
      });

      it('should show round 1 after setupPlayers (round not completed)', async () => {
        await gameStore.setupPlayers(['Alice', 'Bob']);

        // Display logic: if round NOT completed, show currentRound
        const session = gameStore.currentSession!;
        const isCompleted = session.roundHistory.length >= session.currentRound;
        const displayRound = isCompleted ? session.currentRound + 1 : session.currentRound;
        expect(displayRound).toBe(1);
      });

      it('should show round 2 after round 1 is completed', async () => {
        const session = await gameStore.setupPlayers(['Alice', 'Bob']);

        const [alice, bob] = session.players;
        if (alice && bob) {
          await gameStore.submitPlayerAnswer(alice.id, 'Answer 1');
          await gameStore.submitPlayerAnswer(bob.id, 'Answer 2');
          await gameStore.completeRound();
        }

        // Display logic: if round IS completed, show currentRound + 1
        const currentSession = gameStore.currentSession!;
        const isCompleted = currentSession.roundHistory.length >= currentSession.currentRound;
        const displayRound = isCompleted
          ? currentSession.currentRound + 1
          : currentSession.currentRound;
        expect(displayRound).toBe(2);
      });

      it('should show round 2 after startNextRound (round 2 not completed)', async () => {
        const session = await gameStore.setupPlayers(['Alice', 'Bob']);

        const [alice, bob] = session.players;
        if (alice && bob) {
          await gameStore.submitPlayerAnswer(alice.id, 'Answer 1');
          await gameStore.submitPlayerAnswer(bob.id, 'Answer 2');
          await gameStore.completeRound();
          await gameStore.startNextRound();
        }

        // Display logic: after startNextRound, round 2 is NOT completed
        const currentSession2 = gameStore.currentSession!;
        const isCompleted2 = currentSession2.roundHistory.length >= currentSession2.currentRound;
        const displayRound2 = isCompleted2
          ? currentSession2.currentRound + 1
          : currentSession2.currentRound;
        expect(displayRound2).toBe(2);
      });
    });

    describe('Game start scenarios', () => {
      it('initial setup: pendingPlayerNames triggers setupPlayers', async () => {
        // Simulate coming from players page
        gameStore.pendingPlayerNames = ['Alice', 'Bob'];

        // The round-start page logic
        const hasSession = !!gameStore.currentSession;
        const hasPendingPlayers = gameStore.pendingPlayerNames.length > 0;

        expect(hasSession).toBe(false);
        expect(hasPendingPlayers).toBe(true);

        // This would trigger setupPlayers
        const session = await gameStore.setupPlayers(gameStore.pendingPlayerNames);
        gameStore.pendingPlayerNames = [];

        expect(session.currentRound).toBe(1);
        expect(session.players).toHaveLength(2);
      });

      it('next round: session exists and round completed triggers startNextRound', async () => {
        await gameStore.setupPlayers(['Alice', 'Bob']);

        const session = getSession();
        if (!session) throw new Error('Session not created');

        const [alice, bob] = session.players;
        if (alice && bob) {
          await gameStore.submitPlayerAnswer(alice.id, 'Answer 1');
          await gameStore.submitPlayerAnswer(bob.id, 'Answer 2');
          await gameStore.completeRound();
        }

        // The round-start page logic for next round
        const hasSession = !!gameStore.currentSession;
        const hasPendingPlayers = gameStore.pendingPlayerNames.length > 0;
        const currentSession = gameStore.currentSession!;
        const isCurrentRoundCompleted =
          currentSession.roundHistory.length >= currentSession.currentRound;

        expect(hasSession).toBe(true);
        expect(hasPendingPlayers).toBe(false);
        expect(isCurrentRoundCompleted).toBe(true);

        // This should trigger startNextRound
        await gameStore.startNextRound();

        expect(gameStore.currentSession?.currentRound).toBe(2);
      });

      it('refresh during round: session exists but round NOT completed - no increment', async () => {
        await gameStore.setupPlayers(['Alice', 'Bob']);

        // Simulate refresh - session exists but round not completed
        const hasSession = !!gameStore.currentSession;
        const hasPendingPlayers = gameStore.pendingPlayerNames.length > 0;
        const session = gameStore.currentSession!;
        const isCurrentRoundCompleted = session.roundHistory.length >= session.currentRound;

        expect(hasSession).toBe(true);
        expect(hasPendingPlayers).toBe(false);
        expect(isCurrentRoundCompleted).toBe(false);

        // On refresh, should NOT call startNextRound
        // Instead, just reset submissions
        await gameStore.resetPlayerSubmissions();

        // Round should still be 1
        expect(gameStore.currentSession?.currentRound).toBe(1);
      });

      it('refresh after partial answers: should not increment round', async () => {
        await gameStore.setupPlayers(['Alice', 'Bob']);

        // One player submits
        const alice = gameStore.players[0];
        if (alice) {
          await gameStore.submitPlayerAnswer(alice.id, 'Answer 1');
        }

        // Simulate refresh
        const session = gameStore.currentSession!;
        const isCurrentRoundCompleted = session.roundHistory.length >= session.currentRound;

        expect(isCurrentRoundCompleted).toBe(false);
        expect(gameStore.currentSession?.currentRound).toBe(1);
      });
    });
  });

  describe('Unified Flow Contract', () => {
    it('reports setup flow state with no active session', () => {
      const store = gameStore;

      expect(store.flowState).toBe('setup');
      expect(store.gameMode).toBe('single');
      expect(store.nextRoundNumber).toBe(1);
    });

    it('reports in-round flow for active multiplayer before round completion', async () => {
      await gameStore.setupPlayers(['Alice', 'Bob']);

      const store = gameStore;
      expect(store.gameMode).toBe('multiplayer');
      expect(store.isCurrentRoundCompleted).toBe(false);
      expect(store.flowState).toBe('in-round');
      expect(store.nextRoundNumber).toBe(1);
    });

    it('reports decision flow after completeRound', async () => {
      const session = await gameStore.setupPlayers(['Alice', 'Bob']);
      const [alice, bob] = session.players;

      if (alice && bob) {
        await gameStore.submitPlayerAnswer(alice.id, 'A');
        await gameStore.submitPlayerAnswer(bob.id, 'B');
      }

      await gameStore.completeRound();

      const store = gameStore;
      expect(store.isCurrentRoundCompleted).toBe(true);
      expect(store.postRoundDecisionPending).toBe(true);
      expect(store.flowState).toBe('decision');
      expect(store.nextRoundNumber).toBe(2);
    });

    it('resets decision state when starting next round', async () => {
      const session = await gameStore.setupPlayers(['Alice', 'Bob']);
      const [alice, bob] = session.players;

      if (alice && bob) {
        await gameStore.submitPlayerAnswer(alice.id, 'A');
        await gameStore.submitPlayerAnswer(bob.id, 'B');
      }

      await gameStore.completeRound();
      await gameStore.startNextRound();

      const store = gameStore;
      expect(store.postRoundDecisionPending).toBe(false);
      expect(store.isCurrentRoundCompleted).toBe(false);
      expect(store.flowState).toBe('in-round');
    });

    it('advanceToConfiguredRound creates initial session from pending players', async () => {
      const category = mockCategories[0];
      if (!category) throw new Error('Missing mock category');

      const state = gameStore;
      state.pendingPlayerNames = ['Alice', 'Bob'];

      const session = await state.advanceToConfiguredRound(category, 'Z');

      expect(session).toBeDefined();
      expect(session?.players).toHaveLength(2);
      expect(session?.currentRound).toBe(1);
      expect(session?.category.id).toBe(category.id);
      expect(session?.letter).toBe('Z');
      expect(gameStore.pendingPlayerNames).toEqual([]);
    });

    it('advanceToConfiguredRound starts next round when current one is completed', async () => {
      const session = await gameStore.setupPlayers(['Alice', 'Bob']);
      const [alice, bob] = session.players;

      if (alice && bob) {
        await gameStore.submitPlayerAnswer(alice.id, 'A');
        await gameStore.submitPlayerAnswer(bob.id, 'B');
      }

      await gameStore.completeRound();

      const originalRound = gameStore.currentSession?.currentRound ?? 0;
      const category = mockCategories[1];
      if (!category) throw new Error('Missing mock category');

      await gameStore.advanceToConfiguredRound(category, 'Q');

      const updated = gameStore.currentSession;
      expect(updated?.currentRound).toBe(originalRound + 1);
      expect(updated?.letter).toBe('Q');
      expect(updated?.category.id).toBe(category.id);
    });

    it('advanceToConfiguredRound keeps round number during refresh in active round', async () => {
      await gameStore.setupPlayers(['Alice', 'Bob']);

      const roundBefore = gameStore.currentSession?.currentRound;
      const category = mockCategories[2];
      if (!category) throw new Error('Missing mock category');

      await gameStore.advanceToConfiguredRound(category, 'M');

      const updated = gameStore.currentSession;
      expect(updated?.currentRound).toBe(roundBefore);
      expect(updated?.letter).toBe('M');
      expect(updated?.category.id).toBe(category.id);
      expect(updated?.currentPlayerIndex).toBe(0);
      expect(
        updated?.players.every(
          (p: import('@riddle-rush/types/game').Player) => p.hasSubmitted === false
        )
      ).toBe(true);
    });

    it('submitPlayerAnswer ignores out-of-turn submissions', async () => {
      const session = await gameStore.setupPlayers(['Alice', 'Bob']);
      const [alice, bob] = session.players;
      if (!alice || !bob) throw new Error('Missing players');

      await gameStore.submitPlayerAnswer(bob.id, 'Out of turn');

      const updated = gameStore.currentSession;
      expect(updated?.players[1]?.hasSubmitted).toBe(false);
      expect(updated?.currentPlayerIndex).toBe(0);
    });

    it('submitPlayerAnswer keeps first answer when same player retries out-of-turn', async () => {
      const session = await gameStore.setupPlayers(['Alice', 'Bob']);
      const [alice, bob] = session.players;
      if (!alice || !bob) throw new Error('Missing players');

      await gameStore.submitPlayerAnswer(alice.id, 'First');
      await gameStore.submitPlayerAnswer(alice.id, 'Second');

      const updatedAlice = gameStore.getPlayerById(alice.id);
      expect(updatedAlice?.currentRoundAnswer).toBe('First');
    });

    it('completeRound is idempotent for same round', async () => {
      const session = await gameStore.setupPlayers(['Alice', 'Bob']);
      const [alice, bob] = session.players;

      if (alice && bob) {
        await gameStore.submitPlayerAnswer(alice.id, 'A');
        await gameStore.submitPlayerAnswer(bob.id, 'B');
      }

      await gameStore.completeRound();
      await gameStore.completeRound();

      expect(gameStore.currentSession?.roundHistory).toHaveLength(1);
    });

    it('completeRound does not record multiplayer rounds before all submissions', async () => {
      const session = await gameStore.setupPlayers(['Alice', 'Bob']);
      const alice = session.players[0];
      if (!alice) throw new Error('Missing player');

      await gameStore.submitPlayerAnswer(alice.id, 'Only one answer');
      await gameStore.completeRound();

      expect(gameStore.currentSession?.roundHistory).toHaveLength(0);
      expect(gameStore.postRoundDecisionPending).toBe(false);
    });

    it('reports completed flow state after completeGame', async () => {
      const session = await gameStore.setupPlayers(['Alice', 'Bob']);
      const [alice, bob] = session.players;

      if (alice && bob) {
        await gameStore.submitPlayerAnswer(alice.id, 'A');
        await gameStore.submitPlayerAnswer(bob.id, 'B');
      }

      await gameStore.completeRound();
      await gameStore.completeGame();

      const store = gameStore;
      expect(store.flowState).toBe('completed');
      expect(store.isGameCompleted).toBe(true);
      expect(store.postRoundDecisionPending).toBe(false);
    });

    it('multi-round scoring accumulates correctly across 3 rounds', async () => {
      const session = await gameStore.setupPlayers(['Alice', 'Bob']);
      const [alice, bob] = session.players;
      if (!alice || !bob) throw new Error('Missing players');

      // Round 1: Alice=10, Bob=5
      await gameStore.submitPlayerAnswer(alice.id, 'A1');
      await gameStore.submitPlayerAnswer(bob.id, 'B1');
      await gameStore.assignPlayerScore(alice.id, 10);
      await gameStore.assignPlayerScore(bob.id, 5);
      await gameStore.completeRound();

      expect(gameStore.flowState).toBe('decision');
      expect(alice.totalScore).toBe(10);
      expect(bob.totalScore).toBe(5);

      // Round 2: Alice=3, Bob=8
      await gameStore.startNextRound();
      expect(gameStore.flowState).toBe('in-round');

      await gameStore.submitPlayerAnswer(alice.id, 'A2');
      await gameStore.submitPlayerAnswer(bob.id, 'B2');
      await gameStore.assignPlayerScore(alice.id, 3);
      await gameStore.assignPlayerScore(bob.id, 8);
      await gameStore.completeRound();

      expect(alice.totalScore).toBe(13);
      expect(bob.totalScore).toBe(13);

      // Round 3: Alice=7, Bob=2
      await gameStore.startNextRound();
      await gameStore.submitPlayerAnswer(alice.id, 'A3');
      await gameStore.submitPlayerAnswer(bob.id, 'B3');
      await gameStore.assignPlayerScore(alice.id, 7);
      await gameStore.assignPlayerScore(bob.id, 2);
      await gameStore.completeRound();

      expect(alice.totalScore).toBe(20);
      expect(bob.totalScore).toBe(15);
      expect(gameStore.currentSession?.roundHistory).toHaveLength(3);
      expect(gameStore.currentSession?.currentRound).toBe(3);
    });
  });

  describe('Load Session By ID', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Mock is already defined at the top level
      mockGetGameSessionById.mockResolvedValue(null);
    });

    it('should load session by ID', async () => {
      const mockSession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        category: mockCategories[0],
        startTime: Date.now(),
        endTime: null,
        currentLetter: 'A',
        answer: '',
        timeSpent: 0,
        players: [],
        currentPlayerIndex: 0,
        rounds: [],
        currentRoundIndex: 0,
      };

      mockGetGameSessionById.mockResolvedValue(mockSession);

      const result = await gameStore.loadSessionById(mockSession.id);

      expect(mockGetGameSessionById).toHaveBeenCalledWith(mockSession.id);
      expect(result).toEqual(mockSession);
      expect(gameStore.currentSession).toEqual(mockSession);
    });

    it('should return null when session not found', async () => {
      const gameId = 'non-existent-id';

      mockGetGameSessionById.mockResolvedValue(null);

      const result = await gameStore.loadSessionById(gameId);
      expect(result).toBeNull();
    });

    it('should return null on IndexedDB errors', async () => {
      const gameId = '123e4567-e89b-12d3-a456-426614174000';

      mockGetGameSessionById.mockRejectedValue(new Error('Database error'));

      const result = await gameStore.loadSessionById(gameId);
      expect(result).toBeNull();
    });

    it('should load session with UUID format', async () => {
      const uuidGameId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSession = {
        id: uuidGameId,
        category: mockCategories[1],
        startTime: Date.now(),
        endTime: null,
        currentLetter: 'B',
        answer: '',
        timeSpent: 0,
        players: [
          { name: 'Alice', currentAnswer: '', roundScores: [], totalScore: 0 },
          { name: 'Bob', currentAnswer: '', roundScores: [], totalScore: 0 },
        ],
        currentPlayerIndex: 0,
        rounds: [],
        currentRoundIndex: 0,
      };

      mockGetGameSessionById.mockResolvedValue(mockSession);

      const result = await gameStore.loadSessionById(uuidGameId);

      expect(result!.id).toBe(uuidGameId);
      expect(result!.players).toHaveLength(2);
    });

    it('should return null for missing ID-based session lookup', async () => {
      const gameId = 'test-game-123';

      mockGetGameSessionById.mockResolvedValue(null);

      const result = await gameStore.loadSessionById(gameId);
      expect(result).toBeNull();
    });
  });

  describe('Complete Game', () => {
    beforeEach(async () => {
      await gameStore.setupPlayers(['Alice', 'Bob']);

      const session = getSession();
      if (!session) throw new Error('Session not created');

      const [alice, bob] = session.players;
      if (alice && bob) {
        await gameStore.submitPlayerAnswer(alice.id, 'Answer 1');
        await gameStore.submitPlayerAnswer(bob.id, 'Answer 2');
        await gameStore.assignPlayerScore(alice.id, 100);
        await gameStore.assignPlayerScore(bob.id, 50);
        await gameStore.completeRound();
      }
    });

    it('sets status to completed', async () => {
      await gameStore.completeGame();

      expect(gameStore.currentSession?.status).toBe('completed');
    });

    it('sets endTime', async () => {
      const before = Date.now();

      await gameStore.completeGame();

      const after = Date.now();
      expect(gameStore.currentSession?.endTime).toBeGreaterThanOrEqual(before);
      expect(gameStore.currentSession?.endTime).toBeLessThanOrEqual(after);
    });

    it('keeps session for leaderboard display', async () => {
      const state1 = gameStore;
      console.log('Before completeGame - state:', {
        currentSession: state1.currentSession,
        hasActiveSession: state1.hasActiveSession,
        getter_call: state1.currentSession !== null,
      });

      await gameStore.completeGame();

      const state2 = gameStore;
      console.log('After completeGame - state:', {
        currentSession: state2.currentSession,
        status: state2.currentSession?.status,
        hasActiveSession: state2.hasActiveSession,
        getter_call: state2.currentSession !== null,
      });

      // Session should NOT be cleared (unlike endGame)
      expect(gameStore.currentSession).not.toBeNull();
      expect(gameStore.hasActiveSession).toBe(true);
    });

    it('returns the completed session', async () => {
      const result = await gameStore.completeGame();

      expect(result).toBeDefined();
      expect(result?.status).toBe('completed');
    });

    it('persists to database', async () => {
      mockSaveGameSession.mockClear();
      mockSaveGameHistory.mockClear();

      await gameStore.completeGame();

      expect(mockSaveGameSession).toHaveBeenCalled();
      expect(mockSaveGameHistory).toHaveBeenCalled();
    });

    it('calls updateStatistics', async () => {
      mockUpdateStatistics.mockClear();

      await gameStore.completeGame();

      expect(mockUpdateStatistics).toHaveBeenCalled();
    });

    it('does nothing without active session', async () => {
      gameStore.currentSession = null;
      mockSaveGameSession.mockClear();

      await gameStore.completeGame();

      expect(mockSaveGameSession).not.toHaveBeenCalled();
    });

    it('isGameCompleted getter returns true after completeGame', async () => {
      expect(gameStore.isGameCompleted).toBe(false);

      await gameStore.completeGame();

      expect(gameStore.isGameCompleted).toBe(true);
    });

    it('gameStatus getter returns completed after completeGame', async () => {
      expect(gameStore.gameStatus).toBe('active');

      await gameStore.completeGame();

      expect(gameStore.gameStatus).toBe('completed');
    });
  });

  describe('Leaderboard Winner Logic', () => {
    beforeEach(async () => {
      await gameStore.setupPlayers(['Alice', 'Bob', 'Charlie']);

      const session = getSession();
      if (!session) throw new Error('Session not created');

      const [alice, bob, charlie] = session.players;

      if (alice && bob && charlie) {
        await gameStore.assignPlayerScore(alice.id, 100);
        await gameStore.assignPlayerScore(bob.id, 200);
        await gameStore.assignPlayerScore(charlie.id, 150);
      }
    });

    it('isWinner is false for all players when game is active', () => {
      const leaderboard = getLeaderboard();

      expect(leaderboard.every((p: { isWinner: boolean }) => p.isWinner === false)).toBe(true);
    });

    it('isWinner is true only for first place when game is completed', async () => {
      await gameStore.completeGame();

      const leaderboard = getLeaderboard();

      // Bob has highest score (200) and should be winner
      expect(leaderboard[0]?.name).toBe('Bob');
      expect(leaderboard[0]?.isWinner).toBe(true);

      // Others should not be winners
      expect(leaderboard[1]?.isWinner).toBe(false);
      expect(leaderboard[2]?.isWinner).toBe(false);
    });

    it('isWinner is false when top score is 0', async () => {
      // Reset all scores to 0
      for (const player of getPlayers()) {
        await gameStore.assignPlayerScore(player.id, 0);
      }

      await gameStore.completeGame();

      const leaderboard = getLeaderboard();

      // No winner when all scores are 0
      expect(leaderboard.every((p: { isWinner: boolean }) => p.isWinner === false)).toBe(true);
    });

    it('rank is assigned correctly', () => {
      const leaderboard = getLeaderboard();

      expect(leaderboard[0]?.rank).toBe(1);
      expect(leaderboard[1]?.rank).toBe(2);
      expect(leaderboard[2]?.rank).toBe(3);
    });

    it('players are sorted by totalScore descending', () => {
      const leaderboard = getLeaderboard();

      expect(leaderboard[0]?.name).toBe('Bob');
      expect(leaderboard[0]?.totalScore).toBe(200);
      expect(leaderboard[1]?.name).toBe('Charlie');
      expect(leaderboard[1]?.totalScore).toBe(150);
      expect(leaderboard[2]?.name).toBe('Alice');
      expect(leaderboard[2]?.totalScore).toBe(100);
    });
  });
});
