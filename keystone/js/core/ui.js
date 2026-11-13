/* Keystone — shared UI kit: icons, toasts, modals, confetti, sound, haptics, mascot, popovers. */
(function () {
  'use strict';
  const KS = window.KS, h = KS.h, s = KS.s;
  const U = (KS.ui = {});

  // ---------- icons (inline SVG, stroke-based) ----------
  const ICONS = {
    home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
    map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
    flask: 'M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M7.5 15h9',
    game: 'M6 9h12a4 4 0 014 4v2a3 3 0 01-5.2 2L15 15H9l-1.8 2A3 3 0 012 15v-2a4 4 0 014-4zM7 12v2M6 13h2M16 12.5h.01M18 14h.01',
    book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h13M8 7h7M8 11h5',
    route: 'M6 19a2 2 0 100-4 2 2 0 000 4zM18 9a2 2 0 100-4 2 2 0 000 4zM8 17h6a3 3 0 000-6h-4a3 3 0 010-6h6',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
    search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
    x: 'M6 6l12 12M18 6L6 18',
    check: 'M5 12.5l4.5 4.5L19 7',
    left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7', up: 'M5 15l7-7 7 7', down: 'M5 9l7 7 7-7',
    flame: 'M12 3c1 3 4 4.5 4 8.5a4 4 0 01-8 0c0-1.5.5-2.5 1-3 .2 1.2 1 2 2 2 0-3-1-5 1-7.5zM7 14a5 5 0 0010 0',
    star: 'M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8L12 3z',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
    gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 00-2.2-1.3L14 3h-4l-.4 2.4a7 7 0 00-2.2 1.3l-2.3-.9-2 3.4 2 1.5a7 7 0 000 2.6l-2 1.5 2 3.4 2.3-.9a7 7 0 002.2 1.3L10 21h4l.4-2.4a7 7 0 002.2-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z',
    phone: 'M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zM11 18h2',
    monitor: 'M3 5h18v11H3zM8 21h8M12 16v5',
    lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3',
    play: 'M7 4l13 8-13 8V4z', pause: 'M7 4h3v16H7zM14 4h3v16h-3z',
    refresh: 'M20 11a8 8 0 10-2.3 6.3M20 4v7h-7',
    bookmark: 'M6 3h12v18l-6-4-6 4V3z',
    note: 'M5 3h10l4 4v14H5zM14 3v5h5M8 13h8M8 17h6',
    volume: 'M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 010 7M19 6a9 9 0 010 12',
    mute: 'M4 9v6h4l5 4V5L8 9H4zM17 9l5 6M22 9l-5 6',
    moon: 'M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z',
    sun: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
    trophy: 'M8 4h8v5a4 4 0 01-8 0V4zM8 6H4v1a4 4 0 004 4M16 6h4v1a4 4 0 01-4 4M12 13v4M8 21h8M9 17h6v4H9z',
    target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 17a5 5 0 100-10 5 5 0 000 10zM12 13a1 1 0 100-2 1 1 0 000 2z',
    cards: 'M4 7h12v13H4zM8 7V4h12v13h-4',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    cloud: 'M7 18a4 4 0 01-.5-8A6 6 0 0118 9.5a4.2 4.2 0 01-.5 8.5H7z',
    download: 'M12 3v12M7 10l5 5 5-5M4 21h16', upload: 'M12 15V3M7 8l5-5 5 5M4 21h16',
    info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7.5h.01',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
    heart: 'M12 20s-7-4.4-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.6-9 9-9 9z',
    skip: 'M5 5l9 7-9 7V5zM18 5v14', menu: 'M4 6h16M4 12h16M4 18h16', ext: 'M14 4h6v6M20 4l-9 9M19 14v6H5V6h6'
  };
  U.icon = function (name, size) {
    const d = ICONS[name] || ICONS.info; const z = size || 20;
    const svg = s('svg.ico', { viewBox: '0 0 24 24', width: z, height: z, fill: 'none', stroke: 'currentColor', 'stroke-width': '1.9', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
    svg.appendChild(s('path', { d: d }));
    return svg;
  };

  // ---------- theme ----------
  U.applyTheme = function () {
    const st = KS.store.state.settings; let t = st.theme || 'dark';
    if (t === 'auto') { try { t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; } catch (e) { t = 'dark'; } }
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.classList.toggle('no-motion', st.motion === false);
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', t === 'light' ? '#f4f5fb' : '#0e1020');
  };

  // ---------- toasts ----------
  let toastHost = null;
  U.toast = function (msg, kind, ms) {
    if (!toastHost) { toastHost = h('div.toasts', { 'aria-live': 'polite' }); document.body.appendChild(toastHost); }
    const t = h('div.toast' + (kind ? '.toast-' + kind : ''), typeof msg === 'string' ? { html: KS.md.inline(msg) } : null, typeof msg === 'string' ? null : msg);
    toastHost.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 320); }, ms || 2600);
    return t;
  };

  // ---------- modal ----------
  /** U.modal({title, body: Node|string(md), actions:[{label, kind, onClick, close:true}], wide, onClose}) → {close, el} */
  U.modal = function (o) {
    const prev = document.activeElement;
    const box = h('div.modal' + (o.wide ? '.wide' : '') + (o.cls ? '.' + o.cls : ''), { role: 'dialog', 'aria-modal': 'true' });
    const back = h('div.modal-back', box);
    function close() { back.classList.add('out'); document.removeEventListener('keydown', onKey, true); setTimeout(function () { back.remove(); }, 180); if (o.onClose) o.onClose(); if (prev && prev.focus) try { prev.focus(); } catch (e) { /* gone */ } }
    function onKey(e) { if (e.key === 'Escape' && o.dismiss !== false) { e.stopPropagation(); close(); } }
    if (o.title || o.dismiss !== false) box.appendChild(h('div.modal-head', h('h3', o.title || ''), o.dismiss !== false ? h('button.icon-btn', { type: 'button', 'aria-label': 'Close', onclick: close }, U.icon('x')) : null));
    const body = h('div.modal-body'); box.appendChild(body);
    if (typeof o.body === 'string') body.appendChild(KS.mdEl(o.body)); else if (o.body) body.appendChild(o.body);
    if (o.actions && o.actions.length) {
      const foot = h('div.modal-foot');
      o.actions.forEach(function (a) { foot.appendChild(h('button.btn' + (a.kind ? '.' + a.kind : ''), { type: 'button', onclick: function () { let keep = false; if (a.onClick) keep = a.onClick() === false; if (a.close !== false && !keep) close(); } }, a.label)); });
      box.appendChild(foot);
    }
    back.addEventListener('mousedown', function (e) { if (e.target === back && o.dismiss !== false) close(); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(back);
    const f = box.querySelector('input,textarea,select,button.primary') || box.querySelector('button'); if (f) setTimeout(function () { f.focus(); }, 30);
    return { close: close, el: box, body: body };
  };
  U.confirm = function (title, text, yesLabel, danger) {
    return new Promise(function (resolve) {
      let answered = false;
      U.modal({ title: title, body: text, onClose: function () { if (!answered) resolve(false); }, actions: [
        { label: 'Cancel', kind: 'ghost', onClick: function () { answered = true; resolve(false); } },
        { label: yesLabel || 'OK', kind: danger ? 'danger' : 'primary', onClick: function () { answered = true; resolve(true); } }
      ] });
    });
  };

  // ---------- sound (WebAudio blips; no files) ----------
  let ctx = null;
  function tone(freq, start, dur, type, gain) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    const t0 = ctx.currentTime + start;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain || 0.08, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  const SFX = {
    good: function () { tone(660, 0, 0.12, 'triangle'); tone(990, 0.09, 0.18, 'triangle'); },
    bad: function () { tone(220, 0, 0.16, 'sawtooth', 0.045); tone(175, 0.1, 0.22, 'sawtooth', 0.045); },
    meh: function () { tone(440, 0, 0.12, 'triangle'); tone(415, 0.1, 0.16, 'triangle'); },
    tap: function () { tone(520, 0, 0.05, 'sine', 0.04); },
    flip: function () { tone(380, 0, 0.06, 'sine', 0.04); tone(560, 0.04, 0.06, 'sine', 0.04); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.09, 0.22, 'triangle'); }); },
    level: function () { [392, 523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * 0.07, 0.25, 'triangle', 0.07); }); },
    tick: function () { tone(880, 0, 0.03, 'square', 0.02); },
    pop: function () { tone(700, 0, 0.07, 'sine', 0.05); }
  };
  U.sfx = function (name) {
    if (!KS.store.state.settings.sound) return;
    try {
      if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); }
      if (ctx.state === 'suspended') ctx.resume();
      (SFX[name] || SFX.tap)();
    } catch (e) { /* audio blocked */ }
  };
  U.buzz = function (pattern) {
    if (!KS.store.state.settings.haptics || !navigator.vibrate) return;
    try { navigator.vibrate(pattern || 12); } catch (e) { /* unsupported */ }
  };

  // ---------- confetti ----------
  U.confetti = function (opts) {
    if (KS.reduceMotion()) return;
    opts = opts || {};
    const c = h('canvas.confetti'); document.body.appendChild(c);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = (c.width = innerWidth * dpr), H = (c.height = innerHeight * dpr);
    const g = c.getContext('2d'); const cols = ['#7c5cff', '#22d3ee', '#34d399', '#fbbf24', '#fb7185', '#f472b6'];
    const n = opts.count || 120; const parts = [];
    for (let i = 0; i < n; i++) parts.push({ x: W * (0.5 + (Math.random() - 0.5) * 0.3), y: H * 0.36, vx: (Math.random() - 0.5) * 16 * dpr, vy: (-Math.random() * 15 - 5) * dpr, s: (Math.random() * 7 + 4) * dpr, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[i % cols.length], sh: i % 3 });
    let frame = 0;
    (function step() {
      frame++; g.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.vy += 0.42 * dpr; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - frame / 130);
        if (p.sh === 0) g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); else if (p.sh === 1) { g.beginPath(); g.arc(0, 0, p.s / 2.4, 0, 7); g.fill(); } else { g.beginPath(); g.moveTo(0, -p.s / 2); g.lineTo(p.s / 2, p.s / 2); g.lineTo(-p.s / 2, p.s / 2); g.fill(); }
        g.restore();
      });
      if (frame < 130) requestAnimationFrame(step); else c.remove();
    })();
  };

  // ---------- small visual widgets ----------
  /** Circular progress ring. pct 0..1 */
  U.ring = function (pct, size, stroke, inner) {
    size = size || 56; stroke = stroke || 6; const r = (size - stroke) / 2; const c = 2 * Math.PI * r;
    const svg = s('svg.ring', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size });
    svg.appendChild(s('circle.ring-bg', { cx: size / 2, cy: size / 2, r: r, 'stroke-width': stroke, fill: 'none' }));
    svg.appendChild(s('circle.ring-fg', { cx: size / 2, cy: size / 2, r: r, 'stroke-width': stroke, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': c, 'stroke-dashoffset': c * (1 - KS.clamp(pct, 0, 1)), transform: 'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')' }));
    return h('div.ring-wrap', { style: { width: size + 'px', height: size + 'px' } }, svg, inner != null ? h('div.ring-inner', inner) : null);
  };
  U.bar = function (pct, cls) { return h('div.bar' + (cls ? '.' + cls : ''), h('div.bar-fill', { style: { width: Math.round(KS.clamp(pct, 0, 1) * 100) + '%' } })); };
  U.stars = function (n, max) {
    const w = h('span.stars', { 'aria-label': n + ' of ' + (max || 3) + ' stars' });
    for (let i = 0; i < (max || 3); i++) w.appendChild(h('span.star' + (i < n ? '.on' : ''), '★'));
    return w;
  };
  U.chip = function (text, cls) { return h('span.chip' + (cls ? '.' + cls : ''), text); };
  U.empty = function (emoji, title, sub, action) {
    return h('div.empty', h('div.empty-emoji', emoji), h('h3', title), sub ? h('p.muted', sub) : null, action || null);
  };
  U.spinner = function (label) { return h('div.spinner-wrap', h('div.spinner'), label ? h('div.muted', label) : null); };

  /** Kip, the keystone mascot. mood: happy | wow | sad | think | cool */
  U.mascot = function (mood, size) {
    size = size || 72; mood = mood || 'happy';
    const svg = s('svg.kip.kip-' + mood, { viewBox: '0 0 80 80', width: size, height: size, 'aria-hidden': 'true' });
    const defs = s('defs'); const gid = 'kipg' + Math.random().toString(36).slice(2, 7);
    const gr = s('linearGradient', { id: gid, x1: '0', y1: '0', x2: '1', y2: '1' }); gr.appendChild(s('stop', { offset: '0', 'stop-color': '#9b85ff' })); gr.appendChild(s('stop', { offset: '1', 'stop-color': '#5b3df0' }));
    defs.appendChild(gr); svg.appendChild(defs);
    svg.appendChild(s('ellipse', { cx: 40, cy: 74, rx: 20, ry: 3.5, fill: 'rgba(0,0,0,.22)' }));
    svg.appendChild(s('path', { d: 'M14 12 Q14 8 18 8 H62 Q66 8 66 12 L56 66 Q55 70 51 70 H29 Q25 70 24 66 Z', fill: 'url(#' + gid + ')' }));
    svg.appendChild(s('path', { d: 'M19 13 H61 L59 24 H21 Z', fill: 'rgba(255,255,255,.16)' }));
    const eyeY = mood === 'think' ? 35 : 36;
    if (mood === 'cool') {
      svg.appendChild(s('path', { d: 'M24 32 H56 V38 Q56 43 50 43 H45 Q42 43 41 39 H39 Q38 43 35 43 H30 Q24 43 24 38 Z', fill: '#14122b' }));
    } else {
      svg.appendChild(s('circle', { cx: 31, cy: eyeY, r: mood === 'wow' ? 6 : 5, fill: '#fff' }));
      svg.appendChild(s('circle', { cx: 49, cy: eyeY, r: mood === 'wow' ? 6 : 5, fill: '#fff' }));
      svg.appendChild(s('circle', { cx: mood === 'think' ? 33 : 31.5, cy: mood === 'sad' ? eyeY + 1.5 : mood === 'think' ? eyeY - 1.5 : eyeY, r: 2.4, fill: '#14122b' }));
      svg.appendChild(s('circle', { cx: mood === 'think' ? 51 : 49.5, cy: mood === 'sad' ? eyeY + 1.5 : mood === 'think' ? eyeY - 1.5 : eyeY, r: 2.4, fill: '#14122b' }));
    }
    const mouths = { happy: 'M33 50 Q40 57 47 50', wow: 'M40 48 a3.4 4 0 1 0 0.01 0', sad: 'M34 54 Q40 48 46 54', think: 'M35 52 H45', cool: 'M33 51 Q40 56 47 51' };
    svg.appendChild(s('path', { d: mouths[mood] || mouths.happy, fill: mood === 'wow' ? '#14122b' : 'none', stroke: '#14122b', 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
    if (mood === 'happy' || mood === 'cool') { svg.appendChild(s('circle', { cx: 25, cy: 46, r: 3, fill: 'rgba(255,150,190,.55)' })); svg.appendChild(s('circle', { cx: 55, cy: 46, r: 3, fill: 'rgba(255,150,190,.55)' })); }
    return svg;
  };
  U.logo = function (size) {
    const z = size || 30; const svg = s('svg.logo', { viewBox: '0 0 64 64', width: z, height: z, 'aria-hidden': 'true' });
    const gid = 'lg' + Math.random().toString(36).slice(2, 7); const defs = s('defs'); const gr = s('linearGradient', { id: gid, x1: '0', y1: '0', x2: '1', y2: '1' });
    gr.appendChild(s('stop', { offset: '0', 'stop-color': '#8b6dff' })); gr.appendChild(s('stop', { offset: '1', 'stop-color': '#22c7e8' })); defs.appendChild(gr); svg.appendChild(defs);
    svg.appendChild(s('rect', { x: 2, y: 2, width: 60, height: 60, rx: 16, fill: 'url(#' + gid + ')' }));
    svg.appendChild(s('path', { d: 'M12 50 V36 A20 20 0 0 1 52 36 V50 H42 V36 A10 10 0 0 0 22 36 V50 Z', fill: 'rgba(255,255,255,.92)' }));
    svg.appendChild(s('path', { d: 'M26.5 14.5 H37.5 L35.5 27 H28.5 Z', fill: '#ffd24a' }));
    return svg;
  };

  // ---------- glossary popover ----------
  let pop = null;
  U.closePop = function () { if (pop) { pop.remove(); pop = null; } };
  U.termPopover = function (anchor, slug) {
    U.closePop();
    const g = KS.content.term(slug); if (!g) return;
    const lessonId = g.lessons[0]; const meta = KS.content.meta(lessonId);
    pop = h('div.popover', { role: 'dialog' },
      h('div.pop-term', g.term),
      h('div.pop-def', { html: KS.md.inline(g.def) }),
      g.like ? h('div.pop-like', h('span', '🎭 '), h('span', { html: KS.md.inline(g.like) })) : null,
      meta ? h('a.pop-link', { href: '#/lesson/' + lessonId, onclick: function () { U.closePop(); } }, 'From: ' + meta.title + ' →') : null);
    document.body.appendChild(pop);
    const r = anchor.getBoundingClientRect(); const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let left = r.left + r.width / 2 - pw / 2; left = KS.clamp(left, 8, innerWidth - pw - 8);
    let top = r.bottom + 8; if (top + ph > innerHeight - 8) top = Math.max(8, r.top - ph - 8);
    pop.style.left = left + window.scrollX + 'px'; pop.style.top = top + window.scrollY + 'px';
  };
  document.addEventListener('click', function (e) {
    const t = e.target.closest ? e.target.closest('.term') : null;
    if (t && t.dataset.term) { e.preventDefault(); e.stopPropagation(); U.termPopover(t, t.dataset.term); return; }
    if (pop && !pop.contains(e.target)) U.closePop();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') U.closePop();
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList && document.activeElement.classList.contains('term')) { e.preventDefault(); U.termPopover(document.activeElement, document.activeElement.dataset.term); }
  });
  window.addEventListener('hashchange', U.closePop);
  window.addEventListener('scroll', function () { if (pop) U.closePop(); }, true);

  /** Floating "+N XP" pop near an element (or screen centre). */
  U.xpPop = function (n, anchor) {
    if (!n || KS.reduceMotion()) return;
    const el = h('div.xp-pop', '+' + n + ' XP'); document.body.appendChild(el);
    let x = innerWidth / 2, y = innerHeight * 0.6;
    if (anchor && anchor.getBoundingClientRect) { const r = anchor.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top; }
    el.style.left = x + 'px'; el.style.top = y + 'px';
    setTimeout(function () { el.remove(); }, 1100);
  };
  U.download = function (filename, text, mime) {
    const blob = new Blob([text], { type: mime || 'application/json' }); const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: filename }); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  };
  U.timeAgo = function (ts) {
    const sec = (Date.now() - ts) / 1000;
    if (sec < 90) return 'just now'; if (sec < 3600) return Math.round(sec / 60) + ' min ago';
    if (sec < 86400) return Math.round(sec / 3600) + ' h ago'; return Math.round(sec / 86400) + ' d ago';
  };
})();
