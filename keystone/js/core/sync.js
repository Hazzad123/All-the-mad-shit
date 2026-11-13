/* Keystone — moving progress between devices: file export/import, copy-paste sync codes, optional GitHub Gist cloud sync. */
(function () {
  'use strict';
  const KS = window.KS, S = KS.store, U = KS.ui;
  const Y = (KS.sync = {});

  // ---------- file ----------
  Y.exportFile = function () { U.download('keystone-progress-' + KS.today() + '.json', S.exportJSON()); };
  Y.importFile = function (file, mode) {
    return new Promise(function (resolve, reject) {
      const r = new FileReader();
      r.onload = function () { try { let text = String(r.result).trim(); if (/^KS[01]\./.test(text)) return Y.fromCode(text, mode).then(resolve, reject); S.importJSON(text, mode); KS.game.check(true); resolve(); } catch (e) { reject(e); } };
      r.onerror = function () { reject(new Error('could not read the file')); };
      r.readAsText(file);
    });
  };

  // ---------- sync code (gzip + base64) ----------
  function b64(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(str) { const bin = atob(str); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; }
  Y.code = function () {
    const json = S.exportJSON(); const bytes = new TextEncoder().encode(json);
    if (typeof CompressionStream === 'undefined') return Promise.resolve('KS0.' + b64(bytes));
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Response(stream).arrayBuffer().then(function (buf) { return 'KS1.' + b64(new Uint8Array(buf)); });
  };
  Y.fromCode = function (code, mode) {
    code = String(code).replace(/\s+/g, '');
    const kind = code.slice(0, 4); const data = code.slice(4);
    if (kind !== 'KS0.' && kind !== 'KS1.') return Promise.reject(new Error('not a Keystone sync code'));
    let bytes; try { bytes = unb64(data); } catch (e) { return Promise.reject(new Error('the code looks cut off or damaged')); }
    const p = kind === 'KS0.' ? Promise.resolve(bytes.buffer) : new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    return p.then(function (buf) { S.importJSON(new TextDecoder().decode(buf), mode); KS.game.check(true); });
  };

  // ---------- GitHub Gist cloud sync (optional, bring-your-own-token) ----------
  const GKEY = 'keystone.cloud'; const FILE = 'keystone-progress.json'; const API = 'https://api.github.com';
  const G = (Y.gist = {});
  let busy = null, dirty = false;
  G.config = function () { try { return JSON.parse(localStorage.getItem(GKEY) || '{}') || {}; } catch (e) { return {}; } };
  function saveCfg(c) { try { localStorage.setItem(GKEY, JSON.stringify(c)); } catch (e) { /* storage full */ } }
  G.enabled = function () { return !!G.config().token; };
  function call(path, opts) {
    const cfg = G.config(); opts = opts || {};
    return fetch(API + path, { method: opts.method || 'GET', headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + (opts.token || cfg.token), 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' }, body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (res) {
        if (res.status === 401) throw new Error('GitHub rejected the token (401). Check it has not expired.');
        if (res.status === 403 || res.status === 404) throw new Error('GitHub said no (' + res.status + '). The token needs the “Gists: read and write” permission.');
        if (!res.ok) throw new Error('GitHub error ' + res.status);
        return res.json();
      });
  }
  function findGist(token) {
    return call('/gists?per_page=100', { token: token }).then(function (list) {
      const hit = (list || []).filter(function (g) { return g.files && g.files[FILE]; })[0];
      if (hit) return hit.id;
      return call('/gists', { token: token, method: 'POST', body: { description: 'Keystone learning progress (auto-synced)', public: false, files: (function () { const f = {}; f[FILE] = { content: S.exportJSON() }; return f; })() } }).then(function (g) { return g.id; });
    });
  }
  G.connect = function (token) {
    return findGist(token).then(function (id) { saveCfg({ token: token, id: id, last: 0 }); return G.sync(); });
  };
  G.disconnect = function () { try { localStorage.removeItem(GKEY); } catch (e) { /* ignore */ } };
  /** Pull → merge → push. Safe to call often; concurrent calls share one run. */
  G.sync = function () {
    if (busy) return busy;
    const cfg = G.config(); if (!cfg.token || !cfg.id) return Promise.reject(new Error('cloud sync is not set up'));
    busy = call('/gists/' + cfg.id).then(function (g) {
      const f = g.files && g.files[FILE];
      if (!f) return null;
      if (f.truncated && f.raw_url) return fetch(f.raw_url).then(function (r) { return r.text(); });
      return f.content;
    }).then(function (remote) {
      if (remote) { try { S.importJSON(remote, 'merge'); KS.game.check(true); } catch (e) { console.warn('[sync] remote copy unreadable, overwriting', e); } }
      const files = {}; files[FILE] = { content: S.exportJSON() };
      return call('/gists/' + cfg.id, { method: 'PATCH', body: { files: files } });
    }).then(function () { const c = G.config(); c.last = Date.now(); delete c.error; saveCfg(c); dirty = false; busy = null; KS.bus.emit('synced'); })
      .catch(function (e) { const c = G.config(); c.error = e.message; saveCfg(c); busy = null; throw e; });
    return busy;
  };
  /** Start background syncing (call once per page). */
  G.auto = function () {
    if (!G.enabled()) return;
    G.sync().catch(function () { /* surfaced in settings */ });
    KS.bus.on('xp', function () { dirty = true; });
    setInterval(function () { if (dirty && G.enabled() && navigator.onLine !== false) G.sync().catch(function () {}); }, 90 * 1000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && dirty && G.enabled()) G.sync().catch(function () {}); });
  };
})();
