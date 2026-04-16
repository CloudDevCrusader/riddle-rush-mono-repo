import type { DevWindowPerformanceTools } from './types/performance';
import type { ModuleOptions as NuxtSecurityModuleOptions } from 'nuxt-security';

declare global {
  interface Window {
    /** Dev-only: set by `plugins/performance.client.ts` when `import.meta.dev`. */
    __performance__?: DevWindowPerformanceTools
  }
}

export {};

// Augment NuxtConfig so that the `security` key from nuxt-security is accepted
// by defineNuxtConfig(). The module only augments NuxtOptions (resolved config),
// not NuxtConfig (input config), so TypeScript rejects the property otherwise.
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import type { ModuleOptions as NuxtSecurityModuleOptions } from 'nuxt-security'
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

declare module 'nuxt/schema' {
  interface NuxtConfig {
    security?: Partial<NuxtSecurityModuleOptions>
  }
}

// Type declarations for Nuxt internal modules used by generated files
declare module '#build/pwa-icons/pwa-icons' {
  export interface PWAIcons {
    transparent: Record<string, unknown>
    maskable: Record<string, unknown>
    favicon: Record<string, unknown>
    apple: Record<string, unknown>
    appleSplashScreen: Record<string, unknown>
  }
}

// vue-i18n global injection types
// $t is injected globally via vue-i18n's globalInjection option in plugins/i18n.client.ts
declare module 'vue' {
  interface ComponentCustomProperties {
    $t: (key: string, defaultMsg?: string) => string
  }
}
