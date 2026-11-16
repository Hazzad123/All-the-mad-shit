/* Keystone — progress store. Local-first (localStorage), mergeable across devices. */
(function () {
  'use strict';
  const KS = window.KS;
  const KEY = 'keystone.v1';
  const S = (KS.store = {});
  let total = null;

  function fresh() {
    return {
      v: 1,
      device: Math.random().toString(36).slice(2, 8),
      created: Date.now(),
      updated: 0,
      profile: { name: '', u: 0 },
      settings: { theme: 'dark', sound: !KS.isTouch, haptics: true, goal: 50, motion: true, autolink: true, scope: 'learned' },
      days: {},      // { 'YYYY-MM-DD': { deviceId: { x: xp, a: activities, r: reviews, l: lessons } } }
      lessons: {},   // { lessonId: { done: ts, stars, best, pos, t: lastTouched, res: {actIdx: score}, runs } }
      acts: {},      // { 'lessonId:idx': [correct, wrong, lastTs] }
      srs: {},       // { 'lessonId#i': [dueDay, intervalDays, ease, reps, lapses, lastDay] }
      bosses: {},    // { moduleId: { best: 0..1, passed: ts, tries } }
      labs: {},      // { labId: { goalId: ts } }
      ach: {},       // { achievementId: ts }
      notes: {},     // { lessonId: { t: text, u: ts } }
      marks: {},     // { key: { on: bool, u: ts } }
      games: {},     // { gameId: { hi, plays } }
      explain: {},   // { actKey: { t: text, r: rating, u: ts } }
      flags: {}      // misc one-way booleans (onboarded, toured...)
    };
  }

  S.load = function () {
    let st = null;
    try { const raw = localStorage.getItem(KEY); if (raw) st = JSON.parse(raw); } catch (e) { console.warn('[store] could not read saved progress', e); }
    const base = fresh();
    const clean = S.sanitize(st);
    if (clean) {
      for (const k in base) if (clean[k] == null) clean[k] = base[k];
      clean.settings = Object.assign({}, base.settings, clean.settings);
      if (!clean.device) clean.device = base.device;
      S.state = clean;
    } else S.state = base;
    total = null;
    return S.state;
  };

  function write() {
    try { S.state.updated = Date.now(); localStorage.setItem(KEY, JSON.stringify(S.state)); }
    catch (e) {
      console.warn('[store] save failed', e);
      if (!saveWarned && KS.ui && KS.ui.toast) { saveWarned = true; KS.ui.toast('⚠️ Progress could not be saved in this browser (private mode or storage full). Export a copy from Profile → Your data.', 'bad', 9000); }
    }
  }
  let saveWarned = false;
  const lazy = KS.debounce(write, 350);
  S.save = function () { lazy(); KS.bus.emit('state'); };
  S.saveNow = function () { lazy.flush(); write(); };
  /** Mutate state then persist: KS.store.set(s => { s.profile.name = 'x' }) */
  S.set = function (fn) { fn(S.state); S.save(); };

  // ---------- day log / XP ----------
  S.day = function (date) {
    const d = date || KS.today(); const days = S.state.days;
    if (!days[d]) days[d] = {};
    if (!days[d][S.state.device]) days[d][S.state.device] = { x: 0, a: 0, r: 0, l: 0 };
    return days[d][S.state.device];
  };
  S.dayTotals = function (date) {
    const d = S.state.days[date || KS.today()]; const t = { x: 0, a: 0, r: 0, l: 0, d: 0 };
    if (d) for (const k in d) { t.x += d[k].x || 0; t.a += d[k].a || 0; t.r += d[k].r || 0; t.l += d[k].l || 0; t.d = Math.max(t.d, d[k].d || 0); }
    return t;
  };
  S.todayXp = function () { return S.dayTotals().x; };
  S.totalXp = function () {
    if (total == null) { total = 0; const days = S.state.days; for (const d in days) for (const k in days[d]) total += days[d][k].x || 0; }
    return total;
  };
  S.addXp = function (n) {
    n = Math.max(0, Math.round(n)); if (!n) return 0;
    S.totalXp(); S.day().x += n; total += n; S.save(); KS.bus.emit('xp', n); return n;
  };
  S.bump = function (field, n) { S.day()[field] = (S.day()[field] || 0) + (n == null ? 1 : n); S.save(); };

  /** Streak = consecutive days with any XP. Today not yet played does not break it. */
  S.streak = function () {
    const days = S.state.days; const active = {};
    for (const d in days) { let x = 0; for (const k in days[d]) x += days[d][k].x || 0; if (x > 0) active[KS.dayNum(d)] = true; }
    const today = KS.dayNum(); let cur = 0; let n = active[today] ? today : today - 1;
    while (active[n]) { cur++; n--; }
    let best = 0, run = 0;
    const nums = Object.keys(active).map(Number).sort(function (a, b) { return a - b; });
    for (let i = 0; i < nums.length; i++) { run = (i && nums[i] === nums[i - 1] + 1) ? run + 1 : 1; if (run > best) best = run; }
    return { current: cur, best: Math.max(best, cur), todayDone: !!active[today], activeDays: nums.length };
  };

  // ---------- lessons / activities ----------
  S.lesson = function (id) { const L = S.state.lessons; if (!L[id]) L[id] = { done: 0, stars: 0, best: 0, pos: 0, t: 0, res: {}, runs: 0 }; return L[id]; };
  S.peek = function (id) { return S.state.lessons[id] || null; };
  S.isDone = function (id) { const l = S.state.lessons[id]; return !!(l && l.done); };
  S.stars = function (id) { const l = S.state.lessons[id]; return l ? l.stars || 0 : 0; };
  S.act = function (key) { return S.state.acts[key] || null; };
  S.recordAct = function (key, correct) {
    const a = S.state.acts[key] || (S.state.acts[key] = [0, 0, 0]);
    if (correct) a[0]++; else a[1]++;
    a[2] = Date.now(); S.day().a++; S.save();
  };
  S.flag = function (name, val) { if (val === undefined) return !!S.state.flags[name]; S.state.flags[name] = !!val; S.save(); };
  S.mark = function (key, on) {
    if (on === undefined) { const m = S.state.marks[key]; return !!(m && m.on); }
    S.state.marks[key] = { on: !!on, u: Date.now() }; S.save();
  };

  // ---------- import / export / merge ----------
  S.exportJSON = function () { S.saveNow(); return JSON.stringify(S.state); };

  // ---------- sanitising untrusted progress (import files, sync codes, gists, other tabs) ----------
  // Rebuilds the data from known fields only, with the expected types. Anything else is dropped, so a
  // crafted file cannot smuggle in `__proto__` keys, HTML strings or nulls that would break the pages.
  const BAD_KEY = /^(__proto__|constructor|prototype)$/;
  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function okKeys(o) { return isObj(o) ? Object.keys(o).filter(function (k) { return !BAD_KEY.test(k) && k.length <= 200; }) : []; }
  function num(v) { return typeof v === 'number' && isFinite(v) ? v : 0; }
  function str(v, max) { return typeof v === 'string' ? v.slice(0, max) : ''; }
  function nums(v, n) { const out = []; for (let i = 0; i < n; i++) out.push(num(Array.isArray(v) ? v[i] : 0)); return out; }
  function each(o, fn) { const out = {}; okKeys(o).forEach(function (k) { const v = fn(o[k], k); if (v !== undefined) out[k] = v; }); return out; }
  function pick(o, fields) { const out = {}; fields.forEach(function (f) { out[f] = num(o[f]); }); return out; }
  const DAY = /^\d{4}-\d{2}-\d{2}$/;
  S.sanitize = function (b) {
    if (!isObj(b)) return null;
    const def = fresh().settings; const out = { v: 1 };
    if (typeof b.device === 'string' && /^[a-z0-9]{1,16}$/.test(b.device)) out.device = b.device;
    out.created = num(b.created); out.updated = num(b.updated); out.resetAt = num(b.resetAt);
    if (isObj(b.profile)) out.profile = { name: str(b.profile.name, 80), u: num(b.profile.u) };
    if (isObj(b.settings)) out.settings = each(b.settings, function (v, k) { return (k in def && typeof v === typeof def[k]) ? (typeof v === 'string' ? v.slice(0, 40) : v) : undefined; });
    out.days = {};
    okKeys(b.days).forEach(function (d) { if (DAY.test(d)) out.days[d] = each(b.days[d], function (v) { return isObj(v) ? pick(v, ['x', 'a', 'r', 'l', 'd']) : undefined; }); });
    out.lessons = each(b.lessons, function (v) {
      if (!isObj(v)) return undefined;
      const l = pick(v, ['done', 'stars', 'best', 'pos', 't', 'runs']); l.res = each(v.res, function (r) { return typeof r === 'number' && isFinite(r) ? r : undefined; }); return l;
    });
    out.acts = each(b.acts, function (v) { return Array.isArray(v) ? nums(v, 3) : undefined; });
    out.srs = each(b.srs, function (v) { return Array.isArray(v) ? nums(v, 6) : undefined; });
    out.bosses = each(b.bosses, function (v) { return isObj(v) ? pick(v, ['best', 'passed', 'tries']) : undefined; });
    out.labs = each(b.labs, function (v) { return isObj(v) ? each(v, function (t) { return num(t) || undefined; }) : undefined; });
    out.ach = each(b.ach, function (v) { return num(v) || undefined; });
    out.notes = each(b.notes, function (v) { return isObj(v) ? { t: str(v.t, 20000), u: num(v.u) } : undefined; });
    out.marks = each(b.marks, function (v) { return isObj(v) ? { on: !!v.on, u: num(v.u) } : undefined; });
    out.explain = each(b.explain, function (v) { return isObj(v) ? { t: str(v.t, 5000), r: num(v.r), u: num(v.u) } : undefined; });
    out.games = each(b.games, function (v) { return isObj(v) ? pick(v, ['hi', 'plays']) : undefined; });
    out.flags = each(b.flags, function (v) { return v ? true : undefined; });
    return out;
  };

  function mergeNum(a, b) { return Math.max(a || 0, b || 0); }
  function earliest(a, b) { if (a && b) return Math.min(a, b); return a || b || 0; }
  function later(a, b) { return ((b && b.u) || 0) > ((a && a.u) || 0) ? b : a; }
  /** Conflict-free merge of progress `b` INTO `a` (mutates and returns `a`, so live references stay valid).
   *  Never loses progress from either side. */
  S.merge = function (a, b) {
    const out = a;
    b = S.sanitize(b);
    if (!b) return out;
    // A reset on any device wins over progress made before it: older data is ignored, newer resets wipe this copy.
    const aReset = a.resetAt || 0, bReset = b.resetAt || 0;
    if (bReset < aReset) return out;
    if (bReset > aReset) {
      const f = fresh();
      ['days', 'lessons', 'acts', 'srs', 'bosses', 'labs', 'ach', 'notes', 'marks', 'explain', 'games', 'flags'].forEach(function (k) { out[k] = f[k]; });
      out.profile = f.profile; out.resetAt = bReset; total = null;
    }
    out.created = earliest(a.created, b.created);
    if (b.profile && (b.profile.u || 0) > ((a.profile && a.profile.u) || 0)) out.profile = b.profile;
    let k;
    for (k in (b.days || {})) {
      const da = out.days[k] || (out.days[k] = {});
      for (const dev in b.days[k]) {
        const x = da[dev] || (da[dev] = { x: 0, a: 0, r: 0, l: 0 }); const y = b.days[k][dev];
        for (const f in y) x[f] = mergeNum(x[f], y[f]);
      }
    }
    for (k in (b.lessons || {})) {
      const y = b.lessons[k]; const x = out.lessons[k];
      if (!x) { out.lessons[k] = y; continue; }
      const newer = (y.t || 0) > (x.t || 0);
      x.done = earliest(x.done, y.done); x.stars = mergeNum(x.stars, y.stars); x.best = mergeNum(x.best, y.best);
      x.runs = mergeNum(x.runs, y.runs);
      if (newer) { x.pos = y.pos || 0; x.res = y.res || {}; x.t = y.t; }
    }
    for (k in (b.acts || {})) {
      const y = b.acts[k]; const x = out.acts[k];
      if (!x) out.acts[k] = y; else { x[0] = mergeNum(x[0], y[0]); x[1] = mergeNum(x[1], y[1]); x[2] = mergeNum(x[2], y[2]); }
    }
    for (k in (b.srs || {})) {
      const y = b.srs[k]; const x = out.srs[k];
      if (!x || (y[5] || 0) > (x[5] || 0) || ((y[5] || 0) === (x[5] || 0) && (y[3] || 0) > (x[3] || 0))) out.srs[k] = y;
    }
    for (k in (b.bosses || {})) {
      const y = b.bosses[k]; const x = out.bosses[k];
      if (!x) out.bosses[k] = y; else { x.best = mergeNum(x.best, y.best); x.passed = earliest(x.passed, y.passed); x.tries = mergeNum(x.tries, y.tries); }
    }
    for (k in (b.labs || {})) {
      const x = out.labs[k] || (out.labs[k] = {});
      for (const g in b.labs[k]) x[g] = earliest(x[g], b.labs[k][g]);
    }
    for (k in (b.ach || {})) out.ach[k] = earliest(out.ach[k], b.ach[k]);
    for (k in (b.notes || {})) out.notes[k] = later(out.notes[k], b.notes[k]);
    for (k in (b.marks || {})) out.marks[k] = later(out.marks[k], b.marks[k]);
    for (k in (b.explain || {})) out.explain[k] = later(out.explain[k], b.explain[k]);
    for (k in (b.games || {})) {
      const y = b.games[k]; const x = out.games[k];
      if (!x) out.games[k] = y; else { x.hi = mergeNum(x.hi, y.hi); x.plays = mergeNum(x.plays, y.plays); }
    }
    for (k in (b.flags || {})) out.flags[k] = out.flags[k] || b.flags[k];
    return out;
  };

  /** Import progress. mode 'merge' keeps the best of both; 'replace' overwrites (keeps this device's settings). */
  S.importJSON = function (str, mode) {
    let incoming;
    try { incoming = typeof str === 'string' ? JSON.parse(str) : str; } catch (e) { incoming = null; }
    if (!isObj(incoming) || !isObj(incoming.lessons) || !isObj(incoming.days)) throw new Error('That does not look like a Keystone progress file.');
    const mine = S.state;
    // Merge into a copy and only swap it in once the whole merge has succeeded, so a bad file changes nothing.
    let next;
    if (mode === 'replace') {
      next = S.merge(fresh(), incoming);
      next.device = mine.device; next.settings = mine.settings;
    } else next = S.merge(JSON.parse(JSON.stringify(mine)), incoming);
    const changed = JSON.stringify(next) !== JSON.stringify(mine);
    S.state = next; total = null;
    if (changed) { S.saveNow(); KS.bus.emit('state'); KS.bus.emit('imported'); }
    return next;
  };

  S.reset = function () {
    const keep = S.state.settings;
    const device = S.state.device;
    S.state = fresh(); S.state.settings = keep; S.state.device = device; S.state.resetAt = Date.now();
    total = null; S.saveNow(); KS.bus.emit('state'); KS.bus.emit('imported');
  };

  // Persist on the way out, and pick up changes made in another tab.
  window.addEventListener('pagehide', function () { lazy.flush(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') lazy.flush(); });
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY || !e.newValue) return;
    try {
      const before = JSON.stringify(S.state);
      const other = S.sanitize(JSON.parse(e.newValue)); if (!other) return;
      S.merge(S.state, other);
      if (other.settings) Object.keys(other.settings).forEach(function (k) { S.state.settings[k] = other.settings[k]; });
      total = null; KS.bus.emit('state');
      if (JSON.stringify(S.state) !== before) KS.bus.emit('imported');
    } catch (err) { /* ignore */ }
  });

  S.load();
})();
