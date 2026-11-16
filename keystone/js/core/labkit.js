/* Keystone — lab kit: registry, frame (goals/help), and UI helpers every simulation shares. See docs/LAB_GUIDE.md */
(function () {
  'use strict';
  const KS = window.KS, h = KS.h, s = KS.s, S = KS.store;
  const L = (KS.labs = {});
  const defs = {}; const order = [];

  /**
   * KS.labs.register({ id, title, emoji, blurb, tags: [], goals: [{id, text}], help: 'markdown', mount(root, api) { ...; return cleanup } })
   */
  L.register = function (def) { if (!defs[def.id]) order.push(def.id); defs[def.id] = def; };
  L.get = function (id) { return defs[id] || null; };
  L.list = function () {
    const files = KS.labFiles || []; const rank = function (id) { const i = files.indexOf(id); return i < 0 ? 999 : i; };
    return order.slice().sort(function (x, y) { return rank(x) - rank(y); }).map(function (id) { return defs[id]; });
  };
  // Lab scripts are loaded lazily from js/labs/<id>.js (list in js/labs/manifest.js) so the app starts fast.
  let ready = null;
  L.whenReady = function () {
    if (ready) return ready;
    const files = (KS.labFiles || []).slice();
    ready = new Promise(function (resolve) {
      let left = files.length;
      const done = function () { if (--left <= 0) { L.allReady = true; KS.bus.emit('labs:ready'); resolve(); } };
      if (!left) { left = 1; done(); return; }
      files.forEach(function (name) {
        const el = document.createElement('script'); el.src = 'js/labs/' + name + '.js?v=' + KS.version; el.async = true;
        el.onload = done; el.onerror = done; document.head.appendChild(el);
      });
    });
    return ready;
  };
  L.goalDone = function (labId, goalId) { const g = S.state.labs[labId]; return !!(g && g[goalId]); };
  L.progress = function (labId) { const d = defs[labId]; if (!d) return { done: 0, total: 0 }; const goals = d.goals || []; let done = 0; goals.forEach(function (g) { if (L.goalDone(labId, g.id)) done++; }); return { done: done, total: goals.length }; };
  L.isComplete = function (labId) { const p = L.progress(labId); return p.total > 0 && p.done === p.total; };

  /**
   * Mount a lab into host. opts: { embedded, onGoal(goalId), onComplete(), fresh }
   * `fresh: true` shows goals as not-yet-done for this run (lesson context) while still saving them.
   */
  L.mount = function (host, id, opts) {
    opts = opts || {};
    const def = defs[id];
    if (!def) { host.appendChild(KS.ui.empty('🧪', 'Lab not found', 'This lab is not available yet.')); return { destroy: function () {} }; }
    const timers = [], rafs = [], cleanups = []; let dead = false;
    const runDone = {}; // goals completed during this mount
    const goalEls = {};
    const goals = def.goals || [];
    const isDone = function (g) { return opts.fresh ? !!runDone[g.id] : L.goalDone(id, g.id); };
    const goalList = h('ul.lab-goals');
    goals.forEach(function (g) {
      const li = h('li.lab-goal' + (isDone(g) ? '.done' : ''), h('span.lab-goal-box', isDone(g) ? '✓' : ''), h('span', { html: KS.md.inline(g.text) }));
      goalEls[g.id] = li; goalList.appendChild(li);
    });
    const root = h('div.lab-root');
    const frame = h('div.lab' + (opts.embedded ? '.embedded' : '') , { dataset: { lab: id } },
      h('div.lab-head', h('div.lab-emoji', def.emoji || '🧪'), h('div.lab-head-main', h('h2.lab-title', def.title), def.blurb ? h('p.lab-blurb', def.blurb) : null)),
      goals.length ? h('div.lab-goalbox', h('div.lab-goal-title', '🎯 Try to…'), goalList) : null,
      root,
      def.help ? h('details.lab-help', h('summary', '💡 What am I looking at?'), KS.mdEl(def.help)) : null);
    host.appendChild(frame);

    const api = {
      id: id, h: h, s: s, ui: L.ui, root: root, compact: !!opts.compact || host.clientWidth < 560,
      goal: function (gid) {
        if (dead || !goalEls[gid]) return;
        const first = !L.goalDone(id, gid);
        if (first) { (S.state.labs[id] = S.state.labs[id] || {})[gid] = Date.now(); S.save(); }
        if (runDone[gid] && !first) return;
        const was = runDone[gid]; runDone[gid] = true;
        const li = goalEls[gid];
        if (!li.classList.contains('done')) { li.classList.add('done', 'just'); li.firstChild.textContent = '✓'; KS.ui.sfx('good'); KS.ui.buzz(14); setTimeout(function () { li.classList.remove('just'); }, 900); }
        if (first && KS.game) KS.game.award(10, { anchor: li });
        if (!was && opts.onGoal) opts.onGoal(gid);
        const all = goals.every(function (g) { return isDone(g); });
        if (all && !api._completed) { api._completed = true; frame.classList.add('complete'); if (opts.onComplete) opts.onComplete(); if (KS.game) KS.game.queueCheck(); }
      },
      goalDone: function (gid) { return !!runDone[gid] || (!opts.fresh && L.goalDone(id, gid)); },
      every: function (ms, fn) { const t = setInterval(function () { if (!dead) fn(); }, ms); timers.push(function () { clearInterval(t); }); return function () { clearInterval(t); }; },
      after: function (ms, fn) { const t = setTimeout(function () { if (!dead) fn(); }, ms); timers.push(function () { clearTimeout(t); }); return function () { clearTimeout(t); }; },
      /** Animation loop: fn(dtSeconds, tSeconds). Returns stop(). Uses requestAnimationFrame, with a slow timer
       *  as a safety net so simulations still advance when the tab is in the background. */
      loop: function (fn) {
        let last = performance.now(); const start = last; let rid = 0, tid = 0, stopped = false;
        function frame() {
          if (dead || stopped) return; cancelAnimationFrame(rid); clearTimeout(tid);
          const now = performance.now(); const dt = Math.min(0.25, (now - last) / 1000); last = now;
          try { fn(dt, (now - start) / 1000); } catch (e) { console.error('[lab ' + id + '] loop', e); stopped = true; return; }
          rid = requestAnimationFrame(frame); tid = setTimeout(frame, 250);
        }
        rid = requestAnimationFrame(frame); tid = setTimeout(frame, 250);
        const stop = function () { stopped = true; cancelAnimationFrame(rid); clearTimeout(tid); }; rafs.push(stop); return stop;
      },
      sleep: function (ms) { return new Promise(function (res) { const t = setTimeout(res, KS.reduceMotion() ? Math.min(ms, 60) : ms); timers.push(function () { clearTimeout(t); }); }); },
      onCleanup: function (fn) { cleanups.push(fn); },
      toast: KS.ui.toast, sfx: KS.ui.sfx,
      alive: function () { return !dead; }
    };
    if (!opts.fresh && goals.length && goals.every(function (g) { return L.goalDone(id, g.id); })) { api._completed = true; frame.classList.add('complete'); }
    let cleanup = null;
    try { cleanup = def.mount(root, api); }
    catch (e) { console.error('[lab ' + id + ']', e); root.appendChild(KS.ui.empty('💥', 'This lab crashed on start', String(e && e.message || e))); }
    return {
      el: frame, api: api,
      destroy: function () {
        if (dead) return; dead = true;
        timers.forEach(function (f) { f(); }); rafs.forEach(function (f) { f(); }); cleanups.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } });
        if (typeof cleanup === 'function') try { cleanup(); } catch (e) { /* ignore */ }
        frame.remove();
      }
    };
  };

  // ====================================================================
  // UI helpers shared by all labs (keep labs small + consistent)
  // ====================================================================
  const ui = (L.ui = {});
  ui.panel = function (title) { const kids = Array.prototype.slice.call(arguments, 1); return h('section.lab-panel', title ? h('h4.lab-panel-title', title) : null, kids); };
  ui.row = function () { return h('div.lab-row', Array.prototype.slice.call(arguments)); };
  ui.btn = function (label, onClick, kind) { return h('button.btn' + (kind ? '.' + kind : ''), { type: 'button', onclick: onClick }, label); };
  ui.toggle = function (label, value, onChange) {
    const input = h('input', { type: 'checkbox' }); input.checked = !!value;
    input.addEventListener('change', function () { onChange(input.checked); });
    const el = h('label.lab-toggle', input, h('span.lab-toggle-track', h('span.lab-toggle-knob')), h('span.lab-toggle-label', label));
    el.set = function (v) { input.checked = !!v; }; el.get = function () { return input.checked; };
    return el;
  };
  /** ui.slider('Requests / sec', {min, max, step, value, fmt: v => v + ' rps'}, onChange) */
  ui.slider = function (label, o, onChange) {
    const out = h('span.lab-slider-val'); const fmt = o.fmt || function (v) { return String(v); };
    const input = h('input', { type: 'range', min: String(o.min), max: String(o.max), step: String(o.step || 1), value: String(o.value), 'aria-label': label });
    // Screen readers read the formatted value ("2 million users"), not the raw slider number ("6.3").
    const upd = function () { const t = fmt(+input.value); out.textContent = t; input.setAttribute('aria-valuetext', String(t)); };
    input.addEventListener('input', function () { upd(); onChange(+input.value); }); upd();
    const el = h('label.lab-slider', h('span.lab-slider-top', h('span', label), out), input);
    el.set = function (v) { input.value = String(v); upd(); }; el.get = function () { return +input.value; };
    return el;
  };
  /** ui.select('Algorithm', [['rr','Round robin'], ...] | ['a','b'], value, onChange) */
  ui.select = function (label, options, value, onChange) {
    const sel = h('select', { 'aria-label': label }, options.map(function (o) { const v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; const opt = h('option', { value: v }, t); if (v === value) opt.selected = true; return opt; }));
    sel.addEventListener('change', function () { onChange(sel.value); });
    const el = h('label.lab-select', label ? h('span', label) : null, sel);
    el.set = function (v) { sel.value = v; }; el.get = function () { return sel.value; };
    return el;
  };
  /** Segmented control: ui.seg([['a','Label A'], ['b','Label B']], 'a', onChange) */
  ui.seg = function (options, value, onChange) {
    // A group of toggle buttons (these are mode pickers, not tabs): the chosen one is aria-pressed.
    const el = h('div.lab-seg', { role: 'group' }); const btns = {};
    options.forEach(function (o) { const v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; const b = h('button', { type: 'button', onclick: function () { el.set(v); onChange(v); } }, t); btns[v] = b; el.appendChild(b); });
    el.set = function (v) { for (const k in btns) { btns[k].classList.toggle('on', k === v); btns[k].setAttribute('aria-pressed', String(k === v)); } el._v = v; };
    el.get = function () { return el._v; }; el.set(value);
    return el;
  };
  ui.input = function (label, value, onChange, attrs) {
    const input = h('input', Object.assign({ type: 'text', value: value == null ? '' : String(value), autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off' }, attrs || {}));
    input.addEventListener('input', function () { onChange(input.value); });
    const el = h('label.lab-input', label ? h('span', label) : null, input);
    el.set = function (v) { input.value = v; }; el.get = function () { return input.value; }; el.input = input;
    return el;
  };
  ui.textarea = function (label, value, onChange, rows) {
    const ta = h('textarea', { rows: String(rows || 4), spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off' }); ta.value = value == null ? '' : String(value);
    ta.addEventListener('input', function () { onChange(ta.value); });
    const el = h('label.lab-input', label ? h('span', label) : null, ta);
    el.set = function (v) { ta.value = v; }; el.get = function () { return ta.value; }; el.input = ta;
    return el;
  };
  /** Scrolling event log. log.add('text **md**', 'good'|'bad'|'warn'|'info'|'dim') */
  ui.log = function (max) {
    // role=log, but not announced line by line: busy simulations log every second. Goals are announced by toast.
    const el = h('div.lab-log', { role: 'log', 'aria-live': 'off', tabindex: '0', 'aria-label': 'Event log' }); max = max || 60;
    const api = { el: el, add: function (text, kind) { const row = h('div.lab-log-row' + (kind ? '.' + kind : ''), { html: KS.md.inline(text) }); el.appendChild(row); while (el.children.length > max) el.removeChild(el.firstChild); el.scrollTop = el.scrollHeight; return row; }, clear: function () { KS.clear(el); } };
    return api;
  };
  /** Big number + label. stat.set(value) */
  ui.stat = function (label, value, tone) {
    const v = h('div.lab-stat-val', value == null ? '–' : String(value));
    const el = h('div.lab-stat' + (tone ? '.tn-' + tone : ''), v, h('div.lab-stat-label', label));
    return { el: el, set: function (x, t) { v.textContent = String(x); if (t !== undefined) el.className = 'lab-stat' + (t ? ' tn-' + t : ''); } };
  };
  ui.stats = function () { return h('div.lab-stats', Array.prototype.slice.call(arguments).map(function (x) { return x.el || x; })); };
  /** Horizontal meter. meter.set(0..1, 'text', tone) */
  ui.meter = function (label) {
    const fill = h('div.lab-meter-fill'); const txt = h('span.lab-meter-txt');
    const el = h('div.lab-meter', h('div.lab-meter-top', h('span', label), txt), h('div.lab-meter-track', fill));
    return { el: el, set: function (p, text, tone) { fill.style.width = Math.round(KS.clamp(p, 0, 1) * 100) + '%'; fill.className = 'lab-meter-fill' + (tone ? ' tn-' + tone : ''); if (text != null) txt.textContent = text; } };
  };
  /** A box representing a machine/service. node.setState('ok'|'busy'|'down'|'warn'|'idle'), node.setSub('text'), node.badge('3') */
  ui.node = function (label, icon, opts) {
    opts = opts || {};
    const sub = h('div.lab-node-sub', opts.sub || ''); const badge = h('span.lab-node-badge');
    const el = h('div.lab-node' + (opts.tone ? '.tn-' + opts.tone : '') + (opts.small ? '.small' : ''), h('div.lab-node-ico', icon || '🖥️'), h('div.lab-node-label', label), sub, badge);
    el.setState = function (st) { el.dataset.state = st || ''; };
    el.setSub = function (t) { sub.textContent = t == null ? '' : String(t); };
    el.badge = function (t) { badge.textContent = t == null ? '' : String(t); badge.classList.toggle('on', t != null && t !== ''); };
    el.pulse = function (tone) { el.classList.remove('pulse-good', 'pulse-bad', 'pulse'); void el.offsetWidth; el.classList.add(tone === 'bad' ? 'pulse-bad' : tone === 'good' ? 'pulse-good' : 'pulse'); };
    if (opts.onClick) { el.classList.add('clickable'); el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.addEventListener('click', opts.onClick); el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onClick(e); } }); }
    return el;
  };
  /**
   * A positioned stage for nodes with animated packets and wires between them.
   * const st = ui.stage(); st.el (append nodes into st.el using normal layout, e.g. lab-cols)
   * st.wire(aEl, bEl, {dashed, tone})  → line between two nodes (auto re-drawn on resize)
   * st.send(aEl, bEl, {label, tone, ms}) → Promise resolved when the packet arrives
   */
  ui.stage = function (cls) {
    const svg = s('svg.lab-wires', { 'aria-hidden': 'true' });
    const el = h('div.lab-stage' + (cls ? '.' + cls : ''), svg);
    const wires = [];
    function center(node) { const r = node.getBoundingClientRect(), p = el.getBoundingClientRect(); return [r.left - p.left + r.width / 2 + el.scrollLeft, r.top - p.top + r.height / 2 + el.scrollTop]; }
    function redraw() {
      if (!el.isConnected) return;
      svg.setAttribute('width', el.scrollWidth); svg.setAttribute('height', el.scrollHeight);
      wires.forEach(function (w) { if (!w.a.isConnected || !w.b.isConnected) { w.line.style.display = 'none'; return; } w.line.style.display = ''; const a = center(w.a), b = center(w.b); w.line.setAttribute('x1', a[0]); w.line.setAttribute('y1', a[1]); w.line.setAttribute('x2', b[0]); w.line.setAttribute('y2', b[1]); });
    }
    let ro = null;
    try { ro = new ResizeObserver(function () { redraw(); }); ro.observe(el); } catch (e) { window.addEventListener('resize', redraw); }
    setTimeout(redraw, 0); setTimeout(redraw, 250);
    return {
      el: el, redraw: redraw,
      wire: function (a, b, o) { o = o || {}; const line = s('line.lab-wire' + (o.dashed ? '.dashed' : '') + (o.tone ? '.tn-' + o.tone : '')); svg.appendChild(line); const w = { a: a, b: b, line: line }; wires.push(w); setTimeout(redraw, 0); return { el: line, set: function (tone, dashed) { line.setAttribute('class', 'lab-wire' + (dashed ? ' dashed' : '') + (tone ? ' tn-' + tone : '')); }, remove: function () { line.remove(); wires.splice(wires.indexOf(w), 1); } }; },
      clearWires: function () { wires.forEach(function (w) { w.line.remove(); }); wires.length = 0; },
      send: function (a, b, o) {
        o = o || {};
        return new Promise(function (resolve) {
          if (!a.isConnected || !b.isConnected) return resolve();
          const p1 = center(a), p2 = center(b);
          const dot = h('div.lab-packet' + (o.tone ? '.tn-' + o.tone : '') + (o.label ? '.labelled' : ''), o.label || '');
          dot.style.left = p1[0] + 'px'; dot.style.top = p1[1] + 'px'; el.appendChild(dot);
          const ms = KS.reduceMotion() ? 1 : (o.ms || 520);
          let done = false; const fin = function () { if (done) return; done = true; dot.remove(); resolve(); };
          try {
            const an = dot.animate([{ transform: 'translate(-50%,-50%) translate(0,0)' }, { transform: 'translate(-50%,-50%) translate(' + (p2[0] - p1[0]) + 'px,' + (p2[1] - p1[1]) + 'px)' }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
            an.onfinish = fin; an.oncancel = fin;
          } catch (e) { fin(); }
          setTimeout(fin, ms + 120);
        });
      },
      destroy: function () { if (ro) ro.disconnect(); else window.removeEventListener('resize', redraw); }
    };
  };
  /** Layout helpers for stages: ui.cols(colA, colB, ...) each col = array of nodes or an element. */
  ui.cols = function () { return h('div.lab-cols', Array.prototype.slice.call(arguments).map(function (c) { return Array.isArray(c) ? h('div.lab-col', c) : c; })); };
  ui.col = function () { return h('div.lab-col', Array.prototype.slice.call(arguments)); };
  ui.note = function (md, tone) { return h('div.lab-note' + (tone ? '.tn-' + tone : ''), { html: KS.md(md) }); };
  /** Labs that use real cryptography call this first: on plain-http pages the browser hides Web Crypto,
   *  so show why the lab can't run (instead of buttons that silently do nothing). Returns true if it is missing. */
  L.hasWebCrypto = !!(typeof crypto !== 'undefined' && crypto && crypto.subtle);
  ui.needsWebCrypto = function (root) {
    if (L.hasWebCrypto) return false;
    root.appendChild(ui.note('This lab needs the browser\'s **Web Crypto** feature, which is only available on secure pages (https or localhost). Open the site that way to try it.', 'warn'));
    return true;
  };
  ui.kv = function (pairs) { return h('dl.lab-kv', pairs.map(function (p) { return [h('dt', p[0]), h('dd', { html: KS.md.inline(String(p[1])) })]; })); };
  ui.code = function (src, lang, opts) { return KS.codeBlock(src, lang, opts); };
  ui.tabs = function (tabs, onChange) { // tabs: [[id, label, renderFn(host)]]
    const body = h('div.lab-tab-body'); let cur = null;
    const seg = ui.seg(tabs.map(function (t) { return [t[0], t[1]]; }), tabs[0][0], function (v) { show(v); if (onChange) onChange(v); });
    function show(v) { cur = v; KS.clear(body); const t = tabs.filter(function (x) { return x[0] === v; })[0]; if (t && t[2]) t[2](body); }
    show(tabs[0][0]);
    return { el: h('div.lab-tabs', seg, body), show: function (v) { seg.set(v); show(v); }, current: function () { return cur; }, body: body };
  };
})();
