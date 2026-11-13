/* Lab: event-sourcing-lab — a bank account stored as a log of events; state is the sum of the log. */
KS.labs.register({
  id: 'event-sourcing-lab',
  title: 'Event Sourcing Lab',
  emoji: '📜',
  blurb: 'Store what happened, not what is true now. Replay the log to get the balance, travel back in time and watch a read model lag behind.',
  tags: ['event sourcing', 'CQRS', 'architecture', 'snapshots', 'eventual consistency'],
  goals: [
    { id: 'events', text: 'Record **five events** in the log' },
    { id: 'reject', text: 'Get a command **refused** (try withdrawing too much) and see that no event is stored' },
    { id: 'travel', text: '**Time travel** to an earlier balance with the slider' },
    { id: 'lag', text: 'Press **Read statement** while it is behind, then watch it catch up' },
    { id: 'snapshot', text: 'Take a **snapshot**, add events, then **rebuild** from it' }
  ],
  help: `This is a bank account, stored the unusual way. A normal database keeps one row with the **current balance** and overwrites it. Here we never overwrite anything: every accepted command appends an **event** ("Deposited 100") to a numbered, unchangeable **log**.

The balance is simply what you get by **folding** (adding up) the events from the start. Because the whole history is kept, you can slide back to any moment and see the balance as it was.

A **command** is a request ("withdraw 500"). It is checked against the current state first; if it breaks a rule it is refused and **nothing** is stored.

The **statement** is a separate **read model**, filled in by a background worker after a delay, so it can be briefly out of date (eventual consistency). A **snapshot** saves the state at some event so a rebuild only replays the events after it.`,

  mount(root, api) {
    const ui = api.ui, h = api.h;

    // ---- model (pure, no DOM) ----
    const START = { balance: 0, overdraft: 0 };
    function apply(st, ev) {
      if (ev.type === 'Deposited') return { balance: st.balance + ev.amount, overdraft: st.overdraft };
      if (ev.type === 'Withdrawn') return { balance: st.balance - ev.amount, overdraft: st.overdraft };
      if (ev.type === 'OverdraftSet') return { balance: st.balance, overdraft: ev.limit };
      return st;
    }
    // Fold events [from.n .. upTo) onto the snapshot state (or the empty account).
    function fold(events, upTo, from) {
      let st = from ? from.state : START;
      const start = from ? from.n : 0;
      for (let i = start; i < upTo && i < events.length; i++) st = apply(st, events[i]);
      return st;
    }
    function parseAmount(raw) {
      const t = String(raw == null ? '' : raw).trim();
      if (!t) return NaN;
      const v = Number(t);
      return isFinite(v) && Math.floor(v) === v ? v : NaN;
    }
    // Validate a command against the current state. Returns {ok, event} or {ok:false, code, reason}.
    function decide(st, cmd, raw) {
      const a = parseAmount(raw);
      if (isNaN(a)) return { ok: false, code: 'input', reason: 'that is not a whole number' };
      if (cmd === 'deposit') {
        if (a <= 0) return { ok: false, code: 'input', reason: 'a deposit must be more than 0' };
        return { ok: true, event: { type: 'Deposited', amount: a } };
      }
      if (cmd === 'withdraw') {
        if (a <= 0) return { ok: false, code: 'input', reason: 'a withdrawal must be more than 0' };
        if (st.balance - a < -st.overdraft) return { ok: false, code: 'funds', reason: 'balance ' + st.balance + ' minus ' + a + ' would go below the overdraft limit of ' + st.overdraft };
        return { ok: true, event: { type: 'Withdrawn', amount: a } };
      }
      if (a < 0) return { ok: false, code: 'input', reason: 'a limit cannot be negative' };
      if (st.balance < -a) return { ok: false, code: 'limit', reason: 'the account is already ' + (-st.balance) + ' overdrawn, so a limit of ' + a + ' is too low' };
      return { ok: true, event: { type: 'OverdraftSet', limit: a } };
    }
    function describe(ev) {
      if (ev.type === 'Deposited') return '💰 Deposited +' + ev.amount;
      if (ev.type === 'Withdrawn') return '💸 Withdrawn −' + ev.amount;
      return '🛡️ Overdraft limit set to ' + ev.limit;
    }
    // ---- end model ----

    const events = [];                    // the log: {n, type, amount|limit, ts}
    let viewN = 0, follow = true;         // time-travel cursor
    let snap = null;                      // {n, state}
    let proj = 0, lag = 3000, staleRead = false;   // read model: how many events it has processed

    // ---- UI ----
    const log = ui.log(50);
    const amount = ui.input('Amount', '100', () => {}, { inputmode: 'numeric', 'aria-label': 'Amount' });
    const cmdRow = ui.row(
      ui.btn('💰 Deposit', () => command('deposit'), 'primary'),
      ui.btn('💸 Withdraw', () => command('withdraw')),
      ui.btn('🛡️ Set overdraft limit', () => command('overdraft')));
    const tbody = h('tbody');
    const table = h('div.lab-table-wrap', h('table.lab-table', h('thead', h('tr', h('th', '#'), h('th', 'Event'), h('th', 'Balance after'))), tbody));
    const working = h('div.lab-mono');
    const stBalance = ui.stat('balance at this point', 0, 'accent'), stOver = ui.stat('overdraft limit', 0), stCount = ui.stat('events replayed', 0);
    const travel = ui.slider('Time travel: state after event…', { min: 0, max: 0, value: 0, fmt: v => v >= events.length ? 'latest (' + v + ')' : '#' + v }, v => {
      viewN = Math.min(v, events.length); follow = viewN >= events.length; render(); check();
    });
    const travelInput = travel.querySelector('input');
    const crudVal = h('div.lab-big', '0');
    const stmtBody = h('div.lab-stack');
    const stmtStatus = h('div.lab-chip', 'up to date');
    const lagSlider = ui.slider('Read-model delay', { min: 0, max: 6000, step: 500, value: lag, fmt: v => (v / 1000).toFixed(1) + ' s' }, v => { lag = v; });
    const snapInfo = h('div.muted.small', 'No snapshot yet.');

    root.appendChild(ui.panel('1 · Send a command', amount, cmdRow,
      h('p.muted.small', 'Commands are checked first. Only accepted ones become events. Try withdrawing before you have deposited.')));
    root.appendChild(h('div.lab-grid2',
      ui.panel('2 · The event log (append-only)', table, h('div', { style: { marginTop: '10px' } }, travel), h('div', { style: { marginTop: '8px' } }, working)),
      h('div.lab-stack',
        ui.panel('State = fold of the log', ui.stats(stBalance, stOver, stCount)),
        ui.panel('For contrast: a plain database row', crudVal, h('div.muted.small', 'It only knows "now". Where did the money come from? Gone.')))));
    root.appendChild(h('div.lab-grid2.even',
      ui.panel('3 · Read model: the statement', stmtStatus, h('div', { style: { margin: '8px 0' } }, stmtBody), lagSlider,
        ui.row(ui.btn('📄 Read statement', readStatement))),
      ui.panel('4 · Snapshots', snapInfo, ui.row(ui.btn('📸 Take snapshot', takeSnapshot), ui.btn('🔧 Rebuild from snapshot', rebuild), ui.btn('↺ Start over', reset, 'ghost')))));
    root.appendChild(ui.panel('What just happened', log.el));

    // ---- behaviour ----
    function signed(ev) { return ev.type === 'Deposited' ? '+ ' + ev.amount : '− ' + ev.amount; }
    function render() {
      viewN = Math.min(follow ? events.length : viewN, events.length);
      const st = fold(events, viewN);
      tbody.textContent = '';
      let run = START;
      if (!events.length) tbody.appendChild(h('tr.dim', h('td', '–'), h('td', 'no events yet'), h('td', '0')));
      events.forEach((ev, i) => {
        run = apply(run, ev);
        const cls = i + 1 > viewN ? 'dim' : (i + 1 === viewN && viewN < events.length ? 'hl' : '');
        tbody.appendChild(h('tr' + (cls ? '.' + cls : ''), h('td', String(ev.n)), h('td', describe(ev)), h('td', ev.type === 'OverdraftSet' ? '(unchanged) ' + run.balance : String(run.balance))));
      });
      const terms = events.slice(0, viewN).filter(e => e.type !== 'OverdraftSet').map(signed);
      const shown = terms.length > 8 ? '0 … ' + terms.slice(-8).join(' ') : ['0'].concat(terms).join(' ');
      working.textContent = 'balance = ' + shown + ' = ' + st.balance;
      stBalance.set(st.balance, st.balance < 0 ? 'bad' : 'accent'); stOver.set(st.overdraft); stCount.set(viewN);
      travelInput.max = String(events.length); travel.set(viewN);
      crudVal.textContent = String(fold(events, events.length).balance);
      renderStatement();
    }
    function renderStatement() {
      stmtBody.textContent = '';
      if (!proj) stmtBody.appendChild(h('div.muted.small', 'The statement is empty.'));
      const from = Math.max(0, proj - 4);
      for (let i = from; i < proj; i++) stmtBody.appendChild(h('div.lab-mono', '#' + events[i].n + '  ' + describe(events[i])));
      if (proj) stmtBody.appendChild(h('div', h('b', 'Statement balance: ' + fold(events, proj).balance)));
      const behind = events.length - proj;
      stmtStatus.textContent = behind > 0 ? '⏳ behind by ' + KS.plural(behind, 'event') : '✓ up to date';
      stmtStatus.className = 'lab-chip' + (behind > 0 ? ' tn-warn' : ' tn-good');
    }
    function command(cmd) {
      if (events.length >= 200) { log.add('The demo log is full (200 events). Press **Start over**.', 'warn'); return; }
      const st = fold(events, events.length);
      const raw = amount.get();
      const d = decide(st, cmd, raw);
      if (!d.ok) {
        const note = d.code === 'input' ? 'Refused: ' + d.reason + '. Nothing stored.' : 'Command **refused** because ' + d.reason + '. **No event was stored**: the log still has ' + KS.plural(events.length, 'event') + '.';
        log.add(note, 'bad');
        if (d.code !== 'input') api.goal('reject');
        return;
      }
      const ev = Object.assign({ n: events.length + 1, ts: Date.now() }, d.event);
      events.push(ev);
      const after = fold(events, events.length);
      log.add('Accepted → appended event **#' + ev.n + '**: ' + describe(ev) + '. Folding the log now gives balance **' + after.balance + '**.', 'good');
      if (cmd === 'overdraft') log.add('Limits are facts too: this is stored as an event, not a changed column.', 'dim');
      render(); check();
    }
    function readStatement() {
      const real = fold(events, events.length).balance, shown = fold(events, proj).balance;
      if (proj < events.length) {
        staleRead = true;
        log.add('You read the statement: it shows **' + shown + '** but the real balance is **' + real + '**. The read model has not processed ' + KS.plural(events.length - proj, 'event') + ' yet (**stale read**). Wait and it will catch up.', 'warn');
      } else log.add('You read the statement: **' + shown + '**. It is up to date. Add an event and read again quickly to catch it being stale.', 'info');
    }
    function takeSnapshot() {
      if (!events.length) { log.add('Nothing to snapshot yet: the log is empty.', 'warn'); return; }
      snap = { n: events.length, state: fold(events, events.length) };
      snapInfo.textContent = 'Snapshot saved after event #' + snap.n + ' (balance ' + snap.state.balance + ').';
      log.add('📸 Snapshot saved: state after event **#' + snap.n + '** is balance ' + snap.state.balance + '. Add more events, then rebuild.', 'info');
    }
    function rebuild() {
      if (!snap) { log.add('Take a snapshot first, so there is something to rebuild from.', 'warn'); return; }
      const later = events.length - snap.n;
      const quick = fold(events, events.length, snap), full = fold(events, events.length);
      const same = quick.balance === full.balance && quick.overdraft === full.overdraft;
      log.add('Rebuilt from snapshot #' + snap.n + ' + ' + KS.plural(later, 'later event') + ' (instead of replaying all ' + events.length + '): balance **' + quick.balance + '**. A full replay gives ' + full.balance + (same ? ' ✓ identical.' : ' ✗ different!'), same ? 'good' : 'bad');
      if (same && later >= 1) api.goal('snapshot');
      else if (same) log.add('The snapshot is the latest event, so nothing was left to replay. Add an event, then rebuild again.', 'dim');
    }
    function reset() {
      events.length = 0; snap = null; proj = 0; viewN = 0; follow = true; staleRead = false;
      snapInfo.textContent = 'No snapshot yet.'; log.add('Started over with an empty log.', 'info'); render();
    }
    function check() {
      if (events.length >= 5) api.goal('events');
      if (viewN < events.length && fold(events, viewN).balance !== fold(events, events.length).balance) api.goal('travel');
    }

    api.every(200, () => {                // the background projector that feeds the read model
      const now = Date.now(); const before = proj;
      while (proj < events.length && events[proj].ts + lag <= now) proj++;
      if (proj !== before) {
        renderStatement();
        if (proj === events.length && staleRead) { log.add('The statement **caught up** (eventual consistency): it now matches the log.', 'good'); api.goal('lag'); }
      }
    });
    log.add('Welcome. Press **Deposit** to record your first event.', 'info');
    render();
  }
});
