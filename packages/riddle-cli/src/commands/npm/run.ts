import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class NpmRun extends Command {
  static override description = 'Run any npm script from the monorepo root package.json';

  static override examples = [
    '<%= config.bin %> npm:run dev',
    '<%= config.bin %> npm:run workspace:check',
    '<%= config.bin %> npm:run test:e2e',
    '<%= config.bin %> npm:run deploy:prod',
  ];

  static override strict = false;

  static override args = {
    script: Args.string({
      description: 'npm script name (use "npm:list" to see all available)',
      required: true,
    }),
  };

  static override flags = {};

  public async run(): Promise<void> {
    const { argv } = await this.parse(NpmRun);
    const script = argv[0];
    const args = argv.slice(1).join(' ');

    this.log(`\n▶ Running: pnpm run ${script}${args ? ` ${args}` : ''}\n`);

    try {
      execSync(`pnpm run ${script} ${args}`, { stdio: 'inherit', cwd: this.findMonorepoRoot() });
    } catch {
      this.error(
        `Script "${script}" failed or not found. Run "riddle npm:list" to see available scripts.`,
        {
          exit: 1,
        }
      );
    }
  }

  private findMonorepoRoot(): string {
    try {
      const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
      return root;
    } catch {
      return process.cwd();
    }
  }
}
