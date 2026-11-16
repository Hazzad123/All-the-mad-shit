/* Module: arch-principles — Architectural Principles.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs arch-principles */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ap-what', {
  eli5: 'Architecture is the handful of big decisions about how a system is put together that are painful to change later, so they are worth thinking about early.',

  cards: [
    { kind: 'story', title: 'The week-one decision',
      body: `A two-person startup is building a booking app. In week one, one of them says: "Let's store everything in one file on the server. We can sort it out later."

        Later arrives. Eighteen months on, there are 200,000 users, three servers that cannot share a file, and a database migration that takes four developers a whole quarter.

        Meanwhile, the colour of the Book button has changed six times, and each change took ten minutes.

        Same team, same codebase. Two kinds of decision: one was cheap to reverse, the other cost a quarter. **Architecture is about the second kind.**` },

    { kind: 'concept', title: 'Architecture = the decisions that are hard to change',
      body: `There are many definitions, and people argue about them. The most useful one for a beginner is this:

        > Architecture is the set of decisions that are **expensive to change later**.

        Rename a variable? Cheap. Swap the programming language of the whole system? Very expensive. Choose whether parts talk by direct calls or by messages? Somewhere in the middle, and rising fast as code piles up.

        So the question to ask of any decision is not "is it important?" but "**how much would it hurt to undo?**" The more it hurts, the more it deserves thought up front.` },

    { kind: 'compare', title: 'Cheap to change, costly to change',
      body: 'A rough sorting. Real projects vary, but the pattern holds.',
      cols: ['Cheap to change', 'Costly to change'],
      rows: [
        ['Naming', 'A variable or function name', 'The names of things in a public API that others use'],
        ['Code inside a box', 'How one function loops', 'Which box owns which data'],
        ['Storage', 'An extra database column', 'Relational or document database for everything'],
        ['Communication', 'The wording of an error', 'Direct calls vs messages between parts'],
        ['Deployment', 'A config value', 'One deployable app vs many']
      ],
      note: 'The right-hand column is where architecture lives.' },

    { kind: 'concept', title: 'Structure: boxes and relationships',
      body: `If you drew your system on a whiteboard, you would draw **boxes** and **arrows**.

        A box is a **component**: a chunk of the system with a job, such as "the web app", "the payments code" or "the database". An arrow is a **relationship**: this one calls that one, reads from it, or sends it messages.

        That drawing is the structure, and it answers practical questions. What can be deployed on its own? What breaks if this box dies? Which team can work without waiting for another?

        Architecture is mostly about **which boxes exist and which arrows are allowed**.` },

    { kind: 'diagram', title: 'A tiny shop, as boxes and arrows',
      body: 'Even a small system has a shape. Notice what one arrow decision changes.',
      nodes: [
        { id: 'web', label: 'Web app', icon: '🖥️', x: 1, y: 0 },
        { id: 'api', label: 'Shop backend', icon: '⚙️', x: 1, y: 1, tone: 'accent' },
        { id: 'db', label: 'Database', icon: '🗄️', x: 0, y: 2 },
        { id: 'pay', label: 'Payment provider', icon: '💳', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'web', to: 'api', label: 'requests' },
        { from: 'api', to: 'db', label: 'reads, writes' },
        { from: 'api', to: 'pay', label: 'charges cards' }
      ],
      caption: 'If the backend calls the payment provider directly, a slow provider makes checkout slow. If it sent a message instead, checkout could finish first. That one arrow is an architectural choice.' },

    { kind: 'metaphor', title: 'Foundations and wallpaper',
      body: `Building a house, you can repaint a room on a Saturday. Moving a **load-bearing wall** is a different matter: it needs an engineer, scaffolding and a skip.

        Architecture is the load-bearing walls, the plumbing routes and the foundations. Wallpaper is everything you can change without calling anyone.

        You do not need to plan every piece of wallpaper, but you want to be careful about where the walls go before the second floor is built on top.

        Where the metaphor stops: a house is finished, and software never is. The aim is not to get the walls right forever, but to put them where moving them later hurts least.` },

    { kind: 'layers', title: 'Architecture vs design: how far you zoom',
      body: 'Both are about structure. They differ in zoom level, and the border is fuzzy.',
      layers: [
        { label: 'Architecture: the whole system', note: 'Which big parts exist, how they talk, where they run.', tone: 'accent', icon: '🏙️' },
        { label: 'Components and modules', note: 'How a part is divided into packages and how they depend on each other.', tone: 'info', icon: '🏘️' },
        { label: 'Design: classes and functions', note: 'Which objects exist and which patterns shape them.', tone: 'good', icon: '🏠' },
        { label: 'Code: lines and names', note: 'Loops, conditions, names. Cheap to rewrite.', tone: 'muted', icon: '🧱' }
      ],
      note: 'Some people say "architecture is just design at a larger scale". That is fair. What matters is that higher layers are costlier to change.' },

    { kind: 'concept', title: 'The “-ilities”: what the system must be good at',
      body: `A system can be built to do the same job in very different ways. What separates the ways is **how well** it does the job, along qualities such as:

        - **scalability**: can it cope with ten times the users?
        - **availability**: is it up when people need it?
        - **security**: does it keep out the wrong people?
        - **maintainability**: can a new developer change it safely?

        These are called **quality attributes**, or informally the "-ilities". Customers rarely ask for them by name, but they feel them: "the site is slow", "it went down at Christmas".

        Architecture is largely the art of getting the right ones for *this* product.` },

    { kind: 'pitfall', title: 'Everything is a trade-off',
      body: `Wouldn't it be nice to maximise every quality at once? You cannot, because they pull against each other.

        - Add a **cache** and pages get faster, but they may show stale data.
        - Add **encryption and approvals** and you are more secure, but also slower and more annoying.
        - Make it **highly available** with copies in three regions and your bill triples.

        So when someone says "we picked the best architecture", the honest reply is: "best for what?" A banking core and a photo-sharing app rightly look different.

        There are no perfect answers in this field, only **trade-offs you made on purpose** versus ones that happened to you.` },

    { kind: 'tip', title: 'A question to ask of any decision',
      body: `Before committing to something big, ask three short questions:

        1. **How hard would this be to reverse?** (If "very", slow down.)
        2. **What are we giving up?** (Every choice costs something.)
        3. **What could we learn before we have to decide?** (Often, a small experiment beats a big debate.)

        This is not an excuse to delay everything. Delaying a decision is only wise when delaying is cheap. The skill is spotting the few decisions that really are one-way doors, and walking through the rest quickly.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Which decision is most likely to count as "architecture"?',
      options: ['Splitting the system into programs talking over a network', 'Renaming a function to something clearer for readers', 'Changing the padding on a button', 'Fixing a typo in an error message'],
      answer: 0,
      why: [null, 'Cheap to undo, so not the kind of decision that needs early thought.', 'A quick edit with no knock-on effects.', 'Trivial to change at any time.'],
      explain: 'Splitting into separate programs shapes deployment, team boundaries, failure modes and data ownership, and it is expensive to reverse. The others are changed in minutes.' },

    { type: 'bucket', after: 2, prompt: 'Cheap to change later, or costly?', buckets: ['Cheap to change', 'Costly to change'],
      items: [['The wording of a button label', 0], ['Whether the system is one app or many', 1], ['An internal variable name', 0], ['Which database holds the orders', 1], ['The order of items in a menu', 0], ['The shape of a public API that other companies call', 1]],
      explain: 'The costly ones have many things leaning on them: other teams, customers, stored data. Cheap decisions stay inside a small area of code.' },

    { type: 'match', after: 7, prompt: 'Match each quality attribute to the question it answers.',
      pairs: [['Scalability', 'Can it cope with ten times the users?'], ['Availability', 'Is it up when people need it?'], ['Security', 'Does it keep the wrong people out?'], ['Maintainability', 'Can a new developer change it safely?'], ['Performance', 'Does it respond quickly?']] },

    { type: 'tf', statement: 'A good architecture maximises every quality attribute at once: fast, secure, cheap and flexible.', answer: false,
      explain: 'Qualities pull against each other. Encryption and checks cost speed, extra copies cost money, and a cache trades freshness for speed. Architecture is choosing which matter most for this product.' },

    { type: 'order', prompt: 'Put these from cheapest to costliest to change later.',
      items: ['The colour of a button', 'The name of a private function', 'The structure of one database table', 'Which database technology the whole product uses', 'Whether the system is one app or many separate services'],
      explain: 'The more of the system leans on a decision, the more it costs to move. A colour affects one place; a split into services affects teams, deployment and data everywhere.' },

    { type: 'short', q: 'What is the informal name for qualities such as scalability and maintainability, taken from how their names end?', accept: ['ilities', 'the ilities', '-ilities'], hint: 'It sounds like a sneeze followed by "ties": the “-___ities”.',
      explain: 'The "-ilities". Formally they are quality attributes (or non-functional requirements), the qualities of *how* a system works rather than *what* it does.' },

    { type: 'scenario', title: 'The Friday storage debate', intro: 'You are the newest developer at a team building a photo-printing app. In stand-up, two decisions come up at once. You have to say which one deserves a proper discussion.',
      meters: { 'future pain': 30, 'team speed': 70 },
      steps: [
        { text: 'Decision A: should the "Order" button be green or blue? Decision B: should customer photos live on the web server’s own disk, or in separate shared storage? Where does the team’s thinking time go?',
          choices: [
            { label: 'Spend the time on B. Pick the button colour in thirty seconds.', score: 2, effects: { 'future pain': -10, 'team speed': 5 }, feedback: 'Right. The colour is a ten-minute edit whenever you like. Where photos live affects every server you add, backups, and migrating everyone’s data later.' },
            { label: 'Spend equal time on both; every decision is important.', score: 0, effects: { 'team speed': -20 }, feedback: 'If everything is a big decision, nothing gets decided. Time is the scarcest thing a team has, and it should follow the cost of being wrong.' },
            { label: 'Discuss neither: ship now and fix whatever breaks.', score: 1, effects: { 'future pain': 15, 'team speed': 10 }, feedback: 'Fast, and fine for the colour. But photo storage is a one-way door. Skipping it is how a quarter-long migration gets scheduled.' }
          ] },
        { text: 'You discuss B. A teammate says: "Disk is simplest, so disk." Another says: "Let’s design for a million users from the start." What do you suggest?',
          choices: [
            { label: 'Ask what we would give up with each, and choose the simplest option that is not hard to move away from.', score: 2, effects: { 'future pain': -15, 'team speed': 5 }, feedback: 'This is the architect’s move: name the trade-off, then favour options that keep your future choices open. Photos behind a small "store/fetch" piece of code can move to shared storage later at low cost.' },
            { label: 'Design for a million users now: it is cheaper than redoing it later.', score: 0, effects: { 'team speed': -25, 'future pain': -5 }, feedback: 'You will probably never reach that scale, and you will have paid for complexity every week until you do. Over-building is a trade-off too.' },
            { label: 'Go with disk, and put the photo code wherever is easiest.', score: 1, effects: { 'future pain': 10 }, feedback: 'Disk may well be right for now. The risk is scattering disk calls everywhere, which turns a reversible choice into a costly one.' }
          ] }
      ],
      outro: 'The pattern to remember: **spend thinking time in proportion to how hard a decision is to undo.**' },

    { type: 'ab', q: 'Which statement describes architecture better?',
      a: { lang: 'text', label: 'Option one', src: 'A diagram drawn at the start, then filed away.' },
      b: { lang: 'text', label: 'Option two', src: 'Costly-to-change decisions, made on purpose.' },
      answer: 'b',
      explain: 'Architecture is a set of decisions, not a document. A drawing helps to communicate them, but a diagram nobody follows or updates is not architecture, just decoration.' },

    { type: 'explain', prompt: 'A friend asks: "What is software architecture, and why does anyone argue about it?" Explain in your own words.',
      model: 'Architecture is the set of big decisions about how a system is divided into parts and how those parts relate, specifically the decisions that are costly to change later. People argue because every choice trades one quality (such as speed, cost, security or ease of change) against another, and the right trade depends on the product.',
      keywords: ['decisions', 'hard to change', 'parts', 'trade-off', 'quality', 'cost'] }
  ],

  flashcards: [
    { q: 'What is a useful working definition of architecture?', a: 'The set of decisions that are expensive to change later, mainly about which components exist and how they relate.' },
    { q: 'What are quality attributes?', a: 'Qualities of how a system works rather than what it does: scalability, availability, security, maintainability and so on. Also called the "-ilities".' },
    { q: 'How do architecture and design differ?', a: 'Mostly in zoom level. Architecture is the shape of the whole system; design is the shape of the pieces inside it. Higher-level choices cost more to undo.' },
    { q: 'Why is "the best architecture" an incomplete phrase?', a: 'Qualities trade off against each other, so an architecture is only best for a particular set of priorities.' },
    { q: 'What is a good question to ask about a big decision?', a: 'How hard would this be to reverse, and what are we giving up by choosing it?' }
  ],

  glossary: [
    { term: 'Software architecture', def: 'The major structure of a system: its components, how they relate, and the decisions behind them that are costly to change.', like: 'The load-bearing walls and plumbing of a house, not the wallpaper.' },
    { term: 'Component', def: 'A chunk of a system with its own job and a clear edge, such as the web app, the payment code or the database.', like: 'A room in a house: it has a purpose and doors to the others.' },
    { term: 'Quality attribute', def: 'A measurable quality of how a system behaves, such as scalability, availability, security or maintainability.', aka: ['non-functional requirement', 'the -ilities'], like: 'How well a car drives, rather than that it has wheels.' },
    { term: 'Trade-off', def: 'A choice where gaining one benefit means giving up another, such as speed for freshness.', like: 'Buying a faster train ticket that costs more.' }
  ],

  takeaways: [
    'Architecture is the **decisions that are costly to change** later.',
    'Its raw material is **components and the relationships** between them.',
    'Quality attributes (the **-ilities**) say what the system must be good at.',
    'You cannot maximise them all, so architecture is choosing **trade-offs on purpose**.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ap-coupling-cohesion', {
  eli5: 'Coupling is how much two parts of a program depend on each other, and cohesion is how well the things inside one part belong together; good designs keep coupling low and cohesion high.',

  cards: [
    { kind: 'story', title: 'The one-line change that broke checkout',
      body: `A developer changes how a customer's name is stored: one field called \`name\` becomes two, \`firstName\` and \`lastName\`. It is a ten-minute change to the profile code.

        By evening, invoices print "undefined", the email greeter says "Hello undefined" and a nightly report crashes.

        Nobody touched invoices, emails or reports. But all three had quietly reached into the profile code and read \`name\` directly.

        This is the problem behind most design rules: **parts of a system that know too much about each other.** Two ideas explain it, and they are worth learning properly.` },

    { kind: 'concept', title: 'Coupling: how much one part knows about another',
      body: `**Coupling** is the degree to which one module depends on another. Put simply: *if I change this, how many other things must change too?*

        - **Tight coupling**: A reaches into B's insides. A change to B breaks A.
        - **Loose coupling**: A only uses a small, stable front door on B. B can be rebuilt behind it.

        Notice that dependencies are not the enemy. A system whose parts depend on nothing cannot do anything. The goal is to keep dependencies **few, small and stable**.` },

    { kind: 'metaphor', title: 'Wall sockets and hard-wiring',
      body: `Compare two ways to power a lamp.

        **Hard-wired**: the lamp's cable is screwed straight into the house wiring. To move or replace it, you call an electrician and open the wall.

        **Plugged in**: the lamp has a plug, the wall has a socket, and the two agree on a *standard shape*. Swap the lamp, move it, borrow a different one: nobody touches the wiring.

        Loose coupling is the socket. It is a **small agreement** between two sides, so each can change freely behind it. Where the metaphor stops: a standard socket took decades to settle, whereas in software you design your own, so you must choose it with care.` },

    { kind: 'code', title: 'Tight vs loose, in code',
      body: 'Two ways for an invoice to get a customer’s name. **Tap the lines.**',
      code: { lang: 'js', src: `
        // Tight: reaches into the profile's internals
        function invoiceTitle(customer) {
          return 'Invoice for ' + customer.profile.name.trim();
        }

        // Looser: asks through a small front door
        function invoiceTitleLoose(customer) {
          return 'Invoice for ' + customer.displayName();
        }`,
        notes: {
          3: 'The invoice code knows the **shape** of the data: that there is a `profile`, that it has a `name`, and that it is a string. Three secrets, any of which can change.',
          8: 'Now the invoice only knows one thing: customers can say their display name. How they work it out (one field, two, a nickname) is the customer’s private business.'
        } } },

    { kind: 'compare', title: 'Kinds of coupling, from tight to loose',
      body: 'Coupling comes in flavours. From tightest (worst) to loosest (best):',
      cols: ['What A relies on', 'Example'],
      rows: [
        ['**Content**', 'B’s internals', 'A changes a private variable inside B'],
        ['**Global**', 'Shared global data', 'Both read and write one settings object'],
        ['**Data**', 'B’s exact data shape', 'A needs a record with exact fields'],
        ['**Interface**', 'B’s small public API', 'A calls `customer.displayName()`'],
        ['**Message**', 'An event, nothing else', 'A hears "OrderPlaced", sender unknown']
      ],
      note: 'You will not avoid all coupling, and should not try. Aim to move down the table where it matters.' },

    { kind: 'concept', title: 'Cohesion: do the contents belong together?',
      body: `**Cohesion** looks *inside* one module and asks: do all its parts belong together?

        High cohesion: everything in the module serves **one clear purpose**. A \`Basket\` that adds items, removes items and totals up the price.

        Low cohesion: a grab-bag. A \`Utils\` file with a date formatter, a tax calculator, a password checker and a function for resizing images.

        You can test it with one sentence. Can you describe what the module is for **without using "and" or "also"**? If not, it probably has several jobs.

        High cohesion makes code easy to find, understand and test. It also means a change usually lands in *one* place.` },

    { kind: 'diagram', title: 'The blast radius of a change',
      body: 'Imagine you change **Customer**. Anything with an arrow into it might break. This is the **blast radius**: how far a change ripples.',
      nodes: [
        { id: 'inv', label: 'Invoices', x: 0, y: 0 },
        { id: 'mail', label: 'Email greeter', x: 1, y: 0 },
        { id: 'rep', label: 'Nightly report', x: 2, y: 0 },
        { id: 'cust', label: 'Customer (changed)', x: 1, y: 1, tone: 'bad' },
        { id: 'db', label: 'Database', x: 1, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'inv', to: 'cust', label: 'reads name' },
        { from: 'mail', to: 'cust', label: 'reads name' },
        { from: 'rep', to: 'cust', label: 'reads name' },
        { from: 'cust', to: 'db', dashed: true }
      ],
      caption: 'Three arrows in means three places to check. Tight coupling is simply a large blast radius. Put a small interface in front of Customer and the radius shrinks to the interface.' },

    { kind: 'pitfall', title: 'Splitting a file is not reducing coupling',
      body: `A common beginner move: break a huge file into five smaller ones, and declare the design cleaner.

        But if each file still reaches into the others' variables and calls them in a tangled order, nothing has been decoupled. You have just moved the tangle into more files, and added the need to flip between them.

        Judge coupling by **how many things must change together**, not by how many files there are.

        The reverse trap exists too: removing all coupling by sending everything through a middleman that knows everything. That shifts the coupling; it does not remove it.` },

    { kind: 'tip', title: 'The goal: low coupling, high cohesion',
      body: `The two ideas pull together. When each module has one clear purpose (high cohesion), it needs fewer outside helpers, so its links to the rest shrink (low coupling).

        When related things are scattered across modules (low cohesion), every change needs several modules to move at once, and they all end up coupled.

        A handy reading of your own code: **"things that change together should live together, and things that change separately should be apart."**

        In the lab that follows, you will change one module and watch the ripple, then put an interface in the way and watch it shrink.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A module’s code is full of calls into the private details of another module. What does this mean?',
      options: ['Tight coupling: changes to the other module’s internals will break this one', 'High cohesion, because the two work closely together', 'Loose coupling, because the modules talk a lot', 'Nothing in particular; coupling only counts between programs'],
      answer: 0,
      why: [null, 'Cohesion is about one module’s *own* contents, not links between modules.', 'Loose coupling means a small, stable agreement, not frequent chatter.', 'Coupling applies at every scale, from two functions to two systems.'],
      explain: 'Coupling is about how much one part must know about another. Reaching into private details is the tightest kind, because the other side cannot change its insides without breaking you.' },

    { type: 'spot', after: 3, prompt: 'Tap the line that creates the tightest coupling to another module’s internals.',
      code: { lang: 'js', src: `
        function sendReceipt(order) {
          const to = order.customer.contact.emails[0];
          const total = order.totalWithTax();
          const msg = 'Thanks! You paid ' + total;
          mailer.send(to, msg);
        }` },
      lines: [2],
      explain: 'Line 2 digs through three layers of structure (customer, contact, the first of a list of emails). If any of those change shape, this breaks. `order.totalWithTax()` on line 3 asks through a method instead.' },

    { type: 'bucket', after: 5, prompt: 'High cohesion or low cohesion?', buckets: ['High cohesion', 'Low cohesion'],
      items: [['A `Basket` class: add item, remove item, total price', 0], ['A `Utils` file with date, tax, password and image functions', 1], ['A `PasswordHasher` with hash and verify', 0], ['A `Manager` class that sends emails, saves orders and draws charts', 1], ['A `TaxCalculator` that works out tax for an order', 0], ['A `Helpers` file that grows by one function whenever someone is stuck', 1]],
      explain: 'High cohesion means a single clear purpose that fits in one sentence. Vague names like Utils, Manager and Helpers are the usual signs of a grab-bag.' },

    { type: 'tf', statement: 'The best design has no dependencies between modules at all.', answer: false,
      explain: 'Modules that depend on nothing cannot work together. The aim is dependencies that are few, small and stable, such as going through a narrow interface, rather than none.' },

    { type: 'order', prompt: 'Order these couplings from tightest to loosest.',
      items: ['Reading another module’s private variable', 'Two modules sharing a global settings object', 'Passing a record that must have exact fields', 'Calling a small public method', 'Reacting to an event without knowing who sent it'],
      explain: 'Each step down knows less about the other side. At the loosest end, a module only needs the message itself, so the sender can be replaced or removed.' },

    { type: 'multi', q: 'Which changes would reduce the blast radius of changing how a `Customer` is stored?',
      options: ['Give Customer a `displayName()` method and have others call it', 'Stop other modules reading `customer.profile.name` directly', 'Copy the name field into three other modules for speed', 'Rename the class to `CustomerManager`', 'Hide the stored fields behind a small interface'],
      answers: [0, 1, 4],
      explain: 'All the good answers shrink what other modules know about Customer’s insides. Copying the field spreads the knowledge further, and renaming changes nothing about who depends on what.' },

    { type: 'ab', q: 'Which version has the higher cohesion?',
      a: { lang: 'js', label: 'One module', src: `
        // helpers.js
        function formatDate(d) { /* … */ }
        function calcTax(total) { /* … */ }
        function isStrongPassword(p) { /* … */ }
        function resizeImage(img) { /* … */ }` },
      b: { lang: 'js', label: 'Focused modules', src: `
        // tax.js
        function calcTax(total) { /* … */ }
        function applyDiscount(total, code) { /* … */ }
        function totalWithTax(items) { /* … */ }` },
      answer: 'b',
      explain: 'Everything in the second module is about money and tax, so its purpose fits in one sentence. The first mixes four unrelated jobs because each needed "somewhere to live".' },

    { type: 'scenario', title: 'The rename that rippled', intro: 'You are on call. A developer renamed a database column and, soon after, three unrelated features stopped working. Your job is to stop it happening again.',
      meters: { 'blast radius': 80, 'team morale': 60 },
      steps: [
        { text: 'You find that billing, search and the admin page all run their own SQL against the same `customers` table. What is the root problem?',
          choices: [
            { label: 'Three modules are coupled to the table’s exact shape, so any change touches all of them.', score: 2, effects: { 'blast radius': -10 }, feedback: 'Exactly. The table’s shape is a secret that three modules now share, so changing it needs three coordinated edits.' },
            { label: 'The developer should have been more careful.', score: 0, effects: { 'team morale': -20 }, feedback: 'Blaming a person does nothing to prevent the next one. The design made the mistake easy; the design is what to fix.' },
            { label: 'The table has too many columns.', score: 1, effects: {}, feedback: 'Column count was not what broke. It was the number of places that depended on one column’s name.' }
          ] },
        { text: 'How do you reduce the blast radius for next time?',
          choices: [
            { label: 'Put one `Customers` module in front of the table and make the others call it.', score: 2, effects: { 'blast radius': -50, 'team morale': 10 }, feedback: 'Now the table’s shape is known to one module. The next rename is one edit, in one place, tested in one place.' },
            { label: 'Add a rule that column names may never change.', score: 1, effects: { 'blast radius': -10, 'team morale': -15 }, feedback: 'It freezes the system instead of loosening it. You have kept the coupling and added a rule to protect it.' },
            { label: 'Copy the customers table for each module so they stop interfering.', score: 0, effects: { 'blast radius': 15 }, feedback: 'Now there are three copies to keep in sync, and the data will drift. Duplication shifts the coupling into the data.' }
          ] }
      ],
      outro: 'The pattern to remember: **make a secret known to one place only.** That is how you shrink the blast radius.' },

    { type: 'explain', prompt: 'Explain coupling and cohesion to a friend who has never programmed, using any everyday example you like.',
      model: 'Coupling is how much one part depends on the insides of another, so that changing one forces changes in the other. Cohesion is how well the things inside one part belong together. Think of a kitchen: cutlery in one drawer is high cohesion, while one drawer holding batteries, string and forks is low. Good design keeps coupling low and cohesion high, so a change touches one place.',
      keywords: ['depends', 'change', 'belong together', 'low coupling', 'high cohesion', 'interface'] }
  ],

  flashcards: [
    { q: 'What is coupling?', a: 'How much one module depends on, and knows about, another. Tight coupling means a change to one forces changes in the other.' },
    { q: 'What is cohesion?', a: 'How well the contents of a single module belong together. High cohesion means one clear purpose.' },
    { q: 'What is the usual goal?', a: 'Low coupling between modules and high cohesion inside them.' },
    { q: 'What is the blast radius of a change?', a: 'How far a change ripples: how many other parts might break or need editing because of it.' },
    { q: 'How can you test a module for cohesion?', a: 'Describe its purpose in one sentence without "and" or "also". If you cannot, it probably does several jobs.' }
  ],

  glossary: [
    { term: 'Coupling', def: 'How much one module depends on another, so that a change in one forces a change in the other.', like: 'Hard-wiring a lamp into the wall instead of using a plug.' },
    { term: 'Tight coupling', def: 'When a module relies on another’s internals, such as its private data or exact structure.', like: 'Two people tied together at the ankle.' },
    { term: 'Loose coupling', def: 'When modules interact only through a small, stable interface, so each can change behind it.', like: 'A plug and socket: any lamp fits any wall.' },
    { term: 'Blast radius', def: 'The extent of what could break or need editing because of a single change.', like: 'How many windows a single firework can shatter.' }
  ],

  takeaways: [
    '**Coupling** is how much one part knows about another; keep it low.',
    '**Cohesion** is how well a part’s contents belong together; keep it high.',
    'Prefer small, stable **interfaces** over reaching into another module’s insides.',
    'Measure design by **blast radius**: how far would a change ripple?'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ap-component-cohesion', {
  eli5: 'A component is a bundle of code that is released together, and these three principles help you decide which classes go in the same bundle so that changes and upgrades stay small.',

  cards: [
    { kind: 'story', title: 'The “common” library nobody dares touch',
      body: `A company has a shared package called \`common\`. It started with a date formatter. Over the years it gathered 40 classes: an email sender, a PDF drawer, a tax calculator, a logging helper.

        Now a small team building a dashboard needs only the date formatter. To get it, they install the whole package, and with it an email client and a PDF library they will never use.

        Worse, every time anyone fixes the tax calculator, a new version of \`common\` appears, and the dashboard team is asked to upgrade and retest for a change that has nothing to do with them.

        The question is not "how do I write the classes?" but "**which classes should ship in the same box?**"` },

    { kind: 'concept', title: 'What is a component?',
      body: `In this lesson a **component** is a bundle of code that is **released and deployed as one unit**, with a version number. Different languages call it different things:

        - a **package** (npm, PyPI)
        - a **library** or **JAR** (Java)
        - a **DLL** or **assembly** (.NET)
        - a **module** or **crate** (Go, Rust)

        A component might hold one class or two hundred. What makes it a component is not size but that other code depends on it *as a whole*, and you ship it *as a whole*.

        So drawing the box around code is a real decision: it decides what must be upgraded together.` },

    { kind: 'metaphor', title: 'Flat-pack boxes',
      body: `Think of flat-pack furniture. The wardrobe comes in three boxes. Each box holds the pieces you need *at the same step* of the build, labelled and numbered.

        Imagine if the boxes had been packed at random: box one has doors and half the screws, box two has one side panel and the instructions. You would have to open every box to build anything, and a missing screw would mean replacing the lot.

        Good packing keeps **pieces that are used together in the same box**, and **pieces that are not needed together in different boxes**.

        Components are those boxes. The three principles in this lesson are the packing rules.` },

    { kind: 'concept', title: 'REP: the unit of reuse is the unit of release',
      body: `The **Reuse/Release Equivalence Principle** (REP) says: *if you want people to reuse something, release it properly.*

        A reusable component needs a **version number**, **release notes** and a promise about what changes. Then the people who use it can decide when to upgrade, and what to test when they do.

        Reuse by copy and paste fails the test: when the original is fixed, nobody knows which copies have the bug.

        The flip side is that everything released together should be **reusable together**: a coherent group with one theme, not a random shelf of code that happened to be handy.` },

    { kind: 'concept', title: 'CCP: gather what changes together',
      body: `The **Common Closure Principle** (CCP) says: *put classes that change for the same reasons, at the same times, in the same component.*

        You may recognise it. It is the Single Responsibility Principle, scaled up from classes to components.

        Suppose a change in tax law touches \`TaxRule\`, \`TaxRateTable\` and \`TaxReport\`. If they live in one \`tax\` component, the change is **one release**. If they are spread over three components, it is three releases, three sets of tests and a coordination meeting.

        The idea: when a change comes, you want it to land in **as few boxes as possible**. Group by *why things change*.` },

    { kind: 'concept', title: 'CRP: do not make users carry what they do not use',
      body: `The **Common Reuse Principle** (CRP) says: *do not force the users of a component to depend on things they do not need.*

        It is the Interface Segregation Principle's cousin, again at component scale.

        Here is why it bites. When anything in a component changes, **everyone who depends on it** must re-check and often re-release, even if the change was in a class they never call.

        So classes that are *used together* belong together, and classes that are rarely used together belong apart. If half your users want only the date formatter, the date formatter should not be in the same box as the PDF drawer.` },

    { kind: 'diagram', title: 'The tension triangle',
      body: 'Each principle pulls the box boundaries a different way. You cannot satisfy all three fully.',
      nodes: [
        { id: 'rep', label: 'REP: reusable as a group', x: 1, y: 0, tone: 'accent' },
        { id: 'ccp', label: 'CCP: changes together', x: 0, y: 1, tone: 'info' },
        { id: 'crp', label: 'CRP: used together', x: 2, y: 1, tone: 'warn' }
      ],
      edges: [
        { from: 'rep', to: 'ccp', label: 'both say: bigger', both: true },
        { from: 'rep', to: 'crp', label: 'both say: bigger', both: true },
        { from: 'ccp', to: 'crp', label: 'CRP says: smaller', both: true, dashed: true }
      ],
      caption: 'REP and CCP are inclusive: they make components larger. CRP is exclusive: it makes them smaller. Every real project settles somewhere inside the triangle.' },

    { kind: 'example', title: 'The tension in action',
      body: `Take a \`payments\` component with a card processor, a refund helper and a PDF receipt printer.

        - **CCP** says keep them together: when a payment rule changes, all three usually change.
        - **CRP** says split them: the reporting team uses only the receipt printer and should not be bothered by card-processor changes.
        - **REP** says whatever you do, release each box with a version and notes.

        There is no formula that settles it. Early in a project, there are few users, so favour **CCP** (big boxes, easy to change). As more teams reuse the code, shift towards **REP and CRP** (smaller, stable boxes). The right shape moves over time.`,
      note: 'Experts accept this as a judgement call. Treat the principles as three questions to ask, not three rules to obey.' },

    { kind: 'pitfall', title: 'The dumping-ground package',
      body: `Every codebase grows one: \`common\`, \`shared\`, \`core\`, \`utils\`. It breaks all three principles at once.

        - It has no theme, so **REP** is lost: nobody can say what the package is for.
        - Unrelated things change for unrelated reasons, so **CCP** is lost.
        - Users depend on the whole lot to use one function, so **CRP** is lost.

        A dumping ground feels harmless because adding a function takes a minute. The bill arrives when every team is locked together on one release.

        The cure is to name the *theme* before adding code. If it does not fit a theme, it needs a new box, or perhaps to stay where it is.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What makes a bundle of code a "component" in this sense?',
      options: ['It is released and depended on as one versioned unit', 'It contains exactly one class', 'It runs as a separate process on a separate server', 'It was written by a single developer'],
      answer: 0,
      why: [null, 'Components can hold one class or hundreds. Size is not the test.', 'Deployment as a separate process is a different idea; a library inside one app is still a component.', 'Authorship is irrelevant to how code is packaged and released.'],
      explain: 'A component is defined by how it is shipped and depended on: as a whole, with a version. That is why drawing its boundary decides what must be upgraded together.' },

    { type: 'match', after: 5, prompt: 'Match each principle to its core idea.',
      pairs: [['REP', 'Release reusable things with versions and notes'], ['CCP', 'Group classes that change for the same reasons'], ['CRP', 'Do not force users to depend on what they do not use'], ['Component', 'A bundle released and depended on as one unit']] },

    { type: 'bucket', after: 6, prompt: 'Which principle is being ignored in each complaint?', buckets: ['REP', 'CCP', 'CRP'],
      items: [['"A tax-law change means releasing five different packages."', 1], ['"The package has no version or notes; I cannot tell what changed."', 0], ['"I only want the date formatter but I get an SMTP client too."', 2], ['"Teams copy classes out of a shared folder instead of installing them."', 0], ['"One business rule is spread over four packages."', 1], ['"I must retest every time a class I never call is updated."', 2]],
      explain: 'Ask "what hurts?". Many releases for one change points at CCP. Hauling unused code and retesting for irrelevant changes points at CRP. No versioning or reuse by copying points at REP.' },

    { type: 'tf', statement: 'The Common Closure Principle is the Single Responsibility Principle applied to components.', answer: true,
      explain: 'Both say to group things by the reason they change. SRP does it for the methods inside a class; CCP does it for the classes inside a component.' },

    { type: 'ab', q: 'Which packaging serves a team that changes tax rules several times a year?',
      a: { lang: 'text', label: 'Spread out', src: `
        tax-rules      (rules only)
        tax-rates      (rate tables)
        tax-reports    (reports)` },
      b: { lang: 'text', label: 'Together', src: `
        tax            (rules, rates, reports)` },
      answer: 'b',
      explain: 'These three change for the same reason, so a single box means a single release when the law moves. It is the Common Closure Principle at work.' },

    { type: 'spot', prompt: 'This package contains everything a project “might need”. Someone only wants to format dates. Tap the line holding the dependency that is most obviously unrelated: sending email.',
      code: { lang: 'text', src: `
        package "common" v4.2
          DateFormatter
          MoneyFormatter
          SmtpClient
          PdfRenderer
          ImageResizer` },
      lines: [4],
      explain: 'The date formatter shares a box with an email client, a PDF renderer and an image resizer, none of which it needs. Any change to those forces the dashboard team to upgrade and retest.' },

    { type: 'cloze', text: 'REP and CCP tend to make components {{larger}}, while CRP tends to make them {{smaller}}. This pull between them is called the {{tension}} between the principles.',
      distractors: ['faster', 'private', 'identical'],
      explain: 'REP and CCP are inclusive (they gather things in), CRP is exclusive (it keeps unneeded things out). Settling between them is a judgement call that shifts as a project matures.' },

    { type: 'scenario', title: 'Splitting the toolkit', intro: 'You are the new tech lead. Four teams depend on a package called `toolkit`. It holds date helpers, a payment client, receipt printing and logging. Everyone dreads upgrading it.',
      meters: { 'upgrade pain': 85, 'team goodwill': 50 },
      steps: [
        { text: 'First, you want to know where it hurts. Which fact would you look for?',
          choices: [
            { label: 'Which classes change together, and which teams use which classes.', score: 2, effects: { 'upgrade pain': -5, 'team goodwill': 10 }, feedback: 'These two facts are what the principles rest on: what changes together (CCP) and what gets used together (CRP). Without them any split is guesswork.' },
            { label: 'How many lines of code each class has.', score: 0, effects: { 'team goodwill': -5 }, feedback: 'Size says nothing about what ships together. A ten-line class can be the one every team needs, and a thousand-line one could be used by nobody.' },
            { label: 'Who wrote the oldest code.', score: 1, effects: {}, feedback: 'Interesting history, but the boxes should follow change and usage, not authorship.' }
          ] },
        { text: 'You find payments and receipts always change together, but only the finance team uses them. Date helpers and logging are used by all four teams and rarely change. What do you do?',
          choices: [
            { label: 'Split into a small stable `foundation` package and a `payments` package holding payments and receipts, each versioned.', score: 2, effects: { 'upgrade pain': -50, 'team goodwill': 20 }, feedback: 'Payments and receipts stay together (CCP), the other teams stop carrying them (CRP) and each box has a version and notes (REP).' },
            { label: 'Leave it as one package, but promise to be more careful.', score: 0, effects: { 'upgrade pain': 5, 'team goodwill': -15 }, feedback: 'Care does not change what a version bump forces on four teams. The structure is the problem.' },
            { label: 'Split every class into its own package.', score: 1, effects: { 'upgrade pain': -10, 'team goodwill': -15 }, feedback: 'Now you have forty boxes to version and the payment classes that change together are in separate releases. Over-splitting breaks CCP.' }
          ] }
      ],
      outro: 'The pattern to remember: **look at what changes together and what is used together, then draw the boxes around that.**' },

    { type: 'explain', prompt: 'Explain the tension between the Common Closure Principle and the Common Reuse Principle, with an example.',
      model: 'CCP says to keep classes that change together in one component so a change means one release. CRP says to keep unneeded classes out of a component so users are not forced to upgrade for changes they do not use. They pull in opposite directions: a payments package that changes together may include a receipt printer that only one team uses. You balance them by how many users there are and how often things change.',
      keywords: ['change together', 'release', 'used together', 'bigger', 'smaller', 'balance'] }
  ],

  flashcards: [
    { q: 'What is a component in architecture?', a: 'A bundle of code released and depended on as a single versioned unit, such as a package, library, JAR or DLL.' },
    { q: 'What does REP say?', a: 'Reuse/Release Equivalence: the unit of reuse is the unit of release, so reusable things need versions, release notes and a coherent theme.' },
    { q: 'What does CCP say?', a: 'Common Closure: put classes that change for the same reasons and at the same time into the same component.' },
    { q: 'What does CRP say?', a: 'Common Reuse: do not force users of a component to depend on things they do not need. Classes used together belong together.' },
    { q: 'Why can you not satisfy REP, CCP and CRP all at once?', a: 'REP and CCP push components to be larger, CRP pushes them to be smaller. You settle between them, and the balance shifts as a project matures.' }
  ],

  glossary: [
    { term: 'Component', def: 'A bundle of code released and depended on as one unit with a version number, such as a package or library.', like: 'One flat-pack box of furniture parts.' },
    { term: 'Reuse/Release Equivalence Principle', def: 'The unit you reuse must be the unit you release: versioned, documented and coherent.', aka: ['REP'], like: 'Selling a product with a label and a version, not handing round a tub of loose parts.' },
    { term: 'Common Closure Principle', def: 'Classes that change for the same reasons and at the same time belong in the same component.', aka: ['CCP'], like: 'Keeping all the plumbing parts in one drawer.' },
    { term: 'Common Reuse Principle', def: 'Classes that are reused together belong together, and users should not depend on what they do not use.', aka: ['CRP'], like: 'Not selling a hammer only as part of a full toolbox.' }
  ],

  takeaways: [
    'A **component** is code released as one versioned unit; its boundary is a real decision.',
    '**REP**: release what you reuse. **CCP**: group what changes together. **CRP**: do not bundle what is not used together.',
    'REP and CCP make boxes **bigger**; CRP makes them **smaller**.',
    'Early on favour CCP; as reuse grows, shift towards REP and CRP.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ap-component-coupling', {
  eli5: 'These rules say which software boxes may depend on which: no circles of dependency, depend on boxes that are harder to change than you, and make the hard-to-change boxes abstract.',

  cards: [
    { kind: 'story', title: 'The build that cannot decide where to start',
      body: `Three teams own three components: **Orders**, **Billing** and **Customers**. Orders uses Billing. Billing uses Customers. And one afternoon someone makes Customers call a function in Orders, "just this once".

        Now Orders needs Billing, which needs Customers, which needs Orders. Which do you build first? None of them. You cannot compile, test or release any one without the other two.

        A developer calls it "the morning-after syndrome": you go home with everything working, and a colleague changes something upstream, and in the morning your part has stopped working.

        This lesson is about the rules that keep dependencies tidy.` },

    { kind: 'concept', title: 'ADP: no cycles',
      body: `The **Acyclic Dependencies Principle** (ADP) is blunt: *the graph of dependencies between components must have no cycles.*

        A **cycle** means you can follow the arrows and end up back where you started: A → B → C → A.

        Why does it matter? In a cycle, a change to *any* member can affect *every* member. So they all have to be built, tested and released **together**. They behave like one giant component with no clear boundaries.

        With no cycles, you can always find an order to build in (start with those that depend on nothing), test each box in isolation, and release each one without dragging the others.` },

    { kind: 'diagram', title: 'A cycle, and the same system without one',
      body: 'The loop at the top is the problem. The fix is to break one arrow.',
      nodes: [
        { id: 'o', label: 'Orders', x: 1, y: 0 },
        { id: 'b', label: 'Billing', x: 2, y: 1 },
        { id: 'c', label: 'Customers', x: 0, y: 1, tone: 'bad' }
      ],
      edges: [
        { from: 'o', to: 'b', label: 'uses' },
        { from: 'b', to: 'c', label: 'uses' },
        { from: 'c', to: 'o', label: 'calls back', tone: 'bad' }
      ],
      caption: 'Customers calling back into Orders closes the loop. Remove that arrow (we will see how) and Customers can be built, tested and released first.' },

    { kind: 'steps', title: 'Two ways to break a cycle',
      body: 'Say Customers needs to tell Orders when a customer is deleted. You cannot just delete the arrow, because the need is real.',
      steps: [
        { title: 'Option 1: invert the dependency', body: 'Customers defines a small **interface**, `CustomerListener`, and calls *that*. Orders implements it. The arrow now points from Orders to Customers, and the loop is gone. This is the **Dependency Inversion Principle** at component scale.' },
        { title: 'Option 2: extract a new component', body: 'Move what both sides need into a third component that **both depend on**, say `CustomerEvents`. Now Orders and Customers each point at it, and nothing points back.' },
        { title: 'Check the result', body: 'Draw the arrows again. If you can start from any box and never get back to it, the cycle is broken.' },
        { title: 'Make it stay broken', body: 'Cycles creep back one "just this once" import at a time. Many build tools can fail the build if one appears, which is worth switching on.' }
      ] },

    { kind: 'code', title: 'Breaking the cycle with an interface',
      body: 'The interface lives with the **caller** (Customers), so Customers no longer knows about Orders at all. **Tap the lines.**',
      code: { lang: 'js', src: `
        // customers component: owns the interface
        class Customers {
          constructor(listener) { this.listener = listener; }
          remove(id) {
            // …delete from storage…
            this.listener.customerRemoved(id);
          }
        }

        // orders component: depends on Customers, supplies the listener
        class OrderCleanup {
          customerRemoved(id) { /* cancel open orders for id */ }
        }

        const customers = new Customers(new OrderCleanup());`,
        notes: {
          3: 'Customers receives *something that can listen*. It does not know or care that the listener belongs to Orders.',
          6: 'The call goes to whatever was passed in. The arrow from Customers to Orders is now an arrow to an interface that Customers itself owns.',
          11: 'Orders now depends on Customers (it supplies the listener), so the arrow points the right way: Orders → Customers.',
          15: 'Wiring happens at the edge. In a real system a small start-up piece does this so neither component has to.'
        } } },

    { kind: 'concept', title: 'SDP: depend in the direction of stability',
      body: `Some components are easy to change and some are hard. **Stable** here means *hard to change*, and the usual reason is that **lots of other things depend on it**: change it and you upset them all.

        A rough way to see it is to count arrows: **many arrows in and few out** = stable. **Few in and many out** = unstable (free to change, because nobody relies on it).

        The **Stable Dependencies Principle** (SDP) says: *depend on things that are more stable than you.*

        In other words, a component that you expect to change often should not be depended on by many others. Otherwise you have built a trap: the thing you need to change is the thing everybody leans on.` },

    { kind: 'metaphor', title: 'Foundations and tents',
      body: `A building is sensible when heavy things rest on **foundations**, and light things such as awnings and signs hang off the building.

        Reverse it, and you have a foundation that must be moved whenever a shop changes its sign. Nobody builds that way, but software does it all the time: a stable core (used by everything) accidentally depends on a volatile part (a screen, a report format).

        The result: every time the volatile thing changes, the supposedly stable core must change, and then everything that depends on the core is rattled too.

        SDP says: **tents may rest on foundations; never the other way round.**` },

    { kind: 'concept', title: 'SAP: stable things should be abstract',
      body: `Here is a puzzle. A stable component is hard to change. If it is made of *concrete* code, with real logic and fixed behaviour, then it is hard to change **and** hard to extend. It becomes a fossil.

        The **Stable Abstractions Principle** (SAP) fixes that: *the more stable a component is, the more abstract it should be.*

        An **abstract** component is mostly interfaces and rules. Many things depend on those promises, which rarely change, while the **concrete** behaviour behind them lives in other, less stable components that can be replaced freely.

        So stable components should be like a **plug standard**: simple, abstract and dull. Behaviour belongs in the appliances.` },

    { kind: 'compare', title: 'The main sequence, in plain English',
      body: 'Plot components on two axes: how **stable** and how **abstract**. Healthy ones sit along the diagonal, called the **main sequence**.',
      cols: ['Stable (many depend on it)', 'Unstable (few depend on it)'],
      rows: [
        ['**Abstract**', 'Healthy: interfaces everyone relies on', 'Zone of uselessness: abstractions nobody uses'],
        ['**Concrete**', 'Zone of pain: rigid code everyone leans on', 'Healthy: volatile details nobody depends on']
      ],
      note: 'The zone of pain holds things like a widely used concrete utility class or a shared database schema: painful to change, impossible to avoid. Some are unavoidable (a string library is concrete and stable, but also never changes, so it hurts no one).' },

    { kind: 'tip', title: 'Use the rules as smell detectors',
      body: `You do not need to calculate scores for every package. Use these questions on any dependency diagram:

        1. **Any cycles?** (ADP) Break them.
        2. **Does a box that changes often have many arrows pointing at it?** (SDP) Reduce what depends on it.
        3. **Is a box everyone depends on full of concrete logic?** (SAP) Pull the interfaces out.

        Some tools can compute the numbers for you, and they are a fine way to find hotspots. But the diagram on a whiteboard answers most of these questions in a minute.`,
      note: 'These are guidelines from Robert C. Martin’s writing on component design, widely taught but not laws. Teams apply them with judgement.' }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Why is a dependency cycle between components a problem?',
      options: ['Every member of the cycle must be built, tested and released together', 'Cycles make the program run slower at run time', 'Cycles are not allowed by most programming languages', 'It means the components are too small'],
      answer: 0,
      why: [null, 'Speed is not the issue; the problem is how the components can be developed and released.', 'Many languages allow cycles perfectly happily, which is why the rule is needed.', 'Size has nothing to do with it.'],
      explain: 'In a cycle a change to any member can affect all of them, so they cannot be treated as separate boxes. They behave as one oversized component with no clear boundary.' },

    { type: 'order', after: 4, prompt: 'Put the steps of breaking a cycle with dependency inversion in order.',
      items: ['Spot the arrow that closes the loop', 'Define an interface owned by the calling component', 'Have the other component implement that interface', 'Wire the two together at start-up', 'Draw the arrows again and check for loops'],
      explain: 'First find the offending arrow, then create the interface where the call is made, implement it on the far side and join them at the edge. Checking the diagram last proves the loop is gone.' },

    { type: 'tf', after: 5, statement: 'In this context, a “stable” component is one that is hard to change because many others depend on it.', answer: true,
      explain: 'Stable here means hard to change, usually because many components depend on it. A stable component can still be buggy; it is just costly to alter.' },

    { type: 'bucket', after: 8, prompt: 'Which part of the main sequence does each component sit in?', buckets: ['Healthy: abstract and stable', 'Healthy: concrete and unstable', 'Zone of pain', 'Zone of uselessness'],
      items: [['A set of interfaces that fifty services implement', 0], ['A UI screen that nothing else imports', 1], ['A concrete shared class with fixed logic that everyone calls', 2], ['An interface-only package that nothing implements or uses', 3], ['A report generator used by one team', 1], ['A hard-coded shared database schema used by dozens of apps', 2]],
      explain: 'Stable and concrete is painful because it is hard to change and hard to extend. Unstable and abstract is useless because nothing relies on it. The sensible places are stable-abstract and unstable-concrete.' },

    { type: 'spot', prompt: 'Each line says "X imports Y". Tap the line that creates a cycle.',
      code: { lang: 'text', src: `
        web      imports orders
        orders   imports billing
        billing  imports customers
        customers imports orders
        orders   imports logging` },
      lines: [4],
      explain: 'Line 4 makes customers import orders, while orders already reaches customers through billing. That closes the loop orders → billing → customers → orders.' },

    { type: 'ab', q: 'Which is the healthier dependency?',
      a: { lang: 'text', label: 'Core on a screen', src: `
        core-rules  imports  checkout-screen` },
      b: { lang: 'text', label: 'Screen on the core', src: `
        checkout-screen  imports  core-rules` },
      answer: 'b',
      explain: 'The screen changes often and nobody depends on it, so it is unstable. The core is stable. Depending in the direction of stability (screen on core) is the Stable Dependencies Principle.' },

    { type: 'match', prompt: 'Match each principle to what it says.',
      pairs: [['ADP', 'No cycles in the dependency graph'], ['SDP', 'Depend on things more stable than you'], ['SAP', 'The more stable, the more abstract'], ['Main sequence', 'The ideal balance of stability and abstraction']] },

    { type: 'scenario', title: 'The rigid pricing package', intro: 'Your company has a `pricing` package used by checkout, invoices, reports, the mobile app and three partner integrations. It is full of concrete rules, and every change needs a month of coordination.',
      meters: { 'change speed': 20, 'risk': 70 },
      steps: [
        { text: 'Which diagnosis best explains the pain?',
          choices: [
            { label: 'It is stable (many depend on it) but concrete, so it is stuck in the zone of pain.', score: 2, effects: { 'change speed': 5 }, feedback: 'Exactly: many arrows in, lots of logic inside. That is the combination SAP warns about.' },
            { label: 'It has too many files.', score: 0, effects: {}, feedback: 'File count is not the cause. Seven things depending on rigid concrete rules is.' },
            { label: 'The package is unstable and needs more tests.', score: 1, effects: { risk: -5 }, feedback: 'More tests help, but the package is the opposite of unstable: so many depend on it that every change is a negotiation.' }
          ] },
        { text: 'What is the best way forward?',
          choices: [
            { label: 'Extract an abstract `PricingPolicy` interface everyone depends on, and move rules into replaceable implementations.', score: 2, effects: { 'change speed': 50, risk: -35 }, feedback: 'The stable thing becomes a small, dull promise. The volatile rules sit behind it where few things depend on them, so they can change freely.' },
            { label: 'Freeze it and forbid changes.', score: 0, effects: { 'change speed': -15, risk: 10 }, feedback: 'Pricing rules change with the business. A frozen package just moves the changes into workarounds in every caller.' },
            { label: 'Let each team copy the package so they can change their own version.', score: 1, effects: { 'change speed': 20, risk: 25 }, feedback: 'Changes become easy, but now prices can differ between invoices and checkout. You have swapped one problem for a worse one.' }
          ] }
      ],
      outro: 'The pattern to remember: **keep what everyone depends on small and abstract, and let the changeable behaviour live behind it.**' },

    { type: 'explain', prompt: 'Explain to a colleague why a dependency cycle between components is a problem, and name one way to break it.',
      model: 'In a cycle, A depends on B, B on C and C on A, so a change to any of them can affect all the others. They must be built, tested and released together, so they behave as one giant component. You break a cycle by dependency inversion: the calling component defines an interface and the other implements it, so the arrow flips. You can also extract the shared part into a new component that both depend on.',
      keywords: ['cycle', 'released together', 'interface', 'dependency inversion', 'new component', 'build'] }
  ],

  flashcards: [
    { q: 'What does the Acyclic Dependencies Principle say?', a: 'The dependency graph between components must contain no cycles.' },
    { q: 'Name two ways to break a dependency cycle.', a: 'Invert one dependency using an interface owned by the caller, or extract the shared part into a new component that both depend on.' },
    { q: 'What does "stable" mean for a component?', a: 'Hard to change, usually because many other components depend on it. It is not about being bug-free.' },
    { q: 'What does the Stable Dependencies Principle say?', a: 'Depend in the direction of stability: components should depend on those that are more stable than themselves.' },
    { q: 'What does the Stable Abstractions Principle say, and what is the main sequence?', a: 'The more stable a component, the more abstract it should be. The main sequence is the diagonal of healthy balance between stability and abstractness.' }
  ],

  glossary: [
    { term: 'Acyclic Dependencies Principle', def: 'The rule that components may not depend on each other in a loop.', aka: ['ADP'], like: 'A recipe where step 2 needs the result of step 5.' },
    { term: 'Dependency cycle', def: 'A loop of dependencies where following the arrows brings you back to the start.', like: 'Two people each waiting for the other to speak first.' },
    { term: 'Stable component', def: 'A component that is hard to change, usually because many others depend on it.', like: 'A bridge that every road leads to.' },
    { term: 'Stable Abstractions Principle', def: 'The more stable a component is, the more abstract it should be, so it stays easy to extend.', aka: ['SAP'], like: 'A standard plug shape: stable because it is simple and abstract.' },
    { term: 'Main sequence', def: 'The diagonal line on a chart of stability against abstractness where healthy components tend to sit.', like: 'A well-balanced seesaw.' }
  ],

  takeaways: [
    '**ADP**: no cycles; break them with an interface or a new shared component.',
    '**SDP**: depend on things more stable (harder to change) than you.',
    '**SAP**: the more stable, the more abstract.',
    'Avoid the **zone of pain** (stable and concrete) and the zone of uselessness.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ap-policy-detail', {
  eli5: 'The rules of your business are the valuable part of a program, while the database, the web framework and the screens are just tools, so keep the rules free of the tools and the tools easy to swap.',

  cards: [
    { kind: 'story', title: 'The discount rule that lived in fourteen places',
      body: `A small online shop decided that orders over £50 ship free. Simple. A developer went to change the threshold to £40 for a sale and found the rule in the web page, in two SQL queries, in a stored procedure inside the database and in the invoice template.

        Fourteen places. They found twelve. The shop spent a weekend shipping some parcels for free and charging for others, depending on which route the customer had taken.

        The rule was the whole point of the business logic, but it had been smeared across the tools used to build the app. This lesson is about keeping the **valuable part separate from the tools**.` },

    { kind: 'concept', title: 'Policy: the rules your business exists to run',
      body: `**Policy** means the business rules: the things that would be true even if you ran the business with paper and a calculator.

        - "Orders over £50 ship free."
        - "A customer may borrow five books at once."
        - "Refunds are allowed within 30 days."

        Policy is the *reason* the software exists. It is usually small, valuable and stable compared with the technology around it, and domain experts (not programmers) are the ones who can say whether it is right.

        If you removed every database, web page and server, the policy would still be a sentence on a page. That is a good test for what counts.` },

    { kind: 'compare', title: 'Policy and detail, side by side',
      body: 'Everything else is a **detail**: a tool that carries the policy out into the world.',
      cols: ['Policy', 'Detail'],
      rows: [
        ['Examples', 'Free shipping over £50; refund rules; late fees', 'The database, the web framework, the screens, the email service'],
        ['Changes when', 'The business changes its mind', 'A better tool arrives, or a vendor changes'],
        ['Who knows best', 'Domain experts, owners', 'Engineers'],
        ['If it breaks', 'The business does the wrong thing', 'The business does the right thing, slowly or in the wrong format']
      ],
      note: 'Detail does not mean unimportant. A database choice can make or break performance. It means the policy should not *depend* on it.' },

    { kind: 'metaphor', title: 'The chess set',
      body: `The rules of chess are the **policy**. A knight moves in an L. The king cannot move into check.

        The board and pieces are **details**. Plastic, wood or a phone app: the game is the same, and nobody thinks that switching to a nicer board changes the rules.

        Imagine a chess game where the rules were carved into one specific wooden board. To play on a travel set you would have to rewrite the rules.

        That is what happens when business rules live inside a framework or database. Where the metaphor stops: a chess set never changes the game, but a real database does affect speed and cost, so details still matter, just not to the rules.` },

    { kind: 'code', title: 'Before: the rule is tangled in the tools',
      body: 'A web handler where the business rule, the web framework and the database are all mixed. **Tap the lines.**',
      code: { lang: 'js', src: `
        app.post('/orders', async (req, res) => {
          const items = req.body.items;
          const total = items.reduce((s, i) => s + i.price * i.qty, 0);
          const shipping = total >= 50 ? 0 : 4.99;
          await db.query(
            'INSERT INTO orders (total, shipping) VALUES ($1, $2)',
            [total, shipping]);
          res.status(201).json({ total, shipping });
        });`,
        notes: {
          1: 'Detail: the web framework. Routes, requests and responses.',
          4: '**Policy**: free shipping over £50. It is the most valuable line here and the hardest to find.',
          5: 'Detail: SQL for one particular database.',
          8: 'Detail: how the answer is sent back over HTTP.'
        } } },

    { kind: 'code', title: 'After: the rule stands alone',
      body: 'The rule becomes a plain function that knows nothing about HTTP or SQL. The details become thin wrappers around it.',
      code: { lang: 'js', src: `
        // policy: no web, no database
        function priceOrder(items) {
          const total = items.reduce((s, i) => s + i.price * i.qty, 0);
          const shipping = total >= 50 ? 0 : 4.99;
          return { total, shipping };
        }

        // detail: a thin wrapper
        app.post('/orders', async (req, res) => {
          const order = priceOrder(req.body.items);
          await orderStore.save(order);
          res.status(201).json(order);
        });`,
        notes: {
          2: 'You can run this in a test with a list of items and no server. The sale threshold now lives in exactly one place.',
          10: 'The handler only translates: take the request, call the policy, hand the result to storage.',
          11: '`orderStore` is a small interface. Behind it could be Postgres today, a different database next year, or a plain in-memory list in tests.'
        } } },

    { kind: 'diagram', title: 'Details plug into the policy',
      body: 'The policy sits in the middle and does not know which tools surround it. The tools know about the policy.',
      nodes: [
        { id: 'web', label: 'Web screens', icon: '🖥️', x: 0, y: 0 },
        { id: 'pg', label: 'Postgres store', icon: '🗄️', x: 2, y: 0 },
        { id: 'mem', label: 'In-memory store (tests)', x: 3, y: 0, tone: 'muted' },
        { id: 'rules', label: 'Business rules', icon: '📜', x: 1, y: 1, tone: 'accent' }
      ],
      edges: [
        { from: 'web', to: 'rules', label: 'calls' },
        { from: 'pg', to: 'rules', label: 'implements OrderStore' },
        { from: 'mem', to: 'rules', label: 'implements OrderStore', dashed: true }
      ],
      groups: [{ label: 'Details', x: 0, y: 0, w: 4, h: 1 }],
      caption: 'Arrows show who depends on whom. Every detail points at the rules; the rules point at no detail.' },

    { kind: 'concept', title: 'Deferring decisions',
      body: `If details can be swapped, you do not have to choose them **early**. That is a quiet superpower.

        Early in a project you know least. Which database? Which queue? Which web framework? Pick too soon and you are guessing. But if the rules run happily against an in-memory list, you can write them, test them, show them to the owner, and pick the database **when you know the real access patterns**.

        This is not procrastination. It means keeping options open for decisions that are expensive to reverse, until the facts arrive.

        Some teams run a first release entirely on files or in memory, and never regret it.` },

    { kind: 'pitfall', title: 'Do not wrap everything in sight',
      body: `Taking this to extremes wastes effort. Hide every library behind your own interface and you will own a thousand lines of wrappers that nobody asked for, and the "swap" you built them for never comes.

        Be selective. Protect the policy from details that are **likely to change**, **expensive to test**, or **owned by someone else** (a payment provider, an email service).

        And be honest about frameworks: some teams reasonably choose to build *with* their framework's conventions and accept the coupling for speed. Experts argue about this. The principle is not "never touch a framework" but "**know what you have tied your rules to**".` },

    { kind: 'tip', title: 'The simplest test of all',
      body: `Can you run your business rules **in a test, with no database, no web server and no network**?

        If yes, the policy is independent of its details, and your tests will be fast and reliable.

        If a test for "free shipping over £50" needs a running database, a web server and a test account, the rule is welded to its tools.

        Use this as a regular check. When it starts to fail, a detail has crept inside the policy. Pull it back out while it is cheap.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Which of these is a piece of policy rather than a detail?',
      options: ['“Members get free delivery on orders over £30”', 'The choice to store orders in PostgreSQL', 'The CSS used on the checkout page', 'The web framework used for the routes'],
      answer: 0,
      why: [null, 'A database is a tool for storing the answers, not a rule of the business.', 'Styling is how things look, a detail.', 'Frameworks are tools. Policy would survive swapping them.'],
      explain: 'A business rule is something that would be true on paper, with no software at all. The database, styles and framework are details that carry the rule out.' },

    { type: 'bucket', after: 2, prompt: 'Policy or detail?', buckets: ['Policy', 'Detail'],
      items: [['A refund is allowed within 30 days', 0], ['The ORM library the app uses', 1], ['A member may borrow five books at once', 0], ['The JSON format of the API response', 1], ['A late fee is 20p per day', 0], ['Which cloud provider hosts the servers', 1]],
      explain: 'Policy is what the business decides; detail is how the software happens to deliver it. The test is: would it still be true if you ran the business on paper?' },

    { type: 'spot', after: 5, prompt: 'This UI code hides a business rule. Tap the line where the policy is buried in a detail.',
      code: { lang: 'js', src: `
        function CartPage(items) {
          const total = items.reduce((s, i) => s + i.price, 0);
          const discount = total > 100 ? total * 0.1 : 0;
          return '<p>Total: £' + (total - discount) + '</p>';
        }` },
      lines: [3],
      explain: 'The 10% discount over £100 is a business rule, but it sits inside the page-building code. The invoice and the mobile app will need their own copy, and the copies will drift.' },

    { type: 'ab', q: 'Which version keeps the policy independent of its details?',
      a: { lang: 'js', label: 'Rule inside', src: `
        async function approve(loanId) {
          const row = await db.query(
            'SELECT amount FROM loans WHERE id=$1', [loanId]);
          if (row.amount > 10000) return 'manual review';
          return 'approved';
        }` },
      b: { lang: 'js', label: 'Rule apart', src: `
        function decide(amount) {
          if (amount > 10000) return 'manual review';
          return 'approved';
        }
        async function approve(loanId) {
          const row = await db.query(
            'SELECT amount FROM loans WHERE id=$1', [loanId]);
          return decide(row.amount);
        }` },
      answer: 'b',
      explain: 'The decision about when a loan needs review is now a plain function that can be tested with a number. The database access is a separate, replaceable step around it.' },

    { type: 'tf', after: 7, statement: 'Deferring a database decision means ignoring performance until after launch.', answer: false,
      explain: 'Deferring means making the choice when you have real information, while keeping the rules independent so a later choice is cheap. Performance still matters; it is just decided with evidence.' },

    { type: 'cloze', text: 'Business rules are called {{policy}}. Databases, frameworks and user interfaces are called {{details}}. Keeping rules independent lets you {{defer}} expensive decisions until you know more.',
      distractors: ['patterns', 'defaults', 'replicate'],
      explain: 'Policy is the valuable, stable part. Details are replaceable tools. Because the rules do not depend on the tools, the choice of tools can wait.' },

    { type: 'scenario', title: 'Pick the database now?', intro: 'You are starting a ticketing product. The founder wants a database chosen by Friday so “we can start building”. Nobody yet knows how people will search or how big it will be.',
      meters: { 'rework risk': 60, 'momentum': 50 },
      steps: [
        { text: 'The team splits on the answer. What do you propose?',
          choices: [
            { label: 'Write the ticket rules first against a simple storage interface, with an in-memory version, and pick the real database after the first demo.', score: 2, effects: { 'rework risk': -25, momentum: 25 }, feedback: 'You get moving on the part you do understand, and learn what the storage needs to do before committing. The rules do not change when the database does.' },
            { label: 'Choose the most popular database today, and put queries wherever convenient.', score: 1, effects: { 'rework risk': 15, momentum: 15 }, feedback: 'A popular choice is not bad. Scattering queries through the rules is. Changing course later would mean rewriting the rules too.' },
            { label: 'Hold a month of research before writing any code.', score: 0, effects: { 'rework risk': -5, momentum: -30 }, feedback: 'Research without real use makes it easy to be confidently wrong. Building rules against a stand-in teaches far more.' }
          ] },
        { text: 'After the demo, you learn most searches are by event name and date range, with heavy reads. How do you decide now?',
          choices: [
            { label: 'Choose the database for those access patterns, and write one new storage implementation behind the same interface.', score: 2, effects: { 'rework risk': -20, momentum: 15 }, feedback: 'The decision now rests on evidence, and the rules are untouched. This is what deferring buys you.' },
            { label: 'Keep the in-memory version in production because it works.', score: 0, effects: { 'rework risk': 30 }, feedback: 'It was a stand-in for early work. Data would vanish on every restart.' },
            { label: 'Rewrite the rules to suit the database you chose.', score: 0, effects: { 'rework risk': 25, momentum: -20 }, feedback: 'The rules have not changed, so there is no reason to touch them. The whole point is that only the storage piece changes.' }
          ] }
      ],
      outro: 'The pattern to remember: **keep the rules independent, then choose the tools when you have evidence.**' },

    { type: 'short', q: 'What do we call the business rules at the heart of a system, as opposed to the tools that carry them out?', accept: ['policy', 'policies'], hint: 'Six letters. Governments make it too.',
      explain: 'Policy is the business rules. Databases, frameworks and screens are details that serve it.' },

    { type: 'explain', prompt: 'Explain the difference between policy and detail, and why keeping them apart helps.',
      model: 'Policy is the set of business rules the software exists to carry out, such as free shipping over £50. Details are tools like the database, web framework and user interface. If rules are mixed into the tools, a change to a rule means hunting through many places, and swapping a tool means rewriting the rules. Keeping them apart lets you test rules without a database and defer choosing tools until you know more.',
      keywords: ['business rules', 'tools', 'database', 'framework', 'test', 'swap', 'defer'] }
  ],

  flashcards: [
    { q: 'What is policy in this sense?', a: 'The business rules the software exists to carry out. They would still be true if you ran the business on paper.' },
    { q: 'What counts as a detail?', a: 'The tools that carry policy out: databases, frameworks, user interfaces, external services.' },
    { q: 'Why keep details replaceable?', a: 'So rules can be tested without the tools, tools can be swapped cheaply, and you can defer expensive choices until you have evidence.' },
    { q: 'What is a quick test of independence?', a: 'Can you run the business rules in a test with no database, web server or network?' },
    { q: 'What is the risk of wrapping every library?', a: 'Lots of unneeded indirection. Protect the policy only from details likely to change, hard to test or owned by someone else.' }
  ],

  glossary: [
    { term: 'Policy', def: 'The business rules a system exists to carry out, which would still be true with no software at all.', aka: ['business rules'], like: 'The rules of chess.' },
    { term: 'Detail', def: 'A tool that carries policy out in the world, such as a database, a web framework or a user interface.', like: 'The chess board and pieces.' },
    { term: 'Deferring a decision', def: 'Postponing a hard-to-reverse technical choice until you have real information, while keeping the rules independent so the choice stays cheap.', like: 'Hiring a removal van only after you know how many boxes there are.' }
  ],

  takeaways: [
    '**Policy** (business rules) is the valuable part; **details** (databases, frameworks, UIs) are tools.',
    'Keep rules in one place, **free of the tools** that run them.',
    'Replaceable details let you **defer** expensive decisions until you have evidence.',
    'Test: can the rules run with no database, web server or network?'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ap-boundaries', {
  eli5: 'A boundary is a line you draw between parts that change for different reasons, with a small agreed doorway through it, so a change on one side does not leak to the other.',

  cards: [
    { kind: 'story', title: 'Sixty places that know the email provider',
      body: `A company sends emails through one provider. One day the provider doubles its prices, and the team decides to move.

        They search the codebase for the provider's name and find it in **sixty places**: order confirmations, password resets, invoices. Each calls the provider's library directly, uses its message format and handles its particular errors.

        What should have been a one-week job turns into a six-week project, because the provider was not a detail sitting behind a door. It was *everywhere*.

        A **boundary** is how you stop that happening: one door, in one place.` },

    { kind: 'concept', title: 'A boundary separates things that change for different reasons',
      body: `A **boundary** is a line in your code with two sides, and a **small, defined way across**.

        Where do you draw it? Between things that change **for different reasons** or **at different speeds**:

        - business rules vs the database they use
        - your code vs a third party's service
        - the web screens vs the logic behind them

        The aim is that when something on one side changes, nothing on the other side needs to know. You are shrinking the blast radius of change, from the coupling lesson, by deliberately placing a wall.

        Boundaries are drawn **to protect the valuable, stable parts** from the volatile ones.` },

    { kind: 'metaphor', title: 'The serving hatch',
      body: `In a restaurant, diners sit in the dining room and cooks work in the kitchen. Between them is a **serving hatch**.

        Diners do not know whether the stove is gas or electric, or whether a new chef has started. Cooks do not know who is sitting at table six. They only share the **hatch and the order slips**.

        You can rebuild the kitchen over a weekend without redecorating the dining room.

        A software boundary is that hatch: a narrow, agreed point where **plates (data)** pass through. Where the metaphor stops: a hatch is physical and obvious. In code, a boundary is only as strong as the discipline of the people using it, which is why it needs checking.` },

    { kind: 'concept', title: 'The dependency rule',
      body: `Across a boundary, which side should know about the other? The **dependency rule** answers: *source-code dependencies point inwards, towards the business rules.*

        Details (web, database, email) may know about the policy. The policy must **never** know about the details.

        But hang on: the policy needs to *save* an order, so surely it has to call the database? Here dependency inversion helps. The policy owns a small interface, \`OrderStore\`, and calls *that*. The database code **implements** it.

        The call flows outwards at run time, but the **source-code dependency points inwards**. The policy's code never mentions SQL.` },

    { kind: 'diagram', title: 'Crossing the line without looking back',
      body: 'Everything on the left depends on the inner circle. Nothing in the policy names anything on the left.',
      nodes: [
        { id: 'web', label: 'Web controller', icon: '🖥️', x: 0, y: 0 },
        { id: 'mail', label: 'Email adapter', icon: '✉️', x: 1, y: 0 },
        { id: 'db', label: 'Database adapter', icon: '🗄️', x: 2, y: 0 },
        { id: 'port', label: 'Interfaces the policy owns', x: 1, y: 1, tone: 'info' },
        { id: 'rules', label: 'Business rules', icon: '📜', x: 1, y: 2, tone: 'accent' }
      ],
      edges: [
        { from: 'web', to: 'rules', label: 'calls' },
        { from: 'mail', to: 'port', label: 'implements' },
        { from: 'db', to: 'port', label: 'implements' },
        { from: 'rules', to: 'port', label: 'uses', dashed: true }
      ],
      groups: [{ label: 'Details (outer)', x: 0, y: 0, w: 3, h: 1 }, { label: 'Policy (inner)', x: 1, y: 1, w: 1, h: 2 }],
      caption: 'Later modules call this shape “hexagonal” or “clean” architecture. Here, the idea is simply: arrows point inwards.' },

    { kind: 'code', title: 'A boundary in code',
      body: 'The policy defines what it needs; an adapter supplies it. **Tap the lines.**',
      code: { lang: 'js', src: `
        // inside: the policy owns this contract
        class ReceiptSender {
          send(customerId, text) { throw new Error('not implemented'); }
        }

        // inside: the policy uses the contract only
        function completeOrder(order, sender) {
          sender.send(order.customerId, 'Thanks for your order');
        }

        // outside: an adapter for one provider
        class AcmeMailSender extends ReceiptSender {
          send(customerId, text) { /* call Acme's library here */ }
        }`,
        notes: {
          2: 'The contract says *what* the policy needs ("send this text to that customer") and nothing about Acme, SMTP or HTML emails.',
          8: 'The policy depends only on the contract. Swap the provider tomorrow and this function does not change.',
          12: 'The provider’s library appears in exactly one class. Moving provider means writing one new adapter.'
        } } },

    { kind: 'realworld', title: 'Plug-in architecture',
      body: `Push the idea to its limit and you get a **plug-in architecture**: a small stable **core** that knows nothing about the extras, and a set of **plug-ins** that attach through a defined doorway.

        You use these daily. A **code editor** has a core plus extensions. A **web browser** has a core plus add-ons. **WordPress** has a core plus plug-ins and themes.

        The core does not mention any plug-in by name. Plug-ins know the core's contract. That means a plug-in can be added, replaced or crash without the core being rebuilt.

        Inside your own system, "database", "email" and "payments" can be plug-ins to your business rules in just the same way.` },

    { kind: 'concept', title: 'What crosses the boundary: plain data',
      body: `What should you hand across the line? **Simple, plain data**, shaped for the receiver's needs.

        Do **not** pass the database's row object, the ORM's entity or the framework's request object into the business rules. If you do, the inner side suddenly knows the table layout or the web framework, and you have smuggled the detail straight through the wall.

        Instead, the rules ask for, and return, plain structures: \`{ id, total, status }\`. The adapter at the edge translates between that and whatever the database or web layer likes.

        Each crossing means a little translating code. That is the price of the wall, and usually a good deal.` },

    { kind: 'code', title: 'An anti-corruption layer',
      body: 'Sometimes the outside is not just different but **messy**: an old system with cryptic names. An **anti-corruption layer** translates, so the mess cannot seep in. **Tap the lines.**',
      code: { lang: 'js', src: `
        // The old system speaks in codes
        // { ORD_NO: 8841, STS: 'X', AMT_P: 12999 }

        const STATUS = { A: 'active', P: 'paid', X: 'cancelled' };

        function toOrder(legacy) {
          return {
            id: String(legacy.ORD_NO),
            status: STATUS[legacy.STS],
            total: legacy.AMT_P / 100,
          };
        }`,
        notes: {
          2: 'The legacy system’s own names and codes. Nothing in your own code should ever see these.',
          4: 'The translation table lives in one place, at the boundary.',
          7: 'Your code gets clean names (`id`, `status`, `total`) in your own language. If the legacy system is retired, only this function goes.'
        } },
      note: 'The term comes from Domain-Driven Design, which a later module covers properly. For now: a translator at the door, so their model does not corrupt yours.' },

    { kind: 'pitfall', title: 'Boundaries cost something',
      body: `Every boundary adds interfaces, adapters and translation code. Draw them everywhere and you drown in indirection, with a hatch between every pair of rooms.

        Draw them where it counts: between the **valuable and stable** (rules) and the **volatile or foreign** (third parties, databases, screens), where a change is likely or expensive.

        Also, an unpoliced boundary decays. Someone imports a database class "just once", and the line is gone. Teams often use automated checks (tests or build rules that fail if a forbidden import appears) to keep the line honest.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Where is the best place to draw a boundary?',
      options: ['Between things that change for different reasons', 'Between every pair of classes, to be safe', 'Around the largest folder in the project', 'Only between the code and the server it runs on'],
      answer: 0,
      why: [null, 'That would drown the code in indirection. Boundaries have a price.', 'Folder size has nothing to do with how things change.', 'A boundary is about change, not about hardware.'],
      explain: 'Boundaries pay off where they stop change leaking: between rules and databases, your code and third parties, logic and screens. Elsewhere they are cost without benefit.' },

    { type: 'tf', after: 3, statement: 'Under the dependency rule, the business rules should mention the name of the database library they use.', answer: false,
      explain: 'Dependencies point inwards. The database code knows the rules, never the other way round. The rules talk to an interface they own, and the database adapter implements it.' },

    { type: 'order', prompt: 'Put these in the order a request might cross the boundaries when an order is placed.',
      items: ['The web controller receives the HTTP request', 'It turns the request into plain data and calls the business rules', 'The rules decide the price and call an interface they own to save', 'The database adapter implements that interface and writes the row', 'The adapter returns plain data and the controller builds the response'],
      explain: 'Notice that the rules never see HTTP and never see SQL. Each detail translates at its own edge, and what crosses the lines is plain data.' },

    { type: 'spot', after: 6, prompt: 'This business rule is leaking a detail across the boundary. Tap the line.',
      code: { lang: 'js', src: `
        function canRefund(ormRow) {
          const days = (Date.now() - ormRow.created_at) / 86400000;
          return ormRow.status === 'paid' && days <= 30;
        }` },
      lines: [1],
      explain: 'The rule accepts the ORM’s row object, so it now knows column names such as created_at and status. It should accept plain data like { paidAt, status } supplied by an adapter.' },

    { type: 'ab', q: 'Which version keeps a third-party provider behind a boundary?',
      a: { lang: 'js', label: 'Direct call', src: `
        function resetPassword(user) {
          acme.messages.create({ to: user.email, tpl: 'reset-v3' });
        }` },
      b: { lang: 'js', label: 'Through a contract', src: `
        function resetPassword(user, mailer) {
          mailer.send(user.email, 'password-reset');
        }` },
      answer: 'b',
      explain: 'The contract version only knows about a `mailer`. Which provider sits behind it, and how its templates are named, are the adapter’s business.' },

    { type: 'bucket', prompt: 'Does this belong inside the boundary (policy) or outside it (detail)?', buckets: ['Inside: policy', 'Outside: detail'],
      items: [['The rule that refunds need a paid order', 0], ['The SQL that loads an order', 1], ['The HTTP status code for “not found”', 1], ['The interface describing “save an order”', 0], ['A translation from a legacy system’s status codes', 1], ['The calculation of total including tax', 0]],
      explain: 'The rules and the interfaces they define sit inside. SQL, HTTP and legacy translation are all details at the edge, kept there so the inside stays clean.' },

    { type: 'cloze', text: 'The dependency rule says source-code dependencies point {{inwards}}. A translator that stops a messy outside model leaking in is an {{anti-corruption layer}}. What crosses the line should be plain {{data}}.',
      distractors: ['upwards', 'cache', 'framework objects'],
      explain: 'The inside never mentions the outside; interfaces owned by the inside make this possible. Plain data keeps table layouts and framework types from slipping through.' },

    { type: 'scenario', title: 'Taming the legacy system', intro: 'You are building a new shop, but the stock levels live in a 20-year-old system that returns cryptic data, such as `{ SKU_NO: 77, QTY_OH: 14, STS: "H" }`. A teammate suggests using those fields directly all over the new code.',
      meters: { 'code clarity': 40, 'future freedom': 40 },
      steps: [
        { text: 'How do you handle the old system’s data?',
          choices: [
            { label: 'Write one translator at the edge that turns it into `{ id, available, onHold }`, and use only that.', score: 2, effects: { 'code clarity': 30, 'future freedom': 30 }, feedback: 'This is an anti-corruption layer. Only the translator knows the old names, so the new code reads in your own language.' },
            { label: 'Use the old fields directly. Translation is wasted effort.', score: 0, effects: { 'code clarity': -20, 'future freedom': -25 }, feedback: 'Now QTY_OH and STS appear all over the new code, and the old system’s quirks become your quirks.' },
            { label: 'Copy the old system’s data into your own database nightly and use that.', score: 1, effects: { 'code clarity': 5, 'future freedom': 5 }, feedback: 'It keeps the old system out of your queries, but the copied data still has the cryptic shape. You still need a translation step.' }
          ] },
        { text: 'Two years later the old system is finally switched off, replaced by a modern stock service. What does the change look like?',
          choices: [
            { label: 'Write a new adapter that returns the same `{ id, available, onHold }` and swap it in.', score: 2, effects: { 'code clarity': 10, 'future freedom': 25 }, feedback: 'The rest of the code never knew the old system existed, so it does not change. The boundary has paid for itself.' },
            { label: 'Search the code for every use of the old fields and rewrite each one.', score: 0, effects: { 'code clarity': -10, 'future freedom': -20 }, feedback: 'This is what happens without a boundary: the detail has spread everywhere, so replacing it means touching everything.' }
          ] }
      ],
      outro: 'The pattern to remember: **put a translator at the door so that outside mess never becomes inside habit.**' },

    { type: 'explain', prompt: 'Explain what a boundary is, which way dependencies should point across it, and how the rules can still save data without knowing about the database.',
      model: 'A boundary is a line between parts that change for different reasons, with a small agreed way across. Dependencies should point inwards, towards the business rules, so details know about the policy but not the reverse. The rules still save data by calling an interface that they own; the database adapter implements it, so the rules never mention SQL. Plain data crosses the line.',
      keywords: ['boundary', 'inwards', 'interface', 'adapter', 'plain data', 'dependency inversion'] }
  ],

  flashcards: [
    { q: 'What is a boundary?', a: 'A line between parts that change for different reasons, with a small, agreed way across it.' },
    { q: 'What is the dependency rule?', a: 'Source-code dependencies point inwards, towards the business rules. Details know about the policy, never the reverse.' },
    { q: 'How can inner code use a database without depending on it?', a: 'It calls an interface it owns, and the database adapter implements that interface (dependency inversion).' },
    { q: 'What should cross a boundary?', a: 'Simple, plain data shaped for the receiver, not database rows or framework objects.' },
    { q: 'What is an anti-corruption layer?', a: 'A translator between your clean model and an outside or legacy system, so the outside’s mess does not leak in.' }
  ],

  glossary: [
    { term: 'Boundary', def: 'A line in a design separating parts that change for different reasons, crossed only through a small agreed doorway.', like: 'The serving hatch between kitchen and dining room.' },
    { term: 'Dependency rule', def: 'The rule that source-code dependencies must point inwards, towards the business rules.', like: 'Tenants may know the landlord’s address; the landlord’s rules need not name any tenant.' },
    { term: 'Plug-in architecture', def: 'A design with a small stable core and extras that attach through a defined interface, with the core unaware of any specific plug-in.', like: 'A power strip: add or remove appliances without rewiring.' },
    { term: 'Anti-corruption layer', def: 'A translation layer that converts between your own model and a foreign or legacy one so the foreign model cannot leak into yours.', like: 'An interpreter at a meeting: each side speaks its own language.', aka: ['ACL'] }
  ],

  takeaways: [
    'Draw boundaries between things that **change for different reasons**.',
    '**Dependencies point inwards**: details know the rules, never the reverse.',
    'Pass **plain data** across; never database rows or framework objects.',
    'Use an **anti-corruption layer** to keep a messy outside from leaking in. Boundaries cost, so draw them where change is likely.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ap-quality-attributes', {
  eli5: 'Every system must be good at some things more than others, such as speed, safety, cost or ease of change, and the choices you make to get some of them always cost you a little of the rest.',

  cards: [
    { kind: 'story', title: 'Two products, one instruction: “make it good”',
      body: `A trading platform and a photo-sharing app both ask their architects to "make it good".

        The trading platform's customers lose money if an order is slow by a fraction of a second, or recorded wrongly. They will happily pay for extra servers and strict checks.

        The photo app's users care that uploads work, that it is cheap enough to keep free and that millions can use it on a Saturday night. A photo that appears a second late hurts nobody.

        "Good" means something different in each. Before anyone draws a box, someone has to ask the question this lesson is about: **good at what?**` },

    { kind: 'compare', title: 'Six qualities you will meet constantly',
      body: 'Customers rarely name these, but they feel them. Each has a typical price.',
      cols: ['The question', 'What it often costs'],
      rows: [
        ['**Scalability**', 'Can it cope with ten times the load?', 'Complexity and money'],
        ['**Availability**', 'Is it up when people need it?', 'Redundancy and money'],
        ['**Performance**', 'How fast does it respond?', 'Memory, or fresher data'],
        ['**Security**', 'Does it resist misuse and theft?', 'Speed and convenience'],
        ['**Maintainability**', 'Can it be changed safely and quickly?', 'Up-front time'],
        ['**Cost**', 'What does it cost to build and to run?', 'Competes with all the above']
      ],
      note: 'There are many more (usability, portability, testability…). These six come up in nearly every discussion.' },

    { kind: 'metaphor', title: 'You cannot buy a vehicle that is everything',
      body: `Try to buy one vehicle that is the fastest, the cheapest, the safest, carries the most, and is the easiest to park.

        A sports car is fast and awful at carrying a sofa. A lorry carries the sofa but will not fit your drive. A small hatchback is cheap and easy to park but not a racer.

        None of these is "the best". Each is best **for someone with particular priorities**.

        Architecture works the same way. Every structural choice favours some qualities and pays for them with others. Where the metaphor stops: with vehicles you can see the trade-offs on the forecourt. In software they stay invisible until the system is under pressure.` },

    { kind: 'concept', title: 'Qualities pull against each other',
      body: `Here are the classic tensions, all things you have already met in this course:

        - **Performance vs freshness**: caching makes reads fast, but the data may be stale.
        - **Security vs convenience**: extra checks protect users, and slow them down.
        - **Availability vs cost**: copies in several regions keep you up, and multiply the bill.
        - **Maintainability vs speed to launch**: tidy structure takes time up front.
        - **Scalability vs simplicity**: systems built to grow are more complicated to run.

        You will never remove these tensions. The skill is to decide **which side to favour, knowingly**, and to be honest with the people paying about what that gives up.` },

    { kind: 'diagram', title: 'Characteristics drive structure',
      body: 'The qualities you rank highest push the architecture towards particular shapes. This is the heart of the subject.',
      nodes: [
        { id: 'n1', label: 'Must handle huge bursts', icon: '📈', x: 0, y: 0, tone: 'warn' },
        { id: 'n2', label: 'Must never be down', icon: '🛡️', x: 0, y: 1, tone: 'warn' },
        { id: 'n3', label: 'Must change weekly', icon: '🔧', x: 0, y: 2, tone: 'warn' },
        { id: 's1', label: 'Stateless servers, caches', x: 2, y: 0, tone: 'accent' },
        { id: 's2', label: 'Redundant copies, failover', x: 2, y: 1, tone: 'accent' },
        { id: 's3', label: 'Small, well-bounded modules', x: 2, y: 2, tone: 'accent' }
      ],
      edges: [
        { from: 'n1', to: 's1', label: 'pushes towards' },
        { from: 'n2', to: 's2', label: 'pushes towards' },
        { from: 'n3', to: 's3', label: 'pushes towards' }
      ],
      caption: 'Pick the shape first and you may find it cannot deliver the quality you needed. Pick the qualities first and the shape follows.' },

    { kind: 'steps', title: 'How architects choose',
      body: 'A simple loop, used at every scale from one feature to a whole company.',
      steps: [
        { title: 'Ask what matters', body: 'Talk to the people who pay and use it. "Never lose an order" and "launch in six weeks" lead to very different systems.' },
        { title: 'Pick the top three', body: 'If everything is top priority, nothing is. Rank qualities and accept that the bottom ones will be merely adequate.' },
        { title: 'Make them measurable', body: '"Fast" is an opinion. "95% of searches answer in under 300 ms" is a target. You met this idea as SLOs in the observability module.' },
        { title: 'Choose a structure that serves them', body: 'Choose the shape (monolith, queues, caches, replicas) that supports your top three at a sensible cost.' },
        { title: 'Write down what you gave up', body: 'Future you, and future colleagues, need to know why it is the way it is.' }
      ] },

    { kind: 'concept', title: 'Fitness functions: tests for architecture',
      body: `Architecture tends to rot. Someone imports a forbidden module, a page becomes slow, a cycle sneaks in. Nobody decides to ruin it; it happens one small change at a time.

        A **fitness function** is an **automated check** that a quality you care about still holds. The idea is popularised in the book *Building Evolutionary Architectures*.

        Examples:
        - a test that fails if the business rules import database code
        - a load test that fails if 95% of responses take over 300 ms
        - a build step that fails if a dependency cycle appears

        Unit tests protect behaviour. Fitness functions protect **structure and qualities**.` },

    { kind: 'code', title: 'A fitness function in a few lines',
      body: 'This test fails the build if any business-rule file reaches into the database code. **Tap the lines.**',
      code: { lang: 'js', src: `
        const fs = require('fs');

        const dir = 'src/domain';
        for (const file of fs.readdirSync(dir)) {
          const text = fs.readFileSync(dir + '/' + file, 'utf8');
          if (text.includes('infrastructure')) {
            throw new Error(file + ' depends on infrastructure');
          }
        }`,
        notes: {
          3: 'The folder that holds the business rules, the inside of the boundary from the last lesson.',
          6: 'A deliberately crude check: does this file mention the outer layer? Real projects use proper tools, but the idea is the same.',
          7: 'Failing loudly is the point. The build goes red the moment someone breaks the rule, while the fix is still one line.'
        } } },

    { kind: 'pitfall', title: 'Gold-plating and vague wishes',
      body: `Two classic mistakes sit on either side of this topic.

        **Gold-plating**: building for Netflix-sized scale when you have two hundred users. Scalability you do not need is complexity you pay for every day. Aim for the load you can reasonably expect, with room to grow.

        **Vague wishes**: "it must be fast" and "it must be secure" cannot be tested or traded. Without numbers, every argument becomes opinion.

        A related trap is demanding extreme availability by reflex. Each extra "nine" of uptime costs disproportionately more, so ask what an hour of downtime would really cost the business.` },

    { kind: 'tip', title: 'Say it as a scenario',
      body: `A tidy way to pin down a quality is to phrase it as a short scenario:

        > **When** [something happens], **the system** [responds like this], **within** [a measurable limit].

        - When 50,000 people arrive at once for ticket sales, the site stays up and each gets a response within two seconds.
        - When a developer changes the tax rules, they ship the change in under a day without touching the checkout code.

        Written like that, a quality can be designed for, tested, and argued over with facts. It is also a ready-made fitness function.` }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each quality attribute to the question it asks.',
      pairs: [['Scalability', 'Can it cope with ten times the load?'], ['Availability', 'Is it up when people need it?'], ['Security', 'Does it resist misuse and theft?'], ['Maintainability', 'Can it be changed safely and quickly?'], ['Performance', 'How fast does it respond?']] },

    { type: 'tf', after: 3, statement: 'Adding a cache usually improves performance at the price of possibly serving stale data.', answer: true,
      explain: 'This is the classic performance-versus-freshness trade-off. A cache answers quickly from stored copies, but a copy can be out of date until it is refreshed.' },

    { type: 'mcq', after: 6, q: 'What is a fitness function?',
      options: ['An automated check that an architectural quality still holds', 'A function that tunes the code so it runs faster', 'A gym schedule for the development team', 'A diagram of the main components'],
      answer: 0,
      why: [null, 'Fitness functions check a quality; they do not optimise the code themselves.', null, 'A diagram describes structure but cannot fail a build if the structure is broken.'],
      explain: 'A fitness function turns a quality or structural rule into an automated check, such as "the domain code never imports the database code" or "95% of responses are under 300 ms". It fails the build when the rule is broken.' },

    { type: 'bucket', prompt: 'Which quality is each sentence mostly about?', buckets: ['Scalability', 'Availability', 'Security', 'Maintainability'],
      items: [['Black Friday brings ten times the normal traffic', 0], ['The site keeps working while one server is replaced', 1], ['Passwords are hashed and every access is logged', 2], ['A new developer can fix a bug in their first week', 3], ['We add more servers as the user count grows', 0], ['If one data centre loses power, another takes over', 1], ['Only the finance team can see salaries', 2], ['Tests stop old features breaking when we add new ones', 3]],
      explain: 'Scalability is about growth in load, availability about staying up, security about who may do what, and maintainability about how safely and quickly the code can change.' },

    { type: 'ab', q: 'Which requirement is more useful to an architect?',
      a: { lang: 'text', label: 'Vague', src: 'The search should be fast.' },
      b: { lang: 'text', label: 'Measurable', src: '95% of searches return in under 300 ms.' },
      answer: 'b',
      explain: 'A number can be designed for, tested and monitored, and it makes trade-offs discussable. "Fast" means something different to everyone, so you cannot tell whether you have met it.' },

    { type: 'multi', q: 'Which of these would make a sensible fitness function?',
      options: ['A test that fails if business-rule code imports the database library', 'A load test that fails if the 95th percentile response time exceeds 300 ms', 'A build step that fails when a dependency cycle appears', 'A meeting every Friday to discuss whether the design still feels right', 'A wiki page saying the system should be maintainable'],
      answers: [0, 1, 2],
      explain: 'All three good answers are automated and objective, so they fail the build on their own. A meeting and a wiki page depend on people remembering, which is exactly how architecture decays.' },

    { type: 'scenario', title: 'What does this product need?', intro: 'You are advising a three-person startup that wants to test an idea for a meal-planning app. They have no users yet, a small budget and a six-week deadline. Their friend insists they should “build it like Netflix”.',
      meters: { 'speed to market': 50, 'wasted effort': 20 },
      steps: [
        { text: 'Which qualities should the team rank highest right now?',
          choices: [
            { label: 'Speed of change and low cost: they need to learn fast and cannot afford extras.', score: 2, effects: { 'speed to market': 25, 'wasted effort': -10 }, feedback: 'With no users, the biggest risk is building the wrong thing. Ease of change and cost decide whether they can find out cheaply.' },
            { label: 'Extreme scalability and availability across several regions.', score: 0, effects: { 'speed to market': -30, 'wasted effort': 40 }, feedback: 'That is gold-plating. They would spend their six weeks on infrastructure for traffic that does not exist yet.' },
            { label: 'Security above everything, with a full audit programme.', score: 1, effects: { 'speed to market': -15, 'wasted effort': 15 }, feedback: 'Basic security is non-negotiable, but heavy programmes belong to products that hold sensitive data at scale. Do the sensible basics first.' }
          ] },
        { text: 'The app takes off. A newspaper features it, and traffic grows twentyfold in a month. The server keeps falling over. What now?',
          choices: [
            { label: 'Re-rank the qualities: availability and scalability now matter, so add copies and caching where the load hits.', score: 2, effects: { 'speed to market': 5, 'wasted effort': -10 }, feedback: 'Priorities move with the product. Now there is evidence about where the load lands, so effort goes where it counts.' },
            { label: 'Stick to the original plan because it was a good one.', score: 0, effects: { 'speed to market': -15, 'wasted effort': 20 }, feedback: 'The plan fitted a product with no users. A good architecture follows what the product needs now.' },
            { label: 'Stop adding features and rewrite everything from scratch.', score: 1, effects: { 'speed to market': -30, 'wasted effort': 15 }, feedback: 'A rewrite is rarely the cheapest answer. Improving the hotspots usually delivers most of the benefit.' }
          ] }
      ],
      outro: 'The pattern to remember: **rank the qualities for the product you have today, and be ready to re-rank.**' },

    { type: 'short', q: 'What do we call an automated check that guards an architectural quality or rule? (two words)', accept: ['fitness function', 'fitness functions'], hint: 'Named after the idea that a design must stay “fit” as it evolves.',
      explain: 'A fitness function is an automated check, such as a test or a build rule, that fails when an architectural quality or structural rule is broken.' },

    { type: 'explain', prompt: 'A manager says: "Just build the fastest, most secure, cheapest, most scalable system." Explain, with examples, why you will ask questions instead.',
      model: 'Quality attributes pull against each other, so you cannot maximise them all. A cache is fast but may be stale; extra security checks slow users down; copies across regions keep the system up but cost more. So I would ask which qualities matter most for this product, make them measurable, and choose a structure that serves the top few, writing down what we are giving up.',
      keywords: ['trade-off', 'cache', 'security', 'cost', 'priorities', 'measurable', 'structure'] }
  ],

  flashcards: [
    { q: 'Name six common quality attributes.', a: 'Scalability, availability, performance, security, maintainability and cost.' },
    { q: 'Why can you not maximise every quality attribute?', a: 'They conflict: caching trades freshness for speed, security checks cost convenience, redundancy costs money. Architecture is choosing which to favour.' },
    { q: 'What does "characteristics drive structure" mean?', a: 'The qualities you rank highest push the design towards particular shapes, so you choose qualities first and let the structure follow.' },
    { q: 'What is a fitness function?', a: 'An automated check that an architectural quality or rule still holds, failing the build when it does not.' },
    { q: 'Give a good way to phrase a quality requirement.', a: 'As a measurable scenario: when something happens, the system responds in a particular way within a stated limit.' }
  ],

  glossary: [
    { term: 'Scalability', def: 'How well a system copes as load grows, such as more users or more data.', like: 'A restaurant that can add tables when the queue grows.' },
    { term: 'Availability', def: 'The share of time a system is up and working when people need it.', like: 'A shop’s opening hours, but measured to the minute.' },
    { term: 'Maintainability', def: 'How easily and safely a system can be understood, fixed and changed.', like: 'A car designed so the mechanic can reach the engine.' },
    { term: 'Fitness function', def: 'An automated check that an architectural quality or structural rule still holds as the system evolves.', like: 'A smoke alarm for your design.' },
    { term: 'Gold-plating', def: 'Adding qualities or features beyond what the product needs, at a real cost in complexity and money.', like: 'Fitting a racing engine to the school-run car.' }
  ],

  takeaways: [
    'Ask **“good at what?”**: rank the qualities that matter for this product.',
    'Qualities **trade off**; you cannot maximise them all, so favour some knowingly.',
    'The qualities you rank highest **drive the structure** you choose.',
    'Make them **measurable** and guard them with **fitness functions**.'
  ],

  links: [
    { label: 'martinfowler.com: Software Architecture Guide', url: 'https://martinfowler.com/architecture/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('arch-principles', {
  title: 'The Keystone Warden',
  intro: 'The Warden guards the arch that holds every system up, and only lets through those who can tell load-bearing walls from wallpaper. Twelve questions on decisions, coupling, components, policy, boundaries and trade-offs.',
  questions: [
    { type: 'mcq', q: 'Which statement is the most useful working definition of software architecture?',
      options: ['The decisions that are expensive to change later', 'The diagram drawn at the start of a project', 'The choice of programming language only', 'The look and feel of the user interface'],
      answer: 0,
      explain: 'Architecture is about the choices with a high cost of reversal: which components exist and how they relate. Diagrams communicate it, but are not the thing itself.' },

    { type: 'tf', statement: 'Adding a cache usually trades some freshness of data for speed.', answer: true,
      explain: 'Cached copies answer quickly but can be out of date. Spotting this kind of trade-off is the heart of architecture.' },

    { type: 'mcq', q: 'Which of these is the loosest form of coupling?',
      options: ['Reacting to an event without knowing who sent it', 'Calling a small public method on another module', 'Reading another module’s private variable', 'Sharing one global settings object'],
      answer: 0,
      explain: 'Event-based coupling needs only the message. Public methods are looser than shared internals, and shared globals and private variables are among the tightest.' },

    { type: 'spot', prompt: 'Tap the line that couples this code most tightly to another module’s internals.',
      code: { lang: 'js', src: `
        function label(order) {
          const city = order.customer.address.city;
          const t = order.total();
          return city.toUpperCase() + ': ' + t;
        }` },
      lines: [2],
      explain: 'Line 2 digs through customer, address and city, so it relies on the exact shape of three structures. Line 3 asks through a method, which is the looser way.' },

    { type: 'mcq', q: 'A change in tax law forces releases of five separate packages. Which principle was most likely ignored?',
      options: ['Common Closure Principle', 'Common Reuse Principle', 'Stable Abstractions Principle', 'Acyclic Dependencies Principle'],
      answer: 0,
      why: [null, 'CRP is about users carrying code they do not use, not about changes landing in too many boxes.', 'SAP concerns how abstract stable components should be.', 'ADP concerns cycles, which are not described here.'],
      explain: 'The Common Closure Principle says things that change together belong together. Five releases for one cause means the pieces were scattered.' },

    { type: 'match', prompt: 'Match each component principle to its idea.',
      pairs: [['REP', 'Release what you reuse, with versions and notes'], ['CCP', 'Group classes that change together'], ['CRP', 'Do not make users depend on what they do not use'], ['ADP', 'No cycles between components'], ['SDP', 'Depend on things more stable than yourself']] },

    { type: 'order', prompt: 'Put the steps of breaking a dependency cycle in order.',
      items: ['Find the arrow that closes the loop', 'Create an interface owned by the calling component', 'Make the other component implement that interface', 'Wire them together at start-up', 'Redraw the arrows to confirm there is no loop'],
      explain: 'You need to find the offending arrow before you can invert it. The interface goes where the call is made, and the final check confirms the loop is gone.' },

    { type: 'bucket', prompt: 'Policy or detail?', buckets: ['Policy', 'Detail'],
      items: [['Refunds are allowed within 30 days', 0], ['The web framework', 1], ['A member may borrow five books at once', 0], ['The shape of the JSON a mobile app receives', 1], ['Which cloud provider hosts the system', 1], ['Free shipping applies over £50', 0]],
      explain: 'Policy would still be true on paper. Frameworks, formats and hosting are the tools that carry it out.' },

    { type: 'ab', q: 'Which keeps the business rules behind a boundary?',
      a: { lang: 'js', label: 'Rules know SQL', src: `
        async function canBorrow(memberId) {
          const r = await db.query(
            'SELECT count(*) FROM loans WHERE member=$1', [memberId]);
          return r.rows[0].count < 5;
        }` },
      b: { lang: 'js', label: 'Rules use a contract', src: `
        async function canBorrow(memberId, loans) {
          const count = await loans.countFor(memberId);
          return count < 5;
        }` },
      answer: 'b',
      explain: 'The rule “fewer than five loans” now depends only on a contract it can describe itself. How loans are counted, in SQL or otherwise, is an adapter’s business.' },

    { type: 'cloze', text: 'The dependency rule says source-code dependencies point {{inwards}}, towards the {{policy}}. A translator that keeps a messy legacy model out of your own is an {{anti-corruption layer}}.',
      distractors: ['outwards', 'cache', 'framework'],
      explain: 'Details depend on the rules, never the other way. Interfaces owned by the inside make that possible, and an anti-corruption layer stops foreign models seeping in.' },

    { type: 'multi', q: 'Which of these are fitness functions?',
      options: ['A build step that fails when a dependency cycle appears', 'A load test that fails when the 95th percentile exceeds a set limit', 'A test that fails if domain code imports database code', 'A wiki page that says the design should stay clean', 'A diagram printed and pinned to the wall'],
      answers: [0, 1, 2],
      explain: 'Fitness functions are automated and objective, so they fail on their own. A wiki page and a diagram rely on people remembering.' },

    { type: 'short', q: 'What is the three-letter abbreviation of the principle that forbids loops of dependency between components?', accept: ['ADP'], hint: 'A, D, P: starts with “acyclic”.',
      explain: 'The Acyclic Dependencies Principle: the graph of dependencies between components must contain no cycles.' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.sheet('arch-principles', {
  title: 'Architectural principles cheat sheet',
  sections: [
    { title: 'Architecture and qualities', md: `Architecture = the **decisions that are expensive to change** (components + relationships).

        | Quality | Asks | Typical price |
        |---|---|---|
        | Scalability | 10x load? | complexity, money |
        | Availability | Up when needed? | redundancy, money |
        | Performance | How fast? | memory, freshness |
        | Security | Resists misuse? | speed, convenience |
        | Maintainability | Safe to change? | up-front time |

        Rank the top three, make them **measurable**, record what you gave up.` },

    { title: 'Coupling and cohesion', md: `**Coupling**: how much A depends on B. **Cohesion**: how well one module's contents belong together. Aim: **low coupling, high cohesion**.

        | Coupling (tight → loose) | Example |
        |---|---|
        | Content | reads B's private data |
        | Global | shared settings object |
        | Data | needs B's exact record shape |
        | Interface | calls a small public method |
        | Message | reacts to an event |

        Check cohesion with one sentence and no "and". Measure coupling by **blast radius**.` },

    { title: 'Component cohesion (what ships together)', md: `A **component** is code released as one versioned unit.

        | Principle | Rule | Pulls |
        |---|---|---|
        | REP | Reuse = release: versions, notes, a theme | larger |
        | CCP | Group what changes together | larger |
        | CRP | Do not bundle what is not used together | smaller |

        You cannot satisfy all three. Early on favour CCP; as reuse grows, favour REP and CRP.` },

    { title: 'Component coupling (who may depend on whom)', md: `- **ADP**: no cycles. Break them with an interface owned by the caller (dependency inversion) or a new shared component.
        - **SDP**: depend on things more **stable** (harder to change, many depend on them).
        - **SAP**: the more stable, the more **abstract**.

        | | Stable | Unstable |
        |---|---|---|
        | Abstract | healthy | zone of uselessness |
        | Concrete | zone of pain | healthy |` },

    { title: 'Policy, details and boundaries', md: `- **Policy** = business rules (true on paper). **Detail** = database, framework, UI, third parties.
        - Keep policy free of details; defer expensive tool choices until you have evidence.
        - **Boundary**: a line between things that change for different reasons.
        - **Dependency rule**: arrows point **inwards**, to the rules.
        - Cross boundaries with **plain data**, not rows or framework objects.
        - **Anti-corruption layer**: a translator against legacy or foreign models.
        - **Plug-in architecture**: stable core, plug-ins through a contract.` },

    { title: 'Fitness functions and common mistakes', md: `**Fitness function**: an automated check that a quality or structural rule still holds (no forbidden imports, no cycles, p95 under a limit).

        Phrase a quality as: *when X happens, the system does Y within Z.*

        Common mistakes:
        - Gold-plating: building for scale you do not have
        - Vague wishes ("fast", "secure") with no numbers
        - Dumping-ground packages (\`common\`, \`utils\`)
        - Wrapping every library "just in case"
        - Boundaries that nobody checks, so they decay` }
  ]
});

