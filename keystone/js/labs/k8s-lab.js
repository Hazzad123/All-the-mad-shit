/* Lab: k8s-lab — declare the state you want; a control loop keeps making it true (scheduling, self-healing, rolling updates). */
KS.labs.register({
  id: 'k8s-lab',
  title: 'Kubernetes Lab',
  emoji: '☸️',
  blurb: 'You say what you want, not how to get it. A control loop compares wanted with actual once a second and fixes the difference.',
  tags: ['kubernetes', 'orchestration', 'deployment', 'rolling update', 'containers'],
  goals: [
    { id: 'scale', text: '**Scale** to five replicas and wait until five pods are ready' },
    { id: 'heal', text: '**Kill a pod** (tap it) and watch the cluster heal itself' },
    { id: 'node', text: '**Kill a node** and see its pods rescheduled elsewhere' },
    { id: 'update', text: 'Roll out a new image (v2) with **no downtime**' },
    { id: 'rollback', text: 'Deploy the **broken** image, then **roll back**' }
  ],
  help: `A **pod** is one running copy of your app (the small boxes). **Nodes** are the machines; each has room for four pods.

You never start pods by hand. You set the **desired state**: "I want 3 replicas of image v1". A **controller** runs a loop every second: it counts what is actually running, compares it with what you asked for and acts. Too few? It starts pods. Too many? It stops some. A pod or node dies? Same loop, same fix. The **scheduler** decides which node a new pod goes on; if no node has room the pod stays **Pending**.

Changing the image triggers a **rolling update**: start one extra pod, wait until it is ready, retire an old one, repeat, never dropping below replicas − 1 ready pods. A broken image crash-loops and the rollout stalls while the old pods keep serving. **Roll back** to fix it. Traffic is sized so that replicas − 1 ready pods can carry it all.`,

  mount(root, api) {
    const ui = api.ui, h = api.h;

    // ---- model (pure, no DOM; driven by tick(st, say)) ----
    const CAP = 4;
    const BAD = { 'v3-bug': true };
    function newState() {
      const st = { seq: 0, tickNo: 0, desired: { replicas: 3, image: 'v1' }, stable: 'v1', pods: [], nodes: [], rolling: false, rollFrom: 'v1', rollWorst: 1, sawBroken: false, healWatch: false, nodeWatch: false };
      for (let i = 1; i <= 3; i++) st.nodes.push({ id: 'node-' + i, up: true });
      for (let i = 0; i < 3; i++) { const p = mkPod(st, 'v1'); p.status = 'Ready'; p.node = 'node-' + (i + 1); }
      return st;
    }
    function mkPod(st, image) { const p = { id: 'web-' + (++st.seq), image: image, node: null, status: 'Pending', t: 0, restarts: 0, ttl: 0, warned: false }; st.pods.push(p); return p; }
    function actives(st) { return st.pods.filter(p => p.status !== 'Terminating'); }
    function readyCount(st) { return st.pods.filter(p => p.status === 'Ready').length; }
    function servedShare(st) { return Math.min(1, readyCount(st) / Math.max(1, st.desired.replicas - 1)); }
    function nodeUsed(st, id) { return st.pods.filter(p => p.node === id).length; }
    function killPod(st, p) { p.status = 'Terminating'; p.ttl = 1; }
    function killNode(st, n, say) {
      const lost = st.pods.filter(p => p.node === n.id);
      n.up = false; st.pods = st.pods.filter(p => p.node !== n.id);
      if (lost.length) st.nodeWatch = true;
      say('💥 **' + n.id + '** went dark. Pods lost with it: ' + (lost.length ? lost.map(p => p.id).join(', ') : 'none') + '. The controller will notice the shortfall on its next check.', 'bad');
      return lost;
    }
    function setImage(st, img, say) {
      if (img === st.desired.image) return false;
      if (!st.rolling) { st.rolling = true; st.rollFrom = st.desired.image; st.rollWorst = 1; }
      st.desired.image = img;
      say('Desired image changed to **' + img + '**' + (BAD[img] ? ' (this one is broken!)' : '') + '. Nothing happens yet: the controller will see the difference on its next check.', 'info');
      return true;
    }
    function rollback(st, say) {
      if (st.desired.image === st.stable) { say('Nothing to roll back: the wanted image **' + st.stable + '** is already the last good one.', 'warn'); return false; }
      say('↩️ Rolling back: wanted image set to the last good version, **' + st.stable + '**.', 'info');
      return setImage(st, st.stable, function () {});
    }
    function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
    // The controller: compare desired with actual, create or retire pods.
    function reconcile(st, say) {
      const want = st.desired.replicas, target = st.desired.image;
      const act = actives(st);
      const fresh = act.filter(p => p.image === target), old = act.filter(p => p.image !== target);
      if (!old.length) {
        if (fresh.length < want) {
          const n = want - fresh.length;
          for (let i = 0; i < n; i++) mkPod(st, target);
          say('Controller: wanted **' + want + '**, found ' + fresh.length + ' → starting ' + plural(n, 'pod') + '.', 'info');
        } else if (fresh.length > want) {
          const n = fresh.length - want;
          fresh.slice().sort((a, b) => (a.status === 'Ready') - (b.status === 'Ready') || b.t - a.t || (b.id > a.id ? 1 : -1)).slice(0, n).forEach(p => killPod(st, p));
          say('Controller: wanted **' + want + '**, found ' + fresh.length + ' → stopping ' + plural(n, 'pod') + '.', 'info');
        }
        return;
      }
      // rolling update: surge by 1, never fewer than replicas - 1 ready
      const minReady = Math.max(1, want - 1);
      const make = Math.min(want + 1 - act.length, want - fresh.length);
      if (make > 0) { for (let i = 0; i < make; i++) mkPod(st, target); say('Rolling update: starting ' + plural(make, 'new pod') + ' with image **' + target + '**.', 'info'); }
      let r = readyCount(st), killed = 0, blocked = false;
      old.slice().sort((a, b) => (a.status === 'Ready') - (b.status === 'Ready') || (a.id > b.id ? 1 : -1)).forEach(p => {
        if (p.status !== 'Ready') { killPod(st, p); killed++; }
        else if (r - 1 >= minReady) { killPod(st, p); r--; killed++; }
        else blocked = true;
      });
      if (killed) say('Rolling update: retiring ' + plural(killed, 'old pod') + ' (still ' + r + ' ready, minimum is ' + minReady + ').', 'info');
      else if (blocked) say('Rolling update **waiting**: retiring an old pod now would leave fewer than ' + minReady + ' ready. ' + (BAD[target] ? 'The new pods keep crashing, so the rollout is stuck. Roll back!' : 'Waiting for new pods to become ready.'), 'warn');
    }
    // One tick of the whole cluster. Returns nothing; narrates through say(text, tone).
    function tick(st, say) {
      st.tickNo++;
      st.pods = st.pods.filter(p => p.status !== 'Terminating' || --p.ttl > 0);
      st.pods.forEach(p => {
        if (p.status === 'Starting') {
          p.t++;
          if (p.t >= 2) {
            if (BAD[p.image]) { p.status = 'CrashLoop'; p.restarts = 1; st.sawBroken = true; say('💥 ' + p.id + ' (' + p.image + ') crashed on start. It will keep restarting: **CrashLoopBackOff**.', 'bad'); }
            else { p.status = 'Ready'; say(p.id + ' (' + p.image + ') is **Ready** and now receives traffic.', 'good'); }
          }
        } else if (p.status === 'CrashLoop') p.restarts++;
      });
      reconcile(st, say);
      st.pods.filter(p => p.status === 'Pending').forEach(p => {
        const ups = st.nodes.filter(n => n.up && nodeUsed(st, n.id) < CAP).sort((a, b) => nodeUsed(st, a.id) - nodeUsed(st, b.id));
        if (!ups.length) { if (!p.warned) { p.warned = true; say('Scheduler: no node has room for ' + p.id + ', so it stays **Pending** until space appears.', 'warn'); } return; }
        p.node = ups[0].id; p.status = 'Starting'; p.t = 0;
        say('Scheduler: placed ' + p.id + ' on **' + p.node + '** (the least busy node with room).', 'dim');
      });
      return rolloutCheck(st, say);
    }
    // Bookkeeping for rollouts; returns goal ids earned.
    function rolloutCheck(st, say) {
      const out = [], act = actives(st), target = st.desired.image;
      if (st.rolling) {
        st.rollWorst = Math.min(st.rollWorst, servedShare(st));
        const done = !BAD[target] && act.length === st.desired.replicas && act.every(p => p.image === target && p.status === 'Ready');
        if (done) {
          st.rolling = false; st.stable = target;
          if (st.sawBroken) { st.sawBroken = false; out.push('rollback'); say('✅ Rollback complete: every pod is healthy on **' + target + '** again.', 'good'); }
          else {
            say('✅ Rollout complete: every pod runs **' + target + '**. Lowest traffic served during it: **' + Math.round(st.rollWorst * 100) + '%**.', 'good');
            if (st.rollFrom !== target && st.rollWorst >= 1) out.push('update');
            else if (st.rollWorst < 1) say('Traffic dipped during that rollout (you probably killed something). Try again without interfering.', 'warn');
          }
        }
      }
      const ready = readyCount(st), upCap = st.nodes.filter(n => n.up).length * CAP;
      if (st.desired.replicas >= 5 && ready >= 5) out.push('scale');
      if (st.healWatch && ready >= st.desired.replicas && !st.pods.some(p => p.status === 'Terminating') && act.length === st.desired.replicas && !st.rolling) { out.push('heal'); st.healWatch = false; }
      if (st.nodeWatch && ready > 0 && ready >= Math.min(st.desired.replicas, upCap) && !st.pods.some(p => p.status === 'Pending' && upCap >= st.desired.replicas)) out.push('node');
      return out;
    }
    // ---- end model ----

    const st = newState();
    const say = (t, tone) => log.add(t, tone);
    const history = [];                       // served share per tick, newest last

    // ---- UI ----
    const log = ui.log(60);
    const replicasSl = ui.slider('Replicas wanted', { min: 1, max: 10, value: 3, fmt: v => String(v) }, v => {
      if (v === st.desired.replicas) return;
      log.add('You changed **replicas wanted** from ' + st.desired.replicas + ' to **' + v + '**. The controller will notice on its next check.', 'info');
      st.desired.replicas = v; render();
    });
    const imageSeg = ui.seg([['v1', 'v1'], ['v2', 'v2'], ['v3-bug', 'v3 (broken)']], 'v1', v => { setImage(st, v, say); render(); });
    const statWant = ui.stat('wanted', 3), statReady = ui.stat('ready', 3, 'good'), statPending = ui.stat('pending / starting', 0);
    const meter = ui.meter('Requests served');
    const strip = h('div.lab-cells', { style: { marginTop: '8px' } });
    const nodeBoxes = st.nodes.map(n => ({ n: n, title: h('div', { style: { fontWeight: '800' } }), pods: h('div.lab-cells', { style: { minHeight: '46px' } }), btn: ui.btn('', () => toggleNode(n), 'sm') }));
    const pendingBox = h('div.lab-cells');

    root.appendChild(ui.panel('1 · Say what you want (desired state)',
      ui.row(replicasSl), h('div', { style: { margin: '8px 0 4px', fontWeight: '700', fontSize: '.86rem' } }, 'Image version'),
      ui.row(imageSeg, ui.btn('↩️ Roll back', () => { rollback(st, say); imageSeg.set(st.desired.image); render(); }), ui.btn('💥 Kill a pod', killRandom)),
      h('p.muted.small', 'Pod key: ✅ ready · ⏳ starting · 💥 crash-looping · 🕒 pending (no room) · 🗑️ stopping. Tap any pod to kill it.')));
    root.appendChild(ui.panel('2 · The cluster (actual state)',
      h('div.lab-grid3', nodeBoxes.map(b => ui.panel(null, b.title, b.pods, h('div', { style: { marginTop: '8px' } }, b.btn)))),
      h('div', { style: { marginTop: '10px' } }, h('b.small', 'Pending (not on any node)'), pendingBox)));
    root.appendChild(h('div.lab-grid2',
      ui.panel('Traffic', meter.el, h('div.muted.small', { style: { marginTop: '6px' } }, 'Last 30 seconds (green = all served, red = outage)'), strip, h('div', { style: { marginTop: '10px' } }, ui.stats(statWant, statReady, statPending))),
      ui.panel('What the controller is doing', log.el)));

    // ---- behaviour ----
    function podLabel(p) {
      if (p.status === 'Ready') return '✅ ' + p.image;
      if (p.status === 'Starting') return '⏳ ' + p.image;
      if (p.status === 'CrashLoop') return '💥 ' + p.image + ' ×' + p.restarts;
      if (p.status === 'Pending') return '🕒 ' + p.image;
      return '🗑️';
    }
    function podCell(p) {
      const cls = p.status === 'Ready' ? '.good' : p.status === 'CrashLoop' ? '.bad' : p.status === 'Starting' ? '.hl' : '.dim';
      return h('button.lab-cell' + cls, { type: 'button', title: p.id, 'aria-label': p.id + ' ' + p.status, style: { minHeight: '42px', minWidth: '64px', color: 'var(--text)', cursor: 'pointer' }, onclick: () => killUser(p) }, podLabel(p));
    }
    function killUser(p) {
      if (p.status === 'Terminating' || st.pods.indexOf(p) < 0) return;
      const wasReady = p.status === 'Ready' && readyCount(st) >= st.desired.replicas;
      killPod(st, p);
      if (wasReady) st.healWatch = true;
      log.add('You killed **' + p.id + '**. The controller does not care who did it: on its next check it will see fewer pods than wanted.', 'bad');
      render();
    }
    function killRandom() {
      const c = st.pods.filter(p => p.status === 'Ready');
      if (!c.length) { log.add('There is no ready pod to kill.', 'warn'); return; }
      killUser(c[Math.floor(Math.random() * c.length)]);
    }
    function toggleNode(n) {
      if (n.up) killNode(st, n, say);
      else { n.up = true; log.add('**' + n.id + '** is back, empty. The scheduler can use it again.', 'good'); }
      render();
    }
    function render() {
      const act = actives(st), ready = readyCount(st), share = servedShare(st);
      nodeBoxes.forEach(b => {
        const used = nodeUsed(st, b.n.id);
        b.title.textContent = (b.n.up ? '🖥️ ' : '💀 ') + b.n.id + (b.n.up ? '  ' + used + '/' + CAP : '  (down)');
        b.pods.textContent = '';
        st.pods.filter(p => p.node === b.n.id).forEach(p => b.pods.appendChild(podCell(p)));
        b.btn.textContent = b.n.up ? '⚡ Kill node' : '♻️ Bring back';
      });
      pendingBox.textContent = '';
      const pend = st.pods.filter(p => p.status === 'Pending');
      pend.forEach(p => pendingBox.appendChild(podCell(p)));
      if (!pend.length) pendingBox.appendChild(h('span.muted.small', 'none'));
      statWant.set(st.desired.replicas); statReady.set(ready, ready >= st.desired.replicas ? 'good' : 'warn'); statPending.set(act.length - ready);
      meter.set(share, Math.round(share * 100) + '%', share >= 1 ? 'good' : share > 0 ? 'warn' : 'bad');
      strip.textContent = '';
      history.forEach(v => strip.appendChild(h('span.lab-cell' + (v >= 1 ? '.good' : v > 0 ? '' : '.bad'), { style: { minWidth: '9px', padding: '8px 0', borderColor: v > 0 && v < 1 ? 'var(--warn)' : '' } })));
    }
    api.every(1000, () => {
      const earned = tick(st, say);
      history.push(servedShare(st)); if (history.length > 30) history.shift();
      earned.forEach(g => api.goal(g));
      render();
    });
    log.add('Three pods of **v1** are running. Change the wanted replicas or image and watch the controller catch up. It checks once a second.', 'info');
    render();
  }
});
