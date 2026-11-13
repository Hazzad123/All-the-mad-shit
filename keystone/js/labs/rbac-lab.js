/* Lab: rbac-lab — authorization is a function of who, what and which thing; the default answer is no. */
(function () {
  // <pure>
  const PERMS = ['doc:read', 'doc:edit', 'doc:delete', 'invoice:read', 'user:manage'];
  /** RBAC: cfg = { users: {name: [roles]}, roles: {role: [perms]} } */
  function rbacDecide(cfg, user, perm) {
    const roles = (cfg.users[user] || []).slice();
    const have = [];
    roles.forEach(function (r) { (cfg.roles[r] || []).forEach(function (p) { if (have.indexOf(p) < 0) have.push(p); }); });
    const granting = roles.filter(function (r) { return (cfg.roles[r] || []).indexOf(perm) >= 0; });
    const trace = [user + ' has the roles: ' + (roles.join(', ') || '(none)'),
      'Those roles grant: ' + (have.join(', ') || '(nothing)'), 'This action needs: ' + perm];
    if (granting.length) { trace.push('Role "' + granting[0] + '" grants ' + perm + ' → ALLOW'); return { allow: true, reason: 'role', via: granting, trace: trace }; }
    trace.push('No role grants it → DENY (the default answer is no)');
    return { allow: false, reason: 'default', via: [], trace: trace };
  }
  /** ABAC rules. Deny rules are checked first and always win; then allow rules; otherwise default deny. */
  const RULES = [
    { id: 'owner', kind: 'allow', text: 'Owners may edit and delete their own documents', when: function (u, a, d) { return (a === 'edit' || a === 'delete') && d.owner === u.name; } },
    { id: 'dept', kind: 'allow', text: 'Same department may read', when: function (u, a, d) { return a === 'read' && u.dept === d.dept; } },
    { id: 'clear', kind: 'deny', text: 'Confidential needs clearance 2 or more', when: function (u, a, d) { return d.cls === 'confidential' && u.clearance < 2; } },
    { id: 'net', kind: 'deny', text: 'Confidential only from the office network', when: function (u, a, d, c) { return d.cls === 'confidential' && !c.office; } },
    { id: 'hours', kind: 'deny', text: 'No deletes outside office hours', when: function (u, a, d, c) { return a === 'delete' && !c.hours; } }
  ];
  /** on: {ruleId: bool}; user {name, dept, clearance}; doc {name, owner, dept, cls}; ctx {hours, office} */
  function abacDecide(on, user, action, doc, ctx) {
    const trace = [user.name + ' (' + user.dept + ', clearance ' + user.clearance + ') wants to ' + action + ' "' + doc.name + '" (owner ' + doc.owner + ', ' + doc.dept + ', ' + doc.cls + ')'];
    const active = RULES.filter(function (r) { return on[r.id]; });
    if (!active.length) trace.push('No rules are switched on.');
    for (let pass = 0; pass < 2; pass++) {
      const kind = pass === 0 ? 'deny' : 'allow';
      for (let i = 0; i < active.length; i++) {
        const r = active[i]; if (r.kind !== kind) continue;
        if (r.when(user, action, doc, ctx)) {
          trace.push('Rule "' + r.text + '" matches → ' + (kind === 'deny' ? 'DENY (deny rules beat allow rules)' : 'ALLOW'));
          return { allow: kind === 'allow', rule: r.id, text: r.text, trace: trace };
        }
        trace.push('Rule "' + r.text + '" does not apply.');
      }
    }
    trace.push('No rule matched → DENY (default)');
    return { allow: false, rule: 'default', text: 'default deny', trace: trace };
  }
  // </pure>

  KS.labs.register({
    id: 'rbac-lab',
    title: 'Access Control Lab',
    emoji: '🛂',
    blurb: 'Who may do what to which thing? Build roles, then switch to attribute rules, and run access checks to see exactly why each one is allowed or denied.',
    tags: ['authorization', 'rbac', 'abac', 'permissions', 'access control', 'roles'],
    goals: [
      { id: 'role', text: 'Let **Bob edit** documents but **not delete** them (roles tab)' },
      { id: 'deny', text: 'Run a check that is refused by **default deny**' },
      { id: 'owner', text: 'Allow owners to edit their own docs, and prove **Alice cannot edit Bob\'s** (rules tab)' },
      { id: 'clearance', text: 'Block a **confidential read** for someone with low clearance' }
    ],
    help: `**Authentication** answers "who are you?". **Authorization** answers "are you allowed to do *this*?". The safe default is **no**: access exists only if something grants it.

**Roles tab (RBAC):** people get roles, roles get permissions. A check follows the chain user → roles → permissions. Tick boxes to change either side.

**Rules tab (ABAC):** decisions use *attributes* of the person (department, clearance), the thing (owner, department, classification) and the situation (office hours, network). You switch rules on and off. **Deny rules are checked first and win**; then allow rules; if nothing matches, the answer is deny.

Pick a user, an action and (for rules) a document, press **Check access**, and read the trace to see which step decided.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const USERS = ['Alice', 'Bob', 'Carol', 'Dave'];
      const ROLES = ['viewer', 'editor', 'admin', 'billing'];
      const cfg = {
        users: { Alice: ['admin'], Bob: ['viewer'], Carol: ['billing'], Dave: [] },
        roles: { viewer: ['doc:read'], editor: ['doc:read', 'doc:edit'], admin: PERMS.slice(), billing: ['invoice:read'] }
      };
      const PEOPLE = { Alice: { name: 'Alice', dept: 'HR', clearance: 3 }, Bob: { name: 'Bob', dept: 'Eng', clearance: 1 }, Carol: { name: 'Carol', dept: 'Eng', clearance: 2 }, Dave: { name: 'Dave', dept: 'Sales', clearance: 0 } };
      const DOCS = [
        { name: 'Roadmap', owner: 'Bob', dept: 'Eng', cls: 'internal' },
        { name: 'Salaries', owner: 'Alice', dept: 'HR', cls: 'confidential' },
        { name: 'Pitch deck', owner: 'Dave', dept: 'Sales', cls: 'public' }
      ];
      const on = { owner: false, dept: false, clear: false, net: false, hours: false };
      const ctx = { hours: true, office: true };
      const sel = { ru: 'Bob', ra: 'doc:edit', au: 'Alice', aa: 'edit', ad: 1 };
      const res = { rbac: null, abac: null };
      const seen = { ownerAllow: false, ownerDeny: false };

      const log = ui.log(40);
      const L = (t, tone) => log.add(t, tone);
      const code = x => '`' + String(x).replace(/`/g, "'") + '`';

      function checkRole() {
        const e = rbacDecide(cfg, 'Bob', 'doc:edit'), d = rbacDecide(cfg, 'Bob', 'doc:delete');
        if (e.allow && !d.allow) api.goal('role');
      }
      function resultBox(r, tone) {
        return h('div.lab-stack',
          h('div', h('span.lab-chip.tn-' + (r.allow ? 'good' : 'bad'), r.allow ? '✅ ALLOW' : '⛔ DENY')),
          h('ol', { style: { margin: '0', paddingLeft: '20px', fontSize: '.9rem' } }, r.trace.map(t => h('li', { style: { overflowWrap: 'anywhere' } }, t))));
      }
      function checkbox(on0, onChange, label) {
        const i = h('input', { type: 'checkbox', 'aria-label': label, style: { width: '24px', height: '24px' } }); i.checked = !!on0;
        i.addEventListener('change', () => onChange(i.checked));
        return h('label', { style: { display: 'inline-flex', padding: '6px', minWidth: '36px', minHeight: '36px', alignItems: 'center', justifyContent: 'center' } }, i);
      }

      // ---------- RBAC tab ----------
      function renderRbac(host) {
        const resHost = h('div');
        const showRes = () => { KS.clear(resHost); if (res.rbac) resHost.appendChild(resultBox(res.rbac)); else resHost.appendChild(h('p.muted.small', 'Press Check access to run the decision.')); };
        const userRows = USERS.map(u => h('tr', h('td', h('b', u)), ROLES.map(r => h('td', checkbox(cfg.users[u].indexOf(r) >= 0, v => {
          const a = cfg.users[u]; const k = a.indexOf(r); if (v && k < 0) a.push(r); if (!v && k >= 0) a.splice(k, 1);
          res.rbac = null; showRes(); L(u + (v ? ' now has' : ' no longer has') + ' the role **' + r + '**.', 'info'); checkRole();
        }, u + ' ' + r)))));
        const roleRows = ROLES.map(r => h('tr', h('td', h('b', r)), PERMS.map(p => h('td', checkbox(cfg.roles[r].indexOf(p) >= 0, v => {
          const a = cfg.roles[r]; const k = a.indexOf(p); if (v && k < 0) a.push(p); if (!v && k >= 0) a.splice(k, 1);
          res.rbac = null; showRes(); L('Role **' + r + '** ' + (v ? 'now grants ' : 'no longer grants ') + code(p) + '.', 'info'); checkRole();
        }, r + ' ' + p)))));
        const tbl = (head, rows) => h('div.lab-table-wrap', h('table.lab-table', h('thead', h('tr', head.map(x => h('th', x)))), h('tbody', rows)));
        const selU = ui.select('Who', USERS.map(u => [u, u]), sel.ru, v => { sel.ru = v; res.rbac = null; showRes(); });
        const selA = ui.select('Wants to do', PERMS.map(p => [p, p]), sel.ra, v => { sel.ra = v; res.rbac = null; showRes(); });
        const go = ui.btn('Check access', () => {
          const r = rbacDecide(cfg, sel.ru, sel.ra); res.rbac = r; showRes();
          L(sel.ru + ' → ' + code(sel.ra) + ' → **' + (r.allow ? 'ALLOW' : 'DENY') + '**' + (r.allow ? ' (role ' + r.via[0] + ')' : ' (no role grants it, so the default applies)'), r.allow ? 'good' : 'bad');
          if (r.reason === 'default') api.goal('deny');
        }, 'primary');
        showRes();
        host.appendChild(h('div.lab-stack',
          ui.panel('1. People and their roles', tbl(['', ...ROLES], userRows)),
          ui.panel('2. What each role may do', tbl(['', ...PERMS], roleRows)),
          ui.panel('3. Test it', ui.row(selU, selA, go), resHost)));
      }

      // ---------- ABAC tab ----------
      function renderAbac(host) {
        const resHost = h('div');
        const showRes = () => { KS.clear(resHost); if (res.abac) resHost.appendChild(resultBox(res.abac)); else resHost.appendChild(h('p.muted.small', 'Press Check access to run the decision.')); };
        const rules = RULES.map(r => ui.toggle((r.kind === 'deny' ? '⛔ ' : '✅ ') + r.text, on[r.id], v => {
          on[r.id] = v; res.abac = null; showRes(); L('Rule "' + r.text + '" is now **' + (v ? 'on' : 'off') + '**.', 'info');
        }));
        const ctxT = [ui.toggle('It is office hours', ctx.hours, v => { ctx.hours = v; res.abac = null; showRes(); }), ui.toggle('Request comes from the office network', ctx.office, v => { ctx.office = v; res.abac = null; showRes(); })];
        const selU = ui.select('Who', USERS.map(u => [u, u + ' (' + PEOPLE[u].dept + ', clearance ' + PEOPLE[u].clearance + ')']), sel.au, v => { sel.au = v; res.abac = null; showRes(); });
        const selD = ui.select('Which document', DOCS.map((d, i) => [String(i), d.name + ' (' + d.owner + ', ' + d.dept + ', ' + d.cls + ')']), String(sel.ad), v => { sel.ad = +v; res.abac = null; showRes(); });
        const seg = ui.seg([['read', 'read'], ['edit', 'edit'], ['delete', 'delete']], sel.aa, v => { sel.aa = v; res.abac = null; showRes(); });
        const go = ui.btn('Check access', () => {
          const doc = DOCS[sel.ad], user = PEOPLE[sel.au];
          const r = abacDecide(on, user, sel.aa, doc, ctx); res.abac = r; showRes();
          L(user.name + ' ' + sel.aa + ' "' + doc.name + '" → **' + (r.allow ? 'ALLOW' : 'DENY') + '** (' + r.text + ')', r.allow ? 'good' : 'bad');
          if (r.rule === 'default') api.goal('deny');
          if (r.rule === 'clear' && sel.aa === 'read') api.goal('clearance');
          if (on.owner && sel.aa === 'edit') {
            if (r.rule === 'owner') seen.ownerAllow = true;
            if (user.name !== doc.owner && r.rule === 'default') seen.ownerDeny = true;
            if (seen.ownerAllow && seen.ownerDeny && sel.au !== doc.owner) L('✔ Owners can edit their own documents, and someone else cannot. That is attribute-based control.', 'good');
            if (seen.ownerAllow && seen.ownerDeny && on.owner) api.goal('owner');
          }
        }, 'primary');
        showRes();
        host.appendChild(h('div.lab-stack',
          ui.panel('Rules (try them one at a time)', h('div.lab-stack', rules)),
          ui.panel('The situation', ui.row(ctxT)),
          ui.panel('Test it', h('div.lab-stack', ui.row(selU, selD), ui.row(seg, go), resHost))));
      }

      const tabs = ui.tabs([['rbac', 'Roles (RBAC)', renderRbac], ['abac', 'Rules (ABAC)', renderAbac]]);
      root.appendChild(tabs.el);
      root.appendChild(ui.panel('What just happened', log.el));
      L('Welcome. Try **Check access** on the Roles tab: can Bob edit a document?', 'dim');
      return () => {};
    }
  });
})();
