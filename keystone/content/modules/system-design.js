/* Module: system-design — The System Design Method.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs system-design */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sdm-framework', {
  eli5: 'System design is deciding what boxes a system needs and how they connect. A five-step routine (ask, estimate, sketch the interface, draw the boxes, then dig into the hard parts) stops you freezing at a blank page or leaping to fashionable tools.',

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

/* @@END */
