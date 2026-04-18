import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class Check extends Command {
  static override description = 'Run quality checks (lint, typecheck, format)';

  static override examples = [
    '<%= config.bin %> check',
    '<%= config.bin %> check all',
    '<%= config.bin %> check fix',
    '<%= config.bin %> check typecheck',
    '<%= config.bin %> check lint',
    '<%= config.bin %> check format',
    '<%= config.bin %> check knip',
  ];

  static override args = {
    target: Args.string({
      description:
        'Which check to run (all | fix | typecheck | lint | format | syncpack | knip | trunk)',
      default: 'all',
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Check);

    const commands: Record<string, string> = {
      all: 'pnpm syncpack:check && pnpm typecheck && pnpm lint',
      fix: 'pnpm syncpack:fix && pnpm lint:fix && pnpm format',
      typecheck: 'turbo run typecheck',
      lint: 'turbo run lint',
      'lint:fix': 'turbo run lint:fix',
      format: 'turbo run format',
      'format:check': 'turbo run format:check',
      syncpack: 'syncpack lint',
      'syncpack:fix': 'syncpack fix',
      knip: 'knip --reporter compact',
      trunk: 'trunk check --all',
      'trunk:fmt': 'trunk fmt --all',
    };

    const cmd = commands[args.target];
    if (!cmd) {
      this.error(
        `Unknown check: "${args.target}". Available: ${Object.keys(commands).join(', ')}`,
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
