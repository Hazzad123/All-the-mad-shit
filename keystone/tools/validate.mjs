#!/usr/bin/env node
/* Keystone content validator.
 *   node tools/validate.mjs                 → validate everything + roadmap coverage
 *   node tools/validate.mjs http oop        → validate only those modules
 *   node tools/validate.mjs --spec http     → print the spec (lesson ids, titles, topics) for a module
 *   node tools/validate.mjs --stats         → per-module size table
 *   node tools/validate.mjs --glossary      → list glossary terms whose definitions differ a lot (only the first is shown in the app)
 * Exit code 1 if there are errors. Warnings do not fail the run. */
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const wanted = args.filter(a => !a.startsWith('--'));

// ---------- load content into a sandbox ----------
const lessons = {}, bosses = {}, sheets = {}, owner = {}; let currentFile = null;
const KS = {
  curriculum: { worlds: [] }, roadmaps: [],
  world(w) { KS.curriculum.worlds.push(w); },
  lesson(id, data) { if (lessons[id]) problems.push(['error', currentFile, id, 'lesson registered twice']); lessons[id] = data; owner[id] = currentFile; },
  boss(id, data) { bosses[id] = data; owner['boss:' + id] = currentFile; },
  sheet(id, data) { sheets[id] = data; owner['sheet:' + id] = currentFile; },
  labs: { register() {} }
};
const problems = [];
const ctx = vm.createContext({ KS, window: { KS }, console });
function run(file, quiet) {
  currentFile = path.basename(file, '.js');
  try { vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file }); return true; }
  catch (e) { if (!quiet) problems.push(['error', currentFile, '-', 'JavaScript error: ' + (e && e.message) + (e && e.stack ? ' @ ' + String(e.stack).split('\n').slice(0, 2).join(' ') : '')]); return false; }
}
for (const f of ['curriculum-1.js', 'curriculum-2.js', 'curriculum-3.js', 'roadmaps.js']) run(path.join(root, 'content', f));

const modules = []; const metaById = {}; const moduleOf = {};
for (const w of KS.curriculum.worlds) for (const m of w.modules) { modules.push(m); m.world = w; for (const l of m.lessons) { if (metaById[l.id]) problems.push(['error', 'curriculum', l.id, 'duplicate lesson id in curriculum']); metaById[l.id] = l; moduleOf[l.id] = m.id; } }
const moduleById = Object.fromEntries(modules.map(m => [m.id, m]));

if (flags.has('--spec')) {
  for (const id of wanted) {
    const m = moduleById[id]; if (!m) { console.log('Unknown module: ' + id); continue; }
    console.log(`MODULE ${m.id} — "${m.title}" (${m.tagline})  · world: ${m.world.title} — ${m.world.blurb}`);
    console.log(`File to write: content/modules/${m.id}.js   ·   ${m.lessons.length} lessons, in this order:\n`);
    const idx = modules.indexOf(m);
    m.lessons.forEach((l, i) => {
      console.log(`${i + 1}. KS.lesson('${l.id}', …)  — "${l.title}"  (~${l.mins} min)`);
      console.log(`   summary: ${l.summary}`);
      console.log(`   must teach: ${l.topics}`);
      if (l.lab) console.log(`   (an interactive lab "${l.lab}" is attached to this lesson automatically — do not author it, but you may refer to "the lab that follows")`);
      console.log('');
    });
    const prev = modules[idx - 1], next = modules[idx + 1];
    console.log('Context — the learner has already done: ' + modules.slice(0, idx).map(x => x.title).join(' → ') || '(nothing: this is the first module)');
    if (prev) console.log('Previous module lessons: ' + prev.lessons.map(l => l.title).join('; '));
    if (next) console.log('Next module (do not pre-teach in depth): ' + next.title + ' — ' + next.lessons.map(l => l.title).join('; '));
  }
  process.exit(0);
}

const targets = wanted.length ? wanted : modules.map(m => m.id);
const missingFiles = [];
for (const id of targets) {
  if (!moduleById[id]) { problems.push(['error', id, '-', 'unknown module id']); continue; }
  const file = path.join(root, 'content', 'modules', id + '.js');
  if (!fs.existsSync(file)) { missingFiles.push(id); continue; }
  run(file);
}
// The other modules are loaded quietly so glossary links and term clashes can be checked across the course.
for (const m of modules) { if (targets.includes(m.id)) continue; const f = path.join(root, 'content', 'modules', m.id + '.js'); if (fs.existsSync(f)) run(f, true); }

// ---------- helpers ----------
const err = (mod, where, msg) => problems.push(['error', mod, where, msg]);
const warn = (mod, where, msg) => problems.push(['warn', mod, where, msg]);
const isStr = v => typeof v === 'string' && v.trim().length > 0;
const TEXT_KINDS = ['concept', 'metaphor', 'example', 'code', 'pitfall', 'realworld', 'tip', 'story', 'history', 'recap', 'deep'];
const VISUAL_KINDS = ['sequence', 'diagram', 'layers', 'compare', 'steps'];
const ACT_TYPES = ['mcq', 'multi', 'tf', 'ab', 'match', 'order', 'bucket', 'cloze', 'spot', 'short', 'estimate', 'scenario', 'explain'];
const BOSS_TYPES = ['mcq', 'multi', 'tf', 'ab', 'match', 'order', 'bucket', 'cloze', 'spot', 'short', 'estimate'];
const TONES = ['accent', 'good', 'warn', 'bad', 'info', 'muted'];
const links = []; // [module, where, target] for every [[glossary link]]
const slug = s => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const trivialLine = l => l === undefined || /^[\s\]\)\}\;,]*$/.test(l);
const plainLen = s => String(s || '').replace(/```[\s\S]*?```/g, '').replace(/\s+/g, ' ').trim().length;

function checkText(mod, where, s, label) {
  if (typeof s !== 'string') return;
  if (/\b(TODO|TBD|FIXME|XXX):|\bFIXME\b|\bTBD\b|@@END|lorem ipsum/.test(s)) err(mod, where, `${label}: contains placeholder text`);
  for (const m of s.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) links.push([mod, where, m[2] || m[1]]);
  const noFence = s.replace(/```[\s\S]*?```/g, '');
  if ((noFence.match(/`/g) || []).length % 2 === 1) warn(mod, where, `${label}: odd number of backticks (unclosed inline code?)`);
  if ((s.match(/```/g) || []).length % 2 === 1) err(mod, where, `${label}: unclosed code fence`);
  if (/\*\*\s|\s\*\*[^*]*$/.test('')) { /* noop */ }
  if (/<\/?(script|iframe|img|div|span|br)\b/i.test(noFence.replace(/`[^`]*`/g, ''))) warn(mod, where, `${label}: raw HTML is shown literally — use markdown`);
}
function checkCode(mod, where, code, label, opts = {}) {
  if (!code || typeof code !== 'object') return err(mod, where, `${label}: code must be { lang, src }`);
  if (!isStr(code.lang)) err(mod, where, `${label}: code.lang missing`);
  if (!isStr(code.src)) return err(mod, where, `${label}: code.src missing`);
  const raw = code.src.replace(/\r/g, '');
  const lines = raw.replace(/^\s*\n/, '').replace(/\n\s*$/, '').split('\n');
  if (lines.length > 1 && !/^\s*\n/.test(raw)) err(mod, where, `${label}: multi-line code.src must start with a newline right after the opening backtick (so indentation survives)`);
  const max = opts.maxLines || 34;
  if (lines.length > max) warn(mod, where, `${label}: ${lines.length} lines of code — keep it under ${max}`);
  const ind = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  const longest = Math.max(...lines.map(l => l.length - (isFinite(ind) ? ind : 0)));
  if (longest > 96) warn(mod, where, `${label}: a code line is ${longest} chars wide — wrap at ~80 so it fits on a phone`);
  if (code.notes) for (const k of Object.keys(code.notes)) {
    if (!(+k >= 1 && +k <= lines.length)) err(mod, where, `${label}: code.notes key ${k} is outside the code (1..${lines.length})`);
    else if (trivialLine(lines[k - 1])) warn(mod, where, `${label}: note ${k} sits on a blank or bracket-only line ("${lines[k - 1].trim()}") — is it one line off?`);
    checkText(mod, where, code.notes[k], 'note');
  }
  opts.lines && opts.lines.push(...lines);
  return lines.length;
}

function checkCard(mod, where, c) {
  if (!c || typeof c !== 'object') return err(mod, where, 'card is not an object');
  const kinds = TEXT_KINDS.concat(VISUAL_KINDS);
  if (!kinds.includes(c.kind)) return err(mod, where, `unknown card kind "${c.kind}" (allowed: ${kinds.join(', ')})`);
  if (!isStr(c.title)) err(mod, where, 'card.title missing'); else if (c.title.length > 72) warn(mod, where, `card.title is ${c.title.length} chars — keep under 72`);
  checkText(mod, where, c.body, 'body'); checkText(mod, where, c.note, 'note');
  if (TEXT_KINDS.includes(c.kind)) {
    if (!isStr(c.body)) err(mod, where, `${c.kind} card needs a body`);
    else { const n = plainLen(c.body); if (n < 90 && !c.code) warn(mod, where, `body is very short (${n} chars)`); if (n > 1500) err(mod, where, `body is ${n} chars — split into two cards (max ~1000)`); else if (n > 1050) warn(mod, where, `body is ${n} chars — aim for under 900 so it stays bite-sized`); }
    if (c.kind === 'code' && !c.code) err(mod, where, 'code card needs a code block');
  }
  if (c.code) checkCode(mod, where, c.code, 'card');
  if (c.kind === 'sequence') {
    const A = c.actors; if (!Array.isArray(A) || A.length < 2 || A.length > 5) return err(mod, where, 'sequence needs 2–5 actors');
    if (A.length > 4) warn(mod, where, 'sequence has 5 actors — 4 or fewer reads better on phones');
    const names = A.map(a => typeof a === 'string' ? a : a && a.name);
    const valid = v => (typeof v === 'number' && v >= 0 && v < A.length) || names.includes(v);
    const S = c.steps; if (!Array.isArray(S) || S.length < 3 || S.length > 14) return err(mod, where, 'sequence needs 3–14 steps');
    S.forEach((st, i) => {
      const w = `${where} step ${i + 1}`;
      if (st.from != null || st.to != null) { if (!valid(st.from) || !valid(st.to)) err(mod, w, 'from/to must be an actor index or name'); if (!isStr(st.label)) err(mod, w, 'message needs a label'); else if (st.label.length > 64) warn(mod, w, `label is ${st.label.length} chars — keep arrows short (≤ 48), put detail in note`); }
      else if (st.at != null) { if (!valid(st.at)) err(mod, w, 'at must be an actor index or name'); if (!isStr(st.label)) err(mod, w, 'self-step needs a label'); }
      else if (!isStr(st.note) && !isStr(st.label)) err(mod, w, 'step needs from/to, at, or a note');
      if (!isStr(st.note)) warn(mod, w, 'add a note explaining this step in plain English');
      checkText(mod, w, st.note, 'note');
    });
  } else if (c.kind === 'diagram') {
    const N = c.nodes; if (!Array.isArray(N) || N.length < 2 || N.length > 14) return err(mod, where, 'diagram needs 2–14 nodes');
    const ids = new Set(), cells = new Set();
    N.forEach(n => {
      if (!isStr(n.id)) err(mod, where, 'diagram node missing id'); if (ids.has(n.id)) err(mod, where, `duplicate node id "${n.id}"`); ids.add(n.id);
      if (!isStr(n.label)) err(mod, where, `node ${n.id} missing label`); else if (n.label.length > 30) warn(mod, where, `node label "${n.label}" is long — max ~28 chars`);
      if (!Number.isInteger(n.x) || !Number.isInteger(n.y) || n.x < 0 || n.y < 0 || n.x > 4 || n.y > 6) err(mod, where, `node ${n.id}: x must be 0–4 and y 0–6 (integers)`);
      if (n.x > 3) warn(mod, where, `node ${n.id} is in a 5th column — 4 columns max keeps diagrams readable on phones`);
      const cell = n.x + ',' + n.y; if (cells.has(cell)) err(mod, where, `two nodes share grid cell ${cell}`); cells.add(cell);
      if (n.tone && !TONES.includes(n.tone)) err(mod, where, `node ${n.id}: unknown tone "${n.tone}"`);
    });
    (c.edges || []).forEach(e => { if (!ids.has(e.from) || !ids.has(e.to)) err(mod, where, `edge ${e.from}→${e.to} references a missing node`); if (e.label && e.label.length > 24) warn(mod, where, `edge label "${e.label}" is long — max ~22 chars`); });
    if (!(c.edges || []).length) warn(mod, where, 'diagram has no edges');
  } else if (c.kind === 'layers') {
    if (!Array.isArray(c.layers) || c.layers.length < 2 || c.layers.length > 8) err(mod, where, 'layers needs 2–8 layers');
    else c.layers.forEach(l => { if (!isStr(l.label)) err(mod, where, 'layer missing label'); if (l.tone && !TONES.includes(l.tone)) err(mod, where, `unknown tone "${l.tone}"`); });
  } else if (c.kind === 'compare') {
    if (!Array.isArray(c.cols) || c.cols.length < 2 || c.cols.length > 4) return err(mod, where, 'compare needs 2–4 cols');
    if (c.cols.length > 3) warn(mod, where, 'compare with 4 columns scrolls sideways on phones — prefer 2–3');
    if (!Array.isArray(c.rows) || c.rows.length < 2 || c.rows.length > 9) return err(mod, where, 'compare needs 2–9 rows');
    c.rows.forEach((r, i) => { if (!Array.isArray(r) || r.length !== c.cols.length + 1) err(mod, where, `compare row ${i + 1} must have ${c.cols.length + 1} cells (row label + one per column)`); });
  } else if (c.kind === 'steps') {
    if (!Array.isArray(c.steps) || c.steps.length < 2 || c.steps.length > 8) err(mod, where, 'steps needs 2–8 steps');
    else c.steps.forEach((st, i) => { if (!isStr(st.title) || !isStr(st.body)) err(mod, where, `steps item ${i + 1} needs title and body`); checkText(mod, where, st.body, 'step body'); });
  }
}

function checkAct(mod, where, a, nCards, typeList) {
  if (!a || typeof a !== 'object') return err(mod, where, 'activity is not an object');
  if (!typeList.includes(a.type)) return err(mod, where, `activity type "${a.type}" not allowed here (allowed: ${typeList.join(', ')})`);
  if (a.after != null && nCards != null && !(Number.isInteger(a.after) && a.after >= 0 && a.after < nCards)) err(mod, where, `after: ${a.after} is out of range (0..${nCards - 1})`);
  const needExplain = () => { if (!isStr(a.explain)) err(mod, where, `${a.type} needs an explain`); else if (a.explain.length < 40) warn(mod, where, 'explain is very short — say why the right answer is right'); checkText(mod, where, a.explain, 'explain'); };
  const uniq = arr => new Set(arr.map(x => String(x).trim().toLowerCase())).size === arr.length;
  ['q', 'prompt', 'statement', 'intro', 'outro', 'model', 'text'].forEach(k => checkText(mod, where, a[k], k));
  if (a.code && a.type !== 'cloze' && a.type !== 'spot') checkCode(mod, where, a.code, a.type);
  switch (a.type) {
    case 'mcq':
      if (!isStr(a.q)) err(mod, where, 'mcq needs q');
      if (!Array.isArray(a.options) || a.options.length < 3 || a.options.length > 5 || !a.options.every(isStr)) return err(mod, where, 'mcq needs 3–5 string options');
      if (!uniq(a.options)) err(mod, where, 'mcq has duplicate options');
      if (!Number.isInteger(a.answer) || a.answer < 0 || a.answer >= a.options.length) err(mod, where, 'mcq answer must be an option index');
      if (a.why && (!Array.isArray(a.why) || a.why.length !== a.options.length)) err(mod, where, 'mcq why must have one entry per option');
      if (!a.fixed && a.options.some(o => /^(all|none|both) of (the|these)|^(a|b) and (b|c)$/i.test(o.trim()))) err(mod, where, 'options are shuffled — avoid "all/none of the above" (or set fixed: true)');
      { const lens = a.options.map(o => o.length); const right = lens[a.answer]; const others = lens.filter((_, i) => i !== a.answer); if (right > 1.4 * Math.max(...others) && right > 40) warn(mod, where, `the correct option is ${(right / Math.max(...others)).toFixed(1)}× longer than any wrong one — a giveaway (aim for similar lengths)`); }
      needExplain(); break;
    case 'multi':
      if (!isStr(a.q)) err(mod, where, 'multi needs q');
      if (!Array.isArray(a.options) || a.options.length < 4 || a.options.length > 7 || !a.options.every(isStr)) return err(mod, where, 'multi needs 4–7 string options');
      if (!uniq(a.options)) err(mod, where, 'multi has duplicate options');
      if (!Array.isArray(a.answers) || a.answers.length < 2 || a.answers.length >= a.options.length || !a.answers.every(i => Number.isInteger(i) && i >= 0 && i < a.options.length) || new Set(a.answers).size !== a.answers.length) err(mod, where, 'multi answers must be 2+ distinct option indexes, and not all of them');
      needExplain(); break;
    case 'tf':
      if (!isStr(a.statement)) err(mod, where, 'tf needs statement'); if (typeof a.answer !== 'boolean') err(mod, where, 'tf answer must be true or false'); needExplain(); break;
    case 'ab':
      if (!isStr(a.q)) err(mod, where, 'ab needs q');
      for (const k of ['a', 'b']) { const v = typeof a[k] === 'string' ? { lang: a.lang || 'js', src: a[k] } : a[k]; checkCode(mod, where, v, 'ab.' + k, { maxLines: 22 }); }
      if (a.answer !== 'a' && a.answer !== 'b') err(mod, where, 'ab answer must be "a" or "b"');
      if (/\b(In|Version|Option|Snippet|Code) [AB]\b|\b[AB] (is|does|has|uses|keeps|puts|wins|loses)\b|\b(first|second|top|bottom|left-hand|right-hand) (version|one|snippet|option)\b/i.test(a.explain || '')) warn(mod, where, 'ab explain refers to "A" or "B" — the two sides can swap on screen; name them by their label or content');
      needExplain(); break;
    case 'match':
      if (!isStr(a.prompt)) err(mod, where, 'match needs prompt');
      if (!Array.isArray(a.pairs) || a.pairs.length < 3 || a.pairs.length > 6 || !a.pairs.every(p => Array.isArray(p) && p.length === 2 && isStr(p[0]) && isStr(p[1]))) return err(mod, where, 'match needs 3–6 [left, right] pairs');
      if (!uniq(a.pairs.map(p => p[0])) || !uniq(a.pairs.map(p => p[1]))) err(mod, where, 'match lefts and rights must each be unique');
      a.pairs.forEach(p => { if (p[0].length > 60 || p[1].length > 90) warn(mod, where, 'match item is long — keep left ≤ 40 and right ≤ 70 chars'); });
      break;
    case 'order':
      if (!isStr(a.prompt)) err(mod, where, 'order needs prompt');
      if (!Array.isArray(a.items) || a.items.length < 3 || a.items.length > 7 || !a.items.every(isStr)) return err(mod, where, 'order needs 3–7 string items (in the correct order)');
      if (!uniq(a.items)) err(mod, where, 'order has duplicate items'); needExplain(); break;
    case 'bucket': {
      if (!isStr(a.prompt)) err(mod, where, 'bucket needs prompt');
      if (!Array.isArray(a.buckets) || a.buckets.length < 2 || a.buckets.length > 4) return err(mod, where, 'bucket needs 2–4 buckets');
      if (!Array.isArray(a.items) || a.items.length < 5 || a.items.length > 10) return err(mod, where, 'bucket needs 5–10 items');
      const used = new Set();
      a.items.forEach(it => { const t = Array.isArray(it) ? it[0] : it && it.text, b = Array.isArray(it) ? it[1] : it && it.bucket; if (!isStr(t) || !Number.isInteger(b) || b < 0 || b >= a.buckets.length) err(mod, where, 'bucket item must be [text, bucketIndex]'); used.add(b); });
      if (used.size < a.buckets.length) err(mod, where, 'every bucket needs at least one item'); break; }
    case 'cloze': {
      if (!isStr(a.text)) return err(mod, where, 'cloze needs text');
      const blanks = [...a.text.matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]);
      if (blanks.length < 1 || blanks.length > 5) err(mod, where, `cloze needs 1–5 {{blanks}} (found ${blanks.length})`);
      if (!Array.isArray(a.distractors) || a.distractors.length < 2 || a.distractors.length > 6) err(mod, where, 'cloze needs 2–6 distractors');
      else if (a.distractors.some(d => blanks.map(b => b.toLowerCase()).includes(String(d).toLowerCase()))) err(mod, where, 'a cloze distractor equals a correct answer');
      if (!uniq(blanks)) warn(mod, where, 'cloze repeats the same answer in two blanks — fine if intended');
      needExplain(); break; }
    case 'spot': {
      if (!isStr(a.prompt)) err(mod, where, 'spot needs prompt');
      const codeLines = [];
      const n = checkCode(mod, where, typeof a.code === 'string' ? { lang: a.lang, src: a.code } : a.code, 'spot', { maxLines: 26, lines: codeLines });
      if (n === 1) err(mod, where, 'spot: the code has only one line, so any tap is right — split it into lines');
      if (Array.isArray(a.lines)) a.lines.forEach(x => { if (Number.isInteger(x) && trivialLine(codeLines[x - 1])) warn(mod, where, `spot: answer line ${x} is blank or bracket-only — is it one line off?`); });
      if (!Array.isArray(a.lines) || !a.lines.length || !a.lines.every(x => Number.isInteger(x) && x >= 1 && (!n || x <= n))) err(mod, where, `spot lines must be 1-based line numbers inside the code (1..${n})`);
      else if (n && a.lines.length > Math.max(2, n / 3)) warn(mod, where, 'spot accepts too many lines — make the problem line specific');
      needExplain(); break; }
    case 'short':
      if (!isStr(a.q)) err(mod, where, 'short needs q');
      if (!Array.isArray(a.accept) || !a.accept.length || !a.accept.every(isStr)) err(mod, where, 'short needs accept: [strings]');
      else if (a.accept.some(x => x.length > 28)) warn(mod, where, 'short answers should be a word or two — long answers are frustrating to type');
      { const W = { two: 2, three: 3, four: 4, five: 5, six: 6 }; const m = /\b(two|three|four|five|six)-letter\b/i.exec(a.q || '');
        if (m && Array.isArray(a.accept) && !a.accept.some(x => x.replace(/[^a-z0-9]/gi, '').length === W[m[1].toLowerCase()])) err(mod, where, `short: the question says "${m[0]}" but no accepted answer has ${W[m[1].toLowerCase()]} letters`); }
      needExplain(); break;
    case 'estimate':
      if (!isStr(a.q)) err(mod, where, 'estimate needs q');
      if (typeof a.answer !== 'number' || !(a.answer > 0)) err(mod, where, 'estimate answer must be a positive number');
      if (!isStr(a.unit)) err(mod, where, 'estimate needs unit');
      if (a.scale !== 'linear' && (a.min != null) !== (a.max != null)) err(mod, where, 'estimate: give both min and max, or neither');
      if (a.min != null && a.max != null && !(a.min < a.answer && a.answer < a.max)) err(mod, where, 'estimate answer must lie between min and max');
      if (a.scale !== 'linear' && a.min != null && !(a.min > 0)) err(mod, where, 'estimate: a log-scale slider needs min > 0 (use scale: "linear" to start at 0)');
      if (a.min != null && a.max != null && a.min < a.answer && a.answer < a.max && (a.scale === 'linear' || a.min > 0)) {
        const pos = a.scale === 'linear' ? (a.answer - a.min) / (a.max - a.min) : (Math.log10(a.answer) - Math.log10(a.min)) / (Math.log10(a.max) - Math.log10(a.min));
        if (pos < 0.04 || pos > 0.96) err(mod, where, `estimate: the answer sits at the very end of the slider (${Math.round(pos * 100)}%) — widen min/max or use scale: "linear"`);
      }
      needExplain(); break;
    case 'scenario':
      if (!isStr(a.title)) err(mod, where, 'scenario needs title');
      if (!isStr(a.intro)) err(mod, where, 'scenario needs intro');
      if (!Array.isArray(a.steps) || a.steps.length < 2 || a.steps.length > 6) return err(mod, where, 'scenario needs 2–6 steps');
      { const ids = new Set(a.steps.map(s => s.id).filter(Boolean));
        a.steps.forEach((st, i) => {
          const w = `${where} step ${i + 1}`;
          if (!isStr(st.text)) err(mod, w, 'scenario step needs text'); checkText(mod, w, st.text, 'text');
          if (!Array.isArray(st.choices) || st.choices.length < 2 || st.choices.length > 4) return err(mod, w, 'scenario step needs 2–4 choices');
          st.choices.forEach(c => { if (!isStr(c.label) || !isStr(c.feedback)) err(mod, w, 'choice needs label and feedback'); if (![0, 1, 2].includes(c.score)) err(mod, w, 'choice score must be 0, 1 or 2'); if (c.to != null && !ids.has(c.to)) err(mod, w, `choice.to "${c.to}" is not a step id`); checkText(mod, w, c.feedback, 'feedback'); });
          if (!st.choices.some(c => c.score === 2)) err(mod, w, 'each step needs at least one best choice (score 2)');
          if (st.choices.every(c => c.score === 2)) warn(mod, w, 'every choice scores 2 — no real decision');
        }); }
      if (a.meters) for (const k of Object.keys(a.meters)) if (!(a.meters[k] >= 0 && a.meters[k] <= 100)) err(mod, where, 'meters start between 0 and 100');
      break;
    case 'explain':
      if (!isStr(a.prompt)) err(mod, where, 'explain needs prompt');
      if (!isStr(a.model) || a.model.length < 80) err(mod, where, 'explain needs a model answer (80+ chars)');
      if (!Array.isArray(a.keywords) || a.keywords.length < 3 || a.keywords.length > 8) err(mod, where, 'explain needs 3–8 keywords'); break;
  }
}

function checkLesson(mod, id, L) {
  const w = id;
  if (!L || typeof L !== 'object') return err(mod, w, 'lesson data missing');
  if (!isStr(L.eli5)) err(mod, w, 'eli5 missing'); else if (L.eli5.length < 30 || L.eli5.length > 240) warn(mod, w, `eli5 should be one plain sentence (30–240 chars); got ${L.eli5.length}`);
  const cards = L.cards;
  if (!Array.isArray(cards) || cards.length < 5) err(mod, w, `needs at least 5 cards, ideally 7–10 (has ${Array.isArray(cards) ? cards.length : 0})`);
  else {
    if (cards.length < 6) warn(mod, w, `only ${cards.length} cards — aim for 6–10`); if (cards.length > 12) warn(mod, w, `${cards.length} cards is a lot — aim for 6–10`);
    cards.forEach((c, i) => checkCard(mod, `${w} card ${i}`, c));
    if (!cards.some(c => c.kind === 'metaphor')) err(mod, w, 'needs at least one metaphor card (the learner starts from scratch)');
    if (!cards.some(c => VISUAL_KINDS.includes(c.kind) || c.code)) warn(mod, w, 'no visual or code card — add a sequence/diagram/layers/compare/steps card or a code example');
    if (cards[0] && VISUAL_KINDS.includes(cards[0].kind)) warn(mod, w, 'first card should hook the learner in plain words, not open with a diagram');
  }
  const acts = L.activities;
  if (!Array.isArray(acts) || acts.length < 6) err(mod, w, `needs at least 6 activities (has ${Array.isArray(acts) ? acts.length : 0})`);
  else {
    if (acts.length > 10) warn(mod, w, `${acts.length} activities — 6–9 is the sweet spot`);
    acts.forEach((a, i) => checkAct(mod, `${w} act ${i} (${a && a.type})`, a, Array.isArray(cards) ? cards.length : null, ACT_TYPES));
    const types = new Set(acts.map(a => a.type));
    if (types.size < 4) err(mod, w, `only ${types.size} different activity types — use at least 4 for variety`);
    const withAfter = acts.filter(a => a.after != null).length;
    if (withAfter < 2) warn(mod, w, 'give at least 2 activities an `after: <cardIndex>` so checks are sprinkled between cards');
    if (withAfter === acts.length) warn(mod, w, 'leave a few activities without `after` so there is a practice round at the end');
    const mcqShare = acts.filter(a => a.type === 'mcq').length / acts.length; if (mcqShare > 0.5) warn(mod, w, 'more than half the activities are mcq — mix it up');
  }
  if (!Array.isArray(L.flashcards) || L.flashcards.length < 4 || L.flashcards.length > 8) err(mod, w, 'needs 4–8 flashcards');
  else L.flashcards.forEach((f, i) => { if (!isStr(f.q) || !isStr(f.a)) err(mod, `${w} flashcard ${i}`, 'needs q and a'); else if (f.a.length > 260) warn(mod, `${w} flashcard ${i}`, 'answer is long — flashcard answers should be one or two short sentences'); });
  if (!Array.isArray(L.glossary) || L.glossary.length < 3 || L.glossary.length > 8) err(mod, w, 'needs 3–8 glossary terms');
  else L.glossary.forEach((g, i) => { if (!isStr(g.term) || !isStr(g.def)) err(mod, `${w} glossary ${i}`, 'needs term and def'); else { if (g.def.length > 300) warn(mod, `${w} glossary ${i}`, 'definition is long — one or two sentences'); if (g.term.length > 44) warn(mod, `${w} glossary ${i}`, 'term is long'); } });
  if (!Array.isArray(L.takeaways) || L.takeaways.length < 3 || L.takeaways.length > 5 || !L.takeaways.every(isStr)) err(mod, w, 'needs 3–5 takeaways');
  if (L.links) { if (!Array.isArray(L.links)) err(mod, w, 'links must be an array'); else L.links.forEach(l => { if (!isStr(l.label) || !/^https:\/\//.test(l.url || '')) err(mod, w, 'each link needs a label and an https url'); }); }
  for (const k of Object.keys(L)) if (!['eli5', 'cards', 'activities', 'flashcards', 'glossary', 'takeaways', 'links'].includes(k)) warn(mod, w, `unknown lesson field "${k}"`);
}

// ---------- run checks ----------
const stats = [];
for (const id of targets) {
  const m = moduleById[id]; if (!m || missingFiles.includes(id)) continue;
  let chars = 0, nActs = 0, nCards = 0;
  for (const l of m.lessons) {
    if (!lessons[l.id]) { err(id, l.id, 'lesson is in the curriculum but missing from the module file'); continue; }
    checkLesson(id, l.id, lessons[l.id]);
    chars += JSON.stringify(lessons[l.id]).length; nActs += (lessons[l.id].activities || []).length; nCards += (lessons[l.id].cards || []).length;
  }
  for (const lid of Object.keys(lessons)) if (owner[lid] === id && moduleOf[lid] !== id) err(id, lid, moduleOf[lid] ? `this lesson belongs to module "${moduleOf[lid]}"` : 'lesson id is not in the curriculum (typo?)');
  const b = bosses[id];
  if (!b) err(id, 'boss', 'missing KS.boss(moduleId, {...})');
  else {
    if (!isStr(b.title) || !isStr(b.intro)) err(id, 'boss', 'boss needs title and intro');
    if (!Array.isArray(b.questions) || b.questions.length < 8 || b.questions.length > 14) err(id, 'boss', 'boss needs 8–14 questions (aim for 10–13)');
    else {
      if (b.questions.length < 10 || b.questions.length > 13) warn(id, 'boss', `boss has ${b.questions.length} questions — the guide asks for 10–13`);
      b.questions.forEach((q, i) => { if (q && q.after != null) warn(id, `boss q${i}`, 'boss questions do not use `after`'); checkAct(id, `boss q${i} (${q && q.type})`, q, null, BOSS_TYPES); });
      if (new Set(b.questions.map(q => q.type)).size < 4) warn(id, 'boss', 'use at least 4 question types in the boss battle');
    }
  }
  const s = sheets[id];
  if (!s) err(id, 'sheet', 'missing KS.sheet(moduleId, {...})');
  else {
    if (!isStr(s.title)) err(id, 'sheet', 'sheet needs a title');
    if (!Array.isArray(s.sections) || s.sections.length < 3 || s.sections.length > 10) err(id, 'sheet', 'sheet needs 3–10 sections (aim for 4–7)');
    else {
      if (s.sections.length < 4 || s.sections.length > 7) warn(id, 'sheet', `sheet has ${s.sections.length} sections — the guide asks for 4–7`);
      s.sections.forEach((x, i) => { if (!isStr(x.title) || !isStr(x.md)) err(id, `sheet section ${i}`, 'needs title and md'); checkText(id, `sheet section ${i}`, x.md, 'md'); const words = String(x.md || '').split(/\s+/).filter(t => /[a-z0-9]/i.test(t) && !/^[-|:]+$/.test(t)).length; if (words > 125) warn(id, `sheet section ${i}`, `${words} words — the guide asks for 40–110 per section`); });
    }
  }
  { const tfs = []; for (const l of m.lessons) for (const a of (lessons[l.id] && lessons[l.id].activities) || []) if (a && a.type === 'tf') tfs.push(a.answer);
    for (const q of (b && b.questions) || []) if (q && q.type === 'tf') tfs.push(q.answer);
    const t = tfs.filter(Boolean).length;
    if (tfs.length >= 5 && (t / tfs.length < 0.3 || t / tfs.length > 0.7)) warn(id, 'tf', `${t} of ${tfs.length} true/false statements are true — aim for a mix (30–70%) so "always say false" doesn't work`); }
  stats.push([id, m.lessons.length, nCards, nActs, Math.round(chars / 1024)]);
}

// ---------- glossary: links that point nowhere, and one term defined with two different meanings ----------
{
  const gloss = {}, alias = {};
  for (const m of modules) for (const l of m.lessons) for (const g of (lessons[l.id] && lessons[l.id].glossary) || []) {
    if (!g || !isStr(g.term)) continue; const s = slug(g.term);
    (gloss[s] = gloss[s] || []).push({ lesson: l.id, mod: m.id, def: g.def || '' });
    for (const a of g.aka || []) alias[slug(a)] = s;
  }
  for (const [mod, where, target] of links) if (targets.includes(mod) && !gloss[slug(target)] && !gloss[alias[slug(target)]]) err(mod, where, `glossary link [[…${target === undefined ? '' : '|' + target}]] matches no glossary term or aka`);
  const STOP = new Set('that this with from into your what when which their they them have will than then more most some such only also each other about where while just like used uses using does make makes made over many very same often every between without because'.split(' '));
  const words = d => new Set(String(d).toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w)).map(w => w.replace(/(ing|ed|es|s)$/, '')));
  // Wording differs a lot between writers, so this is a report for a human to read (--glossary), not a warning.
  if (flags.has('--glossary')) for (const [s, defs] of Object.entries(gloss)) {
    if (defs.length < 2) continue;
    const first = defs[0];
    for (const d of defs.slice(1)) {
      if (!targets.includes(d.mod) && !targets.includes(first.mod)) continue;
      const A = words(first.def), B = words(d.def); const inter = [...A].filter(x => B.has(x)).length; const jac = inter / (A.size + B.size - inter || 1);
      if (jac < 0.08) console.log(`glossary "${s}": ${first.lesson} → ${first.def.slice(0, 70)}…\n${' '.repeat(12 + s.length)}${d.lesson} → ${d.def.slice(0, 70)}…`);
    }
  }
}

// ---------- global checks ----------
if (!wanted.length) {
  const nodes = new Set(); for (const r of KS.roadmaps) for (const g of r.groups) for (const n of g.nodes) nodes.add(r.prefix + ':' + n[0]);
  const covered = new Set();
  for (const id of Object.keys(metaById)) for (const c of metaById[id].covers || []) { if (!nodes.has(c)) err('curriculum', id, `covers unknown roadmap node "${c}"`); covered.add(c); }
  for (const n of nodes) if (!covered.has(n)) err('roadmaps', n, 'roadmap node is not covered by any lesson');
  console.log(`Curriculum: ${KS.curriculum.worlds.length} worlds, ${modules.length} modules, ${Object.keys(metaById).length} lessons. Roadmap nodes: ${nodes.size}, covered: ${[...nodes].filter(n => covered.has(n)).length}.`);
  if (missingFiles.length) console.log(`Modules without a content file yet (${missingFiles.length}): ${missingFiles.join(', ')}`);
} else if (missingFiles.length) for (const id of missingFiles) err(id, '-', `content/modules/${id}.js does not exist`);

if (flags.has('--stats')) { console.log('\nmodule'.padEnd(34) + 'lessons cards  acts    KB'); for (const s of stats) console.log(s[0].padEnd(33) + String(s[1]).padStart(7) + String(s[2]).padStart(6) + String(s[3]).padStart(6) + String(s[4]).padStart(6)); console.log('TOTAL'.padEnd(33) + String(stats.reduce((a, s) => a + s[1], 0)).padStart(7) + String(stats.reduce((a, s) => a + s[2], 0)).padStart(6) + String(stats.reduce((a, s) => a + s[3], 0)).padStart(6) + String(stats.reduce((a, s) => a + s[4], 0)).padStart(6)); }

const errors = problems.filter(p => p[0] === 'error'), warns = problems.filter(p => p[0] === 'warn');
const show = (list, tag) => { let last = null; for (const p of list) { if (p[1] !== last) { console.log(`\n[${p[1]}]`); last = p[1]; } console.log(`  ${tag} ${p[2]}: ${p[3]}`); } };
if (warns.length && !flags.has('--quiet')) show(warns, '⚠');
if (errors.length) show(errors, '✗');
console.log(`\n${errors.length ? '✗' : '✓'} ${errors.length} error(s), ${warns.length} warning(s)` + (wanted.length ? ` in ${wanted.join(', ')}` : ''));
process.exit(errors.length ? 1 : 0);
