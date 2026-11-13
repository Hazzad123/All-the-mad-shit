/* Lab: hash-lab — a hash is a one-way fingerprint; storing passwords safely needs salt and slowness. Real SHA-256 and PBKDF2 via crypto.subtle. */
(function () {
  'use strict';
  /*CRYPTO-BEGIN*/
  const HAS = !!(typeof crypto !== 'undefined' && crypto && crypto.subtle);
  const te = new TextEncoder();
  function toHex(buf) { const b = new Uint8Array(buf); let r = ''; for (let i = 0; i < b.length; i++) r += (b[i] < 16 ? '0' : '') + b[i].toString(16); return r; }
  async function sha256(str) { return new Uint8Array(await crypto.subtle.digest('SHA-256', te.encode(str))); }
  async function pbkdf2(pw, salt, iter) {
    const key = await crypto.subtle.importKey('raw', te.encode(pw), 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: te.encode(salt), iterations: iter }, key, 256));
  }
  /** One 0/1 entry per bit: did this bit differ between the two byte arrays? */
  function bitDiff(a, b) { const out = []; for (let i = 0; i < a.length; i++) for (let k = 7; k >= 0; k--) out.push(((a[i] ^ b[i]) >> k) & 1); return out; }
  function editDistance(a, b) {
    const x = Array.from(a), y = Array.from(b); let prev = []; for (let j = 0; j <= y.length; j++) prev.push(j);
    for (let i = 1; i <= x.length; i++) { const cur = [i]; for (let j = 1; j <= y.length; j++) cur.push(Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1))); prev = cur; }
    return prev[y.length];
  }
  /*CRYPTO-END*/

  const YEAR = 365 * 86400;
  function fmtMs(ms) {
    if (ms < 0.001) return Math.round(ms * 1e6) + ' ns';
    if (ms < 1) return Math.round(ms * 1000) + ' µs';
    if (ms < 1000) return (ms < 10 ? ms.toFixed(2) : ms.toFixed(0)) + ' ms';
    return (ms / 1000).toFixed(2) + ' s';
  }
  function fmtDur(sec) {
    if (sec < 1) return fmtMs(sec * 1000);
    if (sec < 60) return sec.toFixed(1) + ' seconds';
    if (sec < 3600) return Math.round(sec / 60) + ' minutes';
    if (sec < 86400) return Math.round(sec / 3600) + ' hours';
    if (sec < YEAR) return Math.round(sec / 86400) + ' days';
    return KS.fmtBig(sec / YEAR) + ' years';
  }
  const COMMON = ['123456', 'password', 'letmein', 'qwerty', 'dragon', 'monkey', 'iloveyou', 'admin', 'welcome', 'sunshine'];
  const ITERS = [1, 1000, 10000, 100000, 600000, 1000000, 3000000];

  KS.labs.register({
    id: 'hash-lab',
    title: 'Hash Lab',
    emoji: '#️⃣',
    blurb: 'Turn text into a fingerprint nobody can reverse, then see why storing passwords needs salt and a deliberately slow hash.',
    tags: ['security', 'hashing', 'passwords', 'sha-256', 'salt', 'pbkdf2'],
    goals: [
      { id: 'avalanche', text: 'Change **one letter** and flip at least **40%** of the hash bits' },
      { id: 'crack', text: 'Crack an **unsalted** password hash with the attacker\'s table' },
      { id: 'salt', text: 'Turn **salting** on and watch the same attack fail' },
      { id: 'slow', text: 'Raise the **work factor** until a billion guesses would take **years**' }
    ],
    help: `A **hash function** (here SHA-256) turns any text into a fixed 64-character fingerprint. The same text always gives the same fingerprint, but you cannot run it backwards, and a tiny change scrambles roughly half of the 256 bits (the **avalanche effect**).

On the **Passwords** tab a website stores only hashes. If a thief steals them, an attacker looks each hash up in a table of common passwords they hashed earlier. A **salt** is a random extra string mixed into each password before hashing, so identical passwords get different hashes and a ready-made table is useless. A **work factor** (PBKDF2 rounds) makes every single guess slow: harmless for one login, ruinous for billions of guesses.

Everything here is computed for real by your browser, including the timings.`,

    mount(root, api) {
      const ui = api.ui, h = api.h, s = api.s;
      if (!HAS) {
        root.appendChild(ui.note('This lab needs the browser\'s **Web Crypto** feature, which is only available on secure pages (https or localhost). Open the site that way to compute real hashes.', 'warn'));
        return;
      }
      const log = ui.log(40);

      // ================= tab 1: fingerprints =================
      let A = 'I love backend engineering', B = A, seq = 0;
      const inA = ui.input('Message A', A, v => { A = v; updateFp(); }, { maxlength: '60' });
      const inB = ui.input('Message B', B, v => { B = v; updateFp(); }, { maxlength: '60' });
      const hexA = h('div.lab-mono'), hexB = h('div.lab-mono');
      const statBits = ui.stat('bits flipped', '–'), statPct = ui.stat('of the 256 bits', '–');
      const fpNote = h('p', { style: { margin: '8px 0 0' } });
      const cells = [];
      const grid = s('svg', { viewBox: '0 0 320 80', role: 'img', 'aria-label': 'A grid of 256 squares, one per bit of the hash. Red squares are bits that differ between A and B.', style: { width: '100%', maxWidth: '520px', display: 'block' } });
      for (let i = 0; i < 256; i++) {
        const r = s('rect', { x: (i % 32) * 10 + 1, y: Math.floor(i / 32) * 10 + 1, width: 8, height: 8, rx: 2 });
        r.style.fill = 'var(--panel-3)'; grid.appendChild(r); cells.push(r);
      }
      function paintHex(el, mine, other) {
        KS.clear(el);
        for (let i = 0; i < mine.length; i++) el.appendChild(mine[i] === other[i] ? document.createTextNode(mine[i]) : h('span', { style: { color: 'var(--bad)', fontWeight: '800' } }, mine[i]));
      }
      async function updateFp() {
        const t = ++seq;
        try {
          const ab = await Promise.all([sha256(A), sha256(B)]);
          if (!api.alive() || t !== seq) return;
          const diff = bitDiff(ab[0], ab[1]); let flipped = 0; diff.forEach(d => { flipped += d; });
          const xa = toHex(ab[0]), xb = toHex(ab[1]); const pct = Math.round(flipped / 2.56);
          paintHex(hexA, xa, xb); paintHex(hexB, xb, xa);
          cells.forEach((c, i) => { c.style.fill = diff[i] ? 'var(--bad)' : 'var(--panel-3)'; });
          statBits.set(flipped, flipped ? 'accent' : ''); statPct.set(pct + '%', flipped ? 'accent' : '');
          const dist = editDistance(A, B);
          if (A === B) fpNote.textContent = 'Both messages are identical, so the fingerprints are identical too. Now change a single letter in B (or press the button).';
          else fpNote.textContent = 'B differs from A by ' + dist + ' character edit' + (dist === 1 ? '' : 's') + ', yet ' + flipped + ' of 256 bits (' + pct + '%) flipped. A good hash flips about half of them whatever you change, so you can never "get warmer" towards a target fingerprint.';
          if (dist >= 1 && dist <= 2 && flipped >= 103) {
            if (!api.goalDone('avalanche')) log.add('**Avalanche!** A change of ' + dist + ' character flipped **' + flipped + '** bits (' + pct + '%). That is the hash doing its job.', 'good');
            api.goal('avalanche');
          }
        } catch (e) { if (api.alive()) fpNote.textContent = 'Could not compute the hash: ' + (e && e.message ? e.message : 'unknown error'); }
      }
      function nudge() {
        let b = B || A || 'a'; const chars = Array.from(b); const idx = [];
        chars.forEach((c, i) => { if (/[a-z]/i.test(c)) idx.push(i); });
        if (idx.length) {
          const i = idx[Math.floor(Math.random() * idx.length)], old = chars[i]; let n = old;
          while (n.toLowerCase() === old.toLowerCase()) n = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
          chars[i] = n; b = chars.join('');
        } else b += 'x';
        B = b; inB.set(B);
        log.add('Changed one letter in B. Compare the two fingerprints.', 'info'); updateFp();
      }
      const pane1 = h('div.lab-stack',
        h('p.muted.small', { style: { margin: 0 } }, 'A hash is a fingerprint of some text. Type in A and B (they start identical) and compare the SHA-256 fingerprints.'),
        inA, inB,
        ui.row(ui.btn('Change one letter in B', nudge, 'primary'), ui.btn('Copy A into B', () => { B = A; inB.set(B); updateFp(); }, 'ghost')),
        h('div', h('div.muted.small', 'Fingerprint of A'), hexA), h('div', h('div.muted.small', 'Fingerprint of B (red = characters that differ)'), hexB),
        ui.stats(statBits, statPct),
        h('div', h('div.muted.small', 'All 256 bits: red squares differ between A and B'), grid), fpNote);

      // ================= tab 2: passwords =================
      const users = [{ name: 'alice', pw: 'password' }, { name: 'bob', pw: 'letmein' }, { name: 'carol', pw: 'password' }, { name: 'dave', pw: 'T7#kq-vine-92' }]
        .map(u => ({ name: u.name, pw: u.pw, salt: '', hash: '', cracked: null }));
      const attackerMap = {}; let tableReady = false, salted = false, attacked = false, rseq = 0;
      const tbody = h('tbody');
      const userTable = h('div.lab-table-wrap', h('table.lab-table', h('thead', h('tr', h('th', 'User'), h('th', 'Password'), h('th', 'Stored in database'), h('th', 'Attacker'))), tbody));
      const attackTbody = h('tbody');
      const attackTable = h('div.lab-table-wrap', { style: { maxHeight: '200px' } }, h('table.lab-table', h('thead', h('tr', h('th', 'Common password'), h('th', 'SHA-256 (start)'))), attackTbody));
      function randSalt() { const b = new Uint8Array(4); crypto.getRandomValues(b); return toHex(b); }
      async function rehash() {
        const t = ++rseq;
        try {
          for (const u of users) { const hv = toHex(await sha256(u.salt + u.pw)); if (!api.alive() || t !== rseq) return; u.hash = hv; }
        } catch (e) { return; }
        renderUsers();
      }
      function renderUsers() {
        KS.clear(tbody); const seen = {};
        users.forEach(u => { (seen[u.hash] = seen[u.hash] || []).push(u.name); });
        users.forEach(u => {
          const same = (seen[u.hash] || []).filter(n => n !== u.name);
          const cls = attacked ? (u.cracked ? '.bad' : '.good') : (same.length ? '.hl' : '');
          tbody.appendChild(h('tr' + cls,
            h('td', u.name), h('td.lab-mono', u.pw),
            h('td.lab-mono', u.salt ? h('div', { style: { color: 'var(--muted)' } }, 'salt ' + u.salt) : null, h('div', u.hash ? u.hash.slice(0, 16) + '…' : '…'),
              same.length ? h('div.lab-chip.tn-warn', 'same hash as ' + same.join(', ')) : null),
            h('td', attacked ? (u.cracked ? h('span.lab-chip.tn-bad', 'cracked') : h('span.lab-chip.tn-good', 'not found')) : '–')));
        });
      }
      function attack() {
        if (!tableReady) { log.add('The attacker is still building the table, try again in a moment.', 'warn'); return; }
        if (users.some(u => !u.hash)) { log.add('Still hashing the passwords, try again in a moment.', 'warn'); return; }
        attacked = true; let n = 0;
        users.forEach(u => { u.cracked = Object.prototype.hasOwnProperty.call(attackerMap, u.hash) ? attackerMap[u.hash] : null; if (u.cracked) n++; });
        renderUsers();
        if (salted) log.add('Attacker looked every stolen hash up in the table: **' + n + ' cracked**. Each hash was made from salt + password, and the table only holds plain password hashes, so nothing matches. To use salts the attacker must re-hash every guess separately for every user.', n ? 'warn' : 'good');
        else log.add('Attacker looked every stolen hash up in the table: **' + n + ' of ' + users.length + ' cracked instantly**, with no guessing at all. Only the strong password survived.', n ? 'bad' : 'good');
        const weak = users.some(u => COMMON.indexOf(u.pw) >= 0);
        if (!salted && n > 0) api.goal('crack');
        if (salted && n === 0 && weak) api.goal('salt');
      }
      const saltToggle = ui.toggle('Salt every password', false, v => {
        salted = v; attacked = false; users.forEach(u => { u.salt = v ? randSalt() : ''; u.cracked = null; });
        log.add(v ? 'Salting **on**: each user gets a random salt that is mixed in before hashing. Identical passwords now produce different hashes.' : 'Salting **off**: hashes are just SHA-256 of the password again.', 'info');
        rehash();
      });
      const newPw = ui.input('Add a user with your own password', '', () => {}, { maxlength: '30', placeholder: 'type a password' });
      function addUser() {
        const pw = newPw.get();
        if (!pw) { log.add('Type a password in the box first.', 'warn'); return; }
        if (users.length >= 7) { log.add('That is enough users for this demo.', 'warn'); return; }
        let name = 'you'; let n = 1; while (users.some(u => u.name === name)) { n++; name = 'you' + n; }
        users.push({ name, pw, salt: salted ? randSalt() : '', hash: '', cracked: null }); attacked = false; users.forEach(u => { u.cracked = null; });
        newPw.set(''); log.add('Added **' + KS.esc(name) + '**. Press "Run the attack" to see whether your password is in the attacker\'s table.', 'info'); rehash();
      }

      // work factor
      let idx = 0, busy = false;
      const statTime = ui.stat('one guess takes', '–'), statBil = ui.stat('a billion guesses', '–');
      const slider = ui.slider('Work factor (PBKDF2 rounds)', { min: 0, max: ITERS.length - 1, value: 0, fmt: v => ITERS[v].toLocaleString('en-GB') + (ITERS[v] === 1 ? ' round' : ' rounds') }, v => { idx = v; statTime.set('–'); statBil.set('–'); });
      const measureBtn = ui.btn('Time one guess for real', measure, 'primary');
      async function measure() {
        if (busy) return; busy = true; measureBtn.disabled = true;
        const iter = ITERS[idx]; log.add('Timing real PBKDF2 with **' + iter.toLocaleString('en-GB') + '** rounds…', 'dim');
        try {
          await api.sleep(40); if (!api.alive()) return;
          let reps = 0, el = 0; const t0 = performance.now();
          do { await pbkdf2('correct horse', 'salt' + reps, iter); if (!api.alive()) return; reps++; el = performance.now() - t0; } while (el < 40 && reps < 100);
          const ms = el / reps, sec = ms / 1000 * 1e9;
          statTime.set(fmtMs(ms)); statBil.set(fmtDur(sec), sec >= YEAR ? 'good' : sec >= 3600 ? 'warn' : 'bad');
          log.add('One guess takes about **' + fmtMs(ms) + '** on your device, so a billion guesses on one machine would take about **' + fmtDur(sec) + '**.' + (sec >= YEAR ? ' Real attackers have far more hardware, which is why real sites use hundreds of thousands of rounds (or bcrypt/Argon2).' : ' That is far too quick for the attacker: raise the work factor.'), sec >= YEAR ? 'good' : 'warn');
          if (sec >= YEAR) api.goal('slow');
        } catch (e) { log.add('Could not run PBKDF2 here: ' + KS.esc(e && e.message ? e.message : 'unknown error'), 'bad'); }
        finally { busy = false; measureBtn.disabled = false; }
      }

      const pane2 = h('div.lab-stack',
        h('p.muted.small', { style: { margin: 0 } }, 'A website should store only hashes, never passwords. Here is its user table after a data breach. Alice and Carol happen to use the same password.'),
        userTable,
        ui.row(saltToggle, ui.btn('Run the attack', attack, 'danger')),
        h('div.muted.small', 'The attacker\'s pre-computed table (hashed once, reused on every breach):'), attackTable,
        ui.row(newPw, ui.btn('Add user', addUser, 'sm')),
        h('h4.lab-panel-title', { style: { margin: '10px 0 0' } }, 'Make every guess slow'),
        h('p.muted.small', { style: { margin: 0 } }, 'PBKDF2 repeats the hash many thousands of times. Pick a work factor and measure how long one guess really takes.'),
        slider, measureBtn, ui.stats(statTime, statBil));

      // ================= assemble =================
      const tabs = ui.tabs([['fp', '1 · Fingerprints', host => host.appendChild(pane1)], ['pw', '2 · Passwords', host => host.appendChild(pane2)]]);
      root.appendChild(ui.panel('Experiment', tabs.el));
      root.appendChild(ui.panel('What just happened', log.el));
      renderUsers(); updateFp(); rehash();
      log.add('Welcome. Type in the boxes: every change is hashed with real SHA-256 by your browser.', 'dim');
      (async () => {
        try {
          for (const w of COMMON) { const x = toHex(await sha256(w)); if (!api.alive()) return; attackerMap[x] = w; attackTbody.appendChild(h('tr', h('td.lab-mono', w), h('td.lab-mono', x.slice(0, 12) + '…'))); }
          tableReady = true;
        } catch (e) { log.add('Could not build the attacker table.', 'bad'); }
      })();
    }
  });
})();
