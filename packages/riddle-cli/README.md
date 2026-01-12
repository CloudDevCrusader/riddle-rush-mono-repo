# Riddle CLI

Riddle Rush CLI - Agent workflow and project management tool built with oclif.

## Usage

```bash
# Install dependencies
pnpm install

# Build the CLI
pnpm run build

# Run locally
./bin/run.js --help

# Or use via package manager
pnpm run riddle --help
```

## Commands

### `riddle stats`

Display agent statistics and configuration overview

```bash
riddle stats
```

### `riddle agent:validate`

Run validation checks before committing

```bash
riddle agent:validate
```

### `riddle agent:fix`

Automatically fix common issues

```bash
riddle agent:fix
```

### `riddle agent:status`

Show current git status and recommended next steps

```bash
riddle agent:status
```

## Installation

Install globally:

```bash
pnpm install -g .
```

Then use anywhere:

```bash
riddle stats
riddle agent:validate
```

## Development

```bash
# Build
pnpm run build

# Test
pnpm run test

# Lint
pnpm run lint
```

## What's Included

- **Agent Stats**: Overview of installed agents, configurations, and API keys
- **Validation**: Pre-commit checks (TypeScript, ESLint, Syncpack)
- **Auto-fix**: Automatic fixing of common issues
- **Status**: Git status and workflow recommendations

## License

MIT
