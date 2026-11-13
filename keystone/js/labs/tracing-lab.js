/* Lab: tracing-lab — a trace shows where the time went across services. */
(function () {
  'use strict';

  /* ---------- pure model: build span trees and lay them out on a timeline (ms) ---------- */
  /* model:start */
  // N(name, service, msBefore, msAfter, children, opts): a span; its duration = before + children + after.
  // opts.par = children run at the same time; otherwise one after another.
  function N(name, svc, pre, post, kids, o) { return { name: name, svc: svc, pre: pre, post: post, kids: kids || [], o: o || {} }; }
  function L(name, svc, dur, o) { return N(name, svc, dur, 0, [], o); }
  function layout(node, start, depth, parent, out) {
    var sp = { name: node.name, svc: node.svc, start: start, depth: depth, parent: parent, culprit: !!node.o.culprit, tags: node.o.tags || {}, dur: 0, self: 0, below: false, kids: [], idx: out.length };
    out.push(sp); if (parent) parent.kids.push(sp);
    var t = start + node.pre, end = t, i;
    if (node.o.par) { for (i = 0; i < node.kids.length; i++) { var k = layout(node.kids[i], t, depth + 1, sp, out); end = Math.max(end, t + k.dur); } }
    else { for (i = 0; i < node.kids.length; i++) { var k2 = layout(node.kids[i], end, depth + 1, sp, out); end += k2.dur; } }
    sp.dur = end - start + node.post;
    var iv = sp.kids.map(function (c) { return [c.start, c.start + c.dur]; }).sort(function (a, b) { return a[0] - b[0]; }), covered = 0, cur = null;
    iv.forEach(function (x) { if (!cur || x[0] > cur[1]) { if (cur) covered += cur[1] - cur[0]; cur = [x[0], x[1]]; } else cur[1] = Math.max(cur[1], x[1]); });
    if (cur) covered += cur[1] - cur[0];
    sp.self = sp.dur - covered;
    return sp;
  }
  function build(root) {
    var out = []; var r = layout(root, 0, 0, null, out);
    out.forEach(function (s) { if (s.culprit) { var p = s.parent; while (p) { p.below = true; p = p.parent; } } });
    return { spans: out, total: r.dur };
  }
  /* model:end */

  const SVCS = ['gateway', 'checkout', 'cart', 'pricing', 'payment', 'bank-api', 'database', 'queue'];
  const VARS = ['--accent', '--accent-2', '--good', '--warn', '--info', '--bad', '--muted', '--faint'];
  const q = (s) => ({ tags: { 'db.statement': s } });

  function cart(kids) { return N('GET /cart', 'cart', 2, 2, kids || [L('SELECT cart', 'database', 14, q('SELECT * FROM carts WHERE user_id = ?'))]); }
  function pricing(kids) { return N('POST /price', 'pricing', 3, 2, kids || [L('SELECT prices', 'database', 18, q('SELECT * FROM prices WHERE sku IN (?)'))]); }
  function payment(kids) { return N('POST /charge', 'payment', 4, 3, kids || [L('POST bank.example/charge', 'bank-api', 85, { culprit: true, tags: { 'http.url': 'https://bank.example/charge', 'http.status': 200 } })]); }
  function publish() { return L('PUBLISH email.send', 'queue', 4, { tags: { 'messaging.destination': 'email.send' } }); }
  function checkout(kids, o) { return N('GET /checkout', 'gateway', 3, 2, [N('POST /checkout', 'checkout', 5, 4, kids, o)]); }

  const DEFS = [
    { id: 't0', label: 'Normal', title: 'Normal request', build() { return checkout([cart(), pricing(), payment(), publish()]); },
      ask: 'This is a healthy request. Find the span with the most **self time** (time spent in the span itself, not waiting on its children).',
      hint: 'Look for the widest bar that has nothing nested under it.',
      explain: 'Yes: the call to the **bank** is the biggest piece. Even a healthy request has a longest span, so the skill is knowing what is *normal* for your system.' },
    { id: 't1', label: 'Slow A', title: 'Slow trace A', build() {
        const items = [L('SELECT cart items', 'database', 8, q('SELECT * FROM cart_items WHERE cart_id = ?'))];
        for (let i = 1; i <= 24; i++) items.push(L('SELECT product ' + i, 'database', 14, { culprit: true, tags: { 'db.statement': 'SELECT * FROM products WHERE id = ' + (100 + i), 'loop.index': i } }));
        return checkout([cart(items), pricing(), payment(), publish()]); },
      ask: 'This request is far slower than normal. Tap the span you blame.',
      hint: 'Do not look for one fat bar. Look at the cart: what pattern repeats?',
      explain: 'That is an **N+1 query**: one query to get the cart, then one more *per item*. 24 tiny queries add up to hundreds of milliseconds. The fix is to fetch all the products in a single query.' },
    { id: 't2', label: 'Slow B', title: 'Slow trace B', build() { return checkout([cart(), pricing(), payment([L('POST bank.example/charge', 'bank-api', 1850, { culprit: true, tags: { 'http.url': 'https://bank.example/charge', 'http.status': 200 } })]), publish()]); },
      ask: 'Another slow one. Tap the span you blame.',
      hint: 'Find the one bar that dwarfs everything else.',
      explain: 'The **external bank API** took almost two seconds. Nothing inside your own services is wrong; you are waiting on someone else. Typical fixes: a timeout, a circuit breaker, or doing the call asynchronously.' },
    { id: 't3', label: 'Slow C', title: 'Slow trace C', build() {
        const att = (n, ms, bad) => L('POST bank.example/charge (attempt ' + n + ')', 'bank-api', ms, { culprit: true, tags: bad ? { 'http.status': 'timeout', error: true } : { 'http.status': 200 } });
        const wait = (ms) => L('sleep (backoff ' + ms + ' ms)', 'payment', ms, { culprit: true, tags: { retry: true } });
        return checkout([cart(), pricing(), payment([att(1, 800, true), wait(200), att(2, 800, true), wait(400), att(3, 90, false)]), publish()]); },
      ask: 'One more slow one. Tap the span you blame.',
      hint: 'Look inside the payment call. Is the same thing happening more than once?',
      explain: 'A **retry storm**: the payment service called the bank, timed out, waited, tried again, timed out again, and only the third attempt worked. Each failed attempt and each pause adds up. Retries need limits and timeouts.' },
    { id: 't4', label: 'Slow D', title: 'Slow trace D', par: true, build(par) {
        const call = (n, svc, ms) => N(n, svc, 3, 2, [L('SELECT ' + svc, 'database', ms, { culprit: true, tags: { 'db.statement': 'SELECT … /* ' + svc + ' */' } })], { culprit: true });
        const three = [call('GET /cart', 'cart', 120), call('POST /price', 'pricing', 130), call('GET /stock', 'pricing', 140)];
        return checkout(par ? [N('load details (in parallel)', 'checkout', 0, 0, three, { par: true }), payment(), publish()] : three.concat([payment(), publish()])); },
      ask: 'Last slow one. Tap a span you blame.',
      hint: 'Look at the staircase shape: do those calls depend on each other?',
      explain: 'The cart, price and stock lookups **do not depend on each other**, yet they run one after another, so the times add up (a staircase). Run them at the same time and the total is only the slowest one.' }
  ];

  KS.labs.register({
    id: 'tracing-lab',
    title: 'Tracing Lab',
    emoji: '🔬',
    blurb: 'Read the waterfall of one request as it hops across services, and diagnose why the slow ones are slow.',
    tags: ['observability', 'tracing', 'latency', 'n+1', 'microservices'],
    goals: [
      { id: 'read', text: 'Open the **normal** trace and find its longest piece by self time' },
      { id: 'culprit', text: 'Correctly diagnose **two** slow traces' },
      { id: 'nplus1', text: 'Spot the **N+1** query pattern' },
      { id: 'parallel', text: 'Spot the calls that should have run **in parallel**' }
    ],
    help: `When you press "checkout", one request fans out across many services. A **trace** records that journey. Each bar is a **span**: one piece of work, drawn from when it started to when it ended, on a shared time axis.

- **Nested bars** mean "this span was waiting on those spans".
- **Self time** is the span's duration minus the time spent in its children: where the time was *actually spent*.
- Every span carries the same **trace id**, passed along from service to service, which is how the pieces are stitched together.

Tap a bar to inspect it. In the slow traces, tap the span to blame, then press the blame button. Look for **one huge bar**, **many tiny repeats**, **repeated tries** or a **staircase**.

**Sampling** keeps only some traces to save money, which can lose the rare slow one.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const ids = {}; DEFS.forEach(d => { let s = ''; for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16); ids[d.id] = s; });
      let curId = 't0', sel = null, par = false;
      const solved = {};
      const cache = {};
      const def = () => DEFS.filter(d => d.id === curId)[0];
      function trace() {
        const d = def(), key = d.id + (d.par && par ? 'p' : '');
        if (!cache[key]) cache[key] = build(d.build(d.par && par));
        return cache[key];
      }

      // ---------- UI ----------
      const log = ui.log(40);
      const askP = h('p', { style: { margin: '0 0 10px', fontWeight: '650' } });
      const chipsHost = h('div.lab-row', { style: { marginBottom: '10px' } });
      const legend = h('div.lab-row', { style: { marginTop: '10px' } });
      const wfHost = h('div', { style: { overflow: 'auto', maxHeight: '380px', border: '1px solid var(--line)', borderRadius: '12px', background: 'var(--bg-2)', padding: '6px' } });
      const detailHost = h('div');
      const feedback = h('div');
      const parHost = h('div');

      const seg = ui.seg(DEFS.map(d => [d.id, d.label]), curId, v => { curId = v; sel = null; par = false; feedback.textContent = ''; render(); });
      root.appendChild(ui.panel('Pick a trace', seg));
      root.appendChild(ui.panel('GET /checkout', askP, chipsHost, wfHost, legend));
      root.appendChild(h('div.lab-grid2', ui.panel('Span details', detailHost, feedback, parHost), ui.panel('What just happened', log.el)));

      // sampling experiment
      const sampCells = h('div.lab-cells');
      let sampling = false;
      root.appendChild(ui.panel('Sampling: what if you only keep 10% of traces?',
        h('p.muted.small', { style: { margin: '0 0 10px' } }, 'Thirty requests arrive. One of them is secretly very slow. Which traces do you get to see?'),
        ui.row(ui.toggle('Keep only 10% of traces', false, v => { sampling = v; }), ui.btn('Run 30 requests', runSampling, 'primary')),
        h('div', { style: { height: '10px' } }), sampCells));
      log.add('Tap a bar to see its details. Start with the **Normal** trace.', 'info');

      function runSampling() {
        const slowAt = Math.floor(Math.random() * 30); let kept = 0, slowKept = false;
        KS.clear(sampCells);
        for (let i = 0; i < 30; i++) {
          const slow = i === slowAt, ms = slow ? 2100 : 120 + Math.floor(Math.random() * 80), keep = !sampling || Math.random() < 0.1;
          if (keep) { kept++; if (slow) slowKept = true; }
          sampCells.appendChild(h('span.lab-cell.' + (keep ? (slow ? 'bad' : 'good') : 'dim'), keep ? ms + ' ms' : '·'));
        }
        log.add(sampling ? 'Sampling kept **' + kept + ' of 30** traces. ' + (slowKept ? 'Lucky: the slow one survived.' : 'The slow request was **thrown away**: you would never know it happened.') : 'Keeping everything: all 30 traces stored, so the slow one is **right there** (it costs more storage).', sampling && !slowKept ? 'warn' : 'good');
      }

      // ---------- rendering ----------
      function fmt(ms) { return ms >= 1000 ? (ms / 1000).toFixed(2) + ' s' : ms + ' ms'; }
      function col(svc) { return 'var(' + VARS[Math.max(0, SVCS.indexOf(svc)) % VARS.length] + ')'; }
      function render() {
        const d = def(), tr = trace(), total = Math.max(1, tr.total);
        askP.innerHTML = KS.md.inline(d.ask);
        KS.clear(chipsHost);
        chipsHost.appendChild(h('span.lab-chip.tn-accent', '⏱ ' + fmt(tr.total)));
        chipsHost.appendChild(h('span.lab-chip', tr.spans.length + ' spans'));
        chipsHost.appendChild(h('span.lab-chip.lab-mono', 'trace ' + ids[d.id].slice(0, 8) + '…'));
        chipsHost.appendChild(h('span.lab-chip' + (solved[d.id] ? '.tn-good' : ''), solved[d.id] ? '✓ diagnosed' : 'not diagnosed yet'));

        KS.clear(wfHost);
        const inner = h('div', { style: { minWidth: '560px' } });
        const axis = h('div', { style: { display: 'grid', gridTemplateColumns: '38% 62%', fontSize: '.7rem', color: 'var(--muted)', padding: '0 4px 4px' } }, h('span', 'span'), (() => {
          const t = h('div', { style: { position: 'relative', height: '14px' } });
          [0, 25, 50, 75, 100].forEach(p => t.appendChild(h('span', { style: { position: 'absolute', left: p + '%', transform: p === 100 ? 'translateX(-100%)' : p === 0 ? 'none' : 'translateX(-50%)', whiteSpace: 'nowrap' } }, fmt(Math.round(total * p / 100)))));
          return t;
        })());
        inner.appendChild(axis);
        tr.spans.forEach(sp => {
          const on = sel === sp;
          const bar = h('span', { style: { position: 'absolute', top: '3px', bottom: '3px', left: (sp.start / total * 100) + '%', width: Math.max(0.8, sp.dur / total * 100) + '%', borderRadius: '4px', background: col(sp.svc), outline: solved[d.id] && sp.culprit ? '2px solid var(--warn)' : 'none', outlineOffset: '1px' } });
          const track = h('div', { style: { position: 'relative', height: '22px', background: 'var(--panel-2)', borderRadius: '5px' } }, bar);
          const label = h('span', { style: { paddingLeft: Math.min(sp.depth, 4) * 10 + 'px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '.78rem', display: 'block' } },
            h('span', { style: { display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: col(sp.svc), marginRight: '5px' } }), sp.name, h('span', { style: { color: 'var(--muted)' } }, ' · ' + fmt(sp.dur)));
          inner.appendChild(h('button', {
            type: 'button', 'aria-label': sp.name + ', ' + fmt(sp.dur), onclick: () => { sel = sp; render(); },
            style: { display: 'grid', gridTemplateColumns: '38% 62%', alignItems: 'center', gap: '0', width: '100%', minHeight: '32px', padding: '3px 4px', background: on ? 'var(--accent-soft)' : 'transparent', border: on ? '1px solid var(--accent)' : '1px solid transparent', borderRadius: '8px', color: 'var(--text)', textAlign: 'left', cursor: 'pointer', font: 'inherit' }
          }, label, track));
        });
        wfHost.appendChild(inner);

        KS.clear(legend);
        SVCS.filter(s => tr.spans.some(x => x.svc === s)).forEach(s => legend.appendChild(h('span.lab-chip', h('span', { style: { display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: col(s) } }), s)));
        renderDetail(d, tr);
        KS.clear(parHost);
        if (d.par && solved[d.id]) {
          parHost.appendChild(h('div', { style: { marginTop: '10px' } }, ui.btn(par ? '↩ Show the original (one after another)' : '▶ Run those calls in parallel', () => {
            par = !par; sel = null; const a = trace().total; render();
            log.add(par ? 'In parallel the request would take **' + fmt(a) + '** instead of ' + fmt(build(def().build(false)).total) + '.' : 'Back to one after another: **' + fmt(a) + '**.', par ? 'good' : 'info');
          })));
        }
      }
      function renderDetail(d, tr) {
        KS.clear(detailHost);
        if (!sel || tr.spans.indexOf(sel) < 0) { detailHost.appendChild(h('p.muted', 'Tap any bar in the waterfall to inspect it.')); return; }
        const sp = sel, pairs = [['Operation', sp.name], ['Service', sp.svc], ['Starts at', fmt(sp.start)], ['Duration', fmt(sp.dur) + ' (' + Math.round(sp.dur / tr.total * 100) + '% of the trace)'], ['Self time', fmt(sp.self) + (sp.kids.length ? ' (the rest is waiting on ' + sp.kids.length + ' child span' + (sp.kids.length > 1 ? 's' : '') + ')' : ' (no children)')],
          ['trace_id', ids[d.id]], ['span_id', 'a1b2' + ('0000' + (sp.idx * 977 + 4096).toString(16)).slice(-4)], ['parent_span_id', sp.parent ? 'a1b2' + ('0000' + (sp.parent.idx * 977 + 4096).toString(16)).slice(-4) : 'none (this is the root)']];
        Object.keys(sp.tags).forEach(k => pairs.push([k, String(sp.tags[k])]));
        detailHost.appendChild(ui.kv(pairs.map(p => [p[0], '`' + String(p[1]).replace(/`/g, "'") + '`'])));
        detailHost.appendChild(h('p.muted.small', { style: { margin: '8px 0' } }, 'The same trace_id appears on every span: each service passes it along when it calls the next one.'));
        if (!solved[d.id]) detailHost.appendChild(ui.btn(d.id === 't0' ? '🎯 This is the longest piece' : '🎯 This is the culprit', () => blame(sp), 'primary'));
      }
      function say(md, tone) { KS.clear(feedback); feedback.appendChild(h('div', { style: { marginTop: '10px' } }, ui.note(md, tone))); }
      function blame(sp) {
        const d = def(), tr = trace();
        if (solved[d.id]) return;
        if (sp.culprit) {
          solved[d.id] = true;
          say('✅ **Correct.** ' + d.explain, 'good'); log.add('Diagnosed **' + d.title + '** correctly.', 'good');
          if (d.id === 't0') api.goal('read');
          if (d.id === 't1') api.goal('nplus1');
          if (d.id === 't4') api.goal('parallel');
          if (['t1', 't2', 't3', 't4'].filter(x => solved[x]).length >= 2) api.goal('culprit');
        } else if (sp.below) {
          say('🔎 **Warm.** Time is spent *inside* this span, but it is waiting on its children. Tap one of them.', 'warn'); log.add('"' + sp.name + '" is mostly waiting on something below it.', 'warn');
        } else {
          say('❌ **Not that one.** "' + sp.name + '" only used ' + fmt(sp.dur) + ' (' + Math.round(sp.dur / tr.total * 100) + '% of the trace). ' + d.hint, 'bad'); log.add('Not the culprit: ' + sp.name + ' took only ' + fmt(sp.dur) + '.', 'bad');
        }
        render();
      }
      render();
      return () => {};
    }
  });
})();
