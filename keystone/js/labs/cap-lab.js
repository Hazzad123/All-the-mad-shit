/* Lab: cap-lab — cut the network between London and Tokyo: refuse requests (CP) or let the copies disagree (AP). */
(function () {
  'use strict';
  const h = KS.h;
  const SIDES = { L: 'London', T: 'Tokyo' };
  const COLOURS = [['🔴', '🔴 Red'], ['🟢', '🟢 Green'], ['🔵', '🔵 Blue']];

  // ======================= pure model =======================
  const mkNode = name => ({ name, val: '⚪', ts: 0, wrote: false });
  function newState(mode) { return { mode: mode || 'cp', cut: false, clock: 0, L: mkNode('London'), T: mkNode('Tokyo'), discarded: 0, events: [], flags: {} }; }
  const ev = (S, t, tone) => S.events.push([t, tone || '']);
  const show = n => n.val + (n.ts ? ' #' + n.ts : ' (empty)');
  const other = side => (side === 'L' ? 'T' : 'L');

  function refused(S, side) { return S.cut && S.mode === 'cp' && side === 'T'; }
  function write(S, side, colour) {
    const n = S[side], o = S[other(side)];
    if (refused(S, side)) {
      S.flags.refused = true;
      const t = '✗ **Refused (error 503).** ' + n.name + ' cannot reach the leader (' + SIDES.L + '), so it cannot be sure its data is current. In CP mode it would rather **say no** than risk two different answers.';
      ev(S, '**Write ' + colour + ' at ' + n.name + '** → ' + t, 'bad'); return { ok: false, text: 'Refused: ' + n.name + ' cannot reach the leader' };
    }
    const ts = ++S.clock; n.val = colour; n.ts = ts;
    if (!S.cut) {
      o.val = colour; o.ts = ts; S.flags.agree = true;
      ev(S, '**Write ' + colour + ' #' + ts + ' at ' + n.name + '** → saved here and copied to ' + o.name + ' straight away. Both nodes believe **' + show(n) + '** ✓ they agree.', 'good');
    } else {
      n.wrote = true;
      ev(S, '**Write ' + colour + ' #' + ts + ' at ' + n.name + '** → saved here and the client is told "done" ✓. The cable is cut, so ' + o.name + ' has **not** heard: it still believes **' + show(o) + '**.' + (S.mode === 'ap' ? ' (AP mode: every side keeps accepting requests.)' : ' (' + n.name + ' is the leader, so it may carry on.)'), 'warn');
    }
    return { ok: true, text: 'Saved ' + colour + ' #' + ts };
  }
  function read(S, side) {
    const n = S[side];
    if (refused(S, side)) {
      S.flags.refused = true;
      ev(S, '**Read at ' + n.name + '** → ✗ **Refused (error 503).** It cannot confirm with the leader that its data is current, so in CP mode it will not answer.', 'bad');
      return { ok: false, text: 'Refused: no answer' };
    }
    const stale = n.ts < S.clock;
    ev(S, '**Read at ' + n.name + '** → **' + show(n) + '**' + (stale ? ' ⚠ out of date: a newer write (#' + S.clock + ') exists on the other side, but ' + n.name + ' cannot know that while the cable is cut.' : ' ✓ the newest value.'), stale ? 'warn' : 'good');
    return { ok: true, text: 'Read ' + show(n) + (stale ? ' (out of date)' : '') };
  }
  function setCut(S, cut) {
    if (S.cut === cut) return; S.cut = cut;
    if (cut) {
      S.L.wrote = false; S.T.wrote = false;
      ev(S, '✂️ **Network cut.** London and Tokyo can no longer talk to each other. Each is alive, but each is blind to the other. This is a **partition**. Now you must choose: ' + (S.mode === 'cp' ? '**CP** — Tokyo will refuse requests.' : '**AP** — both sides keep answering.'), 'warn');
      return;
    }
    const L = S.L, T = S.T;
    ev(S, '🔌 **Network healed.** The nodes compare notes. London: ' + show(L) + ' · Tokyo: ' + show(T) + '.', 'info');
    if (L.ts === T.ts) ev(S, 'They already match, so there is nothing to fix.', 'good');
    else if (L.wrote && T.wrote) {
      const win = L.ts > T.ts ? L : T, lose = win === L ? T : L;
      ev(S, '💥 **Conflict!** While cut off, both sides accepted a different write and told their clients "saved". Rule used here: **last write wins** — the highest number (the latest timestamp) is kept. **' + win.name + "'s " + show(win) + ' is kept everywhere; ' + lose.name + "'s " + show(lose) + ' is thrown away** — a write the client was told was saved has been silently lost.', 'bad');
      lose.val = win.val; lose.ts = win.ts; S.discarded++; S.flags.discarded = true;
    } else {
      const win = L.ts > T.ts ? L : T, lose = win === L ? T : L;
      ev(S, 'Only ' + win.name + ' changed during the split, so ' + lose.name + ' simply **catches up** to ' + show(win) + '. Nothing is lost.', 'good');
      lose.val = win.val; lose.ts = win.ts;
    }
    S.L.wrote = false; S.T.wrote = false;
  }
  function setMode(S, mode) {
    if (S.mode === mode) return; S.mode = mode;
    ev(S, 'Mode: **' + (mode === 'cp' ? 'CP (consistency over availability)** — during a split, the side without the leader refuses requests.' : 'AP (availability over consistency)** — during a split, every side keeps answering, even if the copies end up different.'), 'info');
  }
  function goalsOf(S) {
    const g = []; if (S.flags.agree) g.push('sync'); if (S.flags.refused) g.push('cp');
    if (S.cut && S.L.wrote && S.T.wrote && S.L.ts !== S.T.ts) g.push('ap');
    if (S.flags.discarded) g.push('heal'); return g;
  }

  // ======================= the lab =======================
  KS.labs.register({
    id: 'cap-lab',
    title: 'CAP Lab',
    emoji: '✂️',
    blurb: 'Two data centres share one value. Cut the cable between them and decide: refuse to answer, or answer differently.',
    tags: ['CAP theorem', 'consistency', 'availability', 'partition', 'distributed systems'],
    goals: [
      { id: 'sync', text: '**Write** while the network is healthy and see both nodes agree' },
      { id: 'cp', text: 'In **CP** mode, cut the network and get a request **refused**' },
      { id: 'ap', text: 'In **AP** mode, cut the network and make the two sides **disagree**' },
      { id: 'heal', text: '**Heal** the network and watch a write get thrown away' }
    ],
    help: `London and Tokyo each keep a copy of one value (a colour). A client on each side can **write** and **read**. Normally every write is copied to the other side at once, so both agree.

Then the cable between them is **cut**. Both nodes are still running, but neither can tell whether the other is dead or just unreachable. The **CAP theorem** says you must now pick one:

- **CP** (consistent): one side (London, the leader) carries on. The other refuses requests, with an error. No disagreement, but some people get errors.
- **AP** (available): both sides keep accepting writes. Everyone gets an answer, but the copies **diverge**. When the cable returns, one write must win. **Last write wins** keeps the newest and silently discards the other.

\`#5\` means "the 5th write overall": its timestamp.`,

    _model: { newState, write, read, setCut, setMode, goalsOf },

    mount(root, api) {
      const ui = api.ui;
      let S = newState('cp'), colour = '🔴';
      const log = ui.log(60);
      const stage = ui.stage();
      const london = ui.node('London', '🏙️'), tokyo = ui.node('Tokyo', '🗼');
      stage.el.appendChild(ui.cols([london], [h('div.lab-chip', { id: 'cap-link' }, '🔗 connected')], [tokyo]));
      const linkChip = stage.el.querySelector('#cap-link');
      const wire = stage.wire(london, tokyo, { tone: 'good' });
      const nodeEl = { L: london, T: tokyo };
      const results = { L: h('p.lab-mono.muted', 'Nothing yet.'), T: h('p.lab-mono.muted', 'Nothing yet.') };
      const stAgree = ui.stat('do the nodes agree?', 'yes', 'good');

      const modeSeg = ui.seg([['cp', 'CP: refuse'], ['ap', 'AP: always answer']], 'cp', v => { setMode(S, v); flush(); });
      const cutTog = ui.toggle('✂️ Cut the network', false, v => { setCut(S, v); flush(); });
      const colSeg = ui.seg(COLOURS, colour, v => { colour = v; });
      function client(side) {
        return ui.panel('🧑 Client in ' + SIDES[side],
          ui.row(ui.btn('✍ Write colour', () => act(side, 'w'), 'primary'), ui.btn('👁 Read', () => act(side, 'r'))), results[side]);
      }
      function act(side, kind) {
        const r = kind === 'w' ? write(S, side, colour) : read(S, side);
        results[side].textContent = (r.ok ? '✓ ' : '✗ ') + r.text;
        if (r.ok && !S.cut && kind === 'w') stage.send(nodeEl[side], nodeEl[other(side)], { label: colour, ms: 450 });
        nodeEl[side].pulse(r.ok ? 'good' : 'bad'); flush();
      }
      root.appendChild(ui.panel('Controls', ui.row(modeSeg), ui.row(cutTog), h('div.lab-row', h('span.muted.small', 'Colour to write:'), colSeg),
        ui.row(ui.btn('Reset', () => { const m = S.mode; S = newState(m); cutTog.set(false); results.L.textContent = results.T.textContent = 'Nothing yet.'; log.add('— Reset —', 'info'); flush(); }, 'ghost'))));
      root.appendChild(stage.el);
      root.appendChild(h('div.lab-grid2.even', client('L'), client('T')));
      root.appendChild(h('div.lab-grid2', ui.panel('What just happened', log.el), ui.panel('Status', ui.stats(stAgree))));

      function render() {
        ['L', 'T'].forEach(side => {
          const n = S[side], el = nodeEl[side];
          el.setSub(show(n));
          const isol = refused(S, side);
          el.setState(isol ? 'warn' : 'ok'); el.badge(isol ? '⛔' : '');
        });
        const agree = S.L.ts === S.T.ts;
        stAgree.set(agree ? 'yes' : 'NO', agree ? 'good' : 'bad');
        wire.set(S.cut ? 'bad' : 'good', S.cut);
        linkChip.textContent = S.cut ? '✂️ CUT' : '🔗 connected'; linkChip.className = 'lab-chip ' + (S.cut ? 'tn-bad' : 'tn-good');
      }
      function flush() { S.events.splice(0).forEach(e => log.add(e[0], e[1])); render(); goalsOf(S).forEach(g => api.goal(g)); }
      log.add('Both nodes start empty (⚪). Pick a colour and press **Write** at London, then cut the network.', 'info');
      render();
      return () => stage.destroy();
    }
  });
})();
