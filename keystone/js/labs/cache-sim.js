/* Lab: cache-sim — a small cache in front of a slow database absorbs most reads, then serves stale data and stampedes. */
(function () {
  'use strict';

  // ---------- pure model (exposed as def.model so it can be tested in Node) ----------
  const M = {};
  M.makeCache = function () { return { map: new Map(), seq: 0 }; };
  /** Look a key up. Expired entries are removed. Returns { hit, expired }. */
  M.get = function (c, key, now, ttl) {
    const e = c.map.get(key);
    if (!e) return { hit: false, expired: false };
    if (now - e.born >= ttl) { c.map.delete(key); return { hit: false, expired: true }; }
    e.hits++; e.freq++; e.used = ++c.seq;
    return { hit: true, expired: false };
  };
  /** Which key would this policy throw out? */
  M.victim = function (c, policy) {
    let best = null;
    c.map.forEach(function (e, k) {
      if (!best) { best = [k, e]; return; }
      const b = best[1];
      let worse;
      if (policy === 'fifo') worse = e.ins < b.ins;
      else if (policy === 'lfu') worse = e.freq < b.freq || (e.freq === b.freq && e.used < b.used);
      else worse = e.used < b.used;            // lru
      if (worse) best = [k, e];
    });
    return best ? best[0] : null;
  };
  /** Store a value, evicting if full. Returns the evicted key (or null). */
  M.put = function (c, key, ver, now, size, policy) {
    size = Math.max(1, size | 0);
    const old = c.map.get(key);
    if (old) { old.ver = ver; old.born = now; old.used = ++c.seq; return null; }
    let evicted = null;
    while (c.map.size >= size) { const v = M.victim(c, policy); if (v == null) break; c.map.delete(v); evicted = v; }
    c.map.set(key, { key: key, ver: ver, born: now, hits: 0, freq: 1, used: ++c.seq, ins: ++c.seq });
    return evicted;
  };
  M.trim = function (c, size, policy) { while (c.map.size > Math.max(1, size)) { const v = M.victim(c, policy); if (v == null) break; c.map.delete(v); } };
  /** Zipf-like popularity: key i has weight 1/(i+1). */
  M.weights = function (n) { const w = []; let t = 0; for (let i = 0; i < n; i++) { t += 1 / (i + 1); w.push(t); } return w; };
  M.pickIndex = function (cum, r) { const x = r * cum[cum.length - 1]; for (let i = 0; i < cum.length; i++) if (x < cum[i]) return i; return cum.length - 1; };

  const POLICIES = { lru: 'LRU (least recently used)', lfu: 'LFU (least frequently used)', fifo: 'FIFO (oldest first)' };

  KS.labs.register({
    id: 'cache-sim',
    title: 'Cache Simulator',
    emoji: '⚡',
    blurb: 'Put a small, fast cache in front of a slow database. Watch it save the day, then watch it serve old data and stampede.',
    tags: ['caching', 'performance', 'eviction', 'ttl', 'stampede'],
    model: M,
    goals: [
      { id: 'hit', text: 'Reach an **80% hit rate**' },
      { id: 'stale', text: 'Change a value in the database and get a **stale read** from the cache' },
      { id: 'invalidate', text: 'Switch on **invalidate on write**, change the database and see the new value served' },
      { id: 'stampede', text: 'Trigger a **stampede**, then repeat it with **single-flight** on and see only one query' }
    ],
    help: `**App → cache → database.** Every request asks the cache first. A **hit** is answered from memory in about 2 ms. A **miss** means a trip to the slow database, about 50 ms, and the answer is then kept in the cache.

Some keys are far more popular than others (key 1 is the most popular), which is why a small cache can work so well.

- **Cache size**: how many entries fit. When it is full, the **eviction policy** chooses who leaves: LRU drops the one unused for longest, LFU the one used least often, FIFO the oldest arrival.
- **TTL** (time to live): after this many seconds an entry expires and must be fetched again.
- **Stale**: the database changed but the cache still holds the old value.
- **Stampede**: a hot entry expires and many requests miss at the same moment, all hitting the database. **Single-flight** lets one request fetch while the rest wait for its answer.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const NKEYS = 20, FETCH = 0.05;       // seconds a database fetch takes (simulated clock)
      const keys = []; for (let i = 0; i < NKEYS; i++) keys.push('k' + (i + 1));
      const cum = M.weights(NKEYS);
      const db = {}; keys.forEach(k => { db[k] = 1; });
      const cache = M.makeCache();
      const pending = [], inflight = {}, dbQ = [], recent = [], invalidated = {};
      let now = 0, size = 8, ttl = 10, rate = 8, policy = 'lru', invOnWrite = false, singleFlight = false;
      let running = true, acc = 0, stale = 0, total = 0, stampedeSeen = false, last = null;

      // ---------- UI ----------
      const stage = ui.stage();
      const nApp = ui.node('App', '📱'), nCache = ui.node('Cache', '⚡', { tone: 'accent' }), nDb = ui.node('Database', '🗄️');
      stage.el.appendChild(ui.cols([nApp], [nCache], [nDb]));
      stage.wire(nApp, nCache, { tone: 'good' }); stage.wire(nCache, nDb, { dashed: true });
      const lastEl = h('div.lab-mono', { style: { minHeight: '2.6em' } }, 'Waiting for the first request…');
      const log = ui.log(50);
      const sHit = ui.stat('hit rate', '–'), sAvg = ui.stat('avg latency', '–'), sDb = ui.stat('DB queries / s', 0), sStale = ui.stat('stale reads', 0, 'good');
      const fill = ui.meter('Cache filled');
      const tbody = h('tbody');
      const table = h('table.lab-table', h('thead', h('tr', h('th', 'key'), h('th', 'value'), h('th', 'age / TTL'), h('th', 'hits'))), tbody);

      const runBtn = ui.btn('⏸ Pause traffic', () => { running = !running; runBtn.textContent = running ? '⏸ Pause traffic' : '▶ Resume traffic'; }, 'primary');
      root.appendChild(ui.panel('Controls',
        ui.row(ui.slider('Cache size', { min: 1, max: 16, value: size, fmt: v => v + (v === 1 ? ' entry' : ' entries') }, v => { size = v; M.trim(cache, size, policy); render(); }),
          ui.slider('TTL', { min: 2, max: 60, value: ttl, fmt: v => v + ' s' }, v => { ttl = v; }),
          ui.slider('Traffic', { min: 1, max: 40, value: rate, fmt: v => v + ' req/s' }, v => { rate = v; })),
        ui.row(ui.select('Eviction policy', Object.keys(POLICIES).map(k => [k, POLICIES[k]]), policy, v => { policy = v; log.add('Eviction policy: **' + POLICIES[v] + '**', 'info'); })),
        ui.row(ui.toggle('Invalidate on write', invOnWrite, v => { invOnWrite = v; log.add('Invalidate on write is **' + (v ? 'on' : 'off') + '**.', 'info'); }),
          ui.toggle('Single-flight', singleFlight, v => { singleFlight = v; log.add('Single-flight is **' + (v ? 'on' : 'off') + '**.', 'info'); })),
        ui.row(runBtn, ui.btn('Change a value in the database', changeDb), ui.btn('💥 Stampede', stampede, 'danger'), ui.btn('Empty the cache', () => { cache.map.clear(); log.add('Cache emptied. Every key is a miss until it is fetched again.', 'warn'); render(); }, 'ghost'))));
      root.appendChild(stage.el);
      root.appendChild(h('div.lab-grid2',
        ui.panel('What is in the cache', fill.el, h('div.lab-table-wrap', table), h('p.muted.small', 'Keys are numbered by popularity: k1 is asked for most.')),
        h('div.lab-stack', ui.panel('Scoreboard', ui.stats(sHit, sAvg, sDb, sStale), lastEl), ui.panel('What just happened', log.el))));

      // ---------- simulation ----------
      function settle() {
        for (let i = 0; i < pending.length;) {
          const p = pending[i];
          if (p.doneAt <= now) {
            M.put(cache, p.key, p.ver, now, size, policy);
            pending.splice(i, 1);
            if (inflight[p.key] != null && inflight[p.key] <= now) delete inflight[p.key];
          } else i++;
        }
      }
      function handle(key) {
        settle(); total++;
        const r = M.get(cache, key, now, ttl);
        let kind, ms;
        if (r.hit) {
          const e = cache.map.get(key);
          kind = 'hit'; ms = 2;
          if (e.ver !== db[key]) { kind = 'stale'; stale++; }
        } else {
          const until = singleFlight ? inflight[key] : null;
          if (until != null && until > now) { kind = 'wait'; ms = (until - now) * 1000 + 2; }
          else {
            kind = 'miss'; ms = 50 + 4 * pending.length;     // the busier the database, the slower it answers
            dbQ.push(now); pending.push({ key: key, ver: db[key], doneAt: now + FETCH }); inflight[key] = now + FETCH;
            if (invalidated[key]) { delete invalidated[key]; log.add('**' + key + '** was removed from the cache when the database changed, so this read went to the database and got the **new value (v' + db[key] + ')** ✓', 'good'); api.goal('invalidate'); }
          }
        }
        recent.push({ hit: kind === 'hit' || kind === 'stale', ms: ms }); if (recent.length > 100) recent.shift();
        last = { key: key, kind: kind, ms: ms, expired: r.expired };
        (kind === 'hit' || kind === 'stale' ? nCache : nDb).pulse(kind === 'stale' ? 'bad' : 'good');
        if (kind === 'stale') {
          log.add('Request for **' + key + '** → cache hit, but the database already has **v' + db[key] + '** and the cache served the **old copy**. That is a stale read.', 'bad');
          api.goal('stale');
        }
        return kind;
      }
      function pickKey() { return keys[M.pickIndex(cum, Math.random())]; }
      function dbPerSec() { while (dbQ.length && dbQ[0] < now - 1) dbQ.shift(); return dbQ.length; }
      function describe() {
        if (!last) return 'Waiting for the first request…';
        const t = { hit: 'HIT: answered from the cache', stale: 'HIT (but stale!)', miss: 'MISS: asked the database' + (last.expired ? ' (the cached copy had expired)' : ''), wait: 'MISS: waited for another request already fetching it' };
        return 'GET ' + last.key + ' → ' + t[last.kind] + ' · ' + Math.round(last.ms) + ' ms';
      }
      function changeDb() {
        let best = null;
        cache.map.forEach((e, k) => { if (!best || keys.indexOf(k) < keys.indexOf(best)) best = k; });   // the most popular cached key
        const key = best || 'k1';
        db[key]++;
        if (best && invOnWrite) { cache.map.delete(key); invalidated[key] = true; log.add('Database: **' + key + '** is now v' + db[key] + '. Invalidate on write removed the cached copy, so the next read will fetch the new one.', 'good'); }
        else if (best) log.add('Database: **' + key + '** is now v' + db[key] + '. The cache still holds v' + (db[key] - 1) + ' and will keep serving it until the TTL (' + ttl + ' s) runs out.', 'warn');
        else log.add('Database: **' + key + '** changed, but nothing for it is cached yet, so nobody can see a stale copy. Let some traffic fill the cache first.', 'dim');
        render();
      }
      function stampede() {
        settle();
        cache.map.delete('k1');
        for (let i = pending.length - 1; i >= 0; i--) if (pending[i].key === 'k1') pending.splice(i, 1);
        delete inflight.k1;
        let misses = 0, waits = 0, sum = 0;
        for (let i = 0; i < 24; i++) {
          const key = i < 20 ? 'k1' : pickKey();
          const kind = handle(key);
          const l = recent[recent.length - 1]; sum += l.ms;
          if (key === 'k1') { if (kind === 'miss') misses++; else if (kind === 'wait') waits++; }
        }
        const avg = Math.round(sum / 24);
        if (!singleFlight) {
          log.add('💥 **Stampede!** The hottest key (k1) expired and 20 requests arrived at once. **' + misses + ' of them missed**, so the database got **' + misses + ' identical queries** at the same moment. Average wait: **' + avg + ' ms**.', 'bad');
          if (misses >= 10) stampedeSeen = true;
        } else {
          log.add('With **single-flight**, the first request for k1 went to the database and the other **' + waits + ' waited for its answer** instead of asking again. Database queries for k1: **' + misses + '**. Average wait: ' + avg + ' ms.', 'good');
          if (stampedeSeen && misses === 1) api.goal('stampede');
          else if (!stampedeSeen) log.add('Now switch single-flight **off** and press the button again to see how bad it is without it.', 'info');
        }
        render();
      }
      function render() {
        const n = recent.length;
        if (n) {
          const hr = recent.filter(r => r.hit).length / n, avg = recent.reduce((a, r) => a + r.ms, 0) / n;
          sHit.set(Math.round(hr * 100) + '%', hr >= 0.8 ? 'good' : hr >= 0.5 ? 'warn' : 'bad'); sAvg.set(Math.round(avg) + ' ms', avg < 15 ? 'good' : avg < 30 ? 'warn' : 'bad');
          if (n >= 50 && hr >= 0.8) api.goal('hit');
        }
        const q = dbPerSec(); sDb.set(q, q > 20 ? 'bad' : q > 8 ? 'warn' : 'good');
        sStale.set(stale, stale ? 'bad' : 'good');
        fill.set(cache.map.size / size, cache.map.size + ' of ' + size);
        nCache.setSub(cache.map.size + '/' + size + ' entries'); nDb.setSub(q + ' queries/s'); nApp.setSub(running ? rate + ' req/s' : 'paused');
        lastEl.textContent = describe();
        KS.clear(tbody);
        const rows = Array.from(cache.map.values()).sort((a, b) => keys.indexOf(a.key) - keys.indexOf(b.key));
        if (!rows.length) tbody.appendChild(h('tr.dim', h('td', { colspan: '4' }, 'The cache is empty.')));
        rows.forEach(e => {
          const isStale = e.ver !== db[e.key];
          tbody.appendChild(h('tr' + (isStale ? '.bad' : ''), h('td', e.key), h('td', 'v' + e.ver + (isStale ? ' ⚠ stale (db: v' + db[e.key] + ')' : '')), h('td', Math.max(0, Math.round(now - e.born)) + ' s / ' + ttl + ' s'), h('td', e.hits)));
        });
      }

      api.loop(dt => {
        now += dt; settle();
        if (running) { acc = Math.min(acc + dt * rate, 20); while (acc >= 1) { acc -= 1; handle(pickKey()); } }
      });
      api.every(250, render);
      api.every(4000, () => {
        if (!running || recent.length < 10) return;
        const hr = Math.round(recent.filter(r => r.hit).length / recent.length * 100);
        log.add('Last ' + recent.length + ' requests: **' + hr + '%** answered by the cache; the database saw ' + dbPerSec() + ' queries in the last second.', 'dim');
      });
      log.add('Traffic is flowing. At first the cache is small, so many requests still go to the database. Try making the cache bigger or smaller and watch the hit rate.', 'info');
      render();
      return () => stage.destroy();
    }
  });
})();
