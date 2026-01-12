#!/usr/bin/env node

/**
 * Test script for asset path helper function
 * Verifies that getAssetPath works correctly in different scenarios
 */

// Simulate the getAssetPath function
function getAssetPath(path, baseUrl = '') {
  if (!path) return ''

  // Handle absolute URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Remove 'assets/' prefix if present
  const cleanPath = path.startsWith('assets/') ? path.substring(7) : path

  // Handle local development (empty baseUrl or '/')
  if (!baseUrl || baseUrl === '/' || baseUrl === '') {
    // For local development, assets are in public folder
    return `/${cleanPath}`
  }

  // For production/deployment, use baseUrl
  // Ensure no double slashes
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath
  return `${normalizedBaseUrl}/${normalizedPath}`
}

console.log('🧪 Testing Asset Path Helper Function\n')

// Test cases
const testCases = [
  {
    name: 'Local development with assets prefix',
    path: 'assets/main-menu/BACKGROUND.png',
    baseUrl: '',
    expected: '/main-menu/BACKGROUND.png',
  },
  {
    name: 'Local development without assets prefix',
    path: 'main-menu/BACKGROUND.png',
    baseUrl: '',
    expected: '/main-menu/BACKGROUND.png',
  },
  {
    name: 'Local development with baseUrl = /',
    path: 'assets/main-menu/BACKGROUND.png',
    baseUrl: '/',
    expected: '/main-menu/BACKGROUND.png',
  },
  {
    name: 'Production with baseUrl',
    path: 'assets/main-menu/BACKGROUND.png',
    baseUrl: '/riddle-rush/',
    expected: '/riddle-rush/main-menu/BACKGROUND.png',
  },
  {
    name: 'Production with baseUrl and full path',
    path: 'assets/main-menu/BACKGROUND.png',
    baseUrl: 'https://example.com/riddle-rush/',
    expected: 'https://example.com/riddle-rush/main-menu/BACKGROUND.png',
  },
  {
    name: 'Absolute URL (should pass through)',
    path: 'https://example.com/image.png',
    baseUrl: '/riddle-rush/',
    expected: 'https://example.com/image.png',
  },
  {
    name: 'Empty path',
    path: '',
    baseUrl: '/riddle-rush/',
    expected: '',
  },
]

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  const result = getAssetPath(testCase.path, testCase.baseUrl)
  const success = result === testCase.expected

  if (success) {
    console.log(`✅ Test ${index + 1}: ${testCase.name}`)
    console.log(`   Input: "${testCase.path}" + "${testCase.baseUrl}"`)
    console.log(`   Output: "${result}"`)
    passed++
  } else {
    console.log(`❌ Test ${index + 1}: ${testCase.name}`)
    console.log(`   Input: "${testCase.path}" + "${testCase.baseUrl}"`)
    console.log(`   Expected: "${testCase.expected}"`)
    console.log(`   Got: "${result}"`)
    failed++
  }
  console.log('')
})

console.log(`📊 Results: ${passed} passed, ${failed} failed`)

if (failed === 0) {
  console.log('✅ All tests passed! Asset path helper is working correctly.')
} else {
  console.log('❌ Some tests failed. Please review the asset path logic.')
}

// Show example usage for localhost
console.log('\n💡 Example for localhost development:')
console.log('   Input: getAssetPath("assets/main-menu/BACKGROUND.png", "")')
console.log('   Output:', getAssetPath('assets/main-menu/BACKGROUND.png', ''))
console.log('   This will correctly load: /main-menu/BACKGROUND.png')
