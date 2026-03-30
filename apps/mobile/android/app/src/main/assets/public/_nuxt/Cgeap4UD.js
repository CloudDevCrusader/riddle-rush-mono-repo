import { a as g } from './C-dqCLl5.js'
import { b } from './4U2qEZts.js'
import { b as A } from './DLe41Fci.js'
import { b as B } from './BBCDoTjr.js'
import { i as M } from './Cqt4AUNF.js'
import { b as k } from './CA2VU3DF.js'
import { i as d } from './D0PfgovT.js'
import { i as w } from './DKeuBCMA.js'
import { i as a } from './Dxzbedgu.js'
import './U51DJ_Qi.js'
import './D5tTST1k.js'
import './CynwsF02.js'
import './J4-gmw-T.js'
import './DBIYhhxi.js'
import './C3e4t58V.js'
import './DPGIUuQ3.js'
import './Bzf9XPV7.js'
import './lnK5TCUO.js'
import './BBGyBqoE.js'
import './2pf-zKNd.js'
import './nLWjQ9zq.js'
import './CSKNA-QO.js'
import './DvHZi-k3.js'
import './BPYkuyjI.js'
import './B39m6GhF.js'
import './BoesD0Uv.js'
import './BO7A7iTJ.js'
import './sTmZi9vC.js'
import './No4hATv0.js'
import './BLd32nMJ.js'
function C(n, r) {
  var i = -1,
    p = M(n) ? Array(n.length) : []
  return (
    B(n, function (u, m, t) {
      p[++i] = r(u, m, t)
    }),
    p
  )
}
function L(n, r) {
  var i = n.length
  for (n.sort(r); i--; ) n[i] = n[i].value
  return n
}
function x(n, r) {
  if (n !== r) {
    var i = n !== void 0,
      p = n === null,
      u = n === n,
      m = d(n),
      t = r !== void 0,
      c = r === null,
      f = r === r,
      o = d(r)
    if ((!c && !o && !m && n > r) || (m && t && f && !c && !o) || (p && t && f) || (!i && f) || !u)
      return 1
    if ((!p && !m && !o && n < r) || (o && i && u && !p && !m) || (c && i && u) || (!t && u) || !f)
      return -1
  }
  return 0
}
function y(n, r, i) {
  for (var p = -1, u = n.criteria, m = r.criteria, t = u.length, c = i.length; ++p < t; ) {
    var f = x(u[p], m[p])
    if (f) {
      if (p >= c) return f
      var o = i[p]
      return f * (o == 'desc' ? -1 : 1)
    }
  }
  return n.index - r.index
}
function E(n, r, i) {
  r.length
    ? (r = g(r, function (m) {
        return a(m)
          ? function (t) {
              return b(t, m.length === 1 ? m[0] : m)
            }
          : m
      }))
    : (r = [w])
  var p = -1
  r = g(r, k(A))
  var u = C(n, function (m, t, c) {
    var f = g(r, function (o) {
      return o(m)
    })
    return { criteria: f, index: ++p, value: m }
  })
  return L(u, function (m, t) {
    return y(m, t, i)
  })
}
function rr(n, r, i, p) {
  return n == null
    ? []
    : (a(r) || (r = r == null ? [] : [r]),
      (i = p ? void 0 : i),
      a(i) || (i = i == null ? [] : [i]),
      E(n, r, i))
}
export { rr as default }
