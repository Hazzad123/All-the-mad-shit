/* Lab: startup-survival — scale a startup from 100 to 10 million users; each upgrade fixes one specific bottleneck. */
KS.labs.register({
  id: 'startup-survival',
  title: 'Startup Survival',
  emoji: '📈',
  blurb: 'Your app is going viral. Each month more users arrive and something new breaks. Buy the right upgrade, not just any upgrade.',
  tags: ['scaling', 'bottlenecks', 'caching', 'load balancing', 'database', 'game'],
  goals: [
    { id: 'scale1k', text: 'Reach **1,000 users**' },
    { id: 'lb', text: 'Add a **load balancer** (after making sessions shareable)' },
    { id: 'cache', text: 'Relieve the **database reads** with a cache or read replicas' },
    { id: 'million', text: 'Reach **1,000,000 users**' },
    { id: 'win', text: 'Reach **10,000,000 users** with errors under 2%' }
  ],
  help: `You run a web app. Each **month** the number of users grows, but only while the site works well; errors make users leave. Users bring in money, and money buys upgrades.

The five bars show how close each part of your system is to its limit. **Over 100% means it is melting**: that part is the **bottleneck**, and requests fail. Fixing anything else does nothing for now.

- **App server CPU**: bigger server, or a load balancer and more servers (logins must be shareable first)
- **Database reads**: cache, read replicas, CDN
- **Database writes**: queue, bigger database, sharding
- **Single point of failure**: more than one of everything
- **Global latency**: CDN, then several regions

Press **Play**, pause whenever you want to shop, and read what the log says about each purchase.`,

  mount(root, api) {
    const ui = api.ui, h = api.h;

    // ---- model (pure, no DOM) ----
    const SHARD = [1, 6, 36, 216];
    const COMP = { app: 'app server CPU', reads: 'database reads', writes: 'database writes', spof: 'single point of failure', lat: 'global latency' };
    function newGame() { return { month: 0, users: 100, cash: 1000, spent: 0, over: false, won: false, own: { vert: 0, sessions: false, lb: false, scale: 0, replicas: 0, cache: false, cdn: false, queue: false, dbv: 0, shard: 0, region: false } }; }
    function caps(S) {
      const o = S.own, servers = o.lb ? 4 * Math.pow(2, o.scale) : 1;
      return { servers: servers, app: servers * 2000 * Math.pow(2.5, o.vert), reads: 5000 * Math.pow(2, o.replicas), writes: 12000 * Math.pow(4, o.dbv) * SHARD[o.shard] };
    }
    function analyze(S) {
      const o = S.own, c = caps(S), u = S.users;
      const util = { app: u * (o.cdn ? 0.5 : 1) * (o.queue ? 0.75 : 1) / c.app, reads: u * (o.cdn ? 0.5 : 1) * (o.cache ? 0.02 : 1) / c.reads, writes: u * (o.queue ? 0.5 : 1) / c.writes };
      const lat0 = o.region ? (o.cdn ? 80 : 100) : (o.cdn ? 200 : 400);
      util.lat = lat0 / (u < 200000 ? 600 : u < 2000000 ? 350 : 150);
      const floor = o.region ? 0.001 : o.replicas >= 1 ? (o.lb ? 0.005 : 0.02) : (o.lb ? 0.015 : 0.04);
      const floorEff = floor * Math.max(0.05, Math.min(1, u / 50000));
      util.spof = floorEff / 0.02;
      let served = 1; ['app', 'reads', 'writes'].forEach(k => { if (util[k] > 1) served *= 1 / util[k]; });
      const eLat = util.lat > 1 ? Math.min(0.3, (1 - 1 / util.lat) * 0.5) : 0;
      const errors = Math.min(0.95, 1 - served * (1 - eLat) + floorEff);
      const worst = Math.max(util.app, util.reads, util.writes, util.lat);
      const latency = Math.min(9999, Math.round(lat0 * (1 + Math.max(0, worst - 0.7) * 2)));
      let b = null, m = 0.8; Object.keys(util).forEach(k => { if (util[k] >= m) { m = util[k]; b = k; } });
      const growth = Math.max(0.6, Math.min(1.35, 1.35 - 4 * errors - (util.lat > 1 ? 0.08 : 0)));
      return { util: util, errors: errors, latency: latency, bottleneck: b, growth: growth, revenue: u * 0.4 * (1 - errors), upkeep: 20 + S.spent * 0.03 };
    }
    // One month: earn, pay upkeep, then users grow (or leave).
    function step(S) {
      const A = analyze(S);
      S.cash = Math.max(0, S.cash + A.revenue - A.upkeep);
      S.users = Math.min(5e7, S.users * A.growth); S.month++;
      if (S.users < 20) S.over = true;
      return A;
    }
    function lvl(arr, n) { return arr[Math.min(n, arr.length - 1)]; }
    // id, name, one-line description, components it fixes, price, reason it cannot be bought yet (or null), is it fully bought, buy
    const UP = [
      { id: 'vert', name: 'Bigger server', desc: 'Buy a beefier machine (×2.5 per server). Easy, but there is a ceiling.', fixes: ['app'], max: 3, cost: S => lvl([300, 1200, 6000], S.own.vert), buy: S => { S.own.vert++; },
        good: 'A bigger machine handles 2.5× the users. Simple, but you can only go so big (vertical scaling has a ceiling).' },
      { id: 'sessions', name: 'Shared session store', desc: 'Keep logins in a shared store (Redis) instead of one server\'s memory. Needed before adding servers.', fixes: [], max: 1, cost: () => 500, buy: S => { S.own.sessions = true; },
        good: 'Logins now live outside the servers, so any server can serve any user (the app is **stateless**). It fixes nothing alone, but it unlocks the load balancer.' },
      { id: 'lb', name: 'Load balancer + 4 servers', desc: 'A front door that spreads traffic over four app servers. No more single server to crash.', fixes: ['app', 'spof'], max: 1, cost: () => 1500,
        can: S => S.own.sessions ? null : 'Not yet: with several servers, someone logged in on server A would be logged out when the balancer sends them to B. Make sessions shareable first.', buy: S => { S.own.lb = true; },
        good: 'The load balancer spreads requests over four servers (4× capacity) and one server dying no longer takes the site down.' },
      { id: 'scale', name: 'Double the app servers', desc: 'Twice as many copies of the app. The price doubles each time.', fixes: ['app'], max: 6, cost: S => 2500 * Math.pow(2, S.own.scale),
        can: S => S.own.lb ? null : 'Not yet: extra servers need a load balancer in front to share the traffic.', buy: S => { S.own.scale++; },
        good: 'Twice as many servers behind the balancer means twice the capacity: **horizontal scaling**.' },
      { id: 'cache', name: 'Cache (Redis)', desc: 'Remember popular answers in memory, so the database is asked about 50× less for reads.', fixes: ['reads'], max: 1, cost: () => 3000, buy: S => { S.own.cache = true; },
        good: 'Popular data now comes from fast memory, so the database only sees about 2% of reads. Cheap and effective.' },
      { id: 'replicas', name: 'Read replicas (×2)', desc: 'More copies of the database that answer read queries. Writes still go to one place.', fixes: ['reads'], max: 5, cost: S => 2000 * Math.pow(2, S.own.replicas), buy: S => { S.own.replicas++; },
        good: 'Copies of the database now share the reads (×2 capacity) and give you a spare if the main one dies. Writes still go to one place.' },
      { id: 'cdn', name: 'CDN', desc: 'Serve images and scripts from servers near each user: half the load on you and faster pages.', fixes: ['lat', 'reads', 'app'], max: 1, cost: () => 4000, buy: S => { S.own.cdn = true; },
        good: 'Static files now come from servers near the user, so your own servers get roughly half the traffic and pages load much faster.' },
      { id: 'queue', name: 'Message queue', desc: 'Do slow work (emails, resizing) in the background so web requests and database writes shrink.', fixes: ['writes', 'app'], max: 1, cost: () => 6000, buy: S => { S.own.queue = true; },
        good: 'Slow jobs are queued and handled later at a steady pace, so spikes no longer hammer the database or tie up web servers.' },
      { id: 'dbv', name: 'Bigger database', desc: 'More power for the one database that takes all the writes (×4).', fixes: ['writes'], max: 2, cost: S => lvl([4000, 25000], S.own.dbv), buy: S => { S.own.dbv++; },
        good: 'The write database is 4× stronger. Another quick fix that eventually hits a ceiling.' },
      { id: 'shard', name: 'Shard the database', desc: 'Split the data over several databases (by user) so writes are shared out. A big job and a big boost.', fixes: ['writes'], max: 3, cost: S => lvl([30000, 150000, 800000], S.own.shard), buy: S => { S.own.shard++; },
        good: 'Users are split across several databases, so writes are shared out (×6 each time). It is the real answer to write limits.' },
      { id: 'region', name: 'Multi-region', desc: 'Run the whole system in several parts of the world: fast for everyone and survives a whole data centre failing.', fixes: ['lat', 'spof'], max: 1, cost: () => 600000,
        can: S => (S.own.lb && S.own.replicas >= 1 && S.own.cdn) ? null : 'Not yet: to run in several regions you first need a load balancer, a read replica (data you can copy) and a CDN.', buy: S => { S.own.region = true; },
        good: 'Users are served from a data centre near them (low latency), and a whole region can fail without the site going down.' }
    ];
    function level(S, u) { const o = S.own; return { vert: o.vert, sessions: o.sessions ? 1 : 0, lb: o.lb ? 1 : 0, scale: o.scale, cache: o.cache ? 1 : 0, replicas: o.replicas, cdn: o.cdn ? 1 : 0, queue: o.queue ? 1 : 0, dbv: o.dbv, shard: o.shard, region: o.region ? 1 : 0 }[u.id]; }
    // Try to buy. Returns {ok, msg, tone}. Judges whether it fixed the real problem.
    function purchase(S, id) {
      const u = UP.filter(x => x.id === id)[0];
      if (!u || S.over || S.won) return { ok: false, msg: 'The game is over. Start a new game.', tone: 'warn' };
      if (level(S, u) >= u.max) return { ok: false, msg: u.name + ' is already fully bought.', tone: 'warn' };
      const why = u.can ? u.can(S) : null;
      if (why) return { ok: false, msg: why, tone: 'warn' };
      const price = u.cost(S);
      if (S.cash < price) return { ok: false, msg: 'Not enough cash for ' + u.name + ': it costs $' + Math.round(price).toLocaleString('en-GB') + ' and you have $' + Math.round(S.cash).toLocaleString('en-GB') + '. Wait for revenue.', tone: 'warn' };
      const before = analyze(S);
      S.cash -= price; S.spent += price; u.buy(S);
      const after = analyze(S);
      const helped = u.fixes.filter(k => before.util[k] >= 0.8 && after.util[k] < before.util[k] - 0.02);
      if (helped.length) return { ok: true, helped: helped, msg: '✅ Right call. ' + u.good, tone: 'good' };
      if (!u.fixes.length) return { ok: true, helped: [], msg: 'ℹ️ ' + u.good, tone: 'info' };
      const b = before.bottleneck;
      if (b) return { ok: true, helped: [], wasted: true, msg: '⚠️ Wasted money for now: that raises ' + u.fixes.map(k => COMP[k]).join(' / ') + ', but your bottleneck is **' + COMP[b] + '** (' + Math.round(before.util[b] * 100) + '%). Fix that first.', tone: 'bad' };
      return { ok: true, helped: [], msg: 'ℹ️ Investing ahead: nothing is melting yet, but this will matter as users grow.', tone: 'info' };
    }
    // ---- end model ----

    let S = newGame();
    let running = false, speed = 1, acc = 0, lastBottleneck = null, noted = {};
    const bought = {};          // upgrade ids purchased in this game

    // ---- UI ----
    const log = ui.log(60);
    const sUsers = ui.stat('users', '100', 'accent'), sCash = ui.stat('cash', '$1,000'), sMonth = ui.stat('month', 0), sErr = ui.stat('errors', '0%', 'good'), sLat = ui.stat('page load', '400 ms');
    const runBtn = ui.btn('▶ Play', () => { if (S.over || S.won) return; running = !running; syncRun(); }, 'primary');
    const speedSeg = ui.seg([['0.5', 'Slow'], ['1', 'Normal'], ['3', 'Fast']], '1', v => { speed = +v; });
    const meters = {}; Object.keys(COMP).forEach(k => { meters[k] = ui.meter(COMP[k].charAt(0).toUpperCase() + COMP[k].slice(1)); });
    const verdict = h('div.lab-note', 'Press Play to start the first month.');
    const shop = h('div.lab-stack');
    const rows = UP.map(u => {
      const info = h('div.muted', { style: { fontSize: '.82rem' } }, u.desc), title = h('div', { style: { fontWeight: '800' } }, u.name);
      const btn = ui.btn('', () => buy(u.id)); btn.style.minHeight = '44px'; btn.style.minWidth = '110px';
      const row = h('div.lab-row', { style: { border: '1px solid var(--line)', borderRadius: '12px', padding: '8px 10px', background: 'var(--panel-2)', flexWrap: 'wrap' } }, h('div', { style: { flex: '1 1 180px', minWidth: '0' } }, title, info), btn);
      shop.appendChild(row);
      return { u: u, title: title, btn: btn, row: row };
    });

    root.appendChild(ui.panel('Your startup', ui.stats(sUsers, sCash, sMonth, sErr, sLat), h('div', { style: { marginTop: '10px' } }, ui.row(runBtn, ui.btn('⏭ Next month', () => tick(), 'sm'), speedSeg, ui.btn('↺ New game', newRun, 'ghost')))));
    root.appendChild(ui.panel('System health (over 100% = melting)', Object.keys(COMP).map(k => meters[k].el), h('div', { style: { marginTop: '10px' } }, verdict)));
    root.appendChild(ui.panel('Upgrade shop', shop));
    root.appendChild(ui.panel('What just happened', log.el));

    // ---- behaviour ----
    function money(n) { return n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? '$' + Math.round(n / 1e3) + 'k' : '$' + Math.round(n).toLocaleString('en-GB'); }
    function people(n) { return n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'k' : Math.round(n).toLocaleString('en-GB'); }
    function syncRun() { runBtn.textContent = running ? '⏸ Pause' : '▶ Play'; }
    function render() {
      const A = analyze(S);
      sUsers.set(people(S.users)); sCash.set(money(S.cash)); sMonth.set(S.month);
      sErr.set((A.errors * 100).toFixed(1) + '%', A.errors > 0.05 ? 'bad' : A.errors > 0.02 ? 'warn' : 'good'); sLat.set(A.latency + ' ms', A.latency > 600 ? 'bad' : '');
      Object.keys(COMP).forEach(k => {
        const u = A.util[k], hot = A.bottleneck === k;
        meters[k].set(Math.min(1, u), Math.round(u * 100) + '%' + (hot && u > 1 ? ' 🔥' : ''), u > 1 ? 'bad' : u >= 0.8 ? 'warn' : 'good');
      });
      if (S.won) verdict.textContent = '🏆 You scaled to 10 million users with errors under 2%. Hockey Stick unlocked!';
      else if (S.over) verdict.textContent = '💀 Your users all left. Start a new game and fix the bottleneck sooner.';
      else if (A.bottleneck && A.util[A.bottleneck] > 1) verdict.textContent = '🔥 Bottleneck: ' + COMP[A.bottleneck] + ' at ' + Math.round(A.util[A.bottleneck] * 100) + '%. About ' + (A.errors * 100).toFixed(0) + '% of requests fail and users are leaving. Fix this one.';
      else if (A.bottleneck) verdict.textContent = '🟡 ' + COMP[A.bottleneck].charAt(0).toUpperCase() + COMP[A.bottleneck].slice(1) + ' is at ' + Math.round(A.util[A.bottleneck] * 100) + '%. It will be the next problem as users grow.';
      else verdict.textContent = '🟢 Everything is comfortable. Growing at about ' + Math.round((A.growth - 1) * 100) + '% a month.';
      rows.forEach(r => {
        const u = r.u, lv = level(S, u), done = lv >= u.max;
        r.title.textContent = u.name + (u.max > 1 ? '  (' + lv + '/' + u.max + ')' : '');
        r.btn.textContent = done ? '✓ Done' : money(u.cost(S));
        r.btn.disabled = done || S.over || S.won;
        r.row.style.opacity = done ? '.55' : '1';
      });
    }
    function buy(id) {
      const r = purchase(S, id);
      log.add(r.msg, r.tone);
      if (r.ok) {
        bought[id] = true;
        if (id === 'lb') api.goal('lb');
        if (id === 'cache' || id === 'replicas') log.add('Reads before and after: the database-reads bar shows the effect right away.', 'dim');
      }
      checkGoals(); render();
    }
    function checkGoals() {
      const o = S.own, A = analyze(S);
      if (S.users >= 1000) api.goal('scale1k');
      if (S.users >= 1e6) api.goal('million');
      // reads relieved: without cache and replicas the database would be overloaded, but it is not
      const noHelp = S.users * (o.cdn ? 0.5 : 1) / 5000;
      if ((o.cache || o.replicas > 0) && noHelp > 1 && A.util.reads <= 1) api.goal('cache');
      if (S.users >= 1e7 && A.errors < 0.02 && !S.won) {
        S.won = true; running = false; syncRun(); api.goal('win');
        try { if (KS.store && KS.store.flag) KS.store.flag('tycoon-won', true); } catch (e) { /* ignore */ }
        log.add('🏆 **10 million users and errors under 2%!** Every bottleneck found and fixed in turn: that is scaling.', 'good');
      }
    }
    function tick() {
      if (S.over || S.won) return;
      const A = step(S), B = analyze(S);
      if (A.bottleneck !== lastBottleneck) {
        if (A.bottleneck && A.util[A.bottleneck] > 1) log.add('Month ' + S.month + ': 🔥 **' + COMP[A.bottleneck] + '** is overloaded (' + Math.round(A.util[A.bottleneck] * 100) + '%). Requests are failing, so users leave. Which upgrade raises *that*?', 'bad');
        else if (A.bottleneck) log.add('Month ' + S.month + ': ' + COMP[A.bottleneck] + ' is getting close to its limit (' + Math.round(A.util[A.bottleneck] * 100) + '%).', 'warn');
        lastBottleneck = A.bottleneck;
      }
      [[1000, '1,000'], [1e5, '100,000'], [1e6, '1 million'], [5e6, '5 million']].forEach(m => { if (S.users >= m[0] && !noted[m[0]]) { noted[m[0]] = true; log.add('Month ' + S.month + ': 🎉 you passed **' + m[1] + ' users**.', 'good'); } });
      if (S.over) { running = false; syncRun(); log.add('💀 Almost every user has left. Game over. Press **New game**.', 'bad'); }
      checkGoals(); render();
    }
    function newRun() {
      S = newGame(); running = false; acc = 0; lastBottleneck = null; noted = {}; syncRun();
      log.add('New game: 100 users, $1,000 and one small server. Press **Play**.', 'info'); render();
    }
    api.loop(dt => {
      if (!running) return;
      acc += dt * speed * 0.8; let n = 0;
      while (acc >= 1 && n < 3 && running) { acc -= 1; n++; tick(); }
    });
    log.add('You have **100 users**, **$1,000** and one small server. Press **Play**; pause whenever you want to shop.', 'info');
    render();
  }
});
