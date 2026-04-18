import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class Maintain extends Command {
  static override description = 'Dependency and project maintenance';

  static override examples = ['<%= config.bin %> maintain', '<%= config.bin %> maintain clean'];

  static override args = {
    action: Args.string({
      description: 'Action (default | clean)',
      default: 'default',
      options: ['default', 'clean'],
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Maintain);

    if (args.action === 'clean') {
      this.log('\n▶ Cleaning all build artifacts and node_modules...\n');
      execSync('pnpm -r clean && rm -rf node_modules', {
        stdio: 'inherit',
        cwd: this.findMonorepoRoot(),
      });
    } else {
      this.log('\n▶ Updating dependencies and fixing versions...\n');
      execSync('pnpm update && pnpm run syncpack:fix && pnpm run workspace:check', {
        stdio: 'inherit',
        cwd: this.findMonorepoRoot(),
      });
    }
  }

  private findMonorepoRoot(): string {
    try {
      return execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
    } catch {
      return process.cwd();
    }
  }
}
