/* Module: arch-styles — Architectural Styles.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs arch-styles */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('as-overview', {
  eli5: 'An architectural style is the overall shape of a whole system, like a grid-plan town or a tower block, and learning the names of the common shapes lets you talk about systems clearly.',

  cards: [
    { kind: 'story', title: 'Overheard in a meeting',
      body: `A new developer joins a team and hears this in the first stand-up:

        *"We're event-driven, mostly layered inside each service, and the settings screen uses MVC with an Observer for the live preview."*

        Four ideas in one sentence, and they are not the same *kind* of idea. One describes the shape of the whole system, one the shape of a part, one the arrangement of a screen, and one a few classes.

        Half the confusion in architecture talk is people using the same word at different zoom levels. This lesson hands you the map, so every later lesson has somewhere to sit.` },

    { kind: 'concept', title: 'An architectural style: the overall shape',
      body: `An **architectural style** is a broad, named way of organising a *whole system*. It says what kinds of parts there are and how they are allowed to connect.

        - **Layered**: parts are stacked, and each talks to the one below.
        - **Client–server**: one side asks, another answers.
        - **Event-driven**: parts react to announcements instead of taking orders.

        A style gives you **constraints**. Constraints sound like a limitation, but they are the point: because you know the rules, anyone can predict how the system behaves, where a change will land and what is likely to go wrong.

        Styles are decisions of the costly-to-change kind from the first module.` },

    { kind: 'layers', title: 'Three zoom levels, three kinds of word',
      body: 'People use these terms loosely, so the borders are fuzzy. But the zoom levels are real.',
      layers: [
        { label: 'Architectural style', note: 'The shape of the whole system. Examples: layered, client–server, event-driven.', tone: 'accent', icon: '🏙️' },
        { label: 'Architectural pattern', note: 'A proven solution to a recurring structural problem inside a system. Examples: MVC, hexagonal.', tone: 'info', icon: '🏘️' },
        { label: 'Design pattern', note: 'A small, reusable arrangement of a few classes. Examples: Strategy, Observer, Factory.', tone: 'good', icon: '🏠' }
      ],
      note: 'Experts do not agree on exactly where to draw these lines. Some call microservices a style, others a pattern. Do not let that bother you; knowing the zoom level is what helps.' },

    { kind: 'metaphor', title: 'Cuisine, dish and technique',
      body: `Think of cooking.

        - **Style** is the *cuisine*: Italian, Thai, Mexican. It tells you the general flavours and what to expect on the table.
        - **Architectural pattern** is the *dish*: a risotto, a stir-fry. It solves a recurring problem within the cuisine.
        - **Design pattern** is the *technique*: how to dice an onion, how to fold a dough.

        You can cook Italian in many ways, and the same technique appears in every cuisine.

        Likewise a system might be **layered** (style), use **MVC** in its screens (pattern) and **Strategy** inside a class (design pattern). They stack rather than compete. Where the metaphor stops: in a restaurant you can taste a cuisine, but in software the style is invisible unless you draw it.` },

    { kind: 'compare', title: 'Three families of style',
      body: 'This module follows a common grouping. Each family is worried about a different thing.',
      cols: ['Structural', 'Distributed', 'Messaging'],
      rows: [
        ['Main question', 'How is the code divided into parts?', 'Which computers do what?', 'How do parts tell each other things?'],
        ['Styles in this module', 'Monolith, layered, component-based', 'Client–server, peer-to-peer', 'Event-driven, publish–subscribe'],
        ['Typical worry', 'Tangled, hard-to-change code', 'Networks, failure, who is in charge', 'Following a flow you cannot see']
      ],
      note: 'Families overlap. A real system almost always mixes styles from more than one.' },

    { kind: 'diagram', title: 'The map',
      body: 'The nine lessons of this module on one page. Dashed lines mean "often combined".',
      nodes: [
        { id: 'mono', label: 'Monolith', x: 0, y: 0 },
        { id: 'lay', label: 'Layered', x: 0, y: 1 },
        { id: 'comp', label: 'Component-based', x: 0, y: 2 },
        { id: 'cs', label: 'Client–server', x: 1, y: 1, tone: 'accent' },
        { id: 'p2p', label: 'Peer-to-peer', x: 1, y: 2, tone: 'accent' },
        { id: 'ed', label: 'Event-driven', x: 2, y: 1, tone: 'info' },
        { id: 'ps', label: 'Publish–subscribe', x: 2, y: 2, tone: 'info' },
        { id: 'dist', label: 'Distributed systems', x: 1, y: 3, tone: 'warn' }
      ],
      edges: [
        { from: 'mono', to: 'lay', dashed: true, both: true },
        { from: 'lay', to: 'cs', dashed: true, both: true },
        { from: 'cs', to: 'ed', dashed: true, both: true },
        { from: 'ed', to: 'ps', dashed: true, both: true },
        { from: 'cs', to: 'dist', dashed: true },
        { from: 'p2p', to: 'dist', dashed: true }
      ],
      groups: [{ label: 'Structural', x: 0, y: 0, w: 1, h: 3 }, { label: 'Distributed', x: 1, y: 1, w: 1, h: 3 }, { label: 'Messaging', x: 2, y: 1, w: 1, h: 2 }],
      caption: 'Everything that crosses a network inherits the problems in the last lesson. The next module covers more named shapes, such as microservices.' },

    { kind: 'concept', title: 'Real systems mix styles',
      body: `Take an online shop. At the biggest zoom it is **client–server**: browsers and phones ask, the shop's servers answer.

        Inside the server code it is **layered**: screens, then business rules, then storage.

        When an order is placed, the system announces it so that emails, stock and loyalty points can react: **event-driven**.

        Nobody chose one style for the whole thing. They chose the style that suits each *part*, using the qualities from the last module (scalability, simplicity, availability) as the guide.

        When you describe a system, say which style applies **at which level**. "It's layered" on its own is incomplete.` },

    { kind: 'pitfall', title: 'There is no best style',
      body: `Beginners often look for the "modern" or "correct" style and apply it everywhere. This is how a team of four ends up running thirty services for a shop with two hundred customers.

        A style is a **bundle of trade-offs**. Each one makes some qualities easy and others hard:

        - one deployable unit is simple to run and hard to scale in parts
        - events keep parts independent and make flows hard to trace
        - peers have no central point of failure and are hard to control

        Fashion changes. Trade-offs do not. Ask "what do we need most?" before "what are others using?".` },

    { kind: 'tip', title: 'How to use the map',
      body: `When a new system or feature arrives, do not start by naming a style. Start with questions:

        1. **What qualities matter most?** (Scalability, availability, simplicity, speed of change.)
        2. **How big is the team, and how many teams?**
        3. **What must be able to change independently?**

        Then browse the map for shapes that fit, and pick the **simplest** one that does the job.

        As a general rule, start simple and add complexity only when something starts to hurt. Most of the later lessons end with exactly that question: "when does this stop being enough?"` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each term to the zoom level it belongs to.',
      pairs: [['Layered', 'Style: parts stacked, each using the one below'], ['Client–server', 'Style: requesters and providers'], ['MVC', 'Architectural pattern for organising a screen'], ['Observer', 'Design pattern: notify interested listeners'], ['Strategy', 'Design pattern: swap one algorithm for another']] },

    { type: 'bucket', after: 5, prompt: 'Which family does each style mainly belong to?', buckets: ['Structural', 'Distributed', 'Messaging'],
      items: [['Monolith', 0], ['Layered', 0], ['Component-based', 0], ['Client–server', 1], ['Peer-to-peer', 1], ['Event-driven', 2], ['Publish–subscribe', 2]],
      explain: 'Structural styles are about how code is divided. Distributed styles are about which computers do what. Messaging styles are about how parts tell each other things.' },

    { type: 'mcq', q: 'What is the main value of an architectural style?',
      options: ['Its rules make it predictable how parts connect and where changes land', 'It guarantees the system will be fast at any scale', 'It removes the need to think about quality attributes', 'It tells you which programming language to use'],
      answer: 0,
      why: [null, 'No style guarantees speed. Each makes some qualities easier and others harder.', 'Styles are chosen *because* of quality attributes, not instead of them.', 'Styles are language-neutral.'],
      explain: 'A style is a set of rules about what the parts are and how they may connect. Because the rules are known, people can predict behaviour and plan changes.' },

    { type: 'tf', after: 7, statement: 'A mature system should pick one architectural style and apply it consistently to every part.', answer: false,
      explain: 'Real systems mix styles at different levels: client–server at the top, layered inside the server, event-driven for some reactions. Each part gets the style that suits it.' },

    { type: 'order', prompt: 'Order these from the widest zoom to the narrowest.',
      items: ['Architectural style (the whole system’s shape)', 'Architectural pattern (a structural solution inside it)', 'Design pattern (a few classes)', 'A single function'],
      explain: 'Styles shape whole systems, patterns shape parts of them, design patterns shape a few classes, and code is the finest grain. Higher zoom levels cost more to change.' },

    { type: 'cloze', text: 'A style is the shape of the {{whole system}}, a design pattern is a small arrangement of a few {{classes}}, and real systems usually {{mix}} several styles.',
      distractors: ['database', 'copy', 'ignore'],
      explain: 'Zoom level is the key: styles at system scale, design patterns at class scale. And because parts differ, a real system combines styles.' },

    { type: 'ab', q: 'Which is the better way to start choosing an architecture?',
      a: { lang: 'text', label: 'Start from fashion', src: 'Use whichever style everyone uses this year.' },
      b: { lang: 'text', label: 'Start from needs', src: 'Find our top qualities, then pick the simplest shape.' },
      answer: 'b',
      explain: 'Trade-offs stay the same while fashions change. Starting from your own priorities (scalability, simplicity, speed of change) finds a shape that fits rather than one that merely looks current.' },

    { type: 'scenario', title: 'The copycat proposal', intro: 'You are on a four-person team building an internal tool to book meeting rooms for a 300-person company. A colleague has just read about a famous company and wants to copy its architecture.',
      meters: { 'fit for the job': 50, 'team energy': 60 },
      steps: [
        { text: 'The colleague says: “Let’s use the same style as that famous company.” What do you ask first?',
          choices: [
            { label: 'What do we need most here, and how does their situation differ from ours?', score: 2, effects: { 'fit for the job': 20, 'team energy': 5 }, feedback: 'Exactly. Their style fitted their scale, team size and priorities. Yours are different, so start from your own needs.' },
            { label: 'Agree, since a famous company must know best.', score: 0, effects: { 'fit for the job': -25, 'team energy': -15 }, feedback: 'They solved *their* problems. Copying the solution without the problem gives you the cost and none of the benefit.' },
            { label: 'Refuse to discuss it; we will do what we always do.', score: 1, effects: { 'fit for the job': 0, 'team energy': -20 }, feedback: 'Habit may land on a good answer, but shutting the conversation down means you never test it. Questions are better than vetoes.' }
          ] },
        { text: 'You find the tool has few users, one team and simple rules. Which approach fits?',
          choices: [
            { label: 'Start with the simplest shape that works, and add complexity only if something starts to hurt.', score: 2, effects: { 'fit for the job': 30, 'team energy': 15 }, feedback: 'Simple is easy to build, run and change. You can always add structure later, and you will do it with real evidence.' },
            { label: 'Build for ten thousand users, just in case.', score: 0, effects: { 'fit for the job': -20, 'team energy': -10 }, feedback: 'You would pay for scale you may never need, in time and in complexity, every single week.' },
            { label: 'Pick three styles at random to keep options open.', score: 0, effects: { 'fit for the job': -15 }, feedback: 'Mixing styles is fine when each has a reason. Mixing them for the sake of it just adds parts to understand.' }
          ] }
      ],
      outro: 'The pattern to remember: **start from your own needs, then pick the simplest style that serves them.**' },

    { type: 'explain', prompt: 'Explain the difference between an architectural style, an architectural pattern and a design pattern, using any analogy you like.',
      model: 'A style is the overall shape of a whole system, such as layered or client–server. An architectural pattern solves a recurring structural problem inside a system, such as MVC. A design pattern is a small arrangement of a few classes, such as Observer. Like cuisine, dish and technique, they sit at different zoom levels and combine rather than compete.',
      keywords: ['whole system', 'style', 'pattern', 'zoom', 'classes', 'combine'] }
  ],

  flashcards: [
    { q: 'What is an architectural style?', a: 'A broad, named way of organising a whole system, defining what kinds of parts exist and how they may connect.' },
    { q: 'How do style, architectural pattern and design pattern differ?', a: 'Zoom level: a style shapes the whole system, an architectural pattern solves a structural problem within it, and a design pattern arranges a few classes.' },
    { q: 'What are the three families of style used in this module?', a: 'Structural (how code is divided), distributed (which computers do what) and messaging (how parts tell each other things).' },
    { q: 'Do real systems use a single style?', a: 'No. They mix styles at different levels, such as client–server overall, layered inside the server and event-driven for some reactions.' },
    { q: 'What should you decide before choosing a style?', a: 'Which quality attributes matter most, how many people and teams there are, and what must change independently.' }
  ],

  glossary: [
    { term: 'Architectural style', def: 'A broad, named way of organising a whole system, giving rules about the kinds of parts and how they connect.', like: 'A cuisine: it sets the general flavours and what to expect.' },
    { term: 'Architectural pattern', def: 'A proven solution to a recurring structural problem within a system, at a smaller scale than a style.', like: 'A dish within a cuisine: a risotto, a stir-fry.' },
    { term: 'Design pattern', def: 'A small, reusable arrangement of a few classes that solves a common design problem.', like: 'A kitchen technique, such as how to dice an onion.' },
    { term: 'Architectural constraint', def: 'A rule a style imposes on how parts may connect, which makes the system more predictable.', like: 'The rules of a game that let everyone predict what will happen.' }
  ],

  takeaways: [
    'A **style** is the shape of a whole system; a **pattern** is a part; a **design pattern** is a few classes.',
    'Three families: **structural**, **distributed**, **messaging**.',
    'Real systems **mix styles** at different levels.',
    'There is **no best style**: start from needs, pick the simplest that serves them.'
  ],

  links: [
    { label: 'martinfowler.com: Software Architecture Guide', url: 'https://martinfowler.com/architecture/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('as-monolith', {
  eli5: 'A monolith is a program built and shipped as one single piece, and for most products that is a perfectly good way to start and often a good way to carry on.',

  cards: [
    { kind: 'story', title: 'One command, and it is live',
      body: `Two startups launch the same week. The first has one application. A developer runs one command, and a minute later the new version is live.

        The second has fourteen separate services, each in its own repository, each with its own pipeline and its own database. A feature that touches three of them needs three changes, three reviews and a careful order of deployment.

        Six months on, the first company has shipped far more features. The second has a very impressive diagram.

        The first company has a **monolith**. It has a reputation for being old-fashioned, and that reputation is unfair.` },

    { kind: 'concept', title: 'A monolith is one deployable unit',
      body: `A **monolith** is a system **built, deployed and run as a single unit**. All the features live in one codebase and run in one process (or several identical copies of it). Usually they share one database.

        The word means "one stone". Everything is carved from the same block: the screens, the business rules, the connections to the database, the background jobs.

        The important idea is **how you ship it**, not how tidy the code is. If you cannot deploy the checkout code without deploying the search code, it is a monolith.

        Do not confuse "monolith" with "messy". A monolith can be beautifully organised, or a dreadful tangle. We will see both.` },

    { kind: 'metaphor', title: 'One house vs a village',
      body: `A monolith is a **house**: every room under one roof, one front door, one set of keys, one heating bill.

        Moving the kitchen is easy, because you walk to the next room. If the roof leaks, though, the whole house gets wet.

        The alternative is a **village** of separate cottages. Each can be repaired on its own, but now you need roads, signposts, a postal service and someone who understands the whole map.

        For a family of four, a house is the obvious choice. A village is for when you have hundreds of people who must live independently. Where the metaphor stops: software can move from house to village later, and doing it *when needed* is far cheaper than building a village up front.` },

    { kind: 'compare', title: 'What a monolith gives and takes',
      body: 'Neither column is a verdict. They are the price list.',
      cols: ['Helps', 'Hurts'],
      rows: [
        ['Deploying', 'One thing to build and ship', 'Every change ships everything'],
        ['Calling other parts', 'A fast, reliable function call', 'Parts can lean on each other too easily'],
        ['Consistency', 'One database transaction covers it all', 'One shared schema everyone fears to touch'],
        ['Debugging', 'One log, one stack trace', 'A huge codebase to hold in your head'],
        ['Scaling', 'Run more identical copies', 'Cannot scale only the hot part'],
        ['Team size', 'Great for one small team', 'Many teams trip over each other']
      ] },

    { kind: 'concept', title: 'Why monoliths are underrated',
      body: `Some of the quiet superpowers of one deployable unit:

        - **Calls are function calls.** They are fast, they cannot time out and they cannot half-succeed. (The last lesson in this module is about what you lose the moment a call crosses a network.)
        - **One transaction.** Taking payment and reducing stock can succeed or fail together.
        - **Easy to run and test.** The whole product starts on a laptop.
        - **Easy to refactor.** The compiler or tests tell you immediately if a move broke something.
        - **One thing to monitor and secure.**

        Plenty of large, successful products ran as a monolith for years. Splitting too early swaps these benefits for problems you did not yet have.` },

    { kind: 'pitfall', title: 'The big ball of mud',
      body: `The bad monolith has a famous name: the **big ball of mud**, from a 1997 paper by Brian Foote and Joseph Yoder. It is a system with no clear structure, where anything calls anything and nobody knows what will break.

        It is rarely designed that way. It grows. Each shortcut makes sense on the day, and years later nobody dares touch the pricing code because it is tangled with the emails and the reports.

        Note the cause: **the problem is missing boundaries, not the single deployable unit.** A set of microscopic services with no clear boundaries between them would be a mud ball too, just a distributed one.` },

    { kind: 'diagram', title: 'The modular monolith: boundaries inside one unit',
      body: 'The cure is not to split it into many programs. It is to put **walls inside** the one program.',
      nodes: [
        { id: 'cat', label: 'Catalogue', x: 0, y: 0 },
        { id: 'ord', label: 'Orders', x: 1, y: 0, tone: 'accent' },
        { id: 'bill', label: 'Billing', x: 2, y: 0 },
        { id: 'ship', label: 'Shipping', x: 1, y: 1 },
        { id: 'db', label: 'One database', icon: '🗄️', x: 1, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'ord', to: 'cat', label: 'public interface' },
        { from: 'ord', to: 'bill', label: 'public interface' },
        { from: 'ord', to: 'ship', label: 'public interface' },
        { from: 'ship', to: 'db', dashed: true }
      ],
      groups: [{ label: 'One deployable unit', x: 0, y: 0, w: 3, h: 2 }],
      caption: 'A **modular monolith** has clear modules, each with a small public interface and its own data. They are deployed together but organised as if they could one day be separated.' },

    { kind: 'code', title: 'What a module boundary looks like',
      body: 'In a modular monolith, a module exposes a few functions and hides everything else. **Tap the lines.**',
      code: { lang: 'js', src: `
        // billing/index.js  (the module's public front door)
        const { chargeCard } = require('./internal/gateway');
        const { taxFor } = require('./internal/tax');

        function takePayment(order) {
          const total = order.subtotal + taxFor(order);
          return chargeCard(order.customerId, total);
        }

        module.exports = { takePayment };`,
        notes: {
          2: 'The messy details live in an `internal` folder. Other modules are not supposed to import from it.',
          5: 'Everything the rest of the system needs is a single function: `takePayment`.',
          10: 'Only this is exported. If the team later moves billing to its own service, this is the seam where the cut goes.'
        } },
      note: 'Modern tools can enforce this: a build rule or lint check that fails if one module imports another’s `internal` folder.' },

    { kind: 'concept', title: 'When it starts to hurt',
      body: `A monolith is not forever. Typical signs that it is outgrowing its shape:

        - **Builds and tests take so long** that developers stop running them.
        - **Deploys are scary**, because every release carries everyone's changes.
        - **Teams collide**: many people editing the same areas, with endless merge conflicts.
        - **One hot part needs far more capacity** than the rest, and you pay to scale all of it.
        - **One bad part takes down everything**, such as a memory leak in a report generator.

        Notice what these have in common: they are mostly about **many people and very different load**, not about code being old. Small teams with modest load can go on happily for years.` },

    { kind: 'tip', title: 'Before you split, try the cheap fixes',
      body: `Many monolith pains have cheaper cures than breaking the system into services:

        1. **Draw the walls inside** and enforce them: the modular monolith.
        2. **Run more copies** behind a load balancer. You met this in the Web Servers & Scaling Out module.
        3. **Add a cache** in front of the hot reads.
        4. **Move slow work to a background queue.**
        5. **Speed up the build** and test suite.

        If you do outgrow it, a modular monolith is the best starting point for splitting, because the seams already exist. A later module covers the services route, and why many experienced people recommend "monolith first".` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What makes a system a monolith?',
      options: ['It is built and deployed as a single unit', 'Its code is badly organised', 'It runs on only one server machine, never more', 'It was written a long time ago'],
      answer: 0,
      why: [null, 'A monolith can be well organised. Messiness is a separate problem.', 'You can run many identical copies of a monolith. It is still one deployable unit.', 'Age is irrelevant. Plenty of new systems are monoliths.'],
      explain: 'The defining feature is how it is shipped: one unit. Whether it is tidy, how many copies run and how old it is are all separate questions.' },

    { type: 'tf', after: 4, statement: 'In a monolith, taking a payment and reducing stock can be done in a single database transaction.', answer: true,
      explain: 'Everything shares one process and usually one database, so both changes can succeed or fail together. Once the two live in different services, that guarantee takes much more work.' },

    { type: 'bucket', after: 8, prompt: 'Is this a sign the monolith is hurting, or an ordinary monolith strength?', buckets: ['A strength', 'A sign it is hurting'],
      items: [['The whole product starts on a laptop', 0], ['Tests take 90 minutes, so nobody runs them', 1], ['A call to another module is just a function call', 0], ['Five teams keep colliding in the same files', 1], ['One database transaction covers the whole order', 0], ['A leak in the report generator takes down checkout', 1]],
      explain: 'The strengths come from everything living together. The pains come from many people and uneven load sharing one unit.' },

    { type: 'spot', after: 7, prompt: 'This module is meant to hide its internals. Tap the line that breaks its boundary.',
      code: { lang: 'js', src: `
        // orders/placeOrder.js
        const billing = require('../billing');
        const { taxFor } = require('../billing/internal/tax');

        function placeOrder(cart) {
          const tax = taxFor(cart);
          return billing.takePayment({ ...cart, tax });
        }` },
      lines: [3],
      explain: 'Line 3 reaches into billing’s `internal` folder instead of using its public interface. Now billing cannot reorganise its insides without breaking orders, which is how boundaries in a monolith quietly erode into mud.' },

    { type: 'ab', q: 'A monolith’s checkout is slow because one report job hogs the CPU. Which is the better first move?',
      a: { lang: 'text', label: 'Split into services', src: 'Break the whole system into twenty services.' },
      b: { lang: 'text', label: 'Move the report job', src: 'Run the report on a background worker queue.' },
      answer: 'b',
      explain: 'The problem is one job hogging resources. Moving it to a background worker fixes that at a fraction of the cost of redesigning everything, and gives you real evidence about what else hurts.' },

    { type: 'multi', q: 'Which of these are good reasons to be careful before splitting a monolith into many services?',
      options: ['Calls become network calls that can fail or time out', 'One database transaction no longer covers the whole operation', 'You must deploy, monitor and secure many more things', 'The code will automatically become messier', 'Services cannot be written in the same language'],
      answers: [0, 1, 2],
      explain: 'Network calls, lost transactions and operational overhead are real costs. Splitting does not cause mess, and services can be written in the same language.' },

    { type: 'order', prompt: 'Put these in a sensible order for a growing monolith.',
      items: ['Start with one simple deployable application', 'Notice code from different areas tangling together', 'Put clear modules with public interfaces inside it', 'Fix hot spots with copies, caches and background workers', 'Only if still needed, extract one module as its own service'],
      explain: 'Walls come before cuts: modules inside the monolith, then cheap fixes, and only then carve out a service, ideally along a seam that already exists.' },

    { type: 'scenario', title: 'The slow-release company', intro: 'You lead a company with a ten-year-old monolith and thirty developers. Releases happen monthly because they are risky, and a recent outage came from an unrelated change in the reports code. The CTO wants to rewrite everything as services.',
      meters: { 'delivery speed': 30, 'risk': 70 },
      steps: [
        { text: 'What do you look at before agreeing to a rewrite?',
          choices: [
            { label: 'What specifically hurts: slow builds, tangled modules, risky deploys, uneven load.', score: 2, effects: { 'delivery speed': 5, risk: -10 }, feedback: 'Different pains have different cures. Diagnosis first stops you paying for a big fix to a small problem.' },
            { label: 'How many famous companies use services.', score: 0, effects: { risk: 10 }, feedback: 'Their reasons are not yours. A rewrite chosen by fashion can sink a year of work.' },
            { label: 'Nothing: monoliths are always bad, so rewrite.', score: 0, effects: { 'delivery speed': -20, risk: 25 }, feedback: 'Big rewrites often stall, and meanwhile the old system still needs changes. The monolith is not the enemy; its tangles are.' }
          ] },
        { text: 'You find the code is tangled and there is no automatic testing around the riskiest areas. What is the best first step?',
          choices: [
            { label: 'Introduce modules with enforced boundaries, add tests around the risky parts, and speed up the pipeline.', score: 2, effects: { 'delivery speed': 35, risk: -35 }, feedback: 'This tackles the real causes. Releases become safer and more frequent, and clean seams appear if you ever do need to split.' },
            { label: 'Freeze all features for a year and start again from scratch.', score: 0, effects: { 'delivery speed': -35, risk: 20 }, feedback: 'A freeze starves the business and the new system will need to match ten years of hidden behaviour.' },
            { label: 'Split off the three biggest features as services at once.', score: 1, effects: { 'delivery speed': 5, risk: 15 }, feedback: 'Without clear seams, you will drag the tangle across a network, which is worse than having it in-process.' }
          ] }
      ],
      outro: 'The pattern to remember: **fix the boundaries first. Distribution is a later, optional step.**' },

    { type: 'explain', prompt: 'A friend says: "Monoliths are outdated; everyone should use services." Respond, mentioning the big ball of mud and the modular monolith.',
      model: 'A monolith is one deployable unit, which makes it simple to build, test, run and keep consistent, so it suits many products, especially with small teams. The real danger is the big ball of mud, where there are no boundaries between parts. A modular monolith keeps one deployment but puts clear modules with public interfaces inside. Move to services only when many teams or very uneven load make the simple option hurt.',
      keywords: ['one deployable', 'simple', 'big ball of mud', 'modular monolith', 'boundaries', 'teams'] }
  ],

  flashcards: [
    { q: 'What is a monolith?', a: 'A system built, deployed and run as one single unit, usually one codebase and one database.' },
    { q: 'Name some strengths of a monolith.', a: 'Simple deploys, fast reliable function calls, one transaction across everything, easy local testing and refactoring, one thing to monitor.' },
    { q: 'What is the big ball of mud?', a: 'A system with no clear structure where anything calls anything. The cause is missing boundaries, not being a single deployable unit.' },
    { q: 'What is a modular monolith?', a: 'One deployable unit with clear internal modules, each with a small public interface and its own data.' },
    { q: 'Name some signs a monolith is starting to hurt.', a: 'Slow builds and tests, scary deploys, teams colliding, one hot part needing much more capacity, and one failing part taking down everything.' }
  ],

  glossary: [
    { term: 'Monolith', def: 'A system built, deployed and run as a single unit, with all features in one codebase and process.', like: 'A house: every room under one roof.' },
    { term: 'Big ball of mud', def: 'A system with no discernible structure in which any part may depend on any other.', like: 'A drawer of tangled cables.' },
    { term: 'Modular monolith', def: 'A monolith organised into clear modules with public interfaces and separate data, deployed together as one.', like: 'A house with proper walls and doors between rooms.' }
  ],

  takeaways: [
    'A monolith is **one deployable unit**, and is often the right place to start.',
    'Its strengths: simple deploys, function calls, one transaction, easy testing.',
    'The real enemy is the **big ball of mud**, caused by missing boundaries.',
    'Prefer a **modular monolith** and cheap fixes before you split into services.'
  ],

  links: [
    { label: 'martinfowler.com: Monolith First', url: 'https://martinfowler.com/bliki/MonolithFirst.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('as-layered', {
  eli5: 'Layered architecture stacks a program into floors, such as screens on top, business rules in the middle and data storage at the bottom, where each floor only talks to the one directly below it.',

  cards: [
    { kind: 'story', title: 'Why are there always three folders?',
      body: `Open almost any business application written in Java, C#, PHP or JavaScript and you will find the same three folders: \`controllers\`, \`services\` and \`repositories\`. Or something close.

        New developers often ask who decided that. Nobody did, exactly. Generations of developers arrived at the same shape because it solves a real problem: **a web request involves several different jobs**, and mixing them in one place is a mess.

        That shape is **layered architecture**, also called **n-tier**. It is the most common style in everyday business software, which is why it is worth knowing well, including where it goes wrong.` },

    { kind: 'concept', title: 'Layers: one job per floor',
      body: `A **layer** is a group of code with one kind of job. The layers are stacked, and the rule is simple: **a layer may only use the layer directly beneath it.**

        A request enters at the top, passes down through each layer doing its part, reaches the bottom, and the answer travels back up.

        Why is that useful? Each layer can be understood, tested and even replaced without knowing the details of the others. You can change the look of every screen without touching the rules about discounts, and change the database without rewriting a single screen.

        This is the "separate things that change for different reasons" idea from the principles module, as a whole-system shape.` },

    { kind: 'layers', title: 'The four classic layers',
      body: 'Top of the stack first. Names vary between teams, but the jobs are very consistent.',
      layers: [
        { label: 'Presentation', note: 'Takes the request in and shows the answer: web pages, JSON responses, forms. No business rules.', tone: 'accent', icon: '🖥️' },
        { label: 'Business (domain)', note: 'The rules: pricing, eligibility, workflows. The valuable part.', tone: 'good', icon: '🧠' },
        { label: 'Persistence (data access)', note: 'Translates between business objects and the database: queries, saving, loading.', tone: 'info', icon: '🔌' },
        { label: 'Database', note: 'Where the data actually lives and is kept safe.', tone: 'muted', icon: '🗄️' }
      ],
      note: 'Some teams merge persistence and database into one layer, giving three. Others add layers such as a separate "services" layer. The number is not sacred.' },

    { kind: 'metaphor', title: 'The restaurant, floor by floor',
      body: `Picture a restaurant.

        - The **waiter** (presentation) takes your order and brings your food. They do not cook.
        - The **chef** (business) knows the recipes and decides how things are done. They do not go to the shops.
        - The **storekeeper** (persistence) fetches ingredients and puts them away.
        - The **storeroom** (database) holds the stock.

        You never speak to the storekeeper, and the chef never takes orders at the table. Everyone knows their job and who they report to.

        Where the metaphor stops: a restaurant has people who can wander anywhere. Code needs the rule enforced, or someone will start importing database code into a page.` },

    { kind: 'sequence', title: 'One request, falling down the layers',
      body: 'A customer asks to see order 42. Step through it.',
      actors: ['Controller', 'Service', 'Repository', 'Database'],
      steps: [
        { at: 0, label: 'GET /orders/42 arrives', note: 'The browser’s request lands in the **presentation** layer, the controller.' },
        { from: 0, to: 1, label: 'getOrder(42)', note: 'The controller does no thinking. It turns the request into a plain call to the **business** layer.' },
        { from: 1, to: 2, label: 'findById(42)', note: 'The service needs the data, so it asks the **persistence** layer.' },
        { from: 2, to: 3, label: 'SELECT … WHERE id = 42', note: 'Only the repository knows SQL.' },
        { from: 3, to: 2, label: 'a row', dashed: true, note: 'The database returns raw data.' },
        { from: 2, to: 1, label: 'Order object', dashed: true, note: 'The repository turns the row into an object the business layer understands.' },
        { at: 1, label: 'applies the rules', note: 'The service checks the customer may see this order, and works out the total including discounts.' },
        { from: 1, to: 0, label: 'result', dashed: true, note: 'The answer goes back up.' },
        { at: 0, label: 'sends 200 OK + JSON', note: 'The controller formats the answer for the web and replies to the browser.' }
      ] },

    { kind: 'code', title: 'Three layers in a few lines',
      body: 'Each layer calls only the one beneath it. **Tap the lines.**',
      code: { lang: 'js', src: `
        // presentation
        app.get('/orders/:id', async (req, res) => {
          const order = await orderService.get(req.params.id);
          res.json(order);
        });

        // business
        async function get(id) {
          const order = await orderRepo.findById(id);
          order.total = order.items.reduce((s, i) => s + i.price, 0);
          return order;
        }

        // persistence
        async function findById(id) {
          return db.query('SELECT * FROM orders WHERE id = $1', [id]);
        }`,
        notes: {
          3: 'The controller calls the **service** and never touches the database.',
          9: 'The service calls the **repository** and never writes SQL.',
          10: 'The business rule (how a total is calculated) lives here, in the middle.',
          15: 'SQL appears in exactly one layer. Change databases and this is where the work is.'
        } } },

    { kind: 'concept', title: 'Closed layers and open layers',
      body: `A **closed layer** means a request must pass *through* it to reach the layer below. The presentation layer cannot skip the business layer and call the repository directly.

        Closed layers give you **isolation**: the layers are independent, so you can change one without breaking the rest.

        An **open layer** may be skipped. A common example is a small layer of shared helpers (formatting, logging) that any layer above may use directly.

        The trade-off is simple. Closed layers give more protection, but force every request through every floor. Open layers are quicker, but a layer that can be bypassed is a layer that others start depending on.` },

    { kind: 'compare', title: 'Layers vs tiers: logical vs physical',
      body: 'These two words are easy to mix up. One is about how code is organised, the other about where it runs.',
      cols: ['Layer', 'Tier'],
      rows: [
        ['What it is', 'A group of code with one job', 'A separately running machine or group of machines'],
        ['Concerned with', 'Organising code', 'Deploying and scaling'],
        ['Example', 'Business layer', 'Application servers'],
        ['Typical count', 'Three or four', 'Often three']
      ],
      note: 'A **three-tier deployment** puts the web/presentation tier, the application (business) tier and the database tier on separate machines. Layers can all live in one process; tiers cannot.' },

    { kind: 'pitfall', title: 'The sinkhole anti-pattern',
      body: `Look at what many requests actually do. A request for order 42 goes controller, service, repository, database, and on the way back **each layer just passes the data along**. The service has no rules to apply for a plain read.

        When most requests are like this, the layers add ceremony and no value. That is the **sinkhole anti-pattern**: requests fall straight through floors that do nothing.

        Some architects use a rough rule of thumb: some pass-through is normal, but if the **majority** of requests are pure pass-through, reconsider. Perhaps open a layer for simple reads, or accept that the app is mostly data display and simplify.

        Layers are a tool, not a law.` },

    { kind: 'tip', title: 'Strengths, and the catch',
      body: `**Strengths**: it is simple, familiar to almost every developer, easy to explain, and teams can split by layer.

        **The catch**: in the classic version the business layer depends *downwards* on persistence, so the rules end up knowing how data is stored. That is the opposite of the dependency rule from the principles module. Also, a single new field (say, a customer's middle name) usually means editing **every layer**.

        Later modules cover architectural patterns, such as hexagonal and clean architecture, that keep the layered idea but flip the arrows so the rules sit in the middle.

        For a simple business app, a plain layered design is often exactly right.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each layer to its job.',
      pairs: [['Presentation', 'Takes requests in and shows answers'], ['Business', 'Holds the rules: pricing, eligibility'], ['Persistence', 'Translates between objects and the database'], ['Database', 'Stores the data safely']] },

    { type: 'order', after: 4, prompt: 'Put a request for order 42 in the order it travels through the layers.',
      items: ['The controller receives the HTTP request', 'The service is asked for the order', 'The repository runs the SQL query', 'The service applies the rules to the loaded order', 'The controller sends back JSON'],
      explain: 'The request falls down through presentation, business and persistence, then the answer climbs back up with each layer doing only its own job.' },

    { type: 'tf', after: 6, statement: 'In a system with closed layers, the presentation layer must go through the business layer to reach the persistence layer.', answer: true,
      explain: 'Closed layers must be passed through. Skipping the business layer means rules can be bypassed and the presentation layer starts to depend on storage details.' },

    { type: 'spot', prompt: 'This controller breaks the layering rule. Tap the line.',
      code: { lang: 'js', src: `
        app.get('/orders/:id', async (req, res) => {
          const id = req.params.id;
          const rows = await db.query('SELECT * FROM orders WHERE id=$1', [id]);
          res.json(rows[0]);
        });` },
      lines: [3],
      explain: 'The presentation layer is running SQL itself, jumping over the business and persistence layers. A change of database now means editing the controllers, and any business rule is skipped.' },

    { type: 'mcq', q: 'A simple read request passes through four layers and each one only hands the data on. What is this called?',
      options: ['The sinkhole anti-pattern', 'A closed layer', 'A three-tier deployment', 'The big ball of mud'],
      answer: 0,
      why: [null, 'A closed layer is a layer that must be passed through. It is a rule, not a fault.', 'That describes where layers run, not whether they do any work.', 'A ball of mud has no structure. This one has structure that does no work.'],
      explain: 'The sinkhole anti-pattern is when requests pass through layers that add nothing. If most requests do this, consider opening a layer or simplifying.' },

    { type: 'bucket', prompt: 'Is each item about a layer (how code is organised) or a tier (where it runs)?', buckets: ['Layer', 'Tier'],
      items: [['The business rules code', 0], ['The group of database servers', 1], ['The persistence code that builds SQL', 0], ['The fleet of application servers', 1], ['The presentation code that formats JSON', 0], ['The machines running the web servers', 1]],
      explain: 'Layers are logical groups of code. Tiers are physical places where things run. A layered system can run entirely in one process, or have each tier on separate machines.' },

    { type: 'ab', q: 'Where should the rule "orders over £50 ship free" live in a layered system?',
      a: { lang: 'js', label: 'In the controller', src: `
        app.post('/orders', (req, res) => {
          const shipping = req.body.total >= 50 ? 0 : 4.99;
          // …
        });` },
      b: { lang: 'js', label: 'In the business layer', src: `
        function shippingFor(total) {
          return total >= 50 ? 0 : 4.99;
        }` },
      answer: 'b',
      explain: 'Business rules belong in the business layer, where any screen or API can use the same rule and it can be tested without a web server. A controller should only translate requests and responses.' },

    { type: 'scenario', title: 'The empty middle layer', intro: 'You inherit a layered app whose business layer is full of methods like `getUser(id) { return repo.getUser(id); }`. Developers grumble that adding one field means editing four files.',
      meters: { 'developer joy': 40, 'safety': 60 },
      steps: [
        { text: 'What is the first thing to work out?',
          choices: [
            { label: 'How many requests do real work in the middle layer, and how many only pass through?', score: 2, effects: { 'developer joy': 10 }, feedback: 'You are measuring whether you have a sinkhole. If most calls add nothing, the ceremony is not earning its keep.' },
            { label: 'Delete the business layer straight away.', score: 0, effects: { 'developer joy': 5, safety: -20 }, feedback: 'The rules that *do* live there would end up scattered through the controllers. Look before you cut.' },
            { label: 'Add more layers so each has even less to do.', score: 0, effects: { 'developer joy': -20 }, feedback: 'More floors for requests to fall through makes the sinkhole deeper, not shallower.' }
          ] },
        { text: 'You find that about nine in ten calls are plain reads and the real rules sit in a few write operations. What do you do?',
          choices: [
            { label: 'Let simple reads skip the empty layer (open it for reads) but keep the business layer for operations with rules.', score: 2, effects: { 'developer joy': 30, safety: 5 }, feedback: 'Layers earn their place where they do work. Opening the layer for reads removes ceremony while keeping rules protected.' },
            { label: 'Keep everything exactly as it is: consistency matters more than anything.', score: 1, effects: { 'developer joy': -10 }, feedback: 'Consistency has value, but here it costs a lot of boilerplate for nothing. Weigh the two.' },
            { label: 'Move all rules into the controllers to cut out the middle man.', score: 0, effects: { 'developer joy': 5, safety: -30 }, feedback: 'Now rules are tied to the web layer and duplicated across screens. You traded a boring problem for a risky one.' }
          ] }
      ],
      outro: 'The pattern to remember: **a layer should earn its place. If most requests fall straight through, simplify.**' },

    { type: 'explain', prompt: 'Describe layered architecture to a new colleague: the usual layers, the one rule, and one weakness.',
      model: 'The code is stacked in layers with one job each: presentation takes requests and shows answers, business holds the rules, persistence talks to the database, and the database stores the data. Each layer only uses the one directly below. A weakness is the sinkhole anti-pattern, where requests pass through layers that do nothing, and a single new field often means editing every layer.',
      keywords: ['presentation', 'business', 'persistence', 'database', 'below', 'sinkhole', 'closed'] }
  ],

  flashcards: [
    { q: 'What are the four classic layers of a layered architecture?', a: 'Presentation, business (domain), persistence (data access) and database.' },
    { q: 'What is the basic rule of layering?', a: 'A layer may only use the layer directly beneath it. Requests fall down and answers climb back up.' },
    { q: 'Closed layer vs open layer?', a: 'A closed layer must be passed through to reach the one below. An open layer may be skipped, which is quicker but weakens isolation.' },
    { q: 'Layer vs tier?', a: 'A layer is a logical group of code with one job. A tier is a physical place where code runs, such as separate application or database servers.' },
    { q: 'What is the sinkhole anti-pattern?', a: 'Requests passing straight through layers that do no work, adding ceremony and no value.' }
  ],

  glossary: [
    { term: 'Layered architecture', def: 'A style that stacks code into layers with one job each, where each layer uses only the one directly below.', aka: ['n-tier'], like: 'The floors of a restaurant: waiter, chef, storekeeper, storeroom.' },
    { term: 'Closed layer', def: 'A layer that requests must pass through, so the layers above cannot skip it.', like: 'A security door you cannot walk around.' },
    { term: 'Three-tier deployment', def: 'Running the presentation, application and database parts on separate machines or groups of machines.', like: 'Shop floor, back office and warehouse in separate buildings.' },
    { term: 'Sinkhole anti-pattern', def: 'When most requests pass through layers without any of them doing real work.', like: 'A queue where each desk just stamps the form and hands it on.' }
  ],

  takeaways: [
    'Layers stack by **job**: presentation, business, persistence, database.',
    'Each layer uses **only the one beneath**; closed layers must be passed through.',
    '**Layers** organise code; **tiers** are where it runs.',
    'Watch for the **sinkhole**: layers that earn nothing should be opened or removed.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('as-component-based', {
  eli5: 'Component-based architecture builds a system out of separate parts with clear plugs, so you can swap or reuse one part without rebuilding the others.',

  cards: [
    { kind: 'story', title: 'Swapping a graphics card',
      body: `When you build a desktop PC, you do not weld the graphics card to the motherboard. It slots into a standard socket. Years later you can pull it out, push in a faster one and carry on.

        Nobody needs to understand how the card works inside. They only need to know that it fits the socket and does its job.

        Software can be built the same way. A shopping cart, a payment module, a login screen: each is a **part** with a plug, and the rest of the system only knows the plug.

        That is **component-based architecture**. You have already met the packaging side in the module on principles. This lesson is about using it as the shape of a whole system.` },

    { kind: 'concept', title: 'Replaceable parts with clear interfaces',
      body: `A **component** is a self-contained part of a system that does one job and hides how.

        It talks to the world through an **interface**: the small set of things it offers (what it *provides*) and sometimes what it needs from others (what it *requires*).

        The system is built by **plugging components together** through those interfaces.

        Three ideas hold it together:
        - **Encapsulation**: the insides are private.
        - **A clear interface**: the plug is small and stable.
        - **Replaceability**: any component that fits the plug can stand in.

        Get these right and the parts can be built by different people, tested alone and replaced without touching their neighbours.` },

    { kind: 'metaphor', title: 'Sockets and plugs, again',
      body: `You met the plug-and-socket idea in loose coupling. Components are that idea made into a structure.

        Think of a hi-fi system. The amplifier, speakers, turntable and streamer are separate boxes joined by standard cables. You can upgrade the speakers and keep the rest. A turntable can be tested by itself.

        What the cables have in common is **a small agreement**. The amp does not care what is inside the speakers, only that the plug fits.

        Where the metaphor stops: hi-fi plugs were agreed by an industry over decades. In software, **you** design the plug, and a badly designed one (too big, or too leaky) ruins the benefit.` },

    { kind: 'compare', title: 'Class, component, service: three different sizes',
      body: 'These three words are often mixed up. They are different levels of "part".',
      cols: ['Class', 'Component', 'Service'],
      rows: [
        ['What it is', 'One type in code', 'A group of code with a public interface', 'A separate running program'],
        ['Where it runs', 'Inside the program', 'Usually inside the same process', 'Its own process, reached over a network'],
        ['Talks via', 'Method calls', 'Its interface (often function calls)', 'Network requests'],
        ['Replace by', 'Editing the code', 'Swapping the package or module', 'Redeploying that program']
      ],
      note: 'A component may *become* a service later. That is one reason clear interfaces are worth having from the start.' },

    { kind: 'code', title: 'A component with plugs',
      body: 'A cart component needs a price source and offers a small interface. **Tap the lines.**',
      code: { lang: 'js', src: `
        // The cart *requires* prices, supplied from outside
        function createCart(priceSource) {
          const items = [];

          return {                     // what the cart *provides*
            add(sku)  { items.push(sku); },
            total()   { return items.reduce(
                          (sum, sku) => sum + priceSource.priceOf(sku), 0); }
          };
        }

        const cart = createCart({ priceOf: sku => 5 });`,
        notes: {
          2: 'The cart does not create its own price lookup. It **asks to be given one**. That is its required interface.',
          3: 'The list of items is private. Nothing outside can reach in and edit it.',
          5: 'The provided interface is two functions: `add` and `total`. That is the whole plug.',
          12: 'In tests we plug in a dummy price source. In production a real catalogue component goes here. The cart never changes.'
        } } },

    { kind: 'diagram', title: 'A system built from components',
      body: 'Each box offers an interface and some need others. Nothing reaches inside any box.',
      nodes: [
        { id: 'ui', label: 'Storefront screens', icon: '🖥️', x: 1, y: 0 },
        { id: 'cart', label: 'Cart', x: 0, y: 1, tone: 'accent' },
        { id: 'cat', label: 'Catalogue', x: 1, y: 1, tone: 'accent' },
        { id: 'pay', label: 'Payments', x: 2, y: 1, tone: 'accent' },
        { id: 'gw', label: 'Card gateway (swappable)', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'ui', to: 'cart', label: 'uses' },
        { from: 'ui', to: 'cat', label: 'uses' },
        { from: 'ui', to: 'pay', label: 'uses' },
        { from: 'cart', to: 'cat', label: 'needs prices', dashed: true },
        { from: 'pay', to: 'gw', label: 'plugs in' }
      ],
      caption: 'Swap the gateway and only Payments’ plug-in changes. Replace Catalogue with a faster one and as long as the plug is the same, Cart never notices.' },

    { kind: 'concept', title: 'Reuse, and its limits',
      body: `The dream is that once a component is built, you reuse it everywhere. Sometimes that works beautifully: date pickers, login forms, payment modules.

        But reuse is harder than it looks.

        - A component written for one case needs **options** to suit another, and options pile up until the interface is huge.
        - Reusing a component means **depending** on it, and on its release schedule and its bugs.
        - Reuse is only safe if its interface is **stable**.

        A common rule of thumb is to wait for the **rule of three**: copy something once, copy it twice, and extract a shared component the third time. By then you can see what really varies.

        Reuse is a benefit you earn, not one you get by default.` },

    { kind: 'realworld', title: 'Components in screens and in servers',
      body: `**In user interfaces**, this style is everywhere. In frameworks such as React, Vue or Angular you build a page from components: a Button, a Card, a SearchBox, each with its own inputs and its own appearance, nested inside each other. Many teams collect them into a **design system** so every product shares the same parts.

        **In backends**, components are modules or libraries with a public interface: an authentication module, a payment module, a notification module. Everything you install from a package manager is a component somebody else built.

        **Plug-in systems** (editors, browsers, content management systems) take it to the extreme, with components added by third parties after the product ships.` },

    { kind: 'pitfall', title: 'Components that share their guts',
      body: `The most common failure is a set of components that look separate but are not.

        - They **reach into each other's internals**, so changing one breaks the next.
        - They **share one database table**, and so cannot change their data without telling everyone.
        - They are so **tiny** that the wiring costs more than the work.
        - They form **cycles**: A needs B, which needs A.

        The result is the worst of both worlds: the ceremony of components with the tangle of a ball of mud.

        The checks from the previous module apply: depend in one direction, keep interfaces small and give each component its own data.` },

    { kind: 'tip', title: 'Designing a good component',
      body: `Four habits that help:

        1. **Design the interface first.** Write down what callers will do before writing how.
        2. **Keep it small.** A plug with twelve pins is a bad plug. If callers need several steps to do one thing, the interface is wrong.
        3. **Hide the data.** Other components should never read your storage.
        4. **Pass dependencies in** rather than creating them inside, so a part can be replaced or faked.

        A component built this way can be developed by one person, tested alone, and promoted to a separate service if it ever outgrows the shared process.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What lets one component be swapped for another in a component-based system?',
      options: ['They offer the same small interface, so neighbours depend only on the plug', 'They are written in the same programming language as each other', 'They are kept together in the same folder of the project', 'They read and write the same table in the shared database'],
      answer: 0,
      why: [null, 'Language is irrelevant to whether one part can stand in for another.', 'Folders organise files, not dependencies.', 'Sharing a table couples them tightly, the opposite of replaceable.'],
      explain: 'Replaceability depends on the interface. If a component offers the same plug, whatever is behind it can change freely.' },

    { type: 'match', after: 3, prompt: 'Match each term to its description.',
      pairs: [['Class', 'One type in a program’s code'], ['Component', 'A part with a public interface, usually in the same process'], ['Service', 'A separate running program reached over a network'], ['Interface', 'The small plug a part offers or needs']] },

    { type: 'tf', after: 6, statement: 'Reusing a shared component is free: you get the benefit and take on no new dependency.', answer: false,
      explain: 'Reuse means depending on the component, its release schedule and its bugs. It also tends to pile up options as more cases need it. The benefit is real but earned.' },

    { type: 'bucket', prompt: 'Class, component or service?', buckets: ['Class', 'Component', 'Service'],
      items: [['`Money`: a type holding an amount and a currency', 0], ['An authentication module with a small public API, inside the app', 1], ['A payment program with its own server and network endpoint', 2], ['`Basket`: an object holding items', 0], ['A date-picker widget used across many screens', 1], ['A separate email-sending program called over HTTP', 2]],
      explain: 'Classes are single types, components are packaged parts with an interface that normally run inside the same process, and services run on their own and are reached over a network.' },

    { type: 'ab', q: 'Which cart is easier to test and to adapt?',
      a: { lang: 'js', label: 'Creates its own price lookup', src: `
        class Cart {
          constructor() { this.prices = new CatalogueDatabase(); }
        }` },
      b: { lang: 'js', label: 'Is given a price source', src: `
        class Cart {
          constructor(prices) { this.prices = prices; }
        }` },
      answer: 'b',
      explain: 'Passing the dependency in means a test can supply a dummy, and production can supply any component with the right plug. The version that creates its own lookup is welded to one database.' },

    { type: 'spot', prompt: 'These two “components” are not really separate. Tap the line that couples them.',
      code: { lang: 'js', src: `
        // billing component
        function invoiceTotal(orderId) {
          const rows = ordersTable.select(orderId);
          return rows.reduce((s, r) => s + r.price, 0);
        }` },
      lines: [3],
      explain: 'Billing is reading the orders component’s own table directly. If orders changes its storage, billing breaks. It should call orders through a public interface instead.' },

    { type: 'cloze', text: 'A component hides its {{insides}} and exposes a small {{interface}}. Anything with the same plug can be {{swapped}} in without changing its neighbours.',
      distractors: ['database', 'language', 'removed'],
      explain: 'Hidden insides, a small interface and swappability are the three ideas that make components worth having.' },

    { type: 'scenario', title: 'Build, share or copy?', intro: 'Your team of five maintains a shop. Two screens each have their own copy of a date-range picker, and the marketing team wants a third. A colleague proposes a shared, reusable “DatePicker component” with 20 options.',
      meters: { 'code quality': 50, 'team speed': 50 },
      steps: [
        { text: 'The two existing pickers are slightly different. What do you do?',
          choices: [
            { label: 'Compare them and extract the common behaviour into a shared component with a small interface, now that there are three uses.', score: 2, effects: { 'code quality': 25, 'team speed': 10 }, feedback: 'With three real cases you can see what truly varies. This is the rule of three at work, and the interface stays small.' },
            { label: 'Build the 20-option component that handles every future case.', score: 0, effects: { 'code quality': -10, 'team speed': -25 }, feedback: 'Guessing at future needs gives a large interface nobody understands. Most options will never be used.' },
            { label: 'Copy-paste the picker a third time.', score: 1, effects: { 'code quality': -10, 'team speed': 10 }, feedback: 'Fast today, but the third copy is the signal to share. Three copies will drift apart and each needs the same bug fix.' }
          ] },
        { text: 'Six months later, the shared component has grown many options and every change risks breaking someone. What is the healthiest response?',
          choices: [
            { label: 'Keep the interface small, version the component with release notes, and let screens with unusual needs wrap it rather than add options.', score: 2, effects: { 'code quality': 25, 'team speed': 10 }, feedback: 'That keeps the plug small and stable. Odd cases are handled at the edge, so the shared part stays easy to understand.' },
            { label: 'Add an option for every request.', score: 0, effects: { 'code quality': -25, 'team speed': -10 }, feedback: 'This is how a component becomes a configuration puzzle. Every option multiplies the cases to test.' },
            { label: 'Delete the component and go back to copies.', score: 1, effects: { 'code quality': -10 }, feedback: 'You would lose the benefit of sharing. It is better to tidy the interface than to abandon the idea.' }
          ] }
      ],
      outro: 'The pattern to remember: **share when you can see what varies, and keep the plug small.**' },

    { type: 'explain', prompt: 'Explain component-based architecture, and say how a component differs from a class and from a service.',
      model: 'The system is built from self-contained parts that hide their insides and talk through small, stable interfaces, so any part with the right plug can be swapped or reused. A class is a single type in code. A component is a packaged group with a public interface, usually running in the same process. A service is a separate program reached over a network. Good components keep interfaces small and hide their data.',
      keywords: ['interface', 'hide', 'swap', 'class', 'service', 'process', 'network'] }
  ],

  flashcards: [
    { q: 'What is component-based architecture?', a: 'Building a system from self-contained parts that hide their insides and connect through small, clear interfaces so they can be swapped or reused.' },
    { q: 'What three ideas make components work?', a: 'Encapsulation (private insides), a clear small interface, and replaceability.' },
    { q: 'Class vs component vs service?', a: 'A class is one type in code, a component is a packaged part with a public interface usually inside one process, and a service is a separate program reached over a network.' },
    { q: 'What is the rule of three?', a: 'Copy something twice, and extract a shared component on the third use, once you can see what really varies.' },
    { q: 'What are signs that components are not truly separate?', a: 'Reaching into each other’s internals, sharing database tables, dependency cycles, or being so tiny that wiring costs more than the work.' }
  ],

  glossary: [
    { term: 'Component-based architecture', def: 'A style that builds a system from self-contained, replaceable parts connected through clear interfaces.', like: 'A hi-fi system of separate boxes joined by standard cables.' },
    { term: 'Interface', def: 'The small set of operations a component offers (and sometimes requires), which is all the outside world needs to know.', like: 'The shape of a plug.' },
    { term: 'Encapsulation', def: 'Hiding a component’s internals behind its interface so others cannot depend on them.', like: 'The casing around a graphics card.' },
    { term: 'Design system', def: 'A shared collection of reusable interface components and rules so many products look and behave consistently.', like: 'A box of standard Lego bricks for a whole company.' }
  ],

  takeaways: [
    'A component **hides its insides** and offers a **small interface**.',
    'Systems are built by plugging components together; any part with the right plug can be swapped.',
    'Class < **component** < service: components usually run in the same process.',
    'Reuse is **earned**: wait for the rule of three and keep interfaces small.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('as-client-server', {
  eli5: 'In client–server, one side (the client) asks for things and another side (the server) waits and answers, which is how the web, email and most apps on your phone work.',

  cards: [
    { kind: 'story', title: 'The bus-stop weather check',
      body: `You are at a bus stop. You open a weather app and a forecast appears in under a second.

        Your phone does not contain the forecast. It does not even know the weather. It sent a short message to a computer somewhere, that computer looked up the answer and sent it back, and your phone drew it nicely on the screen.

        You were the one who asked. The computer was the one waiting to be asked.

        This pattern, **asker and answerer**, is so common you have been using it all day without noticing: every web page, every email, every message, every banking app. It is the **client–server** style.` },

    { kind: 'concept', title: 'Requesters and providers',
      body: `In **client–server**, the system is split into two kinds of part:

        - A **client** starts the conversation. It *requests* something.
        - A **server** waits for requests, does the work and *responds*.

        Key properties:

        - **The client moves first.** A server never has to know clients exist until they call.
        - **One server, many clients.** One shop's server answers thousands of browsers.
        - **Roles, not machines.** "Client" and "server" describe what a program is *doing*. Your laptop may run a browser (client) and a small development server (server) at once.

        This is the shape underneath the HTTP lessons you have already done.` },

    { kind: 'metaphor', title: 'The pizza shop and its phone line',
      body: `A pizza shop sits by its phone, waiting. Customers (clients) ring whenever they like. The shop (server) answers, takes the order, makes the pizza and delivers.

        - The shop never rings customers to ask if they want a pizza. They start the conversation.
        - One shop serves hundreds of customers, each with their own order.
        - The customers do not need to know how the oven works. They need the **phone number and the menu**.

        The phone number and the menu together are the shop's **interface**: the agreed way to ask.

        Where the metaphor stops: a real shop sometimes calls you back. Servers can too (the real-time lessons showed how), but usually only because a client opened the line first.` },

    { kind: 'sequence', title: 'One round trip, with a database behind it',
      body: 'A client asks, the server works, the server answers. Step through it.',
      actors: ['Client', 'Server', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'request', note: 'The **client** starts: it asks for the forecast for Leeds.' },
        { at: 1, label: 'checks the request', note: 'The **server** validates it and checks who is asking. Never assume a client is honest.' },
        { from: 1, to: 2, label: 'look up Leeds', note: 'The server may need other things to answer. Here, a database.' },
        { from: 2, to: 1, label: 'data', dashed: true, note: 'The database replies to the server, not to the client.' },
        { from: 1, to: 0, label: 'response', dashed: true, note: 'The server sends the finished answer back.' },
        { at: 0, label: 'shows it', note: 'The client turns the data into something a human can read.' }
      ] },

    { kind: 'compare', title: 'Thin clients and thick clients',
      body: 'How much work should the client do? There is a spectrum, and the ends have names.',
      cols: ['Thin client', 'Thick (fat) client'],
      rows: [
        ['Where the logic lives', 'Mostly on the server', 'Mostly on the client'],
        ['Needs a network', 'Almost always', 'Can often work offline'],
        ['Updating', 'Update the server once, everyone gets it', 'Every user has to install an update'],
        ['Client needs', 'Little power', 'More power and storage'],
        ['Examples', 'A simple web page; a terminal on a mainframe', 'A desktop game; a photo editor']
      ],
      note: 'Many modern apps sit in the middle. A single-page web app downloads real logic to the browser, so it is thicker than a classic page but updates like a website.' },

    { kind: 'compare', title: 'Two-tier, three-tier and n-tier',
      body: 'A **tier** is a group of machines with one role. How many tiers sit between the user and the data?',
      cols: ['Two-tier', 'Three-tier'],
      rows: [
        ['Layout', 'Client talks directly to the database server', 'Client, then application server, then database server'],
        ['Business logic lives', 'In the client program', 'In the middle application tier'],
        ['Strength', 'Simple, quick to build', 'Rules in one place, database hidden from clients'],
        ['Weakness', 'Every client needs database access and the rules', 'More machines to run']
      ],
      note: '**n-tier** means more than three: add caches, gateways, queues or search servers as separate tiers. Almost every web system today is three-tier or more.' },

    { kind: 'diagram', title: 'The web as client–server',
      body: 'Many clients, one front door, and layers behind it that clients never see.',
      nodes: [
        { id: 'b1', label: 'Browser', icon: '🌐', x: 0, y: 0 },
        { id: 'ph', label: 'Phone app', icon: '📱', x: 1, y: 0 },
        { id: 'tv', label: 'Smart TV', icon: '📺', x: 2, y: 0 },
        { id: 'web', label: 'Web server', icon: '🖥️', x: 1, y: 1, tone: 'accent' },
        { id: 'app', label: 'Application server', x: 1, y: 2, tone: 'accent' },
        { id: 'db', label: 'Database server', icon: '🗄️', x: 1, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'b1', to: 'web', label: 'HTTP' },
        { from: 'ph', to: 'web' },
        { from: 'tv', to: 'web' },
        { from: 'web', to: 'app' },
        { from: 'app', to: 'db' }
      ],
      caption: 'Every arrow is "asks". Clients ask the web server; the web server asks the application server; that asks the database. Each is a client of the one below.' },

    { kind: 'concept', title: 'The model behind the web',
      body: `The web is client–server on a global scale. Your **browser is a universal client**: it can talk to any server that speaks HTTP, whether run by a student or a bank.

        That works because the contract is standard: URLs name the servers and things, HTTP defines the questions and answers, and each request is self-contained (you remember: *stateless*).

        Notice that "server" is relative. The application server above is a *server* to the web server and a *client* to the database. In a chain, every middle link plays both roles.

        This is the style underneath REST APIs, GraphQL and most mobile apps.` },

    { kind: 'pitfall', title: 'Two traps: trusting the client, and the choke point',
      body: `**Never trust the client.** The client is on the user's machine, and the user can change anything on it. Checks in the client (such as "price cannot be negative") are only a courtesy. The **server must check everything again**. You met this in the web security module.

        **The server is a shared choke point.** All clients depend on it, so if it is slow or down, everyone is affected. It is also where load concentrates as users grow. Hence the lessons on scaling out, caching and resilience: they are largely about making that single point of dependence stronger.

        Client–server is simple and powerful, and these two weaknesses come with it.` },

    { kind: 'realworld', title: 'You have been using it all along',
      body: `Look for the asker and answerer in things you already use:

        - **Email**: your mail app is a client; your provider's mail server answers.
        - **Databases**: your program is a client using a driver; the database is a server.
        - **DNS**: your computer asks a resolver, which answers.
        - **Online games**: the game on your console is a client; the match is run by a server that decides what really happened.
        - **Chat apps**: clients connect to a server that passes messages between people.

        Even this course is client–server: your browser asks a host for pages, and the site you are reading comes back as the response.` }
  ],

  activities: [
    { type: 'bucket', after: 1, prompt: 'Does this describe the client or the server?', buckets: ['Client', 'Server'],
      items: [['Starts the conversation', 0], ['Waits for requests to arrive', 1], ['Typically serves many others at once', 1], ['Shows the answer to a human', 0], ['Does the lookups and the heavy work', 1], ['Chooses when to ask', 0]],
      explain: 'The client moves first and presents results; the server waits, works and responds. They are roles a program plays, not types of machine.' },

    { type: 'tf', after: 1, statement: 'A single computer can be both a client and a server at the same time.', answer: true,
      explain: '"Client" and "server" are roles. A laptop can run a browser (client) and a local development server (server) together, and an application server is a server to the web server and a client to the database.' },

    { type: 'mcq', after: 4, q: 'A photo-editing app does all its work on your own computer and can run offline. What kind of client is it?',
      options: ['A thick client', 'A thin client', 'A two-tier database', 'A peer'],
      answer: 0,
      why: [null, 'A thin client leaves nearly all the work to the server and usually needs a network.', 'Two-tier describes how many layers of machines sit behind, not the client.', 'Peers are covered in a later lesson. This app is still a client.'],
      explain: 'Most of the logic runs on the client, so it is thick. Thin clients depend on the server for most of the work.' },

    { type: 'match', after: 5, prompt: 'Match the tier pattern to its description.',
      pairs: [['Two-tier', 'Client talks directly to the database server'], ['Three-tier', 'Client, application server, then database server'], ['n-tier', 'Three or more, adding caches, gateways or queues'], ['Thin client', 'Leaves most of the work to the server']] },

    { type: 'cloze', text: 'In client–server, the {{client}} starts the conversation and the {{server}} waits and responds. A system with a client, an application server and a database server is {{three-tier}}.',
      distractors: ['peer', 'two-tier', 'layer'],
      explain: 'The client always moves first. Counting groups of machines (tiers) gives two-tier, three-tier and so on.' },

    { type: 'short', q: 'What do we call a client that leaves almost all the work to the server? (one word)', accept: ['thin', 'thin client'], hint: 'The opposite of "fat" or "thick".',
      explain: 'A thin client relies on the server for nearly everything. A thick client does most of the work itself.' },

    { type: 'ab', q: 'A shop’s mobile app checks that the discount code is valid. Where should the real check live?',
      a: { lang: 'js', label: 'Only in the app', src: `
        if (code === 'SPRING10') applyDiscount(0.1);` },
      b: { lang: 'js', label: 'On the server', src: `
        const r = await fetch('/discounts/check', { method: 'POST', body: code });
        if (r.ok) applyDiscount((await r.json()).rate);` },
      answer: 'b',
      explain: 'Anything in the client can be changed by the user, so the server must make the real decision. A check in the app is only a courtesy to give quick feedback.' },

    { type: 'scenario', title: 'Thin or thick?', intro: 'You are designing a note-taking app for field engineers who often work in basements and tunnels with no signal. Notes must sync to the office when they are back online.',
      meters: { 'works underground': 30, 'easy updates': 50 },
      steps: [
        { text: 'How much logic should the app carry on the engineer’s device?',
          choices: [
            { label: 'A thick client: it stores notes locally and works fully offline, then syncs later.', score: 2, effects: { 'works underground': 55, 'easy updates': -10 }, feedback: 'The basement is the deciding fact. A thin client would be useless with no signal. The price is more logic on every device to keep up to date.' },
            { label: 'A thin client: it shows pages from the server, since that is easiest to update.', score: 0, effects: { 'works underground': -30, 'easy updates': 25 }, feedback: 'Easy to update, but engineers cannot write a note when there is no connection, which is exactly when they most need to.' },
            { label: 'A thin client with a message: “Please find signal to continue”.', score: 0, effects: { 'works underground': -20, 'easy updates': 10 }, feedback: 'That makes the user solve the architecture’s problem. The requirement itself should shape the design.' }
          ] },
        { text: 'Two engineers edit the same note offline, then both sync. The server has to decide what to do. Who should be the final judge of the saved data?',
          choices: [
            { label: 'The server: it validates both changes and applies the rules for merging.', score: 2, effects: { 'works underground': 5, 'easy updates': 15 }, feedback: 'The server is the one place all clients meet, and the only one you can trust. Client-side code can be changed by users.' },
            { label: 'Whichever device syncs last: let the client overwrite.', score: 0, effects: { 'easy updates': -10 }, feedback: 'One engineer’s notes silently disappear. Deciding conflicts is a server job.' },
            { label: 'The engineers, by phone call.', score: 1, effects: { 'easy updates': -15 }, feedback: 'You may need a human tiebreak for hard cases, but the normal route should be automatic rules on the server.' }
          ] }
      ],
      outro: 'The pattern to remember: **let the user’s situation decide how thick the client is, and let the server be the judge.**' },

    { type: 'explain', prompt: 'Explain the client–server style to a friend using the weather app, and describe one weakness.',
      model: 'The weather app is the client: it starts the conversation by asking a server for the forecast. The server waits for requests, looks up the answer and responds, and one server can serve thousands of clients. A weakness is that the server is a shared choke point: if it is slow or down, everyone is affected. Another is that the client cannot be trusted, so the server must check everything.',
      keywords: ['client', 'server', 'request', 'response', 'asks', 'choke point', 'trust'] }
  ],

  flashcards: [
    { q: 'What is the client–server style?', a: 'A system split into clients, which start requests, and servers, which wait, do the work and respond. One server serves many clients.' },
    { q: 'Are client and server types of machine?', a: 'No, they are roles. One computer can be a client and a server at once, and a middle server is a server to one side and a client to the other.' },
    { q: 'Thin vs thick client?', a: 'A thin client leaves most work to the server and usually needs a network. A thick client does most work itself and can often run offline.' },
    { q: 'Two-tier vs three-tier?', a: 'Two-tier: the client talks straight to the database server. Three-tier adds an application server between them. n-tier adds more.' },
    { q: 'What are the two classic weaknesses of client–server?', a: 'The client cannot be trusted, so the server must re-check everything, and the server is a shared choke point for load and failure.' }
  ],

  glossary: [
    { term: 'Client', def: 'The part of a system that starts a conversation by sending a request.', like: 'The customer who phones the pizza shop.' },
    { term: 'Server', def: 'The part of a system that waits for requests, does the work and responds.', like: 'The pizza shop by its phone.' },
    { term: 'Thin client', def: 'A client that leaves nearly all the logic to the server.', like: 'A TV remote: all the cleverness is in the TV.' },
    { term: 'Thick client', def: 'A client that does most of the work itself and may work offline.', aka: ['fat client'], like: 'A full kitchen at home rather than a takeaway order.' },
    { term: 'Tier', def: 'A group of machines with one role in a system, such as application servers or database servers.', like: 'A department in a company.' }
  ],

  takeaways: [
    'The **client asks first**; the **server waits and answers**. They are roles, not machines.',
    '**Thin** clients lean on the server; **thick** clients carry the logic and can work offline.',
    'Two-, three- and **n-tier** count the groups of machines between user and data.',
    '**Never trust the client**, and remember the server is a shared choke point.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('as-p2p', {
  eli5: 'In peer-to-peer, there is no central server: every computer is both customer and shop, sharing what it has and fetching what it needs directly from the others.',

  cards: [
    { kind: 'story', title: 'The download that got faster as more people joined',
      body: `Normally, the more people download from a website, the slower it gets, because they all queue at one server.

        Now picture downloading a big file where the opposite happens. A hundred people start downloading at once, and everyone finishes *sooner*. The company that published the file barely pays for any bandwidth.

        How? You are not getting the file from one place. You are getting small pieces from **dozens of strangers' computers**, and handing out the pieces you already have to others at the same time.

        Everyone is a customer and a shop. That is the **peer-to-peer** (P2P) style.` },

    { kind: 'concept', title: 'Every node is both client and server',
      body: `In client–server there are two roles. In **peer-to-peer** there is one: the **peer**. Each peer (also called a **node**) can *ask* for things and *answer* requests.

        There is **no central point** in charge. No master server holds the data or decides who talks to whom.

        This gives P2P its characteristic strengths:

        - **Capacity grows with users.** Each new peer brings its own bandwidth and storage.
        - **No single point of failure.** Remove any peer and the network carries on.
        - **Cheap for the organiser.** Users supply the resources.

        These are real advantages, and they come with real costs, which we get to shortly.` },

    { kind: 'metaphor', title: 'The potluck dinner',
      body: `A restaurant is client–server: a kitchen produces, customers consume, and the kitchen is the bottleneck on a busy night.

        A **potluck** is peer-to-peer. Everyone brings a dish and everyone eats. More guests means more food on the table, and if one person cancels, dinner still happens.

        But a potluck has its own problems. How do guests know who brought what? What if someone brings nothing and eats everything? What if a dish is secretly bad? And who is in charge of the music?

        Where the metaphor stops: in a potluck you can see everyone in the room. In P2P, peers join and leave at random across the globe, so finding each other is a real problem.` },

    { kind: 'diagram', title: 'A star and a mesh',
      body: 'Compare the shape of client–server with a peer-to-peer network.',
      nodes: [
        { id: 'a', label: 'Peer A', x: 0, y: 0 },
        { id: 'b', label: 'Peer B', x: 2, y: 0 },
        { id: 'c', label: 'Peer C', x: 1, y: 1, tone: 'accent' },
        { id: 'd', label: 'Peer D', x: 0, y: 2 },
        { id: 'e', label: 'Peer E', x: 2, y: 2 }
      ],
      edges: [
        { from: 'a', to: 'b', both: true }, { from: 'a', to: 'c', both: true }, { from: 'b', to: 'c', both: true },
        { from: 'c', to: 'd', both: true }, { from: 'c', to: 'e', both: true }, { from: 'd', to: 'e', both: true }
      ],
      caption: 'No box is in charge. Every peer connects to some others, not necessarily all. Take away peer C and the rest can still reach each other through the remaining links.' },

    { kind: 'concept', title: 'The discovery problem',
      body: `If there is no central directory, how do you find a peer that has what you want?

        Options, in rough order of history:

        - **A central index** (a hybrid). Peers do the sharing, but one server keeps a list of who has what. Simple and fast, but that server is a weak point and a target.
        - **Flooding**. Ask your neighbours, who ask theirs, and so on. It works, but the questions swamp the network as it grows.
        - **A distributed hash table**, which is what most modern systems use. Next card.

        Discovery is *the* hard problem in P2P. Moving the data between peers is the easy part.` },

    { kind: 'concept', title: 'Distributed hash tables: a phone book split between everyone',
      body: `Imagine a giant phone book that is too big for one machine. A **distributed hash table** (DHT) tears it into slices and gives each peer **one slice**.

        - Every item has a **key**, and hashing the key says which peer's slice it belongs to.
        - Each peer knows only a **few other peers**, but cleverly chosen ones: some near it, some far.
        - To look something up, you ask the peer you know that is **closest** to the key, who points you to someone closer, and so on.

        Each hop gets closer, so even among millions of peers a lookup takes only a handful of hops (roughly the logarithm of the network size).

        It is the same idea as the hash ring in the sharding lesson, but with no central coordinator. Kademlia is a well-known DHT design.` },

    { kind: 'realworld', title: 'BitTorrent and blockchains',
      body: `**BitTorrent** splits a file into many small pieces. A group of peers sharing one file is a **swarm**. You download different pieces from different peers, and while you download, you also upload the pieces you already hold. Peers that have the whole file and keep sharing are called **seeders**. A tracker or a DHT helps you find the swarm.

        **Blockchains** (as in Bitcoin) are also peer-to-peer. Thousands of nodes each keep a copy of a shared ledger, and they follow rules to agree on what gets added, with no central bank or owner.

        Both are examples of systems where the *point* is that nobody is in charge. The details of blockchains are well beyond this lesson; here, they are the second famous P2P example.` },

    { kind: 'sequence', title: 'WebRTC: peers in browsers, with a little help',
      body: 'Browsers can connect directly to each other for video calls using **WebRTC**. They still need an introduction first.',
      actors: ['Browser A', 'Signalling server', 'Browser B'],
      steps: [
        { from: 0, to: 1, label: 'I want to call B', note: 'Browser A does not know how to reach B yet. It contacts a normal **server** that both know.' },
        { from: 1, to: 2, label: 'A’s details (offer)', note: 'The server passes along A’s connection details. It is the **signalling** step.' },
        { from: 2, to: 1, label: 'B’s details (answer)', dashed: true, note: 'B replies, and the server relays it back to A.' },
        { from: 0, to: 2, label: 'direct connection', note: 'Now A and B connect **directly**. Finding a way through home routers needs helper servers (called STUN and TURN) in the background.' },
        { from: 0, to: 2, label: 'video and audio', note: 'The video flows straight between the two, not through any company server, so it is quick and cheap to run.' }
      ] },

    { kind: 'compare', title: 'The trade-offs',
      body: 'Peer-to-peer solves some problems and creates others.',
      cols: ['Client–server', 'Peer-to-peer'],
      rows: [
        ['As users grow', 'The server needs more capacity', 'Capacity grows with the peers'],
        ['Single point of failure', 'The server', 'None in principle'],
        ['Control and updates', 'The owner decides and can fix at once', 'Hard to change or remove anything'],
        ['Trust', 'You trust the server', 'Any peer could be dishonest'],
        ['Finding things', 'Ask the server', 'A real problem (discovery)']
      ] },

    { kind: 'pitfall', title: 'Peer-to-peer rarely means “no servers at all”',
      body: `Read the WebRTC example again: there was a server. Most real P2P systems are **hybrids**, using a few central helpers where they make life easy (introductions, indexes, bootstrapping) and peers for the heavy lifting.

        Two other cautions:

        - **Peers are strangers.** Any peer might send you corrupt data or lie. Systems verify pieces (for example by checking hashes) rather than trusting anyone.
        - **Peers are unreliable.** They come and go as laptops close, so the design must expect constant churn.

        P2P suits things where **sharing among many** is the point and where no single party should have to carry the cost or the control.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the defining feature of a peer-to-peer system?',
      options: ['Every node is both client and server, and nobody is in charge', 'It works without any network connection between computers', 'It always stores everything in one very large database', 'Exactly one computer ever sends data to all the others'],
      answer: 0,
      why: [null, 'P2P is entirely about computers connecting over a network.', 'Databases are unrelated to the definition.', 'In P2P, many peers send and receive.'],
      explain: 'The single role of "peer" replaces the client and server pair. There is no central authority that holds everything or must be asked first.' },

    { type: 'tf', after: 3, statement: 'Because peers connect directly, a peer-to-peer network never needs any server at all.', answer: false,
      explain: 'Most real systems are hybrids. WebRTC, for example, uses a signalling server to introduce two browsers before they connect directly, and BitTorrent often uses trackers to help find peers.' },

    { type: 'bucket', after: 8, prompt: 'Which style does each statement fit better?', buckets: ['Client–server', 'Peer-to-peer'],
      items: [['Capacity grows when more users join', 1], ['The owner can change or remove content at once', 0], ['One failed machine can take everyone offline', 0], ['Any participant might be dishonest and must be checked', 1], ['Finding who has the data is a major problem', 1], ['The server must be scaled as users grow', 0]],
      explain: 'Client–server concentrates control, load and risk in one place. Peer-to-peer spreads them out, which gives resilience and scale but makes control, trust and discovery much harder.' },

    { type: 'match', prompt: 'Match each term to what it means.',
      pairs: [['Peer', 'A node that is both client and server'], ['Swarm', 'The group of peers sharing one file in BitTorrent'], ['DHT', 'A lookup table split across the peers themselves'], ['Signalling', 'Introducing two peers before they connect directly'], ['Seeder', 'A peer that has the whole file and keeps sharing']] },

    { type: 'order', prompt: 'Put a BitTorrent-style download in a sensible order.',
      items: ['You get the information describing the file and its pieces', 'You find other peers sharing the same file', 'You download different pieces from different peers', 'You check each piece, and share the pieces you already hold', 'You have the whole file, and may stay on as a seeder'],
      explain: 'You first need the description and some peers. Pieces arrive from many sources while you give back what you hold. Finishing leaves you with a complete copy you can keep offering.' },

    { type: 'cloze', text: 'A {{distributed hash table}} splits a big lookup table across the peers, so a lookup takes a few hops without any central {{index}}. Systems also check {{hashes}} of data, because any peer could be dishonest.',
      distractors: ['firewall', 'server', 'cookie'],
      explain: 'A DHT removes the need for a central directory by giving each peer a slice. Hash checks let you verify data from strangers.' },

    { type: 'short', q: 'What is the three-letter abbreviation for the lookup structure that splits a key–value table across the peers?', accept: ['DHT'], hint: 'Distributed Hash Table.',
      explain: 'A DHT assigns each peer a slice of the keys and lets lookups hop towards the right peer, with no central coordinator.' },

    { type: 'scenario', title: 'Sharing the town’s videos', intro: 'A local council wants to share large video recordings of meetings with 20,000 residents. Peaks come right after each meeting. A server big enough for the peaks would sit idle the rest of the time.',
      meters: { 'cost': 40, 'reliability': 50 },
      steps: [
        { text: 'Which approach fits the sharing problem best?',
          choices: [
            { label: 'Offer a normal website, but let viewers’ browsers help share pieces with each other when many watch at once.', score: 2, effects: { cost: 30, reliability: 15 }, feedback: 'A hybrid: a dependable central source plus peers carrying part of the load at peak. You get the cost saving without relying on strangers alone.' },
            { label: 'Pure peer-to-peer with no council-run source at all.', score: 1, effects: { cost: 35, reliability: -25 }, feedback: 'Cheap, but if nobody online holds the video, nobody can see it, and the council loses control over removing wrong or private material.' },
            { label: 'Buy servers for the peak and ignore the cost.', score: 1, effects: { cost: -30, reliability: 20 }, feedback: 'Simple and dependable, but you pay for peak capacity all year when it is needed a few hours a month.' }
          ] },
        { text: 'A resident’s browser would be sharing video pieces. A councillor worries someone will feed corrupt pieces to others. What is the sensible safeguard?',
          choices: [
            { label: 'Publish a hash of each piece from the council’s server and have every peer check what it receives.', score: 2, effects: { reliability: 25 }, feedback: 'Hashes let anyone verify data from strangers without trusting them. This is how BitTorrent-style systems stay honest.' },
            { label: 'Trust all peers: most people are honest.', score: 0, effects: { reliability: -30 }, feedback: 'One bad peer could spoil every viewer’s copy. Verification costs little and removes the risk.' },
            { label: 'Cancel the idea because peers cannot be trusted.', score: 1, effects: { cost: -15 }, feedback: 'The risk is real but solvable. Verifying pieces makes untrusted sources perfectly safe to use.' }
          ] }
      ],
      outro: 'The pattern to remember: **peers add capacity and resilience, but never trust them. Verify, and keep a dependable source if you need one.**' },

    { type: 'explain', prompt: 'Explain peer-to-peer to a friend, including one advantage, one drawback and the problem of discovery.',
      model: 'In peer-to-peer every computer is both client and server, and nobody is in charge. An advantage is that capacity grows with the number of users and there is no single point of failure. A drawback is that control and trust are hard, since any peer might be dishonest and nothing can easily be updated or removed. Discovery, finding who has what with no central directory, is solved with ideas like distributed hash tables.',
      keywords: ['both client and server', 'no central', 'capacity', 'trust', 'discovery', 'hash table'] }
  ],

  flashcards: [
    { q: 'What is peer-to-peer?', a: 'A style where every node is both client and server, with no central point in charge.' },
    { q: 'Name two strengths and two weaknesses of P2P.', a: 'Strengths: capacity grows with users; no single point of failure. Weaknesses: hard to control or update; peers cannot be trusted, and discovery is difficult.' },
    { q: 'What is a distributed hash table?', a: 'A key–value lookup table split across the peers, where each peer holds a slice and lookups hop towards the right peer in a few steps.' },
    { q: 'How does BitTorrent work, briefly?', a: 'A file is split into pieces. Peers in a swarm download pieces from many others while uploading the ones they have. Seeders hold the full file.' },
    { q: 'How do two browsers use WebRTC?', a: 'A signalling server introduces them by passing connection details, then they connect directly and send audio and video straight between them.' }
  ],

  glossary: [
    { term: 'Peer-to-peer', def: 'A style in which every node acts as both client and server and no central party is in charge.', aka: ['P2P'], like: 'A potluck dinner where everyone brings a dish and eats.' },
    { term: 'Peer node', def: 'One participant (computer or program) in a distributed or peer-to-peer network.', aka: ['peer'], like: 'One guest at the potluck.' },
    { term: 'Distributed hash table', def: 'A lookup table spread across many peers, each holding a slice of the keys, so lookups can find the right peer without a central index.', aka: ['DHT'], like: 'A phone book torn into pages and given out among everyone.' },
    { term: 'Swarm', def: 'In BitTorrent, the group of peers that are sharing the same file.', like: 'All the guests at one particular potluck.' },
    { term: 'Signalling', def: 'The step in which two peers exchange connection details, usually via a server, before connecting directly.', like: 'A mutual friend who passes on your phone number.' }
  ],

  takeaways: [
    'In P2P every node is **both client and server**, with **no central point**.',
    'Strengths: capacity grows with users and **no single point of failure**.',
    'Costs: **discovery**, **trust** and little central control; most real systems are **hybrids**.',
    'Examples: **BitTorrent**, blockchains and **WebRTC** calls.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('as-event-driven', {
  eli5: 'In an event-driven system, parts do not give each other orders: when something happens a part announces it, and any other part that cares reacts in its own way.',

  cards: [
    { kind: 'story', title: 'The checkout that knew too much',
      body: `A shop's checkout code, once an order is placed, does this: charge the card, then call the email service, then call the stock system, then call the loyalty-points system, then call analytics.

        It works. But look at what the checkout now knows: **four other systems**, their addresses and their quirks. If the email service is down, does the order fail? And when marketing wants a new "thank you" text message, someone has to edit the checkout code and ship it again.

        The checkout's real job was to take an order. Everything after is other people's business, but the checkout has been made responsible for all of it.

        There is a different way to arrange it, and it is the subject of this lesson.` },

    { kind: 'concept', title: 'Parts react to events instead of calling each other',
      body: `In an **event-driven architecture**, the checkout does its own job and then **announces what happened**: *"OrderPlaced, order 8841."*

        It does not say who should care. Other parts are **listening**. The email part sees the announcement and sends a receipt. The stock part reduces stock. The loyalty part adds points.

        The checkout does not know they exist. They do not know about each other.

        An **event** is a record that something **has happened**: a fact about the past. Components communicate by producing and reacting to events, usually through a channel in the middle (a broker, which you met in the messaging module).

        The result is **loose coupling by default**.` },

    { kind: 'metaphor', title: 'The fire alarm',
      body: `A fire alarm does not phone everyone in the building. It just **rings**.

        The people who care react in their own ways: staff walk to the exits, the doors unlock, the fire brigade is called, the lifts return to the ground floor.

        The alarm does not know who reacts, or how. And you can install a new reaction, such as a sprinkler system, without altering the alarm itself.

        An event-driven system works the same way: the thing that notices ("order placed") announces, and the reactions are separate. Where the metaphor stops: a fire alarm cannot tell you whether anyone actually reacted. In software, **that is exactly the hard part**, as we will see.` },

    { kind: 'compare', title: 'Events vs commands',
      body: 'People mix these up all the time, and the difference matters. Both are messages. They mean different things.',
      cols: ['Event', 'Command'],
      rows: [
        ['Says', 'Something **has happened**', 'Please **do** this'],
        ['Named like', '`OrderPlaced` (past tense)', '`SendReceipt` (an instruction)'],
        ['Sender cares who reacts?', 'No', 'Yes: someone must do it'],
        ['Receivers', 'Zero, one or many', 'Exactly one'],
        ['Can it be refused?', 'No: it is a fact', 'Yes: the receiver may say no']
      ],
      note: 'A handy test: if you would be unhappy when nobody responds, it is a command. If it is fine for nobody to care, it is an event.' },

    { kind: 'diagram', title: 'Producers, a broker, and consumers',
      body: 'The usual shape: the producer sends events to a broker in the middle, which delivers them to whoever has asked.',
      nodes: [
        { id: 'chk', label: 'Checkout', icon: '🛒', x: 1, y: 0, tone: 'accent' },
        { id: 'br', label: 'Event broker', icon: '📬', x: 1, y: 1, tone: 'info' },
        { id: 'em', label: 'Email', x: 0, y: 2 },
        { id: 'st', label: 'Stock', x: 1, y: 2 },
        { id: 'lo', label: 'Loyalty points', x: 2, y: 2 }
      ],
      edges: [
        { from: 'chk', to: 'br', label: 'OrderPlaced' },
        { from: 'br', to: 'em' },
        { from: 'br', to: 'st' },
        { from: 'br', to: 'lo' }
      ],
      caption: 'To add a text-message reaction, add one more listener. The checkout is not touched, and is not even redeployed.' },

    { kind: 'concept', title: 'Two shapes: broker and mediator',
      body: `Event-driven systems come in two broad topologies.

        **Broker topology**: there is *no central controller*. Events pass through a broker (the channel), and each component decides what to do and may emit more events. A chain of reactions unfolds.

        **Mediator topology**: a central **mediator** knows the steps of a process. It receives the first event, works out the steps ("charge, then reserve stock, then ship") and sends a command to each part in turn.

        Broker is more decoupled and flexible. The mediator is easier to follow and to handle errors in.

        Many systems use both: broker for loose reactions, mediator for important multi-step flows.` },

    { kind: 'sequence', title: 'Choreography: a chain of reactions',
      body: 'Nobody directs. Each service reacts to the event before it, and announces its own.',
      actors: ['Orders', 'Payments', 'Shipping'],
      steps: [
        { at: 0, label: 'announces OrderPlaced', note: 'Orders records the order and publishes the event. Its job is done.' },
        { from: 0, to: 1, label: 'OrderPlaced', note: 'Payments is listening for it (via the broker).' },
        { at: 1, label: 'charges the card', note: 'Payments does its own work, on its own schedule.' },
        { from: 1, to: 2, label: 'PaymentTaken', note: 'It announces a new fact. Shipping was listening for that one.' },
        { at: 2, label: 'books a courier', note: 'Shipping acts, and publishes `ParcelDispatched` for whoever cares.' },
        { note: 'No component holds the full recipe. The overall flow exists only as a pattern of who listens to what.' }
      ] },

    { kind: 'compare', title: 'Choreography vs orchestration',
      body: 'The same two ideas, named from dance. A **choreography** has no conductor. An **orchestration** has one.',
      cols: ['Choreography', 'Orchestration'],
      rows: [
        ['Who knows the whole flow', 'Nobody: it emerges', 'One orchestrator'],
        ['Coupling between parts', 'Very loose', 'Parts depend on the orchestrator'],
        ['Seeing the flow', 'Hard: scattered over many listeners', 'Easy: written in one place'],
        ['Changing the flow', 'Edit several listeners', 'Edit the orchestrator'],
        ['Handling failure', 'Each part reacts, which is hard to coordinate', 'The orchestrator can retry or undo steps']
      ],
      note: 'Experts disagree on which to prefer. A common rule of thumb: choreography for simple, loose reactions; orchestration when a business process has many steps and must be tracked.' },

    { kind: 'pitfall', title: 'Debugging a flow you cannot see',
      body: `The strength of events, that nobody knows about anybody, is also the weakness. Customers say they never got a receipt. Who failed? There is no stack trace that crosses components, no single place that says "here is the flow".

        Teams that succeed with this style invest in visibility:

        - a **correlation ID** on every event, so one order can be followed everywhere (you met this in the observability module)
        - **distributed tracing** to draw the path
        - a **catalogue of events**: who produces and who consumes each
        - **dead-letter queues** for events that could not be handled
        - clear **monitoring** of queue depth and lag

        Without these, an event-driven system becomes a haunted house.` },

    { kind: 'tip', title: 'When to reach for events',
      body: `Events suit things where **the sender does not need an answer now**: notifications, updates to other systems, analytics, slow work, and anything where many parts care about the same fact.

        They suit worse where the caller **needs the result immediately** ("is this card valid?"). A direct request and response is simpler there.

        Two costs to accept: the system becomes **eventually consistent** (the receipt may arrive a moment after the order), and **reasoning about it is harder**.

        Use events at the seams where independence is valuable. Keep the simple direct call where it is simpler.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'In an event-driven system, what does the checkout do once an order is placed?',
      options: ['It announces that the order was placed and does not know who reacts', 'It calls the email, stock and loyalty systems one by one', 'It waits until every other system confirms it is finished', 'It asks a central manager which systems to contact'],
      answer: 0,
      why: [null, 'That is the direct-call version, where the checkout must know each system.', 'Waiting for everyone would couple it to all of them again.', 'A central manager is the mediator style, a different shape.'],
      explain: 'The producer states a fact and moves on. Who listens, and what they do, is up to them.' },

    { type: 'bucket', after: 3, prompt: 'Is each message an event or a command?', buckets: ['Event', 'Command'],
      items: [['`OrderPlaced`', 0], ['`SendReceipt`', 1], ['`PaymentFailed`', 0], ['`CancelBooking`', 1], ['`UserRegistered`', 0], ['`ShipParcel`', 1], ['`StockRunLow`', 0]],
      explain: 'Events are past-tense facts that nobody has to act on. Commands are instructions to one receiver who is expected to do something, and who may refuse.' },

    { type: 'tf', after: 5, statement: 'In a mediator topology there is no central component that knows the steps of the process.', answer: false,
      explain: 'The mediator is the central component that knows the steps and sends commands to each part. It is the broker topology, with no central controller, where the flow emerges from reactions.' },

    { type: 'order', after: 6, prompt: 'Put this choreography in order.',
      items: ['Orders records the order and publishes OrderPlaced', 'Payments hears OrderPlaced and charges the card', 'Payments publishes PaymentTaken', 'Shipping hears PaymentTaken and books a courier', 'Shipping publishes ParcelDispatched'],
      explain: 'Each step reacts to the fact before it and announces the next. No part holds the full recipe, which is the strength and the weakness of choreography.' },

    { type: 'match', prompt: 'Match each term to what it means.',
      pairs: [['Event', 'A record that something has happened'], ['Command', 'A request that one receiver do something'], ['Broker topology', 'No central controller; reactions chain'], ['Mediator topology', 'A central component directs the steps'], ['Correlation ID', 'A label that lets you follow one flow across parts']] },

    { type: 'ab', q: 'Which message is better named as an event?',
      a: { lang: 'text', label: 'Name one', src: 'SendWelcomeEmail' },
      b: { lang: 'text', label: 'Name two', src: 'CustomerRegistered' },
      answer: 'b',
      explain: 'An event states a fact in the past tense and does not tell anyone what to do about it. "SendWelcomeEmail" is an instruction, so it is a command.' },

    { type: 'multi', q: 'Which of these are real benefits of an event-driven style?',
      options: ['The producer does not need to know who reacts', 'New reactions can be added without changing the producer', 'A slow listener does not have to slow down the producer', 'The whole flow is easy to see in one place', 'Every result is available immediately and consistently'],
      answers: [0, 1, 2],
      explain: 'Independence, easy extension and decoupled speed are the gains. The cost is that the flow is scattered and the system is only eventually consistent.' },

    { type: 'scenario', title: 'The missing receipts', intro: 'Your event-driven shop is live. A few customers complain that their order went through but no receipt email arrived. Nothing in the logs of the checkout looks wrong.',
      meters: { 'customer trust': 60, 'clarity': 30 },
      steps: [
        { text: 'Where do you start looking?',
          choices: [
            { label: 'Follow one affected order by its correlation ID across the event broker and the email service.', score: 2, effects: { 'customer trust': 5, clarity: 30 }, feedback: 'That is what correlation IDs are for. You can see whether the event was published, delivered, and what the email service did with it.' },
            { label: 'Rewrite the checkout to call the email service directly.', score: 0, effects: { 'customer trust': -10, clarity: -10 }, feedback: 'You would lose the decoupling, and you still would not know why the email failed. Find the cause before changing the design.' },
            { label: 'Ask customers to check their spam folders.', score: 1, effects: { 'customer trust': -5 }, feedback: 'Occasionally right, but it guesses instead of looking, and it blames the customer.' }
          ] },
        { text: 'You find the email service crashed on a malformed event and the broker kept retrying it forever, blocking others. What is the best fix for the future?',
          choices: [
            { label: 'Send events that repeatedly fail to a dead-letter queue, alert on it, and make the consumer tolerate bad input.', score: 2, effects: { 'customer trust': 15, clarity: 25 }, feedback: 'Poison messages are a classic problem. A dead-letter queue sets them aside so others flow, and an alert means a human looks at them.' },
            { label: 'Delete failed events silently.', score: 0, effects: { 'customer trust': -20, clarity: -20 }, feedback: 'Now customers silently lose receipts and you can never find out why.' },
            { label: 'Let the broker retry forever; it will work eventually.', score: 0, effects: { 'customer trust': -15 }, feedback: 'A malformed event will never succeed, and it holds up everything behind it.' }
          ] }
      ],
      outro: 'The pattern to remember: **loose coupling needs strong visibility. Correlation IDs, dead letters and monitoring are not optional.**' },

    { type: 'explain', prompt: 'Explain event-driven architecture using the checkout example, and name its main strength and its main difficulty.',
      model: 'Instead of the checkout calling email, stock and loyalty systems directly, it announces an OrderPlaced event and any interested component reacts in its own way. The strength is loose coupling: the producer does not know the listeners, and new reactions can be added without changing it. The difficulty is that the flow is scattered across many components, so it is hard to see and debug without correlation IDs, tracing and good monitoring.',
      keywords: ['event', 'announces', 'listeners', 'loose coupling', 'debug', 'correlation', 'tracing'] }
  ],

  flashcards: [
    { q: 'What is event-driven architecture?', a: 'A style where components communicate by announcing events (facts about what happened) and other components react, rather than calling each other directly.' },
    { q: 'Event vs command?', a: 'An event says something has happened (past tense, any number of listeners, cannot be refused). A command asks one receiver to do something and can be refused.' },
    { q: 'Broker vs mediator topology?', a: 'Broker: no central controller, components react to events and emit more. Mediator: a central component knows the steps and tells each part what to do.' },
    { q: 'Choreography vs orchestration?', a: 'Choreography has no conductor: the flow emerges from reactions. Orchestration has one component that directs the steps.' },
    { q: 'How do you debug a flow in an event-driven system?', a: 'Use a correlation ID on every event, distributed tracing, an event catalogue, dead-letter queues and monitoring of queue depth and lag.' }
  ],

  glossary: [
    { term: 'Event', def: 'A record that something has happened, named in the past tense, such as OrderPlaced.', like: 'A fire alarm ringing.' },
    { term: 'Command', def: 'A message asking one receiver to perform an action, which the receiver may refuse.', like: 'An order given to one named person.' },
    { term: 'Choreography', def: 'A way of coordinating parts where each reacts to events and no component directs the whole flow.', like: 'Dancers following each other with no conductor.' },
    { term: 'Orchestration', def: 'A way of coordinating parts where one orchestrator knows the steps and tells each part what to do.', like: 'A conductor leading an orchestra.' },
    { term: 'Eventual consistency', def: 'The property that different parts of a system may briefly disagree but will agree after the events have been processed.', like: 'Gossip: everyone learns the news, but not at the same moment.' }
  ],

  takeaways: [
    'Parts **announce events** and others react; the producer does not know who is listening.',
    '**Event** = something happened. **Command** = please do this.',
    '**Broker** topology has no controller; **mediator** topology has one. **Choreography** vs **orchestration** is the same split.',
    'The price is a flow you cannot see: invest in **correlation IDs, tracing and dead letters**.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('as-pubsub', {
  eli5: 'In publish–subscribe, a sender posts a message to a named topic without knowing who is listening, and everyone who has subscribed to that topic gets their own copy.',

  cards: [
    { kind: 'story', title: 'The channel does not know you',
      body: `A video creator uploads a new video. Within seconds, two million people get a notification.

        The creator did not write a list of two million email addresses. They did not run a loop that contacted each person. They pressed *Upload*, once.

        And the creator has no idea who you are. You decided you wanted to hear from them, by pressing *Subscribe*, and the platform took care of the rest.

        That is the idea behind **publish–subscribe** (pub/sub): the sender and the receivers are strangers, joined only by a **topic** that both sides agree on.` },

    { kind: 'concept', title: 'Publishers, topics and subscribers',
      body: `Three roles:

        - A **publisher** sends a message about a **topic** (for example \`orders.placed\`).
        - A **subscriber** registers interest in a topic.
        - A **broker** in the middle receives each message and delivers a **copy to every subscriber** of that topic.

        The key property: **publishers do not know their subscribers**, and subscribers do not know the publisher. The topic name is the only thing they share.

        This is the messaging machinery that event-driven systems often run on. Event-driven is the *style* (parts react to events). Pub/sub is a common *way of delivering* those events to many listeners.` },

    { kind: 'metaphor', title: 'The radio station',
      body: `A radio station broadcasts on 98.4. It does not know who is listening: a taxi driver, a baker with the radio on in the shop, a family in a kitchen.

        Listeners **tune in** to the frequency they want. Turn the dial and you hear a different station. New listeners can tune in without telling the station, and the station can broadcast to ten or ten million people with the same effort.

        - The **frequency** is the topic.
        - **Tuning in** is subscribing.
        - The **transmitter and the airwaves** are the broker.

        Where the metaphor stops: a radio listener who turns on late has missed what was said. Whether a software subscriber can catch up is a design decision, covered below.` },

    { kind: 'sequence', title: 'Subscribe first, then publish',
      body: 'Two subscribers and one publisher. Step through it.',
      actors: ['Publisher', 'Broker', 'Email', 'Analytics'],
      steps: [
        { from: 2, to: 1, label: 'subscribe orders.placed', note: 'The email component registers its interest in the topic.' },
        { from: 3, to: 1, label: 'subscribe orders.placed', note: 'So does analytics. Neither knows about the other.' },
        { from: 0, to: 1, label: 'publish orders.placed {id: 8841}', note: 'The publisher sends **one** message, and carries on with its work.' },
        { from: 1, to: 2, label: 'copy of the message', note: 'The broker delivers a copy to the email component.' },
        { from: 1, to: 3, label: 'copy of the message', note: 'And another copy to analytics. This is **fan-out**: one in, many out.' },
        { note: 'Add a third subscriber tomorrow and the publisher is not touched.' }
      ] },

    { kind: 'diagram', title: 'Fan-out, and a feature added later',
      body: 'One topic, many listeners. The dashed one was added next sprint without anyone opening the publisher’s code.',
      nodes: [
        { id: 'pub', label: 'Order service', icon: '🛒', x: 1, y: 0, tone: 'accent' },
        { id: 'top', label: 'Topic: orders.placed', icon: '📣', x: 1, y: 1, tone: 'info' },
        { id: 'em', label: 'Email', x: 0, y: 2 },
        { id: 'st', label: 'Stock', x: 1, y: 2 },
        { id: 'an', label: 'Analytics', x: 2, y: 2 },
        { id: 'fr', label: 'Fraud check (new)', x: 3, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'pub', to: 'top', label: 'publishes' },
        { from: 'top', to: 'em' }, { from: 'top', to: 'st' }, { from: 'top', to: 'an' },
        { from: 'top', to: 'fr', dashed: true }
      ],
      caption: 'This is the practical prize: the order service keeps doing one thing while the business adds features around it.' },

    { kind: 'compare', title: 'A queue is not a topic',
      body: 'You met queues in the messaging module. Both move messages, but they behave differently once there is more than one receiver.',
      cols: ['Queue', 'Topic (pub/sub)'],
      rows: [
        ['Each message goes to', 'One consumer, out of those competing for it', 'Every subscriber, each gets a copy'],
        ['Use it for', 'Sharing work between workers', 'Telling many parts about something'],
        ['Adding a consumer', 'Spreads the work wider', 'Adds one more listener'],
        ['Typical question', '"Who will do this job?"', '"Who needs to know about this?"']
      ],
      note: 'Many systems combine them: a topic fans an event out, and each subscriber has its own queue of work behind it.' },

    { kind: 'code', title: 'A pub/sub in a few lines',
      body: 'A tiny in-process version shows the mechanics. Real brokers do this across machines. **Tap the lines.**',
      code: { lang: 'js', src: `
        const subscribers = {};

        function subscribe(topic, handler) {
          (subscribers[topic] ||= []).push(handler);
        }

        function publish(topic, message) {
          for (const handler of subscribers[topic] || []) {
            handler(message);
          }
        }

        subscribe('orders.placed', m => sendReceipt(m.id));
        subscribe('orders.placed', m => updateStock(m.id));
        publish('orders.placed', { id: 8841 });`,
        notes: {
          1: 'The broker’s memory: for each topic, a list of handlers.',
          4: 'Subscribing just adds a handler to the topic’s list. The publisher is not involved.',
          9: 'Fan-out: every handler for the topic receives the message.',
          14: 'Two subscribers, and a publisher that knows neither. Add a third subscribe line and nothing else changes.'
        } } },

    { kind: 'concept', title: 'Delivery: at most once, at least once',
      body: `Between publisher and subscriber is a network, and networks lose and repeat things. Brokers therefore offer different **delivery guarantees**:

        - **At most once**: sent once, no retries. It can be lost, but never repeated.
        - **At least once**: retried until acknowledged. Nothing is lost, but it **can arrive twice**.
        - **Exactly once** is much harder to achieve for real. What teams usually do is accept at-least-once and make subscribers **idempotent**: handling the same message twice has the same effect as once.

        You met idempotency with HTTP methods. Same idea: give each message an ID and remember which ones were already processed. Otherwise, a repeated \`orders.placed\` could send two receipts or charge twice.` },

    { kind: 'concept', title: 'Ordering and late subscribers',
      body: `Two more things to settle in any design.

        **Ordering.** Do messages arrive in the order they were sent? Often only **within one stream**, such as all messages for the same customer. Across the whole topic, with many parallel consumers, order can shuffle. So never assume that "OrderCancelled" arrives after "OrderPlaced" unless your broker promises it for that stream.

        **Late subscribers.** A subscriber that joins after a message was published may miss it. Some brokers keep messages for a while, or for ever, so newcomers can **replay** history (the event-streaming systems from the messaging module). Others simply broadcast and forget.

        Decide which you need before choosing a broker.` },

    { kind: 'pitfall', title: 'Hidden coupling: the message is a contract',
      body: `Publishers do not know their subscribers, but that does not make them independent. The **shape of the message** is a contract.

        If the publisher renames \`customerId\` to \`customer_id\`, every subscriber that read the old field breaks, and the publisher has no list of who to warn. Several teams quietly depend on one innocent-looking event.

        Protect yourself:

        - **Add fields** rather than rename or remove them.
        - **Version** events when a change is unavoidable.
        - Keep a **list of subscribers** somewhere, even if the system does not need one.
        - Write the message format down like an API.

        Loose in the code, but still a promise to people.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'In publish–subscribe, what do the publisher and subscribers share?',
      options: ['Only the name of the topic', 'A direct connection to each other', 'The same database table', 'A list of every subscriber’s address'],
      answer: 0,
      why: [null, 'They never connect directly. The broker sits between.', 'A shared table would couple them tightly, which pub/sub avoids.', 'The publisher does not hold, or need, such a list.'],
      explain: 'The topic is the only meeting point. The publisher does not know who listens, and subscribers do not know who published.' },

    { type: 'tf', after: 5, statement: 'On a topic with three subscribers, each message is delivered to just one of them, like work shared out from a queue.', answer: false,
      explain: 'That describes a queue. On a topic every subscriber gets its own copy of every message (fan-out).' },

    { type: 'bucket', after: 5, prompt: 'Does this fit a queue or a topic better?', buckets: ['Queue', 'Topic'],
      items: [['Ten workers share 1,000 image-resize jobs', 0], ['Email, stock and analytics all need to know about an order', 1], ['Each job must be done exactly once, by someone', 0], ['A new fraud check should also hear every order', 1], ['Adding another consumer spreads the load', 0], ['Every subscriber gets a copy of every message', 1]],
      explain: 'A queue shares work out between competing consumers. A topic tells many parts the same thing.' },

    { type: 'spot', prompt: 'This publisher has stopped being independent of its listeners. Tap the line that couples them.',
      code: { lang: 'js', src: `
        function placeOrder(order) {
          save(order);
          publish('orders.placed', order);
          emailService.sendReceipt(order);
        }` },
      lines: [4],
      explain: 'Line 4 calls the email service directly, so the order code again knows one of its listeners and must change if that service does. The email component should simply subscribe to the topic.' },

    { type: 'ab', q: 'A subscriber may receive the same message twice. Which handler copes with that?',
      a: { lang: 'js', label: 'Remembers IDs', src: `
        function onOrder(m) {
          if (seen.has(m.id)) return;
          seen.add(m.id);
          chargeCustomer(m);
        }` },
      b: { lang: 'js', label: 'Always acts', src: `
        function onOrder(m) {
          chargeCustomer(m);
        }` },
      answer: 'a',
      explain: 'With at-least-once delivery duplicates happen. Recording the message ID makes the handler idempotent, so a repeat does nothing. The handler that always acts would charge the customer twice.' },

    { type: 'cloze', text: 'A publisher sends to a {{topic}}, a broker makes a copy for every {{subscriber}}, and this one-to-many delivery is called {{fan-out}}.',
      distractors: ['queue', 'cookie', 'mediator'],
      explain: 'The topic is the shared name, subscribers register interest and the broker fans each message out to all of them.' },

    { type: 'short', q: 'What word describes a handler that has the same effect whether a message arrives once or twice?', accept: ['idempotent'], hint: 'You met it with PUT and DELETE.',
      explain: 'An idempotent handler makes repeated deliveries harmless, which is the standard answer to at-least-once delivery.' },

    { type: 'scenario', title: 'The double receipts', intro: 'Your shop publishes `orders.placed` to a topic. After a network blip, some customers received two receipts and, worse, two loyalty bonuses. The broker uses at-least-once delivery.',
      meters: { 'customer trust': 50, 'complexity': 30 },
      steps: [
        { text: 'What is the right way to think about the cause?',
          choices: [
            { label: 'At-least-once delivery means duplicates are normal. The subscribers should be idempotent.', score: 2, effects: { 'customer trust': 10, complexity: 5 }, feedback: 'Exactly. Duplicates are a feature of that guarantee, not a bug in the broker. The fix belongs in the handlers.' },
            { label: 'The broker is faulty and must be replaced with one that never duplicates.', score: 0, effects: { 'customer trust': -10, complexity: 25 }, feedback: 'Brokers that avoid loss do so by retrying, which can duplicate. Chasing a perfect broker wastes effort.' },
            { label: 'Switch to at-most-once so that duplicates are impossible.', score: 1, effects: { 'customer trust': -15 }, feedback: 'Now messages can be lost, so some customers get no receipt and no bonus. Trading one problem for another.' }
          ] },
        { text: 'How do you make the loyalty handler safe against repeats?',
          choices: [
            { label: 'Record each order ID as processed, and skip IDs already seen.', score: 2, effects: { 'customer trust': 25, complexity: 10 }, feedback: 'Same message, same ID, same result: a repeat does nothing. Store the IDs where the handler’s data lives so the check and the update succeed or fail together.' },
            { label: 'Add a delay so that duplicates are less likely to overlap.', score: 0, effects: { 'customer trust': -10 }, feedback: 'Timing tricks do not change the fact that the same message can arrive twice.' },
            { label: 'Ask customers to ignore a second bonus.', score: 0, effects: { 'customer trust': -25 }, feedback: 'Pushing the problem to customers does not fix anything, and trust will fall.' }
          ] }
      ],
      outro: 'The pattern to remember: **assume a message can arrive twice, and make handling it twice harmless.**' },

    { type: 'explain', prompt: 'Explain publish–subscribe, the difference between a topic and a queue, and one thing to watch out for.',
      model: 'A publisher sends a message to a topic without knowing who listens, and a broker delivers a copy to every subscriber of that topic, which is fan-out. A queue is different: each message goes to just one of the competing consumers, to share out work. One thing to watch is delivery: with at-least-once delivery a subscriber may get duplicates, so handlers should be idempotent. Another is that the message format is a hidden contract.',
      keywords: ['publisher', 'topic', 'subscriber', 'copy', 'queue', 'one consumer', 'duplicates', 'idempotent'] }
  ],

  flashcards: [
    { q: 'What is publish–subscribe?', a: 'A messaging style where publishers send messages to topics without knowing the subscribers, and a broker delivers a copy to every subscriber of the topic.' },
    { q: 'Queue vs topic?', a: 'A queue gives each message to one of several competing consumers, to share work. A topic gives every subscriber its own copy.' },
    { q: 'What is fan-out?', a: 'One message going in and many copies going out, one to each subscriber.' },
    { q: 'What are the usual delivery guarantees?', a: 'At most once (may be lost), at least once (may duplicate) and exactly once (hard in practice, usually approximated with idempotent handlers).' },
    { q: 'Why is the message format a hidden contract?', a: 'Many unknown subscribers depend on its fields, so renaming or removing a field can break them. Prefer adding fields and version events.' }
  ],

  glossary: [
    { term: 'Publish–subscribe', def: 'A messaging style in which publishers send messages to named topics and every subscriber of a topic receives a copy, with neither side knowing the other.', aka: ['pub/sub'], like: 'A radio station and its listeners.' },
    { term: 'Topic', def: 'A named channel that messages are published to and subscribers listen on.', like: 'A radio frequency.' },
    { term: 'Fan-out', def: 'Delivering one message to many recipients.', like: 'A teacher handing a copy of the notice to every pupil.' },
    { term: 'At-least-once delivery', def: 'A guarantee that a message is retried until acknowledged, so it is never lost but may arrive more than once.', like: 'A courier who keeps knocking until someone signs.' },
    { term: 'Idempotent handler', def: 'A handler whose effect is the same whether a message is processed once or several times.', like: 'Pressing a lift button twice.' }
  ],

  takeaways: [
    'Publishers post to a **topic**; subscribers listen; neither knows the other.',
    'A **topic** copies each message to every subscriber (**fan-out**); a **queue** gives it to just one consumer.',
    'New features can **subscribe without touching** the publisher.',
    'Plan for **duplicates** (idempotent handlers), **ordering**, **late subscribers** and a stable **message contract**.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('as-distributed', {
  eli5: 'A distributed system is many computers working together over a network, and it is much harder than one computer because networks are slow, unreliable and can leave you unsure whether something happened.',

  cards: [
    { kind: 'story', title: 'The function call that went on holiday',
      body: `On your laptop, \`chargeCard(order)\` is a function call. It takes a few nanoseconds, it either works or throws an error, and it happens exactly once.

        Now imagine the payment code is moved to a different computer, and the same line becomes a network call. Suddenly:

        - it takes thousands of times longer
        - it may **time out** with no answer at all
        - if it times out, you do **not know** whether the card was charged

        The line of code looks identical, but it has become a different, much harder thing. That is the leap into **distributed systems**, and this lesson is a field guide to the new problems.` },

    { kind: 'concept', title: 'What makes a system distributed?',
      body: `A **distributed system** is a set of separate computers that cooperate by **sending messages over a network**, so that they appear to the user as one system.

        What defines it is not the number of machines but what they *lack*:

        - **No shared memory**: they can only communicate by messages.
        - **No shared clock**: each has its own idea of "now".
        - **Independent failure**: one can crash while the others carry on.

        By this definition even a web app with a separate database server is *mildly* distributed, and a system of fifty services is deeply so.

        Everything in the style lessons that crossed a network (client–server, peer-to-peer, event-driven) inherits these problems.` },

    { kind: 'metaphor', title: 'Organising a party by postcard',
      body: `Imagine planning a party with six friends in six cities, using only postcards.

        Postcards get lost, so you cannot assume anyone has your message. They take days, so "what time is it there now?" is a guess. A friend who has not replied may have lost the card, may be on holiday, or may have replied on a card that is still travelling. You cannot tell which.

        Meanwhile two friends have both booked the venue, because each acted on old news.

        That is a distributed system: not that anyone is incompetent, but that **communication is slow, lossy and uncertain**. Where the metaphor stops: postcards at least do not get faster or slower at random, and computers do.` },

    { kind: 'compare', title: 'The eight fallacies (1 to 4)',
      body: 'In the 1990s, engineers at Sun Microsystems (credited especially to Peter Deutsch) wrote down assumptions that beginners make about networks. Each one is **false**.',
      cols: ['The comforting lie', 'The truth, and what to do'],
      rows: [
        ['1', 'The network is reliable', 'Packets are lost and connections drop. Use timeouts, retries and idempotency.'],
        ['2', 'Latency is zero', 'Every call takes time, more when far away. Make fewer, bigger calls and cache.'],
        ['3', 'Bandwidth is infinite', 'Pipes have limits. Send less: paginate, compress, ask only for what you need.'],
        ['4', 'The network is secure', 'Anyone may listen or interfere. Encrypt traffic and authenticate every call.']
      ] },

    { kind: 'compare', title: 'The eight fallacies (5 to 8)',
      body: 'The other four are about how a network is run and changes over time.',
      cols: ['The comforting lie', 'The truth, and what to do'],
      rows: [
        ['5', 'Topology does not change', 'Machines come, go and move. Use names and service discovery, not fixed addresses.'],
        ['6', 'There is one administrator', 'Different teams and companies run different parts, with different rules. Expect surprises.'],
        ['7', 'Transport cost is zero', 'Sending data costs time, CPU and often money. Keep chatter low.'],
        ['8', 'The network is homogeneous', 'Hardware, software and versions differ. Use open standards and tolerate differences.']
      ],
      note: 'The list is usually remembered by its first line: "the network is reliable". If you remember one, make it that one.' },

    { kind: 'sequence', title: 'Partial failure: did it work?',
      body: 'Here is the most important lesson in the whole module. Step through it.',
      actors: ['Order service', 'Payment service', 'Bank'],
      steps: [
        { from: 0, to: 1, label: 'charge £30', note: 'The order service asks the payment service to take payment.' },
        { from: 1, to: 2, label: 'debit card', note: 'The payment service calls the bank, and the bank takes the money.' },
        { from: 2, to: 1, label: 'done', dashed: true, note: 'The bank confirms. The money has really moved.' },
        { from: 1, to: 0, label: 'success…', dashed: true, note: 'The payment service replies, but the reply is **lost** on the way back.' },
        { at: 0, label: 'timeout. Charged or not?', note: 'The order service sees silence. It cannot tell "never arrived" from "worked but reply lost" from "payment service crashed".' },
        { note: 'This is a **partial failure**: part of the system succeeded and part failed, and the caller cannot know which.' }
      ] },

    { kind: 'concept', title: 'Living with partial failure',
      body: `On one machine, a program mostly either works or crashes. In a distributed system, **some parts work while others fail**, and a slow part looks exactly like a dead one.

        You cannot remove that uncertainty. You design around it, with tools from the resilience module:

        - **Timeouts** on every call, so you never wait for ever.
        - **Idempotent operations** (and idempotency keys), so retrying is safe.
        - **Retries with back-off**, so a struggling part is not overwhelmed.
        - **Circuit breakers** to stop calling something that is clearly down.
        - **Checking afterwards**: ask "was payment 8841 taken?" instead of guessing.

        A good distributed design assumes *every* call can end in "I don't know".` },

    { kind: 'example', title: 'Time and ordering: whose clock is right?',
      body: `Each computer has its own clock, and they drift. Network time protocols keep them close, but never perfectly equal.

        Two servers log events for the same account:

        | Server | Its clock said | What really happened |
        |---|---|---|
        | A | 10:00:03 | second, a withdrawal |
        | B | 10:00:01 | first, a deposit |

        Sorted by timestamp, the withdrawal looks as if it came *before* the deposit, and the account looks overdrawn. Timestamps from **different machines cannot be trusted for ordering**.

        Real systems avoid depending on it: they use **sequence numbers**, route related events through **one place** that orders them, or use **logical clocks** (such as Lamport clocks), which count "happened before" rather than measuring seconds.` },

    { kind: 'pitfall', title: 'Do not distribute until you need to',
      body: `Everything in this lesson is a **cost**: slower calls, uncertain results, lost transactions, harder debugging, more to deploy and monitor.

        It is why Martin Fowler, in his book on enterprise application architecture, gave the advice (paraphrased): **do not distribute things if you can avoid it.** Calling a function in the same process is faster, simpler and more reliable than any network call.

        Teams that split a system into many services "for cleanliness" often find they have swapped easy problems for hard ones. The monolith lesson made the same point: organise first, distribute later.

        Distribution is a tool you pay for. Make sure you are buying something.` },

    { kind: 'tip', title: 'Good reasons to distribute',
      body: `Sometimes you do need many machines. The good reasons are:

        - **Scale**: the load is more than one machine can carry.
        - **Availability**: one machine is a single point of failure, and you need to survive its loss.
        - **Geography**: users on several continents need a nearby copy.
        - **Independence**: many teams need to build and release separately.
        - **Special hardware**: some work needs particular machines.

        Even then, distribute **as little as you can**: the minimum number of pieces, with the fewest calls between them, and with every one of the fallacies in mind.

        The next modules show the common ways of doing it (services, serverless, event streams) and the data techniques you met earlier for coping.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Which of these best defines a distributed system?',
      options: ['Separate computers cooperating by messages over a network', 'Any program that runs work on more than one thread', 'Any system with more than one programmer', 'A system that runs only in the cloud'],
      answer: 0,
      why: [null, 'Threads share memory inside one machine. That is a concurrency issue, not distribution.', 'Team size has nothing to do with how the software runs.', 'You can have a distributed system in a basement or in the cloud. Where it runs is irrelevant.'],
      explain: 'The defining facts are separate machines with no shared memory or clock, communicating only by messages, and able to fail independently.' },

    { type: 'match', after: 4, prompt: 'Match each fallacy to the realistic fact that replaces it.',
      pairs: [['The network is reliable', 'Messages get lost, so use timeouts and retries'], ['Latency is zero', 'Every call takes time, so make fewer, bigger calls'], ['Bandwidth is infinite', 'Pipes have limits, so send less data'], ['The network is secure', 'Anyone may listen, so encrypt and authenticate'], ['Topology does not change', 'Machines move and die, so use service discovery']] },

    { type: 'tf', after: 6, statement: 'If a call times out, you can safely conclude that the other side did not do the work.', answer: false,
      explain: 'A timeout only means you did not get an answer. The work may have been done with the reply lost on the way back. That is why retries need idempotency and why you check the outcome rather than guess.' },

    { type: 'bucket', prompt: 'Which fallacy does each situation ignore?', buckets: ['Network is reliable', 'Latency is zero', 'Network is secure', 'Topology does not change'],
      items: [['The code has no handling for a timeout', 0], ['A page makes 200 tiny calls to another continent one after another', 1], ['Calls between services are sent unencrypted “because it is our network”', 2], ['The payment server’s IP address is typed into the code', 3], ['A dropped connection is simply not retried', 0], ['A loop makes a network call for every one of 1,000 list items', 1]],
      explain: 'Missing timeouts and retries assume reliability. Many serial calls assume zero latency. Unencrypted internal traffic assumes security, and hard-coded addresses assume nothing moves.' },

    { type: 'multi', q: 'Which of these are among the eight fallacies of distributed computing?',
      options: ['The network is reliable', 'Latency is zero', 'Servers never need updates', 'Transport cost is zero', 'The database is always consistent', 'Bandwidth is infinite'],
      answers: [0, 1, 3, 5],
      explain: 'The eight are: the network is reliable, latency is zero, bandwidth is infinite, the network is secure, topology does not change, there is one administrator, transport cost is zero, and the network is homogeneous. The other two options are not on the list.' },

    { type: 'estimate', q: 'A function call inside one program takes roughly a few nanoseconds to a few tens of nanoseconds. A network round trip to another machine in the same data centre takes roughly half a millisecond. About how many times slower is the network call?', answer: 10000, unit: 'times slower', min: 10, max: 10000000, tolerance: 10,
      explain: 'Half a millisecond is 500,000 nanoseconds. Divided by a few tens of nanoseconds, the network call is in the order of ten thousand times slower, and across continents it is far worse. This is why "latency is zero" is a fallacy.' },

    { type: 'cloze', text: 'The first fallacy is that the network is {{reliable}}. When a call times out you face a {{partial failure}}: the work may or may not have happened. Retrying is safe only if the operation is {{idempotent}}.',
      distractors: ['secure', 'total failure', 'encrypted'],
      explain: 'Silence cannot tell you whether the work was done. Idempotent operations make retries harmless.' },

    { type: 'scenario', title: 'The payment that timed out', intro: 'A customer taps Pay. Your order service calls the payment service over the network, and after five seconds there is still no answer.',
      meters: { 'customer trust': 60, 'money safety': 60 },
      steps: [
        { text: 'The call has timed out. What should the order service do?',
          choices: [
            { label: 'Treat the result as unknown. Retry with the same idempotency key, or check the payment status.', score: 2, effects: { 'customer trust': 10, 'money safety': 30 }, feedback: 'You cannot know whether it worked, so you make the question safe to repeat. With the same key, a second attempt cannot charge twice.' },
            { label: 'Assume it failed and tell the customer to try again.', score: 0, effects: { 'customer trust': -25, 'money safety': -30 }, feedback: 'If the first charge did go through, the customer is charged twice when they try again.' },
            { label: 'Assume it worked and confirm the order.', score: 0, effects: { 'customer trust': -15, 'money safety': -30 }, feedback: 'If the charge did not go through, you have shipped goods that nobody paid for.' }
          ] },
        { text: 'The payment service is down for several minutes. Customers are hitting Pay again and again. What helps most?',
          choices: [
            { label: 'Use timeouts and a circuit breaker to stop piling on, and show a clear “we will confirm shortly” message.', score: 2, effects: { 'customer trust': 25, 'money safety': 10 }, feedback: 'You protect the struggling service from extra load and keep customers informed. Once it recovers, the pending payments are checked and finished.' },
            { label: 'Retry instantly in a tight loop until it answers.', score: 0, effects: { 'customer trust': -15, 'money safety': -10 }, feedback: 'A thousand callers retrying instantly can keep a recovering service flat on its back.' },
            { label: 'Show a blank page and hope.', score: 0, effects: { 'customer trust': -30 }, feedback: 'Nobody knows what happened, including the customer. Silence is the worst message.' }
          ] }
      ],
      outro: 'The pattern to remember: **every network call can end in “I don’t know”. Design so that the question is safe to ask again.**' },

    { type: 'explain', prompt: 'Explain why moving a function to another machine makes it so much harder, using partial failure and at least two of the eight fallacies.',
      model: 'A local function call is fast and either works or fails. Over a network, the network is not reliable and latency is not zero, so calls take far longer and can time out. A timeout leaves a partial failure: the work may have been done with the reply lost, so you cannot know. That is why we use timeouts, idempotent operations and retries, and why we avoid distributing a system until there is a real need.',
      keywords: ['network is reliable', 'latency', 'timeout', 'partial failure', 'idempotent', 'retry', 'avoid'] }
  ],

  flashcards: [
    { q: 'What is a distributed system?', a: 'Separate computers cooperating by sending messages over a network, with no shared memory or clock, and able to fail independently.' },
    { q: 'List the eight fallacies of distributed computing.', a: 'The network is reliable; latency is zero; bandwidth is infinite; the network is secure; topology does not change; there is one administrator; transport cost is zero; the network is homogeneous.' },
    { q: 'What is partial failure?', a: 'When part of a system succeeds and part fails, and the caller cannot tell which. A timeout does not say whether the work was done.' },
    { q: 'Why can you not order events by timestamps from different machines?', a: 'Clocks drift and differ. Use sequence numbers, a single ordering point or logical clocks such as Lamport clocks instead.' },
    { q: 'Why avoid distributing until you need to?', a: 'Network calls are slower, can fail with uncertain results, lose transactions and are harder to debug and run. Add distribution only for scale, availability, geography or team independence.' }
  ],

  glossary: [
    { term: 'Distributed system', def: 'A set of separate computers that cooperate by exchanging messages over a network so they appear to be one system.', like: 'Friends organising a party by postcard.' },
    { term: 'Partial failure', def: 'A situation where some parts of a system have worked and others have failed, with the caller unable to tell which.', like: 'A postcard that may or may not have arrived.' },
    { term: 'Latency', def: 'The time a message takes to travel and be answered.', like: 'The delay on a long-distance phone line.' },
    { term: 'Logical clock', def: 'A counter that orders events by what could have caused what, instead of measuring real time.', like: 'Page numbers rather than a watch.' },
    { term: 'Fallacies of distributed computing', def: 'Eight false assumptions about networks, such as “the network is reliable”, that cause design mistakes.', aka: ['the eight fallacies'], like: 'Eight comfortable myths.' }
  ],

  takeaways: [
    'A distributed system is **machines cooperating by messages**, with no shared memory or clock.',
    'The **eight fallacies** are comforting lies about networks; the first is "the network is reliable".',
    '**Partial failure**: after a timeout you do not know whether it worked, so make operations safe to repeat.',
    'Timestamps from different machines cannot order events. **Distribute only when you have to.**'
  ],

  links: [
    { label: 'Wikipedia: Fallacies of distributed computing', url: 'https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('arch-styles', {
  title: 'The Shape-Shifter',
  intro: 'The Shape-Shifter takes a new form every time you blink: monolith, layer cake, mesh, broadcast. Twelve questions across the whole module will show whether you can name its shapes, and know what each one costs.',
  questions: [
    { type: 'mcq', q: 'Which pairing correctly matches the term to its zoom level?',
      options: ['Layered is a style; Observer is a design pattern', 'MVC is a design pattern; Strategy is a style', 'Client–server is a design pattern; Observer is a style', 'Event-driven is a design pattern; MVC is a style'],
      answer: 0,
      explain: 'Styles shape whole systems (layered, client–server, event-driven). Architectural patterns such as MVC sit inside them, and design patterns such as Observer and Strategy arrange a few classes.' },

    { type: 'tf', statement: 'A modular monolith is deployed as one unit but has clear internal modules with public interfaces and their own data.', answer: true,
      explain: 'It keeps the simplicity of one deployment and puts walls inside, which also makes a later split easier if one is ever needed.' },

    { type: 'match', prompt: 'Match each part size to its description.',
      pairs: [['Class', 'One type in a program'], ['Component', 'A packaged part with a public interface, usually in one process'], ['Service', 'A separate running program reached over a network'], ['Tier', 'A group of machines with one role']] },

    { type: 'spot', prompt: 'In a layered system with closed layers, tap the line that breaks the rule.',
      code: { lang: 'js', src: `
        function showOrderPage(id) {
          const order = orderService.get(id);
          const rows = orderRepo.findItems(id);
          return render(order, rows);
        }` },
      lines: [3],
      explain: 'This presentation code calls the repository directly, skipping the business layer. Closed layers must be passed through, or rules can be bypassed and the screen starts to depend on storage details.' },

    { type: 'bucket', prompt: 'Which style does each statement fit better?', buckets: ['Client–server', 'Peer-to-peer'],
      items: [['Capacity grows as more users join', 1], ['The owner can remove or fix content immediately', 0], ['Every participant might be dishonest', 1], ['One failed machine can take everyone offline', 0], ['Finding who holds the data is the hard problem', 1], ['A thin client leaves most work to the other side', 0]],
      explain: 'Client–server concentrates control, load and risk. Peer-to-peer spreads them out, which gives scale and resilience but makes trust and discovery hard.' },

    { type: 'order', prompt: 'Put this choreography in order.',
      items: ['Orders publishes OrderPlaced', 'Payments hears it and charges the card', 'Payments publishes PaymentTaken', 'Shipping hears it and books a courier', 'Shipping publishes ParcelDispatched'],
      explain: 'Each component reacts to the previous fact and announces its own. No component knows the whole flow, which is why correlation IDs and tracing matter.' },

    { type: 'mcq', q: 'Ten workers must share 1,000 image-resize jobs, each job done once. What fits best?',
      options: ['A queue with competing consumers', 'A topic where every worker gets every job', 'A direct call to one worker at a time', 'A distributed hash table'],
      answer: 0,
      why: [null, 'Then every worker would resize every image, ten times over.', 'That wastes the other workers and gives up the broker’s buffering.', 'A DHT looks things up by key. It does not share out jobs.'],
      explain: 'A queue gives each message to one of its consumers, which spreads work. A topic copies each message to every subscriber, which is for telling many parts the same thing.' },

    { type: 'ab', q: 'Which message name is a proper event?',
      a: { lang: 'text', label: 'Name one', src: 'ReserveStock' },
      b: { lang: 'text', label: 'Name two', src: 'StockReserved' },
      answer: 'b',
      explain: 'An event states a fact in the past tense, so anyone may react or ignore it. "ReserveStock" is an instruction to one receiver, which makes it a command.' },

    { type: 'cloze', text: 'In a {{topic}}, every subscriber gets a copy of each message, called {{fan-out}}. With at-least-once delivery a message may arrive twice, so handlers should be {{idempotent}}.',
      distractors: ['queue', 'mediator', 'stateless'],
      explain: 'Topics fan out to every subscriber. Because duplicates are normal under at-least-once delivery, handlers must make a repeat harmless.' },

    { type: 'multi', q: 'Which of these are among the eight fallacies of distributed computing?',
      options: ['The network is reliable', 'Latency is zero', 'Messages are always delivered in order', 'There is one administrator', 'The network is homogeneous', 'Servers never run out of disk'],
      answers: [0, 1, 3, 4],
      explain: 'The eight are: reliable network, zero latency, infinite bandwidth, secure network, unchanging topology, one administrator, zero transport cost and a homogeneous network. Ordering and disk space are real concerns but not on the list.' },

    { type: 'short', q: 'What one word describes an operation that has the same effect whether it runs once or several times?', accept: ['idempotent'], hint: 'You met it with PUT, DELETE and message handlers.',
      explain: 'Idempotency is what makes retries safe after a timeout or a duplicate delivery.' },

    { type: 'mcq', q: 'A small team is building an internal tool for 300 users. Which starting point does the module recommend?',
      options: ['A simple (maybe modular) monolith, adding parts when it hurts', 'Thirty small services for independence', 'A peer-to-peer network to avoid servers', 'A fully event-driven design so that nothing is coupled'],
      answer: 0,
      why: [null, 'Thirty services bring network failures and operations work the team does not need.', 'P2P suits sharing among many; it adds discovery and trust problems here.', 'Events bring a flow you cannot see. They are worth it where independence has real value.'],
      explain: 'Start with the simplest shape that serves your needs, keep clear module boundaries, and distribute only for real reasons such as scale, availability or team independence.' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.sheet('arch-styles', {
  title: 'Architectural styles cheat sheet',
  sections: [
    { title: 'Style vs pattern, and the families', md: `| Level | Shapes | Examples |
        |---|---|---|
        | Style | the whole system | layered, client–server, event-driven |
        | Architectural pattern | a structural problem inside it | MVC |
        | Design pattern | a few classes | Strategy, Observer |

        **Families**: structural (monolith, layered, component-based), distributed (client–server, peer-to-peer), messaging (event-driven, publish–subscribe).

        Real systems **mix styles**. There is **no best style**: start from the qualities that matter, pick the simplest shape.` },

    { title: 'Monolith', md: `One deployable unit, usually one codebase and one database.

        - **Helps**: simple deploys, fast function calls, one transaction, easy to test and refactor
        - **Hurts**: every change ships everything, teams collide, cannot scale one hot part
        - **Big ball of mud**: no boundaries (the cause is missing walls, not the single unit)
        - **Modular monolith**: one deployment, clear modules with public interfaces and their own data

        Try cheap fixes first: modules, more copies, caches, background workers.` },

    { title: 'Layered (n-tier)', md: `| Layer | Job |
        |---|---|
        | Presentation | requests in, answers out |
        | Business | the rules |
        | Persistence | objects to and from the database |
        | Database | the data |

        - A layer uses **only the one below**. **Closed** layers must be passed through; **open** layers can be skipped.
        - **Layer** = code organisation. **Tier** = where it runs (three-tier: web, application, database).
        - **Sinkhole anti-pattern**: most requests pass through layers that do nothing.` },

    { title: 'Component-based and client–server', md: `**Component**: hides insides, offers a small interface, replaceable. Class < component < service (a separate program over a network). Reuse is earned (rule of three).

        **Client–server**: the client asks first; the server waits and answers. Roles, not machines.

        | | Thin client | Thick client |
        |---|---|---|
        | Logic | on the server | on the client |
        | Offline | rarely | often |

        Two-tier: client to database. Three-tier: client, application server, database. n-tier: more. **Never trust the client.**` },

    { title: 'Peer-to-peer', md: `Every node is **both client and server**. No central point.

        - **Pros**: capacity grows with users; no single point of failure
        - **Cons**: discovery, trust, little control, hard to update
        - **Discovery**: central index, flooding, or a **DHT** (key–value table split across peers; lookups in a few hops)
        - **BitTorrent**: file split into pieces, swarm, seeders, hash checks
        - **WebRTC**: a signalling server introduces browsers, then they connect directly
        - Most real systems are **hybrids**.` },

    { title: 'Event-driven and publish–subscribe', md: `| | Event | Command |
        |---|---|---|
        | Says | something happened | please do this |
        | Name | \`OrderPlaced\` | \`SendReceipt\` |
        | Receivers | 0 to many | exactly one |

        **Broker** topology: no controller. **Mediator**: central director. **Choreography**: no conductor. **Orchestration**: one conductor.

        **Pub/sub**: a topic copies each message to every subscriber (fan-out). A **queue** gives each message to one consumer.

        Plan for duplicates (idempotent handlers), ordering, late subscribers, message contracts, and visibility (correlation IDs, tracing, dead letters).` },

    { title: 'Distributed systems and the eight fallacies', md: `| # | Fallacy |
        |---|---|
        | 1 | The network is reliable |
        | 2 | Latency is zero |
        | 3 | Bandwidth is infinite |
        | 4 | The network is secure |
        | 5 | Topology does not change |
        | 6 | There is one administrator |
        | 7 | Transport cost is zero |
        | 8 | The network is homogeneous |

        **Partial failure**: after a timeout you do not know if it worked. Use timeouts, idempotency, retries, circuit breakers. Do not order events by cross-machine timestamps. **Distribute only when you must.**` }
  ]
});

