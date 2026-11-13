/* Lab: totp-lab — phone and server derive the same six digits from a shared secret and the time (RFC 6238, HMAC-SHA1). */
(function () {
  'use strict';
  /*CRYPTO-BEGIN*/
  const HAS = !!(typeof crypto !== 'undefined' && crypto && crypto.subtle);
  const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  function toHex(buf) { const b = new Uint8Array(buf); let r = ''; for (let i = 0; i < b.length; i++) r += (b[i] < 16 ? '0' : '') + b[i].toString(16); return r; }
  function base32Encode(bytes) {
    let bits = 0, val = 0, out = '';
    for (let i = 0; i < bytes.length; i++) { val = (val << 8) | bytes[i]; bits += 8; while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; } val &= (1 << bits) - 1; }
    if (bits > 0) out += B32[(val << (5 - bits)) & 31];
    return out;
  }
  function base32Decode(str) {
    const s = String(str).toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, ''); const out = []; let bits = 0, val = 0;
    for (let i = 0; i < s.length; i++) { const k = B32.indexOf(s[i]); if (k < 0) throw new Error('not valid base32'); val = (val << 5) | k; bits += 5; if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; val &= (1 << bits) - 1; } }
    return new Uint8Array(out);
  }
  /** HOTP step: returns the 20-byte MAC, the truncation offset, the 31-bit number and the digits. */
  async function hotp(secretBytes, counter, digits) {
    const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const msg = new Uint8Array(8); const dv = new DataView(msg.buffer);
    dv.setUint32(0, Math.floor(counter / 4294967296)); dv.setUint32(4, counter >>> 0);
    const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, msg));
    const off = mac[19] & 15;
    const bin = ((mac[off] & 0x7f) * 16777216) + (mac[off + 1] << 16) + (mac[off + 2] << 8) + mac[off + 3];
    const d = digits || 6; const code = String(bin % Math.pow(10, d));
    return { mac, off, bin, code: '0'.repeat(d - code.length) + code };
  }
  async function totp(secretBytes, timeSec, digits, step) { return hotp(secretBytes, Math.floor(timeSec / (step || 30)), digits); }
  /** Server-side check. lastUsed = highest counter already accepted. */
  async function checkCode(secretBytes, code, serverTime, tolerate, lastUsed) {
    if (!/^\d{6}$/.test(code)) return { ok: false, reason: 'format' };
    const c = Math.floor(serverTime / 30); const matches = [];
    for (let k = -8; k <= 8; k++) { if (c + k >= 0 && (await hotp(secretBytes, c + k, 6)).code === code) matches.push(c + k); }
    const allowed = tolerate ? [c - 1, c, c + 1] : [c];
    const inWin = matches.filter(m => allowed.indexOf(m) >= 0);
    if (inWin.length) { const fresh = inWin.filter(m => m > lastUsed); return fresh.length ? { ok: true, reason: 'ok', counter: fresh[0], matches } : { ok: false, reason: 'replay', counter: inWin[0], matches }; }
    if (matches.length) return { ok: false, reason: matches[0] < c ? 'old' : 'early', counter: matches[0], matches };
    return { ok: false, reason: 'wrong', matches };
  }
  /*CRYPTO-END*/

  const CIRC = 2 * Math.PI * 44;
  function group(code) { return code.slice(0, 3) + ' ' + code.slice(3); }

  KS.labs.register({
    id: 'totp-lab',
    title: 'TOTP Lab',
    emoji: '⏱️',
    blurb: 'Your phone and a server never talk, yet they agree on a six-digit code. Watch the maths, then skew the clock.',
    tags: ['security', 'totp', '2fa', 'authenticator', 'hmac', 'mfa'],
    goals: [
      { id: 'verify', text: 'Submit a **correct code** to the server' },
      { id: 'rotate', text: 'Let the code **change** and watch the old one get refused' },
      { id: 'skew', text: 'Move the phone clock until its codes **fail**' },
      { id: 'window', text: 'Allow **±1 step** and make a slightly skewed phone work' }
    ],
    help: `When you set up an authenticator app, the site shows a QR code that contains a **shared secret**. From then on, phone and server each compute the code themselves, with no network between them.

The recipe (TOTP, RFC 6238): take the time in seconds and divide by 30 to get a **counter**. Feed the counter into **HMAC-SHA1** (a keyed scrambler) with the secret to get 20 bytes. **Truncate**: the last nibble picks an offset, four bytes from there become a number, and the last six digits are your code.

Both sides only agree if their **clocks** agree. Servers often accept the neighbouring 30-second steps to forgive small drift, but remember each code once, so **replaying** a stolen one fails.

All of this is computed for real in your browser.`,

    mount(root, api) {
      const ui = api.ui, h = api.h, s = api.s;
      if (!HAS) { root.appendChild(ui.note('This lab needs the browser\'s **Web Crypto** feature, only available on secure pages (https or localhost).', 'warn')); return; }
      const log = ui.log(40);
      const bytes = new Uint8Array(10); crypto.getRandomValues(bytes);
      const secretB32 = base32Encode(bytes);
      let skew = 0, warp = 0, tolerate = false, lastUsed = -1, lastAccepted = null, typed = '', shownCounter = null, derSeq = 0, phoneCode = '------', phoneCounter = 0, busy = false;
      const simTime = () => Date.now() / 1000 + warp;

      // ----- phone -----
      const arc = s('circle', { cx: 50, cy: 50, r: 44, fill: 'none', 'stroke-width': 7, 'stroke-linecap': 'round', transform: 'rotate(-90 50 50)', 'stroke-dasharray': CIRC });
      arc.style.stroke = 'var(--accent)';
      const track = s('circle', { cx: 50, cy: 50, r: 44, fill: 'none', 'stroke-width': 7 }); track.style.stroke = 'var(--panel-3)';
      const codeOut = h('div.lab-big', { style: { fontFamily: 'var(--mono)', letterSpacing: '.08em' } }, '------');
      const secLeft = h('div.small.muted', '');
      const ring = s('svg', { viewBox: '0 0 100 100', style: { width: '96px', height: '96px', flex: '0 0 auto' }, 'aria-hidden': 'true' }, track, arc);
      const skewOut = h('div.small');
      const skewSl = ui.slider('Phone clock is off by', { min: -120, max: 120, step: 1, value: 0, fmt: v => (v > 0 ? '+' : '') + v + ' s' }, v => { skew = v; skewOut.textContent = skewText(); tick(true); });
      function skewText() { return skew === 0 ? 'Phone clock is exact.' : 'Phone clock is ' + Math.abs(skew) + ' s ' + (skew > 0 ? 'fast' : 'slow') + '.'; }
      skewOut.textContent = skewText();
      const phone = ui.panel('📱 Your phone (authenticator app)', ui.row(ring, h('div', codeOut, secLeft)), skewSl, skewOut,
        h('div.small.muted', 'Shared secret (what the QR code held): '), h('div.lab-mono', secretB32.match(/.{1,4}/g).join(' ')));

      // ----- derivation -----
      const dTime = h('dd.lab-mono'), dCtr = h('dd.lab-mono'), dMac = h('dd.lab-mono'), dTrunc = h('dd.lab-mono'), dCode = h('dd.lab-mono');
      const derive = ui.panel('How the phone got that code', h('dl.lab-kv',
        h('dt', '1 · Time'), dTime, h('dt', '2 · Counter'), dCtr, h('dt', '3 · HMAC-SHA1'), dMac, h('dt', '4 · Truncate'), dTrunc, h('dt', '5 · Six digits'), dCode));
      async function paintDerivation(pt, c) {
        const t = ++derSeq;
        try {
          const r = await hotp(base32Decode(secretB32), c, 6); if (!api.alive() || t !== derSeq) return;
          const hex = toHex(r.mac); KS.clear(dMac);
          dMac.appendChild(document.createTextNode(hex.slice(0, r.off * 2))); dMac.appendChild(h('span', { style: { color: 'var(--accent-2)', fontWeight: '800' } }, hex.slice(r.off * 2, r.off * 2 + 8))); dMac.appendChild(document.createTextNode(hex.slice(r.off * 2 + 8)));
          dTrunc.textContent = 'last nibble = ' + r.off + ', so take bytes ' + r.off + '–' + (r.off + 3) + ' (highlighted), clear the top bit → ' + r.bin;
          dCode.textContent = r.bin + ' mod 1,000,000 = ' + r.code;
          phoneCode = r.code; phoneCounter = c; codeOut.textContent = group(r.code);
        } catch (e) { dMac.textContent = 'Could not compute: ' + (e && e.message || 'error'); }
      }

      // ----- server -----
      const srvClock = h('div.small.muted');
      const input = ui.input('Code from the app', '', v => { typed = v; }, { inputmode: 'numeric', maxlength: '8', placeholder: '6 digits' });
      const tolToggle = ui.toggle('Server tolerates ±1 step (±30 s)', false, v => { tolerate = v; log.add(v ? 'Server will now accept the code from the **previous, current or next** 30-second step.' : 'Server accepts only the **current** step.', 'info'); });
      async function submit(code, label) {
        if (busy) return; busy = true;
        try {
          const clean = String(code).replace(/\s+/g, '');
          if (!/^\d{6}$/.test(clean)) { log.add('A code is exactly **6 digits**. Press "Fill in phone\'s code" or type it in.', 'warn'); return; }
          const st = simTime(); const sc = Math.floor(st / 30);
          const r = await checkCode(base32Decode(secretB32), clean, st, tolerate, lastUsed); if (!api.alive()) return;
          const expected = (await hotp(base32Decode(secretB32), sc, 6)).code; if (!api.alive()) return;
          const pre = label + ' **' + group(clean) + '**. Server clock is in step ' + sc + ' (its code: ' + group(expected) + '). ';
          const phoneNow = Math.floor((st + skew) / 30);
          if (r.ok) {
            lastUsed = r.counter; lastAccepted = clean;
            log.add(pre + '→ **accepted** ✓' + (r.counter !== sc ? ' (it was the code for step ' + r.counter + ', allowed by the ±1 window)' : ''), 'good');
            api.goal('verify');
            if (tolerate && phoneNow !== sc && Math.abs(phoneNow - sc) === 1 && clean === phoneCode) { log.add('The phone is **' + Math.abs(skew) + ' s ' + (skew > 0 ? 'fast' : 'slow') + '**, one step off, but the window forgave it.', 'good'); api.goal('window'); }
          } else if (r.reason === 'replay') log.add(pre + '→ **refused**: that code was already used. A stolen code cannot be replayed.', 'bad');
          else if (clean === phoneCode && phoneNow !== sc) {
            log.add(pre + '→ **refused**: the phone is in step ' + phoneNow + ' but the server is in step ' + sc + ', so they computed different codes. ' + (tolerate ? 'That is ' + Math.abs(phoneNow - sc) + ' steps apart, more than the ±1 window.' : 'Try the ±1 switch.'), 'bad');
            if (skew !== 0) api.goal('skew');
          } else if (r.reason === 'old') {
            log.add(pre + '→ **refused**: that was the code for step ' + r.counter + ', which has **expired**. Codes change every 30 seconds.', 'bad'); api.goal('rotate');
          } else if (r.reason === 'early') log.add(pre + '→ **refused**: that code belongs to a future step.', 'bad');
          else log.add(pre + '→ **refused**: wrong code.', 'bad');
        } catch (e) { log.add('Something went wrong: ' + KS.esc(e && e.message || 'error'), 'bad'); }
        finally { busy = false; }
      }
      const server = ui.panel('🖥️ The server', srvClock, input, tolToggle,
        ui.row(ui.btn('Fill in phone\'s code', () => { typed = phoneCode; input.set(typed); }, 'ghost'), ui.btn('Submit', () => submit(typed, 'You sent'), 'primary')),
        ui.row(ui.btn('♻️ Replay last accepted code', () => { if (!lastAccepted) { log.add('Nothing to replay yet: get a code accepted first.', 'warn'); return; } submit(lastAccepted, 'An attacker replayed'); }, 'danger'),
          ui.btn('⏩ Wait for the next code', () => { warp += 30 - (simTime() % 30) + 0.3; log.add('Time passed: the clocks moved into the next **30-second step**. Your typed code is now old.', 'info'); tick(true); })));

      // ----- tick -----
      async function tick(force) {
        const st = simTime(), pt = st + skew; const c = Math.floor(pt / 30), rem = 30 - (pt % 30);
        arc.setAttribute('stroke-dashoffset', String(CIRC * (1 - rem / 30))); arc.style.stroke = rem < 5 ? 'var(--warn)' : 'var(--accent)';
        secLeft.textContent = Math.ceil(rem) + ' s until the code changes';
        dTime.textContent = Math.floor(pt) + ' s since 1970 (phone clock)'; dCtr.textContent = Math.floor(pt) + ' ÷ 30 = ' + c + ' (rounded down)';
        srvClock.textContent = 'Server clock: step ' + Math.floor(st / 30) + (c !== Math.floor(st / 30) ? ' (phone is in step ' + c + ')' : ' (same step as the phone)');
        if (force || c !== shownCounter) { shownCounter = c; await paintDerivation(pt, c); if (api.alive() && !force) log.add('Phone: a new code, **' + group(phoneCode) + '**, for step ' + c + '.', 'dim'); }
      }
      root.appendChild(h('div.lab-grid2.even', h('div.lab-stack', phone, derive), server));
      root.appendChild(ui.panel('What just happened', log.el));
      log.add('Press "Fill in phone\'s code" and **Submit**. Then try waiting, and skewing the phone clock.', 'dim');
      tick(true); api.every(250, () => tick(false));
    }
  });
})();
