/* Keystone content: Capstone Designs (8 guided system-design lessons).
   Each lesson designs one real system with the method: requirements → estimates → API/data → design → trade-offs. */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cap-url-shortener', {
  eli5: 'A URL shortener turns a very long web address into a tiny one, and when someone visits the tiny one it sends them to the long one. Doing that for millions of people is the hard part.',

  cards: [
    { kind: 'concept', title: 'The easiest question in the interview',
      body: `"Design a URL shortener" sounds like a ten-minute job. You give each long link a short code, store the pair, and look it up later. Done?

        Not quite. Imagine a popular account tweets your short link to ten million followers. A million people click it in the same minute. Meanwhile someone else is trying to hide a phishing site behind your tidy domain.

        So we follow the method you learned: **requirements first, then numbers, then boxes and arrows, then trade-offs**. You will be making the calls in this lesson, so keep your architect’s hat on.` },

    { kind: 'steps', title: 'Step 1: requirements and scale',
      body: 'Before drawing anything, pin down what we are building. Tap through.',
      steps: [
        { title: 'Functional: what it does', body: 'Create a short link from a long URL. Visiting the short link redirects to the long one. Optionally: custom aliases, expiry dates and click statistics. We will keep stats as a "nice to have" so they cannot slow down the redirect.' },
        { title: 'Non-functional: how well', body: 'Redirects must be **fast** (people feel anything over a fraction of a second) and **highly available**: a dead short link is a broken link in a printed poster, forever. Creating links can be a bit slower.' },
        { title: 'The big assumption: reads dwarf writes', body: 'Far more people *click* links than *create* them. Say 100 clicks for every new link. This single ratio will shape the whole design, so we write it down.' },
        { title: 'Scale: pick numbers and say them out loud', body: 'Assume **100 million new links a month**. That is about 40 new links per second (100 million ÷ roughly 2.6 million seconds in a month). With the 100:1 ratio, about **4,000 redirects per second** on average, and several times that at peak.' },
        { title: 'Storage: five years of links', body: '100 million a month for 60 months is **6 billion links**. At roughly 500 bytes each (long URL, short key, dates, owner) that is about **3 TB**. A lot for one machine on a bad day, but not a monster.' }
      ] },

    { kind: 'metaphor', title: 'The cloakroom ticket',
      body: `Think of a cloakroom. You hand over a huge, awkward coat; you get back a tiny numbered ticket. Later, you show the ticket and the attendant fetches the coat.

        The short key is the ticket. The long URL is the coat. The attendant is a **lookup table** from ticket to coat.

        Two things the metaphor gets right: tickets must be **unique** (two people holding ticket 17 would be a disaster) and the lookup must be quick, because there is a queue. Where it stops being true: real cloakrooms do not get a million people at the desk in one minute.` },

    { kind: 'diagram', title: 'Version 1: the simple design',
      body: 'Two paths through the same system. Writes create a link; reads follow one.',
      nodes: [
        { id: 'c', label: 'Browser', icon: '🌐', x: 1, y: 0 },
        { id: 'lb', label: 'Load balancer', icon: '⚖️', x: 1, y: 1 },
        { id: 'app', label: 'App servers', icon: '🖥️', x: 1, y: 2, tone: 'accent' },
        { id: 'db', label: 'Database: key → URL', icon: '🗄️', x: 1, y: 3, tone: 'info' }
      ],
      edges: [
        { from: 'c', to: 'lb', label: 'POST /links' },
        { from: 'lb', to: 'app' },
        { from: 'app', to: 'db', label: 'read / write', both: true }
      ],
      caption: 'The API is two calls: POST /links (long URL in, short key out) and GET /{key} (redirect to the long URL). The table needs only a key column (the primary key), the long URL, a created time and an optional expiry.' },

    { kind: 'concept', title: 'Making the key: three honest options',
      body: `The short key is the heart of the design. A **base62** key uses the characters a–z, A–Z and 0–9 (62 symbols). Seven characters give 62⁷, about **3.5 trillion** combinations, comfortably more than our 6 billion links.

        But how do we *pick* each key?

        - **Hash and chop.** Hash the long URL and keep the first 7 characters. Simple, but two URLs can land on the same key: a [[collision]].
        - **A counter.** Keep a global number, add one for every new link, and write that number in base62. No collisions, but anyone can guess the next link.
        - **Random plus a check.** Pick a random key; if it already exists, pick again.` },

    { kind: 'compare', title: 'Which key strategy?',
      body: 'Each approach buys something and charges for it.',
      cols: ['Hash and chop', 'Counter in base62', 'Random + check'],
      rows: [
        ['Collisions', 'Possible: must detect and retry', 'Never', 'Possible but rare: check and retry'],
        ['Guessable?', 'No', 'Yes: link 1001 follows 1000', 'No'],
        ['Same URL twice', 'Same key (can be handy)', 'Two keys', 'Two keys'],
        ['Scaling it out', 'Easy: no shared state', 'Hard: one counter is a bottleneck. Hand each server a block of numbers', 'Easy, but a database lookup per write'],
        ['Good when', 'You want dedupe', 'Keys can be public and sequential-looking', 'Links should be unguessable']
      ],
      note: 'There is no single winner. Many real systems use a counter handed out in blocks, then scramble the bits so keys do not look sequential.' },

    { kind: 'sequence', title: 'The redirect path',
      body: 'This is the path that runs 4,000 times a second, so we treat it with respect.',
      actors: ['Browser', 'App server', 'Cache', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'GET /aB3xK9q', note: 'Someone clicks the short link.' },
        { from: 1, to: 2, label: 'get aB3xK9q', note: 'Ask the [[cache]] first. Popular links are asked for again and again, so most lookups should end here.' },
        { from: 2, to: 1, label: 'miss', dashed: true, note: 'Nothing stored yet for this key.' },
        { from: 1, to: 3, label: 'SELECT url WHERE key = …', note: 'Fall back to the database. A primary-key lookup is fast, but we want to avoid doing it a million times for the same link.' },
        { at: 1, label: 'fill the cache', note: 'Store the answer in the cache so the next click is quick. Give it a time limit.' },
        { from: 1, to: 0, label: '302 Location: https://long…', note: 'The server replies with a **redirect** and the browser follows it to the real page.' }
      ] },

    { kind: 'concept', title: '301 or 302? Speed versus knowing',
      body: `The redirect has a status code, and the choice matters.

        - **301 Moved Permanently.** Browsers may remember it. Repeat visits skip your servers entirely: less load, but you never see those clicks, so your statistics undercount.
        - **302 Found (temporary).** The browser asks you every time. More load, but every click passes through you, so you can count it, and you can change or disable the link later.

        If click analytics or the ability to switch off a link matter, 302 is the usual choice. If you only care about saving load, 301 wins. Notice this is a *product* decision wearing a technical costume.` },

    { kind: 'diagram', title: 'Version 2: cache, analytics and guards',
      body: 'We add what the numbers demanded, and nothing more.',
      nodes: [
        { id: 'c', label: 'Browser', icon: '🌐', x: 1, y: 0 },
        { id: 'rl', label: 'Rate limiter', icon: '🚦', x: 0, y: 1, tone: 'warn' },
        { id: 'app', label: 'App servers', icon: '🖥️', x: 1, y: 1, tone: 'accent' },
        { id: 'cache', label: 'Cache', icon: '⚡', x: 2, y: 2, tone: 'good' },
        { id: 'db', label: 'Database + replicas', icon: '🗄️', x: 1, y: 3, tone: 'info' },
        { id: 'q', label: 'Click queue', icon: '📬', x: 2, y: 1 },
        { id: 'an', label: 'Analytics store', icon: '📊', x: 2, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'c', to: 'rl' },
        { from: 'rl', to: 'app', label: 'allowed' },
        { from: 'app', to: 'cache', label: 'read first', both: true },
        { from: 'app', to: 'db', label: 'on a miss' },
        { from: 'app', to: 'q', label: 'click event', dashed: true },
        { from: 'q', to: 'an', label: 'counted later', dashed: true }
      ],
      caption: 'Analytics rides on a queue, so counting a click can never slow the redirect down. Reads can go to replicas because links almost never change.' },

    { kind: 'pitfall', title: 'Your domain, their crime',
      body: `A short link hides its destination, which is exactly what a scammer wants. If your service happily redirects to phishing pages, **your domain’s reputation** (and then email providers and browsers) turns against you.

        Basic defences:

        - **Validate** the URL: only \`http\` and \`https\`, never \`javascript:\` or similar.
        - **Rate limit** link creation per user or IP so nobody mass-produces spam links.
        - **Check** destinations against known-bad lists, and let people report a link.
        - Keep the ability to **disable** a key quickly (one more reason to prefer 302).

        You cannot stop everything. You can make abuse expensive and removal quick.` }
  ],

  activities: [
    { type: 'estimate', after: 1, q: 'We expect 100 million new short links a month. Roughly how many new links is that per second, on average? (A month is about 2.6 million seconds.)',
      answer: 40, unit: 'links per second', tolerance: 2,
      explain: '100,000,000 ÷ 2,600,000 is about 38, so roughly 40 per second. Tiny next to the redirects: with 100 clicks per link, that is about 4,000 per second. The ratio tells you where to spend your effort.' },

    { type: 'mcq', after: 5, q: 'Your team picks a plain counter for keys: each new link gets the next number (1,000 then 1,001), written in base62. What is the main weakness of this choice?',
      options: ['Keys can be guessed by counting, exposing private-looking links', 'Two different links will often be given the same key', 'The keys become too long to fit in a URL', 'The database cannot store numbers that large'],
      answer: 0,
      why: [null, 'A counter never repeats a number, so collisions are not the issue. That is the weakness of hash-and-chop.', 'Seven base62 characters hold about 3.5 trillion values, far more than needed.', 'Numbers that size are routine for any database.'],
      explain: 'A counter is unique but predictable. If links should be unguessable you either scramble the number or use random keys. Scaling the single counter is a second problem, usually solved by giving each server a block of numbers.' },

    { type: 'tf', after: 7, statement: 'Using a 301 redirect instead of a 302 reduces load on your servers, but it can make your click statistics undercount.', answer: true,
      explain: 'Browsers can remember a 301 and skip your service on repeat visits. That saves traffic, but those clicks never reach you to be counted.' },

    { type: 'order', prompt: 'Put the redirect path in order, from click to landing page.',
      items: ['The browser requests the short link', 'The app server checks the cache for the key', 'On a miss, the database is asked for the long URL', 'The result is stored in the cache for next time', 'The server replies with a redirect to the long URL'],
      explain: 'Cheapest check first (the cache), then the source of truth, then remember the answer. The redirect goes out last, with analytics counted off to the side.' },

    { type: 'bucket', prompt: 'Which part of the design does each need belong to?', buckets: ['Redirect path (must be fast)', 'Off the hot path (can be slow)'],
      items: [['Looking up the long URL for a key', 0], ['Counting clicks per country', 1], ['Checking the cache before the database', 0], ['Scanning new links for phishing', 1], ['Building the weekly stats email', 1], ['Replying with the redirect', 0]],
      explain: 'Anything the clicking person waits for is on the hot path and gets cached, indexed and kept simple. Anything they do not wait for (stats, scanning, emails) goes through a queue or a background job.' },

    { type: 'scenario', title: 'The link that went viral',
      intro: 'You run the shortener. A celebrity posts one short link to 20 million followers. Traffic to that single key is about to jump from a trickle to tens of thousands of requests a second.',
      meters: { 'speed': 80, 'database health': 90, 'click accuracy': 90 },
      steps: [
        { text: 'The first wave hits. Every request asks the database for the same one row. What do you do?',
          choices: [
            { label: 'Serve that key from the cache, with a sensible expiry', score: 2, effects: { 'database health': 5 }, feedback: 'One database read fills the cache and thousands of requests are then answered from memory. A hot key is the cache’s best case.' },
            { label: 'Add more database servers right now', score: 1, effects: { 'database health': -10, 'speed': -10 }, feedback: 'Slow and costly, and every extra read still hits the same row. You are solving a repeated-question problem with more answerers.' },
            { label: 'Ask the celebrity to post a different link', score: 0, effects: { 'speed': -20, 'database health': -30 }, feedback: 'The tweet is already out. Meanwhile the database keeps melting.' }
          ] },
        { text: 'Counting every click directly in the database would now mean tens of thousands of writes per second. How do you keep the stats?',
          choices: [
            { label: 'Publish a click event to a queue and let a worker count in batches', score: 2, effects: { 'click accuracy': 5, 'speed': 5 }, feedback: 'The redirect stays quick and the counter catches up a few seconds later. Real-time-to-the-second is rarely worth slowing every user.' },
            { label: 'Increment a counter in the main database before each redirect', score: 0, effects: { 'speed': -30, 'database health': -30 }, feedback: 'Every click now pays for a write on the busiest row in your system. The redirect crawls and the database locks up.' },
            { label: 'Stop counting clicks until the spike ends', score: 1, effects: { 'click accuracy': -40 }, feedback: 'You protect the site, but you throw away the data your customer cares about most during their biggest moment.' }
          ] },
        { text: 'Next day, you learn the link pointed to a scam page and the owner wants it dead. The key is cached in many places. What is the best setup to have had in place?',
          choices: [
            { label: 'A 302 redirect and a short cache lifetime, plus a way to evict a key', score: 2, effects: { 'speed': 0 }, feedback: 'You can disable the link in the database, evict the cache entry, and no browser has memorised the destination.' },
            { label: 'A 301 so browsers remember it and do the work for you', score: 0, effects: { 'speed': 10, 'click accuracy': -20 }, feedback: 'Great for load, awful here: browsers that cached the 301 keep sending victims to the scam page and you cannot reach them.' },
            { label: 'Never cache anything, so changes are instant', score: 1, effects: { 'speed': -25, 'database health': -20 }, feedback: 'Changes would be instant, but you would have given up the very thing that survived the viral spike.' }
          ] }
      ],
      outro: 'Pattern: **protect the hot path**. Cache what is read often, queue what can wait, and keep an off-switch for what could go wrong.' },

    { type: 'cloze', text: 'A {{base62}} key of seven characters allows about 3.5 trillion values. Hashing a URL and keeping a few characters risks a {{collision}}, so the service must detect it and {{retry}} with a different key.',
      distractors: ['checksum', 'redirect', 'shard'],
      explain: 'Base62 is compact and URL-friendly. Truncating a hash throws away information, so two URLs can share a key; the fix is to check the table and try again with a salt or a fresh key.' },

    { type: 'mcq', q: 'Which single change most reduces the load on the database for a read-heavy service like this?',
      options: ['A cache in front, so popular keys come from memory', 'Making the short keys one character longer', 'Switching every redirect from 302 to 200', 'Storing the long URLs in uppercase'],
      answer: 0,
      why: [null, 'Key length changes how many links fit, not how many reads happen.', 'A 200 would show a page instead of redirecting; it is not a redirect at all.', 'Case has no effect on load.'],
      explain: 'With 100 reads for every write, and a few links getting most of the traffic, a cache absorbs the bulk of the reads. The database then mostly serves misses and new links.' },

    { type: 'explain', prompt: 'A colleague says: "Why not just make every redirect a 301, so we use less bandwidth?" Explain the trade-off to them in your own words.',
      model: 'A 301 tells browsers to remember the destination, so repeat visits skip our servers. That saves load but we never see those clicks, so analytics undercount, and we cannot easily change or disable the link because browsers have cached the answer. A 302 sends every click through us, which costs more but keeps stats accurate and lets us switch a link off, for example if it turns out to be a scam.',
      keywords: ['301', '302', 'cache', 'analytics', 'disable', 'every click'] }
  ],

  flashcards: [
    { q: 'Why does a URL shortener get designed around its read:write ratio?', a: 'Far more people click links than create them (say 100:1), so the redirect path must be cheap, cached and available; creation can be slower.' },
    { q: 'Three ways to generate short keys, and the catch with each?', a: 'Hash and chop (collisions), a counter in base62 (guessable, and the counter is a bottleneck), random plus a check (an extra lookup per write).' },
    { q: 'Seven base62 characters give roughly how many keys?', a: 'About 3.5 trillion (62 to the power 7), far more than the billions of links we expect.' },
    { q: '301 vs 302 for a redirect?', a: '301 is permanent and browsers may cache it (less load, undercounted clicks). 302 is temporary: every click reaches you, so you can count and change it.' },
    { q: 'How do you keep analytics from slowing the redirect?', a: 'Publish a click event to a queue and count it asynchronously, off the hot path.' }
  ],

  glossary: [
    { term: 'Base62', def: 'A way of writing numbers using 62 symbols: a–z, A–Z and 0–9. It gives short, URL-safe keys.', like: 'Like counting with a longer alphabet, so the same number needs fewer digits.' },
    { term: 'Short key', def: 'The few characters at the end of a short link that identify one long URL in the lookup table.', like: 'The numbered ticket from a cloakroom.', aka: ['short code', 'slug'] },
    { term: 'Hot key', def: 'One item that suddenly gets a huge share of the traffic, such as a single viral link.', like: 'One shop in a mall that everybody queues for at once.' },
    { term: 'Read-heavy workload', def: 'A system where reads vastly outnumber writes, so caching and replicas pay off.', like: 'A library: many borrowers, few new books.', aka: ['read-heavy'] },
    { term: 'Hot path', def: 'The steps a user waits for on every request. Keep it short; push everything else to background work.', like: 'The till queue, as opposed to the stockroom.' }
  ],

  takeaways: [
    'Start with **requirements and numbers**: the 100:1 read ratio shapes everything.',
    'Keys: **hash** (collisions), **counter** (guessable), **random + check**. Pick for your needs.',
    '**Protect the hot path**: cache reads, queue analytics, rate limit creation.',
    '**301** saves load but hides clicks; **302** keeps control. It is a product choice.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cap-chat', {
  eli5: 'A chat app keeps a live line open to every phone so messages can be pushed the moment they arrive, then stores them in order so nothing is lost if you are offline.',

  cards: [
    { kind: 'concept', title: 'Three tiny promises',
      body: `You type "running late" and press send. Behind that one tap, the app has made three promises:

        1. **It arrives fast.** A second or two, not a minute.
        2. **It arrives in order.** "Running late" must not show up after "see you soon".
        3. **It is not lost, and not doubled.** Even if your phone drops off the network mid-send.

        Those are our core **requirements**. Add the supporting cast: one-to-one chats, group chats, an online/typing indicator, and notifications when the app is closed. Say **500 million people use it daily, about 50 million connected at the same moment**. That number is the one to remember.` },

    { kind: 'metaphor', title: 'The switchboard and the pigeonholes',
      body: `Picture an old hotel. A switchboard operator keeps a line open to every room (the **live connections**). When a call comes in, the operator patches it through immediately.

        If the guest is out, the operator writes a note and drops it in their **pigeonhole** (the stored messages). When the guest returns, they ask at the desk: "Anything for me?"

        A chat system is exactly that pair: live lines for the present, durable storage for the past. Where it stops being true: the hotel has one operator; ours has thousands, and they must know which one is holding each guest’s line.` },

    { kind: 'diagram', title: 'Version 1: connections, then storage',
      body: 'Clients hold a [[WebSocket]] open to a gateway. A message service sits behind the gateways.',
      nodes: [
        { id: 'a', label: 'Alice’s phone', icon: '📱', x: 0, y: 0 },
        { id: 'b', label: 'Bob’s phone', icon: '📱', x: 2, y: 0 },
        { id: 'g1', label: 'Gateway 1', icon: '🔌', x: 0, y: 1, tone: 'accent' },
        { id: 'g2', label: 'Gateway 2', icon: '🔌', x: 2, y: 1, tone: 'accent' },
        { id: 'ms', label: 'Message service', icon: '🧠', x: 1, y: 2 },
        { id: 'db', label: 'Message store', icon: '🗄️', x: 1, y: 3, tone: 'info' }
      ],
      edges: [
        { from: 'a', to: 'g1', label: 'WebSocket', both: true },
        { from: 'b', to: 'g2', label: 'WebSocket', both: true },
        { from: 'g1', to: 'ms' },
        { from: 'ms', to: 'g2', label: 'deliver', dashed: true },
        { from: 'ms', to: 'db', label: 'save' }
      ],
      caption: 'Plain HTTP is a poor fit: the server cannot speak first. A WebSocket stays open in both directions, so the server can push a message the instant it exists. 50 million connections at about 100,000 each is roughly 500 gateway machines.' },

    { kind: 'sequence', title: 'Sending one message',
      body: 'Alice messages Bob. Notice the order: save first, deliver second.',
      actors: ['Alice', 'Gateway + service', 'Message store', 'Bob'],
      steps: [
        { from: 0, to: 1, label: 'send "running late" (id: m-91)', note: 'The app invents a unique **client message ID** before sending. You will see why in a moment.' },
        { from: 1, to: 2, label: 'append to chat #7', note: 'The message is **stored first**. If anything crashes after this point, the message is safe.' },
        { from: 1, to: 0, label: 'ack: saved (seq 412)', dashed: true, note: 'Alice sees one tick: the server has it. It also learns the message’s place in the chat: number 412.' },
        { from: 1, to: 3, label: 'push "running late" (seq 412)', note: 'The service finds the gateway holding Bob’s connection and pushes it down the open line.' },
        { from: 3, to: 1, label: 'ack: delivered', dashed: true, note: 'Bob’s phone confirms. Alice now sees two ticks.' }
      ] },

    { kind: 'concept', title: 'Ordering: use a counter, not a clock',
      body: `You might sort messages by the time each phone says it sent them. Bad idea: phone clocks disagree by seconds, or are simply wrong.

        Instead, the server gives every message a **sequence number within its conversation**: 411, 412, 413… The number comes from one place per chat, so there is no argument about who is first. We only need order *inside* a conversation, not across the whole planet, which makes it cheap: each chat can be handled independently.

        Now the "not doubled" promise. Networks fail, so apps **retry**. The client message ID makes the retry harmless: if the server sees *m-91* twice, it stores one copy and replays the same ack. This is "at least once delivery plus de-duplication", or **exactly-once-ish**.` },

    { kind: 'compare', title: 'Where do the messages live?',
      body: 'Messages are written constantly, read in time order, and almost always fetched for one conversation at a time.',
      cols: ['Single relational database', 'Partitioned store keyed by chat'],
      rows: [
        ['Fits the access pattern', 'Works, until one table holds trillions of rows', 'Excellent: all of one chat’s messages sit together, sorted by sequence'],
        ['Scaling writes', 'Painful: you must [[shard|Sharding]] it yourself', 'Built in: chats spread across machines'],
        ['Rich queries and joins', 'Strong', 'Weak: design for the few queries you need'],
        ['Good for', 'Small and medium apps, early on', 'Huge message volumes and simple reads: "last 50 of chat 7"']
      ],
      note: 'Search across your history is a different job. It usually lives in a separate search index, fed from the store.' },

    { kind: 'concept', title: 'Presence and typing: cheap, short-lived, disposable',
      body: `"Online" and "Alice is typing…" feel like messages but behave very differently. They are **ephemeral**: worthless a few seconds later, and nobody minds if one is lost.

        So they skip the durable store entirely. A connected phone sends a tiny **heartbeat** every so often; if the beats stop, the person is marked offline. Presence lives in fast memory (a cache), usually with an expiry.

        The danger is volume. If you had 500 friends and every one of them announced each blink, presence updates would swamp the system. So we **throttle**: send "typing" at most every few seconds, and only tell people who are actually looking at that chat.` },

    { kind: 'steps', title: 'When Bob is offline',
      body: 'The pigeonhole in action. Tap through.',
      steps: [
        { title: '1. No live line', body: 'The service looks up Bob and finds no open connection. The message is already saved in the chat, so nothing is lost.' },
        { title: '2. Wake his phone', body: 'The service asks the phone makers’ **push services** (Apple’s and Google’s) to show a notification. These can reach a phone even when your app is closed. Keep the text minimal, since it passes through third parties.' },
        { title: '3. Bob opens the app', body: 'The phone reconnects and says: "my last seen message in chat #7 was 410."' },
        { title: '4. Catch up', body: 'The server replies with everything after 410, in order. This "give me what I missed" call is the safety net behind everything else, which is why sequence numbers matter.' }
      ] },

    { kind: 'pitfall', title: 'Groups: one message, many deliveries',
      body: `A message to a group is **one write, many deliveries**. Store it once in the chat; then push it to every member’s connection and send notifications to the offline ones.

        For a family group of five, trivial. For a group of 100,000 it is a burst of 100,000 deliveries per message, so teams often cap group size, deliver in batches, or send only a light "new messages" nudge to huge groups and let the app fetch.

        The mistake is copying the full message into every member’s own inbox. It makes reads easy but multiplies storage and writes by group size. Store once, deliver many.` }
  ],

  activities: [
    { type: 'tf', after: 2, statement: 'A chat server can push a new message to a phone over a plain HTTP request/response, because the server can reply whenever it likes.', answer: false,
      explain: 'In HTTP the client speaks first and the server only replies. To push without being asked you need a persistent connection such as a WebSocket (or fall back to polling, which is slower and costlier).' },

    { type: 'order', after: 3, prompt: 'Put the life of one chat message in order.',
      items: ['The app creates a unique message ID and sends it', 'The server stores the message and gives it a sequence number', 'The server acknowledges the sender (one tick)', 'The server pushes it to the recipient’s connection', 'The recipient’s phone confirms (two ticks)'],
      explain: 'Save before you deliver. If the server pushed first and crashed before saving, the recipient would have a message the sender’s history says never existed.' },

    { type: 'mcq', after: 4, q: 'Alice’s phone sends "ok" but the reply is lost, so the app retries the same message. How does the server avoid showing "ok" twice?',
      options: ['It recognises the same client message ID and stores only one copy', 'It compares the phone’s timestamps and drops the later one', 'It refuses all retries for ten minutes', 'It asks the recipient whether they already got it'],
      answer: 0,
      why: [null, 'Phone clocks are unreliable, and two genuine messages could carry similar times.', 'Refusing retries would turn every network blip into a lost message.', 'The recipient may not even be online, and this puts the burden on the wrong party.'],
      explain: 'A unique ID per message turns a retry into an idempotent request (the idea from the HTTP lessons). The server sees a repeat, stores nothing new and just replays the ack.' },

    { type: 'estimate', q: 'About 50 million people are connected at once. One tuned gateway server can hold roughly 100,000 open connections. About how many gateway servers do you need?',
      answer: 500, unit: 'servers', tolerance: 2,
      explain: '50,000,000 ÷ 100,000 = 500. Add spare capacity for failures and peaks. Idle connections are cheap; what costs money is the messages flowing through them.' },

    { type: 'bucket', prompt: 'Must it be saved durably, or can it be lost without harm?', buckets: ['Store durably', 'Ephemeral is fine'],
      items: [['The text of a message', 0], ['"Alice is typing…"', 1], ['A photo sent in a chat', 0], ['"Bob was last online 2 minutes ago"', 1], ['The sequence number of each message', 0], ['A heartbeat ping from a phone', 1]],
      explain: 'If the user would be upset when it vanished, store it. If it is stale in seconds and cheap to recompute, keep it in fast memory with an expiry.' },

    { type: 'match', prompt: 'Match each problem with the chat design that solves it.',
      pairs: [['Phone clocks disagree', 'Server-assigned sequence number per chat'], ['A retry might duplicate a message', 'Unique client message ID'], ['Recipient’s app is closed', 'Push notification via Apple or Google'], ['Phone was offline for an hour', 'Sync everything after the last seen number'], ['Typing events flood the system', 'Throttle and tell only people viewing the chat']] },

    { type: 'scenario', title: 'Group chat for 50,000',
      intro: 'Your chat app is growing. A university wants to use it for a single group chat with 50,000 students. Early tests show messages arriving ten seconds late and servers struggling.',
      meters: { 'delivery speed': 60, 'cost': 70, 'reliability': 80 },
      steps: [
        { text: 'Every message in the big group triggers 50,000 deliveries at once. What is your first move?',
          choices: [
            { label: 'Store each message once, then fan out deliveries in parallel batches', score: 2, effects: { 'delivery speed': 20, 'cost': -5 }, feedback: 'One write, many pushes, spread over many workers. Storage stays small and delivery speeds up.' },
            { label: 'Write a copy of every message into each student’s personal inbox', score: 0, effects: { 'cost': -30, 'reliability': -20 }, feedback: 'You have multiplied storage and write load by 50,000. One chatty minute becomes millions of writes.' },
            { label: 'Ban the group', score: 1, effects: { 'reliability': 5, 'cost': 5 }, feedback: 'It protects the system but you lose a big customer. Look for the engineering answer first.' }
          ] },
        { text: 'Most of the 50,000 are offline at any moment. What should happen for them?',
          choices: [
            { label: 'Save the message once; they sync everything after their last seen number when they open the app', score: 2, effects: { 'reliability': 10, 'cost': 10 }, feedback: 'Offline members cost nothing until they return. The sync call is the same safety net as for one-to-one chats.' },
            { label: 'Keep retrying the push to every offline phone until it answers', score: 0, effects: { 'cost': -25, 'delivery speed': -20 }, feedback: 'Thousands of workers hammer unreachable phones and block the people who are online.' },
            { label: 'Send each offline student a full push notification with the message text', score: 1, effects: { 'cost': -10 }, feedback: 'For 50,000 members this floods phones, and the push services may rate limit you. A summary nudge such as "20 new messages" is kinder.' }
          ] },
        { text: 'Typing indicators now fire constantly in the big group. What do you do?',
          choices: [
            { label: 'Switch typing indicators off for very large groups', score: 2, effects: { 'delivery speed': 10, 'cost': 10 }, feedback: 'With 50,000 members, "someone is typing" is permanent noise anyway. Many real apps drop the feature at that size.' },
            { label: 'Store every typing event so none are lost', score: 0, effects: { 'cost': -20, 'reliability': -10 }, feedback: 'You are paying for durable storage of data that is useless a few seconds later.' },
            { label: 'Send typing events to all 50,000 as they happen', score: 1, effects: { 'delivery speed': -15, 'cost': -10 }, feedback: 'It works for small groups. At this size every keystroke becomes a mass broadcast.' }
          ] }
      ],
      outro: 'Lesson from the scenario: **a design that is fine at 5 can fail at 50,000**. Ask what changes as the group grows, and spend durable effort only where users would notice a loss.' },

    { type: 'short', q: 'To catch up after reconnecting, the phone tells the server the number of the last message it saw. What kind of number is it, as in "last-seen ... number"? (one word)', accept: ['sequence', 'sequence number', 'seq'], hint: 'Chat #7 messages are numbered 411, 412, 413…',
      explain: 'The **sequence number** is the bookmark. "Give me everything after 410" is simple, cheap and exact, and it works no matter how long the phone was away.' },

    { type: 'explain', prompt: 'Explain to a friend why chat apps save a message *before* delivering it, and what the two ticks mean.',
      model: 'If the server delivered a message and then crashed before saving it, the recipient would see something the sender’s history had lost. So the server saves first, then tells the sender "saved" (one tick), then pushes it to the recipient. When the recipient’s phone confirms it arrived, the sender gets the second tick. Saved-first means a crash can delay a message but never lose it.',
      keywords: ['save', 'before', 'crash', 'ack', 'tick', 'delivered'] }
  ],

  flashcards: [
    { q: 'Why does a chat app use WebSockets rather than plain HTTP?', a: 'A WebSocket stays open in both directions, so the server can push a message the moment it arrives instead of waiting to be asked.' },
    { q: 'How do you order messages in a chat reliably?', a: 'Give each message a server-assigned sequence number within its conversation. Do not trust phone clocks.' },
    { q: 'How does a chat app avoid duplicate messages on retry?', a: 'Each message carries a unique client-generated ID. The server stores one copy per ID and replays the ack on repeats.' },
    { q: 'How do presence and typing indicators differ from messages?', a: 'They are ephemeral: kept in fast memory with expiry, driven by heartbeats and throttled, never stored durably.' },
    { q: 'What happens when the recipient is offline?', a: 'The message is already stored. A push notification wakes the phone; on reconnect it asks for everything after its last seen sequence number.' }
  ],

  glossary: [
    { term: 'Gateway', def: 'A server whose job is to hold clients’ open connections and pass messages to and from the services behind it.', like: 'The switchboard operator in the hotel.' },
    { term: 'Sequence number', def: 'A counter assigned by the server to each message in a conversation, giving every message a definite place in the order.', like: 'The numbered tickets at a deli counter.' },
    { term: 'Heartbeat', def: 'A tiny regular signal sent to say "I am still here". When the signals stop, the sender is treated as gone.', like: 'Tapping the microphone to check it is on.' },
    { term: 'Push notification', def: 'A message delivered to a phone through Apple’s or Google’s service, even when the app is closed.', like: 'A postcard through the door while you are out.' },
    { term: 'Fan-out', def: 'Turning one event into many deliveries, such as one group message going to every member.', like: 'One teacher announcement read out to every classroom.' }
  ],

  takeaways: [
    'Live **WebSocket** lines for the present, a **durable store** for the past.',
    '**Save first, deliver second.** Order with a per-chat **sequence number**, not clocks.',
    'A **client message ID** makes retries harmless: exactly-once-ish.',
    'Presence and typing are **ephemeral**. Groups are one write, many deliveries.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cap-news-feed', {
  eli5: 'A news feed shows you the latest posts from the people you follow. The clever part is deciding whether to build each person’s feed when someone posts, or when you open the app.',

  cards: [
    { kind: 'concept', title: 'Fifty million followers, one tap',
      body: `You open the app and see a list of posts from people you follow, newest and most interesting first. It loads in under a second. Easy.

        Now picture a famous singer who has **50 million followers**. She taps Post. Every one of those 50 million feeds should now include her photo, and most of those people will check within the hour.

        This lesson is about one decision: **when do we do the work of building each feed?** When someone posts, or when someone looks? Our requirements: a feed that loads fast, includes new posts within seconds or a minute (not instantly), works for ordinary users and celebrities, and can be scrolled for ever.` },

    { kind: 'metaphor', title: 'The newspaper round',
      body: `Two ways to get everyone their paper:

        - **Deliver to every doorstep.** When the paper is printed, a van drops one copy at each house. Reading is instant, but printing day is a huge job.
        - **Everyone visits the newsagent.** Nothing is delivered. When you want to read, you walk in and the newsagent gathers today’s stories for you. Printing is easy; each visit takes longer.

        Doorstep delivery is **fan-out on write**. The newsagent is **fan-out on read**. Where the metaphor stops: your readers follow different people, so every "paper" is personal.` },

    { kind: 'diagram', title: 'Version 1: build the feed when asked',
      body: 'This is **fan-out on read**: nothing is prepared in advance.',
      nodes: [
        { id: 'u', label: 'You open the app', icon: '📱', x: 1, y: 0 },
        { id: 'f', label: 'Feed service', icon: '🧠', x: 1, y: 1, tone: 'accent' },
        { id: 'g', label: 'Who do I follow?', icon: '👥', x: 0, y: 2, tone: 'info' },
        { id: 'p', label: 'Latest posts of each', icon: '📰', x: 2, y: 2, tone: 'info' }
      ],
      edges: [
        { from: 'u', to: 'f', label: 'GET /feed' },
        { from: 'f', to: 'g', label: '1. follows' },
        { from: 'f', to: 'p', label: '2. their posts' }
      ],
      caption: 'Writes are trivial: a post is saved once. But every feed view asks for the posts of, say, 500 accounts, merges them and sorts them. If you follow lots of people, every refresh is expensive.' },

    { kind: 'diagram', title: 'Version 2: prepare feeds in advance',
      body: 'This is **fan-out on write**: when a post is created, drop it into each follower’s ready-made feed.',
      nodes: [
        { id: 'a', label: 'Author posts', icon: '✍️', x: 1, y: 0 },
        { id: 'w', label: 'Fan-out workers', icon: '⚙️', x: 1, y: 1, tone: 'accent' },
        { id: 'q', label: 'Queue', icon: '📬', x: 2, y: 0, tone: 'muted' },
        { id: 'f1', label: 'Feed list: follower 1', icon: '📋', x: 0, y: 2, tone: 'good' },
        { id: 'f2', label: 'Feed list: follower 2', icon: '📋', x: 1, y: 2, tone: 'good' },
        { id: 'f3', label: 'Feed list: follower 3…', icon: '📋', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'a', to: 'q', label: 'new post' },
        { from: 'q', to: 'w', dashed: true },
        { from: 'w', to: 'f1', label: 'add post ID' },
        { from: 'w', to: 'f2' },
        { from: 'w', to: 'f3' }
      ],
      caption: 'Reading a feed is now one quick lookup. The price is paid at posting time: one post becomes as many small writes as the author has followers.' },

    { kind: 'compare', title: 'Push or pull?',
      body: 'Neither is "right". The shape of your users decides.',
      cols: ['Fan-out on write (push)', 'Fan-out on read (pull)'],
      rows: [
        ['Reading a feed', 'Very fast: a ready list', 'Slower: gather and merge each time'],
        ['Posting', 'Heavy: one write per follower', 'Light: one write'],
        ['Wasted work', 'Feeds built for people who never log in', 'None: only built when asked'],
        ['Freshness', 'Delayed a little by the queue', 'Always current'],
        ['Breaks down when', 'An author has millions of followers', 'Readers follow thousands of accounts']
      ] },

    { kind: 'pitfall', title: 'The celebrity problem',
      body: `Our singer posts. With fan-out on write, that is **50 million feed updates** from a single tap. Suppose your workers manage 10,000 inserts a second: that takes about **83 minutes**, and during that time everyone else’s posts queue behind hers.

        The fix is a **hybrid**:

        - For ordinary accounts, push as usual.
        - For accounts above a follower threshold, do **not** push. Store their posts normally.
        - When you open your feed, the service takes your ready-made list and **merges in** recent posts from the few celebrities you follow, pulled at read time.

        Most people follow a handful of celebrities, so the merge is small. Push for the many, pull for the few.` },

    { kind: 'concept', title: 'Ranking: from "newest" to "best"',
      body: `Sorting by newest is simple, but a feed that shows 400 posts in a row from one chatty friend is a poor feed. Most products **rank** instead.

        The usual shape is two stages:

        1. **Gather candidates**: a few hundred recent posts from your feed list plus the merged-in celebrity posts.
        2. **Score and sort** them with a model that weighs things like how recent the post is, how often you engage with that author, and how popular the post is.

        Ranking costs real time per request, so it works on a short candidate list, not on everything ever posted. Whether to rank at all is also a *product* choice: some people prefer a plain chronological feed, and many apps offer both.` },

    { kind: 'code', title: 'Caching the feed: IDs, not posts',
      body: 'A feed is stored as an ordered list of **post IDs** per user, kept in a fast cache such as [[Redis]]. The full posts are looked up separately. Tap the highlighted lines.',
      code: { lang: 'json', src: `
        {
          "user": "u-8842",
          "feed": [
            "p-9001", "p-8999", "p-8997",
            "p-8990", "p-8982"
          ],
          "keep": 800,
          "ttl_days": 30
        }`,
        notes: {
          4: 'Just IDs: tiny. A post’s text, images and like counts live in their own cache and database, so an edit or a delete happens in **one place**.',
          7: 'Only the newest few hundred entries are kept. Nobody scrolls back through ten thousand posts.',
          8: 'Feeds for people who have not opened the app for a month can be dropped and rebuilt when they return (rebuilding is the pull path).'
        } } },

    { kind: 'concept', title: 'Pagination: do not count, bookmark',
      body: `Infinite scroll loads the feed in pages of 20. The obvious request is \`GET /feed?page=3\` (or "skip 40, give me 20"), called **offset pagination**.

        Here is the trap. While you read page 1, five new posts arrive at the top. Page 2 now begins five posts *earlier* than before, so you see five posts **twice**.

        The fix is **cursor pagination**: the app says "give me 20 posts older than post p-8982". A cursor is a bookmark pointing at an exact post, so new arrivals at the top cannot shift it. It is also cheaper, since the database jumps straight to the bookmark rather than counting past thousands of rows.` }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each approach with its newspaper picture.',
      pairs: [['Fan-out on write', 'A van delivers a copy to every doorstep'], ['Fan-out on read', 'Everyone walks to the newsagent when they want to read'], ['Celebrity merge', 'Deliver for most, but fetch the superstar’s column at the shop'], ['Cursor pagination', 'A bookmark in the paper rather than "page 3"']] },

    { type: 'estimate', after: 5, q: 'An account with 50 million followers posts once. Using fan-out on write, your workers insert into feeds at 10,000 inserts per second. About how many seconds does the fan-out take?',
      answer: 5000, unit: 'seconds', tolerance: 2,
      explain: '50,000,000 ÷ 10,000 = 5,000 seconds, about 83 minutes. That is far too slow for "just posted", and it clogs the queue for everyone else. It is why celebrity posts are fetched at read time instead.' },

    { type: 'mcq', after: 8, q: 'You are on page 1 of a feed and ten new posts arrive. With "skip 20, take 20" paging, what happens when you load page 2?',
      options: ['Ten posts from page 1 appear again at the top of page 2', 'Ten posts are skipped and you never see them', 'The page fails because the offset is wrong', 'Nothing changes: new posts never affect paging'],
      answer: 0,
      why: [null, 'Skipping happens the other way round: if posts are deleted, items can slip past you. New arrivals push old ones down.', 'The request is valid; the data underneath moved.', 'Offsets count from the top of a list that is still changing.'],
      explain: 'New posts shift everything down, so "skip 20" lands ten posts earlier than before. A cursor ("older than this post") anchors to a specific item, so it stays correct while the list grows.' },

    { type: 'bucket', prompt: 'Which strategy suits each account best?', buckets: ['Push into followers’ feeds', 'Pull at read time'],
      items: [['A friend with 150 followers', 0], ['A news site with 30 million followers', 1], ['A local café with 4,000 followers', 0], ['A footballer with 80 million followers', 1], ['A teacher with 300 followers', 0], ['A government account with 10 million followers', 1]],
      explain: 'Push is excellent when the number of followers is modest, so the fan-out is cheap and fast. Above a threshold, pushing costs more than pulling, so those accounts are merged in when someone reads.' },

    { type: 'ab', q: 'Which request loads the next page of a busy, constantly-changing feed more reliably?',
      a: { lang: 'http', label: 'Offset paging', src: `
        GET /feed?offset=40&limit=20` },
      b: { lang: 'http', label: 'Cursor paging', src: `
        GET /feed?before=p-8982&limit=20` },
      answer: 'b',
      explain: 'The cursor names an exact post, so posts arriving at the top cannot move it. An offset counts from the top of a list that is still changing, which creates repeats and gaps.' },

    { type: 'scenario', title: 'Feed day: the launch of a superstar',
      intro: 'Your feed uses fan-out on write for everyone. A global pop star, with 60 million followers, joins your app tomorrow and will post within minutes of arriving.',
      meters: { 'feed freshness': 80, 'cost': 70, 'user experience': 80 },
      steps: [
        { text: 'The workers will have to insert her post into 60 million feeds. What do you do before launch?',
          choices: [
            { label: 'Mark her as a high-fanout account: skip the push and merge her posts in at read time', score: 2, effects: { 'cost': 10, 'feed freshness': 5 }, feedback: 'Her post is stored once and everyone sees it as soon as they open their feed. The queue stays clear for ordinary users.' },
            { label: 'Buy ten times as many workers for launch day', score: 1, effects: { 'cost': -25, 'feed freshness': 5 }, feedback: 'It might work, and you will pay for idle machines forever. The next star will need twenty times as many.' },
            { label: 'Do nothing and see what happens', score: 0, effects: { 'feed freshness': -35, 'user experience': -25 }, feedback: 'Her fan-out clogs the queue for over an hour and everyone’s friends’ posts arrive late too.' }
          ] },
        { text: 'Her fans complain the feed shows only her posts, because they have been tapping refresh. How should ranking help?',
          choices: [
            { label: 'Rank candidates and limit how many posts from one author appear in a row', score: 2, effects: { 'user experience': 20 }, feedback: 'A little diversity in the scoring keeps one prolific author from flooding a feed. It is a product call as much as an engineering one.' },
            { label: 'Switch to purely newest-first', score: 1, effects: { 'user experience': -5 }, feedback: 'Simple and predictable, but that is exactly the flood they are complaining about.' },
            { label: 'Hide her posts from people who refresh too often', score: 0, effects: { 'user experience': -25 }, feedback: 'Punishing the people who most want to see her is a fast route to losing them.' }
          ] },
        { text: 'The feed cache is eating memory. What can you safely trim?',
          choices: [
            { label: 'Keep only the newest few hundred post IDs per user, and drop feeds for people who have not logged in for weeks', score: 2, effects: { 'cost': 20 }, feedback: 'IDs are small, and trimmed or dropped feeds can be rebuilt by the pull path when someone returns.' },
            { label: 'Store full post text in every feed to avoid extra lookups', score: 0, effects: { 'cost': -30 }, feedback: 'You now store 60 million copies of the same post and every edit or deletion must find them all.' },
            { label: 'Turn off the feed cache entirely', score: 1, effects: { 'cost': 10, 'user experience': -30 }, feedback: 'Memory use drops, but every refresh now does the slow gather-and-merge work.' }
          ] }
      ],
      outro: 'Pattern: **treat the extremes differently**. The same system can push for the many and pull for the few.' },

    { type: 'order', prompt: 'Put the steps of a hybrid feed request in order.',
      items: ['Fetch your pre-built list of post IDs from the feed cache', 'Fetch recent posts from the celebrities you follow', 'Merge the two sets into one candidate list', 'Score and rank the candidates', 'Return the first page with a cursor for the next'],
      explain: 'Gather from both sources first, then rank the combined set. The cursor is returned with the page so the next request can pick up exactly where this one stopped.' },

    { type: 'tf', statement: 'Storing each user’s feed as a list of post IDs, rather than copies of the posts, means an edited or deleted post only has to be changed in one place.', answer: true,
      explain: 'The feed holds pointers. When a post is edited, deleted or liked, only the post record changes; the next time a feed is displayed, the fresh version is fetched.' },

    { type: 'explain', prompt: 'Explain the celebrity problem and the hybrid fix to someone who has never heard of fan-out.',
      model: 'If we prepare each follower’s feed when someone posts, a user with 50 million followers causes 50 million writes from a single post, which takes far too long and blocks other users. So for very popular accounts we skip the preparing. When you open your feed, we take your ready-made list and add the recent posts of the few famous people you follow at that moment. Most accounts are pushed, a few are pulled.',
      keywords: ['50 million', 'writes', 'hybrid', 'pull', 'merge', 'read time'] }
  ],

  flashcards: [
    { q: 'Fan-out on write vs fan-out on read?', a: 'On write: when a post is created, add it to every follower’s ready feed (fast reads, heavy writes). On read: gather and merge posts when the feed is opened (light writes, slower reads).' },
    { q: 'What is the celebrity problem and its usual fix?', a: 'Pushing one post to millions of feeds is too slow. Fix: push for ordinary accounts, but pull and merge celebrity posts at read time.' },
    { q: 'What is a feed ranking pipeline in two stages?', a: 'Gather a few hundred candidates, then score and sort them with signals like recency, your engagement with the author and popularity.' },
    { q: 'Why store post IDs in the feed cache instead of whole posts?', a: 'IDs are small, and edits or deletions only have to happen in one place: the post itself.' },
    { q: 'Why is cursor pagination better than offset for feeds?', a: 'New posts shift offsets, causing repeats; a cursor anchors to a specific post and is cheaper for the database.' }
  ],

  glossary: [
    { term: 'Fan-out on write', def: 'Doing the work of delivering a post to each follower’s feed at the moment it is posted.', like: 'A van delivering a paper to every doorstep.', aka: ['push model'] },
    { term: 'Fan-out on read', def: 'Gathering and merging the posts when a user opens their feed, rather than in advance.', like: 'Walking to the newsagent when you want to read.', aka: ['pull model'] },
    { term: 'Celebrity problem', def: 'The trouble that very high-follower accounts cause for fan-out on write, because one post means millions of writes.', like: 'One letter that has to be copied by hand for a whole country.' },
    { term: 'Cursor pagination', def: 'Loading the next page by pointing at a specific item ("older than this one") instead of counting rows to skip.', like: 'A bookmark rather than a page number.', aka: ['keyset pagination'] },
    { term: 'Ranking', def: 'Ordering candidate items by a score of how relevant they are, instead of just by time.', like: 'A shop assistant putting what you probably want on the top shelf.' }
  ],

  takeaways: [
    '**Push** (fan-out on write) makes reads fast; **pull** (on read) makes writes cheap.',
    'The **celebrity problem** is solved with a **hybrid**: push for the many, pull for the few.',
    'Cache **IDs**, rank a **short candidate list**, and page with a **cursor**.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cap-checkout', {
  eli5: 'A checkout has to take your money exactly once and send your parcel exactly once, even when the network drops, the card company is slow, or two people want the last item.',

  cards: [
    { kind: 'concept', title: 'Take the money once, ship the thing once',
      body: `It is the last day of a sale. One pair of trainers is left in your size. Two people click **Buy now** at the same moment, and one of them has a flaky train Wi-Fi connection that will make their phone retry.

        The checkout must not sell the trainers twice. It must not charge anyone twice. It must not charge someone and then ship nothing.

        Requirements: **correctness first** (money and stock), then a checkout that stays up during a sale. Scale is modest compared with a feed (a big sale might see a few thousand orders a minute) but the mistakes are expensive and public. This is a design where **being right beats being fast**.` },

    { kind: 'metaphor', title: 'The cinema seat hold',
      body: `When you book a cinema seat online, the site puts a **ten-minute hold** on it while you enter your card. Nobody else can buy it. If you pay, the hold becomes a ticket. If you wander off, the hold quietly expires and the seat goes back on sale.

        That is the trick for stock: don’t sell and don’t ignore, **reserve**. A reservation is a promise with a time limit.

        Where the metaphor stops: a cinema has one seat per person. A warehouse has 400 pairs of the same trainers, and the system must keep count while many customers are reserving at once.` },

    { kind: 'diagram', title: 'The cast of services',
      body: 'A checkout touches several parts of the business. Each owns its own data, like the services in your architecture lessons.',
      nodes: [
        { id: 'o', label: 'Order service', icon: '🧾', x: 1, y: 0, tone: 'accent' },
        { id: 'i', label: 'Inventory', icon: '📦', x: 0, y: 1, tone: 'info' },
        { id: 'p', label: 'Payment', icon: '💳', x: 1, y: 1, tone: 'info' },
        { id: 's', label: 'Shipping', icon: '🚚', x: 2, y: 1, tone: 'info' },
        { id: 'psp', label: 'Card processor', icon: '🏦', x: 1, y: 2, tone: 'muted' },
        { id: 'n', label: 'Email / notifications', icon: '✉️', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'o', to: 'i', label: 'reserve' },
        { from: 'o', to: 'p', label: 'charge' },
        { from: 'o', to: 's', label: 'ship' },
        { from: 'p', to: 'psp', label: 'authorise', both: true },
        { from: 's', to: 'n', dashed: true }
      ],
      caption: 'The Order service coordinates. The card processor is a third party: a call across the internet we do not control.' },

    { kind: 'code', title: 'Overselling: a race you can see',
      body: 'Two customers reach the code that checks stock at the same moment. Tap the lines to see the trap and the fix.',
      code: { lang: 'sql', src: `
        -- Unsafe: check, then update
        SELECT stock FROM items WHERE id = 7;   -- both see 1
        UPDATE items SET stock = stock - 1 WHERE id = 7;

        -- Safe: one atomic step
        UPDATE items SET stock = stock - 1
        WHERE id = 7 AND stock > 0;
        -- check "rows affected": 1 = got it, 0 = sold out`,
        notes: {
          2: 'Both customers read **1** before either has updated. Each decides it is fine to buy.',
          3: 'Both updates run. Stock goes to **-1** and two orders exist for one pair of trainers. This is a [[race condition]].',
          7: 'The check and the change happen as **one operation**, so the database lets only one of them win.',
          8: 'The loser gets "0 rows affected" and can be told politely: sold out.'
        } } },

    { kind: 'concept', title: 'Reserve now, confirm later',
      body: `Atomic decrement stops overselling, but there is a second problem: do we take the stock when the customer clicks **Add to basket**, or when they pay?

        - Take it at **basket time** and abandoned baskets hold stock hostage.
        - Take it only **after payment** and a customer may pay for something that has just sold out.

        The standard answer is the cinema hold: **reserve at checkout start with an expiry**, say ten minutes. If payment succeeds the reservation becomes a sale. If not, a timer releases the stock. Even a limited-stock flash sale can run on this, with the reservation done by an atomic step like the one above.` },

    { kind: 'sequence', title: 'Charging a card without charging twice',
      body: 'The payment call can fail in the worst possible way: we do not know if it worked.',
      actors: ['Order service', 'Payment service', 'Card processor'],
      steps: [
        { from: 0, to: 1, label: 'charge £60 (key: ord-5521)', note: 'The key is built from the order, so the same order always carries the same key.' },
        { from: 1, to: 2, label: 'charge £60 (key: ord-5521)', note: 'The payment service passes the key on to the card processor.' },
        { from: 2, to: 1, label: 'timeout…', dashed: true, note: 'The processor *did* take the money, but the reply was lost. We cannot tell the difference between "failed" and "worked".' },
        { from: 1, to: 2, label: 'retry (same key: ord-5521)', note: 'So we retry with the **same idempotency key**.' },
        { from: 2, to: 1, label: 'paid (the original result)', note: 'The processor sees a repeat key and replays its first answer instead of charging again.' },
        { from: 1, to: 0, label: 'paid', note: 'One order, one charge, however many retries.' }
      ] },

    { kind: 'steps', title: 'The order saga',
      body: 'Each service has its own database, so there is no single transaction across them. Instead the Order service runs a **saga**: a series of local steps, each with an undo. Tap through.',
      steps: [
        { title: '1. Reserve the stock', body: 'Inventory holds the items for ten minutes. **Undo:** release the reservation.' },
        { title: '2. Take the payment', body: 'Payment charges the card with an idempotency key. **Undo:** refund the money.' },
        { title: '3. Create the shipment', body: 'Shipping books the courier and allocates the warehouse pick. **Undo:** cancel the shipment.' },
        { title: '4. Confirm and notify', body: 'Mark the order **confirmed**, turn the reservation into a sale and send the receipt. If any earlier step fails, run the undo for each completed step **in reverse order**: refund, then release.' }
      ] },

    { kind: 'compare', title: 'Consistency or availability, per part',
      body: 'During a network problem you cannot have both perfect consistency and perfect availability. Different parts of checkout choose differently.',
      cols: ['Choose strict correctness', 'Choose staying available'],
      rows: [
        ['Taking payment', 'Yes: never charge twice, never lose a charge', 'Never risk a double charge to stay "up"'],
        ['Reserving the last item', 'Yes: one buyer wins, the other is told', 'Selling it twice and apologising is costly'],
        ['Browsing the catalogue', 'Not needed', 'Yes: a slightly stale page is harmless'],
        ['"Only 3 left" label', 'Not needed', 'Yes: approximate is fine; exact is checked at reserve time'],
        ['The basket itself', 'Rarely', 'Yes: let people add things even if something is degraded']
      ],
      note: 'Some retailers deliberately oversell a little and apologise, because a few cancelled orders cost less than lost sales. That is a business decision; the architecture should make it a choice, not an accident.' },

    { kind: 'pitfall', title: 'Charged, but no order',
      body: `The scariest bug: the card is charged, then the server crashes before the order is saved. The customer has paid for nothing.

        Defences, layered:

        - Save the order as **pending** *before* calling the card processor, so there is always a record of intent.
        - Listen for the processor’s **webhook** (a message it sends you when a payment settles), and process it idempotently, because webhooks are delivered more than once.
        - Run a **reconciliation job**: every so often compare your pending orders with the processor’s records and fix any that disagree.
        - Show an honest state to the customer: "Payment processing…" is better than a spinner that never ends.` }
  ],

  activities: [
    { type: 'spot', after: 3, prompt: 'This stock check is meant to prevent overselling. Tap the line that makes the race possible.',
      code: { lang: 'js', src: `
        const item = await db.getItem(7);
        if (item.stock > 0) {
          await db.setStock(7, item.stock - 1);
          createOrder(7);
        } else {
          showSoldOut();
        }` },
      lines: [2, 3],
      explain: 'The check (line 2) and the update (line 3) are separate steps, so two requests can both pass the check before either updates. The fix is a single atomic update with a condition such as "WHERE stock > 0".' },

    { type: 'mcq', after: 5, q: 'The card processor times out on your charge request. What is the safest next step?',
      options: ['Retry using the same idempotency key', 'Retry with a fresh key so the processor treats it as new', 'Mark the order failed and email the customer', 'Charge a smaller amount just in case'],
      answer: 0,
      why: [null, 'A new key means a new charge. If the first one went through, the customer is now billed twice.', 'The first charge may have succeeded, so you might fail an order the customer already paid for.', 'That would create a mismatch between order total and money taken.'],
      explain: 'You cannot tell a lost request from a lost reply. Retrying with the **same key** is safe in both cases: if the first worked, the processor replays the result; if not, it processes it now.' },

    { type: 'order', after: 6, prompt: 'A saga fails at the shipping step after stock was reserved and the card charged. Put the recovery in order.',
      items: ['Shipping reports it cannot create the shipment', 'The Order service marks the order as failing', 'Payment refunds the customer', 'Inventory releases the reserved stock', 'The customer is told what happened'],
      explain: 'Undo completed steps in reverse order: the last thing done is the first undone. Telling the customer comes last, once you know the true final state.' },

    { type: 'bucket', prompt: 'Which choice does each situation call for?', buckets: ['Strict correctness', 'Stay available'],
      items: [['Deducting stock for a paid order', 0], ['Showing the product page during a database blip', 1], ['Recording that a card was charged', 0], ['Adding an item to the basket when a service is slow', 1], ['The "people viewing this now" counter', 1], ['Deciding who got the last pair', 0]],
      explain: 'Anything involving money or a unique resource must be right even if it means a delay or an error message. Anything that is only informational or can be fixed later should keep working.' },

    { type: 'match', prompt: 'Match each saga step with the undo that compensates for it.',
      pairs: [['Reserve stock', 'Release the reservation'], ['Charge the card', 'Refund the payment'], ['Book the courier', 'Cancel the shipment'], ['Send the confirmation email', 'Send a correction (it cannot be unsent)']],
      explain: 'Each step needs a compensating action because there is no all-or-nothing transaction across services. Some steps, like sending an email, cannot truly be undone, which is why they come last.' },

    { type: 'scenario', title: 'The flash sale',
      intro: 'Tonight your shop sells 500 limited-edition sneakers at 8 p.m. Last time the site crashed, some people were charged twice, and 40 orders were taken for stock that did not exist.',
      meters: { 'customer trust': 60, 'money correctness': 80, 'site uptime': 70 },
      steps: [
        { text: 'How do you stop overselling when thousands click at once?',
          choices: [
            { label: 'Reserve each pair with an atomic decrement and a ten-minute expiry', score: 2, effects: { 'money correctness': 15, 'customer trust': 10 }, feedback: 'Exactly 500 reservations can exist. Anyone after that gets an honest sold-out message, and abandoned reservations return to the pool.' },
            { label: 'Check the stock count, then deduct it after payment', score: 0, effects: { 'money correctness': -30, 'customer trust': -25 }, feedback: 'Thousands of people pass the check together and 500 pairs become 800 orders. You are back to last time.' },
            { label: 'Lock the whole checkout so one customer is served at a time', score: 1, effects: { 'site uptime': -30, 'money correctness': 10 }, feedback: 'Correct, but it makes a queue of one for the whole internet. The site falls over from waiting.' }
          ] },
        { text: 'Customers on bad connections tap Pay several times and the app retries on timeout. How do you prevent double charges?',
          choices: [
            { label: 'Derive an idempotency key from the order and send it to the card processor on every attempt', score: 2, effects: { 'money correctness': 20, 'customer trust': 10 }, feedback: 'Repeat taps and retries all carry the same key, so there is one charge per order.' },
            { label: 'Disable the Pay button for a few seconds after a tap', score: 1, effects: { 'money correctness': 5 }, feedback: 'Handy for double taps, but it does nothing for the app’s own automatic retries or a user refreshing the page.' },
            { label: 'Hope the card processor deduplicates for you', score: 0, effects: { 'money correctness': -25, 'customer trust': -20 }, feedback: 'Processors only deduplicate when you give them a key to recognise. Without one, every request is a new charge.' }
          ] },
        { text: 'The payment succeeds but your shipping service is down. What should the order do?',
          choices: [
            { label: 'Keep the order paid and pending, retry shipping with backoff, and refund if it cannot be fixed', score: 2, effects: { 'customer trust': 10, 'site uptime': 10 }, feedback: 'A shipping outage is usually short. Retrying keeps the sale; the refund is the compensation if retries run out.' },
            { label: 'Tell the customer the order failed and keep the money until it is sorted', score: 0, effects: { 'customer trust': -35, 'money correctness': -20 }, feedback: 'Holding money for an order you reported as failed is a trust and legal problem.' },
            { label: 'Refund immediately and cancel the order', score: 1, effects: { 'customer trust': -10 }, feedback: 'Safe, but a customer loses their pair over a few minutes of downtime that a retry would have covered.' }
          ] }
      ],
      outro: 'Pattern: **reserve atomically, make every money call repeatable, and design the undo before you need it.**' },

    { type: 'tf', statement: 'Because a payment webhook may be delivered more than once, the code that handles it should be safe to run twice.', answer: true,
      explain: 'Delivery of webhooks is "at least once". Handling the same event twice must not, for example, ship two parcels, so the handler checks whether it has already processed that event ID.' },

    { type: 'short', q: 'What name is given to a series of local steps across services, each with an undo, used instead of one big transaction?', accept: ['saga', 'the saga', 'order saga', 'sagas', 'saga pattern'], hint: 'A long story of adventures.',
      explain: 'A **saga** replaces the all-or-nothing transaction with a chain of steps and compensating actions that run in reverse if something fails.' }
  ],

  flashcards: [
    { q: 'How do you stop two customers buying the last item?', a: 'Reserve it with a single atomic update (decrement only if stock is above zero), checking the rows affected. Never check and update as separate steps.' },
    { q: 'What is a stock reservation?', a: 'A time-limited hold taken at checkout start. Payment turns it into a sale; if the timer runs out, the stock is released.' },
    { q: 'How do you make a payment retry safe?', a: 'Send the same idempotency key on every attempt. The processor replays the first result instead of charging again.' },
    { q: 'What is an order saga?', a: 'A sequence of local steps (reserve, charge, ship, confirm), each with a compensating undo (release, refund, cancel) that runs in reverse on failure.' },
    { q: 'Which parts of checkout should favour correctness over availability?', a: 'Payments and unique stock reservations. Browsing, labels like "3 left" and the basket can favour staying available.' }
  ],

  glossary: [
    { term: 'Overselling', def: 'Accepting more orders than there is stock, usually because of a race when many buyers check at once.', like: 'Selling 120 tickets for a 100-seat cinema.' },
    { term: 'Reservation', def: 'A temporary, time-limited claim on stock while a customer completes payment.', like: 'The ten-minute cinema seat hold.', aka: ['stock hold'] },
    { term: 'Saga', def: 'A chain of local transactions across services, each paired with a compensating action that undoes it if a later step fails.', like: 'A trip itinerary where every booking has a cancellation plan.', aka: ['order saga'] },
    { term: 'Compensating action', def: 'The step that undoes a completed saga step, such as a refund or releasing stock.', like: 'The cancel button for a booking.' },
    { term: 'Webhook', def: 'A message another service sends to your server when something happens, such as a payment settling.', like: 'The courier ringing your bell, instead of you checking the tracking page.' },
    { term: 'Reconciliation', def: 'A periodic job that compares your records with an outside system’s and repairs any mismatches.', like: 'Checking your bank statement against your receipts.' }
  ],

  takeaways: [
    'Stop overselling with one **atomic** update; use **reservations** with an expiry.',
    'Every money call carries an **idempotency key**, so retries are safe.',
    'Across services, use a **saga**: each step has an undo that runs in reverse.',
    'Be **strict for money and stock**, **available for browsing**, and reconcile what slipped through.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cap-video', {
  eli5: 'A video service takes one big file from an uploader, makes many smaller copies of different quality, and then hands your phone a few seconds at a time from a server near you.',

  cards: [
    { kind: 'concept', title: 'From an upload button to a billion plays',
      body: `Someone films a birthday party on their phone and taps **Upload**. A few minutes later, a cousin on slow train Wi-Fi in another country presses play, and it just works.

        That is two very different jobs. **Uploading** is rare, heavy and slow. **Watching** is constant and must start in a second or two. Our requirements: uploads that survive bad connections, playback that adapts to the viewer’s network, and a catalogue people can search.

        Assume **1 million uploads a day**, averaging around 500 MB each, and **1 billion plays a day**. The imbalance (a thousand plays for every upload) tells us where to spend the money: **delivery**.` },

    { kind: 'metaphor', title: 'The bakery and its many shops',
      body: `A bakery bakes a loaf once, in the central kitchen. It does not hand-deliver each loaf to each customer from the main oven. Instead, it makes loaves in several sizes and sends boxes to shops all over town. Customers walk to the nearest shop.

        - The **central kitchen** is where we process each video, once.
        - The **sizes** are the different qualities.
        - The **local shops** are servers close to viewers, a [[CDN]].

        Where it stops being true: bread is gone once eaten, while a video can be copied to a shop and sold ten thousand times.` },

    { kind: 'diagram', title: 'The upload path',
      body: 'The raw file takes a long journey before anyone can watch it.',
      nodes: [
        { id: 'u', label: 'Uploader’s app', icon: '📱', x: 1, y: 0 },
        { id: 'raw', label: 'Object storage: raw', icon: '🪣', x: 0, y: 1, tone: 'info' },
        { id: 'meta', label: 'Metadata database', icon: '🗄️', x: 2, y: 1, tone: 'info' },
        { id: 'q', label: 'Job queue', icon: '📬', x: 1, y: 2, tone: 'warn' },
        { id: 'w', label: 'Transcoding workers', icon: '⚙️', x: 1, y: 3, tone: 'accent' },
        { id: 'out', label: 'Object storage: ready', icon: '🪣', x: 1, y: 4, tone: 'good' }
      ],
      edges: [
        { from: 'u', to: 'raw', label: 'upload in chunks' },
        { from: 'u', to: 'meta', label: 'title, owner', dashed: true },
        { from: 'raw', to: 'q', label: 'new file' },
        { from: 'q', to: 'w' },
        { from: 'w', to: 'out', label: 'many versions' }
      ],
      caption: 'Big files go straight into **object storage**, a cheap, durable place for large blobs. Details about the video (title, owner, status) go into an ordinary database.' },

    { kind: 'concept', title: 'Uploads that survive a bad connection',
      body: `A 500 MB upload on a phone will be interrupted: a tunnel, a lift, a flat battery. Restarting from zero every time would be miserable.

        So the app cuts the file into **chunks** (say a few megabytes each) and uploads them one by one. The server remembers which chunks it has. After an interruption, the app asks "what do you have?" and carries on from the gap. This is a **resumable upload**.

        Two refinements. The chunks go **directly to object storage**, using a short-lived permission slip the app server hands out, so heavy bytes never flow through your own app servers. And the video is marked *uploaded, processing*, not *published*, until the next stage finishes.` },

    { kind: 'steps', title: 'The transcoding pipeline',
      body: 'A raw upload is the wrong shape for streaming. **Transcoding** converts it into the versions viewers need. Tap through.',
      steps: [
        { title: '1. A job lands on the queue', body: 'The "upload complete" event puts a job on a [[queue|Message queue]]. Queue means that a flood of uploads makes jobs wait; it does not crash the workers.' },
        { title: '2. Split into short segments', body: 'The video is cut into pieces of a few seconds each. Pieces can be processed on different machines **in parallel**, so a long film does not take hours.' },
        { title: '3. Convert each piece to several qualities', body: 'Workers produce several versions: for example small and blurry for weak connections up to sharp and big for fast ones. They also make thumbnails and pull out the audio.' },
        { title: '4. Write the results and publish', body: 'Finished pieces go into object storage, and a small **manifest** file listing them is written. Only then does the metadata flip to *ready*. A worker that crashes mid-job simply leaves the job unacknowledged, and another worker picks it up.' }
      ] },

    { kind: 'sequence', title: 'Adaptive bitrate: the player chooses as it goes',
      body: 'Streaming works by downloading a few seconds at a time, and choosing the quality **per piece**.',
      actors: ['Player', 'CDN'],
      steps: [
        { from: 0, to: 1, label: 'GET manifest', note: 'The player first fetches the manifest: a text file listing every quality and where each short segment lives. Common formats are called HLS and DASH.' },
        { from: 1, to: 0, label: 'qualities + segment list', dashed: true, note: 'It now knows all the options, but has not downloaded any video yet.' },
        { from: 0, to: 1, label: 'GET 360p, segment 1', note: 'The player starts cautiously with a low quality so playback begins quickly.' },
        { at: 0, label: 'measure: that was fast', note: 'It times the download. The connection is better than expected.' },
        { from: 0, to: 1, label: 'GET 720p, segment 2', note: 'It steps up. The picture gets sharper mid-video.' },
        { at: 0, label: 'measure: that was slow', note: 'The train enters a tunnel and the speed drops.' },
        { from: 0, to: 1, label: 'GET 360p, segment 3', note: 'It steps down before the buffer runs dry. A softer picture beats a spinning wheel.' }
      ] },

    { kind: 'compare', title: 'Why a CDN suits video so well',
      body: 'Segments are static files that never change once written, which is the best case for caching.',
      cols: ['Popular videos', 'The long tail'],
      rows: [
        ['Where it is served from', 'Edge servers near viewers, held in cache', 'Often the origin or a regional cache'],
        ['Cache hit chance', 'Very high', 'Low: few people watch them'],
        ['Cost to you', 'Low per play', 'Higher per play, but few plays'],
        ['Tactics', 'Push or pre-warm known hits to edges', 'Keep cheap storage; let the cache fill on demand']
      ],
      note: 'Most platforms see a heavy skew: a small fraction of videos gets most of the plays. That is why putting segments on the edge pays off. An **origin shield** (one cache layer in front of the origin) stops a thousand edges all asking the origin for the same new segment.' },

    { kind: 'concept', title: 'Metadata and search',
      body: `The video bytes sit in object storage. Everything *about* the video is small structured data: title, description, owner, upload date, status, view count. That lives in an ordinary database, and it is the first thing a page loads.

        **Search** is a separate job. A search index (the inverted index idea from the search lesson) is built from titles, descriptions and tags, and updated shortly after publishing. Typing "cat piano" asks the search index, which returns video IDs; the metadata database fills in the details.

        **View counts** deserve care. Adding one to a single row for every play makes that row a hot spot. Instead, emit play events to a queue and update counts in batches. A count that is a few seconds behind hurts nobody.` },

    { kind: 'pitfall', title: 'Do not stream video through your app servers',
      body: `The tempting shortcut: the app server reads a file from storage and passes the bytes along to the viewer. It works with ten users.

        With a million, your app servers become expensive pipes. They run out of network bandwidth long before they run out of CPU, and slow viewers hold connections open for minutes.

        The fix is the architecture itself: app servers handle small API calls (the page, the manifest address, permissions); the **video bytes come from the CDN**, which is built for exactly this. Keep the control plane and the data plane apart, and scale them separately.` }
  ],

  activities: [
    { type: 'estimate', after: 0, q: 'Assume 1 million videos are uploaded per day, averaging 500 MB each. About how many terabytes of raw video arrive per day? (1 TB = 1,000,000 MB)',
      answer: 500, unit: 'TB per day', tolerance: 2,
      explain: '1,000,000 × 500 MB = 500,000,000 MB = 500 TB each day, before any extra versions are made. That is why raw video goes to cheap, durable object storage rather than a database.' },

    { type: 'order', after: 4, prompt: 'Put the steps of publishing a video in order.',
      items: ['The app uploads the file in chunks to object storage', 'An "upload complete" job is placed on the queue', 'Workers split the video and convert each piece to several qualities', 'The converted pieces and a manifest are written to storage', 'The video’s status is switched to ready'],
      explain: 'Publishing happens last, only after every version exists. Putting the work on a queue means a burst of uploads delays processing but does not break anything.' },

    { type: 'mcq', after: 5, q: 'A viewer’s connection suddenly gets slower halfway through a video. How does adaptive bitrate streaming cope?',
      options: ['The player requests the next short segment at a lower quality', 'The server re-encodes the whole video on the fly', 'The player pauses until the connection recovers fully', 'The CDN moves the viewer to a faster server'],
      answer: 0,
      why: [null, 'The server has already prepared every quality in advance; nothing is encoded per viewer.', 'Pausing is what we are trying to avoid; it only happens if even the lowest quality cannot keep up.', 'A CDN picks a nearby server, but it cannot make the viewer’s own network faster.'],
      explain: 'Because the video exists as short segments at several qualities, the player can switch at each segment boundary, trading sharpness for smoothness.' },

    { type: 'bucket', prompt: 'Where does each thing belong?', buckets: ['Object storage', 'Metadata database', 'Search index', 'Queue'],
      items: [['The 500 MB original video file', 0], ['A video’s title and owner', 1], ['A pending "transcode this" job', 3], ['Fast lookup of videos matching "cat piano"', 2], ['Short video segments at each quality', 0], ['The "ready" or "processing" status', 1], ['Play events waiting to be counted', 3]],
      explain: 'Large blobs go in object storage; small structured facts in a database; text lookups in a search index; work that can wait in a queue. Each store is chosen for the shape of what it holds.' },

    { type: 'match', prompt: 'Match each problem with the design answer.',
      pairs: [['Uploads keep failing on mobile data', 'Resumable chunked upload'], ['A flood of uploads at peak time', 'A job queue in front of the workers'], ['A long film takes hours to convert', 'Split into segments and transcode in parallel'], ['Viewers on poor connections buffer', 'Adaptive bitrate with several qualities'], ['A million viewers far from the origin', 'Serve segments from a CDN edge']] },

    { type: 'scenario', title: 'The upload backlog',
      intro: 'A famous festival ends and thousands of people upload their clips at once. Your dashboard shows 200,000 videos waiting to be processed, and creators are complaining that their videos "never publish".',
      meters: { 'time to publish': 40, 'cost': 70, 'viewer experience': 80 },
      steps: [
        { text: 'The queue is long and the workers are saturated. What do you do first?',
          choices: [
            { label: 'Add more transcoding workers (scale on queue length) and keep the queue as the buffer', score: 2, effects: { 'time to publish': 30, 'cost': -10 }, feedback: 'Workers pull jobs independently, so adding workers drains the backlog with no redesign. Scaling on queue depth is a standard trick.' },
            { label: 'Reject uploads until the backlog is gone', score: 1, effects: { 'time to publish': 10, 'viewer experience': -20 }, feedback: 'It protects the system, but you turn away the very content people are coming for.' },
            { label: 'Skip transcoding and publish the raw files', score: 0, effects: { 'viewer experience': -35, 'cost': -20 }, feedback: 'Raw files are huge and in the wrong format. Viewers buffer and your bandwidth bill explodes.' }
          ] },
        { text: 'Some jobs keep failing and retrying, hogging workers. A corrupt file is the culprit. What is the best protection?',
          choices: [
            { label: 'Limit retries, then move the job to a dead-letter queue and mark the video failed', score: 2, effects: { 'time to publish': 15, 'viewer experience': 5 }, feedback: 'A poison job stops wasting workers, and the creator gets a clear "processing failed" instead of an endless wait.' },
            { label: 'Retry failed jobs forever, since eventually something will work', score: 0, effects: { 'time to publish': -25, 'cost': -15 }, feedback: 'A corrupt file never becomes valid. It will occupy a worker for ever.' },
            { label: 'Delete failed jobs silently', score: 1, effects: { 'viewer experience': -10 }, feedback: 'The queue clears, but the creator is never told, and a temporary glitch is treated as a permanent one.' }
          ] },
        { text: 'The festival videos are now live and a million people press play on the opening act. Where should those bytes come from?',
          choices: [
            { label: 'The CDN, with an origin shield protecting the origin', score: 2, effects: { 'viewer experience': 15, 'cost': 10 }, feedback: 'Segments are cacheable files. Edges serve almost everything and the shield makes sure the origin sees each new segment once.' },
            { label: 'Straight from the app servers', score: 0, effects: { 'viewer experience': -30, 'cost': -25 }, feedback: 'The app servers are not built to be video pipes. They saturate their network links and everything slows down.' },
            { label: 'Directly from object storage, to every viewer', score: 1, effects: { 'viewer experience': -5, 'cost': -15 }, feedback: 'It works, but every viewer far from the storage region is slow, and you pay for every byte of egress.' }
          ] }
      ],
      outro: 'Pattern: **queue the heavy work, scale workers on queue depth, and let a CDN carry the viewing**.' },

    { type: 'tf', statement: 'A player downloads the whole video at one fixed quality before it starts playing, so quality cannot change during playback.', answer: false,
      explain: 'Streaming fetches a few seconds at a time, and adaptive bitrate chooses the quality for each segment depending on how fast the last one arrived.' },

    { type: 'cloze', text: 'The player first fetches a {{manifest}} listing every {{segment}} at each quality, then picks the next one based on how fast the last download was. Popular segments are served from a {{CDN}} edge near the viewer.',
      distractors: ['cookie', 'database', 'token'],
      explain: 'The manifest is the menu; segments are the dishes; the CDN is the nearby kitchen counter. Each part makes playback quick and adaptable.' },

    { type: 'explain', prompt: 'Explain why a video service converts every upload into several smaller pieces and qualities, rather than serving the original file.',
      model: 'The original is huge and in whatever format the phone chose. Viewers have different devices and connections. So we convert it into several qualities and cut it into short segments. The player downloads a few seconds at a time and switches quality as the connection changes, so it avoids buffering. The short, unchanging files are also ideal for a CDN to cache near viewers.',
      keywords: ['qualities', 'segments', 'buffering', 'connection', 'CDN', 'cache'] }
  ],

  flashcards: [
    { q: 'Why do uploads go straight to object storage in chunks?', a: 'Chunks make uploads resumable after interruptions, and going direct to object storage keeps huge byte streams away from your app servers.' },
    { q: 'What does a transcoding pipeline do?', a: 'Takes the raw upload, splits it into short segments, converts them into several qualities in parallel on queue-fed workers, and publishes only when done.' },
    { q: 'How does adaptive bitrate streaming work?', a: 'Video exists as short segments at several qualities, listed in a manifest. The player picks each next segment’s quality from the speed of the last download.' },
    { q: 'Why are video segments ideal for a CDN?', a: 'They are static, never-changing files, so edge servers near viewers can cache them and serve most plays without touching the origin.' },
    { q: 'Where do titles, search and view counts live?', a: 'Titles and status in a metadata database; search in a search index; view counts through play events on a queue, applied in batches.' }
  ],

  glossary: [
    { term: 'Object storage', def: 'A service for storing large files (objects) cheaply and durably, fetched by name over HTTP.', like: 'A vast warehouse with a catalogue number for every box.' },
    { term: 'Transcoding', def: 'Converting a video from one format or quality to others, such as making several resolutions from one upload.', like: 'Translating a book into several languages.' },
    { term: 'Adaptive bitrate streaming', def: 'Playing video in short segments and switching quality per segment depending on the viewer’s connection speed.', like: 'A driver changing gear to suit the hill.', aka: ['ABR', 'HLS and DASH'] },
    { term: 'Manifest', def: 'A small file that lists the available qualities of a video and where each segment can be fetched.', like: 'The menu that tells you what is on offer.' },
    { term: 'Resumable upload', def: 'An upload cut into chunks so it can pick up where it stopped after an interruption.', like: 'A bookmark in a long download.' }
  ],

  takeaways: [
    '**Raw upload** → object storage → **queue** → transcoding workers → many qualities.',
    '**Adaptive bitrate**: short segments, several qualities, and the player picks per segment.',
    'Serve bytes from the **CDN**, never through your app servers.',
    'Metadata in a **database**, discovery in a **search index**, counts in **batches**.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cap-ride-hailing', {
  eli5: 'A ride-hailing app keeps track of thousands of moving cars, quickly finds the closest free one when you ask, and shows it creeping towards you on the map.',

  cards: [
    { kind: 'concept', title: 'Moving dots on a map',
      body: `You tap **Request ride**. A few seconds later, a driver two streets away accepts and you watch a little car crawl towards you. Meanwhile the app quotes a price that is sometimes higher than usual.

        Underneath, four jobs: **know where every driver is**, **find the nearby ones fast**, **match you to exactly one**, and **keep both phones updated**. Plus the price.

        Assume **1 million drivers online** in a busy period, each phone reporting its location **every 4 seconds**. That is 250,000 updates every second, mostly tiny and mostly worthless a few seconds later. This design is about handling *constant change*.` },

    { kind: 'metaphor', title: 'The taxi rank, scaled up',
      body: `At a train-station taxi rank, the dispatcher looks along the queue, sees the nearest free cab and waves it forward. They never scan every taxi in the country.

        Our dispatcher has to do the same: look only at cabs in the neighbourhood. To do that we need a way of **cutting the city into small areas**, so "what is near this corner?" becomes "look in this area and the next ones along".

        Where it stops being true: a rank has a queue; our cabs are all moving, so the picture changes while the dispatcher is still looking.` },

    { kind: 'diagram', title: 'Version 1: where is everyone?',
      body: 'Every driver’s phone streams its position into a fast in-memory store.',
      nodes: [
        { id: 'd', label: 'Driver apps', icon: '🚗', x: 0, y: 0 },
        { id: 'r', label: 'Rider app', icon: '📱', x: 2, y: 0 },
        { id: 'gw', label: 'Location gateway', icon: '🔌', x: 0, y: 1, tone: 'accent' },
        { id: 'geo', label: 'In-memory location index', icon: '🧭', x: 0, y: 2, tone: 'good' },
        { id: 'm', label: 'Matching service', icon: '🧠', x: 2, y: 2, tone: 'accent' },
        { id: 'log', label: 'Event log (history)', icon: '🧾', x: 1, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'd', to: 'gw', label: 'position / 4 s' },
        { from: 'gw', to: 'geo', label: 'latest only' },
        { from: 'r', to: 'm', label: 'request ride' },
        { from: 'm', to: 'geo', label: 'who is nearby?' },
        { from: 'gw', to: 'log', label: 'copy', dashed: true }
      ],
      caption: 'The current position of each driver is overwritten in memory: only the latest matters. A copy of each update goes to a log for later use (trip history, analytics, surge).' },

    { kind: 'concept', title: 'Location updates at scale',
      body: `250,000 writes a second is too many to put through an ordinary database as individual rows, and nearly all of that data is stale in seconds. So we split by what each piece of data is **for**:

        - **Latest position**: kept in memory, overwritten each time, optionally with an expiry. If a driver stops reporting, they drop off the map after a few seconds. (Some in-memory stores, such as Redis, have location features built in.)
        - **Position history**: appended to a log or stream and processed later, for trip receipts, safety and analytics.
        - **Fewer updates**: the app can report less often when the driver is stationary, or on a long straight road.

        Treating all location data as precious would cost a fortune. Most of it is a live feed, not a record.` },

    { kind: 'compare', title: 'Finding "nearby": cutting up the map',
      body: 'We cannot compare a rider to a million drivers. We index space, so a lookup touches only a few cells.',
      cols: ['Fixed grid / geohash', 'Quadtree'],
      rows: [
        ['The idea', 'Divide the world into equal cells; a [[geohash]] names a cell with a short string, and nearby places mostly share a prefix', 'Start with one box and split any crowded box into four, again and again'],
        ['Dense city centre', 'Cells have the same size, so a downtown cell may hold thousands of drivers', 'Splits finely where drivers cluster, and stays coarse in empty countryside'],
        ['Simplicity', 'Very simple and easy to shard by cell', 'More complex to build and update as cars move'],
        ['Watch out for', 'Cell borders: a driver 20 m away may be in the next cell, so always search the neighbouring cells too', 'Constantly rebalancing as drivers move']
      ],
      note: 'Many real systems use a grid-style index and search the rider’s cell plus its neighbours. Quadtrees and similar structures appear when density varies wildly.' },

    { kind: 'sequence', title: 'Matching a rider with a driver',
      body: 'Finding drivers is easy; getting exactly one to say yes is the careful part.',
      actors: ['Rider', 'Matching', 'Driver'],
      steps: [
        { from: 0, to: 1, label: 'request ride (pickup, drop-off)', note: 'The rider’s pickup point is turned into a cell on the map.' },
        { at: 1, label: 'nearby free drivers?', note: 'Look in that cell and its neighbours. Expand the search outwards if there are none.' },
        { at: 1, label: 'rank by estimated arrival', note: 'The closest in a straight line is not always the fastest to arrive: rivers, one-way streets and traffic matter.' },
        { from: 1, to: 2, label: 'offer trip (15 s to accept)', note: 'The best candidate gets an offer with a short timer. At this moment they are **reserved**: no other rider can be offered this driver.' },
        { from: 2, to: 1, label: 'accept', note: 'The driver accepts in time. If they ignore it, the reservation expires and the next candidate is tried.' },
        { from: 1, to: 0, label: 'driver assigned', note: 'The rider sees the car, name and arrival time.' }
      ] },

    { kind: 'pitfall', title: 'One driver, two riders',
      body: `Two riders on the same street request rides in the same second. Both searches rank the same nearest driver first. If both riders are told "you have driver Sam", one of them is about to have a very bad evening.

        The lesson from the checkout capstone applies: this is a **unique resource**, like the last pair of trainers. Taking a driver must be an **atomic reservation** ("mark Sam as offered only if Sam is free"), and the loser of the race moves on to the next candidate.

        Notice the contrast: Sam’s *position* can be a few seconds stale and nobody is harmed. Sam’s *availability* must be strictly correct.` },

    { kind: 'concept', title: 'Real-time tracking',
      body: `Once matched, the rider watches the car approach. The driver app continues sending positions; the service pushes them to the rider’s phone over an open connection (a [[WebSocket]], or [[server-sent events|Server-Sent Events]], as in the real-time lessons). The rider never has to ask.

        Two details make it feel smooth:

        - Updates arrive every few seconds, but the app **animates** the car between them, like a flipbook with fewer pages.
        - The trip itself is a small **state machine**: *requested → driver assigned → arriving → in progress → completed* (or cancelled). Both apps show the state they are told, and each change is stored durably, because money depends on it.` },

    { kind: 'concept', title: 'Surge pricing: a number per area, per minute',
      body: `When there are many more riders than drivers in an area, fares rise to encourage more drivers to head there and to ease demand. The idea is simple: for each cell, count **open requests** and **free drivers** over the last minute or so.

        A stream-processing job does the counting on the event log and publishes a **multiplier per cell**, such as 1.0×, 1.4×, 2.0×. Because the map is smooth, a good system **smooths** the numbers, so prices do not flicker from one second to the next.

        Whether and how to apply surge is a business and ethics question, and experts disagree. The engineering lesson: the *calculation* can be approximate and slightly delayed, but the **price you show a rider must then be honoured**.` },

    { kind: 'compare', title: 'Consistency, part by part',
      body: 'As in checkout, different parts want different guarantees.',
      cols: ['Needs strict correctness', 'Fine if slightly stale'],
      rows: [
        ['Driver availability', 'One driver, one trip: reserve atomically', 'Not applicable'],
        ['Driver position', 'Not needed', 'Latest known position, seconds old'],
        ['Price quote shown to a rider', 'Once shown, locked in for that trip', 'The underlying surge estimate can lag'],
        ['Trip state and payment', 'Durable, in a database with transactions', 'Not applicable'],
        ['Map animation of the car', 'Not needed', 'Smoothed and approximate']
      ] }
  ],

  activities: [
    { type: 'estimate', after: 0, q: 'One million drivers each send a location update every 4 seconds. About how many updates per second arrive?',
      answer: 250000, unit: 'updates per second', tolerance: 2,
      explain: '1,000,000 ÷ 4 = 250,000 per second. That is why the latest position is kept in memory and overwritten, and history is appended to a log rather than written as database rows.' },

    { type: 'mcq', after: 4, q: 'A rider is near the edge of a geohash cell. You search only their own cell. What goes wrong?',
      options: ['A closer driver just across the border in the next cell is missed', 'The search finds every driver in the city', 'The geohash prefix becomes invalid', 'The rider is matched to a driver who is offline'],
      answer: 0,
      why: [null, 'A smaller search area means fewer results, not more.', 'The prefix is fine; the problem is where the boundary falls.', 'Offline drivers expire from the in-memory index, which is a separate matter.'],
      explain: 'Cells have borders but the world does not. Two places metres apart can be in different cells, so a good search looks at the rider’s cell **and its neighbours**.' },

    { type: 'order', after: 5, prompt: 'Put the matching flow in order.',
      items: ['Turn the pickup point into a map cell', 'Find free drivers in that cell and its neighbours', 'Rank them by estimated arrival time', 'Reserve the best driver and send an offer with a timer', 'Assign the driver, or move to the next one if no answer'],
      explain: 'You have to know where to look before you can search, rank before you offer, and reserve before you offer, so two riders cannot be promised the same driver.' },

    { type: 'bucket', prompt: 'How strict does each piece of data need to be?', buckets: ['Must be exact', 'Can be a few seconds stale'],
      items: [['Whether a driver is already on a trip', 0], ['A driver’s latest map position', 1], ['The fare the rider agreed to', 0], ['The surge multiplier estimate for a cell', 1], ['A completed trip’s payment record', 0], ['The car icon’s position between updates', 1]],
      explain: 'Anything that involves taking a unique resource or money must be exact. Anything that is a live view of a changing world is allowed to lag a little.' },

    { type: 'match', prompt: 'Match each requirement with the part of the design that serves it.',
      pairs: [['250,000 position updates a second', 'Latest position overwritten in memory'], ['Find nearby drivers quickly', 'Geohash or grid index plus neighbouring cells'], ['Never promise one driver to two riders', 'Atomic reservation with an expiry'], ['Rider watches the car approach', 'Positions pushed over a persistent connection'], ['Raise fares where demand outruns supply', 'Per-cell counts and a smoothed multiplier']] },

    { type: 'scenario', title: 'Friday night rush',
      intro: 'It is 11 p.m. outside a stadium. 30,000 people leave at once, and open ride requests in one neighbourhood jump by a hundred times. Support reports that some riders were matched to a driver who was already busy.',
      meters: { 'match correctness': 50, 'system load': 70, 'rider trust': 60 },
      steps: [
        { text: 'Riders are being matched to busy drivers. What do you fix first?',
          choices: [
            { label: 'Make "reserve this driver" an atomic step that only succeeds if the driver is free', score: 2, effects: { 'match correctness': 35, 'rider trust': 15 }, feedback: 'The race disappears: only one rider’s reservation can succeed, and the other automatically moves to the next candidate.' },
            { label: 'Refresh driver locations more often', score: 0, effects: { 'system load': -25, 'match correctness': 0 }, feedback: 'The problem is not stale positions; it is two matches grabbing the same free driver. You have just added load.' },
            { label: 'Ask riders to cancel and re-request when it happens', score: 1, effects: { 'rider trust': -15, 'match correctness': 5 }, feedback: 'It is a poor experience that treats a race condition as a user problem.' }
          ] },
        { text: 'The stadium cell holds thousands of drivers and riders, and every search there is slow. How do you spread the load?',
          choices: [
            { label: 'Split crowded cells into smaller ones (quadtree-style) so each search touches fewer drivers', score: 2, effects: { 'system load': 25 }, feedback: 'Finer cells mean each lookup scans a few dozen drivers, not thousands. Quiet areas stay coarse and cheap.' },
            { label: 'Make every cell in the world smaller', score: 1, effects: { 'system load': -5, 'match correctness': 0 }, feedback: 'It fixes downtown but creates millions of near-empty cells and more neighbour lookups everywhere else.' },
            { label: 'Stop showing nearby drivers in that area', score: 0, effects: { 'rider trust': -25 }, feedback: 'Blinding riders at the busiest moment does not reduce load; it just hides it.' }
          ] },
        { text: 'Surge pricing kicks in. A rider sees 2.0×, taps request, and the multiplier changes to 1.6× before the trip starts. What should the fare be?',
          choices: [
            { label: 'The multiplier shown at the moment they accepted: the quote is honoured', score: 2, effects: { 'rider trust': 25 }, feedback: 'The calculation may lag or move, but a price shown and accepted is a promise. Lock it to the trip.' },
            { label: 'Whatever the multiplier is when the trip ends', score: 0, effects: { 'rider trust': -30 }, feedback: 'Riders cannot trust a price that can change under them.' },
            { label: 'Always charge the higher of the two', score: 1, effects: { 'rider trust': -15 }, feedback: 'Consistently choosing the worse deal for the customer is cheap to build and expensive in goodwill.' }
          ] }
      ],
      outro: 'Pattern: **live views can be sloppy, promises must be exact**. Spend your correctness budget on reservations, prices and payments.' },

    { type: 'tf', statement: 'Because drivers’ positions change every few seconds, each position update should be stored permanently in the main trips database.', answer: false,
      explain: 'Only the latest position matters for matching, so it lives in fast memory and is overwritten. History goes to a cheap append-only log. Writing every update to the trips database would drown it.' },

    { type: 'short', q: 'The short string that names a map cell, where nearby places usually share the same start, is called a what? (one word)', accept: ['geohash', 'geohashes', 'a geohash'], hint: 'Geo + hash.',
      explain: 'A **geohash** encodes a location as a short string; the longer the string, the smaller the cell. Nearby places usually share a prefix, but cell borders are the exception, so you search neighbours too.' },

    { type: 'explain', prompt: 'Explain why finding nearby drivers uses a map index rather than comparing the rider to every driver.',
      model: 'With a million drivers, comparing the rider’s location to each one would take far too long for every request. Instead we divide the map into cells, such as a grid or geohash, and keep drivers filed by cell. To find nearby drivers we look in the rider’s cell and the neighbouring ones, which holds only a handful of cars. We have to check neighbours because a close driver might be just across a cell border.',
      keywords: ['cells', 'grid', 'geohash', 'neighbouring', 'index', 'million'] }
  ],

  flashcards: [
    { q: 'How should you store a driver’s live position?', a: 'Keep only the latest in fast memory, overwritten on each update, with an expiry. Send a copy to an append-only log for history and analytics.' },
    { q: 'Why index the map into cells?', a: 'So a "nearby" search touches a few cells (the rider’s plus neighbours) instead of comparing against every driver.' },
    { q: 'Geohash grid vs quadtree?', a: 'A grid has equal cells and is simple but can overload dense areas. A quadtree splits crowded areas finer, at the cost of more complexity.' },
    { q: 'How do you stop one driver being matched to two riders?', a: 'Reserve the driver atomically (only if free) when offering, with an expiry; losers move to the next candidate.' },
    { q: 'What must stay exact in ride-hailing, and what can lag?', a: 'Exact: driver availability, the accepted fare, trip state and payment. Can lag: live positions, surge estimates and map animation.' }
  ],

  glossary: [
    { term: 'Geohash', def: 'A way of encoding a location as a short string naming a map cell; longer strings give smaller cells, and nearby places usually share a prefix.', like: 'A postcode that gets more precise with every extra character.' },
    { term: 'Quadtree', def: 'A tree that divides a map into four, and splits any crowded square into four again, so busy areas get finer cells.', like: 'Zooming into a city map only where there is detail to see.' },
    { term: 'Geospatial index', def: 'A data structure that answers "what is near here?" without checking every item.', like: 'The index of an atlas.' },
    { term: 'Surge pricing', def: 'A price multiplier applied in areas where demand temporarily outruns supply.', like: 'Taxi fares rising on New Year’s Eve.', aka: ['dynamic pricing'] },
    { term: 'State machine', def: 'A model where something is always in exactly one of a fixed set of states and moves between them by defined steps, such as a trip going from requested to completed.', like: 'A parcel’s tracking status.' }
  ],

  takeaways: [
    'Live positions are **in-memory and overwritten**; history is **logged**.',
    'Use a **geospatial index** (grid, geohash or quadtree) and search **neighbouring cells**.',
    'Match with an **atomic reservation**: one driver, one trip.',
    '**Live views may lag; promises (prices, payments, trip state) must be exact.**'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cap-auth-platform', {
  eli5: 'A business app used by thousands of companies needs three things: a way for each person to log in, rules about what each person may do, and strong walls so one company never sees another’s data.',

  cards: [
    { kind: 'concept', title: 'Thousands of companies, one app',
      body: `You are building a project-management tool sold to businesses. Acme Ltd signs up, then Globex, then a thousand more. Each company is a **tenant**: a customer whose people and data share your software but must never mix with anyone else’s.

        Three questions will shape the design:

        1. **Who are you?** Logging in, including companies that want staff to use their own company login.
        2. **What may you do?** Admins, editors and viewers inside each company.
        3. **Where does your data end?** The nightmare headline is "Company A saw Company B’s invoices".

        Plus two extras: programs that call your API, and a record of who did what.` },

    { kind: 'metaphor', title: 'The apartment block',
      body: `Think of an apartment building. Everyone shares the lobby, the lifts, the plumbing and the building manager (your servers and code). But each flat has its own lock, and a key to flat 4B opens nothing else.

        - The **building** is your platform.
        - Each **flat** is a tenant.
        - Each **resident** is a user, with a keyfob that opens only certain doors.
        - The **door log** at the entrance is the audit trail.

        Where it stops being true: a person can live in two flats at once. A consultant might work for three of your customers, with a different role in each. Our model must allow that.` },

    { kind: 'diagram', title: 'The data model: users belong to tenants through memberships',
      body: 'A user is a *person*. A tenant (organisation) is a *company*. The link between them, a **membership**, carries the role.',
      nodes: [
        { id: 'u', label: 'User: Priya', icon: '🧑', x: 0, y: 0 },
        { id: 'm1', label: 'Membership: Admin', icon: '🎫', x: 1, y: 0, tone: 'accent' },
        { id: 't1', label: 'Tenant: Acme', icon: '🏢', x: 2, y: 0, tone: 'info' },
        { id: 'm2', label: 'Membership: Viewer', icon: '🎫', x: 1, y: 1, tone: 'accent' },
        { id: 't2', label: 'Tenant: Globex', icon: '🏢', x: 2, y: 1, tone: 'info' },
        { id: 'r', label: 'Projects, tasks, files', icon: '📁', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'u', to: 'm1' },
        { from: 'm1', to: 't1' },
        { from: 'u', to: 'm2' },
        { from: 'm2', to: 't2' },
        { from: 't1', to: 'r', label: 'tenant_id on every row', dashed: true }
      ],
      caption: 'Priya is an admin at Acme and only a viewer at Globex. Putting the role on the *user* would force one role everywhere. Every piece of tenant data carries a tenant ID, and every request must know which tenant it is acting inside.' },

    { kind: 'sequence', title: 'Single sign-on for an enterprise customer',
      body: 'Large customers insist that staff log in with their own company account, so IT can switch off a leaver in one place. Step through it.',
      actors: ['Employee', 'Your app', 'Company login'],
      steps: [
        { from: 0, to: 1, label: 'types work email: sam@acme.com', note: 'The app looks at the email domain and finds that **Acme has configured single sign-on**.' },
        { from: 1, to: 0, label: 'redirect to Acme’s login', dashed: true, note: 'The app never sees Sam’s password. It sends them to Acme’s own identity provider.' },
        { from: 0, to: 2, label: 'logs in (with their MFA)', note: 'Acme’s rules apply: their password policy, their [[multi-factor authentication|Multi-factor authentication]], their off-boarding.' },
        { from: 2, to: 0, label: 'signed proof of identity', dashed: true, note: 'The login system returns a signed statement: "this is sam@acme.com". The two common standards are OpenID Connect (OIDC) and SAML.' },
        { from: 0, to: 1, label: 'presents the proof', note: 'The browser hands the proof to your app.' },
        { at: 1, label: 'verify and start a session', note: 'Your app checks the signature, finds or creates Sam inside the Acme tenant, and starts an ordinary session.' }
      ] },

    { kind: 'compare', title: 'Three ways in',
      body: 'A multi-tenant product usually supports several, because different customers want different things.',
      cols: ['Email + password', 'Social login', 'Enterprise SSO (OIDC/SAML)'],
      rows: [
        ['Who holds the credentials', 'You: hash and protect them', 'Google, Microsoft and so on', 'The customer’s own identity provider'],
        ['Best for', 'Small teams and trials', 'Fast sign-up', 'Larger companies and regulated industries'],
        ['Your job', 'Hashing, MFA, reset flows, lockouts', 'Link the external identity to a user', 'Per-tenant configuration and mapping to roles'],
        ['Leaver off-boarding', 'Admin removes the account in your app', 'Not controlled by the company', 'Disabled once at the customer; access disappears']
      ],
      note: 'After any of these succeeds, your app typically keeps its own **session** (a cookie) for the browser. For APIs and mobile apps, short-lived **access tokens** are common. You met both in the authentication lessons.' },

    { kind: 'concept', title: 'Roles and permissions, per tenant',
      body: `Inside a tenant, people need different powers. The standard answer is **role-based access control (RBAC)**: give people roles, and give roles permissions such as \`project.create\` or \`billing.view\`.

        The check on every request becomes: **does this user, in this tenant, hold a role that includes this permission?**

        - **Owner**: everything, including billing and deleting the tenant.
        - **Admin**: manage people and settings.
        - **Member**: create and edit work.
        - **Viewer**: read only.

        Customers will ask for custom roles. Allow them, but watch for **role explosion** (hundreds of near-identical roles). Where rules depend on context ("only edit your own team’s projects") you can add attribute rules on top.` },

    { kind: 'pitfall', title: 'The forgotten WHERE clause',
      body: 'The most dangerous bug in a multi-tenant app is not a hacker. It is one query that forgets to say whose data it wants. Tap the lines.',
      code: { lang: 'sql', src: `
        -- Dangerous: any tenant's invoice, if you know the id
        SELECT * FROM invoices WHERE id = 8841;

        -- Scoped: the tenant comes from the logged-in session
        SELECT * FROM invoices
        WHERE id = 8841 AND tenant_id = :current_tenant;`,
        notes: {
          2: 'Nothing ties this to the caller’s company. Anyone who guesses an ID can read someone else’s invoice. This is the classic [[IDOR]] bug.',
          5: 'The tenant ID comes from the **server-side session**, never from something the browser sends, so it cannot be forged.',
          6: 'Now an ID from another tenant simply finds nothing. Safer still: enforce it in the database too, with [[row-level security]], so one forgotten clause cannot leak data.'
        } } },

    { kind: 'compare', title: 'How high should the walls be?',
      body: 'There are three common ways to keep tenants apart. Isolation costs more as the walls get higher.',
      cols: ['Shared tables + tenant_id', 'Schema per tenant', 'Database per tenant'],
      rows: [
        ['Isolation', 'Logical only: depends on code and rules being right', 'Stronger', 'Strongest: separate data, backups and encryption keys'],
        ['Cost per tenant', 'Tiny', 'Moderate', 'Highest'],
        ['Operations', 'One schema to migrate', 'Thousands of schemas to migrate', 'Thousands of databases to migrate and monitor'],
        ['Noisy neighbour risk', 'High: one busy tenant slows everyone', 'Medium', 'Low'],
        ['Typical choice', 'Self-serve products with many small tenants', 'Middle ground', 'A few big customers who demand it, or strict regulation']
      ],
      note: 'Many companies mix: shared tables for the long tail, a dedicated database for the handful of customers who pay for it.' },

    { kind: 'concept', title: 'API keys and service accounts',
      body: `Not every caller is a person. A customer’s script wants to pull their data every night. Two tools:

        - An **API key** is a long random secret the customer’s program sends with each request. It belongs to **one tenant**, has limited **scopes** (what it may do), and can be rotated or revoked.
        - A **service account** is a non-human identity with its own role, so automation is not run as "Priya, the admin who left".

        Handling rules: show the key **once**, store only a **hash** of it (like a password), keep a short visible **prefix** so people can recognise it in a list, and give it the least power that works. Treat a leaked key as an incident: it must be easy to revoke instantly.` },

    { kind: 'concept', title: 'Audit logs: who did what, when',
      body: `Enterprise buyers always ask: "if something goes wrong, can we see who did it?" An **audit log** is an append-only record of important actions.

        Each entry answers: **who** (user or API key), **what** (action, such as *role changed* or *invoice exported*), **on what** (the resource), **when**, **from where** (IP, device) and **which tenant**.

        Rules of thumb:

        - Write it for logins, permission changes, key creation, exports and deletions, not every click.
        - **Never log secrets**, passwords or full tokens.
        - Make it hard to edit: append-only storage, with access restricted.
        - Let tenant admins **see and export their own tenant’s log**. It is a feature, not just a safeguard.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each term to what it means in a multi-tenant app.',
      pairs: [['Tenant', 'A customer company whose data must stay separate'], ['User', 'A person who can log in'], ['Membership', 'The link between a user and a tenant, carrying a role'], ['Role', 'A named bundle of permissions'], ['Service account', 'A non-human identity for automation']] },

    { type: 'order', after: 3, prompt: 'Put single sign-on in order.',
      items: ['The employee enters their work email', 'The app finds that company’s SSO setup and redirects them', 'They log in at their company’s identity provider', 'The provider sends back a signed proof of identity', 'The app verifies the signature and starts a session'],
      explain: 'Your app never touches the password. It only trusts a signature from an identity provider it has been told to trust for that tenant.' },

    { type: 'spot', after: 6, prompt: 'This endpoint lets users download an invoice by ID. Tap the line that could leak other tenants’ data.',
      code: { lang: 'js', src: `
        app.get('/invoices/:id', requireLogin, async (req, res) => {
          const tenant = req.session.tenantId;
          const inv = await db.query(
            'SELECT * FROM invoices WHERE id = $1', [req.params.id]
          );
          res.json(inv.rows[0]);
        });` },
      lines: [3, 4],
      explain: 'The query filters on the invoice ID alone. The tenant is read on line 2 but never used, so any logged-in user who guesses an ID gets another company’s invoice. It needs "AND tenant_id = $2".' },

    { type: 'mcq', q: 'Priya is an admin at Acme but only a viewer at Globex. Where should her role be stored?',
      options: ['On each membership, linking her to a tenant', 'On her user record, as one role', 'In a cookie she sends with each request', 'Only in the tenant’s own database table of names'],
      answer: 0,
      why: [null, 'One role per user would force the same power in every company: she would be admin at Globex too, or only a viewer at Acme.', 'A cookie is controlled by the browser, so she could simply edit it.', 'That would lose the link between the person and her many tenants.'],
      explain: 'The membership row (user + tenant + role) is what makes "same person, different power in different companies" possible, and it keeps the permission check server-side.' },

    { type: 'bucket', prompt: 'Which isolation model fits each situation best?', buckets: ['Shared tables + tenant_id', 'Dedicated database'],
      items: [['10,000 small teams on a self-serve plan', 0], ['A bank that must hold its own encryption keys', 1], ['A free trial with thousands of sign-ups per day', 0], ['A hospital group under strict data-residency rules', 1], ['A startup early in its life with limited ops time', 0], ['A customer paying a premium for guaranteed performance', 1]],
      explain: 'Shared tables are cheap and simple, so they suit the many small tenants. A dedicated database costs more to run, so it is reserved for customers whose risk, rules or contract justify it.' },

    { type: 'scenario', title: 'The enterprise deal',
      intro: 'Your first huge customer, Initech, wants to buy 20,000 seats. Their security team sends a questionnaire: SSO, role controls, a promise that no other customer can ever see their data, API access for their scripts, and audit trails.',
      meters: { 'security': 60, 'delivery time': 70, 'customer confidence': 50 },
      steps: [
        { text: 'Initech’s staff all log in at their own company portal and IT wants leavers cut off instantly. What do you build?',
          choices: [
            { label: 'Per-tenant OIDC/SAML single sign-on, with a membership created on first login', score: 2, effects: { 'security': 15, 'customer confidence': 20, 'delivery time': -10 }, feedback: 'Their identity provider owns authentication and off-boarding. Your app only verifies signatures and maps the person to a membership.' },
            { label: 'Create 20,000 accounts with passwords and email them', score: 0, effects: { 'security': -20, 'customer confidence': -25 }, feedback: 'Now you hold 20,000 credentials, they sit outside Initech’s controls, and a leaver’s account lives on until someone remembers to delete it.' },
            { label: 'Share one login for the whole company', score: 0, effects: { 'security': -35, 'customer confidence': -30 }, feedback: 'No individual accountability, no off-boarding and an audit log full of "shared user".' }
          ] },
        { text: 'Their legal team says Initech’s data must be impossible to mix with others. Your product is on shared tables with a tenant_id column. What is your most sensible response?',
          choices: [
            { label: 'Keep shared tables, add row-level security so the database enforces tenant scoping, and offer a dedicated database if they need it', score: 2, effects: { 'security': 20, 'customer confidence': 15, 'delivery time': -10 }, feedback: 'A second enforcement layer removes the "one forgotten WHERE clause" risk, and the premium option exists for the customers who need it.' },
            { label: 'Promise that developers are careful', score: 0, effects: { 'security': -15, 'customer confidence': -20 }, feedback: 'Care is not a control. The questionnaire is asking what stops a mistake, not who might make one.' },
            { label: 'Re-architect everything to one database per tenant before signing', score: 1, effects: { 'delivery time': -35, 'security': 10 }, feedback: 'Strong isolation, but you may lose the deal and the product before you finish. Start with the layer that closes the biggest risk.' }
          ] },
        { text: 'Initech’s data team wants to pull reports nightly with a script. How should the script authenticate?',
          choices: [
            { label: 'A tenant-scoped API key with read-only scope, held by a service account', score: 2, effects: { 'security': 15, 'customer confidence': 15 }, feedback: 'Limited power, tied to one tenant, rotatable and not dependent on any one employee’s account.' },
            { label: 'The CTO’s username and password in the script', score: 0, effects: { 'security': -30 }, feedback: 'A personal password in a script ends up in repositories and chat logs, and it breaks the day the CTO leaves or changes it.' },
            { label: 'An all-powerful key that works across any tenant', score: 0, effects: { 'security': -40, 'customer confidence': -25 }, feedback: 'If it leaks, every customer is exposed. Keys must be bound to one tenant and the least power that works.' }
          ] },
        { text: 'Initech’s auditors ask how they can prove who exported the customer list last month. What do you point them to?',
          choices: [
            { label: 'A tamper-resistant audit log of exports, with user, time and IP, visible to their admins', score: 2, effects: { 'customer confidence': 25, 'security': 10 }, feedback: 'Who, what, when and from where, available to the tenant themselves. This is often what closes the deal.' },
            { label: 'The general application logs', score: 1, effects: { 'customer confidence': -5 }, feedback: 'They might contain it, but they are noisy, short-lived, not tenant-visible and not built to be evidence.' },
            { label: 'Nothing, but you can ask the developers to look', score: 0, effects: { 'customer confidence': -30 }, feedback: 'If proof depends on a developer’s memory, you do not have an audit trail.' }
          ] }
      ],
      outro: 'Pattern: **identity from the customer, roles per tenant, walls enforced in more than one place, and a record of everything important**.' },

    { type: 'tf', statement: 'It is fine to store API keys in plain text, because only your own team can read the database.', answer: false,
      explain: 'Store only a hash, as with passwords. A database backup, a log leak or a curious insider would otherwise expose working credentials. Show the full key once, at creation.' },

    { type: 'short', q: 'What name is given to a non-human identity, with its own role, used by scripts and automation?', accept: ['service account', 'serviceaccount', 'service accounts'], hint: 'Two words: the account is for a service, not a person.',
      explain: 'A **service account** keeps automation separate from any individual, so the script keeps working when staff change and its power can be limited on its own.' },

    { type: 'explain', prompt: 'Explain to a new developer why every query in a multi-tenant app must be scoped by tenant, and where the tenant ID should come from.',
      model: 'Many companies share the same tables, so a query that only looks up an ID can return another customer’s data. Every query must include the tenant, and that tenant must come from the server-side session of the logged-in user, never from something the browser sends, because anything the browser sends can be changed. For extra safety the database can enforce it too, with row-level security.',
      keywords: ['tenant', 'session', 'query', 'row-level security', 'server', 'forged'] }
  ],

  flashcards: [
    { q: 'What is a tenant, and how does a user relate to it?', a: 'A tenant is a customer organisation whose data is kept separate. A user (a person) joins tenants through memberships, each carrying a role.' },
    { q: 'Why store the role on the membership, not the user?', a: 'One person can have different powers in different organisations: admin at one, viewer at another.' },
    { q: 'How does enterprise SSO work?', a: 'Your app redirects staff to their company’s identity provider (OIDC or SAML), gets back a signed proof of identity, verifies it and starts a session inside that tenant.' },
    { q: 'Three ways to isolate tenants, cheapest to strongest?', a: 'Shared tables with a tenant_id (often plus row-level security), a schema per tenant, a database per tenant.' },
    { q: 'How should API keys be handled?', a: 'Tenant-scoped and limited by scope. Show once, store only a hash, keep a visible prefix, allow rotation and instant revocation.' },
    { q: 'What should an audit log record?', a: 'Who did what, to which resource, when, from where, in which tenant. Append-only, no secrets, and visible to the tenant’s admins.' }
  ],

  glossary: [
    { term: 'Tenant', def: 'A customer organisation using a shared application, whose users and data must be kept separate from other customers’.', like: 'A flat in an apartment block.' },
    { term: 'Membership', def: 'The link between a user and a tenant, carrying that user’s role within that tenant.', like: 'A staff pass for one particular building.' },
    { term: 'Service account', def: 'A non-human identity with its own permissions, used by programs and automation.', like: 'The building’s delivery-robot badge, not any person’s.' },
    { term: 'API key scope', def: 'A limit on what an API key may do, such as read-only or one project only.', like: 'A hotel key card that opens your room and the gym, but not the manager’s office.', aka: ['scope'] },
    { term: 'Tenant isolation', def: 'The measures that stop one tenant from reading or affecting another’s data or performance.', like: 'The walls between flats.' }
  ],

  takeaways: [
    'Users join tenants through **memberships**; the **role** lives there.',
    'Enterprise customers want **SSO**: they own authentication; you verify the signature.',
    '**Scope every query by tenant** from the session, and enforce it in the database too.',
    'API keys: **scoped, hashed, revocable**. Keep an **audit log** of who did what.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cap-incident', {
  eli5: 'When a live system breaks in the middle of the night, the job is to stop the damage quickly, tell people what is going on, and only then work out why, calmly and without blaming anyone.',

  cards: [
    { kind: 'story', title: '3:07 a.m.',
      body: `Your phone screams. The alert reads: **checkout error rate 38%**. Your eyes are half open. A customer-support channel is already filling up with "can’t pay!!".

        You have a choice about what to do in the next five minutes, and most beginners choose badly. They dive straight into the code, hunting for the bug. It feels productive.

        The experienced answer is different: **work out how bad it is, work out what changed, and get the users back before you work out why.** This final lesson is not a system to design but a *situation* to survive. Every earlier lesson (monitoring, resilience, deployment) turns up here.` },

    { kind: 'metaphor', title: 'The emergency room',
      body: `In an emergency room, nobody starts by investigating how the patient came to be injured. A nurse **triages**: how serious is it, who is most at risk, what stops the bleeding *now*? Tests, history and the long fix come after the patient is stable.

        An incident works the same way:

        - **Stabilise** first (stop the bleeding).
        - **Diagnose** second (find out why).
        - **Cure** third (the proper fix).
        - **Learn** last (the postmortem).

        Where it stops being true: a patient cannot be rolled back to yesterday. Software often can, and that is its superpower.` },

    { kind: 'steps', title: 'The first ten minutes',
      body: 'A calm routine beats heroics at 3 a.m. Tap through.',
      steps: [
        { title: '1. Acknowledge the alert', body: 'Say you have it, so two people do not both investigate, and nobody assumes someone else will.' },
        { title: '2. Measure the impact', body: 'Who is affected, and how badly? Is it all users or one region? Is it 38% of checkouts failing or a slow page? This decides how many people to wake up.' },
        { title: '3. Declare an incident', body: 'If users are hurting, call it one: open a channel, name an **incident commander** (the person who coordinates, not necessarily the one who fixes), and start a timeline of what is seen and done.' },
        { title: '4. Ask "what changed?"', body: 'Most incidents are caused by a change. Check what happened shortly before the alerts started. It is the single most useful question you can ask.' },
        { title: '5. Pick a mitigation', body: 'Choose the quickest safe action that reduces harm, even if it is not a fix. More on this in a moment.' }
      ] },

    { kind: 'compare', title: 'What changed? Where to look',
      body: 'Systems rarely break by themselves. They break because something moved.',
      cols: ['Where to look', 'The clue'],
      rows: [
        ['A deployment', 'The deploy log or release tool', 'Errors begin within minutes of a release'],
        ['A configuration or feature flag', 'The config history and flag dashboard', 'Behaviour changed with no new code'],
        ['Traffic', 'Request-rate graph', 'A sudden spike: a launch, a bot or a retry storm'],
        ['A dependency', 'Provider status page, error rates to that service', 'Timeouts to one downstream call'],
        ['Resources and expiry', 'Disk, memory, connections, certificate dates', 'A slow climb to a limit, or a hard cliff on a date']
      ],
      note: 'If nothing changed on your side, the world might have: a payment provider, a cloud region, an expired certificate. "No deploys today" does not mean "no changes".' },

    { kind: 'sequence', title: 'From alert to cause: the observability ladder',
      body: 'You met three kinds of signal in the observability lessons. During an incident you use them in a sensible order.',
      actors: ['You', 'Dashboard', 'Logs', 'Traces'],
      steps: [
        { from: 0, to: 1, label: 'what is broken, how much?', note: '**Metrics** answer "is it bad, since when, how widely?". Error rate, latency and traffic. The graph shows the problem began at 02:58.' },
        { from: 1, to: 0, label: 'errors up only on /checkout', dashed: true, note: 'One endpoint, not the whole site. That narrows the search a lot.' },
        { from: 0, to: 2, label: 'show errors for /checkout', note: '**Logs** tell you *what* went wrong in specific requests.' },
        { from: 2, to: 0, label: '"timeout calling payment-svc"', dashed: true, note: 'Now a clue: the checkout is waiting for the payment service.' },
        { from: 0, to: 3, label: 'trace a failing request', note: '**Traces** show where the time went across services.' },
        { from: 3, to: 0, label: '9 s inside payment-svc → database', dashed: true, note: 'The payment service is stuck on its database. And a deploy to it landed at 02:56. Suspect found.' }
      ] },

    { kind: 'concept', title: 'Mitigate first, fix later',
      body: `The cause may take hours to understand. The users do not have hours. So you separate two jobs: **mitigation** (reduce the harm now) and **fix** (remove the cause properly).

        Common mitigations, roughly from safest to riskiest:

        - **Roll back** the latest deploy.
        - **Turn off** a feature flag.
        - **Fail over** to a healthy region or replica.
        - **Scale up**, or **shed load** by blocking bots or rate limiting.
        - **Degrade gracefully**: switch off a non-essential feature (recommendations) to save the essential one (checkout).

        Rolling back is usually better than "fixing forward" at 3 a.m.: a rollback is a known state; a rushed patch is a new, untested change on a burning system. Save evidence (logs, graphs) before restarting things.` },

    { kind: 'diagram', title: 'A decision path for the first move',
      body: 'Not a rulebook, a way of thinking.',
      nodes: [
        { id: 'a', label: 'Alert: users affected', icon: '🚨', x: 1, y: 0, tone: 'bad' },
        { id: 'c', label: 'Did something change?', icon: '🔎', x: 1, y: 1, tone: 'accent' },
        { id: 'rb', label: 'Roll back / flag off', icon: '↩️', x: 0, y: 2, tone: 'good' },
        { id: 'dep', label: 'Check dependencies', icon: '🔗', x: 2, y: 2, tone: 'info' },
        { id: 'ok', label: 'Recovered?', icon: '✅', x: 1, y: 3, tone: 'accent' },
        { id: 'dig', label: 'Then find root cause', icon: '🔬', x: 1, y: 4, tone: 'muted' }
      ],
      edges: [
        { from: 'a', to: 'c' },
        { from: 'c', to: 'rb', label: 'yes, ours' },
        { from: 'c', to: 'dep', label: 'not sure' },
        { from: 'rb', to: 'ok' },
        { from: 'dep', to: 'ok', label: 'mitigate' },
        { from: 'ok', to: 'dig' }
      ],
      caption: 'Both branches meet at the same question: have users recovered? Only after that do you slow down and dig.' },

    { kind: 'example', title: 'Communicating: say what you know',
      body: `Silence is the second outage. Support, managers and customers all want to know what is happening, and without updates they will interrupt the people trying to fix it.

        **Weak update:**
        > "We are looking into some issues."

        **Strong update:**
        > "03:20. Impact: about 40% of card payments are failing for all customers. Cause: unknown; a deploy to the payment service at 02:56 is the leading suspect. Action: rolling it back now. Next update at 03:45, or sooner."

        A good update has **impact, what we know, what we are doing and when the next update comes**. Post it on a schedule, even when the news is "no change". Keep a separate channel for the people fixing it, and let one person speak to the outside world.` },

    { kind: 'concept', title: 'The blameless postmortem',
      body: `A day later, with everyone rested, you write a **postmortem**: a short document about what happened. Its purpose is not to find a culprit, but to make the *system* harder to break.

        A good one has: a **timeline**, the **impact** (who, how long), **contributing causes**, what **went well**, and **action items** with owners and dates.

        **Blameless** means we assume people made sensible choices with the information they had. If an engineer could ship a broken change to production with one click, the question is not "who clicked?" but "why was that possible?" People who fear blame hide mistakes. People who are safe to be honest help you find the real causes.` },

    { kind: 'pitfall', title: '"Human error" is where the investigation starts',
      body: `The lazy conclusion to a postmortem is "root cause: engineer made a mistake". It feels final. It teaches nothing, and the same mistake will happen again to someone else.

        Ask "why?" a few times instead:

        - *Why did the bad change go live?* No automated test covered that path.
        - *Why wasn’t it caught in staging?* Staging’s database is tiny, so the slow query looked fine.
        - *Why did it hit everyone at once?* The release had no gradual rollout.
        - *Why did we find out from customers?* No alert on payment failures.

        Real incidents usually have **several contributing causes**. Each one is an action item. Honest fixes make the *next* person safe.` }
  ],

  activities: [
    { type: 'order', after: 2, prompt: 'Put the first minutes of an incident in a sensible order.',
      items: ['Acknowledge the alert', 'Measure who is affected and how badly', 'Declare an incident and name a commander', 'Ask what changed recently', 'Apply the quickest safe mitigation'],
      explain: 'Claim it, size it, organise people, then look for the cause and reduce the harm. Rushing straight to the code skips the steps that stop you duplicating work.' },

    { type: 'match', after: 3, prompt: 'Match each clue to the most likely kind of change.',
      pairs: [['Errors started two minutes after a release', 'A deployment'], ['Behaviour changed, but no code was shipped', 'A configuration or feature-flag change'], ['Requests jumped tenfold in a minute', 'A traffic spike or a retry storm'], ['Timeouts only on calls to one outside provider', 'A failing dependency'], ['Everything failed at exactly midnight on a date', 'An expired certificate or similar deadline']] },

    { type: 'mcq', after: 5, q: 'At 3 a.m. a release is the obvious suspect and rolling back takes two minutes. Finding the actual bug may take hours. What should you do?',
      options: ['Roll back first, then investigate the bug calmly', 'Keep the release live and write a patch', 'Restart every server to see if it helps', 'Wait for the morning team'],
      answer: 0,
      why: [null, 'A rushed patch is a new, untested change on a system already in trouble, and customers stay hurt while you write it.', 'Restarting without a reason can destroy evidence and rarely fixes a bad release.', 'Customers are failing to pay now. Waiting turns an incident into a longer one.'],
      explain: 'Mitigation restores service from a known-good state. The proper fix can wait until people are awake and calm. A rollback is the safest first move when a recent change is the likely cause.' },

    { type: 'bucket', prompt: 'Is it a mitigation or a root-cause fix?', buckets: ['Mitigation (stop the harm now)', 'Fix (remove the cause)'],
      items: [['Roll back the release', 0], ['Rewrite the slow database query', 1], ['Turn off the recommendations feature to protect checkout', 0], ['Add a missing index to the table', 1], ['Block a bot that is flooding the login page', 0], ['Add a test that would have caught the bug', 1]],
      explain: 'A mitigation makes users better off straight away and is easy to undo. A fix changes the system so the cause cannot recur, and deserves care and review.' },

    { type: 'scenario', title: 'Production is down',
      intro: 'It is 3:07 a.m. You are on call. The alert says checkout errors are at 38%, support is panicking, and the CEO’s phone is about to light up.',
      meters: { 'customer impact': 40, 'team calm': 70, 'evidence kept': 80 },
      steps: [
        { text: 'You have just woken up. What is your first action?',
          choices: [
            { label: 'Acknowledge, then check the dashboard to see how widespread it is', score: 2, effects: { 'team calm': 10 }, feedback: 'Acknowledging stops duplicated effort; the dashboard tells you whether this is all users or a corner, and how serious it is.' },
            { label: 'Open the code and look for the bug', score: 0, effects: { 'customer impact': -15, 'team calm': -10 }, feedback: 'You have no idea what is broken, and users are failing the whole time you read. Start with scope.' },
            { label: 'Wake the whole engineering team immediately', score: 1, effects: { 'team calm': -20 }, feedback: 'It might be needed, but you do not yet know the scale. Waking everyone for an unmeasured problem burns trust and sleep.' }
          ] },
        { text: 'The graph shows errors began at 02:58. The deploy log shows a release to the payment service at 02:56. What now?',
          choices: [
            { label: 'Roll the payment service back to the previous version', score: 2, effects: { 'customer impact': 35, 'team calm': 10 }, feedback: 'Two minutes, a known good state, and a strong suspect. Errors fall within minutes.' },
            { label: 'Dig through logs for an hour to be certain it is the release', score: 1, effects: { 'customer impact': -15 }, feedback: 'You will learn more, but customers fail the whole time. Rolling back would have tested the theory and helped.' },
            { label: 'Restart every server in the checkout path', score: 0, effects: { 'customer impact': -10, 'evidence kept': -30 }, feedback: 'You throw away the logs and memory state that would explain what happened, and it will not fix a bad release.' }
          ] },
        { text: 'It is 03:25 and errors are dropping. Managers are asking for news every few minutes. What do you do about communication?',
          choices: [
            { label: 'Post a structured update (impact, what we know, action, next update time) and set a schedule', score: 2, effects: { 'team calm': 20 }, feedback: 'Everyone gets the same facts in one place, and nobody needs to interrupt you for them.' },
            { label: 'Reply to each person privately as they ask', score: 0, effects: { 'team calm': -20, 'customer impact': -10 }, feedback: 'You are now a help desk instead of an engineer, and different people hear different versions.' },
            { label: 'Say nothing until you know the root cause', score: 1, effects: { 'team calm': -15 }, feedback: 'Understandable, but silence breeds rumours and interruptions. People need status more than a diagnosis.' }
          ] },
        { text: 'Service is restored. The team lead says "let’s find out whose change this was." What is the best response?',
          choices: [
            { label: 'Propose a blameless postmortem: timeline, contributing causes and action items', score: 2, effects: { 'team calm': 20, 'evidence kept': 15 }, feedback: 'You will find out *why the change could reach everyone*, which is the part you can fix, without making people afraid to report problems.' },
            { label: 'Find the author and make an example', score: 0, effects: { 'team calm': -35 }, feedback: 'Everyone learns to hide mistakes, and the next incident takes longer to understand.' },
            { label: 'Skip the review: it is fixed now', score: 1, effects: { 'evidence kept': -20 }, feedback: 'The same gaps (no gradual rollout, no payment alert) remain and will produce the next incident.' }
          ] }
      ],
      outro: 'Pattern: **size it, find what changed, mitigate before you diagnose, keep people informed, and learn without blame**.' },

    { type: 'spot', prompt: 'Here is the conclusion of a draft postmortem. Tap the line that breaks the "blameless" rule.',
      code: { lang: 'text', src: `
        Impact: 40% of payments failed for 31 minutes.
        Detection: a customer tweeted at 03:02; our alert fired at 03:07.
        Cause: Dev Sam pushed a bad query and did not test it.
        Mitigation: the release was rolled back at 03:30.
        Action: add a payment-failure alert and gradual rollouts.` },
      lines: [3],
      explain: 'Line 3 names a person and stops at their mistake. A blameless version describes the system: "a slow query reached production because no test covered it and the release went to everyone at once". Those are things you can fix.' },

    { type: 'tf', statement: 'During an incident, a status update is only worth sending once you have found the root cause.', answer: false,
      explain: 'People need impact, what is known, what is being done and when the next update will arrive. "Cause unknown, rolling back, next update at 03:45" is useful. Silence is not.' },

    { type: 'short', q: 'What is the first question to ask when a previously working system suddenly breaks: "what ... ?" (one word)', accept: ['changed', 'change', 'what changed'], hint: 'Deploys, config, traffic, dependencies…',
      explain: 'Most incidents follow a change: a release, a config edit, a traffic shift or something at a dependency. "What changed?" gives you the most promising suspect fastest.' },

    { type: 'explain', prompt: 'A new colleague asks why we roll back first and investigate later. Explain it in your own words.',
      model: 'While we investigate, customers are still being hurt. A rollback returns the system to a state we know worked, quickly and with little risk, whereas a rushed fix is a new untested change. Once service is restored there is no pressure, so we can read logs and traces carefully, find the real cause and fix it properly. Mitigation stops the harm; the fix removes the cause.',
      keywords: ['rollback', 'customers', 'known', 'mitigate', 'untested', 'cause'] }
  ],

  flashcards: [
    { q: 'What is the first response to an alert that users are affected?', a: 'Acknowledge it, measure the impact (who and how badly), and declare an incident if users are hurting.' },
    { q: 'Why ask "what changed?" first?', a: 'Most incidents follow a change: a deploy, a config or flag edit, a traffic shift, or a dependency problem. It is the quickest route to a suspect.' },
    { q: 'What does "mitigate first, fix later" mean?', a: 'Restore service with the quickest safe action (rollback, flag off, fail over, shed load) before hunting the true root cause.' },
    { q: 'What makes a good incident update?', a: 'Impact, what you know, what you are doing and when the next update will be, posted on a schedule, even if nothing has changed.' },
    { q: 'What does a blameless postmortem contain, and why blameless?', a: 'Timeline, impact, contributing causes, what went well and owned action items. Blameless so people report honestly and you fix the system, not the person.' }
  ],

  glossary: [
    { term: 'Incident', def: 'An unplanned event that harms or threatens the service users rely on, and needs a coordinated response.', like: 'A fire alarm, not a flickering bulb.' },
    { term: 'Incident commander', def: 'The person who coordinates the response, assigns tasks and keeps the timeline, rather than doing all the debugging themselves.', like: 'The conductor of the orchestra.' },
    { term: 'Mitigation', def: 'An action that reduces harm quickly without fixing the underlying cause, such as a rollback or a feature switched off.', like: 'A plaster before the stitches.' },
    { term: 'Postmortem', def: 'A written review after an incident covering what happened, why, and what will change.', like: 'A flight investigation report.', aka: ['incident review'] },
    { term: 'Blameless culture', def: 'Treating mistakes as signs of weak systems rather than bad people, so everyone can report problems honestly.', like: 'A safe-to-fail workshop.' }
  ],

  takeaways: [
    '**Triage first**: size the impact, call an incident, ask **"what changed?"**',
    '**Mitigate before you diagnose**: roll back, flag off, fail over, shed load.',
    'Communicate on a **schedule**: impact, what we know, what we are doing, next update.',
    'Write a **blameless postmortem**: several causes, owned action items, no culprit.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('capstones', {
  title: 'The Architect’s Gauntlet',
  intro: 'Eight systems stand between you and the architect’s hat: a link shortener, a chat, a feed, a checkout, a video site, a taxi app, a multi-tenant platform and a 3 a.m. outage. Use the method, make the calls, and pay attention to the trade-offs.',
  questions: [
    { type: 'short', q: 'Which redirect status code would a URL shortener choose if it wants every click to reach its servers so it can count them and change the link later?', accept: ['302', '307', '302 found', '307 temporary redirect'], hint: 'The temporary one.',
      explain: 'A **302** (or 307) is temporary, so browsers ask again every time. A 301 may be remembered by browsers, which saves load but hides clicks and makes the link harder to switch off.' },

    { type: 'mcq', q: 'In a chat app, why does the server give each message a sequence number per conversation instead of ordering by the time on the sender’s phone?',
      options: ['Phone clocks disagree; one server counter gives one agreed order', 'Phones cannot read the time while the app is closed', 'Timestamps are too large to store in a database', 'Sequence numbers make messages encrypted'],
      answer: 0,
      why: [null, 'Phones can read the time; the issue is that the clocks are not in agreement.', 'Timestamps are tiny. Size is not the concern.', 'Numbering has nothing to do with encryption.'],
      explain: 'Order only has to be agreed within one conversation, so a simple counter from one place per chat does the job. It also gives the offline "send me everything after number 410" catch-up for free.' },

    { type: 'mcq', q: 'A news feed pushes each new post into every follower’s feed. One account has 50 million followers. What is the best adjustment?',
      options: ['Do not push that account’s posts; merge them into feeds at read time', 'Push, but only to followers who are online right now', 'Delete the oldest followers to shrink the list', 'Switch all accounts to pull, to keep it consistent'],
      answer: 0,
      why: [null, 'It is a partial answer, but offline followers would then never see the post in their prepared feed.', 'Removing followers breaks the product.', 'It works but makes every ordinary reader’s feed slower to fix a problem only a few accounts cause.'],
      explain: 'The hybrid keeps push for the many (cheap and fast to read) and uses pull for the few accounts whose fan-out would be enormous.' },

    { type: 'multi', q: 'In a checkout, which of these help to take the money once and not oversell the stock?',
      options: ['An idempotency key on every payment request', 'An atomic stock update such as "decrement WHERE stock > 0"', 'A stock reservation with an expiry time', 'Checking the stock count first, then updating it in a separate step', 'Retrying the payment with a new random key each time'],
      answers: [0, 1, 2],
      explain: 'A repeatable payment request, an atomic update and an expiring hold together prevent double charges and overselling. Check-then-update leaves a race, and a fresh key per retry defeats the point of the key.' },

    { type: 'tf', statement: 'To keep costs down, a video service should pass video bytes through its app servers, because they already know who is allowed to watch.', answer: false,
      explain: 'App servers should handle small API calls and permissions; the bytes should come from a CDN, which is built for bulk delivery of cacheable segments.' },

    { type: 'order', prompt: 'Put the steps of the system design method in order.',
      items: ['Clarify the requirements', 'Estimate the scale', 'Sketch the API and data model', 'Draw the high-level design', 'Go deep on bottlenecks and trade-offs'],
      explain: 'Requirements decide what to build, the numbers show where the pressure will be, and only then do boxes and arrows make sense. The last step is where trade-offs are explained and defended.' },

    { type: 'bucket', prompt: 'Which system does each technique belong to?', buckets: ['URL shortener', 'Chat', 'News feed', 'Checkout'],
      items: [['Base62 keys', 0], ['Per-conversation sequence numbers', 1], ['Cursor pagination', 2], ['Payment idempotency key', 3], ['WebSocket gateways', 1], ['Push/pull hybrid for celebrities', 2], ['302 redirect and click queue', 0], ['Stock reservation with expiry', 3]],
      explain: 'Each system has its signature problem: short keys, ordered live delivery, huge fan-out, and money and stock that must be exact.' },

    { type: 'match', prompt: 'Match each requirement to the design that answers it.',
      pairs: [['Find nearby drivers without scanning all of them', 'A geospatial index: grid, geohash or quadtree'], ['A viewer’s network gets worse mid-video', 'Adaptive bitrate with several qualities'], ['Stop a script exporting other customers’ data', 'Tenant ID from the session, plus row-level security'], ['A payment request times out', 'Retry with the same idempotency key'], ['Phone was offline for an hour', 'Sync everything after the last seen sequence number']] },

    { type: 'spot', prompt: 'A ride-hailing matcher assigns the nearest free driver. Tap the lines that allow two riders to get the same driver.',
      code: { lang: 'js', src: `
        async function assign(rider) {
          const driver = await nearestFreeDriver(rider.cell);
          if (driver.status === 'free') {
            await setStatus(driver.id, 'busy');
            return startTrip(rider, driver);
          }
        }` },
      lines: [3, 4],
      explain: 'The check on line 3 and the update on line 4 are separate steps, so two riders can both see "free" before either marks the driver busy. The reservation must be one atomic "set busy only if free" step.' },

    { type: 'ab', q: 'It is 3 a.m. Errors began right after a release. Which first move is better?',
      a: { lang: 'text', label: 'Fix forward', src: `
        Keep the release live.
        Read the code to find the bug,
        write a patch, and deploy it.` },
      b: { lang: 'text', label: 'Roll back first', src: `
        Roll back to the previous release now.
        Confirm that errors fall.
        Investigate the bug in daylight.` },
      answer: 'b',
      explain: 'A rollback returns to a known good state in minutes and stops the harm. A rushed patch is a new, untested change on a system already in trouble. Mitigate first, fix later.' },

    { type: 'cloze', text: 'In a multi-tenant app a user’s role lives on the {{membership}}. Every query is scoped by {{tenant}} taken from the server-side session, and API keys are stored only as a {{hash}}.',
      distractors: ['cookie', 'index', 'webhook', 'cache'],
      explain: 'The membership allows different roles in different companies; the session tenant cannot be forged by the browser; and a hash means a leaked database does not leak working keys.' },

    { type: 'estimate', q: 'A shortener creates 100 million links a month (about 40 a second) and gets 100 clicks per link created. About how many redirects per second is that on average?',
      answer: 4000, unit: 'redirects per second', tolerance: 2,
      explain: '40 × 100 = 4,000 per second on average, with peaks several times higher. The read:write ratio is why the design leans on caches and replicas for reads.' }
  ]
});

KS.sheet('capstones', {
  title: 'Capstone designs: cheat sheet',
  sections: [
    { title: 'The method, every time',
      md: `1. **Requirements**: what must it do, and how well (fast, available, correct)?
        2. **Estimates**: users → requests per second → storage. Find the *ratio* that shapes the design (read:write, online:total).
        3. **API and data model**: the few calls and tables that matter.
        4. **High-level design**: boxes and arrows, then grow it version by version.
        5. **Deep dive**: bottlenecks, failure modes, trade-offs. Say what you gave up.

        Ask in each system: *what must be exact, what may be stale, what can wait on a queue?*` },

    { title: 'Signature problems',
      md: `| System | The hard part | The answer |
        |---|---|---|
        | URL shortener | Hot reads, unique keys, abuse | Cache, base62 keys, rate limits, 302 |
        | Chat | Live, ordered, not lost | WebSockets, sequence numbers, client IDs |
        | News feed | One post, millions of feeds | Push for many, pull for celebrities |
        | Checkout | Money and stock exact | Reservations, idempotency keys, saga |
        | Video | Huge files, global viewers | Object storage, transcoding queue, CDN, ABR |
        | Ride-hailing | Moving dots, one driver per trip | Geo index, atomic reserve, in-memory positions |
        | Multi-tenant auth | Walls between customers | Memberships, SSO, tenant scoping, audit log |` },

    { title: 'Patterns that keep recurring',
      md: `- **Cache the hot read**, and keep an off-switch for bad data.
        - **Queue the slow work**: analytics, transcoding, notifications.
        - **Idempotency key** on anything that moves money or sends something.
        - **Atomic reserve** for unique resources: last item, free driver.
        - **Save first, deliver second** (chat); **publish last** (video).
        - **Store IDs, not copies**: feeds point at posts.
        - **Ephemeral vs durable**: presence and positions in memory; messages, orders and payments in a database.` },

    { title: 'Choices and their price',
      md: `| Choice | Gain | Price |
        |---|---|---|
        | 301 vs 302 | 301: less load | Undercounted clicks, hard to change |
        | Push feed | Fast reads | Heavy writes, celebrity problem |
        | Pull feed | Cheap writes | Slower reads |
        | Offset paging | Simple | Repeats and gaps in live lists |
        | Cursor paging | Stable, cheaper | Cannot jump to "page 9" |
        | Shared tables | Cheap tenants | Isolation depends on correct queries |
        | DB per tenant | Strongest walls | Cost and migrations |` },

    { title: 'Checkout and tenancy checklist',
      md: `**Checkout:** atomic \`UPDATE … WHERE stock > 0\`; reserve with an expiry; same idempotency key on every retry; saga steps each with an undo (release, refund, cancel); save the order as pending *before* charging; handle webhooks twice; reconcile.

        **Multi-tenant:** user ↔ tenant via **membership** (role there); tenant ID from the **session**; row-level security as a second wall; SSO per tenant (OIDC/SAML); API keys scoped, hashed, rotatable; **audit log** of logins, role changes, exports.` },

    { title: 'Incident playbook',
      md: `1. **Acknowledge**, then **measure impact** (who, how many, since when).
        2. **Declare** an incident; name a **commander**; keep a timeline.
        3. **What changed?** Deploy, config or flag, traffic, dependency, expiry.
        4. **Mitigate first**: roll back, flag off, fail over, shed load, degrade.
        5. **Read the signals**: metrics (how bad), logs (what), traces (where).
        6. **Update on a schedule**: impact, known, doing, next update time.
        7. **Postmortem**, blameless: timeline, impact, contributing causes, owned actions.

        "Human error" is where the investigation starts, not where it ends.` }
  ]
});

