/* Keystone Studio — the full desktop learning environment (also works on tablets and phones). */
(function () {
  'use strict';
  const KS = window.KS, h = KS.h, S = KS.store, C = KS.content, U = KS.ui, P = KS.panels;
  KS.shell = 'studio';
  C.init(); U.applyTheme(); KS.game.touchSession();

  const app = document.getElementById('app');
  const NAV = [['home', 'home', 'Home'], ['journey', 'map', 'Journey'], ['labs', 'flask', 'Labs'], ['arcade', 'game', 'Arcade'], ['library', 'book', 'Library'], ['roadmaps', 'route', 'Roadmaps'], ['me', 'user', 'Profile']];
  const NAV_OF = { module: 'journey', lab: 'labs', sheet: 'library', boss: 'arcade', lesson: 'journey' };
  let sideEl, topEl, viewEl, focusEl, cleanup = null, cur = { name: 'home', args: [] };

  function parse() { const p = location.hash.replace(/^#\/?/, '').split('/').map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } }); return { name: p[0] || 'home', args: p.slice(1) }; }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  let labMounted = null;   // id of the lab currently running on the lab page
  function isCur(name, arg) { return cur.name === name && (arg == null || cur.args[0] === arg); }
  function setShell(v) { try { localStorage.setItem('keystone.shell', v); } catch (e) { /* private mode */ } }

  // ====================================================================
  // chrome
  // ====================================================================
  function buildShell() {
    sideEl = h('aside.side'); topEl = h('header.topbar'); viewEl = h('main.view', { id: 'view' }); focusEl = h('div.focus');
    const scrim = h('div.side-scrim', { onclick: function () { document.body.classList.remove('side-open'); } });
    app.appendChild(h('div.shell', sideEl, scrim, h('div.main', topEl, viewEl))); app.appendChild(focusEl);
  }
  function drawSide() {
    KS.clear(sideEl); const active = NAV_OF[cur.name] || cur.name; const due = KS.srs.counts().due; const g = KS.game.goal(); const st = S.streak();
    sideEl.appendChild(h('a.brand', { href: '#/home' }, U.logo(36), h('span.brand-name', 'Keystone')));
    sideEl.appendChild(h('nav.nav', { 'aria-label': 'Main' }, NAV.map(function (n) {
      return h('a.nav-item' + (active === n[0] ? '.on' : ''), { href: '#/' + n[0], onclick: function () { document.body.classList.remove('side-open'); } }, U.icon(n[1], 20), h('span', n[2]), n[0] === 'arcade' && due ? h('span.nav-badge', { title: due + ' flashcards due' }, String(due)) : null);
    })));
    sideEl.appendChild(h('div.side-foot',
      h('a.side-goal', { href: '#/me' }, P.goalRing(62), h('div', h('div.side-streak', '🔥 ' + KS.plural(st.current, 'day')), h('div.muted.small', g.met ? 'Daily goal met 🎉' : (g.goal - g.xp) + ' XP to today’s goal'))),
      h('a.side-pocket', { href: 'pocket.html', onclick: function () { setShell('pocket'); } }, U.icon('phone', 16), h('span', 'Open Pocket mode'))));
  }
  function drawTop() {
    KS.clear(topEl); const lv = KS.game.level(); const st = S.streak(); const due = KS.srs.counts().due; const light = document.documentElement.getAttribute('data-theme') === 'light';
    topEl.appendChild(h('button.icon-btn.menu-btn', { type: 'button', 'aria-label': 'Menu', onclick: function () { document.body.classList.toggle('side-open'); } }, U.icon('menu')));
    topEl.appendChild(h('button.search-btn', { type: 'button', onclick: function () { P.openSearch(); } }, U.icon('search', 18), h('span', 'Search lessons, terms, cheat sheets…'), h('kbd', 'Ctrl K')));
    topEl.appendChild(h('div.top-right',
      due ? h('a.top-chip.due', { href: '#/arcade/flash', title: 'Flashcards due for review' }, '🃏 ' + due) : null,
      h('a.top-chip', { href: '#/me', title: 'Day streak' }, '🔥 ' + st.current),
      h('a.top-chip.xp', { href: '#/me', title: lv.title + ' — ' + KS.fmtNum(lv.toGo) + ' XP to next level' }, h('span.top-lv', 'Lv ' + lv.n), '⚡ ' + KS.fmtNum(lv.xp)),
      h('button.icon-btn', { type: 'button', title: 'Sound ' + (S.state.settings.sound ? 'on' : 'off'), 'aria-label': 'Toggle sound', onclick: function () { S.state.settings.sound = !S.state.settings.sound; S.save(); if (S.state.settings.sound) U.sfx('good'); drawTop(); } }, U.icon(S.state.settings.sound ? 'volume' : 'mute')),
      h('button.icon-btn', { type: 'button', title: 'Switch theme', 'aria-label': 'Switch theme', onclick: function () { S.state.settings.theme = light ? 'dark' : 'light'; S.save(); U.applyTheme(); drawTop(); } }, U.icon(light ? 'moon' : 'sun'))));
  }

  // ====================================================================
  // small shared bits
  // ====================================================================
  function pageHead(title, sub, right) { return h('div.page-head', h('div', h('h1', title), sub ? h('p.muted', sub) : null), right || null); }
  function crumbs(list) { const el = h('nav.crumbs', { 'aria-label': 'Breadcrumb' }); list.forEach(function (c, i) { if (i) el.appendChild(h('span.crumb-sep', '›')); el.appendChild(c[1] ? h('a', { href: c[1] }, c[0]) : h('span', c[0])); }); return el; }
  function tabs(list, active, base) { return h('div.tabs', { role: 'tablist' }, list.map(function (t) { return h('a.tab' + (t[0] === active ? '.on' : ''), { href: base + t[0], role: 'tab' }, t[1]); })); }
  function lessonDots(m, nx) { return h('div.dots', m.lessons.map(function (l) { const ls = S.peek(l.id); return h('i.dot' + (ls && ls.done ? '.done' : '') + (nx && nx.id === l.id ? '.next' : '') + (ls && !ls.done && ls.pos > 0 ? '.part' : ''), { title: l.title }); })); }
  function moduleCard(m, nx) {
    const p = C.moduleProgress(m); const here = nx && nx.module.id === m.id;
    return h('a.mod-card' + (p.complete ? '.complete' : '') + (here ? '.here' : ''), { href: '#/module/' + m.id, style: { '--wc': m.world.color } },
      here ? h('span.here-tag', p.done ? 'You are here' : 'Start here') : null,
      h('div.mod-top', h('div.mod-emoji', m.emoji), h('div.mod-ring', U.ring(p.pct, 46, 5, p.complete ? '✓' : p.done + '/' + p.total))),
      h('h3', m.title), h('p.mod-tag', m.tagline), lessonDots(m, nx),
      h('div.mod-foot', h('span', KS.plural(m.lessons.length, 'lesson') + ' · ~' + m.lessons.reduce(function (a, l) { return a + (l.mins || 8); }, 0) + ' min'), p.boss ? h('span.mod-boss', { title: 'Boss defeated' }, '⚔️') : null, p.stars ? h('span.mod-stars', '★ ' + p.stars) : null));
  }

  // ====================================================================
  // views (rendered inside the shell)
  // ====================================================================
  const VIEWS = {};

  VIEWS.home = function () {
    const name = S.state.profile.name; const hr = new Date().getHours(); const ov = C.overall(); const nx = C.nextUp(); const fresh = !ov.done && !S.totalXp();
    const greet = (hr < 5 ? 'Burning the midnight oil' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening') + (name ? ', ' + name : '');
    const root = h('div.page.home');
    root.appendChild(pageHead(greet + ' 👋', fresh ? 'Welcome to Keystone: ' + ov.total + ' bite-sized lessons, hands-on labs and games that take you from “I can write a loop” to “I can design the system”.' : ov.done + ' of ' + ov.total + ' lessons done · ' + Math.round(ov.pct * 100) + '% of the way to architect.'));

    // continue hero
    let hero;
    if (nx) {
      const ls = S.peek(nx.id); const inProg = ls && ls.pos > 0 && !ls.done; const mp = C.moduleProgress(nx.module);
      hero = h('a.hero', { href: '#/lesson/' + nx.id, style: { '--wc': nx.world.color } },
        h('div.hero-main', h('div.hero-kicker', inProg ? 'Continue where you left off' : fresh ? 'Start here' : 'Up next'), h('h2', nx.title), h('p', nx.summary),
          h('div.hero-meta', U.chip(nx.world.emoji + ' ' + nx.world.title), U.chip(nx.module.emoji + ' ' + nx.module.title), U.chip('⏱ ' + nx.mins + ' min'), nx.lab ? U.chip('🧪 includes a lab', 'accent') : null)),
        h('div.hero-side', U.ring(mp.pct, 92, 9, h('div', h('div.goal-num', mp.done + '/' + mp.total), h('div.goal-of', 'in module'))), h('span.btn.primary.lg', inProg ? 'Resume ▸' : 'Start ▸')));
    } else hero = h('div.hero.all-done', h('div.hero-main', h('div.hero-kicker', 'Curriculum complete'), h('h2', '🎓 You finished every lesson.'), h('p', 'Keep the knowledge alive with flashcards, boss rematches and the capstones.')));
    const today = h('div.panel.today', h('h3', 'Today'), h('div.today-row', P.goalRing(96), h('div.today-main', h('div.today-streak', '🔥 ' + KS.plural(S.streak().current, 'day') + ' streak'), P.week())), P.levelBar());
    root.appendChild(h('div.home-top', hero, today));

    // quick actions
    const sr = KS.srs.counts(); const dailyDone = !!S.dayTotals().d;
    const qa = function (href, emoji, title, sub, tone) { return h('a.qa' + (tone ? '.' + tone : ''), { href: href }, h('div.qa-emoji', emoji), h('div', h('div.qa-title', title), h('div.qa-sub', sub))); };
    const labs = KS.labs.list(); const rndLab = labs.length ? labs[Math.floor(KS.rng('lab' + KS.today())() * labs.length)] : null;
    root.appendChild(h('div.qa-row',
      qa('#/arcade/flash', '🃏', 'Review flashcards', sr.due ? sr.due + ' due now' : sr.total ? 'All caught up' : 'Unlock by finishing lessons', sr.due ? 'hot' : ''),
      qa('#/arcade/daily', '📅', 'Daily challenge', dailyDone ? 'Done for today ✓' : '5 questions · +15 bonus XP', dailyDone ? '' : 'hot'),
      rndLab ? qa('#/lab/' + rndLab.id, rndLab.emoji || '🧪', 'Lab of the day', rndLab.title) : qa('#/labs', '🧪', 'Labs', 'Hands-on simulations'),
      qa('#/arcade', '🕹️', 'Arcade', 'Twelve quick games')));

    // worlds
    root.appendChild(h('h2.section-title', 'Your worlds'));
    root.appendChild(h('div.world-tiles', C.worlds.map(function (w, i) {
      const p = C.worldProgress(w);
      return h('a.world-tile', { href: '#/journey/' + w.id, style: { '--wc': w.color } }, h('div.world-tile-top', h('span.world-tile-emoji', w.emoji), h('span.world-tile-num', String(i + 1).padStart(2, '0'))), h('div.world-tile-title', w.title), U.bar(p.pct, 'wc'), h('div.world-tile-sub', p.done + ' / ' + p.total + ' lessons'));
    })));

    // bottom: activity + roadmaps + achievements
    const earned = KS.game.achievements.filter(function (a) { return KS.game.earned(a.id); }).sort(function (a, b) { return KS.game.earned(b.id) - KS.game.earned(a.id); }).slice(0, 5);
    root.appendChild(h('div.home-bottom',
      h('div.panel', h('h3', 'Activity'), P.heatmap(18)),
      h('div.panel', h('h3', 'Roadmap coverage'), (KS.roadmaps || []).map(function (rm) { const p = C.roadmapProgress(rm); return h('a.rm-mini', { href: '#/roadmaps/' + rm.id }, h('div.rm-mini-top', h('span', rm.emoji + ' ' + rm.title), h('span.muted', p.done + '/' + p.nodes)), U.bar(p.pct)); })),
      h('div.panel', h('h3', 'Latest achievements'), earned.length ? h('div.ach-mini', earned.map(function (a) { return h('div.ach-mini-item', { title: a.desc }, h('span', a.emoji), h('span', a.title)); })) : h('p.muted', 'Finish your first lesson to earn one.'), h('a.small', { href: '#/me' }, 'See all →'))));
    return root;
  };

  VIEWS.journey = function (args) {
    const nx = C.nextUp(); const root = h('div.page.journey');
    root.appendChild(pageHead('Your journey', 'Twelve worlds, ordered so each one makes the next easier. Nothing is locked — jump in wherever you like.'));
    root.appendChild(h('div.world-chips', C.worlds.map(function (w) { return h('a.world-chip', { href: '#/journey/' + w.id, style: { '--wc': w.color } }, w.emoji + ' ' + w.title); })));
    C.worlds.forEach(function (w, wi) {
      const p = C.worldProgress(w);
      root.appendChild(h('section.world', { id: 'world-' + w.id, style: { '--wc': w.color } },
        h('div.world-head', h('div.world-emoji', w.emoji), h('div.world-head-main', h('div.world-num', 'World ' + (wi + 1) + ' of ' + C.worlds.length), h('h2', w.title), h('p', w.blurb)), h('div.world-prog', U.ring(p.pct, 68, 7, Math.round(p.pct * 100) + '%'), h('span.muted.small', p.done + ' / ' + p.total))),
        h('div.mod-grid', w.modules.map(function (m) { return moduleCard(m, nx); }))));
    });
    const target = args[0] || null;
    if (target) setTimeout(function () { const el = document.getElementById('world-' + target); if (el) el.scrollIntoView({ block: 'start' }); }, 40);
    return root;
  };

  VIEWS.module = function (args) {
    const m = C.moduleById[args[0]]; if (!m) return U.empty('🧭', 'Module not found', '', h('a.btn.primary', { href: '#/journey' }, 'Back to the journey'));
    if (!C.loaded[m.id] && !C.missing[m.id]) C.loadModule(m.id).then(function () { if (isCur('module', m.id)) render(true); });
    const p = C.moduleProgress(m); const nx = C.nextUp(); const boss = S.state.bosses[m.id]; const loaded = !!C.loaded[m.id];
    const firstTodo = m.lessons.filter(function (l) { return !S.isDone(l.id); })[0];
    const root = h('div.page.module', { style: { '--wc': m.world.color } });
    root.appendChild(crumbs([['Journey', '#/journey'], [m.world.emoji + ' ' + m.world.title, '#/journey/' + m.world.id], [m.title]]));
    root.appendChild(h('div.module-head', h('div.module-emoji', m.emoji), h('div.module-head-main', h('h1', m.title), h('p.muted', m.tagline),
      h('div.module-meta', U.chip(KS.plural(m.lessons.length, 'lesson')), U.chip('~' + m.lessons.reduce(function (a, l) { return a + (l.mins || 8); }, 0) + ' min'), p.stars ? U.chip('★ ' + p.stars + ' / ' + p.maxStars, 'warn') : null, p.boss ? U.chip('⚔️ boss defeated', 'good') : null)),
      h('div.module-head-side', U.ring(p.pct, 84, 8, Math.round(p.pct * 100) + '%'), firstTodo ? h('a.btn.primary', { href: '#/lesson/' + firstTodo.id }, p.done ? 'Continue ▸' : 'Start ▸') : h('a.btn', { href: '#/boss/' + m.id }, '⚔️ Boss'))));

    const list = h('div.lesson-list');
    m.lessons.forEach(function (l, i) {
      const ls = S.peek(l.id); const done = !!(ls && ls.done); const part = ls && !ls.done && ls.pos > 0; const isNext = nx && nx.id === l.id; const missing = loaded && !C.lessons[l.id];
      list.appendChild(h('a.lesson-row' + (done ? '.done' : '') + (isNext ? '.next' : '') + (missing ? '.missing' : ''), { href: '#/lesson/' + l.id },
        h('div.lesson-node', done ? '✓' : isNext || part ? '▶' : String(i + 1)),
        h('div.lesson-main', h('div.lesson-title', l.title, isNext ? h('span.chip.accent', part ? 'in progress' : 'up next') : null, missing ? h('span.chip', 'coming soon') : null), h('div.lesson-sum', l.summary)),
        h('div.lesson-side', l.lab ? h('span.chip', { title: 'Includes a hands-on lab' }, '🧪 lab') : null, h('span.muted.small', (l.mins || 8) + ' min'), done ? U.stars(ls.stars) : null)));
    });
    list.appendChild(h('a.lesson-row.boss-row' + (p.boss ? '.done' : ''), { href: '#/boss/' + m.id },
      h('div.lesson-node.boss-node', '⚔️'), h('div.lesson-main', h('div.lesson-title', 'Boss battle', p.boss ? h('span.chip.good', 'defeated') : null), h('div.lesson-sum', 'Mixed questions from the whole module. Three hearts. ' + (p.complete ? '' : 'Already know this? Win to test out of the module.'))),
      h('div.lesson-side', boss && boss.best ? h('span.muted.small', 'best ' + Math.round(boss.best * 100) + '%') : null)));

    const side = h('div.module-side');
    const labIds = []; m.lessons.forEach(function (l) { (Array.isArray(l.lab) ? l.lab : l.lab ? [l.lab] : []).forEach(function (id) { if (labIds.indexOf(id) < 0 && KS.labs.get(id)) labIds.push(id); }); });
    if (C.sheets[m.id]) side.appendChild(h('a.side-card', { href: '#/sheet/' + m.id }, h('div.side-card-emoji', '📄'), h('div', h('b', 'Cheat sheet'), h('div.muted.small', 'The whole module on one page.'))));
    if (labIds.length) side.appendChild(h('div.side-card.col', h('b', '🧪 Labs in this module'), labIds.map(function (id) { const lab = KS.labs.get(id); const pr = KS.labs.progress(id); return h('a.side-lab', { href: '#/lab/' + id }, h('span', (lab.emoji || '🧪') + ' ' + lab.title), h('span.muted.small', pr.done + '/' + pr.total)); })));
    const nextM = C.modules[m.index + 1], prevM = C.modules[m.index - 1];
    side.appendChild(h('div.side-card.col', h('b', 'Nearby'), prevM ? h('a.side-lab', { href: '#/module/' + prevM.id }, h('span', '← ' + prevM.title)) : null, nextM ? h('a.side-lab', { href: '#/module/' + nextM.id }, h('span', nextM.title + ' →')) : null));
    root.appendChild(h('div.module-body', list, side));
    return root;
  };

  VIEWS.labs = function () {
    const root = h('div.page.labs'); const labs = KS.labs.list();
    root.appendChild(pageHead('Labs', 'Break things on purpose. Each lab is a small simulation with goals — the fastest way to build intuition for how systems behave.'));
    if (!labs.length) { root.appendChild(U.spinner('Loading labs…')); return root; }
    const input = h('input.gloss-filter', { type: 'search', placeholder: 'Filter labs…', 'aria-label': 'Filter labs' }); const grid = h('div.lab-grid');
    const lessonFor = {}; C.order.forEach(function (id) { const l = C.meta(id); (Array.isArray(l.lab) ? l.lab : l.lab ? [l.lab] : []).forEach(function (x) { if (!lessonFor[x]) lessonFor[x] = l; }); });
    function draw() {
      const q = input.value.trim().toLowerCase(); KS.clear(grid);
      labs.filter(function (l) { return !q || (l.title + ' ' + (l.blurb || '') + ' ' + (l.tags || []).join(' ')).toLowerCase().indexOf(q) >= 0; }).forEach(function (l) {
        const pr = KS.labs.progress(l.id); const meta = lessonFor[l.id];
        grid.appendChild(h('a.lab-card' + (pr.total && pr.done === pr.total ? '.complete' : ''), { href: '#/lab/' + l.id, style: { '--wc': meta ? meta.world.color : 'var(--accent)' } },
          h('div.lab-card-top', h('span.lab-card-emoji', l.emoji || '🧪'), pr.total ? h('span.chip' + (pr.done === pr.total ? '.good' : ''), pr.done === pr.total ? '✓ complete' : pr.done + ' / ' + pr.total + ' goals') : null),
          h('h3', l.title), h('p', l.blurb || ''), meta ? h('div.lab-card-foot', meta.world.emoji + ' ' + meta.module.title) : null));
      });
      if (!grid.children.length) grid.appendChild(U.empty('🔎', 'No labs match', ''));
    }
    input.addEventListener('input', KS.debounce(draw, 120)); draw();
    root.appendChild(h('div.gloss-head', input, h('span.muted.small', labs.filter(function (l) { return KS.labs.isComplete(l.id); }).length + ' of ' + labs.length + ' complete'))); root.appendChild(grid);
    return root;
  };
  VIEWS.lab = function (args) {
    const root = h('div.page.lab-page'); root.appendChild(crumbs([['Labs', '#/labs'], [(KS.labs.get(args[0]) || {}).title || 'Lab']]));
    const host = h('div.lab-host'); root.appendChild(host);
    if (!KS.labs.get(args[0]) && !KS.labs.allReady) { host.appendChild(U.spinner('Loading lab…')); return root; }
    const ctl = KS.labs.mount(host, args[0], {}); labMounted = args[0];
    cleanup = function () { labMounted = null; ctl.destroy(); };
    return root;
  };

  VIEWS.arcade = function () {
    const root = h('div.page.arcade'); const sr = KS.srs.counts();
    root.appendChild(pageHead('Arcade', 'Short games built from what you have learned. Two minutes here beats twenty minutes of re-reading.'));
    root.appendChild(h('div.game-grid', KS.arcade.games.map(function (g) {
      const st = S.state.games[g.id]; const hot = (g.id === 'flash' && sr.due) || (g.id === 'daily' && !S.dayTotals().d);
      return h('a.game-card' + (hot ? '.hot' : ''), { href: '#/arcade/' + g.id }, h('div.game-card-emoji', g.emoji), h('h3', g.title), h('p', g.blurb),
        h('div.game-card-foot', h('span', '~' + g.mins + ' min'), g.id === 'flash' && sr.due ? h('span.chip.warn', sr.due + ' due') : g.id === 'daily' && !S.dayTotals().d ? h('span.chip.warn', 'new today') : st && st.plays ? h('span.muted', KS.plural(st.plays, 'play')) : null));
    })));
    root.appendChild(h('h2.section-title', '⚔️ Boss battles'));
    root.appendChild(h('p.muted', 'One per module. Beat a boss with at most two mistakes. Win before finishing a module and you can test out of it.'));
    root.appendChild(h('div.boss-grid', C.modules.map(function (m) { const b = S.state.bosses[m.id]; return h('a.boss-chip' + (b && b.passed ? '.won' : ''), { href: '#/boss/' + m.id, style: { '--wc': m.world.color }, title: m.title }, h('span', m.emoji), h('span.boss-chip-title', m.title), b && b.passed ? h('span.boss-chip-tick', '✓') : null); })));
    return root;
  };

  VIEWS.library = function (args) {
    const tab = args[0] || 'glossary'; const root = h('div.page.library');
    root.appendChild(pageHead('Library', 'Forgot what something means? Everything you have met — and everything you will — lives here.', h('button.btn', { type: 'button', onclick: function () { P.openSearch(); } }, U.icon('search', 16), 'Search everything')));
    root.appendChild(tabs([['glossary', '📖 Glossary'], ['sheets', '📄 Cheat sheets'], ['metaphors', '🎭 Metaphor bank'], ['oneliners', '💬 One-liners'], ['notes', '📝 My notes']], tab, '#/library/'));
    let body;
    if (tab === 'sheets') body = P.sheetsIndex(); else if (tab === 'metaphors') body = P.metaphors(); else if (tab === 'oneliners') body = P.oneLiners(); else if (tab === 'notes') body = P.notes(); else body = P.glossary();
    if (body._cleanup) cleanup = body._cleanup;
    root.appendChild(h('div.library-body', body));
    if (!C.allLoaded) { const off = KS.bus.on('content:all', function () { off(); if (isCur('library')) render(true); }); const prev = cleanup; cleanup = function () { off(); if (prev) prev(); }; }
    return root;
  };
  VIEWS.sheet = function (args) {
    const m = C.moduleById[args[0]]; const root = h('div.page.sheet-page');
    root.appendChild(crumbs([['Library', '#/library'], ['Cheat sheets', '#/library/sheets'], [m ? m.title : 'Sheet']]));
    if (m && !C.loaded[m.id] && !C.missing[m.id]) { root.appendChild(U.spinner('Loading…')); C.loadModule(m.id).then(function () { if (isCur('sheet', m.id)) render(true); }); return root; }
    root.appendChild(P.sheet(args[0]));
    if (m) root.appendChild(h('div.sheet-foot.no-print', h('a.btn', { href: '#/module/' + m.id }, 'Go to the module →')));
    return root;
  };

  VIEWS.roadmaps = function (args) {
    const list = KS.roadmaps || []; const id = args[0] || (list[0] && list[0].id); const rm = list.filter(function (r) { return r.id === id; })[0] || list[0];
    const root = h('div.page.roadmaps');
    root.appendChild(pageHead('Roadmaps', 'Keystone covers every topic on three roadmap.sh roadmaps. Tap any topic to see the lesson that teaches it.'));
    root.appendChild(tabs(list.map(function (r) { const p = C.roadmapProgress(r); return [r.id, r.emoji + ' ' + r.title + ' · ' + Math.round(p.pct * 100) + '%']; }), rm.id, '#/roadmaps/'));
    root.appendChild(P.roadmap(rm));
    return root;
  };

  VIEWS.me = function () {
    const root = h('div.page.me'); const lv = KS.game.level();
    root.appendChild(pageHead(S.state.profile.name ? S.state.profile.name + '’s profile' : 'Your profile', 'Level ' + lv.n + ' · ' + lv.title));
    root.appendChild(h('div.me-top', h('div.panel.me-level', U.mascot('happy', 84), h('div.me-level-main', P.levelBar(), h('p.muted.small', KS.fmtNum(lv.toGo) + ' XP until level ' + (lv.n + 1) + '.'))), h('div.panel', h('h3', 'Activity'), P.heatmap(22))));
    root.appendChild(P.stats());
    const earned = KS.game.achievements.filter(function (a) { return KS.game.earned(a.id); }).length;
    root.appendChild(h('h2.section-title', 'Achievements ', h('span.muted', earned + ' / ' + KS.game.achievements.length))); root.appendChild(P.achievements());
    root.appendChild(h('h2.section-title', 'Settings')); root.appendChild(h('div.panel', P.settings()));
    root.appendChild(h('h2.section-title', 'Your data')); root.appendChild(h('div.panel', P.data()));
    root.appendChild(h('h2.section-title', 'About')); root.appendChild(h('div.panel', KS.mdEl('**Keystone** is a free, self-hosted learning playground covering the [Backend](https://roadmap.sh/backend), [Software Design & Architecture](https://roadmap.sh/software-design-architecture) and [Software Architect](https://roadmap.sh/software-architect) roadmaps from roadmap.sh.\n\nIt is a static website: no accounts, no tracking, no server. Your progress lives in this browser. ' + (KS.offlineReady ? '**✓ Everything is cached — it works offline.**' : (navigator.serviceWorker && navigator.serviceWorker.controller) ? 'Once every file has downloaded it also works offline.' : 'Offline mode turns on when the site is hosted over HTTPS (it is off on localhost).') + '\n\nVersion ' + KS.version + '.')));
    return root;
  };

  // ====================================================================
  // focus views (full screen: lesson player, boss battles, games)
  // ====================================================================
  const FOCUS = {
    lesson: function (host, args) {
      const meta = C.meta(args[0]);
      const ctl = KS.player.mount(host, args[0], {
        onExit: function () { go(meta ? '#/module/' + meta.module.id : '#/journey'); },
        onOpenLesson: function (id) { go('#/lesson/' + id); }, onOpenModule: function (id) { go('#/module/' + id); }, onBoss: function (id) { go('#/boss/' + id); }
      });
      cleanup = function () { ctl.destroy(); };
    },
    boss: function (host, args) { const fr = KS.arcade.boss(host, args[0], { onExit: function () { go('#/module/' + args[0]); }, restart: function () { render(true); } }); cleanup = function () { fr.destroy(); }; },
    arcade: function (host, args) { const ctl = KS.arcade.mount(host, args[0], { onExit: function () { go('#/arcade'); } }); cleanup = function () { ctl.destroy(); }; }
  };

  // ====================================================================
  // router
  // ====================================================================
  function render(keepScroll) {
    const y = window.scrollY;
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    U.closePop(); P.closeSearch(); document.body.classList.remove('side-open');
    cur = parse();
    const focus = cur.name === 'lesson' || cur.name === 'boss' || (cur.name === 'arcade' && !!cur.args[0]);
    document.body.classList.toggle('focus-mode', focus);
    KS.clear(focusEl); KS.clear(viewEl);
    try {
      if (focus) FOCUS[cur.name](focusEl, cur.args);
      else {
        const fn = VIEWS[cur.name] || VIEWS.home; const el = fn(cur.args); if (el) viewEl.appendChild(el);
        drawSide(); drawTop(); window.scrollTo(0, keepScroll === true ? y : 0);
      }
    } catch (e) {
      console.error('[view ' + cur.name + ']', e);
      (focus ? focusEl : viewEl).appendChild(U.empty('💥', 'Something broke on this page', String(e && e.message || e), h('a.btn.primary', { href: '#/home' }, 'Back home')));
    }
    const meta = cur.name === 'lesson' ? C.meta(cur.args[0]) : null; const mod = cur.name === 'module' ? C.moduleById[cur.args[0]] : null;
    document.title = (meta ? meta.title + ' · ' : mod ? mod.title + ' · ' : '') + 'Keystone';
  }
  window.addEventListener('hashchange', function () { render(); });

  // ====================================================================
  // onboarding
  // ====================================================================
  function onboard() {
    let goal = 50;
    const name = h('input', { type: 'text', placeholder: 'What should we call you? (optional)', maxlength: '30', 'aria-label': 'Your name' });
    const goals = h('div.ob-goals', [[20, '🌱', 'Casual', '20 XP · a few questions'], [50, '🚶', 'Steady', '50 XP · half a lesson'], [100, '🏃', 'Serious', '100 XP · a lesson a day'], [200, '🚀', 'Intense', '200 XP · two lessons a day']].map(function (g) {
      const b = h('button.ob-goal' + (g[0] === goal ? '.on' : ''), { type: 'button', onclick: function () { goal = g[0]; KS.$$('.ob-goal', goals).forEach(function (x) { x.classList.toggle('on', x === b); }); } }, h('span.ob-goal-emoji', g[1]), h('b', g[2]), h('span.muted.small', g[3])); return b;
    }));
    U.modal({ dismiss: false, cls: 'onboard', wide: true, body: h('div.ob',
      h('div.ob-hero', U.mascot('happy', 96), h('div', h('h2', 'Welcome to Keystone'), h('p.muted', 'I’m Kip. I’ll take you from “I know loops and functions” to “I can explain how a real system fits together” — in small steps, with plenty to poke at.'))),
      h('div.ob-points', h('div', '🃏 ', h('b', 'Bite-sized cards'), ' with a metaphor for every idea'), h('div', '🧪 ', h('b', 'Labs'), ' where you break systems on purpose'), h('div', '🕹️ ', h('b', 'Games & flashcards'), ' so it actually sticks'), h('div', '📱 ', h('b', 'Pocket mode'), ' for the train (same progress)')),
      name, h('div.fb-sub', 'Pick a daily goal — you can change it later'), goals),
      actions: [{ label: 'Let’s go ▸', kind: 'primary', onClick: function () { S.state.profile = { name: name.value.trim(), u: Date.now() }; S.state.settings.goal = goal; S.flag('onboarded', true); render(); } }] });
  }

  // ====================================================================
  // boot
  // ====================================================================
  buildShell(); render();
  if (!S.flag('onboarded')) setTimeout(onboard, 250);

  const refreshChrome = KS.debounce(function () { if (!document.body.classList.contains('focus-mode')) { drawSide(); drawTop(); } }, 250);
  KS.bus.on('xp', refreshChrome);
  // Progress arrived from sync or another tab. Redraw the page, unless that would throw away something in
  // progress: a running lab, an open search box, or a lesson/boss/game (focus mode).
  KS.bus.on('imported', function () {
    U.applyTheme();
    if (document.body.classList.contains('focus-mode')) return;
    if ((isCur('lab') && labMounted) || P.searchOpen()) refreshChrome(); else render(true);
  });
  KS.bus.on('labs:ready', function () {
    KS.labs.allReady = true;
    if (isCur('lab') && labMounted === cur.args[0]) return;   // already running: don't restart it
    if (isCur('labs') || isCur('lab') || isCur('home') || isCur('module')) render(true);
  });

  document.addEventListener('keydown', function (e) {
    const tag = (e.target && e.target.tagName) || ''; const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); P.openSearch(); }
    else if (e.key === '/' && !typing && !document.body.classList.contains('focus-mode')) { e.preventDefault(); P.openSearch(); }
  });

  // background: labs, then the whole curriculum (so search, glossary and offline all work)
  KS.labs.whenReady().then(function () { return C.loadAll(); }).then(function () { KS.game.check(true); return KS.checkOffline(); }).then(function (ok) { KS.offlineReady = ok; });
  KS.sync.gist.auto();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/^(localhost|127.0.0.1)$/.test(location.hostname)) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* offline support is optional */ }); });
})();
