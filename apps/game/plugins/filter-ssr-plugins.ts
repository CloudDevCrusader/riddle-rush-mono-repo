// Vite plugin to filter out SSR plugins at build time
// This prevents SSR plugins from being included in the client bundle

import type { Plugin } from 'vite'

export function filterSsrPlugins(): Plugin {
  return {
    name: 'filter-ssr-plugins',
    enforce: 'pre',
    generateBundle(_options, bundle) {
      // Filter out i18n plugins from the bundle
      const filesToRemove: string[] = []
      for (const fileName in bundle) {
        const chunk = bundle[fileName]
        if (chunk && (chunk.type === 'chunk' || chunk.type === 'asset')) {
          // Check if this is an SSR plugin file
          if (
            fileName.includes('switch-locale-path-ssr') ||
            fileName.includes('i18n-ssr') ||
            fileName.includes('locale-detector-ssr') ||
            fileName.includes('route-locale-detect') ||
            fileName.includes('ssg-detect')
          ) {
            filesToRemove.push(fileName)
            console.warn(`[filter-ssr-plugins] Removed i18n plugin: ${fileName}`)
          }
        }
      }
      // Remove files after iteration
      filesToRemove.forEach((fileName) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete bundle[fileName]
      })
    },
    resolveId(id) {
      // Prevent i18n plugins from being resolved (only for i18n plugins, not other virtual modules)
      if (
        (id.includes('switch-locale-path-ssr') ||
          id.includes('i18n-ssr') ||
          id.includes('locale-detector-ssr') ||
          id.includes('route-locale-detect') ||
          id.includes('ssg-detect')) &&
        !id.startsWith('virtual:') &&
        !id.startsWith('\0virtual:')
      ) {
        // Return a virtual empty module instead
        return `\0filtered-ssr:${id}`
      }
      return null
    },
    load(id) {
      // Return empty module for filtered SSR plugins
      if (id.startsWith('\0filtered-ssr:')) {
        return 'export default {}'
      }
      return null
    },
  }
}
