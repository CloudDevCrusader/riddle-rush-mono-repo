import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class Infra extends Command {
  static override description = 'Manage Terraform infrastructure';

  static override examples = [
    '<%= config.bin %> infra plan prod',
    '<%= config.bin %> infra apply prod',
    '<%= config.bin %> infra init dev',
    '<%= config.bin %> infra validate prod',
    '<%= config.bin %> infra fmt',
  ];

  static override args = {
    action: Args.string({
      description: 'Terraform action (plan | apply | init | validate | fmt | fmt:check | setup)',
      required: true,
    }),
    env: Args.string({
      description: 'Environment (prod | dev | translation)',
      default: 'prod',
      options: ['prod', 'dev', 'translation'],
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Infra);

    const baseDir = 'infrastructure/environments';

    const commands: Record<string, string> = {
      plan: `cd ${baseDir}/${args.env} && terraform plan`,
      apply: `cd ${baseDir}/${args.env} && terraform apply`,
      init: `cd ${baseDir}/${args.env} && terraform init`,
      validate: `cd ${baseDir}/${args.env} && terraform validate`,
      fmt: 'terraform fmt -recursive infrastructure/',
      'fmt:check': 'terraform fmt -recursive -check infrastructure/',
      setup: 'cd infrastructure && ./scripts/setup-tfenv.sh',
    };

    const cmd = commands[args.action];
    if (!cmd) {
      this.error(
        `Unknown infra action: "${args.action}". Available: ${Object.keys(commands).join(', ')}`,
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
