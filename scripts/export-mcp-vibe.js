#!/usr/bin/env node
/**
 * Export MCP configurations for Mistral Vibe platform
 * Converts repository MCP configs to Vibe-compatible format
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read all MCP configurations
const mcpConfig = JSON.parse(fs.readFileSync('.mcp.json', 'utf8'))
const fastmcpConfig = JSON.parse(fs.readFileSync('fastmcp.json', 'utf8'))
const cursorMcpConfig = JSON.parse(fs.readFileSync('.cursor/mcp.json', 'utf8'))

// Convert to Vibe format
const vibeConfig = {
  version: '2.0',
  platform: 'mistral-vibe',
  metadata: {
    repository: 'riddle-rush-mono-repo',
    exportDate: new Date().toISOString(),
    description: 'MCP configurations for Riddle Rush monorepo',
  },
  mcpServers: {},
}

// Merge all servers with Vibe-specific formatting
Object.assign(
  vibeConfig.mcpServers,
  convertToVibeFormat(mcpConfig.mcpServers, 'primary'),
  convertToVibeFormat(fastmcpConfig.mcpServers, 'fastmcp'),
  convertToVibeFormat(cursorMcpConfig.mcpServers, 'cursor')
)

function convertToVibeFormat(servers, source) {
  const result = {}

  for (const [name, config] of Object.entries(servers)) {
    result[`${source}-${name}`] = {
      vibe: {
        version: '2.0',
        compatibility: ['devstral-2', 'devstral-3'],
        priority: source === 'primary' ? 100 : 50,
      },
      type: config.type || 'stdio',
      command: config.command || config.source || 'npx',
      args: config.args || [],
      cwd: config.cwd || process.cwd(),
      env: config.env || {},
      description: config.description || `MCP server from ${source}: ${name}`,
      tags: [source, 'riddle-rush', 'mcp'],
      capabilities: {
        tools: config.tools || ['*'],
        streaming: true,
        concurrentRequests: config.type === 'stdio' ? 1 : 5,
      },
      documentation: {
        url: `https://riddle-rush.com/docs/mcp/${name}`,
        category: getVibeCategory(name),
      },
    }
  }

  return result
}

function getVibeCategory(name) {
  if (name.includes('nuxt') || name.includes('ui')) return 'frontend-framework'
  if (name.includes('playwright') || name.includes('browser')) return 'testing-automation'
  if (name.includes('git') || name.includes('gitlab')) return 'version-control'
  if (name.includes('aws') || name.includes('docker')) return 'cloud-infrastructure'
  if (name.includes('filesystem')) return 'file-operations'
  return 'general-utilities'
}

// Write Vibe configuration
const outputPath = path.join(path.dirname(__dirname), 'vibe-mcp-config.json')
fs.writeFileSync(outputPath, JSON.stringify(vibeConfig, null, 2))

console.log(`✅ Mistral Vibe MCP configuration exported to: ${outputPath}`)
console.log(`Total servers: ${Object.keys(vibeConfig.mcpServers).length}`)

// Generate summary
const summary = {
  sources: ['.mcp.json', 'fastmcp.json', '.cursor/mcp.json'],
  totalServers: Object.keys(vibeConfig.mcpServers).length,
  categories: {},
  outputFile: outputPath,
  vibe: {
    version: vibeConfig.version,
    platform: vibeConfig.platform,
  },
}

for (const server of Object.values(vibeConfig.mcpServers)) {
  const category = server.documentation.category
  summary.categories[category] = (summary.categories[category] || 0) + 1
}

console.log('\n📊 Summary:')
console.log(JSON.stringify(summary, null, 2))

// Create README for Vibe integration
const serverList = Object.keys(vibeConfig.mcpServers)
  .map((name) => `- **${name}**: ${vibeConfig.mcpServers[name].description}`)
  .join('\n')

const readmeContent = `# Mistral Vibe MCP Configuration for Riddle Rush

This configuration file contains all MCP servers from the Riddle Rush monorepo, formatted for Mistral Vibe compatibility.

## Integration Instructions

1. **Copy to Vibe config directory:**
   \`\`\`bash
   cp vibe-mcp-config.json ~/.config/mistral/vibe/mcp-config.json
   \`\`\`

2. **Or reference directly in Vibe settings:**
   \`\`\`json
   {
     "mcp": {
       "configPath": "/path/to/riddle-rush-mono-repo/vibe-mcp-config.json"
     }
   }
   \`\`\`

3. **Restart Vibe agent** to load new configurations.

## Server Categories

- **Frontend Framework**: Nuxt.js, UI components
- **Testing Automation**: Playwright, BrowserMCP
- **Version Control**: Git, GitLab operations
- **Cloud Infrastructure**: AWS, Docker management
- **File Operations**: Filesystem access
- **General Utilities**: Various tools and helpers

## Server List

${serverList}

## Compatibility

- Mistral Vibe v2.0+
- Devstral-2 and Devstral-3 models
- Supports concurrent requests and streaming

## Notes

- All servers are prefixed with their source (primary/fastmcp/cursor)
- Priority is set based on source (primary=100, others=50)
- Environment variables are preserved from original configs
`

fs.writeFileSync(path.join(path.dirname(__dirname), 'vibe-mcp-config/README.md'), readmeContent)
console.log(`✅ Vibe README created`)
