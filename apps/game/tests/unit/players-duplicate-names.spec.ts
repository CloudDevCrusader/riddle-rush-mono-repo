import { describe, it, expect } from 'vitest';
import uniq from 'lodash-es/uniq';

/** Same rule as `pages/players.vue` startGame (case-insensitive uniq length). */
function hasDuplicatePlayerNamesCaseInsensitive(names: string[]): boolean {
  const lower = names.map(n => n.toLowerCase());
  return uniq(lower).length !== lower.length;
}

describe('players page duplicate name rule', () => {
  it('detects exact duplicates', () => {
    expect(hasDuplicatePlayerNamesCaseInsensitive(['Ann', 'Bob', 'Ann'])).toBe(true);
  });

  it('detects case-insensitive duplicates', () => {
    expect(hasDuplicatePlayerNamesCaseInsensitive(['Alice', 'alice'])).toBe(true);
  });

  it('allows unique names', () => {
    expect(hasDuplicatePlayerNamesCaseInsensitive(['Ann', 'Bob', 'Cy'])).toBe(false);
  });

  it('empty and single name are not duplicates', () => {
    expect(hasDuplicatePlayerNamesCaseInsensitive([])).toBe(false);
    expect(hasDuplicatePlayerNamesCaseInsensitive(['Solo'])).toBe(false);
  });
});
