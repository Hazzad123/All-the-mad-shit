/* Lab: queue-lab — a queue lets producer and consumer run at different speeds, until it fills up. */
(function () {
  // ---------- pure model (exposed as `logic` for Node tests) ----------
  const MAX_TRIES = 3, REPAIR = 3;
  function newState(n) {
    const consumers = []; for (let i = 1; i <= n; i++) consumers.push({ id: i, msg: null, rem: 0, down: 0 });
    return { t: 0, nextMsg: 1, nextCons: n + 1, queue: [], consumers, produced: 0, consumed: 0, lost: 0, redelivered: 0, blocked: 0, dlq: [], done: {}, saved: [] };
  }
  /** Producer sends one message. With a cap, a full queue pushes back and the message is NOT accepted. */
  function produce(st, o) {
    if (o.cap && st.queue.length >= o.cap) { st.blocked++; return { ok: false }; }
    const m = { id: st.nextMsg++, born: st.t, attempts: 0, poison: !!o.poison };
    st.queue.push(m); st.produced++;
    return { ok: true, msg: m };
  }
  /** Advance time. cfg = { ack: 'auto'|'manual', speed: msgs per second per consumer }. Returns a list of events. */
  function tick(st, dt, cfg) {
    st.t += dt; const ev = [];
    st.consumers.forEach(c => {
      if (c.down > 0) { c.down -= dt; if (c.down <= 0) { c.down = 0; ev.push({ type: 'restart', c: c.id }); } return; }
      if (c.msg) {
        c.rem -= dt;
        if (c.rem <= 0) {
          const m = c.msg; c.msg = null;
          if (!m.poison) { st.consumed++; st.done[m.id] = true; ev.push({ type: 'done', c: c.id, m }); }
          else if (cfg.ack === 'auto') { st.lost++; ev.push({ type: 'lost', c: c.id, m }); }
          else if (m.attempts >= MAX_TRIES) { st.dlq.push(m); ev.push({ type: 'dlq', c: c.id, m }); }
          else { st.queue.push(m); st.redelivered++; ev.push({ type: 'retry', c: c.id, m }); }
        }
      }
      if (!c.msg && st.queue.length && cfg.speed > 0) { const m = st.queue.shift(); m.attempts++; c.msg = m; c.rem = 1 / cfg.speed; }
    });
    return ev;
  }
  /** Crash consumer id. Auto-ack: the in-flight message was already acknowledged, so it is lost. Manual: it goes back to the queue. */
  function crash(st, id, cfg) {
    const c = st.consumers.filter(x => x.id === id)[0];
    if (!c || c.down > 0) return null;
    const m = c.msg; c.msg = null; c.down = REPAIR;
    if (!m) return { type: 'crash-idle', c: id };
    if (cfg.ack === 'auto') { st.lost++; return { type: 'crash-lost', c: id, m }; }
    st.queue.unshift(m); st.redelivered++; if (!m.poison) st.saved.push(m.id);
    return { type: 'crash-requeue', c: id, m };
  }
  function addConsumer(st, max) { if (st.consumers.length >= max) return null; const c = { id: st.nextCons++, msg: null, rem: 0, down: 0 }; st.consumers.push(c); return c; }
  function removeConsumer(st) {
    if (st.consumers.length <= 1) return null;
    const c = st.consumers.pop();
    if (c.msg) { c.msg.attempts--; st.queue.unshift(c.msg); }       // a clean shutdown hands the work back
    return c;
  }
  function oldestAge(st) { let b = Infinity; st.queue.forEach(m => { if (m.born < b) b = m.born; }); return b === Infinity ? 0 : st.t - b; }
  const logic = { newState, produce, tick, crash, addConsumer, removeConsumer, oldestAge, MAX_TRIES };

  KS.labs.register({
    logic,
    id: 'queue-lab',
    title: 'Queue Lab',
    emoji: '📬',
    blurb: 'A producer fires messages, workers chew through them. See what happens when one side is faster, or a worker dies.',
    tags: ['queue', 'message broker', 'ack', 'dead letter', 'backpressure'],
    goals: [
      { id: 'backlog', text: 'Build a **backlog of more than 20** messages' },
      { id: 'drain', text: 'Clear the backlog by **adding consumers** (or slowing the producer)' },
      { id: 'redeliver', text: 'Switch to **manual acks**, crash a busy worker and lose nothing' },
      { id: 'dlq', text: 'Send a **poison message** to the dead-letter queue' },
      { id: 'pressure', text: 'Fill a **bounded queue** and see backpressure' }
    ],
    help: `A **producer** creates messages (orders, emails, photos to resize). A **queue** holds them in order. **Consumers** (workers) take one at a time and do the job. If the producer is faster, the queue simply grows: that is the **backlog**, and the **age** of the oldest message is how long somebody has been waiting.

**Acknowledgement** is the consumer telling the queue "done, you can forget it". With **auto-ack** the message is forgotten the moment it is handed over, so a crash loses it. With **manual ack** it is only forgotten when the work finishes, so a crash means **redelivery**.

A **poison message** always fails. Retrying forever would jam everything, so after 3 attempts it is moved to the **dead-letter queue** for a human to look at.

A **bounded** queue (room for 10) refuses new messages when full. That is **backpressure**: the producer is told to slow down. Tap a worker to crash it.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const MAXC = 4, CAP = 10;
      let st = newState(1), rate = 4, speed = 2, ack = 'auto', bounded = false, running = true, acc = 0, lastDraw = 0, backlogSeen = false, blockedLogged = 0;
      const cfg = () => ({ ack, speed });

      const log = ui.log(60);
      const qHost = h('div'), cHost = h('div.lab-row'), dHost = h('div');
      const sProd = ui.stat('produced', 0), sCons = ui.stat('consumed', 0, 'good'), sLost = ui.stat('lost', 0), sRe = ui.stat('redelivered', 0), sBlock = ui.stat('blocked sends', 0), sBack = ui.stat('backlog', 0, 'accent'), sAge = ui.stat('oldest waiting', '0 s');
      const runBtn = ui.btn('⏸ Pause', () => { running = !running; runBtn.textContent = running ? '⏸ Pause' : '▶ Resume'; }, 'sm');

      root.appendChild(ui.panel('Producer',
        ui.row(ui.slider('Messages sent per second', { min: 0, max: 10, step: 1, value: rate, fmt: v => v + '/s' }, v => { rate = v; }),
          ui.btn('☠ Send poison message', () => poison(), 'sm'), runBtn, ui.btn('Restart', () => restart(), 'ghost'))));
      root.appendChild(ui.panel('Queue settings',
        ui.row(ui.seg([['auto', 'Auto-ack'], ['manual', 'Manual ack']], ack, v => { ack = v; log.add(v === 'auto' ? 'Auto-ack: messages are forgotten the moment a worker takes them. **A crash will lose the one in flight.**' : 'Manual ack: a message is only forgotten when the work **finishes**. A crash means redelivery.', 'info'); }),
          ui.toggle('Bounded queue (max ' + CAP + ')', false, v => { bounded = v; log.add(v ? 'Queue now holds at most **' + CAP + '**. When full, the producer is refused.' : 'Queue is unbounded again.', 'info'); }))));
      root.appendChild(h('div.lab-grid2',
        ui.panel('Queue (oldest first)', qHost, h('p.muted.small', 'Red = poison message.')),
        ui.panel('Dead-letter queue', dHost)));
      root.appendChild(ui.panel('Consumers (tap one to crash it)', cHost,
        ui.row(ui.slider('Worker speed', { min: 0.5, max: 5, step: 0.5, value: speed, fmt: v => v + ' msgs/s each' }, v => { speed = v; }),
          ui.btn('＋ Add worker', () => addC(), 'sm'), ui.btn('－ Remove worker', () => remC(), 'sm'), ui.btn('💥 Crash a worker', () => crashBusy(), 'danger'))));
      root.appendChild(ui.panel('Numbers', ui.stats(sProd, sCons, sLost, sRe, sBlock, sBack, sAge)));
      root.appendChild(ui.panel('What just happened', log.el));

      // ---------- actions ----------
      function restart() { st = newState(1); acc = 0; backlogSeen = false; blockedLogged = 0; log.add('Restarted with one worker.', 'dim'); render(); }
      function poison() {
        const r = produce(st, { poison: true, cap: bounded ? CAP : 0 });
        if (!r.ok) { log.add('Poison message **refused**: the queue is full.', 'warn'); }
        else log.add('☠ Poison message **#' + r.msg.id + '** joins the queue. Whichever worker takes it will fail.' + (ack === 'auto' ? ' (With auto-ack it will simply be lost. Try manual ack.)' : ''), 'warn');
        render();
      }
      function addC() { const c = addConsumer(st, MAXC); log.add(c ? 'Worker ' + c.id + ' joins. More hands, faster draining.' : 'That is the maximum of ' + MAXC + ' workers.', c ? 'good' : 'warn'); render(); }
      function remC() { const c = removeConsumer(st); log.add(c ? 'Worker ' + c.id + ' shuts down cleanly.' : 'You need at least one worker.', c ? 'info' : 'warn'); render(); }
      function crashBusy() {
        const alive = st.consumers.filter(c => c.down <= 0);
        if (!alive.length) { log.add('All workers are already down.', 'warn'); return; }
        crashId((alive.filter(c => c.msg)[0] || alive[0]).id);
      }
      function crashId(id) {
        const e = crash(st, id, cfg());
        if (e) narrate([e]);
        render();
      }
      function narrate(evs) {
        evs.forEach(e => {
          if (e.type === 'crash-idle') log.add('💥 Worker ' + e.c + ' crashed while idle. Nothing was lost, but it is out for ' + 3 + ' s. (Crash a **busy** worker to see the difference.)', 'warn');
          if (e.type === 'crash-lost') log.add('💥 Worker ' + e.c + ' crashed holding message **#' + e.m.id + '**. It was already acknowledged, so it is **gone for good** ✗', 'bad');
          if (e.type === 'crash-requeue') log.add('💥 Worker ' + e.c + ' crashed holding **#' + e.m.id + '**, but it was never acknowledged, so the queue **redelivers** it to the next free worker ✓', 'good');
          if (e.type === 'restart') log.add('Worker ' + e.c + ' is back up.', 'dim');
          if (e.type === 'lost') log.add('☠ Poison **#' + e.m.id + '** failed. With auto-ack it was already forgotten: **lost** ✗', 'bad');
          if (e.type === 'retry') log.add('☠ Poison **#' + e.m.id + '** failed (attempt ' + e.m.attempts + ' of ' + MAX_TRIES + '). Back in the queue for another try.', 'warn');
          if (e.type === 'dlq') log.add('☠ Poison **#' + e.m.id + '** failed ' + MAX_TRIES + ' times. Moved to the **dead-letter queue** so it stops blocking everyone ✓', 'good');
        });
      }

      // ---------- render ----------
      function chips(list, cls) {
        const shown = list.slice(0, 30);
        const kids = shown.map(m => h('span.lab-cell' + (m.poison ? '.bad' : cls ? '.' + cls : ''), '#' + m.id));
        if (list.length > shown.length) kids.push(h('span.lab-cell.dim', '+' + (list.length - shown.length)));
        return h('div.lab-cells', kids);
      }
      function render() {
        KS.clear(qHost); qHost.appendChild(st.queue.length ? chips(st.queue) : h('p.muted', 'Empty.'));
        KS.clear(dHost); dHost.appendChild(st.dlq.length ? chips(st.dlq) : h('p.muted', 'Nothing here. Poison messages end up here after ' + MAX_TRIES + ' failed tries (manual ack only).'));
        KS.clear(cHost);
        st.consumers.forEach(c => {
          const n = ui.node('Worker ' + c.id, '⚙️', { onClick: () => crashId(c.id), sub: c.down > 0 ? 'down…' : c.msg ? 'on #' + c.msg.id + (c.msg.poison ? ' ☠' : '') : 'idle' });
          n.setState(c.down > 0 ? 'down' : c.msg ? 'busy' : 'ok'); cHost.appendChild(n);
        });
        sProd.set(st.produced); sCons.set(st.consumed); sLost.set(st.lost, st.lost ? 'bad' : ''); sRe.set(st.redelivered, st.redelivered ? 'warn' : '');
        sBlock.set(st.blocked, st.blocked ? 'warn' : ''); sBack.set(st.queue.length); sAge.set(oldestAge(st).toFixed(1) + ' s');
        check();
      }
      function check() {
        if (st.queue.length > 20) { if (!backlogSeen) log.add('Backlog is past 20: the producer is outrunning the workers. Messages are waiting longer and longer.', 'warn'); backlogSeen = true; api.goal('backlog'); }
        if (backlogSeen && st.queue.length === 0 && st.consumers.length >= 2) { api.goal('drain'); }
        if (st.saved.length && st.saved.every(id => st.done[id])) api.goal('redeliver');
        if (st.dlq.length && ack === 'manual') api.goal('dlq');
        if (bounded && st.blocked > 0) api.goal('pressure');
      }

      api.loop(dt => {
        if (!running) return;
        acc += rate * dt;
        const co = bounded ? CAP : 0;
        while (acc >= 1) {
          acc -= 1; produce(st, { cap: co });
          if (st.blocked >= blockedLogged + 10 || (st.blocked === 1 && blockedLogged === 0)) { blockedLogged = st.blocked; log.add('🚧 Queue full: the producer was **refused** (' + st.blocked + ' blocked so far). That is backpressure: it must slow down or wait.', 'warn'); }
        }
        const evs = tick(st, dt, cfg());
        narrate(evs.filter(e => e.type !== 'done'));
        lastDraw += dt;
        if (lastDraw >= 0.2 || evs.length) { lastDraw = 0; render(); }
      });
      render();
      log.add('Messages are flowing. One slow worker cannot keep up with the producer, so the backlog will grow.', 'dim');
    }
  });
})();
