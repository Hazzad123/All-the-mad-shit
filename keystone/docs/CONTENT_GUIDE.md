# Keystone content guide

How lesson content is written. Read this fully before authoring a module, then read the two exemplar lessons:

- `content/modules/http.js` → `http-methods` (a systems-style lesson: sequence card, compare table, scenario)
- `content/modules/principles.js` → `dp-srp` (a code-style lesson: annotated code, steps, diagram, spot-the-problem)

Match their depth, tone and variety. They are the quality bar.

## 1. The learner

One real person: can write loops, functions and simple programs from an online course. **Knows nothing about systems** (no HTTP, databases, auth, architecture). Smart, easily bored, often on a phone. They asked for "a non-boring way to learn" with "examples and metaphors". They want to finish understanding how real systems fit together.

So:

- **Start from zero, every time.** Never assume a term from outside the lessons listed as "already done" in your spec. The first time a term appears, explain it in a few words, or wrap it in `[[double brackets]]` if it is in a glossary.
- **Concrete before abstract.** Open with a situation, a problem or a question — not a definition.
- **One idea per card.** If a card needs "also" or "additionally", split it.
- **A metaphor for every big idea**, from everyday life (post, restaurants, libraries, lifts, queues at a shop). Then say where the metaphor stops being true if that matters.
- **Short.** A card is read in 20–40 seconds. Aim for 60–130 words per card.
- **Friendly, direct, lightly funny.** Write like a good senior colleague explaining at a whiteboard. No hype, no "In today's fast-paced world", no "Let's dive in", no lecturing. British spelling (organise, behaviour, colour).
- **Honest.** If something is a simplification, say "roughly" or "for now". If experts disagree, say so in a sentence.
- **Correct.** This is the user's foundation. Prefer durable, well-established facts over this year's fashion. No invented statistics, quotes, version numbers or URLs. If you are not sure of a detail, leave it out.

## 2. Files and workflow

Each module is one file: `content/modules/<moduleId>.js`. It contains one `KS.lesson(id, {...})` call per lesson (in curriculum order), then one `KS.boss(moduleId, {...})` and one `KS.sheet(moduleId, {...})`.

1. Print your spec: `node tools/validate.mjs --spec <moduleId>` (run from the `keystone` folder). It lists the exact lesson ids, titles and the topics each lesson **must teach**. Titles, summaries and minutes live in the curriculum — do not repeat them in your file.
2. Write the file **a few lessons at a time** (it will be 60–150 KB; do not try to write it in one go). Create it with a header comment, the first lesson or two, and a last line that is exactly `/* @@END */`. To add more, use the Edit tool to replace `/* @@END */` with your next lessons followed by `/* @@END */` again. (Do not append with shell heredocs: long commands get cut off.) If the file already exists with an exemplar lesson in it (`http`, `principles`), keep that lesson exactly as it is and add the others in curriculum order.
3. After each chunk run `node --check content/modules/<moduleId>.js` and `node tools/validate.mjs <moduleId>`.
4. Finish only when the validator reports **0 errors**, and you have fixed or consciously accepted each warning.
5. Touch no other files.

## 3. Lesson shape

```js
KS.lesson('lesson-id', {
  eli5: 'One plain sentence (30–240 chars) a non-developer would follow.',
  cards: [ /* 7–10 cards: the teaching */ ],
  activities: [ /* 7–9 activities: the practice */ ],
  flashcards: [ /* 4–6 {q, a} for spaced repetition */ ],
  glossary: [ /* 3–6 {term, def, like?, aka?} */ ],
  takeaways: [ /* 3–4 one-line strings (markdown allowed) */ ],
  links: [ /* optional, 0–2 {label, url} to stable, famous sources only */ ]
});
```

A good lesson usually runs: hook (concept) → metaphor → how it works (example / code / sequence / diagram) → a second angle or detail → pitfall → in the real world / tip. Then practice.

Lessons in the capstone module are different: they are mostly **decisions**. Use short cards to set the scene and a diagram that grows, then several `scenario` activities where the learner makes the design calls and sees consequences.

## 4. Text formatting (markdown-lite)

Supported in `body`, `note`, `explain`, `feedback`, `model`, sheet `md`, and (inline only) in titles, options, labels:

- `**bold**`, `*italic*`, `` `inline code` ``, `==highlight==`, `[link text](https://…)`
- `[[term]]` or `[[shown text|term]]` → a tappable glossary pop-up (use for terms defined in *another* lesson; terms from the current lesson are linked automatically)
- Paragraphs (blank line between), `- ` bullet lists, `1. ` numbered lists (no nesting), `> ` call-outs, `### ` small headings, `---`
- Tables: `| a | b |` rows with a `|---|---|` separator row (keep to 2–3 columns in cards)
- Fenced code blocks with a language: ```` ```sql ````

Not supported: images, HTML tags, nested lists, footnotes. Emoji are fine in moderation.

### JavaScript string rules (these cause most errors)

- Use `'single quotes'` for one-line strings. Use typographic apostrophes (`’`) or escape (`\'`) inside them. Backticks need no escaping inside single quotes: `'Use \`GET\` here'` is wrong, `'Use `GET` here'` is right.
- Use `` `template literals` `` for multi-line text. Inside them, **escape every backtick** as `` \` `` and every `${` as `\${`.
- Indentation inside template literals is stripped automatically, so indent content to match the code around it.
- **Code `src` must start with a newline** straight after the opening backtick (see exemplars), so indentation is measured correctly. Keep code lines under ~80 characters and snippets under ~25 lines.

## 5. Cards

Every card: `{ kind, title, body, … }`. `title` ≤ 70 chars. Kinds:

| kind | chip shown | use it for |
|---|---|---|
| `concept` | 💡 Concept | the plain explanation of an idea |
| `metaphor` | 🎭 Think of it like… | the everyday comparison (**at least one per lesson**) |
| `example` | 🧪 Example | a worked, concrete case |
| `code` | 👩‍💻 In code | code is the point of the card (needs `code`) |
| `pitfall` | ⚠️ Watch out | the classic mistake |
| `realworld` | 🌍 In the wild | where real products use this |
| `tip` | 🧠 Pro tip | a rule of thumb |
| `story` / `history` | 📖 / 🕰️ | a short incident or origin story |
| `deep` | 🤿 Deeper dive | optional extra depth |
| `recap` | 📌 Recap | rarely; takeaways already recap |
| `sequence` | 🎬 Step by step | messages between parties over time |
| `diagram` | 🗺️ The picture | boxes and arrows |
| `layers` | 🥞 Layers | a vertical stack |
| `compare` | ⚖️ Side by side | a comparison table |
| `steps` | 🪜 Walkthrough | a procedure revealed one step at a time |

Any text card may add `code: { lang, src, notes }` and/or `note: 'a small footer call-out'`. Visual kinds may have a short `body` as an intro. Each lesson needs **at least one visual kind or code card**; most should have two.

**Code** — `lang` is one of: `js ts py java cs go rust php rb sql sh http json yaml html css graphql proto docker tf text`. Use JavaScript or Python for general examples unless the topic demands another language. `notes: { 3: 'markdown shown when the learner taps line 3' }` turns lines into tappable annotations — use them; they are popular.

```js
{ kind: 'code', title: 'A guard clause', body: 'Tap the highlighted line.',
  code: { lang: 'js', src: `
    function pay(order) {
      if (!order) return;        // bail out early
      charge(order.total);
    }`, notes: { 2: 'Handle the odd case first, then the happy path reads straight down.' } } }
```

**sequence** — who says what to whom, in order. 2–4 actors (5 is the hard limit), 4–10 steps. Keep arrow `label`s short (≤ 45 chars); put the explanation in `note`. Icons are chosen automatically from actor names (Browser, Server, Database, User, Cache…), or pass `{ name, icon }`.

```js
{ kind: 'sequence', title: 'A cache miss, then a hit', body: 'Step through it.',
  actors: ['App', 'Cache', 'Database'],
  steps: [
    { from: 0, to: 1, label: 'get user:42', note: 'The app asks the cache first.' },
    { from: 1, to: 0, label: 'miss', dashed: true, note: 'Nothing stored yet.' },
    { from: 0, to: 2, label: 'SELECT … WHERE id = 42', note: 'So it asks the database (slow).' },
    { at: 0, label: 'store in cache', note: 'A step one actor does alone uses `at`.' },
    { note: 'A step with only a note is narration.' }
  ] }
```

**diagram** — nodes on a grid: `x` is the column (0–3; 4 columns maximum), `y` the row (0–5). No two nodes in the same cell. `tone`: `accent good warn bad info muted`. Node labels ≤ 26 chars, edge labels ≤ 20. Edges may be `dashed` or `both` (two-headed). Optional `groups: [{ label, x, y, w, h }]` draw a dashed box around grid cells. Prefer tall diagrams to wide ones.

```js
{ kind: 'diagram', title: 'One server, two replicas', body: 'Writes go to the leader.',
  nodes: [ { id: 'app', label: 'App server', icon: '🖥️', x: 1, y: 0 },
           { id: 'l', label: 'Leader', icon: '🗄️', x: 1, y: 1, tone: 'accent' },
           { id: 'f1', label: 'Follower 1', x: 0, y: 2 }, { id: 'f2', label: 'Follower 2', x: 2, y: 2 } ],
  edges: [ { from: 'app', to: 'l', label: 'writes' }, { from: 'l', to: 'f1', label: 'copies', dashed: true }, { from: 'l', to: 'f2', dashed: true } ],
  caption: 'Optional caption under the picture.' }
```

**layers** — `layers: [{ label, note, tone?, icon? }]`, first item drawn on top. 2–8 layers.

**compare** — `cols: ['A', 'B']` (2–3) and `rows: [['Row label', 'cell for A', 'cell for B'], …]` (2–8 rows). Every row is the row label plus exactly one cell per column.

**steps** — `steps: [{ title, body }]`, 3–6 steps.

## 6. Activities

7–9 per lesson, using **at least five different types**. Give 2–3 of them `after: <cardIndex>` (0-based) so a quick check appears right after the card that taught it; leave the rest without `after` to form the practice round at the end. Order the practice round from recall → application.

Rules for all types:

- Test **understanding**, not memory of your wording. Prefer "what happens if…", "which would you choose…", "spot the…".
- Wrong options must be plausible mistakes a beginner would make. No joke options.
- Options are shuffled when shown: never write "all of the above" / "both A and B".
- Keep the right option about the same length as the wrong ones.
- `explain` (required on most types) says **why** the right answer is right in 1–3 sentences. It is shown after right *and* wrong answers, so do not write "Correct!".
- Do not ask about anything the cards (or earlier lessons) did not teach.

| type | fields | notes |
|---|---|---|
| `mcq` | `q`, `options` (3–5), `answer` (index), `explain`, `why?` (one string or `null` per option, shown when that wrong option is picked), `code?` | the workhorse; at most half the activities |
| `multi` | `q`, `options` (4–6), `answers` ([indexes], 2+ but not all), `explain` | "pick all that apply" |
| `tf` | `statement`, `answer` (true/false), `explain` | a crisp claim; also feeds the swipe game. Mix true and false across the lesson |
| `ab` | `q`, `a: {lang, src, label?}`, `b: {…}`, `answer: 'a'|'b'`, `explain` | "which version is better?" Vary which side wins. Do not refer to "A"/"B" in `explain` |
| `match` | `prompt`, `pairs: [[left, right], …]` (4–6) | left ≤ 40 chars, right ≤ 70 |
| `order` | `prompt`, `items` (3–7, written **in the correct order**), `explain` | sequences, pipelines, priorities |
| `bucket` | `prompt`, `buckets` (2–4 names), `items: [[text, bucketIndex], …]` (5–10), `explain?` | fast sorting; every bucket needs an item |
| `cloze` | `text` with `{{answer}}` blanks (1–4), `distractors` (2–5), `explain`, `code?: true` | word-bank fill-in; with `code: true` the text is shown as code |
| `spot` | `prompt`, `code: {lang, src}`, `lines` ([1-based line numbers that count as right]), `explain` | "tap the line with the bug / smell / vulnerability" |
| `short` | `q`, `accept` ([accepted answers]), `hint?`, `explain` | typed recall of **one word or number** (a status code, a command, a keyword). Matching ignores case, spaces and punctuation |
| `estimate` | `q`, `answer` (number), `unit`, `tolerance?` (factor, default 3), `explain` | order-of-magnitude guesses on a log slider. Optional `min`/`max` (both). Great for scale, latency, storage |
| `scenario` | `title`, `intro`, `steps: [{ text, choices: [{ label, feedback, score: 0|1|2, effects? }] }]` (2–5 steps, 2–4 choices), `meters?`, `outro?` | a story where decisions have consequences. Every step needs a best choice (`score: 2`). `meters: { uptime: 80, budget: 60 }` (0–100) with per-choice `effects: { uptime: -20 }` make it feel like a game |
| `explain` | `prompt`, `model` (the model answer), `keywords` (3–8) | "explain it back in your own words", self-graded. At most one per lesson, near the end |

Aim for at least one `scenario` every lesson or two: they are the closest thing to real work. System and security topics suit `scenario`, `order`, `bucket` and `estimate`; code topics suit `spot`, `ab` and `cloze` with `code: true`.

## 7. Flashcards, glossary, takeaways, links

- **Flashcards**: `{ q, a }`. A real question with a one- or two-sentence answer. These come back for months, so make them the facts worth keeping.
- **Glossary**: `{ term, def, like?, aka? }`. `def` is one or two plain sentences. `like` is a one-line everyday comparison (add it for most terms). `aka: ['SRP']` lists alternative names. Define the 3–6 most important new terms of the lesson. Do not re-define a term an earlier lesson in your module already defined.
- **Takeaways**: 3–4 short lines that would fit on a sticky note.
- **Links** (optional): only famous, stable pages you are certain exist — MDN, official project docs, RFCs, martinfowler.com, roadmap.sh. If in doubt, leave `links` out.

## 8. Boss battle and cheat sheet

```js
KS.boss('module-id', {
  title: 'The Protocol Dragon',                    // a fun name
  intro: 'Two sentences of flavour and what will be tested.',
  questions: [ /* 10–12 activities, no `after`, harder and mixing lessons. Types allowed:
                  mcq multi tf ab match order bucket cloze spot short estimate. Use 4+ types. */ ]
});

KS.sheet('module-id', {
  title: 'HTTP & HTTPS cheat sheet',
  sections: [ { title: 'Methods', md: `| Method | Means | Safe | Idempotent |\n|---|---|---|---|\n…` }, … ]   // 4–7 sections
});
```

The cheat sheet is the "quick way to go back and reference stuff": the whole module on one printable page. Dense and scannable — tables, short lists, the key numbers and commands, "X vs Y" rows, common mistakes. No waffle. 40–110 words per section.

## 9. Labs

Some lessons have an interactive lab attached automatically (your spec says so). Do not author it. You may refer to it in one line ("In the lab that follows, you will kill the leader and watch a follower take over"), using only what this table says it does:

| lab id | what the learner does |
|---|---|
| `url-journey` | steps through everything that happens after typing a URL: DNS, TCP, TLS, HTTP, rendering |
| `dns-resolver` | watches a resolver ask root, TLD and authoritative servers; sees caching and TTLs |
| `http-playground` | sends GET/POST/PUT/PATCH/DELETE to a pretend API and reads the raw request and response |
| `encapsulation` | wraps a message layer by layer (HTTP → TCP → IP → Ethernet) and unwraps it at the far end |
| `firewall-rules` | writes allow/deny rules and fires test packets at them |
| `race-condition` | runs two threads incrementing a shared counter, with and without a lock |
| `git-graph` | commits, branches, merges and rebases on a live commit graph |
| `pattern-toys` | plays with small working toys of Strategy, Observer, Decorator, State and Command |
| `coupling-graph` | changes one module and watches the ripple; inserts an interface to cut it |
| `sql-sandbox` | types real SQL against a small shop database, with challenges |
| `normalizer` | finds update anomalies in a messy table and splits it into normal forms |
| `transaction-lab` | interleaves two bank transactions step by step; sees a lost update; applies locks/isolation |
| `index-lab` | races a full table scan against an index lookup; sees the cost on writes |
| `nplus1` | loads a list of posts with lazy vs eager loading and counts the queries |
| `replication-lab` | writes to a leader, reads from lagging followers, kills the leader and fails over |
| `sharding-ring` | places keys with hash-mod-N vs consistent hashing; adds/removes a node and counts moved keys |
| `cap-lab` | cuts the network between two nodes and chooses consistency or availability |
| `quorum-lab` | tunes N, R and W and sees when reads go stale |
| `saga-lab` | runs an order saga across services, injects a failure and watches the compensations |
| `mapreduce` | runs word count through map, shuffle and reduce across workers |
| `graphql-explorer` | ticks fields to build a GraphQL query and compares it with REST round trips |
| `realtime-lab` | compares short polling, long polling, SSE and WebSockets on a timeline |
| `queue-lab` | runs producers, a queue and consumers; causes a backlog, adds consumers, crashes one, sees redelivery and dead letters |
| `hash-lab` | hashes text live; sees the avalanche effect, salts, and brute-force time for fast vs slow hashes |
| `pki-chain` | verifies a certificate chain, then breaks it (expired, wrong name, untrusted issuer) |
| `session-vs-token` | logs in with a server session vs a token, then adds a second server behind a load balancer |
| `jwt-lab` | decodes, edits and re-signs a JWT; watches the signature check fail when it is tampered with |
| `oauth-flow` | plays each party in the authorization-code + PKCE flow |
| `totp-lab` | watches a six-digit code being derived from a shared secret and the clock |
| `rbac-lab` | builds roles and attribute rules, then tests who can do what |
| `injection-lab` | breaks a login with SQL injection and a comment box with XSS, then fixes both |
| `cors-lab` | makes cross-origin requests and sets the server's CORS headers until the browser allows them |
| `cache-sim` | serves requests through a cache; tunes size, TTL and eviction; triggers a stampede |
| `http-cache-lab` | plays the browser cache with Cache-Control and ETag; fast-forwards time to see 200, 304 or no request |
| `cdn-lab` | sends users around the world to the origin vs the nearest edge; first hit misses, later hits are fast |
| `load-balancer` | spreads traffic with different algorithms, kills a server, watches health checks react |
| `estimation-lab` | a back-of-the-envelope calculator: users → requests per second → storage → servers |
| `latency-lab` | orders the famous latency numbers and sees them scaled to human time |
| `circuit-breaker` | drives a flaky downstream service and watches a breaker go closed → open → half-open |
| `rate-limiter` | compares token bucket, fixed window and sliding window; bursts until it gets 429s |
| `deploy-strategies` | rolls out a new version with rolling, blue/green and canary; ships a bad release and rolls back |
| `tracing-lab` | reads a distributed-trace waterfall and finds the slow span |
| `microservices-cascade` | lets one slow service take down a chain, then adds timeouts, breakers and bulkheads |
| `event-sourcing-lab` | sends commands, sees events appended, rebuilds state, time-travels, and watches a lagging read model |
| `k8s-lab` | declares replicas, kills pods and nodes, does a rolling update, watches the control loop repair things |
| `cicd-pipeline` | arranges pipeline stages and pushes commits with different bugs to see which stage catches them |
| `kanban-sim` | runs a board with and without work-in-progress limits and watches cycle time |
| `startup-survival` | the scaling game: grows an app from 100 to 10 million users by buying the right upgrades |

## 10. Final self-check before you finish

- [ ] `node tools/validate.mjs <moduleId>` → 0 errors, warnings dealt with
- [ ] Every topic in the spec's "must teach" list is actually taught, in the lesson it is listed under
- [ ] Every lesson: a hook first, a metaphor, a visual or code card, a pitfall or real-world card
- [ ] Every lesson uses 5+ activity types and has at least one applied activity (scenario / spot / ab / order / bucket / estimate)
- [ ] No term is used before it is explained; nothing from later modules is assumed
- [ ] Facts are right. Numbers are real. No invented URLs
- [ ] The boss has 10–12 questions across all lessons; the cheat sheet has 4–7 dense sections
- [ ] Read three random cards aloud: do they sound like a person, and would a beginner follow them?
