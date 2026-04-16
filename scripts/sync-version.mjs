#!/usr/bin/env node
/**
 * Version Sync Script
 *
 * Synchronizes version from root package.json to all workspace packages
 * and native app configurations (iOS, Android already reads from package.json).
 *
 * Usage:
 *   node scripts/sync-version.mjs           # Sync all versions from root
 *   node scripts/sync-version.mjs --check   # Check if versions are in sync
 *   node scripts/sync-version.mjs --bump    # Bump patch version in root
 *   node scripts/sync-version.mjs --set 1.6.0  # Set specific version
 *   node scripts/sync-version.mjs --tag         # Create git tag after sync
 *   node scripts/sync-version.mjs --release     # Create GitHub release after sync
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}▶${colors.reset} ${msg}`),
};

/**
 * Read and parse package.json
 */
async function readPackageJson(path) {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}

/**
 * Write package.json with proper formatting
 */
async function writePackageJson(path, data) {
  const content = JSON.stringify(data, null, 2) + '\n';
  await writeFile(path, content, 'utf-8');
}

/**
 * Get root version from root package.json
 */
async function getRootVersion() {
  const rootPackage = await readPackageJson(join(ROOT_DIR, 'package.json'));
  return rootPackage.version;
}

/**
 * Calculate iOS build number from semantic version
 * Converts 1.5.1 → 10501 (major * 10000 + minor * 100 + patch)
 */
function calculateIosBuildNumber(version) {
  const parts = version.split('.').map(Number);
  const [major = 0, minor = 0, patch = 0] = parts;
  return major * 10000 + minor * 100 + patch;
}

/**
 * Find all package.json files in workspace using native fs
 */
async function findWorkspacePackages() {
  const packages = [];

  // Define directories to scan
  const scanDirs = [
    'apps',
    'packages',
    'tools',
    'infrastructure',
    'infrastructure/lambda',
    'infrastructure/lambda/websocket',
  ];

  for (const dir of scanDirs) {
    const fullDir = join(ROOT_DIR, dir);
    if (!existsSync(fullDir)) continue;

    try {
      const entries = await readdir(fullDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pkgPath = join(fullDir, entry.name, 'package.json');
          if (existsSync(pkgPath)) {
            packages.push(pkgPath);
          }
        } else if (entry.isFile() && entry.name === 'package.json') {
          // For infrastructure/package.json (direct child)
          packages.push(join(fullDir, 'package.json'));
        }
      }
    } catch {
      // Directory might not exist, skip
    }
  }

  // Also check for package.json directly in infrastructure/lambda/websocket subdirs
  const websocketDir = join(ROOT_DIR, 'infrastructure/lambda/websocket');
  if (existsSync(websocketDir)) {
    try {
      const entries = await readdir(websocketDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pkgPath = join(websocketDir, entry.name, 'package.json');
          if (existsSync(pkgPath)) {
            packages.push(pkgPath);
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }

  // Remove duplicates and sort
  return [...new Set(packages)].sort();
}

/**
 * Update version in package.json files
 */
async function updatePackageVersions(targetVersion) {
  const packages = await findWorkspacePackages();
  const updated = [];
  const skipped = [];

  for (const pkgPath of packages) {
    try {
      const pkg = await readPackageJson(pkgPath);
      const relativePath = pkgPath.replace(ROOT_DIR, '').replace(/^\//, '');

      if (pkg.version === targetVersion) {
        skipped.push({ name: pkg.name || relativePath, path: relativePath });
        continue;
      }

      pkg.version = targetVersion;
      await writePackageJson(pkgPath, pkg);
      updated.push({ name: pkg.name || relativePath, path: relativePath, oldVersion: pkg.version });
      log.success(`${relativePath}: ${pkg.version} → ${targetVersion}`);
    } catch (err) {
      log.error(`Failed to update ${pkgPath}: ${err.message}`);
    }
  }

  return { updated, skipped };
}

/**
 * Update iOS version in project.pbxproj
 */
async function updateIosVersion(version) {
  const pbxprojPath = join(ROOT_DIR, 'apps/mobile/ios/App/App.xcodeproj/project.pbxproj');

  if (!existsSync(pbxprojPath)) {
    log.warn('iOS project.pbxproj not found, skipping iOS version update');
    return { updated: false };
  }

  try {
    let content = await readFile(pbxprojPath, 'utf-8');
    const buildNumber = calculateIosBuildNumber(version);

    // Replace MARKETING_VERSION
    const oldMarketingVersion = content.match(/MARKETING_VERSION = ([^;]+);/);
    const oldBuildVersion = content.match(/CURRENT_PROJECT_VERSION = ([^;]+);/);

    content = content.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`);
    content = content.replace(
      /CURRENT_PROJECT_VERSION = [^;]+;/g,
      `CURRENT_PROJECT_VERSION = ${buildNumber};`
    );

    await writeFile(pbxprojPath, content, 'utf-8');

    log.success(
      `iOS project.pbxproj: MARKETING_VERSION=${version}, CURRENT_PROJECT_VERSION=${buildNumber}`
    );
    return {
      updated: true,
      oldMarketing: oldMarketingVersion?.[1],
      oldBuild: oldBuildVersion?.[1],
      newMarketing: version,
      newBuild: buildNumber,
    };
  } catch (err) {
    log.error(`Failed to update iOS version: ${err.message}`);
    return { updated: false, error: err.message };
  }
}

/**
 * Check if all versions are in sync
 */
async function checkVersions() {
  const rootVersion = await getRootVersion();
  log.step(`Root version: ${rootVersion}`);

  const packages = await findWorkspacePackages();
  const mismatches = [];
  const inSync = [];

  for (const pkgPath of packages) {
    try {
      const pkg = await readPackageJson(pkgPath);
      const relativePath = pkgPath.replace(ROOT_DIR, '').replace(/^\//, '');

      if (pkg.version !== rootVersion) {
        mismatches.push({
          name: pkg.name || relativePath,
          path: relativePath,
          version: pkg.version,
        });
      } else {
        inSync.push({
          name: pkg.name || relativePath,
          path: relativePath,
        });
      }
    } catch (err) {
      log.error(`Failed to read ${pkgPath}: ${err.message}`);
    }
  }

  // Check iOS version
  const pbxprojPath = join(ROOT_DIR, 'apps/mobile/ios/App/App.xcodeproj/project.pbxproj');
  if (existsSync(pbxprojPath)) {
    const content = await readFile(pbxprojPath, 'utf-8');
    const marketingMatch = content.match(/MARKETING_VERSION = ([^;]+);/);
    if (marketingMatch) {
      const iosVersion = marketingMatch[1];
      if (iosVersion !== rootVersion) {
        mismatches.push({
          name: 'iOS App',
          path: 'apps/mobile/ios/App/App.xcodeproj/project.pbxproj',
          version: iosVersion,
        });
      } else {
        inSync.push({
          name: 'iOS App',
          path: 'apps/mobile/ios/App/App.xcodeproj/project.pbxproj',
        });
      }
    }
  }

  console.log(`\n${colors.cyan}In sync (${inSync.length}):${colors.reset}`);
  inSync.forEach(({ name, path }) => {
    console.log(`  ${colors.green}✓${colors.reset} ${name} (${path})`);
  });

  if (mismatches.length > 0) {
    console.log(`\n${colors.yellow}Out of sync (${mismatches.length}):${colors.reset}`);
    mismatches.forEach(({ name, path, version }) => {
      console.log(`  ${colors.red}✗${colors.reset} ${name} (${path}): ${version} → ${rootVersion}`);
    });
    return false;
  }

  log.success('All versions are in sync!');
  return true;
}

/**
 * Bump version in root package.json
 */
async function bumpVersion(bumpType = 'patch') {
  const rootPackagePath = join(ROOT_DIR, 'package.json');
  const pkg = await readPackageJson(rootPackagePath);

  const version = pkg.version;
  const parts = version.split('.').map(Number);
  let [major, minor, patch] = parts;

  switch (bumpType) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
    default:
      patch++;
      break;
  }

  const newVersion = `${major}.${minor}.${patch}`;
  pkg.version = newVersion;
  await writePackageJson(rootPackagePath, pkg);

  log.success(`Bumped root version: ${version} → ${newVersion}`);
  return newVersion;
}

/**
 * Set specific version in root package.json
 */
async function setVersion(newVersion) {
  const rootPackagePath = join(ROOT_DIR, 'package.json');
  const pkg = await readPackageJson(rootPackagePath);
  const oldVersion = pkg.version;

  pkg.version = newVersion;
  await writePackageJson(rootPackagePath, pkg);

  log.success(`Set root version: ${oldVersion} → ${newVersion}`);
  return newVersion;
}

/**
 * Execute shell command and return output
 */
function execCommand(command, options = {}) {
  try {
    return execSync(command, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
  } catch (err) {
    if (options.ignoreError) {
      return null;
    }
    throw err;
  }
}

/**
 * Check if git is clean (no uncommitted changes)
 */
function isGitClean() {
  try {
    const status = execCommand('git status --porcelain', { silent: true });
    return !status || status.trim() === '';
  } catch {
    return false;
  }
}

/**
 * Get the latest commit message
 */
function getLatestCommitMessage() {
  try {
    return execCommand('git log -1 --pretty=%B', { silent: true })?.trim() || 'Release';
  } catch {
    return 'Release';
  }
}

/**
 * Create git tag for version
 */
async function createGitTag(version) {
  const tagName = `v${version}`;

  log.step('Creating Git Tag');

  // Check if tag already exists
  try {
    const existingTag = execCommand(`git rev-parse "${tagName}"`, {
      silent: true,
      ignoreError: true,
    });
    if (existingTag) {
      log.warn(`Tag ${tagName} already exists, skipping tag creation`);
      return { created: false, tagName, reason: 'already_exists' };
    }
  } catch {
    // Tag doesn't exist, continue
  }

  // Create annotated tag
  try {
    const message = getLatestCommitMessage();
    execCommand(`git tag -a "${tagName}" -m "${message}"`, { silent: true });
    log.success(`Created git tag: ${tagName}`);
    return { created: true, tagName };
  } catch (err) {
    log.error(`Failed to create git tag: ${err.message}`);
    return { created: false, tagName, error: err.message };
  }
}

/**
 * Push git tag to remote
 */
async function pushGitTag(tagName) {
  log.step('Pushing Git Tag to Remote');

  try {
    execCommand(`git push origin "${tagName}"`, { silent: true });
    log.success(`Pushed tag ${tagName} to origin`);
    return { pushed: true };
  } catch (err) {
    log.error(`Failed to push tag: ${err.message}`);
    return { pushed: false, error: err.message };
  }
}

/**
 * Create GitHub release using gh CLI
 */
async function createGitHubRelease(version, options = {}) {
  const tagName = `v${version}`;

  log.step('Creating GitHub Release');

  // Check if gh CLI is available
  try {
    execCommand('gh --version', { silent: true });
  } catch {
    log.warn('GitHub CLI (gh) not found. Install it to create releases automatically.');
    log.info('To install: https://cli.github.com/');
    return { created: false, reason: 'gh_cli_not_found' };
  }

  // Check if already authenticated
  try {
    execCommand('gh auth status', { silent: true });
  } catch {
    log.warn('Not authenticated with GitHub CLI. Run: gh auth login');
    return { created: false, reason: 'not_authenticated' };
  }

  // Check if release already exists
  try {
    const existingRelease = execCommand(`gh release view "${tagName}"`, {
      silent: true,
      ignoreError: true,
    });
    if (existingRelease) {
      log.warn(`GitHub release for ${tagName} already exists`);
      return { created: false, tagName, reason: 'release_exists' };
    }
  } catch {
    // Release doesn't exist, continue
  }

  // Generate release notes from recent commits
  let releaseNotes = '';
  try {
    // Get commits since last tag
    const lastTag = execCommand('git describe --tags --abbrev=0', {
      silent: true,
      ignoreError: true,
    })?.trim();

    if (lastTag) {
      const commits = execCommand(
        `git log ${lastTag}..HEAD --pretty=format:"- %s (%h)" --no-merges`,
        {
          silent: true,
        }
      );
      if (commits) {
        releaseNotes = `## Changes since ${lastTag}\n\n${commits}`;
      }
    }
  } catch {
    // Ignore errors generating release notes
  }

  // Create release
  try {
    const args = [
      'gh release create',
      `"${tagName}"`,
      options.draft ? '--draft' : '',
      options.prerelease ? '--prerelease' : '',
      releaseNotes ? `--notes "${releaseNotes}"` : '--generate-notes',
    ]
      .filter(Boolean)
      .join(' ');

    execCommand(args, { silent: true });
    log.success(`Created GitHub release for ${tagName}`);
    return { created: true, tagName, url: `https://github.com/.../releases/tag/${tagName}` };
  } catch (err) {
    log.error(`Failed to create GitHub release: ${err.message}`);
    return { created: false, tagName, error: err.message };
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const checkMode = args.includes('--check');
  const bumpMode = args.includes('--bump');
  const setMode = args.includes('--set');
  const tagMode = args.includes('--tag');
  const releaseMode = args.includes('--release');
  const draftRelease = args.includes('--draft');
  const prerelease = args.includes('--prerelease');
  const bumpType =
    args.find((arg, i) => args[i - 1] === '--bump' && ['major', 'minor', 'patch'].includes(arg)) ||
    'patch';
  const targetVersion = setMode ? args[args.indexOf('--set') + 1] : null;

  if (checkMode) {
    const inSync = await checkVersions();
    process.exit(inSync ? 0 : 1);
    return;
  }

  log.step('Version Sync Tool');
  console.log('Reading version from root package.json...\n');

  let version;
  if (setMode && targetVersion) {
    version = await setVersion(targetVersion);
  } else if (bumpMode) {
    version = await bumpVersion(bumpType);
  } else {
    version = await getRootVersion();
    log.info(`Current root version: ${version}`);
  }

  console.log(`\n${colors.cyan}Syncing version ${version} to all packages...${colors.reset}\n`);

  // Update all package.json files
  const { updated: updatedPackages, skipped: skippedPackages } =
    await updatePackageVersions(version);

  // Update iOS version
  const iosResult = await updateIosVersion(version);

  // Summary
  console.log(`\n${colors.cyan}Summary:${colors.reset}`);
  log.success(`Updated ${updatedPackages.length} package(s)`);
  if (skippedPackages.length > 0) {
    log.info(`Skipped ${skippedPackages.length} package(s) (already up to date)`);
  }
  if (iosResult.updated) {
    log.success('Updated iOS version');
  }

  console.log(`\n${colors.green}✓ Version sync complete!${colors.reset}`);
  console.log(`  Root version: ${version}`);
  console.log(`  iOS build number: ${calculateIosBuildNumber(version)}`);
  console.log(
    `\n${colors.yellow}Note:${colors.reset} Android version is automatically synced from package.json in build.gradle`
  );
}

try {
  await main();
} catch (err) {
  log.error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
}
