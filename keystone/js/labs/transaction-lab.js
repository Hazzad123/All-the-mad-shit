/* Lab: transaction-lab — two transactions over three bank accounts: atomicity, dirty reads, lost updates, locking. */
(function () {
  'use strict';
  const h = KS.h;
  const INIT = { A: 100, B: 100, C: 100 }, KEYS = ['A', 'B', 'C'];
  const sum = d => d.A + d.B + d.C;

  // ======================= pure model =======================
  const transfer = (from, to, amt) => ({ kind: 'transfer', title: 'Move £' + amt + ' from ' + from + ' to ' + to, ops: [
    { t: 'BEGIN' }, { t: 'READ', k: from, v: 'x' }, { t: 'WRITE', k: from, v: 'x', d: -amt },
    { t: 'READ', k: to, v: 'y' }, { t: 'WRITE', k: to, v: 'y', d: amt }, { t: 'COMMIT' }] });
  const audit = () => ({ kind: 'audit', title: 'Add up all three balances', ops: [
    { t: 'BEGIN' }, { t: 'READ', k: 'A', v: 'a' }, { t: 'READ', k: 'B', v: 'b' }, { t: 'READ', k: 'C', v: 'c' }, { t: 'COMMIT' }] });
  const opText = op => op.t === 'READ' ? 'READ ' + op.k + ' → ' + op.v
    : op.t === 'WRITE' ? 'WRITE ' + op.k + ' = ' + op.v + (op.d < 0 ? ' − ' : ' + ') + Math.abs(op.d) : op.t;

  function newTx(name, prog) { return { name, prog, pc: 0, status: 'idle', vars: {}, seen: {}, writes: {}, locks: {} }; }
  function newState(iso, atomic, progs) {
    return { iso, atomic, committed: Object.assign({}, INIT), tx: progs.map((p, i) => newTx('T' + (i + 1), p)), events: [], waits: 0, deadlocks: 0, flags: {} };
  }
  const ev = (S, text, tone) => S.events.push([text, tone || '']);
  const live = t => t.status === 'active' || t.status === 'waiting';
  const isoName = { ru: 'read uncommitted', rc: 'read committed', ser: 'serializable' };

  function lockMode(S, op) { return S.iso !== 'ser' ? null : op.t === 'READ' ? 'S' : op.t === 'WRITE' ? 'X' : null; }
  function blockers(S, t, op) {
    const mode = op && lockMode(S, op); if (!mode) return [];
    const have = t.locks[op.k]; if (have === 'X' || have === mode) return [];
    return S.tx.filter(o => o !== t && live(o) && o.locks[op.k] && (mode === 'X' || o.locks[op.k] === 'X'));
  }
  /** What transaction t would see if it read key k right now. */
  function view(S, t, k) {
    if (S.atomic && k in t.writes) return { val: t.writes[k], own: true };
    if (S.atomic && S.iso === 'ru') { const o = S.tx.find(x => x !== t && live(x) && k in x.writes); if (o) return { val: o.writes[k], dirty: o }; }
    return { val: S.committed[k] };
  }
  function clobber(S, t, k) {
    if (k in t.seen && S.committed[k] !== t.seen[k])
      ev(S, '⚠ **Lost update!** ' + t.name + ' read ' + k + ' as £' + t.seen[k] + ', but ' + k + ' has since become £' + S.committed[k] + '. ' + t.name + ' is about to overwrite it using its old number, so the other change is erased.', 'bad');
  }
  function attempt(S, t) {
    const op = t.prog.ops[t.pc], n = t.name;
    if (!op || !(t.status === 'idle' || t.status === 'active')) return 'noop';
    if (op.t === 'BEGIN') {
      t.status = 'active'; t.pc++;
      ev(S, '**' + n + ' BEGIN** — opens a transaction. ' + (S.atomic ? 'Its changes stay private until it commits.' : 'Transactions are **off**, so every WRITE will go straight into the database.'), 'info');
      return 'done';
    }
    const b = blockers(S, t, op);
    if (b.length) return block(S, t, op, b);
    const mode = lockMode(S, op); if (mode && t.locks[op.k] !== 'X') t.locks[op.k] = mode;
    if (op.t === 'READ') {
      const r = view(S, t, op.k); t.vars[op.v] = r.val; if (!(op.k in t.seen)) t.seen[op.k] = r.val; t.pc++;
      let why = r.own ? "(its own pending change)" : r.dirty ? '' : '(the saved, committed value)';
      ev(S, '**' + n + ' READ ' + op.k + '** → £' + r.val + ' ' + why, r.dirty ? 'bad' : 'dim');
      if (r.dirty) { S.flags.dirty = true; ev(S, '⚠ **Dirty read!** £' + r.val + ' is ' + r.dirty.name + "'s *uncommitted* change. If " + r.dirty.name + ' rolls back, ' + n + ' has used a number that never officially existed.', 'bad'); }
      return 'done';
    }
    if (op.t === 'WRITE') {
      const val = t.vars[op.v] + op.d; t.writes[op.k] = val; t.pc++;
      if (S.atomic) ev(S, '**' + n + ' WRITE ' + op.k + ' = £' + val + '** — kept private until COMMIT (' + op.v + ' was £' + t.vars[op.v] + ').', 'dim');
      else { clobber(S, t, op.k); S.committed[op.k] = val; ev(S, '**' + n + ' WRITE ' + op.k + ' = £' + val + '** — saved straight into the database, no undo possible.', 'warn'); }
      return 'done';
    }
    // COMMIT
    if (S.atomic) Object.keys(t.writes).forEach(k => { clobber(S, t, k); S.committed[k] = t.writes[k]; });
    t.writes = {}; t.locks = {}; t.status = 'committed'; t.pc++;
    ev(S, '**' + n + ' COMMIT** ✓ — its changes are now permanent and visible to everyone.', 'good');
    if (t.prog.kind === 'audit') {
      const seen = t.vars.a + t.vars.b + t.vars.c, real = sum(S.committed);
      ev(S, n + "'s report says the three accounts hold **£" + seen + '**. The real total is £' + real + (seen === real ? ' ✓ — they match.' : ' ✗ — the report is wrong because it saw a half-finished transfer.'), seen === real ? 'good' : 'bad');
    }
    return 'done';
  }
  function block(S, t, op, b) {
    t.status = 'waiting'; S.waits++;
    ev(S, '**' + t.name + ' wants to ' + op.t + ' ' + op.k + '** but ' + b.map(o => o.name).join(' and ') + ' holds a lock on it → ' + t.name + ' **waits** ⏳ until it finishes.', 'warn');
    if (b.some(o => o.status === 'waiting' && blockers(S, o, o.prog.ops[o.pc]).includes(t))) {
      S.deadlocks++;
      ev(S, '💥 **Deadlock!** Each transaction is waiting for a lock the other holds, so neither can ever move. The database picks ' + t.name + ' as the victim.', 'bad');
      abort(S, t); settle(S); return 'aborted';
    }
    return 'blocked';
  }
  function abort(S, t) {
    const keys = Object.keys(t.writes).join(', ');
    if (S.atomic) ev(S, '↩ **' + t.name + ' rolled back** — ' + (keys ? 'its private changes (' + keys + ') are thrown away; the database never saw them.' : 'it had changed nothing.'), 'warn');
    else ev(S, '↩ ' + t.name + ' stopped — ' + (keys ? 'but with transactions off its writes (' + keys + ') are **already saved**. Nothing can undo them ✗' : 'it had changed nothing.'), keys ? 'bad' : 'warn');
    t.writes = {}; t.locks = {}; t.status = 'aborted';
  }
  function settle(S) {
    for (let guard = 0, moved = true; moved && guard < 20; guard++) {
      moved = false;
      S.tx.forEach(t => {
        if (t.status !== 'waiting') return;
        const op = t.prog.ops[t.pc]; if (blockers(S, t, op).length) return;
        t.status = 'active'; ev(S, '🔓 ' + t.name + ' gets the lock on ' + op.k + ' and carries on.', 'good'); attempt(S, t); moved = true;
      });
    }
  }
  function step(S, t) {
    if (t.status === 'waiting') { ev(S, t.name + ' is still waiting ⏳ for ' + blockers(S, t, t.prog.ops[t.pc]).map(o => o.name).join(' and ') + '.', 'warn'); return; }
    if (attempt(S, t) !== 'noop') settle(S);
  }
  function rollback(S, t) { if (!live(t)) return; abort(S, t); settle(S); }
  function restart(S, t) { if (live(t)) return; Object.assign(t, newTx(t.name, t.prog)); ev(S, t.name + ' is ready to run again from the start.', 'info'); }
  function crash(S) {
    const victims = S.tx.filter(live); const hadWrites = victims.some(t => Object.keys(t.writes).length);
    ev(S, '💥 **CRASH!** The database server loses power in the middle of its work.', 'bad');
    victims.forEach(t => abort(S, t));
    const tot = sum(S.committed);
    if (tot === 300) { ev(S, 'After restarting, only committed data survives. Total money: **£300** ✓', 'good'); if (S.atomic && hadWrites) S.flags.atomic = true; }
    else ev(S, 'After restarting: the total is **£' + tot + '** ✗ — ' + (tot < 300 ? '£' + (300 - tot) + ' has vanished' : '£' + (tot - 300) + ' appeared from nowhere') + '. A transfer is two writes; the crash happened between them and there was no transaction to undo the first.', 'bad');
  }
  function goalsOf(S) {
    const g = [], tot = sum(S.committed), tr = S.tx.filter(t => t.prog.kind === 'transfer');
    const changed = KEYS.some(k => S.committed[k] !== INIT[k]), allDone = tr.length === 2 && tr.every(t => t.status === 'committed');
    if (tr.some(t => t.status === 'committed') && tot === 300 && changed) g.push('transfer');
    if (S.flags.atomic) g.push('atomic');
    if (allDone && tot !== 300) g.push('lost');
    if (allDone && tot === 300 && S.iso === 'ser' && S.waits > 0) g.push('fix');
    if (S.flags.dirty) g.push('dirty');
    return g;
  }

  // ======================= the lab =======================
  const PRESETS = {
    simple: { label: 'Transfer', iso: 'rc', progs: () => [transfer('A', 'B', 30), audit()],
      tip: 'T1 moves £30 from A to B. Press **Step** on T1 six times and watch the total. Then reset and press **Crash** after T1\'s 3rd step.', demo: ['1', '1', '1', '1', '1', '1'] },
    lost: { label: 'Lost update', iso: 'rc', progs: () => [transfer('A', 'B', 30), transfer('A', 'C', 50)],
      tip: 'Both transfers take money from A. Step T1 twice, then T2 twice (both have now read A = £100), then finish T1, then finish T2. Then try again on **serializable**.', demo: ['1', '1', '2', '2', '1', '1', '1', '1', '2', '2', '2', '2'] },
    dirty: { label: 'Dirty read', iso: 'ru', progs: () => [transfer('A', 'B', 30), audit()],
      tip: 'T1 starts moving money. Step T1 three times (A is lowered but not committed), then step T2 to the end, then press **Rollback** on T1.', demo: ['1', '1', '1', '2', '2', '2', '2', '2', 'R1'] }
  };

  KS.labs.register({
    id: 'transaction-lab',
    title: 'Transaction Lab',
    emoji: '🏦',
    blurb: 'Two transactions, three bank accounts. Interleave them by hand, crash the database, and see why isolation exists.',
    tags: ['transactions', 'ACID', 'isolation', 'locking', 'database'],
    goals: [
      { id: 'transfer', text: '**Commit** a transfer and keep the total at £300' },
      { id: 'atomic', text: 'Press **Crash** halfway through a transfer and see it rolled back' },
      { id: 'lost', text: 'Produce a **lost update** (two transfers, wrong total)' },
      { id: 'fix', text: 'Prevent it with **serializable**: both commit, total £300' },
      { id: 'dirty', text: 'Cause a **dirty read** under *read uncommitted*' }
    ],
    help: `A **transaction** is a group of steps the database treats as one unit. Here each transaction moves money between accounts A, B and C (£100 each, £300 in total, and the total must never change).

- **Step** runs a transaction's next instruction, so *you* decide how the two interleave.
- **The database** shows what is really saved. Each transaction also shows **what it sees**: blue cells are its own pending changes, red cells are another transaction's *uncommitted* changes.
- **All-or-nothing** (atomicity): a crash or rollback throws unfinished work away. Turn it off to see money vanish.
- **Read uncommitted** lets you see unfinished work (dirty reads). **Read committed** does not, but two transactions can still overwrite each other (lost update). **Serializable** uses locks: the second one waits, or the database cancels one if they deadlock.`,

    _model: { newState, step, rollback, restart, crash, goalsOf, sum, transfer, audit },

    mount(root, api) {
      const ui = api.ui;
      let preset = 'simple', iso = 'rc', atomic = true, S = null, busy = false, runId = 0;
      const log = ui.log(80);
      const tipEl = h('p.muted.small'), dbCells = h('div.lab-cells'), noteEl = h('p.muted.small');
      const stTotal = ui.stat('Total money (must stay £300)', '£300', 'good');
      const hosts = [h('div'), h('div')];

      function newRun(logIt) {
        runId++; busy = false;
        S = newState(iso, atomic, PRESETS[preset].progs());
        if (logIt) log.add('— New run: **' + PRESETS[preset].label + '**, ' + isoName[iso] + (atomic ? '' : ', transactions OFF') + ' —', 'info');
        render();
      }
      function flush() {
        S.events.splice(0).forEach(e => log.add(e[0], e[1]));
        render(); goalsOf(S).forEach(g => api.goal(g));
      }
      function act(fn) { if (busy || !S) return; fn(); flush(); }

      function txPanel(t) {
        const ops = t.prog.ops, tone = { idle: '', active: 'accent', waiting: 'warn', committed: 'good', aborted: 'bad' }[t.status];
        const label = { idle: 'not started', active: 'running', waiting: '⏳ waiting for ' + blockers(S, t, ops[t.pc]).map(o => o.name).join(' + '), committed: '✓ committed', aborted: '✗ rolled back' }[t.status];
        const rows = ops.map((op, i) => {
          const cls = i < t.pc ? '.good' : (i === t.pc && live(t) || (i === t.pc && t.status === 'idle')) ? (t.status === 'waiting' ? '.bad' : '.hl') : t.status === 'aborted' ? '.dim' : '';
          return h('tr' + cls, h('td', String(i + 1)), h('td.lab-mono', opText(op)));
        });
        const cells = KEYS.map(k => { const v = view(S, t, k); return h('div.lab-cell' + (v.dirty ? '.bad' : v.own ? '.hl' : ''), k + ' ', h('b', '£' + v.val)); });
        const vars = Object.keys(t.vars).map(k => k + ' = ' + t.vars[k]).join(', ');
        const locks = Object.keys(t.locks).map(k => k + (t.locks[k] === 'X' ? ' (write lock)' : ' (read lock)')).join(', ');
        const op = ops[t.pc], canStep = !busy && (t.status === 'idle' || t.status === 'active') && !!op;
        const stepBtn = ui.btn(canStep ? 'Step ▸ ' + opText(op) : t.status === 'waiting' ? '⏳ waiting…' : 'Finished', () => act(() => step(S, t)), 'primary');
        stepBtn.disabled = !canStep;
        const rb = ui.btn('Rollback', () => act(() => rollback(S, t)), 'sm'); rb.disabled = busy || !live(t);
        const kids = [h('div.lab-row', h('b', t.name + ': ' + t.prog.title), h('span.lab-chip' + (tone ? '.tn-' + tone : ''), label)),
          h('div.lab-table-wrap', h('table.lab-table', h('tbody', rows))),
          h('p.muted.small', 'What ' + t.name + ' sees right now:'), h('div.lab-cells', cells)];
        if (vars) kids.push(h('p.muted.small', 'In ' + t.name + "'s head: " + vars));
        if (locks) kids.push(h('p.muted.small', '🔒 Holds: ' + locks));
        kids.push(ui.row(stepBtn, rb));
        if (!live(t) && t.status !== 'idle') { const rs = ui.btn('↺ Restart ' + t.name, () => act(() => restart(S, t)), 'sm'); rs.disabled = busy; kids.push(rs); }
        return ui.panel(null, kids);
      }
      function render() {
        KS.clear(dbCells);
        KEYS.forEach(k => dbCells.appendChild(h('div.lab-cell' + (S.committed[k] !== INIT[k] ? '.hl' : ''), 'Account ' + k + ' ', h('b', '£' + S.committed[k]))));
        const tot = sum(S.committed);
        stTotal.set('£' + tot, tot === 300 ? 'good' : 'bad');
        noteEl.textContent = tot === 300 ? 'Conserved ✓ — money only moves, it is never created or destroyed.' : '✗ ' + (tot < 300 ? '£' + (300 - tot) + ' has vanished.' : '£' + (tot - 300) + ' appeared from nowhere.');
        hosts.forEach((host, i) => { KS.clear(host); if (S.tx[i]) host.appendChild(txPanel(S.tx[i])); });
        tipEl.innerHTML = KS.md.inline(PRESETS[preset].tip);
      }
      async function demo() {
        if (busy) return;
        newRun(false); busy = true; const my = runId; render();
        log.add('▶ **Demo** of "' + PRESETS[preset].label + '" — watch each step.', 'info');
        for (const tok of PRESETS[preset].demo) {
          await api.sleep(1000);
          if (!api.alive() || my !== runId) return;
          const t = S.tx[+tok.slice(-1) - 1];
          if (tok[0] === 'R') { rollback(S, t); } else if (t.status === 'waiting') continue; else step(S, t);
          flush();
        }
        if (my === runId) { busy = false; render(); log.add('Demo finished. Reset and try it yourself, or change the isolation level and replay.', 'info'); }
      }

      const presetSeg = ui.seg(Object.keys(PRESETS).map(k => [k, PRESETS[k].label]), preset, v => { preset = v; iso = PRESETS[v].iso; isoSel.set(iso); newRun(true); });
      const isoSel = ui.select('Isolation level', [['ru', 'Read uncommitted'], ['rc', 'Read committed'], ['ser', 'Serializable (locks)']], iso, v => { iso = v; newRun(true); });
      const atomicTog = ui.toggle('All-or-nothing transactions', atomic, v => { atomic = v; newRun(true); });
      root.appendChild(ui.panel('Pick a scenario', presetSeg, tipEl,
        ui.row(isoSel, atomicTog),
        ui.row(ui.btn('▶ Show me', demo, 'primary'), ui.btn('💥 Crash the database', () => act(() => crash(S)), 'danger'), ui.btn('Reset', () => newRun(true)))));
      root.appendChild(ui.panel('The database (what is really saved)', dbCells, ui.stats(stTotal), noteEl));
      root.appendChild(h('div.lab-grid2.even', hosts));
      root.appendChild(ui.panel('What just happened', log.el));
      newRun(false);
      log.add('Pick a scenario above, then press **Step** on a transaction. Each step is explained here.', 'info');
    }
  });
})();
