import { Args, Command } from '@oclif/core';
import { execSync } from 'node:child_process';

export default class Deploy extends Command {
  static override description = 'Deploy the application';

  static override examples = [
    '<%= config.bin %> deploy prod',
    '<%= config.bin %> deploy dev',
    '<%= config.bin %> deploy aws',
    '<%= config.bin %> deploy vercel:prod',
    '<%= config.bin %> deploy vercel:preview',
  ];

  static override args = {
    target: Args.string({
      description:
        'Deployment target (prod | dev | aws | infrastructure | preview | vercel:prod | vercel:dev | vercel:preview)',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Deploy);

    const commands: Record<string, string> = {
      prod: './scripts/deploy-prod.sh',
      dev: './scripts/deploy-dev.sh',
      aws: './scripts/aws-deploy.sh',
      infrastructure: './scripts/deploy-infrastructure.sh',
      preview: './scripts/deploy-preview.sh',
      'vercel:prod': 'VERCEL=true STAGE=production vercel --prod --archive=tgz',
      'vercel:dev': 'VERCEL=true STAGE=development vercel --archive=tgz',
      'vercel:preview': 'VERCEL=true vercel --archive=tgz',
    };

    const cmd = commands[args.target];
    if (!cmd) {
      this.error(
        `Unknown deploy target: "${args.target}". Available: ${Object.keys(commands).join(', ')}`,
        { exit: 1 }
      );
    }

    this.log(`\n▶ Deploying to ${args.target}...\n`);
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
