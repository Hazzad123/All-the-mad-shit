/* Keystone — developer self-test (not loaded in production pages).
 * Open  index.html?dev  (the Studio plus this file) and, in the browser console, run:
 *   await KS.selftest.content()          → renders every card, solves every activity (right and wrong), every boss + sheet
 *   await KS.selftest.content(['http-methods'])
 *   await KS.selftest.playLesson(true)   → drives the real lesson player currently on screen from intro to recap
 *   await KS.selftest.labs()             → mounts every lab and monkey-clicks it, reporting exceptions
 * In fast mode nothing waits on timers (background tabs throttle them to once a second or slower), so a full
 * content run takes seconds. It yields to the browser through a MessageChannel, which is not throttled.
 */
(function () {
  'use strict';
  const KS = window.KS; const T = (KS.selftest = {});
  const sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  const yieldNow = function () { return new Promise(function (r) { const ch = new MessageChannel(); ch.port1.onmessage = function () { r(); }; ch.port2.postMessage(0); }); };
  const pause = function (ms) { return KS.fast ? Promise.resolve() : sleep(ms); };

  /** Solve one activity instance through its real UI. right=false answers wrongly. */
  T.solve = async function (inst, right) {
    const a = inst.a, el = inst.el; const q = function (s) { return Array.from(el.querySelectorAll(s)); };
    switch (a.type) {
      case 'mcq': { const want = right ? a.answer : (a.answer + 1) % a.options.length; q('.opt').find(function (b) { return b._oi === want; }).click(); break; }
      case 'multi': { const set = right ? a.answers : [a.options.map(function (_, i) { return i; }).find(function (i) { return a.answers.indexOf(i) < 0; })]; q('.opt').forEach(function (b) { if (set.indexOf(b._oi) >= 0) b.click(); }); inst.check(); break; }
      case 'tf': { const v = right ? !!a.answer : !a.answer; el.querySelector(v ? '.tf-true' : '.tf-false').click(); break; }
      case 'ab': { const k = right ? a.answer : (a.answer === 'a' ? 'b' : 'a'); q('.ab-pick').find(function (b) { return b._k === k; }).click(); break; }
      case 'match': {
        const cols = q('.match-col'); const L = Array.from(cols[0].children), R = Array.from(cols[1].children);
        const find = function (list, i) { return list.find(function (b) { return b._i === i; }); };
        if (!right) { find(L, 0).click(); find(R, 1).click(); }
        for (let i = 0; i < a.pairs.length; i++) { find(L, i).click(); find(R, i).click(); }
        break; }
      case 'order': {
        const n = a.items.length; const seq = []; for (let i = 0; i < n; i++) seq.push(right ? i : n - 1 - i);
        seq.forEach(function (i) { const b = q('.order-pool .order-item').find(function (x) { return x._i === i; }); if (!b) throw new Error('order: item ' + i + ' not in pool'); b.click(); });
        inst.check(); break; }
      case 'bucket': {
        for (let guard = 0; guard < 60 && !inst.done; guard++) { const card = el.querySelector('.bucket-card'); const btns = q('.bucket-btn'); if (btns[0] && btns[0].disabled) { await pause(10); continue; } const want = right ? card._bucket : (card._bucket + 1) % btns.length; btns[want].click(); await pause(12); }
        break; }
      case 'cloze': {
        const answers = Array.from(a.text.matchAll(/\{\{(.+?)\}\}/g)).map(function (m) { return m[1]; });
        answers.forEach(function (ans, k) { const want = (!right && k === 0) ? a.distractors[0] : ans; const chip = q('.chip-btn').find(function (c) { return !c.disabled && c.textContent === String(want); }); if (!chip) throw new Error('cloze: no chip for "' + want + '"'); chip.click(); });
        inst.check(); break; }
      case 'spot': {
        const n = right ? a.lines[0] : (a.lines.indexOf(1) >= 0 ? (a.lines.indexOf(2) >= 0 ? 3 : 2) : 1); const row = el.querySelector('.act-body .cl[data-n="' + n + '"]'); if (!row) throw new Error('spot: no line ' + n);
        row.click(); inst.check(); break; }
      case 'short': { const input = el.querySelector('.short-input'); input.value = right ? a.accept[0] : 'zzzz'; input.dispatchEvent(new Event('input')); inst.check(); if (!right) inst.check(); break; }
      case 'estimate': {
        const s = el.querySelector('.est-slider'); if (!(s._target > 0.03 && s._target < 0.97)) throw new Error('estimate: the answer sits off the slider (' + s._target.toFixed(2) + ')');
        s.value = String(Math.round((right ? s._target : (s._target > 0.5 ? 0 : 1)) * 1000)); s.dispatchEvent(new Event('input')); inst.check(); break; }
      case 'scenario': {
        for (let guard = 0; guard < 40 && !inst.done; guard++) {
          const stage = el.querySelector('.sc-stage'); const opts = Array.from(stage.querySelectorAll('.opts .opt')); const live = opts.filter(function (b) { return !b.disabled; });
          if (live.length) opts[right ? stage._best : (stage._best === 0 ? 1 : 0)].click();
          const nb = stage.querySelector('.sc-next button'); if (nb) nb.click(); else if (!live.length) break;
        }
        break; }
      case 'explain': { el.querySelector('.explain-row button').click(); q('.rate-row button')[right ? 2 : 0].click(); break; }
      default: throw new Error('no solver for type ' + a.type);
    }
    await pause(4);
    if (!inst.done) throw new Error(a.type + ': did not finish');
    const sc = inst.result ? inst.result.score : null;
    if (right && a.type !== 'explain' && !(sc >= 0.99)) throw new Error(a.type + ': the right answer only scored ' + sc);
    if (!right && ['explain', 'match'].indexOf(a.type) < 0 && sc >= 0.99) throw new Error(a.type + ': a wrong answer scored full marks');
  };

  /** Render every card and exercise every activity (right and wrong) of the given lessons, off-screen. */
  T.content = async function (lessonIds) {
    KS.fast = true; const st = KS.store.state.settings; const sound = st.sound, hap = st.haptics; st.sound = false; st.haptics = false;
    const saved = JSON.stringify(KS.store.state.explain);
    const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-9999px;top:0;width:760px;'; document.body.appendChild(host);
    const report = { lessons: 0, cards: 0, acts: 0, bosses: 0, sheets: 0, errors: [] };
    try {
    const ids = lessonIds || KS.content.order.filter(function (id) { return KS.content.lessons[id]; });
    for (const id of ids) {
      const L = KS.content.lessons[id]; if (!L) { report.errors.push(id + ': no content loaded'); continue; }
      report.lessons++;
      (L.cards || []).forEach(function (c, i) {
        try { const el = KS.cards.render(c); host.appendChild(el); if (el._advance) { let n = 0; while (el._advance() && n++ < 60) { /* reveal all */ } } report.cards++; }
        catch (e) { report.errors.push(id + ' card ' + i + ' (' + c.kind + '): ' + e.message); }
        host.textContent = '';
      });
      for (let i = 0; i < (L.activities || []).length; i++) {
        const a = L.activities[i];
        for (const right of [true, false]) {
          try { const inst = KS.act.create(a, {}); host.appendChild(inst.el); await T.solve(inst, right); inst.destroy(); report.acts++; }
          catch (e) { report.errors.push(id + ' act ' + i + ' (' + a.type + ', ' + (right ? 'right' : 'wrong') + ' answer): ' + e.message); }
          host.textContent = '';
        }
      }
      try { KS.player.steps(KS.content.meta(id), L); } catch (e) { report.errors.push(id + ' steps: ' + e.message); }
      if (report.lessons % 8 === 0) await yieldNow();
    }
    if (!lessonIds) {
      for (const mid of Object.keys(KS.content.bosses)) {
        const b = KS.content.bosses[mid]; report.bosses++;
        for (let i = 0; i < (b.questions || []).length; i++) {
          try { const inst = KS.act.create(b.questions[i], {}); host.appendChild(inst.el); await T.solve(inst, true); report.acts++; } catch (e) { report.errors.push('boss ' + mid + ' q' + i + ' (' + b.questions[i].type + '): ' + e.message); }
          host.textContent = '';
        }
      }
      for (const mid of Object.keys(KS.content.sheets)) { try { host.appendChild(KS.panels.sheet(mid)); report.sheets++; } catch (e) { report.errors.push('sheet ' + mid + ': ' + e.message); } host.textContent = ''; }
    }
    } finally { host.remove(); KS.fast = false; st.sound = sound; st.haptics = hap; KS.store.state.explain = JSON.parse(saved); }
    return report;
  };

  /** Drive the lesson player that is currently open, from wherever it is to the recap. */
  T.playLesson = async function (right) {
    KS.fast = true; const log = [];
    for (let guard = 0; guard < 400; guard++) {
      const d = KS.player.debug; if (!d) throw new Error('no lesson player is open');
      log.push(d.step.t + (d.step.i != null ? d.step.i : ''));
      if (d.step.t === 'recap') break;
      if (d.step.t === 'act' && d.inst && !d.inst.done) await T.solve(d.inst, right !== false);
      d.next(); await sleep(25);
    }
    KS.fast = false;
    return { steps: log.join(' '), recap: !!document.querySelector('.recap'), text: (document.querySelector('.recap') || {}).innerText };
  };

  /** Mount every lab, poke every control, report anything that throws. */
  T.labs = async function (ids) {
    await KS.labs.whenReady();
    const errors = []; const report = { labs: 0, clicks: 0, errors: errors }; let current = '';
    const onErr = function (e) { errors.push(current + ': ' + (e.message || (e.reason && e.reason.message) || String(e.reason || e))); };
    window.addEventListener('error', onErr); window.addEventListener('unhandledrejection', onErr);
    const cerr = console.error; console.error = function () { errors.push(current + ': console.error ' + Array.prototype.map.call(arguments, function (x) { return x && x.message ? x.message : String(x); }).join(' ').slice(0, 300)); cerr.apply(console, arguments); };
    const st = KS.store.state.settings; const sound = st.sound; st.sound = false;
    const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:0;top:0;width:1000px;height:700px;overflow:auto;opacity:.01;pointer-events:none;z-index:-1'; document.body.appendChild(host);
    for (const def of KS.labs.list()) {
      if (ids && ids.indexOf(def.id) < 0) continue;
      current = def.id; report.labs++;
      if (!def.goals || def.goals.length < 2) errors.push(def.id + ': should define at least 2 goals');
      const ctl = KS.labs.mount(host, def.id, { fresh: true }); await sleep(120);
      for (let round = 0; round < 3; round++) {
        const els = Array.from(host.querySelectorAll('.lab-root button, .lab-root input, .lab-root select, .lab-root .clickable, .lab-root [role="button"]'));
        for (const el of els.slice(0, 70)) {
          if (!el.isConnected || el.disabled) continue;
          try {
            if (el.tagName === 'INPUT' && el.type === 'range') { el.value = round % 2 ? el.min : el.max; el.dispatchEvent(new Event('input', { bubbles: true })); }
            else if (el.tagName === 'INPUT' && el.type === 'checkbox') { el.click(); }
            else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { el.value = round ? 'test' : el.value; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); }
            else if (el.tagName === 'SELECT') { el.selectedIndex = (el.selectedIndex + 1) % el.options.length; el.dispatchEvent(new Event('change', { bubbles: true })); }
            else if (typeof el.click === 'function') el.click(); else el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            report.clicks++;
          } catch (e) { errors.push(def.id + ': ' + e.message); }
          await sleep(6);
        }
        await sleep(150);
      }
      try { ctl.destroy(); } catch (e) { errors.push(def.id + ': destroy threw ' + e.message); }
      host.textContent = ''; await sleep(30);
    }
    host.remove(); st.sound = sound; console.error = cerr; window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onErr);
    return report;
  };
})();
