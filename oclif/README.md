# Riddle Rush CLI (oclif)

Command-line interface for managing the Riddle Rush project.

## Folder Structure

```
oclif/
├── bin/              # Executable entry points
├── dist/             # Compiled JavaScript output (generated)
├── src/              # TypeScript source code
│   ├── commands/     # CLI commands (each file = one command)
│   ├── hooks/        # Lifecycle hooks (init, prerun, postrun, etc.)
│   └── utils/        # Shared utility functions
└── test/             # Test files
```

## Directory Descriptions

### `bin/`

Contains the executable scripts that serve as entry points for the CLI. Typically includes:

- `run` - Development executable (runs TypeScript directly)
- `run.cmd` - Windows development executable

### `dist/`

Auto-generated directory containing compiled JavaScript from TypeScript source. Created during build process.

### `src/`

Main source code directory:

#### `src/commands/`

Each file represents a CLI command. Files can be nested for command namespaces.

- Example: `src/commands/deploy.ts` → `riddle-rush deploy`
- Example: `src/commands/test/e2e.ts` → `riddle-rush test:e2e`

#### `src/hooks/`

Lifecycle hooks that run at specific points in command execution:

- `init` - Runs before command initialization
- `prerun` - Runs before command execution
- `postrun` - Runs after command execution
- `command_not_found` - Runs when command doesn't exist

#### `src/utils/`

Shared utility functions and helpers used across commands.

### `test/`

Test files for CLI commands and utilities. Typically uses Mocha or Jest.

## Getting Started

```bash
# Initialize oclif project
npm init oclif

# Or manually install dependencies
npm install @oclif/core

# Run in development
./bin/run <command>

# Build for production
npm run build

# Test the CLI
npm test
```

## Next Steps

1. Initialize package.json with oclif configuration
2. Create base command class in `src/commands/`
3. Set up TypeScript configuration
4. Add executable scripts in `bin/`
5. Configure testing framework

## Resources

- [oclif Documentation](https://oclif.io/)
- [oclif GitHub](https://github.com/oclif/oclif)
