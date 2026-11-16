/* Module: caching — Caching.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs caching */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ca-why', {
  eli5: 'A cache is a small, fast notepad where a computer keeps answers it has already worked out, so the next person who asks the same question gets the answer straight away.',

  cards: [
    { kind: 'concept', title: 'The same question, ten thousand times',
      body: `Imagine a café with a chalkboard menu. Now imagine that every time a customer asks "what do you have today?", the owner disappears into the back office, digs out the supplier invoices, works out what is in stock, and writes a fresh menu by hand.

        By lunchtime the café is empty and the owner is exhausted. The menu did not change once.

        Websites do this all the time. A busy page might ask the database the *same* question thousands of times a minute, and the database does the same slow work each time. The fix is almost embarrassingly simple: **keep the answer somewhere handy and reuse it.** That is a **cache**.` },

    { kind: 'metaphor', title: 'The sticky note on the fridge',
      body: `You could check the wall calendar in the hallway every time you wonder when the dentist is. Or you could write "Dentist: Thu 3pm" on a sticky note and put it on the fridge.

        - The **calendar** is the source of truth: always right, but a walk away.
        - The **sticky note** is a copy: instant, but small, and it can go out of date if the appointment moves.

        A cache is a sticky note. It trades a little **memory** (somewhere to keep the copy) for a lot of **speed** (no walk to the hallway). Where the metaphor stops: your fridge has room for a handful of notes. A cache is also small, so it has to decide which notes are worth keeping.` },

    { kind: 'sequence', title: 'A miss, then a hit',
      body: 'Step through two visits to the same product page. The first one is slow; the second is not.',
      actors: ['App', 'Cache', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'get product:42', note: 'A customer asks for product 42. The app checks the cache **first**.' },
        { from: 1, to: 0, label: 'miss (nothing there)', dashed: true, note: 'The cache has never seen product 42. This is a **cache miss**.' },
        { from: 0, to: 2, label: 'SELECT … WHERE id = 42', note: 'So the app does the slow thing and asks the database.' },
        { from: 2, to: 0, label: 'the product row', dashed: true, note: 'The database answers. This part took, say, 50 milliseconds.' },
        { from: 0, to: 1, label: 'save product:42', note: 'Before replying, the app **stores a copy** in the cache for next time.' },
        { from: 0, to: 1, label: 'get product:42 (next customer)', note: 'A second customer asks for the same product a moment later.' },
        { from: 1, to: 0, label: 'hit! here is the copy', dashed: true, note: 'This is a **cache hit**. It took about a millisecond, and the database never heard about it.' }
      ] },

    { kind: 'concept', title: 'Hit rate: the only number that matters',
      body: `Count how many requests the cache answered itself (**hits**) and divide by all requests. That fraction is the **hit rate**. Ask for 1,000 things, get 900 from the cache: a 90% hit rate.

        Suppose a cache lookup costs 1 ms and a database trip costs 50 ms. A miss pays for both (look, then fetch), so about 51 ms. The average cost per request:

        | Hit rate | Average time |
        |---|---|
        | 0% | 51 ms |
        | 50% | 26 ms |
        | 90% | 6 ms |
        | 99% | 1.5 ms |

        Going from 90% to 99% looks small, but the database now sees **a tenth** of the traffic it did before. Nearly all the benefit lives in that last stretch.`,
      note: 'The arithmetic: average = hit rate × 1 ms + miss rate × 51 ms. At 90%: 0.9 + 5.1 = 6 ms.' },

    { kind: 'concept', title: 'TTL: every note gets an expiry date',
      body: `Back to the sticky note. If the dentist moves your appointment, the note on the fridge is now **wrong**, and nothing tells it so.

        The simplest defence is to stamp each copy with a **TTL** (time to live): "trust this for 60 seconds, then throw it away and fetch a fresh one."

        - **Short TTL**: answers stay fresh, but you miss more often.
        - **Long TTL**: more hits, but people may see old data for longer.

        There is no correct TTL. It is a decision about *how wrong you can afford to be, for how long*. A list of trending videos can be a minute old. An account balance cannot.` },

    { kind: 'layers', title: 'Caches all the way down',
      body: 'A single click can pass through half a dozen caches before it reaches your database. Each one is a chance to stop early. Top is closest to the user.',
      layers: [
        { label: 'Browser cache', note: 'On the user’s own device. The fastest hit of all: no network at all.', icon: '🌐', tone: 'good' },
        { label: 'CDN', note: 'Copies of your content in servers around the world, close to users.', icon: '🛰️' },
        { label: 'Web server / reverse proxy', note: 'Keeps whole pages or files it has recently served.', icon: '🚪' },
        { label: 'Application memory', note: 'A variable or map inside your running program.', icon: '🧠' },
        { label: 'Shared cache (Redis, Memcached)', note: 'A fast in-memory store that all your app servers use.', icon: '⚡' },
        { label: 'Database’s own cache', note: 'Databases keep recently used data in RAM too, without being asked.', icon: '🗄️', tone: 'warn' }
      ] },

    { kind: 'tip', title: 'What is worth caching?',
      body: `A cache has limited room, so be picky. The best candidates share three traits:

        1. **Expensive** to produce: a slow query, a big calculation, a call to another company's API.
        2. **Asked for again and again**: the home page, not one customer's one-off report.
        3. **Fine if slightly stale**: a product description, not a stock count at checkout.

        Cheap, unique or must-be-exact data is a poor fit. Caching it costs memory and complexity and saves almost nothing.`,
      note: 'Rough rule: if nothing is asked for twice, a cache only adds work.' },

    { kind: 'story', title: 'The two hard things',
      body: `There is an old joke in programming, usually credited to a developer called Phil Karlton:

        > "There are only two hard things in Computer Science: cache invalidation and naming things."

        It gets repeated because it is painfully true. Storing a copy is easy. Knowing the moment that copy has become **wrong**, and getting rid of it, is where the bugs live. Every cache is a promise that "this is probably still right", and the whole craft is deciding how long you can keep that promise.

        The last lesson in this module is entirely about how it goes wrong. For now, remember that *a cache is a trade, not a free lunch*.` },

    { kind: 'pitfall', title: 'The price that would not change',
      body: `A shop updates a product's price from £20 to £15 for a sale. The database now says £15. But the product page is cached for an hour, so for the next hour half the customers see £20, and a few who saw £15 earlier now see £20 again.

        Nobody made a mistake in the code. The cache simply did what it was told: **keep answers**.

        This is why every cache needs an answer to "when does this copy stop being trusted?" Either by time (a TTL), or by being told to forget (an **invalidation**, covered later).`,
      note: 'In the lab that follows you will serve requests through a cache and watch hit rate rise and fall as you change its size and TTL.' }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'The app asks the cache for `user:7`, finds nothing, fetches the user from the database, and stores a copy. What happened on that first request?',
      options: ['A cache miss, followed by a database read', 'A cache hit, followed by a database write', 'A cache hit, because the app saved it afterwards', 'A database miss, so the cache took over'],
      answer: 0,
      why: [null, 'Nothing was found, so there was no hit, and the database was only read from.', 'The copy was saved *after* the lookup. The lookup itself found nothing.', 'The database is the source of truth; it does not "miss" here.'],
      explain: 'A **miss** means the cache did not have the answer, so the slow source had to be asked. The copy saved afterwards turns the *next* request into a hit.' },

    { type: 'estimate', after: 3, q: 'A site receives 2,000 requests per second for product pages. The cache has a 90% hit rate. Roughly how many requests per second reach the database?',
      answer: 200, unit: 'requests per second', min: 1, max: 5000, tolerance: 1.5,
      explain: '10% of 2,000 is **200** (the misses). Without the cache the database would take all 2,000. That is why a high hit rate is such a big win: it shrinks the load on the slowest part.' },

    { type: 'tf', after: 4, statement: 'A longer TTL always gives a better cache, because more requests are answered from the copy.', answer: false,
      explain: 'A longer TTL raises the hit rate but also lets people see **stale** data for longer. The right TTL depends on how out of date the answer is allowed to be.' },

    { type: 'match', prompt: 'Match each cache to where it lives.',
      pairs: [['Browser cache', 'On the visitor’s own device'], ['CDN', 'Servers spread around the world near users'], ['Redis or Memcached', 'A shared in-memory store beside your app servers'], ['A variable in your program', 'Inside one application’s own memory'], ['Database buffer cache', 'The database keeping hot data in RAM']] },

    { type: 'bucket', prompt: 'Good candidate for a cache, or a poor one?', buckets: ['Good to cache', 'Poor to cache'],
      items: [['The home page, seen by everyone every few seconds', 0], ['A product description that changes about once a week', 0], ['The result of a 2-second report that 500 people run each morning', 0], ['The exact stock count at the moment someone pays', 1], ['A one-off export that only one person ever requests', 1], ['A user’s live bank balance on a transfer screen', 1]],
      explain: 'Cache what is expensive, shared and fine to be slightly old. Be wary of data that is unique per request (no repeat, no benefit) or must be exactly right at the moment of use.' },

    { type: 'short', q: 'What does the abbreviation TTL stand for? Give the three words (or just the abbreviation if you like).', accept: ['time to live', 'timetolive', 'TTL'], hint: 'How long an entry is allowed to live.',
      explain: '**Time to live**: the number of seconds a stored copy is trusted before it is thrown away or refetched.' },

    { type: 'scenario', title: 'The sale-day cache', intro: 'You run the backend for a small online shop. The home page shows the ten best-selling items and takes 400 ms to build from the database. Today is the big sale, traffic is up fiftyfold, and the database is wheezing.',
      meters: { 'speed': 30, 'data freshness': 80 },
      steps: [
        { text: 'The home page is identical for every visitor. What do you do first?',
          choices: [
            { label: 'Build the page once, store it in a cache, and serve the copy', score: 2, effects: { 'speed': 50 }, feedback: 'Exactly the right first move: expensive, shared by everyone, asked for constantly. The database now builds that page once per expiry instead of once per visitor.' },
            { label: 'Buy a bigger database and leave everything else alone', score: 1, effects: { 'speed': 15 }, feedback: 'It may help, but you are paying to do the same repeated work faster. A cache removes the work.' },
            { label: 'Cache each visitor’s shopping basket instead', score: 0, effects: { 'speed': 5, 'data freshness': -20 }, feedback: 'Baskets are unique to each person and change constantly, so they are rarely reused. Low hit rate, high risk of stale baskets.' }
          ] },
        { text: 'The page is cached. How long should the copy live (its TTL)?',
          choices: [
            { label: 'About 30 to 60 seconds', score: 2, effects: { 'speed': 10, 'data freshness': -5 }, feedback: 'A sensible trade: the database builds the page at most once a minute, and a best-seller list that is 60 seconds old harms nobody.' },
            { label: 'Seven days, to be safe', score: 0, effects: { 'speed': 5, 'data freshness': -50 }, feedback: 'The sale ends tonight, but the home page would still be advertising it next week, and sold-out items would linger.' },
            { label: '1 second', score: 1, effects: { 'data freshness': 5 }, feedback: 'Very fresh, but at heavy traffic you would still rebuild the page constantly and lose much of the benefit.' }
          ] },
        { text: 'On the checkout page, the app shows "only 3 left!". Should that count come from the same style of cache?',
          choices: [
            { label: 'No: read stock from the database at the moment of purchase', score: 2, effects: { 'data freshness': 15 }, feedback: 'Must-be-exact data belongs at the source of truth. A stale count here could let you sell items you do not have.' },
            { label: 'Yes: cache it for an hour like everything else', score: 0, effects: { 'data freshness': -30 }, feedback: 'You would oversell. Caching is fine for browsing; checkout needs the real number.' },
            { label: 'Cache it for 10 seconds, and still check the database when payment is taken', score: 1, effects: { 'speed': 5, 'data freshness': 5 }, feedback: 'A reasonable compromise: a slightly stale label for browsing, with the real check at the point that matters.' }
          ] }
      ],
      outro: 'The pattern: **cache what is shared and expensive, pick a TTL by how wrong you can afford to be, and keep exact data at the source.**' },

    { type: 'explain', prompt: 'A friend says: "A cache just makes things faster, so why not cache everything for as long as possible?" Explain what it costs and what can go wrong.',
      model: 'A cache keeps copies in memory, so it uses up space and only has room for so much. It is fast because it skips the slow source, but the copy can become stale when the real data changes, and nothing tells the cache automatically. A long TTL raises the hit rate but shows old data for longer. Data that is unique or must be exact gains little from caching, so you cache what is expensive, repeated and can tolerate being slightly old.',
      keywords: ['memory', 'copy', 'stale', 'TTL', 'hit rate', 'invalidation', 'fresh'] }
  ],

  flashcards: [
    { q: 'What is a cache, in one sentence?', a: 'A small, fast store of copies of answers, kept so repeat requests skip the slow work of producing them.' },
    { q: 'What are a cache hit and a cache miss?', a: 'A hit means the cache had the answer. A miss means it did not, so the slow source (such as the database) had to be asked.' },
    { q: 'How is hit rate calculated, and why does it matter?', a: 'Hits divided by total requests. The higher it is, the less traffic reaches the slow source behind the cache.' },
    { q: 'What is a TTL?', a: 'Time to live: how long a cached copy is trusted before it is discarded or refetched.' },
    { q: 'What are the "two hard things" in the old programming joke?', a: 'Cache invalidation and naming things. Knowing when a stored copy has gone wrong is the hard part of caching.' }
  ],

  glossary: [
    { term: 'Cache', def: 'A fast, limited store of copies of data or results, kept close to whoever needs them to avoid repeating slow work.', like: 'A sticky note on the fridge instead of walking to the wall calendar.' },
    { term: 'Cache hit', def: 'A request that the cache could answer from its stored copy.', like: 'Finding the answer on the sticky note.' },
    { term: 'Cache miss', def: 'A request the cache could not answer, so the original source had to be asked.', like: 'The sticky note is blank, so you walk to the calendar.' },
    { term: 'Hit rate', def: 'The share of requests answered by the cache: hits divided by all requests.', like: 'How often the sticky note saves you a walk.' },
    { term: 'TTL', def: 'Time to live. A countdown on each cached copy; when it runs out, the copy is thrown away or refetched.', like: 'The use-by date on a carton of milk.', aka: ['time to live'] },
    { term: 'Stale data', def: 'A cached copy that no longer matches the real, current data.', like: 'A sticky note that still says Thursday after the appointment moved.' }
  ],

  takeaways: [
    'A cache trades **memory for speed** by keeping copies of answers you have already worked out.',
    '**Hit rate** is the number to watch: a few extra percent can mean a fraction of the database load.',
    'A **TTL** says how long to trust a copy. It is a choice about how stale you can afford to be.',
    'Caches exist at every layer, and the hard part is knowing when a copy has gone **wrong**.'
  ],

  links: [
    { label: 'MDN: Caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ca-http', {
  eli5: 'Servers can add a short note to their replies telling browsers how long to keep a copy and how to check whether it is still fresh, so the browser can skip asking again.',

  cards: [
    { kind: 'concept', title: 'The fastest request is the one never sent',
      body: `Open a news site, close it, open it again a minute later. The logo, the fonts and the stylesheet all appear instantly. Did the site's servers really send them again?

        Almost certainly not. Your browser kept copies from the first visit. It has its own cache, and it can reuse a file without so much as asking the server.

        That is the best kind of caching: **no network, no server, no cost**. But the browser will only do it if the server says it is allowed to, and for how long. Those instructions travel in an [[HTTP header|Header]] called \`Cache-Control\`.` },

    { kind: 'metaphor', title: 'The library book and its due date',
      body: `When you borrow a library book, it is stamped **"return by 14 June"**. Until then you do not ask the library whether you may keep it. You just read it.

        A response with \`Cache-Control: max-age=600\` is a library book with a ten-minute due date. For those ten minutes the browser **uses its copy without asking**.

        When the date passes, the browser does not necessarily throw the book away. It can pop back and ask the librarian: "I have edition 7 of this. Is that still the current one?" If so, the librarian says "yes, keep it" and the trip is quick. Hold on to that idea; it is the second half of this lesson.` },

    { kind: 'code', title: 'A response that says "keep this"',
      body: 'The server attaches caching instructions to the response. **Tap the lines.**',
      code: { lang: 'http', src: `
        HTTP/1.1 200 OK
        Content-Type: image/png
        Cache-Control: public, max-age=86400
        ETag: "a1b2c3"
        `,
        notes: {
          1: 'A perfectly ordinary successful response. The caching rules are in the headers.',
          3: '`max-age=86400` means "this copy is **fresh for 86,400 seconds**" (one day). While fresh, the browser reuses it without contacting the server. `public` means shared caches, such as a company proxy or a CDN, may keep it too.',
          4: 'An **ETag** is a label for this exact version of the file. It is the key to the cheap re-check in a few cards’ time.'
        } } },

    { kind: 'compare', title: 'The Cache-Control directives you will use',
      body: 'A directive is one instruction inside the header. You can combine them with commas.',
      cols: ['What it tells caches', 'Typical use'],
      rows: [
        ['`max-age=N`', 'Reuse this copy without asking for N seconds', 'Images, fonts, scripts'],
        ['`no-cache`', 'You may keep a copy, but **check with the server before every reuse**', 'HTML pages that change'],
        ['`no-store`', 'Do not keep a copy anywhere, ever', 'Bank statements, medical records'],
        ['`private`', 'Only the user’s own browser may keep it, not shared caches', 'Pages with personal data'],
        ['`public`', 'Any cache, including shared ones, may keep it', 'Public images and files']
      ] },

    { kind: 'pitfall', title: '"no-cache" does not mean "do not cache"',
      body: `This name trips up almost everyone, because it says the opposite of what it does.

        - \`no-cache\`: **keep a copy, but revalidate every time** before using it. Fast when nothing changed, because the re-check is tiny.
        - \`no-store\`: **never keep a copy at all.** This is the one you want for sensitive pages.

        If you put \`no-cache\` on a page with someone's medical results and think it will not be stored, it may well be sitting in the browser's cache folder. For that, you want \`no-store\`.`,
      note: 'Two more worth knowing: `private` stops shared caches (like a CDN) from keeping a user-specific page, and `public` allows it.' },

    { kind: 'concept', title: 'ETag: a fingerprint for a version',
      body: `What happens when the due date passes? The browser could simply download the whole file again. But most of the time the file has not changed, which would be a waste.

        So the server gives each version of a file a label, the **ETag**: often a hash of the contents. When the browser's copy expires, it asks: *"I have the version labelled "a1b2c3". Is that still current?"* That is a **conditional request**, sent in a header called \`If-None-Match\`.

        - Still current: the server replies **304 Not Modified**, with no body. A few hundred bytes, not the whole file.
        - Changed: the server sends the new file in full, with a new ETag.` },

    { kind: 'sequence', title: 'The re-check that costs almost nothing',
      body: 'Step through a visit after the copy has expired.',
      actors: ['Browser', 'Server'],
      steps: [
        { at: 0, label: 'copy expired', note: 'The browser holds logo.png, but its `max-age` ran out. It cannot just use it.' },
        { from: 0, to: 1, label: 'GET /logo.png', note: 'It asks again, but adds one extra header.' },
        { at: 0, label: 'If-None-Match: "a1b2c3"', note: 'The header says: "I already have the version labelled a1b2c3."' },
        { at: 1, label: 'compares ETags', note: 'The server checks whether the current logo is still "a1b2c3". It is.' },
        { from: 1, to: 0, label: '304 Not Modified', dashed: true, note: 'No body is sent. The headers say "keep using your copy", and the freshness timer restarts.' },
        { at: 0, label: 'shows the cached logo', note: 'The user sees the image straight away. The server did very little work and almost no data crossed the network.' }
      ] },

    { kind: 'steps', title: 'The trick for files that do change: fingerprinted names',
      body: 'A year-long `max-age` is great for speed, but how do you ship a new version of `app.js` to people who cached the old one? You change the **name**.',
      steps: [
        { title: 'Build with a hash in the filename', body: 'Your build tool names the file after its contents: `app.3f9a1c.js`. Same contents, same name. Different contents, different name.' },
        { title: 'Cache it for a year', body: 'Serve it with `Cache-Control: public, max-age=31536000, immutable`. `immutable` says "this will never change, so do not even re-check".' },
        { title: 'Keep the HTML on a short leash', body: 'The page that mentions the filename is served with `no-cache` (or a very short `max-age`), so browsers always check for the latest version.' },
        { title: 'Deploy', body: 'The new HTML now points at `app.8d2e7b.js`. Browsers have never seen that name, so they fetch it fresh. The old file is simply never requested again.' }
      ] },

    { kind: 'realworld', title: 'Other copies you did not know you had',
      body: `The browser's HTTP cache is only one of several client-side caches.

        - **Memory cache**: images and scripts reused while a page is open, even faster than disk.
        - **Back and forward**: pressing Back often restores the page as you left it, without refetching.
        - **Service workers**: a script a site installs to run its own cache, which is how many web apps work offline.

        When something looks stale in your own testing, a normal reload may still reuse copies. **Hard reload** (often Ctrl+Shift+R) skips the cache, and the Network tab has a **Disable cache** tickbox for while the developer tools are open.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'A response carries `Cache-Control: max-age=3600`. A user reloads the page ten minutes later. What does the browser do?',
      options: ['Uses its stored copy without contacting the server', 'Asks the server to confirm the copy first', 'Throws the copy away, because ten minutes have passed', 'Sends the request but ignores the reply'],
      answer: 0,
      why: [null, 'That is `no-cache`. Within `max-age` the copy is considered fresh and needs no check.', '3,600 seconds is an hour, so the copy is still fresh at ten minutes.', null],
      explain: '`max-age=3600` means the copy is fresh for an hour. Within that time the browser uses it directly, with no network request at all.' },

    { type: 'match', after: 4, prompt: 'Match each directive to what it does.',
      pairs: [['`max-age=600`', 'Reuse the copy for ten minutes without asking'], ['`no-cache`', 'Keep a copy, but check before every reuse'], ['`no-store`', 'Never keep a copy at all'], ['`private`', 'Only the user’s own browser may keep it'], ['`public`', 'Shared caches such as a CDN may keep it too']] },

    { type: 'tf', after: 6, statement: 'A `304 Not Modified` response includes the full file again, so the browser can double-check it.', answer: false,
      explain: 'A 304 has **no body**. That is the whole point: the browser already has the file, and the server only confirms it is still current.' },

    { type: 'ab', q: 'A build tool produces `app.3f9a1c.js`, a file that only ever changes by getting a new name. Which headers suit it best?',
      a: { lang: 'http', label: 'Long and immutable', src: `
        Cache-Control: public, max-age=31536000, immutable` },
      b: { lang: 'http', label: 'Always revalidate', src: `
        Cache-Control: no-cache` },
      answer: 'a',
      explain: 'The name changes whenever the contents change, so a copy under that name can never go stale. A year of caching costs nothing and saves every repeat download. Revalidating each time would waste a round trip.' },

    { type: 'order', prompt: 'Put a conditional re-check in order.',
      items: ['The browser’s cached copy expires', 'The browser re-requests the file with `If-None-Match` and its ETag', 'The server compares the ETag with the file’s current one', 'The server replies `304 Not Modified` with no body', 'The browser keeps using its stored copy'],
      explain: 'The copy has to expire before a re-check is needed. The browser offers its ETag, the server compares, and when they match it answers with a body-less 304.' },

    { type: 'bucket', prompt: 'Which caching policy suits each response?', buckets: ['Long max-age, fingerprinted', 'no-cache (always re-check)', 'no-store'],
      items: [['`logo.7c2d.svg`, renamed whenever it changes', 0], ['`styles.91ab.css`, built with a hash in its name', 0], ['`index.html`, which links to the latest scripts', 1], ['A news article page, updated through the day', 1], ['A page showing someone’s bank statement', 2], ['A response containing a one-time reset link', 2]],
      explain: 'Files whose name changes with their contents can be cached "forever". Pages that must always reflect the latest should be re-checked cheaply. Sensitive pages should not be stored at all.' },

    { type: 'spot', prompt: 'This response is for a logged-in user’s account page, with their name and address. Tap the line that is a mistake.',
      code: { lang: 'http', src: `
        HTTP/1.1 200 OK
        Content-Type: text/html
        Cache-Control: public, max-age=31536000
        Set-Cookie: session=9f3a…; HttpOnly` },
      lines: [3],
      explain: 'The header lets any shared cache, such as a CDN or a company proxy, keep this personal page for a year, so other people could be served it. It should be `private` at most, and `no-store` is safer for sensitive pages.' },

    { type: 'short', q: 'Which status code means "your cached copy is still current, no body needed"?', accept: ['304', '304 Not Modified'], hint: 'It begins with a 3, as in redirection-ish.',
      explain: '`304 Not Modified`, the reply to a conditional request when the ETag still matches.' },

    { type: 'scenario', title: 'Why do users still see the old logo?', intro: 'You deployed a redesign on Monday. By Tuesday, customers on forums are still posting screenshots of the old header. You open the response headers for `/css/site.css`.',
      meters: { 'user happiness': 40, 'page speed': 70 },
      steps: [
        { text: 'The file is `/css/site.css` with `Cache-Control: max-age=31536000` (one year). Same name as before. What is going on?',
          choices: [
            { label: 'Browsers have a one-year-fresh copy under that name, so they never ask again', score: 2, effects: { 'user happiness': 10 }, feedback: 'Exactly. The browser has been told the file is good for a year, and the name has not changed, so it has no reason to look.' },
            { label: 'The server did not save the new file', score: 0, effects: { 'user happiness': -5 }, feedback: 'The server is fine: a fresh visitor gets the new CSS. Only people with the old copy are affected.' },
            { label: 'The users need a faster connection', score: 0, effects: { 'user happiness': -5 }, feedback: 'The delay is not about speed. The browser is not asking the network at all.' }
          ] },
        { text: 'How do you fix it properly, so this never happens again?',
          choices: [
            { label: 'Fingerprint the filename (`site.4e8a.css`) and have the HTML always re-checked', score: 2, effects: { 'user happiness': 40, 'page speed': 5 }, feedback: 'The right long-term design. Every release produces a new name, so the long max-age is safe and updates are instant.' },
            { label: 'Change max-age to 0 on everything', score: 1, effects: { 'user happiness': 25, 'page speed': -25 }, feedback: 'It works, but you have thrown away the speed benefit for every file, forever, to fix one.' },
            { label: 'Ask every user to hard-reload the page', score: 0, effects: { 'user happiness': -10 }, feedback: 'You cannot reach your users, and it will happen again at the next release.' }
          ] },
        { text: 'Last one. The account page shows addresses and order history. Which header do you set?',
          choices: [
            { label: '`Cache-Control: no-store` (or at least `private`)', score: 2, effects: { 'user happiness': 10 }, feedback: 'Personal pages should not be kept by shared caches, and the most sensitive ones should not be stored at all.' },
            { label: '`Cache-Control: public, max-age=3600`', score: 0, effects: { 'user happiness': -30 }, feedback: 'A shared cache could hand one customer’s address book to another. This kind of leak makes the news.' },
            { label: '`Cache-Control: no-cache`', score: 1, effects: {}, feedback: 'Better, since it forces a check, but the page can still be *stored*. For sensitive data prefer `no-store`.' }
          ] }
      ],
      outro: 'The rule: **cache long where the name changes with the content, re-check where it does not, and never share what is personal.**' },

    { type: 'explain', prompt: 'Explain to a colleague how a browser decides whether to download a file again, using `max-age`, ETag and the 304 response.',
      model: 'While the copy is fresh, as set by max-age, the browser reuses it without asking the server. Once it expires, the browser sends a conditional request with the ETag in If-None-Match. If the file has not changed, the server replies 304 Not Modified with no body, and the browser keeps using its copy. If it has changed, the server sends the new file and a new ETag.',
      keywords: ['max-age', 'fresh', 'expires', 'ETag', 'If-None-Match', '304', 'no body'] }
  ],

  flashcards: [
    { q: 'What does `Cache-Control: max-age=600` mean?', a: 'The response may be reused without asking the server for 600 seconds (ten minutes).' },
    { q: '`no-cache` vs `no-store`?', a: '`no-cache` allows storing but demands a check before every reuse. `no-store` means do not keep a copy at all.' },
    { q: 'What is an ETag and what is it used for?', a: 'A label for a specific version of a resource. The browser sends it back in If-None-Match so the server can say whether it is still current.' },
    { q: 'What does `304 Not Modified` mean?', a: 'The browser’s cached copy is still current, so the server sends no body and the browser reuses it.' },
    { q: 'How do you ship updates when files are cached for a year?', a: 'Put a hash of the contents in the filename (`app.3f9a1c.js`). New contents mean a new name, so browsers fetch it fresh.' }
  ],

  glossary: [
    { term: 'Cache-Control', def: 'An HTTP header with instructions to caches: how long to keep a response, who may keep it and when to re-check.', like: 'The care label on a response: "keep 10 minutes, do not share".' },
    { term: 'ETag', def: 'A label, often a hash, that identifies one version of a resource. Sent with a response and echoed back to check if it has changed.', like: 'The edition number printed on a book.', aka: ['entity tag'] },
    { term: 'Conditional request', def: 'A request that says "only send the body if it differs from the version I have", usually using If-None-Match with an ETag.', like: '"Is edition 7 still the latest? Only send it if not."' },
    { term: 'Revalidation', def: 'Checking with the server whether a stored copy is still current, instead of downloading it again.', like: 'Asking the librarian if your edition is up to date.' },
    { term: 'Cache busting', def: 'Changing a file’s name (or URL) whenever its contents change so that caches treat it as new.', like: 'Reprinting a book under a new title so nobody reads the old one.' }
  ],

  takeaways: [
    '`max-age` lets a browser reuse a copy with **no request at all**; `no-cache` means "re-check first", `no-store` means "never keep".',
    'An **ETag** plus `If-None-Match` turns an expensive download into a tiny **304 Not Modified**.',
    'Fingerprint filenames (`app.3f9a1c.js`), cache them for a year, and keep the HTML on a short leash.',
    'Personal pages must be `private` or `no-store`, never `public`.'
  ],

  links: [
    { label: 'MDN: HTTP caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching' },
    { label: 'MDN: Cache-Control', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ca-cdn', {
  eli5: 'A CDN keeps copies of your website in many cities around the world, so each visitor is served from a machine near them instead of one faraway computer.',

  cards: [
    { kind: 'concept', title: 'Your server is a long way from your customer',
      body: `Your site runs on a server in Virginia, on the east coast of the USA. A customer in Sydney taps a link.

        Data travels through cables at a good fraction of the speed of light, which is fast, but the Earth is big. A single round trip between the two can easily cost **a couple of hundred milliseconds**. And a page load needs several round trips before the first byte of content: finding the address, opening a connection, setting up encryption, then asking.

        You cannot speed up light. What you *can* do is stop making the trip. If the files were already **in Sydney**, the customer would never need to wait for Virginia.` },

    { kind: 'metaphor', title: 'The warehouse and the corner shops',
      body: `A company makes a popular snack in one huge factory. Shipping every packet from the factory to each customer's door would be slow and wildly expensive.

        So it stocks **corner shops** in every town. Customers walk to the nearest one. When a shop runs out, it orders more from the factory, and from then on that town has stock.

        - The **factory** is your **origin** server.
        - The **corner shops** are the CDN's **edge** servers.
        - **Running out** is a cache miss. A well-stocked shelf is a hit.

        Where the metaphor stops: the shop does not need you to pay for anything first. It only stocks what people actually ask for.` },

    { kind: 'diagram', title: 'A CDN in one picture',
      body: 'A **CDN** (content delivery network) is a worldwide set of cache servers. Users talk to the nearest **edge**, and only the edge ever contacts the origin.',
      nodes: [
        { id: 'u1', label: 'Visitor in London', icon: '🧑', x: 0, y: 0 },
        { id: 'u2', label: 'Visitor in Sydney', icon: '🧑', x: 1, y: 0 },
        { id: 'u3', label: 'Visitor in New York', icon: '🧑', x: 2, y: 0 },
        { id: 'e1', label: 'Edge: London', icon: '📍', x: 0, y: 1, tone: 'accent' },
        { id: 'e2', label: 'Edge: Sydney', icon: '📍', x: 1, y: 1, tone: 'accent' },
        { id: 'e3', label: 'Edge: New York', icon: '📍', x: 2, y: 1, tone: 'accent' },
        { id: 'o', label: 'Origin server', icon: '🏭', x: 1, y: 3, tone: 'warn' }
      ],
      edges: [
        { from: 'u1', to: 'e1' }, { from: 'u2', to: 'e2' }, { from: 'u3', to: 'e3' },
        { from: 'e1', to: 'o', label: 'only on a miss', dashed: true },
        { from: 'e2', to: 'o', dashed: true },
        { from: 'e3', to: 'o', dashed: true }
      ],
      caption: 'Solid lines are the short trips. Dashed lines are the long ones, and a good CDN makes them rare.' },

    { kind: 'sequence', title: 'First visitor misses, everyone after hits',
      body: 'The edge starts empty. See how it fills itself.',
      actors: ['Visitor', 'Edge', 'Origin'],
      steps: [
        { from: 0, to: 1, label: 'GET /hero.jpg', note: 'The first visitor in Sydney asks the **Sydney edge**, not your server.' },
        { from: 1, to: 2, label: 'GET /hero.jpg', note: 'The edge has no copy, so this is a **miss**. It makes the long trip to the origin on the visitor’s behalf.' },
        { from: 2, to: 1, label: '200 + image + Cache-Control', dashed: true, note: 'The origin replies, and its `Cache-Control` header tells the edge how long it may keep the copy.' },
        { from: 1, to: 0, label: '200 + image', dashed: true, note: 'The edge passes it on, **and keeps a copy**. This visitor waited a little longer than usual.' },
        { from: 0, to: 1, label: 'GET /hero.jpg (a second visitor)', note: 'The next visitor in Sydney asks the same edge.' },
        { from: 1, to: 0, label: '200 + image (from the edge)', dashed: true, note: 'A **hit**: answered locally, fast, and the origin never knew.' }
      ] },

    { kind: 'compare', title: 'What belongs on a CDN?',
      body: 'The CDN uses the same `Cache-Control` rules you met in the last lesson. The question is what is safe to share.',
      cols: ['Great on a CDN', 'Be careful'],
      rows: [
        ['Files', 'Images, fonts, scripts, stylesheets, videos, downloads', 'Files that contain private or per-user data'],
        ['Pages', 'Public pages that look the same for everyone', 'Logged-in pages, baskets, account screens'],
        ['API replies', 'Public, read-only data such as a product list', 'Anything that depends on who is asking'],
        ['Changes', 'Content that changes rarely, or has a fingerprinted name', 'Content that must be exact to the second']
      ] },

    { kind: 'concept', title: 'Purging: telling every shop to bin the old stock',
      body: `The last lesson said a fresh copy lasts until its \`max-age\` runs out. But what if you spot a typo in the CEO's name on the home page and cannot wait?

        CDNs let you **purge** (also called **invalidate**) a file: you send the CDN a request such as "forget \`/about.html\`", and it throws away its copies. The next visitor causes a miss and fetches the fixed version. Many CDNs can also purge by a group, such as a path prefix or a tag.

        Two things to know. Purging a worldwide network is fast but not instant. And the **best** cure is not needing to purge at all: fingerprinted filenames and short TTLs on things that change.` },

    { kind: 'concept', title: 'The CDN as a shield',
      body: `A CDN is a speed trick, but it is also a **bodyguard** for your origin.

        - **Traffic spikes**: a video goes viral, and ten million requests hit the edges. Only a tiny share of misses reach your origin.
        - **Attacks**: floods of junk requests are soaked up by a huge, spread-out network rather than your one small server. CDNs commonly filter malicious traffic at the edge too.
        - **Hiding the origin**: visitors only ever see the CDN's addresses, so attackers have a harder time aiming at your real server.

        Many CDNs also offer an **origin shield**: a middle layer so that, when many edges miss at once, they ask the shield rather than all asking your origin.` },

    { kind: 'pitfall', title: 'The page that showed Anna’s name to Ben',
      body: `A team switches on "cache everything" at the CDN to make the site faster. It works beautifully, until a customer logs in and sees **someone else's name and basket**.

        What happened: a logged-in page was cached as if it were public. Anna's version was stored at the edge, and the CDN handed that copy to Ben.

        The defences are the headers from the last lesson: \`private\` or \`no-store\` on anything personal, and a CDN set to **respect the origin's headers**. Check that a logged-in page is *never* marked \`public\`.`,
      note: 'Cache things that are the same for everyone. Personalised content either skips the CDN or is fetched separately after the page loads.' },

    { kind: 'realworld', title: 'You use a CDN every day',
      body: `Cloudflare, Akamai, Fastly and Amazon CloudFront are well-known CDNs. Most big sites, news, shops, video and software downloads put one in front of their origin, often without you ever noticing.

        Streaming video is a classic case: the same film is watched by millions, so it is stored at the edge close to each viewer rather than sent from one place every time.

        In the lab that follows, you will send visitors from around the world to the origin and then to the nearest edge, and watch the first request miss and the rest fly.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Why does a visitor in Sydney get a page faster from a Sydney edge than from an origin in Virginia?',
      options: ['The data travels a much shorter distance, so each round trip is far quicker', 'The edge server’s processor is faster than the origin’s', 'The edge compresses the data more than the origin can', 'The edge skips encryption, so less work is needed'],
      answer: 0,
      why: [null, 'The edge is not magic hardware. The win is mostly distance.', 'Compression can help, but it is not the main reason a nearby copy is quicker.', 'Traffic through a CDN is normally still encrypted.'],
      explain: 'Latency is largely about distance: each round trip to a faraway server costs time before any data flows. A nearby copy turns many long trips into short ones.' },

    { type: 'order', after: 3, prompt: 'Put the first two requests for a file, through a CDN, in order.',
      items: ['A visitor asks the nearest edge for the file', 'The edge has no copy (a miss) and asks the origin', 'The origin replies and the edge stores a copy', 'The edge returns the file to the visitor', 'The next visitor asks the edge and gets the copy immediately'],
      explain: 'The edge fills itself on demand: a miss triggers one trip to the origin, then every later visitor in that region is served locally.' },

    { type: 'tf', after: 6, statement: 'If a CDN shields your origin, a flood of requests for the same popular image mostly never reaches your server.', answer: true,
      explain: 'Once the edges hold the image, they answer the flood themselves. Only the occasional miss, such as after a purge or when a copy expires, reaches the origin.' },

    { type: 'match', prompt: 'Match each CDN term to its meaning.',
      pairs: [['Origin', 'Your own server, the source of truth'], ['Edge', 'A CDN server near the visitors'], ['Purge', 'Tell the CDN to discard its copy of a file'], ['Cache miss at the edge', 'The edge fetches the file from the origin'], ['Origin shield', 'A middle layer that protects the origin from many simultaneous misses']] },

    { type: 'bucket', prompt: 'Should this be served from a CDN?', buckets: ['Fine on a CDN', 'Keep off the CDN (or private)'],
      items: [['A logo image used on every page', 0], ['A downloadable PDF brochure', 0], ['Your public marketing home page', 0], ['A fingerprinted `app.4c1e.js`', 0], ['A "my orders" page with names and addresses', 1], ['A response to `GET /me` that returns the current user’s profile', 1], ['A checkout page showing today’s live basket total', 1]],
      explain: 'Anything identical for everybody is safe to share. Anything that depends on **who is asking** must not be stored in a shared cache, or one person can be served another’s data.' },

    { type: 'estimate', q: 'A site serves 10 million image requests in a day and the CDN edges answer 98% of them. Roughly how many reach the origin?',
      answer: 200000, unit: 'requests per day', min: 1000, max: 10000000, tolerance: 1.5,
      explain: 'The 2% that miss is 0.02 × 10,000,000 = **200,000**. Spread across a day (about 86,400 seconds) that is only two or three requests per second, easy for one origin, compared with around 115 per second without the CDN.' },

    { type: 'cloze', text: 'When an edge does not have a file, it asks the {{origin}}. To remove a wrong copy straight away, you {{purge}} it. The best long-term fix is a filename that changes whenever the {{contents}} change.',
      distractors: ['browser', 'delete', 'domain'],
      explain: 'Misses go to the origin. A purge forces edges to forget. Fingerprinted names avoid needing purges, because new contents mean a new URL.' },

    { type: 'scenario', title: 'Launch day at the edge', intro: 'You are the backend lead at a ticket site. Tonight at 8pm a famous band’s tour goes on sale. Last time the single origin server fell over within a minute.',
      meters: { 'site up': 60, 'ticket accuracy': 70 },
      steps: [
        { text: 'The tour page has the band’s photos, a styled layout and a list of dates. How do you prepare?',
          choices: [
            { label: 'Put the CDN in front, and cache the images, scripts and the public dates page', score: 2, effects: { 'site up': 25 }, feedback: 'The heavy, shared content now comes from the edge. Your origin sees a trickle of misses instead of a stampede.' },
            { label: 'Buy a much bigger origin and skip the CDN', score: 1, effects: { 'site up': 10 }, feedback: 'More power helps, but you pay for it all year, and users far away are still slow. The shared content never needed to reach it.' },
            { label: 'Cache everything, including seat availability, for an hour', score: 0, effects: { 'site up': 15, 'ticket accuracy': -40 }, feedback: 'The site stays up, but customers are shown seats that sold out long ago, and the complaints will be loud.' }
          ] },
        { text: 'At 7:50pm someone notices a typo in the venue name on the tour page. It is already cached at the edges for an hour. What now?',
          choices: [
            { label: 'Fix the page, then purge that page’s URL at the CDN', score: 2, effects: { 'ticket accuracy': 15 }, feedback: 'Exactly what a purge is for. The edges drop their copy and the next visitor pulls the corrected page.' },
            { label: 'Wait an hour for the copies to expire', score: 0, effects: { 'ticket accuracy': -10 }, feedback: 'The sale starts in ten minutes. The typo would be seen by the biggest audience you will ever have.' },
            { label: 'Purge the entire cache, every file, to be safe', score: 1, effects: { 'site up': -20 }, feedback: 'It fixes the typo but also empties every edge right before the rush, sending a wall of misses to the origin.' }
          ] },
        { text: 'Seat availability must be accurate. How should that data be served?',
          choices: [
            { label: 'Skip the CDN cache for it, or give it a very short TTL', score: 2, effects: { 'ticket accuracy': 20, 'site up': 5 }, feedback: 'Live, exact data stays close to the source of truth. A TTL of a second or two can still absorb heavy bursts if brief staleness is acceptable.' },
            { label: 'Cache it for ten minutes like the images', score: 0, effects: { 'ticket accuracy': -35 }, feedback: 'Availability changes by the second during a sale. Ten-minute-old seats means double bookings.' },
            { label: 'Put the logged-in seat map on the CDN as public', score: 0, effects: { 'ticket accuracy': -30 }, feedback: 'Personal selections would be shared between strangers. Never mark per-user data as public.' }
          ] }
      ],
      outro: 'The pattern: **put the shared, heavy stuff at the edge, purge when you must, and keep exact or personal data close to the source.**' },

    { type: 'explain', prompt: 'A colleague asks what a CDN actually does and whether it is worth it for a small site with visitors worldwide. Explain it in your own words.',
      model: 'A CDN keeps copies of your files on edge servers around the world. Visitors are served by the nearest edge, which is faster because the distance is shorter. On a miss, the edge fetches from the origin and keeps a copy, so later visitors get it quickly and the origin does less work. It can also soak up traffic spikes and attacks. The caveat is that personal or fast-changing data must not be cached carelessly.',
      keywords: ['edge', 'origin', 'nearest', 'miss', 'copy', 'purge', 'shield', 'distance'] }
  ],

  flashcards: [
    { q: 'What is a CDN?', a: 'A content delivery network: edge servers around the world that keep copies of your content and serve visitors from the nearest one.' },
    { q: 'What are the origin and the edge?', a: 'The origin is your own server, the source of truth. Edges are the CDN’s nearby cache servers that talk to visitors.' },
    { q: 'What happens on a CDN cache miss?', a: 'The edge fetches the file from the origin, passes it to the visitor and keeps a copy for later visitors.' },
    { q: 'What is a purge?', a: 'A request telling the CDN to discard its stored copies of a file so the next request fetches a fresh one.' },
    { q: 'Name two ways a CDN protects the origin.', a: 'It answers most requests itself, absorbing spikes, and it soaks up and filters attack traffic before it reaches the origin.' }
  ],

  glossary: [
    { term: 'CDN', def: 'Content delivery network: a worldwide set of servers that cache your content close to users.', like: 'Corner shops stocking a factory’s snacks in every town.', aka: ['content delivery network'] },
    { term: 'Edge server', def: 'A CDN server located near visitors. It answers requests from its cache when it can.', like: 'The corner shop nearest your house.', aka: ['edge', 'point of presence'] },
    { term: 'Origin', def: 'Your own server (or storage) that holds the real content and is the source of truth for the CDN.', like: 'The factory behind the shops.' },
    { term: 'Purge', def: 'Telling a CDN to discard its stored copy of a file or group of files before they expire.', like: 'Telling every shop to bin the old stock.', aka: ['invalidation'] },
    { term: 'Origin shield', def: 'An extra cache layer between the edges and the origin, so many edge misses become one request to the origin.', like: 'A regional depot between the shops and the factory.' }
  ],

  takeaways: [
    'A **CDN** serves copies from an **edge** near the visitor, because distance costs time.',
    'The first request to an edge **misses** and goes to the **origin**; later ones hit.',
    'Cache what is the same for everyone; keep personal or exact data off shared caches.',
    '**Purge** when you must, but prefer fingerprinted names. A CDN also shields the origin from spikes.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ca-server', {
  eli5: 'Between your app and your database you can put a super-fast memory store that remembers recent answers, so most requests never have to bother the database.',

  cards: [
    { kind: 'concept', title: 'Browsers cache for one person. Who caches for everyone?',
      body: `The caches in the last two lessons live in browsers and edges. But some answers cannot be handed out in a header: the result of a database query that powers a dashboard, a logged-in user's session, a page your code spent 300 ms assembling.

        If ten thousand people ask for the same thing, you still run it ten thousand times, unless your **servers** keep a shared notepad.

        That is **server-side caching**: a very fast store, usually held entirely in **memory**, sitting between your application and your database. The app asks the notepad first, and only bothers the database when the notepad is blank.` },

    { kind: 'metaphor', title: 'The whiteboard outside the archive',
      body: `A company keeps its records in a vast basement archive. Fetching a file takes a clerk twenty minutes.

        Beside the lift is a **whiteboard**. Whenever someone fetches something that others keep asking about ("Q3 sales total: £1.2m"), they write the answer on the board. The next person glances at the board first, and mostly never goes downstairs.

        - The **archive** is the database: complete, slow, trusted.
        - The **whiteboard** is the cache: tiny, instant, and it gets rubbed out regularly.

        Where it stops being true: a whiteboard is a copy, and if someone updates the archive, the board is wrong until somebody fixes it.` },

    { kind: 'diagram', title: 'Where the cache sits',
      body: 'Several app servers all share one cache. Reads go to the cache first; the database is the fallback.',
      nodes: [
        { id: 'a1', label: 'App server 1', icon: '🖥️', x: 0, y: 0 },
        { id: 'a2', label: 'App server 2', icon: '🖥️', x: 1, y: 0 },
        { id: 'a3', label: 'App server 3', icon: '🖥️', x: 2, y: 0 },
        { id: 'c', label: 'Shared cache (Redis)', icon: '⚡', x: 1, y: 2, tone: 'accent' },
        { id: 'd', label: 'Database', icon: '🗄️', x: 1, y: 4, tone: 'warn' }
      ],
      edges: [
        { from: 'a1', to: 'c', label: 'ask first' }, { from: 'a2', to: 'c' }, { from: 'a3', to: 'c' },
        { from: 'c', to: 'd', label: 'only on a miss', dashed: true }
      ],
      caption: 'All three servers see the same cached answers. Fetch it once and every server benefits.' },

    { kind: 'compare', title: 'Redis vs Memcached',
      body: 'The two best-known in-memory stores. Both keep data in RAM and are very fast. Many teams pick Redis by default today, though experts will tell you Memcached is still a fine choice for the simplest jobs.',
      cols: ['Redis', 'Memcached'],
      rows: [
        ['Data', 'Strings, lists, hashes, sets, sorted sets and more', 'Simple key-to-value, mostly strings and blobs'],
        ['Survives a restart?', 'Optionally: can save to disk', 'No: memory only'],
        ['Scaling and copies', 'Built-in replication and clustering', 'Spread across servers by the client'],
        ['Extras', 'Atomic counters, expiry, pub/sub, queues', 'Deliberately minimal and simple'],
        ['Best for', 'Caches that need more than plain values; also sessions and counters', 'A plain, no-frills cache']
      ] },

    { kind: 'code', title: 'Using a cache from the command line',
      body: 'Redis is driven by short commands. Each value lives under a **key**. **Tap the lines.**',
      code: { lang: 'sh', src: `
        SET user:42:name "Asha" EX 60
        GET user:42:name
        TTL user:42:name
        INCR visits:home
        DEL user:42:name`,
        notes: {
          1: '`SET` stores a value under a key. `EX 60` is the **TTL**: the entry vanishes after 60 seconds, on its own.',
          2: '`GET` fetches it. If the key is missing or has expired, you get "nothing", and that is your **cache miss**.',
          3: '`TTL` shows how many seconds are left before the key disappears.',
          4: '`INCR` adds one to a number, atomically: even if a thousand servers do it at once, no count is lost. Handy for counters and rate limits.',
          5: '`DEL` removes a key straight away. This is a simple form of **invalidation**: you changed the data, so you forget the copy.'
        } } },

    { kind: 'concept', title: 'What to put in it',
      body: `Four jobs account for most server-side caches:

        - **Query results**: the output of an expensive or very frequent database query.
        - **Sessions**: who is logged in. A fast shared store means any app server can recognise any user.
        - **Computed pages or fragments**: HTML or JSON your code took real effort to assemble, such as a homepage built from five queries.
        - **Counters and short-lived tokens**: page views, rate-limit counts, one-time codes with a built-in expiry.

        Notice what is missing: data that is the **only** copy. A cache can be wiped or run out of room, so anything in it must be rebuildable from somewhere else.` },

    { kind: 'code', title: 'The key must hold every ingredient',
      body: 'A **cache key** names an entry. It must include everything that makes the answer different, or people get each other’s answers. **Tap the lines.**',
      code: { lang: 'js', src: `
        // Good: language and page number are part of the key
        const key = 'products:list:' + lang + ':page' + page;

        // Bad: one key for every language and page
        const bad = 'products:list';`,
        notes: {
          2: 'The key names the **thing** (`products:list`), then each **variable** that changes the answer: the language and the page number. Different inputs, different entries.',
          5: 'With this key, the English first page is stored, and then served to the French reader and to page 7. A classic bug that looks like the site is haunted.'
        } } },

    { kind: 'compare', title: 'Local vs distributed caches',
      body: 'A cache can live **inside** your app process (a map in memory) or in a separate shared server like Redis.',
      cols: ['Local (in the app)', 'Distributed (Redis)'],
      rows: [
        ['Speed', 'Fastest: just reading memory, no network', 'A network hop away, but still very quick'],
        ['Copies', 'Each server has its own copy', 'One shared copy for all servers'],
        ['Consistency', 'Servers can disagree for a while', 'Everyone sees the same value'],
        ['Memory', 'Duplicated on every server', 'Held once, and can be much larger'],
        ['Survives an app restart?', 'No: it vanishes with the process', 'Yes: the cache is a separate server'],
        ['Extra to run', 'Nothing', 'A cache server to operate and monitor']
      ] },

    { kind: 'pitfall', title: 'Do not treat the cache as your database',
      body: `Redis is wonderfully fast and so tempting. But a cache is **meant to forget**: it evicts old items when full, entries expire, and a restart can wipe it.

        If your only copy of an order lives in the cache, one restart loses it.

        The safe rule: **the database is the source of truth, the cache is an optimisation**. Your app should still work, more slowly, if the cache is empty or briefly down. Redis can be configured to persist data and used as a real store, but that is a different design decision, not a cache.` },

    { kind: 'realworld', title: 'How teams really use it',
      body: `Almost every large web product keeps a layer like this. Typical uses: storing login sessions, caching the results of the heaviest queries, counting requests for rate limits, and holding the "top 10" lists a home page shows to everyone.

        A useful first sign that you need one: your database CPU is busy, and when you look, a handful of queries are running again and again with identical answers.

        Whichever you choose, you will meet the next lesson's question straight away: **who writes to the cache, and when?**` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Three app servers share one Redis cache. Server 1 reads a product from the database and stores it. What happens when server 3 needs the same product?',
      options: ['It finds the copy in the shared cache and skips the database', 'It must read the database, because each server has its own cache', 'It asks server 1 to send its private copy', 'The cache refuses, since only the writer may read it'],
      answer: 0,
      why: [null, 'That describes a **local** cache. A shared cache is shared by every server.', 'Servers do not talk to each other; they all talk to the cache.', 'A shared cache has no per-writer ownership.'],
      explain: 'A distributed cache is one shared notepad. Whoever stores an answer saves everyone else the trip to the database.' },

    { type: 'tf', after: 4, statement: 'Memcached keeps its data only in memory, so restarting the server empties the cache.', answer: true,
      explain: 'True: Memcached is memory only: a restart clears it. Redis *can* be configured to save data to disk, but a cache should be rebuildable either way.' },

    { type: 'match', prompt: 'Match each need to the best server-side cache use.',
      pairs: [['Know who is logged in on any server', 'Store sessions in a shared cache'], ['A 2-second report that 800 people run', 'Cache the query result'], ['Count each user’s requests per minute', 'An atomic counter with an expiry'], ['A homepage built from five queries', 'Cache the finished page or fragment']] },

    { type: 'bucket', prompt: 'Which kind of cache is each statement describing?', buckets: ['Local (in the app)', 'Distributed (Redis)'],
      items: [['Reading it needs no network trip at all', 0], ['Every app server sees the same value', 1], ['Two servers may hold different copies of the same answer', 0], ['It survives when you restart an app server', 1], ['Memory is duplicated on every server', 0], ['It is one more server you must run and watch', 1]],
      explain: 'Local caches are the fastest and simplest but each server drifts on its own. Distributed caches cost a network hop and extra infrastructure, in exchange for one shared view.' },

    { type: 'ab', q: 'A site is shown in several languages. Which cache key is safer for a product list?',
      a: { lang: 'js', label: 'Key without the language', src: `
        const key = 'products:list';` },
      b: { lang: 'js', label: 'Key with the language', src: `
        const key = 'products:list:' + lang;` },
      answer: 'b',
      explain: 'The cached answer differs by language, so the language belongs in the key. Without it, the first visitor’s language is served to everybody until the entry expires.' },

    { type: 'spot', prompt: 'These prices depend on the visitor’s currency. Tap the line that will cause wrong prices to be shown.',
      code: { lang: 'js', src: `
        async function getPrice(productId, currency) {
          const key = 'price:' + productId;
          const hit = await cache.get(key);
          if (hit) return hit;
          const price = await db.priceFor(productId, currency);
          await cache.set(key, price, 300);
          return price;
        }` },
      lines: [2],
      explain: 'The key ignores `currency`, so the first visitor’s currency is stored under `price:42` and handed to everyone for five minutes. The key needs every input that changes the answer, such as `price:42:GBP`.' },

    { type: 'short', q: 'In a cache, what is the name for the label an entry is stored and looked up under, such as `user:42:name`?', accept: ['key', 'cache key', 'the key', 'keys'], hint: 'It is the thing you pass to GET.',
      explain: 'The **key**. Good keys name the thing and include every variable that changes the answer.' },

    { type: 'scenario', title: 'Three servers, three different answers', intro: 'Your shop runs on three app servers. To save time, the previous developer cached the product list in each app’s own memory (a local cache) for ten minutes. Support emails: "Prices on the site keep changing when I refresh."',
      meters: { 'consistency': 40, 'database load': 60 },
      steps: [
        { text: 'Why are users seeing different prices on refresh?',
          choices: [
            { label: 'Each server caches its own copy at a different time, and refreshes hop between servers', score: 2, effects: { 'consistency': 10 }, feedback: 'Exactly. A price change reaches each server’s copy at a different moment, so a reload may land on a fresher or older server.' },
            { label: 'The database is storing prices inconsistently', score: 0, effects: {}, feedback: 'The database is a single source of truth. The disagreement happens in the copies in front of it.' },
            { label: 'The browser is randomly changing the price', score: 0, effects: {}, feedback: 'Browsers do not make up prices. The servers are returning different data.' }
          ] },
        { text: 'You want all servers to agree. What is the cleanest change?',
          choices: [
            { label: 'Move the cached product list into a shared Redis cache', score: 2, effects: { 'consistency': 35, 'database load': -5 }, feedback: 'One shared copy means everybody agrees, and you also store it once rather than three times.' },
            { label: 'Turn the caching off completely', score: 1, effects: { 'consistency': 30, 'database load': 25 }, feedback: 'Consistent, but the database now takes every request and will struggle at busy times.' },
            { label: 'Shorten the local TTL to 1 second', score: 1, effects: { 'consistency': 10, 'database load': 10 }, feedback: 'Disagreements shrink but never vanish, and the database load rises as the hit rate drops.' }
          ] },
        { text: 'You will use Redis. A teammate wants to store the only copy of customers’ unpaid baskets there, because it is fast. Your view?',
          choices: [
            { label: 'Keep the baskets in the database; use Redis only for rebuildable copies', score: 2, effects: { 'consistency': 15 }, feedback: 'The database is the source of truth. A cache can be emptied or restarted, and a lost basket is a lost sale.' },
            { label: 'Fine: Redis never loses anything', score: 0, effects: { 'consistency': -20 }, feedback: 'A cache evicts entries when full and can lose memory on restart. Unless it is deliberately set up as a durable store, it is not safe for the only copy.' },
            { label: 'Store them in a local cache instead, as it is faster', score: 0, effects: { 'consistency': -25 }, feedback: 'Even worse: a local cache dies with the process and each server sees different baskets.' }
          ] }
      ],
      outro: 'The pattern: **share the cache between servers, keep the database as the source of truth, and never let the cache hold the only copy.**' },

    { type: 'explain', prompt: 'Your tech lead asks: "Why add Redis between the app and the database, and what should and should not go in it?" Answer in your own words.',
      model: 'Redis keeps answers in memory so the app can read them far faster than querying the database, and many app servers share one copy. It suits expensive query results, sessions, assembled pages and counters. The cache key must contain everything that changes the answer. It should never hold the only copy of important data, because a cache can expire entries, evict them or lose them on restart; the database stays the source of truth.',
      keywords: ['memory', 'shared', 'database', 'key', 'sessions', 'source of truth', 'expire', 'evict'] }
  ],

  flashcards: [
    { q: 'Where does a server-side cache sit, and why?', a: 'Between the application and the database, in fast memory, so repeated reads are answered without querying the database.' },
    { q: 'Redis vs Memcached in one line each?', a: 'Redis: rich data types, optional persistence, replication, many extras. Memcached: simple, memory-only key-value cache.' },
    { q: 'What are four common things to cache on the server?', a: 'Query results, sessions, computed pages or fragments, and counters or short-lived tokens.' },
    { q: 'What must a good cache key contain?', a: 'The name of the thing plus every variable that changes the answer, such as language, page or currency.' },
    { q: 'Local vs distributed cache?', a: 'Local lives in each app’s memory: fastest, but copies drift apart. Distributed is one shared store: consistent, but a network hop and one more server.' }
  ],

  glossary: [
    { term: 'Redis', def: 'A very fast in-memory data store with rich data types, expiry times and optional saving to disk. Often used as a cache, session store and counter.', like: 'A shared whiteboard that can also keep lists and tallies.' },
    { term: 'Memcached', def: 'A simple, memory-only key-value cache that is deliberately minimal and fast.', like: 'A plain notepad: write a value under a name, read it back, nothing else.' },
    { term: 'Cache key', def: 'The name under which a cached value is stored and looked up. It should include everything that changes the answer.', like: 'The label on a filing-cabinet drawer.' },
    { term: 'Local cache', def: 'A cache held in the memory of a single application process, not shared with other servers.', like: 'A private notepad on your own desk.', aka: ['in-process cache'] },
    { term: 'Distributed cache', def: 'A cache run as a separate shared service that many application servers read and write.', like: 'The shared whiteboard outside the archive.' }
  ],

  takeaways: [
    'A server-side cache is **fast memory between your app and your database**, shared by all servers.',
    'Redis is the feature-rich default; Memcached is the simple, memory-only option.',
    'Put the **whole recipe** in the key, or one visitor’s answer will be shown to another.',
    'The cache must be **rebuildable**: the database stays the source of truth.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ca-strategies', {
  eli5: 'There are five common ways to arrange who fills the cache and who updates the database, and each one trades speed, freshness and safety differently.',

  cards: [
    { kind: 'concept', title: 'Who does the fetching, and who does the writing?',
      body: `You have a cache and a database. Two awkward questions follow.

        **On a read:** when the cache has no answer, *who* goes to the database to fetch it, your app or the cache itself?

        **On a write:** when data changes, do you update the database, the cache, or both? In which order? And do you wait for both before telling the user it worked?

        Different answers give different **caching strategies**. None is "the best". Each is a trade between speed, freshness and the risk of losing data. There are five worth knowing by name, three that handle **reads** well and two that focus on **writes**.` },

    { kind: 'metaphor', title: 'A café, a counter fridge and a stockroom',
      body: `A café has a small **counter fridge** (the cache) and a big **stockroom** (the database).

        - The barista can check the fridge, and if the oat milk is missing, nip to the stockroom, grab it and **stock the fridge herself**.
        - Or a runner could handle it all: the barista just says "oat milk" and the runner deals with fridge and stockroom.
        - When a delivery arrives, staff could update the **fridge and the stockroom ledger together**, or write on the fridge now and **update the ledger later**.

        Each arrangement is one of the strategies. The question is always who does which job, and how much you trust the fridge to stay correct.` },

    { kind: 'sequence', title: '1. Cache-aside (lazy loading)',
      body: 'The most common pattern by far. **The app is in charge.** It checks the cache, and on a miss, fills it itself.',
      actors: ['App', 'Cache', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'get product:42', note: 'The app asks the cache first.' },
        { from: 1, to: 0, label: 'miss', dashed: true, note: 'Nothing stored yet.' },
        { from: 0, to: 2, label: 'read product 42', note: 'The **app** goes to the database itself.' },
        { from: 2, to: 0, label: 'the row', dashed: true, note: 'The database replies.' },
        { from: 0, to: 1, label: 'set product:42', note: 'The **app** saves it in the cache, ready for the next reader.' },
        { note: 'On a write, the app updates the database and then **deletes** the cache entry, so the next read refills it with fresh data. Simple, flexible, and only caches what is actually asked for.' }
      ] },

    { kind: 'code', title: 'Cache-aside in a dozen lines',
      body: 'This is the shape you will write, again and again. **Tap the lines.**',
      code: { lang: 'js', src: `
        async function getProduct(id) {
          const key = 'product:' + id;
          const cached = await cache.get(key);
          if (cached) return cached;               // hit

          const product = await db.findProduct(id); // miss: slow path
          await cache.set(key, product, 300);       // keep for 5 min
          return product;
        }

        async function updateProduct(id, data) {
          await db.saveProduct(id, data);
          await cache.del('product:' + id);        // forget the old copy
        }`,
        notes: {
          3: 'Always look in the cache **first**.',
          4: 'A hit ends here. The database is never touched.',
          6: 'On a miss, the app does the slow work itself.',
          7: 'Then it **stores the result** with a TTL as a safety net.',
          12: 'On a write: update the **database first** (the source of truth), then delete the cached copy. The next read repopulates it.'
        } } },

    { kind: 'sequence', title: '2. Read-through',
      body: 'Like cache-aside, but the **cache itself** knows how to load missing data. The app only ever talks to the cache.',
      actors: ['App', 'Cache', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'get product:42', note: 'The app asks the cache and nothing else.' },
        { at: 1, label: 'miss: loads it itself', note: 'The cache layer has been given a **loader**: code that knows how to fetch product 42 from the database.' },
        { from: 1, to: 2, label: 'read product 42', note: 'The **cache** calls the database, not the app.' },
        { from: 2, to: 1, label: 'the row', dashed: true, note: 'The database replies to the cache.' },
        { from: 1, to: 0, label: 'here it is (now stored)', dashed: true, note: 'The cache stores it and returns it. The app never saw a miss.' },
        { note: 'The app’s code is simpler, and the loading logic lives in one place. The cost: you need a cache layer or library that supports it, and the cache must understand your data.' }
      ] },

    { kind: 'sequence', title: '3. Write-through',
      body: 'On a write, update **both** the cache and the database together, before saying "done".',
      actors: ['App', 'Cache', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'save product:42 = new price', note: 'The app writes through the cache.' },
        { from: 1, to: 2, label: 'write to database', note: 'The cache **immediately** passes the write to the database.' },
        { from: 2, to: 1, label: 'saved', dashed: true, note: 'The database confirms the write is safely stored.' },
        { from: 1, to: 0, label: 'done', dashed: true, note: 'Only now does the app hear "done". The cache and database always agree.' },
        { note: '**Good:** reads are always fresh and nothing can be lost. **Cost:** every write is as slow as the database, and you may cache data nobody reads.' }
      ] },

    { kind: 'sequence', title: '4. Write-behind (write-back)',
      body: 'Write to the cache, say "done" straight away, and update the database **later**, in the background.',
      actors: ['App', 'Cache', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'save page views = 1,204', note: 'The app writes to the cache.' },
        { from: 1, to: 0, label: 'done (instantly)', dashed: true, note: 'The cache replies at once. The user is not kept waiting for the database.' },
        { note: 'More writes arrive over the next few seconds. The cache collects them.' },
        { from: 1, to: 2, label: 'batch update, later', note: 'After a short delay, the cache **flushes** the latest values to the database in one go.' },
        { note: '**Good:** very fast writes, and batching many changes into one is kind to the database. **Risk:** if the cache dies before the flush, those writes are **gone**. Use it only for data you can afford to lose a little of, like counters.' }
      ] },

    { kind: 'sequence', title: '5. Refresh-ahead',
      body: 'Instead of waiting for a copy to expire and making someone pay for the rebuild, the cache **refreshes popular entries early**.',
      actors: ['User', 'Cache', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'get homepage', note: 'A copy with a 60-second TTL has 8 seconds left. It is popular, so it is a refresh candidate.' },
        { from: 1, to: 0, label: 'hit (old copy)', dashed: true, note: 'The user is served the current copy straight away. **No waiting.**' },
        { from: 1, to: 2, label: 'rebuild the homepage', note: 'In the background, the cache asks the database for a fresh version **before** the old one expires.' },
        { from: 2, to: 1, label: 'fresh data', dashed: true, note: 'The new copy replaces the old one with a full TTL.' },
        { note: '**Good:** no user ever waits on a rebuild, and busy keys never expire under load. **Cost:** you refresh things nobody asks for again, and it only pays off if you can guess what will be needed.' }
      ] },

    { kind: 'compare', title: 'The five side by side',
      body: 'Cache-aside is the usual default. The others solve specific problems.',
      cols: ['Strength', 'Weakness'],
      rows: [
        ['Cache-aside', 'Simple, flexible, caches only what is used', 'First request always misses; the app handles stale data'],
        ['Read-through', 'Cleaner app code; loading logic in one place', 'Needs a cache that supports loaders'],
        ['Write-through', 'Cache and database always agree', 'Slower writes; may cache unread data'],
        ['Write-behind', 'Very fast writes, batched to the database', 'Writes can be lost if the cache fails'],
        ['Refresh-ahead', 'Hot keys never make anyone wait', 'Wasted work on keys that are not asked for again']
      ] },

    { kind: 'tip', title: 'Combine them; start with cache-aside',
      body: `Real systems mix these. A common setup: **cache-aside** for reads, with **delete on write** to keep it fresh. Add **refresh-ahead** for a handful of very hot items like the home page. Reach for **write-behind** only for things like view counters, where losing a few seconds of counts is acceptable.

        If you are unsure, start with cache-aside. It is easy to reason about, and when something goes wrong, you can see exactly which line of your own code did it.`,
      note: 'Rule of thumb: the more a strategy speeds up writes, the more you risk losing or showing stale data.' }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'In cache-aside, the app updates a product in the database. What should it do with the cached copy of that product?',
      options: ['Delete it, so the next read fetches fresh data', 'Leave it alone and let the TTL handle everything', 'Write the new value into the cache first, then the database', 'Copy the database’s entire contents into the cache'],
      answer: 0,
      why: [null, 'It works eventually, but users see stale data until the TTL runs out.', 'Updating the cache before the database risks showing data that never got saved.', 'That would be wasteful and defeats the point of a small cache.'],
      explain: 'Updating the source of truth and then deleting the cached copy keeps things fresh: the next reader misses, loads the new data and refills the cache.' },

    { type: 'tf', after: 6, statement: 'Write-behind is a good choice for storing customers’ payments, because writes are acknowledged so quickly.', answer: false,
      explain: 'Write-behind acknowledges before the database has the data. If the cache fails before the flush, the payment is lost. Use it only for data you can afford to lose a little of, such as view counters.' },

    { type: 'match', after: 8, prompt: 'Match each strategy to its defining trait.',
      pairs: [['Cache-aside', 'The app checks the cache and fills it on a miss'], ['Read-through', 'The cache itself loads missing data from the database'], ['Write-through', 'A write goes to cache and database before "done"'], ['Write-behind', 'Acknowledge now, save to the database later'], ['Refresh-ahead', 'Reload popular entries before they expire']] },

    { type: 'order', prompt: 'Put a cache-aside **read miss** in order.',
      items: ['The app asks the cache and finds nothing', 'The app reads the row from the database', 'The app stores the row in the cache with a TTL', 'The app returns the row to the caller', 'A later request is answered from the cache'],
      explain: 'The app drives every step: look, fall back to the database, store a copy, reply. Only then can later requests be hits.' },

    { type: 'bucket', prompt: 'Which strategy fits each situation best?', buckets: ['Cache-aside', 'Write-through', 'Write-behind', 'Refresh-ahead'],
      items: [['A normal product catalogue; read often, changed now and then', 0], ['The default for a new service: simple and easy to debug', 0], ['A user profile that must never be read stale after saving', 1], ['Settings where the cache and database must always agree', 1], ['A page-view counter updated thousands of times a second', 2], ['Game scores where losing the last second is acceptable', 2], ['The home page: very popular, slow to build, must never stall', 3]],
      explain: 'Fresh and safe means write-through. Fast writes of expendable data means write-behind. A hot, expensive-to-rebuild item suits refresh-ahead. Everything else starts with cache-aside.' },

    { type: 'spot', prompt: 'This cache-aside write path has a bug that will serve stale data. Tap the line that is wrong.',
      code: { lang: 'js', src: `
        async function updateEmail(userId, email) {
          await db.setEmail(userId, email);
          // cache entry user:<id> is left as it was
          return 'saved';
        }

        async function getUser(userId) {
          const hit = await cache.get('user:' + userId);
          if (hit) return hit;
          const user = await db.getUser(userId);
          await cache.set('user:' + userId, user, 3600);
          return user;
        }` },
      lines: [2, 3],
      explain: 'After updating the database, the cached `user:<id>` still holds the old email, and with a one-hour TTL readers may see it for up to an hour. The write path should delete (or update) the cache entry.' },

    { type: 'cloze', text: 'In {{read-through}}, the cache loads missing data itself. In {{write-through}}, writes reach the database before "done". In {{write-behind}}, the database is updated later, so writes can be lost.',
      distractors: ['cache-aside', 'refresh-ahead', 'eviction'],
      explain: 'The names hint at behaviour: through means synchronous, behind means after the fact, and read-through puts the loader inside the cache.' },

    { type: 'scenario', title: 'Pick the strategy', intro: 'You are the backend engineer for a social app. Three features each need caching, and each one fails in a different way if you choose badly.',
      meters: { 'speed': 40, 'data safety': 70 },
      steps: [
        { text: 'Feature 1: "likes" on posts. Thousands per second hit popular posts, and losing a second of likes during a crash would go unnoticed. What do you use?',
          choices: [
            { label: 'Write-behind: count in the cache and flush batches to the database', score: 2, effects: { 'speed': 25 }, feedback: 'Fast writes, and the database sees one update per batch instead of thousands. The risk (losing a few seconds of likes) is acceptable here.' },
            { label: 'Write-through: every like hits the database before replying', score: 1, effects: { 'speed': 5, 'data safety': 10 }, feedback: 'Safe, but a viral post would turn every like into a database write, the thing you were trying to avoid.' },
            { label: 'No cache; read and write the database directly', score: 0, effects: { 'speed': -15 }, feedback: 'The hottest rows in the system would then take the full pounding of the database.' }
          ] },
        { text: 'Feature 2: a user’s profile (name, photo, bio). It is read constantly and edited rarely, and edits should appear straight away. What is your starting point?',
          choices: [
            { label: 'Cache-aside, deleting the cached profile whenever it is edited', score: 2, effects: { 'speed': 15, 'data safety': 10 }, feedback: 'Simple, and an edit is visible on the next read. The database stays the source of truth.' },
            { label: 'Write-behind, because profiles are written rarely so it is cheap', score: 0, effects: { 'data safety': -25 }, feedback: 'Rare writes are exactly the ones users care about. Losing an edit to a cache crash would be baffling and unfair.' },
            { label: 'Cache it forever and never invalidate it', score: 0, effects: { 'data safety': -15, 'speed': 10 }, feedback: 'Edits would never show up. Even cache-aside needs a way to forget.' }
          ] },
        { text: 'Feature 3: the trending feed, which costs 800 ms to build and is read by almost everyone. Every time its TTL expires, the next user waits almost a second. How do you fix it?',
          choices: [
            { label: 'Refresh-ahead: rebuild it in the background shortly before it expires', score: 2, effects: { 'speed': 20 }, feedback: 'Nobody ever waits for a rebuild. It is a good fit for one hot, expensive, universally read item.' },
            { label: 'Make its TTL one second so it is always fresh', score: 0, effects: { 'speed': -20 }, feedback: 'You would rebuild an 800 ms query every second, constantly.' },
            { label: 'Give each user their own cached copy of the feed', score: 1, effects: { 'speed': -5 }, feedback: 'The feed is identical for everyone, so per-user copies waste memory and multiply the rebuilds.' }
          ] }
      ],
      outro: 'The pattern: **match the strategy to what you can afford to lose and what must never be stale.**' },

    { type: 'explain', prompt: 'A teammate says: "Write-through and write-behind are basically the same." Explain the difference, and when you would pick each.',
      model: 'Write-through updates the cache and the database together before telling the caller "done", so they always agree and nothing is lost, but writes are as slow as the database. Write-behind acknowledges after writing only to the cache and flushes to the database later, so writes are very fast and can be batched, but if the cache fails before the flush the data is lost. I would use write-through when data must be safe and fresh, and write-behind for data like counters where losing a little is acceptable.',
      keywords: ['write-through', 'write-behind', 'database', 'later', 'lost', 'fast', 'batch', 'safe'] }
  ],

  flashcards: [
    { q: 'How does cache-aside work?', a: 'The app checks the cache; on a miss it reads the database, stores the result in the cache and returns it. On a write it updates the database and deletes the cached entry.' },
    { q: 'Read-through vs cache-aside?', a: 'In read-through the cache itself loads missing data from the database, so the app only talks to the cache. In cache-aside the app does the loading.' },
    { q: 'What is write-through?', a: 'Writes go to the cache and the database together before the caller is told "done", so they always agree, at the cost of slower writes.' },
    { q: 'What is the risk of write-behind?', a: 'The cache acknowledges before the database is updated, so if the cache fails before it flushes, those writes are lost.' },
    { q: 'What does refresh-ahead do?', a: 'It reloads popular entries in the background before they expire, so no user waits for a rebuild.' }
  ],

  glossary: [
    { term: 'Cache-aside', def: 'A pattern where the app checks the cache first and, on a miss, loads from the database and fills the cache itself.', like: 'The barista checks the fridge, and restocks it herself from the stockroom.', aka: ['lazy loading'] },
    { term: 'Read-through', def: 'A pattern where the cache itself loads missing data from the database; the app only talks to the cache.', like: 'A runner who handles the fridge and stockroom for you.' },
    { term: 'Write-through', def: 'A pattern where every write goes to both the cache and the database before the caller is told it succeeded.', like: 'Updating the fridge list and the stockroom ledger at the same time.' },
    { term: 'Write-behind', def: 'A pattern where writes land in the cache first and are saved to the database later, in the background.', like: 'Scribbling on the fridge now and updating the ledger tonight.', aka: ['write-back'] },
    { term: 'Refresh-ahead', def: 'A pattern where popular cache entries are reloaded shortly before they expire, so nobody waits for a rebuild.', like: 'Topping up the fridge before it runs out.' }
  ],

  takeaways: [
    '**Cache-aside** is the everyday default: the app looks, fills on a miss, and deletes on write.',
    '**Read-through** moves the loading into the cache; **write-through** keeps cache and database in step.',
    '**Write-behind** is fast but can lose writes; use it for counters, never for payments.',
    '**Refresh-ahead** keeps hot, expensive items warm so nobody waits on a rebuild.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ca-invalidation', {
  eli5: 'Caches go wrong in a few famous ways: old data hangs around, the wrong things get thrown out, and one popular entry expiring can make a thousand requests rush to the database at once.',

  cards: [
    { kind: 'concept', title: 'Stale data: the copy that outlived the truth',
      body: `You change your profile photo. The page updates... but a friend still sees the old one for the next ten minutes. Nothing is broken: their copy simply has not been told.

        Getting rid of a copy that has gone out of date is **invalidation**. The three ways to do it:

        - **Wait it out**: set a TTL and accept some staleness.
        - **Delete on change**: when the data changes, delete or update the cached copy straight away.
        - **Change the name**: put a version in the key, so a new version is a new entry.

        Most real systems use the first two *together*: delete on change for speed, with a TTL as the safety net for the cases you forgot.` },

    { kind: 'compare', title: 'Three ways to invalidate',
      body: 'Each trades effort for freshness.',
      cols: ['Good', 'Bad'],
      rows: [
        ['TTL only', 'Trivial to build; always self-heals', 'Data is stale up to the whole TTL'],
        ['Delete on change', 'Fresh almost immediately', 'You must find every place that changes the data'],
        ['Versioned keys', 'Old entries just stop being used; no deletes', 'You need somewhere to keep the current version number']
      ] },

    { kind: 'sequence', title: 'A race that serves old data for an hour',
      body: 'Even "delete on change" can lose a race. Watch two requests collide.',
      actors: ['Reader', 'Writer', 'Cache', 'Database'],
      steps: [
        { from: 0, to: 2, label: 'get user:7', note: 'The reader looks in the cache and finds nothing (a miss).' },
        { from: 0, to: 3, label: 'read user 7', note: 'It fetches the row from the database. It gets the **old** email.' },
        { from: 1, to: 3, label: 'update user 7', note: 'Meanwhile, a writer updates the email in the database.' },
        { from: 1, to: 2, label: 'delete user:7', note: 'The writer then deletes the cache entry, as the cache-aside rule says. But there is nothing in there yet.' },
        { from: 0, to: 2, label: 'set user:7 (old email)', note: 'Now the reader, still holding what it read earlier, **stores the old value**. The delete came too early.' },
        { note: 'The cache now holds stale data, and nothing will remove it until the TTL expires. This is rare, but it is exactly why a **TTL is the safety net** even when you delete on change.' }
      ] },

    { kind: 'metaphor', title: 'A small bookshelf by the bed',
      body: `Your cache is a **bookshelf by your bed**. It holds twenty books. The library holds thousands. When you fetch a twenty-first book, one must go back.

        Which one? That is the **eviction policy**:

        - Return the one you **haven't touched for longest** (LRU).
        - Return the one you've **read least often** (LFU).
        - Return the ones **past their return date** (TTL).

        A cache that is full is not a failure. It is doing its job. Eviction is how a small, fast store keeps only the answers that matter most.` },

    { kind: 'compare', title: 'LRU, LFU and TTL',
      body: 'Redis and others let you choose how a full cache decides what to drop.',
      cols: ['LRU', 'LFU', 'TTL'],
      rows: [
        ['Evicts', 'Least recently used', 'Least frequently used', 'Whatever has expired first'],
        ['Good when', 'Recent use predicts the next use', 'A few items are popular for a long time', 'Data has a natural shelf life'],
        ['Weak when', 'A one-off scan sweeps out the useful data', 'Old favourites hang on after they stop being popular', 'It ignores usage, and a full cache still needs room']
      ] },

    { kind: 'sequence', title: 'The thundering herd',
      body: 'A very popular entry expires. At that instant, hundreds of requests all miss at once.',
      actors: ['Many users', 'Cache', 'Database'],
      steps: [
        { at: 1, label: 'home-page entry expires', note: 'The home page is cached for 60 seconds. At 12:00:00 its TTL runs out.' },
        { from: 0, to: 1, label: '2,000 requests per second', note: 'Thousands of requests arrive in the next moments, all asking for the home page.' },
        { from: 1, to: 0, label: 'miss, miss, miss…', dashed: true, note: 'Every one of them **misses**, because nobody has refilled it yet.' },
        { from: 0, to: 2, label: 'every one rebuilds it', note: 'Each request goes to the database to rebuild the **same page**. If a rebuild takes 2 seconds, thousands pile up.' },
        { at: 2, label: 'overloaded', note: 'The database, which the cache was protecting, now takes the full blow. This is a **stampede**, also called the **thundering herd**.' }
      ] },

    { kind: 'steps', title: 'Four ways to calm the herd',
      body: 'The goal is the same each time: **only one request should do the rebuild**.',
      steps: [
        { title: 'Locking', body: 'The first request to miss takes a lock on that key and rebuilds it. Others wait briefly, or are served the old copy, then read the fresh one.' },
        { title: 'Single-flight', body: 'Inside one app server, identical in-flight requests are merged: the first does the work and every other caller gets the same result when it finishes.' },
        { title: 'Jittered TTLs', body: 'Add a little randomness to each TTL (say 60 seconds plus up to 10%) so that entries filled together do not all expire together.' },
        { title: 'Serve stale, refresh behind', body: 'Keep serving the expired copy for a moment while one background job rebuilds it. This is refresh-ahead from the last lesson, used as a stampede defence.' }
      ] },

    { kind: 'concept', title: 'Hot keys: when one entry is too popular',
      body: `A cache can spread keys across several servers so that no single one is overloaded. But a **hot key**, one entry asked for far more than any other, lands on **one** server.

        Imagine a pop star posting, and ten million fans loading their profile. The overall cache is healthy. The one machine holding that key is on fire.

        Typical fixes:

        - A tiny **local cache** inside each app server for the very hottest keys.
        - Storing **several copies** under keys like \`star:profile:1\` to \`star:profile:8\`, and picking one at random.
        - Serving the item from a **CDN** instead, if it is public.`,
      note: 'Nothing is wrong with the cache as a whole, which is why hot keys are hard to spot in averages. Look at the busiest single key.' },

    { kind: 'code', title: 'Negative caching: remembering "no"',
      body: 'Requests for things that **do not exist** (typos, old links, bots guessing IDs) always miss and always go to the database. Caching the *absence* stops that. **Tap the lines.**',
      code: { lang: 'js', src: `
        const NOT_FOUND = '__none__';

        async function getUser(id) {
          const hit = await cache.get('user:' + id);
          if (hit === NOT_FOUND) return null;     // a cached "no"
          if (hit) return hit;

          const user = await db.findUser(id);
          if (!user) {
            await cache.set('user:' + id, NOT_FOUND, 30);
            return null;
          }
          await cache.set('user:' + id, user, 600);
          return user;
        }`,
        notes: {
          1: 'A **marker value** that means "we checked, and there is no such user". It has to be something distinct from a real user, and from "not in the cache".',
          5: 'If we have already learned this user does not exist, answer "no" without touching the database.',
          10: 'The database says no: **remember that**, so the next hundred requests for this ID are free. Note the **short TTL**, 30 seconds against 10 minutes: if someone creates that user a moment later, the cached "no" should vanish quickly.'
        } } },

    { kind: 'tip', title: 'Watch three numbers',
      body: `Once a cache is live, three numbers tell you most of what is going on:

        - **Hit rate**: falling means your keys, TTLs or size are wrong, or traffic has changed.
        - **Evictions**: many evictions means the cache is too small for what you ask of it.
        - **Memory used** (and the busiest single keys): the early warning for hot keys.

        And when something looks stale, ask first "which of the three invalidation methods is this entry using, and did the change actually reach it?" That question solves most cache mysteries.`,
      note: 'In the lab that follows, you will trigger a stampede and tune size, TTL and eviction while watching hit rate move.' }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Why keep a TTL on entries even when the code deletes the cache entry whenever the data changes?',
      options: ['A safety net for races and missed code paths that leave stale data', 'Deleting on change never works, so the TTL does the real job', 'Without a TTL, Redis refuses to store the entry', 'It makes each cache hit faster to read'],
      answer: 0,
      why: [null, 'Deleting on change usually works well. The TTL covers the cases where it does not.', 'Redis happily stores entries with no TTL.', 'The TTL does not affect how fast a hit is.'],
      explain: 'A reader can refill the cache with an old value just after the writer deleted it, and some code paths may forget to delete. A TTL guarantees even those mistakes heal in time.' },

    { type: 'match', after: 4, prompt: 'Match each eviction policy to what it throws out.',
      pairs: [['LRU', 'The item that has gone longest without being used'], ['LFU', 'The item that has been used the fewest times'], ['TTL', 'The item whose time to live has run out'], ['Random', 'Any item, chosen without any tracking']] },

    { type: 'tf', after: 6, statement: 'Giving every cache entry exactly the same TTL, all filled at once, can make them all expire together and cause a stampede.', answer: true,
      explain: 'If a thousand entries were warmed in the same second with the same TTL, they all expire in the same second and a thousand rebuilds hit the database together. A little random jitter spreads them out.' },

    { type: 'bucket', prompt: 'Which problem is each symptom, and so which fix?', buckets: ['Stampede', 'Hot key', 'Needs negative caching', 'Stale data'],
      items: [['A popular page expires and the database is flooded for a moment', 0], ['Thousands of rebuilds of the same entry at 12:00:00', 0], ['One cache node is overloaded while the others are idle', 1], ['One celebrity’s profile gets most of the traffic', 1], ['A bot guesses user IDs and every guess reaches the database', 2], ['Requests for deleted products keep missing every time', 2], ['A customer changed their email but sees the old one', 3]],
      explain: 'Name the pattern and the fix follows: stampede (locks, jitter), hot key (local copies or replicas), repeated misses for things that do not exist (cache the absence), stale data (invalidate on change, TTL as backup).' },

    { type: 'estimate', q: 'The home page is requested 5,000 times per second. Its cache entry expires, and rebuilding it takes 2 seconds. With no protection, roughly how many rebuilds could be started before the first one finishes?',
      answer: 10000, unit: 'rebuilds', min: 10, max: 100000, tolerance: 1.5,
      explain: '5,000 per second × 2 seconds = **10,000** requests arriving while the first rebuild is still running, each of which misses and starts its own. With a lock or single-flight, it would be one.' },

    { type: 'ab', q: 'A nightly job warms ten thousand cache entries at 03:00. Which way of setting their TTLs avoids a synchronised stampede?',
      a: { lang: 'js', label: 'The same TTL for all', src: `
        cache.set(key, value, 3600);` },
      b: { lang: 'js', label: 'A TTL with random jitter', src: `
        const jitter = Math.floor(Math.random() * 360);
        cache.set(key, value, 3600 + jitter);` },
      answer: 'b',
      explain: 'Adding up to 10% random time means the entries expire across a six-minute window instead of in the same second, so the rebuilds trickle in instead of arriving as a wall.' },

    { type: 'short', q: 'Which eviction policy removes the entry that was used least recently? Give the three-letter abbreviation.', accept: ['LRU', 'least recently used'], hint: 'Least Recently ...',
      explain: '**LRU**, least recently used. It assumes that what you used a moment ago you will probably want again, and what you have ignored for ages you will not.' },

    { type: 'scenario', title: '12:00:00: the database is on fire', intro: 'You run the backend for a news site. Every day at noon, the database collapses for about 20 seconds. The monitoring shows a spike in queries at exactly 12:00:00, and your home-page cache entry has a 60-minute TTL set at 11:00.',
      meters: { 'database health': 50, 'reader experience': 50 },
      steps: [
        { text: 'The spike is thousands of identical queries for the home page. What is the likely cause?',
          choices: [
            { label: 'The entry expires at noon, and every request that arrives misses and rebuilds it at once', score: 2, effects: { 'database health': 5 }, feedback: 'A classic stampede. The page is hugely popular, expiry is a single moment, and nothing stops a thousand people from rebuilding it together.' },
            { label: 'The database has a scheduled noon crash', score: 0, effects: {}, feedback: 'The data points to your own cache expiry. The database is just the victim.' },
            { label: 'Readers are refreshing more at lunchtime', score: 1, effects: {}, feedback: 'More traffic makes it worse, but the instant spike at 12:00:00 points to expiry, not a gradual rise.' }
          ] },
        { text: 'What is the quickest high-value fix?',
          choices: [
            { label: 'Let only one request rebuild the page (a lock), while others get the old copy or briefly wait', score: 2, effects: { 'database health': 35, 'reader experience': 20 }, feedback: 'Exactly: one rebuild instead of thousands. The database barely notices and readers still get a page.' },
            { label: 'Give the page a 24-hour TTL', score: 0, effects: { 'database health': 10, 'reader experience': -25 }, feedback: 'The stampede still happens, just once a day, and in the meantime the home page is a day out of date.' },
            { label: 'Remove the cache for the home page', score: 0, effects: { 'database health': -30 }, feedback: 'Now every reader runs the heavy query, all day.' }
          ] },
        { text: 'Next you notice the "search" endpoint gets thousands of requests for product IDs that do not exist, sent by a scraper. What helps?',
          choices: [
            { label: 'Cache the "not found" result for a short time (negative caching)', score: 2, effects: { 'database health': 15 }, feedback: 'Repeats of the same missing ID now cost nothing, and a short TTL means a genuinely new product shows up quickly.' },
            { label: 'Cache "not found" for a week', score: 1, effects: { 'database health': 10, 'reader experience': -15 }, feedback: 'It stops the scraper but also hides a product for a week after it is added.' },
            { label: 'Do nothing: misses are free', score: 0, effects: { 'database health': -15 }, feedback: 'Each miss is a database query, and a scraper can make a very large number of them.' }
          ] }
      ],
      outro: 'The pattern: **find the shape of the load, then make exactly one request do the work.**' },

    { type: 'explain', prompt: 'Explain what a cache stampede is and give two ways to prevent it. Then explain in one sentence why a hot key is a different problem.',
      model: 'A stampede happens when a popular entry expires and many requests miss at the same moment, so they all rebuild the same data from the database and overload it. Ways to prevent it include locking or single-flight so only one request rebuilds, jittering TTLs so entries do not expire together, and serving a stale copy while one background job refreshes it. A hot key is different: the cache is fine overall but one entry gets so much traffic that the single node holding it is overloaded.',
      keywords: ['expire', 'rebuild', 'lock', 'single-flight', 'jitter', 'stale', 'hot key', 'one node'] }
  ],

  flashcards: [
    { q: 'What are three ways to invalidate cached data?', a: 'Wait for a TTL to expire, delete or update the entry when the data changes, or use versioned keys so a new version is a new entry.' },
    { q: 'Why keep a TTL even when you delete on change?', a: 'As a safety net: races or forgotten code paths can leave stale entries, and the TTL guarantees they eventually go.' },
    { q: 'LRU vs LFU?', a: 'LRU evicts what was used least recently; LFU evicts what was used least often.' },
    { q: 'What is a thundering herd or stampede, and how do you prevent it?', a: 'Many requests miss together when a popular entry expires and all rebuild it at once. Prevent it with locks or single-flight, jittered TTLs, or serving stale while one refresh runs.' },
    { q: 'What are a hot key and negative caching?', a: 'A hot key is a single entry with extreme traffic that overloads one cache node. Negative caching stores "not found" results, briefly, so repeated requests for missing things do not hit the database.' }
  ],

  glossary: [
    { term: 'Invalidation', def: 'Removing or updating a cached copy because the original data has changed.', like: 'Crossing out the old appointment on the sticky note.' },
    { term: 'Eviction', def: 'A full cache removing some entries to make room for new ones, chosen by a policy such as LRU or LFU.', like: 'Returning a book to the library to fit a new one on the shelf.' },
    { term: 'LRU', def: 'Least recently used: an eviction policy that drops the entry that has gone longest without being accessed.', like: 'Tidying away the book you have not opened for longest.', aka: ['least recently used'] },
    { term: 'LFU', def: 'Least frequently used: an eviction policy that drops the entry accessed the fewest times.', like: 'Returning the book you have read the fewest times.', aka: ['least frequently used'] },
    { term: 'Cache stampede', def: 'Many requests missing at once on an expired popular entry and all rebuilding it together, overloading the source.', like: 'A shop opening its doors and everyone asking the one assistant the same question.', aka: ['thundering herd', 'dogpile'] },
    { term: 'Hot key', def: 'A single cache key that receives a disproportionate share of traffic, overloading the node that stores it.', like: 'One shelf in the shop that everybody wants.' }
  ],

  takeaways: [
    'Invalidate by **TTL, delete on change, or versioned keys**; use a TTL as the safety net anyway.',
    'A full cache **evicts** by policy: LRU (least recently used) and LFU (least often used) are the classics.',
    'A **stampede** happens when a popular entry expires; let **one** request rebuild and jitter your TTLs.',
    '**Hot keys** need local or replicated copies; **negative caching** remembers "no", briefly.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('caching', {
  title: 'The Stale Hydra',
  intro: 'A many-headed beast guards a vault of answers, and every head remembers something slightly wrong. Cut them down by choosing the right headers, the right strategy and the right moment to forget.',
  questions: [
    { type: 'mcq', q: 'A cache answers 950 of every 1,000 requests. What is its hit rate, and what share of traffic reaches the database?',
      options: ['95% hit rate; 5% reaches the database', '5% hit rate; 95% reaches the database', '95% hit rate; 95% reaches the database', '50% hit rate; 50% reaches the database'],
      answer: 0,
      why: [null, 'The two are swapped: hits are the requests the cache answered.', 'Misses are what reach the database, and there are only 50 of those.', null],
      explain: 'Hit rate is hits divided by total requests: 950 / 1,000 = 95%. The other 5% are misses, and those are the only requests that reach the database.' },

    { type: 'tf', statement: 'Cache-Control: no-cache tells browsers never to store the response.', answer: false,
      explain: '`no-cache` allows storing but demands revalidation before every reuse. `no-store` is the one that forbids keeping a copy.' },

    { type: 'mcq', q: 'A browser holds a cached file with ETag "a1b2c3" whose max-age has run out. It sends a request with `If-None-Match: "a1b2c3"` and the file has not changed. What does the server reply?',
      options: ['304 Not Modified, with no body', '200 OK with the whole file again', '404 Not Found', '204 No Content with a new ETag'],
      answer: 0,
      why: [null, 'It would only do that if the file had changed, or the request had no condition.', 'The file exists; nothing is missing.', null],
      explain: 'A matching ETag means the browser’s copy is current. The 304 has no body, so the check is tiny and the browser keeps using what it has.' },

    { type: 'ab', q: 'Which headers suit `app.3f9a1c.js`, a file whose name changes with its contents?',
      a: { lang: 'http', label: 'Long, immutable', src: `
        Cache-Control: public, max-age=31536000, immutable` },
      b: { lang: 'http', label: 'Short and cautious', src: `
        Cache-Control: max-age=60` },
      answer: 'a',
      explain: 'A fingerprinted name never changes meaning, so caching it for a year is safe and saves every repeat download. A minute-long max-age would waste most of the benefit.' },

    { type: 'bucket', prompt: 'Which Cache-Control policy suits each response?', buckets: ['Long max-age (fingerprinted)', 'no-cache (re-check)', 'no-store'],
      items: [['`vendor.8b2f.css`, built with a hash in its name', 0], ['`index.html`, which names the latest scripts', 1], ['A page showing someone’s medical results', 2], ['A page that must reflect the latest edit, but is public', 1], ['A response with a one-time password-reset link', 2], ['`logo.55d1.svg`, renamed on each change', 0]],
      explain: 'Fingerprinted files are safe to cache for a year. Changing pages need cheap revalidation. Sensitive responses should never be stored.' },

    { type: 'multi', q: 'Which of these are good things to put on a CDN?',
      options: ['Images, fonts and scripts', 'A public marketing home page that is the same for everyone', 'A logged-in "my account" page with personal details', 'A downloadable PDF brochure', 'The response to `GET /me` for the current user'],
      answers: [0, 1, 3],
      explain: 'CDNs are for content that is identical for everyone. Pages and API replies that depend on who is asking must not be stored in a shared cache.' },

    { type: 'order', prompt: 'Put this cache-aside read miss in order.',
      items: ['The app checks the cache and finds nothing', 'The app reads the row from the database', 'The app stores the row in the cache with a TTL', 'The app returns the row to the caller', 'A later request is answered by the cache'],
      explain: 'The app does each step itself: look, fall back, store, reply. Only then can later requests be hits.' },

    { type: 'mcq', q: 'A page-view counter is updated thousands of times a second, and losing a few seconds of counts is acceptable. Which strategy suits it?',
      options: ['Write-behind: update the cache and flush to the database in batches', 'Write-through: write the database on every single increment', 'Refresh-ahead: reload the count before it expires', 'Read-through: let the cache load it when asked'],
      answer: 0,
      why: [null, 'Safe, but it turns each tick of the counter into a database write, which is what you want to avoid.', 'Refresh-ahead helps reads of hot entries, not heavy write traffic.', 'Read-through is about loading on a miss, not about handling writes.'],
      explain: 'Write-behind absorbs a flood of tiny writes and sends the database one batch. The risk (losing a few seconds of counts) is acceptable for a counter, though never for payments.' },

    { type: 'spot', prompt: 'Users report seeing the wrong language on product pages. Tap the line that is the cause.',
      code: { lang: 'js', src: `
        async function getCatalogue(lang, page) {
          const key = 'catalogue:' + page;
          const hit = await cache.get(key);
          if (hit) return hit;
          const rows = await db.catalogue(lang, page);
          await cache.set(key, rows, 600);
          return rows;
        }` },
      lines: [2],
      explain: 'The key omits `lang`, so whichever language is requested first is cached and served to everyone for ten minutes. The key must include every input that changes the answer.' },

    { type: 'estimate', q: 'A busy page is requested 3,000 times per second. Its cache entry expires and rebuilding takes 2 seconds, with no lock or single-flight. Roughly how many requests will try to rebuild it?',
      answer: 6000, unit: 'rebuilds', min: 10, max: 100000, tolerance: 1.5,
      explain: '3,000 × 2 = **6,000** requests arrive before the first rebuild finishes, and every one of them misses. With a lock, a single rebuild would do.' },

    { type: 'short', q: 'Which eviction policy drops the entry that has gone longest without being used? (Three-letter abbreviation.)', accept: ['LRU', 'least recently used'], hint: 'Least Recently ...',
      explain: '**LRU**, least recently used. LFU, by contrast, drops the one used least often.' },

    { type: 'mcq', q: 'One celebrity’s profile receives most of the traffic, and the cache server holding that key is overloaded while the others sit idle. What is this, and what helps?',
      options: ['A hot key: add a local cache or several copies of the key', 'A stampede: lengthen every TTL', 'Negative caching: store "not found" for it', 'A cold start: restart the cache'],
      answer: 0,
      why: [null, 'A stampede is many rebuilds after an expiry. Here the key is merely too popular for one node.', 'Negative caching is for things that do not exist; this profile exists.', 'The cache is already warm; the problem is concentrated demand.'],
      explain: 'A single extremely popular key lands on one node. Spreading the load needs a small local cache in each app server, or several copies of the key chosen at random.' }
  ]
});

KS.sheet('caching', {
  title: 'Caching: cheat sheet',
  sections: [
    { title: 'The basics',
      md: `A **cache** keeps copies of answers in fast storage to skip slow work. **Hit** = found; **miss** = not found, so go to the source.

        - **Hit rate** = hits / total requests.
        - Average time = hit rate × hit time + miss rate × miss time.
        - **TTL** = how long a copy is trusted before it is dropped.
        - Cache things that are **expensive, repeated and fine if slightly stale**.
        - The database is the **source of truth**; a cache must be rebuildable.

        Layers, nearest the user first: browser, CDN, web server, app memory, Redis/Memcached, database cache.` },

    { title: 'HTTP caching',
      md: `| Header | Meaning |
        |---|---|
        | \`max-age=N\` | Reuse for N seconds with no request |
        | \`no-cache\` | Store it, but **re-check each time** |
        | \`no-store\` | Never keep a copy |
        | \`private\` | Only the user's browser may keep it |
        | \`public\` | Shared caches (CDNs) may keep it too |

        **ETag** + \`If-None-Match\` -> **304 Not Modified** (no body). **Fingerprinted names** (\`app.3f9a1c.js\`) + a year of \`max-age\` + \`immutable\`; keep the HTML on \`no-cache\`.` },

    { title: 'CDNs',
      md: `- **Edge**: CDN server near the visitor. **Origin**: your real server.
        - First request to an edge is a **miss**; later ones hit.
        - **Good**: images, fonts, scripts, video, downloads, public pages.
        - **Never public**: anything that depends on who is asking.
        - **Purge** to drop a copy early; better, use fingerprinted names.
        - A CDN also **shields** the origin from spikes and attacks; an **origin shield** layer merges many edge misses into one.` },

    { title: 'Redis vs Memcached, local vs distributed',
      md: `| | Redis | Memcached |
        |---|---|---|
        | Data | Rich types | Simple key-value |
        | Disk | Optional | None |
        | Scaling | Replication, clusters | Client-side spread |

        **Local** cache: fastest, but copies drift apart between servers. **Distributed**: one shared view, a network hop and a server to run.

        **Cache keys** must hold every input that changes the answer: \`price:42:GBP\`.` },

    { title: 'The five strategies',
      md: `| Strategy | How | Watch out |
        |---|---|---|
        | Cache-aside | App checks cache, fills on miss, deletes on write | Stale until deleted |
        | Read-through | Cache loads from the database itself | Needs loader support |
        | Write-through | Write both before "done" | Slower writes |
        | Write-behind | Cache now, database later | Can lose writes |
        | Refresh-ahead | Reload hot items before expiry | Wasted refreshes |

        Default: **cache-aside**, delete on write, TTL as a safety net.` },

    { title: 'What goes wrong',
      md: `- **Stale data**: invalidate by TTL, delete on change, or versioned keys.
        - **Eviction** when full: **LRU** (least recently used), **LFU** (least often used), **TTL** (expired).
        - **Stampede**: popular entry expires, everyone rebuilds. Fix: lock, single-flight, **jittered TTLs**, serve stale.
        - **Hot key**: one entry overloads one node. Fix: local copy, several copies, CDN.
        - **Negative caching**: remember "not found" with a **short** TTL.
        - Watch: hit rate, evictions, memory, busiest keys.` }
  ]
});
