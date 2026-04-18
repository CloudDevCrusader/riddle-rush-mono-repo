import { Command } from '@oclif/core';

interface ScriptEntry {
  name: string;
  command: string;
  group: string;
}

interface ScriptGroup {
  name: string;
  description: string;
  scripts: ScriptEntry[];
}

const SCRIPT_GROUPS: ScriptGroup[] = [
  {
    name: 'Development',
    description: 'Start dev servers',
    scripts: [
      { name: 'dev', command: 'turbo run dev --filter=@riddle-rush/game', group: 'Development' },
      { name: 'dev:all', command: 'turbo run dev', group: 'Development' },
    ],
  },
  {
    name: 'Build',
    description: 'Build and generate',
    scripts: [
      { name: 'build', command: 'turbo run build --filter=@riddle-rush/game', group: 'Build' },
      { name: 'build:all', command: 'turbo run build', group: 'Build' },
      {
        name: 'generate',
        command: 'turbo run generate --filter=@riddle-rush/game',
        group: 'Build',
      },
    ],
  },
  {
    name: 'Testing',
    description: 'Unit and E2E tests',
    scripts: [
      { name: 'test', command: 'turbo run test --filter=@riddle-rush/game', group: 'Testing' },
      { name: 'test:unit', command: 'turbo run test:unit', group: 'Testing' },
      {
        name: 'test:e2e',
        command: 'turbo run test:e2e --filter=@riddle-rush/game',
        group: 'Testing',
      },
      {
        name: 'test:e2e:ui',
        command: 'turbo run test:e2e --filter=@riddle-rush/game --ui web',
        group: 'Testing',
      },
      { name: 'test:e2e:docker', command: './scripts/e2e-docker.sh', group: 'Testing' },
      {
        name: 'test:e2e:appium:android',
        command: 'pnpm --filter @riddle-rush/mobile test:e2e:appium:android',
        group: 'Testing',
      },
      {
        name: 'test:e2e:appium:android:full',
        command: 'pnpm android:build:universal && pnpm test:e2e:appium:android',
        group: 'Testing',
      },
      {
        name: 'test:e2e:appium:ios',
        command: 'pnpm --filter @riddle-rush/mobile test:e2e:appium:ios',
        group: 'Testing',
      },
    ],
  },
  {
    name: 'Quality',
    description: 'Linting, formatting, type checking',
    scripts: [
      {
        name: 'workspace:check',
        command: 'pnpm syncpack:check && pnpm typecheck && pnpm lint',
        group: 'Quality',
      },
      {
        name: 'workspace:fix',
        command: 'pnpm syncpack:fix && pnpm lint:fix && pnpm format',
        group: 'Quality',
      },
      { name: 'typecheck', command: 'turbo run typecheck', group: 'Quality' },
      { name: 'lint', command: 'turbo run lint', group: 'Quality' },
      { name: 'lint:fix', command: 'turbo run lint:fix', group: 'Quality' },
      { name: 'format', command: 'turbo run format', group: 'Quality' },
      { name: 'format:check', command: 'turbo run format:check', group: 'Quality' },
      { name: 'syncpack:check', command: 'syncpack lint', group: 'Quality' },
      { name: 'syncpack:fix', command: 'syncpack fix', group: 'Quality' },
      { name: 'syncpack:format', command: 'syncpack format', group: 'Quality' },
      { name: 'knip', command: 'knip --reporter compact', group: 'Quality' },
      { name: 'trunk:check', command: 'trunk check --all', group: 'Quality' },
      { name: 'trunk:fmt', command: 'trunk fmt --all', group: 'Quality' },
      { name: 'trunk:eslint', command: 'bash scripts/trunk-eslint.sh', group: 'Quality' },
      { name: 'trunk:prettier', command: 'bash scripts/trunk-prettier.sh', group: 'Quality' },
    ],
  },
  {
    name: 'Agent',
    description: 'AI agent workflow commands',
    scripts: [
      { name: 'agent', command: 'node scripts/agent-cli.js', group: 'Agent' },
      { name: 'agent:check', command: 'pnpm run workspace:check', group: 'Agent' },
      {
        name: 'agent:commit',
        command: "pnpm run agent:validate && git add . && echo 'Ready to commit!'",
        group: 'Agent',
      },
      { name: 'agent:fix', command: 'bash scripts/agent-autofix.sh', group: 'Agent' },
      { name: 'agent:help', command: 'bash scripts/agent-commands.sh', group: 'Agent' },
      { name: 'agent:status', command: 'bash scripts/agent-status.sh', group: 'Agent' },
      { name: 'agent:validate', command: 'bash scripts/agent-validate.sh', group: 'Agent' },
    ],
  },
  {
    name: 'Deploy',
    description: 'Deployment to various targets',
    scripts: [
      { name: 'deploy:prod', command: './scripts/deploy-prod.sh', group: 'Deploy' },
      { name: 'deploy:dev', command: './scripts/deploy-dev.sh', group: 'Deploy' },
      { name: 'deploy:aws', command: './scripts/aws-deploy.sh', group: 'Deploy' },
      {
        name: 'deploy:infrastructure',
        command: './scripts/deploy-infrastructure.sh',
        group: 'Deploy',
      },
      { name: 'deploy:preview', command: './scripts/deploy-preview.sh', group: 'Deploy' },
      {
        name: 'deploy:vercel:dev',
        command: 'VERCEL=true STAGE=development vercel --archive=tgz',
        group: 'Deploy',
      },
      {
        name: 'deploy:vercel:preview',
        command: 'VERCEL=true vercel --archive=tgz',
        group: 'Deploy',
      },
      {
        name: 'deploy:vercel:prod',
        command: 'VERCEL=true STAGE=production vercel --prod --archive=tgz',
        group: 'Deploy',
      },
    ],
  },
  {
    name: 'Infrastructure',
    description: 'Terraform infrastructure management',
    scripts: [
      {
        name: 'infra:prod:init',
        command: 'cd infrastructure/environments/production && terraform init',
        group: 'Infrastructure',
      },
      {
        name: 'infra:prod:plan',
        command: 'cd infrastructure/environments/production && terraform plan',
        group: 'Infrastructure',
      },
      {
        name: 'infra:prod:apply',
        command: 'cd infrastructure/environments/production && terraform apply',
        group: 'Infrastructure',
      },
      {
        name: 'infra:dev:init',
        command: 'cd infrastructure/environments/development && terraform init',
        group: 'Infrastructure',
      },
      {
        name: 'infra:dev:plan',
        command: 'cd infrastructure/environments/development && terraform plan',
        group: 'Infrastructure',
      },
      {
        name: 'infra:dev:apply',
        command: 'cd infrastructure/environments/development && terraform apply',
        group: 'Infrastructure',
      },
      {
        name: 'infra:translation:init',
        command: 'cd infrastructure/environments/translation && terraform init',
        group: 'Infrastructure',
      },
      {
        name: 'infra:translation:plan',
        command: 'cd infrastructure/environments/translation && terraform plan',
        group: 'Infrastructure',
      },
      {
        name: 'infra:translation:apply',
        command: 'cd infrastructure/environments/translation && terraform apply',
        group: 'Infrastructure',
      },
      {
        name: 'infra:fmt',
        command: 'terraform fmt -recursive infrastructure/',
        group: 'Infrastructure',
      },
      {
        name: 'infra:fmt:check',
        command: 'terraform fmt -recursive -check infrastructure/',
        group: 'Infrastructure',
      },
      {
        name: 'infra:setup',
        command: 'cd infrastructure && ./scripts/setup-tfenv.sh',
        group: 'Infrastructure',
      },
      {
        name: 'infra:validate:prod',
        command: 'cd infrastructure/environments/production && terraform validate',
        group: 'Infrastructure',
      },
      {
        name: 'infra:validate:dev',
        command: 'cd infrastructure/environments/development && terraform validate',
        group: 'Infrastructure',
      },
      {
        name: 'infra:validate:translation',
        command: 'cd infrastructure/environments/translation && terraform validate',
        group: 'Infrastructure',
      },
      { name: 'terraform:plan', command: './scripts/terraform-plan.sh', group: 'Infrastructure' },
      { name: 'terraform:apply', command: './scripts/terraform-apply.sh', group: 'Infrastructure' },
      {
        name: 'terraform:outputs',
        command: './scripts/get-terraform-outputs.sh',
        group: 'Infrastructure',
      },
      {
        name: 'terraform:sync',
        command: './scripts/sync-terraform-outputs.sh',
        group: 'Infrastructure',
      },
    ],
  },
  {
    name: 'Mobile',
    description: 'Android and iOS build/run commands',
    scripts: [
      {
        name: 'android:sync',
        command: 'cd apps/game && pnpm generate && cd ../mobile && pnpm android:sync',
        group: 'Mobile',
      },
      { name: 'android:run', command: './scripts/mobile-run.sh android', group: 'Mobile' },
      { name: 'android:build', command: './scripts/mobile-build.sh android', group: 'Mobile' },
      {
        name: 'android:build:release',
        command: './scripts/mobile-build.sh android release',
        group: 'Mobile',
      },
      {
        name: 'android:build:release:universal',
        command: './scripts/mobile-build.sh android release --aab --universal',
        group: 'Mobile',
      },
      {
        name: 'android:build:universal',
        command: './scripts/mobile-build.sh android debug --universal',
        group: 'Mobile',
      },
      { name: 'android:open', command: 'cd apps/mobile && pnpm android:open', group: 'Mobile' },
      {
        name: 'ios:sync',
        command: 'cd apps/game && pnpm generate && cd ../mobile && pnpm ios:sync',
        group: 'Mobile',
      },
      { name: 'ios:run', command: './scripts/mobile-run.sh ios', group: 'Mobile' },
      { name: 'ios:build', command: './scripts/mobile-build.sh ios', group: 'Mobile' },
      {
        name: 'ios:build:release',
        command: './scripts/mobile-build.sh ios release',
        group: 'Mobile',
      },
      { name: 'ios:open', command: 'cd apps/mobile && pnpm ios:open', group: 'Mobile' },
    ],
  },
  {
    name: 'i18n',
    description: 'Translation management (Tolgee)',
    scripts: [
      { name: 'i18n:start', command: 'pnpm --filter @riddle-rush/tolgee start', group: 'i18n' },
      { name: 'i18n:stop', command: 'pnpm --filter @riddle-rush/tolgee stop', group: 'i18n' },
      { name: 'i18n:push', command: 'pnpm --filter @riddle-rush/tolgee push', group: 'i18n' },
      { name: 'i18n:pull', command: 'pnpm --filter @riddle-rush/tolgee pull', group: 'i18n' },
    ],
  },
  {
    name: 'Versioning',
    description: 'Version management and changesets',
    scripts: [
      { name: 'changeset', command: 'changeset', group: 'Versioning' },
      { name: 'changeset:version', command: 'changeset version', group: 'Versioning' },
      { name: 'changeset:publish', command: 'changeset publish', group: 'Versioning' },
      {
        name: 'version:check',
        command: 'node scripts/sync-version.mjs --check',
        group: 'Versioning',
      },
      {
        name: 'version:bump',
        command: 'node scripts/sync-version.mjs --bump',
        group: 'Versioning',
      },
      { name: 'version:set', command: 'node scripts/sync-version.mjs --set', group: 'Versioning' },
      { name: 'version:sync', command: 'node scripts/sync-version.mjs', group: 'Versioning' },
    ],
  },
  {
    name: 'Maintenance',
    description: 'Dependency and project maintenance',
    scripts: [
      {
        name: 'maintain',
        command: 'pnpm update && pnpm run syncpack:fix && pnpm run workspace:check',
        group: 'Maintenance',
      },
      { name: 'clean', command: 'pnpm -r clean && rm -rf node_modules', group: 'Maintenance' },
      { name: 'prepare', command: 'husky', group: 'Maintenance' },
    ],
  },
  {
    name: 'Python',
    description: 'Python tooling checks',
    scripts: [
      { name: 'python:check', command: 'pnpm run python:lint', group: 'Python' },
      { name: 'python:lint', command: 'bash scripts/python-lint.sh', group: 'Python' },
      { name: 'python:format', command: 'bash scripts/python-format.sh', group: 'Python' },
    ],
  },
  {
    name: 'Validation',
    description: 'Validation and verification scripts',
    scripts: [
      {
        name: 'validate:locales',
        command: 'node scripts/validate-locales.mjs',
        group: 'Validation',
      },
      {
        name: 'validate:dependabot',
        command: 'node --test scripts/validate-dependabot.mjs',
        group: 'Validation',
      },
    ],
  },
  {
    name: 'Vercel',
    description: 'Vercel deployment and env management',
    scripts: [
      { name: 'vercel:link', command: 'vercel link', group: 'Vercel' },
      { name: 'vercel:env:pull', command: 'vercel env pull .env.local', group: 'Vercel' },
    ],
  },
];

export default class NpmList extends Command {
  static override description = 'List all available npm scripts organized by category';

  static override examples = ['<%= config.bin %> npm:list', '<%= config.bin %> npm:list --json'];

  static override flags = {};

  public async run(): Promise<void> {
    await this.parse(NpmList);

    this.log('');
    this.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    this.log('║             📦 RIDDLE RUSH - NPM SCRIPTS REFERENCE                       ║');
    this.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    this.log('');

    let totalScripts = 0;

    for (const group of SCRIPT_GROUPS) {
      this.log(`▸ ${group.name}`);
      this.log(`  ${group.description}`);
      this.log('');

      for (const script of group.scripts) {
        this.log(`  ${script.name.padEnd(40)} ${script.command}`);
        totalScripts++;
      }

      this.log('');
    }

    this.log('═════════════════════════════════════════════════════════════════════════════════');
    this.log(`  Total: ${totalScripts} scripts across ${SCRIPT_GROUPS.length} categories`);
    this.log('');
    this.log('  Usage: riddle npm:run <script-name>');
    this.log('═════════════════════════════════════════════════════════════════════════════════');
    this.log('');
  }
}
