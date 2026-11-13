/* Lab: oauth-flow — the app gets a limited key to your data and never sees your password (authorization code flow + PKCE). */
(function () {
  // <pure>
  const enc = new TextEncoder();
  function b64u(bytes) { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function randomB64u(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return b64u(a); }
  /** PKCE S256: BASE64URL(SHA-256(ASCII(code_verifier))) */
  async function pkceChallenge(verifier) { return b64u(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(verifier)))); }
  function fmtUrl(base, params) { return base + '\n' + Object.keys(params).map(function (k, i) { return '  ' + (i ? '&' : '?') + k + '=' + params[k]; }).join('\n'); }
  function newAS() { return { codes: {}, access: {}, refresh: {} }; }
  function issue(as, scope, now, refreshToken) {
    const at = 'at_' + randomB64u(9); const rt = refreshToken || ('rt_' + randomB64u(9));
    as.access[at] = { scope: scope, exp: now + 600 }; as.refresh[rt] = { scope: scope };
    return { status: 200, body: { access_token: at, token_type: 'Bearer', expires_in: 600, refresh_token: rt, scope: scope } };
  }
  function bad(error, desc, extra) { return Object.assign({ status: 400, error: error, desc: desc }, extra || {}); }
  /** Accounts server: POST /token with grant_type=authorization_code */
  async function exchangeCode(as, req, now) {
    const c = as.codes[req.code];
    if (req.grant_type !== 'authorization_code') return bad('unsupported_grant_type', 'grant_type must be authorization_code');
    if (!c) return bad('invalid_grant', 'that code does not exist');
    if (c.used) return bad('invalid_grant', 'that code was already used (codes are single-use)');
    if (now >= c.exp) return bad('invalid_grant', 'that code has expired (codes live about a minute)');
    if (req.client_id !== c.client_id || req.redirect_uri !== c.redirect_uri) return bad('invalid_grant', 'client_id or redirect_uri differs from the authorization request');
    if (c.challenge) {
      if (!req.code_verifier) return bad('invalid_grant', 'no code_verifier sent, so the server cannot check it against the code_challenge', { computed: null });
      const ch = await pkceChallenge(req.code_verifier);
      if (ch !== c.challenge) return bad('invalid_grant', 'SHA-256 of the code_verifier does not equal the code_challenge', { computed: ch });
    }
    c.used = true; return issue(as, c.scope, now);
  }
  /** Accounts server: POST /token with grant_type=refresh_token */
  function refreshGrant(as, req, now) {
    if (req.grant_type !== 'refresh_token') return bad('unsupported_grant_type', 'grant_type must be refresh_token');
    const r = as.refresh[req.refresh_token];
    if (!r) return bad('invalid_grant', 'unknown refresh token');
    return issue(as, r.scope, now, req.refresh_token);
  }
  /** Photos API: checks the bearer token and the scope the call needs */
  function apiCall(as, method, path, bearer, now) {
    if (!bearer) return { status: 401, error: 'invalid_request', desc: 'no Authorization header' };
    const t = as.access[bearer];
    if (!t) return { status: 401, error: 'invalid_token', desc: 'the access token is not recognised' };
    if (now >= t.exp) return { status: 401, error: 'invalid_token', desc: 'the access token has expired', expired: true };
    const needed = method === 'GET' ? 'photos.read' : 'photos.write';
    if (t.scope.split(' ').indexOf(needed) < 0) return { status: 403, error: 'insufficient_scope', desc: 'this call needs ' + needed + ' but the token only grants ' + t.scope };
    return { status: 200, body: method === 'GET' ? ['🌅 sunrise.jpg', '🐱 cat.jpg', '🏔️ hike.jpg'] : { deleted: path } };
  }
  // </pure>

  KS.labs.register({
    id: 'oauth-flow',
    title: 'OAuth Flow',
    emoji: '🔁',
    blurb: 'Let a printing app fetch your photos without ever giving it your password. Make each choice, and see the real redirects and requests.',
    tags: ['oauth', 'authorization', 'pkce', 'tokens', 'authentication', 'scopes'],
    goals: [
      { id: 'password', text: 'Find the **only party that sees your password**' },
      { id: 'flow', text: 'Complete the flow and **fetch the photos**' },
      { id: 'scope', text: 'Try an **out-of-scope** action and get a **403**' },
      { id: 'refresh', text: 'Renew an **expired** access token with the refresh token' }
    ],
    help: `You own photos at **Photos**. **PhotoPrint** wants to print some. Instead of giving PhotoPrint your password, you log in at the **Accounts server** and approve a limited permission (a *scope*). PhotoPrint ends up with an **access token**: a key that opens only what you approved, for a short time.

The steps are **authorization code flow with PKCE**. PhotoPrint sends you to Accounts (\`/authorize\`), you log in and consent, Accounts sends you back with a one-time **code**, and PhotoPrint swaps the code for tokens on a direct server-to-server call. **PKCE** stops a stolen code being useful: PhotoPrint invents a secret \`code_verifier\`, sends only its SHA-256 fingerprint (\`code_challenge\`) at the start, and reveals the secret at the swap. The fingerprint is computed for real here.

Choose the right move at each step. Wrong choices explain why.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const APP = 'https://photoprint.example', AS_URL = 'https://accounts.example', CB = APP + '/callback';
      const as = newAS();
      const s = { step: 0, busy: false, now: 0, verifier: '', challenge: '', state: '', code: '', tok: null, fb: null, wire: '', sawExpired: false, lastWire: '', photos: null };
      const code = x => '`' + String(x).replace(/`/g, "'").replace(/\n/g, ' ') + '`';

      // ---------- stage ----------
      const you = ui.node('You', '🧑', { small: true }), browser = ui.node('Browser', '🌐', { small: true });
      const app = ui.node('PhotoPrint', '🖨️', { tone: 'accent' });
      const acct = ui.node('Accounts', '🔐', { small: true }), photosApi = ui.node('Photos API', '🖼️', { small: true });
      const stage = ui.stage();
      stage.el.appendChild(ui.cols([you, browser], [app], [acct, photosApi]));
      stage.wire(you, browser); stage.wire(browser, app); stage.wire(browser, acct, { dashed: true }); stage.wire(app, acct, { dashed: true }); stage.wire(app, photosApi, { dashed: true });
      const hop = async (a, b, label, tone) => { await stage.send(a, b, { label, tone, ms: 380 }); return api.alive(); };

      const log = ui.log(60); const L = (t, tone) => log.add(t, tone);
      const stepBox = h('div.lab-stack');
      const tokenStat = ui.stat('access token', 'none');
      const wireStyle = { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: 0, padding: '10px 12px', background: 'var(--code-bg)', border: '1px solid var(--code-line)', borderRadius: '12px', fontFamily: 'var(--mono)', fontSize: '.78rem' };

      root.appendChild(stage.el);
      root.appendChild(h('div.lab-grid2', ui.panel('Your move', stepBox), ui.panel('What just happened', log.el, h('div', { style: { marginTop: '10px' } }, ui.stats(tokenStat)))));

      // ---------- the guided steps ----------
      const STEPS = [
        {
          title: 'You tap “Print my photos” in PhotoPrint',
          wire: () => 'Nothing has been sent yet.\nPhotoPrint has no access to your photos.',
          q: 'PhotoPrint needs permission to read your photos at Photos. What should happen?',
          opts: [
            { t: 'PhotoPrint asks you to type your Accounts password into its own page', why: 'Then PhotoPrint knows your password. It could read everything, change your settings, and you could never take back just its access. OAuth exists to avoid exactly this.' },
            { t: 'PhotoPrint sends you to the Accounts server to approve a limited permission', ok: true },
            { t: 'PhotoPrint guesses the Photos API key', why: 'There is no shared key to guess, and guessing is not a plan. Access has to be granted by you, the owner.' }
          ],
          async run() {
            s.verifier = randomB64u(32); s.challenge = await pkceChallenge(s.verifier); s.state = randomB64u(9); if (!api.alive()) return false;
            L('PhotoPrint invents a secret ' + code('code_verifier') + ' (kept private) and a ' + code('state') + ' value, and computes ' + code('code_challenge') + ' = SHA-256 of the verifier. Then it **redirects your browser** to Accounts.', 'info');
            if (!(await hop(app, browser, '302', 'accent')) || !(await hop(browser, acct, 'GET'))) return false;
            return true;
          }
        },
        {
          title: 'Your browser lands on the Accounts login page',
          wire: () => fmtUrl(AS_URL + '/authorize', { response_type: 'code', client_id: 'photoprint', redirect_uri: CB, scope: 'photos.read', state: s.state, code_challenge: s.challenge, code_challenge_method: 'S256' }) + '\n\n(You never see this ugly URL, your browser just follows it.)',
          q: 'You type your username and password on this page. Who gets to see the password?',
          opts: [
            { t: 'Only you and the Accounts server', ok: true },
            { t: 'PhotoPrint as well, since it started the process', why: 'PhotoPrint only redirected you. The login page belongs to Accounts, and the password goes straight to Accounts.' },
            { t: 'PhotoPrint and the Photos API too', why: 'Neither is involved in this page. They only ever receive tokens later, never the password.' }
          ],
          onOk() { api.goal('password'); },
          async run() {
            L('You typed your password into **accounts.example**. PhotoPrint and the Photos API **never saw it**.', 'good');
            return (await hop(you, browser, '🔑')) && (await hop(browser, acct, 'POST'));
          }
        },
        {
          title: 'The consent screen',
          wire: () => 'accounts.example says:\n\n  PhotoPrint wants to:\n   ✔ view your photos  (photos.read)\n   ✘ edit or delete them (not requested)',
          q: 'Accounts shows exactly what PhotoPrint is asking for. What do you do?',
          opts: [
            { t: 'Deny', why: 'Accounts would redirect back with ' + code('error=access_denied') + ' and no code, so PhotoPrint gets nothing. Safe, but then there is no lab. Try Approve.' },
            { t: 'Approve “view my photos”', ok: true }
          ],
          async run() {
            s.code = 'code_' + randomB64u(8);
            as.codes[s.code] = { challenge: s.challenge, client_id: 'photoprint', redirect_uri: CB, scope: 'photos.read', exp: s.now + 60, used: false };
            L('You approved **photos.read** only. Accounts creates a one-time **authorization code** and redirects your browser back to PhotoPrint.', 'info');
            return (await hop(acct, browser, '302', 'accent')) && (await hop(browser, app, 'code'));
          }
        },
        {
          title: 'PhotoPrint receives the redirect',
          wire: () => fmtUrl(CB, { code: s.code, state: s.state }) + '\n\nThe code is short-lived and single-use. On its own it is not a key.',
          q: 'The browser just handed PhotoPrint this URL. What should PhotoPrint check first?',
          opts: [
            { t: 'That ' + code('state') + ' matches the value it sent earlier', ok: true },
            { t: 'Nothing: trust the code and move on', why: 'An attacker could trick your browser into visiting the callback with the attacker\'s code, and your PhotoPrint account would end up linked to their photos. ' + code('state') + ' proves this callback answers a request you started.' },
            { t: 'That the code looks long enough', why: 'Length proves nothing. The only check that ties the callback to your own request is ' + code('state') + '.' }
          ],
          async run() { L(code('state') + ' in the URL equals the one PhotoPrint stored (' + code(s.state) + ') ✓', 'good'); app.pulse('good'); return true; }
        },
        {
          title: 'Swap the code for tokens (server to server)',
          wire: () => 'PhotoPrint now talks to Accounts directly, not through the browser.\nThe code travelled through your browser, so assume somebody could have seen it.',
          q: 'What does PhotoPrint send to ' + 'POST /token' + '?',
          opts: [
            { t: 'Just the code', why: 'LIVE', fail: 'nov' },
            { t: 'The code and the secret code_verifier', ok: true },
            { t: 'The code and your password', why: 'PhotoPrint does not have your password and must never need it. That is the whole point.' }
          ],
          async run() { return true; }
        },
        {
          title: 'Call the Photos API with the access token',
          wire: () => JSON.stringify(s.tok, null, 1),
          q: 'PhotoPrint now holds tokens. How does it ask the Photos API for your photos?',
          opts: [
            { t: 'GET /photos with the header Authorization: Bearer <access_token>', ok: true },
            { t: 'Send your password with every request', why: 'It does not have it (good!). The access token exists so that nobody has to pass the password around.' },
            { t: 'Send the refresh token to the Photos API', why: 'The refresh token is powerful and long-lived. It only ever goes to the Accounts server, never to the API.' }
          ],
          async run() { return true; }
        }
      ];

      // ---------- actions ----------
      async function tokenExchange(withVerifier) {
        const req = { grant_type: 'authorization_code', code: s.code, redirect_uri: CB, client_id: 'photoprint' };
        if (withVerifier) req.code_verifier = s.verifier;
        s.wire = 'POST ' + AS_URL + '/token\n' + Object.keys(req).map(k => '  ' + k + '=' + req[k]).join('\n');
        if (!(await hop(app, acct, 'POST /token'))) return null;
        const res = await exchangeCode(as, req, s.now); if (!api.alive()) return null;
        if (!(await hop(acct, app, String(res.status), res.status === 200 ? 'good' : 'bad'))) return null;
        return res;
      }
      async function choose(i) {
        if (s.busy) return;
        const st = STEPS[s.step]; if (!st) return; const o = st.opts[i];
        s.busy = true; s.fb = null; render();
        try {
          if (o.fail === 'nov') {                          // really run the exchange without the verifier
            const res = await tokenExchange(false); if (!res) return;
            s.fb = { tone: 'bad', text: 'Accounts replied **' + res.status + ' ' + res.error + '**: ' + res.desc + '. Without ' + code('code_verifier') + ', a thief who grabbed the code from the browser gets nothing. That is what PKCE adds.' };
            L('POST /token with the code only → **400 invalid_grant**: ' + res.desc + '.', 'bad'); acct.pulse('bad'); return;
          }
          if (!o.ok) { s.fb = { tone: 'bad', text: o.why }; L('✗ ' + o.t + ' → not quite. ' + o.why, 'bad'); return; }
          if (s.step === 4) {
            const res = await tokenExchange(true); if (!res) return;
            if (res.status !== 200) { s.fb = { tone: 'bad', text: res.desc }; return; }
            s.tok = res.body; acct.pulse('good');
            L('Accounts hashed the ' + code('code_verifier') + ' (SHA-256), got ' + code(s.challenge) + ', which matches the stored ' + code('code_challenge') + ' ✓. Tokens issued: an **access token** (10 min) and a **refresh token**.', 'good');
          } else if (s.step === 5) {
            s.wire = 'GET ' + 'https://photos.example/photos\nAuthorization: Bearer ' + s.tok.access_token;
            if (!(await hop(app, photosApi, 'Bearer'))) return;
            const r = apiCall(as, 'GET', '/photos', s.tok.access_token, s.now);
            if (!(await hop(photosApi, app, String(r.status), 'good'))) return;
            s.photos = r.body; photosApi.pulse('good');
            L('Photos API checked the token and its scope → **200 OK**: ' + r.body.join(', ') + '. PhotoPrint never had your password.', 'good');
            api.goal('flow');
          } else if (!(await st.run())) return;
          if (st.onOk) st.onOk();
          s.step++;
        } finally { s.busy = false; if (api.alive()) render(); }
      }

      async function free(kind) {
        if (s.busy || !s.tok) return;
        s.busy = true; render();
        try {
          if (kind === 'skip') { s.now += 900; const exp = as.access[s.tok.access_token].exp; L('⏩ Skipped **15 minutes**. The access token ' + (s.now >= exp ? 'has **expired** (they only last 10).' : 'still has ' + Math.ceil((exp - s.now) / 60) + ' min left.'), 'info'); return; }
          if (kind === 'refresh') {
            const req = { grant_type: 'refresh_token', refresh_token: s.tok.refresh_token, client_id: 'photoprint' };
            const wasExpired = s.now >= as.access[s.tok.access_token].exp;
            s.lastWire = 'POST ' + AS_URL + '/token\n' + Object.keys(req).map(k => '  ' + k + '=' + req[k]).join('\n');
            if (!(await hop(app, acct, 'refresh'))) return;
            const res = refreshGrant(as, req, s.now);
            if (!(await hop(acct, app, String(res.status), 'good'))) return;
            s.tok = res.body; acct.pulse('good');
            L('Accounts accepted the **refresh token** and issued a **new access token** (no password, no login screen).', 'good');
            if (wasExpired) api.goal('refresh'); else L('That token had not expired yet, but it worked. Skip 15 minutes first to see the real use.', 'dim');
            return;
          }
          const del = kind === 'delete';
          s.lastWire = (del ? 'DELETE https://photos.example/photos/2' : 'GET https://photos.example/photos') + '\nAuthorization: Bearer ' + s.tok.access_token;
          if (!(await hop(app, photosApi, del ? 'DELETE' : 'GET'))) return;
          const r = apiCall(as, del ? 'DELETE' : 'GET', '/photos/2', s.tok.access_token, s.now);
          if (!(await hop(photosApi, app, String(r.status), r.status === 200 ? 'good' : 'bad'))) return;
          photosApi.pulse(r.status === 200 ? 'good' : 'bad');
          if (r.status === 200) L('GET /photos → **200 OK** ' + r.body.join(', '), 'good');
          else if (r.status === 403) { L('DELETE /photos/2 → **403 Forbidden** (' + r.error + '): ' + r.desc + '. The token is real and valid, but it was never allowed to do this.', 'warn'); api.goal('scope'); }
          else L((del ? 'DELETE' : 'GET') + ' → **401 Unauthorized** (' + r.error + '): ' + r.desc + '. Use the refresh token to get a new one.', 'bad');
        } finally { s.busy = false; if (api.alive()) render(); }
      }

      // ---------- render ----------
      const wide = b => { b.style.cssText = 'display:block;width:100%;text-align:left;white-space:normal;height:auto;line-height:1.35'; return b; };
      function render() {
        KS.clear(stepBox);
        if (s.step < STEPS.length) {
          const st = STEPS[s.step];
          stepBox.appendChild(h('div', h('span.lab-chip.tn-accent', 'Step ' + (s.step + 1) + ' of ' + STEPS.length), ' ', h('b', st.title)));
          stepBox.appendChild(h('div.lab-mono', { style: wireStyle }, s.step === 4 && s.wire ? s.wire : st.wire()));
          stepBox.appendChild(h('p', { style: { margin: '2px 0', fontWeight: '700' } }, st.q));
          st.opts.forEach((o, i) => { const b = wide(ui.btn(o.t, () => choose(i))); b.disabled = s.busy; stepBox.appendChild(b); });
          if (s.fb) stepBox.appendChild(ui.note(s.fb.text, s.fb.tone === 'bad' ? 'warn' : 'good'));
        } else {
          stepBox.appendChild(ui.note('🎉 **You have the tokens.** Now poke the real system. Every button runs the Photos API or Accounts server check for real.', 'good'));
          if (s.photos) stepBox.appendChild(h('div.lab-cells', s.photos.map(p => h('span.lab-cell', p))));
          const row = ui.row(
            ui.btn('Fetch photos', () => free('get'), 'primary'), ui.btn('Delete photo 2', () => free('delete'), 'danger'),
            ui.btn('Skip 15 minutes', () => free('skip')), ui.btn('Use refresh token', () => free('refresh')), ui.btn('Start over', () => reset(), 'ghost'));
          Array.prototype.forEach.call(row.children, b => { b.disabled = s.busy && b.textContent !== 'Start over'; });
          stepBox.appendChild(row);
          if (s.lastWire) stepBox.appendChild(h('div.lab-mono', { style: wireStyle }, s.lastWire));
        }
        if (s.tok) {
          const rec = as.access[s.tok.access_token]; const left = rec ? rec.exp - s.now : 0;
          tokenStat.set(left > 0 ? Math.ceil(left / 60) + ' min' : 'expired', left > 0 ? 'good' : 'bad');
        } else tokenStat.set('none', '');
      }
      function reset() {
        if (s.busy) return;
        as.codes = {}; as.access = {}; as.refresh = {};
        s.step = 0; s.now = 0; s.tok = null; s.fb = null; s.wire = ''; s.lastWire = ''; s.photos = null;
        L('— Starting over. —', 'dim'); render();
      }

      L('Welcome. Read the step on the left and pick the right move.', 'dim');
      render();
      return () => stage.destroy();
    }
  });
})();
