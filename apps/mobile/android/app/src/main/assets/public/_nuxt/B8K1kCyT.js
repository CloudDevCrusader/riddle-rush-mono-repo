import { a as s } from './lnK5TCUO.js'
import { S as m } from './DBIYhhxi.js'
import { i as h } from './2pf-zKNd.js'
import { i as l } from './Dxzbedgu.js'
import './nLWjQ9zq.js'
var a = m ? m.isConcatSpreadable : void 0
function p(n) {
  return l(n) || h(n) || !!(a && n && n[a])
}
function b(n, r, i, g, t) {
  var e = -1,
    f = n.length
  for (i || (i = p), t || (t = []); ++e < f; ) {
    var o = n[e]
    i(o) ? s(t, o) : (t[t.length] = o)
  }
  return t
}
function F(n) {
  var r = n == null ? 0 : n.length
  return r ? b(n) : []
}
export { F as default }
