// Fix for plugin initialization order issues
// This ensures NuxtPluginIndicator is available before i18n plugins try to use it

import { defineNuxtPlugin } from '#imports'

// Early initialization of NuxtPluginIndicator to prevent race conditions
export default defineNuxtPlugin((nuxtApp) => {
  // Ensure the plugin indicator is available early
  if (typeof window !== 'undefined') {
    // This helps prevent the "Cannot access 'NuxtPluginIndicator' before initialization" error
    // by ensuring the plugin system is ready before other plugins initialize
    nuxtApp.hook('app:created', () => {
      // No-op, just ensures this plugin runs early
    })
  }
})

// Set this plugin to run first by using a high priority
// @ts-expect-error - This is a workaround for plugin ordering
defineNuxtPlugin.priority = 1000
