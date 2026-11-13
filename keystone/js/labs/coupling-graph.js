/* Lab: coupling-graph — a change spreads to everything that depends on it; an interface cuts the path. */
(function () {
  // <model>
  const MODULES = [
    { id: 'report', label: 'ReportJob', x: 190, y: 34 }, { id: 'order', label: 'OrderService', x: 190, y: 108 },
    { id: 'pay', label: 'PaymentService', x: 56, y: 196 }, { id: 'invoice', label: 'InvoicePdf', x: 190, y: 196 }, { id: 'email', label: 'EmailSender', x: 324, y: 196 },
    { id: 'stripe', label: 'StripeClient', x: 56, y: 300 }, { id: 'db', label: 'Database', x: 324, y: 300 }
  ];
  // an edge "from -> to" means: from DEPENDS ON to. `t` = where along the line the interface box sits.
  const EDGES = [
    { id: 'report-order', from: 'report', to: 'order', iface: 'OrderQuery', t: 0.5 },
    { id: 'order-pay', from: 'order', to: 'pay', iface: 'PaymentPort', t: 0.5 },
    { id: 'order-invoice', from: 'order', to: 'invoice', iface: 'InvoiceMaker', t: 0.5 },
    { id: 'order-email', from: 'order', to: 'email', iface: 'Notifier', t: 0.5 },
    { id: 'order-db', from: 'order', to: 'db', iface: 'OrderRepo', t: 0.22 },
    { id: 'pay-stripe', from: 'pay', to: 'stripe', iface: 'PaymentGateway', t: 0.5 },
    { id: 'pay-db', from: 'pay', to: 'db', iface: 'PaymentStore', t: 0.5 },
    { id: 'invoice-db', from: 'invoice', to: 'db', iface: 'InvoiceStore', t: 0.5 },
    { id: 'email-db', from: 'email', to: 'db', iface: 'OutboxStore', t: 0.5 },
    { id: 'stripe-order', from: 'stripe', to: 'order', iface: 'OrderLookup', t: 0.72, optional: true }
  ];
  function modOf(id) { for (let i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return MODULES[i]; return null; }
  function edgeOf(id) { for (let i = 0; i < EDGES.length; i++) if (EDGES[i].id === id) return EDGES[i]; return null; }
  // effective arrows given the design: {iface: {edgeId: true}, shortcut: bool}
  function effEdges(d) {
    const out = [];
    EDGES.forEach(function (e) {
      if (e.optional && !d.shortcut) return;
      if (d.iface[e.id]) { out.push([e.from, 'i:' + e.id]); out.push([e.to, 'i:' + e.id]); } else out.push([e.from, e.to]);
    });
    return out;
  }
  // every node that depends (directly or through others) on `start`. Includes `start` itself only if it sits in a cycle.
  function dependents(edges, start) {
    const seen = {}, stack = [start];
    while (stack.length) { const x = stack.pop(); edges.forEach(function (e) { if (e[1] === x && !seen[e[0]]) { seen[e[0]] = true; stack.push(e[0]); } }); }
    return seen;
  }
  function blast(edges, start) { const s = dependents(edges, start); return Object.keys(s).filter(function (k) { return k !== start; }); }
  function hasCycle(edges) { return MODULES.some(function (m) { return dependents(edges, m.id)[m.id]; }); }
  function maxBlast(edges) { let best = { id: null, n: -1 }; MODULES.forEach(function (m) { const n = blast(edges, m.id).length; if (n > best.n) best = { id: m.id, n: n }; }); return best; }
  // </model>

  KS.labs.register({
    id: 'coupling-graph',
    title: 'Coupling Graph',
    emoji: '🕸️',
    blurb: 'Change one module and watch the ripple spread to everything that depends on it. Then cut the ripple with interfaces.',
    tags: ['architecture', 'coupling', 'dependencies', 'interfaces', 'design'],
    goals: [
      { id: 'blast', text: 'Change a module that **five or more** others depend on' },
      { id: 'invert', text: 'Insert an **interface** so changing StripeClient affects at most one module' },
      { id: 'cycle', text: 'Create a **cycle**, click a module to see the damage, then break it' },
      { id: 'calm', text: 'Reach a design where **no change** touches more than three modules' }
    ],
    help: `Each box is a module of a shop's code. An arrow **A → B** means "A **depends on** B": A calls B, so if B changes, A might break.

Tap a module to "change" it. Every module that depends on it, directly or through others, lights up red. Those are the things you must **re-test**. The number on each box is its blast radius.

An **interface** is a promise ("something that can charge a card"). Put one between A and B and A depends only on the promise, while B simply **implements** it. The arrow now points *towards* the interface from both sides, so changing B no longer reaches A. This is the "dependency inversion" idea.

A **cycle** (A needs B needs C needs A) is the worst case: touch any one and everything in the loop is affected.`,

    mount(root, api) {
      const ui = api.ui, h = api.h, s = api.s;
      const design = { iface: {}, shortcut: false };
      let sel = null, cycleClicked = false;
      const uid = 'cgarr' + Math.floor(Math.random() * 1e6);
      const log = ui.log(40);
      const svgHost = h('div', { style: { overflowX: 'auto' } });
      const info = h('div');
      const stBlast = ui.stat('biggest blast radius', 0, 'good');
      const togHost = h('div.lab-grid2.even');
      const cycTog = ui.toggle('Add a shortcut: StripeClient also calls OrderService (to look up the order)', false, function (v) {
        design.shortcut = v; if (!v) delete design.iface['stripe-order'];
        if (v) log.add('Shortcut added: **StripeClient → OrderService**. But OrderService → PaymentService → StripeClient already exists, so they now form a **cycle**. Click one of them.', 'warn');
        else log.add('Shortcut removed. The loop is gone.', 'good');
        afterChange();
      });
      root.appendChild(ui.panel('The modules (arrow = "depends on")', svgHost, h('div', { style: { marginTop: '10px' } }, info)));
      root.appendChild(ui.panel('Change the design', h('p.muted.small', 'Insert an interface on an arrow:'), togHost, h('div', { style: { marginTop: '10px' } }, cycTog), h('div', { style: { marginTop: '10px' } }, ui.stats(stBlast))));
      root.appendChild(ui.panel('What just happened', log.el));
      log.add('Tap **Database** to see what a change there would break.', 'info');

      function box(id) {
        if (id.slice(0, 2) === 'i:') {
          const e = edgeOf(id.slice(2)), a = modOf(e.from), b = modOf(e.to);
          return { x: a.x + (b.x - a.x) * e.t, y: a.y + (b.y - a.y) * e.t, w: e.iface.length * 5.4 + 12, h: 18 };
        }
        const m = modOf(id); return { x: m.x, y: m.y, w: 92, h: 32 };
      }
      function label(id) { return id.slice(0, 2) === 'i:' ? edgeOf(id.slice(2)).iface : modOf(id).label; }
      function pts(a, b) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const ta = Math.min((a.w / 2 + 1) / (Math.abs(dx) || 1e-9), (a.h / 2 + 1) / (Math.abs(dy) || 1e-9));
        const tb = Math.min((b.w / 2 + 4) / (Math.abs(dx) || 1e-9), (b.h / 2 + 4) / (Math.abs(dy) || 1e-9));
        return [a.x + dx * ta, a.y + dy * ta, b.x - dx * tb, b.y - dy * tb];
      }
      function tone(n) { return n >= 4 ? 'var(--bad)' : n >= 2 ? 'var(--warn)' : 'var(--good)'; }
      function select(id) {
        sel = id;
        const edges = effEdges(design), aff = blast(edges, id), cyc = !!dependents(edges, id)[id];
        const names = aff.map(label);
        if (cyc && hasCycle(edges)) cycleClicked = true;
        let text = '**' + label(id) + '** changes. ' + (aff.length ? '**' + aff.length + ' module' + (aff.length === 1 ? '' : 's') + '** depend on it and must be re-tested: ' + names.join(', ') + '.' : 'Nothing depends on it, so nothing else needs re-testing.');
        if (cyc) text += ' ⚠ It is part of a **cycle**, so it even depends on itself: the whole loop is affected.';
        log.add(text, cyc ? 'bad' : aff.length >= 4 ? 'warn' : aff.length ? 'info' : 'good');
        if (aff.length >= 5 && id.slice(0, 2) !== 'i:') api.goal('blast');
        render(); check();
      }
      function afterChange() {
        const edges = effEdges(design);
        if (sel && sel.slice(0, 2) === 'i:' && !design.iface[sel.slice(2)]) sel = null;
        if (sel === 'stripe' || sel === 'order' || sel) { /* keep selection, recomputed in render */ }
        render(); check();
        void edges;
      }
      function check() {
        const edges = effEdges(design), cyc = hasCycle(edges), mb = maxBlast(edges);
        if (design.iface['pay-stripe'] && blast(edges, 'stripe').length <= 1) api.goal('invert');
        if (cycleClicked && !cyc) api.goal('cycle');
        if (!cyc && mb.n <= 3) api.goal('calm');
      }
      function node(id, edges, aff, hot) {
        const b = box(id), isI = id.slice(0, 2) === 'i:', isSel = id === sel, isAff = !!aff[id];
        const stroke = isSel ? 'var(--accent)' : isAff ? 'var(--bad)' : isI ? 'var(--accent-2)' : 'var(--line-2)';
        const fill = isSel ? 'var(--accent-soft)' : isAff ? 'var(--bad-soft)' : 'var(--panel-2)';
        const kids = [s('rect', { x: b.x - b.w / 2, y: b.y - b.h / 2, width: b.w, height: b.h, rx: isI ? 9 : 8, 'stroke-width': isSel || isAff ? 2.5 : 1.5, 'stroke-dasharray': isI ? '4 3' : null, style: { fill: fill, stroke: stroke } }),
          s('text', { x: b.x, y: b.y + 3.5, 'text-anchor': 'middle', style: { fill: 'var(--text)', fontSize: isI ? '9px' : '10.5px', fontWeight: '700', fontStyle: isI ? 'italic' : 'normal' } }, label(id))];
        if (!isI) {
          const n = blast(edges, id).length, bx = b.x + b.w / 2 - 3, by = b.y - b.h / 2;
          kids.push(s('circle', { cx: bx, cy: by, r: 9, style: { fill: tone(n) } }), s('text', { x: bx, y: by + 3.5, 'text-anchor': 'middle', style: { fill: '#052a1d', fontSize: '10px', fontWeight: '800' } }, String(n)));
        }
        return s('g', { role: 'button', tabindex: '0', 'aria-label': 'Change ' + label(id), style: { cursor: 'pointer' }, onclick: function () { select(id); }, onkeydown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(id); } } }, kids);
      }
      function render() {
        const edges = effEdges(design), aff = sel ? dependents(edges, sel) : {};
        const nodes = MODULES.map(function (m) { return m.id; });
        EDGES.forEach(function (e) { if (design.iface[e.id] && (!e.optional || design.shortcut)) nodes.push('i:' + e.id); });
        const lines = edges.map(function (e) {
          const p = pts(box(e[0]), box(e[1])), hot = sel && aff[e[0]] && (aff[e[1]] || e[1] === sel);
          return s('line', { x1: p[0], y1: p[1], x2: p[2], y2: p[3], 'stroke-width': hot ? 3 : 1.8, 'marker-end': 'url(#' + (hot ? uid + 'h' : uid) + ')', style: { stroke: hot ? 'var(--bad)' : 'var(--muted)' } });
        });
        const mk = function (id, col) { return s('marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, s('path', { d: 'M0,0 L10,5 L0,10 z', style: { fill: col } })); };
        const svg = s('svg', { viewBox: '0 0 380 335', role: 'img', 'aria-label': 'Module dependency graph', style: { display: 'block', width: '100%', minWidth: '320px', maxWidth: '520px', margin: '0 auto' } },
          s('defs', mk(uid, 'var(--muted)'), mk(uid + 'h', 'var(--bad)')), lines, nodes.map(function (id) { return node(id, edges, aff); }));
        KS.clear(svgHost); svgHost.appendChild(svg);
        KS.clear(info);
        if (sel) { const n = blast(edges, sel).length; info.appendChild(ui.note('Changing **' + label(sel) + '** affects **' + n + '** other module' + (n === 1 ? '' : 's') + '.', n >= 4 ? 'bad' : n >= 2 ? 'warn' : 'good')); }
        else info.appendChild(h('p.muted.small', 'Tap a module to change it. The number on each box is how many others it would drag along.'));
        KS.clear(togHost);
        EDGES.forEach(function (e) {
          if (e.optional && !design.shortcut) return;
          togHost.appendChild(ui.toggle(modOf(e.from).label + ' → ' + modOf(e.to).label, !!design.iface[e.id], function (v) {
            design.iface[e.id] = v;
            log.add(v ? 'Inserted **' + e.iface + '** between ' + modOf(e.from).label + ' and ' + modOf(e.to).label + '. ' + modOf(e.from).label + ' now depends only on the interface, and ' + modOf(e.to).label + ' implements it. Changing ' + modOf(e.to).label + ' no longer reaches ' + modOf(e.from).label + '.' : 'Removed **' + e.iface + '**: ' + modOf(e.from).label + ' depends directly on ' + modOf(e.to).label + ' again.', v ? 'good' : 'info');
            afterChange();
          }));
        });
        const mb = maxBlast(edges), cyc = hasCycle(edges);
        stBlast.set(mb.n + ' (' + modOf(mb.id).label + ')', cyc ? 'bad' : mb.n <= 3 ? 'good' : 'warn');
      }
      render();
    }
  });
})();
