import { joinURL } from 'ufo';

type LocaleEntry = { code: string, iso?: string };

function getLocaleEntries(locales: unknown): LocaleEntry[] {
  const list = locales as (string | LocaleEntry)[];
  return list.map(x => (typeof x === 'string' ? { code: x } : x));
}

function isoToOg(iso: string) {
  return iso.replace(/-/g, '_');
}

/**
 * Keeps `<html lang>` aligned with the active i18n locale (BCP 47).
 * Call once from `app.vue`.
 */
export function useDocumentLang() {
  const { locale, locales } = useI18n();

  const htmlLang = computed(() => {
    const entries = getLocaleEntries(locales.value);
    const match = entries.find(e => e.code === locale.value);
    return match?.iso ?? locale.value;
  });

  useHead(() => ({
    htmlAttrs: { lang: htmlLang.value },
  }));
}

export type LocalizedSeoOptions = {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  noindex?: MaybeRefOrGetter<boolean>
};

/**
 * Per-route SEO: canonical + hreflang (`?lang=`), Open Graph, Twitter, keywords.
 * Uses the same `?lang=` convention as `plugins/i18n.client.ts`.
 */
export function useLocalizedPageSeo(options: LocalizedSeoOptions) {
  const { locale, locales, t } = useI18n();
  const config = useRuntimeConfig();
  const routerBase = (config.app?.baseURL || '/').replace(/\/?$/, '') + '/';

  const title = computed(() => toValue(options.title));
  const description = computed(() => toValue(options.description));
  const noindex = computed(() => toValue(options.noindex ?? false));

  const entries = computed(() => getLocaleEntries(locales.value));

  const resolveIso = (code: string) => {
    return entries.value.find(e => e.code === code)?.iso ?? code;
  };

  const ogLocale = computed(() => isoToOg(resolveIso(String(locale.value))));

  const ogLocaleAlternate = computed(() =>
    entries.value.filter(e => e.code !== locale.value).map(e => isoToOg(resolveIso(e.code))),
  );

  const absoluteUrlWithLang = (langCode: string) => {
    if (!import.meta.client) {
      return '';
    }
    const u = new URL(window.location.href);
    u.hash = '';
    u.searchParams.set('lang', langCode);
    return u.toString();
  };

  const canonicalUrl = computed(() => absoluteUrlWithLang(String(locale.value)));

  const hreflangLinks = computed(() => {
    if (!import.meta.client) {
      return [] as { rel: 'alternate', hreflang: string, href: string, key: string }[];
    }
    const links = entries.value.map((e) => {
      const href = absoluteUrlWithLang(e.code);
      return {
        rel: 'alternate' as const,
        hreflang: resolveIso(e.code),
        href,
        key: `hreflang-${e.code}`,
      };
    });
    const xDefault = absoluteUrlWithLang('de');
    links.push({
      rel: 'alternate' as const,
      hreflang: 'x-default',
      href: xDefault,
      key: 'hreflang-x-default',
    });
    return links;
  });

  const ogImage = computed(() => {
    if (!import.meta.client) {
      return '';
    }
    return joinURL(window.location.origin, routerBase, 'pwa-512x512.png');
  });

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogSiteName: () => t('seo.site_name'),
    ogLocale,
    ogLocaleAlternate,
    ogUrl: canonicalUrl,
    ogImage: () => ogImage.value || undefined,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: () => ogImage.value || undefined,
    robots: () => (noindex.value ? 'noindex, nofollow' : 'index, follow'),
  });

  useHead(() => ({
    meta: [{ name: 'keywords', content: t('seo.keywords') }],
    link: import.meta.client
      ? [{ rel: 'canonical', href: canonicalUrl.value, key: 'canonical' }, ...hreflangLinks.value]
      : [],
  }));
}
