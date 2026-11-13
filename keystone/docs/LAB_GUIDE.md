# Keystone lab guide

A **lab** is a small interactive simulation the learner pokes at until an idea clicks: kill a server, forge a token, lose an update. Labs are what make Keystone "not just reading", so they matter more than anything else on the site.

Read this guide, then read the reference lab `js/labs/load-balancer.js` and the kit `js/core/labkit.js` (API) and `css/labs.css` (classes). The specs for each lab are in `docs/LAB_SPECS.md`.

## The learner

Knows basic programming; knows nothing about systems; often on a phone; asked for "fun". Every lab must work for someone who has only just met the idea in a lesson.

## What makes a good lab

1. **One insight.** The learner should leave able to say "oh, *that* is why…". Everything on screen serves it.
2. **Something goes wrong, then they fix it.** The best goals are: do the normal thing → break it → see the damage → apply the remedy → see it work.
3. **It really simulates.** Use the real algorithm (a real hash ring, real HMAC via `crypto.subtle`, a real token bucket). Never fake an outcome with a canned message when you can compute it.
4. **Immediate, visible feedback.** Every click changes something you can see: a packet moves, a counter ticks, a node turns red, a log line appears in plain English saying *what just happened and why*.
5. **Three to five goals** that walk the learner to the insight. First goal: trivially achievable in 10 seconds. Goals are checked by the simulation's real state, never by "clicked the button".
6. **Plain words.** Labels a beginner understands. Jargon gets a few words of explanation in the log or `help`.
7. **Thumb-friendly.** Works at 360 px wide: big buttons, no hover-only information, no drag-and-drop, no keyboard-only controls.

## File

One file per lab: `js/labs/<id>.js` (the id is already listed in `js/labs/manifest.js`). Plain browser JavaScript, no imports, no external libraries, no network requests. 150–450 lines.

```js
/* Lab: <id> — one line on what it teaches. */
KS.labs.register({
  id: 'cache-sim',
  title: 'Cache Simulator',
  emoji: '⚡',
  blurb: 'One friendly sentence shown under the title and in the gallery.',
  tags: ['caching', 'performance'],                       // used by search
  goals: [ { id: 'hit', text: 'Get your first **cache hit**' }, … ],   // 3–5, markdown-inline allowed
  help: `Markdown shown under "What am I looking at?": what each thing on screen is, in plain English.`,
  mount(root, api) {
    // build the UI inside `root`, wire it up, start the simulation
    return () => { /* optional extra cleanup */ };
  }
});
```

## The `api` object

| member | use |
|---|---|
| `api.goal(id)` | mark a goal complete (idempotent; plays the sound, ticks the box, awards XP once). Call it from the code that detects the real condition |
| `api.goalDone(id)` | has it been completed in this session? |
| `api.ui` | the UI kit (below). `api.h` is the hyperscript helper `KS.h` |
| `api.every(ms, fn)` / `api.after(ms, fn)` | interval / timeout that is **cleared automatically** when the lab closes. Never use raw `setInterval`/`setTimeout` |
| `api.loop((dt, t) => {…})` | per-frame simulation loop (`dt` in seconds). Keeps ticking slowly in background tabs |
| `await api.sleep(ms)` | pause inside an async sequence (shortened automatically for reduced-motion users) |
| `api.alive()` | false once the lab is closed. Check it after every `await` before touching the DOM |
| `api.compact` | true on narrow screens |
| `api.toast(text)` / `api.sfx(name)` | rarely needed; the log is usually better |
| `api.onCleanup(fn)` | register extra cleanup |

## The UI kit (`api.ui`)

Layout: `ui.panel(title, ...children)`, `ui.row(...children)`, `ui.cols(colA, colB, …)` (each an array of nodes), `ui.note(markdown, tone?)`, `ui.kv([[label, value], …])`, plus CSS classes `lab-grid2` (2 columns, stacks on phones), `lab-grid2 even`, `lab-grid3`, `lab-stack`.

Controls (each returns an element with `.get()` / `.set(v)`):
`ui.btn(label, onClick, kind?)` (`kind`: `'primary' | 'ghost' | 'danger' | 'sm'`), `ui.toggle(label, value, onChange)`, `ui.slider(label, {min, max, step?, value, fmt?}, onChange)`, `ui.select(label, [[value, text], …], value, onChange)`, `ui.seg([[value, text], …], value, onChange)` (segmented buttons), `ui.input(label, value, onChange, attrs?)`, `ui.textarea(label, value, onChange, rows?)`, `ui.tabs([[id, label, render(host)], …])`.

Read-outs: `ui.log(max?)` → `{el, add(markdown, tone?), clear()}` (tones: `good bad warn info dim`), `ui.stat(label, value, tone?)` → `{el, set(value, tone?)}`, `ui.stats(...stats)`, `ui.meter(label)` → `{el, set(0..1, text?, tone?)}`, `ui.code(src, lang)`.

Diagrams: `ui.node(label, icon, {tone?, sub?, small?, onClick?})` → a box with `.setState('ok' | 'busy' | 'down' | 'warn' | 'idle' | 'active')`, `.setSub(text)`, `.badge(text)`, `.pulse('good' | 'bad')`.
`ui.stage()` → `{el, wire(a, b, {tone?, dashed?}) → {set(tone, dashed), remove()}, send(a, b, {label?, tone?, ms?}) → Promise, clearWires(), destroy()}`. Put nodes inside `stage.el` (usually with `ui.cols`), draw wires between them, and `await stage.send(a, b)` to fly a packet from one to the other. Call `stage.destroy()` in your cleanup.

Extra classes in `css/labs.css`: `lab-chip` (+ `tn-good/bad/warn/accent`), `lab-table` inside `lab-table-wrap` (rows can be `.hl .good .bad .dim`), `lab-cells` / `lab-cell` (small boxes for keys, rows, tokens; states `.hl .good .bad .dim`), `lab-mono`, `lab-big`. Buttons use the global `btn` classes. Colours come from CSS variables: `--accent --accent-2 --good --bad --warn --info --panel --panel-2 --panel-3 --line --line-2 --text --muted --faint --bg-2`. Never hard-code colours (there is a light theme). If you need a little custom CSS, inject one `<style>` element from `mount` with class names prefixed by your lab id, and remove it in cleanup — but prefer the kit.

Custom drawing: use inline SVG via `KS.s('svg', {viewBox: '0 0 400 200'}, …)` with `stroke`/`fill` set through `style` using the CSS variables above. No canvas unless essential.

## Structure that stays bug-free

```js
mount(root, api) {
  const ui = api.ui, h = api.h;
  const state = { /* the whole simulation state: plain data */ };
  // 1. build static UI once, keep references to the bits that change
  // 2. small pure functions for the model:   step(state), pick(state), verify(token) …
  // 3. one render() that pushes state into the DOM, and one check() that calls api.goal(...)
  // 4. handlers: mutate state → render() → check()
}
```

- Keep the model (pure logic) separate from the DOM so it can be reasoned about. Prefer re-rendering a small region from state over patching DOM by hand in ten places.
- Async sequences: `await stage.send(...)`, `await api.sleep(...)`, and after **every** await do `if (!api.alive()) return;`.
- Disable buttons while a sequence they started is still running, or make re-entry safe.
- Nothing persists between visits; do not use localStorage.
- No `alert`, `confirm`, `prompt`. No `innerHTML` with user-typed text (use `textContent` or `KS.esc`). Markdown helpers: `KS.md(text)` (block) and `KS.md.inline(text)` return safe HTML.
- `crypto.subtle` is available (pages are served over http://localhost or https). It is async: `await crypto.subtle.digest('SHA-256', bytes)`.
- Randomness is fine, but goals must be reliably achievable within a minute or two.
- Respect small screens: wide content goes inside an `overflow-x: auto` wrapper (`lab-stage` and `lab-table-wrap` already scroll).

## Tone of the text

- Goals: imperative and specific: "Kill a server with health checks **off** and watch requests fail".
- Log lines: what happened + why, in plain words: "Client C → Server B → **no answer** ✗ (the balancer does not know B is dead)".
- `help`: 80–180 words. What each thing on screen represents; the one-paragraph idea behind it. British spelling.

## Checking your work

1. `node --check js/labs/<id>.js` must pass.
2. Structure check: `node tools/labcheck.mjs <id>` (registers the lab in a sandbox and checks its shape).
3. If your lab has algorithmic logic (parser, hashing, token maths, scheduling), prove it with a throwaway Node script in a temp folder outside the project: pull the pure functions out and assert on known answers (for example RFC test vectors for TOTP/HMAC, hand-computed SQL results).
4. Re-read `mount` once purely looking for: a handler that can throw on empty input, a goal that can never fire, a timer not created through `api`, text that a beginner would not understand, anything that needs more than 360 px.

Touch only your own lab files. Do not edit the kit, the CSS, the manifest or other labs. If the kit is missing something you need, build it locally inside your lab.
