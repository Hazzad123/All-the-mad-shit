/* Module: languages-git — Languages & Version Control.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs languages-git */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('lang-landscape', {
  eli5: 'Programming languages all let you loop, branch and store things; they differ in how they run, how strict they are about types, and how they juggle many jobs at once.',

  cards: [
    { kind: 'concept', title: 'Same loops, different personalities',
      body: `You can already write a loop and a function. Good news: that skill carries over to **every** mainstream backend language. \`for\`, \`if\`, variables and functions look roughly the same everywhere.

        So why do people argue about languages as if they were football teams? Because underneath the familiar syntax, languages make different choices about four things:

        - **How the code runs** (compiled, interpreted, or in between)
        - **How strict it is about types** (checked before running, or while running)
        - **How it handles many jobs at once** (its concurrency model)
        - **What surrounds it** (libraries, tools, people)

        This lesson gives you those four lenses. The next two use them on real languages.` },

    { kind: 'metaphor', title: 'Choosing a vehicle',
      body: `A bicycle, a van and a lorry can all move things from A to B. Nobody argues the lorry is "better". It depends on the job.

        - The **bicycle** (a scripting language) is quick to grab and cheap to repair. You will not haul a piano with it.
        - The **van** (a managed, mainstream language) carries most loads and every mechanic knows it.
        - The **lorry** (a systems language) hauls enormous loads efficiently, but you need a licence and a plan.

        Languages are like that: trade-offs, not rankings. Where the metaphor stops: you can swap vehicles for each *trip*, but a language is something your whole team lives in for years.` },

    { kind: 'compare', title: 'How code gets run',
      body: 'Your computer’s processor only understands machine code. Every language has some route from your text to that. There are three common routes.',
      cols: ['Compiled to machine code', 'Bytecode on a VM', 'Interpreted'],
      rows: [
        ['How it works', 'A **compiler** translates everything into machine code before you ship it.', 'The compiler makes compact **bytecode**. A **virtual machine** (VM) runs it, often compiling hot parts to machine code as it goes.', 'An **interpreter** reads your source and executes it as it goes (usually via a quick internal bytecode step).'],
        ['Examples', 'Go, Rust, C, C++', 'Java, Kotlin, Scala (the JVM); C# (.NET)', 'Python, Ruby, PHP, JavaScript in Node.js*'],
        ['What you ship', 'One executable file for each kind of machine', 'Bytecode, plus a VM installed on the server', 'Source code, plus the interpreter on the server'],
        ['Mistakes found', 'Many at build time, before anything runs', 'Many at build time', 'Many only when that line actually runs']
      ],
      note: '*Honest simplification: the lines blur. Node.js uses a VM that compiles JavaScript to machine code on the fly, and Python quietly compiles to bytecode first. "Compiled vs interpreted" describes a typical style more than a law.' },

    { kind: 'code', title: 'Static vs dynamic typing',
      body: 'A **type** says what kind of thing a value is: a number, some text, a list. In a **statically typed** language the types are checked *before* the program runs. In a **dynamically typed** one they are checked *while* it runs. Tap the lines.',
      code: { lang: 'ts', src: `
        function total(prices: number[]): number {
          let sum = 0;
          for (const p of prices) sum += p;
          return sum;
        }

        total([4.5, 3]);         // fine
        total(['4.50', '3.00']); // refused before it can run`,
        notes: {
          1: 'The `: number[]` and `: number` are type annotations. They are a promise: this takes a list of numbers and returns a number.',
          8: 'The editor and compiler flag this immediately. In a dynamically typed language (plain JavaScript, Python, Ruby) the same call would start running, and might only fail, or worse, quietly produce nonsense like `"04.503.00"`, when a user triggers it.'
        } },
      note: 'Neither side is "right". Static typing catches a class of mistakes early and helps tools autocomplete. Dynamic typing is faster to start with and lets you write less ceremony.' },

    { kind: 'metaphor', title: 'One waiter, or many?',
      body: `Your server gets hundreds of requests at once, and most of them spend their time **waiting**: for the database, for another service, for a disk. How should the program juggle that? Picture a restaurant.

        - **One brilliant waiter who never stands still.** He takes an order, hands it to the kitchen, and *immediately* goes to the next table. When a dish is ready, he is told. (That is an **event loop**.)
        - **A waiter per table.** Each waiter handles one table and happily waits for its food. Simple to reason about, but you need many waiters, and they bump into each other in the corridor. (That is **threads**.)
        - **Thousands of featherweight waiters** who cost almost nothing, so hiring one per table is fine. (That is **goroutines**, and similar ideas elsewhere.)` },

    { kind: 'compare', title: 'Three concurrency models',
      body: 'You met threads and race conditions in the operating systems module. Here is how that plays out in languages.',
      cols: ['Event loop', 'OS threads', 'Lightweight tasks'],
      rows: [
        ['Typical home', 'JavaScript on Node.js', 'Java, C#, Python, Ruby, PHP workers', 'Go (goroutines and channels)'],
        ['The idea', 'One thread runs your code; waiting for I/O never blocks it', 'Each request gets a real thread the operating system schedules', 'Thousands of tiny tasks, scheduled by the language’s own runtime'],
        ['Good at', 'Many connections that mostly wait (APIs, chat)', 'Straightforward code; real parallel work on many cores', 'Many concurrent jobs, with simple message passing'],
        ['Careful about', 'A slow calculation blocks everyone', 'Shared data needs locks; threads cost memory', 'Still need care when tasks share data']
      ],
      note: 'Python’s standard implementation has a **global interpreter lock** (GIL): only one thread runs Python code at a time, so threads do not speed up CPU-heavy work. They still help while waiting on I/O, and Python offers `asyncio` and multiple processes too.' },

    { kind: 'pitfall', title: 'Choosing by hype or by a micro-benchmark',
      body: `The classic mistake is picking a language because it "won" a speed test on a toy problem, or because it is everywhere on social media this month.

        A typical backend request spends most of its life waiting on a **database or another service**, not crunching numbers. Doubling the speed of your language might barely move the response time, while a missing database index could change it by a hundred times.

        Raw speed genuinely matters for some jobs (video encoding, game engines, very high-volume services). If you cannot name which of those you are doing, speed is probably not your constraint.` },

    { kind: 'tip', title: 'The ecosystem, the people and "boring technology"',
      body: `A language is more than its syntax. The real everyday experience is its **ecosystem**: libraries for payments and PDFs, frameworks, a package manager, good debuggers, decent documentation, answers online.

        Then there are the **people**. If your team already knows a language, or you can easily find developers who do, that is worth a lot. A "worse" language your team knows deeply often beats a "better" one they are learning on the job.

        This is the idea behind **boring technology**: prefer well-understood tools, and spend your limited appetite for novelty only where it truly pays off. Boring means *predictable*, not bad.` },

    { kind: 'steps', title: 'How to choose, in five questions',
      body: 'A practical way to pick a language for a new backend.',
      steps: [
        { title: 'What does the team already know?', body: 'Start here. Skills are the slowest thing to change.' },
        { title: 'What is the job?', body: 'A normal web API? Heavy number crunching? A tiny command-line tool? A system that must never pause?' },
        { title: 'What does the ecosystem offer?', body: 'Check that mature libraries and a framework exist for what you need: payments, auth, queues, your database.' },
        { title: 'How will you run it?', body: 'A single binary is easy to deploy. A VM or interpreter must be installed and kept up to date on every server.' },
        { title: 'Can you hire for it, and live with it for years?', body: 'Pick something with a healthy community. You will maintain this code for a long time.' }
      ] }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'A Java program is compiled to bytecode and run on the JVM. Which description fits best?',
      options: ['It is translated ahead of time, then a virtual machine runs the result', 'It is read line by line from source code by an interpreter each run', 'It becomes a single machine-code file needing no other software', 'It is only translated at the moment a user clicks a button'],
      answer: 0,
      why: [null, 'That describes a classic interpreter. Java is compiled first.', 'That is closer to Go or Rust. Java needs a JVM installed to run.', 'Translation happens when the programmer builds it, not on a user click.'],
      explain: 'The JVM sits between the bytecode and the processor. That is why the same compiled Java can run on different operating systems, as long as each has a JVM.' },

    { type: 'tf', after: 3, statement: 'In a statically typed language, a type mismatch like passing text where a number is expected can usually be caught before the program runs.', answer: true,
      explain: 'That is the main selling point of static typing: the compiler (or editor) checks the types up front. A dynamically typed language finds the same mistake only when that line executes.' },

    { type: 'match', after: 5, prompt: 'Match each model to the situation it suits best.',
      pairs: [['Event loop (Node.js)', 'Thousands of connections that mostly wait'], ['OS threads', 'Straightforward code that uses many cores'], ['Goroutines', 'Huge numbers of cheap concurrent jobs'], ['Python threads (standard GIL)', 'Waiting on I/O, but not parallel number crunching']],
      explain: 'Each model is a different answer to the same problem: how to keep busy while waiting. The GIL is why Python threads help with waiting but not with CPU-bound work.' },

    { type: 'ab', q: 'Which snippet would a statically typed language reject before running?',
      a: { lang: 'ts', label: 'Version one', src: `
        const price: number = 4.5;
        const qty: number = 3;
        console.log(price * qty);` },
      b: { lang: 'ts', label: 'Version two', src: `
        const price: number = 4.5;
        const qty: number = 'three';
        console.log(price * qty);` },
      answer: 'b',
      explain: 'The second declares `qty` as a number and then stores text in it. A type checker spots that without running anything. Dynamic languages would let it through and fail (or misbehave) later.' },

    { type: 'bucket', prompt: 'Is this job mostly I/O-bound (waiting) or CPU-bound (calculating)?', buckets: ['I/O-bound', 'CPU-bound'],
      items: [['Fetching a user row from a database', 0], ['Calling a payment provider’s API', 0], ['Encoding a long video into a new format', 1], ['Reading a file from a slow disk', 0], ['Computing a big matrix of recommendations', 1], ['Resizing ten thousand images in a batch', 1]],
      explain: 'Most web requests are I/O-bound, which is why event loops and threads work so well for them. CPU-bound work is where the GIL, a blocked event loop or raw language speed start to matter.' },

    { type: 'cloze', text: 'Node.js runs your code on a single thread with an {{event loop}}, so a long {{calculation}} can block every other request.',
      distractors: ['goroutine', 'database', 'compiler'],
      explain: 'The event loop is great while the program is waiting on I/O, but anything that hogs the one thread, like a heavy calculation, makes everyone queue behind it.' },

    { type: 'scenario', title: 'The new startup API', intro: 'You are the first backend hire at a small startup building an app to book dog walkers. The founder asks you to **pick the language** this week.',
      meters: { 'team speed': 60, 'future pain': 30 },
      steps: [
        { text: 'The two other developers both know Python well and have shipped web apps in it. What is your first move?',
          choices: [
            { label: 'Ask what the app must do, then weigh it against what the team already knows', score: 2, effects: { 'team speed': 15 }, feedback: 'Exactly. A booking app is mostly forms, a database and a few payments: an I/O-bound job any mainstream language handles. Team skill is the deciding factor.' },
            { label: 'Pick the language that topped a recent speed benchmark', score: 0, effects: { 'team speed': -25, 'future pain': 15 }, feedback: 'Your app will spend its time waiting on the database. You have traded two experts for two beginners to chase a number that will not matter.' },
            { label: 'Pick whatever the biggest tech company uses', score: 1, effects: { 'team speed': -10, 'future pain': 5 }, feedback: 'Their constraints (millions of users, hundreds of engineers) are not yours. Copying their tools without their problems is a common trap.' }
          ] },
        { text: 'You choose Python. A teammate worries: "It is dynamically typed, so bugs will slip through." How do you respond?',
          choices: [
            { label: 'Agree it is a real trade-off, then add tests and optional type hints in the editor', score: 2, effects: { 'future pain': -10 }, feedback: 'Honest and practical. Tests plus type hints recover much of the safety without leaving a language the team is fast in.' },
            { label: 'Say dynamic typing never causes problems', score: 0, effects: { 'future pain': 15 }, feedback: 'It does cause a class of problems, especially as a codebase grows. Pretending otherwise means you will not defend against them.' },
            { label: 'Restart the decision and rewrite in a statically typed language', score: 1, effects: { 'team speed': -20 }, feedback: 'The concern is fair, but throwing away your team’s strongest skill for a theoretical gain on day one is expensive.' }
          ] },
        { text: 'A year later, one report job that crunches numbers for hours is slow. What now?',
          choices: [
            { label: 'Profile it, then move only that job to a faster tool if it truly needs it', score: 2, effects: { 'team speed': 5, 'future pain': -10 }, feedback: 'Measure first, then fix the real bottleneck. Many systems are happily polyglot, with one small fast component beside a productive main codebase.' },
            { label: 'Rewrite the entire app in a systems language', score: 0, effects: { 'team speed': -30, 'future pain': 20 }, feedback: 'One slow job does not justify throwing away everything that works.' },
            { label: 'Ignore it and tell users to wait', score: 1, effects: { 'future pain': 10 }, feedback: 'Sometimes a slow overnight job is fine, but you should decide that on purpose, not by default.' }
          ] }
      ],
      outro: 'The pattern: **choose for the job and the team, accept the trade-offs out loud, and fix real bottlenecks with measurements.**' },

    { type: 'multi', q: 'Which of these are good reasons to choose a language for a backend?',
      options: ['Your team already knows it deeply', 'Mature libraries exist for what you need', 'It is easy to hire developers who know it', 'It won a speed test on a small benchmark', 'It is the newest and most talked-about option'],
      answers: [0, 1, 2],
      explain: 'Skills, ecosystem and hiring decide most real projects. A toy benchmark or hype tells you little about your own workload.' },

    { type: 'explain', prompt: 'A friend says: "Just use the fastest language, it is obviously the best." Explain what is missing from that advice.',
      model: 'Most backend requests spend their time waiting on databases and other services, so raw language speed is rarely the bottleneck. A language is chosen for the job, the ecosystem, the team’s skills and hiring, and how it is run. A boring, well-known language the team knows often beats a faster one nobody knows.',
      keywords: ['waiting', 'database', 'team', 'ecosystem', 'trade-off', 'job'] }
  ],

  flashcards: [
    { q: 'What is the difference between a compiler and an interpreter?', a: 'A compiler translates your code before it runs. An interpreter executes the source as it goes. Real languages often mix both.' },
    { q: 'What does static typing give you?', a: 'Type mistakes are caught before the program runs, and editors can autocomplete better. The price is a little more ceremony.' },
    { q: 'What is a virtual machine in the Java sense?', a: 'A program (the JVM) that runs compiled bytecode, so the same bytecode works on any machine that has the VM.' },
    { q: 'What is an event loop good and bad at?', a: 'Good at many connections that mostly wait. Bad when one slow calculation blocks the single thread everyone shares.' },
    { q: 'What does "boring technology" mean?', a: 'Preferring well-understood, proven tools, and saving novelty for the places it really pays off.' }
  ],

  glossary: [
    { term: 'Compiler', def: 'A program that translates source code into another form, usually machine code or bytecode, before the program is run.', like: 'Translating a whole book before publishing it.' },
    { term: 'Interpreter', def: 'A program that reads source code and carries out its instructions directly as it goes.', like: 'A live interpreter translating a speech sentence by sentence.' },
    { term: 'Virtual machine', def: 'A program that runs bytecode, hiding the details of the real computer underneath. The JVM (Java) and .NET’s runtime are examples.', like: 'A universal adaptor that lets one plug fit every wall socket.', aka: ['VM', 'runtime'] },
    { term: 'Static typing', def: 'Types are checked before the program runs, usually by a compiler. Dynamic typing checks them while it runs.', like: 'A bouncer checking IDs at the door instead of after you are inside.' },
    { term: 'Event loop', def: 'A design where one thread keeps picking up finished I/O results and running the matching code, instead of waiting around.', like: 'One waiter who never stands still.' },
    { term: 'Boring technology', def: 'Proven, widely understood tools chosen on purpose, so a team’s limited appetite for risk is spent where it matters.', like: 'Taking the motorway you know rather than a clever shortcut.' }
  ],

  takeaways: [
    'Languages differ in **how they run**, **how strict their types are**, **how they juggle jobs** and **what surrounds them**.',
    'Static typing catches mistakes early; dynamic typing gets you started faster. Both are valid trade-offs.',
    'Most backend work is waiting on I/O, so raw speed is rarely the deciding factor.',
    'Choose for the job and the team, and favour boring, well-understood tools.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('lang-tour-dynamic', {
  eli5: 'JavaScript, Python, Ruby and PHP are flexible, quick-to-write languages that run your code through an interpreter, and between them they power a huge part of the web.',

  cards: [
    { kind: 'concept', title: 'Four languages, one family resemblance',
      body: `Imagine you run an online shop and need one tiny job done: **add up the totals of today’s orders**. Hand that job to a JavaScript, Python, Ruby or PHP developer and you get four answers that look like cousins.

        These four share a temperament. They are **dynamically typed** (types are checked while running), they are usually **interpreted** or run on a VM that does the heavy lifting, and they are quick to write and change. Each has a famous **framework**, a ready-made skeleton that handles routing, databases and the boring plumbing of a web app.

        This lesson is a tour, not a ranking. For each one: what it is like, what it is used for, and where it stumbles.` },

    { kind: 'compare', title: 'The same job in three of them',
      body: 'Sum the `total` of every order in a list. Notice how little changes.',
      cols: ['JavaScript', 'Python', 'Ruby'],
      rows: [
        ['The code', '`orders.reduce((s, o) => s + o.total, 0)`', '`sum(o["total"] for o in orders)`', '`orders.sum { |o| o[:total] }`'],
        ['Style', 'Functions passed to functions', 'Reads almost like English', 'Blocks, and everything is an object'],
        ['Typing', 'Dynamic', 'Dynamic', 'Dynamic']
      ],
      note: 'The idea is identical: walk the list, add up one field. The differences are mostly punctuation and taste.' },

    { kind: 'code', title: 'JavaScript on the server: Express',
      body: 'A backend endpoint that returns JSON, using **Express**, a small and very common Node.js web framework. Tap the lines.',
      code: { lang: 'js', src: `
        const express = require('express');
        const app = express();

        app.get('/orders/42', async (req, res) => {
          const order = await db.findOrder(42);
          res.json({ id: order.id, total: order.total });
        });

        app.listen(3000);`,
        notes: {
          4: 'When a `GET /orders/42` request arrives, run this function. `req` is the request, `res` is how you reply.',
          5: '`await` pauses *this* handler while the database answers, but Node carries on serving other requests in the meantime. That is the event loop at work.',
          6: '`res.json` turns the object into JSON text and sets the `Content-Type` header for you.'
        } } },

    { kind: 'code', title: 'Python on the server: Flask',
      body: 'The same endpoint in Python with **Flask**. Django and FastAPI are other well-known Python frameworks: Django is "batteries included", FastAPI is built around type hints.',
      code: { lang: 'py', src: `
        from flask import Flask, jsonify
        app = Flask(__name__)

        @app.get("/orders/42")
        def get_order():
            order = db.find_order(42)
            return jsonify(id=order.id, total=order.total)`,
        notes: {
          4: 'A **decorator**: it registers the function below as the handler for `GET /orders/42`. Same idea as Express’s `app.get`.',
          7: 'Flask builds the JSON response. Python itself has no `await` here: each request is handled by an ordinary function, typically on its own worker.'
        } },
      note: 'Python’s standard implementation has the global interpreter lock, so CPU-heavy work does not speed up with threads. Servers usually run several worker processes instead.' },

    { kind: 'layers', title: 'JavaScript, TypeScript and Node.js',
      body: 'Three names that get mixed up. They stack rather than compete.',
      layers: [
        { label: 'TypeScript (optional)', note: 'JavaScript plus **static types**. A compiler checks them, then strips them away.', tone: 'accent', icon: '🔷' },
        { label: 'JavaScript', note: 'The language itself. It was born in the browser, and runs on both browser and server.', tone: 'warn', icon: '📜' },
        { label: 'Node.js', note: 'A runtime that lets JavaScript run outside the browser: servers, tools, scripts. Event loop, non-blocking I/O.', tone: 'good', icon: '🟢' },
        { label: 'Operating system', note: 'Files, network sockets and the machine itself.', tone: 'muted', icon: '🖥️' }
      ] },

    { kind: 'metaphor', title: 'Ruby on Rails: the flat-pack kit',
      body: `Ruby is known for being pleasant to read and write. Its creator wanted programmers to be happy, and that mood runs through the community.

        **Rails** is the framework that made Ruby famous. Think of flat-pack furniture: the holes are already drilled, the screws are in the bag, and the instructions say which piece goes where. This is **convention over configuration**: if you name things the standard way, Rails wires them up for you.

        The catch, as with flat-pack: it is fast while you build what the kit expects, and fiddlier when you want something it never imagined.`,
      code: { lang: 'rb', src: `
        class OrdersController < ApplicationController
          def show
            order = Order.find(params[:id])
            render json: { id: order.id, total: order.total }
          end
        end`,
        notes: {
          3: 'Convention at work: a class called `Order` is assumed to be stored in a database table called `orders`. No configuration needed.',
          4: 'One line to reply with JSON. Again, the same job as the Express and Flask versions.'
        } } },

    { kind: 'sequence', title: 'PHP: born fresh for every request',
      body: 'PHP is a language built for the web. By default it runs **per request**: each visit starts a script from the top and throws everything away when done. **Laravel** is its best-known modern framework.',
      actors: ['Browser', 'PHP script', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'GET /orders', note: 'A request arrives and the web server starts your PHP code.' },
        { at: 1, label: 'run from the top', note: 'Nothing is remembered from the last visitor. A clean slate every time.' },
        { from: 1, to: 2, label: 'SELECT ... FROM orders', note: 'It asks the database for what it needs.' },
        { from: 2, to: 1, label: 'rows', dashed: true, note: 'The data comes back.' },
        { from: 1, to: 0, label: 'HTML or JSON', note: 'It builds the response and sends it.' },
        { at: 1, label: 'forget everything', note: 'The script ends. Memory is released. Simple and tidy, and it makes hosting cheap and easy.' }
      ],
      note: 'This "nothing shared between requests" model avoids many tangles. The cost: awkward for things that need a long-lived connection, like chat.' },

    { kind: 'compare', title: 'Where each one shines, and stumbles',
      body: 'Honest summaries, with no league table.',
      cols: ['Shines at', 'Stumbles at'],
      rows: [
        ['JavaScript / TypeScript', 'One language for browser and server; APIs and real-time apps; a huge package ecosystem (npm)', 'Loose typing quirks (TypeScript helps); CPU-heavy work blocks the event loop'],
        ['Python', 'Readable code; data science, machine learning and automation; Django, Flask, FastAPI', 'The GIL limits CPU-bound threads; slower than compiled languages; environment and packaging fiddliness'],
        ['Ruby', 'Developer productivity; Rails for building web apps fast; pleasant to read', 'Less common outside web work; raw speed; big systems need care'],
        ['PHP', 'Cheap hosting everywhere; simple per-request model; Laravel; powers a large share of websites', 'A history of inconsistent design and a messy reputation (modern PHP is much tidier); less natural for long-lived connections']
      ] },

    { kind: 'pitfall', title: 'Dynamic means errors arrive late',
      body: `The flexibility has a price. In a dynamically typed language, a typo or a wrong type is often found **only when that exact line runs**, perhaps at 3am for a customer.

        The classic JavaScript example is the famous message *"cannot read properties of undefined"*: you expected an object and got nothing.

        The defences are the same in all four languages: **write tests**, use a **linter**, and add types where you can (TypeScript for JavaScript, type hints for Python). Many teams treat "dynamic" as a starting point, then add structure as the code grows.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What do the three "sum the order totals" one-liners mainly show?',
      options: ['Different languages often express the same idea with different punctuation', 'Each language needs a different algorithm to add numbers together', 'Only one of them can really handle lists of data', 'Dynamic languages cannot loop, so they use special methods'],
      answer: 0,
      why: [null, 'All three walk the list and add one field. The algorithm is the same.', 'All of them handle lists easily.', 'They all have loops too. These are just shorter ways to write the job.'],
      explain: 'Once you know one mainstream language, the ideas carry over. Learning the next is mostly learning its syntax, its standard library and its habits.' },

    { type: 'tf', after: 4, statement: 'TypeScript adds static types to JavaScript, and its types are checked before the code runs as ordinary JavaScript.', answer: true,
      explain: 'TypeScript is compiled to plain JavaScript, and the types are checked and then removed at that step. So whatever runs on Node.js or in a browser is JavaScript.' },

    { type: 'order', after: 6, prompt: 'Put the life of a typical PHP request in order.',
      items: ['The request arrives and PHP starts the script', 'The script runs from the top with a clean slate', 'It queries the database and builds the response', 'The response goes back to the browser', 'The script ends and its memory is released'],
      explain: 'Per-request means a fresh start every time, and tidy-up at the end. That is easy to reason about, but nothing is remembered between visits unless you store it in a database or cache.' },

    { type: 'match', prompt: 'Match each item to the language it belongs to.',
      pairs: [['Express', 'JavaScript on Node.js'], ['Django, Flask, FastAPI', 'Python'], ['Rails', 'Ruby'], ['Laravel', 'PHP']],
      explain: 'A framework is usually tied to one language. Knowing the famous ones helps you read job ads and tutorials.' },

    { type: 'bucket', prompt: 'Which language is each description talking about?', buckets: ['JavaScript / Node.js', 'Python', 'Ruby', 'PHP'],
      items: [['One language for both the browser and the server', 0], ['A global interpreter lock limits its CPU-bound threads', 1], ['"Convention over configuration" in a famous framework', 2], ['A script starts fresh for every request by default', 3], ['A single-threaded event loop with non-blocking I/O', 0], ['Popular for data science, machine learning and automation', 1]],
      explain: 'Each language has a signature feature or style. These clues are the quickest way to remember who is who.' },

    { type: 'spot', prompt: 'This Express handler has a bug that shows up on some days. Tap the line.',
      code: { lang: 'js', src: `
        app.get('/orders/total', (req, res) => {
          const orders = loadTodaysOrders();
          const total = orders.reduce((s, o) => s + o.total);
          res.json({ total });
        });` },
      lines: [3],
      explain: 'Without a starting value (`, 0`), `reduce` throws an error on an empty list and returns the first order object itself for a one-item list. On a quiet day, the endpoint breaks. Dynamic languages let this through until it runs.' },

    { type: 'ab', q: 'Which Node.js handler keeps the server responsive while it reads a big file?',
      a: { lang: 'js', label: 'Blocking read', src: `
        app.get('/report', (req, res) => {
          const text = fs.readFileSync('big.csv', 'utf8');
          res.send(text);
        });` },
      b: { lang: 'js', label: 'Awaited read', src: `
        app.get('/report', async (req, res) => {
          const text = await fs.promises.readFile('big.csv', 'utf8');
          res.send(text);
        });` },
      answer: 'b',
      explain: 'The awaited read lets the event loop serve other requests while the disk is busy. The synchronous call blocks the one thread, so every other user waits.' },

    { type: 'short', q: 'What language does TypeScript get compiled into?', accept: ['JavaScript', 'JS'], hint: 'It is the language browsers understand.',
      explain: 'TypeScript is JavaScript with types on top. The compiler checks the types, then emits ordinary JavaScript.' },

    { type: 'explain', prompt: 'In your own words: what does "per-request" mean for PHP, and what is one benefit and one cost?',
      model: 'By default PHP starts your script fresh for every request and throws everything away at the end. The benefit is simplicity: no leftover state to worry about, and hosting is cheap and easy. The cost is that nothing is remembered between requests, and it is a less natural fit for long-lived connections like chat.',
      keywords: ['fresh', 'request', 'forget', 'state', 'simple', 'connection'] }
  ],

  flashcards: [
    { q: 'What is the relationship between JavaScript, TypeScript and Node.js?', a: 'JavaScript is the language, TypeScript adds static types and compiles to it, and Node.js is the runtime that runs JavaScript on servers.' },
    { q: 'What is Python’s global interpreter lock (GIL)?', a: 'In the standard implementation, only one thread runs Python code at a time, so threads do not speed up CPU-heavy work.' },
    { q: 'What is "convention over configuration" in Rails?', a: 'Rails assumes standard names and layouts so that you configure almost nothing. Follow the conventions and it wires things up for you.' },
    { q: 'What does it mean that PHP runs per request?', a: 'Each request starts a script from scratch and discards everything when it ends. Nothing is shared between visitors by default.' },
    { q: 'Why is a long calculation risky in Node.js?', a: 'Code runs on one thread, so a long-running calculation blocks the event loop and every other request waits.' }
  ],

  glossary: [
    { term: 'Framework', def: 'A ready-made skeleton for an application that handles common chores like routing, database access and templates, so you fill in the specifics.', like: 'A flat-pack furniture kit.', aka: ['web framework'] },
    { term: 'Node.js', def: 'A runtime that runs JavaScript outside the browser, built around an event loop and non-blocking I/O.', like: 'A kitchen that lets a browser chef cook on a server.' },
    { term: 'TypeScript', def: 'JavaScript with static types added. It is compiled to plain JavaScript, and the types are erased in the process.', like: 'JavaScript wearing a seatbelt.', aka: ['TS'] },
    { term: 'Convention over configuration', def: 'A design style where standard naming and layout are assumed by default, so you only configure the exceptions.', like: 'Walking into a chain restaurant and already knowing where the toilets are.' },
    { term: 'Global interpreter lock', def: 'A lock in the standard Python implementation that lets only one thread execute Python code at a time.', like: 'A single shared pen that only one person may hold at once.', aka: ['GIL'] }
  ],

  takeaways: [
    'JavaScript, Python, Ruby and PHP are cousins: dynamic, flexible and quick to write.',
    'Node.js runs JavaScript on the server with an event loop. TypeScript adds types on top.',
    'Rails (Ruby) and Laravel (PHP) are frameworks that give you most of a web app up front.',
    'Dynamic typing shifts some errors to runtime: tests, linters and added types are the defence.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('lang-tour-static', {
  eli5: 'Java, C#, Go and Rust check your types before the program runs, which makes them dependable choices for big or demanding systems, each with a different way of staying fast and safe.',

  cards: [
    { kind: 'concept', title: 'The strict, sturdy four',
      body: `Last lesson’s languages were flexible and quick to start. These ones make a different bargain: **you tell the compiler more up front, and it catches more mistakes before anything runs**.

        That strictness pays off when a codebase gets big, many people work in it, or the system must stay up. You will meet them in banks, large companies, cloud tooling and anywhere speed or reliability matters.

        Java, C#, Go and Rust are all **statically typed** and compiled, but they compile to different places, handle memory differently, and juggle concurrency their own way. We will also glance at Kotlin, Scala and Swift on the way.` },

    { kind: 'compare', title: 'The same job again: summing order totals',
      body: 'Totals stored as whole pence, to keep the maths simple.',
      cols: ['Java', 'C#', 'Go'],
      rows: [
        ['The code', '`orders.stream().mapToInt(Order::total).sum()`', '`orders.Sum(o => o.Total)`', '`for _, o := range orders { sum += o.Total }`'],
        ['Style', 'Streams of values; types written out', 'Close cousin of Java, with LINQ query helpers', 'Plain loop; deliberately small and explicit'],
        ['Runs as', 'Bytecode on the JVM', 'Intermediate code on .NET', 'A native machine-code binary']
      ],
      note: 'Java and C# look alike because they grew up as rivals and borrowed from each other. Go goes the other way: few features, little magic, easy for anyone to read.' },

    { kind: 'code', title: 'Go: a handler and a single binary',
      body: `**Go** compiles to **one self-contained executable file**: copy it to a server and run it, with nothing else to install. Its standard library already includes a web server. Tap the lines.`,
      code: { lang: 'go', src: `
        func orderHandler(w http.ResponseWriter, r *http.Request) {
            order, err := db.FindOrder(42)
            if err != nil {
                http.Error(w, "not found", http.StatusNotFound)
                return
            }
            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(order)
        }`,
        notes: {
          2: 'Go functions often return **two values**: the result and an `err`. There are no exceptions in the usual style: errors are ordinary values you handle.',
          3: 'Go makes you deal with the error on the spot. It is wordy, but you can always see where things might fail.',
          8: 'Encode the order as JSON straight into the response. Note the types: `order` has a known shape, checked at compile time.'
        } } },

    { kind: 'code', title: 'Go’s concurrency: goroutines and channels',
      body: `Go’s signature feature. A **goroutine** is a very cheap task started with the \`go\` keyword. A **channel** is a pipe goroutines use to pass values to each other, instead of fighting over shared variables.`,
      code: { lang: 'go', src: `
        results := make(chan int)
        for _, id := range ids {
            go func(id int) {
                results <- fetchTotal(id)
            }(id)
        }
        sum := 0
        for range ids { sum += <-results }`,
        notes: {
          1: 'A channel carrying whole numbers. Think of a letterbox that goroutines post into.',
          3: 'Start a goroutine for each id. It costs very little, so thousands are fine.',
          4: 'Send this job’s answer into the channel with `<-`.',
          8: 'Receive one result per goroutine and add them up. No locks needed here: the channel does the coordinating.'
        } } },

    { kind: 'layers', title: 'The JVM family (and .NET)',
      body: 'Java is not alone on its virtual machine. Several languages compile to the same bytecode, and so can use each other’s libraries.',
      layers: [
        { label: 'Java · Kotlin · Scala', note: 'Different languages: Java is the classic, Kotlin is more concise (and the common choice for Android apps), Scala mixes object-oriented and functional styles.', tone: 'accent', icon: '☕' },
        { label: 'JVM bytecode', note: 'What the compilers all produce.', tone: 'warn', icon: '📦' },
        { label: 'The Java Virtual Machine', note: 'Runs the bytecode, manages memory with a garbage collector, and compiles hot code to machine code.', tone: 'good', icon: '⚙️' },
        { label: 'Operating system', note: 'Any OS that has a JVM installed.', tone: 'muted', icon: '🖥️' }
      ],
      note: '**C#** follows the same pattern on **.NET**: C# (and sibling languages such as F#) compile to an intermediate form that the .NET runtime executes. Frameworks to know: **Spring Boot** for Java, **ASP.NET Core** for C#.' },

    { kind: 'metaphor', title: 'Rust: one owner per library book',
      body: `Languages like Java, C# and Go have a **garbage collector** that tidies up memory for you at runtime (you met that in the operating systems module). **Rust has no garbage collector**, yet it still prevents most memory bugs. How?

        Imagine every value is a library book. At any moment there is exactly **one owner**. You may *lend* it: either to **many readers** at once, or to **one person who can write in it**, never both. When the owner leaves, the book goes back on the shelf automatically.

        Rust calls these rules **ownership and borrowing**, and the compiler checks them before your program is allowed to exist. The metaphor stops here: there is no librarian at runtime, only a very strict compiler.`,
      note: 'The reward is C-like speed and no pauses for garbage collection. The price is a steeper learning curve, because the compiler argues with you until the program is safe. Popular web frameworks include Actix and Axum.' },

    { kind: 'compare', title: 'Typical territory and trade-offs',
      body: 'Where you will usually meet each one, and what you give up.',
      cols: ['Typically used for', 'Trade-offs'],
      rows: [
        ['Java, Kotlin, Scala', 'Large business systems, banks, Android (Kotlin), big-data tools (Scala)', 'Needs a VM; more ceremony; huge ecosystem, but Java code can be wordy'],
        ['C#', 'Business software, web APIs with ASP.NET Core, games (Unity), Windows-heavy shops', 'Strongest where the .NET ecosystem is already in use'],
        ['Go', 'Cloud tooling, network services, command-line tools', 'Deliberately few features; wordy error handling'],
        ['Rust', 'Performance-critical or low-level services, where a garbage collector is unwelcome', 'Steeper learning curve; slower to write at first'],
        ['Swift', 'Apple apps; also usable on the server', 'Server ecosystem is smaller than the others']
      ] },

    { kind: 'tip', title: 'Choose by problem, not by hype',
      body: `Every language above gets praised as "the future" by someone. Ignore the volume and ask what problem you have.

        - A typical web API with a large team? **Java, Kotlin or C#** are mature and well-supported.
        - A small network service or tool that must deploy as one file? **Go** is a natural fit.
        - A component where memory use and pauses are critical? **Rust** earns its learning curve.
        - A team of Apple developers who want one language everywhere? **Swift on the server** can make sense.

        And the earlier lesson still applies: the team’s skills and the ecosystem often outweigh the language’s features.` },

    { kind: 'pitfall', title: 'The "rewrite it in X" trap',
      body: `A working system written in an older language is often called "legacy", as if that were an insult. It is usually the code that **pays the bills**.

        Rewriting from scratch because a newer language looks exciting is a famously risky move: you spend months rebuilding what already works, and you re-introduce bugs that were fixed years ago.

        Safer is to **rewrite only the part that truly hurts**, or add new features in the new language beside the old. Experts do disagree on when a rewrite is justified, but "it is not trendy" is rarely a good reason.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Why does the Go version of "sum the totals" use a plain loop while Java and C# use a one-liner?',
      options: ['Go deliberately keeps its feature set small and explicit', 'Go has no way to loop over a list of values', 'Go is dynamically typed, so it avoids helper methods', 'Loops are required for any compiled language'],
      answer: 0,
      why: [null, 'Go has a perfectly good `range` loop, and that is exactly what it uses.', 'Go is statically typed.', 'Java and C# are compiled too, and use higher-level helpers.'],
      explain: 'Go’s designers chose a small, plain language that anyone can read quickly. The result is a few more lines, with little hidden behaviour.' },

    { type: 'tf', after: 5, statement: 'Rust avoids memory bugs by using a garbage collector that pauses the program to clean up.', answer: false,
      explain: 'Rust has no garbage collector. Its compiler enforces ownership and borrowing rules at build time, so most memory mistakes are rejected before the program runs.' },

    { type: 'cloze', after: 3, text: 'In Go you start a lightweight task with the {{go}} keyword, and tasks pass values to each other through a {{channel}}.',
      distractors: ['thread', 'async', 'lock'],
      explain: 'Goroutines are cheap tasks scheduled by Go’s own runtime. Channels let them hand data over safely, instead of sharing and locking variables.' },

    { type: 'bucket', prompt: 'Where does this code actually run?', buckets: ['The JVM', 'The .NET runtime', 'Directly as a native binary'],
      items: [['Java', 0], ['Kotlin', 0], ['Scala', 0], ['C#', 1], ['Go', 2], ['Rust', 2]],
      explain: 'Java, Kotlin and Scala all compile to JVM bytecode. C# targets .NET. Go and Rust compile straight to machine code, so the output is an ordinary executable.' },

    { type: 'spot', prompt: 'This Go handler has a habit that causes silent bugs. Tap the line.',
      code: { lang: 'go', src: `
        func reportHandler(w http.ResponseWriter, r *http.Request) {
            data, err := os.ReadFile("orders.json")
            _ = err
            w.Write(data)
        }` },
      lines: [3],
      explain: 'Assigning the error to `_` throws it away. If the file is missing, the handler carries on with empty data and the user gets a blank response with no clue why. Go gives you the error as a value precisely so you handle it.' },

    { type: 'multi', q: 'Which of these languages run on the Java Virtual Machine?',
      options: ['Java', 'Kotlin', 'Scala', 'Go', 'Rust'],
      answers: [0, 1, 2],
      explain: 'Java, Kotlin and Scala all compile to JVM bytecode. Go and Rust compile to native code and need no virtual machine.' },

    { type: 'scenario', title: 'Three services, three decisions', intro: 'You are advising a mid-sized company. They have asked you to choose a language for **three different services**. Match the tool to the problem.',
      meters: { 'fit': 50, 'team morale': 60 },
      steps: [
        { text: 'First: a bank-style payments API, built by forty developers who mostly know Java. It will live for ten years.',
          choices: [
            { label: 'Java or Kotlin on the JVM with a mature framework like Spring Boot', score: 2, effects: { fit: 25, 'team morale': 10 }, feedback: 'Mature, well-supported, and the team already knows it. For a long-lived system with many people, that stability is the point.' },
            { label: 'Rewrite it all in Rust for safety', score: 0, effects: { fit: -15, 'team morale': -25 }, feedback: 'Rust is excellent, but forty developers learning ownership from scratch while the bank waits is a very expensive experiment.' },
            { label: 'Use whichever language is trending this month', score: 0, effects: { fit: -20, 'team morale': -10 }, feedback: 'Trends are a bad basis for a ten-year system. Hiring, tooling and support matter far more.' }
          ] },
        { text: 'Second: a small tool that watches servers and must ship as one file the operations team can copy anywhere.',
          choices: [
            { label: 'Go: compile it to a single static binary', score: 2, effects: { fit: 25, 'team morale': 10 }, feedback: 'This is the classic Go use. No runtime to install, and goroutines make watching many servers at once easy.' },
            { label: 'A language needing a VM and many libraries on every server', score: 1, effects: { fit: -5 }, feedback: 'It would work, but you are creating deployment chores that a single binary removes.' },
            { label: 'Hand-roll it in a language with manual memory management', score: 0, effects: { fit: -15, 'team morale': -15 }, feedback: 'You would take on memory bugs for a tool that does not need that kind of control.' }
          ] },
        { text: 'Third: a component that processes huge streams of audio in real time, where pauses from a garbage collector would cause audible glitches.',
          choices: [
            { label: 'Rust (or a similar language without a garbage collector)', score: 2, effects: { fit: 25, 'team morale': 5 }, feedback: 'Predictable memory use and no collector pauses is exactly what Rust is for. This is where its learning curve pays off.' },
            { label: 'Keep it in the same language as everything else, whatever the cost', score: 1, effects: { fit: -5 }, feedback: 'Consistency is valuable, but not when the language’s memory model fights the main requirement.' },
            { label: 'A dynamically typed scripting language, for speed of writing', score: 0, effects: { fit: -20 }, feedback: 'Great for prototypes, but a poor match for real-time work with tight timing.' }
          ] }
      ],
      outro: 'The pattern: **read the problem first, then pick the language.** Three problems, three different good answers.' },

    { type: 'short', q: 'Which runtime does C# code run on?', accept: ['.NET', 'dotnet', 'NET'], hint: 'It also gives ASP.NET Core its name.',
      explain: '.NET is to C# what the JVM is to Java: the runtime that executes the compiled code.' },

    { type: 'explain', prompt: 'A colleague says: "We should rewrite our working Java system in Rust because Rust is better." Give a balanced reply.',
      model: 'Rust has real strengths, like no garbage collector and strong memory safety, but "better" depends on the problem. A working Java system already pays for itself, and a rewrite risks months of effort and old bugs coming back. Choose by problem and team skills, and rewrite only the part that genuinely hurts.',
      keywords: ['problem', 'garbage collector', 'rewrite', 'team', 'risk', 'trade-off'] }
  ],

  flashcards: [
    { q: 'What does it mean that Go builds a single static binary?', a: 'The compiler produces one self-contained executable with everything it needs, so deployment is "copy the file and run it".' },
    { q: 'Which languages run on the JVM?', a: 'Java, Kotlin and Scala, among others. They all compile to JVM bytecode.' },
    { q: 'What replaces the garbage collector in Rust?', a: 'Ownership and borrowing rules, checked by the compiler. Memory is freed when its single owner goes out of scope.' },
    { q: 'What are goroutines and channels?', a: 'Goroutines are very cheap tasks started with `go`. Channels are the pipes they use to pass values to each other.' },
    { q: 'Why does Go make you handle errors explicitly?', a: 'Functions return errors as ordinary values rather than throwing exceptions, so every failure point is visible in the code.' }
  ],

  glossary: [
    { term: 'JVM', def: 'The Java Virtual Machine: a program that runs Java bytecode. Kotlin and Scala compile to the same bytecode.', like: 'A universal adaptor that lets one plug fit every wall socket.', aka: ['Java Virtual Machine'] },
    { term: '.NET', def: 'The runtime and libraries on which C# (and other languages) run, and which ASP.NET Core builds on.', like: 'The JVM’s counterpart in the Microsoft world.' },
    { term: 'Goroutine', def: 'A very lightweight task in Go, started with the `go` keyword and scheduled by Go’s runtime.', like: 'A featherweight waiter you can hire in their thousands.' },
    { term: 'Channel', def: 'A typed pipe in Go that goroutines use to send values to each other safely.', like: 'A letterbox between two workers.' },
    { term: 'Ownership', def: 'Rust’s rule that every value has exactly one owner, and may be lent out to either many readers or one writer, checked at compile time.', like: 'One owner per library book.', aka: ['borrowing'] }
  ],

  takeaways: [
    'Java and C# run on managed runtimes (the JVM and .NET); Go and Rust compile to native binaries.',
    'Go gives you a single binary plus goroutines and channels. Rust gives you memory safety with no garbage collector.',
    'Kotlin and Scala share the JVM with Java, and Swift can run on the server too.',
    'Pick by problem and team, not hype, and be wary of full rewrites.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('git-basics', {
  eli5: 'Git keeps a numbered list of save points for your project, so you can see what changed, who changed it and go back to any earlier version.',

  cards: [
    { kind: 'concept', title: 'final_FINAL_v3_really.js',
      body: `You have probably done it: copied a file to \`report_v2\`, then \`report_final\`, then \`report_final_REALLY\`. It works for one file and one person. It collapses with fifty files and five people, all editing at once.

        **Version control** is the grown-up answer. It records every change to a project over time: **what** changed, **who** changed it, **when**, and (if they were polite) **why**. You can compare versions, go back to any of them, and combine several people’s work.

        The tool almost everyone uses is **Git**. It is free, it works offline, and it is the foundation under GitHub and GitLab (the lesson after next).` },

    { kind: 'metaphor', title: 'Save points in a video game',
      body: `In a long game you save before the boss fight. If you lose, you reload and try again; nothing is gone.

        Git works like that for code. Each save point is called a **commit**: a snapshot of your whole project at one moment, with a label saying what you did. Commits form a timeline you can browse, compare and return to.

        Where the metaphor stops: a game has one save slot per player, while Git lets many people create save points **in parallel** and then merge them, which is the subject of the next lesson.` },

    { kind: 'diagram', title: 'Three places your changes live',
      body: 'Git does not save automatically. You move changes through three areas, on purpose.',
      nodes: [
        { id: 'wt', label: 'Working tree', icon: '✏️', x: 1, y: 0, tone: 'warn' },
        { id: 'st', label: 'Staging area', icon: '🧺', x: 1, y: 1, tone: 'info' },
        { id: 'repo', label: 'Repository (history)', icon: '🗄️', x: 1, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'wt', to: 'st', label: 'git add' },
        { from: 'st', to: 'repo', label: 'git commit' },
        { from: 'repo', to: 'wt', label: 'git restore', dashed: true }
      ],
      caption: 'The working tree is your actual files. The staging area is a basket of what goes into the next commit. The repository is the saved history.' },

    { kind: 'code', title: 'Edit, stage, commit',
      body: 'A **repository** (repo) is a project folder that Git is tracking. Here is one small change travelling through the three areas. Tap the lines.',
      code: { lang: 'sh', src: `
        $ git status
        On branch main
        Changes not staged for commit:
            modified:   cart.js
        $ git add cart.js
        $ git status
        Changes to be committed:
            modified:   cart.js
        $ git commit -m "Round cart total to pence"
        [main 3f2a9c1] Round cart total to pence
         1 file changed, 1 insertion(+), 1 deletion(-)`,
        notes: {
          1: '`git status` is the command you will run most. It tells you what has changed and what is ready to commit.',
          3: '"Not staged" means: edited in your working tree, but not yet in the basket.',
          5: '`git add` moves the change into the **staging area**. You choose exactly which edits belong together.',
          7: 'Now it is "to be committed". Staging lets you build a tidy commit even if you edited five unrelated things.',
          9: '`git commit` saves the staged changes as one snapshot. `-m` is the message that explains it.',
          10: '`3f2a9c1` is the commit’s unique id (shortened). Every commit gets one.'
        } } },

    { kind: 'code', title: 'Reading the history with git log',
      body: 'The log lists commits, newest first. This compact form shows an id and a message for each.',
      code: { lang: 'sh', src: `
        $ git log --oneline
        3f2a9c1 Round cart total to pence
        b81e4d0 Add discount codes
        9c07aa2 Create cart page`,
        notes: {
          2: 'The newest commit, the one we just made.',
          4: 'The first commit ever. Each one remembers its **parent**, so the history is a chain you can walk backwards.'
        } },
      note: 'Without `--oneline`, `git log` also shows each commit’s author, date and full message.' },

    { kind: 'code', title: 'Reading a diff',
      body: 'A **diff** shows exactly what changed. Lines starting with `-` were removed, lines with `+` were added.',
      code: { lang: 'sh', src: `
        $ git diff
        diff --git a/cart.js b/cart.js
        --- a/cart.js
        +++ b/cart.js
        @@ -11,3 +11,3 @@ function total(items) {
           for (const i of items) sum += i.price;
        -  return sum;
        +  return Math.round(sum * 100) / 100;
         }`,
        notes: {
          1: '`git diff` compares your working tree with the staging area, so it shows edits you have **not yet staged**. `git diff --staged` shows what is in the basket.',
          5: 'The `@@` line says where in the file this chunk is, and the name of the function around it.',
          7: 'A red line in most tools: removed.',
          8: 'A green line: added. Together they show a one-line replacement.'
        } } },

    { kind: 'diagram', title: 'History is a chain of snapshots',
      body: 'Each commit points back at its parent. The name `main` just points at the newest commit.',
      nodes: [
        { id: 'main', label: 'main (newest)', icon: '🏷️', x: 0, y: 0, tone: 'good' },
        { id: 'c3', label: '3f2a9c1 Round to pence', x: 1, y: 0, tone: 'accent' },
        { id: 'c2', label: 'b81e4d0 Add discounts', x: 1, y: 1 },
        { id: 'c1', label: '9c07aa2 Create cart', x: 1, y: 2 }
      ],
      edges: [
        { from: 'main', to: 'c3', label: 'points at', dashed: true },
        { from: 'c3', to: 'c2', label: 'parent' },
        { from: 'c2', to: 'c1', label: 'parent' }
      ],
      caption: 'Arrows point from child to parent, the direction Git really stores them in. Next lesson: more than one label, and what happens when the chain forks.' },

    { kind: 'compare', title: 'Undoing mistakes: safe vs dangerous',
      body: 'Git rarely forgets, but a few commands do destroy work. Learn which is which.',
      cols: ['git restore', 'git revert', 'git reset --hard'],
      rows: [
        ['What it does', 'Throws away your uncommitted edits to a file', 'Adds a **new commit** that undoes an earlier one', 'Moves history back and wipes your uncommitted work'],
        ['History', 'Untouched', 'Kept, with the mistake and its undo both visible', 'Rewritten: commits can vanish'],
        ['Safety', 'Careful: those edits are gone for good', '**Safe**, even for shared work', '**Dangerous**: easy to lose work']
      ],
      note: 'Rule of thumb: to undo something already committed, `git revert` is the safe choice. Reach for `reset --hard` only on your own local work you are happy to lose.' },

    { kind: 'pitfall', title: 'Anything you commit can stay in history',
      body: `The classic disaster: someone commits a file containing a **password or API key**, then deletes it in the next commit and thinks it is gone. It is not. The old commit still has it, and anyone with the repo can read it.

        Two habits protect you:

        - List files that must never be committed (\`.env\`, keys, build output) in a file called **\`.gitignore\`**.
        - Run \`git status\` before \`git add .\`, and read what you are about to stage.

        If a secret does get committed and shared, treat it as **leaked**: change it immediately.` },

    { kind: 'tip', title: 'Small commits, clear messages',
      body: `Future you will read this log to find out when something broke. Help them.

        - **One idea per commit.** "Fix rounding" and "Add discount codes" are two commits, even if you did them in one sitting. That is exactly what the staging area is for.
        - **Say what and why**, in the present tense: "Round cart total to pence". Not "stuff", "wip" or "changes".
        - **Commit often.** Small save points are easy to understand, easy to undo and easy to review.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'You edited five files but only two belong in the next commit. What lets you commit just those two?',
      options: ['Stage only those two files with `git add`, then commit', 'Delete the other three files first, then commit', 'Commit everything and delete the extras in the next commit', 'Run `git log` to choose which files to include'],
      answer: 0,
      why: [null, 'Deleting would lose your edits. You only need to leave them out of this commit.', 'That would clutter history with unrelated changes, and mix up what each commit means.', '`git log` only shows history. It does not choose what goes in a commit.'],
      explain: 'The staging area is a basket: only what you have added goes into the next commit. The other edits stay in your working tree, still safe, for a later commit.' },

    { type: 'order', after: 3, prompt: 'Put the everyday Git cycle in order.',
      items: ['Edit your files (working tree)', 'Check what changed with `git status`', 'Stage the changes with `git add`', 'Save them with `git commit -m "…"`', 'Review the history with `git log`'],
      explain: 'Edit, look, stage, commit, review. Staging comes before committing because a commit only includes what is already in the basket.' },

    { type: 'tf', after: 6, statement: 'Each commit remembers its parent, so you can walk backwards through history one commit at a time.', answer: true,
      explain: 'Commits form a chain (and later, a branching graph) linked by parent pointers. That is how `git log` knows what order to show them in.' },

    { type: 'match', prompt: 'Match each command to what it does.',
      pairs: [['git status', 'Shows what changed and what is staged'], ['git add', 'Moves changes into the staging area'], ['git commit', 'Saves the staged changes as a snapshot'], ['git log', 'Lists the commits, newest first'], ['git diff', 'Shows exactly which lines changed']],
      explain: 'These five commands cover most daily Git use. `status` and `diff` look, `add` and `commit` save, `log` remembers.' },

    { type: 'ab', q: 'Which commit message will help you most in six months?',
      a: { lang: 'sh', label: 'Message one', src: `
        $ git commit -m "stuff"` },
      b: { lang: 'sh', label: 'Message two', src: `
        $ git commit -m "Reject empty carts at checkout"` },
      answer: 'b',
      explain: 'A good message says what changed and hints at why. When you are hunting for the commit that introduced a bug, "stuff" tells you nothing.' },

    { type: 'bucket', prompt: 'Which undo tool fits each situation?', buckets: ['git restore', 'git revert', 'git reset --hard'],
      items: [['I broke cart.js with unsaved edits and want the last committed version back', 0], ['A commit that is already shared with the team broke checkout', 1], ['I want to undo a shipped change but keep the history of what happened', 1], ['I discard a file I just experimented with, uncommitted', 0], ['Wipe all my local work and commits and start over (dangerous)', 2], ['I made a mess locally and accept losing every uncommitted change', 2]],
      explain: '`restore` is for uncommitted edits to files. `revert` is the safe, history-preserving undo for commits. `reset --hard` is the sledgehammer: powerful, and destructive.' },

    { type: 'spot', prompt: 'You are about to commit. Something in this status output should stop you. Tap the line.',
      code: { lang: 'sh', src: `
        $ git status
        Changes to be committed:
            modified:   cart.js
            modified:   checkout.js
            new file:   .env
            new file:   notes.txt` },
      lines: [5],
      explain: 'A `.env` file usually holds passwords and API keys. Once committed, it lives in history even if you delete it later. Add it to `.gitignore` and unstage it before committing.' },

    { type: 'scenario', title: 'Friday, 5pm', intro: 'A change you committed this morning has gone live, and **customers are seeing wrong totals**. The commit has been shared with the team already.',
      meters: { 'customer trust': 50, 'history safety': 80 },
      steps: [
        { text: 'You find the bad commit with `git log`. What do you do first?',
          choices: [
            { label: 'Run `git revert` on that commit to add a new commit that undoes it', score: 2, effects: { 'customer trust': 25 }, feedback: 'Safe and clear. The history shows the mistake and its fix, and nobody’s copy of the project is surprised by vanished commits.' },
            { label: 'Run `git reset --hard` to erase the commit as if it never existed', score: 0, effects: { 'customer trust': 5, 'history safety': -40 }, feedback: 'You have rewritten history that others already have. Their copies will disagree with yours, and uncommitted work can disappear. Dangerous.' },
            { label: 'Quietly edit the file by hand and commit without a message that explains it', score: 1, effects: { 'customer trust': 10, 'history safety': -5 }, feedback: 'It might fix the symptom, but nobody can later tell what happened. A proper revert is clearer.' }
          ] },
        { text: 'While fixing it, you notice you also have half-finished experiments in `cart.js` that you do not want to keep.',
          choices: [
            { label: 'Use `git restore cart.js` to discard those uncommitted edits', score: 2, effects: { 'history safety': 5 }, feedback: 'That is exactly what `restore` is for. Just be sure: those edits are not in any commit, so they are gone for good.' },
            { label: 'Use `git revert` for them', score: 0, effects: { 'history safety': -10 }, feedback: '`revert` undoes **commits**. These edits were never committed, so there is nothing to revert.' },
            { label: 'Commit them anyway so nothing is lost', score: 1, effects: { 'history safety': -10 }, feedback: 'Committing half-finished experiments pollutes history. Commit only work you intend to keep.' }
          ] },
        { text: 'The incident is over. How should you commit the real fix?',
          choices: [
            { label: 'A small commit with a clear message like "Fix rounding of cart total"', score: 2, effects: { 'customer trust': 15, 'history safety': 10 }, feedback: 'Small, focused and explained: easy to review and easy to find later.' },
            { label: 'One huge commit, "fixes", containing everything from the week', score: 0, effects: { 'history safety': -20 }, feedback: 'You have made the next incident harder to debug. Nobody can tell which change did what.' },
            { label: 'Skip the message and move on', score: 0, effects: { 'history safety': -10 }, feedback: 'The message is half the value of version control.' }
          ] }
      ],
      outro: 'The pattern: **undo shared mistakes with `revert`, discard unsaved edits with `restore`, and avoid `reset --hard` unless it is your own throwaway work.**' },

    { type: 'explain', prompt: 'In your own words: what is the staging area for, and why does Git have one?',
      model: 'The staging area is a basket where you choose exactly which changes go into the next commit. It lets you edit several things but commit them as separate, focused snapshots, so history stays clear: one idea per commit, with a message to match.',
      keywords: ['staging', 'basket', 'commit', 'choose', 'one idea', 'history'] }
  ],

  flashcards: [
    { q: 'What is a commit?', a: 'A snapshot of the whole project at one moment, with a message, an author, and a link to its parent commit.' },
    { q: 'What are the three areas your changes pass through?', a: 'Working tree (your files), staging area (what goes in the next commit), then the repository (saved history).' },
    { q: 'What does `git diff` show?', a: 'The exact lines that changed. Lines beginning with `-` were removed and lines with `+` were added.' },
    { q: 'Which undo is safe for a commit that has been shared?', a: '`git revert`, which adds a new commit that undoes the old one without rewriting history.' },
    { q: 'Why is `git reset --hard` dangerous?', a: 'It moves history back and discards uncommitted work, so commits and edits can be lost for good.' }
  ],

  glossary: [
    { term: 'Repository', def: 'A project folder that Git tracks, along with the full history of its commits (kept in a hidden `.git` folder).', like: 'A project folder with a built-in time machine.', aka: ['repo'] },
    { term: 'Commit', def: 'A saved snapshot of the project with a message, an author and a pointer to its parent commit.', like: 'A save point in a game.' },
    { term: 'Staging area', def: 'The place where you gather the changes that will go into your next commit.', like: 'A basket at the shop till.', aka: ['index'] },
    { term: 'Working tree', def: 'The actual files in your project folder, as you are editing them right now.', like: 'The document open on your desk.', aka: ['working directory'] },
    { term: 'Diff', def: 'A listing of the exact lines added and removed between two versions.', like: 'Track changes for code.' }
  ],

  takeaways: [
    'Git saves **snapshots (commits)** on purpose: working tree → staging area → commit.',
    '`status` looks, `add` stages, `commit` saves, `log` and `diff` show the story.',
    '**Revert** is the safe undo. **Reset --hard** can destroy work, so use it carefully.',
    'Never commit secrets, and keep commits small with messages that say why.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('git-branching', {
  eli5: 'A branch is a movable name for a line of work, so you can try something new without disturbing the main project, then join your work back in when it is ready.',

  cards: [
    { kind: 'concept', title: 'Two jobs, one codebase',
      body: `You are halfway through building a login page when your manager says: "Urgent, the checkout has a bug, fix it now." Your login code is half-written and would break everything if it shipped.

        What do you do? Copy the folder? Stash your files somewhere? Both are miserable.

        Git's answer is the **branch**: a separate line of work that shares history with everything else. You park the login work on one branch, fix checkout on another, and ship each when it is ready. No copying folders, and no tripping over each other.

        Branches are why Git exists in the shape it does.` },

    { kind: 'diagram', title: 'A branch is just a label',
      body: 'Here is the surprise: a branch is **not a copy of your files**. It is a small movable label pointing at one commit. When you commit, the label moves forward. **HEAD** is Git’s "you are here" marker: it says which branch you are currently on.',
      nodes: [
        { id: 'c1', label: 'C1', x: 1, y: 3 },
        { id: 'c2', label: 'C2', x: 1, y: 2, tone: 'accent' },
        { id: 'c3', label: 'C3', x: 0, y: 1 },
        { id: 'c4', label: 'C4', x: 0, y: 0, tone: 'good' },
        { id: 'main', label: 'main', icon: '🏷️', x: 2, y: 2, tone: 'accent' },
        { id: 'feat', label: 'feature ← HEAD', icon: '🏷️', x: 1, y: 0, tone: 'good' }
      ],
      edges: [
        { from: 'c2', to: 'c1', label: 'parent' }, { from: 'c3', to: 'c2' }, { from: 'c4', to: 'c3' },
        { from: 'main', to: 'c2', dashed: true }, { from: 'feat', to: 'c4', dashed: true }
      ],
      caption: '`main` still points at C2. `feature` has moved on to C4. Creating a branch costs almost nothing, because only a label is made.' },

    { kind: 'code', title: 'Creating and switching branches',
      body: 'One command creates a branch and moves you onto it.',
      code: { lang: 'sh', src: `
        $ git switch -c feature/login
        Switched to a new branch 'feature/login'
        $ git branch
        * feature/login
          main`,
        notes: {
          1: '`-c` means create. `feature/login` is just a name; slashes are fine and often used to group branches.',
          4: 'The `*` marks the branch you are on right now (where HEAD points). Any commit you make now moves **this** label.'
        } },
      note: 'To go back: `git switch main`. Your files change to match that branch, instantly.' },

    { kind: 'code', title: 'Joining up: the fast-forward merge',
      body: 'When the work is done, you **merge** the branch back. Sometimes it is trivially easy: `main` has not moved since you branched, so Git just slides the label forward.',
      code: { lang: 'sh', src: `
        $ git switch main
        Switched to branch 'main'
        $ git merge feature/login
        Updating 3f2a9c1..a41b7e2
        Fast-forward
         login.js | 24 ++++++++++++++++++++++++
         1 file changed, 24 insertions(+)`,
        notes: {
          3: 'Merging means: bring the other branch’s work into the branch I am **on**. So switch to the receiving branch first.',
          5: '**Fast-forward**: no new commit is needed. `main` simply moves up the line to where `feature/login` already is.'
        } } },

    { kind: 'diagram', title: 'When both sides moved: the merge commit',
      body: 'If `main` also got new commits while you worked, a straight slide is impossible: the histories have **forked**. Git joins them with a special **merge commit**, which has **two parents**.',
      nodes: [
        { id: 'm', label: 'M  merge commit', icon: '🔀', x: 1, y: 0, tone: 'good' },
        { id: 'c2', label: 'C2  work on main', x: 2, y: 1, tone: 'accent' },
        { id: 'c3', label: 'C3  work on feature', x: 0, y: 1, tone: 'warn' },
        { id: 'c1', label: 'C1  where they split', x: 1, y: 2 }
      ],
      edges: [
        { from: 'm', to: 'c2', label: 'parent 1' }, { from: 'm', to: 'c3', label: 'parent 2' },
        { from: 'c2', to: 'c1' }, { from: 'c3', to: 'c1' }
      ],
      caption: 'Both lines of work are preserved exactly as they happened, joined at M. Honest, but the graph gets busy on a big team.' },

    { kind: 'metaphor', title: 'Rebase: re-sticking your notes',
      body: `There is a second way to combine work, called **rebase**. Picture your feature as a few sticky notes stuck on a page of the project from last Tuesday. Meanwhile the page has moved on.

        Rebase **peels your notes off and re-sticks them on top of today’s page**. Your changes are replayed one by one as if you had started from the newest main all along. The result is a clean, straight line of history, with no merge commit.

        But note what happened: the replayed commits are **brand new copies** with new ids. The originals are gone. That is why rebase is said to **rewrite history**.`,
      note: '**Golden rule:** never rebase commits you have already shared with others. If their copies of the old commits still exist, your histories no longer match, and untangling it is miserable. Rebase your own private work; merge anything shared.' },

    { kind: 'compare', title: 'Merge vs rebase',
      body: 'Neither is "correct". Teams choose a style, and experts do argue about it.',
      cols: ['Merge', 'Rebase'],
      rows: [
        ['History shape', 'Branches and joins are visible', 'A single straight line'],
        ['Existing commits', 'Left exactly as they are', 'Replaced by new copies (new ids)'],
        ['Safe on shared work?', 'Yes', '**No**: do not rebase shared commits'],
        ['Good for', 'Joining finished work; keeping the true story', 'Tidying your own local branch before sharing it']
      ],
      note: 'In the lab that follows, you will commit, branch, merge and rebase on a live commit graph, and watch the labels and ids change.' },

    { kind: 'code', title: 'A merge conflict',
      body: `What if both branches changed the **same line**? Git cannot guess which you want, so it stops and asks. It marks the file with **conflict markers**. This is normal, not a disaster.`,
      code: { lang: 'js', src: `
        function shipping(order) {
        <<<<<<< HEAD
          return 4.99;
        =======
          return 5.50;
        >>>>>>> feature/login
        }`,
        notes: {
          2: 'Everything between here and the `=======` line is **your current branch’s** version (`HEAD` is where you are merging into).',
          4: 'The divider between the two versions.',
          6: 'And above this line is the **incoming branch’s** version. You decide what the final code should be: one side, the other, or a mix.'
        } } },

    { kind: 'steps', title: 'Resolving a conflict by hand',
      body: 'Conflicts feel scary the first time. The recipe never changes.',
      steps: [
        { title: 'Merge stops and tells you', body: '`git status` lists the files marked "both modified". Nothing is lost; the merge is just paused.' },
        { title: 'Open the file and read both sides', body: 'Talk to the teammate if it is not obvious which is right. Sometimes the answer is a bit of each.' },
        { title: 'Edit it into the final version', body: 'Write the code you actually want, and **delete all three marker lines** (`<<<<<<<`, `=======`, `>>>>>>>`).' },
        { title: 'Stage the fixed file', body: '`git add shipping.js` tells Git "this one is resolved".' },
        { title: 'Finish with a commit', body: '`git commit` creates the merge commit. Run the tests first; a conflict can hide a logic clash that Git cannot see.' }
      ] },

    { kind: 'pitfall', title: 'Detached HEAD: standing on no branch',
      body: `Normally HEAD points at a **branch**, and the branch points at a commit. If you check out a specific commit (say, to look at old code), HEAD points straight at the commit instead. Git calls that **detached HEAD**.

        Looking around is harmless. The trap: commits you make there belong to **no branch**. Switch away, and nothing points at them, so they become hard to find and can be cleaned up later.

        If you are in that state and want to keep the work, create a branch right there: \`git switch -c rescue\`. Now the work has a label again.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What does creating a new branch actually do in Git?',
      options: ['Creates a new label pointing at the current commit', 'Copies every file in the project into a new folder', 'Downloads a fresh copy of the repository', 'Locks the main branch so nobody else can change it'],
      answer: 0,
      why: [null, 'Git does not duplicate your files. A branch is just a pointer, which is why it is so cheap.', 'Nothing is downloaded. Everything is already in your local repository.', 'Other branches carry on exactly as before.'],
      explain: 'A branch is a movable label. Because making one costs almost nothing, Git users create branches freely for every task.' },

    { type: 'tf', after: 3, statement: 'A fast-forward merge always creates a new merge commit.', answer: false,
      explain: 'A fast-forward just moves the branch label forward, because there is nothing to combine: the target branch has not moved. A merge commit is only needed when both branches have new commits.' },

    { type: 'order', after: 8, prompt: 'Put the steps for resolving a merge conflict in order.',
      items: ['Git pauses the merge and marks the conflicted files', 'Open the file and read both versions', 'Edit it to the final code and delete the marker lines', 'Stage the file with `git add`', 'Finish with `git commit`'],
      explain: 'You cannot decide until you have read both sides, and you must remove the markers before staging, or you would commit them. The commit completes the merge.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Branch', 'A movable label pointing at a commit'], ['HEAD', 'Marks where you are now: the current branch or commit'], ['Fast-forward', 'Sliding a branch label forward, with no new commit'], ['Merge commit', 'A commit with two parents that joins two lines of work'], ['Rebase', 'Replaying commits on top of another branch, creating new copies']],
      explain: 'Everything in Git’s branching story is built from labels (branches and HEAD) and commits with parent links. The commands move labels or create commits.' },

    { type: 'ab', q: 'A teammate has already pulled your branch and started building on it. Which is the safe way to bring in the latest main?',
      a: { lang: 'sh', label: 'Replay yours on top', src: `
        $ git rebase main` },
      b: { lang: 'sh', label: 'Join them together', src: `
        $ git merge main` },
      answer: 'b',
      explain: 'Rebasing replaces your commits with new copies, which no longer match your teammate’s. Merging adds a new commit and leaves the shared commits untouched.' },

    { type: 'spot', prompt: 'Someone committed this file straight after a merge, and the build broke. Tap the marker line that opens the conflicting section.',
      code: { lang: 'js', src: `
        function shipping(order) {
        <<<<<<< HEAD
          return 4.99;
        =======
          return 5.50;
        >>>>>>> feature/login
        }` },
      lines: [2],
      explain: 'Line 2 starts the conflict markers, and lines 4 and 6 close it off. They are not code, and the file will not even parse. Always resolve the conflict, delete the markers and test before committing.' },

    { type: 'bucket', prompt: 'You run `git merge`. What happens in each situation?', buckets: ['Fast-forward', 'Merge commit', 'Conflict to resolve'],
      items: [['main has not moved since you branched', 0], ['Both branches added commits, in different files', 1], ['Both branches edited the same line of one file', 2], ['The target branch is a direct ancestor of yours', 0], ['Histories forked, and the changes do not overlap', 1], ['Git cannot tell which version of a line to keep', 2]],
      explain: 'If one branch is simply ahead, Git slides forward. If both moved but the edits do not overlap, Git joins them automatically with a merge commit. Only overlapping edits need a human.' },

    { type: 'scenario', title: 'The branching mishap', intro: 'Three small crises in one afternoon. Keep your history intact.',
      meters: { 'work saved': 70, 'team calm': 70 },
      steps: [
        { text: 'You checked out an old commit to look at some code, then absolutely made two new commits there. Git says `detached HEAD`. You want to keep that work.',
          choices: [
            { label: 'Create a branch right there with `git switch -c rescue`', score: 2, effects: { 'work saved': 25 }, feedback: 'Now the commits have a label pointing at them, so they are safe. This is the standard fix.' },
            { label: 'Switch back to main straight away and hope for the best', score: 0, effects: { 'work saved': -40 }, feedback: 'Nothing points at your two commits any more. They are not deleted immediately, but they are very easy to lose.' },
            { label: 'Ignore the warning and keep going', score: 1, effects: { 'work saved': -10 }, feedback: 'You can carry on, but every commit stays unlabelled. Sooner or later you will switch away and lose track.' }
          ] },
        { text: 'Back on a feature branch, you merge main in and Git reports a conflict in `shipping.js`.',
          choices: [
            { label: 'Open the file, read both sides, write the right result and delete the markers', score: 2, effects: { 'team calm': 15 }, feedback: 'Exactly. A conflict is Git asking a human to decide, and you are the human.' },
            { label: 'Keep only your side everywhere without reading the other', score: 0, effects: { 'work saved': -20, 'team calm': -20 }, feedback: 'You have silently overwritten a teammate’s change. It may well have been an important fix.' },
            { label: 'Abort the merge and ask the teammate to go through it with you', score: 1, effects: { 'team calm': 10 }, feedback: 'A perfectly sensible fallback when you are unsure: `git merge --abort` puts things back as they were. But try reading it first.' }
          ] },
        { text: 'Before sharing your private feature branch, you want a tidy straight history on top of the latest main. Nobody else has seen these commits yet.',
          choices: [
            { label: 'Rebase it onto main, since the commits are only yours', score: 2, effects: { 'team calm': 10 }, feedback: 'Rebasing private commits is safe, and gives reviewers a clean line to read.' },
            { label: 'Rebase it after teammates have already built on it', score: 0, effects: { 'team calm': -30, 'work saved': -10 }, feedback: 'Their copies of the old commits no longer match yours. Expect confusion and duplicate commits.' },
            { label: 'Never update from main at all', score: 1, effects: { 'team calm': -5 }, feedback: 'Safe but risky later: the longer you wait, the bigger and uglier the eventual conflicts.' }
          ] }
      ],
      outro: 'The pattern: **label your work, read before you resolve, and only rebase what is still private.**' },

    { type: 'explain', prompt: 'In your own words: why is it dangerous to rebase commits that other people already have?',
      model: 'Rebase replays commits as brand new copies with new ids, replacing the originals. If teammates already have the old commits, their history no longer matches yours, so merging produces duplicates and confusion. Rebase only private work, and merge anything shared.',
      keywords: ['rewrite', 'history', 'new', 'copies', 'shared', 'teammates', 'ids'] }
  ],

  flashcards: [
    { q: 'What is a Git branch?', a: 'A small movable label that points at one commit. Making a commit moves the current branch’s label forward.' },
    { q: 'What is HEAD?', a: 'Git’s "you are here" pointer. Normally it points at your current branch; when it points at a commit directly, that is a detached HEAD.' },
    { q: 'When does a merge fast-forward?', a: 'When the branch you are on has not moved since the other branch split off, so Git can just slide the label forward.' },
    { q: 'What does rebase do, and what is the rule?', a: 'It replays your commits on top of another branch as new copies, rewriting history. Never rebase commits that others already have.' },
    { q: 'How do you rescue commits made on a detached HEAD?', a: 'Create a branch at that point, for example with `git switch -c rescue`, so the commits have a label again.' }
  ],

  glossary: [
    { term: 'Branch', def: 'A named, movable pointer to a commit. It marks the tip of one line of work.', like: 'A bookmark that moves forward as you read.' },
    { term: 'HEAD', def: 'Git’s marker for where you currently are: usually the branch you have checked out.', like: 'The "you are here" dot on a map.' },
    { term: 'Fast-forward', def: 'A merge where the target branch just moves forward along the existing history, creating no new commit.', like: 'Sliding a bookmark further down the same road.' },
    { term: 'Merge commit', def: 'A commit with two parents, created to join two lines of work that have both moved on.', like: 'The junction where two roads rejoin.' },
    { term: 'Rebase', def: 'Replaying your commits on top of a different starting point, creating new commits and rewriting history.', like: 'Peeling off sticky notes and re-sticking them on the newest page.' },
    { term: 'Merge conflict', def: 'A situation where both branches changed the same lines, so Git needs a human to choose the final result.', like: 'Two editors rewriting the same sentence.' }
  ],

  takeaways: [
    'A **branch** is a movable label, not a copy. **HEAD** says where you are.',
    '**Fast-forward** slides a label. A **merge commit** joins two lines that both moved.',
    '**Rebase** replays commits as new ones. Do not rebase anything you have shared.',
    'Conflicts are Git asking a human: read both sides, fix, remove markers, `add`, `commit`.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('git-collab', {
  eli5: 'Teams keep a shared copy of the project on a server such as GitHub, send their changes there through reviewed proposals called pull requests, and use rules so that nothing broken reaches the main branch.',

  cards: [
    { kind: 'concept', title: 'Everyone has a full copy, so how do you share?',
      body: `Git is **distributed**: your laptop holds the entire project and its whole history, and so does your colleague’s. That is wonderful for working offline. But it raises a question: how do two full copies stay in step?

        The answer is a **remote**: another copy of the repository that lives on a server everyone can reach, usually on a hosting service like **GitHub** or **GitLab**. The remote’s default nickname is **origin**.

        By convention it is the team’s meeting point. You send your work **to** it and fetch your teammates’ work **from** it. Nobody edits it directly.` },

    { kind: 'diagram', title: 'Local copies around a shared remote',
      body: 'Each person works locally, then syncs through the remote. Git never needs the remote for everyday commits, branches and logs.',
      nodes: [
        { id: 'remote', label: 'origin (GitHub / GitLab)', icon: '☁️', x: 1, y: 0, tone: 'accent' },
        { id: 'you', label: 'Your laptop', icon: '💻', x: 0, y: 1, tone: 'good' },
        { id: 'mate', label: 'Teammate’s laptop', icon: '💻', x: 2, y: 1, tone: 'warn' }
      ],
      edges: [
        { from: 'you', to: 'remote', label: 'push / fetch', both: true },
        { from: 'mate', to: 'remote', label: 'push / fetch', both: true }
      ],
      caption: 'Your laptop and your teammate’s never talk directly. The remote is the shared noticeboard.' },

    { kind: 'code', title: 'clone, fetch, pull and push',
      body: 'The four commands for sharing. Tap the lines.',
      code: { lang: 'sh', src: `
        $ git clone https://example.com/acme/shop.git
        Cloning into 'shop'...
        $ git fetch
        From https://example.com/acme/shop.git
           3f2a9c1..a41b7e2  main       -> origin/main
        $ git pull
        Updating 3f2a9c1..a41b7e2
        Fast-forward
        $ git push origin feature/login
         * [new branch]      feature/login -> feature/login`,
        notes: {
          1: '`clone` makes your first full local copy of a remote repository, history and all.',
          3: '`fetch` **downloads** new commits from the remote, but does **not** touch your own branches or files. Safe to run any time.',
          5: 'It stored the remote’s `main` as `origin/main`: a read-only label for "where the remote’s main is".',
          6: '`pull` is **fetch + merge** in one go: download, then fold the new commits into the branch you are on.',
          9: '`push` uploads your branch’s commits to the remote, so others can see them.'
        } } },

    { kind: 'metaphor', title: 'A pull request is a proposed edit',
      body: `Imagine a shared recipe book for a restaurant. A cook doesn’t scribble straight onto the master copy. They write the change on a **separate sheet** and pass it to the head chef with a note: "I think this needs less salt. Can you check?"

        The chef reads it, asks questions, and when happy, glues it into the book.

        That sheet is a **pull request** (called a **merge request** on GitLab, the same idea). You push a branch, then ask: "please pull my changes into main." The team can read the exact diff, comment on lines, and approve it before it joins the main line.` },

    { kind: 'sequence', title: 'The life of a pull request',
      body: 'Step through a typical change, from idea to merged.',
      actors: ['Developer', 'GitHub / GitLab', 'Reviewer', 'CI checks'],
      steps: [
        { from: 0, to: 1, label: 'push feature branch', note: 'You created a branch locally and pushed it.' },
        { from: 0, to: 1, label: 'open pull request', note: 'You add a clear title and a short description: what changed, and why.' },
        { from: 1, to: 3, label: 'run the checks', note: '**CI** (continuous integration): automated tests, linting and a build run on your proposed change.' },
        { from: 3, to: 1, label: 'green tick / red cross', dashed: true, note: 'The result appears right on the pull request.' },
        { from: 2, to: 1, label: 'comments on lines', note: 'The reviewer reads the diff and asks for changes. Reviews catch bugs, share knowledge and keep style consistent.' },
        { from: 0, to: 1, label: 'push fixes', note: 'New commits join the same pull request. The checks run again.' },
        { from: 2, to: 1, label: 'approve', note: 'Reviewer and checks are happy.' },
        { at: 1, label: 'merge into main', note: 'The branch is merged. Your change is now part of the shared line.' }
      ] },

    { kind: 'diagram', title: 'Forks: when you cannot push to the repo',
      body: 'On an open-source project you usually have no permission to push to the original repository. So you make a **fork**: your own copy of it, stored on the hosting service under your account.',
      nodes: [
        { id: 'up', label: 'Original repo (upstream)', icon: '🏠', x: 1, y: 0, tone: 'accent' },
        { id: 'fork', label: 'Your fork (on the host)', icon: '🍴', x: 1, y: 1, tone: 'warn' },
        { id: 'local', label: 'Your laptop', icon: '💻', x: 1, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'up', to: 'fork', label: 'fork' },
        { from: 'local', to: 'fork', label: 'clone, push', both: true },
        { from: 'fork', to: 'up', label: 'pull request', dashed: true }
      ],
      caption: 'You push to **your** fork, then ask the owners to pull your changes in. They stay in control of the original.' },

    { kind: 'compare', title: 'Trunk-based development vs Git Flow',
      body: 'Teams need a shared routine for branches. Two well-known styles sit at opposite ends. Experts argue about which is better, and plenty of teams land somewhere in the middle.',
      cols: ['Trunk-based', 'Git Flow'],
      rows: [
        ['Branches', 'Very short-lived: hours or a day or two, then merged into `main` (the "trunk")', 'Long-running `develop` and `release` branches, plus feature and hotfix branches'],
        ['Unfinished work', 'Merged early but hidden behind **feature flags** (off switches)', 'Stays on its feature branch until finished'],
        ['Releases', '`main` is kept releasable; ship often', 'Planned release branches get stabilised first'],
        ['Suits', 'Teams that deploy often and have strong automated tests', 'Products with scheduled, versioned releases, several versions live']
      ],
      note: 'The common failure mode is long-lived branches: the longer a branch lives, the more painful the merge back. Trunk-based development is largely a way of avoiding that.' },

    { kind: 'layers', title: 'Protected branches: gates before main',
      body: 'On a healthy team nobody pushes straight to `main`. The hosting service can enforce that with **branch protection** rules. A change must pass every gate, from top to bottom.',
      layers: [
        { label: 'Open a pull request', note: 'Direct pushes to `main` are blocked, so every change goes through a PR.', tone: 'accent', icon: '📝' },
        { label: 'Required CI checks pass', note: 'Tests, linting and the build must be green before the merge button works.', tone: 'warn', icon: '🤖' },
        { label: 'Required review approved', note: 'At least one (or more) teammates must sign off.', tone: 'info', icon: '👀' },
        { label: 'Merged into main', note: 'Only now does the change join the shared line.', tone: 'good', icon: '✅' }
      ] },

    { kind: 'pitfall', title: 'Rejected pushes and force pushes',
      body: `Sometimes \`git push\` fails with "**rejected**: the remote contains work that you do not have locally". Someone pushed before you. The fix is calm: **fetch or pull first**, deal with any conflict, then push again.

        Git also offers \`git push --force\`, which overwrites the remote branch with yours **whatever is there**. On a shared branch, that can erase teammates’ commits. It is the push-time version of "do not rewrite shared history", and it is the reason protected branches usually block it.

        Force-pushing your own private feature branch after a rebase is common, and fine. Force-pushing \`main\` is how people ruin Fridays.` },

    { kind: 'tip', title: 'Small pull requests, kind reviews',
      body: `A pull request that changes two hundred lines gets read carefully. One that changes four thousand gets skimmed, approved and regretted.

        - **Keep them small and focused**: one idea per PR.
        - **Explain the why** in the description, not just the what.
        - As a reviewer, **critique the code, not the person**. Ask questions ("what happens if this is empty?") instead of issuing verdicts.
        - As the author, **do not take comments personally**. A review is the team protecting the codebase, and you.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What does `git pull` actually do?',
      options: ['Fetches new commits from the remote, then merges them into your current branch', 'Uploads all of your local commits to the remote repository', 'Downloads commits without changing any of your own branches', 'Creates a brand-new local copy of a remote repository'],
      answer: 0,
      why: [null, 'That is `git push`.', 'That is `git fetch`. `pull` goes one step further and merges.', 'That is `git clone`.'],
      explain: '`pull` is `fetch` plus `merge`. If you want to look at what changed before combining it with your work, run `fetch` on its own first.' },

    { type: 'order', after: 4, prompt: 'Put the life of a pull request in order.',
      items: ['Push your branch to the remote', 'Open a pull request describing the change', 'CI checks run and teammates review', 'Push fixes for any comments or failures', 'Approve and merge into main'],
      explain: 'The branch has to exist on the remote before you can propose it. Checks and review come before the merge, and fixes go into the same pull request until everyone is satisfied.' },

    { type: 'match', prompt: 'Match each command or idea to what it does.',
      pairs: [['git clone', 'Make a first full local copy of a remote'], ['git fetch', 'Download new commits without merging them'], ['git push', 'Upload your commits to the remote'], ['Fork', 'Your own copy of someone else’s repo on the host'], ['Pull request', 'A proposal to merge your branch, with review']],
      explain: 'Three commands move commits between machines (`clone`, `fetch`/`pull`, `push`). Forks and pull requests are about permission and review.' },

    { type: 'tf', after: 7, statement: 'With branch protection switched on, any developer can still push straight to main if they are in a hurry.', answer: false,
      explain: 'Protection means the rules apply to everyone: direct pushes are blocked, and the change must come through a pull request with its required checks and approvals.' },

    { type: 'bucket', prompt: 'Which workflow does each description fit?', buckets: ['Trunk-based development', 'Git Flow'],
      items: [['Branches live for hours or a day or two', 0], ['A long-running `develop` branch collects finished features', 1], ['Unfinished work is hidden behind feature flags', 0], ['A hotfix branch is cut from the production release', 1], ['`main` is kept releasable at all times', 0], ['Planned release branches are stabilised before shipping', 1]],
      explain: 'Trunk-based is about frequent small merges into one line. Git Flow is about structured, longer-lived branches for scheduled releases. Neither is right for every team.' },

    { type: 'spot', prompt: 'A new teammate runs these commands to ship a tiny fix. Tap the dangerous one.',
      code: { lang: 'sh', src: `
        $ git switch main
        $ git pull
        $ git commit -am "Fix typo in footer"
        $ git push --force origin main` },
      lines: [4],
      explain: 'Forcing the push overwrites whatever is on the remote `main`, including any commits that teammates pushed in the meantime. Plain `git push` would be refused if you were behind, which is the helpful warning. Better still, use a branch and a pull request.' },

    { type: 'ab', q: 'Which pull request will get the better review?',
      a: { lang: 'text', label: 'Pull request one', src: `
        Reject empty carts at checkout
        Why: empty orders reached payments.
        What: check items before charging.
        Tested: new unit test, plus manual.
        Size: 1 file, 40 lines.` },
      b: { lang: 'text', label: 'Pull request two', src: `
        Update stuff
        (no description)
        Size: 38 files, 4,100 lines.` },
      answer: 'a',
      explain: 'A small, focused PR with a title and a reason can be reviewed properly in minutes. A huge one with no description will be skimmed, and bugs will walk through.' },

    { type: 'scenario', title: 'Your first week on the team', intro: 'You have just joined a team that uses GitHub, pull requests, required checks and a protected `main` branch. Ship your first change.',
      meters: { 'team trust': 50, 'main stays safe': 80 },
      steps: [
        { text: 'You have cloned the repo and need to fix a typo in the footer. Where do you make the change?',
          choices: [
            { label: 'On a new branch, then open a pull request', score: 2, effects: { 'team trust': 15 }, feedback: 'That is the normal route. Even a tiny change gets the same safety net, and the protected branch would not accept anything else anyway.' },
            { label: 'Directly on `main`, since it is only a typo', score: 0, effects: { 'team trust': -10, 'main stays safe': -20 }, feedback: 'Branch protection will probably reject it, and on an unprotected branch you would skip review for a change you cannot be sure is harmless.' },
            { label: 'Fork the company’s own repo into a personal account', score: 1, effects: { 'team trust': -5 }, feedback: 'Forks suit outsiders who cannot push to the repo. As a team member, a branch in the shared repo is simpler.' }
          ] },
        { text: 'You open the pull request. A required CI check fails with a red cross, because of a test unrelated to your typo.',
          choices: [
            { label: 'Read the failure, fix it or ask the team, and push to the same branch', score: 2, effects: { 'main stays safe': 10, 'team trust': 10 }, feedback: 'Checks are there to be listened to. Pushing a fix reruns them on the same PR.' },
            { label: 'Ask an admin to bypass the check so you can merge', score: 0, effects: { 'main stays safe': -25, 'team trust': -15 }, feedback: 'Bypassing the gate defeats its purpose, and teaches the team that failing checks are optional.' },
            { label: 'Close the pull request and open a new one hoping it passes', score: 1, effects: { 'team trust': -5 }, feedback: 'The failure will come back, and you have lost your PR’s history. Look at the cause instead.' }
          ] },
        { text: 'A reviewer comments: "Could we also fix the same typo in the header?" It is a one-line change.',
          choices: [
            { label: 'Make the change, push it, and reply that it is done', score: 2, effects: { 'team trust': 15 }, feedback: 'Reviews are collaboration. A quick follow-up commit on the same branch keeps everything in one place.' },
            { label: 'Argue that it is out of scope and refuse', score: 0, effects: { 'team trust': -20 }, feedback: 'Sometimes pushing back on scope is right, but for a one-line obvious fix it just burns goodwill.' },
            { label: 'Force-push over `main` to include it fast', score: 0, effects: { 'main stays safe': -30, 'team trust': -25 }, feedback: 'That is exactly what protection exists to stop. It would also erase other people’s work.' }
          ] }
      ],
      outro: 'The pattern: **branch, open a pull request, listen to the checks, take review as help, and never go around the gates.**' },

    { type: 'explain', prompt: 'In your own words: what are protected branches and required checks for, and why do teams bother?',
      model: 'A protected branch cannot be pushed to directly, so every change to main goes through a pull request. Required CI checks and approvals must pass before the merge button works. This stops broken or unreviewed code reaching the main line, and it applies to everyone, however senior.',
      keywords: ['protected', 'pull request', 'checks', 'review', 'main', 'broken', 'everyone'] }
  ],

  flashcards: [
    { q: 'What is a remote, and what is "origin"?', a: 'A remote is a copy of the repository on a server that the team shares. `origin` is the default name for the one you cloned from.' },
    { q: 'What is the difference between fetch and pull?', a: '`fetch` downloads new commits without changing your branches. `pull` is fetch followed by a merge into your current branch.' },
    { q: 'What is a pull request?', a: 'A proposal to merge one branch into another, with the diff open for comments, automated checks and approval. GitLab calls it a merge request.' },
    { q: 'Trunk-based development in one sentence?', a: 'Everyone merges small, short-lived branches into one main branch often, hiding unfinished work behind feature flags.' },
    { q: 'What does a protected branch enforce?', a: 'No direct pushes: changes must arrive by pull request, with the required checks passing and reviews approved.' }
  ],

  glossary: [
    { term: 'Remote', def: 'A copy of a repository hosted elsewhere, usually on GitHub or GitLab. The default one is called `origin`.', like: 'The shared noticeboard everyone syncs with.', aka: ['origin'] },
    { term: 'Pull request', def: 'A request to merge a branch into another, shown as a page where the team reviews the diff, discusses it and runs checks. GitLab calls it a merge request.', like: 'A proposed edit handed to the head chef.', aka: ['PR', 'merge request'] },
    { term: 'Fork', def: 'Your own copy of someone else’s repository, stored on the hosting service, used to propose changes without write access.', like: 'Photocopying a recipe book to scribble improvements on.' },
    { term: 'Trunk-based development', def: 'A workflow where everyone merges small, short-lived branches into one main branch frequently.', like: 'Everyone feeding into one river instead of digging many canals.' },
    { term: 'Git Flow', def: 'A branching model with long-lived develop and release branches plus feature and hotfix branches, aimed at scheduled releases.', like: 'A railway timetable with set platforms.' },
    { term: 'Protected branch', def: 'A branch with rules enforced by the host: no direct pushes, required reviews and required passing checks.', like: 'A locked door with a checklist on it.' }
  ],

  takeaways: [
    'A **remote** (`origin`) is the shared copy. **push** uploads, **fetch** downloads, **pull** = fetch + merge.',
    'A **pull request** is a reviewed proposal to merge a branch. **Forks** are for projects you cannot push to.',
    '**Trunk-based** means small, frequent merges. **Git Flow** means structured, longer-lived branches.',
    '**Protected branches** and **required checks** keep broken code out of main, for everyone.'
  ],

  links: [
    { label: 'Pro Git (free online book)', url: 'https://git-scm.com/book' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('languages-git', {
  title: 'The Merge Conflict Minotaur',
  intro: 'Deep in the labyrinth of repositories lives a beast made of both sides of every disputed line. To get out, you must choose languages wisely and handle Git without losing a single commit.',
  questions: [
    { type: 'mcq', q: 'A Node.js API is fast and responsive, until one endpoint starts a long, heavy calculation. What happens to the other requests?',
      options: ['They wait, because the single thread running JavaScript is busy', 'They carry on normally, because each request has its own thread', 'They are handled by goroutines scheduled automatically', 'They are rejected by the compiler before they can run'],
      answer: 0,
      why: [null, 'Node runs your JavaScript on one thread, so there is no spare thread to take over.', 'Goroutines belong to Go, not Node.js.', 'Compilers do not see requests. This is a runtime effect.'],
      explain: 'The event loop is brilliant while waiting on I/O but a CPU-heavy calculation blocks the one thread everyone shares.' },

    { type: 'multi', q: 'Which of these languages are statically typed and compiled (to bytecode or machine code) before they run?',
      options: ['Java', 'Go', 'Rust', 'Python', 'Ruby'],
      answers: [0, 1, 2],
      explain: 'Java compiles to JVM bytecode; Go and Rust compile to native binaries. Python and Ruby are dynamically typed and interpreted (Python quietly makes bytecode, but does not check types up front).' },

    { type: 'match', prompt: 'Match each language to the idea it is best known for.',
      pairs: [['Go', 'Goroutines, channels and a single static binary'], ['Rust', 'Ownership and borrowing, with no garbage collector'], ['PHP', 'Runs per request by default, starting fresh each time'], ['Ruby on Rails', 'Convention over configuration'], ['Java', 'Compiled to bytecode and run on the JVM']],
      explain: 'Each has a signature feature. Knowing them lets you place a language quickly when someone proposes it.' },

    { type: 'bucket', prompt: 'Is the language mostly statically or dynamically typed?', buckets: ['Static typing', 'Dynamic typing'],
      items: [['Python', 1], ['Ruby', 1], ['PHP', 1], ['Java', 0], ['Go', 0], ['Rust', 0], ['TypeScript', 0], ['JavaScript', 1]],
      explain: 'TypeScript adds static types to JavaScript, which is why the two land in different buckets. (Python and PHP allow optional type hints, but their defaults are dynamic.)' },

    { type: 'mcq', q: 'Your team of five all know Python well, and the project is a normal web API that mostly waits on a database. Which choice is most sensible?',
      options: ['Python: the team’s skill and the ecosystem matter most here', 'Rust, because it won a speed test on a toy problem', 'Whatever language is most talked about this month', 'Java, because every serious company must use it'],
      answer: 0,
      why: [null, 'A toy benchmark says little about a database-bound app, and your team would be learning from scratch.', 'Hype is a poor basis for something you will maintain for years.', 'Java is a fine choice for some teams, but not a rule. Your team knows Python.'],
      explain: 'Team skills, ecosystem and the nature of the job beat micro-benchmarks. A web API that waits on a database is not usually limited by language speed.' },

    { type: 'order', prompt: 'Put a typical team change in order, from clone to merge.',
      items: ['Clone the repository', 'Create a feature branch', 'Edit files, then stage and commit them', 'Push the branch and open a pull request', 'Pass the checks and review, then merge'],
      explain: 'You need a copy before you can branch, and commits before you can push anything worth proposing. Checks and review come last, right before the merge.' },

    { type: 'tf', statement: '`git revert` deletes the bad commit from history, so it is as if it never happened.', answer: false,
      explain: 'Revert adds a **new** commit that undoes the old one, leaving the history intact. That is why it is the safe choice for shared work. `reset --hard` is the one that can erase commits.' },

    { type: 'spot', prompt: 'This sequence loses work. Tap the line that does it.',
      code: { lang: 'sh', src: `
        $ git switch -c fix/rounding
        $ git add cart.js
        $ git commit -m "Round cart totals"
        $ git reset --hard origin/main` },
      lines: [4],
      explain: 'Hard-resetting to `origin/main` moves your branch back and throws away the commit you just made (and any uncommitted edits). It is the dangerous undo, and it is rarely what you want here.' },

    { type: 'ab', q: 'You and a teammate both pushed commits to the same feature branch. Which way of bringing in the latest main is safe?',
      a: { lang: 'sh', label: 'Merge', src: `
        $ git merge main` },
      b: { lang: 'sh', label: 'Rebase and force push', src: `
        $ git rebase main
        $ git push --force` },
      answer: 'a',
      explain: 'Rebasing creates new copies of the commits and a force push overwrites the shared branch, which can destroy your teammate’s work. Merging leaves the shared commits alone.' },

    { type: 'short', q: 'Which Git command downloads new commits from the remote without merging them into your branch?', accept: ['git fetch', 'fetch'], hint: 'pull is this plus a merge.',
      explain: '`fetch` only updates your copy of the remote’s branches (like `origin/main`). `pull` runs `fetch` and then merges.' },

    { type: 'cloze', text: 'A branch is just a movable {{label}} pointing at a {{commit}}, and {{HEAD}} says where you are now.',
      distractors: ['folder', 'file', 'remote'],
      explain: 'Branches are cheap precisely because they are only pointers. Moving between them swaps which commit your files match.' },

    { type: 'mcq', q: 'You checked out an old commit, made two commits there and Git says "detached HEAD". How do you keep that work safely?',
      options: ['Create a branch there: `git switch -c rescue`', 'Switch to main immediately and carry on', 'Run `git reset --hard` to tidy up the mess', 'Delete the repository and clone it again'],
      answer: 0,
      why: [null, 'Nothing would point at your commits, so they become hard to find.', 'That would move things and could discard the very commits you want.', 'A fresh clone would not contain commits that were never on a branch you pushed.'],
      explain: 'A branch is just a label. Putting one on your detached commits means they are reachable again.' }
  ]
});

KS.sheet('languages-git', {
  title: 'Languages & Version Control: cheat sheet',
  sections: [
    { title: 'Four lenses for any language',
      md: `| Lens | The question |
        |---|---|
        | How it runs | Native binary, bytecode on a VM, or interpreted? |
        | Typing | Checked before running (static) or while running (dynamic)? |
        | Concurrency | Event loop, OS threads or lightweight tasks? |
        | Ecosystem | Libraries, frameworks, tools, people to hire? |

        Most backend work is **I/O-bound** (waiting), so raw speed is rarely the deciding factor. Prefer **boring technology** and your team’s skills.` },

    { title: 'The languages at a glance',
      md: `| Language | Runs as | Known for |
        |---|---|---|
        | JavaScript / TypeScript | Node.js (event loop) | Same language as the browser; Express |
        | Python | Interpreter (GIL) | Readability, data, Django / Flask / FastAPI |
        | Ruby | Interpreter | Rails, developer happiness |
        | PHP | Per request | Laravel, huge share of websites |
        | Java, Kotlin, Scala | JVM | Large business systems; Spring Boot |
        | C# | .NET | ASP.NET Core, business software |
        | Go | Single static binary | Goroutines, channels |
        | Rust | Native, no GC | Ownership and borrowing; Actix / Axum |` },

    { title: 'Everyday Git',
      md: `| Command | Does |
        |---|---|
        | \`git status\` | What changed, what is staged |
        | \`git add <file>\` | Stage a change |
        | \`git commit -m "…"\` | Save staged changes as a commit |
        | \`git log --oneline\` | History, newest first |
        | \`git diff\` | Unstaged changes (\`--staged\` for the basket) |

        Flow: **working tree → staging area → repository**. Keep commits small, with a message that says *why*. Never commit secrets: use \`.gitignore\`.` },

    { title: 'Undoing things',
      md: `| Command | Use for | Safe? |
        |---|---|---|
        | \`git restore <file>\` | Discard uncommitted edits to a file | Edits are lost |
        | \`git revert <commit>\` | Undo a commit by adding a new one | **Safe**, even if shared |
        | \`git reset --hard\` | Move back and wipe local work | **Dangerous** |

        Lost commits on a detached HEAD? Put a branch on them: \`git switch -c rescue\`.` },

    { title: 'Branches, merges and rebase',
      md: `- **Branch** = movable label on a commit. **HEAD** = where you are.
        - \`git switch -c name\` creates and moves; \`git switch name\` moves.
        - **Fast-forward**: the label slides, no new commit. **Merge commit**: two parents, joins forked work.
        - **Rebase**: replays commits as new copies, giving a straight history. **Never rebase shared commits.**
        - **Conflict**: read both sides, edit, delete \`<<<<<<<\`, \`=======\`, \`>>>>>>>\`, then \`git add\` and \`git commit\`.` },

    { title: 'Working with a team',
      md: `| Command / idea | Means |
        |---|---|
        | \`git clone\` | First full copy of a remote |
        | \`git fetch\` | Download, do not merge |
        | \`git pull\` | Fetch + merge |
        | \`git push\` | Upload your commits |
        | Pull / merge request | Reviewed proposal to merge |
        | Fork | Your own copy of a repo you cannot push to |

        **Trunk-based**: tiny, short-lived branches, feature flags. **Git Flow**: develop, release and hotfix branches. **Protected branch**: no direct pushes; required CI checks and approvals. Avoid \`push --force\` on shared branches.` }
  ]
});
