import { Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class AgentValidate extends Command {
  static override description = 'Run validation checks before committing';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  public async run(): Promise<void> {
    this.log('');
    this.log('╔════════════════════════════════════════════════════════════╗');
    this.log('║     🔍 Agent Validation - Pre-Commit Checks              ║');
    this.log('╚════════════════════════════════════════════════════════════╝');
    this.log('');

    const checks = [
      { name: 'Syncpack (dependency sync)', cmd: 'pnpm run syncpack:check' },
      { name: 'TypeScript (type checking)', cmd: 'pnpm run typecheck' },
      { name: 'ESLint (code quality)', cmd: 'pnpm run lint' },
    ];

    let failed = 0;

    for (const check of checks) {
      this.log(`Running: ${check.name}`);
      try {
        execSync(check.cmd, { stdio: 'inherit' });
        this.log(`✓ ${check.name} passed\n`);
      } catch {
        this.log(`✗ ${check.name} failed\n`);
        failed++;
      }
    }

    this.log('╔════════════════════════════════════════════════════════════╗');
    if (failed === 0) {
      this.log('║ ✅ All checks passed! Ready to commit.                   ║');
      this.log('╚════════════════════════════════════════════════════════════╝');
      this.log('');
      this.log('Next steps:');
      this.log('  1. git add .');
      this.log('  2. git commit -m "feat: your message"');
      this.log('  3. git push');
    } else {
      this.log('║ ❌ Some checks failed. Please fix issues.                ║');
      this.log('╚════════════════════════════════════════════════════════════╝');
      this.log('');
      this.log('Quick fixes:');
      this.log('  • riddle agent:fix  - Auto-fix all issues');
      this.error('Validation failed', { exit: 1 });
    }
  }
}
