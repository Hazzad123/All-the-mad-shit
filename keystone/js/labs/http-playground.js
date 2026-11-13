/* Lab: http-playground — methods and status codes are a conversation with rules; poke a tiny to-do API and read the raw HTTP. */
(function () {
  // <model>
  const REASON = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 404: 'Not Found', 405: 'Method Not Allowed' };
  function seed() { return { nextId: 4, todos: [{ id: 1, title: 'Buy milk', done: false }, { id: 2, title: 'Learn HTTP', done: true }, { id: 3, title: 'Walk the dog', done: false }] }; }
  function jsonBody(raw) {                      // returns {value} for a JSON object, or {error}
    if (raw == null || !String(raw).trim()) return { error: 'The request needs a JSON body, but it was empty.' };
    let v; try { v = JSON.parse(raw); } catch (e) { return { error: 'The body is not valid JSON.' }; }
    if (!v || typeof v !== 'object' || Array.isArray(v)) return { error: 'The body must be a JSON object like {"title": "..."}.' };
    return { value: v };
  }
  function respond(status, obj, extra) {
    const body = obj === undefined ? '' : JSON.stringify(obj, null, 2);
    const headers = Object.assign({}, extra || {});
    if (body) { headers['Content-Type'] = 'application/json; charset=utf-8'; headers['Content-Length'] = String(body.length); }
    return { status: status, reason: REASON[status], headers: headers, body: body };
  }
  function bad(msg) { return respond(400, { error: msg }); }
  // handle(db, req): mutates db like a real server would and returns {status, reason, headers, body}
  function handle(db, req) {
    const method = String(req.method || 'GET').toUpperCase();
    let path = String(req.path || '/').split('?')[0].split('#')[0];
    if (path.length > 1 && path.slice(-1) === '/') path = path.slice(0, -1);
    const isList = path === '/todos';
    const m = path.match(/^\/todos\/(\d+)$/);
    if (!isList && !m) return respond(404, { error: 'No such path: ' + path });
    const allowed = isList ? ['GET', 'POST', 'HEAD', 'OPTIONS'] : ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    if (allowed.indexOf(method) < 0) return respond(405, { error: method + ' is not allowed on ' + path }, { Allow: allowed.join(', ') });
    if (method === 'OPTIONS') return respond(204, undefined, { Allow: allowed.join(', ') });
    if (method === 'HEAD') { const r = handle(db, { method: 'GET', path: path }); r.body = ''; return r; }   // same headers, no body
    if (isList) {
      if (method === 'GET') return respond(200, db.todos);
      const b = jsonBody(req.body); if (b.error) return bad(b.error);
      if (typeof b.value.title !== 'string' || !b.value.title.trim()) return bad('A to-do needs a non-empty "title".');
      const t = { id: db.nextId++, title: b.value.title.trim(), done: b.value.done === true };
      db.todos.push(t);
      return respond(201, t, { Location: '/todos/' + t.id });
    }
    const id = +m[1], i = db.todos.findIndex(function (t) { return t.id === id; });
    if (i < 0) return respond(404, { error: 'No to-do with id ' + id });
    if (method === 'GET') return respond(200, db.todos[i]);
    if (method === 'DELETE') { db.todos.splice(i, 1); return respond(204); }
    const b = jsonBody(req.body); if (b.error) return bad(b.error);
    const incoming = Object.assign({}, b.value); delete incoming.id;
    db.todos[i] = method === 'PUT' ? Object.assign({ id: id }, incoming) : Object.assign({}, db.todos[i], incoming);   // PUT replaces everything, PATCH merges
    return respond(200, db.todos[i]);
  }
  function rawRequest(req, host) {
    const hasBody = ['POST', 'PUT', 'PATCH'].indexOf(req.method) >= 0 && req.body && req.body.trim();
    let s = req.method + ' ' + req.path + ' HTTP/1.1\nHost: ' + host + '\nAccept: application/json';
    if (hasBody) s += '\nContent-Type: application/json\nContent-Length: ' + req.body.length + '\n\n' + req.body;
    return s;
  }
  // </model>

  const WHY = {
    200: 'It worked, and the answer is in the body.',
    201: 'Something new now exists. The `Location` header says where to find it.',
    204: 'Done, and there is deliberately nothing to send back.',
    400: 'The request itself was faulty, so the server refused to guess.',
    404: 'Nothing lives at that address.',
    405: 'The address exists, but not for that method. `Allow` lists the ones that work.'
  };
  const PRESETS = [
    ['List all', 'GET', '/todos', ''], ['Get #1', 'GET', '/todos/1', ''], ['Get #99', 'GET', '/todos/99', ''],
    ['Create', 'POST', '/todos', '{"title": "Water the plants"}'], ['Create (no title)', 'POST', '/todos', '{"done": true}'], ['Create (bad JSON)', 'POST', '/todos', '{title: oops'],
    ['PUT #1 (title only)', 'PUT', '/todos/1', '{"title": "Buy oat milk"}'], ['PATCH #2', 'PATCH', '/todos/2', '{"title": "Master HTTP"}'],
    ['Delete #3', 'DELETE', '/todos/3', ''], ['POST to #1', 'POST', '/todos/1', '{"title": "x"}'], ['Unknown path', 'GET', '/cats', ''], ['HEAD /todos', 'HEAD', '/todos', ''], ['OPTIONS /todos', 'OPTIONS', '/todos', '']
  ];

  KS.labs.register({
    id: 'http-playground',
    title: 'HTTP Playground',
    emoji: '📨',
    blurb: 'Send real-looking HTTP requests to a tiny to-do server, read the raw replies, and learn what each method and status code means.',
    tags: ['http', 'rest', 'api', 'status codes', 'methods'],
    goals: [
      { id: 'ok', text: 'Get a **200 OK**' },
      { id: 'create', text: 'Create a to-do and get **201 Created**' },
      { id: 'notfound', text: 'Cause a **404 Not Found**' },
      { id: 'bad', text: 'Cause a **400 Bad Request**' },
      { id: 'idem', text: '**Delete the same to-do twice** and compare the two answers' },
      { id: 'notallowed', text: 'Get a **405 Method Not Allowed**' }
    ],
    help: `You are the **client**. Choose a **method** (what you want to do), a **path** (which thing), and sometimes a **body** (the data), then press **Send**. The grey boxes show the exact text that travels over the wire, and the table on the right is the server's real data.

- **GET** reads. **POST** creates. **PUT** *replaces* a thing completely (anything you leave out is wiped!). **PATCH** changes only the fields you send. **DELETE** removes.
- **HEAD** is GET without the body; **OPTIONS** asks what is allowed.

The first digit of the **status code** tells the story: **2xx** it worked, **4xx** you made a mistake, **5xx** the server broke. Tap the preset buttons for quick experiments, or edit the request yourself.`,

    mount(root, api) {
      const ui = api.ui, h = api.h, HOST = 'todos.example.com';
      let db = seed(), method = 'GET', path = '/todos', body = '', changed = null;
      const deleted = {};

      const methodSel = ui.select('Method', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'], method, v => { method = v; showRequest(); });
      const pathIn = ui.input('Path', path, v => { path = v; showRequest(); }, { class: 'mono' });
      const bodyIn = ui.textarea('Body (JSON, for POST / PUT / PATCH)', body, v => { body = v; showRequest(); }, 3);
      const sendBtn = ui.btn('📨 Send request', () => send(), 'primary');
      const resetBtn = ui.btn('↺ Reset server data', () => { db = seed(); changed = null; Object.keys(deleted).forEach(k => delete deleted[k]); log.add('Server data reset to the 3 starting to-dos.', 'warn'); renderData(); }, 'sm');
      const presetRow = h('div.lab-row', PRESETS.map(p => ui.btn(p[0], () => preset(p), 'sm')));
      const preStyle = { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '0', background: 'var(--code-bg)', border: '1px solid var(--code-line)', borderRadius: '12px', padding: '10px 12px', fontSize: '.8rem', minHeight: '3.2em' };
      const reqPre = h('pre.lab-mono', { style: preStyle });
      const statusChip = h('span.lab-chip', 'no response yet');
      const resPre = h('pre.lab-mono', { style: preStyle });
      const tbody = h('tbody');
      const log = ui.log(40);

      root.appendChild(ui.panel('Build a request', ui.row(methodSel, pathIn), bodyIn, ui.row(sendBtn, resetBtn), h('p.muted.small', { style: { margin: '10px 0 6px' } }, 'Quick experiments (tap to fill in and send):'), presetRow));
      root.appendChild(h('div.lab-grid2.even', ui.panel('What goes over the wire: request', reqPre), ui.panel('What comes back: response', statusChip, h('div', { style: { height: '8px' } }), resPre)));
      root.appendChild(h('div.lab-grid2', ui.panel('What just happened', log.el), ui.panel('The server\'s data (to-dos)', h('div.lab-table-wrap', h('table.lab-table', h('thead', h('tr', h('th', 'id'), h('th', 'title'), h('th', 'done'))), tbody)))));

      function currentReq() { let p = String(path || '').trim(); if (p.charAt(0) !== '/') p = '/' + p; return { method: method, path: p, body: body }; }
      function showRequest() { reqPre.textContent = rawRequest(currentReq(), HOST); }
      function renderData() {
        KS.clear(tbody);
        if (!db.todos.length) tbody.appendChild(h('tr.dim', h('td', { colspan: '3' }, '(no to-dos left)')));
        db.todos.forEach(t => {
          const miss = v => v === undefined ? h('span.bad', '(missing!)') : String(v);
          tbody.appendChild(h('tr' + (changed === t.id ? '.hl' : ''), h('td', String(t.id)), h('td', miss(t.title)), h('td', miss(t.done))));
        });
      }
      function preset(p) { method = p[1]; path = p[2]; body = p[3]; methodSel.set(method); pathIn.set(path); bodyIn.set(body); send(); }
      function send() {
        const req = currentReq();
        showRequest();
        const before = JSON.stringify(db.todos);
        const res = handle(db, req);
        const mm = req.path.match(/^\/todos\/(\d+)\/?$/); const tid = mm ? +mm[1] : null;
        changed = null;
        if ((req.method === 'POST' && res.status === 201) || ((req.method === 'PUT' || req.method === 'PATCH') && res.status === 200)) { try { changed = JSON.parse(res.body).id; } catch (e) { changed = null; } }
        renderData();
        const head = 'HTTP/1.1 ' + res.status + ' ' + res.reason + Object.keys(res.headers).map(k => '\n' + k + ': ' + res.headers[k]).join('');
        resPre.textContent = head + (res.body ? '\n\n' + res.body : (req.method === 'HEAD' ? '\n\n(HEAD: headers only, no body sent)' : '\n\n(empty body)'));
        const tone = res.status < 300 ? 'good' : 'warn';
        statusChip.className = 'lab-chip tn-' + tone; statusChip.textContent = res.status + ' ' + res.reason;
        let why = WHY[res.status] || '';
        if (res.status === 400) { try { why += ' ' + JSON.parse(res.body).error; } catch (e) { /* ignore */ } }
        if (req.method === 'PUT' && res.status === 200 && /^\{[^]*\}$/.test(req.body.trim())) why += ' PUT *replaced* the whole to-do, so any field you left out is gone (see the table).';
        if (req.method === 'PATCH' && res.status === 200) why += ' PATCH only changed the fields you sent.';
        if (req.method === 'HEAD') why = 'HEAD returns the same headers as GET but no body. Handy for checking something exists.';
        if (req.method === 'OPTIONS' && res.status === 204) why = 'The server tells you which methods work here in the `Allow` header.';
        log.add('**' + req.method + ' ' + req.path + '** → **' + res.status + ' ' + res.reason + '**. ' + why, tone);
        if (req.method === 'DELETE' && tid !== null) {
          if (res.status === 204) deleted[tid] = true;
          else if (res.status === 404 && deleted[tid]) { log.add('Second DELETE of #' + tid + ': first **204**, now **404**. The to-do is gone either way. Repeating a DELETE leaves the server in the same state, which is why it is called **idempotent** (the status code differs though).', 'info'); api.goal('idem'); }
        }
        if (res.status === 200) api.goal('ok');
        if (res.status === 201) api.goal('create');
        if (res.status === 404) api.goal('notfound');
        if (res.status === 400) api.goal('bad');
        if (res.status === 405) api.goal('notallowed');
        void before;
      }

      showRequest(); renderData();
      log.add('Tap **Send request**, or try a quick experiment. Start with **List all**.', 'dim');
    }
  });
})();
