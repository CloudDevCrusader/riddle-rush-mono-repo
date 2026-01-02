/**
 * @riddle-rush/config
 *
 * Shared configuration package for the Riddle Rush monorepo
 */

// Export Vite configuration
export * from './vite.config'

// Export build utilities
export * from './scripts/build-utils'

// Re-export ESLint config (for reference, actual config is in eslint.config.mjs)
// ESLint config is exported via package.json exports field
// This re-export is not needed for TypeScript as it's a runtime config file
