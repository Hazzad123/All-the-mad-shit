/* Module: system-design — The System Design Method.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs system-design */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sdm-framework', {
  eli5: 'System design is deciding what boxes a system needs and how they connect. A five-step routine (ask, estimate, sketch the interface, draw the boxes, then dig into the hard parts) stops you freezing at a blank page or leaping to tools.',

  cards: [
    { kind: 'concept', title: 'The brief is vague on purpose',
      body: `Someone hands you one line: **"Design a parcel-tracking website."**

        Where do you even start? Many people freeze. Others leap straight to answers: *"We'll need microservices, Kafka and a global database!"* Both are mistakes, and for the same reason: they skipped finding out **what is actually being asked**.

        Real briefs are vague. "Make it fast." "It needs to scale." "Like the one we had, but better." Nobody tells you how many users, how fresh the data must be, or what happens when something breaks.

        Good designers use a **repeatable method** that turns a vague sentence into a design they can defend, one question at a time.` },

    { kind: 'metaphor', title: 'The architect and the client',
      body: `A good building architect does not arrive and start pouring concrete. First comes a conversation: *How many people will live here? What is your budget? Do you need step-free access?*

        Then a rough **sketch** on one sheet of paper: where the rooms go, roughly. The client says "yes, that is the idea" or "no, move the kitchen".

        Only then do the **detailed drawings** for the tricky bits: the roof, the foundations, the drains.

        System design follows the same order: **ask, size, sketch, then detail the risky parts**. Where the metaphor stops: a house is finished once built. A system keeps changing, so designs are written to be revised.` },

    { kind: 'steps', title: 'The five steps',
      body: 'The same five steps work for a parcel tracker, a chat app or a payment system. Tap through them in order.',
      steps: [
        { title: '1. Clarify the requirements', body: 'Ask who uses it, what it must do and how well. Agree what is **in** and **out** of scope. This is the step most often skipped, and the one that matters most.' },
        { title: '2. Estimate the scale', body: 'Turn "lots of users" into numbers: requests per second, storage, bandwidth. A rough answer is enough to choose between a simple design and a heavy one.' },
        { title: '3. Define the API and data model', body: 'Write down the operations the system offers and the main things it stores. This is the contract that everything else hangs off.' },
        { title: '4. Sketch the high-level design', body: 'Boxes and arrows: the main components and how a request flows through them. Keep it simple. Start with the smallest design that could work.' },
        { title: '5. Dive deep and discuss trade-offs', body: 'Pick the riskiest or most interesting parts. For each, say what you chose, what you gave up, and what would make you change your mind.' }
      ] },

    { kind: 'sequence', title: 'Step 1 in action: asking before drawing',
      body: 'Here is the start of a good conversation about the parcel tracker. Notice that **nobody has drawn a box yet**.',
      actors: ['You', 'Client'],
      steps: [
        { from: 1, to: 0, label: 'Design a parcel-tracking website', note: 'The vague brief arrives.' },
        { from: 0, to: 1, label: 'Who uses it?', note: 'First, find out who the users are. Different users mean different needs.' },
        { from: 1, to: 0, label: 'Customers look up, couriers send scans', dashed: true, note: 'Two kinds of user: **readers** (customers) and **writers** (courier scanners). That already shapes the design.' },
        { from: 0, to: 1, label: 'Do customers need alerts?', note: 'A feature question: is it in scope?' },
        { from: 1, to: 0, label: 'Nice to have, not version one', dashed: true, note: 'Agreed out of scope. Writing this down protects you from endless extras later.' },
        { from: 0, to: 1, label: 'How fresh must status be?', note: 'A quality question. This one changes the design a lot.' },
        { from: 1, to: 0, label: 'Within a minute is fine', dashed: true, note: 'That is far looser than "instant". It permits caching and slightly delayed updates.' },
        { from: 0, to: 1, label: 'What if a data centre fails?', note: 'Another quality question: how reliable must it be?' },
        { from: 1, to: 0, label: 'Lookups must almost never go down', dashed: true, note: 'Now you have a goal to design towards, not just a feature list.' }
      ] },

    { kind: 'compare', title: 'Two kinds of requirement',
      body: 'Every requirement is one of two types. Beginners remember the first and forget the second, even though the second drives the architecture.',
      cols: ['Functional', 'Non-functional'],
      rows: [
        ['**Means**', 'What the system **does**', 'How **well** it does it'],
        ['**Parcel tracker example**', 'Look up a parcel; record a courier scan', 'Status within a minute; lookups nearly always available'],
        ['**Typical words**', 'Create, search, send, show', 'Fast, reliable, secure, scalable, cheap'],
        ['**Question to ask**', '"What must a user be able to do?"', '"How many, how fast, how reliable?"'],
        ['**If you skip it**', 'You build the wrong product', 'You build a product that falls over']
      ] },

    { kind: 'concept', title: 'Step 2: turn adjectives into numbers',
      body: `"Lots of parcels" cannot be designed for. **Numbers** can. Suppose the client says 5 million parcels a day, each producing about 6 scan events (collected, at depot, out for delivery…), and customers check each parcel about 4 times.

        | Question | Rough working | Answer |
        |---|---|---|
        | Scans per day | 5M × 6 | 30M |
        | Scans per second | 30M ÷ 86,400 | about 350 |
        | Lookups per second | 20M ÷ 86,400 | about 230 |
        | Daily storage | 30M × 200 bytes | about 6 GB |

        Busy times are maybe 3× the average. So roughly 1,000 writes and 700 reads a second at peak: **modest**. One decent database could cope. Reliability, not raw speed, is the real challenge. The next lesson teaches this arithmetic properly.` },

    { kind: 'code', title: 'Step 3: the API and the data model',
      body: 'Write down the **operations** and the **things stored**. A few lines is plenty. **Tap the lines.**',
      code: { lang: 'text', src: `
        API
          GET  /parcels/{id}            status and history
          POST /parcels/{id}/events     a courier scan

        Data
          parcels(tracking_id, recipient, created_at)
          events(id, tracking_id, status, scanned_at)`,
        notes: {
          1: 'The **API** is the list of operations the outside world can ask for. This is the contract.',
          2: 'A read for customers. The `{id}` is the tracking number.',
          3: 'A write for couriers. It adds an event to a parcel\'s history.',
          5: 'The **data model** says what is stored and how things relate.',
          6: 'One row per parcel. The tracking number identifies it.',
          7: 'Many events per parcel, each pointing back to its parcel. The history is just the events, in time order.'
        } },
      note: 'Notice how the earlier steps fed in: two kinds of user gave two operations, and the numbers say one database table can hold it all.' },

    { kind: 'diagram', title: 'Step 4: the first sketch',
      body: 'Start with the **smallest design that satisfies the requirements**. Complexity can be added later, but only when a number or a failure demands it.',
      nodes: [
        { id: 'cust', label: 'Customers', icon: '📱', x: 0, y: 0 },
        { id: 'scan', label: 'Courier scanners', icon: '📦', x: 2, y: 0 },
        { id: 'lb', label: 'Load balancer', icon: '🔀', x: 1, y: 1 },
        { id: 'app', label: 'App servers (x2)', icon: '🖥️', x: 1, y: 2, tone: 'accent' },
        { id: 'db', label: 'Database', icon: '🗄️', x: 1, y: 3, tone: 'good' },
        { id: 'rep', label: 'Standby replica', icon: '🛟', x: 2, y: 3, tone: 'info' }
      ],
      edges: [
        { from: 'cust', to: 'lb', label: 'GET status' },
        { from: 'scan', to: 'lb', label: 'POST scan' },
        { from: 'lb', to: 'app' },
        { from: 'app', to: 'db' },
        { from: 'db', to: 'rep', label: 'copies', dashed: true }
      ],
      caption: 'Two app servers and a standby database for reliability (a requirement), not for speed (the numbers say we do not need it).' },

    { kind: 'example', title: 'Step 5: trade-offs, said out loud',
      body: `Deep dives are about **choices**. For each, say what you picked, why, and what it costs. Take caching the status lookups:

        - **Choice:** keep recent parcel statuses in a cache for 30 seconds.
        - **Because:** the client said "within a minute is fine", and lookups are read-heavy.
        - **At the cost of:** a customer might see a status up to 30 seconds old.
        - **Revisit if:** the client decides that alerts must be instant.

        That four-part habit (**choice, because, cost, revisit-if**) turns an opinion into a design decision. There is no perfect answer; there is only an answer that fits *these* requirements, with its price stated.` },

    { kind: 'pitfall', title: 'The classic mistakes',
      body: `- **Jumping to the answer.** "Let's use Kafka" before you know there is anything to queue.
        - **Skipping the non-functionals.** A design that handles 10 users beautifully and 10 million not at all.
        - **Designing for imaginary scale.** Building for a billion users when the client has a thousand. Complexity is a cost.
        - **Buzzword soup.** Naming ten technologies without saying what each one is *for*.
        - **No assumptions written down.** If you guess a number, say "I'll assume 5 million a day" so it can be corrected.
        - **Silent trade-offs.** Choosing without saying what you gave up.`,
      note: 'You are not graded on knowing the most tools. You are graded on asking good questions, using numbers, and being honest about trade-offs.' }
  ],

  activities: [
    { type: 'order', after: 2, prompt: 'Put the five steps in order.',
      items: ['Clarify the requirements', 'Estimate the scale', 'Define the API and data model', 'Sketch the high-level design', 'Dive deep and discuss trade-offs'],
      explain: 'Each step feeds the next: requirements give you the numbers to estimate, estimates and operations shape the sketch, and the sketch shows where the risky parts are to dive into.' },

    { type: 'bucket', after: 4, prompt: 'Is each a functional or a non-functional requirement?', buckets: ['Functional', 'Non-functional'],
      items: [['A customer can look up a parcel by tracking number', 0], ['Status updates appear within one minute', 1], ['A courier scan adds an event to the history', 0], ['The lookup page is available almost all the time', 1], ['Customers can print a delivery receipt', 0], ['The system copes with a peak of 700 lookups per second', 1]],
      explain: 'Functional requirements are features: what a user can do. Non-functional requirements say how fast, how reliable and how big, and they usually decide the architecture.' },

    { type: 'mcq', after: 5, q: 'The estimate shows about 1,000 writes and 700 reads per second at peak. What does that suggest?',
      options: ['A simple design with one database can cope; reliability matters more than raw speed', 'You must split the data across many database servers straight away', 'A global network of caches is essential', 'The numbers are too small to design with'],
      answer: 0,
      why: [null, 'Those rates are modest for one well-run database, so sharding would be over-engineering.', 'A cache might help later, but the numbers do not demand a global network.', 'Even rough numbers are useful. They stop you building too much.'],
      explain: 'Numbers are for choosing proportionately. At these rates a single database copes, so effort goes into reliability (a replica, two app servers) instead.' },

    { type: 'tf', statement: 'In step 1 you should avoid asking questions, because the interviewer or client wants to see you design quickly.', answer: false,
      explain: 'Clarifying questions are the point of step 1. Designing the wrong thing quickly is worse than asking for two minutes and designing the right thing.' },

    { type: 'match', prompt: 'Match each step to what it produces.',
      pairs: [['Clarify requirements', 'An agreed scope and quality goals'], ['Estimate the scale', 'Rough numbers: requests, storage, bandwidth'], ['API and data model', 'The operations offered and the things stored'], ['High-level design', 'Boxes and arrows showing how a request flows'], ['Deep dive and trade-offs', 'Reasoned choices with their costs stated']] },

    { type: 'ab', q: 'Given "Design a parcel-tracking website", which opening is stronger?',
      a: { lang: 'text', label: 'Ask first', src: `
        Before I draw anything: who uses it,
        how many parcels a day, and how fresh
        must the status be?` },
      b: { lang: 'text', label: 'Answer first', src: `
        I would build microservices on Kafka
        with a globally distributed database.` },
      answer: 'a',
      explain: 'The first opening gathers what the design depends on. The second picks technology before knowing whether any of it is needed, which is the most common design mistake.' },

    { type: 'cloze', text: 'A good trade-off statement names the {{choice}}, the {{reason}}, the {{cost}}, and what would make you {{revisit}} it.',
      distractors: ['logo', 'password', 'hostname'],
      explain: 'Choice, because, cost, revisit-if. It makes the decision explicit and shows you know it is not free.' },

    { type: 'scenario', title: 'The vague brief', intro: 'Your manager says: "We need a notification system. Make it scale." You have a whiteboard and thirty minutes. Your reputation for clear thinking is on the line.',
      meters: { clarity: 30, 'wasted effort': 0 },
      steps: [
        { text: 'What do you do first?',
          choices: [
            { label: 'Ask: notifying whom, about what, by which channels, and how many a day?', score: 2, effects: { clarity: 30 }, feedback: 'Exactly. Scope and scale first. You now know what "notification system" actually means here.' },
            { label: 'Start drawing queues and workers', score: 0, effects: { clarity: -10, 'wasted effort': 25 }, feedback: 'You are solving a problem nobody has described. Half of this drawing will be wrong.' },
            { label: 'Say "scale to a billion users" as the target to be safe', score: 0, effects: { clarity: -5, 'wasted effort': 30 }, feedback: 'Designing for imaginary scale is expensive. Ask for real numbers.' }
          ] },
        { text: 'They say: "email and push, about 2 million a day, and they should arrive within a minute". What next?',
          choices: [
            { label: 'Estimate: 2M a day is about 23 a second on average, say 70 at peak, so a modest design suffices', score: 2, effects: { clarity: 25 }, feedback: '2,000,000 ÷ 86,400 is about 23. Numbers show that this is a small problem and keep you from over-building.' },
            { label: 'Skip the numbers; "2 million" sounds big, so plan for sharding', score: 0, effects: { 'wasted effort': 25 }, feedback: '2 million a day sounds large but is only tens per second. Doing the division prevents panic.' },
            { label: 'Ask for the exact peak to the nearest request', score: 1, effects: { clarity: 5, 'wasted effort': 10 }, feedback: 'Nobody knows that precisely, and you do not need it. A rough multiple of the average is enough.' }
          ] },
        { text: 'Time to present your design. How do you handle the choices you made?',
          choices: [
            { label: 'For each major choice, state the reason, the cost, and when you would revisit it', score: 2, effects: { clarity: 25 }, feedback: 'That is the habit that makes a design defensible and easy to evolve.' },
            { label: 'Present it as the one correct answer', score: 0, effects: { clarity: -20 }, feedback: 'Every design is a bundle of trade-offs. Pretending otherwise hides risks and invites hard questions you have not prepared for.' },
            { label: 'List every technology you know to show breadth', score: 0, effects: { clarity: -15, 'wasted effort': 20 }, feedback: 'A list of tools with no reasons is buzzword soup, not a design.' }
          ] }
      ],
      outro: 'The method in one line: **ask, size, sketch, then explain your choices and their costs.**' },

    { type: 'explain', prompt: 'A friend says system design is "knowing which technologies to use". Explain, in your own words, what the five-step method is really about.',
      model: 'It is mostly about thinking in a good order. First clarify the requirements, both what the system does and how well, then estimate the scale with rough numbers. Define the API and data model, sketch a simple high-level design, and finally dig into the risky parts, stating each trade-off with its cost. Technologies come last and are chosen to fit those requirements, not the other way round.',
      keywords: ['requirements', 'estimate', 'API', 'data model', 'high-level', 'trade-offs', 'scale'] }
  ],

  flashcards: [
    { q: 'What are the five steps of the design framework?', a: 'Clarify requirements, estimate the scale, define the API and data model, sketch the high-level design, then dive deep and discuss trade-offs.' },
    { q: 'Functional vs non-functional requirements?', a: 'Functional: what the system does (features). Non-functional: how well it does it (speed, reliability, scale, security). The second kind drives the architecture.' },
    { q: 'Why estimate before designing?', a: 'Rough numbers (requests per second, storage, bandwidth) show whether a simple design is enough or you need something heavier.' },
    { q: 'What goes in a trade-off statement?', a: 'The choice, the reason, the cost, and what would make you revisit it.' },
    { q: 'Name three classic design mistakes.', a: 'Jumping to technology before asking questions, skipping non-functional requirements, and designing for imaginary scale.' }
  ],

  glossary: [
    { term: 'Functional requirement', def: 'Something the system must do, such as "look up a parcel by tracking number".', like: 'A feature on the product page.' },
    { term: 'Non-functional requirement', def: 'A quality the system must have: how fast, how reliable, how many users, how secure.', like: 'The strength of a bridge rather than where it goes.' },
    { term: 'Scope', def: 'The agreed boundary of what the design includes and what it deliberately leaves out.', like: 'The line on a builder\'s plan around the extension.' },
    { term: 'High-level design', def: 'A simple picture of the main components and how a request flows through them.', like: 'The one-page sketch before the detailed drawings.' },
    { term: 'Trade-off', def: 'A choice where gaining one benefit costs something else, such as speed in return for slightly stale data.', like: 'Faster train, fewer seats.' }
  ],

  takeaways: [
    '**Ask first.** Clarify what it does (functional) and how well (non-functional).',
    '**Turn adjectives into numbers**: even rough estimates choose between simple and heavy designs.',
    'Sketch the **smallest design that works**, then dive into the riskiest parts.',
    'State every trade-off: **choice, because, cost, revisit-if**.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sdm-estimation', {
  eli5: 'Back-of-the-envelope estimation is doing quick, rough sums (users, requests, bytes) to find out whether a system is small, medium or enormous before you design it.',

  cards: [
    { kind: 'concept', title: 'One server or a thousand?',
      body: `Two briefs land on your desk on the same morning:

        - a photo-sharing app for **one school**
        - a photo-sharing app for **a whole country**

        Same features. Same screens. Yet the first could run on one modest server, and the second needs a building full of machines, a global delivery network and a team on call.

        The only thing that tells them apart is **numbers**. And you do not need exact ones. Five minutes of rough sums on the back of an envelope tells you which of the two worlds you are in, before you spend a single hour drawing the wrong design.` },

    { kind: 'metaphor', title: 'Catering a wedding',
      body: `You are catering a wedding. Nobody knows exactly how much each guest will drink, and nobody needs to.

        *"About 120 guests, maybe three drinks each, call it 400 drinks. Glasses come in boxes of 50, so eight boxes, plus a spare."*

        That sum took ten seconds, was probably wrong by 20%, and was **completely good enough**. It told you to order boxes, not a lorry and not a single tray.

        System estimates work the same way. You are not predicting the future; you are finding the **right order of magnitude**. Where the metaphor stops: in software you often have no guest list at all, so you **state your guesses out loud** so someone can correct them.` },

    { kind: 'compare', title: 'Powers of two, rounded to powers of ten',
      body: 'Computers count in powers of two, but your head counts in tens. Luckily 2¹⁰ = 1,024 is almost exactly a thousand, so the two line up.',
      cols: ['Exactly', 'Roughly', 'Unit'],
      rows: [
        ['**2¹⁰**', '1,024', 'a thousand (10³)', 'Kilobyte (KB)'],
        ['**2²⁰**', '1,048,576', 'a million (10⁶)', 'Megabyte (MB)'],
        ['**2³⁰**', 'about 1.07 billion', 'a billion (10⁹)', 'Gigabyte (GB)'],
        ['**2⁴⁰**', 'about 1.1 trillion', 'a trillion (10¹²)', 'Terabyte (TB)'],
        ['**2⁵⁰**', 'about 1.13 quadrillion', '10¹⁵', 'Petabyte (PB)']
      ],
      note: 'Strictly, 1 KB is 1,000 bytes and 1,024 bytes is a KiB ("kibibyte"). For estimates the gap (2% to 13%) never matters, so treat them as the same.' },

    { kind: 'example', title: 'Numbers worth carrying in your head',
      body: `A handful of facts make most estimates quick. All are rough on purpose.

        | Thing | Roughly |
        |---|---|
        | Seconds in a day (86,400) | **10⁵** |
        | Seconds in a year (31.5 million) | **3 × 10⁷** |
        | 1 million a day | **about 12 a second** |
        | One English character | 1 byte |
        | A number ID | 8 bytes |
        | A short text post with its details | about 1 KB |
        | A web-sized photo | a few hundred KB |
        | A minute of HD video | tens of MB |

        You met the first row in *Web Servers & Scaling Out*. The rest are **assumptions**, not laws: say them out loud ("I'll assume 500 KB per photo") so anyone can challenge them.` },

    { kind: 'steps', title: 'From daily users to requests per second',
      body: 'The core move of every estimate. Our example: **Snapshot**, a photo app with 10 million daily active users.',
      steps: [
        { title: '1. Start with daily active users', body: '**DAU** means the number of different people who use the app on a typical day. Assume **10 million**.' },
        { title: '2. Multiply by actions per user', body: 'Each user views about 50 photos a day: 10M × 50 = **500 million views a day**. One user in ten uploads 2 photos: **2 million uploads a day**.' },
        { title: '3. Divide by seconds in a day', body: 'Use 10⁵. Views: 5 × 10⁸ ÷ 10⁵ = **5,000 a second**. Uploads: 2 × 10⁶ ÷ 10⁵ = **20 a second**.' },
        { title: '4. Multiply for the peak', body: 'Evenings are busier than 4 a.m. Use a [[peak factor]] of about 3: roughly **15,000 views** and **60 uploads** a second at peak.' },
        { title: '5. Compare reads to writes', body: '15,000 against 60 is **250 reads for every write**. That one ratio already shouts "cache it and serve it from close to the user".' }
      ] },

    { kind: 'code', title: 'Storage: what piles up over time',
      body: 'Storage is **writes × size × time**, plus copies. Here is the Snapshot sum as you would scribble it. **Tap the lines.**',
      code: { lang: 'text', src: `
        uploads per day     2 million
        size per photo      500 KB          (assumed)
        per day             2×10⁶ × 5×10⁵ B = 10¹² B = 1 TB
        per year            1 TB × 365      ≈ 400 TB
        with 3 copies       400 TB × 3      ≈ 1.2 PB
        five years          ≈ 6 PB`,
        notes: {
          1: 'From the previous card: one user in ten uploads two photos.',
          2: 'An **assumption**, written down so it can be challenged. Phones take bigger photos, but apps usually shrink them.',
          3: 'Turn both into powers of ten: 2 × 10⁶ photos times 5 × 10⁵ bytes. Multiply the 2 and the 5, add the powers: 10 × 10¹¹ = 10¹² bytes, which is a terabyte.',
          4: '365 rounds to 400 without fear. We want the size class, not the exact figure.',
          5: 'Real systems keep several copies so a dead disk loses nothing. Forgetting this is a classic slip.',
          6: 'Petabytes means this is not "a database column" but a job for dedicated file storage. That is the design decision the sum just made for you.'
        } },
      note: 'Text posts would be tiny by comparison: 2 million × 1 KB is only 2 GB a day. Media is what makes storage big.' },

    { kind: 'concept', title: 'Bandwidth: bytes per second, in and out',
      body: `**Bandwidth** is how much data flows per second. The sum is simple: **requests per second × size of each**.

        - **In** (uploads): 20 a second × 500 KB = 10 MB/s. Easy.
        - **Out** (views): 5,000 a second × 500 KB = **2.5 GB/s** on average, more at peak.

        Now the trap. Storage is measured in **bytes**, but network links are sold in **bits** per second (Mbps, Gbps), and one byte is 8 bits. So 2.5 GB/s is **20 Gbps**: far more than one server's network card can push.

        That single line tells you photos must be served from many machines near the users, not from your app servers.` },

    { kind: 'tip', title: 'Rounding without fear',
      body: `Beginners lose minutes on 86,400 and 365. Do not. Round every number to **one significant figure** and work in powers of ten:

        - 86,400 → 10⁵
        - 365 → 400 (or 300 if it makes the sum easier)
        - 1,024 → 1,000
        - 3 × 4 = 12 → 10

        Each rounding may be off by 10% to 30%, and that is fine. Design decisions change at **factors of ten**, not factors of 1.2: one server versus ten, gigabytes versus terabytes. If your answer is within two or three times of the truth, you will almost always pick the same design.

        What you must do is **show your working**, so a mistake is easy to spot.` },

    { kind: 'pitfall', title: 'Sanity checks that catch nonsense',
      body: `Rough is fine. **Absurd** is not. Before trusting an answer, run four quick checks:

        1. **Units.** Per day or per second? Bits or bytes? KB or MB? Most wrong answers are a unit slip worth 8×, 1,000× or 86,400×.
        2. **Real-world limits.** Does your user count exceed the world population (about 8 billion)? Does each person make 10,000 requests a day?
        3. **Work backwards.** 5,000 views a second for 10M users means 50 views each per day. Plausible? Yes.
        4. **The forgotten multipliers.** Peak traffic, extra copies, indexes and growth over several years.

        If a number surprises you, it is either a real insight or a mistake. Find out which.` },

    { kind: 'realworld', title: 'Turning numbers into decisions',
      body: `Estimates only matter if they change what you build. Some very rough working assumptions (real figures vary enormously with the work each request does):

        | Component | Rough comfortable load |
        |---|---|
        | One app server | hundreds to a few thousand simple requests/s |
        | One relational database | thousands of simple queries/s |
        | One in-memory cache node | around 100,000 simple reads/s |

        So 60 uploads a second is nothing; 15,000 views a second needs a [[cache]] and a [[CDN]]; 6 PB needs [[object storage]]. In the lab that follows you can turn the dials yourself: users → requests per second → storage → servers.` }
  ],

  activities: [
    { type: 'tf', after: 2, statement: '2³⁰ bytes is roughly a billion bytes, which is about one gigabyte.', answer: true,
      explain: '2¹⁰ is about a thousand, so 2³⁰ = (2¹⁰)³ is about a thousand cubed: 10⁹, a billion. That is a gigabyte, give or take 7%.' },

    { type: 'estimate', after: 4, q: 'A quiz app has 4 million daily active users, each answering about 25 questions a day. Each answer is one request. Roughly how many requests per second is that on average?',
      answer: 1000, unit: 'requests per second', min: 10, max: 100000, tolerance: 2,
      explain: '4M × 25 = 100 million a day = 10⁸. Divide by 10⁵ seconds: **about 1,000 a second** (1,157 with the exact 86,400). At peak, plan for two or three times that.' },

    { type: 'mcq', after: 6, q: 'Your servers send out 1.5 GB of data every second. A colleague says your network link is "10 gig". Is it enough?',
      options: ['No: 1.5 GB/s is 12 gigabits a second, more than a 10 Gbps link', 'Yes: 1.5 is far less than 10', 'Yes, but only at night when traffic is low', 'It cannot be answered without exact numbers'],
      answer: 0,
      why: [null, 'That compares bytes with bits. Network links are measured in bits, and a byte is 8 bits.', 'The average already exceeds the link, so the peak certainly does.', 'Rough numbers are enough here: 1.5 × 8 = 12, which is above 10.'],
      explain: 'Multiply bytes by 8 to get bits: 1.5 GB/s × 8 = 12 Gbps. A 10 Gbps link is already too small on average, before any peak.' },

    { type: 'match', prompt: 'Match each rough figure to what it means.',
      pairs: [['10⁵', 'Seconds in a day, rounded'], ['2¹⁰', 'About a thousand: a kilobyte'], ['3 × 10⁷', 'Seconds in a year, rounded'], ['1 million a day', 'About 12 per second'], ['8', 'Bits in one byte']] },

    { type: 'cloze', text: 'Requests per second = daily users × {{actions per user}} ÷ {{100,000}}, then multiply by a {{peak factor}} for busy times.',
      distractors: ['3,600', 'disk size', 'replica count', '1,024'],
      explain: 'Daily actions spread over about 10⁵ seconds gives the average. Traffic is uneven, so multiply by a peak factor of roughly 2 to 5 before sizing anything.' },

    { type: 'estimate', q: 'A messaging app stores 50 million messages a day, about 200 bytes each. Ignoring copies, roughly how much new storage is that per year, in terabytes?',
      answer: 3.65, unit: 'TB per year', min: 0.01, max: 1000, tolerance: 2,
      explain: '5 × 10⁷ × 200 B = 10¹⁰ B = 10 GB a day. Times 365 is about **3.6 TB a year**. Small enough for a database; add copies and indexes and it is still single-digit to low double-digit terabytes.' },

    { type: 'spot', prompt: 'This estimate is out by a huge factor. Tap the line with the mistake.',
      code: { lang: 'text', src: `
        users per day        20 million
        requests per user    30
        requests per day     6 × 10⁸
        requests per second  6 × 10⁸ ÷ 3,600 ≈ 170,000
        peak (× 3)           ≈ 500,000 per second` },
      lines: [4],
      explain: '3,600 is the number of seconds in an **hour**, not a day. Dividing by 10⁵ gives about **6,000 a second**, nearly 30× smaller. A unit slip like this turns a modest system into an imaginary giant.' },

    { type: 'estimate', q: 'A video site serves 2,000 streams at once, each at about 5 megabits per second. Roughly how much outgoing bandwidth is that, in gigabits per second?',
      answer: 10, unit: 'Gbps', min: 0.1, max: 1000, tolerance: 2,
      explain: '2,000 × 5 Mbps = 10,000 Mbps = **10 Gbps**. Streams are already in bits, so no ×8 this time. That is a whole network link on its own, which is why video lives on CDNs.' },

    { type: 'scenario', title: 'The two-minute estimate', intro: 'A product manager asks: "We are launching a recipe site. 1 million people a day, each viewing about 20 pages. Do we need a big expensive cluster?" You have a whiteboard and two minutes.',
      meters: { confidence: 40, 'time wasted': 0 },
      steps: [
        { text: 'How do you start the sum?',
          choices: [
            { label: '1M × 20 = 2 × 10⁷ page views a day; ÷ 10⁵ ≈ 200 a second', score: 2, effects: { confidence: 25 }, feedback: 'Clean powers-of-ten arithmetic. About 200 a second on average.' },
            { label: 'Ask for exact hourly traffic figures before saying anything', score: 0, effects: { confidence: -10, 'time wasted': 30 }, feedback: 'There are no figures yet: the site has not launched. State an assumption and get going.' },
            { label: 'Work out 20,000,000 ÷ 86,400 to three decimal places', score: 1, effects: { 'time wasted': 15 }, feedback: 'You get 231.481, which is right but slow. 200 would have led to the same decision.' }
          ] },
        { text: 'You have about 200 page views a second on average. What next?',
          choices: [
            { label: 'Apply a peak factor: about 3×, so plan for roughly 600 a second', score: 2, effects: { confidence: 20 }, feedback: 'Right. Dinner time is busy for a recipe site. You size for the peak, not the average.' },
            { label: 'Plan for exactly 200, since that is the measured average', score: 0, effects: { confidence: -15 }, feedback: 'An average hides the evening rush. The site would struggle exactly when people use it most.' },
            { label: 'Multiply by 1,000 to be safe', score: 0, effects: { 'time wasted': 25 }, feedback: 'That designs for imaginary scale. Safety margins are a factor of a few, not a thousand.' }
          ] },
        { text: 'Peak is about 600 pages a second, and the recipes rarely change. What do you tell the product manager?',
          choices: [
            { label: 'A few app servers and one database, with caching for the popular recipes', score: 2, effects: { confidence: 25 }, feedback: 'Proportionate. Mostly-unchanging pages cache superbly, so the database barely notices.' },
            { label: 'A sharded multi-region cluster, just in case', score: 0, effects: { confidence: -20, 'time wasted': 30 }, feedback: 'Huge cost and complexity for a load a handful of servers handle. Revisit only if the numbers grow tenfold.' },
            { label: 'One server, no backup at all', score: 1, effects: { confidence: -5 }, feedback: 'It might cope with the load, but one machine is a single point of failure. Two is the sensible minimum.' }
          ] }
      ],
      outro: 'Two minutes of rough maths saved a month of building the wrong thing. **Multiply, divide by 10⁵, apply the peak, then decide.**' }
  ],

  flashcards: [
    { q: 'How many seconds are in a day, for estimation?', a: 'About 10⁵ (exactly 86,400). One million events a day is about 12 a second.' },
    { q: 'What is 2¹⁰, 2²⁰, 2³⁰, 2⁴⁰ roughly?', a: 'A thousand (KB), a million (MB), a billion (GB), a trillion (TB).' },
    { q: 'How do you estimate storage?', a: 'New items per day × size of each × days kept, then multiply by the number of copies, and allow for growth.' },
    { q: 'How do you get bandwidth from requests?', a: 'Requests per second × bytes per response. Multiply by 8 to compare with network links, which are in bits per second.' },
    { q: 'Why is it safe to round aggressively?', a: 'Design choices change at factors of ten. An answer within two or three times of the truth leads to the same design.' },
    { q: 'Name three sanity checks for an estimate.', a: 'Check the units (bits/bytes, day/second), compare with real-world limits, and work backwards to see if the per-user numbers are plausible.' }
  ],

  glossary: [
    { term: 'Back-of-the-envelope estimate', def: 'A quick, rough calculation, done in minutes, to find the order of magnitude of a quantity such as traffic or storage.', like: 'Guessing how many boxes of glasses a wedding needs.', aka: ['Fermi estimate'] },
    { term: 'Order of magnitude', def: 'The size of a number to the nearest power of ten: tens, thousands, millions.', like: 'Saying a journey is "a few hours" rather than "3 hours 17 minutes".' },
    { term: 'Daily active users', def: 'The number of different people who use a product on a typical day.', like: 'How many different customers walk into a shop each day.', aka: ['DAU'] },
    { term: 'Bandwidth', def: 'How much data can flow, or does flow, per second. Network links are measured in bits per second.', like: 'The width of a motorway: how many cars per minute it can carry.' },
    { term: 'Read-to-write ratio', def: 'How many reads a system serves for each write. A high ratio suggests caching and copies close to users.', like: 'A library where books are borrowed thousands of times but donated rarely.' }
  ],

  takeaways: [
    'Users × actions per user ÷ **10⁵** = average per second. Then × a **peak factor**.',
    'Storage = writes × size × time × copies. Bandwidth = requests per second × size.',
    '**Round boldly**, show your working, and state every assumption.',
    'Sanity-check units: **bits vs bytes**, per day vs per second.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sdm-building-blocks', {
  eli5: 'Almost every big system is built from the same handful of parts, like Lego: a front door, workers, a filing cabinet, a notepad, a to-do tray, local shops, a warehouse and an index.',

  cards: [
    { kind: 'concept', title: 'The same eight boxes, everywhere',
      body: `Look at the architecture diagrams of a streaming service, a bank, a food-delivery app and a social network. Squint, and they look oddly alike.

        That is because nearly every large system is assembled from the **same small kit of parts**: load balancers, app servers, databases, caches, queues, CDNs, object storage and search. You have met each one already, in its own world.

        This lesson puts them on one table, with the question that matters most in design: **what is the signal that I actually need this one?** Knowing the parts is easy. Knowing when to reach for each, and when not to, is the skill.` },

    { kind: 'metaphor', title: 'A restaurant, part by part',
      body: `Picture a busy restaurant chain:

        - The **host** at the door sends each party to a free table: the **load balancer**.
        - The **cooks** do the actual work, and any cook can make any dish: the **app servers**.
        - The **ledger** of every order and payment, kept carefully: the **database**.
        - The **warming shelf** of popular dishes made in advance: the **cache**.
        - The **ticket rail** where orders wait for the kitchen: the **queue**.
        - **Takeaway kiosks** in every neighbourhood: the **CDN**.
        - The **warehouse** of bulky supplies: **object storage**.
        - The **index** at the back of the recipe book: **search**.

        Where it stops: a restaurant does not keep three copies of its ledger in different cities. Systems often do.` },

    { kind: 'diagram', title: 'The whole kit in one picture',
      body: 'A typical large web app. Not every system needs every box, but most big ones end up with all of them.',
      nodes: [
        { id: 'u', label: 'Users', icon: '📱', x: 1, y: 0 },
        { id: 'cdn', label: 'CDN', icon: '🌍', x: 0, y: 1, tone: 'info' },
        { id: 'lb', label: 'Load balancer', icon: '🔀', x: 2, y: 1 },
        { id: 'obj', label: 'Object storage', icon: '📦', x: 0, y: 2, tone: 'muted' },
        { id: 'app', label: 'App servers', icon: '🖥️', x: 2, y: 2, tone: 'accent' },
        { id: 'q', label: 'Queue', icon: '📥', x: 3, y: 2, tone: 'warn' },
        { id: 'cache', label: 'Cache', icon: '⚡', x: 1, y: 3, tone: 'info' },
        { id: 'db', label: 'Database', icon: '🗄️', x: 2, y: 3, tone: 'good' },
        { id: 'w', label: 'Workers', icon: '🛠️', x: 3, y: 3 },
        { id: 's', label: 'Search index', icon: '🔎', x: 2, y: 4, tone: 'info' }
      ],
      edges: [
        { from: 'u', to: 'cdn', label: 'images, scripts' },
        { from: 'u', to: 'lb', label: 'API calls' },
        { from: 'cdn', to: 'obj', label: 'on a miss', dashed: true },
        { from: 'lb', to: 'app' },
        { from: 'app', to: 'obj', label: 'uploads' },
        { from: 'app', to: 'q', label: 'slow jobs' },
        { from: 'q', to: 'w' },
        { from: 'app', to: 'cache' },
        { from: 'app', to: 'db' },
        { from: 'db', to: 's', label: 'changes copied', dashed: true }
      ],
      caption: 'Big files go round the side (object storage and CDN). Requests come through the middle. Slow work goes off to the right.' },

    { kind: 'compare', title: 'Each block: what for, and when you need it',
      body: 'The right-hand column is the important one. Add a block when you see its **signal**, not before.',
      cols: ['What it is for', 'The signal you need one'],
      rows: [
        ['**Load balancer**', 'Spreads requests over several servers; skips dead ones', 'You need a second app server, for load or for safety'],
        ['**App servers**', 'Run your code: check input, apply rules, call the stores', 'Always. Add more when CPU is busy at peak'],
        ['**Database**', 'The durable, queryable source of truth', 'Always, once data must survive a restart'],
        ['**Cache**', 'Keeps hot answers in memory for fast repeat reads', 'The same reads over and over; the database straining'],
        ['**Queue**', 'Holds work to be done later, smoothing bursts', 'Slow or flaky work inside a request; spiky load'],
        ['**CDN**', 'Serves files from servers near the user', 'Users far away; lots of images, video or scripts'],
        ['**Object storage**', 'Cheap, durable home for big files', 'Photos, video, uploads, backups: anything large'],
        ['**Search**', 'Fast full-text, fuzzy and ranked search', '`LIKE \'%cake%\'` is slow, or users expect typo-tolerance']
      ] },

    { kind: 'concept', title: 'One source of truth, many copies',
      body: `Here is a question that sorts the blocks into two families: **if this box were wiped tonight, could I rebuild it from the others?**

        - **Sources of truth**: the database, and the files in object storage. Lose them and the data is gone. They get backups, replicas and great care.
        - **Copies**: the cache, the search index, the CDN's files, read replicas. All are derived from a source of truth, so they can be rebuilt, slowly.

        Copies are what make systems fast, but every copy can be **out of date**. A huge part of design is deciding how stale each copy is allowed to be: a product price, seconds; a profile photo, hours.` },

    { kind: 'sequence', title: 'A photo upload, using five blocks',
      body: 'One user action, several blocks, each doing the job it is good at. Step through it.',
      actors: ['Phone', 'App server', 'Queue', 'Worker'],
      steps: [
        { from: 0, to: 1, label: 'POST /photos (3 MB)', note: 'The request arrives through the **load balancer**, which picked a healthy app server.' },
        { at: 1, label: 'save file → object storage', note: 'The big file goes to **object storage**. Databases are poor homes for megabytes of image.' },
        { at: 1, label: 'save row → database', note: 'The **database** gets a small row: owner, caption, time, and the key of the file in storage.' },
        { from: 1, to: 2, label: 'job: make thumbnails for 881', note: 'Resizing takes seconds, so it is not done now. A message goes on the **queue**.' },
        { from: 1, to: 0, label: '201 Created', dashed: true, note: 'The user is free in well under a second, even though the work is not all finished.' },
        { from: 2, to: 3, label: 'job delivered', note: 'A **worker** picks up the job when it has capacity. Bursts of uploads just make the queue longer for a while.' },
        { at: 3, label: 'resize → object storage', note: 'Thumbnails are saved next to the original.' },
        { note: 'When friends view the photo, a **CDN** near them fetches it from object storage once, then serves its copy to everyone nearby.' }
      ] },

    { kind: 'layers', title: 'The path of a read, from the outside in',
      body: 'A request is answered by the **first layer that can answer it**. Each layer protects the slower, more precious one below.',
      layers: [
        { label: 'Browser cache', icon: '💻', note: 'Already have it? No request at all.' },
        { label: 'CDN edge', icon: '🌍', note: 'Static files and cacheable pages, served nearby.', tone: 'info' },
        { label: 'Load balancer', icon: '🔀', note: 'Chooses a healthy app server.' },
        { label: 'App server', icon: '🖥️', note: 'Runs the code for this request.', tone: 'accent' },
        { label: 'Cache', icon: '⚡', note: 'Hot data in memory: microseconds to a millisecond or so.', tone: 'info' },
        { label: 'Database', icon: '🗄️', note: 'The source of truth. Slowest, and the hardest to scale.', tone: 'good' }
      ] },

    { kind: 'example', title: 'Common combinations',
      body: `The blocks are rarely used alone. These pairings appear in almost every large system:

        | Combination | What it solves |
        |---|---|
        | Load balancer + stateless app servers | More capacity; survive a server dying |
        | Cache in front of the database | Heavy, repeated reads |
        | Leader database + read replicas | More reads; a standby copy |
        | Object storage + CDN | Big files served worldwide |
        | Queue + workers | Slow jobs and bursty load |
        | Database + search index fed by changes | Rich search without hammering the database |

        When you sketch a design (step 4 of the method), you are mostly picking which of these recipes the numbers call for.` },

    { kind: 'pitfall', title: 'Boxes on a whiteboard are free. In production they are not.',
      body: `Each block you add is something to run, monitor, upgrade, secure and pay for, at 3 a.m. as well as at noon. It also brings new ways to fail:

        - a **cache** can serve stale data, or stampede the database when it empties
        - a **queue** means work finishes *later*, so users may not see results straight away
        - a **search index** can drift out of step with the database
        - a **CDN** can keep serving an old file after you fixed it

        So every block must earn its place with a **signal**: a number from your estimate, or a pain you can point at. "Big companies use it" is not a signal.` },

    { kind: 'realworld', title: 'Which products fill each slot',
      body: `You will hear product names far more than block names. A few well-known examples per slot:

        | Block | Well-known examples |
        |---|---|
        | Load balancer | Nginx, HAProxy, cloud load balancers |
        | Database | PostgreSQL, MySQL; DynamoDB, MongoDB, Cassandra |
        | Cache | Redis, Memcached |
        | Queue | RabbitMQ, Amazon SQS; Kafka (an event log often used like one) |
        | CDN | Cloudflare, Akamai, Fastly, Amazon CloudFront |
        | Object storage | Amazon S3, Google Cloud Storage, Azure Blob Storage |
        | Search | Elasticsearch, OpenSearch |

        In a design discussion, name the **block** first and the product second. The block is the decision; the product is a detail.` }
  ],

  activities: [
    { type: 'match', after: 3, prompt: 'Match each signal to the block it calls for.',
      pairs: [['The same product page is read 10,000 times a minute', 'Cache'], ['Sending a receipt email makes checkout slow', 'Queue and workers'], ['Users in Australia wait seconds for images', 'CDN'], ['Users upload 4 GB videos', 'Object storage'], ['Typing "choclate" should still find chocolate', 'Search index'], ['One app server is not enough at peak', 'Load balancer']] },

    { type: 'tf', after: 4, statement: 'If the cache is wiped by accident, the data in it is lost for good.', answer: false,
      explain: 'A cache holds **copies**. The source of truth is still in the database, so the cache refills as requests come in. It will be slower for a while (and the database busier), but nothing is lost.' },

    { type: 'mcq', after: 5, q: 'In the photo upload, why does the app server put "make thumbnails" on a queue instead of doing it straight away?',
      options: ['Resizing is slow, so deferring it keeps the user’s request quick and absorbs bursts', 'Queues resize images faster than app servers can', 'The database cannot store thumbnails', 'It makes the thumbnails available instantly'],
      answer: 0,
      why: [null, 'A queue only holds jobs. The worker still has to do the same resizing.', 'Thumbnails go to object storage either way; the database only stores a pointer.', 'The opposite: queued work finishes a little later.'],
      explain: 'A queue moves slow work out of the request. The user gets an answer at once, and a burst of uploads simply lengthens the queue instead of overloading the app servers.' },

    { type: 'bucket', prompt: 'If this were wiped tonight, could it be rebuilt from the rest of the system?', buckets: ['Source of truth (must be protected)', 'Copy (can be rebuilt)'],
      items: [['The orders table in the database', 0], ['Original photos in object storage', 0], ['Product pages held in the cache', 1], ['The search index of product names', 1], ['The CDN’s copy of the logo', 1], ['A read replica of the database', 1], ['User accounts in the database', 0]],
      explain: 'Databases and stored files are the truth; everything built from them (caches, indexes, CDN copies, replicas) can be regenerated. Protect the first group hardest.' },

    { type: 'multi', q: 'An internal tool lets 30 staff book meeting rooms. Which blocks are justified?',
      options: ['An app server', 'A database', 'A CDN in many countries', 'A dedicated search cluster', 'A message queue with a worker pool', 'A distributed cache'],
      answers: [0, 1],
      explain: 'Thirty users produce a trickle of requests. Code and somewhere durable to store bookings are needed; nothing else has a signal. Every extra block would be cost and risk for no gain.' },

    { type: 'order', prompt: 'A user asks for a product page. Order the layers it may pass through, from the outside in.',
      items: ['Browser cache', 'CDN edge', 'Load balancer', 'App server', 'Cache', 'Database'],
      explain: 'The first layer that can answer, does. Each layer shields the slower and more precious one beneath it, and the database is reached only when nothing above has the answer.' },

    { type: 'spot', prompt: 'A design note for a video-sharing app. Tap the line that misuses a building block.',
      code: { lang: 'text', src: `
        Load balancer in front of 4 app servers
        Users and video titles in PostgreSQL
        Each uploaded video saved in a database column
        Transcoding jobs sent to a queue for workers
        Popular videos served through a CDN` },
      lines: [3],
      explain: 'Videos are huge files. Stuffing them into database rows bloats backups, replicas and every query. They belong in **object storage**, with only the file key in the database.' },

    { type: 'scenario', title: 'Growing pains at Bakehouse', intro: 'You run the tech for **Bakehouse**, an online bakery that has suddenly become popular. It is one app server and one database. Complaints are arriving, and each block you add costs money and attention.',
      meters: { speed: 40, budget: 80 },
      steps: [
        { text: 'Customers in Australia (your servers are in London) say product photos take ages to appear.',
          choices: [
            { label: 'Put the images behind a CDN', score: 2, effects: { speed: 20, budget: -5 }, feedback: 'Exactly the signal for a CDN: far-away users, static files. Copies sit near Sydney after the first request.' },
            { label: 'Buy a bigger app server', score: 0, effects: { budget: -20 }, feedback: 'The slowness is distance, not CPU. A faster server in London is just as far from Sydney.' },
            { label: 'Add a search index', score: 0, effects: { budget: -15 }, feedback: 'Search has nothing to do with loading photos. A block without a signal is pure cost.' }
          ] },
        { text: 'Checkout takes four seconds, because it sends a confirmation email and the email provider is slow. Sometimes it times out and the order fails.',
          choices: [
            { label: 'Put "send email" on a queue for a worker', score: 2, effects: { speed: 20, budget: -5 }, feedback: 'The order completes at once; the email follows a few seconds later, with retries if the provider is down.' },
            { label: 'Cache the emails', score: 0, effects: { budget: -10 }, feedback: 'Each email is unique and sent once. There is nothing to reuse, so a cache cannot help.' },
            { label: 'Raise the timeout to 30 seconds', score: 1, effects: { speed: -10 }, feedback: 'Fewer failures, but customers now wait even longer. The slow work is still in the wrong place.' }
          ] },
        { text: 'Database CPU sits at 90% at lunchtime. Nearly all of it is the same 50 product pages being read again and again.',
          choices: [
            { label: 'Add a cache in front of the database for product pages', score: 2, effects: { speed: 20, budget: -10 }, feedback: 'Repeated identical reads are the textbook cache signal. The database now sees a fraction of the traffic.' },
            { label: 'Split the data across several databases', score: 0, effects: { budget: -30, speed: 5 }, feedback: 'Far too heavy. The load is a few hot pages, which a cache absorbs cheaply.' },
            { label: 'Add a queue in front of the database', score: 0, effects: { speed: -15 }, feedback: 'Customers want their page now; queuing reads just makes them wait.' }
          ] },
        { text: 'Customers complain that searching "choclate" finds nothing, and the search query is getting slow.',
          choices: [
            { label: 'Add a search index fed from the product table', score: 2, effects: { speed: 15, budget: -10 }, feedback: 'Typo-tolerance and fast text search are what search engines are built for. The database stays the source of truth.' },
            { label: 'Add more app servers', score: 0, effects: { budget: -15 }, feedback: 'More servers run the same slow query and still cannot match a typo.' }
          ] }
      ],
      outro: 'Four pains, four blocks, each added only when its **signal** appeared. That is how good systems grow.' }
  ],

  flashcards: [
    { q: 'Name the eight common building blocks.', a: 'Load balancer, app servers, database, cache, queue, CDN, object storage, search index.' },
    { q: 'What is the signal that you need a cache?', a: 'The same data is read again and again, and the database (or a slow service) is straining under those repeated reads.' },
    { q: 'What is the signal that you need a queue?', a: 'Slow or unreliable work is happening inside a user’s request, or load arrives in bursts that should be smoothed out.' },
    { q: 'Where should large files such as photos and videos live?', a: 'In object storage, served through a CDN. The database stores only a small row with the file’s key.' },
    { q: 'Sources of truth vs copies?', a: 'Databases and stored files are the truth and must be protected. Caches, search indexes, CDN copies and replicas are derived copies that can be rebuilt but may be stale.' }
  ],

  glossary: [
    { term: 'Building block', def: 'A standard component, such as a cache or a queue, that system designs are assembled from.', like: 'A Lego brick with a known shape and job.' },
    { term: 'Source of truth', def: 'The one place whose copy of some data counts as correct. Everything else is derived from it.', like: 'The official ledger, as opposed to the notes on the waiter’s pad.' },
    { term: 'Search index', def: 'A copy of data reorganised for fast text search, usually built by a search engine such as Elasticsearch.', like: 'The index at the back of a book.' },
    { term: 'Worker', def: 'A background process that takes jobs from a queue and does them, away from user requests.', like: 'A kitchen porter working through the pile of washing-up.' },
    { term: 'Signal', def: 'A measured number or concrete pain that justifies adding a component to a design.', like: 'A warning light on the dashboard telling you which part needs attention.' }
  ],

  takeaways: [
    'Eight blocks build most systems: **LB, app servers, database, cache, queue, CDN, object storage, search**.',
    'Add a block only when you see its **signal**.',
    'Protect the **sources of truth**; everything else is a copy that can be rebuilt.',
    'Big files: **object storage + CDN**. Slow work: **queue + workers**. Hot reads: **cache**.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sdm-evolution', {
  eli5: 'Big systems are not designed big: they start as one computer and grow one fix at a time, each fix aimed at whatever is about to break next.',

  cards: [
    { kind: 'concept', title: 'Every giant started as one box',
      body: `Nearly every huge web service you use began life as one program on one machine, written by a handful of people who were not sure anyone would show up.

        They did not start with a hundred servers in five continents, and they were right not to. On day one you do not know your numbers, your users or even your product.

        Instead, systems grow by a simple loop:

        1. **Find the bottleneck**: the part that will break first.
        2. **Fix that one thing**, with the simplest block that works.
        3. **Repeat** when the next one appears.

        This lesson walks that loop from one box to many regions. The user counts are a rough story, not rules.` },

    { kind: 'metaphor', title: 'From food stall to restaurant chain',
      body: `A chef starts a **food stall**, cooking, serving and taking money alone. It works, until the queue reaches the next street.

        - First, a **separate till**, so cooking and money stop getting in each other's way.
        - Then **more cooks**, all using the same recipes, with a host sending customers to whoever is free.
        - Then a **shelf of popular dishes** made ahead, so the kitchen is not cooking the same thing fifty times.
        - Then an **order rail**, so slow orders wait without blocking the counter.
        - Then **separate kitchens** for different parts of the menu.
        - Finally, **branches in other cities**.

        Nobody opens a restaurant chain on day one. Neither should your system.` },

    { kind: 'diagram', title: 'Stage 1: one box',
      body: 'Web server, your code and the database all run on **one machine**. Cheap, simple, quick to change. Perfectly right for the first users.',
      nodes: [
        { id: 'u', label: 'Users', icon: '📱', x: 1, y: 0 },
        { id: 'app', label: 'Your code', icon: '🖥️', x: 1, y: 1, tone: 'accent' },
        { id: 'db', label: 'Database', icon: '🗄️', x: 1, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'u', to: 'app', label: 'HTTP' },
        { from: 'app', to: 'db', label: 'same machine' }
      ],
      groups: [{ label: 'One server', x: 1, y: 1, w: 1, h: 2 }],
      caption: 'Signals to move on: the code and the database fight over memory and CPU, and any crash or restart takes **everything** down.' },

    { kind: 'diagram', title: 'Stage 2: app and database on separate machines',
      body: 'The first split. The database moves to **its own machine**, so each can be sized for its own job: the database gets lots of memory and fast disks, the app server gets CPU.',
      nodes: [
        { id: 'u', label: 'Users', icon: '📱', x: 1, y: 0 },
        { id: 'app', label: 'App server', icon: '🖥️', x: 1, y: 1, tone: 'accent' },
        { id: 'db', label: 'Database server', icon: '🗄️', x: 1, y: 2, tone: 'good' },
        { id: 'bk', label: 'Nightly backups', icon: '💾', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'u', to: 'app' },
        { from: 'app', to: 'db', label: 'over the network' },
        { from: 'db', to: 'bk', dashed: true }
      ],
      caption: 'Usually the database is simply given a bigger machine as it grows ([[vertical scaling]]). Signals to move on: the one app server runs out of CPU, or its crashes take the site down.' },

    { kind: 'diagram', title: 'Stage 3: stateless servers behind a load balancer',
      body: 'Now there are **several identical app servers** and a load balancer in front. Any server can handle any request, and one can die without the site going down.',
      nodes: [
        { id: 'u', label: 'Users', icon: '📱', x: 1, y: 0 },
        { id: 'lb', label: 'Load balancer', icon: '🔀', x: 1, y: 1 },
        { id: 'a1', label: 'App server 1', icon: '🖥️', x: 0, y: 2, tone: 'accent' },
        { id: 'a2', label: 'App server 2', icon: '🖥️', x: 1, y: 2, tone: 'accent' },
        { id: 'a3', label: 'App server 3', icon: '🖥️', x: 2, y: 2, tone: 'accent' },
        { id: 'db', label: 'Database', icon: '🗄️', x: 1, y: 3, tone: 'good' },
        { id: 'ss', label: 'Session store', icon: '🎟️', x: 2, y: 3, tone: 'info' }
      ],
      edges: [
        { from: 'u', to: 'lb' },
        { from: 'lb', to: 'a1' }, { from: 'lb', to: 'a2' }, { from: 'lb', to: 'a3' },
        { from: 'a1', to: 'db' }, { from: 'a2', to: 'db' }, { from: 'a3', to: 'db' },
        { from: 'a3', to: 'ss', label: 'logins' }
      ],
      caption: 'The price of entry is **statelessness**: sessions, uploads and counters move out of each server’s memory into shared stores. Otherwise a user is logged out whenever the balancer picks a different server.' },

    { kind: 'diagram', title: 'Stage 4: caches, replicas and a CDN',
      body: 'Most apps read far more than they write, so the database drowns in **reads** first. Three copies take the pressure off: a [[cache]] for hot data, read replicas for other reads, and a [[CDN]] for files.',
      nodes: [
        { id: 'u', label: 'Users', icon: '📱', x: 1, y: 0 },
        { id: 'cdn', label: 'CDN', icon: '🌍', x: 0, y: 1, tone: 'info' },
        { id: 'lb', label: 'Load balancer', icon: '🔀', x: 2, y: 1 },
        { id: 'app', label: 'App servers', icon: '🖥️', x: 2, y: 2, tone: 'accent' },
        { id: 'c', label: 'Cache', icon: '⚡', x: 3, y: 2, tone: 'info' },
        { id: 'r1', label: 'Read replica', icon: '📗', x: 1, y: 3, tone: 'info' },
        { id: 'l', label: 'Leader database', icon: '🗄️', x: 2, y: 3, tone: 'good' },
        { id: 'r2', label: 'Read replica', icon: '📗', x: 3, y: 3, tone: 'info' }
      ],
      edges: [
        { from: 'u', to: 'cdn', label: 'images, scripts' },
        { from: 'u', to: 'lb' },
        { from: 'lb', to: 'app' },
        { from: 'app', to: 'c', label: 'hot reads' },
        { from: 'app', to: 'l', label: 'writes' },
        { from: 'app', to: 'r1', label: 'other reads' },
        { from: 'l', to: 'r1', dashed: true },
        { from: 'l', to: 'r2', label: 'copies', dashed: true }
      ],
      caption: 'Every copy can be slightly behind: cached data can be stale and replicas lag. A replica also doubles as a standby if the leader dies.' },

    { kind: 'diagram', title: 'Stage 5: queues, then sharding',
      body: 'Two new pressures. Slow work (emails, video, reports) moves to a **queue** with workers. And if **writes** alone outgrow the biggest database machine, the data is split across several leaders: [[sharding]].',
      nodes: [
        { id: 'lb', label: 'Load balancer', icon: '🔀', x: 1, y: 0 },
        { id: 'app', label: 'App servers', icon: '🖥️', x: 1, y: 1, tone: 'accent' },
        { id: 'q', label: 'Queue', icon: '📥', x: 3, y: 1, tone: 'warn' },
        { id: 'w', label: 'Workers', icon: '🛠️', x: 3, y: 2 },
        { id: 's1', label: 'Shard: users A–H', icon: '🗄️', x: 0, y: 3, tone: 'good' },
        { id: 's2', label: 'Shard: users I–P', icon: '🗄️', x: 1, y: 3, tone: 'good' },
        { id: 's3', label: 'Shard: users Q–Z', icon: '🗄️', x: 2, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'lb', to: 'app' },
        { from: 'app', to: 'q', label: 'slow jobs' },
        { from: 'q', to: 'w' },
        { from: 'app', to: 's1' },
        { from: 'app', to: 's2', label: 'by user' },
        { from: 'app', to: 's3' }
      ],
      caption: 'Cache, CDN and replicas are still there, hidden for clarity. Sharding by name is only for illustration; real systems usually hash the [[shard key]]. Sharding is powerful and painful, so it comes **late**.' },

    { kind: 'diagram', title: 'Stage 6: more than one region',
      body: 'Finally, the whole stack is copied into **another region** (a separate group of data centres, often on another continent). Users go to the nearest one. Reasons: speed for far-away users, surviving the loss of a whole region, and laws that require some data to stay in a country.',
      nodes: [
        { id: 'dns', label: 'DNS: nearest region', icon: '🧭', x: 1, y: 0 },
        { id: 'eu', label: 'Europe: LB + app servers', icon: '🖥️', x: 0, y: 1, tone: 'accent' },
        { id: 'us', label: 'US: LB + app servers', icon: '🖥️', x: 2, y: 1, tone: 'accent' },
        { id: 'eudb', label: 'Europe databases', icon: '🗄️', x: 0, y: 2, tone: 'good' },
        { id: 'usdb', label: 'US databases', icon: '🗄️', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'dns', to: 'eu', label: 'European users' },
        { from: 'dns', to: 'us', label: 'American users' },
        { from: 'eu', to: 'eudb' },
        { from: 'us', to: 'usdb' },
        { from: 'eudb', to: 'usdb', label: 'replication', dashed: true, both: true }
      ],
      groups: [{ label: 'Europe region', x: 0, y: 1, w: 1, h: 2 }, { label: 'US region', x: 2, y: 1, w: 1, h: 2 }],
      caption: 'The hard part is the data. Regions are tens to hundreds of milliseconds apart, so writes in both at once can conflict. A common answer: give each user a **home region** for their writes.' },

    { kind: 'compare', title: 'The whole story on one table',
      body: 'Each stage answers one symptom. If you do not have the symptom, you do not need the stage yet.',
      cols: ['Symptom that triggers it', 'What it costs you'],
      rows: [
        ['**Split app and database**', 'Code and data fight over one machine', 'A network hop; two machines to run'],
        ['**Load balancer + stateless servers**', 'One app server is too busy or too fragile', 'State must move to shared stores'],
        ['**Cache, replicas, CDN**', 'The database drowns in reads; far users wait', 'Copies can be stale'],
        ['**Queue and workers**', 'Slow work holds up requests; bursts overwhelm', 'Results arrive later'],
        ['**Sharding**', 'Writes or data outgrow the biggest machine', 'Cross-shard queries; hard to undo'],
        ['**More regions**', 'Far users are slow; one region is a single point of failure', 'Data conflicts; much higher cost']
      ] },

    { kind: 'pitfall', title: 'Do not skip to the last chapter',
      body: `The most expensive mistake in this story is **starting at stage 6**. Teams with a few hundred users build sharded, multi-region systems because big companies have them, and then spend their time running infrastructure instead of building the product.

        - Each stage **adds permanent cost**: more machines, more ways to fail, more to learn.
        - Most products never need the later stages. Many successful businesses run happily at stage 3 or 4.
        - The order is a typical path, not a law. A video app may need object storage and a CDN on day one.

        What you should do early is keep the door open: **stateless code**, clear data ownership, and measurements so you see the next bottleneck coming.`,
      note: 'In the lab that follows, you grow an app from 100 to 10 million users by buying upgrades. Buy too early and you go broke; too late and you go down.' }
  ],

  activities: [
    { type: 'tf', after: 3, statement: 'Moving the database onto its own machine lets you size each machine for its own job.', answer: true,
      explain: 'Databases want memory and fast disks; app servers want CPU. Separate machines can be chosen and upgraded for each, and they no longer compete for the same resources.' },

    { type: 'mcq', after: 4, q: 'A team adds a load balancer and two more app servers. Suddenly users keep getting logged out. What is the most likely cause?',
      options: ['Sessions are stored in each app server’s memory', 'The load balancer is too slow', 'The database cannot handle three servers', 'Three servers is an unlucky number'],
      answer: 0,
      why: [null, 'A slow balancer causes slowness, not logouts.', 'Three servers sharing one database is normal and does not touch sessions.', null],
      explain: 'Each server only knows about logins it handled itself. When the balancer sends a user to a different server, that server has never heard of them. Move sessions to a shared store (or a signed token) so the servers are stateless.' },

    { type: 'mcq', after: 7, q: 'Why is running in several regions much harder than adding app servers in one region?',
      options: ['Keeping data in step across distant regions is slow, and writes can conflict', 'Load balancers cannot spread traffic to servers on other continents', 'App servers must be rewritten for each region they run in', 'DNS has no way to send different users to different addresses'],
      answer: 0,
      why: [null, 'Users are routed to the nearest region, usually by DNS; each region has its own balancer.', 'They run anywhere. Code is the easy part.', 'Sending users to the nearest region is exactly what geo-aware DNS does.'],
      explain: 'Copying code is easy; copying data is not. Regions are tens to hundreds of milliseconds apart, so keeping databases in step, and resolving writes made in two places at once, is the real difficulty.' },

    { type: 'order', prompt: 'Put the classic scaling stages in the order they usually happen.',
      items: ['One box running everything', 'App and database on separate machines', 'Load balancer and stateless app servers', 'Caches, read replicas and a CDN', 'Queues, then sharding', 'Multiple regions'],
      explain: 'Each step fixes the bottleneck that the previous one exposed, and each costs more than the last. It is a typical path, not a law: some products need a step early, and many never need the later ones.' },

    { type: 'bucket', prompt: 'Which fix does each symptom call for?', buckets: ['Cache or read replicas', 'LB + more app servers', 'Queue and workers', 'Sharding'],
      items: [['Database busy serving the same reads again and again', 0], ['Reports read heavily, but writes are light', 0], ['App server CPU at 95% at peak; database calm', 1], ['One app server crash takes the site down', 1], ['Generating PDF invoices makes checkout slow', 2], ['A 9 a.m. burst of emails swamps the system', 2], ['Writes alone exceed the biggest database machine', 3], ['The data no longer fits on one machine', 3]],
      explain: 'Read pressure → copies. App CPU or fragility → more stateless servers. Slow or bursty work → a queue. Write volume or data size beyond one machine → shards.' },

    { type: 'match', prompt: 'Match each stage to the main problem it solves.',
      pairs: [['Separate database machine', 'Code and data competing for resources'], ['Stateless app servers + LB', 'One app server is a bottleneck and a single point of failure'], ['Cache and read replicas', 'Too many reads for one database'], ['Queue and workers', 'Slow work inside user requests'], ['Sharding', 'Too many writes or too much data for one leader'], ['Multiple regions', 'Far-away users and whole-region outages']] },

    { type: 'estimate', q: 'After caching and replicas, your app still needs about 40,000 database writes per second at peak. One leader database handles about 5,000 writes per second comfortably. Roughly how many shards do you need?',
      answer: 8, unit: 'shards', min: 1, max: 200, tolerance: 1.5,
      explain: '40,000 ÷ 5,000 = **8 shards**, and in practice a few more for growth and headroom. Many teams pick a larger number up front, because adding shards later means moving data.' },

    { type: 'scenario', title: 'Growing Trailmap', intro: 'You are the first engineer at **Trailmap**, a hiking-route app. It is one server with everything on it. Over the next year it grows fast. Each move costs money; the wrong one costs uptime.',
      meters: { uptime: 70, budget: 80 },
      steps: [
        { text: 'A few thousand users. Every evening the database and the code fight over memory, and each deploy restarts everything. Your co-founder suggests going multi-region "to be ready".',
          choices: [
            { label: 'Move the database to its own machine first', score: 2, effects: { uptime: 15, budget: -5 }, feedback: 'The smallest fix for the actual symptom. Cheap, quick, and it buys a lot of room.' },
            { label: 'Go multi-region now, so you never have to change again', score: 0, effects: { budget: -40, uptime: -10 }, feedback: 'Huge cost and complexity for a problem you do not have, and it does not even fix the memory fight.' },
            { label: 'Buy a much bigger single server', score: 1, effects: { budget: -15, uptime: 5 }, feedback: 'It eases the memory pressure, but every deploy still takes the whole site down.' }
          ] },
        { text: 'Traffic grows and the one app server runs at 95% CPU at weekends. You plan to add a load balancer and two more servers. Logins are stored in the server’s memory.',
          choices: [
            { label: 'Move sessions to a shared store first, then add the servers', score: 2, effects: { uptime: 15, budget: -10 }, feedback: 'Stateless first, then scale out. Users stay logged in whichever server they reach.' },
            { label: 'Add the servers and turn on sticky sessions', score: 1, effects: { uptime: 5, budget: -10 }, feedback: 'It works for now, but when a server dies its users are logged out, and load spreads unevenly.' },
            { label: 'Add the servers and change nothing else', score: 0, effects: { uptime: -20, budget: -10 }, feedback: 'Users get logged out on almost every click. Support tickets pour in.' }
          ] },
        { text: 'Now the database is at 90% CPU. Almost all of it is reads of the same popular routes; writes are light.',
          choices: [
            { label: 'Cache popular routes and add a read replica', score: 2, effects: { uptime: 15, budget: -10 }, feedback: 'Read pressure gets copies. The leader now mainly handles writes, and the replica doubles as a standby.' },
            { label: 'Shard the database by region', score: 0, effects: { budget: -30, uptime: -5 }, feedback: 'Sharding attacks write volume, which is not your problem. You took on its pain for nothing.' },
            { label: 'Put database reads on a queue', score: 0, effects: { uptime: -15 }, feedback: 'Users want their route now. Queuing reads just makes pages wait.' }
          ] },
        { text: 'Trailmap launches in Japan. Japanese users find the app sluggish, and the servers are all in Europe.',
          choices: [
            { label: 'Serve images and map tiles from a CDN, and measure before going further', score: 2, effects: { uptime: 5, budget: -10 }, feedback: 'Most of what a map app sends is static files, which a CDN brings close to users cheaply. A full Asian region can wait until the numbers demand it.' },
            { label: 'Build a full second region in Asia immediately', score: 1, effects: { budget: -35, uptime: 5 }, feedback: 'It would work, but it is the most expensive move available, and the data synchronisation will keep you busy for months.' },
            { label: 'Upgrade the European servers', score: 0, effects: { budget: -15 }, feedback: 'Distance, not server speed, is the problem. Faster servers in Europe are still far from Tokyo.' }
          ] }
      ],
      outro: 'Find the bottleneck, apply the **smallest fix that removes it**, measure, repeat. That loop is the whole of scaling.' },

    { type: 'explain', prompt: 'A founder with 500 users wants to build "a sharded, multi-region system like the big companies have". Explain why you would advise against it, and what you would do instead.',
      model: 'Large systems were not built that way on day one; they grew one bottleneck at a time. Sharding and multiple regions add permanent cost and complexity and solve problems (huge write volume, global users, region outages) that 500 users do not have. I would start simple, with an app server and a separate database, keep the code stateless so it can scale out later, measure, and add a load balancer, caches, queues and so on only when a real bottleneck appears.',
      keywords: ['bottleneck', 'cost', 'complexity', 'stateless', 'measure', 'simple', 'later'] }
  ],

  flashcards: [
    { q: 'What is the basic loop for scaling a system?', a: 'Find the bottleneck, fix it with the simplest block that works, measure, and repeat.' },
    { q: 'What must change before app servers can sit behind a load balancer?', a: 'They must be stateless: sessions, uploads and counters move to shared stores, so any server can handle any request.' },
    { q: 'What usually overloads the database first, and what helps?', a: 'Reads. Caches, read replicas and a CDN take the read load off the leader.' },
    { q: 'When does sharding become necessary?', a: 'When writes, or the total data, outgrow what the biggest single database machine can handle. It comes late because it is hard to undo.' },
    { q: 'Why go multi-region, and what is the hard part?', a: 'For far-away users, surviving a whole-region outage and data-location laws. The hard part is keeping data in step across regions.' }
  ],

  glossary: [
    { term: 'Scaling story', def: 'The typical sequence of changes a system goes through as it grows, each fixing the current bottleneck.', like: 'A food stall becoming a restaurant chain, one hire at a time.' },
    { term: 'Region', def: 'A cloud provider’s group of data centres in one geographic area, such as western Europe.', like: 'A branch of a chain in another city.' },
    { term: 'Multi-region', def: 'Running a full copy of a system in more than one region so far-away users are fast and one region can fail.', like: 'Opening branches on several continents.' },
    { term: 'Home region', def: 'The region that owns a particular user’s data and accepts their writes, to avoid conflicting updates.', like: 'The branch where your account is held, even if you visit others.' },
    { term: 'Premature scaling', def: 'Building for scale you do not have yet, paying its costs long before any benefit.', like: 'Buying a fleet of lorries for a market stall.' }
  ],

  takeaways: [
    'Systems grow **one bottleneck at a time**: one box → split → LB + stateless → caches and replicas → queues and shards → regions.',
    'Make servers **stateless** before scaling out.',
    'Reads get **copies**; slow work gets a **queue**; too many writes get **shards**.',
    'Every stage costs forever. **Do not start at the last chapter.**'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('system-design', {
  title: 'The Blank Whiteboard',
  intro: 'It stares back at you, white and enormous, daring you to draw something fashionable. Beat it with the method: ask, do the sums, pick only the blocks you can justify, and grow one bottleneck at a time.',
  questions: [
    { type: 'mcq', q: 'An interviewer says: "Design a food-delivery app." What is the best use of your first few minutes?',
      options: ['Ask who the users are, what they must do, and how many there are', 'Draw microservices for orders, drivers and payments', 'Choose between PostgreSQL and MongoDB', 'Start estimating storage for ten years of orders'],
      answer: 0,
      why: [null, 'Boxes before requirements means designing something nobody has described.', 'Picking products is a detail that comes much later.', 'Estimates need numbers from the requirements first, such as how many orders.'],
      explain: 'Step 1 is clarifying the requirements, functional and non-functional. Everything after it, including the estimates, depends on the answers.' },

    { type: 'bucket', prompt: 'Functional or non-functional requirement?', buckets: ['Functional', 'Non-functional'],
      items: [['A driver can mark an order as delivered', 0], ['Order status updates reach the customer within 10 seconds', 1], ['A customer can rate a restaurant', 0], ['The app copes with 5× normal traffic on Friday nights', 1], ['Card details are never stored on our servers', 1], ['A restaurant can pause new orders', 0]],
      explain: 'Functional = what users can do. Non-functional = how fast, how reliable, how secure, how big. The second group drives most architecture choices.' },

    { type: 'estimate', q: 'A news site has 100 million daily users, each loading about 30 pages a day. Roughly how many page loads per second is that on average?',
      answer: 30000, unit: 'pages per second', min: 100, max: 10000000, tolerance: 2,
      explain: '10⁸ × 30 = 3 × 10⁹ a day. Divide by 10⁵ seconds: **about 30,000 a second**, and two to five times that at peak.' },

    { type: 'estimate', q: 'A video platform receives 500,000 uploads a day, averaging 50 MB each. Ignoring copies, roughly how many terabytes of new storage is that per day?',
      answer: 25, unit: 'TB per day', min: 0.1, max: 10000, tolerance: 2,
      explain: '5 × 10⁵ × 5 × 10⁷ bytes = 25 × 10¹² bytes = **25 TB a day**, or about 9 PB a year before copies. That is firmly object-storage territory.' },

    { type: 'spot', prompt: 'This bandwidth estimate concludes one 10 Gbps link is plenty. Tap the line where it goes wrong.',
      code: { lang: 'text', src: `
        image views per second   4,000
        average image size       400 KB
        bytes per second         4,000 × 400 KB = 1.6 GB/s
        link needed              1.6 Gbps
        verdict                  one 10 Gbps link is plenty` },
      lines: [4],
      explain: 'Bytes were treated as bits. 1.6 GB/s × 8 = **12.8 Gbps**, which is more than a 10 Gbps link even on average. Images like these belong on a CDN.' },

    { type: 'match', prompt: 'Match each signal to the building block it calls for.',
      pairs: [['Users upload large audio files', 'Object storage'], ['The home page is read millions of times, unchanged', 'Cache or CDN'], ['Resizing images slows down every request', 'Queue and workers'], ['A second app server is needed for safety', 'Load balancer'], ['Users want fuzzy, ranked search across products', 'Search index']] },

    { type: 'multi', q: 'Which of these could be rebuilt from the rest of the system if they were wiped?',
      options: ['The cache of popular product pages', 'The search index of products', 'The orders table in the leader database', 'A read replica', 'Original customer uploads in object storage', 'The CDN’s copies of images'],
      answers: [0, 1, 3, 5],
      explain: 'Caches, search indexes, replicas and CDN copies are all derived from a source of truth. The orders table and original uploads **are** the truth: lose them and they are gone, which is why they get backups and replicas.' },

    { type: 'ab', q: 'A team is scaling from one app server to three. Which plan is better?',
      a: { lang: 'text', label: 'Plan one', src: `
        Add a load balancer and two servers.
        Keep logins in each server's memory.
        Turn on sticky sessions.` },
      b: { lang: 'text', label: 'Plan two', src: `
        Move logins to a shared session store.
        Then add a load balancer and two servers.
        Any server can handle any request.` },
      answer: 'b',
      explain: 'Making the servers stateless first means any server can take any request, and losing one logs nobody out. Sticky sessions work until a server dies, and they spread load unevenly.' },

    { type: 'order', prompt: 'Order the steps of a back-of-the-envelope traffic estimate.',
      items: ['State assumptions: daily users and actions per user', 'Multiply to get requests per day', 'Divide by about 10⁵ for the average per second', 'Multiply by a peak factor', 'Compare with what one server or database can handle'],
      explain: 'Assumptions first, so they can be challenged; then the arithmetic; then the comparison with real capacity, which is where the number turns into a design decision.' },

    { type: 'tf', statement: 'When a database is overloaded by the same reads over and over, sharding is usually the first fix to reach for.', answer: false,
      explain: 'Repeated reads call for **copies**: a cache and read replicas. Sharding is for when writes or total data outgrow one machine, and it is far harder to undo.' },

    { type: 'short', q: 'For quick estimates, roughly how many seconds are in a day? (Give the round number.)', accept: ['100000', '100,000', '10^5', '1e5', '10⁵', '100k'], hint: 'A one followed by some zeros.',
      explain: 'A day is 86,400 seconds, which rounds to **100,000 (10⁵)**. Dividing daily totals by 10⁵ gives a per-second figure in your head.' },

    { type: 'mcq', q: 'Estimates show 50 writes a second and 2 TB of data in total. A teammate proposes sharding across 16 databases "for the future". What is the best response?',
      options: ['One leader with a replica copes easily; shard only if writes or data outgrow one machine', 'Agree: sharding early is cheaper than sharding later', 'Shard across 64 databases to be even safer', 'Drop the database and keep everything in a cache'],
      answer: 0,
      why: [null, 'Sharding early means paying its complexity for years before any benefit, if one ever comes.', 'More shards means more cost and more cross-shard pain for no measured need.', 'A cache is a copy, not a durable source of truth.'],
      explain: 'The numbers are modest for one database. State the trade-off: simpler now, with a clear signal (writes or data beyond one machine) that would make you revisit it.' }
  ]
});

KS.sheet('system-design', {
  title: 'The System Design Method: cheat sheet',
  sections: [
    { title: 'The five steps',
      md: `1. **Clarify requirements**: who uses it, what they do, how well. Agree scope.
        2. **Estimate the scale**: requests per second, storage, bandwidth.
        3. **API and data model**: the operations offered and the things stored.
        4. **High-level design**: the smallest set of boxes that meets the requirements.
        5. **Deep dives and trade-offs**: for each choice say **choice, because, cost, revisit-if**.

        | Functional | Non-functional |
        |---|---|
        | What it **does** | How **well**: speed, reliability, scale, security |
        | "Look up a parcel" | "Status within a minute" |` },

    { title: 'Numbers to know',
      md: `| Fact | Roughly |
        |---|---|
        | 2¹⁰ / 2²⁰ / 2³⁰ / 2⁴⁰ | 10³ KB / 10⁶ MB / 10⁹ GB / 10¹² TB |
        | Seconds in a day | **10⁵** (86,400) |
        | Seconds in a year | 3 × 10⁷ |
        | 1 million a day | about 12 a second |
        | 1 byte | 8 bits |
        | Short text post | about 1 KB |
        | Web-sized photo | a few hundred KB |
        | One minute of HD video | tens of MB |` },

    { title: 'Estimation formulas',
      md: `- **Average RPS** = daily users × actions each ÷ 10⁵
        - **Peak RPS** = average × 2 to 5
        - **Storage** = writes per day × size × days kept × copies (often 3)
        - **Bandwidth** = RPS × response size; × 8 for bits per second
        - **Read:write ratio** high → cache, replicas, CDN

        **Sanity checks**: units (bits/bytes, day/second, KB/MB); real-world limits; work backwards to per-user numbers; did you add peak, copies, growth?

        **Round to one significant figure.** Decisions change at 10×, not 1.2×.` },

    { title: 'Building blocks and their signals',
      md: `| Block | Add it when… |
        |---|---|
        | Load balancer | You need a second app server |
        | App servers | Always; more when CPU is busy at peak |
        | Database | Always; the source of truth |
        | Cache | The same reads repeat; database strains |
        | Queue + workers | Slow or flaky work inside requests; bursts |
        | CDN | Far-away users; lots of static files |
        | Object storage | Photos, video, uploads, backups |
        | Search index | Full-text, fuzzy or ranked search |

        **Truth**: database, stored files. **Copies** (rebuildable, maybe stale): cache, index, CDN, replicas.` },

    { title: 'The scaling story',
      md: `| Stage | Trigger |
        |---|---|
        | 1. One box | The start |
        | 2. Separate database | Code and data fight for resources |
        | 3. LB + **stateless** servers | One app server too busy or fragile |
        | 4. Cache, replicas, CDN | Too many reads; far users |
        | 5. Queues, then sharding | Slow work; writes or data beyond one machine |
        | 6. Multiple regions | Far users; region outages; data laws |

        Loop: **find the bottleneck → smallest fix → measure → repeat.**` },

    { title: 'Classic mistakes',
      md: `- **Answer first**: naming tools before asking a question.
        - **Forgetting non-functionals**: fine for 10 users, falls over at 10 million.
        - **Imaginary scale**: sharding and multi-region for 500 users.
        - **Unit slips**: ÷ 3,600 instead of 10⁵; bytes read as bits.
        - **Buzzword soup**: blocks with no signal and no reason.
        - **Silent trade-offs**: never saying what a choice costs.
        - **Hidden state**: sessions in server memory before scaling out.
        - **Big files in the database** instead of object storage.` }
  ]
});
