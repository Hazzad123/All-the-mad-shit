/* Lab: git-graph — history is a graph of commits; a branch is just a movable label. */
(function () {
  // <model>
  const MAX_COMMITS = 36, MAX_BRANCHES = 5;
  function addCommit(r, parents, msg) {
    r.n++;
    let x = 2166136261, s = parents.join(',') + '|' + msg + '|' + r.n, id;
    for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619);
    do { id = ('00000000' + (x >>> 0).toString(16)).slice(-7); x = Math.imul(x ^ 0x9e3779b1, 16777619) + 1; } while (r.commits[id]);
    const c = { id: id, parents: parents.slice(), msg: msg, seq: r.n };
    r.commits[id] = c; r.order.push(id);
    return c;
  }
  function newRepo() {
    const r = { commits: {}, order: [], branches: [{ name: 'main', tip: null }], head: 'main', n: 0 };
    r.branches[0].tip = addCommit(r, [], 'Initial commit').id;
    return r;
  }
  function getBranch(r, name) { for (let i = 0; i < r.branches.length; i++) if (r.branches[i].name === name) return r.branches[i]; return null; }
  function ancestors(r, id) {
    const seen = {}, stack = [id];
    while (stack.length) { const x = stack.pop(); if (seen[x]) continue; seen[x] = true; r.commits[x].parents.forEach(function (p) { stack.push(p); }); }
    return seen;
  }
  function res(ok, text, tone, extra) { const o = { ok: ok, text: text, tone: tone || (ok ? 'good' : 'bad'), event: null }; if (extra) for (const k in extra) o[k] = extra[k]; return o; }
  function validName(name) { return /^[A-Za-z0-9][A-Za-z0-9._\/-]{0,23}$/.test(name || ''); }
  function opCommit(r, msg) {
    if (r.order.length >= MAX_COMMITS) return res(false, 'The picture is full (' + MAX_COMMITS + ' commits). Press **Reset** to start again.');
    const b = getBranch(r, r.head);
    const c = addCommit(r, [b.tip], (msg && msg.trim()) || 'Change ' + r.n);
    b.tip = c.id;
    return res(true, 'New commit **' + c.id + '** whose parent is the previous tip. The label **' + b.name + '** (and HEAD with it) slid forward to the new commit.', 'good', { event: 'commit', branch: b.name, id: c.id });
  }
  function opBranch(r, name) {
    if (!validName(name)) return res(false, 'Branch names use letters, digits, `-` and `_`, for example `git branch feature`.');
    if (getBranch(r, name)) return res(false, 'A branch called **' + name + '** already exists.');
    if (r.branches.length >= MAX_BRANCHES) return res(false, 'That is plenty of branches for this picture (max ' + MAX_BRANCHES + ').');
    const tip = getBranch(r, r.head).tip;
    r.branches.push({ name: name, tip: tip });
    return res(true, 'Created branch **' + name + '** pointing at commit **' + tip + '**. No commit was made: a branch is only a sticky note on a commit. You are still on **' + r.head + '**.', 'good', { event: 'branch' });
  }
  function opSwitch(r, name) {
    const b = getBranch(r, name);
    if (!b) return res(false, 'There is no branch called **' + name + '**. Create it first with `git branch ' + name + '`.');
    if (r.head === name) return res(true, 'You are already on **' + name + '**.', 'dim');
    r.head = name;
    return res(true, 'HEAD now points at **' + name + '**. The next commit will move the **' + name + '** label.', 'info', { event: 'switch' });
  }
  function opMerge(r, name) {
    const other = getBranch(r, name), cur = getBranch(r, r.head);
    if (!other) return res(false, 'There is no branch called **' + name + '**.');
    if (other === cur) return res(false, 'You cannot merge a branch into itself. Switch to the branch that should receive the work.');
    const ancCur = ancestors(r, cur.tip), ancOther = ancestors(r, other.tip);
    if (ancCur[other.tip]) return res(true, 'Already up to date: everything in **' + name + '** is already in **' + cur.name + '**.', 'dim');
    if (ancOther[cur.tip]) {
      cur.tip = other.tip;
      return res(true, '**Fast-forward.** **' + cur.name + '** had no new work of its own, so git simply slid the label **' + cur.name + '** forward to **' + other.tip + '**. No new commit was needed.', 'good', { event: 'ff' });
    }
    if (r.order.length >= MAX_COMMITS) return res(false, 'The picture is full. Press **Reset** to start again.');
    const c = addCommit(r, [cur.tip, other.tip], 'Merge ' + name + ' into ' + cur.name);
    cur.tip = c.id;
    return res(true, 'Both branches had commits the other lacked, so git made a **merge commit** **' + c.id + '** with **two parents** (the old tips of ' + cur.name + ' and ' + name + ').', 'good', { event: 'merge', id: c.id });
  }
  function opRebase(r, name) {
    const onto = getBranch(r, name), cur = getBranch(r, r.head);
    if (!onto) return res(false, 'There is no branch called **' + name + '**.');
    if (onto === cur) return res(false, 'Rebase **onto** a different branch: switch to the branch you want to move, then `git rebase main`.');
    const ancCur = ancestors(r, cur.tip), ancOnto = ancestors(r, onto.tip);
    if (ancCur[onto.tip]) return res(true, 'Already up to date: **' + cur.name + '** already sits on top of **' + name + '**.', 'dim');
    if (ancOnto[cur.tip]) { cur.tip = onto.tip; return res(true, 'Nothing to replay: **' + cur.name + '** had no commits of its own, so its label just moved to **' + onto.tip + '**.', 'good', { event: 'rebase', replayed: 0 }); }
    const todo = r.order.filter(function (id) { return ancCur[id] && !ancOnto[id] && r.commits[id].parents.length === 1; });
    if (r.order.length + todo.length > MAX_COMMITS) return res(false, 'The picture would overflow. Press **Reset** to start again.');
    let p = onto.tip; const pairs = [];
    todo.forEach(function (id) { const nc = addCommit(r, [p], r.commits[id].msg); pairs.push(id + ' to ' + nc.id); p = nc.id; });
    cur.tip = p;
    return res(true, '**Rebase.** git copied ' + todo.length + ' commit' + (todo.length === 1 ? '' : 's') + ' of **' + cur.name + '** (' + pairs.join(', ') + ') on top of **' + name + '**. The copies have new ids; the originals are left behind (faded). History is now a straight line.', 'good', { event: 'rebase', replayed: todo.length });
  }
  function runCommand(r, line) {
    line = (line || '').trim().replace(/\s+/g, ' ');
    if (!line) return res(false, 'Type a command first, for example `git commit`.', 'warn');
    const m = line.replace(/^git\s+/i, '').match(/^(\S+)\s*(.*)$/);
    const cmd = m[1].toLowerCase(), rest = m[2];
    if (cmd === 'commit') {
      const mm = rest.match(/-m\s*(?:"([^"]*)"|'([^']*)'|(.*))/);
      return opCommit(r, mm ? (mm[1] || mm[2] || mm[3] || '') : '');
    }
    if (cmd === 'branch') {
      if (!rest) return res(true, 'Branches: ' + r.branches.map(function (b) { return (b.name === r.head ? '**' + b.name + ' (HEAD)**' : b.name) + ' at ' + b.tip; }).join(', '), 'info');
      return opBranch(r, rest.split(' ')[0]);
    }
    if (cmd === 'switch' || cmd === 'checkout') {
      const t = rest.split(' ');
      if (t[0] === '-b' || t[0] === '-c') {
        const a = opBranch(r, t[1]); if (!a.ok) return a;
        const b = opSwitch(r, t[1]); a.text += ' ' + b.text; return a;
      }
      return opSwitch(r, t[0]);
    }
    if (cmd === 'merge') return rest ? opMerge(r, rest.split(' ')[0]) : res(false, 'Say which branch to merge, for example `git merge feature`.', 'warn');
    if (cmd === 'rebase') return rest ? opRebase(r, rest.split(' ')[0]) : res(false, 'Say which branch to rebase onto, for example `git rebase main`.', 'warn');
    return res(false, 'This toy knows: `commit`, `branch <name>`, `switch <name>`, `checkout <name>`, `merge <name>`, `rebase <name>`.', 'warn');
  }
  // Positions: x = order of creation, y = lane (one lane per branch, abandoned commits get lanes below).
  function layout(r) {
    const nB = r.branches.length, lane = {}, reach = {};
    r.branches.forEach(function (b, k) {
      const a = ancestors(r, b.tip); for (const id in a) reach[id] = true;
      let id = b.tip; while (id) { if (lane[id] === undefined) lane[id] = k; id = r.commits[id].parents[0]; }
    });
    let extra = nB; const claimed = {};
    r.order.forEach(function (id) {
      if (lane[id] !== undefined) return;
      const p = r.commits[id].parents[0];
      if (p && lane[p] !== undefined && lane[p] >= nB && !claimed[p]) { lane[id] = lane[p]; claimed[p] = true; } else lane[id] = extra++;
    });
    return { lane: lane, reach: reach, lanes: Math.max(nB, extra) };
  }
  // </model>

  KS.labs.register({
    id: 'git-graph',
    title: 'Git Graph',
    emoji: '🌳',
    blurb: 'Make commits, branch, merge and rebase, and watch the history graph grow. A branch is just a label that moves.',
    tags: ['git', 'version control', 'branches', 'merge', 'rebase'],
    goals: [
      { id: 'commit', text: 'Make **two commits**' },
      { id: 'branch', text: 'Create a **branch** and make a commit on it' },
      { id: 'ff', text: 'Do a **fast-forward** merge' },
      { id: 'merge', text: 'Create a **merge commit** with two parents' },
      { id: 'rebase', text: '**Rebase** a branch to get a straight line of history' }
    ],
    help: `Every **commit** is a snapshot that points back at its **parent** (the commit before it). Together they form a graph, drawn here left to right, oldest first.

A **branch** is only a name stuck on one commit. **HEAD** says which branch you are on. Committing moves the current branch's label forward.

**Merge** joins two lines of work. If one side has nothing new, git just slides the label (a **fast-forward**). If both sides moved, git makes a **merge commit** with two parents.

**Rebase** replays your commits on top of another branch, giving them new ids. History becomes a straight line, but the old commits are abandoned (shown faded).

Use the buttons, or type commands like \`git branch feature\`.`,

    mount(root, api) {
      const ui = api.ui, h = api.h, s = api.s;
      let repo = newRepo();
      const flags = { commits: 0, branchCommit: false };
      const log = ui.log(60);
      const wrap = h('div', { style: { overflowX: 'auto', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: '14px', padding: '6px' } });
      const actions = h('div.lab-stack');
      const status = h('div');
      const LANE_COLOURS = ['--accent', '--good', '--warn', '--info', '--accent-2', '--bad'];
      const NEW_NAMES = ['feature', 'bugfix', 'hotfix', 'experiment', 'docs'];

      const cmdInput = ui.input('Or type a command', '', function () {}, { placeholder: 'git commit -m "message"', 'aria-label': 'git command', class: 'mono' });
      const onEnter = function (e) { if (e.key === 'Enter') { e.preventDefault(); runTyped(); } };
      cmdInput.input.addEventListener('keydown', onEnter);
      api.onCleanup(function () { cmdInput.input.removeEventListener('keydown', onEnter); });
      function runTyped() { const v = cmdInput.get(); cmdInput.set(''); exec(v, true); }

      root.appendChild(ui.panel('Commit history', status, wrap));
      root.appendChild(ui.panel('Do something', actions, h('div', { style: { marginTop: '10px' } }, ui.row(cmdInput, ui.btn('Run', runTyped, 'sm')))));
      root.appendChild(ui.panel('What just happened', log.el));
      log.add('You start with one commit on **main**. Press **git commit** twice.', 'info');

      function exec(line, echo) {
        const before = JSON.stringify(repo.order.length);
        const r = runCommand(repo, line);
        if (echo && line.trim()) log.add('$ ' + line.trim().replace(/[<>&]/g, ''), 'dim');
        log.add(r.text, r.tone);
        void before;
        if (r.ok && r.event === 'commit') { flags.commits++; if (r.branch !== 'main') flags.branchCommit = true; }
        render();
        if (flags.commits >= 2) api.goal('commit');
        if (flags.branchCommit && repo.branches.length > 1) api.goal('branch');
        if (r.event === 'ff') api.goal('ff');
        if (r.event === 'merge') api.goal('merge');
        if (r.event === 'rebase' && r.replayed >= 1) api.goal('rebase');
      }
      function doReset() { repo = newRepo(); flags.commits = 0; log.add('Reset: a fresh repository with one commit. (Goals you completed stay ticked.)', 'info'); render(); }

      function renderActions() {
        KS.clear(actions);
        const others = repo.branches.filter(function (b) { return b.name !== repo.head; });
        const free = NEW_NAMES.filter(function (n) { return !getBranch(repo, n); })[0];
        actions.appendChild(ui.row(ui.btn('git commit', function () { exec('git commit', true); }, 'primary'),
          free && repo.branches.length < MAX_BRANCHES ? ui.btn('git branch ' + free, function () { exec('git branch ' + free, true); }) : null,
          ui.btn('↺ Reset', doReset, 'ghost')));
        [['switch', 'git switch '], ['merge', 'git merge '], ['rebase', 'git rebase ']].forEach(function (g) {
          const list = g[0] === 'switch' ? repo.branches.filter(function (b) { return b.name !== repo.head; }) : others;
          if (!list.length) return;
          actions.appendChild(ui.row(list.map(function (b) { return ui.btn(g[1] + b.name, function () { exec(g[1] + b.name, true); }, g[0] === 'switch' ? 'sm' : 'sm'); })));
        });
        actions.appendChild(h('p.muted.small', 'merge and rebase act on the branch you are on (HEAD), bringing in the branch you name.'));
      }

      function render() {
        const L = layout(repo), DX = 48, LH = 70;
        const stacks = {}; let maxStack = 1;
        repo.branches.forEach(function (b) { stacks[b.tip] = (stacks[b.tip] || 0) + 1; if (stacks[b.tip] > maxStack) maxStack = stacks[b.tip]; });
        const TOP = 26 + maxStack * 20, W = Math.max(340, repo.order.length * DX + 50), H = TOP + (L.lanes - 1) * LH + 46;
        const pos = {}; repo.order.forEach(function (id, i) { pos[id] = { x: 30 + i * DX, y: TOP + L.lane[id] * LH }; });
        const kids = [];
        repo.order.forEach(function (id) {
          const c = repo.commits[id], q = pos[id], dim = !L.reach[id];
          c.parents.forEach(function (pid, k) {
            const p = pos[pid];
            const d = p.y === q.y ? 'M' + p.x + ' ' + p.y + ' L' + q.x + ' ' + q.y : 'M' + p.x + ' ' + p.y + ' C' + (p.x + DX * 0.7) + ' ' + p.y + ' ' + (q.x - DX * 0.7) + ' ' + q.y + ' ' + q.x + ' ' + q.y;
            kids.push(s('path', { d: d, fill: 'none', 'stroke-width': 2.5, 'stroke-dasharray': dim ? '4 4' : null, style: { stroke: k ? 'var(--muted)' : 'var(--line-2)', opacity: dim ? 0.5 : 1 } }));
          });
        });
        const headTip = getBranch(repo, repo.head).tip;
        repo.order.forEach(function (id) {
          const c = repo.commits[id], q = pos[id], dim = !L.reach[id], col = 'var(' + LANE_COLOURS[L.lane[id] % LANE_COLOURS.length] + ')';
          if (id === headTip) kids.push(s('circle', { cx: q.x, cy: q.y, r: 15, fill: 'none', 'stroke-width': 2, style: { stroke: 'var(--accent-2)' } }));
          kids.push(s('circle', { cx: q.x, cy: q.y, r: 10, 'stroke-width': c.parents.length > 1 ? 5 : 2, 'stroke-dasharray': dim ? '3 3' : null, style: { fill: dim ? 'var(--panel-2)' : col, stroke: c.parents.length > 1 ? 'var(--text)' : col, opacity: dim ? 0.55 : 1 } }));
          kids.push(s('text', { x: q.x, y: q.y + 27, 'text-anchor': 'middle', style: { fill: 'var(--muted)', fontSize: '9px', fontFamily: 'var(--mono)', opacity: dim ? 0.6 : 1 } }, c.id));
        });
        const seen = {};
        repo.branches.forEach(function (b, k) {
          const q = pos[b.tip], n = seen[b.tip] || 0; seen[b.tip] = n + 1;
          const isHead = b.name === repo.head, text = (isHead ? 'HEAD ➜ ' : '') + b.name, w = text.length * 6.3 + 14;
          const x = Math.max(2, q.x - w / 2), y = q.y - 40 - n * 20, col = 'var(' + LANE_COLOURS[k % LANE_COLOURS.length] + ')';
          kids.push(s('rect', { x: x, y: y, width: w, height: 17, rx: 8, 'stroke-width': isHead ? 2.5 : 1.5, style: { fill: 'var(--panel)', stroke: isHead ? 'var(--accent-2)' : col } }));
          kids.push(s('text', { x: x + w / 2, y: y + 12, 'text-anchor': 'middle', style: { fill: 'var(--text)', fontSize: '10.5px', fontWeight: '700' } }, text));
        });
        const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'Commit graph', style: { display: 'block', maxWidth: 'none' } }, kids);
        KS.clear(wrap); wrap.appendChild(svg); wrap.scrollLeft = wrap.scrollWidth;
        KS.clear(status);
        status.appendChild(ui.row(h('span.lab-chip.tn-accent', 'You are on: ' + repo.head), h('span.lab-chip', repo.order.length + ' commits'), h('span.lab-chip', repo.branches.length + ' branch' + (repo.branches.length === 1 ? '' : 'es'))));
        renderActions();
      }
      render();
    }
  });
})();
