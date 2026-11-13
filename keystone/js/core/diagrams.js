/* Keystone — diagram renderers used by lesson cards: sequence, flow, layers, compare, steps. */
(function () {
  'use strict';
  const KS = window.KS, h = KS.h, s = KS.s;
  const D = (KS.dia = {});

  const AUTO_ICON = [
    [/user|customer|person|alice|bob|you\b|human|developer|attacker|admin/i, '🧑'], [/browser|web ?app|spa|frontend/i, '🌐'], [/phone|mobile|app\b|client/i, '📱'],
    [/auth|identity|idp|login|keycloak|okta/i, '🔐'], [/dns|resolver|registry|directory/i, '📒'], [/cache|redis|memcached/i, '⚡'], [/cdn|edge/i, '🌍'],
    [/queue|broker|kafka|rabbit|topic|bus|stream/i, '📬'], [/db|database|postgres|mysql|mongo|store|replica|leader|follower|shard|warehouse/i, '🗄️'],
    [/load ?balancer|lb\b|proxy|gateway|nginx|router/i, '⚖️'], [/worker|consumer|job|lambda|function/i, '⚙️'], [/api|service|server|backend|origin|resource/i, '🖥️'],
    [/bank|payment|stripe/i, '🏦'], [/email|mail|notification/i, '✉️'], [/ca\b|certificate/i, '📜'], [/monitor|metrics|logs|trace/i, '📈'], [/cloud|internet/i, '☁️']
  ];
  function autoIcon(name) { for (let i = 0; i < AUTO_ICON.length; i++) if (AUTO_ICON[i][0].test(name)) return AUTO_ICON[i][1]; return '🔷'; }

  // ======================= sequence =======================
  /**
   * card: { actors: ['Browser', {name:'Server', icon:'🖥️'}], steps: [
   *   { from: 0|'Browser', to: 1|'Server', label: 'GET /', note: 'markdown' },
   *   { at: 1, label: 'checks password', note },   // something an actor does by itself
   *   { note: 'narration only' } ] }
   */
  D.sequence = function (card) {
    const actors = (card.actors || []).map(function (a) { return typeof a === 'string' ? { name: a, icon: autoIcon(a) } : { name: a.name, icon: a.icon || autoIcon(a.name) }; });
    const n = actors.length; const steps = card.steps || [];
    const idx = function (v) { if (typeof v === 'number') return v; const i = actors.findIndex(function (a) { return a.name === v; }); return i < 0 ? 0 : i; };
    let cur = 0;
    const rows = steps.map(function (st, i) {
      let msg;
      if (st.from != null && st.to != null) {
        const a = idx(st.from), b = idx(st.to);
        msg = h('div.seq-msg.' + (b >= a ? 'dir-r' : 'dir-l') + (st.dashed ? '.dashed' : ''), { style: { '--a': Math.min(a, b), '--b': Math.max(a, b) } }, h('span.seq-label', { html: KS.md.inline(st.label || '') }), h('i.seq-line'));
      } else if (st.at != null) {
        msg = h('div.seq-msg.self', { style: { '--a': idx(st.at) } }, h('span.seq-label', { html: KS.md.inline(st.label || '') }));
      } else msg = h('div.seq-msg.narr', { html: KS.md.inline(st.label || st.note || '') });
      return h('div.seq-row', { dataset: { i: i }, onclick: function () { go(i); } }, h('span.seq-num', String(i + 1)), msg);
    });
    const lines = h('div.seq-lines'); for (let k = 0; k < n; k++) lines.appendChild(h('i', { style: { left: 'calc(' + (k + 0.5) + ' * 100% / ' + n + ')' } }));
    const caption = h('div.seq-caption');
    const counter = h('span.seq-count');
    const prevB = h('button.btn.sm.ghost', { type: 'button', onclick: function () { go(cur - 1); } }, '◀ Back');
    const nextB = h('button.btn.sm', { type: 'button', onclick: function () { go(cur + 1); } }, 'Next step ▶');
    const allB = h('button.btn.sm.ghost', { type: 'button', onclick: function () { go(steps.length - 1); } }, 'Show all');
    const root = h('div.seq', { style: { '--n': n } },
      h('div.seq-scroll', h('div.seq-inner', { style: { minWidth: (n * 96) + 'px' } },
        h('div.seq-actors', actors.map(function (a) { return h('div.seq-actor', h('span.seq-ico', a.icon), h('span', a.name)); })),
        h('div.seq-rows', lines, rows))),
      caption, h('div.seq-ctrl', prevB, counter, nextB, allB));
    function go(i) {
      cur = KS.clamp(i, 0, steps.length - 1);
      rows.forEach(function (r, k) { r.classList.toggle('shown', k <= cur); r.classList.toggle('cur', k === cur); });
      const st = steps[cur] || {};
      caption.innerHTML = '<b>Step ' + (cur + 1) + '.</b> ' + KS.md.inline(st.note || st.label || '');
      counter.textContent = (cur + 1) + ' / ' + steps.length;
      prevB.disabled = cur === 0; nextB.disabled = cur >= steps.length - 1; allB.style.visibility = cur >= steps.length - 1 ? 'hidden' : '';
      root.classList.toggle('complete', cur >= steps.length - 1);
    }
    go(0);
    root._advance = function () { if (cur < steps.length - 1) { go(cur + 1); return true; } return false; };
    return root;
  };

  // ======================= flow (boxes & arrows on a grid) =======================
  /**
   * card: { nodes: [{id, label, icon, x, y, tone}], edges: [{from, to, label, dashed, both}], groups: [{label, x, y, w, h}] }
   * x/y are grid cells (0-based). Keep to <= 4 columns so it stays readable on phones.
   */
  D.flow = function (card) {
    const CW = 172, CH = 104, NW = 136, NH = 62, PAD = 14;
    const nodes = card.nodes || []; const edges = card.edges || []; const groups = card.groups || [];
    let maxX = 0, maxY = 0;
    nodes.forEach(function (n) { if (n.x > maxX) maxX = n.x; if (n.y > maxY) maxY = n.y; });
    groups.forEach(function (g) { maxX = Math.max(maxX, g.x + (g.w || 1) - 1); maxY = Math.max(maxY, g.y + (g.h || 1) - 1); });
    const W = (maxX + 1) * CW + PAD * 2, H = (maxY + 1) * CH + PAD * 2;
    const mid = 'ar' + Math.random().toString(36).slice(2, 8);
    const svg = s('svg.flow-svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': card.title || 'diagram' });
    const defs = s('defs');
    const mk = s('marker', { id: mid, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
    mk.appendChild(s('path.flow-head', { d: 'M0 0 L10 5 L0 10 z' })); defs.appendChild(mk); svg.appendChild(defs);
    const cx = function (n) { return PAD + n.x * CW + CW / 2; }, cy = function (n) { return PAD + n.y * CH + CH / 2; };
    groups.forEach(function (g) {
      const gx = PAD + g.x * CW + 6, gy = PAD + g.y * CH + 4, gw = (g.w || 1) * CW - 12, gh = (g.h || 1) * CH - 8;
      svg.appendChild(s('rect.flow-group', { x: gx, y: gy, width: gw, height: gh, rx: 14 }));
      if (g.label) svg.appendChild(s('text.flow-group-label', { x: gx + 10, y: gy + 15 }, g.label));
    });
    const byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
    function border(n, tx, ty) { // point where the line from n's centre towards (tx,ty) leaves n's box
      const x = cx(n), y = cy(n); const dx = tx - x, dy = ty - y; if (!dx && !dy) return [x, y];
      const hw = NW / 2 + 3, hh = NH / 2 + 3; const sc = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
      return [x + dx * sc, y + dy * sc];
    }
    const labels = [];
    edges.forEach(function (e) {
      const a = byId[e.from], b = byId[e.to]; if (!a || !b) return;
      const p1 = border(a, cx(b), cy(b)), p2 = border(b, cx(a), cy(a));
      const attrs = { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], 'marker-end': 'url(#' + mid + ')' };
      if (e.both) attrs['marker-start'] = 'url(#' + mid + ')';
      svg.appendChild(s('line.flow-edge' + (e.dashed ? '.dashed' : '') + (e.tone ? '.te-' + e.tone : ''), attrs));
      if (e.label) labels.push([(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, e.label]);
    });
    nodes.forEach(function (n) {
      const x = cx(n) - NW / 2, y = cy(n) - NH / 2;
      const g = s('g.flow-node' + (n.tone ? '.tn-' + n.tone : ''));
      g.appendChild(s('rect', { x: x, y: y, width: NW, height: NH, rx: 12 }));
      const words = String(n.label || '').split(/\s+/); const linesTxt = [''];
      words.forEach(function (w) { const cur = linesTxt[linesTxt.length - 1]; if ((cur + ' ' + w).trim().length > 17 && cur && linesTxt.length < 2) linesTxt.push(w); else linesTxt[linesTxt.length - 1] = (cur + ' ' + w).trim(); });
      const hasIcon = !!n.icon; const total = (hasIcon ? 20 : 0) + linesTxt.length * 15; let ty = cy(n) - total / 2;
      if (hasIcon) { g.appendChild(s('text.flow-icon', { x: cx(n), y: ty + 15, 'text-anchor': 'middle' }, n.icon)); ty += 21; }
      linesTxt.forEach(function (ln, i) { g.appendChild(s('text.flow-label', { x: cx(n), y: ty + 11 + i * 15, 'text-anchor': 'middle' }, ln)); });
      svg.appendChild(g);
    });
    labels.forEach(function (l) { svg.appendChild(s('text.flow-edge-label', { x: l[0], y: l[1] - 4, 'text-anchor': 'middle' }, l[2])); });
    return h('div.flow', h('div.flow-scroll', { style: { '--minw': Math.max(260, (maxX + 1) * 112) + 'px' } }, svg), card.caption ? h('div.flow-caption', { html: KS.md.inline(card.caption) }) : null);
  };

  // ======================= layers (a vertical stack) =======================
  /** card: { layers: [{label, note, tone, icon}] }  — first item is drawn on top. */
  D.layers = function (card) {
    return h('div.layers', (card.layers || []).map(function (l, i) {
      return h('div.layer' + (l.tone ? '.tn-' + l.tone : ''), { style: { '--i': i } },
        h('div.layer-label', l.icon ? h('span.layer-ico', l.icon) : null, h('span', { html: KS.md.inline(l.label || '') })),
        l.note ? h('div.layer-note', { html: KS.md.inline(l.note) }) : null);
    }), card.caption ? h('div.flow-caption', { html: KS.md.inline(card.caption) }) : null);
  };

  // ======================= compare (table) =======================
  /** card: { cols: ['SQL','NoSQL'], rows: [['Schema','Fixed','Flexible'], ...] } — each row = label + one cell per col. */
  D.compare = function (card) {
    const cols = card.cols || [];
    const t = h('table.cmp');
    t.appendChild(h('thead', h('tr', h('th', ''), cols.map(function (c) { return h('th', { html: KS.md.inline(c) }); }))));
    t.appendChild(h('tbody', (card.rows || []).map(function (r) { return h('tr', r.map(function (c, i) { return h(i === 0 ? 'th' : 'td', { html: KS.md.inline(c), dataset: i ? { col: cols[i - 1] || '' } : {} }); })); })));
    return h('div.cmp-wrap', t);
  };

  // ======================= steps (progressive reveal) =======================
  /** card: { steps: [{title, body}] } */
  D.steps = function (card) {
    const steps = card.steps || []; let cur = 0;
    const items = steps.map(function (st, i) {
      return h('div.pstep', { onclick: function () { if (i <= cur + 1) go(Math.max(cur, i)); } }, h('div.pstep-n', String(i + 1)), h('div.pstep-main', h('div.pstep-title', { html: KS.md.inline(st.title || '') }), h('div.pstep-body.md', { html: KS.md(st.body || '') })));
    });
    const more = h('button.btn.sm', { type: 'button', onclick: function () { go(cur + 1); } }, 'Next step ▶');
    const root = h('div.psteps', items, h('div.pstep-ctrl', more));
    function go(i) {
      cur = KS.clamp(i, 0, steps.length - 1);
      items.forEach(function (el, k) { el.classList.toggle('shown', k <= cur); el.classList.toggle('cur', k === cur); el.classList.toggle('peek', k === cur + 1); });
      more.style.display = cur >= steps.length - 1 ? 'none' : '';
    }
    go(0);
    root._advance = function () { if (cur < steps.length - 1) { go(cur + 1); return true; } return false; };
    return root;
  };
})();
