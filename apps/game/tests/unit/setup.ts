// Basic test setup for Vue/Nuxt applications
import { beforeEach, afterEach, vi } from 'vitest';
import { ref } from 'vue';

// Toast mock
const mockToast = {
  show: vi.fn(() => 'toast-1'),
  remove: vi.fn(),
  clear: vi.fn(),
  toasts: { value: [] },
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

const mockUseToast = vi.fn(() => mockToast);

// PWA mock
const mockPWA = {
  isInstalled: false,
  isPWAInstalled: { value: false },
  showInstallPrompt: { value: false },
  cancelInstall: vi.fn(),
  install: vi.fn(),
  swActivated: { value: false },
  registrationError: { value: null },
  offlineReady: { value: false },
  needRefresh: ref(false),
  updateServiceWorker: vi.fn(),
  cancelPrompt: vi.fn(),
  getSWRegistration: vi.fn(),
};

// Nuxt composable mocks
const mockUseRuntimeConfig = vi.fn(() => ({
  public: {
    baseUrl: '/',
    environment: 'test',
    appVersion: '1.0.0-test',
    debugErrorSync: false,
  },
}));

const mockUseRoute = vi.fn(() => ({
  path: '/',
  params: {},
  query: {},
}));

const mockUseRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
}));

const mockUseNuxtApp = vi.fn(() => ({
  $i18n: {
    t: (key: string) => key,
  },
  $pwa: mockPWA,
}));

const mockUseI18n = vi.fn(() => ({
  t: (key: string, fallback?: string | Record<string, unknown>) =>
    typeof fallback === 'string' ? fallback : key,
}));

const localStorageMock = (() => {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    get length() {
      return store.size;
    },
  };
})();

// Global mock setup
Object.assign(globalThis, {
  useRuntimeConfig: mockUseRuntimeConfig,
  useRoute: mockUseRoute,
  useRouter: mockUseRouter,
  useNuxtApp: mockUseNuxtApp,
  useI18n: mockUseI18n,
  useToast: mockUseToast,
  localStorage: localStorageMock,
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  // Reset mock state
  mockPWA.needRefresh.value = false;
  mockPWA.updateServiceWorker.mockClear();
  mockPWA.cancelPrompt.mockClear();
  mockToast.show.mockClear();
  mockToast.show.mockReturnValue('toast-1');
  mockToast.remove.mockClear();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.clearAllMocks();
});

// Export for test access
export { mockPWA, mockToast };

export default { createTestContext: () => ({}) };
