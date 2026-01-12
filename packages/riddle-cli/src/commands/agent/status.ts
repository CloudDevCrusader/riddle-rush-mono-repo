import { Command } from '@oclif/core'
import { execSync } from 'node:child_process'

export default class AgentStatus extends Command {
  static override description = 'Show current git status and next recommended steps'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    this.log('')
    this.log('╔═══════════════════════════════════════════════════════════╗')
    this.log('║      📊 Agent Status - Repository Overview              ║')
    this.log('╚═══════════════════════════════════════════════════════════╝')
    this.log('')

    const branch = this.exec('git branch --show-current')
    this.log(`📍 Current Branch: ${branch}`)
    this.log('')

    this.log('📝 Git Status:')
    const statusOutput = this.exec('git status --short')
    if (statusOutput) {
      this.log(statusOutput)
    } else {
      this.log('  ✓ No uncommitted changes')
    }

    this.log('')

    const unpushed = this.exec('git log @{u}.. --oneline 2>/dev/null || echo ""')
      .split('\n')
      .filter(Boolean).length
    this.log(`📤 Unpushed Commits: ${unpushed}`)
    if (unpushed > 0) {
      this.log(this.exec('git log @{u}.. --oneline --color=always | head -5'))
    }

    this.log('')
    this.log('📜 Recent Commits:')
    this.log(this.exec('git log --oneline --color=always -3'))

    this.log('')
    this.log('╔═══════════════════════════════════════════════════════════╗')
    this.log('║ 💡 Recommended Next Steps                                ║')
    this.log('╚═══════════════════════════════════════════════════════════╝')
    this.log('')

    const hasChanges = Boolean(statusOutput)
    if (hasChanges) {
      this.log('  1. Review changes: git diff')
      this.log('  2. Run validation: riddle agent:validate')
      this.log('  3. Auto-fix issues: riddle agent:fix')
      this.log('  4. Stage changes: git add .')
      this.log('  5. Commit: git commit -m "feat: description"')
    } else if (unpushed > 0) {
      this.log('  1. Push commits: git push')
    } else {
      this.log('  ✓ Repository is clean and up to date!')
      this.log('  → Ready for new work')
    }

    this.log('')
  }

  private exec(cmd: string): string {
    try {
      return execSync(cmd, { encoding: 'utf8' }).trim()
    } catch {
      return ''
    }
  }
}
