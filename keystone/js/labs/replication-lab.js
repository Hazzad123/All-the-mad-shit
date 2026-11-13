/* Lab: replication-lab — a leader and two followers: lag, stale reads, sync vs async, failover and lost writes. */
(function () {
  'use strict';
  const h = KS.h;

  // ======================= pure model (time in milliseconds) =======================
  const mkNode = (id, role) => ({ id, name: 'Node ' + id, role, up: true, ver: 0, queue: [] });
  function newState(mode, lag) {
    return { now: 0, mode, lag, nodes: [mkNode(1, 'leader'), mkNode(2, 'follower'), mkNode(3, 'follower')], acked: 0, inflight: null, events: [],
      last: null, lastWriteMs: null, flags: {}, syncGood: 0, syncStale: 0, syncWrites: 0, lostTotal: 0 };
  }
  const ev = (S, text, tone) => S.events.push([text, tone || '']);
  const leaderOf = S => S.nodes.find(n => n.role === 'leader');
  const followers = S => S.nodes.filter(n => n.role === 'follower');
  const sec = ms => (Math.max(0, ms) / 1000).toFixed(1) + ' s';
  /** Follower number 2 is a bit further away, so the copies land at different times. */
  function lagOf(S, f) { const fs = followers(S); return S.lag * (fs.length > 1 && fs.indexOf(f) === 1 ? 1.7 : 1); }
  const ups = S => followers(S).filter(f => f.up);

  function write(S) {
    const L = leaderOf(S);
    if (!L || !L.up) { ev(S, '**Write failed** ✗ — there is no working leader. Writes can only go to the leader, so nothing can be saved until a follower is promoted.', 'bad'); return false; }
    if (S.inflight) { ev(S, 'Wait for the previous write to be confirmed first.', 'warn'); return false; }
    const ver = L.ver + 1; L.ver = ver;
    ups(S).forEach(f => f.queue.push({ ver, start: S.now, at: S.now + lagOf(S, f) }));
    if (S.mode === 'async' || !ups(S).length) {
      S.acked = ver; S.lastWriteMs = 20;
      ev(S, '**Write v' + ver + '** → ' + L.name + ' (leader) saves it and replies "done" **immediately** (~0.02 s). Copies are on their way to the followers (about ' + sec(S.lag) + '). Until they arrive, the followers still believe the old value.', 'info');
    } else {
      S.inflight = { ver, start: S.now };
      ev(S, '**Write v' + ver + '** → ' + L.name + ' (leader) saves it, then **waits** for every follower to confirm before telling the client "done" (synchronous).', 'info');
    }
    return true;
  }
  function tick(S, dt) {
    S.now += dt;
    S.nodes.forEach(n => {
      if (!n.up) return;
      while (n.queue.length && n.queue[0].at <= S.now) {
        const m = n.queue.shift(); n.ver = m.ver;
        ev(S, n.name + ' receives v' + m.ver + ' — it now matches the leader.', 'dim');
      }
    });
    if (S.inflight && ups(S).every(f => f.ver >= S.inflight.ver)) {
      S.acked = S.inflight.ver; S.lastWriteMs = S.now - S.inflight.start; S.syncWrites++;
      ev(S, 'All followers confirmed v' + S.acked + ' → leader tells the client **"done"** ✓ (that write took ' + sec(S.lastWriteMs) + ' instead of 0.02 s).', 'good');
      S.inflight = null;
    }
  }
  function describePending(S, n) {
    const m = n.queue[0];
    return m ? 'its copy of v' + m.ver + ' is still on the way (arrives in ' + sec(m.at - S.now) + ')' : 'it has no copy of the newest data';
  }
  function read(S, id) {
    const n = S.nodes.find(x => x.id === id);
    if (!n || !n.up) { ev(S, 'Read from ' + (n ? n.name : '?') + ' → **no answer** (it is down).', 'bad'); return null; }
    const stale = n.ver < S.acked, isL = n.role === 'leader';
    S.last = { id, ver: n.ver, stale };
    if (stale) {
      S.flags.stale = true; if (S.mode === 'sync') S.syncStale++;
      ev(S, '**Read from ' + n.name + '** → **v' + n.ver + '** ✗ **STALE.** The newest acknowledged write is v' + S.acked + ', but ' + n.name + ' believes v' + n.ver + ' is current, because ' + describePending(S, n) + '.', 'bad');
    } else {
      if (S.mode === 'sync' && S.syncWrites > 0 && !isL && !S.inflight) S.syncGood++;
      ev(S, '**Read from ' + n.name + (isL ? ' (leader)' : '') + '** → **v' + n.ver + '** ✓ up to date' + (S.inflight ? ' (the newest write is not confirmed yet, so nobody has been promised it).' : '.'), 'good');
    }
    return S.last;
  }
  function setMode(S, mode) {
    if (S.mode === mode) return; S.mode = mode;
    if (mode === 'sync') { S.syncGood = 0; S.syncStale = 0; }
    else if (S.inflight) { S.acked = S.inflight.ver; S.inflight = null; ev(S, 'Switching to async: the leader answers "done" at once for the waiting write.', 'warn'); }
    ev(S, 'Replication is now **' + (mode === 'sync' ? 'synchronous: writes wait for every follower (slower, but copies never lag behind an acknowledged write)' : 'asynchronous: the leader answers straight away and followers catch up later (fast, but they lag)') + '**.', 'info');
  }
  function crash(S) {
    const L = leaderOf(S); if (!L || !L.up) return false;
    L.up = false; L.queue = [];
    const have = followers(S).filter(f => f.up).map(f => f.name + ' has v' + f.ver).join(', ');
    ev(S, '💥 **The leader (' + L.name + ') crashed** while holding v' + L.ver + '. Copies still in flight are lost with it. Right now: ' + (have || 'no followers up') + '. The latest acknowledged write is v' + S.acked + '.', 'bad');
    followers(S).forEach(f => { f.queue = []; });
    if (S.inflight) { ev(S, 'Write v' + S.inflight.ver + ' was never confirmed, so the client was never told "done" — it knows to retry. (Synchronous replication never lies to the client.)', 'warn'); S.inflight = null; }
    return true;
  }
  function promote(S, id) {
    const L = leaderOf(S), n = S.nodes.find(x => x.id === id);
    if (!n || n.role !== 'follower' || !n.up || (L && L.up)) return false;
    if (L) L.role = 'follower'; n.role = 'leader'; S.flags.failover = true;
    ev(S, '👑 **' + n.name + ' is promoted to leader.** From now on it is the source of truth, whatever it holds: v' + n.ver + '.', 'info');
    if (n.ver < S.acked) {
      S.flags.lostwrite = true; S.lostTotal += S.acked - n.ver;
      ev(S, '✗ **Acknowledged write lost!** The client was told v' + S.acked + ' was saved, but ' + n.name + ' only has v' + n.ver + '. That data existed only on the dead leader, and the copy never arrived. It is gone.', 'bad');
      S.acked = n.ver;
    } else ev(S, '✓ The new leader has every acknowledged write, so nothing was lost.', 'good');
    ups(S).forEach(f => { if (f.ver !== n.ver) { f.queue.push({ ver: n.ver, start: S.now, at: S.now + lagOf(S, f) }); ev(S, f.name + ' will re-sync to the new leader\'s v' + n.ver + '.', 'dim'); } });
    return true;
  }
  function revive(S, id) {
    const n = S.nodes.find(x => x.id === id); if (!n || n.up) return false;
    n.up = true; n.queue = [];
    const L = leaderOf(S);
    if (L && L !== n && L.up) {
      if (n.ver > L.ver) ev(S, n.name + ' is back, but it holds v' + n.ver + ' that the new leader never saw. It must copy the leader (v' + L.ver + '), **discarding its own newer data**.', 'warn');
      else ev(S, n.name + ' is back and joins as a follower, copying the leader (v' + L.ver + ').', 'info');
      n.ver = L.ver; n.role = 'follower';
    } else ev(S, n.name + ' is back up' + (n.role === 'leader' ? ' and is the leader again.' : '.'), 'info');
    return true;
  }
  function goalsOf(S) {
    const g = []; if (S.flags.stale) g.push('stale'); if (S.mode === 'sync' && S.syncWrites > 0 && S.syncGood >= 2 && S.syncStale === 0) g.push('sync');
    if (S.flags.failover) g.push('failover'); if (S.flags.lostwrite) g.push('lostwrite'); return g;
  }

  // ======================= the lab =======================
  KS.labs.register({
    id: 'replication-lab',
    title: 'Replication Lab',
    emoji: '🪞',
    blurb: 'One leader, two copies. Watch copies lag behind, read the past, then crash the leader and lose a write.',
    tags: ['replication', 'consistency', 'failover', 'distributed systems', 'database'],
    goals: [
      { id: 'stale', text: '**Write**, then **read** an old value from a lagging follower' },
      { id: 'sync', text: 'Switch to **synchronous**, write, and read two followers with **no stale reads**' },
      { id: 'failover', text: '**Crash the leader** and promote a follower' },
      { id: 'lostwrite', text: 'Lose an **acknowledged write** through an *async* failover' }
    ],
    help: `Three database servers hold the same value. **Writes** go only to the **leader**, which sends a copy to each **follower**. Copies take time (the **lag** slider), so for a moment the followers believe the *old* value. Reading from them gives a **stale** read: the past.

- **Asynchronous**: the leader tells the client "done" at once. Fast, but followers lag.
- **Synchronous**: the leader waits until every follower confirms. Slower, but nothing acknowledged is ever behind.

Each node shows the version it believes (v3 means the third write). If the leader **crashes**, nobody can write until you **promote** a follower. Copies still in flight vanish with the leader, so an async failover can lose a write the client was told was safe. Tip: set a long lag, write, then crash straight away.`,

    _model: { newState, write, tick, read, setMode, crash, promote, revive, goalsOf },

    mount(root, api) {
      const ui = api.ui;
      let S = newState('async', 2500), sig = '';
      const log = ui.log(80);
      const nodeEls = S.nodes.map(n => ui.node(n.name, '🖥️'));
      const meters = S.nodes.map(n => ui.meter(n.name));
      const stAck = ui.stat('latest acknowledged', 'v0'), stRead = ui.stat('last read', '–'), stTime = ui.stat('last write took', '–');
      const actions = h('div.lab-stack');
      const writeBtn = ui.btn('✍ Write the next value', () => { if (write(S)) { nodeEls[leaderOf(S).id - 1].pulse('good'); } flush(); }, 'primary');
      const crashBtn = ui.btn('💥 Crash the leader', () => { crash(S); flush(); }, 'danger');
      const modeSeg = ui.seg([['async', 'Asynchronous'], ['sync', 'Synchronous']], 'async', v => { setMode(S, v); flush(); });
      const lagSl = ui.slider('Replication lag', { min: 0.5, max: 6, step: 0.5, value: 2.5, fmt: v => v.toFixed(1) + ' s' }, v => { S.lag = v * 1000; });

      root.appendChild(ui.panel('Controls', ui.row(modeSeg), ui.row(lagSl), ui.row(writeBtn, crashBtn, ui.btn('Reset', reset, 'ghost'))));
      root.appendChild(ui.panel('The three servers', h('div.lab-stage',ui.cols([nodeEls[0]], [nodeEls[1]], [nodeEls[2]])),
        ui.stats(stAck, stRead, stTime)));
      root.appendChild(h('div.lab-grid2', ui.panel('Copies arriving', meters.map(m => m.el), actions), ui.panel('What just happened', log.el)));

      function reset() { const mode = S.mode, lag = S.lag; S = newState(mode, lag); sig = ''; log.add('— Reset: three servers, all at v0. —', 'info'); flush(); }
      function flush() {
        S.events.splice(0).forEach(e => log.add(e[0], e[1]));
        goalsOf(S).forEach(g => api.goal(g)); renderLive();
      }
      function buildActions() {
        KS.clear(actions);
        const L = leaderOf(S), leaderDown = !L || !L.up;
        S.nodes.forEach(n => {
          const kids = [h('b', n.name + (n.role === 'leader' ? ' (leader)' : '') + (n.up ? '' : ' — down')),
            ui.btn('Read', () => { const r = read(S, n.id); if (r) nodeEls[n.id - 1].pulse(r.stale ? 'bad' : 'good'); flush(); }, 'sm')];
          kids[1].disabled = !n.up;
          if (n.up && n.role === 'follower' && leaderDown) kids.push(ui.btn('👑 Promote', () => { promote(S, n.id); flush(); }, 'sm'));
          if (!n.up) kids.push(ui.btn('↺ Bring back', () => { revive(S, n.id); flush(); }, 'sm'));
          actions.appendChild(ui.row.apply(null, kids));
        });
        if (leaderDown) actions.appendChild(h('p.muted.small', { html: KS.md.inline('**No leader.** Promote a follower to accept writes again.') }));
      }
      function renderLive() {
        const key = S.nodes.map(n => n.role + n.up).join('|') + S.mode;
        if (key !== sig) { sig = key; buildActions(); }
        const L = leaderOf(S);
        S.nodes.forEach((n, i) => {
          const el = nodeEls[i];
          el.setState(!n.up ? 'down' : n.role === 'leader' ? 'active' : 'ok');
          el.querySelector('.lab-node-label').textContent = n.name + (n.role === 'leader' ? ' 👑' : '');
          el.setSub(n.up ? 'believes v' + n.ver : 'crashed');
          const m = n.queue[0];
          if (!n.up) meters[i].set(0, 'down', 'bad');
          else if (m) meters[i].set(Math.min(1, (S.now - m.start) / Math.max(1, m.at - m.start)), 'v' + m.ver + ' arriving in ' + sec(m.at - S.now), 'warn');
          else meters[i].set(n.role === 'leader' ? 1 : 1, n.role === 'leader' ? 'leader — source of truth' : 'in sync', 'good');
        });
        stAck.set('v' + S.acked);
        stRead.set(S.last ? 'v' + S.last.ver : '–', S.last ? (S.last.stale ? 'bad' : 'good') : '');
        stTime.set(S.lastWriteMs == null ? '–' : sec(S.lastWriteMs));
        writeBtn.disabled = !L || !L.up || !!S.inflight;
        crashBtn.disabled = !L || !L.up;
      }
      api.loop(dt => { tick(S, dt * 1000); if (S.events.length) flush(); else renderLive(); });
      log.add('Press **Write** to save v1, then **Read** from each server. Raise the lag to see copies travel.', 'info');
      renderLive();
    }
  });
})();
