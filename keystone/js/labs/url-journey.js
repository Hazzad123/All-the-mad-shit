/* Lab: url-journey — what really happens between pressing Enter and seeing a page, and which steps can be skipped. */
(function () {
  // <model>
  function parseURL(raw) {
    let s = String(raw == null ? '' : raw).trim();
    if (!s) return { error: 'Type a web address first.' };
    let scheme = 'https', implied = true;
    const m = s.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/);
    if (m) { scheme = m[1].toLowerCase(); s = m[2]; implied = false; }
    if (scheme !== 'http' && scheme !== 'https') return { error: 'This lab only knows http:// and https:// addresses.' };
    let hash = '', query = '', path = '/';
    const hi = s.indexOf('#'); if (hi >= 0) { hash = s.slice(hi); s = s.slice(0, hi); }
    const qi = s.indexOf('?'); if (qi >= 0) { query = s.slice(qi); s = s.slice(0, qi); }
    let auth = s; const si = s.indexOf('/'); if (si >= 0) { path = s.slice(si); auth = s.slice(0, si); }
    if (auth.indexOf('@') >= 0) auth = auth.slice(auth.lastIndexOf('@') + 1);
    let host = auth, portTxt = '';
    const pm = auth.match(/^(.*):(\d*)$/); if (pm) { host = pm[1]; portTxt = pm[2]; }
    host = host.toLowerCase();
    if (!host || !/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(host) || host.indexOf('..') >= 0) return { error: 'That does not look like a valid host name (try shop.example.com).' };
    const def = scheme === 'https' ? 443 : 80;
    let port = def;
    if (portTxt !== '') { port = parseInt(portTxt, 10); if (!(port >= 1 && port <= 65535)) return { error: 'The port must be a number from 1 to 65535.' }; }
    const ipm = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    const isIP = !!ipm && ipm.slice(1).every(function (x) { return +x <= 255; });
    return { scheme: scheme, host: host, port: port, portExplicit: portTxt !== '' && port !== def, defaultPort: def, path: path, query: query, hash: hash, isIP: isIP, implied: implied };
  }
  function fakeIP(host) {
    if (host === 'localhost') return '127.0.0.1';
    let x = 2166136261;
    for (let i = 0; i < host.length; i++) x = Math.imul(x ^ host.charCodeAt(i), 16777619) >>> 0;
    return [34 + ((x & 255) % 60), (x >>> 8) & 255, (x >>> 16) & 255, ((x >>> 24) % 250) + 2].join('.');
  }
  // Each stage: {id, icon, name, ms, skipped, text, data}. Plain http has no TLS stage at all.
  function buildStages(p, o) {
    const https = p.scheme === 'https', ip = fakeIP(p.host), RTT = 30;
    const hostHdr = p.host + (p.portExplicit ? ':' + p.port : '');
    const target = p.path + p.query;
    const st = [];
    st.push({ id: 'parse', icon: '✂️', name: 'Parse the URL', ms: 1, text: 'The browser splits the address into parts. Only the **host** is used to find the server; the **path** and **query** are sent to it; the **#fragment** never leaves your browser.',
      data: 'scheme:    ' + p.scheme + (p.implied ? '   (you left it out, so https is assumed)' : '') + '\nhost:      ' + p.host + '\nport:      ' + p.port + (p.portExplicit ? '' : '   (default for ' + p.scheme + ')') + '\npath:      ' + p.path + '\nquery:     ' + (p.query || '(none)') + '\nfragment:  ' + (p.hash || '(none)') });
    const dnsSkip = o.dnsCached || p.isIP;
    st.push({ id: 'dns', icon: '📒', name: 'DNS lookup', ms: dnsSkip ? 0 : 45, skipped: dnsSkip,
      text: p.isIP ? 'The address is already an IP address, so there is **no name to look up**.' : (o.dnsCached ? 'The browser already remembers this name from a recent visit, so **no network trip is needed**.' : 'Computers talk to numbers, not names. The browser asks a DNS resolver "what is the IP address of **' + p.host + '**?" and waits for the answer.'),
      data: dnsSkip ? (p.isIP ? 'host is an IP literal: ' + p.host : 'cache hit: ' + p.host + ' -> ' + ip + '   (no query sent)') : 'question: A record for ' + p.host + '?\nanswer:   ' + p.host + ' -> ' + ip + '   (TTL 300 s)' });
    st.push({ id: 'tcp', icon: '🤝', name: 'TCP handshake', ms: o.keepAlive ? 0 : RTT, skipped: o.keepAlive,
      text: o.keepAlive ? 'A connection to this server is **still open** from before ("keep-alive"), so the browser reuses it. No handshake.' : 'Before sending anything, both sides agree to talk reliably. Three tiny messages cost **one round trip** (about ' + RTT + ' ms here).',
      data: o.keepAlive ? 'connection to ' + ip + ':' + p.port + ' already ESTABLISHED (reused)' : 'you    -> ' + ip + ':' + p.port + '   SYN       "can we talk?"\nserver -> you                SYN-ACK   "yes, can you hear me?"\nyou    -> server             ACK       "loud and clear"' });
    if (https) st.push({ id: 'tls', icon: '🔐', name: 'TLS handshake', ms: o.keepAlive ? 0 : 2 * RTT, skipped: o.keepAlive,
      text: o.keepAlive ? 'The reused connection is **already encrypted**, so there is nothing to negotiate.' : 'The server shows a **certificate** to prove it really is ' + p.host + ', and both sides agree on a secret key. From here on everything is scrambled so eavesdroppers see noise. Costs about two round trips.',
      data: o.keepAlive ? 'TLS session already established' : 'ClientHello  -> versions, ciphers\nServerHello  <- chosen cipher\nCertificate  <- subject: CN=' + p.host + '\n                issuer:  Example Trust CA\n                valid:   2026-01-01 to 2026-12-31\nKey exchange -> shared secret agreed\nFinished     <-> encrypted from now on' });
    st.push({ id: 'req', icon: '📤', name: 'HTTP request', ms: Math.round(RTT / 2), text: 'The browser finally asks for the page, in plain text' + (https ? ' (scrambled by TLS on the wire)' : ' that anyone on the network path could read') + '.',
      data: 'GET ' + target + ' HTTP/1.1\nHost: ' + hostHdr + '\nAccept: text/html\nConnection: keep-alive' });
    st.push({ id: 'srv', icon: '⚙️', name: 'Server works', ms: 80, text: 'The server runs your code: checks the path, asks the database, builds the HTML. This is often the slowest part you control.', data: 'route:  ' + p.path + '\ndb:     3 queries\nbuilt:  18 342 bytes of HTML' });
    st.push({ id: 'res', icon: '📥', name: 'HTTP response', ms: Math.round(RTT / 2) + 10, text: 'The server answers with a **status code** and the page itself.', data: 'HTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\nContent-Length: 18342\n\n<!doctype html>\n<html> <head> <link rel="stylesheet" href="/style.css"> ...' });
    st.push({ id: 'html', icon: '🧩', name: 'Parse the HTML', ms: 20, text: 'The browser reads the HTML top to bottom and builds a tree of elements. It spots files it still needs.', data: 'found: /style.css  (stylesheet)\nfound: /app.js     (script)\nfound: /logo.png   (image)' });
    st.push({ id: 'sub', icon: '🖼️', name: 'Fetch CSS, JS, images', ms: o.keepAlive ? 90 : 130, text: o.keepAlive ? 'The three files are fetched over the **connection that is already open**.' : 'The browser fetches the extra files. Without a reusable connection it has to open **new ones** (more handshakes), which costs extra.',
      data: 'GET /style.css  -> 200 (4 KB)\nGET /app.js     -> 200 (62 KB)\nGET /logo.png   -> 200 (9 KB)' });
    st.push({ id: 'ren', icon: '🎨', name: 'Render the page', ms: 30, text: 'Layout, colours, paint. **The page appears!**', data: 'layout -> paint -> composite\nfirst pixels on screen' });
    return st;
  }
  // </model>

  const PALETTE = ['--accent', '--accent-2', '--info', '--good', '--warn'];

  KS.labs.register({
    id: 'url-journey',
    title: 'What Happens on Enter',
    emoji: '🧭',
    blurb: 'Step through everything your browser does between pressing Enter and seeing a page, and see which steps can be skipped.',
    tags: ['http', 'dns', 'tcp', 'tls', 'browser', 'latency'],
    goals: [
      { id: 'full', text: 'Step through **every stage** of an https visit' },
      { id: 'repeat', text: 'Revisit with **DNS cached** and the connection **kept alive**, and watch the total drop' },
      { id: 'plain', text: 'Switch to **plain http** and spot which step disappears' }
    ],
    help: `You type an address and press Enter. The coloured list is the **journey** the browser takes, one **stage** at a time. Tap *Next step* to advance, or *Play all*. Tap any finished stage to see the real data it exchanged.

The bar shows where the time went (all numbers are rough, for a server about 30 ms away).

- **DNS** turns a name into an IP address.
- **TCP** and **TLS** are handshakes: they set up a reliable, encrypted pipe before anything useful is sent.
- Then comes the actual **HTTP** request and response, and finally the browser fetches extra files and draws the page.

The toggles are shortcuts the real web uses all the time: a remembered DNS answer and a connection that stays open both skip steps. Plain http has no TLS step at all, which is faster, but nothing is private.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      let url = 'https://shop.example.com/products', dnsCached = false, keepAlive = false;
      let parsed = null, stages = [], idx = 0, sel = 0, run = 0, playing = false, visits = 0;

      const urlIn = ui.input('Web address', url, v => { url = v; settingsChanged(false); }, { inputmode: 'url', class: 'mono' });
      const dnsT = ui.toggle('DNS already cached', false, v => { dnsCached = v; settingsChanged(true); });
      const keepT = ui.toggle('Connection kept alive', false, v => { keepAlive = v; settingsChanged(true); });
      const plainT = ui.toggle('Plain http (no TLS)', false, v => {
        let rest = url.trim().replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
        if (!rest) rest = 'shop.example.com/products';
        url = (v ? 'http://' : 'https://') + rest; urlIn.set(url); settingsChanged(true);
      });
      const nextBtn = ui.btn('Next step ▶', () => onNext(), 'primary');
      const playBtn = ui.btn('⏩ Play all', () => play());
      const resetBtn = ui.btn('↺ Start over', () => { settingsChanged(true); });
      const errBox = h('div.lab-note.tn-bad', { style: { display: 'none' } });
      const bar = h('div', { style: { display: 'flex', height: '22px', borderRadius: '8px', overflow: 'hidden', background: 'var(--panel-3)', border: '1px solid var(--line)' } });
      const statTime = ui.stat('time so far', '0 ms', 'accent'), statSaved = ui.stat('saved by shortcuts', '0 ms', 'good'), statSteps = ui.stat('stages done', '0');
      const listEl = h('div', { style: { display: 'grid', gap: '6px' } });
      const detailEl = h('div');
      const log = ui.log(40);

      root.appendChild(ui.panel('Your visit',
        urlIn,
        ui.row(dnsT, keepT, plainT),
        ui.row(nextBtn, playBtn, resetBtn),
        errBox));
      root.appendChild(ui.panel('Where the time goes', bar, h('div', { style: { height: '10px' } }), ui.stats(statTime, statSaved, statSteps)));
      root.appendChild(h('div.lab-grid2', ui.panel('The journey (tap a stage)', listEl), h('div.lab-stack', ui.panel('Stage details', detailEl), ui.panel('What just happened', log.el))));

      // ---------- model glue ----------
      function opts() { return { dnsCached: dnsCached, keepAlive: keepAlive }; }
      function total(list, n) { let t = 0; for (let i = 0; i < n && i < list.length; i++) t += list[i].ms; return t; }
      function rebuild() {
        parsed = parseURL(url);
        if (parsed.error) { stages = []; } else stages = buildStages(parsed, opts());
        idx = 0; sel = 0;
      }
      function settingsChanged(announce) {
        run++; playing = false; rebuild(); render();
        if (announce && parsed && !parsed.error) log.add('New visit ready: **' + parsed.scheme + '://' + parsed.host + '** (' + stages.filter(s => s.skipped).length + ' stage(s) skippable with your settings).', 'info');
      }
      function onNext() {
        if (playing) return;
        if (!stages.length) { log.add(parsed && parsed.error ? parsed.error : 'Nothing to do yet.', 'warn'); return; }
        if (idx >= stages.length) { settingsChanged(true); return; }
        advance();
      }
      function advance() {
        const s = stages[idx]; if (!s) return;
        idx++; sel = idx - 1;
        if (s.skipped) log.add(s.icon + ' **' + s.name + '** skipped (0 ms). ' + s.text, 'good');
        else log.add(s.icon + ' **' + s.name + '** took about ' + s.ms + ' ms. ' + s.text, 'info');
        if (idx >= stages.length) finish();
        render();
      }
      async function play() {
        if (playing) return;
        if (!stages.length) { log.add(parsed && parsed.error ? parsed.error : 'Nothing to do yet.', 'warn'); return; }
        if (idx >= stages.length) rebuild();
        const my = ++run; playing = true; render();
        while (idx < stages.length) {
          advance();
          await api.sleep(650);
          if (!api.alive() || my !== run) return;
        }
        playing = false; render();
      }
      function finish() {
        visits++;
        const t = total(stages, stages.length);
        const cold = total(buildStages(parsed, { dnsCached: false, keepAlive: false }), 99);
        const hasTls = stages.some(s => s.id === 'tls');
        log.add('🎉 Page loaded in about **' + t + ' ms**.' + (t < cold ? ' A cold visit would have taken ' + cold + ' ms, so you saved ' + (cold - t) + ' ms.' : ''), 'good');
        if (!hasTls) log.add('Notice: there was **no TLS step**. It is quicker, but the request and page travelled as readable text.', 'warn');
        if (parsed.scheme === 'https') {
          api.goal('full');
          if (visits >= 2 && dnsCached && keepAlive && t < cold) api.goal('repeat');
        } else api.goal('plain');
      }

      // ---------- render ----------
      function render() {
        const bad = !!(parsed && parsed.error);
        errBox.style.display = bad ? '' : 'none'; errBox.textContent = bad ? parsed.error : '';
        plainT.set(!!(parsed && !parsed.error && parsed.scheme === 'http'));
        nextBtn.disabled = playing || !stages.length;
        nextBtn.textContent = idx >= stages.length && stages.length ? '↺ Visit again' : 'Next step ▶';
        playBtn.disabled = playing || !stages.length;
        playBtn.textContent = playing ? '… playing' : '⏩ Play all';
        // timeline bar
        KS.clear(bar);
        const ref = parsed && !parsed.error ? total(buildStages(Object.assign({}, parsed, { scheme: 'https' }), { dnsCached: false, keepAlive: false }), 99) : 1;
        stages.forEach((s, i) => {
          if (i >= idx || s.ms <= 0) return;
          bar.appendChild(h('div', { title: s.name + ' ' + s.ms + ' ms', style: { width: (s.ms / ref * 100) + '%', background: 'var(' + PALETTE[i % PALETTE.length] + ')', borderRight: '1px solid var(--bg-2)' } }));
        });
        const t = total(stages, idx);
        const coldDone = stages.length ? total(buildStages(parsed, { dnsCached: false, keepAlive: false }), idx) : 0;
        statTime.set(t + ' ms'); statSaved.set(Math.max(0, coldDone - t) + ' ms'); statSteps.set(idx + ' / ' + stages.length);
        // list
        KS.clear(listEl);
        stages.forEach((s, i) => {
          const done = i < idx, next = i === idx;
          const right = done ? (s.skipped ? 'skipped' : s.ms + ' ms') : (next ? 'next' : '');
          const b = h('button.btn.ghost', { type: 'button', 'aria-label': s.name, onclick: () => { sel = i; render(); },
            style: { justifyContent: 'space-between', textAlign: 'left', width: '100%', minHeight: '44px', padding: '8px 12px', borderRadius: '11px', color: done ? 'var(--text)' : 'var(--muted)', opacity: done || next ? '1' : '.65',
              border: '2px solid ' + (i === sel ? 'var(--accent)' : (next ? 'var(--line-2)' : 'var(--line)')), background: done ? (s.skipped ? 'var(--panel-2)' : 'var(--good-soft)') : 'transparent', textDecoration: done && s.skipped ? 'line-through' : 'none' } },
            h('span', s.icon + ' ' + (i + 1) + '. ' + s.name), h('span.lab-chip' + (done && !s.skipped ? '.tn-good' : (next ? '.tn-accent' : '')), right || '·'));
          listEl.appendChild(b);
        });
        if (!stages.length) listEl.appendChild(h('p.muted.small', 'Fix the address above to see the journey.'));
        // details
        KS.clear(detailEl);
        const s = stages[sel];
        if (s) {
          detailEl.appendChild(h('div.lab-big', { style: { fontSize: '1.15rem' } }, s.icon + ' ' + s.name));
          detailEl.appendChild(h('p', { html: KS.md.inline(s.text) }));
          if (sel < idx) detailEl.appendChild(ui.code(s.data, 'text', { title: 'the real data' }));
          else detailEl.appendChild(h('p.muted.small', 'Take this step to see the data it exchanges.'));
        } else detailEl.appendChild(h('p.muted.small', 'Nothing to show yet.'));
      }

      rebuild(); render();
      log.add('Press **Next step** to start the journey for ' + (parsed && !parsed.error ? '**' + parsed.host + '**' : 'your address') + '.', 'dim');
    }
  });
})();
