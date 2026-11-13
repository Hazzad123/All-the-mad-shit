/* Lab: pattern-toys — five design patterns as small toys you can feel working. */
KS.labs.register({
  id: 'pattern-toys',
  title: 'Pattern Playground',
  emoji: '🧸',
  blurb: 'Five classic design patterns, each as a tiny toy with the few lines of code that matter. Poke them and see what each trick is for.',
  tags: ['design patterns', 'strategy', 'observer', 'decorator', 'state', 'command', 'code craft'],
  goals: [
    { id: 'strategy', text: '**Strategy:** get three different delivery prices for the same basket' },
    { id: 'observer', text: '**Observer:** notify two subscribers, unsubscribe one, notify again' },
    { id: 'decorator', text: '**Decorator:** stack three decorators on one coffee' },
    { id: 'state', text: '**State:** reach *delivered* and get an illegal move refused' },
    { id: 'command', text: '**Command:** do three actions, then undo them all' }
  ],
  help: `A design pattern is a named trick programmers keep reinventing. Each tab is one trick.

- **Strategy:** swap *how* something is calculated while the program runs, without \`if\` chains.
- **Observer:** one thing announces changes; anyone who signed up hears about them.
- **Decorator:** wrap an object in layers, each adding a bit of behaviour. Order can matter.
- **State:** the current state decides which actions are allowed, and refuses the rest.
- **Command:** turn each action into an object so it can be stored, undone and redone.

The code beside each toy is what is really running.`,

  mount(root, api) {
    const ui = api.ui, h = api.h;
    const log = ui.log(50);
    const money = n => '£' + n.toFixed(2);
    const btnRow = list => ui.row(list);
    const toys = [];

    // ================= Strategy =================
    toys.push(['strategy', '🚚 Strategy', (function () {
      const STR = {
        standard: { label: 'Standard', src: 'const standard = basket => 3.99;', fn: b => 3.99 },
        express: { label: 'Express', src: 'const express = basket => 7.99;', fn: b => 7.99 },
        free: { label: 'Free over £50', src: 'const freeOver50 = basket =>\n  basket >= 50 ? 0 : 4.99;', fn: b => (b >= 50 ? 0 : 4.99) }
      };
      let basket = 35, key = 'standard'; const seen = {};
      const out = h('div.lab-big'), codeHost = h('div');
      const seg = ui.seg(Object.keys(STR).map(k => [k, STR[k].label]), key, v => { key = v; log.add('Swapped the strategy to **' + STR[v].label + '**. The checkout code did not change, only the function we hand it.', 'info'); render(); });
      const slider = ui.slider('Basket value', { min: 10, max: 100, step: 5, value: basket, fmt: v => '£' + v }, v => { basket = v; render(); });
      function render() {
        const fee = STR[key].fn(basket);
        out.textContent = money(basket) + ' + ' + (fee ? money(fee) : 'free') + ' delivery = ' + money(basket + fee);
        const set = seen[basket] = seen[basket] || {}; set[fee] = true;
        KS.clear(codeHost);
        codeHost.appendChild(ui.code('function checkout(basket, deliveryStrategy) {\n  return basket + deliveryStrategy(basket);\n}\n\n' + STR[key].src + '\n\ncheckout(' + basket + ', ' + (key === 'free' ? 'freeOver50' : key) + ');', 'js'));
        if (Object.keys(set).length >= 3) api.goal('strategy');
      }
      render();
      return h('div.lab-stack', ui.panel('Pick a delivery strategy', seg, slider, h('div', { style: { marginTop: '10px' } }, out),
        h('p.muted.small', 'Try all three strategies on the same basket value.')), codeHost);
    })()]);

    // ================= Observer =================
    toys.push(['observer', '🔔 Observer', (function () {
      function Subject() { const fns = []; return { subscribe(f) { fns.push(f); return () => { const i = fns.indexOf(f); if (i >= 0) fns.splice(i, 1); }; }, notify(v) { fns.slice().forEach(f => f(v)); }, count: () => fns.length }; }
      const subject = Subject(); let price = 20;
      const outs = { email: 'no mail yet', dash: 'not showing', audit: [] };
      const unsub = {}; let notifiedTwo = false, unsubbed = false;
      const priceEl = h('div.lab-big', money(price));
      const cards = {};
      const DEFS = [['email', '📧 Email alert'], ['dash', '📊 Dashboard'], ['audit', '📜 Audit log']];
      const handlers = {
        email: p => { outs.email = '"Price changed ' + money(p.old) + ' to ' + money(p.now) + '"'; },
        dash: p => { outs.dash = 'showing ' + money(p.now); },
        audit: p => { outs.audit.push(money(p.old) + ' → ' + money(p.now)); if (outs.audit.length > 3) outs.audit.shift(); }
      };
      const togs = DEFS.map(d => {
        cards[d[0]] = h('div.lab-note', { style: { opacity: '0.5' } });
        return ui.toggle(d[1], false, v => {
          if (v) { unsub[d[0]] = subject.subscribe(handlers[d[0]]); log.add(d[1] + ' **subscribed**. The price now keeps a list of listeners: ' + subject.count() + ' so far.', 'info'); }
          else { if (unsub[d[0]]) unsub[d[0]](); unsub[d[0]] = null; if (notifiedTwo) unsubbed = true; log.add(d[1] + ' **unsubscribed**. It will hear nothing more.', 'warn'); }
          render();
        });
      });
      function change(delta) {
        const old = price; price = Math.max(1, price + delta);
        if (price === old) { log.add('The price cannot go below £1.', 'warn'); return; }
        const n = subject.count();
        subject.notify({ old: old, now: price });
        log.add('Price ' + money(old) + ' → **' + money(price) + '**. ' + (n ? 'It called **' + n + '** subscriber' + (n === 1 ? '' : 's') + ' without knowing who they are.' : 'Nobody is subscribed, so nobody was told.'), n ? 'good' : 'dim');
        if (n >= 2) notifiedTwo = true;
        if (unsubbed && n >= 1) api.goal('observer');
        render();
      }
      function render() {
        priceEl.textContent = money(price);
        DEFS.forEach(d => {
          const on = !!unsub[d[0]], o = outs[d[0]];
          cards[d[0]].style.opacity = on ? '1' : '0.5';
          cards[d[0]].textContent = d[1] + ': ' + (d[0] === 'audit' ? (o.length ? o.join(' | ') : 'empty') : o);
        });
      }
      render();
      return h('div.lab-stack', ui.panel('Product price', priceEl, btnRow([ui.btn('Raise by £5', () => change(5), 'primary'), ui.btn('Drop by £5', () => change(-5))])),
        ui.panel('Subscribers (switch on to subscribe)', h('div.lab-stack', togs.map((t, i) => h('div.lab-stack', t, cards[DEFS[i][0]])))),
        ui.code('const price = new Subject();\nconst stop = price.subscribe(sendEmail);\n\nprice.notify(25);  // every subscriber is called\nstop();            // unsubscribe', 'js'));
    })()]);

    // ================= Decorator =================
    toys.push(['decorator', '☕ Decorator', (function () {
      const DEC = {
        milk: { name: 'Milk', cost: c => c + 0.5, desc: d => d + ' + milk' },
        syrup: { name: 'Syrup', cost: c => c + 0.7, desc: d => d + ' + syrup' },
        cream: { name: 'Cream', cost: c => c + 0.6, desc: d => d + ' + cream' },
        large: { name: 'Large', cost: c => c * 1.5, desc: d => '(' + d + ') made large' }
      };
      const chain = [];
      const outDesc = h('div.lab-mono'), outPrice = h('div.lab-big'), outCode = h('div.lab-mono');
      function layers(list) {
        let cost = 2, desc = 'coffee', expr = 'new Coffee()';
        list.forEach(k => { cost = DEC[k].cost(cost); desc = DEC[k].desc(desc); expr = 'new ' + DEC[k].name + '(' + expr + ')'; });
        return { cost: cost, desc: desc, expr: expr };
      }
      function add(k) {
        if (chain.length >= 6) { log.add('That coffee already has six wrappers. Clear it to start again.', 'warn'); return; }
        const before = layers(chain).cost; chain.push(k);
        log.add('Wrapped in **' + DEC[k].name + '**: price ' + money(before) + ' → ' + money(layers(chain).cost) + '. Each wrapper asks the one inside, then adds its own bit.', 'info');
        render();
      }
      function render() {
        const r = layers(chain);
        outDesc.textContent = r.desc; outPrice.textContent = money(r.cost); outCode.textContent = r.expr;
        if (chain.length >= 3) api.goal('decorator');
      }
      render();
      return h('div.lab-stack', ui.panel('Build a coffee (£2.00 base)',
        btnRow(Object.keys(DEC).map(k => ui.btn('+ ' + DEC[k].name, () => add(k), 'primary'))),
        btnRow([ui.btn('Remove last', () => { if (chain.length) { chain.pop(); log.add('Peeled off the outer wrapper.', 'info'); render(); } }, 'ghost'), ui.btn('Clear', () => { chain.length = 0; render(); }, 'ghost')]),
        h('div', { style: { marginTop: '10px' } }, outPrice, outDesc, h('p.muted.small', 'Try Large before and after Milk: the order changes the price.'))),
        ui.panel('The object being built', outCode),
        ui.code('class Milk {\n  constructor(inner) { this.inner = inner; }\n  cost() { return this.inner.cost() + 0.5; }\n  describe() { return this.inner.describe() + " + milk"; }\n}', 'js'));
    })()]);

    // ================= State =================
    toys.push(['state', '📦 State', (function () {
      const no = m => ({ refuse: m });
      const T = {
        new: { pay: 'paid', cancel: 'cancelled', ship: no('Cannot ship: nobody has paid yet.'), deliver: no('Cannot deliver: nothing has shipped.') },
        paid: { pay: no('Already paid. No double charging!'), ship: 'shipped', cancel: 'cancelled', deliver: no('Cannot deliver: it has not shipped yet.') },
        shipped: { pay: no('Already paid.'), ship: no('Already on its way.'), cancel: no('Too late to cancel: it is on the van.'), deliver: 'delivered' },
        delivered: { pay: no('The order is finished.'), ship: no('The order is finished.'), cancel: no('Delivered orders cannot be cancelled (that would be a return).'), deliver: no('Already delivered.') },
        cancelled: { pay: no('The order was cancelled.'), ship: no('The order was cancelled.'), cancel: no('Already cancelled.'), deliver: no('The order was cancelled.') }
      };
      const FLOW = ['new', 'paid', 'shipped', 'delivered'];
      let st = 'new', refused = 0;
      const chips = h('div.lab-row');
      function act(a) {
        const r = T[st][a];
        if (typeof r === 'string') { log.add('**' + a + '** while ' + st + ' → allowed. The order moves to **' + r + '**.', 'good'); st = r; }
        else { refused++; log.add('**' + a + '** while ' + st + ' → **refused** ✗ ' + r.refuse + ' (the current state decides, not a pile of if statements).', 'bad'); }
        render();
        if (st === 'delivered' && refused > 0) api.goal('state');
      }
      function render() {
        KS.clear(chips);
        FLOW.forEach((s, i) => { chips.appendChild(h('span.lab-chip' + (s === st ? '.tn-accent' : ''), (i ? '→ ' : '') + s)); });
        if (st === 'cancelled') chips.appendChild(h('span.lab-chip.tn-bad', 'cancelled'));
      }
      render();
      return h('div.lab-stack', ui.panel('An order', chips, h('div', { style: { marginTop: '10px' } }, btnRow([ui.btn('Pay', () => act('pay'), 'primary'), ui.btn('Ship', () => act('ship'), 'primary'), ui.btn('Deliver', () => act('deliver'), 'primary'), ui.btn('Cancel', () => act('cancel'), 'danger'), ui.btn('↺ New order', () => { st = 'new'; log.add('A fresh order starts in the **new** state.', 'info'); render(); }, 'ghost')])),
        h('p.muted.small', 'Press buttons in the wrong order on purpose.')),
        ui.code('class Shipped {\n  pay()     { throw "Already paid"; }\n  cancel()  { throw "Too late"; }\n  deliver() { order.setState(new Delivered()); }\n}', 'js'));
    })()]);

    // ================= Command =================
    toys.push(['command', '↩️ Command', (function () {
      let doc = '', peak = 0; const undo = [], redo = [];
      const docEl = h('div.lab-mono', { style: { minHeight: '2.4em', padding: '8px', background: 'var(--panel-2)', borderRadius: '10px', border: '1px solid var(--line)' } });
      const undoEl = h('div.lab-cells'), redoEl = h('div.lab-cells');
      const lastWord = d => d.replace(/\s*\S+\s*$/, '');
      const CMDS = [
        ['Type "Hello"', d => d + 'Hello', null], ['Type " world"', d => d + ' world', null], ['Type "!"', d => d + '!', null],
        ['UPPERCASE', d => d.toUpperCase(), d => !d ? 'There is no text to shout yet.' : null],
        ['Delete last word', lastWord, d => !d ? 'There is nothing to delete.' : null]
      ];
      function run(c) {
        const why = c[2] && c[2](doc);
        if (why) { log.add(why, 'warn'); return; }
        const cmd = { label: c[0], run: c[1], prev: doc };
        doc = cmd.run(doc); undo.push(cmd); redo.length = 0;
        peak = Math.max(peak, undo.length);
        log.add('Did **' + cmd.label + '** and put it on the undo stack (' + undo.length + ' deep). It remembers what the text was before.', 'info');
        render();
      }
      function doUndo() {
        const cmd = undo.pop(); if (!cmd) { log.add('The undo stack is empty: nothing to undo.', 'warn'); return; }
        doc = cmd.prev; redo.push(cmd);
        log.add('Undid **' + cmd.label + '**: the text goes back to what the command remembered.', 'good');
        render();
        if (!undo.length) { if (peak >= 3) api.goal('command'); peak = 0; }
      }
      function doRedo() {
        const cmd = redo.pop(); if (!cmd) { log.add('Nothing to redo.', 'warn'); return; }
        cmd.prev = doc; doc = cmd.run(doc); undo.push(cmd); peak = Math.max(peak, undo.length);
        log.add('Redid **' + cmd.label + '**.', 'info'); render();
      }
      function cells(host, list, cls) { KS.clear(host); if (!list.length) host.appendChild(h('span.muted.small', '(empty)')); list.forEach(c => host.appendChild(h('div.lab-cell' + cls, c.label))); }
      function render() { docEl.textContent = doc || '(empty document)'; cells(undoEl, undo, '.good'); cells(redoEl, redo.slice().reverse(), '.dim'); }
      render();
      return h('div.lab-stack', ui.panel('A tiny editor', docEl, h('div', { style: { marginTop: '10px' } }, btnRow(CMDS.map(c => ui.btn(c[0], () => run(c), 'sm')))),
        h('div', { style: { marginTop: '10px' } }, btnRow([ui.btn('↶ Undo', doUndo, 'primary'), ui.btn('↷ Redo', doRedo)]))),
        h('div.lab-grid2.even', ui.panel('Undo stack (newest last)', undoEl), ui.panel('Redo stack', redoEl)),
        ui.code('class Uppercase {\n  execute(doc) { this.prev = doc.text; doc.text = doc.text.toUpperCase(); }\n  undo(doc)    { doc.text = this.prev; }\n}\nundoStack.push(cmd);  // every action is an object', 'js'));
    })()]);

    // ================= layout =================
    const panels = {};
    const seg = ui.seg(toys.map(t => [t[0], t[1]]), toys[0][0], v => { Object.keys(panels).forEach(k => { panels[k].style.display = k === v ? '' : 'none'; }); });
    root.appendChild(seg);
    toys.forEach((t, i) => { panels[t[0]] = h('div', { style: { display: i ? 'none' : '' } }, t[2]); root.appendChild(panels[t[0]]); });
    root.appendChild(ui.panel('What just happened', log.el));
    log.add('Pick a tab and play. Start with **Strategy**: switch between the three delivery options.', 'info');
  }
});
