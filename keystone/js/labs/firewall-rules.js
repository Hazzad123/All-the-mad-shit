/* Lab: firewall-rules — rules are checked top to bottom, the first match wins, and the safe default is deny. */
(function () {
  // <model>
  const SRC = { any: 'Anyone', office: 'The office', app: 'App server' };
  const PORT_NAME = { 22: 'SSH (22)', 80: 'web (80)', 443: 'secure web (443)', 5432: 'database (5432)', any: 'any port' };
  const PACKETS = [
    { id: 'v443', who: 'Visitor', group: 'internet', port: 443, want: 'allow', note: 'a customer browsing the site' },
    { id: 'v80', who: 'Visitor', group: 'internet', port: 80, want: 'allow', note: 'a customer on plain http' },
    { id: 'a22', who: 'Attacker', group: 'internet', port: 22, want: 'deny', note: 'trying to log in over SSH' },
    { id: 'v22', who: 'Visitor', group: 'internet', port: 22, want: 'deny', note: 'nobody outside needs SSH' },
    { id: 'admin22', who: 'Office admin', group: 'office', port: 22, want: 'allow', note: 'the admin fixing the server' },
    { id: 'app5432', who: 'App server', group: 'app', port: 5432, want: 'allow', note: 'the app reading its database' },
    { id: 's5432', who: 'Stranger', group: 'internet', port: 5432, want: 'deny', note: 'poking at the database from outside' }
  ];
  function ruleMatches(r, p) { return (r.src === 'any' || r.src === p.group) && (r.port === 'any' || r.port === p.port); }
  // evaluate(): first matching rule wins. `shadowed` = a later rule that would have disagreed but never got a say.
  function evaluate(rules, policy, p) {
    let idx = -1;
    for (let i = 0; i < rules.length; i++) if (ruleMatches(rules[i], p)) { idx = i; break; }
    const action = idx >= 0 ? rules[idx].action : policy;
    let shadowed = -1;
    if (idx >= 0) for (let j = idx + 1; j < rules.length; j++) if (ruleMatches(rules[j], p) && rules[j].action !== action) { shadowed = j; break; }
    return { idx: idx, action: action, ok: action === p.want, shadowed: shadowed };
  }
  function ruleText(r) { return r.action + ' ' + SRC[r.src] + ' → ' + PORT_NAME[r.port]; }
  // </model>

  const NODE_FOR = { internet: ['Internet', '🌐'], office: ['Office', '🏢'], app: ['App server', '🧩'] };

  KS.labs.register({
    id: 'firewall-rules',
    title: 'Firewall Rules',
    emoji: '🧱',
    blurb: 'Write firewall rules, fire test packets at them, and learn why order matters and why the safe default is deny.',
    tags: ['security', 'firewall', 'networking', 'ports', 'access control'],
    goals: [
      { id: 'web', text: 'Let **public web traffic** in while blocking the rest of the internet' },
      { id: 'ssh', text: 'Allow **SSH only from the office**' },
      { id: 'order', text: 'Load the **order bug** preset and fix it by moving a rule' },
      { id: 'all', text: 'Get **every** test packet right with **default deny**' }
    ],
    help: `A **firewall** stands in front of your servers and decides which network packets may pass. Each packet has a **source** (who sent it) and a **port** (which door it knocks on: 22 is remote login, 80 and 443 are web, 5432 is a database).

You write an ordered list of **rules**. The firewall reads them **top to bottom** and obeys the **first rule that matches**: later rules are never consulted for that packet. So a broad rule placed too high can *shadow* a more specific one below it.

If nothing matches, the **default policy** applies. *Allow by default* means you must remember to block everything dangerous; *deny by default* means you only open what you need, which is far safer.

Press **Fire all** to send the test packets. Each shows which rule caught it and whether that was the outcome you wanted.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      let rules = [], policy = 'allow', nextId = 1, results = {}, busy = false, run = 0, hl = -1;
      let bugDeny = 0, bugOffice = 0, newAction = 'allow', newSrc = 'any', newPort = '443';
      const nodes = {};
      Object.keys(NODE_FOR).forEach(k => { nodes[k] = ui.node(NODE_FOR[k][0], NODE_FOR[k][1], { small: true }); });
      const fw = ui.node('Firewall', '🧱', { tone: 'warn' }), server = ui.node('Your server', '🖥️', { sub: 'web · ssh · database' });
      const stage = ui.stage();
      stage.el.appendChild(ui.cols([nodes.internet, nodes.office, nodes.app], [fw], [server]));
      Object.keys(nodes).forEach(k => stage.wire(nodes[k], fw)); stage.wire(fw, server);

      const rulesEl = h('div', { style: { display: 'grid', gap: '8px' } });
      const tbody = h('tbody');
      const log = ui.log(50);
      const score = ui.stat('packets right', '0 / ' + PACKETS.length), polStat = ui.stat('default', 'allow', 'bad');
      const fireBtn = ui.btn('🔥 Fire all test packets', () => fireAll(), 'primary');
      const polSeg = ui.seg([['deny', 'Deny by default'], ['allow', 'Allow by default']], policy, v => { policy = v; changed('Default policy is now **' + v + '**.'); });
      const srcOpts = [['any', 'Anyone'], ['office', 'The office'], ['app', 'App server']];
      const portOpts = [['22', 'SSH (22)'], ['80', 'web (80)'], ['443', 'secure web (443)'], ['5432', 'database (5432)'], ['any', 'any port']];

      root.appendChild(ui.panel('Rules (checked top to bottom, first match wins)', rulesEl,
        h('div', { style: { height: '10px' } }),
        ui.row(ui.select('Action', [['allow', 'Allow'], ['deny', 'Deny']], newAction, v => { newAction = v; }), ui.select('From', srcOpts, newSrc, v => { newSrc = v; }), ui.select('Port', portOpts, newPort, v => { newPort = v; }), ui.btn('➕ Add rule', () => addRule(), 'sm')),
        h('div', { style: { height: '10px' } }),
        ui.row(polSeg), h('p.muted.small', { style: { margin: '10px 0 6px' } }, 'Presets:'),
        ui.row(ui.btn('Rule-order bug', () => preset('bug'), 'sm'), ui.btn('Sensible set', () => preset('good'), 'sm'), ui.btn('Clear all', () => preset('clear'), 'sm'))));
      root.appendChild(stage.el);
      root.appendChild(h('div.lab-grid2', ui.panel('Test packets', fireBtn, h('div', { style: { height: '8px' } }), h('div.lab-table-wrap', h('table.lab-table', h('thead', h('tr', h('th', 'packet'), h('th', 'wanted'), h('th', 'result'))), tbody)), h('div', { style: { height: '10px' } }), ui.stats(score, polStat)), ui.panel('What just happened', log.el)));

      // ---------- editing ----------
      function newRule(action, src, port) { return { id: nextId++, action: action, src: src, port: port === 'any' ? 'any' : +port }; }
      function changed(msg) { run++; busy = false; results = {}; hl = -1; if (msg) log.add(msg, 'info'); render(); }
      function addRule() { rules.push(newRule(newAction, newSrc, newPort)); changed('Added rule **#' + rules.length + '**: ' + ruleText(rules[rules.length - 1]) + '. Packets must be fired again.'); }
      function move(i, d) { const j = i + d; if (j < 0 || j >= rules.length) return; const t = rules[i]; rules[i] = rules[j]; rules[j] = t; changed('Moved a rule ' + (d < 0 ? 'up' : 'down') + '. Order matters, so fire the packets again.'); }
      function del(i) { if (i < 0 || i >= rules.length) return; const r = rules.splice(i, 1)[0]; changed('Deleted rule: ' + ruleText(r) + '.'); }
      function preset(name) {
        rules = []; bugDeny = 0; bugOffice = 0;
        if (name === 'bug') {
          policy = 'deny';
          const d = newRule('deny', 'any', 22), o = newRule('allow', 'office', 22);
          rules.push(d, o, newRule('allow', 'any', 80), newRule('allow', 'any', 443), newRule('allow', 'app', 5432));
          bugDeny = d.id; bugOffice = o.id;
        } else if (name === 'good') {
          policy = 'deny';
          rules.push(newRule('allow', 'any', 80), newRule('allow', 'any', 443), newRule('allow', 'office', 22), newRule('allow', 'app', 5432));
        }
        polSeg.set(policy);
        changed(name === 'bug' ? 'Loaded a **buggy** rule set: the admin cannot log in. Fire the packets and find out why.' : name === 'good' ? 'Loaded a sensible rule set with **deny** by default.' : 'All rules removed.');
      }

      // ---------- firing ----------
      function explain(p, r) {
        const where = r.idx >= 0 ? 'matched rule **#' + (r.idx + 1) + '** (' + ruleText(rules[r.idx]) + ')' : 'matched **no rule**, so the default policy (**' + policy + '**) decided';
        let s = p.who + ' → ' + PORT_NAME[p.port] + ': ' + where + ' → **' + (r.action === 'allow' ? 'ALLOWED' : 'BLOCKED') + '**. ' + (r.ok ? '✓ as wanted.' : '✗ wrong, you wanted it ' + (p.want === 'allow' ? 'allowed' : 'blocked') + '.');
        if (r.shadowed >= 0) s += ' (Rule #' + (r.shadowed + 1 ) + ' would have said the opposite, but **first match wins**, so it never got a say.)';
        return s;
      }
      async function fireOne(p, animate, my) {
        const r = evaluate(rules, policy, p);
        if (animate) {
          const src = nodes[p.group];
          await stage.send(src, fw, { label: String(p.port), ms: 300 }); if (!api.alive() || my !== run) return false;
          hl = r.idx; renderRules();
          if (r.action === 'allow') { fw.pulse('good'); await stage.send(fw, server, { label: String(p.port), tone: 'good', ms: 300 }); if (!api.alive() || my !== run) return false; server.pulse('good'); }
          else { fw.pulse('bad'); await api.sleep(200); if (!api.alive() || my !== run) return false; }
        }
        results[p.id] = r;
        log.add(explain(p, r), r.ok ? 'good' : 'bad');
        renderTable(); check();
        return true;
      }
      async function fireAll() {
        if (busy) return;
        busy = true; const my = ++run; results = {}; render();
        for (let i = 0; i < PACKETS.length; i++) {
          const ok = await fireOne(PACKETS[i], true, my);
          if (!ok || !api.alive() || my !== run) return;
        }
        busy = false; render();
        const right = PACKETS.filter(p => results[p.id] && results[p.id].ok).length;
        log.add(right === PACKETS.length ? '🎉 Every packet got the outcome you wanted.' : right + ' of ' + PACKETS.length + ' packets right. Look at the red rows: which rule caught them?', right === PACKETS.length ? 'good' : 'warn');
      }
      function good(ids, ok) { return ids.every(id => results[id] && results[id].ok); }
      function check() {
        if (good(['v443', 'v80', 'a22', 'v22', 's5432'])) api.goal('web');
        if (good(['admin22', 'a22', 'v22'])) api.goal('ssh');
        const allRight = good(PACKETS.map(p => p.id));
        if (allRight && policy === 'deny') api.goal('all');
        const di = rules.findIndex(r => r.id === bugDeny), oi = rules.findIndex(r => r.id === bugOffice);
        if (bugDeny && allRight && di >= 0 && oi >= 0 && oi < di) api.goal('order');
      }

      // ---------- render ----------
      function renderRules() {
        KS.clear(rulesEl);
        if (!rules.length) rulesEl.appendChild(h('p.muted.small', { style: { margin: '0' } }, 'No rules yet, so the default policy decides everything.'));
        rules.forEach((r, i) => {
          const sel = (opts, val, fn) => ui.select('', opts, String(val), fn);
          rulesEl.appendChild(h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', padding: '8px', borderRadius: '12px', border: '2px solid ' + (hl === i ? 'var(--accent)' : 'var(--line)'), background: 'var(--panel-2)' } },
            h('span.lab-chip', '#' + (i + 1)),
            h('button.btn.sm', { type: 'button', style: { minWidth: '72px', color: r.action === 'allow' ? 'var(--good)' : 'var(--bad)' }, 'aria-label': 'Toggle allow or deny', onclick: () => { r.action = r.action === 'allow' ? 'deny' : 'allow'; changed('Rule #' + (i + 1) + ' is now **' + r.action + '**.'); } }, r.action === 'allow' ? '✅ allow' : '⛔ deny'),
            sel(srcOpts, r.src, v => { r.src = v; changed('Rule #' + (i + 1) + ' now applies to **' + SRC[v] + '**.'); }),
            sel(portOpts, r.port, v => { r.port = v === 'any' ? 'any' : +v; changed('Rule #' + (i + 1) + ' now applies to **' + PORT_NAME[r.port] + '**.'); }),
            h('button.btn.sm', { type: 'button', 'aria-label': 'Move up', disabled: i === 0, onclick: () => move(i, -1) }, '↑'),
            h('button.btn.sm', { type: 'button', 'aria-label': 'Move down', disabled: i === rules.length - 1, onclick: () => move(i, 1) }, '↓'),
            h('button.btn.sm.danger', { type: 'button', 'aria-label': 'Delete rule', onclick: () => del(i) }, '✕')));
        });
      }
      function renderTable() {
        KS.clear(tbody);
        PACKETS.forEach(p => {
          const r = results[p.id];
          const res = r ? h('span', h('span.lab-chip.tn-' + (r.ok ? 'good' : 'bad'), (r.action === 'allow' ? 'passed' : 'blocked') + ' ' + (r.ok ? '✓' : '✗')), h('div.muted.small', r.idx >= 0 ? 'rule #' + (r.idx + 1) : 'default policy'))
            : h('button.btn.sm', { type: 'button', disabled: busy, onclick: () => { if (!busy) fireOne(p, false, run); } }, 'Fire');
          tbody.appendChild(h('tr' + (r ? (r.ok ? '.good' : '.bad') : ''), h('td', h('b', p.who + ' → ' + p.port), h('div.muted.small', p.note)), h('td', p.want === 'allow' ? '✅ pass' : '⛔ block'), h('td', res)));
        });
        const right = PACKETS.filter(p => results[p.id] && results[p.id].ok).length;
        score.set(right + ' / ' + PACKETS.length, right === PACKETS.length ? 'good' : 'accent');
      }
      function render() {
        renderRules(); renderTable();
        fireBtn.disabled = busy; fireBtn.textContent = busy ? '… firing' : '🔥 Fire all test packets';
        polStat.set(policy, policy === 'deny' ? 'good' : 'bad'); polSeg.set(policy);
      }

      render();
      log.add('The firewall starts with **no rules** and **allow** by default: everything gets in. Press **Fire all** and see.', 'dim');
      return () => stage.destroy();
    }
  });
})();
