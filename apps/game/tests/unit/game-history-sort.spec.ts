import { describe, it, expect } from 'vitest';
import orderBy from 'lodash-es/orderBy';
import type { GameSession, Player } from '@riddle-rush/types/game';

/** Mirrors `sortedGames` in `components/GameHistory.vue`. */
function sortGamesByRecency(games: GameSession[]): GameSession[] {
  return orderBy(games, [g => g.endTime || g.startTime], ['desc']);
}

/** Mirrors `getSortedPlayers` in `components/GameHistory.vue`. */
function sortPlayersByTotalScore(players: Player[]): Player[] {
  return orderBy(players, ['totalScore'], ['desc']);
}

const baseCategory: GameSession['category'] = {
  id: 1,
  name: 'Test',
  searchWord: 'test',
  key: 'test',
  searchProvider: 'offline',
};

function session(
  partial: Partial<GameSession> & Pick<GameSession, 'id' | 'startTime'>,
): GameSession {
  return {
    players: [],
    currentRound: 1,
    currentPlayerIndex: 0,
    category: baseCategory,
    letter: 'A',
    status: 'completed',
    roundHistory: [],
    ...partial,
  };
}

describe('GameHistory sort helpers', () => {
  it('sortGamesByRecency uses endTime when set, else startTime, descending', () => {
    const games = [
      session({ id: 'old', startTime: 100, endTime: 200 }),
      session({ id: 'new', startTime: 50, endTime: 500 }),
      session({ id: 'mid', startTime: 300, endTime: 300 }),
    ];

    const sorted = sortGamesByRecency(games);

    expect(sorted.map(g => g.id)).toEqual(['new', 'mid', 'old']);
  });

  it('sortGamesByRecency falls back to startTime when endTime missing', () => {
    const games = [session({ id: 'a', startTime: 10 }), session({ id: 'b', startTime: 99 })];

    const sorted = sortGamesByRecency(games);

    expect(sorted[0]!.id).toBe('b');
    expect(sorted[1]!.id).toBe('a');
  });

  it('sortPlayersByTotalScore is descending by totalScore', () => {
    const players: Player[] = [
      { id: '1', name: 'A', totalScore: 5, currentRoundScore: 0, hasSubmitted: false },
      { id: '2', name: 'B', totalScore: 20, currentRoundScore: 0, hasSubmitted: false },
      { id: '3', name: 'C', totalScore: 10, currentRoundScore: 0, hasSubmitted: false },
    ];

    const sorted = sortPlayersByTotalScore(players);

    expect(sorted.map(p => p.id)).toEqual(['2', '3', '1']);
  });
});
