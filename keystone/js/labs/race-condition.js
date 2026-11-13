/* Lab: race-condition — "read, add one, write" is three steps, and two threads can interleave them. Plus a deadlock tab. */
(function () {
  // <model>
  const NAMES = ['A', 'B'];
  function raceSteps(lock) { return lock ? ['lock', 'read', 'add', 'write', 'unlock'] : ['read', 'add', 'write']; }
  function newT() { return { pc: 0, local: null, seen: null, inc: 0, done: false }; }
  function newRace(target, lock) { return { counter: 0, holder: -1, lock: !!lock, target: target, lost: 0, t: [newT(), newT()] }; }
  function canStep(sim, i) {
    const t = sim.t[i];
    if (t.done) return false;
    if (sim.lock && t.pc === 0 && sim.holder !== -1 && sim.holder !== i) return false;   // waiting for the lock
    return true;
  }
  function stepRace(sim, i) {
    if (!canStep(sim, i)) return null;
    const t = sim.t[i], steps = raceSteps(sim.lock), op = steps[t.pc];
    const ev = { op: op, who: i, value: null, lost: false, over: null, finished: false };
    if (op === 'lock') sim.holder = i;
    else if (op === 'read') { t.local = sim.counter; t.seen = sim.counter; ev.value = t.local; }
    else if (op === 'add') { t.local += 1; ev.value = t.local; }
    else if (op === 'write') {
      ev.lost = sim.counter !== t.seen; ev.over = sim.counter;
      if (ev.lost) sim.lost += sim.counter - t.seen;
      sim.counter = t.local; ev.value = t.local;
    } else if (op === 'unlock') sim.holder = -1;
    t.pc++;
    if (t.pc >= steps.length) { t.pc = 0; t.inc++; t.local = null; t.seen = null; if (t.inc >= sim.target) { t.done = true; ev.finished = true; } }
    return ev;
  }
  function raceDone(sim) { return sim.t[0].done && sim.t[1].done; }
  // deadlock: each thread needs both locks. Thread A takes Lock 1 then Lock 2. Thread B takes them in the opposite order unless `ordered`.
  function dlPlan(ordered, i) { const first = (i === 0 || ordered) ? 0 : 1, second = 1 - first; return [['lock', first], ['lock', second], ['work'], ['unlock', second], ['unlock', first]]; }
  function newDl(ordered) { return { ordered: !!ordered, pc: [0, 0], owner: [-1, -1] }; }
  function dlCan(d, i) {
    const plan = dlPlan(d.ordered, i);
    if (d.pc[i] >= plan.length) return false;
    const op = plan[d.pc[i]];
    return !(op[0] === 'lock' && d.owner[op[1]] !== -1);
  }
  function dlStep(d, i) {
    if (!dlCan(d, i)) return null;
    const op = dlPlan(d.ordered, i)[d.pc[i]];
    if (op[0] === 'lock') d.owner[op[1]] = i; else if (op[0] === 'unlock') d.owner[op[1]] = -1;
    d.pc[i]++;
    return op;
  }
  function dlStatus(d) {
    const un = [0, 1].filter(function (i) { return d.pc[i] < 5; });
    if (!un.length) return 'done';
    return un.some(function (i) { return dlCan(d, i); }) ? 'running' : 'deadlock';
  }
  // </model>

  KS.labs.register({
    id: 'race-condition',
    title: 'Race Condition',
    emoji: '🏁',
    blurb: 'Two threads, one shared counter. Interleave their steps by hand and watch updates vanish, then fix it with a lock.',
    tags: ['concurrency', 'threads', 'locks', 'deadlock', 'race condition'],
    goals: [
      { id: 'lost', text: 'Interleave by hand so two increments leave the counter at **1**' },
      { id: 'auto', text: 'Run 100 + 100 increments **without** a lock and lose some updates' },
      { id: 'lock', text: 'Turn the **lock** on and get exactly 200' },
      { id: 'deadlock', text: 'Cause a **deadlock**, then fix it with the same lock order for both threads' }
    ],
    help: `The counter lives in memory, shared by both threads. **Adding one** is really three steps: **read** the number, **add 1** to your own private copy, **write** it back.

If thread A reads, then B reads, then both write, both wrote "old value + 1", so one increment was **lost**. That is a **race condition**: the answer depends on who wins the race.

A **lock** lets only one thread run the three steps at a time. The other waits. The answer is always right, at the cost of some waiting.

The **Deadlock** tab shows the danger of locks: if A holds Lock 1 and wants Lock 2, while B holds Lock 2 and wants Lock 1, both wait for ever. The fix is simple: everyone takes locks **in the same order**.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      let mode = 'manual', lockOn = false, running = false, budget = 0;
      let sim = newRace(1, false);
      let dl = newDl(false), dlSeen = false, dlAnnounced = false;
      const log = ui.log(60);

      // ---------- race panel ----------
      const stCounter = ui.stat('shared counter', 0, 'accent'), stExpect = ui.stat('expected at the end', 2), stLost = ui.stat('lost updates', 0, 'good');
      const threadsHost = h('div.lab-grid2.even');
      const modeSeg = ui.seg([['manual', 'Step by hand'], ['auto', 'Run 100 + 100']], 'manual', function (v) { mode = v; resetRace(v === 'auto' ? 'Auto mode: each thread will add 1 a hundred times, switching at random.' : 'Manual mode: each thread adds 1 once. You decide who moves next.'); });
      const lockTog = ui.toggle('Use a lock', false, function (v) { lockOn = v; resetRace(v ? 'Lock **on**: a thread must grab the lock before it reads, and release it after it writes.' : 'Lock **off**: threads can interrupt each other at any step.'); });
      const runBtn = ui.btn('▶ Run both threads', function () {
        if (mode !== 'auto') return;
        if (raceDone(sim)) resetRace();
        running = !running; renderRace();
      }, 'primary');
      const resetBtn = ui.btn('↺ Reset', function () { resetRace('Reset. Counter back to 0.'); });
      const racePanel = h('div.lab-stack',
        ui.panel('Shared counter', ui.stats(stCounter, stExpect, stLost)),
        ui.panel('Controls', ui.row(modeSeg, lockTog), ui.row(runBtn, resetBtn),
          h('p.muted.small', { id: 'rc-hint' }, 'Try: step A to read, step B to read, then finish A, then finish B.')),
        threadsHost);

      const STEP_LABEL = { lock: '🔒 lock', read: '1 read', add: '2 add 1', write: '3 write', unlock: '🔓 unlock' };
      const STEP_VERB = { lock: 'take the lock', read: 'read the counter', add: 'add 1', write: 'write it back', unlock: 'release the lock' };

      function resetRace(msg) {
        running = false; budget = 0;
        sim = newRace(mode === 'auto' ? 100 : 1, lockOn);
        if (msg) log.add(msg, 'info');
        renderRace();
      }
      function threadCard(i) {
        const t = sim.t[i], steps = raceSteps(sim.lock), waiting = !t.done && !canStep(sim, i);
        const cells = steps.map(function (s, k) { return h('div.lab-cell' + (t.done ? '.good' : k === t.pc ? (waiting ? '.bad' : '.hl') : (k < t.pc ? '.dim' : '')), STEP_LABEL[s]); });
        let action;
        if (mode === 'auto') action = h('p.muted.small', 'Runs by itself in auto mode.');
        else if (t.done) action = ui.btn('Finished ✓', function () {}, 'ghost');
        else if (waiting) action = ui.btn('⏳ Waiting for the lock…', function () {}, 'ghost');
        else action = ui.btn('Step ▶ ' + STEP_VERB[steps[t.pc]], function () { manualStep(i); }, 'primary');
        if (t.done || waiting) action.disabled = true;
        return ui.panel('Thread ' + NAMES[i], h('div.lab-cells', cells),
          h('p.lab-mono', 'my private copy: ' + (t.local == null ? '–' : t.local)),
          h('p.muted.small', 'increments done: ' + t.inc + ' of ' + sim.target), action);
      }
      function renderRace() {
        stCounter.set(sim.counter); stExpect.set(sim.target * 2);
        stLost.set(sim.lost, sim.lost ? 'bad' : 'good');
        KS.clear(threadsHost); threadsHost.appendChild(threadCard(0)); threadsHost.appendChild(threadCard(1));
        runBtn.textContent = running ? '⏸ Pause' : (raceDone(sim) ? '▶ Run again' : '▶ Run both threads');
        runBtn.style.display = mode === 'auto' ? '' : 'none';
        const hint = racePanel.querySelector('#rc-hint'); if (hint) hint.style.display = mode === 'manual' ? '' : 'none';
      }
      function narrate(ev) {
        const n = NAMES[ev.who], o = NAMES[1 - ev.who];
        if (ev.op === 'lock') log.add('**' + n + '** takes the lock 🔒. **' + o + '** must wait until it is released.', 'info');
        else if (ev.op === 'read') log.add('**' + n + ' reads** the counter and sees **' + ev.value + '**. It keeps a private copy.', 'dim');
        else if (ev.op === 'add') log.add('**' + n + ' adds 1** to its private copy: now ' + ev.value + '. The shared counter has not changed yet.', 'dim');
        else if (ev.op === 'write') {
          if (ev.lost) log.add('**' + n + ' writes ' + ev.value + '** over the counter (which was ' + ev.over + '). ' + o + ' had already moved it on, so that update is **lost** ✗', 'bad');
          else log.add('**' + n + ' writes ' + ev.value + '** to the counter ✓', 'good');
        } else if (ev.op === 'unlock') log.add('**' + n + '** releases the lock 🔓.', 'info');
        if (ev.finished && mode === 'manual') log.add('Thread ' + n + ' is finished.', 'dim');
      }
      function manualStep(i) {
        if (mode !== 'manual') return;
        const ev = stepRace(sim, i); if (!ev) return;
        narrate(ev); renderRace(); checkRace();
      }
      function checkRace() {
        if (!raceDone(sim)) return;
        if (mode === 'manual' && !sim.lock) {
          if (sim.counter === 1) { log.add('Both threads finished, but the counter is **1**, not 2. One increment vanished: a **race condition**.', 'bad'); api.goal('lost'); }
          else log.add('Both finished and the counter is 2. Lucky ordering! Reset and let both threads read before either writes.', 'warn');
        }
        if (mode === 'auto' && !sim.lock && sim.counter < 200) api.goal('auto');
        if (mode === 'auto' && sim.lock && sim.counter === 200) api.goal('lock');
      }
      api.loop(function (dt) {
        if (!running) return;
        budget += dt * 500;
        let n = Math.floor(budget); budget -= n;
        while (n-- > 0 && !raceDone(sim)) {
          const ready = [0, 1].filter(function (i) { return canStep(sim, i); });
          if (!ready.length) break;
          stepRace(sim, ready[Math.floor(Math.random() * ready.length)]);
        }
        renderRace();
        if (raceDone(sim)) {
          running = false; renderRace();
          if (sim.counter === 200) log.add('Finished: counter = **200**, exactly as expected' + (sim.lock ? ' (the lock made each increment all-or-nothing).' : ' (very lucky!).'), 'good');
          else log.add('Finished: counter = **' + sim.counter + '**, expected 200. **' + sim.lost + ' updates were lost** because threads overwrote each other.', 'bad');
          checkRace();
        }
      });

      // ---------- deadlock panel ----------
      const dlThreads = h('div.lab-grid2.even'), dlLocks = h('div.lab-cells'), dlNote = h('div');
      const orderTog = ui.toggle('Both threads take Lock 1 first (same order)', false, function (v) { dl = newDl(v); dlAnnounced = false; log.add(v ? 'Both threads now take **Lock 1 then Lock 2**. Nobody can end up holding one lock while waiting for the other.' : 'Thread B now takes **Lock 2 then Lock 1**, the opposite order to A.', 'info'); renderDl(); });
      const dlReset = ui.btn('↺ Reset', function () { dl = newDl(dl.ordered); dlAnnounced = false; log.add('Both threads start again, no locks held.', 'info'); renderDl(); });
      const dlRandom = ui.btn('🎲 Run at random', function () {
        dl = newDl(dl.ordered); dlAnnounced = false;
        while (dlStatus(dl) === 'running') { const ready = [0, 1].filter(function (i) { return dlCan(dl, i); }); dlStep(dl, ready[Math.floor(Math.random() * ready.length)]); }
        log.add('Random run: ' + (dlStatus(dl) === 'deadlock' ? 'the threads **got stuck**. Run it again or step by hand to see how.' : 'lucky, both finished.'), 'dim');
        renderDl(); checkDl();
      }, 'ghost');
      const dlPanel = h('div.lab-stack',
        ui.panel('Two locks, two threads', h('p.muted.small', 'Each thread needs **both** locks to do its work. Step A once, then B once, then keep going.'), ui.row(orderTog), ui.row(dlReset, dlRandom)),
        dlLocks, dlThreads, dlNote);
      function dlCard(i) {
        const plan = dlPlan(dl.ordered, i), pc = dl.pc[i], fin = pc >= plan.length, blocked = !fin && !dlCan(dl, i);
        const cells = plan.map(function (op, k) {
          const label = op[0] === 'work' ? '⚙ work' : (op[0] === 'lock' ? '🔒 Lock ' : '🔓 Lock ') + (op[1] + 1);
          return h('div.lab-cell' + (fin ? '.good' : k === pc ? (blocked ? '.bad' : '.hl') : (k < pc ? '.dim' : '')), label);
        });
        let btn;
        if (fin) btn = ui.btn('Finished ✓', function () {}, 'ghost');
        else if (blocked) btn = ui.btn('⏳ Waiting for Lock ' + (plan[pc][1] + 1), function () {}, 'ghost');
        else btn = ui.btn('Step ▶ ' + (plan[pc][0] === 'work' ? 'do the work' : (plan[pc][0] === 'lock' ? 'take Lock ' : 'release Lock ') + (plan[pc][1] + 1)), function () { dlDo(i); }, 'primary');
        if (fin || blocked) btn.disabled = true;
        return ui.panel('Thread ' + NAMES[i], h('div.lab-cells', cells), h('div', { style: { marginTop: '10px' } }, btn));
      }
      function renderDl() {
        KS.clear(dlLocks); KS.clear(dlThreads);
        [0, 1].forEach(function (k) { dlLocks.appendChild(h('div.lab-cell' + (dl.owner[k] === -1 ? '' : '.hl'), 'Lock ' + (k + 1) + ': ' + (dl.owner[k] === -1 ? 'free' : 'held by ' + NAMES[dl.owner[k]]))); });
        dlThreads.appendChild(dlCard(0)); dlThreads.appendChild(dlCard(1));
        KS.clear(dlNote);
        const st = dlStatus(dl);
        if (st === 'deadlock') dlNote.appendChild(ui.note('💀 **Deadlock.** Each thread holds one lock and waits for the one the other holds. Neither can move, ever.', 'bad'));
        else if (st === 'done') dlNote.appendChild(ui.note('✅ Both threads finished. ' + (dl.ordered ? 'With the same lock order a deadlock is impossible.' : ''), 'good'));
      }
      function dlDo(i) {
        const op = dlStep(dl, i); if (!op) return;
        const n = NAMES[i];
        if (op[0] === 'lock') log.add('**' + n + '** takes Lock ' + (op[1] + 1) + ' 🔒', 'info');
        else if (op[0] === 'unlock') log.add('**' + n + '** releases Lock ' + (op[1] + 1) + ' 🔓', 'dim');
        else log.add('**' + n + '** has both locks and does its work ⚙', 'good');
        renderDl(); checkDl();
      }
      function checkDl() {
        const st = dlStatus(dl);
        if (st === 'deadlock') {
          dlSeen = true;
          if (!dlAnnounced) { dlAnnounced = true; log.add('💀 **Deadlock!** A waits for a lock B holds, and B waits for a lock A holds. Fix: make both take locks in the same order (use the switch).', 'bad'); }
        }
        if (st === 'done' && dl.ordered && dlSeen) api.goal('deadlock');
      }

      // ---------- layout ----------
      const dlWrap = h('div', { style: { display: 'none' } }, dlPanel);
      const raceWrap = h('div', racePanel);
      const tabSeg = ui.seg([['race', '🏁 Counter race'], ['dl', '💀 Deadlock']], 'race', function (v) { raceWrap.style.display = v === 'race' ? '' : 'none'; dlWrap.style.display = v === 'dl' ? '' : 'none'; });
      root.appendChild(tabSeg);
      root.appendChild(raceWrap); root.appendChild(dlWrap);
      root.appendChild(ui.panel('What just happened', log.el));
      log.add('Start with **Step by hand**: step thread A until it has read the counter, then let B read too.', 'info');
      renderRace(); renderDl();
    }
  });
})();
