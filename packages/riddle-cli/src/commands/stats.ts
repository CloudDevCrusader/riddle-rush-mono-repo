import { Command } from '@oclif/core'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export default class Stats extends Command {
  static override description = 'Display agent statistics and configuration overview'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    this.log('')
    this.log('╔════════════════════════════════════════════════════════════════════════╗')
    this.log('║              🤖 RIDDLE RUSH AGENT STATISTICS 🤖                       ║')
    this.log('╠════════════════════════════════════════════════════════════════════════╣')

    // Detect installed agents
    const agents = this.detectAgents()
    const configs = this.checkConfigs()
    const apiKeys = this.checkApiKeys()

    // Summary
    this.log('║                                                                        ║')
    this.log(`║  Total Agents Detected ............ ${agents.installed}/9                       ║`)
    this.log(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      `║  Configured Agents ................ ${configs.configured}/9                       ║`
    )
    this.log('║                                                                        ║')
=======
=======
>>>>>>> Stashed changes
      `║  Configured Agents ................ ${configs.configured}/9                       ║`,
    );
    this.log('║                                                                        ║');
>>>>>>> Stashed changes

    // Agent status
    this.log('╠════════════════════════════════════════════════════════════════════════╣')
    this.log('║                         AGENT STATUS                                   ║')
    this.log('╠════════════════════════════════════════════════════════════════════════╣')
    this.log('║ Agent              │ Installed   │ Configured  │ API Key              ║')
    this.log('╠════════════════════════════════════════════════════════════════════════╣')

    const agentList = [
      { name: 'OpenCode', key: 'opencode', apiKey: 'PERPLEXITY_API_KEY' },
      { name: 'Kilo Code', key: 'kilocode', apiKey: 'PERPLEXITY_API_KEY' },
      { name: 'Codex', key: 'codex', apiKey: 'OPENAI_API_KEY' },
      { name: 'Claude Code', key: 'claude-code', apiKey: 'ANTHROPIC_API_KEY' },
      { name: 'GitHub Copilot', key: 'copilot', apiKey: 'GH_TOKEN' },
      { name: 'FastMCP', key: 'fastmcp', apiKey: null },
      { name: 'Gemini CLI', key: 'gemini-cli', apiKey: 'GEMINI_API_KEY' },
      { name: 'Mistral Vibe', key: 'mistral-vibe', apiKey: 'MISTRAL_API_KEY' },
      { name: 'Cursor Agent', key: 'cursor-agent', apiKey: null },
    ]

    for (const agent of agentList) {
      const installed = agents.details[agent.key] ? '✅ Yes' : '❌ No'
      const configured = configs.details[agent.key] ? '✅ Yes' : '❌ No'
      let apiStatus = 'N/A'
      if (agent.apiKey) {
        apiStatus = apiKeys[agent.apiKey] ? '✅ Set' : '❌ Missing'
      } else {
        apiStatus = 'Not Required'
      }

      const namePadded = agent.name.padEnd(17)
      const installedPadded = installed.padEnd(11)
      const configuredPadded = configured.padEnd(11)
      this.log(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        `║ ${namePadded} │ ${installedPadded} │ ${configuredPadded} │ ${apiStatus.padEnd(20)} ║`
      )
=======
=======
>>>>>>> Stashed changes
        `║ ${namePadded} │ ${installedPadded} │ ${configuredPadded} │ ${apiStatus.padEnd(20)} ║`,
      );
>>>>>>> Stashed changes
    }

    // Git status
    this.log('╠════════════════════════════════════════════════════════════════════════╣')
    this.log('║                      REPOSITORY STATUS                                 ║')
    this.log('╠════════════════════════════════════════════════════════════════════════╣')

    const gitStatus = this.getGitStatus()
    this.log(`║  Current Branch ................... ${gitStatus.branch.padEnd(35)} ║`)
    this.log(`║  Uncommitted Changes .............. ${String(gitStatus.uncommitted).padEnd(35)} ║`)
    this.log(`║  Unpushed Commits ................. ${String(gitStatus.unpushed).padEnd(35)} ║`)

    this.log('╚════════════════════════════════════════════════════════════════════════╝')
    this.log('')
    this.log('💡 Quick Commands:')
    this.log('  riddle agent:validate  - Validate all checks')
    this.log('  riddle agent:fix       - Auto-fix issues')
    this.log('  riddle agent:status    - Show git status')
    this.log('')
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  private detectAgents(): { installed: number; details: Record<string, boolean> } {
    const details: Record<string, boolean> = {}
=======
=======
>>>>>>> Stashed changes
  private detectAgents(): { installed: number, details: Record<string, boolean> } {
    const details: Record<string, boolean> = {};
>>>>>>> Stashed changes
    const commands = {
      'claude-code': 'claude',
      'codex': 'codex',
      'copilot': 'gh',
      'cursor-agent': '',
      'fastmcp': '',
      'gemini-cli': 'gemini',
      'kilocode': 'kilocode',
      'mistral-vibe': 'mistral',
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      opencode: 'opencode',
    }
=======
=======
>>>>>>> Stashed changes
      'opencode': 'opencode',
    };
>>>>>>> Stashed changes

    for (const [agent, cmd] of Object.entries(commands)) {
      if (agent === 'cursor-agent') {
        details[agent] = existsSync(join(process.cwd(), '.cursor'))
      } else if (agent === 'fastmcp') {
        details[agent] = this.checkCommand('fastmcp') || this.checkPythonModule('fastmcp')
      } else {
        details[agent] = this.checkCommand(cmd)
      }
    }

    const installed = Object.values(details).filter(Boolean).length
    return { details, installed }
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  private checkConfigs(): { configured: number; details: Record<string, boolean> } {
    const details: Record<string, boolean> = {}
    const home = homedir()

    details.opencode = existsSync(join(home, '.config/opencode/perplexity.json'))
    details.kilocode = existsSync(join(home, '.config/kilocode/perplexity.json'))
    details['claude-code'] = existsSync(join(home, '.config/claude'))
    details.copilot = this.checkCommand('gh auth status')
    details.fastmcp = existsSync(join(home, '.config/claude/fastmcp.json'))
    details['gemini-cli'] =
      existsSync(join(home, '.config/gemini-cli/mcp.json')) ||
      existsSync(join(home, '.config/gemini/mcp.json'))
    details['cursor-agent'] = existsSync(join(process.cwd(), '.cursor/mcp.json'))
    details.codex = false
    details['mistral-vibe'] = false
=======
=======
>>>>>>> Stashed changes
  private checkConfigs(): { configured: number, details: Record<string, boolean> } {
    const details: Record<string, boolean> = {};
    const home = homedir();

    details.opencode = existsSync(join(home, '.config/opencode/perplexity.json'));
    details.kilocode = existsSync(join(home, '.config/kilocode/perplexity.json'));
    details['claude-code'] = existsSync(join(home, '.config/claude'));
    details.copilot = this.checkCommand('gh auth status');
    details.fastmcp = existsSync(join(home, '.config/claude/fastmcp.json'));
    details['gemini-cli']
      = existsSync(join(home, '.config/gemini-cli/mcp.json'))
        || existsSync(join(home, '.config/gemini/mcp.json'));
    details['cursor-agent'] = existsSync(join(process.cwd(), '.cursor/mcp.json'));
    details.codex = false;
    details['mistral-vibe'] = false;
>>>>>>> Stashed changes

    const configured = Object.values(details).filter(Boolean).length
    return { configured, details }
  }

  private checkApiKeys(): Record<string, boolean> {
    const keys: Record<string, boolean> = {}
    const secretsFile = join(homedir(), '.config/riddle-rush/agent-secrets.env')

    const apiKeys = [
      'PERPLEXITY_API_KEY',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'GEMINI_API_KEY',
      'MISTRAL_API_KEY',
      'GH_TOKEN',
      'GITLAB_PERSONAL_ACCESS_TOKEN',
    ]

    for (const key of apiKeys) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      keys[key] =
        Boolean(process.env[key]) ||
        (existsSync(secretsFile) && this.fileContains(secretsFile, key))
=======
      keys[key]
        = Boolean(process.env[key])
          || (existsSync(secretsFile) && this.fileContains(secretsFile, key));
>>>>>>> Stashed changes
=======
      keys[key]
        = Boolean(process.env[key])
          || (existsSync(secretsFile) && this.fileContains(secretsFile, key));
>>>>>>> Stashed changes
    }

    return keys
  }

  private getGitStatus(): { branch: string, uncommitted: number, unpushed: number } {
    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()
      const uncommitted = execSync('git status --porcelain', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean).length
      const unpushed = execSync('git log @{u}.. --oneline 2>/dev/null || echo ""', {
        encoding: 'utf8',
      })
        .trim()
        .split('\n')
        .filter(Boolean).length

      return { branch, uncommitted, unpushed }
    } catch {
      return { branch: 'unknown', uncommitted: 0, unpushed: 0 }
    }
  }

  private checkCommand(cmd: string): boolean {
    try {
      execSync(`command -v ${cmd}`, { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }

  private checkPythonModule(module: string): boolean {
    try {
      execSync(`python3 -c "import ${module}"`, { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }

  private fileContains(file: string, text: string): boolean {
    try {
      const content = execSync(`cat ${file}`, { encoding: 'utf8' })
      return content.includes(text)
    } catch {
      return false
    }
  }
}
