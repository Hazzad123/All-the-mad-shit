/* Keystone — shared panels used by both shells: stats, heatmap, achievements, library, roadmaps, settings, data, search. */
(function () {
  'use strict';
  const KS = window.KS, h = KS.h, S = KS.store, C = KS.content, U = KS.ui;
  const P = (KS.panels = {});

  // ---------- stats ----------
  P.stats = function () {
    const lv = KS.game.level(), st = S.streak(), ov = C.overall(), sr = KS.srs.counts();
    let labs = 0; if (KS.labs) KS.labs.list().forEach(function (l) { if (KS.labs.isComplete(l.id)) labs++; });
    let bosses = 0; for (const k in S.state.bosses) if (S.state.bosses[k].passed) bosses++;
    const tile = function (emoji, val, label) { return h('div.stat-tile', h('div.stat-emoji', emoji), h('div.stat-val', String(val)), h('div.stat-label', label)); };
    return h('div.stat-grid', tile('⚡', KS.fmtNum(lv.xp), 'total XP'), tile('🏅', 'Level ' + lv.n, lv.title), tile('🔥', st.current, 'day streak · best ' + st.best), tile('📘', ov.done + ' / ' + ov.total, 'lessons done'), tile('⚔️', bosses + ' / ' + C.modules.length, 'bosses beaten'), tile('🧪', labs + ' / ' + (KS.labs ? KS.labs.list().length : 0), 'labs completed'), tile('🃏', sr.total, 'flashcards in your deck'), tile('📅', st.activeDays, 'days studied'));
  };
  P.levelBar = function () {
    const lv = KS.game.level();
    return h('div.level-bar', h('div.level-top', h('b', 'Level ' + lv.n + ' · ' + lv.title), h('span.muted', KS.fmtNum(lv.xp - lv.floor) + ' / ' + KS.fmtNum(lv.next - lv.floor) + ' XP')), U.bar(lv.pct));
  };
  /** Activity heatmap for the last N weeks. */
  P.heatmap = function (weeks) {
    weeks = weeks || 16; const today = KS.dayNum(); const dow = (new Date().getDay() + 6) % 7; // Mon = 0
    const first = today - dow - (weeks - 1) * 7; const goal = S.state.settings.goal || 50;
    const grid = h('div.heat', { style: { '--weeks': weeks } });
    for (let w = 0; w < weeks; w++) for (let d = 0; d < 7; d++) {
      const day = first + w * 7 + d;
      if (day > today) { grid.appendChild(h('i.heat-cell.future')); continue; }
      const ds = KS.dayFromNum(day); const x = S.dayTotals(ds).x; const lvl = !x ? 0 : x < goal * 0.5 ? 1 : x < goal ? 2 : x < goal * 2 ? 3 : 4;
      grid.appendChild(h('i.heat-cell.l' + lvl + (day === today ? '.today' : ''), { title: ds + ': ' + x + ' XP' }));
    }
    return h('div.heat-wrap', grid, h('div.heat-legend', h('span', 'less'), [0, 1, 2, 3, 4].map(function (l) { return h('i.heat-cell.l' + l); }), h('span', 'more')));
  };
  P.week = function () {
    const today = KS.dayNum(); const names = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; const row = h('div.week-dots');
    for (let i = 6; i >= 0; i--) { const d = today - i; const ds = KS.dayFromNum(d); const on = S.dayTotals(ds).x > 0; const wd = new Date(d * 864e5).getUTCDay(); row.appendChild(h('div.week-dot' + (on ? '.on' : '') + (i === 0 ? '.today' : ''), h('i', on ? '🔥' : ''), h('span', names[wd]))); }
    return row;
  };
  P.goalRing = function (size) {
    const g = KS.game.goal();
    return U.ring(g.pct, size || 84, 9, h('div', h('div.goal-num', String(g.xp)), h('div.goal-of', '/ ' + g.goal + ' XP')));
  };
  P.achievements = function (onlyEarned) {
    const list = KS.game.achievements.filter(function (a) { return !onlyEarned || KS.game.earned(a.id); });
    if (!list.length) return h('p.muted', 'No achievements yet — finish a lesson to earn your first.');
    return h('div.ach-grid', list.map(function (a) { const ts = KS.game.earned(a.id); return h('div.ach' + (ts ? '.on' : ''), { title: a.desc + (ts ? ' — earned ' + new Date(ts).toLocaleDateString() : '') }, h('div.ach-ico', ts ? a.emoji : '🔒'), h('div.ach-title', a.title), h('div.ach-desc', a.desc)); }));
  };

  // ---------- library: glossary ----------
  P.glossary = function () {
    const input = h('input.gloss-filter', { type: 'search', placeholder: 'Filter terms…', 'aria-label': 'Filter glossary' });
    const info = h('div.muted.small.gloss-info'); const list = h('div.gloss-list');
    function draw() {
      const q = input.value.trim().toLowerCase(); const all = C.terms();
      const terms = q ? all.filter(function (g) { return g.term.toLowerCase().indexOf(q) >= 0 || g.def.toLowerCase().indexOf(q) >= 0; }) : all;
      info.textContent = (q ? terms.length + ' of ' : '') + all.length + ' terms' + (C.allLoaded ? '' : ' — still loading the rest of the curriculum…');
      KS.clear(list); let letter = '';
      const frag = document.createDocumentFragment();
      terms.slice(0, q ? 400 : 5000).forEach(function (g) {
        const L = (g.term.charAt(0).match(/[a-z]/i) ? g.term.charAt(0) : '#').toUpperCase();
        if (L !== letter) { letter = L; frag.appendChild(h('div.gloss-letter', L)); }
        const meta = C.meta(g.lessons[0]);
        frag.appendChild(h('div.gl-item', { id: 'term-' + g.slug }, h('div.gl-term', g.term), h('div.gl-def', { html: KS.md.inline(g.def) }), g.like ? h('div.gl-like', '🎭 ', h('span', { html: KS.md.inline(g.like) })) : null, meta ? h('a.gl-from', { href: '#/lesson/' + g.lessons[0] }, meta.module.title + ' › ' + meta.title) : null));
      });
      if (!terms.length) frag.appendChild(U.empty('🔎', 'No matching terms', q ? 'Try a shorter search.' : 'Terms appear here as lesson content loads.'));
      list.appendChild(frag);
    }
    input.addEventListener('input', KS.debounce(draw, 140));
    const off = KS.bus.on('content:all', draw);
    draw();
    const root = h('div.gloss', h('div.gloss-head', input, info), list);
    root._cleanup = off;
    return root;
  };
  // ---------- library: cheat sheets ----------
  P.sheetsIndex = function () {
    const grid = h('div.sheet-grid');
    C.worlds.forEach(function (w) {
      const have = w.modules.filter(function (m) { return C.sheets[m.id]; });
      if (!have.length) return;
      grid.appendChild(h('div.sheet-world', { style: { '--wc': w.color } }, h('div.sheet-world-title', w.emoji + ' ' + w.title), h('div.sheet-links', have.map(function (m) { return h('a.sheet-link', { href: '#/sheet/' + m.id }, h('span', m.emoji), h('span', m.title)); }))));
    });
    if (!grid.children.length) grid.appendChild(U.empty('📄', 'Cheat sheets are loading…', 'Each module comes with a one-page reference.'));
    return grid;
  };
  P.sheet = function (moduleId) {
    const s = C.sheets[moduleId]; const m = C.moduleById[moduleId];
    if (!s) return U.empty('📄', 'No cheat sheet yet', 'This module does not have a cheat sheet in this build.');
    const root = h('div.sheet', { style: { '--wc': m ? m.world.color : 'var(--accent)' } },
      h('div.sheet-head', h('div', h('div.sheet-kicker', (m ? m.world.emoji + ' ' + m.world.title + ' · ' : '') + 'Cheat sheet'), h('h1', s.title || (m ? m.title : moduleId))), h('button.btn.sm.no-print', { type: 'button', onclick: function () { window.print(); } }, '🖨 Print')),
      h('div.sheet-cols', (s.sections || []).map(function (x) { return h('section.sheet-sec', h('h3', x.title), KS.mdEl(x.md)); })));
    return root;
  };
  // ---------- library: metaphors + one-liners ----------
  P.metaphors = function () {
    const input = h('input.gloss-filter', { type: 'search', placeholder: 'Filter metaphors…', 'aria-label': 'Filter metaphors' }); const list = h('div.meta-list');
    function draw() {
      const q = input.value.trim().toLowerCase(); KS.clear(list);
      const all = C.metaphors().filter(function (m) { return !q || (m.title + ' ' + m.body).toLowerCase().indexOf(q) >= 0 || (C.meta(m.lessonId).title.toLowerCase().indexOf(q) >= 0); });
      if (!all.length) { list.appendChild(U.empty('🎭', 'No metaphors found', 'They appear as lesson content loads.')); return; }
      all.slice(0, 400).forEach(function (m) { const meta = C.meta(m.lessonId); list.appendChild(h('div.meta-card', { style: { '--wc': meta.world.color } }, h('a.meta-for', { href: '#/lesson/' + m.lessonId }, meta.title), h('div.meta-title', { html: KS.md.inline(m.title) }), KS.mdEl(m.body, 'div.md.meta-body'))); });
    }
    input.addEventListener('input', KS.debounce(draw, 160)); const off = KS.bus.on('content:all', draw); draw();
    const root = h('div.gloss', h('div.gloss-head', input, h('div.muted.small', 'Every “think of it like…” in the curriculum, in one place.')), list); root._cleanup = off; return root;
  };
  P.oneLiners = function () {
    const root = h('div.eli5');
    C.worlds.forEach(function (w) {
      const sec = h('section.eli5-world', { style: { '--wc': w.color } }, h('h3', w.emoji + ' ' + w.title));
      let any = false;
      w.modules.forEach(function (m) {
        const rows = m.lessons.filter(function (l) { return C.lessons[l.id] && C.lessons[l.id].eli5; });
        if (!rows.length) return; any = true;
        sec.appendChild(h('div.eli5-mod', h('div.eli5-mod-title', m.emoji + ' ' + m.title), rows.map(function (l) { return h('div.eli5-row', h('a', { href: '#/lesson/' + l.id }, l.title), h('span', { html: KS.md.inline(C.lessons[l.id].eli5) })); })));
      });
      if (any) root.appendChild(sec);
    });
    if (!root.children.length) root.appendChild(U.empty('💬', 'One-liners are loading…', 'Every lesson, explained in a single sentence.'));
    return root;
  };

  // ---------- roadmaps ----------
  P.roadmap = function (rm) {
    const prog = C.roadmapProgress(rm);
    const root = h('div.rm', h('div.rm-head', h('div', h('h2', rm.emoji + ' ' + rm.title), h('p.muted', rm.blurb)), h('a.btn.sm', { href: rm.url, target: '_blank', rel: 'noopener noreferrer' }, 'roadmap.sh ↗')),
      h('div.rm-progress', U.bar(prog.pct), h('span', prog.done + ' / ' + prog.nodes + ' topics complete')));
    rm.groups.forEach(function (g) {
      root.appendChild(h('div.rm-group', h('div.rm-group-title', g.title), h('div.rm-nodes', g.nodes.map(function (n) {
        const st = C.nodeState(rm, n[0]);
        return h('button.rm-node.s-' + st.state, { type: 'button', onclick: function () { nodeModal(rm, n, st); } }, st.state === 'done' ? h('span.rm-tick', '✓') : null, n[1]);
      }))));
    });
    return root;
  };
  function nodeModal(rm, n, st) {
    const body = h('div.rm-modal', h('p.muted', 'From the ' + rm.title + ' roadmap. Covered by:'), st.lessons.map(function (id) {
      const m = C.meta(id); const done = S.isDone(id);
      return h('a.rm-lesson', { href: '#/lesson/' + id, onclick: function () { modal.close(); } }, h('span.rm-lesson-ico' + (done ? '.done' : ''), done ? '✓' : '▶'), h('span', h('b', m.title), h('span.muted.small', ' · ' + m.world.emoji + ' ' + m.module.title)));
    }), !st.lessons.length ? h('p', 'No lesson covers this yet.') : null);
    const modal = U.modal({ title: n[1], body: body });
  }

  // ---------- settings ----------
  P.settings = function () {
    const st = S.state.settings;
    const row = function (label, sub, control) { return h('div.set-row', h('div.set-text', h('div.set-label', label), sub ? h('div.muted.small', sub) : null), h('div.set-ctl', control)); };
    const SW_LABEL = { sound: 'Sound effects', haptics: 'Vibration', motion: 'Animations', autolink: 'Tap-to-define' };
    const sw = function (key, after) { const i = h('input', { type: 'checkbox', 'aria-label': SW_LABEL[key] || key }); i.checked = !!st[key]; i.addEventListener('change', function () { st[key] = i.checked; S.save(); if (after) after(); }); return h('label.switch', i, h('span.switch-track', h('span.switch-knob'))); };
    const seg = function (key, opts, after, cast) { const el = h('div.seg', { role: 'group' }); opts.forEach(function (o) { const on = String(st[key]) === String(o[0]); const b = h('button' + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), onclick: function () { st[key] = cast ? cast(o[0]) : o[0]; S.save(); KS.$$('button', el).forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); }); if (after) after(); } }, o[1]); el.appendChild(b); }); return el; };
    const name = h('input', { type: 'text', value: S.state.profile.name || '', placeholder: 'Your name', maxlength: '30', 'aria-label': 'Your name' });
    name.addEventListener('input', KS.debounce(function () { S.state.profile = { name: name.value.trim(), u: Date.now() }; S.save(); }, 300));
    return h('div.settings',
      row('Name', 'Used to greet you. Stays on your device.', name),
      row('Theme', null, seg('theme', [['dark', 'Dark'], ['light', 'Light'], ['auto', 'Auto']], U.applyTheme)),
      row('Daily goal', 'XP to earn each day. One full lesson is worth roughly 80–100 XP.', seg('goal', [[20, 'Casual 20'], [50, 'Steady 50'], [100, 'Serious 100'], [200, 'Intense 200']], null, Number)),
      row('Sound effects', null, sw('sound', function () { if (st.sound) U.sfx('good'); })),
      row('Vibration', 'On phones that support it.', sw('haptics')),
      row('Animations', 'Turn off for less motion.', sw('motion', U.applyTheme)),
      row('Tap-to-define', 'Underline glossary words inside lessons so you can tap them.', sw('autolink')),
      row('Games draw questions from', 'Lessons you have finished, or the whole curriculum.', seg('scope', [['learned', 'What I’ve learned'], ['all', 'Everything']])));
  };

  // ---------- data: export / import / sync ----------
  P.data = function () {
    const file = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' } });
    file.addEventListener('change', function () {
      const f = file.files[0]; if (!f) return;
      KS.sync.importFile(f, 'merge').then(function () { U.toast('✅ Progress imported and merged.', 'good'); }).catch(function (e) { U.toast('Import failed: ' + e.message, 'bad', 5000); });
      file.value = '';
    });
    const cloud = h('div.cloud-box');
    function drawCloud() {
      KS.clear(cloud); const g = KS.sync.gist; const cfg = g.config();
      if (cfg.token) {
        cloud.appendChild(h('div.cloud-on', h('div', h('b', '☁️ Cloud sync is on'), h('div.muted.small', cfg.last ? 'Last synced ' + U.timeAgo(cfg.last) : 'Not synced yet'), cfg.error ? h('div.bad.small', 'Last error: ' + cfg.error) : null),
          h('div.cloud-btns', h('button.btn.sm.primary', { type: 'button', onclick: function (e) { const b = e.currentTarget; b.disabled = true; b.textContent = 'Syncing…'; g.sync().then(function () { U.toast('☁️ Synced.', 'good'); drawCloud(); }).catch(function (er) { U.toast('Sync failed: ' + er.message, 'bad', 5000); drawCloud(); }); } }, 'Sync now'),
            h('button.btn.sm.ghost', { type: 'button', onclick: function () { g.disconnect(); drawCloud(); U.toast('Cloud sync turned off on this device.'); } }, 'Turn off'))));
      } else {
        const tok = h('input', { type: 'password', placeholder: 'Paste a GitHub token with the “gist” permission', autocomplete: 'off', 'aria-label': 'GitHub token' });
        cloud.appendChild(h('details.cloud-setup', h('summary', '☁️ Set up automatic sync between devices (optional)'),
          KS.mdEl('Keystone has no server, so automatic sync uses a **secret (unlisted) GitHub Gist in your own account** as the save file. Secret gists are not listed or searchable, but anyone who has the exact link can read them.\n\n1. On GitHub go to **Settings → Developer settings → Personal access tokens → Fine-grained tokens** and create a token with only the **Gists: read and write** account permission.\n2. Paste it below on each device you use.\n\nThe token is stored only in this browser and is sent only to `api.github.com`. Prefer not to? Use the export / sync-code buttons above instead.'),
          h('div.cloud-row', tok, h('button.btn.primary', { type: 'button', onclick: function (e) {
            const v = tok.value.trim(); if (!v) return; const b = e.currentTarget; b.disabled = true; b.textContent = 'Connecting…';
            g.connect(v).then(function () { U.toast('☁️ Connected. Your progress now syncs.', 'good'); drawCloud(); }).catch(function (er) { b.disabled = false; b.textContent = 'Connect'; U.toast('Could not connect: ' + er.message, 'bad', 6000); });
          } }, 'Connect'))));
      }
    }
    drawCloud();
    return h('div.data-panel', file,
      h('div.data-row', h('div', h('b', 'Back up or move your progress'), h('div.muted.small', 'Progress is saved in this browser automatically. Export it to keep a copy or carry it to another device.')),
        h('div.data-btns', h('button.btn.sm', { type: 'button', onclick: function () { KS.sync.exportFile(); } }, U.icon('download', 16), 'Export file'), h('button.btn.sm', { type: 'button', onclick: function () { file.click(); } }, U.icon('upload', 16), 'Import file'))),
      h('div.data-row', h('div', h('b', 'Sync code'), h('div.muted.small', 'Copy a code here, paste it on your phone (or the other way round). Progress from both sides is merged — nothing is lost.')),
        h('div.data-btns', h('button.btn.sm', { type: 'button', onclick: function () { KS.sync.code().then(function (c) { return navigator.clipboard.writeText(c).then(function () { U.toast('📋 Sync code copied (' + Math.round(c.length / 1024) + ' KB).', 'good'); }); }).catch(function () { codeModal(); }); } }, 'Copy code'),
          h('button.btn.sm', { type: 'button', onclick: pasteModal }, 'Paste code'))),
      cloud,
      h('div.data-row.danger-row', h('div', h('b', 'Reset everything'), h('div.muted.small', 'Wipes all progress on this device, and on any device synced with it. Export first if you might want it back.')),
        h('div.data-btns', h('button.btn.sm.danger', { type: 'button', onclick: function () { U.confirm('Reset all progress?', 'This deletes your XP, streak, completed lessons, flashcards and notes **on this device and on any device synced with it**. It cannot be undone.', 'Yes, reset', true).then(function (ok) { if (ok) { S.reset(); U.toast('Progress reset.'); } }); } }, 'Reset progress'))));
  };
  function codeModal() {
    KS.sync.code().then(function (c) {
      const ta = h('textarea', { rows: '6', readonly: true }); ta.value = c;
      U.modal({ title: 'Your sync code', body: h('div', h('p.muted', 'Select all, copy, and paste it into “Paste code” on your other device.'), ta), actions: [{ label: 'Done', kind: 'primary' }] });
      setTimeout(function () { ta.focus(); ta.select(); }, 60);
    });
  }
  function pasteModal() {
    const ta = h('textarea', { rows: '6', placeholder: 'Paste a Keystone sync code here…' });
    U.modal({ title: 'Paste a sync code', body: h('div', h('p.muted', 'Progress in the code is merged with what is already on this device.'), ta), actions: [{ label: 'Cancel', kind: 'ghost' }, { label: 'Merge progress', kind: 'primary', onClick: function () {
      const v = ta.value.trim(); if (!v) return false;
      KS.sync.fromCode(v, 'merge').then(function () { U.toast('✅ Progress merged.', 'good'); }).catch(function (e) { U.toast('That code did not work: ' + e.message, 'bad', 5000); });
    } }] });
  }

  // ---------- notes ----------
  P.notes = function () {
    const ids = Object.keys(S.state.notes).filter(function (k) { return S.state.notes[k] && S.state.notes[k].t && C.meta(k); }).sort(function (a, b) { return (S.state.notes[b].u || 0) - (S.state.notes[a].u || 0); });
    if (!ids.length) return h('p.muted', 'No notes yet. Open the 📖 panel inside any lesson to jot things down.');
    return h('div.notes-list', ids.map(function (id) { const m = C.meta(id); return h('div.note-card', h('a.note-for', { href: '#/lesson/' + id }, m.world.emoji + ' ' + m.title), h('div.note-text', S.state.notes[id].t)); }));
  };

  // ---------- search palette ----------
  const TYPE_ICON = { term: '📖', lesson: '📘', module: '🧭', sheet: '📄', lab: '🧪' };
  let palette = null;
  P.searchOpen = function () { return !!palette; };
  P.closeSearch = function () { if (palette) { palette.remove(); palette = null; document.removeEventListener('keydown', palKey, true); } };
  let palKey = function () {};
  P.openSearch = function (initial) {
    P.closeSearch();
    const input = h('input.palette-input', { type: 'search', placeholder: 'Search lessons, terms, cheat sheets, labs…', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Search' });
    const results = h('div.palette-results'); const detail = h('div.palette-detail');
    const box = h('div.palette', h('div.palette-top', U.icon('search', 20), input, h('kbd', 'Esc')), results, detail);
    palette = h('div.palette-back', box);
    palette.addEventListener('mousedown', function (e) { if (e.target === palette) P.closeSearch(); });
    let items = [], sel = 0;
    function open(r) {
      if (r.type === 'term') { showTerm(r.id); return; }
      const hash = r.type === 'lesson' ? '#/lesson/' + r.id : r.type === 'module' ? '#/module/' + r.id : r.type === 'sheet' ? '#/sheet/' + r.id : '#/lab/' + r.id;
      P.closeSearch(); location.hash = hash;
    }
    function showTerm(slug) {
      const g = C.term(slug); if (!g) return;
      results.style.display = 'none'; KS.clear(detail); detail.style.display = '';
      detail.appendChild(h('button.link-btn', { type: 'button', onclick: function () { detail.style.display = 'none'; results.style.display = ''; input.focus(); } }, '← back to results'));
      detail.appendChild(h('h2', g.term)); detail.appendChild(h('p.palette-def', { html: KS.md.inline(g.def) }));
      if (g.like) detail.appendChild(h('p.palette-like', '🎭 ', h('span', { html: KS.md.inline(g.like) })));
      detail.appendChild(h('div.fb-sub', 'Taught in')); g.lessons.slice(0, 5).forEach(function (id) { const m = C.meta(id); if (m) detail.appendChild(h('a.rm-lesson', { href: '#/lesson/' + id, onclick: P.closeSearch }, h('span.rm-lesson-ico', '▶'), h('span', h('b', m.title), h('span.muted.small', ' · ' + m.module.title)))); });
    }
    function draw() {
      detail.style.display = 'none'; results.style.display = '';
      const q = input.value.trim(); KS.clear(results);
      if (!q) {
        const nx = C.nextUp();
        results.appendChild(h('div.palette-hint', h('p', '💡 Try ', h('b', 'idempotent'), ', ', h('b', 'JWT'), ', ', h('b', '401 vs 403'), ', ', h('b', 'CAP'), ' or ', h('b', 'load balancer'), '.'), nx ? h('a.rm-lesson', { href: '#/lesson/' + nx.id, onclick: P.closeSearch }, h('span.rm-lesson-ico', '▶'), h('span', h('b', 'Continue: ' + nx.title))) : null, !C.allLoaded ? h('p.muted.small', 'Still loading the full curriculum — term results will grow.') : null));
        items = []; return;
      }
      items = C.search(q, 24); sel = 0;
      if (!items.length) { results.appendChild(U.empty('🔎', 'Nothing found', 'Try a different word.')); return; }
      items.forEach(function (r, i) {
        results.appendChild(h('button.palette-item' + (i === 0 ? '.sel' : ''), { type: 'button', onclick: function () { open(r); }, onmousemove: function () { setSel(i); } },
          h('span.palette-ico', TYPE_ICON[r.type] || '•'), h('span.palette-main', h('span.palette-title', r.title), h('span.palette-sub', KS.plain(r.sub || '').slice(0, 140))), h('span.palette-type', r.type)));
      });
    }
    function setSel(i) { sel = i; KS.$$('.palette-item', results).forEach(function (el, k) { el.classList.toggle('sel', k === sel); }); }
    palKey = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); P.closeSearch(); }
      else if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); setSel((sel + 1) % items.length); const el = KS.$$('.palette-item', results)[sel]; if (el) el.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); setSel((sel - 1 + items.length) % items.length); const el = KS.$$('.palette-item', results)[sel]; if (el) el.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'Enter' && items[sel] && results.style.display !== 'none') { e.preventDefault(); open(items[sel]); }
    };
    document.addEventListener('keydown', palKey, true);
    input.addEventListener('input', KS.debounce(draw, 90));
    document.body.appendChild(palette);
    if (initial) input.value = initial;
    draw(); setTimeout(function () { input.focus(); }, 20);
  };
})();
