# Dev Container for Riddle Rush Nuxt PWA

This directory contains the configuration for developing Riddle Rush Nuxt PWA using VS Code Remote-Containers or GitHub Codespaces.

## Features

- Node.js 20.x
- pnpm package manager
- Turbo monorepo support
- Pre-configured VS Code extensions
- Port forwarding for development server (3000), Vite (24678), and mobile development (8100, 8080)
- Java 17 for Android development
- Capacitor CLI for mobile app development

## Requirements

- VS Code with Remote-Containers extension
- Docker
- OR GitHub Codespaces

## Getting Started

1. Open this project in VS Code
2. Click on the green "Remote Window" icon in the bottom-left corner
3. Select "Reopen in Container" or "Open Folder in Container"
4. The container will build and install dependencies automatically

## Development Commands

Once the container is running, you can use these commands:

- `pnpm install` - Install dependencies
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run test:unit` - Run unit tests
- `pnpm run test:e2e` - Run end-to-end tests

### Mobile Development

- `pnpm run android:sync` - Sync web assets to Android project
- `pnpm run android:open` - Open Android project in Android Studio
- `pnpm run capacitor:sync` - Sync web assets to all Capacitor platforms

## Extensions

The following VS Code extensions are automatically installed:

- Prettier - Code formatter
- ESLint - JavaScript/TypeScript linter
- Volar - Vue 3 support
- Vetur - Vue tooling
- MDX - Markdown/JSX support

## Customization

You can customize the container by editing:

- `.devcontainer/devcontainer.json` - Main configuration
- `.devcontainer/Dockerfile` - Container image definition

## Environment Variables

The project uses environment variables for configuration. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key variables:

- `NODE_ENV=development` - Development mode
- `BASE_URL=/` - Base URL for the app
- `GOOGLE_ANALYTICS_ID=` - Optional Google Analytics ID
- `API_SECRET=` - Server-side API secret

## Troubleshooting

If you encounter issues:

1. Ensure Docker is running
2. Check that you have enough disk space
3. Try rebuilding the container
4. Check the VS Code output for error messages
