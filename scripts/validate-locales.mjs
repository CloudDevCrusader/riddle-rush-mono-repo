import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const localesDir = path.resolve('apps/game/i18n/locales')

const flattenKeys = (value, prefix = '') => {
  if (value === null) return []

  if (typeof value !== 'object') {
    return [prefix]
  }

  const entries = []
  for (const [key, child] of Object.entries(value)) {
    const nextKey = prefix ? `${prefix}.${key}` : key
    entries.push(...flattenKeys(child, nextKey))
  }

  return entries
}

const main = async () => {
  const files = (await readdir(localesDir)).filter((file) => file.endsWith('.json'))
  if (files.length === 0) {
    console.error('No locale files found in', localesDir)
    process.exit(1)
  }

  const localeSets = new Map()

  for (const file of files) {
    const content = await readFile(path.join(localesDir, file), 'utf-8')
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch (error) {
      console.error(`Failed to parse ${file}:`, error)
      process.exit(1)
    }

    const keys = flattenKeys(parsed)
    localeSets.set(file, new Set(keys))
  }

  const referenceFile = files.includes('en.json') ? 'en.json' : files[0]
  const referenceKeys = localeSets.get(referenceFile)

  const report = []

  for (const [file, keys] of localeSets.entries()) {
    if (!referenceKeys || referenceKeys.size === 0) continue

    const missing = [...referenceKeys].filter((key) => !keys.has(key))
    const extra = [...keys].filter((key) => !referenceKeys.has(key))

    if (missing.length || extra.length) {
      report.push({ file, missing, extra })
    }
  }

  if (report.length > 0) {
    console.error('Locale validation failed:')
    for (const { file, missing, extra } of report) {
      if (missing.length > 0) {
        console.error(`  ${file} is missing ${missing.length} keys:`)
        for (const key of missing) {
          console.error(`    - ${key}`)
        }
      }
      if (extra.length > 0) {
        console.error(`  ${file} has ${extra.length} extra keys:`)
        for (const key of extra) {
          console.error(`    - ${key}`)
        }
      }
    }
    process.exit(1)
  }

  console.log('Locale validation passed.')
}

main().catch((error) => {
  console.error('Locale validation failed unexpectedly:', error)
  process.exit(1)
})
