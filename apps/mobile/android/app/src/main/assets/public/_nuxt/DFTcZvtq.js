import { b as d } from './WcLdQdlA.js'
function g(n, e) {
  var t = -1,
    l = n.length,
    h = l - 1
  for (e = e === void 0 ? l : e; ++t < e; ) {
    var f = d(t, h),
      o = n[f]
    ;((n[f] = n[t]), (n[t] = o))
  }
  return ((n.length = e), n)
}
export { g as s }
