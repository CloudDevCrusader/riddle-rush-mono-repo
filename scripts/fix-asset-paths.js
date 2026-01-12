#!/usr/bin/env node

/**
 * Script to fix asset paths in Vue components
 * Replaces ${baseUrl}assets/... with getAssetPath('assets/...')
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pagesDir = path.join(__dirname, '..', 'apps', 'game', 'pages')
const componentsDir = path.join(__dirname, '..', 'apps', 'game', 'components')

// Files to process
const filesToProcess = [
  'index.vue',
  'game.vue',
  'players.vue',
  'leaderboard.vue',
  'settings.vue',
  'language.vue',
  'credits.vue',
  'round-start.vue',
  'results.vue',
  'FortuneWheel.vue',
]

function fixAssetPathsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // Replace ${baseUrl}assets/ with getAssetPath('assets/
    const regex = /`\$\{baseUrl\}assets\/([^`]+)`/g
    const updatedContent = content.replace(regex, (match, assetPath) => {
      return `getAssetPath('assets/${assetPath.replace('.png', '')}.png')`
    })

    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`✅ Updated: ${path.basename(filePath)}`)
      return true
    }

    return false
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message)
    return false
  }
}

console.log('🚀 Starting asset path fix...\n')

// Process files
let filesUpdated = 0

// Process pages
filesToProcess.forEach((file) => {
  const filePath = path.join(pagesDir, file)
  if (fs.existsSync(filePath)) {
    if (fixAssetPathsInFile(filePath)) filesUpdated++
  }
})

// Process components
filesToProcess.forEach((file) => {
  const filePath = path.join(componentsDir, file)
  if (fs.existsSync(filePath)) {
    if (fixAssetPathsInFile(filePath)) filesUpdated++
  }
})

console.log(`\n📊 Summary: Updated ${filesUpdated} files`)

if (filesUpdated === 0) {
  console.log('⚠️  No files needed updating or files not found')
} else {
  console.log('✅ Asset path fix completed!')
  console.log('\n📝 Note: Make sure to:')
  console.log('  1. Import getAssetPath in each component')
  console.log('  2. Add getAssetPath to the setup script')
  console.log('  3. Test local development')
}
