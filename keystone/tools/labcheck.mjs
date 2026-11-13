#!/usr/bin/env node
/* Keystone lab checker (static).   node tools/labcheck.mjs            → every lab in js/labs
 *                                  node tools/labcheck.mjs jwt-lab    → just these
 * Loads each lab in a sandbox, checks the registration shape and scans the source for common mistakes. */
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'js', 'labs');
const manifestCtx = vm.createContext({ KS: {} });
vm.runInContext(fs.readFileSync(path.join(dir, 'manifest.js'), 'utf8'), manifestCtx);
const manifest = manifestCtx.KS.labFiles || [];
const wanted = process.argv.slice(2).filter(a => !a.startsWith('--'));
const ids = wanted.length ? wanted : manifest;
let errors = 0, warns = 0, present = 0; const missing = [];
const err = (id, m) => { errors++; console.log(`  ✗ ${id}: ${m}`); };
const warn = (id, m) => { warns++; console.log(`  ⚠ ${id}: ${m}`); };

for (const id of ids) {
  const file = path.join(dir, id + '.js');
  if (!fs.existsSync(file)) { missing.push(id); continue; }
  present++;
  const src = fs.readFileSync(file, 'utf8');
  const defs = [];
  const KS = { labs: { register: d => defs.push(d), ui: {} }, h() {}, s() {}, md: Object.assign(() => '', { inline: () => '' }), esc: s => s, ui: {}, store: {}, bus: { on() {}, emit() {} } };
  try { vm.runInContext(src, vm.createContext({ KS, window: { KS }, console, crypto: globalThis.crypto, TextEncoder, TextDecoder, setTimeout, clearTimeout, performance }), { filename: file }); }
  catch (e) { err(id, 'JavaScript error on load: ' + e.message); continue; }
  if (defs.length !== 1) { err(id, `expected exactly one KS.labs.register call, found ${defs.length}`); continue; }
  const d = defs[0];
  if (d.id !== id) err(id, `registered id "${d.id}" must equal the file name`);
  if (!d.title || d.title.length > 40) err(id, 'title missing or over 40 chars');
  if (!d.emoji) err(id, 'emoji missing');
  if (!d.blurb || d.blurb.length < 30 || d.blurb.length > 170) err(id, 'blurb should be one sentence (30–170 chars)');
  if (!Array.isArray(d.tags) || !d.tags.length) warn(id, 'add a few tags for search');
  if (typeof d.mount !== 'function') err(id, 'mount(root, api) missing');
  if (!d.help || d.help.length < 250) err(id, 'help is missing or too short (aim for 80–180 words)');
  const goals = d.goals || [];
  if (goals.length < 3 || goals.length > 6) err(id, `needs 3–5 goals (has ${goals.length})`);
  const gids = new Set();
  for (const g of goals) {
    if (!g.id || !g.text) err(id, 'each goal needs id and text');
    if (gids.has(g.id)) err(id, `duplicate goal id "${g.id}"`); gids.add(g.id);
    if (g.text && g.text.length > 120) warn(id, `goal "${g.id}" text is long (${g.text.length} chars)`);
  }
  const used = new Set([...src.matchAll(/api\.goal\(\s*['"`]([\w-]+)['"`]/g)].map(m => m[1]));
  const dynamic = /api\.goal\(\s*[^'"`\s)]/.test(src);
  for (const g of gids) if (!used.has(g) && !dynamic) err(id, `goal "${g}" is never completed (no api.goal('${g}') call)`);
  for (const u of used) if (!gids.has(u)) err(id, `api.goal('${u}') is called but there is no such goal`);
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
  if (/(^|[^.\w])setInterval\s*\(/.test(code)) err(id, 'use api.every(), not setInterval (it must be cleaned up when the lab closes)');
  if (/(^|[^.\w])setTimeout\s*\(/.test(code)) warn(id, 'prefer api.after()/api.sleep() over raw setTimeout');
  if (/(^|[^.\w])requestAnimationFrame\s*\(/.test(code)) warn(id, 'prefer api.loop() over raw requestAnimationFrame');
  if (/\b(alert|confirm|prompt)\s*\(/.test(code)) err(id, 'no alert/confirm/prompt');
  if (/\blocalStorage\b|\bsessionStorage\b/.test(code)) err(id, 'labs must not use web storage');
  if (/\bfetch\s*\(|XMLHttpRequest|\bimport\s*\(|^\s*import\s/m.test(code)) err(id, 'no network requests or imports');
  if (/addEventListener\(\s*['"](resize|scroll|keydown|keyup)['"]/.test(code) && !/removeEventListener|onCleanup/.test(code)) warn(id, 'a window/document listener is added but never removed');
  const hex = code.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g);
  if (hex && hex.length > 4) warn(id, `${hex.length} hard-coded colours — use the CSS variables so the light theme works`);
  if (!/api\.alive\(\)/.test(code) && /await\s/.test(code)) warn(id, 'uses await but never checks api.alive() afterwards');
  const lines = src.split('\n').length;
  if (lines > 620) warn(id, `${lines} lines — consider trimming`);
  console.log(`  ✓ ${id}  (${lines} lines, ${goals.length} goals)`);
}
console.log(`\n${present} lab file(s) checked · ${errors} error(s), ${warns} warning(s)` + (missing.length ? ` · not written yet (${missing.length}): ${missing.join(', ')}` : ''));
process.exit(errors || (wanted.length && missing.length) ? 1 : 0);
