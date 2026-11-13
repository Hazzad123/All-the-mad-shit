/* Lab: deploy-strategies — how you roll out decides how many users a bad release hurts and how fast you can undo it. */
(function () {
  'use strict';

  /* ---------- pure model ---------- */
  /* model:start */
  var FLEET = 8, RPS = 20, BATCH_MS = 3000, GREEN_MS = 4000, STEP_MS = 4000, CANARY = [0.05, 0.25, 0.5, 1], FAIL_RATE = 0.5;
  function makeRouter() { return { cred: 0, fcred: 0 }; }
  // exact weighted routing without randomness: true when this request goes to the new version
  function routeNext(r, share) { r.cred += share; if (r.cred >= 1 - 1e-9) { r.cred -= 1; return true; } return false; }
  // a faulty version fails this fraction of the requests it receives
  function failNext(r, rate) { r.fcred += rate; if (r.fcred >= 1 - 1e-9) { r.fcred -= 1; return true; } return false; }
  function chunk(a, n) { var out = []; for (var i = 0; i < a.length; i += n) out.push(a.slice(i, i + n)); return out; }
  function canaryUnhealthy(v2, fail) { return v2 >= 2 && fail / v2 >= 0.2; }
  /* model:end */

  KS.labs.register({
    id: 'deploy-strategies',
    title: 'Deploy Strategies',
    emoji: '🚀',
    blurb: 'Ship a new version to eight servers three different ways, with a good release and a faulty one, and see who gets hurt.',
    tags: ['deployment', 'rolling', 'blue-green', 'canary', 'rollback'],
    goals: [
      { id: 'rolling', text: 'Finish a **rolling** deploy of a good version' },
      { id: 'bluegreen', text: 'Switch to **green**, then **roll back** instantly' },
      { id: 'canary', text: 'Ship a **faulty** release by **canary** and catch it at the first 5% step' },
      { id: 'cost', text: 'Complete all three strategies and compare the **extra servers** each needed' }
    ],
    help: `Eight servers run **v1**. You want **v2** out. A faulty v2 fails half of the requests it receives, and about 20 users arrive every second.

- **Rolling**: replace two servers at a time. No extra servers needed, but capacity dips while each pair restarts, and undoing it means rolling *back* the same slow way.
- **Blue/green**: build a complete second fleet (green), test it, then flip *all* traffic over at once. Rolling back is a single flip, but you pay for eight extra servers, and a bad release hits everyone the moment you flip.
- **Canary**: send 5% of users to v2, check health, then 25%, 50%, 100%. A bad release is caught while few users see it. Automatic rollback does this check for you.

The cells are servers (green = v1, purple = v2, red = v2 that is faulty). The table keeps score of each strategy you have completed.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      let strat = 'rolling', badChoice = false, autoRb = true, acc = 0;
      let sim = null, router = makeRouter();
      const ring = [];
      const table = { rolling: null, bluegreen: null, canary: null };
      const NAMES = { rolling: 'Rolling', bluegreen: 'Blue/green', canary: 'Canary' };

      function newM() { return { reqs: 0, v2: 0, fails: 0, maxShare: 0, maxExtra: 0, minUp: FLEET, rollbackMs: null, rbStart: 0 }; }
      function fresh() {
        const fleet = []; for (let i = 0; i < FLEET; i++) fleet.push({ ver: 'v1', to: 'v1', state: 'up' });
        return { t: 0, status: 'idle', fleet: fleet, green: null, greenReady: 0, share: 0, roll: null, canary: null, bad: false, switched: false, m: newM() };
      }
      sim = fresh();

      // ---------- UI ----------
      const log = ui.log(60);
      const stratSeg = ui.seg([['rolling', '🔁 Rolling'], ['bluegreen', '🔵🟢 Blue/green'], ['canary', '🐤 Canary']], strat, v => { strat = v; reset('Strategy: **' + NAMES[v] + '**. Fleet reset to eight v1 servers.'); });
      const verSeg = ui.seg([['good', '✅ Good v2'], ['bad', '🐛 Faulty v2']], 'good', v => { badChoice = v === 'bad'; if (sim.status !== 'idle') log.add('That applies to the **next** deploy. Reset the fleet to start over.', 'info'); });
      const autoToggle = ui.toggle('Automatic rollback (canary)', true, v => { autoRb = v; });
      const deployBtn = ui.btn('🚀 Deploy v2', deploy, 'primary');
      const switchBtn = ui.btn('🔀 Switch traffic to green', doSwitch, 'primary');
      const contBtn = ui.btn('⏭ Continue anyway', () => { if (sim.status === 'paused') nextStep(); });
      const rbBtn = ui.btn('↩ Roll back', rollback, 'danger');
      const resetBtn = ui.btn('↺ Reset fleet', () => reset('Fleet reset to eight v1 servers.'));
      const statusP = h('p.small', { style: { margin: '10px 0 0', fontWeight: '700' } });
      const blueRow = h('div.lab-cells'), greenRow = h('div.lab-cells'), greenWrap = h('div', { style: { marginTop: '10px' } }, h('b.small', 'Green fleet (the second copy)'), greenRow);
      const blueTitle = h('b.small', 'Servers');
      const shareM = ui.meter('Traffic going to v2'), errM = ui.meter('Errors in the last 60 requests');
      const sUsers = ui.stat('users who got errors', 0, 'good'), sExtra = ui.stat('extra servers now', 0), sLow = ui.stat('lowest capacity', FLEET + '/' + FLEET), sRb = ui.stat('last rollback took', '–');
      const tbody = h('tbody');

      root.appendChild(ui.panel('Plan the release', ui.row(stratSeg), ui.row(verSeg, autoToggle), ui.row(deployBtn, switchBtn, contBtn, rbBtn, resetBtn), statusP));
      root.appendChild(h('div.lab-grid2',
        ui.panel('The fleet', blueTitle, blueRow, greenWrap, h('div', { style: { height: '12px' } }), shareM.el, errM.el),
        ui.panel('Damage report', ui.stats(sUsers, sExtra, sLow, sRb))));
      root.appendChild(ui.panel('Scoreboard', h('div.lab-table-wrap', h('table.lab-table', h('thead', h('tr', h('th', 'Strategy'), h('th', 'Extra servers'), h('th', 'Lowest capacity'), h('th', 'Users hit'), h('th', 'Rollback'))), tbody))));
      root.appendChild(ui.panel('What just happened', log.el));
      log.add('Pick a strategy and a version, then press **Deploy v2**.', 'info');

      // ---------- simulation ----------
      function reset(msg) {
        sim = fresh(); router = makeRouter(); ring.length = 0; acc = 0;
        if (msg) log.add(msg, 'info');
        render();
      }
      function v2share() {
        if (strat === 'rolling') {
          const up = sim.fleet.filter(i => i.state === 'up');
          return up.length ? up.filter(i => i.ver === 'v2').length / up.length : 0;
        }
        return sim.share;
      }
      function deploy() {
        if (sim.status !== 'idle') return;
        sim.bad = badChoice; sim.m = newM(); sim.status = 'running'; sim.switched = false;
        log.add('Deploying a ' + (sim.bad ? '**faulty** ' : 'good ') + 'v2 with **' + NAMES[strat] + '**…', 'info');
        if (strat === 'rolling') { sim.roll = { target: 'v2', queue: chunk(sim.fleet.map((x, i) => i), 2), cur: null, until: 0 }; }
        else if (strat === 'bluegreen') {
          sim.green = []; for (let i = 0; i < FLEET; i++) sim.green.push({ ver: 'v2', to: 'v2', state: 'starting' });
          sim.greenReady = sim.t + GREEN_MS;
          log.add('Building a **second full fleet** (green) next to the live one. It takes no traffic yet.', 'info');
        } else { sim.canary = { step: -1, start: 0, v2: 0, fail: 0 }; enterStep(0); }
        render();
      }
      function startBatch() {
        const r = sim.roll, ids = r.queue.shift();
        r.cur = ids.map(i => sim.fleet[i]);
        r.cur.forEach(i => { i.state = 'updating'; i.to = r.target; });
        r.until = sim.t + BATCH_MS;
        log.add((r.target === 'v2' ? 'Rolling: upgrading' : 'Rolling back: reverting') + ' servers ' + ids.map(i => i + 1).join(' and ') + ' to **' + r.target + '** (they are out of service for ' + BATCH_MS / 1000 + ' s).', r.target === 'v2' ? 'info' : 'warn');
      }
      function finishRoll() {
        const r = sim.roll; sim.roll = null;
        if (r.target === 'v2') { sim.status = 'done'; log.add('Rolling deploy **finished**: all servers run v2.', 'good'); }
        else { sim.status = 'rolledback'; sim.m.rollbackMs = sim.t - sim.m.rbStart; log.add('Rollback **finished** after ' + (sim.m.rollbackMs / 1000).toFixed(1) + ' s: all servers run v1 again.', 'good'); }
        record();
      }
      function enterStep(i) {
        const c = sim.canary, pct = CANARY[i] * 100;
        c.step = i; c.start = sim.t; c.v2 = 0; c.fail = 0; sim.share = CANARY[i];
        sim.m.maxShare = Math.max(sim.m.maxShare, CANARY[i]);
        const k = [1, 2, 4, 8][i], v1 = i < 3 ? FLEET - (k - 1) : 0, fleet = [];
        for (let j = 0; j < v1; j++) fleet.push({ ver: 'v1', to: 'v1', state: 'up' });
        for (let j = 0; j < k; j++) fleet.push({ ver: 'v2', to: 'v2', state: 'up' });
        sim.fleet = fleet; sim.status = 'running';
        log.add('Canary: **' + pct + '%** of users now go to v2 (' + k + ' server' + (k > 1 ? 's' : '') + '). Watching for ' + STEP_MS / 1000 + ' s…', 'info');
      }
      function nextStep() { const c = sim.canary; if (c.step < 3) enterStep(c.step + 1); else finishCanary(); render(); }
      function finishCanary() { sim.status = 'done'; log.add('Canary **complete**: 100% on v2.', 'good'); record(); }
      function checkCanary() {
        const c = sim.canary, bad = canaryUnhealthy(c.v2, c.fail);
        log.add('Health check at ' + CANARY[c.step] * 100 + '%: ' + c.v2 + ' requests reached v2, ' + c.fail + ' failed → ' + (bad ? '**unhealthy** ✗' : '**healthy** ✓'), bad ? 'bad' : 'good');
        if (!bad) { nextStep(); return; }
        if (autoRb) { log.add('Automatic rollback kicks in.', 'warn'); rollback(); }
        else { sim.status = 'paused'; log.add('Auto-rollback is **off**, so the canary just sits at ' + CANARY[c.step] * 100 + '% and keeps failing. Press **Roll back** (or Continue anyway, if you dare).', 'warn'); }
      }
      function doSwitch() {
        if (sim.status !== 'ready') return;
        sim.share = 1; sim.switched = true; sim.status = 'switched'; sim.m.maxShare = 1;
        log.add('Traffic flipped: **100% of users** now hit green' + (sim.bad ? ' (and green is faulty!)' : '.'), sim.bad ? 'bad' : 'good');
        record(); render();
      }
      function rollback() {
        const s = sim.status;
        if (['running', 'paused', 'ready', 'switched', 'done'].indexOf(s) < 0) return;
        sim.m.rbStart = sim.t;
        if (strat === 'rolling') {
          const r = sim.roll || { target: 'v2', queue: [], cur: null, until: 0 };
          r.target = 'v1';
          if (r.cur) r.cur.forEach(i => { i.to = 'v1'; });
          const busy = r.cur || [];
          r.queue = chunk(sim.fleet.map((x, i) => i).filter(i => sim.fleet[i].ver === 'v2' && busy.indexOf(sim.fleet[i]) < 0), 2);
          sim.roll = r; sim.status = 'rollingback';
          log.add('**Rolling back**: this has to undo the servers two at a time.', 'warn');
        } else {
          const wasSwitched = sim.switched;
          sim.share = 0; sim.status = 'rolledback'; sim.m.rollbackMs = 0; sim.canary = null;
          if (strat === 'canary') { sim.fleet = []; fillFleet(); }
          log.add(strat === 'bluegreen' ? 'Flipped traffic back to blue: **rolled back instantly** (0 s).' : 'Canary removed, everyone back on v1: **rolled back instantly**.', 'good');
          if (strat === 'bluegreen' && wasSwitched) api.goal('bluegreen');
          record();
        }
        render();
      }
      function fillFleet() { while (sim.fleet.length < FLEET) sim.fleet.push({ ver: 'v1', to: 'v1', state: 'up' }); }
      function record() {
        const m = sim.m;
        table[strat] = { extra: m.maxExtra, low: m.minUp, hit: m.fails, pct: m.reqs ? m.fails / m.reqs * 100 : 0, rb: m.rollbackMs };
        const s = sim.status, pct = m.reqs ? m.fails / m.reqs * 100 : 0;
        if (m.fails || sim.bad) log.add('Users who got an error during this deploy: **' + m.fails + '** (' + pct.toFixed(1) + '% of all requests).', m.fails ? 'warn' : 'dim');
        if (strat === 'rolling' && s === 'done' && !sim.bad) api.goal('rolling');
        if (strat === 'rolling' && s === 'done' && sim.bad) log.add('The faulty release reached **every server** because rolling has no health gate. Try Roll back next time.', 'warn');
        if (strat === 'canary' && s === 'rolledback' && sim.bad && m.maxShare <= 0.05 + 1e-9 && pct <= 5) {
          api.goal('canary'); log.add('Caught at the first step: only **' + pct.toFixed(1) + '%** of users were affected.', 'good');
        }
        if (table.rolling && table.bluegreen && table.canary) api.goal('cost');
      }
      function oneRequest() {
        const m = sim.m, toV2 = routeNext(router, v2share());
        m.reqs++;
        let fail = false;
        if (toV2) {
          m.v2++;
          if (sim.canary) sim.canary.v2++;
          if (sim.bad && failNext(router, FAIL_RATE)) { fail = true; m.fails++; if (sim.canary) sim.canary.fail++; }
        }
        ring.push(fail); if (ring.length > 60) ring.shift();
      }
      function progress() {
        const t = sim.t, s = sim.status;
        if (sim.roll && (s === 'running' || s === 'rollingback')) {
          const r = sim.roll;
          if (r.cur && t >= r.until) { r.cur.forEach(i => { i.ver = i.to; i.state = 'up'; }); r.cur = null; }
          if (!r.cur) { if (r.queue.length) startBatch(); else finishRoll(); }
        }
        if (strat === 'bluegreen' && s === 'running' && sim.green && t >= sim.greenReady) {
          sim.green.forEach(i => { i.state = 'up'; }); sim.status = 'ready';
          log.add('Green fleet is **up and tested**. Press **Switch traffic to green** when you are ready.', 'good');
        }
        if (strat === 'canary' && s === 'running' && sim.canary && t - sim.canary.start >= STEP_MS) checkCanary();
        const m = sim.m;
        if (sim.status !== 'idle') {
          const total = sim.fleet.length + (sim.green ? sim.green.length : 0);
          m.maxExtra = Math.max(m.maxExtra, total - FLEET);
          m.minUp = Math.min(m.minUp, sim.fleet.filter(i => i.state === 'up').length);
        }
      }
      function cellClass(i, standby) {
        if (i.state !== 'up') return 'dim';
        if (standby) return 'dim';
        return i.ver === 'v1' ? 'good' : (sim.bad ? 'bad' : 'hl');
      }
      function drawRow(el, list, standby) {
        KS.clear(el);
        list.forEach(i => el.appendChild(h('span.lab-cell.' + cellClass(i, standby), i.state === 'up' ? i.ver : '…')));
      }
      function render() {
        const m = sim.m, s = sim.status;
        blueTitle.textContent = strat === 'bluegreen' ? 'Blue fleet (live now)' : 'Servers';
        drawRow(blueRow, sim.fleet, strat === 'bluegreen' && sim.switched && s !== 'rolledback');
        greenWrap.style.display = sim.green && s !== 'rolledback' ? '' : 'none';
        if (sim.green) drawRow(greenRow, sim.green, strat === 'bluegreen' && sim.status !== 'switched' && !sim.switched);
        const share = v2share(), errs = ring.filter(x => x).length;
        shareM.set(share, Math.round(share * 100) + '%');
        errM.set(ring.length ? errs / ring.length : 0, ring.length ? Math.round(errs / ring.length * 100) + '%' : '0%', errs / Math.max(1, ring.length) > 0.15 ? 'bad' : errs ? 'warn' : 'good');
        sUsers.set(m.fails, m.fails ? 'bad' : 'good');
        sExtra.set(sim.status === 'idle' ? 0 : (sim.fleet.length + (sim.green && s !== 'rolledback' ? sim.green.length : 0)) - FLEET);
        sLow.set(m.minUp + '/' + FLEET, m.minUp < FLEET ? 'warn' : '');
        sRb.set(m.rollbackMs == null ? '–' : (m.rollbackMs / 1000).toFixed(1) + ' s', m.rollbackMs ? 'warn' : m.rollbackMs === 0 ? 'good' : '');
        const msgs = { idle: 'Ready: eight servers on v1.', running: strat === 'bluegreen' ? 'Building the green fleet…' : 'Deploying…', paused: 'Paused: the canary is unhealthy and still serving users.', ready: 'Green is ready. Waiting for you to switch.', switched: 'Traffic is on green. You can still roll back.', rollingback: 'Rolling back…', done: 'Deploy complete. Reset the fleet to try another.', rolledback: 'Rolled back to v1. Reset the fleet to try another.' };
        statusP.textContent = msgs[s] || '';
        deployBtn.disabled = s !== 'idle';
        switchBtn.style.display = strat === 'bluegreen' ? '' : 'none'; switchBtn.disabled = s !== 'ready';
        contBtn.style.display = s === 'paused' ? '' : 'none';
        rbBtn.disabled = ['running', 'paused', 'ready', 'switched', 'done'].indexOf(s) < 0;
        autoToggle.style.display = strat === 'canary' ? '' : 'none';
        KS.clear(tbody);
        ['rolling', 'bluegreen', 'canary'].forEach(k => {
          const r = table[k];
          tbody.appendChild(h('tr' + (k === strat ? '.hl' : ''), h('td', NAMES[k]),
            h('td', r ? String(r.extra) : '–'), h('td', r ? r.low + '/' + FLEET : '–'), h('td', r ? r.hit + ' (' + r.pct.toFixed(1) + '%)' : '–'),
            h('td', r ? (r.rb == null ? 'not needed' : r.rb === 0 ? 'instant' : (r.rb / 1000).toFixed(1) + ' s') : '–')));
        });
      }

      api.loop(dt => {
        sim.t += dt * 1000;
        acc += dt * RPS; let g = 0;
        while (acc >= 1 && g++ < 30) { acc -= 1; oneRequest(); }
        if (acc > 2) acc = 0;
        progress();
      });
      api.every(200, render);
      render();
    }
  });
})();
