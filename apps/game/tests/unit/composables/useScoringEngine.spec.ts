import { describe, it, expect } from 'vitest';
import type { Player } from '@riddle-rush/types/game';
import { SCORE_PER_CORRECT_ANSWER } from '@riddle-rush/shared/constants';
import { useScoringEngine } from '../../../composables/useScoringEngine';

// Helper factory
function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    name: 'Test Player',
    totalScore: 0,
    currentRoundScore: 0,
    currentRoundAnswer: undefined,
    hasSubmitted: false,
    ...overrides,
  };
}

describe('useScoringEngine', () => {
  const { calculateAttemptScore, getRankSuffix, getScoreDisplay, determineWinners } =
    useScoringEngine();

  // ──────────────────────────────────────────
  // calculateAttemptScore
  // ──────────────────────────────────────────
  describe('calculateAttemptScore', () => {
    it('returns SCORE_PER_CORRECT_ANSWER when found is true', () => {
      expect(calculateAttemptScore(true)).toBe(SCORE_PER_CORRECT_ANSWER);
    });

    it('returns 0 when found is false', () => {
      expect(calculateAttemptScore(false)).toBe(0);
    });

    it('SCORE_PER_CORRECT_ANSWER is 10', () => {
      expect(SCORE_PER_CORRECT_ANSWER).toBe(10);
    });
  });

  // ──────────────────────────────────────────
  // getRankSuffix
  // ──────────────────────────────────────────
  describe('getRankSuffix', () => {
    it('returns "1st" for rank 1', () => {
      expect(getRankSuffix(1)).toBe('1st');
    });

    it('returns "2nd" for rank 2', () => {
      expect(getRankSuffix(2)).toBe('2nd');
    });

    it('returns "3rd" for rank 3', () => {
      expect(getRankSuffix(3)).toBe('3rd');
    });

    it('returns "4th" for rank 4', () => {
      expect(getRankSuffix(4)).toBe('4th');
    });

    it('returns "11th" for special case 11', () => {
      expect(getRankSuffix(11)).toBe('11th');
    });

    it('returns "12th" for special case 12', () => {
      expect(getRankSuffix(12)).toBe('12th');
    });

    it('returns "13th" for special case 13', () => {
      expect(getRankSuffix(13)).toBe('13th');
    });

    it('returns "21st" for rank 21', () => {
      expect(getRankSuffix(21)).toBe('21st');
    });

    it('returns "22nd" for rank 22', () => {
      expect(getRankSuffix(22)).toBe('22nd');
    });

    it('returns "23rd" for rank 23', () => {
      expect(getRankSuffix(23)).toBe('23rd');
    });

    it('returns "24th" for rank 24', () => {
      expect(getRankSuffix(24)).toBe('24th');
    });

    it('returns "10th" for rank 10', () => {
      expect(getRankSuffix(10)).toBe('10th');
    });
  });

  // ──────────────────────────────────────────
  // getScoreDisplay
  // ──────────────────────────────────────────
  describe('getScoreDisplay', () => {
    it('returns "+5" for score 5', () => {
      expect(getScoreDisplay(5)).toBe('+5');
    });

    it('returns "+1" for score 1', () => {
      expect(getScoreDisplay(1)).toBe('+1');
    });

    it('returns "-3" for score -3', () => {
      expect(getScoreDisplay(-3)).toBe('-3');
    });

    it('returns "0" for score 0', () => {
      expect(getScoreDisplay(0)).toBe('0');
    });

    it('returns "+10" for SCORE_PER_CORRECT_ANSWER', () => {
      expect(getScoreDisplay(SCORE_PER_CORRECT_ANSWER)).toBe('+10');
    });
  });

  // ──────────────────────────────────────────
  // determineWinners
  // ──────────────────────────────────────────
  describe('determineWinners', () => {
    it('returns player with highest score', () => {
      const players = [
        createPlayer({ id: 'a', name: 'Alice', totalScore: 30 }),
        createPlayer({ id: 'b', name: 'Bob', totalScore: 10 }),
        createPlayer({ id: 'c', name: 'Charlie', totalScore: 20 }),
      ];

      const winners = determineWinners(players);

      expect(winners).toHaveLength(1);
      expect(winners[0]!.name).toBe('Alice');
    });

    it('handles tie: returns all players with highest score', () => {
      const players = [
        createPlayer({ id: 'a', name: 'Alice', totalScore: 20 }),
        createPlayer({ id: 'b', name: 'Bob', totalScore: 20 }),
        createPlayer({ id: 'c', name: 'Charlie', totalScore: 10 }),
      ];

      const winners = determineWinners(players);

      expect(winners).toHaveLength(2);
      const names = winners.map((w) => w.name);
      expect(names).toContain('Alice');
      expect(names).toContain('Bob');
    });

    it('returns empty array for empty players array', () => {
      const winners = determineWinners([]);

      expect(winners).toEqual([]);
    });

    it('returns empty array when max score is 0', () => {
      const players = [
        createPlayer({ id: 'a', totalScore: 0 }),
        createPlayer({ id: 'b', totalScore: 0 }),
      ];

      const winners = determineWinners(players);

      expect(winners).toEqual([]);
    });

    it('returns empty array when all scores are negative', () => {
      const players = [
        createPlayer({ id: 'a', totalScore: -5 }),
        createPlayer({ id: 'b', totalScore: -10 }),
      ];

      const winners = determineWinners(players);

      expect(winners).toEqual([]);
    });

    it('returns all players with equal max score when multiple tied', () => {
      const players = [
        createPlayer({ id: 'a', totalScore: 50 }),
        createPlayer({ id: 'b', totalScore: 50 }),
        createPlayer({ id: 'c', totalScore: 50 }),
      ];

      const winners = determineWinners(players);

      expect(winners).toHaveLength(3);
    });
  });
});
