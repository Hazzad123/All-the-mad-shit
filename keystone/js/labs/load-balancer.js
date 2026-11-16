/* Lab: load-balancer — spread traffic across servers, kill one, watch health checks react.
   This file is also the reference example for docs/LAB_GUIDE.md. */
KS.labs.register({
  id: 'load-balancer',
  title: 'Load Balancer',
  emoji: '⚖️',
  blurb: 'One front door, several servers behind it. Choose how traffic is shared out, then start breaking things.',
  tags: ['scaling', 'load balancing', 'health checks', 'availability'],
  goals: [
    { id: 'spread', text: 'Send **20 requests** with *Round robin* and watch them spread evenly' },
    { id: 'fail', text: 'Turn health checks **off**, kill a server (click it) and watch requests fail' },
    { id: 'heal', text: 'Turn health checks **on** and get 10 successes in a row while a server is still down' },
    { id: 'least', text: 'Make server C slow, switch to *Least connections*, and see C receive the smallest share' }
  ],
  help: `**Clients** send requests to one address: the **load balancer**. It forwards each request to one of the servers behind it and passes the answer back.

- **Round robin** takes turns: A, B, C, A, B, C…
- **Least connections** picks whichever server is handling the fewest requests right now, so slow servers naturally get less.
- **Random** rolls a die.
- **IP hash** sends the same client to the same server every time ("sticky").

**Health checks** are the balancer pinging each server every second. With them off it has no idea a server died, and keeps sending it traffic.`,

  mount(root, api) {
    const ui = api.ui, h = api.h;
    // ---------- state ----------
    const servers = ['A', 'B', 'C'].map(name => ({ name, up: true, seenUp: true, active: 0, served: 0, slow: false, node: null, wire: null, meter: null }));
    const recent = [];                 // last 30 requests: server name or 'ERR'
    let algo = 'rr', rr = 0, rate = 3, running = false, health = true, total = 0, errors = 0, okStreak = 0, acc = 0;

    // ---------- UI ----------
    const clients = ui.node('Clients', '👥');
    const lb = ui.node('Load balancer', '⚖️', { tone: 'accent' });
    const stage = ui.stage();
    servers.forEach(s => { s.node = ui.node('Server ' + s.name, '🖥️', { onClick: () => toggleServer(s) }); s.node.setState('ok'); });
    stage.el.appendChild(ui.cols([clients], [lb], servers.map(s => s.node)));
    stage.wire(clients, lb);
    servers.forEach(s => { s.wire = stage.wire(lb, s.node, { tone: 'good' }); });

    const statTotal = ui.stat('requests', 0), statErr = ui.stat('failed', 0, 'good'), statOk = ui.stat('success streak', 0);
    servers.forEach(s => { s.meter = ui.meter('Server ' + s.name); });
    const log = ui.log(40);
    const runBtn = ui.btn('▶ Start traffic', () => { running = !running; runBtn.textContent = running ? '⏸ Pause traffic' : '▶ Start traffic'; }, 'primary');
    const slowToggle = ui.toggle('Server C is slow (3×)', false, v => { servers[2].slow = v; log.add(v ? 'Server C is now **slow**.' : 'Server C is back to normal speed.', 'warn'); });

    root.appendChild(ui.panel('Controls',
      ui.row(ui.select('Algorithm', [['rr', 'Round robin'], ['least', 'Least connections'], ['random', 'Random'], ['hash', 'IP hash (sticky)']], algo, v => { algo = v; log.add('Algorithm: **' + v + '**', 'info'); }),
        ui.slider('Traffic', { min: 1, max: 12, value: rate, fmt: v => v + ' req/s' }, v => { rate = v; })),
      ui.row(runBtn, ui.btn('Send one', () => send()), ui.toggle('Health checks', health, v => { health = v; log.add('Health checks ' + (v ? '**on**' : '**off**'), 'info'); if (!v) servers.forEach(s => setSeen(s, true)); }), slowToggle),
      h('p.muted.small', 'Click a server to kill it or bring it back.')));
    root.appendChild(stage.el);
    root.appendChild(h('div.lab-grid2', ui.panel('Share of the last 30 requests', servers.map(s => s.meter.el), ui.stats(statTotal, statErr, statOk)), ui.panel('What just happened', log.el)));

    // ---------- simulation ----------
    function setSeen(s, up) { s.seenUp = up; s.wire.set(up ? 'good' : 'bad', !up); }
    function toggleServer(s) {
      s.up = !s.up; s.node.setState(s.up ? 'ok' : 'down');
      log.add('Server ' + s.name + (s.up ? ' is **back up**.' : ' has **crashed** 💥'), s.up ? 'good' : 'bad');
      if (!health) setSeen(s, true);
    }
    function pick(client) {
      const pool = servers.filter(s => s.seenUp);          // only servers the balancer *believes* are alive
      if (!pool.length) return null;
      if (algo === 'rr') return pool[rr++ % pool.length];
      if (algo === 'random') return pool[Math.floor(Math.random() * pool.length)];
      if (algo === 'hash') return pool[client.charCodeAt(0) % pool.length];
      return pool.slice().sort((a, b) => a.active - b.active || a.served - b.served)[0];   // least connections
    }
    function record(what) {
      recent.push(what); if (recent.length > 30) recent.shift();
      draw();
    }
    function draw() {
      servers.forEach(s => { const n = recent.filter(r => r === s.name).length; s.meter.set(recent.length ? n / recent.length : 0, n + ' of ' + recent.length); s.node.setSub(s.active + ' active · ' + s.served + ' served'); });
      statTotal.set(total); statErr.set(errors, errors ? 'bad' : 'good'); statOk.set(okStreak);
      checkGoals();
    }
    async function send() {
      const client = 'ABCDEF'[Math.floor(Math.random() * 6)]; total++;
      await stage.send(clients, lb, { label: client, ms: 320 });
      if (!api.alive()) return;                             // the lab was closed while the packet was flying
      const s = pick(client);
      if (!s) { errors++; okStreak = 0; log.add('Client ' + client + ' → **503** no healthy servers', 'bad'); lb.pulse('bad'); record('ERR'); return; }
      s.active++; s.node.setSub(s.active + ' active · ' + s.served + ' served');
      await stage.send(lb, s.node, { label: client, ms: 320 });
      if (!api.alive()) return;
      if (!s.up) {                                          // the balancer did not know it was dead
        s.active--; errors++; okStreak = 0; s.node.pulse('bad'); log.add('Client ' + client + ' → Server ' + s.name + ' → **no answer** ✗', 'bad');
        stage.send(s.node, lb, { tone: 'bad', ms: 260 }); record('ERR'); return;
      }
      await api.sleep(s.slow ? 1800 : 600);                 // the server "works"
      if (!api.alive()) return;
      s.active--; s.served++; okStreak++; s.node.pulse('good');
      log.add('Client ' + client + ' → Server ' + s.name + ' → 200 OK', 'dim');
      stage.send(s.node, lb, { tone: 'good', ms: 260 }).then(() => stage.send(lb, clients, { tone: 'good', ms: 260 }));
      record(s.name);
    }
    function checkGoals() {
      const counts = servers.map(s => recent.filter(r => r === s.name).length);
      if (algo === 'rr' && total >= 20 && servers.every(s => s.up) && Math.max.apply(null, counts) - Math.min.apply(null, counts) <= 2) api.goal('spread');
      if (!health && errors > 0 && servers.some(s => !s.up)) api.goal('fail');
      if (health && okStreak >= 10 && servers.some(s => !s.up)) api.goal('heal');
      if (algo === 'least' && servers[2].slow && recent.length >= 24 && servers.every(s => s.up) && counts[2] < counts[0] && counts[2] < counts[1]) api.goal('least');
    }

    api.loop(dt => { if (!running) return; acc += dt * rate; while (acc >= 1) { acc -= 1; send(); } });
    api.every(1000, () => {                                 // the health check "ping"
      if (!health) return;
      servers.forEach(s => { if (s.seenUp !== s.up) { setSeen(s, s.up); log.add('Health check: Server ' + s.name + (s.up ? ' is healthy again, **back in rotation**' : ' failed, **taken out of rotation**'), s.up ? 'good' : 'warn'); } });
    });
    draw();   // initial state: no requests yet
    return () => stage.destroy();
  }
});
