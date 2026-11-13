/* Lab: saga-lab — you cannot roll back across services, so you undo with compensating actions. */
(function () {
  // ---------- pure model (also exposed as `logic` so it can be tested in Node) ----------
  const STEPS = [
    { key: 'order', name: 'Order', icon: '🧾', doText: 'order created', undoText: 'order cancelled' },
    { key: 'payment', name: 'Payment', icon: '💳', doText: '£20 charged', undoText: '£20 refunded' },
    { key: 'inventory', name: 'Inventory', icon: '📦', doText: 'stock reserved', undoText: 'stock released' },
    { key: 'shipping', name: 'Shipping', icon: '🚚', doText: 'courier booked', undoText: 'shipment cancelled' }
  ];
  const PRICE = 20;

  /** Which events happen when an order runs. fail = [bool x4]; saga = compensate on failure. */
  function plan(fail, saga) {
    const evs = []; let completed = true;
    for (let i = 0; i < STEPS.length; i++) {
      if (fail[i]) {
        evs.push({ type: 'fail', i }); completed = false;
        if (saga) for (let j = i - 1; j >= 0; j--) evs.push({ type: 'undo', i: j });
        break;
      }
      evs.push({ type: 'do', i });
    }
    return { events: evs, completed };
  }
  /** Apply one event to the effects map { order, payment, inventory, shipping } (true = the side effect exists). */
  function apply(effects, ev) {
    if (ev.type === 'do') effects[STEPS[ev.i].key] = true;
    if (ev.type === 'undo') effects[STEPS[ev.i].key] = false;
    return effects;
  }
  /** One payment attempt. ledger maps orderId -> number of charges; seen is the set of idempotency keys. */
  function charge(ledger, seen, orderId, useKey) {
    const key = 'order-' + orderId;
    if (useKey && seen[key]) return { charged: false, duplicate: true };
    if (useKey) seen[key] = true;
    ledger[orderId] = (ledger[orderId] || 0) + 1;
    return { charged: true, duplicate: false };
  }
  const logic = { STEPS, plan, apply, charge };

  KS.labs.register({
    logic,
    id: 'saga-lab',
    title: 'Saga Lab',
    emoji: '🧾',
    blurb: 'Four services, no shared database. When step three fails, who gives the customer their money back?',
    tags: ['saga', 'microservices', 'distributed transactions', 'idempotency', 'compensation'],
    goals: [
      { id: 'happy', text: 'Place an order and watch **all four steps** succeed' },
      { id: 'mess', text: 'Make Inventory fail **without** a saga and leave the customer charged for nothing' },
      { id: 'compensate', text: 'Make Inventory fail **with** the saga and watch the refund happen' },
      { id: 'idem', text: 'Retry a timed-out payment with an **idempotency key** and charge only once' }
    ],
    help: `An order passes through four separate services, each with its own database: **Order**, **Payment**, **Inventory** and **Shipping**. There is no single "undo" button that can reach into all of them, the way a normal database transaction can.

- **No saga:** if a later step fails, the earlier steps simply stay done. The customer has paid for something that will never arrive.
- **Saga:** every step comes with a **compensating action** (refund, release stock, cancel). On failure the finished steps are undone in **reverse order**, shown as red arrows going backwards.

The **timeout and retry** button shows another trap: the payment worked but the reply got lost, so the client asks again. Without an **idempotency key** (a unique label for "this one payment") the customer is charged twice. With it, the service recognises the repeat and does nothing new.

Switch the failure toggles on to choose which service breaks.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      const fail = [false, false, false, false];
      let saga = false, useKey = false, busy = false, orderNo = 0, balance = 100;
      const effects = { order: false, payment: false, inventory: false, shipping: false };
      const ledger = {}, seen = {};

      // ---------- UI ----------
      const stage = ui.stage();
      const nodes = STEPS.map(s => { const n = ui.node(s.name, s.icon); n.setState('idle'); n.setSub('waiting'); return n; });
      stage.el.appendChild(ui.cols.apply(null, nodes.map(n => [n])));
      for (let i = 0; i < nodes.length - 1; i++) stage.wire(nodes[i], nodes[i + 1], { dashed: true });

      const log = ui.log(50);
      const statBal = ui.stat('customer balance', '£' + balance, 'good');
      const statOrders = ui.stat('orders', 0);
      const statCharges = ui.stat('charges on last retry', '–');
      const verdict = h('div');
      const placeBtn = ui.btn('🛒 Place order', () => placeOrder(), 'primary');
      const retryBtn = ui.btn('⏱ Payment times out, retry', () => retryPayment());
      const resetBtn = ui.btn('Reset', () => reset(), 'ghost');

      root.appendChild(ui.panel('Controls',
        ui.row(ui.seg([['no', 'No saga'], ['saga', 'Saga (compensate)']], 'no', v => { saga = v === 'saga'; log.add('Mode: **' + (saga ? 'saga, failures are undone' : 'no saga, nothing is undone') + '**', 'info'); })),
        h('p.muted.small', 'Choose which services should fail:'),
        ui.row(STEPS.map((s, i) => ui.toggle(s.name + ' fails', false, v => { fail[i] = v; }))),
        ui.row(placeBtn, retryBtn, ui.toggle('Idempotency key', false, v => { useKey = v; }), resetBtn)));
      root.appendChild(stage.el);
      root.appendChild(verdict);
      root.appendChild(h('div.lab-grid2', ui.panel('What just happened', log.el), ui.panel('The customer', ui.stats(statBal, statOrders, statCharges))));

      // ---------- helpers ----------
      function setBusy(b) { busy = b; [placeBtn, retryBtn, resetBtn].forEach(x => { x.disabled = b; }); }
      function showBalance() { statBal.set('£' + balance, balance < 100 ? 'warn' : 'good'); }
      function say(text, tone) { verdict.className = ''; KS.clear(verdict); verdict.appendChild(ui.note(text, tone)); }
      function resetNodes() { nodes.forEach(n => { n.setState('idle'); n.setSub('waiting'); }); }
      function reset() {
        if (busy) return;
        STEPS.forEach(s => { effects[s.key] = false; });
        balance = 100; showBalance(); resetNodes(); KS.clear(verdict); statCharges.set('–');
        log.add('Everything reset. Balance back to £100.', 'dim');
      }

      // ---------- place an order ----------
      async function placeOrder() {
        if (busy) return;
        setBusy(true); KS.clear(verdict);
        orderNo++; statOrders.set(orderNo);
        STEPS.forEach(s => { effects[s.key] = false; });
        resetNodes();
        const p = plan(fail.slice(), saga);
        log.add('**Order #' + orderNo + '** starts (' + (saga ? 'saga' : 'no saga') + ').', 'info');
        let prev = -1;
        for (const ev of p.events) {
          const s = STEPS[ev.i], n = nodes[ev.i];
          if (ev.type === 'do' || ev.type === 'fail') {
            if (prev >= 0 && prev < ev.i) { await stage.send(nodes[prev], n, { label: 'go', ms: 380 }); if (!api.alive()) return; }
            n.setState('busy'); n.setSub('working…');
            await api.sleep(350); if (!api.alive()) return;
            if (ev.type === 'do') {
              apply(effects, ev); if (ev.i === 1) { balance -= PRICE; showBalance(); }
              n.setState('ok'); n.setSub('✓ ' + s.doText); n.pulse('good');
              log.add(s.name + ': **' + s.doText + '** ✓', 'good');
            } else {
              n.setState('down'); n.setSub('✗ failed'); n.pulse('bad');
              log.add(s.name + ' **failed** ✗' + (saga ? ' (the saga now undoes the earlier steps)' : ' (and nothing tells the earlier services)'), 'bad');
            }
            prev = ev.i;
          } else {
            await stage.send(nodes[Math.min(ev.i + 1, STEPS.length - 1)], n, { label: 'undo', tone: 'bad', ms: 380 }); if (!api.alive()) return;
            apply(effects, ev); if (ev.i === 1) { balance += PRICE; showBalance(); }
            n.setState('warn'); n.setSub('↩ ' + s.undoText); n.pulse('bad');
            log.add(s.name + ': compensating action, **' + s.undoText + '** ↩', 'warn');
            await api.sleep(250); if (!api.alive()) return;
          }
        }
        finishOrder(p);
        setBusy(false);
      }
      function finishOrder(p) {
        if (p.completed) { say('**Success.** Order, payment, stock and courier are all in place.', 'good'); api.goal('happy'); return; }
        if (effects.payment) {
          say('**Mess.** The customer was charged £' + PRICE + ' but the order can never be fulfilled. Nothing undid the earlier steps' + (effects.order ? ' (the order record is stuck half-finished too).' : '.'), 'bad');
          if (!saga && fail[2]) api.goal('mess');
        } else if (saga) {
          say('**Clean failure.** The saga ran the compensating actions in reverse, so the customer is back where they started.', 'good');
          if (fail[2]) api.goal('compensate');
        } else {
          say('The order failed before any money moved, so there is nothing to clean up.', 'warn');
        }
      }

      // ---------- payment retry ----------
      async function retryPayment() {
        if (busy) return;
        setBusy(true); KS.clear(verdict);
        orderNo++; statOrders.set(orderNo); const id = orderNo;
        resetNodes();
        const from = nodes[0], pay = nodes[1], key = useKey;
        log.add('**Order #' + id + '**: the client asks Payment to charge £' + PRICE + (key ? ' with idempotency key **order-' + id + '**' : ' (no idempotency key)') + '.', 'info');
        await stage.send(from, pay, { label: 'charge', ms: 380 }); if (!api.alive()) return;
        const r1 = charge(ledger, seen, id, key);
        balance -= PRICE; showBalance(); pay.setState('ok'); pay.setSub('✓ charged'); pay.pulse('good');
        log.add('Payment: charged £' + PRICE + ' ✓ ... but the reply is **lost on the way back** ⏱', 'warn');
        stage.send(pay, from, { label: '???', tone: 'bad', ms: 300 });
        await api.sleep(900); if (!api.alive()) return;
        log.add('The client hears nothing, gives up waiting and **retries** the same payment.', 'warn');
        await stage.send(from, pay, { label: 'retry', ms: 380 }); if (!api.alive()) return;
        const r2 = charge(ledger, seen, id, key);
        if (r2.charged) {
          balance -= PRICE; showBalance(); pay.setSub('✗ charged twice'); pay.setState('down'); pay.pulse('bad');
          log.add('Payment: has no way to know this is a repeat, so it **charges again**. Customer paid £' + (PRICE * ledger[id]) + ' ✗', 'bad');
        } else {
          pay.setSub('✓ repeat ignored'); pay.pulse('good');
          log.add('Payment: key **order-' + id + '** already used, so it does **nothing new** and returns the same receipt ✓', 'good');
        }
        stage.send(pay, from, { label: 'ok', tone: 'good', ms: 300 });
        statCharges.set(ledger[id], ledger[id] > 1 ? 'bad' : 'good');
        if (ledger[id] > 1) say('**Double charge.** A retry is only safe if the receiver can recognise it as a repeat. Switch on the idempotency key and try again.', 'bad');
        else say('**Charged once.** The idempotency key made the retry harmless.', 'good');
        if (key && r1.charged && ledger[id] === 1) api.goal('idem');
        await api.sleep(300); if (!api.alive()) return;
        setBusy(false);
      }

      return () => stage.destroy();
    }
  });
})();
