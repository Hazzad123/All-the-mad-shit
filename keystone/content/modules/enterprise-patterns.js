/* Module: enterprise-patterns — Enterprise Patterns.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs enterprise-patterns */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ep-transaction-script', {
  eli5: 'Most business software is a pile of rules about orders, accounts and bookings. The simplest way to organise those rules is one plain procedure per thing a user can do, read top to bottom like a recipe.',

  cards: [
    { kind: 'concept', title: 'Software that runs a business',
      body: `A game follows the laws of physics. A **business application** follows the rules of a business: *a customer cannot order more than we have in stock*, *orders over £100 ship free*, *a refund must be approved by a manager*.

        Almost every web app you will ever build is one of these: an online shop, a bank, a booking system, an internal tool for HR. Data goes in, rules get checked, data comes out, and a database remembers it all.

        The big question is a quiet one: **where do the rules live in the code?** Different answers lead to very different code bases.` },

    { kind: 'history', title: 'Fowler’s catalogue',
      body: `In 2002 a programmer called Martin Fowler published *Patterns of Enterprise Application Architecture* (people say **PoEAA**). He collected the habits he saw experienced teams using on business software and gave each one a name, just as the Gang of Four had done for classes and objects.

        Those names are now everyday vocabulary: *repository*, *unit of work*, *data mapper*, *DTO*. This module walks through the important ones.

        It starts with the most basic choice: the **three classic ways to organise business logic**.

        1. **Transaction script** (this lesson)
        2. **Domain model** (next lesson)
        3. **Table module** (a cousin we will meet next lesson)` },

    { kind: 'metaphor', title: 'One recipe card per dish',
      body: `Picture a kitchen with a binder of recipe cards. *Fried rice*: do steps one to eight. *Omelette*: do steps one to five. The cook follows a card from top to bottom and does not need to understand food in general.

        That is a **transaction script**: **one procedure per thing a user wants to do**. "Place an order" is one script. "Cancel an order" is another. "Run the monthly report" is a third.

        Each script is self-contained and reads like a story. The name comes from the fact that it usually wraps one database **transaction**: do everything, or nothing.

        Where the metaphor stops: real recipe cards rarely share steps by accident. Scripts do, as we will see.` },

    { kind: 'code', title: 'A transaction script in the wild',
      body: 'Everything needed to place an order is in one function. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        async function placeOrder(db, customerId, items) {
          if (items.length === 0) throw new Error('Empty order');
          const tx = await db.begin();
          let total = 0;
          for (const item of items) {
            const p = await tx.one(
              'SELECT price, stock FROM products WHERE id=$1', [item.id]);
            if (p.stock < item.qty) throw new Error('Out of stock');
            total += p.price * item.qty;
            await tx.run('UPDATE products SET stock=stock-$1 WHERE id=$2',
              [item.qty, item.id]);
          }
          if (total > 100) total = total * 0.9;
          const order = await tx.one(
            'INSERT INTO orders (customer_id, total) VALUES ($1,$2) RETURNING id',
            [customerId, total]);
          await tx.commit();
          return { orderId: order.id, total };
        }`,
        notes: {
          3: 'Open a database **transaction**: all the changes below succeed together or not at all.',
          8: 'A **business rule** (no overselling), written inline, right next to the SQL.',
          13: 'Another rule: orders over £100 get 10% off. It lives here, in this one function.',
          17: 'Commit, and hand back a result. Top to bottom, with no other classes involved.'
        } } },

    { kind: 'steps', title: 'The shape of almost every script',
      body: 'Once you have read a few, you notice they all follow the same rhythm.',
      steps: [
        { title: 'Check the input', body: 'Is the request even sensible? Empty basket, missing customer, negative quantity.' },
        { title: 'Load what you need', body: 'Run queries for the products, the customer, the current stock.' },
        { title: 'Apply the rules', body: 'Do the maths, check the limits, decide what is allowed.' },
        { title: 'Save the changes', body: 'Insert and update rows, inside a transaction.' },
        { title: 'Send back an answer', body: 'Return the new order id, or an error the caller can understand.' }
      ] },

    { kind: 'pitfall', title: 'Where it starts to hurt',
      body: `Now the business grows. A new **"reorder"** feature lets customers repeat an old order, and the discount must apply there too. So someone copies the 10% rule into \`reorder()\`.

        Months later marketing says: *"Make it 15%, but only for returning customers."* One developer updates \`placeOrder\`. Nobody remembers \`reorder\`. Customers who reorder get a different price from those who order.

        Scripts share nothing by default, so **rules get copied**, and copies drift apart. The more rules you have, and the more scripts that touch the same ones, the worse this gets.

        The fix is to share through helper functions, and eventually to move to a richer pattern.` },

    { kind: 'layers', title: 'Where scripts sit in the app',
      body: 'Fowler splits a business app into three broad layers. A transaction script lives in the middle one, and mixes in a lot of the bottom one.',
      layers: [
        { label: 'Presentation', note: 'Web pages, API routes: take the request, show the result.', icon: '🖥️' },
        { label: 'Business logic', note: 'The rules. Transaction scripts live here.', icon: '🧠', tone: 'accent' },
        { label: 'Data access', note: 'SQL, connections, files. Scripts often reach straight down.', icon: '🗄️' }
      ] },

    { kind: 'tip', title: 'When it is perfectly fine',
      body: `Transaction script gets a bad press, which is unfair. It is **simple**, the code reads in a straight line, and a new teammate can follow one request from start to finish in a single file.

        It is a great fit when:

        - the rules are **few and shallow** (mostly saving and showing data, often called *CRUD*, for create, read, update, delete)
        - the app is small, or short-lived, or an internal tool
        - the team is small and can keep the scripts in their heads
        - you are not yet sure what the business really needs

        A rule of thumb: **start here**, and move to a richer pattern when you catch yourself copying rules between scripts.` },

    { kind: 'realworld', title: 'Scripts you already know',
      body: `You have seen transaction scripts under other names. A typical Express route handler that validates, queries and replies. A serverless function that processes one event. A nightly job that totals the day's sales.

        Plenty of large, profitable systems are built mostly from them. The pattern is not a mistake to be cured, it is a **trade-off**: very low ceremony today, in exchange for duplication risk as the rules multiply.

        Next lesson shows the alternative: putting the rules *inside* the business objects themselves.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What is a transaction script?',
      options: ['One procedure that handles one request from start to finish, rules included', 'A script that records every database transaction in a log', 'A class that models each real-world thing in the business', 'A test that replays a day of customer orders'],
      answer: 0,
      why: [null, 'The word "transaction" refers to the all-or-nothing unit of work, not a log.', 'That describes the domain model pattern, which comes next.', 'It is production code, not a test.'],
      explain: 'A transaction script is a single procedure per user action. It checks input, applies the rules, saves the changes and replies, usually inside one database transaction.' },

    { type: 'tf', after: 5, statement: 'Transaction script is a bad pattern that every serious application should avoid.', answer: false,
      explain: 'It is the simplest way to organise business logic and is a sensible choice when rules are few and shallow. It only becomes painful when the same rules need to be shared between many scripts.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['PoEAA', 'Fowler’s catalogue of enterprise patterns'], ['Transaction script', 'One procedure per user action'], ['Business rule', 'A policy the code must enforce, like "no overselling"'], ['CRUD', 'Create, read, update, delete: mostly saving and showing data'], ['Presentation layer', 'The part that takes requests and shows results']] },

    { type: 'spot', prompt: 'Both scripts below apply a discount. Tap the line that shows the problem with this style.',
      code: { lang: 'js', src: `
        async function placeOrder(db, cart) {
          let total = sum(cart);
          if (total > 100) total = total * 0.9;
          return save(db, cart, total);
        }

        async function reorder(db, oldOrder) {
          let total = sum(oldOrder.items);
          if (total > 100) total = total * 0.9;
          return save(db, oldOrder.items, total);
        }` },
      lines: [3, 9],
      explain: 'The same discount rule is written twice. When the rule changes, someone has to remember both places, and if they forget one, customers get inconsistent prices. Sharing the rule in one helper (or one object) removes the risk.' },

    { type: 'bucket', prompt: 'Is a transaction script a comfortable fit here, or a risky one?', buckets: ['Comfortable fit', 'Getting risky'],
      items: [['An internal tool that edits a table of office plants', 0], ['A weekend prototype to test an idea', 0], ['A nightly job that emails the day’s sales total', 0], ['A pricing engine with 40 rules shared by checkout, quotes and reorders', 1], ['A booking system where five features each recalculate cancellation fees', 1], ['A product with a big team and rules that change every sprint', 1]],
      explain: 'Scripts shine when each one is small and independent. They struggle when many scripts must agree on the same many rules, because the copies drift apart.' },

    { type: 'order', prompt: 'Put the usual steps of a transaction script in order.',
      items: ['Check the input is sensible', 'Load the data it needs', 'Apply the business rules', 'Save the changes in a transaction', 'Return an answer to the caller'],
      explain: 'You cannot apply rules without data, and you should not save anything until the rules have approved it. The reply goes last, once you know what happened.' },

    { type: 'scenario', title: 'The two-price bug', intro: 'You maintain a small shop whose checkout, quote page and "reorder" button are each their own script. Customers are complaining: the same basket costs different amounts depending on how they bought it.',
      meters: { 'customer trust': 50, 'code health': 50 },
      steps: [
        { text: 'You look into it and find the 10% discount rule copied into all three scripts, with a different threshold in one of them. What first?',
          choices: [
            { label: 'Write down which rule is correct, then fix all three copies', score: 1, effects: { 'customer trust': 15, 'code health': 0 }, feedback: 'It fixes today’s bug, but the next change will have the same problem. Good first aid, not a cure.' },
            { label: 'Extract the rule into one shared function and make every script call it', score: 2, effects: { 'customer trust': 15, 'code health': 20 }, feedback: 'Yes. One place for the rule means one place to change. The scripts stay simple, and the duplication is gone.' },
            { label: 'Fix only the script customers complained about', score: 0, effects: { 'customer trust': -10, 'code health': -10 }, feedback: 'The other copies are still wrong. The next complaint is already on its way.' }
          ] },
        { text: 'Three months on, there are twelve pricing rules shared by six scripts, and the helper functions are a tangle. What do you suggest?',
          choices: [
            { label: 'Rewrite everything from scratch in a weekend', score: 0, effects: { 'customer trust': -15, 'code health': -10 }, feedback: 'Big-bang rewrites tend to run late and break things. Pricing is the heart of the shop.' },
            { label: 'Consider moving the pricing rules into business objects such as an Order, a step at a time', score: 2, effects: { 'code health': 20, 'customer trust': 5 }, feedback: 'Exactly the signal to graduate to a richer pattern, and doing it gradually keeps the shop running. That is the next lesson.' },
            { label: 'Add comments saying "keep in sync with the other scripts"', score: 0, effects: { 'code health': -15 }, feedback: 'A comment is a request to humans to be careful. People forget; code that shares one rule does not.' }
          ] }
      ],
      outro: 'The takeaway: scripts are fine until **many of them share many rules**. That is your cue to centralise.' },

    { type: 'explain', prompt: 'In your own words: what is a transaction script, and when is it a good choice?',
      model: 'A transaction script is a single procedure that handles one user action from start to finish: it checks the input, loads data, applies the rules, saves the changes in a transaction and replies. It is simple and easy to read, so it is a good choice for small apps or shallow, CRUD-style rules. It gets risky when many scripts share the same rules, because copies drift apart.',
      keywords: ['one procedure', 'request', 'rules', 'simple', 'duplicate', 'CRUD'] }
  ],

  flashcards: [
    { q: 'What is a transaction script?', a: 'A single procedure that handles one user request from start to finish, with the business rules written inside it.' },
    { q: 'What is the main weakness of transaction scripts?', a: 'Rules get copied between scripts and the copies drift apart as the business changes.' },
    { q: 'When is transaction script a good choice?', a: 'When rules are few and shallow (mostly CRUD), the app is small, or you are still learning what the business needs.' },
    { q: 'What are the three classic ways to organise business logic?', a: 'Transaction script, domain model and table module.' },
    { q: 'What is PoEAA?', a: 'Martin Fowler’s 2002 book *Patterns of Enterprise Application Architecture*, a named catalogue of patterns for business applications.' }
  ],

  glossary: [
    { term: 'Enterprise application', def: 'Software that stores and processes the data and rules of a business, such as orders, accounts or bookings.', like: 'The back office of a company, in code.' },
    { term: 'Transaction script', def: 'A pattern where each user action is one procedure that runs top to bottom, with the business rules inside it.', like: 'A recipe card for one dish.', aka: ['TS'] },
    { term: 'Business logic', def: 'The rules a business follows, such as stock limits, discounts and approvals.', like: 'The house rules of a shop, as opposed to the till.', aka: ['domain logic'] },
    { term: 'CRUD', def: 'Create, read, update, delete: the four basic things you do with stored data. An app that is mostly CRUD has few real rules.', like: 'A filing cabinet: add, look up, edit, shred.' },
    { term: 'PoEAA', def: 'Patterns of Enterprise Application Architecture, Martin Fowler’s catalogue of patterns for business software.', like: 'A field guide to the habits of business code.' }
  ],

  takeaways: [
    'Transaction script = **one procedure per user action**, rules included.',
    'It is simple and readable, so it is a sensible place to **start**.',
    'The danger is **copied rules** that drift apart as scripts multiply.',
    'When many scripts share many rules, move towards a richer pattern.'
  ],

  links: [
    { label: 'Martin Fowler: Transaction Script', url: 'https://martinfowler.com/eaaCatalog/transactionScript.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ep-domain-model', {
  eli5: 'Instead of one long procedure that pushes plain data around, you build objects that look like the real things in the business, and each object knows its own rules.',

  cards: [
    { kind: 'concept', title: 'Move the rules next to the data',
      body: `Last lesson ended with a discount rule copied into three scripts. There is a neat way out: ask *which thing in the business owns this rule?*

        The rule says *"orders over £100 get 10% off"*. It is about an **order**. So why does the code live in a function far away from anything called Order?

        A **domain model** is a set of objects that mirror the business (\`Order\`, \`Customer\`, \`Product\`), where each object holds its **data and its behaviour**. You do not ask a script to work out the total. You ask the order: \`order.total()\`.

        The *domain* is just the area of business the software is about.` },

    { kind: 'metaphor', title: 'A script reader versus a seasoned shopkeeper',
      body: `Imagine two shop assistants. The first follows a laminated card: *"if the total is over £100, press button 7."* They have no idea why.

        The second has worked there for years. They *know* that big orders get a discount, that fragile items cannot go in a bag with tins, and that you never sell the last display model. Ask them anything and they answer.

        Transaction script is the laminated card. A domain model is the shopkeeper: knowledge lives **inside the objects**, so every part of the system that talks to an order gets the same sensible behaviour for free.

        Where it stops: a shopkeeper can quietly be wrong. An object's rules still need tests.` },

    { kind: 'code', title: 'An Order that knows its own rules',
      body: 'Compare this with the script from last lesson. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class Order {
          constructor() { this.lines = []; this.status = 'open'; }

          addLine(product, qty) {
            if (this.status !== 'open') throw new Error('Order is closed');
            if (qty < 1) throw new Error('Quantity must be positive');
            this.lines.push({ product, qty });
          }

          total() {
            const sum = this.lines.reduce((s, l) => s + l.product.price * l.qty, 0);
            return sum > 100 ? sum * 0.9 : sum;
          }

          ship() {
            if (this.lines.length === 0) throw new Error('Nothing to ship');
            this.status = 'shipped';
          }
        }`,
        notes: {
          5: 'The object **protects itself**: you simply cannot add lines to a closed order, from any script.',
          12: 'The discount rule lives in **one place**. Checkout, quotes and reorders all call \`total()\`.',
          16: '\`ship()\` enforces its own rule too. Callers cannot put the order into a nonsense state.'
        } } },

    { kind: 'diagram', title: 'A web of collaborating objects',
      body: 'Real models are several objects that work together. Each owns the rules about itself.',
      nodes: [
        { id: 'cust', label: 'Customer', icon: '🧑', x: 1, y: 0 },
        { id: 'order', label: 'Order', icon: '🧾', x: 1, y: 1, tone: 'accent' },
        { id: 'line', label: 'OrderLine', x: 0, y: 2 },
        { id: 'ship', label: 'ShippingAddress', x: 2, y: 2 },
        { id: 'prod', label: 'Product', icon: '📦', x: 0, y: 3 }
      ],
      edges: [
        { from: 'cust', to: 'order', label: 'places' }, { from: 'order', to: 'line', label: 'has many' },
        { from: 'order', to: 'ship', label: 'goes to' }, { from: 'line', to: 'prod', label: 'is of' }
      ],
      caption: 'Behaviour like totals, limits and status changes is split across these objects, close to the data each one holds.' },

    { kind: 'compare', title: 'Three ways to organise the logic',
      body: 'Fowler names three. Table module is the least common today, but you will see it in older code.',
      cols: ['Transaction script', 'Domain model', 'Table module'],
      rows: [
        ['Shape', 'One procedure per action', 'Objects for business things', 'One class per database table'],
        ['Where rules live', 'Inside each script', 'Inside the objects', 'In the table’s class, for all its rows'],
        ['Complexity it handles', 'Low', 'High', 'Medium'],
        ['Upfront effort', 'Very little', 'A fair bit', 'Moderate'],
        ['Main risk', 'Copied rules', 'Over-engineering', 'Logic across tables gets awkward']
      ] },

    { kind: 'pitfall', title: 'The anaemic domain model',
      body: `The most common way to get this wrong looks like a domain model but is not one. You create \`Order\`, \`Customer\` and \`Product\` classes... holding nothing but fields and getters. All the logic still lives in \`OrderService\`, which pokes at the objects from outside.

        Fowler calls this the **anaemic domain model**. You pay the cost of lots of classes and get none of the benefit, since the rules are scattered in services again, and nothing stops a caller setting \`status = 'shipped'\` on an empty order.

        A quick test: if you can delete every method from your domain classes and the app still works, they are only data bags.` },

    { kind: 'concept', title: 'The cost of richness',
      body: `A domain model is powerful, and **it is not free**.

        - **Learning curve.** Teammates must think in objects and relationships, not in "steps of a request".
        - **Mapping.** Rich objects do not look like database rows, so you need a way to translate (the next few lessons are about this).
        - **More upfront design.** You have to decide what the objects are and who owns which rule.
        - **Overkill risk.** For a form that saves four fields, it is a lot of ceremony.

        The payoff comes when rules are **many, tangled and always changing**. Then the model gives each rule a home, and the code starts to *speak the language of the business*.` },

    { kind: 'tip', title: 'Growing into it',
      body: `You do not need to choose forever on day one. A healthy path is:

        1. Begin with scripts while the app is small.
        2. Spot a rule being copied. Move it onto the object it is really about (\`Order.total()\`).
        3. Repeat. Over time the scripts get thinner and the objects get smarter.

        The scripts do not vanish. They shrink into short **coordinators** that load objects, call their methods and save the result. Later lessons give that coordinator a proper name: the *use case*.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What defines a domain model?',
      options: ['Objects that mirror the business and hold both data and behaviour', 'A diagram of the database tables and their columns', 'A folder of helper functions grouped by feature', 'A class for each web page the app shows'],
      answer: 0,
      why: [null, 'A table diagram describes storage, not behaviour.', 'Helper functions are how scripts share code, which is a different pattern.', 'Pages are presentation. The domain is the business itself.'],
      explain: 'The point of a domain model is that the rules live inside objects named after business things, so every caller gets the same behaviour.' },

    { type: 'ab', after: 2, q: 'Which design keeps the "closed orders cannot change" rule safest?',
      a: { lang: 'js', label: 'Rule in a service', src: `
        function addLine(order, product, qty) {
          if (order.status !== 'open') throw new Error('Closed');
          order.lines.push({ product, qty });
        }
        // elsewhere: order.lines.push(...) works fine` },
      b: { lang: 'js', label: 'Rule in the object', src: `
        class Order {
          addLine(product, qty) {
            if (this.status !== 'open') throw new Error('Closed');
            this.lines.push({ product, qty });
          }
        }` },
      answer: 'b',
      explain: 'When the check lives in the object, there is one front door and it always checks. With the rule kept outside the object, any other code can still reach in and break it. (Making the list private goes further still.)' },

    { type: 'spot', prompt: 'This is meant to be a domain model, but it is missing the point. Tap the line that is the giveaway.',
      code: { lang: 'js', src: `
        class Invoice {
          constructor() { this.lines = []; this.paid = false; }
          getLines() { return this.lines; }
          setPaid(v) { this.paid = v; }
        }

        class InvoiceService {
          total(invoice) { return sum(invoice.getLines()); }
          markPaid(invoice) { invoice.setPaid(true); }
        }` },
      lines: [4, 8, 9],
      explain: '`Invoice` is only fields with getters and setters, and every rule lives in `InvoiceService`. This is the anaemic domain model. Moving `total()` and `markPaid()` into `Invoice` (with a check that it is not already paid) gives the object real behaviour.' },

    { type: 'bucket', prompt: 'Which pattern best suits each situation?', buckets: ['Transaction script', 'Domain model'],
      items: [['A back-office screen that edits a list of office locations', 0], ['A quick report that totals sales per day', 0], ['An insurance quote engine with hundreds of interacting rules', 1], ['A booking system whose cancellation rules change every month', 1], ['A throwaway data import for a one-off migration', 0], ['A trading platform where the same rules apply to many different features', 1]],
      explain: 'Shallow, isolated jobs suit scripts. Deep, interconnected, ever-changing rules suit a model that gives each rule a single home.' },

    { type: 'multi', q: 'Which are real costs of adopting a domain model?',
      options: ['You need a way to translate rich objects to and from database rows', 'The team must learn to think in objects and relationships', 'It is overkill for apps that mostly just save and show data', 'It makes the same rule appear in more places', 'It cannot be tested without a database'],
      answers: [0, 1, 2],
      explain: 'Mapping, learning curve and overkill risk are the genuine costs. A model usually reduces duplication, and because rules sit in plain objects they are *easier* to test, with no database needed.' },

    { type: 'cloze', code: true, text: `class Order {
  total() { return sum(this.lines); }
}
// a model with only fields and getters is {{anaemic}}
// rules live {{inside}} the objects, not in a separate service`,
      distractors: ['abstract', 'outside', 'private'],
      explain: 'The word Fowler uses for objects with data but no behaviour is anaemic. In a real domain model the rules live inside the objects.' },

    { type: 'scenario', title: 'The refund rules', intro: 'Your shop’s refund logic is spread across five scripts. Today the support team asks for a new rule: *gift orders can only be refunded to store credit*. A developer sketches three ways to add it.',
      meters: { 'bug risk': 50, 'team speed': 50 },
      steps: [
        { text: 'Where should the new gift-order rule go?',
          choices: [
            { label: 'Add it to all five scripts that touch refunds', score: 0, effects: { 'bug risk': 20, 'team speed': -10 }, feedback: 'Five edits, five chances to miss one, and the next rule means five edits again.' },
            { label: 'Put a `refund()` method on `Order` that knows about gift orders, and make scripts call it', score: 2, effects: { 'bug risk': -20, 'team speed': 10 }, feedback: 'Yes. Refund rules are about an order, so the order owns them. Every caller is protected by the same check.' },
            { label: 'Add a comment in each script and rely on code review', score: 0, effects: { 'bug risk': 15 }, feedback: 'Reviews miss things, and comments rot. Structure beats vigilance.' }
          ] },
        { text: 'A teammate proposes adding `Order`, `Refund` and `Customer` classes that are only getters and setters, with a `RefundService` doing the work. What do you say?',
          choices: [
            { label: 'Great: that is the domain model pattern', score: 0, effects: { 'bug risk': 10 }, feedback: 'The objects have no behaviour, so the rules are scattered in the service again. That is the anaemic trap.' },
            { label: 'Let’s put the rules on the objects and keep services thin', score: 2, effects: { 'bug risk': -10, 'team speed': 5 }, feedback: 'Right. Services can still exist, but only to coordinate. The rules belong with the data they guard.' },
            { label: 'Skip classes entirely and go back to one big script', score: 1, effects: { 'team speed': -5 }, feedback: 'Fine for a small app, but you have just met the problem the model exists to solve.' }
          ] }
      ],
      outro: 'Ask *which thing owns this rule?* and put the rule there.' },

    { type: 'explain', prompt: 'Explain the difference between a transaction script and a domain model, and name one cost of a domain model.',
      model: 'A transaction script puts the rules inside one procedure per user action, so rules can be copied between scripts. A domain model puts the rules inside objects that mirror the business, such as Order, so every caller shares them. The cost is more upfront design: mapping objects to the database, a learning curve and overkill for simple apps.',
      keywords: ['procedure', 'objects', 'rules', 'behaviour', 'mapping', 'overkill'] }
  ],

  flashcards: [
    { q: 'What is a domain model?', a: 'A set of objects that mirror the business, each holding its own data and the rules about itself.' },
    { q: 'What is an anaemic domain model?', a: 'Classes with only fields and getters/setters, while all the rules live in separate services. It has the cost of a model and little of the benefit.' },
    { q: 'What is a table module?', a: 'One class per database table that holds the logic for all rows of that table, typically working on a set of records.' },
    { q: 'Name two costs of a rich domain model.', a: 'Mapping objects to database rows, and a learning curve and extra design effort. It is overkill for simple CRUD apps.' },
    { q: 'How do scripts fit into an app that uses a domain model?', a: 'They shrink into thin coordinators that load objects, call their methods and save the result.' }
  ],

  glossary: [
    { term: 'Domain', def: 'The area of the business that the software is about, such as shipping, insurance or banking.', like: 'The subject of the conversation.' },
    { term: 'Domain model', def: 'A set of objects that mirror the business and hold both data and behaviour.', like: 'A shopkeeper who knows the house rules, not a laminated card.' },
    { term: 'Table module', def: 'A pattern with one class per database table, holding logic for all rows in that table.', like: 'One clerk per filing cabinet.' },
    { term: 'Anaemic domain model', def: 'Domain classes that only carry data, with all the rules in outside services. Often seen as an anti-pattern.', like: 'A body with no muscle: the shape is there, the strength is not.' }
  ],

  takeaways: [
    'A domain model puts **data and rules together** in objects named after business things.',
    'Ask *"which thing owns this rule?"* and put it there.',
    'Objects with only getters and setters are **anaemic**: all cost, no benefit.',
    'Richness costs effort (mapping, design). Earn it with complex rules.'
  ],

  links: [
    { label: 'Martin Fowler: Domain Model', url: 'https://martinfowler.com/eaaCatalog/domainModel.html' },
    { label: 'Martin Fowler: Anemic Domain Model', url: 'https://martinfowler.com/bliki/AnemicDomainModel.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ep-entities-value-objects', {
  eli5: 'Some things in your software have an identity that outlasts any change (a customer who moves house is still the same customer), and some are just their value (a five-pound note is any five-pound note).',

  cards: [
    { kind: 'concept', title: 'Same person, or same value?',
      body: `Two questions.

        First: you have a customer called Sam Smith who changes her surname when she marries. Is she a **different customer** now? Obviously not. Her name, address and email can all change, and she is still *her*.

        Second: you hold a £5 note and I hold a £5 note. Are they different? To a shop, **no**. Swap them and nobody cares.

        Software has both kinds of thing, and treating them the same is a classic source of bugs. Domain-driven design gives them names:

        - **Entity**: defined by a lasting **identity**
        - **Value object**: defined entirely by its **value**` },

    { kind: 'metaphor', title: 'A friend versus a pound coin',
      body: `Your **friend** has an identity. She might get a haircut, move city and change jobs, and she is still your friend. Two friends with the same hair and job are still two people. You track them by *who they are*.

        A **pound coin** has no identity worth tracking. If I give you a different pound coin, nothing is lost. Two coins are "equal" simply because they are worth the same.

        An **entity** is the friend: you follow it through time using an id. A **value object** is the coin: you care what it *is*, and you can swap it for any equal one.

        Where it stops: context matters. To a mint inspecting serial numbers, each coin has an identity.` },

    { kind: 'code', title: 'Two kinds of equality',
      body: 'Entities compare ids. Value objects compare everything. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class Customer {                 // entity
          constructor(id, name) { this.id = id; this.name = name; }
          equals(other) { return this.id === other.id; }
        }

        class Money {                    // value object
          constructor(amount, currency) {
            this.amount = amount; this.currency = currency;
          }
          equals(o) {
            return this.amount === o.amount && this.currency === o.currency;
          }
        }

        new Money(500, 'GBP') === new Money(500, 'GBP');          // false!
        new Money(500, 'GBP').equals(new Money(500, 'GBP'));      // true`,
        notes: {
          3: 'Two \`Customer\` objects are the same customer if the **ids** match, even when the names differ (say, one copy loaded before her name change).',
          10: 'Two \`Money\` objects are equal when **every attribute** matches. There is no id.',
          15: 'In JavaScript \`===\` on objects asks "same object in memory?", which is not what we mean. That is why value objects need an \`equals\` method.'
        } } },

    { kind: 'compare', title: 'Entity versus value object',
      body: 'The practical differences, side by side.',
      cols: ['Entity', 'Value object'],
      rows: [
        ['Defined by', 'A lasting identity (an id)', 'Its attributes, together'],
        ['Equal when', 'The ids match', 'All attributes match'],
        ['Can change?', 'Yes, over its life', 'No: replace it with a new one'],
        ['Has a lifecycle?', 'Yes: created, changed, archived', 'No: it just is'],
        ['Examples', 'Customer, Order, Account', 'Money, DateRange, Address, Email']
      ] },

    { kind: 'code', title: 'An immutable Money',
      body: `Value objects should be **immutable**: once made, they never change. To "change" one you build a new one. That makes them safe to share around.

        Money is the classic. Never store prices as decimals like 19.99: computers cannot represent many decimal fractions exactly (famously \`0.1 + 0.2\` is \`0.30000000000000004\`). Store whole **pence** instead.`,
      code: { lang: 'js', src: `
        class Money {
          constructor(pence, currency) {
            this.pence = pence;
            this.currency = currency;
            Object.freeze(this);        // no changes after this point
          }
          add(other) {
            if (other.currency !== this.currency)
              throw new Error('Cannot add different currencies');
            return new Money(this.pence + other.pence, this.currency);
          }
        }`,
        notes: {
          5: '\`Object.freeze\` makes accidental changes fail or be ignored. Now a price cannot be altered behind your back.',
          8: 'The value object **guards its own rule**: you cannot add pounds to dollars by mistake.',
          10: '\`add\` returns a **new** Money and leaves both originals alone. Immutability in action.'
        } } },

    { kind: 'example', title: 'Dates and addresses too',
      body: `Money is the famous one, but plenty of everyday ideas make good value objects.

        - **DateRange** (start, end): it can refuse an end before the start, and answer \`overlaps(other)\` or \`days()\`. No more loose pairs of dates drifting around.
        - **Address** (street, city, postcode, country): you do not edit "the street" of an address. If a customer moves, you replace the **whole** address with a new one.
        - **Email**: validated once when created, so every email in the system is known to be well-formed.

        Each one bundles a **rule** with the value, so the rule cannot be forgotten.` },

    { kind: 'pitfall', title: 'Primitive obsession',
      body: `The lazy alternative is to use plain strings and numbers for everything: \`email\` is a string, \`amount\` is a number, \`currency\` is another string. This habit has a name: **primitive obsession**.

        Why is it risky? A string accepts *anything*. Nothing stops \`"hello"\` becoming an email. Nothing stops you swapping the arguments in \`refund('GBP', 25)\`. The compiler cannot help, because both are "just strings".

        With types like \`Email\` and \`Money\`, invalid values cannot exist and swapped arguments no longer compile (in TypeScript) or fail loudly at once.` },

    { kind: 'tip', title: 'How to decide which one it is',
      body: `Ask: **"If I replaced this with another one that has the same attributes, would anybody notice?"**

        - Replace a £5 with another £5: no. Value object.
        - Replace a customer with another customer called Sam Smith: yes! Entity.

        It depends on the business. In a shop, an address is a value. In a postal service that tracks each delivery point, an address may need an identity.

        Rule of thumb: **make it a value object unless you have a reason to track it over time.** Value objects are simpler, safer and easier to test.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'A customer changes her name and her address. Which statement is true?',
      options: ['She is the same entity, because identity does not depend on her attributes', 'She is a new entity, because her attributes changed', 'She becomes a value object, because her data is different', 'Her old record must be deleted and replaced'],
      answer: 0,
      why: [null, 'If identity changed whenever data changed, you could never track anyone.', 'She is still a customer with an identity. Value objects are things like Money.', 'Entities are updated in place; identity stays the same.'],
      explain: 'An entity is defined by a lasting identity, not by its current attributes. Her id stays, so she stays the same customer.' },

    { type: 'tf', after: 2, statement: 'In JavaScript, `new Money(500, "GBP") === new Money(500, "GBP")` is true, because both hold the same values.', answer: false,
      explain: '`===` on objects checks whether they are the very same object in memory. Two separate objects are never `===`, so value objects need their own `equals` method that compares attributes.' },

    { type: 'bucket', prompt: 'Entity or value object?', buckets: ['Entity', 'Value object'],
      items: [['A bank account', 0], ['An amount of £20', 1], ['A date range for a holiday booking', 1], ['An order placed last Tuesday', 0], ['A postcode', 1], ['A registered user', 0], ['A colour such as RGB(255, 0, 0)', 1]],
      explain: 'Things you follow through time (accounts, orders, users) are entities. Things that are just a value and can be swapped for an equal one (amounts, ranges, postcodes, colours) are value objects.' },

    { type: 'ab', q: 'Which is the better way to add two prices?',
      a: { lang: 'js', label: 'Mutating', src: `
        add(other) {
          this.pence += other.pence;
          return this;
        }` },
      b: { lang: 'js', label: 'Returning a new value', src: `
        add(other) {
          return new Money(this.pence + other.pence,
                           this.currency);
        }` },
      answer: 'b',
      explain: 'If `add` changes the original, anything else holding that Money sees its price change unexpectedly. Returning a new value keeps every existing Money safe to share.' },

    { type: 'spot', prompt: 'This compiles and runs without complaint, yet it is a bug. Tap the line that goes wrong.',
      code: { lang: 'js', src: `
        function refund(orderId, amount, currency) {
          // ... talks to the payment provider
        }

        refund('GBP', 25, 'ord_17');` },
      lines: [5],
      explain: 'The arguments are in the wrong order, but everything is a string or a number, so nothing objects. This is primitive obsession. Passing an `OrderId` and a `Money` would make the mistake impossible or immediately visible.' },

    { type: 'multi', q: 'Which are good reasons to store money as whole pence (or cents) rather than decimals like 19.99?',
      options: ['Computers cannot represent many decimal fractions exactly', 'Whole numbers add up without tiny rounding surprises', 'Pence take less space in memory than pounds', 'Adding 0.1 and 0.2 gives exactly 0.3 in decimals'],
      answers: [0, 1],
      explain: 'Binary floating point cannot hold values like 0.1 exactly, so sums drift (0.1 + 0.2 gives 0.30000000000000004). Whole pence are exact. Storage size is irrelevant, and the last option is simply false.' },

    { type: 'cloze', code: true, text: `class Email {
  constructor(text) {
    if (!text.includes('{{@}}')) throw new Error('Not an email');
    this.text = text;
    Object.{{freeze}}(this);
  }
}
// using strings for everything is called primitive {{obsession}}`,
      distractors: ['seal', 'dependency', '#'],
      explain: 'The constructor rejects bad input, so every `Email` in the system is valid. `Object.freeze` makes it immutable, and relying on raw strings is called primitive obsession.' },

    { type: 'scenario', title: 'The penny that went missing', intro: 'Your shop stores prices as JavaScript numbers like 19.99. Accounting says the daily total is a few pence out, and it gets worse on busy days. You are asked to fix it.',
      meters: { 'accounting trust': 40, 'effort': 70 },
      steps: [
        { text: 'You find sums of dozens of decimals being added, with rounding at the end. What do you do?',
          choices: [
            { label: 'Round each price to 2 decimal places everywhere it is used', score: 1, effects: { 'accounting trust': 5, 'effort': -20 }, feedback: 'This hides some errors but needs doing in every place that touches money. Someone will forget, and you are still using inexact numbers.' },
            { label: 'Introduce a `Money` value object holding whole pence and a currency', score: 2, effects: { 'accounting trust': 30, 'effort': -15 }, feedback: 'Exact whole-number maths, and the rules (no mixing currencies, no changes after creation) live in one place.' },
            { label: 'Tell accounting that a few pence is normal', score: 0, effects: { 'accounting trust': -30 }, feedback: 'Money has to add up. A few pence a day becomes an audit problem.' }
          ] },
        { text: 'The first version of `Money` has a public `amount` field and a `setAmount()` method. A teammate says it is fine. Your view?',
          choices: [
            { label: 'Make it immutable: no setter, and `add` returns a new Money', score: 2, effects: { 'accounting trust': 15, 'effort': -5 }, feedback: 'Immutable values are safe to share. Nobody can change a basket’s price by accident from far away.' },
            { label: 'Keep the setter, but ask people to be careful', score: 0, effects: { 'accounting trust': -15 }, feedback: 'Careful is not a design. One shared Money mutated in one place changes it everywhere that holds it.' },
            { label: 'Make `amount` a string so nobody can do maths on it', score: 0, effects: { 'effort': -10 }, feedback: 'Now you have primitive obsession in a different disguise, and no maths at all.' }
          ] }
      ],
      outro: 'Replace a risky primitive with a small immutable type that knows its own rules.' },

    { type: 'explain', prompt: 'Explain the difference between an entity and a value object, with one example of each.',
      model: 'An entity has a lasting identity (usually an id), so it stays the same thing as its attributes change; a customer is an example. A value object has no identity and is defined by its attributes, so two with equal attributes are interchangeable and it is immutable; Money is an example.',
      keywords: ['identity', 'id', 'attributes', 'immutable', 'equal', 'Money'] }
  ],

  flashcards: [
    { q: 'What is an entity?', a: 'An object defined by a lasting identity (such as an id). It can change over time and is still the same thing.' },
    { q: 'What is a value object?', a: 'An object defined entirely by its attributes, with no identity. Two with equal attributes are interchangeable, and it should be immutable.' },
    { q: 'How are entities and value objects compared for equality?', a: 'Entities by id; value objects by all their attributes.' },
    { q: 'What is primitive obsession?', a: 'Using plain strings and numbers for domain ideas like email or money, so invalid or swapped values slip through unnoticed.' },
    { q: 'Why store money as whole pence rather than 19.99?', a: 'Floating-point decimals are inexact (0.1 + 0.2 is not exactly 0.3). Whole numbers add up exactly.' }
  ],

  glossary: [
    { term: 'Entity', def: 'A domain object with a lasting identity. It may change over time but stays the same thing.', like: 'A friend: new haircut, same person.' },
    { term: 'Value object', def: 'A domain object defined entirely by its attributes, with no identity. Treated as immutable.', like: 'A pound coin: any equal one will do.' },
    { term: 'Immutable', def: 'Cannot be changed after it is created. To "change" it, you make a new one.', like: 'A printed ticket: you cannot edit it, only print another.' },
    { term: 'Primitive obsession', def: 'Representing domain ideas with raw strings and numbers instead of small dedicated types.', like: 'Labelling every box in a warehouse simply "box".' }
  ],

  takeaways: [
    'Entity = **identity** that outlasts change. Value object = **its value**, interchangeable.',
    'Value objects are **immutable** and compare **all** their attributes.',
    'Money, dates, addresses and emails are classic value objects.',
    'Avoid **primitive obsession**: give domain ideas their own small types.'
  ],

  links: [
    { label: 'Martin Fowler: Value Object', url: 'https://martinfowler.com/bliki/ValueObject.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ep-repositories', {
  eli5: 'A repository lets your code ask for objects as if they were sitting in a simple list in memory, while it quietly handles the database behind the scenes.',

  cards: [
    { kind: 'concept', title: 'SQL everywhere is a mess',
      body: `Imagine a shop whose code looks like this: the checkout page runs \`SELECT * FROM orders WHERE …\`. The admin page runs a slightly different one. The email job runs a third. Each has its own idea of column names and joins.

        Then the database team renames a column. Now you hunt through the whole code base.

        A **repository** gives the rest of the program one small, tidy doorway to stored objects. It looks like a **collection in memory**: you \`add\` things, ask for them back with \`findById\`, and never see a table, a join or a query language.` },

    { kind: 'metaphor', title: 'The library desk',
      body: `In a library you do not wander into the stacks, learn the shelving system and pull books from the shelves yourself. You go to the **desk** and say: *"I would like this title."*

        The librarian knows where everything lives, may fetch it from a back room, and could reorganise the whole building tomorrow without you ever noticing. You still just ask at the desk.

        A repository is that desk. Your business code says \`orders.findById(42)\`. Whether the order comes from PostgreSQL, a file or a test fixture is the librarian's business.` },

    { kind: 'code', title: 'What a repository looks like',
      body: 'An interface in the language of the business, with no SQL in sight. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        // The contract your business code depends on
        class OrderRepository {
          add(order)            { /* store a new order */ }
          findById(id)          { /* return one order, or null */ }
          findOverdueFor(customerId) { /* orders unpaid for 30+ days */ }
          save(order)           { /* store changes to an existing order */ }
        }

        // Using it: reads like talking about orders, not tables
        async function chaseLatePayers(orders, customerId) {
          const late = await orders.findOverdueFor(customerId);
          late.forEach(order => order.sendReminder());
        }`,
        notes: {
          5: 'The method name is **domain language**: "overdue for a customer". The SQL, joins and date maths are hidden inside.',
          12: 'This caller has no idea a database exists. It asks for orders and gets orders.'
        } } },

    { kind: 'diagram', title: 'Business code points at an interface',
      body: 'The use case depends on the idea of a repository. Real and fake versions plug in behind it.',
      nodes: [
        { id: 'uc', label: 'Business code', icon: '🧠', x: 1, y: 0, tone: 'accent' },
        { id: 'iface', label: 'OrderRepository', x: 1, y: 1 },
        { id: 'sql', label: 'SQL version', icon: '🗄️', x: 0, y: 2 },
        { id: 'mem', label: 'In-memory fake', icon: '🧪', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'uc', to: 'iface', label: 'uses' },
        { from: 'sql', to: 'iface', label: 'implements', dashed: true },
        { from: 'mem', to: 'iface', label: 'implements', dashed: true }
      ],
      caption: 'This is the dependency inversion idea from the design principles module, applied to storage.' },

    { kind: 'compare', title: 'Repository versus DAO',
      body: `You will also meet the **DAO** (data access object). The two are cousins, and people do blur them, so treat this as the usual distinction rather than a law.`,
      cols: ['DAO', 'Repository'],
      rows: [
        ['Thinks in terms of', 'Tables and records', 'Business objects, like a collection'],
        ['Typical methods', 'insert, update, delete, selectAll', 'add, findById, findOverdueFor'],
        ['Grain', 'Often one per table', 'One per aggregate'],
        ['Returns', 'Rows or plain records', 'Fully formed domain objects'],
        ['Speaks the language of', 'The database', 'The business']
      ] },

    { kind: 'concept', title: 'One repository per aggregate',
      body: `An **aggregate** (from domain-driven design) is a cluster of objects that must stay consistent together and is treated as one unit. An \`Order\` and its \`OrderLine\`s form one: nobody should edit a line without going through the order.

        So you have an **\`OrderRepository\`**, and you do **not** have an \`OrderLineRepository\`. Loading an order brings its lines with it, and saving the order saves them too.

        Why? If outsiders could fetch and change lines directly, they could skip the order's rules (like "closed orders cannot change"). The repository is the **only front door**, so the rules stay in charge.

        A good test: if two things cannot meaningfully exist apart, they share one repository.` },

    { kind: 'code', title: 'The in-memory repository',
      body: 'Because business code only knows the interface, you can swap in a fake that keeps everything in an array.',
      code: { lang: 'js', src: `
        class InMemoryOrderRepository {
          constructor() { this.orders = new Map(); }

          async add(order)   { this.orders.set(order.id, order); }
          async save(order)  { this.orders.set(order.id, order); }
          async findById(id) { return this.orders.get(id) ?? null; }
        }

        // In a test: fast, no database, no setup
        const orders = new InMemoryOrderRepository();
        await orders.add(new Order('o-1'));
        await chaseLatePayers(orders, 'c-9');`,
        notes: {
          1: 'A plain \`Map\` pretending to be a database. It has the **same methods** as the real repository.',
          11: 'Tests run in milliseconds and need no database server, no cleanup and no network. That is a huge win.'
        } } },

    { kind: 'pitfall', title: 'The leaky repository',
      body: `A repository stops being useful the moment it leaks storage details. Watch for these:

        - Methods like \`findBySql(query)\` or \`find(whereClause)\`: callers are writing SQL again.
        - Returning a **query builder** or a raw ORM object that callers keep filtering.
        - A "generic repository" with thirty methods that mirrors the database instead of the business.
        - Business rules inside the repository. It stores and fetches; it does not decide.

        If swapping the database would force you to edit the callers, the repository is leaking.` },

    { kind: 'tip', title: 'Name methods after questions the business asks',
      body: `Good repository methods sound like something a person in the business would say: \`findOverdueFor(customer)\`, \`findOpenOrdersOlderThan(days)\`, \`nextIdentity()\`.

        Bad ones sound like database operations: \`selectWhere\`, \`updateColumn\`, \`runQuery\`.

        Start with only the methods you actually need. Repositories grow one honest question at a time, not by copying every query you can imagine.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What does a repository give your business code?',
      options: ['A collection-like interface to stored objects, hiding how they are stored', 'A faster database engine with built-in caching', 'A way to write SQL with fewer typos', 'A copy of the database that stays in sync automatically'],
      answer: 0,
      why: [null, 'Speed is not the point. A repository is about abstraction.', 'SQL goes inside the repository, hidden from callers rather than made nicer.', 'It does not duplicate the database; it fronts it.'],
      explain: 'A repository lets code ask for objects as if they lived in an in-memory collection. The storage technology stays behind the interface.' },

    { type: 'tf', after: 5, statement: 'A well-designed system usually has one repository per database table.', answer: false,
      explain: 'That is closer to the DAO style. A repository is per aggregate: an Order and its lines share one `OrderRepository`, so every change goes through the order and its rules.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Repository', 'A collection-like front door to stored aggregates'], ['DAO', 'Usually a table-focused data access class'], ['Aggregate', 'A cluster of objects treated as one consistent unit'], ['In-memory repository', 'A fake that stores objects in an array or map, for tests'], ['Leaky repository', 'One that exposes SQL or query builders to callers']] },

    { type: 'spot', prompt: 'This use case should not know the database exists. Tap the line that breaks the idea of a repository.',
      code: { lang: 'js', src: `
        class CancelOrder {
          constructor(db) { this.db = db; }

          async run(orderId) {
            const row = await this.db.query(
              'SELECT * FROM orders WHERE id = $1', [orderId]);
            const order = Order.fromRow(row);
            order.cancel();
          }
        }` },
      lines: [6, 7],
      explain: 'The use case writes SQL itself. Swap the database, rename a column or write a test, and this code has to change. It should call something like `orders.findById(orderId)` and let the repository handle the query.' },

    { type: 'ab', q: 'Which repository method is better designed?',
      a: { lang: 'js', label: 'Generic query', src: `
        orders.find(
          "status = 'unpaid' AND due < now() - interval '30 days'"
        )` },
      b: { lang: 'js', label: 'Domain question', src: `
        orders.findOverdueFor(customerId)` },
      answer: 'b',
      explain: 'The second speaks in business terms and hides the query. The first makes every caller write database syntax, and the definition of "overdue" gets copied around instead of living in one place.' },

    { type: 'bucket', prompt: 'Is this a sign of a healthy repository, or a leak?', buckets: ['Healthy', 'Leaking'],
      items: [['`findById(id)` returns a ready-made Order', 0], ['`findOverdueFor(customerId)`', 0], ['`findBySql(sqlText)`', 1], ['Returns a query builder that callers keep filtering', 1], ['An in-memory version exists for tests', 0], ['The repository decides whether an order may be cancelled', 1]],
      explain: 'A healthy repository speaks the language of the business and hides storage. Letting callers pass SQL or reshape queries leaks the database, and rules about cancelling belong to the order, not the repository.' },

    { type: 'cloze', code: true, text: `// one repository per {{aggregate}}, not per table
class OrderRepository {
  findById(id) { /* returns an {{Order}} with its lines */ }
}
// tests swap in an {{in-memory}} version`,
      distractors: ['table', 'row', 'mock-up'],
      explain: 'Repositories are per aggregate, return whole domain objects (an Order along with its lines) and can be replaced by an in-memory version for fast tests.' },

    { type: 'scenario', title: 'The test suite that takes 20 minutes', intro: 'Your team’s tests all need a running database, so the suite takes 20 minutes and often fails because of leftover data. Developers have stopped running it.',
      meters: { 'test speed': 20, 'team morale': 40 },
      steps: [
        { text: 'The business code currently calls the database directly. What is the best first move?',
          choices: [
            { label: 'Buy a bigger test database server', score: 0, effects: { 'test speed': 5, 'team morale': -5 }, feedback: 'Slightly faster, but the tests still depend on shared data and a server. The root cause is untouched.' },
            { label: 'Put a repository interface in front of storage and use it from the business code', score: 2, effects: { 'test speed': 25, 'team morale': 20 }, feedback: 'Now business logic only needs *an* OrderRepository. The real SQL version can be tested separately and rarely.' },
            { label: 'Delete the slowest tests', score: 0, effects: { 'test speed': 15, 'team morale': -15 }, feedback: 'Faster, but now you know less about whether anything works.' }
          ] },
        { text: 'The repository exists. How should most business-rule tests run?',
          choices: [
            { label: 'Against an in-memory repository, with a small number of tests for the real SQL one', score: 2, effects: { 'test speed': 40, 'team morale': 20 }, feedback: 'Thousands of rule tests in milliseconds, plus a thin layer of slower tests proving the SQL version matches the contract.' },
            { label: 'Still against the real database, but run in parallel', score: 1, effects: { 'test speed': 10 }, feedback: 'It helps, but parallel tests fight over the same rows and flake. You are working around the design instead of fixing it.' },
            { label: 'Mock every database call one by one', score: 0, effects: { 'test speed': 10, 'team morale': -10 }, feedback: 'Heavy mocking ties tests to how the code talks to the database. A small fake that behaves like the real repository is simpler and sturdier.' }
          ] }
      ],
      outro: 'A repository is a seam: real storage on one side, fast and fake on the other.' },

    { type: 'explain', prompt: 'Explain what a repository is, why it is usually per aggregate, and one benefit for testing.',
      model: 'A repository is a collection-like interface for storing and fetching domain objects that hides the database and query language. It is per aggregate (for example one OrderRepository for an Order and its lines) so every change goes through the aggregate root and its rules. Because callers depend only on the interface, tests can use a fast in-memory version with no database.',
      keywords: ['collection', 'interface', 'aggregate', 'hides', 'database', 'in-memory', 'tests'] }
  ],

  flashcards: [
    { q: 'What is a repository?', a: 'An object that looks like an in-memory collection of aggregates, hiding how and where they are stored.' },
    { q: 'How is a repository usually different from a DAO?', a: 'A repository speaks in business terms and is per aggregate; a DAO is typically table-centric and returns records. The terms are often blurred.' },
    { q: 'Why one repository per aggregate?', a: 'So every change goes through the aggregate root and its rules, instead of outsiders editing inner parts directly.' },
    { q: 'What is an in-memory repository for?', a: 'Fast tests without a database: same interface, backed by a map or array.' },
    { q: 'What is a "leaky" repository?', a: 'One that exposes storage details, such as raw SQL or query builders, so callers depend on the database again.' }
  ],

  glossary: [
    { term: 'Repository', def: 'A collection-like interface for adding and finding domain objects, hiding the storage behind it.', like: 'The library desk: ask for a title, never visit the stacks.' },
    { term: 'DAO', def: 'Data access object: a class that wraps database access, typically per table and dealing in records.', like: 'A clerk who knows the filing cabinets but not the business.', aka: ['data access object'] },
    { term: 'Aggregate', def: 'A cluster of related objects that are kept consistent together and changed only through one root object.', like: 'A car and its wheels: you service the car, not a loose wheel.' },
    { term: 'In-memory repository', def: 'A test-friendly repository that keeps objects in a map or array instead of a database.', like: 'A stage prop version of the real thing.', aka: ['fake repository'] }
  ],

  takeaways: [
    'A repository makes stored objects look like a **collection in memory**.',
    'Name methods in **business language**, and keep SQL inside.',
    'One repository per **aggregate**, not per table.',
    'An **in-memory** version makes business tests fast and simple.'
  ],

  links: [
    { label: 'Martin Fowler: Repository', url: 'https://martinfowler.com/eaaCatalog/repository.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ep-mappers-orms', {
  eli5: 'Your program thinks in objects and the database thinks in rows. A mapper (or an ORM, which is a ready-made mapper) translates between the two so you do not write that translation by hand.',

  cards: [
    { kind: 'concept', title: 'Objects and rows do not match',
      body: `An \`Order\` object holds a list of \`OrderLine\` objects, points at a \`Customer\` and might inherit from a \`GiftOrder\`. It lives in memory and links to other objects by reference.

        A database holds **tables of flat rows**. An order is a row. Its lines are rows in another table that carry an \`order_id\` column. Links are foreign keys, and there is no inheritance.

        Moving data between the two worlds means turning a row into an object and an object back into rows, again and again. This awkward gap is nicknamed the **object-relational impedance mismatch**, which is a grand name for "they are shaped differently".` },

    { kind: 'metaphor', title: 'The interpreter in the middle',
      body: `Picture two people who speak different languages having a business meeting. You could teach everyone both languages. More sensibly, you hire an **interpreter**.

        The interpreter listens in one language, speaks in the other, and the two sides never need to know how that works.

        A **data mapper** is that interpreter between your objects and your tables. Your objects keep being nice, clean business objects. The database keeps being a nice, normalised set of tables. The mapper deals with the awkward bits between.

        Where it stops: translation is never perfect. Some things do not map neatly, and you occasionally need to look under the hood.` },

    { kind: 'compare', title: 'Two ways to do the translating',
      body: 'Fowler names both patterns. The difference is **who knows about the database**.',
      cols: ['Active Record', 'Data Mapper'],
      rows: [
        ['Who saves it?', 'The object itself: `user.save()`', 'A separate mapper: `mapper.save(user)`'],
        ['Does the object know the database?', 'Yes, it carries that knowledge', 'No: it is a plain object'],
        ['Simplicity', 'Very simple to start with', 'More pieces to understand'],
        ['Best for', 'CRUD-heavy apps, fast development', 'Rich domain models'],
        ['Seen in', 'Rails, Laravel Eloquent, and Django’s ORM (usually described this way)', 'Hibernate, Doctrine, SQLAlchemy, Entity Framework']
      ] },

    { kind: 'code', title: 'Active record: the object saves itself',
      body: 'Handy and compact. The class is also a doorway to its table.',
      code: { lang: 'js', src: `
        class User extends ActiveRecord {   // table: users
          // columns become properties: id, name, email
        }

        const user = await User.find(7);    // SELECT ... WHERE id = 7
        user.email = 'new@example.com';
        await user.save();                  // UPDATE users SET ...`,
        notes: {
          1: 'The class **inherits** the ability to talk to the database. Business objects and storage code are one thing.',
          5: 'A static method loads a row and gives back an object.',
          7: 'The object saves itself. Convenient, but it now knows about the database, so you cannot test it without one.'
        } } },

    { kind: 'code', title: 'Data mapper: the object stays plain',
      body: 'Here the object has no idea a database exists. A mapper translates.',
      code: { lang: 'js', src: `
        class User {                         // plain domain object
          constructor(id, name, email) { /* ... */ }
          changeEmail(email) { /* validates, then sets */ }
        }

        class UserMapper {
          async find(id) {
            const row = await db.one('SELECT * FROM users WHERE id=$1', [id]);
            return new User(row.id, row.name, row.email);
          }
          async update(user) {
            await db.run('UPDATE users SET email=$1 WHERE id=$2',
              [user.email, user.id]);
          }
        }`,
        notes: {
          1: 'No database code in the class at all. It can be tested with nothing around it.',
          8: 'The mapper turns a **row into an object**.',
          12: 'And turns an **object back into SQL**. All the awkward translation is in this one place.'
        } } },

    { kind: 'sequence', title: 'A unit of work at a glance',
      body: 'Change three objects, but write to the database once, in a single transaction.',
      actors: ['Your code', 'Unit of work', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'load user, order', note: 'Objects are loaded, and the unit of work **remembers** them.' },
        { at: 0, label: 'change user, order', note: 'Your code simply edits the objects, with no SQL.' },
        { from: 0, to: 1, label: 'commit()', note: 'You say "I am done".' },
        { at: 1, label: 'work out what changed', note: 'It compares each object with how it looked when loaded.' },
        { from: 1, to: 2, label: 'BEGIN; UPDATE; UPDATE; COMMIT', note: 'One transaction. All the changes land together, or none do.' }
      ] },

    { kind: 'concept', title: 'Unit of work, and lazy loading',
      body: `The **unit of work** pattern keeps track of everything you loaded, created, changed or deleted during one business action. At the end, it writes all of it in **one transaction** and no sooner. Fewer round trips, and no half-saved states.

        **Lazy loading** is the companion trick. When you load an \`Order\`, its hundred \`OrderLine\`s are not fetched yet. They arrive **the first time you touch** \`order.lines\`. Why pay for data you may never use?

        The catch: touch lazily-loaded data inside a loop and you can trigger one query per item. That is the **N+1 problem** you may have met already. The usual fix is to say up front what to fetch together ("eager loading").` },

    { kind: 'layers', title: 'What an ORM does for you',
      body: 'An **ORM** (object-relational mapper) is a library that bundles all of this. You rarely write these parts yourself.',
      layers: [
        { label: 'Your domain objects', note: 'Order, Customer, Product: plain, or lightly decorated.', icon: '🧠', tone: 'accent' },
        { label: 'Mapping & query building', note: 'Rows to objects and back; generates the SQL for you.', icon: '🔁' },
        { label: 'Unit of work & identity map', note: 'Tracks changes, batches writes, avoids duplicate objects.', icon: '📒' },
        { label: 'Lazy loading', note: 'Fetches related data only when it is first used.', icon: '😴' },
        { label: 'Database driver', note: 'The connection and the wire protocol to the database.', icon: '🔌' }
      ] },

    { kind: 'pitfall', title: 'An ORM is not a reason to skip SQL',
      body: `ORMs save a great deal of typing, but they are a **leaky abstraction**. Behind \`user.orders\` there is still a query, and an unlucky loop can run thousands of them.

        - Never trust that the generated SQL is efficient. Look at it, especially for slow pages.
        - Complex reports are often clearer in plain SQL. Most ORMs let you drop down to it.
        - The convenience of active record can quietly tie your business logic to your tables.

        Experts argue about this: some love the productivity, others call ORMs a trap. A sensible view is that they are a **tool**, and you will use them better if you understand the SQL they write.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What is the "impedance mismatch" between objects and relational databases?',
      options: ['The two are shaped differently: nested references versus flat rows', 'Databases are always much slower than objects held in memory', 'Objects cannot hold anywhere near as much data as tables can', 'SQL is not a proper programming language, so it needs wrapping'],
      answer: 0,
      why: [null, 'Speed is a separate matter. This is about structure.', 'Capacity is not the issue; shape is.', 'SQL is a perfectly good language for its purpose. It simply works on tables of rows.'],
      explain: 'Objects point at one another and can be nested or inherit. Tables are flat rows linked by keys. Translating between those shapes is the mismatch that mappers and ORMs deal with.' },

    { type: 'tf', after: 4, statement: 'With the data mapper pattern, the domain object knows nothing about the SQL that saves it.', answer: true,
      explain: 'Putting the SQL on the object is the active record pattern. In data mapper the object stays plain and a separate mapper holds the SQL, which keeps the object testable and free of storage concerns.' },

    { type: 'bucket', prompt: 'Which pattern does each description fit?', buckets: ['Active Record', 'Data Mapper'],
      items: [['`user.save()`', 0], ['`mapper.save(user)`', 1], ['The object extends a base class that knows the database', 0], ['The domain object is plain, with no database imports', 1], ['Quick to start for simple CRUD', 0], ['A good fit for a rich domain model', 1]],
      explain: 'Active record puts persistence into the object, which is fast and simple. Data mapper keeps it outside, trading a bit of extra structure for a cleaner domain.' },

    { type: 'order', prompt: 'Put the life of a unit of work in order.',
      items: ['Load objects; the unit of work tracks them', 'Your code edits the objects in memory', 'You call commit', 'The unit of work works out what changed', 'All changes are written in one transaction'],
      explain: 'The unit of work can only compare changes after you have made them, and it writes everything at the end in one go so it is all-or-nothing.' },

    { type: 'spot', prompt: 'This loop looks innocent, but with lazy loading it is slow. Tap the line that triggers the extra queries.',
      code: { lang: 'js', src: `
        const orders = await orderMapper.findRecent(100);

        for (const order of orders) {
          console.log(order.id, order.customer.name);
        }` },
      lines: [4],
      explain: 'Each `order.customer` is lazy-loaded the first time it is touched, so the loop can run one query for the orders plus one per order: the N+1 problem. Fetching customers together up front (eager loading, or a join) fixes it.' },

    { type: 'multi', q: 'Which of these does a typical ORM automate for you?',
      options: ['Turning rows into objects and back', 'Generating routine SQL', 'Tracking changes and saving them together', 'Deciding what your business rules should be', 'Making every query fast regardless of how you write it'],
      answers: [0, 1, 2],
      explain: 'Mapping, SQL generation and change tracking are the ORM’s bread and butter. It cannot decide your rules, and it cannot rescue a badly designed query or an N+1 loop.' },

    { type: 'cloze', text: 'In {{active record}} the object saves itself, while in {{data mapper}} a separate class translates; a {{unit of work}} batches changes into one transaction.',
      distractors: ['repository', 'DTO', 'singleton'],
      explain: 'Active record and data mapper are the two translation styles, and unit of work is the change-tracking pattern that commits everything at once.' },

    { type: 'scenario', title: 'Pick the persistence style', intro: 'Two projects land on your desk in the same week. You need to choose between active record and data mapper for each.',
      meters: { 'delivery speed': 50, 'long-term health': 50 },
      steps: [
        { text: 'Project one: an internal admin panel with forty tables, nearly all simple create/edit forms, a deadline in three weeks, and almost no business rules.',
          choices: [
            { label: 'Active record: it is quick and the rules are light', score: 2, effects: { 'delivery speed': 25, 'long-term health': 5 }, feedback: 'A good match. With simple CRUD, object-equals-row is a feature, and you will hit the deadline.' },
            { label: 'Data mapper with a full domain model, for purity', score: 0, effects: { 'delivery speed': -25 }, feedback: 'Plenty of ceremony for forms that just save fields. You will spend weeks on structure that earns nothing here.' },
            { label: 'Write raw SQL strings everywhere', score: 0, effects: { 'delivery speed': -10, 'long-term health': -15 }, feedback: 'You would rebuild a worse ORM, one query at a time.' }
          ] },
        { text: 'Project two: an insurance pricing system with hundreds of rules, a team of ten, and domain objects that must be tested in isolation.',
          choices: [
            { label: 'Data mapper: keep the domain objects plain', score: 2, effects: { 'long-term health': 25, 'delivery speed': -5 }, feedback: 'Yes. Rules can be tested without a database, and storage can change without touching the domain.' },
            { label: 'Active record, since it worked last time', score: 0, effects: { 'long-term health': -20, 'delivery speed': 10 }, feedback: 'Fast start, but the rules get glued to the table layout and every test needs a database.' },
            { label: 'Active record, but put the rules in big service classes', score: 1, effects: { 'long-term health': -5 }, feedback: 'Workable, but you are drifting towards an anaemic model. It avoids the problem rather than solves it.' }
          ] }
      ],
      outro: 'Match the style to the complexity of the rules, not to fashion.' },

    { type: 'explain', prompt: 'Explain the difference between active record and data mapper, and what a unit of work is for.',
      model: 'With active record the object knows how to save itself to its table (user.save()), which is simple but couples the object to the database. With data mapper the object is plain and a separate mapper translates between objects and rows. A unit of work tracks the objects you changed during a business action and writes all the changes in a single transaction.',
      keywords: ['active record', 'data mapper', 'plain', 'translate', 'unit of work', 'transaction'] }
  ],

  flashcards: [
    { q: 'What is the object-relational impedance mismatch?', a: 'Objects (references, nesting, inheritance) and relational tables (flat rows, foreign keys) have different shapes, so translating between them is awkward.' },
    { q: 'Active record versus data mapper?', a: 'Active record: the object saves itself and knows the database. Data mapper: the object is plain and a separate mapper does the translating.' },
    { q: 'What does a unit of work do?', a: 'Tracks what you loaded, changed or created during a business action, then writes it all in one transaction.' },
    { q: 'What is lazy loading, and its risk?', a: 'Related data is fetched only when first used. In a loop it can cause one query per item (the N+1 problem).' },
    { q: 'What is an ORM?', a: 'A library that bundles mapping, SQL generation, change tracking and lazy loading, so you do not write all that yourself.' }
  ],

  glossary: [
    { term: 'ORM', def: 'Object-relational mapper: a library that translates between objects and database rows and generates routine SQL.', like: 'A built-in interpreter between your code and the database.', aka: ['object-relational mapper'] },
    { term: 'Active Record', def: 'A pattern where each object wraps a table row and knows how to load and save itself.', like: 'A form that also posts itself.' },
    { term: 'Data Mapper', def: 'A pattern where a separate layer moves data between plain objects and the database.', like: 'A courier between two companies that never meet.' },
    { term: 'Unit of work', def: 'A pattern that tracks changes to objects during one business action and saves them together in one transaction.', like: 'A shopping basket you pay for once at the till.' },
    { term: 'Lazy loading', def: 'Fetching related data only when it is first accessed, not when its parent is loaded.', like: 'Only opening the boot of the car when you need your luggage.' }
  ],

  takeaways: [
    'Objects and rows are shaped differently, so something must **translate**.',
    '**Active record**: object saves itself. **Data mapper**: separate translator.',
    '**Unit of work** batches your changes into one transaction.',
    'ORMs automate a lot, but **lazy loading** and generated SQL can bite. Keep an eye on them.'
  ],

  links: [
    { label: 'Martin Fowler: Data Mapper', url: 'https://martinfowler.com/eaaCatalog/dataMapper.html' },
    { label: 'Martin Fowler: Active Record', url: 'https://martinfowler.com/eaaCatalog/activeRecord.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ep-identity-map', {
  eli5: 'An identity map is a notebook that remembers which database rows you have already turned into objects, so asking for the same row twice gives you the very same object back.',

  cards: [
    { kind: 'concept', title: 'Two copies of one customer',
      body: `Picture a single web request that handles a refund. One part of the code loads customer 42 to check their balance. Later, another part loads customer 42 again to send them an email.

        You now have **two separate objects** in memory for one database row. The first part changes the balance. The second part, holding its own stale copy, saves the customer back... and **quietly undoes the change**.

        Nobody wrote a bug on purpose. The trouble is simply that the same real-world thing exists twice in memory. An **identity map** fixes it with a simple promise: **one row, one object, per session**.` },

    { kind: 'metaphor', title: 'The receptionist’s register',
      body: `At a busy office, a receptionist sends staff to the archive to fetch client files. Without any system, two colleagues ask for the Henderson file and each gets a **photocopy**. Both scribble notes and nobody knows which copy is right.

        So the receptionist keeps a **register**: "Henderson file: already out, with Desk 3." When the second colleague asks, she doesn't go to the archive. She says *"Desk 3 has it. Share that one."*

        An identity map is the register. Before going to the database, check whether this id is already in the book.

        Where it stops: the register covers one office for one day. It does not outlive the session.` },

    { kind: 'code', title: 'Without one, equality breaks',
      body: 'Load the same row twice and see what happens.',
      code: { lang: 'js', src: `
        const a = await userMapper.find(42);
        const b = await userMapper.find(42);

        console.log(a === b);          // false: two objects!

        a.name = 'Sam Jones';
        console.log(b.name);           // still the old name`,
        notes: {
          4: 'Same row, **different objects**. \`===\` says they are not the same thing.',
          7: 'Change one copy and the other does not see it. The two now disagree about reality, and whichever is saved last wins.'
        } } },

    { kind: 'sequence', title: 'How the identity map helps',
      body: 'The mapper checks the map first, and only visits the database on a miss.',
      actors: ['Your code', 'Identity map', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'find User 42', note: 'Every load goes through the map.' },
        { from: 1, to: 0, label: 'not here yet', dashed: true, note: 'A miss: this session has not seen user 42.' },
        { from: 1, to: 2, label: 'SELECT ... WHERE id = 42', note: 'So the database is asked, once.' },
        { at: 1, label: 'remember User 42', note: 'The new object goes into the map, filed under its id.' },
        { from: 0, to: 1, label: 'find User 42 (again)', note: 'Later, the same question.' },
        { from: 1, to: 0, label: 'the same object', note: 'A hit: no query, and **the very same object** as before.' }
      ] },

    { kind: 'code', title: 'A tiny identity map',
      body: 'The core of it is just a map from id to object.',
      code: { lang: 'js', src: `
        class UserMapper {
          constructor(db) { this.db = db; this.loaded = new Map(); }

          async find(id) {
            if (this.loaded.has(id)) return this.loaded.get(id);

            const row = await this.db.one('SELECT * FROM users WHERE id=$1', [id]);
            const user = new User(row.id, row.name);
            this.loaded.set(id, user);
            return user;
          }
        }`,
        notes: {
          2: 'One map per mapper (and so per session). Keys are ids.',
          5: 'Already loaded? Return **the same instance**. No query.',
          9: 'Only after a miss is the object stored for next time.'
        } } },

    { kind: 'concept', title: 'The ORM session is one',
      body: `You rarely write this yourself. The **session** (or context, or entity manager) inside most ORMs already contains an identity map. In Hibernate it is the session, in SQLAlchemy the \`Session\`, in Entity Framework the \`DbContext\`.

        Because it saves loading the same row twice within a session, it is often called the **first-level cache**. It is bundled with the unit of work from last lesson: the session knows which objects it handed out, so it can spot changes and save them.

        A detail worth knowing: a *query* (say "all users in Leeds") still runs against the database. But for every row it returns, the session checks its map, and hands back the **existing object** if one is already there.` },

    { kind: 'compare', title: 'Identity map versus a normal cache',
      body: 'They sound alike, but they solve different problems.',
      cols: ['Identity map', 'Cache'],
      rows: [
        ['Purpose', 'Correctness: one object per row', 'Speed: avoid repeated work'],
        ['Lifetime', 'One session or request', 'Minutes, hours or longer'],
        ['Shared between users?', 'No, private to the session', 'Often yes'],
        ['Can go stale?', 'Only within a short session', 'Yes: needs expiry or invalidation'],
        ['Is it optional?', 'It keeps the unit of work honest', 'Yes: a pure optimisation']
      ] },

    { kind: 'pitfall', title: 'Keep sessions short',
      body: `The map's scope is its whole safety story. Two ways it goes wrong:

        - **A global, forever map.** Now it is a cache shared across users and time. It goes stale the moment anyone else (another server, another process) changes the row, and you are back to conflicting versions.
        - **A huge, long-lived session.** Everything you ever loaded stays in memory, and the objects get further and further from the truth in the database.

        The usual rule: **one session per request or per unit of work**, then throw it away. Short-lived by design.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What problem does an identity map solve?',
      options: ['One row loaded twice becomes two objects that can disagree', 'Lookups by id are slow because the table has no index', 'Two users logging in with the same password', 'Tables that have no primary key'],
      answer: 0,
      why: [null, 'That is what a database index is for, not an identity map.', 'That is an authentication matter. Identity maps are about in-memory objects.', 'Identity maps rely on primary keys. They do not replace them.'],
      explain: 'Without it, one row can exist as several in-memory objects. Changes to one are invisible to the others, and the last save wins. An identity map guarantees one object per row per session.' },

    { type: 'tf', after: 3, statement: 'With an identity map, loading user 42 twice in the same session returns the very same object, and the second load does not hit the database.', answer: true,
      explain: 'The first load goes to the database and the object is filed by its id. The second asks the map first, finds it, and returns the same instance.' },

    { type: 'ab', q: 'Which setup is safer for a web app handling many users at once?',
      a: { lang: 'js', label: 'One global map', src: `
        const loaded = new Map();   // module-level
        // shared by every request, forever` },
      b: { lang: 'js', label: 'One map per request', src: `
        function handle(req) {
          const session = new Session();   // fresh map
          // ... use it, then discard
        }` },
      answer: 'b',
      explain: 'A map per request keeps each user’s view of the data separate and short-lived. A global one becomes a shared, ever-ageing cache whose objects drift from the database and from each other.' },

    { type: 'estimate', q: 'A page lists 200 orders placed by only 20 different customers. Within one session with an identity map, how many separate `Customer` objects will exist once the page has loaded them all?',
      answer: 20, unit: 'objects', tolerance: 1.3, min: 1, max: 1000,
      explain: 'One object per distinct row: 20 customers means 20 `Customer` objects, however many orders point at them. All the orders from the same customer share one object.' },

    { type: 'spot', prompt: 'This mapper has no identity map. Tap the line that lets two copies of the same row exist.',
      code: { lang: 'js', src: `
        class UserMapper {
          async find(id) {
            const row = await this.db.one('SELECT * FROM users WHERE id=$1', [id]);
            return new User(row.id, row.name);
          }
        }` },
      lines: [4],
      explain: 'Every call builds a brand-new `User`, even if one for this id already exists. The fix is to check a map before querying and store the new object after, so repeat calls return the same one.' },

    { type: 'bucket', prompt: 'Does this describe an identity map, or a normal cache?', buckets: ['Identity map', 'Normal cache'],
      items: [['Guarantees one object per row in a session', 0], ['Thrown away at the end of the request', 0], ['Speeds things up by remembering results for minutes or hours', 1], ['Often shared between many users', 1], ['Needs an expiry time to avoid stale data', 1], ['Part of the ORM session or unit of work', 0]],
      explain: 'An identity map is about correctness inside one short session. A cache is about speed across requests, which is why it has to worry about staleness and expiry.' },

    { type: 'cloze', code: true, text: `async find(id) {
  if (this.loaded.{{has}}(id)) return this.loaded.get(id);
  const user = await load(id);
  this.loaded.{{set}}(id, user);
  return user;
}
// an ORM session is also called a first-level {{cache}}`,
      distractors: ['delete', 'queue', 'index'],
      explain: 'Check the map with `has`, store a fresh object with `set`. Because it saves repeat loads inside a session, the ORM session is often called a first-level cache.' },

    { type: 'scenario', title: 'The vanishing refund', intro: 'Customers report that refunds sometimes "disappear": the confirmation email says refunded, but the balance is unchanged. You suspect two copies of the same customer object.',
      meters: { 'data safety': 40, 'confidence': 50 },
      steps: [
        { text: 'Reading the code, one function loads the customer to adjust the balance, then a helper loads them again to send the email, and the helper’s save wins. What is the underlying cause?',
          choices: [
            { label: 'Two in-memory objects for one row, with the stale one saved last', score: 2, effects: { 'data safety': 15, confidence: 15 }, feedback: 'Exactly. They disagree, and the last save overwrites the other. This is what an identity map prevents.' },
            { label: 'The database is losing writes', score: 0, effects: { 'data safety': -10, confidence: -15 }, feedback: 'The database did exactly what it was told. It stored the second, stale save.' },
            { label: 'The email server is too slow', score: 0, effects: { confidence: -10 }, feedback: 'Email timing has nothing to do with the balance being overwritten.' }
          ] },
        { text: 'How do you fix it for good?',
          choices: [
            { label: 'Load through one session per request so both parts get the same object', score: 2, effects: { 'data safety': 25, confidence: 15 }, feedback: 'With an identity map in the session, both callers receive one shared object. Edits are seen by everyone and saved once.' },
            { label: 'Add a global map that lives for the whole life of the server', score: 0, effects: { 'data safety': -15 }, feedback: 'A forever map goes stale as soon as any other server or process updates the row, and it is shared between users.' },
            { label: 'Ask the helper to load the customer again just before saving', score: 1, effects: { 'data safety': 5, confidence: -5 }, feedback: 'It narrows the window but does not remove it, and it adds more queries. The structural fix is a shared object.' }
          ] }
      ],
      outro: 'One row, one object, one short session.' },

    { type: 'explain', prompt: 'Explain what an identity map is, why it prevents bugs, and why it should be short-lived.',
      model: 'An identity map keeps track of which database rows have already been loaded as objects in a session, so loading the same id twice returns the same object instead of a second copy. That prevents conflicting copies and lost updates, and saves repeat queries. It must be short-lived (one request or unit of work) or it turns into a stale, shared cache.',
      keywords: ['same object', 'session', 'row', 'copies', 'stale', 'short-lived'] }
  ],

  flashcards: [
    { q: 'What is an identity map?', a: 'A per-session register of objects already loaded, keyed by id, so each database row maps to only one object.' },
    { q: 'What bug does an identity map prevent?', a: 'Two in-memory copies of the same row disagreeing, so the last save overwrites the other’s changes.' },
    { q: 'Why is an ORM session called a first-level cache?', a: 'Its identity map avoids reloading a row already loaded in that session. It lasts only as long as the session.' },
    { q: 'Identity map versus cache?', a: 'An identity map is about correctness (one object per row) in one short session. A cache is about speed and can be long-lived and shared.' },
    { q: 'How long should an identity map live?', a: 'One request or unit of work. A long or global one goes stale and uses too much memory.' }
  ],

  glossary: [
    { term: 'Identity map', def: 'A map from id to object that makes sure each database row is loaded as only one object per session.', like: 'The receptionist’s register of which files are out.' },
    { term: 'Session', def: 'The short-lived workspace of an ORM that tracks loaded objects and their changes, usually one per request.', like: 'A desk you work at for one job, then clear.', aka: ['persistence context'] },
    { term: 'First-level cache', def: 'The built-in, per-session memory of an ORM, which avoids loading the same row twice in that session.', like: 'The notes on your own desk, as opposed to the shared filing room.' }
  ],

  takeaways: [
    'Without an identity map, one row can become **several objects** that disagree.',
    'An identity map says: **one row, one object, per session**.',
    'ORM sessions already include one, which is why they are called a first-level cache.',
    'Keep it **short-lived**: one session per request.'
  ],

  links: [
    { label: 'Martin Fowler: Identity Map', url: 'https://martinfowler.com/eaaCatalog/identityMap.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ep-dtos', {
  eli5: 'A DTO is a plain parcel of data, with no behaviour, made specially for carrying information across a boundary, such as from your server to a phone app, so you never hand over your real internal objects.',

  cards: [
    { kind: 'concept', title: 'The password in the response',
      body: `A developer writes an API endpoint in a hurry: load the user from the database, send it back as JSON. It works first time. Ship it!

        The \`User\` object has fields like \`passwordHash\`, \`isAdmin\`, \`internalNotes\` and \`stripeCustomerId\`. **All of them are now in the response**, visible to anyone who opens the browser's network tab.

        The deeper problem is that your internal objects were never designed to be shared. They change whenever the business changes, and now every client that depends on them breaks too.

        The cure is to send something else: a purpose-built plain parcel called a **DTO**, a *data transfer object*.` },

    { kind: 'metaphor', title: 'Pack a parcel, do not post the kitchen',
      body: `Say you want to send a friend your lasagne recipe. You do not ship them your kitchen, with the oven, the fridge and the half-eaten chocolate bar. You write the recipe on a card and post that.

        The card contains exactly what **they** need, in a form **they** can read, with nothing private attached. And you can rearrange your kitchen as often as you like. The card stays valid.

        A DTO is the card. Your entities are the kitchen. The DTO carries data across a **boundary** (server to client, service to service, layer to layer) so that each side stays free to change its insides.` },

    { kind: 'code', title: 'Leaky versus shaped',
      body: 'The same endpoint, written twice. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        // Leaky: the entity goes straight out
        app.get('/users/:id', async (req, res) => {
          const user = await users.findById(req.params.id);
          res.json(user);
        });

        // Shaped: a DTO is built on purpose
        app.get('/v2/users/:id', async (req, res) => {
          const user = await users.findById(req.params.id);
          res.json({ id: user.id, name: user.name, email: user.email });
        });`,
        notes: {
          4: 'Everything on the entity is serialised, including fields nobody meant to publish, and any added in future.',
          10: 'Only three named fields leave. Add a secret column tomorrow and it **cannot** leak, because it has to be listed here to be sent.'
        } } },

    { kind: 'code', title: 'A proper DTO and its mapper',
      body: 'The DTO is plain data. A small function maps from the entity.',
      code: { lang: 'ts', src: `
        // The shape the client sees. Data only.
        interface UserDto {
          id: string;
          displayName: string;
          memberSince: string;      // "2024-03-05"
        }

        function toUserDto(user: User): UserDto {
          return {
            id: user.id,
            displayName: user.firstName + ' ' + user.lastName,
            memberSince: user.joinedAt.toISOString().slice(0, 10),
          };
        }`,
        notes: {
          3: 'The DTO has **no behaviour**: just named fields, ready to turn into JSON.',
          5: 'Shaped for the consumer: two names joined, a date as plain text. Callers get what they need, not what we store.',
          9: 'The **mapping** lives in one place. If the entity changes, only this function changes, and clients are untouched.'
        } } },

    { kind: 'diagram', title: 'DTOs live at the edges',
      body: 'Inside, you work with rich objects. At each boundary, data is repackaged as a DTO going out, and arrives as one coming in.',
      nodes: [
        { id: 'client', label: 'Phone app', icon: '📱', x: 1, y: 0 },
        { id: 'dto', label: 'DTOs (plain data)', x: 1, y: 1, tone: 'warn' },
        { id: 'map', label: 'Mapping', x: 1, y: 2 },
        { id: 'ent', label: 'Entities & value objects', icon: '🧠', x: 1, y: 3, tone: 'accent' }
      ],
      edges: [
        { from: 'client', to: 'dto', label: 'JSON', both: true },
        { from: 'dto', to: 'map', both: true },
        { from: 'map', to: 'ent', both: true }
      ],
      caption: 'Entities never cross the boundary. Only the parcel does.' },

    { kind: 'compare', title: 'DTO, value object, entity',
      body: 'Three kinds of "just data-ish thing", often confused. They differ in purpose.',
      cols: ['DTO', 'Value object', 'Entity'],
      rows: [
        ['Purpose', 'Carry data over a boundary', 'Model a value in the domain', 'Model a thing with identity'],
        ['Behaviour', 'None: only fields', 'Yes: rules about itself', 'Yes: business rules'],
        ['Equality', 'Rarely matters', 'By all attributes', 'By id'],
        ['Lives in', 'The edges (API, messages)', 'The domain core', 'The domain core'],
        ['Shaped by', 'What the consumer needs', 'The business meaning', 'The business model']
      ] },

    { kind: 'concept', title: 'Why not just expose the entity?',
      body: `Four solid reasons, all of which bite eventually:

        1. **Security.** Fields you never meant to share go out too, now or after a future change.
        2. **Stability.** The entity belongs to *you*. If clients depend on its shape, you can never refactor it.
        3. **Shape.** Clients rarely want your tables' layout. They want one tidy screen's worth of data, perhaps from several entities combined.
        4. **Hidden work.** Serialising an entity may touch lazy-loaded data and fire a flurry of queries nobody planned.

        DTOs also work **inwards**. A *request* DTO is the validated shape of what a client may send, which brings us to the next pitfall.` },

    { kind: 'pitfall', title: 'Mass assignment, and mapping tedium',
      body: `**Going in**: the shortcut \`Object.assign(user, req.body)\` copies whatever the client sent onto the entity. If an attacker adds \`"isAdmin": true\` to the JSON, they have promoted themselves. This is **mass assignment**. Always read named fields from a request DTO.

        **Going out**: the honest cost of DTOs is *tedium*. You write a class and a mapper for each shape, and it feels like copying fields from A to B all day. People have strong opinions on it.

        Tools can generate the mapping, and for tiny apps it may be overkill. But the boundary is worth the typing wherever **security or independence** matters, such as a public API.` },

    { kind: 'tip', title: 'Rules of thumb',
      body: `- Design a DTO from the **consumer's** point of view: what does this screen or caller need?
        - Keep DTOs **dumb**: fields only, no business rules (those live on entities and value objects).
        - Use **separate** DTOs for input and output when they differ. A create request has no \`id\`, but the response does.
        - It is fine for many DTOs to be small and similar. Sharing one giant DTO between ten endpoints brings back the coupling you wanted to avoid.
        - Skip DTOs *inside* a tightly-coupled layer. Use them at real boundaries.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What is the main job of a DTO?',
      options: ['Carry data across a boundary in a shape made for the receiver', 'Hold the business rules about a customer or order', 'Replace the database with something faster', 'Store a copy of every entity for backup'],
      answer: 0,
      why: [null, 'That is an entity (or a domain object). DTOs deliberately have no rules.', 'A DTO is just data in transit. It does not store or replace anything.', 'Backups are unrelated.'],
      explain: 'A DTO is a plain, behaviour-free parcel of data, shaped for whoever receives it, so internal objects never have to leave the building.' },

    { type: 'tf', after: 4, statement: 'A DTO is deliberately just fields: the business rules for the thing it describes live elsewhere.', answer: true,
      explain: 'DTOs are dumb on purpose: just fields. Rules belong in entities and value objects. A DTO that grows behaviour has quietly become a second domain object.' },

    { type: 'spot', prompt: 'This update endpoint has a security hole. Tap the line that causes it.',
      code: { lang: 'js', src: `
        app.patch('/me', async (req, res) => {
          const user = await users.findById(req.userId);
          Object.assign(user, req.body);
          await users.save(user);
          res.json({ ok: true });
        });` },
      lines: [3],
      explain: '`Object.assign(user, req.body)` copies every field the client sends, so a request containing `"isAdmin": true` would promote them. Read only the named fields you allow (through a request DTO) instead.' },

    { type: 'ab', q: 'Which response is better for a public API?',
      a: { lang: 'js', label: 'Entity as-is', src: `
        res.json(user);
        // { id, name, email, passwordHash,
        //   isAdmin, internalNotes, ... }` },
      b: { lang: 'js', label: 'A shaped DTO', src: `
        res.json({ id: user.id,
                   name: user.name });
        // only what the client needs` },
      answer: 'b',
      explain: 'The DTO sends only chosen fields, so adding a sensitive column later cannot leak it, and internal refactors do not break clients. Serialising the entity exposes everything, forever.' },

    { type: 'bucket', prompt: 'Which one is it: a DTO, a value object or an entity?', buckets: ['DTO', 'Value object', 'Entity'],
      items: [['`OrderSummaryResponse` sent to the mobile app', 0], ['`Money` with an `add` method', 1], ['A `Customer` with an id and business rules', 2], ['`CreateUserRequest` parsed from JSON', 0], ['A `DateRange` that refuses end before start', 1], ['An `Account` tracked through its whole life', 2]],
      explain: 'DTOs only carry data at the edges. Value objects are rule-carrying values with no identity. Entities have identity and rules and live in the core.' },

    { type: 'multi', q: 'Which are good reasons to avoid sending your entities straight to clients?',
      options: ['Fields you did not intend to share may leak', 'Clients become tied to your internal structure, making refactoring hard', 'Serialising might trigger hidden lazy-loading queries', 'JSON cannot represent objects at all', 'Entities are always too large to send'],
      answers: [0, 1, 2],
      explain: 'Leaks, coupling and surprise queries are the real hazards. JSON represents plain objects fine, and an entity is not automatically huge. The issue is control, not capacity.' },

    { type: 'match', prompt: 'Match each term to what it means.',
      pairs: [['DTO', 'Plain parcel of data crossing a boundary'], ['Mapping', 'Copying fields between entity and DTO'], ['Mass assignment', 'Copying a whole request body onto an entity'], ['Request DTO', 'The validated shape of what a client may send'], ['Response DTO', 'The shape of data sent back to the caller']] },

    { type: 'scenario', title: 'The renamed field', intro: 'Your mobile app and your website both read `GET /users/7`, which returns the `User` entity directly. Today you want to rename `surname` to `familyName` in the database. The team lead is nervous.',
      meters: { 'client stability': 60, 'refactor freedom': 40 },
      steps: [
        { text: 'The rename would change the JSON that ships to the apps. What do you propose?',
          choices: [
            { label: 'Return a `UserDto` with a stable `surname` field, mapped from the entity', score: 2, effects: { 'client stability': 20, 'refactor freedom': 30 }, feedback: 'The boundary absorbs the change. Rename the column freely, update one mapper, and old apps carry on working.' },
            { label: 'Rename it and tell everyone to update their apps', score: 0, effects: { 'client stability': -40, 'refactor freedom': 10 }, feedback: 'Old app versions in people’s pockets will break, and you cannot force anyone to update.' },
            { label: 'Never rename anything again', score: 0, effects: { 'refactor freedom': -30 }, feedback: 'That is exactly the cost of exposing entities: the internals are frozen forever.' }
          ] },
        { text: 'A teammate objects: "A DTO per endpoint means so many copy-paste mappers." What is a balanced reply?',
          choices: [
            { label: 'It is tedious, but worth it at the public boundary. Use mapping helpers or generators to cut the typing', score: 2, effects: { 'client stability': 10, 'refactor freedom': 10 }, feedback: 'Honest about the cost, and aims it at the place the benefit is greatest.' },
            { label: 'Then let us use DTOs everywhere, between every pair of classes', score: 1, effects: { 'refactor freedom': -5 }, feedback: 'Boundaries are where DTOs pay off. Between tightly-coupled classes in one layer they are mostly extra work.' },
            { label: 'Then let us drop DTOs and go back to returning entities', score: 0, effects: { 'client stability': -25 }, feedback: 'You would swap a typing chore for leaks and frozen internals.' }
          ] }
      ],
      outro: 'A DTO is a promise to the outside world that you can keep while changing everything inside.' },

    { type: 'explain', prompt: 'Why should an API return DTOs instead of its entities? Give two reasons.',
      model: 'A DTO is a plain, behaviour-free object shaped for the consumer. Returning DTOs avoids leaking fields you did not mean to expose (like password hashes), and keeps clients independent of your internal structure so you can refactor entities without breaking them. It can also avoid hidden lazy-loading queries and lets you combine data into the shape a screen needs.',
      keywords: ['plain', 'boundary', 'leak', 'security', 'stable', 'refactor', 'shape'] }
  ],

  flashcards: [
    { q: 'What is a DTO?', a: 'A data transfer object: a plain, behaviour-free object that carries data across a boundary in a shape suited to the receiver.' },
    { q: 'Why not expose entities directly in an API?', a: 'You may leak fields, tie clients to your internal structure, trigger hidden queries and lose the freedom to refactor.' },
    { q: 'What is mass assignment?', a: 'Copying an entire request body onto an entity, so a client can set fields they should not, such as `isAdmin`.' },
    { q: 'DTO versus value object?', a: 'A DTO only carries data at the edges and has no rules. A value object lives in the domain and carries rules about its value.' },
    { q: 'What is the honest downside of DTOs?', a: 'Mapping tedium: classes and mappers for each shape. It is worth it at real boundaries, less so inside one layer.' }
  ],

  glossary: [
    { term: 'DTO', def: 'Data transfer object: a plain object with only fields, used to move data across a boundary such as an API.', like: 'A recipe card, not the whole kitchen.', aka: ['data transfer object'] },
    { term: 'Boundary', def: 'A line between two parts of a system, such as server and client or one service and another, where data is handed over.', like: 'A customs desk where goods are packaged for the other side.' },
    { term: 'Mapping', def: 'Copying and reshaping data between two representations, such as entity to DTO.', like: 'Copying a recipe onto the card.' },
    { term: 'Mass assignment', def: 'A vulnerability where a whole request body is copied onto an object, letting a client set fields they should not.', like: 'Letting a customer fill in the staff section of the form.' }
  ],

  takeaways: [
    'A DTO is a **dumb parcel of data** for crossing a boundary.',
    'Do not expose entities: **leaks, coupling and surprise queries**.',
    'Read named fields from a request DTO. Never **mass-assign** a body.',
    'Mapping is tedious, so spend it at **real boundaries**, such as public APIs.'
  ],

  links: [
    { label: 'Martin Fowler: Data Transfer Object', url: 'https://martinfowler.com/eaaCatalog/dataTransferObject.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ep-use-cases', {
  eli5: 'A use case is one small class for one thing a user wants to get done, like "place an order". It does not know the rules itself. It just fetches the right objects, asks them to act, and saves the result.',

  cards: [
    { kind: 'concept', title: 'The fat controller',
      body: `Your website receives "place an order". Where does the code go?

        The lazy answer is the **controller**, the function that handles the web request. It reads the JSON, loads a customer, checks stock, takes payment, saves, sends an email and builds the response. It works. But it is welded to HTTP, so you cannot reuse it from a nightly job or a command-line tool, and you cannot test it without faking a web server.

        A **use case** pulls out the *what the user wants to get done* part into its own class: \`PlaceOrder\`, \`CancelOrder\`, \`RefundPayment\`. The controller shrinks to "translate the request, call the use case, translate the answer".` },

    { kind: 'metaphor', title: 'The conductor, not the violinist',
      body: `A conductor does not play any instrument. They decide **who plays when**: strings in now, brass after the second bar, pause here. The music itself is made by the musicians.

        A use case is the conductor. It does not contain business rules (those are in the \`Order\`, \`Customer\`, \`Money\` objects from earlier lessons). Its job is **orchestration**: load these objects, ask them to do their parts, save the results, and pass back an answer.

        If the conductor starts playing the violin, the performance gets confusing. Likewise a use case full of pricing rules has stolen the domain model's job.` },

    { kind: 'code', title: 'A use case in code',
      body: 'One class, one public method, one thing the user wants. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class PlaceOrder {
          constructor(customers, orders, payments) {
            this.customers = customers; this.orders = orders;
            this.payments = payments;
          }

          async execute({ customerId, items }) {
            const customer = await this.customers.findById(customerId);
            const order = customer.startOrder();
            for (const i of items) order.addLine(i.productId, i.qty);
            order.place();            // the domain checks the rules
            await this.payments.charge(customer, order.total());
            await this.orders.add(order);
            return { orderId: order.id };
          }
        }`,
        notes: {
          2: 'Its collaborators are **passed in**. In tests these are in-memory fakes, and in production the real thing.',
          8: 'It loads objects through **repositories**, not SQL.',
          11: 'The business rules are on the objects. The use case only calls \`place()\` and lets the domain approve or refuse.',
          14: 'It returns a small plain result (a DTO). No HTTP, no response objects.'
        } } },

    { kind: 'steps', title: 'The usual rhythm of a use case',
      body: 'Almost all of them do the same five things.',
      steps: [
        { title: 'Receive a request', body: 'Plain input data: ids and values, not a web request object.' },
        { title: 'Load what is needed', body: 'Fetch the entities through repositories.' },
        { title: 'Ask the domain to act', body: 'Call methods like `order.place()`. The domain enforces the rules.' },
        { title: 'Save and side-effect', body: 'Store the changes, take the payment, publish an event, send the email.' },
        { title: 'Return a result', body: 'A simple output the caller can turn into JSON, HTML or a CLI message.' }
      ] },

    { kind: 'layers', title: 'Where it sits',
      body: 'Use cases form their own layer between the outside world and the domain.',
      layers: [
        { label: 'Delivery', note: 'Web controllers, CLI, queue consumers. Translate in and out.', icon: '🌐' },
        { label: 'Use cases', note: 'One class per user goal. Orchestrate, no business rules.', icon: '🎼', tone: 'accent' },
        { label: 'Domain', note: 'Entities, value objects, rules.', icon: '🧠' },
        { label: 'Infrastructure', note: 'Repository implementations, payment gateway, email sender.', icon: '🔧' }
      ] },

    { kind: 'concept', title: 'Many names, one idea',
      body: `You will see this idea under several names.

        - **Use case** or **interactor**: the term from Clean Architecture. Usually one class per goal.
        - **Application service**: the term in domain-driven design. Often a class with *several* related methods (\`OrderService.place\`, \`.cancel\`).
        - **Transaction script**: the old name from lesson one, when it holds the rules.

        The shared thread is that this layer **coordinates**. Whether you prefer one class per use case or a service with a few methods is a style argument with sensible people on both sides. One class per goal is more explicit, a service class is more compact. Pick one and be consistent.` },

    { kind: 'diagram', title: 'Input and output boundaries',
      body: 'In Clean Architecture the use case sits between two interfaces. Dependencies point **inwards**, so the use case knows nothing about the web or the database.',
      nodes: [
        { id: 'ctrl', label: 'Controller', icon: '🌐', x: 0, y: 0 },
        { id: 'in', label: 'Input boundary', x: 1, y: 0, tone: 'muted' },
        { id: 'uc', label: 'PlaceOrder', x: 1, y: 1, tone: 'accent' },
        { id: 'out', label: 'Output boundary', x: 2, y: 1, tone: 'muted' },
        { id: 'pres', label: 'Presenter', x: 2, y: 2 },
        { id: 'repo', label: 'OrderRepository', x: 0, y: 2 }
      ],
      edges: [
        { from: 'ctrl', to: 'in', label: 'calls' }, { from: 'in', to: 'uc', dashed: true },
        { from: 'uc', to: 'out', label: 'reports to' }, { from: 'out', to: 'pres', dashed: true },
        { from: 'uc', to: 'repo', label: 'asks' }
      ],
      caption: 'The input boundary is the interface a use case offers. The output boundary is the interface it uses to report back, so the use case never touches HTTP or HTML.' },

    { kind: 'pitfall', title: 'Two ways use cases go wrong',
      body: `**1. Rules leak in.** The use case starts with \`if (order.total() > 100) discount...\`. Now the pricing rule is in the orchestrator again. You have rebuilt a transaction script, and the objects are anaemic. Ask: does this belong to an object?

        **2. The outside world leaks in.** The use case takes an Express \`req\` object or returns \`res.status(404)\`. It is now welded to the web, which was the original problem.

        A healthy use case is *boring*: load, call, save, return. If it is getting clever, something belongs elsewhere.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What is a use case in this sense?',
      options: ['One class per user goal, coordinating the steps', 'A document listing what a system must do for users', 'A test that checks one feature works', 'A database table for storing orders'],
      answer: 0,
      why: [null, 'In requirements work "use case" means that. Here it is a unit of code.', 'Tests verify; a use case implements.', 'Tables belong to infrastructure.'],
      explain: 'An application-layer use case is a class that performs one user goal by orchestrating objects and repositories, while the business rules stay in the domain.' },

    { type: 'tf', after: 2, statement: 'A use case should contain the pricing and discount rules, so everything for "place order" is in one class.', answer: false,
      explain: 'Rules belong on the domain objects. The use case orchestrates: load, call `order.place()`, save, return. Putting the rules in it recreates a transaction script and leaves the domain anaemic.' },

    { type: 'bucket', prompt: 'Where does each piece of work belong?', buckets: ['Controller', 'Use case', 'Domain object'],
      items: [['Read JSON from the HTTP request body', 0], ['Return status 404 for a missing page', 0], ['Load the customer and the order, then save the result', 1], ['Decide the order of: charge payment, save, send email', 1], ['Refuse to add a line to a closed order', 2], ['Work out the discount for a big basket', 2]],
      explain: 'Controllers translate the outside world. Use cases coordinate steps. Domain objects own the rules about themselves.' },

    { type: 'order', prompt: 'Put the typical steps of a use case in order.',
      items: ['Receive plain input data', 'Load entities through repositories', 'Ask the domain objects to act', 'Save the changes and trigger side effects', 'Return a simple result'],
      explain: 'You cannot ask objects to act before you have them, and you save only once they have approved the change. The result is returned last.' },

    { type: 'spot', prompt: 'This use case has let something leak in that does not belong. Tap the offending line.',
      code: { lang: 'js', src: `
        class CancelOrder {
          async execute(req, res) {
            const order = await this.orders.findById(req.params.id);
            order.cancel();
            await this.orders.save(order);
            res.status(204).send();
          }
        }` },
      lines: [2, 6],
      explain: 'The use case takes the web framework’s `req` and `res`, so it is welded to HTTP and cannot run from a job or a test. It should take a plain id and return a plain result, and the controller should translate to a status code.' },

    { type: 'ab', q: 'Which version of the controller is better?',
      a: { lang: 'js', label: 'Does everything', src: `
        app.post('/orders', async (req, res) => {
          // validate, load, check stock, charge,
          // save, email, build the response... 80 lines
        });` },
      b: { lang: 'js', label: 'Delegates', src: `
        app.post('/orders', async (req, res) => {
          const result = await placeOrder.execute(req.body);
          res.status(201).json(result);
        });` },
      answer: 'b',
      explain: 'The thin controller only translates web to plain data and back. The real work lives inside a use case that can be reused from a job or a CLI and tested without a web server.' },

    { type: 'cloze', text: 'A use case should {{orchestrate}} the work, leaving the business {{rules}} to the {{domain}} objects; its collaborators are passed in so tests can use in-memory {{fakes}}.',
      distractors: ['render', 'cache', 'routes'],
      explain: 'Orchestrating (not deciding) is the use case’s job. The rules live in the domain, and passing collaborators in is what makes fakes possible in tests.' },

    { type: 'scenario', title: 'One feature, three doors', intro: 'Your shop’s "place order" logic is inside an Express controller. Now the business wants orders to arrive in two more ways: from a phone-app API and from a nightly CSV import of bulk orders.',
      meters: { 'duplication': 60, 'testability': 30 },
      steps: [
        { text: 'The CSV job cannot easily call the controller because it needs `req` and `res`. What do you do?',
          choices: [
            { label: 'Pull the logic into a `PlaceOrder` use case that takes plain input; let all three entry points call it', score: 2, effects: { duplication: -40, testability: 40 }, feedback: 'One implementation, three thin front doors. A fix to the rules now fixes all three at once.' },
            { label: 'Copy the controller’s code into the CSV job', score: 0, effects: { duplication: 30, testability: -10 }, feedback: 'Now there are two copies, which will drift apart: the exact trouble from lesson one.' },
            { label: 'Make the CSV job fake HTTP requests to the controller', score: 0, effects: { duplication: 5, testability: -15 }, feedback: 'It works, but you have built a ladder to climb into your own house. The logic should not need a web server to run.' }
          ] },
        { text: 'While extracting it, you find an `if (total > 100)` discount rule inside the controller. Where does it go?',
          choices: [
            { label: 'Onto the `Order` object, which the use case calls', score: 2, effects: { duplication: -10, testability: 20 }, feedback: 'The rule is about an order, so the order owns it. The use case stays a boring coordinator.' },
            { label: 'Into the use case, because that is where the controller code went', score: 1, effects: { testability: 5 }, feedback: 'Better than the controller, but the rule is still outside the domain, so other use cases that price orders will have to copy it.' },
            { label: 'Leave it in the controller and call it from the others', score: 0, effects: { duplication: 10, testability: -10 }, feedback: 'Calling controller code from a use case points the dependency the wrong way.' }
          ] }
      ],
      outro: 'Thin controllers, boring use cases, smart domain objects.' },

    { type: 'explain', prompt: 'Describe what a use case does and does not do, and why it should not take an HTTP request object.',
      model: 'A use case is one class for one thing the user wants to achieve. It orchestrates: loads objects through repositories, asks the domain to act, saves, and returns a plain result. It does not hold business rules (those belong on the domain objects) and it should not know about HTTP, so it can be reused from jobs and tested without a web server.',
      keywords: ['orchestrate', 'repository', 'domain', 'rules', 'HTTP', 'reuse', 'test'] }
  ],

  flashcards: [
    { q: 'What is a use case (interactor)?', a: 'One class per thing the user wants to get done. It orchestrates repositories and domain objects but holds no business rules itself.' },
    { q: 'What does a controller do compared with a use case?', a: 'The controller translates the outside world (HTTP) to plain data and back. The use case performs the goal.' },
    { q: 'What is an application service?', a: 'The domain-driven design name for the coordinating layer, often a class with several related methods. The same idea as a use case.' },
    { q: 'What are the input and output boundaries?', a: 'Interfaces on either side of a use case: one it offers to callers, one it uses to report results, so it never touches HTTP or the UI.' },
    { q: 'Two ways a use case goes wrong?', a: 'Business rules leak in (anaemic domain), or web details leak in (it takes `req` and `res`).' }
  ],

  glossary: [
    { term: 'Use case', def: 'A class that performs one user goal by coordinating repositories and domain objects.', like: 'A conductor who cues the musicians but plays nothing.', aka: ['interactor'] },
    { term: 'Application service', def: 'The coordinating layer of an app that runs use cases between the outside world and the domain.', like: 'The stage manager of the production.' },
    { term: 'Orchestration', def: 'Calling the right steps in the right order, without deciding the rules of each step.', like: 'A conductor’s cues.' },
    { term: 'Controller', def: 'The code that receives a web request, turns it into plain input and calls the right use case.', like: 'The receptionist who passes your request to the right desk.' }
  ],

  takeaways: [
    'A use case = **one class per user goal**, no HTTP inside.',
    'It **orchestrates**: load, call the domain, save, return.',
    '**Business rules stay in the domain objects.**',
    'The same use case can serve a web page, a CLI and a nightly job.'
  ],

  links: [
    { label: 'Robert C. Martin: The Clean Architecture', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ep-commands-queries', {
  eli5: 'Instead of calling a function with a long list of loose values, you write the request on a ticket (a command if it changes something, a query if it only asks) and hand the ticket to a handler that does the work.',

  cards: [
    { kind: 'concept', title: 'Requests as objects',
      body: `Look at this call: \`placeOrder(customerId, items, couponCode, giftWrap, deliverBy, note, ...)\`. Seven loose arguments, easy to mix up, and impossible to add a new one without touching every caller.

        And suppose the boss asks: *"log every order attempt, check the user is allowed, and validate the input, for every action in the app."* Where would that code go? Into every function, copied each time.

        The fix is to turn the **request itself into an object**: a \`PlaceOrderCommand\` holding all those values. Now the request is a thing you can pass around, validate, log, queue and route, before it ever reaches the code that does the work.` },

    { kind: 'metaphor', title: 'The order slip in a restaurant',
      body: `A waiter does not shout your order down the kitchen from memory. They write an **order slip**: table 4, two lasagnes, one without cheese.

        That slip can be checked ("is that on the menu?"), stamped, logged, held while the kitchen is busy, and routed to the right chef. The chef reads the slip and cooks. The waiter and chef never need to talk.

        A **command** is an order slip: *do this*. And there is a second kind of ticket, the **query**, which is like asking the waiter *"what is today's soup?"*. It changes nothing and just returns an answer.

        Where it stops: a real slip can be cancelled. In software you must design that on purpose.` },

    { kind: 'code', title: 'A command and a query',
      body: 'Both are plain objects that carry the request. The difference is in what they mean.',
      code: { lang: 'js', src: `
        // A command: "please do this". Named like an instruction.
        class PlaceOrderCommand {
          constructor(customerId, items, couponCode) {
            this.customerId = customerId;
            this.items = items;
            this.couponCode = couponCode;
          }
        }

        // A query: "tell me this". Named like a question.
        class GetOrderSummaryQuery {
          constructor(orderId) { this.orderId = orderId; }
        }`,
        notes: {
          2: 'Commands are **imperative**: \`PlaceOrder\`, \`CancelBooking\`. They ask for a **change**, and may be refused.',
          11: 'Queries read: \`GetOrderSummary\`, \`FindOverdueInvoices\`. They change **nothing**, so they are safe to repeat.'
        } } },

    { kind: 'compare', title: 'Commands versus queries',
      body: 'The split is an old idea: a method should either *do* something or *answer* something, but not both.',
      cols: ['Command', 'Query'],
      rows: [
        ['Purpose', 'Change state', 'Read state'],
        ['Name sounds like', 'An instruction: `CancelOrder`', 'A question: `GetOrderSummary`'],
        ['Changes data?', 'Yes', 'Never'],
        ['Returns', 'Little: success, or an id', 'The data requested'],
        ['Safe to repeat?', 'Not necessarily', 'Yes, always'],
        ['Might be refused?', 'Yes: rules can say no', 'Only for permission reasons']
      ] },

    { kind: 'code', title: 'Handlers and a bus',
      body: 'Each message has exactly one **handler**. A small **bus** looks up the right one and delivers.',
      code: { lang: 'js', src: `
        class PlaceOrderHandler {
          constructor(orders) { this.orders = orders; }
          async handle(cmd) {
            // load, call the domain, save
          }
        }

        class Bus {
          constructor() { this.handlers = new Map(); }
          register(type, handler) {
            this.handlers.set(type, handler);
          }
          send(message) {
            return this.handlers.get(message.constructor).handle(message);
          }
        }

        bus.register(PlaceOrderCommand, new PlaceOrderHandler(orders));
        await bus.send(new PlaceOrderCommand('c-9', items, null));`,
        notes: {
          3: 'The handler is basically **a use case**: it receives the message and does the work.',
          13: 'The bus finds the handler **by the message’s type**. The sender never knows which class does the job.',
          19: 'The caller creates a ticket and sends it. That is the whole API.'
        } } },

    { kind: 'sequence', title: 'A command’s journey',
      body: 'Because everything goes through one door, one place can do the boring checks for everything.',
      actors: ['Controller', 'Bus', 'Handler', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'PlaceOrderCommand', note: 'The controller builds the ticket and sends it. It does not call the handler directly.' },
        { at: 1, label: 'validate', note: 'Is the input sensible? Reject bad tickets before any work is done.' },
        { at: 1, label: 'authorise', note: 'Is this user allowed to place orders for this customer?' },
        { at: 1, label: 'log', note: 'Record who asked for what, and when.' },
        { from: 1, to: 2, label: 'handle(cmd)', note: 'Only a valid, permitted, logged command gets this far.' },
        { from: 2, to: 3, label: 'save order', note: 'The handler does the real work, as a use case would.' }
      ] },

    { kind: 'code', title: 'Hooks for every request',
      body: 'Common concerns can be written **once** as steps in the bus, instead of copied into each handler.',
      code: { lang: 'js', src: `
        const pipeline = [validate, authorise, logAudit];

        async function send(message) {
          for (const step of pipeline) await step(message);
          return handlerFor(message).handle(message);
        }`,
        notes: {
          1: 'A list of **cross-cutting steps**. Add retries or a database transaction by adding one more line.',
          4: 'Each step may throw to stop the message. Add a new command tomorrow and it is validated, authorised and logged **for free**.'
        } } },

    { kind: 'concept', title: 'The bridge to CQRS',
      body: `If this reminds you of the Command pattern from the design patterns modules, it should: a command object is that same idea, a request wrapped as an object.

        And separating commands from queries is the doorstep of **CQRS** (command query responsibility segregation), which you met in the architecture module. What you have built here is its small, code-level form: *two different kinds of message, handled differently*.

        CQRS then goes **further**: it uses separate models, and sometimes separate databases, for writing and reading. You can adopt commands and queries without that. Many teams do exactly that, and add the heavier machinery only if reads and writes diverge enough to need it.` },

    { kind: 'pitfall', title: 'When it is too much ceremony',
      body: `A command, a handler, a registration, a bus and a pipeline, just to rename a customer? For a tiny CRUD app that is a lot of ceremony.

        Other traps:

        - **Magic.** With a bus, "who handles this?" is no longer one click away. Good naming and a registry you can search help.
        - **Commands that return everything.** Strictly a command returns little (success or a new id). Handing back full data blurs the line with queries, though many teams relax this a little.
        - **Fat handlers.** A handler is still a use case. Rules belong on the domain objects.

        Use commands and queries where you need **hooks, auditing or a clean routing story**, not by default.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the difference between a command and a query?',
      options: ['A command asks for a change; a query only reads and changes nothing', 'A command is synchronous; a query is always asynchronous', 'A command goes to the database; a query goes to the cache', 'A command has parameters; a query has none'],
      answer: 0,
      why: [null, 'Both can be sync or async. Timing is not the distinction.', 'Where the data is stored is a separate decision.', 'Queries often have parameters, such as an order id.'],
      explain: 'Commands change state and may be refused. Queries read state and never change it, so they are safe to repeat. That purity is the whole point of the split.' },

    { type: 'tf', after: 3, statement: 'A query is safe to run twice, because it never changes any data.', answer: true,
      explain: 'Queries only read, so repeating them is harmless. A command, by contrast, might charge a card or send an email each time it runs.' },

    { type: 'bucket', prompt: 'Command or query?', buckets: ['Command', 'Query'],
      items: [['`CancelOrder`', 0], ['`GetOrderSummary`', 1], ['`RegisterUser`', 0], ['`FindOverdueInvoices`', 1], ['`ChangeEmailAddress`', 0], ['`ListProductsInCategory`', 1]],
      explain: 'Commands are instructions that change something, so they sound like verbs of action. Queries are questions: they get, find or list.' },

    { type: 'match', prompt: 'Match each term to its job.',
      pairs: [['Command', 'A request object asking for a change'], ['Query', 'A request object asking to read data'], ['Handler', 'The one class that does the work for a message'], ['Bus', 'Routes each message to its handler'], ['Pipeline step', 'A shared hook such as validation or logging']] },

    { type: 'ab', q: 'Which call is easier to extend, validate and log?',
      a: { lang: 'js', label: 'Loose arguments', src: `
        placeOrder(customerId, items, coupon,
                   giftWrap, deliverBy, note);` },
      b: { lang: 'js', label: 'A command object', src: `
        bus.send(new PlaceOrderCommand({
          customerId, items, coupon,
          giftWrap, deliverBy, note
        }));` },
      answer: 'b',
      explain: 'A command is one value that can be inspected, validated and logged by shared code before it reaches the handler. Adding a field later does not change every call site, and argument order cannot be mixed up.' },

    { type: 'spot', prompt: 'This "query" handler breaks the rule of queries. Tap the line that does it.',
      code: { lang: 'js', src: `
        class GetOrderSummaryHandler {
          async handle(query) {
            const order = await this.orders.findById(query.orderId);
            order.markAsViewed();
            await this.orders.save(order);
            return { id: order.id, total: order.total() };
          }
        }` },
      lines: [4, 5],
      explain: 'A query must not change anything. Marking the order as viewed and saving it makes this a command in disguise, so repeating the "read" now has side effects. Split the change into its own command if it is really needed.' },

    { type: 'order', prompt: 'Put the journey of a command through a bus in order.',
      items: ['The controller creates a command and sends it to the bus', 'The bus validates the command', 'The bus checks the user is authorised', 'The handler for that command is called', 'The handler saves its changes'],
      explain: 'Cheap checks come first so a bad or forbidden command never reaches the handler. Only then does the real work run and save.' },

    { type: 'scenario', title: 'The audit request', intro: 'Your finance app has forty actions: refund, transfer, close account and more. The auditors now require **every** state-changing action to be logged with who did it, and every one to check permissions.',
      meters: { 'audit confidence': 20, 'effort': 80 },
      steps: [
        { text: 'The code calls forty different functions directly. What is the best structure to meet the requirement?',
          choices: [
            { label: 'Make each action a command, send them through a bus with logging and authorisation steps', score: 2, effects: { 'audit confidence': 50, effort: -15 }, feedback: 'One door means the checks are written once and cannot be forgotten. New actions inherit them automatically.' },
            { label: 'Paste logging and permission code into all forty functions', score: 0, effects: { 'audit confidence': 10, effort: -40 }, feedback: 'Forty copies of the same code, and number forty-one will forget. Auditors will find the gap.' },
            { label: 'Write a policy document telling developers to remember', score: 0, effects: { 'audit confidence': -10 }, feedback: 'Rules that rely on memory are broken sooner or later.' }
          ] },
        { text: 'Reports on balances are also hit by the logging step, flooding the audit log with harmless reads. What now?',
          choices: [
            { label: 'Treat reads as queries, with their own lighter pipeline that skips the audit log', score: 2, effects: { 'audit confidence': 20, effort: -5 }, feedback: 'Commands and queries differ in what they need. Changes get the full audit; reads stay cheap.' },
            { label: 'Turn the audit log off to reduce noise', score: 0, effects: { 'audit confidence': -40 }, feedback: 'You would solve the noise by removing the thing the auditors asked for.' },
            { label: 'Convert every query into a command so they are all the same', score: 0, effects: { 'audit confidence': -5, effort: -10 }, feedback: 'You lose the useful promise that a query changes nothing, and add pointless audit entries.' }
          ] }
      ],
      outro: 'Requests as objects give you **one place** to hang the things every request needs.' },

    { type: 'explain', prompt: 'Explain commands, queries and handlers, and why routing requests through a bus is useful.',
      model: 'A command is a request object asking for a change; a query is a request object asking to read data and change nothing. Each message has one handler that does the work. Sending them through a bus gives one place to add validation, authorisation, logging and transactions for every request, and it is a small step towards CQRS.',
      keywords: ['command', 'query', 'handler', 'bus', 'validation', 'authorisation', 'CQRS'] }
  ],

  flashcards: [
    { q: 'What is a command?', a: 'A request object asking the system to change something (such as `CancelOrder`). It may be refused.' },
    { q: 'What is a query?', a: 'A request object asking to read data, such as `GetOrderSummary`. It must not change anything, so it is safe to repeat.' },
    { q: 'What do handlers and a bus do?', a: 'A handler does the work for one kind of message. The bus routes each message to its handler and can run shared steps such as validation first.' },
    { q: 'Why use pipeline steps with commands?', a: 'To write validation, authorisation, logging and transactions once, so every command gets them.' },
    { q: 'How do commands and queries relate to CQRS?', a: 'Separating them is the code-level first step. CQRS goes further with separate models, and sometimes separate stores, for writing and reading.' }
  ],

  glossary: [
    { term: 'Command', def: 'An object that represents a request to change something, named as an instruction.', like: 'A restaurant order slip.' },
    { term: 'Query', def: 'An object that represents a request to read data. It never changes anything.', like: 'Asking the waiter what the soup is today.' },
    { term: 'Handler', def: 'The class that receives one kind of command or query and does the work for it.', like: 'The chef who reads the slip and cooks.' },
    { term: 'Message bus', def: 'A router that delivers each command or query to its handler, often running shared steps first.', like: 'The pass between waiters and the kitchen.', aka: ['command bus', 'mediator'] }
  ],

  takeaways: [
    'Turn requests into **objects**: commands change, queries read.',
    'Each message has one **handler**; a **bus** routes it.',
    'A pipeline gives one place for **validation, authorisation and logging**.',
    'It is the code-level doorstep to **CQRS**, but skip the ceremony for tiny apps.'
  ],

  links: [
    { label: 'Martin Fowler: CQRS', url: 'https://martinfowler.com/bliki/CQRS.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('enterprise-patterns', {
  title: 'The Layered Leviathan',
  intro: 'A many-tiered beast guards the way out of the enterprise tower, and each tier tests one of Fowler’s patterns. Choose where logic lives, spot the leaks and keep your objects honest.',
  questions: [
    { type: 'mcq', q: 'An app has fifteen simple forms that save and show data, and almost no business rules. Which way of organising logic fits best?',
      options: ['Transaction scripts, because the rules are few and shallow', 'A full domain model, so it is ready for anything', 'A table module for each field', 'No structure at all: put everything in the template'],
      answer: 0,
      why: [null, 'A rich model here is ceremony that earns nothing yet.', 'Table module is one class per table, not per field, and it is not a fit for this either.', 'Even small apps need somewhere sensible for their few rules.'],
      explain: 'With shallow, mostly CRUD rules, one procedure per action is simplest. Move to a richer pattern when rules multiply and get copied.' },

    { type: 'spot', prompt: 'This code claims to be a domain model. Tap the line that gives away that it is anaemic.',
      code: { lang: 'js', src: `
        class Booking {
          constructor() { this.nights = 0; this.status = 'open'; }
        }

        class BookingService {
          cancel(booking) { booking.status = 'cancelled'; }
        }` },
      lines: [6],
      explain: 'The `Booking` is only fields, and the rules about cancelling sit in a service that pokes at it from outside. A real model gives `Booking` its own `cancel()` method that checks it is allowed.' },

    { type: 'bucket', prompt: 'Entity or value object?', buckets: ['Entity', 'Value object'],
      items: [['A customer account', 0], ['£25.00', 1], ['A booking tracked from request to completion', 0], ['A postcode', 1], ['A start and end date together', 1], ['A user with a login', 0]],
      explain: 'If you track it through time by identity, it is an entity. If any equal one will do, it is a value object.' },

    { type: 'tf', statement: 'Two separate `Money` objects holding 500 pence in GBP are equal under JavaScript’s `===`.', answer: false,
      explain: '`===` on objects compares identity in memory, so two separate objects are never `===`. Value objects need an `equals` method comparing all attributes.' },

    { type: 'ab', q: 'Which repository method name is better?',
      a: { lang: 'js', label: 'Database-flavoured', src: `
        orders.selectWhere("status='unpaid'")` },
      b: { lang: 'js', label: 'Business-flavoured', src: `
        orders.findUnpaid()` },
      answer: 'b',
      explain: 'A repository speaks the language of the business and keeps the query inside. Letting callers write conditions leaks the storage and copies the definition of "unpaid" around.' },

    { type: 'mcq', q: 'An `Order` contains many `OrderLine` objects that must never be edited except through the order. How many repositories do you create for these?',
      options: ['One, for the Order, which loads and saves its lines too', 'Two: one for Order, one for OrderLine', 'One per column in each table', 'None: the ORM replaces repositories entirely'],
      answer: 0,
      why: [null, 'A separate lines repository would let outsiders skip the order’s rules.', 'Columns are far too fine-grained.', 'An ORM is a tool used behind a repository, not a replacement for the idea.'],
      explain: 'Repositories are per aggregate. The order is the front door, and its lines come and go with it, so its rules stay in charge.' },

    { type: 'match', prompt: 'Match each pattern to its job.',
      pairs: [['Data mapper', 'Translates between plain objects and rows'], ['Unit of work', 'Saves a business action’s changes in one transaction'], ['Identity map', 'One object per row per session'], ['Lazy loading', 'Fetches related data only when first touched'], ['DTO', 'Plain parcel of data crossing a boundary']] },

    { type: 'estimate', q: 'A page lists 500 comments written by 40 different users. With an identity map in the session, how many `User` objects exist after the page has loaded?',
      answer: 40, unit: 'objects', tolerance: 1.3, min: 1, max: 1000,
      explain: 'One object per distinct row. Forty distinct users means forty `User` objects, shared by all 500 comments.' },

    { type: 'multi', q: 'Why is returning your entity straight from an API endpoint risky?',
      options: ['Fields like password hashes may leak', 'Clients become tied to your internal structure', 'Serialising may trigger lazy-loaded queries', 'JSON cannot hold objects with methods in them at all', 'It makes the response arrive more slowly over HTTPS'],
      answers: [0, 1, 2],
      explain: 'Leaks, coupling and hidden queries are the real problems. JSON handles plain objects fine, and HTTPS adds no per-field penalty. The issue is control, not format.' },

    { type: 'order', prompt: 'Put a use case’s typical work in order.',
      items: ['Take plain input from the controller', 'Load entities via repositories', 'Ask domain objects to do the work', 'Save the result and trigger side effects', 'Return a simple output'],
      explain: 'Orchestration runs from input to output: get the objects, let them decide, then save and report.' },

    { type: 'short', q: 'In the Clean Architecture vocabulary, a class that performs one user goal is called a use case or an... what? (one word)', accept: ['interactor', 'interactors', 'use case interactor'], hint: 'It interacts with repositories and the domain.',
      explain: 'Interactor is Clean Architecture’s word for a use case. Domain-driven design calls the same layer application services.' },

    { type: 'cloze', text: 'A {{command}} changes state and may be refused, a {{query}} only reads, and a {{handler}} does the work for one message.',
      distractors: ['entity', 'mapper', 'cache'],
      explain: 'Commands and queries are the two kinds of request object, and each has exactly one handler.' }
  ]
});

KS.sheet('enterprise-patterns', {
  title: 'Enterprise patterns: cheat sheet',
  sections: [
    { title: 'Three ways to hold the logic',
      md: `| Pattern | Shape | Use when |
        |---|---|---|
        | Transaction script | One procedure per user action | Few, shallow rules; small apps |
        | Domain model | Objects with data **and** rules | Many tangled, changing rules |
        | Table module | One class per table, for all rows | Older, record-set-centred code |

        **Anaemic model:** classes with only getters and setters and rules in services. Cost without benefit.
        **Rule of thumb:** start with scripts, move rules onto objects when you copy them.` },

    { title: 'Entities, values and DTOs',
      md: `| | Entity | Value object | DTO |
        |---|---|---|---|
        | Defined by | Identity | All attributes | Consumer's need |
        | Equal when | Same id | All attributes match | n/a |
        | Behaviour | Yes | Yes | **None** |
        | Lives | Domain core | Domain core | The edges |

        Make values **immutable**. Store money as whole pence plus a currency. Avoid **primitive obsession**. Never **mass-assign** a request body onto an entity.` },

    { title: 'Repositories',
      md: `A repository looks like an **in-memory collection** of aggregates: \`add\`, \`findById\`, \`findOverdueFor(customer)\`.

        - **One per aggregate**, not per table
        - Methods named in **business language**
        - SQL stays inside; no query builders leak out
        - An **in-memory fake** makes rule tests fast
        - **DAO** is the table-centric cousin returning records` },

    { title: 'Mappers, unit of work, identity map',
      md: `| Idea | One-liner |
        |---|---|
        | Active record | The object saves itself (\`user.save()\`) |
        | Data mapper | A separate translator; the object stays plain |
        | Unit of work | Track changes, write them in **one transaction** |
        | Identity map | **One row, one object**, per session |
        | Lazy loading | Fetch related data on first touch; beware **N+1** |

        An ORM bundles all of these. Keep sessions **short**: one per request.` },

    { title: 'Use cases',
      md: `**One class per user goal** (\`PlaceOrder\`). Also called an *interactor* or *application service*.

        1. Receive plain input
        2. Load via repositories
        3. Ask the domain to act
        4. Save, then side effects
        5. Return a simple result

        Controllers translate HTTP. Use cases **orchestrate**. Domain objects own the **rules**. A use case that takes \`req\`/\`res\`, or holds pricing rules, has leaked.` },

    { title: 'Commands and queries',
      md: `| | Command | Query |
        |---|---|---|
        | Does | Changes state | Reads state |
        | Named | Imperative: \`CancelOrder\` | Question: \`GetOrderSummary\` |
        | Repeat safe? | Not necessarily | Always |

        A **handler** does the work for one message; a **bus** routes it and runs shared steps (validate, authorise, log). Separating the two is the doorstep of **CQRS**. Skip it for tiny CRUD apps.` }
  ]
});

