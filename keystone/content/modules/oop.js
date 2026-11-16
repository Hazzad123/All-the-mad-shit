/* Module: oop — Object-Oriented Design.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs oop */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-encapsulation', {
  eli5: 'Encapsulation means keeping a thing’s data and the rules that protect it together in one place, and hiding the insides so nobody can reach in and break the rules.',

  cards: [
    { kind: 'concept', title: 'Anyone can set the balance to a million',
      body: `Here is a bank account in code. It has an owner and a balance, and both are just plain fields:

        \`\`\`js
        const acc = new BankAccount('Sam');
        acc.balance = 1000000;
        \`\`\`

        Nothing stopped that. Nothing stopped \`acc.balance = -50\` either, or \`acc.balance = 'lots'\`.

        Every other piece of code in the program can reach in and change the number directly, so every other piece of code has to *remember the rules* of a bank account. One forgetful line and the books are wrong.

        **Encapsulation** is the fix: put the data and the rules that guard it **in the same place**, and keep the data out of reach.` },

    { kind: 'metaphor', title: 'The vending machine',
      body: `A vending machine holds crisps, coins and a little computer. You touch none of them.

        You get a **coin slot**, some **buttons** and a **tray**. That is the whole interface. If you push a button without paying, the machine refuses. If you put in the wrong coin, it spits it out.

        You cannot reach in and grab the crisps, because the *rules* ("pay first, one packet per payment") live inside the machine, guarded by its casing.

        A well-encapsulated object is a vending machine: a few buttons on the outside, the stock and the rules hidden inside.`,
      note: 'Where it stops being true: a real machine can be picked open with a crowbar. In most languages the privacy of code is enforced by the language itself, which is stronger.' },

    { kind: 'code', title: 'Before: the data is just lying there',
      body: 'This works until the first mistake. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class BankAccount {
          constructor(owner) {
            this.owner = owner;
            this.balance = 0;
          }
        }

        const acc = new BankAccount('Sam');
        acc.balance = 1000000;
        acc.balance = -50;`,
        notes: {
          4: 'A plain public field. Any code anywhere can read **and overwrite** it.',
          9: 'No deposit, no record, no check. Free money.',
          10: 'A negative balance might be allowed for an overdraft, but this was never a *decision*. It just was not prevented.'
        } } },

    { kind: 'code', title: 'After: the rules live with the data',
      body: `The balance is now **private**, so only methods of the class can touch it. (Plain JavaScript marks a private field with \`#\`. TypeScript, Java and C# have a \`private\` keyword; plain JavaScript relies on \`#\`, which the language genuinely enforces.)`,
      code: { lang: 'js', src: `
        class BankAccount {
          #balance = 0;
          #history = [];

          deposit(amount) {
            if (amount <= 0) throw new Error('Deposit must be positive');
            this.#balance += amount;
            this.#history.push({ type: 'deposit', amount });
          }

          withdraw(amount) {
            if (amount <= 0 || amount > this.#balance) throw new Error('Refused');
            this.#balance -= amount;
            this.#history.push({ type: 'withdraw', amount });
          }

          get balance() {
            return this.#balance;
          }
        }`,
        notes: {
          2: 'The `#` makes this field **private**. Code outside the class cannot read or write it: it is a syntax error.',
          6: 'The rule "deposits are positive" lives right next to the data it protects.',
          12: 'The rule "you cannot take out more than you have" is enforced in one place, for everyone.',
          17: 'A read-only window onto the balance. There is no matching setter, on purpose.'
        } } },

    { kind: 'pitfall', title: 'Getters and setters that leak',
      body: `Hiding a field behind \`getX()\` and \`setX()\` looks like encapsulation. Often it is not.

        If \`setBalance(value)\` accepts *any* value, it is the public field again with extra typing. The rules are still outside, in every caller.

        The same goes for a getter that hands out the **inside of the object itself**. Return a private array and the caller can \`push\` straight into it, bypassing every method you wrote.

        Ask of each getter and setter: *does this protect a rule, or does it only look as if it does?*`,
      code: { lang: 'js', src: `
        class Cart {
          #items = [];
          get items() { return this.#items; }
        }

        cart.items.push({ sku: 'X1', price: -5 });`,
        notes: {
          3: 'The caller receives the **actual** private array, not a copy.',
          6: 'It bypasses the class completely. A negative price, no stock check, no total update.'
        } } },

    { kind: 'steps', title: 'Closing a leak',
      body: 'Three habits that keep the inside inside.',
      steps: [
        { title: 'Expose actions, not fields', body: 'Instead of `setBalance(x)`, offer `deposit(x)` and `withdraw(x)`. The caller says *what happened*; the object works out the new state.' },
        { title: 'Return copies or read-only views', body: 'For a list, return a copy (`[...this.#items]`) or a summary (`itemCount`, `total`). The caller can look but not edit.' },
        { title: 'Make the constructor check too', body: 'An object should not be born broken. If a cart needs a currency, the constructor refuses to build one without it.' },
        { title: 'Start private, open up on demand', body: 'It is easy to make something public later. Taking a public thing back is a breaking change for everyone who used it.' }
      ] },

    { kind: 'concept', title: 'What are the rules, exactly?',
      body: `The rules an object guards have a name: **invariants**. An invariant is a statement that must be true *whenever anyone looks* at the object.

        - A bank account balance is never below zero (in this bank).
        - An order total always equals the sum of its lines.
        - A cart never holds a quantity of zero.

        Encapsulation is how you keep those promises. Because only the object's own methods can change its data, only those methods have to be checked. Lesson 11 returns to invariants in detail.

        > Without encapsulation, the rule has to be enforced by **every caller**. With it, the rule is enforced **once**.` },

    { kind: 'code', title: 'The same idea, one level up: modules',
      body: `Encapsulation is not only about classes. A file (a **module**) can hide its helpers and export only what others need.`,
      code: { lang: 'js', src: `
        // pricing.js
        const VAT_RATE = 0.2;

        function addVat(net) {
          return Math.round(net * (1 + VAT_RATE) * 100) / 100;
        }

        function priceBasket(lines) {
          const net = lines.reduce((sum, l) => sum + l.qty * l.unit, 0);
          return addVat(net);
        }

        export { priceBasket };`,
        notes: {
          2: 'Private to the file. Nobody outside can import it, so the rate can change without a search of the whole codebase.',
          4: 'A helper. Hidden, so it can be renamed or deleted at will.',
          13: 'The **only** thing other files can see. This list is the module’s public surface.'
        } } },

    { kind: 'tip', title: 'Smaller surface, easier life',
      body: `Everything you expose is something you must keep working forever, because somebody will depend on it.

        So a good habit is to **start closed** and open things only when there is a real need. A class with three public methods can be rewritten inside however you like. A class with thirty public fields cannot be touched without a nervous look over your shoulder.

        Encapsulation is not about secrecy. It is about being free to **change your mind** later.` }
  ],

  activities: [
    { type: 'tf', after: 1, statement: 'A private field with a public setter that accepts any value gives little real encapsulation.', answer: true,
      explain: 'Privacy is the mechanism, not the point. The point is that the **data and the rules guarding it live together**, so the object can never be put into a state it does not allow. A private field with a public setter that accepts anything protects nothing.' },

    { type: 'mcq', after: 3, q: 'With the `BankAccount` above, what happens when other code runs `acc.#balance = 5`?',
      options: ['It is rejected: private fields cannot be touched outside the class', 'The balance becomes 5, but a warning is logged', 'The balance becomes 5 and the history is updated too', 'Nothing happens and the code carries on silently'],
      answer: 0,
      why: [null, 'There is no warning stage: it is a hard error.', 'The history is only updated inside deposit and withdraw. Reaching in is exactly what is not allowed.', 'JavaScript does not ignore it. It refuses to run the code at all.'],
      explain: 'Private means private, and plain JavaScript enforces it. The only way to change the balance is through `deposit` and `withdraw`, which check the rules.' },

    { type: 'spot', after: 4, prompt: 'This class has a field that is private, yet its rules are not protected. Tap the line that lets callers break them.',
      code: { lang: 'js', src: `
        class Order {
          #total = 0;
          #lines = [];

          addLine(sku, qty, unit) {
            this.#lines.push({ sku, qty, unit });
            this.#total += qty * unit;
          }

          setTotal(value) { this.#total = value; }
        }` },
      lines: [10],
      explain: '`setTotal` accepts anything, so a caller can make the total disagree with the lines. The private field is just a public one in disguise. Better to drop the setter and compute the total from the lines.' },

    { type: 'bucket', prompt: 'For a `BankAccount`, what should be hidden inside and what should be offered to the outside?', buckets: ['Hidden inside', 'Public interface'],
      items: [['The raw balance field', 0], ['The list of past transactions', 0], ['A helper that checks the amount is positive', 0], ['`deposit(amount)`', 1], ['`withdraw(amount)`', 1], ['A read-only `balance` getter', 1]],
      explain: 'The outside gets actions and safe views. The raw data and the helper rules stay inside, so they can change without breaking anyone.' },

    { type: 'ab', q: 'Which `Cart` getter protects the cart better?',
      a: { lang: 'js', label: 'Hands out the list', src: `
        get items() {
          return this.#items;
        }` },
      b: { lang: 'js', label: 'Hands out a copy', src: `
        get items() {
          return [...this.#items];
        }` },
      answer: 'b',
      explain: 'A copy lets callers look at the items without being able to push into the real list. Returning the private array itself is the classic encapsulation leak.' },

    { type: 'cloze', code: true, text: 'class Wallet {\n  {{#}}coins = 0;\n\n  add(n) {\n    if (n <= 0) {{throw}} new Error("Positive only");\n    this.#coins += n;\n  }\n}',
      distractors: ['@', 'return', 'public'],
      explain: 'The `#` marks the field private. The guard throws, so an invalid call fails loudly instead of corrupting the data.' },

    { type: 'multi', q: 'Which of these genuinely improve encapsulation?',
      options: ['Replacing `setBalance(x)` with `deposit(x)` and `withdraw(x)`', 'Returning a copy of an internal list instead of the list itself', 'Checking the rules in the constructor as well as in the methods', 'Making every method public so callers have flexibility', 'Adding a getter and a setter for every private field'],
      answers: [0, 1, 2],
      explain: 'Actions that carry rules, copies instead of internals, and a constructor that refuses bad data all keep the inside safe. Public everything, or a setter for everything, throws the protection away.' },

    { type: 'scenario', title: 'Code review: the discount field',
      intro: 'A teammate opens a pull request for an online shop. The new `Order` class has a public field `discountPercent`, set directly by the checkout page, the admin panel and a nightly promotion script. Last week a customer got **150% off**.',
      meters: { 'money leaked': 20, 'team goodwill': 70 },
      steps: [
        { text: 'You are reviewing the fix. Their patch adds `if (discount > 100)` checks to the checkout page. What do you say?',
          choices: [
            { label: 'Suggest moving the rule into `Order`: a private field and an `applyDiscount(percent)` method that rejects anything outside 0 to 100', score: 2, effects: { 'money leaked': -15 }, feedback: 'Exactly. The rule lives once, beside the data, and the admin panel and the nightly script get it for free.' },
            { label: 'Approve it: checkout was the page that broke, so that is the page to fix', score: 0, effects: { 'money leaked': 25, 'team goodwill': 5 }, feedback: 'Two weeks later the nightly script writes 120 and the problem is back. Three callers, one patched.' },
            { label: 'Ask them to copy the check into all three places', score: 1, effects: { 'money leaked': -5, 'team goodwill': -5 }, feedback: 'Works today, but now the rule exists three times and the fourth caller will forget it.' }
          ] },
        { text: 'They agree and add `setDiscount(value)` that simply assigns the value, "to keep the API tidy". Thoughts?',
          choices: [
            { label: 'Push back: a setter that accepts anything is the public field again. The method should carry the rule', score: 2, effects: { 'money leaked': -10, 'team goodwill': 10 }, feedback: 'Right. Getter-and-setter pairs without checks only look like encapsulation.' },
            { label: 'Fine: it is private now, so it is encapsulated', score: 0, effects: { 'money leaked': 20 }, feedback: 'The field is private, but the setter lets anyone put 150 straight back in. The rule is still unguarded.' },
            { label: 'Ask them to make the discount field public again to be honest about it', score: 1, effects: { 'team goodwill': -10 }, feedback: 'At least honest, but it solves nothing: the bug that started all this is still waiting.' }
          ] },
        { text: 'One more question: should `Order` hand out its list of lines through a getter?',
          choices: [
            { label: 'Yes, but as a copy or read-only view, with changes made through methods like `addLine`', score: 2, effects: { 'money leaked': -5, 'team goodwill': 5 }, feedback: 'Callers can inspect, but every change still goes through code that checks the rules.' },
            { label: 'Yes, return the real array so it is fast and flexible', score: 0, effects: { 'money leaked': 15 }, feedback: 'The first caller to push a line directly skips the total update and the stock check.' },
            { label: 'No, never expose the lines at all', score: 1, effects: { 'team goodwill': -5 }, feedback: 'Safe, but the invoice page needs to show them. Expose a safe view rather than nothing.' }
          ] }
      ],
      outro: 'The pattern: **find the rule, move it next to the data, and close the back doors.**' },

    { type: 'explain', prompt: 'A colleague says: "I made the fields private and added getters and setters for all of them, so it is encapsulated." Explain what could still be wrong.',
      model: 'Private fields with unchecked setters are really public fields with extra typing. Encapsulation means the object guards its own rules (its invariants), so callers cannot put it into an invalid state. The class should offer meaningful actions such as deposit or applyDiscount that enforce the rules, and should not hand out its internal collections directly.',
      keywords: ['rules', 'invariant', 'setter', 'public', 'actions', 'internal'] }
  ],

  flashcards: [
    { q: 'What is encapsulation?', a: 'Bundling data with the code that guards it, and hiding the internals, so the object can only change in ways its own rules allow.' },
    { q: 'Why can a setter that accepts any value be no better than a public field?', a: 'The rules are still outside the object, in every caller, so any of them can put it in an invalid state.' },
    { q: 'Why is returning a private list from a getter risky?', a: 'The caller gets the real list and can change it directly, bypassing every rule in your methods. Return a copy or a read-only view.' },
    { q: 'What is an invariant?', a: 'A rule about an object that must be true whenever anyone looks at it, such as "the balance is never negative".' },
    { q: 'How does encapsulation apply to modules, not just classes?', a: 'A module keeps its helpers private and exports only a small public surface, so its insides can change freely.' }
  ],

  glossary: [
    { term: 'Encapsulation', def: 'Keeping an object’s data and the rules that guard it together, and hiding the internals behind a small set of methods.', like: 'A vending machine: buttons and a coin slot outside, stock and rules inside.' },
    { term: 'Private field', def: 'A field only the class’s own code can read or write. In JavaScript it starts with `#`.', like: 'The staff-only door behind a counter.' },
    { term: 'Invariant', def: 'A rule about an object that must hold whenever anyone looks at it, such as "the balance is never negative".', like: 'The rule that a lift never moves with its doors open.' },
    { term: 'Public surface', def: 'Everything a class or module offers to the outside. Whatever is on it must keep working for as long as others rely on it.', aka: ['public API'], like: 'The front of a shop: what customers see and can ask for.' }
  ],

  takeaways: [
    'Encapsulation = **data + the rules that guard it, together**, with the insides hidden.',
    'A setter that accepts anything is a public field in disguise. Offer **actions** (`deposit`) instead.',
    'Never hand out your internals: return copies or read-only views.',
    'Start closed. A small public surface keeps you free to change your mind.'
  ],

  links: [
    { label: 'MDN: Private properties in JavaScript classes', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-abstraction', {
  eli5: 'Abstraction means showing what something does and hiding how it does it, so you can use it without understanding the messy details inside.',

  cards: [
    { kind: 'concept', title: 'You drive the car, not the engine',
      body: `You press the accelerator and the car goes faster. You do not think about fuel injection, spark timing or gears.

        Somebody decided that the *useful* part of a car is "go, stop, steer", and hid the thousand moving parts behind three controls.

        That is **abstraction**: choose what something **does** and show only that. The **how** stays out of sight.

        Code is built from it. When you call \`console.log\` you neither know nor care how characters reach the screen. When you write \`payments.charge(card, 30)\` you trust that it will charge £30, and you do not want to know the bank's file format.` },

    { kind: 'metaphor', title: 'The restaurant menu',
      body: `A menu says **"Lasagne, £11"**. It does not say how long the sauce simmered, which supplier sells the pasta or what the oven temperature was.

        That is a good abstraction:

        - Customers can order without being chefs.
        - The kitchen can change supplier, recipe or oven and the menu stays the same.
        - Two kitchens with different methods could serve the *same* menu.

        The menu is the **interface** you choose to present. The kitchen is the **implementation** you keep behind the door.` },

    { kind: 'code', title: 'Before: the caller does the plumbing',
      body: 'This checkout code charges a card. Look at how much of the "how" has leaked into it.',
      code: { lang: 'js', src: `
        async function checkout(cart, card) {
          const body = JSON.stringify({
            amount: Math.round(cart.total * 100),
            currency: 'GBP',
            source: card.token
          });
          const sig = hmac(SECRET, body);
          const res = await fetch('https://pay.example.com/v2/charges', {
            method: 'POST',
            headers: { 'X-Signature': sig },
            body
          });
          if (res.status !== 200) throw new Error('Payment failed');
          return (await res.json()).id;
        }`,
        notes: {
          3: 'Pence, not pounds. A detail of *this* provider that every caller now has to know.',
          7: 'Signing requests is the provider’s business, not checkout’s.',
          8: 'The URL, the HTTP method, the version in the path: all "how".',
          13: 'And a status code convention. Change provider and every caller changes.'
        } } },

    { kind: 'code', title: 'After: say what, hide how',
      body: 'The checkout asks for what it wants. The messy details move behind one method.',
      code: { lang: 'js', src: `
        class PaymentGateway {
          async charge(card, amountInPounds) {
            // pence, signing, HTTP, status codes: all in here
            // and nowhere else
          }
        }

        async function checkout(cart, card, gateway) {
          const receiptId = await gateway.charge(card, cart.total);
          return receiptId;
        }`,
        notes: {
          2: '**What**: charge this card this amount. That is the whole promise.',
          3: 'The how lives here. Switch to another provider and only this class changes.',
          9: 'Checkout now reads like a sentence and cannot be broken by a change to the payment provider’s format.'
        } } },

    { kind: 'layers', title: 'Levels of abstraction',
      body: 'Software is a stack of abstractions. Each level uses the one below as if it were magic, and a good function stays at **one level**.',
      layers: [
        { label: 'placeOrder(cart)', note: 'Business level: what the shop wants to happen.', icon: '🛒', tone: 'accent' },
        { label: 'gateway.charge(card, amount)', note: 'Service level: a promise about money.', icon: '💳' },
        { label: 'POST /v2/charges with signature', note: 'Protocol level: how this provider is spoken to.', icon: '📨' },
        { label: 'TCP, IP, Wi-Fi', note: 'Network level: you do not want to think about this one.', icon: '📡', tone: 'muted' }
      ],
      note: 'Mixing levels is a code smell: a function that talks about *orders* in one line and *byte buffers* in the next is doing two jobs.' },

    { kind: 'compare', title: 'Abstraction vs encapsulation',
      body: 'People mix these two up constantly, partly because they work together.',
      cols: ['Abstraction', 'Encapsulation'],
      rows: [
        ['Question it answers', 'What should the outside world see?', 'How do I stop the outside from breaking the inside?'],
        ['Main move', 'Choose a simple promise ("charge a card")', 'Hide the data and enforce the rules'],
        ['Lives in', 'The design of the interface', 'The class’s privacy and checks'],
        ['Without it', 'Callers drown in detail', 'Callers corrupt the data']
      ] },

    { kind: 'pitfall', title: 'Leaky abstractions',
      body: `No abstraction hides everything. Eventually the "how" pokes through. Joel Spolsky named this the **law of leaky abstractions**.

        - An ORM lets you write \`users.all()\` without SQL, until it fetches a million rows and the page takes a minute.
        - A network drive looks like a folder, until the Wi-Fi drops mid-save.
        - \`gateway.charge()\` looks instant, until the provider is slow.

        Good abstractions leak *less* and *later*. When one leaks, you need to understand the layer beneath, so do not treat abstractions as an excuse never to learn how they work.` },

    { kind: 'pitfall', title: 'Premature abstraction',
      body: `The opposite mistake is building abstractions **before** you know what varies.

        A shop with exactly one email sender gets an \`AbstractNotificationChannelFactoryProvider\`, "in case we add SMS". Two years on, SMS never came, and every new developer must wade through four layers to find the line that sends an email.

        A common rule of thumb: **wait for the second or third real case**. Two similar things might be a coincidence. Three similar things show you the actual shape of the abstraction.

        (A later module covers "You Aren’t Gonna Need It", which pushes this same way.)` },

    { kind: 'tip', title: 'Name the what, not the how',
      body: `A quick test for an abstraction is its name. A good name says **what** and does not mention the technology.

        - \`saveOrder(order)\`, not \`writeOrderToMySqlTable(order)\`
        - \`sendReceipt(customer)\`, not \`postToSmtpServer(customer)\`
        - \`findOverdueInvoices()\`, not \`runInvoiceQuery3()\`

        If the day you switch database would force you to rename the method, the *how* has leaked into the name.` }
  ],

  activities: [
    { type: 'bucket', after: 1, prompt: 'On a restaurant menu, which things are the "what" (shown) and which are the "how" (hidden in the kitchen)?', buckets: ['What (the menu)', 'How (the kitchen)'],
      items: [['Lasagne, £11', 0], ['Vegetarian option available', 0], ['Which brand of flour is used', 1], ['How long the sauce simmers', 1], ['Oven temperature', 1], ['Ready in about 15 minutes', 0]],
      explain: 'The menu is the promise the customer relies on. Everything that could change without the customer noticing belongs behind the kitchen door.' },

    { type: 'ab', after: 3, q: 'Which method name is the better abstraction?',
      a: { lang: 'js', label: 'Says how', src: `
        invoices.runSqlQueryAndFilterByDate(today)` },
      b: { lang: 'js', label: 'Says what', src: `
        invoices.findOverdue(today)` },
      answer: 'b',
      explain: 'The second name describes the result the caller wants. If the invoices move from SQL to a web service, nothing about the name needs to change. The first has the database welded into it.' },

    { type: 'order', after: 4, prompt: 'Order these from the **highest** level of abstraction to the **lowest**.',
      items: ['Place an order', 'Charge the customer', 'Send a signed HTTPS request', 'Write bytes to a network socket'],
      explain: 'Each level is described in terms of the one below it. "Place an order" involves charging; charging involves an HTTPS request; that involves bytes on a socket.' },

    { type: 'tf', statement: 'A good abstraction means you never have to understand what is underneath it.', answer: false,
      explain: 'Every abstraction leaks sometimes (a slow query, a dropped connection). Good ones leak rarely, and engineers who understand the layer below fix the problem much faster.' },

    { type: 'spot', prompt: 'This function mixes levels of abstraction. Tap the line that drops to the wrong level.',
      code: { lang: 'js', src: `
        function placeOrder(cart, customer) {
          validate(cart);
          const receipt = gateway.charge(customer.card, cart.total);
          const buf = Buffer.from(receipt.id + '|' + cart.total, 'utf8');
          sendConfirmation(customer, receipt);
          return receipt;
        }` },
      lines: [4],
      explain: 'Everything else is business-level ("validate", "charge", "send confirmation"). Line 4 suddenly builds a byte buffer. That detail belongs inside the confirmation code, or does not need to exist at all.' },

    { type: 'cloze', text: 'An abstraction shows what a thing {{does}} and hides {{how}} it does it. When the hidden detail pokes through anyway, we call it a {{leaky}} abstraction.',
      distractors: ['is', 'why', 'broken'],
      explain: 'The "what" is the promise to callers; the "how" is free to change. Joel Spolsky’s law says all non-trivial abstractions leak to some degree.' },

    { type: 'mcq', q: 'A shop has one email sender and no plans for anything else. A teammate proposes a `NotificationChannel` interface, a factory and a registry "so we can add SMS later". What is the best response?',
      options: ['Keep the direct call; abstract when a second channel appears', 'Build it now: abstractions are always cheaper at the start', 'Add the interface now but skip the factory and registry', 'Reject all abstractions: always call the email library directly'],
      answer: 0,
      why: [null, 'Guessing the shape before there are two cases usually gets the shape wrong, and the layers stay forever.', 'Smaller, but it is still a guess about something that may never happen.', 'Over-correcting. When a second case does arrive, an abstraction is exactly right.'],
      explain: 'Abstraction has a cost: indirection to read through. Pay it when you can see what varies, usually from the second or third real case.' },

    { type: 'scenario', title: 'Switching payment provider',
      intro: 'Your shop is moving from the payment provider **PayFast** to **QuickPay**. The contract ends in six weeks. You open the codebase.',
      meters: { 'risk': 60, 'time left': 80 },
      steps: [
        { text: 'You search for `payfast` and find 41 matches: in the checkout page, the refund tool, the monthly report and the admin screen. What does that tell you?',
          choices: [
            { label: 'The provider’s "how" has leaked everywhere. First hide it behind one `PaymentGateway` with `charge` and `refund`', score: 2, effects: { 'risk': -20, 'time left': -15 }, feedback: 'Good. Wrap the old provider first, and the switch itself becomes a change in one class.' },
            { label: 'Do a find-and-replace from `payfast` to `quickpay`', score: 0, effects: { 'risk': 25, 'time left': -5 }, feedback: 'The two providers measure money differently, name statuses differently and sign requests differently. The replace compiles and then mis-charges.' },
            { label: 'Add `if (provider === "quickpay")` branches at each of the 41 places', score: 1, effects: { 'risk': 10, 'time left': -25 }, feedback: 'It works, but you have doubled the number of places that know provider details.' }
          ] },
        { text: 'While designing `PaymentGateway`, a colleague wants a method `chargeInPenceWithHmacSha256(card, pence)`. Your view?',
          choices: [
            { label: 'Call it `charge(card, amountInPounds)`. Pence and signing are the provider’s concern', score: 2, effects: { 'risk': -15 }, feedback: 'The name states what is wanted and hides how. QuickPay’s conventions can differ without callers noticing.' },
            { label: 'Keep it: explicit names remove guesswork', score: 0, effects: { 'risk': 15 }, feedback: 'Explicit about the wrong thing. The name now promises an implementation that will be false after the switch.' },
            { label: 'Make `charge` accept a free-form options object so any provider can fit', score: 1, effects: { 'risk': 5 }, feedback: 'That is premature flexibility: callers must now know the provider-specific options, which is the leak again.' }
          ] },
        { text: 'A week after launch, QuickPay has an outage and `charge` hangs for 60 seconds. What does this show?',
          choices: [
            { label: 'The abstraction leaked: callers need a timeout and a clear failure result. Add both to the promise', score: 2, effects: { 'risk': -20, 'time left': -5 }, feedback: 'Exactly. Slowness and failure are things every payment abstraction must account for.' },
            { label: 'The abstraction failed, so remove it and call QuickPay directly', score: 0, effects: { 'risk': 20 }, feedback: 'You would swap one leak for 41. A leaky abstraction is still better than none.' },
            { label: 'Nothing, it is QuickPay’s fault', score: 1, effects: { 'risk': 10 }, feedback: 'True, but customers do not see that. Your design decides how your system copes.' }
          ] }
      ],
      outro: 'Abstractions earn their keep on **the day something changes underneath them**.' }
  ],

  flashcards: [
    { q: 'What is abstraction, in one sentence?', a: 'Exposing what something does and hiding how it does it, so callers depend on a simple promise.' },
    { q: 'Abstraction vs encapsulation: what is the difference?', a: 'Abstraction chooses what the outside sees. Encapsulation protects the inside from being broken. They work together but answer different questions.' },
    { q: 'What is a leaky abstraction?', a: 'One where a hidden detail shows through anyway, such as an ORM slowing down because of the SQL beneath it.' },
    { q: 'What is premature abstraction?', a: 'Building a layer of generality before you know what varies. A common rule of thumb is to wait for the second or third real case.' },
    { q: 'How do you spot a leaky method name?', a: 'It mentions the technology or mechanism, such as writeToMySql. Switching technology would force a rename.' }
  ],

  glossary: [
    { term: 'Abstraction', def: 'A simplified view of something that shows what it does and hides how it works.', like: 'A restaurant menu hiding the kitchen.' },
    { term: 'Implementation', def: 'The actual code that does the work behind an abstraction.', like: 'The kitchen behind the menu.' },
    { term: 'Level of abstraction', def: 'How far a piece of code is from the machine and how close it is to the business idea. "Place an order" is high; "write bytes to a socket" is low.', like: 'Zooming a map in and out.' },
    { term: 'Leaky abstraction', def: 'An abstraction whose hidden details still affect callers, for example in speed or failure modes.', like: 'A waterproof coat that eventually lets rain in at the collar.' },
    { term: 'Premature abstraction', def: 'An abstraction built before there are enough real cases to know its right shape.', like: 'Building a ten-lane road for a village of four houses.' }
  ],

  takeaways: [
    'Abstraction = **show what, hide how**: a simple promise on the outside, freedom on the inside.',
    'Keep each function at **one level** of abstraction.',
    'All abstractions leak a bit, so still learn what is underneath.',
    'Do not abstract until you can see what varies. Names should say what, not how.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-inheritance', {
  eli5: 'Inheritance lets one class borrow everything from another by saying "I am a kind of that", then add or change only what makes it different.',

  cards: [
    { kind: 'concept', title: 'Two accounts, mostly the same',
      body: `A bank offers a normal account and a savings account. Both hold money. Both let you deposit and withdraw. The savings one also pays interest.

        You could copy the normal account's code into a second class and add interest. That works until a bug is fixed in one copy and not the other.

        **Inheritance** is the shortcut: write \`SavingsAccount\` as "a **BankAccount**, plus interest". It receives all the deposit and withdraw code without a single copied line.

        The class being borrowed from is the **base class** (also *parent* or *superclass*). The class doing the borrowing is the **derived class** (*child* or *subclass*).` },

    { kind: 'metaphor', title: 'The franchise',
      body: `A coffee franchise has a head-office recipe book: how to make a latte, how to clean the machine, how to greet customers. Every branch **inherits** it.

        One airport branch also sells sandwiches. Another has a slightly different opening routine. Each does the standard things as head office says, and adds or overrides the odd item.

        Now suppose head office changes the cleaning routine. Every branch changes at once. That is the **gift** of inheritance, and, as you will see, also its **danger**: branches have no say.`,
      note: 'Where it stops being true: a branch can ignore head office. A derived class that disagrees with its base usually means a bug.' },

    { kind: 'code', title: 'Extending a class',
      body: 'The savings account gets `deposit`, `withdraw` and `balance` for free. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class BankAccount {
          #balance = 0;
          deposit(amount) { this.#balance += amount; }
          withdraw(amount) { this.#balance -= amount; }
          get balance() { return this.#balance; }
        }

        class SavingsAccount extends BankAccount {
          constructor(rate) {
            super();
            this.rate = rate;
          }

          addInterest() {
            this.deposit(this.balance * this.rate);
          }
        }`,
        notes: {
          8: '`extends` says "SavingsAccount is a kind of BankAccount". Everything public in the base is now available here.',
          10: '`super()` runs the **base class constructor** first, so the parent part of the object is built before the child adds its own bits.',
          15: '`deposit` and `balance` are inherited. Nothing was copied.'
        } } },

    { kind: 'diagram', title: 'Reading a class diagram',
      body: 'Class relationships are often drawn as a tree. The arrow points from the child **up** to the parent it is a kind of.',
      nodes: [
        { id: 'base', label: 'BankAccount', icon: '🏦', x: 1, y: 0, tone: 'accent' },
        { id: 'sav', label: 'SavingsAccount', x: 0, y: 1 },
        { id: 'cur', label: 'CurrentAccount', x: 2, y: 1 }
      ],
      edges: [
        { from: 'sav', to: 'base', label: 'is a' },
        { from: 'cur', to: 'base', label: 'is a' }
      ],
      caption: 'Shared code goes in the parent. What makes each child special goes in the child.' },

    { kind: 'concept', title: 'The "is-a" test',
      body: `Inheritance is only right when the sentence **"a ___ is a ___"** is true *and stays true in the code*.

        - A savings account **is a** bank account. ✔
        - A shopping cart **is a** list of items? Not really. A cart *has* a list of items (a **has-a** relationship), and it also has a customer, a coupon and a total. ✘

        Beginners often inherit just to borrow a few methods, such as \`class Cart extends Array\`. Now every Array method is on the cart, including \`splice\` and \`reverse\`, which make no sense for a basket and punch holes in any rules you want to keep.

        Reuse alone is not a good enough reason. The relationship has to be real.` },

    { kind: 'code', title: 'Overriding, and calling super',
      body: 'A derived class can **override** a method: provide its own version with the same name. It can still reach the original with `super`.',
      code: { lang: 'js', src: `
        class SavingsAccount extends BankAccount {
          withdraw(amount) {
            if (amount > 500) throw new Error('Limit is 500');
            super.withdraw(amount);
          }
        }`,
        notes: {
          2: 'Same name and parameters as the base version, so this one **replaces** it for savings accounts.',
          4: '`super.withdraw` runs the base class version, so we add a rule without rewriting the subtraction.'
        } },
      note: 'Not calling `super` at all is allowed, but then you have taken over the whole job and must keep the base class’s promises yourself.' },

    { kind: 'code', title: 'The fragile base class problem',
      body: `A subclass counts deposits. The base class has a convenience method, \`depositAll\`. Can you spot what goes wrong?`,
      code: { lang: 'js', src: `
        class BankAccount {
          #balance = 0;
          deposit(amount) { this.#balance += amount; }
          depositAll(amounts) {
            for (const a of amounts) this.deposit(a);
          }
        }

        class AuditedAccount extends BankAccount {
          count = 0;
          deposit(amount) {
            this.count += 1;
            super.deposit(amount);
          }
          depositAll(amounts) {
            this.count += amounts.length;
            super.depositAll(amounts);
          }
        }`,
        notes: {
          5: 'A hidden detail: the base `depositAll` **calls `this.deposit`**. The subclass author cannot see that without reading this code.',
          16: 'The subclass counts the whole batch here…',
          17: '…then the base loop calls `this.deposit` for each item, which counts them **again**. Depositing three amounts gives a count of six.'
        } },
      note: 'Fix it by removing the batch counting, and a later "improvement" to the base class (adding to the balance directly) breaks it the other way. Either way the child depends on a secret.' },

    { kind: 'layers', title: 'Deep hierarchies are a warning sign',
      body: 'Every level adds a place where behaviour might hide. To understand one method call here, you might read five files.',
      layers: [
        { label: 'StudentSavingsAccount', note: 'Overrides interest for under-25s.', icon: '🎓' },
        { label: 'SavingsAccount', note: 'Adds interest, overrides withdraw.', icon: '🐷' },
        { label: 'InterestBearingAccount', note: 'Adds a rate and a calendar.', icon: '📅' },
        { label: 'LimitedAccount', note: 'Adds withdrawal limits.', icon: '🚧' },
        { label: 'BankAccount', note: 'Deposit and withdraw.', icon: '🏦', tone: 'accent' }
      ],
      note: 'A rough guide: one or two levels is common. Past three, ask whether you are modelling the business or just reusing code.' },

    { kind: 'tip', title: 'Before you reach for extends',
      body: `A short checklist:

        1. Is it truly **a kind of** the parent, everywhere the parent is used?
        2. Do I want **all** the parent's public behaviour, or only a bit of it?
        3. Do I own the base class, or is it someone else's that may change underneath me?
        4. Would it still read sensibly if the hierarchy grew two more levels?

        If any answer is "no" or "not sure", there is often a simpler tool: give the class a *field* that holds the other object and call it. The next module, on design principles, looks at this as **composition over inheritance**.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'In `SavingsAccount`, what does the call `super()` in the constructor do?',
      options: ['Runs the base constructor so the parent part is set up first', 'Creates a second, separate BankAccount object alongside', 'Copies every method of the base class into SavingsAccount', 'Marks the class as unable to be extended further'],
      answer: 0,
      why: [null, 'There is only one object. `super()` initialises its parent part.', 'Methods are not copied. They are found by looking up the chain of parents.', 'That is a different feature entirely.'],
      explain: 'A derived object is one object built in layers. The base constructor must run first so the parent part exists before the child adds to it.' },

    { type: 'bucket', after: 4, prompt: 'Does inheritance fit ("is a"), or is it really a "has a"?', buckets: ['Is a: inheritance fits', 'Has a: use a field'],
      items: [['SavingsAccount and BankAccount', 0], ['Cart and its list of items', 1], ['Manager and Employee', 0], ['Order and its Customer', 1], ['Car and its Engine', 1], ['Dog and Animal', 0]],
      explain: 'Ask the sentence out loud. A manager is an employee; an order has a customer. When the relationship is "has a", store the other object in a field instead.' },

    { type: 'tf', after: 6, statement: 'A subclass that only calls the base class’s public methods can never be broken by a change inside the base class.', answer: false,
      explain: 'The audited account used only public methods and still broke, because the base `depositAll` calls `deposit` internally. A subclass depends on **how** the base works, not only on what it promises. That is the fragile base class problem.' },

    { type: 'spot', prompt: 'Someone wanted a cart that could use Array’s handy methods. Tap the line that creates the problem.',
      code: { lang: 'js', src: `
        class Cart extends Array {
          total() {
            return this.reduce((sum, i) => sum + i.price, 0);
          }
        }

        const cart = new Cart();
        cart.push({ sku: 'A1', price: 5 });
        cart.reverse();
        cart.length = 0;` },
      lines: [1],
      explain: 'The `extends` is the problem. A cart is not a kind of array, so callers can now `reverse`, `splice` or set `length = 0` and bypass any rule the cart should enforce. A cart that *holds* an array and offers `add` and `total` would be safer.' },

    { type: 'ab', q: 'Which override of `withdraw` is better?',
      a: { lang: 'js', label: 'Reuses the base', src: `
        withdraw(amount) {
          if (amount > 500) throw new Error('Limit');
          super.withdraw(amount);
        }` },
      b: { lang: 'js', label: 'Copies the base', src: `
        withdraw(amount) {
          if (amount > 500) throw new Error('Limit');
          this.balance -= amount;
          this.history.push(amount);
        }` },
      answer: 'a',
      explain: 'Calling `super.withdraw` keeps the base class’s own rules in one place. The copy duplicates its logic, so when the base changes (say it starts logging), this version silently misses it.' },

    { type: 'cloze', code: true, text: 'class SavingsAccount {{extends}} BankAccount {\n  constructor(rate) {\n    {{super}}();\n    this.rate = rate;\n  }\n}',
      distractors: ['implements', 'inherits', 'parent'],
      explain: '`extends` creates the is-a link. In a derived constructor, `super()` must be called before the class touches `this`.' },

    { type: 'mcq', q: 'Using the `AuditedAccount` above, what is `count` after `acct.depositAll([10, 20, 30])`?',
      options: ['6', '3', '0', '60'],
      answer: 0,
      why: [null, 'That is what the author intended. But the base loop calls the overridden `deposit` for each amount, counting them a second time.', 'Nothing resets the count. Both overrides add to it.', 'That is the total amount deposited, not the count of deposits.'],
      explain: 'The subclass adds 3 for the batch, then the base `depositAll` calls `this.deposit` three times, and each one adds 1. The child unknowingly relied on how the parent was written.' },

    { type: 'scenario', title: 'Another account type',
      intro: 'The bank wants a **JuniorAccount** for children: it needs deposits, withdrawals and balance, but withdrawals above £50 need a parent’s approval.',
      meters: { 'code health': 70, 'delivery speed': 60 },
      steps: [
        { text: 'You open `BankAccount` and see `deposit`, `withdraw` and `balance`. How do you start?',
          choices: [
            { label: 'Check the is-a test: a junior account is a bank account. Extend it and override `withdraw`', score: 2, effects: { 'code health': 10, 'delivery speed': 10 }, feedback: 'The relationship is genuine and you only need to add one rule. This is inheritance at its best.' },
            { label: 'Copy-paste BankAccount into JuniorAccount and edit', score: 0, effects: { 'code health': -20, 'delivery speed': 15 }, feedback: 'Fast, and a trap: the first fix to BankAccount will skip your copy.' },
            { label: 'Extend `Array` since the account is really a list of transactions', score: 0, effects: { 'code health': -25 }, feedback: 'An account is not a list, and every array method becomes a back door onto its money.' }
          ] },
        { text: 'In the override, how do you apply the £50 rule?',
          choices: [
            { label: 'Check the limit, then call `super.withdraw(amount)` for the actual subtraction', score: 2, effects: { 'code health': 10 }, feedback: 'The new rule is added and the base class does the rest, including anything it learns to do later.' },
            { label: 'Do the subtraction again in the override, in case super is slow', score: 0, effects: { 'code health': -15 }, feedback: 'You now maintain two copies of the withdrawal logic, which is what inheritance was meant to avoid.' },
            { label: 'Remove the limit check: ask parents to be careful', score: 0, effects: { 'code health': -5, 'delivery speed': 5 }, feedback: 'That does not meet the requirement.' }
          ] },
        { text: 'A month later the team wants JuniorSavingsAccount, StudentJuniorSavingsAccount and PremiumStudentJuniorSavingsAccount, each a child of the last. What do you suggest?',
          choices: [
            { label: 'Pause: the hierarchy is getting deep. Look at what really varies (limits, interest) and model that instead of stacking subclasses', score: 2, effects: { 'code health': 15, 'delivery speed': -10 }, feedback: 'Slower today, much easier next year. Deep chains are a warning sign that you are modelling code reuse, not the business.' },
            { label: 'Go ahead. Each one only adds a bit', score: 1, effects: { 'code health': -15, 'delivery speed': 10 }, feedback: 'Each step feels harmless. By the fifth level nobody can say where a rule is applied.' },
            { label: 'Ban inheritance in the whole codebase', score: 1, effects: { 'code health': -5, 'delivery speed': -10 }, feedback: 'Too far. Genuine is-a relationships, kept shallow, are fine.' }
          ] }
      ],
      outro: 'Inheritance is a sharp tool: perfect for **real is-a relationships kept shallow**, risky everywhere else.' },

    { type: 'explain', prompt: 'Explain the fragile base class problem to a colleague who says "I only use public methods, so I am safe".',
      model: 'A subclass depends not just on what the base class promises but on how it is implemented internally, such as which of its own methods it calls. If the base class changes those internals, even with the same public behaviour, the subclass can break or behave wrongly. The audited account double-counted because the base depositAll called deposit.',
      keywords: ['base class', 'internal', 'implementation', 'subclass', 'break', 'override'] }
  ],

  flashcards: [
    { q: 'What does inheritance express?', a: 'An "is-a" relationship: the derived class is a kind of the base class and reuses its behaviour.' },
    { q: 'What do `extends` and `super` do in JavaScript?', a: '`extends` makes one class derive from another. `super` runs the parent’s constructor (`super()`) or calls the parent’s version of a method (`super.method()`).' },
    { q: 'What is the fragile base class problem?', a: 'Changes inside a base class, even ones that keep its public behaviour, can break subclasses that depend on how it works internally.' },
    { q: 'Why is `class Cart extends Array` a bad idea?', a: 'A cart is not a kind of array. It inherits methods like splice and reverse and the ability to set length, bypassing the cart’s own rules.' },
    { q: 'Why are deep hierarchies a warning sign?', a: 'Behaviour is spread across many levels, so understanding one call means reading many classes, and any change at the top ripples down.' }
  ],

  glossary: [
    { term: 'Inheritance', def: 'A way to build a class from another by saying it is a kind of that class, receiving its behaviour and adding or changing parts.', like: 'A franchise branch following head office’s recipe book.' },
    { term: 'Base class', def: 'The class that others derive from, providing shared behaviour.', aka: ['parent', 'superclass'], like: 'The head-office recipe book.' },
    { term: 'Derived class', def: 'A class that extends a base class, inheriting its behaviour.', aka: ['child', 'subclass'], like: 'One branch of the franchise.' },
    { term: 'Override', def: 'Providing a new version of an inherited method with the same name in a derived class.', like: 'A branch swapping the standard greeting for its own.' },
    { term: 'Fragile base class problem', def: 'The risk that changing a base class’s internals breaks subclasses that relied on them.', like: 'Repairing a wall without knowing that your neighbour hung shelves from it.' }
  ],

  takeaways: [
    'Inheritance = **"is a" reuse**: the child gets the parent’s behaviour and adds or overrides.',
    'Use the sentence test. "Has a" belongs in a field, not in `extends`.',
    'A subclass depends on the base class’s *internals*, so base changes can break it (fragile base class).',
    'More than two or three levels deep is a warning sign.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-polymorphism', {
  eli5: 'Polymorphism means you can give the same instruction to different objects and each one does it in its own way, so the code giving the instruction does not need to know which kind it is talking to.',

  cards: [
    { kind: 'concept', title: 'One call, many behaviours',
      body: `An online shop offers three ways to ship: standard post, express courier and collection from the shop. Each is priced differently.

        The checkout needs a shipping cost. The clumsy approach asks, "which method is it?", then works out the cost itself.

        The better approach is to tell the shipping method itself: **"what is your cost for 2 kg?"** The same call, \`shipping.cost(2)\`, returns £4.50 from one, £9.90 from another and £0 from the third.

        That is **polymorphism** (Greek for "many shapes"): one message, many behaviours, chosen by *whichever object receives it*.` },

    { kind: 'metaphor', title: 'The Play button',
      body: `You press **Play** on a music app. If the file is an MP3, one routine decodes it. If it is a podcast, another does. If it is a live radio stream, a third.

        You press the same button every time. You do not tell the app which decoder to use. The *thing you pressed it on* knows what play means for itself.

        A good deal of code works the same way: the caller says **what** it wants, and each object knows **how**.`,
      note: 'Where it stops being true: a real Play button is one piece of hardware. In code, each object really does carry its own version of the method.' },

    { kind: 'code', title: 'Before: asking "what kind are you?"',
      body: 'A switch on a type name. Every time a new kind appears, this function must change.',
      code: { lang: 'js', src: `
        function shippingCost(method, kg) {
          switch (method) {
            case 'standard':
              return 3.5 + kg * 0.5;
            case 'express':
              return 7.5 + kg * 1.2;
            case 'collection':
              return 0;
            default:
              throw new Error('Unknown method');
          }
        }`,
        notes: {
          2: 'The decision is made by the **caller**, by checking a label. And the same switch tends to be copied into the label printer, the delivery estimate and the invoice.',
          8: 'Adding "drone delivery" means editing this function, and every other copy of the switch. Miss one and you get a bug.'
        } } },

    { kind: 'code', title: 'After: let each object answer',
      body: 'Each kind becomes a class with the **same method name**. The caller stops asking and starts telling.',
      code: { lang: 'js', src: `
        class StandardShipping {
          cost(kg) { return 3.5 + kg * 0.5; }
        }
        class ExpressShipping {
          cost(kg) { return 7.5 + kg * 1.2; }
        }
        class CollectionShipping {
          cost(kg) { return 0; }
        }

        function total(order, shipping) {
          return order.subtotal + shipping.cost(order.weightKg);
        }`,
        notes: {
          12: 'This line never mentions a kind of shipping. It will work for any object that has a `cost` method, including ones written next year.',
          2: 'Each class owns the rule for its own price. A new method is a **new class**, not a change to existing code.'
        } } },

    { kind: 'sequence', title: 'The same message, different receivers',
      body: 'Watch the checkout make one identical call twice.',
      actors: ['Checkout', 'ExpressShipping', 'CollectionShipping'],
      steps: [
        { from: 0, to: 1, label: 'cost(2)', note: 'The customer chose express. Checkout sends `cost(2)` to whichever object it holds.' },
        { at: 1, label: 'work out 7.5 + 2 × 1.2', note: 'The express object applies **its own** rule.' },
        { from: 1, to: 0, label: '£9.90', dashed: true, note: 'It answers.' },
        { from: 0, to: 2, label: 'cost(2)', note: 'A different customer chooses collection. **Identical message.** Checkout still does not ask what kind it is.' },
        { from: 2, to: 0, label: '£0', dashed: true, note: 'Same call, different behaviour. The choice happens at **run time**, depending on which object is there.' }
      ] },

    { kind: 'concept', title: 'Subtype polymorphism, in plain words',
      body: `The version above is called **subtype polymorphism**: several types share a common "shape" (here, *has a \`cost\` method*) so code written for the common shape works with all of them.

        In many languages you declare that shape formally: a base class, or an **interface** (a list of method names, which later lessons cover). The language then checks that every subtype provides the methods.

        The key idea is that **the object decides, at the moment of the call**, which version to run. Not the caller, and not the compiler guessing earlier.

        This is also what makes overriding (the last lesson) useful. A \`SavingsAccount\` can override \`withdraw\`, and code that holds an account and calls \`withdraw\` gets the right one automatically.` },

    { kind: 'code', title: 'Duck typing',
      body: `Plain JavaScript (like Python and Ruby) never asks for a declared type. If it **walks like a duck and quacks like a duck**, it is a duck. Any object with a \`cost\` method will do.`,
      code: { lang: 'js', src: `
        const droneDelivery = {
          cost(kg) { return 12 + kg * 2; }
        };

        total(order, droneDelivery);   // works

        total(order, { price: 5 });    // TypeError at run time`,
        notes: {
          1: 'No class, no `extends`. Just an object with the right method.',
          5: 'It works because it has `cost`. The checkout has never heard of drones.',
          7: 'The downside: mistakes show up only when that line **runs**. Languages with declared types catch this earlier. (TypeScript adds that checking on top of JavaScript.)'
        } } },

    { kind: 'compare', title: 'Overriding vs overloading',
      body: 'Two similar words for two different things. Beginners swap them constantly.',
      cols: ['Overriding', 'Overloading'],
      rows: [
        ['What it is', 'A subclass **replaces** an inherited method with the same name and parameters', 'The **same name** with different parameter lists in one class'],
        ['Chosen', 'At **run time**, by the actual object', 'Usually at **compile time**, by the argument types'],
        ['Is it polymorphism?', 'Yes, this is the subtype kind', 'A convenience; a different idea'],
        ['In JavaScript', 'Yes: define the method in a subclass', 'Not built in. A later definition replaces the earlier. Check argument types or use defaults']
      ],
      note: 'Java, C# and C++ have overloading, for example `print(int)` and `print(String)` side by side.' },

    { kind: 'pitfall', title: 'The switch creeps back',
      body: `If you see this inside a function, polymorphism may be missing:

        \`\`\`js
        if (x instanceof Express) { ... }
        else if (x instanceof Standard) { ... }
        \`\`\`

        It is the same switch in disguise. Every new kind means hunting down each ladder.

        Not every switch is bad, though. Turning an incoming string like \`"express"\` into the right object is a fine switch, done **once**, at the edge. The smell is the same switch **repeated** through the business logic.

        > A rule of thumb: decide once, then let objects answer.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'The shop adds "drone delivery". With the polymorphic `total` function, what must change?',
      options: ['Only a new `DroneShipping` class with a `cost` method needs to be added', 'The `total` function must gain a new case', 'Every class that already has a `cost` method must be updated', 'The `Order` class must learn about drones'],
      answer: 0,
      why: [null, 'That is the old switch approach. `total` just calls `cost`.', 'The existing classes are unaffected. They do not know the new one exists.', '`Order` only needs a subtotal and weight.'],
      explain: 'The caller works with "anything that has `cost`", so new kinds slot in without touching existing code.' },

    { type: 'tf', after: 5, statement: 'In polymorphism, the object receiving the call decides which version of the method runs.', answer: true,
      explain: 'The caller sends the same message and the **receiver** supplies the behaviour, at run time. That is what lets the caller stay ignorant of the kinds.' },

    { type: 'bucket', after: 7, prompt: 'Overriding or overloading?', buckets: ['Overriding', 'Overloading'],
      items: [['A subclass replaces `withdraw` with its own version', 0], ['`print(int)` and `print(String)` in the same class', 1], ['Chosen by the actual object at run time', 0], ['Chosen by the argument types, usually at compile time', 1], ['Makes subtype polymorphism work', 0], ['Not built into plain JavaScript', 1]],
      explain: 'Overriding replaces an inherited method and is resolved by the real object. Overloading is several same-named methods with different parameters, which JavaScript does not have.' },

    { type: 'spot', prompt: 'This code has a type-checking ladder that polymorphism could remove. Tap the first line of it.',
      code: { lang: 'js', src: `
        function discountFor(customer) {
          if (customer instanceof Student) {
            return 0.2;
          } else if (customer instanceof Pensioner) {
            return 0.15;
          }
          return 0;
        }` },
      lines: [2, 3],
      explain: 'Asking "which kind are you?" is what a method on each class should answer. Give every customer type a `discount()` method and this function disappears. A new customer type will then need no edits here.' },

    { type: 'ab', q: 'Which version is better prepared for new payment methods?',
      a: { lang: 'js', label: 'Switch on a label', src: `
        function pay(method, amount) {
          if (method === 'card') chargeCard(amount);
          else if (method === 'paypal') chargePayPal(amount);
        }` },
      b: { lang: 'js', label: 'Tell the object', src: `
        function pay(method, amount) {
          method.charge(amount);
        }
        // each class implements charge()` },
      answer: 'b',
      explain: 'The tell-the-object version never changes when a payment method is added: a new class with `charge` is enough. The switch needs another branch (and the same branch in every other place it appears).' },

    { type: 'cloze', code: true, text: 'class Circle {\n  area() { return Math.PI * this.r ** 2; }\n}\nclass Square {\n  {{area}}() { return this.side ** 2; }\n}\n\nfor (const s {{of}} shapes) {\n  total += s.area();\n}',
      distractors: ['in', 'size', 'instanceof'],
      explain: 'Both classes use the same method name, `area`. The loop sends one message to each shape and each answers with its own formula.' },

    { type: 'mcq', q: 'Which statement about duck typing in plain JavaScript is true?',
      options: ['Any object with the needed method works, but a missing method is only discovered when the call runs', 'JavaScript checks at compile time that every object has the right methods', 'Objects must extend a shared base class to be used interchangeably', 'Objects must declare which interfaces they implement'],
      answer: 0,
      why: [null, 'Plain JavaScript has no compile-time type check. TypeScript adds one.', 'No base class is required: a matching method is enough.', 'JavaScript has no `implements`. TypeScript does.'],
      explain: 'Duck typing is flexible (no ceremony) but late: errors appear when the code runs. Typed languages and TypeScript trade some flexibility for earlier warnings.' },

    { type: 'scenario', title: 'Review: the report exporter',
      intro: 'A pull request adds exporting for reports. The author wrote a function with `switch (format)` for `"pdf"`, `"csv"` and `"html"`. Marketing already wants `"xlsx"` next month and `"json"` after that.',
      meters: { 'future pain': 60, 'review goodwill': 70 },
      steps: [
        { text: 'The switch appears once for now. What do you suggest?',
          choices: [
            { label: 'Create `PdfExporter`, `CsvExporter` and `HtmlExporter`, each with `export(report)`. Pick one and call it', score: 2, effects: { 'future pain': -25 }, feedback: 'With two more formats on the way, the variation is real. New formats become new classes, and the caller never changes.' },
            { label: 'Leave it. A switch is simple', score: 1, effects: { 'future pain': 10 }, feedback: 'Reasonable for one place. But formats are coming and the label will start to appear in the UI, the email job and the API.' },
            { label: 'Add `if (format instanceof ...)` checks too so it is "safer"', score: 0, effects: { 'future pain': 25, 'review goodwill': -10 }, feedback: 'Now there are two ladders to maintain.' }
          ] },
        { text: 'The author asks: "Where does the string `"pdf"` turn into a `PdfExporter`?"',
          choices: [
            { label: 'One small lookup at the edge (a map or a factory function). Everything after it just calls `export`', score: 2, effects: { 'future pain': -15, 'review goodwill': 10 }, feedback: 'Right: decide once, near the input, then let objects answer.' },
            { label: 'Repeat the lookup inside every function that exports', score: 0, effects: { 'future pain': 20 }, feedback: 'You have rebuilt the scattered switch.' },
            { label: 'Store the format string on the report and switch on it where needed', score: 0, effects: { 'future pain': 15 }, feedback: 'That keeps asking "what kind?" at each use.' }
          ] },
        { text: 'Another team member says: "Our data team also wants to plug in their own exporter, written separately." In plain JavaScript, what is enough for it to work?',
          choices: [
            { label: 'It only needs an `export(report)` method. Duck typing accepts it', score: 2, effects: { 'future pain': -10 }, feedback: 'Matching the method is enough in JavaScript. A written description of that expected method is still wise.' },
            { label: 'It must extend `BaseExporter`', score: 1, effects: { 'future pain': -3 }, feedback: 'Some languages demand that. JavaScript does not: a matching method is enough.' },
            { label: 'It must be registered in the switch statement', score: 0, effects: { 'future pain': 15 }, feedback: 'That would mean editing the original code for every new exporter, which is exactly what we avoided.' }
          ] }
      ],
      outro: 'When the same "what kind is it?" check keeps appearing, **move the answer into the objects**.' },

    { type: 'explain', prompt: 'Explain polymorphism to a friend using the shipping example, and why it beats a switch statement.',
      model: 'Polymorphism means sending the same message, like cost, to different objects and each one answering in its own way, chosen at run time by the actual object. The checkout just calls shipping.cost and never asks which kind it is. With a switch, every new kind means editing that switch and every copy of it; with polymorphism you add a new class and nothing existing changes.',
      keywords: ['same', 'message', 'object', 'run time', 'switch', 'new class'] }
  ],

  flashcards: [
    { q: 'What is polymorphism?', a: 'One call that behaves differently depending on which object receives it. The caller does not need to know the kind.' },
    { q: 'What is subtype polymorphism?', a: 'Several types share a common shape (a base class or interface), so code written for that shape works with any of them.' },
    { q: 'How does polymorphism replace a switch statement?', a: 'Each case becomes a class with the same method. The caller calls the method rather than checking a label, so new cases are new classes.' },
    { q: 'What is duck typing?', a: 'If an object has the methods you call, it is usable, whatever its declared type. JavaScript and Python work this way.' },
    { q: 'Overriding vs overloading?', a: 'Overriding: a subclass replaces an inherited method, chosen at run time. Overloading: same name, different parameters, usually chosen at compile time. JavaScript has no overloading.' }
  ],

  glossary: [
    { term: 'Polymorphism', def: 'Sending the same message to different objects, each of which responds in its own way.', like: 'Pressing Play on an MP3, a podcast or a radio stream.' },
    { term: 'Subtype polymorphism', def: 'Polymorphism where code is written against a common type and works with any subtype.', like: 'A plug socket that accepts any appliance with the right plug.' },
    { term: 'Duck typing', def: 'Using an object because it has the right methods, not because of its declared type.', like: 'Hiring anyone who can drive, without asking where they learned.' },
    { term: 'Overloading', def: 'Several methods with the same name but different parameter lists in the same class, chosen by the arguments. Not available in plain JavaScript.', like: 'A shop till that handles "scan item" and "scan item with a coupon".' }
  ],

  takeaways: [
    'Polymorphism = **one call, many behaviours**, chosen by the object at run time.',
    'It replaces repeated `switch` / `instanceof` ladders: each case becomes a class.',
    'JavaScript uses **duck typing**: the right method is enough, but mistakes surface late.',
    '**Overriding** (run time, subclasses) is not **overloading** (same name, different parameters).'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-abstract-concrete', {
  eli5: 'An abstract class is a half-finished blueprint: it holds the shared parts and leaves some blanks, and you can only build things from the concrete classes that fill the blanks in.',

  cards: [
    { kind: 'concept', title: 'Nobody opens a "generic account"',
      body: `Go into a bank and ask for "an account". The clerk asks: *savings or current?* Nobody can open a plain, unspecific account, because it does not exist as a real product.

        Yet in code we like a class called \`Account\` that holds everything the real ones share: the balance, \`deposit\`, the monthly statement.

        So we want a class that exists to be **extended** and must never be created directly. That is an **abstract class**.

        A class you *can* create, one that is complete and ready for use, is a **concrete class**.

        > Abstract = "unfinished on purpose". Concrete = "finished, build me".` },

    { kind: 'metaphor', title: 'A recipe with a gap',
      body: `A cake recipe says: *preheat the oven, cream the butter and sugar, **add the flavour**, bake for 40 minutes, cool.*

        Everything is spelled out except one step: "add the flavour". You cannot bake "a cake" from this recipe. You must first decide: lemon or chocolate.

        - The **recipe** is the abstract class: shared steps, plus a gap.
        - **Lemon cake** and **chocolate cake** are concrete classes: each fills the gap and gets baked.

        The recipe guarantees that every cake follows the same steps. Each cake only decides what is different.` },

    { kind: 'code', title: 'An abstract class',
      body: `This is TypeScript, because it has the \`abstract\` keyword. Java and C# have it too. Plain JavaScript has no such keyword and relies on convention (the next-but-one card shows the trick).`,
      code: { lang: 'ts', src: `
        abstract class Account {
          protected balance = 0;

          deposit(amount: number): void {
            this.balance += amount;
          }

          abstract monthEnd(): void;

          runMonthEnd(): void {
            this.monthEnd();
            console.log('Statement sent');
          }
        }`,
        notes: {
          1: '`abstract` means: **you cannot write `new Account()`**. It exists only to be extended.',
          2: 'Shared **state**. (`protected` means "visible to subclasses but not to outsiders"; a later lesson covers it.)',
          4: 'Shared, finished code. Every account type gets `deposit` as is.',
          8: 'An **abstract method**: a name and a signature, no body. It is a contract: *every concrete subclass must provide this.*',
          10: 'Shared code that **relies on the missing piece**. The base class decides the order of events and the subclass supplies one step.'
        } } },

    { kind: 'code', title: 'Concrete classes finish the job',
      body: 'Each concrete class fills in the blank. Only these can be created.',
      code: { lang: 'ts', src: `
        class SavingsAccount extends Account {
          rate = 0.03;
          monthEnd(): void {
            this.balance += (this.balance * this.rate) / 12;
          }
        }

        class CurrentAccount extends Account {
          monthEnd(): void {
            this.balance -= 5;
          }
        }

        const a = new Account();
        const s = new SavingsAccount();`,
        notes: {
          3: 'This **completes the contract**. If a subclass forgets, the compiler complains that it does not implement `monthEnd`.',
          9: 'A different answer to the same blank: a flat monthly fee.',
          14: 'Compile error: *cannot create an instance of an abstract class.*',
          15: 'Fine: a savings account is concrete and complete.'
        } } },

    { kind: 'steps', title: 'Contract plus shared code',
      body: 'An abstract class gives you two things at once. Watch them work together.',
      steps: [
        { title: 'The caller holds an Account', body: 'It might be savings, it might be current. The code does not care.' },
        { title: 'It calls `runMonthEnd()`', body: 'That method is written **once**, in the abstract class, and is identical for every account.' },
        { title: 'The shared code reaches the blank', body: '`runMonthEnd` calls `this.monthEnd()`. This is the one step that differs.' },
        { title: 'The concrete class answers', body: 'Savings adds interest. Current charges its fee. The right one runs at run time (polymorphism).' },
        { title: 'Shared code carries on', body: 'The statement is sent. All account types now behave consistently with only the differences written out.' }
      ] },

    { kind: 'compare', title: 'Abstract vs concrete',
      body: 'Side by side:',
      cols: ['Abstract class', 'Concrete class'],
      rows: [
        ['Can you `new` it?', 'No', 'Yes'],
        ['Has unfinished methods?', 'May have: abstract methods with no body', 'No: everything is implemented'],
        ['Holds shared code and state?', 'Yes', 'Yes'],
        ['Purpose', 'A foundation and a contract for subclasses', 'A usable thing in your program'],
        ['Who uses it directly?', 'Only subclasses', 'Anyone']
      ] },

    { kind: 'code', title: 'Faking it in plain JavaScript',
      body: 'No keyword, so the base class checks itself at run time, and the "abstract" method throws if nobody replaced it.',
      code: { lang: 'js', src: `
        class Account {
          constructor() {
            if (new.target === Account) {
              throw new Error('Account is abstract');
            }
          }
          monthEnd() {
            throw new Error('Subclass must implement monthEnd');
          }
        }`,
        notes: {
          3: '`new.target` is the class that `new` was actually called on. If it is `Account` itself, someone tried to create the unfinished thing.',
          8: 'If a subclass forgets to override, the error appears only when the method **runs**, not when the code is checked. That is the gap that `abstract` in TypeScript or Java closes.'
        } } },

    { kind: 'pitfall', title: 'The abstract class that does too much',
      body: `Abstract base classes are tempting because they let you share code. They go wrong when:

        - the base class holds **lots of state** that only some subclasses need
        - it has **many abstract methods**, so writing a subclass is a form-filling exercise
        - subclasses are forced to implement methods that make **no sense for them**, and leave them empty or throwing
        - **hierarchies stack up**: an abstract class extending another abstract class, extending another…

        Each of these is a sign that the base class is trying to be too many things. The fragile base class problem from the inheritance lesson applies in full.` },

    { kind: 'tip', title: 'Choosing between them',
      body: `A simple way to choose:

        - **Default to concrete.** If a class makes sense on its own, make it concrete.
        - Go **abstract** when (a) at least two variants really exist, (b) they share meaningful code or state, and (c) the base alone would be meaningless, as with "a generic account".
        - If you only want the *contract*, with no shared code, the next lesson's tool, the **interface**, is lighter.

        Keep abstract methods few. Two or three is a contract. Ten is a burden.` }
  ],

  activities: [
    { type: 'tf', after: 1, statement: 'You can build a working cake directly from an abstract recipe, as long as you follow the shared steps.', answer: false,
      explain: 'The recipe has a gap ("add the flavour"), so there is nothing finished to bake. In code, an abstract class cannot be instantiated for the same reason. You need a concrete subclass that fills the blank.' },

    { type: 'mcq', after: 3, q: 'In TypeScript, a developer writes `class PrepaidAccount extends Account` and forgets to write `monthEnd()`. What happens?',
      options: ['A compile error: the abstract method is not implemented', 'It compiles; `monthEnd` is silently an empty method', 'It compiles, but `deposit` stops working', 'It compiles and `monthEnd` runs the base version'],
      answer: 0,
      why: [null, 'Abstract methods have no body to inherit, and the compiler will not invent one.', 'Nothing about `deposit` depends on `monthEnd`.', 'There is no base version. An abstract method has no body.'],
      explain: 'This is the point of an abstract method: a contract the compiler enforces. Forgetting the method is caught before the program runs.' },

    { type: 'bucket', after: 5, prompt: 'Which description fits an abstract class, and which a concrete class?', buckets: ['Abstract class', 'Concrete class'],
      items: [['`new` on it is a compile error', 0], ['May contain a method with no body', 0], ['Every method is fully written', 1], ['You create objects from it directly', 1], ['Exists to be extended, never built on its own', 0], ['`SavingsAccount`', 1]],
      explain: 'Abstract means "unfinished on purpose" and cannot be built. Concrete means complete, so you can create it.' },

    { type: 'cloze', code: true, text: '{{abstract}} class Report {\n  render(): string {\n    return this.header() + this.body();\n  }\n  header(): string { return "Monthly"; }\n  abstract {{body}}(): string;\n}',
      distractors: ['interface', 'final', 'render'],
      explain: 'The same keyword marks both the class (cannot be created) and the method (no body, subclasses must supply it).' },

    { type: 'spot', prompt: 'Plain JavaScript has no `abstract` keyword, so this mistake only appears at run time. Tap the buggy line.',
      code: { lang: 'js', src: `
        class Notifier {
          send(message) {
            throw new Error('not implemented');
          }
        }
        class SmsNotifier extends Notifier {
          sed(message) { /* sends an SMS */ }
        }
        new SmsNotifier().send('Order shipped');` },
      lines: [7],
      explain: 'The method is misspelt `sed`, so `send` is never overridden and the base version throws when called. A typed `abstract` method would have been flagged the moment the class was compiled.' },

    { type: 'ab', q: 'Every account type must say what happens at month end. Which base class enforces that?',
      a: { lang: 'ts', label: 'Default that does nothing', src: `
        class Account {
          monthEnd(): void {}
        }` },
      b: { lang: 'ts', label: 'Abstract method', src: `
        abstract class Account {
          abstract monthEnd(): void;
        }` },
      answer: 'b',
      explain: 'With an empty default, a new subclass can forget `monthEnd` and the account quietly does nothing for ever. The abstract method makes the omission an error.' },

    { type: 'scenario', title: 'Design review: report formats',
      intro: 'A teammate has written `class Report` with a `generate()` method that builds a title, loads data, formats it, and adds a footer. Formats differ only in the formatting step. There are already two real formats, PDF and CSV.',
      meters: { 'design clarity': 50, 'maintainability': 50 },
      steps: [
        { text: 'The title, data loading and footer are identical for both formats. What shape do you recommend?',
          choices: [
            { label: 'An abstract `Report` with the shared steps in `generate()` and an abstract `format()`; `PdfReport` and `CsvReport` implement it', score: 2, effects: { 'design clarity': 25, 'maintainability': 20 }, feedback: 'Two real variants sharing real code, with a base that makes no sense alone. A good fit.' },
            { label: 'One concrete `Report` with a `type` string and an `if` in `format()`', score: 1, effects: { 'design clarity': 5, 'maintainability': 5 }, feedback: 'It works, but each new format reopens the same class, and the `if` will spread.' },
            { label: 'Two separate classes with the shared code copied into both', score: 0, effects: { 'maintainability': -25 }, feedback: 'The footer will be fixed in one and forgotten in the other.' }
          ] },
        { text: 'Someone proposes adding `sendEmail()`, `archive()`, `printToPaper()` and `translate()` as abstract methods "for completeness". The CSV report cannot sensibly do half of those.',
          choices: [
            { label: 'Keep abstract methods to the one genuine blank. Handle the rest in separate classes or only where needed', score: 2, effects: { 'design clarity': 15, 'maintainability': 15 }, feedback: 'A short contract stays easy to implement and honest.' },
            { label: 'Add them all; subclasses can leave unused ones empty', score: 0, effects: { 'design clarity': -20, 'maintainability': -15 }, feedback: 'Empty methods that pretend to work are traps.' },
            { label: 'Add them all and make CSV throw "not supported"', score: 1, effects: { 'design clarity': -5, 'maintainability': -5 }, feedback: 'Honest at run time, but the design still promises things that are false.' }
          ] },
        { text: 'The team now has a single report that is only ever generated as PDF and no other format is planned. Should it still be abstract?',
          choices: [
            { label: 'No: with one variant and none planned, make it concrete and add the abstraction when a second format appears', score: 2, effects: { 'design clarity': 10, 'maintainability': 10 }, feedback: 'Default to concrete. The abstract class earns its place when variants appear.' },
            { label: 'Yes: abstract classes are always better design', score: 0, effects: { 'design clarity': -10 }, feedback: 'An abstract class with one subclass is just indirection.' },
            { label: 'Yes, but also add an interface for it', score: 0, effects: { 'design clarity': -15 }, feedback: 'Two layers over one class: more to read, nothing gained.' }
          ] }
      ],
      outro: 'Abstract when the variants and the shared code are **real**, concrete the rest of the time.' },

    { type: 'explain', prompt: 'Explain to a colleague what an abstract method is, and why an abstract class can still contain ordinary finished methods.',
      model: 'An abstract method has a name and signature but no body, so every concrete subclass must supply it. It acts as a contract. An abstract class can also hold shared code and state that all subclasses inherit unchanged, and that shared code can even call the abstract method. The class itself cannot be instantiated because part of it is unfinished.',
      keywords: ['no body', 'contract', 'subclass', 'shared', 'cannot be instantiated', 'concrete'] }
  ],

  flashcards: [
    { q: 'What is an abstract class?', a: 'A class that cannot be instantiated directly. It exists to be extended, and may hold shared code, shared state and abstract methods.' },
    { q: 'What is an abstract method?', a: 'A method with a signature but no body. Every concrete subclass must implement it, so it acts as a contract.' },
    { q: 'What is a concrete class?', a: 'A complete class with every method implemented, so you can create objects from it.' },
    { q: 'How do you fake abstract classes in plain JavaScript?', a: 'Check `new.target` in the constructor and throw if it is the base class, and make the "abstract" methods throw. Errors appear at run time, not compile time.' },
    { q: 'When should a class be abstract?', a: 'When at least two real variants share meaningful code or state and the base alone would make no sense. Otherwise default to concrete.' }
  ],

  glossary: [
    { term: 'Abstract class', def: 'A class that cannot be created directly. It supplies shared code and may declare abstract methods that subclasses must implement.', like: 'A recipe with one blank step.' },
    { term: 'Abstract method', def: 'A method declared without a body. Concrete subclasses must provide one.', like: 'The "add the flavour" line in the recipe.' },
    { term: 'Concrete class', def: 'A class that is fully implemented and can be instantiated.', like: 'Lemon cake, ready to bake.' },
    { term: 'Instantiate', def: 'To create an object from a class, with `new`.', like: 'Baking a cake from the recipe.' }
  ],

  takeaways: [
    'Abstract class = **shared code + blanks**, built only through concrete subclasses.',
    'An abstract method is a **contract** the compiler (in typed languages) enforces.',
    'TypeScript, Java and C# have `abstract`. Plain JavaScript uses `new.target` and throwing, at run time.',
    'Default to concrete. Keep abstract methods few.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-interfaces', {
  eli5: 'An interface is a list of promises about what an object can do, with no code inside, so anything that keeps those promises can be plugged in.',

  cards: [
    { kind: 'concept', title: 'Pay with anything',
      body: `A shop accepts cards, PayPal and gift vouchers. Behind the scenes these have nothing in common: different companies, different rules, different code.

        But the checkout only needs one thing from each: **"charge this amount, tell me if it worked."**

        An **interface** writes down exactly that. It is a list of method names and their shapes, with **no code at all**. Anything that provides those methods can be used wherever the interface is expected.

        > An abstract class says "here is a half-built thing". An interface says "here is what I expect you to be able to do", and nothing else.` },

    { kind: 'metaphor', title: 'The plug socket',
      body: `A wall socket promises: *give me a plug of this shape and I will supply power.* It knows nothing about kettles, lamps or phone chargers. It does not care.

        And a kettle knows nothing about which power station is behind the wall. It just has the right plug.

        The **socket shape** is the interface. Appliances that fit it are the implementations. Either side can change completely, and nothing breaks, as long as the shape stays the same.` },

    { kind: 'code', title: 'Writing an interface',
      body: `TypeScript, Java and C# have an \`interface\` keyword. Plain JavaScript has none: it relies on convention (and on duck typing from the polymorphism lesson). Here is TypeScript.`,
      code: { lang: 'ts', src: `
        interface PaymentMethod {
          charge(amount: number): boolean;
        }

        class CardPayment implements PaymentMethod {
          charge(amount: number): boolean {
            // call the card processor
            return true;
          }
        }

        class VoucherPayment implements PaymentMethod {
          balance = 20;
          charge(amount: number): boolean {
            if (amount > this.balance) return false;
            this.balance -= amount;
            return true;
          }
        }`,
        notes: {
          1: 'Just a **name and a signature**. No body, no fields, no behaviour.',
          5: '`implements` is a promise: this class has every method the interface lists. The compiler checks.',
          13: 'A completely different way of doing it. The interface does not care how.'
        } } },

    { kind: 'compare', title: 'Interface vs abstract class',
      body: 'They look similar but serve different purposes.',
      cols: ['Interface', 'Abstract class'],
      rows: [
        ['Holds code and state?', 'No: a pure contract (Java and C# now allow limited default methods)', 'Yes: shared methods and fields'],
        ['How many can a class use?', 'As many as it likes', 'Only one parent class'],
        ['Says', '"You can do these things"', '"You are a kind of this, and here is some help"'],
        ['Relationship', 'Can-do (a role)', 'Is-a (a family)'],
        ['Best for', 'Letting unrelated things be used the same way', 'Variants that share real code']
      ],
      note: 'In TypeScript, Java and C# a class extends one parent class but may implement many interfaces.' },

    { kind: 'code', title: 'Implementing several interfaces',
      body: 'Because an interface is only a promise, a class can make several.',
      code: { lang: 'ts', src: `
        interface Printable {
          print(): string;
        }
        interface Payable {
          amountDue(): number;
        }

        class Invoice implements Printable, Payable {
          print(): string { return 'Invoice #1042'; }
          amountDue(): number { return 120; }
        }`,
        notes: {
          8: 'One class, two roles. A print queue sees a `Printable`. A debt-collection report sees a `Payable`. Neither knows about the other.',
          10: 'Both promises must be fully kept, or the compiler complains.'
        } } },

    { kind: 'diagram', title: 'Coding to an interface',
      body: 'The checkout depends on the **interface**, not on any particular payment class.',
      nodes: [
        { id: 'co', label: 'Checkout', icon: '🛒', x: 1, y: 0 },
        { id: 'pm', label: '«interface» PaymentMethod', x: 1, y: 1, tone: 'accent' },
        { id: 'card', label: 'CardPayment', x: 0, y: 2 },
        { id: 'pp', label: 'PayPalPayment', x: 1, y: 2 },
        { id: 'v', label: 'VoucherPayment', x: 2, y: 2 }
      ],
      edges: [
        { from: 'co', to: 'pm', label: 'uses' },
        { from: 'card', to: 'pm', label: 'implements', dashed: true },
        { from: 'pp', to: 'pm', dashed: true },
        { from: 'v', to: 'pm', dashed: true }
      ],
      caption: 'Add Apple Pay tomorrow: write one new class. Checkout is untouched, and in tests you can plug in a fake that always says yes.' },

    { kind: 'code', title: 'Small role interfaces',
      body: 'An interface should describe **one role**. Fat interfaces force implementers to carry things they do not need.',
      code: { lang: 'ts', src: `
        // too big
        interface OrderStore {
          find(id: string): Order;
          save(order: Order): void;
          remove(id: string): void;
          exportToCsv(): string;
        }

        // small roles
        interface OrderReader { find(id: string): Order; }
        interface OrderWriter { save(order: Order): void; }`,
        notes: {
          2: 'Every user of this must accept, and every implementer must write, all four methods.',
          10: 'A report page only needs to **read**. Give it an `OrderReader` and it cannot delete anything even by accident.',
          11: 'A test fake for writers is now one short method.'
        } },
      note: 'This idea has a name, the Interface Segregation Principle, covered in the next module.' },

    { kind: 'pitfall', title: 'Interfaces nobody asked for',
      body: `Two classic mistakes:

        **One interface per class, "just in case".** If \`UserService\` has an interface \`IUserService\` and only ever one implementation, you have doubled the files and gained nothing. Create the interface when a second implementation or a test fake genuinely needs it.

        **Changing an interface later.** Every class that implements it must change too. An interface is a promise made to many parties, so it is far harder to alter than a private method. Think before you publish one.` },

    { kind: 'tip', title: 'Code to the interface, not the class',
      body: `The habit: write functions that **ask for the role they need**, not the concrete class.

        \`function checkout(cart, pay: PaymentMethod)\` rather than \`function checkout(cart, pay: CardPayment)\`.

        The second version quietly rules out vouchers, PayPal and test fakes. The first welcomes anything that keeps the promise.

        In TypeScript the interface vanishes when the code is compiled to JavaScript: it exists to check your work, and costs nothing at run time.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What does `class VoucherPayment implements PaymentMethod` promise?',
      options: ['That the class has all the methods the interface lists', 'That the class inherits working code from `PaymentMethod`', 'That `PaymentMethod` is a parent class of `VoucherPayment`', 'That `VoucherPayment` can never be changed'],
      answer: 0,
      why: [null, 'An interface contains no code, so there is nothing to inherit.', 'An interface is a contract, not a parent class with state and behaviour.', '`implements` constrains what the class must have, not whether it can change.'],
      explain: '`implements` is a checked promise: the class must provide every listed method. No code comes across.' },

    { type: 'bucket', after: 3, prompt: 'Interface, abstract class, or both?', buckets: ['Interface', 'Abstract class'],
      items: [['A class can use many of them', 0], ['Can hold shared fields and ready-made methods', 1], ['Describes a role: what you can do', 0], ['Describes a family: what you are a kind of', 1], ['A pure contract with no body', 0], ['A class may extend only one', 1]],
      explain: 'Interfaces are roles and contracts, and a class can play many. Abstract classes are families with shared code, and a class can belong to only one.' },

    { type: 'tf', after: 5, statement: 'If a function takes a `PaymentMethod` interface, it can be tested with a fake payment class that always succeeds.', answer: true,
      explain: 'The function only depends on the promise. A fake that keeps the promise (`charge` returns true) slots in, which is one of the main practical benefits of coding to an interface.' },

    { type: 'spot', prompt: 'This interface is too big for one of its implementers. Tap the lines that show the problem.',
      code: { lang: 'ts', src: `
        interface Device { print(): void; scan(): void; fax(): void; }
        class BasicPrinter implements Device {
          print() { /* prints */ }
          scan() { throw new Error('Not supported'); }
          fax() { throw new Error('Not supported'); }
        }` },
      lines: [4, 5],
      explain: 'The printer is forced to pretend it can scan and fax. Splitting `Device` into small role interfaces (`Printer`, `Scanner`, `Fax`) means each class promises only what it can do.' },

    { type: 'ab', q: 'Which function is more flexible?',
      a: { lang: 'ts', label: 'Asks for a class', src: `
        function checkout(cart: Cart, pay: CardPayment) {
          pay.charge(cart.total);
        }` },
      b: { lang: 'ts', label: 'Asks for a role', src: `
        function checkout(cart: Cart, pay: PaymentMethod) {
          pay.charge(cart.total);
        }` },
      answer: 'b',
      explain: 'Asking for the interface accepts cards, vouchers, PayPal and test fakes. Asking for `CardPayment` excludes everything else for no reason.' },

    { type: 'cloze', code: true, text: '{{interface}} Printable {\n  print(): string;\n}\n\nclass Invoice {{implements}} Printable {\n  print(): string { return "Invoice"; }\n}',
      distractors: ['abstract', 'extends', 'class'],
      explain: '`interface` declares the contract. `implements` says a class keeps it. (`extends` is for inheriting from a parent class.)' },

    { type: 'multi', q: 'Which of these are good reasons to introduce an interface?',
      options: ['Two or more different classes must be usable by the same calling code', 'You need a simple fake in tests instead of a real payment processor', 'A report only needs to read data and should be unable to write', 'Every class should have one, just in case', 'You want shared code between variants'],
      answers: [0, 1, 2],
      explain: 'Interchangeable implementations, test fakes and narrow roles are the real payoffs. "Just in case" adds files without value, and shared code is what an abstract class is for.' },

    { type: 'scenario', title: 'Review: the email sender',
      intro: 'Your app sends order receipts with a class called `SmtpMailer`. A new pull request wants to add an SMS option for urgent alerts, and QA complains that tests send real emails.',
      meters: { 'test speed': 40, 'flexibility': 40 },
      steps: [
        { text: 'The checkout code currently calls `new SmtpMailer().send(...)` directly. What do you suggest?',
          choices: [
            { label: 'Define a small interface `Notifier { send(to, text) }`. `SmtpMailer` and `SmsSender` both implement it, and checkout receives one', score: 2, effects: { 'test speed': 25, 'flexibility': 30 }, feedback: 'A real second implementation and a real testing need: two solid reasons. Checkout is now independent of how messages travel.' },
            { label: 'Add `if (type === "sms")` inside `SmtpMailer`', score: 0, effects: { 'flexibility': -10 }, feedback: 'The mailer now sends texts, which is not what its name says, and tests still send real emails.' },
            { label: 'Make `SmsSender` extend `SmtpMailer` to reuse it', score: 0, effects: { 'flexibility': -15 }, feedback: 'An SMS sender is not a kind of SMTP mailer. It would inherit methods that make no sense.' }
          ] },
        { text: 'A colleague wants the interface to also include `retry()`, `getQueueLength()`, `formatHtml()` and `getStatistics()`, "so everyone has them".',
          choices: [
            { label: 'Keep it small: just `send`. Add other roles as separate interfaces only if someone needs them', score: 2, effects: { 'flexibility': 15 }, feedback: 'Small interfaces are easy to implement and easy to fake.' },
            { label: 'Add them all', score: 0, effects: { 'flexibility': -20, 'test speed': -15 }, feedback: 'Every implementer and every test fake must now write all of them, including ones that make no sense for SMS.' },
            { label: 'Add them, but let SMS throw for the ones it cannot do', score: 1, effects: { 'flexibility': -8 }, feedback: 'It runs, but the interface now promises things that are not true.' }
          ] },
        { text: 'For the tests, what is the neatest way to stop real emails going out?',
          choices: [
            { label: 'A tiny `FakeNotifier` that implements `Notifier` and records messages in a list', score: 2, effects: { 'test speed': 30 }, feedback: 'Fast, offline and you can assert on exactly what was sent.' },
            { label: 'Comment out the send call while testing', score: 0, effects: { 'test speed': -10 }, feedback: 'Now the tests do not test sending, and someone will forget to uncomment it.' },
            { label: 'Use a real test mailbox and wait for the messages', score: 1, effects: { 'test speed': -5 }, feedback: 'Realistic, but slow and fragile for everyday tests.' }
          ] }
      ],
      outro: 'Create an interface for a **real second implementation or a real need**, and keep it small.' },

    { type: 'explain', prompt: 'Explain when you would pick an interface over an abstract class.',
      model: 'An interface is a pure contract with no code: it lists what an object can do, and a class can implement as many as it likes. An abstract class is a family with shared code and state, and a class can extend only one. I would choose an interface when unrelated classes must be used in the same way, or when I want fakes in tests, and an abstract class when variants really share code.',
      keywords: ['contract', 'no code', 'many', 'shared code', 'abstract class', 'role'] }
  ],

  flashcards: [
    { q: 'What is an interface?', a: 'A list of method signatures with no implementation: a contract that any class can promise to keep.' },
    { q: 'Interface vs abstract class?', a: 'An interface is a pure contract and a class can implement many. An abstract class can hold shared code and state, and a class can extend only one.' },
    { q: 'What does "code to an interface" mean?', a: 'Write functions that accept the role they need, such as PaymentMethod, rather than a specific class, so any implementation can be plugged in.' },
    { q: 'Why prefer small role interfaces?', a: 'Implementers only promise what they can do, and callers only get the power they need.' },
    { q: 'Does plain JavaScript have interfaces?', a: 'No keyword. It relies on convention and duck typing. TypeScript, Java and C# have an `interface` keyword.' }
  ],

  glossary: [
    { term: 'Interface', def: 'A contract listing method names and shapes with no code. Classes that implement it promise to provide those methods.', like: 'The shape of a plug socket.' },
    { term: 'Implements', def: 'The keyword by which a class promises to provide everything an interface lists.', like: 'Signing up to the socket standard.' },
    { term: 'Role interface', def: 'A small interface that describes one narrow role, such as reading or writing.', like: 'A job title with one clear duty.' },
    { term: 'Coding to an interface', def: 'Making your code depend on a contract rather than a specific class.', like: 'Asking for "a driver" rather than "Dave".' }
  ],

  takeaways: [
    'An interface is a **pure contract**: names and shapes, no code.',
    'A class can implement **many** interfaces but extend only one class.',
    'Ask for the **role** (`PaymentMethod`), not the class (`CardPayment`).',
    'Keep interfaces **small**, and create them for real needs, not "just in case".'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-visibility', {
  eli5: 'Visibility rules decide which parts of your code can see and use which other parts, so you can keep most things private and only expose what other people truly need.',

  cards: [
    { kind: 'concept', title: 'The method you can never rename',
      body: `A developer writes a small helper on a class, \`calcTaxInternal()\`, and forgets to mark it private. It is public by default.

        A year later, forty other places in the codebase call it, because it was there. Now it cannot be renamed, changed or deleted without breaking all forty.

        An accident turned an implementation detail into a **promise**.

        **Visibility** (also called *access control*) is how a language lets you decide, for each piece of a class, **who is allowed to see and touch it**. Used carefully, it keeps your promises few and your freedom large.` },

    { kind: 'metaphor', title: 'A hotel',
      body: `A hotel has areas with different rules:

        - the **lobby** and reception desk: anyone may walk in. *(public)*
        - the **staff corridors**: open to anyone employed by *this hotel*, but not guests. *(package or internal)*
        - the **family wing** of the owners: only the family, and their descendants. *(protected)*
        - your **room safe**: you and only you. *(private)*

        Nobody complains that the safe is locked. That is what lets you trust the hotel with your passport.`,
      note: 'Where it stops being true: in a hotel, security is physical. In code, access rules are checked by the language, and usually only by the compiler. They protect against mistakes, not malice.' },

    { kind: 'compare', title: 'The four levels',
      body: 'Names vary by language, but the ideas are almost universal.',
      cols: ['Who can use it', 'Typical keyword'],
      rows: [
        ['**Public**', 'Any code anywhere', '`public`'],
        ['**Protected**', 'The class itself and its subclasses', '`protected`'],
        ['**Package / internal**', 'Code in the same package or assembly', 'Java: no keyword (the default). C#: `internal`'],
        ['**Private**', 'Only code inside the class itself', '`private`, or `#name` in JavaScript']
      ],
      note: 'TypeScript has public, protected and private (but no package level). Plain JavaScript has `#private` fields and uses module exports to hide things at file level.' },

    { kind: 'code', title: 'All the levels in one place',
      body: `TypeScript syntax, since plain JavaScript lacks \`public\` and \`protected\` keywords. TypeScript, Java and C# all have them. Tap the highlighted lines.`,
      code: { lang: 'ts', src: `
        class Account {
          public owner: string;
          protected balance = 0;
          private log: string[] = [];

          constructor(owner: string) {
            this.owner = owner;
          }

          protected record(note: string): void {
            this.log.push(note);
          }
        }

        class Savings extends Account {
          addInterest(): void {
            this.balance += 1;
            this.record('interest');
            this.log.push('x');
          }
        }

        new Account('Sam').balance;`,
        notes: {
          2: '**public**: anybody may read or change the owner.',
          3: '**protected**: this class and its subclasses only.',
          4: '**private**: only code written inside `Account` itself. Not even a subclass.',
          10: 'A protected **method**: a helper offered to subclasses, still hidden from the outside world.',
          17: 'Allowed: `balance` is protected, and `Savings` is a subclass.',
          19: 'Compile error: `log` is private to `Account`, so the subclass cannot touch it.',
          23: 'Compile error: outside code cannot see a protected field.'
        } } },

    { kind: 'code', title: 'Keep the public surface small',
      body: 'Every public member is a promise you must keep. A tiny surface lets you rewrite the inside at will.',
      code: { lang: 'ts', src: `
        class Checkout {
          placeOrder(cart: Cart): Order {
            this.check(cart);
            return this.save(this.build(cart));
          }

          private check(cart: Cart): void { /* ... */ }
          private build(cart: Cart): Order { /* ... */ }
          private save(order: Order): Order { /* ... */ }
        }`,
        notes: {
          2: 'The **only** public method. Everyone else in the codebase can depend on this and nothing more.',
          7: 'The three steps are private, so they can be merged, split, reordered or renamed tomorrow and nobody outside will notice.'
        } },
      note: 'A useful rule: start with everything private. Widen only when a real caller needs it.' },

    { kind: 'code', title: 'Scope and lifetime of variables',
      body: `Visibility applies to variables too. **Scope** is *where a name can be seen*. **Lifetime** is *how long the value lives*.`,
      code: { lang: 'js', src: `
        let total = 0;

        function addToBasket(price) {
          const vat = price * 0.2;
          if (price > 100) {
            const bonus = 5;
            total += bonus;
          }
          console.log(bonus);
          total += price + vat;
        }`,
        notes: {
          1: 'Module-level. Visible to every function in this file and alive as long as the program runs. Wide scope, long life: handle with care.',
          4: 'Function-level. Created on each call and gone when the function returns.',
          6: '`const` and `let` are **block-scoped**: `bonus` exists only between the braces.',
          9: '`ReferenceError`: `bonus` is out of scope here. Narrow scope is a feature: nothing else can interfere with it.'
        } },
      note: 'The same instinct as private fields: make things visible as narrowly as possible, and live as briefly as needed.' },

    { kind: 'code', title: 'Static vs instance members',
      body: 'An **instance** member belongs to each object. A **static** member belongs to the class itself, with a single shared copy.',
      code: { lang: 'ts', src: `
        class Invoice {
          private static nextNumber = 1;
          readonly number: number;
          readonly amount: number;

          constructor(amount: number) {
            this.amount = amount;
            this.number = Invoice.nextNumber++;
          }

          static fromPence(pence: number): Invoice {
            return new Invoice(pence / 100);
          }
        }`,
        notes: {
          2: '**Static**: one counter for the whole class, shared by every invoice. Also private, so only `Invoice` can touch it.',
          3: '**Instance**: every invoice has its own number.',
          8: 'Static members are reached through the **class name**, not through an object.',
          11: 'A static method works without any invoice existing yet. It can use `new` to build one, but it cannot use `this.amount`: there is no object.'
        } } },

    { kind: 'pitfall', title: 'Statics and "public for the tests"',
      body: `Two habits that undermine everything above.

        **Mutable static state is a global variable in a costume.** If \`static currentUser\` can be changed from anywhere, any code can affect any other, and tests leak into each other. Constants (\`static readonly VAT = 0.2\`) are fine; changing shared values is where trouble starts.

        **Making something public just so a test can reach it.** Usually this means the private code deserves its own small class, or the test should go through the public method. Widening visibility for a test turns a detail into a promise again.` },

    { kind: 'tip', title: 'A quick decision guide',
      body: `When you add a member, ask in this order:

        1. Can it be **private**? Start there.
        2. Do subclasses genuinely need it? Then **protected** (and think about whether inheritance is the right tool at all).
        3. Does only my own module or package need it? Use **package or internal** where the language has it.
        4. Is it part of the promise to the world? Only then is it **public**.

        And for variables: **declare them as late and as close to their use as you can.**` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each level to who is allowed in.',
      pairs: [['public', 'Any code anywhere'], ['protected', 'The class and its subclasses'], ['private', 'Only code inside the class'], ['package / internal', 'Code in the same package or assembly']] },

    { type: 'mcq', after: 3, q: 'Using the `Account` and `Savings` classes above, which line would the compiler **reject**?',
      options: ['`this.log.push("x")` inside `Savings`, because `log` is private to `Account`', '`this.balance += 1` inside `Savings`, because `balance` is protected', '`this.record("interest")` inside `Savings`, because `record` is protected', '`new Account("Sam").owner`, because `owner` is public'],
      answer: 0,
      why: [null, 'Subclasses are allowed to use protected members.', 'Protected methods are exactly for subclasses to call.', 'Public means anyone can read it.'],
      explain: 'Private is stricter than protected: even subclasses are shut out. Only code written inside `Account` itself can touch `log`.' },

    { type: 'spot', prompt: 'This function has a scope bug. Tap the offending line.',
      code: { lang: 'js', src: `
        function applyCoupon(order) {
          if (order.total > 50) {
            const discount = order.total * 0.1;
            order.total -= discount;
          }
          console.log('Saved ' + discount);
          return order;
        }` },
      lines: [6],
      explain: '`discount` is declared with `const` inside the `if` block, so it does not exist outside it. Line 6 throws a ReferenceError. Declare it before the `if` if it is needed after.' },

    { type: 'bucket', after: 6, prompt: 'Static (one shared copy) or instance (one per object)?', buckets: ['Static', 'Instance'],
      items: [['The next invoice number to hand out', 0], ['The amount on a particular invoice', 1], ['A helper that builds an invoice from pence', 0], ['A customer’s name on their account', 1], ['A constant VAT rate shared by everything', 0], ['The balance of one account', 1]],
      explain: 'Ask: "is there one of these for the whole class, or one for each object?" Counters, constants and factory helpers are class-wide; data about a particular thing belongs to the instance.' },

    { type: 'tf', statement: 'If private code is complicated enough to need its own tests, extracting it into a small class of its own is a good fix.', answer: true,
      explain: 'Making the method public instead would turn a detail into a promise every caller can depend on. Test through the public method, or, if the hidden code is complicated enough to deserve its own tests, extract it into its own small class.' },

    { type: 'ab', q: 'Which class is easier to change in future?',
      a: { lang: 'ts', label: 'Everything public', src: `
        class Checkout {
          check(cart: Cart) { /* ... */ }
          build(cart: Cart) { /* ... */ }
          save(order: Order) { /* ... */ }
          placeOrder(cart: Cart) { /* uses the above */ }
        }` },
      b: { lang: 'ts', label: 'One public method', src: `
        class Checkout {
          placeOrder(cart: Cart) { /* uses helpers */ }
          private check(cart: Cart) { /* ... */ }
          private build(cart: Cart) { /* ... */ }
          private save(order: Order) { /* ... */ }
        }` },
      answer: 'b',
      explain: 'With one public method there is only one promise to keep. The helpers are free to be rewritten or deleted, because no outside code is allowed to depend on them.' },

    { type: 'cloze', code: true, text: 'class Invoice {\n  {{private}} {{static}} nextNumber = 1;\n  readonly number: number;\n\n  constructor() {\n    this.number = Invoice.nextNumber++;\n  }\n}',
      distractors: ['public', 'protected', 'instance'],
      explain: '`static` means one counter shared by the whole class. `private` stops outside code from changing it, which would let anyone corrupt the numbering.' },

    { type: 'scenario', title: 'Review: the shared settings',
      intro: 'A pull request adds a `Settings` class to an online shop. It holds `static currentCurrency`, set from the checkout page and read by the price display, the emailer and the invoice generator. Tests for the emailer now pass or fail depending on which test ran before them.',
      meters: { 'test reliability': 30, 'flexibility': 50 },
      steps: [
        { text: 'What is the underlying problem?',
          choices: [
            { label: 'A mutable static is shared global state: any code can change it, so tests and features affect each other invisibly', score: 2, effects: { 'test reliability': 15 }, feedback: 'Exactly. Static means one copy for the whole program, and mutable means anyone can change it.' },
            { label: 'Static variables are always wrong', score: 1, effects: { 'flexibility': -5 }, feedback: 'Too broad. Constants and counters are fine. Shared *mutable* state is the issue.' },
            { label: 'The tests are in the wrong order', score: 0, effects: { 'test reliability': -10 }, feedback: 'Reordering hides the symptom. The tests are right to complain.' }
          ] },
        { text: 'What do you suggest?',
          choices: [
            { label: 'Make currency an instance field on an object that is passed to the code that needs it', score: 2, effects: { 'test reliability': 30, 'flexibility': 15 }, feedback: 'Each caller (and each test) gets its own copy. Dependencies are visible in the code rather than hidden in a global.' },
            { label: 'Keep the static but add a `reset()` called before every test', score: 1, effects: { 'test reliability': 10 }, feedback: 'It patches the tests, but production code still shares the hidden state.' },
            { label: 'Make `currentCurrency` public so tests can set it directly', score: 0, effects: { 'test reliability': -10, 'flexibility': -10 }, feedback: 'It was already reachable from everywhere. That is the problem, not the solution.' }
          ] },
        { text: 'The team also has `static readonly VAT_RATE = 0.2`. Does that need to change?',
          choices: [
            { label: 'No: a fixed constant is shared and cannot be changed, so it carries none of the same risk', score: 2, effects: { 'flexibility': 10 }, feedback: 'Right: static is fine when nothing mutates it.' },
            { label: 'Yes: every static should become an instance field', score: 0, effects: { 'flexibility': -10 }, feedback: 'You would copy a constant into every object for no benefit.' },
            { label: 'Yes: make it private so nobody can read it', score: 1, effects: { 'flexibility': -5 }, feedback: 'Several modules legitimately need the rate. Hiding it just forces duplication.' }
          ] }
      ],
      outro: 'Statics are fine for **constants and class-level helpers**. Be wary of anything shared **and changeable**.' },

    { type: 'explain', prompt: 'Explain why "start with everything private" is a good habit.',
      model: 'Every public member is a promise other code can depend on, so it must keep working. If I start private, I can widen visibility the moment a real caller needs something, which is easy. Taking a public member back later breaks everyone who used it. A small public surface leaves me free to change the inside.',
      keywords: ['public', 'promise', 'depend', 'change', 'small', 'widen'] }
  ],

  flashcards: [
    { q: 'What are the four common visibility levels?', a: 'Public (anyone), protected (the class and its subclasses), package or internal (the same package or assembly), private (only the class).' },
    { q: 'Which levels exist in TypeScript?', a: 'public, protected and private. There is no package level. Plain JavaScript has `#private` fields and module exports.' },
    { q: 'What is the difference between scope and lifetime?', a: 'Scope is where a name can be seen. Lifetime is how long its value stays alive.' },
    { q: 'Static vs instance member?', a: 'A static member belongs to the class, with one shared copy. An instance member belongs to each object.' },
    { q: 'Why is mutable static state risky?', a: 'It is global state in disguise: any code can change it, so features and tests influence each other invisibly.' }
  ],

  glossary: [
    { term: 'Visibility', def: 'The rules about which code may see and use which members of a class.', aka: ['access modifier', 'access control'], like: 'Which hotel areas guests, staff and family may enter.' },
    { term: 'Protected', def: 'A member visible to its own class and to subclasses, but not to outside code.', like: 'The family wing of the hotel.' },
    { term: 'Scope', def: 'The region of code in which a name can be used.', like: 'The rooms where a keycard works.' },
    { term: 'Static member', def: 'A field or method that belongs to the class itself rather than to any one object.', like: 'The shared noticeboard, as opposed to each room’s own key.' }
  ],

  takeaways: [
    'Start **private**. Widen only for a real caller. Each public member is a promise.',
    'Protected is for subclasses, internal/package for the same module, public for the world.',
    'Declare variables in the **narrowest scope** and let them live no longer than needed.',
    '**Static** = one shared copy. Constants are fine; shared mutable state is a trap.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-domain-models', {
  eli5: 'A domain model is code shaped like the business it serves, with classes named after real things and methods named after real actions, so the business people and the programmers can talk about the same thing.',

  cards: [
    { kind: 'concept', title: 'The code that has no word for "cancel"',
      body: `A shop owner says: *"If a customer cancels before we ship, refund them. After shipping, they need to arrange a return."*

        A developer opens the code. There are tables called \`ord\` and \`ord_ln\`, a field \`status\` holding the number 3, and a script that sets \`status = 5\`.

        Nowhere does the word *cancel* appear. Nowhere does it say *shipped*. The rule exists only in people's heads.

        A **domain model** fixes that. The **domain** is the business area your software serves (selling things, running a bank, booking flights). A **model** of it is a set of classes and methods that look like the business: an \`Order\` that can be \`cancel()\`led, a \`Customer\`, a \`Product\`.` },

    { kind: 'metaphor', title: 'The architect’s scale model',
      body: `Before a building is built, an architect makes a scale model. It leaves out the plumbing, the wiring and the bricks, and shows the **shape**: where the rooms are, how they connect, how people will move.

        Everyone can look at it, point and say, *"that corridor is too narrow."* Clients, builders and architects all understand it.

        A domain model is a scale model of the business, written in code. It keeps what matters for the software's purpose and drops the rest. It is a **useful simplification**, not a copy of reality.` },

    { kind: 'steps', title: 'From nouns and verbs to classes',
      body: 'A practical starting recipe, using a sentence from the business.',
      steps: [
        { title: 'Get a real sentence', body: '*"A customer places an order for products. An order can be cancelled until it ships."*' },
        { title: 'Underline the nouns', body: 'Customer, order, product. These are **candidate classes**.' },
        { title: 'Underline the verbs', body: 'Places, cancelled, ships. These are **candidate methods**, on the class that owns the rule.' },
        { title: 'Look for the rules', body: '"Until it ships" is a rule: cancelling is allowed only before shipping. Rules go **inside** the method.' },
        { title: 'Check with the people who know', body: 'Show the names to the shop owner. If they frown at a word, the model is wrong, not them.' }
      ] },

    { kind: 'code', title: 'The sentence, in code',
      body: 'Tap the highlighted lines to match them back to the business sentence.',
      code: { lang: 'js', src: `
        class Order {
          #lines = [];
          #status = 'draft';

          constructor(id, customer) {
            this.id = id;
            this.customer = customer;
          }

          addLine(product, qty) {
            this.#lines.push({ product, qty });
          }

          place() {
            if (this.#lines.length === 0) throw new Error('Empty order');
            this.#status = 'placed';
          }

          cancel() {
            if (this.#status === 'shipped') throw new Error('Arrange a return');
            this.#status = 'cancelled';
          }
        }`,
        notes: {
          1: 'A **noun** from the sentence becomes a class.',
          6: '`id` is the order’s **identity**. It stays the same order even when its lines change.',
          14: 'A **verb** becomes a method: `place`. The business rule (no empty orders) sits inside it.',
          20: 'The rule from the sentence, "cancel until it ships", written in the code, in the words the shop owner would use.'
        } } },

    { kind: 'diagram', title: 'Relationships between the nouns',
      body: 'The model also records how things connect. One customer has many orders; each order has many lines; each line points at a product.',
      nodes: [
        { id: 'cust', label: 'Customer', icon: '🧑', x: 1, y: 0 },
        { id: 'ord', label: 'Order', icon: '🧾', x: 1, y: 1, tone: 'accent' },
        { id: 'line', label: 'OrderLine', x: 1, y: 2 },
        { id: 'prod', label: 'Product', icon: '📦', x: 1, y: 3 }
      ],
      edges: [
        { from: 'cust', to: 'ord', label: 'places (1 to many)' },
        { from: 'ord', to: 'line', label: 'contains (1 to many)' },
        { from: 'line', to: 'prod', label: 'refers to' }
      ],
      caption: 'Behaviour lives on the nouns: the order places and cancels itself, and the customer’s order list is not a free-for-all.' },

    { kind: 'concept', title: 'Entities: things with an identity',
      body: `Some things in the model are defined by **who they are**. Order 42 is still order 42 after you add a line, change its address or mark it shipped. Two orders with identical contents are still two different orders. These are **entities**: they have an identity that persists as their details change.

        Other things are defined purely by **their value**. A £5 note is interchangeable with any other £5. These are often modelled as small immutable **value objects**, like \`Money\`, and compared by their contents. (Domain-driven design, the approach that popularised these terms, uses both.)

        The question to ask is: *if two of these had the same details, would the business treat them as the same?* If not, it is an entity.` },

    { kind: 'sequence', title: 'The model as shared understanding',
      body: 'The model is a conversation tool as much as a code structure. Step through a typical exchange.',
      actors: ['Shop owner', 'Developer', 'Model (code)'],
      steps: [
        { from: 0, to: 1, label: '"Cancel after dispatch needs a return."', note: 'The owner explains the real rule, in their own words.' },
        { from: 1, to: 2, label: 'cancel() throws if shipped', note: 'The developer writes it into the model using the same words.' },
        { from: 2, to: 0, label: 'readable code', dashed: true, note: 'The owner (or a tester) can read `if (status === "shipped")` and say *yes, that is how we work*.' },
        { from: 0, to: 1, label: '"Oh, and partial shipments."', note: 'A gap shows up: an order can be *partly* shipped.' },
        { from: 1, to: 2, label: 'add partly-shipped state', note: 'The model changes **with** the business, and the vocabulary stays aligned.' }
      ] },

    { kind: 'pitfall', title: 'Models that mirror the wrong thing',
      body: `Three common ways to go wrong:

        - **Modelling the database.** Classes that copy table rows (\`OrderRow\`, \`ord_ln\`) describe how data is *stored*, not what the business *does*.
        - **Modelling the screens.** A class for each form on the website is a model of the interface, and will change whenever the design does.
        - **Nouns without verbs.** Classes with only fields and no behaviour look like a model but hold none of the business rules. The next lesson is about exactly this.

        And do not model **everything**. Include what matters for the software's job. A shop does not need the personality of every customer.` },

    { kind: 'tip', title: 'Make the model easy to talk about',
      body: `A good domain model passes the **read-aloud test**: you can read a few lines of the code to the shop owner and they nod.

        \`order.cancel()\` passes. \`processRecord(row, 5)\` does not.

        Habits that help:

        - sketch boxes and arrows on a whiteboard **with** the people who know the business
        - start with the one or two most important rules, not everything
        - rename classes the moment the business uses a better word
        - expect the model to change as you learn: it is a tool for **thinking**, not a drawing to be signed off` }
  ],

  activities: [
    { type: 'bucket', after: 2, prompt: 'From the sentence "A customer places an order for products; the order can be cancelled until it ships", what is each underlined idea probably?', buckets: ['A class', 'A method', 'A field'],
      items: [['Customer', 0], ['Product', 0], ['Order', 0], ['places an order', 1], ['cancelled', 1], ['ships', 1], ['quantity of each product', 2]],
      explain: 'Nouns that have their own rules and identity become classes. Verbs become methods on the class that owns the rule. Simple facts about a thing, like a quantity, are fields.' },

    { type: 'mcq', after: 5, q: 'Which of these is best modelled as an **entity**, with a lasting identity?',
      options: ['A customer’s order, which changes status over time', 'A £5 amount, where any £5 is as good as another', 'The colour "red" used on a sale badge', 'The number 42 printed on a receipt'],
      answer: 0,
      why: [null, 'Money is defined by its value: swapping one £5 for another changes nothing. That fits a value object.', 'A colour is just a value.', 'A number is a value.'],
      explain: 'An entity is tracked by identity: order 42 remains order 42 however its details change. Amounts and colours are values, compared by content.' },

    { type: 'ab', q: 'Which code could you read aloud to the shop owner?',
      a: { lang: 'js', label: 'Database-shaped', src: `
        processRecord(row, 5);` },
      b: { lang: 'js', label: 'Business-shaped', src: `
        order.cancel();` },
      answer: 'b',
      explain: 'The second uses the business’s own word, and the rule for cancelling lives behind it. The first only makes sense to someone who remembers what 5 means.' },

    { type: 'spot', prompt: 'This code lives in a checkout page. Tap the lines that show the business rule is written in a code nobody can read.',
      code: { lang: 'js', src: `
        const order = { id: 7, status: 3, lines: [] };

        // in the checkout page
        if (order.status !== 4) {
          order.status = 5;
        }` },
      lines: [4, 5],
      explain: 'Status codes 3, 4 and 5 are meaningless without a lookup table, and the rule "cancel unless shipped" is buried in a page. A model would have `order.cancel()`, with the words *shipped* and *cancelled* in the code.' },

    { type: 'match', prompt: 'Match each domain-modelling idea to its meaning.',
      pairs: [['Domain', 'The business area the software serves'], ['Entity', 'A thing with an identity that persists as its details change'], ['Value object', 'A thing defined entirely by its value, like an amount of money'], ['Domain model', 'Code whose classes and methods mirror the business'], ['Nouns and verbs', 'A first clue for classes and methods']] },

    { type: 'cloze', text: 'Nouns in a business sentence are candidate {{classes}}, verbs are candidate {{methods}}, and a rule like "until it ships" belongs {{inside}} the method.',
      distractors: ['tables', 'screens', 'outside'],
      explain: 'This is a starting heuristic, not a law, but it works surprisingly often. The rule lives in the method so nobody can skip it.' },

    { type: 'tf', statement: 'A good domain model copies every detail of the real world so nothing is missing.', answer: false,
      explain: 'A model is a useful simplification, built for a purpose. It keeps what matters for the software’s job and leaves the rest out, like the architect’s model that omits the plumbing.' },

    { type: 'scenario', title: 'Modelling a library',
      intro: 'A local library wants software. The head librarian explains: *"Members borrow books for three weeks. If a book is late, the member is fined per day. A member with unpaid fines cannot borrow."* You have an empty file.',
      meters: { 'model clarity': 30, 'librarian confidence': 40 },
      steps: [
        { text: 'Where do you start?',
          choices: [
            { label: 'Underline nouns and verbs: Member, Book, Loan, Fine; borrow, return, fine. Sketch them with the librarian', score: 2, effects: { 'model clarity': 30, 'librarian confidence': 25 }, feedback: 'You use her words and give her something she can correct. Quick, cheap feedback.' },
            { label: 'Design the database tables first and write classes that match them', score: 0, effects: { 'model clarity': -15, 'librarian confidence': -10 }, feedback: 'The classes will describe storage, not borrowing. The rules will end up scattered in scripts.' },
            { label: 'Build the screens first, and add classes as needed', score: 1, effects: { 'model clarity': 0, 'librarian confidence': 10 }, feedback: 'She sees progress, but the screens will drive the model instead of her rules.' }
          ] },
        { text: 'Where should the rule "a member with unpaid fines cannot borrow" live?',
          choices: [
            { label: 'Inside the model, on `Member` (such as `member.borrow(book)`), where it cannot be bypassed', score: 2, effects: { 'model clarity': 25 }, feedback: 'The rule lives next to what it governs, in code the librarian can read.' },
            { label: 'In the borrowing page, as an `if` before calling the database', score: 0, effects: { 'model clarity': -20 }, feedback: 'The mobile app, the kiosk and the admin tool will each need their own copy.' },
            { label: 'In a nightly script that cancels loans it should not have allowed', score: 0, effects: { 'model clarity': -15, 'librarian confidence': -15 }, feedback: 'Members walk out with the book first. The rule is enforced too late.' }
          ] },
        { text: 'You show the sketch. She says: "We call a Loan a *Borrowing*, and we also have *reservations*." What now?',
          choices: [
            { label: 'Rename Loan to Borrowing, and add Reservation to the sketch. The model follows her vocabulary', score: 2, effects: { 'model clarity': 20, 'librarian confidence': 25 }, feedback: 'Aligning names early means every future conversation uses the same words.' },
            { label: 'Keep Loan: it is a more standard programming word', score: 0, effects: { 'librarian confidence': -20, 'model clarity': -10 }, feedback: 'You have invented a translation layer that will confuse everyone.' },
            { label: 'Keep both names in different parts of the code', score: 0, effects: { 'model clarity': -15 }, feedback: 'Two names for one idea is how misunderstandings begin.' }
          ] }
      ],
      outro: 'Start with **the people and their words**; let code be the shape those words take.' },

    { type: 'explain', prompt: 'Explain what a domain model is and why it helps non-programmers too.',
      model: 'A domain model is code whose classes and methods mirror the business: nouns like Order and Customer become classes, verbs like cancel become methods, and business rules sit inside them. It uses the business’s own words, so domain experts can read it and spot mistakes, and it becomes a shared understanding between developers and the people who know the work.',
      keywords: ['business', 'classes', 'methods', 'rules', 'shared', 'words'] }
  ],

  flashcards: [
    { q: 'What is a domain model?', a: 'Code whose classes and methods mirror the business it serves, with real rules and the business’s own vocabulary.' },
    { q: 'How do you get from a business sentence to classes?', a: 'Nouns suggest classes, verbs suggest methods, and rules in the sentence go inside those methods. Then check the names with the business people.' },
    { q: 'What is an entity?', a: 'A thing with an identity that persists as its details change, such as order 42.' },
    { q: 'What is a value object?', a: 'A thing defined entirely by its value, like Money. Two with the same value are interchangeable.' },
    { q: 'Name three common ways to model the wrong thing.', a: 'Mirroring database tables, mirroring screens, or having nouns with fields but no behaviour.' }
  ],

  glossary: [
    { term: 'Domain', def: 'The area of business or activity that the software is about, such as banking or retail.', like: 'The subject of a textbook.' },
    { term: 'Domain model', def: 'A set of classes and methods that mirror the business concepts and rules of the domain.', like: 'An architect’s scale model of the building.' },
    { term: 'Entity', def: 'An object defined by a lasting identity, not just its current details.', like: 'You: still you after a haircut.' },
    { term: 'Value object', def: 'An object defined entirely by its value and usually immutable, such as an amount of money.', like: 'A £5 note: any one will do.' }
  ],

  takeaways: [
    'A domain model makes the code look like **the business**: same nouns, same verbs, same rules.',
    'Start from real sentences: nouns to classes, verbs to methods, rules inside the methods.',
    '**Entities** have identity; **value objects** are just values.',
    'It is a shared understanding. Check names with the experts, and keep it a *useful* simplification.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-anemic-models', {
  eli5: 'An anemic model is a set of objects that only hold data, with all the real decisions made somewhere else; a rich model gives the objects the rules, so they protect themselves.',

  cards: [
    { kind: 'concept', title: 'Objects with no brains',
      body: `Open a codebase and find a class called \`Order\`. It has a status, a list of lines and a total. Every field has a getter and a setter. It has no other methods at all.

        Now find \`OrderService\`. It has \`cancel\`, \`addLine\`, \`calculateTotal\`, \`canShip\`: every rule about orders, reaching in to read and change an \`Order\` from outside.

        The data and the behaviour have been **pulled apart**. The \`Order\` is a bag of fields; the service holds all the brains.

        This pattern is called an **anemic domain model**: it has the *shape* of object-oriented code (classes, fields) without the substance (objects that look after themselves).` },

    { kind: 'code', title: 'What anemic looks like',
      body: 'Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class Order {
          status = 'draft';
          lines = [];
          getStatus() { return this.status; }
          setStatus(s) { this.status = s; }
          getLines() { return this.lines; }
        }

        class OrderService {
          cancel(order) {
            if (order.getStatus() === 'shipped') {
              throw new Error('Too late');
            }
            order.setStatus('cancelled');
          }
        }`,
        notes: {
          5: 'A setter that accepts any string. `setStatus("banana")` works. The order cannot defend itself.',
          11: 'The rule "no cancelling after shipping" lives out here, in the **service**.',
          14: 'And the service changes the order from outside, through the unguarded setter.'
        } } },

    { kind: 'metaphor', title: 'The puppet and the puppeteer',
      body: `An anemic object is a **puppet**: limp until someone picks it up. The service is the puppeteer, deciding every movement.

        That is fine with one puppeteer. But in a real system many services (checkout, admin tool, import job, nightly cleanup) can all grab the same puppet. Each knows *some* of the rules, and none of them is in charge.

        A **rich** object is more like an employee who knows their own job. You say *"cancel"* and they handle it, including refusing if it is too late.`,
      note: 'Where it stops being true: a rich object is not an employee with a mind of its own. It simply runs the rules that you wrote inside it.' },

    { kind: 'story', title: 'The rule that three people forgot',
      body: `"No cancelling after shipping" was written in \`OrderService.cancel\`. It worked.

        Then the support team asked for an **admin tool** with a "Cancel" button. The developer wrote a new function that calls \`order.setStatus('cancelled')\` directly. Nobody remembered the service.

        Next, a data-import script marked old orders as cancelled the same way.

        Months later, a customer's parcel was already on a lorry when support cancelled it and refunded the money. The rule existed, but it lived in one of three places that could change an order, and the other two never heard of it.

        This is the standard failure of anemic models: **rules scattered across callers**.` },

    { kind: 'code', title: 'The rich version',
      body: 'The same rules, now carried by the object. There is no way to change its state except through methods that check the rules.',
      code: { lang: 'js', src: `
        class Order {
          #status = 'draft';
          #lines = [];

          addLine(product, qty) {
            if (this.#status !== 'draft') throw new Error('Order is locked');
            if (qty < 1) throw new Error('Quantity must be at least 1');
            this.#lines.push({ product, qty });
          }

          cancel() {
            if (this.#status === 'shipped') throw new Error('Too late');
            this.#status = 'cancelled';
          }

          get total() {
            return this.#lines.reduce((s, l) => s + l.qty * l.product.price, 0);
          }
        }`,
        notes: {
          5: 'The action is named in business words, and it checks its own preconditions.',
          12: 'The cancelling rule is written **once**, here. Checkout, admin tool and import script all go through it.',
          17: 'Computed from the lines, so it can never disagree with them. There is no `setTotal`.'
        } } },

    { kind: 'compare', title: 'Anemic vs rich',
      body: 'The same domain, two styles.',
      cols: ['Anemic model', 'Rich model'],
      rows: [
        ['Where the rules live', 'In services, outside the objects', 'Inside the objects they govern'],
        ['What the object offers', 'Getters and setters', 'Meaningful actions: `cancel()`, `addLine()`'],
        ['Can it be put in a bad state?', 'Yes: any caller can set anything', 'No: only through methods that check'],
        ['Rule duplicated?', 'Easily, once per caller', 'Written once'],
        ['Reading the code', 'Hunt through services to learn the rules', 'Open the class and see them']
      ] },

    { kind: 'steps', title: 'Moving behaviour onto the data',
      body: 'Turning an anemic model into a richer one is a mechanical, safe refactoring.',
      steps: [
        { title: 'Find a rule in a service', body: 'Look for `if` statements that read an object’s fields and then change them. `OrderService.cancel` is one.' },
        { title: 'Move it onto the object', body: 'Create `order.cancel()` with the same logic, using the object’s own fields.' },
        { title: 'Make callers use it', body: 'Replace every `setStatus("cancelled")` in the codebase with `order.cancel()`.' },
        { title: 'Remove the setter', body: 'With no caller left, delete `setStatus` (and make the field private). The door is now closed behind you.' },
        { title: 'Repeat for the next rule', body: 'A small piece at a time. Run the tests after each.' }
      ] },

    { kind: 'concept', title: 'When anemic is perfectly fine',
      body: `Martin Fowler describes the anemic domain model as an **anti-pattern**, because it throws away the benefits of objects. But it is not wrong everywhere.

        Plain data holders are fine when there are **no real rules**:

        - a simple CRUD screen that stores and shows records
        - data carried between layers or sent over the network (often called a *data transfer object*)
        - a report row

        If an \`Order\` really is just a record, putting fake behaviour on it adds ceremony. The warning sign is when rules **do** exist and are scattered across services.

        Experts differ on how early to enrich a model. A fair guide: **the moment a rule appears, give it a home on the object.**` },

    { kind: 'tip', title: 'Smells that say "anemic"',
      body: `Look for:

        - a class with only fields, getters and setters
        - a setter for **every** field
        - services full of \`if (thing.getX() ...) thing.setY(...)\`: **reading, deciding, then writing back**
        - the same rule copied into several services or screens
        - class names like \`OrderService\`, \`OrderManager\` and \`OrderHelper\` sitting beside a rule-free \`Order\`

        A later module covers a principle often summarised as *tell, don't ask*: tell the object what to do rather than pulling its data out to decide for it. This lesson is the same instinct applied to whole models.` }
  ],

  activities: [
    { type: 'spot', after: 1, prompt: 'This code is the anemic style at work. Tap the lines where a business decision is made **outside** the order.',
      code: { lang: 'js', src: `
        const order = await repo.find(id);
        if (order.getStatus() === 'shipped') {
          throw new Error('Too late');
        }
        order.setStatus('cancelled');
        await repo.save(order);` },
      lines: [2, 5],
      explain: 'The caller reads the status (line 2) and writes the new one back (line 5), deciding in between. In a rich model this becomes `order.cancel()` and the rule lives with the order.' },

    { type: 'tf', after: 3, statement: 'In an anemic model, a rule can be enforced in one service and silently skipped by another piece of code that changes the object directly.', answer: true,
      explain: 'Because the object accepts any change, nothing forces callers through the rule. Every new caller must remember it.' },

    { type: 'ab', after: 4, q: 'Which `Order` protects itself better?',
      a: { lang: 'js', label: 'Setter', src: `
        setStatus(s) {
          this.status = s;
        }` },
      b: { lang: 'js', label: 'Action', src: `
        cancel() {
          if (this.#status === 'shipped') throw new Error('Too late');
          this.#status = 'cancelled';
        }` },
      answer: 'b',
      explain: 'The action carries the rule and describes what happened in business words. The setter accepts anything, from `"cancelled"` to `"banana"`.' },

    { type: 'bucket', prompt: 'In a rich model, where does each piece of logic belong?', buckets: ['On the Order itself', 'Outside, in a service'],
      items: [['No cancelling after shipping', 0], ['The total equals the sum of the lines', 0], ['Saving the order to the database', 1], ['Sending the confirmation email', 1], ['Quantity must be at least 1', 0], ['Calling the payment provider', 1]],
      explain: 'Rules about the order’s own state stay on the order. Talking to the outside world (databases, email, payment providers) is a different job, done by other code.' },

    { type: 'mcq', q: 'A team builds an admin page that lists customers from a table and lets staff edit names and phone numbers. There are no business rules. Which approach is reasonable?',
      options: ['Simple data classes with getters and setters: there are no rules to protect yet', 'A rich model with a class hierarchy of customer types, to be safe', 'Every field private, with no way to read any of them', 'A service for every field'],
      answer: 0,
      why: [null, 'Adding rich behaviour with nothing to put in it is ceremony without payoff.', 'A model nobody can read is useless.', 'That is more code for the same absence of rules.'],
      explain: 'Anemic is acceptable for plain CRUD with no real rules. The moment rules appear, such as "VIP customers cannot be deleted", give them a home on the object.' },

    { type: 'cloze', code: true, text: 'class Order {\n  {{#}}status = "draft";\n\n  {{cancel}}() {\n    if (this.#status === "shipped") throw new Error("Too late");\n    this.#status = "cancelled";\n  }\n}',
      distractors: ['setStatus', 'public', 'get'],
      explain: 'The private field closes the back door; the `cancel` action carries the rule in business words.' },

    { type: 'order', prompt: 'Put the steps for enriching an anemic model into order.',
      items: ['Find a rule in a service', 'Move it onto the object as a method', 'Make every caller use the method', 'Remove the setter and hide the field', 'Run the tests'],
      explain: 'The rule moves first, then callers, and only when nobody uses it do you delete the setter. Tests confirm that behaviour is unchanged.' },

    { type: 'scenario', title: 'The refund bug',
      intro: 'An online shop has an anemic `Order` (all getters and setters) and four services that change orders: `CheckoutService`, `AdminService`, `ImportService` and `RefundService`. A refund went out for an order that had not been cancelled. The finance team is unhappy.',
      meters: { 'bug risk': 70, 'finance trust': 30 },
      steps: [
        { text: 'You trace it: `AdminService` refunded without checking the status that `RefundService` checks. How do you view this?',
          choices: [
            { label: 'A symptom of anemic design: the "refund only if cancelled" rule is not owned by the order, so each caller must remember it', score: 2, effects: { 'bug risk': -10, 'finance trust': 10 }, feedback: 'Right. Fixing one service does not stop the next caller from forgetting.' },
            { label: 'A one-off: copy the status check into `AdminService`', score: 1, effects: { 'bug risk': 5, 'finance trust': 5 }, feedback: 'It closes this hole today. The rule now exists twice and `ImportService` still lacks it.' },
            { label: 'A training problem: tell developers to read all the services first', score: 0, effects: { 'bug risk': 15, 'finance trust': -10 }, feedback: 'Relying on memory is what failed. Make the code enforce the rule.' }
          ] },
        { text: 'You start the fix. What is the first step?',
          choices: [
            { label: 'Add `order.refund()` and `order.cancel()` that check the state themselves, and switch one caller at a time', score: 2, effects: { 'bug risk': -20, 'finance trust': 15 }, feedback: 'Small, safe steps. The rules now have one home.' },
            { label: 'Rewrite all four services and the model in one big change', score: 0, effects: { 'bug risk': 20, 'finance trust': -10 }, feedback: 'Big-bang rewrites are where new bugs breed.' },
            { label: 'Make `setStatus` throw if called with an unusual value', score: 1, effects: { 'bug risk': -5 }, feedback: 'A guard on the setter helps, but the setter still does not know *why* a change is allowed, so the real rules remain outside.' }
          ] },
        { text: 'The tests pass and `order.refund()` is in use everywhere. What is the finishing touch?',
          choices: [
            { label: 'Delete `setStatus` and make the status field private so no one can bypass the methods', score: 2, effects: { 'bug risk': -20, 'finance trust': 15 }, feedback: 'Now the only way to change an order is through the rules.' },
            { label: 'Leave the setter, "for flexibility"', score: 0, effects: { 'bug risk': 25 }, feedback: 'The next hurried developer will use it. A door left open gets used.' },
            { label: 'Rename the setter to `updateStatus`', score: 0, effects: { 'bug risk': 10 }, feedback: 'A new name for the same unguarded door.' }
          ] }
      ],
      outro: 'Rules need **one owner**. In a rich model, the owner is the object itself.' },

    { type: 'explain', prompt: 'Explain an anemic domain model, why Fowler calls it an anti-pattern, and when it is nevertheless acceptable.',
      model: 'An anemic domain model has objects that only hold data with getters and setters, while all the business logic lives in services. It throws away the benefit of objects: the data and rules are separated, so rules are scattered or duplicated and objects can be put into invalid states. It is acceptable for simple CRUD or data carried between layers where there are no real rules.',
      keywords: ['getters', 'setters', 'services', 'rules', 'invalid', 'CRUD'] }
  ],

  flashcards: [
    { q: 'What is an anemic domain model?', a: 'Classes that only hold data with getters and setters, while all the business logic lives in separate services.' },
    { q: 'What goes wrong with it?', a: 'Rules get scattered or duplicated across callers, and objects can be put into invalid states by anyone.' },
    { q: 'What is a rich domain model?', a: 'Objects that carry their own rules and expose meaningful actions like `cancel()`, so they protect themselves.' },
    { q: 'When is an anemic model acceptable?', a: 'For simple CRUD, data transfer between layers or report rows, where there are no real business rules to protect.' },
    { q: 'What smell suggests an anemic model?', a: 'Services that read an object’s fields, decide, then write back through setters, plus a setter for every field.' }
  ],

  glossary: [
    { term: 'Anemic domain model', def: 'A model whose objects hold only data (getters and setters) while all behaviour lives in services. Martin Fowler calls it an anti-pattern.', like: 'A puppet with the puppeteer doing all the work.' },
    { term: 'Rich domain model', def: 'A model whose objects carry their own rules and expose actions named in business language.', like: 'An employee who knows their own job.' },
    { term: 'Service', def: 'A class that performs an operation involving one or more objects, often holding logic that does not sit on any one of them.', like: 'A department that coordinates between employees.' },
    { term: 'Data transfer object', def: 'A plain data holder used to carry information between layers or across a network. Having no behaviour is fine here.', aka: ['DTO'], like: 'A parcel: contents only.' }
  ],

  takeaways: [
    'Anemic = data in objects, **rules in services**. Rich = objects that guard themselves.',
    'Scattered rules get forgotten by the next caller.',
    'Refactor by moving a rule onto the object, switching callers, then deleting the setter.',
    'Anemic is fine for simple CRUD and data carriers. The moment a rule appears, give it a home.'
  ],

  links: [
    { label: 'Martin Fowler: Anemic Domain Model', url: 'https://martinfowler.com/bliki/AnemicDomainModel.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-domain-language', {
  eli5: 'Domain language means using the exact words the business uses, in conversations and in the code, so nobody has to translate and nothing gets lost.',

  cards: [
    { kind: 'concept', title: 'Dispatched, shipped, fulfilled, sent',
      body: `In a warehouse, the team says an order has been **dispatched**. The code calls it \`shipped\`. The database column says \`fulfilled\`. The website tells the customer it has been **sent**.

        Four words for one idea. Sooner or later someone treats them as four different things.

        Finance writes a report: "orders fulfilled this month". It filters on \`fulfilled\`. The warehouse's *dispatched* count is different, because a parcel can be dispatched and not yet marked fulfilled. The board sees two numbers and asks why they disagree.

        Neither team made a mistake in their own work. The problem is **language**.` },

    { kind: 'metaphor', title: 'The interpreter in every meeting',
      body: `Imagine every conversation between a shop manager and a developer needs an interpreter. The manager says *dispatch*; the interpreter tells the developer *"set status to 4"*. The developer's answer comes back the other way.

        Interpreters make mistakes, slow everything down, and take their knowledge with them when they leave.

        The fix is not a better interpreter. It is a **shared language**, so that both sides speak the same words directly.`,
      note: 'Where it stops being true: a shared language does not mean sounding like a developer, or making the business use programming words. It mostly means the code learns to speak the business’s language.' },

    { kind: 'concept', title: 'Ubiquitous language',
      body: `Eric Evans, who wrote *Domain-Driven Design*, named this practice the **ubiquitous language**: one shared vocabulary, used **everywhere**, by everyone.

        - in meetings with the business
        - in documents and tickets
        - in class names, method names and variable names
        - in tests (which can then read like business rules)

        "Ubiquitous" just means "found everywhere". If the shop owner says *dispatch*, the code has \`order.dispatch()\`, not \`order.setStatus(4)\`.

        > If you have to translate between the code and the conversation, the language has failed.` },

    { kind: 'code', title: 'Code that speaks the business’s language',
      body: 'Same logic. One version needs a decoder ring.',
      code: { lang: 'js', src: `
        // before
        function proc(r, t) {
          if (r.f === 2 && t > 7) r.s = 'X';
        }

        // after
        function releaseExpiredHold(reservation, daysHeld) {
          if (reservation.isHeld && daysHeld > 7) reservation.release();
        }`,
        notes: {
          2: '`proc`, `r`, `t`, `f`, `s`: every name is a code. A reader needs the author, or an old document.',
          7: 'The function name is a sentence the stock controller would say: a held reservation that expires is released.',
          8: 'The **7-day rule** is visible, and `release()` is the same word the business uses.'
        } } },

    { kind: 'compare', title: 'One term, one meaning',
      body: 'Within one part of the system a word should mean exactly one thing. Across teams, the same word can mean different things.',
      cols: ['Sales team', 'Support team'],
      rows: [
        ['Customer', 'Anyone who has bought or may buy', 'A person with an open support case'],
        ['Closed', 'A deal that was won', 'A ticket that was resolved'],
        ['Order', 'A basket the customer confirmed', 'A thing to look up when someone phones']
      ],
      note: 'Do not force one meaning on both teams. Evans suggests keeping separate parts of the system (he calls them bounded contexts), each with its own consistent language, and being explicit where they meet.' },

    { kind: 'story', title: 'The translation bug',
      body: `A shop imported old orders. The legacy system used the word **void** for an order stopped before payment, and **cancelled** for one stopped after payment.

        The new system had one status, \`cancelled\`. The import script mapped both to it.

        Customers whose orders had only been *voided* started getting **refund emails** for money they had never paid. Customers received sums they were not owed and support spent a week sorting it out.

        The bug was not in any single line of arithmetic. Two words with different meanings had been squashed into one by a quiet translation step. **Wherever you translate, you can lose meaning.**` },

    { kind: 'steps', title: 'Finding the words with the experts',
      body: 'A short routine for making the language shared.',
      steps: [
        { title: 'Listen for the nouns and verbs they use', body: 'Write down the exact words. Do not tidy them into programmer-speak.' },
        { title: 'Ask "what is the difference?"', body: 'When two words seem alike (dispatched vs shipped), ask. Often there is a real distinction you would otherwise erase.' },
        { title: 'Keep a small glossary', body: 'A shared page: the word, one sentence defining it, an example. Update it when meanings shift.' },
        { title: 'Rename the code to match', body: 'Use the glossary words for classes, methods and database columns. Renames are cheap with modern tools.' },
        { title: 'Challenge new words in code review', body: 'If someone introduces `processItem`, ask: what does the business call this?' }
      ] },

    { kind: 'pitfall', title: 'Technical words leak in',
      body: `Watch for names that tell you nothing about the business:

        - \`Manager\`, \`Handler\`, \`Helper\`, \`Util\`, \`Data\`, \`Info\`, \`Processor\`
        - **synonyms** inside the code: \`Customer\`, \`Client\`, \`User\` and \`Account\` all meaning the same person
        - **invented abbreviations** that only the author understands

        A related trap: sometimes even the business uses a word loosely ("the account", meaning three different things). Do not copy the vagueness. Ask which meaning is intended, and give each its own word.` },

    { kind: 'tip', title: 'A quick test for names',
      body: `Read a method name to someone who works in the business. Do they understand it without help?

        \`cancelOrder\`, \`applyDiscount\`, \`backorder\`, \`issueRefund\`: yes.
        \`handleData\`, \`processItem\`, \`doStatusUpdate\`: no.

        When the business changes its mind about a word, change the code too, the same week. Language drift is quiet and expensive: the longer a code word and a business word stay apart, the more translating everyone has to do.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'The warehouse says "dispatched", the code says `shipped`, the database says `fulfilled`, and the website says "sent". What is the real risk?',
      options: ['People treat them as different things, so reports disagree', 'The code will run slower because of the extra words', 'The database will refuse to store the values', 'Nothing: names do not matter as long as the code works'],
      answer: 0,
      why: [null, 'Names have no effect on speed.', 'The database does not care what the words mean.', 'Code that works today can still produce wrong numbers when words and meanings drift apart.'],
      explain: 'Multiple words for one idea invite misunderstanding. Finance and the warehouse produced different "counts" without either making an arithmetic error.' },

    { type: 'match', after: 4, prompt: 'Match each idea to what it means.',
      pairs: [['Ubiquitous language', 'One shared vocabulary used by everyone, in talk and in code'], ['Translation bug', 'Meaning lost when two terms are squashed into one'], ['Glossary drift', 'Code words and business words slowly moving apart'], ['Bounded context', 'A part of the system with its own consistent language']] },

    { type: 'ab', q: 'Which method name would the stock controller understand?',
      a: { lang: 'js', label: 'Technical filler', src: `
        handler.processItem(item, 3);` },
      b: { lang: 'js', label: 'Business word', src: `
        stock.reserve(item, 3);` },
      answer: 'b',
      explain: '"Reserve" is a word the business already uses, so a reader needs no translation. `processItem` could mean anything.' },

    { type: 'spot', prompt: 'In this shop the person who buys is always called a **customer**. Tap the line where the code drifts to a different word.',
      code: { lang: 'js', src: `
        function sendReceipt(customer) { /* ... */ }
        function loadClient(id) { /* ... */ }
        function applyDiscount(customer, code) { /* ... */ }` },
      lines: [2],
      explain: '`loadClient` uses another word for the same idea. One term, one meaning: every extra synonym makes readers wonder whether it is a different thing.' },

    { type: 'bucket', prompt: 'Is each name domain language or technical filler?', buckets: ['Domain language', 'Technical filler'],
      items: [['`backorder`', 0], ['`DataHandler`', 1], ['`issueRefund`', 0], ['`ItemProcessor`', 1], ['`Reservation`', 0], ['`Util`', 1]],
      explain: 'Domain words come from the business and mean something to its people. Filler words describe that *something is done* but not *what*.' },

    { type: 'cloze', text: 'A single vocabulary used in talk, documents and code is called the {{ubiquitous}} language, a term from {{Eric Evans}}. Inside one context, each term should have {{one}} meaning.',
      distractors: ['universal', 'Martin Fowler', 'several'],
      explain: 'Eric Evans coined "ubiquitous language" in Domain-Driven Design. The aim is to remove translation between conversation and code.' },

    { type: 'tf', statement: 'If two teams use the same word differently, the best fix is to force everyone to use one meaning across the whole company.', answer: false,
      explain: 'Forcing one meaning usually fails, because the teams really do think differently. A better approach is separate contexts, each with its own consistent language, and a clear translation where they meet.' },

    { type: 'scenario', title: 'The naming workshop',
      intro: 'You are building booking software for a small gym. In your first meeting with the manager, she says: *"Members **book** a class. If they **no-show** twice, they lose **priority**. We also have **drop-ins**, who pay per visit."* Your draft code has `Client`, `Reservation`, `Penalty` and `Visitor`.',
      meters: { 'shared understanding': 30, 'rework': 70 },
      steps: [
        { text: 'You compare your draft with her words. What do you do?',
          choices: [
            { label: 'Rename to her words: `Member`, `Booking`, `NoShow`, `DropIn`. Ask her what "priority" means exactly', score: 2, effects: { 'shared understanding': 30, 'rework': -10 }, feedback: 'The model now uses the manager’s words, and you have spotted a word that still needs defining.' },
            { label: 'Keep your names: they are standard in booking software', score: 0, effects: { 'shared understanding': -15, 'rework': 20 }, feedback: 'She will keep saying "member" and you will keep hearing "client", and the translation will cause mistakes.' },
            { label: 'Use both: `Member` in the UI and `Client` in the code', score: 0, effects: { 'shared understanding': -10, 'rework': 15 }, feedback: 'That is the interpreter again, built into the codebase.' }
          ] },
        { text: 'Later, the front-desk staff say "member" for anyone with a card, including people on a free trial. The manager says a member has paid for a plan. What now?',
          choices: [
            { label: 'Raise it: ask them to agree one meaning, or introduce a separate word for trial users', score: 2, effects: { 'shared understanding': 25 }, feedback: 'Surfacing the ambiguity early is the whole point. Giving each meaning its own word clears it up.' },
            { label: 'Pick the manager’s meaning and move on', score: 1, effects: { 'shared understanding': 5, 'rework': 5 }, feedback: 'It settles the code, but front desk still uses the word differently and will keep making requests that do not fit.' },
            { label: 'Ignore it: both mean "someone with a card"', score: 0, effects: { 'shared understanding': -15, 'rework': 20 }, feedback: 'Free-trial users will get paid-plan privileges before anyone notices.' }
          ] },
        { text: 'A teammate adds a class `BookingProcessorHelper`. What do you say in review?',
          choices: [
            { label: 'Ask what the gym calls what it does. Perhaps it is confirming or cancelling a booking, which belongs on `Booking`', score: 2, effects: { 'shared understanding': 20, 'rework': -10 }, feedback: 'The vague name was hiding a missing domain concept or a misplaced method.' },
            { label: 'Approve: the name is clear enough', score: 0, effects: { 'shared understanding': -10 }, feedback: 'Processor and Helper tell you nothing. Months from now no one will know what belongs in it.' },
            { label: 'Ask them to rename it `BookingManager`', score: 0, effects: { 'shared understanding': -5 }, feedback: 'Another vague word. The name is not the real issue; the missing concept is.' }
          ] }
      ],
      outro: 'Listen for the **exact words**, ask about differences, and let the code adopt them.' },

    { type: 'explain', prompt: 'Explain why using the business’s own words in code is more than a matter of style.',
      model: 'A ubiquitous language means everyone, business and developers, uses the same terms in conversation, documents and code, so nothing has to be translated. Translation loses meaning and causes bugs, like two statuses being merged into one. Each term should have one meaning in its context, and the code should change when the business’s words change.',
      keywords: ['ubiquitous', 'translate', 'meaning', 'one term', 'business', 'bugs'] }
  ],

  flashcards: [
    { q: 'What is the ubiquitous language?', a: 'Eric Evans’s term for one shared vocabulary used by developers and business experts alike, in conversation, documents and code.' },
    { q: 'What is a translation bug?', a: 'A bug that appears when two different business meanings get squashed into one word or status, often during an import or mapping step.' },
    { q: 'Why is "one term, one meaning" important?', a: 'If a word means two things in the same context, people and code will mix them up and rules will quietly differ.' },
    { q: 'What if two teams use one word differently?', a: 'Keep separate contexts with their own consistent languages and translate explicitly where they meet.' },
    { q: 'Name some words that signal vague naming.', a: 'Manager, Handler, Helper, Util, Data, Info and Processor: they say something is done but not what.' }
  ],

  glossary: [
    { term: 'Ubiquitous language', def: 'A single vocabulary shared by developers and domain experts and used in speech, documents and code.', like: 'Everyone in the kitchen using the same names for the same dishes.' },
    { term: 'Domain expert', def: 'A person who deeply understands the business area, such as a warehouse manager or an accountant.', like: 'The local who gives you directions.' },
    { term: 'Glossary drift', def: 'When the words in the code and the words the business uses slowly move apart.', like: 'A language splitting into dialects.' },
    { term: 'Bounded context', def: 'A part of a system within which every term has one clear meaning. Different contexts may use the same word differently.', like: 'Different departments each with their own jargon.' }
  ],

  takeaways: [
    'Use the business’s own words in conversation **and** in code: no interpreter needed.',
    '**One term, one meaning** within a context. Synonyms and vague words breed bugs.',
    'Every translation step can lose meaning. Mapping two statuses to one is a classic.',
    'Build the vocabulary **with** domain experts and keep a small glossary.'
  ],

  links: [
    { label: 'Martin Fowler: Ubiquitous Language', url: 'https://martinfowler.com/bliki/UbiquitousLanguage.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-invariants', {
  eli5: 'A class invariant is a rule about an object that must always be true, like "the end date is never before the start date", and the class makes sure no code can ever break it.',

  cards: [
    { kind: 'concept', title: 'A booking that ends before it starts',
      body: `A hotel system stores bookings with a check-in date and a check-out date. Somewhere, a bug creates a booking that checks in on the 10th and checks out on the 8th.

        The system calculates the price as *minus two nights*. The customer is **paid** to stay. Reports, availability and invoices all misbehave, and nobody can tell which line of code created it.

        Some rules are not "nice to have". If they are ever false, everything built on the object is wrong. Such a rule is an **invariant**: something that must be true **every time anyone looks at the object**.` },

    { kind: 'metaphor', title: 'The bouncer at every door',
      body: `A club has one rule: nobody under 18 gets in. The owner could trust each person to know it. Instead, there is a **bouncer on every entrance**.

        If there were a single unguarded side door, the rule would be worthless, however good the front bouncer.

        An object works the same way. Its **constructor** is one door and **every public method** is another. Each must check the rule on the way through. Private fields (the walls of the club) make sure there are no other doors.`,
      note: 'Where it stops being true: a bouncer turns people away at the door. A method may also *change* state in a way that keeps the rule true, rather than just refusing.' },

    { kind: 'concept', title: 'The precise idea',
      body: `An **invariant** is a condition that is:

        1. **true once the constructor finishes**: the object is born valid
        2. **true again after every public method** returns: no method leaves it broken
        3. **never visible as false** to outside code

        Inside a method it may be briefly false (halfway through moving money between two fields, for instance), but nobody outside can see that moment.

        Examples: a balance never below the overdraft limit; an order total equal to the sum of its lines; a quantity of at least one; a date range with start before end.

        This is what encapsulation exists to protect: you can only guarantee a rule when **only your own methods can change the data**.` },

    { kind: 'code', title: 'Born valid',
      body: 'The constructor refuses to create a broken object. After that, nothing can break it.',
      code: { lang: 'js', src: `
        class DateRange {
          #start;
          #end;

          constructor(start, end) {
            if (end < start) throw new Error('End is before start');
            this.#start = start;
            this.#end = end;
          }

          get days() {
            return (this.#end - this.#start) / 86400000;
          }
        }`,
        notes: {
          6: 'The invariant is checked in the **only** way to create a `DateRange`. An invalid one can never exist.',
          11: 'Because of that, this method can trust its data. `days` can never come out negative, and there is no need to check again.'
        } } },

    { kind: 'code', title: 'Kept true by every method',
      body: 'The rule here: **the balance never drops below minus the overdraft limit.** Each method checks before it changes anything.',
      code: { lang: 'js', src: `
        class Account {
          #balance = 0;
          #overdraftLimit;

          constructor(overdraftLimit = 0) {
            if (overdraftLimit < 0) throw new Error('Limit cannot be negative');
            this.#overdraftLimit = overdraftLimit;
          }

          withdraw(amount) {
            if (amount <= 0) throw new Error('Amount must be positive');
            if (this.#balance - amount < -this.#overdraftLimit) {
              throw new Error('Over the limit');
            }
            this.#balance -= amount;
          }
        }`,
        notes: {
          6: 'Even the **limit itself** has a rule, so the object is valid from birth.',
          12: '**Check first, change second.** If the rule would break, nothing has been touched.',
          15: 'The change happens only after every check has passed, so a failed call leaves the object exactly as it was.'
        } } },

    { kind: 'code', title: 'Making invalid states unrepresentable',
      body: `The strongest move is to design the data so a bad state **cannot even be written down**. TypeScript can do this with a union type.`,
      code: { lang: 'ts', src: `
        type Order = {
          status: string;
          shippedAt?: Date;
          cancelledAt?: Date;
        };

        type SafeOrder =
          | { status: 'placed' }
          | { status: 'shipped'; shippedAt: Date }
          | { status: 'cancelled'; cancelledAt: Date };`,
        notes: {
          2: 'Any string at all, including typos like `"shiped"`.',
          3: 'These optional dates allow nonsense: `shipped` with no date, or an order that is both shipped **and** cancelled.',
          9: 'Shipped orders **must** have a shipped date, and only shipped orders can have one. The impossible combinations cannot be written.'
        } },
      note: 'Plain JavaScript has no such types, but the idea carries over: use one status field rather than several flags, and create small value classes (such as `Email` or `Money`) that cannot hold bad values.' },

    { kind: 'compare', title: 'Validation vs invariants',
      body: 'These sound similar but do different jobs. You need both.',
      cols: ['Validation', 'Invariant'],
      rows: [
        ['What it checks', 'Input from outside: a form, a request, a file', 'The rules about an object’s own state'],
        ['Where it happens', 'At the edge, before data reaches your objects', 'Inside the object: constructor and methods'],
        ['When it fails', 'Expected and friendly: tell the user what to fix', 'A bug if reached: throw, because someone skipped validation'],
        ['Example', '"Please enter a date after today"', '`DateRange` never has end before start']
      ],
      note: 'Validation protects the user experience. Invariants protect the data. The object cannot rely on validation having happened.' },

    { kind: 'pitfall', title: 'How invariants get broken anyway',
      body: `The usual escape routes:

        - **Setters and public fields** that accept anything.
        - **Returned internals**: a getter that hands out the real list lets callers add a bad item.
        - **A constructor that does not check**, so the object is broken from birth.
        - **Half-finished changes**: a method updates one field, hits an error, and leaves another unchanged.
        - **Rules about the outside world**: "no two users share an email" cannot be guaranteed by one object, because it depends on all the others. That rule needs a database uniqueness constraint or a check in a wider piece of code.` },

    { kind: 'tip', title: 'Finding your invariants',
      body: `Ask of each class: **"what must always be true about this thing, or the business is in trouble?"**

        Write the answers as short sentences above the class. Then check each one is enforced in the constructor and in every method that touches those fields.

        Often a class will have just two or three. That is plenty. If you find ten, the class may be doing too much.

        Writing a test that tries to **break** each invariant (a negative amount, an end before a start) is a cheap way to prove the doors are locked.` }
  ],

  activities: [
    { type: 'tf', after: 2, statement: 'An invariant may be briefly false halfway through a method, as long as it is true again before the method returns and nobody outside can see the gap.', answer: true,
      explain: 'The promise is about what outsiders can observe: after construction and after each public method. Inside a method the object may pass through temporary states.' },

    { type: 'spot', after: 4, prompt: 'The rule is "a cart line always has a quantity of at least 1". Tap the line that lets it break.',
      code: { lang: 'js', src: `
        class CartLine {
          #qty;
          constructor(sku, qty) {
            if (qty < 1) throw new Error('Quantity must be at least 1');
            this.sku = sku;
            this.#qty = qty;
          }
          get qty() { return this.#qty; }
          setQty(n) { this.#qty = n; }
        }` },
      lines: [9],
      explain: 'The constructor checks the rule, but `setQty` does not, so `setQty(0)` or `setQty(-3)` breaks it. Each door needs the bouncer.' },

    { type: 'bucket', after: 6, prompt: 'Is each check validation (at the edge) or an invariant (inside the object)?', buckets: ['Validation', 'Invariant'],
      items: [['Show "please enter a valid email" next to a sign-up form', 0], ['A `Money` object can never hold a NaN amount', 1], ['A file upload must be under 5 MB', 0], ['An `Order` total always equals the sum of its lines', 1], ['A date picker rejects dates in the past', 0], ['An `Account` can never exceed its overdraft limit', 1]],
      explain: 'Validation deals with untrusted input and talks to the user. Invariants are the object’s own guarantee, which hold no matter who calls it.' },

    { type: 'mcq', q: 'Why does `withdraw` check the rule *before* changing the balance?',
      options: ['So that a failed call leaves the object exactly as it was, still valid', 'Because JavaScript does not allow changes after a check', 'To make the method run faster', 'So that the constructor does not have to check anything'],
      answer: 0,
      why: [null, 'There is no such language restriction.', 'The order has no meaningful effect on speed.', 'The constructor still needs its own check: the object must be born valid.'],
      explain: 'Check first, change second keeps the object valid even when the call is rejected. A change followed by a check could leave it half-broken.' },

    { type: 'ab', q: 'Which `Order` shape makes invalid states harder to write?',
      a: { lang: 'ts', label: 'Flags and optional dates', src: `
        type Order = {
          shipped: boolean;
          cancelled: boolean;
          shippedAt?: Date;
        };` },
      b: { lang: 'ts', label: 'One status per shape', src: `
        type Order =
          | { status: 'placed' }
          | { status: 'shipped'; shippedAt: Date }
          | { status: 'cancelled' };` },
      answer: 'b',
      explain: 'Two booleans allow "shipped and cancelled" and "shipped with no date", which the business never meant. The union only allows the valid combinations.' },

    { type: 'cloze', code: true, text: 'class Quantity {\n  #n;\n  {{constructor}}(n) {\n    if (n < 1) {{throw}} new Error("At least 1");\n    this.#n = n;\n  }\n}',
      distractors: ['static', 'return', 'extends'],
      explain: 'The constructor is the only door to a new object, so a check there plus a `throw` means an invalid `Quantity` can never exist.' },

    { type: 'multi', q: 'Which of these can break a class invariant?',
      options: ['A public setter that accepts any value', 'A getter that returns the real internal array', 'A constructor that does not check its arguments', 'A private field that only methods change', 'A method that checks the rule before changing state'],
      answers: [0, 1, 2],
      explain: 'Setters, leaked internals and unchecked constructors all let bad data in. Private fields and check-then-change methods are how invariants are kept.' },

    { type: 'scenario', title: 'Review: the booking bug',
      intro: 'A hotel app has a `Booking` class with public `checkIn` and `checkOut` fields. A report just showed negative nights for 14 bookings, and one customer was invoiced minus £180.',
      meters: { 'data trust': 30, 'effort': 70 },
      steps: [
        { text: 'The quick idea is to add a check on the booking form to reject bad dates. Is that enough?',
          choices: [
            { label: 'Keep the form check (validation), but also enforce the rule inside `Booking`, because the import script and admin tool bypass the form', score: 2, effects: { 'data trust': 25, 'effort': -10 }, feedback: 'Validation is good for users, but only the object can guarantee its own rule against every caller.' },
            { label: 'Yes: bad dates come from the form, so fix the form', score: 0, effects: { 'data trust': -10 }, feedback: 'The import script and the admin tool never use the form. They will produce the next bad booking.' },
            { label: 'No checks anywhere: fix bad rows in a nightly clean-up job', score: 0, effects: { 'data trust': -15, 'effort': -10 }, feedback: 'The system works with broken data all day, and the invoice is already wrong by morning.' }
          ] },
        { text: 'How do you enforce it inside `Booking`?',
          choices: [
            { label: 'Make the dates private, check `checkOut > checkIn` in the constructor, and offer `extendStay(newCheckOut)` that rechecks', score: 2, effects: { 'data trust': 30, 'effort': -15 }, feedback: 'Born valid, and every later change goes through a method that keeps the rule true.' },
            { label: 'Add the check to the constructor only and leave the fields public', score: 1, effects: { 'data trust': 5, 'effort': -5 }, feedback: 'Born valid, but anyone can assign `checkOut` later and break it again.' },
            { label: 'Add a `validate()` method and ask callers to call it', score: 0, effects: { 'data trust': -10 }, feedback: 'It relies on every caller remembering, which is the problem you started with.' }
          ] },
        { text: 'Another rule: "a guest cannot have two overlapping bookings". Where can `Booking` enforce that?',
          choices: [
            { label: 'It cannot alone, because it involves other bookings. Enforce it in the code that creates bookings and with a database constraint', score: 2, effects: { 'data trust': 20 }, feedback: 'Right. A rule about relationships between objects needs a wider owner, and a database safety net.' },
            { label: 'Inside `Booking`, by keeping a static list of all bookings', score: 0, effects: { 'data trust': -10, 'effort': -10 }, feedback: 'A hidden global list turns into shared mutable state, and it vanishes when the program restarts.' },
            { label: 'Skip it: people will not double-book', score: 0, effects: { 'data trust': -20 }, feedback: 'They will, by accident, at busy times.' }
          ] }
      ],
      outro: 'Validate at the edge for users, but let the **object** guarantee its own rules.' },

    { type: 'explain', prompt: 'Explain what a class invariant is, and how a class can make sure it is never broken.',
      model: 'A class invariant is a rule about an object that must be true after construction and after every public method, such as the end date never being before the start date. The class enforces it by keeping its data private, checking the rule in the constructor and in every method that changes the data, checking before changing, and never handing out its internals. Better still, design the types so invalid states cannot be represented.',
      keywords: ['rule', 'constructor', 'every method', 'private', 'check', 'unrepresentable'] }
  ],

  flashcards: [
    { q: 'What is a class invariant?', a: 'A rule about an object that is true after construction and after every public method, so outsiders never see it broken.' },
    { q: 'Where must invariants be enforced?', a: 'In the constructor and in every public method that changes the data, with the fields kept private so no other door exists.' },
    { q: 'What does "make invalid states unrepresentable" mean?', a: 'Design the types so nonsense combinations cannot be written at all, for example one status per shape rather than several flags.' },
    { q: 'Validation vs invariants?', a: 'Validation checks untrusted input at the edge and helps the user. Invariants are the object’s own guarantee, enforced inside it for every caller.' },
    { q: 'Why check before changing state?', a: 'A rejected call then leaves the object untouched and still valid.' }
  ],

  glossary: [
    { term: 'Class invariant', def: 'A condition that must be true for every object of a class after construction and after every public method.', aka: ['invariant'], like: 'The rule that a lift never moves with its doors open.' },
    { term: 'Validation', def: 'Checking input from outside the system (forms, requests, files) before it reaches your objects, usually with a friendly error.', like: 'The receptionist checking your form is filled in.' },
    { term: 'Precondition', def: 'A condition that must hold when a method is called, such as "amount is positive".', like: 'Showing your ticket before boarding.' },
    { term: 'Invalid state', def: 'A combination of values the business considers impossible, such as an order that is both shipped and cancelled.', like: 'A traffic light showing red and green together.' }
  ],

  takeaways: [
    'An invariant is a rule that is **always true when anyone looks**: after the constructor and after every method.',
    'Enforce it at **every door**: constructor and methods, with private fields so there are no other doors.',
    '**Check first, change second.** Better still, design types where the bad state cannot exist.',
    'Validation guards the user experience. Invariants guard the data. You need both.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('oop-layered', {
  eli5: 'A layered architecture stacks your code in layers (what the user sees, the steps of each job, the business rules, the technical plumbing) so each layer only depends on the ones below it.',

  cards: [
    { kind: 'concept', title: 'The page that ran SQL',
      body: `In a small shop's first website, the "Place order" page does everything. It reads the form, checks the stock rules, runs SQL directly, builds the confirmation email's HTML and sends it.

        It works, until the shop wants a mobile app that does the same thing. Or switches database. Or changes the stock rule. Each change means opening that one page and carefully editing around everything else in it.

        A **layered architecture** is the cure: split the code into **layers**, each with one kind of job, arranged so that code only calls **downwards**. Changing one layer then rarely disturbs the others.` },

    { kind: 'metaphor', title: 'A restaurant',
      body: `Think of a restaurant:

        - the **dining room and menu** is what customers see and touch. *(presentation)*
        - the **head waiter** takes an order and coordinates: tells the kitchen, brings the bill. They know *the steps*, not the recipes. *(application)*
        - the **chef's recipes and kitchen rules** ("never serve undercooked chicken") are the heart of the business. *(domain)*
        - the **storeroom, deliveries and ovens** are the practical machinery. *(infrastructure)*

        Redecorate the dining room and the recipes are untouched. Switch the supplier and the menu stays the same.` },

    { kind: 'layers', title: 'The four layers',
      body: 'Drawn top to bottom, with each layer allowed to use the ones **below** it.',
      layers: [
        { label: 'Presentation', note: 'Web pages, API endpoints, buttons. Takes input, shows output.', icon: '🖥️', tone: 'accent' },
        { label: 'Application', note: 'One use case at a time: "place an order". Coordinates, holds no business rules.', icon: '🎬' },
        { label: 'Domain', note: 'The business model and rules: Order, Customer, "no cancelling after shipping".', icon: '🏛️', tone: 'good' },
        { label: 'Infrastructure', note: 'Databases, email, file storage, payment providers. Technical plumbing.', icon: '🔌', tone: 'muted' }
      ],
      note: 'This is Eric Evans’s four-layer version. Other books use three or five layers or different names for the same ideas.' },

    { kind: 'diagram', title: 'Dependencies point one way',
      body: 'The arrows show "knows about". Every arrow points **down**. Nothing lower ever knows about anything above it.',
      nodes: [
        { id: 'p', label: 'Presentation', icon: '🖥️', x: 1, y: 0, tone: 'accent' },
        { id: 'a', label: 'Application', x: 1, y: 1 },
        { id: 'd', label: 'Domain', x: 1, y: 2, tone: 'good' },
        { id: 'i', label: 'Infrastructure', icon: '🔌', x: 1, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'p', to: 'a', label: 'calls' },
        { from: 'a', to: 'd', label: 'uses' },
        { from: 'd', to: 'i', label: 'saves via', dashed: true }
      ],
      caption: 'Because domain code knows nothing about web pages, you can test it without a browser, and put a mobile app on top without touching it.' },

    { kind: 'sequence', title: 'One request, through every layer',
      body: 'Follow a "place order" request down and back up.',
      actors: ['Presentation', 'Application', 'Domain', 'Infrastructure'],
      steps: [
        { from: 0, to: 1, label: 'placeOrder(cartId)', note: 'The web endpoint has parsed the request and hands over the plain facts.' },
        { from: 1, to: 3, label: 'load cart', note: 'The application layer asks infrastructure for the data it needs.' },
        { from: 1, to: 2, label: 'order.place()', note: 'It then asks the **domain** to do the real work. The business rules are enforced here.' },
        { from: 1, to: 3, label: 'save order', note: 'The application layer asks infrastructure to store the result (SQL happens in there and nowhere else).' },
        { from: 1, to: 0, label: 'order id', dashed: true, note: 'It reports success upwards.' },
        { at: 0, label: 'format as JSON, 201', note: 'The presentation layer decides how the answer looks.' }
      ] },

    { kind: 'code', title: 'Two layers in code',
      body: 'The domain knows rules and nothing about the outside world. Infrastructure knows how to store things.',
      code: { lang: 'js', src: `
        // domain: no HTTP, no SQL
        class Order {
          place() {
            if (this.lines.length === 0) throw new Error('Empty order');
            this.status = 'placed';
          }
        }

        // infrastructure: knows SQL
        class OrderRepository {
          save(order) {
            db.query('INSERT INTO orders (id, status) VALUES (?, ?)',
              [order.id, order.status]);
          }
        }`,
        notes: {
          4: 'The rule is pure logic. It can be tested by creating an `Order` and calling `place()`: no web server, no database.',
          12: 'Swapping SQL for another database means changing only this class.'
        } } },

    { kind: 'compare', title: 'What belongs where',
      body: 'A cheat sheet for arguments in code review.',
      cols: ['Belongs here', 'Does not belong here'],
      rows: [
        ['Presentation', 'Parsing requests, forms, JSON/HTML formatting, status codes', 'Business rules, SQL'],
        ['Application', 'Steps of a use case, transactions, calling domain and infrastructure', 'Business rules (they belong to the domain), HTML'],
        ['Domain', 'Entities, rules, calculations, domain vocabulary', 'HTTP, SQL, email, framework types'],
        ['Infrastructure', 'Database code, email sending, payment APIs, file access', 'Business decisions']
      ] },

    { kind: 'pitfall', title: 'Leaks between layers',
      body: `Layers only help if they are respected. The usual leaks:`,
      code: { lang: 'js', src: `
        class Order {
          place(req, res) {
            if (req.body.lines.length === 0) {
              res.status(400).send('Empty order');
              return;
            }
            db.query('UPDATE orders SET status = ?', ['placed']);
          }
        }`,
        notes: {
          2: 'The domain now depends on web objects. It cannot be tested, or reused in a mobile app, without faking a request.',
          4: 'The domain is choosing HTTP status codes, which is a presentation decision.',
          7: 'SQL in the domain: infrastructure has leaked upwards.'
        } },
      note: 'Other leaks: business rules in a web controller, or an application layer that grows into a pile of `if`s while the domain objects are left as empty data holders (the anemic model again). Also, for a tiny app, four layers can be overkill.' },

    { kind: 'tip', title: 'Two quick tests',
      body: `1. **Can I test my business rules with no database and no web server?** If not, something has leaked into the domain.
        2. **Could I swap the database, or add a mobile app, without touching the rules?** If not, a layer is doing a job that belongs elsewhere.

        Some systems apply layering strictly (a layer may only call the one directly below), others relax it (any lower layer). Pick one and stay consistent.

        Later modules show a refinement where the arrow from domain to infrastructure is *inverted*, so the domain depends on nothing at all. For now, the main lesson is the shape: **layers, with dependencies pointing one way.**` }
  ],

  activities: [
    { type: 'order', after: 2, prompt: 'Order the four layers from top (closest to the user) to bottom (closest to the machinery).',
      items: ['Presentation', 'Application', 'Domain', 'Infrastructure'],
      explain: 'The user touches presentation. It calls the application layer, which uses the domain model, which relies on infrastructure for storage and other technical services.' },

    { type: 'mcq', after: 3, q: 'In a layered architecture, which dependency is **not** allowed?',
      options: ['The domain layer calling a presentation-layer web controller', 'The presentation layer calling the application layer', 'The application layer using domain objects', 'The application layer asking infrastructure to save data'],
      answer: 0,
      why: [null, 'Presentation calling downwards is exactly the intended direction.', 'The application layer is meant to use the domain.', 'Calling downwards to infrastructure is allowed.'],
      explain: 'Dependencies point down. A lower layer must not know about a higher one, otherwise the "layering" is just a diagram.' },

    { type: 'bucket', after: 6, prompt: 'Which layer does each job belong to?', buckets: ['Presentation', 'Application', 'Domain', 'Infrastructure'],
      items: [['Turn the order result into JSON for the browser', 0], ['Parse the incoming HTTP request', 0], ['Coordinate: load cart, place order, save it', 1], ['Start the "place an order" use case', 1], ['Rule: an order cannot be empty', 2], ['Calculate an order’s total from its lines', 2], ['The SQL INSERT statement', 3], ['Send the email through the mail server', 3]],
      explain: 'Presentation deals with input and output formats. Application orchestrates steps. The domain holds the rules. Infrastructure deals with the outside world: databases, mail servers and so on.' },

    { type: 'spot', prompt: 'A controller has reached into another layer’s job. Tap the line.',
      code: { lang: 'js', src: `
        app.post('/orders', (req, res) => {
          const cart = req.body;
          if (cart.total > 1000 && !cart.customer.verified) {
            return res.status(403).send('Verify first');
          }
          placeOrder.run(cart);
          res.sendStatus(201);
        });` },
      lines: [3],
      explain: 'The rule about big orders needing a verified customer is a business rule, so it belongs in the domain (or at least behind the application layer). In the controller it will be skipped by any other entry point, such as a mobile app or a batch job.' },

    { type: 'ab', q: 'Which `Order` is better layered?',
      a: { lang: 'js', label: 'Knows the web', src: `
        class Order {
          place(req, res) {
            if (!req.body.lines.length) res.status(400).send('Empty');
          }
        }` },
      b: { lang: 'js', label: 'Knows only rules', src: `
        class Order {
          place() {
            if (!this.lines.length) throw new Error('Empty order');
          }
        }` },
      answer: 'b',
      explain: 'The second can be tested and reused anywhere. The presentation layer decides how to turn the error into a 400 response. The first is welded to web objects.' },

    { type: 'cloze', text: 'In a layered design, dependencies point {{down}}. The layer holding the business rules is the {{domain}} layer, and the layer that talks to databases and mail servers is {{infrastructure}}.',
      distractors: ['up', 'presentation', 'application'],
      explain: 'Code in a layer may use layers below it. The domain holds the rules; infrastructure is the technical machinery, such as databases.' },

    { type: 'tf', statement: 'Putting business rules in the application layer is just as good as putting them in the domain, because both sit below the web page.', answer: false,
      explain: 'The application layer coordinates steps. If the rules live there too, domain objects become empty data holders (the anemic model) and the rules are tied to specific use cases, rather than guarded by the objects they govern.' },

    { type: 'scenario', title: 'Adding a mobile app',
      intro: 'A shop’s website is built as one big controller per page: each reads the request, applies the rules, runs SQL and returns HTML. The owner wants a mobile app by Christmas, using the same ordering logic.',
      meters: { 'duplication': 60, 'speed to market': 50 },
      steps: [
        { text: 'You notice the "no empty orders" and "stock check" rules are inside the web controller. What is your first move?',
          choices: [
            { label: 'Move the rules into an `Order` domain class and the steps into a `PlaceOrder` use case that both the website and the app can call', score: 2, effects: { 'duplication': -30, 'speed to market': -5 }, feedback: 'Now there is one place for the rules, and each front end only translates input and output.' },
            { label: 'Copy the controller code into the new mobile API', score: 0, effects: { 'duplication': 30, 'speed to market': 15 }, feedback: 'Fast now. Every future rule change must be made twice, and one copy will get forgotten.' },
            { label: 'Have the mobile app call the website’s HTML pages', score: 0, effects: { 'duplication': 5, 'speed to market': -15 }, feedback: 'It couples the app to page layouts, and you would have to scrape the results.' }
          ] },
        { text: 'The new `PlaceOrder` code needs to save the order. Where should the SQL go?',
          choices: [
            { label: 'In an `OrderRepository` in the infrastructure layer, called by the application layer', score: 2, effects: { 'duplication': -15 }, feedback: 'SQL lives in one place. A later database change touches one class.' },
            { label: 'Inside `Order.place()` so it is "all in one place"', score: 0, effects: { 'duplication': 10 }, feedback: 'The domain now depends on the database and cannot be tested without one.' },
            { label: 'In the mobile and web controllers separately', score: 0, effects: { 'duplication': 25 }, feedback: 'Two copies of the SQL, and two places to break.' }
          ] },
        { text: 'The mobile team wants error responses as plain codes, the website wants friendly HTML. Where does that difference live?',
          choices: [
            { label: 'In each presentation layer: both call the same use case and format the result their own way', score: 2, effects: { 'duplication': -10, 'speed to market': 10 }, feedback: 'Presentation is precisely the layer for "how it looks". Everything beneath stays identical.' },
            { label: 'In the domain, with an `isMobile` flag on `Order`', score: 0, effects: { 'duplication': 20 }, feedback: 'The domain now knows about devices, which has nothing to do with orders.' },
            { label: 'In the database, with two status columns', score: 0, effects: { 'duplication': 15 }, feedback: 'Storing presentation differences in data complicates everything that reads it.' }
          ] }
      ],
      outro: 'Layers earn their keep on the day **a second front end or a new database arrives**.' },

    { type: 'explain', prompt: 'Explain the four layers and why dependencies should point one way.',
      model: 'Presentation handles input and output (web pages, API formats). Application coordinates the steps of a use case. Domain holds the business model and rules. Infrastructure deals with databases, email and other technical services. Dependencies point downwards so a lower layer never knows about a higher one: the domain can be tested and reused without a web server or database, and one layer can change without disturbing the others.',
      keywords: ['presentation', 'application', 'domain', 'infrastructure', 'down', 'test'] }
  ],

  flashcards: [
    { q: 'Name the four layers, top to bottom.', a: 'Presentation, application, domain, infrastructure.' },
    { q: 'What does the domain layer contain?', a: 'The business model and rules: entities, calculations and the vocabulary of the business, with no knowledge of HTTP or SQL.' },
    { q: 'What does the application layer do?', a: 'It coordinates one use case at a time, calling the domain and infrastructure, and holds no business rules itself.' },
    { q: 'Which way should dependencies point?', a: 'Downwards. Higher layers may use lower ones, and lower layers never know about higher ones.' },
    { q: 'Give two signs of a leak between layers.', a: 'Business rules in a web controller, or HTTP or SQL code inside a domain class.' }
  ],

  glossary: [
    { term: 'Layered architecture', def: 'Organising code into layers with distinct jobs, where each layer depends only on the layers below it.', like: 'A restaurant: dining room, waiters, kitchen rules, storeroom.' },
    { term: 'Presentation layer', def: 'The layer that deals with input and output: web pages, API endpoints, screens.', like: 'The dining room and menu.' },
    { term: 'Application layer', def: 'The layer that coordinates the steps of each use case, using the domain and infrastructure.', aka: ['service layer'], like: 'The head waiter.' },
    { term: 'Domain layer', def: 'The layer containing the business model and its rules.', like: 'The chef’s recipes and kitchen rules.' },
    { term: 'Infrastructure layer', def: 'The layer providing technical services: databases, email, file storage and external APIs.', like: 'The storeroom and deliveries.' }
  ],

  takeaways: [
    'Four layers: **presentation, application, domain, infrastructure**.',
    'Dependencies point **down only**, so the rules can be tested and reused without the web or the database.',
    'Rules belong in the **domain**, steps in the application, formats in presentation, plumbing in infrastructure.',
    'Watch for leaks: SQL in the domain, rules in the controller. Do not over-layer tiny apps.'
  ],

  links: [
    { label: 'Martin Fowler: Presentation Domain Data Layering', url: 'https://martinfowler.com/bliki/PresentationDomainDataLayering.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('oop', {
  title: 'The Hydra of Classes',
  intro: 'Cut off one tangled hierarchy and two more grow back. Twelve questions on encapsulation, inheritance, interfaces, domain models and layers stand between you and a clean codebase.',
  questions: [
    { type: 'mcq', q: 'A `Cart` class keeps `#items` private but has `get items() { return this.#items; }`. A caller runs `cart.items.push({ sku: "X", price: -5 })`. What went wrong?',
      options: ['The getter leaked the real internal array, so the caller bypassed every rule in the class', 'Private fields cannot be read from outside, so the code should have thrown', 'Arrays in JavaScript are always shared, so nothing can be done', 'The cart needed a setter to validate the price'],
      answer: 0,
      why: [null, 'The field is private, but the getter hands out the object it points to, which is a different matter.', 'The getter can return a copy, which stops this.', 'A setter would not help: the push never goes through it.'],
      explain: 'Privacy protects the field, not the thing it refers to. Returning a copy or a read-only view keeps changes flowing through methods that check the rules.' },

    { type: 'short', q: 'What is the name for a rule about an object that must be true after construction and after every public method?', accept: ['invariant', 'invariants', 'class invariant', 'class invariants'], hint: 'It never varies.',
      explain: 'A class invariant, such as "the balance is never below the overdraft limit", is what encapsulation exists to protect.' },

    { type: 'ab', q: 'A teammate wants cart methods like `reverse` and `filter` for free. Which design is safer?',
      a: { lang: 'js', label: 'Extends Array', src: `
        class Cart extends Array {
          total() { /* ... */ }
        }` },
      b: { lang: 'js', label: 'Holds an array', src: `
        class Cart {
          #items = [];
          add(item) { /* checks, then push */ }
          total() { /* ... */ }
        }` },
      answer: 'b',
      explain: 'A cart is not a kind of array (it fails the is-a test). Extending it hands out `splice`, `length = 0` and every other back door. Holding an array privately keeps the rules in one place.' },

    { type: 'mcq', q: 'A base class has `depositAll(amounts)` that loops calling `this.deposit`. A subclass overrides both `deposit` and `depositAll` to count deposits. Why is the count too high?',
      options: ['The base `depositAll` calls the overridden `deposit`', 'Overriding a method makes it run twice per call', '`super` calls are executed in a random order', 'The subclass cannot see the base class’s methods'],
      answer: 0,
      why: [null, 'Overriding replaces the method. The doubling comes from what the base class does internally.', 'Order is perfectly predictable.', 'Subclasses can call inherited public methods; that is how this works at all.'],
      explain: 'The subclass depended on an internal detail of the base class: that `depositAll` calls `deposit`. This is the fragile base class problem.' },

    { type: 'spot', prompt: 'Tap the line that polymorphism could remove.',
      code: { lang: 'js', src: `
        function describe(shape) {
          if (shape instanceof Circle) {
            return 'round, area ' + Math.PI * shape.r ** 2;
          } else if (shape instanceof Square) {
            return 'square, area ' + shape.side ** 2;
          }
        }` },
      lines: [2, 4],
      explain: 'The `instanceof` ladder asks each object what kind it is. Give every shape a `describe()` method and the ladder disappears; a new shape needs no change here.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Overriding', 'A subclass replaces an inherited method; chosen at run time'], ['Overloading', 'Same method name, different parameters; not built into JavaScript'], ['Ubiquitous language', 'One vocabulary shared by the business and the code'], ['Entity', 'A thing with a lasting identity, such as order 42'], ['Duck typing', 'Usable if it has the right methods, whatever its type']] },

    { type: 'bucket', prompt: 'Abstract class or interface?', buckets: ['Abstract class', 'Interface'],
      items: [['Can hold shared fields and finished methods', 0], ['A class can use many of them', 1], ['A class can extend only one', 0], ['A pure contract of method signatures', 1], ['Models "is a kind of" with shared code', 0], ['Models "can do" roles, even for unrelated classes', 1]],
      explain: 'Abstract classes are families sharing code, with a single parent. Interfaces are contracts that any number of unrelated classes can promise to keep.' },

    { type: 'cloze', code: true, text: 'class Account {\n  {{private}} log: string[] = [];\n  {{protected}} balance = 0;\n  public owner = "";\n}',
      distractors: ['static', 'abstract', 'readonly'],
      explain: '`private` keeps `log` to the class alone. `protected` also lets subclasses at `balance`. `public` lets everyone read `owner`.' },

    { type: 'tf', statement: 'If the sign-up form validates every field, the domain objects do not need to enforce their own invariants.', answer: false,
      explain: 'Other callers (an import script, an admin tool, another service) skip the form. Validation helps the user at the edge; invariants are the object’s own guarantee against every caller.' },

    { type: 'multi', q: 'Which of these are signs of an anemic domain model?', options: ['An `Order` class with a getter and a setter for every field and no other methods', 'Services that read an object’s fields, decide, then write back through setters', 'The same rule copied into three services', 'An `Order` with a `cancel()` method that checks its own status', 'A private status field changed only through methods'],
      answers: [0, 1, 2],
      explain: 'Data bags, read-decide-write services and duplicated rules are the anemic pattern. An object that carries and enforces its own rules is the rich alternative.' },

    { type: 'order', prompt: 'Put these steps of turning a business sentence into a model in a sensible order.',
      items: ['Take a real sentence from the business', 'Underline the nouns as candidate classes', 'Underline the verbs as candidate methods', 'Put the rules inside the methods', 'Review the names with the domain experts'],
      explain: 'Start from the experts’ own words, find classes and methods, place the rules, and then go back to the experts to see whether it still sounds like their business.' },

    { type: 'mcq', q: 'In a layered design, a `PlaceOrder` use case is called by a web endpoint. The rule "orders over £1,000 need a verified customer" is currently an `if` in the web endpoint. What should happen?',
      options: ['Move it into the domain, so every entry point (web, mobile, batch job) is subject to it', 'Leave it: the web endpoint is where requests arrive', 'Copy it into the mobile endpoint too', 'Move it into the database as a trigger and remove it from the code'],
      answer: 0,
      why: [null, 'Any other entry point would skip the rule.', 'Duplicated rules drift apart.', 'Rules about the business are the domain’s job, and hiding them in the database makes them hard to find and test.'],
      explain: 'Business rules belong in the domain layer, below every front end, so every route into the system goes through them.' }
  ]
});

KS.sheet('oop', {
  title: 'Object-Oriented Design cheat sheet',
  sections: [
    { title: 'The four pillars',
      md: `| Pillar | In one line | Smell when missing |
|---|---|---|
| **Encapsulation** | Data plus the rules guarding it, with internals hidden | Any code can corrupt state |
| **Abstraction** | Show *what*, hide *how* | Callers know provider details |
| **Inheritance** | "Is a" reuse: extends and overrides | Copy-pasted classes |
| **Polymorphism** | One call, many behaviours chosen at run time | Repeated switch / instanceof ladders |

Getters and setters that accept anything are **not** encapsulation. Return copies, not internals.` },

    { title: 'Inheritance and polymorphism',
      md: `- Sentence test: "a ___ **is a** ___". "Has a" means a field, not \`extends\`.
- \`super()\` runs the parent constructor; \`super.method()\` calls the parent version.
- **Fragile base class**: a subclass depends on the base's internals, so base changes can break it.
- Deep hierarchies (past 2-3 levels) are a warning sign.
- **Overriding**: subclass replaces a method, resolved at run time. **Overloading**: same name, different parameters (not in JavaScript).
- **Duck typing**: the right method is enough; errors appear when the code runs.
- Replace repeated type checks with a method on each class.` },

    { title: 'Abstract class vs interface',
      md: `| | Abstract class | Interface |
|---|---|---|
| Can be created with \`new\` | No | No |
| Shared code and state | Yes | No (pure contract) |
| Classes can use | One | Many |
| Models | Family, "is a kind of" | Role, "can do" |
| Keyword | \`abstract\` (TS, Java, C#) | \`interface\` |

Plain JavaScript has neither keyword: use \`new.target\` checks and duck typing. Default to **concrete**. Keep interfaces **small**. Code to the interface, not the class.` },

    { title: 'Visibility, scope and static',
      md: `| Level | Who can use it |
|---|---|
| public | Any code |
| protected | The class and its subclasses |
| package / internal | The same package or assembly |
| private (\`#x\` in JS) | Only the class itself |

- Start private; widen only for a real caller.
- **Scope** = where a name is visible. **Lifetime** = how long it lives. Keep both narrow.
- **static** = one shared copy on the class. Constants fine; shared mutable state is a trap.
- Do not make things public just for tests.` },

    { title: 'Modelling the domain',
      md: `- Nouns suggest **classes**, verbs suggest **methods**, rules go inside the methods.
- **Entity**: identity persists (order 42). **Value object**: defined by value (money).
- **Anemic**: data in objects, rules in services (Fowler: anti-pattern, fine for plain CRUD and data carriers). **Rich**: objects guard their own rules.
- **Ubiquitous language** (Eric Evans): the business's words in talk *and* code. One term, one meaning per context.
- Translation steps lose meaning (void vs cancelled).
- Read-aloud test: could the shop owner follow \`order.cancel()\`?` },

    { title: 'Class invariants',
      md: `An **invariant** is true after construction and after every public method.

1. Make fields private.
2. Check in the constructor: born valid.
3. Check in every method that changes state: check first, change second.
4. Never hand out mutable internals.
5. Design types so bad states cannot be written (one status per shape, not several flags).

**Validation** (edge, friendly error) is not an invariant (inside the object, a bug if broken). Rules spanning many objects, like unique emails, need a wider owner and a database constraint.` },

    { title: 'Layered architecture',
      md: `| Layer | Job | Not here |
|---|---|---|
| Presentation | Input and output: pages, endpoints, JSON | Rules, SQL |
| Application | Steps of one use case | Business rules |
| Domain | Model and rules | HTTP, SQL |
| Infrastructure | Database, email, external APIs | Decisions |

Dependencies point **down only**. Test: can I run the rules with no web server and no database? Common leaks: rules in controllers, SQL in domain classes. Tiny apps do not need four layers.` }
  ]
});
