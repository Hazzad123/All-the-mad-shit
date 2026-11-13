/* Keystone — XP, levels, daily goal, streaks, achievements, spaced-repetition scheduling. */
(function () {
  'use strict';
  const KS = window.KS, h = KS.h, S = KS.store;
  const G = (KS.game = {});

  // ---------- levels ----------
  const TITLES = [[1, 'Curious Coder'], [3, 'Apprentice'], [5, 'Junior Builder'], [8, 'Systems Thinker'], [11, 'Backend Engineer'], [14, 'Senior Engineer'], [17, 'Tech Lead'], [20, 'Staff Engineer'], [23, 'Solutions Architect'], [26, 'Principal Architect'], [30, 'Keystone Master']];
  G.xpFor = function (level) { return Math.round(40 * Math.pow(level - 1, 1.9)); };
  G.level = function (xp) {
    if (xp == null) xp = S.totalXp();
    let n = 1; while (G.xpFor(n + 1) <= xp) n++;
    let title = TITLES[0][1]; TITLES.forEach(function (t) { if (n >= t[0]) title = t[1]; });
    const floor = G.xpFor(n), next = G.xpFor(n + 1);
    return { n: n, title: title, floor: floor, next: next, pct: (xp - floor) / (next - floor), xp: xp, toGo: next - xp };
  };

  /** Award XP with celebration + level-up + goal detection. Returns the amount awarded. */
  G.award = function (xp, opts) {
    opts = opts || {};
    xp = Math.max(0, Math.round(xp)); if (!xp) return 0;
    const before = G.level(); const goalBefore = G.goal();
    S.addXp(xp);
    if (!opts.silent) KS.ui.xpPop(xp, opts.anchor);
    const after = G.level(); const goalAfter = G.goal();
    if (after.n > before.n) setTimeout(function () { G.levelUp(after); }, opts.delay || 500);
    if (!goalBefore.met && goalAfter.met) setTimeout(function () { KS.ui.toast('🎯 **Daily goal smashed!** ' + goalAfter.goal + ' XP today.', 'good', 3600); KS.ui.sfx('win'); }, 900);
    G.queueCheck();
    return xp;
  };
  G.levelUp = function (lv) {
    // A toast, not a modal: levelling up must never interrupt a lesson or steal the Continue button.
    KS.ui.sfx('level'); KS.ui.confetti({ count: 140 });
    KS.ui.toast(h('div.ach-toast', KS.ui.mascot('wow', 46), h('div', h('div.ach-kicker', 'Level up'), h('b', 'Level ' + lv.n + ' · ' + lv.title), h('div.muted', KS.fmtNum(lv.toGo) + ' XP to level ' + (lv.n + 1)))), 'ach', 4600);
  };
  G.goal = function () { const goal = S.state.settings.goal || 50; const xp = S.todayXp(); return { goal: goal, xp: xp, pct: Math.min(1, xp / goal), met: xp >= goal }; };

  // ---------- achievements ----------
  function lessonsDone() { let n = 0; const L = S.state.lessons; for (const k in L) if (L[k].done && KS.content.metaById[k]) n++; return n; }
  function threeStars() { let n = 0; const L = S.state.lessons; for (const k in L) if (L[k].stars >= 3) n++; return n; }
  function bossesWon() { let n = 0; const B = S.state.bosses; for (const k in B) if (B[k].passed) n++; return n; }
  function reviews() { let n = 0; const D = S.state.days; for (const d in D) for (const k in D[d]) n += D[d][k].r || 0; return n; }
  function goalDays() { let n = 0; const goal = S.state.settings.goal || 50; for (const d in S.state.days) if (S.dayTotals(d).x >= goal) n++; return n; }
  function labsDone() { if (!KS.labs) return 0; let n = 0; KS.labs.list().forEach(function (l) { if (KS.labs.isComplete(l.id)) n++; }); return n; }
  function labGoals() { let n = 0; const L = S.state.labs; for (const k in L) n += Object.keys(L[k]).length; return n; }
  function plays(id) { const g = S.state.games[id]; return g ? g.plays || 0 : 0; }
  function allPlays() { let n = 0; for (const k in S.state.games) if (k !== 'pocket') n += S.state.games[k].plays || 0; return n; }
  function worldsDone() { return KS.content.worlds.filter(function (w) { const p = KS.content.worldProgress(w); return p.total && p.done === p.total; }).length; }

  const ACH = [
    ['first-step', '👣', 'First Step', 'Finish your first lesson', function () { return lessonsDone() >= 1; }],
    ['ten-down', '🔟', 'Double Digits', 'Finish 10 lessons', function () { return lessonsDone() >= 10; }],
    ['quarter', '🧱', 'Solid Foundations', 'Finish 25 lessons', function () { return lessonsDone() >= 25; }],
    ['fifty', '🏗️', 'Under Construction', 'Finish 50 lessons', function () { return lessonsDone() >= 50; }],
    ['hundred', '🏛️', 'Centurion', 'Finish 100 lessons', function () { return lessonsDone() >= 100; }],
    ['two-hundred', '🌆', 'City Planner', 'Finish 200 lessons', function () { return lessonsDone() >= 200; }],
    ['everything', '👑', 'The Keystone', 'Finish every lesson in the curriculum', function () { const o = KS.content.overall(); return o.total > 0 && o.done === o.total; }],
    ['perfect', '⭐', 'Flawless', 'Earn 3 stars on a lesson', function () { return threeStars() >= 1; }],
    ['perfect-10', '🌟', 'Perfectionist', 'Earn 3 stars on 10 lessons', function () { return threeStars() >= 10; }],
    ['perfect-50', '💫', 'Constellation', 'Earn 3 stars on 50 lessons', function () { return threeStars() >= 50; }],
    ['streak-3', '🔥', 'Warming Up', 'Reach a 3-day streak', function () { return S.streak().best >= 3; }],
    ['streak-7', '🔥', 'On Fire', 'Reach a 7-day streak', function () { return S.streak().best >= 7; }],
    ['streak-14', '🔥', 'Fortnight', 'Reach a 14-day streak', function () { return S.streak().best >= 14; }],
    ['streak-30', '🌋', 'Unstoppable', 'Reach a 30-day streak', function () { return S.streak().best >= 30; }],
    ['streak-100', '☄️', 'Force of Nature', 'Reach a 100-day streak', function () { return S.streak().best >= 100; }],
    ['goal-1', '🎯', 'Bullseye', 'Hit your daily goal', function () { return goalDays() >= 1; }],
    ['goal-7', '🏹', 'Sharpshooter', 'Hit your daily goal on 7 days', function () { return goalDays() >= 7; }],
    ['goal-30', '🎖️', 'Disciplined', 'Hit your daily goal on 30 days', function () { return goalDays() >= 30; }],
    ['xp-500', '⚡', 'Charged Up', 'Earn 500 XP', function () { return S.totalXp() >= 500; }],
    ['xp-2500', '🔋', 'Power Plant', 'Earn 2,500 XP', function () { return S.totalXp() >= 2500; }],
    ['xp-10000', '🚀', 'Escape Velocity', 'Earn 10,000 XP', function () { return S.totalXp() >= 10000; }],
    ['boss-1', '🗡️', 'Boss Slayer', 'Win your first boss battle', function () { return bossesWon() >= 1; }],
    ['boss-10', '⚔️', 'Dungeon Crawler', 'Win 10 boss battles', function () { return bossesWon() >= 10; }],
    ['boss-all', '🐉', 'Dragon Tamer', 'Win every boss battle', function () { return KS.content.modules.length > 0 && bossesWon() >= KS.content.modules.length; }],
    ['world-1', '🌍', 'World Complete', 'Finish every lesson in one world', function () { return worldsDone() >= 1; }],
    ['world-5', '🪐', 'Globetrotter', 'Finish five worlds', function () { return worldsDone() >= 5; }],
    ['flash-50', '🃏', 'Card Counter', 'Review 50 flashcards', function () { return reviews() >= 50; }],
    ['flash-500', '🧠', 'Memory Palace', 'Review 500 flashcards', function () { return reviews() >= 500; }],
    ['lab-1', '🧪', 'Lab Rat', 'Complete a goal in any lab', function () { return labGoals() >= 1; }],
    ['lab-10', '🔬', 'Experimentalist', 'Fully complete 10 labs', function () { return labsDone() >= 10; }],
    ['lab-all', '🧬', 'Mad Scientist', 'Fully complete every lab', function () { return KS.labs && KS.labs.list().length > 0 && labsDone() >= KS.labs.list().length; }],
    ['explain-10', '🗣️', 'Feynman', 'Explain 10 ideas back in your own words', function () { return Object.keys(S.state.explain).length >= 10; }],
    ['notes-5', '📝', 'Note Taker', 'Write notes on 5 lessons', function () { let n = 0; for (const k in S.state.notes) if (S.state.notes[k] && S.state.notes[k].t) n++; return n >= 5; }],
    ['arcade-10', '🕹️', 'Arcade Regular', 'Play 10 arcade rounds', function () { return allPlays() >= 10; }],
    ['pocket-5', '🚽', 'Throne Scholar', 'Finish 5 Pocket sessions', function () { return plays('pocket') >= 5; }],
    ['pocket-50', '🚆', 'Commuter', 'Finish 50 Pocket sessions', function () { return plays('pocket') >= 50; }],
    ['tycoon', '📈', 'Hockey Stick', 'Scale to 10 million users in Startup Survival', function () { return S.flag('tycoon-won'); }],
    ['night-owl', '🦉', 'Night Owl', 'Study after 11pm', function () { return S.flag('night-owl'); }],
    ['early-bird', '🐦', 'Early Bird', 'Study before 7am', function () { return S.flag('early-bird'); }],
    ['comeback', '🪃', 'Comeback Kid', 'Return after a week away', function () { return S.flag('comeback'); }]
  ];
  G.achievements = ACH.map(function (a) { return { id: a[0], emoji: a[1], title: a[2], desc: a[3], test: a[4] }; });
  G.earned = function (id) { return S.state.ach[id] || 0; };
  G.check = function (quiet) {
    const got = [];
    G.achievements.forEach(function (a) {
      if (S.state.ach[a.id]) return;
      let ok = false; try { ok = a.test(); } catch (e) { ok = false; }
      if (ok) { S.state.ach[a.id] = Date.now(); got.push(a); }
    });
    if (got.length) {
      S.save();
      if (!quiet) got.forEach(function (a, i) { setTimeout(function () { KS.ui.toast(h('div.ach-toast', h('span.ach-emoji', a.emoji), h('div', h('div.ach-kicker', 'Achievement unlocked'), h('b', a.title), h('div.muted', a.desc))), 'ach', 4200); KS.ui.sfx('win'); }, 700 + i * 900); });
      KS.bus.emit('ach', got);
    }
    return got;
  };
  G.queueCheck = KS.debounce(function () { G.check(); }, 600);

  /** Time-of-day and return flags; call once per session. */
  G.touchSession = function () {
    const hr = new Date().getHours();
    if (hr >= 23 || hr < 4) S.state.flags['night-owl-armed'] = true;
    if (hr >= 4 && hr < 7) S.state.flags['early-bird-armed'] = true;
    const days = Object.keys(S.state.days).filter(function (d) { return S.dayTotals(d).x > 0; }).sort();
    if (days.length) { const last = KS.dayNum(days[days.length - 1]); if (KS.dayNum() - last >= 7) S.state.flags['comeback-armed'] = true; }
  };
  KS.bus.on('xp', function () {
    const f = S.state.flags; const hr = new Date().getHours();
    if (hr >= 23 || hr < 4) f['night-owl'] = true;
    if (hr >= 4 && hr < 7) f['early-bird'] = true;
    if (f['comeback-armed']) { f.comeback = true; delete f['comeback-armed']; }
  });

  // ---------- spaced repetition (SM-2 flavoured, whole-day granularity) ----------
  const R = (KS.srs = {});
  // card state: [dueDay, intervalDays, ease(x100), reps, lapses, lastDay]
  R.unlock = function (lessonId) {
    const today = KS.dayNum(); let added = 0;
    KS.content.flashcards(lessonId).forEach(function (c) { if (!S.state.srs[c.id]) { S.state.srs[c.id] = [today + 1, 0, 250, 0, 0, 0]; added++; } });
    if (added) S.save();
    return added;
  };
  R.counts = function () {
    const today = KS.dayNum(); let due = 0, total = 0, mature = 0;
    for (const id in S.state.srs) { const c = S.state.srs[id]; total++; if (c[0] <= today) due++; if (c[1] >= 21) mature++; }
    return { due: due, total: total, mature: mature };
  };
  /** Cards due today (optionally including not-yet-due ones to fill a session). */
  R.due = function (limit, opts) {
    opts = opts || {}; const today = KS.dayNum(); const out = [], later = [];
    for (const id in S.state.srs) {
      const st = S.state.srs[id]; const card = KS.content.flashcardById(id); if (!card) continue;
      if (st[0] <= today) out.push({ card: card, st: st }); else later.push({ card: card, st: st });
    }
    out.sort(function (a, b) { return a.st[0] - b.st[0]; });
    if (opts.fill && out.length < limit) { later.sort(function (a, b) { return a.st[0] - b.st[0]; }); for (let i = 0; i < later.length && out.length < limit; i++) out.push(later[i]); }
    return (limit ? out.slice(0, limit) : out).map(function (x) { return x.card; });
  };
  /** grade: 0 again, 1 hard, 2 good, 3 easy. Returns days until next review. */
  R.grade = function (cardId, grade) {
    const today = KS.dayNum(); const c = S.state.srs[cardId] || (S.state.srs[cardId] = [today, 0, 250, 0, 0, 0]);
    let ivl = c[1], ease = c[2], reps = c[3];
    if (grade === 0) { ivl = 0; reps = 0; ease = Math.max(130, ease - 20); c[4]++; }
    else {
      if (reps === 0) ivl = grade === 3 ? 3 : grade === 1 ? 1 : 1;
      else if (reps === 1) ivl = grade === 3 ? 6 : grade === 1 ? 2 : 3;
      else ivl = Math.max(ivl + 1, Math.round(ivl * (grade === 1 ? 1.2 : grade === 3 ? (ease / 100) * 1.3 : ease / 100)));
      ease = Math.max(130, ease + (grade === 1 ? -15 : grade === 3 ? 15 : 0)); reps++;
    }
    c[0] = today + ivl; c[1] = ivl; c[2] = ease; c[3] = reps; c[5] = today;
    S.day().r++; S.save();
    return ivl;
  };
  R.preview = function (cardId, grade) {
    const c = S.state.srs[cardId] || [0, 0, 250, 0, 0, 0]; const ivl = c[1], ease = c[2], reps = c[3];
    if (grade === 0) return 0;
    if (reps === 0) return grade === 3 ? 3 : 1;
    if (reps === 1) return grade === 3 ? 6 : grade === 1 ? 2 : 3;
    return Math.max(ivl + 1, Math.round(ivl * (grade === 1 ? 1.2 : grade === 3 ? (ease / 100) * 1.3 : ease / 100)));
  };
  R.label = function (days) { if (days <= 0) return 'again soon'; if (days === 1) return 'tomorrow'; if (days < 30) return days + ' days'; if (days < 365) return Math.round(days / 30) + ' mo'; return (days / 365).toFixed(1) + ' yr'; };
})();
