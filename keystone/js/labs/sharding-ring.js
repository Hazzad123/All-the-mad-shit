/* Lab: sharding-ring — hash mod N reshuffles almost everything; consistent hashing moves only a slice. */
(function () {
  'use strict';
  const h = KS.h, s = KS.s;
  const NKEYS = 60, VN = 24, SPACE = 4294967296, ALL = ['A', 'B', 'C', 'D', 'E', 'F'];
  const COLORS = ['var(--accent)', 'var(--good)', 'var(--warn)', 'var(--info)', 'var(--bad)', 'var(--accent-2)'];
  const colorOf = n => COLORS[ALL.indexOf(n)];

  // ======================= pure model =======================
  /** 32-bit FNV-1a followed by a murmur-style finaliser, so similar names land far apart. */
  function hash(str) {
    let x = 2166136261;
    for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); }
    x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
    return x >>> 0;
  }
  const KEYS = Array.from({ length: NKEYS }, (_, i) => ({ id: i + 1, pos: hash('user:' + (i + 1)) }));
  function ringPoints(nodes, v) {
    const pts = []; nodes.forEach(n => { for (let i = 0; i < v; i++) pts.push({ pos: hash(n + '#' + i), node: n }); });
    return pts.sort((a, b) => a.pos - b.pos);
  }
  function ownerRing(pts, kh) { for (let i = 0; i < pts.length; i++) if (pts[i].pos >= kh) return pts[i].node; return pts[0].node; }
  function layout(S) {
    const map = {};
    if (S.mode === 'mod') KEYS.forEach(k => { map[k.id] = S.nodes[k.pos % S.nodes.length]; });
    else { const pts = ringPoints(S.nodes, S.vnodes ? VN : 1); KEYS.forEach(k => { map[k.id] = ownerRing(pts, k.pos); }); }
    return map;
  }
  const countsOf = (nodes, owners) => { const c = {}; nodes.forEach(n => { c[n] = 0; }); KEYS.forEach(k => { c[owners[k.id]]++; }); return c; };
  function spreadOf(counts) { const v = Object.keys(counts).map(k => counts[k]), m = v.reduce((a, b) => a + b, 0) / v.length; return Math.sqrt(v.reduce((a, b) => a + (b - m) * (b - m), 0) / v.length); }
  function ringSpread(nodes, v) { const S = { mode: 'ring', nodes, vnodes: v }; return spreadOf(countsOf(nodes, layout(S))); }
  function newState() { const S = { mode: 'mod', vnodes: false, nodes: ['A', 'B', 'C'], owners: null, moved: {}, movedN: null, events: [], flags: {} }; S.owners = layout(S); return S; }
  const ev = (S, t, tone) => S.events.push([t, tone || '']);

  /** Recompute owners after a change; returns {moved: [ids], from: {node: n}, to: {node: n}}. */
  function relayout(S) {
    const old = S.owners; S.owners = layout(S); S.moved = {};
    const r = { moved: [], from: {}, to: {} };
    KEYS.forEach(k => { const a = old[k.id], b = S.owners[k.id]; if (a !== b) { r.moved.push(k.id); S.moved[k.id] = true; r.from[a] = (r.from[a] || 0) + 1; r.to[b] = (r.to[b] || 0) + 1; } });
    S.movedN = r.moved.length; return r;
  }
  const list = o => Object.keys(o).sort().map(k => o[k] + ' from Node ' + k).join(', ') || 'none';
  const pct = n => Math.round(n / NKEYS * 100) + '%';

  function addNode(S) {
    if (S.nodes.length >= 6) { ev(S, 'Six nodes is the maximum in this lab.', 'warn'); return false; }
    const name = ALL.find(n => S.nodes.indexOf(n) < 0); S.nodes.push(name);
    const r = relayout(S), fair = Math.round(NKEYS / S.nodes.length);
    if (S.mode === 'mod') {
      ev(S, '➕ **Node ' + name + ' added.** The rule is "owner = hash(key) mod N", and N changed from ' + (S.nodes.length - 1) + ' to ' + S.nodes.length + '. A key only stays put if both remainders happen to agree. **Moved ' + r.moved.length + ' of ' + NKEYS + ' keys (' + pct(r.moved.length) + ')** — each one must be copied across the network. A perfect scheme would move about ' + fair + '.', r.moved.length > NKEYS / 2 ? 'bad' : 'warn');
      if (r.moved.length > NKEYS / 2) S.flags.mod = true;
    } else {
      ev(S, '➕ **Node ' + name + ' added** at its own spot on the ring. It only takes over the keys that sit just before it (anticlockwise) — they came from ' + list(r.from) + '. **Moved ' + r.moved.length + ' of ' + NKEYS + ' keys (' + pct(r.moved.length) + ')**; every other key stays exactly where it was.', r.moved.length < NKEYS * 0.4 ? 'good' : 'warn');
      if (r.moved.length < NKEYS * 0.4) S.flags.ring = true;
    }
    return true;
  }
  function removeNode(S, name) {
    if (S.nodes.length <= 2) { ev(S, 'Keep at least two nodes.', 'warn'); return false; }
    const i = S.nodes.indexOf(name); if (i < 0) return false;
    const mine = KEYS.filter(k => S.owners[k.id] === name).length;
    S.nodes.splice(i, 1); const r = relayout(S);
    if (S.mode === 'mod') ev(S, '➖ **Node ' + name + ' removed.** It owned ' + mine + ' keys, so only ' + mine + ' really had to move — but N changed, so **' + r.moved.length + ' of ' + NKEYS + ' keys (' + pct(r.moved.length) + ')** moved.', r.moved.length > mine + 5 ? 'bad' : 'warn');
    else { ev(S, '➖ **Node ' + name + ' removed.** Its ' + mine + ' keys slid clockwise to the next node on the ring: ' + (Object.keys(r.to).sort().map(k => r.to[k] + ' to Node ' + k).join(', ') || 'none') + '. Nobody else\'s keys moved (**' + r.moved.length + ' of ' + NKEYS + '**).', 'good'); if (mine > 0) S.flags.remove = true; }
    return true;
  }
  function setMode(S, mode) {
    if (S.mode === mode) return; S.mode = mode; S.owners = layout(S); S.moved = {}; S.movedN = null;
    ev(S, 'Switched to **' + (mode === 'mod' ? 'hash mod N**: owner = hash(key) mod number-of-nodes. Add a node and watch the damage.' : 'consistent hashing**: nodes and keys both sit on a ring; a key belongs to the first node clockwise from it. Add a node now.'), 'info');
  }
  function setVnodes(S, on) {
    if (S.vnodes === on) return; const before = spreadOf(countsOf(S.nodes, S.owners)); S.vnodes = on;
    if (S.mode !== 'ring') { ev(S, 'Virtual nodes only matter on the ring. Switch to **consistent hashing** to see them.', 'warn'); return; }
    const r = relayout(S), after = spreadOf(countsOf(S.nodes, S.owners));
    ev(S, on ? '🔸 **Virtual nodes on.** Each server now appears ' + VN + ' times around the ring, so its share is the sum of many small slices instead of one lucky or unlucky one. Unevenness (σ): ' + before.toFixed(1) + ' → **' + after.toFixed(1) + '**. ' + r.moved.length + ' keys moved to even things out.' : '🔸 Virtual nodes off: one spot per server again. Unevenness (σ): ' + before.toFixed(1) + ' → ' + after.toFixed(1) + '.', on && after < before ? 'good' : 'info');
  }
  function goalsOf(S) {
    const g = []; ['mod', 'ring', 'remove'].forEach(k => { if (S.flags[k]) g.push(k); });
    if (S.mode === 'ring' && S.vnodes && ringSpread(S.nodes, true) < ringSpread(S.nodes, false)) g.push('vnodes');
    return g;
  }

  // ======================= the lab =======================
  KS.labs.register({
    id: 'sharding-ring',
    title: 'Sharding Ring',
    emoji: '🍩',
    blurb: 'Sixty keys, a handful of servers. Add and remove nodes and count how many keys have to move.',
    tags: ['sharding', 'consistent hashing', 'partitioning', 'distributed systems', 'scaling'],
    goals: [
      { id: 'mod', text: 'Under **hash mod N**, add a node and see **more than half** the keys move' },
      { id: 'ring', text: 'On the **ring**, add a node and move **fewer than 40%** of the keys' },
      { id: 'remove', text: '**Remove** a node on the ring and see where its keys go' },
      { id: 'vnodes', text: 'Turn on **virtual nodes** and make the spread more even' }
    ],
    help: `Too much data for one database, so it is split across several servers (**shards**). Each of the 60 **keys** (think user ids) needs exactly one owner.

- **Hash mod N**: owner = a scrambled number from the key, divided by the node count, remainder. Simple, but change N and most keys get a new owner, so most data must be copied.
- **Consistent hashing**: servers and keys are both hashed onto a **ring**. A key belongs to the first server clockwise from it. A new server steals only the slice just before it.
- **Virtual nodes**: one server appears many times around the ring, so shares even out.

Highlighted keys are the ones that **moved** on the last change. Coloured arcs on the ring show who owns which stretch.`,

    _model: { hash, newState, addNode, removeNode, setMode, setVnodes, goalsOf, countsOf, ringSpread, layout, KEYS },

    mount(root, api) {
      const ui = api.ui;
      let S = newState();
      const log = ui.log(60);
      const view = h('div'), meters = h('div.lab-stack'), nodeRow = h('div.lab-row');
      const stMoved = ui.stat('moved on the last change', '–'), stSpread = ui.stat('unevenness (σ)', '–');
      const modeSeg = ui.seg([['mod', 'Hash mod N'], ['ring', 'Consistent hashing']], 'mod', v => { setMode(S, v); flush(); });
      const vnTog = ui.toggle('Virtual nodes (ring only)', false, v => { setVnodes(S, v); if (S.vnodes !== v) vnTog.set(S.vnodes); flush(); });

      root.appendChild(ui.panel('Controls', ui.row(modeSeg), ui.row(ui.btn('➕ Add a node', () => { addNode(S); flush(); }, 'primary'), vnTog, ui.btn('Reset', () => { S = newState(); modeSeg.set('mod'); vnTog.set(false); log.add('— Reset: nodes A, B, C —', 'info'); flush(); }, 'ghost')),
        h('p.muted.small', 'Tap a node below to remove it:'), nodeRow));
      root.appendChild(h('div.lab-grid2', ui.panel('Where the 60 keys live', view, h('p.muted.small', 'Highlighted = moved on the last change.')),
        h('div.lab-stack', ui.panel('Keys per server', meters, ui.stats(stMoved, stSpread)), ui.panel('What just happened', log.el))));

      function drawRing() {
        const cx = 160, cy = 160, pt = (pos, r) => { const a = pos / SPACE * 2 * Math.PI; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
        const svg = s('svg', { viewBox: '0 0 320 320', role: 'img', 'aria-label': 'Hash ring with servers and keys', style: { width: '100%', maxWidth: '380px', display: 'block', margin: '0 auto' } });
        const pts = ringPoints(S.nodes, S.vnodes ? VN : 1), R = 118;
        svg.appendChild(s('circle', { cx, cy, r: R, style: { fill: 'none', stroke: 'var(--line)', strokeWidth: 10 } }));
        pts.forEach((p, i) => {
          const prev = pts[(i + pts.length - 1) % pts.length], d = (p.pos - prev.pos + SPACE) % SPACE;
          if (pts.length === 1 || d === 0) return;
          const a = pt(prev.pos, R), b = pt(p.pos, R);
          svg.appendChild(s('path', { d: 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' A' + R + ' ' + R + ' 0 ' + (d > SPACE / 2 ? 1 : 0) + ' 1 ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1), style: { fill: 'none', stroke: colorOf(p.node), strokeWidth: 10, opacity: 0.45 } }));
        });
        KEYS.forEach(k => { const p = pt(k.pos, 96), mv = S.moved[k.id]; svg.appendChild(s('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: mv ? 5.5 : 3.5, style: { fill: colorOf(S.owners[k.id]), stroke: mv ? 'var(--text)' : 'none', strokeWidth: 2 } })); });
        pts.forEach(p => {
          const q = pt(p.pos, 134);
          if (S.vnodes) svg.appendChild(s('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 3, style: { fill: colorOf(p.node) } }));
          else { svg.appendChild(s('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 12, style: { fill: colorOf(p.node) } })); svg.appendChild(s('text', { x: q[0].toFixed(1), y: (q[1] + 4.5).toFixed(1), 'text-anchor': 'middle', style: { fill: 'var(--bg-2)', fontWeight: 800, fontSize: '13px' } }, p.node)); }
        });
        svg.appendChild(s('text', { x: cx, y: cy - 2, 'text-anchor': 'middle', style: { fill: 'var(--text)', fontWeight: 800, fontSize: '15px' } }, S.nodes.length + ' servers'));
        svg.appendChild(s('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', style: { fill: 'var(--muted)', fontSize: '11px' } }, 'dots = keys, big = moved'));
        return svg;
      }
      function drawBuckets() {
        const wrap = h('div.lab-stack');
        S.nodes.forEach(n => {
          const mine = KEYS.filter(k => S.owners[k.id] === n);
          wrap.appendChild(h('div', h('b', { style: { color: colorOf(n) } }, 'Node ' + n + ' · ' + mine.length + ' keys'),
            h('div.lab-cells', { style: { marginTop: '4px' } }, mine.map(k => h('div.lab-cell' + (S.moved[k.id] ? '.hl' : ''), { style: { borderColor: colorOf(n), minWidth: '32px', padding: '3px 5px' } }, String(k.id))))));
        });
        return wrap;
      }
      function render() {
        KS.clear(view); view.appendChild(S.mode === 'ring' ? drawRing() : drawBuckets());
        const counts = countsOf(S.nodes, S.owners), mx = Math.max.apply(null, S.nodes.map(n => counts[n])) || 1;
        KS.clear(meters);
        S.nodes.forEach(n => { const m = ui.meter('Node ' + n); m.set(counts[n] / mx, counts[n] + ' keys'); meters.appendChild(m.el); });
        KS.clear(nodeRow);
        S.nodes.forEach(n => nodeRow.appendChild(h('button.btn.sm', { type: 'button', style: { borderColor: colorOf(n) }, onclick: () => { removeNode(S, n); flush(); } }, '✕ ' + n)));
        stMoved.set(S.movedN == null ? '–' : S.movedN + ' / ' + NKEYS, S.movedN == null ? '' : S.movedN > NKEYS / 2 ? 'bad' : S.movedN < NKEYS * 0.4 ? 'good' : 'warn');
        stSpread.set(spreadOf(counts).toFixed(1));
      }
      function flush() { S.events.splice(0).forEach(e => log.add(e[0], e[1])); render(); goalsOf(S).forEach(g => api.goal(g)); }
      log.add('Sixty keys are shared between nodes A, B and C. Press **Add a node** and look at "moved".', 'info');
      render();
    }
  });
})();
