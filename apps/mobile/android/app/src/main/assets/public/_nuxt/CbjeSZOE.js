import { u as c, X as h, v as g, ak as l } from './BI8BVXPj.js'
function $() {
  const e = c(),
    { t: o } = h(),
    n = g().public.baseUrl || '',
    r = (() => {
      const t = String(n || '').trim()
      if (!t) return '/'
      if (t.startsWith('http://') || t.startsWith('https://')) return t.endsWith('/') ? t : `${t}/`
      const s = t.startsWith('/') ? t : `/${t}`
      return s.endsWith('/') ? s : `${s}/`
    })(),
    i = l()
  return {
    router: e,
    t: o,
    baseUrl: r,
    getAssetPath: (t) => {
      if (!t) return ''
      if (t.startsWith('http://') || t.startsWith('https://')) return t
      const s = t.startsWith('assets/') ? t.substring(7) : t
      if (!n || n === '/' || n === '') return `/${s}`
      const a = r.endsWith('/') ? r.slice(0, -1) : r,
        u = s.startsWith('/') ? s.substring(1) : s
      return `${a}/${u}`
    },
    toast: i,
    goHome: () => e.push('/'),
    goBack: () => {
      window.history.length > 1 ? e.back() : e.push('/')
    },
  }
}
export { $ as u }
