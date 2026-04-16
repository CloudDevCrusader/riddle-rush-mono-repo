import { Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class AgentFix extends Command {
  static override description = 'Automatically fix common issues';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  public async run(): Promise<void> {
    this.log('');
    this.log('╔════════════════════════════════════════════════════════════╗');
    this.log('║       🔧 Agent Auto-Fix - Fixing Common Issues           ║');
    this.log('╚════════════════════════════════════════════════════════════╝');
    this.log('');

    const fixes = [
      { name: 'Fixing dependency mismatches', cmd: 'pnpm run syncpack:fix' },
      { name: 'Auto-fixing linting issues', cmd: 'pnpm run lint:fix' },
      { name: 'Formatting code', cmd: 'pnpm run format' },
    ];

    for (const [index, fix] of fixes.entries()) {
      this.log(`[${index + 1}/${fixes.length}] ${fix.name}...`);
      try {
        execSync(fix.cmd, { stdio: 'inherit' });
        this.log(`✓ ${fix.name} complete\n`);
      } catch {
        this.log(`✗ ${fix.name} failed (continuing...)\n`);
      }
    }

    this.log('╔════════════════════════════════════════════════════════════╗');
    this.log('║ ✅ Auto-fix complete!                                     ║');
    this.log('╚════════════════════════════════════════════════════════════╝');
    this.log('');
    this.log('Recommended next steps:');
    this.log('  1. riddle agent:validate  # Verify all checks pass');
    this.log('  2. git add .              # Stage changes');
    this.log('  3. git commit -m "..."    # Commit with message');
  }
}
