/* Keystone — core namespace + small utilities. Loaded first. */
(function () {
  'use strict';
  const KS = (window.KS = window.KS || {});
  KS.version = '1.0.0';

  // ---------- DOM helpers ----------
  function append(el, kid) {
    if (kid == null || kid === false || kid === true) return;
    if (Array.isArray(kid)) { for (let i = 0; i < kid.length; i++) append(el, kid[i]); return; }
    if (kid instanceof Node) { el.appendChild(kid); return; }
    el.appendChild(document.createTextNode(String(kid)));
  }
  function setAttrs(el, attrs) {
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') { if (v) el.setAttribute('class', ((el.getAttribute('class') || '') + ' ' + v).trim()); }
      else if (k === 'style') {
        if (typeof v === 'string') el.style.cssText += ';' + v;
        else for (const s in v) { if (s.indexOf('--') === 0) el.style.setProperty(s, v[s]); else el.style[s] = v[s]; }
      }
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'dataset') { for (const d in v) el.dataset[d] = v[d]; }
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  function make(ns, sel, args) {
    const m = sel.match(/^[a-zA-Z0-9-]+/);
    const tag = m ? m[0] : 'div';
    const el = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
    const rest = sel.slice(m ? m[0].length : 0);
    const cls = [];
    rest.replace(/([.#])([\w-]+)/g, function (_, t, name) { if (t === '.') cls.push(name); else el.id = name; return ''; });
    if (cls.length) el.setAttribute('class', cls.join(' '));
    let i = 0;
    const a = args[0];
    if (a && typeof a === 'object' && !(a instanceof Node) && !Array.isArray(a)) { setAttrs(el, a); i = 1; }
    for (; i < args.length; i++) append(el, args[i]);
    return el;
  }
  /** Hyperscript: KS.h('div.card#x', {onclick: fn}, child, 'text', [more]) */
  KS.h = function (sel) { return make(null, sel, Array.prototype.slice.call(arguments, 1)); };
  /** Same, for SVG elements. */
  KS.s = function (sel) { return make('http://www.w3.org/2000/svg', sel, Array.prototype.slice.call(arguments, 1)); };
  KS.$ = function (sel, root) { return (root || document).querySelector(sel); };
  KS.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  KS.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };

  KS.esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  KS.slug = function (s) {
    return String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };
  /** Remove common leading indentation (for template-literal content) and trim blank edges. */
  KS.dedent = function (text) {
    const lines = String(text == null ? '' : text).replace(/\r/g, '').replace(/\t/g, '  ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    let min = Infinity;
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const ind = lines[i].match(/^ */)[0].length;
      if (ind < min) min = ind;
    }
    if (!isFinite(min)) min = 0;
    // Strict + idempotent: every non-blank line counts, so already-dedented text is left alone.
    return lines.map(function (l) { return l.slice(Math.min(min, l.match(/^ */)[0].length)); }).join('\n');
  };

  // ---------- randomness ----------
  KS.rng = function (seed) {
    let hsh = 1779033703 ^ String(seed).length;
    const str = String(seed);
    for (let i = 0; i < str.length; i++) { hsh = Math.imul(hsh ^ str.charCodeAt(i), 3432918353); hsh = (hsh << 13) | (hsh >>> 19); }
    let a = hsh >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  KS.shuffle = function (arr, rnd) {
    const a = arr.slice(); const r = rnd || Math.random;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  KS.pick = function (arr, rnd) { return arr[Math.floor((rnd || Math.random)() * arr.length)]; };
  KS.sampleN = function (arr, n, rnd) { return KS.shuffle(arr, rnd).slice(0, n); };
  KS.clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };

  // ---------- dates ----------
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  KS.dateStr = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  KS.today = function () { return KS.dateStr(new Date()); };
  /** Whole days since epoch for a local date string (or today). */
  KS.dayNum = function (s) {
    const p = (s || KS.today()).split('-');
    return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5);
  };
  KS.dayFromNum = function (n) { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); };

  // ---------- formatting ----------
  KS.fmtNum = function (n) { return Math.round(n).toLocaleString('en-GB'); };
  KS.fmtBig = function (n) {
    if (!isFinite(n)) return String(n);
    const a = Math.abs(n);
    const units = [[1e15, ' quadrillion'], [1e12, ' trillion'], [1e9, ' billion'], [1e6, ' million'], [1e3, ' thousand']];
    for (let i = 0; i < units.length; i++) if (a >= units[i][0]) return trim(n / units[i][0]) + units[i][1];
    if (a >= 1) return trim(n);
    if (a === 0) return '0';
    return String(+n.toPrecision(2));
    function trim(x) { return String(+x.toPrecision(x >= 100 ? 3 : 2)); }
  };
  KS.plural = function (n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); };

  // ---------- event bus ----------
  const subs = {};
  KS.bus = {
    on: function (evt, fn) { (subs[evt] = subs[evt] || []).push(fn); return function () { KS.bus.off(evt, fn); }; },
    off: function (evt, fn) { const l = subs[evt]; if (!l) return; const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); },
    emit: function (evt, data) { (subs[evt] || []).slice().forEach(function (fn) { try { fn(data); } catch (e) { console.error('[bus]', evt, e); } }); }
  };

  KS.debounce = function (fn, ms) {
    let t = null;
    const d = function () { const args = arguments; clearTimeout(t); t = setTimeout(function () { t = null; fn.apply(null, args); }, ms); };
    d.flush = function () { if (t) { clearTimeout(t); t = null; fn(); } };
    return d;
  };

  KS.isTouch = (function () { try { return window.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } })();
  KS.reduceMotion = function () {
    try { if (KS.store && KS.store.state && KS.store.state.settings.motion === false) return true; return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  };
  KS.shell = 'studio'; // set by each shell on boot: 'studio' | 'pocket'
})();
