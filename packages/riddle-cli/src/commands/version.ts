import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class Version extends Command {
  static override description = 'Version management and changesets';

  static override examples = [
    '<%= config.bin %> version check',
    '<%= config.bin %> version bump',
    '<%= config.bin %> version sync',
    '<%= config.bin %> version changeset',
    '<%= config.bin %> version publish',
  ];

  static override args = {
    action: Args.string({
      description: 'Action (check | bump | sync | changeset | publish)',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Version);

    const commands: Record<string, string> = {
      check: 'node scripts/sync-version.mjs --check',
      bump: 'node scripts/sync-version.mjs --bump',
      sync: 'node scripts/sync-version.mjs',
      changeset: 'changeset',
      publish: 'changeset publish',
    };

    const cmd = commands[args.action];
    if (!cmd) {
      this.error(
        `Unknown version action: "${args.action}". Available: ${Object.keys(commands).join(', ')}`,
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
