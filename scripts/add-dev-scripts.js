#!/usr/bin/env node

/**
 * Script to add enhanced development commands to package.json
 * This script adds various development modes for better local testing
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageJsonPath = path.join(__dirname, '..', 'apps', 'game', 'package.json')

try {
  // Read the current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  // Add enhanced development scripts
  const enhancedScripts = {
    'dev:debug': 'nuxt dev --debug',
    'dev:mobile': 'nuxt dev --host 0.0.0.0',
    'dev:https': 'nuxt dev --https',
    'dev:mobile-https': 'nuxt dev --https --host 0.0.0.0',
    'build:debug': 'nuxt build --debug',
    'generate:debug': 'nuxt generate --debug',
    'preview:https': 'nuxt preview --https',
  }

  // Merge with existing scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    ...enhancedScripts,
  }

  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  console.log('✅ Successfully added enhanced development scripts to package.json')
  console.log('\nAvailable commands:')
  Object.entries(enhancedScripts).forEach(([command, description]) => {
    console.log(`  • ${command}: ${description}`)
  })
} catch (error) {
  console.error('❌ Error updating package.json:', error.message)
  process.exit(1)
}
