// CRITICAL: This plugin MUST run first to prevent circular dependency errors
// Plugin name starts with "00." to ensure it runs before all other plugins
// This fixes: "Cannot access 'NuxtPluginIndicator' before initialization"

export default defineNuxtPlugin({
  name: '00-init-plugin-system',
  enforce: 'pre',
  parallel: false,
  setup() {
    // Empty setup - just ensures this plugin loads first and initializes the plugin system
    // By loading this plugin first, we ensure NuxtPluginIndicator is initialized
    // before any i18n plugins try to use it
  },
})
