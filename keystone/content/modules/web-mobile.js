/* Module: web-mobile — Web & Mobile Architecture.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs web-mobile */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('wm-rendering', {
  eli5: 'Every web page is HTML in the end. The big question is who builds that HTML and when: your browser after the page arrives, a server each time someone asks, or a build step before anyone visits.',

  cards: [
    { kind: 'code', title: 'The page with nothing in it',
      body: `Open a modern web app, right-click and choose **View source**. Sometimes you will see something startling: almost nothing. The real page is not in there.

        Whether the HTML arrives ready-made or gets assembled afterwards is one of the first architecture choices on any web project. It affects **speed, search ranking, cost and how the app feels**. Here is the "nothing" version:`,
      code: { lang: 'html', src: `
        <!doctype html>
        <html>
          <body>
            <div id="root"></div>
            <script src="/app.js"></script>
          </body>
        </html>`,
        notes: {
          4: 'The whole page is one empty box. A search engine, or a slow phone, sees nothing to read yet.',
          5: 'The JavaScript will build the real page inside that box, after it has downloaded and run.'
        } } },

    { kind: 'sequence', title: 'A single-page app (SPA)',
      body: 'In a **single-page app**, the browser builds the page. After the first load, clicking around swaps content with JavaScript instead of fetching whole new pages.',
      actors: ['Browser', 'Server', 'API'],
      steps: [
        { from: 0, to: 1, label: 'GET /', note: 'The browser asks for the page.' },
        { from: 1, to: 0, label: 'empty shell + app.js link', dashed: true, note: 'The server sends the near-empty HTML from the last card.' },
        { from: 0, to: 1, label: 'GET /app.js', note: 'The browser downloads the JavaScript bundle. Bigger bundles mean a longer wait.' },
        { at: 0, label: 'run JS, start building', note: 'Still nothing useful on screen: the page is not built yet.' },
        { from: 0, to: 2, label: 'GET /api/products', note: 'The app asks an API for its data.' },
        { from: 2, to: 0, label: 'JSON', dashed: true, note: 'Raw data comes back, not HTML.' },
        { at: 0, label: 'render the list', note: 'Now the content appears. Later clicks only fetch data and swap pieces, so they feel instant.' }
      ] },

    { kind: 'sequence', title: 'Server-side rendering (SSR)',
      body: 'With **server-side rendering**, the server builds the HTML for each request, so the browser receives a finished page.',
      actors: ['Browser', 'Server', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'GET /products', note: 'The browser asks for the page.' },
        { from: 1, to: 2, label: 'SELECT products', note: 'The server fetches what it needs.' },
        { from: 2, to: 1, label: 'rows', dashed: true, note: 'The data comes back to the server, not to the browser.' },
        { at: 1, label: 'build the HTML', note: 'It fills a template with the data, for this request.' },
        { from: 1, to: 0, label: 'complete HTML page', dashed: true, note: 'Content shows almost immediately, and search engines can read it.' },
        { from: 0, to: 1, label: 'GET /app.js', note: 'The JavaScript still has to arrive for the page to be interactive.' },
        { at: 0, label: 'hydrate', note: 'JS attaches click handlers to the existing HTML. The next card explains this.' }
      ] },

    { kind: 'metaphor', title: 'Meal kit, restaurant, or buffet',
      body: `Three ways to get dinner:

        - **Meal kit (SPA)**: a box of ingredients arrives and you cook at your table. The delivery is light, but you wait while you cook, and it depends on your kitchen.
        - **Restaurant (SSR)**: the kitchen cooks each plate to order. Fresh and personal, but the kitchen is busy and every order costs effort.
        - **Buffet (SSG)**: everything was cooked this morning and sits ready. Wonderfully quick and cheap to serve, but nobody gets a custom dish, and by evening it is a bit stale.

        The metaphor stops at cooking: modern setups can mix all three on one site.` },

    { kind: 'compare', title: 'SPA, SSR and SSG side by side',
      body: '**Static site generation (SSG)** builds every page once, at **build time**, and serves the files from a CDN. Here is how the three compare.',
      cols: ['SPA', 'SSR', 'SSG'],
      rows: [
        ['HTML built', 'In the browser', 'On the server, per request', 'At build time, once'],
        ['First content', 'After JS downloads and runs', 'Quick: HTML arrives ready', 'Quickest: a file from a CDN'],
        ['Personalised pages', 'Easy', 'Easy', 'Hard: same file for everyone'],
        ['Server cost', 'Low: files plus an API', 'Higher: a render per request', 'Lowest'],
        ['Search and previews', 'Weakest', 'Strong', 'Strong'],
        ['Freshness', 'Live via the API', 'Live', 'Stale until the next build']
      ] },

    { kind: 'concept', title: 'Hydration: looks ready, is not',
      body: `A server-rendered page arrives as plain HTML. It *looks* finished. But it is like a shop display: the buttons are painted on until the JavaScript arrives.

        **Hydration** is the step where the framework's JavaScript runs in the browser, matches itself to the HTML that is already there, and attaches the event handlers. Only then do the buttons work.

        The costs: the page can look clickable before it is, you ship both HTML *and* JavaScript, and if the server and browser disagree (say, about the time of day), you get a "hydration mismatch".

        Newer techniques such as streaming and "islands" (hydrating only the interactive parts) reduce that cost.` },

    { kind: 'pitfall', title: 'Choosing by fashion',
      body: `Two mistakes that come up again and again:

        - **A blog built as an SPA.** Readers wait for a script to build text that never changes, and search tools may struggle to read it.
        - **A private dashboard built with SSR "for SEO".** Search engines cannot see pages behind a login anyway, so you pay for server rendering and gain nothing.

        A word on SEO: major search engines can run JavaScript, but that is slower and less reliable than reading HTML, and many other crawlers and link-preview tools do not run it at all. So public, content-heavy pages are safest with HTML that is ready on arrival.` },

    { kind: 'diagram', title: 'A rough decision path',
      body: 'Start from the content, not from the framework.',
      nodes: [
        { id: 'q1', label: 'Same page for everyone?', x: 1, y: 0, tone: 'accent' },
        { id: 'q2', label: 'Changes rarely?', x: 0, y: 1 },
        { id: 'q3', label: 'Behind a login?', x: 2, y: 1 },
        { id: 'ssg', label: 'SSG', icon: '🏭', x: 0, y: 2, tone: 'good' },
        { id: 'ssr', label: 'SSR', icon: '🍳', x: 1, y: 2, tone: 'info' },
        { id: 'spa', label: 'SPA', icon: '🧰', x: 2, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'q1', to: 'q2', label: 'yes' },
        { from: 'q1', to: 'q3', label: 'no' },
        { from: 'q2', to: 'ssg', label: 'yes' },
        { from: 'q2', to: 'ssr', label: 'no' },
        { from: 'q3', to: 'spa', label: 'yes' },
        { from: 'q3', to: 'ssr', label: 'no (public)' }
      ],
      caption: 'A starting point, not a law. Real sites mix several answers.' },

    { kind: 'tip', title: 'You rarely have to pick just one',
      body: `Modern frameworks such as Next.js, Nuxt, SvelteKit and Astro let you choose **per page**: the marketing pages as SSG, product pages as SSR, and the account area as an SPA.

        A related trick is **incremental static regeneration**: serve a pre-built page, and quietly rebuild it in the background every so often. You get most of the buffet's speed with fewer stale dishes.

        Architect's question to ask for each page: *who is it for, how fresh must it be, and does a search engine need to see it?*` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'In a single-page app, what does the server send first for the very first visit?',
      options: ['A near-empty HTML shell and a link to a JavaScript bundle', 'A fully built HTML page for the requested route', 'Only JSON, with no HTML at all', 'A pre-built file for every possible page'],
      answer: 0,
      why: [null, 'That describes server-side rendering.', 'The browser needs HTML first to start loading the script.', 'That is closer to static site generation.'],
      explain: 'The SPA shell is almost empty. The JavaScript downloads, runs, fetches data from an API and builds the page in the browser.' },

    { type: 'bucket', after: 4, prompt: 'Which rendering approach fits each case best?', buckets: ['SPA', 'SSR', 'SSG'],
      items: [['A company blog that is updated a few times a week', 2], ['An admin dashboard behind a login', 0], ['Public product pages with live stock that must be indexed', 1], ['A documentation site', 2], ['A browser-based design tool or spreadsheet', 0], ['A public, personalised news feed that search engines index', 1]],
      explain: 'Static pages that rarely change suit SSG. Tools behind a login benefit from SPA interactivity. Public pages that are live and must be indexed suit SSR.' },

    { type: 'tf', after: 5, statement: 'After a server-rendered page arrives, its buttons work immediately, even before the JavaScript has loaded.', answer: false,
      explain: 'The HTML shows at once, but the interactivity only arrives after hydration, when JavaScript attaches the event handlers.' },

    { type: 'order', prompt: 'Put the server-side rendering flow in order.', items: ['The browser requests the page', 'The server fetches data and builds the HTML', 'The browser shows the finished HTML', 'The JavaScript bundle arrives', 'Hydration makes the page interactive'],
      explain: 'The user sees content early, then the page becomes interactive once hydration finishes.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['SPA', 'The browser builds the page with JavaScript'], ['SSR', 'The server builds the HTML on each request'], ['SSG', 'Pages are pre-built at build time'], ['Hydration', 'JavaScript attaching to server-made HTML'], ['CDN', 'Servers worldwide that deliver static files quickly']],
      explain: 'The first three are answers to “who builds the HTML, and when?”. Hydration is what makes pre-built HTML interactive.' },

    { type: 'cloze', text: 'In {{SSG}} the HTML is built once at {{build}} time. In an {{SPA}} the browser builds it with JavaScript. Making server HTML interactive is called {{hydration}}.',
      distractors: ['SSR', 'request', 'caching'],
      explain: 'SSG moves the work to build time, SPA moves it to the browser, and hydration is the step that wires up server-made HTML.' },

    { type: 'scenario', title: 'The invisible shop', meters: { traffic: 30, speed: 40, cost: 70 },
      intro: 'A small online shop is built as an SPA. Visitors say it feels fast once loaded, but the product pages barely appear in search results, and link previews on social media are blank. The marketing team is unhappy.',
      steps: [
        { text: 'What do you suggest?',
          choices: [
            { label: 'Render the public product pages on the server (or pre-build them), and keep the basket and account as an SPA', score: 2, effects: { traffic: 35, speed: 25, cost: -10 }, feedback: 'Public pages are now HTML on arrival, so crawlers and previews can read them. The interactive parts keep their app feel.' },
            { label: 'Rewrite the whole shop as server-rendered pages with no JavaScript', score: 0, effects: { traffic: 25, speed: 5, cost: -35 }, feedback: 'It would help search, but you throw away a working basket and pay for a rewrite you did not need.' },
            { label: 'Add more keywords to the page title', score: 1, effects: { traffic: 3, speed: 0 }, feedback: 'Harmless but it does not fix the cause: the content is not in the HTML a crawler receives.' }
          ] },
        { text: 'Product prices change several times a day. How should the pre-built or server pages stay fresh?',
          choices: [
            { label: 'Use SSR for the price-sensitive pages, or regenerate pages regularly in the background', score: 2, effects: { speed: 20, traffic: 10, cost: -5 }, feedback: 'You trade a little server work for correct, fresh prices that crawlers can still read.' },
            { label: 'Rebuild the whole site by hand every Monday', score: 0, effects: { traffic: -10, speed: 5 }, feedback: 'Customers will see wrong prices for days.' },
            { label: 'Leave prices out of the HTML and load them in the browser afterwards', score: 1, effects: { traffic: -5, speed: 10 }, feedback: 'Fast, but crawlers see pages with no prices, and shoppers see them pop in late.' }
          ] }
      ],
      outro: 'Choose per page, by audience and freshness. It is not one decision for the whole site.' },

    { type: 'explain', prompt: 'Explain SPA, SSR and SSG to a colleague, including what hydration is and how you would choose.',
      model: 'The question is who builds the HTML and when. In a SPA the browser builds it with JavaScript, which feels app-like but starts slowly and is weaker for search. In SSR the server builds the HTML for every request, so content arrives ready. In SSG the HTML is built once at build time and served from a CDN, which is fastest and cheapest but stale until rebuilt. Hydration is JavaScript attaching to server-made HTML so it becomes interactive. I would choose per page, by audience, freshness and whether search engines need to see it.',
      keywords: ['browser', 'server', 'build time', 'hydration', 'SEO', 'CDN', 'per page'] }
  ],

  flashcards: [
    { q: 'What decides SPA vs SSR vs SSG?', a: 'Who builds the HTML and when: the browser (SPA), the server per request (SSR) or a build step beforehand (SSG).' },
    { q: 'What is hydration?', a: 'The step where JavaScript runs in the browser and attaches event handlers to HTML that the server already produced.' },
    { q: 'Why can a pure SPA be weaker for SEO and link previews?', a: 'The initial HTML is nearly empty, so crawlers and preview tools that do not run JavaScript see no content.' },
    { q: 'What is the main drawback of SSG?', a: 'Pages are the same for everyone and stale until the next build, unless you add regeneration or fetch live data in the browser.' },
    { q: 'What does incremental static regeneration do?', a: 'It serves pre-built pages and rebuilds them in the background every so often to keep them reasonably fresh.' }
  ],

  glossary: [
    { term: 'Single-page app', def: 'A web app where the browser loads one HTML shell and JavaScript builds and swaps the content, with no full page reloads.', like: 'A meal kit you cook yourself.', aka: ['SPA'] },
    { term: 'Server-side rendering', def: 'Building the HTML for each page on the server for every request, so the browser receives a finished page.', like: 'A restaurant cooking each plate to order.', aka: ['SSR'] },
    { term: 'Static site generation', def: 'Building all the pages once, ahead of time, and serving the resulting files directly, usually from a CDN.', like: 'A buffet cooked this morning.', aka: ['SSG'] },
    { term: 'Hydration', def: 'Attaching JavaScript behaviour to HTML that was rendered earlier, so that it becomes interactive.', like: 'Plugging in the shop display so the lights work.' }
  ],

  takeaways: [
    'The core question: who builds the HTML, and when?',
    'SPA: app-like but slow to first content. SSR: fresh and indexable but costs server work. SSG: fastest and cheapest but stale.',
    'Server-made HTML needs hydration before it is interactive.',
    'Choose per page by audience, freshness and SEO, not by fashion.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('wm-frameworks', {
  eli5: 'React, Vue and Angular are three popular toolkits for building screens out of reusable pieces called components. They all solve the same problem, with different amounts of structure.',

  cards: [
    { kind: 'code', title: 'The old way: poke the page by hand',
      body: `You are building a to-do list. When someone adds an item, you must update the list, the "3 items" counter and the "nothing to do" message. Tap the lines that all have to stay in step.`,
      code: { lang: 'js', src: `
        function addTodo(text) {
          const li = document.createElement('li');
          li.textContent = text;
          list.appendChild(li);
          counter.textContent = list.children.length + ' items';
          emptyMessage.hidden = true;
        }
        // and deleteTodo(), and clearAll(), and ...`,
        notes: {
          4: 'Step one: change the list.',
          5: 'Step two: do not forget the counter.',
          6: 'Step three: do not forget the empty message. Miss one and the screen lies.',
          8: 'Every new way to change the data needs the same careful dance. This is **imperative** code: how, step by step.'
        } } },

    { kind: 'code', title: 'The new way: describe the screen',
      body: `**Declarative** UI flips it: you describe **what the screen should look like for the current data**, and the framework works out the changes. Here is a React-style version. Tap to explore.`,
      code: { lang: 'js', src: `
        import { useState } from 'react';

        function Counter({ label }) {
          const [count, setCount] = useState(0);
          return (
            <button onClick={() => setCount(count + 1)}>
              {label}: {count}
            </button>
          );
        }`,
        notes: {
          3: 'A **component** is a function that returns a description of some UI. \`label\` is a **prop**: an input from the parent.',
          4: '**State**: a value the component remembers. Changing it asks React to draw the component again.',
          6: 'An event handler. It changes the data, not the page.',
          7: 'The UI is written as a function of \`label\` and \`count\`. Whatever they are, the button shows them.'
        } } },

    { kind: 'metaphor', title: 'Cookie cutter and dough',
      body: `A **component** is a cookie cutter. The shape is fixed once: a button, a product card, a comment box. The dough you press it into changes every time: the title, the price, the picture.

        Components can be nested: a *page* contains a *product list* which contains many *product cards*, each made from the same cutter and different dough. The inputs you hand to a component are usually called **props**.

        Change the cutter once and every cookie changes. That is the real gain: **reuse and one place to fix things**. The metaphor stops at dough: real components can also hold memory (state) and react to clicks.` },

    { kind: 'code', title: 'Vue: the same idea, different feel',
      body: '**Vue** keeps the HTML, script and styling of a component together in one file, with a template that looks like ordinary HTML.',
      code: { lang: 'html', src: `
        <script setup>
        import { ref } from 'vue'
        defineProps(['label'])
        const count = ref(0)
        </script>

        <template>
          <button @click="count++">{{ label }}: {{ count }}</button>
        </template>`,
        notes: {
          3: 'The prop again: an input from the parent.',
          4: '\`ref\` makes a **reactive** value. Vue notices when it changes and updates exactly what uses it.',
          8: 'The template is HTML-like. \`@click\` is the event handler, and the double braces show a value.'
        } } },

    { kind: 'concept', title: 'Angular: the full toolbox',
      body: `**Angular**, started at Google, is a complete framework rather than a view library. It comes with a router, form handling, an HTTP client, **dependency injection** (the framework hands each class the services it asks for), a command-line tool and testing set-up, all designed to work together.

        You write in **TypeScript**, and a component is a class with a decorator that links it to an HTML template. It often uses **RxJS** streams for asynchronous data, and newer versions have added signals and simpler standalone components.

        The trade-off: more to learn at the start, but fewer decisions and a consistent shape across a large team.` },

    { kind: 'compare', title: 'Three takes, side by side',
      body: 'All three build UIs from components. They differ in how much they include and how it feels to write.',
      cols: ['React', 'Vue', 'Angular'],
      rows: [
        ['What it is', 'A UI library', 'A progressive framework', 'A full platform'],
        ['Templates', 'JSX: markup inside JavaScript', 'HTML-like single-file components', 'HTML templates plus a TypeScript class'],
        ['Language', 'JavaScript or TypeScript', 'JavaScript or TypeScript', 'TypeScript'],
        ['Batteries', 'Pick your own router, state, forms', 'Official router and state libraries', 'Router, forms, HTTP, DI, testing included'],
        ['Started at', 'Meta', 'An independent developer, Evan You', 'Google']
      ],
      note: 'There are others too, such as Svelte, which does much of its work at build time. This is a map, not a league table.' },

    { kind: 'concept', title: 'What an architect should weigh',
      body: `There is rarely a wrong answer for an ordinary app. The useful questions are about **your situation**:

        - **People**: what does your team already know, and how easy is it to hire or train in your market?
        - **Structure**: do you want a toolbox with strong conventions (Angular), or a smaller core where you pick the extras (React, Vue)?
        - **Longevity**: who maintains it, how stable are upgrades, how long have teams been running it in production?
        - **Fit**: does it work with your rendering choice, your mobile plans, your testing approach?
        - **Performance**: all three are fast enough for most apps. It is rarely the deciding factor.` },

    { kind: 'pitfall', title: 'Welding your business to the framework',
      body: `The costly mistake is not picking the "wrong" framework. It is letting framework code seep into **everything**: business rules written inside components, data fetching tangled with markup.

        Then a framework upgrade, or a change of heart, means rewriting the product.

        Keep rules like "how is a discount calculated?" in plain functions that know nothing about React, Vue or Angular, and let components call them. It is the same separation you met in the architecture modules, applied to the front end.` },

    { kind: 'tip', title: 'Choose with a small experiment',
      body: `If the team is split, build the same small, real feature in each candidate for a day or two. Measure what matters to you: how clear the code reads, how quickly newcomers get going, how testing feels.

        And weigh the **boring** option seriously. A familiar tool with a known upgrade path and people who understand it often beats the exciting one.

        Finally, write the decision down as a short **ADR** with the reasons. Future you will want to know why.` }
  ],

  activities: [
    { type: 'ab', after: 1, q: 'The list needs a new feature: “clear all”. Which approach keeps the counter and empty message correct with less effort?',
      a: { lang: 'js', label: 'Imperative', src: `
        function clearAll() {
          list.innerHTML = '';
          counter.textContent = '0 items';
          emptyMessage.hidden = false;
        }` },
      b: { lang: 'js', label: 'Declarative', src: `
        function clearAll() {
          setTodos([]);
        }
        // the component re-renders:
        // list, counter and message all follow todos` },
      answer: 'b',
      explain: 'In the declarative version you change the data and the screen follows from it. In the imperative one every operation must remember to update every affected part.' },

    { type: 'tf', after: 3, statement: 'A component’s props are inputs passed in by its parent, much like function arguments.', answer: true,
      explain: 'Props are how a parent hands data to a child. The child describes its UI as a function of them.' },

    { type: 'mcq', after: 4, q: 'What most clearly separates Angular from React or Vue?',
      options: ['It ships a router, forms and DI built in', 'It cannot be used for large applications', 'It does not use components', 'It runs only on the server'],
      answer: 0,
      why: [null, 'Large teams often choose it because of that built-in structure.', 'Components are central to Angular.', 'Angular apps run in the browser, and can also render on a server.'],
      explain: 'Angular is opinionated and includes a lot, which means fewer choices and more to learn. React and Vue are smaller cores that you extend.' },

    { type: 'match', prompt: 'Match each framework to its description.',
      pairs: [['React', 'A UI library; JSX puts markup in JavaScript'], ['Vue', 'Single-file components with HTML-like templates'], ['Angular', 'A full TypeScript framework with dependency injection'], ['Prop', 'An input a parent passes to a component'], ['State', 'A value a component remembers between renders']],
      explain: 'The first three differ in size and style. Props and state are ideas you will meet in all of them.' },

    { type: 'multi', q: 'Which of these are sensible things to weigh when choosing a front-end framework?',
      options: ['What your team already knows and can hire for', 'How stable the upgrade path and governance are', 'Whether it fits your rendering and mobile plans', 'Which one is trending on social media this month', 'Which has the shortest name'],
      answers: [0, 1, 2],
      explain: 'Skills, longevity and fit are about your situation. Trends and names say nothing about whether the choice will serve you in three years.' },

    { type: 'short', q: 'In React, what is the usual name for the inputs a parent passes into a component?', accept: ['props', 'prop', 'properties'], hint: 'Short for “properties”.',
      explain: 'Props flow from parent to child. A child should not change its own props; it asks its parent through events.' },

    { type: 'cloze', code: true, text: 'function Counter({ label }) {\n  const [count, {{setCount}}] = {{useState}}(0);\n  return <button onClick={() => setCount(count + 1)}>{label}: {count}</button>;\n}',
      distractors: ['render', 'extends', 'document'],
      explain: '`useState` gives the current value and a function to change it. Calling `setCount` tells React to draw the component again with the new value.' },

    { type: 'scenario', title: 'The framework debate', meters: { team: 50, risk: 50, momentum: 50 },
      intro: 'Your company is starting a new customer portal. Four developers know React, one knows Angular, and two interns have only tried Vue. The CTO asks you to pick a framework by Friday.',
      steps: [
        { text: 'How do you approach the decision?',
          choices: [
            { label: 'Weigh team skills, hiring, maintenance and fit with the plans, and pick the option that suits them', score: 2, effects: { team: 20, risk: -15, momentum: 15 }, feedback: 'You decide on your situation and write down your reasons. That is how an architect decides.' },
            { label: 'Choose whatever you personally like most', score: 0, effects: { team: -20, risk: 15, momentum: -5 }, feedback: 'Personal taste matters less than whether the team can deliver and maintain the product.' },
            { label: 'Pick the newest framework because it is exciting', score: 0, effects: { team: -10, risk: 25 }, feedback: 'New and exciting often means a smaller ecosystem and an unproven upgrade path.' }
          ] },
        { text: 'The product manager asks: “Can we put pricing rules inside the components? It is quicker.”',
          choices: [
            { label: 'Keep pricing rules in plain functions, outside components, and have components call them', score: 2, effects: { risk: -20, team: 10, momentum: 10 }, feedback: 'The rules are easy to test and survive a future framework change.' },
            { label: 'Agree: put it in the components for speed', score: 0, effects: { risk: 25, momentum: 5 }, feedback: 'Fast now, but the business logic is now welded to one framework.' },
            { label: 'Say no and refuse to discuss it', score: 1, effects: { team: -15, momentum: -10 }, feedback: 'The instinct is right, but a refusal builds friction. Explain the benefit instead.' }
          ] }
      ],
      outro: 'Decide on your team and goals, and keep business logic independent of the framework.' },

    { type: 'explain', prompt: 'Explain declarative UI and components to a developer who only used to update the page by hand.',
      model: 'Instead of poking the page step by step, you describe what the screen should look like for the current data and the framework works out the changes. A component is a reusable piece, like a function, that takes props as input, may hold state, and returns UI. React is a UI library using JSX, Vue uses HTML-like single-file components, and Angular is a full TypeScript framework with routing and dependency injection. I would choose by team skills, longevity and fit, and keep business logic independent of the framework.',
      keywords: ['declarative', 'component', 'props', 'state', 'React', 'Vue', 'Angular', 'logic'] }
  ],

  flashcards: [
    { q: 'Imperative vs declarative UI?', a: 'Imperative: you update the page step by step. Declarative: you describe the screen for the current data and the framework updates it.' },
    { q: 'What is a component?', a: 'A reusable piece of UI that takes inputs (props), may hold state, and describes what to show.' },
    { q: 'What are props and state?', a: 'Props are inputs passed from a parent. State is a value the component itself remembers and can change.' },
    { q: 'React, Vue and Angular in one line each?', a: 'React: a UI library with JSX. Vue: a progressive framework with HTML-like single-file components. Angular: a full TypeScript framework with routing, forms and dependency injection built in.' },
    { q: 'What should an architect weigh when choosing a framework?', a: 'Team skills and hiring, structure wanted, longevity and governance, fit with rendering and mobile plans. Performance is rarely decisive.' },
    { q: 'How do you avoid being welded to a framework?', a: 'Keep business rules in plain functions that know nothing about the framework, and let components call them.' }
  ],

  glossary: [
    { term: 'Component', def: 'A reusable building block of a user interface that takes inputs and describes what to display.', like: 'A cookie cutter you press into different dough.' },
    { term: 'Declarative UI', def: 'Describing what the screen should look like for the current data, and leaving the framework to work out the updates.', like: 'Telling a decorator the finished room, not every nail to hammer.' },
    { term: 'Props', def: 'The inputs a parent component passes to a child component.', like: 'The arguments to a function.', aka: ['properties'] },
    { term: 'Dependency injection', def: 'A framework handing each class the helper services it asks for, instead of the class creating them itself.', like: 'A waiter bringing the cutlery you asked for.', aka: ['DI'] },
    { term: 'TypeScript', def: 'JavaScript with added types that are checked before the code runs.', like: 'JavaScript with a spell-checker for data.', aka: ['TS'] }
  ],

  takeaways: [
    'Declarative UI: describe the screen for the data, and let the framework update it.',
    'A component takes props, may hold state, and returns UI.',
    'React is a library, Vue a progressive framework, Angular a full platform.',
    'Choose by team, longevity and fit, and keep business logic out of components.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('wm-state-reactive', {
  eli5: 'Keep the facts in one place, and let the screen be calculated from them. When a fact changes, the screen updates itself, instead of you chasing every spot that shows it.',

  cards: [
    { kind: 'concept', title: 'The cart that disagrees with itself',
      body: `A shop's header says **Cart (2)**. You open the cart page and it lists **three** items. Someone added a product, updated the list, and forgot the badge.

        The bug is not about carelessness. It is about **two copies of the truth**: one number in the header and one list on the page, each updated separately. Any time the same fact lives in two places, they will eventually disagree.

        Modern front-end design is largely a set of tricks for avoiding exactly this. The big idea: keep **state** (the facts) in one place, and treat everything on screen as something *worked out* from it.` },

    { kind: 'code', title: 'UI as a function of state',
      body: 'Here is the idea in one picture. The same state always gives the same screen, and there is nowhere for the badge to drift.',
      code: { lang: 'js', src: `
        const view = (state) => (
          <section>
            <h2>Cart ({state.items.length})</h2>
            {state.items.map(i => <li>{i.name}</li>)}
          </section>
        );`,
        notes: {
          1: 'The view takes the **state** in and gives the screen out. Nothing else.',
          3: 'The badge number is **calculated** from the items, not stored separately. It cannot disagree.',
          4: 'The list comes from the same items. Add an item to the state and both places change.'
        } } },

    { kind: 'diagram', title: 'One-way data flow',
      body: 'Data flows **down** into the view; events flow **up** as requests to change the state. The loop runs in one direction, so it is easy to trace.',
      nodes: [
        { id: 'st', label: 'State', icon: '🧠', x: 1, y: 0, tone: 'accent' },
        { id: 'vw', label: 'View (what you see)', icon: '🖼️', x: 1, y: 1 },
        { id: 'ev', label: 'User event: click', icon: '👆', x: 1, y: 2, tone: 'warn' },
        { id: 'up', label: 'Update function', x: 2, y: 2, tone: 'info' }
      ],
      edges: [
        { from: 'st', to: 'vw', label: 'drives' },
        { from: 'vw', to: 'ev', label: 'user acts' },
        { from: 'ev', to: 'up', label: 'calls' },
        { from: 'up', to: 'st', label: 'new state', dashed: true }
      ],
      caption: 'The view never edits itself or the state directly. It asks, the update function decides, and the view redraws.' },

    { kind: 'metaphor', title: 'A spreadsheet that tidies itself',
      body: `In a spreadsheet, type **price** in one cell and **quantity** in another, and write \`=price × quantity\` in a third. Change the price and the total updates instantly. You never wrote "now update the total". You described how it is **derived**.

        That is the heart of **reactive** programming: some values are *sources* (you change them), others are *derived* (they follow along), and the system keeps the derived ones fresh.

        The metaphor stops at scale: a screen has far more cells than a sheet, and updating only the ones that need it is where frameworks compete.` },

    { kind: 'code', title: 'Signals: values that know who is watching',
      body: 'A **signal** is a value that remembers who has read it, and tells them when it changes. Spellings vary by library, but the idea is the same.',
      code: { lang: 'js', src: `
        const price = signal(10);
        const qty = signal(2);
        const total = computed(() => price.value * qty.value);

        effect(() => console.log('Total is', total.value));

        qty.value = 3;   // prints: Total is 30`,
        notes: {
          1: 'A **source** value. Reading \`.value\` inside a computation is how it learns who depends on it.',
          3: '**Derived**: \`total\` is calculated from the other two and recalculated only when one of them changes.',
          5: 'An **effect** runs when what it reads changes. Frameworks use this to update the screen.',
          7: 'No manual wiring. Changing \`qty\` notifies \`total\`, which notifies the effect.'
        } },
      note: 'React usually re-runs a component’s function and compares the result with the previous one. Vue, Solid and Angular track exactly which values each part reads, and update only those. Different routes to the same goal, each with trade-offs.' },

    { kind: 'concept', title: 'Functional ideas in the front end',
      body: `Good UI code borrows three ideas from functional programming:

        - **Pure components**: given the same inputs, they draw the same output, and change nothing outside themselves. That makes them easy to test.
        - **Immutability**: do not edit state in place. Create a new copy with the change. The framework can compare "old" and "new" cheaply, and you can keep history for undo.
        - **Derive, do not duplicate**: if a value can be calculated from the state, calculate it. Do not store a second copy.

        A related pattern is the **reducer**: one function that takes the current state plus an action and returns the next state. It is the heart of libraries like Redux.` },

    { kind: 'compare', title: 'Client state and server state',
      body: 'Not all state is equal. Mixing the two up is behind many messy front ends.',
      cols: ['Client state', 'Server state'],
      rows: [
        ['Lives', 'Only in the browser', 'In the backend; the browser holds a copy'],
        ['Examples', 'Is the menu open? Text in a box?', 'Orders, profile, stock levels'],
        ['Truth', 'The browser is the truth', 'The server is the truth'],
        ['Main problems', 'Keeping it in one place', 'Staleness, loading, errors, caching'],
        ['Helpers', 'Component state, signals, a store', 'Data-fetching caches such as TanStack Query or SWR']
      ],
      note: 'The URL is state too: the current page, filters and tab are best kept in it, so links and the back button work.' },

    { kind: 'pitfall', title: 'Copying server data into a giant store',
      body: `A common trap: fetch the orders from the API, then copy them into a big global store "so every component can reach them". Now you have two versions of the orders, yours and the server's, and **you** are responsible for keeping them in step: refreshing, handling errors, removing duplicates.

        Another trap is the opposite: putting every little thing in global state, so a dropdown opening redraws half the app. And **prop drilling**, passing a value through five components that do not need it.

        Server data is a *cache* of someone else's truth. Treat it like one.` },

    { kind: 'tip', title: 'Where should state live?',
      body: `A practical rule: **keep state as close to where it is used as you can**, and lift it up only when two parts need to share it.

        - Used by one component? Keep it in that component.
        - Needed by siblings? Lift to their common parent.
        - Needed across the app, like the signed-in user or the theme? A shared store or context.
        - Comes from the server? Use a data-fetching cache that handles staleness for you.

        And whenever you reach for a second variable, ask: *could I calculate this from what I already have?*` }
  ],

  activities: [
    { type: 'order', after: 2, prompt: 'Put the one-way data flow loop in order.', items: ['State holds the current facts', 'The view is drawn from the state', 'The user clicks something', 'An update function runs', 'A new state is produced and the view redraws'],
      explain: 'Data goes down into the view, events go up as requests, and the update function produces new state. The cycle is easy to follow because it only runs one way.' },

    { type: 'mcq', after: 3, q: 'In the spreadsheet metaphor, the total cell (price × quantity) corresponds to which idea?',
      options: ['A derived value that follows from the sources', 'A second copy of the price', 'An event handler', 'A server request'],
      answer: 0,
      why: [null, 'It is calculated from the price, not a duplicate that needs separate updating.', 'Event handlers respond to things like clicks. A total is just worked out.', 'Nothing in a spreadsheet formula talks to a server.'],
      explain: 'The total is derived. Change a source and it updates automatically, so it can never disagree with its inputs.' },

    { type: 'tf', after: 4, statement: 'With signals, you must manually tell the total to recalculate each time the quantity changes.', answer: false,
      explain: 'The signal system records that the total reads the quantity, and it recalculates automatically when it changes.' },

    { type: 'spot', prompt: 'One line stores something that could be calculated. Tap it.',
      code: { lang: 'js', src: `
        const [items, setItems] = useState([]);
        const [count, setCount] = useState(0);
        function add(item) {
          setItems([...items, item]);
          setCount(count + 1);
        }` },
      lines: [2],
      explain: 'The count is just items.length. Storing it separately invites the two to drift apart, exactly like the badge that said 2 while the cart held 3.' },

    { type: 'bucket', prompt: 'Client state or server state?', buckets: ['Client state', 'Server state'],
      items: [['Is the mobile menu open?', 0], ['The list of orders from the API', 1], ['Text half-typed into a search box', 0], ['The signed-in user’s profile from the backend', 1], ['Which tab is selected', 0], ['Product stock levels', 1]],
      explain: 'Server state is a cached copy of data the server owns, so it can go stale and needs loading and error handling. Client state exists only in the browser.' },

    { type: 'ab', q: 'Which update lets a framework easily notice that the list changed?',
      a: { lang: 'js', label: 'Edit in place', src: `
        state.items.push(item);
        render(state);` },
      b: { lang: 'js', label: 'New copy', src: `
        state = {
          ...state,
          items: [...state.items, item]
        };` },
      answer: 'b',
      explain: 'A new object is clearly different from the old one, so change detection is cheap and history is easy to keep. Editing in place hides the change inside the same object.' },

    { type: 'scenario', title: 'The stale orders page', meters: { trust: 50, simplicity: 50 },
      intro: 'A support dashboard fetches orders from the API on load and copies them into a global store. Agents complain: they see orders that were cancelled an hour ago, and sometimes the same order appears twice.',
      steps: [
        { text: 'What is the root of the problem?',
          choices: [
            { label: 'Server data was copied into a global store that now has to be kept in step by hand', score: 2, effects: { trust: 20, simplicity: 15 }, feedback: 'Exactly. The store is a second copy of the truth, and nobody owns refreshing and de-duplicating it.' },
            { label: 'The API is returning wrong data', score: 0, effects: { trust: -5 }, feedback: 'The server data is fine. The front end is holding an out-of-date copy.' },
            { label: 'The browser is too slow', score: 0, effects: { trust: -5 }, feedback: 'Speed has nothing to do with seeing outdated orders.' }
          ] },
        { text: 'How do you fix it?',
          choices: [
            { label: 'Use a server-state cache that refetches when stale and de-duplicates requests; keep only UI state in the store', score: 2, effects: { trust: 30, simplicity: 25 }, feedback: 'Staleness, refetching and duplicates are handled in one place, and the store shrinks to real client state.' },
            { label: 'Add a manual Refresh button and ask agents to press it', score: 1, effects: { trust: 5, simplicity: -5 }, feedback: 'It helps but pushes the problem onto users, and the duplicate-order bug remains.' },
            { label: 'Put even more data into the global store', score: 0, effects: { trust: -15, simplicity: -20 }, feedback: 'More copies mean more places to be wrong.' }
          ] }
      ],
      outro: 'Treat server data as a cache with a refresh policy, and keep global state for what truly belongs to the client.' },

    { type: 'explain', prompt: 'Explain “UI is a function of state” and why derived values should be calculated, not stored.',
      model: 'The screen is calculated from the state: the same state always produces the same UI. Data flows down into the view and events flow up as requests, so the loop only runs one way and is easy to trace. If a value can be derived, such as a count from a list, I calculate it rather than store it, so two copies cannot drift apart. Signals do this automatically by tracking what depends on what. Server data is a cache of the server’s truth, handled differently from client state.',
      keywords: ['state', 'derived', 'one-way', 'function', 'signals', 'server state', 'copies'] }
  ],

  flashcards: [
    { q: 'What does “UI is a function of state” mean?', a: 'The screen is calculated from the current state, so the same state always gives the same screen.' },
    { q: 'What is one-way data flow?', a: 'Data flows down into the view and events flow up as requests to change state, so changes follow a single traceable loop.' },
    { q: 'What is a signal?', a: 'A reactive value that tracks what reads it and notifies those readers when it changes.' },
    { q: 'Why derive values instead of storing them?', a: 'A second stored copy can drift out of step with its source. A derived value cannot disagree.' },
    { q: 'Client state vs server state?', a: 'Client state lives only in the browser. Server state is a cached copy of data the server owns, so it can go stale and needs loading and error handling.' }
  ],

  glossary: [
    { term: 'State', def: 'The facts an app remembers at any moment, from which the screen is drawn.', like: 'The numbers typed into a spreadsheet.' },
    { term: 'One-way data flow', def: 'A design where data moves down into the view and changes are requested by events moving back up, in a single loop.', like: 'A one-way street system: easy to trace.' },
    { term: 'Reactive', def: 'Describes values and screens that update automatically when the things they depend on change.', like: 'A spreadsheet formula.' },
    { term: 'Signal', def: 'A reactive value that remembers who reads it and notifies them when it changes.', like: 'A cell that tells every formula using it to recalculate.' },
    { term: 'Immutability', def: 'Not changing data in place; making a new copy with the change instead.', like: 'Writing a new draft instead of scribbling over the old one.' }
  ],

  takeaways: [
    'Keep one copy of each fact. Calculate everything else from it.',
    'Data flows down, events flow up: a one-way loop is easy to follow.',
    'Signals and reactive values update dependants automatically.',
    'Server data is a cache of the server’s truth, not your own state.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('wm-microfrontends', {
  eli5: 'A microfrontend splits one big website into smaller pieces, each built and released by a different team, then stitches them together so visitors see one page.',

  cards: [
    { kind: 'concept', title: 'Eight teams, one front end',
      body: `A big online retailer has one front-end codebase. Eight teams edit it: search, product pages, basket, checkout, account, and so on. Every change goes through the same build. Releases happen every two weeks because that is how long the big test run takes. When one team breaks the build, **all eight** wait.

        The back end was split into microservices years ago, and teams own their services. But the front end is still one lump, and it has become the bottleneck.

        **Microfrontends** apply the microservice idea to the front end: split by business area, give each slice to one team, and let it ship on its own.` },

    { kind: 'metaphor', title: 'A shopping mall',
      body: `A mall has a shared building: floors, lifts, signs, fire exits, opening hours. Inside, each shop is run by a different company. The shoe shop can redecorate over a weekend without asking the bookshop.

        In a microfrontend setup, the **shell** is the mall: the page frame, navigation and shared rules. Each microfrontend is a shop: search, basket, account. Customers walk through and see one mall.

        The metaphor stops at consistency: real malls only have to look tidy. A website also has to share login, data and speed, and shops that each fit their own lighting get expensive for the customer.` },

    { kind: 'diagram', title: 'One page, four owners',
      body: 'Each box on the page is owned, built and deployed by a different team, usually with its own back end.',
      nodes: [
        { id: 'shell', label: 'Shell: header, routing', icon: '🏬', x: 1, y: 0, tone: 'accent' },
        { id: 'search', label: 'Search (team A)', x: 0, y: 1 },
        { id: 'product', label: 'Product (team B)', x: 1, y: 1 },
        { id: 'cart', label: 'Cart (team C)', x: 2, y: 1 },
        { id: 'sapi', label: 'Search API', x: 0, y: 2, tone: 'muted' },
        { id: 'papi', label: 'Catalogue API', x: 1, y: 2, tone: 'muted' },
        { id: 'capi', label: 'Cart API', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'shell', to: 'search', label: 'loads', dashed: true },
        { from: 'shell', to: 'product', dashed: true },
        { from: 'shell', to: 'cart', dashed: true },
        { from: 'search', to: 'sapi' },
        { from: 'product', to: 'papi' },
        { from: 'cart', to: 'capi' }
      ],
      groups: [{ label: 'One vertical slice per team', x: 0, y: 1, w: 3, h: 2 }],
      caption: 'Slices go all the way down: a team owns the screen and its back end.' },

    { kind: 'compare', title: 'Ways to stitch the pieces together',
      body: 'Composition means putting the pieces on one page. There are several routes, each with a price.',
      cols: ['How it works', 'Good for', 'Watch out for'],
      rows: [
        ['Build-time packages', 'Each piece is a package; the shell builds them together', 'Simple, fast', 'Not independent: any change rebuilds all'],
        ['Server-side includes', 'The server (or edge) assembles HTML fragments', 'Fast first load, good SEO', 'Needs a smart server layer'],
        ['Run-time in the browser', 'The shell loads each piece’s script when needed (for example Module Federation or single-spa)', 'True independent deployment', 'Shared dependencies and version clashes'],
        ['iframes', 'Each piece lives in its own mini page', 'Strong isolation', 'Awkward sizing, routing and accessibility'],
        ['Web Components', 'Pieces wrapped as custom HTML elements, a browser standard', 'Framework-neutral', 'Needs care with styling and shared state']
      ] },

    { kind: 'code', title: 'How do the pieces talk?',
      body: 'Keep them loosely coupled. One common approach is broadcasting simple events through the browser, rather than importing each other’s code.',
      code: { lang: 'js', src: `
        // In the cart microfrontend
        window.dispatchEvent(new CustomEvent('cart:item-added', {
          detail: { sku: 'A12', qty: 1 }
        }));

        // In the header microfrontend
        window.addEventListener('cart:item-added', (e) => {
          updateBadge(e.detail.qty);
        });`,
        notes: {
          2: 'The cart announces *what happened* using a plain browser event. It does not know who is listening.',
          7: 'The header listens. Neither team imports the other’s code, so either can be rewritten or deployed alone.',
          8: 'The event name and its payload become a **contract** between teams. Treat changes to it like API changes.'
        } } },

    { kind: 'concept', title: 'A shared design system keeps it one product',
      body: `Eight teams, eight ideas of what a button looks like. Unless you do something, your site will look like a car boot sale.

        A **design system** is the cure: a shared library of **design tokens** (colours, spacing, fonts as named values) and ready-made **components** (buttons, inputs, modals), plus the rules for using them.

        Every microfrontend consumes the same library, so the pieces look and behave alike. The cost is a new thing to maintain: someone owns the system, versions it carefully, and helps teams upgrade. A design system is a product with its own users.` },

    { kind: 'compare', title: 'What you gain, what you pay',
      body: 'Microfrontends solve an organisational problem. They do not make software simpler.',
      cols: ['You gain', 'You pay'],
      rows: [
        ['Releases', 'Teams deploy independently', 'Integration and version coordination'],
        ['Ownership', 'Clear vertical ownership', 'Possible duplicate work between teams'],
        ['Tech choice', 'Teams can upgrade at their own pace', 'Several frameworks or versions on one page'],
        ['Size', 'Smaller codebases to understand', 'Heavier pages and more moving parts'],
        ['Consistency', 'Autonomy', 'Needs a design system to avoid a patchwork']
      ] },

    { kind: 'pitfall', title: 'Five copies of the same library',
      body: `If every microfrontend bundles its own framework, the browser downloads it five times, and parts of the page may disagree about versions. A page that was supposed to be lighter becomes heavier.

        Other classic mistakes:

        - **Slicing too small.** A microfrontend per button creates a distributed system on the page, with all the network and coordination troubles you met in the resilience module.
        - **Slicing by technical layer** rather than business area, so teams still depend on each other for every feature.
        - **A shell that grows into a new monolith.**

        Shared dependencies, strict contracts and sensible slice sizes are the cure.` },

    { kind: 'tip', title: 'Earn your microfrontends',
      body: `Start with a **modular monolith**: one front end, strongly separated modules with clear boundaries and owners. If a single team can build it, a single deployable is cheaper, faster and easier to test.

        Split when the pain is real: many teams, blocked releases, truly independent business areas. Remember **Conway's Law**: the structure of your teams and the structure of your system tend to match, so split along team lines.

        Microfrontends are also a handy way to retire a legacy front end gradually: route one page at a time to the new code, like the strangler fig pattern.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What problem do microfrontends mainly aim to solve?',
      options: ['Many teams blocking each other on one shared front-end codebase and release', 'The browser being unable to run JavaScript', 'The back end using too much memory', 'Pages needing to look identical'],
      answer: 0,
      why: [null, 'Browsers handle JavaScript fine. This is an organisation-scale issue.', 'That is a back-end concern and unrelated.', 'Looking identical is the job of a design system, which microfrontends actually make harder.'],
      explain: 'Microfrontends are mostly an answer to team and release coupling. They trade technical simplicity for organisational independence.' },

    { type: 'match', after: 3, prompt: 'Match each composition technique to what is distinctive about it.',
      pairs: [['Build-time packages', 'Simple, but not independently deployable'], ['Server-side includes', 'HTML fragments assembled before reaching the browser'], ['Run-time loading', 'The shell loads each piece’s script in the browser'], ['iframes', 'Strong isolation, awkward integration'], ['Web Components', 'Framework-neutral custom elements']],
      explain: 'The more independent the pieces, the more integration work you must do yourself, and each technique sits at a different point on that line.' },

    { type: 'tf', after: 4, statement: 'Two microfrontends should import each other’s internal code directly, so they can share functions easily.', answer: false,
      explain: 'Direct imports tie their releases together and defeat the point. Prefer small contracts such as events or a published interface.' },

    { type: 'ab', q: 'Which design leaves the header team free to deploy on their own?',
      a: { lang: 'js', label: 'Direct import', src: `
        // header code
        import { cartCount } from '../cart/internal/store';
        badge.textContent = cartCount();` },
      b: { lang: 'js', label: 'Event contract', src: `
        // header code
        window.addEventListener('cart:item-added', (e) => {
          badge.textContent = e.detail.qty;
        });` },
      answer: 'b',
      explain: 'The event is a small public contract. The first version reaches into the cart team’s private code, so any internal change over there can break the header.' },

    { type: 'multi', q: 'Which of these are real costs of microfrontends?',
      options: ['Duplicate dependencies make pages heavier', 'Integration testing across slices is harder', 'Styles can drift without a shared design system', 'Teams can no longer deploy independently', 'Browsers refuse to load more than one script'],
      answers: [0, 1, 2],
      explain: 'Independence is the benefit, so it is not a cost. The real costs are heavier pages, trickier integration testing and visual inconsistency.' },

    { type: 'estimate', q: 'Five microfrontends each bundle their own copy of the same 100 KB library. Roughly how many KB of that library does a visitor download in total?', answer: 500, unit: 'KB', tolerance: 1.3, min: 10, max: 5000,
      explain: '5 × 100 KB = 500 KB, four of them wasted. Sharing one copy of common dependencies brings it back to about 100 KB.' },

    { type: 'scenario', title: 'Should we split the front end?', meters: { speed: 40, complexity: 30, consistency: 60 },
      intro: 'You are the architect at a company with 60 front-end developers in nine teams. Releases are fortnightly, because every change goes through one big test run, and a single broken commit blocks everyone. Leadership asks whether to adopt microfrontends.',
      steps: [
        { text: 'What do you recommend as the first move?',
          choices: [
            { label: 'Modularise by business area inside the monolith first, then split the areas that are truly independent', score: 2, effects: { speed: 20, complexity: 5, consistency: 10 }, feedback: 'Clear boundaries and owners come first. You split only where it pays, and you learn cheaply.' },
            { label: 'Rewrite everything as microfrontends at once', score: 0, effects: { speed: -15, complexity: 40, consistency: -20 }, feedback: 'A big-bang rewrite of 60 developers’ work is slow and risky, and the boundaries are still guesswork.' },
            { label: 'Do nothing; it is a trend', score: 1, effects: { speed: -10, complexity: -5 }, feedback: 'The pain is real: blocked releases for nine teams. Ignoring it has a cost.' }
          ] },
        { text: 'Two teams now run their own slices. Their buttons and fonts look different. What do you do?',
          choices: [
            { label: 'Invest in a shared design system with owned, versioned components and tokens', score: 2, effects: { consistency: 35, complexity: 5 }, feedback: 'One source of visual truth keeps autonomy without a patchwork.' },
            { label: 'Ask each team to copy the other’s CSS', score: 0, effects: { consistency: -10, complexity: 5 }, feedback: 'Copies drift apart within weeks.' },
            { label: 'Ignore it; users will not notice', score: 0, effects: { consistency: -25 }, feedback: 'Inconsistent buttons and spacing make the product feel unfinished and erode trust.' }
          ] }
      ],
      outro: 'Split along real boundaries when the organisational pain is real, and pay for the shared design system that makes it hang together.' },

    { type: 'explain', prompt: 'Explain microfrontends to a colleague: what they are, how pieces are composed, and when you would not use them.',
      model: 'Microfrontends split a front end by business area so each team owns and deploys its own slice, with a shell stitching them together. Composition can be at build time, on the server, in the browser at run time, with iframes, or with Web Components. A shared design system keeps them looking like one product. They help when many teams block each other, but cost duplicate dependencies, more integration work and consistency effort. For a small team, a modular monolith is simpler.',
      keywords: ['shell', 'teams', 'compose', 'design system', 'independent', 'cost', 'monolith'] }
  ],

  flashcards: [
    { q: 'What are microfrontends?', a: 'Splitting a front end by business area into slices that separate teams build and deploy independently, composed into one page.' },
    { q: 'Name three ways to compose microfrontends.', a: 'Build-time packages, server-side includes, run-time loading in the browser (and iframes or Web Components).' },
    { q: 'What does a design system provide?', a: 'Shared design tokens and ready-made components with usage rules, so independent teams still look like one product.' },
    { q: 'How should microfrontends communicate?', a: 'Through small, stable contracts such as events or published interfaces, not by importing each other’s internals.' },
    { q: 'When might you not use microfrontends?', a: 'With a small team or tightly coupled product, where a modular monolith is simpler and cheaper.' }
  ],

  glossary: [
    { term: 'Microfrontend', def: 'An independently built and deployed slice of a web front end, owned by one team and composed with others into one page.', like: 'A shop in a mall.' },
    { term: 'Shell', def: 'The host page or app that provides navigation and shared services and loads each microfrontend.', like: 'The mall building around the shops.', aka: ['container app'] },
    { term: 'Design system', def: 'A shared set of design tokens, components and guidelines that keeps many teams’ interfaces consistent.', like: 'A shared set of brand rules and a box of standard parts.' },
    { term: 'Design tokens', def: 'Named design values such as colours, spacing and font sizes, shared by every component.', like: 'A paint chart with names for each colour.' },
    { term: 'Modular monolith', def: 'A single deployable application built from clearly separated modules with defined boundaries.', like: 'One building with sturdy internal walls.' }
  ],

  takeaways: [
    'Microfrontends split a front end by business area so teams ship independently.',
    'Composition options range from build-time packages to run-time loading, iframes and Web Components.',
    'A shared design system keeps independent slices looking like one product.',
    'They solve a team problem and add technical cost. Start with a modular monolith.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('wm-mobile-pwa', {
  eli5: 'You can reach people’s phones by building a separate app for each phone type, one shared app, or a website that behaves like an app. Each choice changes how you build, ship and update.',

  cards: [
    { kind: 'concept', title: 'You cannot just redeploy a phone',
      body: `On the web, shipping a fix is easy: deploy, and everyone gets it on their next visit. Mobile apps are different. Users download a **version** from an app store, the store reviews your update, and then people update **when they feel like it**, or never.

        So the app in someone's pocket may be a year old, talking to your latest backend. That one fact explains most of mobile architecture: the choice of how to build the app, how it behaves with a bad connection, and how your API must treat old clients.

        First, the big question: how do you build it?` },

    { kind: 'compare', title: 'Native, cross-platform and hybrid',
      body: 'Three ways to build a phone app, from closest to the device to closest to the web.',
      cols: ['Native', 'Cross-platform', 'Hybrid'],
      rows: [
        ['Code', 'A separate app per platform (Swift for iOS, Kotlin for Android)', 'One shared codebase, for example React Native or Flutter', 'A web app inside a native wrapper (WebView)'],
        ['Screens', 'The platform’s own widgets', 'Real native widgets (React Native) or its own drawing engine (Flutter)', 'Web pages styled like an app'],
        ['Device features', 'All of them, first', 'Most, through plugins or bridges', 'Through plugins'],
        ['Feel', 'Best fit with the platform', 'Close, sometimes with differences', 'Can feel like a website'],
        ['Cost', 'Two teams and two codebases', 'One team, shared code', 'Cheapest, uses web skills']
      ] },

    { kind: 'metaphor', title: 'Suits',
      body: `**Native** is a tailored suit, made separately for each person. It fits perfectly, and it costs a tailor per size.

        **Cross-platform** is a good off-the-peg suit with alterations: one pattern, adjusted a little for each wearer. Most people never notice the difference.

        **Hybrid** is a poster of a suit in a nice frame. It is cheap and quick, and it is obviously a poster when you lean in.

        The metaphor stops at quality: modern cross-platform and web tooling can be excellent. The real choice is about *your* needs, such as heavy graphics, deep device features, team skills and budget.` },

    { kind: 'code', title: 'A PWA: a website with an app’s manners',
      body: `A **progressive web app** (PWA) is a website that can be installed, run full-screen and work offline. It needs three things: **HTTPS**, a **manifest** (a small file describing the app), and a **service worker**. Here is the manifest.`,
      code: { lang: 'json', src: `
        {
          "name": "Bramble Weather",
          "short_name": "Weather",
          "start_url": "/",
          "display": "standalone",
          "icons": [{ "src": "/icon-512.png", "sizes": "512x512" }]
        }`,
        notes: {
          2: 'The name shown to the user when it is installed.',
          4: 'Which page opens when someone taps the icon.',
          5: '\`standalone\` removes the browser bars so it looks like an app.',
          6: 'The home-screen icon.'
        } },
      note: 'Which device features a web app can use varies by platform and browser, and has historically been narrower on iOS. Always check current support.' },

    { kind: 'sequence', title: 'The service worker: a helpful middleman',
      body: 'A **service worker** is a script that sits between your page and the network. It can intercept every request and decide where the answer comes from. Here is a **cache-first** strategy.',
      actors: ['Page', 'Service worker', 'Cache', 'Network'],
      steps: [
        { from: 0, to: 1, label: 'fetch /data.json', note: 'Every request from the page passes through the service worker first.' },
        { from: 1, to: 2, label: 'stored copy?', note: 'It looks in its cache.' },
        { from: 2, to: 1, label: 'miss', dashed: true, note: 'Nothing saved yet, so it goes to the network.' },
        { from: 1, to: 3, label: 'fetch from network', note: 'It passes the request on to the real network, as if it were not there.' },
        { from: 3, to: 1, label: 'response', dashed: true, note: 'The server’s answer comes back to the service worker, not straight to the page.' },
        { from: 1, to: 2, label: 'save a copy', note: 'It keeps the answer for next time.' },
        { from: 1, to: 0, label: 'response', dashed: true, note: 'Finally it hands the answer to the page, which never knew a middleman was involved.' },
        { note: 'Next time, the cache answers straight away, even with no signal. Other strategies: network-first, or stale-while-revalidate (show the cached copy, refresh in the background).' }
      ] },

    { kind: 'steps', title: 'Offline-first: assume the network is bad',
      body: '**Offline-first** designs the app so it works without a connection, and treats the network as a bonus. Trains, lifts and patchy rural signal are the normal case for mobile users.',
      steps: [
        { title: 'Write locally first', body: 'Save the change in a local database on the device (for example SQLite or IndexedDB) before talking to the server.' },
        { title: 'Show it immediately', body: '**Optimistic UI**: update the screen straight away and assume success. The app feels instant.' },
        { title: 'Queue the change', body: 'Put the request in an outbox of pending changes that survives closing the app.' },
        { title: 'Sync when online', body: 'When the connection returns, send the queue to the server, in order, and fetch what changed elsewhere. Make requests safe to repeat.' },
        { title: 'Resolve conflicts', body: 'What if two devices edited the same thing? Pick a rule: last write wins, merge the fields, or ask the user.' }
      ] },

    { kind: 'sequence', title: 'Push notifications',
      body: 'A phone cannot keep a connection to every app. Instead, Apple and Google each run a **push service** that keeps one connection open to the device, and your server sends messages through it.',
      actors: ['Phone app', 'Your server', 'Push service'],
      steps: [
        { from: 0, to: 1, label: 'register device token', note: 'The app asks the operating system for a token that identifies this device and app, and sends it to your server.' },
        { from: 1, to: 2, label: 'send message to token', note: 'Your server never talks to the phone. It sends to Apple’s service (APNs) or Google’s (FCM, Firebase Cloud Messaging).' },
        { from: 2, to: 0, label: 'deliver', note: 'The platform delivers it, even if your app is closed.' },
        { at: 0, label: 'show notification', note: 'The operating system displays it, if the user allowed notifications.' },
        { from: 0, to: 1, label: 'user taps: fetch details', note: 'Keep the payload small. The app asks your API for the full story when it opens.' }
      ] },

    { kind: 'diagram', title: 'A backend for each frontend (BFF)',
      body: 'A phone has a small screen, a flaky connection and a battery. A web page has a big screen and a fast line. Forcing both to use one API makes one of them unhappy. A **BFF** gives each client its own thin back end that shapes the data for it.',
      nodes: [
        { id: 'm', label: 'Mobile app', icon: '📱', x: 0, y: 0 },
        { id: 'w', label: 'Web app', icon: '🖥️', x: 2, y: 0 },
        { id: 'bm', label: 'Mobile BFF', x: 0, y: 1, tone: 'accent' },
        { id: 'bw', label: 'Web BFF', x: 2, y: 1, tone: 'accent' },
        { id: 'o', label: 'Orders service', x: 0, y: 2, tone: 'muted' },
        { id: 'c', label: 'Catalogue service', x: 1, y: 2, tone: 'muted' },
        { id: 'u', label: 'Users service', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'm', to: 'bm' }, { from: 'w', to: 'bw' },
        { from: 'bm', to: 'o' }, { from: 'bm', to: 'c' },
        { from: 'bw', to: 'c' }, { from: 'bw', to: 'u' }
      ],
      caption: 'The mobile BFF gathers what a screen needs in one small response instead of many chatty calls.' },

    { kind: 'concept', title: 'Versioning for apps that never update',
      body: `Because old app versions stay alive for months or years, your API must stay friendly to them. Practical rules:

        | Change | Safe for old apps? |
        |---|---|
        | Add a new field | Yes |
        | Add an optional parameter | Yes |
        | Remove or rename a field | No |
        | Change what a field means | No |

        So: make changes **additive**, put a **version** in the URL or a header when you truly must break something, and have the app send its **own version** so the server knows who is calling. Keep a **minimum supported version** and a way to show "please update" when needed.` },

    { kind: 'pitfall', title: 'The old app that crashes in the wild',
      body: `A team renames the field \`price\` to \`amount\` in the API. Web users get the new site the same hour. But the mobile app released last spring still asks for \`price\`, gets nothing, and crashes on the product screen for everyone who has not updated. There is no hotfix: a fixed app needs a store release, and users must install it.

        Mobile teams therefore build **escape hatches** in advance: a remote setting to switch a feature off, a forced-update screen for dangerously old versions, and analytics on which app versions are in use, so they know when it is safe to retire an old API.` }
  ],

  activities: [
    { type: 'bucket', after: 1, prompt: 'Which approach does each description point to?', buckets: ['Native', 'Cross-platform', 'Hybrid'],
      items: [['Needs the newest camera or sensor features the day they ship', 0], ['One team shares most code between iOS and Android', 1], ['An existing website wrapped in an app shell for the store', 2], ['Animation-heavy app where the last bit of smoothness matters', 0], ['Draws its own interface with a custom engine (Flutter)', 1], ['Shows web pages inside a WebView', 2]],
      explain: 'Native gives the deepest device access and fit. Cross-platform shares code with near-native results. Hybrid wraps the web, cheapest but most website-like.' },

    { type: 'mcq', after: 4, q: 'What is a service worker mainly able to do for a web app?',
      options: ['Intercept requests and answer them from a cache', 'Run the app’s database on the server', 'Encrypt traffic so HTTPS is not needed', 'Render each page on the server first'],
      answer: 0,
      why: [null, 'It runs in the browser, not on your server.', 'Service workers actually require HTTPS.', 'Rendering on a server is SSR, a different topic.'],
      explain: 'A service worker is a script in the browser between the page and the network. It can serve cached responses, which is what makes offline use possible.' },

    { type: 'order', after: 5, prompt: 'Put the offline-first flow in order.', items: ['Save the change in a local database', 'Update the screen straight away', 'Add the change to the outbox queue', 'Send the queue when the network returns', 'Resolve any conflicts with other devices'],
      explain: 'The user never waits for the network. Changes are saved locally, shown at once, queued, synced later and reconciled if two devices disagree.' },

    { type: 'tf', statement: 'Your server sends push notifications directly to the user’s phone over a connection it holds open.', answer: false,
      explain: 'Messages go through Apple’s or Google’s push service, which keeps a connection to the device. Your server only talks to that service.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Manifest', 'A file telling the browser a PWA’s name, icon and start page'], ['Service worker', 'A script between the page and the network'], ['BFF', 'A thin back end tailored to one kind of client'], ['Optimistic UI', 'Show the result at once and assume success'], ['APNs / FCM', 'Platform push services run by Apple and Google']],
      explain: 'The manifest makes a site installable, the service worker handles offline, and the BFF and push services belong to the backend side of mobile.' },

    { type: 'short', q: 'Which file tells a browser a PWA’s name, icons and start page? (One word.)', accept: ['manifest', 'webmanifest', 'web app manifest'], hint: 'It is named in a link tag, and is a small JSON file.',
      explain: 'The web app manifest, together with HTTPS and a service worker, is what lets a browser treat a website as an installable app.' },

    { type: 'cloze', text: 'An app released last year may still call your API, so changes should be {{additive}}. The app can send its {{version}}, and the server can demand a {{minimum}} supported version.',
      distractors: ['destructive', 'secret', 'maximum'],
      explain: 'Adding fields keeps old clients working. Knowing the app version lets the server adapt, and a minimum supported version retires dangerously old ones.' },

    { type: 'scenario', title: 'Renaming a field in the API', meters: { stability: 60, speed: 50, reach: 70 },
      intro: 'Product wants the API field `price` renamed to `amount` because it now includes tax details. Your mobile app is on 40,000 phones, across five versions, and many users never update.',
      steps: [
        { text: 'How do you roll out the change?',
          choices: [
            { label: 'Rename it and deploy; the next app release will use the new name', score: 0, effects: { stability: -45, reach: -30, speed: 10 }, feedback: 'Every installed app now crashes on the product screen. There is no way to hotfix it quickly.' },
            { label: 'Add `amount` alongside `price`, keep both, and mark `price` as deprecated', score: 2, effects: { stability: 15, reach: 10, speed: 5 }, feedback: 'Adding a field is safe for old apps. New versions read `amount`, old ones keep reading `price`.' },
            { label: 'Force every user to update tomorrow', score: 1, effects: { stability: -10, reach: -20, speed: 15 }, feedback: 'You cannot force a store update overnight, and some users would be locked out. A forced-update screen is for very old, unsafe versions.' }
          ] },
        { text: 'Months later, how do you retire `price` safely?',
          choices: [
            { label: 'Check which app versions still use it, nudge old versions to update, then remove it after a published sunset date', score: 2, effects: { stability: 20, reach: 5, speed: 5 }, feedback: 'Real usage data and a clear deadline let you remove it without surprises.' },
            { label: 'Remove it now; most people have probably updated', score: 0, effects: { stability: -30, reach: -20 }, feedback: 'Probably is not good enough. Some users will crash with no warning.' },
            { label: 'Never remove it', score: 1, effects: { stability: 5, speed: -10 }, feedback: 'Safe but it leaves permanent clutter. A planned retirement is healthier.' }
          ] }
      ],
      outro: 'Make changes additive, watch which versions are alive, and retire old behaviour by plan.' },

    { type: 'explain', prompt: 'A start-up asks how to reach phone users. Explain your options and the backend things they must plan for.',
      model: 'They can build natively for each platform, share one codebase with cross-platform tools such as React Native or Flutter, wrap a web app in a hybrid shell, or build a PWA with a manifest and service worker for installable, offline-capable web. Offline-first stores changes locally and syncs later. On the backend I would use a BFF for the mobile client, push notifications through APNs and FCM, and versioned, additive APIs because old app versions stay in use for a long time.',
      keywords: ['native', 'cross-platform', 'PWA', 'service worker', 'offline', 'BFF', 'push', 'version'] }
  ],

  flashcards: [
    { q: 'Native vs cross-platform vs hybrid?', a: 'Native: separate apps per platform. Cross-platform: one shared codebase (React Native, Flutter). Hybrid: a web app wrapped in a native shell.' },
    { q: 'What three things make a PWA?', a: 'HTTPS, a web app manifest and a service worker.' },
    { q: 'What is a service worker?', a: 'A script in the browser between a page and the network that can intercept requests, cache responses and enable offline use.' },
    { q: 'What is offline-first?', a: 'Designing the app to work without a connection: write locally, show changes at once, queue them and sync later, resolving conflicts.' },
    { q: 'What is a BFF?', a: 'A Backend for Frontend: a thin back end shaped to the needs of one kind of client, such as mobile.' },
    { q: 'Why must mobile APIs change carefully?', a: 'Old app versions stay installed for months or years and cannot be hotfixed, so changes should be additive and versioned.' }
  ],

  glossary: [
    { term: 'Progressive web app', def: 'A website, served over HTTPS with a manifest and a service worker, that can be installed and work offline like an app.', like: 'A website with an app’s manners.', aka: ['PWA'] },
    { term: 'Service worker', def: 'A browser script that sits between a page and the network, able to intercept requests and serve cached responses.', like: 'A helpful middleman keeping copies.' },
    { term: 'Offline-first', def: 'A design approach in which the app works fully without a connection and syncs when one is available.', like: 'Writing in a notebook and posting the letters later.' },
    { term: 'BFF', def: 'Backend for Frontend: a back-end layer designed for a single client type, shaping data to its needs.', like: 'A personal shopper for each customer type.', aka: ['Backend for Frontend'] },
    { term: 'Push notification', def: 'A message delivered to a device via the platform’s push service, even when the app is not open.', like: 'A postal worker who knocks even when you are out in the garden.' }
  ],

  takeaways: [
    'Phone apps update when users choose, so plan for old versions.',
    'Native, cross-platform and hybrid trade fit against cost. PWAs are installable websites with a manifest and service worker.',
    'Offline-first: save locally, show at once, queue, sync, resolve conflicts.',
    'Use a BFF, push services and additive, versioned APIs for mobile.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('wm-standards', {
  eli5: 'The web works because browsers agree on the rules for HTML, CSS and JavaScript. A handful of open groups write and update those rules, and good developers build pages that still work when a browser does not support everything.',

  cards: [
    { kind: 'concept', title: 'Who decided a button works like that?',
      body: `You write \`<button>\` and every browser on every phone and laptop draws a button, focuses it with the Tab key, and fires a click when you press Enter. Nobody gave you a licence for that. It just works.

        That is **web standards** at work: written agreements about what every browser must do. Without them, you would write one site for each browser and print "best viewed in..." at the bottom, which is exactly what happened in the 1990s.

        For an architect, standards matter because **they outlive frameworks**. Skills and code built on standards last far longer than anything built on this year's library.` },

    { kind: 'history', title: 'Browser wars and two organisations',
      body: `In the mid-1990s, Netscape and Microsoft raced to add their own features, and pages worked in one browser and broke in the other. In 1994 Tim Berners-Lee, who invented the web, founded the **W3C** (World Wide Web Consortium) to keep it interoperable.

        In 2004 people from Apple, Mozilla and Opera, worried that the web was not evolving fast enough for applications, formed the **WHATWG** (Web Hypertext Application Technology Working Group) to carry HTML forward.

        For years the two produced competing versions of HTML. In 2019 they agreed to work together on a single version of HTML and the DOM, with the WHATWG's living standards as the reference.` },

    { kind: 'compare', title: 'Who looks after what',
      body: 'Several bodies, each with its own area. This is a simplified map.',
      cols: ['Looks after', 'Examples'],
      rows: [
        ['W3C', 'Many web specifications and accessibility guidelines', 'CSS, WCAG'],
        ['WHATWG', 'The core of the page itself', 'HTML, DOM, Fetch, URL'],
        ['TC39 (at Ecma)', 'The JavaScript language, called ECMAScript', 'Promises, async/await, modules'],
        ['IETF', 'Internet protocols, published as RFCs', 'HTTP, TLS']
      ],
      note: 'You met the IETF’s RFCs in the HTTP module. Bodies sometimes share work, so boundaries are not perfectly tidy.' },

    { kind: 'metaphor', title: 'A living dictionary',
      body: `A printed encyclopaedia is finished once it is printed: edition 1, edition 2, and the old ones go out of date on the shelf.

        A **living dictionary** is edited continuously. New words appear as they are accepted, and there is no "2024 edition", only *the dictionary, as it is now*.

        HTML works like the second. It is a **living standard**: always changing, with no version numbers like "HTML6". What matters is not the date of the document but **what browsers actually implement today**.

        The metaphor stops at speed: unlike a dictionary, a feature only counts once browsers ship it.` },

    { kind: 'steps', title: 'How a feature becomes standard',
      body: 'Roughly how a new web capability goes from idea to something you can rely on:',
      steps: [
        { title: 'A problem and a proposal', body: 'Someone shows a real need and proposes a way to solve it, in the open.' },
        { title: 'Debate', body: 'Browser makers, developers and other experts discuss design, security and privacy. Many ideas die here.' },
        { title: 'An early implementation', body: 'One browser builds it, often behind a flag, so people can try it and give feedback.' },
        { title: 'Specification and tests', body: 'The behaviour is written precisely, with shared tests, so independent browsers can match.' },
        { title: 'More browsers ship it', body: 'Once several independent browsers support it, it can be relied on. Until then, you need a fallback.' }
      ] },

    { kind: 'layers', title: 'Progressive enhancement',
      body: '**Progressive enhancement** builds in layers, so the basics work everywhere and better browsers get extras. Its cousin, graceful degradation, starts rich and tries to fall back.',
      layers: [
        { label: 'JavaScript', note: 'Optional extras: live search, animations, offline. If it fails, the page still works.', icon: '⚡', tone: 'warn' },
        { label: 'CSS', note: 'Layout and style. If it fails to load, the content is still readable.', icon: '🎨' },
        { label: 'HTML', note: 'The content and core function: text, links, forms. Everything starts here.', icon: '🧱', tone: 'good' }
      ],
      note: 'Why it matters: networks fail, scripts break, old devices exist, and assistive tools often rely on the HTML underneath.' },

    { kind: 'code', title: 'Enhance, do not assume',
      body: 'This search form works with plain HTML. JavaScript only upgrades it, after checking that the browser can do the job.',
      code: { lang: 'html', src: `
        <form action="/search" method="get">
          <input name="q" type="search">
          <button>Search</button>
        </form>
        <script>
          if ('fetch' in window) {
            // upgrade: search without reloading the page
          }
        </script>`,
        notes: {
          1: 'A real form. With no JavaScript at all, it sends the browser to a results page.',
          6: '**Feature detection**: ask whether the capability exists, rather than guessing from the browser’s name.',
          7: 'Only here do we add the nicer experience. Browsers without it still get a working search.'
        } } },

    { kind: 'concept', title: 'Accessibility is a standard too',
      body: `About one in five people has some kind of disability, in one form or another, temporary or permanent: a broken arm, poor eyesight, deafness, a noisy train carriage. **Accessibility** means your site works for them.

        The W3C publishes the **WCAG** (Web Content Accessibility Guidelines), organised around four principles known as **POUR**: content must be **Perceivable**, **Operable**, **Understandable** and **Robust**. It has three levels, A, AA and AAA, and many laws and procurement rules point to level AA.

        Most of the work is simple: real HTML elements, text alternatives for images, labels on form fields, enough colour contrast (4.5 to 1 for normal text at AA), and everything usable by keyboard.` },

    { kind: 'pitfall', title: 'The div that pretends to be a button',
      body: `A developer builds a "button" from a \`<div>\` with a click handler and some CSS. It looks perfect. But a keyboard user cannot Tab to it, a screen reader does not announce it as a button, and pressing Enter does nothing.

        A real \`<button>\` gives all of that **for free**. There is a famous rule for ARIA, a set of attributes that add meaning when HTML cannot: *if a native element does the job, use it instead of adding ARIA to something else.*

        Accessibility bolted on at the end costs far more than starting with semantic HTML.` },

    { kind: 'tip', title: 'Deciding what to support',
      body: `You cannot support every browser equally. A sensible approach:

        1. Look at your **real users' browsers** in analytics, not at guesses.
        2. Check feature support on trusted references such as MDN's compatibility tables and Can I use. Some "baseline" lists name features all major browsers have.
        3. Write a short **support policy**, such as "the latest two versions of the main browsers".
        4. Use **progressive enhancement** and, where needed, **polyfills** (small scripts that fill a missing feature).

        Test with a keyboard and a screen reader regularly, not just once before launch.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each body to what it mainly looks after.',
      pairs: [['W3C', 'Many web specs and the WCAG accessibility guidelines'], ['WHATWG', 'HTML and the DOM as living standards'], ['TC39', 'The JavaScript language, ECMAScript'], ['IETF', 'Internet protocols such as HTTP, as RFCs']],
      explain: 'These organisations overlap a little, but this map is accurate enough for everyday use: W3C for broad specs and accessibility, WHATWG for HTML, TC39 for JavaScript, IETF for protocols.' },

    { type: 'mcq', after: 3, q: 'What does it mean that HTML is a “living standard”?',
      options: ['It is updated continuously, with no version numbers', 'It was finished in 2014 and is now frozen', 'A new numbered edition comes out every few years', 'Each browser maintains its own private version'],
      answer: 0,
      why: [null, 'HTML keeps evolving. There is no final edition.', 'There is no HTML6. The standard is simply updated over time.', 'The point of standards is that browsers share one set of rules.'],
      explain: 'A living standard is edited continuously, like a living dictionary. The useful question is “which browsers support this feature today?”' },

    { type: 'tf', after: 5, statement: 'In progressive enhancement, the page should still work with the basics (HTML) if the JavaScript fails to load.', answer: true,
      explain: 'That is the whole idea: start with a working HTML foundation, then layer CSS and JavaScript on top as enhancements.' },

    { type: 'bucket', prompt: 'Which WCAG principle does each practice mainly serve?', buckets: ['Perceivable', 'Operable', 'Understandable', 'Robust'],
      items: [['Text alternatives for images', 0], ['Captions on videos', 0], ['Everything usable with the keyboard alone', 1], ['No content that flashes dangerously', 1], ['Clear error messages on forms', 2], ['Consistent navigation on every page', 2], ['Valid, semantic HTML that assistive tools can read', 3], ['Works across browsers and screen readers', 3]],
      explain: 'POUR: can people perceive the content, operate the controls, understand what they see and do, and does it hold up across technologies, including assistive ones?' },

    { type: 'spot', prompt: 'One line is an accessibility problem. Tap it.',
      code: { lang: 'html', src: `
        <div class="btn" onclick="save()">Save</div>
        <button type="submit">Send</button>
        <img src="logo.png" alt="Bramble Insurance logo">` },
      lines: [1],
      explain: 'A div with a click handler cannot be reached with the Tab key and is not announced as a button. A real button element gives keyboard and screen-reader support for free.' },

    { type: 'ab', q: 'Which check is more robust for deciding whether to use a newer browser feature?',
      a: { lang: 'js', label: 'Browser sniffing', src: `
        if (navigator.userAgent.includes('Chrome')) {
          useNewFeature();
        }` },
      b: { lang: 'js', label: 'Feature detection', src: `
        if ('IntersectionObserver' in window) {
          useNewFeature();
        }` },
      answer: 'b',
      explain: 'Feature detection asks the only question that matters: can this browser do it? Sniffing guesses from a name, which breaks with other browsers, other versions and disguised user agents.' },

    { type: 'short', q: 'Which organisation, formed in 2004, maintains the HTML Living Standard? (Give the acronym.)', accept: ['whatwg', 'the whatwg'], hint: 'Starts with W, not W3C.',
      explain: 'The WHATWG was formed by people from Apple, Mozilla and Opera. In 2019 they agreed with the W3C to work on a single version of HTML and the DOM.' },

    { type: 'scenario', title: 'The audit', meters: { users: 40, cost: 60, risk: 70 },
      intro: 'A public-sector client wants your new online form service. Their procurement rules require WCAG AA compliance. A quick audit finds div-based buttons, images without text alternatives, low-contrast grey text and a form that only works with JavaScript.',
      steps: [
        { text: 'How do you start fixing it?',
          choices: [
            { label: 'Replace the fake buttons with real elements, add labels and alt text, fix contrast, and make the form work with plain HTML', score: 2, effects: { users: 35, risk: -45, cost: -10 }, feedback: 'You fix the foundation. Native elements bring keyboard and screen-reader behaviour for free, and progressive enhancement keeps the form working.' },
            { label: 'Add ARIA attributes to everything and leave the divs', score: 1, effects: { users: 10, risk: -15, cost: -5 }, feedback: 'ARIA can help, but it fixes the label, not the keyboard behaviour. Native elements first is the rule.' },
            { label: 'Tell the client it will be fixed after launch', score: 0, effects: { risk: 30, users: -20 }, feedback: 'The contract requires compliance. Retrofitting later costs more, and excluded users are lost today.' }
          ] },
        { text: 'How do you stop the problems coming back?',
          choices: [
            { label: 'Add automated checks plus regular keyboard and screen-reader testing, and use the design system’s accessible components', score: 2, effects: { users: 20, risk: -20, cost: -5 }, feedback: 'Automation catches the easy things. Human testing catches the rest. Shared components spread the fixes.' },
            { label: 'Run one manual audit before each launch', score: 1, effects: { users: 5, risk: -5 }, feedback: 'Better than nothing, but problems return between audits.' },
            { label: 'Assume the problem is solved', score: 0, effects: { risk: 25 }, feedback: 'Accessibility drifts as features are added. It needs continuous checks.' }
          ] }
      ],
      outro: 'Start from semantic HTML, test with real assistive tools, and make accessibility part of everyday work.' },

    { type: 'explain', prompt: 'Explain who decides how the web works, what a living standard is, and why progressive enhancement and accessibility matter.',
      model: 'The W3C, WHATWG, TC39 and IETF write the standards: W3C covers many specifications and accessibility, WHATWG covers HTML and the DOM, TC39 covers JavaScript and IETF covers protocols like HTTP. HTML is a living standard, continuously updated, so what matters is what browsers support now. Progressive enhancement builds on HTML first, then CSS and JavaScript, so the basics work everywhere. Accessibility, through WCAG, makes sites usable by everyone and starts with semantic HTML.',
      keywords: ['W3C', 'WHATWG', 'living standard', 'progressive enhancement', 'WCAG', 'semantic', 'browser'] }
  ],

  flashcards: [
    { q: 'What are the W3C and the WHATWG?', a: 'The W3C (founded 1994) writes many web specs and accessibility guidelines. The WHATWG (formed 2004) maintains the HTML and DOM living standards.' },
    { q: 'What is a living standard?', a: 'A specification edited continuously, with no numbered versions. What matters is what browsers implement today.' },
    { q: 'Which body looks after JavaScript the language?', a: 'TC39, the committee at Ecma International that maintains ECMAScript.' },
    { q: 'What is progressive enhancement?', a: 'Building in layers: HTML works everywhere, CSS styles it, JavaScript adds extras for browsers that can run them.' },
    { q: 'What do the WCAG principles POUR stand for?', a: 'Perceivable, Operable, Understandable and Robust.' },
    { q: 'Why use feature detection instead of browser sniffing?', a: 'It asks whether the capability exists, which stays correct as browsers change, whereas names and versions are unreliable guesses.' }
  ],

  glossary: [
    { term: 'Web standard', def: 'An agreed written specification of how browsers must behave, so a page works the same everywhere.', like: 'Road rules that every driver follows.' },
    { term: 'Living standard', def: 'A specification that is continuously updated, with no fixed edition numbers.', like: 'A living dictionary.' },
    { term: 'Progressive enhancement', def: 'Building a site so core content works with plain HTML, then adding CSS and JavaScript as upgrades.', like: 'A bicycle that works, then gets gears.' },
    { term: 'WCAG', def: 'The Web Content Accessibility Guidelines from the W3C, the main standard for making web content usable by people with disabilities.', like: 'A building code for ramps and signs on the web.', aka: ['Web Content Accessibility Guidelines'] },
    { term: 'Polyfill', def: 'A small script that adds a missing browser feature so older browsers can behave like newer ones.', like: 'A temporary prop that holds up a wall.' }
  ],

  takeaways: [
    'Standards let one page work in every browser, and they outlive frameworks.',
    'W3C, WHATWG, TC39 and IETF each look after different parts of the web.',
    'HTML is a living standard: check what browsers support today.',
    'Build in layers, use real HTML elements, and treat accessibility as part of the standard.'
  ]
});

KS.boss('web-mobile', {
  title: 'The Many-Screened Hydra',
  intro: 'Every head of this hydra is a different screen: a browser tab, a phone in a tunnel, an old app nobody updated. Beat it by choosing how pages are built, where state lives, how teams split the front end and how the web stays open to everyone.',
  questions: [
    { type: 'mcq', q: 'A recipe site has thousands of public pages that change about once a week. Which rendering approach fits best?',
      options: ['Static generation, served from a CDN', 'A single-page app that fetches every recipe', 'Server rendering of every page on each visit', 'A hybrid app wrapped for the app stores'],
      answer: 0,
      why: [null, 'The first HTML would be nearly empty, which is slower and weaker for search and link previews.', 'It works, but you pay for a fresh render of content that barely changes.', 'That is a way to ship a phone app, not a way to render web pages.'],
      explain: 'Content that is the same for everyone and changes rarely is ideal for SSG: built once, served as files from a CDN, fast and cheap. Regenerate it when a recipe changes.' },

    { type: 'tf', statement: 'A server-rendered page can look finished before its buttons work.', answer: true,
      explain: 'The HTML arrives first and shows at once, but clicks only work after hydration, when the JavaScript attaches its event handlers.' },

    { type: 'spot', prompt: 'This component stores a value that could be calculated. Tap the line.',
      code: { lang: 'js', src: `
        const [todos, setTodos] = useState([]);
        const [doneCount, setDoneCount] = useState(0);
        const remaining = todos.length - doneCount;
        return <h2>{remaining} left</h2>;` },
      lines: [2],
      explain: 'The number of finished to-dos can be worked out from the list itself, for example by counting items marked done. A second stored copy will eventually drift out of step with the list.' },

    { type: 'ab', q: 'A pricing rule must survive a future switch of front-end framework. Which design is better?',
      a: { lang: 'js', label: 'Rule in the component', src: `
        function Basket({ items }) {
          const total = items.reduce((t, i) => t + i.price, 0);
          const discount = total > 50 ? total * 0.1 : 0;
          return <p>Total: {total - discount}</p>;
        }` },
      b: { lang: 'js', label: 'Rule in a plain function', src: `
        // pricing.js knows nothing about React
        export const priceOf = (items) => { /* rules */ };

        function Basket({ items }) {
          return <p>Total: {priceOf(items)}</p>;
        }` },
      answer: 'b',
      explain: 'A plain function can be tested on its own and reused by any framework. Business rules inside components are welded to that framework and must be rewritten with it.' },

    { type: 'bucket', prompt: 'Client state or server state?', buckets: ['Client state', 'Server state'],
      items: [['Whether a dropdown is open', 0], ['A customer’s saved addresses', 1], ['The draft text in a comment box', 0], ['Today’s exchange rates from the API', 1], ['Which accordion panel is expanded', 0], ['Items in a shared team to-do list', 1]],
      explain: 'Server state is a cached copy of facts the backend owns, so it can go stale and needs loading, error and refresh handling. Client state exists only in the browser and the browser is its truth.' },

    { type: 'multi', q: 'Your company has one small front-end team of four. Which are good reasons NOT to adopt microfrontends yet?',
      options: ['One team can release one codebase without blocking anyone', 'Pages could get heavier from duplicated libraries', 'A modular monolith gives clear boundaries more cheaply', 'Microfrontends stop teams deploying independently', 'Browsers cannot load scripts from several sources'],
      answers: [0, 1, 2],
      explain: 'Microfrontends solve a many-teams problem at a technical cost. With one team there is no release coupling to fix, so the cost buys nothing. They do allow independent deployment, and browsers handle many scripts fine.' },

    { type: 'mcq', q: 'The header microfrontend needs to know when an item is added to the cart. What is the most loosely coupled option?',
      options: ['The cart broadcasts a documented browser event', 'The header imports the cart’s internal store', 'Both teams merge into a single codebase', 'The header reads the cart’s DOM elements'],
      answer: 0,
      why: [null, 'Reaching into private code ties the two release cycles together.', 'That removes the independence the split was meant to give.', 'The cart’s markup is private and can change at any release.'],
      explain: 'A named event with a small payload is a public contract. Neither team needs the other’s code, so either can change internals or deploy alone, as long as the contract holds.' },

    { type: 'order', prompt: 'A user edits a note on a train with no signal, in an offline-first app. Put what happens in order.',
      items: ['The edit is saved to a local database', 'The screen shows the change straight away', 'The change waits in the outbox queue', 'Signal returns and the queue is sent to the server', 'A clash with another device’s edit is resolved'],
      explain: 'Offline-first never makes the user wait for the network: save locally, show at once, queue, sync when online, then reconcile conflicts.' },

    { type: 'mcq', q: 'Your API serves a mobile app with many old versions still installed. The team wants `date` as a number instead of text. What is the safest change?',
      options: ['Add a new `timestamp` field and keep `date`', 'Change `date` and ship a new app that day', 'Change `date` and hotfix the installed apps', 'Rename `date` and email users to update'],
      answer: 0,
      why: [null, 'Store review and slow updates mean old versions run for months, and they will break.', 'You cannot patch app code already on phones from the server.', 'Many users never read it, and their apps break in the meantime.'],
      explain: 'Additive changes keep old clients working: new versions read the new field, old ones keep reading `date`. Retire the old field later, once usage data shows it is safe.' },

    { type: 'match', prompt: 'Match each item to its meaning.',
      pairs: [['Service worker', 'Browser script that can answer requests from a cache'], ['APNs / FCM', 'Platform services that deliver push messages'], ['BFF', 'A back end shaped for one kind of client'], ['WHATWG', 'Maintains the HTML living standard'], ['Design tokens', 'Named shared values for colour, spacing and fonts']],
      explain: 'The first three belong to building for phones and the web, WHATWG to the standards that hold the web together, and design tokens to keeping many teams’ screens consistent.' },

    { type: 'cloze', text: 'Progressive enhancement starts with working {{HTML}}, adds CSS, then JavaScript. Check abilities with feature {{detection}}, not browser sniffing. The WCAG principles are summed up as {{POUR}}.',
      distractors: ['JSON', 'hydration', 'REST', 'CRUD'],
      explain: 'The basics must work everywhere, upgrades are added only where the browser can handle them, and POUR stands for Perceivable, Operable, Understandable and Robust.' },

    { type: 'short', q: 'A developer makes a clickable `<div>` that keyboard users cannot reach. Which HTML element should it have been? (One word.)', accept: ['button', '<button>'], hint: 'It gives focus, Enter and screen-reader support for free.',
      explain: 'A real `<button>` is focusable, responds to Enter and Space, and is announced as a button. Native elements beat ARIA added to a div.' }
  ]
});

KS.sheet('web-mobile', {
  title: 'Web & mobile architecture: cheat sheet',
  sections: [
    { title: 'Rendering: who builds the HTML, and when?',
      md: `| | SPA | SSR | SSG |
        |---|---|---|---|
        | Built | In the browser | Server, per request | Build time, once |
        | First content | Slow (JS first) | Quick | Quickest (CDN) |
        | Personalised | Easy | Easy | Hard |
        | SEO / previews | Weakest | Strong | Strong |
        | Fresh | Via API | Live | Stale until rebuild |

        **Hydration:** JS attaches handlers to server-made HTML; it looks ready before it is. **ISR:** rebuild static pages in the background. Choose **per page**: who is it for, how fresh, must search see it? Private dashboards gain nothing from SSR "for SEO".` },

    { title: 'Components and frameworks',
      md: `**Imperative:** update the page step by step. **Declarative:** describe the screen for the data; the framework updates it.

        **Component** = reusable UI piece: **props** (inputs from parent) in, **state** (what it remembers) inside, UI out.

        | | React | Vue | Angular |
        |---|---|---|---|
        | Is | UI library | Progressive framework | Full platform |
        | Templates | JSX | HTML-like single files | HTML + TS class |
        | Included | Pick your own | Official router/state | Router, forms, HTTP, DI |

        Choose by team skills, hiring, longevity, fit. Keep business rules in **plain functions**, outside components. Record the choice in an ADR.` },

    { title: 'State and reactivity',
      md: `- **UI = f(state):** same state, same screen.
        - **One-way flow:** data down, events up, update function makes new state.
        - **Derive, do not duplicate:** \`count = items.length\`, never a second variable.
        - **Signals:** values that track readers; \`computed\` recalculates, \`effect\` reacts.
        - **Immutability:** make a new copy, do not edit in place. **Reducer:** (state, action) → new state.

        | Client state | Server state |
        |---|---|
        | Menu open, typed text, tab | Orders, profile, stock |
        | Browser is truth | Server is truth; you hold a cache |
        | Component state, store | Data-fetching cache (TanStack Query, SWR) |

        Keep state close to use; lift only when shared. The URL is state too.` },

    { title: 'Microfrontends',
      md: `Split the front end **by business area**; each team owns a vertical slice and deploys alone. A **shell** hosts the slices.

        | Compose with | Trade-off |
        |---|---|
        | Build-time packages | Simple, not independent |
        | Server-side includes | Fast, good SEO, needs server layer |
        | Run-time loading | Independent, version clashes |
        | iframes | Isolated, awkward |
        | Web Components | Framework-neutral |

        Talk via **events / contracts**, never internal imports. A **design system** (tokens + components) keeps it one product. Pitfalls: duplicate libraries, slices too small, slicing by layer. Start with a **modular monolith**; split when many teams block each other (Conway's Law).` },

    { title: 'Mobile and PWAs',
      md: `| | Native | Cross-platform | Hybrid |
        |---|---|---|---|
        | Code | Per platform (Swift, Kotlin) | Shared (React Native, Flutter) | Web in a WebView |
        | Device access | Full, first | Most | Plugins |

        **PWA** = HTTPS + **manifest** + **service worker** (intercepts requests; cache-first, network-first, stale-while-revalidate).

        **Offline-first:** save locally → show at once → queue → sync → resolve conflicts. Make sync requests safe to repeat.

        **Push:** app registers a device token; your server sends via **APNs / FCM**, never directly. Keep payloads small.

        **BFF:** a thin back end per client type.

        **Old apps live for years:** additive changes only, send the app version, minimum supported version, remote kill switches.` },

    { title: 'Standards and accessibility',
      md: `| Body | Looks after |
        |---|---|
        | W3C | Many specs, CSS, WCAG |
        | WHATWG | HTML, DOM, Fetch, URL (living standards) |
        | TC39 | JavaScript (ECMAScript) |
        | IETF | Protocols: HTTP, TLS (RFCs) |

        **Living standard:** no HTML6; check what browsers ship (MDN, Can I use). **Progressive enhancement:** HTML → CSS → JS. **Feature detection**, not browser sniffing; **polyfills** fill gaps.

        **WCAG** = **POUR** (Perceivable, Operable, Understandable, Robust); levels A, AA, AAA; AA contrast 4.5:1 for normal text. Use real elements (\`<button>\`, labels, alt text); native beats ARIA. Test with keyboard and screen reader regularly.` }
  ]
});
