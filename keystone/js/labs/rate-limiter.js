/* Lab: rate-limiter — limits protect a service; the algorithm decides how bursts are treated. */
(function () {
  'use strict';

  /* ---------- pure model: explicit clock (ms), no DOM ---------- */
  /* model:start */
  function mkLimiter(alg, c, now) {
    return { alg: alg, cap: c.limit, rate: c.refill, win: c.window * 1000, tokens: c.limit, last: now, start: -1, count: 0, ts: [], oks: [] };
  }
  // returns { ok, retry } where retry is whole seconds (Retry-After) when refused
  function lmAllow(l, now) {
    var res;
    if (l.alg === 'bucket') {
      l.tokens = Math.min(l.cap, l.tokens + Math.max(0, now - l.last) / 1000 * l.rate); l.last = now;
      if (l.tokens >= 1) { l.tokens -= 1; res = { ok: true }; }
      else res = { ok: false, retry: Math.max(1, Math.ceil((1 - l.tokens) / l.rate)) };
    } else if (l.alg === 'fixed') {
      var ws = Math.floor(now / l.win) * l.win;
      if (ws !== l.start) { l.start = ws; l.count = 0; }
      if (l.count < l.cap) { l.count++; res = { ok: true }; }
      else res = { ok: false, retry: Math.max(1, Math.ceil((l.start + l.win - now) / 1000)) };
    } else {
      while (l.ts.length && l.ts[0] <= now - l.win) l.ts.shift();
      if (l.ts.length < l.cap) { l.ts.push(now); res = { ok: true }; }
      else res = { ok: false, retry: Math.max(1, Math.ceil((l.ts[0] + l.win - now) / 1000)) };
    }
    if (res.ok) { l.oks.push(now); while (l.oks.length && l.oks[0] <= now - l.win) l.oks.shift(); }
    return res;
  }
  // how many accepted requests fall inside the last window (used to spot a boundary burst)
  function okInWindow(l, now) { var n = 0; for (var i = 0; i < l.oks.length; i++) if (l.oks[i] > now - l.win) n++; return n; }
  // read-only view for drawing: { free, used }
  function lmPeek(l, now) {
    if (l.alg === 'bucket') { var t = Math.min(l.cap, l.tokens + Math.max(0, now - l.last) / 1000 * l.rate); return { free: Math.floor(t), used: l.cap - Math.floor(t), tokens: t }; }
    if (l.alg === 'fixed') { var used = Math.floor(now / l.win) * l.win === l.start ? l.count : 0; return { free: l.cap - used, used: used, reset: Math.ceil((Math.floor(now / l.win) * l.win + l.win - now) / 1000) }; }
    var u = 0; for (var i = 0; i < l.ts.length; i++) if (l.ts[i] > now - l.win) u++;
    return { free: l.cap - u, used: u };
  }
  /* model:end */

  KS.labs.register({
    id: 'rate-limiter',
    title: 'Rate Limiter',
    emoji: '🚦',
    blurb: 'A bouncer for your API. Three algorithms count requests differently, and the difference shows up when traffic comes in bursts.',
    tags: ['rate limiting', 'token bucket', 'throttling', '429', 'api'],
    goals: [
      { id: 'limited', text: 'Send requests until you get a **429**' },
      { id: 'refill', text: 'With the **token bucket**, wait for it to refill and get a **200** again' },
      { id: 'boundary', text: 'Use the **fixed window** and sneak **twice the limit** through with the boundary burst' },
      { id: 'sliding', text: 'Run the same boundary burst on the **sliding window** and watch it hold the limit' },
      { id: 'fair', text: 'Turn on **limit per client**, let A spam, and keep client B working' }
    ],
    help: `A **rate limiter** says "no, slow down" (HTTP status **429 Too Many Requests**, with a **Retry-After** hint) once a client sends too much. Three common ways to count:

- **Token bucket**: a bucket holds tokens and refills at a steady rate. Each request takes one. A full bucket allows a short burst, then you are held to the refill rate.
- **Fixed window**: "at most N per clock window". Simple, but a client can send N at the very end of one window and N more at the start of the next: twice the limit in a blink.
- **Sliding window**: always looks back over the last window's length, so there is no edge to exploit.

Without **per-client** limits, one noisy client uses up the shared allowance and everyone else gets 429s too. The coloured boxes show what is left (green tokens or red used slots), and the strip underneath shows recent answers.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const cfg = { limit: 5, refill: 1, window: 5 };
      let alg = 'bucket', perClient = false, who = 'A', clock = 0;
      const rates = { A: 0, B: 0 }, accum = { A: 0, B: 0 };
      let lims = {};
      const hist = [];                               // recent requests {c, code}
      const recent = { A: [], B: [] };               // last codes per client
      const lastCode = { A: 0, B: 0 };
      const limitedSeen = {};                        // bucket keys that have been refused since last success
      let dirty = true;

      function getLim(client) {
        const key = perClient ? client : 'shared';
        if (!lims[key]) lims[key] = mkLimiter(alg, cfg, clock);
        return lims[key];
      }
      function limKey(client) { return perClient ? client : 'shared'; }
      function resetLims(why) { lims = {}; limitedSeen['A'] = limitedSeen['B'] = limitedSeen.shared = false; if (why) log.add(why, 'info'); render(); }

      // ---------- UI ----------
      const log = ui.log(50);
      const timeline = h('div.lab-cells');
      const retryLine = h('p.muted.small', { style: { margin: '8px 0 0' } }, 'No requests yet.');
      const gauges = { A: h('div'), B: h('div') };
      const gaugeText = { A: h('p.muted.small', { style: { margin: '4px 0 0' } }), B: h('p.muted.small', { style: { margin: '4px 0 0' } }) };
      const gaugeCells = { A: h('div.lab-cells'), B: h('div.lab-cells') };
      const sOk = ui.stat('200 OK', 0, 'good'), s429 = ui.stat('429 refused', 0, 'bad');
      let nOk = 0, n429 = 0;

      const algSeg = ui.seg([['bucket', '🪣 Token bucket'], ['fixed', '🪟 Fixed window'], ['sliding', '🎞️ Sliding window']], alg, v => {
        alg = v; syncSliders();
        resetLims('Switched to **' + (v === 'bucket' ? 'token bucket' : v === 'fixed' ? 'fixed window' : 'sliding window') + '**. Counters reset.');
      });
      const limitSl = ui.slider('Limit (bucket size / requests per window)', { min: 1, max: 20, value: cfg.limit }, v => { cfg.limit = v; resetLims('Limit is now **' + v + '**. Counters reset.'); });
      const refillSl = ui.slider('Refill', { min: 0.5, max: 5, step: 0.5, value: cfg.refill, fmt: v => v + ' tokens/s' }, v => { cfg.refill = v; resetLims('Refill is now **' + v + ' tokens per second**.'); });
      const windowSl = ui.slider('Window length', { min: 2, max: 10, value: cfg.window, fmt: v => v + ' s' }, v => { cfg.window = v; resetLims('Window is now **' + v + ' seconds**.'); });
      function syncSliders() { refillSl.style.display = alg === 'bucket' ? '' : 'none'; windowSl.style.display = alg === 'bucket' ? 'none' : ''; }
      syncSliders();
      const whoSeg = ui.seg([['A', '👤 Client A'], ['B', '🧑 Client B']], who, v => { who = v; });

      root.appendChild(ui.panel('Algorithm', algSeg, h('div', { style: { height: '10px' } }), ui.row(limitSl, refillSl, windowSl)));
      root.appendChild(ui.panel('Send traffic',
        ui.row(h('b', 'Send as:'), whoSeg),
        ui.row(ui.btn('Send request', () => manual(1), 'primary'), ui.btn('Burst of 20', () => manual(20)), ui.btn('⚡ Boundary burst', boundaryBurst)),
        h('p.muted.small', { style: { margin: '8px 0' } }, 'Boundary burst: jumps the clock to just before a window edge, sends a full limit of requests, waits 0.1 s, then sends a full limit again.'),
        ui.row(ui.slider('Client A auto-spam', { min: 0, max: 30, value: 0, fmt: v => v + ' req/s' }, v => { rates.A = v; }),
          ui.slider('Client B steady', { min: 0, max: 5, value: 0, fmt: v => v + ' req/s' }, v => { rates.B = v; })),
        ui.row(ui.toggle('Limit per client (each gets their own allowance)', false, v => { perClient = v; resetLims('Limits are now **' + (v ? 'per client: A and B each get their own allowance' : 'shared: A and B draw from one allowance') + '**.'); }))));
      root.appendChild(h('div.lab-grid2',
        ui.panel('What is left', h('b.small', 'Client A'), gaugeCells.A, gaugeText.A, h('div', { style: { height: '10px' } }), h('b.small', 'Client B'), gaugeCells.B, gaugeText.B),
        ui.panel('Totals', ui.stats(sOk, s429))));
      root.appendChild(ui.panel('Recent answers (newest last)', timeline, retryLine));
      root.appendChild(ui.panel('What just happened', log.el));
      log.add('Tap **Send request** until the limiter says no.', 'info');

      // ---------- simulation ----------
      // mode: 'manual' (log each), 'auto' (log changes only), 'quiet' (caller logs a summary)
      function request(client, mode) {
        const l = getLim(client);
        const r = lmAllow(l, clock);
        const code = r.ok ? 200 : 429, key = limKey(client);
        hist.push({ c: client, code: code }); if (hist.length > 40) hist.shift();
        recent[client].push(code); if (recent[client].length > 12) recent[client].shift();
        if (r.ok) nOk++; else n429++;
        dirty = true;
        if (mode === 'manual' || (mode === 'auto' && lastCode[client] !== code)) {
          log.add('Client ' + client + ' → ' + (r.ok ? '**200 OK**' : '**429 Too Many Requests** (Retry-After: ' + r.retry + ' s)') + (mode === 'auto' ? ' (auto traffic)' : ''), r.ok ? 'good' : 'bad');
        }
        lastCode[client] = code;
        if (!r.ok) { retryLine.textContent = 'Last refusal: Client ' + client + ' got 429 with Retry-After: ' + r.retry + ' s.'; api.goal('limited'); if (alg === 'bucket') limitedSeen[key] = true; }
        else if (alg === 'bucket' && limitedSeen[key]) {
          limitedSeen[key] = false; api.goal('refill');
          log.add('The bucket refilled, so Client ' + client + ' is **allowed again**. Refill rate = long-run speed limit.', 'info');
        }
        if (r.ok && alg === 'fixed' && okInWindow(l, clock) > cfg.limit) api.goal('boundary');
        return r;
      }
      function manual(n) {
        if (n === 1) { request(who, 'manual'); render(); return; }
        let ok = 0; for (let i = 0; i < n; i++) if (request(who, 'quiet').ok) ok++;
        log.add('Client ' + who + ' sent a burst of ' + n + ' at once → **' + ok + ' passed**, ' + (n - ok) + ' refused.', ok === n ? 'good' : 'warn');
        render();
      }
      function boundaryBurst() {
        const W = cfg.window * 1000;
        clock = (Math.floor(clock / W) + 2) * W - 50;           // fresh, empty windows, 50 ms before an edge
        const n = cfg.limit;
        let first = 0, second = 0;
        for (let i = 0; i < n; i++) if (request(who, 'quiet').ok) first++;
        clock += 100;
        for (let i = 0; i < n; i++) if (request(who, 'quiet').ok) second++;
        const total = first + second;
        log.add('(Clock jumped to just before a window edge.) Client ' + who + ' sent ' + n + ' requests, waited 0.1 s, then sent ' + n + ' more.', 'info');
        log.add('Result: ' + first + ' passed, then ' + second + ' passed → **' + total + ' requests in 0.1 s** against a limit of ' + n + '.', total > n ? 'bad' : 'good');
        if (alg === 'fixed' && total > n) log.add('The edge of the window reset the counter in the middle of the burst, so the limit was **doubled**. That is the fixed window\'s weakness.', 'warn');
        if (alg === 'sliding') {
          if (first >= 1 && second === 0 && total <= n) { api.goal('sliding'); log.add('The sliding window remembers the last ' + cfg.window + ' s, so there is **no edge to sneak across**. The limit held.', 'good'); }
        }
        if (alg === 'bucket') log.add('A token bucket allows a burst up to its size, then only the refill rate.', 'info');
        render();
      }
      function checkFair() {
        if (!perClient) return;
        const a = recent.A, b = recent.B;
        if (a.length >= 10 && a.slice(-10).filter(c => c === 429).length >= 5 && b.length >= 3 && b.slice(-3).every(c => c === 200)) {
          api.goal('fair');
        }
      }
      function render() {
        ['A', 'B'].forEach(c => {
          const l = getLim(c), p = lmPeek(l, clock);
          KS.clear(gaugeCells[c]);
          for (let i = 0; i < cfg.limit; i++) gaugeCells[c].appendChild(h('span.lab-cell.' + (alg === 'bucket' ? (i < p.free ? 'good' : 'dim') : (i < p.used ? 'bad' : 'dim')), alg === 'bucket' ? (i < p.free ? '●' : '○') : (i < p.used ? '✖' : '○')));
          gaugeText[c].textContent = (perClient ? '' : '(shared with the other client) ') + (alg === 'bucket' ? p.tokens.toFixed(1) + ' tokens in the bucket' : p.used + ' of ' + cfg.limit + ' used' + (alg === 'fixed' ? ', window resets in ' + p.reset + ' s' : ' in the last ' + cfg.window + ' s'));
        });
        sOk.set(nOk); s429.set(n429);
        if (dirty) {
          dirty = false; KS.clear(timeline);
          hist.forEach(x => timeline.appendChild(h('span.lab-cell.' + (x.code === 200 ? 'good' : 'bad'), x.c + ' ' + x.code)));
        }
      }

      api.loop(dt => {
        clock += dt * 1000;
        ['A', 'B'].forEach(c => {
          if (!rates[c]) { accum[c] = 0; return; }
          accum[c] += dt * rates[c]; let g = 0;
          while (accum[c] >= 1 && g++ < 40) { accum[c] -= 1; request(c, 'auto'); }
          if (accum[c] > 1) accum[c] = 0;
        });
        checkFair();
        render();
      });
      render();
      return () => {};
    }
  });
})();
