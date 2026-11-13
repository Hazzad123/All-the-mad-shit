/* Lab: cors-lab — the browser, not the server, enforces the same-origin rule; the server's headers switch it off selectively. */
(function () {
  // <pure>
  const ORIGIN = 'https://shop.example', API = 'https://api.bank.example', PATH = '/account';
  const SAFE_CT = ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data'];
  const SAFE_METHODS = ['GET', 'HEAD', 'POST'];
  /** req: { method, ct: ''|type, auth: bool, creds: bool, sameOrigin: bool } */
  function extraHeaders(req) {
    const hs = []; if (req.auth) hs.push('authorization');
    if (req.ct && SAFE_CT.indexOf(req.ct) < 0) hs.push('content-type');
    return hs;
  }
  function needsPreflight(req) {
    const why = [];
    if (SAFE_METHODS.indexOf(req.method) < 0) why.push('the method ' + req.method + ' is not GET, HEAD or POST');
    if (req.auth) why.push('an Authorization header is not allowed on "simple" requests');
    if (req.ct && SAFE_CT.indexOf(req.ct) < 0) why.push('the Content-Type ' + req.ct + ' is not one of the three simple types');
    return { need: why.length > 0, why: why };
  }
  function acaoValue(srv) { return { none: null, '*': '*', shop: ORIGIN, evil: 'https://evil.example' }[srv.acao]; }
  /** Browser's check of the Access-Control-Allow-* headers on a response. null = passes. */
  function checkOrigin(req, srv) {
    const v = acaoValue(srv);
    if (v === null) return { reason: 'no-acao', msg: "No 'Access-Control-Allow-Origin' header is present on the requested resource." };
    if (req.creds && v === '*') return { reason: 'wildcard-creds', msg: "The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'." };
    if (v !== '*' && v !== ORIGIN) return { reason: 'origin-mismatch', msg: "The 'Access-Control-Allow-Origin' header has a value '" + v + "' that is not equal to the supplied origin." };
    if (req.creds && !srv.credentials) return { reason: 'no-creds', msg: "The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'." };
    return null;
  }
  function respHeaders(srv, pre) {
    const hs = []; const v = acaoValue(srv);
    if (v !== null) hs.push('Access-Control-Allow-Origin: ' + v);
    if (srv.credentials) hs.push('Access-Control-Allow-Credentials: true');
    if (pre && srv.methods.length) hs.push('Access-Control-Allow-Methods: ' + srv.methods.join(', '));
    if (pre && srv.headers.length) hs.push('Access-Control-Allow-Headers: ' + srv.headers.join(', '));
    return hs;
  }
  function reqLines(req, method) {
    const l = [method + ' ' + PATH, 'Host: api.bank.example', 'Origin: ' + ORIGIN];
    if (req.auth && method !== 'OPTIONS') l.push('Authorization: Bearer eyJ…');
    if (req.ct && method !== 'OPTIONS') l.push('Content-Type: ' + req.ct);
    if (req.creds && method !== 'OPTIONS') l.push('Cookie: session=abc123');
    return l;
  }
  /** Full browser decision. srv: { acao: 'none'|'*'|'shop'|'evil', methods: ['PUT',..], headers: ['authorization',..], credentials: bool } */
  function corsDecide(req, srv) {
    const steps = [];
    const body = req.creds ? '{"balance": 1200}' : '{"error": "not logged in"}';
    if (req.sameOrigin) {
      steps.push({ dir: 'req', title: req.method + ' ' + PATH + ' (same origin)', lines: reqLines({ method: req.method, ct: req.ct, auth: req.auth, creds: true }, req.method).filter(function (x) { return x.indexOf('Origin:') < 0; }) });
      steps.push({ dir: 'res', title: '200 OK', lines: ['{"balance": 1200}'] });
      return { sameOrigin: true, preflight: false, steps: steps, actualSent: true, allowed: true, reason: 'same-origin', console: '' };
    }
    const pf = needsPreflight(req);
    const consoleMsg = function (c, pre) {
      return "Access to fetch at '" + API + PATH + "' from origin '" + ORIGIN + "' has been blocked by CORS policy: " + (pre ? "Response to preflight request doesn't pass access control check: " : '') + c.msg;
    };
    if (pf.need) {
      const ex = extraHeaders(req);
      const rq = ['OPTIONS ' + PATH, 'Host: api.bank.example', 'Origin: ' + ORIGIN, 'Access-Control-Request-Method: ' + req.method];
      if (ex.length) rq.push('Access-Control-Request-Headers: ' + ex.join(', '));
      steps.push({ dir: 'req', title: 'Preflight: OPTIONS (browser asks permission first)', lines: rq });
      steps.push({ dir: 'res', title: 'Preflight answer: 204', lines: ['204 No Content'].concat(respHeaders(srv, true)) });
      let bad = checkOrigin(req, srv);
      if (!bad && SAFE_METHODS.indexOf(req.method) < 0 && srv.methods.indexOf(req.method) < 0) bad = { reason: 'method', msg: 'Method ' + req.method + ' is not allowed by Access-Control-Allow-Methods in preflight response.' };
      if (!bad) { const miss = ex.filter(function (x) { return srv.headers.indexOf(x) < 0; }); if (miss.length) bad = { reason: 'headers', msg: 'Request header field ' + miss[0] + ' is not allowed by Access-Control-Allow-Headers in preflight response.' }; }
      if (bad) return { sameOrigin: false, preflight: true, steps: steps, actualSent: false, allowed: false, reason: bad.reason, console: consoleMsg(bad, true) };
    }
    steps.push({ dir: 'req', title: (pf.need ? 'The real request: ' : 'Simple request: ') + req.method + ' ' + PATH, lines: reqLines(req, req.method) });
    steps.push({ dir: 'res', title: '200 OK (the server did the work)', lines: ['200 OK'].concat(respHeaders(srv, false), [body]) });
    const bad2 = checkOrigin(req, srv);
    if (bad2) return { sameOrigin: false, preflight: pf.need, steps: steps, actualSent: true, allowed: false, reason: bad2.reason, console: consoleMsg(bad2, false) + (bad2.reason === 'no-acao' ? " If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled." : '') };
    return { sameOrigin: false, preflight: pf.need, steps: steps, actualSent: true, allowed: true, reason: 'ok', console: '', body: body };
  }
  // </pure>

  KS.labs.register({
    id: 'cors-lab',
    title: 'CORS Lab',
    emoji: '🚧',
    blurb: 'A shop page calls a bank API on another site. Flip request and server settings and see when the browser lets the page read the answer.',
    tags: ['cors', 'browser', 'same-origin policy', 'preflight', 'security', 'headers'],
    goals: [
      { id: 'blocked', text: 'Get **blocked** because the server sends no Allow-Origin header' },
      { id: 'allow', text: 'Fix it by allowing the **shop\'s origin**' },
      { id: 'preflight', text: 'Trigger a **preflight** and make it pass' },
      { id: 'creds', text: 'Try **\\*** together with **cookies** and see it refused' }
    ],
    help: `The page at **https://shop.example** runs JavaScript that calls **https://api.bank.example**. Different site = different *origin*, so the browser applies the **same-origin policy**: the page may send the request, but it may only **read the answer** if the server says so with \`Access-Control-Allow-*\` headers.

**The browser enforces this, not the server.** The server usually receives the request either way.

A **simple** request (GET/POST with a plain content type and no custom headers) is sent straight away and the headers are checked on the reply. Anything else (PUT, DELETE, JSON, an Authorization header) triggers a **preflight**: a first \`OPTIONS\` request asking permission. If the preflight fails, the real request is never sent.

With cookies included, \`*\` is not allowed: the server must name the exact origin and add \`Allow-Credentials: true\`.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const req = { method: 'GET', ct: '', auth: false, creds: false, sameOrigin: false };
      const srv = { acao: 'none', methods: [], headers: [], credentials: false };
      let busy = false, seenNoAcao = false;
      const toggleIn = (arr, v, on) => { const i = arr.indexOf(v); if (on && i < 0) arr.push(v); if (!on && i >= 0) arr.splice(i, 1); };
      const code = x => '`' + String(x).replace(/`/g, "'").replace(/\n/g, ' ') + '`';

      // ---------- stage ----------
      const browser = ui.node('Browser', '🌐', { tone: 'accent', sub: 'page: shop.example' });
      const server = ui.node('API server', '🏦', { sub: 'api.bank.example' });
      const stage = ui.stage();
      stage.el.appendChild(ui.cols([browser], [server]));
      stage.wire(browser, server, { dashed: true });
      const log = ui.log(50); const L = (t, tone) => log.add(t, tone);
      const flow = h('div.lab-stack');
      const verdict = h('div');
      const pfNote = h('div.muted.small');
      const mono = { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '6px 0 0', fontSize: '.78rem' };

      // ---------- controls ----------
      const upd = () => {
        KS.clear(pfNote);
        if (req.sameOrigin) { pfNote.textContent = 'Same origin: CORS does not apply at all.'; return; }
        const pf = needsPreflight(req);
        pfNote.textContent = pf.need ? 'Needs a preflight because ' + pf.why.join(' and ') + '.' : 'A simple request: sent straight away, no preflight.';
      };
      const ctl = (f) => (v) => { f(v); upd(); };
      const reqPanel = ui.panel('1. The page\'s request',
        ui.row(ui.select('Method', ['GET', 'POST', 'PUT', 'DELETE'], 'GET', ctl(v => { req.method = v; })),
          ui.select('Content-Type', [['', 'none (no body)'], ['text/plain', 'text/plain'], ['application/x-www-form-urlencoded', 'form (urlencoded)'], ['application/json', 'application/json']], '', ctl(v => { req.ct = v; }))),
        ui.row(ui.toggle('Authorization header', false, ctl(v => { req.auth = v; })), ui.toggle('Send cookies', false, ctl(v => { req.creds = v; }))),
        ui.toggle('Same origin (page lives on api.bank.example)', false, ctl(v => { req.sameOrigin = v; })), pfNote);
      const srvPanel = ui.panel('2. The server\'s answer headers',
        ui.select('Access-Control-Allow-Origin', [['none', '(header not sent)'], ['*', '*'], ['shop', 'https://shop.example'], ['evil', 'https://evil.example']], 'none', v => { srv.acao = v; }),
        ui.row(ui.toggle('Allow-Methods: PUT', false, v => toggleIn(srv.methods, 'PUT', v)), ui.toggle('Allow-Methods: DELETE', false, v => toggleIn(srv.methods, 'DELETE', v))),
        ui.row(ui.toggle('Allow-Headers: Authorization', false, v => toggleIn(srv.headers, 'authorization', v)), ui.toggle('Allow-Headers: Content-Type', false, v => toggleIn(srv.headers, 'content-type', v))),
        ui.toggle('Allow-Credentials: true', false, v => { srv.credentials = v; }));
      const sendBtn = ui.btn('Send request', send, 'primary');
      root.appendChild(h('div.lab-grid2.even', reqPanel, srvPanel));
      root.appendChild(ui.row(sendBtn));
      root.appendChild(stage.el);
      root.appendChild(h('div.lab-grid2', ui.panel('The exchange, step by step', flow, verdict), ui.panel('What just happened', log.el)));

      function card(step) {
        const out = step.dir === 'res';
        return h('div', { style: { border: '1px solid var(--line)', borderLeft: '4px solid ' + (out ? 'var(--info)' : 'var(--accent)'), borderRadius: '10px', padding: '8px 10px' } },
          h('b', (out ? '⬅ ' : '➡ ') + step.title), h('pre.lab-mono', { style: mono }, step.lines.join('\n')));
      }
      async function send() {
        if (busy) return; busy = true; sendBtn.disabled = true;
        try {
          const r = corsDecide(req, srv);
          KS.clear(flow); KS.clear(verdict);
          for (const st of r.steps) {
            const out = st.dir === 'res';
            const label = out ? 'reply' : st.title.indexOf('Preflight') === 0 ? 'OPTIONS' : req.method;
            await stage.send(out ? server : browser, out ? browser : server, { label, ms: 330, tone: out ? 'good' : undefined });
            if (!api.alive()) return;
            if (!out) server.pulse();
            flow.appendChild(card(st));
          }
          if (r.sameOrigin) {
            verdict.appendChild(ui.note('✅ **Same origin.** The browser never applies CORS to a page talking to its own site.', 'good'));
            L('Same-origin request → the page reads the answer. None of the CORS headers mattered.', 'good'); return;
          }
          if (r.preflight) L('The request is not "simple" (' + needsPreflight(req).why.join('; ') + '), so the browser sent a **preflight** ' + code('OPTIONS') + ' first.', 'info');
          if (r.allowed) {
            verdict.appendChild(ui.note('✅ **Allowed.** The browser lets the page read the response: ' + code(r.body), 'good'));
            L('Browser: headers say ' + code(ORIGIN) + ' may read this → **allowed**.', 'good'); browser.pulse('good');
            if (r.preflight) api.goal('preflight');
            if (seenNoAcao && srv.acao === 'shop') api.goal('allow');
          } else {
            verdict.appendChild(ui.note('⛔ **Blocked by the browser.** Console says:\n\n' + code(r.console), 'warn'));
            browser.pulse('bad');
            if (r.actualSent) {
              verdict.appendChild(ui.note('⚠ **The server already received and handled this request** (it may even have moved money). CORS only stopped the page from *reading* the reply.', 'bad'));
              L('Blocked, but the server **did** get the request and answered. The browser just hid the answer from the page.', 'bad');
            } else L('Blocked at the **preflight**: the real request was never sent, so the server never ran it.', 'warn');
            if (r.reason === 'no-acao') { seenNoAcao = true; L('Reason: the server sent **no Access-Control-Allow-Origin** header. Choose the shop\'s origin in the server settings.', 'warn'); api.goal('blocked'); }
            else if (r.reason === 'wildcard-creds') { L('Reason: ' + code('*') + ' is **not allowed when cookies are included**. A wildcard would let any site act as the logged-in user. Name the exact origin and add Allow-Credentials.', 'warn'); api.goal('creds'); }
            else if (r.reason === 'origin-mismatch') L('Reason: the server only allows a **different origin** than the page\'s.', 'warn');
            else if (r.reason === 'no-creds') L('Reason: the page sent cookies, so the server must also send ' + code('Access-Control-Allow-Credentials: true') + '.', 'warn');
            else if (r.reason === 'method') L('Reason: the preflight did not list ' + code(req.method) + ' in **Allow-Methods**.', 'warn');
            else if (r.reason === 'headers') L('Reason: the preflight did not list the request\'s headers in **Allow-Headers**.', 'warn');
          }
        } finally { busy = false; sendBtn.disabled = false; }
      }

      upd();
      L('Welcome. Press **Send request** with the defaults and see what the browser does.', 'dim');
      return () => stage.destroy();
    }
  });
})();
