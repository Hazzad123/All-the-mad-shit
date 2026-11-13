/* Lab: pki-chain — a browser trusts a site because of a chain of real ECDSA signatures ending at a root it already trusts. */
(function () {
  'use strict';
  /*CRYPTO-BEGIN*/
  const HAS = !!(typeof crypto !== 'undefined' && crypto && crypto.subtle);
  const te = new TextEncoder();
  const ALG = { name: 'ECDSA', hash: 'SHA-256' };
  function toHex(buf) { const b = new Uint8Array(buf); let r = ''; for (let i = 0; i < b.length; i++) r += (b[i] < 16 ? '0' : '') + b[i].toString(16); return r; }
  function tbs(c) { return [c.subject, c.issuer, c.notBefore, c.notAfter, c.keyHex].join('\n'); }
  async function newKeys() { return crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']); }
  async function pubHex(pub) { return toHex(await crypto.subtle.exportKey('raw', pub)); }
  /** Build a certificate for `subject`'s public key, signed with the issuer's private key. */
  async function makeCert(f, signerPriv) {
    const c = { subject: f.subject, issuer: f.issuer, notBefore: f.notBefore, notAfter: f.notAfter, key: f.pub, keyHex: await pubHex(f.pub) };
    c.sig = new Uint8Array(await crypto.subtle.sign(ALG, signerPriv, te.encode(tbs(c))));
    return c;
  }
  async function certVerify(c, issuerKey) {
    try { return await crypto.subtle.verify(ALG, issuerKey, c.sig, te.encode(tbs(c))); } catch (e) { return false; }
  }
  /** The browser's checks, in order; stops at the first failure. Returns [{key, ok, text}]. */
  async function validate(sent, store, host, today) {
    const out = []; const leaf = sent[0];
    const nameOk = leaf.subject === host;
    out.push({ key: 'name', ok: nameOk, text: nameOk ? 'The certificate is for **' + leaf.subject + '**, the site you asked for.' : 'The certificate is for **' + leaf.subject + '** but you visited **' + host + '**. It could belong to someone else.' });
    if (!nameOk) return out;
    const path = [leaf]; let cur = leaf, missing = null;
    for (let i = 0; i < 4 && cur.issuer !== cur.subject; i++) {
      const nxt = sent.find(c => c !== cur && c.subject === cur.issuer) || store.find(c => c.subject === cur.issuer);
      if (!nxt) { missing = cur.issuer; break; }
      path.push(nxt); cur = nxt;
    }
    if (!missing && cur.issuer !== cur.subject) missing = cur.issuer;
    out.push({ key: 'chain', ok: !missing, text: missing ? 'Could not link the certificate to a trusted root: the certificate of **' + missing + '** (who signed it) was not sent and the browser does not have it.' : 'Built the chain: ' + path.map(c => '**' + c.subject + '**').join(' → ') + '.' });
    if (missing) return out;
    const bad = path.find(c => c.notBefore > today || c.notAfter < today);
    out.push({ key: 'date', ok: !bad, text: bad ? '**' + bad.subject + '** is valid ' + bad.notBefore + ' to ' + bad.notAfter + ' but today is ' + today + '.' : 'Every certificate is inside its validity dates.' });
    if (bad) return out;
    let sigBad = null;
    for (let i = 0; i < path.length && !sigBad; i++) {
      const issuer = i + 1 < path.length ? path[i + 1] : path[i];
      if (!(await certVerify(path[i], issuer.key))) sigBad = { c: path[i], by: issuer };
    }
    out.push({ key: 'sig', ok: !sigBad, text: sigBad ? 'The signature on **' + sigBad.c.subject + '** does not match its contents under **' + sigBad.by.subject + '**\'s public key. It was altered, or not signed by that key.' : 'Every signature verifies with its issuer\'s public key.' });
    if (sigBad) return out;
    const last = path[path.length - 1];
    const trusted = store.some(t => t.subject === last.subject && t.keyHex === last.keyHex);
    out.push({ key: 'root', ok: trusted, text: trusted ? 'The chain ends at **' + last.subject + '**, which is already in your trust store.' : 'The chain ends at **' + last.subject + '**, which is not in your trust store. Anyone can sign a certificate for themselves.' });
    return out;
  }
  /*CRYPTO-END*/

  const REASONS = {
    name: ['NET::ERR_CERT_COMMON_NAME_INVALID', 'The certificate is for a different site name.'],
    chain: ['NET::ERR_CERT_AUTHORITY_INVALID', 'The browser cannot link this certificate to a root it trusts.'],
    date: ['NET::ERR_CERT_DATE_INVALID', 'The certificate has expired (or is not valid yet).'],
    sig: ['NET::ERR_CERT_INVALID', 'A signature does not verify, so the certificate was tampered with.'],
    root: ['NET::ERR_CERT_AUTHORITY_INVALID', 'The certificate is signed by an authority your browser does not trust.']
  };
  const STEP_NAMES = { name: 'Does the name match?', chain: 'Can the chain be built?', date: 'Is everything in date?', sig: 'Do the signatures verify?', root: 'Does it end at a trusted root?' };
  const ORDER = ['name', 'chain', 'date', 'sig', 'root'];
  function iso(d) { return d.toISOString().slice(0, 10); }
  function shift(days) { return iso(new Date(Date.now() + days * 864e5)); }

  KS.labs.register({
    id: 'pki-chain',
    title: 'Certificate Chain',
    emoji: '📜',
    blurb: 'See why your browser trusts a website: a chain of real digital signatures leading back to a root it already knows.',
    tags: ['security', 'tls', 'certificates', 'pki', 'signatures', 'https'],
    goals: [
      { id: 'valid', text: 'Visit the site and get the **padlock**' },
      { id: 'expired', text: 'Trigger an **expired certificate** warning' },
      { id: 'name', text: 'Trigger a **name mismatch** by visiting another hostname' },
      { id: 'chain', text: 'Break the chain by **removing the intermediate**' },
      { id: 'tamper', text: '**Tamper** with a certificate and watch its signature fail' }
    ],
    help: `A **certificate** is a signed statement: "this public key belongs to shop.example.com". A **signature** is a number only the holder of a private key can produce, but anyone with the matching public key can check.

Your browser ships with a small **trust store** of root authorities. The site sends its own certificate plus an **intermediate** one. The leaf is signed by the intermediate, the intermediate by the root. If every signature verifies, the dates are fine, the name matches and the chain ends at a root in the trust store, you get a padlock.

The keys and signatures here are real ECDSA P-256, generated when the lab opened. Change anything the signature covers and verification genuinely fails.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      if (!HAS) { root.appendChild(ui.note('This lab needs the browser\'s **Web Crypto** feature, only available on secure pages (https or localhost).', 'warn')); return; }
      const log = ui.log(30);
      const opt = { expired: false, noInter: false, selfSigned: false, tamper: false, host: 'shop.example.com' };
      let certs = null, busy = false, result = null;

      // ----- certificate cards -----
      function card(title) {
        const body = h('div'), chip = h('span.lab-chip', ''); const el = h('section.lab-panel', h('h4.lab-panel-title', title), chip, body);
        return { el, body, chip };
      }
      const cRoot = card('🏛 Root CA (in your trust store)'), cInter = card('🏢 Intermediate CA'), cLeaf = card('🛍 Website certificate');
      function fill(cd, c, o) {
        o = o || {}; KS.clear(cd.body);
        cd.el.style.opacity = o.dim ? '.45' : ''; cd.el.style.borderColor = o.border || '';
        cd.chip.className = 'lab-chip' + (o.tone ? ' tn-' + o.tone : ''); cd.chip.textContent = o.chip || (o.dim ? 'not used' : 'ready');
        if (!c) { cd.body.appendChild(h('p.muted.small', o.dimText || 'Not sent by the server.')); return; }
        const row = (k, v, mono, hot) => [h('dt', k), h('dd' + (mono ? '.lab-mono' : ''), hot ? { style: { color: 'var(--bad)', fontWeight: '800' } } : null, v)];
        cd.body.appendChild(h('dl.lab-kv', { style: { marginTop: '8px' } },
          row('Subject', c.subject), row('Issuer', c.issuer), row('Valid from', c.notBefore), row('Valid to', c.notAfter + (o.edited ? '  (edited!)' : ''), false, o.edited),
          row('Public key', c.keyHex.slice(0, 18) + '…', true), row('Signature', toHex(c.sig).slice(0, 24) + '…', true)));
      }
      function leafInUse() { return opt.selfSigned ? certs.self : opt.expired ? certs.expLeaf : certs.leaf; }
      function sentLeaf() { const l = leafInUse(); return opt.tamper ? Object.assign({}, l, { notAfter: String(+l.notAfter.slice(0, 4) + 10) + l.notAfter.slice(4) }) : l; }
      function sentChain() { const c = [sentLeaf()]; if (!opt.selfSigned && !opt.noInter) c.push(certs.inter); return c; }
      function renderCards() {
        if (!certs) return;
        const r = result; const st = k => (r && r.steps ? r.steps.find(x => x.key === k) : null);
        fill(cRoot, certs.root, { chip: 'trusted', tone: 'good' });
        const ib = !opt.selfSigned && !opt.noInter;
        fill(cInter, ib ? certs.inter : null, { dim: !ib, dimText: opt.selfSigned ? 'Not needed: the site signed its own certificate.' : 'The server forgot to send this one.', chip: ib ? 'sent' : 'missing', tone: ib ? '' : 'warn' });
        const sigStep = st('sig'), bad = st('name') && !st('name').ok || st('date') && !st('date').ok || sigStep && !sigStep.ok;
        fill(cLeaf, sentLeaf(), { edited: opt.tamper, chip: opt.selfSigned ? 'self-signed' : opt.tamper ? 'edited' : opt.expired ? 'old certificate' : 'sent', tone: opt.selfSigned || opt.tamper || opt.expired ? 'warn' : '', border: bad ? 'var(--bad)' : '' });
      }

      // ----- browser result -----
      const bar = h('div.lab-mono', { style: { padding: '8px 10px', borderRadius: '10px', background: 'var(--panel-2)', border: '1px solid var(--line-2)' } }, 'https://' + opt.host);
      const verdict = h('div'), stepsLog = ui.log(8);
      function showVerdict(r) {
        KS.clear(verdict);
        if (!r) return;
        bar.textContent = (r.ok ? '🔒 ' : '⚠️ ') + 'https://' + opt.host;
        if (r.ok) verdict.appendChild(ui.note('**Padlock.** Your browser trusts this site: every link in the chain checked out.', 'good'));
        else verdict.appendChild(ui.note('**Your connection is not private.** ' + REASONS[r.fail][1] + ' \n\nError code: `' + REASONS[r.fail][0] + '`', 'bad'));
      }
      async function visit() {
        if (busy) return;
        if (!certs) { log.add('Still generating the keys, one moment…', 'warn'); return; }
        busy = true; visitBtn.disabled = true; stepsLog.clear(); KS.clear(verdict); bar.textContent = '⏳ https://' + opt.host; result = null; renderCards();
        const snap = Object.assign({}, opt);
        try {
          const steps = await validate(sentChain(), [certs.root], snap.host, iso(new Date()));
          for (const stp of steps) {
            await api.sleep(380); if (!api.alive()) return;
            stepsLog.add((stp.ok ? '✓ ' : '✗ ') + '**' + STEP_NAMES[stp.key] + '** ' + stp.text, stp.ok ? 'good' : 'bad');
          }
          for (const k of ORDER) if (!steps.find(x => x.key === k)) stepsLog.add('· ' + STEP_NAMES[k] + ' (not reached)', 'dim');
          const failed = steps.find(x => !x.ok);
          result = { ok: !failed, fail: failed ? failed.key : null, steps };
          renderCards(); showVerdict(result);
          log.add(result.ok ? 'Browser: **padlock**. Name, dates, chain and signatures all check out.' : 'Browser: **warning** (' + REASONS[result.fail][0] + '). ' + REASONS[result.fail][1], result.ok ? 'good' : 'bad');
          if (result.ok) api.goal('valid');
          if (result.fail === 'date' && snap.expired) api.goal('expired');
          if (result.fail === 'name') api.goal('name');
          if (result.fail === 'chain' && snap.noInter) api.goal('chain');
          if (result.fail === 'sig' && snap.tamper) api.goal('tamper');
        } catch (e) { stepsLog.add('Something went wrong while checking: ' + KS.esc(e && e.message || 'unknown error'), 'bad'); }
        finally { busy = false; visitBtn.disabled = false; }
      }
      const visitBtn = ui.btn('🔍 Visit the site', visit, 'primary');
      function changed(msg) { result = null; KS.clear(verdict); stepsLog.clear(); bar.textContent = 'https://' + opt.host; log.add(msg, 'info'); renderCards(); }

      const controls = ui.panel('Break things, then press Visit',
        ui.select('Address you type in the browser', [['shop.example.com', 'shop.example.com (correct)'], ['shop.example.org', 'shop.example.org'], ['shop.exarnple.com', 'shop.exarnple.com (look-alike)']], opt.host, v => { opt.host = v; changed('You will visit **' + v + '**.'); }),
        ui.toggle('Server sends an old, expired certificate', false, v => { opt.expired = v; changed(v ? 'The server now presents a certificate that expired last month (properly signed back then).' : 'The server presents its current certificate.'); }),
        ui.toggle('Server forgets to send the intermediate', false, v => { opt.noInter = v; changed(v ? 'The intermediate certificate will not be sent.' : 'The server sends the intermediate again.'); }),
        ui.toggle('Server signs its own certificate (self-signed)', false, v => { opt.selfSigned = v; changed(v ? 'The server made up its own certificate and signed it with its own key.' : 'The server presents the properly issued certificate.'); }),
        ui.toggle('Tamper: stretch the expiry by 10 years (no re-signing)', false, v => { opt.tamper = v; changed(v ? 'Someone edited the "valid to" date on the certificate but cannot re-sign it.' : 'The certificate is back to its original contents.'); }),
        visitBtn);

      root.appendChild(h('div.lab-grid3', cRoot.el, cInter.el, cLeaf.el));
      root.appendChild(h('div.lab-grid2.even', controls, ui.panel('The browser', bar, h('div', { style: { marginTop: '8px' } }, stepsLog.el), h('div', { style: { marginTop: '8px' } }, verdict))));
      root.appendChild(ui.panel('What just happened', log.el));
      fill(cRoot, null, { dim: true, dimText: 'Generating real ECDSA keys…', chip: 'working' }); fill(cInter, null, { dim: true, dimText: 'Generating…', chip: 'working' }); fill(cLeaf, null, { dim: true, dimText: 'Generating…', chip: 'working' });
      visitBtn.disabled = true;

      (async () => {
        try {
          const ks = await Promise.all([newKeys(), newKeys(), newKeys(), newKeys()]);
          const rootC = await makeCert({ subject: 'Keystone Root CA', issuer: 'Keystone Root CA', notBefore: shift(-1800), notAfter: shift(5000), pub: ks[0].publicKey }, ks[0].privateKey);
          const inter = await makeCert({ subject: 'Keystone Intermediate CA', issuer: 'Keystone Root CA', notBefore: shift(-900), notAfter: shift(1500), pub: ks[1].publicKey }, ks[0].privateKey);
          const leaf = await makeCert({ subject: 'shop.example.com', issuer: 'Keystone Intermediate CA', notBefore: shift(-30), notAfter: shift(60), pub: ks[2].publicKey }, ks[1].privateKey);
          const expLeaf = await makeCert({ subject: 'shop.example.com', issuer: 'Keystone Intermediate CA', notBefore: shift(-120), notAfter: shift(-30), pub: ks[2].publicKey }, ks[1].privateKey);
          const self = await makeCert({ subject: 'shop.example.com', issuer: 'shop.example.com', notBefore: shift(-30), notAfter: shift(60), pub: ks[3].publicKey }, ks[3].privateKey);
          if (!api.alive()) return;
          certs = { root: rootC, inter, leaf, expLeaf, self };
          visitBtn.disabled = false; renderCards();
          log.add('Generated four real ECDSA P-256 key pairs and signed the certificates: the root signed the intermediate, the intermediate signed the website. Press **Visit the site**.', 'dim');
        } catch (e) { if (api.alive()) { KS.clear(root); root.appendChild(ui.note('Could not generate keys in this browser: ' + KS.esc(e && e.message || 'unknown error'), 'warn')); } }
      })();
    }
  });
})();
