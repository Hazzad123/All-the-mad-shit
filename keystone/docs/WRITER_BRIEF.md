# Brief for content writers

You are writing lesson content for **Keystone**, an interactive learning website (a static JavaScript site) that teaches backend development, software design and software architecture to one learner who knows basic programming (loops, functions, variables) but nothing about how real systems work. The engine is built and tested. Your job is to author the content for the module(s) you were given.

Project folder (run commands from here): the `keystone` folder of this repository (on this Mac: `/Users/bend/Documents/GitHub/All-the-mad-shit/keystone`). Node is installed.

## Steps (per module)

1. Read `docs/CONTENT_GUIDE.md` in full: it is the schema, the style guide and the workflow. Follow it exactly.
2. Read both exemplar lessons in full: `content/modules/http.js` (lesson `http-methods`) and `content/modules/principles.js` (lesson `dp-srp`). They are the quality bar. Every lesson you write must be as rich as these: same depth, same variety of card kinds and activity types, same care in explanations and feedback. For a finished example of a whole module, skim the first 300 lines of `content/modules/internet.js`.
3. Run `node tools/validate.mjs --spec <moduleId>` to print your lessons: exact ids, titles, the topics each lesson MUST teach, and what the learner has already covered.
4. Create `content/modules/<moduleId>.js`: one `KS.lesson('<lesson-id>', {...})` per lesson in spec order, then `KS.boss('<moduleId>', {...})` and `KS.sheet('<moduleId>', {...})`. Build the file in chunks of one or two lessons using the `/* @@END */` marker technique described in the guide (Write the first chunk, then Edit to replace the marker with the next chunk plus the marker). After each chunk run `node --check content/modules/<moduleId>.js` and `node tools/validate.mjs <moduleId>`, and fix problems before continuing.
5. Finish only when `node tools/validate.mjs <moduleId>` reports 0 errors and you have fixed (or deliberately kept, with a reason) every warning.

If you were given two modules, complete the first entirely (including its boss and sheet) before starting the second.

## What "good" means here

- Start from zero; a concrete situation before any definition; one idea per card (60–130 words); an everyday metaphor for each big idea; friendly, direct, lightly funny; British spelling; no filler phrases.
- 7–10 cards per lesson with real variety (not a wall of `concept` cards): use `sequence`, `diagram`, `layers`, `compare`, `steps` and annotated `code` wherever they genuinely help.
- 7–9 activities per lesson, at least 5 different types, 2–3 placed with `after`, and at least one applied activity (scenario / spot / ab / order / bucket / estimate). The learner explicitly asked for "fun, not just reading".
- Do not get thinner as you go: the last lesson deserves the same effort as the first.
- Factually correct, mainstream and durable. No invented statistics, quotes, version numbers or URLs. If unsure of a detail, leave it out. Where experts genuinely disagree, say so in a sentence.
- Do not pre-teach later modules in depth (the spec lists what comes next); a one-line pointer is fine.
- To show sample data or the result of a query/command, a small markdown table inside a card `body` or `note` works well.

## Constraints

Create or modify ONLY your module file(s) in `content/modules/`. Do not touch the engine, the guide, the curriculum, the validator or other modules. No git commands. Stay within the documented schema (no new card kinds, activity types or fields).

## When finished

Reply with: the validator's final line for each module, the file size in KB, and (briefly) any fact you were unsure about or any schema friction you hit.
