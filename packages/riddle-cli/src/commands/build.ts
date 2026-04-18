import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class Build extends Command {
  static override description = 'Build the project';

  static override examples = [
    '<%= config.bin %> build',
    '<%= config.bin %> build game',
    '<%= config.bin %> build all',
    '<%= config.bin %> build generate',
  ];

  static override args = {
    target: Args.string({
      description: 'What to build (game | all | generate)',
      default: 'game',
      options: ['game', 'all', 'generate'],
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Build);

    const commands: Record<string, string> = {
      game: 'turbo run build --filter=@riddle-rush/game',
      all: 'turbo run build',
      generate: 'turbo run generate --filter=@riddle-rush/game',
    };

    const cmd = commands[args.target];
    this.log(`\n▶ Running: ${cmd}\n`);

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
