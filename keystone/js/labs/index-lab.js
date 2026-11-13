/* Lab: index-lab — scan every row vs. binary-search an index; every index also taxes writes. The table is modelled by size, not stored. */
KS.labs.register({
  id: 'index-lab',
  title: 'Index Lab',
  emoji: '🔎',
  blurb: 'Find one user among up to a million. Race a full scan against an index, then see what indexes cost on writes.',
  tags: ['databases', 'indexes', 'performance', 'b-tree', 'sql'],
  goals: [
    { id: 'scan', text: 'Look up an email **without an index** in a table of 100,000+ rows' },
    { id: 'seek', text: 'Add the **email index** and find a row in **under 25 steps**' },
    { id: 'miss', text: 'Search a column that has **no index** (while another has one) and get a scan anyway' },
    { id: 'write', text: 'Run the **write benchmark** and compare 0 indexes with 3' }
  ],
  help: `A **users table** with up to a million rows. To find one user by email the database has two choices.

A **full scan** reads every row from the top and checks it: 1,000,000 rows means 1,000,000 reads.

An **index** is a second, sorted copy of one column with pointers to the rows. Because it is sorted, the database can **halve** the search space each step (binary search; real databases use a wide tree called a **B-tree**, but the idea is the same). A million rows take only about **20 steps**.

But an index only helps searches on the column it covers, and it is not free: every **insert** must also update each index. More indexes, slower writes.

Times shown are rough estimates (about 2 µs per row scanned, 0.1 ms per index step).`,

  mount(root, api) {
    const ui = api.ui, h = api.h;
    const COLS = [['email', 'email'], ['city', 'city'], ['signup', 'signup date']];
    const idx = { email: false, city: false, signup: false };
    let exp = 5, col = 'email', busy = false;
    const size = () => Math.max(100, Math.round(Math.pow(10, exp)));
    const fmt = KS.fmtNum;
    const scanMs = rows => rows * 0.002, stepMs = 0.1;
    const msText = ms => ms < 1 ? ms.toFixed(2) + ' ms' : ms < 100 ? ms.toFixed(1) + ' ms' : Math.round(ms) + ' ms';

    // ---------- model ----------
    /** Real binary search over a virtual sorted column of `n` positions (no rows are stored). */
    function descent(n, target) {
      const steps = []; let lo = 0, hi = n - 1;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2), left = hi - lo + 1;
        const verdict = mid === target ? 'found it' : mid < target ? 'too low, go right' : 'too high, go left';
        steps.push({ mid, left, verdict });
        if (mid === target) break;
        if (mid < target) lo = mid + 1; else hi = mid - 1;
      }
      return steps;
    }
    const btreeHeight = n => Math.max(1, Math.ceil(Math.log(n) / Math.log(100)));
    /** Page touches to insert one row: 1 for the table, plus for each index walking down + writing the leaf. */
    function insertCost(n, k) { return 1 + k * (btreeHeight(n) + 1); }

    // ---------- UI ----------
    const log = ui.log(40);
    const sizeLabel = h('span.lab-mono');
    const slider = ui.slider('Table size (rows)', { min: 2, max: 6, step: 0.05, value: exp, fmt: v => fmt(Math.max(100, Math.round(Math.pow(10, v)))) }, v => { exp = v; });
    const toggles = COLS.map(c => ui.toggle('Index on ' + c[1], false, v => { idx[c[0]] = v; log.add('Index on **' + c[1] + '** ' + (v ? 'created. The database builds a sorted copy of that column.' : 'dropped.'), 'info'); }));
    const seg = ui.seg(COLS.map(c => [c[0], 'by ' + c[1]]), col, v => { col = v; });
    const lookBtn = ui.btn('🔍 Look up a user', () => lookup(), 'primary');
    const benchBtn = ui.btn('✍️ Write benchmark: insert 1,000 rows', () => bench());
    root.appendChild(ui.panel('Controls', slider, h('div', { style: { height: '8px' } }), ui.row(toggles), h('div', { style: { height: '8px' } }), h('div.muted.small', 'Search the table…'), ui.row(seg), h('div', { style: { height: '8px' } }), ui.row(lookBtn, benchBtn)));

    const scanM = ui.meter('Full scan'), idxM = ui.meter('Index lookup');
    const sScan = ui.stat('rows read', '–'), sSteps = ui.stat('index steps', '–'), sFast = ui.stat('index is faster by', '–');
    const query = h('div.lab-mono', { style: { marginBottom: '8px' } }, 'SELECT * FROM users WHERE … ;');
    root.appendChild(ui.panel('The race', query, scanM.el, h('div', { style: { height: '8px' } }), idxM.el, h('div', { style: { height: '10px' } }), ui.stats(sScan, sSteps, sFast)));
    const stepsHost = h('div');
    root.appendChild(h('div.lab-grid2', ui.panel('How the index narrows it down', stepsHost), ui.panel('What just happened', log.el)));
    const benchHost = h('div.lab-stack');
    const bm = [0, 1, 2, 3].map(k => { const m = ui.meter(k + (k === 1 ? ' index' : ' indexes')); benchHost.appendChild(m.el); return m; });
    root.appendChild(ui.panel('Cost of writes: inserting 1,000 rows', benchHost));
    bm.forEach(m => m.set(0, 'not run yet'));
    stepsHost.appendChild(h('p.muted.small', 'Look something up with an index on and the halving steps will appear here.'));

    function renderSteps(steps, n, shownUpTo) {
      KS.clear(stepsHost);
      stepsHost.appendChild(h('div.lab-table-wrap', h('table.lab-table',
        h('thead', h('tr', ['step', 'rows still possible', 'look at row', 'verdict'].map(t => h('th', t)))),
        h('tbody', steps.slice(0, shownUpTo).map((s, i) => h('tr', { class: s.verdict === 'found it' ? 'good' : null }, h('td', String(i + 1)), h('td', fmt(s.left)), h('td', '#' + fmt(s.mid + 1)), h('td', s.verdict)))))));
    }

    // ---------- the race ----------
    async function lookup() {
      if (busy) return;
      busy = true; lookBtn.disabled = benchBtn.disabled = true;
      const n = size(), c = col, useIdx = !!idx[c], target = Math.floor(Math.random() * n);
      const what = c === 'email' ? 'email = \'user' + (target + 1) + '@example.com\'' : c === 'city' ? 'city = \'Leeds\'' : 'signup = \'2025-03-14\'';
      query.textContent = 'SELECT * FROM users WHERE ' + what + ';';
      const colLabel = COLS.filter(x => x[0] === c)[0][1];
      sScan.set('–'); sSteps.set('–'); sFast.set('–'); scanM.set(0, 'waiting…', ''); idxM.set(0, 'waiting…', '');
      KS.clear(stepsHost);
      log.add('Table of **' + fmt(n) + ' rows**, searching by **' + colLabel + '**' + (useIdx ? ' (indexed)' : ' (no index)') + '.', 'info');
      const steps = useIdx ? descent(n, target) : [];
      const scanTotal = scanMs(n), scanDur = Math.max(350, Math.min(2400, scanTotal));
      // The scan lane and the index lane run side by side; the index finishes first.
      const parts = 24;
      let idxDone = 0, scanPart = 0;
      if (!useIdx) idxM.set(0, 'no usable index: not used', 'warn');
      const total = Math.max(parts, steps.length);
      for (let t = 1; t <= total; t++) {
        await api.sleep(scanDur / total);
        if (!api.alive()) return;
        scanPart = t / total;
        scanM.set(scanPart, fmt(Math.round(n * scanPart)) + ' of ' + fmt(n) + ' rows read', 'warn');
        if (useIdx && idxDone < steps.length) {
          idxDone++;
          renderSteps(steps, n, idxDone);
          idxM.set(idxDone / steps.length, idxDone + ' step' + (idxDone === 1 ? '' : 's'), idxDone === steps.length ? 'good' : '');
        }
      }
      scanM.set(1, fmt(n) + ' rows read · ≈ ' + msText(scanTotal), 'bad');
      sScan.set(fmt(n), 'bad');
      if (useIdx) {
        const ims = steps.length * stepMs;
        idxM.set(1, steps.length + ' steps · ≈ ' + msText(ims), 'good'); sSteps.set(steps.length, 'good'); sFast.set('×' + fmt(Math.max(1, Math.round(scanTotal / ims))), 'good');
        log.add('**Index:** ' + steps.length + ' steps (the rows still possible halve each time: ' + fmt(n) + ' → … → 1). **Scan:** ' + fmt(n) + ' rows. The index is about **' + fmt(Math.max(1, Math.round(scanTotal / ims))) + '× faster** here.', 'good');
        if (n >= 10000 && c === 'email' && steps.length < 25) api.goal('seek');
      } else {
        log.add('**No index on ' + colLabel + '**, so the database has no shortcut: it reads **all ' + fmt(n) + ' rows** and checks each one (≈ ' + msText(scanTotal) + ').' + (Object.keys(idx).some(k => idx[k]) ? ' Your other index does not help, because it is sorted by a different column.' : ' Try switching on an index and look up again.'), 'bad');
        if (n >= 100000 && c === 'email') api.goal('scan');
        if (Object.keys(idx).some(k => idx[k])) api.goal('miss');
      }
      busy = false; lookBtn.disabled = benchBtn.disabled = false;
    }

    // ---------- the write benchmark ----------
    async function bench() {
      if (busy) return;
      busy = true; lookBtn.disabled = benchBtn.disabled = true;
      const n = size(), rows = 1000, costs = [0, 1, 2, 3].map(k => insertCost(n, k) * rows), max = costs[3];
      log.add('Inserting **1,000 rows** into a table of ' + fmt(n) + ', with 0, 1, 2 and 3 indexes. Each row is written to the table, then every index must be updated to stay sorted.', 'info');
      bm.forEach(m => m.set(0, 'running…'));
      for (let k = 0; k < 4; k++) {
        for (let s = 1; s <= 5; s++) {
          await api.sleep(60);
          if (!api.alive()) return;
          bm[k].set(costs[k] * s / 5 / max, fmt(Math.round(costs[k] * s / 5)) + ' page writes/reads', k === 0 ? 'good' : k === 3 ? 'bad' : 'warn');
        }
      }
      log.add('**0 indexes:** ' + fmt(costs[0]) + ' units of work. **3 indexes:** ' + fmt(costs[3]) + ', about **' + (costs[3] / costs[0]).toFixed(0) + '× more** for the same rows. Indexes speed up reads and slow down writes, so add only the ones your queries need.', 'warn');
      api.goal('write');
      busy = false; lookBtn.disabled = benchBtn.disabled = false;
    }
  }
});
