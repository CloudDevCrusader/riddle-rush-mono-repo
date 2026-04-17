/**
 * Google Analytics 4 Plugin
 *
 * Simple GA4 integration without external dependencies.
 * Only loads in production when `gtagId` is set (`NUXT_PUBLIC_GOOGLE_ANALYTICS_ID` / `GOOGLE_ANALYTICS_ID` / `GTAG_ID`).
 */

export default defineNuxtPlugin({
  name: 'gtag',
  setup: (nuxtApp) => {
    const config = useRuntimeConfig();
    const router = nuxtApp.$router as ReturnType<typeof useRouter>;

    // Only enable in production with valid GTAG_ID
    const gtagId = config.public.gtagId || '';
    const isProduction = config.public.environment === 'production';

    if (!isProduction || !gtagId || typeof window === 'undefined') {
      return;
    }

    const preconnectOrigins = [
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ] as const;
    for (const href of preconnectOrigins) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      document.head.appendChild(link);
      const dns = document.createElement('link');
      dns.rel = 'dns-prefetch';
      dns.href = href;
      document.head.appendChild(dns);
    }

    const injectGtag = () => {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
      script.async = true;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gtagId}', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      });
    `;
      document.head.appendChild(inlineScript);

      router.afterEach((to) => {
        if (typeof window === 'undefined') return;
        const gtagFn = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
        if (typeof gtagFn === 'function') {
          gtagFn('config', gtagId, { page_path: to.fullPath });
        }
      });
    };

    const scheduleInject = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => injectGtag(), { timeout: 4000 });
      } else {
        setTimeout(injectGtag, 0);
      }
    };

    window.addEventListener('load', scheduleInject, { once: true });

    return {
      provide: {
        gtag: (...args: unknown[]) => {
          const gtagFn = (window as unknown as { gtag?: (...fnArgs: unknown[]) => void }).gtag;
          if (typeof window !== 'undefined' && typeof gtagFn === 'function') {
            gtagFn(...args);
          }
        },
      },
    };
  },
});
