/* Lab: mapreduce — split the work, do the pieces in parallel, group by key, combine. */
(function () {
  // ---------- pure model (exposed as `logic` for Node tests) ----------
  const MAX_WORDS = 80;
  function tokenize(text) { return String(text || '').toLowerCase().split(/[^a-z0-9']+/).filter(Boolean).slice(0, MAX_WORDS); }
  /** Cut the word list into n chunks of near-equal size (some may be empty if there are fewer words than chunks). */
  function makeChunks(tokens, n) {
    const size = Math.ceil(tokens.length / n) || 1, out = [];
    for (let i = 0; i < n; i++) out.push(tokens.slice(i * size, (i + 1) * size));
    return out;
  }
  /** Which mapper runs each chunk. A dead mapper's chunks go to the alive ones, round-robin. */
  function assign(nChunks, nMappers, dead) {
    const alive = []; for (let m = 0; m < nMappers; m++) if (!dead[m]) alive.push(m);
    const res = [];
    for (let c = 0; c < nChunks; c++) {
      const pref = c % nMappers;
      res.push(alive.length ? (dead[pref] ? alive[c % alive.length] : pref) : -1);
    }
    return res;
  }
  function hashWord(w) { let x = 5381; for (let i = 0; i < w.length; i++) x = (((x * 33) ^ w.charCodeAt(i)) >>> 0); return x; }
  function reducerFor(w, nR) { return hashWord(w) % nR; }
  /** Run the whole job and keep every phase's data. */
  function runJob(text, nM, nR, dead) {
    const tokens = tokenize(text), chunks = makeChunks(tokens, nM), who = assign(chunks.length, nM, dead);
    const mapOut = []; for (let m = 0; m < nM; m++) mapOut.push([]);   // per mapper: [{chunk, pairs}]
    chunks.forEach((words, c) => { if (who[c] >= 0) mapOut[who[c]].push({ chunk: c, pairs: words.map(w => [w, 1]) }); });
    const groups = []; for (let r = 0; r < nR; r++) groups.push({});      // per reducer: word -> [1,1,..]
    mapOut.forEach(list => list.forEach(job => job.pairs.forEach(p => { const g = groups[reducerFor(p[0], nR)]; (g[p[0]] = g[p[0]] || []).push(p[1]); })));
    const reduced = groups.map(g => Object.keys(g).sort().map(w => [w, g[w].reduce((a, b) => a + b, 0)]));
    const out = {}; reduced.forEach(list => list.forEach(e => { out[e[0]] = e[1]; }));
    return { tokens, chunks, who, mapOut, groups, reduced, output: out };
  }
  function countWords(tokens) { const o = {}; tokens.forEach(w => { o[w] = (o[w] || 0) + 1; }); return o; }
  function sameCounts(a, b) { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(k => a[k] === b[k]); }
  function topWords(out) { let max = 0; const ws = Object.keys(out); ws.forEach(w => { if (out[w] > max) max = out[w]; }); return ws.filter(w => out[w] === max); }
  const logic = { tokenize, makeChunks, assign, hashWord, reducerFor, runJob, countWords, sameCounts, topWords };

  const PHASES = ['Ready', 'Split', 'Map', 'Shuffle', 'Reduce', 'Output'];

  KS.labs.register({
    logic,
    id: 'mapreduce',
    title: 'MapReduce',
    emoji: '🗺️',
    blurb: 'Count the words in a text by splitting it up, working on the pieces in parallel, grouping, then adding up.',
    tags: ['mapreduce', 'big data', 'parallel', 'distributed', 'fault tolerance'],
    goals: [
      { id: 'run', text: 'Run a word count **all the way to the output**' },
      { id: 'scale', text: 'Change the number of **mappers** and get the **same answer**' },
      { id: 'fault', text: 'Kill a **mapper** before the shuffle and still get the right answer' },
      { id: 'top', text: 'Find the **most common word** in the output and tap it' }
    ],
    help: `MapReduce is how a huge pile of data gets processed by many ordinary machines at once. Here the job is counting words.

1. **Split** the text into chunks, one per mapper.
2. **Map**: each mapper reads its chunk and shouts out a pair like (fox, 1) for every word.
3. **Shuffle**: all pairs with the same word are gathered together and sent to the same **reducer**. Which reducer? A **hash** of the word decides, so every machine agrees without talking.
4. **Reduce**: each reducer adds up the 1s for its words.
5. **Output**: put the results together.

Because mappers never depend on each other, a dead one is not a problem. Its chunk is simply given to another mapper and the final answer is identical.

Edit the text, change the number of workers, and use **Next step** to walk through it slowly.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      let text = 'the quick brown fox jumps over the lazy dog and the dog barks at the fox', nM = 3, nR = 2;
      let phase = 0, dead = {}, running = false, sortBy = 'word', picked = null;
      let runs = {};                // mapper count -> output of a finished job (for the "scale" goal)

      const log = ui.log(60);
      const view = h('div.lab-stack');
      const phaseRow = h('div.lab-row');
      const workers = h('div.lab-row');
      const nextBtn = ui.btn('Next step ▶', () => step(), 'primary');
      const allBtn = ui.btn('Run all ⏩', () => runAll());
      const resetBtn = ui.btn('Start over', () => reset(true), 'ghost');
      const ta = ui.textarea('The text to count (try your own)', text, v => { text = v; runs = {}; reset(false); }, 3);

      root.appendChild(ui.panel('The job',
        ta,
        ui.row(
          h('div', h('div.muted.small', 'Mappers'), ui.seg([['2', '2'], ['3', '3'], ['4', '4']], String(nM), v => { nM = +v; reset(false); log.add('Now using **' + nM + ' mappers**. The job restarts from the beginning.', 'info'); })),
          h('div', h('div.muted.small', 'Reducers'), ui.seg([['1', '1'], ['2', '2'], ['3', '3']], String(nR), v => { nR = +v; reset(false); log.add('Now using **' + nR + ' reducer' + (nR > 1 ? 's' : '') + '**. The job restarts.', 'info'); }))),
        ui.row(nextBtn, allBtn, resetBtn)));
      root.appendChild(ui.panel('Progress', phaseRow, h('p.muted.small', 'Workers: tap one to make it crash (mappers only, before the shuffle).'), workers));
      root.appendChild(ui.panel('What the workers have right now', h('div.lab-table-wrap', { style: { maxHeight: 'none', padding: '10px' } }, view)));
      root.appendChild(ui.panel('What just happened', log.el));

      // ---------- control ----------
      function job() { return runJob(text, nM, nR, dead); }
      function reset(announce) {
        if (running) { stopFlag = true; }
        phase = 0; dead = {}; picked = null;
        if (announce) log.add('Job reset.', 'dim');
        render();
      }
      let stopFlag = false;
      function kill(m) {
        if (phase >= 3) { log.add('The map phase is already over. Kill a mapper **before** the shuffle (use *Start over*).', 'warn'); return; }
        if (dead[m]) return;
        const aliveCount = [...Array(nM).keys()].filter(i => !dead[i]).length;
        if (aliveCount <= 1) { log.add('Mapper ' + (m + 1) + ' is the **last one alive**; with no mappers nothing can run. Pick another.', 'warn'); return; }
        const before = job();
        dead[m] = true;
        const after = job();
        const moved = before.who.map((w, c) => w === m ? 'chunk ' + (c + 1) + ' → mapper ' + (after.who[c] + 1) : null).filter(Boolean);
        log.add('💥 **Mapper ' + (m + 1) + ' crashed.** ' + (moved.length ? 'Its work is handed over: ' + moved.join(', ') + '. Nobody needs to start from scratch.' : 'It had nothing to do.'), 'bad');
        render();
      }
      function step() {
        if (running || phase >= 5) return;
        if (!tokenize(text).length) { log.add('Type some words in the text box first.', 'warn'); return; }
        phase++; narrate(); render();
        if (phase === 5) finish();
      }
      async function runAll() {
        if (running || phase >= 5) return;
        if (!tokenize(text).length) { log.add('Type some words in the text box first.', 'warn'); return; }
        running = true; stopFlag = false; setDisabled();
        while (phase < 5 && !stopFlag) {
          phase++; narrate(); render();
          if (phase === 5) { finish(); break; }
          await api.sleep(900); if (!api.alive()) return;
        }
        running = false; setDisabled();
      }
      function setDisabled() { nextBtn.disabled = allBtn.disabled = running; }
      function narrate() {
        const j = job(), nw = j.tokens.length;
        if (phase === 1) log.add('**Split:** ' + nw + ' words cut into ' + nM + ' chunks, one per mapper.', 'info');
        if (phase === 2) log.add('**Map:** each mapper turns every word in its chunk into a pair **(word, 1)**. They work at the same time and never talk to each other.', 'info');
        if (phase === 3) log.add('**Shuffle:** pairs are grouped by word. A hash of the word picks the reducer, so the same word always lands on the same one.', 'info');
        if (phase === 4) log.add('**Reduce:** each reducer adds up the 1s for each of its words.', 'info');
        if (phase === 5) log.add('**Output:** the reducers\' results are put together and sorted.', 'info');
      }
      function finish() {
        const j = job(), truth = countWords(j.tokens), ok = sameCounts(j.output, truth);
        log.add(ok ? 'Result matches a plain one-computer count ✓' + (Object.keys(dead).length ? ' **even though a mapper crashed.**' : '') : 'Mismatch with the plain count (this should never happen).', ok ? 'good' : 'bad');
        if (!ok) return;
        api.goal('run');
        if (Object.keys(dead).length) api.goal('fault');
        runs[nM] = j.output;
        const keys = Object.keys(runs);
        if (keys.length >= 2 && keys.every(k => sameCounts(runs[k], runs[keys[0]]))) { api.goal('scale'); log.add('Different numbers of mappers, **identical answer**. That is why you can add machines freely.', 'good'); }
      }

      // ---------- render ----------
      function chips(pairs, cls) { return h('div.lab-cells', pairs.map(p => h('span.lab-cell' + (cls ? '.' + cls : ''), p))); }
      function render() {
        KS.clear(phaseRow);
        PHASES.forEach((p, i) => phaseRow.appendChild(h('span.lab-chip' + (i === phase ? '.tn-accent' : i < phase ? '.tn-good' : ''), (i < phase ? '✓ ' : '') + p)));
        KS.clear(workers);
        for (let m = 0; m < nM; m++) workers.appendChild(ui.btn(dead[m] ? '☠ Mapper ' + (m + 1) : '💥 Mapper ' + (m + 1), () => kill(m), dead[m] ? 'ghost' : 'sm'));
        KS.clear(view);
        const j = job();
        if (phase === 0) { view.appendChild(h('p.muted', j.tokens.length ? 'Press "Next step" to split the ' + j.tokens.length + ' words into chunks.' : 'Type some text above to begin.')); return; }
        if (phase === 1) {
          j.chunks.forEach((c, i) => view.appendChild(h('div', h('strong', 'Chunk ' + (i + 1) + ' '), h('span.muted.small', '(' + c.length + ' words)'), chips(c.map(w => w), ''))));
        } else if (phase === 2) {
          j.mapOut.forEach((list, m) => {
            const pairs = []; list.forEach(x => x.pairs.forEach(p => pairs.push('(' + p[0] + ',1)')));
            view.appendChild(h('div', h('strong', 'Mapper ' + (m + 1) + (dead[m] ? ' ☠ crashed' : '')), ' ', h('span.muted.small', list.length ? '(chunk ' + list.map(x => x.chunk + 1).join(' + ') + ')' : ''), dead[m] ? null : chips(pairs, 'hl')));
          });
        } else if (phase === 3) {
          j.groups.forEach((g, r) => {
            const ws = Object.keys(g).sort();
            view.appendChild(h('div', h('strong', 'Reducer ' + (r + 1)), ' ', h('span.muted.small', '(' + ws.length + ' different words)'), chips(ws.map(w => w + ': ' + g[w].join('+')), 'hl')));
          });
        } else if (phase === 4) {
          j.reduced.forEach((list, r) => view.appendChild(h('div', h('strong', 'Reducer ' + (r + 1)), chips(list.map(e => e[0] + ' = ' + e[1]), 'good'))));
        } else renderOutput(j);
      }
      function renderOutput(j) {
        const rows = Object.keys(j.output).map(w => [w, j.output[w]]);
        rows.sort(sortBy === 'count' ? (a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1) : (a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
        const tops = topWords(j.output);
        view.appendChild(h('div.lab-row', h('strong', 'Final counts'), ui.seg([['word', 'A → Z'], ['count', 'Biggest first']], sortBy, v => { sortBy = v; render(); })));
        view.appendChild(h('table.lab-table', h('tr', h('th', 'word'), h('th', 'count'), h('th', 'is it the top word?')),
          rows.map(r => h('tr' + (picked === r[0] ? (tops.indexOf(r[0]) >= 0 ? '.good' : '.bad') : ''), h('td.lab-mono', r[0]), h('td', String(r[1])), h('td', ui.btn(picked === r[0] ? (tops.indexOf(r[0]) >= 0 ? '🏆 yes' : 'no') : 'pick', () => pick(r[0], j), 'sm'))))));
        view.appendChild(h('p.muted.small', 'Tap "pick" on the word you think appears most often.'));
      }
      function pick(w, j) {
        picked = w;
        const tops = topWords(j.output);
        if (tops.indexOf(w) >= 0) { log.add('**"' + w + '"** appears ' + j.output[w] + ' times, the most of any word 🏆', 'good'); api.goal('top'); }
        else log.add('"' + w + '" appears ' + j.output[w] + ' time' + (j.output[w] === 1 ? '' : 's') + '. Another word beats it, look again.', 'warn');
        render();
      }

      render();
      log.add('Press **Next step** to walk through the job, or **Run all**.', 'dim');
    }
  });
})();
