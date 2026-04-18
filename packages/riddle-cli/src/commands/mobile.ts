import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class Mobile extends Command {
  static override description = 'Mobile (Android/iOS) build and run commands';

  static override examples = [
    '<%= config.bin %> mobile sync android',
    '<%= config.bin %> mobile run android',
    '<%= config.bin %> mobile build android',
    '<%= config.bin %> mobile build android release',
    '<%= config.bin %> mobile sync ios',
    '<%= config.bin %> mobile build ios release',
  ];

  static override args = {
    action: Args.string({
      description: 'Action (sync | run | build | open)',
      required: true,
    }),
    platform: Args.string({
      description: 'Platform (android | ios)',
      required: true,
      options: ['android', 'ios'],
    }),
  };

  static override strict = false;

  public async run(): Promise<void> {
    const { args, argv } = await this.parse(Mobile);
    const extra = argv.join(' ');

    const commands: Record<string, Record<string, string>> = {
      sync: {
        android: 'cd apps/game && pnpm generate && cd ../mobile && pnpm android:sync',
        ios: 'cd apps/game && pnpm generate && cd ../mobile && pnpm ios:sync',
      },
      run: {
        android: './scripts/mobile-run.sh android',
        ios: './scripts/mobile-run.sh ios',
      },
      build: {
        android: `./scripts/mobile-build.sh android${extra ? ` ${extra}` : ''}`,
        ios: `./scripts/mobile-build.sh ios${extra ? ` ${extra}` : ''}`,
      },
      open: {
        android: 'cd apps/mobile && pnpm android:open',
        ios: 'cd apps/mobile && pnpm ios:open',
      },
    };

    const platformCmds = commands[args.action];
    if (!platformCmds) {
      this.error(
        `Unknown action: "${args.action}". Available: ${Object.keys(commands).join(', ')}`,
        { exit: 1 }
      );
    }

    const cmd = platformCmds[args.platform];
    if (!cmd) {
      this.error(
        `Unknown platform: "${args.platform}". Available: ${Object.keys(platformCmds).join(', ')}`,
        { exit: 1 }
      );
    }

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
