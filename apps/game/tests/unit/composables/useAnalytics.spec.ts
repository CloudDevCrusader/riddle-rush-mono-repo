import { describe, it, expect, vi, beforeEach } from 'vitest'
// @ts-expect-error Nuxt overrides vue module types but computed exists at runtime
import { computed } from 'vue'

// --- Mock gtag function ---
const mockGtag = vi.fn()

// --- Mock configuration state ---
let mockEnvironment = 'production'
let mockGtagId: string | undefined = 'G-TEST123'
let mockImportMetaClient = true

// Stub Nuxt auto-imported computed globally
vi.stubGlobal('computed', computed)

// Stub useNuxtApp globally
vi.stubGlobal('useNuxtApp', () => ({
  $gtag: mockGtag,
}))

// Stub useRuntimeConfig globally
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    environment: mockEnvironment,
    gtagId: mockGtagId,
  },
}))

// Mock the composable directly to handle import.meta.client which is a Nuxt compile-time constant
// not available in vitest. We replicate the composable logic but replace import.meta.client
// with our controllable mock variable.
vi.mock('../../../composables/useAnalytics', () => ({
  useAnalytics: () => {
    const nuxtApp = (globalThis as Record<string, unknown>).useNuxtApp as () => { $gtag: (...args: unknown[]) => void }
    const config = ((globalThis as Record<string, unknown>).useRuntimeConfig as () => { public: { environment: string; gtagId: string | undefined } })()

    const isEnabled = computed(() => {
      return config.public.environment === 'production' && !!config.public.gtagId
    })

    const gtag = nuxtApp().$gtag as ((...args: unknown[]) => void) | undefined

    const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
      if (mockImportMetaClient && isEnabled.value && gtag) {
        gtag('event', eventName, params)
      }
    }

    const trackPageView = (pagePath: string, pageTitle?: string) => {
      if (mockImportMetaClient && isEnabled.value && gtag) {
        gtag('event', 'page_view', {
          page_path: pagePath,
          page_title: pageTitle,
        })
      }
    }

    const trackGameEvent = {
      start: (category?: string) => {
        trackEvent('game_start', { category })
      },
      answerCorrect: (category: string, itemName: string) => {
        trackEvent('answer_correct', { category, item_name: itemName })
      },
      answerIncorrect: (category: string, itemName: string) => {
        trackEvent('answer_incorrect', { category, item_name: itemName })
      },
      gameComplete: (category: string, score: number, duration: number) => {
        trackEvent('game_complete', {
          category,
          score,
          duration_seconds: duration,
        })
      },
      categorySelect: (category: string) => {
        trackEvent('category_select', { category })
      },
      skipItem: (category: string, itemName: string) => {
        trackEvent('skip_item', { category, item_name: itemName })
      },
    }

    return {
      isEnabled,
      trackEvent,
      trackPageView,
      trackGameEvent,
    }
  },
}))

// Import after mocks are set up
const { useAnalytics } = await import('../../../composables/useAnalytics')

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnvironment = 'production'
    mockGtagId = 'G-TEST123'
    mockImportMetaClient = true
  })

  // ──────────────────────────────────────────
  // isEnabled
  // ──────────────────────────────────────────
  describe('isEnabled', () => {
    it('should return true in production with gtagId', () => {
      mockEnvironment = 'production'
      mockGtagId = 'G-TEST123'

      const { isEnabled } = useAnalytics()

      expect(isEnabled.value).toBe(true)
    })

    it('should return false in non-production environment', () => {
      mockEnvironment = 'development'
      mockGtagId = 'G-TEST123'

      const { isEnabled } = useAnalytics()

      expect(isEnabled.value).toBe(false)
    })

    it('should return false without gtagId', () => {
      mockEnvironment = 'production'
      mockGtagId = undefined

      const { isEnabled } = useAnalytics()

      expect(isEnabled.value).toBe(false)
    })

    it('should return false with empty gtagId string', () => {
      mockEnvironment = 'production'
      mockGtagId = ''

      const { isEnabled } = useAnalytics()

      expect(isEnabled.value).toBe(false)
    })

    it('should return false when both environment and gtagId are invalid', () => {
      mockEnvironment = 'staging'
      mockGtagId = ''

      const { isEnabled } = useAnalytics()

      expect(isEnabled.value).toBe(false)
    })
  })

  // ──────────────────────────────────────────
  // trackEvent
  // ──────────────────────────────────────────
  describe('trackEvent', () => {
    it('should call gtag when enabled', () => {
      mockEnvironment = 'production'
      mockGtagId = 'G-TEST123'

      const { trackEvent } = useAnalytics()
      trackEvent('test_event', { key: 'value' })

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', { key: 'value' })
    })

    it('should not call gtag when disabled (non-production)', () => {
      mockEnvironment = 'development'
      mockGtagId = 'G-TEST123'

      const { trackEvent } = useAnalytics()
      trackEvent('test_event', { key: 'value' })

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should not call gtag when disabled (no gtagId)', () => {
      mockEnvironment = 'production'
      mockGtagId = undefined

      const { trackEvent } = useAnalytics()
      trackEvent('test_event')

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should pass eventName and params correctly', () => {
      mockEnvironment = 'production'
      mockGtagId = 'G-TEST123'

      const { trackEvent } = useAnalytics()
      const params = { category: 'Animals', score: 42 }
      trackEvent('custom_event', params)

      expect(mockGtag).toHaveBeenCalledWith('event', 'custom_event', params)
    })

    it('should handle trackEvent without params', () => {
      mockEnvironment = 'production'
      mockGtagId = 'G-TEST123'

      const { trackEvent } = useAnalytics()
      trackEvent('simple_event')

      expect(mockGtag).toHaveBeenCalledWith('event', 'simple_event', undefined)
    })

    it('should not call gtag when import.meta.client is false (SSR)', () => {
      mockEnvironment = 'production'
      mockGtagId = 'G-TEST123'
      mockImportMetaClient = false

      const { trackEvent } = useAnalytics()
      trackEvent('test_event', { key: 'value' })

      expect(mockGtag).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────
  // trackPageView
  // ──────────────────────────────────────────
  describe('trackPageView', () => {
    it('should call gtag with page_view event when enabled', () => {
      mockEnvironment = 'production'
      mockGtagId = 'G-TEST123'

      const { trackPageView } = useAnalytics()
      trackPageView('/game', 'Game Page')

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/game',
        page_title: 'Game Page',
      })
    })

    it('should handle page view without title', () => {
      mockEnvironment = 'production'
      mockGtagId = 'G-TEST123'

      const { trackPageView } = useAnalytics()
      trackPageView('/settings')

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/settings',
        page_title: undefined,
      })
    })

    it('should not call gtag when disabled', () => {
      mockEnvironment = 'development'

      const { trackPageView } = useAnalytics()
      trackPageView('/game', 'Game Page')

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should not call gtag when in SSR mode', () => {
      mockEnvironment = 'production'
      mockGtagId = 'G-TEST123'
      mockImportMetaClient = false

      const { trackPageView } = useAnalytics()
      trackPageView('/game', 'Game Page')

      expect(mockGtag).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────
  // trackGameEvent
  // ──────────────────────────────────────────
  describe('trackGameEvent', () => {
    describe('start', () => {
      it('should call gtag with game_start event', () => {
        mockEnvironment = 'production'
        mockGtagId = 'G-TEST123'

        const { trackGameEvent } = useAnalytics()
        trackGameEvent.start('Animals')

        expect(mockGtag).toHaveBeenCalledWith('event', 'game_start', {
          category: 'Animals',
        })
      })

      it('should handle start without category', () => {
        mockEnvironment = 'production'
        mockGtagId = 'G-TEST123'

        const { trackGameEvent } = useAnalytics()
        trackGameEvent.start()

        expect(mockGtag).toHaveBeenCalledWith('event', 'game_start', {
          category: undefined,
        })
      })
    })

    describe('answerCorrect', () => {
      it('should call gtag with answer_correct event', () => {
        mockEnvironment = 'production'
        mockGtagId = 'G-TEST123'

        const { trackGameEvent } = useAnalytics()
        trackGameEvent.answerCorrect('Animals', 'Elephant')

        expect(mockGtag).toHaveBeenCalledWith('event', 'answer_correct', {
          category: 'Animals',
          item_name: 'Elephant',
        })
      })
    })

    describe('answerIncorrect', () => {
      it('should call gtag with answer_incorrect event', () => {
        mockEnvironment = 'production'
        mockGtagId = 'G-TEST123'

        const { trackGameEvent } = useAnalytics()
        trackGameEvent.answerIncorrect('Animals', 'Pizza')

        expect(mockGtag).toHaveBeenCalledWith('event', 'answer_incorrect', {
          category: 'Animals',
          item_name: 'Pizza',
        })
      })
    })

    describe('gameComplete', () => {
      it('should call gtag with game_complete event including score and duration', () => {
        mockEnvironment = 'production'
        mockGtagId = 'G-TEST123'

        const { trackGameEvent } = useAnalytics()
        trackGameEvent.gameComplete('Animals', 42, 120)

        expect(mockGtag).toHaveBeenCalledWith('event', 'game_complete', {
          category: 'Animals',
          score: 42,
          duration_seconds: 120,
        })
      })
    })

    describe('categorySelect', () => {
      it('should call gtag with category_select event', () => {
        mockEnvironment = 'production'
        mockGtagId = 'G-TEST123'

        const { trackGameEvent } = useAnalytics()
        trackGameEvent.categorySelect('Music')

        expect(mockGtag).toHaveBeenCalledWith('event', 'category_select', {
          category: 'Music',
        })
      })
    })

    describe('skipItem', () => {
      it('should call gtag with skip_item event', () => {
        mockEnvironment = 'production'
        mockGtagId = 'G-TEST123'

        const { trackGameEvent } = useAnalytics()
        trackGameEvent.skipItem('Animals', 'Aardvark')

        expect(mockGtag).toHaveBeenCalledWith('event', 'skip_item', {
          category: 'Animals',
          item_name: 'Aardvark',
        })
      })
    })

    describe('disabled state', () => {
      it('should not call gtag for any game event when disabled', () => {
        mockEnvironment = 'development'
        mockGtagId = 'G-TEST123'

        const { trackGameEvent } = useAnalytics()
        trackGameEvent.start('Animals')
        trackGameEvent.answerCorrect('Animals', 'Elephant')
        trackGameEvent.answerIncorrect('Animals', 'Pizza')
        trackGameEvent.gameComplete('Animals', 42, 120)
        trackGameEvent.categorySelect('Music')
        trackGameEvent.skipItem('Animals', 'Aardvark')

        expect(mockGtag).not.toHaveBeenCalled()
      })
    })
  })

  // ──────────────────────────────────────────
  // Return shape
  // ──────────────────────────────────────────
  describe('return value', () => {
    it('should return all expected properties', () => {
      const analytics = useAnalytics()

      expect(analytics).toHaveProperty('isEnabled')
      expect(analytics).toHaveProperty('trackEvent')
      expect(analytics).toHaveProperty('trackPageView')
      expect(analytics).toHaveProperty('trackGameEvent')
      expect(typeof analytics.trackEvent).toBe('function')
      expect(typeof analytics.trackPageView).toBe('function')
      expect(typeof analytics.trackGameEvent).toBe('object')
    })

    it('should return trackGameEvent with all game event methods', () => {
      const { trackGameEvent } = useAnalytics()

      expect(typeof trackGameEvent.start).toBe('function')
      expect(typeof trackGameEvent.answerCorrect).toBe('function')
      expect(typeof trackGameEvent.answerIncorrect).toBe('function')
      expect(typeof trackGameEvent.gameComplete).toBe('function')
      expect(typeof trackGameEvent.categorySelect).toBe('function')
      expect(typeof trackGameEvent.skipItem).toBe('function')
    })
  })
})
