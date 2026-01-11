/**
 * Google Analytics 4 Plugin
 *
 * Simple GA4 integration without external dependencies.
 * Only loads in production when GTAG_ID is configured.
 */

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const router = useRouter()

  // Only enable in production with valid GTAG_ID
  const gtagId = config.public.gtagId || ''
  const isProduction = config.public.environment === 'production'

  if (!isProduction || !gtagId || typeof window === 'undefined') {
    return
  }

  // Load GA4 script
  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${gtagId}`,
        async: true,
      },
      {
        innerHTML: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gtagId}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure',
          });
        `,
        type: 'text/javascript',
      },
    ],
  })

  // Track page views on route change
  router.afterEach((to) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('config', gtagId, {
        page_path: to.fullPath,
      })
    }
  })

  // Provide gtag helper
  return {
    provide: {
      gtag: (...args: any[]) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag(...args)
        }
      },
    },
  }
})
