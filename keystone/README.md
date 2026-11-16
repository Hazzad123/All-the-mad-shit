# Keystone

An interactive learning platform covering the roadmap.sh **Backend**, **Software Design & Architecture** and **Software Architect** roadmaps: 317 bite-sized lessons in 12 worlds, hands-on simulation labs, 12 arcade games, spaced-repetition flashcards, boss battles, cheat sheets, a glossary and a roadmap coverage map.

It is a static website: plain HTML, CSS and JavaScript. No build step, no server code, no accounts.

## Two ways in

| | Where | For |
|---|---|---|
| **Studio** | `index.html` | the full desktop environment: journey map, lessons, labs, library, roadmaps, profile |
| **Pocket** | `pocket.html` | phones: four thumb tabs, two-minute sessions (flashcards, Fact-or-Cap swipes, daily challenge), lessons in a compact player |

Phones are sent to Pocket automatically. Both modes share the same progress.

## Run it locally

From this folder:

```bash
python3 -m http.server 8123    # on Windows: python -m http.server 8123
```

Then open http://localhost:8123. (Opening `index.html` straight from disk will not work, because lessons load on demand.)

## Host it

Upload this folder as-is to any static host. Two free options:

**Netlify Drop**: drag the `keystone` folder onto https://app.netlify.com/drop.

**GitHub Pages**: push the folder to a repository, then go to Settings → Pages → *Deploy from a branch*.

Updates show up for visitors straight away: the offline cache is only used when there's no connection.

## Saving progress

- Progress saves automatically in your browser (localStorage).
- **Profile → Your data** has three ways to move it between devices. Every one merges, so nothing is lost:
  - **Export / Import file**
  - **Sync code**: copy on one device, paste on the other.
  - **Cloud sync** (optional): paste a GitHub token that has only the *Gists: read and write* permission. Progress then syncs automatically to a secret (unlisted) gist in your own account. Secret gists aren't listed or searchable, but anyone with the exact link can read them.
- On a hosted copy (HTTPS), the whole site works offline after your first visit: the service worker caches every file. Profile → About says when it's ready. On a phone, use "Add to Home Screen" to install it like an app.
- After adding, removing or changing files, run `node tools/precache.mjs` so the offline file list stays complete (CI checks this).

## Project layout

```
index.html / pocket.html     the two shells
css/                         base (tokens + components), app (panels, games), labs, studio, pocket
js/core/                     engine: store, markdown, content registry, activities, player, game, arcade, labkit, sync, panels
js/studio/ js/pocket/        the two shells' routing and pages
js/labs/                     one file per interactive lab (+ manifest.js)
content/curriculum-*.js      the course structure: worlds → modules → lessons, and which roadmap topics each covers
content/roadmaps.js          every node of the three roadmaps
content/modules/<id>.js      lesson content, a boss battle and a cheat sheet per module
docs/                        authoring guides (CONTENT_GUIDE, LAB_GUIDE, LAB_SPECS, WRITER_BRIEF)
tools/validate.mjs           content validator + roadmap coverage check
tools/labcheck.mjs           lab checker
tools/precache.mjs           writes precache.js (the offline file list for sw.js)
tests/                       unit tests (node --test)
js/dev/selftest.js           in-browser self-test (renders every card, answers every activity right and wrong)
```

## Checking content

```bash
node tools/validate.mjs            # all modules + roadmap coverage
node tools/validate.mjs authn      # one module
node tools/validate.mjs --stats    # size table
node tools/labcheck.mjs            # every lab
node tools/validate.mjs --glossary # glossary terms whose definitions differ a lot
npm test                           # unit tests (progress merging, import safety, markdown)
npm run check                      # everything CI runs: validator, labs, offline list, tests
```

The browser self-test renders every lesson and answers every activity: open `index.html?dev`, then run `await KS.selftest.content()` in the console.

Lessons whose content isn't written yet still show on the map, marked "coming soon".
