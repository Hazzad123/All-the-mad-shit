/* Keystone — arcade: flashcards (SRS), quick games, playlists and boss battles. Shared by Studio and Pocket. */
(function () {
  'use strict';
  const KS = window.KS, h = KS.h, S = KS.store, C = KS.content, U = KS.ui;
  const A = (KS.arcade = {});

  A.games = [
    { id: 'flash', emoji: '🃏', title: 'Flashcards', blurb: 'Spaced repetition: cards return just before you would forget them.', mins: 3 },
    { id: 'daily', emoji: '📅', title: 'Daily Challenge', blurb: 'Five fresh questions every day. Bonus XP the first time.', mins: 3 },
    { id: 'swipe', emoji: '👆', title: 'Fact or Cap?', blurb: 'True or false, rapid fire. Swipe or tap.', mins: 2 },
    { id: 'rush', emoji: '❤️', title: 'Quiz Rush', blurb: 'Twelve mixed questions, three hearts. Survive.', mins: 5 },
    { id: 'match', emoji: '🧩', title: 'Speed Match', blurb: 'Pair terms with their meanings against the clock.', mins: 2 },
    { id: 'guess', emoji: '🕵️', title: 'Name That Term', blurb: 'Read the definition, pick the jargon.', mins: 3 },
    { id: 'sorter', emoji: '🧺', title: 'This or That', blurb: 'Lightning sorting rounds.', mins: 3 },
    { id: 'detective', emoji: '🔎', title: 'Code Detective', blurb: 'Spot the bug. Pick the cleaner version.', mins: 4 },
    { id: 'estimator', emoji: '📏', title: 'Fermi Estimator', blurb: 'Back-of-the-envelope guesses. Within 3× wins.', mins: 3 },
    { id: 'incident', emoji: '🚨', title: 'Incident Room', blurb: 'A scenario where every decision has consequences.', mins: 5 },
    { id: 'weak', emoji: '🩹', title: 'Weak Spots', blurb: 'The questions you got wrong before. Fix them.', mins: 4 },
    { id: 'tycoon', emoji: '📈', title: 'Startup Survival', blurb: 'Scale an app from 100 users to 10 million without it melting.', mins: 15, lab: 'startup-survival' }
  ];
  A.game = function (id) { return A.games.filter(function (g) { return g.id === id; })[0] || null; };
  A.hi = function (id) { const g = S.state.games[id]; return g ? g.hi || 0 : 0; };
  function record(id, score) { const g = S.state.games[id] || (S.state.games[id] = { hi: 0, plays: 0 }); g.plays++; const best = score > (g.hi || 0); if (best) g.hi = score; S.save(); KS.game.queueCheck(); return best; }
  A.record = record;

  // ---------- frame ----------
  function frame(host, game, opts) {
    const stage = h('div.game-stage'); const hud = h('div.game-hud'); const fill = h('div.bar-fill'); const bar = h('div.bar.game-bar', fill);
    let closed = false;
    const fr = {
      stage: stage, hud: hud, opts: opts, game: game, timers: [],
      progress: function (p) { fill.style.width = Math.round(KS.clamp(p, 0, 1) * 100) + '%'; },
      exit: function () { if (opts.onExit) opts.onExit(); },
      every: function (ms, fn) { const t = setInterval(fn, ms); fr.timers.push(function () { clearInterval(t); }); return t; },
      after: function (ms, fn) { const t = setTimeout(fn, ms); fr.timers.push(function () { clearTimeout(t); }); return t; },
      keys: null,
      destroy: function () { if (closed) return; closed = true; fr.timers.forEach(function (f) { f(); }); document.removeEventListener('keydown', onKey); root.remove(); }
    };
    function onKey(e) {
      if (!root.isConnected || e.defaultPrevented) return; if (document.querySelector('.modal-back') || document.querySelector('.palette-back') || document.querySelector('.popover')) return;
      const tag = (e.target && e.target.tagName) || ''; if (tag === 'INPUT' || tag === 'TEXTAREA') { if (e.key === 'Escape') e.target.blur(); return; }
      if (e.key === 'Escape') { fr.exit(); return; }
      if (fr.keys && fr.keys(e)) e.preventDefault();
    }
    document.addEventListener('keydown', onKey);
    const root = h('div.game' + (opts.compact ? '.compact' : ''), { dataset: { game: game.id } },
      h('header.game-top', h('button.icon-btn', { type: 'button', 'aria-label': 'Exit', title: 'Exit (Esc)', onclick: function () { fr.exit(); } }, U.icon('x')), h('div.game-title', game.emoji + ' ' + game.title), bar, hud), stage);
    fr.root = root; host.appendChild(root);
    return fr;
  }
  /** End-of-game screen. res: { title, score, outOf, unit, xp, lines: [], best, mood } */
  function gameOver(fr, res, again) {
    fr.keys = null; KS.clear(fr.stage); KS.clear(fr.hud); fr.progress(1);
    const xp = res.xp ? KS.game.award(res.xp, { silent: true }) : 0;
    const best = res.record != null ? record(fr.game.id, res.record) : (record(fr.game.id, res.score || 0));
    const ratio = res.outOf ? res.score / res.outOf : 1;
    if (ratio >= 0.8 || res.win) { U.sfx('win'); if (ratio >= 0.99 || res.win) U.confetti({ count: 90 }); }
    fr.stage.appendChild(h('div.game-over', U.mascot(res.mood || (ratio >= 0.8 ? 'cool' : ratio >= 0.5 ? 'happy' : 'sad'), 92),
      h('h1', res.title || (ratio >= 0.99 ? 'Perfect!' : ratio >= 0.8 ? 'Great round!' : ratio >= 0.5 ? 'Not bad!' : 'Tough round.')),
      res.outOf != null ? h('div.game-score', h('b', String(res.score)), h('span', ' / ' + res.outOf + (res.unit ? ' ' + res.unit : ''))) : (res.big ? h('div.game-score', h('b', res.big)) : null),
      (res.lines || []).map(function (l) { return h('p.muted', { html: KS.md.inline(l) }); }),
      h('div.game-chips', xp ? U.chip('+' + xp + ' XP', 'warn') : null, best && (res.record || res.score) ? U.chip('🏆 New best', 'good') : null, U.chip('🔥 ' + S.streak().current + ' day streak')),
      h('div.game-over-actions', again ? h('button.btn.primary.lg', { type: 'button', onclick: again }, 'Play again') : null, res.extra || null, h('button.btn.lg' + (again ? '.ghost' : '.primary'), { type: 'button', onclick: function () { fr.exit(); } }, 'Done'))));
    if (fr.opts.onDone) fr.opts.onDone(res);
  }
  function nothing(fr, emoji, title, sub, extra) {
    KS.clear(fr.stage); fr.stage.appendChild(U.empty(emoji, title, sub, h('div.game-over-actions', extra || null, h('button.btn.primary', { type: 'button', onclick: function () { fr.exit(); } }, 'Back'))));
  }

  // ---------- flashcard widget ----------
  /** Renders one flashcard; calls onGrade(0..3) once graded. Returns {key(e)}. */
  function flashView(stage, card, onGrade, compact) {
    let flipped = false; const meta = C.meta(card.lessonId);
    const front = h('div.fc-face.fc-front', h('div.fc-tag', meta ? meta.world.emoji + ' ' + meta.title : ''), h('div.fc-text', { html: KS.md(card.q) }), h('div.fc-hint', compact ? 'Tap to reveal' : 'Click or press Space to reveal'));
    const back = h('div.fc-face.fc-back', h('div.fc-tag', 'Answer'), h('div.fc-text', { html: KS.md(card.a) }));
    const cardEl = h('button.fc', { type: 'button', 'aria-label': 'Flashcard — reveal the answer', onclick: flip }, h('div.fc-inner', front, back));
    const labels = [['Again', 'bad'], ['Hard', 'warn'], ['Good', 'good'], ['Easy', 'info']];
    const grades = h('div.fc-grades', labels.map(function (l, g) { return h('button.fc-grade.g-' + l[1], { type: 'button', onclick: function () { grade(g); } }, h('b', l[0]), h('span', KS.srs.label(KS.srs.preview(card.id, g)))); }));
    grades.style.visibility = 'hidden';
    const wrap = h('div.fc-wrap', cardEl, grades); stage.appendChild(wrap);
    function flip() { if (flipped) return; flipped = true; cardEl.classList.add('flipped'); grades.style.visibility = ''; U.sfx('flip'); }
    let done = false;
    function grade(g) { if (!flipped || done) return; done = true; onGrade(g); }
    // swipe: left = again, right = good
    let tx = 0; cardEl.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    cardEl.addEventListener('touchend', function (e) { const dx = e.changedTouches[0].clientX - tx; if (!flipped || Math.abs(dx) < 70) return; grade(dx > 0 ? 2 : 0); }, { passive: true });
    return { key: function (e) { if (e.key === ' ' || e.key === 'Enter') { flip(); return true; } const n = +e.key; if (flipped && n >= 1 && n <= 4) { grade(n - 1); return true; } return false; } };
  }

  // ---------- generic playlist ----------
  /**
   * A.playlist(host, { game: {id, emoji, title}, items: [{t:'act', a, key} | {t:'flash', card} | {t:'card', card}],
   *                    hearts, xpPer, bonus, compact, onExit, onAgain, onDone, title })
   */
  A.playlist = function (host, cfg) {
    const fr = frame(host, cfg.game, cfg); const items = cfg.items; let i = 0, right = 0, graded = 0, xp = 0, hearts = cfg.hearts || 0, combo = 0, bestCombo = 0, reviewed = 0;
    const requeue = [];
    function hud() { KS.clear(fr.hud); if (cfg.hearts) fr.hud.appendChild(h('span.hearts', '❤️'.repeat(Math.max(0, hearts)) + '🖤'.repeat(Math.max(0, cfg.hearts - hearts)))); else if (graded) fr.hud.appendChild(h('span.game-count', right + ' ✓')); if (combo >= 3) fr.hud.appendChild(h('span.combo', '🔥 ' + combo)); }
    function next() {
      fr.keys = null; KS.clear(fr.stage); fr.stage.scrollTop = 0; hud(); fr.progress(i / Math.max(1, items.length));
      if (i >= items.length || (cfg.hearts && hearts <= 0)) return end();
      const it = items[i]; i++;
      const wrap = h('div.game-item.pop-in'); fr.stage.appendChild(wrap);
      if (it.t === 'flash') {
        const fv = flashView(wrap, it.card, function (g) { KS.srs.grade(it.card.id, g); reviewed++; xp += 1; if (g === 0 && !it.again) { items.push({ t: 'flash', card: it.card, again: true }); } U.sfx(g === 0 ? 'meh' : 'pop'); next(); }, cfg.compact);
        fr.keys = fv.key;
      } else if (it.t === 'card') {
        wrap.appendChild(KS.cards.render(it.card));
        const b = h('button.btn.primary.lg', { type: 'button', onclick: function () { if (wrap.firstChild._advance && wrap.firstChild._advance()) return; next(); } }, 'Got it');
        wrap.appendChild(h('div.act-foot', b)); fr.keys = function (e) { if (e.key === 'Enter' || e.key === 'ArrowRight') { b.click(); return true; } return false; };
      } else {
        if (it.lessonId || it.key) { const m = C.meta(it.lessonId || String(it.key).split(':')[0]); if (m) wrap.appendChild(h('div.game-from', m.world.emoji + ' ' + m.title)); }
        const inst = KS.act.mount(wrap, it.a, { compact: cfg.compact, key: it.key, continueLabel: 'Next', onResult: function (res) {
          graded++; if (it.key) S.recordAct(it.key, res.correct);
          if (res.score >= 0.6) { right++; combo++; if (combo > bestCombo) bestCombo = combo; xp += Math.round((cfg.xpPer || 3) * res.score); } else { combo = 0; if (cfg.hearts) { hearts--; U.buzz([40, 40, 40]); } }
          hud();
        }, onContinue: next });
        fr.keys = function (e) { if ((e.key === 'Enter' || e.key === 'ArrowRight')) { const b = wrap.querySelector('.act-main'); if (b && !b.disabled && b.offsetParent) { b.click(); return true; } } return inst.key(e); };
      }
    }
    function end() {
      const dead = cfg.hearts && hearts <= 0; const lines = [];
      if (reviewed) lines.push('🃏 ' + KS.plural(reviewed, 'flashcard') + ' reviewed.');
      if (bestCombo >= 3) lines.push('🔥 Best streak: ' + bestCombo + ' in a row.');
      if (cfg.lines) cfg.lines.forEach(function (l) { lines.push(l); });
      const bonus = !dead && cfg.bonus ? cfg.bonus(right, graded) : 0;
      gameOver(fr, { title: dead ? 'Out of hearts!' : cfg.endTitle, mood: dead ? 'sad' : null, score: right, outOf: graded || null, big: graded ? null : (reviewed ? reviewed + ' reviewed' : 'Done'), xp: xp + bonus, lines: lines, record: cfg.recordScore ? cfg.recordScore(right, graded) : right }, cfg.onAgain);
    }
    if (!items.length) nothing(fr, cfg.emptyEmoji || '🌱', cfg.emptyTitle || 'Nothing to play yet', cfg.emptySub || 'Finish a lesson or two and come back.'); else next();
    return fr;
  };
  function actItems(list) { return list.map(function (x) { return { t: 'act', a: x.a, key: x.key, lessonId: x.lessonId }; }); }

  // ---------- flashcards (SRS) ----------
  function playFlash(host, opts) {
    const game = A.game('flash'); const due = KS.srs.due(opts.limit || 30);
    if (!due.length) {
      const fr = frame(host, game, opts); const counts = KS.srs.counts();
      nothing(fr, counts.total ? '🎉' : '🃏', counts.total ? 'All caught up!' : 'No flashcards yet', counts.total ? 'Nothing is due right now. ' + counts.total + ' cards are scheduled for later — that is the point: you only review what you are about to forget.' : 'Finish a lesson and its flashcards join your deck automatically.',
        counts.total ? h('button.btn', { type: 'button', onclick: function () { fr.destroy(); A.playlist(host, Object.assign({}, opts, { game: game, items: KS.srs.due(15, { fill: true }).map(function (c) { return { t: 'flash', card: c }; }), onAgain: null })); } }, 'Practise ahead anyway') : null);
      return fr;
    }
    return A.playlist(host, Object.assign({}, opts, { game: game, items: due.map(function (c) { return { t: 'flash', card: c }; }), endTitle: 'Deck done!', onAgain: KS.srs.counts().due > due.length ? function () { opts.restart(); } : null }));
  }

  // ---------- Fact or Cap (true / false swipe) ----------
  function playSwipe(host, opts) {
    const game = A.game('swipe'); const fr = frame(host, game, opts);
    const pool = KS.sampleN(C.poolSmart({ types: ['tf'] }, 8), 12); let i = 0, right = 0, combo = 0, best = 0, locked = false;
    if (!pool.length) { nothing(fr, '🌱', 'No statements yet', 'Finish a lesson first.'); return fr; }
    function show() {
      KS.clear(fr.stage); fr.progress(i / pool.length); KS.clear(fr.hud); fr.hud.appendChild(h('span.game-count', right + ' ✓')); if (combo >= 3) fr.hud.appendChild(h('span.combo', '🔥 ' + combo));
      if (i >= pool.length) return gameOver(fr, { score: right, outOf: pool.length, xp: right * 2, lines: best >= 3 ? ['🔥 Best streak: ' + best] : [] }, function () { opts.restart(); });
      const it = pool[i]; locked = false; const meta = C.meta(it.lessonId);
      const card = h('div.sw-card.pop-in', h('div.fc-tag', meta ? meta.world.emoji + ' ' + meta.title : ''), h('div.sw-text', { html: KS.md.inline(it.a.statement) }));
      const fb = h('div.sw-fb');
      const bF = h('button.sw-btn.sw-false', { type: 'button', onclick: function () { answer(false); } }, h('span', '✗'), 'Cap');
      const bT = h('button.sw-btn.sw-true', { type: 'button', onclick: function () { answer(true); } }, h('span', '✓'), 'Fact');
      fr.stage.appendChild(h('div.sw-wrap', card, fb, h('div.sw-row', bF, bT), h('div.muted.small.sw-hint', opts.compact ? 'Swipe right for fact, left for cap' : '← Cap · Fact →')));
      let tx = 0, dragging = false;
      card.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; dragging = true; card.style.transition = 'none'; }, { passive: true });
      card.addEventListener('touchmove', function (e) { if (!dragging || locked) return; const dx = e.touches[0].clientX - tx; card.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 22 + 'deg)'; card.classList.toggle('lean-t', dx > 40); card.classList.toggle('lean-f', dx < -40); }, { passive: true });
      card.addEventListener('touchend', function (e) { dragging = false; card.style.transition = ''; const dx = e.changedTouches[0].clientX - tx; card.style.transform = ''; card.classList.remove('lean-t', 'lean-f'); if (Math.abs(dx) > 80) answer(dx > 0); }, { passive: true });
      function answer(v) {
        if (locked) return; locked = true; const ok = v === !!it.a.answer; S.recordAct(it.key, ok);
        if (ok) { right++; combo++; if (combo > best) best = combo; U.sfx('good'); U.buzz(12); } else { combo = 0; U.sfx('bad'); U.buzz([30, 40, 30]); }
        card.classList.add(ok ? 'ok' : 'no'); bF.disabled = bT.disabled = true; (it.a.answer ? bT : bF).classList.add('right');
        fb.className = 'sw-fb show ' + (ok ? 'ok' : 'no'); fb.innerHTML = '<b>' + (ok ? '✓ ' : '✗ ') + (it.a.answer ? 'Fact.' : 'Cap.') + '</b> ' + KS.md.inline(it.a.explain || '');
        const nb = h('button.btn.primary', { type: 'button', onclick: function () { i++; show(); } }, 'Next'); fb.appendChild(h('div.sw-next', nb));
        fr.keys = function (e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') { nb.click(); return true; } return false; };
        if (ok) fr.after(KS.reduceMotion() ? 900 : 1500, function () { if (locked && pool[i] === it) { i++; show(); } });
      }
      fr.keys = function (e) { if (e.key === 'ArrowRight' || e.key.toLowerCase() === 't') { answer(true); return true; } if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'f') { answer(false); return true; } return false; };
    }
    show(); return fr;
  }

  // ---------- Speed Match ----------
  function termPool() {
    const scope = S.state.settings.scope; let terms = [];
    const done = C.order.filter(function (id) { return S.isDone(id); });
    const ids = scope === 'all' || done.length < 2 ? C.order : done;
    const seen = {};
    ids.forEach(function (id) { const L = C.lessons[id]; if (!L) return; (L.glossary || []).forEach(function (g) { const s = KS.slug(g.term); if (!seen[s] && g.def) { seen[s] = 1; terms.push({ term: g.term, def: g.def, like: g.like, lessonId: id }); } }); });
    if (terms.length < 8) { terms = []; C.terms().forEach(function (g) { terms.push({ term: g.term, def: g.def, like: g.like, lessonId: g.lessons[0] }); }); }
    return terms;
  }
  function short(s, n) { s = KS.plain(s); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }
  function playMatch(host, opts) {
    const game = A.game('match'); const fr = frame(host, game, opts); const terms = KS.sampleN(termPool(), 6);
    if (terms.length < 4) { nothing(fr, '🌱', 'Not enough terms yet', 'Finish a lesson to collect some jargon.'); return fr; }
    const tiles = []; terms.forEach(function (t, i) { tiles.push({ i: i, text: t.term, kind: 'term' }); tiles.push({ i: i, text: short(t.def, 96), kind: 'def' }); });
    let sel = null, matched = 0, mistakes = 0; const t0 = Date.now(); const clock = h('span.game-count', '0.0s');
    fr.hud.appendChild(clock); const tick = fr.every(100, function () { clock.textContent = ((Date.now() - t0) / 1000 + mistakes * 3).toFixed(1) + 's'; });
    const grid = h('div.sm-grid');
    KS.shuffle(tiles).forEach(function (t) {
      const b = h('button.sm-tile.k-' + t.kind, { type: 'button', onclick: function () { pick(t, b); } }, t.text); t.el = b; grid.appendChild(b);
    });
    fr.stage.appendChild(h('div.sm-wrap', h('p.muted.small', 'Tap a term, then its meaning. Each mistake costs 3 seconds.'), grid));
    function pick(t, b) {
      if (b.classList.contains('done')) return;
      if (!sel) { sel = t; b.classList.add('sel'); U.sfx('tap'); return; }
      if (sel === t) { sel = null; b.classList.remove('sel'); return; }
      if (sel.i === t.i && sel.kind !== t.kind) {
        [sel.el, b].forEach(function (x) { x.classList.remove('sel'); x.classList.add('done', 'm' + (matched % 6)); x.disabled = true; }); matched++; U.sfx('pop'); sel = null; fr.progress(matched / terms.length);
        if (matched === terms.length) { clearInterval(tick); const secs = (Date.now() - t0) / 1000 + mistakes * 3; const pts = Math.max(50, Math.round(700 - secs * 8)); gameOver(fr, { title: secs < 25 ? 'Lightning fast!' : 'All matched!', big: secs.toFixed(1) + 's', xp: Math.max(4, 12 - mistakes * 2), lines: [mistakes ? KS.plural(mistakes, 'mistake') + ' (+' + mistakes * 3 + 's)' : 'No mistakes 👌', 'Score: **' + pts + '**'], record: pts, win: mistakes === 0 }, function () { opts.restart(); }); }
      } else {
        mistakes++; const a = sel.el; [a, b].forEach(function (x) { x.classList.remove('sel'); x.classList.add('shake'); setTimeout(function () { x.classList.remove('shake'); }, 420); }); sel = null; U.sfx('bad'); U.buzz([20, 30, 20]);
      }
    }
    return fr;
  }

  // ---------- Name That Term ----------
  function playGuess(host, opts) {
    const game = A.game('guess'); const fr = frame(host, game, opts); const all = termPool();
    if (all.length < 6) { nothing(fr, '🌱', 'Not enough terms yet', 'Finish a lesson to collect some jargon.'); return fr; }
    const rounds = KS.sampleN(all, 8); let i = 0, score = 0, right = 0;
    function mask(def, term) { const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'); return KS.plain(def).replace(rx, '▁▁▁'); }
    function show() {
      KS.clear(fr.stage); fr.progress(i / rounds.length); KS.clear(fr.hud); fr.hud.appendChild(h('span.game-count', score + ' pts'));
      if (i >= rounds.length) return gameOver(fr, { score: right, outOf: rounds.length, xp: right * 2, lines: ['Score: **' + score + '**'], record: score }, function () { opts.restart(); });
      const t = rounds[i]; let hinted = false, done = false;
      const others = KS.sampleN(all.filter(function (x) { return x.term !== t.term; }), 3); const options = KS.shuffle([t].concat(others));
      const hintBox = h('div.gs-hint');
      const hintBtn = t.like ? h('button.link-btn', { type: 'button', onclick: function () { hinted = true; hintBtn.remove(); hintBox.innerHTML = '🎭 <i>' + KS.md.inline(mask(t.like, t.term)) + '</i>'; } }, 'Need a hint? (−3 pts)') : null;
      const opts2 = h('div.opts'); const btns = [];
      options.forEach(function (o, k) { const b = h('button.opt', { type: 'button', onclick: function () { choose(o, b); } }, h('span.opt-key', String(k + 1)), h('span.opt-txt', o.term)); btns.push(b); opts2.appendChild(b); });
      fr.stage.appendChild(h('div.gs-wrap.pop-in', h('div.act-kind', '🕵️ Which term is this?'), h('div.gs-def', mask(t.def, t.term)), hintBox, hintBtn, opts2));
      function choose(o, b) {
        if (done) return; done = true; const ok = o === t;
        btns.forEach(function (x, k) { x.disabled = true; if (options[k] === t) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); else x.classList.add('dim'); });
        if (ok) { right++; score += hinted ? 7 : 10; U.sfx('good'); } else { U.sfx('bad'); U.buzz([30, 40, 30]); }
        const nb = h('button.btn.primary', { type: 'button', onclick: function () { i++; show(); } }, 'Next');
        fr.stage.firstChild.appendChild(h('div.act-foot', nb)); fr.keys = function (e) { if (e.key === 'Enter' || e.key === 'ArrowRight') { nb.click(); return true; } return false; };
        if (ok) fr.after(900, function () { if (rounds[i] === t && done) { i++; show(); } });
      }
      fr.keys = function (e) { const n = +e.key; if (n >= 1 && n <= btns.length) { btns[n - 1].click(); return true; } return false; };
    }
    show(); return fr;
  }

  // ---------- boss battle ----------
  A.boss = function (host, moduleId, opts) {
    opts = opts || {}; const m = C.moduleById[moduleId];
    const game = { id: 'boss', emoji: '⚔️', title: 'Boss Battle' }; const fr = frame(host, game, opts);
    if (!m) { nothing(fr, '🧭', 'Module not found', ''); return fr; }
    fr.stage.appendChild(U.spinner('Summoning the boss…'));
    C.loadModule(moduleId).then(function () { if (fr.root.isConnected) intro(); });
    function build() {
      const b = C.bosses[moduleId]; let qs = b && b.questions ? b.questions.map(function (q, i) { return { a: q, key: 'boss-' + moduleId + ':' + i }; }) : [];
      const extra = C.pool({ scope: m.lessons.map(function (l) { return l.id; }), types: ['mcq', 'multi', 'tf', 'cloze', 'order', 'short', 'match', 'bucket'] });
      qs = qs.concat(KS.sampleN(extra, Math.max(0, 12 - qs.length) + 2));
      return KS.shuffle(qs).slice(0, 14);
    }
    function intro() {
      KS.clear(fr.stage); const b = C.bosses[moduleId]; const prev = S.state.bosses[moduleId]; const prog = C.moduleProgress(m);
      const qs = build();
      if (qs.length < 5) { nothing(fr, '🚧', 'This boss is not ready yet', 'The module needs its content first.'); return; }
      fr.stage.appendChild(h('div.boss-intro', { style: { '--wc': m.world.color } }, h('div.boss-emoji', m.emoji), h('div.boss-kicker', 'Boss battle · ' + m.title), h('h1', (b && b.title) || 'The ' + m.title + ' Boss'),
        h('p.boss-text', (b && b.intro) || 'Everything from this module, mixed up. Show it who is boss.'),
        h('ul.boss-rules', h('li', '⚔️ ' + qs.length + ' questions from across the module'), h('li', '❤️ Three hearts — a wrong answer costs one'), h('li', '🏆 Win with at most two mistakes: +50 XP')),
        prev && prev.passed ? h('p.good', '✓ You have beaten this boss. Best: ' + Math.round((prev.best || 0) * 100) + '%') : null,
        !prog.complete ? h('p.muted.small', 'Already know this topic? Beat the boss and you can mark the whole module as done.') : null,
        h('button.btn.boss-btn.lg', { type: 'button', onclick: function () { fight(qs); } }, 'Fight!')));
      fr.keys = function (e) { if (e.key === 'Enter') { fight(qs); return true; } return false; };
    }
    function fight(qs) {
      let i = 0, hearts = 3, right = 0; const maxHp = qs.length;
      const hpFill = h('div.boss-hp-fill'); const heartsEl = h('span.hearts');
      const head = h('div.boss-head', h('div.boss-you', heartsEl), h('div.boss-hp', h('div.boss-hp-label', m.emoji + ' Boss'), h('div.boss-hp-track', hpFill)));
      function hud() { heartsEl.textContent = '❤️'.repeat(hearts) + '🖤'.repeat(3 - hearts); hpFill.style.width = Math.round((1 - right / maxHp) * 100) + '%'; }
      function next() {
        KS.clear(fr.stage); fr.stage.appendChild(head); hud(); fr.progress(i / qs.length);
        if (hearts <= 0 || i >= qs.length) return end();
        const q = qs[i]; i++; const wrap = h('div.game-item.pop-in'); fr.stage.appendChild(wrap);
        const inst = KS.act.mount(wrap, q.a, { compact: opts.compact, continueLabel: 'Next', onResult: function (res) {
          if (res.score >= 0.6) { right++; head.classList.remove('hit'); void head.offsetWidth; head.classList.add('hit'); } else { hearts--; head.classList.remove('hurt'); void head.offsetWidth; head.classList.add('hurt'); U.buzz([50, 40, 50]); }
          if (q.key.indexOf('boss-') !== 0) S.recordAct(q.key, res.correct);
          hud();
        }, onContinue: next });
        fr.keys = function (e) { if (e.key === 'Enter' || e.key === 'ArrowRight') { const b = wrap.querySelector('.act-main'); if (b && !b.disabled && b.offsetParent) { b.click(); return true; } } return inst.key(e); };
      }
      function end() {
        const won = hearts > 0; const asked = i; const ratio = asked ? right / asked : 0;
        const st = S.state.bosses[moduleId] || (S.state.bosses[moduleId] = { best: 0, passed: 0, tries: 0 }); st.tries++; const first = won && !st.passed;
        if (won) { st.best = Math.max(st.best || 0, ratio); if (!st.passed) st.passed = Date.now(); }
        S.save();
        const prog = C.moduleProgress(m); let extra = null;
        if (won && !prog.complete) extra = h('button.btn.lg', { type: 'button', onclick: function (e) {
          m.lessons.forEach(function (l) { const ls = S.lesson(l.id); if (!ls.done) { ls.done = Date.now(); ls.stars = Math.max(ls.stars || 0, 1); ls.t = Date.now(); KS.srs.unlock(l.id); } });
          S.save(); KS.game.queueCheck(); e.currentTarget.disabled = true; e.currentTarget.textContent = '✓ Module marked as done'; U.toast('Tested out of **' + m.title + '**. Its flashcards joined your deck.', 'good');
        } }, 'Mark the whole module as done');
        gameOver(fr, { win: won, title: won ? 'Boss defeated!' : 'The boss wins… this time.', mood: won ? 'cool' : 'sad', score: right, outOf: asked, xp: (first ? 50 : won ? 10 : 0) + right, lines: [won ? (first ? '🏆 First victory: **+50 XP**' : 'Another win for the trophy cabinet.') : 'Re-read the cheat sheet and come back swinging.'], record: Math.round(ratio * 100), extra: extra }, function () { opts.restart ? opts.restart() : (KS.clear(host), A.boss(host, moduleId, opts)); });
      }
      next();
    }
    return fr;
  };

  // ---------- launcher ----------
  const QUICK = ['mcq', 'multi', 'tf', 'cloze', 'order', 'short'];
  /** Mount a game by id. opts: { compact, onExit, onDone }. Returns {destroy}. */
  A.mount = function (host, id, opts) {
    opts = Object.assign({}, opts || {}); const game = A.game(id);
    let current = null, dead = false;
    const ctl = { destroy: function () { dead = true; if (current && current.destroy) current.destroy(); } };
    opts.restart = function () { if (current && current.destroy) current.destroy(); start(); };
    if (!game) { host.appendChild(U.empty('🕹️', 'Unknown game', '')); return ctl; }
    if (game.lab) { // labs live in the lab kit
      const fr = frame(host, game, opts); current = fr; let lab = null;
      const go = function () { if (dead) return; KS.clear(fr.stage); lab = KS.labs.mount(fr.stage, game.lab, { compact: opts.compact }); };
      if (KS.labs.whenReady) { fr.stage.appendChild(U.spinner('Loading…')); KS.labs.whenReady().then(go); } else go();
      const d0 = fr.destroy; fr.destroy = function () { if (lab) lab.destroy(); d0(); };
      return ctl;
    }
    const loading = h('div.game', U.spinner('Loading questions…')); host.appendChild(loading);
    const need = id === 'flash' ? Promise.all(Object.keys(S.state.srs).map(function (k) { return k.split('#')[0]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (lid) { return C.loadLesson(lid); })) : C.loadAll();
    need.then(function () { loading.remove(); if (!dead) start(); });
    function start() {
      const again = function () { opts.restart(); };
      const base = { game: game, compact: opts.compact, onExit: opts.onExit, onDone: opts.onDone, onAgain: again };
      if (id === 'flash') current = playFlash(host, opts);
      else if (id === 'swipe') current = playSwipe(host, opts);
      else if (id === 'match') current = playMatch(host, opts);
      else if (id === 'guess') current = playGuess(host, opts);
      else if (id === 'rush') current = A.playlist(host, Object.assign(base, { hearts: 3, xpPer: 3, items: actItems(KS.sampleN(C.poolSmart({ types: QUICK }, 8), 12)), bonus: function (r, g) { return g >= 12 && r >= 10 ? 10 : 0; } }));
      else if (id === 'daily') {
        const rnd = KS.rng('daily-' + KS.today()); let pool = C.pool({ types: QUICK.concat(['match', 'bucket']), scope: 'learned' }); if (pool.length < 15) pool = C.pool({ types: QUICK.concat(['match', 'bucket']), scope: 'all' });
        const first = !S.dayTotals().d;
        current = A.playlist(host, Object.assign(base, { items: actItems(KS.sampleN(pool, 5, rnd)), xpPer: 4, onAgain: null, endTitle: 'Daily challenge done!', lines: [first ? '📅 First run today: **+15 bonus XP**' : 'Already claimed today’s bonus — this one was for practice.'], bonus: function () { if (first) { S.day().d = 1; S.save(); return 15; } return 0; } }));
      }
      else if (id === 'sorter') current = A.playlist(host, Object.assign(base, { items: actItems(KS.sampleN(C.poolSmart({ types: ['bucket'] }, 3), 4)), xpPer: 5 }));
      else if (id === 'detective') current = A.playlist(host, Object.assign(base, { items: actItems(KS.sampleN(C.poolSmart({ types: ['spot', 'ab'] }, 3), 6)), xpPer: 5 }));
      else if (id === 'estimator') current = A.playlist(host, Object.assign(base, { items: actItems(KS.sampleN(C.poolSmart({ types: ['estimate'] }, 3), 6)), xpPer: 5 }));
      else if (id === 'incident') current = A.playlist(host, Object.assign(base, { items: actItems(KS.sampleN(C.poolSmart({ types: ['scenario'] }, 1), 1)), xpPer: 12, endTitle: 'Incident closed.' }));
      else if (id === 'weak') {
        const weak = []; const acts = S.state.acts;
        Object.keys(acts).forEach(function (key) { const v = acts[key]; if (v[1] > 0 && v[1] >= v[0]) { const p = key.split(':'); const L = C.lessons[p[0]]; const a = L && L.activities && L.activities[+p[1]]; if (a && a.type !== 'explain') weak.push({ key: key, lessonId: p[0], a: a, ts: v[2] }); } });
        weak.sort(function (x, y) { return y.ts - x.ts; });
        current = A.playlist(host, Object.assign(base, { items: actItems(weak.slice(0, 10)), xpPer: 4, emptyEmoji: '💪', emptyTitle: 'No weak spots!', emptySub: 'Questions you get wrong in lessons show up here until you beat them.', endTitle: 'Patched up!' }));
      }
    }
    return ctl;
  };
})();
