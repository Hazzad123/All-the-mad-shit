/* Lab: estimation-lab — back-of-the-envelope sizing with every line of arithmetic shown. */
(function () {
  'use strict';

  // ---------- pure model (exposed as def.model for Node tests) ----------
  const M = {};
  M.DAY = 86400;
  /** Compact human number: 1,234 / 12 million / 3.4 */
  M.f = function (n) {
    if (!isFinite(n)) return String(n);
    if (n === 0) return '0';
    if (Math.abs(n) < 10) return String(+n.toFixed(Math.abs(n) < 1 ? 3 : 1));
    if (Math.abs(n) < 1e6) return KS.fmtNum(n);
    return KS.fmtBig(n);
  };
  M.bytes = function (b) {
    const u = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']; let i = 0;
    while (Math.abs(b) >= 1000 && i < u.length - 1) { b /= 1000; i++; }
    return (b >= 100 || i === 0 ? String(Math.round(b)) : String(+b.toPrecision(3))) + ' ' + u[i];
  };
  /** v: { dau, perUser, peak, respKB, writePct, writeBytes, years, perServer }, spike: 1 or 10 */
  M.estimate = function (v, spike) {
    spike = spike || 1;
    const perDay = v.dau * v.perUser;
    const avgRps = perDay / M.DAY, peakRps = avgRps * v.peak;
    const respBytes = v.respKB * 1000, bwMbit = peakRps * respBytes * 8 / 1e6;
    const writes = perDay * v.writePct / 100, perDayBytes = writes * v.writeBytes;
    const perYear = perDayBytes * 365, total = perYear * v.years;
    const loadRps = peakRps * spike, base = Math.ceil(loadRps / v.perServer), servers = base + 1;
    return { perDay: perDay, avgRps: avgRps, peakRps: peakRps, respBytes: respBytes, bwMbit: bwMbit, writes: writes, perDayBytes: perDayBytes, perYear: perYear, total: total, loadRps: loadRps, base: base, servers: servers, spike: spike };
  };
  M.lines = function (v, spike) {
    const e = M.estimate(v, spike), f = M.f;
    const L = [
      ['Requests per day', f(v.dau) + ' users × ' + f(v.perUser) + ' requests each', f(e.perDay)],
      ['Average requests per second', f(e.perDay) + ' ÷ 86,400 seconds in a day (about 10⁵)', f(e.avgRps) + ' /s'],
      ['Peak requests per second', f(e.avgRps) + ' × peak multiplier ' + f(v.peak), f(e.peakRps) + ' /s', 'peak'],
      ['Bandwidth at peak', f(e.peakRps) + ' /s × ' + M.bytes(e.respBytes) + ' × 8 bits', f(e.bwMbit) + ' Mbit/s'],
      ['Writes per day', f(e.perDay) + ' requests × ' + f(v.writePct) + '% are writes', f(e.writes)],
      ['New data per day', f(e.writes) + ' writes × ' + M.bytes(v.writeBytes), M.bytes(e.perDayBytes)],
      ['Storage per year', M.bytes(e.perDayBytes) + ' × 365 days', M.bytes(e.perYear)],
      ['Storage for ' + v.years + ' year' + (v.years === 1 ? '' : 's'), M.bytes(e.perYear) + ' × ' + v.years + ' years', M.bytes(e.total), 'total'],
      ['Servers needed' + (spike > 1 ? ' (10× spike)' : ''), f(e.loadRps) + ' /s ÷ ' + f(v.perServer) + ' /s per server = ' + f(e.loadRps / v.perServer) + ', round up to ' + e.base + ', plus 1 spare', e.servers + ' servers', 'servers']
    ];
    return { e: e, rows: L };
  };
  M.parseNum = function (s) {
    const m = String(s == null ? '' : s).replace(/[,\s]/g, '').match(/^(\d*\.?\d+(?:e[+-]?\d+)?)([kmbt]?)$/i);
    if (!m) return NaN;
    const x = parseFloat(m[1]) * ({ '': 1, k: 1e3, m: 1e6, b: 1e9, t: 1e12 })[m[2].toLowerCase()];
    return x > 0 && isFinite(x) ? x : NaN;
  };
  M.within2 = function (guess, actual) { const r = guess / actual; return r >= 0.5 && r <= 2; };
  /** Three guess-first challenges. pick(arr) chooses a variant. */
  M.challenges = function (pick) {
    const a = pick([5, 10, 40, 200]), b = pick([5, 10, 20, 50]), c = pick([20, 50, 100]), d = pick([30, 40, 60]), g = pick([2, 3, 5]);
    const c1 = a * 1e6 / M.DAY;
    const c2 = b * 1e6 * 2e6 / 1e12;
    const c3 = c * 1e6 * d * g / M.DAY;
    return [
      { q: 'A website gets **' + a + ' million requests a day**. About how many requests **per second** is that on average?', unit: 'requests per second', actual: c1, work: [a + ' million ÷ 86,400 seconds = ' + M.f(c1) + ' /s', 'Shortcut: a day ≈ 100,000 seconds, so ' + a + ' million ÷ 100,000 = ' + a * 10 + ' /s. Close enough.'] },
      { q: '**' + b + ' million** people each upload **one 2 MB photo** per day. How many **terabytes** of new storage is that per day?', unit: 'TB per day', actual: c2, work: [b + ' million × 2 MB = ' + b * 2 + ' million MB', M.f(b * 2) + ' million MB ÷ 1,000,000 (MB per TB) = ' + M.f(c2) + ' TB per day'] },
      { q: 'A chat app has **' + c + ' million daily users**, each sending **' + d + ' messages** a day. At peak, traffic is **' + g + '×** the average. How many messages **per second** at peak?', unit: 'messages per second', actual: c3, work: [c + ' million × ' + d + ' = ' + M.f(c * 1e6 * d) + ' messages a day', M.f(c * 1e6 * d) + ' ÷ 86,400 = ' + M.f(c * 1e6 * d / M.DAY) + ' /s on average', '× ' + g + ' at peak = ' + M.f(c3) + ' /s'] }
    ];
  };

  const PRESETS = {
    blog: { name: 'Small blog', v: { dau: 10000, perUser: 5, peak: 3, respKB: 500, writePct: 1, writeBytes: 2000, years: 2, perServer: 500 } },
    chat: { name: 'Chat app', v: { dau: 20000000, perUser: 100, peak: 3, respKB: 2, writePct: 40, writeBytes: 200, years: 3, perServer: 2000 } },
    photo: { name: 'Photo sharing', v: { dau: 5000000, perUser: 50, peak: 3, respKB: 300, writePct: 2, writeBytes: 2000000, years: 4, perServer: 1000 } },
    video: { name: 'Video site', v: { dau: 20000000, perUser: 20, peak: 3, respKB: 5000, writePct: 0.1, writeBytes: 50000000, years: 3, perServer: 200 } }
  };

  KS.labs.register({
    id: 'estimation-lab',
    title: 'Estimation Lab',
    emoji: '🧮',
    blurb: 'Size a whole system on the back of an envelope: users in, servers and storage out, with every step of the arithmetic shown.',
    tags: ['estimation', 'capacity planning', 'scaling', 'back of envelope'],
    model: M,
    goals: [
      { id: 'rps', text: 'Load the **Chat app** preset and read off its **peak requests per second**' },
      { id: 'servers', text: 'Plan for a **10× spike** and work out how many servers survive it' },
      { id: 'storage', text: 'Set **5 years** and produce a five-year **storage** figure' },
      { id: 'guess', text: 'Reveal a challenge where your guess lands **within a factor of two**' }
    ],
    help: `Engineers rarely need exact numbers. They need to know whether a system needs **one** server or **a hundred**, and whether storage is gigabytes or petabytes. You get there by chaining simple multiplications.

Pick a **preset** or move the sliders. The table underneath shows every step: users → requests per day → requests per second → peak → bandwidth → storage → servers.

Two rules of thumb do most of the work: **a day is about 100,000 seconds**, so **a million requests a day is roughly 12 per second**. Always round generously and add a spare server.

Then try the **challenges**: guess first, reveal second. Being within a factor of two is a good estimate. Sizes use 1 KB = 1,000 bytes, which is fine for this kind of maths.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const v = Object.assign({}, PRESETS.blog.v);
      let spike = 1, presetId = 'blog';
      const sliders = {};
      const tbody = h('tbody'), table = h('table.lab-table', h('thead', h('tr', h('th', 'Step and working'), h('th', 'Result'))), tbody);
      const note = h('div'), host = h('div.lab-stack');

      // ---------- inputs ----------
      const val = x => +Math.pow(10, x).toPrecision(2);
      function logSlider(key, label, lo, hi, fmt) {
        const s = ui.slider(label, { min: lo, max: hi, step: 0.05, value: Math.log10(v[key]), fmt: x => fmt(val(x)) }, x => { v[key] = val(x); presetId = null; render(); });
        sliders[key] = { el: s, set: n => s.set(Math.log10(n)) }; return s;
      }
      function linSlider(key, label, lo, hi, step, fmt) {
        const s = ui.slider(label, { min: lo, max: hi, step: step, value: v[key], fmt: fmt }, x => { v[key] = x; presetId = null; render(); });
        sliders[key] = { el: s, set: n => s.set(n) }; return s;
      }
      const presetSeg = ui.seg(Object.keys(PRESETS).map(k => [k, PRESETS[k].name]), presetId, id => applyPreset(id));
      const spikeSeg = ui.seg([['1', 'Normal peak'], ['10', '10× spike']], '1', x => { spike = +x; render(); });

      root.appendChild(ui.panel('Start from a preset', presetSeg));
      root.appendChild(ui.panel('Your system',
        h('div.lab-grid2.even',
          h('div.lab-stack', logSlider('dau', 'Daily users', 3, 9, M.f), logSlider('perUser', 'Requests per user per day', 0, 3, M.f), linSlider('peak', 'Peak multiplier (peak ÷ average)', 1, 10, 0.5, x => x + '×'), logSlider('respKB', 'Response size', 0, 4.5, x => M.bytes(x * 1000))),
          h('div.lab-stack', logSlider('writePct', 'Share of requests that write', -1, 2, x => x + '%'), logSlider('writeBytes', 'Bytes stored per write', 1, 8, M.bytes), linSlider('years', 'Years of data kept', 1, 10, 1, x => x + (x === 1 ? ' year' : ' years')), logSlider('perServer', 'Requests per second one server handles', 1, 4, x => M.f(x) + ' /s')))));
      root.appendChild(ui.panel('The working', ui.row(h('span.muted.small', 'Plan servers for:'), spikeSeg), h('div.lab-table-wrap', { style: { maxHeight: 'none' } }, table), note));
      root.appendChild(h('div.lab-grid2.even', ui.panel('Rules of thumb', h('ul.small', { style: { margin: 0, paddingLeft: '18px', lineHeight: '1.6' } },
        h('li', 'A day ≈ 100,000 seconds (really 86,400).'), h('li', 'A million requests a day ≈ 12 per second.'), h('li', 'Peak traffic is often 2 to 5 times the average.'),
        h('li', '1 KB = 1,000 bytes, 1 MB = 1,000 KB, 1 TB = 1,000 GB.'), h('li', 'A year ≈ 365 days ≈ 30 million seconds.'), h('li', 'Always add a spare server: one will fail.'))),
        ui.panel('Challenges: guess first', host)));

      function applyPreset(id) {
        const p = PRESETS[id]; if (!p) return;
        Object.assign(v, p.v); presetId = id;
        Object.keys(sliders).forEach(k => sliders[k].set(v[k]));
        presetSeg.set(id); render();
      }

      // ---------- results ----------
      function render() {
        const r = M.lines(v, spike), e = r.e;
        KS.clear(tbody);
        r.rows.forEach(row => {
          const hot = row[3] === 'peak' || (row[3] === 'servers' && spike > 1);
          tbody.appendChild(h('tr' + (hot ? '.hl' : ''), h('td', h('strong', row[0]), h('div.lab-mono.muted', row[1])), h('td', h('strong', row[2]))));
        });
        KS.clear(note);
        note.appendChild(h('p.small.muted', { style: { margin: '8px 0 0' } }, 'Rule-of-thumb check: ' + M.f(e.perDay / 1e6) + ' million requests a day × 12 per million ≈ ' + M.f(e.perDay / 1e6 * 12) + ' /s on average (exact: ' + M.f(e.avgRps) + ' /s).'));
        if (presetId === 'chat') api.goal('rps');
        if (spike === 10 && e.servers >= 2) api.goal('servers');
        if (v.years === 5 && e.total > 0) api.goal('storage');
      }

      // ---------- challenges ----------
      let chals = [];
      function buildChallenges() {
        chals = M.challenges(arr => arr[Math.floor(Math.random() * arr.length)]);
        KS.clear(host);
        chals.forEach((c, i) => {
          const out = h('div.small');
          const inp = ui.input('Your guess (' + c.unit + '). You can type 2k, 3m or 1e6', '', () => {}, { inputmode: 'decimal' });
          const go = ui.btn('Reveal', () => {
            if (c.done) return;
            const g = M.parseNum(inp.get());
            KS.clear(out);
            if (!isFinite(g)) { out.appendChild(h('div.lab-note.tn-warn', 'Type a number first, for example 5000 or 2k. A rough guess is fine.')); return; }
            c.done = true; go.disabled = true; inp.input.disabled = true;
            const ratio = g / c.actual, ok = M.within2(g, c.actual);
            out.appendChild(h('div.lab-note' + (ok ? '.tn-good' : '.tn-warn'),
              h('div', { html: KS.md.inline((ok ? '**Within a factor of two. Nice estimate.** ' : '**Not quite.** ') + 'You said ' + M.f(g) + '; the answer is **' + M.f(c.actual) + ' ' + c.unit + '**. You were ' + (ratio >= 1 ? M.f(ratio) + '× too high.' : M.f(1 / ratio) + '× too low.')) }),
              h('div.lab-mono', { style: { marginTop: '6px' } }, c.work.map(w => h('div', w)))));
            if (ok) api.goal('guess');
          }, 'primary');
          host.appendChild(h('div.lab-stack', h('div', { html: KS.md.inline((i + 1) + '. ' + c.q) }), inp, ui.row(go), out));
        });
        host.appendChild(ui.btn('New questions', buildChallenges, 'ghost'));
      }
      buildChallenges(); render();
    }
  });
})();
