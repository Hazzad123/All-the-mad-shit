/* Lab: normalizer — storing a fact twice lets it disagree with itself; split the table so each fact lives once. */
KS.labs.register({
  id: 'normalizer',
  title: 'Normalizer',
  emoji: '🧹',
  blurb: 'One big spreadsheet-style table repeats the same facts again and again. Break it, then tidy it up.',
  tags: ['databases', 'normalisation', 'schema design', 'sql'],
  goals: [
    { id: 'update', text: 'Cause an **update anomaly**: change one email so the same customer has two' },
    { id: 'delete', text: 'Cause a **delete anomaly**: delete an order line and make a customer vanish' },
    { id: 'split', text: '**Normalise** the table into customers, products, orders and order lines' },
    { id: 'once', text: 'Change an email **once** and see every order pick it up' }
  ],
  help: `At first everything lives in **one wide table**: each row is one order line, and it repeats the customer's name, email and city and the product's price every time.

That repeating is the problem. Change an email on one row and the customer now has *two* emails (an **update anomaly**). Delete a customer's only order and the customer is forgotten entirely (a **delete anomaly**). And you cannot store a product nobody has ordered yet (an **insert anomaly**).

**Normalising** means giving each fact one home: a \`customers\` table, a \`products\` table, \`orders\` and \`order_items\`. Rows point at each other with ids (**keys**). A **JOIN** glues them back together whenever you want the wide view.`,

  mount(root, api) {
    const ui = api.ui, h = api.h;
    const SEED = [
      [1, 'Amelia Clarke', 'amelia.clarke@example.co.uk', 'Leeds', 'Teapot', 18.5, 1],
      [1, 'Amelia Clarke', 'amelia.clarke@example.co.uk', 'Leeds', 'Tea Towels', 7.99, 2],
      [2, 'Oliver Patel', 'oliver.patel@example.com', 'Manchester', 'Teapot', 18.5, 1],
      [2, 'Oliver Patel', 'oliver.patel@example.com', 'Manchester', 'Wool Scarf', 15, 1],
      [3, 'Priya Shah', 'priya.shah@example.co.uk', 'Leicester', 'Biscuit Tin', 6.5, 3],
      [4, 'Amelia Clarke', 'amelia.clarke@example.co.uk', 'Leeds', 'Wool Scarf', 15, 2],
      [5, 'Callum MacLeod', 'callum.macleod@example.com', 'Glasgow', 'Teapot', 18.5, 2]
    ];
    let wide, db, stage, lost, changedCid;
    const money = p => '£' + p.toFixed(2);
    function init() {
      wide = SEED.map(r => ({ oid: r[0], name: r[1], email: r[2], city: r[3], product: r[4], price: r[5], qty: r[6] }));
      db = null; stage = 0; lost = []; changedCid = null;
    }
    init();

    // ---------- UI ----------
    const log = ui.log(40);
    const emailIn = ui.input('New email to use for the "Set email" buttons', 'new.address@example.com', () => {});
    const prodName = ui.input('New product name', 'Umbrella', () => {});
    const prodPrice = ui.input('Price (£)', '16', () => {}, { inputmode: 'decimal' });
    const nextBtn = ui.btn('Normalise: next step ▶', () => nextStep(), 'primary');
    const sRows = ui.stat('rows stored', 0), sCust = ui.stat('customers', 0), sCopies = ui.stat('copies of customer details', 0);
    const note = h('div.lab-note');
    const tablesHost = h('div.lab-stack');
    root.appendChild(ui.panel('Controls', ui.row(nextBtn, ui.btn('↺ Start over', () => { init(); log.add('Reset to the original wide table.', 'info'); render(); }, 'ghost')), h('div', { style: { height: '8px' } }), emailIn));
    root.appendChild(note);
    root.appendChild(ui.stats(sRows, sCust, sCopies));
    root.appendChild(h('div.lab-grid2', ui.panel('The tables', tablesHost), ui.panel('What just happened', log.el)));
    root.appendChild(ui.panel('Try to add a product nobody has ordered yet', ui.row(prodName, prodPrice, ui.btn('Add product', () => addProduct())), h('p.muted.small', 'A new product is a fact on its own. Where can it live?')));

    function tbl(title, cols, rows, o) {
      o = o || {};
      return h('div',
        h('div', { style: { fontWeight: '800', margin: '2px 0 4px' } }, title, o.tag ? h('span.lab-chip.tn-accent', { style: { marginLeft: '8px' } }, o.tag) : null),
        h('div.lab-table-wrap', h('table.lab-table',
          h('thead', h('tr', cols.map(c => h('th', c)), o.act ? h('th', '') : null)),
          h('tbody', rows.map((r, i) => h('tr', { class: o.cls ? o.cls(r, i) : null }, r.map(v => h('td', String(v))), o.act ? h('td', o.act(r, i)) : null))))));
    }

    // ---------- model ----------
    function emailsOf(name) { const s = []; wide.forEach(r => { if (r.name === name && s.indexOf(r.email) < 0) s.push(r.email); }); return s; }
    function distinct(f) { const s = []; wide.forEach(r => { const v = f(r); if (s.indexOf(v) < 0) s.push(v); }); return s; }
    function joined() {
      return db.items.map(it => {
        const o = db.orders.find(x => x.id === it.oid), c = db.customers.find(x => x.id === o.cid), p = db.products.find(x => x.id === it.pid);
        return { oid: it.oid, cid: c.id, name: c.name, email: c.email, city: c.city, product: p.name, price: p.price, qty: it.qty };
      });
    }
    function build() {
      db = { customers: [], products: [], orders: [], items: [] };
      wide.forEach(r => {
        let c = db.customers.find(x => x.name === r.name);
        if (!c) { c = { id: db.customers.length + 1, name: r.name, email: r.email, city: r.city }; db.customers.push(c); }
        else if (c.email !== r.email) log.add('**' + r.name + '** had two different emails. The database cannot know which is right, so it keeps the first one it saw. This is the damage an update anomaly does.', 'warn');
        let p = db.products.find(x => x.name === r.product);
        if (!p) { p = { id: db.products.length + 1, name: r.product, price: r.price }; db.products.push(p); }
        if (!db.orders.find(x => x.id === r.oid)) db.orders.push({ id: r.oid, cid: c.id });
        db.items.push({ oid: r.oid, pid: p.id, qty: r.qty });
      });
    }

    // ---------- actions ----------
    function setEmailWide(i) {
      const v = emailIn.get().trim(); const r = wide[i];
      if (!v) { log.add('Type a new email in the box first.', 'warn'); return; }
      if (r.email === v) { log.add('That row already has that email.', 'dim'); return; }
      r.email = v;
      log.add('Changed the email on **order ' + r.oid + ' / ' + r.product + '** only. ' + r.name + "'s other rows still hold the old address.", 'warn');
      render(); check();
    }
    function deleteWide(i) {
      const r = wide.splice(i, 1)[0];
      log.add('Deleted the line **' + r.product + ' × ' + r.qty + '** from order ' + r.oid + '.', 'info');
      if (!wide.some(x => x.name === r.name)) { lost.push(r.name); log.add('💥 **' + r.name + '** is gone from the database entirely: their name, email and city lived only on that row. (Delete anomaly)', 'bad'); }
      if (!wide.some(x => x.product === r.product)) log.add('💥 The product **' + r.product + '** and its price vanished too.', 'bad');
      render(); check();
    }
    function addProduct() {
      const name = prodName.get().trim(), price = parseFloat(prodPrice.get());
      if (!name || !isFinite(price) || price < 0) { log.add('Give the product a name and a price first.', 'warn'); return; }
      if (stage === 0) { log.add('✗ Cannot add **' + name + '**: every row is an order line, so a product needs a customer and an order to exist. You would have to invent fake data. (Insert anomaly)', 'bad'); return; }
      if (stage < 3) { log.add('Finish normalising first, then you can add products.', 'warn'); return; }
      if (db.products.some(p => p.name.toLowerCase() === name.toLowerCase())) { log.add('**' + name + '** already exists.', 'dim'); return; }
      db.products.push({ id: db.products.reduce((m, p) => Math.max(m, p.id), 0) + 1, name, price });
      log.add('✓ Added **' + name + '** to the products table. Nobody has ordered it, and that is fine: it has a home of its own.', 'good');
      render();
    }
    function setEmailCust(c) {
      const v = emailIn.get().trim();
      if (!v) { log.add('Type a new email in the box first.', 'warn'); return; }
      if (c.email === v) { log.add('That customer already has that email.', 'dim'); return; }
      c.email = v; changedCid = c.id;
      const lines = joined().filter(x => x.cid === c.id);
      log.add('Updated **one row** in customers. Now every one of ' + c.name + "'s " + lines.length + ' order line' + (lines.length === 1 ? '' : 's') + ' shows the new email in the joined view. ✓', 'good');
      render();
      if (lines.length >= 2 && lines.every(x => x.email === v)) api.goal('once');
    }
    function deleteItem(k) {
      const it = db.items.splice(k, 1)[0];
      const o = db.orders.find(x => x.id === it.oid), c = db.customers.find(x => x.id === o.cid), p = db.products.find(x => x.id === it.pid);
      if (!db.items.some(x => x.oid === o.id)) db.orders.splice(db.orders.indexOf(o), 1);
      log.add('Deleted a line of order ' + it.oid + '. **' + c.name + '** and **' + p.name + '** are still in their own tables, so nothing was forgotten. ✓', 'good');
      render();
    }
    function nextStep() {
      if (stage >= 3) return;
      stage++;
      if (stage === 1) build();
      log.add(['', 'Step 1: customers now live in **their own table**. Each has an **id** (a key); orders refer to it with a **customer_id**.', 'Step 2: products get their own table too, so a price is stored **once**.', 'Step 3: an **order** (who, when) is separate from its **lines** (which products, how many). Fully normalised!'][stage], 'good');
      render(); check();
    }
    function check() {
      if (stage === 0 && wide.some(r => emailsOf(r.name).length > 1)) api.goal('update');
      if (stage === 0 && lost.length) api.goal('delete');
      if (stage === 3) api.goal('split');
    }

    // ---------- render ----------
    function render() {
      KS.clear(tablesHost);
      nextBtn.disabled = stage >= 3; nextBtn.textContent = stage >= 3 ? 'Fully normalised ✓' : (stage === 0 ? 'Normalise: step 1 of 3 ▶' : 'Normalise: step ' + (stage + 1) + ' of 3 ▶');
      note.className = 'lab-note' + (stage === 3 ? ' tn-good' : '');
      if (stage === 0) {
        const bad = wide.filter(r => emailsOf(r.name).length > 1).length;
        note.textContent = bad ? 'Some customers now have two different emails, and nothing in this table can tell you which one is right.' : 'One wide table. Try "Set email" on a single row, or delete a customer\'s only order line, and see what breaks.';
        sRows.set(wide.length); sCust.set(distinct(r => r.name).length); sCopies.set(wide.length, wide.length > distinct(r => r.name).length ? 'warn' : '');
        tablesHost.appendChild(tbl('orders (one wide table)', ['order', 'customer', 'email', 'city', 'product', 'price', 'qty'],
          wide.map(r => [r.oid, r.name, r.email, r.city, r.product, money(r.price), r.qty]),
          { cls: (r, i) => emailsOf(wide[i].name).length > 1 ? 'bad' : null, act: (r, i) => h('div.lab-row', { style: { flexWrap: 'nowrap' } }, ui.btn('Set email', () => setEmailWide(i), 'sm'), ui.btn('Delete', () => deleteWide(i), 'sm')) }));
        return;
      }
      sRows.set(db.customers.length + db.products.length + db.orders.length + db.items.length); sCust.set(db.customers.length); sCopies.set(db.customers.length, 'good');
      note.textContent = ['', 'Step 1: customer facts moved out. Each customer is stored once. The big table now only holds a customer_id.', 'Step 2: product facts moved out as well. A product price is stored once.', 'Done. Four small tables, each fact in exactly one place. Now repeat the edits: change an email, delete a line, add a product.'][stage];
      tablesHost.appendChild(tbl('customers', ['id 🔑', 'name', 'email', 'city'], db.customers.map(c => [c.id, c.name, c.email, c.city]),
        stage === 3 ? { tag: 'primary key: id', cls: (r, i) => db.customers[i].id === changedCid ? 'good' : null, act: (r, i) => ui.btn('Set email', () => setEmailCust(db.customers[i]), 'sm') } : { tag: 'primary key: id' }));
      if (stage >= 2) tablesHost.appendChild(tbl('products', ['id 🔑', 'name', 'price'], db.products.map(p => [p.id, p.name, money(p.price)]), { tag: 'primary key: id', cls: (r, i) => db.items.some(x => x.pid === db.products[i].id) ? null : 'dim' }));
      if (stage === 1) tablesHost.appendChild(tbl('orders (still wide, but customers are gone from it)', ['order', 'customer_id 🔗', 'product', 'price', 'qty'], db.items.map(it => { const o = db.orders.find(x => x.id === it.oid), p = db.products.find(x => x.id === it.pid); return [o.id, o.cid, p.name, money(p.price), it.qty]; })));
      if (stage === 2) tablesHost.appendChild(tbl('orders (customer_id and product_id point at other tables)', ['order', 'customer_id 🔗', 'product_id 🔗', 'qty'], db.items.map(it => [it.oid, db.orders.find(x => x.id === it.oid).cid, it.pid, it.qty])));
      if (stage === 3) {
        tablesHost.appendChild(tbl('orders', ['id 🔑', 'customer_id 🔗'], db.orders.map(o => [o.id, o.cid])));
        tablesHost.appendChild(tbl('order_items', ['order_id 🔗', 'product_id 🔗', 'quantity'], db.items.map(it => [it.oid, it.pid, it.qty]), { act: (r, i) => ui.btn('Delete', () => deleteItem(i), 'sm') }));
        const j = joined();
        tablesHost.appendChild(tbl('Joined view: rebuilds the original wide table', ['order', 'customer', 'email', 'city', 'product', 'price', 'qty'], j.map(r => [r.oid, r.name, r.email, r.city, r.product, money(r.price), r.qty]), { tag: 'JOIN of all four', cls: (r, i) => j[i].cid === changedCid ? 'good' : null }));
      }
    }
    render();
  }
});
