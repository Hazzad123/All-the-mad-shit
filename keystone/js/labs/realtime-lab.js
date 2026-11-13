/* Lab: realtime-lab — four ways to get news from a server (short polling, long polling, SSE, WebSocket) and what each costs. */
(function () {
  // ---------- pure model (exposed as `logic` for Node tests) ----------
  const NET = 0.1;        // one-way network time in seconds
  const HOLD = 8;         // how long a long-poll request waits before the server gives up with an empty answer
  const KINDS = ['short', 'long', 'sse', 'ws'];
  const NAMES = { short: 'Short polling', long: 'Long polling', sse: 'Server-Sent Events', ws: 'WebSocket' };

  function intervalAt(changes, t) { let v = changes[0].v; for (let i = 0; i < changes.length; i++) if (changes[i].t <= t) v = changes[i].v; return v; }

  /** Simulate one technique up to time `now`. events/msgs = sorted times. Returns requests, deliveries, extra POSTs and stats. */
  function simulate(kind, events, msgs, now, changes) {
    const reqs = [], dels = [], posts = [];
    const done = {};                                   // event index -> delivered
    if (kind === 'short') {
      let t = intervalAt(changes, 0);
      while (t <= now && reqs.length < 2000) {
        const iv = intervalAt(changes, t), arrive = t + NET, resp = t + 2 * NET; let got = 0;
        events.forEach((e, i) => { if (!done[i] && e <= arrive) { done[i] = true; got++; dels.push({ i, e, d: resp, interval: iv }); } });
        reqs.push({ t, end: resp, wasted: !got });
        t += iv;
      }
    } else if (kind === 'long') {
      let t = 0;
      while (t <= now && reqs.length < 2000) {
        const arrive = t + NET; let send, wasted = false;
        const pending = []; events.forEach((e, i) => { if (!done[i]) pending.push(i); });
        if (pending.length && events[pending[0]] <= arrive) send = arrive;                 // news was already waiting
        else if (pending.length && events[pending[0]] < arrive + HOLD) send = events[pending[0]];   // held until news arrived
        else { send = arrive + HOLD; wasted = true; }                                      // nothing happened: empty answer
        const resp = send + NET;
        pending.forEach(i => { if (events[i] <= send) { done[i] = true; dels.push({ i, e: events[i], d: resp }); } });
        reqs.push({ t, end: resp, wasted });
        t = resp;                                      // the client immediately asks again
      }
    } else {
      reqs.push({ t: 0, end: null, wasted: false });   // one connection, kept open for good
      events.forEach((e, i) => dels.push({ i, e, d: e + NET }));
    }
    msgs.forEach(c => { if (kind !== 'ws') posts.push({ t: c, end: c + 2 * NET }); });
    const finished = reqs.filter(r => r.end === null || r.end <= now);
    const seen = dels.filter(x => x.d <= now);
    let sum = 0; seen.forEach(x => { sum += x.d - x.e; });
    const inFlight = reqs.some(r => r.t <= now && (r.end === null || r.end > now));
    return {
      reqs, dels, posts,
      stats: {
        requests: reqs.filter(r => r.t <= now).length + posts.filter(p => p.t <= now).length,
        wasted: finished.filter(r => r.wasted).length,
        avg: seen.length ? sum / seen.length : null,
        open: inFlight && (kind === 'long' || kind === 'sse' || kind === 'ws') ? 1 : 0,
        delivered: seen.length
      }
    };
  }
  const logic = { NET, HOLD, KINDS, simulate, intervalAt };

  KS.labs.register({
    logic,
    id: 'realtime-lab',
    title: 'Real-Time Lab',
    emoji: '📡',
    blurb: 'Four ways for a server to tell a browser "something happened", side by side on one timeline.',
    tags: ['websocket', 'sse', 'polling', 'long polling', 'real-time'],
    goals: [
      { id: 'compare', text: 'Let it run for **20 seconds** with at least **5 events** and compare the request counts' },
      { id: 'delay', text: 'Raise the polling interval to **5 s or more** and watch short polling get slow' },
      { id: 'twoway', text: 'Press **Send from client** and see the WebSocket do it with no new request' },
      { id: 'wasted', text: 'Work out which technique **wastes the most requests**' }
    ],
    help: `The server sometimes has news (an **event**, the orange diamonds). A browser cannot just wait to be told, so there are four approaches.

- **Short polling:** ask every few seconds "anything new?". Most answers are empty, and news waits for the next ask.
- **Long polling:** ask, and the server holds the request open until it has news (or gives up after 8 s). Then ask again.
- **Server-Sent Events:** one connection stays open and the server pushes news down it. One way only.
- **WebSocket:** one connection, both directions. The client can speak too, with no extra request.

On the timeline, a bar is a request (grey means it came back empty), a green dot is news arriving, and the orange line is how long it waited.`,

    mount(root, api) {
      const ui = api.ui, h = api.h, s = api.s;
      let now = 0, running = true, auto = true, nextAuto = 2.5, interval = 2;
      let events = [], msgs = [], changes = [{ t: 0, v: 2 }], logged = {}, lastDraw = -1, guessed = null;
      const log = ui.log(60);
      const svgHost = h('div', { style: { overflowX: 'auto', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: '14px' } });
      const tableHost = h('div.lab-table-wrap');
      const clock = ui.stat('seconds running', '0', 'accent'), evStat = ui.stat('server events', 0, 'warn');
      const runBtn = ui.btn('⏸ Pause', () => { running = !running; runBtn.textContent = running ? '⏸ Pause' : '▶ Resume'; }, 'primary');
      const rnd = Math.random;

      root.appendChild(ui.panel('Controls',
        ui.row(runBtn, ui.btn('⚡ Server event now', () => addEvent(), 'primary'), ui.btn('✉ Send from client', () => sendMsg()), ui.btn('Restart', () => restart(), 'ghost')),
        ui.row(ui.slider('Polling interval (short polling)', { min: 0.5, max: 8, step: 0.5, value: 2, fmt: v => v + ' s' }, v => setIntervalTo(v)),
          ui.toggle('Random events', true, v => { auto = v; }))));
      root.appendChild(ui.panel('Timeline', ui.stats(clock, evStat), svgHost, h('p.muted.small', 'Scroll sideways if the timeline is wider than your screen.')));
      root.appendChild(ui.panel('Scoreboard', tableHost));
      root.appendChild(ui.panel('Which technique wastes the most requests? (empty answers)', ui.seg(KINDS.map(k => [k, NAMES[k]]), null, v => guess(v))));
      root.appendChild(ui.panel('What just happened', log.el));

      // ---------- actions ----------
      function addEvent() {
        events.push(now); evStat.set(events.length);
        log.add('⚡ **Event #' + events.length + '** happens on the server at ' + now.toFixed(1) + ' s.', 'warn');
        draw(true);
      }
      function sendMsg() {
        msgs.push(now);
        log.add('✉ The client wants to send a message. **WebSocket:** goes straight down the open connection. **Everyone else:** needs a separate request.', 'info');
        draw(true);
        api.goal('twoway');
      }
      function setIntervalTo(v) {
        interval = v; changes.push({ t: now, v });
        log.add('Short polling now asks every **' + v + ' s**.' + (v >= 5 ? ' News can now wait up to ' + v + ' s before the next ask.' : ''), 'info');
        draw(true);
      }
      function restart() {
        now = 0; events = []; msgs = []; changes = [{ t: 0, v: interval }]; logged = {}; nextAuto = 2.5; evStat.set(0);
        log.add('Restarted the timeline.', 'dim'); draw(true);
      }
      function guess(k) {
        const sims = KINDS.map(x => simulate(x, events, msgs, now, changes));
        let best = 0; sims.forEach(x => { if (x.stats.wasted > best) best = x.stats.wasted; });
        if (best === 0 || now < 10) { log.add('Not enough has happened yet. Let it run for at least 10 seconds first.', 'warn'); return; }
        const ok = sims[KINDS.indexOf(k)].stats.wasted === best;
        if (ok) { log.add('Yes, **' + NAMES[k] + '** wasted the most (' + best + ' empty answers). It keeps asking whether or not there is news.', 'good'); api.goal('wasted'); }
        else log.add('Look at the *wasted* column: ' + NAMES[k] + ' only has ' + sims[KINDS.indexOf(k)].stats.wasted + '. Someone is clearly higher.', 'warn');
      }

      // ---------- drawing ----------
      const W0 = 84, PX = 22, SPAN = 30, LANE = 52, TOP = 34;
      function draw(force) {
        const sims = KINDS.map(k => simulate(k, events, msgs, now, changes));
        const t0 = Math.max(0, now - (SPAN - 2)), tx = t => W0 + (Math.max(t, t0) - t0) * PX;
        const width = W0 + SPAN * PX + 10, height = TOP + KINDS.length * LANE + 22;
        const svg = s('svg', { viewBox: '0 0 ' + width + ' ' + height, width: width, height: height, style: { display: 'block', minWidth: width + 'px' } });
        const txt = (x, y, t, o) => s('text', Object.assign({ x, y }, o || {}, { style: { fill: 'var(--muted)', fontSize: '11px', fontWeight: '700' } }), t);
        for (let t = Math.ceil(t0 / 5) * 5; t <= t0 + SPAN; t += 5) { svg.appendChild(s('line', { x1: tx(t), x2: tx(t), y1: TOP - 6, y2: height - 18, style: { stroke: 'var(--line)', strokeWidth: '1' } })); svg.appendChild(txt(tx(t) - 6, height - 5, t + 's')); }
        svg.appendChild(txt(4, 20, 'Server events'));
        events.forEach(e => { if (e >= t0) { svg.appendChild(s('line', { x1: tx(e), x2: tx(e), y1: 22, y2: height - 18, style: { stroke: 'var(--warn)', strokeWidth: '1', strokeDasharray: '3 4', opacity: '.5' } })); svg.appendChild(s('path', { d: 'M' + tx(e) + ' 13 l6 7 l-6 7 l-6 -7 z', style: { fill: 'var(--warn)' } })); } });
        KINDS.forEach((k, li) => {
          const y = TOP + li * LANE + LANE / 2, sim = sims[li];
          svg.appendChild(s('line', { x1: W0, x2: width - 6, y1: y, y2: y, style: { stroke: 'var(--line-2)', strokeWidth: '1' } }));
          NAMES[k].split(' ').forEach((word, wi, arr) => svg.appendChild(txt(4, y + 4 + (wi - (arr.length - 1) / 2) * 12, word)));
          sim.reqs.forEach(r => {
            if (r.t > now) return;
            const end = r.end === null ? now : Math.min(r.end, now);
            if (end < t0) return;
            const x1 = tx(r.t), x2 = Math.max(x1 + 3, tx(end));
            svg.appendChild(s('rect', { x: x1, y: y - 7, width: x2 - x1, height: 14, rx: 4, style: { fill: r.wasted ? 'var(--line-2)' : 'var(--accent)', opacity: r.end === null ? '.35' : '.7' } }));
          });
          sim.posts.forEach(p => { if (p.t <= now && p.t >= t0) svg.appendChild(s('rect', { x: tx(p.t), y: y + 10, width: Math.max(4, (Math.min(p.end, now) - p.t) * PX), height: 7, rx: 3, style: { fill: 'var(--info)' } })); });
          if (k === 'ws') msgs.forEach(c => { if (c >= t0) svg.appendChild(s('path', { d: 'M' + tx(c) + ' ' + (y + 18) + ' l5 -8 h-10 z', style: { fill: 'var(--info)' } })); });
          sim.dels.forEach(d => {
            if (d.e > now) return;
            if (d.d <= now) {
              if (d.d < t0) return;
              svg.appendChild(s('line', { x1: tx(d.e), x2: tx(d.d), y1: y - 14, y2: y - 14, style: { stroke: 'var(--warn)', strokeWidth: '2' } }));
              svg.appendChild(s('circle', { cx: tx(d.d), cy: y - 14, r: 5, style: { fill: 'var(--good)' } }));
            } else svg.appendChild(s('circle', { cx: tx(d.e), cy: y - 14, r: 4, style: { fill: 'none', stroke: 'var(--warn)', strokeWidth: '2' } }));
          });
        });
        KS.clear(svgHost); svgHost.appendChild(svg);
        const scroll = svgHost.scrollWidth - svgHost.clientWidth; if (scroll > 0 && running) svgHost.scrollLeft = scroll;
        clock.set(Math.floor(now)); lastDraw = now;
        renderTable(sims); logDeliveries(sims); checkGoals(sims);
      }
      function renderTable(sims) {
        KS.clear(tableHost);
        tableHost.appendChild(h('table.lab-table', h('tr', h('th', 'technique'), h('th', 'requests'), h('th', 'empty'), h('th', 'avg delay'), h('th', 'open')),
          sims.map((x, i) => h('tr', h('td', NAMES[KINDS[i]]), h('td', String(x.stats.requests)), h('td', String(x.stats.wasted)), h('td', x.stats.avg === null ? '–' : x.stats.avg.toFixed(1) + ' s'), h('td', String(x.stats.open))))));
      }
      function logDeliveries(sims) {
        sims.forEach((x, i) => x.dels.forEach(d => {
          const key = KINDS[i] + d.i;
          if (d.d > now || logged[key]) return;
          logged[key] = true;
          const delay = d.d - d.e;
          log.add('Event #' + (d.i + 1) + ' reached **' + NAMES[KINDS[i]] + '** after ' + delay.toFixed(1) + ' s' + (delay > 1 ? ' (it had to wait for the next ask)' : ''), delay > 1 ? 'warn' : 'dim');
        }));
      }
      function checkGoals(sims) {
        if (now >= 20 && events.length >= 5) api.goal('compare');
        const slow = sims[0].dels.filter(d => d.d <= now && d.interval >= 5);
        if (slow.length >= 2) { let sum = 0; slow.forEach(d => { sum += d.d - d.e; }); if (sum / slow.length >= 2) api.goal('delay'); }
      }

      // ---------- clock ----------
      api.loop(dt => {
        if (!running) return;
        now += dt;
        if (auto && now >= nextAuto) { addEventQuiet(); nextAuto = now + 2 + rnd() * 4; }
        if (now - lastDraw >= 0.2) draw(false);
      });
      function addEventQuiet() { addEvent(); }
      draw(true);
      log.add('The timeline is running. Wait for some events, or press **Server event now**.', 'dim');
    }
  });
})();
