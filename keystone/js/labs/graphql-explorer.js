/* Lab: graphql-explorer — one request, exactly the fields you ask for, and the N+1 trap that comes with nesting. */
(function () {
  // ---------- sample data ----------
  const USERS = {
    1: { id: 1, name: 'Ada', email: 'ada@example.com', bio: 'Writes about engines and analysis.', joined: '2021-03-04', avatar: 'https://img.example.com/u/1.png' },
    2: { id: 2, name: 'Ben', email: 'ben@example.com', bio: 'Mostly lurks. Occasionally corrects people.', joined: '2022-01-19', avatar: 'https://img.example.com/u/2.png' },
    3: { id: 3, name: 'Cy', email: 'cy@example.com', bio: 'Collects keyboards.', joined: '2022-08-30', avatar: 'https://img.example.com/u/3.png' },
    4: { id: 4, name: 'Dee', email: 'dee@example.com', bio: 'Here for the memes.', joined: '2023-02-11', avatar: 'https://img.example.com/u/4.png' }
  };
  const POSTS = [
    { id: 1, userId: 1, title: 'Hello, world', body: 'This is my very first post. I hope somebody reads it, otherwise it will be a long year.', published: '2024-01-02' },
    { id: 2, userId: 1, title: 'Why queues matter', body: 'A queue lets a fast producer and a slow consumer live together in peace. Mostly.', published: '2024-02-09' },
    { id: 3, userId: 1, title: 'Notes on caching', body: 'There are two hard things in computer science. Caching is the one I got wrong first.', published: '2024-03-21' }
  ];
  const COMMENTS = [
    { id: 1, postId: 1, authorId: 2, text: 'Welcome!', createdAt: '2024-01-02T10:00:00Z' },
    { id: 2, postId: 1, authorId: 3, text: 'First!', createdAt: '2024-01-02T10:05:00Z' },
    { id: 3, postId: 2, authorId: 4, text: 'Great explanation.', createdAt: '2024-02-09T09:12:00Z' },
    { id: 4, postId: 2, authorId: 2, text: 'What about backpressure?', createdAt: '2024-02-09T11:40:00Z' },
    { id: 5, postId: 2, authorId: 3, text: 'Bookmarked.', createdAt: '2024-02-10T08:00:00Z' },
    { id: 6, postId: 3, authorId: 2, text: 'Off-by-one, again?', createdAt: '2024-03-21T17:30:00Z' },
    { id: 7, postId: 3, authorId: 4, text: 'Ha, so true.', createdAt: '2024-03-22T07:45:00Z' }
  ];

  // ---------- schema ----------
  // leaf: { key } reads obj[key]. object field: { key, list, get(parent), children }
  const SCHEMA = [
    { key: 'name' }, { key: 'email' },
    { key: 'posts', list: true, get: u => POSTS.filter(p => p.userId === u.id), children: [
      { key: 'title' },
      { key: 'comments', list: true, get: p => COMMENTS.filter(c => c.postId === p.id), children: [
        { key: 'text' },
        { key: 'author', get: c => USERS[c.authorId], children: [{ key: 'name' }] }
      ] }
    ] }
  ];
  function allPaths(nodes, prefix, out) {
    nodes.forEach(n => { const p = prefix ? prefix + '.' + n.key : n.key; out.push(p); if (n.children) allPaths(n.children, p, out); });
    return out;
  }
  function findNode(path) {
    let nodes = SCHEMA, node = null;
    path.split('.').forEach(k => { node = (nodes || []).filter(n => n.key === k)[0] || null; nodes = node && node.children; });
    return node;
  }
  /** Tick or untick a path. Ticking adds its parents (and one leaf if it is an object); unticking removes its descendants (and empty parents). */
  function toggle(sel, path, on) {
    const s = Object.assign({}, sel);
    const parts = path.split('.');
    if (on) {
      for (let i = 1; i <= parts.length; i++) s[parts.slice(0, i).join('.')] = true;
      let node = findNode(path);
      while (node && node.children) {                      // an object field needs at least one sub-field
        const have = node.children.some(c => s[path + '.' + c.key]);
        if (!have) { node = node.children[0]; path += '.' + node.key; s[path] = true; } else break;
      }
    } else {
      Object.keys(s).forEach(k => { if (k === path || k.indexOf(path + '.') === 0) delete s[k]; });
      for (let i = parts.length - 1; i >= 1; i--) {
        const par = parts.slice(0, i).join('.');
        const any = Object.keys(s).some(k => k.indexOf(par + '.') === 0);
        if (!any) delete s[par];
      }
    }
    return s;
  }
  function buildQuery(sel) {
    function fields(nodes, prefix, ind) {
      let out = '';
      nodes.forEach(n => {
        const p = prefix ? prefix + '.' + n.key : n.key;
        if (!sel[p]) return;
        if (n.children) out += ind + n.key + ' {\n' + fields(n.children, p, ind + '  ') + ind + '}\n';
        else out += ind + n.key + '\n';
      });
      return out;
    }
    const body = fields(SCHEMA, '', '    ');
    if (!body) return '';
    return '{\n  user(id: 1) {\n' + body + '  }\n}';
  }
  /** Run the query against the sample data and count database calls made by resolvers. */
  function execute(sel, batching) {
    const calls = { user: 0 };
    function build(nodes, prefix, obj) {
      const out = {};
      nodes.forEach(n => {
        const p = prefix ? prefix + '.' + n.key : n.key;
        if (!sel[p]) return;
        if (!n.children) { out[n.key] = obj[n.key]; return; }
        calls[n.key] = batching ? 1 : (calls[n.key] || 0) + 1;   // one lookup per parent, unless batched into one
        const kids = n.get(obj);
        out[n.key] = n.list ? kids.map(k => build(n.children, p, k)) : build(n.children, p, kids);
      });
      return out;
    }
    if (!Object.keys(sel).length) return { result: null, calls: {}, total: 0 };
    calls.user = 1;
    const result = { user: build(SCHEMA, '', USERS[1]) };
    let total = 0; Object.keys(calls).forEach(k => { total += calls[k]; });
    return { result, calls, total };
  }
  /** What a typical REST API would make you do for the same data (full objects come back each time). */
  function restPlan(sel) {
    if (!Object.keys(sel).length) return [];
    const reqs = [{ path: 'GET /users/1', body: USERS[1] }];
    if (sel.posts) {
      const posts = POSTS.filter(p => p.userId === 1);
      reqs.push({ path: 'GET /users/1/posts', body: posts });
      if (sel['posts.comments']) {
        const authors = {};
        posts.forEach(p => {
          const cs = COMMENTS.filter(c => c.postId === p.id);
          reqs.push({ path: 'GET /posts/' + p.id + '/comments', body: cs });
          cs.forEach(c => { authors[c.authorId] = true; });
        });
        if (sel['posts.comments.author']) Object.keys(authors).forEach(id => reqs.push({ path: 'GET /users/' + id, body: USERS[id] }));
      }
    }
    reqs.forEach(r => { r.bytes = JSON.stringify(r.body).length; });
    return reqs;
  }
  const logic = { SCHEMA, allPaths, toggle, buildQuery, execute, restPlan };

  KS.labs.register({
    logic,
    id: 'graphql-explorer',
    title: 'GraphQL Explorer',
    emoji: '🕸',
    blurb: 'Tick the fields you want and get exactly those back in one request. Then see what nesting does to the database.',
    tags: ['graphql', 'api', 'rest', 'n+1', 'dataloader'],
    goals: [
      { id: 'tiny', text: 'Ask for **only the user\'s name** and nothing else' },
      { id: 'nested', text: 'Fetch **posts with their comments** in one query and see how many REST calls it replaces' },
      { id: 'batch', text: 'Select **comment authors**, then turn on **batching** and watch database calls drop' }
    ],
    help: `With a **REST** API every URL returns a fixed shape. To show a user, their posts, the comments and who wrote them you make many requests and receive lots of data you never use.

With **GraphQL** you send one query listing exactly the fields you want, and the answer has exactly that shape. Tick fields on the left; the query and result update.

The catch is on the server. Each nested field has a **resolver**, a small function that fetches it. For every post the server asks the database for its comments, and for every comment it asks for the author: one query to get a list, then **N more** for the items. That is the **N+1 problem**.

**Batching** (the DataLoader pattern) collects all those lookups and asks the database once ("give me comments for posts 1, 2 and 3").`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      let sel = { name: true, email: true }, batching = false;
      const log = ui.log(40);
      const treeHost = h('div.lab-stack');
      const queryHost = h('div');
      const resultHost = h('div', { style: { maxHeight: '260px', overflow: 'auto' } });
      const restHost = h('div');
      const dbHost = h('div');
      const statReq = ui.stat('REST requests', 0, 'warn'), statBytes = ui.stat('REST bytes', 0), statGql = ui.stat('GraphQL bytes', 0, 'good'), statUnused = ui.stat('REST data unused', '0%', 'bad');
      const statDb = ui.stat('database calls now', 0, 'accent');
      const batchToggle = ui.toggle('Batching (DataLoader)', false, v => { batching = v; log.add('Batching **' + (v ? 'on' : 'off') + '**.', 'info'); render(true); });

      function preset(label, keys) { return ui.btn(label, () => { sel = {}; keys.forEach(k => { sel[k] = true; }); log.add('Selected: ' + label.toLowerCase() + '.', 'dim'); render(true); }, 'sm'); }
      const everything = allPaths(SCHEMA, '', []);

      root.appendChild(ui.panel('Quick starts', ui.row(
        preset('Just the name', ['name']),
        preset('Posts + comments', ['posts', 'posts.title', 'posts.comments', 'posts.comments.text']),
        preset('Everything', everything))));
      root.appendChild(h('div.lab-grid2.even',
        ui.panel('1. Pick fields (user #1)', treeHost),
        ui.panel('2. The query you send', queryHost)));
      root.appendChild(h('div.lab-grid2.even',
        ui.panel('3. What comes back (one response)', resultHost),
        ui.panel('Compare: the REST way', ui.stats(statReq, statBytes, statGql, statUnused), restHost)));
      root.appendChild(ui.panel('Behind the scenes: database calls', ui.row(batchToggle, statDb), dbHost));
      root.appendChild(ui.panel('What just happened', log.el));

      // ---------- rendering ----------
      function renderTree(nodes, prefix, depth, host) {
        nodes.forEach(n => {
          const p = prefix ? prefix + '.' + n.key : n.key;
          const label = n.children ? n.key + (n.list ? ' [ ] { … }' : ' { … }') : n.key;
          host.appendChild(h('div', { style: { marginLeft: depth * 18 + 'px', padding: '5px 0' } },
            ui.toggle(label, !!sel[p], v => { sel = toggle(sel, p, v); render(true); })));
          if (n.children && sel[p]) renderTree(n.children, p, depth + 1, host);
        });
      }
      function render(announce) {
        KS.clear(treeHost); renderTree(SCHEMA, '', 0, treeHost);
        const q = buildQuery(sel), run = execute(sel, batching), naive = execute(sel, false), batched = execute(sel, true), rest = restPlan(sel);
        KS.clear(queryHost);
        queryHost.appendChild(q ? ui.code(q, 'text') : ui.note('Tick at least one field to build a query.', 'warn'));
        KS.clear(resultHost);
        resultHost.appendChild(run.result ? ui.code(JSON.stringify(run.result, null, 2), 'json') : h('p.muted', 'Nothing asked for, nothing returned.'));
        // REST comparison
        const gqlBytes = run.result ? JSON.stringify(run.result).length : 0;
        let restBytes = 0; rest.forEach(r => { restBytes += r.bytes; });
        const unused = restBytes ? Math.max(0, Math.round((1 - Math.min(gqlBytes, restBytes) / restBytes) * 100)) : 0;
        statReq.set(rest.length); statBytes.set(restBytes); statGql.set(gqlBytes); statUnused.set(unused + '%');
        KS.clear(restHost);
        restHost.appendChild(rest.length
          ? h('div.lab-table-wrap', h('table.lab-table', h('tr', h('th', 'request'), h('th', 'bytes')), rest.map(r => h('tr', h('td.lab-mono', r.path), h('td', String(r.bytes))))))
          : h('p.muted', 'No requests needed.'));
        // database calls
        statDb.set(run.total);
        KS.clear(dbHost);
        const rows = [['user', 'user'], ['posts', 'posts'], ['comments', 'comments'], ['author', 'author']].filter(r => naive.calls[r[1]]);
        dbHost.appendChild(rows.length ? h('div.lab-table-wrap', h('table.lab-table',
          h('tr', h('th', 'resolver'), h('th', 'no batching'), h('th', 'batched')),
          rows.map(r => h('tr' + (batching ? '' : '.hl'), h('td.lab-mono', r[0]), h('td', String(naive.calls[r[1]])), h('td', String(batched.calls[r[1]])))),
          h('tr', h('td', h('strong', 'total')), h('td', h('strong', String(naive.total))), h('td', h('strong', String(batched.total)))))) : h('p.muted', 'No database calls yet.'));
        dbHost.appendChild(h('p.muted.small', 'One call per parent item is the N+1 pattern: 1 query for a list, then N more for its items.'));
        if (announce && run.result) log.add('Query sends **1 request** (' + gqlBytes + ' bytes). REST would need **' + rest.length + '** (' + restBytes + ' bytes, ' + unused + '% unused). The server makes **' + run.total + '** database call' + (run.total === 1 ? '' : 's') + (batching ? ' with batching.' : '.'), run.total > 4 && !batching ? 'warn' : 'info');
        check(naive, batched, rest);
      }
      function check(naive, batched, rest) {
        if (Object.keys(sel).length === 1 && sel.name) api.goal('tiny');
        if (sel['posts.comments.text']) api.goal('nested');
        if (batching && sel['posts.comments.author'] && naive.total > batched.total) api.goal('batch');
      }
      render(false);
      log.add('Start by unticking **email**, or press *Posts + comments*.', 'dim');
    }
  });
})();
