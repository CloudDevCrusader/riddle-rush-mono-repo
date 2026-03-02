#!/usr/bin/env node
/**
 * Enhanced MCP Export Script
 * Reads MCP configurations from multiple sources including:
 * - Local repository files
 * - Installed agents (Claude, Mistral Vibe, Cursor, etc.)
 * - Common configuration directories
 *
 * Exports to both OpenCode and Mistral Vibe formats
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.dirname(__dirname)

// Configuration for different platforms
const PLATFORM_CONFIGS = {
  claude: {
    configPaths: [
      '~/.config/claude/fastmcp.json',
      '~/.config/claude/mcp.json',
      '~/Library/Application Support/Claude/fastmcp.json',
      '~/Library/Application Support/Claude/mcp.json',
    ],
    platformName: 'Claude',
    sourcePrefix: 'claude',
  },
  mistral: {
    configPaths: [
      '~/.config/mistral/vibe/mcp-config.json',
      '~/.config/mistral/mcp.json',
      '~/Library/Application Support/Mistral/mcp.json',
    ],
    platformName: 'Mistral Vibe',
    sourcePrefix: 'vibe',
  },
  cursor: {
    configPaths: ['~/.config/Cursor/mcp.json', '~/Library/Application Support/Cursor/mcp.json'],
    platformName: 'Cursor',
    sourcePrefix: 'cursor-agent',
  },
  github: {
    configPaths: [
      '~/.config/github-copilot/mcp.json',
      '~/Library/Application Support/GitHub Copilot/mcp.json',
    ],
    platformName: 'GitHub Copilot',
    sourcePrefix: 'github',
  },
  gemini: {
    configPaths: [
      '~/.config/gemini-cli/mcp.json',
      '~/.config/gemini/mcp.json',
      '~/Library/Application Support/Gemini/mcp.json',
    ],
    platformName: 'Gemini CLI',
    sourcePrefix: 'gemini',
  },
}

// Local repository MCP files
const LOCAL_MCP_FILES = [
  { path: '.mcp.json', sourcePrefix: 'repo-primary', platformName: 'Repository Primary' },
  { path: 'fastmcp.json', sourcePrefix: 'repo-fastmcp', platformName: 'Repository FastMCP' },
  { path: '.cursor/mcp.json', sourcePrefix: 'repo-cursor', platformName: 'Repository Cursor' },
  { path: '.vscode/mcp.json', sourcePrefix: 'repo-vscode', platformName: 'Repository VSCode' },
]

/**
 * Expand tilde and resolve home directory
 */
function expandHomePath(filePath) {
  if (filePath.startsWith('~')) {
    const home = process.env.HOME || (process.platform === 'win32' ? process.env.USERPROFILE : '/')
    return path.join(home, filePath.slice(2))
  }
  return filePath
}

/**
 * Read MCP configuration from file if it exists
 */
function readMcpConfigIfExists(filePath, sourcePrefix, platformName) {
  try {
    const expandedPath = expandHomePath(filePath)
    if (fs.existsSync(expandedPath)) {
      const content = fs.readFileSync(expandedPath, 'utf8')
      const config = JSON.parse(content)
      console.log(`✅ Found ${platformName} MCP config: ${expandedPath}`)
      return { config, sourcePrefix, platformName, filePath: expandedPath }
    }
  } catch (error) {
    console.warn(`⚠️  Could not read ${platformName} config at ${filePath}: ${error.message}`)
  }
  return null
}

/**
 * Find all available MCP configurations
 */
function findAllMcpConfigs() {
  const configs = []

  // Read local repository files
  console.log('🔍 Searching for local MCP configurations...')
  LOCAL_MCP_FILES.forEach(({ path, sourcePrefix, platformName }) => {
    const fullPath = path.startsWith('/') ? path : `${repoRoot}/${path}`
    const config = readMcpConfigIfExists(fullPath, sourcePrefix, platformName)
    if (config) configs.push(config)
  })

  // Read installed agent configurations
  console.log('🔍 Searching for installed agent MCP configurations...')
  Object.entries(PLATFORM_CONFIGS).forEach(([platformKey, platformConfig]) => {
    platformConfig.configPaths.forEach((configPath) => {
      const config = readMcpConfigIfExists(
        configPath,
        platformConfig.sourcePrefix,
        platformConfig.platformName
      )
      if (config) configs.push(config)
    })
  })

  // Try to find other MCP files in common locations
  console.log('🔍 Searching for additional MCP configurations...')
  try {
    const result = execSync('find ~ -name "*mcp*.json" -type f 2>/dev/null | head -20', {
      encoding: 'utf8',
      timeout: 5000,
    })

    result
      .trim()
      .split('\n')
      .forEach((filePath) => {
        if (filePath && !configs.some((c) => c.filePath === filePath)) {
          try {
            const content = fs.readFileSync(filePath, 'utf8')
            const config = JSON.parse(content)
            const sourcePrefix = `found-${path.basename(filePath, '.json').replace(/[^a-z0-9]/gi, '-')}`
            const platformName = `Found MCP (${path.basename(path.dirname(filePath))})`

            console.log(`✅ Found additional MCP config: ${filePath}`)
            configs.push({ config, sourcePrefix, platformName, filePath })
          } catch (error) {
            console.warn(`⚠️  Could not parse MCP config at ${filePath}: ${error.message}`)
          }
        }
      })
  } catch (error) {
    console.log('🔍 No additional MCP files found via system search')
  }

  return configs
}

/**
 * Extract MCP servers from configuration
 */
function extractMcpServers(config, sourcePrefix, platformName) {
  const servers = {}

  if (config.mcpServers) {
    Object.entries(config.mcpServers).forEach(([name, serverConfig]) => {
      const serverName = `${sourcePrefix}-${name}`
      servers[serverName] = {
        ...serverConfig,
        _source: platformName,
        _originalName: name,
      }
    })
  }

  // Handle alternative MCP configurations
  if (config.servers) {
    Object.entries(config.servers).forEach(([name, serverConfig]) => {
      const serverName = `${sourcePrefix}-${name}`
      servers[serverName] = {
        ...serverConfig,
        _source: platformName,
        _originalName: name,
      }
    })
  }

  return servers
}

/**
 * Convert to OpenCode format
 */
function convertToOpenCode(servers, sourceInfo) {
  const result = {}

  Object.entries(servers).forEach(([name, serverConfig]) => {
    result[name] = {
      type: 'opencode-mcp',
      source: serverConfig.command || serverConfig.source || 'npx',
      args: serverConfig.args || [],
      env: serverConfig.env || {},
      description:
        serverConfig.description ||
        `MCP server from ${sourceInfo.platformName}: ${serverConfig._originalName || name}`,
      tags: [
        sourceInfo.sourcePrefix,
        'mcp',
        sourceInfo.platformName.toLowerCase().replace(/\s+/g, '-'),
      ],
      opencode: {
        priority: sourceInfo.sourcePrefix.startsWith('repo-') ? 'high' : 'medium',
        category: getOpenCodeCategory(name),
        documentation: `https://riddle-rush.com/docs/mcp/${serverConfig._originalName || name}`,
        sourcePlatform: sourceInfo.platformName,
      },
    }
  })

  return result
}

/**
 * Convert to Mistral Vibe format
 */
function convertToVibe(servers, sourceInfo) {
  const result = {}

  Object.entries(servers).forEach(([name, serverConfig]) => {
    result[name] = {
      vibe: {
        version: '2.0',
        compatibility: ['devstral-2', 'devstral-3'],
        priority: sourceInfo.sourcePrefix.startsWith('repo-') ? 100 : 50,
        sourcePlatform: sourceInfo.platformName,
      },
      type: serverConfig.type || 'stdio',
      command: serverConfig.command || serverConfig.source || 'npx',
      args: serverConfig.args || [],
      cwd: serverConfig.cwd || repoRoot,
      env: serverConfig.env || {},
      description:
        serverConfig.description ||
        `MCP server from ${sourceInfo.platformName}: ${serverConfig._originalName || name}`,
      tags: [
        sourceInfo.sourcePrefix,
        'mcp',
        'vibe',
        sourceInfo.platformName.toLowerCase().replace(/\s+/g, '-'),
      ],
      capabilities: {
        tools: serverConfig.tools || ['*'],
        streaming: true,
        concurrentRequests: serverConfig.type === 'stdio' ? 1 : 5,
      },
      documentation: {
        url: `https://riddle-rush.com/docs/mcp/${serverConfig._originalName || name}`,
        category: getVibeCategory(name),
      },
    }
  })

  return result
}

/**
 * Categorize servers for OpenCode
 */
function getOpenCodeCategory(name) {
  if (name.includes('nuxt') || name.includes('ui')) return 'frontend'
  if (name.includes('playwright') || name.includes('browser')) return 'testing'
  if (name.includes('git') || name.includes('gitlab')) return 'devops'
  if (name.includes('aws') || name.includes('docker')) return 'cloud'
  if (name.includes('filesystem')) return 'file-operations'
  if (name.includes('claude') || name.includes('mistral') || name.includes('vibe'))
    return 'ai-platforms'
  return 'general'
}

/**
 * Categorize servers for Mistral Vibe
 */
function getVibeCategory(name) {
  if (name.includes('nuxt') || name.includes('ui')) return 'frontend-framework'
  if (name.includes('playwright') || name.includes('browser')) return 'testing-automation'
  if (name.includes('git') || name.includes('gitlab')) return 'version-control'
  if (name.includes('aws') || name.includes('docker')) return 'cloud-infrastructure'
  if (name.includes('filesystem')) return 'file-operations'
  if (name.includes('claude') || name.includes('mistral') || name.includes('vibe'))
    return 'ai-platforms'
  return 'general-utilities'
}

/**
 * Main export function
 */
function exportMcpConfigs() {
  console.log('🚀 Starting Enhanced MCP Export...')
  console.log('=================================')

  // Find all MCP configurations
  const allConfigs = findAllMcpConfigs()

  if (allConfigs.length === 0) {
    console.log('❌ No MCP configurations found!')
    return
  }

  console.log(`\n📊 Found ${allConfigs.length} MCP configurations:`)
  allConfigs.forEach((config) => {
    const serverCount = config.config.mcpServers ? Object.keys(config.config.mcpServers).length : 0
    console.log(`  • ${config.platformName}: ${serverCount} servers from ${config.filePath}`)
  })

  // Extract all servers
  const allServers = {}
  const sourceInfo = []

  allConfigs.forEach((config) => {
    const servers = extractMcpServers(config.config, config.sourcePrefix, config.platformName)
    Object.assign(allServers, servers)
    sourceInfo.push(config)
  })

  console.log(`\n🔄 Total servers found: ${Object.keys(allServers).length}`)

  // Convert to OpenCode format
  console.log('\n📦 Exporting to OpenCode format...')
  const opencodeConfig = {
    version: '1.0',
    platform: 'opencode',
    metadata: {
      generatedFrom: sourceInfo.map((s) => s.platformName),
      generatedDate: new Date().toISOString(),
      totalSources: allConfigs.length,
      totalServers: Object.keys(allServers).length,
    },
    mcpServers: {},
  }

  allConfigs.forEach((config) => {
    const servers = extractMcpServers(config.config, config.sourcePrefix, config.platformName)
    Object.assign(opencodeConfig.mcpServers, convertToOpenCode(servers, config))
  })

  // Write OpenCode configuration
  const opencodePath = path.join(repoRoot, 'opencode-mcp-enhanced.json')
  fs.writeFileSync(opencodePath, JSON.stringify(opencodeConfig, null, 2))
  console.log(`✅ OpenCode configuration written to: ${opencodePath}`)

  // Convert to Mistral Vibe format
  console.log('\n📦 Exporting to Mistral Vibe format...')
  const vibeConfig = {
    version: '2.0',
    platform: 'mistral-vibe',
    metadata: {
      generatedFrom: sourceInfo.map((s) => s.platformName),
      generatedDate: new Date().toISOString(),
      totalSources: allConfigs.length,
      totalServers: Object.keys(allServers).length,
      repository: 'riddle-rush-mono-repo',
    },
    mcpServers: {},
  }

  allConfigs.forEach((config) => {
    const servers = extractMcpServers(config.config, config.sourcePrefix, config.platformName)
    Object.assign(vibeConfig.mcpServers, convertToVibe(servers, config))
  })

  // Write Vibe configuration
  const vibePath = path.join(repoRoot, 'vibe-mcp-enhanced.json')
  fs.writeFileSync(vibePath, JSON.stringify(vibeConfig, null, 2))
  console.log(`✅ Mistral Vibe configuration written to: ${vibePath}`)

  // Generate summary
  generateSummary(allConfigs, opencodeConfig, vibeConfig)

  console.log('\n🎉 Export completed successfully!')
  console.log(`   OpenCode: ${Object.keys(opencodeConfig.mcpServers).length} servers`)
  console.log(`   Mistral Vibe: ${Object.keys(vibeConfig.mcpServers).length} servers`)
}

/**
 * Generate summary report
 */
function generateSummary(allConfigs, opencodeConfig, vibeConfig) {
  const summary = {
    generatedDate: new Date().toISOString(),
    totalSources: allConfigs.length,
    totalServers: Object.keys(opencodeConfig.mcpServers).length,
    sources: allConfigs.map((config) => ({
      platform: config.platformName,
      filePath: config.filePath,
      serverCount: config.config.mcpServers ? Object.keys(config.config.mcpServers).length : 0,
    })),
    categories: {
      opencode: {},
      vibe: {},
    },
    outputFiles: {
      opencode: 'opencode-mcp-enhanced.json',
      vibe: 'vibe-mcp-enhanced.json',
    },
  }

  // Categorize OpenCode servers
  Object.values(opencodeConfig.mcpServers).forEach((server) => {
    const category = server.opencode.category
    summary.categories.opencode[category] = (summary.categories.opencode[category] || 0) + 1
  })

  // Categorize Vibe servers
  Object.values(vibeConfig.mcpServers).forEach((server) => {
    const category = server.documentation.category
    summary.categories.vibe[category] = (summary.categories.vibe[category] || 0) + 1
  })

  const summaryPath = path.join(repoRoot, 'mcp-export-summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
  console.log(`✅ Export summary written to: ${summaryPath}`)

  // Generate human-readable summary
  const humanSummary = `
📊 Export Summary Report
========================

Generated: ${new Date().toLocaleString()}
Total Sources: ${summary.totalSources}
Total Servers: ${summary.totalServers}

📁 Source Configurations:
${summary.sources.map((source) => `  • ${source.platform}: ${source.serverCount} servers`).join('\n')}

📦 OpenCode Categories:
${Object.entries(summary.categories.opencode)
  .map(([cat, count]) => `  • ${cat}: ${count} servers`)
  .join('\n')}

🎯 Mistral Vibe Categories:
${Object.entries(summary.categories.vibe)
  .map(([cat, count]) => `  • ${cat}: ${count} servers`)
  .join('\n')}

💾 Output Files:
  • OpenCode: ${summary.outputFiles.opencode}
  • Mistral Vibe: ${summary.outputFiles.vibe}
  • Summary: mcp-export-summary.json

✨ Integration Instructions:

OpenCode:
  cp opencode-mcp-enhanced.json ~/.config/opencode/mcp-config.json

Mistral Vibe:
  cp vibe-mcp-enhanced.json ~/.config/mistral/vibe/mcp-config.json
`

  console.log(humanSummary)
}

// Run the export
try {
  exportMcpConfigs()
} catch (error) {
  console.error('❌ Export failed:', error)
  process.exit(1)
}
