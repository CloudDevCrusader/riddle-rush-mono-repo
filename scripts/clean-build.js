#!/usr/bin/env node

/**
 * Script to clean build artifacts and rebuild
 * Helps resolve build-related issues like 404 errors
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Starting clean build process...\n');

try {
  // Step 1: Clean build artifacts
  console.log('🧹 Cleaning build artifacts...');

  const directoriesToClean = ['.nuxt', '.output', 'node_modules/.vite', 'node_modules/.cache'];

  directoriesToClean.forEach((dir) => {
    const dirPath = path.join(projectRoot, dir);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${dir}`);
    }
  });

  // Step 2: Reinstall dependencies
  console.log('\n📦 Reinstalling dependencies...');
  execSync('pnpm install', {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  // Step 3: Build the application
  console.log('\n🏗️ Building application...');
  execSync('pnpm build', {
    cwd: path.join(projectRoot, 'apps', 'game'),
    stdio: 'inherit',
  });

  console.log('\n✅ Clean build completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('  1. Start development server: pnpm dev');
  console.log('  2. Test the application locally');
  console.log('  3. Check for any remaining issues');
} catch (error) {
  console.error('\n❌ Clean build failed:', error.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('  1. Check Node.js and pnpm versions');
  console.log('  2. Verify all dependencies are installed');
  console.log('  3. Try deleting node_modules and reinstalling');
  console.log('  4. Check for any error messages in the console');
  process.exit(1);
}
