import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class I18n extends Command {
  static override description = 'Manage translations (Tolgee)';

  static override examples = [
    '<%= config.bin %> i18n start',
    '<%= config.bin %> i18n stop',
    '<%= config.bin %> i18n push',
    '<%= config.bin %> i18n pull',
  ];

  static override args = {
    action: Args.string({
      description: 'Action (start | stop | push | pull)',
      required: true,
      options: ['start', 'stop', 'push', 'pull'],
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(I18n);

    const commands: Record<string, string> = {
      start: 'pnpm --filter @riddle-rush/tolgee start',
      stop: 'pnpm --filter @riddle-rush/tolgee stop',
      push: 'pnpm --filter @riddle-rush/tolgee push',
      pull: 'pnpm --filter @riddle-rush/tolgee pull',
    };

    const cmd = commands[args.action];
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
