/* Lab: cdn-lab — distance is latency; an edge copy near the user is fast after the first miss. */
(function () {
  'use strict';

  // ---------- pure model (exposed as def.model for Node tests) ----------
  const M = {};
  M.CITIES = [
    { id: 'lon', name: 'London', lat: 51.5, lon: -0.1 },
    { id: 'nyc', name: 'New York', lat: 40.7, lon: -74.0 },
    { id: 'sao', name: 'São Paulo', lat: -23.5, lon: -46.6 },
    { id: 'bom', name: 'Mumbai', lat: 19.1, lon: 72.9 },
    { id: 'tyo', name: 'Tokyo', lat: 35.7, lon: 139.7 },
    { id: 'syd', name: 'Sydney', lat: -33.9, lon: 151.2 }
  ];
  M.city = function (id) { return M.CITIES.filter(function (c) { return c.id === id; })[0]; };
  M.km = function (a, b) {
    const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
  };
  /** Rough round trip in ms: light in fibre covers ~200 km/ms, real routes are ~1.5x longer, plus ~8 ms of local network. */
  M.rtt = function (a, b) { return a.id === b.id ? 8 : Math.round(8 + 2 * M.km(a, b) / 200 * 1.5); };
  M.PROCESS_ORIGIN = 30; M.PROCESS_EDGE = 3;
  M.nearestEdge = function (client, edgeIds) {
    let best = null, bd = Infinity;
    edgeIds.forEach(function (id) { const d = M.km(client, M.city(id)); if (d < bd) { bd = d; best = id; } });
    return best;
  };
  /**
   * One request. state: { origin: cityId, originUp, edges: { cityId: { cached } } }.
   * Returns { ok, ms, via: 'origin' | 'edge-miss' | 'edge-hit' | 'fail', edge, error }.
   */
  M.request = function (state, clientId) {
    const client = M.city(clientId), origin = M.city(state.origin), edgeIds = Object.keys(state.edges);
    if (!edgeIds.length) {
      if (!state.originUp) return { ok: false, ms: 0, via: 'fail', edge: null, error: 'The origin is down and there is no edge to answer instead.' };
      return { ok: true, ms: M.rtt(client, origin) + M.PROCESS_ORIGIN, via: 'origin', edge: null };
    }
    const eid = M.nearestEdge(client, edgeIds), edge = state.edges[eid], ec = M.city(eid);
    if (edge.cached) return { ok: true, ms: M.rtt(client, ec) + M.PROCESS_EDGE, via: 'edge-hit', edge: eid };
    if (!state.originUp) return { ok: false, ms: 0, via: 'fail', edge: eid, error: 'The edge had no copy and the origin is down.' };
    edge.cached = true;
    return { ok: true, ms: M.rtt(client, ec) + M.rtt(ec, origin) + M.PROCESS_ORIGIN, via: 'edge-miss', edge: eid };
  };

  const proj = function (c) { return [(c.lon + 180) / 360 * 400, (90 - c.lat) / 180 * 200]; };
  const LAND = [
    [[-168, 66], [-140, 70], [-95, 72], [-60, 60], [-52, 47], [-80, 25], [-97, 18], [-82, 8], [-105, 20], [-125, 40], [-135, 57]],
    [[-80, 8], [-60, 10], [-35, -6], [-40, -23], [-58, -38], [-68, -54], [-75, -45], [-71, -18], [-81, -5]],
    [[-10, 36], [-9, 43], [0, 50], [10, 58], [30, 70], [80, 73], [140, 72], [180, 67], [160, 55], [140, 40], [122, 30], [108, 20], [100, 2], [95, 15], [80, 8], [73, 20], [57, 25], [44, 12], [35, 30], [28, 36], [10, 38]],
    [[-17, 21], [-5, 36], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [32, -28], [20, -35], [12, -17], [9, 4], [-8, 5], [-17, 14]],
    [[114, -22], [130, -12], [142, -11], [153, -27], [147, -38], [130, -32], [115, -34]]
  ];

  KS.labs.register({
    id: 'cdn-lab',
    title: 'CDN Lab',
    emoji: '🌍',
    blurb: 'Your server is in one city; your users are everywhere. Add copies near them and watch the waiting time collapse.',
    tags: ['cdn', 'latency', 'caching', 'edge', 'performance'],
    model: M,
    goals: [
      { id: 'far', text: 'Measure the latency from **Sydney** with **no CDN**' },
      { id: 'edge', text: 'Turn on an **edge in Sydney**, then send twice from Sydney: a **miss**, then a **hit**' },
      { id: 'purge', text: '**Purge** the edges and watch the miss come back' },
      { id: 'shield', text: 'Take the **origin down** and still serve a page from an edge' }
    ],
    help: `The **origin** is the one server that holds your website. Every user, wherever they are, has to reach it, and information travels through cables at a speed limit, so a user on the other side of the planet waits a long time.

A **CDN** (content delivery network) puts **edge** servers in many cities. Each user is sent to the nearest edge. The **first** request through an edge is a **miss**: the edge fetches the page from the origin (slow) and keeps a copy. Every later request is a **hit**, answered from nearby.

Tap **Edge** on a city to switch an edge on or off. **Purge** throws away all cached copies. If the origin goes down, edges still serve what they hold. Latencies are rough estimates based on distance, not measurements.`,

    mount(root, api) {
      const ui = api.ui, h = api.h, CITIES = M.CITIES;
      const state = { origin: 'lon', originUp: true, edges: {} };
      const results = {};            // cityId → last result
      let prevSyd = null, purged = false, busy = false;

      // ---------- UI ----------
      const log = ui.log(40);
      const svg = KS.s('svg', { viewBox: '0 0 400 200', role: 'img', 'aria-label': 'Rough world map with the origin, edges and users', style: { width: '100%', height: 'auto', display: 'block', background: 'var(--bg-2)', borderRadius: '12px', border: '1px solid var(--line)' } });
      const linesG = KS.s('g'), dotsG = KS.s('g');
      LAND.forEach(poly => svg.appendChild(KS.s('polygon', { points: poly.map(p => proj({ lon: p[0], lat: p[1] }).map(n => n.toFixed(1)).join(',')).join(' '), style: { fill: 'var(--panel-3)', stroke: 'var(--line-2)', strokeWidth: '0.8' } })));
      svg.appendChild(linesG); svg.appendChild(dotsG);

      const rows = {};
      CITIES.forEach(c => {
        const meter = ui.meter(c.name);
        const btn = h('button.btn.sm', { type: 'button', onclick: () => toggleEdge(c.id) }, 'Edge: off');
        const send = h('button.btn.sm.ghost', { type: 'button', onclick: () => sendFrom([c.id]) }, 'Send');
        rows[c.id] = { meter: meter, btn: btn, send: send };
      });
      const originSel = ui.select('Origin server is in', CITIES.map(c => [c.id, c.name]), state.origin, v => {
        state.origin = v; Object.keys(state.edges).forEach(k => { state.edges[k].cached = false; });
        log.add('The origin moved to **' + M.city(v).name + '**. Edge copies were dropped.', 'info'); render();
      });
      const downTog = ui.toggle('Origin is down', false, v => {
        state.originUp = v ? false : true;
        log.add(v ? '💥 The **origin went down**. Edges can only serve what they already hold.' : 'The origin is **back up**.', v ? 'bad' : 'good'); render();
      });
      const allBtn = ui.btn('📡 Send from every city', () => sendFrom(CITIES.map(c => c.id)), 'primary');
      const purgeBtn = ui.btn('🧹 Purge edges', () => {
        const n = Object.keys(state.edges).filter(k => state.edges[k].cached).length;
        Object.keys(state.edges).forEach(k => { state.edges[k].cached = false; });
        if (n) purged = true;
        log.add(n ? 'Purged: **' + n + '** edge cop' + (n === 1 ? 'y' : 'ies') + ' deleted. The next request through each edge will be a miss.' : 'Nothing to purge: no edge holds a copy yet.', n ? 'warn' : 'dim'); render();
      }, 'ghost');
      const sOrigin = ui.stat('origin', 'London'), sHits = ui.stat('edge hits', 0, 'good'), sMiss = ui.stat('edge misses', 0, 'warn'), sFail = ui.stat('failed', 0);
      let nHit = 0, nMiss = 0, nFail = 0;

      root.appendChild(ui.panel('Controls', ui.row(originSel, downTog), ui.row(allBtn, purgeBtn)));
      root.appendChild(h('div.lab-grid2',
        h('div.lab-stack', ui.panel('Map', svg, h('p.muted.small', '🟧 origin · 🟦 edge · dots are users. Lines show where each user\'s request goes.')),
          ui.panel('What just happened', log.el)),
        ui.panel('Cities', ui.stats(sOrigin, sHits, sMiss, sFail), h('div.lab-stack', { style: { marginTop: '12px' } }, CITIES.map(c => h('div.lab-stack', { style: { gap: '4px' } }, rows[c.id].meter.el, ui.row(rows[c.id].btn, rows[c.id].send)))))));

      // ---------- simulation ----------
      function toggleEdge(id) {
        if (busy) return;
        if (state.edges[id]) { delete state.edges[id]; log.add('Edge in **' + M.city(id).name + '** switched off.', 'info'); }
        else { state.edges[id] = { cached: false }; log.add('Edge in **' + M.city(id).name + '** switched on. It starts empty, so its first request will be a miss.', 'info'); }
        render();
      }
      async function sendFrom(ids) {
        if (busy) return; busy = true;
        try {
          for (let i = 0; i < ids.length; i++) {
            const c = M.city(ids[i]), r = M.request(state, ids[i]); results[ids[i]] = r;
            if (r.via === 'origin') log.add(c.name + ' → origin (' + M.city(state.origin).name + ') → **' + r.ms + ' ms**. No CDN, so the whole journey is paid every time.', 'warn');
            else if (r.via === 'edge-hit') { nHit++; log.add(c.name + ' → edge in ' + M.city(r.edge).name + ' → **HIT**, **' + r.ms + ' ms**. The copy was already there.', 'good'); }
            else if (r.via === 'edge-miss') { nMiss++; log.add(c.name + ' → edge in ' + M.city(r.edge).name + ' → **MISS**: it fetched from the origin and kept a copy. **' + r.ms + ' ms**.', 'warn'); }
            else { nFail++; log.add(c.name + ' → **failed** ✗ ' + r.error, 'bad'); }
            goals(ids[i], r);
            render();
            if (ids.length > 1) { await api.sleep(250); if (!api.alive()) return; }
          }
        } finally { if (api.alive()) busy = false; }
      }
      function goals(cid, r) {
        if (cid === 'syd') {
          if (r.via === 'origin' && !Object.keys(state.edges).length) api.goal('far');
          if (r.edge === 'syd') { if (r.via === 'edge-hit' && prevSyd === 'edge-miss') api.goal('edge'); prevSyd = r.via; } else prevSyd = null;
        }
        if (purged && r.via === 'edge-miss') { api.goal('purge'); purged = false; }
        if (!state.originUp && r.via === 'edge-hit') api.goal('shield');
      }
      function render() {
        sOrigin.set(M.city(state.origin).name); sHits.set(nHit); sMiss.set(nMiss); sFail.set(nFail, nFail ? 'bad' : '');
        KS.clear(linesG); KS.clear(dotsG);
        const oc = M.city(state.origin), op = proj(oc);
        CITIES.forEach(c => {
          const row = rows[c.id], r = results[c.id], e = state.edges[c.id];
          row.btn.textContent = e ? (e.cached ? 'Edge: on (copy cached)' : 'Edge: on (empty)') : 'Edge: off';
          row.btn.classList.toggle('primary', !!e);
          if (r) row.meter.set(r.ok ? Math.min(1, r.ms / 400) : 1, r.ok ? r.ms + ' ms · ' + { origin: 'origin', 'edge-hit': 'edge hit', 'edge-miss': 'edge miss' }[r.via] : 'FAILED', r.ok ? (r.ms < 60 ? 'good' : r.ms < 200 ? 'warn' : 'bad') : 'bad');
          else row.meter.set(0, 'not measured yet');
          if (r && r.via !== 'fail' || r && r.edge) {
            const cp = proj(c), tp = r.edge ? proj(M.city(r.edge)) : op;
            const tone = r.ok ? (r.via === 'edge-hit' ? 'var(--good)' : 'var(--warn)') : 'var(--bad)';
            linesG.appendChild(KS.s('line', { x1: cp[0], y1: cp[1], x2: tp[0], y2: tp[1], style: { stroke: tone, strokeWidth: '1.2' } }));
            if (r.edge && r.via === 'edge-miss') linesG.appendChild(KS.s('line', { x1: tp[0], y1: tp[1], x2: op[0], y2: op[1], style: { stroke: 'var(--warn)', strokeWidth: '1', strokeDasharray: '3 2' } }));
          }
        });
        CITIES.forEach(c => {
          const p = proj(c), e = state.edges[c.id];
          dotsG.appendChild(KS.s('circle', { cx: p[0], cy: p[1], r: 3, style: { fill: 'var(--text)' } }));
          if (e) dotsG.appendChild(KS.s('rect', { x: p[0] - 5, y: p[1] - 5, width: 10, height: 10, rx: 2, style: { fill: e.cached ? 'var(--accent-2)' : 'none', stroke: 'var(--accent-2)', strokeWidth: '1.5' } }));
          dotsG.appendChild(KS.s('text', { x: p[0] + 6, y: p[1] - 5, style: { fill: 'var(--muted)', fontSize: '7px', fontWeight: '700' } }, c.name));
        });
        dotsG.appendChild(KS.s('circle', { cx: op[0], cy: op[1], r: 6, style: { fill: state.originUp ? 'var(--warn)' : 'var(--bad)', stroke: 'var(--bg-2)', strokeWidth: '1.5' } }));
      }
      log.add('The origin is in London. Press **Send** next to Sydney and see how long a faraway user waits.', 'info');
      render();
    }
  });
})();
