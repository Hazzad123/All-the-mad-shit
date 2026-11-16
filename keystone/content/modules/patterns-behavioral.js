/* Module: patterns-behavioral — Design Patterns II: Behaviour & Beyond.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs patterns-behavioral */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-strategy-state', {
  eli5: 'Strategy lets you swap how a job is done, like choosing a different route on a sat-nav. State lets an object act differently depending on what mood, or stage, it is currently in.',

  cards: [
    { kind: 'concept', title: 'The switch that never stops growing',
      body: `Your shop calculates shipping. At first there are three ways to send something, so a \`switch\` statement does the job. Then marketing adds next-day delivery. Then a click-and-collect option. Then a "free over £50" rule that only applies to two of them.

        Every change means reopening the same function and hoping you do not break the other cases. The function turns into a pile of rules that nobody wants to touch.

        This is what **behavioural patterns** are about: not how objects are made or joined, but how they **behave and cooperate**. The first two are about changing behaviour cleanly.` },

    { kind: 'code', title: 'Before: one function knows every rule',
      body: 'Tap the highlighted lines.',
      code: { lang: 'js', src: `
        function shippingCost(order) {
          switch (order.method) {
            case 'standard':
              return 3.99;
            case 'express':
              return 9.99 + order.weight * 0.5;
            case 'international':
              return 19.99 + order.weight * 2;
            default:
              throw new Error('unknown method');
          }
        }`,
        notes: {
          2: 'Every shipping rule lives in this one function.',
          8: '**A new method means editing this function**, and a slip can break the others. The code is open to change when it should be open to *extension* (you met that in the Open/Closed lesson).'
        } } },

    { kind: 'metaphor', title: 'The sat-nav',
      body: `You tell a sat-nav where you are going, and it can plan the route in different ways: fastest, shortest, avoid motorways, avoid tolls. The destination is the same and the screen looks the same. Only the **method of choosing the route** changes, and you can swap it in a tap.

        That is the **Strategy** pattern: define a family of interchangeable ways of doing one job, put each in its own box with the same shape, and let the caller pick one.

        The sat-nav does not contain a giant "if fastest... else if shortest..." It simply asks whichever planner is selected.` },

    { kind: 'code', title: 'After: pick a strategy',
      body: 'Each rule becomes one small piece. The checkout is handed the one it should use.',
      code: { lang: 'js', src: `
        const standard = () => 3.99;
        const express = (o) => 9.99 + o.weight * 0.5;
        const international = (o) => 19.99 + o.weight * 2;

        class Checkout {
          constructor(shipping) { this.shipping = shipping; }
          total(order) {
            return order.subtotal + this.shipping(order);
          }
        }

        new Checkout(express).total(order);
        new Checkout(international).total(order);`,
        notes: {
          1: 'Each **strategy** is one small piece. Here they are plain functions. In a more traditional style each would be a class with a shared method, like \`calculate(order)\`.',
          6: 'The checkout is **handed** the strategy it should use (that is dependency injection again).',
          8: 'It just asks. It neither knows nor cares which rule it got.',
          12: 'Swap the rule by passing a different one. A new shipping method is a new function and the checkout is untouched.'
        } } },

    { kind: 'diagram', title: 'The shape of Strategy',
      body: 'The context holds one strategy and delegates the decision to it.',
      nodes: [
        { id: 'ctx', label: 'Checkout (context)', icon: '🛒', x: 1, y: 0, tone: 'accent' },
        { id: 'if', label: 'ShippingStrategy', x: 1, y: 1, tone: 'info' },
        { id: 's1', label: 'Standard', x: 0, y: 2, tone: 'good' },
        { id: 's2', label: 'Express', x: 1, y: 2, tone: 'good' },
        { id: 's3', label: 'International', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'ctx', to: 'if', label: 'delegates to' },
        { from: 's1', to: 'if', label: 'is a', dashed: true },
        { from: 's2', to: 'if', dashed: true },
        { from: 's3', to: 'if', dashed: true }
      ],
      caption: 'The client (or a config file) decides which strategy to hand over.' },

    { kind: 'concept', title: 'State: the object that changes its mind',
      body: `Now a different headache. A blog post is a **draft**, then **in review**, then **published**, then **archived**. The same button, "Publish", should do different things in each stage: from a draft it sends it for review, from review it says "already waiting", from published it does nothing.

        If you track this with a \`status\` field, every method fills up with \`if (status === ...)\` checks that must stay in step with each other.

        Picture a **turnstile** at a station: push it with no ticket and it stays locked, push it after paying and it opens, then locks again. Same push, different result, because of the state it is in.` },

    { kind: 'code', title: 'State as objects',
      body: 'Each stage becomes a small class that knows what every action means *in that stage*, and what comes next.',
      code: { lang: 'js', src: `
        class Draft {
          publish(doc) { doc.setState(new InReview()); }
          edit(doc, text) { doc.text = text; }
        }
        class InReview {
          publish(doc) { /* already waiting */ }
          edit(doc) { throw new Error('locked during review'); }
          approve(doc) { doc.setState(new Published()); }
        }
        class Document {
          constructor() { this.state = new Draft(); }
          setState(s) { this.state = s; }
          publish() { this.state.publish(this); }
          edit(text) { this.state.edit(this, text); }
        }`,
        notes: {
          1: 'Each state is its own class, with no \`status\` string to compare.',
          2: 'The state itself decides what happens next. **Transitions live inside the states.**',
          7: 'The same call, \`edit\`, behaves differently from the draft version. No \`if\` required.',
          13: 'The document does nothing clever. It hands every request to its **current state**.'
        } } },

    { kind: 'diagram', title: 'A state machine',
      body: `What you have just drawn is a **state machine**: a fixed set of states, and the events that move you between them. Drawing it as boxes and arrows is a good habit before writing any code.`,
      nodes: [
        { id: 'd', label: 'Draft', x: 0, y: 0, tone: 'muted' },
        { id: 'r', label: 'In review', x: 1, y: 1, tone: 'warn' },
        { id: 'p', label: 'Published', x: 2, y: 2, tone: 'good' },
        { id: 'a', label: 'Archived', x: 3, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'd', to: 'r', label: 'submit' },
        { from: 'r', to: 'p', label: 'approve' },
        { from: 'r', to: 'd', label: 'reject', dashed: true },
        { from: 'p', to: 'a', label: 'archive' }
      ],
      caption: 'Anything not drawn, like Draft straight to Published, is simply not allowed.' },

    { kind: 'compare', title: 'Strategy versus State',
      body: 'The class diagrams look almost the same. The intent is not.',
      cols: ['Strategy', 'State'],
      rows: [
        ['Question answered', '*How* do I do this job?', '*What can I do right now?*'],
        ['Who changes it', 'Usually the **client**, from outside', 'The **object itself**, as it moves along'],
        ['Do the parts know each other?', 'No, each is independent', 'Yes, states know the next state'],
        ['Typical life', 'Chosen once, often kept', 'Changes many times during an object’s life'],
        ['Example', 'Shipping rule, sort order', 'Order: paid, shipped, delivered']
      ] },

    { kind: 'pitfall', title: 'Too much for too little',
      body: `Both patterns trade one big function for several small classes. That is a bad bargain when the function was small.

        - Two shipping options and no sign of a third? A plain \`if\` is clearer.
        - A status with three values and one method that checks it? An \`enum\` and a \`switch\` are fine. State pays off when many methods all branch on the same status.
        - In languages with functions as values, a strategy is often just a function, as you saw.
        - A state machine with dozens of states and transitions is easier to understand as a **table** (state, event, next state) than as dozens of classes.

        Reach for the pattern when the \`switch\` or \`if\` chain is appearing in **many places** or growing every month.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the main design problem with the big `shippingCost` switch statement?',
      options: ['Adding a new shipping method means editing the same function every time', 'A switch is always slower than a function call', 'JavaScript cannot return different numbers from one function', 'It uses too many variables'],
      answer: 0,
      why: [null, 'Speed is not the concern here. Change is.', 'A function can return anything it likes.', 'The number of variables is not the issue.'],
      explain: 'Each new rule edits shared code and risks breaking the others. Strategy turns each rule into its own piece so adding one is an addition, not an edit.' },

    { type: 'ab', after: 4, q: 'A new "next-day" shipping option arrives. Which design makes adding it safer?',
      a: { lang: 'js', label: 'Strategy', src: `
        const nextDay = (o) => 14.99 + o.weight;
        new Checkout(nextDay).total(order);` },
      b: { lang: 'js', label: 'Switch', src: `
        switch (order.method) {
          case 'standard': return 3.99;
          case 'express': return 9.99;
          case 'nextday': return 14.99; // edit here
        }` },
      answer: 'a',
      explain: 'The strategy version only adds new code. The switch version reopens a function that already works for the other methods.' },

    { type: 'cloze', code: true, text: 'class Checkout {\n  constructor(shipping) {\n    this.{{shipping}} = shipping;\n  }\n  total(order) {\n    return order.subtotal + this.shipping({{order}});\n  }\n}\nnew Checkout(express).total(myOrder);  // swap the {{strategy}} by passing another',
      distractors: ['state', 'switch', 'super'],
      explain: 'The context stores the strategy in a field and delegates to it. Passing a different function swaps the behaviour.' },

    { type: 'order', after: 7, prompt: 'Put the blog post’s life in the order the state machine allows.',
      items: ['Draft', 'In review', 'Published', 'Archived'],
      explain: 'A draft is submitted for review, an approved post is published, and a published post can be archived. Skipping straight from Draft to Published is not an arrow in the diagram, so it is not allowed.' },

    { type: 'spot', prompt: 'This is the "before" shape that State cures. Tap the line that must be kept in step with the same check in other methods.',
      code: { lang: 'js', src: `
        class Document {
          publish() {
            if (this.status === 'draft') this.status = 'review';
            else if (this.status === 'review') return;
          }
          edit(text) {
            if (this.status === 'draft') this.text = text;
            else throw new Error('locked');
          }
        }` },
      lines: [3, 7],
      explain: 'Both methods branch on the same `status` string. Add a new status and you must find and update every one of these checks. State puts each status’s behaviour in one place.' },

    { type: 'bucket', prompt: 'Strategy or State?', buckets: ['Strategy', 'State'],
      items: [['Choosing fastest, shortest or toll-free route on a sat-nav', 0], ['An order that acts differently when Paid, Shipped or Cancelled', 1], ['A different tax rule per country, picked by the caller', 0], ['A media player where the play button means pause while playing', 1], ['Sorting a list with a pluggable comparison', 0], ['A turnstile that is locked until a coin is inserted', 1]],
      explain: 'Strategy is a choice made from outside among interchangeable ways of doing one job. State is behaviour that changes as the object itself moves through stages.' },

    { type: 'tf', statement: 'In the State pattern, the states themselves usually know which state comes next.', answer: true,
      explain: 'That is the usual design: a Draft state moves the document to InReview. With Strategy, by contrast, the strategies are independent and know nothing of each other.' },

    { type: 'scenario', title: 'Black Friday', meters: { safety: 50, tidiness: 40 },
      intro: 'Your discount code is a function with a growing chain of `if`s: percentage off, fixed amount off, buy-one-get-one, free shipping. Black Friday adds three new kinds next week.',
      steps: [
        { text: 'How do you prepare?',
          choices: [
            { label: 'Add three more else-ifs and test carefully', score: 0, effects: { safety: -15, tidiness: -20 }, feedback: 'It works once, but each change still reopens a function full of unrelated rules.' },
            { label: 'Make each discount kind its own strategy and have the cart apply the chosen one', score: 2, effects: { safety: 25, tidiness: 30 }, feedback: 'Each rule is isolated and testable on its own, and the three new kinds are three new pieces rather than edits.' },
            { label: 'Rewrite the checkout page entirely', score: 0, effects: { safety: -20 }, feedback: 'Far too big a change for a problem that is one function.' }
          ] },
        { text: 'Orders also need to follow a lifecycle: placed, paid, packed, shipped, delivered, with different allowed actions at each stage, and many methods already check an `order.status` string. What helps?',
          choices: [
            { label: 'State: one class per stage, each knowing what its actions mean and what comes next', score: 2, effects: { safety: 25, tidiness: 20 }, feedback: 'The status checks scattered over many methods collapse into one place per stage.' },
            { label: 'Strategy: pass in a different shipping function per stage', score: 1, effects: { tidiness: 5 }, feedback: 'Close in shape but not in intent. The order is changing by itself over time, which is State’s job.' },
            { label: 'Add yet another status string', score: 0, effects: { safety: -15 }, feedback: 'More strings mean more places to forget a check.' }
          ] }
      ],
      outro: 'Strategy: choose how. State: remember where you are.' },

    { type: 'explain', prompt: 'Explain Strategy and State, and what makes them different even though they look alike.',
      model: 'Strategy puts each interchangeable way of doing one job, like shipping cost rules, in its own object with a shared shape, and the client picks which one to hand to the context, killing the giant switch. State puts each stage an object can be in, like draft or published, into its own class so the object behaves differently as its state changes, with the states usually moving the object to the next one. They look alike structurally, but Strategy is chosen from outside, while State changes itself as it goes.',
      keywords: ['strategy', 'state', 'swap', 'switch', 'client', 'itself', 'transition', 'stage'] }
  ],

  flashcards: [
    { q: 'What is the Strategy pattern?', a: 'Put each interchangeable way of doing a job in its own object with a shared interface, and let the caller choose which one the context uses.' },
    { q: 'What is the State pattern?', a: 'An object delegates its behaviour to a current state object, so it acts differently as its state changes. The states usually trigger the transitions.' },
    { q: 'Strategy versus State in one line?', a: 'Strategy: how to do something, chosen from outside. State: what can be done now, changing as the object moves along.' },
    { q: 'What is a state machine?', a: 'A fixed set of states and the events that move between them, often drawn as boxes and arrows.' },
    { q: 'When is a plain switch better than these patterns?', a: 'When there are only a few cases that rarely change and the branching happens in one place.' }
  ],

  glossary: [
    { term: 'Strategy', def: 'A GoF pattern: a family of interchangeable algorithms, each in its own object, selectable at runtime.', like: 'The route options on a sat-nav.' },
    { term: 'State pattern', def: 'A GoF pattern that lets an object change its behaviour when its internal state changes, by delegating to a state object.', like: 'A turnstile: same push, different result.' },
    { term: 'State machine', def: 'A model made of a fixed set of states and the transitions between them, triggered by events.', like: 'A board game track where only certain moves are allowed.' },
    { term: 'Context', def: 'In Strategy and State, the object that holds the current strategy or state and delegates to it.', like: 'The sat-nav itself, holding whichever planner you selected.' },
    { term: 'Behavioural pattern', def: 'A pattern about how objects divide up responsibility and communicate with each other.', like: 'The etiquette for who speaks when in a meeting.' }
  ],

  takeaways: [
    '**Strategy**: swap *how* a job is done, killing the giant switch.',
    '**State**: behaviour follows the stage the object is in, and the states move it on.',
    'They look alike; the difference is who changes it and why.',
    'Small, stable `if`s do not need either. Wait for the pain.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-observer-mediator', {
  eli5: 'Observer is a newsletter: something announces news and everyone who signed up hears it. Mediator is an air-traffic controller: instead of every plane talking to every other plane, they all talk to the tower.',

  cards: [
    { kind: 'concept', title: 'The class that knows everyone',
      body: `When a customer places an order, a lot must happen: save it, email a receipt, reduce stock, record analytics, award loyalty points. The obvious code is a method that calls each of them in turn.

        It works, but now the order class **knows every team that cares about orders**. Each new reaction means reopening it. And you cannot test ordering without email, stock and analytics all present.

        What you want is for the order to simply **announce** "an order was placed", and for anyone interested to react. That is the **Observer** pattern.` },

    { kind: 'code', title: 'Before: one method calls everybody',
      body: 'Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class OrderService {
          place(order) {
            this.save(order);
            this.email.sendReceipt(order);
            this.stock.reduce(order.items);
            this.analytics.track('order', order);
            this.loyalty.addPoints(order);
          }
        }`,
        notes: {
          4: 'The order service must hold a reference to the email system, the stock system... it knows every listener by name.',
          7: '**A new reaction means editing \`place()\`**, even though placing an order has not changed at all.'
        } } },

    { kind: 'metaphor', title: 'The newsletter',
      body: `A channel publishes a video. Thousands of people have subscribed, and each is told. The channel does not keep a list of who is watching on which phone, and it does not care what viewers do next. Viewers can subscribe and unsubscribe whenever they like without the channel changing anything.

        In **Observer** the channel is the **subject** (also called the publisher), the viewers are **observers** (subscribers, listeners), and "a new video" is an **event**.

        The subject knows only one thing about its observers: **they can be told**. That keeps them loosely coupled.`,
      note: 'This is also called publish/subscribe, or pub/sub, in this lesson’s sense: inside one program.' },

    { kind: 'code', title: 'Observer in about fifteen lines',
      body: 'A tiny event emitter, and then the order service using it.',
      code: { lang: 'js', src: `
        class Emitter {
          listeners = {};
          on(event, fn) {
            (this.listeners[event] ??= []).push(fn);
            return () => this.off(event, fn);
          }
          off(event, fn) {
            const all = this.listeners[event] ?? [];
            this.listeners[event] = all.filter((f) => f !== fn);
          }
          emit(event, data) {
            for (const fn of this.listeners[event] ?? []) fn(data);
          }
        }

        const orders = new Emitter();
        orders.on('placed', (o) => sendEmail(o));
        orders.on('placed', (o) => reduceStock(o));
        orders.emit('placed', order);`,
        notes: {
          4: 'Subscribing just stores the function under the event name.',
          5: 'It hands back an **unsubscribe** function. Hold onto that idea, it matters in a moment.',
          12: 'Announcing loops over everyone listening. The emitter has no idea what they will do.',
          19: 'The order code just says what happened. Adding a loyalty listener later edits nothing here.'
        } } },

    { kind: 'sequence', title: 'Subscribing, then an event',
      body: 'Listeners register once, then hear about every event.',
      actors: ['Orders', 'Email', 'Stock'],
      steps: [
        { from: 1, to: 0, label: 'on("placed", …)', note: 'The email system subscribes. Orders just stores the function.' },
        { from: 2, to: 0, label: 'on("placed", …)', note: 'So does stock. Orders still has no idea what stock is.' },
        { at: 0, label: 'an order is placed', note: 'Something happens in the order code.' },
        { from: 0, to: 1, label: 'placed(order)', note: 'Orders announces the event to the first listener.' },
        { from: 0, to: 2, label: 'placed(order)', note: 'And to the second. It never waits to see what they do with it.' }
      ] },

    { kind: 'code', title: 'The forgotten subscription',
      body: 'Observer has one famous trap. Look at what is still alive after the badge is gone.',
      code: { lang: 'js', src: `
        class PriceBadge {
          constructor(prices) {
            prices.on('changed', (p) => this.show(p));
          }
          show(p) { /* update the screen */ }
        }

        // later, the badge is removed from the page...
        badge = null;`,
        notes: {
          3: 'The emitter now holds this function, which holds the badge. As long as the emitter lives, **so does the badge**.',
          9: 'You let go of the badge, but the emitter still holds it. This is a **memory leak**, and the dead badge is still reacting to every price change.'
        } },
      note: 'The fix: keep the function that \`on()\` returned, for example \`this.stop = prices.on(...)\`, and call it when the badge is destroyed. Browsers have \`removeEventListener\` for the same reason. Subscribing is a promise to unsubscribe.' },

    { kind: 'concept', title: 'Mediator: everyone talking to everyone',
      body: `A sign-up form: when the **country** dropdown changes, the **city** list must reload and the **submit** button must disable until a city is chosen. If each widget talks to the others directly, each must know about each, and with ten widgets there are up to forty-five possible conversations to keep straight.

        The cure is how airports work. Planes do not talk to each other, they all talk to the **control tower**, and only the tower knows the whole picture. That is the **Mediator**.

        Each widget just says "I changed" to the mediator, which holds the rules about who should react.`,
      code: { lang: 'js', src: `
        class SignupDialog {
          constructor(country, city, submit) {
            Object.assign(this, { country, city, submit });
          }

          notify(sender, event) {
            if (sender === this.country && event === 'changed') {
              this.city.loadCitiesFor(this.country.value);
              this.submit.disable();
            }
            if (sender === this.city && event === 'changed') {
              this.submit.enable();
            }
          }
        }`,
        notes: {
          1: 'The **mediator**. It is the only class that knows all the widgets.',
          6: 'Widgets only report events here. They no longer know each other exist.',
          8: 'The rules about who reacts to whom sit together in one readable place.'
        } } },

    { kind: 'diagram', title: 'Tangle versus tower',
      body: 'With a mediator, each widget has exactly one connection, however many widgets there are.',
      nodes: [
        { id: 'co', label: 'Country dropdown', x: 0, y: 0 },
        { id: 'ci', label: 'City dropdown', x: 2, y: 0 },
        { id: 'med', label: 'SignupDialog (mediator)', icon: '🗼', x: 1, y: 1, tone: 'accent' },
        { id: 'su', label: 'Submit button', x: 1, y: 2 }
      ],
      edges: [
        { from: 'co', to: 'med', label: 'changed', both: true },
        { from: 'ci', to: 'med', both: true },
        { from: 'su', to: 'med', both: true }
      ],
      caption: 'Adding a fourth widget adds one line, not one line per existing widget.' },

    { kind: 'compare', title: 'Observer versus Mediator',
      body: 'Both reduce direct links between objects, in different shapes.',
      cols: ['Observer', 'Mediator'],
      rows: [
        ['Shape', 'One announces, many may listen', 'Many talk through one centre'],
        ['Sender knows', 'Nothing about who listens', 'Only the mediator'],
        ['Rules live', 'Scattered in each listener', 'Together in the mediator'],
        ['Main risk', 'Invisible chains of reactions, and leaks', 'The mediator swells into a god class'],
        ['Good for', 'Events anyone might want to hear', 'Coordinating a fixed group of parts']
      ] },

    { kind: 'realworld', title: 'In the wild',
      body: `You use Observer constantly. In a browser, \`button.addEventListener('click', ...)\` is Observer: the button announces, your function listens. Node.js ships an \`EventEmitter\` class that is exactly the one you just wrote, with extras. User-interface frameworks and state libraries are largely Observer underneath, redrawing whatever depends on a piece of data when it changes.

        A **chat room** is a mediator: users send to the room, and the room decides who receives it. Dialog boxes and form libraries use mediators to coordinate their fields.

        Everything here happens **inside one program**. When the same announce-and-listen idea runs between separate services, it needs a message broker. You will meet that in later modules.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Why is it a problem for OrderService to call email, stock, analytics and loyalty directly?',
      options: ['Each new reaction to an order means editing OrderService', 'Calling several methods in a row is not allowed in OOP', 'It makes each order noticeably slower to save', 'It stops the email system from sending messages'],
      answer: 0,
      why: [null, 'There is no such rule. The issue is how many things the class has to know about.', 'Speed is not the concern here.', 'The calls would work. They are just tightly coupled.'],
      explain: 'The order service is coupled to every consumer of its news. With Observer it just announces, and listeners attach themselves.' },

    { type: 'order', after: 4, prompt: 'Put the life of an Observer event in order.',
      items: ['Listeners subscribe to the event', 'Something happens and the subject emits the event', 'The subject loops over its listeners', 'Each listener runs its own reaction'],
      explain: 'Subscriptions come first. When the event fires, the subject tells every registered listener and each does its own thing, without the subject knowing what.' },

    { type: 'spot', prompt: 'This class leaks. Tap the line that creates the problem.',
      code: { lang: 'js', src: `
        class LiveScore {
          constructor(feed) {
            this.score = 0;
            feed.on('goal', () => this.score++);
          }
          destroy() {
            // closed the widget, but nothing else happens
          }
        }` },
      lines: [4],
      explain: 'The feed holds that listener (and so the widget) forever, because nothing ever unsubscribes. Keep what `on()` returns and call it in `destroy()`.' },

    { type: 'ab', q: 'A new "send to the warehouse" reaction is needed when an order is placed. Which design copes better?',
      a: { lang: 'js', label: 'Announce', src: `
        // somewhere at start-up
        orders.on('placed', notifyWarehouse);

        // OrderService is unchanged:
        orders.emit('placed', order);` },
      b: { lang: 'js', label: 'Call directly', src: `
        place(order) {
          this.save(order);
          this.email.sendReceipt(order);
          this.warehouse.notify(order); // edit
        }` },
      answer: 'a',
      explain: 'With announce-and-listen, the new behaviour is attached from outside and the order code stays as it is. Calling directly means reopening the order service again.' },

    { type: 'tf', statement: 'In Observer, the subject needs to know what each listener will do with the event.', answer: false,
      explain: 'The subject only knows that listeners can be called. Not knowing what they do is exactly what keeps the two sides loosely coupled.' },

    { type: 'short', q: 'What name is used for a function returned by `on()` (or passed to `removeEventListener`) that stops you hearing events? Give the verb.', accept: ['unsubscribe', 'unsub', 'detach', 'off', 'remove', 'removeEventListener'], hint: 'The opposite of subscribe.',
      explain: 'You unsubscribe (or remove the listener). Forgetting to is the classic leak.' },

    { type: 'bucket', prompt: 'Observer or Mediator?', buckets: ['Observer', 'Mediator'],
      items: [['A button announces a click and any function may listen', 0], ['An air-traffic tower coordinating planes that never speak to each other', 1], ['A form where changing one field enables or hides several others', 1], ['A stock ticker that tells every chart when a price changes', 0], ['A chat room deciding who receives each message', 1], ['An EventEmitter with named events', 0]],
      explain: 'Observer broadcasts news to whoever signed up. A Mediator is the central coordinator that holds the rules for a group that must interact.' },

    { type: 'scenario', title: 'Dashboard overload', meters: { clarity: 40, reliability: 50 },
      intro: 'You are building a dashboard with a date picker, a region filter, three charts and a summary box. Changing the date must refresh the charts and summary, and the region filter must reset when the date range is too wide.',
      steps: [
        { text: 'Each widget currently holds references to the others and calls them directly. It is getting knotted. What do you do?',
          choices: [
            { label: 'Introduce a DashboardMediator: widgets report changes to it, and it decides who updates', score: 2, effects: { clarity: 30, reliability: 15 }, feedback: 'A fixed group with rules about who reacts to whom is the textbook Mediator case. Each widget keeps one connection.' },
            { label: 'Give every widget a reference to every other widget', score: 0, effects: { clarity: -25, reliability: -10 }, feedback: 'That is the tangle you are trying to escape. Each new widget needs wiring to all the old ones.' },
            { label: 'Put everything into one giant function', score: 0, effects: { clarity: -20 }, feedback: 'That swaps one mess for another and cannot be tested in parts.' }
          ] },
        { text: 'Your charts subscribe to a data feed when they appear. Users switch tabs a lot, and the page slows down over a long session. What is the likely cause?',
          choices: [
            { label: 'Charts that were removed never unsubscribed, so dead ones keep reacting and holding memory', score: 2, effects: { reliability: 30 }, feedback: 'The lapsed-listener leak. Unsubscribe when a widget is destroyed.' },
            { label: 'Observer is slow in general, so remove it', score: 0, effects: { reliability: -10 }, feedback: 'Observer is cheap. The slowdown is from listeners that should be gone and are not.' },
            { label: 'The browser is old', score: 0, effects: { reliability: -5 }, feedback: 'Blaming the browser avoids looking at the subscriptions your own code never cleans up.' }
          ] }
      ],
      outro: 'Announce news with Observer; coordinate a team with Mediator; always unsubscribe.' },

    { type: 'explain', prompt: 'Explain Observer and Mediator, and the main danger of each.',
      model: 'Observer lets a subject announce events to any number of listeners that subscribed, without knowing who they are or what they do, which keeps things loosely coupled; its danger is forgotten subscriptions that leak memory and invisible chains of reactions. Mediator puts the communication rules for a group of objects in one central object, so each only talks to it rather than to each other, like an air-traffic tower; its danger is that the mediator grows into a giant god class.',
      keywords: ['subject', 'listener', 'subscribe', 'unsubscribe', 'leak', 'mediator', 'central', 'god class'] }
  ],

  flashcards: [
    { q: 'What is the Observer pattern?', a: 'A subject announces events and any number of subscribed observers are notified, without the subject knowing who they are or what they do.' },
    { q: 'What is the lapsed listener problem?', a: 'A listener that is never unsubscribed stays referenced by the subject, leaking memory and still reacting after it should be gone.' },
    { q: 'What is the Mediator pattern?', a: 'A central object that handles how a group of objects interact, so they talk to it rather than to each other.' },
    { q: 'Observer versus Mediator?', a: 'Observer broadcasts one-to-many news. Mediator coordinates a fixed group through one centre that holds the rules.' },
    { q: 'What is the risk of a Mediator?', a: 'It can grow into a god class that knows and does too much.' }
  ],

  glossary: [
    { term: 'Observer', aka: ['pub/sub', 'listener'], def: 'A GoF pattern in which a subject notifies a list of subscribed observers when something happens.', like: 'Subscribing to a channel.' },
    { term: 'Event', def: 'A named announcement that something has happened, such as "order placed", usually with some data.', like: 'A new video being posted.' },
    { term: 'Memory leak', def: 'Memory that is no longer needed but is still referenced, so the program never frees it.', like: 'A bath with the plug in and the tap still running.' },
    { term: 'Mediator', def: 'A GoF pattern in which one object coordinates how a group of other objects interact.', like: 'An air-traffic control tower.' },
    { term: 'God class', def: 'A class that knows and does far too much, and that everything depends on.', like: 'The one person in the office who must be asked about everything.' }
  ],

  takeaways: [
    '**Observer**: announce events, let anyone subscribe, and stay ignorant of who listens.',
    'Every subscription needs an **unsubscribe**, or you get leaks.',
    '**Mediator**: one coordinator for a group, so parts do not talk to each other.',
    'Watch for invisible chains of reactions and swollen mediators.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-command-memento', {
  eli5: 'Command turns "do this" into a little object you can store, queue and reverse. Memento takes a snapshot of an object so you can put it back exactly as it was, like a save point in a game.',

  cards: [
    { kind: 'concept', title: 'The impossible Ctrl+Z',
      body: `In a text editor you type, bold a word, delete a paragraph. Then you press **undo** and it all rewinds, one action at a time, and **redo** replays it.

        Now look at that from the code's side. If pressing the Bold button simply *runs* some code, the action is gone the moment it finishes. There is nothing left to rewind.

        To undo something you need to **remember it**: what was done, to what, and how to reverse it. The trick of the **Command** pattern is to turn each request into an **object** that you can keep, pass around and run again, or backwards.` },

    { kind: 'metaphor', title: 'The order slip',
      body: `In a busy restaurant the waiter does not shout your order at the cook. They write it on a **slip**. That small piece of paper can be pinned to a rail (a queue), handed to a different cook, copied, crossed out if you change your mind, and filed afterwards as a record of what was ordered.

        The slip separates **asking** (the waiter) from **doing** (the kitchen). Neither needs to know about the other, only about slips.

        A Command object is a slip: it holds everything needed to carry out one request, and can be run now, later, or never.` },

    { kind: 'code', title: 'A command that can reverse itself',
      body: 'Each command knows how to do its job and how to take it back.',
      code: { lang: 'js', src: `
        class InsertText {
          constructor(doc, pos, text) {
            Object.assign(this, { doc, pos, text });
          }
          execute() { this.doc.insert(this.pos, this.text); }
          undo() { this.doc.remove(this.pos, this.text.length); }
        }`,
        notes: {
          1: 'The request is now an **object**. It carries everything needed to do it: the document, where, and what.',
          5: 'Do it.',
          6: 'Undo it. The command knows its own inverse, because it knows what it did.'
        } } },

    { kind: 'code', title: 'A history of commands',
      body: 'Undo and redo are just two stacks of commands.',
      code: { lang: 'js', src: `
        class History {
          undoStack = [];
          redoStack = [];
          run(cmd) {
            cmd.execute();
            this.undoStack.push(cmd);
            this.redoStack = [];
          }
          undo() {
            const cmd = this.undoStack.pop();
            if (!cmd) return;
            cmd.undo();
            this.redoStack.push(cmd);
          }
          redo() { /* the mirror image of undo */ }
        }`,
        notes: {
          5: 'Every new action goes through here, so it is recorded.',
          7: 'Doing something new throws away the redo stack. The "future" you undid no longer makes sense.',
          10: 'Last done, first undone. That is exactly how a **stack** behaves.',
          13: 'Move it across so that it can be redone.'
        } } },

    { kind: 'sequence', title: 'Type, type, undo',
      body: 'The editor never talks to the document directly. It talks to commands.',
      actors: ['User', 'History', 'Command', 'Document'],
      steps: [
        { from: 0, to: 1, label: 'type "hi"', note: 'The user does something. A command is made for it.' },
        { from: 1, to: 2, label: 'execute()', note: 'History runs the command and keeps it.' },
        { from: 2, to: 3, label: 'insert("hi")', note: 'The command does the real work on the document.' },
        { from: 0, to: 1, label: 'undo', note: 'The user presses Ctrl+Z.' },
        { from: 1, to: 2, label: 'undo()', note: 'History takes the latest command off the stack.' },
        { from: 2, to: 3, label: 'remove("hi")', note: 'The command reverses its own action.' }
      ] },

    { kind: 'example', title: 'More than undo',
      body: `Once requests are objects, a lot comes free:

        - **Queues**: put commands in a list and run them later, or on another machine. A "send email" job waiting its turn is a command.
        - **Macros**: record a list of commands, then replay them. Press "record", do five actions, press "play".
        - **Logging and replay**: write each command to a file, and you can rebuild the state by running them again.
        - **Scheduling and retry**: run this command at 3am, or again if it failed.

        In every case the thing doing the asking, such as a button, never needs to know what the request actually does.` },

    { kind: 'concept', title: 'Memento: the save point',
      body: `Some actions are hard to reverse by a neat inverse. "Apply this filter to a photo" is not easily undone by another filter. Easier to **save the whole state first** and put it back.

        That is a **Memento**: a snapshot of an object's state, kept so you can restore it later. It is a **save point** in a game.

        The catch is encapsulation. To snapshot an editor you need its private fields, but reading private fields from outside breaks the rule that insiders stay inside. So the rule of the pattern is: **the object makes its own snapshot** (it may look at its own insides), and the code that keeps the snapshots, the **caretaker**, stores them and **never opens them**.` },

    { kind: 'code', title: 'A memento in code',
      body: 'The editor creates and restores snapshots. The caretaker just holds them.',
      code: { lang: 'js', src: `
        class Editor {
          #text = '';
          #cursor = 0;

          type(s) { this.#text += s; this.#cursor += s.length; }

          save() {
            return Object.freeze({ text: this.#text, cursor: this.#cursor });
          }
          restore(snapshot) {
            this.#text = snapshot.text;
            this.#cursor = snapshot.cursor;
          }
        }

        const undoStack = [];
        undoStack.push(editor.save());
        editor.type('hello');
        editor.restore(undoStack.pop());`,
        notes: {
          2: 'The \`#\` makes these fields truly private. Code outside the class cannot read them.',
          8: 'Only the editor builds the snapshot, because only it may look inside.',
          16: 'The caretaker keeps snapshots on a stack and never inspects them.',
          19: 'Put things back exactly as they were.'
        } },
      note: 'Honest footnote: in JavaScript the snapshot object itself is readable by anyone who holds it. Languages such as Java hide a memento’s contents with nested private classes. In JS the safeguard is discipline: the caretaker does not look.' },

    { kind: 'compare', title: 'Two ways to undo',
      body: 'Both give you undo. They store different things.',
      cols: ['Command with undo()', 'Memento snapshot'],
      rows: [
        ['What is stored', 'The action and how to reverse it', 'A copy of the state before'],
        ['Memory', 'Small, one object per action', 'Can be large, a copy per step'],
        ['Effort', 'You must write each action’s inverse', 'Almost none: save and restore'],
        ['Best when', 'Actions are small and reversible', 'State is awkward to reverse, or you want checkpoints'],
        ['Bonus', 'Also gives queues, macros, logs', 'Nice for "revert to last saved"']
      ] },

    { kind: 'pitfall', title: 'Not everything can be undone',
      body: `- **Real-world side effects.** You cannot un-send an email or un-charge a card by running code backwards. A command for those needs a **compensating action** ("send a correction", "issue a refund"), which is not the same thing.
        - **Memory.** A snapshot of a big document on every keystroke will eat your memory. Cap the history, snapshot only what changed, or snapshot at checkpoints.
        - **The redo stack.** Forget to clear it after a new action and "redo" will replay actions that no longer make sense.
        - **Command bloat.** One small class per action adds up. A command can often just be a pair of functions.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the central idea of the Command pattern?',
      options: ['Turn a request into an object you can store, queue or undo', 'Make a class that has only one public method', 'Let commands run faster by caching their results', 'Give every button its own background thread'],
      answer: 0,
      why: [null, 'A command often has a method or two, but the key idea is the request as an object.', 'Caching is a different matter.', 'Threads are unrelated to the pattern.'],
      explain: 'Once the request is an object it can be kept for undo, queued for later, logged, or replayed, and the sender never needs to know the details.' },

    { type: 'order', after: 4, prompt: 'Put the undo of a typed word in the right order.',
      items: ['The user presses Ctrl+Z', 'History pops the latest command off the undo stack', 'The command’s undo() runs and reverses its action', 'The command is pushed onto the redo stack'],
      explain: 'The latest command is taken off, asked to reverse itself, and then saved on the redo stack so it can be replayed.' },

    { type: 'spot', prompt: 'Undo in this History class is broken. Tap the line with the bug.',
      code: { lang: 'js', src: `
        undo() {
          const cmd = this.undoStack.pop();
          if (!cmd) return;
          cmd.execute();
          this.redoStack.push(cmd);
        }` },
      lines: [4],
      explain: 'Undo must call `cmd.undo()`. Calling `execute()` again performs the action a second time instead of reversing it.' },

    { type: 'cloze', code: true, text: 'class InsertText {\n  {{execute}}() { this.doc.insert(this.pos, this.text); }\n  {{undo}}() { this.doc.remove(this.pos, this.text.length); }\n}\n// the list of past commands is kept on a {{stack}}',
      distractors: ['queue', 'redo', 'snapshot'],
      explain: 'A command knows how to do its action and how to reverse it. Past commands sit on a stack because the last thing done is the first thing undone.' },

    { type: 'bucket', prompt: 'Which approach does each description point to?', buckets: ['Command', 'Memento'],
      items: [['Store the inverse operation, such as "delete the text just inserted"', 0], ['Store a full copy of the document taken before the change', 1], ['A save-game checkpoint you can return to', 1], ['A queue of jobs to run later', 0], ['Record five actions and replay them as a macro', 0], ['Revert a form to the values it had when last saved', 1]],
      explain: 'Command stores actions, which gives queues, macros and cheap undo. Memento stores state, which suits checkpoints and awkward-to-reverse changes.' },

    { type: 'match', prompt: 'Match each role to what it does.',
      pairs: [['Command', 'A request packaged as an object'], ['Invoker (e.g. History)', 'Runs commands and keeps them for undo'], ['Originator', 'The object that creates and restores its own snapshot'], ['Caretaker', 'Holds snapshots but never looks inside them']],
      explain: 'Command and invoker belong to the undo-by-actions design. Originator and caretaker are the two sides of Memento, kept apart so private state stays private.' },

    { type: 'mcq', q: 'Why does Memento have the object create its own snapshot instead of letting the caretaker copy its fields?',
      options: ['So private state stays private to the owner', 'Because copying fields from outside is slower', 'Because snapshots cannot be stored in a list', 'To make each snapshot smaller in memory'],
      answer: 0,
      why: [null, 'Speed is not the reason. Encapsulation is.', 'Snapshots are stored in lists and stacks all the time.', 'Size is unrelated to who creates it.'],
      explain: 'Encapsulation. If the caretaker read the fields, every outsider would depend on the editor’s internals, and changing them would break everyone.' },

    { type: 'scenario', title: 'The drawing app', meters: { memory: 60, usability: 40 },
      intro: 'You are building a drawing app. Users draw strokes, move shapes and apply image filters, and they expect unlimited undo and redo.',
      steps: [
        { text: 'For "draw stroke" and "move shape", which undo design fits?',
          choices: [
            { label: 'Command: each action stores what it did and how to reverse it', score: 2, effects: { usability: 30, memory: 10 }, feedback: 'These actions are small and easy to reverse (remove the stroke, move the shape back), so storing them is cheap.' },
            { label: 'Snapshot the whole canvas after every mouse movement', score: 0, effects: { memory: -40, usability: 5 }, feedback: 'Correct but ruinously expensive. A long drawing session would eat your memory.' },
            { label: 'No undo, just a clear button', score: 0, effects: { usability: -30 }, feedback: 'Users expect undo. This also makes mistakes costly.' }
          ] },
        { text: 'The "blur" filter is hard to reverse exactly. What is a good approach?',
          choices: [
            { label: 'Save a memento of the affected layer before applying it, and restore it on undo', score: 2, effects: { usability: 25, memory: -10 }, feedback: 'A snapshot is the right tool when there is no tidy inverse. Limiting it to the affected layer keeps cost down.' },
            { label: 'Write an "un-blur" function', score: 1, effects: { usability: -5 }, feedback: 'Blurring loses information, so an exact inverse does not exist.' },
            { label: 'Disable undo after any filter', score: 0, effects: { usability: -25 }, feedback: 'You have removed the safety net just where users most want it.' }
          ] }
      ],
      outro: 'Small and reversible: store the action. Hard to reverse: store the state.' },

    { type: 'explain', prompt: 'Explain how Command and Memento each support undo, and when you would pick one over the other.',
      model: 'Command turns each request into an object that knows how to execute and undo itself, so a history stack gives undo and redo, and the same objects can be queued, logged or replayed as macros. Memento saves a snapshot of an object’s state, made by the object itself so its private fields are not exposed, and a caretaker stores the snapshots to restore later. Command is cheap and suits small reversible actions; Memento suits changes with no neat inverse or when you want checkpoints, but costs more memory.',
      keywords: ['command', 'object', 'undo', 'stack', 'memento', 'snapshot', 'encapsulation', 'caretaker'] }
  ],

  flashcards: [
    { q: 'What is the Command pattern?', a: 'Turning a request into an object that holds everything needed to run it, so it can be stored, queued, logged, replayed or undone.' },
    { q: 'How do undo and redo work with Commands?', a: 'Run commands through a history. Keep them on an undo stack, pop and call undo() to undo, and move them to a redo stack to redo.' },
    { q: 'What is the Memento pattern?', a: 'A snapshot of an object’s state, created by the object itself and stored elsewhere, so the state can be restored without exposing its internals.' },
    { q: 'Who are the originator and the caretaker?', a: 'The originator is the object whose state is saved and restored. The caretaker stores the snapshots without looking inside them.' },
    { q: 'Why can some commands not truly be undone?', a: 'Real-world effects, like a sent email or a card charge, cannot be reversed by code. You need a compensating action, such as a refund.' }
  ],

  glossary: [
    { term: 'Command', def: 'A GoF pattern that packages a request as an object, so it can be passed around, queued, logged or undone.', like: 'A restaurant order slip.' },
    { term: 'Invoker', def: 'The object that runs commands, and often keeps them in a history. It does not know what the commands do.', like: 'The waiter who passes slips to the kitchen.' },
    { term: 'Memento', def: 'A GoF pattern that captures an object’s state in a snapshot so it can be restored later, without breaking encapsulation.', like: 'A save point in a video game.' },
    { term: 'Caretaker', def: 'In Memento, the object that stores snapshots but never looks inside them.', like: 'A left-luggage office: keeps your bag, never opens it.' },
    { term: 'Compensating action', def: 'A new action that cancels out the effect of an earlier one that cannot truly be reversed.', like: 'A refund for a purchase you cannot un-buy.' }
  ],

  takeaways: [
    '**Command**: a request as an object, so it can be queued, logged, replayed and undone.',
    'Undo and redo are two stacks of commands.',
    '**Memento**: an object snapshots itself, a caretaker stores it, nobody peeks.',
    'Pick commands for small reversible actions, snapshots for awkward changes, and cap history size.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-template-iterator', {
  eli5: 'Template Method is a recipe card with some steps left blank for you to fill in. Iterator is a guide who walks you through any collection one item at a time, whether it is a list, a tree or a database.',

  cards: [
    { kind: 'concept', title: 'The same recipe, copied three times',
      body: `Your app exports reports as CSV, PDF and HTML. Each exporter does the same thing in the same order: load the data, convert it into the right format, save the file, tell the owner it is ready.

        Only **one step** differs, the format. But if each exporter is written separately, the other steps are copied three times. Fix a bug in "save the file" and you must remember to fix it three times.

        The **Template Method** pattern puts the shared order of steps in one place, and leaves only the part that differs for each version to fill in.` },

    { kind: 'metaphor', title: 'The form letter with blanks',
      body: `A company sends a form letter: "Dear ____, thank you for your order of ____. We will deliver on ____." The wording and the order are fixed. Only the blanks change from customer to customer.

        A **template method** is a form letter written in code. The parent class fixes the **skeleton**, the order of the steps. Subclasses fill in the blanks, but they cannot rearrange the letter.

        Some blanks are **required**, and a few are optional extras called **hooks**: places where a subclass *may* add something, and the letter is fine if it does not.` },

    { kind: 'code', title: 'A template method',
      body: 'The parent controls the order. The subclass fills in the format step.',
      code: { lang: 'js', src: `
        class Exporter {
          export(report) {
            const rows = this.load(report);
            const text = this.format(rows);
            this.beforeSave();
            this.save(text);
            this.notify(report);
          }
          load(report) { return report.rows(); }
          format(rows) { throw new Error('override me'); }
          beforeSave() {}
          save(text) { /* write the file */ }
          notify(report) { /* email the owner */ }
        }

        class CsvExporter extends Exporter {
          format(rows) { return rows.map((r) => r.join(',')).join(EOL); }
        }`,
        notes: {
          2: 'The **template method**: a fixed skeleton. Nobody overrides *this*, so the order of steps never changes.',
          10: 'A **required blank**. Every subclass must supply it, and the parent refuses to guess.',
          11: 'A **hook**: empty by default. A subclass may fill it in, or ignore it.',
          17: 'The subclass writes only what is different. Load, save and notify are shared, written once.'
        } } },

    { kind: 'steps', title: 'Walking through export()',
      body: 'Which steps are fixed, and which are open to change?',
      steps: [
        { title: 'load()', body: 'Fixed. Every exporter gets its rows the same way. A subclass *can* override it, but usually has no reason to.' },
        { title: 'format()', body: '**The blank.** CSV, PDF and HTML each write their own version. This is the heart of the pattern.' },
        { title: 'beforeSave()', body: 'A **hook**. Empty by default. The PDF exporter might use it to add page numbers; the CSV one ignores it.' },
        { title: 'save()', body: 'Fixed. Written once, so a bug fix helps every exporter at once.' },
        { title: 'notify()', body: 'Fixed. Always the last step, in every version.' }
      ] },

    { kind: 'concept', title: 'Don’t call us, we’ll call you',
      body: `Notice who is in charge. A subclass does not call \`load()\` or \`save()\` itself. The **parent** calls the subclass's \`format()\` at the right moment.

        This is the **Hollywood principle** from an earlier lesson: "don't call us, we'll call you". The parent owns the flow of control, and you plug your piece in. Frameworks work this way constantly: you write the \`render\` or \`handleRequest\` step, and the framework decides when it is called.

        Two honest cautions. This uses **inheritance**, so you are tied to the parent. And a skeleton with too many hooks is hard to follow. If only one step varies, passing that step in as a **function** (Strategy) is often lighter.` },

    { kind: 'metaphor', title: 'Iterator: the tour guide',
      body: `A museum has thousands of objects, stored in rooms, on shelves, in cabinets, in different ways. You do not need to understand the filing system. A **guide** walks you through: "here is the next exhibit... and the next... that is all."

        An **Iterator** is that guide. It lets you visit every item of a collection **one at a time**, without knowing whether the collection is an array, a linked list, a tree or a database table.

        It also remembers **where you are**, like a bookmark, so the collection itself does not need to. Two iterators can walk the same collection at the same time.` },

    { kind: 'code', title: 'Writing an iterator by hand',
      body: 'JavaScript\'s `for...of` loop works on anything that offers an iterator. Here is the plumbing.',
      code: { lang: 'js', src: `
        class Playlist {
          constructor() { this.songs = []; }
          add(song) { this.songs.push(song); }

          [Symbol.iterator]() {
            let i = 0;
            const songs = this.songs;
            return {
              next() {
                return i < songs.length
                  ? { value: songs[i++], done: false }
                  : { value: undefined, done: true };
              }
            };
          }
        }

        for (const song of playlist) play(song);`,
        notes: {
          5: 'Having this method is what lets \`for...of\` loop over your class.',
          6: 'The iterator keeps its **own** position, a bookmark.',
          9: '\`next()\` hands over one item each time, and says \`done: true\` when there is nothing left.',
          18: 'The caller has no idea whether songs are in an array, a tree or a database. The loop looks the same.'
        } } },

    { kind: 'code', title: 'Generators: iterators made easy',
      body: 'Modern languages let you write an iterator as an ordinary-looking function that **yields** values one at a time.',
      code: { lang: 'js', src: `
        function* walk(node) {
          yield node.name;
          for (const child of node.children) {
            yield* walk(child);
          }
        }

        function* naturals() {
          let n = 1;
          while (true) yield n++;
        }

        for (const name of walk(folderTree)) {
          console.log(name);
        }`,
        notes: {
          1: '\`function*\` makes a **generator**. Python has the same idea with the \`yield\` keyword.',
          2: '\`yield\` hands one value out, then **pauses** right here until the next one is asked for.',
          4: 'Hands over everything from the sub-walk. A whole tree traversal in five lines.',
          10: 'An endless sequence is fine, because values are made **only when asked for**. This is called lazy evaluation.'
        } },
      note: 'In Python the same thing is written with `yield` inside a normal function, and for loops, list comprehensions and many standard-library tools all work on iterators.' },

    { kind: 'realworld', title: 'In the wild',
      body: `**Iterator** is so common you rarely notice it. \`for...of\` in JavaScript, \`for x in\` in Python, \`foreach\` in C# and Java all use it. Reading a huge file line by line, paging through database results with a cursor and streaming rows from a query are all iterators: they let you handle one item at a time without loading everything.

        **Template Method** is the shape of most **frameworks**. A test framework's \`setUp\` and \`tearDown\` steps wrap your test. Old-style UI frameworks gave you lifecycle methods like "on start" and "on destroy" to override. Web frameworks often have a base class where you fill in a \`handle\` step. Abstract base classes in most languages are exactly this.` },

    { kind: 'pitfall', title: 'Gotchas',
      body: `**Template Method**
        - **Rigid skeleton.** If one subclass genuinely needs a different order, the template fights you. That is a sign to switch to composition.
        - **Too many hooks** and the flow becomes impossible to follow.
        - Subclasses that forget to call \`super\` where required quietly skip a step.

        **Iterator**
        - **Changing a collection while looping** over it can skip items or crash. Collect changes first, apply after.
        - Many iterators are **one-shot**: once finished, they are spent and give nothing the second time.
        - An **infinite generator** with no way out makes an infinite loop. Always have a stop condition in the consumer.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What does the Template Method pattern put in the parent class?',
      options: ['The fixed order of steps; subclasses fill in the rest', 'All the code that differs between the subclasses', 'A list of every subclass that extends it', 'A copy of the data each subclass needs to run'],
      answer: 0,
      why: [null, 'The varying parts are exactly what the subclasses write.', 'A parent does not need to know its subclasses.', 'Data is not what the pattern is about. Order of steps is.'],
      explain: 'The skeleton lives once in the parent. Subclasses override only the steps that differ, so shared steps are never copied.' },

    { type: 'order', after: 3, prompt: 'In what order does the Exporter’s template method run its steps?',
      items: ['load()', 'format()', 'beforeSave() (the hook)', 'save()', 'notify()'],
      explain: 'The parent fixes this order. Subclasses can change what a step does, but not the sequence.' },

    { type: 'cloze', code: true, text: 'class PdfExporter extends Exporter {\n  {{format}}(rows) { /* build a PDF */ }\n  {{beforeSave}}() { /* optional: add page numbers */ }\n}\n// an optional, empty-by-default step that a subclass may override is called a {{hook}}',
      distractors: ['export', 'load', 'iterator'],
      explain: '`format` is the required blank. `beforeSave` is an optional hook, empty in the parent, and anything like it is called a hook.' },

    { type: 'tf', statement: 'A generator produces each value only when the loop asks for the next one.', answer: true,
      explain: 'A generator is lazy: it does not build a list up front. It produces each value only when asked, then pauses. That is why an endless generator like `naturals()` works.' },

    { type: 'ab', q: 'The team wants CSV, PDF and HTML exporters with identical load, save and notify steps. Which is the better design?',
      a: { lang: 'js', label: 'Template', src: `
        class Exporter {
          export(r) { /* load, format, save, notify */ }
          format(rows) { /* override */ }
        }
        class CsvExporter extends Exporter {
          format(rows) { /* CSV only */ }
        }` },
      b: { lang: 'js', label: 'Copies', src: `
        class CsvExporter {
          export(r) { /* load, csv, save, notify */ }
        }
        class PdfExporter {
          export(r) { /* load, pdf, save, notify */ }
        }` },
      answer: 'a',
      explain: 'The shared steps are written once, so a fix to saving helps every exporter. The copied version repeats them and they drift apart.' },

    { type: 'spot', prompt: 'This loop never ends. Tap the line that needs a way out.',
      code: { lang: 'js', src: `
        function* naturals() {
          let n = 1;
          while (true) yield n++;
        }

        for (const n of naturals()) {
          console.log(n);
        }` },
      lines: [6],
      explain: 'The generator is endless by design, so the *consumer* must stop it, for example with `if (n > 10) break;`. Without that, the loop never finishes.' },

    { type: 'short', q: 'What is the name for an optional, empty-by-default step in a template method that subclasses may override?', accept: ['hook', 'hooks', 'hook method', 'hook methods'], hint: 'Something you hang a coat on.',
      explain: 'It is a hook. The skeleton works without it, but a subclass can use it to add something at that point.' },

    { type: 'mcq', q: 'What does the loop `for (const song of playlist)` not need to know?',
      options: ['How the songs are stored behind the scenes', 'That the playlist offers an iterator to loop over', 'That each item it gets back is a song', 'That the loop body runs once per item'],
      answer: 0,
      why: [null, 'The playlist must offer an iterator for the loop to work, so the loop relies on it.', 'The code inside the loop deals with each song, so it knows the item type.', 'Running once per item is how loops work.'],
      explain: 'Hiding how the collection is stored is the whole point of Iterator. The loop only relies on "give me the next one".' },

    { type: 'scenario', title: 'Importing everything', meters: { memory: 50, tidiness: 40 },
      intro: 'You are importing customer files in CSV, XML and JSON formats. Each import validates, parses, saves and sends a summary. One file can be four gigabytes.',
      steps: [
        { text: 'The three importers share every step except parsing. How should you organise them?',
          choices: [
            { label: 'A base Importer with a template method; each format overrides parse()', score: 2, effects: { tidiness: 35 }, feedback: 'Validation, saving and summary are written once, and each format supplies only its own parser.' },
            { label: 'Three separate classes, copy-pasted with small edits', score: 0, effects: { tidiness: -25 }, feedback: 'The shared steps will drift apart, and a bug fix needs three copies.' },
            { label: 'One large function with if (format === ...) throughout', score: 1, effects: { tidiness: -10 }, feedback: 'Better than copies, but every new format edits the same function.' }
          ] },
        { text: 'Loading a four-gigabyte file into one big list crashes the server. What helps?',
          choices: [
            { label: 'Have parse() be a generator that yields one customer at a time', score: 2, effects: { memory: 40 }, feedback: 'Only one record is in memory at a time. The consumer processes each as it arrives.' },
            { label: 'Buy more memory', score: 0, effects: { memory: 5, tidiness: -5 }, feedback: 'It postpones the problem until the next, bigger file.' },
            { label: 'Ask customers to send smaller files', score: 0, effects: { memory: 0 }, feedback: 'You cannot always control that, and it avoids a simple fix.' }
          ] }
      ],
      outro: 'Fixed order, flexible steps, and a gentle walk through the data.' },

    { type: 'explain', prompt: 'Explain Template Method and Iterator, and give a real example of each.',
      model: 'Template Method fixes the skeleton of an algorithm in a parent class and lets subclasses fill in particular steps, with optional hooks, so shared steps are written once, like an Exporter that loads, formats, saves and notifies while each format only overrides format(). Iterator lets you walk through a collection one item at a time without knowing how it is stored, as a for...of loop does; generators with yield make writing one easy and give lazy, one-at-a-time values.',
      keywords: ['skeleton', 'steps', 'subclass', 'hook', 'iterator', 'one at a time', 'generator', 'yield'] }
  ],

  flashcards: [
    { q: 'What is the Template Method pattern?', a: 'A parent class fixes the skeleton of an algorithm and lets subclasses override specific steps, so shared steps are written once.' },
    { q: 'What is a hook in a template method?', a: 'An optional step, empty by default, that subclasses may override to add behaviour at that point.' },
    { q: 'What is the Iterator pattern?', a: 'A way to visit every item of a collection one at a time without knowing how the collection is stored.' },
    { q: 'What is a generator?', a: 'A function that uses yield to produce values one at a time, pausing between them. It is an easy way to write an iterator, and it is lazy.' },
    { q: 'What is the danger of changing a collection while iterating it?', a: 'You can skip items or crash. Gather the changes and apply them after the loop.' }
  ],

  glossary: [
    { term: 'Template Method', def: 'A GoF pattern in which a parent class defines the skeleton of an algorithm and subclasses fill in individual steps.', like: 'A form letter with blanks.' },
    { term: 'Hook', def: 'An optional step in a template method, empty by default, that subclasses may override.', like: 'An optional box on the form.' },
    { term: 'Iterator', def: 'A GoF pattern: an object that lets you step through the items of a collection one at a time without exposing how it is stored.', like: 'A museum guide.' },
    { term: 'Generator', def: 'A function that can pause and resume, producing a sequence of values one at a time with yield.', like: 'A tap that gives one drop each time you press.' },
    { term: 'Lazy evaluation', def: 'Computing a value only when it is actually needed, rather than all up front.', like: 'Cooking when someone is hungry, not for the whole week.' }
  ],

  takeaways: [
    '**Template Method**: the parent owns the order, subclasses fill the blanks. Don’t call us, we’ll call you.',
    'Required steps are blanks; optional ones are hooks.',
    '**Iterator**: visit items one at a time without knowing the storage.',
    'Generators with `yield` are lazy iterators. Always give the consumer a way to stop.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('gof-chain-visitor-interpreter', {
  eli5: 'Chain of Responsibility passes a request along a line of helpers until one deals with it. Visitor sends a new inspector round a set of objects. Interpreter turns a tiny language, such as a discount rule, into objects that can run it.',

  cards: [
    { kind: 'concept', title: 'A request with many gatekeepers',
      body: `A request arrives at your web server. Before it reaches the code that does the real work, a series of questions must be asked. Is the person logged in? Are they sending too many requests? Is the body valid? Should this be logged?

        You could write one giant function with all the checks in a row. But checks come and go, differ by page, and sometimes the right answer is to **stop here** and reply "not allowed".

        The **Chain of Responsibility** pattern lines up small handlers in a row. Each may deal with the request, or pass it to the next. Nobody needs to know the whole line.` },

    { kind: 'metaphor', title: 'The expense claim',
      body: `You claim £30 for a train ticket and your team lead approves it. Claim £800 and the team lead says "that is above my limit" and forwards it to the department head. Claim £20,000 and it climbs to the director.

        You did not choose who approves it, and you did not need to know the rules. You handed it to the first person in the chain, and **it travelled up until someone could handle it**.

        Each link has one decision to make: *handle it, or pass it on.* That small rule is the whole pattern.` },

    { kind: 'code', title: 'A chain in code',
      body: 'Each handler can answer the request itself, or call the next link.',
      code: { lang: 'js', src: `
        class Handler {
          setNext(next) { this.next = next; return next; }
          handle(req) {
            return this.next ? this.next.handle(req) : null;
          }
        }
        class Auth extends Handler {
          handle(req) {
            if (!req.user) return { status: 401 };
            return super.handle(req);
          }
        }
        // RateLimit and App are written the same way

        const auth = new Auth();
        auth.setNext(new RateLimit()).setNext(new App());
        auth.handle(request);`,
        notes: {
          2: 'Each link knows **only the next one**, never the whole chain.',
          9: 'This link may **stop the chain** by answering the request itself.',
          10: 'Or it passes the request on. Forgetting this line breaks the chain.',
          16: 'The order is chosen when you assemble the chain. Reordering or adding a link does not touch the others.'
        } } },

    { kind: 'sequence', title: 'A request that gets stopped',
      body: 'Handlers earlier in the line can end things before later ones ever see the request.',
      actors: ['Client', 'Auth', 'RateLimit', 'App'],
      steps: [
        { from: 0, to: 1, label: 'GET /orders', note: 'Every request goes to the head of the chain.' },
        { from: 1, to: 2, label: 'pass it on', note: 'The user is logged in, so Auth has no objection.' },
        { from: 2, to: 0, label: '429 Too Many Requests', dashed: true, note: 'RateLimit decides this caller has had enough and answers directly.' },
        { note: 'The App link never ran. That is exactly the point: cheap checks early protect the expensive work at the end.' }
      ] },

    { kind: 'realworld', title: 'Hello, middleware',
      body: `You have met this pattern if you have seen the word **middleware**. Web frameworks such as Express, Django, ASP.NET and many more run a request through a line of middleware functions: logging, authentication, parsing, compression, error handling. Each does its bit and calls "next".

        Other examples: bubbling of a click up through the page elements until one handles it, a customer-support desk with levels one, two and three, and logging systems where a message passes through filters.

        Many real chains let **every** link act and then pass on (like logging), rather than a single link handling it. The shape is the same.` },

    { kind: 'concept', title: 'Visitor: a new job for a stable family',
      body: `You have shapes: circles, squares and triangles. They hardly ever change. But new **operations** keep arriving: calculate area, draw on screen, export to SVG, export to JSON, check for overlaps.

        Adding each operation as a method means opening every shape class, every time, and mixing unrelated jobs (drawing, exporting) into classes that should only be about shapes.

        The **Visitor** pattern moves each operation into its own object, a *visitor*, that arrives at each shape and does its job there. Think of a health inspector touring a restaurant: kitchen, dining room, cellar. The inspector checks something different in each room, **the rooms do not change**, and a new inspector with a new checklist is a new visitor.` },

    { kind: 'code', title: 'A visitor in code',
      body: 'The shapes only know how to say "visit me as a circle" or "as a square".',
      code: { lang: 'js', src: `
        class Circle {
          constructor(r) { this.r = r; }
          accept(v) { return v.visitCircle(this); }
        }
        class Square {
          constructor(side) { this.side = side; }
          accept(v) { return v.visitSquare(this); }
        }

        const area = {
          visitCircle: (c) => Math.PI * c.r ** 2,
          visitSquare: (s) => s.side ** 2
        };
        const describe = {
          visitCircle: (c) => 'circle r=' + c.r,
          visitSquare: (s) => 'square ' + s.side
        };

        new Circle(2).accept(area);`,
        notes: {
          3: 'The shape simply tells the visitor **which kind it is**. This hand-off is called **double dispatch**: first choose the shape, then choose the visitor method for it.',
          10: 'A whole new operation as one object, written **without editing** Circle or Square.',
          14: 'Another operation, another visitor. Shapes stay exactly as they are.',
          19: 'Same shape, different visitor, different job.'
        } } },

    { kind: 'compare', title: 'Which direction is hard?',
      body: 'Visitor makes one kind of change easy and the other awkward. Know which you expect.',
      cols: ['Methods in each class', 'Visitor'],
      rows: [
        ['Add a new operation', 'Edit every class', 'Add one visitor, no class edits'],
        ['Add a new class (like Triangle)', 'Write its methods, nothing else changes', 'Every visitor must be updated'],
        ['Related code lives', 'By class: all of Circle together', 'By operation: all of "area" together'],
        ['Best when', 'The set of classes changes often', 'The classes are stable and operations keep growing']
      ],
      note: 'Languages with pattern matching on types can do the same job with less ceremony. Visitor is the classic answer where they are not available.' },

    { kind: 'concept', title: 'Interpreter: a tiny language',
      body: `Sometimes the rules change faster than you can ship code. The marketing team wants to write discount rules themselves: "total over 100 **and** country is UK". Hard-coding each new rule means a release every time.

        The **Interpreter** pattern says: define a small **language**, represent each piece of a sentence as an object, and give each one a method that works out its meaning. A rule is then a **tree** of these objects (a Composite!) that evaluates itself.

        The same idea sits inside spreadsheet formulas, search filters, rule engines, regular expressions and SQL.`,
      code: { lang: 'js', src: `
        class Gt {
          constructor(name, n) { Object.assign(this, { name, n }); }
          evaluate(ctx) { return ctx[this.name] > this.n; }
        }
        class Eq {
          constructor(name, v) { Object.assign(this, { name, v }); }
          evaluate(ctx) { return ctx[this.name] === this.v; }
        }
        class And {
          constructor(a, b) { Object.assign(this, { a, b }); }
          evaluate(ctx) { return this.a.evaluate(ctx) && this.b.evaluate(ctx); }
        }

        const rule = new And(new Gt('total', 100), new Eq('country', 'UK'));
        rule.evaluate({ total: 150, country: 'UK' }); // true`,
        notes: {
          3: 'Each piece of the language is a class that can **work out its own value**.',
          9: '\`And\` is a node with two children. Rules nest, as deeply as needed.',
          14: 'The rule is built as a tree. In a real system a small parser would build it from text like \`total > 100 AND country = "UK"\`.'
        } } },

    { kind: 'pitfall', title: 'Handle with care',
      body: `**Chain.** A request can **fall off the end** with nobody handling it, so decide what the default is. The order of the links matters, and a long chain is hard to debug, because the code that ran is spread across many places.

        **Visitor.** Add a new shape and every visitor breaks. Visitors also need access to a shape's data, which can pull internals into the open.

        **Interpreter.** It suits **small** languages only. For a big grammar, use a proper parser tool. And never run text from users through \`eval\`, which executes it as code: building a limited rule language is how you let people write rules **safely**.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'In Chain of Responsibility, what decision does each link make?',
      options: ['Handle the request itself, or pass it to the next link', 'Which link should come first in the chain', 'Whether to delete the next link', 'How many links the chain should have'],
      answer: 0,
      why: [null, 'The chain is assembled outside. A link does not choose its own place.', 'Links do not remove each other.', 'The length is decided when the chain is built.'],
      explain: 'Each link either deals with the request or hands it on. That one small rule keeps links simple and independent.' },

    { type: 'tf', after: 3, statement: 'If RateLimit answers with 429, the App handler later in the chain still runs.', answer: false,
      explain: 'A link that answers itself ends the chain. Cheap checks early on protect the expensive work at the end.' },

    { type: 'spot', prompt: 'This link breaks the chain for every valid request. Tap the line.',
      code: { lang: 'js', src: `
        class Auth extends Handler {
          handle(req) {
            if (!req.user) return { status: 401 };
            return null;
          }
        }` },
      lines: [4],
      explain: 'A valid request must be handed on with `super.handle(req)`. Returning `null` ends the chain with nothing answered, so the App never runs.' },

    { type: 'match', prompt: 'Match each pattern to its everyday picture.',
      pairs: [['Chain of Responsibility', 'An expense claim climbing the approval ladder'], ['Visitor', 'An inspector touring each room with a checklist'], ['Interpreter', 'A phrasebook that turns sentences into actions'], ['Middleware', 'A web request passing through logging, auth and parsing']],
      explain: 'Each picture matches the pattern’s shape: a request passed along, a new job done to stable parts, a small language made executable, and the chain applied to web requests.' },

    { type: 'mcq', q: 'You have a stable set of five shape classes and expect many new operations (area, SVG, JSON, collisions). Which pattern is designed for this?',
      options: ['Visitor, with one visitor per operation', 'Chain of Responsibility', 'Interpreter', 'Template Method on each shape'],
      answer: 0,
      why: [null, 'A chain passes a request along. It does not add operations to a class family.', 'Interpreter is for small languages, not for operations on shapes.', 'A template method fixes one algorithm’s skeleton. It does not add operations.'],
      explain: 'Visitor makes adding an operation cheap, which fits "stable classes, many new operations". It would be a poor fit if new shape classes appeared often.' },

    { type: 'bucket', prompt: 'Chain, Visitor or Interpreter?', buckets: ['Chain', 'Visitor', 'Interpreter'],
      items: [['Support tickets escalate from level 1 to level 2 to a manager', 0], ['Let marketing type discount rules like "total > 100 AND country = UK"', 2], ['Add "export to PDF" to a family of document element classes without editing them', 1], ['Express-style middleware: logging, auth, parsing', 0], ['A spreadsheet evaluating the formula in a cell', 2], ['A compiler running a type check, then a code generation pass over the same syntax tree', 1]],
      explain: 'A request handed along is a chain. Adding operations to a stable set of types is Visitor. Turning small, text-like rules into evaluating objects is Interpreter.' },

    { type: 'cloze', code: true, text: 'class And {\n  constructor(a, b) { Object.assign(this, { a, b }); }\n  {{evaluate}}(ctx) {\n    return this.a.evaluate(ctx) {{&&}} this.b.evaluate(ctx);\n  }\n}\n// a rule is a {{tree}} of these objects',
      distractors: ['||', 'list', 'accept'],
      explain: '`And` evaluates both children and combines them with `&&`. Because children can be other expressions, a rule forms a tree that evaluates itself recursively.' },

    { type: 'scenario', title: 'The promo machine', meters: { safety: 50, speed: 40 },
      intro: 'Marketing wants to launch promotions without waiting for developers. Meanwhile, every API request must be authenticated, rate-limited and logged.',
      steps: [
        { text: 'Marketing writes rules such as "basket over £100 and customer is new". How do you let them?',
          choices: [
            { label: 'Define a tiny rule language, parse it into expression objects, and evaluate those', score: 2, effects: { speed: 35, safety: 20 }, feedback: 'A limited language is Interpreter: flexible enough for marketing, and safe because it can only do what you defined.' },
            { label: 'Let marketing paste JavaScript and run it with eval', score: 0, effects: { speed: 25, safety: -50 }, feedback: 'That would let anyone run arbitrary code on your server. A restricted language is the safe version of the same idea.' },
            { label: 'A new release for every rule', score: 1, effects: { safety: 10, speed: -25 }, feedback: 'Safe but slow. Marketing will find workarounds.' }
          ] },
        { text: 'The API checks (auth, rate limit, logging) are pasted at the top of every endpoint. Someone forgot the rate limit on a new one. What helps?',
          choices: [
            { label: 'A middleware chain applied to every route, with each concern as its own link', score: 2, effects: { safety: 30, speed: 10 }, feedback: 'One chain, applied everywhere. A new endpoint inherits the checks automatically, and the order is stated once.' },
            { label: 'A longer code-review checklist', score: 1, effects: { safety: 5 }, feedback: 'Helps a little, but the next person still has to remember. Structure beats memory.' },
            { label: 'A Visitor over the endpoints', score: 0, effects: { safety: -5 }, feedback: 'Visitor adds operations to a class family. The problem here is passing a request through checks.' }
          ] }
      ],
      outro: 'Pass it along, visit the parts, or give the rules a little language.' },

    { type: 'explain', prompt: 'Explain Chain of Responsibility, Visitor and Interpreter briefly, with one example each.',
      model: 'Chain of Responsibility lines up handlers so a request is passed along until one handles it, like web middleware doing auth, rate limiting and logging, and a link can stop the chain. Visitor moves new operations out of a stable family of classes into visitor objects that visit each class, such as area or SVG export for shapes, using double dispatch. Interpreter defines a tiny language as classes in a tree, each able to evaluate itself, such as a discount rule engine, and should only be used for small grammars.',
      keywords: ['chain', 'middleware', 'visitor', 'operation', 'double dispatch', 'interpreter', 'language', 'tree'] }
  ],

  flashcards: [
    { q: 'What is Chain of Responsibility?', a: 'A request passes along a line of handlers. Each either handles it or passes it to the next. Web middleware is the everyday example.' },
    { q: 'What is Visitor?', a: 'Moving operations on a stable family of classes into separate visitor objects, so new operations can be added without editing the classes.' },
    { q: 'What is double dispatch?', a: 'Choosing behaviour by two types: the element calls the visitor method matching its own kind, so the result depends on both visitor and element.' },
    { q: 'What is the main trade-off of Visitor?', a: 'Adding a new operation is easy, but adding a new element class forces every visitor to change.' },
    { q: 'What is Interpreter?', a: 'Representing a small language’s grammar as classes in a tree, each able to evaluate itself, as in rule engines and formulas.' }
  ],

  glossary: [
    { term: 'Chain of Responsibility', def: 'A GoF pattern where a request is passed along a line of handlers until one handles it.', like: 'An expense claim climbing the approval ladder.' },
    { term: 'Middleware', def: 'Functions that a web request passes through in order before (and after) reaching the main handler, each doing one job such as logging or authentication.', like: 'The security desks you pass before the office.' },
    { term: 'Visitor', def: 'A GoF pattern that puts an operation in a separate object that is applied to each element of a structure.', like: 'A health inspector touring each room.' },
    { term: 'Double dispatch', def: 'A technique where a call is resolved by the types of two objects: the element chooses the visitor method for its own kind.', like: 'Two passwords: only the right pair opens the door.' },
    { term: 'Interpreter', def: 'A GoF pattern that represents sentences of a small language as an object tree that can evaluate itself.', like: 'A phrasebook that turns sentences into actions.' }
  ],

  takeaways: [
    '**Chain**: each link handles the request or passes it on, and may stop the line. Hello, middleware.',
    '**Visitor**: new operations on stable classes, with each operation in one object.',
    'Visitor makes new operations easy and new classes hard.',
    '**Interpreter**: small rule languages as object trees. Never `eval` user text.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('posa-patterns', {
  eli5: 'The same trick as design patterns, named solutions to common problems, but for the shape of a whole system instead of a handful of classes.',

  cards: [
    { kind: 'concept', title: 'Zooming out',
      body: `So far every pattern has been about a few classes. But systems have shape too: how the parts of a whole application are arranged, how data flows through it, how a program stays responsive while waiting on the network.

        Those are problems of **architecture**, and they recur just as much. A team in 1996 wrote them down in the same spirit as the Gang of Four. Their book, *Pattern-Oriented Software Architecture* (**POSA**, by Buschmann, Meunier, Rohnert, Sommerlad and Stal), described patterns at three levels: **architectural patterns** (the shape of a whole system), **design patterns** (a few classes, like the GoF) and **idioms** (tricks tied to one language).

        A second volume followed in 2000 about patterns for concurrent and networked systems. This lesson gives you the guided tour.` },

    { kind: 'layers', title: 'Pattern 1: Layers',
      body: `Stack the system into horizontal layers, each built only on the one directly below. A request goes down, the answer comes back up. Each layer talks to its neighbour through a small, agreed interface.`,
      layers: [
        { label: 'Presentation', note: 'Screens and API endpoints. Talks to users or clients.', icon: '🖥️', tone: 'accent' },
        { label: 'Business logic', note: 'The rules: pricing, discounts, "can this order ship?".', icon: '🧠', tone: 'info' },
        { label: 'Data access', note: 'Turns objects into queries and back again.', icon: '🔌', tone: 'warn' },
        { label: 'Database', note: 'Where the data actually lives.', icon: '🗄️', tone: 'muted' }
      ] },

    { kind: 'concept', title: 'Why layers help, and what they cost',
      body: `Layers give you **separation of concerns** at big scale. You can swap the database without touching the screens, test business rules without a web server, and let different people own different layers. It is the Dependency Inversion idea applied to the whole app.

        The costs are real. Each layer adds **overhead and indirection**: a simple "show a name" may pass through four layers of pass-through code. In **strict** layering a layer may only call the one directly below; in **relaxed** layering it can skip. And teams sometimes build a "lasagne" of layers that do nothing.

        Think of a company: the front desk, the departments and the archive. Visitors do not walk into the archive.` },

    { kind: 'code', title: 'Pattern 2: Pipes and Filters',
      body: `Break a job into small steps, each reading input and writing output. Connect them in a line. Each step is a **filter**, the connections are **pipes**. You have likely seen it in a terminal, where the \`|\` character is the pipe.`,
      code: { lang: 'sh', src: `
        cat access.log | grep " 500 " | sort | uniq -c`,
        notes: {
          1: 'Read the log, keep lines with a 500 error, sort them, count duplicates. Four tiny tools, one useful result, and none of them knows about the others.'
        } },
      note: 'Each filter is simple and reusable. Swap one out, reorder, or add a step, and the others do not change. Data-processing tools, compilers and image-processing chains all work this way.' },

    { kind: 'diagram', title: 'A pipeline',
      body: 'Data flows in one direction through independent steps.',
      nodes: [
        { id: 'src', label: 'Source (raw log)', icon: '📄', x: 1, y: 0, tone: 'muted' },
        { id: 'f1', label: 'Filter: keep errors', x: 1, y: 1, tone: 'accent' },
        { id: 'f2', label: 'Filter: group by page', x: 1, y: 2, tone: 'accent' },
        { id: 'f3', label: 'Filter: count', x: 1, y: 3, tone: 'accent' },
        { id: 'sink', label: 'Sink (report)', icon: '📊', x: 1, y: 4, tone: 'good' }
      ],
      edges: [
        { from: 'src', to: 'f1', label: 'pipe' },
        { from: 'f1', to: 'f2', label: 'pipe' },
        { from: 'f2', to: 'f3', label: 'pipe' },
        { from: 'f3', to: 'sink', label: 'pipe' }
      ],
      caption: 'Weakness: steps that need to share complicated state do not fit this shape well.' },

    { kind: 'metaphor', title: 'Pattern 3: Broker',
      body: `Imagine a huge office where departments do not know each other's phone extensions or which floor they are on. Instead everyone calls the **switchboard**: "Put me through to whoever handles invoices." The switchboard finds the right person, connects the call and returns the answer.

        A [[Broker|Broker (pattern)]] does that for software parts spread over several machines. Clients ask the broker for a service by *name*. The broker knows where services live, forwards the request and returns the reply. Clients and servers are **decoupled** from each other's location.

        POSA's original Broker was about distributed objects. Modern relatives include **API gateways**, **service registries** and **message brokers**, which later modules explore.` },

    { kind: 'sequence', title: 'A broker at work',
      body: 'The client never learns where the service lives.',
      actors: ['Client', 'Broker', 'Service'],
      steps: [
        { from: 2, to: 1, label: 'register "invoices"', note: 'At start-up, the service tells the broker what it offers and where it is.' },
        { from: 0, to: 1, label: 'call "invoices"', note: 'The client asks for the service by name, not address.' },
        { from: 1, to: 2, label: 'forward request', note: 'The broker looks up the service and passes the request on.' },
        { from: 2, to: 1, label: 'reply', dashed: true, note: 'The service answers to the broker.' },
        { from: 1, to: 0, label: 'reply', dashed: true, note: 'And the broker returns the answer. If the service moves, only the broker is told.' }
      ] },

    { kind: 'diagram', title: 'Pattern 4: Model-View-Controller',
      body: `**MVC** splits an interactive application three ways. The **Model** holds the data and rules. The **View** shows it. The **Controller** takes the user's input and decides what to do. Like a restaurant: the kitchen (model), the plated dish and menu (view), the waiter who takes your order (controller).`,
      nodes: [
        { id: 'u', label: 'User', icon: '🙂', x: 1, y: 0 },
        { id: 'c', label: 'Controller', x: 0, y: 1, tone: 'accent' },
        { id: 'm', label: 'Model', x: 0, y: 2, tone: 'good' },
        { id: 'v', label: 'View', x: 2, y: 2, tone: 'info' }
      ],
      edges: [
        { from: 'u', to: 'c', label: 'clicks' },
        { from: 'c', to: 'm', label: 'updates' },
        { from: 'm', to: 'v', label: 'changed', dashed: true },
        { from: 'v', to: 'u', label: 'shows' }
      ],
      caption: 'The model announces changes (Observer!), so many views can follow one model.' },

    { kind: 'concept', title: 'Pattern 5: Reactor and Proactor',
      body: `A server may have thousands of connections open, most of them idle at any moment. One thread per connection would drown the machine. These two patterns let **one loop serve many connections**.

        **Reactor**: it is a **doorbell**. You sit and wait for any bell to ring. When it rings (data is **ready** to read), you go and open the door yourself and deal with the visitor. A loop waits for "ready" events and calls the matching handler.

        **Proactor**: it is a **courier**. You ask someone to fetch the parcel and phone you when it has **arrived**. The system performs the read itself in the background, and your handler is called with the **finished** result.

        Both avoid sitting around waiting on slow input and output.` },

    { kind: 'compare', title: 'Reactor versus Proactor',
      body: 'Both are event-driven. The difference is what the event means.',
      cols: ['Reactor', 'Proactor'],
      rows: [
        ['The event says', '"This is ready to read or write now"', '"That read or write has finished"'],
        ['Who does the I/O', 'Your handler, once told it is ready', 'The system, while you do other things'],
        ['Your handler gets', 'A go-ahead to do the work', 'The completed result'],
        ['Seen in', 'Node.js’s event loop, Nginx, Redis (as textbook examples)', 'Windows completion ports and similar completion-based systems']
      ],
      note: 'Real systems blend both ideas, and the line between them blurs. You only need the shape: wait for events, dispatch to handlers.' },

    { kind: 'pitfall', title: 'Architecture patterns are expensive to change',
      body: `A design pattern can be refactored in an afternoon. An **architectural** pattern is baked into every file, so choosing wrongly costs months.

        - **Layers** with no real separation become a lasagne of pass-through code.
        - **Pipes and filters** is a poor fit when steps need rich shared state.
        - **Broker-style** designs add network hops, new failure modes and a central piece that must stay up.
        - **MVC** is loosely used. Many variants exist (you may hear MVP and MVVM), so check what a team means.
        - **Reactor-style** code means one slow handler blocks everyone behind it.

        As always: choose by the **forces** of your problem, not by fashion.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'In a layered architecture, which direction may a layer normally call?',
      options: ['Only the layer directly beneath it', 'Any layer above or below it', 'Only the layer above it', 'Only the database'],
      answer: 0,
      why: [null, 'Calling in all directions removes the separation that layers are for.', 'Dependencies flow downwards. Upper layers use lower ones.', 'Only the data layer deals with the database.'],
      explain: 'Each layer builds on the one below and hides the layers under that. In strict layering it may only call its immediate neighbour below.' },

    { type: 'order', after: 4, prompt: 'Put the stages of the log pipeline in order.',
      items: ['Read the raw log (source)', 'Keep only the error lines', 'Group them by page', 'Count each group', 'Show the report (sink)'],
      explain: 'Data flows one way through independent filters, from a source to a sink, each step doing one small job.' },

    { type: 'spot', prompt: 'This presentation-layer code breaks the layered design. Tap the line.',
      code: { lang: 'js', src: `
        // presentation layer
        function showOrderPage(req, res) {
          const rows = db.query('SELECT * FROM orders WHERE id = ?', req.id);
          res.render('order', { rows });
        }` },
      lines: [3],
      explain: 'The screen code talks straight to the database, skipping the business and data layers. It now depends on table names, and no business rules are applied.' },

    { type: 'bucket', prompt: 'Which POSA pattern does each situation describe?', buckets: ['Layers', 'Pipes & Filters', 'Broker', 'MVC'],
      items: [['Compiler stages: read, tokenise, parse, optimise, emit', 1], ['Screens, business rules, data access and database stacked top to bottom', 0], ['Clients ask for a service by name and never learn its address', 2], ['One model with several views that update when it changes', 3], ['`cat file | sort | uniq`', 1], ['Swap the database without touching the screens', 0]],
      explain: 'Layers stack responsibilities. Pipes and Filters chain small steps. A Broker decouples clients from where services live. MVC separates data, display and input handling.' },

    { type: 'match', prompt: 'Match each part of MVC to its job.',
      pairs: [['Model', 'Holds the data and the rules'], ['View', 'Shows the data to the user'], ['Controller', 'Turns user input into actions'], ['Observer link', 'Tells views when the model changed']],
      explain: 'The model owns the truth, the view displays it, and the controller handles input. The model notifies its views using the Observer pattern from earlier.' },

    { type: 'mcq', q: 'A server must handle 10,000 mostly idle connections with one loop. It is told when a connection has data ready, and then it reads the data itself. Which pattern is that?',
      options: ['Reactor', 'Proactor', 'Broker', 'Layers'],
      answer: 0,
      why: [null, 'In Proactor the system performs the read and tells you it has **finished**. Here the loop reads after being told "ready".', 'A broker routes requests to services. It is not an event loop.', 'Layers organise code into levels. They do not handle events.'],
      explain: 'Reactor waits for "ready" events and dispatches handlers that do the work. Proactor starts the work and is called on completion.' },

    { type: 'tf', statement: 'Choosing an architectural pattern is generally as cheap to reverse as choosing a design pattern.', answer: false,
      explain: 'Architecture is built into every file and process, so changing it can take months. That is why it deserves more careful thought than a local design choice.' },

    { type: 'scenario', title: 'Rebuilding the shop', meters: { simplicity: 50, flexibility: 40 },
      intro: 'You are designing the architecture of a mid-sized shop: web storefront, admin screens, nightly sales reports, and an API for partners.',
      steps: [
        { text: 'Screens contain SQL, pricing rules and HTML in the same files. Changing the database means touching everything. What do you introduce first?',
          choices: [
            { label: 'Layers: presentation, business logic and data access, each calling only the one below', score: 2, effects: { flexibility: 30, simplicity: 10 }, feedback: 'The standard remedy for tangled concerns. Each layer can change, and be tested, without disturbing the others.' },
            { label: 'A Broker between every class', score: 0, effects: { simplicity: -30 }, feedback: 'Wildly more machinery than needed. A broker solves location and routing problems you do not have.' },
            { label: 'Rewrite it in a new framework', score: 0, effects: { simplicity: -15, flexibility: -10 }, feedback: 'A new framework does not fix mixed concerns. They will follow you into it.' }
          ] },
        { text: 'The nightly report reads orders, strips test data, groups by region, totals sales and prints a PDF. Steps keep being added or reordered. How do you structure it?',
          choices: [
            { label: 'A pipeline: independent filters connected in a line', score: 2, effects: { flexibility: 30, simplicity: 15 }, feedback: 'Each step is small, reusable and testable. Reordering is a change to the line, not to the steps.' },
            { label: 'One 600-line function', score: 0, effects: { simplicity: -20 }, feedback: 'It works today and becomes the thing nobody dares touch.' },
            { label: 'MVC', score: 0, effects: { flexibility: -5 }, feedback: 'MVC organises interactive user interfaces. A batch report is a flow of data, which is a pipeline’s job.' }
          ] }
      ],
      outro: 'Name the shape of the whole, then the pieces.' },

    { type: 'explain', prompt: 'Pick three of Layers, Pipes and Filters, Broker, MVC and Reactor. Say what each does and one cost.',
      model: 'Layers stack responsibilities so each layer uses only the one below, which separates concerns but adds indirection. Pipes and Filters chains small independent steps from a source to a sink, which makes steps reusable but suits poorly where steps need rich shared state. MVC splits an interactive app into a model of data and rules, a view that shows it and a controller that handles input; many variants make the term loose. Broker routes requests by name between clients and services, but adds a hop and a central dependency.',
      keywords: ['layers', 'filter', 'broker', 'MVC', 'model', 'view', 'controller', 'cost'] }
  ],

  flashcards: [
    { q: 'What is POSA?', a: 'Pattern-Oriented Software Architecture, a book series that catalogued patterns at architectural scale, alongside design patterns and idioms.' },
    { q: 'What is the Layers pattern?', a: 'Stack a system into levels (such as presentation, business, data), each using only the level below through a small interface.' },
    { q: 'What is Pipes and Filters?', a: 'Break a job into independent steps (filters) joined by connections (pipes), so data flows through them from a source to a sink.' },
    { q: 'What is a Broker?', a: 'A middleman that lets clients ask for services by name and forwards the requests, so clients do not need to know where services live.' },
    { q: 'Reactor versus Proactor?', a: 'Reactor: told a resource is ready, then your handler does the work. Proactor: the system does the work and tells you it has finished.' }
  ],

  glossary: [
    { term: 'Architectural pattern', def: 'A named, proven way of organising the major parts of a whole system, larger in scale than a design pattern.', like: 'A floor plan for a whole building.' },
    { term: 'Layers', def: 'A pattern that arranges a system in levels, each building on the one below.', like: 'A company: front desk, departments, archive.' },
    { term: 'Pipes and Filters', def: 'A pattern of independent processing steps joined by connections, with data flowing through them in order.', like: 'A factory assembly line.' },
    { term: 'Broker (pattern)', def: 'A pattern in which a middleman finds and connects clients to services, hiding where those services are.', like: 'An office switchboard.' },
    { term: 'MVC', aka: ['Model-View-Controller'], def: 'A pattern that splits an interactive application into model (data and rules), view (display) and controller (input handling).', like: 'A restaurant: kitchen, plate, waiter.' },
    { term: 'Event loop', def: 'A loop that waits for events, such as incoming data, and calls the matching handler. It is the heart of Reactor-style servers.', like: 'A receptionist waiting for the next bell.' }
  ],

  takeaways: [
    'Patterns exist at **system scale** too: POSA calls them architectural patterns.',
    '**Layers** separate concerns; **pipes and filters** chain small steps; **Broker** hides where services live.',
    '**MVC** splits data, display and input. **Reactor/Proactor** let one loop serve many connections.',
    'Architecture is expensive to reverse: choose by forces, not fashion.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('patterns-picker', {
  eli5: 'Knowing the patterns is only half the skill. The other half is looking at a messy problem and spotting which pattern, if any, fits. This lesson is practice at that.',

  cards: [
    { kind: 'metaphor', title: 'The good doctor',
      body: `A good doctor does not walk in with a favourite medicine. They listen to the **symptoms**, ask what is actually going on, name the condition, and only then prescribe. Sometimes the prescription is "rest, and come back if it gets worse": **no treatment**.

        Choosing a pattern is the same. The code smells are your symptoms. The **forces**, the competing pressures in the situation, such as "must be flexible" against "must stay simple", are the diagnosis. The pattern is the treatment.

        And, like the doctor, the best answer is sometimes **nothing yet**.` },

    { kind: 'steps', title: 'A method for picking',
      body: 'Five questions to ask, in order, before you reach for a pattern.',
      steps: [
        { title: 'What hurts?', body: 'Name the pain in plain words: "adding a payment type means editing six files". If you cannot name pain, stop here.' },
        { title: 'What varies, and what must stay steady?', body: 'This is the Encapsulate What Varies lesson in action. The varying part is what you will put behind an interface.' },
        { title: 'Which family is it?', body: 'Is the trouble about **making** objects, **joining** them, or how they **behave** together? That narrows 23 patterns to 5, 7 or 11.' },
        { title: 'Check the smells', body: 'Match the symptoms against the list in this lesson. Several smells agreeing is a strong hint.' },
        { title: 'Try the simplest thing', body: 'Could a function, a parameter or a plain `if` do it? If so, do that. Refactor to the pattern when the simple way starts to hurt.' }
      ] },

    { kind: 'example', title: 'A worked example',
      body: `A monitoring app reads sensors. The story so far:

        1. When a reading passes a limit, several things must happen: email, a dashboard flash, a log entry. More will be added. **Pain**: one class knows them all. That is **Observer**.
        2. Each user chooses how they are alerted: email, SMS or pager, and new channels appear every quarter. **What varies**: the channel. That is **Strategy**.
        3. An alert must be logged, retried and rate-limited, in different combinations per customer. A subclass per combination is exploding. That is **Decorator**.

        Three problems, three patterns, and none were used before the pain appeared.` },

    { kind: 'compare', title: 'Cheat sheet 1: making objects (5)',
      body: 'Creational patterns. Find your pain in the left column.',
      cols: ['Reach for it when…', 'Cue'],
      rows: [
        ['Factory Method', 'A subclass should decide which class gets created', '"Which kind?"'],
        ['Abstract Factory', 'You need a whole family of matching objects', '"A themed set"'],
        ['Builder', 'Many optional parts and unreadable constructors', '"Step by step"'],
        ['Prototype', 'Copying a configured object is easier than building one', '"Clone it"'],
        ['Singleton', 'Exactly one shared instance is truly needed (try injection first)', '"Only one"']
      ] },

    { kind: 'compare', title: 'Cheat sheet 2: fitting objects together (7)',
      body: 'Structural patterns.',
      cols: ['Reach for it when…', 'Cue'],
      rows: [
        ['Adapter', 'An existing interface does not match the one you need', '"Wrong plug"'],
        ['Facade', 'Using a subsystem takes many calls in the right order', '"One front door"'],
        ['Decorator', 'Add behaviour at runtime, stackable in any combination', '"Wrap and add"'],
        ['Proxy', 'Control access: lazy, cached, protected or remote', '"Stand-in"'],
        ['Composite', 'Parts and wholes form a tree and should be treated alike', '"Tree"'],
        ['Bridge', 'Two dimensions vary independently and classes multiply', '"N × M classes"'],
        ['Flyweight', 'Huge numbers of near-identical objects eat memory', '"Memory"']
      ] },

    { kind: 'compare', title: 'Cheat sheet 3: behaviour, part one (6)',
      body: 'Behavioural patterns, the first half.',
      cols: ['Reach for it when…', 'Cue'],
      rows: [
        ['Strategy', 'Several interchangeable ways of doing one job', '"Which way?"'],
        ['State', 'Behaviour depends on a stage that changes over time', '"Status plus if-chains"'],
        ['Observer', 'One thing changes and many others need to know', '"Notify"'],
        ['Mediator', 'Many objects talk to many, and it is tangled', '"Control tower"'],
        ['Command', 'A request must be queued, logged, repeated or undone', '"Undo"'],
        ['Memento', 'You need to snapshot and restore state privately', '"Save point"']
      ] },

    { kind: 'compare', title: 'Cheat sheet 4: behaviour, part two (5)',
      body: 'The rest of the behavioural patterns. That makes all 23.',
      cols: ['Reach for it when…', 'Cue'],
      rows: [
        ['Template Method', 'Same skeleton of steps, with a few steps that vary', '"Same recipe"'],
        ['Iterator', 'Walk a collection without knowing how it is stored', '"Next, next"'],
        ['Chain of Responsibility', 'A request should travel until some handler deals with it', '"Middleware"'],
        ['Visitor', 'New operations on a stable family of classes', '"New job, same parts"'],
        ['Interpreter', 'Evaluate rules written in a small language', '"Rule text"']
      ] },

    { kind: 'concept', title: 'Smells that point to patterns',
      body: `A **code smell** is a hint that something deserves a look, not proof of a bug.

        - A giant \`switch\` on a type or status → **Strategy**, **State**, or **Visitor**
        - A constructor with many optional arguments → **Builder**
        - \`new SomeClass()\` scattered everywhere → **Factory**
        - A subclass for every combination → **Decorator** or **Bridge**
        - A copy-pasted skeleton with one line changed → **Template Method**
        - One change that needs manual calls into many places → **Observer**
        - \`instanceof\` checks over a tree → **Composite**
        - The same string of calls at every call site → **Facade**
        - A vendor's API leaking everywhere → **Adapter**

        Treat these as questions to ask, not answers.` },

    { kind: 'pitfall', title: 'Over-engineering alarms',
      body: `Ring the bell when you notice:

        - **A pattern name in a class with only one real implementation** ("just in case").
        - **An interface with a single implementer** that nobody plans to add to.
        - **You cannot name the pain** the pattern solves, only the flexibility it might give.
        - **More plumbing than logic**: more files for wiring than for the work itself.
        - **A new teammate needs a diagram to find where two plus two happens.**
        - **"We might need it later."** A useful rule of thumb is to tolerate duplication until the **third** time, then refactor with real examples in hand.

        Patterns exist to make change cheaper. If a pattern makes the code harder to change, it has failed at its one job.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Users choose email, SMS or pager for alerts, and new channels keep appearing. What varies, and which pattern fits?',
      options: ['The way an alert is delivered, so Strategy', 'The stage an alert is in, so State', 'The number of listeners, so Singleton', 'The shape of the data, so Flyweight'],
      answer: 0,
      why: [null, 'State would fit if the alert itself moved through stages. Here the user chooses how it is delivered.', 'Singleton is about having exactly one instance. It does not deal with delivery methods.', 'Flyweight saves memory for huge numbers of similar objects, which is not the pain here.'],
      explain: 'The varying part is the delivery method: interchangeable ways of doing one job, chosen from outside. That is Strategy.' },

    { type: 'match', after: 6, prompt: 'Match the pain to the pattern that treats it.',
      pairs: [['One change, ten classes must react', 'Observer'], ['Long constructor, most arguments optional', 'Builder'], ['Vendor library has the wrong method names', 'Adapter'], ['Same four-step recipe, one step differs', 'Template Method'], ['Millions of near-identical objects', 'Flyweight'], ['A request needs undo and a history', 'Command']],
      explain: 'Each pain has a recognisable shape: broadcast needs (Observer), unwieldy construction (Builder), a mismatch of interfaces (Adapter), a shared skeleton (Template Method), memory (Flyweight), and requests as objects (Command).' },

    { type: 'bucket', prompt: 'Sort these into their families.', buckets: ['Creational', 'Structural', 'Behavioural'],
      items: [['Builder', 0], ['Abstract Factory', 0], ['Facade', 1], ['Composite', 1], ['Proxy', 1], ['Mediator', 2], ['Memento', 2], ['Visitor', 2], ['Prototype', 0]],
      explain: 'Builder, Abstract Factory and Prototype make objects. Facade, Composite and Proxy shape structures. Mediator, Memento and Visitor govern how objects behave and cooperate.' },

    { type: 'spot', prompt: 'This function has the classic smell that hints at a pattern. Tap the line.',
      code: { lang: 'js', src: `
        function area(shape) {
          switch (shape.type) {
            case 'circle': return Math.PI * shape.r ** 2;
            case 'square': return shape.side ** 2;
            case 'triangle': return 0.5 * shape.b * shape.h;
          }
        }` },
      lines: [2],
      explain: 'A `switch` on a type tag, repeated for every operation, hints at polymorphism, or at Visitor if the shapes are stable and operations keep growing.' },

    { type: 'ab', q: 'You need to format a date in one of two styles, both known today. Which is the better design?',
      a: { lang: 'js', label: 'Strategy classes', src: `
        class DateFormatStrategy { format(d) { /* ... */ } }
        class IsoFormat extends DateFormatStrategy { }
        class UkFormat extends DateFormatStrategy { }
        class FormatFactory { create(kind) { /* ... */ } }` },
      b: { lang: 'js', label: 'A parameter', src: `
        function formatDate(d, style = 'iso') {
          return style === 'uk'
            ? d.toLocaleDateString('en-GB')
            : d.toISOString().slice(0, 10);
        }` },
      answer: 'b',
      explain: 'Two known styles and no sign of more is not enough pain to justify four classes. A parameter is easier to read, and you can refactor to Strategy if the options multiply.' },

    { type: 'mcq', q: 'A text editor needs undo and redo for typed characters, which are easy to reverse. Which approach is the best first choice?',
      options: ['Command objects that know how to do and undo their action', 'A Memento of the whole document after every keystroke', 'A Singleton holding the document', 'An Interpreter for the typed text'],
      answer: 0,
      why: [null, 'It works, but copying a whole document per keystroke is wasteful when each action has a simple inverse.', 'Singleton is about instance count and does not help with undo.', 'Interpreter evaluates small languages and is unrelated to undo.'],
      explain: 'Small, easily reversible actions are what Command is for, and it is cheap on memory. Reserve Memento for changes with no tidy inverse.' },

    { type: 'multi', q: 'Which of these are warning signs of over-engineering?',
      options: ['An interface with exactly one implementation that no one plans to extend', 'You can name the specific pain a pattern removes', 'More files for plumbing than for the actual logic', 'A pattern added "in case we need it later"', 'Using a plain function where a pattern was possible'],
      answers: [0, 2, 3],
      explain: 'A lone interface, plumbing that outweighs logic, and speculative flexibility are the classic alarms. Being able to name the pain is a good sign, and using a simple function is often the wise choice.' },

    { type: 'scenario', title: 'The notification platform', meters: { clarity: 50, flexibility: 40 },
      intro: 'You inherit a 600-line notification module. It works, but nobody enjoys changing it. You have a week to improve it.',
      steps: [
        { text: 'Delivery is an if/else chain over "email", "sms" and "push". Product wants WhatsApp and Slack too. What do you do?',
          choices: [
            { label: 'Extract each channel into its own strategy behind one interface and select by user preference', score: 2, effects: { flexibility: 35, clarity: 15 }, feedback: 'The pain is real and recurring, and the varying part is clear. New channels become new pieces, not edits.' },
            { label: 'Add two more else-ifs', score: 1, effects: { flexibility: -5, clarity: -15 }, feedback: 'Quickest today, but this chain is already the thing people dislike.' },
            { label: 'Rewrite the module using an event bus, a factory registry and a visitor', score: 0, effects: { clarity: -30, flexibility: 5 }, feedback: 'Three patterns for one problem. You would be paying for flexibility nobody asked for.' }
          ] },
        { text: 'Every notification now needs logging, retries and rate limiting, in different combinations per customer. What fits?',
          choices: [
            { label: 'Wrap the sender in small decorators and stack the ones each customer needs', score: 2, effects: { flexibility: 30, clarity: 15 }, feedback: 'Add-on behaviour in any combination is exactly what stackable wrappers are for.' },
            { label: 'A subclass for every combination', score: 0, effects: { clarity: -25, flexibility: -10 }, feedback: 'The class explosion. Three features already mean up to eight classes.' },
            { label: 'One giant class with boolean flags', score: 0, effects: { clarity: -20 }, feedback: 'Flags moved the explosion inside one class, where it is harder to see.' }
          ] },
        { text: 'A teammate proposes an Abstract Factory, a Mediator and an Interpreter "to be future-proof". What do you say?',
          choices: [
            { label: 'Ask which specific pain each one removes today, and add only those with a real answer', score: 2, effects: { clarity: 30 }, feedback: 'Patterns answer pain you can name. Speculation is the road to over-engineering.' },
            { label: 'Agree, more patterns mean better code', score: 0, effects: { clarity: -35 }, feedback: 'Patterns are tools, not trophies. Each one has a cost in extra code to read.' },
            { label: 'Refuse all patterns ever', score: 1, effects: { flexibility: -15 }, feedback: 'You have just used two successfully. The goal is judgement, not a ban.' }
          ] }
      ],
      outro: 'Read the forces, name the pain, use the lightest pattern that treats it, and sometimes none.' },

    { type: 'explain', prompt: 'You are reviewing a design. Describe how you decide whether a pattern is needed and which one, including how you would spot over-engineering.',
      model: 'I start by naming the pain in plain words, then ask what varies and what must stay steady, which narrows things to creational, structural or behavioural, and I check smells such as a giant switch, a long constructor or a subclass per combination. Before any pattern I try the simplest thing, like a function or a parameter. I would suspect over-engineering if there is an interface with one implementation, more plumbing than logic, or the reason is only "we might need it later".',
      keywords: ['pain', 'varies', 'smell', 'family', 'simplest', 'forces', 'over-engineering', 'later'] }
  ],

  flashcards: [
    { q: 'What does it mean to read a problem for its forces?', a: 'Identify the competing pressures in the situation (such as flexibility against simplicity) and what varies, before choosing a pattern.' },
    { q: 'Which smell hints at Strategy, State or Visitor?', a: 'A giant switch or if-chain on a type or status.' },
    { q: 'Which smell hints at Decorator or Bridge?', a: 'A subclass for every combination of options, like UrgentSms.' },
    { q: 'Which smell hints at Builder?', a: 'A constructor with many optional arguments, called with unreadable lists of null, true and false.' },
    { q: 'Name three over-engineering alarms.', a: 'A pattern with a single implementation "just in case"; more plumbing than logic; being unable to name the pain it solves.' }
  ],

  glossary: [
    { term: 'Forces', def: 'The competing pressures in a design situation, such as flexibility against simplicity, that a pattern must balance.', like: 'The tug-of-war a good decision has to settle.' },
    { term: 'Code smell', def: 'A surface sign in code that hints at a deeper design problem. It is a prompt to investigate, not proof.', like: 'A funny smell in the kitchen: probably worth checking.' },
    { term: 'Over-engineering', def: 'Building more structure or flexibility than the problem needs, which makes code harder to understand and change.', like: 'Building a motorway to reach the corner shop.' },
    { term: 'Refactoring', def: 'Changing the structure of code without changing what it does, usually to make it easier to understand or extend.', like: 'Tidying a workshop so the next job is easier.' }
  ],

  takeaways: [
    'Start with the **pain** and the **forces**, not the pattern.',
    'Smells are hints: giant switches, long constructors, subclass-per-combination.',
    'Try the simplest thing first and refactor towards a pattern when it hurts.',
    'If a pattern makes change harder, it has failed.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('patterns-behavioral', {
  title: 'The Shapeshifter of Many Moods',
  intro: 'A creature that changes its behaviour every time you look at it guards the last door of the patterns wing. Beat it by telling look-alike patterns apart, spotting broken undo stacks and leaky listeners, and knowing when no pattern at all is the right answer.',
  questions: [
    { type: 'mcq', q: 'A vending machine refuses to dispense until paid, dispenses once paid, and refuses everything while being refilled. Many of its methods check the same `mode` string. Which pattern fits best?',
      options: ['State: one object per mode, each deciding what the actions mean and which mode comes next', 'Strategy: the customer passes in a dispensing function', 'Observer: the machine announces each button press', 'Template Method: a parent class fixes the order of dispensing steps'],
      answer: 0,
      why: [null, 'Nobody outside chooses the behaviour here. The machine changes it itself as it moves between modes.', 'Announcing presses does not remove the branching on `mode` in every method.', 'The problem is not a shared skeleton of steps but behaviour that depends on the current stage.'],
      explain: 'Behaviour that depends on a stage, with the same status check repeated in many methods, is the State signature. Strategy looks alike on a diagram, but its choice is made from outside.' },

    { type: 'spot', prompt: 'This settings panel subscribes to a theme feed. Users open and close it hundreds of times a day and the app slowly fills memory. Tap the line that causes it.',
      code: { lang: 'js', src: `
        class SettingsPanel {
          constructor(theme) {
            theme.on('changed', (t) => this.repaint(t));
          }
          close() {
            this.element.remove();
          }
        }` },
      lines: [3],
      explain: 'The returned unsubscribe function is thrown away, so the theme feed keeps every closed panel alive and still repainting. Store it (`this.stop = theme.on(...)`) and call it in `close()`.' },

    { type: 'bucket', prompt: 'Observer or Mediator?', buckets: ['Observer', 'Mediator'],
      items: [['A weather station tells every display when the temperature changes', 0], ['A booking form where picking a date disables some rooms and changes the price box', 1], ['The sender knows nothing about who listens', 0], ['The rules about who reacts to whom live in one central object', 1], ['Main risk: the centre swells into a god class', 1], ['Main risk: forgotten subscriptions and invisible chains of reactions', 0]],
      explain: 'Observer is one-to-many broadcasting where the subject stays ignorant of its listeners. Mediator is a central coordinator for a fixed group, holding the interaction rules in one place.' },

    { type: 'spot', prompt: 'After undoing two steps, the user types a new word, then presses redo and gets nonsense. Tap the line that is missing its partner.',
      code: { lang: 'js', src: `
        run(cmd) {
          cmd.execute();
          this.undoStack.push(cmd);
        }
        undo() {
          const cmd = this.undoStack.pop();
          if (!cmd) return;
          cmd.undo();
          this.redoStack.push(cmd);
        }` },
      lines: [3],
      explain: 'A new action must clear the redo stack (`this.redoStack = []`) right after it is recorded. Otherwise redo replays a "future" that no longer fits the document.' },

    { type: 'mcq', q: 'A command charges a customer’s card. The order is then cancelled. What should its "undo" do?',
      options: ['Run a compensating action, such as issuing a refund', 'Call execute() again to reverse the charge', 'Restore a memento of the card balance', 'Nothing: a charge is recorded, so undo is automatic'],
      answer: 0,
      why: [null, 'Running it again would charge the customer twice.', 'You cannot snapshot and restore a bank’s records from your code.', 'Recording a charge does not reverse it.'],
      explain: 'Real-world side effects cannot be wound back by code. The best you can do is a new action that cancels the effect, like a refund or a correction email.' },

    { type: 'match', prompt: 'Match each role to its pattern’s job.',
      pairs: [['Caretaker', 'Stores snapshots without looking inside'], ['Hook', 'Optional, empty-by-default step a subclass may override'], ['Context', 'Holds the current strategy or state and delegates to it'], ['Subject', 'Announces events to whoever subscribed'], ['Invoker', 'Runs commands and keeps them in a history']],
      explain: 'Caretaker belongs to Memento, hook to Template Method, context to Strategy and State, subject to Observer, and invoker to Command.' },

    { type: 'tf', statement: 'A generator can safely yield an endless sequence, as long as the code consuming it has a stop condition.', answer: true,
      explain: 'Generators are lazy: each value is made only when the consumer asks for it. An endless generator is fine as long as the consumer has a stop condition, such as a `break`.' },

    { type: 'ab', q: 'Four report exporters share load, save and notify, and differ only in how they format. Which design is better?',
      a: { lang: 'js', label: 'Template', src: `
        class Exporter {
          export(r) {
            const text = this.format(this.load(r));
            this.save(text);
            this.notify(r);
          }
        }
        class HtmlExporter extends Exporter {
          format(rows) { /* HTML only */ }
        }` },
      b: { lang: 'js', label: 'Subclass rewrites all', src: `
        class HtmlExporter extends Exporter {
          export(r) {
            const rows = r.rows();
            const text = toHtml(rows);
            writeFile(text);
            emailOwner(r);
          }
        }` },
      answer: 'a',
      explain: 'In the template version the parent owns the order and the subclass fills one blank, so a fix to saving helps every exporter. The rewrite-everything version overrides the template method itself, copying the shared steps and letting the order drift.' },

    { type: 'order', prompt: 'A request reaches a server whose middleware chain is logging, then auth, then rate limit, then the app. The user is logged in but over the limit. Put what happens in order.',
      items: ['Logging records the request and passes it on', 'Auth finds a valid user and passes it on', 'Rate limit answers 429 Too Many Requests', 'The reply travels back to the client, and the app never runs'],
      explain: 'Each link handles or passes on. Rate limit decides to answer itself, which ends the chain before the expensive app code is reached.' },

    { type: 'multi', q: 'Your team has a stable set of six syntax-tree node classes and plans many new passes over them (type check, pretty-print, optimise). Which statements about using Visitor here are true?',
      options: ['Each new pass is one new visitor, with no edits to the node classes', 'Each node’s accept() calls the visitor method for its own kind, which is double dispatch', 'Adding a seventh node class later will mean updating every visitor', 'Visitor also makes adding new node classes free', 'Visitor is a kind of Chain of Responsibility'],
      answers: [0, 1, 2],
      explain: 'Visitor makes new operations cheap and new element classes expensive, which suits stable classes with growing operations. It is not a chain: nothing is passed along a line of handlers.' },

    { type: 'bucket', prompt: 'Which architectural pattern does each describe?', buckets: ['Layers', 'Pipes & Filters', 'Broker', 'MVC'],
      items: [['Raw images pass through resize, watermark and compress steps in a line', 1], ['Business rules never touch HTML and never write SQL directly', 0], ['A client asks for "payments" by name and never learns which machine answers', 2], ['When the model changes, every chart showing it redraws', 3], ['A layer may only call the layer directly below it', 0]],
      explain: 'Layers stack responsibilities, pipes and filters chain one-way steps, a broker hides where services live, and MVC splits data, display and input so one model can drive many views.' },

    { type: 'cloze', text: 'To let marketing write discount rules safely, use {{Interpreter}}: a small language whose sentences become an object {{tree}} that evaluates itself, rather than running their text with {{eval}}. To serve 10,000 idle connections from one loop that is told when data is {{ready}} and then reads it, use Reactor.',
      distractors: ['Visitor', 'finished', 'list', 'Proxy'],
      explain: 'Interpreter turns a limited rule language into evaluating objects, so users can only do what you defined. Reactor reacts to "ready" events; Proactor would be told the read has already finished.' }
  ]
});

KS.sheet('patterns-behavioral', {
  title: 'Behavioural & architectural patterns: cheat sheet',
  sections: [
    { title: 'Changing behaviour: Strategy & State',
      md: `| | Strategy | State |
        |---|---|---|
        | Answers | *How* do I do this job? | *What can I do now?* |
        | Who switches | The client, from outside | The object itself, as it moves on |
        | Parts know each other? | No | Yes, states pick the next state |
        | Example | Shipping rule, sort order | Draft → In review → Published |

        **Context** holds the current strategy/state and delegates. A strategy can be just a function. Draw a **state machine** (states + events) first; large ones read better as a table. **Smell:** the same \`switch\`/\`if\` on status in many methods. Two stable cases? Keep the \`if\`.` },

    { title: 'Communicating: Observer & Mediator',
      md: `| | Observer | Mediator |
        |---|---|---|
        | Shape | One announces, many listen | Many talk through one centre |
        | Sender knows | Nothing about listeners | Only the mediator |
        | Rules live | In each listener | In the mediator |
        | Risk | Leaks, hidden reaction chains | Mediator becomes a god class |
        | Seen in | \`addEventListener\`, \`EventEmitter\` | Chat room, dialog coordinating fields |

        **Every \`on()\` needs an \`off()\`**: keep the unsubscribe function and call it on destroy (lapsed listener leak).` },

    { title: 'Undo: Command & Memento',
      md: `**Command** = request as an object with \`execute()\` and \`undo()\`. **Invoker** (History) keeps two stacks: run → push on undo stack and **clear redo**; undo → pop, \`undo()\`, push on redo. Also gives queues, macros, logs, retries.

        **Memento** = snapshot made by the **originator** itself; the **caretaker** stores it and never peeks.

        | Store the action (Command) | Store the state (Memento) |
        |---|---|
        | Small, cheap | Can be large |
        | Must write each inverse | Save and restore, no inverse |
        | Small reversible actions | No tidy inverse, checkpoints |

        Real side effects (emails, charges) need a **compensating action**. Cap history size.` },

    { title: 'Steps and walking: Template Method & Iterator',
      md: `**Template Method:** parent fixes the skeleton, subclasses fill the blanks. **Required** steps throw "override me"; **hooks** are empty by default. Hollywood principle: "don't call us, we'll call you". Uses inheritance, so if only one step varies, pass a function (Strategy) instead.

        **Iterator:** visit items one at a time without knowing the storage; keeps its own position. JS: \`[Symbol.iterator]()\` returning \`next()\` → \`{ value, done }\`, used by \`for...of\`.

        **Generator:** \`function*\` + \`yield\` (Python: \`yield\`). Lazy, pauses between values, ideal for huge files.

        **Gotchas:** do not modify a collection while looping; many iterators are one-shot; endless generators need a \`break\`.` },

    { title: 'Chain, Visitor, Interpreter',
      md: `| Pattern | Idea | Watch out |
        |---|---|---|
        | Chain of Responsibility | Each link handles **or** passes on; may stop the line | Request falls off the end; order matters; hard to trace |
        | Visitor | New operation = new visitor; \`accept(v)\` calls \`v.visitX(this)\` (**double dispatch**) | New element class breaks every visitor |
        | Interpreter | Small language as an object tree that \`evaluate()\`s itself | Small grammars only; **never \`eval\` user text** |

        **Middleware** (Express, Django, ASP.NET) is a chain. Visitor: easy new operations, hard new classes. Interpreter lives in rule engines, formulas, search filters, regex, SQL.` },

    { title: 'Architectural patterns (POSA)',
      md: `| Pattern | Shape | Cost |
        |---|---|---|
        | Layers | Presentation → business → data → DB, each calls the one below | Pass-through "lasagne" |
        | Pipes & Filters | Independent steps in a one-way line, source → sink, like a shell pipeline | Bad with rich shared state |
        | Broker | Clients ask a middleman for services **by name** | Extra hop, central dependency |
        | MVC | Model (data, rules), View (display), Controller (input); model notifies views | Many variants: MVP, MVVM |
        | Reactor / Proactor | One loop for many connections: told **ready** / told **finished** | One slow handler blocks all |

        Strict layering: only the next layer down. Architecture is costly to reverse.` },

    { title: 'Picking a pattern',
      md: `1. **Name the pain.** None? Stop. 2. **What varies?** 3. **Which family?** Making (5), joining (7), behaving (11). 4. **Check smells.** 5. **Try the simplest thing.**

        | Smell | Consider |
        |---|---|
        | \`switch\` on type/status | Strategy, State, Visitor |
        | Long optional constructor | Builder |
        | Subclass per combination | Decorator, Bridge |
        | Copied skeleton, one line differs | Template Method |
        | One change, many manual calls | Observer |

        **Over-engineering alarms:** single-implementer interface, more plumbing than logic, "we might need it later". Refactor on the **third** duplicate.` }
  ]
});
