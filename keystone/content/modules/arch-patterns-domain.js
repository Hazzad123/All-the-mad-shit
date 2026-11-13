// Module: arch-patterns-domain — Architectural Patterns II: Data & Domain

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ddd-strategic', {
  eli5: 'Domain-driven design says: before you write code for a big, messy business, learn its language, find the parts that really matter, and draw clear borders so each part has its own meaning for words like “customer”.',

  cards: [
    { kind: 'story', title: 'Three meetings about one word',
      body: `An online shop is building a new system. In the sales meeting, a **customer** is someone with a basket and a discount code. In the shipping meeting, a **customer** is a name and a delivery address, and nothing else matters. In the billing meeting, a **customer** is a legal entity with a VAT number and a payment history.

        The developers, wanting to be tidy, create one big \`Customer\` class with all of it. Sales wants a field added. Billing wants one removed. Shipping's change breaks a report. Every team now waits on every other team.

        The problem is not the code. It is that **one word means three things**, and the software pretends it means one.` },

    { kind: 'concept', title: 'Tackling complexity at the heart of the business',
      body: `**Domain-driven design** (DDD) comes from Eric Evans's 2003 book of the same name. Its idea: in most business software, the hard part is not the technology. It is the **domain**, meaning the subject the software is about: insurance, shipping, banking.

        If the code does not capture how the business really thinks, every new feature is a translation job between "what the expert said" and "what the code does". Mistakes hide in the gaps.

        DDD has two halves. **Strategic** design (this lesson) is about the big picture: language, boundaries and priorities. **Tactical** design (next lesson) is about the building blocks inside one boundary.` },

    { kind: 'metaphor', title: 'A hospital with many dialects',
      body: `In a hospital, a doctor, a nurse and the billing clerk all use the word **"admission"**. For the doctor, it is a clinical decision. For the nurse, it is a bed to prepare. For billing, it is the moment charges start.

        Nobody tries to force one meaning. Each department has its own jargon, and they agree on how to hand over information at the borders.

        DDD does the same for software: let each area have its own precise language, and be explicit about what crosses between them. The metaphor stops at the human part: in software, someone has to write down the handover rules exactly, because computers do not nod politely.` },

    { kind: 'concept', title: 'Ubiquitous language: one vocabulary, everywhere',
      body: `The first practice is simple and surprisingly hard: **developers and domain experts use the same words**, in conversation, in documents *and in the code*.

        If the insurance underwriters say "bind a policy", the code has a \`bindPolicy()\` method, not \`setStatus(3)\`. If the experts say "a claim is *adjudicated*", the class is not called \`ClaimProcessor\`.

        The payoff is that a domain expert can read a function name, or a test name, and spot "that's not how it works". Bugs in understanding are caught early.

        It is called **ubiquitous** because it is used *everywhere*. And it is **per context**: the language of one area is not required to match another's.` },

    { kind: 'compare', title: 'Subdomains: not all parts are equally precious',
      body: 'A large business is split into **subdomains**: areas of the business. They deserve very different levels of effort.',
      cols: ['What it is', 'What to do', 'Online-shop example'],
      rows: [
        ['Core', 'What makes you different and wins customers', 'Build it in-house, with your best people', 'Product recommendations, pricing engine'],
        ['Supporting', 'Needed, but not special', 'Build simply, or outsource', 'Warehouse stock tracking'],
        ['Generic', 'Same for every business', 'Buy or reuse; do not reinvent', 'Sign-in, payments, email']
      ],
      note: 'Heuristic: if a competitor could buy the same thing off the shelf, it is not core.' },

    { kind: 'diagram', title: 'Bounded contexts: the border around a meaning',
      body: 'A **bounded context** is a boundary inside which one model and one language are consistent. “Customer” gets a separate, honest definition in each.',
      nodes: [
        { id: 'sales', label: 'Sales context', icon: '🛒', x: 0, y: 0, tone: 'accent' },
        { id: 'ship', label: 'Shipping context', icon: '📦', x: 1, y: 0, tone: 'accent' },
        { id: 'bill', label: 'Billing context', icon: '🧾', x: 2, y: 0, tone: 'accent' },
        { id: 'c1', label: 'Customer = shopper + basket', x: 0, y: 1, tone: 'muted' },
        { id: 'c2', label: 'Customer = recipient + address', x: 1, y: 1, tone: 'muted' },
        { id: 'c3', label: 'Customer = legal payer', x: 2, y: 1, tone: 'muted' }
      ],
      edges: [
        { from: 'sales', to: 'c1', dashed: true }, { from: 'ship', to: 'c2', dashed: true }, { from: 'bill', to: 'c3', dashed: true }
      ],
      caption: 'Three small, clear models beat one huge model that tries to please everyone.' },

    { kind: 'concept', title: 'Contexts and teams, not necessarily services',
      body: `A bounded context is first of all a boundary of **meaning**. It usually lines up with one team, one codebase and one database schema, and often with a good place to draw a **microservice** boundary. But it is not the same thing. A modular monolith can contain several bounded contexts, and one context can be built from several services.

        How do you find the borders? Listen for:

        - the same word with different meanings
        - experts from different departments who disagree
        - parts that change for different reasons

        A popular workshop is **Event Storming**: put the domain events ("order placed", "parcel dispatched") on sticky notes along a wall and see where the language shifts.` },

    { kind: 'diagram', title: 'A context map: how the contexts relate',
      body: 'Contexts must cooperate. A **context map** shows each relationship and who has the power in it.',
      nodes: [
        { id: 'sales', label: 'Sales', x: 0, y: 0, tone: 'accent' },
        { id: 'ship', label: 'Shipping', x: 2, y: 0, tone: 'accent' },
        { id: 'bill', label: 'Billing', x: 0, y: 2, tone: 'accent' },
        { id: 'acl', label: 'Anti-corruption layer', icon: '🛡️', x: 2, y: 1, tone: 'warn' },
        { id: 'erp', label: 'Legacy ERP', icon: '🏚️', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'sales', to: 'ship', label: 'customer–supplier' },
        { from: 'sales', to: 'bill', label: 'shared kernel', both: true },
        { from: 'erp', to: 'acl', label: 'messy model' },
        { from: 'acl', to: 'ship', label: 'translated' }
      ],
      caption: 'Customer–supplier: the upstream team serves the downstream team’s needs. Shared kernel: a small part of the model is jointly owned. Anti-corruption layer: a translator that stops a messy model leaking in.' },

    { kind: 'pitfall', title: 'The big shared model, and other traps',
      body: `The classic mistake is the **one model to rule them all**: a single enterprise-wide \`Customer\`, \`Product\` or \`Order\` that every team shares. It looks efficient and creates exactly the standstill from the story.

        Others to avoid:

        - Spending core-level effort on **generic** parts. Writing your own sign-in system is rarely the thing that wins you customers.
        - Treating DDD as a coding technique. Evans put the language and boundaries first.
        - Using DDD for **simple** software. A basic CRUD admin tool does not have a complex domain, and heavy modelling there is just ceremony.

        DDD pays off where the **business rules are rich and change often**.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'In the three-meeting story, what is the real cause of the trouble?',
      options: ['One word means different things in different areas, but the code forces a single meaning', 'The developers chose the wrong programming language', 'The database is too slow for three departments', 'The Customer class has too few fields'],
      answer: 0,
      why: [null, 'The language is irrelevant to the problem.', 'Performance never came into it.', 'More fields would make the shared class worse, not better.'],
      explain: 'Sales, shipping and billing mean different things by “customer”. One shared class couples them, so every change by one team can hurt the others.' },

    { type: 'bucket', after: 4, prompt: 'For an online bookshop, is each part core, supporting or generic?', buckets: ['Core', 'Supporting', 'Generic'],
      items: [['A recommendation engine that is the shop’s main selling point', 0], ['Stock counts for the warehouse', 1], ['User sign-in', 2], ['Card payments', 2], ['Special pricing and bundle rules unique to the shop', 0], ['Printing packing slips', 1]],
      explain: 'Put your best people on what differentiates you. Buy what everyone needs, and keep the supporting bits simple.' },

    { type: 'tf', after: 5, statement: 'A bounded context must always become its own microservice.', answer: false,
      explain: 'A bounded context is a boundary of meaning and language. It is often a good microservice boundary, but a modular monolith can hold several contexts, and one context can be built from several services.' },

    { type: 'match', prompt: 'Match each DDD term to its meaning.',
      pairs: [['Ubiquitous language', 'Experts and developers use the same words, in code too'], ['Bounded context', 'A boundary within which one model and language are consistent'], ['Core subdomain', 'The part that gives the business its edge'], ['Generic subdomain', 'A problem every business has, often best bought'], ['Context map', 'A picture of how contexts relate and cooperate']],
      explain: 'Language and boundaries are the strategic heart of DDD. Subdomains tell you where to spend your effort.' },

    { type: 'multi', q: 'Which of these are clues that you have found the border between two bounded contexts?',
      options: ['The same word means different things to different teams', 'Experts from two departments keep disagreeing about a definition', 'The parts change for different reasons and at different times', 'Both teams happily use the same names for the same things', 'The two parts are stored in the same table'],
      answers: [0, 1, 2],
      explain: 'Meaning that shifts, disagreeing experts and different reasons to change all point to a border. Agreement and a shared table suggest they belong together.' },

    { type: 'ab', q: 'A new feature: “bind a policy once the customer has paid”. Which code speaks the ubiquitous language of an insurer?',
      a: { lang: 'js', label: 'Domain words', src: `
        if (customer.hasPaid()) {
          policy.bind();
        }` },
      b: { lang: 'js', label: 'Technical words', src: `
        if (record.flag2 === 1) {
          item.setStatus(3);
        }` },
      answer: 'a',
      explain: 'An underwriter could read the first version and say whether it is right. The second needs a translation table, and mistakes hide in the gap.' },

    { type: 'scenario', title: 'Where do the borders go?', intro: 'You join a company that sells and delivers fresh food. Everyone shares one giant model with a Customer, Product and Order used by all teams. Releases are slow because every change touches everyone.',
      meters: { 'team autonomy': 25, 'model clarity': 30 },
      steps: [
        { text: 'You gather the teams. How do you start finding the right borders?',
          choices: [
            { label: 'Run a workshop on domain events and listen for where the same word changes meaning', score: 2, effects: { 'model clarity': 30, 'team autonomy': 10 }, feedback: 'Language is the best border-detector. Where “order” means a basket to one team and a delivery run to another, there is likely a boundary.' },
            { label: 'Split the code by technical layers: one team for the database, one for the UI', score: 0, effects: { 'team autonomy': -15, 'model clarity': -5 }, feedback: 'Technical layers cut across the business, so every feature still needs every team.' },
            { label: 'Add more fields to the shared model to cover everyone’s needs', score: 0, effects: { 'model clarity': -25 }, feedback: 'The shared model grows even more tangled, and every team is still blocked by every other.' }
          ] },
        { text: 'You find that Warehouse and Checkout both use “Product”, with different meanings. How do they cooperate?',
          choices: [
            { label: 'Give each context its own Product model and agree a small, explicit way to pass data between them', score: 2, effects: { 'team autonomy': 30, 'model clarity': 15 }, feedback: 'Each side keeps a model that fits its purpose. The border is explicit and agreed, rather than hidden in shared code.' },
            { label: 'Keep one shared Product table both teams edit directly', score: 0, effects: { 'team autonomy': -20 }, feedback: 'You have rebuilt the same hidden coupling in the database.' },
            { label: 'Rename one of them so the word is not reused', score: 1, effects: { 'model clarity': 10 }, feedback: 'Clear words help, but you still need a defined way for the two to exchange data.' }
          ] },
        { text: 'The company also uses an old stock system nobody dares touch, with a confusing data model. How should the new Warehouse context deal with it?',
          choices: [
            { label: 'Place an anti-corruption layer between them that translates the old model into the new one', score: 2, effects: { 'model clarity': 25 }, feedback: 'The translator absorbs the mess in one place, so the old system’s oddities do not leak into the new model.' },
            { label: 'Let the new code use the old model directly', score: 0, effects: { 'model clarity': -25 }, feedback: 'The new context now speaks the old system’s confusing language, and inherits its limits.' }
          ] }
      ],
      outro: 'Strategic design is mostly listening for language, then drawing explicit borders and relationships.' },

    { type: 'explain', prompt: 'Explain to a new colleague what a bounded context is, using the word “customer” as your example.',
      model: 'A bounded context is a boundary inside which one model and one language are consistent. In sales, a customer is a shopper with a basket; in shipping, a recipient with an address; in billing, a legal payer with a VAT number. Rather than one giant Customer class, each context has its own small, clear model, with explicit rules for passing data between them.',
      keywords: ['boundary', 'model', 'language', 'meaning', 'sales', 'shipping', 'explicit'] }
  ],

  flashcards: [
    { q: 'What is domain-driven design?', a: 'An approach, from Eric Evans, that puts the business domain and its language at the centre of software design, especially where the business rules are complex.' },
    { q: 'What is ubiquitous language?', a: 'A shared vocabulary used by developers and domain experts everywhere, including in the code and tests.' },
    { q: 'Core vs supporting vs generic subdomain?', a: 'Core: your competitive edge, build it well. Supporting: needed but not special. Generic: common to all businesses, buy or reuse.' },
    { q: 'What is a bounded context?', a: 'A boundary within which one model and one language apply consistently. The same word can mean different things in different contexts.' },
    { q: 'What does an anti-corruption layer do?', a: 'It translates between your model and another system’s model, so a messy outside model does not leak into your own.' },
    { q: 'Is a bounded context the same as a microservice?', a: 'No. It is a boundary of meaning. It is often a good service boundary, but not necessarily one.' }
  ],

  glossary: [
    { term: 'Domain-driven design', def: 'A way of building software that focuses on the business domain, its language and its rules.', like: 'Learning the trade before building the shop.', aka: ['DDD'] },
    { term: 'Ubiquitous language', def: 'The shared vocabulary of developers and domain experts, used in conversation, documents and code.', like: 'Everyone in the hospital using “admission” the same way within one ward.' },
    { term: 'Subdomain', def: 'A distinct area of the business, classed as core, supporting or generic according to how much it matters to your advantage.', like: 'A department in a company.' },
    { term: 'Bounded context', def: 'An explicit boundary inside which a particular model and language are consistent and unambiguous.', like: 'A hospital ward with its own jargon.' },
    { term: 'Context map', def: 'A diagram of the bounded contexts and the relationships between them, such as customer–supplier or shared kernel.', like: 'A map of which departments depend on which.' },
    { term: 'Anti-corruption layer', def: 'A translating layer that protects one context from the model of another.', like: 'An interpreter at a border.', aka: ['ACL'] }
  ],

  takeaways: [
    'In complex businesses the hard part is the **domain**, not the technology.',
    '**Ubiquitous language**: experts and developers share words, in the code too.',
    '**Core / supporting / generic**: spend effort on what differentiates you; buy the rest.',
    'A **bounded context** is a border of meaning; a **context map** shows how borders relate.'
  ],

  links: [
    { label: 'Martin Fowler: Bounded Context', url: 'https://martinfowler.com/bliki/BoundedContext.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ddd-tactical', {
  eli5: 'Inside one bounded context, DDD gives you a small toolkit: things with an identity, simple values, clusters that guard their own rules, and a way to store and announce what happens.',

  cards: [
    { kind: 'concept', title: 'The bag of getters and setters',
      body: `Here is how a lot of business code looks. An \`Order\` class has fields and nothing else. Some other class, \`OrderService\`, reaches in and does everything: checks the order is not already shipped, adds a line, recalculates the total, changes the status.

        Any other part of the program can do the same, and each does the checks slightly differently. One day somebody adds a line to a shipped order, and nothing stops them.

        The strategic half of DDD drew the borders. The **tactical** half is a toolkit for what to build **inside** one border, so the rules of the business live **with** the data they protect.` },

    { kind: 'metaphor', title: 'A passport and a banknote',
      body: `Two kinds of things appear in every domain.

        **You** are like a passport holder. You change your hair colour, move house, change jobs, and you are still **the same person**. What makes you *you* is your **identity**, not your current attributes.

        A **£5 note** is different. If I swap yours for another £5 note, nothing is lost. You do not care which note it is. Two notes with the same value are interchangeable. What matters is the **value** it carries, and a note never changes: it is not "edited" into a £10 note.

        The metaphor stops at the physical: in software, "swapping" simply means creating a new value object. No one is ever holding the old one.` },

    { kind: 'compare', title: 'Entity vs value object',
      body: 'Deciding which is which is the first modelling move.',
      cols: ['Entity', 'Value object'],
      rows: [
        ['Defined by', 'A unique identity (an ID)', 'Its attributes alone'],
        ['Equal when', 'The IDs match, even if everything else differs', 'All attributes match'],
        ['Changes?', 'Yes, over its lifetime', 'No. Make a new one instead (immutable)'],
        ['Examples', 'Customer, Order, Account', 'Money, date range, address, email address'],
        ['Tip', 'Give it a stable ID early', 'Give it behaviour: `price.add(tax)`']
      ] },

    { kind: 'concept', title: 'Aggregates: clusters that guard their own rules',
      body: `Real rules span several objects. "An order may not exceed £5,000 in total" involves the order **and** all its lines. If any code can add a line directly, who enforces the limit?

        An **aggregate** is a cluster of entities and value objects treated as **one unit** for changes. One member is the **aggregate root**, the only door in.

        - Outside code may hold a reference **only to the root**.
        - Changes go through the root's methods, so the root can enforce the **invariants**: rules that must always be true.
        - The whole aggregate is saved and loaded together, in **one transaction**.

        Think of the root as the receptionist: you cannot walk into the office, you ask at the desk.` },

    { kind: 'diagram', title: 'One aggregate, one boundary',
      body: 'Inside the box, objects are changed together. Across the border, aggregates refer to each other **by ID only**.',
      nodes: [
        { id: 'root', label: 'Order (root)', icon: '🧾', x: 1, y: 0, tone: 'accent' },
        { id: 'l1', label: 'Order line', x: 0, y: 1 },
        { id: 'addr', label: 'Address (value)', x: 2, y: 1, tone: 'good' },
        { id: 'cust', label: 'Customer aggregate', icon: '🧑', x: 1, y: 3, tone: 'info' }
      ],
      edges: [
        { from: 'root', to: 'l1' }, { from: 'root', to: 'addr' },
        { from: 'root', to: 'cust', label: 'by ID only', dashed: true }
      ],
      groups: [{ label: 'Order aggregate', x: 0, y: 0, w: 3, h: 2 }],
      caption: 'Outside code talks to the Order, never directly to a line inside it.' },

    { kind: 'code', title: 'A root that protects its invariants',
      body: 'The rules live in the class, not in a service that has to remember to check. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class Order {
          constructor(id, customerId) {
            this.id = id;
            this.customerId = customerId;
            this.lines = [];
            this.status = 'draft';
          }

          addLine(productId, price, qty) {
            if (this.status !== 'draft') throw new Error('Already placed');
            if (qty < 1) throw new Error('Quantity must be 1 or more');
            this.lines.push({ productId, price, qty });
          }

          place() {
            if (this.lines.length === 0) throw new Error('Empty order');
            this.status = 'placed';
            return { type: 'OrderPlaced', orderId: this.id };
          }
        }`,
        notes: {
          1: 'The **aggregate root**. Everything else in the cluster is reached through it.',
          4: 'The customer is held **by ID**, not as a nested object. A different aggregate owns the customer.',
          10: 'An **invariant**: lines can only be added to a draft order. It is enforced here, in one place, for every caller.',
          18: 'The result of a business action is a **domain event**, a fact in the past tense.'
        } } },

    { kind: 'concept', title: 'Repositories and domain services',
      body: `Two more tools finish the toolkit.

        A **repository** looks like an in-memory collection of aggregates: \`orders.get(id)\`, \`orders.save(order)\`. Behind it hides the database. The domain code never sees SQL, and tests can swap in a fake repository. There is **one repository per aggregate root**, not one per table.

        A **domain service** is for a rule that belongs to the domain but does not naturally sit on any single entity. "Transfer money between two accounts" involves both accounts, so it does not fit inside either. A domain service is a **stateless** operation named in the ubiquitous language, such as \`TransferFunds\`.

        Keep services for the leftovers. If every rule ends up in a service, you have drifted back to the bag of getters and setters.` },

    { kind: 'concept', title: 'Domain events: things that happened',
      body: `A **domain event** records something meaningful that happened in the business: \`OrderPlaced\`, \`PaymentReceived\`, \`ParcelDispatched\`. The name is in the **past tense**, because it is a fact and cannot be undone. (A mistake is corrected by a *new* event.)

        Events carry the details others need: which order, when, how much.

        Why bother? They let one part of the system react to another **without being tied to it**. When \`OrderPlaced\` is announced, billing, stock and email can each respond, and the order code needs to know none of them. Events also cross the border between aggregates and bounded contexts, which you will see in the next lessons.` },

    { kind: 'pitfall', title: 'Keep aggregates small',
      body: `The classic beginner mistake is the **giant aggregate**: Customer contains all their Orders, which contain all their Lines, and so on. It feels natural because it mirrors the real world. In practice:

        - Loading it pulls in thousands of rows.
        - Two people editing different orders of one customer **collide**, because the whole aggregate is one transaction.
        - It is slow, and hard to change.

        The rules of thumb:

        - Make an aggregate as small as its **invariants** allow, often just a root and a few parts.
        - Refer to other aggregates **by ID**.
        - Change **one aggregate per transaction**. For anything bigger, let events carry the news and accept a short delay (eventual consistency).` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each concept to its definition.',
      pairs: [['Entity', 'Defined by a unique identity that persists as it changes'], ['Value object', 'Defined only by its values, immutable and interchangeable'], ['Aggregate root', 'The single entry point to a cluster of objects'], ['Invariant', 'A rule that must always be true for the aggregate'], ['Domain event', 'A past-tense fact that something happened']],
      explain: 'Identity separates entities from values. Aggregates and invariants then keep related objects consistent.' },

    { type: 'bucket', after: 2, prompt: 'Entity or value object?', buckets: ['Entity', 'Value object'],
      items: [['A customer account', 0], ['The amount £25.00 GBP', 1], ['A delivery address as a set of fields', 1], ['A specific order, number 4821', 0], ['A date range, 1–7 June', 1], ['A bank account with a history', 0]],
      explain: 'Ask whether you care *which one* it is (entity) or only *what it is* (value). Two identical £25 amounts are interchangeable; two orders with the same contents are still different orders.' },

    { type: 'spot', after: 5, prompt: 'This outside code breaks the aggregate’s protection. Tap the line.',
      code: { lang: 'js', src: `
        const order = await orders.get(orderId);
        if (promoApplies) {
          order.lines.push({ productId: 'GIFT', price: 0, qty: 1 });
        }
        await orders.save(order);` },
      lines: [3],
      explain: 'Pushing straight into the lines list skips the root’s rules, such as “only draft orders may be changed”. The caller should use `order.addLine(...)` so the invariants are always enforced.' },

    { type: 'tf', statement: 'Two Money objects of £10 GBP are equal, even if they were created at different times.', answer: true,
      explain: 'Value objects are equal when all attributes match. Which instance you hold does not matter, which is exactly what makes them easy to reason about.' },

    { type: 'mcq', q: 'An Order needs to refer to the Customer who placed it. What does good aggregate design suggest?',
      options: ['Store the customer’s ID in the Order and load the Customer separately when needed', 'Embed the full Customer object inside the Order', 'Make the Customer aggregate contain all of its Orders', 'Let the Order edit the Customer’s fields directly'],
      answer: 0,
      why: [null, 'Embedding makes the aggregates tangled and they must be loaded and locked together.', 'That produces a giant aggregate with locking and loading problems.', 'One aggregate should never change another’s insides.'],
      explain: 'Referencing by ID keeps each aggregate small, with its own consistency boundary and its own transaction.' },

    { type: 'multi', q: 'Which of these are problems with a very large aggregate?',
      options: ['Loading it reads a lot of data', 'People editing different parts collide on the same transaction', 'It is slow and hard to change', 'It cannot enforce any invariants', 'It forces the use of a relational database'],
      answers: [0, 1, 2],
      explain: 'Large aggregates are heavy and cause contention. They can enforce invariants perfectly well, which is why people build them. They just cost too much.' },

    { type: 'order', prompt: 'Put the life of one business action in order.',
      items: ['Load the aggregate through its repository', 'Call a method on the aggregate root', 'The root checks its invariants and changes state', 'The root produces a domain event such as OrderPlaced', 'Save the aggregate back through the repository'],
      explain: 'The rules run inside the root, between loading and saving. Events describe what happened once the rules have passed.' },

    { type: 'cloze', text: 'Outside code may hold a reference only to the aggregate {{root}}, and other aggregates are referred to by {{ID}}. Each transaction should change one {{aggregate}}.',
      distractors: ['table', 'event', 'service'],
      explain: 'These three rules keep aggregates small and consistent, and keep transactions short and unlikely to collide.' },

    { type: 'scenario', title: 'Design the booking aggregate', intro: 'You are modelling a hotel booking system. A booking has guests, a room, dates and extras like breakfast. The rule: a room cannot be booked twice for the same night.',
      meters: { consistency: 40, performance: 50 },
      steps: [
        { text: 'The “no double booking” rule spans many bookings of one room. Where should it be enforced?',
          choices: [
            { label: 'In a Room aggregate that owns its calendar of booked nights and accepts or rejects reservations', score: 2, effects: { consistency: 30, performance: 5 }, feedback: 'The rule is about one room’s nights, so the room is the natural consistency boundary. One transaction protects it.' },
            { label: 'In a single Hotel aggregate that holds every room, guest and booking', score: 0, effects: { consistency: 10, performance: -35 }, feedback: 'It enforces the rule, but now every booking in the hotel contends for one transaction, which will be slow and fragile.' },
            { label: 'In the web page, which hides booked dates', score: 0, effects: { consistency: -30 }, feedback: 'Two people can still book the same night at once, and any other route into the system bypasses the check.' }
          ] },
        { text: 'Room prices change over time but bookings must keep the price agreed at booking. How do you model the price?',
          choices: [
            { label: 'A value object (amount and currency) stored on the booking when it is made', score: 2, effects: { consistency: 15 }, feedback: 'Immutable values are ideal for “this is what was agreed”. Later price changes cannot rewrite history.' },
            { label: 'Look up the room’s current price whenever the booking is shown', score: 0, effects: { consistency: -25 }, feedback: 'Old bookings would silently change in value. The agreed amount is a fact that must be stored.' }
          ] }
      ],
      outro: 'Find the rule, then draw the smallest boundary that can enforce it in one transaction.' },

    { type: 'explain', prompt: 'A colleague says, “Let’s make Customer the root and put all their orders inside it. It’s how the real world works.” Explain the problem.',
      model: 'That creates a giant aggregate. Loading a customer would load every order, and two people changing different orders would collide because the whole aggregate is one transaction. It would be slow and hard to change. Make aggregates as small as their invariants need, and let Order refer to the customer by ID.',
      keywords: ['giant', 'aggregate', 'transaction', 'collide', 'small', 'by ID', 'invariants'] }
  ],

  flashcards: [
    { q: 'Entity vs value object?', a: 'An entity is defined by identity and changes over time. A value object is defined by its values, is immutable and interchangeable.' },
    { q: 'What is an aggregate and its root?', a: 'A cluster of objects changed as one unit, with a single root as the only entry point that enforces the rules.' },
    { q: 'What is an invariant?', a: 'A business rule that must always be true for an aggregate, such as “only a draft order can have lines added”.' },
    { q: 'What is a repository in DDD?', a: 'A collection-like interface for loading and saving aggregates, hiding the database. One per aggregate root.' },
    { q: 'When do you use a domain service?', a: 'For a stateless business operation that does not naturally belong to one entity, such as transferring money between accounts.' },
    { q: 'What is a domain event, and how is it named?', a: 'A record of something meaningful that happened, named in the past tense, like OrderPlaced.' }
  ],

  glossary: [
    { term: 'Entity', def: 'An object defined by a unique identity that stays the same while its attributes change.', like: 'A person with a passport number.' },
    { term: 'Value object', def: 'An immutable object defined only by its attributes, so two with equal values are interchangeable.', like: 'A £5 note.' },
    { term: 'Aggregate', def: 'A cluster of related objects that are changed together as one unit, with one root that guards its rules.', like: 'An office with a receptionist.' },
    { term: 'Aggregate root', def: 'The one entity through which all access to an aggregate must go.', like: 'The receptionist.' },
    { term: 'Repository', def: 'An object that stores and retrieves aggregates as if they were an in-memory collection.', like: 'A librarian who fetches whole books for you.' },
    { term: 'Domain event', def: 'An immutable record, named in the past tense, of something that happened in the business.', like: 'A line in the minutes: “Motion passed.”' }
  ],

  takeaways: [
    '**Entities** have identity. **Value objects** are immutable and compared by value.',
    'An **aggregate** is a small cluster behind one **root** that enforces its **invariants**.',
    '**Repositories** hide storage; **domain services** hold the leftover rules; **domain events** announce facts.',
    '**Keep aggregates small**, refer to others by ID, change one per transaction.'
  ],

  links: [
    { label: 'Martin Fowler: Aggregate', url: 'https://martinfowler.com/bliki/DDD_Aggregate.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-cqrs', {
  eli5: 'CQRS means using one model for changing things, which follows strict rules, and a different, simpler one for showing things, shaped exactly like the screens that read it.',

  cards: [
    { kind: 'concept', title: 'The order screen with eleven joins',
      body: `An online shop has an Order model built to enforce rules: stock must exist, the customer must be allowed to buy, the total must add up. It is carefully **normalised**: the data is split across a dozen tables.

        Now the manager wants a dashboard: "recent orders, with customer name, city, item count, total and delivery status". To display it, the database must join **eleven tables**, for thousands of people looking at the screen every minute.

        The model that is *good at making decisions* turns out to be *awkward for showing results*. Pushing both jobs through one model means each does its job a bit worse.

        **CQRS** asks: why are we using the same model for both?` },

    { kind: 'metaphor', title: 'The kitchen and the menu board',
      body: `A restaurant's **kitchen** is organised for making food: stations, recipes, strict hygiene rules, one thing at a time. Nobody pins the kitchen layout to the wall for customers.

        The **menu board** is organised for reading: dishes, prices, "sold out" markers, all on one flat sheet. It is updated *after* the kitchen decides something, and it may lag a moment behind.

        Both describe the same restaurant, but each is built for its own audience. CQRS gives software the same split: a **write side** that makes decisions and a **read side** that is shaped for display.

        The metaphor stops at one point: nobody argues about stale menus, but in software the lag has real consequences, which we cover below.` },

    { kind: 'concept', title: 'Commands change things, queries ask things',
      body: `The idea builds on a simple rule from Bertrand Meyer: a method should either **do** something or **answer** something, not both.

        **CQRS** (*Command Query Responsibility Segregation*) lifts that rule from methods to the whole model:

        - A **command** says "do this": \`PlaceOrder\`, \`CancelBooking\`. It can be rejected, changes state, and returns little more than success or failure.
        - A **query** asks "what is…?": \`GetRecentOrders\`. It changes nothing.

        Each gets its own model. The **write model** enforces the business rules (think aggregates from the last lesson). The **read model** holds data pre-shaped for particular screens. Greg Young is the name most associated with the term.` },

    { kind: 'sequence', title: 'A write, then a read',
      body: 'Watch the two sides and the small gap between them.',
      actors: ['App', 'Write side', 'Read store'],
      steps: [
        { from: 0, to: 1, label: 'command: PlaceOrder', note: 'The write side loads its model and checks every business rule.' },
        { at: 1, label: 'save, emit OrderPlaced', note: 'If the rules pass, the change is saved and an **event** announces what happened.' },
        { from: 1, to: 0, label: 'accepted', dashed: true, note: 'The caller learns the command was accepted. It gets no big data back.' },
        { from: 1, to: 2, label: 'OrderPlaced', note: 'A **projection** hears the event and updates the read store, usually a flat table or search index shaped for the screen. This takes a short moment.' },
        { from: 0, to: 2, label: 'query: recent orders', note: 'Reads go to the read store: one simple lookup, no joins.' },
        { from: 2, to: 0, label: 'ready-made rows', dashed: true, note: 'Fast. But if the query came *before* the projection ran, it would not show the new order yet.' }
      ] },

    { kind: 'diagram', title: 'Two models, one flow of events',
      body: 'The read side can be scaled, stored and shaped independently.',
      nodes: [
        { id: 'ui', label: 'Application', icon: '📱', x: 1, y: 0, tone: 'info' },
        { id: 'w', label: 'Write model', x: 0, y: 1, tone: 'accent' },
        { id: 'r', label: 'Read model', x: 2, y: 1, tone: 'good' },
        { id: 'wdb', label: 'Write database', icon: '🗄️', x: 0, y: 2, tone: 'muted' },
        { id: 'rdb', label: 'Read store', icon: '⚡', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'ui', to: 'w', label: 'commands' }, { from: 'ui', to: 'r', label: 'queries' },
        { from: 'w', to: 'wdb' }, { from: 'r', to: 'rdb' },
        { from: 'w', to: 'r', label: 'events', dashed: true }
      ] },

    { kind: 'code', title: 'A command handler and a projection',
      body: 'Two small pieces of code, one for each side. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        // WRITE side: decide, then announce
        function handlePlaceOrder(cmd) {
          const order = orderRepo.get(cmd.orderId);
          order.place();                 // rules are checked here
          orderRepo.save(order);
          bus.publish({ type: 'OrderPlaced', orderId: order.id,
                        total: order.total(), city: cmd.city });
        }

        // READ side: keep a flat table for the screen
        bus.on('OrderPlaced', (e) => {
          recentOrders.upsert({ id: e.orderId, total: e.total, city: e.city });
        });`,
        notes: {
          4: 'All the business rules stay in the write model. If they fail, no event is sent.',
          6: 'The event carries what readers will need, so the read side never has to ask the write side.',
          11: 'A **projection**: it listens to events and keeps a read model up to date.',
          12: 'The read table is shaped like the screen: one row, ready to display, no joins.'
        } } },

    { kind: 'concept', title: 'Eventual consistency: the price of the gap',
      body: `Because the read side is updated after the write, a read made a split second later can show **old** data. This is **eventual consistency**: the read side will catch up, but not instantly.

        It matters in a few places, for example a customer who places an order and is sent to "My orders", where the order is missing. Common fixes:

        - Show the result the command **already knows** ("Order #4821 placed") rather than re-querying.
        - Update the screen **optimistically** in the browser, then confirm.
        - Let the page wait until the read side reports it has reached that change.

        Often it is a non-issue, since the gap is milliseconds. But you must *decide* that, because it will not go away by itself.` },

    { kind: 'compare', title: 'Plain CRUD or CQRS?',
      body: 'CQRS is a trade, not an upgrade. It is overkill for most screens in most systems.',
      cols: ['Stay with one model', 'CQRS pays off'],
      rows: [
        ['Reads vs writes', 'Similar shapes and load', 'Very different shapes or load'],
        ['Rules', 'Simple: save and show', 'Rich rules on write, many views on read'],
        ['Scaling', 'One database is fine', 'Reads far outnumber writes'],
        ['Team', 'Small, shared code', 'Separate people can own each side'],
        ['Consistency', 'Must always see the latest', 'A short delay is acceptable']
      ],
      note: 'You can also use CQRS lightly: the same database, but separate classes for commands and queries. No events or second store needed.' },

    { kind: 'pitfall', title: 'CQRS is not event sourcing, and not for everything',
      body: `Two common confusions.

        **CQRS is not event sourcing.** CQRS splits reads from writes. Event sourcing, next lesson, is a way of *storing* data as a log of events. They pair well, but each works without the other.

        **CQRS everywhere is a mistake.** Applying it to the whole system, including the simple parts, multiplies code, introduces lag and adds moving parts for no benefit. Greg Young himself has warned against using it as a top-level architecture. Apply it to the **one part** of the system that truly needs it, where reads and writes pull in opposite directions.

        In the lab that follows, you will send commands and watch a lagging read model catch up.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What is the core idea of CQRS?',
      options: ['Use one model for changing data and a separate model for reading it', 'Store all data as a log of events', 'Put every query in a cache', 'Split the application into one service per table'],
      answer: 0,
      why: [null, 'That is event sourcing, a different idea.', 'Caching speeds reads but does not split the models.', 'Splitting by table is unrelated to separating commands and queries.'],
      explain: 'Commands (change) and queries (read) get their own models, each optimised for its job.' },

    { type: 'order', after: 3, prompt: 'Put one write followed by a read in order.',
      items: ['A command arrives at the write side', 'The write model checks its rules and saves the change', 'An event announces what happened', 'A projection updates the read store', 'A query reads the ready-made data from the read store'],
      explain: 'The rules run before anything is saved, and the read side learns of the change from the event, which is why it can briefly lag.' },

    { type: 'tf', after: 6, statement: 'With CQRS, a query made immediately after a command may sometimes return the old data.', answer: true,
      explain: 'The read side is updated after the write, so there is a short window of eventual consistency. Design the user experience with that window in mind.' },

    { type: 'bucket', prompt: 'Command or query?', buckets: ['Command', 'Query'],
      items: [['PlaceOrder', 0], ['GetRecentOrders', 1], ['CancelBooking', 0], ['SearchProducts', 1], ['ChangeDeliveryAddress', 0], ['ShowAccountBalance', 1]],
      explain: 'A command asks the system to *do* something and may be refused. A query only *asks* and must change nothing.' },

    { type: 'estimate', q: 'A shop sees about 100 product-page views for every order placed. If it takes 20 orders a second at peak, roughly how many page views per second is the read side serving?', answer: 2000, unit: 'views per second', tolerance: 2,
      explain: '20 × 100 = 2,000 reads a second against 20 writes. When the ratio is this lopsided, giving reads their own simple, scalable store is attractive.' },

    { type: 'ab', q: 'Which read side is better suited to a busy dashboard?',
      a: { lang: 'js', label: 'Flat read model', src: `
        // One row per order, ready to show
        const rows = recentOrders.top(20);` },
      b: { lang: 'js', label: 'Join on demand', src: `
        const rows = db.query(\`SELECT ... FROM orders
          JOIN customers ... JOIN lines ... JOIN addresses ...\`);` },
      answer: 'a',
      explain: 'A projection prepares the data once, as events arrive, so each read is a trivial lookup. Joining many tables on every page view repeats the same work thousands of times.' },

    { type: 'multi', q: 'Which of these are good fixes for the “my new order is missing” problem?',
      options: ['Show the confirmation the command already returned', 'Update the page optimistically in the browser', 'Wait until the read side reports it has caught up', 'Make queries write data to the read store', 'Remove the read store and never show orders'],
      answers: [0, 1, 2],
      explain: 'All three hide or close the short gap. Writing on query breaks the rule that queries change nothing, and removing the read side defeats the point.' },

    { type: 'scenario', title: 'Does this system need CQRS?', intro: 'You are reviewing three proposals from three teams on the same day. Each says, “We should use CQRS.”',
      meters: { 'fit': 40, 'extra complexity': 20 },
      steps: [
        { text: 'Team A has a staff admin tool with twelve simple forms that save and display the same records. What do you say?',
          choices: [
            { label: 'Keep it as plain CRUD. One model is enough here', score: 2, effects: { fit: 25, 'extra complexity': -5 }, feedback: 'Reads and writes have the same shape and tiny load. CQRS would add code, lag and moving parts for no benefit.' },
            { label: 'Use full CQRS with a separate read database, for the sake of consistency', score: 0, effects: { fit: -20, 'extra complexity': 35 }, feedback: 'You would pay for a second store, events and projections to display twelve forms.' }
          ] },
        { text: 'Team B runs a ticket-booking site: complex rules on purchase (seat holds, limits), but 500 browsers per booking and many different list views. Your advice?',
          choices: [
            { label: 'Apply CQRS here: rich rules on the write side, flat read models for the many views', score: 2, effects: { fit: 30, 'extra complexity': 15 }, feedback: 'Opposite pulls on reads and writes are exactly where CQRS earns its place. Plan for the short lag.' },
            { label: 'Scale the single database with a bigger server and stop there', score: 1, effects: { fit: 5, 'extra complexity': -5 }, feedback: 'It may work for a while, but rules and views will keep fighting inside one model.' }
          ] },
        { text: 'Team C wants to adopt it across the entire company platform “for consistency”. What do you recommend?',
          choices: [
            { label: 'Use it only in the specific areas where reads and writes diverge', score: 2, effects: { fit: 20, 'extra complexity': -10 }, feedback: 'Targeted use gets the benefit without taxing the simple parts of the system.' },
            { label: 'Approve it everywhere', score: 0, effects: { 'extra complexity': 30, fit: -15 }, feedback: 'A blanket rule multiplies moving parts and eventual-consistency puzzles in places that never needed them.' }
          ] }
      ],
      outro: 'CQRS is a scalpel, not a house style. Use it where reads and writes truly pull apart.' },

    { type: 'explain', prompt: 'Explain CQRS to a colleague using the kitchen and menu board, and say when you would not use it.',
      model: 'The kitchen is the write side: organised for making decisions with strict rules. The menu board is the read side: a flat, ready-to-read view updated after the kitchen decides, so it may lag a moment. CQRS gives each its own model. I would not use it for simple CRUD where reads and writes look alike, because it adds complexity and eventual consistency for no gain.',
      keywords: ['write', 'read', 'model', 'projection', 'eventual consistency', 'CRUD', 'overkill'] }
  ],

  flashcards: [
    { q: 'What does CQRS stand for, and what does it mean?', a: 'Command Query Responsibility Segregation: use separate models for changing data (commands) and for reading it (queries).' },
    { q: 'What is a projection?', a: 'Code that listens to events and keeps a read model up to date, usually in a shape matching a screen.' },
    { q: 'Why does CQRS cause eventual consistency?', a: 'The read model is updated after the write, so a read straight afterwards may briefly show old data.' },
    { q: 'Is CQRS the same as event sourcing?', a: 'No. CQRS splits reads from writes. Event sourcing stores data as events. They fit together but are independent.' },
    { q: 'When is CQRS overkill?', a: 'For simple CRUD where reads and writes have a similar shape and load. Use it only where they truly diverge.' }
  ],

  glossary: [
    { term: 'CQRS', def: 'An approach that uses separate models for commands, which change state, and queries, which read it.', like: 'A kitchen for cooking and a menu board for reading.', aka: ['Command Query Responsibility Segregation'] },
    { term: 'Command', def: 'A request to change something, such as PlaceOrder, which the system may accept or reject.', like: 'Giving an order to the waiter.' },
    { term: 'Query', def: 'A request for information that does not change anything.', like: 'Asking what is on the menu.' },
    { term: 'Read model', def: 'A data structure built specifically to answer queries quickly, often shaped like one screen.', like: 'The menu board.', aka: ['projection'] },
    { term: 'Projection', def: 'The process that turns events or changes into an up-to-date read model.', like: 'A scribe updating the menu board after each kitchen decision.' }
  ],

  takeaways: [
    '**Commands** change things and follow the rules. **Queries** read and change nothing.',
    'Give each side its own model: a **write model** for rules, **read models** shaped like the screens.',
    'Read models are fed by events through **projections** and are **eventually consistent**.',
    'It is a trade-off. For plain CRUD it is overkill; use it where reads and writes pull apart.'
  ],

  links: [
    { label: 'Martin Fowler: CQRS', url: 'https://martinfowler.com/bliki/CQRS.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-event-sourcing', {
  eli5: 'Event sourcing stores every change that ever happened, like a bank statement of deposits and withdrawals, and works out the current balance by adding them up whenever needed.',

  cards: [
    { kind: 'concept', title: 'The balance that forgot how it got there',
      body: `A normal database stores **current state**. Your account row says \`balance: 120\`. When you deposit £50, the row is overwritten: \`170\`. The 120 is gone.

        Now an auditor asks, "why is this balance £120, and what was it last Tuesday?" Or a bug corrupted some rows and you want to know what really happened. The database cannot tell you. It remembers the answer, but not the story.

        **Event sourcing** flips the storage. Instead of keeping the current state, you keep the **list of everything that happened**: \`Deposited 100\`, \`Withdrew 30\`, \`Deposited 50\`. The balance is not stored. It is *calculated* from the list.` },

    { kind: 'metaphor', title: 'The bank statement and the ledger',
      body: `Your bank does not keep a single number that it rubs out and rewrites. It keeps a **statement**: a list of transactions. The balance is the running total.

        Accountants have always worked this way. A **ledger** is written in ink and never erased. If a mistake is made, you do not scribble it out. You add a **correcting entry**, so the history stays honest.

        Event sourcing is the ledger, applied to your whole application: **append only, never edit, current state is the sum**.

        The metaphor stops at speed: a bank statement has a "balance carried forward" line so nobody adds up ten years of entries by hand. We will meet software's version, the snapshot, shortly.` },

    { kind: 'concept', title: 'Events are facts, written in the past tense',
      body: `An **event** records something that **has happened**: \`AccountOpened\`, \`MoneyDeposited\`, \`MoneyWithdrawn\`. Rules for events:

        - **Past tense**: it is a fact, not a request.
        - **Immutable**: you never edit or delete one. To fix a mistake, append a new event such as \`DepositCorrected\`.
        - **Append only**: the store only ever adds to the end of the list.
        - **Ordered**, for each thing (usually each aggregate), so replay gives a repeatable result.

        Do not confuse these with *commands*. A command, \`Withdraw 30\`, is a request that can be refused. If it is accepted, it produces an event, \`MoneyWithdrawn\`.` },

    { kind: 'code', title: 'Rebuilding state by replaying events',
      body: 'The current balance is a **fold** over the history. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        const events = [
          { type: 'AccountOpened' },
          { type: 'Deposited', amount: 100 },
          { type: 'Withdrew',  amount: 30 },
          { type: 'Deposited', amount: 50 },
        ];

        function balanceOf(events) {
          return events.reduce((bal, e) => {
            if (e.type === 'Deposited') return bal + e.amount;
            if (e.type === 'Withdrew')  return bal - e.amount;
            return bal;
          }, 0);
        }
        // balanceOf(events) is 120`,
        notes: {
          2: 'The log. Notice there is no balance stored anywhere.',
          9: 'Start from zero and apply each event in order. This is called **replaying** the events.',
          12: 'Events that do not change the balance, such as AccountOpened, are simply passed through.',
          15: '100 − 30 + 50 = 120. Run the same events tomorrow and you get exactly the same answer.'
        } } },

    { kind: 'sequence', title: 'Handling a command the event-sourced way',
      body: 'The current state is rebuilt from the history, checked, then a new event is appended.',
      actors: ['App', 'Account', 'Event store'],
      steps: [
        { from: 0, to: 1, label: 'command: Withdraw £30', note: 'A request arrives, which might be refused.' },
        { from: 1, to: 2, label: 'load events for account 7', note: 'The account asks the store for its history.' },
        { from: 2, to: 1, label: '4 events', dashed: true, note: 'The events come back in order.' },
        { at: 1, label: 'replay → balance is £120', note: 'The account rebuilds its state and checks the rule: £30 is less than £120, so the withdrawal is allowed.' },
        { from: 1, to: 2, label: 'append MoneyWithdrawn £30', note: 'It adds a new event, saying it expects the log to still have 4 events. If someone else added one meanwhile, the append fails and the command is retried. This is **optimistic concurrency**.' },
        { from: 1, to: 0, label: 'done', dashed: true, note: 'Nothing was overwritten. The log just got one line longer.' }
      ] },

    { kind: 'concept', title: 'Snapshots: avoiding the long replay',
      body: `A busy account might have a million events. Replaying all of them for every command would be slow.

        A **snapshot** is a saved copy of the state at a certain point: "after event 10,000 the balance was £4,210". To load the account, fetch the **latest snapshot**, then replay only the events **after** it.

        Typically you take one every few hundred or thousand events, or at set intervals.

        A snapshot is only a **speed-up**. The events remain the source of truth. If a snapshot is wrong or lost, you can throw it away and rebuild it from the log. That is a useful safety net that ordinary state-storage does not give you.` },

    { kind: 'concept', title: 'What you gain: audit, time travel, new views',
      body: `Keeping the story pays off in several ways:

        - **Audit**: a complete, tamper-evident history of every change, with no extra logging effort. Valuable in finance, healthcare and anything regulated.
        - **Time travel**: replay up to any moment to see the state *as it was*. "What did this order look like at 3pm?"
        - **Debugging**: reproduce a bug by replaying the exact events that led to it, in a test.
        - **New read models**: next year you want a report nobody planned. Replay the whole history into a **new projection**. With state-only storage that data would be lost.

        In the lab that follows, you will send commands, watch events append, rebuild state and travel back in time.` },

    { kind: 'compare', title: 'State storage vs event sourcing',
      body: 'The two answer different questions.',
      cols: ['Store current state', 'Event sourcing'],
      rows: [
        ['What is saved', 'The latest values', 'Every change, in order'],
        ['History', 'Lost, unless you add audit tables', 'Built in'],
        ['Reading the current state', 'One simple lookup', 'Replay (or snapshot plus replay)'],
        ['Simple queries', 'Easy with SQL', 'Hard; usually needs read models'],
        ['Learning curve', 'Familiar to everyone', 'A different way of thinking']
      ] },

    { kind: 'pitfall', title: 'The costs: versioning and complexity',
      body: `Event sourcing is powerful and **expensive**. The biggest cost is **event versioning**. Events live forever, but your understanding changes. In year three you wish \`AddressChanged\` had carried a postcode. You cannot edit old events, so you must handle several versions of the same event for ever, usually by translating old ones when they are loaded (**upcasting**).

        Other costs:

        - Simple questions ("all customers in Leeds") need read models, so you also take on CQRS and eventual consistency.
        - **Deleting** personal data on request is awkward in an append-only log. Teams use tricks, such as keeping personal data encrypted with a key they can discard.
        - The team has to learn a new style, and tooling is thinner than for plain SQL.

        Most systems do not need it. Use it for the parts where history *is* the business.` },

    { kind: 'tip', title: 'Where it fits',
      body: `**Good fits:** money and ledgers, orders with a rich lifecycle, anything with strict audit needs, systems where "what happened and when" is a first-class question.

        **Poor fits:** simple CRUD, data that is rarely updated, and data with strict deletion needs.

        Event sourcing and **CQRS** often arrive together because replayed events feed read models neatly, but you can have either without the other. And you do not have to event-source everything: apply it to one aggregate or one bounded context that benefits, and keep the rest ordinary.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What does an event-sourced system store as its source of truth?',
      options: ['The ordered list of events that happened', 'Only the latest value of each field', 'A copy of the screen the user last saw', 'A log of error messages'],
      answer: 0,
      why: [null, 'That is ordinary state storage.', 'Screens are derived and not stored as truth.', 'Error logs describe faults, not business facts.'],
      explain: 'The events are the truth. Current state is derived by replaying them.' },

    { type: 'estimate', after: 5, q: 'An account has 10,500 events. A snapshot is taken every 1,000 events, and the latest was taken after event 10,000. Roughly how many events must be replayed after loading that snapshot?', answer: 500, unit: 'events', tolerance: 1.5,
      explain: 'Only events 10,001 to 10,500 need replaying: 500. Without the snapshot, all 10,500 would be replayed each time.' },

    { type: 'tf', after: 2, statement: 'In event sourcing, if a past event turns out to be wrong, you edit that event in the log.', answer: false,
      explain: 'Events are immutable facts. You append a new event that corrects the earlier one, like a correcting entry in an accountant’s ledger, so the history stays honest.' },

    { type: 'order', prompt: 'Put the handling of a command in an event-sourced system in order.',
      items: ['A command arrives, such as Withdraw £30', 'The aggregate loads its past events from the store', 'It replays them to rebuild its current state', 'It checks the rules against that state', 'It appends a new event to the log'],
      explain: 'State is always rebuilt before the rules are checked, and the only write is an append at the end.' },

    { type: 'bucket', prompt: 'Is each of these an event or a command?', buckets: ['Event', 'Command'],
      items: [['MoneyDeposited', 0], ['Withdraw £30', 1], ['OrderShipped', 0], ['CancelOrder', 1], ['AddressChanged', 0], ['PlaceOrder', 1]],
      explain: 'Commands are requests in the imperative that may be refused. Events are past-tense facts that cannot be undone, only followed by new events.' },

    { type: 'multi', q: 'Which of these are genuine benefits of event sourcing?',
      options: ['A complete audit trail of every change', 'The ability to see state as it was at any past moment', 'New read models built later by replaying the history', 'Simple SQL queries over current data with no extra work', 'No need to ever think about event versions'],
      answers: [0, 1, 2],
      explain: 'The history is the superpower. Ad-hoc queries become harder, and versioning of long-lived events is a real ongoing cost.' },

    { type: 'spot', prompt: 'This code breaks a rule of event sourcing. Tap the line.',
      code: { lang: 'js', src: `
        function fixTypo(store, accountId) {
          const events = store.load(accountId);
          events[2].amount = 300;
          store.append(accountId, { type: 'Noted' });
        }` },
      lines: [3],
      explain: 'Line 3 edits a past event. Events are immutable facts. The correction should be a new event such as `DepositCorrected`, appended to the log.' },

    { type: 'scenario', title: 'Should the shop event-source?', intro: 'A mid-sized company is deciding where to use event sourcing. A consultant says “everything should be event-sourced”.',
      meters: { 'value': 30, 'complexity': 20 },
      steps: [
        { text: 'The payments ledger must show exactly how every balance came to be, for auditors. What do you advise?',
          choices: [
            { label: 'Event-source the ledger: the history is a legal and business requirement', score: 2, effects: { value: 35, complexity: 15 }, feedback: 'Here history *is* the product. The audit trail and replay come naturally with event sourcing.' },
            { label: 'Store only the current balance and trust the code', score: 0, effects: { value: -25 }, feedback: 'You cannot explain how balances came about, which is exactly what the auditors will ask for.' }
          ] },
        { text: 'The “staff phone directory” page lets HR edit names and extension numbers. Nobody cares about the past. What do you advise?',
          choices: [
            { label: 'Plain table. Event sourcing would be pure overhead here', score: 2, effects: { value: 10, complexity: -10 }, feedback: 'No need for history, replay or projections for a simple list. Keep it boring.' },
            { label: 'Event-source it for consistency with the ledger', score: 0, effects: { complexity: 30, value: -10 }, feedback: 'You would pay for versioning, replays and read models to store phone numbers.' }
          ] },
        { text: 'Two years in, the ledger’s `AddressChanged` event needs a new postcode field. What do you do?',
          choices: [
            { label: 'Introduce a new version of the event and upcast old ones when loading', score: 2, effects: { complexity: 10, value: 10 }, feedback: 'Old events stay untouched. A translation step presents every event in the current shape.' },
            { label: 'Rewrite all stored events in place', score: 0, effects: { value: -30, complexity: 20 }, feedback: 'This breaks the promise that history is immutable, and risks corrupting the audit trail.' }
          ] }
      ],
      outro: 'Use event sourcing where history matters, and accept that old events stay for ever.' },

    { type: 'explain', prompt: 'Explain event sourcing to a friend using a bank statement, and give one major cost.',
      model: 'A bank keeps a list of transactions, and the balance is the running total. Event sourcing stores every change as an immutable event and calculates the current state by replaying them, using snapshots to avoid long replays. You get audit and time travel for free. A major cost is versioning: old events must keep working as the system evolves, and simple queries need extra read models.',
      keywords: ['events', 'replay', 'immutable', 'snapshot', 'audit', 'versioning', 'complexity'] }
  ],

  flashcards: [
    { q: 'What is event sourcing?', a: 'Storing every change as an immutable event and deriving the current state by replaying them, instead of storing only the latest state.' },
    { q: 'What is a snapshot in event sourcing?', a: 'A saved copy of state at some point, so loading means taking the latest snapshot and replaying only newer events. It is a speed-up, not the source of truth.' },
    { q: 'How do you fix a mistake in an event-sourced system?', a: 'Append a new, correcting event. Past events are never edited or deleted.' },
    { q: 'Name three benefits of event sourcing.', a: 'A built-in audit trail, time travel to past states, and the ability to build new read models by replaying history.' },
    { q: 'What is the biggest long-term cost?', a: 'Event versioning: events live forever, so old shapes must still be understood (often via upcasting). Added complexity follows.' },
    { q: 'Is event sourcing the same as CQRS?', a: 'No. They are independent, though often combined, since replayed events feed read models neatly.' }
  ],

  glossary: [
    { term: 'Event sourcing', def: 'A way of storing data as an ordered, append-only list of events from which the current state is derived.', like: 'A bank statement rather than a single balance.' },
    { term: 'Event store', def: 'A database designed to append and read events in order, usually grouped by the thing they belong to.', like: 'The ledger book.' },
    { term: 'Replay', def: 'Applying stored events in order to rebuild state or build a new view.', like: 'Adding up the statement from the first line.' },
    { term: 'Snapshot', def: 'A saved copy of derived state at a point in the event history, used to avoid replaying everything.', like: 'The “balance carried forward” line.' },
    { term: 'Upcasting', def: 'Translating an old version of an event into the current shape when it is loaded.', like: 'Converting an old form into the new template.' }
  ],

  takeaways: [
    'Store **what happened**, not just the current state; state is the **replay** of events.',
    'Events are **immutable past-tense facts**. Fix mistakes with new events.',
    '**Snapshots** speed up loading; **audit, time travel and new read models** come free.',
    'Costs: **versioning**, complexity and harder queries. Use it only where history matters.'
  ],

  links: [
    { label: 'Martin Fowler: Event Sourcing', url: 'https://martinfowler.com/eaaDev/EventSourcing.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-queues-streams', {
  eli5: 'Instead of services phoning each other directly, they can all write to and read from a shared stream of messages, so the stream becomes the central nervous system of the whole company.',

  cards: [
    { kind: 'concept', title: 'From a helper to the backbone',
      body: `In the Messaging module you met queues and streams as a tool: put a job on a queue, let a worker pick it up later. A helpful gadget.

        Some companies go much further. They make the message stream the **backbone** of the whole system. Services no longer call each other. Each one **announces what happened** to a central stream ("order placed", "payment received", "parcel dispatched") and **listens** to the parts it cares about.

        This lesson asks what changes when messaging stops being a side-channel and becomes the architecture. What is in the messages? Where does the truth live? Who is in charge of a multi-step process?` },

    { kind: 'metaphor', title: 'The town noticeboard and the town archive',
      body: `A **queue** is a ticket counter at a post office. Each customer is served once and leaves. A parcel handed to one clerk is not handed to another.

        A **stream** is a **town noticeboard with a permanent archive**. Every announcement is pinned in order and kept. Anyone can walk up and read from where they left off, and a newcomer can start from the very first notice and catch up. Reading does not remove anything.

        Both carry messages, but they behave differently. Queues are about **sharing work**; streams are about **sharing facts**.` },

    { kind: 'compare', title: 'Queue or stream?',
      body: 'Systems built on messages often use both. Know which one you are holding.',
      cols: ['Queue', 'Stream (a log)'],
      rows: [
        ['After a message is read', 'It is removed', 'It stays, until it ages out'],
        ['Several consumers', 'They compete: each message goes to one', 'Each consumer group reads everything at its own pace'],
        ['New consumer arrives', 'Sees only future messages', 'Can replay from the start'],
        ['Best for', 'Distributing jobs to workers', 'Recording and sharing what happened'],
        ['Examples', 'RabbitMQ, Amazon SQS', 'Apache Kafka, Amazon Kinesis']
      ] },

    { kind: 'sequence', title: 'Event notification: a thin message',
      body: 'The first style of event. The message says that something happened, and little else.',
      actors: ['Orders', 'Stream', 'Shipping'],
      steps: [
        { from: 0, to: 1, label: 'OrderPlaced { id: 7 }', note: 'Orders announces a tiny **notification**: the type of event and an ID.' },
        { from: 1, to: 2, label: 'OrderPlaced { id: 7 }', note: 'Shipping is listening and receives it.' },
        { from: 2, to: 0, label: 'GET /orders/7', note: 'To do its work, Shipping must **call back** and ask Orders for the details.' },
        { from: 0, to: 2, label: 'full order details', dashed: true, note: 'Orders answers, as long as it is up. Messages stay small, and Orders remains the one source of truth, but the two services are still coupled at run time.' }
      ] },

    { kind: 'sequence', title: 'Event-carried state transfer: a fat message',
      body: 'The second style. The message carries the data that listeners need.',
      actors: ['Orders', 'Stream', 'Shipping'],
      steps: [
        { from: 0, to: 1, label: 'OrderPlaced { id, items, address }', note: 'This time the event includes **everything** a listener is likely to need.' },
        { from: 1, to: 2, label: 'same event', note: 'Shipping receives it.' },
        { at: 2, label: 'keeps its own copy', note: 'Shipping stores the parts it needs in **its own** database. It never has to ask Orders.' },
        { note: 'Shipping now works even if Orders is down. The price: data is duplicated, and copies may be slightly out of date. Consumers must also cope with events arriving more than once.' }
      ] },

    { kind: 'diagram', title: 'The log as the source of truth',
      body: 'In the most committed version, the stream is not just a courier. It is the **record**. Databases and search indexes become views built from it.',
      nodes: [
        { id: 'log', label: 'Event stream (the log)', icon: '📜', x: 1, y: 0, tone: 'accent' },
        { id: 'db', label: 'Orders database', icon: '🗄️', x: 0, y: 1, tone: 'good' },
        { id: 'search', label: 'Search index', icon: '🔎', x: 1, y: 2, tone: 'good' },
        { id: 'rep', label: 'Reports', icon: '📊', x: 2, y: 1, tone: 'good' }
      ],
      edges: [
        { from: 'log', to: 'db', label: 'builds', dashed: true },
        { from: 'log', to: 'search', dashed: true },
        { from: 'log', to: 'rep', dashed: true }
      ],
      caption: 'Lose the search index? Rebuild it by replaying the log. A new team wants a new view? Same trick.' },

    { kind: 'compare', title: 'Choreography vs orchestration, revisited',
      body: 'Who drives a multi-step process, such as “fulfil an order”? You met this in the Architectural Styles module. Streams make both real.',
      cols: ['Choreography', 'Orchestration'],
      rows: [
        ['How it works', 'Each service reacts to events and emits new ones', 'A central coordinator tells each service what to do'],
        ['Where the process lives', 'Spread across many services', 'In one place, readable as a whole'],
        ['Coupling', 'Very loose', 'Services depend on the coordinator'],
        ['Hard part', 'Nobody can see the whole flow, so it is hard to debug', 'The coordinator can become a bottleneck or a god object'],
        ['Good when', 'Simple, reactive flows with few steps', 'Long, branching processes with compensation']
      ],
      note: 'Many real systems mix the two: choreography for simple reactions, an orchestrator for the important multi-step flows.' },

    { kind: 'pitfall', title: 'The dual-write trap, and other gotchas',
      body: `The classic bug: a service updates its database **and** then publishes an event. If the service crashes between the two steps, the database changed but nobody was told. Swap the order and you announce something that never happened.

        The standard fix is the **transactional outbox**: write the event into a table in the *same* database transaction as the change, and a separate process publishes it from there.

        Other gotchas:

        - Messages can arrive **more than once**, so consumers must be **idempotent**.
        - Ordering is usually guaranteed only **within a partition**, not across the whole stream.
        - Nobody can see the whole flow, so you need **tracing** and clear event names.` },

    { kind: 'tip', title: 'When the backbone approach fits',
      body: `**It fits:** many teams that need to react to each other's changes, data that several systems need copies of, audit and replay needs, and traffic with bursts that a buffer can smooth.

        **It fits badly:** simple apps, flows where a user needs an immediate answer from another service (a request and reply is simpler), and teams without the monitoring to debug a flow with no single owner.

        A sensible path: start with a few queues for background jobs, and grow towards streams as you find more consumers who want the same facts.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each term to what it means.',
      pairs: [['Queue', 'Each message goes to one worker, then is removed'], ['Stream', 'Messages are kept so new readers can replay them'], ['Consumer group', 'Readers that share the work and one position in a stream'], ['Kafka', 'A well-known retained-log stream'], ['RabbitMQ', 'A well-known queue broker']],
      explain: 'Queues share out work and discard it when done. Streams keep the record so many readers can use it independently.' },

    { type: 'mcq', after: 4, q: 'What is the main advantage of event-carried state transfer over a thin event notification?',
      options: ['Consumers keep their own copy and do not need to call back the sender', 'Messages are always smaller', 'The data can never be out of date', 'Only one consumer can read each event'],
      answer: 0,
      why: [null, 'Fat messages are larger, not smaller.', 'Copies can be slightly stale, which is the trade-off.', 'Streams let many consumers read each event.'],
      explain: 'The event carries what the listener needs, so it keeps working even if the sender is down. The price is duplicated data that can lag.' },

    { type: 'bucket', prompt: 'Notification or event-carried state transfer?', buckets: ['Event notification (thin)', 'Event-carried state (fat)'],
      items: [['OrderPlaced { id: 7 } and the listener calls back for details', 0], ['OrderPlaced with items and address inside the message', 1], ['Listener stores its own copy of the data it needs', 1], ['Sender stays the single source of truth for details', 0], ['Listener still works when the sender is down', 1], ['Messages are tiny but cause follow-up requests', 0]],
      explain: 'Thin messages keep ownership clear but cause run-time coupling. Fat messages decouple the services and pay with copies of the data.' },

    { type: 'tf', statement: 'In a Kafka-style stream, a message is deleted as soon as one consumer has read it.', answer: false,
      explain: 'Streams retain messages for a set time or size, and each consumer group keeps its own position. That is what lets new consumers replay history.' },

    { type: 'order', prompt: 'Put the transactional outbox in order.',
      items: ['A service receives a request to place an order', 'In one transaction, it saves the order and an OrderPlaced row in an outbox table', 'The transaction commits, so both exist or neither does', 'A separate publisher reads the outbox and sends the event to the stream', 'Other services receive OrderPlaced'],
      explain: 'Putting the event in the same transaction as the change removes the window where one happens without the other.' },

    { type: 'spot', prompt: 'This code can lose events if the service crashes at the wrong moment. Tap the line where the risk begins.',
      code: { lang: 'js', src: `
        async function placeOrder(order) {
          await db.insert('orders', order);
          await stream.publish('OrderPlaced', order);
        }` },
      lines: [3],
      explain: 'If the process dies after the insert and before the publish, the order exists but nobody hears about it. Use an outbox so the event is saved in the same transaction as the order.' },

    { type: 'multi', q: 'Which of these are real consequences of building on a message stream?',
      options: ['Consumers must cope with duplicate messages', 'Ordering is usually guaranteed only within one partition', 'It is harder to see the whole flow of a business process', 'Every consumer must call the sender directly', 'The stream can never be replayed'],
      answers: [0, 1, 2],
      explain: 'At-least-once delivery, partition-level ordering and scattered flows are the everyday costs. Streams remove direct calls and enable replay.' },

    { type: 'scenario', title: 'Who runs the fulfilment process?', intro: 'Your shop’s order flow is: take payment, reserve stock, book a courier, send an email. Today each step is a service reacting to events, and nobody can explain why some orders stall.',
      meters: { visibility: 20, resilience: 55 },
      steps: [
        { text: 'The process now has branches: if stock is short, refund and notify, otherwise continue. What do you do?',
          choices: [
            { label: 'Introduce an orchestrator for this flow that tracks each order’s progress and issues the next step', score: 2, effects: { visibility: 40, resilience: 5 }, feedback: 'Long flows with branching and compensation are where orchestration shines: one place shows the state of each order.' },
            { label: 'Add more events and let services keep guessing what to do next', score: 0, effects: { visibility: -15, resilience: -5 }, feedback: 'The flow grows more tangled, and the stalling orders get harder to explain.' },
            { label: 'Have every service call the next one directly', score: 0, effects: { resilience: -30, visibility: 5 }, feedback: 'You lose the buffering and decoupling that streams gave you.' }
          ] },
        { text: 'The email service should react whenever an order ships. It needs only a name and an address. What kind of event do you publish?',
          choices: [
            { label: 'Keep simple reactions choreographed: publish OrderShipped and let email listen', score: 2, effects: { resilience: 15, visibility: 5 }, feedback: 'For a single, simple reaction, choreography is loose and cheap. Not everything needs a coordinator.' },
            { label: 'Route it through the orchestrator too, for consistency', score: 1, effects: { visibility: 5, resilience: -5 }, feedback: 'It works, but you made the coordinator a bottleneck for a flow that needed no coordination.' }
          ] },
        { text: 'A new analytics team wants the full history of orders since launch. How does the stream help?',
          choices: [
            { label: 'They start a new consumer group at the beginning of the retained log and replay it', score: 2, effects: { resilience: 10, visibility: 10 }, feedback: 'A retained log lets new consumers catch up without anyone changing the original services.' },
            { label: 'Ask each team to export its database', score: 0, effects: { visibility: -5 }, feedback: 'Manual exports are slow and inconsistent, and you have a log that could do the job.' }
          ] }
      ],
      outro: 'Choreograph the simple reactions, orchestrate the long and branching flows, and keep the log as your memory.' },

    { type: 'explain', prompt: 'Explain the difference between event notification and event-carried state transfer, and say when you would choose each.',
      model: 'A notification is a thin message, for example OrderPlaced with an ID, and listeners call back for details: it keeps one source of truth but couples services at run time. Event-carried state transfer puts the data in the event so listeners keep their own copy: it decouples services and survives outages, but duplicates data that can go stale. Choose the first for simple signals, the second when consumers must work independently.',
      keywords: ['notification', 'thin', 'call back', 'state transfer', 'copy', 'decouple', 'stale'] }
  ],

  flashcards: [
    { q: 'Queue vs stream in one line?', a: 'A queue shares out work and removes messages once handled. A stream keeps an ordered record that many consumers can read and replay.' },
    { q: 'What is event notification?', a: 'A thin event that only says something happened, usually with an ID. Listeners call back to the source for details.' },
    { q: 'What is event-carried state transfer?', a: 'An event that carries the data listeners need, so they keep their own copy and do not call back. It decouples services but duplicates data.' },
    { q: 'What does “the log as source of truth” mean?', a: 'The stream of events is the primary record. Databases and search indexes are views that can be rebuilt by replaying it.' },
    { q: 'Choreography vs orchestration?', a: 'Choreography: services react to each other’s events with no central controller. Orchestration: a coordinator tells each service what to do next.' },
    { q: 'What is the transactional outbox?', a: 'Saving the event in the same database transaction as the data change, with a separate process publishing it, to avoid lost or phantom events.' }
  ],

  glossary: [
    { term: 'Event stream', def: 'An ordered, retained sequence of events that many consumers can read independently and replay.', like: 'A noticeboard with a permanent archive.', aka: ['log'] },
    { term: 'Event notification', def: 'A small event that signals something happened, leaving receivers to ask for details if they need them.', like: 'A doorbell: it says someone is there, not who.' },
    { term: 'Event-carried state transfer', def: 'An event that includes the data receivers need, so they can keep their own copy and work independently.', like: 'A newsletter that includes the full article.' },
    { term: 'Choreography', def: 'A way of coordinating services where each reacts to events and emits its own, with no central controller.', like: 'Dancers who each know their own steps.' },
    { term: 'Orchestration', def: 'A way of coordinating services where a central coordinator directs each step of a process.', like: 'A conductor leading an orchestra.' },
    { term: 'Transactional outbox', def: 'A pattern that stores events in the same transaction as data changes and publishes them separately, so the two never disagree.', like: 'Putting the letter in the out-tray as you sign the cheque.' }
  ],

  takeaways: [
    '**Queues** share work and forget; **streams** keep facts and can be replayed.',
    '**Thin events** keep one truth but couple at run time; **fat events** decouple but copy data.',
    'The **log can be the source of truth**, with databases and indexes as rebuildable views.',
    '**Choreograph** simple reactions, **orchestrate** long branching flows, and use an **outbox** to avoid lost events.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-actors', {
  eli5: 'The actor model builds programs from many tiny workers that each keep their own private notes and only ever communicate by posting messages to each other’s mailboxes.',

  cards: [
    { kind: 'concept', title: 'Two threads and one bank balance',
      body: `You have met the problem before: two threads both read a balance of £100, both add £10, both write back £110. One deposit has vanished. The usual cure is a **lock**: only one thread may touch the data at a time.

        Locks work, but they are famously hard to use well. Forget one and you get silent corruption. Take two in the wrong order and you get a **deadlock**, where everyone waits for everyone. As programs grow, nobody can reason about who holds what.

        The **actor model** takes a different route: **do not share the data at all.** If nobody else can touch it, there is nothing to lock.` },

    { kind: 'metaphor', title: 'Offices connected by a letterbox',
      body: `Imagine a building where every person works in a **locked office**. Nobody may walk into anyone else's room or read their notes. The only way to communicate is by dropping a **note** through someone's letterbox.

        Each person takes one note from their pile at a time, reads it, and then does one of three things: updates their private notes, posts notes to other letterboxes, or hires a new person into a new office.

        No two people ever touch the same piece of paper at the same moment, so nobody needs a lock. The metaphor stops at one point: the post is **asynchronous**, so you cannot be sure *when* a note will be read, and in real systems notes can get lost.` },

    { kind: 'concept', title: 'An actor: private state plus a mailbox',
      body: `An **actor** is a small unit of computation with exactly three things:

        - **Private state**: data that **only it** can see or change. No other actor can reach in.
        - **A mailbox**: a queue of incoming messages.
        - **Behaviour**: what to do with each message.

        An actor handles **one message at a time**, in order. In response to a message it can do three things: change its own state, **send messages** to other actors it knows about, or **create** new actors.

        That is the whole model. There is **no shared memory** between actors, and so no locks. The idea dates back to the 1970s, and a program may contain millions of tiny actors, since they are far lighter than operating-system threads.` },

    { kind: 'sequence', title: 'Two deposits, no lock',
      body: 'The bank balance problem again. Two people send deposits to the same account actor at the same moment.',
      actors: ['Alice', 'Account actor', 'Bob'],
      steps: [
        { from: 0, to: 1, label: 'Deposit £10', note: 'Alice posts a message to the Account’s mailbox.' },
        { from: 2, to: 1, label: 'Deposit £10', note: 'Bob does the same, at the same instant. Both messages sit in the mailbox.' },
        { at: 1, label: 'handle msg 1: balance 100 → 110', note: 'The actor processes **one message at a time**. Only it can change its balance.' },
        { at: 1, label: 'handle msg 2: balance 110 → 120', note: 'Only then does it start the second message. Nothing is lost, and nobody needed a lock.' },
        { from: 1, to: 0, label: 'new balance: 110', dashed: true, note: 'Replies are just more messages, sent back to whoever asked.' }
      ] },

    { kind: 'diagram', title: 'A supervision tree',
      body: 'Actors are arranged in a tree. Every actor has a **supervisor** whose job is to react when it fails.',
      nodes: [
        { id: 'sup', label: 'Supervisor', icon: '🧑‍✈️', x: 1, y: 0, tone: 'warn' },
        { id: 'a', label: 'Chat room A', x: 0, y: 1, tone: 'accent' },
        { id: 'b', label: 'Chat room B', x: 2, y: 1, tone: 'accent' },
        { id: 'u1', label: 'User 1', x: 0, y: 2 },
        { id: 'u2', label: 'User 2', x: 1, y: 2 },
        { id: 'u3', label: 'User 3', x: 2, y: 2 }
      ],
      edges: [
        { from: 'sup', to: 'a', label: 'supervises' }, { from: 'sup', to: 'b' },
        { from: 'a', to: 'u1' }, { from: 'a', to: 'u2' }, { from: 'b', to: 'u3' }
      ],
      caption: 'If User 2 crashes, Chat room A decides what to do. Room B and User 3 never notice.' },

    { kind: 'concept', title: '“Let it crash”: supervision',
      body: `Most programmers learn to write defensive code that expects every possible error. The Erlang community, led by the telephone-switch engineers who created the language, took the opposite view: **let it crash**.

        An actor that hits something unexpected does not try to heroically recover. It simply **fails**. Its **supervisor**, a separate actor watching over it, then applies a policy:

        - **Restart** it with fresh, clean state (the most common choice)
        - **Stop** it for good
        - **Escalate** to its own supervisor, if the problem is bigger

        Because actors share nothing, one crash cannot corrupt another's data. Self-healing becomes the *design*, rather than something bolted on. It is the same spirit as the resilience ideas you have met: contain the failure, then recover.` },

    { kind: 'realworld', title: 'Erlang, Akka and Orleans',
      body: `- **Erlang** (and its platform OTP) is where the idea became famous. It was built at Ericsson for telephone switches that had to run for years without stopping. WhatsApp's servers were famously built on it. Its cousin language **Elixir** runs on the same platform.
        - **Akka** brings actors to the JVM (Scala and Java). It is used for high-throughput services and streaming systems.
        - **Orleans** is Microsoft's .NET framework with **virtual actors**, which it calls *grains*. You just address an actor by ID and the framework creates, finds, moves and restarts it for you.

        All three give you **location transparency**: you send a message to an address, and it does not matter whether the actor is in the same process or on another machine.` },

    { kind: 'compare', title: 'Actors vs threads and locks',
      body: 'Neither is “better”. They suit different shapes of problem.',
      cols: ['Threads and locks', 'Actors'],
      rows: [
        ['Data', 'Shared, protected by locks', 'Private to each actor'],
        ['Talking', 'Reading and writing shared memory', 'Sending messages'],
        ['Typical bug', 'Race conditions and deadlocks', 'Mailbox overload, lost or reordered messages'],
        ['Failure', 'A crash can leave shared data broken', 'A crash is contained; the supervisor restarts the actor'],
        ['Scale', 'Limited by threads on one machine', 'Millions of light actors, spread over many machines']
      ] },

    { kind: 'tip', title: 'When actors fit, and when they do not',
      body: `**A good fit:** many independent things, each with its own state and rules, that mostly talk to a few others: chat rooms and users, online game players, IoT devices, shopping baskets, bank accounts, trading sessions. High concurrency and graceful failure are the selling points.

        **A poor fit:** plain request-and-response CRUD apps, big shared-data number crunching that wants shared memory, and processes needing a strict global order across many actors.

        Watch for: an actor whose mailbox fills faster than it can work, messages that may be lost or arrive late (so design for it), and the difficulty of debugging flows that bounce between many actors.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'How does the actor model avoid race conditions on an actor’s data?',
      options: ['Only the actor can touch its state, and it handles one message at a time', 'Every message locks the whole system first', 'The data is copied to every actor', 'Actors take turns running on a single thread'],
      answer: 0,
      why: [null, 'Global locks are what the model avoids.', 'Copying would create inconsistency, not remove it.', 'Actors can run in parallel; they just never share state.'],
      explain: 'Private state plus one-at-a-time message handling means no two things ever change the same data simultaneously, so locks are unnecessary.' },

    { type: 'order', after: 3, prompt: 'Put the handling of two simultaneous deposits in order.',
      items: ['Alice and Bob each send a Deposit message to the account actor', 'Both messages wait in the actor’s mailbox', 'The actor processes the first message and updates its balance', 'The actor then processes the second message', 'Replies are sent back as messages'],
      explain: 'The mailbox serialises the work, so every update sees the previous result and nothing is lost.' },

    { type: 'tf', statement: 'In the actor model, two actors may read and write the same variable as long as they take turns.', answer: false,
      explain: 'Actors share no memory at all. If one needs another’s information, it sends a message asking for it.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Mailbox', 'The queue of messages waiting for an actor'], ['Supervisor', 'An actor that reacts when its child fails'], ['Let it crash', 'Fail fast and let a supervisor restart clean'], ['Erlang', 'Language built for fault-tolerant telephone systems'], ['Orleans', 'Microsoft framework with virtual actors called grains']],
      explain: 'These terms describe how actors communicate, fail and recover. Supervision turns crashes into a managed event.' },

    { type: 'bucket', prompt: 'Good fit for actors, or better served another way?', buckets: ['Good fit', 'Better elsewhere'],
      items: [['Millions of chat users, each with their own state', 0], ['A simple form-over-database admin app', 1], ['IoT devices each tracking their own readings', 0], ['A big matrix multiplication needing shared memory', 1], ['Thousands of online game players with their own sessions', 0], ['A one-off nightly report', 1]],
      explain: 'Actors shine for many independent, stateful things that need to run concurrently and recover independently.' },

    { type: 'multi', q: 'Which are typical things a supervisor might do when a child actor fails?',
      options: ['Restart the child with clean state', 'Stop the child permanently', 'Escalate the failure to its own supervisor', 'Reach into the child’s memory and repair it', 'Ignore the failure and keep sending it messages unchanged'],
      answers: [0, 1, 2],
      explain: 'Restart, stop and escalate are the standard strategies. Because state is private, a supervisor cannot reach in and patch it, and pretending nothing happened is not a strategy.' },

    { type: 'ab', q: 'Which approach follows the “let it crash” philosophy?',
      a: { lang: 'js', label: 'Fail and be restarted', src: `
        onMessage(msg) {
          const data = parse(msg);   // throws on bad input
          this.handle(data);
        }
        // a supervisor restarts this actor` },
      b: { lang: 'js', label: 'Defend everything', src: `
        onMessage(msg) {
          try { this.handle(parse(msg)); }
          catch (e) { /* guess and carry on with unknown state */ }
        }` },
      answer: 'a',
      explain: 'Swallowing an unexpected error leaves the actor in a possibly corrupt state with nobody the wiser. Failing loudly and restarting clean is simpler and safer.' },

    { type: 'scenario', title: 'Design an online game lobby', intro: 'You are building the back end for an online card game. Thousands of players join tables at once. Each table has strict rules, and bugs in one table must not affect others.',
      meters: { 'isolation': 30, 'simplicity': 40 },
      steps: [
        { text: 'How do you model the tables and players?',
          choices: [
            { label: 'One actor per table and one per player, each with private state, communicating by messages', score: 2, effects: { isolation: 35, simplicity: 15 }, feedback: 'Each table’s rules run in one place, one move at a time, with no locks. A bug in one table cannot corrupt another.' },
            { label: 'One big shared game-state object that all threads lock while they update', score: 0, effects: { isolation: -20, simplicity: -25 }, feedback: 'Every action contends for the same lock, and one bug can corrupt every table at once.' },
            { label: 'A global database row per table, updated by any server whenever it likes', score: 1, effects: { isolation: -5, simplicity: -10 }, feedback: 'Simultaneous updates can overwrite each other, and you must invent your own locking.' }
          ] },
        { text: 'A table actor crashes after receiving a rare, malformed message. What should happen?',
          choices: [
            { label: 'Its supervisor restarts it from a known clean state, perhaps reloading from storage', score: 2, effects: { isolation: 25, simplicity: 10 }, feedback: 'The failure is contained to one table, and the system heals itself without an engineer waking up.' },
            { label: 'Shut down the whole game server and restart everything', score: 0, effects: { isolation: -30 }, feedback: 'You have turned one table’s problem into an outage for thousands of players.' },
            { label: 'Catch every possible error inside the actor and carry on', score: 1, effects: { simplicity: -15 }, feedback: 'You cannot foresee every error, and a half-broken actor is worse than a restarted one.' }
          ] }
      ],
      outro: 'Actors give you isolation by construction: private state, messages and supervision.' },

    { type: 'explain', prompt: 'Explain the actor model to someone who has only used threads and locks. Cover why actors avoid locks and what “let it crash” means.',
      model: 'Each actor owns private state that nobody else can touch and has a mailbox of messages that it handles one at a time, so there is no shared memory and no need for locks. Actors communicate only by sending messages. Let it crash means an actor that hits an unexpected problem simply fails, and a supervisor restarts it with clean state, so failures are contained and recovery is built in.',
      keywords: ['private state', 'mailbox', 'messages', 'no shared memory', 'supervisor', 'restart', 'crash'] }
  ],

  flashcards: [
    { q: 'What is an actor?', a: 'A small unit with private state, a mailbox and behaviour. It handles one message at a time and can send messages, change its state or create actors.' },
    { q: 'Why do actors need no locks?', a: 'They share no memory. Only the owning actor can touch its state, and it processes one message at a time.' },
    { q: 'What does “let it crash” mean?', a: 'Rather than defending against every error, let an actor fail and have a supervisor restart it with clean state.' },
    { q: 'What are the usual supervisor strategies?', a: 'Restart the child, stop it, or escalate the failure to the supervisor’s own supervisor.' },
    { q: 'Name three actor systems.', a: 'Erlang/OTP (and Elixir), Akka on the JVM, and Microsoft Orleans, which uses virtual actors called grains.' },
    { q: 'When do actors fit well?', a: 'With many independent stateful entities, such as chat users, game players, devices or accounts, where concurrency and fault isolation matter.' }
  ],

  glossary: [
    { term: 'Actor', def: 'A lightweight unit of computation that owns private state and communicates only by sending and receiving messages.', like: 'A person in a locked office with a letterbox.' },
    { term: 'Mailbox', def: 'The queue of messages waiting to be handled by an actor, processed one at a time.', like: 'The in-tray on the desk.' },
    { term: 'Supervision', def: 'A scheme where a parent actor watches its children and decides whether to restart, stop or escalate when one fails.', like: 'A manager who replaces a worker who falls ill.' },
    { term: 'Let it crash', def: 'The Erlang philosophy of letting a faulty process fail fast and be restarted, instead of trying to handle every error inside it.', like: 'Rebooting a frozen app instead of debugging it live.' },
    { term: 'Location transparency', def: 'Sending a message to an actor’s address in the same way whether it lives in this process or on another machine.', like: 'Posting a letter without caring which sorting office it passes through.' }
  ],

  takeaways: [
    'An **actor** = **private state + mailbox + behaviour**. No shared memory, so no locks.',
    'Actors handle **one message at a time** and communicate only by **messages**.',
    '**Supervision** and **let it crash**: fail fast, restart clean, contain the damage.',
    'Erlang, Akka and Orleans. Best for many independent stateful things; poor for simple CRUD.'
  ],

  links: [
    { label: 'Akka documentation: actors', url: 'https://doc.akka.io/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-choosing', {
  eli5: 'There is no best architecture, only the one that fits your problem and your team. Start with the simplest thing that works, and add complexity only when something real forces you to.',

  cards: [
    { kind: 'concept', title: 'The most expensive sentence in software',
      body: `*"We should use microservices, event sourcing and Kubernetes. That's what the big companies do."*

        A four-person start-up says this, and builds a system that needs an on-call rota, a platform team and a distributed-tracing budget, before it has a single paying customer. Eighteen months later it is still building plumbing.

        You now know a whole menu of patterns: layers, plug-ins, microservices, serverless, CQRS, event sourcing, actors. Every one is a **good answer to a particular problem**, and a poor answer to others.

        The skill is no longer knowing the patterns. It is **choosing**: matching the shape of the solution to the shape of the problem, and the size of your team.` },

    { kind: 'metaphor', title: 'Choosing a vehicle',
      body: `Nobody asks "what is the best vehicle?" They ask "what am I moving, how far and how often?"

        - A **bicycle** (a simple monolith) is perfect for the shops down the road. Cheap, quick, nothing to maintain.
        - A **van** (a modular monolith) carries a bigger load with little extra effort.
        - A **fleet of lorries and a freight depot** (microservices on Kubernetes) moves enormous volumes, but needs drivers, schedules, mechanics and fuel budgets.

        Taking a freight train to buy milk is not impressive. It is just expensive.

        The metaphor stops at one point: you can upgrade a vehicle in software without throwing the old one away, so you can start small and grow.` },

    { kind: 'compare', title: 'Styles against what they are good at',
      body: 'A cheat sheet linking the shapes from this and earlier modules to the **quality attributes** you care about. Ratings are rough.',
      cols: ['Shines at', 'Struggles with'],
      rows: [
        ['Monolith (modular)', 'Simplicity, speed of early development, easy debugging', 'Independent scaling, many teams on one codebase'],
        ['Layered', 'Familiarity, clear responsibilities', 'Rapid change across all layers'],
        ['Microservices', 'Team autonomy, independent deploys and scaling', 'Operational cost, distributed data, debugging'],
        ['Event-driven / streams', 'Loose coupling, buffering bursts, audit and replay', 'Seeing the whole flow, eventual consistency'],
        ['Serverless', 'Spiky load, low operations effort', 'Steady heavy load, latency, long jobs'],
        ['Plug-in (microkernel)', 'Extensibility by others', 'A stable contract, plug-in quality']
      ] },

    { kind: 'steps', title: 'A way to decide',
      body: 'This is not a formula, but it keeps you honest.',
      steps: [
        { title: 'Write down what actually matters', body: 'The top three **quality attributes**: is it speed, uptime, cost, ease of change, auditability? You cannot maximise everything.' },
        { title: 'Count your people', body: 'A team of five and an organisation of two hundred need different architectures. By Conway’s law, the system will mirror your teams anyway.' },
        { title: 'List the real constraints', body: 'Budget, deadlines, skills you already have, regulation, existing systems you must keep.' },
        { title: 'Pick the simplest thing that meets them', body: 'Usually a **modular monolith**. Name the specific pain that would make you choose something heavier.' },
        { title: 'Write the decision down', body: 'A short note: what you chose, what you rejected, and why. Future you will be grateful.' }
      ] },

    { kind: 'diagram', title: 'Day one: a modular monolith',
      body: 'One deployable app, with clear internal modules and one database. Five people can hold all of it in their heads.',
      nodes: [
        { id: 'app', label: 'One application', icon: '📦', x: 1, y: 0, tone: 'accent' },
        { id: 'm1', label: 'Catalogue module', x: 0, y: 1 },
        { id: 'm2', label: 'Orders module', x: 1, y: 1 },
        { id: 'm3', label: 'Billing module', x: 2, y: 1 },
        { id: 'db', label: 'One database', icon: '🗄️', x: 1, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'app', to: 'm1' }, { from: 'app', to: 'm2' }, { from: 'app', to: 'm3' },
        { from: 'm1', to: 'db', dashed: true }, { from: 'm2', to: 'db', dashed: true }, { from: 'm3', to: 'db', dashed: true }
      ],
      caption: 'Modules talk through clear interfaces, so boundaries exist even without a network.' },

    { kind: 'concept', title: 'Earn your complexity',
      body: `Each heavier piece should arrive because of a **specific, measured pain**, not a hunch.

        - A **cache** when a page is slow *and you have measured why*.
        - A **queue** when slow work, like sending email, blocks users, or bursts overwhelm you.
        - A **read replica or CQRS** when reads genuinely drown writes.
        - A **separate service** when one part needs to scale differently, or a team is blocked by a shared release.
        - **Event sourcing** where history is a business requirement.

        This is the heart of **monolith first**: you learn where the real boundaries and bottlenecks are by running the thing. Moving a line inside one program is cheap. Moving a mistaken network boundary is not.` },

    { kind: 'diagram', title: 'Year three: the same system, earned changes',
      body: 'Each addition answers a real problem the team met. Notice the core is still one app.',
      nodes: [
        { id: 'cdn', label: 'CDN and cache', icon: '⚡', x: 1, y: 0, tone: 'good' },
        { id: 'app', label: 'Main app (modular)', icon: '📦', x: 1, y: 1, tone: 'accent' },
        { id: 'q', label: 'Job queue', icon: '📬', x: 0, y: 2, tone: 'warn' },
        { id: 'img', label: 'Image service', x: 0, y: 3, tone: 'accent' },
        { id: 'db', label: 'Database + replica', icon: '🗄️', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'cdn', to: 'app' }, { from: 'app', to: 'q', label: 'slow jobs' },
        { from: 'q', to: 'img' }, { from: 'app', to: 'db', dashed: true }
      ],
      caption: 'One extracted service (image processing, which needed its own scaling), one queue, one cache. Not forty services.' },

    { kind: 'concept', title: 'Evolutionary architecture',
      body: `Because you cannot predict the future, treat architecture as something that **evolves**, with ways to change it safely:

        - **Small, reversible steps** over big-bang rewrites. The **strangler fig** approach grows a new system around the old one, moving one piece at a time until the old one can be removed.
        - **Fitness functions** (from the Architectural Principles module): automated checks that guard what matters, such as "no cycles between modules" or "checkout responds in under 300 ms".
        - **Recorded decisions**, so you remember why you chose something and can revisit it when the facts change.

        Aim to make decisions **easy to change**, and keep the hard-to-change ones few. Delay the others until you know more.` },

    { kind: 'pitfall', title: 'Fashion, résumés and cargo cults',
      body: `Three ways good teams choose badly:

        - **Hype-driven**: copying what a famous company does. They have 5,000 engineers and problems you do not have.
        - **Résumé-driven**: picking technology because it will look good on a CV, not because it solves the problem.
        - **Cargo cult**: adopting a pattern's *shape* without the problem it solved, such as building services with a shared database.

        The opposite failure exists too: refusing ever to change a design that has outgrown its shape. The antidote to both is evidence. **What is the problem, how will you know it is solved, and what is the cheapest way to try?**` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A five-person start-up is building its first product. Which starting point is usually most sensible?',
      options: ['A modular monolith, adding heavier pieces only when a real pain appears', 'Forty microservices from the start, so nothing needs splitting later', 'A serverless function for every line of business logic', 'A custom plug-in framework so others can extend it'],
      answer: 0,
      why: [null, 'Five people would spend their time running infrastructure rather than building the product.', 'Fragmenting everything adds overhead without any evidence of need.', 'Extensibility by outsiders is a problem for later, if ever.'],
      explain: 'A small team gets the most speed from the simplest architecture. Boundaries inside the monolith keep future options open.' },

    { type: 'bucket', after: 2, prompt: 'Which pattern best fits each situation?', buckets: ['Modular monolith', 'Microservices', 'Serverless', 'Event sourcing'],
      items: [['A new product with six developers and unclear boundaries', 0], ['200 developers blocked by one shared release train', 1], ['An image-resizing job that runs in rare, large bursts', 2], ['A regulated ledger that must show how every balance arose', 3], ['A small internal tool used by one department', 0], ['A feature with wildly different load that needs its own scaling', 1]],
      explain: 'Match the problem, not the fashion. Team size, load pattern and audit needs each point to a different answer.' },

    { type: 'order', after: 7, prompt: 'Put a sensible path for growing an architecture in order.',
      items: ['Start with a modular monolith', 'Measure and find a specific pain', 'Add the smallest change that relieves it, such as a cache or queue', 'Extract a service only if a part needs independent scaling or team ownership', 'Record the decision and keep checking it with fitness functions'],
      explain: 'Evidence comes before each step. Cheap changes are tried before expensive ones, and decisions are recorded so they can be revisited.' },

    { type: 'tf', statement: 'Copying the architecture of a famous tech company is a reliable way to choose well for your own system.', answer: false,
      explain: 'Their teams, scale and problems differ from yours. Architecture should answer *your* quality attributes, team size and constraints.' },

    { type: 'multi', q: 'Which of these are good reasons to extract a service from a monolith?',
      options: ['One part needs to scale very differently from the rest', 'A team is regularly blocked by a shared release process', 'The part has a clear, stable boundary and an owner', 'Microservices are fashionable', 'It will look good on a CV'],
      answers: [0, 1, 2],
      explain: 'Evidence of a real pain, plus a boundary that can bear the cost, justifies a service. Fashion and CVs do not.' },

    { type: 'scenario', title: 'FreshCrate: from day one to scale', intro: 'FreshCrate sells weekly meal boxes. There are five engineers, 200 customers and no revenue yet. You are the lead engineer and must choose the architecture.',
      meters: { 'speed': 50, 'future cost': 40 },
      steps: [
        { text: 'You are deciding the first shape of the system. What do you pick?',
          choices: [
            { label: 'A modular monolith with one database; separate modules for catalogue, orders and billing', score: 2, effects: { speed: 25, 'future cost': -10 }, feedback: 'Fast to build and easy to debug. The module boundaries keep the option of splitting later without paying for it today.' },
            { label: 'Microservices with Kubernetes, because “we will need to scale”', score: 0, effects: { speed: -30, 'future cost': 30 }, feedback: 'Five people now run a platform before anyone has proved they want the product. The scaling you fear may never arrive.' },
            { label: 'A single tangled script with everything in it', score: 1, effects: { speed: 10, 'future cost': 20 }, feedback: 'It is quick at first, but without internal boundaries every future change gets harder.' }
          ] },
        { text: 'Sending the confirmation email and generating the PDF invoice makes checkout take six seconds. What next?',
          choices: [
            { label: 'Put those slow jobs on a queue handled by a background worker', score: 2, effects: { speed: 15, 'future cost': -5 }, feedback: 'A small, targeted addition fixes a measured pain. Checkout returns fast and the work happens a moment later.' },
            { label: 'Split the whole shop into microservices to make it faster', score: 0, effects: { speed: -20, 'future cost': 25 }, feedback: 'The pain was two slow jobs. Splitting everything is a sledgehammer for a nail.' }
          ] },
        { text: 'Eighteen months on, there are 45 engineers. The checkout team is constantly blocked by a shared fortnightly release. What do you do?',
          choices: [
            { label: 'Extract checkout, the team’s clearly bounded area, as its own service behind an API, and measure the effect', score: 2, effects: { speed: 25, 'future cost': 10 }, feedback: 'Now there is a real team-blocking pain and a clear boundary. You pay the distribution cost for one part that benefits.' },
            { label: 'Rewrite everything as microservices in a six-month freeze', score: 0, effects: { speed: -30, 'future cost': 35 }, feedback: 'A big-bang rewrite stops delivery and risks a repeat of every old mistake, with new ones added.' },
            { label: 'Hire more engineers and keep the same release process', score: 1, effects: { speed: -5, 'future cost': 10 }, feedback: 'More people on a shared release train usually make the queue longer.' }
          ] }
      ],
      outro: 'Start simple, add complexity only with evidence, and extract when team and boundary both justify it.' },

    { type: 'scenario', title: 'The legacy rewrite', intro: 'A ten-year-old monolith is slow to change and everyone hates it. A director proposes a two-year rewrite as microservices: “start again properly”.',
      meters: { 'risk': 60, 'delivery': 40 },
      steps: [
        { text: 'How do you respond?',
          choices: [
            { label: 'Propose the strangler fig: build new pieces around the old system, route traffic piece by piece, retire old parts as they are replaced', score: 2, effects: { risk: -30, delivery: 20 }, feedback: 'Value arrives continuously, each step is reversible, and the old system keeps earning while you replace it.' },
            { label: 'Agree to the two-year big-bang rewrite', score: 0, effects: { risk: 30, delivery: -40 }, feedback: 'Two years without shipping, a moving target as the old system keeps changing, and a big cutover risk at the end.' },
            { label: 'Refuse any change: it works, leave it', score: 1, effects: { delivery: -10, risk: 10 }, feedback: 'Sometimes right, but here the pain is real. Standing still means the problem keeps growing.' }
          ] },
        { text: 'Which piece do you move first?',
          choices: [
            { label: 'A well-bounded, painful, relatively low-risk area, such as notifications', score: 2, effects: { risk: -10, delivery: 15 }, feedback: 'A contained first step teaches the team the routing, deployment and monitoring they need, before touching the core.' },
            { label: 'The deepest, most tangled core of the system', score: 0, effects: { risk: 30, delivery: -15 }, feedback: 'The riskiest piece first, with the least experience, is the opposite of learning cheaply.' }
          ] },
        { text: 'How will you know the migration is actually working?',
          choices: [
            { label: 'Track agreed measures: deploy frequency, lead time, incidents, and automated fitness checks on the boundaries', score: 2, effects: { risk: -15, delivery: 15 }, feedback: 'Evidence tells you whether each step helped and when to stop. Without it, you are just hoping.' },
            { label: 'When the director says it feels better', score: 0, effects: { risk: 15 }, feedback: 'Feelings drift. Without measures you cannot tell progress from activity.' }
          ] }
      ],
      outro: 'Evolve in small, measured, reversible steps, with the old system earning its keep until the new one is ready.' },

    { type: 'explain', prompt: 'A new colleague says, “Let’s use microservices from day one, then we will never have to rewrite.” Explain, kindly, why you would start differently, and what would change your mind.',
      model: 'Early on we do not know where the real boundaries or bottlenecks are, and a small team pays heavily for running many services. A modular monolith is faster to build and cheap to reorganise, and it keeps the option to split later. I would change my mind given evidence: a part that needs to scale differently, or several teams blocked by a shared release, plus a stable, well-understood boundary.',
      keywords: ['simplest', 'team size', 'boundaries', 'modular monolith', 'evidence', 'pain', 'extract'] }
  ],

  flashcards: [
    { q: 'What is a sound default starting architecture, and why?', a: 'A modular monolith: simple to build and debug, cheap to reorganise, and its internal boundaries leave the option of splitting later.' },
    { q: 'What does “earn your complexity” mean?', a: 'Add each heavier piece, such as a cache, queue or service, only in response to a specific, measured pain.' },
    { q: 'What is the strangler fig approach?', a: 'Gradually building a new system around an old one, moving functionality piece by piece, until the old one can be switched off.' },
    { q: 'What is a fitness function?', a: 'An automated check that guards an architectural quality, such as response time or no dependency cycles, as the system evolves.' },
    { q: 'Why shouldn’t you copy a big tech company’s architecture?', a: 'Their team size, scale and problems differ from yours. Choose from your own quality attributes, people and constraints.' },
    { q: 'What first inputs shape an architecture choice?', a: 'The top quality attributes, the size and structure of the team, and the real constraints such as budget, skills and regulation.' }
  ],

  glossary: [
    { term: 'Quality attribute', def: 'A property a system should have, such as performance, availability, security or ease of change, which architectural choices trade against each other.', like: 'What you want from a vehicle: speed, capacity, economy.', aka: ['non-functional requirement'] },
    { term: 'Modular monolith', def: 'A single deployable application organised into well-separated modules with clear interfaces and boundaries.', like: 'A van with labelled compartments.' },
    { term: 'Evolutionary architecture', def: 'An approach that expects the design to change over time and builds in safe ways, such as small steps and automated checks, to guide that change.', like: 'A garden that is tended and reshaped, not built once.' },
    { term: 'Strangler fig pattern', def: 'A migration approach that replaces an old system piece by piece, routing more and more traffic to the new parts until the old can be removed.', like: 'A vine growing around a tree.' },
    { term: 'Fitness function', def: 'An automated test of an architectural quality, run continuously to catch drift.', like: 'A smoke alarm for your design.' }
  ],

  takeaways: [
    'There is **no best architecture**: choose from your **quality attributes, team size and constraints**.',
    '**Start simple** (usually a modular monolith) and **earn each piece of complexity** with a measured pain.',
    'Evolve in **small, reversible steps**: strangler fig, fitness functions, recorded decisions.',
    'Beware **hype, résumé-driven and cargo-cult** choices. Ask what problem you are solving.'
  ],

  links: [
    { label: 'Martin Fowler: Strangler Fig', url: 'https://martinfowler.com/bliki/StranglerFigApplication.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('arch-patterns-domain', {
  title: 'The Domain Sphinx',
  intro: 'A sphinx sits at the crossroads of data and domain and asks riddles about boundaries, events and failures. Answer wisely: each pattern helps in one place and hurts in another.',
  questions: [
    { type: 'mcq', q: 'Sales, shipping and billing all use the word “customer” differently. In DDD terms, what is the right response?',
      options: ['Give each bounded context its own customer model and define how they exchange data', 'Build one shared Customer class with every team’s fields', 'Ban the word “customer” and use technical IDs', 'Merge the three teams into one'],
      answer: 0,
      why: [null, 'A shared class couples all three teams to each other’s changes.', 'The ubiquitous language should use the business’s real words.', 'The problem is the model, not the headcount.'],
      explain: 'Bounded contexts let each area have a small, accurate model. Explicit contracts at the borders keep them cooperating without coupling.' },

    { type: 'bucket', prompt: 'For an online shop, core, supporting or generic subdomain?', buckets: ['Core', 'Supporting', 'Generic'],
      items: [['A unique pricing and bundling engine that wins customers', 0], ['Warehouse stock counts', 1], ['Sign-in and passwords', 2], ['Card payment processing', 2], ['Printing delivery labels', 1], ['A recommendation engine that is the shop’s edge', 0]],
      explain: 'Put your best effort into what differentiates you. Buy or reuse what everyone needs.' },

    { type: 'spot', prompt: 'This code skips the aggregate root’s protection. Tap the line.',
      code: { lang: 'js', src: `
        const order = await orders.get(id);
        order.lines.push({ sku: 'X1', qty: -5 });
        order.status = 'placed';
        await orders.save(order);` },
      lines: [2],
      explain: 'Pushing into the list bypasses the root’s rules, so a negative quantity gets in. The caller should use a root method such as `addLine`, which enforces the invariants.' },

    { type: 'tf', statement: 'Two Money value objects of £10 GBP are considered equal even if they are different instances.', answer: true,
      explain: 'Value objects are compared by their attributes, not identity. That is what makes them interchangeable and safe to share.' },

    { type: 'mcq', q: 'You are designing aggregates for a shop. What is the best way for an Order to refer to its Customer?',
      options: ['Hold the customer’s ID and load the Customer separately when needed', 'Embed the whole Customer inside the Order', 'Make the Customer contain all of its Orders', 'Let Order write directly to the Customer’s fields'],
      answer: 0,
      why: [null, 'Embedding tangles the two aggregates’ transactions.', 'That builds a giant aggregate with contention problems.', 'No aggregate should change another’s internals.'],
      explain: 'Reference by ID keeps aggregates small, each with its own consistency boundary and one transaction.' },

    { type: 'order', prompt: 'Put one write followed by a read in a CQRS system in order.',
      items: ['A command reaches the write model', 'The write model checks its rules and saves', 'An event announces the change', 'A projection updates the read store', 'A query reads the prepared data'],
      explain: 'Rules run first, the event carries the news, and the read side catches up a moment later. That gap is eventual consistency.' },

    { type: 'short', q: 'What is the name for the lag between a write and the read model catching up in CQRS, in two words?', accept: ['eventual consistency'], hint: 'It will be consistent, eventually.',
      explain: '**Eventual consistency**: the read model will reflect the change, but not instantly. Design the user experience for that short window.' },

    { type: 'estimate', q: 'An event-sourced account has 25,300 events. Snapshots are taken every 5,000 events, and the latest was after event 25,000. Roughly how many events must be replayed to rebuild the state?', answer: 300, unit: 'events', tolerance: 1.5,
      explain: 'After loading the snapshot at event 25,000, only events 25,001 to 25,300 need replaying: 300. Without a snapshot it would be 25,300.' },

    { type: 'multi', q: 'Which are genuine costs of event sourcing?',
      options: ['Old event versions must be supported for ever', 'Simple ad-hoc queries need read models', 'Deleting personal data is awkward in an append-only log', 'You lose the ability to see past states', 'You can no longer build new read models'],
      answers: [0, 1, 2],
      explain: 'Versioning, querying and deletion are the real costs. Time travel and new read models are the benefits.' },

    { type: 'ab', q: 'Which event is the better design for a consumer that must keep working when the Orders service is down?',
      a: { lang: 'json', label: 'Carries the data', src: `
        { "type": "OrderPlaced", "id": 7,
          "items": [{ "sku": "X1", "qty": 2 }],
          "address": "12 High St" }` },
      b: { lang: 'json', label: 'Just a signal', src: `
        { "type": "OrderPlaced", "id": 7 }` },
      answer: 'a',
      explain: 'Event-carried state transfer lets consumers keep their own copy and never call back. A thin notification forces them to ask the sender, so they depend on it being up.' },

    { type: 'match', prompt: 'Match each actor-model term to its meaning.',
      pairs: [['Mailbox', 'Queue of messages waiting for an actor'], ['Private state', 'Data only the owning actor can touch'], ['Supervisor', 'Actor that restarts or stops a failed child'], ['Let it crash', 'Fail fast and restart clean rather than over-defend'], ['Orleans', 'Microsoft’s virtual-actor framework']],
      explain: 'No shared memory plus supervision is what gives actors lock-free concurrency and contained failures.' },

    { type: 'cloze', text: 'A good default is to start with a modular {{monolith}}, add complexity only when a measured {{pain}} appears, and migrate old systems with the {{strangler}} fig approach.',
      distractors: ['cluster', 'trend', 'rewrite'],
      explain: 'Simple first, evidence before each step, and small reversible migrations rather than a big-bang rewrite.' }
  ]
});

KS.sheet('arch-patterns-domain', {
  title: 'Architectural Patterns II: cheat sheet',
  sections: [
    { title: 'DDD: strategic',
      md: `**Ubiquitous language:** experts and developers use the same words, in code too.

        | Subdomain | Meaning | Do |
        |---|---|---|
        | Core | Your competitive edge | Build, best people |
        | Supporting | Needed, not special | Keep simple |
        | Generic | Same for everyone | Buy or reuse |

        **Bounded context:** a border inside which one model and language hold. **Context map** relationships: customer–supplier, shared kernel, **anti-corruption layer** (a translator). A context is not always a microservice.` },

    { title: 'DDD: tactical',
      md: `| Block | Rule |
        |---|---|
        | Entity | Defined by identity; changes over time |
        | Value object | Immutable; equal when values match |
        | Aggregate | Cluster changed as one unit |
        | Root | The only entry; enforces **invariants** |
        | Repository | Collection-like store, one per root |
        | Domain service | Stateless rule that fits no entity |
        | Domain event | Past-tense fact: OrderPlaced |

        **Keep aggregates small.** Refer to others by ID. One aggregate per transaction.` },

    { title: 'CQRS',
      md: `**Commands** change state and can be refused. **Queries** read and change nothing. Use separate models: a **write model** (rules) and **read models** (shaped like screens), fed by events through **projections**.

        **Cost:** eventual consistency. Fix with returned confirmations, optimistic UI, or waiting for catch-up.

        **Overkill** for plain CRUD. It is **not** the same as event sourcing. Apply it only where reads and writes pull apart. Can be used lightly: same database, separate classes.` },

    { title: 'Event sourcing',
      md: `Store **immutable past-tense events**. **Current state = replay.** Fix errors with new events.

        - **Snapshot:** saved state so you replay only newer events. A speed-up, not truth.
        - **Gains:** audit, time travel, debugging, new read models by replay.
        - **Costs:** **event versioning** (upcasting), complexity, harder queries, awkward deletion.
        - **Optimistic concurrency:** append with the expected version.

        Use where history *is* the business: ledgers, regulated domains, rich lifecycles.` },

    { title: 'Queues and streams as backbone',
      md: `| | Queue | Stream (log) |
        |---|---|---|
        | After reading | Removed | Kept |
        | Consumers | Compete | Each group reads all |
        | New reader | Future only | Can replay |

        **Event notification:** thin, call back for details. **Event-carried state transfer:** fat, consumers keep copies. **Choreography:** reactions, no controller. **Orchestration:** a coordinator.

        Use a **transactional outbox**; make consumers **idempotent**.` },

    { title: 'The actor model',
      md: `**Actor** = private state + mailbox + behaviour. One message at a time, **no shared memory**, so no locks. Actors send messages, update state or create actors.

        **Supervision:** parents restart, stop or escalate. **Let it crash.**

        **Systems:** Erlang/OTP (and Elixir), Akka (JVM), Orleans (.NET virtual actors, "grains").

        **Fits:** many independent stateful things (chat, games, devices). **Poor fit:** plain CRUD, shared-memory number crunching.` },

    { title: 'Choosing an architecture',
      md: `1. Name the top **quality attributes**.
        2. Count your people (Conway's law).
        3. List real constraints.
        4. Pick the **simplest** that works, usually a **modular monolith**.
        5. Record the decision.

        **Earn complexity:** cache, queue, replica, service, event sourcing, each only for a **measured pain**.

        **Evolve:** small reversible steps, **strangler fig**, **fitness functions**. Avoid hype-, résumé- and cargo-cult choices.` }
  ]
});

