import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class Test extends Command {
  static override description = 'Run tests';

  static override examples = [
    '<%= config.bin %> test',
    '<%= config.bin %> test unit',
    '<%= config.bin %> test e2e',
    '<%= config.bin %> test e2e:ui',
    '<%= config.bin %> test e2e:docker',
    '<%= config.bin %> test appium:android',
  ];

  static override args = {
    target: Args.string({
      description:
        'Which tests to run (unit | e2e | e2e:ui | e2e:docker | appium:android | appium:ios)',
      default: 'unit',
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Test);

    const commands: Record<string, string> = {
      unit: 'turbo run test:unit',
      e2e: 'turbo run test:e2e --filter=@riddle-rush/game',
      'e2e:ui': 'turbo run test:e2e --filter=@riddle-rush/game --ui web',
      'e2e:docker': './scripts/e2e-docker.sh',
      'appium:android': 'pnpm --filter @riddle-rush/mobile test:e2e:appium:android',
      'appium:ios': 'pnpm --filter @riddle-rush/mobile test:e2e:appium:ios',
    };

    const cmd = commands[args.target];
    if (!cmd) {
      this.error(
        `Unknown test target: "${args.target}". Available: ${Object.keys(commands).join(', ')}`,
        {
          exit: 1,
        }
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
