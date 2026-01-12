#!/usr/bin/env node

/**
 * Riddle Rush Agent CLI
 * Unified CLI for managing AI agents and MCP servers
 */

import { spawn } from 'child_process'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { homedir } from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`)
}

function execCommand(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio: opts.silent ? 'pipe' : 'inherit',
      shell: true,
      cwd: opts.cwd || ROOT_DIR,
      ...opts,
    })
    let stdout = '',
      stderr = ''
    if (opts.silent) {
      proc.stdout?.on('data', (d) => (stdout += d))
      proc.stderr?.on('data', (d) => (stderr += d))
    }
    proc.on('close', (code) =>
      code === 0 ? resolve({ stdout, stderr, code }) : reject({ stdout, stderr, code })
    )
  })
}

function loadMCPConfig(file) {
  const path = join(ROOT_DIR, file)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch (e) {
    log(`✗ Failed to parse ${file}: ${e.message}`, 'red')
    return null
  }
}

const agents = {
  copilot: {
    name: 'GitHub Copilot CLI',
    command: 'copilot',
    check: async () => {
      try {
        await execCommand('which', ['copilot'], { silent: true })
        return true
      } catch {
        return false
      }
    },
  },
  claude: {
    name: 'Claude Desktop',
    command: 'claude',
    check: async () => existsSync(join(homedir(), '.config/Claude/config.json')),
    configPath: join(homedir(), '.config/Claude'),
  },
  cursor: {
    name: 'Cursor',
    command: 'cursor',
    check: async () => {
      try {
        await execCommand('which', ['cursor'], { silent: true })
        return true
      } catch {
        return false
      }
    },
    configPath: join(homedir(), '.cursor'),
  },
  vscode: {
    name: 'VS Code',
    command: 'code',
    check: async () => {
      try {
        await execCommand('which', ['code'], { silent: true })
        return true
      } catch {
        return false
      }
    },
  },
}

async function listAgents() {
  log('\n🤖 Installed AI Agents:\n', 'blue')
  for (const [key, agent] of Object.entries(agents)) {
    const installed = await agent.check()
    log(
      `${installed ? '✓' : ' '} ${agent.name}${installed && agent.configPath ? `\n   Config: ${agent.configPath}` : ''}`,
      installed ? 'green' : 'reset'
    )
  }
  console.log()
}

function listMCPServers() {
  log('\n📦 Available MCP Servers:\n', 'blue')
  const mcpConfig = loadMCPConfig('.mcp.json')
  const fastmcpConfig = loadMCPConfig('fastmcp.json')

  if (mcpConfig?.mcpServers) {
    log('From .mcp.json:', 'cyan')
    Object.entries(mcpConfig.mcpServers).forEach(([name, config]) => {
      log(`  • ${name}`, 'green')
      log(`    ${config.command} ${config.args?.join(' ') || ''}`, 'reset')
    })
    console.log()
  }

  if (fastmcpConfig?.mcpServers) {
    log('From fastmcp.json:', 'cyan')
    Object.entries(fastmcpConfig.mcpServers).forEach(([name, config]) => {
      log(`  • ${name}`, 'green')
      log(`    ${config.description}`, 'reset')
    })
  }
}

async function setupAgent(agentName) {
  const agent = agents[agentName]
  if (!agent) {
    log(`✗ Unknown agent: ${agentName}`, 'red')
    log(`Available: ${Object.keys(agents).join(', ')}`, 'cyan')
    return
  }

  log(`\n🔧 Setting up ${agent.name}...\n`, 'blue')
  const installed = await agent.check()
  if (!installed) {
    log(`⚠ ${agent.name} is not installed`, 'yellow')
    return
  }

  if (agent.configPath) {
    mkdirSync(agent.configPath, { recursive: true })
    const mcpConfig = loadMCPConfig('.mcp.json')
    const fastmcpConfig = loadMCPConfig('fastmcp.json')

    if (mcpConfig) {
      writeFileSync(join(agent.configPath, 'mcp.json'), JSON.stringify(mcpConfig, null, 2))
      log(`✓ Copied .mcp.json to ${agent.configPath}`, 'green')
    }
    if (fastmcpConfig) {
      writeFileSync(join(agent.configPath, 'fastmcp.json'), JSON.stringify(fastmcpConfig, null, 2))
      log(`✓ Copied fastmcp.json to ${agent.configPath}`, 'green')
    }
    log(`\n✅ ${agent.name} configured! Restart to apply.`, 'green')
  } else {
    log(`ℹ ${agent.name} uses project .mcp.json automatically`, 'cyan')
  }
}

async function runQualityChecks() {
  log('\n🔍 Running Quality Checks...\n', 'blue')
  const checks = [
    { name: 'Syncpack', cmd: 'pnpm', args: ['run', 'syncpack:check'] },
    { name: 'TypeScript', cmd: 'pnpm', args: ['run', 'typecheck'] },
    { name: 'ESLint', cmd: 'pnpm', args: ['run', 'lint'] },
  ]
  let allPassed = true
  for (const check of checks) {
    try {
      log(`Running ${check.name}...`, 'cyan')
      await execCommand(check.cmd, check.args, { silent: true })
      log(`✓ ${check.name} passed`, 'green')
    } catch {
      log(`✗ ${check.name} failed`, 'red')
      allPassed = false
    }
  }
  console.log()
  log(allPassed ? '✅ All checks passed!' : '❌ Some checks failed', allPassed ? 'green' : 'red')
}

async function autoFix() {
  log('\n🔧 Auto-fixing issues...\n', 'blue')
  try {
    log('Fixing dependencies...', 'cyan')
    await execCommand('pnpm', ['run', 'syncpack:fix'], { silent: true })
    log('✓ Dependencies fixed', 'green')

    log('Fixing linting...', 'cyan')
    await execCommand('pnpm', ['run', 'lint:fix'], { silent: true })
    log('✓ Linting fixed', 'green')

    log('Formatting code...', 'cyan')
    await execCommand('pnpm', ['run', 'format'], { silent: true })
    log('✓ Code formatted', 'green')

    log('\n✅ Auto-fix complete!', 'green')
  } catch {
    log('Some fixes failed', 'red')
  }
}

function showHelp() {
  console.log(`
${colors.blue}═══════════════════════════════════════════════════════${colors.reset}
${colors.blue}   🤖 Riddle Rush Agent CLI                            ${colors.reset}
${colors.blue}═══════════════════════════════════════════════════════${colors.reset}

${colors.cyan}Usage:${colors.reset} agent <command> [options]

${colors.cyan}Commands:${colors.reset}
  list                List installed agents
  setup <agent>       Setup agent configuration
  mcp:list            List MCP servers
  check               Run quality checks
  fix                 Auto-fix issues
  status              Show git status
  help                Show this help

${colors.cyan}Agents:${colors.reset} copilot, claude, cursor, vscode

${colors.cyan}Examples:${colors.reset}
  ${colors.yellow}agent list${colors.reset}              # List agents
  ${colors.yellow}agent setup claude${colors.reset}      # Setup Claude
  ${colors.yellow}agent mcp:list${colors.reset}          # List MCP servers
  ${colors.yellow}agent check${colors.reset}             # Run checks
  ${colors.yellow}agent fix${colors.reset}               # Auto-fix

${colors.blue}═══════════════════════════════════════════════════════${colors.reset}
`)
}

async function main() {
  const args = process.argv.slice(2)
  const cmd = args[0]

  if (!cmd || cmd === 'help') return showHelp()

  try {
    switch (cmd) {
      case 'list':
        await listAgents()
        break
      case 'setup':
        await setupAgent(args[1])
        break
      case 'mcp:list':
        listMCPServers()
        break
      case 'check':
        await runQualityChecks()
        break
      case 'fix':
        await autoFix()
        break
      case 'status':
        await execCommand('bash', [join(ROOT_DIR, 'scripts/agent-status.sh')])
        break
      default:
        log(`✗ Unknown command: ${cmd}`, 'red')
        showHelp()
        process.exit(1)
    }
  } catch (e) {
    log(`✗ Command failed: ${e.message || e}`, 'red')
    process.exit(1)
  }
}

main().catch((e) => {
  log(`✗ Fatal: ${e.message}`, 'red')
  process.exit(1)
})
