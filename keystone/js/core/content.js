/* Keystone — content registry: curriculum index, lazy module loading, glossary, search, question pools. */
(function () {
  'use strict';
  const KS = window.KS;
  const C = (KS.content = {
    worlds: [], modules: [], moduleById: {}, metaById: {}, order: [],
    lessons: {}, bosses: {}, sheets: {}, glossary: {}, glossaryList: [], loaded: {}, missing: {}
  });
  const pending = {};
  /** Called by content/curriculum-*.js to register a world (in learning order). */
  KS.world = function (w) { (KS.curriculum = KS.curriculum || { worlds: [] }).worlds.push(w); };

  C.init = function () {
    const cur = KS.curriculum || { worlds: [] };
    C.worlds = cur.worlds;
    C.worlds.forEach(function (w, wi) {
      w.index = wi;
      w.modules.forEach(function (m) {
        m.world = w; m.index = C.modules.length; C.modules.push(m); C.moduleById[m.id] = m;
        m.lessons.forEach(function (l, li) {
          l.module = m; l.world = w; l.index = li; l.order = C.order.length;
          l.topicList = (l.topics || '').split(';').map(function (t) { return t.trim(); }).filter(Boolean);
          C.order.push(l.id); C.metaById[l.id] = l;
          (l.covers || []).forEach(function (k) { (C.coverMap[k] = C.coverMap[k] || []).push(l.id); });
        });
      });
    });
  };
  C.coverMap = {};
  /** Progress through one roadmap: every node with the lessons that cover it. */
  C.roadmapProgress = function (rm) {
    let nodes = 0, done = 0;
    rm.groups.forEach(function (g) { g.nodes.forEach(function (n) {
      nodes++; const ls = C.coverMap[rm.prefix + ':' + n[0]] || [];
      if (ls.length && ls.every(function (id) { return KS.store.isDone(id); })) done++;
    }); });
    return { nodes: nodes, done: done, pct: nodes ? done / nodes : 0 };
  };
  C.nodeState = function (rm, slug) {
    const ls = C.coverMap[rm.prefix + ':' + slug] || []; const d = ls.filter(function (id) { return KS.store.isDone(id); }).length;
    return { lessons: ls, done: d, state: !ls.length ? 'none' : d === ls.length ? 'done' : d > 0 ? 'part' : 'todo' };
  };

  // ---------- registration (called by content/modules/*.js) ----------
  KS.lesson = function (id, data) {
    C.lessons[id] = data;
    (data.glossary || []).forEach(function (g) {
      if (!g || !g.term) return;
      const slug = KS.slug(g.term);
      if (C.glossary[slug]) { if (C.glossary[slug].lessons.indexOf(id) < 0) C.glossary[slug].lessons.push(id); if (!C.glossary[slug].like && g.like) C.glossary[slug].like = g.like; return; }
      C.glossary[slug] = { slug: slug, term: g.term, def: g.def, like: g.like || '', lessons: [id] };
      (g.aka || []).forEach(function (a) { const s = KS.slug(a); if (!C.glossary[s]) C.alias[s] = slug; });
      glossDirty = true;
    });
  };
  KS.boss = function (moduleId, data) { C.bosses[moduleId] = data; };
  KS.sheet = function (moduleId, data) { data.id = moduleId; C.sheets[moduleId] = data; };
  C.alias = {};
  let glossDirty = true;
  C.terms = function () {
    if (glossDirty) {
      C.glossaryList = Object.keys(C.glossary).map(function (k) { return C.glossary[k]; }).sort(function (a, b) { return a.term.toLowerCase() < b.term.toLowerCase() ? -1 : 1; });
      glossDirty = false; termRx = null;
    }
    return C.glossaryList;
  };
  C.term = function (slugOrTerm) { const s = KS.slug(slugOrTerm); return C.glossary[s] || C.glossary[C.alias[s]] || null; };

  // ---------- loading ----------
  C.loadModule = function (id) {
    if (C.loaded[id]) return Promise.resolve(true);
    if (C.missing[id]) return Promise.resolve(false);
    if (pending[id]) return pending[id];
    pending[id] = new Promise(function (resolve) {
      const s = document.createElement('script');
      s.src = 'content/modules/' + id + '.js?v=' + KS.version;
      s.async = true;
      s.onload = function () { C.loaded[id] = true; delete pending[id]; KS.bus.emit('module', id); resolve(true); };
      s.onerror = function () { C.missing[id] = true; delete pending[id]; resolve(false); };
      document.head.appendChild(s);
    });
    return pending[id];
  };
  C.loadLesson = function (lessonId) { const m = C.metaById[lessonId]; return m ? C.loadModule(m.module.id) : Promise.resolve(false); };
  let allPromise = null;
  /** Load every module (in curriculum order, a few at a time). Resolves when done. */
  C.loadAll = function (onProgress) {
    if (allPromise) return allPromise;
    const ids = C.modules.map(function (m) { return m.id; });
    let done = 0, next = 0;
    allPromise = new Promise(function (resolve) {
      function pump() {
        if (next >= ids.length) { if (done >= ids.length) { C.allLoaded = true; KS.bus.emit('content:all'); resolve(); } return; }
        const id = ids[next++];
        C.loadModule(id).then(function () { done++; if (onProgress) onProgress(done, ids.length); pump(); });
      }
      for (let i = 0; i < 4; i++) pump();
      if (!ids.length) resolve();
    });
    return allPromise;
  };
  C.getLesson = function (id) { return C.lessons[id] || null; };
  C.hasContent = function (id) { return !!C.lessons[id]; };

  // ---------- navigation helpers ----------
  C.meta = function (id) { return C.metaById[id] || null; };
  C.nextLesson = function (id) { const m = C.metaById[id]; return m && m.order + 1 < C.order.length ? C.metaById[C.order[m.order + 1]] : null; };
  C.prevLesson = function (id) { const m = C.metaById[id]; return m && m.order > 0 ? C.metaById[C.order[m.order - 1]] : null; };

  C.moduleProgress = function (m) {
    let done = 0, stars = 0;
    m.lessons.forEach(function (l) { if (KS.store.isDone(l.id)) { done++; stars += KS.store.stars(l.id); } });
    const boss = KS.store.state.bosses[m.id];
    return { done: done, total: m.lessons.length, pct: m.lessons.length ? done / m.lessons.length : 0, stars: stars, maxStars: m.lessons.length * 3, boss: !!(boss && boss.passed), complete: done === m.lessons.length };
  };
  C.worldProgress = function (w) {
    let done = 0, total = 0;
    w.modules.forEach(function (m) { const p = C.moduleProgress(m); done += p.done; total += p.total; });
    return { done: done, total: total, pct: total ? done / total : 0 };
  };
  C.overall = function () {
    let done = 0;
    C.order.forEach(function (id) { if (KS.store.isDone(id)) done++; });
    return { done: done, total: C.order.length, pct: C.order.length ? done / C.order.length : 0 };
  };
  /** The lesson to continue: most recently touched unfinished lesson, else the first not-done lesson in order. */
  C.nextUp = function () {
    const L = KS.store.state.lessons; let best = null, bestT = 0;
    for (const id in L) { const l = L[id]; if (!l.done && l.pos > 0 && (l.t || 0) > bestT && C.metaById[id]) { best = id; bestT = l.t; } }
    if (best) return C.metaById[best];
    // prefer continuing after the most recently completed lesson
    let last = null, lastT = 0;
    for (const id in L) { if (L[id].done && (L[id].t || L[id].done) > lastT && C.metaById[id]) { last = id; lastT = L[id].t || L[id].done; } }
    if (last) {
      let n = C.nextLesson(last);
      while (n && KS.store.isDone(n.id)) n = C.nextLesson(n.id);
      if (n) return n;
    }
    for (let i = 0; i < C.order.length; i++) if (!KS.store.isDone(C.order[i])) return C.metaById[C.order[i]];
    return null;
  };

  // ---------- question pools (arcade, review, pocket sessions) ----------
  /** All activities matching a filter. scope: 'learned' (completed lessons) | 'all' | [lessonIds]. */
  C.pool = function (opts) {
    opts = opts || {};
    const types = opts.types ? new Set(opts.types) : null;
    let ids;
    if (Array.isArray(opts.scope)) ids = opts.scope;
    else if (opts.scope === 'all') ids = C.order;
    else ids = C.order.filter(function (id) { return KS.store.isDone(id); });
    const out = [];
    ids.forEach(function (id) {
      const L = C.lessons[id]; if (!L) return;
      (L.activities || []).forEach(function (a, i) {
        if (types && !types.has(a.type)) return;
        if (opts.filter && !opts.filter(a)) return;
        out.push({ key: id + ':' + i, lessonId: id, a: a });
      });
    });
    return out;
  };
  /** Pool with graceful fallback so games always have something to play. */
  C.poolSmart = function (opts, min) {
    min = min || 6;
    const scope = (opts && opts.scope) || KS.store.state.settings.scope || 'learned';
    let p = C.pool(Object.assign({}, opts, { scope: scope }));
    let widened = false;
    if (p.length < min && scope !== 'all') {
      // widen: completed lessons + the next few lessons with content, then everything
      const started = C.order.filter(function (id) { return KS.store.isDone(id) || (KS.store.peek(id) && KS.store.peek(id).pos > 0); });
      const extra = C.order.filter(function (id) { return C.lessons[id] && started.indexOf(id) < 0; }).slice(0, 6);
      p = C.pool(Object.assign({}, opts, { scope: started.concat(extra) })); widened = true;
      if (p.length < min) p = C.pool(Object.assign({}, opts, { scope: 'all' }));
    }
    p.widened = widened;
    return p;
  };
  C.flashcards = function (lessonId) {
    const L = C.lessons[lessonId]; if (!L) return [];
    return (L.flashcards || []).map(function (f, i) { return { id: lessonId + '#' + i, lessonId: lessonId, q: f.q, a: f.a }; });
  };
  C.flashcardById = function (id) {
    const p = id.split('#'); const L = C.lessons[p[0]]; if (!L || !L.flashcards || !L.flashcards[+p[1]]) return null;
    const f = L.flashcards[+p[1]]; return { id: id, lessonId: p[0], q: f.q, a: f.a };
  };
  /** Every metaphor card across loaded lessons (for the Metaphor Bank). */
  C.metaphors = function () {
    const out = [];
    C.order.forEach(function (id) {
      const L = C.lessons[id]; if (!L) return;
      (L.cards || []).forEach(function (c) { if (c.kind === 'metaphor') out.push({ lessonId: id, title: c.title, body: c.body }); });
    });
    return out;
  };

  // ---------- search ----------
  function score(text, q, w) {
    if (!text) return 0; const t = text.toLowerCase(); const i = t.indexOf(q);
    if (i < 0) return 0;
    if (t === q) return w * 4;
    if (i === 0) return w * 2.4;
    if (/[\s\-_/(]/.test(t.charAt(i - 1))) return w * 1.6;
    return w;
  }
  /** Search lessons, glossary, cheat sheets and labs. Returns [{type, id, title, sub, score}]. */
  C.search = function (query, limit) {
    const q = String(query || '').trim().toLowerCase(); if (!q) return [];
    const toks = q.split(/\s+/).filter(Boolean); const res = [];
    function consider(type, id, title, sub, fields) {
      let total = 0;
      for (let i = 0; i < toks.length; i++) {
        let best = 0;
        for (let f = 0; f < fields.length; f++) { const sc = score(fields[f][0], toks[i], fields[f][1]); if (sc > best) best = sc; }
        if (!best) return; total += best;
      }
      total += score(title, q, 6);
      res.push({ type: type, id: id, title: title, sub: sub, score: total });
    }
    C.terms().forEach(function (g) { consider('term', g.slug, g.term, g.def, [[g.term, 12], [g.def, 2], [g.like, 1]]); });
    C.order.forEach(function (id) { const m = C.metaById[id]; consider('lesson', id, m.title, m.module.title + ' · ' + (m.summary || ''), [[m.title, 9], [m.summary, 3], [m.topics, 3], [m.module.title, 2]]); });
    C.modules.forEach(function (m) { consider('module', m.id, m.title, m.world.title + ' · ' + (m.tagline || ''), [[m.title, 8], [m.tagline, 2]]); });
    Object.keys(C.sheets).forEach(function (k) { const s = C.sheets[k]; consider('sheet', k, s.title || (C.moduleById[k] ? C.moduleById[k].title + ' cheat sheet' : k), 'Cheat sheet', [[s.title, 7], [(s.sections || []).map(function (x) { return (x.title || '') + ' ' + KS.plain(x.md || ''); }).join(' '), 1.5]]); });
    if (KS.labs) KS.labs.list().forEach(function (l) { consider('lab', l.id, l.title, 'Lab · ' + (l.blurb || ''), [[l.title, 8], [l.blurb, 2], [(l.tags || []).join(' '), 3]]); });
    res.sort(function (a, b) { return b.score - a.score; });
    return res.slice(0, limit || 30);
  };

  // ---------- glossary auto-linking ----------
  let termRx = null;
  const STOP = new Set(['state', 'class', 'object', 'method', 'function', 'server', 'client', 'request', 'response', 'data', 'code', 'test', 'user', 'type', 'value', 'field', 'event', 'model', 'layer', 'role', 'rule', 'node', 'host', 'port', 'path', 'query', 'table', 'record', 'error', 'file', 'name', 'time', 'load', 'read', 'write', 'call', 'list', 'item', 'page', 'view', 'link', 'tool', 'team', 'plan', 'cost', 'risk', 'goal', 'task', 'flow', 'step', 'case', 'part']);
  function buildRx() {
    const terms = C.terms().map(function (g) { return g.term; }).filter(function (t) { return t.length >= 4 && !STOP.has(t.toLowerCase()); })
      .sort(function (a, b) { return b.length - a.length; }).slice(0, 2500)
      .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    termRx = terms.length ? new RegExp('(^|[^A-Za-z0-9_])(' + terms.join('|') + ')(?![A-Za-z0-9_])', 'i') : null;
  }
  /** Wrap the first mention of glossary terms inside el with tappable .term spans. */
  C.linkTerms = function (el, skipSlugs) {
    if (KS.store.state.settings.autolink === false) return;
    C.terms(); if (!termRx) buildRx(); if (!termRx) return;
    const seen = new Set(skipSlugs || []);
    KS.$$('.term', el).forEach(function (t) { seen.add(t.dataset.term); });
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        let p = n.parentNode;
        while (p && p !== el) { const tag = p.nodeName; if (tag === 'CODE' || tag === 'PRE' || tag === 'A' || tag === 'BUTTON' || tag === 'H1' || tag === 'H2' || tag === 'H3' || (p.classList && (p.classList.contains('term') || p.classList.contains('code') || p.classList.contains('no-link')))) return NodeFilter.FILTER_REJECT; p = p.parentNode; }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = []; let n; while ((n = walker.nextNode())) nodes.push(n);
    let budget = 14;
    nodes.forEach(function (node) {
      let cur = node;
      for (let guard = 0; guard < 6 && budget > 0; guard++) {
        const m = termRx.exec(cur.nodeValue); if (!m) break;
        const slug = KS.slug(m[2]); const start = m.index + m[1].length;
        if (seen.has(slug) || !C.term(slug)) { // skip this occurrence: continue after it
          if (start + m[2].length >= cur.nodeValue.length) break;
          cur = cur.splitText(start + m[2].length); continue;
        }
        seen.add(slug); budget--;
        const mid = cur.splitText(start); const rest = mid.splitText(m[2].length);
        const span = KS.h('span.term.auto', { dataset: { term: slug }, tabindex: '0', role: 'button' }, mid.nodeValue);
        mid.parentNode.replaceChild(span, mid);
        cur = rest;
      }
    });
  };
})();
