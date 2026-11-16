/* Module: principles — Design Principles.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs principles */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-composition', {
  eli5: 'Instead of building a family tree of ever-more-specific classes, you snap small, swappable parts together, like building with Lego rather than carving a new statue for every idea.',

  cards: [
    { kind: 'concept', title: 'The class explosion',
      body: `You are building a notification system. At first it only sends emails. Then the business wants SMS. Then an **urgent** version of each. Then a **scheduled** version of each of those.

        If every combination gets its own subclass, you need \`EmailNotification\`, \`SmsNotification\`, \`UrgentEmail\`, \`UrgentSms\`, \`ScheduledUrgentSms\`... and every new option **multiplies** the list. Two channels, two priorities and two timings is already eight classes.

        This is the **class explosion**, and it is what happens when inheritance is your only tool for adding variety.` },

    { kind: 'code', title: 'The family tree',
      body: 'Each new idea hangs off the tree somewhere. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class Notification {
          send(msg) { /* plain email */ }
        }
        class SmsNotification extends Notification {
          send(msg) { /* SMS gateway */ }
        }
        class UrgentEmail extends Notification {
          send(msg) { super.send('[URGENT] ' + msg); }
        }
        class UrgentSms extends SmsNotification {
          send(msg) { super.send('[URGENT] ' + msg); }
        }
        // ...and ScheduledUrgentSms, ScheduledEmail, ...`,
        notes: {
          7: 'Urgent email needs its own class, because urgency is stuck inside the family tree.',
          10: '**The same urgency logic, copied.** A change to the urgent prefix now has to be made in every class that has it.',
          13: 'Each new option doubles the number of classes you might need.'
        } } },

    { kind: 'metaphor', title: 'Sandwich menu vs sandwich bar',
      body: `One café has a menu with a named sandwich for every combination: "Ham & Cheese on White", "Ham & Cheese on Rye", "Cheese & Pickle on White"... The menu is getting out of hand.

        Another café has a **sandwich bar**: pick a bread, pick a filling, pick a sauce. A new filling is one more tub on the counter, and it works with every bread already.

        Inheritance is the first café. **Composition** is the second: you build the thing you want from small parts, instead of finding it in a catalogue.` },

    { kind: 'concept', title: 'Is-a versus has-a',
      body: `Two small questions decide almost everything:

        - **Is-a**: *a savings account **is an** account*. That is inheritance.
        - **Has-a**: *a notifier **has a** channel it sends through*. That is composition: the notifier holds another object in a field.

        Inheritance says what something **is**, forever, fixed when you write the code. Composition says what something **uses**, and the part can be replaced.

        Notice that "urgent" and "SMS" are not kinds of notifier. They are **parts** of one. That is the clue.`,
      note: 'Composition means building an object by holding other objects in its fields.' },

    { kind: 'code', title: 'After: snap the parts together',
      body: 'One `Notifier`, and the variety lives in small parts it holds.',
      code: { lang: 'js', src: `
        class Notifier {
          constructor(channel, priority) {
            this.channel = channel;      // has-a
            this.priority = priority;    // has-a
          }
          send(msg) {
            const text = this.priority.decorate(msg);
            this.channel.deliver(text);  // delegation
          }
        }

        const sms = { deliver(text) { /* SMS gateway */ } };
        const urgent = { decorate(m) { return '[URGENT] ' + m; } };

        new Notifier(sms, urgent).send('Server down');`,
        notes: {
          3: 'The notifier **has a** channel. It does not care which one.',
          8: '**Delegation**: the notifier does not do the work itself, it hands it to the part that knows how.',
          12: 'A new channel is a new small object. No existing class is touched.',
          15: 'Pick any channel with any priority: 2 + 2 parts, 4 combinations, no new classes.'
        } } },

    { kind: 'diagram', title: 'Parts you can swap',
      body: 'The notifier stays the same. Only the parts plugged into it change, even while the program is running.',
      nodes: [
        { id: 'n', label: 'Notifier', icon: '🔔', x: 1, y: 0, tone: 'accent' },
        { id: 'c1', label: 'Email channel', x: 0, y: 1 },
        { id: 'c2', label: 'SMS channel', x: 1, y: 1 },
        { id: 'p1', label: 'Urgent priority', x: 0, y: 2, tone: 'warn' },
        { id: 'p2', label: 'Normal priority', x: 1, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'n', to: 'c1', label: 'delivers via', dashed: true },
        { from: 'n', to: 'c2', dashed: true },
        { from: 'n', to: 'p1', label: 'decorates with', dashed: true },
        { from: 'n', to: 'p2', dashed: true }
      ],
      caption: 'Dashed arrows are "could use". Each notifier holds one of each.' },

    { kind: 'compare', title: 'Inheritance versus composition',
      body: 'Neither is evil. They are different tools.',
      cols: ['Inheritance', 'Composition'],
      rows: [
        ['Relationship', '"is a" (a kind of)', '"has a" (uses a)'],
        ['Chosen', 'When you write the code', 'Can change while it runs'],
        ['Coupling', 'Child is tied to its parent’s internals', 'Only tied to the part’s interface'],
        ['New combination', 'Often a new class', 'Plug in different parts'],
        ['Reuse', 'Comes with the whole parent', 'Take exactly the part you need']
      ] },

    { kind: 'pitfall', title: 'Inheriting just to borrow code',
      body: `The most common misuse: a class extends another **only** because it wants one of its methods.

        An \`Invoice\` that extends \`PdfRenderer\` to call \`render()\` is not a kind of renderer. It now inherits every method the renderer has, and any change to the parent can break the invoice. This is called the **fragile base class** problem.

        If the honest sentence is "it *uses* that", hold it in a field. If it is "it *is* one of those", inheritance may fit.` },

    { kind: 'tip', title: 'When inheritance is still right',
      body: `Composition is a default, not a law. Inheritance is a good call when:

        - The relationship is a genuine, stable **is-a** (a \`Circle\` really is a \`Shape\`).
        - You are keeping the hierarchy **shallow**, one or two levels.
        - A framework asks you to extend one of its classes.

        A handy test: could a \`Circle\` be used anywhere a \`Shape\` is expected without surprises? If yes, inheritance is safe. (A later lesson on Liskov Substitution makes that test precise.)` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'A notifier needs 2 channels (email, SMS), 2 priorities (normal, urgent) and 2 timings (now, scheduled). With one subclass per combination, how many classes?',
      options: ['8, one per combination', '6, one per option listed', '3, one per kind of option', '2, one per channel'],
      answer: 0,
      why: [null, 'That would be adding the options. Combinations multiply: 2 × 2 × 2.', 'Each *combination* needs its own class under inheritance, not each kind of option.', 'Priorities and timings need classes too.'],
      explain: 'With inheritance every combination needs its own class: 2 × 2 × 2 = 8. Add a third channel and it is 12. Composition needs only 2 + 2 + 2 small parts.' },

    { type: 'bucket', after: 3, prompt: 'Is-a (inheritance might fit) or has-a (use a field)?', buckets: ['Is-a', 'Has-a'],
      items: [['A SavingsAccount and an Account', 0], ['A Checkout and its PaymentGateway', 1], ['A Circle and a Shape', 0], ['An Order and its ShippingPolicy', 1], ['A Notifier and its Channel', 1], ['A Truck and a Vehicle', 0]],
      explain: 'A gateway, a policy and a channel are things the object **uses**, and you may want to swap them. An account type, a shape and a vehicle describe what the object **is**.' },

    { type: 'tf', statement: 'With composition, an object can swap one of its parts for another while the program is running.', answer: true,
      explain: 'The part lives in a field, so you can hand the object a different one at any moment. With inheritance an object’s class is fixed when it is created, which is a big part of why composition is more flexible.' },

    { type: 'spot', prompt: 'One line here is a design smell. Tap it.',
      code: { lang: 'js', src: `
        class PdfRenderer {
          render(html) { /* make a PDF */ }
        }
        class Invoice extends PdfRenderer {
          constructor(lines) { super(); this.lines = lines; }
          download() { return this.render(this.toHtml()); }
          toHtml() { /* markup for the lines */ }
        }` },
      lines: [4],
      explain: 'An invoice is not a kind of PDF renderer; it just wants to use one. Extending makes it inherit every renderer method and tie itself to the parent’s internals. Hold a renderer in a field instead.' },

    { type: 'ab', q: 'Which design copes better when marketing asks for a CSV export that is emailed?',
      a: { lang: 'js', label: 'Parts', src: `
        class Report {
          constructor(format, destination) {
            this.format = format;
            this.destination = destination;
          }
          run(data) {
            this.destination.send(this.format.render(data));
          }
        }` },
      b: { lang: 'js', label: 'Family tree', src: `
        class Report { run(data) { /* ... */ } }
        class PdfReport extends Report { }
        class CsvReport extends Report { }
        class PdfEmailReport extends PdfReport { }
        class CsvEmailReport extends CsvReport { }` },
      answer: 'a',
      explain: 'The first design gains CSV by adding one small format part, which works with every destination already there. The family tree needs another class for each new combination.' },

    { type: 'cloze', code: true, text: 'class Notifier {\n  constructor(channel) {\n    this.{{channel}} = channel;\n  }\n  send(msg) {\n    this.channel.deliver(msg);  // handing the work on is called {{delegation}}\n  }\n}',
      distractors: ['inheritance', 'super', 'extends'],
      explain: 'The notifier **has a** channel in a field and **delegates** the real work to it. No `extends` is involved.' },

    { type: 'multi', q: 'Which of these are good reasons to still choose inheritance?',
      options: ['The relationship is a genuine, stable is-a, like Circle and Shape', 'The framework you are using requires you to extend its base class', 'You want to borrow one handy method from a class', 'You want to change behaviour while the program is running', 'You are planning a deep, seven-level hierarchy'],
      answers: [0, 1],
      explain: 'A real is-a and a framework requirement are fair reasons. Borrowing a method, swapping at runtime and deep hierarchies are all things composition does better.' },

    { type: 'scenario', title: 'The WhatsApp request', meters: { flexibility: 40, tidiness: 40 },
      intro: 'Your notifier currently uses the family-tree design above. Product asks you to add WhatsApp, with urgent and scheduled variants.',
      steps: [
        { text: 'How do you start?',
          choices: [
            { label: 'Create WhatsAppNotification, UrgentWhatsApp, ScheduledWhatsApp and ScheduledUrgentWhatsApp', score: 0, effects: { flexibility: -10, tidiness: -20 }, feedback: 'It works, and now there are a dozen near-identical classes. Next quarter’s request will double it again.' },
            { label: 'Refactor to a Notifier that holds a channel and a priority, then add a WhatsApp channel', score: 2, effects: { flexibility: 30, tidiness: 25 }, feedback: 'The old classes collapse into small parts, and WhatsApp is one new part that works with every priority and timing.' },
            { label: 'Add a boolean flag for each variant to the base class', score: 1, effects: { tidiness: -10 }, feedback: 'Fewer classes, but a pile of if statements inside one. You have moved the explosion, not removed it.' }
          ] },
        { text: 'A teammate suggests extending Notifier "just once" to reuse its retry logic in a new FileWriter class. What do you say?',
          choices: [
            { label: 'Fine, extending is the quickest way to reuse code', score: 0, effects: { flexibility: -15 }, feedback: 'A file writer is not a kind of notifier. Any change to the notifier’s internals now risks breaking it.' },
            { label: 'Pull the retry logic into its own part and have both hold it', score: 2, effects: { flexibility: 20, tidiness: 15 }, feedback: 'Exactly. Shared behaviour becomes a small part both use, with no false family relationship.' },
            { label: 'Copy and paste the retry code', score: 1, effects: { tidiness: -10 }, feedback: 'Avoids the false relationship, but now two copies must be kept in sync.' }
          ] }
      ],
      outro: 'Default to parts. Reach for a family tree only when the is-a is real.' },

    { type: 'explain', prompt: 'Explain "favour composition over inheritance" to a teammate, using the notifier as your example.',
      model: 'With inheritance, every combination of channel, priority and timing needs its own subclass, so the number of classes explodes and logic gets copied. With composition, a Notifier has a channel and a priority in its fields and delegates to them, so each option is one small swappable part. It is also more flexible because you can change a part at runtime. Inheritance is still fine for a genuine, shallow is-a.',
      keywords: ['has-a', 'is-a', 'explosion', 'delegate', 'swap', 'parts'] }
  ],

  flashcards: [
    { q: 'What is the class explosion problem?', a: 'Using subclasses for every combination of options, so each new option multiplies the number of classes.' },
    { q: 'Is-a versus has-a?', a: 'Is-a means inheritance (a kind of). Has-a means composition: holding another object in a field and using it.' },
    { q: 'What is delegation?', a: 'An object handing a job to another object it holds, instead of doing the work itself.' },
    { q: 'What is the fragile base class problem?', a: 'A change to a parent class unexpectedly breaks its subclasses, because they depend on its internals.' },
    { q: 'When is inheritance still the right call?', a: 'For a genuine, stable, shallow is-a relationship, or when a framework requires you to extend its class.' }
  ],

  glossary: [
    { term: 'Composition', def: 'Building an object by holding other objects in its fields and using them, instead of inheriting from a parent.', like: 'A sandwich bar where you pick bread, filling and sauce.' },
    { term: 'Delegation', def: 'Passing a job on to another object you hold, so the part that knows how does the work.', like: 'A receptionist forwarding your call to the right department.' },
    { term: 'Class explosion', def: 'A rapid growth in the number of subclasses caused by having one for every combination of options.', like: 'A menu with a named dish for every possible combination of ingredients.' },
    { term: 'Fragile base class', def: 'The problem that changing a parent class can break its subclasses in unexpected ways.', like: 'Changing the foundations and finding the third floor cracks.' }
  ],

  takeaways: [
    'Ask "is it a kind of that, or does it use that?" Uses means a field.',
    'Inheritance multiplies classes; composition adds small parts.',
    'Compose by delegating to parts you can swap, even at runtime.',
    'Keep inheritance for genuine, shallow is-a relationships.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-encapsulate-varies', {
  eli5: 'Find the bit of your code the business keeps changing, put it in its own box with a steady front door, and the rest of your code never needs to notice when it changes.',

  cards: [
    { kind: 'concept', title: 'Find the thing that keeps changing',
      body: `Some code sits still for years. Other code is touched every quarter: discount rules, tax rates, which payment company you use this year.

        A simple design habit follows from that: **find the part that varies and fence it off**, so the rest of the program does not have to care how it works.

        This is the oldest idea in the principles module, and most of the others are really special cases of it. It comes down to two questions: *what is likely to change?* and *how do I stop that change spreading?*` },

    { kind: 'code', title: 'Before: the rule is everywhere',
      body: 'Three places each work out the discount for themselves. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        function cartTotal(cart, customer) {
          let total = sum(cart.items);
          if (customer.type === 'vip') total *= 0.9;
          return total;
        }

        function invoiceTotal(order, customer) {
          let total = sum(order.lines);
          if (customer.type === 'vip') total *= 0.9;
          return total + order.shipping;
        }

        function emailSummary(cart, customer) {
          let total = sum(cart.items);
          if (customer.type === 'vip') total = total * 0.9;
          return 'Your total: ' + total;
        }`,
        notes: {
          3: 'Rule one: VIPs get 10% off.',
          9: 'The **same rule** again, in another function.',
          15: 'And a third copy, which has already drifted: it is written differently.'
        } } },

    { kind: 'story', title: 'Black Friday, 11pm',
      body: `Marketing says: *"Black Friday: VIPs get 15%, students get 10%, everyone else gets nothing."*

        A developer searches for \`'vip'\`, edits the cart and the invoice, and ships. The email summary was written slightly differently and the search misses it.

        On Monday, customers complain: the email promised a price the checkout does not charge.

        Having to change many places for one small business change is called **shotgun surgery**: one pellet of change, holes everywhere. It is the classic sign that something that varies has not been fenced off.` },

    { kind: 'metaphor', title: 'The chalkboard menu',
      body: `A restaurant knows its prices and dishes change daily. So it does not carve them into the stone above the door.

        It puts them on a **chalkboard**: one place, easy to rub out, with a fixed frame around it. The door, tables and till never need to change when the soup of the day does.

        Encapsulating what varies is installing the chalkboard. The frame (the interface) is stable. What is written on it (the rules) is free to change.` },

    { kind: 'steps', title: 'How to fence something off',
      body: 'The same recipe works for pricing, payments, formats and more.',
      steps: [
        { title: 'Spot what has already changed', body: 'Look at your history or ask the business. Code that has been edited many times will be edited again.' },
        { title: 'Name it', body: 'Give the varying idea a plain-language name: *discount policy*, *payment provider*, *tax rule*.' },
        { title: 'Decide the stable question', body: 'What does the rest of the program need to ask? Probably only "what is the price for this customer?" The how is not its business.' },
        { title: 'Move the varying code behind that question', body: 'One function or object answers it. Everything else calls it.' },
        { title: 'Delete the copies', body: 'Every old if-statement becomes a call. Now a rule change happens in exactly one place.' }
      ] },

    { kind: 'code', title: 'After: one front door',
      body: 'Callers ask one question. The rules live in one place.',
      code: { lang: 'js', src: `
        function priceFor(subtotal, customer) {
          const rate = {
            vip: 0.15,
            student: 0.10
          }[customer.type] ?? 0;
          return subtotal * (1 - rate);
        }

        function cartTotal(cart, customer) {
          return priceFor(sum(cart.items), customer);
        }

        function invoiceTotal(order, customer) {
          return priceFor(sum(order.lines), customer) + order.shipping;
        }`,
        notes: {
          1: 'This is the **only** place that knows the discount rules.',
          3: 'Black Friday is now a two-line edit.',
          10: 'Callers just ask. They no longer know what a VIP is.'
        } } },

    { kind: 'diagram', title: 'Payment providers behind a stable door',
      body: 'The same trick for something bigger. Your checkout talks to one steady contract; the provider behind it can change.',
      nodes: [
        { id: 'co', label: 'Checkout', icon: '🛒', x: 1, y: 0, tone: 'accent' },
        { id: 'gw', label: 'charge(amount, card)', x: 1, y: 1, tone: 'good' },
        { id: 'a', label: 'Stripe adapter', x: 0, y: 2 },
        { id: 'b', label: 'PayPal adapter', x: 1, y: 2 },
        { id: 'c', label: 'Test fake', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'co', to: 'gw', label: 'calls' },
        { from: 'gw', to: 'a', dashed: true }, { from: 'gw', to: 'b', dashed: true }, { from: 'gw', to: 'c', dashed: true }
      ],
      caption: 'Switching providers means writing one new box. Checkout does not change.' },

    { kind: 'pitfall', title: 'Do not fence off everything',
      body: `Not every line is a future change. If you wrap every number and every if in its own box "just in case", you get a maze with no benefit.

        Fence off things that have **really varied** or that the business has told you will vary. A tax rate that changes yearly: yes. The word "Hello" in an email greeting: probably not.

        And note the timing: the **second** time a rule needs changing in several places is a good moment to extract it. This idea has a sibling called YAGNI, which is coming up later in the module.`,
      note: 'Experts argue about how early to do this. A common compromise: notice on the first change, fence on the second.' },

    { kind: 'tip', title: 'Smells that something varies',
      body: `Look for:

        - The **same if or switch** on a type (\`customer.type\`, \`provider\`) in several files.
        - Comments such as "also update the invoice code when changing this".
        - Pull requests where a tiny business change touches many files.
        - A feature that needs "remember to edit these four places".

        Each one is a little flag saying: *here is a varying part that has not been given a home.*` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What is "shotgun surgery"?',
      options: ['One small business change forcing edits in many places', 'Removing a large class by deleting all its methods at once', 'Fixing a bug without writing a test first', 'Rewriting a module from scratch in one go'],
      answer: 0,
      why: [null, 'That is more like a purge. Shotgun surgery is about spread, not size.', 'Skipping a test is a separate habit.', 'A rewrite is deliberate. Shotgun surgery is unplanned spread.'],
      explain: 'The name is a picture: one small change sprays holes across the codebase. It tells you the varying part was never gathered into one place.' },

    { type: 'bucket', after: 5, prompt: 'Does this probably vary (fence it off), or is it stable (leave it)?', buckets: ['Likely to vary', 'Stable'],
      items: [['Which payment company is used', 0], ['Discount rules for each customer type', 0], ['VAT rate for the next tax year', 0], ['The fact an order has a total', 1], ['Adding two numbers together', 1], ['Which email provider sends receipts', 0]],
      explain: 'Providers, promotions and tax rules are set by the outside world and change often. The basic shape of an order and arithmetic do not.' },

    { type: 'spot', prompt: 'This code has the same decision repeated. Tap a line where a changing rule has leaked in.',
      code: { lang: 'js', src: `
        function shippingCost(order) {
          if (order.country === 'UK') return 3.99;
          return 12.50;
        }

        function deliveryLabel(order) {
          if (order.country === 'UK') return '2-3 days';
          return '7-10 days';
        }` },
      lines: [2, 7],
      explain: 'The question "is this domestic?" is answered separately in two places. When the business adds the EU as a zone, both must change. One function deciding the delivery zone would fix it.' },

    { type: 'ab', q: 'Which checkout copes better when you add a second payment provider?',
      a: { lang: 'js', label: 'Direct', src: `
        function pay(order) {
          const res = stripe.charges.create({
            amount: order.total,
            source: order.card
          });
          return res.id;
        }` },
      b: { lang: 'js', label: 'Behind a door', src: `
        function pay(order, gateway) {
          const id = gateway.charge(order.total, order.card);
          return id;
        }` },
      answer: 'b',
      explain: 'The checkout only knows "charge this amount". Which provider does it, and how its library is called, is hidden behind the gateway, so a second provider is one new gateway.' },

    { type: 'cloze', text: 'When one small change forces edits in many files, that is called {{shotgun}} surgery. The cure is to gather the part that {{varies}} behind one stable interface.',
      distractors: ['stable', 'refactor', 'abstract'],
      explain: 'Fencing off the changing part gives it one home, so a business change becomes a one-place edit.' },

    { type: 'order', prompt: 'Put the steps for fencing off a changing rule in order.',
      items: ['Notice a rule has changed several times', 'Name the idea (for example "discount policy")', 'Decide the one question callers need to ask', 'Move the rule behind that question', 'Replace every copy with a call'],
      explain: 'You must see and name the thing before designing its front door, and you must have the door before you can swap the copies for calls.' },

    { type: 'tf', statement: 'You should wrap every constant and condition in its own class, in case it needs to change one day.', answer: false,
      explain: 'Fence off what has really varied or is known to vary. Wrapping everything creates a maze of tiny boxes and rarely pays off.' },

    { type: 'scenario', title: 'The new carrier', meters: { risk: 60, speed: 50 },
      intro: 'Your shop calculates delivery prices with a function copied into four places. The business signs a new courier with different rates and a free-delivery threshold.',
      steps: [
        { text: 'Where do you make the change?',
          choices: [
            { label: 'Edit the four copies one by one', score: 0, effects: { risk: 20, speed: -10 }, feedback: 'You will miss one eventually, and the next carrier means four edits again.' },
            { label: 'Gather the rates behind one deliveryCost(order) function, then change it once', score: 2, effects: { risk: -25, speed: 10 }, feedback: 'This turns shotgun surgery into a one-place change, and the next carrier is easy too.' },
            { label: 'Add a comment above each copy saying "keep in sync"', score: 1, effects: { risk: 10 }, feedback: 'Better than nothing, but comments do not stop drift. The structure should stop it.' }
          ] },
        { text: 'A colleague wants to also make the shop name, the currency symbol and every email greeting configurable behind interfaces, "while we are here". What do you say?',
          choices: [
            { label: 'Yes, anything could change one day', score: 0, effects: { speed: -25, risk: 10 }, feedback: 'A pile of speculative boxes slows everyone. None of those have actually varied.' },
            { label: 'Not now. Fence what has varied; revisit those when they do', score: 2, effects: { speed: 10, risk: -5 }, feedback: 'You cover the real risk without building a maze of guesses.' },
            { label: 'Put them in one giant settings object', score: 1, effects: { speed: -5 }, feedback: 'Cheaper, but a catch-all rarely fits the things that later change differently.' }
          ] }
      ],
      outro: 'Gather what really varies. Leave the rest alone.' }
  ],

  flashcards: [
    { q: 'What does "encapsulate what varies" mean?', a: 'Find the part of the code likely to change and isolate it behind a stable interface, so the rest of the code is unaffected when it changes.' },
    { q: 'What is shotgun surgery?', a: 'A code smell where one small change requires edits in many different places.' },
    { q: 'Name two classic examples of things that vary.', a: 'Pricing and discount rules, and payment providers (also tax rates and shipping carriers).' },
    { q: 'When should you extract something that varies?', a: 'When it has really changed or is known to change. A common compromise is the second time it needs changing.' },
    { q: 'What does a stable interface give you?', a: 'The ability to replace what is behind it without touching the code that calls it.' }
  ],

  glossary: [
    { term: 'Shotgun surgery', def: 'A code smell where one small business change forces edits in many scattered places.', like: 'Changing a light bulb that needs you to rewire four rooms.' },
    { term: 'Stable interface', def: 'A small, steady contract that callers rely on while the implementation behind it is free to change.', like: 'The shape of a wall socket.', aka: ['front door'] },
    { term: 'Varying part', def: 'The piece of a system that changes often, such as pricing rules or a provider choice.', like: 'The chalkboard on a restaurant wall.' }
  ],

  takeaways: [
    'Find what changes often and give it exactly one home.',
    'Callers ask a stable question; the how sits behind it.',
    'Many files for one tiny change means shotgun surgery.',
    'Fence off what has really varied, not every line.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-abstractions', {
  eli5: 'Write your code to depend on a plain description of what it needs, like a wall socket, rather than one particular appliance, so you can swap the real thing for a stand-in or a better one.',

  cards: [
    { kind: 'concept', title: 'The test that needs a whole database',
      body: `Your \`OrderService\` saves orders. Inside it, one line says \`new PostgresDatabase()\`.

        Now you want to test it. Every test needs a real Postgres server running, loaded with data, and each test takes a second. A colleague wants to move to a different database next year. You wince.

        The trouble is that the service knows **how** orders are stored, when all it really cares about is **that** they are. The fix is a design habit: **program to an interface, not an implementation.** Depend on *what* you need, not on *how* it is done.` },

    { kind: 'code', title: 'Before: welded to one thing',
      body: 'Tap the highlighted lines to see the weld.',
      code: { lang: 'js', src: `
        import { PostgresDatabase } from './postgres.js';

        class OrderService {
          constructor() {
            this.db = new PostgresDatabase('prod-host');
          }

          place(order) {
            this.db.query('INSERT INTO orders ...', [order.id]);
            return order.id;
          }
        }`,
        notes: {
          1: 'The service imports a **specific** database library.',
          5: 'It **creates** the real database itself. There is no way to give it anything else.',
          9: 'It also knows the database speaks SQL and what table to use. All "how" detail.'
        } } },

    { kind: 'metaphor', title: 'The wall socket',
      body: `A lamp does not care whether the electricity comes from a wind farm or a gas plant. It cares about one thing: **a socket of the right shape**.

        The socket is a **contract**. Behind the wall, anything that honours it can supply the power. In front, anything with the right plug can use it.

        Programming against an abstraction means making your code a lamp. It asks for "something that fits this socket", never for "this exact power station".`,
      note: 'Where the metaphor stops: a real socket has a physical shape. In code the shape is just a list of method names and what they promise.' },

    { kind: 'concept', title: 'Interfaces are seams',
      body: `An **interface** is a short list of what something can do, without saying how: *"I can save an order and find one by id."*

        When code depends on that list instead of a specific class, you get a **seam**: a place where you can swap one implementation for another **without editing the code around it**.

        Seams are what let you replace a real database with a fast fake in tests, or Postgres with another database later. (A reminder: an interface was introduced in the object-oriented module. JavaScript has no \`interface\` keyword, so the contract is agreed by shape, and TypeScript lets you write it down.)` },

    { kind: 'code', title: 'After: depend on the socket',
      body: 'The contract is written once. The service only knows the contract.',
      code: { lang: 'ts', src: `
        interface OrderStore {
          save(order: Order): void;
          find(id: string): Order | undefined;
        }

        class OrderService {
          constructor(private store: OrderStore) {}

          place(order: Order) {
            this.store.save(order);
            return order.id;
          }
        }`,
        notes: {
          1: 'The **socket**: what any store must be able to do, nothing about how.',
          7: 'The service is **given** a store. It does not build one.',
          10: 'It says "save this". It no longer knows SQL, tables or hosts.'
        } } },

    { kind: 'code', title: 'Swapping the real thing for a fake',
      body: 'Two implementations of the same socket. Production gets one, tests get the other.',
      code: { lang: 'ts', src: `
        class PostgresOrderStore implements OrderStore {
          save(order: Order) { /* INSERT INTO orders ... */ }
          find(id: string) { /* SELECT ... */ return undefined; }
        }

        class InMemoryOrderStore implements OrderStore {
          private orders = new Map<string, Order>();
          save(order: Order) { this.orders.set(order.id, order); }
          find(id: string) { return this.orders.get(id); }
        }

        const service = new OrderService(new InMemoryOrderStore());
        service.place({ id: 'A1' });   // no server, instant`,
        notes: {
          6: 'A **fake**: a tiny honest stand-in that remembers things in a map.',
          13: 'The same service code, now running with no database at all.'
        } } },

    { kind: 'diagram', title: 'The seam in the middle',
      body: 'The service points at the contract. Any number of implementations can sit behind it.',
      nodes: [
        { id: 'svc', label: 'OrderService', x: 1, y: 0, tone: 'accent' },
        { id: 'iface', label: 'OrderStore (interface)', x: 1, y: 1, tone: 'good' },
        { id: 'pg', label: 'PostgresOrderStore', x: 0, y: 2 },
        { id: 'mem', label: 'InMemoryOrderStore', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'svc', to: 'iface', label: 'depends on' },
        { from: 'pg', to: 'iface', label: 'implements', dashed: true },
        { from: 'mem', to: 'iface', dashed: true }
      ],
      caption: 'The service never mentions Postgres.' },

    { kind: 'pitfall', title: 'The interface for everything',
      body: `Abstractions cost something: one more file, one more hop when you read the code.

        An interface with exactly one implementation that will never change, such as \`IUserServiceImpl\` wrapping \`UserService\`, is **noise**. Wrapping every class "for flexibility" gives you twice the files and no flexibility you ever use.

        A good test: is there a **second implementation** (a fake counts), a real chance one will appear, or something slow and unpredictable behind it? If not, wait. You can always add the interface later, when you meet the second case.`,
      note: 'This is debated. Some teams add interfaces everywhere by habit; others only at boundaries. The boundary approach is the one this course recommends.' },

    { kind: 'tip', title: 'Put seams at the edges',
      body: `Good places for an abstraction are the **edges** where your code touches something slow, outside your control or likely to change:

        - Databases and file storage
        - Email, SMS and payment services
        - The system clock (so tests can say "pretend it is Christmas")
        - Anything over the network

        Your core business rules in the middle usually do not need one. They are the part you want to be able to test **without** any of those edges.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'What does a "seam" let you do?',
      options: ['Swap in another implementation without editing callers', 'Split one big file into several smaller, tidier files', 'Make a method faster by caching what it returns', 'Hide private fields from code in other classes'],
      answer: 0,
      why: [null, 'Splitting files is a tidy-up. A seam is about substitution.', 'Caching is an unrelated optimisation.', 'That is encapsulation, covered earlier.'],
      explain: 'A seam is a join in the code where something can be replaced from outside. Depending on an interface creates one, which is why a fake database can stand in for the real one.' },

    { type: 'spot', after: 1, prompt: 'Which line makes this class impossible to test without a real mail server?',
      code: { lang: 'js', src: `
        class Welcome {
          constructor() {
            this.mailer = new SmtpMailer('smtp.company.com');
          }
          greet(user) {
            this.mailer.send(user.email, 'Welcome!');
          }
        }` },
      lines: [3],
      explain: 'The class builds a specific mailer itself, so there is nowhere to plug in a stand-in. If the mailer arrived as a constructor argument, a tests-only fake would do.' },

    { type: 'tf', statement: 'Every class in an application should have its own interface, so everything is swappable.', answer: false,
      explain: 'Interfaces cost files and indirection. They pay off at boundaries and where a second implementation exists or is likely. Otherwise they are noise.' },

    { type: 'ab', q: 'Which version is easier to test and to move to another payment company?',
      a: { lang: 'js', label: 'Concrete', src: `
        class Checkout {
          pay(total) {
            return new StripeClient().charge(total);
          }
        }` },
      b: { lang: 'js', label: 'Abstract', src: `
        class Checkout {
          constructor(gateway) { this.gateway = gateway; }
          pay(total) {
            return this.gateway.charge(total);
          }
        }` },
      answer: 'b',
      explain: 'Taking a gateway in means tests can pass a fake and a new provider is one new class. Building a specific client inside welds the checkout to one company.' },

    { type: 'cloze', code: true, text: 'interface {{OrderStore}} {\n  save(order: Order): void;\n}\n\nclass OrderService {\n  constructor(private store: OrderStore) {}\n}\n// the service depends on the {{interface}}, not a database',
      distractors: ['PostgresOrderStore', 'class', 'implementation'],
      explain: 'The service names the contract in its constructor. Naming `PostgresOrderStore` there would bring the weld back.' },

    { type: 'bucket', prompt: 'Is this a good place for an abstraction, or probably not worth one?', buckets: ['Worth an interface', 'Probably not'],
      items: [['Sending email through a provider', 0], ['Saving data to a database', 0], ['Reading the current time', 0], ['Adding two prices together', 1], ['A one-off private helper used in one place', 1], ['Calling a third-party payment API', 0]],
      explain: 'Slow, external or changeable things deserve a seam and a fake. Simple internal logic is best left plain.' },

    { type: 'multi', q: 'Which are real benefits of programming against an interface?',
      options: ['Tests can use a fast fake instead of a real database', 'You can change the implementation without editing callers', 'The code is automatically faster', 'Different teams can work on each side of the contract', 'You no longer need to write tests'],
      answers: [0, 1, 3],
      explain: 'Seams give you fakes, replaceable parts and a contract two teams can build against. They do not speed code up or replace testing.' },

    { type: 'scenario', title: 'The pull request with 14 interfaces', meters: { clarity: 50, flexibility: 40 },
      intro: 'A new colleague has opened a pull request for a small internal tool. Every class has an interface with one implementation. There is also a database and an email provider, both used directly.',
      steps: [
        { text: 'What feedback do you give?',
          choices: [
            { label: 'Keep interfaces for the database and the email provider; remove the rest', score: 2, effects: { clarity: 25, flexibility: 20 }, feedback: 'Those two are real boundaries where a fake or a swap is likely. The other interfaces were pure noise.' },
            { label: 'Approve it. More abstraction is always safer', score: 0, effects: { clarity: -20 }, feedback: 'You have doubled the files, and the two seams that matter are still missing from the code.' },
            { label: 'Ask them to remove every interface, including the database and email ones', score: 1, effects: { clarity: 10, flexibility: -15 }, feedback: 'Cleaner, but tests will now need a real database and mail server.' }
          ] },
        { text: 'Six months later the company switches email providers. How does the change go?',
          choices: [
            { label: 'Write one new class behind the mailer interface and swap it in', score: 2, effects: { flexibility: 25 }, feedback: 'The seam paid off exactly where you put it.' },
            { label: 'Search the codebase for the old provider’s name and edit each use', score: 0, effects: { flexibility: -20, clarity: -10 }, feedback: 'That is what happens when the seam is missing: a little shotgun surgery.' }
          ] }
      ],
      outro: 'Put seams where they earn their keep.' },

    { type: 'explain', prompt: 'Why does making OrderService depend on an OrderStore interface make testing easier?',
      model: 'The service only knows the contract (save, find), not Postgres. In tests you give it an in-memory fake that implements the same interface, so no database is needed and tests are fast. In production you give it the real store. The interface is a seam where the implementation can be swapped without editing the service.',
      keywords: ['interface', 'fake', 'seam', 'swap', 'contract', 'database'] }
  ],

  flashcards: [
    { q: 'What does "program to an interface, not an implementation" mean?', a: 'Make your code depend on a description of what it needs (a contract), not on one particular class that does it.' },
    { q: 'What is a seam?', a: 'A place in the code where one implementation can be swapped for another without editing the code around it.' },
    { q: 'What is a fake in testing?', a: 'A simple working stand-in for a real dependency, such as an in-memory map instead of a database.' },
    { q: 'When is an interface not worth adding?', a: 'When there is only one implementation, no fake is needed and no change is likely. It just adds indirection.' },
    { q: 'Where do seams usually belong?', a: 'At the edges: databases, email, payments, the clock and other things slow, external or likely to change.' }
  ],

  glossary: [
    { term: 'Abstraction', def: 'A simplified description of what something does, leaving out how it does it.', like: 'A wall socket: you know the shape, not the power station.' },
    { term: 'Seam', def: 'A point where behaviour can be replaced without editing the surrounding code.', like: 'A join in a pipe where you can fit a different section.' },
    { term: 'Fake', def: 'A lightweight, working stand-in for a real dependency, used in tests.', like: 'A stunt double who does the scene without the danger.', aka: ['test double'] },
    { term: 'Over-abstraction', def: 'Adding interfaces and layers that bring indirection but no real flexibility.', like: 'A flight of stairs with a lift next to it that goes up one step.' }
  ],

  takeaways: [
    'Depend on what you need, not on how it is done.',
    'An interface creates a seam: swap real for fake or old for new.',
    'Put seams at the edges: database, email, payments, clock.',
    'Skip interfaces with one implementation and no reason to change.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-hollywood', {
  eli5: 'Instead of your code running the show and calling everything it needs, you hand your code to a framework and it calls you at the right moment, like "don’t call us, we’ll call you" after an audition.',

  cards: [
    { kind: 'concept', title: '“Don’t call us, we’ll call you”',
      body: `After an audition, the casting director says the famous line: *don't call us, we'll call you.* You do not phone every day. You get on with your life, and they ring when there is a part for you.

        The **Hollywood Principle** applies that to code. In ordinary programs, **your code is in charge**: it decides when to call each helper. In many real systems the order is reversed: a **framework** is in charge, and it calls **your** code when something happens.

        This reversal of who is in control is called **inversion of control** (IoC).` },

    { kind: 'metaphor', title: 'The restaurant and the pager',
      body: `At a busy counter you could stand at the kitchen hatch asking "is it ready yet?" every ten seconds. That is **you calling them**.

        Or you take a **pager** and sit down. The kitchen buzzes you when your food is ready. That is **them calling you**.

        The pager is a promise: *give us your number and we will contact you at the right moment.* In code, that number is a **function** you hand over, and the kitchen is the framework.` },

    { kind: 'compare', title: 'Library versus framework',
      body: 'A simple way to tell the two apart is to ask who is driving.',
      cols: ['Library', 'Framework'],
      rows: [
        ['Who is in charge?', 'Your code', 'The framework'],
        ['Who calls whom?', 'You call it', 'It calls you'],
        ['Feels like', 'Picking tools off a shelf', 'Filling in the blanks of a template'],
        ['Example', 'A date-formatting helper', 'A web framework that runs your route handlers'],
        ['Your freedom', 'High, you decide the flow', 'Lower, you follow its lifecycle']
      ],
      note: 'The line is blurry in practice, and people argue over which things are which. The "who calls whom" question is still the useful one.' },

    { kind: 'code', title: 'You register, it calls',
      body: 'A tiny web framework. Notice that you never call your own handler.',
      code: { lang: 'js', src: `
        // The framework's side
        const routes = {};
        function on(path, handler) { routes[path] = handler; }
        function startServer(requests) {
          for (const req of requests) {
            routes[req.path](req);        // the framework calls you
          }
        }

        // Your side
        on('/hello', (req) => console.log('Hi ' + req.user));
        on('/bye', (req) => console.log('Bye ' + req.user));
        startServer([{ path: '/hello', user: 'Sam' }]);`,
        notes: {
          3: 'You hand over a **callback**: a function to be called later.',
          6: 'The framework owns the loop and decides when to run your code.',
          11: 'Your code only says *what* should happen, never *when*.'
        } } },

    { kind: 'sequence', title: 'Who calls whom, over time',
      body: 'Step through a request.',
      actors: ['Your code', 'Framework'],
      steps: [
        { from: 0, to: 1, label: 'on("/hello", handler)', note: 'At start-up you register your handler. That is the last time you call.' },
        { from: 0, to: 1, label: 'startServer()', note: 'You hand control over and step back.' },
        { at: 1, label: 'waits for a request', note: 'The framework owns the waiting.' },
        { at: 1, label: 'request arrives', note: 'Something happens in the world.' },
        { from: 1, to: 0, label: 'handler(req)', note: '**The inversion.** The framework calls into your code.' },
        { from: 0, to: 1, label: 'returns a result', dashed: true, note: 'You do your small job and give control back.' }
      ] },

    { kind: 'concept', title: 'Callbacks, hooks and events',
      body: `Inversion of control shows up in three everyday shapes:

        - **Callbacks**: you pass a function, and it runs later (\`setTimeout\`, array \`map\`).
        - **Hooks**: a framework with named moments, such as "before save" or "on start", where you can plug in code.
        - **Events**: something announces "an order was placed", and anyone who has said they are interested gets called.

        All three have the same flavour: **you describe what to do when X happens**, and someone else decides when X happens.` },

    { kind: 'code', title: 'Dependency injection',
      body: 'Another form of the same idea: who creates the things your class depends on?',
      code: { lang: 'js', src: `
        // Before: the class builds its own helper
        class Welcome {
          constructor() { this.mailer = new SmtpMailer(); }
        }

        // After: somebody else hands it in
        class Welcome {
          constructor(mailer) { this.mailer = mailer; }
        }

        const app = new Welcome(new SmtpMailer());`,
        notes: {
          3: 'The class takes control of creating its helper.',
          8: 'Control is **inverted**: the outside world decides which mailer to give it.',
          11: 'This hand-over is **dependency injection**. It is done here by hand, with no tool.'
        } },
      note: 'An **IoC container** (Spring in Java and ASP.NET Core in C# are well-known examples) is a tool that does this wiring for you: you declare what each class needs and it builds and hands in everything.' },

    { kind: 'pitfall', title: 'The price of being called',
      body: `Inversion of control makes code flexible and testable, and it also makes it **harder to follow**. Nobody reads a straight line from start to finish any more: a handler appears to run "by magic" and the stack trace begins somewhere inside the framework.

        Containers add to that: wiring can fail only when the app starts, and the code never says where an object came from.

        You do not need a container for a small app. Passing arguments to constructors by hand is plain, honest dependency injection.`,
      note: 'Developers disagree about how much container "magic" is worth it. Start with manual wiring and add a container if the wiring becomes painful.' }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What best separates a framework from a library?',
      options: ['A framework calls your code; you call a library', 'A framework has more features and code than a library', 'A library only works in one programming language', 'A framework is a paid product, a library is free'],
      answer: 0,
      why: [null, 'Size can differ but it is not the defining difference.', 'Both work in a given language, so this does not separate them.', 'Many frameworks are free, and some libraries are paid for.'],
      explain: 'The test is who drives. With a library you call it when you want. With a framework you register code and it calls you at the moment it chooses.' },

    { type: 'tf', after: 4, statement: 'With inversion of control, the framework decides when your code runs.', answer: true,
      explain: 'You hand over a function or an object, and the framework runs it when the relevant event happens. You give up the timing in return for not writing the loop.' },

    { type: 'bucket', prompt: 'Who makes the call: you, or the framework?', buckets: ['You call it', 'It calls you'],
      items: [['Using a function to format a date', 0], ['A route handler running when a request arrives', 1], ['A button click listener firing', 1], ['Calling Math.max on two numbers', 0], ['A "before save" hook running', 1], ['Reading a file with a helper library', 0]],
      explain: 'Listeners, handlers and hooks are registered once and called later by someone else. Helper functions are called when you decide.' },

    { type: 'cloze', code: true, text: 'on(\'/orders\', {{handler}});\n// we gave the framework a {{callback}}\n// "Don\'t call us, we\'ll {{call}} you"',
      distractors: ['loop', 'library', 'import'],
      explain: 'A callback is a function you pass in so that something else can call it back later.' },

    { type: 'ab', q: 'Which version applies dependency injection?',
      a: { lang: 'js', label: 'Hands it in', src: `
        class Reports {
          constructor(clock) { this.clock = clock; }
          today() { return this.clock.now(); }
        }` },
      b: { lang: 'js', label: 'Builds its own', src: `
        class Reports {
          constructor() { this.clock = new SystemClock(); }
          today() { return this.clock.now(); }
        }` },
      answer: 'a',
      explain: 'The hands-it-in class gets its clock from outside, so a test can supply a fixed one. The builds-its-own class creates its clock itself, which is the opposite of injection.' },

    { type: 'spot', prompt: 'Tap the line where this class grabs control of its own dependency.',
      code: { lang: 'js', src: `
        class InvoiceSender {
          constructor() {
            this.pdf = new PdfMaker();
            this.mail = new SmtpMailer();
          }
          send(invoice) {
            this.mail.send(this.pdf.make(invoice));
          }
        }` },
      lines: [3, 4],
      explain: 'Both constructor lines build concrete helpers inside the class. Taking them as constructor arguments hands control to the outside and makes swapping easy.' },

    { type: 'match', prompt: 'Match each idea with the best description.',
      pairs: [['Callback', 'A function you hand over to be called later'], ['Hook', 'A named moment in a framework where you can plug in code'], ['Event', 'An announcement that interested listeners respond to'], ['Dependency injection', 'Giving a class its helpers from outside'], ['IoC container', 'A tool that builds objects and wires their dependencies']],
      explain: 'Each is a different way of letting someone else control timing or creation. All share the same direction: control flows from outside in.' },

    { type: 'scenario', title: 'The mystery handler', meters: { understanding: 40, maintainability: 50 },
      intro: 'You join a team using a web framework and a dependency container. A bug report says a discount is applied twice. You cannot find where the code that applies it is called.',
      steps: [
        { text: 'You search for a call to applyDiscount() and find none. What do you suspect?',
          choices: [
            { label: 'It is registered as a handler or hook, so the framework is calling it', score: 2, effects: { understanding: 30 }, feedback: 'Right. Search for where it is registered rather than where it is called, and check whether it is registered twice.' },
            { label: 'The code must be dead and can be deleted', score: 0, effects: { understanding: -15, maintainability: -20 }, feedback: 'Under inversion of control, code often has no direct caller. Deleting it could break the whole feature.' },
            { label: 'The framework has a bug', score: 1, effects: { understanding: -5 }, feedback: 'Possible but unlikely. Check your own registrations first.' }
          ] },
        { text: 'You find the handler registered both in config and by a decorator. What is the lesson?',
          choices: [
            { label: 'Inversion of control makes flow harder to trace, so keep registrations obvious and in one place', score: 2, effects: { maintainability: 25 }, feedback: 'The power comes with a cost: be disciplined about where wiring lives.' },
            { label: 'Abandon frameworks and call everything directly', score: 0, effects: { maintainability: -10 }, feedback: 'You would give up the benefits wholesale. The fix is tidy wiring.' },
            { label: 'Add a second discount check as a guard', score: 1, effects: { maintainability: -5 }, feedback: 'Hides the symptom while the double registration remains.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain the Hollywood Principle and how dependency injection is an example of it.',
      model: 'Don’t call us, we’ll call you: instead of your code controlling the flow, a framework calls your code (callbacks, hooks, events) when something happens. That is inversion of control. Dependency injection is one form: instead of a class creating its own helpers, something outside hands them in, so the outside decides which ones the class gets.',
      keywords: ['inversion of control', 'framework', 'callback', 'injection', 'call you'] }
  ],

  flashcards: [
    { q: 'What is the Hollywood Principle?', a: '"Don’t call us, we’ll call you": a framework calls your code at the right moment instead of your code driving everything.' },
    { q: 'What is inversion of control?', a: 'Reversing who is in charge: the framework or caller controls the flow and calls your code.' },
    { q: 'Library versus framework?', a: 'You call a library; a framework calls you.' },
    { q: 'What is dependency injection?', a: 'Giving a class the objects it depends on from outside instead of letting it create them.' },
    { q: 'What is an IoC container?', a: 'A tool that builds objects and supplies their dependencies automatically, based on declared needs.' }
  ],

  glossary: [
    { term: 'Inversion of control', def: 'A style where a framework or outside code decides when your code runs, instead of your code driving everything.', like: 'Taking a pager instead of standing at the kitchen hatch.', aka: ['IoC'] },
    { term: 'Callback', def: 'A function you pass to something else so it can be called later.', like: 'Leaving your phone number.' },
    { term: 'Hook', def: 'A named point in a framework’s life where you can plug in your own code.', like: 'A socket in a power strip.' },
    { term: 'Dependency injection', def: 'Supplying a class with the objects it needs from outside, rather than letting it create them.', like: 'Being handed tools instead of buying them yourself.', aka: ['DI'] },
    { term: 'IoC container', def: 'A tool that creates objects and wires in their dependencies for you.', like: 'A stage manager who hands each actor the right props.' }
  ],

  takeaways: [
    'Hollywood Principle: the framework calls you, you do not call it.',
    'A library is called by you; a framework calls you.',
    'Callbacks, hooks and events are everyday forms of IoC.',
    'Dependency injection is one technique; a container is optional.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-srp', {
  eli5: 'The Single Responsibility Principle says each class should do one job for one group of people, so a change made for one group cannot quietly break things for another.',

  cards: [
    { kind: 'concept', title: 'One class, one reason to change',
      body: `The **S** in SOLID is the **Single Responsibility Principle** (SRP). It is usually summarised as "a class should do one thing", which sounds simple and turns out to be useless. What counts as *one thing*?

        The sharper version comes from Robert C. Martin:

        > A class should have only **one reason to change**.

        And a "reason to change" is really a **person**: some group of people who might come to you and ask for it to work differently. He calls that group an **actor**.

        So the real rule is: **each class should answer to one actor.**` },

    { kind: 'metaphor', title: 'The café worker who does everything',
      body: `Imagine a small café where **one person** takes the orders, cooks the food *and* does the accounts.

        It works, until the accountant changes how VAT must be recorded. Now the person who also makes your flat white is being retrained mid-shift, and the queue is out of the door. When they are off sick, the café cannot serve, cook *or* pay its suppliers.

        Split the jobs between a barista, a cook and a bookkeeper, and a change to the bookkeeping never touches the coffee.

        A class with several responsibilities is that overworked employee. Every request, from anyone, lands on the same desk.` },

    { kind: 'code', title: 'A class with three bosses',
      body: 'This class looks tidy. Tap the highlighted lines to see who each method really works for.',
      code: { lang: 'js', src: `
        class Employee {
          constructor(name, hours, rate) {
            this.name = name; this.hours = hours; this.rate = rate;
          }

          calculatePay() {
            return this.regularHours() * this.rate;
          }

          reportHours() {
            return this.name + ': ' + this.regularHours() + 'h';
          }

          regularHours() {
            return Math.min(this.hours, 40);
          }

          save(db) {
            db.query('INSERT INTO employees VALUES (?, ?, ?)',
              [this.name, this.hours, this.rate]);
          }
        }`,
        notes: {
          6: 'Pay rules belong to **Finance**. They decide what counts as payable time.',
          10: 'The hours report belongs to **HR**. They decide what the report shows.',
          14: 'A helper **shared by both**. This is the trap: Finance and HR now depend on the same few lines without knowing it.',
          18: 'How it is stored belongs to the **database team**. Three actors, one class.'
        } } },

    { kind: 'story', title: 'The bug nobody asked for',
      body: `Finance sends a request: *"Overtime should count towards pay, so stop capping hours at 40."*

        A developer opens \`Employee\`, finds \`regularHours()\`, removes the cap, runs the pay tests. Green. Ship it.

        Nobody notices that \`reportHours()\` calls the same helper. HR's weekly report has silently changed. Months later someone spots that staffing plans were built on the wrong numbers.

        Nobody at HR asked for a change. Nobody at HR was told. The two teams were **accidentally coupled** by sharing a class. That is precisely the kind of bug SRP exists to prevent.` },

    { kind: 'steps', title: 'Splitting it up, step by step',
      body: 'Refactoring towards SRP follows the same recipe almost every time.',
      steps: [
        { title: 'List the actors', body: 'Ask "who would ask me to change this?" Here: Finance, HR and the database team.' },
        { title: 'Sort the methods by actor', body: '`calculatePay` → Finance. `reportHours` → HR. `save` → database team. `regularHours` is used by two actors, so it is the danger zone.' },
        { title: 'Extract one class per actor', body: 'Create `PayCalculator`, `HoursReporter` and `EmployeeRepository`. Each gets **its own copy** of any rule it relies on, so Finance and HR can now diverge safely.' },
        { title: 'Leave plain data behind', body: '`Employee` becomes a simple holder of name, hours and rate. It has no behaviour for anyone to fight over.' },
        { title: 'Run the tests', body: 'Refactoring changes structure, not behaviour. The same tests should still pass.' }
      ] },

    { kind: 'code', title: 'After: one actor per class',
      body: 'More classes, but each one has a single owner and a single reason to change.',
      code: { lang: 'js', src: `
        class Employee {              // plain data, no behaviour
          constructor(name, hours, rate) {
            this.name = name; this.hours = hours; this.rate = rate;
          }
        }

        class PayCalculator {         // Finance owns this
          payFor(employee) {
            return employee.hours * employee.rate;
          }
        }

        class HoursReporter {         // HR owns this
          lineFor(employee) {
            const capped = Math.min(employee.hours, 40);
            return employee.name + ': ' + capped + 'h';
          }
        }

        class EmployeeRepository {    // the database team owns this
          save(employee, db) { /* SQL lives here, and only here */ }
        }`,
        notes: {
          9: 'Finance changed their rule. Nothing else in the codebase moved.',
          15: 'HR still caps at 40. Their rule now lives with them, not in a shared helper.'
        } } },

    { kind: 'diagram', title: 'Who depends on what',
      body: 'After the split, each actor reaches exactly one class. A request from Finance can only ever touch `PayCalculator`.',
      nodes: [
        { id: 'fin', label: 'Finance', icon: '💷', x: 0, y: 0, tone: 'warn' },
        { id: 'hr', label: 'HR', icon: '🧑‍💼', x: 1, y: 0, tone: 'warn' },
        { id: 'dba', label: 'Database team', icon: '🗄️', x: 2, y: 0, tone: 'warn' },
        { id: 'pay', label: 'PayCalculator', x: 0, y: 1, tone: 'accent' },
        { id: 'rep', label: 'HoursReporter', x: 1, y: 1, tone: 'accent' },
        { id: 'repo', label: 'EmployeeRepository', x: 2, y: 1, tone: 'accent' },
        { id: 'emp', label: 'Employee (data)', x: 1, y: 2 }
      ],
      edges: [
        { from: 'fin', to: 'pay', label: 'asks for changes' }, { from: 'hr', to: 'rep' }, { from: 'dba', to: 'repo' },
        { from: 'pay', to: 'emp', dashed: true }, { from: 'rep', to: 'emp', dashed: true }, { from: 'repo', to: 'emp', dashed: true }
      ],
      caption: 'Solid arrows: who requests changes. Dashed arrows: who reads the data.' },

    { kind: 'pitfall', title: 'Do not shred everything',
      body: `SRP does **not** mean "one method per class". Take it too far and you get forty tiny classes, each three lines long, and you need a map to follow a single feature.

        The balancing rule is: **things that change together belong together.** Things that change for different people should be apart.

        If one actor owns ten closely related methods, a single class holding all ten is perfectly fine. That is high **cohesion**, and it is a good thing.` },

    { kind: 'tip', title: 'How to smell a violation',
      body: `You rarely need to count responsibilities. Look for these signs instead:

        - The name is vague: \`Manager\`, \`Helper\`, \`Utils\`, \`Processor\`.
        - Describing what it does needs the word **"and"**.
        - Its imports are a strange mix: SQL *and* HTML *and* email.
        - Different teams keep getting merge conflicts in the same file.
        - A small change in one feature breaks a test for an unrelated one.

        A class that has grown to do nearly everything has a name: a **god class**.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'In the Single Responsibility Principle, what is a "responsibility" really tied to?',
      options: ['A group of people (an actor) who would ask for the code to change', 'A single public method on the class, however long it is', 'A single line of business logic somewhere inside it', 'A single database table that the class reads or writes'],
      answer: 0,
      why: [null, 'A class with one actor can happily have many methods.', 'SRP is about who owns the code, not how small it is.', 'A table is storage. One actor might use several tables.'],
      explain: 'A responsibility is a **reason to change**, and reasons to change come from people. If only one actor would ever ask for a class to change, it has one responsibility, however many methods it has.' },

    { type: 'tf', after: 3, statement: 'If two unrelated teams regularly ask for changes to the same class, that class probably violates SRP.', answer: true,
      explain: 'Two teams means two actors and two reasons to change. Sooner or later a change for one will break something for the other, usually through code they did not realise they shared.' },

    { type: 'bucket', after: 4, prompt: 'A change request arrives. Which actor does it come from?', buckets: ['Finance', 'HR', 'Database team'],
      items: [['Overtime should be paid at 1.5×', 0], ['Show hours as a weekly chart', 1], ['Move employees to a new table', 2], ['Round pay to the nearest penny', 0], ['Include holiday days in the hours report', 1], ['Add an index to speed up lookups', 2]],
      explain: 'Being able to name the actor behind a change is the core skill. Once you can, you know which class the change belongs in.' },

    { type: 'spot', prompt: 'This service has quietly taken on a second job. Tap a line where it starts.',
      code: { lang: 'js', src: `
        class OrderService {
          placeOrder(cart, customer) {
            const total = cart.items.reduce((sum, i) => sum + i.price, 0);
            const order = { customer: customer.id, total: total };
            this.db.insert('orders', order);
            const html = '<h1>Thanks ' + customer.name + '</h1>';
            this.smtp.send(customer.email, 'Your order', html);
            return order;
          }
        }` },
      lines: [6, 7],
      explain: 'Lines 6 and 7 build and send an email. Placing an order is one job (owned by sales); the wording and delivery of emails is another (owned by marketing). A change to the email template should not mean editing, re-testing and redeploying the order code.' },

    { type: 'ab', q: 'Which design follows the Single Responsibility Principle more closely?',
      a: { lang: 'js', label: 'One class', src: `
        class Report {
          calculate(sales) { /* totals */ }
          formatAsHtml()   { /* markup */ }
          emailTo(address) { /* SMTP */ }
        }` },
      b: { lang: 'js', label: 'Three classes', src: `
        class ReportCalculator {
          calculate(sales) { /* totals */ }
        }
        class HtmlReportFormatter {
          format(report) { /* markup */ }
        }
        class ReportMailer {
          send(html, address) { /* SMTP */ }
        }` },
      answer: 'b',
      explain: 'The numbers (finance), the layout (design) and the delivery (operations) change for different people at different times. Separate classes mean a new email provider cannot break the sums.' },

    { type: 'multi', q: 'Which of these are warning signs that a class has too many responsibilities?',
      options: ['Its name ends in "Manager" or "Utils" and nobody can say exactly what it does', 'It imports a SQL library, an HTML templating library and an email client', 'Different teams keep getting merge conflicts in it', 'It is under fifty lines long', 'It has a constructor'],
      answers: [0, 1, 2],
      explain: 'Vague names, a mixed bag of imports and cross-team merge conflicts all point to several actors sharing one class. Size and constructors tell you nothing on their own.' },

    { type: 'order', prompt: 'Put the SRP refactoring steps in a sensible order.',
      items: ['List who asks for changes to the class', 'Sort its methods by which actor owns them', 'Extract one class per actor', 'Leave the original as plain data', 'Run the tests to confirm nothing changed'],
      explain: 'You cannot sort methods until you know the actors, and you cannot extract classes until the methods are sorted. Tests come last because refactoring must not change behaviour.' },

    { type: 'cloze', text: 'A class should have only one {{reason}} to change, because it should answer to only one {{actor}}.',
      distractors: ['method', 'file', 'test'],
      explain: 'This is Robert C. Martin’s own wording of SRP. "Actor" is what keeps the principle from collapsing into the vague "do one thing".' },

    { type: 'explain', prompt: 'A teammate says: "SRP means every class should only do one thing." Explain what is missing from that.',
      model: '"One thing" is too vague to act on. SRP is really about people: a class should have one reason to change, meaning one actor (one group of people) who would ask for changes. If two groups share a class, a change for one can silently break the other. A class with one owner and ten related methods is fine.',
      keywords: ['reason to change', 'actor', 'people', 'break', 'cohesion'] }
  ],

  flashcards: [
    { q: 'State the Single Responsibility Principle.', a: 'A class should have only one reason to change: it should be responsible to one actor.' },
    { q: 'In SRP, what is an "actor"?', a: 'A group of people who want the same kind of changes from the software, such as Finance or HR.' },
    { q: 'What is a "god class"?', a: 'A class that has grown to know or do far too much, so almost every change touches it.' },
    { q: 'Why is a helper shared by two actors dangerous?', a: 'A change requested by one actor silently changes behaviour for the other. This is accidental coupling.' },
    { q: 'How do you avoid over-applying SRP?', a: 'Keep things that change together in the same place. Only split what changes for different people.' }
  ],

  glossary: [
    { term: 'Single Responsibility Principle', def: 'The S in SOLID: a class should have only one reason to change, because it serves only one actor.', like: 'A café where the barista, the cook and the bookkeeper are different people.', aka: ['SRP'] },
    { term: 'Actor', def: 'A group of people or stakeholders who request the same kind of changes to a piece of software.', like: 'A department that sends you change requests.' },
    { term: 'God class', def: 'A class that does or knows far too much, so nearly every change in the system touches it.', like: 'The one employee without whom the whole company stops.' },
    { term: 'Accidental coupling', def: 'When two unrelated parts of a system affect each other only because they happen to share code.', like: 'Two flats sharing one fuse: one neighbour’s kettle blacks out the other’s lights.' },
    { term: 'Cohesion', def: 'How strongly the things inside a class or module belong together. High cohesion is good.', like: 'A toolbox holding only plumbing tools, rather than a drawer of random stuff.' }
  ],

  takeaways: [
    'SRP is about **people**: one class, one actor, one reason to change.',
    'Code shared between actors is where surprise bugs come from.',
    'To fix it: list the actors, sort the methods, extract a class for each.',
    'Do not over-split. Things that change together belong together.'
  ],

  links: [
    { label: 'Robert C. Martin: The Single Responsibility Principle', url: 'https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html' },
    { label: 'roadmap.sh: SOLID', url: 'https://roadmap.sh/software-design-architecture' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-ocp', {
  eli5: 'Good code lets you add a new feature by writing new code that plugs in, rather than by cutting open old, working code and risking breaking it.',

  cards: [
    { kind: 'concept', title: 'Open for extension, closed for modification',
      body: `Your shop ships with two couriers, and one function works out the price for each. Then a third courier signs up. And a fourth. Each time, someone **opens the same function**, adds another branch and re-tests everything that was already working.

        The **Open/Closed Principle** (OCP) is the O in SOLID. It was put into words by Bertrand Meyer and popularised by Robert C. Martin:

        > Code should be **open for extension** but **closed for modification**.

        Open: you can add new behaviour. Closed: you do so **without editing** the old, tested code.` },

    { kind: 'code', title: 'Before: the function that keeps growing',
      body: 'Every new courier means editing this function. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        function shippingCost(order) {
          switch (order.carrier) {
            case 'royal':
              return 3.5 + order.weight * 1.2;
            case 'parcelx':
              return 4.0 + order.weight;
            default:
              throw new Error('Unknown carrier');
          }
        }`,
        notes: {
          2: 'Everything hangs off this switch. Every new courier **modifies** it.',
          4: 'A mistake while adding the next case could break this one, which already worked.',
          8: 'And the default branch means a typo in a carrier name is only found at runtime.'
        } } },

    { kind: 'metaphor', title: 'Apps on your phone',
      body: `When you install a new app, the phone does not need to be reopened, rebuilt and re-tested by its manufacturer. The phone has a **place where apps plug in**, and the rest of the system stays untouched.

        New behaviour arrives as **new code**. The existing system never has to be edited to welcome it.

        An open/closed design has the same shape: a stable core, and defined places where extensions plug in.`,
      note: 'Where the metaphor stops: your code still has to be designed with the plug-in point. It does not appear by magic.' },

    { kind: 'code', title: 'After: carriers plug in',
      body: 'Each courier is its own small object with the same `cost` method.',
      code: { lang: 'js', src: `
        const carriers = {
          royal:   { cost: (o) => 3.5 + o.weight * 1.2 },
          parcelx: { cost: (o) => 4.0 + o.weight }
        };

        function shippingCost(order) {
          return carriers[order.carrier].cost(order);
        }

        // New courier: add an entry. shippingCost is untouched.
        carriers.speedy = { cost: (o) => 6 + o.weight * 0.8 };`,
        notes: {
          7: 'This function is now **closed**. It works for any courier that has a `cost` method.',
          10: 'The new courier is an **extension**. Nothing that already worked was edited.'
        } },
      note: 'Each courier is an example of the **Strategy** idea: a swappable piece of behaviour behind one method. Design Patterns has a full treatment later.' },

    { kind: 'diagram', title: 'A plug-in point',
      body: 'The core is closed. New behaviour joins at the edge.',
      nodes: [
        { id: 'core', label: 'shippingCost (closed)', x: 1, y: 0, tone: 'accent' },
        { id: 'pp', label: 'cost(order) plug-in point', x: 1, y: 1, tone: 'good' },
        { id: 'r', label: 'Royal', x: 0, y: 2 },
        { id: 'p', label: 'ParcelX', x: 1, y: 2 },
        { id: 's', label: 'Speedy (new)', x: 2, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'core', to: 'pp', label: 'calls' },
        { from: 'r', to: 'pp', dashed: true }, { from: 'p', to: 'pp', dashed: true }, { from: 's', to: 'pp', dashed: true }
      ],
      caption: 'The new courier is the only thing that had to be written.' },

    { kind: 'concept', title: 'How it is done: polymorphism',
      body: `The trick underneath is **polymorphism**, from the object-oriented module: many things, one shared shape. The caller asks \`cost(order)\`, and each courier answers in its own way.

        That shared shape is the **plug-in point**. Common versions are:

        - **Strategy objects or functions** (as above)
        - **A shared interface** with several implementing classes
        - **A list of handlers** that each get a go (middleware, listeners)

        Note that "closed" is relative. You close the code against **one kind of change** (new couriers). It will still be open to other kinds of change that you did not plan for.` },

    { kind: 'tip', title: 'Do not try to predict every change',
      body: `You cannot make code closed against everything, and trying leads to plug-in points nobody ever uses.

        A practical rhythm:

        1. **First time**: write the simple version. Do not guess.
        2. **Second time** a similar change arrives: you now know the shape of the variation, so create the plug-in point.
        3. After that, new cases are extensions.

        You pay for a little editing early on, and you get plug-in points in exactly the places the business actually changes.`,
      note: 'Developers do argue about this. Some build plug-in points on the first guess; the wait-for-the-second-case approach is the more cautious one and fits YAGNI, coming later in this module.' },

    { kind: 'pitfall', title: 'Closed does not mean frozen',
      body: `OCP does **not** say you may never edit a file. Fixing a bug in \`royal\`'s price is a normal modification, and so is renaming something for clarity.

        The principle is about **adding features**. If every new feature needs you to open the same class and add a branch, that class is not closed.

        The opposite failure is also real: layers of abstract factories and plug-in registries for a feature that will only ever have one variant. That is **over-engineering**, not good design.` },

    { kind: 'realworld', title: 'You use this every day',
      body: `Look for plug-in points and you will see them everywhere.

        - **Code editors and browsers** accept extensions without anyone editing the editor or browser itself.
        - **Web frameworks** let you add middleware to a request pipeline, a list of steps that each get a turn.
        - **Payment checkouts** accept a new payment method as a new module that follows the same contract.

        In each case the core was designed once, and the world extends it without ever reopening it.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'In the Open/Closed Principle, what does "closed for modification" mean?',
      options: ['Adding a new case should not require editing existing, working code', 'Nobody may ever change a file once it has been released', 'A class must be marked final so it cannot be subclassed', 'Only senior developers may edit core classes'],
      answer: 0,
      why: [null, 'Bug fixes and refactoring are fine. The rule is about adding features.', 'OCP is about design, not language keywords.', 'It is not a permissions rule.'],
      explain: 'The aim is that new behaviour arrives as **new code** that plugs in, so tried-and-tested code is not reopened and risked.' },

    { type: 'tf', after: 6, statement: 'Fixing a bug inside an existing class does not break the Open/Closed Principle.', answer: true,
      explain: 'OCP is about adding features without editing the core. Fixing a bug is a normal change. The principle just says new cases should be new code.' },

    { type: 'spot', prompt: 'This function will need editing every time the business wants another export format. Tap a line that shows the problem.',
      code: { lang: 'js', src: `
        function exportReport(report, format) {
          switch (format) {
            case 'pdf': return toPdf(report);
            case 'csv': return toCsv(report);
            default: throw new Error('Unknown format');
          }
        }` },
      lines: [2],
      explain: 'The `switch` is where every format is baked in. A new format means reopening this function and adding a case. A map of format name to converter would let formats be added as entries instead.' },

    { type: 'ab', q: 'The business adds a new customer type every few months. Which design suits that?',
      a: { lang: 'js', label: 'If-chain', src: `
        function discount(customer, total) {
          if (customer.type === 'vip') return total * 0.15;
          if (customer.type === 'student') return total * 0.10;
          return 0;
        }` },
      b: { lang: 'js', label: 'Rules by type', src: `
        const rules = {
          vip:     (total) => total * 0.15,
          student: (total) => total * 0.10
        };
        function discount(customer, total) {
          return (rules[customer.type] ?? (() => 0))(total);
        }` },
      answer: 'b',
      explain: 'With rules by type, adding a type is just a new table entry and `discount` stays untouched. The if-chain has to be edited and re-tested each time.' },

    { type: 'cloze', code: true, text: 'const formats = {\n  pdf: toPdf,\n  csv: toCsv\n};\nfunction exportReport(report, {{format}}) {\n  return formats[format](report);\n}\n// a new format is an extension; exportReport stays {{closed}}',
      distractors: ['open', 'report', 'switch'],
      explain: 'The function only looks up whatever format it is told about. It is closed against new formats because they are added as table entries.' },

    { type: 'bucket', prompt: 'Is this an extension (new code) or a modification (editing old code)?', buckets: ['Extension', 'Modification'],
      items: [['Write a SpeedyCarrier class and register it', 0], ['Add another case to a switch in shippingCost', 1], ['Drop a new plug-in file into the plug-ins folder', 0], ['Add a branch to an if-chain for a new customer type', 1], ['Add a new listener for the "order placed" event', 0], ['Edit the pricing function to special-case a new country', 1]],
      explain: 'Extensions add new code that plugs into an existing point. Modifications reopen working code, with all the risk that brings.' },

    { type: 'order', prompt: 'Put a sensible approach to OCP in order.',
      items: ['Write the simple version for the first case', 'A second, similar case arrives', 'Notice what stays the same and what varies', 'Create a plug-in point for the varying part', 'Add later cases as extensions'],
      explain: 'You learn the real shape of the variation by meeting a second case. Adding the plug-in point then is cheap and well-aimed, whereas guessing earlier often builds the wrong one.' },

    { type: 'scenario', title: 'The plug-in framework', meters: { speed: 50, quality: 50 },
      intro: 'You are building a small invoicing tool. The only tax rule today is UK VAT. A colleague wants a "tax plug-in registry with discovery and versioning" before you write any of it.',
      steps: [
        { text: 'What do you suggest?',
          choices: [
            { label: 'Write the UK VAT rule simply. Add a plug-in point when a second tax rule really arrives', score: 2, effects: { speed: 20, quality: 15 }, feedback: 'You ship now, and when the second rule shows up you will know what the plug-in point actually needs to look like.' },
            { label: 'Build the full registry now, just in case', score: 0, effects: { speed: -30, quality: -10 }, feedback: 'Weeks of machinery for a variation that may never appear, and the guessed design is likely to be wrong anyway.' },
            { label: 'Hard-code VAT in several places and move on', score: 1, effects: { speed: 10, quality: -15 }, feedback: 'Quick, but you are scattering the rule. At minimum keep it in one function.' }
          ] },
        { text: 'A year on, Germany and France arrive in the same month. Now what?',
          choices: [
            { label: 'Extract a taxFor(country) plug-in point and add each country as an entry', score: 2, effects: { quality: 25, speed: 10 }, feedback: 'Now the variation is real and you have seen its shape. Each new country is just an extension.' },
            { label: 'Add two more if-branches to the VAT function', score: 1, effects: { quality: -10 }, feedback: 'It works for now, but you are on the path of the ever-growing switch.' },
            { label: 'Copy the VAT file for each country', score: 0, effects: { quality: -25 }, feedback: 'Copies drift apart and a bug fix has to be made three times.' }
          ] }
      ],
      outro: 'Plug-in points belong where the change really happens.' },

    { type: 'explain', prompt: 'Explain the Open/Closed Principle using the shipping couriers.',
      model: 'Open for extension, closed for modification: adding a new courier should be new code that plugs in, not an edit to the existing, tested shipping function. Each courier has the same cost method, and the shipping function just calls it, so a new courier is an extension. Do not build plug-in points before the variation is real.',
      keywords: ['extension', 'modification', 'plug-in', 'polymorphism', 'new code', 'tested'] }
  ],

  flashcards: [
    { q: 'State the Open/Closed Principle.', a: 'Software should be open for extension but closed for modification: add behaviour with new code, not by editing old code.' },
    { q: 'Who is associated with the Open/Closed Principle?', a: 'Bertrand Meyer wrote it down; Robert C. Martin popularised it as the O in SOLID.' },
    { q: 'What mechanism usually makes code open/closed?', a: 'Polymorphism: a shared interface or method shape (a plug-in point) that new implementations can fill.' },
    { q: 'How do you avoid over-engineering with OCP?', a: 'Do not guess. Write the simple version, then create a plug-in point once a second similar case shows how things vary.' },
    { q: 'Does OCP forbid editing a file?', a: 'No. Bug fixes and refactoring are fine. It is about adding features without reopening the core.' }
  ],

  glossary: [
    { term: 'Open/Closed Principle', def: 'The O in SOLID: code should be open for extension but closed for modification.', like: 'A phone that accepts new apps without being rebuilt.', aka: ['OCP'] },
    { term: 'Plug-in point', def: 'A defined place in a design where new behaviour can be attached without changing the core.', like: 'A free socket on a power strip.', aka: ['extension point'] },
    { term: 'Strategy', def: 'A swappable piece of behaviour with one agreed method, chosen by the caller.', like: 'Picking a courier for a parcel.' },
    { term: 'Polymorphism in practice', def: 'Different objects answering the same call in their own way, so the caller does not need to know which it has.', like: 'Pressing "play" on any device.' }
  ],

  takeaways: [
    'Add features as **new code**, not edits to tested code.',
    'A plug-in point is a shared shape, such as a `cost(order)` method.',
    'Wait for the second case before building the plug-in point.',
    'Closed does not mean frozen: bug fixes are fine.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-lsp', {
  eli5: 'If code works with a parent class, it must keep working when you hand it any child class instead, with no nasty surprises.',

  cards: [
    { kind: 'concept', title: 'The rectangle that broke a test',
      body: `In geometry a square **is** a rectangle. So in code, \`Square extends Rectangle\` looks obvious.

        But a function written for rectangles says: *"set the width to 5, set the height to 4, and the area will be 20."* Hand it a square and the area is 16, because setting the height also changed the width.

        The subclass compiled fine and still **broke code that used its parent**. That is the heart of the **Liskov Substitution Principle** (LSP), the L in SOLID, named after Barbara Liskov.` },

    { kind: 'code', title: 'The square/rectangle trap',
      body: 'Tap the highlighted lines to follow the surprise.',
      code: { lang: 'js', src: `
        class Rectangle {
          setWidth(w) { this.w = w; }
          setHeight(h) { this.h = h; }
          area() { return this.w * this.h; }
        }
        class Square extends Rectangle {
          setWidth(w)  { this.w = w; this.h = w; }
          setHeight(h) { this.w = h; this.h = h; }
        }

        function stretch(r) {
          r.setWidth(5);
          r.setHeight(4);
          return r.area();   // the caller expects 20
        }`,
        notes: {
          7: 'A square must keep its sides equal, so setting the width quietly changes the height too.',
          13: 'For a square this sets **both** sides to 4.',
          14: 'The area is 16. The caller expected 20 and has no idea why.'
        } } },

    { kind: 'metaphor', title: 'The substitute teacher',
      body: `Your usual teacher is off sick, so a substitute takes the class. For that to work, the substitute must be able to do what the **timetable promises**: take the register, teach the lesson, set homework.

        A substitute who refuses to take the register, or who will only teach if every child already knows the topic, breaks the day. The school does not care **who** they are, only that they honour the role.

        A subtype is a substitute teacher. It must be able to do everything the base type promised.` },

    { kind: 'concept', title: 'Behaviour is a contract',
      body: `The rule: **a subtype must be usable anywhere its base type is expected, without the caller being surprised.**

        The key word is *behaviour*. Sharing method names is not enough. The base type makes **promises**, written or implied, about what goes in and what comes out. A subtype may keep those promises or do better, but it must not break them.

        That is why "is-a" in code means "**behaves as**", not "is a kind of in the dictionary". A mutable \`Square\` is not a behaving \`Rectangle\`, even though geometry says otherwise.` },

    { kind: 'compare', title: 'What a subtype may and may not do',
      body: 'Three rules cover most cases.',
      cols: ['Allowed', 'Breaks the contract'],
      rows: [
        ['Inputs (preconditions)', 'Accept the same or wider range', 'Demand more than the parent did'],
        ['Results (postconditions)', 'Promise the same or more', 'Promise less, or return nothing useful'],
        ['Errors', 'Fail the same ways the parent could', 'Throw a new, surprising exception'],
        ['Rules that always hold (invariants)', 'Keep them', 'Break them, like "sides can differ"']
      ] },

    { kind: 'code', title: 'Two ways to break a refund',
      body: 'The base class makes a promise. Each subclass breaks it differently.',
      code: { lang: 'js', src: `
        class Payment {
          // contract: refund(amount) works for 0 < amount <= paid
          refund(amount) { /* send the money back */ }
        }

        class CashPayment extends Payment {
          refund(amount) {
            throw new Error('Cash cannot be refunded');
          }
        }

        class VoucherPayment extends Payment {
          refund(amount) {
            if (amount !== this.paid) throw new Error('Full refunds only');
            /* ... */
          }
        }`,
        notes: {
          8: 'A **surprise exception**. A caller that refunds "a Payment" now crashes for cash.',
          14: 'A **stricter precondition**: the parent accepted any valid amount, this demands the full one.'
        } } },

    { kind: 'pitfall', title: 'The “not supported” smell',
      body: `Two warning signs of an LSP violation:

        - A subclass method that just throws \`NotSupported\`, or does nothing.
        - Callers that check the type first: \`if (p instanceof CashPayment) ...\`.

        The type check is the caller admitting it cannot trust the substitute. Every such check is a place where the abstraction leaked.

        The fix is usually to **change the hierarchy**: do not claim cash is a refundable payment. Split the idea (a \`RefundablePayment\` for those that can be), or use composition.` },

    { kind: 'diagram', title: 'Fixing the shape hierarchy',
      body: 'Instead of one inheriting from the other, both share only what is truly common.',
      nodes: [
        { id: 'shape', label: 'Shape: area()', x: 1, y: 0, tone: 'good' },
        { id: 'rect', label: 'Rectangle', x: 0, y: 1 },
        { id: 'sq', label: 'Square', x: 2, y: 1 }
      ],
      edges: [
        { from: 'rect', to: 'shape', label: 'is a', dashed: true },
        { from: 'sq', to: 'shape', dashed: true }
      ],
      caption: 'Make them immutable or siblings. Neither can break promises the other made.' },

    { kind: 'tip', title: 'Checking for violations',
      body: `Ask: **"If I swapped this subtype in, would the caller notice?"** If yes, you have a problem.

        A practical technique is a **contract test**: write one set of tests for the base type's promises and run it against **every** subtype. If a new subtype fails the shared tests, it is not a real substitute.

        LSP is also why deep inheritance trees are risky: each extra level is another chance to break the parent's promises.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'What does the Liskov Substitution Principle require of a subtype?',
      options: ['It must work anywhere its base type is expected, without surprising the caller', 'It must have exactly the same methods as its parent and nothing more', 'It must override every method it inherits', 'It must be in the same file as its parent'],
      answer: 0,
      why: [null, 'Subtypes may add methods. LSP is about keeping promises.', 'Overriding is optional and often unneeded.', 'File layout is irrelevant.'],
      explain: 'The test is behaviour: code written for the base type must keep working when handed a subtype. Matching method names is not enough.' },

    { type: 'tf', after: 5, statement: 'A subclass is allowed to throw an exception the parent class never threw, as long as it is documented.', answer: false,
      explain: 'Callers coded to the parent do not expect the new failure. A new, unexpected exception is one of the classic ways to break substitutability, however well documented.' },

    { type: 'spot', prompt: 'Which line breaks substitutability?',
      code: { lang: 'js', src: `
        class Bird { fly() { /* flap */ } }
        class Penguin extends Bird {
          fly() { throw new Error('Penguins cannot fly'); }
        }
        function migrate(birds) {
          birds.forEach(b => b.fly());
        }` },
      lines: [3],
      explain: 'Anything that handles "a Bird" and calls `fly()` will crash on a penguin. The hierarchy promised flying to every bird. A `FlyingBird` split would fix it.' },

    { type: 'ab', q: 'Which hierarchy respects Liskov?',
      a: { lang: 'js', label: 'Split', src: `
        class Bird { eat() { } }
        class FlyingBird extends Bird {
          fly() { /* flap */ }
        }
        class Penguin extends Bird { swim() { } }` },
      b: { lang: 'js', label: 'Everyone flies', src: `
        class Bird {
          fly() { /* flap */ }
        }
        class Penguin extends Bird {
          fly() { throw new Error('No'); }
        }` },
      answer: 'a',
      explain: 'Only birds that really fly are promised to. Code that needs flying asks for a `FlyingBird`, and a penguin can never be handed in by mistake.' },

    { type: 'bucket', prompt: 'Does this subclass behaviour break LSP, or keep to it?', buckets: ['Breaks LSP', 'Keeps to it'],
      items: [['Throws "not supported" for an inherited method', 0], ['Accepts a wider range of inputs than the parent', 1], ['Returns null where the parent promised a value', 0], ['Adds a new method of its own', 1], ['Requires a non-negative amount where the parent accepted any', 0], ['Returns a more specific result that still meets the promise', 1]],
      explain: 'Being more generous in what you accept, or more precise in what you return, is safe. Being stricter in or weaker out surprises callers.' },

    { type: 'cloze', text: 'A subtype must not strengthen the {{preconditions}} of its parent, and must not weaken its {{postconditions}}.',
      distractors: ['invariants', 'imports', 'comments'],
      explain: 'Preconditions are what must be true before a call, and postconditions are what is true after. The caller trusts both.' },

    { type: 'multi', q: 'Which of these is a good sign that substitutability is being broken?',
      options: ['A subclass method throws NotSupported', 'Callers check `instanceof` before calling a method', 'A subclass adds an extra method of its own', 'A subclass demands stricter inputs than the parent', 'A subclass overrides a method to add logging'],
      answers: [0, 1, 3],
      explain: 'Throwing for inherited methods, type checks in callers and stricter inputs are all symptoms. Extra methods and harmless logging do not change what the parent promised.' },

    { type: 'scenario', title: 'The read-only report', meters: { safety: 50, cleanliness: 50 },
      intro: 'A Report class has load(), edit() and save(). Someone adds ArchivedReport extends Report, whose edit() and save() throw "archived reports are read-only". A nightly job loops over all Reports and calls save().',
      steps: [
        { text: 'The nightly job crashes on the first archived report. What is the root problem?',
          choices: [
            { label: 'ArchivedReport broke the promise Report made, so it is not a true substitute', score: 2, effects: { safety: 25 }, feedback: 'Yes. The base type promised editing and saving, and the subtype retracts that.' },
            { label: 'The nightly job is wrong for calling save()', score: 0, effects: { safety: -10 }, feedback: 'The job did what the base type allowed. The caller followed the contract.' },
            { label: 'Archived reports should not exist', score: 1, effects: { cleanliness: -5 }, feedback: 'They are a fine idea. The modelling is the problem.' }
          ] },
        { text: 'How do you fix it?',
          choices: [
            { label: 'Make a ReadableReport with load(), and an EditableReport extending it with edit() and save()', score: 2, effects: { cleanliness: 30, safety: 20 }, feedback: 'Callers now ask for the ability they need, and the nightly job takes only editable reports.' },
            { label: 'Add `if (report instanceof ArchivedReport) continue;` to the job', score: 1, effects: { safety: 5, cleanliness: -15 }, feedback: 'It stops this crash, but every future caller must remember the same check.' },
            { label: 'Catch the exception and ignore it', score: 0, effects: { safety: -15 }, feedback: 'Silent failure hides real problems and leaves the broken contract in place.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain why Square extending Rectangle breaks the Liskov Substitution Principle even though a square is a rectangle in maths.',
      model: 'LSP is about behaviour, not dictionary meaning. A function written for rectangles assumes setting the width does not change the height, so width 5 and height 4 gives area 20. A mutable Square changes both sides, so the same call gives 16. The subtype breaks the contract the parent made, so it is not a safe substitute.',
      keywords: ['behaviour', 'contract', 'substitute', 'width', 'height', 'surprise'] }
  ],

  flashcards: [
    { q: 'State the Liskov Substitution Principle.', a: 'Objects of a subtype must be usable wherever the base type is expected, without changing the correctness of the program or surprising the caller.' },
    { q: 'Why does Square extending Rectangle break LSP?', a: 'Setting one side of a square changes the other, breaking the rectangle’s promise that width and height are independent.' },
    { q: 'What may a subtype do with preconditions and postconditions?', a: 'Never demand more (stronger preconditions) and never promise less (weaker postconditions).' },
    { q: 'Name two code smells of an LSP violation.', a: 'A subclass method that throws "not supported", and callers that check `instanceof` before calling a method.' },
    { q: 'What is a contract test?', a: 'A set of tests for the base type’s promises, run against every subtype to check it is a true substitute.' }
  ],

  glossary: [
    { term: 'Liskov Substitution Principle', def: 'The L in SOLID: a subtype must be usable anywhere its base type is expected, without surprises.', like: 'A substitute teacher who can do everything the timetable promises.', aka: ['LSP'] },
    { term: 'Precondition', def: 'What must be true before a method is called, such as a valid amount.', like: 'The "you must be this tall" sign.' },
    { term: 'Postcondition', def: 'What is guaranteed to be true after a method finishes.', like: 'A receipt promising the item is yours.' },
    { term: 'Invariant', def: 'A rule that must always hold for an object, such as "a square’s sides are equal".', like: 'A lift that must never move with its doors open.' }
  ],

  takeaways: [
    'A subtype must keep every promise its parent made.',
    'Never demand more from callers, never give less back, never surprise with new errors.',
    '"Not supported" and `instanceof` checks are warning signs.',
    'Fix violations by reshaping the hierarchy or using composition.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-isp', {
  eli5: 'Do not make anyone sign up to a long list of promises when they only need one or two: give each user of your code a small contract that covers just what they use.',

  cards: [
    { kind: 'concept', title: 'The printer that had to fax',
      body: `An office defines one interface for its devices: \`print\`, \`scan\` and \`fax\`. The big all-in-one machine does all three. Fine.

        Then the company buys a basic printer. It prints, and that is all. But the interface says every machine **must** provide all three methods, so the printer's \`scan\` and \`fax\` just throw errors.

        The **Interface Segregation Principle** (ISP), the I in SOLID, says:

        > No client should be forced to depend on methods it does not use.

        "Segregation" just means *splitting apart*.` },

    { kind: 'code', title: 'Before: the fat interface',
      body: 'One contract, three jobs. Tap the highlighted lines.',
      code: { lang: 'ts', src: `
        interface Machine {
          print(doc: Document): void;
          scan(): Document;
          fax(doc: Document, number: string): void;
        }

        class OfficeAllInOne implements Machine { /* does all three */ }

        class BasicPrinter implements Machine {
          print(doc: Document) { /* fine */ }
          scan(): Document { throw new Error('No scanner'); }
          fax(doc: Document, n: string) { throw new Error('No fax'); }
        }`,
        notes: {
          1: 'A **fat interface**: it bundles three unrelated abilities.',
          11: 'The printer is forced to pretend it can scan. That is a broken promise waiting to explode.',
          12: 'And the same again for faxing. (This also breaks the Liskov rule from the last lesson.)'
        } } },

    { kind: 'metaphor', title: 'The set menu',
      body: `A restaurant offers one deal: the twelve-course tasting menu. You must order all of it, or nothing. You wanted soup.

        À la carte lets you order just the courses you want. Nobody is stuck paying for, or waiting on, dishes they never asked for.

        A fat interface is the tasting menu. **Role interfaces** are à la carte: each client takes only the dishes it will actually eat.` },

    { kind: 'concept', title: 'Small contracts, shaped by the client',
      body: `The cure is to split the fat interface into several small ones, each describing **one role**: \`Printer\`, \`Scanner\`, \`Fax\`. These are called **role interfaces**.

        Then:

        - A class **implements only the roles it really has**. The basic printer is just a \`Printer\`.
        - A function **asks only for the role it needs**. A report-printing function takes a \`Printer\`, and cannot accidentally call \`fax\`.

        The best way to cut the interface is from the **client's side**: what does each caller actually use?` },

    { kind: 'code', title: 'After: role interfaces',
      body: 'Three small contracts. Classes pick the ones that fit.',
      code: { lang: 'ts', src: `
        interface Printer { print(doc: Document): void; }
        interface Scanner { scan(): Document; }
        interface Fax { fax(doc: Document, number: string): void; }

        class BasicPrinter implements Printer {
          print(doc: Document) { /* ... */ }
        }

        class OfficeAllInOne implements Printer, Scanner, Fax { /* all three */ }

        function printOne(p: Printer, doc: Document) { p.print(doc); }`,
        notes: {
          1: 'A **role interface**: one small ability.',
          9: 'The all-in-one machine still does everything, by playing three roles.',
          11: 'This function sees only `print`. Nothing else is available to misuse, and any printer works.'
        } } },

    { kind: 'diagram', title: 'Each client sees only its own role',
      body: 'One class can sit behind all three roles. Each caller is only tied to the role it uses.',
      nodes: [
        { id: 'job', label: 'ReportJob', x: 0, y: 0, tone: 'accent' },
        { id: 'chk', label: 'Checkout', x: 1, y: 0, tone: 'accent' },
        { id: 'adm', label: 'AdminTool', x: 2, y: 0, tone: 'accent' },
        { id: 'r', label: 'Reader', x: 0, y: 1, tone: 'good' },
        { id: 'w', label: 'Writer', x: 1, y: 1, tone: 'good' },
        { id: 'a', label: 'Maintenance', x: 2, y: 1, tone: 'good' },
        { id: 'store', label: 'PostgresUserStore', x: 1, y: 2 }
      ],
      edges: [
        { from: 'job', to: 'r' }, { from: 'chk', to: 'w' }, { from: 'adm', to: 'a' },
        { from: 'store', to: 'r', dashed: true }, { from: 'store', to: 'w', dashed: true }, { from: 'store', to: 'a', dashed: true }
      ],
      caption: 'Changing the Maintenance role cannot disturb ReportJob.' },

    { kind: 'story', title: 'The ripple effect',
      body: `A \`UserStore\` interface has twenty methods: reading, writing, deleting, exporting, rebuilding the search index.

        The nightly report job only ever **reads**. But it depends on the whole interface. One day the team changes the signature of \`exportAllToCsv\`, a method the report never touches.

        The report job must be rebuilt, re-tested and redeployed anyway, and its mocks in tests all need updating because they have to fake twenty methods to satisfy the type.

        That is the **ripple effect** of a big contract: a change anywhere reaches everyone who signed it.` },

    { kind: 'pitfall', title: 'Splitting into dust',
      body: `Do not turn every method into its own one-method interface. That scatters related ideas and leaves callers juggling five types for one job.

        Group methods that **are used together**. If every caller who reads also searches, then \`findById\` and \`search\` belong in the same \`Reader\` role.

        And do not split for its own sake: an interface with eight methods that **every client uses** is perfectly healthy. Judge it by what clients use, not by the method count.`,
      note: 'In JavaScript, where functions accept any object with the right methods, this shows up as which methods your function actually calls. A TypeScript type makes it explicit.' },

    { kind: 'tip', title: 'Smells of a fat interface',
      body: `- Implementations with methods that **throw "not implemented"** or do nothing.
        - Tests that need a giant fake to satisfy a function that only calls one method.
        - A change that forces recompiling or redeploying code unrelated to the change.
        - An interface name like \`IManager\` or \`IService\` that holds everything.

        The fix is almost always the same: ask each caller *"which of these do you actually use?"* and cut along those lines.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'What does the Interface Segregation Principle say?',
      options: ['No client should be forced to depend on methods it does not use', 'Every class must have its own interface', 'An interface should contain every method any caller might need', 'Interfaces should be hidden from other modules'],
      answer: 0,
      why: [null, 'That is the over-abstraction habit, not ISP.', 'That is exactly the fat interface ISP warns against.', 'Interfaces exist to be shared. ISP is about their size and shape.'],
      explain: 'Callers should be tied only to the methods they actually use. Small, role-shaped contracts mean a change to one role cannot ripple to everyone.' },

    { type: 'tf', after: 6, statement: 'A change to a method that a client never calls can still force that client to be rebuilt if it depends on a fat interface.', answer: true,
      explain: 'The client is tied to the whole contract, not just the parts it calls. Smaller interfaces limit how far a change can travel.' },

    { type: 'spot', prompt: 'One line shows the symptom of a fat interface. Tap it.',
      code: { lang: 'ts', src: `
        interface Worker {
          work(): void;
          eat(): void;
        }
        class Robot implements Worker {
          work() { /* assemble parts */ }
          eat() { throw new Error('Robots do not eat'); }
        }` },
      lines: [7],
      explain: 'The robot is forced to implement `eat` and can only pretend. The cure is to split the roles (`Workable`, `Feedable`) so the robot implements only what it can do.' },

    { type: 'ab', q: 'A function only needs to print. Which signature is better?',
      a: { lang: 'ts', label: 'Whole machine', src: `
        function printOne(m: Machine, doc: Document) {
          m.print(doc);
        }` },
      b: { lang: 'ts', label: 'Just a printer', src: `
        function printOne(p: Printer, doc: Document) {
          p.print(doc);
        }` },
      answer: 'b',
      explain: 'Asking for only the role it needs means any printer works, tests need only a tiny fake, and changes to scanning or faxing cannot affect it.' },

    { type: 'bucket', prompt: 'Sort the methods of a big UserStore into role interfaces.', buckets: ['Reader', 'Writer', 'Maintenance'],
      items: [['findById', 0], ['search', 0], ['save', 1], ['delete', 1], ['rebuildSearchIndex', 2], ['exportAllToCsv', 2]],
      explain: 'The report job needs reading, checkout needs writing, and only admin tooling needs maintenance. Grouping by who uses them keeps each client free of the rest.' },

    { type: 'cloze', code: true, text: 'interface {{Printer}} { print(doc: Document): void; }\n\nclass BasicPrinter {{implements}} Printer {\n  print(doc: Document) { /* ... */ }\n}\n// a small, one-job contract is a {{role}} interface',
      distractors: ['Machine', 'extends', 'fat'],
      explain: 'The basic printer promises just the one role it really has. A `Machine` with scan and fax would be the fat interface again.' },

    { type: 'multi', q: 'Which are signs that an interface is too fat?',
      options: ['Implementations throw "not implemented" for some methods', 'A test needs a huge fake to call one method', 'A change to one method forces redeploying unrelated clients', 'Every client calls every method', 'It has a clear, specific name'],
      answers: [0, 1, 2],
      explain: 'Unused methods leaving traces in implementations, tests and deployments are the classic signs. If every client uses every method, the size is fine.' },

    { type: 'scenario', title: 'The twenty-method interface', meters: { stability: 40, effort: 60 },
      intro: 'Your OrderStore interface has twenty methods. The email service only ever calls findById. A change to one export method has just forced it to be redeployed for the third time this month.',
      steps: [
        { text: 'What do you do?',
          choices: [
            { label: 'Ask each caller which methods it uses, then split into small role interfaces', score: 2, effects: { stability: 30, effort: -10 }, feedback: 'Cutting along real usage means the email service now depends on a one-method reader, and it stays quiet when exports change.' },
            { label: 'Split it into twenty one-method interfaces', score: 1, effects: { stability: 10, effort: -25 }, feedback: 'The ripples shrink, but callers now juggle many tiny types for one job. Group methods that are used together.' },
            { label: 'Leave it and tell the email team to deploy more often', score: 0, effects: { stability: -15 }, feedback: 'The cost of the oversized contract stays and grows with every change.' }
          ] },
        { text: 'The same class still implements all the roles. Is that a problem?',
          choices: [
            { label: 'No, one class can play several roles. Clients only see the role they use', score: 2, effects: { stability: 15 }, feedback: 'Right. Segregation is about what clients see, not about forcing separate implementing classes.' },
            { label: 'Yes, it must now be split into one class per role', score: 0, effects: { effort: -20 }, feedback: 'ISP is about interfaces, not classes. One implementation behind several roles is fine.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain the Interface Segregation Principle using the printer example.',
      model: 'A single Machine interface with print, scan and fax forces a basic printer to implement scan and fax, which it cannot do, so it throws errors. ISP says no client should depend on methods it does not use. Split it into small role interfaces (Printer, Scanner, Fax). Each class implements only the roles it has, and each function asks only for the role it needs.',
      keywords: ['role', 'client', 'fat interface', 'split', 'depend', 'methods it does not use'] }
  ],

  flashcards: [
    { q: 'State the Interface Segregation Principle.', a: 'No client should be forced to depend on methods it does not use.' },
    { q: 'What is a fat interface?', a: 'An interface bundling many unrelated methods, so implementers and callers depend on far more than they need.' },
    { q: 'What is a role interface?', a: 'A small interface describing one ability, shaped around what a particular kind of client needs.' },
    { q: 'What is the ripple effect of a big contract?', a: 'A change to any method can force every client of the interface to be rebuilt, retested or redeployed, even if they never call it.' },
    { q: 'Can one class implement several role interfaces?', a: 'Yes. ISP is about what clients depend on, so one class can play many roles.' }
  ],

  glossary: [
    { term: 'Interface Segregation Principle', def: 'The I in SOLID: no client should be forced to depend on methods it does not use.', like: 'Ordering à la carte instead of the twelve-course menu.', aka: ['ISP'] },
    { term: 'Fat interface', def: 'An interface with many unrelated methods, so implementers and clients depend on more than they need.', like: 'A remote with 80 buttons when you only use five.' },
    { term: 'Role interface', def: 'A small interface that describes just one role or ability.', like: 'A job title with a short, focused description.' },
    { term: 'Client', def: 'Any piece of code that uses an interface or class.', like: 'The customer, as opposed to the shop.' }
  ],

  takeaways: [
    'Give each client a small contract with only what it uses.',
    'Fat interfaces force fake implementations and spread changes.',
    'Cut interfaces from the client’s side, grouping what is used together.',
    'One class can still play several roles.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-dip', {
  eli5: 'The important rules of your program should not be wired to unimportant details like which database or email provider you use; instead the important code states what it needs and the details adapt to fit.',

  cards: [
    { kind: 'concept', title: 'When the details are in charge',
      body: `Your billing code holds your company's most valuable knowledge: *when to invoice, how much, who gets a reminder.* We call that **high-level policy**.

        It also needs to send emails and store invoices. Those are **low-level details**: they can be swapped without changing a single business rule.

        In most code the arrows point the wrong way. The policy imports the details, so a change in the email library can break the billing rules. The **Dependency Inversion Principle** (DIP), the D in SOLID, turns the arrows around.` },

    { kind: 'code', title: 'Before: policy imports the detail',
      body: 'Tap the highlighted lines.',
      code: { lang: 'ts', src: `
        import { SmtpMailer } from './infra/smtp';
        import { PostgresInvoices } from './infra/postgres';

        class BillingService {
          private mailer = new SmtpMailer();
          private invoices = new PostgresInvoices();

          billCustomer(c: Customer) {
            const inv = this.invoices.create(c);
            this.mailer.sendSmtp(c.email, inv);
          }
        }`,
        notes: {
          1: 'The business rules **import** a specific email library.',
          6: 'And create it. Billing now knows how email is sent.',
          10: 'Even the method name (`sendSmtp`) leaks the technology into the policy.'
        } } },

    { kind: 'diagram', title: 'The arrows point down at the details',
      body: 'Normal dependency: important code depends on unimportant code.',
      nodes: [
        { id: 'bill', label: 'BillingService (policy)', x: 1, y: 0, tone: 'accent' },
        { id: 'smtp', label: 'SmtpMailer (detail)', x: 0, y: 1, tone: 'muted' },
        { id: 'pg', label: 'PostgresInvoices (detail)', x: 2, y: 1, tone: 'muted' }
      ],
      edges: [
        { from: 'bill', to: 'smtp', label: 'depends on' }, { from: 'bill', to: 'pg', label: 'depends on' }
      ],
      caption: 'Change either detail and the policy may need to change with it.' },

    { kind: 'concept', title: 'The principle',
      body: `DIP has two halves, in Robert C. Martin's words:

        1. **High-level modules should not depend on low-level modules. Both should depend on abstractions.**
        2. **Abstractions should not depend on details. Details should depend on abstractions.**

        In practice: billing declares an interface describing what it needs (*"tell the customer an invoice is ready"*) in **its own language**. The email code then **implements** that interface. The arrow from the detail to the policy is the "inversion".` },

    { kind: 'code', title: 'After: the policy owns the contract',
      body: 'Notice where each piece lives.',
      code: { lang: 'ts', src: `
        // billing/ports.ts  (owned by the billing module)
        export interface InvoiceNotifier {
          invoiceReady(customer: Customer, invoice: Invoice): void;
        }

        // billing/service.ts
        class BillingService {
          constructor(private notifier: InvoiceNotifier) {}
        }

        // infra/smtp-notifier.ts
        import { InvoiceNotifier } from '../billing/ports';
        class SmtpNotifier implements InvoiceNotifier { /* SMTP */ }`,
        notes: {
          2: 'Written in billing’s **own words**: no SMTP, no HTML, no hostnames.',
          8: 'Billing is handed something that satisfies the contract.',
          12: 'The detail now **imports the policy’s interface**. The arrow has flipped.'
        } } },

    { kind: 'diagram', title: 'The arrows now point up',
      body: 'The interface sits with the high-level module. The low-level code depends on it.',
      nodes: [
        { id: 'bill', label: 'BillingService', x: 1, y: 0, tone: 'accent' },
        { id: 'port', label: 'InvoiceNotifier', x: 1, y: 1, tone: 'good' },
        { id: 'smtp', label: 'SmtpNotifier', x: 0, y: 2, tone: 'muted' },
        { id: 'sms', label: 'SmsNotifier', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'bill', to: 'port', label: 'uses' },
        { from: 'smtp', to: 'port', label: 'implements', dashed: true }, { from: 'sms', to: 'port', dashed: true }
      ],
      groups: [
        { label: 'High-level: billing module', x: 1, y: 0, w: 1, h: 2 },
        { label: 'Low-level: infrastructure', x: 0, y: 2, w: 3, h: 1 }
      ],
      caption: 'In the lab that follows, you will change one module, watch the ripple, then insert an interface to cut it.' },

    { kind: 'metaphor', title: 'The supermarket and its suppliers',
      body: `A big supermarket does not rewrite its tills and warehouse for each supplier. It publishes **its own rules**: box sizes, barcodes, delivery slots. Suppliers adapt to the supermarket.

        The *supermarket* owns the specification. The suppliers depend on it, not the other way round.

        That is the crucial point of DIP: it is not just *having* an interface, it is about **who owns it**. The side that needs something defines it, in its own terms.` },

    { kind: 'compare', title: 'DIP, injection and IoC: not the same',
      body: 'These three get mixed up all the time.',
      cols: ['Kind of thing', 'The question it answers'],
      rows: [
        ['Dependency Inversion (DIP)', 'A **principle**', 'Who depends on whom, and who owns the interface?'],
        ['Dependency injection (DI)', 'A **technique**', 'How does an object receive its helper? (Passed in)'],
        ['IoC container', 'A **tool**', 'Who builds and wires all the objects?']
      ],
      note: 'You can use injection without inverting dependencies (inject a concrete class), and invert them without a container (wire by hand).' },

    { kind: 'pitfall', title: 'An interface is not enough',
      body: `Putting \`IMailer\` in the same folder as \`SmtpMailer\`, shaped around what **SMTP** offers, does not invert anything. Billing still imports the infrastructure package, and the interface still speaks the detail's language.

        Two checks tell you DIP is real:

        - **Where does the interface live?** With the code that needs it.
        - **Whose words does it use?** The policy's, not the technology's.

        And as ever, do not invert everything. A stable, tiny, standard thing (like a maths library) is rarely worth an interface.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'In Dependency Inversion, who should own the abstraction?',
      options: ['The high-level module that needs it', 'The low-level module that implements it', 'A shared folder that nobody in particular owns', 'Whichever module was written first'],
      answer: 0,
      why: [null, 'If the detail owns it, the policy still depends on the detail’s package and language.', 'An unowned interface tends to drift towards the details of the most popular implementation.', 'Order of writing has nothing to do with direction of dependency.'],
      explain: 'The side that needs a service defines the contract in its own terms, and the details conform to it. That is what makes the arrow point upward.' },

    { type: 'bucket', after: 5, prompt: 'High-level policy or low-level detail?', buckets: ['Policy', 'Detail'],
      items: [['Rules for when an invoice is overdue', 0], ['The SQL that stores invoices', 1], ['Deciding who gets a loyalty discount', 0], ['The SMTP code that sends an email', 1], ['Calculating the price of a basket', 0], ['A call to a courier’s web API', 1]],
      explain: 'Policy is the knowledge that makes your business yours. Details are mechanisms you could swap without changing a single rule.' },

    { type: 'tf', statement: 'You can use dependency injection without following dependency inversion, for example by injecting a concrete class.', answer: true,
      explain: 'Inversion is a principle about the direction of dependencies and who owns the abstraction. Injection is one technique for handing an object its helpers. You can do one without the other.' },

    { type: 'spot', prompt: 'This looks like DIP but is not. Tap the line that gives it away.',
      code: { lang: 'ts', src: `
        // infra/mailer.ts
        export interface Mailer { sendSmtp(to: string, body: string): void; }
        export class SmtpMailer implements Mailer { /* ... */ }

        // billing/service.ts
        import { Mailer } from '../infra/mailer';` },
      lines: [6],
      explain: 'The interface lives in the infrastructure package and even has SMTP in its method name. Billing still imports from the detail, so the dependency still points the wrong way.' },

    { type: 'ab', q: 'Which version follows the Dependency Inversion Principle?',
      a: { lang: 'ts', label: 'Detail leads', src: `
        // billing/service.ts
        import { SmtpMailer } from '../infra/smtp';
        class BillingService {
          mailer = new SmtpMailer();
        }` },
      b: { lang: 'ts', label: 'Policy leads', src: `
        // billing/ports.ts
        interface InvoiceNotifier { invoiceReady(c: Customer): void; }
        // infra/smtp.ts
        import { InvoiceNotifier } from '../billing/ports';
        class SmtpNotifier implements InvoiceNotifier { }` },
      answer: 'b',
      explain: 'Here the infrastructure code imports the billing module’s interface, so the detail depends on the policy. In the other version billing imports the detail directly.' },

    { type: 'match', prompt: 'Match each term with what it is.',
      pairs: [['Dependency Inversion', 'A principle about who depends on whom'], ['Dependency injection', 'Passing an object its helpers from outside'], ['IoC container', 'A tool that builds and wires objects'], ['High-level policy', 'The business rules that make your product yours'], ['Low-level detail', 'A mechanism such as email, storage or an API call']],
      explain: 'Keeping these straight prevents the common confusion of calling any use of interfaces or injection "DIP".' },

    { type: 'cloze', text: 'High-level modules should not depend on {{low-level}} modules. Both should depend on {{abstractions}}, and the high-level side {{owns}} the abstraction.',
      distractors: ['frameworks', 'tests', 'inherits'],
      explain: 'That is the principle in one sentence. The ownership part is what makes the dependency arrow flip upward.' },

    { type: 'scenario', title: 'Switching to SMS', meters: { rules: 60, effort: 50 },
      intro: 'Your billing service imports SmtpMailer directly. The business wants invoice alerts by SMS for some customers, without changing any billing rule.',
      steps: [
        { text: 'How do you start?',
          choices: [
            { label: 'Define an InvoiceNotifier interface in the billing module, then have email and SMS implement it', score: 2, effects: { rules: 25, effort: -10 }, feedback: 'Billing states what it needs in its own words. Email and SMS now conform to it, and billing never learns either exists.' },
            { label: 'Add if (customer.prefersSms) branches inside BillingService', score: 0, effects: { rules: -20 }, feedback: 'Now the business rules know about SMS gateways too. The policy gets more tangled with details.' },
            { label: 'Create a Notifier interface inside the infra folder and import it from billing', score: 1, effects: { rules: 5 }, feedback: 'Better than direct imports, but billing still depends on the infrastructure package. The interface should live with the policy.' }
          ] },
        { text: 'A teammate wants an interface for every class, including a small date-formatting helper. Your view?',
          choices: [
            { label: 'Invert dependencies at real boundaries where the detail is likely to change', score: 2, effects: { effort: 15 }, feedback: 'Email, storage and payments earn it. A stable, standard helper rarely does.' },
            { label: 'Yes, every class, to be consistent', score: 0, effects: { effort: -20 }, feedback: 'You will drown in indirection with nothing gained.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain Dependency Inversion, including who owns the interface and how it differs from dependency injection.',
      model: 'High-level policy such as billing rules should not depend on low-level details such as SMTP or Postgres. Both depend on an abstraction, and the high-level side owns it, defined in its own words, so the details implement it and the dependency arrow points upward. Dependency injection is a separate technique: passing an object its helpers from outside. You can use it without inverting anything.',
      keywords: ['high-level', 'low-level', 'abstraction', 'owns', 'injection', 'policy'] }
  ],

  flashcards: [
    { q: 'State the Dependency Inversion Principle.', a: 'High-level modules should not depend on low-level modules. Both should depend on abstractions, and abstractions should not depend on details.' },
    { q: 'Who owns the interface in DIP?', a: 'The high-level module that needs it, defined in its own terms. The low-level code implements it.' },
    { q: 'DIP versus dependency injection?', a: 'DIP is a principle about the direction of dependencies. Injection is a technique for passing an object its helpers from outside.' },
    { q: 'What is high-level policy?', a: 'The business rules and decisions that give a system its value, as opposed to mechanisms like databases or email.' },
    { q: 'How can you tell an interface is not really inverting anything?', a: 'It lives with the implementation and uses its language, so the policy still imports the detail.' }
  ],

  glossary: [
    { term: 'Dependency Inversion Principle', def: 'The D in SOLID: high-level policy and low-level detail should both depend on abstractions, which the high-level side owns.', like: 'A supermarket setting the delivery format and suppliers adapting.', aka: ['DIP'] },
    { term: 'High-level policy', def: 'The core business rules of a system, independent of how things are stored or sent.', like: 'The recipe, rather than the oven.' },
    { term: 'Low-level detail', def: 'A mechanism that carries out a task, such as a database, an email library or a web API call.', like: 'The oven brand.' },
    { term: 'Port', def: 'An interface owned by the core of the application that describes something it needs from the outside world.', like: 'A socket built into the wall, shaped by the house.' }
  ],

  takeaways: [
    'Policy should not import details; both depend on an abstraction.',
    'The side that **needs** the interface owns it and names it in its own words.',
    'DIP is a principle; dependency injection is a technique.',
    'Invert at real boundaries, not around everything.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-dry', {
  eli5: 'Every fact or rule in your program should be written down in exactly one place, so that when it changes you only have to change it once, but code that merely looks alike is not always the same fact.',

  cards: [
    { kind: 'concept', title: 'The VAT rate in five places',
      body: `The UK sales tax rate is 20%. Your shop uses it in the basket total, in the invoice, in the receipt text ("includes 20% VAT") and in two reports.

        One day the rate changes. Someone fixes four of the five places. For a month, the receipts say one thing and the invoices another.

        **DRY** stands for **Don't Repeat Yourself**, from *The Pragmatic Programmer* by Andrew Hunt and David Thomas:

        > Every piece of **knowledge** must have a single, unambiguous, authoritative representation within a system.

        Notice the word: *knowledge*, not *code*.` },

    { kind: 'code', title: 'Before: one fact, many homes',
      body: 'The rate and the idea behind it are written out over and over. Tap the lines.',
      code: { lang: 'js', src: `
        function basketTotal(items) {
          return sum(items) * 1.2;
        }

        function invoiceLine(price) {
          return { net: price, vat: price * 0.2 };
        }

        function receiptText() {
          return 'Prices include 20% VAT';
        }`,
        notes: {
          2: 'The rate as a multiplier, 1.2.',
          6: 'The same rate as 0.2.',
          10: 'And again as text. Change the rate and nothing will tell you about this one.'
        } } },

    { kind: 'metaphor', title: 'The phone number on the posters',
      body: `Your café's phone number is painted on twelve posters, three menus and the window. Then the number changes.

        You can repaint all sixteen and hope you found them, or you could have put the number **in one place** and pointed everything else at it.

        DRY means keeping each fact on one poster, and having every other place refer to it. The aim is not saving typing. The aim is that a change has **one** place to happen.` },

    { kind: 'code', title: 'After: one authoritative place',
      body: 'The fact lives once. Everything else is derived.',
      code: { lang: 'js', src: `
        const VAT_RATE = 0.2;

        function basketTotal(items) {
          return sum(items) * (1 + VAT_RATE);
        }

        function invoiceLine(price) {
          return { net: price, vat: price * VAT_RATE };
        }

        function receiptText() {
          return 'Prices include ' + VAT_RATE * 100 + '% VAT';
        }`,
        notes: {
          1: 'The **single source of truth**.',
          12: 'Even the human-readable text is **derived** from it, so it cannot go stale.'
        } } },

    { kind: 'concept', title: 'Look-alike code is not duplicate knowledge',
      body: `The trap runs the other way too. Two pieces of code can look identical and still be **different facts**.

        \`isValidPassword\` requires at least 8 characters, because of the security policy. \`isValidPromoCode\` also requires 8 characters, because that is how marketing prints the codes.

        Merge them into one \`hasMinLength\` and you have tied two unrelated decisions together. The day security wants 12 characters, promo codes break.

        The test: **if one changes, must the other change too?** If yes, it is one piece of knowledge. If not, the similarity is a coincidence.` },

    { kind: 'concept', title: 'The rule of three',
      body: `When should you merge two similar bits of code? A famous rule of thumb: **the rule of three**.

        - First time: just write it.
        - Second time: wince, and copy it, if you must.
        - **Third time**: now you can *see* the pattern, so extract it.

        The reasoning: with only two examples you are guessing what is common and what differs. With three you have evidence.

        It is a guide, not a law. If two copies are clearly the **same fact** (like the VAT rate), merge them straight away.` },

    { kind: 'code', title: 'The wrong abstraction',
      body: 'This is what an early merge turns into after a year of "just one more case".',
      code: { lang: 'js', src: `
        function formatContact(p, mode, short, withTitle) {
          let name = short ? p.first : p.first + ' ' + p.last;
          if (withTitle) name = p.title + ' ' + name;
          if (mode === 'invoice') name = name.toUpperCase();
          if (mode === 'email' && !short) name += ' <' + p.email + '>';
          return name;
        }`,
        notes: {
          1: 'Every caller must now understand a pile of flags.',
          4: 'A branch added for **one** caller, which every other caller now carries.',
          5: 'Another special case. Changing one caller’s output risks all the others.'
        } },
      note: 'Sandi Metz put it memorably: duplication is far cheaper than the wrong abstraction.' },

    { kind: 'pitfall', title: 'Why the wrong abstraction hurts',
      body: `Duplication is annoying but **visible**: you can see two copies and decide what to do.

        A wrong abstraction is **sticky**. Callers depend on it. Each new case gets squeezed in with another flag, and nobody dares undo it because "it is shared".

        The recovery is to **inline** it: copy the shared code back into each caller, delete what each one does not need, and wait for the real pattern to appear.

        So the cost of duplication is real, but so is the cost of merging too early. DRY is about knowledge, not about squashing similar-looking lines.` },

    { kind: 'tip', title: 'Where knowledge hides',
      body: `Knowledge gets duplicated in more places than code:

        - A **constant** repeated as a magic number.
        - The **same rule** in the front end and the back end, such as validation.
        - A **database column** and a matching field, and a form label, and documentation.
        - **Comments** that re-state what the code says.

        Where you can, keep one source and **derive** the rest: generate docs, forms or validation from a single definition, and let code speak for itself instead of repeating it in comments.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'According to DRY, what must have a single authoritative home?',
      options: ['Every piece of knowledge, like a business rule', 'Every line of code that appears more than once', 'Every function name used across the project', 'Every file and folder in the project'],
      answer: 0,
      why: [null, 'Similar lines are not always the same fact. DRY is not about lines.', 'Names are not the issue.', 'Files are a different matter.'],
      explain: 'DRY is about knowledge: a fact or rule the system relies on. Code that merely looks alike is a different question.' },

    { type: 'tf', after: 4, statement: 'Two functions with identical code should always be merged into one.', answer: false,
      explain: 'If they encode different decisions, merging ties them together and one future change will break the other. Ask whether one changing means the other must change.' },

    { type: 'bucket', prompt: 'Same knowledge (merge) or just look-alike (leave apart)?', buckets: ['Same knowledge', 'Look-alike'],
      items: [['The VAT rate used in three calculations', 0], ['Password length 8 and promo code length 8', 1], ['The "max 5 login attempts" rule in the API and in the UI message', 0], ['Two loops that both happen to sum an array', 1], ['The list of valid order statuses in code and in the database check', 0], ['Two screens that both show a 10-item page', 1]],
      explain: 'If the facts must change together, they are one piece of knowledge and belong in one place. If they could change independently, merging them creates hidden coupling.' },

    { type: 'spot', prompt: 'Tap the line where a fact is repeated instead of referenced.',
      code: { lang: 'js', src: `
        const FREE_DELIVERY_OVER = 50;

        function deliveryCost(total) {
          return total >= FREE_DELIVERY_OVER ? 0 : 4.99;
        }

        function basketBanner(total) {
          if (total >= 50) return 'You get free delivery!';
          return 'Spend more for free delivery';
        }` },
      lines: [8],
      explain: 'The threshold is defined once and then re-typed as `50` in the banner. When the offer changes, the banner will lie. It should use the constant.' },

    { type: 'ab', q: 'Which is the healthier approach to two similar-looking pieces of code that serve different teams?',
      a: { lang: 'js', label: 'One flag-driven function', src: `
        function render(data, forFinance, forHr, compact) {
          // branches for every caller
        }` },
      b: { lang: 'js', label: 'Two small functions', src: `
        function renderFinanceView(data) { /* ... */ }
        function renderHrView(data) { /* ... */ }` },
      answer: 'b',
      explain: 'The two views change for different reasons, so a little duplication keeps them independent. A flag-driven function will gain a new parameter for every future difference.' },

    { type: 'cloze', text: 'DRY is about repeated {{knowledge}}, not repeated lines. Wait for the rule of {{three}} before merging code that only looks similar, because a wrong {{abstraction}} is harder to fix than duplication.',
      distractors: ['syntax', 'two', 'comment'],
      explain: 'Three examples show you the real pattern, so the abstraction you extract is far more likely to be the right one.' },

    { type: 'order', prompt: 'Put the rescue of a "wrong abstraction" in order.',
      items: ['Notice every change adds another flag or branch', 'Copy the shared code back into each caller', 'Delete the parts each caller does not need', 'Let the real shared pattern emerge', 'Extract a new abstraction if one is clearly there'],
      explain: 'Undoing the merge first removes the false link. Only then can you see what really is shared and extract something that fits.' },

    { type: 'scenario', title: 'The reviewer’s dilemma', meters: { simplicity: 50, risk: 50 },
      intro: 'In a pull request you spot two functions that look about 80% identical. One handles customer refunds, the other supplier refunds.',
      steps: [
        { text: 'What do you ask the author?',
          choices: [
            { label: 'Whether the refund rules for customers and suppliers must always change together', score: 2, effects: { simplicity: 15, risk: -15 }, feedback: 'That is the right question. If they are the same rule, merge. If they are different policies that look alike, leave them.' },
            { label: 'Merge them with a "type" parameter right now', score: 0, effects: { risk: 20 }, feedback: 'You may be welding two different business rules together. A flag will multiply every future change.' },
            { label: 'Nothing, since duplication is always fine', score: 1, effects: { risk: 5 }, feedback: 'Sometimes true, but you skipped checking whether it is the same knowledge, in which case it will drift.' }
          ] },
        { text: 'It turns out both use the same refund window of 30 days, hard-coded in each. What now?',
          choices: [
            { label: 'Move the 30 days to one named constant and use it in both', score: 2, effects: { risk: -20, simplicity: 10 }, feedback: 'The window is one fact, so it gets one home. The two flows stay separate where they differ.' },
            { label: 'Leave it. The functions are separate', score: 0, effects: { risk: 15 }, feedback: 'The day the policy becomes 14 days, one function will be missed.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain why DRY is about knowledge rather than about identical-looking code, and what the rule of three adds.',
      model: 'DRY says each piece of knowledge, such as a rule or a rate, should live in one authoritative place so a change happens once. Code that looks alike may encode different decisions, so merging it can couple things that should change separately. The rule of three says wait until you have seen the pattern three times before extracting an abstraction, because a wrong abstraction costs more than a little duplication.',
      keywords: ['knowledge', 'single', 'one place', 'rule of three', 'wrong abstraction', 'change together'] }
  ],

  flashcards: [
    { q: 'What does DRY stand for, and who coined it?', a: 'Don’t Repeat Yourself, from The Pragmatic Programmer by Andrew Hunt and David Thomas.' },
    { q: 'What does DRY actually say?', a: 'Every piece of knowledge should have a single, authoritative representation in a system.' },
    { q: 'How do you tell look-alike code from duplicated knowledge?', a: 'Ask: if one changes, must the other change too? If yes, it is one piece of knowledge.' },
    { q: 'What is the rule of three?', a: 'Tolerate a copy the second time and extract an abstraction on the third, once the real pattern is visible.' },
    { q: 'Why is a wrong abstraction worse than duplication?', a: 'It is sticky and shared, so every new case adds another flag and nobody dares undo it. Duplication is at least visible and easy to change.' }
  ],

  glossary: [
    { term: 'DRY', def: 'Don’t Repeat Yourself: every piece of knowledge should have a single authoritative home in a system.', like: 'One phone number, many signs pointing to it.', aka: ['Don’t Repeat Yourself'] },
    { term: 'Single source of truth', def: 'One place where a fact is defined, with everything else derived from it.', like: 'The master copy of a timetable.' },
    { term: 'Rule of three', def: 'A guideline to wait until the third repetition before extracting an abstraction.', like: 'Waiting for three data points before drawing a line.' },
    { term: 'Wrong abstraction', def: 'A shared piece of code built too early on a false pattern, which then grows flags and special cases.', like: 'A one-size-fits-all tool that fits no one.' }
  ],

  takeaways: [
    'DRY is about **knowledge**, not identical-looking lines.',
    'Give each fact one home and derive everything else from it.',
    'If one changing does not force the other to change, leave them apart.',
    'Wait for three examples; a wrong abstraction costs more than duplication.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-yagni', {
  eli5: 'Do not build features or flexibility for a future you are only guessing at: build what you need now, keep the code tidy, and add the rest when it is real.',

  cards: [
    { kind: 'concept', title: '“We might need it one day”',
      body: `In a planning meeting, someone says: *"We should support ten currencies. And plug-in exports. And multiple languages. We might need them one day."*

        **YAGNI** stands for **You Aren't Gonna Need It**. It comes from Extreme Programming, an approach to software development from the 1990s, and the advice is blunt:

        > Do not add something until you actually need it.

        Not "never". Just not **yet**, and not on a guess.` },

    { kind: 'story', title: 'The export system nobody used',
      body: `A team was asked to let customers download their orders as a CSV. Wanting to be "ready", they built an export framework: plug-in formats, a registry, a configuration file, a scheduling engine.

        It took three weeks. Two years later it still supported exactly **one** format, CSV. Nobody ever asked for another. The framework had to be maintained, explained to every newcomer and kept working through every upgrade.

        Meanwhile the one feature customers did request, *filter by date*, was hard to add because it had to fit through all that machinery.` },

    { kind: 'metaphor', title: 'The ten-storey foundation',
      body: `You are building a garden shed. Someone suggests pouring foundations strong enough for a ten-storey block, "in case we expand".

        It costs more, takes longer, and the shed stands there for years. If you do ever want a tower, you will probably want it in a different place with different plans anyway.

        Speculative code is that foundation. You pay now, you carry it forever, and the guess is likely to be wrong in the details.` },

    { kind: 'code', title: 'Before: built for tomorrow',
      body: 'Only email exists. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class NotificationEngine {
          constructor(config) {
            this.channels = loadChannelPlugins(config.pluginDir);
            this.retryPolicy = config.retryPolicy ?? 'exponential';
            this.locale = config.locale ?? 'en-GB';
          }
          send(msg, channel = 'email', opts = {}) {
            return this.channels[channel].deliver(msg, opts);
          }
        }`,
        notes: {
          3: 'A plug-in loader for channels that **do not exist**.',
          4: 'A retry policy nobody has asked for.',
          5: 'Localisation for a product with one language.'
        } } },

    { kind: 'code', title: 'After: what is needed today',
      body: 'The same job, honestly sized.',
      code: { lang: 'js', src: `
        function sendEmail(to, subject, body) {
          return smtp.send({ to, subject, text: body });
        }

        // A second channel is requested?
        // That is the day to introduce a seam, not today.`,
        notes: {
          1: 'Does exactly what is needed, and no more.',
          5: 'The seam arrives with a real second case, at which point you know the right shape.'
        } } },

    { kind: 'compare', title: 'Real versus speculative features',
      body: 'Speculation has four costs, and the benefit is a guess.',
      cols: ['Needed now', 'Might be needed'],
      rows: [
        ['Do we know the requirements?', 'Yes, someone asked', 'No, we are guessing'],
        ['Cost to build', 'Paid, but for something used', 'Paid, probably for nothing'],
        ['Cost to carry', 'Normal upkeep', 'Extra code to read, test and explain'],
        ['Chance the design is right', 'High: real use shapes it', 'Low: the details will differ'],
        ['Cost of waiting', 'Delay a feature someone wants', 'Often nothing at all']
      ] },

    { kind: 'concept', title: 'YAGNI is not “write sloppy code”',
      body: `YAGNI is about **features and flexibility**, not about quality.

        It does **not** say to skip tests, use one-letter names or ignore structure. In fact it **depends** on clean code: you can only afford to wait for a requirement if changing the code later is cheap. Small functions, good tests and clear names keep that door open.

        So the balance is: keep the code **tidy and easy to change**, and keep the code **small and focused on today**. The earlier lessons (SRP, DRY, abstractions) make the second possible.` },

    { kind: 'compare', title: 'Reversible versus hard to reverse',
      body: 'Not every decision costs the same to change later. Spend your thinking where it is expensive to be wrong.',
      cols: ['Cheap to change later', 'Costly to change later'],
      rows: [
        ['Names', 'Internal function and variable names', 'Names in a public API other people use'],
        ['Data', 'Layout of a screen', 'The shape of data stored for millions of customers'],
        ['Structure', 'How a private class is organised', 'URLs and formats that other systems depend on'],
        ['Tools', 'A helper library used in one file', 'The database everything is built on']
      ],
      note: 'YAGNI applies most strongly to the left column. On the right, a little early thought is worth it, which is why design is not banned.' },

    { kind: 'pitfall', title: 'When the need is already known',
      body: `YAGNI is not a reason to ignore what you **already know**.

        If the business has told you "next sprint we launch in Germany", that is a **requirement**, not a guess. Translating strings later may be expensive because of a decision you make today.

        The rule is: do not build for **speculation**. Do plan for **known** requirements and for decisions that are hard to undo.`,
      note: 'Developers argue about where the line sits. A useful test is: has a real person with authority asked for it, with a date? If not, it is a guess.' }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What does YAGNI advise?',
      options: ['Do not build features until you actually need them', 'Never plan or design anything ahead', 'Skip tests to move faster', 'Always copy code instead of sharing it'],
      answer: 0,
      why: [null, 'It is about speculative features, not all thinking. Known requirements and hard-to-undo choices still deserve planning.', 'YAGNI depends on good tests so changes stay cheap.', 'That is unrelated to DRY or YAGNI.'],
      explain: 'The advice is to build for known, present needs and add the rest when it becomes real, keeping the code clean so adding it later is easy.' },

    { type: 'tf', after: 6, statement: 'YAGNI works best when tidy code and good tests make later changes cheap.', answer: true,
      explain: 'Putting a feature off is only safe if adding it later is cheap, and good tests and clean structure provide that. YAGNI is about not building speculative features, not about being careless.' },

    { type: 'spot', prompt: 'Which line is speculative flexibility nobody asked for?',
      code: { lang: 'js', src: `
        function sendInvoice(invoice) {
          const body = renderInvoice(invoice);
          const channels = loadChannelPlugins('./plugins');
          return smtp.send(invoice.email, body);
        }` },
      lines: [3],
      explain: 'Only email is used, so loading channel plug-ins is machinery for a need that does not exist. It adds code to maintain and a hidden dependency on a folder.' },

    { type: 'ab', q: 'The business needs one tax rate today. Which approach respects YAGNI while staying healthy?',
      a: { lang: 'js', label: 'Simple, one home', src: `
        const VAT_RATE = 0.2;
        function addVat(net) { return net * (1 + VAT_RATE); }` },
      b: { lang: 'js', label: 'Tax engine', src: `
        class TaxEngine {
          constructor(rulesLoader, regionResolver, rounding) { }
          calculate(order, region, date) { /* ... */ }
        }` },
      answer: 'a',
      explain: 'One named constant and one small function meets the need and keeps the rate in one place. The tax engine is built for countries and dates nobody has asked about.' },

    { type: 'bucket', prompt: 'Easy to change later, or costly to change later?', buckets: ['Cheap to change', 'Costly to change'],
      items: [['The name of a private helper function', 0], ['The URL structure of a public API', 1], ['The column layout of a table holding millions of rows', 1], ['How a screen arranges its buttons', 0], ['A date format that other systems parse', 1], ['A local variable’s name', 0]],
      explain: 'Anything other people or stored data depend on is hard to undo, so it deserves early thought. Private details can simply be changed when you learn better.' },

    { type: 'cloze', text: 'YAGNI means you should not build for a {{speculative}} future, but it relies on keeping code {{clean}} so that adding things later is {{cheap}}.',
      distractors: ['known', 'fast', 'copied'],
      explain: 'Waiting is only safe if change is cheap, which is what tidy code and good tests buy you.' },

    { type: 'multi', q: 'Which are real costs of a speculative feature?',
      options: ['It must be maintained, tested and explained', 'The guessed design is probably wrong in the details', 'It makes the real features harder to add', 'It speeds up the existing features', 'It lowers the cost of every future change'],
      answers: [0, 1, 2],
      explain: 'Speculative code has to be carried, is likely to miss real needs, and sits in the way. It does not make real work faster.' },

    { type: 'scenario', title: 'The roadmap meeting', meters: { delivery: 50, readiness: 40 },
      intro: 'You are building a small booking app for one salon in one city. In a planning meeting, three suggestions land on the table.',
      steps: [
        { text: 'A colleague suggests multi-currency support "in case we open abroad". The owner says there are no plans to.',
          choices: [
            { label: 'Skip it. Store prices in one place so a currency can be added if it ever becomes real', score: 2, effects: { delivery: 20, readiness: 10 }, feedback: 'You keep the door open cheaply without paying for rooms nobody asked for.' },
            { label: 'Build the full currency and exchange-rate system now', score: 0, effects: { delivery: -25 }, feedback: 'Weeks of work for a guess, and the rest of the app has to carry its complexity.' },
            { label: 'Hard-code pounds in every price string around the app', score: 1, effects: { readiness: -15 }, feedback: 'That saves effort today but scatters a fact. Keeping the currency in one place costs almost nothing.' }
          ] },
        { text: 'The owner mentions: "We are launching a mobile app next month, so the API shape matters." What do you do?',
          choices: [
            { label: 'Spend time on the API design, since it is public and hard to change', score: 2, effects: { readiness: 25, delivery: -5 }, feedback: 'A known requirement and a hard-to-reverse decision. This is exactly where early thought pays.' },
            { label: 'Ignore it under YAGNI', score: 0, effects: { readiness: -25 }, feedback: 'YAGNI is not a licence to ignore known needs, especially ones that are costly to change.' },
            { label: 'Build a plug-in system for every future client type', score: 1, effects: { delivery: -15 }, feedback: 'The need for a good API is real. Plug-ins for imagined clients are not.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain YAGNI, and how it differs from writing sloppy code.',
      model: 'YAGNI, from Extreme Programming, says not to build features or flexibility until they are needed, because speculation costs time, adds code to carry and is usually wrong in the details. It is not about sloppiness: it depends on clean, well-tested code so that adding things later is cheap. Known requirements and decisions that are hard to reverse still deserve early thought.',
      keywords: ['need', 'speculative', 'cost', 'clean', 'reversible', 'requirement'] }
  ],

  flashcards: [
    { q: 'What does YAGNI stand for and where does it come from?', a: 'You Aren’t Gonna Need It, from Extreme Programming: do not add something until you actually need it.' },
    { q: 'Name two costs of a speculative feature.', a: 'It must be maintained, tested and explained; and the guessed design is probably wrong. It can also get in the way of real features.' },
    { q: 'Is YAGNI an excuse for sloppy code?', a: 'No. It relies on clean, tested code so that adding features later stays cheap.' },
    { q: 'Which decisions deserve early thought despite YAGNI?', a: 'Hard-to-reverse ones: public APIs, stored data formats, URLs others depend on.' },
    { q: 'When is a future need not speculation?', a: 'When someone with authority has asked for it, with a date. That is a known requirement.' }
  ],

  glossary: [
    { term: 'YAGNI', def: 'You Aren’t Gonna Need It: do not build something until it is actually needed.', like: 'Not buying a van for a move you have not planned.', aka: ['You Aren’t Gonna Need It'] },
    { term: 'Speculative generality', def: 'Flexibility or features added in case they are needed one day, without a real requirement.', like: 'A shed with ten-storey foundations.' },
    { term: 'Extreme Programming', def: 'A software development approach from the 1990s that stresses small steps, tests and simple design.', like: 'Building in short, careful sprints with constant checks.', aka: ['XP'] },
    { term: 'Reversible decision', def: 'A choice that is cheap to change later, so it is fine to decide quickly.', like: 'Choosing a paint colour rather than a house’s location.' }
  ],

  takeaways: [
    'Build for **today’s** known requirements, not for guesses.',
    'Speculation costs build time, carrying cost, and often the wrong shape.',
    'YAGNI needs clean code and tests so later change is cheap.',
    'Think early about the decisions that are hard to undo.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-demeter', {
  eli5: 'An object should only talk to the things it directly knows, not reach through one object to poke at another one behind it, like asking a friend for the salt rather than rummaging in their pocket.',

  cards: [
    { kind: 'concept', title: 'The train wreck',
      body: `You have probably written a line like this:

        \`\`\`js
        order.getCustomer().getAddress().getCountry().getCode()
        \`\`\`

        Four dots. Each one reaches **through** an object to grab another one behind it. Your code now knows that an order has a customer, which has an address, which has a country, which has a code.

        This is nicknamed a **train wreck**: carriages coupled in a line, and when one derails they all do. The **Law of Demeter** says: *only talk to your immediate friends.* (The name comes from a university project called Demeter; it is a guideline, not a physical law.)` },

    { kind: 'code', title: 'Before: reaching through strangers',
      body: 'Tap the highlighted lines.',
      code: { lang: 'js', src: `
        function shippingFor(order) {
          const code = order.customer.address.country.code;
          return code === 'GB' ? 3.99 : 12.5;
        }

        function chargeWallet(order, amount) {
          order.customer.wallet.balance -= amount;
        }`,
        notes: {
          2: 'This function now knows the **structure of four objects**. If any of them is reshaped, this breaks.',
          7: 'Worse: it reaches in and changes a wallet that belongs to somebody else, bypassing any rules the wallet has.'
        } } },

    { kind: 'metaphor', title: 'Walking the dog',
      body: `You want your dog to walk. You say "walk" **to the dog**. You do not give separate orders to each of its legs.

        And if you want your friend to pass the salt, you ask the friend. You do not reach into their pocket to find where they keep it.

        You talk to **the thing in front of you**, and trust it to deal with its own insides. The Law of Demeter is the same good manners applied to objects.` },

    { kind: 'concept', title: 'Who counts as a friend?',
      body: `A method should only call methods on:

        1. **Itself** (\`this\`)
        2. Its **parameters**
        3. Objects it **creates** itself
        4. Its own **direct fields** (the things it holds)

        Anything you get **back** from one of those is a stranger. Do not keep reaching through it.

        A rough shorthand is "only use one dot". That is a handy smell test, but the real point is **how much of the world's structure your code has to know**.` },

    { kind: 'code', title: 'After: ask the friend',
      body: 'Each object answers questions about itself and hides what is behind it.',
      code: { lang: 'js', src: `
        class Order {
          shipsDomestically() {
            return this.customer.isInCountry('GB');
          }
        }

        class Customer {
          isInCountry(code) { return this.address.country.code === code; }
          pay(amount) { this.wallet.withdraw(amount); }
        }

        function shippingFor(order) {
          return order.shipsDomestically() ? 3.99 : 12.5;
        }`,
        notes: {
          3: 'The order only talks to its own friend, the customer.',
          8: 'Only `Customer` knows that addresses have countries. That knowledge now has **one** home.',
          13: 'The caller asks the order a question that makes sense in the business, not a path through four objects.'
        } } },

    { kind: 'diagram', title: 'How far the knowledge spreads',
      body: 'Before: the function is coupled to everything along the chain. After: only to one friend.',
      nodes: [
        { id: 'fn', label: 'shippingFor()', x: 1, y: 0, tone: 'accent' },
        { id: 'o', label: 'Order', x: 1, y: 1 },
        { id: 'c', label: 'Customer', x: 1, y: 2 },
        { id: 'a', label: 'Address', x: 1, y: 3 },
        { id: 'k', label: 'Country', x: 1, y: 4 }
      ],
      edges: [
        { from: 'fn', to: 'o', label: 'friend' },
        { from: 'o', to: 'c', dashed: true }, { from: 'c', to: 'a', dashed: true }, { from: 'a', to: 'k', dashed: true }
      ],
      caption: 'With the chain, shippingFor() would also point at Customer, Address and Country. Demeter keeps it pointing at Order only.' },

    { kind: 'pitfall', title: 'What the rule protects you from',
      body: `Breaking Demeter costs you in three ways:

        - **Changes ripple.** Move \`country\` from \`Address\` onto \`Customer\`, and every chain that mentioned it breaks, across the whole codebase.
        - **Crashes in the middle.** If \`customer.address\` is missing, the chain dies with "cannot read properties of undefined", far from the cause.
        - **Painful tests.** To test \`shippingFor\`, you must build an order, customer, address and country just to reach one field.

        Hiding the path behind a method makes all three go away.` },

    { kind: 'compare', title: 'When a chain is perfectly fine',
      body: 'The rule is about reaching through **objects with behaviour and secrets**. Some chains are harmless.',
      cols: ['Fine', 'Smell'],
      rows: [
        ['Fluent builders', '`query.where(a).orderBy(b).limit(5)` returns the same object each time', 'Reaching into other objects’ internals'],
        ['Plain data', '`config.server.port`, a JSON-like structure with no behaviour', '`order.customer.wallet.balance -= x`'],
        ['Same-type chains', '`name.trim().toLowerCase()` on strings', 'Chains that cross several different types'],
        ['Stable standard shapes', 'Standard library results you do not own', 'Your own domain objects, which change']
      ] },

    { kind: 'tip', title: 'Do not make a wrapper for everything',
      body: `Over-applying Demeter produces a mess of tiny methods that do nothing but pass the call along: \`getCustomerAddressCountryCode()\`. Those "middle men" are just a train wreck moved indoors.

        A better test is: **does this method answer a question the business would recognise?** \`order.shipsDomestically()\` does. \`order.getCountryCode()\` is borderline. A long forwarding method is a smell.

        Treat the law as a **guideline**. Experts disagree on how strictly to enforce it, and plain data chains are widely accepted.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'Which of these is NOT someone a method may freely talk to under the Law of Demeter?',
      options: ['An object a friend’s method hands back', 'Objects stored in its own fields', 'Objects passed in as its parameters', 'Objects it creates with `new` itself'],
      answer: 0,
      why: [null, 'Fields are direct friends.', 'Parameters are friends: they were handed to you.', 'You made it, so you know it.'],
      explain: 'Anything you get back from a friend is a stranger. Reaching through it means you now depend on its structure.' },

    { type: 'tf', after: 6, statement: 'A fluent builder like `query.where(a).orderBy(b).limit(5)` is a serious violation of the Law of Demeter.', answer: false,
      explain: 'Each call returns the same builder, so you are still talking to one friend. The law targets reaching into other objects’ internals, not method chaining as such.' },

    { type: 'spot', prompt: 'Tap the line that reaches through strangers.',
      code: { lang: 'js', src: `
        function printLabel(order) {
          const name = order.customer.name;
          const city = order.customer.address.town.name;
          return name + ', ' + city;
        }` },
      lines: [3],
      explain: 'Line 3 walks through customer, address and town. The function now depends on how addresses are structured. An `order.deliveryTown()` method would hide that path.' },

    { type: 'ab', q: 'Which version is better for the caller?',
      a: { lang: 'js', label: 'Tell the friend', src: `
        function canCheckout(cart) {
          return cart.isWithinLimit();
        }` },
      b: { lang: 'js', label: 'Walk the chain', src: `
        function canCheckout(cart) {
          return cart.owner.account.limit >= cart.total;
        }` },
      answer: 'a',
      explain: 'The first only knows the cart. How limits work can change without touching this function. The second depends on the cart’s owner, their account and its limit field.' },

    { type: 'bucket', prompt: 'Is this chain fine, or a Demeter smell?', buckets: ['Fine', 'Smell'],
      items: [['name.trim().toLowerCase()', 0], ['order.customer.address.country.code', 1], ['config.server.port', 0], ['basket.owner.wallet.balance -= total', 1], ['builder.setName(n).setSize(s).build()', 0], ['invoice.supplier.bank.accounts[0].iban', 1]],
      explain: 'Same-object chains (fluent APIs) and plain data are fine. Navigating through behaviour-rich domain objects couples you to their structure.' },

    { type: 'cloze', code: true, text: 'class Order {\n  shipsDomestically() {\n    return this.customer.{{isInCountry}}(\'GB\');\n  }\n}\n// the caller only talks to its {{friend}}, the order',
      distractors: ['address', 'stranger', 'getCountry'],
      explain: 'The customer answers a business-level question about itself, so the order never learns what an address looks like.' },

    { type: 'multi', q: 'Which are real benefits of following the Law of Demeter?',
      options: ['A change to an inner object’s structure affects fewer callers', 'Tests need fewer objects set up', 'Failures happen closer to their cause', 'The code has fewer methods overall', 'You never need to write forwarding methods'],
      answers: [0, 1, 2],
      explain: 'Less structure knowledge means less ripple, simpler tests and clearer failures. It often adds some small methods, so it is a trade-off.' },

    { type: 'scenario', title: 'The renamed field', meters: { breakage: 60, tidiness: 40 },
      intro: 'The team moves the country from Address to a new Region object. A build shows 47 compile errors, all in lines like `order.customer.address.country.code`.',
      steps: [
        { text: 'How do you fix the 47 places?',
          choices: [
            { label: 'Add Customer.isInCountry(code) and replace the chains with it', score: 2, effects: { breakage: -30, tidiness: 25 }, feedback: 'The structure knowledge now lives in one method. The next reshuffle touches one line.' },
            { label: 'Edit each of the 47 chains to the new path', score: 1, effects: { breakage: -15, tidiness: -10 }, feedback: 'It works today, and tomorrow’s reshuffle will cost another 47 edits.' },
            { label: 'Revert the change so nothing needs fixing', score: 0, effects: { tidiness: -15 }, feedback: 'The design is now frozen by the chains, and the problem remains.' }
          ] },
        { text: 'A teammate then adds getCountryCodeOfCustomerOfOrder() to Order. Your view?',
          choices: [
            { label: 'Prefer a business-level method like shipsDomestically() over a forwarding one', score: 2, effects: { tidiness: 20 }, feedback: 'Methods should answer real questions, not simply relay a path.' },
            { label: 'Great, that is exactly what Demeter wants', score: 0, effects: { tidiness: -15 }, feedback: 'It hides the chain but exposes the same detail, a train wreck moved indoors.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain the Law of Demeter, what it protects you from, and when a chain of calls is fine.',
      model: 'Only talk to your immediate friends: yourself, your parameters, things you create and your direct fields. Reaching through one object to another couples you to the structure of objects you should not know, so changes ripple, failures appear in the middle of chains and tests need lots of setup. Chains are fine when they are fluent builders returning the same object, or when they navigate plain data with no behaviour.',
      keywords: ['friends', 'chain', 'coupling', 'structure', 'fluent', 'plain data'] }
  ],

  flashcards: [
    { q: 'State the Law of Demeter.', a: 'A method should only talk to itself, its parameters, objects it creates and its direct fields: its immediate friends.' },
    { q: 'What is a train wreck?', a: 'A long chain of calls like a.getB().getC().getD(), which couples you to the structure of every object on the way.' },
    { q: 'Name three problems Demeter violations cause.', a: 'Changes ripple through every chain, failures appear mid-chain, and tests need heavy setup.' },
    { q: 'When is chaining fine?', a: 'With fluent builders that return the same object, and with plain data structures that have no behaviour.' },
    { q: 'How can you over-apply Demeter?', a: 'By adding many pointless forwarding methods. Prefer methods that answer real business-level questions.' }
  ],

  glossary: [
    { term: 'Law of Demeter', def: 'A guideline: only talk to your immediate friends, and do not reach through one object to get to another.', like: 'Asking your friend to pass the salt instead of rummaging in their pocket.', aka: ['principle of least knowledge'] },
    { term: 'Train wreck', def: 'A long chain of method calls that reaches through several objects.', like: 'Carriages coupled in a line: one derails, all derail.' },
    { term: 'Fluent API', def: 'An interface where each method returns the same object so calls can be chained into a readable sentence.', like: 'Ordering a coffee one option at a time to the same barista.', aka: ['method chaining'] },
    { term: 'Middle man', def: 'A method or class that does nothing except forward a call to another object.', like: 'A receptionist who just says "ask accounting".' }
  ],

  takeaways: [
    'Talk to your friends: yourself, parameters, creations, direct fields.',
    'Long chains couple you to structure that is not yours to know.',
    'Fluent builders and plain data chains are fine.',
    'Prefer business-level methods to pass-through ones.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dp-tell-dont-ask', {
  eli5: 'Instead of asking an object for its data and then deciding what to do yourself, tell the object what you want and let it use its own data to do it.',

  cards: [
    { kind: 'concept', title: 'The clerk and the safe',
      body: `Picture two ways to withdraw cash.

        **Ask:** you walk behind the counter, read the balance from the ledger, decide you have enough, and cross out the number and write a smaller one.

        **Tell:** you say "I would like £50, please", and the clerk checks, deducts and hands it over.

        The first way is absurd in a bank, yet a lot of code works like it. **Tell, Don't Ask** says: *tell objects what to do, rather than pulling out their data and making the decision for them.*` },

    { kind: 'code', title: 'Before: asking',
      body: 'The caller interrogates the account, then decides. Tap the lines.',
      code: { lang: 'js', src: `
        function withdraw(account, amount) {
          if (account.getBalance() >= amount) {
            account.setBalance(account.getBalance() - amount);
            return true;
          }
          return false;
        }`,
        notes: {
          2: 'The caller pulls out the balance and applies the **account’s own rule** ("do not go overdrawn").',
          3: 'And then writes the new value back. Every other caller must repeat this rule correctly.'
        } } },

    { kind: 'metaphor', title: 'The waiter and the kitchen',
      body: `You tell the waiter "steak, medium". You do not walk into the kitchen, check the fridge, count the steaks, and then decide whether the restaurant can serve you.

        The kitchen knows its stock. The decision belongs where the information is.

        When you see code that **fetches** information from an object, **thinks about it**, and then **changes that same object**, that decision is probably in the wrong place.` },

    { kind: 'code', title: 'After: telling',
      body: 'The rule moves inside the account, next to the data it protects.',
      code: { lang: 'js', src: `
        class Account {
          #balance = 0;

          withdraw(amount) {
            if (amount > this.#balance) {
              throw new Error('Insufficient funds');
            }
            this.#balance -= amount;
          }
        }

        account.withdraw(50);`,
        notes: {
          2: 'The balance is **private**. Nobody outside can decide things on its behalf.',
          6: 'The rule lives with the data, in **one** place.',
          12: 'The caller states what it wants. The account decides how.'
        } } },

    { kind: 'sequence', title: 'Ask versus tell',
      body: 'The same job, two conversations.',
      actors: ['Checkout', 'Account'],
      steps: [
        { note: '**Ask style:** the caller does the thinking.' },
        { from: 0, to: 1, label: 'getBalance()', note: 'Pulls data out.' },
        { from: 1, to: 0, label: '120', dashed: true, note: 'Now the caller holds a number it should not need.' },
        { at: 0, label: 'decide: 120 >= 50', note: 'The account’s rule is evaluated in the caller.' },
        { from: 0, to: 1, label: 'setBalance(70)', note: 'The caller writes the result back.' },
        { note: '**Tell style:** one message.' },
        { from: 0, to: 1, label: 'withdraw(50)', note: 'The account checks, updates and enforces its own rules.' }
      ] },

    { kind: 'concept', title: 'Behaviour belongs next to its data',
      body: `A practical rule: whenever you see **get, decide, set** on the *same* object, move the decision *into* that object.

        This keeps rules in **one place**. If the overdraft policy changes, you edit \`Account.withdraw\`, and every caller benefits. With the "ask" style, each caller has its own copy of the rule, and some will be wrong.

        It also protects **invariants** (the rules that must always hold, such as "balance never negative"): only the account's own methods can change the balance, so only they have to get it right.` },

    { kind: 'concept', title: 'The link to anemic models',
      body: `In the object-oriented module you met **anemic** models: objects that are only bags of fields with getters and setters, while all the logic sits in "service" classes outside.

        Anemic models are Tell Don't Ask turned upside down. The services **ask** for every field and decide on the objects' behalf.

        Moving the rules into the objects is how you grow a **rich** model: objects that guard their own data. It is also **encapsulation** doing its real job: hiding the data **and** keeping the logic that protects it close by.` },

    { kind: 'pitfall', title: 'It is not a ban on getters',
      body: `Sometimes you **do** need to ask. Showing a balance on screen, writing a report or sending data to a template means getting information out, and that is fine. Telling does not work for pure questions.

        Also be honest about the other camp: in a **functional** style, programmers deliberately keep data plain and put the logic in separate functions. That is a legitimate alternative design, not a mistake.

        Tell, Don't Ask is a guide for objects that **guard rules**. Where there is a rule to protect, tell. Where you are just reading, ask.` },

    { kind: 'tip', title: 'A refactoring recipe',
      body: `1. Find a caller that calls a getter and then a setter on the same object.
        2. Notice what **decision** sits between them.
        3. Move that decision into a new method on the object, named for **intent** (\`withdraw\`, not \`setBalance\`).
        4. Make the field private, and delete the setter if nothing else needs it.

        Names matter: *withdraw*, *approve*, *cancel* tell a story. *setStatus* only moves a number.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'What is Tell, Don’t Ask advising?',
      options: ['Tell an object to act instead of deciding for it with its data', 'Avoid getter methods: every field should stay private', 'Always send messages between objects over a network', 'Ask your teammates before you change someone else’s class'],
      answer: 0,
      why: [null, 'Getters are fine for reading and display. The advice is about decisions.', 'It is about method calls between objects, not networks.', 'It is about code design, not communication between people.'],
      explain: 'Decisions that depend on an object’s data belong inside that object. Callers state their intent and trust the object to apply its own rules.' },

    { type: 'tf', after: 7, statement: 'Tell, Don’t Ask means an object may never expose any data for reading.', answer: false,
      explain: 'Displaying values or building reports needs reading data, and that is fine. The principle targets cases where callers pull data out to make decisions that belong to the object.' },

    { type: 'spot', prompt: 'Tap the line where the caller is making the order’s decision for it.',
      code: { lang: 'js', src: `
        function cancel(order) {
          if (order.getStatus() === 'PLACED') {
            order.setStatus('CANCELLED');
          }
        }` },
      lines: [2],
      explain: 'The caller reads the status and applies the cancellation rule. That rule belongs in `order.cancel()`, which can check its own status and keep the rule in one place.' },

    { type: 'ab', q: 'Which design follows Tell, Don’t Ask?',
      a: { lang: 'js', label: 'Ask', src: `
        if (cart.getItems().length > 0) {
          cart.setCheckedOut(true);
        }` },
      b: { lang: 'js', label: 'Tell', src: `
        cart.checkout();` },
      answer: 'b',
      explain: 'The cart can check whether it has items and set its own state. Callers cannot forget the rule, and the rule has one home.' },

    { type: 'bucket', prompt: 'Is this code telling an object, or asking it for data to decide elsewhere?', buckets: ['Tell', 'Ask'],
      items: [['account.withdraw(50)', 0], ['if (account.getBalance() > 50) account.setBalance(...)', 1], ['order.cancel()', 0], ['if (order.getStatus() === \'PLACED\') order.setStatus(...)', 1], ['invoice.markPaid(date)', 0], ['if (!user.getEmail()) user.setActive(false)', 1]],
      explain: 'Tell-style calls name an intent and let the object apply its rules. Ask-style code pulls out state and makes the decision outside.' },

    { type: 'cloze', code: true, text: 'class Order {\n  {{cancel}}() {\n    if (this.status !== \'PLACED\') throw new Error(\'Too late\');\n    this.status = \'CANCELLED\';\n  }\n}\norder.cancel(); // we {{tell}} the order, we do not ask',
      distractors: ['setStatus', 'ask', 'getStatus'],
      explain: 'A method named for the intent holds the rule. The caller says what it wants, not how the order should change.' },

    { type: 'order', prompt: 'Put the refactoring steps in order.',
      items: ['Find a getter followed by a setter on the same object', 'Spot the decision made between them', 'Move the decision into a method named for the intent', 'Make the field private', 'Remove the setter if nothing needs it'],
      explain: 'You find the pattern, identify the rule, move it home, and only then can you safely close off direct access.' },

    { type: 'scenario', title: 'The refund service', meters: { safety: 40, clarity: 40 },
      intro: 'A RefundService reads order.getTotal(), order.getRefunded() and order.getStatus(), decides whether a refund is allowed, then calls order.setRefunded(...) and order.setStatus(...). Three other services copy the same logic with small differences.',
      steps: [
        { text: 'A bug shows one service allowing a refund on a cancelled order. What is the best fix?',
          choices: [
            { label: 'Move the refund rule into Order.refund(amount) and make the services call it', score: 2, effects: { safety: 35, clarity: 25 }, feedback: 'The rule now has one home next to the data. All four services get the fix, and none can forget the check.' },
            { label: 'Patch the one service that has the bug', score: 1, effects: { safety: 5 }, feedback: 'It fixes today’s bug. The next copy of the rule will drift again.' },
            { label: 'Add a comment above each copy: "keep in sync"', score: 0, effects: { clarity: -10 }, feedback: 'Comments cannot enforce a rule. The structure has to.' }
          ] },
        { text: 'Someone says: "so all getters should now be deleted." What do you say?',
          choices: [
            { label: 'Keep the ones needed for display and reports. The rule is about decisions', score: 2, effects: { clarity: 15 }, feedback: 'Reading data to show it is fine. The aim is to stop callers deciding on the object’s behalf.' },
            { label: 'Yes, delete every getter', score: 0, effects: { clarity: -15 }, feedback: 'Screens and reports will break, and you will end up inventing awkward workarounds.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain Tell, Don’t Ask and how it connects to encapsulation and anemic models.',
      model: 'Tell, Don’t Ask says to tell an object what to do rather than pulling out its data and making the decision elsewhere. Moving the rule next to the data keeps it in one place and protects the object’s invariants, which is encapsulation doing its job. Anemic models are the opposite: objects are bags of getters and setters while services ask for the data and decide. Reading data purely to display it is still fine.',
      keywords: ['tell', 'ask', 'behaviour', 'data', 'encapsulation', 'anemic', 'rule'] }
  ],

  flashcards: [
    { q: 'State Tell, Don’t Ask.', a: 'Tell objects what to do rather than asking for their data and making the decision for them.' },
    { q: 'What code pattern signals a violation?', a: 'Calling a getter, making a decision, then calling a setter on the same object.' },
    { q: 'Where should the decision go?', a: 'Into a method on the object that owns the data, named for the intent (such as withdraw or cancel).' },
    { q: 'How does Tell, Don’t Ask relate to anemic models?', a: 'Anemic models are what you get when callers always ask and decide. Moving behaviour into objects builds a rich model.' },
    { q: 'When is asking acceptable?', a: 'For pure reading such as display and reports, and in deliberately functional designs that keep data and logic separate.' }
  ],

  glossary: [
    { term: 'Tell, Don’t Ask', def: 'A guideline: tell objects what to do instead of pulling out their data and deciding for them.', like: 'Telling the waiter your order, rather than checking the kitchen stock yourself.', aka: ['TDA'] },
    { term: 'Intent-revealing method', def: 'A method named for what the caller wants to achieve, such as withdraw, rather than for how state changes, such as setBalance.', like: 'Pressing "lock" rather than manually turning each pin.' },
    { term: 'Getter and setter', def: 'Methods that simply read or write a field, exposing an object’s data directly.', like: 'A window into a house instead of a doorbell.' }
  ],

  takeaways: [
    'Get, decide, set on one object? Move the decision inside it.',
    'Rules live with the data they protect, in one place.',
    'Name methods for **intent**: withdraw, cancel, approve.',
    'Reading data to display it is fine; this is about decisions.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('principles', {
  title: 'The Spaghetti Hydra',
  intro: 'Cut off one tangled dependency and two more grow back. Prove you know why each principle exists, and when to leave it alone, and the hydra falls.',
  questions: [
    { type: 'mcq', q: 'A Notifier is built from a channel and a priority it holds in fields, and passes work on to them. What is this called?',
      options: ['Composition with delegation', 'Multiple inheritance', 'A god class', 'Dependency inversion'],
      answer: 0,
      explain: 'Holding parts in fields and handing them the work is composition plus delegation. It avoids a subclass for every combination.' },

    { type: 'tf', statement: 'The Open/Closed Principle says a released class may never be edited, not even to fix a bug.', answer: false,
      explain: 'It concerns adding new behaviour as new code at plug-in points, rather than reopening working code for every new case. Bug fixes are normal.' },

    { type: 'spot', prompt: 'This breaks the Liskov Substitution Principle. Tap the line.',
      code: { lang: 'js', src: `
        class Account {
          withdraw(amount) { /* pay out */ }
        }
        class FixedDeposit extends Account {
          withdraw(amount) { throw new Error('Locked for 12 months'); }
        }` },
      lines: [5],
      explain: 'Any code that withdraws from "an Account" will crash on a fixed deposit. A subtype must keep the parent’s promises, so the hierarchy should be reshaped.' },

    { type: 'ab', q: 'Which design follows the Dependency Inversion Principle?',
      a: { lang: 'ts', label: 'Policy owns it', src: `
        // billing/ports.ts
        interface Notifier { send(msg: string): void; }
        // infra/sms.ts
        import { Notifier } from '../billing/ports';
        class SmsNotifier implements Notifier { }` },
      b: { lang: 'ts', label: 'Detail owns it', src: `
        // infra/sms.ts
        export class SmsNotifier { sendSms(n: string) { } }
        // billing/service.ts
        import { SmsNotifier } from '../infra/sms';` },
      answer: 'a',
      explain: 'In the first, the low-level code imports the high-level module’s interface, so the arrow points up. In the second billing imports the detail directly.' },

    { type: 'bucket', prompt: 'Which principle does each smell point to?', buckets: ['SRP', 'ISP', 'DRY'],
      items: [['One class that SQL, HTML and email code all live in', 0], ['A class forced to implement methods that throw "not supported"', 1], ['The same tax rate typed in five places', 2], ['Two teams keep getting merge conflicts in one file', 0], ['A test needs a 20-method fake to call one method', 1], ['A rule changed in the API but not the form validation', 2]],
      explain: 'Several actors in one class is SRP, a bloated contract is ISP, and one fact copied into many places is DRY.' },

    { type: 'cloze', text: 'In the Hollywood Principle, "don’t call us, we’ll call you" describes inversion of {{control}}, where a {{framework}} calls your code. Passing a class its helpers from outside is dependency {{injection}}.',
      distractors: ['inheritance', 'library', 'inversion'],
      explain: 'Inversion of control is the broad idea, injection is one technique, and "inversion" on its own names a different principle (DIP).' },

    { type: 'order', prompt: 'Put the steps of fencing off a changing rule in order.',
      items: ['Notice the rule has changed several times', 'Name the idea behind it', 'Decide the one question callers need to ask', 'Move the rule behind that question', 'Replace every copy with a call'],
      explain: 'You identify and name what varies before designing its front door, and only then can you swap the scattered copies for calls.' },

    { type: 'mcq', q: 'Two functions both check `length >= 8`: one for passwords, one for promo codes. What should you do?',
      options: ['Leave them apart, because they are different knowledge that happens to look alike', 'Merge them straight away, because DRY forbids any repeated code', 'Merge them and add a flag to tell them apart', 'Delete one and use the other for both'],
      answer: 0,
      why: [null, 'DRY is about knowledge, not identical-looking code.', 'A flag is the start of the wrong abstraction.', 'You would couple a security rule to a marketing format.'],
      explain: 'Security policy and promo code format change for different reasons. A false merge links them, and duplication is cheaper than the wrong abstraction.' },

    { type: 'multi', q: 'Which of these are good reasons to add an abstraction (interface) around something?',
      options: ['It is slow or external, such as a payment provider', 'A fake would make tests simple and fast', 'The implementation is likely to be swapped', 'It is a private helper used in one place', 'Every class should have one by default'],
      answers: [0, 1, 2],
      explain: 'Boundaries, testing and real variation justify a seam. Wrapping everything adds indirection and little else.' },

    { type: 'match', prompt: 'Match each principle to its core idea.',
      pairs: [['YAGNI', 'Do not build for needs you are only guessing at'], ['Law of Demeter', 'Talk to your immediate friends, not strangers behind them'], ['Tell, Don’t Ask', 'Move decisions into the object that owns the data'], ['Interface Segregation', 'No client depends on methods it does not use'], ['Single Responsibility', 'A class answers to one actor']],
      explain: 'Each is a different angle on the same goal: keep change local and knowledge in one place.' },

    { type: 'spot', prompt: 'This is a Law of Demeter smell that also breaks encapsulation. Tap the line.',
      code: { lang: 'js', src: `
        function applyDiscount(basket) {
          const rate = basket.owner.membership.discountRate;
          const total = basket.getTotal();
          basket.owner.wallet.balance -= total * (1 - rate);
        }` },
      lines: [4],
      explain: 'The function reaches through the owner into their wallet and changes the balance directly, bypassing any rules the wallet has. It should tell the owner to pay.' },

    { type: 'tf', statement: 'Dependency injection and the Dependency Inversion Principle are the same thing.', answer: false,
      explain: 'DIP is a principle about the direction of dependencies and who owns the abstraction. Injection is a technique for supplying an object’s helpers, and you can use one without the other.' },

    { type: 'short', q: 'Which letter of SOLID stands for the idea that a subclass must work wherever its parent does?',
      accept: ['L', 'Liskov', 'LSP', 'Liskov substitution', 'Liskov principle'], hint: 'It is named after Barbara Liskov.',
      explain: 'L is for Liskov Substitution: a subtype must be usable wherever its base type is expected, without surprises.' }
  ]
});

KS.sheet('principles', {
  title: 'Design principles cheat sheet',
  sections: [
    { title: 'SOLID at a glance',
      md: `| Letter | Principle | One line |
        |---|---|---|
        | S | Single Responsibility | One class, one actor, one reason to change |
        | O | Open/Closed | Extend with new code; do not reopen old code |
        | L | Liskov Substitution | A subtype must work wherever its parent does |
        | I | Interface Segregation | No client depends on methods it does not use |
        | D | Dependency Inversion | Policy and detail both depend on abstractions the policy owns |` },

    { title: 'Building blocks',
      md: `- **Composition over inheritance**: has-a beats is-a for adding variety. Delegate to swappable parts.
        - **Encapsulate what varies**: find the changing part, give it one home behind a stable interface.
        - **Program to an interface**: depend on *what*, not *how*. Interfaces are **seams** for fakes and swaps.
        - **Hollywood Principle**: the framework calls you (inversion of control). Callbacks, hooks, events.
        - Inheritance is still fine for a genuine, shallow is-a.` },

    { title: 'DRY, YAGNI, and judgement',
      md: `| Idea | Means | Watch out |
        |---|---|---|
        | **DRY** | One authoritative home per piece of *knowledge* | Look-alike code is not always duplicate knowledge |
        | **Rule of three** | Extract on the third repeat | The wrong abstraction costs more than duplication |
        | **YAGNI** | Build for today’s known needs | Not an excuse for sloppy code or ignoring hard-to-undo choices |` },

    { title: 'Law of Demeter and Tell, Don’t Ask',
      md: `- **Demeter**: a method talks only to itself, its parameters, things it creates and its direct fields.
        - Smell: \`a.b().c().d()\` through domain objects. **Fine**: fluent builders, plain data, \`str.trim().toLowerCase()\`.
        - **Tell, Don’t Ask**: get, decide, set on one object means move the decision *into* it.
        - Name methods for **intent**: \`withdraw\`, \`cancel\`. Reading data to display it is fine.` },

    { title: 'Liskov checklist',
      md: `A subtype must **not**:
        - demand more from callers (stricter preconditions)
        - promise less back (weaker postconditions)
        - throw new, surprising exceptions
        - break the parent’s invariants (Square/Rectangle)

        Warning signs: \`throw new Error('not supported')\` in an override, and callers that check \`instanceof\`.` },

    { title: 'DIP, injection and IoC',
      md: `| Term | Kind | Answers |
        |---|---|---|
        | Dependency Inversion | Principle | Who depends on whom? Who owns the interface? |
        | Dependency injection | Technique | How does an object get its helper? |
        | IoC container | Tool | Who builds and wires everything? |

        Real DIP: the interface lives with the **policy**, in the policy’s words.` },

    { title: 'Common mistakes',
      md: `- Interfaces with one implementation and no reason to change.
        - Plug-in points built before a second case exists.
        - Merging look-alike code into a flag-driven function.
        - Splitting classes or interfaces into dust.
        - Forwarding methods that just relay a train wreck.
        - Treating any principle as law. They are **guides**; judge by what changes together.` }
  ]
});

