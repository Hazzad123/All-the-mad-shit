/* Lab: microservices-cascade — one slow service can drown the ones that wait on it. */
(function () {
  'use strict';

  /* ---------- pure model: thread pools, blocking calls, explicit clock (ms) ---------- */
  /* model:start */
  var SIZES = { gateway: 16, orders: 12, inventory: 12, pricing: 8, recs: 8 };
  var OWN = { gateway: 30, orders: 60, inventory: 60, pricing: 80, recs: 60 };   // normal own work per call (ms)
  var KIDS = { gateway: ['recs', 'orders'], orders: ['inventory'], inventory: ['pricing'], pricing: [], recs: [] };
  var SLOW_MS = 6000, TIMEOUT = 1000, PATIENCE = 5000, BULK = 3;
  var BCFG = { threshold: 4, cooldown: 4000, trials: 1 };

  function newBreaker() { return { state: 'closed', fails: 0, openedAt: 0, sent: 0, okTrials: 0, gen: 0, onChange: null }; }
  function toState(b, st, now) { var f = b.state; b.state = st; b.gen++; b.fails = 0; b.sent = 0; b.okTrials = 0; if (st === 'open') b.openedAt = now; if (b.onChange && f !== st) b.onChange(f, st); }
  function breakerAllow(b, now) {
    if (b.state === 'open' && now - b.openedAt >= BCFG.cooldown) toState(b, 'half', now);
    if (b.state === 'closed') return true;
    if (b.state === 'half' && b.sent < BCFG.trials) { b.sent++; return true; }
    return false;
  }
  function breakerRecord(b, ok, now, gen) {
    if (gen !== b.gen) return;
    if (b.state === 'closed') { if (ok) b.fails = 0; else { b.fails++; if (b.fails >= BCFG.threshold) toState(b, 'open', now); } }
    else if (b.state === 'half') { if (ok) { b.okTrials++; if (b.okTrials >= BCFG.trials) toState(b, 'closed', now); } else toState(b, 'open', now); }
  }

  function newWorld(slow, def) {
    var pools = {}; for (var k in SIZES) pools[k] = { size: SIZES[k], busy: 0, queue: [] };
    return { now: 0, pools: pools, slow: slow || {}, def: def || {}, bulk: { busy: 0, size: BULK }, breakers: {}, calls: [], outcomes: [], events: [], seq: 0, fails: 0 };
  }
  function mkCall(w, svc, parent, req) {
    return { id: ++w.seq, svc: svc, parent: parent, req: req, state: 'queued', deadline: Infinity, workEnd: 0, todo: KIDS[svc].slice(), child: null, thread: false, abandoned: false, bulk: false, brk: null, gen: 0 };
  }
  function spawn(w) {
    var req = { t0: w.now, userDone: false, degraded: false };
    var c = mkCall(w, 'gateway', null, req);
    w.pools.gateway.queue.push(c); w.calls.push(c);
  }
  function outcome(w, ok, req) {
    if (req.userDone) return;
    req.userDone = true; if (!ok) w.fails++;
    w.outcomes.push({ ok: ok, ms: w.now - req.t0, degraded: !!(ok && req.degraded) });
    if (w.outcomes.length > 300) w.outcomes.shift();
  }
  function startChild(w, c) {
    var svc = c.todo.shift(), edge = c.svc + '>' + svc, b = null, gen = 0;
    if (w.def.breaker) {
      b = w.breakers[edge];
      if (!b) { b = w.breakers[edge] = newBreaker(); b.onChange = function (f, t) { w.events.push({ type: 'breaker', edge: edge, from: f, to: t }); }; }
      if (!breakerAllow(b, w.now)) { childDone(w, c, svc, false); return; }
      gen = b.gen;
    }
    var bulk = false;
    if (svc === 'recs' && w.def.bulkhead) {
      if (w.bulk.busy >= w.bulk.size) { w.events.push({ type: 'skip' }); childDone(w, c, svc, false); return; }
      w.bulk.busy++; bulk = true;
    }
    var k = mkCall(w, svc, c, c.req);
    k.brk = b; k.gen = gen; k.bulk = bulk; k.deadline = w.def.timeout ? w.now + TIMEOUT : Infinity;
    c.child = k; c.state = 'waitchild';
    w.pools[svc].queue.push(k); w.calls.push(k);
  }
  // the call to `svc` made by `c` has ended (ok or not); decide what c does next
  function childDone(w, c, svc, ok) {
    if (!ok) {
      if (svc === 'recs') { /* optional: carry on without recommendations */ }
      else if (w.def.fallback) c.req.degraded = true;
      else { finishCall(w, c, false); return; }
    }
    if (c.todo.length) startChild(w, c); else finishCall(w, c, true);
  }
  function finishCall(w, c, ok) {
    c.state = 'done';
    if (c.thread) { w.pools[c.svc].busy--; c.thread = false; }
    if (c.parent) {
      var p = c.parent;
      if (!c.abandoned && p.child === c) {
        p.child = null;
        if (c.bulk) { w.bulk.busy--; c.bulk = false; }
        if (c.brk) breakerRecord(c.brk, ok, w.now, c.gen);
        childDone(w, p, c.svc, ok);
      }
    } else outcome(w, ok, c.req);
  }
  function step(w, dt) {
    w.now += dt;
    var list = w.calls.slice(), i, c, k;
    for (i = 0; i < list.length; i++) {                      // users give up after PATIENCE
      c = list[i];
      if (!c.parent && !c.req.userDone && w.now - c.req.t0 >= PATIENCE) {
        outcome(w, false, c.req);
        if (c.state === 'queued') { var q = w.pools.gateway.queue, ix = q.indexOf(c); if (ix >= 0) q.splice(ix, 1); c.state = 'done'; }
      }
    }
    for (i = 0; i < list.length; i++) {                      // callers stop waiting at the deadline
      c = list[i]; k = c.child;
      if (c.state === 'waitchild' && k && k.deadline <= w.now) {
        k.abandoned = true;
        if (k.state === 'queued') { var qq = w.pools[k.svc].queue, jx = qq.indexOf(k); if (jx >= 0) qq.splice(jx, 1); k.state = 'done'; }
        if (k.bulk) { w.bulk.busy--; k.bulk = false; }
        if (k.brk) breakerRecord(k.brk, false, w.now, k.gen);
        c.child = null;
        childDone(w, c, k.svc, false);
      }
    }
    for (i = 0; i < list.length; i++) {                      // own work finished
      c = list[i];
      if (c.state === 'work' && c.workEnd <= w.now) { if (c.todo.length) startChild(w, c); else finishCall(w, c, true); }
    }
    for (var name in w.pools) {                              // hand out free threads, first come first served
      var pool = w.pools[name];
      while (pool.busy < pool.size && pool.queue.length) {
        var n = pool.queue.shift();
        if (n.state !== 'queued') continue;
        pool.busy++; n.thread = true; n.state = 'work'; n.workEnd = w.now + (w.slow[name] ? SLOW_MS : OWN[name]);
      }
    }
    w.calls = w.calls.filter(function (x) { return x.state !== 'done'; });
  }
  function recent(w, n) {
    var o = w.outcomes.slice(-n), ok = 0, ms = 0, deg = 0;
    o.forEach(function (x) { if (x.ok) { ok++; ms += x.ms; if (x.degraded) deg++; } });
    return { len: o.length, pct: o.length ? ok / o.length : 0, avgMs: ok ? ms / ok : 0, degraded: deg };
  }
  /* model:end */

  const NAMES = { gateway: 'Gateway', orders: 'Orders', inventory: 'Inventory', pricing: 'Pricing', recs: 'Recommendations' };
  const BLOCKED_ON = { gateway: 'Orders', orders: 'Inventory', inventory: 'Pricing' };

  KS.labs.register({
    id: 'microservices-cascade',
    title: 'Cascade Lab',
    emoji: '🌊',
    blurb: 'Slow down one small service and watch the whole site drown. Then switch on defences, one at a time.',
    tags: ['microservices', 'resilience', 'timeouts', 'bulkhead', 'circuit breaker', 'cascading failure'],
    goals: [
      { id: 'cascade', text: 'Slow one service until the **whole site is down**' },
      { id: 'timeout', text: 'Slow **Pricing** and use **timeouts** to keep the front door free' },
      { id: 'bulkhead', text: 'Make **Recommendations** slow and keep checkout working with a **bulkhead**' },
      { id: 'recover', text: 'Get **above 95%** of users served while Pricing is still **slow**' }
    ],
    help: `A user request goes **Gateway → Orders → Inventory → Pricing**, and the gateway also asks **Recommendations** for a "you might like" strip (nice to have, not essential). Each service has a limited **thread pool**; a thread is held for the *whole* call, including all the time spent waiting for the next service.

So when **Pricing** is slow, its threads fill up, Inventory's threads get stuck waiting for it, then Orders', then the Gateway's, and nobody can get in. Users give up after 5 seconds.

Defences:
- **Timeouts**: stop waiting after 1 s, so threads are freed.
- **Circuit breakers**: after a few failures, stop calling at all (needs timeouts to spot failures).
- **Bulkhead**: recommendations may use at most 3 threads, so it cannot eat the rest.
- **Fallbacks**: carry on with a default answer instead of failing.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const slow = {}, def = {};
      let w = newWorld(slow, def);
      let rate = 8, running = true, acc = 0, wacc = 0, calm = 0;
      const full = {}; let siteDown = false;

      // ---------- UI ----------
      const nodes = {};
      nodes.users = ui.node('Users', '👥', { small: true });
      ['gateway', 'orders', 'inventory', 'pricing', 'recs'].forEach(s => {
        nodes[s] = ui.node(NAMES[s], { gateway: '🚪', orders: '🧾', inventory: '📦', pricing: '💲', recs: '✨' }[s], s === 'gateway' ? { small: true } : { small: true, onClick: () => setSlow(s, !slow[s]) });
      });
      const stage = ui.stage();
      stage.el.appendChild(ui.cols([nodes.users], [nodes.gateway, nodes.recs], [nodes.orders], [nodes.inventory], [nodes.pricing]));
      stage.wire(nodes.users, nodes.gateway, { tone: 'good' }); stage.wire(nodes.gateway, nodes.orders, { tone: 'good' });
      stage.wire(nodes.orders, nodes.inventory, { tone: 'good' }); stage.wire(nodes.inventory, nodes.pricing, { tone: 'good' });
      stage.wire(nodes.gateway, nodes.recs, { dashed: true });

      const meters = {}; ['gateway', 'orders', 'inventory', 'pricing', 'recs'].forEach(s => { meters[s] = ui.meter(NAMES[s] + ' threads'); });
      const sServed = ui.stat('users served (last 30)', '–'), sWait = ui.stat('avg wait', '–'), sDeg = ui.stat('got a fallback', 0), sFail = ui.stat('users failed', 0, 'good');
      const log = ui.log(50);
      const slowToggles = {};
      ['orders', 'inventory', 'pricing', 'recs'].forEach(s => { slowToggles[s] = ui.toggle(NAMES[s] + ' is slow', false, v => setSlow(s, v, true)); });
      function setSlow(s, v, fromToggle) {
        slow[s] = !!v; if (!fromToggle) slowToggles[s].set(v);
        log.add(NAMES[s] + (v ? ' is now **slow** (each call takes about 6 s).' : ' is **back to normal**.'), v ? 'warn' : 'good');
      }
      const defTog = (key, label, onMsg) => ui.toggle(label, false, v => { def[key] = v; log.add(onMsg + (v ? ' **on**.' : ' **off**.'), 'info'); });
      const pauseBtn = ui.btn('⏸ Pause users', () => { running = !running; pauseBtn.textContent = running ? '⏸ Pause users' : '▶ Resume users'; });

      root.appendChild(ui.panel('Break something (or tap a service)', ui.row(slowToggles.pricing, slowToggles.inventory, slowToggles.orders, slowToggles.recs)));
      root.appendChild(ui.panel('Defences',
        ui.row(defTog('timeout', '⏱ Timeouts (1 s)', 'Timeouts'), defTog('breaker', '🔌 Circuit breakers', 'Circuit breakers'), defTog('bulkhead', '🚧 Bulkhead for recommendations', 'Bulkhead'), defTog('fallback', '🛟 Fallbacks', 'Fallbacks')),
        h('p.muted.small', { style: { margin: '8px 0 0' } }, 'Breakers need timeouts to notice a slow service. Fallbacks only help once calls actually return.')));
      root.appendChild(ui.panel('Traffic', ui.row(pauseBtn, ui.slider('Users', { min: 2, max: 16, value: rate, fmt: v => v + ' req/s' }, v => { rate = v; }),
        ui.btn('↺ Reset the system', () => { w = newWorld(slow, def); acc = wacc = 0; siteDown = false; calm = 0; for (const k in full) full[k] = false; log.add('System reset: all threads freed, queues empty.', 'info'); }, 'ghost'))));
      root.appendChild(stage.el);
      root.appendChild(h('div.lab-grid2',
        ui.panel('Thread pools', ['gateway', 'orders', 'inventory', 'pricing', 'recs'].map(s => meters[s].el), h('div', { style: { height: '10px' } }), ui.stats(sServed, sWait, sDeg, sFail)),
        ui.panel('What just happened', log.el)));
      log.add('Traffic is flowing normally. Slow down **Pricing** and watch what happens upstream.', 'info');

      // ---------- simulation ----------
      function drain() {
        w.events.splice(0).forEach(e => {
          if (e.type !== 'breaker') return;
          const nm = e.edge.split('>').map(x => NAMES[x]).join(' → ');
          if (e.to === 'open') log.add('🔴 Breaker **' + nm + '** opened: calls fail instantly instead of waiting.', 'warn');
          else if (e.to === 'half') log.add('🟡 Breaker ' + nm + ' is testing the service again.', 'info');
          else log.add('🟢 Breaker ' + nm + ' closed: the service is answering again.', 'good');
        });
      }
      function checkSaturation() {
        ['pricing', 'inventory', 'orders', 'gateway', 'recs'].forEach(s => {
          const p = w.pools[s], isFull = p.busy >= p.size;
          if (isFull && !full[s]) {
            full[s] = true;
            if (s === 'gateway') log.add('🔥 **Gateway is out of threads.** The front door cannot take new users: the **whole site is down**.', 'bad');
            else if (s === 'recs') log.add('Recommendations has no free threads. Gateway threads calling it will have to wait.', 'warn');
            else if (slow[s]) log.add('**' + NAMES[s] + '** is out of threads: it is slow, so calls pile up in a queue.', 'bad');
            else log.add('**' + NAMES[s] + '** is out of threads too, though nothing is wrong with it. Every thread is stuck waiting for ' + BLOCKED_ON[s] + '. The problem has **spread upstream**.', 'bad');
          } else if (!isFull && full[s] && p.busy < p.size * 0.6) { full[s] = false; log.add(NAMES[s] + ' has free threads again.', 'good'); }
        });
      }
      function checkGoals() {
        const r20 = recent(w, 20), r30 = recent(w, 30), anySlow = Object.keys(slow).some(k => slow[k]);
        const gwFull = w.pools.gateway.busy >= w.pools.gateway.size;
        if (anySlow && r20.len >= 20 && r20.pct <= 0.1 && gwFull) api.goal('cascade');
        if (slow.recs && def.bulkhead && !slow.orders && !slow.inventory && !slow.pricing && r20.len >= 20 && r20.pct >= 0.85) api.goal('bulkhead');
        if (slow.pricing && r30.len >= 30 && r30.pct > 0.95) api.goal('recover');
        if (r30.len >= 10) {
          if (!siteDown && r30.pct < 0.3) { siteDown = true; log.add('😱 Fewer than 30% of users are being served.', 'bad'); }
          else if (siteDown && r30.pct >= 0.9) { siteDown = false; log.add('🎉 The site is healthy again: over 90% of users served.', 'good'); }
        }
      }
      function render() {
        ['gateway', 'orders', 'inventory', 'pricing', 'recs'].forEach(s => {
          const p = w.pools[s], ratio = p.busy / p.size;
          meters[s].set(ratio, p.busy + '/' + p.size + (p.queue.length ? ' · ' + p.queue.length + ' waiting' : ''), ratio >= 1 ? 'bad' : ratio >= 0.7 ? 'warn' : 'good');
          nodes[s].setSub(p.busy + '/' + p.size + (p.queue.length ? ' +' + p.queue.length : ''));
          nodes[s].setState(ratio >= 1 ? 'down' : slow[s] ? 'warn' : ratio >= 0.7 ? 'busy' : 'ok');
        });
        const r = recent(w, 30);
        nodes.users.setSub(r.len >= 5 ? Math.round(r.pct * 100) + '% served' : '');
        nodes.users.setState(r.len < 5 ? 'ok' : r.pct < 0.5 ? 'down' : r.pct < 0.9 ? 'warn' : 'ok');
        sServed.set(r.len >= 5 ? Math.round(r.pct * 100) + '%' : '–', r.len >= 5 ? (r.pct >= 0.9 ? 'good' : r.pct >= 0.5 ? 'warn' : 'bad') : '');
        sWait.set(r.pct > 0 ? (r.avgMs / 1000).toFixed(1) + ' s' : '–');
        sDeg.set(r.degraded);
        sFail.set(w.fails, w.fails ? 'bad' : 'good');
      }

      api.loop(dt => {
        if (running) { acc += dt * rate; let g = 0; while (acc >= 1 && g++ < 40) { acc -= 1; spawn(w); } if (acc > 2) acc = 0; }
        wacc += dt * 1000; let n = 0;
        while (wacc >= 25 && n++ < 12) { step(w, 25); wacc -= 25; }
        if (wacc > 100) wacc = 0;
        drain();
      });
      api.every(250, () => { checkSaturation(); checkGoals(); render(); });
      api.every(1000, () => {
        const gw = w.pools.gateway;
        if (def.timeout && slow.pricing && gw.queue.length === 0 && gw.busy < gw.size) calm++; else calm = 0;
        if (calm >= 6) {
          if (!api.goalDone('timeout')) log.add('✅ With timeouts, calls give up after 1 s, threads are freed, and the **gateway stays open** even though Pricing is still slow.', 'good');
          api.goal('timeout');
        }
      });
      render();
      return () => stage.destroy();
    }
  });
})();
