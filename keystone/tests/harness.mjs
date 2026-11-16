// Loads Keystone's browser scripts into a Node `vm` sandbox with just enough of a browser to run them.
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function load(files, { storage = {} } = {}) {
  const store = Object.assign({}, storage);
  const listeners = {};
  const noop = () => {};
  const window = {
    addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
    matchMedia: () => ({ matches: false, addEventListener: noop }),
  };
  const sandbox = {
    window, console,
    setTimeout, clearTimeout,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
    },
    document: { addEventListener: noop, visibilityState: 'visible' },
    navigator: { userAgent: 'node' },
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const f of files) vm.runInContext(readFileSync(join(root, f), 'utf8'), sandbox, { filename: f });
  return { KS: window.KS, sandbox, store, fire: (t, e) => (listeners[t] || []).forEach(fn => fn(e)) };
}
