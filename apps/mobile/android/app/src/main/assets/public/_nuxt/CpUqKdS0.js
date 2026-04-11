import {
  a8 as U,
  t as V,
  a9 as ge,
  q as W,
  aa as he,
  ab as X,
  ac as K,
  a as ee,
  v as pe,
  m as _,
  ad as ve,
  ae as _e,
  o as te,
  A as $,
  B as A,
  af as J,
  a5 as ye,
  ag as we,
  i as M,
  d as re,
  W as N,
  C as f,
  D as q,
  S as O,
  _ as se,
  H as Se,
  a3 as be,
  I as xe,
  z as Me,
  E as F,
  l as p,
  F as qe,
  Z as ke,
} from './BI8BVXPj.js'
import { u as Ie } from './CbjeSZOE.js'
import { u as ze } from './CFwlYHw3.js'
import { u as $e } from './QhPvbTN-.js'
import './Ufk1xTYU.js'
async function Ae(e, t) {
  return await Ce(t).catch((r) => ({ width: 0, height: 0, ratio: 0 }))
}
async function Ce(e) {
  if (typeof Image > 'u') throw new TypeError('Image not supported')
  return new Promise((t, s) => {
    const r = new Image()
    ;((r.onload = () => {
      const i = { width: r.width, height: r.height, ratio: r.width / r.height }
      t(i)
    }),
      (r.onerror = (i) => s(i)),
      (r.src = e))
  })
}
function Q(e) {
  return (t) => (t !== void 0 ? e[t] || t : e.missingValue)
}
function Ne(e = {}) {
  const t = e.formatter,
    s = e.keyMap && typeof e.keyMap != 'function' ? Q(e.keyMap) : e.keyMap,
    r = {}
  for (const i in e.valueMap) {
    const a = i,
      l = e.valueMap[a]
    r[a] = typeof l == 'object' ? Q(l) : l
  }
  return (i) => {
    const a = []
    for (const l in i) {
      const n = l
      if (typeof i[n] > 'u') continue
      const m = typeof r[n] == 'function' ? r[n](i[n]) : i[n]
      a.push([s ? s(n) : n, m])
    }
    return t ? a.map((l) => t(...l)).join(e.joinWith ?? '&') : new URLSearchParams(a).toString()
  }
}
function We(e = '') {
  if (e === void 0 || !e.length) return []
  const t = new Set()
  for (const s of e.split(' ')) {
    const r = Number.parseInt(s.replace('x', ''))
    r && t.add(r)
  }
  return Array.from(t)
}
function Pe(e) {
  if (e.length === 0)
    throw new Error(
      '`densities` must not be empty, configure to `1` to render regular size only (DPR 1.0)'
    )
}
function C(e = '') {
  if (typeof e == 'number') return e
  if (typeof e == 'string' && e.replace('px', '').match(/^\d+$/g)) return Number.parseInt(e, 10)
}
function Re(e) {
  const t = {}
  if (typeof e == 'string')
    for (const s of e.split(/[\s,]+/).filter((r) => r)) {
      const r = s.split(':')
      r.length !== 2 ? (t['1px'] = r[0].trim()) : (t[r[0].trim()] = r[1].trim())
    }
  else Object.assign(t, e)
  return t
}
function Le(e) {
  const t = { options: e },
    s = (i, a = {}) => ie(t, i, a),
    r = (i, a, l) => s(i, U({ modifiers: a }, l)).url
  for (const i in e.presets) r[i] = (a, l, n) => r(a, l, { ...e.presets[i], ...n })
  return (
    (r.options = e),
    (r.getImage = s),
    (r.getMeta = (i, a) => je(t, i, a)),
    (r.getSizes = (i, a) => Ee(t, i, a)),
    (t.$img = r),
    r
  )
}
async function je(e, t, s) {
  const r = ie(e, t, { ...s })
  return typeof r.getMeta == 'function' ? await r.getMeta() : await Ae(e, r.url)
}
function ie(e, t, s) {
  if (t && typeof t != 'string')
    throw new TypeError(`input must be a string (received ${typeof t}: ${JSON.stringify(t)})`)
  if (!t || t.startsWith('data:')) return { url: t }
  const { setup: r, defaults: i } = De(e, s.provider || e.options.provider),
    a = r(),
    l = ae(e, s.preset)
  if (((t = V(t) ? t : ge(t)), !a.supportsAlias)) {
    for (const u in e.options.alias)
      if (t.startsWith(u)) {
        const v = e.options.alias[u]
        v && (t = W(v, t.slice(u.length)))
      }
  }
  if (a.validateDomains && V(t)) {
    const u = he(t).host
    if (!e.options.domains.find((v) => v === u)) return { url: t }
  }
  const n = U(s, l, i),
    m = {
      ...n,
      modifiers: {
        ...n.modifiers,
        width: n.modifiers?.width ? C(n.modifiers.width) : void 0,
        height: n.modifiers?.height ? C(n.modifiers.height) : void 0,
      },
    },
    h = a.getImage(t, m, e)
  return ((h.format ||= m.modifiers.format || ''), h)
}
function De(e, t) {
  const s = e.options.providers[t]
  if (!s) throw new Error('Unknown provider: ' + t)
  return s
}
function ae(e, t) {
  if (!t) return {}
  if (!e.options.presets[t]) throw new Error('Unknown preset: ' + t)
  return e.options.presets[t]
}
function Ee(e, t, s) {
  const r = ae(e, s.preset),
    i = U(s, r),
    a = C(i.modifiers?.width),
    l = C(i.modifiers?.height),
    n = i.sizes ? Re(i.sizes) : {},
    m = i.densities?.trim(),
    h = m ? We(m) : e.options.densities
  Pe(h)
  const u = a && l ? l / a : 0,
    v = [],
    y = []
  if (Object.keys(n).length >= 1) {
    for (const c in n) {
      const o = Y(c, String(n[c]), l, u, e)
      if (o !== void 0) {
        v.push({
          size: o.size,
          screenMaxWidth: o.screenMaxWidth,
          media: `(max-width: ${o.screenMaxWidth}px)`,
        })
        for (const g of h) y.push({ width: o._cWidth * g, src: Z(e, t, s, o, g) })
      }
    }
    Be(v)
  } else
    for (const c of h) {
      const o = Object.keys(n)[0]
      let g = o ? Y(o, String(n[o]), l, u, e) : void 0
      ;(g === void 0 &&
        (g = {
          size: '',
          screenMaxWidth: 0,
          _cWidth: s.modifiers?.width,
          _cHeight: s.modifiers?.height,
        }),
        y.push({ width: c, src: Z(e, t, s, g, c) }))
    }
  Fe(y)
  const x = y[y.length - 1],
    b = v.length ? v.map((c) => `${c.media ? c.media + ' ' : ''}${c.size}`).join(', ') : void 0,
    w = b ? 'w' : 'x',
    I = y.map((c) => `${c.src} ${c.width}${w}`).join(', ')
  return { sizes: b, srcset: I, src: x?.src }
}
function Y(e, t, s, r, i) {
  const a = (i.options.screens && i.options.screens[e]) || Number.parseInt(e),
    l = t.endsWith('vw')
  if ((!l && /^\d+$/.test(t) && (t = t + 'px'), !l && !t.endsWith('px'))) return
  let n = Number.parseInt(t)
  if (!a || !n) return
  l && (n = Math.round((n / 100) * a))
  const m = r ? Math.round(n * r) : s
  return { size: t, screenMaxWidth: a, _cWidth: n, _cHeight: m }
}
function Z(e, t, s, r, i) {
  return e.$img(
    t,
    {
      ...s.modifiers,
      width: r._cWidth ? r._cWidth * i : void 0,
      height: r._cHeight ? r._cHeight * i : void 0,
    },
    s
  )
}
function Be(e) {
  e.sort((s, r) => s.screenMaxWidth - r.screenMaxWidth)
  let t = null
  for (let s = e.length - 1; s >= 0; s--) {
    const r = e[s]
    ;(r.media === t && e.splice(s, 1), (t = r.media))
  }
  for (let s = 0; s < e.length; s++) e[s].media = e[s + 1]?.media || ''
}
function Fe(e) {
  e.sort((s, r) => s.width - r.width)
  let t = null
  for (let s = e.length - 1; s >= 0; s--) {
    const r = e[s]
    ;(r.width === t && e.splice(s, 1), (t = r.width))
  }
}
function ne(e) {
  let t
  return () => t || ((t = typeof e == 'function' ? e() : e), t)
}
const oe = Ne({
    keyMap: {
      format: 'f',
      width: 'w',
      height: 'h',
      resize: 's',
      quality: 'q',
      background: 'b',
      position: 'pos',
    },
    formatter: (e, t) => K(e) + '_' + K(t.toString()),
  }),
  Oe = ne({
    validateDomains: !0,
    supportsAlias: !0,
    getImage: (e, { modifiers: t, baseURL: s }, r) => {
      t.width &&
        t.height &&
        ((t.resize = `${t.width}x${t.height}`), delete t.width, delete t.height)
      const i = oe(t) || '_'
      return (s || (s = W(r.options.nuxt.baseURL, '/_ipx')), { url: W(s, i, X(e)) })
    },
  }),
  Ue = ne({
    validateDomains: !0,
    supportsAlias: !0,
    getImage(e, { modifiers: t, baseURL: s }, r) {
      t.width &&
        t.height &&
        ((t.resize = `${t.width}x${t.height}`), delete t.width, delete t.height)
      const i = oe(t) || '_'
      return (
        s || (s = W(r.options.nuxt.baseURL, '/_ipx')),
        { url: W(s, i, X(e).replace(/\/{2,}/g, '/')) }
      )
    },
  }),
  Ge = {
    screens: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536, xs: 320, xxl: 1536 },
    presets: {
      avatar: { modifiers: { format: 'webp', width: 100, height: 100, quality: 75 } },
      background: { modifiers: { format: 'webp', quality: 70 } },
      thumbnail: { modifiers: { format: 'webp', width: 200, quality: 70 } },
      icon: { modifiers: { format: 'webp', width: 64, height: 64, quality: 80 } },
      hero: { modifiers: { format: 'webp', quality: 75, width: 1200 } },
      lqip: { modifiers: { format: 'webp', quality: 20, width: 20, height: 20, blur: 5 } },
    },
    provider: 'ipxStatic',
    domains: [],
    alias: {},
    densities: [1, 2],
    format: ['webp', 'avif', 'webp'],
    quality: 80,
    provider: 'ipxStatic',
    providers: { ipx: { setup: Oe, defaults: void 0 }, ipxStatic: { setup: Ue, defaults: {} } },
  },
  le = (e) => {
    const t = pe(),
      s = ee()
    return (
      s.$img ||
      s._img ||
      (s._img = Le({
        ...Ge,
        event: s.ssrContext?.event,
        nuxt: { baseURL: t.app.baseURL },
        runtimeConfig: t,
      }))
    )
  }
function Te(e) {
  performance?.mark?.('mark_feature_usage', { detail: { feature: e } })
}
const He = (e) => {
    const t = le(),
      s = _(() => ({ provider: e.provider, preset: e.preset })),
      r = _(() => ({
        width: C(e.width),
        height: C(e.height),
        crossorigin: e.crossorigin === !0 ? 'anonymous' : e.crossorigin || void 0,
        nonce: e.nonce,
      })),
      i = _(() => ({
        ...e.modifiers,
        width: e.width,
        height: e.height,
        format: e.format,
        quality: e.quality || t.options.quality,
        background: e.background,
        fit: e.fit,
      }))
    return { providerOptions: s, normalizedAttrs: r, imageModifiers: i }
  },
  Ve = ['src'],
  Ke = {
    __name: 'NuxtImg',
    props: {
      custom: { type: Boolean, required: !1 },
      placeholder: { type: [Boolean, String, Number, Array], required: !1 },
      placeholderClass: { type: String, required: !1 },
      src: { type: String, required: !1 },
      format: { type: String, required: !1 },
      quality: { type: [String, Number], required: !1 },
      background: { type: String, required: !1 },
      fit: { type: String, required: !1 },
      modifiers: { type: Object, required: !1 },
      preset: { type: String, required: !1 },
      provider: { type: null, required: !1 },
      sizes: { type: [String, Object], required: !1 },
      densities: { type: String, required: !1 },
      preload: { type: [Boolean, Object], required: !1 },
      width: { type: [String, Number], required: !1 },
      height: { type: [String, Number], required: !1 },
      crossorigin: { type: [String, Boolean], required: !1 },
      nonce: { type: String, required: !1 },
    },
    emits: ['load', 'error'],
    setup(e, { expose: t, emit: s }) {
      const r = e,
        i = s,
        a = le(),
        { providerOptions: l, normalizedAttrs: n, imageModifiers: m } = He(r),
        h = _(() =>
          a.getSizes(r.src, {
            ...l.value,
            sizes: r.sizes,
            densities: r.densities,
            modifiers: m.value,
          })
        ),
        u = M(!1),
        v = ve(),
        y = _(() => ({
          ...n.value,
          'data-nuxt-img': '',
          ...(!r.placeholder || u.value ? { sizes: h.value.sizes, srcset: h.value.srcset } : {}),
          ...v,
        })),
        x = _(() => {
          if (u.value) return !1
          const o = r.placeholder === '' ? [10, 10] : r.placeholder
          if (!o) return !1
          if (typeof o == 'string') return o
          const [g = 10, j = g, P = 50, R = 3] = Array.isArray(o)
            ? o
            : typeof o == 'number'
              ? [o]
              : []
          return a(r.src, { ...m.value, width: g, height: j, quality: P, blur: R }, l.value)
        }),
        b = _(() => (r.sizes ? h.value.src : a(r.src, m.value, l.value))),
        w = _(() => x.value || b.value),
        I = ee().isHydrating,
        c = _e('imgEl')
      return (
        t({ imgEl: c }),
        te(() => {
          if (x.value || r.custom) {
            const o = new Image()
            ;(b.value && (o.src = b.value),
              r.sizes && ((o.sizes = h.value.sizes || ''), (o.srcset = h.value.srcset)),
              o.decode
                ? o
                    .decode()
                    .then(() => {
                      ;((u.value = !0), i('load', new Event('load')))
                    })
                    .catch((g) => {
                      i('error', g)
                    })
                : ((o.onload = (g) => {
                    ;((u.value = !0), i('load', g))
                  }),
                  (o.onerror = (g) => {
                    i('error', g)
                  })),
              Te('nuxt-image'))
            return
          }
          c.value &&
            (c.value.complete &&
              I &&
              (c.value.getAttribute('data-error')
                ? i('error', new Event('error'))
                : i('load', new Event('load'))),
            (c.value.onload = (o) => {
              i('load', o)
            }),
            (c.value.onerror = (o) => {
              i('error', o)
            }))
        }),
        (o, g) =>
          e.custom
            ? ye(
                o.$slots,
                'default',
                we(J({ key: 1 }, { imgAttrs: y.value, isLoaded: u.value, src: w.value }))
              )
            : ($(),
              A(
                'img',
                J(
                  {
                    key: 0,
                    ref_key: 'imgEl',
                    ref: c,
                    class: x.value ? e.placeholderClass : void 0,
                  },
                  y.value,
                  { src: w.value }
                ),
                null,
                16,
                Ve
              ))
      )
    },
  },
  Je = Object.assign(Ke, { __name: 'NuxtImg' }),
  Qe = { key: 0, class: 'spinner__label' },
  Ye = re({
    __name: 'Spinner',
    props: {
      size: { default: 'md' },
      label: { default: '' },
      overlay: { type: Boolean, default: !1 },
    },
    setup(e) {
      return (t, s) => (
        $(),
        A(
          'div',
          { class: N(['spinner', [`spinner--${e.size}`, { 'spinner--overlay': e.overlay }]]) },
          [
            s[0] || (s[0] = f('div', { class: 'spinner__circle' }, null, -1)),
            e.label ? ($(), A('span', Qe, q(e.label), 1)) : O('', !0),
          ],
          2
        )
      )
    },
  }),
  Ze = Object.assign(se(Ye, [['__scopeId', 'data-v-bb3bd1f0']]), { __name: 'Spinner' }),
  Xe = { class: 'round-start-page' },
  et = { class: 'top-bar' },
  tt = { class: 'round-indicator', 'data-testid': 'round-indicator' },
  rt = { class: 'round-text' },
  st = { class: 'container' },
  it = { key: 0, class: 'flip-through-layout', 'data-testid': 'flip-container' },
  at = { class: 'flip-section' },
  nt = { class: 'flip-label' },
  ot = { class: 'flip-window', 'data-testid': 'flip-category' },
  lt = { class: 'flip-icon' },
  ct = { class: 'flip-text' },
  dt = { class: 'flip-section' },
  ut = { class: 'flip-label' },
  ft = { class: 'flip-window', 'data-testid': 'flip-letter' },
  mt = { class: 'flip-text flip-letter-text' },
  gt = { key: 0, class: 'loading-container', 'data-testid': 'round-loading' },
  ht = { class: 'loading-text' },
  pt = re({
    __name: 'round-start',
    setup(e) {
      const { baseUrl: t, toast: s, t: r } = Ie(),
        { goToGame: i } = ze(),
        { gameStore: a } = $e(),
        { isFortuneWheelEnabled: l } = Se(),
        n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        m = M(null),
        h = M(null),
        u = M(!1),
        v = {
          female_name: '👩',
          male_name: '👨',
          water_vehicle: '⛵',
          flowers: '🌸',
          plants: '🌿',
          profession: '👔',
          insect: '🐛',
          animal: '🦁',
          city: '🏙️',
          country: '🌍',
          food: '🍕',
          drink: '🧃',
          sport: '⚽',
          music: '🎵',
          movie: '🎬',
        },
        y = M([]),
        x = M(!1),
        b = M(!1),
        w = M(null),
        I = M('A'),
        c = _(() => (w.value && v[w.value.searchWord]) || '📦'),
        o = _(() => (w.value ? r(`categories.${w.value.searchWord}`, w.value.name) : '')),
        g = _(() => I.value),
        j = _(() => {
          const d = a.currentSession.value
          return d
            ? d.roundHistory.length >= d.currentRound
              ? d.currentRound + 1
              : d.currentRound
            : 1
        })
      function P(d, z, k) {
        return new Promise((S) => {
          const D = Math.floor(Math.random() * d.length),
            E = d[D],
            ce = Date.now(),
            G = 50,
            de = 400
          let T = 0
          function H() {
            const B = Date.now() - ce,
              L = Math.min(B / z, 1),
              ue = L * L,
              fe = G + (de - G) * ue
            if (B - T >= fe)
              if (((T = B), L < 0.85)) {
                const me = Math.floor(Math.random() * d.length)
                k(d[me])
              } else k(E)
            L < 1 ? requestAnimationFrame(H) : (k(E), S(E))
          }
          requestAnimationFrame(H)
        })
      }
      te(async () => {
        await a.fetchCategories()
        const d = a.categories.value
        if (!l.value) {
          const S = d[Math.floor(Math.random() * d.length)],
            D = n[Math.floor(Math.random() * n.length)]
          ;((m.value = S ?? null), (h.value = D ?? null), await R())
          return
        }
        y.value = d
        const z = await P(d, 2500, (S) => {
          w.value = S
        })
        ;((x.value = !0), (m.value = z), await new Promise((S) => setTimeout(S, 300)))
        const k = await P(n, 2e3, (S) => {
          I.value = S
        })
        ;((b.value = !0),
          (h.value = k),
          setTimeout(() => {
            R()
          }, be))
      })
      const R = async () => {
        if (!(!m.value || !h.value)) {
          u.value = !0
          try {
            await a.advanceToConfiguredRound(m.value, h.value)
            const d = a.currentSession.value?.id
            d ? await i(d) : await i()
          } catch (d) {
            ;(xe().error('Failed to start game:', d),
              (u.value = !1),
              s.error(r('game.error_starting', 'Failed to start game. Please try again.')))
          }
        }
      }
      return (
        Me({
          title: 'Round Start',
          meta: [{ name: 'description', content: 'Spinning for category and letter' }],
        }),
        (d, z) => {
          const k = Je,
            S = Ze
          return (
            $(),
            A('div', Xe, [
              F(
                k,
                {
                  src: `${p(t)}assets/alphabets/BACKGROUND.png`,
                  alt: 'Background',
                  class: 'page-bg',
                  format: 'webp',
                  quality: '80',
                  preset: 'background',
                  loading: 'eager',
                  preload: '',
                },
                null,
                8,
                ['src']
              ),
              f('div', et, [
                f('div', tt, [f('div', rt, q(p(r)('game.round', 'Round')) + ' ' + q(p(j)), 1)]),
              ]),
              f('div', st, [
                F(
                  ke,
                  { name: 'flip-fade' },
                  {
                    default: qe(() => [
                      p(l) && !p(u)
                        ? ($(),
                          A('div', it, [
                            f('div', at, [
                              f('div', nt, q(p(r)('common.category', 'Category')), 1),
                              f('div', ot, [
                                f(
                                  'div',
                                  { class: N(['flip-track', { settled: p(x) }]) },
                                  [
                                    f(
                                      'div',
                                      { class: N(['flip-item', { active: p(x) }]) },
                                      [f('span', lt, q(p(c)), 1), f('span', ct, q(p(o)), 1)],
                                      2
                                    ),
                                  ],
                                  2
                                ),
                              ]),
                            ]),
                            f('div', dt, [
                              f('div', ut, q(p(r)('common.letter', 'Letter')), 1),
                              f('div', ft, [
                                f(
                                  'div',
                                  { class: N(['flip-track', { settled: p(b) }]) },
                                  [
                                    f(
                                      'div',
                                      { class: N(['flip-item', { active: p(b) }]) },
                                      [f('span', mt, q(p(g)), 1)],
                                      2
                                    ),
                                  ],
                                  2
                                ),
                              ]),
                            ]),
                          ]))
                        : O('', !0),
                    ]),
                    _: 1,
                  }
                ),
                p(u)
                  ? ($(),
                    A('div', gt, [
                      F(S),
                      f('p', ht, q(p(r)('home.starting_game', 'Starting game...')), 1),
                    ]))
                  : O('', !0),
              ]),
            ])
          )
        }
      )
    },
  }),
  bt = se(pt, [['__scopeId', 'data-v-26f2d39a']])
export { bt as default }
