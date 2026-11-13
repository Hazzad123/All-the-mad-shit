/* Keystone Pocket — the one-thumb, two-minute version for trains and toilets. Same progress as Studio. */
(function () {
  'use strict';
  const KS = window.KS, h = KS.h, S = KS.store, C = KS.content, U = KS.ui, P = KS.panels;
  KS.shell = 'pocket';
  C.init(); U.applyTheme(); KS.game.touchSession();
  try { localStorage.setItem('keystone.shell', 'pocket'); } catch (e) { /* private mode */ }

  const app = document.getElementById('app');
  const TABS = [['today', 'home', 'Today'], ['learn', 'map', 'Learn'], ['play', 'game', 'Play'], ['me', 'user', 'Me']];
  let viewEl, tabEl, focusEl, cleanup = null, cur = { name: 'today', args: [] };

  function parse() { const p = location.hash.replace(/^#\/?/, '').split('/').map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } }); return { name: p[0] || 'today', args: p.slice(1) }; }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  function isCur(n) { return cur.name === n; }

  function build() {
    viewEl = h('main.pview'); focusEl = h('div.pfocus'); tabEl = h('nav.tabbar', { 'aria-label': 'Main' });
    app.appendChild(viewEl); app.appendChild(tabEl); app.appendChild(focusEl);
  }
  function drawTabs() {
    KS.clear(tabEl); const due = KS.srs.counts().due; const active = ({ lesson: 'learn', module: 'learn', boss: 'play' })[cur.name] || cur.name;
    TABS.forEach(function (t) { tabEl.appendChild(h('a.tab-item' + (active === t[0] ? '.on' : ''), { href: '#/' + t[0] }, U.icon(t[1], 24), h('span', t[2]), t[0] === 'play' && due ? h('i.tab-dot') : null)); });
  }
  function head(title, sub, right) { return h('header.phead', h('div', h('h1', title), sub ? h('p.muted', sub) : null), right || null); }
  function topBar() {
    const st = S.streak(), lv = KS.game.level();
    return h('div.ptop', h('a.pchip', { href: '#/me' }, '🔥 ' + st.current), h('a.pchip.xp', { href: '#/me' }, 'Lv ' + lv.n + ' · ⚡ ' + KS.fmtNum(lv.xp)), h('button.icon-btn', { type: 'button', 'aria-label': 'Search', onclick: function () { P.openSearch(); } }, U.icon('search')));
  }

  const V = {};
  V.today = function () {
    const root = h('div.page'); const nx = C.nextUp(); const sr = KS.srs.counts(); const ov = C.overall(); const fresh = !ov.done && !S.totalXp();
    const hr = new Date().getHours(); const nm = S.state.profile.name;
    root.appendChild(topBar());
    root.appendChild(head((hr < 12 ? 'Morning' : hr < 18 ? 'Afternoon' : 'Evening') + (nm ? ', ' + nm : '') + ' 👋', fresh ? 'Short bursts, big payoff. Pick something below.' : ov.done + ' of ' + ov.total + ' lessons done'));
    root.appendChild(h('div.pcard.goal', P.goalRing(78), h('div', h('div.pc-big', '🔥 ' + KS.plural(S.streak().current, 'day') + ' streak'), P.week())));
    // quick sessions
    root.appendChild(h('h2.psec', '⏱ Got two minutes?'));
    const q = function (href, emoji, title, sub, hot) { return h('a.pq' + (hot ? '.hot' : ''), { href: href }, h('span.pq-e', emoji), h('span.pq-t', title), h('span.pq-s', sub)); };
    root.appendChild(h('div.pq-grid',
      q('#/play/flash', '🃏', 'Flashcards', sr.due ? sr.due + ' due' : 'caught up', sr.due > 0),
      q('#/play/swipe', '👆', 'Fact or Cap?', 'swipe, 12 cards'),
      q('#/play/daily', '📅', 'Daily', S.day().d ? 'done ✓' : '+15 bonus XP', !S.day().d),
      q('#/play/rush', '❤️', 'Quiz Rush', '3 hearts')));
    if (nx) {
      const ls = S.peek(nx.id); const inProg = ls && ls.pos > 0 && !ls.done;
      root.appendChild(h('h2.psec', '📘 ' + (inProg ? 'Pick up where you left off' : fresh ? 'Start here' : 'Up next')));
      root.appendChild(h('a.pcard.hero', { href: '#/lesson/' + nx.id, style: { '--wc': nx.world.color } }, h('div.hero-k', nx.world.emoji + ' ' + nx.module.title), h('h3', nx.title), h('p.muted', nx.summary), h('span.btn.primary.block', (inProg ? 'Resume' : 'Start') + ' · ' + nx.mins + ' min')));
    }
    root.appendChild(h('a.plink', { href: 'index.html?studio', onclick: function () { try { localStorage.setItem('keystone.shell', 'studio'); } catch (e) { /* ok */ } } }, U.icon('monitor', 16), 'Open the full desktop Studio'));
    return root;
  };

  V.learn = function (args) {
    const root = h('div.page'); root.appendChild(topBar());
    if (args[0] && C.moduleById[args[0]]) return moduleView(root, C.moduleById[args[0]]);
    root.appendChild(head('Learn', 'Twelve worlds. Tap one to open its modules.'));
    const nx = C.nextUp();
    C.worlds.forEach(function (w) {
      const p = C.worldProgress(w);
      const box = h('details.pworld', { style: { '--wc': w.color } }, h('summary', h('span.pw-e', w.emoji), h('span.pw-main', h('b', w.title), h('span.muted.small', p.done + ' / ' + p.total + ' lessons')), U.ring(p.pct, 38, 5)),
        h('div.pw-mods', w.modules.map(function (m) { const mp = C.moduleProgress(m); return h('a.pw-mod' + (nx && nx.module.id === m.id ? '.here' : ''), { href: '#/learn/' + m.id }, h('span', m.emoji), h('span.pw-mt', m.title), h('span.muted.small', mp.done + '/' + mp.total)); })));
      if (nx && nx.world.id === w.id) box.open = true;
      root.appendChild(box);
    });
    return root;
  };
  function moduleView(root, m) {
    if (!C.loaded[m.id] && !C.missing[m.id]) C.loadModule(m.id).then(function () { if (isCur('learn')) render(true); });
    const p = C.moduleProgress(m); const nx = C.nextUp();
    root.appendChild(h('a.pback', { href: '#/learn' }, '‹ All worlds'));
    root.appendChild(head(m.emoji + ' ' + m.title, m.tagline));
    root.appendChild(U.bar(p.pct, 'wc'));
    const list = h('div.plist', { style: { '--wc': m.world.color } });
    m.lessons.forEach(function (l, i) {
      const ls = S.peek(l.id); const done = !!(ls && ls.done); const missing = C.loaded[m.id] && !C.lessons[l.id];
      list.appendChild(h('a.prow' + (done ? '.done' : '') + (nx && nx.id === l.id ? '.next' : '') + (missing ? '.missing' : ''), { href: '#/lesson/' + l.id }, h('span.pr-n', done ? '✓' : String(i + 1)), h('span.pr-main', h('b', l.title), h('span.muted.small', l.mins + ' min' + (l.lab ? ' · 🧪 lab' : '') + (missing ? ' · coming soon' : ''))), done ? U.stars(ls.stars) : null));
    });
    list.appendChild(h('a.prow.boss', { href: '#/boss/' + m.id }, h('span.pr-n', '⚔️'), h('span.pr-main', h('b', 'Boss battle'), h('span.muted.small', p.boss ? 'defeated ✓' : 'test yourself on the whole module'))));
    root.appendChild(list);
    if (C.sheets[m.id]) root.appendChild(h('a.plink', { href: '#/sheet/' + m.id }, '📄 Cheat sheet for this module'));
    return root;
  }

  V.play = function () {
    const root = h('div.page'); root.appendChild(topBar()); const sr = KS.srs.counts();
    root.appendChild(head('Play', 'Quick games from what you have learned.'));
    root.appendChild(h('div.pgames', KS.arcade.games.filter(function (g) { return !g.lab; }).map(function (g) {
      const hot = (g.id === 'flash' && sr.due) || (g.id === 'daily' && !S.day().d);
      return h('a.pgame' + (hot ? '.hot' : ''), { href: '#/play/' + g.id }, h('span.pg-e', g.emoji), h('div', h('b', g.title), h('div.muted.small', g.blurb)), h('span.pg-t', '~' + g.mins + 'm'));
    })));
    root.appendChild(h('h2.psec', '🧪 Labs'));
    root.appendChild(h('div.pgames', KS.labs.list().map(function (l) { const pr = KS.labs.progress(l.id); return h('a.pgame', { href: '#/lab/' + l.id }, h('span.pg-e', l.emoji || '🧪'), h('div', h('b', l.title), h('div.muted.small', l.blurb || '')), h('span.pg-t', pr.total ? pr.done + '/' + pr.total : '')); })));
    if (!KS.labs.list().length) root.appendChild(U.spinner('Loading labs…'));
    return root;
  };

  V.me = function () {
    const root = h('div.page'); const lv = KS.game.level();
    root.appendChild(head(S.state.profile.name || 'You', 'Level ' + lv.n + ' · ' + lv.title));
    root.appendChild(h('div.pcard', P.levelBar())); root.appendChild(P.stats());
    root.appendChild(h('h2.psec', 'Activity')); root.appendChild(h('div.pcard', P.heatmap(14)));
    root.appendChild(h('h2.psec', 'Library'));
    root.appendChild(h('div.pq-grid', [['#/lib/glossary', '📖', 'Glossary'], ['#/lib/sheets', '📄', 'Cheat sheets'], ['#/lib/metaphors', '🎭', 'Metaphors'], ['#/lib/oneliners', '💬', 'One-liners'], ['#/lib/roadmaps', '🧭', 'Roadmaps'], ['#/lib/notes', '📝', 'My notes']].map(function (x) { return h('a.pq', { href: x[0] }, h('span.pq-e', x[1]), h('span.pq-t', x[2])); })));
    root.appendChild(h('h2.psec', 'Achievements')); root.appendChild(P.achievements());
    root.appendChild(h('h2.psec', 'Settings')); root.appendChild(h('div.pcard', P.settings()));
    root.appendChild(h('h2.psec', 'Your data')); root.appendChild(h('div.pcard', P.data()));
    return root;
  };
  V.lib = function (args) {
    const root = h('div.page'); const t = args[0] || 'glossary';
    root.appendChild(h('a.pback', { href: '#/me' }, '‹ Me'));
    const body = ({ glossary: P.glossary, sheets: P.sheetsIndex, metaphors: P.metaphors, oneliners: P.oneLiners, notes: P.notes })[t];
    if (t === 'roadmaps') { (KS.roadmaps || []).forEach(function (rm) { root.appendChild(P.roadmap(rm)); }); return root; }
    root.appendChild(head(({ glossary: '📖 Glossary', sheets: '📄 Cheat sheets', metaphors: '🎭 Metaphor bank', oneliners: '💬 One-liners', notes: '📝 My notes' })[t] || 'Library'));
    const el = (body || P.glossary)(); if (el._cleanup) cleanup = el._cleanup; root.appendChild(el);
    if (!C.allLoaded) { const off = KS.bus.on('content:all', function () { off(); if (isCur('lib')) render(true); }); const prev = cleanup; cleanup = function () { off(); if (prev) prev(); }; }
    return root;
  };
  V.sheet = function (args) {
    const root = h('div.page'); const m = C.moduleById[args[0]];
    root.appendChild(h('a.pback', { href: m ? '#/learn/' + m.id : '#/me' }, '‹ Back'));
    if (m && !C.loaded[m.id] && !C.missing[m.id]) { root.appendChild(U.spinner('Loading…')); C.loadModule(m.id).then(function () { if (isCur('sheet')) render(true); }); return root; }
    root.appendChild(P.sheet(args[0])); return root;
  };

  const FOCUS = {
    lesson: function (host, a) { const meta = C.meta(a[0]); const ctl = KS.player.mount(host, a[0], { compact: true, onExit: function () { go(meta ? '#/learn/' + meta.module.id : '#/learn'); }, onOpenLesson: function (id) { go('#/lesson/' + id); }, onOpenModule: function (id) { go('#/learn/' + id); }, onBoss: function (id) { go('#/boss/' + id); } }); cleanup = function () { ctl.destroy(); }; },
    boss: function (host, a) { const fr = KS.arcade.boss(host, a[0], { compact: true, onExit: function () { go('#/learn/' + a[0]); }, restart: function () { render(true); } }); cleanup = function () { fr.destroy(); }; },
    play: function (host, a) { const ctl = KS.arcade.mount(host, a[0], { compact: true, onExit: function () { go('#/play'); }, onDone: function () { S.state.games.pocket = S.state.games.pocket || { hi: 0, plays: 0 }; S.state.games.pocket.plays++; S.save(); } }); cleanup = function () { ctl.destroy(); }; },
    lab: function (host, a) {
      const wrap = h('div.plab', h('header.game-top', h('button.icon-btn', { type: 'button', 'aria-label': 'Back', onclick: function () { go('#/play'); } }, U.icon('left')), h('div.game-title', (KS.labs.get(a[0]) || {}).title || 'Lab')), h('div.plab-body'));
      host.appendChild(wrap); const body = wrap.querySelector('.plab-body');
      const run = function () { const ctl = KS.labs.mount(body, a[0], { compact: true }); cleanup = function () { ctl.destroy(); }; };
      if (KS.labs.get(a[0])) run(); else { body.appendChild(U.spinner('Loading lab…')); KS.labs.whenReady().then(function () { KS.clear(body); if (KS.labs.get(a[0])) run(); else body.appendChild(U.empty('🚧', 'Lab not available yet', '')); }); }
    }
  };

  function render(keep) {
    const y = window.scrollY;
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    U.closePop(); P.closeSearch(); cur = parse();
    if (cur.name === 'play' && !cur.args[0]) cur.args = [];
    const focusName = cur.name === 'lesson' ? 'lesson' : cur.name === 'boss' ? 'boss' : cur.name === 'play' && cur.args[0] ? 'play' : cur.name === 'lab' ? 'lab' : null;
    document.body.classList.toggle('focus-mode', !!focusName);
    KS.clear(focusEl); KS.clear(viewEl);
    try {
      if (focusName) FOCUS[focusName](focusEl, cur.args);
      else { const el = (V[cur.name] || V.today)(cur.args); viewEl.appendChild(el); drawTabs(); window.scrollTo(0, keep === true ? y : 0); }
    } catch (e) { console.error(e); (focusName ? focusEl : viewEl).appendChild(U.empty('💥', 'Something broke', String(e && e.message || e), h('a.btn.primary', { href: '#/today' }, 'Back'))); }
  }
  window.addEventListener('hashchange', function () { render(); });
  build(); render();
  if (!S.flag('onboarded')) { S.flag('onboarded', true); }
  KS.bus.on('imported', function () { U.applyTheme(); if (!document.body.classList.contains('focus-mode')) render(true); });
  KS.bus.on('labs:ready', function () { if (isCur('play')) render(true); });
  KS.labs.whenReady().then(function () { return C.loadAll(); }).then(function () { KS.game.check(true); KS.offlineReady = true; });
  KS.sync.gist.auto();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/^(localhost|127.0.0.1)$/.test(location.hostname)) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
})();
