/* Lab: kanban-sim — limiting work in progress makes work finish sooner (flow simulation with cycle-time measurement). */
KS.labs.register({
  id: 'kanban-sim',
  title: 'Kanban Simulator',
  emoji: '📋',
  blurb: 'A team pushes tasks across a board. Find the bottleneck, cap the work in progress and watch tasks finish sooner.',
  tags: ['kanban', 'agile', 'wip limits', 'cycle time', 'flow'],
  goals: [
    { id: 'baseline', text: 'Run **30 days with no limits** and note the cycle time' },
    { id: 'bottleneck', text: 'Spot the **bottleneck** column and tap it' },
    { id: 'flow', text: 'Keep every column **within its limit for 20 days**' },
    { id: 'limit', text: 'Set **WIP limits**, Start over, and after 60 days cut cycle time by a **quarter**' }
  ],
  help: `The board has three working columns: **Dev**, **Review** and **Test**. Each has a fixed number of people, and every task needs a random amount of work in each column. A day passes every tick; each person does one day of work.

**Cycle time** is how many days a task takes from the moment someone starts it until it is done (shown as the average of the last 8 finished tasks). **WIP** (work in progress) is how many tasks are started but not finished.

Without limits, developers keep starting new tasks while **Review** (one person, the **bottleneck**) cannot keep up, so finished code just queues. Everything waits longer, and nothing ships any faster. A **WIP limit** caps how many cards a column may hold. When a column is full, the one before it stops starting new work instead of piling more on.

Experiment: run unlimited, note the cycle time, set limits, press **Start over** and compare.`,

  mount(root, api) {
    const ui = api.ui, h = api.h;

    // ---- model (pure, no DOM; one call of step() = one day) ----
    const COLS = ['dev', 'review', 'test'];
    const NAMES = { dev: 'Dev', review: 'Review', test: 'Test' };
    const WORKERS = { dev: 4, review: 1, test: 2 };
    const RANGE = { dev: [2, 5], review: [2, 4], test: [1, 3] };
    function mulberry(seed) { let a = seed >>> 0; return function () { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    function create(seed, limits) {
      return { seed: seed, rnd: mulberry(seed), day: 0, nextId: 1, cols: { dev: [], review: [], test: [] }, done: [], doneByDay: [], limits: Object.assign({ dev: 0, review: 0, test: 0 }, limits || {}), noLimDays: 0, limDays: 0, flowStreak: 0, busy: { dev: 0, review: 0, test: 0 } };
    }
    function drawSize(st, c) { const r = RANGE[c]; return r[0] + Math.floor(st.rnd() * (r[1] - r[0] + 1)); }
    function unfinished(col) { return col.filter(c => c.rem > 0); }
    function full(st, c) { const l = st.limits[c]; return l > 0 && st.cols[c].length >= l; }
    // Advance one day. Returns {blocked: {col: true}} for columns held back by a WIP limit.
    function step(st) {
      st.day++;
      const blocked = {};
      for (let i = COLS.length - 1; i >= 0; i--) {                       // 1. finished cards move right if there is room
        const col = st.cols[COLS[i]];
        col.slice().forEach(card => {
          if (card.rem > 0) return;
          if (i === COLS.length - 1) { col.splice(col.indexOf(card), 1); card.cycle = card.finDay - card.start + 1; st.done.push(card); return; }
          const nxt = COLS[i + 1];
          if (full(st, nxt)) { blocked[COLS[i]] = true; return; }
          col.splice(col.indexOf(card), 1); card.rem = card.sizes[nxt]; st.cols[nxt].push(card);
        });
      }
      const dev = st.cols.dev;                                           // 2. idle developers pull new cards from the backlog
      while (unfinished(dev).length < WORKERS.dev) {
        if (full(st, 'dev')) { blocked.todo = true; break; }
        const sizes = { dev: drawSize(st, 'dev'), review: drawSize(st, 'review'), test: drawSize(st, 'test') };
        dev.push({ id: st.nextId++, start: st.day, sizes: sizes, rem: sizes.dev, finDay: 0, cycle: 0 });
      }
      COLS.forEach(c => {                                                // 3. everyone does one day of work, oldest card first
        const work = unfinished(st.cols[c]).slice(0, WORKERS[c]);
        st.busy[c] += work.length;
        work.forEach(card => { card.rem--; if (card.rem <= 0) card.finDay = st.day; });
      });
      st.doneByDay.push(st.done.length);
      const allLimited = COLS.every(c => st.limits[c] > 0), none = COLS.every(c => !st.limits[c]);
      if (none) st.noLimDays++;
      if (allLimited) st.limDays++;
      st.flowStreak = allLimited && COLS.every(c => st.cols[c].length <= st.limits[c]) ? st.flowStreak + 1 : 0;
      return { blocked: blocked };
    }
    function avgCycle(st) { const r = st.done.slice(-8); return r.length ? r.reduce((s, c) => s + c.cycle, 0) / r.length : 0; }   // average of the 8 most recently finished cards
    function wip(st) { return COLS.reduce((s, c) => s + st.cols[c].length, 0); }
    function oldest(st) { let m = 0; COLS.forEach(c => st.cols[c].forEach(k => { m = Math.max(m, st.day - k.start + 1); })); return m; }
    function throughput(st) { const n = Math.min(10, st.day); return n ? (st.done.length - (st.doneByDay[st.day - 1 - n] || 0)) / n : 0; }
    function bottleneck() {                                                 // slowest column: workers / average task size
      let best = null, rate = Infinity;
      COLS.forEach(c => { const mean = (RANGE[c][0] + RANGE[c][1]) / 2, r = WORKERS[c] / mean; if (r < rate) { rate = r; best = c; } });
      return best;
    }
    // ---- end model ----

    let st = create(12345);
    let running = false, speed = 6, acc = 0, base = null, found = false, blockedSeen = {};

    // ---- UI ----
    const log = ui.log(60);
    const runBtn = ui.btn('▶ Start', () => setRunning(!running), 'primary');
    const speedSeg = ui.seg([['2', 'Slow'], ['6', 'Fast'], ['20', 'Turbo']], '6', v => { speed = +v; });
    const limOpts = [['0', 'No limit']].concat([1, 2, 3, 4, 5, 6, 8].map(n => [String(n), String(n)]));
    const limSel = {};
    COLS.forEach(c => { limSel[c] = ui.select(NAMES[c] + ' limit', limOpts, '0', v => setLimit(c, +v)); });
    const sDay = ui.stat('day', 0), sThr = ui.stat('done per day', '0.0', 'good'), sCyc = ui.stat('avg cycle time (days)', '–', 'accent'), sWip = ui.stat('work in progress', 0), sOld = ui.stat('oldest card (days)', 0);
    const colEls = {};
    COLS.forEach(c => { colEls[c] = { head: h('div', { style: { fontWeight: '800', fontSize: '.82rem' } }), sub: h('div.muted', { style: { fontSize: '.7rem', marginBottom: '4px' } }), cards: h('div.lab-cells', { style: { gap: '4px' } }) }; });
    const todoEl = h('div.lab-cell.dim', { style: { fontSize: '.7rem', padding: '6px 2px' } }, '📥 backlog ∞'), doneEl = h('div.lab-cell.good', { style: { fontSize: '.8rem', padding: '6px 2px' } }, '✅ 0');
    const board = h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,.6fr) repeat(3, minmax(0,1fr)) minmax(0,.6fr)', gap: '8px', alignItems: 'start' } },
      h('div', h('div', { style: { fontWeight: '800', fontSize: '.82rem', marginBottom: '14px' } }, 'To do'), todoEl),
      COLS.map(c => h('div', { style: { background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: '10px', padding: '6px', minHeight: '110px', minWidth: '0' } }, colEls[c].head, colEls[c].sub, colEls[c].cards)),
      h('div', h('div', { style: { fontWeight: '800', fontSize: '.82rem', marginBottom: '14px' } }, 'Done'), doneEl));
    const guessRow = ui.row(COLS.map(c => ui.btn(NAMES[c], () => guess(c), 'sm')));

    root.appendChild(ui.panel('Controls',
      ui.row(runBtn, speedSeg, ui.btn('↺ Start over', restart, 'ghost')),
      h('div.lab-row', { style: { marginTop: '10px' } }, COLS.map(c => limSel[c])),
      ui.row(ui.btn('✨ Try sensible limits', preset, 'sm'), ui.btn('✖ Clear limits', clearLimits, 'sm'))));
    root.appendChild(ui.panel('The board', board, h('p.muted.small', { style: { margin: '8px 0 0' } }, 'Cards: ▣ highlighted = being worked on · plain = waiting · faded = finished, waiting for room · red = over 15 days old.')));
    root.appendChild(ui.panel('Metrics', ui.stats(sDay, sThr, sCyc, sWip, sOld),
      h('div', { style: { marginTop: '10px' } }, h('b.small', 'Which column is the bottleneck? Tap your answer:'), h('div', { style: { marginTop: '6px' } }, guessRow))));
    root.appendChild(ui.panel('What just happened', log.el));

    // ---- behaviour ----
    function setRunning(v) { running = v; runBtn.textContent = running ? '⏸ Pause' : '▶ Start'; }
    function limitText(c) { return st.limits[c] > 0 ? st.cols[c].length + '/' + st.limits[c] : String(st.cols[c].length); }
    function render() {
      COLS.forEach(c => {
        const col = st.cols[c], E = colEls[c], busy = Math.min(WORKERS[c], unfinished(col).length);
        E.head.textContent = NAMES[c] + ' ' + limitText(c) + (found && c === bottleneck() ? ' 🚧' : '');
        E.sub.textContent = busy + '/' + WORKERS[c] + ' busy · ' + Math.max(0, unfinished(col).length - WORKERS[c]) + ' queued';
        E.cards.textContent = '';
        const worked = unfinished(col).slice(0, WORKERS[c]);
        col.slice(0, 24).forEach(k => {
          const age = st.day - k.start + 1, cls = k.rem <= 0 ? '.dim' : worked.indexOf(k) >= 0 ? '.hl' : age > 15 ? '.bad' : '';
          E.cards.appendChild(h('span.lab-cell' + cls, { style: { minWidth: '30px', padding: '4px 0', fontSize: '.7rem' } }, String(k.id % 100)));
        });
        if (col.length > 24) E.cards.appendChild(h('span.muted.small', '+' + (col.length - 24)));
      });
      doneEl.textContent = '✅ ' + st.done.length;
      sDay.set(st.day); sThr.set(throughput(st).toFixed(1)); sCyc.set(st.done.length ? avgCycle(st).toFixed(1) : '–'); sWip.set(wip(st)); sOld.set(oldest(st), oldest(st) > 15 ? 'bad' : '');
    }
    function setLimit(c, v) {
      if (st.limits[c] === v) return;
      st.limits[c] = v;
      log.add(v > 0 ? NAMES[c] + ' limited to **' + v + ' cards**. ' + (st.cols[c].length > v ? 'It holds ' + st.cols[c].length + ' right now, so it is **over** its limit until it drains.' : 'When it is full, the column before it stops handing over work.') : NAMES[c] + ' limit removed.', 'info');
      if (v > 0 && base) log.add('For a fair comparison with your baseline, press **Start over** and run 60 days with these limits.', 'dim');
      render();
    }
    function syncSelects() { COLS.forEach(c => limSel[c].set(String(st.limits[c]))); }
    function preset() { st.limits.dev = 3; st.limits.review = 2; st.limits.test = 2; syncSelects(); log.add('Set limits Dev **3**, Review **2**, Test **2**. Developers will now wait for room instead of piling up work for the reviewer. Press **Start over** and run 60 days to measure it fairly.', 'info'); render(); }
    function clearLimits() { COLS.forEach(c => { st.limits[c] = 0; }); syncSelects(); log.add('All limits cleared.', 'info'); render(); }
    function restart() {
      const lim = Object.assign({}, st.limits); st = create(12345, lim); acc = 0; blockedSeen = {}; setRunning(false);
      log.add('Board reset (limits kept: ' + COLS.map(c => NAMES[c] + ' ' + (lim[c] || '∞')).join(', ') + '). Press **Start**.', 'info'); render();
    }
    function guess(c) {
      if (st.day < 10) { log.add('Let the board run for at least 10 days first. Then look at where cards pile up while the people after them sit idle.', 'warn'); return; }
      if (c === bottleneck()) {
        found = true; render();
        log.add('✅ **' + NAMES[c] + '** is the bottleneck: with ' + KS.plural(WORKERS[c], 'person', 'people') + ' it can finish the fewest tasks per day, so work queues in front of it and everything after it waits for scraps. Speeding up any other column would change nothing.', 'good');
        api.goal('bottleneck');
      } else log.add('Not ' + NAMES[c] + '. The bottleneck is the column with the longest queue in front of it while the people after it have gaps. Check the "queued" counts.', 'warn');
    }
    function daily() {
      const r = step(st);
      Object.keys(r.blocked).forEach(k => {
        if (blockedSeen[k]) return; blockedSeen[k] = true;
        log.add(k === 'todo' ? 'Day ' + st.day + ': Dev is full, so developers **do not start new tasks**. Idle hands are fine: finishing beats starting.' : 'Day ' + st.day + ': ' + NAMES[k] + ' has finished cards but the next column is full, so they **wait** there. The limit is pushing back.', 'warn');
      });
      if (st.day % 10 === 0) log.add('Day ' + st.day + ': ' + KS.plural(st.done.length, 'task') + ' done, average cycle time **' + avgCycle(st).toFixed(1) + ' days**, ' + wip(st) + ' in progress, oldest card ' + oldest(st) + ' days old.', 'dim');
      if (st.noLimDays === 30 && st.done.length) {
        api.goal('baseline');
        log.add('📏 **30 days with no limits:** recent cycle time **' + avgCycle(st).toFixed(1) + ' days** and still climbing, because the queue keeps growing. Let it run to day 60 to record the baseline.', 'good');
      }
      if (st.noLimDays === 60 && !base && st.done.length) {
        base = { cycle: avgCycle(st) };
        log.add('📏 **Baseline after 60 days with no limits:** cycle time **' + base.cycle.toFixed(1) + ' days**. Remember it. Now set limits, press **Start over** and beat it.', 'good');
      }
      if (st.flowStreak === 20) { api.goal('flow'); log.add('🌊 20 days with every column inside its limit: smooth **flow**.', 'good'); }
      if (st.limDays === 60 && st.done.length) {
        const a = avgCycle(st);
        if (!base) log.add('Limited run: average cycle time **' + a.toFixed(1) + ' days**. Run 60 days with **no** limits to get a baseline to compare with.', 'info');
        else if (a <= base.cycle * 0.75) { log.add('🎯 With limits the average cycle time is **' + a.toFixed(1) + ' days** versus **' + base.cycle.toFixed(1) + '** before: **' + Math.round((1 - a / base.cycle) * 100) + '% faster** with the same people. Starting less made work finish sooner.', 'good'); api.goal('limit'); }
        else log.add('With limits: **' + a.toFixed(1) + ' days** versus the baseline ' + base.cycle.toFixed(1) + '. Not a quarter better yet: try tighter limits, especially on Review.', 'warn');
      }
      if (st.day >= 200) { setRunning(false); log.add('The simulation stops at day 200. Press **Start over** to try other limits.', 'info'); }
    }
    api.loop(dt => {
      if (!running) return;
      acc += dt * speed; let n = 0;
      while (acc >= 1 && n < 10 && running) { acc -= 1; n++; daily(); }
      if (n) render();
    });
    log.add('Press **Start**. Watch where cards pile up. With no limits, developers keep starting new tasks no matter what.', 'info');
    render();
  }
});
