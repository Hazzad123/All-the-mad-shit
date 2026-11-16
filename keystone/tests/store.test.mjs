import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { load } from './harness.mjs';

let last;
const boot = opts => (last = load(['js/core/ks.js', 'js/core/store.js'], opts)).KS;
// Object.prototype of the sandbox the scripts ran in (not this file's own realm).
const polluted = (env = last) => vm.runInContext('({}).html', env.sandbox) !== undefined;

const file = extra => JSON.stringify(Object.assign({ lessons: {}, days: {} }, extra));

test('import ignores __proto__ keys (no prototype pollution)', () => {
  const KS = boot();
  const payload = '{"lessons":{},"days":{},"labs":{"__proto__":{"html":"<img src=x onerror=alert(1)>"}},' +
    '"ach":{"__proto__":1},"lessons2":{"__proto__":{"x":1}}}';
  KS.store.importJSON(payload, 'merge');
  assert.equal(polluted(), false);
  assert.equal(Object.keys(KS.store.state.labs).length, 0);
});

test('import rejects files that are not progress files, changing nothing', () => {
  const KS = boot();
  KS.store.addXp(40);
  const before = JSON.stringify(KS.store.state);
  for (const bad of ['not json', '[]', '{"lessons":[]}', '{"days":{}}', 'null']) {
    assert.throws(() => KS.store.importJSON(bad, 'merge'), /does not look like/);
  }
  assert.equal(JSON.stringify(KS.store.state), before);
});

test('import drops malformed entries instead of storing them', () => {
  const KS = boot();
  KS.store.importJSON(file({ lessons: { 'http-methods': null, ok: { done: 5, stars: 'x', res: { 0: 1, 1: 'bad' } } }, srs: { a: 'nope', b: [1, 2, 3, 4, 5, 6] } }), 'merge');
  const L = KS.store.state.lessons;
  assert.equal(L['http-methods'], undefined);
  assert.equal(L.ok.done, 5);
  assert.equal(L.ok.stars, 0);
  assert.deepEqual(Object.keys(L.ok.res), ['0']);
  assert.equal(KS.store.state.srs.a, undefined);
  assert.equal(KS.store.state.srs.b.length, 6);
});

test('merge keeps the best of both sides', () => {
  const KS = boot();
  const S = KS.store;
  S.lesson('a').done = 200; S.lesson('a').stars = 2;
  S.state.bosses.m = { best: 0.5, passed: 0, tries: 1 };
  S.importJSON(file({ lessons: { a: { done: 100, stars: 3 }, b: { done: 50 } }, bosses: { m: { best: 0.9, passed: 77, tries: 2 } } }), 'merge');
  assert.equal(S.state.lessons.a.done, 100);
  assert.equal(S.state.lessons.a.stars, 3);
  assert.equal(S.state.lessons.b.done, 50);
  assert.deepEqual({ ...S.state.bosses.m }, { best: 0.9, passed: 77, tries: 2 });
});

test('reset is not undone by merging older progress', () => {
  const KS = boot();
  const S = KS.store;
  S.addXp(100); S.lesson('a').done = 1;
  const old = S.exportJSON();
  S.reset();
  assert.equal(S.totalXp(), 0);
  S.importJSON(old, 'merge');
  assert.equal(S.totalXp(), 0);
  assert.equal(S.isDone('a'), false);
});

test('a newer reset elsewhere wipes this copy, then merges the newer progress', () => {
  const KS = boot();
  const S = KS.store;
  S.addXp(100);
  S.importJSON(file({ resetAt: Date.now() + 1000, days: { '2026-01-01': { zz: { x: 5 } } } }), 'merge');
  assert.equal(S.totalXp(), 5);
});

test('daily bonus counts once per day across devices', () => {
  const KS = boot();
  const S = KS.store;
  const today = KS.today();
  S.importJSON(file({ days: { [today]: { other1: { x: 15, d: 1 } } } }), 'merge');
  assert.equal(S.day().d, undefined);
  assert.equal(S.dayTotals().d, 1);
});

test('streak counts consecutive days and today not played keeps it', () => {
  const KS = boot();
  const S = KS.store;
  const day = n => KS.dateStr(new Date(Date.now() - n * 864e5));
  S.state.days = { [day(1)]: { a: { x: 1 } }, [day(2)]: { a: { x: 1 } }, [day(4)]: { a: { x: 1 } } };
  const st = S.streak();
  assert.equal(st.current, 2);
  assert.equal(st.todayDone, false);
  assert.equal(st.best, 2);
});

test('progress saved before this fix is cleaned on load', () => {
  const poisoned = '{"v":1,"device":"abc123","lessons":{},"days":{},"labs":{"__proto__":{"html":"x"}},"settings":{"theme":"light"}}';
  const KS = boot({ storage: { 'keystone.v1': poisoned } });
  KS.store.importJSON('{"lessons":{},"days":{}}', 'merge');
  assert.equal(polluted(), false);
  assert.equal(KS.store.state.settings.theme, 'light');
  assert.equal(KS.store.state.device, 'abc123');
});

test('another tab writing poisoned data is ignored safely', () => {
  const env = load(['js/core/ks.js', 'js/core/store.js']);
  env.fire('storage', { key: 'keystone.v1', newValue: '{"lessons":{},"days":{},"labs":{"__proto__":{"html":"x"}}}' });
  assert.equal(polluted(env), false);
});
