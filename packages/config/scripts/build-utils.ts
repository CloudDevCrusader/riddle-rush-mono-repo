/**
 * Shared build utilities for the monorepo
 */

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export interface BuildOptions {
  workspaceRoot?: string
  appName?: string
  outputDir?: string
}

/**
 * Get the workspace root directory
 */
export function getWorkspaceRoot(): string {
  // Try to find pnpm-workspace.yaml
  let current = process.cwd()
  while (current !== '/') {
    if (existsSync(resolve(current, 'pnpm-workspace.yaml'))) {
      return current
    }
    current = resolve(current, '..')
  }
  return process.cwd()
}

/**
 * Check if a package exists in the workspace
 */
export function packageExists(packageName: string, workspaceRoot?: string): boolean {
  const root = workspaceRoot || getWorkspaceRoot()
  const packagePath = resolve(root, 'packages', packageName)
  const appPath = resolve(root, 'apps', packageName)
  return existsSync(packagePath) || existsSync(appPath)
}

/**
 * Get package.json path for a workspace package
 */
export function getPackagePath(packageName: string, workspaceRoot?: string): string | null {
  const root = workspaceRoot || getWorkspaceRoot()
  const packagePath = resolve(root, 'packages', packageName, 'package.json')
  const appPath = resolve(root, 'apps', packageName, 'package.json')

  if (existsSync(packagePath)) return packagePath
  if (existsSync(appPath)) return appPath
  return null
}

/**
 * Run a command in a specific workspace package
 */
export function runInPackage(packageName: string, command: string, workspaceRoot?: string): void {
  const root = workspaceRoot || getWorkspaceRoot()
  const packagePath = getPackagePath(packageName, root)

  if (!packagePath) {
    throw new Error(`Package ${packageName} not found`)
  }

  const packageDir = resolve(packagePath, '..')
  execSync(command, {
    cwd: packageDir,
    stdio: 'inherit',
    env: { ...process.env, PWD: packageDir },
  })
}

/**
 * Get all workspace packages
 */
export function getWorkspacePackages(workspaceRoot?: string): string[] {
  const root = workspaceRoot || getWorkspaceRoot()
  const packages: string[] = []

  // Check packages directory
  const packagesDir = resolve(root, 'packages')
  if (existsSync(packagesDir)) {
    // Implementation would read directory
    // For now, return known packages
    packages.push('shared', 'types', 'config')
  }

  // Check apps directory
  const appsDir = resolve(root, 'apps')
  if (existsSync(appsDir)) {
    packages.push('game', 'docs')
  }

  return packages
}

/**
 * Check if we're in a CI environment
 */
export function isCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.GITLAB_CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.CIRCLECI
  )
}

/**
 * Get environment-specific base URL
 */
export function getBaseURL(environment?: string): string {
  if (environment === 'production' || process.env.NODE_ENV === 'production') {
    return process.env.BASE_URL || '/'
  }
  return process.env.BASE_URL || '/'
}
