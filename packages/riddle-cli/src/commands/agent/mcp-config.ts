import { Command } from '@oclif/core'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export default class AgentMcpConfig extends Command {
  static override description = 'Validate MCP configuration files'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    this.log('')
    this.log('╔════════════════════════════════════════════════════════════╗')
    this.log('║              🔧 MCP Configuration Check                   ║')
    this.log('╚════════════════════════════════════════════════════════════╝')
    this.log('')

    const configPaths = [
      { path: join(process.cwd(), '.mcp.json'), name: 'Root MCP Config' },
      { path: join(process.cwd(), 'fastmcp.json'), name: 'FastMCP Config' },
      { path: join(process.cwd(), 'apps/game/.mcp.json'), name: 'Game App MCP Config' },
    ]

    let validConfigs = 0

    for (const config of configPaths) {
      this.log(`Checking: ${config.name}`)
      try {
        const content = readFileSync(config.path, 'utf-8')
        const parsed = JSON.parse(content)

        if (parsed.mcpServers && Object.keys(parsed.mcpServers).length > 0) {
          this.log(`✓ ${config.name} is valid (${Object.keys(parsed.mcpServers).length} servers)`)
          validConfigs++
        } else {
          this.log(`✗ ${config.name} has no MCP servers defined`)
        }
      } catch (error) {
        this.log(
          `✗ ${config.name} is invalid: ${error instanceof Error ? error.message : String(error)}`
        )
      }
      this.log('')
    }

    // Check Claude Desktop config
    const claudeConfigPath = join(
      homedir(),
      'Library/Application Support/Claude/claude_desktop_config.json'
    )
    this.log(`Checking: Claude Desktop Config (${claudeConfigPath})`)
    try {
      const content = readFileSync(claudeConfigPath, 'utf-8')
      const parsed = JSON.parse(content)

      if (parsed.mcpServers && Object.keys(parsed.mcpServers).length > 0) {
        this.log(
          `✓ Claude Desktop config is valid (${Object.keys(parsed.mcpServers).length} servers)`
        )
        validConfigs++
      } else {
        this.log('✗ Claude Desktop config has no MCP servers defined')
      }
    } catch {
      this.log('✗ Claude Desktop config not found or invalid')
    }

    this.log('')
    this.log('╔════════════════════════════════════════════════════════════╗')
    if (validConfigs === configPaths.length + 1) {
      this.log('║ ✅ All MCP configurations are valid!                       ║')
      this.log('╚════════════════════════════════════════════════════════════╝')
    } else {
      this.log(`║ ⚠️  ${validConfigs}/${configPaths.length + 1} configurations are valid. ║`)
      this.log('╚════════════════════════════════════════════════════════════╝')
      this.log('')
      this.log('Common issues:')
      this.log('  • Invalid JSON syntax in config files')
      this.log('  • Missing mcpServers object')
      this.log('  • Claude Desktop config not found')
      this.error('MCP configuration validation failed', { exit: 1 })
    }
  }
}
