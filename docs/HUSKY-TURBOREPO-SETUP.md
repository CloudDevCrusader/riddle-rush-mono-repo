# Husky & Turborepo Setup

This document describes the Husky git hooks and Turborepo task orchestration setup for the monorepo.

## Husky - Git Hooks

Husky is used to run scripts at different stages of the git workflow.

### Installation

Husky is automatically installed when you run `pnpm install` thanks to the `prepare` script.

To manually set up Husky:

```bash
pnpm prepare
```

### Git Hooks

#### Pre-Commit Hook (`.husky/pre-commit`)

Runs before each commit:

1. **Secret Scanning**: Checks for accidentally committed secrets
2. **Lint-Staged**: Runs ESLint and Prettier on staged files
   - Only processes files that are staged
   - Automatically fixes issues when possible
   - Prevents commit if unfixable errors exist

**What it does:**
- Scans for secrets using `scripts/check-secrets.sh`
- Runs `lint-staged` which:
  - Lints TypeScript/JavaScript/Vue files
  - Formats code with Prettier
  - Only processes staged files (fast!)

#### Pre-Push Hook (`.husky/pre-push`)

Runs before pushing to remote:

1. **Secret Scanning**: Double-check for secrets
2. **Type Checking**: Runs TypeScript type checking across all packages
3. **Unit Tests**: Runs unit tests
4. **Dependency Check**: Verifies dependency versions with syncpack

**What it does:**
- Ensures code quality before pushing
- Catches type errors early
- Verifies tests pass
- Checks dependency consistency

#### Commit Message Hook (`.husky/commit-msg`)

Validates commit messages:

- Checks minimum length (10 characters)
- Suggests conventional commit format
- Can be extended with commitlint for strict validation

### Lint-Staged Configuration

Located in `.lintstagedrc.json`:

```json
{
  "*.{ts,tsx,vue}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
```

**Features:**
- Only processes staged files
- Runs ESLint with auto-fix
- Formats with Prettier
- Fast execution (only changed files)

### Bypassing Hooks

**⚠️ Not Recommended** - Only use in emergencies:

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip pre-push hook
git push --no-verify
```

## Turborepo - Task Orchestration

Turborepo is a high-performance build system for JavaScript and TypeScript monorepos.

### Installation

Turborepo is installed as a dev dependency:

```bash
pnpm add -D -w turbo
```

### Configuration

Configuration is in `turbo.json`:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".nuxt/**", ".output/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Key Features

#### 1. Task Caching

Turborepo caches task outputs:
- **Build tasks**: Cached based on inputs
- **Test tasks**: Cached when inputs don't change
- **Lint tasks**: Fast execution with caching

#### 2. Task Dependencies

Tasks can depend on other tasks:
- `build` depends on `^build` (dependencies must build first)
- `test` depends on `^build` (tests need built code)

#### 3. Parallel Execution

Tasks run in parallel when possible:
- Multiple packages can build simultaneously
- Independent tasks don't block each other

#### 4. Filtering

Run tasks on specific packages:

```bash
# Run only on game app
turbo run build --filter=game

# Run on all packages
turbo run build

# Run on packages that depend on shared
turbo run build --filter=...shared
```

### Turborepo Scripts

#### Development

```bash
# Start dev server (game app)
pnpm dev

# Start all dev servers
pnpm dev:all

# Using turbo directly
pnpm turbo:dev
```

#### Building

```bash
# Build game app
pnpm build

# Build all packages
pnpm build:all

# Using turbo directly
pnpm turbo:build
```

#### Testing

```bash
# Run unit tests (all packages)
pnpm test:unit

# Run E2E tests (game app)
pnpm test:e2e

# Using turbo directly
pnpm turbo:test
```

#### Code Quality

```bash
# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Format all packages
pnpm format

# Using turbo directly
pnpm turbo:lint
pnpm turbo:typecheck
```

### Turborepo Cache

#### Local Cache

Turborepo caches task outputs in `.turbo/`:

- **Location**: `.turbo/` (gitignored)
- **Benefits**: Faster subsequent runs
- **Clearing**: `pnpm turbo:clean` or delete `.turbo/`

#### Cache Invalidation

Cache is automatically invalidated when:
- Source files change
- Dependencies change
- Configuration changes

#### Cache Visualization

View task graph:

```bash
# Generate task dependency graph
pnpm turbo:graph
```

### Pipeline Tasks

#### Build Tasks

- **build**: Builds packages/apps
- **generate**: Generates static sites
- **Outputs**: `.nuxt/**`, `.output/**`, `dist/**`

#### Development Tasks

- **dev**: Development servers
- **Cache**: Disabled (always runs)
- **Persistent**: True (runs continuously)

#### Test Tasks

- **test**: All tests
- **test:unit**: Unit tests only
- **test:e2e**: E2E tests only
- **Outputs**: `coverage/**`, `test-results/**`

#### Code Quality Tasks

- **lint**: ESLint checking
- **lint:fix**: ESLint with auto-fix
- **typecheck**: TypeScript type checking
- **format**: Prettier formatting
- **format:check**: Prettier check only

### Environment Variables

Tasks can access environment variables:

```json
{
  "build": {
    "env": ["NODE_ENV", "BASE_URL", "GOOGLE_ANALYTICS_ID"]
  }
}
```

### Remote Cache (Optional)

For team collaboration, enable remote cache:

```json
{
  "remoteCache": {
    "enabled": true
  }
}
```

Requires Turborepo account and configuration.

## Workflow Integration

### Development Workflow

1. **Make Changes**: Edit code
2. **Stage Files**: `git add .`
3. **Commit**: `git commit -m "feat: add feature"`
   - Pre-commit hook runs lint-staged
   - Only staged files are processed
4. **Push**: `git push`
   - Pre-push hook runs typecheck and tests
   - Ensures code quality before remote

### CI/CD Integration

Turborepo works great in CI/CD:

```yaml
# Example GitLab CI
test:
  script:
    - pnpm install
    - pnpm turbo:build
    - pnpm turbo:test
    - pnpm turbo:lint
```

**Benefits:**
- Parallel task execution
- Caching speeds up CI runs
- Consistent with local development

## Troubleshooting

### Husky Hooks Not Running

1. **Check installation**:
   ```bash
   pnpm prepare
   ```

2. **Verify hooks are executable**:
   ```bash
   ls -la .husky/
   chmod +x .husky/*
   ```

3. **Check git config**:
   ```bash
   git config core.hooksPath .husky
   ```

### Turborepo Cache Issues

1. **Clear cache**:
   ```bash
   rm -rf .turbo
   pnpm turbo:clean
   ```

2. **Force rebuild**:
   ```bash
   pnpm turbo:build --force
   ```

3. **Check task outputs**:
   ```bash
   # Verify outputs are correct in turbo.json
   cat turbo.json
   ```

### Lint-Staged Not Working

1. **Check configuration**:
   ```bash
   cat .lintstagedrc.json
   ```

2. **Test manually**:
   ```bash
   npx lint-staged --debug
   ```

3. **Verify file patterns**:
   - Ensure file extensions match
   - Check git staging: `git status`

## Best Practices

### Husky

1. **Keep hooks fast**: Pre-commit should complete in seconds
2. **Fail fast**: Exit early on errors
3. **Clear messages**: Provide helpful error messages
4. **Don't skip hooks**: Fix issues instead of bypassing

### Turborepo

1. **Define outputs**: Always specify task outputs
2. **Set dependencies**: Use `dependsOn` for task order
3. **Use filters**: Run tasks only where needed
4. **Monitor cache**: Check cache hit rates

### Lint-Staged

1. **Keep it fast**: Only process staged files
2. **Auto-fix**: Use `--fix` flags when possible
3. **Fail on errors**: Prevent bad code from committing

## Migration from pnpm scripts

### Before (pnpm)

```bash
pnpm --filter game build
pnpm -r lint
```

### After (Turborepo)

```bash
turbo run build --filter=game
turbo run lint
```

**Benefits:**
- Faster execution (caching)
- Better parallelization
- Task dependency management
- Consistent across team

## Additional Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Lint-Staged Documentation](https://github.com/okonet/lint-staged)
