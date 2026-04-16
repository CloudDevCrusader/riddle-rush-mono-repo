import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Helper to flatten object keys
function flattenKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(flattenKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

describe('Translations', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const localesDir = path.join(rootDir, 'translations/locales');
  const categoriesPath = path.join(rootDir, 'public/data/categories.json');

  const dePath = path.join(localesDir, 'de.json');
  const enPath = path.join(localesDir, 'en.json');

  const deContent = JSON.parse(fs.readFileSync(dePath, 'utf-8'));
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

  const deKeys = new Set(flattenKeys(deContent));
  const enKeys = new Set(flattenKeys(enContent));

  it('should have all category searchWords in de.json', () => {
    categories.forEach((cat: any) => {
      // The app uses `t('categories.' + cat.searchWord, cat.name)`
      // So we expect `categories.{searchWord}` to exist.
      // searchWord might be `*heit`, so the key is `categories.*heit`.
      const expectedKey = `categories.${cat.searchWord}`;
      expect(deKeys.has(expectedKey), `Missing key in de.json: ${expectedKey}`).toBe(true);
    });
  });

  it('should have all category searchWords in en.json', () => {
    categories.forEach((cat: any) => {
      const expectedKey = `categories.${cat.searchWord}`;
      expect(enKeys.has(expectedKey), `Missing key in en.json: ${expectedKey}`).toBe(true);
    });
  });

  it('should have consistent keys between de and en', () => {
    // Check if keys in DE exist in EN
    deKeys.forEach((key) => {
      expect(enKeys.has(key), `Key '${key}' exists in DE but missing in EN`).toBe(true);
    });

    // Check if keys in EN exist in DE
    enKeys.forEach((key) => {
      expect(deKeys.has(key), `Key '${key}' exists in EN but missing in DE`).toBe(true);
    });
  });
});
