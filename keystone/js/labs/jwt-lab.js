/* Lab: jwt-lab — anyone can read a JWT; only the holder of the secret can make a valid one. Real HMAC-SHA256 via crypto.subtle. */
(function () {
  'use strict';
  /*CRYPTO-BEGIN*/
  const HAS = !!(typeof crypto !== 'undefined' && crypto && crypto.subtle);
  const te = new TextEncoder();
  function b64uEncode(bytes) {
    const b = new Uint8Array(bytes); let bin = ''; for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64uDecode(str) {
    if (!/^[A-Za-z0-9_-]*$/.test(str) || str.length % 4 === 1) throw new Error('not valid base64url');
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4));
    const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out;
  }
  function strToB64u(s) { return b64uEncode(te.encode(s)); }
  function b64uToStr(s) { return new TextDecoder('utf-8', { fatal: true }).decode(b64uDecode(s)); }
  async function hmac256(secret, msg) {
    const key = await crypto.subtle.importKey('raw', te.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return new Uint8Array(await crypto.subtle.sign('HMAC', key, te.encode(msg)));
  }
  async function signToken(header, payload, secret) {
    const data = strToB64u(JSON.stringify(header)) + '.' + strToB64u(JSON.stringify(payload));
    return data + '.' + b64uEncode(await hmac256(secret, data));
  }
  function decodePart(p, what) {
    let v; try { v = JSON.parse(b64uToStr(p)); } catch (e) { throw new Error('the ' + what + ' part is not readable JSON'); }
    if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('the ' + what + ' part must be a JSON object');
    return v;
  }
  /** strict: only HS256 accepted. naive: believes whatever alg the token claims, including "none". */
  async function verifyToken(token, secret, strict, nowSec) {
    const parts = String(token).split('.');
    if (parts.length !== 3) return { ok: false, reason: 'format', text: 'A JWT has exactly three parts separated by dots.' };
    let header, payload;
    try { header = decodePart(parts[0], 'header'); payload = decodePart(parts[1], 'payload'); } catch (e) { return { ok: false, reason: 'format', text: 'Malformed token: ' + e.message + '.' }; }
    const alg = header.alg;
    if (alg === 'none') {
      if (strict) return { ok: false, reason: 'alg', text: 'Refused: the token says it is unsigned (alg "none"). A strict server only accepts the algorithm it chose itself.' };
    } else if (alg !== 'HS256') return { ok: false, reason: 'alg', text: 'Refused: unsupported algorithm ' + JSON.stringify(alg === undefined ? null : alg) + '.' };
    else {
      let good = false;
      try { good = b64uEncode(await hmac256(secret, parts[0] + '.' + parts[1])) === parts[2]; } catch (e) { good = false; }
      if (!good) return { ok: false, reason: 'sig', text: 'Invalid signature: the header or payload changed after signing, or a different secret was used.' };
    }
    if (typeof payload.exp === 'number' && nowSec >= payload.exp) return { ok: false, reason: 'exp', text: 'Expired: the signature is fine but the "exp" time has passed.' };
    return { ok: true, reason: 'ok', text: alg === 'none' ? 'Accepted with NO signature check! Anyone could have forged this.' : 'Valid: the signature matches and the token has not expired.', header, payload };
  }
  /*CRYPTO-END*/

  function pretty(o) { return JSON.stringify(o, null, 2); }
  function fmtClock(sec) { return new Date(sec * 1000).toISOString().slice(11, 19) + ' UTC'; }
  function fmtLeft(sec) { if (sec <= 0) return 'expired'; const m = Math.floor(sec / 60), s = Math.floor(sec % 60); return (m >= 60 ? Math.floor(m / 60) + 'h ' + (m % 60) + 'm ' : m + 'm ') + s + 's left'; }

  KS.labs.register({
    id: 'jwt-lab',
    title: 'JWT Lab',
    emoji: '🪙',
    blurb: 'Read, edit, forge and expire a real JSON Web Token, and see exactly what the secret key protects.',
    tags: ['security', 'jwt', 'tokens', 'hmac', 'authentication', 'signature'],
    goals: [
      { id: 'read', text: '**Decode** a token and read its claims without any secret' },
      { id: 'tamper', text: 'Change the role to **admin** and get "invalid signature"' },
      { id: 'sign', text: '**Re-sign** the edited token with the right secret' },
      { id: 'expire', text: 'Let a valid token **expire** using the clock' },
      { id: 'none', text: 'See a naive server accept an **alg: none** token that a strict one refuses' }
    ],
    help: `A **JWT** is three base64 chunks joined by dots: a **header** (which algorithm), a **payload** (the claims, such as who you are and your role) and a **signature**. The first two are only encoded, not encrypted: anyone can read them.

The signature is an **HMAC** (a keyed hash) of the first two parts using a secret only the server knows. Change one character of the payload and the signature no longer matches; to make a matching one you need the secret.

**exp** is an expiry time in seconds. The clock buttons let you jump forward.

**alg: none** means "this token is unsigned". A sloppy server that trusts the token's own header will accept a forged one. A strict server decides the algorithm itself and refuses.

The HMAC maths is computed for real in your browser.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      if (!HAS) { root.appendChild(ui.note('This lab needs the browser\'s **Web Crypto** feature, only available on secure pages (https or localhost).', 'warn')); return; }
      const log = ui.log(40);
      let secret = 'keystone-secret', hdrText = '', payText = '', sig = '', offset = 0, seq = 0, lastTok = '', lastEdit = null;
      let verdict = { strict: null, naive: null };
      const nowSec = () => Math.floor(Date.now() / 1000) + offset;

      const tokView = h('div.lab-mono', { style: { padding: '10px', borderRadius: '10px', background: 'var(--panel-2)', border: '1px solid var(--line-2)', minHeight: '3em' } });
      const legend = h('div.lab-row', h('span.lab-chip', { style: { color: 'var(--bad)' } }, 'header'), h('span.lab-chip', { style: { color: 'var(--accent-2)' } }, 'payload'), h('span.lab-chip', { style: { color: 'var(--good)' } }, 'signature'));
      const problem = h('div.lab-note.tn-warn', { style: { display: 'none' } });
      function badge(title) {
        const chip = h('span.lab-chip', '…'), txt = h('div.small.muted', { style: { marginTop: '4px' } });
        return { el: h('div', h('div.small', { style: { fontWeight: '800' } }, title), chip, txt), set(r) { chip.className = 'lab-chip tn-' + (r.ok ? 'good' : 'bad'); chip.textContent = (r.ok ? '✓ ACCEPTED' : '✗ REJECTED') + ' · ' + r.reason; txt.textContent = r.text; } };
      }
      const bStrict = badge('Strict server'), bNaive = badge('Naive server (trusts the token\'s own alg)');
      const clockOut = h('div.small.muted'), expOut = h('div.small');

      const hdrIn = ui.textarea('Header (JSON)', '', v => { hdrText = v; refresh(); }, 3);
      const payIn = ui.textarea('Payload (JSON): edit me', '', v => { payText = v; refresh(); }, 7);
      const secIn = ui.input('Secret key (the server\'s, used by Sign and by both servers)', secret, v => { secret = v; refresh(); }, { maxlength: '60' });
      const pasteIn = ui.textarea('Paste any token here to decode it', '', () => {}, 3);

      let raw = null;   // the original base64 parts of a decoded token
      function parseEditors() {
        let hd, pl;
        try { hd = JSON.parse(hdrText); } catch (e) { return { err: 'The header is not valid JSON yet (' + e.message + ').' }; }
        try { pl = JSON.parse(payText); } catch (e) { return { err: 'The payload is not valid JSON yet (' + e.message + ').' }; }
        if (!hd || typeof hd !== 'object' || Array.isArray(hd)) return { err: 'The header must be a JSON object like {"alg": "HS256"}.' };
        if (!pl || typeof pl !== 'object' || Array.isArray(pl)) return { err: 'The payload must be a JSON object like {"sub": "bob"}.' };
        return { hd, pl };
      }
      async function refresh() {
        const t = ++seq; const p = parseEditors();
        if (p.err) { problem.style.display = ''; problem.textContent = p.err + ' The token below is the last good one.'; return; }
        problem.style.display = 'none';
        try {
          // A pasted token keeps its original header/payload bytes until you edit them; re-encoding the JSON
          // (spacing, escapes) would change the bytes and wrongly break a valid signature.
          const hPart = raw && hdrText === raw.hdr ? raw.h : strToB64u(JSON.stringify(p.hd));
          const pPart = raw && payText === raw.pay ? raw.p : strToB64u(JSON.stringify(p.pl));
          const tok = hPart + '.' + pPart + '.' + sig;
          const now = nowSec();
          const rs = await Promise.all([verifyToken(tok, secret, true, now), verifyToken(tok, secret, false, now)]);
          if (!api.alive() || t !== seq) return;
          if (tok !== lastTok) {
            lastTok = tok; KS.clear(tokView); const q = tok.split('.');
            tokView.appendChild(h('span', { style: { color: 'var(--bad)' } }, q[0])); tokView.appendChild(document.createTextNode('.'));
            tokView.appendChild(h('span', { style: { color: 'var(--accent-2)' } }, q[1])); tokView.appendChild(document.createTextNode('.'));
            tokView.appendChild(h('span', { style: { color: 'var(--good)' } }, q[2]));
          }
          verdict = { strict: rs[0], naive: rs[1] }; bStrict.set(rs[0]); bNaive.set(rs[1]);
          clockOut.textContent = 'Server clock: ' + fmtClock(now) + (offset ? ' (+' + Math.round(offset / 60) + ' min)' : '');
          expOut.textContent = typeof p.pl.exp === 'number' ? 'exp claim: ' + fmtLeft(p.pl.exp - now) : 'This payload has no numeric "exp" claim, so it never expires.';
          check(p, rs);
        } catch (e) { problem.style.display = ''; problem.textContent = 'Could not check the token: ' + (e && e.message || 'unknown error'); }
      }
      function check(p, rs) {
        const st = rs[0];
        if (p.hd.alg === 'HS256' && p.pl.role === 'admin' && st.reason === 'sig') {
          if (!api.goalDone('tamper')) log.add('The token now says **role: admin**, but the signature was made for the old payload. The server **rejects it**: you cannot promote yourself without the secret.', 'good');
          api.goal('tamper');
        }
        if (st.ok && lastEdit === 'sign') api.goal('sign');
        if (st.reason === 'exp' && p.hd.alg === 'HS256') api.goal('expire');
        if (p.hd.alg === 'none' && rs[1].ok && !st.ok) api.goal('none');
      }
      async function resign() {
        const p = parseEditors(); if (p.err) { log.add(KS.esc(p.err), 'warn'); return; }
        if (p.hd.alg !== 'HS256') { p.hd.alg = 'HS256'; hdrText = pretty(p.hd); hdrIn.set(hdrText); log.add('This lab signs with HMAC-SHA256, so **alg** was set back to HS256.', 'dim'); }
        try {
          const tok = await signToken(p.hd, p.pl, secret); if (!api.alive()) return;
          sig = tok.split('.')[2]; lastEdit = 'sign'; raw = null;
          log.add('Signed with the secret: the server computed a fresh HMAC over header + payload. The token is valid again, but **only someone who knows the secret could do this**.', 'good');
          await refresh();
        } catch (e) { log.add('Could not sign: ' + KS.esc(e && e.message || 'error'), 'bad'); }
      }
      function admin() {
        const p = parseEditors(); if (p.err) { log.add(KS.esc(p.err), 'warn'); return; }
        p.pl.role = 'admin'; payText = pretty(p.pl); payIn.set(payText); lastEdit = 'edit';
        log.add('You changed the payload to **role: admin** and left the signature alone. The signature part below is still the old one.', 'warn'); refresh();
      }
      function forge() {
        const p = parseEditors(); const pl = p.err ? { sub: 'bob', role: 'user' } : p.pl; pl.role = 'admin';
        hdrText = pretty({ alg: 'none', typ: 'JWT' }); payText = pretty(pl); sig = ''; lastEdit = 'edit'; raw = null; hdrIn.set(hdrText); payIn.set(payText);
        log.add('Forged a token: **alg: none**, role admin, and an **empty signature**. Compare the two servers: the naive one believes the token\'s own claim that it needs no signature.', 'warn'); refresh();
      }
      async function freshExample() {
        const n = nowSec(); const hd = { alg: 'HS256', typ: 'JWT' }, pl = { sub: 'bob', name: 'Bob', role: 'user', iat: n, exp: n + 3600 };
        try {
          const tok = await signToken(hd, pl, 'keystone-secret'); if (!api.alive()) return;
          secret = 'keystone-secret'; secIn.set(secret); hdrText = pretty(hd); payText = pretty(pl); sig = tok.split('.')[2]; lastEdit = 'example'; raw = null;
          hdrIn.set(hdrText); payIn.set(payText); pasteIn.set(tok); await refresh();
        } catch (e) { log.add('Could not build the example: ' + KS.esc(e && e.message || 'error'), 'bad'); }
      }
      function decode() {
        const txt = pasteIn.get().trim().replace(/\s+/g, '');
        const parts = txt.split('.');
        if (parts.length !== 3) { log.add('That does not look like a JWT: it needs three parts separated by dots.', 'warn'); return; }
        try {
          const hd = decodePart(parts[0], 'header'), pl = decodePart(parts[1], 'payload'); b64uDecode(parts[2]);
          hdrText = pretty(hd); payText = pretty(pl); sig = parts[2]; lastEdit = 'decode'; hdrIn.set(hdrText); payIn.set(payText);
          raw = { hdr: hdrText, pay: payText, h: parts[0], p: parts[1] };
          log.add('Decoded without any secret. The **header** and **payload** are just base64: anyone holding the token can read the claims, so never put passwords in one.', 'good');
          api.goal('read'); refresh();
        } catch (e) { log.add('Could not decode that token: ' + KS.esc(e.message) + '.', 'bad'); }
      }

      root.appendChild(ui.panel('The token (live)', tokView, legend, problem));
      root.appendChild(ui.panel('Two servers check it', h('div.lab-grid2.even', bStrict.el, bNaive.el), h('div', { style: { marginTop: '8px' } }, expOut, clockOut)));
      root.appendChild(h('div.lab-grid2.even',
        ui.panel('Edit the token', hdrIn, payIn, secIn,
          ui.row(ui.btn('Make me admin', admin), ui.btn('✍️ Sign with secret', resign, 'primary'), ui.btn('Forge alg: none', forge, 'danger'), ui.btn('↺ Reset example', () => { offset = 0; freshExample(); log.add('Reset to a fresh example token for Bob.', 'info'); }, 'ghost'))),
        ui.panel('Clock and paste-in', ui.row(ui.btn('⏩ Fast-forward 1 hour', () => { offset += 3600; log.add('The server\'s clock jumped forward **one hour**.', 'info'); refresh(); }), ui.btn('Reset clock', () => { offset = 0; refresh(); }, 'ghost')),
          pasteIn, ui.btn('🔍 Decode this token', decode))));
      root.appendChild(ui.panel('What just happened', log.el));
      freshExample().then(() => { if (api.alive()) log.add('Here is a token for Bob. Press **Decode** to read it, then try changing things.', 'dim'); });
      api.every(1000, () => { if (lastTok) refresh(); });
    }
  });
})();
