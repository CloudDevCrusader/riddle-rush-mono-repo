/**
 * Google Analytics 4 Plugin
 *
 * Simple GA4 integration without external dependencies.
 * Only loads in production when GTAG_ID is configured.
 */

export default defineNuxtPlugin({
  name: 'gtag',
  setup: (nuxtApp) => {
    const config = useRuntimeConfig()
    const router = nuxtApp.$router as ReturnType<typeof useRouter>

    // Only enable in production with valid GTAG_ID
    const gtagId = config.public.gtagId || ''
    const isProduction = config.public.environment === 'production'

    if (!isProduction || !gtagId || typeof window === 'undefined') {
      return
    }

    // Load GA4 script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`
    script.async = true
    document.head.appendChild(script)

    const inlineScript = document.createElement('script')
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gtagId}', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      });
    `
    document.head.appendChild(inlineScript)

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
  },
})
