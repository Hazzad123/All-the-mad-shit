/* Lab: quorum-lab — N replicas, W write acks, R read replicas: if R + W > N a read always meets the newest write. */
(function () {
  'use strict';
  const h = KS.h;

  // ======================= pure model =======================
  function newState(n, W, R) {
    return { n, W: Math.min(W, n), R: Math.min(R, n), vers: Array(n).fill(0), up: Array(n).fill(true), latest: 0, lastW: [], lastR: [], last: null, runInfo: null, events: [], flags: {} };
  }
  const ev = (S, t, tone) => S.events.push([t, tone || '']);
  const names = idx => idx.map(i => 'R' + (i + 1)).join(', ') || 'none';
  const alive = S => S.vers.map((_, i) => i).filter(i => S.up[i]);
  const deadCount = S => S.n - alive(S).length;
  // The guarantee depends on the W the newest write was actually made with, not the slider's current value.
  const effW = S => (S.latest ? S.wUsed : S.W);
  const overlaps = S => S.R + effW(S) > S.n;
  function sample(arr, k, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a.slice(0, k).sort((x, y) => x - y); }
  const lagging = S => S.vers.filter(v => v < S.latest).length;

  function write(S, rnd) {
    rnd = rnd || Math.random;
    const al = alive(S);
    if (al.length < S.W) {
      if (S.W === S.n && deadCount(S) > 0) S.flags.block = true;
      ev(S, '**Write refused** ✗ — it needs **' + S.W + '** replicas to confirm, but only ' + al.length + ' ' + (al.length === 1 ? 'is' : 'are') + ' alive. The database would rather fail than promise something it cannot keep.' + (S.W === S.n ? ' (With W = N, a single dead replica blocks every write.)' : ''), 'bad');
      return false;
    }
    const chosen = sample(al, S.W, rnd), v = ++S.latest;
    chosen.forEach(i => { S.vers[i] = v; }); S.lastW = chosen; S.wUsed = S.W;
    const behind = S.vers.map((x, i) => i).filter(i => S.vers[i] < v);
    if (deadCount(S) > 0) S.flags.wDead = true;
    ev(S, '**Write v' + v + '** → stored on ' + names(chosen) + ' (W = ' + S.W + ') and the client is told "done" ✓. ' + (behind.length ? names(behind) + ' still believe' + (behind.length === 1 ? 's' : '') + ' an older version until repaired.' : 'Every replica has it.'), 'info');
    return true;
  }
  function readOnce(S, rnd) {
    const al = alive(S);
    if (al.length < S.R) return { ok: false, alive: al.length };
    const asked = sample(al, S.R, rnd), seen = asked.map(i => S.vers[i]), best = Math.max.apply(null, seen);
    return { ok: true, asked, seen, best, stale: best < S.latest };
  }
  function read(S, rnd) {
    const r = readOnce(S, rnd || Math.random);
    if (!r.ok) { ev(S, '**Read refused** ✗ — it needs answers from **' + S.R + '** replicas but only ' + r.alive + ' alive.', 'bad'); return null; }
    S.lastR = r.asked; S.last = r; if (deadCount(S) > 0) S.flags.rDead = true;
    const says = r.asked.map((i, k) => 'R' + (i + 1) + ' says v' + r.seen[k]).join(', ');
    if (r.stale) {
      S.flags.stale = true;
      const holders = S.vers.map((x, i) => i).filter(i => S.vers[i] === S.latest && S.up[i]);
      ev(S, '**Read** asked ' + names(r.asked) + ' (R = ' + S.R + '): ' + says + ' → newest seen is **v' + r.best + '** ✗ **STALE.** The latest write is v' + S.latest + ', held by ' + (holders.length ? names(holders) : 'only dead replicas') + ' — none of them was asked.', 'bad');
    } else ev(S, '**Read** asked ' + names(r.asked) + ' (R = ' + S.R + '): ' + says + ' → newest seen is **v' + r.best + '** ✓ up to date' + (S.latest && r.seen.some(x => x !== r.best) ? ' (one replica was behind, but another asked replica had the newest, and the reader takes the highest).' : '.'), 'good');
    return r;
  }
  function runReads(S, k, rnd) {
    rnd = rnd || Math.random;
    if (S.latest === 0) { ev(S, 'Write something first, otherwise there is nothing to be stale about.', 'warn'); return null; }
    let ok = 0, stale = 0, fail = 0;
    for (let i = 0; i < k; i++) { const r = readOnce(S, rnd); if (!r.ok) fail++; else { ok++; if (r.stale) stale++; } }
    S.runInfo = { ok, stale, fail, k };
    if (fail) { ev(S, 'Ran ' + k + ' reads: all ' + fail + ' were refused (not enough replicas alive for R = ' + S.R + ').', 'bad'); return S.runInfo; }
    if (stale) { S.flags.stale = true; ev(S, 'Ran ' + k + ' reads: **' + stale + ' of ' + k + ' were stale** (' + Math.round(stale / k * 100) + '%). R + W = ' + (S.R + effW(S)) + (overlaps(S) ? '' : ' does not exceed N = ' + S.n + ', so a read can miss the newest write.'), 'bad'); }
    else {
      const trivial = lagging(S) === 0;
      ev(S, 'Ran ' + k + ' reads: **0 stale** ✓.' + (overlaps(S) ? ' R + W = ' + (S.R + effW(S)) + ' > N = ' + S.n + ', so every read set must share at least one replica with the newest write.' : ' (Lucky: R + W does not exceed N, so it could have gone wrong.)') + (trivial ? ' (Every replica already holds the newest write, so this proves little. Try W below N.)' : ''), 'good');
      if (overlaps(S) && !trivial) S.flags.strong = true;
    }
    return S.runInfo;
  }
  function repair(S) {
    const al = alive(S); if (!al.length) { ev(S, 'No replicas alive to repair.', 'warn'); return; }
    const best = Math.max.apply(null, al.map(i => S.vers[i])), fixed = al.filter(i => S.vers[i] < best);
    al.forEach(i => { S.vers[i] = best; });
    ev(S, '🩹 **Repair**: alive replicas copy the newest version they can find (v' + best + ')' + (fixed.length ? ' — updated ' + names(fixed) + '.' : ' — all were already equal.') + (best < S.latest ? ' But v' + S.latest + ' lived only on dead replicas.' : ''), 'info');
  }
  function toggle(S, i) {
    S.up[i] = !S.up[i];
    ev(S, S.up[i] ? 'R' + (i + 1) + ' is **back up**, still holding v' + S.vers[i] + ' (it missed anything written meanwhile).' : 'R' + (i + 1) + ' has **crashed** 💥 (' + alive(S).length + ' of ' + S.n + ' alive).', S.up[i] ? 'good' : 'bad');
  }
  function goalsOf(S) {
    const g = []; if (S.flags.stale) g.push('stale'); if (S.flags.strong) g.push('strong');
    if (S.flags.wDead && S.flags.rDead && deadCount(S) > 0) g.push('survive'); if (S.flags.block) g.push('block'); return g;
  }

  // ======================= the lab =======================
  KS.labs.register({
    id: 'quorum-lab',
    title: 'Quorum Lab',
    emoji: '🗳️',
    blurb: 'Copies of the data on several replicas. Choose how many must agree on a write and on a read, and see when reads go stale.',
    tags: ['quorum', 'replication', 'consistency', 'Dynamo', 'distributed systems'],
    goals: [
      { id: 'stale', text: 'Choose **R** and **W** so that a **stale read** happens' },
      { id: 'strong', text: 'Choose them so **50 reads** give **zero** stale results' },
      { id: 'survive', text: '**Kill** a replica and still manage to read **and** write' },
      { id: 'block', text: 'Set **W = N**, kill a replica, and see writes **refused**' }
    ],
    help: `The same data lives on **N replicas**. Each shows the **version** it believes (v3 = third write).

- **W** is how many replicas must store a write before the client hears "done". A write lands on a random W of them; the others stay old until a repair.
- **R** is how many replicas a read asks. It returns the **highest version** among their answers.

If **R + W > N**, any group of R replicas must share at least one member with any group of W replicas, so a read always meets the newest write. If not, a read can miss it and return the past. Big W blocks writes when replicas die; big R blocks reads. Badges on the replicas show who took part in the last write (W) and read (R). A star means both: the overlap.

Tap a replica to crash or revive it.`,

    _model: { newState, write, read, readOnce, runReads, repair, toggle, goalsOf },

    mount(root, api) {
      const ui = api.ui;
      let S = newState(3, 1, 1);
      const log = ui.log(80);
      const nodeRow = h('div.lab-row', { style: { justifyContent: 'center' } }), sliderHost = h('div.lab-row');
      const overlapEl = h('div.lab-note'), nodeEls = [];
      const stLatest = ui.stat('newest write', 'v0'), stLast = ui.stat('last read', '–'), stRun = ui.stat('stale in last 50', '–');

      function buildSliders() {
        KS.clear(sliderHost);
        sliderHost.appendChild(ui.slider('W — replicas that must store a write', { min: 1, max: S.n, value: S.W, fmt: v => String(v) }, v => { S.W = v; render(); }));
        sliderHost.appendChild(ui.slider('R — replicas asked on a read', { min: 1, max: S.n, value: S.R, fmt: v => String(v) }, v => { S.R = v; render(); }));
      }
      function buildNodes() {
        KS.clear(nodeRow); nodeEls.length = 0;
        for (let i = 0; i < S.n; i++) { const el = ui.node('R' + (i + 1), '🗄️', { onClick: () => { toggle(S, i); flush(); } }); nodeEls.push(el); nodeRow.appendChild(el); }
      }
      function newN(n) { S = newState(n, Math.min(S.W, n), Math.min(S.R, n)); buildSliders(); buildNodes(); log.add('— ' + n + ' fresh replicas, all at v0 —', 'info'); flush(); }
      const nSeg = ui.seg([['3', '3 replicas'], ['5', '5 replicas']], '3', v => newN(+v));

      root.appendChild(ui.panel('Settings', ui.row(nSeg), sliderHost, overlapEl));
      root.appendChild(ui.panel('The replicas (tap one to crash or revive it)', nodeRow, h('p.muted.small', 'Badges: W = took part in the last write, R = asked in the last read, ⭐ = both.')));
      root.appendChild(ui.panel('Actions', ui.row(ui.btn('✍ Write', () => { write(S); flush(); }, 'primary'), ui.btn('👁 Read', () => { read(S); flush(); }), ui.btn('Run 50 reads', () => { runReads(S, 50); flush(); }), ui.btn('🩹 Repair', () => { repair(S); flush(); }), ui.btn('Reset', () => newN(S.n), 'ghost')), ui.stats(stLatest, stLast, stRun)));
      root.appendChild(ui.panel('What just happened', log.el));

      function render() {
        nodeEls.forEach((el, i) => {
          const inW = S.lastW.indexOf(i) >= 0, inR = S.lastR.indexOf(i) >= 0;
          el.setState(!S.up[i] ? 'down' : inR ? 'active' : S.vers[i] < S.latest ? 'warn' : 'ok');
          el.setSub(S.up[i] ? 'v' + S.vers[i] + (S.vers[i] < S.latest ? ' (behind)' : S.latest ? ' (newest)' : '') : 'down · v' + S.vers[i]);
          el.badge(inW && inR ? '⭐' : inW ? 'W' : inR ? 'R' : '');
        });
        const sum = S.R + effW(S);
        const changed = S.latest && S.wUsed !== S.W ? ' The newest write (v' + S.latest + ') was made with **W = ' + S.wUsed + '**, so that is the W that counts for reading it; the slider only affects the next write.' : '';
        overlapEl.className = 'lab-note ' + (overlaps(S) ? 'tn-good' : 'tn-warn');
        overlapEl.innerHTML = KS.md.inline('**R + W = ' + sum + '**, N = ' + S.n + ' → ' + (overlaps(S) ? '**' + sum + ' > ' + S.n + ' ✓** every read meets the newest write.' : '**' + sum + ' ≤ ' + S.n + ' ✗** a read can miss the newest write.') + changed);
        stLatest.set('v' + S.latest);
        stLast.set(S.last ? 'v' + S.last.best : '–', S.last ? (S.last.stale ? 'bad' : 'good') : '');
        stRun.set(S.runInfo ? S.runInfo.stale + ' / ' + S.runInfo.k : '–', S.runInfo ? (S.runInfo.stale ? 'bad' : 'good') : '');
      }
      function flush() { S.events.splice(0).forEach(e => log.add(e[0], e[1])); render(); goalsOf(S).forEach(g => api.goal(g)); }
      buildSliders(); buildNodes();
      log.add('Start with W = 1 and R = 1: press **Write**, then **Read** a few times. Then raise W and R.', 'info');
      render();
    }
  });
})();
