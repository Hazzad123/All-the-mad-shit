/* Lab: http-cache-lab — Cache-Control and ETag decide whether a request is skipped, revalidated (304) or repeated (200). */
(function () {
  'use strict';

  // ---------- pure model (exposed as def.model for Node tests) ----------
  const M = {};
  M.HEADER_BYTES = 300; M.FILE_BYTES = 120000;
  M.tag = function (v) { return (0x3f9a + v * 0x1b3).toString(16); };
  M.etagFor = function (v) { return '"' + M.tag(v) + '"'; };
  M.urlFor = function (fp, v) { return fp ? 'logo.' + M.tag(v) + '.png' : 'logo.png'; };
  /** The headers the server sends right now. Fingerprinted files get a one-year max-age and an ETag. */
  M.effective = function (cfg, fp) { return fp ? { cc: 'max-age', maxAge: 31536000, etag: true } : { cc: cfg.cc, maxAge: cfg.maxAge, etag: !!cfg.etag }; };
  M.fresh = function (e, now) { return e.cc === 'max-age' && now - e.storedAt < e.maxAge; };
  /**
   * One browser request. cache: Map(url → entry), server: { version }, hdr: the server's current headers.
   * Returns { kind: 'cache' | '304' | '200', bytes, version, stale, why, revalidated }.
   */
  M.request = function (cache, server, hdr, url, now) {
    const e = cache.get(url);
    let why = 'first', revalidated = false;
    if (e) {
      if (M.fresh(e, now)) return { kind: 'cache', bytes: 0, version: e.version, stale: e.version !== server.version, why: 'fresh', revalidated: false };
      why = e.cc === 'no-cache' ? 'nocache' : 'expired';
      if (e.etag) {
        revalidated = true;
        if (e.etag === M.etagFor(server.version)) {
          e.storedAt = now; e.cc = hdr.cc; e.maxAge = hdr.maxAge; if (!hdr.etag) e.etag = null;
          if (hdr.cc === 'no-store') cache.delete(url);
          return { kind: '304', bytes: M.HEADER_BYTES, version: e.version, stale: false, why: why, revalidated: true };
        }
        why = 'changed';
      } else why = 'novalidator';
    } else if (hdr.cc === 'no-store') why = 'nostore';
    cache.delete(url);
    if (hdr.cc !== 'no-store') cache.set(url, { url: url, version: server.version, etag: hdr.etag ? M.etagFor(server.version) : null, cc: hdr.cc, maxAge: hdr.maxAge, storedAt: now });
    return { kind: '200', bytes: M.HEADER_BYTES + M.FILE_BYTES, version: server.version, stale: false, why: hdr.cc === 'no-store' && why === 'first' ? 'nostore' : why, revalidated: revalidated };
  };
  M.fmtDur = function (s) {
    s = Math.max(0, Math.round(s));
    if (s < 60) return s + ' s'; if (s < 3600) return Math.round(s / 60) + ' min';
    if (s < 86400) return Math.round(s / 3600) + ' h'; return Math.round(s / 86400) + ' days';
  };
  M.fmtBytes = function (b) { return b < 1000 ? b + ' B' : b < 1e6 ? (b / 1000).toFixed(b < 1e4 ? 1 : 0) + ' KB' : (b / 1e6).toFixed(2) + ' MB'; };
  M.headerText = function (hdr) {
    const cc = hdr.cc === 'max-age' ? 'max-age=' + hdr.maxAge : hdr.cc;
    return 'Cache-Control: ' + cc;
  };

  KS.labs.register({
    id: 'http-cache-lab',
    title: 'HTTP Cache Lab',
    emoji: '🧊',
    blurb: 'Two small headers decide whether the browser skips a request, asks "has it changed?", or downloads everything again.',
    tags: ['http', 'caching', 'cache-control', 'etag', 'browser', 'cdn'],
    model: M,
    goals: [
      { id: 'hit', text: 'Get a response **from the cache** with no network at all' },
      { id: 'revalidate', text: 'Get a **304 Not Modified** (cache plus ETag, after the copy expires)' },
      { id: 'nostore', text: 'Use **no-store** and download the file **3 times in a row**' },
      { id: 'stale', text: 'Change the file on the server inside max-age and receive the **old copy**' },
      { id: 'fingerprint', text: 'Fix that with a **fingerprinted filename**' }
    ],
    help: `A **browser** asks a **server** for one image, \`logo.png\`. The server's response carries headers that tell the browser how to cache it.

- **no-store**: never keep a copy. Every request is a full download.
- **no-cache**: keep a copy, but *always ask the server* before using it.
- **max-age=N**: for N seconds, use the copy without asking anyone. After that it is **expired**.
- **ETag**: a fingerprint of the file's contents. When a copy has expired the browser sends it back as \`If-None-Match\`. If it still matches the server answers **304 Not Modified** (a few hundred bytes) and the copy is reused. Without an ETag the browser cannot check and must download again.

The catch: inside max-age the browser never asks, so it cannot notice a change. **Fingerprinted filenames** (\`logo.3f9a.png\`) solve this: change the file, change the name, and the browser sees a brand-new URL.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const cache = new Map(), server = { version: 1 };
      const cfg = { cc: 'max-age', maxAge: 60, etag: true };
      let fp = false, now = 0, busy = false, nsStreak = 0, fpPending = false;
      const stats = { req: 0, cache: 0, n304: 0, n200: 0, bytes: 0 };
      let lastOut = null;

      // ---------- UI ----------
      const stage = ui.stage();
      const nBrowser = ui.node('Browser', '🌐', { tone: 'accent' }), nServer = ui.node('Server', '🖥️');
      stage.el.appendChild(ui.cols([nBrowser], [nServer]));
      stage.wire(nBrowser, nServer, { dashed: true });
      const log = ui.log(40);
      const sReq = ui.stat('requests', 0), sCache = ui.stat('from cache', 0, 'good'), s304 = ui.stat('304 replies', 0, 'accent'), s200 = ui.stat('full downloads', 0, 'warn'), sBytes = ui.stat('data downloaded', '0 B');
      const clockEl = h('span.lab-chip.tn-accent', '🕐 0 s'), resultEl = h('div.lab-mono', { style: { minHeight: '2.4em' } }, 'Press “Request the file”.');
      const hdrEl = h('div.lab-mono'), tbody = h('tbody');
      const table = h('table.lab-table', h('thead', h('tr', h('th', 'file'), h('th', 'ver'), h('th', 'status of the copy'))), tbody);

      const ccSeg = ui.seg([['no-store', 'no-store'], ['no-cache', 'no-cache'], ['max-age', 'max-age']], cfg.cc, v => {
        cfg.cc = v; log.add('Server now sends **' + M.headerText(M.effective(cfg, false)) + '**. A copy the browser already holds keeps the rules it arrived with; empty the cache to start clean.', 'info'); render();
      });
      const ageSel = ui.select('max-age', [[30, '30 seconds'], [60, '1 minute'], [300, '5 minutes'], [3600, '1 hour'], [86400, '1 day']], 60, v => { cfg.maxAge = +v; render(); });
      const etagTog = ui.toggle('Send an ETag', cfg.etag, v => { cfg.etag = v; log.add('Server ' + (v ? 'now sends' : 'stops sending') + ' an **ETag**.', 'info'); render(); });
      const fpTog = ui.toggle('Fingerprinted filename', fp, v => {
        fp = v; log.add(v ? 'Filename is now **' + M.urlFor(true, server.version) + '** with a one-year max-age. (The page that links to it is always fetched fresh, so it always points at the right name.)' : 'Back to the plain name **logo.png** and your own header settings.', 'info'); render();
      });
      const reqBtn = ui.btn('📥 Request the file', request, 'primary');
      const changeBtn = ui.btn('✏️ Change the file on the server', changeFile);
      const clockBtns = [['+10 s', 10], ['+1 min', 60], ['+1 hour', 3600], ['+1 day', 86400]].map(c => ui.btn(c[0], () => { if (busy) return; now += c[1]; log.add('⏩ Time passes: **' + c[0].slice(1) + '**.', 'dim'); render(); }, 'sm'));
      const clearBtn = ui.btn('Empty browser cache', () => { if (busy) return; cache.clear(); fpPending = false; log.add('Browser cache emptied.', 'warn'); render(); }, 'ghost');
      const lockables = [reqBtn, changeBtn, clearBtn].concat(clockBtns);

      root.appendChild(ui.panel('The server\'s response headers', ccSeg, ui.row(ageSel, etagTog, fpTog), hdrEl));
      root.appendChild(ui.panel('Actions', ui.row(reqBtn, changeBtn), ui.row(h('span.muted.small', 'Fast-forward:'), clockBtns, clockEl, clearBtn)));
      root.appendChild(stage.el);
      root.appendChild(h('div.lab-grid2',
        h('div.lab-stack', ui.panel('Browser cache', h('div.lab-table-wrap', table)), ui.panel('Result', resultEl)),
        h('div.lab-stack', ui.panel('Totals', ui.stats(sReq, sCache, s304, s200, sBytes)), ui.panel('What just happened', log.el))));

      // ---------- simulation ----------
      function setBusy(v) { busy = v; lockables.forEach(b => { b.disabled = v; }); }
      function changeFile() {
        if (busy) return;
        const hadCopy = cache.has(M.urlFor(fp, server.version));
        server.version++;
        if (fp && hadCopy) fpPending = true;
        log.add('✏️ The file on the server changed: now **version ' + server.version + '**' + (fp ? ' with a new name, **' + M.urlFor(true, server.version) + '**.' : ' (same name, **logo.png**). Browsers that have a copy cannot see this yet.'), 'warn');
        render();
      }
      function explain(o, url) {
        const e = cache.get(url);
        if (o.kind === 'cache') {
          const age = e ? M.fmtDur(now - e.storedAt) : '?';
          return '**No network at all.** The copy is ' + age + ' old and max-age says it is still fresh, so the browser just uses it.' + (o.stale ? ' ⚠ But the server file is already **v' + server.version + '**, and you were given the **old v' + o.version + '**. Inside max-age the browser never checks.' : '');
        }
        if (o.kind === '304') return (o.why === 'nocache' ? '**no-cache** means “always ask first”. ' : 'The copy had **expired**, so ') + 'the browser sent **If-None-Match: ' + M.etagFor(o.version) + '**. The ETag still matches, so the server replied **304 Not Modified** (' + M.fmtBytes(o.bytes) + ', no file body). The browser reuses its copy.';
        const reason = { first: 'Nothing was cached yet, so this is a full download.', nostore: '**no-store**: the browser may not keep a copy, so every request is a full download.', nocache: '**no-cache** without a validator: the browser must ask, but the server cannot say “unchanged” without an ETag, so it sends everything.', expired: 'The copy expired and there is no ETag to check against, so the browser downloads it all again.', novalidator: 'The copy expired and it came without an ETag, so there is nothing to ask “has this changed?” with. Full download again.', changed: 'The copy had expired; the browser sent If-None-Match but the ETag **no longer matches** (the file changed), so the server replied **200** with the new file.' };
        return '**200 OK**, ' + M.fmtBytes(o.bytes) + ' downloaded. ' + (reason[o.why] || '');
      }
      async function request() {
        if (busy) return;
        const hdr = M.effective(cfg, fp), url = M.urlFor(fp, server.version);
        const o = M.request(cache, server, hdr, url, now);
        stats.req++; stats.bytes += o.bytes; lastOut = o;
        if (o.kind === 'cache') stats.cache++; else if (o.kind === '304') stats.n304++; else stats.n200++;
        const text = explain(o, url);
        setBusy(true);
        try {
          if (o.kind === 'cache') { nBrowser.pulse('good'); await api.sleep(300); }
          else {
            await stage.send(nBrowser, nServer, { label: o.revalidated ? 'If-None-Match' : 'GET', ms: 420 });
            if (!api.alive()) return;
            nServer.pulse(o.kind === '304' ? 'good' : 'bad');
            await stage.send(nServer, nBrowser, { label: o.kind === '304' ? '304 · ' + M.fmtBytes(o.bytes) : '200 · ' + M.fmtBytes(o.bytes), tone: o.kind === '304' ? 'good' : 'warn', ms: o.kind === '304' ? 300 : 700 });
          }
          if (!api.alive()) return;
        } finally { if (api.alive()) setBusy(false); }
        log.add('GET ' + url + ' → ' + text, o.stale ? 'bad' : o.kind === 'cache' ? 'good' : o.kind === '304' ? 'info' : 'warn');
        goals(o, hdr);
        render();
      }
      function goals(o, hdr) {
        if (o.kind === 'cache') api.goal('hit');
        if (o.kind === '304') api.goal('revalidate');
        if (hdr.cc === 'no-store' && !fp && o.kind === '200') { nsStreak++; if (nsStreak >= 3) api.goal('nostore'); } else nsStreak = 0;
        if (o.kind === 'cache' && o.stale) api.goal('stale');
        if (fp && fpPending) { fpPending = false; if (o.kind === '200' && o.version === server.version) { api.goal('fingerprint'); log.add('Because the **name changed**, the browser had never seen this URL, so it fetched the new file. Nothing stale, even with a one-year max-age. ✓', 'good'); } }
      }
      function render() {
        const hdr = M.effective(cfg, fp);
        KS.clear(hdrEl);
        hdrEl.appendChild(h('div', 'GET /' + M.urlFor(fp, server.version) + '   (file version ' + server.version + ')'));
        hdrEl.appendChild(h('div', M.headerText(hdr)));
        hdrEl.appendChild(h('div', hdr.etag ? 'ETag: ' + M.etagFor(server.version) : 'ETag: (none)'));
        if (fp) hdrEl.appendChild(h('div.muted.small', 'Fingerprint mode overrides the settings above.'));
        clockEl.textContent = '🕐 ' + M.fmtDur(now);
        sReq.set(stats.req); sCache.set(stats.cache); s304.set(stats.n304); s200.set(stats.n200); sBytes.set(M.fmtBytes(stats.bytes));
        nBrowser.setSub(cache.size + (cache.size === 1 ? ' file cached' : ' files cached'));
        nServer.setSub('file v' + server.version);
        if (lastOut) resultEl.textContent = { cache: '⚡ From cache · 0 bytes · no network', '304': '↩ 304 Not Modified · ' + M.fmtBytes(lastOut.bytes), '200': '⬇ 200 OK · ' + M.fmtBytes(lastOut.bytes) + ' downloaded' }[lastOut.kind] + (lastOut.stale ? ' · ⚠ STALE (old v' + lastOut.version + ')' : '');
        KS.clear(tbody);
        if (!cache.size) tbody.appendChild(h('tr.dim', h('td', { colspan: '3' }, 'Nothing cached.')));
        cache.forEach(e => {
          let st;
          if (e.cc === 'no-cache') st = 'must ask the server every time';
          else if (M.fresh(e, now)) st = 'fresh for ' + M.fmtDur(e.maxAge - (now - e.storedAt)) + ' more';
          else st = 'expired' + (e.etag ? ' (can revalidate)' : ' (no ETag)');
          tbody.appendChild(h('tr' + (e.version !== server.version ? '.bad' : ''), h('td', e.url), h('td', 'v' + e.version + (e.version !== server.version ? ' (old)' : '')), h('td', st + (e.etag ? ' · ETag ' + e.etag : ''))));
        });
      }

      log.add('Try it: leave **max-age=60** on and press **Request the file** twice.', 'info');
      render();
      return () => stage.destroy();
    }
  });
})();
