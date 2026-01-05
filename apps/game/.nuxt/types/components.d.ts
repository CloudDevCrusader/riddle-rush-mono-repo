
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  'Button': typeof import("../../components/Base/Button.vue").default
  'ImageButton': typeof import("../../components/Base/ImageButton.vue").default
  'Modal': typeof import("../../components/Base/Modal.vue").default
  'DebugPanel': typeof import("../../components/DebugPanel.vue").default
  'FortuneWheel': typeof import("../../components/FortuneWheel.vue").default
  'GameHistory': typeof import("../../components/GameHistory.vue").default
  'GlobalLoading': typeof import("../../components/GlobalLoading.vue").default
  'Leaderboard': typeof import("../../components/Leaderboard.vue").default
  'PageTransition': typeof import("../../components/PageTransition.vue").default
  'PauseModal': typeof import("../../components/PauseModal.vue").default
  'PlayerLeaderboard': typeof import("../../components/PlayerLeaderboard.vue").default
  'QuitModal': typeof import("../../components/QuitModal.vue").default
  'SettingsModal': typeof import("../../components/SettingsModal.vue").default
  'Spinner': typeof import("../../components/Spinner.vue").default
  'SplashScreen': typeof import("../../components/SplashScreen.vue").default
  'StoryboardDevOverlay': typeof import("../../components/StoryboardDevOverlay.vue").default
  'Toast': typeof import("../../components/Toast.vue").default
  'NuxtWelcome': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/welcome.vue").default
  'NuxtLayout': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-layout").default
  'NuxtErrorBoundary': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue").default
  'ClientOnly': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/client-only").default
  'DevOnly': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/dev-only").default
  'ServerPlaceholder': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/server-placeholder").default
  'NuxtLink': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-link").default
  'NuxtLoadingIndicator': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-loading-indicator").default
  'NuxtTime': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-time.vue").default
  'NuxtRouteAnnouncer': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-route-announcer").default
  'NuxtImg': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-stubs").NuxtImg
  'NuxtPicture': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-stubs").NuxtPicture
  'NuxtLinkLocale': typeof import("../../../../node_modules/.pnpm/@nuxtjs+i18n@10.2.1_@vercel+functions@3.3.4_@aws-sdk+credential-provider-web-identity@3_26742c1cd4a7b6927ebafcd96ba09e30/node_modules/@nuxtjs/i18n/dist/runtime/components/NuxtLinkLocale").default
  'SwitchLocalePathLink': typeof import("../../../../node_modules/.pnpm/@nuxtjs+i18n@10.2.1_@vercel+functions@3.3.4_@aws-sdk+credential-provider-web-identity@3_26742c1cd4a7b6927ebafcd96ba09e30/node_modules/@nuxtjs/i18n/dist/runtime/components/SwitchLocalePathLink").default
  'VitePwaManifest': typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest").default
  'NuxtPwaManifest': typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest").default
  'NuxtPwaAssets': typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/NuxtPwaAssets").default
  'PwaAppleImage': typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaAppleImage").default
  'PwaAppleSplashScreenImage': typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaAppleSplashScreenImage").default
  'PwaFaviconImage': typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaFaviconImage").default
  'PwaMaskableImage': typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaMaskableImage").default
  'PwaTransparentImage': typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaTransparentImage").default
  'NuxtPage': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/pages/runtime/page").default
  'NoScript': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").NoScript
  'Link': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Link
  'Base': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Base
  'Title': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Title
  'Meta': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Meta
  'Style': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Style
  'Head': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Head
  'Html': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Html
  'Body': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Body
  'NuxtIsland': typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-island").default
  'LazyButton': LazyComponent<typeof import("../../components/Base/Button.vue").default>
  'LazyImageButton': LazyComponent<typeof import("../../components/Base/ImageButton.vue").default>
  'LazyModal': LazyComponent<typeof import("../../components/Base/Modal.vue").default>
  'LazyDebugPanel': LazyComponent<typeof import("../../components/DebugPanel.vue").default>
  'LazyFortuneWheel': LazyComponent<typeof import("../../components/FortuneWheel.vue").default>
  'LazyGameHistory': LazyComponent<typeof import("../../components/GameHistory.vue").default>
  'LazyGlobalLoading': LazyComponent<typeof import("../../components/GlobalLoading.vue").default>
  'LazyLeaderboard': LazyComponent<typeof import("../../components/Leaderboard.vue").default>
  'LazyPageTransition': LazyComponent<typeof import("../../components/PageTransition.vue").default>
  'LazyPauseModal': LazyComponent<typeof import("../../components/PauseModal.vue").default>
  'LazyPlayerLeaderboard': LazyComponent<typeof import("../../components/PlayerLeaderboard.vue").default>
  'LazyQuitModal': LazyComponent<typeof import("../../components/QuitModal.vue").default>
  'LazySettingsModal': LazyComponent<typeof import("../../components/SettingsModal.vue").default>
  'LazySpinner': LazyComponent<typeof import("../../components/Spinner.vue").default>
  'LazySplashScreen': LazyComponent<typeof import("../../components/SplashScreen.vue").default>
  'LazyStoryboardDevOverlay': LazyComponent<typeof import("../../components/StoryboardDevOverlay.vue").default>
  'LazyToast': LazyComponent<typeof import("../../components/Toast.vue").default>
  'LazyNuxtWelcome': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/welcome.vue").default>
  'LazyNuxtLayout': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-layout").default>
  'LazyNuxtErrorBoundary': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue").default>
  'LazyClientOnly': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/client-only").default>
  'LazyDevOnly': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/dev-only").default>
  'LazyServerPlaceholder': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/server-placeholder").default>
  'LazyNuxtLink': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-link").default>
  'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-loading-indicator").default>
  'LazyNuxtTime': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-time.vue").default>
  'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-route-announcer").default>
  'LazyNuxtImg': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-stubs").NuxtImg>
  'LazyNuxtPicture': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-stubs").NuxtPicture>
  'LazyNuxtLinkLocale': LazyComponent<typeof import("../../../../node_modules/.pnpm/@nuxtjs+i18n@10.2.1_@vercel+functions@3.3.4_@aws-sdk+credential-provider-web-identity@3_26742c1cd4a7b6927ebafcd96ba09e30/node_modules/@nuxtjs/i18n/dist/runtime/components/NuxtLinkLocale").default>
  'LazySwitchLocalePathLink': LazyComponent<typeof import("../../../../node_modules/.pnpm/@nuxtjs+i18n@10.2.1_@vercel+functions@3.3.4_@aws-sdk+credential-provider-web-identity@3_26742c1cd4a7b6927ebafcd96ba09e30/node_modules/@nuxtjs/i18n/dist/runtime/components/SwitchLocalePathLink").default>
  'LazyVitePwaManifest': LazyComponent<typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest").default>
  'LazyNuxtPwaManifest': LazyComponent<typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest").default>
  'LazyNuxtPwaAssets': LazyComponent<typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/NuxtPwaAssets").default>
  'LazyPwaAppleImage': LazyComponent<typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaAppleImage").default>
  'LazyPwaAppleSplashScreenImage': LazyComponent<typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaAppleSplashScreenImage").default>
  'LazyPwaFaviconImage': LazyComponent<typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaFaviconImage").default>
  'LazyPwaMaskableImage': LazyComponent<typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaMaskableImage").default>
  'LazyPwaTransparentImage': LazyComponent<typeof import("../../../../node_modules/.pnpm/@vite-pwa+nuxt@1.1.0_magicast@0.5.1_vite@7.3.0_@types+node@22.19.3_jiti@2.6.1_lightning_a6cf3e46f361344bc55e4b8c3efa0bd6/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaTransparentImage").default>
  'LazyNuxtPage': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/pages/runtime/page").default>
  'LazyNoScript': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").NoScript>
  'LazyLink': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Link>
  'LazyBase': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Base>
  'LazyTitle': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Title>
  'LazyMeta': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Meta>
  'LazyStyle': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Style>
  'LazyHead': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Head>
  'LazyHtml': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Html>
  'LazyBody': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/head/runtime/components").Body>
  'LazyNuxtIsland': LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@4.2.2_@parcel+watcher@2.5.1_@types+node@22.19.3_@vercel+functions@3.3.4_@aws-sdk+c_1574da29526f4ea45289b75f7422c9c3/node_modules/nuxt/dist/app/components/nuxt-island").default>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
