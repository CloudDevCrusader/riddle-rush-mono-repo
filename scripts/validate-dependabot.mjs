import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';

const repoRoot = path.resolve(import.meta.dirname, '..');
const configPath = path.join(repoRoot, '.github', 'dependabot.yml');

const VALID_ECOSYSTEMS = new Set([
  'bundler',
  'cargo',
  'composer',
  'docker',
  'elm',
  'github-actions',
  'gitsubmodule',
  'gomod',
  'gradle',
  'maven',
  'mix',
  'npm',
  'nuget',
  'pip',
  'pub',
  'swift',
  'terraform',
]);

const VALID_INTERVALS = new Set(['daily', 'weekly', 'monthly']);

// Conventional Commits types enforced by the repo's commitlint config.
const VALID_COMMIT_PREFIXES = new Set([
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
]);

const loadConfig = async () => {
  const raw = await readFile(configPath, 'utf-8');
  return { raw, parsed: parse(raw) };
};

test('dependabot.yml exists at .github/dependabot.yml', async () => {
  const s = await stat(configPath);
  assert.ok(s.isFile(), 'expected a regular file');
});

test('parses as valid YAML', async () => {
  const { parsed } = await loadConfig();
  assert.equal(typeof parsed, 'object');
  assert.notEqual(parsed, null);
});

test('declares version: 2 (required by Dependabot)', async () => {
  const { parsed } = await loadConfig();
  assert.equal(parsed.version, 2);
});

test('updates is a non-empty array', async () => {
  const { parsed } = await loadConfig();
  assert.ok(Array.isArray(parsed.updates), 'updates must be an array');
  assert.ok(parsed.updates.length > 0, 'updates must not be empty');
});

test('each update entry has required fields', async () => {
  const { parsed } = await loadConfig();
  for (const [i, update] of parsed.updates.entries()) {
    assert.ok(update['package-ecosystem'], `updates[${i}].package-ecosystem missing`);
    assert.ok(update.directory, `updates[${i}].directory missing`);
    assert.ok(update.schedule, `updates[${i}].schedule missing`);
    assert.ok(update.schedule.interval, `updates[${i}].schedule.interval missing`);
  }
});

test('each package-ecosystem is a known Dependabot ecosystem', async () => {
  const { parsed } = await loadConfig();
  for (const update of parsed.updates) {
    assert.ok(
      VALID_ECOSYSTEMS.has(update['package-ecosystem']),
      `unknown ecosystem: ${update['package-ecosystem']}`
    );
  }
});

test('each schedule.interval is daily | weekly | monthly', async () => {
  const { parsed } = await loadConfig();
  for (const update of parsed.updates) {
    assert.ok(
      VALID_INTERVALS.has(update.schedule.interval),
      `invalid interval: ${update.schedule.interval}`
    );
  }
});

test('each referenced directory exists in the repo', async () => {
  const { parsed } = await loadConfig();
  for (const update of parsed.updates) {
    const dir = update.directory.startsWith('/') ? update.directory.slice(1) : update.directory;
    const resolved = path.join(repoRoot, dir);
    const s = await stat(resolved);
    assert.ok(s.isDirectory(), `directory not found: ${update.directory}`);
  }
});

test('open-pull-requests-limit is a positive integer when set', async () => {
  const { parsed } = await loadConfig();
  for (const update of parsed.updates) {
    if (update['open-pull-requests-limit'] === undefined) continue;
    const n = update['open-pull-requests-limit'];
    assert.ok(Number.isInteger(n) && n > 0, `invalid limit: ${n}`);
  }
});

test('commit-message.prefix uses a Conventional Commits type', async () => {
  const { parsed } = await loadConfig();
  for (const update of parsed.updates) {
    const prefix = update['commit-message']?.prefix;
    if (!prefix) continue;
    assert.ok(
      VALID_COMMIT_PREFIXES.has(prefix),
      `commit prefix "${prefix}" is not an allowed Conventional Commits type`
    );
  }
});

test('npm ecosystem groups reference valid update-types', async () => {
  const { parsed } = await loadConfig();
  const allowed = new Set(['major', 'minor', 'patch']);
  for (const update of parsed.updates) {
    if (!update.groups) continue;
    for (const [name, group] of Object.entries(update.groups)) {
      if (!group['update-types']) continue;
      for (const t of group['update-types']) {
        assert.ok(allowed.has(t), `group "${name}" has invalid update-type: ${t}`);
      }
    }
  }
});
