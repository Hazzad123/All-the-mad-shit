/* Lab: nplus1 — an innocent loop over an ORM can fire one query per row; JOIN or batching fixes it. */
KS.labs.register({
  id: 'nplus1',
  title: 'N+1 Detector',
  emoji: '🔁',
  blurb: 'A blog page shows posts with their authors. Count the database queries it fires, then fix the loop.',
  tags: ['databases', 'orm', 'performance', 'queries', 'n+1'],
  goals: [
    { id: 'lazy', text: 'Load **10 posts lazily** and count **11 queries**' },
    { id: 'join', text: 'Load the page with a **JOIN**: just **1 query**' },
    { id: 'batch', text: 'Load it with **batching** (`IN (...)`): **2 queries**' },
    { id: 'scale', text: 'Push the posts up to **50** and compare lazy against a fix' }
  ],
  help: `The page shows **N posts**, each with its **author's name**. The code is a simple loop, so it looks innocent.

With **lazy loading** the ORM fetches the posts in one query, then, as the loop touches each post's author, fires **one more query per post**. That is 1 + N queries: the **N+1 problem**.

Every query pays a **network round trip** to the database (about 3 ms here) before any real work happens, so 51 tiny queries are far slower than one clever one.

Fixes: an **eager JOIN** asks for posts and authors together in one query. **Batching** loads all the posts, then fetches every needed author in a single \`WHERE id IN (...)\` query. The coloured boxes are the posts; a box turns green when its author has arrived.`,

  mount(root, api) {
    const ui = api.ui, h = api.h;
    const RTT = 3;                                   // ms of network round trip paid by every query
    const AUTHORS = 12;
    const authorOf = i => ((i * 5) % AUTHORS) + 1;   // post number (1-based) → author id
    const CODE = {
      lazy: "const posts = await Post.findAll({ limit: N });      // 1 query\nfor (const post of posts) {\n  // post.author is loaded lazily, on first use:\n  render(post.title, (await post.getAuthor()).name);   // 1 query EACH\n}",
      join: "const posts = await Post.findAll({\n  include: Author,        // eager: JOIN in the same query\n  limit: N\n});\nfor (const post of posts) render(post.title, post.author.name);",
      batch: "const posts = await Post.findAll({ limit: N });          // query 1\nconst ids = unique(posts.map(p => p.authorId));\nconst authors = await Author.findAll({ where: { id: ids } }); // query 2\nfor (const post of posts) render(post.title, byId[post.authorId].name);"
    };
    const NAMES = { lazy: 'Lazy (loop)', join: 'Eager JOIN', batch: 'Batched IN (...)' };
    let n = 10, strategy = 'lazy', busy = false;
    const results = {};                              // 'strategy@N' → { queries, ms }

    // ---------- model: the list of queries each strategy really fires ----------
    function plan(strat, count) {
      const q = [];
      if (strat === 'lazy') {
        q.push({ sql: 'SELECT * FROM posts LIMIT ' + count, ms: RTT + 0.8, posts: 'seen' });
        for (let i = 1; i <= count; i++) q.push({ sql: 'SELECT * FROM authors WHERE id = ' + authorOf(i), ms: RTT + 0.3, posts: [i] });
      } else if (strat === 'join') {
        q.push({ sql: 'SELECT posts.*, authors.name FROM posts JOIN authors ON authors.id = posts.author_id LIMIT ' + count, ms: RTT + 1.5 + 0.05 * count, posts: 'all' });
      } else {
        const ids = []; for (let i = 1; i <= count; i++) { const a = authorOf(i); if (ids.indexOf(a) < 0) ids.push(a); }
        ids.sort((a, b) => a - b);
        q.push({ sql: 'SELECT * FROM posts LIMIT ' + count, ms: RTT + 0.8, posts: 'seen' });
        q.push({ sql: 'SELECT * FROM authors WHERE id IN (' + (ids.length > 6 ? ids.slice(0, 6).join(', ') + ', …' : ids.join(', ')) + ')', ms: RTT + 0.6 + 0.04 * ids.length, posts: 'all' });
      }
      return q;
    }

    // ---------- UI ----------
    const log = ui.log(70);
    const sQ = ui.stat('queries', 0), sMs = ui.stat('total time (ms)', 0);
    const cellsHost = h('div.lab-cells');
    const codeHost = h('div');
    const cmpHost = h('div.lab-stack');
    const meters = {}; Object.keys(NAMES).forEach(k => { meters[k] = ui.meter(NAMES[k]); cmpHost.appendChild(meters[k].el); });
    const loadBtn = ui.btn('▶ Load the page', () => load(), 'primary');
    const seg = ui.seg([['lazy', 'Lazy'], ['join', 'JOIN'], ['batch', 'Batch']], strategy, v => { strategy = v; renderCode(); renderCompare(); });
    const slider = ui.slider('Posts on the page (N)', { min: 5, max: 50, value: n, fmt: v => v + ' posts' }, v => { n = v; if (!busy) renderCells('idle'); renderCompare(); renderCode(); });
    root.appendChild(ui.panel('Controls', slider, h('div', { style: { height: '8px' } }), ui.row(seg, loadBtn)));
    root.appendChild(h('div.lab-grid2', ui.panel('The page being built', cellsHost, h('div', { style: { height: '10px' } }), ui.stats(sQ, sMs)), ui.panel('Code the developer wrote', codeHost)));
    root.appendChild(h('div.lab-grid2', ui.panel('Query log (what the database received)', log.el), ui.panel('Last result for this N', cmpHost)));

    function renderCode() { KS.clear(codeHost); codeHost.appendChild(ui.code(CODE[strategy].replace(/\bN\b/g, String(n)), 'js')); }
    // cell states: idle (grey), hl (posts loaded, author pending), good (author arrived)
    let cellEls = [];
    function renderCells(state, cnt) {
      KS.clear(cellsHost); cellEls = [];
      for (let i = 1; i <= (cnt || n); i++) { const c = h('div.lab-cell' + (state === 'hl' ? '.hl' : state === 'good' ? '.good' : ''), '#' + i); cellEls.push(c); cellsHost.appendChild(c); }
    }
    function renderCompare() {
      let max = 1; Object.keys(NAMES).forEach(k => { const r = results[k + '@' + n]; if (r) max = Math.max(max, r.ms); });
      Object.keys(NAMES).forEach(k => {
        const r = results[k + '@' + n];
        if (!r) meters[k].set(0, 'not run at N = ' + n, '');
        else meters[k].set(r.ms / max, r.queries + (r.queries === 1 ? ' query' : ' queries') + ' · ' + r.ms.toFixed(1) + ' ms', k === 'lazy' ? 'bad' : 'good');
      });
    }

    // ---------- the page load ----------
    async function load() {
      if (busy) return;
      busy = true; loadBtn.disabled = true;
      const count = n, strat = strategy, queries = plan(strat, count);
      log.add('— Loading **' + count + ' posts** with **' + NAMES[strat] + '** —', 'info');
      sQ.set(0); sMs.set(0); renderCells('idle', count);
      const pause = Math.max(15, Math.min(110, 1800 / queries.length));
      let total = 0; const done = new Set();
      for (let i = 0; i < queries.length; i++) {
        const q = queries[i];
        await api.sleep(pause);
        if (!api.alive()) return;
        total += q.ms;
        log.add('#' + (i + 1) + '  `' + q.sql + '`  (' + q.ms.toFixed(1) + ' ms)', strat === 'lazy' && i > 0 ? 'warn' : 'dim');
        sQ.set(i + 1, strat === 'lazy' && i > 1 ? 'bad' : ''); sMs.set(total.toFixed(1));
        if (q.posts === 'all') renderCells('good', count);
        else if (q.posts === 'seen') renderCells('hl', count);
        else { q.posts.forEach(p => done.add(p)); const c = cellEls[q.posts[0] - 1]; if (c) c.className = 'lab-cell good'; }
      }
      if (!api.alive()) return;
      results[strat + '@' + count] = { queries: queries.length, ms: total };
      if (strat === 'lazy') log.add('**' + queries.length + ' queries** for ' + count + ' posts: 1 for the posts, then **one per post** for its author. Each paid its own ' + RTT + ' ms round trip, and that waiting is most of the ' + total.toFixed(0) + ' ms.', 'bad');
      else if (strat === 'join') log.add('**1 query**: the database matched authors to posts itself and sent everything back in one trip. ' + total.toFixed(1) + ' ms.', 'good');
      else log.add('**2 queries**: all the posts, then every needed author in one `IN (...)` query. ' + total.toFixed(1) + ' ms.', 'good');
      busy = false; loadBtn.disabled = false;
      renderCompare();
      if (strat === 'lazy' && count === 10 && queries.length === 11) api.goal('lazy');
      if (strat === 'join' && queries.length === 1) api.goal('join');
      if (strat === 'batch' && queries.length === 2) api.goal('batch');
      if (count === 50 && results['lazy@50'] && (results['join@50'] || results['batch@50'])) {
        const fix = results['join@50'] || results['batch@50'];
        if (strat !== 'lazy') log.add('At N = 50, lazy took **' + results['lazy@50'].ms.toFixed(0) + ' ms** against **' + fix.ms.toFixed(1) + ' ms**: roughly ' + Math.round(results['lazy@50'].ms / fix.ms) + '× slower, and the gap grows with every extra post.', 'info');
        api.goal('scale');
      }
    }

    renderCells('idle'); renderCode(); renderCompare();
    log.add('Pick a strategy and press **Load the page**. Start with *Lazy* to see the problem.', 'info');
  }
});
