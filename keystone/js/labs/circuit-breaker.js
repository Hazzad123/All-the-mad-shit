/* Lab: circuit-breaker — when a dependency fails, stop calling it; failing fast protects you. */
(function () {
  'use strict';

  /* ---------- pure model: explicit clock (ms), no DOM ---------- */
  /* model:start */
  var POOL = 10;        // threads the app can use for requests
  var TIMEOUT = 3000;   // the app gives up waiting on the payment service after 3 s

  function newBreaker() { return { state: 'closed', fails: 0, openedAt: 0, sent: 0, okTrials: 0, gen: 0, onChange: null }; }
  function toState(b, st, now) {
    var from = b.state;
    b.state = st; b.gen++; b.fails = 0; b.sent = 0; b.okTrials = 0;
    if (st === 'open') b.openedAt = now;
    if (b.onChange && from !== st) b.onChange(from, st);
  }
  // open -> half-open once the cool-down has passed
  function breakerTick(b, cfg, now) {
    if (b.state === 'open' && now - b.openedAt >= cfg.cooldown) toState(b, 'half', now);
  }
  // may this request go downstream?
  function breakerAllow(b, cfg, now) {
    breakerTick(b, cfg, now);
    if (b.state === 'closed') return true;
    if (b.state === 'half' && b.sent < cfg.trials) { b.sent++; return true; }
    return false;
  }
  // report how a downstream call ended; `gen` is b.gen at the time the call was sent
  function breakerRecord(b, cfg, ok, now, gen) {
    if (gen !== b.gen) return;                       // the breaker has changed state since: stale result
    if (b.state === 'closed') {
      if (ok) b.fails = 0;
      else { b.fails++; if (b.fails >= cfg.threshold) toState(b, 'open', now); }
    } else if (b.state === 'half') {
      if (ok) { b.okTrials++; if (b.okTrials >= cfg.trials) toState(b, 'closed', now); }
      else toState(b, 'open', now);
    }
  }
  function downstream(health, rnd) {
    if (health === 'slow') return { ms: TIMEOUT, ok: false, kind: 'timeout' };
    if (health === 'down') return { ms: 300, ok: false, kind: 'error' };
    return { ms: 80 + Math.round(rnd() * 80), ok: true, kind: 'ok' };
  }
  /* model:end */

  function fmtMs(ms) { return ms < 1000 ? Math.round(ms) + ' ms' : (ms / 1000).toFixed(1) + ' s'; }

  KS.labs.register({
    id: 'circuit-breaker',
    title: 'Circuit Breaker',
    emoji: '🔌',
    blurb: 'Your shop calls a payment service. Break the service, then see how a breaker keeps the damage from spreading.',
    tags: ['resilience', 'circuit breaker', 'fail fast', 'thread pool'],
    goals: [
      { id: 'trip', text: 'Set the service to **Down**, send traffic and **trip** the breaker open' },
      { id: 'fallback', text: 'Turn on the **fallback** and serve a friendly answer while the breaker is open' },
      { id: 'recover', text: 'Make the service **Healthy** again and watch the breaker go half-open, then **closed**' },
      { id: 'exhaust', text: 'Remove the breaker, make the service **Slow** and use up every thread in the app' }
    ],
    help: `**Your app** takes orders and calls a **payment service** for each one. Every call in progress uses up one **thread**, and the app only has ${POOL}.

The **circuit breaker** sits in the middle and counts failures:

- **Closed**: everything flows normally.
- **Open**: after enough failures in a row it stops calling the service at all. Requests fail *instantly*, which is kinder to the user and gives the service room to recover.
- **Half-open**: after a cool-down it lets a few **trial** requests through. If they succeed it closes again; if not, it opens again.

Without a breaker, a *slow* service is the dangerous case: each call waits ${TIMEOUT / 1000} seconds, holding a thread, until the app has none left and cannot serve anyone, even for things that have nothing to do with payments. A **fallback** gives the user a degraded answer (like "pay on delivery") instead of an error.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const cfg = { enabled: true, fallback: false, threshold: 4, cooldown: 6000, trials: 2 };
      let brk = newBreaker();
      let health = 'healthy', rate = 3, running = false, acc = 0, clock = 0, seq = 0, inflight = 0, flying = 0;
      let pending = [];
      const st = { sent: 0, fast: 0, errors: 0, served: 0 };
      const waits = [];

      // ---------- UI ----------
      const appN = ui.node('Your app', '🛒', { small: true });
      const brkN = ui.node('Circuit breaker', '🔌', { small: true });
      const svcN = ui.node('Payment service', '💳', { small: true });
      const stage = ui.stage();
      stage.el.appendChild(ui.cols([appN], [brkN], [svcN]));
      const wire1 = stage.wire(appN, brkN, { tone: 'good' });
      const wire2 = stage.wire(brkN, svcN, { tone: 'good' });

      const chips = {
        closed: h('span.lab-chip', '🟢 Closed'),
        open: h('span.lab-chip', '🔴 Open'),
        half: h('span.lab-chip', '🟡 Half-open')
      };
      const stateText = h('p.muted.small', { style: { margin: '8px 0 0' } });
      const meterThreads = ui.meter('Threads in use (the app only has ' + POOL + ')');
      const appStatus = h('p.small', { style: { margin: '8px 0 0', fontWeight: '700' } });
      const sDown = ui.stat('calls sent to service', 0), sFast = ui.stat('failed fast / fallback', 0), sErr = ui.stat('errors users saw', 0, 'good'), sWait = ui.stat('avg wait (last 10)', '–');
      const log = ui.log(50);

      const healthSeg = ui.seg([['healthy', '✅ Healthy'], ['slow', '🐌 Slow'], ['down', '💥 Down']], health, v => {
        health = v;
        log.add(v === 'healthy' ? 'Payment service is **healthy** again (answers in about 0.1 s).' :
          v === 'slow' ? 'Payment service is **slow**: it would answer after ~8 s, but the app gives up after ' + TIMEOUT / 1000 + ' s.' :
          'Payment service is **down**: every call fails after about 0.3 s.', v === 'healthy' ? 'good' : 'warn');
        render();
      });
      const runBtn = ui.btn('▶ Start traffic', () => { running = !running; runBtn.textContent = running ? '⏸ Pause traffic' : '▶ Start traffic'; }, 'primary');

      root.appendChild(ui.panel('Controls',
        ui.row(h('b', 'Payment service is:'), healthSeg),
        ui.row(runBtn, ui.btn('Send one order', () => sendRequest()),
          ui.slider('Traffic', { min: 1, max: 10, value: rate, fmt: v => v + ' orders/s' }, v => { rate = v; })),
        ui.row(
          ui.toggle('Circuit breaker', true, v => {
            cfg.enabled = v;
            if (v) { brk = newBreaker(); brk.onChange = onBreaker; }
            log.add(v ? 'Circuit breaker **installed** (closed).' : 'Circuit breaker **removed**: every order now goes straight to the payment service.', v ? 'info' : 'warn');
            render();
          }),
          ui.toggle('Fallback ("pay on delivery")', false, v => { cfg.fallback = v; log.add('Fallback ' + (v ? '**on**: failed payments get a degraded answer instead of an error.' : '**off**.'), 'info'); })),
        ui.row(
          ui.slider('Trip after', { min: 1, max: 10, value: cfg.threshold, fmt: v => v + ' failures' }, v => { cfg.threshold = v; }),
          ui.slider('Cool-down', { min: 2, max: 15, value: cfg.cooldown / 1000, fmt: v => v + ' s' }, v => { cfg.cooldown = v * 1000; }),
          ui.slider('Trial requests', { min: 1, max: 5, value: cfg.trials, fmt: v => String(v) }, v => { cfg.trials = v; }))));
      root.appendChild(stage.el);
      root.appendChild(h('div.lab-grid2',
        ui.panel('Breaker state', ui.row(chips.closed, chips.open, chips.half), stateText, h('div', { style: { height: '10px' } }), meterThreads.el, appStatus, h('div', { style: { height: '10px' } }), ui.stats(sDown, sFast, sErr, sWait)),
        ui.panel('What just happened', log.el)));
      brk.onChange = onBreaker;
      log.add('Press **Start traffic**, then set the service to **Down** and watch.', 'info');

      // ---------- simulation ----------
      function onBreaker(from, to) {
        if (to === 'open') {
          log.add(from === 'half' ? '🔴 A trial request **failed**, so the breaker goes **open** again for another cool-down.' :
            '🔴 **Breaker OPEN.** ' + cfg.threshold + ' failures in a row. It now stops calling the payment service and fails requests instantly.', 'bad');
          api.goal('trip');
        } else if (to === 'half') {
          log.add('🟡 Cool-down over: **half-open**. The next ' + cfg.trials + ' request(s) are trials sent to the real service.', 'warn');
        } else if (to === 'closed') {
          log.add('🟢 Trials succeeded: breaker **closed**. Normal traffic flows again.', 'good');
          api.goal('recover');
        }
      }
      function outcome(kind, waited, n) {
        waits.push(waited); if (waits.length > 10) waits.shift();
        if (kind === 'ok') { st.served++; log.add('Order #' + n + ' → payment answered in ' + fmtMs(waited) + ' ✓', 'dim'); }
        else if (kind === 'fallback') { st.served++; log.add('Order #' + n + ' → payment unavailable, user got the **fallback** answer after ' + fmtMs(waited) + ' ✓ (degraded but happy)', 'good'); }
        else if (kind === 'fast') { st.errors++; log.add('Order #' + n + ' → breaker is open, **failed instantly** ✗ (the service was not even asked)', 'warn'); }
        else if (kind === 'error') { st.errors++; log.add('Order #' + n + ' → payment service returned an error after ' + fmtMs(waited) + ' ✗', 'bad'); }
        else if (kind === 'timeout') { st.errors++; log.add('Order #' + n + ' → **no answer** for ' + fmtMs(waited) + ', the app gave up ✗ (a thread was stuck all that time)', 'bad'); }
        else if (kind === 'busy') { st.errors++; log.add('Order #' + n + ' → the app has **no free threads** ✗ (all ' + POOL + ' are stuck waiting for payments)', 'bad'); }
      }
      function fly(a, b, tone) {
        if (flying >= 8) return Promise.resolve();
        flying++;
        return stage.send(a, b, { tone: tone, ms: 280 }).then(() => { flying--; });
      }
      function sendRequest() {
        const n = ++seq;
        if (inflight >= POOL) { outcome('busy', 0, n); appN.pulse('bad'); render(); return; }
        let allowed = true, gen = 0;
        if (cfg.enabled) { allowed = breakerAllow(brk, cfg, clock); gen = brk.gen; }
        fly(appN, brkN, 'accent').then(() => { if (api.alive() && allowed) fly(brkN, svcN, 'accent'); });
        if (!allowed) {
          st.fast++;
          if (cfg.fallback) { outcome('fallback', 5, n); if (brk.state === 'open') api.goal('fallback'); }
          else outcome('fast', 5, n);
          brkN.pulse('bad'); render(); return;
        }
        const r = downstream(health, Math.random);
        st.sent++; inflight++;
        pending.push({ n: n, start: clock, end: clock + r.ms, r: r, gen: gen, b: brk });
        render();
      }
      function finish(p) {
        inflight--;
        if (cfg.enabled && p.b === brk) breakerRecord(brk, cfg, p.r.ok, clock, p.gen);
        svcN.pulse(p.r.ok ? 'good' : 'bad');
        const waited = p.end - p.start;
        if (p.r.ok) outcome('ok', waited, p.n);
        else if (cfg.fallback) { st.fast++; outcome('fallback', waited, p.n); }
        else outcome(p.r.kind, waited, p.n);
      }
      function tick() {
        if (cfg.enabled) breakerTick(brk, cfg, clock);
        const due = pending.filter(p => p.end <= clock).sort((a, b) => a.end - b.end);
        if (due.length) { pending = pending.filter(p => p.end > clock); due.forEach(finish); }
        if (!cfg.enabled && health === 'slow' && inflight >= POOL) {
          if (!api.goalDone('exhaust')) log.add('🧵 **All ' + POOL + ' threads are stuck** waiting on the slow service. The app cannot take any order now, not even ones that do not need payments.', 'bad');
          api.goal('exhaust');
        }
      }
      function render() {
        const on = cfg.enabled;
        [['closed', 'good'], ['open', 'bad'], ['half', 'warn']].forEach(k => { chips[k[0]].className = 'lab-chip' + (on && brk.state === k[0] ? ' tn-' + k[1] : ''); });
        let txt;
        if (!on) txt = 'No breaker: every order goes straight to the payment service.';
        else if (brk.state === 'closed') txt = 'Closed: calls flow. Consecutive failures so far: ' + brk.fails + ' of ' + cfg.threshold + '.';
        else if (brk.state === 'open') txt = 'Open: failing fast. Trying the service again in ' + Math.max(0, Math.ceil((cfg.cooldown - (clock - brk.openedAt)) / 1000)) + ' s.';
        else txt = 'Half-open: testing the service with ' + cfg.trials + ' trial request(s) (' + brk.okTrials + ' succeeded, ' + brk.sent + ' sent).';
        stateText.textContent = txt;
        meterThreads.set(inflight / POOL, inflight + ' / ' + POOL, inflight >= POOL ? 'bad' : inflight >= POOL * 0.7 ? 'warn' : 'good');
        const full = inflight >= POOL;
        appStatus.textContent = full ? '🔥 The app is down: no threads left for anyone.' : '✅ The app is serving requests.';
        appStatus.className = 'small ' + (full ? 'bad' : 'good');
        appN.setState(full ? 'down' : inflight >= POOL * 0.7 ? 'busy' : 'ok'); appN.setSub(inflight + '/' + POOL + ' threads');
        brkN.setState(!on ? 'idle' : brk.state === 'closed' ? 'ok' : brk.state === 'open' ? 'down' : 'warn');
        brkN.setSub(on ? brk.state === 'half' ? 'half-open' : brk.state : 'removed');
        svcN.setState(health === 'healthy' ? 'ok' : health === 'slow' ? 'warn' : 'down'); svcN.setSub(health);
        wire1.set(full ? 'bad' : 'good', false);
        wire2.set(!on ? (health === 'healthy' ? 'good' : 'bad') : brk.state === 'closed' ? 'good' : brk.state === 'open' ? 'bad' : 'warn', on && brk.state !== 'closed');
        sDown.set(st.sent); sFast.set(st.fast); sErr.set(st.errors, st.errors ? 'bad' : 'good');
        sWait.set(waits.length ? fmtMs(waits.reduce((a, b) => a + b, 0) / waits.length) : '–');
      }

      api.loop(dt => {
        clock += dt * 1000;
        if (running) { acc += dt * rate; let guard = 0; while (acc >= 1 && guard++ < 20) { acc -= 1; sendRequest(); } if (acc > 5) acc = 0; }
        tick();
        render();
      });
      render();
      return () => stage.destroy();
    }
  });
})();
