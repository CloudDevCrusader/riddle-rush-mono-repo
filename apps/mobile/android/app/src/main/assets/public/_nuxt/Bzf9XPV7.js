import { L as n, M as l } from './D5tTST1k.js'
import { M as p } from './CynwsF02.js'
import { r as h } from './DBIYhhxi.js'
import { a as f } from './lnK5TCUO.js'
import { i as c } from './Dxzbedgu.js'
import { k as m } from './BBGyBqoE.js'
function y() {
  ;((this.__data__ = new n()), (this.size = 0))
}
function d(t) {
  var e = this.__data__,
    r = e.delete(t)
  return ((this.size = e.size), r)
}
function v(t) {
  return this.__data__.get(t)
}
function g(t) {
  return this.__data__.has(t)
}
var z = 200
function A(t, e) {
  var r = this.__data__
  if (r instanceof n) {
    var a = r.__data__
    if (!p || a.length < z - 1) return (a.push([t, e]), (this.size = ++r.size), this)
    r = this.__data__ = new l(a)
  }
  return (r.set(t, e), (this.size = r.size), this)
}
function s(t) {
  var e = (this.__data__ = new n(t))
  this.size = e.size
}
s.prototype.clear = y
s.prototype.delete = d
s.prototype.get = v
s.prototype.has = g
s.prototype.set = A
var P = h.Uint8Array
function k(t, e, r) {
  var a = e(t)
  return c(t) ? a : f(a, r(t))
}
function S(t, e) {
  for (var r = -1, a = t == null ? 0 : t.length, u = 0, i = []; ++r < a; ) {
    var o = t[r]
    e(o, r, t) && (i[u++] = o)
  }
  return i
}
function b() {
  return []
}
var w = Object.prototype,
  E = w.propertyIsEnumerable,
  _ = Object.getOwnPropertySymbols,
  G = _
    ? function (t) {
        return t == null
          ? []
          : ((t = Object(t)),
            S(_(t), function (e) {
              return E.call(t, e)
            }))
      }
    : b
function R(t) {
  return k(t, m, G)
}
export { s as S, P as U, G as a, k as b, R as g, b as s }
