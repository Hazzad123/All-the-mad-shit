/* Lab: session-vs-token — sessions live on the server and must be shared; tokens travel with the client and are hard to take back. */
(function () {
  // <pure>
  const enc = new TextEncoder();
  function b64u(bytes) { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64uStr(str) { return b64u(enc.encode(str)); }
  function b64uDecode(str) {
    let t = String(str).replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '=';
    const bin = atob(t); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(out);
  }
  async function hmacSha256(key, data) {
    const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
  }
  async function signToken(payload, key) {
    const head = b64uStr(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = b64uStr(JSON.stringify(payload));
    return head + '.' + body + '.' + b64u(await hmacSha256(key, head + '.' + body));
  }
  /** Returns { ok, why: 'format'|'signature'|'expired'|'revoked'|null, payload } */
  async function verifyToken(token, key, now, deny) {
    const parts = String(token).split('.');
    if (parts.length !== 3) return { ok: false, why: 'format', payload: null };
    const sig = b64u(await hmacSha256(key, parts[0] + '.' + parts[1]));
    if (sig !== parts[2]) return { ok: false, why: 'signature', payload: null };
    let payload = null;
    try { payload = JSON.parse(b64uDecode(parts[1])); } catch (e) { return { ok: false, why: 'format', payload: null }; }
    if (typeof payload.exp === 'number' && now >= payload.exp) return { ok: false, why: 'expired', payload: payload };
    if (deny && deny.indexOf(payload.jti) >= 0) return { ok: false, why: 'revoked', payload: payload };
    return { ok: true, why: null, payload: payload };
  }
  // </pure>

  KS.labs.register({
    id: 'session-vs-token',
    title: 'Sessions vs Tokens',
    emoji: '🎫',
    blurb: 'Two ways to stay logged in. One keeps a list on the server, the other hands you a signed pass. Add a second server and log out to see the difference.',
    tags: ['authentication', 'session', 'token', 'jwt', 'cookie', 'scaling'],
    goals: [
      { id: 'login', text: 'Log in with a **session** and fetch your profile' },
      { id: 'break', text: 'Add a **second server** and get a **401** even though you are logged in' },
      { id: 'share', text: 'Fix it with a **shared session store** so both servers accept you' },
      { id: 'token', text: 'Switch to **tokens** and get both servers to accept you' },
      { id: 'revoke', text: 'Log out with a token, **replay** it, and see it still work' }
    ],
    help: `**Browser** is you. The **load balancer** passes each request to one of the **servers** in turn.

- **Session mode:** at login the server writes a row in its own *session table* and hands your browser a cookie holding just the row's id. Every request, the server looks the id up. Log out = delete the row, and you are out immediately. The catch: a second server has its own table and has never heard of you, unless they **share a store** (or the balancer is **sticky** and always sends you to the same server).
- **Token mode:** the server signs a small pass (real HMAC-SHA256 here) saying who you are and when it expires. Any server holding the key can check it, with no table and no sharing. The catch: the server keeps nothing it could delete, so a stolen token works until it **expires**, unless you add a **deny-list**, which is a table again.

The clock is simulated: one tick per second, and you can skip ahead.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      if (ui.needsWebCrypto(root)) return;
      const KEY = 'keystone-demo-signing-key', LIFE = 90;
      const NAMES = ['A', 'B'];
      const st = {
        mode: 'session', n: 1, shared: false, sticky: false, deny: false, clock: 0, rr: 0, stickyTo: null, busy: false,
        tables: [{}, {}], store: {}, denyList: [], cred: null, old: null, okSet: {}, sidCount: 0
      };
      const code = x => '`' + String(x).replace(/`/g, "'").replace(/\n/g, ' ') + '`';

      // ---------- UI ----------
      const browser = ui.node('Browser', '🧑‍💻', { tone: 'accent' });
      const lb = ui.node('Load balancer', '⚖️');
      const nodes = NAMES.map(n => ui.node('Server ' + n, '🖥️'));
      const srvCol = h('div.lab-col', nodes[0]);
      const stage = ui.stage();
      stage.el.appendChild(ui.cols([browser], [lb], srvCol));
      stage.wire(browser, lb); stage.wire(lb, nodes[0], { tone: 'good' }); stage.wire(lb, nodes[1], { tone: 'good' });

      const log = ui.log(60);
      const L = (t, tone) => log.add(t, tone);
      const credBox = h('div.lab-mono', { style: { minHeight: '2.4em' } });
      const tableBox = h('div.lab-stack');
      const expiry = ui.meter('Token lifetime');
      const clockStat = ui.stat('seconds on the clock', 0);

      const btns = {
        login: ui.btn('Log in as alice', () => request('login'), 'primary'),
        profile: ui.btn('Get my profile', () => request('profile')),
        logout: ui.btn('Log out', () => logout(), 'danger'),
        replay: ui.btn('Replay old credential', () => request('replay')),
        skip: ui.btn('Skip 30 s', () => { st.clock += 30; L('⏩ Skipped 30 seconds. The clock reads **' + st.clock + ' s**.', 'info'); render(); }, 'sm')
      };
      const segMode = ui.seg([['session', 'Sessions'], ['token', 'Tokens']], st.mode, v => setMode(v));
      const segN = ui.seg([['1', '1 server'], ['2', '2 servers']], '1', v => {
        st.n = +v; if (st.n === 1 && srvCol.contains(nodes[1])) srvCol.removeChild(nodes[1]);
        if (st.n === 2 && !srvCol.contains(nodes[1])) srvCol.appendChild(nodes[1]);
        st.okSet = {}; stage.redraw();
        L(st.n === 2 ? '**Two servers** now sit behind the balancer. It alternates between them: A, B, A, B…' : 'Back to **one server**.', 'info');
        render();
      });
      const tShared = ui.toggle('Shared session store', false, v => {
        st.shared = v; st.okSet = {};
        L(v ? 'Servers now keep sessions in one **shared store** (think Redis). It starts empty, so log in again.' : 'Shared store **off**: each server uses its own table again.', 'info');
        if (v) { st.cred = null; } render();
      });
      const tSticky = ui.toggle('Sticky sessions', false, v => {
        st.sticky = v; st.stickyTo = null;
        L(v ? '**Sticky** on: after you log in, the balancer always sends you back to the same server. Works, but if that server dies you are logged out, and load is uneven.' : 'Sticky **off**.', 'info');
        render();
      });
      const tDeny = ui.toggle('Token deny-list', false, v => {
        st.deny = v;
        L(v ? '**Deny-list** on: logging out now writes the token id into a shared list that every server checks. That list is state again, but it can revoke.' : 'Deny-list **off**.', 'info');
        render();
      });
      const optsRow = ui.row(tShared, tSticky, tDeny);

      root.appendChild(ui.panel('Setup', ui.row(segMode, segN), optsRow,
        ui.row(btns.login, btns.profile, btns.logout, btns.replay, btns.skip)));
      root.appendChild(stage.el);
      root.appendChild(h('div.lab-grid2',
        ui.panel('What just happened', log.el),
        ui.panel('Who is holding what', h('div.lab-stack', h('div', h('b', 'Your browser holds: '), credBox), expiry.el, tableBox, ui.stats(clockStat)))));

      // ---------- model ----------
      function setMode(m) {
        st.mode = m; st.cred = null; st.old = null; st.okSet = {}; st.stickyTo = null;
        L(m === 'session' ? 'Switched to **sessions**. Log in to get a cookie.' : 'Switched to **tokens**. Log in to get a signed token.', 'info');
        render();
      }
      function pickServer() {
        if (st.n === 1) return 0;
        if (st.mode === 'session' && st.sticky && st.stickyTo != null && st.stickyTo < st.n) return st.stickyTo;
        return st.rr++ % st.n;
      }
      function storeFor(i) { return st.shared ? st.store : st.tables[i]; }
      function randHex(n) { let s = ''; for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 16).toString(16); return s; }

      /** Ask a server whether this credential is good. Returns { status, why, msg } */
      async function serverCheck(i, cred) {
        const nm = 'Server ' + NAMES[i];
        if (!cred) return { status: 401, why: 'none', msg: nm + ' got **no credential**, so it cannot know who you are.' };
        if (cred.type === 'cookie') {
          if (st.mode !== 'session') return { status: 401, why: 'type', msg: nm + ' wants a token but got a cookie.' };
          const row = storeFor(i)[cred.value];
          if (row) return { status: 200, why: null, msg: nm + ' found session ' + code(cred.value) + ' in ' + (st.shared ? 'the **shared store**' : 'its own table') + ' → hello **alice**.' };
          const elsewhere = st.tables.some(t => t[cred.value]) || !!st.store[cred.value];
          return { status: 401, why: elsewhere ? 'other-server' : 'gone', msg: elsewhere
            ? nm + ' looked for session ' + code(cred.value) + ' in **its own table** and found nothing. The session exists, but on the other server.'
            : nm + ' has no session ' + code(cred.value) + ' (it was deleted or never existed).' };
        }
        if (st.mode !== 'token') return { status: 401, why: 'type', msg: nm + ' wants a session cookie but got a token.' };
        const r = await verifyToken(cred.value, KEY, st.clock, st.deny ? st.denyList : null);
        if (!api.alive()) return { status: 0 };
        if (r.ok) return { status: 200, why: null, jti: r.payload.jti, msg: nm + ' recomputed the signature with the shared key: it matches, and the token expires at ' + r.payload.exp + ' s (now ' + st.clock + ' s) → hello **' + r.payload.sub + '**. No table was read.' };
        const why = { signature: 'the signature does not match', expired: 'the token **expired** at ' + (r.payload && r.payload.exp) + ' s', revoked: 'its id is on the **deny-list**', format: 'it is not a valid token' }[r.why];
        return { status: 401, why: r.why, msg: nm + ' rejected the token: ' + why + '.' };
      }

      async function request(kind) {
        if (st.busy) return;
        let cred = kind === 'replay' ? st.old : st.cred;
        if (kind === 'profile' && !st.cred) { L('You have nothing to send yet. **Log in** first.', 'warn'); return; }
        if (kind === 'replay' && !st.old) { L('There is no old credential to replay. Log in, then log out.', 'warn'); return; }
        st.busy = true; render();
        try {
          const i = pickServer();
          const label = kind === 'login' ? 'login' : (cred && cred.type === 'cookie' ? '🍪' : '🎫');
          await stage.send(browser, lb, { label, ms: 300 }); if (!api.alive()) return;
          await stage.send(lb, nodes[i], { label, ms: 300 }); if (!api.alive()) return;
          if (kind === 'login') {
            if (st.mode === 'session') {
              const sid = 'sid_' + randHex(8) + (++st.sidCount);
              storeFor(i)[sid] = { user: 'alice' };
              st.cred = { type: 'cookie', value: sid }; st.old = null;
              if (st.sticky) st.stickyTo = i;
              L('Server ' + NAMES[i] + ' wrote a session row and replied with `Set-Cookie: ' + sid + '`. The cookie is only an id; the facts about you stay on the server' + (st.shared ? ' (in the shared store).' : ' (in its own table).'), 'good');
            } else {
              const jti = 'tok' + (++st.sidCount);
              const token = await signToken({ sub: 'alice', role: 'user', iat: st.clock, exp: st.clock + LIFE, jti }, KEY);
              if (!api.alive()) return;
              st.cred = { type: 'token', value: token, jti, exp: st.clock + LIFE }; st.old = null;
              L('Server ' + NAMES[i] + ' **signed** a token (HMAC-SHA256) and sent it back. It remembers nothing. The token itself says who you are and expires in **' + LIFE + ' s**.', 'good');
            }
            st.okSet = {};
            nodes[i].pulse('good'); stage.send(nodes[i], browser, { tone: 'good', ms: 400 });
            return;
          }
          const res = await serverCheck(i, cred); if (!api.alive() || !res.status) return;
          const tone = res.status === 200 ? 'good' : 'bad';
          nodes[i].pulse(tone);
          L((kind === 'replay' ? '↩ Replaying the old credential. ' : '') + res.msg + ' **→ ' + res.status + (res.status === 200 ? ' OK' : ' Unauthorized') + '**', tone);
          stage.send(nodes[i], browser, { tone, ms: 400 });
          after(kind, i, res);
        } finally { st.busy = false; if (api.alive()) render(); }
      }

      function after(kind, i, res) {
        if (kind === 'profile') {
          if (res.status === 200) {
            st.okSet[i] = true;
            if (st.mode === 'session' && st.n === 1) api.goal('login');
            if (st.mode === 'session' && st.n === 2 && st.shared && st.okSet[0] && st.okSet[1]) api.goal('share');
            if (st.mode === 'token' && st.n === 2 && st.okSet[0] && st.okSet[1]) api.goal('token');
          } else if (st.mode === 'session' && st.n === 2 && !st.shared && res.why === 'other-server') {
            api.goal('break');
            L('💡 Cookie is valid, but this server cannot see the other server\'s table. Try **Shared session store** (then log in again) or **Sticky sessions**.', 'warn');
          }
          if (res.status === 200 && st.mode === 'session') api.goal('login');
        }
        if (kind === 'replay' && st.mode === 'token' && res.status === 200) {
          api.goal('revoke');
          L('💡 The user logged out, yet this token still works. The server has no row to delete. Turn on the **deny-list** to see it fixed (at the price of a shared table).', 'warn');
        }
        if (kind === 'replay' && res.status === 401 && st.mode === 'session') L('💡 With sessions, logging out really did end the session instantly.', 'info');
      }

      function logout() {
        if (st.busy) return;
        if (!st.cred) { L('You are not logged in.', 'warn'); return; }
        st.old = st.cred;
        if (st.cred.type === 'cookie') {
          const sid = st.cred.value;
          st.tables.forEach(t => { delete t[sid]; }); delete st.store[sid];
          L('**Log out:** the server deleted session row ' + code(sid) + ' and your browser threw the cookie away. A copy of the cookie (say, one an attacker stole) is now worthless.', 'good');
        } else {
          if (st.deny) { st.denyList.push(st.cred.jti); L('**Log out:** the token id ' + code(st.cred.jti) + ' was added to the deny-list, and your browser discarded the token.', 'good'); }
          else L('**Log out:** your browser discarded the token. But no server stored anything, so there is nothing to delete. A copy of the token is still valid until it expires.', 'warn');
        }
        st.cred = null; st.stickyTo = null;
        render();
      }

      // ---------- render ----------
      function cells(map, who) {
        const keys = Object.keys(map);
        return h('div', h('div.muted.small', who), keys.length ? h('div.lab-cells', keys.map(k => h('span.lab-cell', k))) : h('div.muted.small', '(empty)'));
      }
      function render() {
        const sess = st.mode === 'session';
        credBox.textContent = st.cred ? (st.cred.type === 'cookie' ? 'cookie sid=' + st.cred.value : st.cred.value) : '(nothing: logged out)';
        KS.clear(tableBox);
        if (sess) {
          if (st.shared) tableBox.appendChild(cells(st.store, 'Shared session store'));
          else for (let i = 0; i < st.n; i++) tableBox.appendChild(cells(st.tables[i], 'Server ' + NAMES[i] + ' session table'));
        } else {
          tableBox.appendChild(h('div.muted.small', st.deny ? 'No session tables. Deny-list: ' + (st.denyList.length ? st.denyList.join(', ') : '(empty)') : 'No session tables, and nothing stored on any server.'));
        }
        const tk = st.cred && st.cred.type === 'token' ? st.cred : (!sess && st.old && st.old.type === 'token' ? st.old : null);
        expiry.el.style.display = tk ? '' : 'none';
        if (tk) {
          const left = Math.max(0, tk.exp - st.clock);
          expiry.set(left / LIFE, left > 0 ? left + ' s left' + (tk === st.old ? ' (token already logged out)' : '') : 'expired', left > 30 ? 'good' : left > 0 ? 'warn' : 'bad');
        }
        clockStat.set(st.clock);
        tShared.style.display = sess ? '' : 'none'; tSticky.style.display = sess ? '' : 'none'; tDeny.style.display = sess ? 'none' : '';
        btns.skip.style.display = sess ? 'none' : '';
        btns.replay.disabled = btns.login.disabled = btns.profile.disabled = btns.logout.disabled = st.busy;
        btns.replay.style.display = st.old ? '' : 'none';
        nodes.forEach((nd, i) => { nd.setSub(sess ? Object.keys(storeFor(i)).length + (st.shared ? ' shared' : '') + ' session(s)' : 'no table'); nd.setState('ok'); });
      }

      api.every(1000, () => { st.clock++; if (!st.busy) render(); });
      render();
      L('Welcome. Press **Log in as alice**, then **Get my profile**.', 'dim');
      return () => stage.destroy();
    }
  });
})();
