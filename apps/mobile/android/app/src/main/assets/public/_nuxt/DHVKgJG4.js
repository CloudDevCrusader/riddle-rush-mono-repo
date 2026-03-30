import { a as u } from './CidDxH3v.js'
import { c as p, t as x } from './U51DJ_Qi.js'
import { i as _ } from './CSKNA-QO.js'
import { i as a } from './C3e4t58V.js'
function z(r, s, d, g) {
  if (!a(r)) return r
  s = p(s, r)
  for (var n = -1, f = s.length, e = f - 1, t = r; t != null && ++n < f; ) {
    var i = x(s[n]),
      o = d
    if (i === '__proto__' || i === 'constructor' || i === 'prototype') return r
    if (n != e) {
      var m = t[i]
      ;((o = void 0), o === void 0 && (o = a(m) ? m : _(s[n + 1]) ? [] : {}))
    }
    ;(u(t, i, o), (t = t[i]))
  }
  return r
}
export { z as b }
