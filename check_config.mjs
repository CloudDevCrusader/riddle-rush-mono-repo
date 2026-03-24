import fs from 'fs';
import path from 'path';

// Try to read package.json files
const rootPath = '/home/runner/work/riddle-rush-mono-repo/riddle-rush-mono-repo';
console.log('=== Root package.json ===');
try {
  const rootPkg = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8'));
  console.log('Name:', rootPkg.name);
  console.log('Scripts:', Object.keys(rootPkg.scripts || {}));
  console.log('Workspaces:', rootPkg.workspaces);
  console.log('Dependencies:', Object.keys(rootPkg.dependencies || {}));
  console.log('DevDependencies:', Object.keys(rootPkg.devDependencies || {}));
} catch (e) {
  console.log('Error reading root package.json:', e.message);
}

console.log('\n=== Apps/Game package.json ===');
try {
  const gamePkg = JSON.parse(fs.readFileSync(path.join(rootPath, 'apps/game/package.json'), 'utf8'));
  console.log('Name:', gamePkg.name);
  console.log('Scripts:', Object.keys(gamePkg.scripts || {}));
  console.log('Dependencies:', Object.keys(gamePkg.dependencies || {}));
  console.log('DevDependencies:', Object.keys(gamePkg.devDependencies || {}));
} catch (e) {
  console.log('Error reading apps/game package.json:', e.message);
}

console.log('\n=== Looking for playwright config ===');
const possibleConfigs = [
  'playwright.config.js',
  'playwright.config.ts', 
  'apps/game/playwright.config.js',
  'apps/game/playwright.config.ts',
  'e2e.config.js',
  'e2e.config.ts'
];

for (const config of possibleConfigs) {
  const configPath = path.join(rootPath, config);
  try {
    if (fs.existsSync(configPath)) {
      console.log(`Found config: ${config}`);
      const content = fs.readFileSync(configPath, 'utf8');
      console.log('Content:', content.substring(0, 500) + '...');
    }
  } catch (e) {
    console.log(`Error reading ${config}:`, e.message);
  }
}