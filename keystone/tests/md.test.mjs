import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './harness.mjs';

const { KS } = load(['js/core/ks.js', 'js/core/store.js', 'js/core/md.js']);

test('inline markdown escapes HTML', () => {
  const out = KS.md.inline('<script>alert(1)</script> and <img src=x onerror=alert(1)>');
  assert.ok(!out.includes('<script'));
  assert.ok(!out.includes('<img'));
  assert.ok(out.includes('&lt;script&gt;'));
});

test('links only allow http(s) and in-page targets', () => {
  assert.ok(!KS.md.inline('[x](javascript:alert(1))').includes('href'));
  assert.ok(!KS.md.inline('[x](data:text/html,hi)').includes('href'));
  assert.match(KS.md.inline('[x](https://example.com)'), /href="https:\/\/example\.com"/);
  assert.match(KS.md.inline('[x](https://example.com)'), /rel="noopener noreferrer"/);
});

test('quotes cannot break out of an attribute', () => {
  const out = KS.md.inline('[x](https://e.com/" onmouseover="alert(1))');
  assert.ok(!/" onmouseover="/.test(out));
});

test('block markdown renders headings, tables and escapes raw HTML', () => {
  const out = KS.md('# Title\n\n<img src=x onerror=1>\n\n| a | b |\n|---|---|\n| 1 | 2 |');
  assert.match(out, /<h3>Title<\/h3>/);
  assert.match(out, /<table>/);
  assert.ok(!out.includes('<img'));
});

test('glossary links become term buttons with a slug', () => {
  assert.match(KS.md.inline('[[Broker|Broker (pattern)]]'), /data-term="broker-pattern"/);
});

test('slug and day numbers', () => {
  assert.equal(KS.slug('OAuth 2.0'), 'oauth-2-0');
  assert.equal(KS.slug('Q&A'), 'q-and-a');
  assert.equal(KS.dayNum('2026-03-30') - KS.dayNum('2026-03-28'), 2); // across the UK clocks-change weekend
});
