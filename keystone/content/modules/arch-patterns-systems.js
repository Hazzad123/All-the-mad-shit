// Module: arch-patterns-systems — Architectural Patterns I: Shapes of Systems

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-mvc', {
  eli5: 'MVC, MVP and MVVM are three ways to split an app into the data, the screen and the glue between them, so you can change one without rewriting the others.',

  cards: [
    { kind: 'concept', title: 'The app where everything lives in one file',
      body: `Picture a to-do app written the quick way. One file reads the list from storage, builds the HTML, listens for clicks, decides what a click means and updates the screen. It works. Then someone asks for a dark theme, and you discover the colours are tangled into the data-saving code.

        Almost every app has three jobs hiding in it:

        - **Data and rules**: what a to-do *is* and what you may do with it
        - **Display**: what the user sees
        - **Control**: reacting to what the user does

        These patterns all say the same thing: **keep those three jobs apart.** They only disagree about how the pieces talk to each other.` },

    { kind: 'metaphor', title: 'A restaurant, front to back',
      body: `A restaurant also splits three jobs:

        - The **kitchen** holds the food and the recipes (the *model*)
        - The **dining room** is what the guest sees: plates, menus, candles (the *view*)
        - The **waiter** takes orders in and carries dishes out (the *controller*, or its cousins)

        You can redecorate the dining room without touching a recipe. You can change a recipe without reprinting the tables. The three patterns in this lesson are three different house rules for how the waiter works: does the guest ever shout into the kitchen? Does the waiter carry every plate by hand?

        The metaphor stops at one point: in software, the "guest" is often another bit of code, and the arrows can go in both directions.` },

    { kind: 'sequence', title: 'MVC: a click travels round the triangle',
      body: '**Model–View–Controller** (MVC) is the oldest of the three, from the 1970s. Step through one click.',
      actors: ['User', 'Controller', 'Model', 'View'],
      steps: [
        { from: 0, to: 1, label: 'clicks “Done” on a task', note: 'The **controller** receives input. It is the waiter taking the order.' },
        { from: 1, to: 2, label: 'markDone(task 7)', note: 'The controller does not decide what “done” means. It tells the **model**, which owns the data and the rules.' },
        { at: 2, label: 'updates its own data', note: 'The model changes and enforces its rules, for example “a finished task cannot be finished again”.' },
        { from: 2, to: 3, label: 'I changed', dashed: true, note: 'In the classic version the model announces its change (the Observer pattern you met earlier) and the **view** is listening.' },
        { from: 3, to: 2, label: 'read the new state', note: 'The view reads what it needs from the model and redraws itself.' },
        { note: 'On the web (Rails, Spring MVC, Laravel) the shape is slightly different: the controller picks a view and hands it the data, because a server cannot push a redraw into a page that has been sent already.' }
      ] },

    { kind: 'concept', title: 'MVP: the view becomes a puppet',
      body: `**Model–View–Presenter** (MVP) changes one rule: **the view never talks to the model.** Everything goes through the **presenter**.

        The view is made as dumb as possible. It shows what it is told and reports clicks ("the user tapped Done") without deciding anything. The presenter takes the click, asks the model, then tells the view exactly what to show: *set the title, disable the button, show a spinner.*

        The payoff is **testing**. The presenter holds all the decisions but has no screen attached, so you can test it by plugging in a fake view that just records what it was told. No emulator needed.

        This style grew popular in desktop apps and in older Android apps.` },

    { kind: 'compare', title: 'Who talks to whom',
      body: 'The difference is precisely in the arrows. Keep this table handy.',
      cols: ['MVC', 'MVP', 'MVVM'],
      rows: [
        ['Middle piece', 'Controller', 'Presenter', 'ViewModel'],
        ['View talks to…', 'Controller; also reads the model', 'Only the presenter', 'Only the view-model, by binding'],
        ['Who updates the screen?', 'The view, after the model changes (or the controller picks a new view)', 'The presenter, calling methods on the view', 'A binding engine, automatically'],
        ['Middle piece knows the view?', 'Loosely', 'Yes, through an interface', 'No, and that is the point'],
        ['Typical homes', 'Server web frameworks', 'Desktop and older mobile apps', 'WPF, Vue, Angular, SwiftUI, Android Jetpack']
      ] },

    { kind: 'concept', title: 'MVVM: let the screen follow the data',
      body: `**Model–View–ViewModel** (MVVM) goes one step further and removes the presenter's chore of pushing updates.

        The **view-model** holds the screen's state in plain properties: \`title\`, \`isDone\`, \`canSubmit\`. It also exposes actions such as \`submit()\`. It knows nothing about buttons or labels.

        The view **binds** to those properties. **Data binding** means "this label always shows \`vm.title\`": a framework watches the property and redraws the label when it changes. Two-way binding goes the other way too: typing in a text box updates the property.

        You declare *what* the screen shows, not *how* to refresh it. That is why Vue, Angular and SwiftUI feel so natural for it.` },

    { kind: 'code', title: 'A view-model has no idea there is a screen',
      body: 'A tiny view-model in plain JavaScript. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        class TaskViewModel {
          title = '';
          done = false;

          get canSave() {
            return this.title.trim().length > 0;
          }

          save() {
            if (!this.canSave) return;
            this.model.add(this.title);   // the model owns the rules
            this.title = '';              // the view clears itself
          }
        }`,
        notes: {
          2: 'Plain state, ready for a view to bind to. No buttons, no HTML.',
          5: 'A **derived** property. A binding such as “disable Save unless \`canSave\`” updates automatically as the user types.',
          11: 'Business rules stay in the model. The view-model only shapes data for display and passes actions on.',
          12: 'Change a property and the bound text box empties. The view-model never touched it.'
        } } },

    { kind: 'pitfall', title: 'The “fat controller” and the “massive view controller”',
      body: `All three patterns have a favourite way to go wrong: the middle piece swallows everything.

        Business rules creep into the controller because "it was right there". Soon the controller validates, calculates discounts and sends emails, and the model is just a bag of fields. iOS developers jokingly expand MVC to *Massive View Controller*.

        The cure is the same in every pattern: **the model owns the rules.** The middle piece should be thin glue: translate input into model calls, translate model state into something displayable. If you cannot test a rule without a screen or a web request, it is in the wrong place.` },

    { kind: 'realworld', title: 'Where you will meet each one',
      body: `The names get used loosely, and real apps blend them. Experts argue about where one ends and the next begins, so treat the labels as rough descriptions.

        - **MVC**: server web frameworks such as Ruby on Rails, Django (which calls its version MTV), Spring MVC and ASP.NET MVC.
        - **MVP**: classic desktop toolkits and a lot of older Android code.
        - **MVVM**: Microsoft's WPF (where it was popularised), Vue, Angular, SwiftUI and Android's Jetpack ViewModel.

        Front-end frameworks like React often use a one-way flow of state instead. That is a close relative, not an exact match.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each piece to its job in the restaurant.',
      pairs: [['Model', 'The kitchen: data and rules'], ['View', 'The dining room: what the guest sees'], ['Controller', 'The waiter: turns requests into actions'], ['Presenter', 'A waiter who also tells the dining room how to lay every table']],
      explain: 'The model never cares how it is shown, and the view never decides business rules. Everything in between is glue.' },

    { type: 'mcq', after: 3, q: 'What is the defining rule of MVP compared with classic MVC?',
      options: ['The view never talks to the model; the presenter sits between them', 'The model is stored in the browser instead of on a server', 'The view contains all the business rules', 'There is no model at all'],
      answer: 0,
      why: [null, 'MVP says nothing about where data is stored.', 'The opposite: the view is kept as dumb as possible.', 'MVP keeps the model. It only changes who talks to it.'],
      explain: 'In MVP the view is a passive screen. The presenter asks the model and then tells the view exactly what to display, which also makes the presenter easy to test with a fake view.' },

    { type: 'tf', after: 5, statement: 'In MVVM the view-model knows nothing about the specific buttons and labels on screen.', answer: true,
      explain: 'The view-model exposes plain state and the view binds to it. Not knowing about the screen is exactly what makes a view-model easy to test and reuse.' },

    { type: 'bucket', prompt: 'Which piece should own each piece of logic?', buckets: ['Model', 'View', 'Controller / Presenter / ViewModel'],
      items: [['A task title cannot be empty', 0], ['A finished task cannot be finished twice', 0], ['Overdue tasks are drawn in red', 1], ['Turn a “Save” click into a call to the model', 2], ['Disable the Save button while the form is blank', 2], ['Where the delete icon sits on screen', 1]],
      explain: 'Rules about the data live in the model. How things look lives in the view. The middle piece translates between the two.' },

    { type: 'ab', q: 'Which controller keeps the right responsibilities in the right place?',
      a: { lang: 'js', label: 'Thin controller', src: `
        function checkout(req, res) {
          const order = orders.place(req.cart);
          res.render('thanks', { order });
        }` },
      b: { lang: 'js', label: 'Fat controller', src: `
        function checkout(req, res) {
          let total = 0;
          for (const i of req.cart) total += i.price * i.qty;
          if (total > 100) total *= 0.9;
          db.insert('orders', { total });
          res.render('thanks', { total });
        }` },
      answer: 'a',
      explain: 'The discount rule and the saving belong to the model. Left in the controller, they cannot be reused or tested without a web request, and every new screen would copy them.' },

    { type: 'spot', prompt: 'This presenter has a problem for testing. Tap the line.',
      code: { lang: 'js', src: `
        class TaskPresenter {
          onDoneClicked(taskId) {
            this.model.markDone(taskId);
            document.getElementById('done-btn').disabled = true;
          }
        }` },
      lines: [4],
      explain: 'The presenter reaches straight into the page. It should call something like `view.showDone()` on an interface instead, so a test can pass a fake view and no browser is needed.' },

    { type: 'order', prompt: 'Put one MVC click in order (classic version).',
      items: ['The user clicks “Done”', 'The controller receives the click', 'The controller tells the model to mark the task done', 'The model changes and announces it changed', 'The view reads the new state and redraws'],
      explain: 'Input arrives at the controller, the model changes, and the view follows the model. The view never decides what “done” means.' },

    { type: 'cloze', text: 'MVVM uses data {{binding}} so that when a {{view-model}} property changes, the {{view}} updates itself without being told.',
      distractors: ['presenter', 'database', 'cache'],
      explain: 'Binding is the engine that watches properties and redraws. It replaces the presenter’s hand-written “set this label” calls.' },

    { type: 'explain', prompt: 'A colleague puts discount calculations inside a controller. Explain to them why that is a problem and where it should go.',
      model: 'Discounts are business rules, so they belong in the model. In the controller they cannot be reused by a second screen or tested without a request, and the controller grows fat. The controller should only translate input into model calls and pass the result to the view.',
      keywords: ['model', 'business rules', 'controller', 'test', 'reuse', 'thin'] }
  ],

  flashcards: [
    { q: 'What three jobs do MVC, MVP and MVVM separate?', a: 'Data and rules (model), display (view) and the glue that reacts to input and connects them (controller, presenter or view-model).' },
    { q: 'MVC vs MVP in one sentence?', a: 'In MVP the view never talks to the model: a presenter sits between them and tells the passive view exactly what to show.' },
    { q: 'What is data binding?', a: 'A framework keeps a view element and a view-model property in sync, so changing one updates the other automatically.' },
    { q: 'Why is a presenter or view-model easy to test?', a: 'It holds decisions but no screen. You can drive it with a fake view or plain method calls.' },
    { q: 'What is the “fat controller” problem?', a: 'Business rules leak into the controller, leaving the model as a bag of fields. Fix it by moving rules back to the model.' }
  ],

  glossary: [
    { term: 'Model', def: 'The part of an app that holds the data and the business rules, and knows nothing about how it is displayed.', like: 'The restaurant kitchen.' },
    { term: 'View', def: 'The part that shows information to the user and reports what they do.', like: 'The dining room.' },
    { term: 'Controller', def: 'In MVC, the part that receives user input and turns it into actions on the model.', like: 'The waiter taking orders.' },
    { term: 'Presenter', def: 'In MVP, the middle piece that talks to both the model and a passive view, telling the view exactly what to display.', like: 'A waiter who also lays every table.' },
    { term: 'View-model', def: 'In MVVM, an object that exposes a screen’s state and actions as plain properties for a view to bind to.', like: 'A menu board that updates whenever the kitchen changes a dish.', aka: ['ViewModel'] },
    { term: 'Data binding', def: 'A mechanism that keeps a screen element and a piece of data in sync automatically.', like: 'A departures board wired to the timetable.' }
  ],

  takeaways: [
    'All three patterns split **data/rules**, **display** and **glue**. They differ in how the pieces talk.',
    '**MVC**: controller takes input, view watches model. **MVP**: view is passive, presenter drives it. **MVVM**: view binds to a view-model.',
    'The model owns the rules. Thin glue, fat model.',
    'The labels are used loosely in real projects; check the arrows, not the name.'
  ],

  links: [
    { label: 'Martin Fowler: GUI Architectures', url: 'https://martinfowler.com/eaaDev/uiArchs.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-hexagonal', {
  eli5: 'Put the important business rules in the middle of your app and make everything else, like the database, the website and the email service, plug into it through sockets, so you can swap the plugs without touching the middle.',

  cards: [
    { kind: 'concept', title: 'The app welded to its database',
      body: `Here is a pricing rule: "orders over £100 get 10% off". Where does it live? In many apps, it sits inside a function that also runs SQL, reads an Express request and calls a payment company. To test it, you need a running database. To move from MySQL to Postgres, you edit the pricing code.

        That is backwards. The discount rule is the valuable part: it is **your business**. The database and the web framework are **tools**, and tools change every few years.

        **Hexagonal architecture** (also called *ports and adapters*, from Alistair Cockburn) flips the picture: **put the business rules in the middle, and make everything else plug in.**` },

    { kind: 'metaphor', title: 'The travel adapter',
      body: `Your laptop charger has one shape of plug. Abroad, you do not rewire the laptop. You buy a **travel adapter** that fits the local socket on one side and your plug on the other.

        - The **port** is the shape of the socket: an agreed interface ("give me power like this").
        - The **adapter** is the translator that makes a specific country's wall fit that shape.

        Your laptop (the core) never learns whether it is in Paris or Tokyo.

        The metaphor stops here: real adapters are one-way, but in software there are ports for things that call *in* (a web page asking to place an order) and for things the core calls *out* to (saving the order).` },

    { kind: 'diagram', title: 'Ports and adapters, top to bottom',
      body: 'Things that **drive** the app arrive at the top. Things the app **drives** sit at the bottom. The core only ever sees the ports.',
      nodes: [
        { id: 'web', label: 'Web page', icon: '🌐', x: 0, y: 0, tone: 'info' },
        { id: 'test', label: 'Automated test', icon: '🧪', x: 2, y: 0, tone: 'info' },
        { id: 'in', label: 'Port: PlaceOrder', x: 1, y: 1, tone: 'warn' },
        { id: 'core', label: 'Business rules', icon: '💎', x: 1, y: 2, tone: 'accent' },
        { id: 'out', label: 'Port: OrderStore', x: 1, y: 3, tone: 'warn' },
        { id: 'pg', label: 'Postgres adapter', icon: '🗄️', x: 0, y: 4, tone: 'good' },
        { id: 'mem', label: 'In-memory fake', x: 2, y: 4, tone: 'good' }
      ],
      edges: [
        { from: 'web', to: 'in', label: 'calls' }, { from: 'test', to: 'in', label: 'calls' },
        { from: 'in', to: 'core' }, { from: 'core', to: 'out', label: 'needs' },
        { from: 'pg', to: 'out', label: 'implements', dashed: true }, { from: 'mem', to: 'out', label: 'implements', dashed: true }
      ],
      caption: 'The “hexagon” is just a way of drawing the core with several ports around it. Six sides do not mean six ports.' },

    { kind: 'code', title: 'A port is just an interface the core owns',
      body: 'The key detail: the core **defines** the shape it needs. The database adapter has to fit it, not the other way round.',
      code: { lang: 'js', src: `
        // Inside the core. No SQL, no HTTP, no framework imports.
        function placeOrder(cart, orderStore) {
          let total = cart.items.reduce((s, i) => s + i.price, 0);
          if (total > 100) total = total * 0.9;
          const order = { items: cart.items, total };
          orderStore.save(order);          // the outbound port
          return order;
        }

        // An adapter, outside the core.
        const postgresStore = {
          save(order) { db.query('INSERT INTO orders ...', [order.total]); }
        };

        // A fake for tests.
        const memoryStore = { saved: [], save(o) { this.saved.push(o); } };`,
        notes: {
          4: 'The business rule. It can be tested in a millisecond with plain data.',
          6: 'The core calls \`orderStore.save\` without knowing what is behind it. That shape is the **port**.',
          12: 'The adapter translates the port into SQL. Swap databases and only this object changes.',
          16: 'A test adapter. No database, no network, instant tests.'
        } } },

    { kind: 'concept', title: 'The dependency rule',
      body: `Look at the arrows in the diagram once more. The Postgres adapter points *at* the port. The core never points at Postgres.

        That is the **dependency rule**, which you met in the Architectural Principles module: **source-code dependencies only point inwards, towards the business rules.** The inner part may not import, name or even know about the outer part.

        How does the core call out, then? Through an interface it owns, which an outer adapter implements. This is **dependency inversion** doing its job: control flows outward at run time, but the *code* dependency points inward.

        A quick test: can you delete the web framework folder and still compile the core? If yes, the rule holds.` },

    { kind: 'layers', title: 'Onion and Clean: the same idea in rings',
      body: `Two siblings draw the idea as concentric rings: **onion architecture** (Jeffrey Palermo) and **Clean Architecture** (Robert C. Martin). Here are Clean's rings, innermost first listed at the top. Dependencies point **up** this list.`,
      layers: [
        { label: 'Entities', note: 'Company-wide business rules and objects', tone: 'accent', icon: '💎' },
        { label: 'Use cases', note: 'One application action: “place an order”, “cancel a booking”', tone: 'good', icon: '🎯' },
        { label: 'Interface adapters', note: 'Controllers, presenters and gateways that convert data between layers', tone: 'warn', icon: '🔌' },
        { label: 'Frameworks and drivers', note: 'The web framework, the database, the UI, the outside world', tone: 'muted', icon: '🧰' }
      ] },

    { kind: 'compare', title: 'Three names, one family',
      body: 'The authors arrived at very similar rules from different directions. The pictures differ more than the principle.',
      cols: ['Hexagonal', 'Onion', 'Clean'],
      rows: [
        ['Picture', 'A hexagon with ports on its edges', 'Concentric rings', 'Concentric rings'],
        ['Main vocabulary', 'Ports and adapters', 'Domain model, services, infrastructure', 'Entities, use cases, adapters'],
        ['Core rule', 'The core knows only ports', 'Dependencies point to the centre', 'The dependency rule'],
        ['Emphasis', 'Swappable edges, testing', 'A domain model at the centre', 'Use cases as named layers']
      ] },

    { kind: 'example', title: 'What swapping looks like',
      body: `Six months later the company moves from a relational database to a document store. In the welded app, every function that touched storage must be found and edited. In the hexagonal app:

        1. Write a new \`MongoOrderStore\` adapter that implements \`save\`.
        2. Change **one line** where the app is wired together.
        3. Run the same business-rule tests, which never knew about databases.

        The same trick works for the UI. A web page, a command-line tool and a mobile app can all call the same \`PlaceOrder\` port. The core does not care who is asking.` },

    { kind: 'pitfall', title: 'The cost of ceremony',
      body: `This design is not free. Every outside thing gets an interface, an adapter and often a copy of the data in a new shape. A simple "list the users" screen can turn into five files.

        If your app is a thin form over a database with almost no rules, the middle is empty and you have built an elaborate road to nowhere. You also add a risk of *fake* purity: interfaces that mirror one database exactly, so swapping is never really possible.

        Use it where the **rules are valuable and likely to outlive the tools**. For simple CRUD, a plain layered app is a fine, honest choice. Experts disagree on how early to start; the key is to pay for it only when the rules justify it.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'Why do these architectures put the business rules in the middle?',
      options: ['Databases and frameworks change more often than the rules', 'Business rules always run faster in the middle', 'The database must never be used with business rules', 'It reduces the number of files in the project'],
      answer: 0,
      why: [null, 'Position has nothing to do with speed.', 'The database is still used. It is just kept at the edge.', 'It usually adds files, which is the cost of the design.'],
      explain: 'The rules are the valuable, long-lived part. By keeping tools at the edge, you can replace a database or framework without rewriting what the business actually cares about.' },

    { type: 'match', after: 3, prompt: 'Match the term to its meaning.',
      pairs: [['Port', 'An interface the core defines for talking to the outside'], ['Adapter', 'Code that fits a real tool to a port'], ['Driving side', 'Things that call into the app, like a web page'], ['Driven side', 'Things the app calls out to, like a database'], ['Dependency rule', 'Source code only points inwards']],
      explain: 'The core owns the ports. Adapters on both sides translate between the real world and those ports.' },

    { type: 'spot', after: 4, prompt: 'This file is meant to be in the core. Tap the line that breaks the dependency rule.',
      code: { lang: 'js', src: `
        const { Pool } = require('pg');

        function cancelBooking(booking, now) {
          if (booking.startsAt - now < 24 * 3600 * 1000) {
            throw new Error('Too late to cancel');
          }
          booking.status = 'cancelled';
        }` },
      lines: [1],
      explain: 'The core imports a Postgres library, so an inner layer now depends on an outer tool. The cancellation rule itself is pure and fine. Anything that needs the database should be reached through a port.' },

    { type: 'tf', statement: 'In a hexagonal design, the database adapter is written to fit the interface that the core defines.', answer: true,
      explain: 'That is dependency inversion: the core says what it needs, and the adapter conforms. If the database dictated the interface, the core would be shaped by the tool.' },

    { type: 'bucket', prompt: 'Does this belong in the core, or in an adapter?', buckets: ['Core (business rules)', 'Adapter (outside world)'],
      items: [['Orders over £100 get 10% off', 0], ['Turn an order into an SQL INSERT', 1], ['A booking cannot be cancelled within 24 hours', 0], ['Read the JSON body of an HTTP request', 1], ['Call the email provider’s API', 1], ['A user may hold at most three active loans', 0]],
      explain: 'If it would still be true with no computer involved, it is a business rule. If it exists because of a particular technology, it is an adapter.' },

    { type: 'ab', q: 'Which version is easier to unit test with no database?',
      a: { lang: 'js', label: 'Reaches out itself', src: `
        function signUp(email) {
          db.query('INSERT INTO users ...', [email]);
        }` },
      b: { lang: 'js', label: 'Uses a port', src: `
        function signUp(email, userStore) {
          userStore.save({ email });
        }` },
      answer: 'b',
      explain: 'Passing the store in means a test can supply an in-memory fake. The other version cannot run without a real database and a global connection.' },

    { type: 'multi', q: 'Which of these are real costs of ports-and-adapters design?',
      options: ['More interfaces and files for the same feature', 'Data copied between differently shaped objects', 'Extra effort that a simple form-over-database app may never repay', 'Business rules can no longer be unit tested', 'The app can no longer use a database'],
      answers: [0, 1, 2],
      explain: 'The design buys testability and flexibility at the price of ceremony. Tests actually get easier, and the database is still used, just behind a port.' },

    { type: 'scenario', title: 'The rewrite request', intro: 'You are the senior developer on a ticket-booking app. The business rules are complicated. The company has just announced it is leaving its current database vendor within a year.',
      meters: { 'delivery speed': 70, 'future flexibility': 30 },
      steps: [
        { text: 'The new feature is a rule for group discounts. Where do you write it?',
          choices: [
            { label: 'In the core, as plain code with the store passed in', score: 2, effects: { 'future flexibility': 25, 'delivery speed': -5 }, feedback: 'The discount depends on nothing but data, so it is simple to test and is untouched by the database migration.' },
            { label: 'Inside the SQL query, so the database does the work', score: 0, effects: { 'future flexibility': -25, 'delivery speed': 10 }, feedback: 'Quick today. But the rule is now written in one vendor’s SQL dialect, exactly the thing you are about to move away from.' },
            { label: 'In the web controller, next to the form', score: 1, effects: { 'future flexibility': -10 }, feedback: 'It avoids the database problem, but any other entry point (a mobile app, a batch job) would have to copy it.' }
          ] },
        { text: 'Now the migration begins. How should the rest of the app reach the new database?',
          choices: [
            { label: 'Write a new adapter for the existing store port and switch the wiring', score: 2, effects: { 'future flexibility': 20, 'delivery speed': 10 }, feedback: 'The core and its tests are unchanged. The risk is concentrated in a single, replaceable file.' },
            { label: 'Search the whole codebase for database calls and edit each one', score: 0, effects: { 'delivery speed': -25 }, feedback: 'That is the cost of having no boundary: the change spreads everywhere, and nobody is sure they found every call.' },
            { label: 'Rewrite the app on the new vendor’s own framework', score: 0, effects: { 'delivery speed': -30, 'future flexibility': -15 }, feedback: 'A rewrite throws away working rules to fix a problem that a single adapter would have solved.' }
          ] }
      ],
      outro: 'Boundaries pay off when something at the edge changes. That is the whole bet.' },

    { type: 'explain', prompt: 'A teammate says hexagonal architecture is “just more interfaces”. Explain when it is worth it and when it is not.',
      model: 'It is worth it when the business rules are valuable and long-lived, and the surrounding tools (database, UI, vendors) are likely to change. The core stays testable and independent. For a simple form over a database, with almost no rules, the extra interfaces and adapters are ceremony that never pays back.',
      keywords: ['business rules', 'tools change', 'testable', 'ceremony', 'simple', 'adapter'] }
  ],

  flashcards: [
    { q: 'What are ports and adapters?', a: 'A port is an interface the core defines for talking to the outside. An adapter is code that connects a real tool, such as a database or a web page, to that port.' },
    { q: 'State the dependency rule.', a: 'Source-code dependencies point only inwards, towards the business rules. The core never imports outer layers.' },
    { q: 'How do hexagonal, onion and Clean architecture relate?', a: 'They are close cousins: the same idea, keep the domain at the centre and let everything else depend on it, drawn as a hexagon or rings.' },
    { q: 'How can the core call a database without depending on it?', a: 'It calls an interface that it owns, and an outer adapter implements that interface (dependency inversion).' },
    { q: 'What is the main cost of this style?', a: 'Ceremony: extra interfaces, adapters and data conversions, which are wasteful when there are few business rules.' }
  ],

  glossary: [
    { term: 'Hexagonal architecture', def: 'A design that places the business logic in the centre and connects the outside world through ports and adapters.', like: 'A laptop with a travel adapter for each country.', aka: ['ports and adapters'] },
    { term: 'Port', def: 'An interface owned by the core that describes a conversation with the outside, either coming in or going out.', like: 'The shape of a wall socket.' },
    { term: 'Adapter', def: 'An outer piece of code that makes a real technology (a database, a web page) fit a port.', like: 'The travel plug.' },
    { term: 'Dependency rule', def: 'The rule that source-code dependencies point inwards, so inner layers never know about outer ones.', like: 'A manager who does not know which brand of stapler the office buys.' },
    { term: 'Clean Architecture', def: 'Robert C. Martin’s ring-shaped version of this idea: entities, use cases, interface adapters, and frameworks.', like: 'An onion with business rules at the centre.' }
  ],

  takeaways: [
    '**Business rules in the middle**; databases, UIs and vendors plug in from outside.',
    'A **port** is an interface the core owns. An **adapter** fits a real tool to it.',
    'The **dependency rule**: code dependencies point inwards only.',
    'Worth it for valuable, long-lived rules. Overkill for thin forms over a database.'
  ],

  links: [
    { label: 'Alistair Cockburn: Hexagonal architecture', url: 'https://alistair.cockburn.us/hexagonal-architecture/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-microkernel', {
  eli5: 'A microkernel app is a very small core that does the bare essentials, plus a shelf of plug-ins that add everything else, like a phone that stays simple until you install apps.',

  cards: [
    { kind: 'concept', title: 'The editor that could not stop growing',
      body: `You build a text editor. Version 1 opens and saves files. Users ask for syntax colouring, so you add it. Then spell checking, a Git panel, Markdown preview, a Python debugger, and forty colour themes.

        A year later, one team owns a 2-million-line program where a bug in the theme code can stop files saving. And every user who just wanted to write a shopping list downloads a debugger.

        There is another way to grow. Keep the **core** tiny, with only what *every* user needs, and let all the rest be **plug-ins** that can be added, removed and written by other people. That is the **microkernel** (or **plug-in**) architecture.` },

    { kind: 'metaphor', title: 'A power strip and a drawer of gadgets',
      body: `Think of a multi-socket extension lead. It has no opinion about what you plug in: a lamp, a phone charger, a fan. It just provides standard sockets and passes power through safely.

        - The **core** is the strip: small, dull, reliable.
        - The **plug-ins** are the gadgets: varied, optional, replaceable.
        - The **socket shape** is the contract that makes any gadget fit.

        Where the metaphor stops: a gadget cannot usually break the strip, but a badly written plug-in can crash or slow down the whole app unless the core takes precautions.` },

    { kind: 'diagram', title: 'A small core, many plug-ins',
      body: 'The core knows only the **extension points**: the sockets. It never names a specific plug-in.',
      nodes: [
        { id: 'p1', label: 'Syntax colouring', x: 0, y: 0, tone: 'good' },
        { id: 'p2', label: 'Git panel', x: 1, y: 0, tone: 'good' },
        { id: 'p3', label: 'Spell checker', x: 2, y: 0, tone: 'good' },
        { id: 'reg', label: 'Plug-in registry', icon: '📒', x: 1, y: 1, tone: 'warn' },
        { id: 'core', label: 'Core: files, window, events', icon: '⚙️', x: 1, y: 2, tone: 'accent' }
      ],
      edges: [
        { from: 'p1', to: 'reg', label: 'registers' }, { from: 'p2', to: 'reg' }, { from: 'p3', to: 'reg' },
        { from: 'reg', to: 'core', label: 'extends', dashed: true }
      ],
      caption: 'Plug-ins depend on the core’s published contract. The core depends on no particular plug-in.' },

    { kind: 'sequence', title: 'How a plug-in gets loaded',
      body: 'This is the common shape, whether the app is an editor, a browser or a blog.',
      actors: ['Core', 'Registry', 'Plug-in'],
      steps: [
        { at: 0, label: 'starts, scans the plug-ins folder', note: 'The core finds plug-ins by looking in an agreed place, or by reading a list of installed ones.' },
        { from: 0, to: 2, label: 'load and ask: who are you?', note: 'Each plug-in ships a small description: its name, version and what it adds.' },
        { from: 2, to: 1, label: 'register “.md → preview”', note: 'The plug-in announces which **extension point** it fills. It is saying “I can handle Markdown files.”' },
        { at: 0, label: 'user opens notes.md', note: 'Some time later, the user opens a Markdown file.' },
        { from: 0, to: 1, label: 'who handles .md?', note: 'The core asks the **registry**, not a hard-coded list.' },
        { from: 1, to: 2, label: 'here you go', dashed: true, note: 'The right plug-in does the work. Install a better Markdown plug-in tomorrow and the core is unchanged.' }
      ] },

    { kind: 'code', title: 'The registry in twelve lines',
      body: 'The pattern is mostly a lookup table plus a contract. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        const handlers = new Map();   // file type -> plug-in

        function register(ext, plugin) {
          handlers.set(ext, plugin);
        }

        function open(file) {
          const plugin = handlers.get(file.ext);
          if (!plugin) return showAsPlainText(file);
          return plugin.render(file);
        }

        // A plug-in lives in its own package:
        register('md', { render: (f) => markdownToHtml(f.text) });`,
        notes: {
          1: 'The **registry**. The core owns this map but fills it with nothing.',
          3: 'The **extension point**: the one door through which new behaviour enters.',
          8: 'The core looks up the handler at the moment it is needed.',
          9: 'A sensible **fallback** matters: the app must keep working when no plug-in matches.',
          14: 'A plug-in only needs to honour the contract (here, a \`render\` function).'
        } } },

    { kind: 'realworld', title: 'You use these every day',
      body: `- **IDEs and editors**: Eclipse is famously built as a tiny runtime with nearly everything as plug-ins. VS Code is a lean editor plus extensions, which run in a separate process so a crashing extension does not freeze your typing.
        - **Web browsers**: the browser engine is the core; extensions add ad-blocking, password managers and dark mode.
        - **WordPress, Jenkins and many build tools**: the product is a core plus thousands of community plug-ins.

        The name comes from operating systems, where a *microkernel* keeps only the essentials in the privileged core and runs drivers and services outside it. Same idea, different layer.` },

    { kind: 'compare', title: 'What you gain, and what you pay',
      body: 'Plug-in systems trade a simple core for a more complicated world around it.',
      cols: ['You gain', 'You pay'],
      rows: [
        ['Extensibility', 'Others can add features without touching your code', 'You must design extension points up front, and guess wrong sometimes'],
        ['Stability of the core', 'A small core is easier to test and trust', 'The contract is now a promise: changing it breaks every plug-in'],
        ['Isolation', 'Features can be shipped, removed or disabled alone', 'Plug-ins can clash or slow the whole app'],
        ['Speed of the core', 'Starts small and fast', 'Plug-in calls cross a boundary, so some overhead']
      ] },

    { kind: 'pitfall', title: 'The plug-in that ate the world',
      body: `A plug-in system tempts you to make *everything* a plug-in, including things that every user needs. Then the core is so thin that nothing works without installing six plug-ins, and you have moved the complexity rather than removed it.

        Another trap is the leaky contract. If plug-ins reach into the core's internals "just this once", you can never change the internals again.

        Rules of thumb: put in the core only what **every** user needs and **nothing can work without**. Keep the contract small, versioned, and the same for your own plug-ins as for third-party ones.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'In a microkernel (plug-in) architecture, what belongs in the core?',
      options: ['Only the minimum every user needs, plus the extension points', 'Every feature, so nothing has to be installed', 'Only the user interface', 'Only the plug-ins that the company wrote'],
      answer: 0,
      why: [null, 'That describes a monolith, not a plug-in design.', 'The UI could be a plug-in too. What matters is that the core is minimal.', 'Plug-ins from the company and from others obey the same contract.'],
      explain: 'The core is the smallest thing that is useful on its own, with sockets for the rest. Everything optional can be a plug-in.' },

    { type: 'order', after: 3, prompt: 'Put the plug-in loading sequence in order.',
      items: ['The core scans the plug-ins folder at start-up', 'Each plug-in registers the extension point it fills', 'The user does something, such as opening a .md file', 'The core asks the registry who handles it', 'The matching plug-in does the work'],
      explain: 'Registration happens early, lookup happens when needed. The core never names a specific plug-in in its code.' },

    { type: 'bucket', prompt: 'You are designing a text editor. Core or plug-in?', buckets: ['Core', 'Plug-in'],
      items: [['Open, edit and save a file', 0], ['Show a window and handle key presses', 0], ['The registry of installed plug-ins', 0], ['Python debugger', 1], ['A spell checker for French', 1], ['Dark-forest colour theme', 1]],
      explain: 'Without files, windows and the registry, there is no editor. Everything else is optional for some users, which makes it a plug-in.' },

    { type: 'spot', prompt: 'This core has defeated the purpose of a plug-in design. Tap the line.',
      code: { lang: 'js', src: `
        function open(file) {
          const known = ['md', 'csv', 'png'];
          if (!known.includes(file.ext)) return showAsPlainText(file);
          return viewers[file.ext](file);
        }

        const viewers = { md: markdownPreview, csv: tableView, png: imageViewer };` },
      lines: [2],
      explain: 'The core carries a fixed list of file types, so adding one means editing the core and its list. A registry that plug-ins add themselves to lets new types arrive without changing this function.' },

    { type: 'tf', statement: 'In a good plug-in system, a new plug-in can be added without editing the core.', answer: true,
      explain: 'That is the whole point: the core publishes extension points once, and new plug-ins fit them without any change to the core.' },

    { type: 'multi', q: 'Which are genuine downsides of a plug-in architecture?',
      options: ['The plug-in contract becomes a promise that is hard to change', 'A badly written plug-in can slow or crash the app', 'Designing the right extension points needs foresight', 'The core can no longer be tested', 'Users can never remove features'],
      answers: [0, 1, 2],
      explain: 'The contract, plug-in quality and extension-point design are the real costs. A small core is usually *easier* to test, and removing plug-ins is the usual benefit.' },

    { type: 'ab', q: 'Which design is a better extension point for “export a report”?',
      a: { lang: 'js', label: 'Registry', src: `
        exporters.set('pdf', makePdf);
        exporters.set('csv', makeCsv);
        exporters.get(format)(report);` },
      b: { lang: 'js', label: 'Switch in the core', src: `
        switch (format) {
          case 'pdf': return makePdf(report);
          case 'csv': return makeCsv(report);
        }` },
      answer: 'a',
      explain: 'With a registry, a new format is added by registering another function. The switch has to be edited, re-tested and redeployed every time.' },

    { type: 'explain', prompt: 'Why can a very successful browser or editor afford to have a small core, and what must it promise plug-in authors in return?',
      model: 'Because most features live in plug-ins, the core stays small and stable. In return it must offer a clear, stable contract, the extension points, so plug-ins keep working as the core evolves. Changing that contract carelessly breaks everyone who built on it.',
      keywords: ['core', 'plug-in', 'contract', 'extension point', 'stable', 'registry'] }
  ],

  flashcards: [
    { q: 'What is a microkernel (plug-in) architecture?', a: 'A tiny core that does the essentials, plus plug-ins that add everything else through defined extension points.' },
    { q: 'What is an extension point?', a: 'A place where the core deliberately allows new behaviour to be added, along with the contract a plug-in must follow.' },
    { q: 'What does a plug-in registry do?', a: 'It records which plug-ins are installed and what each can handle, so the core can look them up instead of hard-coding them.' },
    { q: 'Name two well-known examples.', a: 'IDEs such as Eclipse and VS Code, and web browsers with extensions. WordPress and Jenkins are plug-in systems too.' },
    { q: 'What is the main danger of a plug-in design?', a: 'The contract becomes hard to change, and poor plug-ins can hurt the whole app. Decide carefully what truly belongs in the core.' }
  ],

  glossary: [
    { term: 'Microkernel architecture', def: 'A design with a minimal core system and optional plug-ins that extend it through agreed extension points.', like: 'A power strip with gadgets plugged in.', aka: ['plug-in architecture'] },
    { term: 'Plug-in', def: 'A separately built piece of software that adds a feature to a host application by following its contract.', like: 'A gadget on a power strip.', aka: ['extension', 'add-on'] },
    { term: 'Extension point', def: 'A place in the core designed to accept new behaviour from plug-ins.', like: 'A socket on the strip.' },
    { term: 'Registry', def: 'A lookup table where plug-ins announce what they provide and the core finds them.', like: 'A switchboard listing who handles which calls.' }
  ],

  takeaways: [
    'Keep the **core tiny**: only what every user needs. Make the rest **plug-ins**.',
    'The core publishes **extension points** and a **registry**. It never names a specific plug-in.',
    'The contract is a promise. Keep it small and stable.',
    'Great for editors, browsers and platforms that others extend; unnecessary for a one-purpose app.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-blackboard', {
  eli5: 'In the blackboard pattern, several specialists look at a shared whiteboard and each adds whatever they can figure out, until together they have solved a problem none of them could solve alone.',

  cards: [
    { kind: 'concept', title: 'A problem with no recipe',
      body: `Most programs follow a recipe: step one, then step two, then step three. Some problems have no known recipe. Turning a noisy recording of someone speaking into text is one. A muffled sound could be "recognise speech" or "wreck a nice beach". You can only decide by combining clues: the sounds, the grammar, the topic of the conversation.

        No single step can solve it, and the right order of steps depends on what you find along the way.

        The **blackboard pattern** is built for this. Many independent specialists each contribute a small piece of insight to a **shared workspace**, and the solution emerges bit by bit.` },

    { kind: 'metaphor', title: 'The detectives’ wall',
      body: `Picture a murder-mystery incident room. A big board holds photos, notes and string. A fingerprint expert pins up a match. A forensic accountant notices a payment and adds a note. The witness-interviewer spots that the timeline does not fit and moves a card.

        Nobody gives the others instructions. Each expert glances at the board, sees something they can improve, and writes it up. Their update lets someone else make a new connection. Eventually the board shows who did it.

        The metaphor misses one thing: in a real incident room there is a boss, the lead detective, who decides who speaks next. Software needs that role too.` },

    { kind: 'diagram', title: 'The three parts',
      body: 'Specialists never talk to each other. They only read and write the board.',
      nodes: [
        { id: 'ks1', label: 'Knowledge source: sounds', x: 0, y: 0, tone: 'good' },
        { id: 'ks2', label: 'Knowledge source: words', x: 1, y: 0, tone: 'good' },
        { id: 'ks3', label: 'Knowledge source: grammar', x: 2, y: 0, tone: 'good' },
        { id: 'bb', label: 'Blackboard (shared data)', icon: '🧾', x: 1, y: 1, tone: 'accent' },
        { id: 'ctl', label: 'Controller', icon: '🎛️', x: 1, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'ks1', to: 'bb', label: 'reads / writes', both: true },
        { from: 'ks2', to: 'bb', both: true },
        { from: 'ks3', to: 'bb', both: true },
        { from: 'ctl', to: 'bb', label: 'watches', dashed: true }
      ],
      caption: 'The controller also decides which knowledge source gets to act next.' },

    { kind: 'concept', title: 'Knowledge sources and the controller',
      body: `The pattern has three kinds of part:

        - The **blackboard** holds the current best understanding of the problem: raw input, partial guesses and finished results, often in layers from low-level to high-level.
        - Each **knowledge source** is a specialist module that knows one slice of the problem. It has a condition ("I can help when the board has candidate syllables") and an action ("then I will propose words").
        - The **controller** watches the board and picks which ready knowledge source runs next, usually the one most likely to make progress.

        The specialists are fully independent. You can add one, remove one or improve one without the others noticing.` },

    { kind: 'steps', title: 'One pass of a speech-recognition blackboard',
      body: 'A classic example: the 1970s Hearsay-II speech-understanding system used this approach. A simplified run looks like this.',
      steps: [
        { title: 'Raw sound arrives', body: 'The board gets a cleaned-up recording and a first set of sound fragments.' },
        { title: 'The sounds specialist proposes', body: 'It writes candidate syllables on the board, each with a confidence score.' },
        { title: 'The words specialist reacts', body: 'It sees syllables it recognises and posts candidate words: “speech”, “beach”.' },
        { title: 'The grammar specialist prunes', body: 'It notices that “recognise beach” does not fit the sentence so far, and lowers its score.' },
        { title: 'The controller decides again', body: 'Using the new board, it picks the next specialist to run. Repeat until one full interpretation is confident enough.' }
      ] },

    { kind: 'realworld', title: 'Where it appears, and where it echoes',
      body: `The pattern is less common than MVC or microservices, because few problems fit. It has been used in speech and image interpretation, signal analysis (such as sonar), and some planning and diagnostic systems, where several kinds of expertise must be merged.

        Look at modern **AI agent systems** and you will see an echo. In some multi-agent designs, a researcher agent, a coder agent and a reviewer agent all read and write a shared notes space, while an orchestrator decides who goes next. That is blackboard thinking, though not every agent framework works that way, and the old and new systems differ a lot in how they work inside.` },

    { kind: 'compare', title: 'Blackboard vs a pipeline',
      body: 'A pipeline is the natural alternative when the order of work is known.',
      cols: ['Pipeline', 'Blackboard'],
      rows: [
        ['Order of work', 'Fixed, decided in advance', 'Decided on the fly by the controller'],
        ['How parts cooperate', 'Each hands output to the next', 'All read and write one shared space'],
        ['Fits when', 'The steps are known', 'No known algorithm; many kinds of clue'],
        ['Hard to', 'Handle surprises mid-way', 'Test, predict and debug']
      ] },

    { kind: 'pitfall', title: 'Hard to reason about',
      body: `The freedom is also the cost. With no fixed order, the same input can take different paths, so bugs are hard to reproduce. The blackboard is shared, so specialists can contradict or overwrite each other. And the controller can become the most complicated part: choosing well is a problem in itself.

        There is also no guarantee of finishing. You need a clear stopping rule, such as "stop when one answer passes a confidence threshold or a time limit hits".

        If you *can* write down the steps, use a pipeline. Reach for a blackboard only when the problem forces your hand.` }
  ],

  activities: [
    { type: 'match', after: 3, prompt: 'Match each blackboard part to its role.',
      pairs: [['Blackboard', 'Shared workspace holding the current partial solution'], ['Knowledge source', 'A specialist that contributes one kind of insight'], ['Controller', 'Chooses which specialist acts next'], ['Raw input', 'The unsolved problem that starts on the board']],
      explain: 'The board holds data, specialists contribute, and the controller steers. None of the specialists call each other.' },

    { type: 'tf', after: 3, statement: 'In the blackboard pattern, specialists cooperate through the shared board rather than messaging each other.', answer: true,
      explain: 'They cooperate only through the shared board. That keeps them independent, so you can add or remove one without changing the others.' },

    { type: 'mcq', after: 6, q: 'When is a blackboard a better choice than a pipeline?',
      options: ['The solution needs many kinds of expertise and no fixed order of steps is known', 'The steps are always the same and run in a fixed order', 'You need the simplest design that is easy to debug', 'You have a single algorithm that solves the whole problem'],
      answer: 0,
      why: [null, 'A fixed order is the pipeline’s home ground.', 'A blackboard is harder to debug, not easier.', 'With one algorithm, no collaboration is needed.'],
      explain: 'A blackboard suits uncertain problems where the next useful step depends on what has been discovered so far.' },

    { type: 'order', prompt: 'Put one cycle of a blackboard system in order.',
      items: ['New information appears on the board', 'The controller finds specialists whose conditions are now met', 'The controller picks the most promising one', 'That specialist reads the board and writes a refinement', 'The board changes and the cycle repeats'],
      explain: 'Everything is triggered by the state of the board. The cycle ends when the controller’s stopping rule is satisfied.' },

    { type: 'bucket', prompt: 'Which fits better: a pipeline or a blackboard?', buckets: ['Pipeline', 'Blackboard'],
      items: [['Resize an image, then compress it, then upload it', 0], ['Combine sonar, radar and weather clues to identify an object', 1], ['Convert a CSV into a report, always the same steps', 0], ['Interpret a blurry photo using shape, colour and context experts', 1], ['Hash a password, then store it', 0], ['Diagnose a rare illness from mixed lab clues', 1]],
      explain: 'If you can write the steps down, a pipeline is simpler. Blackboards earn their keep when clues from different specialities must be combined without a known order.' },

    { type: 'multi', q: 'Which are real drawbacks of the blackboard pattern?',
      options: ['Behaviour is hard to predict and reproduce', 'The controller can become very complex', 'Specialists may overwrite or contradict each other', 'Every specialist must know every other specialist', 'It can only be used on one machine'],
      answers: [0, 1, 2],
      explain: 'Flexible ordering and a shared space cause unpredictability and contention. Specialists do not need to know each other: that is a benefit.' },

    { type: 'scenario', title: 'Design the fraud detector', intro: 'A bank asks you to build a system that decides whether a card transaction is fraudulent. Clues come from spending history, location, device, typical times of day and a human analyst’s notes. Nobody can write a single clear rule set.',
      meters: { accuracy: 40, 'maintainability': 60 },
      steps: [
        { text: 'How do you organise the work?',
          choices: [
            { label: 'Independent checkers post scores and findings to a shared case file; a controller picks what to run next', score: 2, effects: { accuracy: 30, maintainability: -5 }, feedback: 'This is the blackboard shape. Each checker stays small, and a new clue source can be added without changing the rest.' },
            { label: 'A single huge function with one long if-else chain', score: 0, effects: { accuracy: -5, maintainability: -30 }, feedback: 'Every new clue means editing the same fragile function, and the rules interact in ways nobody can see.' },
            { label: 'A strict three-step pipeline: check location, then history, then device', score: 1, effects: { accuracy: 5 }, feedback: 'Simple, but the best next step depends on what you found. A suspicious location might make device checks urgent, and a pipeline cannot reorder itself.' }
          ] },
        { text: 'Testing proves hard because the same transaction sometimes takes a different path. What now?',
          choices: [
            { label: 'Log every board change and keep the controller’s choices deterministic for the same input', score: 2, effects: { maintainability: 25 }, feedback: 'Replayable logs and a predictable controller tame the main weakness of the pattern.' },
            { label: 'Remove the controller and let specialists run in random order', score: 0, effects: { accuracy: -15, maintainability: -20 }, feedback: 'Randomness makes it less reproducible, not more.' },
            { label: 'Accept it. Different paths are just how blackboards are', score: 1, effects: { maintainability: -10 }, feedback: 'Variation is normal, but untestable behaviour in a bank is a problem you must manage.' }
          ] }
      ],
      outro: 'A blackboard is powerful where clues are mixed, and expensive in predictability. Plan for replay and a clear stopping rule.' },

    { type: 'explain', prompt: 'Describe the blackboard pattern to a friend using the detectives’ wall, and say why it can be harder to debug than a normal program.',
      model: 'Several specialists share one board. Each reads what is there, adds a clue or conclusion if it can, and a controller chooses who goes next. Because the order is decided during the run, the same input can take different paths and specialists can contradict each other, so bugs are harder to reproduce.',
      keywords: ['shared', 'specialists', 'controller', 'board', 'order', 'debug'] }
  ],

  flashcards: [
    { q: 'What are the three parts of the blackboard pattern?', a: 'The blackboard (shared data), the knowledge sources (specialists) and the controller (decides who acts next).' },
    { q: 'How do knowledge sources communicate?', a: 'Only through the blackboard. They never call each other directly.' },
    { q: 'When should you use a blackboard?', a: 'For hard problems with no known algorithm, where several kinds of expertise must be combined in an order that depends on what is found.' },
    { q: 'What is a classic example?', a: 'Hearsay-II, a 1970s speech-understanding system. It combined sound, word and grammar specialists on a shared board.' },
    { q: 'What is the main drawback?', a: 'It is hard to predict, test and debug, and the controller can get complicated.' }
  ],

  glossary: [
    { term: 'Blackboard pattern', def: 'An architecture where independent specialists cooperate by reading and writing a shared workspace until a solution emerges.', like: 'Detectives pinning clues to one big wall.' },
    { term: 'Knowledge source', def: 'A specialist module that knows how to contribute one kind of insight when the board contains the right input.', like: 'The fingerprint expert on the case.' },
    { term: 'Controller', def: 'The part that watches the blackboard and chooses which knowledge source runs next.', like: 'The lead detective deciding who speaks.' },
    { term: 'Blackboard', def: 'The shared data store holding the problem, partial results and the evolving solution.', like: 'The wall with photos and string.' }
  ],

  takeaways: [
    'For problems with **no known recipe**, let specialists share a **board** and build the answer together.',
    'Parts: **blackboard**, **knowledge sources**, **controller**. Specialists never talk directly.',
    'Powerful but **hard to test and debug**. If you can write the steps down, use a pipeline.',
    'You can see its echo in multi-agent AI systems with a shared workspace.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-soa', {
  eli5: 'Service-oriented architecture is the idea of a big company offering its main abilities, like “look up a customer” or “send an invoice”, as shared services that every department’s software can call.',

  cards: [
    { kind: 'concept', title: 'Five systems, five customer lists',
      body: `A large insurance company has grown for thirty years. The sales system keeps customers. The claims system keeps customers too, slightly differently. So do billing, the website and the call centre. Change a customer's address in one place and four others stay wrong.

        In the early 2000s, a popular answer was **service-oriented architecture** (SOA): stop copying, and instead offer each **business capability** once, as a **service** that anyone in the company can call. One *Customer* service. One *Billing* service. One *Policy* service.

        Every application, new or old, asks the service rather than keeping its own version.` },

    { kind: 'metaphor', title: 'The company switchboard and the specialist desks',
      body: `Imagine a big firm where there is one desk for expenses, one for travel bookings and one for legal questions. Any department can phone them. Each desk has a written procedure: "send us this form, we reply with this letter".

        In the middle sits a **switchboard operator** who connects calls, translates between departments that use different jargon and keeps a log.

        The metaphor stops where the operator starts doing real work. In SOA that central switchboard tended to take on more and more jobs, and later became its biggest problem.` },

    { kind: 'diagram', title: 'SOA in one picture',
      body: 'Applications talk to services through a central **service bus**. Services talk to each other the same way.',
      nodes: [
        { id: 'web', label: 'Website', icon: '🌐', x: 0, y: 0, tone: 'info' },
        { id: 'call', label: 'Call-centre app', icon: '📞', x: 2, y: 0, tone: 'info' },
        { id: 'esb', label: 'Enterprise service bus', icon: '🚌', x: 1, y: 1, tone: 'warn' },
        { id: 'cust', label: 'Customer service', x: 0, y: 2, tone: 'accent' },
        { id: 'bill', label: 'Billing service', x: 1, y: 2, tone: 'accent' },
        { id: 'pol', label: 'Policy service', x: 2, y: 2, tone: 'accent' },
        { id: 'db', label: 'One shared database', icon: '🗄️', x: 1, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'web', to: 'esb' }, { from: 'call', to: 'esb' },
        { from: 'esb', to: 'cust' }, { from: 'esb', to: 'bill' }, { from: 'esb', to: 'pol' },
        { from: 'bill', to: 'db', dashed: true }
      ],
      caption: 'Many SOA estates also shared databases between services, which later schools of thought avoid.' },

    { kind: 'concept', title: 'Contracts: the written promise',
      body: `A service is only reusable if callers know exactly how to use it without reading its code. So each service publishes a **contract**: the operations it offers, the data they take, the data they return.

        In classic SOA, contracts were usually written in XML. **SOAP** was the message format and **WSDL** a file describing the service. They are verbose, but precise, and tools could generate client code from them.

        A good contract is a **boundary**. The service team can rewrite everything behind it, provided the contract stays the same. This idea survives in every modern API, from REST to gRPC.` },

    { kind: 'concept', title: 'The service bus: smart middleware',
      body: `The **enterprise service bus** (ESB) was the product in the middle. It did much more than carry messages:

        - **Routing**: send this request to the right service.
        - **Translation**: convert old formats into new ones.
        - **Orchestration**: chain several services into one business process.
        - **Security and logging**: for everyone, in one place.

        This looked brilliant: services stayed simple while the bus held the cleverness. Business processes could be changed without touching the services.

        The catch is hidden in that sentence: the cleverness lived in **one shared component**.` },

    { kind: 'compare', title: 'SOA vs microservices',
      body: 'People argue about whether microservices are a new idea or SOA done properly. Either way, the emphasis is different.',
      cols: ['Classic SOA', 'Microservices'],
      rows: [
        ['Scope', 'The whole enterprise', 'One application or product'],
        ['Middle', 'Smart central bus', 'Simple pipes, smart services'],
        ['Messages', 'Often SOAP and XML', 'Usually JSON over HTTP, or messaging'],
        ['Data', 'Often a shared database', 'Each service owns its data'],
        ['Services', 'Large, shared by many teams', 'Small, owned by one team'],
        ['Governance', 'Central standards and committees', 'Teams choose their tools']
      ] },

    { kind: 'story', title: 'When the bus became the bottleneck',
      body: `Over a decade, the pattern's weaknesses showed up in real companies.

        - The ESB turned into a **god component**. Every change to a business process meant editing the bus, so one central team became the queue everyone waited in.
        - If the bus went down or slowed down, *everything* did.
        - Services were made large and general so everyone could reuse them. But serving ten teams' needs meant changes needed ten teams' approval.
        - Heavy standards and review boards slowed delivery to a crawl.

        None of this is a reason to sneer at SOA. It solved a real problem, and it was often applied to companies far larger than most startups will ever be.` },

    { kind: 'tip', title: 'What survived',
      body: `SOA's best ideas are everywhere now:

        - **Business capabilities as the unit of design**, not technical layers.
        - **Contracts** that hide the insides of a service.
        - **Loose coupling**: callers depend on the contract, not on the implementation.

        What the next generation changed: dumb pipes instead of a clever bus, services owned end to end by one team, and data kept private to each service. If you meet an older company with an ESB, you are looking at the previous chapter of the same book.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What problem was SOA mainly trying to solve?',
      options: ['Many systems duplicating the same business data and logic', 'Web pages loading slowly on mobile phones', 'Developers being unable to use version control', 'Databases running out of disk space'],
      answer: 0,
      why: [null, 'That is a front-end performance problem, unrelated to SOA.', 'SOA is about how systems are structured, not tools.', 'Storage is not the concern here.'],
      explain: 'SOA offers each business capability, such as customers or billing, once as a shared service, so applications stop keeping their own conflicting copies.' },

    { type: 'match', after: 3, prompt: 'Match each SOA term to its meaning.',
      pairs: [['Service', 'A business capability offered to be called by others'], ['Contract', 'The published operations, inputs and outputs'], ['SOAP / WSDL', 'The classic XML message format and service description'], ['Enterprise service bus', 'Central middleware that routes, translates and orchestrates']],
      explain: 'Services provide capabilities, contracts describe them, and the bus carries and adapts the conversations between them.' },

    { type: 'bucket', prompt: 'Which description fits classic SOA, and which fits microservices?', buckets: ['Classic SOA', 'Microservices'],
      items: [['Smart central bus does routing and orchestration', 0], ['Each service owns its own database', 1], ['Enterprise-wide reuse is the main goal', 0], ['Small team owns a service end to end', 1], ['Standards decided by a central committee', 0], ['Simple pipes and smart services', 1]],
      explain: 'SOA centralised intelligence and standards in the hope of reuse. Microservices push intelligence and ownership out to small teams.' },

    { type: 'tf', statement: 'In classic SOA, the service bus was designed to be a thin, dumb pipe that did almost nothing.', answer: false,
      explain: 'The opposite. The ESB was where routing, translation, orchestration and security lived, which is why it grew into a bottleneck. “Dumb pipes” is the microservices slogan.' },

    { type: 'multi', q: 'Which problems did many SOA estates run into?',
      options: ['The service bus became a central bottleneck and single point of failure', 'Large, general services needed approval from many teams to change', 'Heavy standards slowed down delivery', 'Contracts made services impossible to describe', 'Services could not talk to each other at all'],
      answers: [0, 1, 2],
      explain: 'A central smart bus, shared services and heavy governance all created waiting. Contracts themselves were a strength, and services could talk, just slowly.' },

    { type: 'short', q: 'What is the name of the central middleware in classic SOA that routes, translates and orchestrates (three words, or its three-letter abbreviation)?', accept: ['ESB', 'enterprise service bus'], hint: 'Starts with E.',
      explain: 'The **enterprise service bus** was the switchboard of the SOA estate, and its growing cleverness was its downfall.' },

    { type: 'scenario', title: 'Inheriting an ESB', intro: 'You join a bank with a decade-old SOA. Everything goes through one service bus run by a central team. Releases are slow, because every change to a business process means a ticket to that team.',
      meters: { 'delivery speed': 25, risk: 30 },
      steps: [
        { text: 'The head of engineering wants faster delivery. Where do you start?',
          choices: [
            { label: 'Move one business process out of the bus into the team that owns the service, behind its existing contract', score: 2, effects: { 'delivery speed': 25, risk: -5 }, feedback: 'A small, reversible step. The contract stays, so callers notice nothing, while one team stops queueing on the bus team.' },
            { label: 'Rewrite the whole estate as microservices in one big-bang project', score: 0, effects: { 'delivery speed': -25, risk: 40 }, feedback: 'A giant rewrite of a working bank carries huge risk and a long delay before any benefit appears.' },
            { label: 'Hire more people for the central bus team', score: 1, effects: { 'delivery speed': 5 }, feedback: 'It shortens the queue a little but leaves a central choke point and single point of failure in place.' }
          ] },
        { text: 'A team asks whether to keep sharing one database between three services, as always.',
          choices: [
            { label: 'Give each service its own data, and let others reach it only through its contract', score: 2, effects: { risk: -10, 'delivery speed': 10 }, feedback: 'Shared tables let one team’s schema change break another service. Private data makes the contract a real boundary.' },
            { label: 'Keep sharing. It is easier, and it works today', score: 1, effects: { risk: 10 }, feedback: 'Fine as a short-term compromise. But the services stay tied together through the tables, no matter what the contracts say.' }
          ] }
      ],
      outro: 'Evolve towards smaller, independently owned services step by step, keeping the good ideas: contracts and business-capability boundaries.' },

    { type: 'explain', prompt: 'Explain to a colleague why SOA’s central service bus helped at first but hurt later.',
      model: 'The bus put routing, translation and process logic in one place, so services stayed simple and processes could change without touching them. But the bus became a shared god component: every change queued on one team, and if it failed, everything failed. Microservices respond by keeping the pipes dumb and the logic in small, owned services.',
      keywords: ['bus', 'central', 'bottleneck', 'single point of failure', 'ownership', 'dumb pipes'] }
  ],

  flashcards: [
    { q: 'What is service-oriented architecture (SOA)?', a: 'Offering business capabilities, such as customers or billing, once, as shared services with published contracts that applications across a company call.' },
    { q: 'What is an enterprise service bus?', a: 'Central middleware that routes messages, translates formats, orchestrates processes and handles security between services.' },
    { q: 'What is a service contract?', a: 'The published description of a service’s operations and data, so callers can use it without knowing its insides.' },
    { q: 'How does SOA differ from microservices?', a: 'SOA is enterprise-wide, with a smart central bus and shared services. Microservices use simple pipes, small team-owned services and private data.' },
    { q: 'What lessons did SOA teach?', a: 'Design around business capabilities and contracts. Avoid a central smart bus, heavy governance and widely shared data.' }
  ],

  glossary: [
    { term: 'Service-oriented architecture', def: 'An approach where business capabilities are offered as reusable services with published contracts, usually joined through central middleware.', like: 'A firm with specialist desks any department can phone.', aka: ['SOA'] },
    { term: 'Business capability', def: 'Something the business does, such as billing or customer management, as opposed to a technical layer.', like: 'A department, not a job title.' },
    { term: 'Service contract', def: 'A published description of what a service offers and the data it accepts and returns.', like: 'The form you must fill in to use an office desk.' },
    { term: 'Enterprise service bus', def: 'Central software that routes, transforms and coordinates messages between the services of a company.', like: 'The company switchboard.', aka: ['ESB'] },
    { term: 'SOAP', def: 'An XML-based message format widely used in classic SOA, often described with a WSDL file.', like: 'A very formal letter with a strict template.' }
  ],

  takeaways: [
    'SOA: offer each **business capability once** as a shared service with a **contract**.',
    'The **ESB** put smarts in the middle, and became a bottleneck and single point of failure.',
    'Microservices keep the good parts (contracts, capabilities) and fix the rest: dumb pipes, small owned services, private data.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-microservices', {
  eli5: 'Microservices split one big application into many small programs that each do one job, are looked after by one small team, and can be updated without touching the others.',

  cards: [
    { kind: 'concept', title: 'Forty developers, one release train',
      body: `A shop's website is one big program: search, basket, payments, accounts, recommendations. Forty developers work on it. To fix a typo in the basket, they must rebuild, test and redeploy **everything**. Release day is once a fortnight and everyone is nervous. A memory leak in recommendations takes down payments.

        **Microservices** answer this by cutting the application into many small programs, each running on its own and doing one job. The basket is a service. Payments is a service. Each is built, tested and released **independently**.

        Services talk to each other over the network, using the ideas you met in API Design and Messaging.` },

    { kind: 'metaphor', title: 'A department store vs a high street',
      body: `A monolith is a **department store**. One building, one set of tills, one opening time. A fire in the shoe department closes the whole shop, and changing the opening hours of the café means changing them for everyone.

        Microservices are a **high street** of independent shops. The baker opens early, the bookshop stays late, the café changes its menu on a whim. If one shop has a fire, the others carry on trading.

        But customers now have to walk between shops, and the shops must agree on practical things like where deliveries go. The freedom has a running cost, which is what the next lesson is about.` },

    { kind: 'diagram', title: 'A shop as microservices',
      body: 'Each service has one job, its own code, and, importantly, its **own data**.',
      nodes: [
        { id: 'gw', label: 'Entry point', icon: '🚪', x: 1, y: 0, tone: 'info' },
        { id: 'cat', label: 'Catalogue', x: 0, y: 1, tone: 'accent' },
        { id: 'ord', label: 'Orders', x: 1, y: 1, tone: 'accent' },
        { id: 'pay', label: 'Payments', x: 2, y: 1, tone: 'accent' },
        { id: 'cdb', label: 'Catalogue DB', icon: '🗄️', x: 0, y: 2, tone: 'muted' },
        { id: 'odb', label: 'Orders DB', icon: '🗄️', x: 1, y: 2, tone: 'muted' },
        { id: 'pdb', label: 'Payments DB', icon: '🗄️', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'gw', to: 'cat' }, { from: 'gw', to: 'ord' }, { from: 'ord', to: 'pay', label: 'charge' },
        { from: 'cat', to: 'cdb' }, { from: 'ord', to: 'odb' }, { from: 'pay', to: 'pdb' }
      ] },

    { kind: 'concept', title: 'Small services, small teams',
      body: `The unit of a microservice is not lines of code. It is **ownership**: one small team (often "two pizzas" is the joke) owns a service from idea to production, including waking up when it breaks.

        That team can choose how to build it, release it when it is ready, and change it without a meeting with the other thirty-nine developers. Teams are organised around **business capabilities** ("the checkout team"), not technical layers ("the database team").

        A reasonable size for a service is "one team can understand all of it", and "a rewrite would take weeks, not years". There is no agreed line count, and anyone who quotes one is guessing.` },

    { kind: 'concept', title: 'Independent deployment is the real prize',
      body: `If you remember one thing, remember this test: **can you deploy this service on its own, at any time, without coordinating with anyone?**

        If yes, you have microservices' main benefit: small, frequent, low-risk releases. A bug is isolated to a small change, and rolling back one service is easy.

        If your "services" must always be released together, in a set order, you have a **distributed monolith**: all of the complexity and none of the benefit. The next lesson goes into how that happens.

        Independent deployment needs stable **contracts** between services, so one team can change its insides without breaking callers.` },

    { kind: 'concept', title: 'A database per service',
      body: `Each service keeps its **own data store**, and no other service touches it. If Orders needs a product's price, it **asks** the Catalogue service. It does not peek into the Catalogue's tables.

        Why so strict? A shared database is a hidden contract. If the Catalogue team renames a column, the Orders service breaks and nobody was told. Private data turns the service's API into the **only door**.

        It also lets each service choose the right tool: a search index for catalogue, a relational database for payments, a cache for sessions.

        The price: you can no longer join across services with one SQL query, or wrap a change in several services in a single transaction. We return to this next lesson.` },

    { kind: 'sequence', title: 'Synchronous vs asynchronous calls',
      body: 'Services talk in two basic ways. Compare what happens when Payments is slow.',
      actors: ['Orders', 'Payments', 'Queue', 'Emails'],
      steps: [
        { from: 0, to: 1, label: 'charge £30, wait…', note: '**Synchronous**: Orders sends a request (HTTP or gRPC) and **waits** for the reply. Simple to follow, but Orders is stuck if Payments is slow.' },
        { from: 1, to: 0, label: 'charged', dashed: true, note: 'The reply arrives and Orders carries on. Use this when the caller needs the answer right now.' },
        { from: 0, to: 2, label: 'OrderPlaced event', note: '**Asynchronous**: Orders drops a message on a queue and carries on without waiting.' },
        { from: 2, to: 3, label: 'deliver event', note: 'The Emails service picks it up when it is ready, maybe a second later, maybe after a restart.' },
        { at: 3, label: 'send the receipt', note: 'Orders does not know or care. Emails can be down for an hour without slowing a single order.' }
      ] },

    { kind: 'story', title: 'Conway’s law, in a sentence',
      body: `In the late 1960s, Melvin Conway observed that organisations design systems that mirror their own communication structure. In practice: **if you have four teams, you will end up with four parts, and the boundaries between them will look like the boundaries between the teams.**

        Microservices lean on this on purpose. Some teams even do the "inverse Conway manoeuvre": decide the architecture you want, then arrange the teams to match.

        The warning goes the other way too. If the teams are badly arranged, the services will be too. You cannot draw clean service boundaries around an organisation that cannot make decisions independently.` },

    { kind: 'compare', title: 'What you gain, and what you pay',
      body: 'Microservices trade code complexity for operational complexity.',
      cols: ['You gain', 'You pay'],
      rows: [
        ['Releases', 'Small, frequent, independent deployments', 'Dozens of pipelines and versions to keep track of'],
        ['Scaling', 'Scale only the busy service', 'You need infrastructure to run and find many services'],
        ['Faults', 'A failure can be contained', 'A failure can also spread, in new ways'],
        ['Teams', 'Autonomy and clear ownership', 'Cross-team features need agreed contracts'],
        ['Technology', 'Each team picks its tools', 'More technologies to learn and operate']
      ] }
  ],

  activities: [
    { type: 'mcq', after: 4, q: 'What is the strongest sign that you really have microservices rather than a distributed monolith?',
      options: ['Each service can be deployed on its own, at any time', 'There are more than twenty services', 'Every service uses a different programming language', 'All services share one database'],
      answer: 0,
      why: [null, 'You can have many services that still must be deployed together.', 'Language variety is optional, and not the point.', 'A shared database ties services together.'],
      explain: 'Independent deployment is the defining benefit. If services must be released together, you carry the costs of distribution without the gains.' },

    { type: 'tf', after: 5, statement: 'In a microservice architecture, the Orders service should read the Catalogue service’s database tables directly, as that is fastest.', answer: false,
      explain: 'Reading another service’s tables creates a hidden contract. Orders should ask the Catalogue service through its API so the Catalogue team can change its schema freely.' },

    { type: 'bucket', after: 6, prompt: 'Should this call be synchronous or asynchronous?', buckets: ['Synchronous', 'Asynchronous'],
      items: [['Show the customer their basket total right now', 0], ['Send a “thanks for your order” email', 1], ['Check that a card is valid before accepting an order', 0], ['Update the recommendation engine with a new purchase', 1], ['Look up the price of a product to display', 0], ['Notify the warehouse of a new order', 1]],
      explain: 'If the caller cannot continue without the answer, it is synchronous. If the work can happen later, a message on a queue keeps services decoupled and tolerant of delays.' },

    { type: 'multi', q: 'Which of these describe microservices done well?',
      options: ['A small team owns each service from code to production', 'A service’s data is reachable only through its API', 'Teams can release their service without asking other teams', 'All services must be deployed on the same day', 'One shared database holds everyone’s tables'],
      answers: [0, 1, 2],
      explain: 'Ownership, private data and independent releases are the core. Joint deployments and a shared database are signs of a distributed monolith.' },

    { type: 'match', prompt: 'Match each idea to what it means.',
      pairs: [['Independent deployment', 'Release one service without touching the others'], ['Database per service', 'Only one service reads or writes its data'], ['Conway’s law', 'System design mirrors the organisation’s communication'], ['Asynchronous call', 'Send a message and carry on without waiting'], ['Synchronous call', 'Send a request and wait for the reply']],
      explain: 'These are the core vocabulary of microservices. Most design arguments are about which of them you can truly afford.' },

    { type: 'ab', q: 'The Orders team needs product names for a receipt. Which approach is better?',
      a: { lang: 'js', label: 'Ask the owner', src: `
        const p = await catalogue.getProduct(id);
        receipt.name = p.name;` },
      b: { lang: 'js', label: 'Read their tables', src: `
        const row = await catalogueDb.query(
          'SELECT name FROM products WHERE id = ?', [id]);
        receipt.name = row.name;` },
      answer: 'a',
      explain: 'The first goes through the Catalogue’s published API, so the team can rename tables freely. The second quietly makes Orders depend on how Catalogue stores data.' },

    { type: 'order', prompt: 'Put these steps in a sensible order for splitting a shop into services.',
      items: ['Find the business capabilities (catalogue, orders, payments)', 'Give each one a small team that will own it', 'Give each service its own data and a published API', 'Set up independent build and deploy pipelines', 'Release one service without touching the others'],
      explain: 'Start from the business, then ownership, then data and contracts. Independent pipelines turn those boundaries into independent releases.' },

    { type: 'scenario', title: 'Splitting up the shop', intro: 'You are the architect of an online shop run as a monolith. Release day is fortnightly and painful. Management asks whether to “go microservices”.',
      meters: { 'release speed': 30, complexity: 25 },
      steps: [
        { text: 'The first service you extract should be…',
          choices: [
            { label: 'A part with clear boundaries and a team that wants to own it, such as email notifications', score: 2, effects: { 'release speed': 15, complexity: 10 }, feedback: 'A well-bounded, low-risk first step teaches the team how to deploy, monitor and run a service before betting the shop on it.' },
            { label: 'Everything at once, over a long weekend', score: 0, effects: { 'release speed': -20, complexity: 45 }, feedback: 'You have swapped one big risk for many small unknown ones, all at the same moment.' },
            { label: 'The tangled core of the shop that every other part uses', score: 1, effects: { complexity: 25, 'release speed': 5 }, feedback: 'It is where the pain is, but also the hardest piece to cut cleanly. Practise on something simpler first.' }
          ] },
        { text: 'The new service needs product data. How does it get it?',
          choices: [
            { label: 'Call the owner’s API (or listen for its events), never its database', score: 2, effects: { complexity: 5, 'release speed': 15 }, feedback: 'The contract is the only coupling, so both teams stay free to change their insides.' },
            { label: 'Connect to the monolith’s database “just for now”', score: 0, effects: { complexity: 20, 'release speed': -10 }, feedback: '“Just for now” becomes a permanent hidden dependency: the monolith cannot change tables without breaking the service.' }
          ] }
      ],
      outro: 'Move one slice at a time, protect the boundaries and measure whether releases really get faster.' },

    { type: 'explain', prompt: 'A manager says, “Microservices will make our app faster and simpler.” Explain what they actually buy you, and what they cost.',
      model: 'Microservices mainly buy team autonomy and independent deployment: small teams can release their own service often, and scale or fix it in isolation. They do not make the code simpler. You pay with network calls, distributed data, many pipelines and harder debugging, so they suit organisations with enough people and a real release bottleneck.',
      keywords: ['independent deployment', 'team', 'autonomy', 'network', 'complexity', 'operational'] }
  ],

  flashcards: [
    { q: 'What is a microservice?', a: 'A small, independently deployable service that does one business job, is owned by one team and runs on its own.' },
    { q: 'What is the main benefit of microservices?', a: 'Independent deployment: teams can release small changes to their own service without coordinating with everyone else.' },
    { q: 'Why does each service get its own database?', a: 'A shared database is a hidden contract. Private data forces all access through the service’s API, so teams can change internals freely.' },
    { q: 'Synchronous vs asynchronous communication?', a: 'Synchronous: send a request and wait for the reply. Asynchronous: send a message and carry on, usually through a queue.' },
    { q: 'What is Conway’s law?', a: 'Systems tend to mirror the communication structure of the organisation that builds them.' },
    { q: 'What do you pay for microservices?', a: 'Operational complexity: network failures, distributed data, many deployments and harder debugging.' }
  ],

  glossary: [
    { term: 'Microservice', def: 'A small service that does one business job, owns its own data and can be deployed independently by one team.', like: 'One independent shop on a high street.' },
    { term: 'Independent deployment', def: 'The ability to release one service without changing or redeploying others.', like: 'A shop changing its stock without closing the whole street.' },
    { term: 'Database per service', def: 'The rule that each service owns a private data store, reachable only through that service’s API.', like: 'Each shop keeping its own stockroom.' },
    { term: 'Conway’s law', def: 'The observation that organisations produce system designs that copy their own communication structure.', like: 'Four departments, four departments’ worth of software.' },
    { term: 'Synchronous communication', def: 'A call where the sender waits for the answer before continuing.', like: 'A phone call.' },
    { term: 'Asynchronous communication', def: 'A call where the sender leaves a message and carries on, with the reply or action coming later.', like: 'Leaving a note.' }
  ],

  takeaways: [
    'Microservices = **small services**, **small owning teams**, **independent deployment**.',
    '**One database per service**: others ask through the API, never read the tables.',
    'Use **synchronous** calls when you need the answer now, **asynchronous** messages when you do not.',
    'You buy team autonomy and pay with operational complexity. Next lesson: the bill.'
  ],

  links: [
    { label: 'Martin Fowler and James Lewis: Microservices', url: 'https://martinfowler.com/articles/microservices.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-microservices-hard', {
  eli5: 'Splitting an app into many small services makes each piece simpler but the whole thing harder: services must find each other, share data without a shared database, and survive each other’s failures.',

  cards: [
    { kind: 'story', title: 'The day the reviews took down the shop',
      body: `A shop runs forty microservices. One is "Reviews", which shows star ratings on product pages. On a busy Friday, Reviews' database slows down. Each request now takes thirty seconds instead of thirty milliseconds.

        The product page calls Reviews and **waits**. Waiting requests pile up, using up the page service's worker threads. Soon the page service cannot answer *anything*. The basket calls the page service and starts to wait too. Within minutes, the whole shop is down. A *star rating* took out the checkout.

        This is a **cascading failure**, and it is the hint of a larger truth: the conference talks show boxes and arrows. They rarely show what the arrows cost.` },

    { kind: 'metaphor', title: 'Turning to a colleague vs posting a letter',
      body: `In a monolith, calling the basket from the checkout is like turning to the colleague at the next desk: instant, and you know at once if they heard you. In code it is a function call that takes nanoseconds and almost never fails halfway.

        Between services, the same request is more like posting a letter to another office. The call crosses a network. It might be slow. It might time out, and you will not know whether the work was done. The other service might be down, restarting or in the middle of a deploy.

        Each arrow in the architecture diagram is now a place where things can go wrong. This is the gap between theory and practice that the Eight Fallacies of Distributed Computing warned about: "the network is reliable" and "latency is zero" are the two that bite first.

        Everything else in this lesson is a way of coping with this single fact.` },

    { kind: 'sequence', title: 'Service discovery: where does Payments live today?',
      body: 'Services run on machines that come and go. Hard-coding an address does not survive the first restart.',
      actors: ['Payments', 'Registry', 'Orders'],
      steps: [
        { from: 0, to: 1, label: 'I am up at 10.0.3.7', note: 'A new Payments instance starts and **registers** itself with a service registry.' },
        { from: 0, to: 1, label: 'heartbeat…', dashed: true, note: 'It keeps saying “still alive”. If the heartbeats stop, the registry removes it from the list.' },
        { from: 2, to: 1, label: 'where is Payments?', note: 'Orders needs to call Payments, and asks by **name**, not address.' },
        { from: 1, to: 2, label: '10.0.3.7 or 10.0.3.9', dashed: true, note: 'The registry returns the live instances. The caller picks one, typically by round-robin.' },
        { from: 2, to: 0, label: 'charge £30', note: 'Orders calls the instance directly. Tools like Consul and Eureka do this, and Kubernetes does the same job with built-in service names.' }
      ] },

    { kind: 'diagram', title: 'The API gateway: one front door',
      body: 'Outside clients should not need to know there are forty services behind the scenes.',
      nodes: [
        { id: 'app', label: 'Mobile app', icon: '📱', x: 1, y: 0, tone: 'info' },
        { id: 'gw', label: 'API gateway', icon: '🚪', x: 1, y: 1, tone: 'warn' },
        { id: 'a', label: 'Catalogue', x: 0, y: 2, tone: 'accent' },
        { id: 'b', label: 'Orders', x: 1, y: 2, tone: 'accent' },
        { id: 'c', label: 'Reviews', x: 2, y: 2, tone: 'accent' }
      ],
      edges: [
        { from: 'app', to: 'gw', label: 'one request' },
        { from: 'gw', to: 'a' }, { from: 'gw', to: 'b' }, { from: 'gw', to: 'c' }
      ],
      caption: 'The gateway routes requests, checks logins, applies rate limits and can combine several service replies into one.' },

    { kind: 'concept', title: 'Distributed data: no more single transaction',
      body: `In a monolith with one database, "place the order, reduce the stock, take payment" can be one **transaction**: all happen or none do.

        With a database per service, those three steps live in three services, and no transaction spans them. If payment succeeds but reducing the stock fails, who undoes the payment?

        The usual answer is a **saga**: a series of local steps, each with a **compensating action** that undoes it ("refund the payment"). You also accept **eventual consistency**: for a short while, different services disagree, then they catch up.

        You also lose cross-service joins. If a report needs orders and customers together, you must copy data or call both services.` },

    { kind: 'steps', title: 'How a cascade spreads, and how to stop it',
      body: 'The shop outage again, with the standard defences from the Resilience module.',
      steps: [
        { title: 'One service gets slow', body: 'Reviews starts taking 30 seconds. Nothing has crashed, which makes it harder to spot than an outage.' },
        { title: 'Callers wait and pile up', body: 'Each waiting request holds a thread or connection. They pile up until the caller has none left.' },
        { title: 'The caller becomes slow too', body: 'Its own callers now wait for it. The failure walks back up the chain.' },
        { title: 'Defence: timeouts and circuit breakers', body: 'Give up after a short time, and **stop calling** a failing service for a while. Show the page without ratings.' },
        { title: 'Defence: bulkheads', body: 'Give each dependency its own small pool of threads, so one slow neighbour cannot use them all.' }
      ] },

    { kind: 'concept', title: 'The distributed monolith',
      body: `The worst result is to get all the costs and none of the benefits. A **distributed monolith** looks like microservices on the diagram but behaves like one big program that happens to be spread across a network.

        Warning signs:

        - Services must be **deployed together** in a certain order.
        - A change to one often forces changes in several others.
        - Services share a database, or call each other in long **synchronous chains**.
        - One service going down takes everything with it.

        It usually happens when services are cut along technical lines instead of business capabilities, or when teams split the code before they understood where the boundaries really are.` },

    { kind: 'compare', title: 'When not to use microservices',
      body: 'Plenty of successful products are still happily modular monoliths. Ask what problem you are solving.',
      cols: ['Fine as a (modular) monolith', 'Microservices start to pay'],
      rows: [
        ['Team size', 'One team, or a few, who talk daily', 'Many teams stepping on each other'],
        ['Release pain', 'Deploys are quick and calm', 'One shared release train blocks everyone'],
        ['Scaling', 'The whole app scales together', 'Parts have very different loads'],
        ['Domain knowledge', 'Boundaries still unclear', 'Boundaries are well understood'],
        ['Operations', 'No platform or on-call maturity yet', 'Monitoring, tracing and automation are in place']
      ] },

    { kind: 'tip', title: 'Monolith first',
      body: `Martin Fowler and others have long argued for **monolith first**: start with a well-organised **modular monolith**, find where the real boundaries are as the product grows, and only then split out the parts that earn it. Several well-known companies that now run microservices began this way.

        This is a view, not a law, and some experienced teams do start with services. But a wrongly drawn boundary is far cheaper to fix inside one program than across a network, with a deployment pipeline on each side.

        In the lab that follows, you will let one slow service take down a chain, then add timeouts, breakers and bulkheads and watch the damage stay contained.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'In the story, why did a slow Reviews service take down the whole shop?',
      options: ['Waiting callers piled up and used up the threads above them', 'Reviews sent bad data that corrupted the other services', 'The network cable to the shop was cut', 'The gateway ran out of disk space'],
      answer: 0,
      why: [null, 'Nothing was corrupted. The problem was waiting.', 'The network was fine, just slow in one place.', 'Disk space was not the issue.'],
      explain: 'A slow dependency is often worse than a dead one: callers keep waiting, resources run out, and the failure spreads up the chain.' },

    { type: 'match', after: 3, prompt: 'Match each tool to the problem it solves.',
      pairs: [['Service registry', 'Finding the live instances of a service'], ['API gateway', 'One front door for outside clients'], ['Saga', 'Undoing earlier steps when a later one fails'], ['Circuit breaker', 'Stop calling a service that keeps failing'], ['Bulkhead', 'Stop one dependency using up all the threads']],
      explain: 'Each tool answers one specific pain of distribution. None of them is needed in a single program, which is part of the cost.' },

    { type: 'order', prompt: 'Put the stages of a cascading failure in order.',
      items: ['One service becomes slow', 'Callers wait and their requests pile up', 'The callers run out of threads and become slow too', 'Their callers wait, and the slowness spreads up the chain', 'Users see the whole product failing'],
      explain: 'Notice nothing crashed at the start. Slowness plus waiting is what spreads, which is why timeouts and circuit breakers matter.' },

    { type: 'spot', prompt: 'This product-page code can drag the whole page down. Tap the line that is the problem.',
      code: { lang: 'js', src: `
        async function productPage(id) {
          const product = await catalogue.get(id);
          const reviews = await reviewsService.get(id);
          const stock = await inventory.get(id);
          return { product, reviews, stock };
        }` },
      lines: [3],
      explain: 'The page waits for the optional reviews with no timeout and no fallback. If Reviews is slow, the entire page is slow. Give it a short timeout and render without ratings when it fails.' },

    { type: 'bucket', prompt: 'Healthy microservices, or a distributed monolith?', buckets: ['Healthy', 'Distributed monolith'],
      items: [['Each team releases its own service whenever it likes', 0], ['Services must be deployed together, in a set order', 1], ['Services share one database', 1], ['Calls to optional services have timeouts and fallbacks', 0], ['A change to one service usually forces changes in three more', 1], ['A service owns its data and exposes an API', 0]],
      explain: 'Healthy microservices are loosely coupled and independently releasable. A distributed monolith has all the coupling of a single program plus the network.' },

    { type: 'tf', statement: 'With one database per service, a single database transaction can still make “take payment, reduce stock, create order” all-or-nothing.', answer: false,
      explain: 'A normal database transaction cannot span separate databases. You need a saga with compensating actions, and you accept eventual consistency in between.' },

    { type: 'multi', q: 'Which are typical jobs of an API gateway?',
      options: ['Routing requests to the right service', 'Checking logins and applying rate limits', 'Combining several service replies into one response', 'Storing each service’s private data', 'Replacing the need for timeouts in every service'],
      answers: [0, 1, 2],
      explain: 'A gateway is the shared front door. It does not hold service data, and services still need their own timeouts and breakers.' },

    { type: 'scenario', title: 'The startup that wants to “do it properly”', intro: 'A team of six has a new product and no customers yet. The CTO wants to start with twelve microservices “so we never have to rewrite”. You are asked for your view.',
      meters: { 'speed to market': 50, 'operational load': 30 },
      steps: [
        { text: 'What do you recommend?',
          choices: [
            { label: 'Start with a modular monolith, with clear internal boundaries, and split out parts later if they earn it', score: 2, effects: { 'speed to market': 25, 'operational load': -5 }, feedback: 'You keep the option of splitting while the boundaries are still being discovered. It is cheaper to move a line inside one program than between services.' },
            { label: 'Twelve services from day one, each with its own database and pipeline', score: 0, effects: { 'speed to market': -30, 'operational load': 40 }, feedback: 'Six people now run twelve deployments, a registry and distributed data, before the product has proved anyone wants it.' },
            { label: 'A single tangled program with no internal structure', score: 1, effects: { 'speed to market': 15, 'operational load': -5 }, feedback: 'Fast at first, but without internal boundaries you will be unable to split anything later. A monolith should still be modular.' }
          ] },
        { text: 'A year on, one part (image processing) needs far more computing power than the rest and keeps destabilising the app. What now?',
          choices: [
            { label: 'Extract just that part as a service behind a clear contract', score: 2, effects: { 'operational load': 10, 'speed to market': 10 }, feedback: 'A concrete, measurable reason to split. You pay the distribution costs for one part that benefits.' },
            { label: 'Split everything now, for consistency', score: 0, effects: { 'operational load': 35, 'speed to market': -15 }, feedback: 'The pain was in one part. Splitting the other eleven adds cost with no matching gain.' }
          ] }
      ],
      outro: 'Earn each service. Split for a concrete pain (team friction, scaling, release speed), not for fashion.' },

    { type: 'explain', prompt: 'Give a friend three things that get harder when you move from a monolith to microservices, and say how each is usually handled.',
      model: 'First, finding services as instances come and go: a service registry or built-in naming. Second, data consistency without cross-service transactions: sagas and eventual consistency. Third, failures that spread: timeouts, circuit breakers and bulkheads. Also, one front door for clients is handled by an API gateway.',
      keywords: ['discovery', 'registry', 'saga', 'eventual consistency', 'timeout', 'circuit breaker', 'gateway'] }
  ],

  flashcards: [
    { q: 'What is service discovery?', a: 'A way for services to find the current addresses of other services by name, via a registry, because instances come and go.' },
    { q: 'What does an API gateway do?', a: 'It is the single entry point for clients: routes requests, checks logins, applies rate limits and can combine replies.' },
    { q: 'Why can’t one database transaction cover several services?', a: 'Each service owns a separate database. Use a saga of local steps with compensating actions and accept eventual consistency.' },
    { q: 'What is a cascading failure?', a: 'A slowdown or failure in one service spreads to the services that wait on it, and onwards up the chain.' },
    { q: 'What is a distributed monolith?', a: 'Services that are tightly coupled, deployed together or sharing a database: all of the costs of distribution with none of the benefits.' },
    { q: 'What does “monolith first” advise?', a: 'Start with a modular monolith, learn where the real boundaries are, and split out services only when there is a clear need.' }
  ],

  glossary: [
    { term: 'Service discovery', def: 'The mechanism by which services find the current network locations of other services, usually through a registry.', like: 'Looking up a friend in a directory that updates when they move.' },
    { term: 'API gateway', def: 'A single entry point that receives outside requests and routes them to the right internal services.', like: 'The reception desk of an office building.' },
    { term: 'Saga', def: 'A way to run a business process across services as a series of local steps, each with a compensating action to undo it if a later step fails.', like: 'Booking a holiday: if the hotel fails, cancel the flight.' },
    { term: 'Eventual consistency', def: 'The state where different parts of a system may briefly disagree but will agree if given time without new changes.', like: 'News spreading through a village.' },
    { term: 'Cascading failure', def: 'A failure that spreads from one component to others that depend on it.', like: 'A row of dominoes.' },
    { term: 'Distributed monolith', def: 'A system split into services that are still so tightly coupled that they must change and deploy together.', like: 'A jigsaw glued back together, then posted in pieces.' }
  ],

  takeaways: [
    'Every arrow is now a **network call**: slow, failing or unsure.',
    'You need **discovery**, a **gateway**, **sagas** for data and **timeouts, breakers and bulkheads** for failures.',
    'If services must deploy together or share a database, you have a **distributed monolith**.',
    'Often the wise start is a **modular monolith**. Split only for a concrete pain.'
  ],

  links: [
    { label: 'Martin Fowler: Monolith First', url: 'https://martinfowler.com/bliki/MonolithFirst.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-serverless', {
  eli5: 'Serverless means you write small functions and a cloud provider runs them only when needed, and charges you only for the moments they run, so you never look after a server yourself.',

  cards: [
    { kind: 'concept', title: 'You wanted a function, you got a computer',
      body: `You have written one small piece of code: when someone uploads a photo, make a thumbnail. To run it, the traditional route is: rent a server, install an operating system, patch it, set up scaling for busy days, pay for it 24 hours a day, and wake up when it falls over. All for ten seconds of work per photo.

        **Serverless** asks: what if you just handed the cloud provider the function, and **they** dealt with the rest?

        There *are* servers, of course. They are simply not your problem. You do not pick them, patch them or watch them. The name describes your experience, not the hardware.` },

    { kind: 'metaphor', title: 'A taxi, not a car',
      body: `Owning a car means paying for it every day, including the days it sits in a garage. You also service it, insure it and park it.

        A taxi is paid **per journey**. Nobody asks you to maintain it. If a hundred friends all want a ride at once, the taxi company sends a hundred cars. If nobody wants one, you pay nothing.

        Serverless is the taxi. The metaphor stops at the journey itself: a taxi may arrive a few minutes late, and you cannot drive it for ten hours straight. Serverless has its own versions of both, which we meet below.` },

    { kind: 'sequence', title: 'One photo upload, serverless style',
      body: 'Nobody started a server. Watch what the platform does for you.',
      actors: ['User', 'Storage', 'Platform', 'Function'],
      steps: [
        { from: 0, to: 1, label: 'upload photo.jpg', note: 'The user uploads straight to cloud file storage.' },
        { from: 1, to: 2, label: 'event: new file', note: 'The storage service emits an **event trigger**: “a file was created.”' },
        { from: 2, to: 3, label: 'start function', note: 'The platform finds or creates a place to run your function. If none is warm, this takes a moment (the **cold start**).' },
        { at: 3, label: 'make thumbnail', note: 'Your code runs for a second or two, then finishes.' },
        { from: 3, to: 1, label: 'save thumb.jpg', note: 'The function writes its result back to storage.' },
        { note: 'The bill: the milliseconds your code ran, times its memory. If nobody uploads for a week, the bill for that week is zero.' }
      ] },

    { kind: 'concept', title: 'Functions as a service, and paying per call',
      body: `The core idea is called **Functions as a Service** (**FaaS**). AWS Lambda, Google Cloud Functions and Azure Functions are the well-known examples.

        - You write one function and give it a **trigger**.
        - The platform runs it **on demand**, one copy per request if needed, then lets it go.
        - You pay by **invocation** and by how long and how much memory it used, usually in tiny slices. There is often a generous free allowance.

        This suits **spiky or unpredictable** work. A site that gets ten visits at night and ten thousand at lunchtime does not need a server idling all night, or one that is too small at noon.` },

    { kind: 'concept', title: 'Triggers: what wakes a function up',
      body: `A function never sits and waits. Something **fires** it. Typical triggers:

        - **An HTTP request**, via an API gateway: a tiny web API with no server of yours
        - **A file arriving** in cloud storage
        - **A message** landing on a queue or topic
        - **A timer**, like "every night at 2am"
        - **A database change**, such as a new row

        Notice the pattern: this is **event-driven architecture** from the previous module, with the cloud provider running the handlers for you. Serverless and events are natural partners.` },

    { kind: 'compare', title: 'Cold starts and limits: the small print',
      body: 'Serverless is wonderful until you hit one of these edges. Exact numbers differ by provider and change over time, so check the current docs.',
      cols: ['What happens', 'What to do'],
      rows: [
        ['Cold start', 'A function that has not run lately takes extra time to boot before it runs', 'Keep functions small, avoid heavy start-up work, or pay to keep some warm'],
        ['Time limit', 'Functions are cut off after a maximum duration (minutes, not hours)', 'Split long jobs into steps, or use something else for them'],
        ['Memory and size limits', 'There are caps on memory and package size', 'Keep dependencies lean'],
        ['Stateless', 'Nothing in memory is guaranteed to be there next time', 'Keep state in a database, cache or storage'],
        ['Vendor lock-in', 'Triggers and tools are tied to one cloud', 'Keep business logic separate from glue code']
      ] },

    { kind: 'code', title: 'A function is just a function',
      body: 'This is roughly what an HTTP-triggered function looks like. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        // Runs only when a request arrives.
        exports.handler = async (event) => {
          const name = event.queryStringParameters.name || 'world';

          return {
            statusCode: 200,
            body: JSON.stringify({ greeting: 'Hello, ' + name }),
          };
        };`,
        notes: {
          2: 'You export a **handler**. The platform calls it for each event and decides when to start and stop it.',
          3: 'The **event** describes what triggered the function: here, the HTTP request.',
          5: 'You return a response. There is no server, port or listening loop in your code. When this returns, you stop paying: nothing is left running.'
        } } },

    { kind: 'concept', title: 'Backend as a service: even less to write',
      body: `**Backend as a Service** (**BaaS**) goes a step further. Instead of writing functions, you use ready-made, hosted back-end parts: a database, user sign-in, file storage and push notifications, all through an SDK, with no server code of your own. Firebase and Supabase are well-known examples.

        FaaS means *"run my code without servers"*. BaaS means *"I do not even need to write that code"*. They are often combined: BaaS for the standard bits, functions for the custom logic.

        The trade-off is control. You work within what the provider offers, and moving away later can be painful.` },

    { kind: 'tip', title: 'When serverless fits, and when it does not',
      body: `**A good fit:** spiky traffic, glue between cloud services, background jobs, scheduled tasks, prototypes, and small teams that do not want to run infrastructure.

        **A poor fit:** steady, heavy traffic all day (renting a server may be cheaper), long-running jobs, workloads that need very low and predictable latency, and anything needing unusual software or hardware.

        Costs can surprise you in both directions: it is almost free at small scale and can be pricey at large, constant scale. It is an operating model, not a better or worse one. As ever, do the sums for **your** traffic.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What does “serverless” actually mean?',
      options: ['Servers exist, but you do not provision or manage them', 'The code runs on the user’s phone instead', 'There are no computers involved at all', 'The application has no back end'],
      answer: 0,
      why: [null, 'Serverless code still runs in the provider’s data centres.', 'Of course there are computers. The provider runs them.', 'There is still a back end. You just do not operate its servers.'],
      explain: 'The word describes your experience: no servers to rent, patch or scale. They are the provider’s concern.' },

    { type: 'order', after: 2, prompt: 'Put a serverless photo upload in order.',
      items: ['The user uploads a photo to cloud storage', 'The storage service fires an event', 'The platform starts a function to handle it', 'The function creates a thumbnail', 'The function stops and the billing for it ends'],
      explain: 'The event is the trigger, the platform does the starting and stopping, and you pay only for the time the function actually ran.' },

    { type: 'tf', after: 5, statement: 'A serverless function can safely keep a user’s shopping basket in a variable in memory and find it on the next request.', answer: false,
      explain: 'Functions are stateless: the next request may run on a different copy, or a fresh one. Keep state in a database, cache or storage.' },

    { type: 'estimate', q: 'A function runs 3 million times a month and each run is billed for about 0.2 seconds. Roughly how many seconds of compute time are billed in total?', answer: 600000, unit: 'seconds', tolerance: 2,
      explain: '3,000,000 × 0.2 = 600,000 seconds, about 7 days of continuous running spread over a month. Providers also scale the charge by memory, but this is the rough idea: pay for time used, not for idle hours.' },

    { type: 'bucket', prompt: 'Good fit for serverless, or better on a regular server?', buckets: ['Serverless fits', 'Better on a server'],
      items: [['Resize images when they are uploaded', 0], ['A nightly job that emails a summary', 0], ['A site with huge, steady traffic 24 hours a day', 1], ['A task that must run for several hours', 1], ['A small API used a few hundred times a day', 0], ['A trading engine needing steady, very low latency', 1]],
      explain: 'Spiky, short, event-driven work suits serverless. Steady heavy load, long jobs and strict latency favour servers you control.' },

    { type: 'multi', q: 'Which of these can trigger a serverless function?',
      options: ['An HTTP request via an API gateway', 'A new file in cloud storage', 'A message on a queue', 'A timer such as “every night at 2am”', 'Nothing. Functions run continuously by themselves'],
      answers: [0, 1, 2, 3],
      explain: 'Functions are event-driven: something must fire them. If nothing triggers a function, it does not run, and you are not billed.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['FaaS', 'Run your own functions on demand'], ['BaaS', 'Use ready-made hosted back-end services'], ['Cold start', 'Extra delay when a function has to boot'], ['Trigger', 'The event that starts a function'], ['Stateless', 'Nothing is remembered between runs']],
      explain: 'FaaS is about running your code, BaaS about not writing it. Cold starts and statelessness are the two most common surprises.' },

    { type: 'scenario', title: 'Pick the platform for a ticket-sale spike', intro: 'You run a small events site. For 364 days a year it gets a trickle of traffic. On the day a big concert goes on sale, thousands of people arrive in the same minute.',
      meters: { cost: 60, reliability: 40 },
      steps: [
        { text: 'How should you run the ticket-browsing API?',
          choices: [
            { label: 'Serverless functions behind an API gateway, which scale out on demand', score: 2, effects: { cost: 15, reliability: 25 }, feedback: 'It is nearly free on quiet days and the platform adds capacity during the spike. Watch the database, which still has its own limits.' },
            { label: 'One large server running all year for the busiest minute', score: 0, effects: { cost: -30, reliability: 5 }, feedback: 'You pay for a huge machine that idles 364 days, and it may still be overwhelmed by the rush.' },
            { label: 'One small server to keep costs low', score: 0, effects: { cost: 10, reliability: -30 }, feedback: 'Cheap, until the spike. Then it falls over exactly when the money is being made.' }
          ] },
        { text: 'Users complain that the first request after a quiet spell takes a couple of seconds. What is happening, and what do you do?',
          choices: [
            { label: 'It is a cold start. Slim the function down, and consider keeping a few instances warm for key paths', score: 2, effects: { reliability: 15, cost: -5 }, feedback: 'You understand the trade: cold starts are the price of paying only for use, and can be reduced for the paths that matter most.' },
            { label: 'The code is broken. Rewrite the whole thing on a server', score: 0, effects: { cost: -20, reliability: -5 }, feedback: 'The code is fine. A delay on the first call after idle time is a known property of the model.' },
            { label: 'Ignore it, as users will get used to it', score: 1, effects: { reliability: -10 }, feedback: 'For a background job that is fine. For the first page a customer sees, it is a lost sale.' }
          ] }
      ],
      outro: 'Serverless shines for spiky, event-driven work. Know its edges, such as cold starts and limits, and you can use it with confidence.' },

    { type: 'explain', prompt: 'Explain serverless to a friend who runs a bakery, including one big advantage and one catch.',
      model: 'You hand the cloud provider small pieces of code and they run them only when something triggers them, like a taxi you pay for per journey instead of a car you own. The advantage is no servers to look after and paying only for use. A catch is cold starts and limits: the first run after a quiet spell can be slow, and functions have time and size caps.',
      keywords: ['function', 'trigger', 'pay', 'per use', 'cold start', 'limits', 'no servers'] }
  ],

  flashcards: [
    { q: 'What is serverless?', a: 'A model where the cloud provider runs and scales your code on demand, and you pay for use. Servers exist but you do not manage them.' },
    { q: 'What is FaaS?', a: 'Functions as a Service: you deploy single functions, and the platform runs one when an event triggers it. AWS Lambda is an example.' },
    { q: 'What is a cold start?', a: 'The extra delay when the platform has to prepare a new instance of a function that has not run recently.' },
    { q: 'What is BaaS?', a: 'Backend as a Service: ready-made hosted back-end parts, such as a database and sign-in, used through an SDK. Firebase and Supabase are examples.' },
    { q: 'When does serverless fit poorly?', a: 'Steady heavy traffic, long-running jobs, strict low latency, or workloads needing special software or hardware.' }
  ],

  glossary: [
    { term: 'Serverless', def: 'A way of running software where the provider manages the servers and scaling, and you are billed for what you use.', like: 'A taxi rather than a car.' },
    { term: 'Function as a Service', def: 'A service that runs individual functions on demand in response to events, charging per invocation.', like: 'Paying per journey.', aka: ['FaaS'] },
    { term: 'Cold start', def: 'The extra time a function takes to start when no ready instance exists.', like: 'A taxi arriving from across town instead of waiting outside.' },
    { term: 'Event trigger', def: 'The thing that causes a function to run, such as an HTTP request, a new file, a message or a timer.', like: 'A doorbell.' },
    { term: 'Backend as a Service', def: 'Hosted ready-made back-end features, such as a database, authentication and storage, that apps use without writing server code.', like: 'Hiring a catering firm instead of cooking.', aka: ['BaaS'] }
  ],

  takeaways: [
    '**Serverless**: you write functions, the provider runs and scales them, and you pay per use.',
    'Functions wake up on **triggers** (requests, files, messages, timers) and must be **stateless**.',
    'Watch **cold starts**, **time and size limits** and lock-in.',
    'Great for spiky or event-driven work. Not for steady heavy load or long jobs.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-service-mesh', {
  eli5: 'A service mesh gives every small service its own helper that handles the networking chores, like retries, encryption and routing, so developers do not have to write them into every service.',

  cards: [
    { kind: 'concept', title: 'The same chores in forty services',
      body: `You have forty microservices. Every one of them needs the same networking chores:

        - retry a call that failed, but not forever
        - give up after a timeout
        - encrypt traffic and check who is on the other end
        - record how long each call took
        - stop calling a service that is clearly broken

        Each team codes these into their service, in their own language, with their own bugs. The Java services retry three times, the Go ones five, and one team forgot timeouts altogether (hello, cascading failure). Updating the policy means changing and redeploying forty services.

        A **service mesh** moves these chores **out of your code** and into the infrastructure.` },

    { kind: 'metaphor', title: 'A personal assistant for every employee',
      body: `Imagine every employee in a company gets a personal assistant who handles **all their phone calls**. When Priya wants to talk to Finance, she tells her assistant. The assistant finds the right person, checks their identity, redials if the line is busy, notes how long the call took, and gives up politely after a minute.

        Priya just does her job. Management can change the calling policy ("always verify identity") by briefing the assistants, without retraining any employee.

        The metaphor stops at cost: forty employees now means forty assistants, who also need desks, salaries and time, and the extra hop makes every call take slightly longer.` },

    { kind: 'diagram', title: 'Sidecars and the two planes',
      body: 'Every service gets a small **sidecar proxy** running next to it. All traffic goes through the proxies. A separate brain tells them what to do.',
      nodes: [
        { id: 'cp', label: 'Control plane', icon: '🧠', x: 1, y: 0, tone: 'warn' },
        { id: 'pa', label: 'Proxy', x: 0, y: 1, tone: 'good' },
        { id: 'pb', label: 'Proxy', x: 2, y: 1, tone: 'good' },
        { id: 'sa', label: 'Orders service', x: 0, y: 2, tone: 'accent' },
        { id: 'sb', label: 'Payments service', x: 2, y: 2, tone: 'accent' }
      ],
      edges: [
        { from: 'cp', to: 'pa', label: 'config, certs', dashed: true },
        { from: 'cp', to: 'pb', dashed: true },
        { from: 'sa', to: 'pa', label: 'local', both: true },
        { from: 'pa', to: 'pb', label: 'encrypted', both: true },
        { from: 'pb', to: 'sb', label: 'local', both: true }
      ],
      caption: 'The proxies together form the data plane: they carry the real traffic.' },

    { kind: 'concept', title: 'Data plane and control plane',
      body: `The mesh has two parts, and the names appear in every discussion of it:

        - The **data plane** is the set of **sidecar proxies**. They sit beside each service instance and handle every request in and out. A very common proxy is **Envoy**.
        - The **control plane** is the management layer. It does not touch your requests. It **tells the proxies what to do**: the routing rules, the retry policy, the security certificates.

        The same split exists in a road system: the cars and roads are the data plane; the traffic-light programme is the control plane.

        **Istio** and **Linkerd** are the two best-known meshes. Istio uses Envoy as its proxy, and Linkerd uses its own lightweight one.` },

    { kind: 'sequence', title: 'One call through the mesh',
      body: 'Orders calls Payments. Notice what the Orders code did not have to do.',
      actors: ['Orders', 'Proxy A', 'Proxy B', 'Payments'],
      steps: [
        { from: 0, to: 1, label: 'plain call: charge', note: 'Orders makes an ordinary, unencrypted call to localhost. It knows nothing about the mesh.' },
        { from: 1, to: 2, label: 'encrypted, certificate shown', note: 'Proxy A finds a healthy Payments instance, sets up an encrypted connection and proves who it is.' },
        { at: 2, label: 'check: may Orders call me?', note: 'Proxy B checks the certificate and the access policy before letting anything through.' },
        { from: 2, to: 3, label: 'plain call', note: 'The request reaches Payments. If it fails, Proxy A can retry on another instance.' },
        { from: 3, to: 0, label: 'reply', dashed: true, note: 'Both proxies record timing and status, so you get metrics and traces for every call without changing the services.' }
      ] },

    { kind: 'concept', title: 'What you get “for free”',
      body: `Once every request goes through a proxy, a whole shelf of features appears without touching application code:

        - **Mutual TLS (mTLS)**: both sides show a certificate, so each knows who the other is, and traffic is encrypted. The control plane issues and rotates the certificates automatically.
        - **Retries, timeouts and circuit breaking**, set once by policy
        - **Traffic shifting**: send 95% of requests to the old version and 5% to the new one, then slowly turn it up (a canary release)
        - **Observability**: consistent metrics, logs and traces for every service-to-service call

        *Mutual* is the key word. Ordinary HTTPS proves only the server's identity to you. In mTLS, the client proves its identity too.` },

    { kind: 'code', title: 'Policy as configuration, not code',
      body: 'A simplified, Istio-style rule. The exact syntax differs from tool to tool, but the idea is the same. Tap the highlighted lines.',
      code: { lang: 'yaml', src: `
        # Simplified for illustration
        service: reviews
        routes:
          - version: v1
            weight: 95
          - version: v2
            weight: 5
        retries:
          attempts: 2
          timeout: 2s
        security:
          mtls: required`,
        notes: {
          4: 'Most traffic still goes to the proven version.',
          6: 'A **canary**: five percent of users try the new version. Raise the number if all is well, or set it to zero to roll back.',
          8: 'Retry policy is declared once and applied by the proxies, whatever language the service is written in.',
          12: 'Only callers with valid certificates may connect.'
        } } },

    { kind: 'compare', title: 'Is it worth the complexity?',
      body: 'A mesh solves real problems at a real price. Many teams are better off without one.',
      cols: ['Worth considering', 'Probably overkill'],
      rows: [
        ['Number of services', 'Dozens, in several languages', 'A handful, in one language'],
        ['Security needs', 'Encrypted, identity-checked traffic everywhere', 'Traffic is already inside a trusted network'],
        ['Team', 'A platform team to run it', 'No spare people to learn and operate it'],
        ['Alternatives', 'Shared libraries have become impossible to keep consistent', 'A shared library or a gateway would do']
      ],
      note: 'Costs: extra memory and CPU for every proxy, a little added latency per hop, and one more complicated system to debug. Newer designs try to remove the per-service sidecar to lower that cost.' }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What problem is a service mesh mainly designed to solve?',
      options: ['Repeating the same networking chores in every service', 'Choosing which database each service uses', 'Making individual functions run faster', 'Designing user interfaces for many screens'],
      answer: 0,
      why: [null, 'A mesh deals with communication between services, not storage.', 'It adds a small delay rather than removing one.', 'It has nothing to do with screens.'],
      explain: 'Retries, timeouts, encryption and metrics are needed by every service. A mesh puts them in the infrastructure so they are done once, consistently.' },

    { type: 'match', after: 3, prompt: 'Match each mesh term to its meaning.',
      pairs: [['Sidecar proxy', 'A helper that runs beside each service and handles its traffic'], ['Data plane', 'The proxies carrying the real requests'], ['Control plane', 'The brain that configures the proxies'], ['Envoy', 'A widely used proxy that meshes build on'], ['mTLS', 'Both sides prove their identity and encrypt traffic']],
      explain: 'The control plane decides, the data plane does. Sidecars are how the data plane gets next to each service.' },

    { type: 'tf', after: 5, statement: 'In mutual TLS, the client presents a certificate as well as the server.', answer: true,
      explain: 'Ordinary one-way TLS only proves who the server is. In *mutual* TLS both sides present certificates, so each can verify who the other is.' },

    { type: 'bucket', prompt: 'Which plane does each job belong to?', buckets: ['Data plane', 'Control plane'],
      items: [['Forward a request to a Payments instance', 0], ['Hand out and rotate certificates', 1], ['Retry a failed call', 0], ['Decide that 5% of traffic goes to version 2', 1], ['Record how long a call took', 0], ['Publish routing rules to all proxies', 1]],
      explain: 'The data plane handles live requests. The control plane is about configuration and policy, and never sits on the request path.' },

    { type: 'order', prompt: 'Put one call through a service mesh in order.',
      items: ['Orders makes a plain call to its local proxy', 'The proxy finds a healthy Payments instance', 'The proxies set up an encrypted connection with certificates', 'The receiving proxy checks the caller is allowed', 'The request reaches Payments and the proxies record timing'],
      explain: 'The services stay unaware. The proxies do the finding, securing, checking and measuring around the call.' },

    { type: 'ab', q: 'You want a 5% canary release of a new version. Which is the mesh way?',
      a: { lang: 'yaml', label: 'Policy', src: `
        routes:
          - version: v1
            weight: 95
          - version: v2
            weight: 5` },
      b: { lang: 'js', label: 'In the code', src: `
        if (Math.random() < 0.05) {
          return callV2(req);
        }
        return callV1(req);` },
      answer: 'a',
      explain: 'A mesh lets you change the traffic split by editing configuration, with no code change or redeploy. Writing it into every caller scatters the policy and needs a release to change.' },

    { type: 'multi', q: 'Which are genuine costs of adopting a service mesh?',
      options: ['Extra CPU and memory for every sidecar proxy', 'A little extra latency on each hop', 'One more complex system to learn and operate', 'Services can no longer use encryption', 'It becomes impossible to collect metrics'],
      answers: [0, 1, 2],
      explain: 'Proxies cost resources, add a hop and add operational complexity. A mesh actually *adds* encryption and metrics.' },

    { type: 'scenario', title: 'Do we need a mesh?', intro: 'Two companies ask for your advice on the same day. Both have heard that “everyone uses a service mesh”.',
      meters: { 'operational load': 30, 'consistency': 40 },
      steps: [
        { text: 'Company A has four services, all in Go, run by a team of eight. Traffic already stays inside a private network. What do you say?',
          choices: [
            { label: 'Skip the mesh. A shared library and sensible defaults will do for now', score: 2, effects: { 'operational load': -5, consistency: 10 }, feedback: 'With few services in one language, a library keeps retry and timeout policy consistent without a new platform to run.' },
            { label: 'Adopt a full mesh immediately, to be future-proof', score: 0, effects: { 'operational load': 35, consistency: 10 }, feedback: 'Eight people now operate a control plane and a proxy per service to solve problems they do not have yet.' }
          ] },
        { text: 'Company B has 80 services in five languages, a platform team, and a security rule that all internal traffic must be mutually authenticated. What now?',
          choices: [
            { label: 'A mesh is a strong candidate: uniform mTLS, retries and metrics regardless of language', score: 2, effects: { consistency: 35, 'operational load': 15 }, feedback: 'Five languages make shared libraries painful, and the security rule applies to everything. This is what a mesh is for.' },
            { label: 'Keep writing mTLS and retry logic into each service by hand', score: 0, effects: { consistency: -25, 'operational load': 25 }, feedback: 'Eighty hand-rolled copies will drift apart, and one forgotten service breaks the rule for everyone.' },
            { label: 'Turn off internal encryption to save the overhead', score: 0, effects: { consistency: -30 }, feedback: 'That breaks the stated security requirement.' }
          ] }
      ],
      outro: 'The mesh is a tool for scale and uniformity. Adopt it for a real pain, not for fashion.' },

    { type: 'explain', prompt: 'Explain to a colleague what a sidecar is and why putting a proxy next to every service can be both a blessing and a burden.',
      model: 'A sidecar is a small proxy that runs beside each service instance and handles all of its network traffic, so retries, encryption and metrics are done by the infrastructure, not by application code. That gives consistent behaviour in any language. The burden is extra resources per service, an added hop, and a complicated system to run.',
      keywords: ['sidecar', 'proxy', 'retries', 'encryption', 'consistent', 'complexity', 'resources'] }
  ],

  flashcards: [
    { q: 'What is a service mesh?', a: 'An infrastructure layer of proxies that handles service-to-service networking, such as retries, encryption and metrics, outside the application code.' },
    { q: 'What is a sidecar proxy?', a: 'A small proxy that runs next to each service instance and carries all its incoming and outgoing traffic.' },
    { q: 'Data plane vs control plane?', a: 'The data plane is the proxies that carry the real requests. The control plane configures them with rules, policies and certificates.' },
    { q: 'What is mutual TLS?', a: 'TLS in which both client and server present certificates, so each side verifies the other and the traffic is encrypted.' },
    { q: 'Name two service meshes and one proxy.', a: 'Istio and Linkerd are meshes. Envoy is a widely used proxy; Istio is built on it.' },
    { q: 'When is a mesh probably overkill?', a: 'With few services in one language, no dedicated platform team, or when a shared library or gateway already covers the need.' }
  ],

  glossary: [
    { term: 'Service mesh', def: 'An infrastructure layer of proxies and a control plane that manages how services talk to each other.', like: 'A personal assistant for every employee’s phone calls.' },
    { term: 'Sidecar', def: 'A helper process that runs alongside a service and takes over a chore such as handling its network traffic.', like: 'The sidecar on a motorbike.' },
    { term: 'Data plane', def: 'The part of the mesh made of proxies that carry the real traffic between services.', like: 'The roads and cars.' },
    { term: 'Control plane', def: 'The part of the mesh that configures the proxies and distributes policy and certificates, without handling requests itself.', like: 'The traffic-light programme.' },
    { term: 'Mutual TLS', def: 'An encrypted connection where both parties prove their identity with certificates.', like: 'Both people showing ID before a conversation.', aka: ['mTLS'] }
  ],

  takeaways: [
    'A **mesh** moves retries, timeouts, encryption and metrics out of your code into **sidecar proxies**.',
    '**Data plane** = proxies carrying traffic. **Control plane** = the brain configuring them.',
    'You get **mTLS**, traffic shifting and consistent observability for every service.',
    'The price: resources, latency and complexity. Worth it at scale; overkill for a handful of services.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('apx-twelve-factor', {
  eli5: 'The Twelve-Factor App is a checklist of twelve habits, like keeping settings outside the code and treating servers as disposable, that make an app easy to run, copy and fix in the cloud.',

  cards: [
    { kind: 'concept', title: 'The app that only works on Sam’s laptop',
      body: `It runs on Sam's machine. On the test server it crashes, because a setting is missing. In production the database password is written inside the code. Scaling to two servers breaks logins, because each server remembers its own users. Deploying takes a day of manual steps.

        Around 2011, engineers at the cloud platform Heroku wrote down what they had seen go wrong, and what the apps that behaved well had in common. The result was **The Twelve-Factor App**: twelve habits for software that is easy to deploy, scale and maintain in the cloud.

        They are practical rules, not a law, and almost every modern platform assumes them.` },

    { kind: 'metaphor', title: 'A franchise kitchen',
      body: `A successful burger chain opens a new branch every week. How? Each kitchen is a copy of the same recipe: same equipment, same instructions, ingredients ordered from standard suppliers, settings on a laminated card (oven at 200°C).

        If one kitchen burns down, they open another and nobody notices. Staff can move between branches on day one.

        An app that follows the twelve factors is a franchise kitchen: **one recipe** (the code), **settings on a card** (the environment), **swappable suppliers** (backing services), and **kitchens you can add or close in minutes** (processes).` },

    { kind: 'compare', title: 'Factors 1–4: code, dependencies, settings, services',
      body: 'The first four are about what the app is made of and what it plugs into.',
      cols: ['The habit', 'In plain English'],
      rows: [
        ['I. Codebase', 'One codebase in version control, many deploys', 'One repository per app. Test, staging and production run the same code.'],
        ['II. Dependencies', 'Declare and isolate them', 'List every library in a file (like package.json). Never rely on something that happens to be installed.'],
        ['III. Config', 'Store settings in the environment', 'Anything that differs between deploys (passwords, URLs) lives outside the code.'],
        ['IV. Backing services', 'Treat them as attached resources', 'A database or email service is reached by a URL. Swap one for another by changing the setting.']
      ] },

    { kind: 'code', title: 'Factor III in practice: config in the environment',
      body: 'The same code runs everywhere. Only the environment differs. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        // Bad: a secret and a place baked into the code
        // const db = connect('postgres://admin:hunter2@prod-db/shop');

        // Good: read from the environment
        const db = connect(process.env.DATABASE_URL);
        const port = process.env.PORT || 3000;

        // Locally:    DATABASE_URL=postgres://localhost/shop
        // Production: DATABASE_URL set by the platform`,
        notes: {
          2: 'A **password in the code** ends up in version control, forever. Anyone with the repository has the keys.',
          5: 'The code asks the environment. One build can run in test, staging and production with different settings.',
          6: 'A safe default for local work. Nothing secret belongs in a default.',
          9: 'The platform, not a developer, supplies the production value.'
        } } },

    { kind: 'compare', title: 'Factors 5–8: build, processes, ports, scaling',
      body: 'These four describe how the app runs.',
      cols: ['The habit', 'In plain English'],
      rows: [
        ['V. Build, release, run', 'Keep the three stages strictly separate', 'Build once, combine with config to make a release, then run that exact release. No editing code on a live server.'],
        ['VI. Processes', 'Run as stateless processes', 'Nothing important lives in memory or on local disk between requests. Keep state in a database or cache.'],
        ['VII. Port binding', 'Export services by port', 'The app is self-contained: it opens its own port and listens, rather than needing to be placed inside a separate web server.'],
        ['VIII. Concurrency', 'Scale out with the process model', 'To handle more load, run more copies of the app, instead of making one copy bigger.']
      ] },

    { kind: 'diagram', title: 'Stateless processes: why Factor VI matters',
      body: 'Because no copy holds anything precious, any copy can answer any request, and copies can be added or lost freely.',
      nodes: [
        { id: 'lb', label: 'Load balancer', icon: '⚖️', x: 1, y: 0, tone: 'info' },
        { id: 'a', label: 'App copy 1', x: 0, y: 1, tone: 'accent' },
        { id: 'b', label: 'App copy 2', x: 1, y: 1, tone: 'accent' },
        { id: 'c', label: 'App copy 3', x: 2, y: 1, tone: 'accent' },
        { id: 'db', label: 'Database', icon: '🗄️', x: 0, y: 2, tone: 'good' },
        { id: 'cache', label: 'Session cache', icon: '⚡', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'lb', to: 'a' }, { from: 'lb', to: 'b' }, { from: 'lb', to: 'c' },
        { from: 'a', to: 'db', dashed: true }, { from: 'b', to: 'cache', dashed: true }, { from: 'c', to: 'db', dashed: true }
      ],
      caption: 'State lives in the backing services at the bottom, so any app copy can be killed and replaced.' },

    { kind: 'compare', title: 'Factors 9–12: lifecycle, parity, logs, admin',
      body: 'The last four are about keeping the app healthy over time.',
      cols: ['The habit', 'In plain English'],
      rows: [
        ['IX. Disposability', 'Fast start-up, graceful shutdown', 'Processes can be started or stopped at a moment’s notice. Finish current work when asked to stop.'],
        ['X. Dev/prod parity', 'Keep environments similar', 'Develop against the same kind of database and services you use in production, and deploy often.'],
        ['XI. Logs', 'Treat logs as event streams', 'The app just prints events to standard output. The platform collects, stores and searches them.'],
        ['XII. Admin processes', 'Run admin tasks as one-off processes', 'Database migrations and one-time scripts run from the same code and config as the app, not by hand in a live system.']
      ] },

    { kind: 'pitfall', title: 'Parity gaps and the “works on my machine” trap',
      body: `Factor X is the one people break most quietly. A common pattern: develop against a simple local file database, deploy against a full database server. The two behave differently in small ways, such as how they sort text or handle simultaneous writes, and the bugs only show up in production.

        Nowadays, containers and tools like Docker Compose make it easy to run a *real* database locally, so there is less excuse.

        The same logic applies to logs. If the app writes its own log files to its own disk, they vanish when that process is replaced, which, under Factor IX, will be often. Print to standard output and let the platform keep them.` },

    { kind: 'realworld', title: 'Still relevant, with caveats',
      body: `The twelve factors were written for cloud platforms and shaped how Docker images, Kubernetes deployments and most hosting platforms work today. If you containerise an app and give it settings through environment variables, you are already following several of them.

        Some details have aged. Newer thinking adds topics that were not on the list: security, observability beyond logs, and API-first design. And some teams now use **secret managers** rather than plain environment variables for very sensitive values.

        Treat it as a strong starting checklist, not scripture.` }
  ],

  activities: [
    { type: 'order', after: 4, prompt: 'Put the Factor V stages in the right order.',
      items: ['Build: turn the code into something runnable', 'Release: combine that build with the config for one environment', 'Run: start that exact release as processes'],
      explain: 'The stages are kept strictly separate. You never edit code on a running server, because the next release would lose the change.' },

    { type: 'match', after: 2, prompt: 'Match each factor to its plain-English meaning.',
      pairs: [['III. Config', 'Settings that differ per deploy live in the environment'], ['IV. Backing services', 'Databases and the like are attached by URL'], ['VI. Processes', 'Run stateless; keep state in a service'], ['IX. Disposability', 'Start fast, stop gracefully'], ['XI. Logs', 'Print events to a stream; the platform keeps them']],
      explain: 'Each habit makes the app easier to copy, replace and run in different places.' },

    { type: 'spot', prompt: 'This code breaks one of the twelve factors. Tap the line.',
      code: { lang: 'js', src: `
        const express = require('express');
        const app = express();

        const db = connect('postgres://admin:s3cret@prod-db/shop');

        app.get('/', (req, res) => res.send('hello'));
        app.listen(process.env.PORT);` },
      lines: [4],
      explain: 'The database address and password are hard-coded. Under Factor III they belong in the environment, so the same code can run in every environment and the secret stays out of version control.' },

    { type: 'bucket', prompt: 'Which factor is each practice about?', buckets: ['Config', 'Processes (stateless)', 'Logs'],
      items: [['Read DATABASE_URL from an environment variable', 0], ['Keep a login session in a shared cache, not in one server’s memory', 1], ['Print events to standard output', 2], ['Different passwords for staging and production, set outside the code', 0], ['Any copy of the app can be killed and replaced without losing data', 1], ['Let the platform collect and search events', 2]],
      explain: 'Config is about settings, statelessness about where data lives between requests, and logs about treating output as a stream rather than files.' },

    { type: 'tf', statement: 'Under the twelve factors, a stateless app can keep each user’s shopping basket in its own memory, as long as it is also backed up nightly.', answer: false,
      explain: 'The next request may reach a different copy, and any copy can disappear at any time. Keep state in a backing service, such as a database or cache.' },

    { type: 'mcq', q: 'Your app writes its logs to a file on its own disk. Which factor does this go against, and why does it matter?',
      options: ['Logs: stream them, as a replaced process loses its disk', 'Codebase: because each copy needs its own repository', 'Concurrency: because logs slow down scaling out', 'Dependencies: because the log library is undeclared'],
      answer: 0,
      why: [null, 'Logs say nothing about repositories.', 'Concurrency is about scaling out with more processes, not log files.', 'Dependencies are libraries you list, not where logs go.'],
      explain: 'Under Factor XI the app prints events to standard output and the platform collects them. A log file on a disposable process is lost when that process is replaced.' },

    { type: 'cloze', text: 'Under Factor III, anything that changes between deploys, such as a database {{URL}} or {{password}}, is stored in the {{environment}}, never in the {{code}}.',
      distractors: ['cache', 'comments', 'logs'],
      explain: 'Test it with this question: could you open-source the code today without leaking anything? If not, some config is hiding in it.' },

    { type: 'scenario', title: 'Make the app cloud-ready', intro: 'A small company has an app that runs well on one server. Management wants it to run on two servers behind a load balancer, with automatic restarts. You are given a week.',
      meters: { 'readiness': 25, risk: 50 },
      steps: [
        { text: 'Testing on two servers, users keep being logged out. Why, and what do you do?',
          choices: [
            { label: 'Sessions are in each server’s memory. Move them into a shared store', score: 2, effects: { readiness: 25, risk: -15 }, feedback: 'Factor VI: processes should be stateless. With sessions in a shared cache or database, any copy can serve any user.' },
            { label: 'Make the load balancer always send each user to the same server', score: 1, effects: { readiness: 5, risk: 5 }, feedback: 'It hides the problem, but a restart or a failed server still logs those users out, and scaling is less even.' },
            { label: 'Go back to one server', score: 0, effects: { readiness: -15 }, feedback: 'That abandons the goal instead of removing the cause.' }
          ] },
        { text: 'Servers restart automatically but sometimes drop requests half-way. What do you improve?',
          choices: [
            { label: 'Handle the shutdown signal: finish current requests, then exit. Keep start-up quick', score: 2, effects: { readiness: 20, risk: -15 }, feedback: 'Factor IX, disposability. Fast start and graceful shutdown mean the platform can move your processes around safely.' },
            { label: 'Stop the servers from ever restarting', score: 0, effects: { readiness: -10, risk: 15 }, feedback: 'Servers will restart for patches and failures regardless. Plan for it instead of pretending otherwise.' }
          ] },
        { text: 'Finally, the production password is in the code repository. What is the fix?',
          choices: [
            { label: 'Change the password, remove it from the code, and read it from the environment', score: 2, effects: { readiness: 20, risk: -20 }, feedback: 'Changing it matters: the old one is in version control history and must be treated as leaked. Then Factor III keeps new secrets out of the code.' },
            { label: 'Just delete the line in the next commit', score: 0, effects: { risk: 10 }, feedback: 'The password stays in the repository’s history. Anyone with access can still find it.' }
          ] }
      ],
      outro: 'None of these steps needed new technology. They are habits, and they turn a one-server app into one that can run anywhere.' },

    { type: 'explain', prompt: 'Pick any three of the twelve factors and explain, in your own words, how together they make an app easier to run in the cloud.',
      model: 'Config in the environment lets the same build run in test and production with different settings and keeps secrets out of the code. Stateless processes mean any copy can answer any request, so you can add or replace copies freely. Logs as streams mean a replaced process does not take its logs with it. Together the app becomes a disposable, copyable unit.',
      keywords: ['config', 'environment', 'stateless', 'processes', 'logs', 'disposable', 'scale'] }
  ],

  flashcards: [
    { q: 'List the twelve factors.', a: 'Codebase, dependencies, config, backing services, build/release/run, processes, port binding, concurrency, disposability, dev/prod parity, logs, admin processes.' },
    { q: 'Where should config live, and why?', a: 'In the environment, not the code, so one build runs everywhere and secrets stay out of version control.' },
    { q: 'What does “stateless process” mean?', a: 'Nothing important is kept in memory or on local disk between requests. State lives in backing services, so any copy can be replaced.' },
    { q: 'What is disposability?', a: 'Processes start fast and shut down gracefully, so they can be started, stopped and moved at any moment.' },
    { q: 'What should an app do with its logs?', a: 'Write events to standard output as a stream. The platform collects, stores and searches them.' },
    { q: 'What is dev/prod parity?', a: 'Keeping development, staging and production as similar as possible, in tools and in how often you deploy.' }
  ],

  glossary: [
    { term: 'Twelve-Factor App', def: 'A set of twelve guidelines for building apps that are easy to deploy, scale and maintain on cloud platforms.', like: 'A franchise’s standard kitchen manual.' },
    { term: 'Config', def: 'Anything that differs between deployments, such as database addresses, passwords and feature settings.', like: 'The settings card on the oven.' },
    { term: 'Backing service', def: 'Any service the app uses over the network, such as a database, cache or email provider.', like: 'A supplier you can swap by changing the phone number.' },
    { term: 'Stateless process', def: 'A running copy of an app that keeps nothing important in its own memory or disk between requests.', like: 'A till operator who writes everything in the shared ledger, not on their hand.' },
    { term: 'Dev/prod parity', def: 'Keeping development and production environments as alike as possible.', like: 'Practising on the same type of kitchen you will cook in.' }
  ],

  takeaways: [
    '**Config in the environment**, never in the code.',
    '**Stateless, disposable processes**: scale by running more copies; keep state in backing services.',
    '**Same code, same kind of services** from laptop to production, with logs as a stream.',
    'A strong checklist from 2011, not scripture. Modern needs add security and richer observability.'
  ],

  links: [
    { label: 'The Twelve-Factor App', url: 'https://12factor.net/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('arch-patterns-systems', {
  title: 'The Many-Headed Architect',
  intro: 'A hydra guards the gates of the system-design city, and every head asks about a different shape of software. Cut them all down by knowing which pattern fits, what it costs and where it fails.',
  questions: [
    { type: 'mcq', q: 'In MVP, how does it differ from classic MVC?',
      options: ['The view never talks to the model; the presenter mediates and drives a passive view', 'The model holds the screen layout instead of the view', 'The controller is replaced by automatic data binding', 'The view reads the model directly and the presenter is optional'],
      answer: 0,
      why: [null, 'Layout belongs to the view in all three patterns.', 'That describes MVVM, not MVP.', 'In MVP, direct view-to-model access is exactly what is removed.'],
      explain: 'MVP makes the view passive. The presenter holds the decisions and tells the view what to show, which makes it easy to test with a fake view.' },

    { type: 'tf', statement: 'In MVVM, the view-model holds direct references to the buttons and labels it updates.', answer: false,
      explain: 'The view binds to plain properties on the view-model. The view-model knows nothing about specific widgets, which keeps it testable.' },

    { type: 'spot', prompt: 'This file is meant to be part of the core of a hexagonal app. Tap the line that breaks the dependency rule.',
      code: { lang: 'js', src: `
        import { Pool } from 'pg';

        export function applyLateFee(loan, today) {
          const daysLate = Math.max(0, today - loan.dueDate);
          return daysLate * 0.5;
        }` },
      lines: [1],
      explain: 'An inner layer imports a database library, so the core now depends on an outer tool. The late-fee rule is pure and fine. Database work belongs behind a port.' },

    { type: 'bucket', prompt: 'Core or plug-in, in a microkernel text editor?', buckets: ['Core', 'Plug-in'],
      items: [['The plug-in registry', 0], ['Opening and saving files', 0], ['A Git panel', 1], ['A French spell checker', 1], ['Key press handling and the window', 0], ['A colour theme', 1]],
      explain: 'The core is whatever every user needs and nothing can run without. Optional features belong in plug-ins.' },

    { type: 'mcq', q: 'In the blackboard pattern, how do the knowledge sources cooperate?',
      options: ['Only through the shared board, with a controller choosing who acts', 'By calling each other directly, in a fixed order of steps', 'By each running on a separate database', 'By voting at the end of the run'],
      answer: 0,
      why: [null, 'A fixed chain of calls is a pipeline, not a blackboard.', 'The shared board is the point; they do not have separate stores.', 'There is no vote. Partial results build up on the board.'],
      explain: 'Specialists stay independent and communicate through the shared workspace. The controller picks the next one that can make progress.' },

    { type: 'multi', q: 'Which of these are typical problems of classic SOA with a central enterprise service bus?',
      options: ['The bus became a bottleneck and single point of failure', 'Changes queued on one central team', 'Heavy governance slowed delivery', 'Services had no way to describe their contracts', 'The bus made services faster by default'],
      answers: [0, 1, 2],
      explain: 'Centralised cleverness and governance created waiting. SOA services did have contracts, and the bus was usually a cost, not a speed gain.' },

    { type: 'ab', q: 'The Orders service needs a product name. Which design suits microservices?',
      a: { lang: 'js', label: 'Through the API', src: `
        const p = await catalogue.getProduct(id);
        return p.name;` },
      b: { lang: 'js', label: 'Straight to tables', src: `
        const r = await catalogueDb.query(
          'SELECT name FROM products WHERE id = ?', [id]);
        return r.name;` },
      answer: 'a',
      explain: 'A database per service means others go through the owner’s API. Reaching into its tables makes a hidden contract that blocks the owner from changing its schema.' },

    { type: 'order', prompt: 'Put the spread of a cascading failure in order.',
      items: ['One service becomes slow, but nothing crashes', 'Callers wait and requests pile up', 'The callers run out of threads and become slow too', 'The slowness walks up the chain of dependencies', 'Users see the whole product fail'],
      explain: 'Slowness plus waiting is what spreads. Timeouts, circuit breakers and bulkheads cut the chain early.' },

    { type: 'short', q: 'What is the name for microservices that must be deployed together or share a database, so you get the costs of distribution with none of the benefits? (two words)', accept: ['distributed monolith', 'a distributed monolith', 'distributed monoliths'], hint: 'Spread out, but still one big lump.',
      explain: 'A **distributed monolith** has the coupling of a single program plus the failures of a network.' },

    { type: 'estimate', q: 'A serverless function runs 10 million times a month, billed for about 100 milliseconds each time. Roughly how many seconds are billed in total?', answer: 1000000, unit: 'seconds', tolerance: 2,
      explain: '10,000,000 × 0.1 s = 1,000,000 seconds, around 11.5 days of compute. Providers also factor in memory, but billing follows time used, not idle time.' },

    { type: 'match', prompt: 'Match each service-mesh term to what it does.',
      pairs: [['Sidecar proxy', 'Handles all traffic for one service instance'], ['Data plane', 'The proxies carrying real requests'], ['Control plane', 'Pushes policy and certificates to the proxies'], ['mTLS', 'Both sides prove identity and encrypt traffic'], ['Traffic shifting', 'Send a percentage of requests to a new version']],
      explain: 'The control plane decides and the data plane carries out. Features like mTLS and canary shifting come from the proxies, with no code changes.' },

    { type: 'cloze', text: 'Under the twelve factors, {{config}} lives in the environment, processes are {{stateless}}, and logs are written to a {{stream}} such as standard {{output}}.',
      distractors: ['files', 'memory', 'database'],
      explain: 'Settings outside the code, state outside the process and logs outside the disk are what make processes disposable and copyable.' }
  ]
});

KS.sheet('arch-patterns-systems', {
  title: 'Architectural Patterns I: cheat sheet',
  sections: [
    { title: 'MVC, MVP, MVVM',
      md: `All three separate **data and rules**, **display** and **glue**.

        | | Middle piece | View talks to | Screen updated by |
        |---|---|---|---|
        | MVC | Controller | Controller; reads model | View observing model |
        | MVP | Presenter | Presenter only | Presenter calling the view |
        | MVVM | View-model | View-model, by binding | Binding engine |

        **Rule:** the model owns the rules. A controller or presenter that holds business logic is "fat". Test the middle piece with a fake view.` },

    { title: 'Hexagonal, onion, clean',
      md: `**Business rules in the middle; tools at the edge.**

        - **Port**: an interface the core owns.
        - **Adapter**: fits a real tool (database, web page, email) to a port.
        - **Dependency rule**: source-code dependencies point **inwards**.
        - Rings of Clean Architecture: entities, use cases, interface adapters, frameworks.

        **Gain:** fast tests, swappable databases and UIs. **Cost:** ceremony. Skip it for thin form-over-database apps.` },

    { title: 'Microkernel and blackboard',
      md: `**Microkernel (plug-in):** a tiny core, plus plug-ins through **extension points** and a **registry**. Examples: Eclipse, VS Code, browsers, WordPress. The contract is a promise, so keep it small.

        **Blackboard:** specialists (**knowledge sources**) read and write a shared **blackboard**; a **controller** picks who acts next. Used for speech and signal interpretation; echoed in multi-agent AI. Great when no recipe exists. Hard to test and debug.

        If the steps are known, use a pipeline instead.` },

    { title: 'SOA vs microservices',
      md: `| | Classic SOA | Microservices |
        |---|---|---|
        | Scope | Whole enterprise | One product |
        | Middle | Smart ESB | Dumb pipes |
        | Data | Often shared | Per service |
        | Services | Big, reused | Small, team-owned |
        | Standards | Central, SOAP/XML | Teams choose, JSON/HTTP |

        SOA's lessons: a central bus becomes a bottleneck; heavy governance is slow. Keep **contracts** and **business capabilities**.` },

    { title: 'Microservices and their hard parts',
      md: `**Gains:** independent deployment, team autonomy, targeted scaling.

        **Rules:** a small team owns each service; **database per service**; use synchronous calls when you need the answer now, asynchronous messages otherwise; **Conway's law** shapes boundaries.

        **Hard parts:** service **discovery**, **API gateway**, no cross-service transactions (use **sagas**, **eventual consistency**), **cascading failures** (timeouts, circuit breakers, bulkheads).

        **Smell:** the **distributed monolith**. Often best to go **monolith first**.` },

    { title: 'Serverless and service mesh',
      md: `**Serverless:** FaaS (AWS Lambda and similar) runs your function on a **trigger**, billed per invocation and time. Stateless. Watch **cold starts**, time and size limits, lock-in. **BaaS** = hosted database, sign-in, storage. Best for spiky, event-driven work.

        **Service mesh:** a **sidecar proxy** beside each service (**data plane**), configured by a **control plane**. Gives mTLS, retries, traffic shifting and metrics without code changes. Istio and Linkerd; Envoy is a common proxy. Costs resources, latency and complexity.` },

    { title: 'The twelve factors',
      md: `1. **Codebase**: one repo, many deploys
        2. **Dependencies**: declared and isolated
        3. **Config**: in the environment
        4. **Backing services**: attached resources
        5. **Build, release, run**: separate stages
        6. **Processes**: stateless
        7. **Port binding**: app exports its own port
        8. **Concurrency**: scale out with more processes
        9. **Disposability**: fast start, graceful stop
        10. **Dev/prod parity**: keep them alike
        11. **Logs**: a stream to stdout
        12. **Admin processes**: one-off tasks, same code` }
  ]
});

