/* Module: patterns-creational-structural — Design Patterns I: Creating & Structuring.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs patterns-creational-structural */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-intro', {
  eli5: 'A design pattern is a famous, named recipe for a problem programmers keep running into, so you can say two words to a teammate instead of explaining a whole design.',

  cards: [
    { kind: 'concept', title: 'You have solved this before',
      body: `Picture the third shop system you have worked on. Once again a part of the code needs to say "tell everyone who cares when an order is placed", and once again you are inventing a way to do it from scratch.

        Here is the quiet truth of software: **the same handful of problems turn up everywhere**. How do I create objects without hard-wiring their exact type? How do I add a feature to something without editing it? How do I let one thing react to another without tying them together?

        Smart people have already found good answers to these, tried them for decades, and written them down. Those written-down answers are **design patterns**.` },

    { kind: 'metaphor', title: 'Recipes, not ready meals',
      body: `A recipe for lasagne says: layers of pasta, sauce and cheese, baked until bubbling. It does not tell you which brand of pasta, or how big your dish is. Every cook makes a slightly different lasagne, yet everyone knows what "lasagne" means.

        A design pattern is a **recipe for a code structure**. It names the ingredients (which objects), how they fit together, and why it works. You still cook it in your own kitchen, with your own language and your own business rules.

        Where the metaphor stops: you cannot copy-paste a pattern from a library. It is an idea you rewrite each time, not a block of code you import.`,
      note: 'Patterns are templates for thinking, not pieces of code.' },

    { kind: 'history', title: 'Where patterns came from',
      body: `The idea began with an architect, Christopher Alexander, who noticed that good buildings and towns repeat certain arrangements (a window seat, a front porch) and wrote them down as "patterns".

        In 1994 four programmers, Erich Gamma, Richard Helm, Ralph Johnson and John Vlissides, did the same for object-oriented code in a book called *Design Patterns*. It described **23 patterns**. The four authors became known, affectionately, as the **Gang of Four**, or **GoF**.

        Those 23 are the famous ones, and they are what the next two modules teach. Many more patterns exist, and later we will zoom out to patterns for whole systems.` },

    { kind: 'compare', title: 'The three families',
      body: 'The Gang of Four sorted their 23 patterns by the kind of job they do.',
      cols: ['Answers the question', 'The patterns'],
      rows: [
        ['Creational (5)', 'How do I **make** objects?', 'Factory Method, Abstract Factory, Builder, Prototype, Singleton'],
        ['Structural (7)', 'How do I **fit** objects together?', 'Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy'],
        ['Behavioural (11)', 'How do objects **cooperate**?', 'Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor']
      ],
      note: 'This module covers creational and structural. The next one covers behavioural, plus patterns at system scale.' },

    { kind: 'steps', title: 'Anatomy of a pattern',
      body: 'Every pattern in the book is described the same way, which is why they are easy to compare.',
      steps: [
        { title: 'A name', body: 'Short and memorable, like "Observer". The name is half the value, as the next card shows.' },
        { title: 'The problem', body: 'The situation that keeps recurring, and the **forces** pulling in different directions (for example: flexible, but also simple).' },
        { title: 'The solution', body: 'The cast of objects, their roles and how they talk. Not exact code, a shape.' },
        { title: 'The consequences', body: 'What you gain and what it costs. Every pattern has a price, usually more classes and more indirection.' }
      ] },

    { kind: 'sequence', title: 'Patterns as shared vocabulary',
      body: 'The biggest win is not the code. It is the conversation.',
      actors: ['Priya', 'Sam'],
      steps: [
        { from: 0, to: 1, label: 'Make the checkout a Facade', note: 'Three words. Priya has described a whole design.' },
        { at: 1, label: 'pictures one simple front door', note: 'Sam knows the pattern, so Sam already imagines the classes, the roles and the trade-offs.' },
        { from: 1, to: 0, label: 'Facade, not Adapter, right?', dashed: true, note: 'A precise question that would take a paragraph without the names.' },
        { from: 0, to: 1, label: 'Right, nothing needs converting', note: 'They have agreed on a design in about ten seconds.' },
        { note: 'Without the names: "we make a class that hides the payment, stock and email classes behind one method..." and so on, for several minutes.' }
      ] },

    { kind: 'code', title: 'You already use patterns',
      body: 'You have met several without the names. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        const prices = [30, 5, 12];
        prices.sort((a, b) => a - b);

        button.addEventListener('click', showReceipt);

        for (const p of prices) {
          console.log(p);
        }`,
        notes: {
          2: 'Passing in the comparison rule so \`sort\` can be told *how* to order things is the **Strategy** pattern.',
          4: 'Registering a function to be called when something happens is **Observer**, also known as publish/subscribe.',
          6: 'A \`for...of\` loop walks any collection without knowing how it is stored: **Iterator**.'
        } } },

    { kind: 'pitfall', title: 'Pattern fever',
      body: `Learn a hammer and everything looks like a nail. Beginners who discover patterns often start adding them everywhere: a Factory for a class that is created in one place, a Singleton for a variable, a Strategy for an \`if\` with two branches.

        The result is **more classes, more indirection and no benefit**. The code looks professional and is harder to read than the simple version.

        A pattern is a cure for a **problem you actually have**. No problem yet, no pattern.` },

    { kind: 'tip', title: 'Use them well',
      body: `A sensible order of play:

        1. Write the simplest thing that works.
        2. Notice the pain: duplicated code, a giant \`switch\`, a change that ripples everywhere.
        3. Recognise the pattern that treats that pain, and refactor towards it.

        Also remember that a pattern is shaped by its language. In languages with first-class functions, several of the 23 shrink to a single function (you just saw Strategy as one arrow function). Some experts argue that a pattern is partly a sign of something the language lacks. Whichever view you hold, understand the idea, then use the lightest form of it.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is a design pattern, most accurately?',
      options: ['A named, reusable solution shape for a recurring design problem', 'A ready-made library you import to solve a problem', 'A rule that every well-written program must follow', 'A way of formatting code so teammates can read it'],
      answer: 0,
      why: [null, 'A pattern is an idea you write yourself each time, not code you import.', 'Patterns are optional tools. Many fine programs use few of them.', 'Formatting is about style. Patterns are about how objects are arranged.'],
      explain: 'A pattern is a recipe for a structure: it names the problem, the roles and the trade-offs, and you implement it in your own code.' },

    { type: 'bucket', after: 3, prompt: 'Which family does each pattern belong to?', buckets: ['Creational', 'Structural', 'Behavioural'],
      items: [['Singleton', 0], ['Builder', 0], ['Adapter', 1], ['Decorator', 1], ['Facade', 1], ['Observer', 2], ['Strategy', 2], ['Command', 2]],
      explain: 'Creational patterns make objects (Singleton, Builder). Structural ones fit objects together (Adapter, Decorator, Facade). Behavioural ones describe how objects cooperate (Observer, Strategy, Command).' },

    { type: 'short', q: 'How many patterns did the Gang of Four describe in their 1994 book?', accept: ['23', 'twentythree', 'twenty three'], hint: 'A number a little over 20.',
      explain: 'The book describes 23 patterns, split into creational, structural and behavioural families.' },

    { type: 'tf', statement: 'A big benefit of patterns is that teammates can discuss a design using one shared name instead of explaining it from scratch.', answer: true,
      explain: 'The shared vocabulary is arguably the biggest win. "Use an Observer here" carries the roles and trade-offs in two words.' },

    { type: 'order', prompt: 'Put the parts of a pattern’s description in the order you would read them.',
      items: ['A name', 'The problem and its forces', 'The solution’s shape', 'The consequences and costs'],
      explain: 'You meet the name first, then the problem it answers, then the shape of the solution, and finally what it costs you. Skipping to the solution without the problem is how pattern fever starts.' },

    { type: 'ab', q: 'Both versions give a receipt its tax. Which is the better design for this code, today?',
      a: { lang: 'js', label: 'Plain', src: `
        function totalWithTax(subtotal) {
          return subtotal * 1.2;
        }` },
      b: { lang: 'js', label: 'Patterned', src: `
        class TaxStrategy { calculate(x) { return x * 1.2; } }
        class TaxStrategyFactory {
          create() { return new TaxStrategy(); }
        }
        function totalWithTax(subtotal) {
          return new TaxStrategyFactory().create().calculate(subtotal);
        }` },
      answer: 'a',
      explain: 'There is one tax rate and no sign of more. The plain function is easier to read and change. Patterns earn their keep when real variation or pain appears, not before.' },

    { type: 'spot', prompt: 'This team has pattern fever. Tap the line that adds structure nobody needs.',
      code: { lang: 'js', src: `
        // Needed: print the app name in the page title.
        class AppNameProviderFactory {
          createProvider() {
            return new AppNameProvider();
          }
        }
        const title = new AppNameProviderFactory().createProvider().get();` },
      lines: [2, 3],
      explain: 'A factory exists to hide *which* class gets created when that varies. Here nothing varies, so the factory is ceremony wrapped around a constant.' },

    { type: 'scenario', title: 'The keen new hire', meters: { clarity: 50, flexibility: 50 },
      intro: 'A new colleague has just read about patterns and wants to use them. You are reviewing their pull request for a small internal tool.',
      steps: [
        { text: 'The PR adds a Strategy, a Factory and an Observer to a script that sends one weekly email. What do you say?',
          choices: [
            { label: 'Great, patterns make code professional. Approve.', score: 0, effects: { clarity: -25 }, feedback: 'Three patterns for one email is machinery with no problem to solve. The next reader has to learn it all to change one subject line.' },
            { label: 'Ask what problem each one solves today, and suggest removing the ones with no answer', score: 2, effects: { clarity: 25, flexibility: 5 }, feedback: 'The right question. A pattern should answer a pain you can point at. Keep what earns its place, simplify the rest.' },
            { label: 'Ban patterns from the project', score: 1, effects: { flexibility: -20 }, feedback: 'Overcorrecting. The pattern is not the problem, using it with no pain is. You will want them when real variation appears.' }
          ] },
        { text: 'Months later the tool must send by email, SMS and Slack, chosen per customer, and the code is a long if/else chain. What now?',
          choices: [
            { label: 'Refactor towards a pattern that lets you swap the sending method', score: 2, effects: { flexibility: 30, clarity: 15 }, feedback: 'Now there is real variation and real pain, so naming the pattern (Strategy) and refactoring towards it is exactly right.' },
            { label: 'Add another else-if branch and move on', score: 1, effects: { clarity: -10 }, feedback: 'Quick, and fine once. But this is the third branch and the kind of code that keeps growing.' },
            { label: 'Rewrite the whole tool from scratch', score: 0, effects: { clarity: -10, flexibility: -10 }, feedback: 'Wildly more work than needed. One focused refactor fixes the pain.' }
          ] }
      ],
      outro: 'Simple first, notice the pain, then reach for the pattern.' },

    { type: 'explain', prompt: 'Explain to a friend what a design pattern is, why teams like them, and when not to use one.',
      model: 'A design pattern is a named, proven recipe for a problem that keeps coming up, such as how to create objects or how to let one object react to another. The Gang of Four wrote down 23 of them in three families: creational, structural and behavioural. Teams like them because the name is shared vocabulary, so a whole design can be discussed in a couple of words. You should not use one when there is no real problem to solve, because it just adds classes and indirection.',
      keywords: ['named', 'recipe', 'problem', 'vocabulary', 'Gang of Four', 'three', 'over', 'simple'] }
  ],

  flashcards: [
    { q: 'What is a design pattern?', a: 'A named, reusable recipe for a problem that keeps recurring in software design. It is a shape you implement yourself, not code you import.' },
    { q: 'Who are the Gang of Four?', a: 'Gamma, Helm, Johnson and Vlissides, authors of the 1994 book *Design Patterns*, which catalogued 23 object-oriented patterns.' },
    { q: 'What are the three GoF families?', a: 'Creational (making objects), structural (fitting objects together) and behavioural (how objects cooperate).' },
    { q: 'Why are pattern names valuable?', a: 'They are shared vocabulary: two words convey a whole design, its roles and its trade-offs.' },
    { q: 'What is "pattern fever"?', a: 'Applying patterns where there is no real problem, which adds classes and indirection for no benefit.' }
  ],

  glossary: [
    { term: 'Design pattern', def: 'A named, reusable solution shape for a design problem that keeps recurring. You adapt it to your own code each time.', like: 'A recipe: the same dish, cooked differently in every kitchen.' },
    { term: 'Gang of Four', aka: ['GoF'], def: 'The four authors of the 1994 book *Design Patterns*. The phrase also means the 23 patterns they catalogued.', like: 'The authors of the classic cookbook everyone quotes.' },
    { term: 'Creational pattern', def: 'A pattern about how objects get made, so that the code asking for an object does not need to know exactly what it receives.', like: 'Ordering from a menu instead of walking into the kitchen.' },
    { term: 'Structural pattern', def: 'A pattern about how objects and classes are composed into bigger structures.', like: 'Lego rules for how bricks connect.' },
    { term: 'Behavioural pattern', def: 'A pattern about how objects divide up responsibility and communicate.', like: 'The etiquette for who speaks when in a meeting.' }
  ],

  takeaways: [
    'A pattern is a **named recipe** for a recurring problem, not a block of code.',
    'The GoF catalogued **23**, in three families: creational, structural, behavioural.',
    'Their biggest gift is **shared vocabulary** between developers.',
    'No pain, no pattern: simple first, refactor towards a pattern when the problem is real.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-factory', {
  eli5: 'Instead of every part of your program building its own tools with the exact brand written in, it asks a specialist, the factory, to hand over whichever tool fits.',

  cards: [
    { kind: 'concept', title: 'The word "new" is a promise',
      body: `Your checkout charges cards through Stripe. Everywhere a payment happens, the code says \`new StripeGateway()\`. Then the business signs a deal with a different payment provider for European customers.

        Now you must hunt down every \`new StripeGateway()\` in the codebase and decide, one by one, which provider it should become.

        The trouble is that \`new\` **names the exact class**. Every line that uses it is welded to that one choice. **Creational patterns** are about loosening that weld, and the factory patterns are the first and most popular of them.` },

    { kind: 'code', title: 'Before: welded to one class',
      body: 'Tap the highlighted lines to see where the weld is.',
      code: { lang: 'js', src: `
        class Checkout {
          pay(order) {
            const gateway = new StripeGateway();
            gateway.charge(order.total);
          }
        }

        class Refunds {
          refund(order) {
            const gateway = new StripeGateway();
            gateway.refund(order.total);
          }
        }`,
        notes: {
          3: 'The checkout decides **which** gateway to use *and* uses it. Two jobs in one place.',
          10: '**The same decision, copied.** Changing provider means finding and editing every one of these.'
        } } },

    { kind: 'metaphor', title: 'The courier firm',
      body: `You run an online shop. When you need a parcel delivered you do not buy a van. You call a courier firm and say "deliver this". Whether they send a bike, a van or a plane is **their** business.

        A **factory** is that courier firm: you describe what you need, and someone else decides which concrete thing to create and builds it. You only deal with the *kind* of thing you get back ("something that delivers"), never the exact model.

        Where the metaphor stops: a real courier is a separate company. A factory is usually just a function or a small class in your own codebase.` },

    { kind: 'code', title: 'Step one: the simple factory',
      body: 'The easiest fix is one function that owns the "which class?" decision. Strictly speaking this is not a Gang of Four pattern, but it is the idea underneath them.',
      code: { lang: 'js', src: `
        function createGateway(region) {
          if (region === 'EU') return new SepaGateway();
          if (region === 'US') return new CardGateway();
          throw new Error('No gateway for ' + region);
        }

        class Checkout {
          pay(order) {
            const gateway = createGateway(order.region);
            gateway.charge(order.total);
          }
        }`,
        notes: {
          1: 'All the "which class?" logic lives here and only here.',
          9: 'The checkout now only knows that it gets *something* with a \`charge\` method.',
          4: 'Failing loudly beats quietly choosing the wrong gateway.'
        } },
      note: 'Adding a region still means editing this function, which is the price of the simple version.' },

    { kind: 'code', title: 'Factory Method: let subclasses choose',
      body: `The real **Factory Method** pattern: a parent class does the work but leaves one step, "create the product", for its subclasses to fill in.`,
      code: { lang: 'js', src: `
        class Checkout {
          createGateway() {
            throw new Error('subclass must decide');
          }
          pay(order) {
            const gateway = this.createGateway();
            gateway.charge(order.total);
          }
        }

        class EuCheckout extends Checkout {
          createGateway() { return new SepaGateway(); }
        }
        class UsCheckout extends Checkout {
          createGateway() { return new CardGateway(); }
        }`,
        notes: {
          2: 'This is the **factory method**: a hook whose only job is to create the product.',
          6: 'The shared \`pay\` logic calls the hook and works with whatever comes back.',
          12: 'Each subclass picks the concrete class. A new region is a new subclass, and nothing existing is edited.'
        } } },

    { kind: 'diagram', title: 'The shape of Factory Method',
      body: 'The creator talks only to the product interface. The subclasses decide which concrete product it gets.',
      nodes: [
        { id: 'c', label: 'Checkout (creator)', icon: '🏭', x: 1, y: 0, tone: 'accent' },
        { id: 'eu', label: 'EuCheckout', x: 0, y: 1 },
        { id: 'us', label: 'UsCheckout', x: 2, y: 1 },
        { id: 'pg', label: 'Gateway (interface)', x: 1, y: 2, tone: 'info' },
        { id: 'sepa', label: 'SepaGateway', x: 0, y: 3, tone: 'good' },
        { id: 'card', label: 'CardGateway', x: 2, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'eu', to: 'c', label: 'extends', dashed: true },
        { from: 'us', to: 'c', dashed: true },
        { from: 'c', to: 'pg', label: 'uses' },
        { from: 'eu', to: 'sepa', label: 'creates' },
        { from: 'us', to: 'card', label: 'creates' },
        { from: 'sepa', to: 'pg', label: 'is a', dashed: true },
        { from: 'card', to: 'pg', dashed: true }
      ],
      caption: 'This is the "program against an abstraction" idea from the last module, applied to creating objects.' },

    { kind: 'concept', title: 'Abstract Factory: whole matching families',
      body: `Factory Method makes **one** product. But a European checkout needs more than a gateway: it also needs EU tax rules and EU-style invoices. Mixing a SEPA gateway with US tax would be a bug.

        An **Abstract Factory** is a factory that makes a **whole family of related objects** that must go together. You pick the factory once, and everything it hands out matches.

        Think of a furniture showroom that sells "Scandinavian" and "Victorian" ranges. Choose the range and every chair, table and lamp fits the others. You can never walk out with a Victorian chair and a Scandinavian table by accident.`,
      code: { lang: 'ts', src: `
        interface RegionKit {
          createGateway(): Gateway;
          createTax(): TaxCalculator;
          createInvoice(): InvoiceFormat;
        }`,
        notes: { 2: 'One method per member of the family.', 4: 'Implementations (EuKit, UsKit) return objects that belong together.' } } },

    { kind: 'compare', title: 'Three ideas, often confused',
      body: 'People say "factory" for all of these. Keep them apart.',
      cols: ['What it is', 'Who chooses the class'],
      rows: [
        ['Plain `new`', 'The calling code names the class directly', 'The caller, hard-wired'],
        ['Simple factory', 'One function or class with a branch that returns the right object', 'The factory function'],
        ['Factory Method', 'An overridable method in a parent class that creates the product', 'The subclass'],
        ['Abstract Factory', 'An object that creates a whole family of matching products', 'The factory you picked']
      ] },

    { kind: 'pitfall', title: 'A factory for one thing',
      body: `Factories are **cheap to add later and annoying to remove**, so wait until you feel the pain.

        If there is only one gateway and no sign of a second, \`new SepaGateway()\` is perfectly fine. A \`GatewayFactoryProvider\` that returns a single class is ceremony.

        Also note that in JavaScript and Python you can often pass **a function** instead of building a class hierarchy: \`new Checkout(() => new SepaGateway())\`. The pattern's job (hide which class is made) is done with far less machinery. That is a perfectly good factory.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the main problem with writing `new StripeGateway()` in many places?',
      options: ['Every place is welded to one class, so changing it means editing them all', 'It is slower than any other way of creating an object', 'JavaScript does not allow `new` inside methods', 'It uses more memory than a factory would'],
      answer: 0,
      why: [null, 'Speed is not the issue. The concern is how many places need to change.', '`new` works anywhere. The problem is design, not syntax.', 'Memory is not the concern here either.'],
      explain: '`new` names the exact class. Each use scatters that choice, so swapping providers means finding every one.' },

    { type: 'tf', after: 4, statement: 'In Factory Method, the parent class must know every concrete class its subclasses might create.', answer: false,
      explain: 'The opposite: the shared code in the parent calls an overridable method and works against the product interface. Each subclass supplies the concrete product, so the parent never names it.' },

    { type: 'match', after: 7, prompt: 'Match each description to the name.',
      pairs: [['One function with an if that returns the right object', 'Simple factory'], ['A parent calls an overridable method that makes the product', 'Factory Method'], ['One object that creates a whole matching set of products', 'Abstract Factory'], ['The caller writes the exact class itself', 'Plain `new`']],
      explain: 'The difference is who decides and how many products are involved: the caller, a function, a subclass for one product, or a factory for a family.' },

    { type: 'spot', prompt: 'The team wants to support a new provider without editing the checkout. Tap the line that stops them.',
      code: { lang: 'js', src: `
        class Checkout {
          constructor() {
            this.logger = console;
          }
          pay(order) {
            const gateway = new StripeGateway();
            gateway.charge(order.total);
            this.logger.log('paid');
          }
        }` },
      lines: [6],
      explain: 'The hard-coded `new StripeGateway()` makes the checkout decide the provider. Hand creation to a factory (or a factory method) and the checkout stops caring.' },

    { type: 'ab', q: 'Which version lets you add a new region without touching the checkout class?',
      a: { lang: 'js', label: 'Hard-wired', src: `
        class Checkout {
          pay(order) {
            const g = order.region === 'EU'
              ? new SepaGateway()
              : new CardGateway();
            g.charge(order.total);
          }
        }` },
      b: { lang: 'js', label: 'Factory method', src: `
        class Checkout {
          pay(order) {
            this.createGateway().charge(order.total);
          }
        }
        class BrazilCheckout extends Checkout {
          createGateway() { return new PixGateway(); }
        }` },
      answer: 'b',
      explain: 'With the factory method, each new region is a new subclass. The hard-wired version needs another branch inside `pay`, so each region edits existing code.' },

    { type: 'cloze', code: true, text: 'class Checkout {\n  {{createGateway}}() {\n    throw new Error("subclass decides");\n  }\n  pay(order) {\n    this.createGateway().charge(order.total);\n  }\n}\nclass EuCheckout {{extends}} Checkout {\n  createGateway() { return new SepaGateway(); }\n}',
      distractors: ['implements', 'super', 'static'],
      explain: 'The parent declares the hook method and the subclass overrides it with `extends`. Calling `this.createGateway()` runs the subclass version.' },

    { type: 'mcq', q: 'A game must build a whole UI in either a Dark or a Light theme, with buttons, menus and scrollbars that always match. Which pattern fits best?',
      options: ['Abstract Factory, one factory per theme', 'Factory Method, because there is one product', 'A plain constructor with many `if` statements', 'Simple factory returning one button'],
      answer: 0,
      why: [null, 'There are several related products, not one, and they must match.', 'Scattering `if (dark)` through the code makes it easy to mix themes by mistake.', 'A single product does not cover menus and scrollbars.'],
      explain: 'A family of related objects that must stay consistent is exactly what an Abstract Factory is for.' },

    { type: 'scenario', title: 'Going international', meters: { flexibility: 40, simplicity: 60 },
      intro: 'Your shop only sells in one country, with one payment provider, and the code has `new CardGateway()` in two places. Management announces Europe is next quarter.',
      steps: [
        { text: 'Today only one gateway exists. Do you build a factory hierarchy now?',
          choices: [
            { label: 'Yes, add Abstract Factories for every region you might ever need', score: 0, effects: { simplicity: -30, flexibility: 5 }, feedback: 'You are guessing at structure for requirements nobody has confirmed. Most of it may never be used.' },
            { label: 'Not yet. Keep `new`, but keep it in one place so a change is easy', score: 2, effects: { simplicity: 10, flexibility: 15 }, feedback: 'Cheap and sensible. When the second provider is real you will have one spot to turn into a factory.' },
            { label: 'Copy the checkout class for Europe', score: 0, effects: { flexibility: -20, simplicity: -15 }, feedback: 'Duplicated code will drift apart. Every bug fix has to be made twice.' }
          ] },
        { text: 'Europe is approved: new gateway, tax rules and invoice format, and they must be consistent per region. What do you reach for?',
          choices: [
            { label: 'An Abstract Factory per region producing gateway, tax and invoice together', score: 2, effects: { flexibility: 35, simplicity: -5 }, feedback: 'A family of objects that must match is the textbook case. Pick the region once and everything it creates fits together.' },
            { label: 'A simple factory function for the gateway only', score: 1, effects: { flexibility: 10 }, feedback: 'Fixes the gateway, but tax and invoices could still be mismatched by accident.' },
            { label: 'A global variable called REGION checked everywhere', score: 0, effects: { flexibility: -15, simplicity: -15 }, feedback: 'The decision is again scattered across the code, now with hidden shared state.' }
          ] }
      ],
      outro: 'Wait for real variation, then give creation one clear home.' },

    { type: 'explain', prompt: 'Explain the difference between Factory Method and Abstract Factory, using payments in different regions as your example.',
      model: 'Factory Method is a single overridable method in a parent class that creates one product: Checkout has createGateway, and EuCheckout and UsCheckout override it. Abstract Factory is an object that creates a whole family of related products that must match, such as a gateway, tax calculator and invoice format for one region. In both, the client works with interfaces and never writes the concrete class name.',
      keywords: ['subclass', 'family', 'product', 'interface', 'match', 'creates'] }
  ],

  flashcards: [
    { q: 'What problem do factory patterns solve?', a: 'They stop calling code from being welded to a concrete class by hiding which class `new` creates behind a method or object.' },
    { q: 'What is Factory Method?', a: 'A method in a parent class, overridden by subclasses, that creates the product. The parent uses the result through an interface.' },
    { q: 'What is Abstract Factory?', a: 'An object that creates a whole family of related products that must be used together, such as a themed set of widgets.' },
    { q: 'Is a simple factory one of the 23 GoF patterns?', a: 'No. It is just a function or class that returns the right object. It is the idea underneath the real patterns.' },
    { q: 'When is a factory overkill?', a: 'When there is only one concrete class and no real sign of a second. Plain `new` is fine until variation appears.' }
  ],

  glossary: [
    { term: 'Factory', def: 'Code whose job is to create objects, so that other code does not name the concrete class itself.', like: 'A courier firm: you ask for a delivery, they choose the vehicle.' },
    { term: 'Factory Method', def: 'A GoF pattern where a parent class defines a method for creating a product and subclasses override it to choose the concrete class.', like: 'A franchise head office saying "make the pizza", with each branch choosing the local style.' },
    { term: 'Abstract Factory', def: 'A GoF pattern: an interface for creating a whole family of related objects without naming their concrete classes.', like: 'A furniture showroom range where every piece matches.' },
    { term: 'Product', def: 'In factory patterns, the object being created, usually seen through an interface.', like: 'The parcel the courier delivers.' }
  ],

  takeaways: [
    '`new` names an exact class, so it welds your code to one choice.',
    '**Factory Method**: a subclass decides which product to create. **Abstract Factory**: one object makes a matching family.',
    'A simple factory function is often enough, and often better.',
    'Add a factory when variation is real, not just imagined.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-builder-prototype', {
  eli5: 'A builder lets you put a complicated thing together one labelled step at a time, and a prototype lets you photocopy one you already made instead of starting over.',

  cards: [
    { kind: 'concept', title: 'The constructor with eight blanks',
      body: `An order in your shop has a customer, a list of items, a delivery address, a gift message, an express flag, a discount code and a few more options. Most orders use only some of them.

        The obvious place to put them all is the constructor, and it gets ugly quickly. You end up writing calls like \`new Order(cust, items, null, null, true, false, 'SAVE10')\` where nobody can tell what \`true\` or \`false\` means.

        This is the **telescoping constructor** problem: constructors that keep growing longer as options pile up, each one slightly different from the last.` },

    { kind: 'code', title: 'The telescoping constructor',
      body: 'Can you tell what each argument means? Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class Order {
          constructor(customer, items, address, giftNote,
                      express, giftWrap, discountCode) {
            // ...assign everything
          }
        }

        const a = new Order(ana, items, home, null, true, false, null);
        const b = new Order(ben, items, home, 'Happy birthday!',
                            false, true, 'SAVE10');`,
        notes: {
          2: 'Seven positional parameters. Swap two by accident and nothing warns you.',
          8: '\`true, false, null\`: which is express and which is gift wrap? You have to go and check.',
          9: 'Most calls pass \`null\` for options they do not use, which is just noise.'
        } } },

    { kind: 'metaphor', title: 'The sandwich counter',
      body: `At a sandwich counter you do not recite twelve choices in a fixed order. The person behind it asks one thing at a time: "Bread?" "Filling?" "Toasted?" "Sauce?" You answer only what you care about, and skip the rest.

        When you say "that's all", **then** the sandwich is actually made and handed over.

        A **Builder** works the same way: you gather the choices step by step, each with a clear name, and only at the end do you ask for the finished product. The counter keeps the half-made state so that your order does not have to be one giant sentence.` },

    { kind: 'code', title: 'A fluent builder',
      body: 'Each step has a name and returns the builder, so calls chain like a sentence. This style is called **fluent**.',
      code: { lang: 'js', src: `
        class OrderBuilder {
          constructor(customer) {
            this.data = { customer, items: [] };
          }
          addItem(item) { this.data.items.push(item); return this; }
          deliverTo(addr) { this.data.address = addr; return this; }
          express() { this.data.express = true; return this; }
          build() {
            if (!this.data.items.length) throw new Error('Empty order');
            return new Order(this.data);
          }
        }

        const order = new OrderBuilder(ben)
          .addItem(book).deliverTo(home).express().build();`,
        notes: {
          5: '\`return this\` hands back the same builder, which is what makes chaining possible.',
          14: 'Reading the call now tells you exactly what was chosen. No mystery booleans.',
          8: '\`build()\` is the one place to **validate** and create the real object, so you can never get a half-built order.',
          15: 'Optional steps are simply left out.'
        } } },

    { kind: 'sequence', title: 'Building one order',
      body: 'The caller talks only to the builder until the very end.',
      actors: ['Caller', 'OrderBuilder', 'Order'],
      steps: [
        { from: 0, to: 1, label: 'new OrderBuilder(ben)', note: 'Starts with the one thing every order needs.' },
        { from: 0, to: 1, label: 'addItem(book)', note: 'The builder stores it away. No Order exists yet.' },
        { from: 0, to: 1, label: 'express()', note: 'Another option recorded.' },
        { from: 0, to: 1, label: 'build()', note: 'The caller says "that’s all".' },
        { at: 1, label: 'validate the data', note: 'Is there at least one item? Is the address present for delivery?' },
        { from: 1, to: 2, label: 'new Order(data)', note: 'Only now is the real object made, complete and valid.' },
        { from: 2, to: 0, label: 'the finished Order', dashed: true, note: 'The caller receives a complete, valid object.' }
      ] },

    { kind: 'tip', title: 'Do you need a whole class?',
      body: `The classic Builder was invented for languages where constructors cannot take named options. Modern JavaScript and Python **can**:

        \`new Order({ customer: ben, express: true })\`

        Here every value has a label, and any can be skipped. For simple cases, an options object or named arguments is a lighter way to cure the same problem.

        Reach for a full builder when construction has **real steps or rules**: validation across fields, building in stages, a result that must be immutable, or several different representations built the same way. Builders also appear a lot in libraries, for example when you assemble a query or an HTTP request in pieces.` },

    { kind: 'concept', title: 'Prototype: copy instead of construct',
      body: `Now the opposite problem. Creating an object from scratch can be slow or fiddly: reading settings from disk, filling dozens of defaults, or running a heavy set-up. Yet you often need many that are **nearly identical**.

        The **Prototype** pattern says: set up one good object, then make new ones by **cloning** it and tweaking what differs.

        It is the "Duplicate sheet" button in a spreadsheet, or a photocopied form with the common boxes already filled in. You change the name and date and hand it on. The pattern's gift is that the code asking for a copy does not need to know the object's exact class or how to rebuild it.` },

    { kind: 'code', title: 'Cloning a template',
      body: 'A "welcome" email template is built once, then copied per customer.',
      code: { lang: 'js', src: `
        const welcomeTemplate = {
          subject: 'Welcome!',
          sender: 'hello@shop.example',
          footer: { links: ['terms', 'privacy'] }
        };

        const forAna = structuredClone(welcomeTemplate);
        forAna.to = 'ana@mail.example';
        forAna.subject = 'Welcome, Ana!';`,
        notes: {
          7: '\`structuredClone\` is built into modern JavaScript and makes a **deep** copy: nested objects are copied too.',
          8: 'Changing the copy leaves the template untouched.'
        } } },

    { kind: 'pitfall', title: 'Shallow copy, shared insides',
      body: `Copying is easy to get subtly wrong. A **shallow** copy duplicates only the top level. Anything nested, such as the \`footer\` object above, is **shared** between the original and the copy.

        With \`const copy = { ...template }\` (the spread syntax) both objects point at the *same* \`footer\`. Edit \`copy.footer.links\` and you have quietly changed the template for every customer.

        A **deep** copy duplicates everything, nested parts included. Whenever you clone, ask: *what is shared?* Also note that \`structuredClone\` copies plain data but not methods, so for objects with behaviour you often write your own \`clone()\` method.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What does the telescoping constructor problem describe?',
      options: ['A constructor whose list of positional options keeps growing', 'A class that inherits through many levels of parents', 'A constructor that calls itself forever', 'Creating one object that is far too big for memory'],
      answer: 0,
      why: [null, 'That is a deep hierarchy, a different smell.', 'That would be infinite recursion, a bug and not a pattern problem.', 'Size is not the issue. Readability of the arguments is.'],
      explain: 'Each new option lengthens the constructor, and calls become strings of `null`, `true` and `false` that nobody can read.' },

    { type: 'order', after: 4, prompt: 'Put the steps of using a builder in the right order.',
      items: ['Create the builder with the required values', 'Call the step methods for the options you want', 'Call build()', 'build() validates, then creates the finished object'],
      explain: 'The builder collects choices first. Only when you ask for the product does it validate and construct, so a half-built object never escapes.' },

    { type: 'spot', prompt: 'This builder method has a bug that stops chaining working. Tap the line.',
      code: { lang: 'js', src: `
        class OrderBuilder {
          constructor() { this.data = {}; }
          express() {
            this.data.express = true;
          }
          giftWrap() {
            this.data.giftWrap = true;
            return this;
          }
        }
        new OrderBuilder().express().giftWrap();` },
      lines: [3, 4],
      explain: '`express()` never returns `this`, so it gives back `undefined`, and `.giftWrap()` then crashes. Every fluent step must return the builder.' },

    { type: 'ab', q: 'Which call is easier to read and less likely to be written wrongly?',
      a: { lang: 'js', label: 'Positional', src: `
        const o = new Order(ben, items, home,
                            null, true, false, 'SAVE10');` },
      b: { lang: 'js', label: 'Builder', src: `
        const o = new OrderBuilder(ben)
          .items(items).deliverTo(home)
          .express().discount('SAVE10').build();` },
      answer: 'b',
      explain: 'Every choice carries a name, so a reader can see what was asked for and a swapped argument cannot slip by silently.' },

    { type: 'bucket', prompt: 'Builder, Prototype, or neither (plain constructor is fine)?', buckets: ['Builder', 'Prototype', 'Neither'],
      items: [['Assembling a report with optional sections, then validating it', 0], ['Making 500 near-identical game enemies from one configured template', 1], ['Creating a Point with x and y', 2], ['Building an HTTP request step by step before sending it', 0], ['Duplicating a heavily configured document to tweak a few fields', 1], ['Creating a Color from red, green and blue', 2]],
      explain: 'Builder suits objects with many optional parts or rules. Prototype suits copying something already set up. A tiny value with two or three fields needs neither.' },

    { type: 'mcq', after: 8, q: 'After `const copy = { ...template }`, you run `copy.footer.links.push("faq")`. What happens to `template`?',
      code: { lang: 'js', src: `
        const template = { subject: 'Hi', footer: { links: ['terms'] } };
        const copy = { ...template };
        copy.footer.links.push('faq');` },
      options: ['It changes too, because the footer object is shared', 'It stays the same, because copy is a separate object', 'It throws an error because the spread cannot copy objects', 'Only the subject is affected'],
      answer: 0,
      why: [null, 'The top level is separate, but the nested footer is the very same object.', 'The spread copies fine. It is just shallow.', 'The subject is a plain string and is unaffected.'],
      explain: 'Spread makes a shallow copy. Nested objects are shared, so a change through the copy shows up in the original. Use a deep clone when nested data may change.' },

    { type: 'cloze', code: true, text: 'class QueryBuilder {\n  where(cond) {\n    this.conditions.push(cond);\n    return {{this}};\n  }\n  build() {\n    return "SELECT * FROM t WHERE " + this.conditions.join(" AND ");\n  }\n}\nconst q = new QueryBuilder().where("a = 1").where("b = 2").{{build}}();',
      distractors: ['super', 'clone', 'new'],
      explain: 'Each step returns `this` so the next call can chain, and `build()` is the final call that produces the result.' },

    { type: 'scenario', title: 'The report generator', meters: { readability: 40, safety: 40 },
      intro: 'Your app produces PDF reports with optional cover page, table of contents, charts, watermark and footer. Today the constructor takes nine arguments.',
      steps: [
        { text: 'Callers keep mixing up the boolean arguments. What is your fix?',
          choices: [
            { label: 'Add a tenth argument for a "mode" string that sets sensible defaults', score: 0, effects: { readability: -15 }, feedback: 'More parameters, more confusion. The core issue, unlabelled positions, remains.' },
            { label: 'Introduce a ReportBuilder with named steps and a build() that checks the combination is valid', score: 2, effects: { readability: 30, safety: 30 }, feedback: 'Named steps read like sentences, and build() can reject nonsense such as a watermark with no content.' },
            { label: 'Leave it and add comments above each call', score: 1, effects: { readability: 5 }, feedback: 'Comments help a little but nothing stops the arguments being swapped, and they drift out of date.' }
          ] },
        { text: 'Every monthly report starts from the same heavily configured template (fonts, logo, margins) loaded from disk, which is slow. What helps?',
          choices: [
            { label: 'Load it once, then deep-clone it for each report and change what differs', score: 2, effects: { readability: 10, safety: 20 }, feedback: 'That is Prototype: pay the set-up cost once, then copy. The deep clone keeps one report’s edits out of the others.' },
            { label: 'Reload the template from disk every time to be safe', score: 1, effects: { safety: 10 }, feedback: 'Safe but wasteful. Cloning gives the same isolation at a fraction of the cost.' },
            { label: 'Share one template object between all reports and mutate it', score: 0, effects: { safety: -35 }, feedback: 'Now every report edits the same object. One customer’s name appears in another’s PDF.' }
          ] }
      ],
      outro: 'Builder for assembling with rules, Prototype for copying what is already set up.' },

    { type: 'explain', prompt: 'Explain Builder and Prototype in your own words and say what problem each one solves.',
      model: 'A Builder constructs a complex object step by step through named methods, and a final build() validates and creates it. It solves the telescoping constructor problem, where long lists of positional arguments are unreadable. A Prototype creates new objects by cloning an existing, already configured one, which saves set-up work and hides the exact class. When cloning you must think about shallow versus deep copies, since a shallow one shares nested data.',
      keywords: ['step', 'build', 'validate', 'telescoping', 'clone', 'copy', 'deep', 'shallow'] }
  ],

  flashcards: [
    { q: 'What is the telescoping constructor problem?', a: 'Constructors that keep growing as options are added, giving long positional argument lists that are hard to read and easy to get wrong.' },
    { q: 'What does a fluent builder method return?', a: '`this`, the builder itself, so calls can be chained. The final `build()` returns the finished object.' },
    { q: 'Why validate inside build()?', a: 'It is the single gate to the real object, so an invalid or half-built object can never be created.' },
    { q: 'What is the Prototype pattern?', a: 'Creating new objects by cloning an existing, configured one and tweaking the differences.' },
    { q: 'Shallow versus deep copy?', a: 'A shallow copy duplicates only the top level and shares nested objects. A deep copy duplicates everything, nested parts included.' }
  ],

  glossary: [
    { term: 'Builder', def: 'A GoF pattern where an object is assembled step by step through named methods, and a final call produces the finished product.', like: 'The sandwich counter: you choose one thing at a time, then it is made.' },
    { term: 'Fluent interface', def: 'An API where each method returns the object so calls chain together and read like a sentence.', like: 'Speaking in one flowing sentence instead of separate commands.' },
    { term: 'Telescoping constructor', def: 'A constructor (or family of constructors) that keeps growing longer as optional parameters are added.', like: 'A form with 20 boxes, most left blank.' },
    { term: 'Prototype', def: 'A GoF pattern where new objects are made by copying an existing one rather than building from scratch.', like: 'A photocopied form with the common fields already filled in.' },
    { term: 'Deep copy', def: 'A copy that duplicates the object and everything nested inside it, so nothing is shared with the original.', like: 'Photocopying every page, not just the cover.' }
  ],

  takeaways: [
    'Long positional constructors are unreadable: use a **builder** (or a named options object).',
    'Fluent steps `return this`; `build()` validates and creates the real thing.',
    '**Prototype** makes new objects by cloning a configured one.',
    'When cloning, always ask: what is still shared with the original?'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-singleton', {
  eli5: 'A singleton is an object your program is only allowed to have one of, which anyone can grab from anywhere. That is handy, but it is also a global variable wearing a suit.',

  cards: [
    { kind: 'concept', title: 'Exactly one of these',
      body: `Some things in a program feel like there should only ever be **one**. One configuration, loaded once at start-up. One logger writing to one file. One pool of database connections shared by everyone.

        Two copies of the configuration could disagree. Two loggers could scramble the same file. So the **Singleton** pattern says:

        > Make sure a class has **only one instance**, and give everyone a **global point of access** to it.

        Two promises, then: *only one exists*, and *anybody can reach it*. The second promise turns out to be the troublemaker.` },

    { kind: 'code', title: 'The classic recipe',
      body: 'The class keeps its one instance and hands it out. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class Config {
          static instance = null;
          static getInstance() {
            if (!Config.instance) {
              Config.instance = new Config();
            }
            return Config.instance;
          }
          get(key) { /* look up a setting */ }
        }

        const a = Config.getInstance();
        const b = Config.getInstance();
        console.log(a === b);`,
        notes: {
          2: 'The one and only instance lives on the class itself.',
          4: 'First call: nothing exists yet, so create it. This is called **lazy** creation.',
          7: 'Every call after that returns the very same object.',
          14: '\`true\`: \`a\` and \`b\` are one object. In languages like Java or C# the constructor is also made private so \`new\` cannot be used behind your back. Plain JavaScript cannot enforce that.'
        } } },

    { kind: 'metaphor', title: 'The prime minister',
      body: `A country has exactly one prime minister at a time, and anyone can ring the same office to reach them. That is the appeal: one decision-maker, one number.

        But picture every department secretly phoning that office to change things. Someone upstairs adjusts a policy and a far-off department's work breaks, and nobody can see why, because the phone call was never written down on any form.

        That is the danger. The prime minister is fine. The invisible, unrestricted line to them is the problem, and in code that line is **global access**.` },

    { kind: 'code', title: 'Global state in disguise',
      body: 'Look at what this class needs, and where it says so.',
      code: { lang: 'js', src: `
        class PaymentService {
          charge(order) {
            const cfg = Config.getInstance();
            const rate = cfg.get('taxRate');
            return order.total * (1 + rate);
          }
        }`,
        notes: {
          3: 'The class quietly **reaches out** to a global. Nothing in its constructor or method signature admits it needs a \`Config\`.',
          4: 'The answer depends on whatever any other code last did to the shared \`Config\`.'
        } },
      note: 'Hidden dependencies make code harder to understand, because you can only learn what a class needs by reading its insides.' },

    { kind: 'code', title: 'Why it hurts testing',
      body: `A **test** is a small program that runs your code and checks the answer. Good tests are independent: each starts from a clean slate. A singleton wrecks that.`,
      code: { lang: 'js', src: `
        test('UK tax', () => {
          Config.getInstance().set('taxRate', 0.2);
          expect(new PaymentService().charge({ total: 100 })).toBe(120);
        });
        test('no tax', () => {
          // forgot to reset: taxRate is still 0.2 from before
          expect(new PaymentService().charge({ total: 100 })).toBe(100);
        });`,
        notes: {
          2: 'The test changes the one shared object, and nothing puts it back.',
          7: 'This test fails, but **only if the first one ran before it**. Order-dependent failures are miserable to track down.'
        } } },

    { kind: 'code', title: 'The safer alternative: pass it in',
      body: 'You can keep exactly one `Config` without any global access. Create it once, and hand it to whoever needs it. This is **dependency injection**, which an earlier lesson introduced.',
      code: { lang: 'js', src: `
        class PaymentService {
          constructor(config) {
            this.config = config;
          }
          charge(order) {
            return order.total * (1 + this.config.get('taxRate'));
          }
        }

        // at start-up: build one Config and share it
        const config = new Config();
        const service = new PaymentService(config);

        // in a test: give it a fake
        const fake = { get: () => 0 };
        const testService = new PaymentService(fake);`,
        notes: {
          2: 'The need is now **visible** in the constructor.',
          11: 'There is still only one real \`Config\`, because we only built one. That is a decision, not something the class enforces.',
          15: 'A test supplies its own stand-in, so tests no longer affect each other.'
        } } },

    { kind: 'compare', title: 'Singleton versus injecting one shared object',
      body: 'Both give you one object in practice. They differ in how it is reached.',
      cols: ['Classic Singleton', 'Inject one instance'],
      rows: [
        ['How code gets it', 'Calls `getInstance()` from anywhere', 'Receives it as a constructor argument'],
        ['Dependency visible?', 'No, hidden inside methods', 'Yes, in the signature'],
        ['Swap in tests?', 'Hard, shared state leaks', 'Easy, pass a fake'],
        ['Enforces "only one"?', 'Yes, the class guarantees it', 'No, you simply create one'],
        ['Coupling', 'Everyone is tied to the concrete class', 'Everyone depends on an interface']
      ] },

    { kind: 'pitfall', title: 'Two more traps',
      body: `**Threads.** In languages where several threads run at once, two of them can both see "no instance yet" in the same instant and each create one, so you end up with two singletons. Real implementations need locking or careful initialisation. (JavaScript runs your code on one thread, so it rarely bites there.)

        **Mutable shared state.** A singleton that holds data anyone can change is a shared whiteboard in a busy office. Read-only data, such as settings loaded once and never edited, is far safer than a singleton others keep scribbling on.

        Last, "singleton" is easy to over-apply. Needing *one* of something is a fact about your app, not a reason for global access.` },

    { kind: 'tip', title: 'So is it ever fine?',
      body: `Opinion is split. Many developers now call Singleton an **anti-pattern**, a pattern that tends to cause more harm than good, mainly because of hidden dependencies and awkward tests. Others say it is acceptable for genuinely process-wide things like a logger.

        A balanced rule of thumb:

        - Prefer to create the object once at start-up and **inject** it.
        - If you do need a singleton, keep it **read-only** and put it behind an interface.
        - In JavaScript and Python, a module is already loaded once, so a module-level object behaves like a singleton with no ceremony.
        - Many dependency-injection frameworks offer a "singleton scope": one instance, but still injected, not grabbed from global.` }
  ],

  activities: [
    { type: 'tf', after: 1, statement: 'A Singleton makes two promises: only one instance exists, and there is a global point of access to it.', answer: true,
      explain: 'Both parts are in the definition. The "only one" part is useful. The "reachable from anywhere" part is the one that causes the trouble.' },

    { type: 'mcq', after: 3, q: 'Why is calling `Config.getInstance()` inside a method called "global state in disguise"?',
      options: ['Anyone can change it, and the signature hides the dependency', 'It makes the program run noticeably slower', 'It stops the program from using more than one config file', 'It only works in the first function that calls it'],
      answer: 0,
      why: [null, 'Speed is not the concern. Hidden coupling is.', 'The trouble is shared mutable access, not the number of files.', 'It works wherever it is called, which is exactly the problem.'],
      explain: 'The dependency is invisible in the signature and the object is shared by everyone, so any change to it can affect code far away.' },

    { type: 'spot', prompt: 'This class is hard to unit test. Tap the line that makes it so.',
      code: { lang: 'js', src: `
        class Mailer {
          send(to, text) {
            const smtp = SmtpClient.getInstance();
            smtp.deliver(to, text);
            Logger.getInstance().log('sent to ' + to);
          }
        }` },
      lines: [3, 5],
      explain: 'Both lines reach for a global singleton, so a test cannot swap in a fake mail client or logger. Passing them in through the constructor fixes it.' },

    { type: 'ab', q: 'Which version is easier to test and easier to understand?',
      a: { lang: 'js', label: 'Reaches out', src: `
        class Reports {
          run() {
            const db = Database.getInstance();
            return db.query('SELECT ...');
          }
        }` },
      b: { lang: 'js', label: 'Injected', src: `
        class Reports {
          constructor(db) { this.db = db; }
          run() {
            return this.db.query('SELECT ...');
          }
        }` },
      answer: 'b',
      explain: 'The injected version states what it needs and lets a test hand it a fake database. The reaches-out version hides the dependency and is stuck with the real shared one.' },

    { type: 'multi', q: 'Which of these are real criticisms of the classic Singleton?',
      options: ['It creates hidden dependencies between classes', 'It makes tests influence each other through shared state', 'It cannot be used with more than ten classes', 'It ties code to a concrete class rather than an interface', 'It always makes the program crash on start-up'],
      answers: [0, 1, 3],
      explain: 'Hidden dependencies, leaky tests and tight coupling are the genuine complaints. There is no class limit and it does not crash programs.' },

    { type: 'bucket', prompt: 'Is the one-shared-object approach reasonable, or is there a better design?', buckets: ['Reasonable', 'Better: inject it'],
      items: [['A read-only table of country names loaded once', 0], ['A module-level logger object in a small script', 0], ['A shared mutable "currentUser" that any code can overwrite', 1], ['A database connection pool grabbed by every class via getInstance()', 1], ['A shopping cart stored as a global singleton', 1], ['Constants such as the app’s version number', 0]],
      explain: 'Read-only or truly process-wide things are low risk. Anything mutable that many classes reach into is better created once and passed in, so each user of it is visible and replaceable.' },

    { type: 'short', q: 'What name is traditionally given to the static method that returns the one instance?', accept: ['getInstance', 'get_instance', 'instance'], hint: 'get...',
      explain: 'By convention it is `getInstance()` (or just `instance`), the single doorway everyone uses.' },

    { type: 'scenario', title: 'The logger that grew', meters: { testability: 40, simplicity: 60 },
      intro: 'Your app has a `Logger.getInstance()` used in 80 files. Tests are flaky and a teammate wants it gone.',
      steps: [
        { text: 'What is your first move?',
          choices: [
            { label: 'Rewrite all 80 files in one big-bang change this afternoon', score: 0, effects: { simplicity: -20, testability: 10 }, feedback: 'Huge, risky and hard to review. Better to move gradually.' },
            { label: 'Define a Logger interface, inject it into new and changed classes, and leave the rest until you touch them', score: 2, effects: { testability: 30, simplicity: 10 }, feedback: 'Incremental, safe and it immediately lets new code be tested with a fake logger.' },
            { label: 'Do nothing because singletons are fine', score: 1, effects: { testability: -10 }, feedback: 'For a read-mostly logger this is a defensible position, but the flaky tests are a real cost you are choosing to keep.' }
          ] },
        { text: 'A teammate proposes making the logger writable by any class so they can change the log level anywhere. Your view?',
          choices: [
            { label: 'Fine, global access is convenient', score: 0, effects: { testability: -25 }, feedback: 'Mutable shared state is exactly how distant code ends up affecting each other.' },
            { label: 'Set the level once at start-up from configuration, and keep the logger itself unchanging afterwards', score: 2, effects: { testability: 20, simplicity: 10 }, feedback: 'One instance, configured once, then read-only. That removes most of the danger.' },
            { label: 'Create a second logger per class and let each decide', score: 1, effects: { simplicity: -15 }, feedback: 'Avoids shared state but scatters configuration, so output ends up inconsistent.' }
          ] }
      ],
      outro: 'One instance is a fine fact. Global access to mutable state is the risk.' },

    { type: 'explain', prompt: 'Explain what Singleton is, why many people consider it risky, and what you would do instead.',
      model: 'Singleton ensures a class has just one instance and provides a global way to reach it. It is risky because any code can grab and change it, which creates hidden dependencies and shared state, and it makes tests affect each other because they cannot swap in a fake. Instead I would create one instance at start-up and pass it into the classes that need it with dependency injection, keeping it read-only where possible.',
      keywords: ['one instance', 'global', 'hidden', 'tests', 'inject', 'dependency injection', 'shared'] }
  ],

  flashcards: [
    { q: 'What does the Singleton pattern guarantee?', a: 'That a class has only one instance, and that there is a global point of access to it.' },
    { q: 'Why is Singleton called global state in disguise?', a: 'Any code can reach and modify the shared instance, creating hidden dependencies that do not show in class signatures.' },
    { q: 'Why does Singleton hurt testing?', a: 'Tests share one object, so state leaks from test to test and you cannot easily substitute a fake.' },
    { q: 'What is a safer alternative to Singleton?', a: 'Create one instance at start-up and inject it into the classes that need it.' },
    { q: 'When is a singleton-like object acceptable?', a: 'When it is genuinely process-wide and read-only or stable, such as loaded settings or a logger, ideally behind an interface.' }
  ],

  glossary: [
    { term: 'Singleton', def: 'A GoF pattern that ensures a class has only one instance and provides a global way to reach it.', like: 'The prime minister: exactly one, and anyone can ring the office.' },
    { term: 'Global state', def: 'Data that any part of a program can read and change, so its value depends on what everyone else has done.', like: 'A shared whiteboard in a busy office.' },
    { term: 'Anti-pattern', def: 'A common solution that tends to cause more problems than it solves.', like: 'A shortcut that looks handy until you try to get back.' },
    { term: 'Lazy initialisation', def: 'Creating an object only the first time it is asked for, rather than at start-up.', like: 'Boiling the kettle only when someone asks for tea.' }
  ],

  takeaways: [
    'Singleton = **one instance** plus **global access**.',
    'The global access hides dependencies and lets tests leak into each other.',
    'Prefer creating one object at start-up and **injecting** it.',
    'If you must, keep it read-only and behind an interface.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-adapter-facade', {
  eli5: 'An adapter is like a travel plug that makes a foreign socket fit your charger, and a facade is like a hotel concierge who handles lots of messy arrangements when you say one simple thing.',

  cards: [
    { kind: 'concept', title: 'Two things that will not fit',
      body: `Your checkout code expects every payment provider to look like this: \`charge(amountInPence)\`. Then you sign up with a provider whose software library (an [[SDK]], code the vendor ships so you can use their service) offers \`makePayment({ cents, currency })\` instead.

        You cannot edit their code, and you do not want to rewrite your checkout around their quirks, because a different provider would then mean rewriting it all over again.

        The two sides simply do not **fit**. Structural patterns are about fitting objects together, and the first one to learn is the **Adapter**.` },

    { kind: 'metaphor', title: 'The travel plug',
      body: `You fly abroad with a UK phone charger and the hotel has the wrong sockets. You do not rewire the hotel, and you do not cut the plug off your charger. You buy a small **travel adapter** that has the hotel's shape on one side and your charger's shape on the other.

        Neither side changes. The adapter sits in the middle and translates between them.

        In code the same idea lets you plug **third-party or legacy code** into an interface your own code already expects, while leaving both sides alone.` },

    { kind: 'code', title: 'An adapter in code',
      body: 'Your code depends on `PaymentGateway`. The adapter makes the vendor SDK look like one.',
      code: { lang: 'ts', src: `
        interface PaymentGateway {
          charge(amountInPence: number): void;
        }

        class AcmeAdapter implements PaymentGateway {
          constructor(private sdk: AcmeSdk) {}

          charge(amountInPence: number) {
            this.sdk.makePayment({
              cents: Math.round(amountInPence),
              currency: 'GBP'
            });
          }
        }`,
        notes: {
          1: 'The **target** interface: the shape your own code already expects.',
          6: 'The adapter **wraps** the vendor object it translates for. The vendor class is the **adaptee**.',
          9: 'Translation happens here: different method name, different argument shape, different units.',
          10: 'Pence are not cents, so it has to be converted. In real code take care over what each unit means.'
        } } },

    { kind: 'diagram', title: 'Where the adapter sits',
      body: 'Your code only ever sees the interface. The vendor stays hidden behind the adapter.',
      nodes: [
        { id: 'co', label: 'Checkout', icon: '🛒', x: 1, y: 0, tone: 'accent' },
        { id: 'if', label: 'PaymentGateway (interface)', x: 1, y: 1, tone: 'info' },
        { id: 'ad', label: 'AcmeAdapter', icon: '🔌', x: 1, y: 2, tone: 'good' },
        { id: 'sdk', label: 'Acme SDK (vendor code)', x: 1, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'co', to: 'if', label: 'calls' },
        { from: 'ad', to: 'if', label: 'implements', dashed: true },
        { from: 'ad', to: 'sdk', label: 'translates to' }
      ],
      caption: 'Switching vendor means writing one new adapter. Checkout never changes.' },

    { kind: 'concept', title: 'Why wrapping foreign code pays off',
      body: `Adapters are everywhere in real projects, mostly around code you do not control:

        - **Third-party libraries**, so that your code depends on *your* interface and not the vendor's.
        - **Legacy code**, an old module nobody dares touch, given a modern face without rewriting it.
        - **Services with different formats**, such as one supplier sending XML and another JSON.

        The payoff is that the awkward details are in **one place**. If the vendor changes their API, you fix one adapter. This also keeps the "ugly" foreign style from spreading through your clean codebase. (Some call such a wrapper a protective shell, an *anti-corruption layer*, when it wraps a whole messy system.)` },

    { kind: 'metaphor', title: 'The concierge',
      body: `Now a different problem. You arrive at a big hotel and want a dinner table, a taxi and theatre tickets. You could phone the restaurant, the taxi firm and the box office yourself, in the right order, each with its own booking rules.

        Or you ask the **concierge**: "I would like a perfect evening out." They deal with all of it and tell you when it is sorted.

        A **Facade** is that concierge: one simple front door in front of a complicated set of classes. It does not remove the complexity, it just stops everyone else from having to know it.` },

    { kind: 'code', title: 'A facade in code',
      body: 'Placing an order needs four subsystems in a fixed order. The facade offers one method.',
      code: { lang: 'js', src: `
        class OrderFacade {
          constructor(stock, payments, shipping, mailer) {
            this.stock = stock;
            this.payments = payments;
            this.shipping = shipping;
            this.mailer = mailer;
          }

          placeOrder(order) {
            this.stock.reserve(order.items);
            this.payments.charge(order.total);
            this.shipping.book(order.address);
            this.mailer.sendReceipt(order.email);
          }
        }

        // callers just do:
        facade.placeOrder(order);`,
        notes: {
          9: 'One simple method hides the order of steps and the four classes behind it.',
          10: 'The ordering knowledge lives here once, instead of being copied into every screen or endpoint that places an order.',
          18: 'Callers need to know none of that.'
        } },
      note: 'The subsystems are still there. A facade is a convenience, not a wall: advanced callers can still use the parts directly.' },

    { kind: 'compare', title: 'Adapter versus Facade',
      body: 'They both wrap things, so they get mixed up. The intent is different.',
      cols: ['Adapter', 'Facade'],
      rows: [
        ['Goal', 'Make an **existing** interface fit the one you expect', 'Offer a **new, simpler** interface'],
        ['Wraps', 'Usually one object', 'A group of objects'],
        ['The interface', 'Matches what callers already expect', 'Invented to be easy to use'],
        ['Typical trigger', 'Incompatible or foreign code', 'A tangle of steps repeated everywhere'],
        ['Analogy', 'Travel plug', 'Hotel concierge']
      ] },

    { kind: 'pitfall', title: 'Leaky adapters and bloated facades',
      body: `**A leaky adapter** returns the vendor's own types or error messages to your code. Then the vendor has crept back in, and the adapter protects nothing. Translate errors and data into *your* types before they cross the boundary.

        **A bloated facade** slowly collects every method of every subsystem until it is a **god class** that does everything, the very mess it was meant to hide. Keep a facade thin: it should coordinate, not hold the business rules.

        And if you only call a vendor from one place, an adapter may be more structure than you need. Wait until a second reason to change appears.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Your code expects `charge(pence)` but the vendor library offers `makePayment({cents, currency})`. What does an Adapter do?',
      options: ['Wraps the vendor object behind `charge(pence)` and translates', 'Edits the vendor library so its methods are renamed', 'Rewrites your checkout to call `makePayment` everywhere', 'Merges both interfaces into one new, bigger class'],
      answer: 0,
      why: [null, 'You usually cannot edit vendor code, and an adapter exists to avoid needing to.', 'That spreads the vendor’s shape through your code, the opposite of the goal.', 'An adapter does not merge. It translates between two shapes that stay as they are.'],
      explain: 'The adapter implements the interface your code expects and, inside, calls the vendor in its own style. Neither side changes.' },

    { type: 'bucket', after: 7, prompt: 'Adapter or Facade?', buckets: ['Adapter', 'Facade'],
      items: [['Make an old XML parser look like your JSON-based Parser interface', 0], ['One `placeOrder()` hiding stock, payment, shipping and email calls', 1], ['Let a third-party maps library be used through your `GeoService` interface', 0], ['A simple `VideoConverter.convert(file)` over dozens of codec classes', 1], ['Make a legacy class with `getName()` satisfy a `name()` interface', 0], ['A `startEngine()` button that runs ignition, fuel and checks in order', 1]],
      explain: 'An Adapter reshapes one thing to meet an interface that already exists. A Facade creates a simpler front for a whole cluster of things.' },

    { type: 'match', prompt: 'Match each part of an adapter to its role.',
      pairs: [['The interface your code expects', 'Target'], ['The foreign class being wrapped', 'Adaptee'], ['The wrapper that translates between them', 'Adapter'], ['The code that calls the target', 'Client']],
      explain: 'The client talks to the target interface. The adapter implements it and delegates to the adaptee, translating along the way.' },

    { type: 'spot', prompt: 'This adapter is leaking the vendor into the rest of the app. Tap the line.',
      code: { lang: 'js', src: `
        class AcmeAdapter {
          constructor(sdk) { this.sdk = sdk; }
          charge(pence) {
            try {
              return this.sdk.makePayment({ cents: pence });
            } catch (e) {
              throw e; // an AcmeSdkError escapes
            }
          }
        }` },
      lines: [7],
      explain: 'Rethrowing the vendor’s own error type forces every caller to know about `AcmeSdkError`. Catch it and throw your own `PaymentFailed` error instead.' },

    { type: 'ab', q: 'The checkout screen, the mobile API and the admin tool all place orders. Which design is better?',
      a: { lang: 'js', label: 'Each repeats the steps', src: `
        // in three different files
        stock.reserve(items);
        payments.charge(total);
        shipping.book(address);
        mailer.sendReceipt(email);` },
      b: { lang: 'js', label: 'One front door', src: `
        // in three different files
        orders.placeOrder(order);
        // OrderFacade holds the steps` },
      answer: 'b',
      explain: 'The steps and their order live in one place. Repeating them in three files means three places to forget a step when the process changes.' },

    { type: 'tf', statement: 'A Facade removes the subsystem classes behind it, so nothing can use them directly any more.', answer: false,
      explain: 'A facade only offers a simpler way in. The subsystem classes still exist, and callers who need finer control can still use them.' },

    { type: 'scenario', title: 'The vendor swap', meters: { cleanliness: 40, effort: 70 },
      intro: 'Your app calls the Acme SMS library directly from 30 places. Acme doubles its prices and you must move to another provider with a quite different API.',
      steps: [
        { text: 'How do you make the move safely?',
          choices: [
            { label: 'Find and replace the Acme calls in all 30 places with the new vendor’s calls', score: 0, effects: { cleanliness: -15, effort: -30 }, feedback: 'It works, but you have swapped one welded dependency for another and will repeat this next time.' },
            { label: 'Create an SmsSender interface, write an adapter for each vendor, and point the 30 places at the interface', score: 2, effects: { cleanliness: 30, effort: -10 }, feedback: 'More work today, but vendors become swappable and the 30 callers never see a vendor again.' },
            { label: 'Keep Acme and wrap only the new calls in a try/catch', score: 0, effects: { cleanliness: -20 }, feedback: 'You now maintain two styles of call side by side with no clear boundary.' }
          ] },
        { text: 'Sending a campaign now needs five steps: load users, check opt-outs, build message, send via adapter, log results. Callers keep forgetting the opt-out check. What helps?',
          choices: [
            { label: 'A CampaignFacade with one `sendCampaign()` that runs the steps in order', score: 2, effects: { cleanliness: 25, effort: 5 }, feedback: 'The opt-out rule now lives in one place and cannot be forgotten by a caller.' },
            { label: 'A wiki page reminding developers of the five steps', score: 1, effects: { cleanliness: 5 }, feedback: 'Better than nothing, but people skip documents. Code that makes the right path the easy path is stronger.' },
            { label: 'Put all five steps inside the SMS adapter', score: 0, effects: { cleanliness: -20 }, feedback: 'The adapter should only translate. Piling business rules into it makes it a god class and hard to swap.' }
          ] }
      ],
      outro: 'Adapters hide *which vendor*. Facades hide *how many steps*.' },

    { type: 'explain', prompt: 'Explain the difference between an Adapter and a Facade, giving one example of each.',
      model: 'An Adapter makes an existing, incompatible interface fit the one my code expects, like wrapping a vendor payment SDK so it looks like my PaymentGateway interface; it translates calls and leaves both sides unchanged. A Facade provides a new, simpler interface over a group of classes, like a placeOrder method that coordinates stock, payment, shipping and email. Adapter is about compatibility; Facade is about simplicity.',
      keywords: ['adapter', 'facade', 'interface', 'translate', 'wrap', 'simpler', 'subsystem'] }
  ],

  flashcards: [
    { q: 'What does the Adapter pattern do?', a: 'Wraps an object with an incompatible interface so it presents the interface your code expects, translating calls between them.' },
    { q: 'What does the Facade pattern do?', a: 'Provides one simple interface over a complicated group of classes, so callers need not know the steps or the parts.' },
    { q: 'Adapter versus Facade in one line?', a: 'Adapter changes an interface to fit an existing one; Facade creates a new, simpler one over many classes.' },
    { q: 'What is a leaky adapter?', a: 'One that lets the wrapped code’s types or errors escape, so the rest of your app still depends on the vendor.' },
    { q: 'What is the risk of a facade?', a: 'It can grow into a god class that holds business logic. Keep it thin: coordinate, do not decide.' }
  ],

  glossary: [
    { term: 'Adapter', aka: ['Wrapper'], def: 'A GoF pattern: a class that converts the interface of an existing class into the one clients expect.', like: 'A travel plug adapter.' },
    { term: 'Adaptee', def: 'The existing class with the incompatible interface that an adapter wraps.', like: 'The foreign wall socket.' },
    { term: 'Facade', def: 'A GoF pattern: a simple interface in front of a more complex set of classes.', like: 'A hotel concierge.' },
    { term: 'Legacy code', def: 'Older code that still runs and matters but is hard to change or understand.', like: 'A creaky old bridge the whole town still drives over.' },
    { term: 'SDK', def: 'A software development kit: code a vendor supplies so that you can use their service from your program.', like: 'The instruction manual and tools that come with a gadget.' }
  ],

  takeaways: [
    '**Adapter**: translate a foreign interface into the one your code expects.',
    '**Facade**: one simple front door over a messy group of classes.',
    'Both keep ugly details in a single place and spare the rest of the code.',
    'Do not let vendor types leak through an adapter, and keep facades thin.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-decorator-proxy', {
  eli5: 'Both patterns wrap an object in another object that looks the same from outside. A decorator wraps it to add extra behaviour, and a proxy wraps it to stand guard in front of it.',

  cards: [
    { kind: 'concept', title: 'Extras without editing',
      body: `Your payment gateway works. Now the business wants every charge **logged**. Then failed charges **retried** up to three times. Then, for some customers only, charges **timed** for a monitoring dashboard.

        You could edit the gateway class each time, but now it is a tangle of unrelated jobs, and you cannot switch one off for a single customer.

        You could subclass: \`LoggingRetryingGateway\`, \`RetryingTimedGateway\`... and we have met that road before, the **class explosion** from the composition lesson.

        There is a third way: **wrap** the gateway in a thin layer that adds one extra thing and then passes the call on.` },

    { kind: 'metaphor', title: 'Gift wrapping',
      body: `You buy a book. Put it in paper and it is still a gift you can hand over. Add a ribbon: still a gift. Put that in a box: still a gift. Each layer **adds** something, and from the receiver's side you hold a parcel, whatever is inside.

        That is a **Decorator**: it has the **same outward shape** as the thing it wraps, so anyone who could use the original can use the wrapped one, and you can wrap it again and again.

        Where the metaphor stops: real wrapping hides the gift. A decorator always hands the call through to the thing inside, so the work still gets done.` },

    { kind: 'code', title: 'A decorator in code',
      body: 'The decorator implements the same interface as the gateway and *also* holds a gateway.',
      code: { lang: 'ts', src: `
        interface Gateway {
          charge(pence: number): Promise<void>;
        }

        class LoggingGateway implements Gateway {
          constructor(private inner: Gateway) {}

          async charge(pence: number) {
            console.log('charging', pence);
            await this.inner.charge(pence);
            console.log('charged ok');
          }
        }`,
        notes: {
          1: 'One interface. The wrapper and the real gateway both promise it.',
          6: 'The odd bit: it **is a** \`Gateway\` and it **has a** \`Gateway\`. That is what lets wrappers nest.',
          10: 'Forward the call. The extra behaviour (here, logging) goes before and/or after.'
        } } },

    { kind: 'code', title: 'Stacking decorators',
      body: 'Because every layer looks like a `Gateway`, you can stack as many as you like, and pick the stack per situation.',
      code: { lang: 'js', src: `
        const gateway =
          new LoggingGateway(
            new RetryGateway(
              new StripeGateway()
            )
          );

        await gateway.charge(1999);`,
        notes: {
          2: 'The outermost layer sees every call first.',
          3: 'The retry layer sits between the logger and the real thing.',
          4: 'The real gateway at the centre knows nothing about logging or retries.',
          8: 'The caller just sees a \`Gateway\`. It cannot tell how many layers there are, and it does not need to.'
        } },
      note: 'Two small decorators give you four combinations (neither, one, the other, both) with no extra classes. That is the composition lesson again.' },

    { kind: 'sequence', title: 'One call through the stack',
      body: 'The call travels inwards through each layer and the result travels back out.',
      actors: ['Caller', 'Logging', 'Retry', 'Stripe'],
      steps: [
        { from: 0, to: 1, label: 'charge(1999)', note: 'The caller talks to the outermost layer.' },
        { at: 1, label: 'log "charging"', note: 'The logger does its extra job before passing on.' },
        { from: 1, to: 2, label: 'charge(1999)', note: 'Same call, same shape, handed inwards.' },
        { from: 2, to: 3, label: 'charge(1999)', note: 'The retry layer calls the real gateway.' },
        { from: 3, to: 2, label: 'error', dashed: true, note: 'The first try fails.' },
        { from: 2, to: 3, label: 'charge(1999) again', note: 'Retry quietly tries again. The layers above never saw the failure.' },
        { from: 3, to: 2, label: 'ok', dashed: true, note: 'Second attempt works.' },
        { from: 1, to: 0, label: 'ok', dashed: true, note: 'The logger writes "charged ok" and the result goes back out to the caller.' }
      ] },

    { kind: 'concept', title: 'Proxy: a stand-in that guards',
      body: `A **Proxy** also has the same outward shape as the real object, but its purpose is different. A decorator **adds** behaviour. A proxy **controls access** to the real thing.

        Think of a receptionist at a company. You ask for the director, and the receptionist decides: is the director in, are you expected, should you wait? You deal with the receptionist exactly as you would with the director.

        The classic kinds:

        - **Virtual (lazy)**: do not create the expensive object until it is needed.
        - **Caching**: remember answers so the real thing is called less.
        - **Protection**: check permissions first.
        - **Remote**: a local stand-in for something on another machine, so calling it feels like a normal method call.` },

    { kind: 'code', title: 'A caching proxy',
      body: 'An exchange-rate service is slow and rates barely change in a minute. The proxy answers repeat questions itself.',
      code: { lang: 'js', src: `
        class CachingRates {
          constructor(realRates) {
            this.real = realRates;
            this.cache = new Map();
          }
          async get(currency) {
            if (this.cache.has(currency)) {
              return this.cache.get(currency);
            }
            const rate = await this.real.get(currency);
            this.cache.set(currency, rate);
            return rate;
          }
        }`,
        notes: {
          6: 'Same method as the real service, so callers cannot tell the difference.',
          7: 'A repeat question is answered here and the slow real service is never bothered.',
          10: 'Only a first-time question reaches the real thing.'
        } },
      note: 'Honest footnote: this *could* also be called a decorator, since it adds caching. The two patterns share a structure, and the names are told apart by **intent**: add a feature, or guard access.' },

    { kind: 'compare', title: 'Decorator, Proxy and plain inheritance',
      body: 'Three ways to get "the same thing, but with something extra".',
      cols: ['Decorator', 'Proxy', 'Inheritance'],
      rows: [
        ['Purpose', 'Add behaviour', 'Control access', 'Specialise a class'],
        ['Chosen when?', 'At runtime, by stacking', 'At runtime', 'When you write the code'],
        ['Combine several?', 'Yes, stack freely', 'Sometimes', 'Needs a new subclass for each combo'],
        ['Inner object', 'Handed in from outside', 'Often created by the proxy itself', 'Is the parent']
      ] },

    { kind: 'realworld', title: 'In the wild',
      body: `You have probably used these without noticing:

        - **Input streams.** In Java, wrapping a file reader inside a buffering reader inside a line reader is Decorator, one layer per ability.
        - **Middleware**: layers around a web request, like logging or authentication. They behave much like decorators stacked on your handler, and the pattern behind them is the subject of a later lesson.
        - **JavaScript's built-in \`Proxy\` object**, which intercepts reads and writes on another object and powers some frameworks' reactivity.
        - **Remote proxies** (often called *stubs*) that make a call to another server look like a local function call.
        - **Lazy-loading** of images or database records until they are actually needed.` },

    { kind: 'pitfall', title: 'The matryoshka problem',
      body: `Wrapping is powerful and easy to overdo.

        - **Order matters.** A retry inside a logger logs once; a logger inside a retry logs every attempt. Same pieces, different behaviour.
        - **Deep stacks are hard to debug.** A stack trace through six wrappers takes patience to read.
        - **Forgetting to forward.** A wrapper must pass along *every* method in the interface, including the ones you do not care about, or things silently go missing.
        - **Identity.** A wrapped object is not the same object as the original, so \`===\` comparisons can surprise you.

        If you have only one extra behaviour and it will never change, a plain method is simpler.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What must a decorator share with the object it wraps so that it can stand in for it?',
      options: ['The same interface, so callers use either one the same way', 'The same constructor arguments', 'The same private fields', 'A common parent class that already contains the extra behaviour'],
      answer: 0,
      why: [null, 'Constructors do not matter to callers who already hold the object.', 'Private fields are hidden. Sharing them would break encapsulation.', 'The whole point is that the extra behaviour lives in the wrapper, not in a shared parent.'],
      explain: 'Callers depend on the interface, so anything that implements it can be swapped in, including a wrapper that forwards to the real thing.' },

    { type: 'order', after: 4, prompt: 'A caller invokes charge() through Logging, then Retry, then the real Stripe gateway. Put the journey in order.',
      items: ['The caller calls the Logging layer', 'Logging does its job and calls Retry', 'Retry calls the real Stripe gateway', 'The result passes back out through Retry, then Logging, to the caller'],
      explain: 'Calls travel inwards layer by layer, each adding its bit, and the answer travels back out in the opposite direction.' },

    { type: 'mcq', q: 'A flaky gateway fails twice, then succeeds. A logger prints one line each time its `charge` runs. Compare `new Logging(new Retry(g))` with `new Retry(new Logging(g))`. How many lines are printed?',
      options: ['One line for the first stack, three for the second', 'Three for both stacks', 'One for both stacks', 'Three for the first stack, one for the second'],
      answer: 0,
      why: [null, 'Order changes what the logger sees, so the counts differ.', 'Order changes what the logger sees, so the counts differ.', 'It is the other way round: a logger on the outside is called once, even if retries happen beneath it.'],
      explain: 'A logger outside the retry is called once. A logger inside the retry runs again for each of the three attempts. Same parts, different behaviour, so order matters.' },

    { type: 'match', prompt: 'Match each kind of proxy to what it does.',
      pairs: [['Virtual proxy', 'Delays creating an expensive object until it is needed'], ['Caching proxy', 'Remembers results so the real object is called less'], ['Protection proxy', 'Checks permissions before letting a call through'], ['Remote proxy', 'A local stand-in for an object on another machine']],
      explain: 'All four look like the real object and sit in front of it. They differ in what they do while they stand guard.' },

    { type: 'bucket', prompt: 'Is the wrapper mainly adding behaviour (Decorator) or controlling access (Proxy)?', buckets: ['Decorator', 'Proxy'],
      items: [['Adds a timing measurement around every call', 0], ['Refuses the call unless the user is an admin', 1], ['Compresses data before passing it to a file writer', 0], ['Loads a huge image only when it is first displayed', 1], ['Adds a "[URGENT]" prefix to messages before sending', 0], ['Represents a service running on another server', 1]],
      explain: 'Adding something extra to what happens is decoration. Deciding whether, when or where the real call happens is proxying.' },

    { type: 'spot', prompt: 'This wrapper cannot be stacked or swapped. Tap the line that causes it.',
      code: { lang: 'js', src: `
        class LoggingGateway {
          constructor() {
            this.inner = new StripeGateway();
          }
          charge(pence) {
            console.log(pence);
            return this.inner.charge(pence);
          }
        }` },
      lines: [3],
      explain: 'The decorator creates its own inner object, so it is welded to Stripe and nothing else can sit inside it. The inner gateway should be passed in.' },

    { type: 'ab', q: 'The shop needs logging, retries and caching in any combination, chosen per customer. Which design copes better?',
      a: { lang: 'js', label: 'Subclass per combo', src: `
        class LoggingGateway extends StripeGateway { }
        class RetryGateway extends StripeGateway { }
        class LoggingRetryGateway extends StripeGateway { }
        class RetryCachingGateway extends StripeGateway { }
        // ...and so on for every combination` },
      b: { lang: 'js', label: 'Stackable wrappers', src: `
        let g = new StripeGateway();
        if (c.wantsLogs) g = new LoggingGateway(g);
        if (c.wantsRetry) g = new RetryGateway(g);
        if (c.wantsCache) g = new CachingGateway(g);` },
      answer: 'b',
      explain: 'Each feature is one small wrapper, and a stack is assembled at runtime. Subclassing needs a new class for every combination.' },

    { type: 'scenario', title: 'The slow report', meters: { speed: 40, safety: 50 },
      intro: 'An analytics report calls a slow pricing service dozens of times a page. Only managers should see profit figures. You can wrap the service.',
      steps: [
        { text: 'Pages are slow because the same prices are fetched repeatedly. What do you add?',
          choices: [
            { label: 'A caching proxy in front of the pricing service that has the same interface', score: 2, effects: { speed: 35 }, feedback: 'Callers are unchanged, repeat questions are answered locally, and you can switch the cache off by removing one wrapper.' },
            { label: 'Copy the pricing code into the report and cache it there', score: 0, effects: { speed: 10, safety: -15 }, feedback: 'Now two copies of pricing logic can disagree, and nothing else benefits from the cache.' },
            { label: 'Make the pricing service itself cache in a global variable', score: 1, effects: { speed: 25, safety: -10 }, feedback: 'It is faster, but you have mixed two jobs in one class and made it hard to test or turn off.' }
          ] },
        { text: 'Now the profit figures must be hidden from non-managers. Where does that check go?',
          choices: [
            { label: 'A protection proxy that checks the user’s role, then forwards the call', score: 2, effects: { safety: 40 }, feedback: 'The rule lives in one place in front of the service, and the report code needs no changes.' },
            { label: 'An if-statement in every report page', score: 0, effects: { safety: -20 }, feedback: 'Someone will forget one page, and that page leaks the figures.' },
            { label: 'Hide the numbers in the screen layout only', score: 0, effects: { safety: -30 }, feedback: 'Hiding in the interface is not protection. The data is still fetched and can be read by other means.' }
          ] }
      ],
      outro: 'Same shape, different jobs: add behaviour with decorators, guard access with proxies.' },

    { type: 'explain', prompt: 'Explain how a decorator and a proxy are alike, how they differ, and why stacking decorators beats subclassing for combinations.',
      model: 'Both wrap an object and share its interface, so callers cannot tell the difference. A decorator wraps to add behaviour, like logging or retries. A proxy wraps to control access, such as lazy loading, caching, permissions or reaching a remote object. Stacking decorators is better than subclassing because each feature is one small wrapper and any combination is assembled at runtime, rather than needing a subclass for every combination.',
      keywords: ['same interface', 'wrap', 'add behaviour', 'access', 'stack', 'combination', 'intent'] }
  ],

  flashcards: [
    { q: 'What is the Decorator pattern?', a: 'A wrapper with the same interface as the object it wraps, which adds behaviour before or after forwarding the call. Wrappers can be stacked.' },
    { q: 'What is the Proxy pattern?', a: 'A stand-in with the same interface as the real object that controls access to it: lazily, with caching, with permission checks, or remotely.' },
    { q: 'Decorator versus Proxy?', a: 'They can look identical in code. A decorator adds behaviour; a proxy controls access. The difference is intent.' },
    { q: 'Why does the order of stacked decorators matter?', a: 'Each layer sees only the calls made to it, so, for example, a logger inside a retry logs every attempt, while one outside logs once.' },
    { q: 'Name four kinds of proxy.', a: 'Virtual (lazy), caching, protection, and remote.' }
  ],

  glossary: [
    { term: 'Decorator', def: 'A GoF pattern: a wrapper with the same interface as the wrapped object that adds behaviour, and can be stacked with others.', like: 'Layers of gift wrap.' },
    { term: 'Proxy', def: 'A GoF pattern: a stand-in object with the same interface as the real one, controlling access to it.', like: 'A receptionist in front of the director.' },
    { term: 'Lazy loading', def: 'Delaying the creation or loading of something expensive until it is first needed.', like: 'Not cooking dinner until someone is hungry.' },
    { term: 'Wrapper', def: 'An object that holds another object and forwards calls to it, usually adding something on the way.', like: 'A phone case.' }
  ],

  takeaways: [
    'Wrappers share the **same interface** as what they wrap, so callers cannot tell.',
    '**Decorator** adds behaviour and stacks; **Proxy** controls access.',
    'Stacking small wrappers beats a subclass for every combination.',
    'Order of layers matters, and always forward every method.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-composite-bridge-flyweight', {
  eli5: 'Composite lets you treat a whole tree of things like one thing, Bridge splits two ideas that change separately, and Flyweight shares one copy of heavy data instead of repeating it thousands of times.',

  cards: [
    { kind: 'concept', title: 'Composite: one box, or a box of boxes',
      body: `Your shop sells products, and also **bundles**: a "Gaming Kit" contains a console and an "Accessories" bundle, which contains a controller and a headset. Bundles can hold products or other bundles, as deep as marketing likes.

        Now the checkout asks, "What is the price?" If it must check "is this a product or a bundle?" at every step, the code fills up with type checks.

        The **Composite** pattern says: make single items and groups share one interface. Ask either "what is your price?" and it just works. A folder on your computer is the same idea: a folder contains files and **other folders**, and "size" works on either.` },

    { kind: 'code', title: 'A composite in code',
      body: 'A `Bundle` is a `Priced` thing that holds more `Priced` things.',
      code: { lang: 'ts', src: `
        interface Priced {
          price(): number;
        }

        class Product implements Priced {
          constructor(private cost: number) {}
          price() { return this.cost; }
        }

        class Bundle implements Priced {
          private items: Priced[] = [];
          add(item: Priced) { this.items.push(item); }
          price() {
            return this.items.reduce((s, i) => s + i.price(), 0);
          }
        }

        const acc = new Bundle();
        acc.add(new Product(40)); acc.add(new Product(60));
        const kit = new Bundle();
        kit.add(new Product(300)); kit.add(acc);
        kit.price(); // 400`,
        notes: {
          1: 'Single products (**leaves**) and bundles (**composites**) both promise this.',
          11: 'A bundle holds \`Priced\` things, and that includes other bundles.',
          14: 'It asks each child for its price. If the child is itself a bundle, that bundle asks *its* children: **recursion** does the work.',
          22: 'The caller makes one call on the whole tree and never checks what kind of thing it holds.'
        } } },

    { kind: 'diagram', title: 'The tree',
      body: 'Boxes with children are composites. Boxes without are leaves. The caller treats them all alike.',
      nodes: [
        { id: 'kit', label: 'Gaming Kit (Bundle)', icon: '📦', x: 1, y: 0, tone: 'accent' },
        { id: 'con', label: 'Console (Product)', x: 0, y: 1 },
        { id: 'acc', label: 'Accessories (Bundle)', icon: '📦', x: 2, y: 1, tone: 'accent' },
        { id: 'pad', label: 'Controller (Product)', x: 1, y: 2 },
        { id: 'hs', label: 'Headset (Product)', x: 3, y: 2 }
      ],
      edges: [
        { from: 'kit', to: 'con', label: 'contains' },
        { from: 'kit', to: 'acc' },
        { from: 'acc', to: 'pad' },
        { from: 'acc', to: 'hs' }
      ],
      caption: 'price() on the kit adds up everything beneath it, however deep.' },

    { kind: 'metaphor', title: 'Bridge: the remote and the telly',
      body: `You own a TV remote. Remotes come in kinds: a basic one, and a fancy one with a "sleep timer" button. TVs come in brands. Without any plan, you might need a basic-Sony remote, fancy-Sony, basic-LG, fancy-LG: every pairing, a new product.

        Instead, remotes and TVs agree on one **small signal standard**. Now remotes (the controlling side) and TVs (the doing side) vary **independently**. A new TV brand works with every remote, and a new remote works with every TV.

        That agreed standard is the **bridge** between two things that change for different reasons.` },

    { kind: 'code', title: 'A bridge in code',
      body: 'Two things vary: the *kind* of notification, and the *channel* it travels on. Keep them in separate hierarchies and connect them with a reference.',
      code: { lang: 'ts', src: `
        interface Channel {
          deliver(text: string): void;
        }
        class EmailChannel implements Channel { /* ... */ }
        class SmsChannel implements Channel { /* ... */ }

        class Notification {
          constructor(protected channel: Channel) {}
          send(msg: string) { this.channel.deliver(msg); }
        }
        class UrgentNotification extends Notification {
          send(msg: string) { super.send('[URGENT] ' + msg); }
        }

        new UrgentNotification(new SmsChannel()).send('Server down');`,
        notes: {
          1: 'The **implementation** side: how the message actually travels.',
          8: 'The **bridge** itself: the abstraction holds a reference to an implementation.',
          11: 'A new kind of notification touches no channel class.',
          15: 'Any notification with any channel. 3 kinds and 4 channels is 3 + 4 classes, not 3 × 4.'
        } },
      note: 'If this looks familiar, it should: it is the notifier from the composition lesson, applied on purpose to two dimensions that both change. Unlike Adapter (which fixes a mismatch after the fact), a bridge is designed in up front.' },

    { kind: 'concept', title: 'Flyweight: share what is identical',
      body: `A game draws a forest of 100,000 trees. Every tree object carries its own copy of the same heavy 3D model and texture, though most trees are one of just a few species. The memory runs out.

        Notice the split. Some data is **identical** across thousands of trees (model, texture): call that **intrinsic**. Some is **unique** to each (position, size): **extrinsic**.

        **Flyweight** says: keep **one shared copy** of the intrinsic part, and let each tree hold only its own small bits plus a reference to the shared one. It is a box of rubber stamps: one "oak" stamp used a hundred thousand times, with only the *position* changing.` },

    { kind: 'code', title: 'A flyweight in code',
      body: 'A small pool hands out one shared `TreeType` per species.',
      code: { lang: 'js', src: `
        class TreeType {
          constructor(name, texture) {
            this.name = name;
            this.texture = texture;
          }
        }

        const types = new Map();
        function getTreeType(name, texture) {
          if (!types.has(name)) {
            types.set(name, new TreeType(name, texture));
          }
          return types.get(name);
        }

        class Tree {
          constructor(x, y, type) {
            this.x = x; this.y = y; this.type = type;
          }
        }

        const forest = [];
        for (let i = 0; i < 100000; i++) {
          forest.push(new Tree(i, i * 2, getTreeType('oak', img)));
        }`,
        notes: {
          8: 'The pool of shared objects. This little factory is the heart of a flyweight.',
          10: 'Only the **first** oak creates a \`TreeType\`.',
          18: 'A tree holds just two numbers and a reference. The heavy part is shared.',
          24: '100,000 trees, but only **one** \`TreeType\`.'
        } },
      note: 'The shared part must never be changed by one user, or every tree changes. Flyweight data should be **immutable**.' },

    { kind: 'compare', title: 'Three patterns, three problems',
      body: 'None of these is about creating objects. They are all about how a structure is shaped.',
      cols: ['Composite', 'Bridge', 'Flyweight'],
      rows: [
        ['Problem', 'Groups inside groups, but callers want one simple call', 'Two things vary independently and the classes multiply', 'Huge numbers of similar objects eat memory'],
        ['Key move', 'Leaves and groups share one interface', 'Split into two hierarchies joined by a reference', 'Share the identical part, keep unique bits outside'],
        ['Smell that hints at it', '`if (x instanceof Folder)` everywhere', 'A subclass for each pair, like `UrgentSms`', 'Many objects holding copies of the same big data']
      ] },

    { kind: 'realworld', title: 'Where you will actually meet them',
      body: `**Composite** is everywhere there is nesting. The web page you are reading is a tree of elements inside elements (the DOM). Interface components in most UI frameworks, menus with submenus, file systems, org charts and expression trees are all composites.

        **Bridge** is less often named than lived: code that works with several databases, graphics systems or payment providers through one steady interface looks a lot like a bridge. A database *driver* is a familiar example of the shape.

        **Flyweight** hides inside memory-hungry systems: text editors sharing glyph shapes, games reusing sprites and tiles, and many languages reusing a single copy of identical strings, which is called *string interning*.

        Most day-to-day developers meet Composite constantly, Bridge occasionally and Flyweight rarely.` },

    { kind: 'pitfall', title: 'Over-using the trio',
      body: `**Composite.** A leaf cannot have children, but a shared interface tempts you to give it an \`add()\` method anyway. You must decide: put \`add\` only on composites (safer), or on everything with leaves refusing (more uniform). Either is a trade-off.

        **Bridge.** If only **one** thing varies, you do not need two hierarchies, just an interface. Bridge pays off only when both sides really grow.

        **Flyweight.** It is an optimisation, and optimisations should follow **measuring**, not guessing. It also complicates code: sharing demands immutability and a pool. Do not reach for it until memory is a real, observed problem.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'In the Composite pattern, why do single products and bundles share an interface?',
      options: ['So callers can price either one without checking its kind', 'So bundles can inherit private fields from products', 'So that a product can contain other products', 'To make price calculation run faster'],
      answer: 0,
      why: [null, 'They share a contract, not private fields.', 'Only the composite holds children. A leaf does not.', 'Speed is not the aim. Simple callers are.'],
      explain: 'A shared interface lets code treat one item and a whole tree the same, with recursion handling the nesting inside the composite.' },

    { type: 'short', after: 4, q: 'A shop has 3 kinds of message (alert, report, reminder) and 4 channels. With a Bridge, how many concrete classes do you write for the kinds and channels together?', accept: ['7', 'seven'], hint: 'Add, not multiply.',
      explain: '3 + 4 = 7, because kinds and channels are separate hierarchies. Without a bridge, each pairing needs its own class: 3 × 4 = 12.' },

    { type: 'estimate', q: 'A game (a made-up example) has 100,000 trees. Each tree’s own copy of the shared 3D model and texture is about 2 MB. Roughly how many GB would that take without sharing?', answer: 200, unit: 'GB', tolerance: 3,
      explain: '100,000 × 2 MB = 200,000 MB, about 200 GB. With a Flyweight there is one shared copy per species, so a few MB, plus a few bytes of position per tree.' },

    { type: 'match', prompt: 'Match each pattern to the everyday picture that fits it best.',
      pairs: [['Composite', 'Folders containing files and other folders'], ['Bridge', 'Any remote works with any TV through a standard signal'], ['Flyweight', 'One rubber stamp used again and again'], ['Decorator (previous lesson)', 'Layers of gift wrap around a parcel']],
      explain: 'Composite is nesting treated uniformly, Bridge is two independent sides joined by an agreed interface, Flyweight is one shared copy used many times.' },

    { type: 'spot', prompt: 'This price calculation defeats the point of Composite. Tap the line.',
      code: { lang: 'js', src: `
        function totalPrice(item) {
          if (item instanceof Bundle) {
            return item.children.reduce((s, c) => s + totalPrice(c), 0);
          }
          return item.cost;
        }` },
      lines: [2],
      explain: 'The caller is checking what kind of thing it holds. With Composite, every item answers `price()` itself and the check disappears.' },

    { type: 'bucket', prompt: 'Which pattern solves each problem?', buckets: ['Composite', 'Bridge', 'Flyweight'],
      items: [['A menu whose items can be actions or whole sub-menus', 0], ['Reports in 3 formats going to 4 destinations without 12 classes', 1], ['A text editor sharing the shape of each letter between millions of characters', 2], ['A file system where "size" works on files and folders alike', 0], ['Drawing shapes with either of two graphics libraries, with shapes and libraries growing separately', 1], ['A map with millions of identical tree icons', 2]],
      explain: 'Nesting that should be treated uniformly is Composite, two sides that grow independently is Bridge, and many repeats of the same heavy data is Flyweight.' },

    { type: 'tf', statement: 'Any object using a Flyweight can safely change the shared data, because each object keeps its own copy.', answer: false,
      explain: 'There is only one shared copy, so one change would affect every object that uses it. That is why the shared (intrinsic) part is kept read-only and the changing part is stored outside.' },

    { type: 'scenario', title: 'The document editor', meters: { memory: 50, clarity: 50 },
      intro: 'You are building a rich text editor. A document holds paragraphs, which hold words, which hold characters. People paste 400-page documents.',
      steps: [
        { text: 'You want "bold this selection" to work on a single word, a paragraph or the whole document with the same call. What structure helps?',
          choices: [
            { label: 'Composite: every element, from character to document, shares one interface', score: 2, effects: { clarity: 35 }, feedback: 'Exactly. Call bold() on any node and the composites pass it down to their children.' },
            { label: 'One giant function with branches for each element type', score: 0, effects: { clarity: -25 }, feedback: 'Every new element type edits the same function, and the branches grow without end.' },
            { label: 'Store the whole document as one flat string with markers', score: 1, effects: { clarity: -5, memory: 10 }, feedback: 'Compact, but nesting, structure and per-element behaviour get awkward quickly.' }
          ] },
        { text: 'Memory use explodes: each of a million character objects carries its own copy of font data. What do you do?',
          choices: [
            { label: 'Measure first, then share one font object per style (a Flyweight) and keep position outside', score: 2, effects: { memory: 40, clarity: -5 }, feedback: 'Measure so you know it is the real problem, then share the identical part. Characters keep only what is unique.' },
            { label: 'Ask users to avoid long documents', score: 0, effects: { memory: 0, clarity: -10 }, feedback: 'That is not a solution, it is a complaint.' },
            { label: 'Compress every character object individually', score: 1, effects: { memory: 10 }, feedback: 'It saves a little, but you still store a million copies of the same data.' }
          ] }
      ],
      outro: 'Name the shape of the problem and the pattern follows.' },

    { type: 'explain', prompt: 'Pick any two of Composite, Bridge and Flyweight. Describe the problem each solves and the key move it makes.',
      model: 'Composite solves the problem of nested groups: leaves and groups share one interface so callers treat one item or a whole tree the same way, with recursion doing the work. Bridge solves two dimensions that vary independently, such as message kind and channel, by splitting them into two hierarchies joined by a reference, so you write 3 + 4 classes instead of 3 × 4. Flyweight saves memory by sharing the identical (intrinsic) data between many objects and keeping the unique (extrinsic) data outside.',
      keywords: ['composite', 'tree', 'same interface', 'bridge', 'independent', 'flyweight', 'shared', 'memory'] }
  ],

  flashcards: [
    { q: 'What is the Composite pattern?', a: 'Single items (leaves) and groups (composites) share one interface, so callers treat an individual and a whole tree the same way.' },
    { q: 'What is the Bridge pattern?', a: 'Split an abstraction from its implementation into two hierarchies joined by a reference, so each can vary independently.' },
    { q: 'What is the Flyweight pattern?', a: 'Share the identical (intrinsic) part of many similar objects through one pool, keeping the unique (extrinsic) part separate, to save memory.' },
    { q: 'Intrinsic versus extrinsic state?', a: 'Intrinsic state is shared and identical across objects. Extrinsic state is unique to each object and kept outside the shared part.' },
    { q: 'Where do you meet Composite most often?', a: 'In anything nested: the web page DOM, UI component trees, menus, file systems and org charts.' }
  ],

  glossary: [
    { term: 'Composite', def: 'A GoF pattern that lets individual objects and groups of objects be treated through one interface, forming a tree.', like: 'A folder that can hold files and other folders.' },
    { term: 'Leaf', def: 'In a composite tree, an item that has no children.', like: 'A file inside a folder.' },
    { term: 'Bridge', def: 'A GoF pattern that separates an abstraction from its implementation so the two can vary independently.', like: 'Any remote controlling any TV through a standard signal.' },
    { term: 'Flyweight', def: 'A GoF pattern that saves memory by sharing the common part of many similar objects.', like: 'One rubber stamp, a hundred thousand impressions.' },
    { term: 'Intrinsic state', def: 'The shared, unchanging data inside a flyweight, identical for every object that uses it.', like: 'The shape of the stamp.' },
    { term: 'Extrinsic state', def: 'The data unique to each use of a flyweight, which is stored or passed in from outside.', like: 'Where on the page you press the stamp.' }
  ],

  takeaways: [
    '**Composite**: leaves and groups share an interface, so one call works on a whole tree.',
    '**Bridge**: two ideas that vary separately get two hierarchies, joined by a reference.',
    '**Flyweight**: share the identical part; keep the unique part outside. Measure first.',
    'Spot them by smell: `instanceof` chains, class pairs like `UrgentSms`, thousands of copies of the same data.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('patterns-creational-structural', {
  title: 'The Blueprint Basilisk',
  intro: 'The Basilisk hoards a library of blueprints and turns careless architects to stone with one question: which pattern is this, and should you use it at all? Read the problems, name the shapes, and resist the urge to over-build.',
  questions: [
    { type: 'mcq', q: 'A teammate wants a Factory, a Builder and a Singleton for a 40-line script that prints one report. What is the best response?',
      options: ['Ask what real problem each one solves, and keep only those', 'Approve them all, since patterns always improve code', 'Add a fourth pattern so the design is balanced', 'Ban patterns from the project'],
      answer: 0,
      why: [null, 'Patterns cost extra classes and indirection, so they must earn their keep.', 'Adding more patterns adds more cost for no benefit.', 'Overcorrecting. Patterns are valuable once a real problem appears.'],
      explain: 'A pattern treats a problem you actually have. With no pain, the simple version is clearer.' },

    { type: 'bucket', prompt: 'Sort each pattern into its Gang of Four family.', buckets: ['Creational', 'Structural', 'Behavioural'],
      items: [['Prototype', 0], ['Abstract Factory', 0], ['Proxy', 1], ['Flyweight', 1], ['Composite', 1], ['Observer', 2], ['Singleton', 0], ['Bridge', 1]],
      explain: 'Prototype, Abstract Factory and Singleton make objects. Proxy, Flyweight, Composite and Bridge shape structures. Observer is about how objects react to each other, which the next module covers.' },

    { type: 'mcq', q: 'An installer must create a matching Button, Checkbox and ScrollBar, in either a Windows or a macOS style, and never mix the two. Which pattern fits?',
      options: ['Abstract Factory, with one factory per operating system', 'Singleton, so only one style can ever exist', 'Prototype, cloning one Windows button for the rest', 'Facade, hiding the three widgets behind one class'],
      answer: 0,
      why: [null, 'Singleton limits instances. It does not choose a matching family.', 'Cloning one widget does not guarantee the other two match.', 'A facade simplifies using subsystems. It does not decide which family is created.'],
      explain: 'A family of related products that must stay consistent is the signature use of an Abstract Factory.' },

    { type: 'ab', q: 'Which constructor call is the safer, more readable design for an order with many optional extras?',
      a: { lang: 'js', label: 'Positional', src: `
        new Order(ana, items, home, null, true, false, null)` },
      b: { lang: 'js', label: 'Builder', src: `
        new OrderBuilder(ana)
          .items(items).deliverTo(home).express()
          .build()` },
      answer: 'b',
      explain: 'Named steps show what was chosen and a swapped argument cannot hide, and `build()` is a single place to validate.' },

    { type: 'tf', statement: 'structuredClone makes a deep copy of plain data, but an object created from your own class comes back as a plain object without its methods.', answer: true,
      explain: 'It copies the data, nested parts included, but not the class prototype. For objects with behaviour you often write your own `clone()` method.' },

    { type: 'spot', prompt: 'One line makes this class awkward to unit test. Tap it.',
      code: { lang: 'js', src: `
        class InvoiceService {
          constructor(mailer) {
            this.mailer = mailer;
          }
          send(invoice) {
            const rate = Config.getInstance().get('tax');
            this.mailer.send(invoice.total * (1 + rate));
          }
        }` },
      lines: [6],
      explain: 'The mailer arrives through the constructor, but the tax rate is quietly pulled from a global singleton. A test cannot supply its own config, and tests can affect each other through it.' },

    { type: 'match', prompt: 'Match each situation to the pattern.',
      pairs: [['Make a vendor SDK fit your own interface', 'Adapter'], ['One placeOrder() over four subsystems', 'Facade'], ['Stackable logging around a service', 'Decorator'], ['A stand-in that checks permissions first', 'Proxy']],
      explain: 'Adapter fixes a mismatch, Facade simplifies a cluster, Decorator adds behaviour, and Proxy controls access. The last two can look identical in code, so tell them apart by intent.' },

    { type: 'mcq', q: 'You need exactly one shared Config in your app but want easy testing. What is the best approach?',
      options: ['Create it once at start-up and pass it into the classes that need it', 'Use a classic getInstance() and call it everywhere', 'Copy the settings into each class', 'Make every setting a global variable'],
      answer: 0,
      why: [null, 'That brings back the hidden dependency and shared state that hurt testing.', 'Copies drift out of sync.', 'Globals are the same problem as a singleton, only less organised.'],
      explain: 'Dependency injection gives you one instance without global access, and a test can hand in a fake.' },

    { type: 'order', prompt: 'Order the steps for wrapping a third-party vendor safely.',
      items: ['Define the interface your own code wants', 'Write an adapter implementing it around the vendor SDK', 'Translate vendor errors and data into your own types', 'Point your code at the interface, never at the SDK'],
      explain: 'Start from what your code needs, adapt the vendor to that shape, keep vendor types from leaking out, and then depend only on your interface.' },

    { type: 'cloze', code: true, text: 'class RetryGateway {\n  constructor(private {{inner}}: Gateway) {}\n  charge(pence: number) {\n    return this.inner.{{charge}}(pence);\n  }\n}',
      distractors: ['refund', 'super', 'static'],
      explain: 'A decorator holds the thing it wraps, passed in from outside, and forwards the call to it.' },

    { type: 'short', q: 'Which GoF pattern is a stand-in with the same interface as the real object, used to control access to it?', accept: ['proxy', 'proxy pattern'], hint: 'Starts with P.',
      explain: 'A Proxy looks like the real object but controls when, whether or how the real one is reached: lazily, with caching, with permission checks or remotely.' },

    { type: 'multi', q: 'Which situations call for Composite, Bridge or Flyweight?',
      options: ['A menu whose entries can be actions or nested sub-menus', 'Reports in 3 formats sent to 4 destinations, with a class for every pair looming', 'A map drawing millions of identical tree icons', 'Adding a "[URGENT]" prefix to messages before sending', 'Hiding four subsystem calls behind one method'],
      answers: [0, 1, 2],
      explain: 'Nested menus are Composite, the format-by-destination explosion is Bridge, and millions of identical icons are Flyweight. The prefix is a Decorator and the single method is a Facade.' },

    { type: 'estimate', q: 'A game (a made-up case) has 50,000 enemies and each carries its own 4 MB copy of one shared model. About how many GB does that waste compared with sharing one copy?', answer: 200, unit: 'GB', tolerance: 3,
      explain: '50,000 × 4 MB = 200,000 MB, about 200 GB. A Flyweight keeps one shared model and gives each enemy only its position and health.' }
  ]
});

KS.sheet('patterns-creational-structural', {
  title: 'Design Patterns I: cheat sheet',
  sections: [
    { title: 'What a pattern is',
      md: `A **named, reusable recipe** for a recurring design problem. Not code you import: a shape you write yourself.

        | Family | Question | Patterns |
        |---|---|---|
        | Creational (5) | How do I **make** objects? | Factory Method, Abstract Factory, Builder, Prototype, Singleton |
        | Structural (7) | How do I **fit** them together? | Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy |
        | Behavioural (11) | How do they **cooperate**? | Next module |

        **No pain, no pattern.** Simple first, refactor towards a pattern when the problem is real.` },

    { title: 'Factories',
      md: `\`new\` names an exact class, which welds you to it.

        | Idea | Who chooses the class |
        |---|---|
        | Simple factory (not GoF) | A function with a branch |
        | Factory Method | A **subclass** overrides a creating method |
        | Abstract Factory | One factory makes a **matching family** |

        Skip it when only one class exists. In JS you can often pass a function instead.` },

    { title: 'Builder and Prototype',
      md: `**Builder**: assemble step by step through named methods; \`build()\` validates and creates. Cures the **telescoping constructor**. Fluent steps \`return this\`.

        For simple cases, an options object (\`new Order({ express: true })\`) does the job.

        **Prototype**: clone a configured object and tweak it.

        - Shallow copy: nested objects are **shared**.
        - Deep copy (\`structuredClone\`): nested data copied, but class methods are not.` },

    { title: 'Singleton',
      md: `One instance plus a global way to reach it.

        - Hidden dependency, **global state in disguise**
        - Tests leak into each other
        - Tied to a concrete class
        - Threads can create two

        **Better:** create once at start-up and **inject**. If you must, keep it read-only, behind an interface. A module in JS or Python is already a singleton. Experts split: many call it an anti-pattern.` },

    { title: 'Wrappers: Adapter, Facade, Decorator, Proxy',
      md: `| Pattern | Intent | Analogy |
        |---|---|---|
        | Adapter | Make a foreign interface match the expected one | Travel plug |
        | Facade | One simple door over many classes | Concierge |
        | Decorator | Add behaviour, stackable | Gift wrap |
        | Proxy | Control access: lazy, cache, protect, remote | Receptionist |

        Decorator and Proxy can look identical: judge by **intent**. Order of stacked layers matters. Do not leak vendor types, and keep facades thin.` },

    { title: 'Composite, Bridge, Flyweight',
      md: `| Pattern | Key move | Smell |
        |---|---|---|
        | Composite | Leaves and groups share an interface | \`instanceof\` checks everywhere |
        | Bridge | Two hierarchies joined by a reference | \`UrgentSms\`-style class pairs |
        | Flyweight | Share intrinsic data, keep extrinsic outside | Many copies of the same big data |

        3 kinds × 4 channels: 12 classes by inheritance, 3 + 4 = 7 with Bridge. Flyweight data must be **immutable**, and measure before optimising.` }
  ]
});

