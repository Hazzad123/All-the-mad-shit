/* Module: paradigms — Programming Paradigms.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs paradigms */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('pp-what', {
  eli5: 'A programming paradigm is a style of thinking about code: some styles tell the computer every step, some describe the result you want, and each one bans a few risky habits.',

  cards: [
    { kind: 'concept', title: 'Same job, different mindsets',
      body: `Ask three developers to total up this month’s paid orders and you may get three quite different programs. They all work. The difference is not the language and not the answer. It is the **way of thinking** each one started from.

        One thinks *"do these steps in this order"*. Another thinks *"describe what I want and let something else do the looping"*. A third thinks *"there are little objects, and they send each other messages"*.

        Those habits of thought have a name: **programming paradigms**. A paradigm is a style of building programs: a set of ideas about what a program is made of, and what you are allowed to do.` },

    { kind: 'metaphor', title: 'A recipe versus a restaurant order',
      body: `A **recipe** says: *boil the water, add the pasta, wait nine minutes, drain.* You control every step, and if you skip one, dinner is ruined.

        An **order** at a restaurant says: *a margherita, please.* You describe **what** you want. The kitchen decides **how**.

        The recipe is the **imperative** way of thinking: spell out the steps. The order is the **declarative** way: state the result and let something else work out the steps.

        Where the metaphor stops: the kitchen still follows a recipe somewhere. Declarative code always sits on top of imperative machinery that somebody wrote.` },

    { kind: 'code', title: 'Imperative: spell out every step',
      body: 'Total the paid orders. Tap the highlighted lines to see what you are managing by hand.',
      code: { lang: 'js', src: `
        const orders = [
          { id: 1, total: 40, paid: true },
          { id: 2, total: 25, paid: false },
          { id: 3, total: 10, paid: true }
        ];

        let revenue = 0;
        for (let i = 0; i < orders.length; i++) {
          if (orders[i].paid) {
            revenue += orders[i].total;
          }
        }`,
        notes: {
          7: 'A variable that you **change** as the program runs. This hidden moving part is called *state*.',
          8: 'You manage the counter \`i\` yourself: where to start, when to stop, how to step.',
          9: 'You decide, order by order, whether it counts.',
          10: 'You update the running total yourself. Forget this line and the answer is silently wrong.'
        } } },

    { kind: 'code', title: 'Declarative: describe the result',
      body: `Same answer. This time the code says *what* is wanted: keep the paid orders, then add up their totals. The looping happens somewhere else.

        SQL works the same way: \`SELECT SUM(total) FROM orders WHERE paid = true\` never says how to loop.`,
      code: { lang: 'js', src: `
        const revenue = orders
          .filter(order => order.paid)
          .reduce((sum, order) => sum + order.total, 0);`,
        notes: {
          2: '**Keep** only the paid orders. No counter, no \`if\`.',
          3: '**Combine** the totals into one number, starting from 0. Do not worry about \`reduce\` yet; lesson 3 unpicks it.'
        } } },

    { kind: 'compare', title: 'Imperative versus declarative',
      body: 'Neither is "better". They put the effort in different places.',
      cols: ['Imperative', 'Declarative'],
      rows: [
        ['You write', 'The steps, in order', 'The result you want'],
        ['Who loops?', 'You do', 'The library, language or database'],
        ['Moving parts', 'Counters and running totals you update', 'Few or none visible'],
        ['Reads like', 'A recipe', 'A restaurant order'],
        ['Typical examples', 'Loops, C, shell scripts', 'SQL, HTML, CSS, `map` and `filter`'],
        ['Risk', 'Mistakes in the bookkeeping', 'Not knowing what happens underneath']
      ] },

    { kind: 'concept', title: 'Every paradigm takes something away',
      body: `Here is an idea from Robert C. Martin’s book *Clean Architecture*, and it is a surprise: the big paradigms did not give programmers new powers. Each one **removed** a freedom.

        - **Structured programming** took away the unrestricted \`goto\` jump.
        - **Object-oriented programming** put discipline on *indirect* jumps: code that decides at run time which function to call.
        - **Functional programming** put discipline on *assignment*: once a value is set, it does not change.

        Why would you give up freedoms on purpose? Because each one was a favourite way to write bugs. The next five lessons visit these in turn.` },

    { kind: 'diagram', title: 'What each paradigm gives up, and gets',
      body: 'Read each column from top to bottom.',
      nodes: [
        { id: 'free', label: 'Programmer, no limits', icon: '🧑‍💻', x: 1, y: 0, tone: 'muted' },
        { id: 'st', label: 'Structured', x: 0, y: 1, tone: 'accent' },
        { id: 'oo', label: 'Object-oriented', x: 1, y: 1, tone: 'accent' },
        { id: 'fp', label: 'Functional', x: 2, y: 1, tone: 'accent' },
        { id: 'st2', label: 'No wild goto', x: 0, y: 2, tone: 'bad' },
        { id: 'oo2', label: 'Tamed indirect calls', x: 1, y: 2, tone: 'bad' },
        { id: 'fp2', label: 'No reassigning values', x: 2, y: 2, tone: 'bad' },
        { id: 'st3', label: 'Code you can follow', x: 0, y: 3, tone: 'good' },
        { id: 'oo3', label: 'Safe plug-in parts', x: 1, y: 3, tone: 'good' },
        { id: 'fp3', label: 'Fewer surprise changes', x: 2, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'free', to: 'st' }, { from: 'free', to: 'oo' }, { from: 'free', to: 'fp' },
        { from: 'st', to: 'st2', label: 'removes' }, { from: 'oo', to: 'oo2', label: 'restricts' }, { from: 'fp', to: 'fp2', label: 'restricts' },
        { from: 'st2', to: 'st3', label: 'gives' }, { from: 'oo2', to: 'oo3', label: 'gives' }, { from: 'fp2', to: 'fp3', label: 'gives' }
      ],
      caption: 'Red: the freedom surrendered. Green: what you get in return.' },

    { kind: 'realworld', title: 'Most languages are multi-paradigm',
      body: `Languages rarely force one style on you. **JavaScript** and **Python** let you write loops, classes and \`map\`-style pipelines in the same file. **Java** and **C#** began firmly object-oriented, then added lambdas and stream-style operations. **SQL** is declarative from top to bottom.

        So a paradigm is not a language feature you either have or lack. It is a **habit you choose**, and the language either helps or gets in the way.

        A few languages push one style hard (Haskell for functional, C for imperative). Most working backend code is a blend, which is why the last lesson of this module is about mixing.` },

    { kind: 'pitfall', title: 'A paradigm is a tool, not a team',
      body: `Beginners often pick a side: *"I am a functional programmer"*, *"OOP is dead"*. Experienced people mostly roll their eyes.

        Each paradigm is good at certain problems and awkward at others. Money maths suits pure functions. A shopping basket that changes over time suits an object. A stream of button clicks suits yet another style.

        Experts do genuinely disagree about how far to push each one. The safe habit is to learn what each style **removes** and **offers**, then pick per problem, not per tribe.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Which sentence describes the problem in a declarative way?',
      options: ['Give me the names of all customers in Leeds', 'Start at the first customer, check the city, and add matches to a list', 'Repeat for each customer: if the city is Leeds, remember them', 'Make a counter, then walk the customers one by one'],
      answer: 0,
      why: [null, 'This spells out the walking and checking: the steps are the point.', 'Still a loop with a rule inside. You are directing the process.', 'Counters and walking are all "how", with no "what" in sight.'],
      explain: 'A declarative description names the result and leaves out the procedure. The other three each hand over a recipe.' },

    { type: 'tf', after: 7, statement: 'A language can only follow one programming paradigm.', answer: false,
      explain: 'Paradigms are styles, not locks. JavaScript, Python, Java and C# all let you mix imperative loops, objects and functional pipelines in one program.' },

    { type: 'cloze', code: true, text: `const total = orders
  .{{filter}}(o => o.paid)
  .{{reduce}}((sum, o) => sum + o.total, 0);`,
      distractors: ['forEach', 'push', 'sort'],
      explain: '`filter` keeps the paid orders, and `reduce` folds their totals into one number. Neither exposes a counter or a loop.' },

    { type: 'match', prompt: 'Match each paradigm to what it restricts or how it works.',
      pairs: [
        ['Structured programming', 'Takes away the unrestricted goto jump'],
        ['Object-oriented programming', 'Disciplines indirect calls, via polymorphism'],
        ['Functional programming', 'Disciplines assignment: values stay as they are'],
        ['Declarative style', 'States what you want, not the steps to get it'],
        ['Imperative style', 'Lists the steps and updates state as it goes']
      ] },

    { type: 'bucket', prompt: 'Imperative (spell out the steps) or declarative (describe the result)?', buckets: ['Imperative', 'Declarative'],
      items: [
        ['`for (let i = 0; i < n; i++) { total += prices[i]; }`', 0],
        ['`SELECT name FROM users WHERE age > 30`', 1],
        ['`h1 { color: red; }` in CSS', 1],
        ['`let count = 0; count = count + 1;`', 0],
        ['`prices.filter(p => p > 10)`', 1],
        ['A shell script: copy files, then rename them, then upload', 0]
      ],
      explain: 'SQL, CSS and `filter` say what is wanted. Counters, assignments and ordered scripts say how to do it. Real code is often a mixture, line by line.' },

    { type: 'ab', q: 'Which version states *what* is wanted, rather than *how* to build it?',
      a: { lang: 'js', label: 'Version one', src: `
        const names = users.map(u => u.name);` },
      b: { lang: 'js', label: 'Version two', src: `
        const names = [];
        for (let i = 0; i < users.length; i++) {
          names.push(users[i].name);
        }` },
      answer: 'a',
      explain: 'The `map` line says "turn each user into a name". The loop version builds an empty list, manages an index and pushes into the list by hand. Both give the same result.' },

    { type: 'multi', q: 'Which of these statements about paradigms are true?',
      options: ['A paradigm is a style of thinking about code, not a single language feature', 'Each major paradigm works by removing or restricting a freedom', 'Declarative code needs no imperative code underneath it to run', 'Many everyday languages support several paradigms at once', 'You must choose one paradigm per project and stay with it'],
      answers: [0, 1, 3],
      explain: 'Paradigms are styles, they come with limits, and languages mix them freely. Declarative code still runs on imperative machinery, and nothing forces one style per project.' },

    { type: 'explain', prompt: 'In your own words: what is the difference between imperative and declarative code? Use the paid-orders total as your example.',
      model: 'Imperative code spells out how to get the answer: make a running total, loop through the orders, and add the total if the order is paid. Declarative code says what is wanted: the sum of the totals of the paid orders (for example with filter then reduce, or a SQL SUM). In the declarative version the looping is done by something else, so there are fewer moving parts to get wrong.',
      keywords: ['steps', 'how', 'what', 'loop', 'result', 'state'] }
  ],

  flashcards: [
    { q: 'What is a programming paradigm?', a: 'A style or way of thinking about building programs, with its own ideas about what a program is made of and what you may do.' },
    { q: 'Imperative versus declarative in one line each?', a: 'Imperative: say how, step by step. Declarative: say what result you want and let something else work out the steps.' },
    { q: 'What did structured programming take away?', a: 'The unrestricted `goto` jump, which let control leap anywhere in a program.' },
    { q: 'What does functional programming put discipline on?', a: 'Assignment: values are not reassigned, which removes a big source of surprise changes.' },
    { q: 'What is a multi-paradigm language?', a: 'One that supports several styles, such as JavaScript or Python allowing loops, objects and functional pipelines side by side.' }
  ],

  glossary: [
    { term: 'Programming paradigm', def: 'A style of thinking about and organising programs, including what the style encourages and what it forbids.', like: 'Cooking styles: baking by exact recipe, or improvising from what is in the fridge.' },
    { term: 'Imperative programming', def: 'Writing code as a list of steps that change state as they run: do this, then this, then that.', like: 'A recipe.' },
    { term: 'Declarative programming', def: 'Describing the result you want and leaving it to the language, library or database to work out the steps.', like: 'Ordering a meal from a menu.' },
    { term: 'Multi-paradigm language', def: 'A language that supports more than one style, so a single program can mix them.', like: 'A kitchen with both an oven and a hob.' }
  ],

  takeaways: [
    'A paradigm is a **way of thinking**, not a language feature.',
    'Imperative says **how**; declarative says **what**.',
    'Each major paradigm **removes** a freedom: goto, unmanaged indirect calls, reassignment.',
    'Most real languages are multi-paradigm, so choose a style per problem.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('pp-structured', {
  eli5: 'Structured programming says a program only needs three ideas: do things in order, choose between options, and repeat. Banning wild jumps made code far easier to follow.',

  cards: [
    { kind: 'code', title: 'Try to follow this program',
      body: `Early programming languages let any line say *"jump to line 90"*. That jump is called a \`goto\`. Here is a tiny price-adding program in that old style. Tap the jumps and try to work out what runs when.`,
      code: { lang: 'text', src: `
        10 LET total = 0
        20 LET i = 1
        30 IF i > n THEN GOTO 90
        40 IF price(i) < 0 THEN GOTO 70
        50 LET total = total + price(i)
        60 REM fall through
        70 LET i = i + 1
        80 GOTO 30
        90 PRINT total`,
        notes: {
          3: 'A jump **forwards**: when the list is finished, leap to line 90.',
          4: 'Another jump forwards: skip negative prices. But note where it lands: in the middle of the loop.',
          8: 'A jump **backwards**, to repeat. This is the only thing that makes it a loop, and nothing on the page says so.'
        } } },

    { kind: 'metaphor', title: 'The choose-your-own-adventure book',
      body: `Remember those books that say *"If you open the door, turn to page 112. If you run away, turn to page 47"*?

        They are great fun and awful to **proofread**. To understand page 112 you must find every page that sends the reader there. Did they arrive with the key? Without it? You cannot tell from the page itself.

        A \`goto\` program is that book. A **structured** program is a normal book, or a recipe: read from the top, and when it says *"repeat until golden"*, it tells you exactly where the repeating starts and stops.` },

    { kind: 'history', title: 'The letter that started a revolution',
      body: `In the 1960s, programs were growing and breaking. Two things happened.

        In **1966**, Corrado Böhm and Giuseppe Jacopini proved a theorem: any program you can write with jumps can also be written using just three building blocks, with no \`goto\` at all.

        In **1968**, the Dutch computer scientist Edsger Dijkstra published a short letter titled *"Go To Statement Considered Harmful"*. His point: the more jumps a program has, the harder it is to know what state the program is in at any given line.

        The first said it was *possible*. The second said it was *worth it*. Programmers came round over the following years, and the **structured programming** movement was born.` },

    { kind: 'code', title: 'The three building blocks',
      body: 'Every structured program is made from these three shapes, nested inside each other.',
      code: { lang: 'js', src: `
        const subtotal = price * quantity;      // sequence
        const tax = subtotal * 0.2;

        if (customer.isMember) {                // selection
          discount = subtotal * 0.1;
        } else {
          discount = 0;
        }

        for (const item of cart) {              // iteration
          weight += item.weight;
        }`,
        notes: {
          1: '**Sequence**: do one thing, then the next, top to bottom.',
          4: '**Selection**: choose one path or another based on a condition (\`if\`, \`else\`, \`switch\`).',
          10: '**Iteration**: repeat a block while there is more to do (\`for\`, \`while\`).'
        } },
      note: 'Each block has one way in (the top) and one way out (the bottom). That is the whole trick.' },

    { kind: 'code', title: 'The same job, without goto',
      body: 'Here is the price-adding program again, in structured form. It does the same job as the jumping one.',
      code: { lang: 'js', src: `
        function sumPrices(prices) {
          let total = 0;
          for (const price of prices) {
            if (price >= 0) {
              total += price;
            }
          }
          return total;
        }`,
        notes: {
          3: 'The loop announces itself, and its body is indented. You can see where it starts and ends.',
          4: 'The "skip negative prices" rule is now a plain \`if\` that wraps the line it controls.',
          8: 'One clear exit at the bottom. Nothing leaps in or out of the middle.'
        } } },

    { kind: 'diagram', title: 'The loop as a picture',
      body: 'Follow the arrows. Everything fits the three shapes: steps in a sequence, a choice, and a loop that repeats.',
      nodes: [
        { id: 'read', label: 'Take next price', x: 1, y: 0 },
        { id: 'test', label: 'Price valid?', x: 1, y: 1, tone: 'warn' },
        { id: 'add', label: 'Add to total', x: 0, y: 2 },
        { id: 'more', label: 'More prices?', x: 2, y: 2, tone: 'warn' },
        { id: 'done', label: 'Return total', x: 2, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'read', to: 'test' },
        { from: 'test', to: 'add', label: 'yes' },
        { from: 'test', to: 'more', label: 'no' },
        { from: 'add', to: 'more' },
        { from: 'more', to: 'read', label: 'yes, repeat', dashed: true },
        { from: 'more', to: 'done', label: 'no' }
      ],
      caption: 'One diamond for selection, one for iteration, and a straight line for sequence.' },

    { kind: 'concept', title: 'Blocks and functions: boxes with one door',
      body: `Structured programming gives you two ways to chop code into pieces you can trust.

        A **block** is a few lines grouped together, like the body of an \`if\` or a loop. A **function** is a named block you can use again.

        Both have one entrance and one exit. So you can read a function **in isolation**: whatever happens inside, control comes back to the line after the call.

        That is why this was a revolution. Programmers could finally reason about a small piece without holding the whole program in their heads. Code review, testing and teamwork all got easier, because pieces had edges.` },

    { kind: 'pitfall', title: 'Early return: is it a goto in disguise?',
      body: `Some strict teachers once taught "one exit per function". Nowadays that rule is mostly dropped, and experts still debate it a little.

        A **guard clause** like \`if (!order) return;\` jumps, but only to a place you can always name: the end of **this** function. Reading the function top to bottom still works.

        The harm Dijkstra described came from jumps that could land *anywhere*. A clean early exit is not that.

        A decent test: can a reader still say, at any line, what has definitely happened by now? If yes, you are structured.` },

    { kind: 'realworld', title: 'You use it every day, and goto lives on',
      body: `Every language you have met, from JavaScript to Python, is built on sequence, selection and iteration. You never think about it because it won.

        \`goto\` has not vanished entirely. **C** and **Go** still include it. C code, famously the Linux kernel, uses it for one narrow job: jumping to the cleanup code when something fails halfway through. JavaScript has no \`goto\`, but does allow labelled \`break\` and \`continue\`, which are tamer cousins. Python has neither.

        Even where it exists, it is the exception you have to justify, not the default.` }
  ],

  activities: [
    { type: 'tf', after: 2, statement: 'Böhm and Jacopini showed that real programs cannot be written without goto.', answer: false,
      explain: 'They proved the opposite: sequence, selection and iteration are enough to express any program. Dijkstra then argued that dropping `goto` was worth doing.' },

    { type: 'bucket', after: 3, prompt: 'Which building block is each of these?', buckets: ['Sequence', 'Selection', 'Iteration'],
      items: [
        ['`for (const item of cart) { … }`', 2],
        ['`if (stock > 0) { sell(); }`', 1],
        ['`const tax = net * 0.2; const gross = net + tax;`', 0],
        ['`while (queue.length > 0) { handle(queue.pop()); }`', 2],
        ['`switch (status) { case "paid": … }`', 1],
        ['`validate(order); save(order); email(order);`', 0]
      ],
      explain: 'Sequence runs lines in order, selection chooses a path, iteration repeats. Real functions nest all three: loops hold choices, choices hold sequences.' },

    { type: 'mcq', after: 6, q: 'Why did banning wild goto jumps make programs easier to understand?',
      options: ['Each block had one way in and one way out, so you could read it top to bottom', 'Programs without goto always ran faster', 'Computers could no longer run programs that contained jumps', 'Structured programs were always shorter than the old ones'],
      answer: 0,
      why: [null, 'Speed was not the point. The gain was in human understanding.', 'Computers still jump constantly at the machine level. Only the programmer’s tools changed.', 'Length is not the point. Structured code can even be longer.'],
      explain: 'With a single entrance and exit, you can reason about a block on its own and trust that control returns to the next line. That local reasoning is what scaled to bigger programs.' },

    { type: 'multi', q: 'Which of these were real problems with unrestricted goto?',
      options: ['To understand a line you had to find every jump that could land on it', 'You often could not tell which lines had already run before this one', 'It was hard to cut code into independent pieces, since anything could jump into anything', 'Compilers refused to build any program that used it', 'Loops could not be written at all without it'],
      answers: [0, 1, 2],
      explain: 'The trouble was the tangle: lines reached from anywhere, unclear state, and no clean edges. Compilers happily accepted goto, and loops can be written with `for` and `while`.' },

    { type: 'cloze', text: 'Böhm and Jacopini showed that every program can be built from {{sequence}}, {{selection}} and {{iteration}}, with no {{goto}} needed.',
      distractors: ['inheritance', 'recursion', 'polymorphism'],
      explain: 'Those three blocks are the whole toolkit of structured programming: do in order, choose, repeat.' },

    { type: 'spot', prompt: 'This loop is meant to add up the prices, but the program hangs forever. Tap a line that causes it.',
      code: { lang: 'js', src: `
        function sumPrices(prices) {
          let total = 0;
          let i = 0;
          while (i < prices.length) {
            total += prices[i];
          }
          return total;
        }` },
      lines: [4, 5],
      explain: 'Nothing ever changes `i`, so the condition on line 4 stays true and line 5 repeats for ever. A `for...of` loop would manage the stepping for you, which is part of why structured loops are safer.' },

    { type: 'order', prompt: 'Run `sumPrices([5, -2, 3])` with the structured version from the lesson. Put the events in the order they happen.',
      items: ['`total` starts at 0', '5 is valid, so `total` becomes 5', '-2 fails the check and is skipped', '3 is valid, so `total` becomes 8', 'The loop ends and 8 is returned'],
      explain: 'Structured code can be traced like this: the loop visits each price in turn, the `if` decides, and the single `return` fires only after the loop has finished.' },

    { type: 'explain', prompt: 'Explain to a friend why removing goto counts as a "quiet revolution" even though it took a feature away.',
      model: 'Unrestricted goto let control jump anywhere, so to understand a line you had to know every jump that might reach it. Structured programming restricted code to sequence, selection and iteration, each with one entrance and one exit. That meant you could read and test a block on its own. Losing a feature made programs easier to reason about, which let them grow larger and be built by teams.',
      keywords: ['goto', 'jump', 'one entrance', 'block', 'reason', 'sequence', 'selection', 'iteration'] }
  ],

  flashcards: [
    { q: 'What are the three building blocks of structured programming?', a: 'Sequence (do in order), selection (choose a path) and iteration (repeat).' },
    { q: 'What is a goto?', a: 'An instruction that jumps straight to another line of the program, so control can leap anywhere.' },
    { q: 'What did Dijkstra’s 1968 letter argue?', a: 'That unrestricted goto statements are harmful: the more jumps, the harder it is to know the state of the program at a given line.' },
    { q: 'What did Böhm and Jacopini prove?', a: 'That any program can be written using only sequence, selection and iteration, with no goto.' },
    { q: 'Why is an early return in a function usually acceptable?', a: 'It jumps only to the end of the current function, a place you can always name, so the code still reads top to bottom.' }
  ],

  glossary: [
    { term: 'Structured programming', def: 'Building programs from sequence, selection and iteration, with blocks and functions that have one entrance and one exit, instead of arbitrary jumps.', like: 'A recipe rather than a choose-your-own-adventure book.' },
    { term: 'goto', def: 'A statement that jumps directly to another labelled line of code. Unrestricted use makes programs hard to trace.', like: '"Turn to page 112."' },
    { term: 'Spaghetti code', def: 'Code whose flow of control is so tangled, typically from many jumps, that nobody can follow it.', like: 'A bowl of pasta: pull one strand and no one knows where it ends.' },
    { term: 'Iteration', def: 'Repeating a block of code, for example once for every item in a list, using a loop such as `for` or `while`.', like: 'Stirring until the sauce thickens.' }
  ],

  takeaways: [
    'Any program can be built from **sequence, selection and iteration**.',
    'Unrestricted `goto` made code impossible to follow; structured code has **one way in, one way out**.',
    'Functions and blocks let you reason about a small piece alone.',
    'Early returns are fine: they jump somewhere you can always name.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('pp-functional-basics', {
  eli5: 'In functional programming, a function is just another value you can hand around, and data is never edited in place: you make a changed copy instead, so nothing changes behind your back.',

  cards: [
    { kind: 'story', title: 'The basket that changed behind your back',
      body: `A shop’s checkout code sorts the cart by price to print a tidy receipt. Later, the page that shows "items in the order you added them" starts showing them sorted too. Nobody wrote code to do that.

        What happened: both parts of the program held the **same array**. The receipt code sorted it **in place**, so the other part saw the change. Two pieces of code shared one piece of changing data, which is called **shared mutable state**.

        **Functional programming** is a style built to avoid exactly this. It rests on two ideas: functions are **values** you can pass around, and data is **never edited in place**. This lesson covers both.` },

    { kind: 'metaphor', title: 'Instruction cards',
      body: `Picture a bakery helper who can follow any instruction card you hand them. One card says *"ice every cake"*. Another says *"box every cake"*. The helper does not care what the card says: they just apply it to each cake on the tray.

        The **card** is a function. Handing the card over, instead of doing the job yourself, is what it means to treat a function as a value.

        And for the data: a good helper never scribbles on your original order form. They photocopy it and mark up the copy. That is **immutability**: you keep the original, and make a changed version alongside.` },

    { kind: 'code', title: 'Functions are values',
      body: 'In JavaScript a function can sit in a variable, go into another function as an argument, and come back out as a result. The jargon is **first-class functions**.',
      code: { lang: 'js', src: `
        const withVat = price => price * 1.2;

        function applyToAll(prices, fn) {
          const out = [];
          for (const p of prices) out.push(fn(p));
          return out;
        }

        applyToAll([10, 20], withVat);   // [12, 24]`,
        notes: {
          1: 'A function stored in a variable, just like a number or a string.',
          3: 'This function takes **another function** as an argument. A function that takes or returns functions is a **higher-order function**.',
          5: 'It calls whatever function it was given. It does not know or care that this one adds VAT.',
          9: 'We pass \`withVat\` by name, with no brackets. Brackets would *call* it now; no brackets hands the card over.'
        } } },

    { kind: 'code', title: 'Map, filter and reduce',
      body: 'You will meet `applyToAll` in every language under the name **map**. It has two close relatives. Together they cover most loops you will ever write.',
      code: { lang: 'js', src: `
        const prices = [10, 25, 40];

        prices.map(p => p * 2)                   // [20, 50, 80]
        prices.filter(p => p > 20)               // [25, 40]
        prices.reduce((sum, p) => sum + p, 0)    // 75`,
        notes: {
          3: '**map**: transform every item. Three in, three out.',
          4: '**filter**: keep the items that pass a yes/no test.',
          5: '**reduce**: fold the whole list into one value. It starts at \`0\` and, for each price, adds it to the running \`sum\`.'
        } },
      note: 'None of the three changes `prices`. Each returns a **new** value and leaves the original alone.' },

    { kind: 'compare', title: 'Three tools, three jobs',
      body: 'Ask two questions: what goes in the function, and what comes out of the whole call?',
      cols: ['map', 'filter', 'reduce'],
      rows: [
        ['It does', 'Transforms each item', 'Keeps items that pass a test', 'Folds all items into one value'],
        ['Result size', 'Same as the input', 'Same or smaller', 'A single value'],
        ['Your function returns', 'A new item', 'true or false', 'The updated running result'],
        ['Example', 'Prices to prices with VAT', 'Orders to paid orders', 'Orders to total revenue']
      ] },

    { kind: 'diagram', title: 'A data pipeline',
      body: 'Because each tool returns a new list, you can chain them. Data flows down like items on a conveyor belt, and each stage does one small job.',
      nodes: [
        { id: 'all', label: 'All orders', icon: '🧾', x: 1, y: 0 },
        { id: 'paid', label: 'filter: paid only', x: 1, y: 1, tone: 'accent' },
        { id: 'tot', label: 'map: take the total', x: 1, y: 2, tone: 'accent' },
        { id: 'sum', label: 'reduce: add up', x: 1, y: 3, tone: 'accent' },
        { id: 'res', label: 'Revenue', icon: '💷', x: 1, y: 4, tone: 'good' }
      ],
      edges: [
        { from: 'all', to: 'paid', label: 'list' },
        { from: 'paid', to: 'tot', label: 'shorter list' },
        { from: 'tot', to: 'sum', label: 'list of numbers' },
        { from: 'sum', to: 'res', label: 'one number' }
      ],
      caption: 'Read it as: "paid orders, their totals, summed." That is the declarative style from lesson one.' },

    { kind: 'code', title: 'Immutability: copy, do not edit',
      body: 'An **immutable** value is never changed after it is made. To "change" it, you build a new one. Compare two ways to add an item to a cart.',
      code: { lang: 'js', src: `
        // Mutating: changes the caller's own array
        function addItemMutating(cart, item) {
          cart.push(item);
          return cart;
        }

        // Not mutating: returns a fresh array
        function addItem(cart, item) {
          return [...cart, item];
        }`,
        notes: {
          3: '\`push\` edits the array that was passed in. Whoever else holds that cart now sees a different cart.',
          9: '\`[...cart, item]\` means "a new array with everything from \`cart\`, then \`item\`". The original is untouched, so nobody is surprised.'
        } } },

    { kind: 'pitfall', title: 'The sneaky mutators',
      body: `Some everyday array methods change the array **in place**, including \`sort\`, \`reverse\`, \`push\`, \`pop\` and \`splice\`. That is how the receipt code in our opening story went wrong.

        The cure is to copy first: \`[...items].sort(byPrice)\` sorts a copy and leaves the original alone.

        Also, \`const\` is **not** immutability. \`const cart = []\` only stops you pointing \`cart\` at a different array. You can still push into it.

        Do not panic about performance: copying a small list is cheap. Worry about it only when measurement says you must.` },

    { kind: 'realworld', title: 'Where you will see this',
      body: `Data pipelines of \`map\`, \`filter\` and \`reduce\` fill everyday backend code: shaping an API response, cleaning a list of users, totalling a basket. Java’s streams and Python’s list comprehensions are the same idea in other clothes.

        Frontend libraries such as React ask you to update state by building a **new** object, not editing the old one, partly so changes are easy to detect.

        In the previous module you met **pure functions**. This lesson’s style is built from them: a function that only reads its inputs and returns a result is trivially safe to pass around and chain.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What does it mean to say functions are "first-class" in a language?',
      options: ['They can be stored in variables, passed as arguments and returned like any other value', 'They always run before the other code in a file', 'They can only be called once per program', 'They are faster than methods on a class'],
      answer: 0,
      why: [null, 'Order of execution has nothing to do with it.', 'A first-class function can be called as often as you like.', 'Speed is unrelated. First-class describes what you may *do* with a function.'],
      explain: 'First-class means functions are ordinary values. That is what lets `map` accept a function, and what makes higher-order functions possible.' },

    { type: 'tf', after: 4, statement: 'Calling `map` on an array of five items always gives back an array of five items.', answer: true,
      explain: '`map` transforms each item one-to-one, so the length never changes. `filter` can shorten a list, and `reduce` collapses it to one value.' },

    { type: 'spot', after: 7, prompt: 'The receipt page prints cheapest-first, but the order history page is now sorted too. Tap the culprit.',
      code: { lang: 'js', src: `
        function cheapestFirst(products) {
          return products.sort((a, b) => a.price - b.price);
        }
        const receiptLines = cheapestFirst(cart.items);` },
      lines: [2],
      explain: '`sort` reorders the array it is called on, which here is the caller’s own `cart.items`. Sorting a copy with `[...products].sort(...)` fixes it.' },

    { type: 'bucket', prompt: 'Which tool does each job: map, filter or reduce?', buckets: ['map', 'filter', 'reduce'],
      items: [
        ['Add VAT to every price', 0],
        ['Keep only users over 18', 1],
        ['Find the biggest order total', 2],
        ['Turn a list of users into a list of email addresses', 0],
        ['Drop products that are out of stock', 1],
        ['Add up the weights of every parcel', 2]
      ],
      explain: 'Ask what comes out. Same number of items, each changed: `map`. Fewer items, same shape: `filter`. One single value: `reduce`.' },

    { type: 'cloze', code: true, text: `const emails = users
  .{{filter}}(u => u.active)
  .{{map}}(u => u.email);`,
      distractors: ['reduce', 'push', 'sort'],
      explain: 'First keep only the active users (`filter`), then turn each remaining user into their email (`map`). Order matters: mapping first would lose the `active` flag.' },

    { type: 'ab', q: 'Which version leaves the original `items` array alone?',
      a: { lang: 'js', label: 'Version one', src: `
        const sorted = items.sort(byPrice);` },
      b: { lang: 'js', label: 'Version two', src: `
        const sorted = [...items].sort(byPrice);` },
      answer: 'b',
      explain: 'The spread copies the array first, so `sort` rearranges the copy. Without it, `sorted` and `items` are the same array, and sorting one sorts the other.' },

    { type: 'mcq', q: 'What does this code produce?',
      code: { lang: 'js', src: `
        [1, 2, 3, 4]
          .filter(n => n % 2 === 0)
          .map(n => n * 10)` },
      options: ['[20, 40]', '[2, 4]', '[10, 20, 30, 40]', '[20, 40, 60, 80]'],
      answer: 0,
      why: [null, 'That is only the `filter` step. The `map` then multiplies by 10.', 'That multiplies everything but ignores the `filter`.', 'That would be mapping all four items and ignoring the filter.'],
      explain: '`filter` keeps the even numbers, 2 and 4. `map` then multiplies each by 10, giving 20 and 40.' },

    { type: 'multi', q: 'Which of these change (mutate) the array they are called on?',
      options: ['`cart.push(item)`', '`const next = [...cart, item]`', '`items.sort(byPrice)`', '`items.map(addVat)`', '`items.reverse()`'],
      answers: [0, 2, 4],
      explain: '`push`, `sort` and `reverse` rearrange the original in place. The spread and `map` both build a new array and leave the original untouched.' }
  ],

  flashcards: [
    { q: 'What is a higher-order function?', a: 'A function that takes another function as an argument, returns a function, or both. `map` and `filter` are examples.' },
    { q: 'What do map, filter and reduce each return?', a: 'map: a list of the same length with each item transformed. filter: a list of just the items that pass a test. reduce: a single combined value.' },
    { q: 'What is immutability?', a: 'Never changing a value after it is created. To change something you build a new copy instead.' },
    { q: 'Why is shared mutable state risky?', a: 'Two parts of a program hold the same changing data, so one can alter it and surprise the other.' },
    { q: 'Does `const` make an array immutable?', a: 'No. It only stops you reassigning the variable. You can still push into or sort the array.' }
  ],

  glossary: [
    { term: 'First-class function', def: 'A function treated as an ordinary value: it can be stored in a variable, passed to another function, or returned from one.', like: 'An instruction card you can hand to someone.' },
    { term: 'Higher-order function', def: 'A function that takes functions as arguments, returns a function, or both.', like: 'A helper who follows whichever card you give them.', aka: ['HOF'] },
    { term: 'Immutability', def: 'Data that is never modified after creation. Changes are made by creating a new copy.', like: 'Marking up a photocopy, never the original.' },
    { term: 'Shared mutable state', def: 'Data that several parts of a program can read and change. A change by one part can surprise the others.', like: 'A shared whiteboard anyone can rub out.' },
    { term: 'Reduce', def: 'Combines all items in a list into one value by applying a function to a running result and each item in turn.', like: 'Rolling snowballs together into one big snowball.', aka: ['fold'] }
  ],

  takeaways: [
    'Functions are **values**: pass them in, return them out.',
    '`map` transforms, `filter` keeps, `reduce` combines, and each returns a **new** value.',
    'Chain them into declarative data pipelines.',
    'Copy instead of editing in place, and watch for mutators like `sort` and `push`.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('pp-functional-composition', {
  eli5: 'Small functions can remember things, be snapped together in a chain, be pre-filled with some of their inputs, or call themselves on a smaller problem. Together these let you build big behaviour from tiny parts.',

  cards: [
    { kind: 'concept', title: 'A function that remembers',
      body: `A shop runs promotions: 10% off this week, 50% off in the sale. You could write \`tenPercentOff\`, then \`fiftyPercentOff\`, then a function for every percentage under the sun.

        Or you could write **one function that builds discount functions**. Hand it a percentage and it gives you back a new function with that percentage baked in.

        For that to work, the new function must remember the percentage even after the function that created it has finished. That memory is called a **closure**. It is one of the most useful ideas in everyday JavaScript, and it follows from functions being values.` },

    { kind: 'code', title: 'A closure in action',
      body: 'Tap the highlighted lines to see what is remembered, and by whom.',
      code: { lang: 'js', src: `
        function makeDiscount(percent) {
          return price => price - (price * percent) / 100;
        }

        const tenOff = makeDiscount(10);
        const halfPrice = makeDiscount(50);

        tenOff(100);      // 90
        halfPrice(100);   // 50`,
        notes: {
          2: 'The inner function uses \`percent\`, which belongs to the *outer* function. It keeps hold of it.',
          5: '\`makeDiscount\` has finished here, yet \`tenOff\` still knows its \`percent\` was 10.',
          6: 'A separate call gives a separate, independent \`percent\`: 50. The two discounts never interfere.'
        } } },

    { kind: 'metaphor', title: 'The packed backpack',
      body: `A closure is a function carrying a **backpack**. When the function is created, it stuffs into the backpack every outside variable it uses. Wherever the function travels afterwards, the backpack goes too.

        \`tenOff\` carries a backpack containing \`percent = 10\`. \`halfPrice\` carries a different one containing \`50\`.

        Where the metaphor stops: the backpack holds the actual variable, not a snapshot. If the variable is later changed by code that can reach it, the function sees the new value. Closures can therefore hide changing state too, so use them for fixed settings when you can.` },

    { kind: 'code', title: 'Composition: snap functions together',
      body: 'If each small function takes one thing and returns one thing, you can line them up. Feed the output of one into the next, like a pipe.',
      code: { lang: 'js', src: `
        const pipe = (...fns) => x => fns.reduce((v, fn) => fn(v), x);

        const trim = s => s.trim();
        const lower = s => s.toLowerCase();
        const clean = pipe(trim, lower);

        clean('  Ann@Shop.COM ');   // 'ann@shop.com'`,
        notes: {
          1: '\`pipe\` takes any number of functions and returns a new one. It uses \`reduce\` from last lesson to feed a value through them in turn.',
          5: 'A brand new function, built purely by combining two others. Nothing was copied or rewritten.',
          7: 'Spaces trimmed first, then lowercased. The mirror-image helper, usually called \`compose\`, runs right to left instead.'
        } } },

    { kind: 'steps', title: 'Following a value through the pipe',
      body: 'Watch what happens to the text when you call `clean`.',
      steps: [
        { title: 'Start with the raw input', body: '`"  Ann@Shop.COM "`, with stray spaces and capital letters from a sloppy sign-up form.' },
        { title: 'First function: trim', body: 'Spaces removed from the ends: `"Ann@Shop.COM"`.' },
        { title: 'Second function: lower', body: 'It receives the trimmed text and lowercases it: `"ann@shop.com"`.' },
        { title: 'Out comes the result', body: 'Each function saw only its own input and output. Adding a third stage later means adding one name to the list.' }
      ] },

    { kind: 'code', title: 'Currying and partial application',
      body: `Closures give you another trick. **Currying** rewrites a function that takes two arguments into one that takes them one at a time. **Partial application** is giving some arguments now and the rest later.`,
      code: { lang: 'js', src: `
        const multiply = rate => price => price * rate;

        const withVat = multiply(1.2);
        const inPence = multiply(100);

        withVat(50);              // 60
        [10, 20].map(withVat);    // [12, 24]`,
        notes: {
          1: 'Curried: first you supply \`rate\`, and you get back a function waiting for \`price\`.',
          3: 'Partial application: the \`rate\` is now fixed, and we have a ready-made tool.',
          7: 'Pre-filled functions slot straight into \`map\`, which wants a function taking one argument.'
        } },
      note: 'JavaScript can also pre-fill arguments with `fn.bind(null, a)`. Functional libraries often provide a `curry` helper.' },

    { kind: 'code', title: 'Recursion: a function that calls itself',
      body: 'Without loops, functional code often repeats work by having a function call itself on a smaller problem. Here, adding up a list.',
      code: { lang: 'js', src: `
        function sum(list) {
          if (list.length === 0) return 0;
          return list[0] + sum(list.slice(1));
        }

        sum([4, 5, 6]);   // 15`,
        notes: {
          2: 'The **base case**: the smallest problem, answered directly. Without it, the function would never stop.',
          3: 'The **recursive step**: first item plus the sum of the rest. The rest is a smaller list, so we move towards the base case.'
        } },
      note: 'Recursion earns its keep on nested data: folder trees, comment threads, category menus, JSON documents.' },

    { kind: 'pitfall', title: 'Forgetting to stop',
      body: `A recursive function with no base case, or one that never reaches it, keeps calling itself until the language gives up. In JavaScript you will see a **"Maximum call stack size exceeded"** error.

        Each call waits for the next one, and the language can only keep so many waiting.

        So when you write recursion, ask two questions: *what is the smallest case I answer directly?* and *does every call get closer to it?*

        For flat lists, a plain \`reduce\` or loop is usually clearer. Save recursion for problems that are naturally nested.` },

    { kind: 'realworld', title: 'Functional ideas in everyday backend code',
      body: `You have probably already used these without the labels.

        - **Middleware chains**: frameworks such as Express run a request through a list of functions (log, check login, parse body) before your handler. That is composition.
        - **Handler factories**: \`makeHandler(db)\` returns a route function that remembers its database connection. That is a closure.
        - **Wrappers**: \`withRetry(fn)\` returns a function that tries \`fn\` again on failure. That is a higher-order function.
        - **Tree walking**: totalling a nested category menu, or validating nested JSON. That is recursion.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'After `makeDiscount(10)` has returned, how can `tenOff` still apply a 10% discount?',
      options: ['The returned function keeps access to `percent` through a closure', 'The value 10 is copied into a global variable', 'JavaScript runs `makeDiscount` again every time', 'It cannot: `percent` is deleted when the outer function ends'],
      answer: 0,
      why: [null, 'Nothing global is created. The variable stays tied to the inner function.', 'The outer function ran once. Calling `tenOff` only runs the inner function.', 'Variables that an inner function still uses are kept alive.'],
      explain: 'A closure is a function plus the outside variables it uses. Those variables stay alive for as long as the function does.' },

    { type: 'cloze', code: true, after: 3, text: `function makeAdder(n) {
  return x => x + {{n}};
}
const addTen = makeAdder({{10}});
addTen(5);   // 15`,
      distractors: ['x', '5', 'fn'],
      explain: 'The inner function adds the remembered `n` to its own input `x`. Calling `makeAdder(10)` fixes `n` at 10, so `addTen(5)` gives 15.' },

    { type: 'tf', after: 5, statement: 'Currying and partial application are exactly the same thing.', answer: false,
      explain: 'Currying is a transformation: a two-argument function becomes a chain of one-argument functions. Partial application is supplying some arguments early to get a smaller function. They work together, but they are not identical.' },

    { type: 'order', prompt: 'Put the calls in the order they finish when you run `sum([1, 2])`.',
      items: ['`sum([])` hits the base case and returns 0', '`sum([2])` returns 2 + 0 = 2', '`sum([1, 2])` returns 1 + 2 = 3'],
      explain: 'The calls pile up first (`sum([1, 2])` waits on `sum([2])`, which waits on `sum([])`). They then finish in reverse, innermost first.' },

    { type: 'ab', q: 'Which version is easiest to read in the order the steps actually happen?',
      a: { lang: 'js', label: 'Nested calls', src: `
        const total = round(addVat(applyDiscount(price)));` },
      b: { lang: 'js', label: 'A pipe', src: `
        const total = pipe(applyDiscount, addVat, round)(price);` },
      answer: 'b',
      explain: 'Nested calls run from the inside out, so you read them backwards. A pipe lists the stages in the order they run: discount, then VAT, then round.' },

    { type: 'spot', prompt: 'This `sum` works for [1, 2, 3] but crashes on an empty list. Tap the faulty line.',
      code: { lang: 'js', src: `
        function sum(list) {
          if (list.length === 1) return list[0];
          return list[0] + sum(list.slice(1));
        }` },
      lines: [2],
      explain: 'The base case only triggers for a list of exactly one item. For `[]`, `slice(1)` is still `[]`, so the function never reaches its base case and runs until the call stack overflows. The base case should be an empty list.' },

    { type: 'bucket', prompt: 'Which idea does each real-world example use?', buckets: ['Closure', 'Composition', 'Recursion', 'Partial application'],
      items: [
        ['A route handler built by `makeHandler(db)` that remembers its database', 0],
        ['Middleware: log, then check login, then run the handler', 1],
        ['Counting products in a menu of categories inside categories', 2],
        ['`const withVat = multiply(1.2)`', 3],
        ['A retry wrapper that remembers its maximum attempts', 0],
        ['Cleaning input: trim, then lowercase, then validate', 1],
        ['Walking a folder tree to find every `.json` file', 2]
      ],
      explain: 'A function remembering outside values is a closure. Chaining stages is composition. A function calling itself on a smaller piece is recursion. Pre-filling some arguments is partial application.' },

    { type: 'explain', prompt: 'Explain what a closure is and why `makeDiscount(10)` is a good example of one.',
      model: 'A closure is a function together with the outside variables it uses. When makeDiscount(10) returns its inner function, that function keeps the value of percent, 10, even though makeDiscount has finished. Each call to makeDiscount creates a separate function with its own remembered percent, so tenOff and halfPrice do not interfere.',
      keywords: ['closure', 'remember', 'outer', 'variable', 'inner', 'function', 'percent'] }
  ],

  flashcards: [
    { q: 'What is a closure?', a: 'A function bundled with the outside variables it uses, so it still has them after the function that created it has finished.' },
    { q: 'What does `pipe(f, g)` do?', a: 'Builds a function that runs `f` on the input, then `g` on that result. Composition in the order the steps happen.' },
    { q: 'Currying versus partial application?', a: 'Currying turns a multi-argument function into one-argument steps. Partial application supplies some arguments now to get a function that waits for the rest.' },
    { q: 'What two things does every recursive function need?', a: 'A base case that is answered directly, and a recursive step that moves towards the base case.' },
    { q: 'Name two functional ideas in everyday backend code.', a: 'Middleware chains (composition) and handler factories like `makeHandler(db)` (closures). Retry wrappers are higher-order functions.' }
  ],

  glossary: [
    { term: 'Closure', def: 'A function together with the outside variables it refers to, kept alive for as long as the function exists.', like: 'A function carrying a backpack of the variables it needs.' },
    { term: 'Function composition', def: 'Combining small functions so that the output of one becomes the input of the next, forming a new function.', like: 'Pipes joined end to end.', aka: ['pipeline'] },
    { term: 'Currying', def: 'Turning a function that takes several arguments into a chain of functions that each take one.', like: 'Answering a form one question at a time.' },
    { term: 'Partial application', def: 'Supplying some of a function’s arguments early to produce a new function that waits for the rest.', like: 'A stamp card already stamped three times.' },
    { term: 'Recursion', def: 'A function solving a problem by calling itself on a smaller version of it, until it reaches a base case it can answer directly.', like: 'Russian dolls: open one to find a smaller one, until you reach the last.' },
    { term: 'Base case', def: 'The simplest input a recursive function answers directly, so the chain of calls stops.', like: 'The smallest doll that does not open.' }
  ],

  takeaways: [
    'A **closure** is a function that remembers the variables it was made with.',
    '**Composition** snaps small functions into a pipeline, in the order the steps happen.',
    '**Partial application** pre-fills arguments to make ready-to-use tools.',
    '**Recursion** needs a base case and steady progress towards it; use it for nested data.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('pp-oop-intro', {
  eli5: 'Object-oriented programming packs some data and the actions that use it into one little unit, called an object, and gets objects to cooperate by asking each other to do things.',

  cards: [
    { kind: 'concept', title: 'Data and the rules for it, kept apart',
      body: `Imagine a shop’s code with a loose list called \`basketItems\`, and, somewhere else, functions \`addToBasket(basketItems, item)\` and \`basketTotal(basketItems)\`. Now the shop needs a second basket, then a wish list. Soon you have parallel variables and functions scattered about, and any of them can reach in and fiddle with the list.

        **Object-oriented programming** (OOP) offers a different grouping: put the data and the functions that work on it **together**, in a unit called an **object**.

        A real basket holds things *and* can tell you its total. An object does the same.` },

    { kind: 'metaphor', title: 'The vending machine',
      body: `A vending machine has **stuff inside** (stock and money) and **buttons outside** (choose, pay, collect). You never reach in and rearrange the crisps. You press a button, and the machine does it, following its own rules.

        An object is a small machine like that: private **state** inside, a set of **buttons** (called *methods*) on the front.

        Many machines can exist side by side, each with its own stock. And they can work together: the machine asks a card reader to take payment, and the card reader replies yes or no.

        Where the metaphor stops: in code, the "reaching in" is only prevented if you design it that way. That is a later topic.` },

    { kind: 'code', title: 'An object: state plus behaviour',
      body: 'Tap the highlighted lines. An object bundles what it **knows** (state) with what it can **do** (behaviour).',
      code: { lang: 'js', src: `
        const basket = {
          items: [],
          add(item) { this.items.push(item); },
          total() {
            return this.items.reduce((sum, i) => sum + i.price, 0);
          }
        };

        basket.add({ name: 'Tea', price: 4 });
        basket.total();   // 4`,
        notes: {
          2: '**State**: the data the object holds. It changes over time as items are added.',
          3: '**Behaviour**: a function that belongs to the object, called a *method*. \`this\` means "this very object".',
          9: 'Using the object means asking it to do something: \`basket.add(…)\`. This is often called **sending a message**.'
        } },
      note: 'Contrast with the functional lessons: OOP is happy for state to change, but keeps that change behind methods.' },

    { kind: 'code', title: 'Classes and instances',
      body: 'One basket is fine. A shop needs thousands, one per customer. A **class** is the blueprint, and each **instance** is one object built from it.',
      code: { lang: 'js', src: `
        class Basket {
          constructor() { this.items = []; }
          add(item) { this.items.push(item); }
          total() {
            return this.items.reduce((sum, i) => sum + i.price, 0);
          }
        }

        const mine = new Basket();
        const yours = new Basket();
        mine.add({ name: 'Tea', price: 4 });
        yours.total();   // 0`,
        notes: {
          1: 'The **class**: one description of what every basket knows and does.',
          2: 'The **constructor** runs once when an instance is made, setting up its starting state.',
          9: '\`new\` stamps out an **instance** from the blueprint.',
          12: 'Each instance has its own state. Your basket is still empty even though mine has tea in it.'
        } } },

    { kind: 'compare', title: 'Class versus instance',
      body: 'People mix these up for years. Keep a picture in mind: a cookie cutter and the cookies.',
      cols: ['Class', 'Instance'],
      rows: [
        ['What it is', 'The blueprint or recipe', 'One real object made from it'],
        ['How many', 'One', 'As many as you like'],
        ['Holds', 'The shape of the data and the methods', 'The actual values, such as this basket’s items'],
        ['Everyday picture', 'Cookie cutter, house plan', 'A cookie, a house']
      ] },

    { kind: 'sequence', title: 'Objects send each other messages',
      body: 'A running OOP program is a conversation. Each object does its own small job and asks others for theirs.',
      actors: ['Checkout', 'Basket', 'Payments'],
      steps: [
        { from: 0, to: 1, label: 'total()', note: 'The checkout does not add up prices itself. It asks the basket.' },
        { from: 1, to: 0, label: '£12', dashed: true, note: 'The basket works it out from its own items and replies.' },
        { from: 0, to: 2, label: 'charge(12)', note: 'Taking money is someone else’s job, so the checkout asks the payments object.' },
        { from: 2, to: 0, label: 'approved', dashed: true, note: 'It replies with the outcome. How it talked to the bank is its own business.' },
        { at: 0, label: 'show receipt', note: 'No object needed to know how the others work inside, only what they can be asked to do.' }
      ] },

    { kind: 'layers', title: 'The four pillars: a preview',
      body: 'OOP is usually described with four big ideas. You will meet each properly in the next module. Here is a one-line taste of each.',
      layers: [
        { label: 'Encapsulation', note: 'Keep the data private. Others go through the methods.', icon: '🔒' },
        { label: 'Abstraction', note: 'Show a simple face; hide the messy detail behind it.', icon: '🎭' },
        { label: 'Inheritance', note: 'One class builds on another and reuses its parts.', icon: '🧬' },
        { label: 'Polymorphism', note: 'Different objects answer the same message in their own way.', icon: '🔀' }
      ] },

    { kind: 'realworld', title: 'Where OOP shines',
      body: `OOP fits naturally when your program has **things with identity and changing state over time**: accounts, baskets, users, orders, game characters, connections. Each one can guard its own rules.

        It also suits **big codebases with many people**: objects are units a team can divide up and swap behind a stable set of methods.

        And it handles **plug-in variety** well. A checkout can ask *any* payment object to charge, whether card, voucher or bank transfer, without caring which. That is polymorphism.

        In Robert C. Martin’s framing, polymorphism is the real prize: it makes indirect calls (deciding at run time which code runs) safe and tidy.` },

    { kind: 'pitfall', title: 'A class is not a bag of functions',
      body: `Beginners often write a class just to hold functions with no real state, such as \`PriceUtils\` or \`OrderManager\` full of unrelated methods. That is not objects, it is a folder wearing a costume.

        Another habit: giving every field a getter and a setter, so anyone can reach in and change anything. The data is technically "private" and practically open to all.

        Experts genuinely disagree about how much OOP is too much. A sensible starting rule: if there is no state and no choice of behaviour, a plain function is usually enough.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Which description best fits an object in OOP?',
      options: ['A bundle of data together with the functions that work on that data', 'A function that returns several values at once', 'A row stored in a database table', 'A file that holds many functions'],
      answer: 0,
      why: [null, 'Returning many values is just a function with a richer result. Objects are about bundling state with behaviour.', 'A row is stored data with no behaviour attached.', 'A file groups code, but its functions need not share any state.'],
      explain: 'The defining idea is state plus behaviour in one unit: the basket knows its items and knows how to total them.' },

    { type: 'tf', after: 3, statement: 'Two instances of the same class share one `items` array, so adding to one basket adds to both.', answer: false,
      explain: 'Each instance gets its own state when the constructor runs. The class is shared, but the data belongs to each instance.' },

    { type: 'match', after: 4, prompt: 'Match each term to what it means.',
      pairs: [
        ['Class', 'A blueprint describing data and methods'],
        ['Instance', 'One object created from a class'],
        ['Method', 'A function that belongs to an object'],
        ['State', 'The data an object currently holds'],
        ['Constructor', 'Code that sets up a new instance']
      ] },

    { type: 'bucket', prompt: 'For a `BankAccount` object: is each item state (what it knows) or behaviour (what it does)?', buckets: ['State', 'Behaviour'],
      items: [
        ['The current balance', 0],
        ['`deposit(amount)`', 1],
        ['The owner’s name', 0],
        ['`isOverdrawn()`', 1],
        ['The list of past transactions', 0],
        ['`withdraw(amount)`', 1]
      ],
      explain: 'State is data that sits there and changes over time. Behaviour is what the object can be asked to do, usually reading or updating that state.' },

    { type: 'cloze', code: true, text: `class Customer {
  {{constructor}}(name) { {{this}}.name = name; }
  greet() { return 'Hi ' + this.name; }
}
const ann = {{new}} Customer('Ann');`,
      distractors: ['class', 'self', 'make'],
      explain: 'The `constructor` sets up each new instance, `this` means the object being built, and `new` creates an instance from the class.' },

    { type: 'spot', prompt: 'Adding to a basket throws a "not defined" error. Tap the line with the mistake.',
      code: { lang: 'js', src: `
        class Basket {
          constructor() { this.items = []; }
          add(item) { items.push(item); }
          total() { return this.items.length; }
        }` },
      lines: [3],
      explain: 'The state lives on the object, so it must be reached as `this.items`. A bare `items` looks for an ordinary variable of that name, which does not exist.' },

    { type: 'ab', q: 'Which design keeps the data and the rules for it together, the OOP way?',
      a: { lang: 'js', label: 'Object', src: `
        class Account {
          constructor() { this.balance = 0; }
          deposit(n) { this.balance += n; }
        }` },
      b: { lang: 'js', label: 'Loose pieces', src: `
        let balance = 0;
        function deposit(n) { balance += n; }
        // other code can also change balance` },
      answer: 'a',
      explain: 'The class holds the balance and the method that changes it, so one place owns the rules. In the loose version, any code in the program can alter `balance` without going through `deposit`.' },

    { type: 'multi', q: 'Which of these are the four pillars usually named for OOP?',
      options: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism', 'Immutability', 'Recursion'],
      answers: [0, 1, 2, 3],
      explain: 'The four pillars are encapsulation, abstraction, inheritance and polymorphism. Immutability belongs more to functional programming, and recursion is a technique, not a pillar. The next module covers all four.' },

    { type: 'explain', prompt: 'Explain the difference between a class and an instance, using baskets in a shop as the example.',
      model: 'A class is the blueprint that says what every basket knows (a list of items) and can do (add, total). An instance is one actual basket made from that class with new, holding its own items. A shop has one Basket class but one instance per customer, and each instance has its own state.',
      keywords: ['blueprint', 'instance', 'class', 'new', 'state', 'own', 'items'] }
  ],

  flashcards: [
    { q: 'What is an object in OOP?', a: 'A unit that bundles state (data) with behaviour (methods that use that data).' },
    { q: 'Class versus instance?', a: 'A class is the blueprint. An instance is one object made from it, with its own state.' },
    { q: 'What does it mean to "send a message" to an object?', a: 'Calling one of its methods, asking it to do something and perhaps return a result.' },
    { q: 'Name the four pillars of OOP.', a: 'Encapsulation, abstraction, inheritance and polymorphism.' },
    { q: 'When does OOP fit especially well?', a: 'When the program has things with identity and changing state, many people working on one codebase, or interchangeable behaviours behind one interface.' }
  ],

  glossary: [
    { term: 'Object', def: 'A unit of a program that holds some data (state) and the functions (methods) that work with it.', like: 'A vending machine: stock inside, buttons outside.' },
    { term: 'Class', def: 'A blueprint that describes the state and methods every object of that kind will have.', like: 'A cookie cutter.' },
    { term: 'Instance', def: 'One particular object created from a class, with its own state.', like: 'A single cookie.' },
    { term: 'Method', def: 'A function that belongs to an object or class and usually works with that object’s state.', like: 'A button on the vending machine.' },
    { term: 'Message', def: 'A request sent to an object by calling one of its methods. Objects cooperate by sending each other messages.', like: 'Asking the barista for a flat white.' }
  ],

  takeaways: [
    'An object is **state plus behaviour** in one unit.',
    'A **class** is the blueprint; an **instance** is one real object built from it.',
    'Objects cooperate by **sending messages** (calling methods).',
    'Four pillars to come: encapsulation, abstraction, inheritance, polymorphism.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('pp-reactive', {
  eli5: 'Reactive programming treats events, such as clicks, messages or sensor readings, as a stream of values arriving over time, and lets you describe what to do with each one as it appears.',

  cards: [
    { kind: 'concept', title: 'Values that arrive over time',
      body: `A search box. The user types *c*, then *ca*, then *cat*. If your code fires a search for every keystroke, three requests go out and two are wasted. Worse, the slow reply for *"c"* might arrive after the reply for *"cat"* and overwrite it.

        Until now, our data has been **lists we already have**. Here the values do not exist yet. They turn up one at a time, at moments we do not control.

        **Reactive programming** treats such things as a **stream**: a sequence of values over time. You describe in advance how to *react* to each one.` },

    { kind: 'metaphor', title: 'A magazine subscription',
      body: `You subscribe to a magazine. You do not stand at the printer. When each issue is published, it lands on your doormat. When you have had enough, you cancel and the issues stop.

        - The **magazine** is the stream.
        - **Subscribing** says "send me every new issue".
        - Your **reading habit** (skim, bin the adverts, file the good ones) is the code that reacts.
        - **Cancelling** is unsubscribing.

        Where the metaphor stops: a real magazine eventually ends, but many streams, like clicks, never do.` },

    { kind: 'code', title: 'A stream in a dozen lines',
      body: 'No library needed. Here is a tiny stream written by hand. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        function createStream() {
          const listeners = [];
          return {
            subscribe(fn) { listeners.push(fn); },
            emit(value) { listeners.forEach(fn => fn(value)); }
          };
        }

        const orders = createStream();
        orders.subscribe(o => console.log('New order', o.id));
        orders.emit({ id: 1 });   // New order 1
        orders.emit({ id: 2 });   // New order 2`,
        notes: {
          4: '**Subscribe**: hand the stream a function to call whenever something arrives. The stream keeps a list of these.',
          5: '**Emit**: something happened. The stream calls every subscribed function with the new value.',
          10: 'The subscriber describes the reaction once. It runs again for every future order, without being called by hand.',
          11: 'The code that produces orders does not know who is listening.'
        } },
      note: 'A function that gets called when something happens is an **observer**. Real libraries, such as RxJS, are polished versions of this idea.' },

    { kind: 'sequence', title: 'Subscribe, receive, unsubscribe',
      body: 'The producer and the subscriber never talk directly. The stream sits between them.',
      actors: ['Subscriber', 'Stream', 'Producer'],
      steps: [
        { from: 0, to: 1, label: 'subscribe(fn)', note: 'The subscriber registers interest. Nothing arrives yet.' },
        { from: 2, to: 1, label: 'emit(1)', note: 'The producer pushes a value into the stream.' },
        { from: 1, to: 0, label: 'fn(1)', note: 'The stream pushes it on to every subscriber.' },
        { from: 2, to: 1, label: 'emit(2)', note: 'Another value, some time later.' },
        { from: 1, to: 0, label: 'fn(2)', note: 'The same reaction runs again.' },
        { from: 0, to: 1, label: 'unsubscribe', note: 'The subscriber has had enough.' },
        { from: 2, to: 1, label: 'emit(3)', note: 'The stream receives it, but there is nobody left to notify. Forgetting to unsubscribe is a classic memory-leak bug.' }
      ] },

    { kind: 'code', title: 'Operators: streams from streams',
      body: 'You already know `map` and `filter` on lists. The same ideas work on streams: an **operator** takes a stream and gives you a new one.',
      code: { lang: 'js', src: `
        function map(stream, fn) {
          const out = createStream();
          stream.subscribe(v => out.emit(fn(v)));
          return out;
        }

        function filter(stream, test) {
          const out = createStream();
          stream.subscribe(v => { if (test(v)) out.emit(v); });
          return out;
        }

        const bigOrders = filter(orders, o => o.total > 100);`,
        notes: {
          3: 'Whenever the source emits, pass the value through \`fn\` and emit the result on the new stream.',
          9: 'Only emit the value onward if it passes the test. The rest quietly disappear.',
          13: 'Now \`bigOrders\` is a stream that only ever carries orders over 100. Subscribe to it as you would any other.'
        } } },

    { kind: 'compare', title: 'A list versus a stream',
      body: 'They share operators, but they feel different.',
      cols: ['List (array)', 'Stream'],
      rows: [
        ['When values arrive', 'All present already', 'One at a time, over time'],
        ['Does it end?', 'Always', 'Maybe never'],
        ['Who drives?', 'You loop and pull each item', 'The source pushes each item to you'],
        ['Typical operators', '`map`, `filter`, `reduce`', '`map`, `filter`, `debounce`, `merge`']
      ] },

    { kind: 'sequence', title: 'Debounce: wait for the pause',
      body: 'Back to the search box. **Debounce** holds a value back until nothing new has arrived for a set time. It turns a burst of keystrokes into one search.',
      actors: ['Keystrokes', 'Debounce', 'Search'],
      steps: [
        { from: 0, to: 1, label: '"c"', note: 'The first key arrives. Debounce starts a short timer, say 300 milliseconds.' },
        { from: 0, to: 1, label: '"ca"', note: 'Another key before the timer ran out. The old one is dropped and the timer restarts.' },
        { from: 0, to: 1, label: '"cat"', note: 'Same again. Still nothing sent.' },
        { at: 1, label: 'quiet for 300 ms', note: 'The typing stops. The timer finally runs out.' },
        { from: 1, to: 2, label: '"cat"', note: 'One search goes out, for the final text only.' }
      ] },

    { kind: 'concept', title: 'A starter kit of operators',
      body: `Libraries such as RxJS ship dozens. These four cover most everyday needs, and the details of each library’s names may differ.

        | Operator | Does | Example |
        |---|---|---|
        | map | Transforms each value | Click event to a search text |
        | filter | Lets only some values through | Ignore searches under 2 letters |
        | debounce | Waits for a pause, then passes the latest | Search as you type |
        | merge | Combines several streams into one | Clicks and key presses as "activity" |

        Because each operator returns a stream, you chain them into a pipeline, just like the \`map\`/\`filter\`/\`reduce\` chains from the functional lessons.` },

    { kind: 'pitfall', title: 'Backpressure: when the source is too fast',
      body: `A sensor sends 1,000 readings a second. Your code saves each one to a database that can only manage 100 a second. Readings pile up in memory, and eventually the program crashes.

        The problem is **backpressure**: a producer faster than its consumer. Picture a bath tap running faster than the plughole drains.

        There is no free answer. You must pick a policy:

        - **Buffer** a bounded amount, then do something else.
        - **Drop** values, either the oldest or the newest.
        - **Sample**: keep only the latest value each second.
        - **Slow the source** down, if it can be asked to.

        Which one is right depends on whether losing data is acceptable.` },

    { kind: 'realworld', title: 'Where reactive fits',
      body: `Reactive thinking shines where **events arrive unpredictably and you want to compose reactions**: user interfaces (typing, clicks, scrolling), live dashboards, chat and notification feeds, and pipelines handling events from sensors or message queues.

        Node.js has its own **streams** with built-in backpressure for files and network data. Front-end frameworks lean on similar ideas to keep screens in step with changing data.

        It is not free. Streams can be harder to debug than plain step-by-step code, and for ordinary "ask once, get one answer" requests it is overkill. Use it when the data really is a flow.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'In the hand-made stream, what does `subscribe(fn)` do?',
      options: ['Registers a function to be called with each future value', 'Sends a value to every listener straight away', 'Runs `fn` once and then stops', 'Creates a brand-new stream'],
      answer: 0,
      why: [null, 'That is `emit`. Subscribing only registers interest.', 'The function is kept and called again for each future value, not run once.', '`createStream` makes a stream. `subscribe` attaches a reaction to one.'],
      explain: 'Subscribing stores your function in the stream’s list. Each later `emit` calls it, so you describe the reaction once and it repeats for every value.' },

    { type: 'order', after: 3, prompt: 'Put the life of a subscription in order.',
      items: ['A subscriber registers its function', 'A producer emits a value', 'The stream calls each subscribed function', 'The subscriber unsubscribes', 'Later values no longer reach that subscriber'],
      explain: 'You cannot receive anything before subscribing. After unsubscribing, the stream carries on for others but skips you.' },

    { type: 'tf', after: 4, statement: 'Unlike an array, a stream can be endless: it may keep producing values for as long as the program runs.', answer: true,
      explain: 'A list has a known end. A stream of clicks, messages or readings may never finish, which is why you react to values as they arrive.' },

    { type: 'cloze', code: true, text: `function filter(stream, test) {
  const out = createStream();
  stream.{{subscribe}}(v => { if (test(v)) out.{{emit}}(v); });
  return out;
}`,
      distractors: ['push', 'map', 'unsubscribe'],
      explain: 'The operator listens to the source with `subscribe`, and re-publishes only the values that pass the test on the new stream with `emit`.' },

    { type: 'ab', q: 'Which search handler avoids sending a request for every single keystroke?',
      a: { lang: 'js', label: 'Direct', src: `
        input.on('keyup', e => search(e.target.value));` },
      b: { lang: 'js', label: 'Debounced', src: `
        input.on('keyup', debounce(e => search(e.target.value), 300));` },
      answer: 'b',
      explain: 'Debounce waits until the typing pauses for 300 ms, then searches once with the final text. The direct version fires a request on every key press.' },

    { type: 'bucket', after: 7, prompt: 'Which operator does each job: map, filter, debounce or merge?', buckets: ['map', 'filter', 'debounce', 'merge'],
      items: [
        ['Convert prices from pence to pounds as they arrive', 0],
        ['Pass on only temperature readings above 30', 1],
        ['Ignore resize events until the window stops changing', 2],
        ['Treat two websocket feeds as one stream', 3],
        ['Turn each click event into a search request', 0],
        ['Skip messages from blocked users', 1],
        ['Combine clicks and key presses into one "user activity" stream', 3]
      ],
      explain: '`map` changes each value, `filter` decides which survive, `debounce` waits for quiet, and `merge` joins several streams into one.' },

    { type: 'multi', q: 'A producer emits events faster than a consumer can handle them. Which of these are legitimate backpressure policies?',
      options: ['Keep a bounded buffer and drop the oldest values when it fills', 'Sample: only keep the latest value each second', 'Ask the source to slow down, where it supports that', 'Buffer without any limit and hope memory lasts', 'Pretend the problem will go away on its own'],
      answers: [0, 1, 2],
      explain: 'Bounded buffering, sampling and slowing the source are deliberate choices. An unlimited buffer only delays the crash, and ignoring the problem is not a policy.' },

    { type: 'explain', prompt: 'In your own words: what is a stream, and why does debounce suit a search box?',
      model: 'A stream is a sequence of values that arrive over time, such as keystrokes or messages. You subscribe a function that reacts to each one. A search box produces a burst of values as the user types, and debounce waits until there has been a pause before passing on the latest value, so one search is sent for the final text instead of one per keystroke.',
      keywords: ['stream', 'over time', 'subscribe', 'debounce', 'pause', 'latest', 'keystroke'] }
  ],

  flashcards: [
    { q: 'What is a stream in reactive programming?', a: 'A sequence of values arriving over time, such as clicks, messages or sensor readings, that you react to as they come.' },
    { q: 'What are an observer and a subscription?', a: 'An observer is a function called when a new value arrives. A subscription is the link between it and a stream, which you can cancel.' },
    { q: 'What does debounce do?', a: 'Waits until no new value has arrived for a set time, then passes on only the latest one.' },
    { q: 'What does merge do?', a: 'Combines several streams into one stream carrying all their values.' },
    { q: 'What is backpressure?', a: 'The problem of a producer sending values faster than the consumer can handle. It needs a policy: bounded buffering, dropping, sampling or slowing the source.' }
  ],

  glossary: [
    { term: 'Stream', def: 'A sequence of values that arrive over time and may never end.', like: 'A river: you do not hold it, you watch it flow by.', aka: ['observable'] },
    { term: 'Observer', def: 'A function that is called each time a stream produces a new value.', like: 'Your reading habit once an issue lands on the mat.', aka: ['subscriber', 'listener'] },
    { term: 'Subscription', def: 'The registration that connects an observer to a stream. Cancelling it (unsubscribing) stops delivery.', like: 'A magazine subscription.' },
    { term: 'Debounce', def: 'An operator that waits for a quiet period and then emits only the most recent value.', like: 'A lift door that waits for people to stop arriving before it closes.' },
    { term: 'Backpressure', def: 'The build-up that occurs when values are produced faster than they can be consumed, and the strategies for coping with it.', like: 'A tap running faster than the plughole drains.' }
  ],

  takeaways: [
    'A **stream** is values over time: you subscribe once and react to each one.',
    'An **operator** (`map`, `filter`, `debounce`, `merge`) turns one stream into another, so they chain.',
    'Unsubscribe when you are done, or you leak memory.',
    '**Backpressure** needs a deliberate policy: buffer a bit, drop, sample or slow the source.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('pp-mixing', {
  eli5: 'Real programs use several styles at once: calm, predictable calculations in the middle, and the messy business of databases, emails and clocks around the edge.',

  cards: [
    { kind: 'concept', title: 'Which paradigm does a checkout use?',
      body: `Think about what a checkout feature has to do. It adds up prices and applies a coupon. It reads the basket from a database and writes the order back. It sends a confirmation email. It might react to a payment arriving a few seconds later.

        The first job is pure arithmetic. The second and third touch the outside world. The fourth is an event over time.

        So which paradigm is it? It is a trick question. Every serious program ends up borrowing from all of them, and the skill is **choosing a style per problem** rather than choosing a team.` },

    { kind: 'metaphor', title: 'A sealed calculator in a busy post office',
      body: `Picture a post office. At the counters it is chaos: queues, parcels, forms, people changing their minds. But behind the counter, a clerk uses a **sealed calculator** to work out postage. Give it a weight and a destination and it returns a price. It never looks at the queue, never rings anyone, and gives the same answer every time.

        The calculator is easy to check and easy to trust *because* it is cut off from the chaos.

        That is the shape many good programs take: a calm, predictable **core** of calculations, wrapped in a shell that deals with the world.` },

    { kind: 'code', title: 'Before: everything tangled together',
      body: 'This function works, but look at what is mixed into it. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        async function checkout(userId) {
          const cart = await db.getCart(userId);
          let total = 0;
          for (const item of cart.items) total += item.price * item.qty;
          if (cart.coupon === 'SAVE10') total = total - total / 10;
          await db.saveOrder(userId, total);
          await mailer.send(userId, 'Total: ' + total);
        }`,
        notes: {
          2: 'Talks to the **outside world**: reads from a database.',
          4: 'Pure arithmetic hiding in the middle: price times quantity, summed.',
          5: 'A pure business rule, but you cannot test it without a database and a mailer to hand.',
          6: 'Another trip to the outside world, changing something permanently.',
          7: 'And another: an email that cannot be un-sent.'
        } } },

    { kind: 'code', title: 'After: a functional core and an imperative shell',
      body: 'The calculations move into a pure function. The function that remains handles the world and nothing else.',
      code: { lang: 'js', src: `
        // Functional core: pure, no database, no email
        function priceOrder(items, coupon) {
          const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
          return coupon === 'SAVE10' ? subtotal - subtotal / 10 : subtotal;
        }

        // Imperative shell: fetches, calls the core, saves, sends
        async function checkout(userId) {
          const cart = await db.getCart(userId);
          const total = priceOrder(cart.items, cart.coupon);
          await db.saveOrder(userId, total);
          await mailer.send(userId, 'Total: ' + total);
        }`,
        notes: {
          2: 'Everything it needs arrives as arguments, and it only returns a value. Testing it is one line: \`priceOrder([{ price: 10, qty: 2 }], \'SAVE10\')\` should give 18.',
          9: 'The shell reads the world, hands plain data to the core, then acts on the answer.',
          11: 'All side effects live here. If the email provider changes, the pricing code is untouched.'
        } } },

    { kind: 'diagram', title: 'The shape of the pattern',
      body: 'Data flows in at the edge, gets decided on in the middle, and results flow out again.',
      nodes: [
        { id: 'req', label: 'Request arrives', icon: '📨', x: 1, y: 0 },
        { id: 'read', label: 'Shell: read the world', x: 1, y: 1, tone: 'warn' },
        { id: 'core', label: 'Core: pure decisions', x: 1, y: 2, tone: 'good' },
        { id: 'write', label: 'Shell: save and send', x: 1, y: 3, tone: 'warn' }
      ],
      edges: [
        { from: 'req', to: 'read' },
        { from: 'read', to: 'core', label: 'plain data' },
        { from: 'core', to: 'write', label: 'a decision' }
      ],
      caption: 'The shell is usually where objects live (database clients, mailers) and where events are handled. The core is where functions live.' },

    { kind: 'compare', title: 'Choosing a style: the trade-offs',
      body: 'No style wins everywhere. Structured, step-by-step code is the baseline underneath all of them.',
      cols: ['Functional', 'Object-oriented', 'Reactive'],
      rows: [
        ['Best for', 'Calculations and data pipelines', 'Things with identity and changing state', 'Events arriving over time'],
        ['Strength', 'Easy to test and reason about', 'Guards its own rules; plug-in variety', 'Composes reactions to events'],
        ['Watch out for', 'Awkward for lots of changing state', 'Over-engineering; tangled hierarchies', 'Harder to debug; overkill for one-shot calls'],
        ['Example', 'Pricing and discount rules', 'Basket, account, connection', 'Search-as-you-type, live feeds']
      ] },

    { kind: 'steps', title: 'Picking a style, one question at a time',
      body: 'A rough routine that works surprisingly often.',
      steps: [
        { title: 'Is it a calculation?', body: 'Data in, answer out, no side effects? Write a pure function. It will be the easiest part of the system to test.' },
        { title: 'Is it a thing that changes over time?', body: 'An account, a basket, a connection: something with identity and rules about how it may change? An object fits.' },
        { title: 'Does it react to events?', body: 'Clicks, messages, readings arriving unpredictably? Think streams and observers.' },
        { title: 'Does the codebase already have a habit?', body: 'Follow the local convention unless it is truly hurting. Consistency beats cleverness.' },
        { title: 'Otherwise, keep it plain', body: 'A short, structured function with clear names is a perfectly good answer.' }
      ] },

    { kind: 'tip', title: 'Reading unfamiliar styles without panic',
      body: `You will inherit code written in a style you do not like or know. Do not panic. Look for the tell-tale signs, then ask three questions: **Where is the state? Where does it change? Who calls whom?**

        | If you see… | It is probably… |
        |---|---|
        | \`class\`, \`this\`, \`new\` | Object-oriented |
        | Chains of \`.map().filter().reduce()\` | A functional pipeline |
        | \`subscribe\`, \`on('event')\`, \`debounce\` | Event or stream style |
        | \`let\` counters and \`for\` loops | Plain imperative |

        Most files show several. That is normal, not a mistake.` },

    { kind: 'pitfall', title: 'Mixing badly',
      body: `Mixing is fine. **Muddling** is not.

        - A function called \`calculateTotal\` that quietly writes to a database has a name that lies.
        - A "pure" function that sorts its argument in place passes tests today and bites someone next month.
        - Forcing everything into classes, or everything into one-line chains, because you have just learned something new.

        The point of each paradigm is the **freedom it removes**. Mix them so that each part keeps its discipline, rather than sneaking the removed freedom back in through a side door.` },

    { kind: 'realworld', title: 'A typical backend, in three styles at once',
      body: `Open an ordinary Node.js or Python web service and you will often find all of this in one project.

        - **Handlers** are short, step-by-step functions: parse the request, call a service, send a response.
        - **Services and repositories** are objects or classes, holding database connections and guarding rules.
        - **Pricing, validation and report-building** are pure functions, with data pipelines of \`map\` and \`filter\`.
        - **Queues and live feeds** are event or stream code, with backpressure thought through.

        No one chose a paradigm. Each part picked up the style that suited its job.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the core idea of "functional core, imperative shell"?',
      options: ['Keep decisions in pure functions and push database, network and clock work to the edge', 'Write the whole program as one big class and wrap it in a function', 'Never use loops anywhere in the program', 'Use streams for every function so nothing is ever blocked'],
      answer: 0,
      why: [null, 'This is the opposite: one class tangles the pure and impure parts together.', 'Loops are fine in either part. The split is about side effects, not about loops.', 'Streams suit event flows, not every function.'],
      explain: 'The core is pure and predictable, so it is easy to test. The shell does the messy outside work, and passes plain data in and out of the core.' },

    { type: 'spot', after: 3, prompt: 'This function is meant to belong to the pure core. Tap the line that breaks that.',
      code: { lang: 'js', src: `
        function priceOrder(items, coupon) {
          const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
          db.saveDraft(items);
          return coupon === 'SAVE10' ? subtotal - subtotal / 10 : subtotal;
        }` },
      lines: [3],
      explain: 'Saving a draft to a database is a side effect. Now the function cannot be tested without a database, and calling it twice writes twice. That job belongs in the shell.' },

    { type: 'bucket', prompt: 'Does each job belong in the functional core or the imperative shell?', buckets: ['Functional core', 'Imperative shell'],
      items: [
        ['Add up the price of each item in the basket', 0],
        ['Load the basket from the database', 1],
        ['Decide whether an order qualifies for free delivery', 0],
        ['Send the confirmation email', 1],
        ['Apply a coupon rule to a subtotal', 0],
        ['Write the finished order to the database', 1],
        ['Read today’s date from the clock (then pass it in)', 1]
      ],
      explain: 'Anything that only turns inputs into an answer is core. Anything that touches the database, the network or the clock is shell. Even the date is fetched by the shell and handed to the core.' },

    { type: 'ab', q: 'Which function is easier to unit-test with no database or mailer available?',
      a: { lang: 'js', label: 'Pure pricing', src: `
        function priceOrder(items, coupon) {
          const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
          return coupon === 'SAVE10' ? sub - sub / 10 : sub;
        }` },
      b: { lang: 'js', label: 'Whole checkout', src: `
        async function checkout(userId) {
          const cart = await db.getCart(userId);
          const total = cart.items.reduce((s, i) => s + i.price, 0);
          await db.saveOrder(userId, total);
        }` },
      answer: 'a',
      explain: 'The pure function needs only values passed in, and returns a value to check. The other needs a database, so a test must fake or run one.' },

    { type: 'match', prompt: 'Match each problem to the style that fits it best.',
      pairs: [
        ['Working out tax and discounts', 'Pure functions'],
        ['A bank account that changes over time', 'An object guarding its own state'],
        ['Search-as-you-type', 'A stream with debounce'],
        ['Reshaping a list of API results', 'A map/filter/reduce pipeline'],
        ['Reading config, then starting the server', 'Plain step-by-step code']
      ] },

    { type: 'cloze', text: 'The {{core}} makes decisions with pure functions, while the {{shell}} handles the database, the network and the clock.',
      distractors: ['stream', 'class', 'loop'],
      explain: 'This split keeps the testable, predictable part separate from the part that touches the outside world.' },

    { type: 'tf', statement: 'A codebase that uses several paradigms is a sign of poor design.', answer: false,
      explain: 'Most healthy backends mix styles, each where it fits: objects for services, pure functions for calculations, streams for events. Muddled responsibilities are the problem, not variety.' },

    { type: 'mcq', q: 'You inherit this code. What style is it?',
      code: { lang: 'js', src: `
        clicks
          .filter(e => e.target.id === 'buy')
          .debounce(500)
          .subscribe(addToBasket);` },
      options: ['Reactive: a stream of events shaped by operators, with a subscriber', 'Structured: a loop that jumps with goto', 'Class-based OOP with inheritance', 'Pure functional code with no events involved'],
      answer: 0,
      why: [null, 'There is no loop and no goto. The structure is a chain of operators.', 'Nothing here defines a class or uses `this`.', 'The `subscribe` and `debounce` show that events over time are the heart of it.'],
      explain: '`filter` and `debounce` are stream operators, and `subscribe` attaches the reaction. Recognising those tell-tale words lets you read unfamiliar code calmly.' },

    { type: 'explain', prompt: 'Explain "functional core, imperative shell" to a colleague, and say why it makes code easier to test.',
      model: 'The core is made of pure functions that take plain data and return decisions, with no database, network or clock. The shell is the thin outer layer that loads data, calls the core, then saves results and sends emails. Because the core only needs values in and gives values out, tests need no database or mocks, while the messy side effects stay in one place.',
      keywords: ['pure', 'core', 'shell', 'side effects', 'test', 'database', 'data'] }
  ],

  flashcards: [
    { q: 'What is "functional core, imperative shell"?', a: 'A structure where pure functions make the decisions in the middle, and a thin outer layer handles side effects such as databases, emails and clocks.' },
    { q: 'Why is a pure core easy to test?', a: 'It needs only values as input and returns a value, so tests need no database, network or mocks.' },
    { q: 'Which style would you pick for a live search box?', a: 'A reactive stream: debounce the keystrokes, then map them to a search request.' },
    { q: 'What three questions help you read unfamiliar code?', a: 'Where is the state? Where does it change? Who calls whom?' },
    { q: 'What is the danger of "mixing badly"?', a: 'Sneaking the removed freedom back in: for example a function named like a calculation that secretly writes to a database.' }
  ],

  glossary: [
    { term: 'Functional core', def: 'The inner part of a program made of pure functions that turn plain data into decisions, with no side effects.', like: 'The sealed calculator behind the post office counter.' },
    { term: 'Imperative shell', def: 'The thin outer layer that talks to the outside world (databases, network, clock), calls the core, and acts on its answers.', like: 'The counter staff dealing with the queue.' },
    { term: 'Side effect', def: 'Anything a function does besides returning a value, such as writing to a database, sending an email or changing its input.', like: 'A calculator that also texts your boss.' }
  ],

  takeaways: [
    'Real systems **mix** paradigms: choose a style per problem, not per tribe.',
    '**Functional core, imperative shell**: pure decisions inside, side effects at the edge.',
    'Pure cores are easy to test; shells stay thin.',
    'Reading new code: find the state, see where it changes, follow who calls whom.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('paradigms', {
  title: 'The Paradigm Chimera',
  intro: 'A beast with three heads, one that jumps, one that mutates and one that never stops talking, guards the gate to Object-Oriented Design. Show you can tell the styles apart and pick the right one.',
  questions: [
    { type: 'mcq', q: 'Which statement is the most declarative?',
      options: ['Give me the total of all paid orders', 'Make a counter, loop over the orders, and add each paid one', 'Start at index 0, test `paid`, then increment', 'Create an empty list and push each paid total into it'],
      answer: 0,
      why: [null, 'This spells out the procedure with counter and loop.', 'Indexes and increments are all "how".', 'Building a list by hand is a recipe, not a request.'],
      explain: 'A declarative description says what result is wanted and leaves out the steps. The others each describe the procedure.' },

    { type: 'tf', statement: 'In Robert C. Martin’s framing, each of the big paradigms works by removing a freedom: unrestricted jumps, unmanaged indirect calls, and reassignment.', answer: true,
      explain: 'Structured programming restricts direct jumps (goto), object-oriented programming disciplines indirect calls through polymorphism, and functional programming disciplines assignment.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [
        ['Closure', 'A function plus the outside variables it uses'],
        ['Higher-order function', 'A function that takes or returns functions'],
        ['Base case', 'The input a recursive function answers directly'],
        ['Instance', 'One object created from a class'],
        ['Observer', 'A function called when a stream emits a value']
      ] },

    { type: 'spot', prompt: 'This helper should return a sorted list without disturbing the caller’s array. Tap the line that goes wrong.',
      code: { lang: 'js', src: `
        function sortedNames(names) {
          const copy = names;
          copy.sort();
          return copy;
        }` },
      lines: [2],
      explain: '`const copy = names` does not copy anything: both names point at the same array. So `sort` reorders the caller’s list too. `[...names]` makes a real copy.' },

    { type: 'order', prompt: 'Put the checkout steps in order, as a functional core with an imperative shell would run them.',
      items: ['The shell loads the cart from the database', 'The core prices the order', 'The shell saves the order', 'The shell sends the confirmation email'],
      explain: 'Data comes in through the shell, is decided on by the pure core, and results go out through the shell again.' },

    { type: 'bucket', prompt: 'Which paradigm does each snippet show most clearly?', buckets: ['Structured', 'Functional', 'Object-oriented', 'Reactive'],
      items: [
        ['`while (queue.length > 0) { handle(queue.pop()); }`', 0],
        ['`const withVat = multiply(1.2);`', 1],
        ['`class Basket { add(item) { … } }`', 2],
        ['`merge(clicks, keys).subscribe(log)`', 3],
        ['`prices.map(addVat).filter(isCheap)`', 1],
        ['`const mine = new Basket();`', 2],
        ['`if (stock > 0) { sell(); } else { restock(); }`', 0],
        ['`input.debounce(300).subscribe(search)`', 3]
      ],
      explain: 'Loops and ifs are the structured toolkit. Pre-filled functions and chained pipelines are functional. Classes and `new` are OOP. `subscribe` with operators is reactive.' },

    { type: 'cloze', code: true, text: `const addTax = rate => price => price + price * {{rate}};
const withVat = addTax({{0.2}});
withVat(100);   // 120`,
      distractors: ['price', '0.5', 'rate()'],
      explain: 'The inner function remembers `rate` through a closure. Fixing `rate` at 0.2 gives a function that adds 20%, so 100 becomes 120.' },

    { type: 'mcq', q: 'What guarantees that a recursive function eventually stops?',
      options: ['A base case that every call moves closer to', 'Calling itself with exactly the same input each time', 'Using `const` instead of `let`', 'Declaring it as a closure'],
      answer: 0,
      why: [null, 'The same input forever means never stopping: a stack overflow.', '`const` affects reassignment of a variable, not how long recursion runs.', 'Closures are about remembering variables, not about stopping.'],
      explain: 'You need a smallest case answered directly, and each recursive step must shrink the problem towards it.' },

    { type: 'ab', q: 'Which function is pure?',
      a: { lang: 'js', label: 'Version one', src: `
        const addVat = price => price * 1.2;` },
      b: { lang: 'js', label: 'Version two', src: `
        const addVat = price => {
          audit.log(price);
          return price * 1.2;
        };` },
      answer: 'a',
      explain: 'The first only reads its input and returns a value. The second writes to a log, which is a side effect, so calling it has consequences beyond its result.' },

    { type: 'multi', q: 'Which of these are true of streams in reactive programming?',
      options: ['Values arrive one at a time, over time', 'A stream may never end', 'Operators such as `map` and `filter` return new streams', 'Forgetting to unsubscribe can leak memory', 'A stream must contain all its values before `map` can run'],
      answers: [0, 1, 2, 3],
      explain: 'Streams push values as they happen, can be endless, and chain through operators. Subscriptions that are never cancelled keep references alive. Nothing needs to be loaded first.' },

    { type: 'estimate', q: 'A sensor emits 500 readings a second but your code handles only 200 a second. If nothing is dropped, roughly how many readings pile up waiting after one minute?', answer: 18000, unit: 'readings', min: 100, max: 1000000,
      explain: 'The backlog grows by 500 − 200 = 300 readings every second. Over 60 seconds that is 18,000. This is why backpressure needs a policy rather than hope.' },

    { type: 'short', q: 'Which array method folds a whole list into a single value?', accept: ['reduce', 'fold'], hint: 'Starts with an initial value, such as 0, and a running total.',
      explain: '`reduce` (called `fold` in some languages) applies a function to a running result and each item in turn, ending with one value.' }
  ]
});

KS.sheet('paradigms', {
  title: 'Programming Paradigms: cheat sheet',
  sections: [
    { title: 'The big picture',
      md: `| Style | Disciplines | Idea in one line |
        |---|---|---|
        | Structured | Direct jumps (\`goto\`) | Sequence, selection, iteration |
        | Object-oriented | Indirect calls | Objects hold state and behaviour |
        | Functional | Assignment | Functions as values; copy, never edit |
        | Reactive | Timing of events | Streams of values over time |

        **Imperative** says *how*, step by step. **Declarative** says *what* result you want. Most languages are **multi-paradigm**.` },

    { title: 'Structured programming',
      md: `- Three building blocks: **sequence** (in order), **selection** (\`if\`, \`switch\`), **iteration** (\`for\`, \`while\`).
        - Böhm and Jacopini (1966): these three are enough for any program.
        - Dijkstra (1968): *Go To Statement Considered Harmful*.
        - Blocks and functions have **one way in, one way out**, so you can reason about them alone.
        - Early returns are fine: they jump somewhere you can always name.
        - \`goto\` survives mainly in C and Go, for example for clean-up on failure.` },

    { title: 'Functional toolbox',
      md: `| Tool | Returns | Example |
        |---|---|---|
        | \`map\` | Same-length list, each transformed | \`prices.map(addVat)\` |
        | \`filter\` | Items passing a test | \`orders.filter(o => o.paid)\` |
        | \`reduce\` | One combined value | \`xs.reduce((s, x) => s + x, 0)\` |

        - **Immutability**: copy instead of editing: \`[...cart, item]\`. Beware \`sort\`, \`push\`, \`reverse\`, \`splice\`.
        - \`const\` stops reassignment, not mutation.` },

    { title: 'Closures, composition, recursion',
      md: `- **Closure**: a function remembering the variables it was made with: \`makeDiscount(10)\`.
        - **Composition**: \`pipe(trim, lower)\` feeds each output into the next function.
        - **Currying**: \`a => b => a + b\`. **Partial application**: fix some arguments early: \`multiply(1.2)\`.
        - **Recursion**: needs a **base case** and a step towards it. No base case means a stack overflow.
        - Everyday uses: middleware chains, handler factories, retry wrappers, walking trees.` },

    { title: 'Object-oriented in a nutshell',
      md: `- **Object** = state + behaviour. **Class** = blueprint. **Instance** = one object from \`new\`.
        - **Method** = a function that belongs to an object. Calling it is *sending a message*.
        - Four pillars, covered in the next module: **encapsulation**, **abstraction**, **inheritance**, **polymorphism**.
        - Shines for: things with identity and changing state, large team codebases, interchangeable behaviours.
        - Avoid: classes with no state (\`Utils\`), and getters and setters on everything.` },

    { title: 'Reactive programming',
      md: `- **Stream**: values over time. **Observer**: function called per value. **Subscription**: the link; unsubscribe to stop.
        - **Operators** return new streams:

        | Operator | Does |
        |---|---|
        | map | Transforms each value |
        | filter | Passes only some values |
        | debounce | Waits for a pause, passes the latest |
        | merge | Joins several streams into one |

        - **Backpressure** (producer faster than consumer): bounded buffer, drop, sample, or slow the source.` },

    { title: 'Mixing styles and common mistakes',
      md: `- **Functional core, imperative shell**: pure decisions inside, side effects (database, email, clock) at the edge.
        - Choose per problem: calculation, pure function. Changing thing, object. Event flow, stream. Otherwise, plain code.
        - Reading new code: *where is the state, where does it change, who calls whom?*

        **Common mistakes**
        - A function named like a calculation that writes to a database.
        - Sorting an argument in place and calling the function pure.
        - A recursive function with no base case.
        - Never unsubscribing, or never deciding what to do under backpressure.` }
  ]
});

