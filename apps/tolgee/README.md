# Tolgee - Translation Management UI

Self-hosted translation management for Riddle Rush i18n files.

## Production Instance

The live, hosted instance is available at: **https://translation.riddlerush.de**

The infrastructure for this instance is managed by Terraform at `infrastructure/environments/translation/`.

---

## Local Development Quick Start

For local testing or development on the Tolgee setup itself:

```bash
# Start Tolgee (from monorepo root)
pnpm --filter @riddle-rush/tolgee start

# Or from this directory
pnpm start
```

Open http://localhost:8085 and login with `admin` / `admin`.

## Initial Setup

After first start, you need to:

1. **Create a project** in the Tolgee UI (e.g., "Riddle Rush")
2. **Add languages**: `en` (English) and `de` (German/Deutsch)
3. **Create a Project API Key** (project settings → API Keys)
4. **Set the API key and project ID**:

   ```bash
   # Option 1: Environment variables
   export TOLGEE_API_KEY=your-api-key
   export TOLGEE_PROJECT_ID=1

   # Option 2: Add to .tolgeerc (projectId only, keep API key in env)
   ```

5. **Push your existing translations**:
   ```bash
   pnpm --filter @riddle-rush/tolgee push
   ```

## Commands

| Command      | Description                                     |
| ------------ | ----------------------------------------------- |
| `pnpm start` | Start Tolgee server at http://localhost:8085    |
| `pnpm stop`  | Stop Tolgee server                              |
| `pnpm logs`  | View server logs                                |
| `pnpm push`  | Upload local JSON files → Tolgee                |
| `pnpm pull`  | Download Tolgee translations → local JSON files |
| `pnpm sync`  | Push then pull (full sync)                      |

## How It Works

```
apps/game/translations/locales/
├── en.json  ←→  Tolgee UI  (push/pull sync)
└── de.json  ←→  Tolgee UI  (push/pull sync)
```

- **Push**: Uploads your local `en.json` and `de.json` into Tolgee
- **Pull**: Downloads translations from Tolgee back to the JSON files
- Tolgee provides a web UI for side-by-side editing, missing translation detection, and machine translation

## Data

Tolgee stores its data (embedded PostgreSQL) in `apps/tolgee/data/`. This directory is gitignored.
