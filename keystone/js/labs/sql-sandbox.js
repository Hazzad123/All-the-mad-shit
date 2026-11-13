/* Lab: sql-sandbox — a real (small) SQL engine: tokeniser → parser → executor, over a tiny UK shop database. */
(function () {
  'use strict';

  /* ENGINE-START — pure functions, no DOM. runSql(sql, db) → { columns, rows }, throws friendly Errors. */
  const AGGS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'], SCALARS = ['UPPER', 'LOWER', 'LENGTH', 'ROUND'];
  const KEYWORDS = new Set('SELECT DISTINCT FROM WHERE AND OR NOT IN LIKE IS NULL JOIN INNER LEFT OUTER RIGHT FULL CROSS ON GROUP BY HAVING ORDER ASC DESC LIMIT OFFSET AS BETWEEN'.split(' '));

  function tokenize(sql) {
    const toks = [], n = sql.length; let i = 0;
    while (i < n) {
      const c = sql[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
      if (c === '-' && sql[i + 1] === '-') { while (i < n && sql[i] !== '\n') i++; continue; }
      if (c >= '0' && c <= '9') {
        let j = i; while (j < n && sql[j] >= '0' && sql[j] <= '9') j++;
        if (sql[j] === '.' && sql[j + 1] >= '0' && sql[j + 1] <= '9') { j++; while (j < n && sql[j] >= '0' && sql[j] <= '9') j++; }
        toks.push({ t: 'num', v: parseFloat(sql.slice(i, j)), pos: i, end: j }); i = j; continue;
      }
      if (c === "'") {
        let j = i + 1, s = '';
        for (;;) {
          if (j >= n) throw new Error('The text starting at character ' + (i + 1) + " is missing its closing single quote (').");
          if (sql[j] === "'") { if (sql[j + 1] === "'") { s += "'"; j += 2; continue; } break; }
          s += sql[j++];
        }
        toks.push({ t: 'str', v: s, pos: i, end: j + 1 }); i = j + 1; continue;
      }
      if (c === '"') throw new Error("Text values go in single quotes, like 'Leeds'. Double quotes are not used for text here.");
      if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') {
        let j = i; while (j < n && /[A-Za-z0-9_]/.test(sql[j])) j++;
        const raw = sql.slice(i, j), up = raw.toUpperCase();
        toks.push(KEYWORDS.has(up) ? { t: 'kw', v: up, pos: i, end: j } : { t: 'id', v: raw, pos: i, end: j }); i = j; continue;
      }
      const two = sql.substr(i, 2);
      if (two === '<=' || two === '>=' || two === '<>' || two === '!=') { toks.push({ t: 'op', v: two === '!=' ? '<>' : two, pos: i, end: i + 2 }); i += 2; continue; }
      if ('=<>(),.*+-/;'.indexOf(c) >= 0) { toks.push({ t: 'op', v: c, pos: i, end: i + 1 }); i++; continue; }
      throw new Error("I don't understand the character '" + c + "' at position " + (i + 1) + '.');
    }
    toks.push({ t: 'eof', v: '', pos: n, end: n });
    return toks;
  }

  function parse(sql) {
    const toks = tokenize(sql); let p = 0;
    const isKw = v => toks[p].t === 'kw' && toks[p].v === v;
    const isOp = v => toks[p].t === 'op' && toks[p].v === v;
    const eatKw = v => { if (isKw(v)) { p++; return true; } return false; };
    const eatOp = v => { if (isOp(v)) { p++; return true; } return false; };
    const show = tok => tok.t === 'eof' ? 'the end of the query' : "'" + sql.slice(tok.pos, tok.end) + "'";
    const fail = msg => { throw new Error(msg); };
    const expected = what => fail('Expected ' + what + ' but found ' + show(toks[p]) + '.');
    const expectKw = (v, what) => { if (!eatKw(v)) expected(what || v); };
    const expectOp = (v, what) => { if (!eatOp(v)) expected(what || "'" + v + "'"); };
    const expectId = what => { if (toks[p].t !== 'id') expected(what); return toks[p++].v; };

    const first = toks[0];
    if (first.t === 'eof') fail('Type a query first, for example: SELECT * FROM customers');
    if (first.t === 'id' && /^(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE)$/i.test(first.v)) fail('This sandbox is read-only: it only runs SELECT queries, so the shop data stays safe. Try SELECT * FROM ' + 'customers.');
    if (!(first.t === 'kw' && first.v === 'SELECT')) expected("the word SELECT (every query here starts with it)");
    p++;

    function parseExpr() { return parseOr(); }
    function parseOr() { let l = parseAnd(); while (eatKw('OR')) l = { k: 'or', a: l, b: parseAnd() }; return l; }
    function parseAnd() { let l = parseNot(); while (eatKw('AND')) l = { k: 'and', a: l, b: parseNot() }; return l; }
    function parseNot() { if (eatKw('NOT')) return { k: 'not', e: parseNot() }; return parseCmp(); }
    function parseCmp() {
      const l = parseAdd(); const t = toks[p];
      if (t.t === 'op' && ['=', '<>', '<', '>', '<=', '>='].indexOf(t.v) >= 0) { p++; return { k: 'cmp', op: t.v, a: l, b: parseAdd() }; }
      if (isKw('IS')) { p++; const neg = eatKw('NOT'); expectKw('NULL', 'NULL (as in IS NULL or IS NOT NULL)'); return { k: 'isnull', e: l, neg }; }
      let neg = false;
      if (isKw('NOT') && toks[p + 1].t === 'kw' && ['LIKE', 'IN', 'BETWEEN'].indexOf(toks[p + 1].v) >= 0) { p++; neg = true; }
      if (eatKw('LIKE')) return { k: 'like', e: l, pat: parseAdd(), neg };
      if (eatKw('IN')) {
        expectOp('(', "'(' after IN");
        if (isKw('SELECT')) fail('Sub-queries are not supported in this sandbox. List the values instead, like IN (1, 2, 3).');
        const list = [parseExpr()]; while (eatOp(',')) list.push(parseExpr());
        expectOp(')', "')' to close the IN list");
        return { k: 'in', e: l, list, neg };
      }
      if (eatKw('BETWEEN')) {
        const lo = parseAdd(); expectKw('AND', 'AND (as in BETWEEN 5 AND 10)'); const hi = parseAdd();
        const both = { k: 'and', a: { k: 'cmp', op: '>=', a: l, b: lo }, b: { k: 'cmp', op: '<=', a: l, b: hi } };
        return neg ? { k: 'not', e: both } : both;
      }
      return l;
    }
    function parseAdd() { let l = parseMul(); while (isOp('+') || isOp('-')) { const op = toks[p++].v; l = { k: 'bin', op, a: l, b: parseMul() }; } return l; }
    function parseMul() { let l = parseUnary(); while (isOp('*') || isOp('/')) { const op = toks[p++].v; l = { k: 'bin', op, a: l, b: parseUnary() }; } return l; }
    function parseUnary() { if (eatOp('-')) return { k: 'neg', e: parseUnary() }; eatOp('+'); return parsePrimary(); }
    function parsePrimary() {
      const t = toks[p];
      if (t.t === 'num' || t.t === 'str') { p++; return { k: 'lit', v: t.v }; }
      if (isKw('NULL')) { p++; return { k: 'lit', v: null }; }
      if (eatOp('(')) { const e = parseExpr(); expectOp(')', "')' to close the bracket"); return e; }
      if (t.t === 'id') {
        p++;
        if (isOp('(')) {
          p++; const name = t.v.toUpperCase();
          if (AGGS.indexOf(name) >= 0) {
            if (name === 'COUNT' && eatOp('*')) { expectOp(')', "')' after COUNT(*"); return { k: 'agg', fn: name, star: true }; }
            const distinct = eatKw('DISTINCT'); const arg = parseExpr(); expectOp(')', "')' to close " + name + '(');
            return { k: 'agg', fn: name, arg, distinct };
          }
          if (SCALARS.indexOf(name) >= 0) {
            const args = []; if (!isOp(')')) { args.push(parseExpr()); while (eatOp(',')) args.push(parseExpr()); }
            expectOp(')', "')' to close " + name + '(');
            return { k: 'fn', fn: name, args };
          }
          fail("I don't know a function called " + t.v + '(). You can use COUNT, SUM, AVG, MIN, MAX, UPPER, LOWER, LENGTH and ROUND.');
        }
        if (isOp('.')) { p++; const col = expectId('a column name after the dot'); return { k: 'col', table: t.v, name: col }; }
        return { k: 'col', table: null, name: t.v };
      }
      if (t.t === 'kw' && ['FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT'].indexOf(t.v) >= 0) fail('Expected a column name or value here, but found ' + t.v + '. Did you forget something before it?');
      return expected('a column name or a value');
    }

    const q = { distinct: false, items: [], from: null, joins: [], where: null, groupBy: [], having: null, orderBy: [], limit: null, offset: 0 };
    q.distinct = eatKw('DISTINCT');
    do {
      if (isKw('FROM')) fail('Say which columns you want between SELECT and FROM (or use * for all of them).');
      if (eatOp('*')) { q.items.push({ star: true, table: null }); continue; }
      if (toks[p].t === 'id' && toks[p + 1].t === 'op' && toks[p + 1].v === '.' && toks[p + 2].t === 'op' && toks[p + 2].v === '*') { q.items.push({ star: true, table: toks[p].v }); p += 3; continue; }
      const start = toks[p].pos; const expr = parseExpr(); const src = sql.slice(start, toks[p - 1].end);
      let alias = null;
      if (eatKw('AS')) alias = expectId('a name after AS'); else if (toks[p].t === 'id') alias = toks[p++].v;
      q.items.push({ expr, alias, src });
    } while (eatOp(','));
    expectKw('FROM', 'FROM (which table do you want to read?)');
    function tableRef() { const table = expectId('a table name'); let alias = null; if (eatKw('AS')) alias = expectId('an alias after AS'); else if (toks[p].t === 'id') alias = toks[p++].v; return { table, alias }; }
    q.from = tableRef();
    for (;;) {
      if (isOp(',')) fail('Use JOIN ... ON ... to combine tables, rather than a comma.');
      if (isKw('RIGHT') || isKw('FULL') || isKw('CROSS')) fail(toks[p].v + ' joins are not supported here. Use INNER JOIN or LEFT JOIN.');
      let type;
      if (eatKw('INNER')) { expectKw('JOIN'); type = 'inner'; }
      else if (eatKw('LEFT')) { eatKw('OUTER'); expectKw('JOIN'); type = 'left'; }
      else if (eatKw('JOIN')) type = 'inner';
      else break;
      const ref = tableRef();
      expectKw('ON', 'ON (how are the tables linked? e.g. ON orders.customer_id = customers.id)');
      q.joins.push({ type, ref, on: parseExpr() });
    }
    if (eatKw('WHERE')) q.where = parseExpr();
    if (eatKw('GROUP')) { expectKw('BY'); q.groupBy.push(parseExpr()); while (eatOp(',')) q.groupBy.push(parseExpr()); }
    if (eatKw('HAVING')) q.having = parseExpr();
    if (eatKw('ORDER')) {
      expectKw('BY');
      do { const expr = parseExpr(); let desc = false; if (eatKw('DESC')) desc = true; else eatKw('ASC'); q.orderBy.push({ expr, desc }); } while (eatOp(','));
    }
    const wantInt = what => { const t = toks[p]; if (t.t !== 'num' || !Number.isInteger(t.v)) expected('a whole number after ' + what); p++; return t.v; };
    if (eatKw('LIMIT')) { q.limit = wantInt('LIMIT'); if (eatKw('OFFSET')) q.offset = wantInt('OFFSET'); }
    eatOp(';');
    if (toks[p].t !== 'eof') fail("I didn't expect " + show(toks[p]) + ' here. Clauses go in this order: FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.');
    return q;
  }

  function lev(a, b) {
    const d = []; for (let i = 0; i <= a.length; i++) { d[i] = [i]; } for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function closest(name, list) { let best = null, bd = 3; list.forEach(c => { const x = lev(name.toLowerCase(), c.toLowerCase()); if (x < bd && x < name.length) { bd = x; best = c; } }); return best; }

  function getTable(db, name) {
    const ln = name.toLowerCase(), names = Object.keys(db);
    for (let i = 0; i < names.length; i++) if (names[i].toLowerCase() === ln) return db[names[i]];
    const near = closest(name, names);
    throw new Error("There is no table called '" + name + "'." + (near ? " Did you mean '" + near + "'?" : '') + ' Tables you can use: ' + names.join(', ') + '.');
  }
  function findCol(scope, table, name) {
    const ln = name.toLowerCase(), lt = table ? table.toLowerCase() : null;
    if (lt) {
      const tabs = scope.filter(c => c.table.toLowerCase() === lt);
      if (!tabs.length) throw new Error("There is no table or alias called '" + table + "' in this query. Names in use: " + scope.map(c => c.table).filter((v, i, a) => a.indexOf(v) === i).join(', ') + '.');
      const idx = scope.findIndex(c => c.table.toLowerCase() === lt && c.name.toLowerCase() === ln);
      if (idx < 0) { const near = closest(name, tabs.map(c => c.name)); throw new Error("'" + table + "' has no column called '" + name + "'." + (near ? " Did you mean '" + near + "'?" : '') + ' Its columns: ' + tabs.map(c => c.name).join(', ') + '.'); }
      return idx;
    }
    const hits = []; scope.forEach((c, i) => { if (c.name.toLowerCase() === ln) hits.push(i); });
    if (hits.length === 1) return hits[0];
    if (hits.length > 1) throw new Error("The column '" + name + "' is ambiguous: it exists in " + hits.map(i => scope[i].table).join(' and ') + '. Say which one you mean, e.g. ' + scope[hits[0]].table + '.' + name + '.');
    const near = closest(name, scope.map(c => c.name));
    throw new Error("There is no column called '" + name + "'." + (near ? " Did you mean '" + near + "'?" : '') + ' Columns available: ' + scope.map(c => c.table + '.' + c.name).join(', ') + '.');
  }
  function children(n) {
    switch (n.k) {
      case 'cmp': case 'bin': case 'and': case 'or': return [n.a, n.b];
      case 'not': case 'neg': case 'isnull': return [n.e];
      case 'like': return [n.e, n.pat];
      case 'in': return [n.e].concat(n.list);
      case 'agg': return n.arg ? [n.arg] : [];
      case 'fn': return n.args;
      default: return [];
    }
  }
  function hasAgg(n) { return n.k === 'agg' || children(n).some(hasAgg); }
  function sig(n) { return JSON.stringify(n, (k, v) => (k === 'src' || k === '_re') ? undefined : v); }

  /** Resolve column names to positions (mutates the tree). o: { agg: allowed?, where: 'WHERE', aliases: {name: expr}, aliasHint: {name: idx} } */
  function rs(n, scope, o) {
    switch (n.k) {
      case 'lit': return n;
      case 'col': {
        try { n.idx = findCol(scope, n.table, n.name); return n; }
        catch (e) {
          const key = n.name.toLowerCase();
          if (!n.table && o.aliases && Object.prototype.hasOwnProperty.call(o.aliases, key)) return o.aliases[key];
          if (!n.table && o.aliasHint && Object.prototype.hasOwnProperty.call(o.aliasHint, key)) throw new Error(e.message + " ('" + n.name + "' is a nickname from your SELECT. " + o.where + ' runs before SELECT, so repeat the calculation here instead.)');
          throw e;
        }
      }
      case 'agg':
        if (!o.agg) throw new Error(n.fn + '() is an aggregate, so it cannot be used in ' + o.where + '.' + (o.where === 'WHERE' ? ' WHERE filters single rows; to filter on an aggregate use HAVING.' : ''));
        if (n.arg) { if (hasAgg(n.arg)) throw new Error('You cannot put one aggregate inside another, like SUM(COUNT(...)).'); n.arg = rs(n.arg, scope, Object.assign({}, o, { agg: false })); }
        return n;
      case 'cmp': case 'bin': case 'and': case 'or': n.a = rs(n.a, scope, o); n.b = rs(n.b, scope, o); return n;
      case 'not': case 'neg': case 'isnull': n.e = rs(n.e, scope, o); return n;
      case 'like': n.e = rs(n.e, scope, o); n.pat = rs(n.pat, scope, o); return n;
      case 'in': n.e = rs(n.e, scope, o); n.list = n.list.map(x => rs(x, scope, o)); return n;
      case 'fn': n.args = n.args.map(x => rs(x, scope, o)); return n;
    }
    return n;
  }

  const r8 = x => Math.round(x * 1e8) / 1e8;
  function toBool(v) {
    if (v === null || v === undefined) return null;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    throw new Error("A condition must be a yes/no test like price > 10, but this produced text ('" + v + "').");
  }
  function cmpVals(a, b) {
    if (typeof a === typeof b) { if (typeof a === 'string') return a.localeCompare(b, 'en'); return a < b ? -1 : a > b ? 1 : 0; }
    const x = String(a), y = String(b); return x < y ? -1 : x > y ? 1 : 0;
  }
  function num(v, what) { if (typeof v !== 'number') throw new Error('Maths needs numbers, but ' + what + " is text ('" + v + "').") ; return v; }
  function likeRe(pat) { return new RegExp('^' + String(pat).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '[\\s\\S]*').replace(/_/g, '[\\s\\S]') + '$', 'i'); }

  function ev(n, env) {
    switch (n.k) {
      case 'lit': return n.v;
      case 'col': return env.row ? env.row[n.idx] : null;
      case 'neg': { const v = ev(n.e, env); return v === null ? null : -num(v, 'this value'); }
      case 'bin': {
        const a = ev(n.a, env), b = ev(n.b, env); if (a === null || b === null) return null;
        num(a, 'one side'); num(b, 'one side');
        if (n.op === '+') return r8(a + b); if (n.op === '-') return r8(a - b); if (n.op === '*') return r8(a * b);
        return b === 0 ? null : r8(a / b);
      }
      case 'cmp': {
        const a = ev(n.a, env), b = ev(n.b, env); if (a === null || b === null) return null;
        const c = cmpVals(a, b);
        switch (n.op) { case '=': return c === 0; case '<>': return c !== 0; case '<': return c < 0; case '>': return c > 0; case '<=': return c <= 0; default: return c >= 0; }
      }
      case 'and': { const a = toBool(ev(n.a, env)), b = toBool(ev(n.b, env)); if (a === false || b === false) return false; if (a === null || b === null) return null; return true; }
      case 'or': { const a = toBool(ev(n.a, env)), b = toBool(ev(n.b, env)); if (a === true || b === true) return true; if (a === null || b === null) return null; return false; }
      case 'not': { const a = toBool(ev(n.e, env)); return a === null ? null : !a; }
      case 'isnull': { const v = ev(n.e, env); return n.neg ? v !== null : v === null; }
      case 'like': {
        const v = ev(n.e, env), pt = ev(n.pat, env); if (v === null || pt === null) return null;
        const re = (n.pat.k === 'lit') ? (n._re || (n._re = likeRe(pt))) : likeRe(pt);
        const r = re.test(String(v)); return n.neg ? !r : r;
      }
      case 'in': {
        const v = ev(n.e, env); if (v === null) return null;
        let sawNull = false, hit = false;
        n.list.forEach(x => { const w = ev(x, env); if (w === null) sawNull = true; else if (cmpVals(v, w) === 0) hit = true; });
        const r = hit ? true : (sawNull ? null : false);
        return r === null ? null : (n.neg ? !r : r);
      }
      case 'fn': {
        const a = n.args.map(x => ev(x, env));
        if (n.fn === 'ROUND') { if (a.length < 1 || a.length > 2) throw new Error('ROUND needs a number and optionally how many decimal places, like ROUND(price, 1).'); if (a[0] === null) return null; const d = Math.pow(10, a[1] || 0); return Math.round(num(a[0], 'the value') * d) / d; }
        if (a.length !== 1) throw new Error(n.fn + ' takes exactly one value.');
        if (a[0] === null) return null;
        if (n.fn === 'UPPER') return String(a[0]).toUpperCase();
        if (n.fn === 'LOWER') return String(a[0]).toLowerCase();
        return String(a[0]).length;
      }
      case 'agg': {
        const rows = env.rows || [];
        if (n.star) return rows.length;
        let vals = rows.map(r => ev(n.arg, { row: r })).filter(v => v !== null);
        if (n.distinct) vals = vals.filter((v, i) => vals.indexOf(v) === i);
        if (n.fn === 'COUNT') return vals.length;
        if (!vals.length) return null;
        if (n.fn === 'MIN' || n.fn === 'MAX') return vals.reduce((m, v) => (n.fn === 'MIN' ? cmpVals(v, m) < 0 : cmpVals(v, m) > 0) ? v : m);
        vals.forEach(v => { if (typeof v !== 'number') throw new Error(n.fn + "() needs numbers, but found text ('" + v + "'). Try COUNT, MIN or MAX for text."); });
        const sum = vals.reduce((s, v) => s + v, 0);
        return r8(n.fn === 'SUM' ? sum : sum / vals.length);
      }
    }
    throw new Error('Unsupported expression.');
  }

  function execute(q, db) {
    const refs = [q.from].concat(q.joins.map(j => j.ref)); const seen = {};
    refs.forEach(r => {
      r.t = getTable(db, r.table); const al = r.alias || r.table; const la = al.toLowerCase();
      if (seen[la]) throw new Error("The name '" + al + "' is used twice in FROM/JOIN. Give one of them an alias, e.g. " + r.table + ' AS ' + r.table.charAt(0) + '2.');
      seen[la] = 1; r.al = al;
      const real = Object.keys(db).filter(k => db[k] === r.t)[0]; r.cols = r.t.columns.map(c => ({ table: al, name: c })); r.real = real;
    });
    let scope = refs[0].cols.slice(), rows = refs[0].t.rows.slice();
    q.joins.forEach((j, ji) => {
      const r = refs[ji + 1], full = scope.concat(r.cols), pad = r.cols.map(() => null), out = [];
      j.on = rs(j.on, full, { agg: false, where: 'a JOIN condition' });
      rows.forEach(l => {
        let hit = false;
        r.t.rows.forEach(rr => { const row = l.concat(rr); if (toBool(ev(j.on, { row })) === true) { out.push(row); hit = true; } });
        if (!hit && j.type === 'left') out.push(l.concat(pad));
      });
      rows = out; scope = full;
    });

    const grouped = q.groupBy.length > 0 || !!q.having || q.items.some(it => !it.star && hasAgg(it.expr)) || q.orderBy.some(o => hasAgg(o.expr));
    if (grouped && q.items.some(it => it.star)) throw new Error('You cannot use * together with GROUP BY or aggregates like COUNT(). List the columns you want.');
    const items = [];
    q.items.forEach(it => {
      if (it.star) {
        if (it.table && !scope.some(c => c.table.toLowerCase() === it.table.toLowerCase())) throw new Error("There is no table or alias called '" + it.table + "' in this query.");
        scope.forEach((c, idx) => { if (!it.table || c.table.toLowerCase() === it.table.toLowerCase()) items.push({ expr: { k: 'col', table: c.table, name: c.name, idx }, name: c.name }); });
      } else {
        const expr = rs(it.expr, scope, { agg: true, where: 'SELECT' });
        items.push({ expr, alias: it.alias, name: it.alias || (expr.k === 'col' ? expr.name : it.src) });
      }
    });
    const aliasIdx = {}, aliasExpr = {};
    items.forEach((it, i) => { if (it.alias) { aliasIdx[it.alias.toLowerCase()] = i; aliasExpr[it.alias.toLowerCase()] = it.expr; } });

    if (q.where) { const w = rs(q.where, scope, { agg: false, where: 'WHERE', aliasHint: aliasIdx }); rows = rows.filter(r => toBool(ev(w, { row: r })) === true); }
    const gb = q.groupBy.map(e => rs(e, scope, { agg: false, where: 'GROUP BY', aliases: aliasExpr }));
    const hv = q.having ? rs(q.having, scope, { agg: true, where: 'HAVING', aliases: aliasExpr }) : null;
    const ob = q.orderBy.map(o => {
      const e = o.expr;
      if (e.k === 'lit' && typeof e.v === 'number') {
        if (!Number.isInteger(e.v) || e.v < 1 || e.v > items.length) throw new Error('ORDER BY ' + e.v + ': your SELECT only has ' + items.length + ' column(s).');
        return { idx: e.v - 1, desc: o.desc };
      }
      if (e.k === 'col' && !e.table && Object.prototype.hasOwnProperty.call(aliasIdx, e.name.toLowerCase())) return { idx: aliasIdx[e.name.toLowerCase()], desc: o.desc };
      return { expr: rs(e, scope, { agg: true, where: 'ORDER BY' }), desc: o.desc };
    });
    if (grouped) {
      const gs = new Set(gb.map(sig));
      const chk = n => {
        if (gs.has(sig(n)) || n.k === 'agg') return;
        if (n.k === 'col') throw new Error("'" + n.name + "' must appear in GROUP BY or be inside an aggregate such as COUNT() or MAX(). Otherwise SQL cannot tell which row's value to show.");
        children(n).forEach(chk);
      };
      items.forEach(it => chk(it.expr)); if (hv) chk(hv); ob.forEach(o => { if (o.expr) chk(o.expr); });
    }

    let recs;
    if (grouped) {
      if (!gb.length) recs = [{ row: rows[0], rows }];
      else {
        const m = new Map();
        rows.forEach(r => { const key = JSON.stringify(gb.map(g => ev(g, { row: r }))); let g = m.get(key); if (!g) { g = { row: r, rows: [] }; m.set(key, g); } g.rows.push(r); });
        recs = Array.from(m.values());
      }
      if (hv) recs = recs.filter(g => toBool(ev(hv, g)) === true);
    } else recs = rows.map(r => ({ row: r, rows: null }));
    recs.forEach(rec => { rec.out = items.map(it => ev(it.expr, rec)); });
    if (q.distinct) { const s = new Set(); recs = recs.filter(rec => { const k = JSON.stringify(rec.out); if (s.has(k)) return false; s.add(k); return true; }); }
    if (ob.length) {
      recs.forEach(rec => { rec.keys = ob.map(o => o.expr ? ev(o.expr, rec) : rec.out[o.idx]); });
      recs.sort((x, y) => {
        for (let i = 0; i < ob.length; i++) {
          const a = x.keys[i], b = y.keys[i]; let c;
          if (a === null && b === null) c = 0; else if (a === null) c = -1; else if (b === null) c = 1; else c = cmpVals(a, b);
          if (c) return ob[i].desc ? -c : c;
        }
        return 0;
      });
    }
    let out = recs.map(r => r.out);
    if (q.offset) out = out.slice(q.offset);
    if (q.limit !== null) out = out.slice(0, q.limit);
    return { columns: items.map(it => it.name), rows: out };
  }

  function runSql(sql, db) { return execute(parse(String(sql == null ? '' : sql)), db); }

  /* ---- the shop database (UK flavoured) ---- */
  const SHOP = {
    customers: { columns: ['id', 'name', 'email', 'city'], rows: [
      [1, 'Amelia Clarke', 'amelia.clarke@example.co.uk', 'Leeds'],
      [2, 'Oliver Patel', 'oliver.patel@example.com', 'Manchester'],
      [3, 'Priya Shah', 'priya.shah@example.co.uk', 'Leicester'],
      [4, 'Callum MacLeod', 'callum.macleod@example.com', 'Glasgow'],
      [5, 'Megan Davies', 'megan.davies@example.co.uk', 'Cardiff'],
      [6, 'Harry Whitlock', null, 'Leeds'],
      [7, 'Zainab Hussain', 'zainab.h@example.co.uk', 'Manchester'],
      [8, 'Tom Fletcher', 'tom.fletcher@example.com', 'Bristol']] },
    products: { columns: ['id', 'name', 'price', 'category'], rows: [
      [1, 'Teapot', 18.5, 'Kitchen'], [2, 'Tea Towels', 7.99, 'Kitchen'], [3, 'Wellington Boots', 34, 'Clothing'], [4, 'Wool Scarf', 15, 'Clothing'],
      [5, 'Paperback Novel', 8.99, 'Books'], [6, 'Road Atlas', 12.5, 'Books'], [7, 'Biscuit Tin', 6.5, 'Kitchen'], [8, 'Umbrella', 16, 'Clothing']] },
    orders: { columns: ['id', 'customer_id', 'created_at', 'status'], rows: [
      [1, 1, '2025-01-12', 'delivered'], [2, 2, '2025-01-20', 'delivered'], [3, 1, '2025-02-03', 'shipped'], [4, 3, '2025-02-14', 'delivered'], [5, 4, '2025-02-27', 'cancelled'],
      [6, 2, '2025-03-05', 'pending'], [7, 5, '2025-03-18', 'shipped'], [8, 1, '2025-03-22', 'pending'], [9, 7, '2025-04-02', 'delivered'], [10, 6, '2025-04-09', 'shipped']] },
    order_items: { columns: ['order_id', 'product_id', 'quantity'], rows: [
      [1, 1, 1], [1, 2, 2], [2, 3, 1], [3, 5, 2], [3, 6, 1], [4, 4, 1], [4, 7, 3], [5, 1, 1], [6, 3, 2], [6, 5, 1], [7, 2, 1], [8, 7, 2], [8, 4, 1], [9, 6, 1], [10, 5, 1]] }
  };

  /* ---- graded challenges: compared by result rows, never by SQL text ---- */
  const CHALLENGES = [
    { kind: 'filter', title: 'Customers in Leeds', text: 'Show the name and email of every customer who lives in Leeds.', hint: 'SELECT the two columns FROM customers, then add WHERE city = \'Leeds\'. Text goes in single quotes.', solution: "SELECT name, email FROM customers WHERE city = 'Leeds'" },
    { kind: 'order', ordered: true, title: 'Bargains, cheapest first', text: 'Show the name and price of products costing less than £10, cheapest first.', hint: 'WHERE price < 10, then ORDER BY price (ascending is the default).', solution: 'SELECT name, price FROM products WHERE price < 10 ORDER BY price' },
    { kind: 'distinct', title: 'Where do customers live?', text: 'List each city our customers live in exactly once (one column).', hint: 'Put the word DISTINCT straight after SELECT to remove repeats.', solution: 'SELECT DISTINCT city FROM customers' },
    { kind: 'agg', title: 'Orders that went ahead', text: 'How many orders have a status other than \'cancelled\'? (one number)', hint: 'COUNT(*) counts rows. Combine it with WHERE status <> \'cancelled\'.', solution: "SELECT COUNT(*) FROM orders WHERE status <> 'cancelled'" },
    { kind: 'join', title: 'Who placed each order?', text: 'Show every order id with the name of the customer who placed it (two columns: order id, customer name).', hint: 'FROM orders JOIN customers ON orders.customer_id = customers.id. Then SELECT orders.id, customers.name.', solution: 'SELECT o.id, c.name FROM orders o JOIN customers c ON o.customer_id = c.id' },
    { kind: 'join', title: 'Customers who never ordered', text: 'Show the name of every customer who has never placed an order.', hint: 'Use LEFT JOIN from customers to orders: customers with no match get NULLs. Then keep rows WHERE orders.id IS NULL.', solution: 'SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL' },
    { kind: 'group', ordered: true, title: 'Repeat customers', text: 'For customers with 2 or more orders, show their name and order count, biggest count first.', hint: 'JOIN customers to orders, GROUP BY the customer name, filter groups with HAVING COUNT(*) >= 2, ORDER BY COUNT(*) DESC.', solution: 'SELECT c.name, COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.name HAVING COUNT(*) >= 2 ORDER BY COUNT(*) DESC' },
    { kind: 'group', title: 'Revenue per category', text: 'For each product category show the category and total revenue (price × quantity, summed over every order line).', hint: 'JOIN order_items to products, GROUP BY category, and SUM(products.price * order_items.quantity).', solution: 'SELECT p.category, SUM(p.price * oi.quantity) FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.category' }
  ];
  function cellKey(v) { return v === null ? 'null' : typeof v === 'number' ? 'n' + (Math.round(v * 100) / 100) : 's' + v; }
  function gradeResult(ch, res, db) {
    const want = runSql(ch.solution, db);
    if (res.columns.length !== want.columns.length) return { ok: false, why: 'This challenge wants ' + want.columns.length + ' column' + (want.columns.length === 1 ? '' : 's') + ' but your query returned ' + res.columns.length + '.' };
    if (res.rows.length !== want.rows.length) return { ok: false, why: 'This challenge expects ' + want.rows.length + ' row' + (want.rows.length === 1 ? '' : 's') + ' but your query returned ' + res.rows.length + '.' };
    let a = res.rows.map(r => r.map(cellKey).join('\u0001')), b = want.rows.map(r => r.map(cellKey).join('\u0001'));
    if (!ch.ordered) { a = a.sort(); b = b.sort(); }
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return { ok: false, why: ch.ordered && a.slice().sort().join('|') === b.slice().sort().join('|') ? 'The right rows, but in the wrong order. Check your ORDER BY.' : 'The right shape (' + want.rows.length + ' rows) but some values differ. Re-read the challenge.' };
    return { ok: true, why: '' };
  }
  /* ENGINE-END */

  function fmtCell(v) { return typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : String(v); }

  KS.labs.register({
    id: 'sql-sandbox',
    title: 'SQL Sandbox',
    emoji: '🧮',
    blurb: 'A real little SQL engine over a UK online shop. Ask the tables questions, then crack eight challenges.',
    tags: ['sql', 'databases', 'queries', 'joins', 'group by'],
    goals: [
      { id: 'run', text: '**Run** any query' },
      { id: 'three', text: 'Solve **three challenges**' },
      { id: 'join', text: 'Solve a challenge that needs a **JOIN**' },
      { id: 'group', text: 'Solve a challenge that needs **GROUP BY**' }
    ],
    help: `The **shop database** has four tables. Tap one to see its rows. \`customers\` and \`products\` are lists of things; \`orders\` says who ordered and when; \`order_items\` says which products are in each order and how many.

A query is a question: \`SELECT\` the columns you want \`FROM\` a table, \`WHERE\` rows match a test. \`JOIN ... ON\` glues tables together using matching ids. \`GROUP BY\` squashes rows into groups so \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\` and \`MAX\` can summarise each group; \`HAVING\` filters the groups. \`ORDER BY\` sorts and \`LIMIT\` trims.

Press **Run** (or Ctrl+Enter). Errors tell you what the engine expected. The engine is read-only, so you cannot break anything. A challenge is marked solved when your *results* match, whatever way you wrote the SQL.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const solved = {}; let active = 0, hintShown = false;
      const tableNames = Object.keys(SHOP);

      function tableEl(cols, rows) {
        const shown = rows.slice(0, 200);
        return h('div.lab-table-wrap', h('table.lab-table',
          h('thead', h('tr', cols.map(c => h('th', c)))),
          h('tbody', shown.map(r => h('tr', r.map(v => v === null ? h('td', h('span', { style: { color: 'var(--faint)', fontStyle: 'italic' } }, 'NULL')) : h('td', fmtCell(v))))))));
      }

      // ----- database browser -----
      const previewHost = h('div'); const tblBtns = {};
      function showTable(name) {
        Object.keys(tblBtns).forEach(k => tblBtns[k].classList.toggle('primary', k === name));
        const t = SHOP[name]; KS.clear(previewHost);
        previewHost.appendChild(h('p.small', { style: { margin: '10px 0 8px' } }, h('b', name), ' · ' + t.rows.length + ' rows · columns: ' + t.columns.join(', ')));
        previewHost.appendChild(tableEl(t.columns, t.rows));
      }
      const tblRow = ui.row();
      tableNames.forEach(name => { const b = ui.btn(name, () => showTable(name)); tblBtns[name] = b; tblRow.appendChild(b); });

      // ----- challenges -----
      const navHost = ui.row(); const cardHost = h('div');
      function renderChallenges() {
        KS.clear(navHost);
        CHALLENGES.forEach((c, i) => {
          const b = ui.btn((solved[i] ? '✓ ' : '') + (i + 1), () => { active = i; hintShown = false; renderChallenges(); }, i === active ? 'primary' : '');
          b.style.minWidth = '48px'; b.setAttribute('aria-label', 'Challenge ' + (i + 1) + (solved[i] ? ' (solved)' : '')); navHost.appendChild(b);
        });
        const c = CHALLENGES[active];
        KS.clear(cardHost);
        cardHost.appendChild(h('div', { style: { margin: '10px 0 6px', fontWeight: '800' } }, 'Challenge ' + (active + 1) + ': ' + c.title + ' ', solved[active] ? h('span.lab-chip.tn-good', 'solved ✓') : null));
        cardHost.appendChild(h('p', { style: { margin: '0 0 8px' } }, c.text));
        const kids = [ui.btn(hintShown ? 'Hide hint' : 'Show a hint', () => { hintShown = !hintShown; renderChallenges(); }, 'sm')];
        if (hintShown) kids.push(ui.btn('Load a solution into the editor', () => { ta.set(c.solution); setFb('Solution loaded. Press Run, then try changing it to see how the results change.', 'info'); }, 'sm'));
        cardHost.appendChild(ui.row(kids));
        if (hintShown) cardHost.appendChild(h('p', { style: { margin: '8px 0 0', color: 'var(--muted)' } }, '💡 ' + c.hint));
      }

      // ----- editor and results -----
      let ta = null;
      const fb = h('div.lab-note', { style: { display: 'none' } });
      function setFb(text, tone) { fb.className = 'lab-note' + (tone ? ' tn-' + tone : ''); fb.textContent = text; fb.style.display = ''; }
      const statusEl = h('div', { style: { margin: '0 0 8px', fontWeight: '700' } }, 'Run a query to see its result here.');
      const resultHost = h('div');
      function examples() {
        const ex = [['Everything', 'SELECT * FROM customers;'], ['Filter', "SELECT name, price FROM products\nWHERE category = 'Books';"], ['Join', 'SELECT c.name, o.status\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;'], ['Group', 'SELECT status, COUNT(*) AS how_many\nFROM orders\nGROUP BY status;']];
        return ui.row(ex.map(e => ui.btn(e[0], () => ta.set(e[1]), 'sm')));
      }
      ta = ui.textarea('Your SQL (Ctrl+Enter runs it)', 'SELECT * FROM customers;', () => {}, 6);
      const onKey = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } };
      ta.input.addEventListener('keydown', onKey);
      api.onCleanup(() => ta.input.removeEventListener('keydown', onKey));

      function run() {
        const sql = ta.get(); let res;
        KS.clear(resultHost);
        try { res = runSql(sql, SHOP); }
        catch (e) { statusEl.textContent = '✗ ' + (e && e.message ? e.message : 'Something went wrong.'); statusEl.style.color = 'var(--bad)'; fb.style.display = 'none'; return; }
        statusEl.style.color = ''; statusEl.textContent = res.rows.length === 0 ? '0 rows. The query is fine, but nothing matched.' : res.rows.length + (res.rows.length === 1 ? ' row' : ' rows') + ' × ' + res.columns.length + (res.columns.length === 1 ? ' column' : ' columns') + (res.rows.length > 200 ? ' (showing the first 200)' : '');
        resultHost.appendChild(tableEl(res.columns, res.rows));
        api.goal('run');
        grade(res);
      }
      function grade(res) {
        const newly = [];
        CHALLENGES.forEach((c, i) => { if (!solved[i] && gradeResult(c, res, SHOP).ok) { solved[i] = true; newly.push(i); } });
        const cur = CHALLENGES[active];
        if (newly.length) {
          setFb('✓ Correct! ' + newly.map(i => 'Challenge ' + (i + 1) + ' (' + CHALLENGES[i].title + ')').join(' and ') + ' solved' + (newly.length > 1 || newly[0] !== active ? ' by that query.' : '.') + (newly.indexOf(active) >= 0 ? ' Pick the next challenge above.' : ''), 'good');
        } else if (!solved[active]) {
          setFb('Not yet for challenge ' + (active + 1) + ': ' + gradeResult(cur, res, SHOP).why, 'warn');
        } else fb.style.display = 'none';
        renderChallenges();
        const ids = Object.keys(solved).map(Number);
        if (ids.length >= 3) api.goal('three');
        if (ids.some(i => CHALLENGES[i].kind === 'join')) api.goal('join');
        if (ids.some(i => CHALLENGES[i].kind === 'group')) api.goal('group');
      }

      root.appendChild(ui.panel('The shop database (tap a table)', tblRow, previewHost));
      root.appendChild(ui.panel('Challenges', navHost, cardHost));
      root.appendChild(ui.panel('Your query', ta, ui.row(ui.btn('▶ Run', run, 'primary'), ui.btn('Clear', () => { ta.set(''); ta.input.focus(); }, 'ghost')), h('p.small', { style: { margin: '10px 0 6px', color: 'var(--muted)' } }, 'Examples to start from:'), examples()));
      root.appendChild(ui.panel('Result', statusEl, fb, resultHost));
      showTable('customers'); renderChallenges();
    }
  });
})();
