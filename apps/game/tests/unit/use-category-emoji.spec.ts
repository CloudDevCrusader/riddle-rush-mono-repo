import { describe, it, expect } from 'vitest';
import { useCategoryEmoji } from '../../composables/useCategoryEmoji';

describe('useCategoryEmoji', () => {
  const { resolve, emojiMap } = useCategoryEmoji();

  describe('resolve', () => {
    it('should return default emoji for null', () => {
      expect(resolve(null)).toBe('🎯');
    });

    it('should return default emoji for undefined', () => {
      expect(resolve(undefined)).toBe('🎯');
    });

    it('should return default emoji for empty string', () => {
      expect(resolve('')).toBe('🎯');
    });

    it('should resolve female name emoji', () => {
      expect(resolve('Weiblicher Vorname')).toBe('👩');
    });

    it('should resolve male name emoji', () => {
      expect(resolve('Männlicher Vorname')).toBe('👨');
    });

    it('should resolve water vehicle emoji', () => {
      expect(resolve('Wasser Fahrzeug')).toBe('⛵');
    });

    it('should resolve flowers emoji', () => {
      expect(resolve('Blumen')).toBe('🌸');
    });

    it('should resolve plants emoji', () => {
      expect(resolve('Pflanzen')).toBe('🌿');
    });

    it('should resolve job emoji', () => {
      expect(resolve('Beruf oder Gewerbe')).toBe('💼');
    });

    it('should resolve insect emoji', () => {
      expect(resolve('Insekt')).toBe('🐛');
    });

    it('should resolve animal emoji', () => {
      expect(resolve('Tier')).toBe('🐾');
    });

    it('should resolve city emoji', () => {
      expect(resolve('Stadt')).toBe('🏙️');
    });

    it('should resolve country emoji', () => {
      expect(resolve('Land')).toBe('🌍');
    });

    it('should resolve food emoji', () => {
      expect(resolve('Essen')).toBe('🍽️');
    });

    it('should resolve drink emoji', () => {
      expect(resolve('Getränk')).toBe('🥤');
    });

    it('should resolve sport emoji', () => {
      expect(resolve('Sport')).toBe('⚽');
    });

    it('should resolve music emoji', () => {
      expect(resolve('Musik')).toBe('🎵');
    });

    it('should resolve movie emoji', () => {
      expect(resolve('Film')).toBe('🎬');
    });

    it('should resolve mountain emoji', () => {
      expect(resolve('Berg')).toBe('⛰️');
    });

    it('should resolve color emoji', () => {
      expect(resolve('Farbe')).toBe('🎨');
    });

    it('should resolve space travel emoji', () => {
      expect(resolve('Raumfahrt')).toBe('🚀');
    });

    it('should be case insensitive', () => {
      expect(resolve('MUSIK')).toBe('🎵');
      expect(resolve('sport')).toBe('⚽');
      expect(resolve('FiLm')).toBe('🎬');
    });

    it('should match partial category names', () => {
      expect(resolve('Das ist ein Film')).toBe('🎬');
      expect(resolve('Thema: Sport')).toBe('⚽');
    });

    it('should return default for unknown categories', () => {
      expect(resolve('Unknown Category')).toBe('🎯');
      expect(resolve('Something Random')).toBe('🎯');
    });

    it('should prioritize first match', () => {
      // If a string contains multiple category keywords, return first match
      const result = resolve('Berg');
      expect(result).toBe('⛰️');
    });
  });

  describe('emojiMap', () => {
    it('should expose emoji map', () => {
      expect(emojiMap).toBeDefined();
      expect(typeof emojiMap).toBe('object');
    });

    it('should contain expected categories', () => {
      expect(emojiMap['Musik']).toBe('🎵');
      expect(emojiMap['Sport']).toBe('⚽');
      expect(emojiMap['Film']).toBe('🎬');
    });

    it('should have multiple entries', () => {
      expect(Object.keys(emojiMap).length).toBeGreaterThan(20);
    });
  });
});
