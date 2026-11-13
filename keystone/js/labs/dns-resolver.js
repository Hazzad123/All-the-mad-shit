/* Lab: dns-resolver — name lookups are a chain of referrals (root -> TLD -> authoritative); caching makes most of them instant. */
(function () {
  // <model>
  const TLD_NS = { com: 'a.gtld-servers.net', org: 'a0.org.afilias-nst.info' };
  const ZONES = {
    'example.com': { ns: 'ns1.example.com', recs: {
      'example.com': { A: ['93.184.216.34', 300], AAAA: ['2606:2800:220:1::1946', 300], MX: ['10 mail.example.com', 3600] },
      'www.example.com': { CNAME: ['example.com', 120] } } },
    'example.org': { ns: 'ns1.example.org', recs: {
      'shop.example.org': { A: ['203.0.113.50', 60] },
      'example.org': { A: ['198.51.100.7', 300] } } }
  };
  const NS_TTL = 172800;
  function parts(name) { const l = name.split('.'); return { tld: l[l.length - 1], zone: l.slice(-2).join('.') }; }
  // plan(): decides, from the cache alone, exactly which conversations a lookup needs. `cache` is a Map key -> {value, expires}.
  function plan(name, type, cache, now) {
    const ev = [], local = new Map();
    cache.forEach(function (v, k) { if (v.expires > now) local.set(k, v); });
    const chain = [name]; let cur = name, upstream = 0, cname = false, answer = null, ms = 1, ended = false;
    function remember(key, value, ttl) { local.set(key, { value: value, expires: now + ttl }); return { key: key, value: value, ttl: ttl }; }
    for (let guard = 0; guard < 6 && !ended; guard++) {
      const direct = local.get(cur + '|' + type);
      if (direct) { ev.push({ kind: 'hit', key: cur + '|' + type, name: cur, type: type, value: direct.value, left: Math.round(direct.expires - now), final: true }); answer = { value: direct.value, type: type }; ended = true; break; }
      const alias = type !== 'CNAME' ? local.get(cur + '|CNAME') : null;
      if (alias) { ev.push({ kind: 'hit', key: cur + '|CNAME', name: cur, type: 'CNAME', value: alias.value, left: Math.round(alias.expires - now), final: false }); cname = true; cur = alias.value; chain.push(cur); continue; }
      ev.push({ kind: 'miss', name: cur, type: type });
      const p = parts(cur);
      if (!local.get('NS|' + p.zone)) {
        if (!local.get('NS|' + p.tld)) {
          upstream++; ms += 30;
          ev.push({ kind: 'ask', to: 'root', q: type + '? ' + cur, say: 'Root: I do not know **' + cur + '**, but I know who runs **.' + p.tld + '**. Ask `' + TLD_NS[p.tld] + '`.', tone: 'info', store: [remember('NS|' + p.tld, TLD_NS[p.tld], NS_TTL)], ms: 30, tld: p.tld, zone: p.zone });
        } else ev.push({ kind: 'note', say: 'Resolver remembers who runs **.' + p.tld + '**, so it **skips the root server**.' });
        upstream++; ms += 30;
        ev.push({ kind: 'ask', to: 'tld', q: type + '? ' + cur, say: 'TLD server: I do not hold the address, but **' + p.zone + '** is looked after by `' + ZONES[p.zone].ns + '`. Ask it.', tone: 'info', store: [remember('NS|' + p.zone, ZONES[p.zone].ns, NS_TTL)], ms: 30, tld: p.tld, zone: p.zone });
      } else ev.push({ kind: 'note', say: 'Resolver remembers who runs **' + p.zone + '**, so it **goes straight to its own server**.' });
      upstream++; ms += 40;
      const rec = ZONES[p.zone].recs[cur];
      const base = { kind: 'ask', to: 'auth', q: type + '? ' + cur, ms: 40, tld: p.tld, zone: p.zone };
      if (!rec) { ev.push(Object.assign(base, { say: 'Authoritative: **' + cur + '** does not exist (NXDOMAIN).', tone: 'bad', store: [] })); ended = true; break; }
      if (rec[type]) { const r = rec[type]; ev.push(Object.assign(base, { say: 'Authoritative: **' + cur + '** ' + type + ' is **' + r[0] + '**. Keep it for ' + r[1] + ' s (its TTL).', tone: 'good', store: [remember(cur + '|' + type, r[0], r[1])] })); answer = { value: r[0], type: type }; ended = true; break; }
      if (rec.CNAME && type !== 'CNAME') {
        const c = rec.CNAME; cname = true;
        ev.push(Object.assign(base, { say: 'Authoritative: **' + cur + '** is just an **alias** (CNAME) for **' + c[0] + '**. Go and ask about that name instead.', tone: 'warn', store: [remember(cur + '|CNAME', c[0], c[1])] }));
        cur = c[0]; chain.push(cur); continue;
      }
      ev.push(Object.assign(base, { say: 'Authoritative: **' + cur + '** exists but has no ' + type + ' record.', tone: 'warn', store: [] })); ended = true;
    }
    return { events: ev, answer: answer, upstream: upstream, cname: cname, chain: chain, ms: ms };
  }
  // </model>

  function fmtTtl(s) { s = Math.max(0, Math.round(s)); if (s < 120) return s + ' s'; if (s < 7200) return Math.round(s / 60) + ' min'; if (s < 172800) return Math.round(s / 3600) + ' h'; return Math.round(s / 86400) + ' days'; }

  KS.labs.register({
    id: 'dns-resolver',
    title: 'DNS Resolver',
    emoji: '📒',
    blurb: 'Follow a name lookup from your laptop through root, TLD and authoritative servers, then watch the cache make it instant.',
    tags: ['dns', 'caching', 'ttl', 'cname', 'networking'],
    goals: [
      { id: 'cold', text: 'Resolve a name **the long way** (root, TLD, authoritative)' },
      { id: 'hit', text: 'Resolve it again and get the answer **from cache** with no upstream queries' },
      { id: 'expire', text: 'Let a **TTL run out** and watch the resolver ask again' },
      { id: 'cname', text: 'Resolve a **CNAME** (try www.example.com) and spot the extra hop' }
    ],
    help: `Your laptop never walks the DNS tree itself. It asks a **resolver** (usually your internet provider's), and the resolver does the legwork.

1. The **root server** knows who runs each ending (.com, .org...).
2. The **TLD server** knows who runs each domain (example.com).
3. The **authoritative server** holds the real records.

Every answer carries a **TTL** (time to live): how many seconds it may be remembered. The resolver's **cache** table shows these counting down. While an entry is fresh, the next lookup costs nothing. When it expires, the chain runs again.

A **CNAME** is an alias: "www is another name for example.com". It costs an extra lookup. **A** = IPv4 address, **AAAA** = IPv6, **MX** = where mail goes. The clock here is simulated: use the *wait* buttons to jump ahead.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const cache = new Map();          // key 'name|TYPE' -> {value, expires}
      const expiredKeys = new Set();
      let now = 0, busy = false, name = 'example.com', type = 'A', lookups = 0, totalUp = 0, touched = '';

      const laptop = ui.node('Your laptop', '💻'), resolver = ui.node('Resolver', '🧭', { tone: 'accent', sub: 'does the legwork' });
      const rootN = ui.node('Root server', '🌍', { sub: '.' }), tldN = ui.node('TLD server', '🏷️', { sub: '.com / .org' }), authN = ui.node('Authoritative', '📚', { sub: 'holds the records' });
      [rootN, tldN, authN].forEach(n => n.setState('idle'));
      const stage = ui.stage();
      stage.el.appendChild(ui.cols([laptop], [resolver], [rootN, tldN, authN]));
      stage.wire(laptop, resolver); stage.wire(resolver, rootN, { dashed: true }); stage.wire(resolver, tldN, { dashed: true }); stage.wire(resolver, authN, { dashed: true });

      const log = ui.log(60);
      const answerBox = h('div');
      const statUp = ui.stat('upstream queries', '–'), statMs = ui.stat('time (approx)', '–'), statClock = ui.stat('clock', '0 s', 'accent');
      const tbody = h('tbody');
      const table = h('table.lab-table', h('thead', h('tr', h('th', 'name'), h('th', 'type'), h('th', 'value'), h('th', 'TTL left'))), tbody);

      const nameSel = ui.select('Name', [['example.com', 'example.com'], ['www.example.com', 'www.example.com (alias)'], ['shop.example.org', 'shop.example.org'], ['missing.example.com', 'missing.example.com (no such name)']], name, v => { name = v; });
      const typeSel = ui.select('Record type', [['A', 'A (IPv4 address)'], ['AAAA', 'AAAA (IPv6 address)'], ['CNAME', 'CNAME (alias)'], ['MX', 'MX (mail)']], type, v => { type = v; });
      const goBtn = ui.btn('🔎 Resolve', () => resolve(), 'primary');
      const waitBtns = [['⏱ Wait 30 s', 30], ['⏱ Wait 5 min', 300], ['⏱ Wait 1 hour', 3600]].map(w => ui.btn(w[0], () => advance(w[1]), 'sm'));
      const clearBtn = ui.btn('🧹 Empty cache', () => { if (busy) return; cache.clear(); log.add('Cache emptied. The next lookup starts from scratch.', 'warn'); renderCache(); }, 'sm');

      root.appendChild(ui.panel('Ask a question', ui.row(nameSel, typeSel, goBtn), ui.row(waitBtns, clearBtn)));
      root.appendChild(stage.el);
      root.appendChild(answerBox);
      root.appendChild(h('div.lab-grid2', ui.panel('What just happened', log.el), h('div.lab-stack', ui.panel('Resolver cache', h('div.lab-table-wrap', table)), ui.stats(statUp, statMs, statClock))));
      log.add('Pick a name and press **Resolve**. The resolver starts with an empty cache.', 'dim');
      renderCache();

      // ---------- cache ----------
      function purge() {
        let n = 0;
        cache.forEach((v, k) => { if (v.expires <= now) { cache.delete(k); expiredKeys.add(k); n++; const p = k.split('|'); if (p[0] !== 'NS') log.add('Cache: **' + p[0] + ' ' + p[1] + '** expired (its TTL ran out). It is forgotten.', 'warn'); } });
        return n;
      }
      function renderCache() {
        KS.clear(tbody);
        const keys = Array.from(cache.keys());
        if (!keys.length) tbody.appendChild(h('tr.dim', h('td', { colspan: '4' }, '(empty, every lookup will go upstream)')));
        keys.forEach(k => {
          const v = cache.get(k), p = k.split('|'), isNs = p[0] === 'NS';
          const left = v.expires - now;
          tbody.appendChild(h('tr' + (k === touched ? '.hl' : (isNs ? '.dim' : '')), h('td.lab-mono', isNs ? (p[1].indexOf('.') < 0 ? '.' + p[1] : p[1]) : p[0]), h('td', p[1] === undefined || isNs ? 'NS' : p[1]), h('td.lab-mono', v.value), h('td', fmtTtl(left))));
        });
        statClock.set(fmtTtl(now));
      }
      function advance(sec) {
        if (busy) return;
        now += sec; const n = purge(); renderCache();
        log.add('⏱ Time passes: **' + fmtTtl(sec) + '**.' + (n ? '' : ' Nothing in the cache expired yet.'), 'dim');
      }

      // ---------- lookup ----------
      async function resolve() {
        if (busy) return;
        busy = true; goBtn.disabled = true; waitBtns.forEach(b => { b.disabled = true; }); answerBox.textContent = ''; touched = '';
        try {
          purge();
          const q = name, t = type;
          const pl = plan(q, t, cache, now);
          lookups++;
          log.add('**Laptop → Resolver:** "what is the **' + t + '** record for **' + q + '**?"', 'info');
          laptop.setState('active');
          await stage.send(laptop, resolver, { label: t + '? ' + q, ms: 360 }); if (!api.alive()) return;
          laptop.setState('');
          let reQueried = false, coldPath = false;
          for (let i = 0; i < pl.events.length; i++) {
            const e = pl.events[i];
            if (e.kind === 'miss') { log.add('Resolver: checking my cache for **' + e.name + ' ' + e.type + '**... not there.', 'dim'); resolver.pulse(); await api.sleep(250); if (!api.alive()) return; }
            else if (e.kind === 'note') { log.add(e.say, 'info'); await api.sleep(250); if (!api.alive()) return; }
            else if (e.kind === 'hit') {
              log.add('Resolver cache: **' + e.name + ' ' + e.type + '** is already stored (' + fmtTtl(e.left) + ' left)' + (e.final ? '. **No need to ask anyone.**' : '. It is an alias, so I look up **' + e.value + '** next.'), 'good');
              resolver.pulse('good'); touched = e.key; renderCache(); await api.sleep(450); if (!api.alive()) return;
            } else if (e.kind === 'ask') {
              const node = e.to === 'root' ? rootN : (e.to === 'tld' ? tldN : authN);
              if (e.to === 'tld') tldN.setSub('.' + e.tld); if (e.to === 'auth') authN.setSub(e.zone);
              log.add('**Resolver → ' + (e.to === 'root' ? 'Root' : (e.to === 'tld' ? 'TLD' : 'Authoritative')) + ':** "' + e.q + '"', 'info');
              node.setState('active');
              await stage.send(resolver, node, { label: e.q, ms: 380 }); if (!api.alive()) return;
              log.add(e.say, e.tone);
              (e.store || []).forEach(s => { cache.set(s.key, { value: s.value, expires: now + s.ttl }); touched = s.key; if (expiredKeys.has(s.key)) { reQueried = true; expiredKeys.delete(s.key); } });
              renderCache();
              await stage.send(node, resolver, { tone: e.tone === 'bad' ? 'bad' : 'good', ms: 320 }); if (!api.alive()) return;
              node.setState('idle'); node.pulse(e.tone === 'bad' ? 'bad' : 'good');
              if (e.to === 'root') coldPath = true;
            }
          }
          totalUp += pl.upstream;
          const chainTxt = pl.chain.join(' → ');
          const ok = !!pl.answer;
          const txt = ok ? (pl.chain.length > 1 ? chainTxt + ' → ' : q + ' → ') + '**' + pl.answer.value + '**' : 'No answer for **' + q + '** (' + t + ').';
          log.add('**Resolver → Laptop:** ' + txt + (pl.upstream === 0 ? '  (instant: straight from cache)' : '  (' + KS.plural(pl.upstream, 'upstream query', 'upstream queries') + ')'), ok ? 'good' : 'warn');
          await stage.send(resolver, laptop, { tone: ok ? 'good' : 'warn', ms: 360 }); if (!api.alive()) return;
          answerBox.appendChild(ui.note((ok ? '✅ ' : '⚠️ ') + txt + '  \nUpstream queries: **' + pl.upstream + '** · about **' + pl.ms + ' ms**', ok ? 'good' : 'warn'));
          statUp.set(pl.upstream, pl.upstream ? 'warn' : 'good'); statMs.set(pl.ms + ' ms');
          renderCache();
          // goals, from what really happened
          if (ok && coldPath && pl.upstream >= 3) api.goal('cold');
          if (ok && pl.upstream === 0) api.goal('hit');
          if (ok && reQueried) api.goal('expire');
          if (ok && pl.cname) api.goal('cname');
        } finally {
          busy = false;
          if (api.alive()) { goBtn.disabled = false; waitBtns.forEach(b => { b.disabled = false; }); [laptop].forEach(n => n.setState('')); }
        }
      }

      api.every(1000, () => { if (busy) return; now += 1; purge(); renderCache(); });
      return () => stage.destroy();
    }
  });
})();
