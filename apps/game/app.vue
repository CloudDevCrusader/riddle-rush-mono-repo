<template>
  <div id="app" class="app-container">
    <Transition name="splash-fade" mode="out-in">
      <SplashScreen v-if="showSplash" @complete="onSplashComplete" />
      <div v-else class="main-content">
        <NuxtLayout>
          <!-- No route transition in E2E: opacity enter/leave makes Playwright visibility flaky. -->
          <NuxtPage :transition="nuxtRouteTransition" />
        </NuxtLayout>
        <Toast />
        <LazyDebugPanel />
        <LazyStoryboardDevOverlay />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { BeforeInstallPromptEvent } from '@riddle-rush/types/game';

const gameSession = useGameSession();
const installPrompt = useInstallPrompt();
const settings = useSettings();
const { setLocale, t } = useI18n();
const { $pwa } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();

// Initialize PWA update detection (watchEffect + toast when SW needs refresh)
const pwaUpdate = usePWAUpdate();

useDocumentLang();

const jsonLdPayload = computed(() =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('seo.site_name'),
    description: t('seo.json_ld_description'),
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript. Progressive Web App.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: ['de-DE', 'en-US'],
  })
);

useHead(() => ({
  script: [
    {
      key: 'jsonld-webapp',
      type: 'application/ld+json',
      innerHTML: jsonLdPayload.value,
    },
  ],
}));

const seoOgImage = computed(() => {
  const path = 'pwa-512x512.png';
  const base = runtimeConfig.public.baseUrl as string;
  if (typeof base === 'string' && base.startsWith('http')) {
    try {
      return new URL(path, base.endsWith('/') ? base : `${base}/`).href;
    } catch {
      /* ignore */
    }
  }
  const websiteUrl = runtimeConfig.public.websiteUrl as string | undefined;
  if (websiteUrl?.startsWith('http')) {
    try {
      return new URL(path, websiteUrl.endsWith('/') ? websiteUrl : `${websiteUrl}/`).href;
    } catch {
      /* ignore */
    }
  }
  return `/${path}`;
});

useHead(() => ({
  meta: [
    { name: 'description', content: t('seo.json_ld_description') },
    { name: 'keywords', content: t('seo.keywords') },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: t('seo.site_name') },
    { property: 'og:title', content: t('seo.site_name') },
    { property: 'og:description', content: t('seo.json_ld_description') },
    { property: 'og:image', content: seoOgImage.value },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: t('seo.site_name') },
    { name: 'twitter:description', content: t('seo.json_ld_description') },
    { name: 'twitter:image', content: seoOgImage.value },
  ],
}));

// Disable splash screen in E2E tests
const playwrightE2EWindow = () =>
  typeof window !== 'undefined' &&
  Boolean((window as Window & { playwrightTest?: boolean }).playwrightTest);

const isE2E = process.env.NODE_ENV === 'test' || playwrightE2EWindow();

/** Ref + onBeforeMount so transition turns off if the flag appears after first setup tick. */
/** No `mode: out-in` — that clears the whole page between routes and feels like a reload. */
const nuxtRouteTransition = shallowRef<false | { name: string }>(
  isE2E
    ? false
    : {
        name: 'page-opacity',
      }
);

onBeforeMount(() => {
  if (process.env.NODE_ENV === 'test' || playwrightE2EWindow()) {
    nuxtRouteTransition.value = false;
  }
});

const showSplash = ref(!isE2E);

const onSplashComplete = () => {
  showSplash.value = false;
};

// Named handlers for proper cleanup
const handleOnline = () => gameSession.setOnlineStatus(true);
const handleOffline = () => gameSession.setOnlineStatus(false);
const handleInstallPrompt = (e: Event) => {
  e.preventDefault();
  installPrompt.setInstallPrompt(e as BeforeInstallPromptEvent);
};
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    settings.toggleDebugMode();
  }
};

onMounted(async () => {
  // Load persisted state
  await gameSession.loadFromDB();

  // Set the saved language preference
  const savedLanguage = settings.getLanguage();
  if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
    try {
      await setLocale(savedLanguage as 'de' | 'en');
    } catch (error) {
      const logger = useLogger();
      logger.error('Failed to set saved language:', error);
    }
  }

  // Monitor online status
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', handleInstallPrompt);

  // Debug mode shortcut: Ctrl+Shift+D
  window.addEventListener('keydown', handleKeydown);

  // Playwright: expose hook to simulate update toast without a real SW bump.
  // sessionStorage flag ensures needRefresh survives full page reloads (simulating
  // a real service worker that would keep needRefresh=true until the user reloads).
  if (playwrightE2EWindow()) {
    const PENDING_KEY = 'pwa-e2e-update-pending';

    (
      window as Window & {
        __pwaUpdateE2E?: { trigger: () => void; dismiss: () => Promise<void> };
      }
    ).__pwaUpdateE2E = {
      trigger: () => {
        sessionStorage.setItem(PENDING_KEY, 'true');
        sessionStorage.removeItem('pwa-update-dismissed');
        pwaUpdate.updateDetected({ force: true });
      },
      dismiss: () => {
        sessionStorage.removeItem(PENDING_KEY);
        return pwaUpdate.dismiss();
      },
    };
  }
});
onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  window.removeEventListener('keydown', handleKeydown);
});

useHead({
  link: [
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'apple-touch-startup-image', href: '/pwa-512x512.png' },
  ],
});
</script>

<style lang="scss">
@use '~/assets/scss/design-system.scss';

.app-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  max-width: 100vw;
  position: relative;
  overflow-x: hidden;
  /* Mobile-first: Optimize rendering */
  -webkit-overflow-scrolling: touch;
  /* Prevent layout shifts */
  contain: layout style paint;
}

/* Splash Screen Transition */
.splash-fade-enter-active,
.splash-fade-leave-active {
  transition: opacity 0.5s ease;
}

.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}

.main-content {
  min-height: 100vh;
  min-height: 100dvh;
}

/* Route-level fade (short; respects reduced motion below) */
.page-opacity-enter-active,
.page-opacity-leave-active {
  transition: opacity 0.2s ease;
}
.page-opacity-enter-from,
.page-opacity-leave-to {
  opacity: 0;
}

/* Forward navigation: slide left */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 250ms ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Back navigation: slide right */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 250ms ease;
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .page-opacity-enter-active,
  .page-opacity-leave-active {
    transition: none;
  }

  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: opacity 0.15s ease;
  }

  .slide-left-enter-from,
  .slide-left-leave-to,
  .slide-right-enter-from,
  .slide-right-leave-to {
    transform: none;
  }
}
</style>
