/* Lab: cicd-pipeline — a pipeline is a row of nets: cheap fast checks first, and a missing net lets bugs through. */
KS.labs.register({
  id: 'cicd-pipeline',
  title: 'CI/CD Pipeline Builder',
  emoji: '🏭',
  blurb: 'Build a pipeline from checks, push commits carrying different bugs and see which stage catches each one, and how long you wait to find out.',
  tags: ['ci/cd', 'pipeline', 'testing', 'deployment', 'devops'],
  goals: [
    { id: 'green', text: 'Take a **clean commit** all the way to production' },
    { id: 'catch', text: 'Catch a **logic bug** before it reaches production' },
    { id: 'fast', text: 'Order the stages so a **style error** fails in under a minute' },
    { id: 'vuln', text: 'Catch a **vulnerable dependency**' },
    { id: 'escape', text: 'Let a bug **escape** to production by removing a stage, then fix the pipeline and catch it' }
  ],
  help: `A **CI/CD pipeline** runs automatically every time someone pushes code. Each **stage** is a check or a step: lint (style), unit tests, build, integration tests, security scan, deploying to a practice copy (staging), end-to-end tests that click through the app, and finally deploying to production.

Think of the stages as **nets**. A bug is caught by the first stage able to see it, and the run stops there: the later stages never run. So cheap, fast nets belong first, because they give feedback in seconds instead of minutes. Slow, expensive nets go last.

But a bug that no stage can see goes straight to customers. Some stages need others first (you cannot deploy before you build). Use the arrows to reorder, ✕ to remove and the **Add** buttons to bring stages back. The time shown is simulated.`,

  mount(root, api) {
    const ui = api.ui, h = api.h;

    // ---- model (pure, no DOM) ----
    const STAGES = {
      lint: { name: 'Lint', icon: '🧹', secs: 15, needs: [], what: 'checks code style' },
      unit: { name: 'Unit tests', icon: '🧪', secs: 90, needs: [], what: 'tests single functions in isolation' },
      build: { name: 'Build', icon: '📦', secs: 120, needs: [], what: 'compiles the app into a package' },
      integration: { name: 'Integration tests', icon: '🔗', secs: 240, needs: ['build'], what: 'checks services work together' },
      security: { name: 'Security scan', icon: '🛡️', secs: 60, needs: [], what: 'looks for known holes in libraries' },
      staging: { name: 'Deploy to staging', icon: '🎭', secs: 90, needs: ['build'], what: 'installs on a practice copy of production' },
      e2e: { name: 'End-to-end tests', icon: '🖱️', secs: 420, needs: ['staging'], what: 'clicks through the app like a user' },
      prod: { name: 'Deploy to production', icon: '🚀', secs: 60, needs: ['build'], what: 'ships to real customers' }
    };
    const ALL = ['lint', 'unit', 'build', 'integration', 'security', 'staging', 'e2e', 'prod'];
    const DEFECTS = {
      none: { label: 'Clean commit (no bug)', short: 'nothing wrong', catchers: [] },
      style: { label: 'Style error', short: 'a style error', catchers: ['lint'] },
      logic: { label: 'Logic bug', short: 'a logic bug', catchers: ['unit', 'integration', 'e2e'] },
      contract: { label: 'Broken contract between services', short: 'a broken contract between services', catchers: ['integration', 'e2e'] },
      vuln: { label: 'Vulnerable dependency', short: 'a vulnerable dependency', catchers: ['security'] },
      flow: { label: 'Broken user flow', short: 'a broken user flow', catchers: ['e2e'] },
      prodconfig: { label: 'Wrong production config', short: 'a wrong production setting', catchers: [] }
    };
    function fmtT(s) { s = Math.round(s); return s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + (s % 60 < 10 ? '0' : '') + (s % 60) + 's'; }
    // Run the pipeline once. Pure: returns every step plus the outcome.
    function run(order, defect) {
      const steps = [], done = {}; let t = 0, shipped = false, outcome = null, feedback = 0, failedAt = null, late = false;
      const catchers = (DEFECTS[defect] || DEFECTS.none).catchers;
      for (let i = 0; i < order.length && !outcome; i++) {
        const id = order[i], S = STAGES[id];
        const missing = S.needs.filter(n => !done[n]);
        if (missing.length) { t += 5; steps.push({ id: id, status: 'fail', secs: 5, why: 'misconfigured', missing: missing }); outcome = 'broken'; failedAt = id; feedback = t; break; }
        t += S.secs;
        if (catchers.indexOf(id) >= 0) { late = shipped; steps.push({ id: id, status: 'fail', secs: S.secs, why: 'caught' }); outcome = shipped ? 'escaped' : 'caught'; failedAt = id; feedback = t; break; }
        steps.push({ id: id, status: 'pass', secs: S.secs }); done[id] = true;
        if (id === 'prod') shipped = true;
      }
      if (!outcome) { outcome = !shipped ? 'undeployed' : (defect === 'none' ? 'green' : 'escaped'); feedback = t; }
      const ran = {}; steps.forEach(s => { ran[s.id] = true; });
      order.forEach(id => { if (!ran[id]) steps.push({ id: id, status: 'skip', secs: 0 }); });
      return { steps: steps, outcome: outcome, failedAt: failedAt, feedback: feedback, late: late, defect: defect };
    }
    // ---- end model ----

    let order = ['build', 'integration', 'unit', 'lint', 'security', 'staging', 'e2e', 'prod'];
    let defect = 'none', running = false, fast = false, runs = 0, escapedDefect = null;
    const runState = {};

    // ---- UI ----
    const log = ui.log(60);
    const listEl = h('div.lab-stack');
    const addEl = h('div.lab-row');
    const clock = ui.stat('pipeline clock', '0s', 'accent'), outStat = ui.stat('last result', '–'), fbStat = ui.stat('time to feedback', '–'), runStat = ui.stat('runs', 0);
    const pushBtn = ui.btn('🚀 Push commit', push, 'primary');
    const defectSel = ui.select('This commit contains…', Object.keys(DEFECTS).map(k => [k, DEFECTS[k].label]), defect, v => { defect = v; });

    root.appendChild(ui.panel('1 · Your pipeline (runs top to bottom)', listEl, h('div.muted.small', { style: { margin: '10px 0 6px' } }, 'Add a stage back:'), addEl,
      h('p.muted.small', 'The pipeline starts in a poor order on purpose. Can you improve it?')));
    root.appendChild(h('div.lab-grid2',
      ui.panel('2 · Push a commit', defectSel, ui.row(ui.toggle('Fast forward', false, v => { fast = v; })), h('div', { style: { marginTop: '10px' } }, pushBtn), h('div', { style: { marginTop: '12px' } }, ui.stats(clock, fbStat, outStat, runStat))),
      ui.panel('What just happened', log.el)));

    // ---- behaviour ----
    function smallBtn(label, fn, disabled, aria) {
      const b = ui.btn(label, fn, 'sm'); b.style.minWidth = '42px'; b.style.minHeight = '40px'; b.setAttribute('aria-label', aria); if (disabled) b.disabled = true; return b;
    }
    function render() {
      listEl.textContent = ''; addEl.textContent = '';
      if (!order.length) listEl.appendChild(h('div.muted', 'The pipeline is empty. Add some stages below.'));
      order.forEach((id, i) => {
        const S = STAGES[id], rs = runState[id];
        const col = rs === 'pass' ? 'var(--good)' : rs === 'fail' ? 'var(--bad)' : rs === 'run' ? 'var(--warn)' : 'var(--line-2)';
        const mark = rs === 'pass' ? '✅' : rs === 'fail' ? '❌' : rs === 'run' ? '⏳' : rs === 'skip' ? '⏭️' : '';
        listEl.appendChild(h('div.lab-row', { style: { border: '2px solid ' + col, borderRadius: '12px', padding: '8px 10px', background: 'var(--panel-2)', opacity: rs === 'skip' ? '.5' : '1', flexWrap: 'wrap' } },
          h('div', { style: { flex: '1 1 150px', minWidth: '0' } },
            h('div', { style: { fontWeight: '800' } }, (i + 1) + '. ' + S.icon + ' ' + S.name + ' ' + mark),
            h('div.muted.small', S.what + ' · ' + fmtT(S.secs))),
          h('div.lab-row', smallBtn('⬆', () => move(i, -1), running || i === 0, 'Move ' + S.name + ' up'), smallBtn('⬇', () => move(i, 1), running || i === order.length - 1, 'Move ' + S.name + ' down'), smallBtn('✕', () => removeStage(id), running, 'Remove ' + S.name))));
      });
      ALL.filter(id => order.indexOf(id) < 0).forEach(id => { const b = ui.btn('+ ' + STAGES[id].name, () => addStage(id), 'sm'); b.style.minHeight = '40px'; if (running) b.disabled = true; addEl.appendChild(b); });
      if (order.length === ALL.length) addEl.appendChild(h('span.muted.small', 'all stages are in the pipeline'));
      pushBtn.disabled = running; pushBtn.textContent = running ? '⏳ Running…' : '🚀 Push commit';
    }
    function move(i, d) {
      if (running || i + d < 0 || i + d >= order.length) return;
      const t = order[i]; order[i] = order[i + d]; order[i + d] = t; clearStates(); render();
    }
    function removeStage(id) {
      if (running) return; order = order.filter(x => x !== id); clearStates(); render();
      log.add('Removed **' + STAGES[id].name + '**. That net is gone: anything it used to catch can now slip through.', 'warn');
    }
    function addStage(id) {
      if (running || order.indexOf(id) >= 0) return; order.push(id); clearStates(); render();
      log.add('Added **' + STAGES[id].name + '** at the end. Use the arrows to move it.', 'info');
    }
    function clearStates() { Object.keys(runState).forEach(k => delete runState[k]); }
    async function push() {
      if (running) return;
      if (!order.length) { log.add('The pipeline is empty: there is nothing to run. Add a stage first.', 'warn'); return; }
      running = true; clearStates(); runs++; runStat.set(runs); outStat.set('…'); fbStat.set('…');
      const d = defect, res = run(order.slice(), d);
      log.add('📤 Commit pushed carrying: **' + DEFECTS[d].label + '**. The pipeline starts.', 'info');
      render();
      let elapsed = 0;
      for (let i = 0; i < res.steps.length; i++) {
        const st = res.steps[i], S = STAGES[st.id];
        if (st.status === 'skip') { runState[st.id] = 'skip'; continue; }
        runState[st.id] = 'run'; render();
        const ms = Math.round((300 + st.secs * 5) / (fast ? 5 : 1));
        for (let c = 1; c <= 4; c++) { await api.sleep(ms / 4); if (!api.alive()) return; clock.set(fmtT(elapsed + st.secs * c / 4)); }
        elapsed += st.secs; runState[st.id] = st.status;
        if (st.status === 'pass') log.add(S.icon + ' ' + S.name + ' passed (' + fmtT(st.secs) + ').', 'dim');
        else if (st.why === 'misconfigured') log.add('❌ **' + S.name + '** cannot run: it needs ' + st.missing.map(m => STAGES[m].name).join(' and ') + ' to run **before** it. Fix the order.', 'bad');
        else log.add('❌ **' + S.name + '** failed: it found ' + DEFECTS[d].short + '.', 'bad');
        render();
      }
      finish(res);
      running = false; render();
    }
    function finish(res) {
      const d = res.defect, fb = fmtT(res.feedback);
      fbStat.set(fb); clock.set(fb);
      const would = DEFECTS[d].catchers.map(id => STAGES[id].name);
      if (res.outcome === 'green') { outStat.set('shipped', 'good'); log.add('🎉 Clean commit reached **production** in ' + fb + '. Everything passed.', 'good'); api.goal('green'); }
      else if (res.outcome === 'caught') {
        outStat.set('caught', 'good');
        log.add('🛑 The line **stopped** at ' + STAGES[res.failedAt].name + ' after ' + fb + ' (your **time to feedback**). The bug never reached customers and the later, slower stages were skipped.', 'good');
        if (d === 'logic') api.goal('catch');
        if (d === 'vuln') api.goal('vuln');
        if (d === 'style' && res.feedback < 60) api.goal('fast');
        else if (d === 'style') log.add('A style error should not take ' + fb + ' to find out. Move the cheap **Lint** stage to the top and try again (goal: under a minute).', 'warn');
        if (escapedDefect === d) { api.goal('escape'); escapedDefect = null; }
      } else if (res.outcome === 'escaped') {
        outStat.set('ESCAPED', 'bad');
        if (res.late) log.add('🚨 Too late: the deploy to production ran **before** ' + STAGES[res.failedAt].name + ' found the bug. Customers already have it.', 'bad');
        else if (would.length) log.add('🚨 **' + DEFECTS[d].short.replace(/^a /, 'A ') + ' reached production** and customers found it. Your pipeline has no stage that can see it. These could have: ' + would.join(', ') + '.', 'bad');
        else log.add('🚨 **' + DEFECTS[d].short.replace(/^a /, 'A ') + ' reached production.** No test stage can see a problem in the real environment\'s own settings. Teams add careful releases (canaries) and monitoring for that. Some bugs only a live system can reveal.', 'bad');
        if (would.length && escapedDefect !== d) { escapedDefect = d; log.add('Now fix the pipeline so it catches this, and push the same bug again.', 'info'); }
      } else if (res.outcome === 'undeployed') { outStat.set('not shipped', 'warn'); log.add('Nothing was deployed: there is no "Deploy to production" stage, so no code ever reaches customers (safe, but useless).', 'warn'); }
      else outStat.set('broken', 'bad');
    }
    log.add('Pick a bug (or none), press **Push commit** and watch the stages run.', 'info');
    render();
  }
});
