/* Keystone — lesson cards + the shared lesson player (used by both Studio and Pocket). */
(function () {
  'use strict';
  const KS = window.KS, h = KS.h, S = KS.store;

  // ====================================================================
  // Cards
  // ====================================================================
  const KINDS = {
    concept: ['💡', 'Concept'], metaphor: ['🎭', 'Think of it like…'], example: ['🧪', 'Example'], code: ['👩‍💻', 'In code'],
    pitfall: ['⚠️', 'Watch out'], realworld: ['🌍', 'In the wild'], tip: ['🧠', 'Pro tip'], story: ['📖', 'Story'], history: ['🕰️', 'Backstory'],
    sequence: ['🎬', 'Step by step'], diagram: ['🗺️', 'The picture'], layers: ['🥞', 'Layers'], compare: ['⚖️', 'Side by side'],
    steps: ['🪜', 'Walkthrough'], recap: ['📌', 'Recap'], deep: ['🤿', 'Deeper dive']
  };
  const Cards = (KS.cards = { kinds: KINDS });
  Cards.render = function (card, opts) {
    opts = opts || {};
    const k = KINDS[card.kind] ? card.kind : 'concept';
    const el = h('article.lcard.k-' + k, h('div.lcard-kind', h('span', KINDS[k][0]), h('span', KINDS[k][1])), card.title ? h('h2.lcard-title', { html: KS.md.inline(card.title) }) : null);
    if (card.body) el.appendChild(KS.mdEl(card.body, 'div.md.lcard-body'));
    let visual = null;
    if (k === 'sequence') visual = KS.dia.sequence(card);
    else if (k === 'diagram') visual = KS.dia.flow(card);
    else if (k === 'layers') visual = KS.dia.layers(card);
    else if (k === 'compare') visual = KS.dia.compare(card);
    else if (k === 'steps') visual = KS.dia.steps(card);
    if (visual) { el.appendChild(visual); if (visual._advance) el._advance = visual._advance; }
    if (card.code && card.code.src) el.appendChild(KS.codeBlock(card.code.src, card.code.lang, { notes: card.code.notes, title: card.code.title }));
    if (card.note) el.appendChild(KS.mdEl(card.note, 'div.md.lcard-note'));
    try { KS.content.linkTerms(el); } catch (e) { /* glossary not built yet */ }
    return el;
  };

  // ====================================================================
  // Player
  // ====================================================================
  const P = (KS.player = {});

  P.steps = function (meta, L) {
    const steps = [{ t: 'intro' }]; const acts = L.activities || []; const cards = L.cards || []; const byAfter = {};
    acts.forEach(function (a, i) { if (a.after != null && a.after >= 0 && a.after < cards.length) (byAfter[a.after] = byAfter[a.after] || []).push(i); });
    cards.forEach(function (c, i) { steps.push({ t: 'card', i: i }); (byAfter[i] || []).forEach(function (ai) { steps.push({ t: 'act', i: ai }); }); });
    const labs = meta.lab ? (Array.isArray(meta.lab) ? meta.lab : [meta.lab]) : [];
    labs.forEach(function (id) { if (KS.labs && KS.labs.get(id)) steps.push({ t: 'lab', id: id }); });
    acts.forEach(function (a, i) { if (!(a.after != null && a.after >= 0 && a.after < cards.length)) steps.push({ t: 'act', i: i }); });
    steps.push({ t: 'recap' });
    return steps;
  };

  /**
   * Mount the lesson player. opts: { compact, onExit(), onOpenLesson(id), onOpenModule(id), onBoss(moduleId) }
   */
  P.mount = function (host, lessonId, opts) {
    opts = opts || {};
    const meta = KS.content.meta(lessonId);
    const root = h('div.player' + (opts.compact ? '.compact' : ''));
    host.appendChild(root);
    let dead = false, cleanupStep = null;
    const ctl = { destroy: function () { dead = true; document.removeEventListener('keydown', onKey); if (cleanupStep) cleanupStep(); root.remove(); } };
    function onKey() { /* replaced once loaded */ }
    if (!meta) { root.appendChild(KS.ui.empty('🧭', 'Lesson not found', 'That lesson does not exist.', h('button.btn.primary', { type: 'button', onclick: function () { if (opts.onExit) opts.onExit(); } }, 'Back'))); return ctl; }
    root.appendChild(KS.ui.spinner('Loading lesson…'));
    Promise.all([KS.content.loadLesson(lessonId), meta.lab && KS.labs && KS.labs.whenReady ? KS.labs.whenReady() : null]).then(function () { if (!dead) start(); });

    function start() {
      KS.clear(root);
      const L = KS.content.getLesson(lessonId);
      if (!L && KS.content.failed[meta.module.id]) {
        const again = h('button.btn.primary', { type: 'button', onclick: function () {
          again.disabled = true; again.textContent = 'Trying again…';
          KS.content.retry(meta.module.id).then(function () { if (!dead) start(); });
        } }, 'Try again');
        root.appendChild(KS.ui.empty('📡', 'Couldn’t load this lesson', 'This lesson’s file didn’t download. Check your connection and try again.', again));
        return;
      }
      if (!L) {
        root.appendChild(KS.ui.empty('🚧', 'This lesson is still being written', '“' + meta.title + '” is on the map, but its content is not in this build yet.', h('button.btn.primary', { type: 'button', onclick: function () { if (opts.onExit) opts.onExit(); } }, 'Back')));
        return;
      }
      const steps = P.steps(meta, L);
      const ls = S.lesson(lessonId);
      const resuming = !ls.done && ls.pos > 0 && ls.pos < steps.length - 1;
      let pos = resuming ? ls.pos : 0;
      const results = {};
      if (resuming) { for (const k in ls.res) results[k] = ls.res[k]; } else { ls.res = {}; ls.pos = 0; }
      let runXp = 0, finished = false, inst = null, labCtl = null, labDone = false, cardEl = null;

      // ----- chrome -----
      const segs = h('div.pl-progress', { role: 'progressbar', 'aria-label': 'Lesson progress' });
      const segEls = steps.map(function (st) { const e = h('i.pl-seg.s-' + st.t); if (st.t === 'intro' || st.t === 'recap') e.style.display = 'none'; segs.appendChild(e); return e; });
      const xpEl = h('div.pl-xp', '⚡ 0');
      const sideBtn = h('button.icon-btn.pl-side-btn', { type: 'button', title: 'Terms, notes & outline', 'aria-label': 'Terms, notes and outline', onclick: function () { root.classList.toggle('side-open'); if (root.classList.contains('side-open')) drawSide(); } }, KS.ui.icon('book'));
      const top = h('header.pl-top', h('button.icon-btn.pl-exit', { type: 'button', 'aria-label': 'Exit lesson', title: 'Exit (Esc)', onclick: exit }, KS.ui.icon('x')), h('div.pl-top-mid', h('div.pl-title', meta.title), segs), xpEl, sideBtn);
      const stage = h('main.pl-stage');
      const backBtn = h('button.btn.ghost.pl-back', { type: 'button', onclick: back }, KS.ui.icon('left', 18), h('span', 'Back'));
      const nextBtn = h('button.btn.primary.lg.pl-next', { type: 'button', onclick: primary }, 'Next');
      const bar = h('footer.pl-bar', backBtn, h('div.pl-keys', opts.compact ? '' : '← → or Enter'), nextBtn);
      const side = h('aside.pl-side');
      root.appendChild(top); root.appendChild(h('div.pl-main', stage, side)); root.appendChild(bar);

      function exit() { ls.pos = finished ? 0 : pos; ls.t = Date.now(); S.save(); if (opts.onExit) opts.onExit(); }

      // ----- side panel -----
      let sideTab = 'terms';
      function drawSide() {
        KS.clear(side);
        const tabs = [['terms', 'Terms'], ['notes', 'Notes'], ['outline', 'Outline']];
        side.appendChild(h('div.pl-side-head', h('div.seg', tabs.map(function (t) { return h('button' + (sideTab === t[0] ? '.on' : ''), { type: 'button', onclick: function () { sideTab = t[0]; drawSide(); } }, t[1]); })), h('button.icon-btn', { type: 'button', 'aria-label': 'Close panel', onclick: function () { root.classList.remove('side-open'); } }, KS.ui.icon('x', 18))));
        const body = h('div.pl-side-body'); side.appendChild(body);
        if (sideTab === 'terms') {
          const terms = L.glossary || [];
          if (!terms.length) body.appendChild(h('p.muted', 'No glossary terms for this lesson.'));
          terms.forEach(function (g) { body.appendChild(h('div.gl-item', h('div.gl-term', g.term), h('div.gl-def', { html: KS.md.inline(g.def) }), g.like ? h('div.gl-like', '🎭 ', h('span', { html: KS.md.inline(g.like) })) : null)); });
          if (L.eli5) body.insertBefore(h('div.gl-eli5', h('b', 'In one sentence: '), h('span', { html: KS.md.inline(L.eli5) })), body.firstChild);
          if (L.links && L.links.length) body.appendChild(h('div.gl-links', h('div.fb-sub', 'Go deeper'), L.links.map(function (l) { return h('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer' }, l.label + ' ↗'); })));
        } else if (sideTab === 'notes') {
          const note = S.state.notes[lessonId];
          const ta = h('textarea.notes-input', { placeholder: 'Your notes for this lesson — saved automatically.', rows: '12' }); ta.value = note ? note.t : '';
          const save = KS.debounce(function () { S.state.notes[lessonId] = { t: ta.value, u: Date.now() }; S.save(); KS.game.queueCheck(); }, 400);
          ta.addEventListener('input', save);
          body.appendChild(ta); body.appendChild(h('p.muted.small', 'Notes sync with your progress and show up in your Profile.'));
        } else {
          steps.forEach(function (st, i) {
            if (st.t !== 'card') return; const c = L.cards[st.i]; const reached = i <= Math.max(pos, ls.pos || 0) || ls.done;
            body.appendChild(h('button.outline-item' + (i === pos ? '.cur' : '') + (reached ? '' : '.locked'), { type: 'button', disabled: !reached, onclick: function () { go(i, i < pos ? -1 : 1); } }, h('span.outline-ico', (KINDS[c.kind] || KINDS.concept)[0]), h('span', KS.plain(c.title || KINDS[c.kind][1]))));
          });
        }
      }

      // ----- step rendering -----
      function isAnswered(st) { return st.t === 'act' && results[st.i] != null; }
      function go(i, dir) {
        if (cleanupStep) { cleanupStep(); cleanupStep = null; }
        inst = null; cardEl = null; labCtl = null;
        pos = KS.clamp(i, 0, steps.length - 1);
        if (!finished) { ls.pos = pos; ls.t = Date.now(); S.save(); }
        const st = steps[pos];
        KS.clear(stage); stage.scrollTop = 0;
        const wrap = h('div.pl-step.t-' + st.t + (dir < 0 ? '.from-left' : '.from-right'));
        stage.appendChild(wrap);
        if (st.t === 'intro') renderIntro(wrap);
        else if (st.t === 'card') { cardEl = Cards.render(L.cards[st.i]); wrap.appendChild(cardEl); }
        else if (st.t === 'act') renderAct(wrap, st.i);
        else if (st.t === 'lab') renderLab(wrap, st.id);
        else renderRecap(wrap);
        segEls.forEach(function (e, k) { e.classList.toggle('done', k < pos); e.classList.toggle('cur', k === pos); });
        segs.setAttribute('aria-valuemin', '0'); segs.setAttribute('aria-valuemax', String(steps.length)); segs.setAttribute('aria-valuenow', String(pos)); segs.setAttribute('aria-valuetext', 'Step ' + Math.min(pos + 1, steps.length) + ' of ' + steps.length);
        if (root.classList.contains('side-open')) drawSide();
        sync();
        P.debug = { steps: steps, pos: pos, step: st, inst: inst, lesson: L, next: primary, labDone: function () { return labDone; } };
      }
      function renderIntro(wrap) {
        const nCards = (L.cards || []).length, nActs = (L.activities || []).length;
        wrap.appendChild(h('div.pl-intro',
          h('div.pl-intro-world', { style: { '--wc': meta.world.color } }, meta.world.emoji + ' ' + meta.world.title + '  ›  ' + meta.module.title),
          h('h1', meta.title),
          meta.summary ? h('p.pl-intro-sum', meta.summary) : null,
          L.eli5 ? h('div.pl-eli5', KS.ui.mascot('happy', 56), h('div', h('div.pl-eli5-k', 'In one sentence'), h('div', { html: KS.md.inline(L.eli5) }))) : null,
          meta.topicList.length ? h('div.pl-learn', h('div.pl-learn-k', 'You\'ll learn'), h('ul', meta.topicList.map(function (t) { return h('li', t); }))) : null,
          h('div.pl-intro-meta', h('span', '⏱ ~' + (meta.mins || 8) + ' min'), h('span', '🃏 ' + nCards + ' cards'), h('span', '🎯 ' + nActs + ' challenges'), ls.done ? h('span.good', '✓ completed') : null),
          resuming ? h('p.muted', 'Picking up where you left off.') : null));
      }
      function renderAct(wrap, i) {
        const a = L.activities[i]; const key = lessonId + ':' + i;
        inst = KS.act.create(a, { compact: opts.compact, key: key, onResult: function (res) {
          results[i] = res.score; ls.res[i] = res.score;
          const prev = S.act(key); const mastered = prev && prev[0] > 0;
          S.recordAct(key, res.correct);
          const xp = Math.round(KS.act.xp(a) * res.score * (mastered ? 0.34 : 1));
          if (xp) { runXp += KS.game.award(xp, { anchor: xpEl }); xpEl.textContent = '⚡ ' + runXp; xpEl.classList.remove('bump'); void xpEl.offsetWidth; xpEl.classList.add('bump'); }
          sync();
          setTimeout(function () { const fbx = wrap.querySelector('.act-fb'); if (fbx && fbx.scrollIntoView) fbx.scrollIntoView({ block: 'nearest', behavior: KS.reduceMotion() ? 'auto' : 'smooth' }); }, 60);
        } });
        inst.on(sync);
        wrap.appendChild(inst.el);
        try { KS.content.linkTerms(inst.el.querySelector('.act-q')); } catch (e) { /* ok */ }
        cleanupStep = function () { if (inst) inst.destroy(); };
      }
      function renderLab(wrap, id) {
        labDone = KS.labs.isComplete(id);
        labCtl = KS.labs.mount(wrap, id, { embedded: true, compact: opts.compact, onComplete: function () { labDone = true; sync(); } });
        cleanupStep = function () { if (labCtl) labCtl.destroy(); };
      }

      // ----- completion -----
      function complete() {
        finished = true;
        const keys = Object.keys(results); let sum = 0; keys.forEach(function (k) { sum += results[k]; });
        const acc = keys.length ? sum / keys.length : 1; const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
        const first = !ls.done;
        if (first) ls.done = Date.now();
        ls.stars = Math.max(ls.stars || 0, stars); ls.best = Math.max(ls.best || 0, acc); ls.pos = 0; ls.res = {}; ls.runs = (ls.runs || 0) + 1; ls.t = Date.now();
        S.day().l++; S.save();
        const bonus = (first ? 20 : 5) + (first && stars === 3 ? 10 : 0);
        runXp += KS.game.award(bonus, { silent: true });
        const cardsAdded = KS.srs.unlock(lessonId);
        KS.bus.emit('lesson:done', lessonId); KS.game.queueCheck();
        KS.ui.sfx('win'); KS.ui.confetti({ count: stars === 3 ? 150 : 80 });
        return { acc: acc, stars: stars, first: first, bonus: bonus, cardsAdded: cardsAdded, wrong: keys.filter(function (k) { return results[k] < 0.999; }).map(Number) };
      }
      let summary = null;
      function renderRecap(wrap) {
        if (!finished) summary = complete();
        const sum = summary; const next = KS.content.nextLesson(lessonId); const modProg = KS.content.moduleProgress(meta.module);
        xpEl.textContent = '⚡ ' + runXp;
        const starsEl = h('div.recap-stars', [0, 1, 2].map(function (i) { return h('span.recap-star' + (i < sum.stars ? '.on' : ''), { style: { '--d': (i * 0.18) + 's' } }, '★'); }));
        const btns = h('div.recap-actions');
        if (next) btns.appendChild(h('button.btn.primary.lg', { type: 'button', onclick: function () { if (opts.onOpenLesson) opts.onOpenLesson(next.id); } }, next.module.id === meta.module.id ? 'Next lesson: ' + next.title + ' →' : 'Next up: ' + next.module.title + ' →'));
        if (modProg.complete && !modProg.boss && opts.onBoss) btns.appendChild(h('button.btn.boss-btn.lg', { type: 'button', onclick: function () { opts.onBoss(meta.module.id); } }, '⚔️ Module complete — fight the boss'));
        if (sum.wrong.length) btns.appendChild(h('button.btn', { type: 'button', onclick: function () { reviewMistakes(sum.wrong); } }, '🔁 Retry ' + KS.plural(sum.wrong.length, 'miss', 'misses')));
        btns.appendChild(h('button.btn.ghost', { type: 'button', onclick: function () { if (opts.onOpenModule) opts.onOpenModule(meta.module.id); else exit(); } }, 'Back to ' + meta.module.title));
        wrap.appendChild(h('div.recap',
          h('div.recap-hero', KS.ui.mascot(sum.stars === 3 ? 'cool' : 'happy', 88), h('div', h('div.recap-kicker', sum.first ? 'Lesson complete' : 'Lesson replayed'), h('h1', meta.title), starsEl)),
          h('div.recap-stats', h('div.recap-stat', h('b', Math.round(sum.acc * 100) + '%'), h('span', 'accuracy')), h('div.recap-stat', h('b', '+' + runXp), h('span', 'XP earned')), h('div.recap-stat', h('b', String(S.streak().current)), h('span', 'day streak 🔥'))),
          (L.takeaways && L.takeaways.length) ? h('div.recap-box', h('h3', '📌 Take these with you'), h('ul.recap-take', L.takeaways.map(function (t) { return h('li', { html: KS.md.inline(t) }); }))) : null,
          sum.cardsAdded ? h('div.recap-note', '🃏 ' + KS.plural(sum.cardsAdded, 'flashcard') + ' added to your review deck — they\'ll come back just before you forget them.') : null,
          (L.glossary && L.glossary.length) ? h('div.recap-terms', h('span.muted', 'New words: '), L.glossary.map(function (g) { return h('span.term', { dataset: { term: KS.slug(g.term) }, tabindex: '0', role: 'button' }, g.term); })) : null,
          btns));
      }
      function reviewMistakes(list) {
        KS.clear(stage); let k = 0;
        const wrap = h('div.pl-step.t-act'); stage.appendChild(wrap);
        function one() {
          KS.clear(wrap);
          if (k >= list.length) { go(steps.length - 1, 1); return; }
          const i = list[k]; const a = L.activities[i]; const key = lessonId + ':' + i;
          wrap.appendChild(h('div.muted.small', 'Retry ' + (k + 1) + ' of ' + list.length));
          KS.act.mount(wrap, a, { compact: opts.compact, key: key, continueLabel: k + 1 < list.length ? 'Next' : 'Done', onResult: function (res) { S.recordAct(key, res.correct); if (res.correct) { runXp += KS.game.award(2, { anchor: xpEl }); xpEl.textContent = '⚡ ' + runXp; } }, onContinue: function () { k++; one(); } });
        }
        bar.style.display = 'none'; one();
      }

      // ----- navigation -----
      function sync() {
        const st = steps[pos]; bar.style.display = st.t === 'recap' ? 'none' : '';
        let prevIdx = pos - 1; while (prevIdx > 0 && steps[prevIdx].t === 'act') prevIdx--;
        backBtn.disabled = pos === 0; backBtn.style.visibility = pos === 0 ? 'hidden' : '';
        nextBtn.className = 'btn primary lg pl-next'; nextBtn.disabled = false;
        if (st.t === 'intro') nextBtn.textContent = resuming ? 'Continue' : (ls.done ? 'Replay lesson' : 'Start');
        else if (st.t === 'card') nextBtn.textContent = 'Next';
        else if (st.t === 'act') {
          if (inst && inst.done) nextBtn.textContent = 'Continue';
          else if (inst && inst.needsCheck) { nextBtn.textContent = 'Check'; nextBtn.disabled = !inst.canCheck; }
          else { nextBtn.textContent = st.t === 'act' && inst && (inst.a.type === 'scenario' || inst.a.type === 'explain' || inst.a.type === 'match' || inst.a.type === 'bucket') ? 'Finish it to continue' : 'Pick an answer'; nextBtn.disabled = true; }
        } else if (st.t === 'lab') { if (labDone) nextBtn.textContent = 'Continue'; else { nextBtn.textContent = 'Skip lab for now'; nextBtn.className = 'btn lg pl-next'; } }
      }
      function forward() {
        let n = pos + 1; while (n < steps.length - 1 && isAnswered(steps[n])) n++;
        go(n, 1);
      }
      function primary() {
        const st = steps[pos];
        if (st.t === 'card' && cardEl && cardEl._advance && cardEl._advance()) { KS.ui.sfx('tap'); return; }
        if (st.t === 'act') { if (!inst) return forward(); if (inst.done) return forward(); if (inst.needsCheck && inst.canCheck) inst.check(); return; }
        KS.ui.sfx('tap'); forward();
      }
      function back() {
        if (pos === 0) return; let n = pos - 1; while (n > 0 && steps[n].t === 'act') n--;
        go(n, -1);
      }
      onKey = function (e) {
        if (dead || !root.isConnected || e.defaultPrevented) return;   // a term, code note or popover already handled this key
        if (document.querySelector('.modal-back') || document.querySelector('.palette-back') || document.querySelector('.popover')) return;
        const tag = (e.target && e.target.tagName) || ''; const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
        if (e.key === 'Escape') { if (root.classList.contains('side-open')) root.classList.remove('side-open'); else exit(); return; }
        if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
        if (steps[pos].t === 'lab') return; // labs own the keyboard
        if (e.key === 'ArrowRight' || (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'A')) { if (bar.style.display !== 'none' && !nextBtn.disabled) { e.preventDefault(); primary(); } return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); back(); return; }
        if (inst && !inst.done && e.key.length === 1) { if (inst.key(e)) e.preventDefault(); }
      };
      document.addEventListener('keydown', onKey);

      // swipe between cards on touch devices
      let tx = 0, ty = 0, tok = false;
      stage.addEventListener('touchstart', function (e) { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; tok = !(e.target.closest && e.target.closest('.code, .tbl-wrap, .seq-scroll, .flow-scroll, .cmp-wrap, input, textarea, .lab, .act')); }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        if (!tok) return; const t = e.changedTouches[0]; const dx = t.clientX - tx, dy = t.clientY - ty;
        if (Math.abs(dx) < 64 || Math.abs(dy) > 48) return; const st = steps[pos];
        if (st.t !== 'card' && st.t !== 'intro') return;
        if (dx < 0) primary(); else back();
      }, { passive: true });

      go(pos, 1);
    }
    return ctl;
  };
})();
