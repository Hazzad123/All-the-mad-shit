/* Keystone — interactive activity types. Every type is tap/click based so it works with mouse, keyboard and thumbs. */
(function () {
  'use strict';
  const KS = window.KS, h = KS.h;
  const A = (KS.act = {});
  const TYPES = (A.types = {});

  //            label                  emoji  xp
  const META = {
    mcq: ['Pick one', '🎯', 6], multi: ['Pick all that apply', '☑️', 7], tf: ['True or false?', '⚖️', 4], ab: ['Which is better?', '🆚', 6],
    match: ['Match the pairs', '🔗', 8], order: ['Put in order', '🔢', 8], bucket: ['Sort them', '🧺', 8], cloze: ['Fill the blanks', '✏️', 7],
    spot: ['Spot the problem', '🔎', 8], short: ['Type the answer', '⌨️', 7], estimate: ['Best guess', '📏', 7], scenario: ['You decide', '🎬', 15],
    explain: ['Explain it back', '🗣️', 8], lab: ['Hands-on lab', '🧪', 20]
  };
  A.meta = function (t) { return META[t] || ['Activity', '❓', 5]; };
  A.xp = function (a) { return A.meta(a.type)[2]; };
  /** Types that can be auto-graded quickly (used by quizzes and games). */
  A.quick = ['mcq', 'multi', 'tf', 'ab', 'match', 'order', 'bucket', 'cloze', 'spot', 'short', 'estimate'];

  const PRAISE = {
    good: ['Nailed it!', 'Exactly right.', 'Spot on.', 'Correct!', 'You got it.', 'Yes!', 'Bang on.', 'That\'s the one.'],
    part: ['Partly right.', 'Almost there.', 'Some of it!', 'Close.'],
    bad: ['Not quite.', 'Close, but no.', 'Not this time.', 'Let\'s unpick that.', 'Good guess — but no.']
  };
  function norm(sv) {
    const raw = String(sv == null ? '' : sv).trim().toLowerCase();
    const alnum = raw.replace(/[^a-z0-9]+/g, '');
    return alnum || raw.replace(/\s+/g, '');   // symbol-only answers (|, >, #, &&) compare literally
  }

  function promptEl(a) {
    const wrap = h('div.act-q');
    const text = a.type === 'tf' ? '' : (a.q || a.prompt || a.title || '');
    if (text) wrap.appendChild(KS.mdEl(text, 'div.md.act-q-text'));
    if (a.type === 'tf') wrap.appendChild(h('div.tf-statement', { html: KS.md.inline(a.statement || '') }));
    if (a.code && typeof a.code === 'object' && a.code.src && a.type !== 'spot' && a.type !== 'cloze') wrap.appendChild(KS.codeBlock(a.code.src, a.code.lang));
    return wrap;
  }

  /**
   * Create an activity instance (no footer). The host decides where the Check / Continue button lives.
   * opts: { compact, key, onResult(result, inst) }
   */
  A.create = function (a, opts) {
    opts = opts || {};
    const T = TYPES[a.type];
    const subs = [];
    const inst = { a: a, el: null, canCheck: false, done: false, result: null, needsCheck: true, opts: opts };
    inst.on = function (fn) { subs.push(fn); };
    const emit = function () { subs.forEach(function (fn) { fn(inst); }); };
    const body = h('div.act-body'); const fb = h('div.act-fb', { 'aria-live': 'polite' });
    const meta = A.meta(a.type);
    inst.el = h('div.act.act-' + a.type + (opts.compact ? '.compact' : ''), h('div.act-kind', h('span', meta[1]), h('span', meta[0])), promptEl(a), body, fb);
    if (!T) { body.appendChild(h('p.muted', 'Unknown activity type: ' + a.type)); inst.needsCheck = false; return inst; }
    const api = {
      a: a, opts: opts, body: body, inst: inst,
      ready: function (v) { inst.canCheck = v !== false; emit(); },
      finish: function (res) {
        if (inst.done) return;
        res = res || {}; inst.done = true; inst.canCheck = false;
        const score = KS.clamp(res.score == null ? 0 : res.score, 0, 1);
        const correct = res.correct != null ? !!res.correct : score >= 0.999;
        inst.result = { score: score, correct: correct };
        const tone = res.neutral ? 'info' : correct ? 'good' : score > 0.01 ? 'part' : 'bad';
        inst.el.classList.add('is-done', 'is-' + tone);
        const title = res.title || (res.neutral ? 'Done' : KS.pick(PRAISE[tone]));
        const box = h('div.fb.fb-' + tone, h('div.fb-head', h('span.fb-ico', tone === 'good' ? '✓' : tone === 'bad' ? '✗' : tone === 'part' ? '◐' : '✎'), h('span', title)));
        if (res.note) box.appendChild(KS.mdEl(res.note, 'div.md.fb-note'));
        if (res.detail) box.appendChild(res.detail);
        if (a.explain) box.appendChild(KS.mdEl(a.explain, 'div.md.fb-explain'));
        fb.appendChild(box);
        try { KS.content.linkTerms(box); } catch (e) { /* glossary not ready */ }
        if (!res.neutral) { KS.ui.sfx(correct ? 'good' : score > 0.01 ? 'meh' : 'bad'); KS.ui.buzz(correct ? 14 : [30, 40, 30]); }
        emit();
        if (opts.onResult) opts.onResult(inst.result, inst);
      }
    };
    const impl = T(api) || {};
    if (impl.immediate) inst.needsCheck = false;
    inst.check = function () { if (!inst.done && impl.check) impl.check(); };
    inst.key = function (e) { if (!inst.done && impl.key) return impl.key(e); return false; };
    inst.destroy = function () { if (impl.destroy) impl.destroy(); };
    return inst;
  };

  /** Mount with its own Check / Continue footer (arcade, review, standalone). */
  A.mount = function (host, a, opts) {
    opts = opts || {};
    const inst = A.create(a, opts);
    const btn = h('button.btn.primary.lg.act-main', { type: 'button' });
    const foot = h('div.act-foot', btn);
    host.appendChild(inst.el); host.appendChild(foot);
    function sync() {
      if (inst.done) { btn.textContent = opts.continueLabel || 'Continue'; btn.disabled = false; foot.style.display = opts.onContinue ? '' : 'none'; if (opts.onContinue) setTimeout(function () { try { btn.focus({ preventScroll: true }); } catch (e) { /* ok */ } }, 40); }
      else if (inst.needsCheck) { btn.textContent = 'Check'; btn.disabled = !inst.canCheck; foot.style.display = ''; }
      else foot.style.display = 'none';
    }
    btn.addEventListener('click', function () { if (inst.done) { if (opts.onContinue) opts.onContinue(inst.result); } else inst.check(); });
    inst.on(sync); sync();
    inst.foot = foot;
    return inst;
  };

  // =====================================================================
  // mcq — { q, options[], answer: idx, explain, why?: [per-option], fixed?: true, code? }
  // =====================================================================
  TYPES.mcq = function (api) {
    const a = api.a; const idx = a.options.map(function (_, i) { return i; });
    const order = a.fixed ? idx : KS.shuffle(idx); const btns = [];
    const wrap = h('div.opts');
    order.forEach(function (oi, pos) {
      const b = h('button.opt', { type: 'button', onclick: function () { choose(oi); } }, h('span.opt-key', String(pos + 1)), h('span.opt-txt', { html: KS.md.inline(a.options[oi]) }));
      b._oi = oi; btns.push(b); wrap.appendChild(b);
    });
    api.body.appendChild(wrap);
    function choose(oi) {
      if (api.inst.done) return;
      btns.forEach(function (b) { b.disabled = true; if (b._oi === a.answer) b.classList.add('right'); else if (b._oi === oi) b.classList.add('wrong'); else b.classList.add('dim'); });
      const why = a.why && a.why[oi];
      api.finish({ score: oi === a.answer ? 1 : 0, note: oi !== a.answer && why ? why : null });
    }
    return { immediate: true, key: function (e) { const n = +e.key; if (n >= 1 && n <= btns.length) { btns[n - 1].click(); return true; } return false; } };
  };

  // =====================================================================
  // multi — { q, options[], answers: [idx...], explain }
  // =====================================================================
  TYPES.multi = function (api) {
    const a = api.a; const order = KS.shuffle(a.options.map(function (_, i) { return i; })); const sel = new Set(); const btns = [];
    const wrap = h('div.opts.opts-multi');
    order.forEach(function (oi, pos) {
      const b = h('button.opt', { type: 'button', 'aria-pressed': 'false', onclick: function () { if (api.inst.done) return; if (sel.has(oi)) sel.delete(oi); else sel.add(oi); b.classList.toggle('sel', sel.has(oi)); b.setAttribute('aria-pressed', String(sel.has(oi))); KS.ui.sfx('tap'); api.ready(sel.size > 0); } },
        h('span.opt-key.box', String(pos + 1)), h('span.opt-txt', { html: KS.md.inline(a.options[oi]) }));
      b._oi = oi; btns.push(b); wrap.appendChild(b);
    });
    api.body.appendChild(h('div.act-hint', 'Select every option that applies, then check.')); api.body.appendChild(wrap);
    return {
      check: function () {
        const ans = new Set(a.answers); let right = 0, wrong = 0;
        btns.forEach(function (b) {
          b.disabled = true; const isAns = ans.has(b._oi), isSel = sel.has(b._oi);
          if (isAns && isSel) { b.classList.add('right'); right++; } else if (isAns) b.classList.add('missed'); else if (isSel) { b.classList.add('wrong'); wrong++; } else b.classList.add('dim');
        });
        api.finish({ score: Math.max(0, (right - wrong) / ans.size), correct: right === ans.size && wrong === 0 });
      },
      key: function (e) { const n = +e.key; if (n >= 1 && n <= btns.length) { btns[n - 1].click(); return true; } return false; }
    };
  };

  // =====================================================================
  // tf — { statement, answer: bool, explain }
  // =====================================================================
  TYPES.tf = function (api) {
    const a = api.a;
    const bt = h('button.opt.tf-btn.tf-true', { type: 'button', onclick: function () { choose(true); } }, h('span.tf-ico', '✓'), 'True');
    const bf = h('button.opt.tf-btn.tf-false', { type: 'button', onclick: function () { choose(false); } }, h('span.tf-ico', '✗'), 'False');
    api.body.appendChild(h('div.tf-row', bt, bf));
    function choose(v) {
      if (api.inst.done) return;
      bt.disabled = bf.disabled = true;
      const right = v === !!a.answer; (v ? bt : bf).classList.add(right ? 'right' : 'wrong'); if (!right) (v ? bf : bt).classList.add('right');
      api.finish({ score: right ? 1 : 0 });
    }
    return { immediate: true, key: function (e) { const k = e.key.toLowerCase(); if (k === 't' || k === '1') { choose(true); return true; } if (k === 'f' || k === '2') { choose(false); return true; } return false; } };
  };

  // =====================================================================
  // ab — { q, a: {lang, src, label?}, b: {...}, answer: 'a'|'b', explain }
  // =====================================================================
  TYPES.ab = function (api) {
    const a = api.a; const panels = {};
    function panel(k) {
      const v = typeof a[k] === 'string' ? { src: a[k], lang: a.lang } : a[k];
      const btn = h('button.btn.ab-pick', { type: 'button', onclick: function () { choose(k); } }, 'Choose ' + k.toUpperCase());
      const p = h('div.ab-panel', h('div.ab-head', h('span.ab-tag', k.toUpperCase()), v.label ? h('span.ab-label', v.label) : null), KS.codeBlock(v.src, v.lang || a.lang || 'js'), btn);
      panels[k] = { el: p, btn: btn }; return p;
    }
    api.body.appendChild(h('div.ab-row', panel('a'), panel('b')));
    function choose(k) {
      if (api.inst.done) return;
      const right = k === a.answer;
      ['a', 'b'].forEach(function (x) { panels[x].btn.disabled = true; if (x === a.answer) panels[x].el.classList.add('right'); else if (x === k) panels[x].el.classList.add('wrong'); });
      api.finish({ score: right ? 1 : 0 });
    }
    return { immediate: true, key: function (e) { const k = e.key.toLowerCase(); if (k === 'a' || k === '1') { choose('a'); return true; } if (k === 'b' || k === '2') { choose('b'); return true; } return false; } };
  };

  // =====================================================================
  // match — { prompt, pairs: [[left, right], ...], explain }
  // =====================================================================
  TYPES.match = function (api) {
    const a = api.a; const n = a.pairs.length; let selL = null, selR = null, matched = 0, mistakes = 0;
    const left = [], right = [];
    const colL = h('div.match-col'), colR = h('div.match-col');
    a.pairs.forEach(function (p, i) {
      const b = h('button.match-item', { type: 'button', onclick: function () { pick('L', i); } }, h('span', { html: KS.md.inline(p[0]) })); b._i = i; left.push(b); colL.appendChild(b);
    });
    KS.shuffle(a.pairs.map(function (_, i) { return i; })).forEach(function (i) {
      const b = h('button.match-item', { type: 'button', onclick: function () { pick('R', i); } }, h('span', { html: KS.md.inline(a.pairs[i][1]) })); b._i = i; right.push(b); colR.appendChild(b);
    });
    api.body.appendChild(h('div.act-hint', 'Tap an item on the left, then its partner on the right.'));
    api.body.appendChild(h('div.match-grid', colL, colR));
    const find = function (list, i) { return list.filter(function (b) { return b._i === i; })[0]; };
    function pick(side, i) {
      if (api.inst.done) return;
      const btn = find(side === 'L' ? left : right, i); if (btn.classList.contains('done')) return;
      if (side === 'L') { if (selL != null) find(left, selL).classList.remove('sel'); selL = selL === i ? null : i; if (selL != null) btn.classList.add('sel'); }
      else { if (selR != null) find(right, selR).classList.remove('sel'); selR = selR === i ? null : i; if (selR != null) btn.classList.add('sel'); }
      KS.ui.sfx('tap');
      if (selL == null || selR == null) return;
      const bl = find(left, selL), br = find(right, selR);
      if (selL === selR) {
        [bl, br].forEach(function (b) { b.classList.remove('sel'); b.classList.add('done', 'm' + (matched % 6)); b.disabled = true; });
        matched++; KS.ui.sfx('pop');
        if (matched === n) api.finish({ score: Math.max(0, 1 - mistakes / n), correct: mistakes === 0, note: mistakes ? 'Matched them all, with ' + KS.plural(mistakes, 'slip') + ' along the way.' : null });
      } else {
        mistakes++; [bl, br].forEach(function (b) { b.classList.remove('sel'); b.classList.add('shake'); setTimeout(function () { b.classList.remove('shake'); }, 420); });
        KS.ui.sfx('bad'); KS.ui.buzz([20, 30, 20]);
      }
      selL = selR = null;
    }
    return { immediate: true };
  };

  // =====================================================================
  // order — { prompt, items: [in correct order], explain }
  // =====================================================================
  TYPES.order = function (api) {
    const a = api.a; const n = a.items.length;
    let pool = KS.shuffle(a.items.map(function (_, i) { return i; }));
    if (n > 1 && pool.every(function (v, i) { return v === i; })) pool.push(pool.shift());
    const answer = [];
    const poolEl = h('div.order-pool'), ansEl = h('ol.order-answer');
    api.body.appendChild(h('div.act-hint', 'Tap the items in the right order. Tap a placed item to take it back.'));
    api.body.appendChild(ansEl); api.body.appendChild(poolEl);
    function render() {
      KS.clear(ansEl); KS.clear(poolEl);
      if (!answer.length) ansEl.appendChild(h('li.order-empty', 'Your sequence will appear here…'));
      answer.forEach(function (i, pos) {
        const pb = h('button.order-item.placed', { type: 'button', onclick: function () { if (api.inst.done) return; answer.splice(pos, 1); pool.push(i); KS.ui.sfx('tap'); render(); } }, h('span.order-n', String(pos + 1)), h('span', { html: KS.md.inline(a.items[i]) }));
        pb._i = i; ansEl.appendChild(h('li', pb));
      });
      pool.forEach(function (i) {
        const qb = h('button.order-item', { type: 'button', onclick: function () { if (api.inst.done) return; pool.splice(pool.indexOf(i), 1); answer.push(i); KS.ui.sfx('tap'); render(); } }, h('span', { html: KS.md.inline(a.items[i]) }));
        qb._i = i; poolEl.appendChild(qb);
      });
      api.ready(pool.length === 0);
    }
    render();
    return {
      check: function () {
        let right = 0;
        KS.$$('li', ansEl).forEach(function (li, pos) { const ok = answer[pos] === pos; if (ok) right++; const b = li.firstChild; b.disabled = true; b.classList.add(ok ? 'right' : 'wrong'); });
        const all = right === n;
        api.finish({ score: right / n, correct: all, detail: all ? null : h('div.fb-detail', h('div.fb-sub', 'Correct order:'), h('ol', a.items.map(function (t) { return h('li', { html: KS.md.inline(t) }); }))) });
      }
    };
  };

  // =====================================================================
  // bucket — { prompt, buckets: ['A','B'], items: [['text', bucketIdx], ...], explain }
  // =====================================================================
  TYPES.bucket = function (api) {
    const a = api.a;
    const items = KS.shuffle(a.items.map(function (it) { return Array.isArray(it) ? { text: it[0], bucket: it[1] } : it; }));
    let i = 0, right = 0; const misses = []; let busy = false;
    const count = h('div.bucket-count'); const card = h('div.bucket-card'); const btns = [];
    const row = h('div.bucket-row.b' + a.buckets.length);
    a.buckets.forEach(function (name, bi) { const b = h('button.bucket-btn', { type: 'button', onclick: function () { choose(bi); } }, h('span.opt-key', String(bi + 1)), h('span', { html: KS.md.inline(name) })); btns.push(b); row.appendChild(b); });
    api.body.appendChild(count); api.body.appendChild(card); api.body.appendChild(row);
    function show() {
      count.textContent = (i + 1) + ' of ' + items.length;
      card.className = 'bucket-card pop-in'; card.innerHTML = KS.md.inline(items[i].text); card._bucket = items[i].bucket;
      btns.forEach(function (b) { b.className = 'bucket-btn'; b.disabled = false; });
    }
    function choose(bi) {
      if (api.inst.done || busy) return; busy = true;
      const it = items[i]; const ok = bi === it.bucket;
      if (ok) { right++; btns[bi].classList.add('right'); KS.ui.sfx('pop'); } else { misses.push(it); btns[bi].classList.add('wrong'); btns[it.bucket].classList.add('right'); KS.ui.sfx('bad'); KS.ui.buzz([20, 30, 20]); }
      card.classList.add(ok ? 'ok' : 'no'); btns.forEach(function (b) { b.disabled = true; });
      setTimeout(function () {
        busy = false; i++;
        if (i < items.length) show();
        else {
          card.className = 'bucket-card done'; card.textContent = right + ' / ' + items.length + ' sorted correctly'; row.style.display = 'none'; count.textContent = '';
          api.finish({ score: right / items.length, detail: misses.length ? h('div.fb-detail', h('div.fb-sub', 'The ones that slipped:'), h('ul', misses.map(function (m) { return h('li', h('span', { html: KS.md.inline(m.text) }), ' → ', h('b', { html: KS.md.inline(a.buckets[m.bucket]) })); }))) : null });
        }
      }, KS.fast ? 0 : ok ? 420 : 1100);
    }
    show();
    return { immediate: true, key: function (e) { const n = +e.key; if (n >= 1 && n <= btns.length) { choose(n - 1); return true; } return false; } };
  };

  // =====================================================================
  // cloze — { prompt?, text: 'A {{blank}} here', distractors: [], code?: true, lang?, explain }
  // =====================================================================
  TYPES.cloze = function (api) {
    const a = api.a; const isCode = !!a.code || !!a.lang;
    const src = isCode ? KS.dedent(a.text) : a.text;
    const parts = src.split(/\{\{(.+?)\}\}/g); // even = text, odd = answer
    const blanks = []; let focus = null;
    const flow = h(isCode ? 'pre.cloze.cloze-code' : 'div.cloze.md');
    parts.forEach(function (p, i) {
      if (i % 2 === 0) { if (!p) return; if (isCode) flow.appendChild(document.createTextNode(p)); else flow.appendChild(h('span', { html: KS.md.inline(p).replace(/\n/g, '<br>') })); return; }
      const b = h('button.blank', { type: 'button', onclick: function () { clickBlank(blank); } }, ' ');
      const blank = { el: b, answer: p, chip: null }; blanks.push(blank); flow.appendChild(b);
    });
    const chips = KS.shuffle(blanks.map(function (b) { return b.answer; }).concat(a.distractors || [])).map(function (text) {
      const c = { text: text, used: false, el: null };
      c.el = h('button.chip-btn', { type: 'button', onclick: function () { clickChip(c); } }, text);
      return c;
    });
    const bank = h('div.cloze-bank', chips.map(function (c) { return c.el; }));
    api.body.appendChild(flow); api.body.appendChild(bank);
    function setFocus(b) { blanks.forEach(function (x) { x.el.classList.toggle('focus', x === b); }); focus = b; }
    function clear(b) { if (b.chip) { b.chip.used = false; b.chip.el.classList.remove('used'); b.chip.el.disabled = false; b.chip = null; } b.el.textContent = ' '; b.el.classList.remove('filled'); }
    function clickBlank(b) { if (api.inst.done) return; if (b.chip) clear(b); setFocus(b); KS.ui.sfx('tap'); api.ready(blanks.every(function (x) { return x.chip; })); }
    function clickChip(c) {
      if (api.inst.done || c.used) return;
      const target = (focus && !focus.chip) ? focus : blanks.filter(function (b) { return !b.chip; })[0]; if (!target) return;
      target.chip = c; c.used = true; c.el.classList.add('used'); c.el.disabled = true; target.el.textContent = c.text; target.el.classList.add('filled');
      KS.ui.sfx('tap');
      setFocus(blanks.filter(function (b) { return !b.chip; })[0] || null);
      api.ready(blanks.every(function (x) { return x.chip; }));
    }
    setFocus(blanks[0] || null);
    return {
      check: function () {
        let right = 0;
        blanks.forEach(function (b) {
          const ok = b.chip.text.trim().toLowerCase() === String(b.answer).trim().toLowerCase(); b.el.disabled = true; b.el.classList.remove('focus');
          if (ok) { right++; b.el.classList.add('right'); } else { b.el.classList.add('wrong'); b.el.appendChild(h('span.blank-fix', b.answer)); }
        });
        chips.forEach(function (c) { c.el.disabled = true; });
        api.finish({ score: blanks.length ? right / blanks.length : 0 });
      }
    };
  };

  // =====================================================================
  // spot — { prompt, lang, code, lines: [acceptable 1-based line numbers], explain }
  // =====================================================================
  TYPES.spot = function (api) {
    const a = api.a; let sel = null, selRow = null;
    const src = typeof a.code === 'object' ? a.code.src : a.code; const lang = (typeof a.code === 'object' ? a.code.lang : a.lang) || 'js';
    const block = KS.codeBlock(src, lang, { pick: function (n, row) { if (api.inst.done) return; if (selRow) selRow.classList.remove('picked'); sel = n; selRow = row; row.classList.add('picked'); KS.ui.sfx('tap'); api.ready(true); } });
    api.body.appendChild(h('div.act-hint', 'Tap the line where the problem is.')); api.body.appendChild(block);
    return {
      check: function () {
        const ok = a.lines.indexOf(sel) >= 0;
        KS.$$('.cl', block).forEach(function (row) { const n = +row.dataset.n; row.classList.remove('pickable'); if (a.lines.indexOf(n) >= 0) row.classList.add('right'); else if (n === sel) row.classList.add('wrong'); });
        api.finish({ score: ok ? 1 : 0 });
      }
    };
  };

  // =====================================================================
  // short — { q, accept: ['429', ...], hint?, explain }
  // =====================================================================
  TYPES.short = function (api) {
    const a = api.a; let tries = 0;
    const input = h('input.short-input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'Type your answer…', 'aria-label': 'Your answer' });
    const hint = h('div.act-hint');
    const giveUp = h('button.link-btn', { type: 'button', onclick: function () { reveal(false); } }, 'Show me the answer');
    input.addEventListener('input', function () { api.ready(input.value.trim().length > 0); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && input.value.trim()) { e.preventDefault(); e.stopPropagation(); check(); } });
    api.body.appendChild(h('div.short-row', input)); api.body.appendChild(hint); api.body.appendChild(giveUp);
    if (!api.opts.compact) setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) { /* ok */ } }, 60);
    function reveal(ok) {
      input.disabled = true; giveUp.style.display = 'none'; input.classList.add(ok ? 'right' : 'wrong');
      api.finish({ score: ok ? (tries > 1 ? 0.6 : 1) : 0, correct: ok, note: ok ? null : 'Answer: **' + a.accept[0] + '**' });
    }
    function check() {
      if (api.inst.done) return; tries++;
      const v = norm(input.value); const ok = a.accept.some(function (x) { return norm(x) === v; });
      if (ok) return reveal(true);
      if (tries >= 2) return reveal(false);
      input.classList.add('shake'); setTimeout(function () { input.classList.remove('shake'); }, 420); KS.ui.sfx('bad');
      hint.innerHTML = '💡 ' + KS.md.inline(a.hint || ('Not quite — one more try. It starts with “' + String(a.accept[0]).charAt(0) + '”.'));
    }
    return { check: check };
  };

  // =====================================================================
  // estimate — { q, answer, unit, tolerance (factor, default 3), min?, max?, scale?: 'log'|'linear', explain }
  // =====================================================================
  TYPES.estimate = function (api) {
    const a = api.a; const linear = a.scale === 'linear'; const tol = a.tolerance || (linear ? Math.abs(a.answer) * 0.15 : 3);
    let lo, hi;
    if (linear) { lo = a.min != null ? a.min : 0; hi = a.max != null ? a.max : a.answer * 2; }
    else if (a.min != null && a.max != null) { lo = Math.log10(a.min); hi = Math.log10(a.max); }
    else { // hide the answer somewhere between 25% and 75% of a 6-decade slider
      const r = KS.rng(a.q || 'q')(); const span = 6; const la = Math.log10(a.answer);
      lo = Math.floor(la - span * (0.25 + r * 0.5)); hi = lo + span;
    }
    const val = function (t) { const v = lo + (hi - lo) * t; if (linear) return v; const x = Math.pow(10, v); return +x.toPrecision(2); };
    const slider = h('input.est-slider', { type: 'range', min: '0', max: '1000', value: '500', 'aria-label': 'Your estimate' });
    const out = h('div.est-value'); const unit = a.unit ? ' ' + a.unit : '';
    const show = function () { const v = val(slider.value / 1000); out.innerHTML = '<b>' + (linear ? KS.fmtNum(v) : KS.fmtBig(v)) + '</b>' + KS.esc(unit); };
    slider.addEventListener('input', function () { show(); api.ready(true); });
    const nudge = function (d) { return h('button.btn.sm.ghost', { type: 'button', onclick: function () { slider.value = String(KS.clamp(+slider.value + d, 0, 1000)); show(); api.ready(true); } }, d < 0 ? '−' : '+'); };
    api.body.appendChild(h('div.est', out, h('div.est-row', nudge(-8), slider, nudge(8)), h('div.est-ends', h('span', linear ? KS.fmtNum(val(0)) : KS.fmtBig(val(0))), h('span.muted', linear ? 'drag to estimate' : 'each step right is bigger ×'), h('span', linear ? KS.fmtNum(val(1)) : KS.fmtBig(val(1))))));
    show(); api.ready(false);
    slider._target = linear ? (a.answer - lo) / (hi - lo) : (Math.log10(a.answer) - lo) / (hi - lo);
    return {
      check: function () {
        const g = val(slider.value / 1000); slider.disabled = true; let score, ok, how;
        if (linear) { const d = Math.abs(g - a.answer); ok = d <= tol; score = ok ? 1 : d <= tol * 2.5 ? 0.5 : 0; how = 'off by ' + KS.fmtNum(d); }
        else { const ratio = Math.max(g / a.answer, a.answer / g); ok = ratio <= tol * 1.0001; score = ok ? 1 : ratio <= Math.max(10, tol * 3.4) ? 0.5 : 0; how = ratio < 1.15 ? 'basically dead on' : (ratio >= 10 ? Math.round(ratio) : ratio.toFixed(1)) + '× off'; }
        const fmt = linear ? KS.fmtNum : KS.fmtBig;
        api.finish({ score: score, correct: ok, note: 'You said **' + fmt(g) + unit + '**. Actual: **' + fmt(a.answer) + unit + '** — ' + how + '.' + (ok ? '' : linear ? '' : ' (Within ' + tol + '× counts as right.)') });
      }
    };
  };

  // =====================================================================
  // scenario — { title, intro, steps: [{id?, text, choices: [{label, feedback, score: 0|1|2, to?, end?, effects?}]}], meters?: {name: start}, outro }
  // =====================================================================
  TYPES.scenario = function (api) {
    const a = api.a; const steps = a.steps || []; let cur = 0, total = 0, max = 0, count = 0;
    const meters = a.meters ? Object.assign({}, a.meters) : null;
    const meterEl = h('div.sc-meters'); const stage = h('div.sc-stage');
    if (a.intro) api.body.appendChild(KS.mdEl(a.intro, 'div.md.sc-intro'));
    if (meters) api.body.appendChild(meterEl);
    api.body.appendChild(stage);
    function drawMeters(delta) {
      if (!meters) return; KS.clear(meterEl);
      Object.keys(meters).forEach(function (k) {
        const d = delta && delta[k];
        meterEl.appendChild(h('div.sc-meter', h('div.sc-meter-top', h('span', k), h('span', String(Math.round(meters[k])), d ? h('span.sc-delta.' + (d > 0 ? 'up' : 'dn'), (d > 0 ? '+' : '') + d) : null)), KS.ui.bar(meters[k] / 100, meters[k] < 34 ? 'bad' : meters[k] < 67 ? 'warn' : 'good')));
      });
    }
    function indexOfId(id) { for (let i = 0; i < steps.length; i++) if (steps[i].id === id) return i; return -1; }
    function show() {
      const st = steps[cur]; KS.clear(stage); count++;
      stage.appendChild(h('div.sc-progress', 'Decision ' + count));
      stage.appendChild(KS.mdEl(st.text, 'div.md.sc-text'));
      const opts = h('div.opts');
      st.choices.forEach(function (c, ci) {
        opts.appendChild(h('button.opt', { type: 'button', onclick: function () { choose(st, c, opts); } }, h('span.opt-key', String(ci + 1)), h('span.opt-txt', { html: KS.md.inline(c.label) })));
      });
      stage.appendChild(opts);
      let bestI = 0; st.choices.forEach(function (c, ci) { if ((c.score || 0) > (st.choices[bestI].score || 0)) bestI = ci; }); stage._best = bestI;
      try { KS.content.linkTerms(stage); } catch (e) { /* ok */ }
    }
    function choose(st, c, opts) {
      const sc = c.score == null ? 0 : c.score; total += sc; max += Math.max.apply(null, st.choices.map(function (x) { return x.score || 0; }).concat([1]));
      KS.$$('.opt', opts).forEach(function (b, i) { b.disabled = true; if (st.choices[i] === c) b.classList.add(sc >= 2 ? 'right' : sc === 1 ? 'meh' : 'wrong'); else b.classList.add('dim'); });
      if (meters && c.effects) { for (const k in c.effects) if (meters[k] != null) meters[k] = KS.clamp(meters[k] + c.effects[k], 0, 100); drawMeters(c.effects); }
      KS.ui.sfx(sc >= 2 ? 'good' : sc === 1 ? 'meh' : 'bad');
      let nextIdx = c.to != null ? indexOfId(c.to) : cur + 1; if (c.to != null && nextIdx < 0) nextIdx = steps.length;
      const last = c.end || nextIdx >= steps.length;
      const fbx = h('div.sc-fb.sc-' + (sc >= 2 ? 'good' : sc === 1 ? 'meh' : 'bad'), h('div.sc-fb-head', sc >= 2 ? '✓ Strong move' : sc === 1 ? '◐ Workable, but…' : '✗ That hurt'), KS.mdEl(c.feedback || '', 'div.md'));
      const nb = h('button.btn.primary', { type: 'button', onclick: function () { if (last) end(); else { cur = nextIdx; show(); stage.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } } }, last ? 'See how it went' : 'Next ▸');
      stage.appendChild(fbx); stage.appendChild(h('div.sc-next', nb));
      try { KS.content.linkTerms(fbx); } catch (e) { /* ok */ }
      setTimeout(function () { try { nb.focus({ preventScroll: true }); nb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { /* ok */ } }, 50);
    }
    function end() {
      const ratio = max ? total / max : 0; KS.clear(stage);
      stage.appendChild(h('div.sc-end', KS.ui.mascot(ratio >= 0.85 ? 'cool' : ratio >= 0.5 ? 'happy' : 'sad', 64), h('div', h('div.sc-end-score', total + ' / ' + max + ' decision points'), a.outro ? KS.mdEl(a.outro, 'div.md') : null)));
      api.finish({ score: ratio, correct: ratio >= 0.85, neutral: false, title: ratio >= 0.85 ? 'Excellent judgement.' : ratio >= 0.5 ? 'Decent — a few bumps.' : 'Rough ride — worth a replay.' });
    }
    drawMeters(); if (steps.length) show(); else api.finish({ score: 1, neutral: true });
    return { immediate: true, key: function (e) { const n = +e.key; const b = KS.$$('.sc-stage .opt:not(:disabled)', api.body)[n - 1]; if (b) { b.click(); return true; } return false; } };
  };

  // =====================================================================
  // explain — { prompt, model, keywords: [] }   (self-graded Feynman check)
  // =====================================================================
  TYPES.explain = function (api) {
    const a = api.a; const saved = api.opts.key && KS.store.state.explain[api.opts.key];
    const ta = h('textarea.explain-input', { rows: api.opts.compact ? '3' : '5', placeholder: api.opts.compact ? 'Say it in your head (or type it), then reveal…' : 'Explain it in your own words, as if to a friend who is not a developer…' });
    if (saved && saved.t) ta.value = saved.t;
    const reveal = h('button.btn', { type: 'button', onclick: show }, 'Compare with a model answer');
    const after = h('div.explain-after');
    api.body.appendChild(ta); api.body.appendChild(h('div.explain-row', reveal)); api.body.appendChild(after);
    function show() {
      reveal.style.display = 'none'; ta.readOnly = true;
      const text = ta.value.toLowerCase(); const kws = a.keywords || [];
      after.appendChild(h('div.explain-model', h('div.fb-sub', 'A good answer sounds like:'), KS.mdEl(a.model, 'div.md')));
      if (kws.length) after.appendChild(h('div.explain-kws', h('div.fb-sub', 'Key ideas' + (ta.value.trim() ? ' (✓ = you mentioned it)' : '') + ':'), h('div.kw-row', kws.map(function (k) { const hit = text.indexOf(String(k).toLowerCase()) >= 0; return h('span.kw' + (hit ? '.hit' : ''), (hit ? '✓ ' : '') + k); }))));
      const rate = function (label, sc, cls) { return h('button.btn.' + cls, { type: 'button', onclick: function () { done(sc); } }, label); };
      after.appendChild(h('div.explain-rate', h('div.fb-sub', 'Be honest — how did yours compare?'), h('div.rate-row', rate('😬 Missed it', 0, 'ghost'), rate('🤏 Partly', 0.5, 'ghost'), rate('💪 Nailed it', 1, 'primary'))));
      try { KS.content.linkTerms(after); } catch (e) { /* ok */ }
    }
    function done(sc) {
      if (api.opts.key) { KS.store.state.explain[api.opts.key] = { t: ta.value.slice(0, 2000), r: sc, u: Date.now() }; KS.store.save(); }
      KS.$$('.rate-row button', after).forEach(function (b) { b.disabled = true; });
      api.finish({ score: sc, correct: sc >= 1, neutral: true, title: sc >= 1 ? 'Solid — you can teach this.' : sc > 0 ? 'Getting there. Re-read the model answer once more.' : 'No stress — that\'s what this step is for.' });
    }
    return { immediate: true };
  };

})();
