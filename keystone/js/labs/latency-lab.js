/* Lab: latency-lab — computers run on wildly different time scales, and the slow tail is what users feel. */
(function () {
  'use strict';

  // ---------- pure model (exposed as def.model for Node tests) ----------
  const M = {};
  // Rough, well-known orders of magnitude (not measurements).
  M.OPS = [
    { id: 'mem', name: 'Read from memory (RAM)', ns: 100 },
    { id: 'ssd', name: 'Random read from an SSD', ns: 100000 },
    { id: 'dc', name: 'Round trip inside a data centre', ns: 500000 },
    { id: 'hdd', name: 'Hard-disk seek', ns: 10000000 },
    { id: 'ocean', name: 'Round trip across an ocean', ns: 120000000 }
  ];
  M.sortedIds = function () { return M.OPS.slice().sort(function (a, b) { return a.ns - b.ns; }).map(function (o) { return o.id; }); };
  M.op = function (id) { return M.OPS.filter(function (o) { return o.id === id; })[0]; };
  M.fmtNs = function (ns) {
    if (ns < 1e3) return Math.round(ns) + ' ns';
    if (ns < 1e6) return +(ns / 1e3).toPrecision(3) + ' µs';
    if (ns < 1e9) return +(ns / 1e6).toPrecision(3) + ' ms';
    return +(ns / 1e9).toPrecision(3) + ' s';
  };
  M.fmtDur = function (s) {
    if (s < 60) return +s.toPrecision(3) + ' seconds';
    if (s < 3600) return +(s / 60).toPrecision(3) + ' minutes';
    if (s < 86400) return +(s / 3600).toPrecision(3) + ' hours';
    if (s < 86400 * 365) return +(s / 86400).toPrecision(3) + ' days';
    return +(s / (86400 * 365)).toPrecision(3) + ' years';
  };
  /** If one memory access took `base` seconds, how long would this operation take? */
  M.human = function (ns, base) { return ns / M.OPS[0].ns * base; };
  M.percentile = function (sorted, p) {
    if (!sorted.length) return 0;
    const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p / 100 * sorted.length) - 1));
    return sorted[i];
  };
  M.stats = function (sorted) {
    let sum = 0; for (let i = 0; i < sorted.length; i++) sum += sorted[i];
    return { avg: sorted.length ? sum / sorted.length : 0, p50: M.percentile(sorted, 50), p95: M.percentile(sorted, 95), p99: M.percentile(sorted, 99), max: sorted.length ? sorted[sorted.length - 1] : 0 };
  };
  /** One call to a service: typically ~20 ms, now and then a hiccup (garbage collection, retry, busy neighbour) adds 100–500 ms. */
  M.sample = function (rnd, hiccup) {
    const u = Math.max(1e-9, rnd()), z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
    let ms = 20 * Math.exp(0.35 * z);
    if (rnd() < hiccup) ms += 100 + 400 * rnd();
    return ms;
  };
  /** n requests to one service, and n page loads that each call `fan` services and wait for the slowest. */
  M.run = function (rnd, n, hiccup, fan) {
    const single = [], page = [];
    for (let i = 0; i < n; i++) single.push(M.sample(rnd, hiccup));
    for (let i = 0; i < n; i++) { let m = 0; for (let j = 0; j < fan; j++) m = Math.max(m, M.sample(rnd, hiccup)); page.push(m); }
    single.sort(function (a, b) { return a - b; }); page.sort(function (a, b) { return a - b; });
    const s = M.stats(single), p = M.stats(page);
    let slow = 0; for (let i = 0; i < page.length; i++) if (page[i] > s.p99) slow++;
    return { single: single, page: page, s: s, p: p, fan: fan, share: slow / n };
  };
  M.histogram = function (arr, width, bins) {
    const c = []; for (let i = 0; i < bins; i++) c.push(0);
    arr.forEach(function (x) { c[Math.min(bins - 1, Math.floor(x / width))]++; });
    return c;
  };
  M.BUDGET = [
    { id: 'db', name: '1 database query', ms: 20, factor: 5, fix: 'Add an index (5× faster)' },
    { id: 'cache', name: '3 cache lookups', ms: 1.5, factor: 10, fix: 'Use a faster cache (10× faster)' },
    { id: 'api', name: '1 cross-continent API call', ms: 120, factor: 4, fix: 'Call a nearby copy (4× faster)' }
  ];

  KS.labs.register({
    id: 'latency-lab',
    title: 'Latency Lab',
    emoji: '🐢',
    blurb: 'Memory, disks and oceans live on wildly different time scales. Feel the gaps, then meet the slow tail users really notice.',
    tags: ['latency', 'performance', 'percentiles', 'tail latency', 'p99'],
    model: M,
    goals: [
      { id: 'order', text: 'Put five operations in the **correct order**, fastest first' },
      { id: 'budget', text: 'Find the **dominant cost** in the page budget and fix that first' },
      { id: 'tail', text: 'Produce a run where **p99 is over 5×** the median (p50)' },
      { id: 'fanout', text: 'Use a **10-way fan-out** and watch the slow tail become normal' }
    ],
    help: `Some things a computer does take **nanoseconds**, others take **tens of milliseconds**: a difference of a million times or more. The figures here are the famous *rough* orders of magnitude, not measurements of your machine.

- **Part 1** puts five operations in order.
- **Part 2** rescales them so a memory access takes one second, which makes the gaps something you can feel.
- **Part 3** is a page budget: tune the biggest slice first.
- **Part 4** simulates 1,000 requests. **p50** is the median (half of requests are faster); **p99** is the speed 99% of requests beat. Most users see the median, but *every* user eventually sees a slow one, especially when one page calls many services and waits for the slowest.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const log = ui.log(40);
      // persisted state (tabs re-render from it)
      let deck = KS.shuffle(M.sortedIds()), picked = [], orderResult = null;
      let base = 1;
      let budget = M.BUDGET.map(b => ({ id: b.id, name: b.name, ms: b.ms, factor: b.factor, fix: b.fix, fixed: false }));
      const sim = { hiccup: 3, fan: 1, last: null };

      // ---------- tab 1: order ----------
      function renderOrder(host) {
        KS.clear(host);
        host.appendChild(h('p', 'Tap the operations from **fastest** to **slowest**. Tap a placed one to take it back.'.replace(/\*\*/g, '')));
        const pick = h('div.lab-stack'), placed = h('div.lab-stack');
        deck.filter(id => picked.indexOf(id) < 0).forEach(id => pick.appendChild(ui.btn(M.op(id).name, () => {
          if (orderResult !== null || picked.indexOf(id) >= 0) return;
          picked.push(id);
          if (picked.length === M.OPS.length) finishOrder();
          renderOrder(host);
        })));
        picked.forEach((id, i) => placed.appendChild(ui.btn((i + 1) + '. ' + M.op(id).name + (orderResult !== null ? '   (' + M.fmtNs(M.op(id).ns) + ')' : '  ✕'), () => {
          if (orderResult !== null) return;
          picked.splice(picked.indexOf(id), 1); renderOrder(host);
        }, orderResult === null ? 'ghost' : (M.sortedIds()[i] === id ? 'primary' : 'danger'))));
        host.appendChild(h('div.lab-grid2.even', ui.panel('To place', pick.children.length ? pick : h('p.muted', 'All placed.')), ui.panel('Your order (fastest first)', picked.length ? placed : h('p.muted', 'Nothing yet.'))));
        if (orderResult !== null) {
          const correct = M.sortedIds().map(id => M.op(id).name + ' (' + M.fmtNs(M.op(id).ns) + ')');
          host.appendChild(ui.note((orderResult ? '**Correct!** ' : '**Not quite.** ') + 'The real order, fastest first: ' + correct.join(' → ') + '. These are rough figures; the point is the gaps between them.', orderResult ? 'good' : 'warn'));
          host.appendChild(ui.btn(orderResult ? 'Shuffle and play again' : 'Try again', () => { deck = KS.shuffle(M.sortedIds()); picked = []; orderResult = null; renderOrder(host); }, 'primary'));
        }
      }
      function finishOrder() {
        const want = M.sortedIds();
        orderResult = picked.every((id, i) => id === want[i]);
        log.add(orderResult ? '✓ **Correct order.** Each step is far slower than the last: RAM → SSD is about 1,000×, and a trip across an ocean is more than a million times slower than memory.' : 'That order is not right. Hard disks have moving parts and oceans are far away; both are much slower than you might expect.', orderResult ? 'good' : 'warn');
        if (orderResult) api.goal('order');
      }

      // ---------- tab 2: human scale ----------
      function renderScale(host) {
        KS.clear(host);
        host.appendChild(ui.row(h('span', 'If one memory access took'), ui.seg([['1', '1 second'], ['60', '1 minute']], String(base), v => { base = +v; renderScale(host); })));
        const rows = M.OPS.map(o => h('tr', h('td', o.name), h('td.lab-mono', M.fmtNs(o.ns)), h('td', h('strong', M.fmtDur(M.human(o.ns, base))))));
        host.appendChild(h('div.lab-table-wrap', h('table.lab-table', h('thead', h('tr', h('th', 'Operation'), h('th', 'Really (rough)'), h('th', 'At human scale'))), h('tbody', rows))));
        host.appendChild(ui.note('At this scale, a hard-disk seek is like waiting **' + M.fmtDur(M.human(M.op('hdd').ns, base)) + '** and an ocean crossing **' + M.fmtDur(M.human(M.op('ocean').ns, base)) + '**. That is why programs avoid disks and distant servers whenever they can.'));
      }

      // ---------- tab 3: page budget ----------
      function renderBudget(host) {
        KS.clear(host);
        const total = budget.reduce((a, b) => a + b.ms, 0), orig = M.BUDGET.reduce((a, b) => a + b.ms, 0);
        host.appendChild(h('p', 'Building one page takes these steps, one after another. You only have time to fix one thing first. Which?'));
        const colours = { db: 'var(--accent)', cache: 'var(--good)', api: 'var(--warn)' };
        const bar = h('div', { style: { display: 'flex', height: '34px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--line-2)', background: 'var(--panel-3)' } },
          budget.map(b => h('div', { style: { width: Math.max(1.5, b.ms / total * 100) + '%', background: colours[b.id], minWidth: '3px' }, 'aria-label': b.name + ' ' + +b.ms.toPrecision(3) + ' ms' })));
        host.appendChild(bar);
        host.appendChild(h('p.lab-mono', 'Total: ' + +total.toPrecision(3) + ' ms' + (total < orig ? '  (saved ' + +(orig - total).toPrecision(3) + ' ms, ' + Math.round((orig - total) / orig * 100) + '%)' : '')));
        budget.forEach(b => {
          host.appendChild(h('div.lab-stack', { style: { marginBottom: '10px' } },
            h('div', h('span', { style: { display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: colours[b.id], marginRight: '8px' } }), h('strong', b.name), ' · ' + +b.ms.toPrecision(3) + ' ms · ' + Math.round(b.ms / total * 100) + '% of the page'),
            ui.btn(b.fixed ? 'Already fixed' : 'Fix first: ' + b.fix, () => fixBudget(b, host), b.fixed ? 'ghost' : 'primary')));
        });
        host.appendChild(ui.btn('Reset the budget', () => { budget.forEach((b, i) => { b.ms = M.BUDGET[i].ms; b.fixed = false; }); renderBudget(host); }, 'ghost'));
      }
      function fixBudget(b, host) {
        if (b.fixed) return;
        const biggest = budget.reduce((m, x) => x.ms > m.ms ? x : m, budget[0]);
        const total = budget.reduce((a, x) => a + x.ms, 0), before = b.ms;
        b.ms = b.ms / b.factor; b.fixed = true;
        const saved = before - b.ms;
        if (b === biggest) {
          log.add('You fixed the **biggest slice** (' + b.name + ') and saved **' + +saved.toPrecision(3) + ' ms**, ' + Math.round(saved / total * 100) + '% of the page. Always find the dominant cost first.', 'good');
          api.goal('budget');
        } else {
          log.add('You fixed ' + b.name + ', but it was only ' + Math.round(before / total * 100) + '% of the page, so you saved just **' + +saved.toPrecision(3) + ' ms**. The biggest cost is **' + biggest.name + '** (' + +biggest.ms.toPrecision(3) + ' ms). Reset and try that one.', 'warn');
        }
        renderBudget(host);
      }

      // ---------- tab 4: the tail ----------
      function renderTail(host) {
        KS.clear(host);
        const out = h('div.lab-stack');
        host.appendChild(h('div.lab-stack',
          h('p', 'A service usually answers in about 20 ms, but now and then it hiccups (a pause, a retry) and takes 100 to 500 ms longer. Send 1,000 requests and look at the **percentiles**.'.replace(/\*\*/g, '')),
          ui.row(ui.slider('Hiccup chance', { min: 0, max: 5, step: 0.5, value: sim.hiccup, fmt: x => x + '%' }, x => { sim.hiccup = x; }),
            ui.slider('Services called per page', { min: 1, max: 20, value: sim.fan, fmt: x => x === 1 ? '1 (no fan-out)' : x + ' at once' }, x => { sim.fan = x; })),
          ui.row(ui.btn('🚀 Send 1,000 requests', () => { runTail(); renderTail(host); }, 'primary')), out));
        const r = sim.last;
        if (!r) { out.appendChild(h('p.muted', 'No run yet.')); return; }
        const f = x => (x < 10 ? x.toFixed(1) : Math.round(x)) + ' ms';
        const rows = [['average', 'avg'], ['p50 (median)', 'p50'], ['p95', 'p95'], ['p99', 'p99'], ['slowest', 'max']].map(k => h('tr', h('td', k[0]), h('td', f(r.s[k[1]])), h('td', h('strong', f(r.p[k[1]])))));
        out.appendChild(h('div.lab-table-wrap', h('table.lab-table', h('thead', h('tr', h('th', ''), h('th', 'One service'), h('th', 'Page calling ' + r.fan))), h('tbody', rows))));
        const counts = M.histogram(r.fan > 1 ? r.page : r.single, 40, 16), top = Math.max.apply(null, counts), lg = Math.log(1 + top);
        out.appendChild(h('div', h('div.muted.small', 'How long ' + (r.fan > 1 ? 'page loads' : 'requests') + ' took (bar heights use a log scale so the rare slow ones stay visible)'),
          h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '2px', height: '90px', marginTop: '6px' } }, counts.map(c => h('div', { style: { flex: '1', height: Math.max(c ? 3 : 0, lg ? Math.log(1 + c) / lg * 100 : 0) + '%', background: 'var(--accent)', borderRadius: '3px 3px 0 0' } }))),
          h('div.muted.small', { style: { display: 'flex', justifyContent: 'space-between' } }, h('span', '0 ms'), h('span', '320 ms'), h('span', '600+ ms'))));
        out.appendChild(ui.note('Single service: p99 is **' + (r.s.p50 ? (r.s.p99 / r.s.p50).toFixed(1) : '?') + '×** the median. ' + (r.fan > 1 ? 'With **' + r.fan + '** services per page, **' + (r.share * 100).toFixed(1) + '%** of page loads were slower than the single-service p99 (for one service that is 1%).' : 'Raise "services called per page" and send again.'), r.share > 0.05 ? 'warn' : undefined));
      }
      function runTail() {
        const r = M.run(KS.rng(String(Math.random()) + Date.now()), 1000, sim.hiccup / 100, sim.fan);
        sim.last = r;
        log.add('Sent 1,000 requests (hiccup chance ' + sim.hiccup + '%). One service: median **' + Math.round(r.s.p50) + ' ms**, p95 ' + Math.round(r.s.p95) + ' ms, p99 **' + Math.round(r.s.p99) + ' ms**, average ' + Math.round(r.s.avg) + ' ms.', 'info');
        if (r.s.p99 > 5 * r.s.p50) { api.goal('tail'); log.add('p99 is **' + (r.s.p99 / r.s.p50).toFixed(1) + '×** the median: 1 in 100 requests is many times slower than a typical one. The average hides this.', 'warn'); }
        if (r.fan > 1) log.add('Pages calling **' + r.fan + ' services** wait for the slowest. **' + (r.share * 100).toFixed(1) + '%** of page loads hit something slower than a single service\'s p99. Chance of at least one slow call: 1 − 0.99^' + r.fan + ' = ' + ((1 - Math.pow(0.99, r.fan)) * 100).toFixed(1) + '%.', 'warn');
        if (r.fan >= 10 && r.share >= 0.03) { api.goal('fanout'); log.add('With a wide fan-out the "rare" slow case is now the **normal** one for a visible share of users.', 'bad'); }
      }

      const tabs = ui.tabs([['order', '1 Order', renderOrder], ['scale', '2 Human scale', renderScale], ['budget', '3 Page budget', renderBudget], ['tail', '4 The tail', renderTail]]);
      root.appendChild(ui.panel('Choose a part', tabs.el));
      root.appendChild(ui.panel('What just happened', log.el));
      log.add('Start with part 1: which is faster, a read from memory or from an SSD? By how much?', 'info');
    }
  });
})();
