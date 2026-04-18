import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class Dev extends Command {
  static override description = 'Start development servers';

  static override examples = [
    '<%= config.bin %> dev',
    '<%= config.bin %> dev game',
    '<%= config.bin %> dev all',
  ];

  static override args = {
    target: Args.string({
      description: 'Which app to start (game | all)',
      default: 'game',
      options: ['game', 'all'],
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Dev);

    const cmd =
      args.target === 'all' ? 'turbo run dev' : 'turbo run dev --filter=@riddle-rush/game';

    this.log(`\n▶ Starting ${args.target === 'all' ? 'all' : 'game'} dev server...\n`);

    execSync(cmd, { stdio: 'inherit', cwd: this.findMonorepoRoot() });
  }

  private findMonorepoRoot(): string {
    try {
      return execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
    } catch {
      return process.cwd();
    }
  }
}
