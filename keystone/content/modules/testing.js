/* Module: testing — Testing & TDD.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs testing */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('test-why-pyramid', {
  eli5: 'Automated tests are little programs that check your real program still works, so you can change code and find out within seconds if you broke something.',

  cards: [
    { kind: 'story', title: 'The Friday afternoon fix',
      body: `It is Friday, 4:45pm. Your shop's checkout has a tiny bug: delivery is charged twice on orders over £50. The fix is one line.

        You make the change. Does checkout work now? You open the site, add something to the basket, pay... fine. Home time.

        On Monday, support is flooded. Your one-line fix quietly broke **discount codes**, which share the same function. You never tried a discount code, because you cannot try *everything* by hand every time you touch the code.

        That is the problem tests solve: not "does my new bit work?" but "**did I break anything else?**"` },

    { kind: 'concept', title: 'A test is a program that checks a program',
      body: `An **automated test** is a small piece of code that runs part of your real code, then checks the result against what you expected. If the result is wrong, the test **fails** and tells you where.

        You write it once. After that, the computer can re-run hundreds of them in seconds, every time, without getting bored or skipping the boring bits.

        \`\`\`
        run basket with 2 items  →  expect total = £30
        run basket with a code   →  expect total = £27
        \`\`\`

        A collection of tests is a **test suite**. When every test passes you see green; one failure and you see red.` },

    { kind: 'metaphor', title: 'The safety net',
      body: `A trapeze artist can try a daring new trick because there is a **net** underneath. Without it, they would only ever do the moves they are certain of.

        A good test suite is that net. With it, you can **refactor** (reshape code without changing what it does), upgrade a library or fix a bug, and find out in seconds whether you fell.

        Without it, every change is a gamble, so people stop changing the code at all. Teams call such code "legacy": not because it is old, but because nobody dares touch it.

        Where the metaphor stops: a net catches a fall, but tests can only catch the falls you thought to test for.` },

    { kind: 'code', title: 'What a test actually looks like',
      body: 'Here is a real function and a test for it, in the style of Jest, a popular JavaScript testing tool. **Tap the lines.**',
      code: { lang: 'js', src: `
        // basket.js
        function basketTotal(prices, code) {
          const sum = prices.reduce((a, b) => a + b, 0);
          return code === 'TEN' ? sum * 0.9 : sum;
        }

        // basket.test.js
        test('applies the TEN code', () => {
          const total = basketTotal([10, 20], 'TEN');
          expect(total).toBe(27);
        });`,
        notes: {
          3: 'The real code. Tests call it exactly as the rest of your program would.',
          8: '`test(name, function)` registers one test. The name should read like a sentence about behaviour.',
          9: 'We run the code with known input...',
          10: '...and `expect(...).toBe(...)` states what we **expect**. If the numbers differ, the test fails and prints both.'
        } } },

    { kind: 'concept', title: 'Tests are documentation that cannot lie',
      body: `A comment can say "discount codes are applied before delivery" and be wrong for three years. A **test** that says exactly that fails the moment it stops being true.

        Read a good suite and you learn what the code is *for*:

        - \`applies the TEN code to the whole basket\`
        - \`ignores unknown codes\`
        - \`rejects an empty basket\`

        New teammates read tests to see how a function is meant to be called. And when you return to your own code in six months, the tests tell you what you promised it would do.` },

    { kind: 'layers', title: 'The testing pyramid',
      body: 'Tests come in sizes. The classic picture (from Mike Cohn) stacks them by how many you should have. Widest at the bottom.',
      layers: [
        { label: 'End-to-end (few)', note: 'Drive the whole app like a user. Slowest, most fragile, most realistic.', tone: 'bad', icon: '🌐' },
        { label: 'Integration (some)', note: 'Check that pieces work together: code plus a real database, service plus service.', tone: 'warn', icon: '🔗' },
        { label: 'Unit (many)', note: 'Check one small piece on its own. Milliseconds each, easy to diagnose.', tone: 'good', icon: '🧱' }
      ] },

    { kind: 'compare', title: 'Cost and speed at each level',
      body: 'Why a pyramid and not three equal blocks? Because the levels trade realism against speed and cost.',
      cols: ['Unit', 'Integration', 'End-to-end'],
      rows: [
        ['Speed', 'Milliseconds', 'Seconds', 'Many seconds to minutes'],
        ['Setup', 'Almost none', 'A database or service', 'Whole app, browser, test data'],
        ['When it fails', 'Points at one function', 'Points at a boundary', 'Could be anywhere'],
        ['Flakiness', 'Rare', 'Occasional', 'Common'],
        ['Realism', 'Low', 'Medium', 'High']
      ],
      note: 'Some teams prefer a "trophy" (mostly integration tests) or a "honeycomb" for microservices. The shared idea: **more fast, focused tests; fewer slow, broad ones**. The exact shape is debated.' },

    { kind: 'pitfall', title: 'The ice-cream cone',
      body: `The pyramid upside-down is a known disaster, nicknamed the **ice-cream cone**: a few unit tests, and a huge pile of slow end-to-end tests driven through the browser.

        It happens naturally, because "click through the site" is how people already check things. But the suite takes an hour, fails randomly, and when it fails nobody knows *why*. Soon people re-run it until it goes green, then ignore it.

        The fix is to push each check **down** to the cheapest level that can still catch the bug. Can a unit test prove the discount maths? Then do not drive a browser to prove it.` },

    { kind: 'tip', title: 'What not to test',
      body: `Tests cost time to write and to maintain, so spend them where bugs would hurt. You can usually skip:

        - **Other people's code.** Do not test that the database library saves a row. Test *your* use of it.
        - **Trivial code**, such as a getter that returns a field.
        - **Implementation details**, such as which private helper was called. Test *what* the code does, not *how*, or every refactor breaks your tests.
        - **Throwaway scripts** you will delete tomorrow.

        Test hardest where code is **complicated, valuable or often changed**: money, permissions, tricky rules.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'You fix a bug in a shared function and all 300 tests still pass. What have you actually learned?',
      options: ['The behaviour the tests cover is probably unchanged; untested behaviour is still unknown', 'Nothing else in the system can possibly be broken', 'The function is now free of all bugs', 'The tests are well written, whatever they check'],
      answer: 0,
      why: [null, 'Tests only check what someone thought to write down.', 'Passing tests do not prove the absence of bugs, only that these checks did not find any.', 'Passing says nothing about their quality: a test that checks nothing also passes.'],
      explain: 'Green means "none of the checks we wrote caught a problem". That is valuable, but it is a net with holes, not a guarantee.' },

    { type: 'tf', after: 4, statement: 'A test that describes behaviour in plain sentences, like "ignores unknown codes", can serve as documentation.', answer: true,
      explain: 'Unlike comments, tests are run constantly, so they fail the moment they stop being true. That makes them documentation you can trust.' },

    { type: 'order', after: 6, prompt: 'Order the levels of the pyramid from fastest and cheapest to slowest and most realistic.',
      items: ['Unit tests', 'Integration tests', 'End-to-end tests'],
      explain: 'Each step up involves more real parts. That makes it more realistic but slower, costlier to set up and harder to diagnose.' },

    { type: 'match', prompt: 'Match each phrase to the idea it describes.',
      pairs: [['Test suite', 'A collection of automated tests run together'], ['Failing test (red)', 'The code does not do what the test expected'], ['Refactoring', 'Reshaping code without changing what it does'], ['Ice-cream cone', 'Few unit tests, a pile of slow end-to-end ones'], ['Safety net', 'Lets you change code and find out fast if you broke it']] },

    { type: 'bucket', prompt: 'Which level of the pyramid is the cheapest place to catch each bug?', buckets: ['Unit', 'Integration', 'End-to-end'],
      items: [['The discount maths rounds the wrong way', 0], ['A date-formatting helper shows the wrong month', 0], ['The SQL query for orders returns no rows because of a typo in a column name', 1], ['The service saves a user, but the real database rejects the data', 1], ['The Pay button does nothing in the checkout page', 2], ['Search, add to basket and pay do not work as one journey', 2]],
      explain: 'Choose the lowest level that still *sees* the bug. Pure logic needs no database. A database mismatch needs the real database. A broken journey across pages needs the whole app.' },

    { type: 'spot', prompt: 'This test will break every time someone tidies the code, even when the behaviour is unchanged. Tap the line that couples it to the implementation.',
      code: { lang: 'js', src: `
        test('totals the basket', () => {
          const spy = jest.spyOn(basket, '_sumPrices');
          const total = basket.total([10, 20]);
          expect(spy).toHaveBeenCalledTimes(1);
          expect(total).toBe(30);
        });` },
      lines: [4],
      explain: 'Line 4 asserts that a private helper was called once. Rename or inline that helper and the test fails although the basket still works. The test on line 5 states the real promise: the total.' },

    { type: 'multi', q: 'Which of these are good uses of your limited testing time?',
      options: ['Money calculations such as tax and refunds', 'A permission check deciding who may delete an account', 'That the database library really saves a row when told to', 'A getter that just returns a stored field', 'A tricky rule that changes often, such as delivery pricing'],
      answers: [0, 1, 4],
      explain: 'Test where code is complicated, valuable or often changed. Library behaviour is the library authors’ job, and trivial getters cannot meaningfully break.' },

    { type: 'scenario', title: 'The two-hour test suite', intro: 'Your team’s test suite takes two hours. It has 12 unit tests and 400 browser-driven end-to-end tests. Developers have started merging without waiting for it.',
      meters: { 'team speed': 40, 'bug safety': 50 },
      steps: [
        { text: 'The lead asks what shape this suite is, and what to do first.',
          choices: [
            { label: 'It is an ice-cream cone: push checks down to unit and integration level', score: 2, effects: { 'team speed': 25, 'bug safety': 10 }, feedback: 'Exactly. Each check moves to the cheapest level that still catches the bug, so feedback arrives in minutes rather than hours.' },
            { label: 'Buy faster servers so the 400 browser tests run quicker', score: 1, effects: { 'team speed': 10 }, feedback: 'It helps a bit, but the shape is still wrong. The tests stay flaky and hard to diagnose; you have just made the slow thing less slow.' },
            { label: 'Delete the end-to-end tests entirely', score: 0, effects: { 'team speed': 15, 'bug safety': -25 }, feedback: 'Fast, but now nothing proves a user can actually complete a purchase. A few end-to-end tests earn their place at the top.' }
          ] },
        { text: 'You look at one end-to-end test: it opens the site, logs in, and checks that a 10% code takes £10 off a £100 basket. How would you test the maths?',
          choices: [
            { label: 'A unit test calling the discount function with 100 and the code', score: 2, effects: { 'team speed': 15, 'bug safety': 10 }, feedback: 'A millisecond test checks the exact rule. Keep one end-to-end check that the discount box is wired up, not every percentage.' },
            { label: 'Keep it as an end-to-end test, but add ten more for other percentages', score: 0, effects: { 'team speed': -15 }, feedback: 'More slow tests for a pure calculation. Every one is a minute you wait and a chance for random browser failures.' },
            { label: 'An integration test that boots the whole database for it', score: 1, effects: { 'team speed': -5 }, feedback: 'Better than a browser, but the maths needs no database at all. Choose the lowest level that can see the bug.' }
          ] }
      ],
      outro: 'The healthy answer is a pyramid: lots of quick unit tests for rules, some integration tests for boundaries, and a small number of end-to-end tests for key journeys.' },

    { type: 'explain', prompt: 'A colleague says: "We have no time for tests; we are too busy fixing bugs." Respond in your own words.',
      model: 'Tests are what stop us fixing the same bugs repeatedly. They act as a safety net so we can change code and learn straight away if we broke something, and they document how the code should behave. The time we spend fixing regressions and hand-checking every change is usually larger than the time tests take to write. We do not need to test everything: just the complicated, valuable and frequently changing parts, at the cheapest level that catches the bug.',
      keywords: ['safety net', 'regression', 'document', 'change', 'cheapest', 'pyramid', 'valuable'] }
  ],

  flashcards: [
    { q: 'Why write automated tests?', a: 'They let you change code and learn within seconds whether you broke something, and they document how the code should behave.' },
    { q: 'What are the three levels of the testing pyramid?', a: 'Many unit tests at the base, some integration tests in the middle, and few end-to-end tests at the top.' },
    { q: 'Why have fewer end-to-end tests than unit tests?', a: 'They are slow, costly to set up, fragile, and a failure does not say where the problem is.' },
    { q: 'What is the "ice-cream cone" anti-pattern?', a: 'The pyramid upside down: few unit tests and many slow end-to-end tests, giving slow, flaky feedback.' },
    { q: 'What is usually not worth testing?', a: 'Third-party library internals, trivial code and implementation details that change when you refactor.' }
  ],

  glossary: [
    { term: 'Automated test', def: 'A small program that runs part of your code and checks that the result matches what you expected.', like: 'A robot inspector that checks the same list every time, without getting bored.' },
    { term: 'Test suite', def: 'A collection of automated tests that you run together. All passing is "green"; any failure is "red".', like: 'The whole checklist on the inspector’s clipboard.' },
    { term: 'Regression', def: 'A bug where something that used to work stops working after a change.', like: 'A repaired tap that starts leaking again after the plumber fixes the sink.' },
    { term: 'Testing pyramid', def: 'A guide to balancing tests: many fast unit tests, fewer integration tests and very few end-to-end tests.', like: 'A building: a broad solid base and a small, expensive penthouse.' },
    { term: 'Refactoring', def: 'Changing the structure of code without changing what it does. Tests tell you if you accidentally changed the behaviour.', like: 'Reorganising a kitchen without changing what meals you can cook.' }
  ],

  takeaways: [
    'Tests are a **safety net**: they tell you fast whether a change broke something, and they document behaviour.',
    'The pyramid: **many unit, some integration, few end-to-end**. Lower is faster, cheaper and easier to diagnose.',
    'Push each check to the **cheapest level** that can still catch the bug.',
    'Test what is complicated, valuable or changing, and test behaviour rather than implementation.'
  ],

  links: [
    { label: 'Martin Fowler: The Practical Test Pyramid', url: 'https://martinfowler.com/articles/practical-test-pyramid.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('test-unit', {
  eli5: 'A unit test runs one small piece of code on its own, feeds it known input and checks the answer, using stand-in fakes for anything slow or unpredictable.',

  cards: [
    { kind: 'concept', title: 'One small piece, on its own',
      body: `A **unit** is a small piece of code with a clear job: a function that works out VAT, a class that validates an email address.

        A **unit test** runs that one piece **in isolation** and checks what it does. No database, no network, no clock, no other team's service. Just your code, some input, and an expected answer.

        Isolation is the whole point. When a unit test fails, only one small thing could be to blame, so you know where to look. It also makes the test fast: thousands can run in a few seconds.

        The question is always: given *this* input, does this piece give *that* output?` },

    { kind: 'metaphor', title: 'Testing a car part on the bench',
      body: `A mechanic doubts the alternator. They do not drive the car round the ring road; they take the part out, clamp it to a **bench**, spin it up and read a meter.

        If the meter is wrong, the alternator is faulty. There is nothing else on the bench that could be at fault.

        A unit test is that bench. You hold one part still, apply a known input and read the output.

        Where the metaphor stops: a part that passes on the bench can still fail once it is bolted into the car. That is why you also need **integration tests**, which come next.` },

    { kind: 'steps', title: 'Arrange, Act, Assert',
      body: 'Nearly every good unit test has the same three-beat rhythm. It is called **Arrange–Act–Assert** (or AAA).',
      steps: [
        { title: 'Arrange', body: 'Set the scene: create the object, prepare the input, set up any stand-ins.' },
        { title: 'Act', body: 'Do the one thing you are testing: call the function or method. Usually a single line.' },
        { title: 'Assert', body: 'Check the result is what you expected. If it is not, the test fails.' },
        { title: 'Keep the beats separate', body: 'A blank line between them makes a test readable at a glance. If you find yourself writing Act, Assert, Act, Assert, you probably have two tests.' }
      ] },

    { kind: 'code', title: 'AAA in code',
      body: 'A test for a function that decides whether a user can buy an age-restricted item. **Tap the lines.**',
      code: { lang: 'js', src: `
        test('refuses under-18s', () => {
          // Arrange
          const user = { name: 'Sam', age: 16 };

          // Act
          const result = canBuyKnife(user);

          // Assert
          expect(result).toBe(false);
        });`,
        notes: {
          3: '**Arrange**: a plain object stands in for a user. No database lookup needed.',
          6: '**Act**: one call to the code under test.',
          9: '**Assert**: the single outcome we care about. The test name says it in words.'
        } } },

    { kind: 'concept', title: 'The problem: code that touches the world',
      body: `Real code rarely lives alone. A \`checkout\` function might charge a card, send an email and read the clock. Run those in a unit test and it becomes slow, costs money, spams people and gives different answers at different times.

        So we **swap the awkward collaborators for stand-ins**, called **test doubles** (like a stunt double in a film: it looks like the real actor from a distance, but does the dangerous part for them).

        There are four main kinds, and people mix up the names constantly. Precision helps, so here they are, one at a time.` },

    { kind: 'compare', title: 'Stub, mock, fake, spy',
      body: 'Four kinds of test double, defined by what job they do.',
      cols: ['What it does', 'Example'],
      rows: [
        ['Stub', 'Returns **canned answers** so the code under test can carry on', 'A rate service that always says 1.2'],
        ['Mock', 'Is told what calls to **expect**, and fails the test if they do not happen', 'Expect \`sendEmail("sam@x.com")\` exactly once'],
        ['Fake', 'A **simplified working version** of the real thing', 'An in-memory database that is just a JavaScript object'],
        ['Spy', 'The real thing (or a stub) that **records** how it was called, so you can check afterwards', 'Records every argument passed to \`log()\`']
      ],
      note: 'Official-sounding definitions differ slightly between authors (Gerard Meszaros named most of these), and tools like Jest call everything a "mock". What matters is the idea: stubs feed **in**, mocks and spies check what went **out**, fakes are cheap stand-ins that really work.' },

    { kind: 'code', title: 'Doubles in a real test',
      body: 'A stub and a spy working together. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        test('emails a receipt after paying', () => {
          const gateway = { charge: () => ({ ok: true }) };
          const mailer = { send: jest.fn() };
          const checkout = new Checkout(gateway, mailer);

          checkout.pay({ email: 'sam@x.com', total: 30 });

          expect(mailer.send).toHaveBeenCalledWith('sam@x.com');
        });`,
        notes: {
          2: 'A **stub**: it never contacts a bank, it just answers "ok". The test controls the payment result.',
          3: '`jest.fn()` makes a function that records its calls: a **spy** (Jest calls it a mock).',
          4: 'The doubles are handed in through the constructor. That makes them swappable; the last lesson in this module is about designing for that.',
          8: 'We check the **outcome that matters**: the receipt went to the right address. No real email was sent.'
        } } },

    { kind: 'concept', title: 'What makes a good unit test',
      body: `Good tests share a few habits. Developers remember them as **FIRST**:

        - **Fast**: milliseconds, so you run them constantly.
        - **Isolated**: no test depends on another, or on the order they run in.
        - **Repeatable**: the same result every time, on every machine. No real clock, no randomness.
        - **Self-checking**: pass or fail, with no human reading output.
        - **Timely**: written close to the code, not months later.

        And a test should check **one behaviour**, with a name that reads as a sentence: \`refuses under-18s\`, not \`test1\`.` },

    { kind: 'pitfall', title: 'Over-mocking',
      body: `Doubles are useful, and addictive. Once you start, it is tempting to mock *everything*, including your own classes.

        You end up with tests that say "when \`A\` calls \`B\` then \`C\` with these exact arguments..." That is a replay of the implementation, not a check of behaviour. Change how the code works internally, even to improve it, and every test breaks. Worse, the test can pass while the real pieces would not fit together at all.

        Rules of thumb: **double the slow, costly or unpredictable edges** (network, clock, payments), but use real objects for your own plain logic. If a test has more mock set-up than actual checking, it is a smell.` }
  ],

  activities: [
    { type: 'match', after: 5, prompt: 'Match each test double to the job it does.',
      pairs: [['Stub', 'Returns canned answers'], ['Mock', 'Fails if the expected calls do not happen'], ['Fake', 'A simple but genuinely working substitute'], ['Spy', 'Records how it was called so you can check later']] },

    { type: 'order', after: 3, prompt: 'Put the three parts of a unit test in order.',
      items: ['Arrange: set up the input and the objects', 'Act: call the code under test', 'Assert: check the result'],
      explain: 'You cannot call the code until it is set up, and you cannot check a result that does not exist yet. Most tests are just these three beats.' },

    { type: 'mcq', q: 'A function sends a confirmation email. You want a unit test that checks the email would be sent to the right address, without really sending it. Which double fits best?',
      options: ['A spy or mock on the mailer, to see what it was asked to send', 'A stub that returns the number 1 for every call', 'A fake that downloads real emails from a server', 'No double: send a real email to your own address'],
      answer: 0,
      why: [null, 'A stub supplies answers; it does not tell you what the code sent.', 'A fake should be simpler than the real thing, not a second real dependency.', 'That test is slow, needs the network and fails when the mail server is down.'],
      explain: 'You care about what went *out* of your code, which is exactly what spies and mocks record. A stub is for feeding answers *in*.' },

    { type: 'ab', q: 'Which version of this test is the better unit test?',
      a: { lang: 'js', label: 'Uses the real clock', src: `
        test('greets in the morning', () => {
          expect(greeting()).toBe('Good morning');
        });` },
      b: { lang: 'js', label: 'Controls the time', src: `
        test('greets in the morning', () => {
          const at9am = () => new Date('2025-01-01T09:00:00');
          expect(greeting(at9am)).toBe('Good morning');
        });` },
      answer: 'b',
      explain: 'The first passes before noon and fails after it. A test must be **repeatable**, so the awkward input (time) is passed in and controlled. The same trick works for randomness and for the network.' },

    { type: 'spot', prompt: 'This test has two problems that make it brittle. Tap the line that breaks the "check one behaviour" rule most clearly.',
      code: { lang: 'js', src: `
        test('order works', () => {
          const order = new Order(db);
          order.add('tea', 2);
          expect(order.total()).toBe(4);
          order.add('cake', 1);
          expect(order.total()).toBe(7);
          order.remove('tea');
          expect(order.items().length).toBe(1);
        });` },
      lines: [5, 7],
      explain: 'This test checks adding, totalling and removing in one go, and the vague name hides it. When it fails you do not know which behaviour broke. Split it into focused tests such as "totals added items" and "removal drops the item".' },

    { type: 'bucket', prompt: 'Which kind of double would you reach for?', buckets: ['Stub', 'Mock or spy', 'Fake'],
      items: [['A weather service that must always say "sunny"', 0], ['An exchange-rate lookup that must return 1.25', 0], ['Check that an audit log was written once with the right user', 1], ['Check the payment gateway was never called when the basket is empty', 1], ['A user repository kept in a plain array, with save and find that really work', 2], ['An in-memory key-value store used instead of the real database', 2]],
      explain: 'Stubs feed fixed answers in. Mocks and spies verify calls that went out. Fakes are small working versions, handy when your code genuinely reads back what it saved.' },

    { type: 'tf', statement: 'A unit test that mocks every one of the class’s collaborators and checks the exact order of calls is a strong test, because it verifies the code precisely.', answer: false,
      explain: 'It verifies the implementation, not the behaviour. A harmless refactor breaks it, and it can pass while the real pieces would not work together. That is over-mocking.' },

    { type: 'cloze', text: 'A good unit test is {{isolated}} from other tests, {{fast}} to run, and {{repeatable}}, giving the same result every time. It often swaps a slow network call for a {{stub}}.',
      distractors: ['random', 'manual', 'mock database cluster'],
      explain: 'Fast, isolated and repeatable are the heart of FIRST. A test that depends on luck, the clock or a person is not one you can trust.' },

    { type: 'short', q: 'In Arrange–Act–Assert, what is the name of the step where you check the result?', accept: ['assert'], hint: 'It is the last of the three words.',
      explain: 'Assert compares what happened with what you expected, and fails the test if they differ.' }
  ],

  flashcards: [
    { q: 'What does Arrange–Act–Assert mean?', a: 'Set up input and objects, call the code under test, then check the result. Every test follows those three beats.' },
    { q: 'What is a stub?', a: 'A test double that returns canned answers so the code under test can carry on.' },
    { q: 'What is the difference between a mock and a stub?', a: 'A stub feeds answers in; a mock expects certain calls and fails the test if they do not happen.' },
    { q: 'What is a fake?', a: 'A simplified but genuinely working substitute, such as an in-memory database.' },
    { q: 'What does FIRST stand for?', a: 'Fast, Isolated, Repeatable, Self-checking, Timely.' },
    { q: 'What is over-mocking?', a: 'Mocking so much that tests replay the implementation, breaking on harmless refactors while proving little about real behaviour.' }
  ],

  glossary: [
    { term: 'Unit test', def: 'A test that runs one small piece of code in isolation and checks its result.', like: 'Testing a car part on the bench instead of on the motorway.' },
    { term: 'Test double', def: 'A stand-in used in a test instead of a real collaborator. The family includes stubs, mocks, fakes and spies.', like: 'A stunt double: looks like the actor, takes the risks.' },
    { term: 'Stub', def: 'A test double that returns fixed, canned answers.', like: 'An answering machine that always plays the same message.' },
    { term: 'Mock', def: 'A test double that you tell what calls to expect; the test fails if they do not happen.', like: 'A bouncer with a guest list who complains if someone is missing.' },
    { term: 'Fake', def: 'A simplified working implementation of a dependency, such as an in-memory database.', like: 'A flight simulator: it really flies, but not for real.' },
    { term: 'Spy', def: 'A double that records how it was called so the test can inspect it afterwards.', like: 'A security camera: it does not stop anything, it keeps a record.' }
  ],

  takeaways: [
    'A unit test checks **one small piece in isolation**: fast, and when it fails you know where.',
    'Shape every test as **Arrange, Act, Assert** and name it as a sentence about behaviour.',
    '**Stubs** feed answers in; **mocks and spies** check what went out; **fakes** are working stand-ins.',
    'Double the slow and unpredictable edges, not your own logic: **over-mocking** makes brittle, hollow tests.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('test-integration', {
  eli5: 'Integration tests check that pieces which each work alone also work when plugged together, such as your code talking to a real database.',

  cards: [
    { kind: 'story', title: 'Every part passed, the whole failed',
      body: `A team builds a user-signup feature. The \`UserService\` has lovely unit tests, all green. The \`UserRepository\` that saves users has unit tests too, with the database stubbed out. All green.

        They deploy. Every signup fails.

        The repository's SQL says \`INSERT INTO users (full_name) ...\`. The real table's column is called \`name\`. No unit test could notice: the database was always a stand-in that said "sure, saved".

        Each part was right **about itself**. They were wrong **about each other**. That gap, between pieces, is where integration tests live.` },

    { kind: 'concept', title: 'Testing the joins between pieces',
      body: `An **integration test** runs two or more real pieces **together** and checks that they cooperate. The usual kinds:

        - **Your code + a real database**: does the SQL match the schema? Does saving then loading give the same data?
        - **Your code + a real message queue or cache.**
        - **Your service + another service**, calling over HTTP.

        Unlike a unit test, you do **not** swap out the thing you are integrating with. That is the point: you want to find out if the real one behaves the way you assumed.

        They are slower than unit tests (they start things up and talk over real connections), so you write fewer of them: the middle of the pyramid.` },

    { kind: 'metaphor', title: 'The orchestra rehearsal',
      body: `Every musician can practise their part perfectly alone. That is the unit test.

        But at the first rehearsal the violins are in a different key from the brass, or two sections start at different bars. Nobody was *wrong* in their own practice room.

        An integration test is the rehearsal: parts that were each fine now have to **fit**. Most of what goes wrong is at the handovers: different assumptions about names, formats, order or timing.

        You do not need a full concert (end-to-end) to find a clashing key. Two sections playing together will do.` },

    { kind: 'code', title: 'A test with a real database',
      body: 'This test saves a user to a real (test) database and reads it back. **Tap the lines.**',
      code: { lang: 'js', src: `
        let db, repo;

        beforeAll(async () => {
          db = await connectToTestDatabase();
          repo = new UserRepository(db);
        });

        beforeEach(() => db.query('DELETE FROM users'));

        test('saves and loads a user', async () => {
          await repo.save({ name: 'Sam', email: 'sam@x.com' });
          const found = await repo.findByEmail('sam@x.com');
          expect(found.name).toBe('Sam');
        });`,
        notes: {
          4: 'Runs once before the tests: connect to a **real database**, set aside for testing. Never your live one.',
          8: 'Runs before **every** test and empties the table, so each test starts from a clean slate and cannot be affected by the one before.',
          12: 'The real SQL runs against the real schema. A wrong column name would fail here.',
          13: 'Reading back proves the round trip. A unit test with a stub could never prove this.'
        } } },

    { kind: 'concept', title: 'Real dependencies, in containers',
      body: `"Use a real database" used to mean everyone installing one by hand, in slightly different versions, with leftover data. Painful.

        The modern trick is to run it in a **container**: a small, throwaway, pre-packaged environment. Your test setup asks a tool such as Docker (Testcontainers is a popular library for this) to start a fresh Postgres, runs the tests against it, then throws it away.

        Everyone, including the CI server, gets the **same version**, with **no leftover state**. It takes seconds to start.

        The trade-off is speed, which is why you do not boot a database for every tiny rule. (Containers themselves have their own module later.)`,
      note: 'A faster alternative for simple cases is an in-memory fake database. It is quick, but it may behave subtly differently from the real engine, so it can hide the very bugs you are hunting.' },

    { kind: 'sequence', title: 'Where contract tests fit',
      body: 'Two services, built by two teams. How do you know the Orders service and the Users service still agree, without running both for every test?',
      actors: ['Orders (consumer)', 'Contract', 'Users (provider)'],
      steps: [
        { from: 0, to: 1, label: 'I expect GET /users/7 → {id, email}', note: 'The team that **uses** the API writes down what they rely on: field names and types.' },
        { from: 1, to: 0, label: 'Orders tests use this as a stub', dashed: true, note: 'Orders’ own tests run against a stand-in built from the contract: fast, and no real Users service needed.' },
        { from: 1, to: 2, label: 'replay the expectations', note: 'The same contract is **replayed against the real Users service** in its own build.' },
        { from: 2, to: 1, label: 'email field renamed → FAIL', dashed: true, note: 'If the Users team renames a field Orders relies on, **their** build fails, before anything ships.' },
        { note: 'This is a **contract test**. A well-known tool for it is Pact. It catches broken agreements between services without a full test environment.' }
      ] },

    { kind: 'compare', title: 'What each level can and cannot catch',
      body: 'The same bug can slip through one level and be obvious at another.',
      cols: ['Unit test catches it?', 'Integration test catches it?'],
      rows: [
        ['Wrong column name in SQL', 'No: the database was stubbed', 'Yes'],
        ['Off-by-one in a price calculation', 'Yes', 'Yes, but slowly'],
        ['A JSON field renamed by another service', 'No: the stub is out of date', 'Yes (or a contract test)'],
        ['Missing database index causing timeouts', 'No', 'Sometimes'],
        ['Transaction rolled back halfway', 'No', 'Yes']
      ] },

    { kind: 'pitfall', title: 'Shared state and slow suites',
      body: `Integration tests go wrong in two classic ways.

        **Tests that share data.** Test A creates "Sam", test B assumes there is no Sam, and now B passes or fails depending on run order. Fix: give each test a clean slate (empty the tables before each test, or wrap each in a transaction you roll back), and never rely on another test having run first.

        **Doing everything through the slow path.** If you test every edge case of a price calculation through the database, a suite of 200 cases takes minutes. Test the rules in **unit** tests, and use integration tests only for the *joins*: does it save, load, query and fail properly?` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Two classes each pass their unit tests, but the app crashes when they are used together. What kind of test would most directly have caught it?',
      options: ['An integration test running both real classes together', 'More unit tests with extra stubs', 'A test that only checks the code compiles', 'A load test with thousands of users'],
      answer: 0,
      why: [null, 'More stubs just repeat the same assumption that turned out to be wrong.', 'It compiled; the problem is in how the pieces behave together.', 'The failure appears with one user, so volume is not the issue.'],
      explain: 'The fault lives in the gap between the parts: each is right about itself and wrong about the other. Only running the real pieces together can expose that.' },

    { type: 'tf', after: 4, statement: 'Running a throwaway database in a container for each test run gives every developer and the CI server the same version with no leftover data.', answer: true,
      explain: 'That is the appeal. A fresh container is the same everywhere and is discarded afterwards, which removes "works on my machine" and stale-data problems.' },

    { type: 'order', after: 5, prompt: 'Put the life of a contract test in order.',
      items: ['The consumer writes down the requests and responses it relies on', 'Consumer tests run against a stand-in built from that contract', 'The provider’s build replays the contract against the real service', 'A breaking change makes the provider’s build fail before release'],
      explain: 'The contract starts with the consumer’s needs, is used by both sides, and turns an incompatible change into a failing build instead of a production incident.' },

    { type: 'spot', prompt: 'This integration test is flaky. Tap the line that makes it depend on other tests.',
      code: { lang: 'js', src: `
        test('creates a user', async () => {
          await repo.save({ email: 'sam@x.com' });
          expect(await repo.count()).toBe(1);
        });

        test('rejects a duplicate email', async () => {
          await repo.save({ email: 'sam@x.com' });
          await expect(repo.save({ email: 'sam@x.com' })).rejects.toThrow();
        });` },
      lines: [3],
      explain: 'The count of 1 only holds if the table was empty beforehand. Nothing cleans up between tests, so run order or leftovers from other tests change the result. Empty the table before each test.' },

    { type: 'bucket', prompt: 'Would this be a unit test or an integration test?', buckets: ['Unit', 'Integration'],
      items: [['Check a tax function with the numbers 100 and 20', 0], ['Check a discount rule using a plain object as the basket', 0], ['Save an order to a real test database and read it back', 1], ['Call your service’s real HTTP endpoint and check the JSON', 1], ['Publish a message to a real queue and see the consumer handle it', 1], ['Validate an email address format', 0]],
      explain: 'If real infrastructure (database, queue, network) is involved, it is an integration test. Pure logic with nothing external is a unit test.' },

    { type: 'ab', q: 'Which approach better protects you from a database-schema mismatch in your repository code?',
      a: { lang: 'js', label: 'Stubbed database', src: `
        const db = { query: async () => [{ id: 1 }] };
        const repo = new UserRepository(db);
        expect(await repo.find(1)).toEqual({ id: 1 });` },
      b: { lang: 'js', label: 'Real test database', src: `
        const repo = new UserRepository(testDb);
        await repo.save({ name: 'Sam' });
        expect((await repo.find(1)).name).toBe('Sam');` },
      answer: 'b',
      explain: 'The stubbed version passes whatever SQL the repository writes, because the stub never runs it. Only a real database can say the query and the schema agree.' },

    { type: 'multi', q: 'Which problems can an integration test catch that a stubbed unit test cannot?',
      options: ['SQL referring to a column that does not exist', 'A JSON field renamed by another service', 'A rounding mistake in pure arithmetic', 'A database constraint rejecting data your code produced', 'An incorrect variable name in a pure function'],
      answers: [0, 1, 3],
      explain: 'Integration tests expose mismatches at the boundaries: schemas, formats and constraints. Pure logic mistakes are found cheaper by unit tests.' },

    { type: 'scenario', title: 'The slow integration suite', intro: 'Your integration suite takes 25 minutes. Most of it tests 150 edge cases of a shipping-cost calculator through a real database. Developers have stopped running it.',
      meters: { 'feedback speed': 30, 'confidence': 60 },
      steps: [
        { text: 'Where would you start?',
          choices: [
            { label: 'Move the 150 calculator cases into fast unit tests; keep a couple of integration tests for saving and loading', score: 2, effects: { 'feedback speed': 40, 'confidence': 10 }, feedback: 'The rules need no database to be proved, so they run in milliseconds. The few integration tests that remain check the joins, which is their real job.' },
            { label: 'Replace the real database with a stub everywhere', score: 0, effects: { 'feedback speed': 30, 'confidence': -30 }, feedback: 'Fast, but you have thrown away the thing integration tests exist for. The SQL-versus-schema bugs are back.' },
            { label: 'Run the suite only once a week', score: 0, effects: { 'feedback speed': -10, 'confidence': -20 }, feedback: 'Now a bug can hide for days and the culprit change is hard to find. Slow feedback is a symptom to fix, not to hide.' }
          ] },
        { text: 'Tests sometimes fail only when run together, passing alone. What is the likely cause, and the fix?',
          choices: [
            { label: 'Shared data between tests; reset the tables before each test', score: 2, effects: { 'confidence': 20 }, feedback: 'Order-dependent failures nearly always mean leftover state. A clean slate per test makes each one independent.' },
            { label: 'The database is haunted; add automatic retries until they pass', score: 0, effects: { 'confidence': -15 }, feedback: 'Retries hide the real problem and teach everyone to distrust red builds. Find the shared state instead.' },
            { label: 'Delete the failing tests', score: 0, effects: { 'confidence': -25 }, feedback: 'The failure is telling you something true: your tests are not independent. Deleting them loses the net as well.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain to a teammate why every unit test can pass and the app can still not work, and what you would add.',
      model: 'Unit tests check each piece in isolation, usually with stand-ins for the things it talks to, so they never test the real connections between pieces. If my SQL does not match the real schema, or one service renames a field another relies on, every unit test can still pass. Integration tests run the real pieces together, for example my code against a real database in a container, and contract tests check two services agree. I would add a few of those, kept few because they are slower.',
      keywords: ['isolation', 'real', 'together', 'database', 'contract', 'boundaries', 'slower'] }
  ],

  flashcards: [
    { q: 'What is an integration test?', a: 'A test that runs two or more real pieces together, such as your code and a database, to check they work as a whole.' },
    { q: 'Name something integration tests catch that unit tests with stubs cannot.', a: 'Mismatches at boundaries: SQL that does not match the schema, renamed JSON fields, database constraints, transaction problems.' },
    { q: 'Why run integration-test dependencies in containers?', a: 'Each run gets a fresh, identical copy (such as a specific Postgres version) with no leftover data, on any machine.' },
    { q: 'What is a contract test?', a: 'A test that checks a consumer and a provider still agree on the shape of an API, replaying the consumer’s expectations against the provider.' },
    { q: 'Why must integration tests not share data?', a: 'Tests that depend on leftovers or run order become flaky. Each should start from a clean state.' }
  ],

  glossary: [
    { term: 'Integration test', def: 'A test that runs several real components together to check they cooperate, such as application code with a real database.', like: 'The orchestra rehearsal after everyone has practised alone.' },
    { term: 'Test database', def: 'A real database used only for tests, reset to a known state so tests are repeatable.', like: 'A practice kitchen where you can make a mess.' },
    { term: 'Testcontainers', def: 'A family of libraries that start throwaway containers (databases, queues) from inside your test code.', like: 'Renting a fresh workshop for each job and returning it afterwards.' },
    { term: 'Contract test', def: 'A test that records what a consumer expects of a provider’s API, then checks the provider still meets it.', like: 'A written agreement both sides check themselves against.', aka: ['consumer-driven contract'] }
  ],

  takeaways: [
    'Integration tests check the **gaps between pieces**: code with a real database, queue or other service.',
    'Use a **throwaway container** for realistic, repeatable dependencies; reset state for every test.',
    '**Contract tests** let two teams’ services check they still agree, without a full test environment.',
    'Keep them **few and focused on joins**; test rules in unit tests.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('test-functional', {
  eli5: 'Functional and end-to-end tests act like a real user clicking through your product, to prove the whole thing delivers what was promised.',

  cards: [
    { kind: 'concept', title: 'Testing from the user’s side',
      body: `Unit and integration tests look at the **inside**: functions, databases, services. A **functional test** looks from the **outside** and asks: *does the product do what a user was promised?*

        It does not care how the code is organised. It cares about outcomes: "if I add a red hoodie to the basket and pay, I get an order confirmation."

        The most thorough kind is the **end-to-end test** (E2E): it drives the real system through its real front door, usually a browser, from the first click to the final result, with every layer involved.

        Because it touches everything, it is the closest a test gets to "would this really work for a customer?"` },

    { kind: 'metaphor', title: 'The mystery shopper',
      body: `Shops send in a **mystery shopper**: someone who walks in as an ordinary customer and tries to buy something. They do not inspect the stockroom or the till wiring. They just check the *experience* works: could they find it, pay, and leave with it?

        An end-to-end test is a robot mystery shopper for your website. It cannot tell you *which* shelf is wrongly labelled, but it can tell you the customer's journey is broken.

        That is its strength and its weakness: it sees the whole picture, but a failure only says "something, somewhere, is wrong".` },

    { kind: 'concept', title: 'Acceptance criteria: what "done" means',
      body: `Before anyone writes code or tests, a feature needs a clear definition of success. **Acceptance criteria** are specific, checkable statements agreed between the team and whoever asked for the feature.

        Vague: "Users can reset their password."

        Checkable:

        - Entering a registered email sends a reset link within a minute.
        - The link works once and expires after an hour.
        - An unknown email shows the same message, so nobody can discover who has an account.

        Each criterion maps naturally onto a functional test. If you cannot state how you would check it, the requirement is not clear enough yet.` },

    { kind: 'code', title: 'An end-to-end test',
      body: 'This test uses a browser-driving tool (Playwright and Cypress are two popular ones). **Tap the lines.**',
      code: { lang: 'js', src: `
        test('a customer can buy a hoodie', async ({ page }) => {
          await page.goto('https://staging.shop.example/');
          await page.getByRole('link', { name: 'Red hoodie' }).click();
          await page.getByRole('button', { name: 'Add to basket' }).click();
          await page.getByRole('link', { name: 'Checkout' }).click();
          await page.getByLabel('Card number').fill('4242 4242 4242 4242');
          await page.getByRole('button', { name: 'Pay' }).click();

          await expect(page.getByText('Order confirmed')).toBeVisible();
        });`,
        notes: {
          2: 'A real browser opens a real (test) copy of the site: **staging**, never production.',
          3: 'It finds things the way a user does: by visible words and roles, not by internal code names. That keeps tests stable when the design is tweaked.',
          6: 'A **test** card number, supplied by payment providers for testing. Real money never moves.',
          9: 'The assertion is the user-visible outcome. Everything underneath (web server, database, payments sandbox) had to work for this to pass.'
        } } },

    { kind: 'compare', title: 'Smoke, end-to-end and regression',
      body: 'These names describe **why** or **how widely** you test, and they overlap.',
      cols: ['Question it asks', 'Size and timing'],
      rows: [
        ['Smoke test', 'Is it basically alive? Does the app start, can I log in, does the home page load?', 'A handful of checks, run after every deployment'],
        ['End-to-end test', 'Does a whole user journey work through every layer?', 'A few key journeys, run before release'],
        ['Regression test', 'Did we break something that used to work?', 'Any test kept because a bug once got through']
      ],
      note: 'The name "smoke test" comes from hardware: switch the new board on and see if smoke comes out. A good habit: when you fix a bug, first write a test that **fails because of it**, then fix it. Now that bug can never silently return.' },

    { kind: 'story', title: 'The test that fails on Tuesdays',
      body: `A team has an end-to-end test that fails about one run in ten. A re-run turns it green, so everyone shrugs and clicks "retry".

        A new bug ships. The suite goes red. Everyone assumes it is the flaky test again, and re-runs it twice. By the time anyone looks, the bug has been live for a day.

        This is the real cost of a **flaky test**: one that sometimes passes and sometimes fails **with no code change**. It does not just waste time; it **teaches the team to ignore red**, which destroys the one signal tests exist to give.` },

    { kind: 'steps', title: 'Taming flakiness',
      body: 'Flaky tests have a few usual suspects. Work down this list.',
      steps: [
        { title: 'Never sleep for a fixed time', body: '`wait 2 seconds` is a guess: too short on a slow day, wasteful on a fast one. Wait for the **condition** instead ("wait until the confirmation text appears").' },
        { title: 'Give each test its own data', body: 'If two tests fight over the same user or order, the result depends on timing. Create fresh data per test and clean up.' },
        { title: 'Control the uncontrollable', body: 'Fix the clock, seed the randomness, and stub third parties you do not own (a real payment provider’s sandbox may be slow or down).' },
        { title: 'Use stable locators', body: 'Find elements by role, label or a dedicated test id, not by fragile position like "the third div".' },
        { title: 'Quarantine, then fix or delete', body: 'Move a flaky test out of the main suite so it stops blocking, but give it an owner and a deadline. A permanent quarantine is just a graveyard.' }
      ] },

    { kind: 'pitfall', title: 'Testing too much through the UI',
      body: `Because end-to-end tests feel so reassuring, it is tempting to check *everything* through the browser: every validation message, every discount, every error.

        But each one costs seconds, may flake, and a failure points nowhere in particular. Fifty checks of one form's validation rules belong in **fast unit tests**.

        Keep E2E for the **critical journeys** that must always work: sign up, log in, find a product, pay. For anything else, ask: "could a cheaper test have caught this?"` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What most distinguishes a functional test from a unit test?',
      options: ['It checks behaviour from the user’s side, ignoring internal structure', 'It only runs after the software has gone live, on real customers', 'It tests exactly one function at a time, in complete isolation', 'It never touches a database, because that would make it slow'],
      answer: 0,
      why: [null, 'Functional tests run before release, typically against a test environment.', 'That is a unit test’s trait.', 'Functional tests often use a real database; it is part of the whole system.'],
      explain: 'A functional test asks "does the product do what was promised?" and treats the code as a black box. Unit tests look inside at small pieces.' },

    { type: 'multi', after: 2, q: 'Which of these is a testable acceptance criterion for "users can reset their password"?',
      options: ['A registered email receives a reset link within one minute', 'The reset link stops working after one hour', 'The reset process should feel nice and smooth', 'An unknown email shows the same message as a known one', 'Password reset should be user-friendly'],
      answers: [0, 1, 3],
      explain: 'Good criteria are specific enough that two people would agree whether they passed. "Smooth" and "user-friendly" are opinions, not checks.' },

    { type: 'match', after: 4, prompt: 'Match each test type to what it asks.',
      pairs: [['Smoke test', 'Is the app basically alive after deployment?'], ['End-to-end test', 'Does a full user journey work through every layer?'], ['Regression test', 'Has something that used to work broken again?'], ['Acceptance test', 'Does the feature meet the agreed criteria?']] },

    { type: 'ab', q: 'Which way of waiting makes a browser test less flaky?',
      a: { lang: 'js', label: 'Fixed pause', src: `
        await page.click('text=Pay');
        await page.waitForTimeout(3000);
        expect(await page.textContent('#status')).toBe('Paid');` },
      b: { lang: 'js', label: 'Wait for the condition', src: `
        await page.click('text=Pay');
        await expect(page.getByText('Paid')).toBeVisible();` },
      answer: 'b',
      explain: 'A fixed pause fails when the server is slow and wastes time when it is fast. Waiting until the thing you care about appears adapts to both.' },

    { type: 'bucket', prompt: 'Which kind of test is the best fit?', buckets: ['Unit', 'Integration', 'End-to-end'],
      items: [['A discount of 10% on £50 gives £45', 0], ['Email validation rejects "sam@"', 0], ['The service saves an order and the database accepts it', 1], ['A user can sign up, log in and see their dashboard', 2], ['A customer finds a product, pays and sees a confirmation page', 2], ['Another service’s API still returns the fields we use', 1]],
      explain: 'Rules belong low, boundaries in the middle, and only the complete customer journeys at the top.' },

    { type: 'tf', statement: 'If a flaky test passes when re-run, it is safe to ignore, because the real code must be fine.', answer: false,
      explain: 'Flakiness hides real failures and trains people to dismiss red builds. A test that fails without a code change has a bug of its own (timing, shared data, an unstable dependency) that needs fixing.' },

    { type: 'order', prompt: 'Put the sensible way to handle a newly reported bug in order.',
      items: ['Write a test that reproduces the bug and fails', 'Fix the code', 'Run the test and watch it pass', 'Keep the test in the suite as a regression test'],
      explain: 'A test that fails first proves it really catches the bug. Keeping it afterwards means the bug cannot quietly return.' },

    { type: 'scenario', title: 'Release-day smoke', intro: 'You deploy a new version at lunchtime. Your team has a 5-minute smoke suite and a 50-minute full end-to-end suite. Customers are on the site.',
      meters: { 'customer trust': 70, 'release speed': 60 },
      steps: [
        { text: 'The deploy has just finished. What do you run first?',
          choices: [
            { label: 'The smoke suite against production-like checks: app up, log in, home page, basket', score: 2, effects: { 'release speed': 10 }, feedback: 'In five minutes you know the basics work. If the smoke test is red you roll back before most customers notice.' },
            { label: 'Nothing; the full suite passed before the deploy', score: 1, effects: { 'customer trust': -10 }, feedback: 'The suite ran on a test environment. Production has its own configuration and could still be broken, so a quick post-deploy check matters.' },
            { label: 'Wait for the 50-minute suite to finish on production', score: 0, effects: { 'release speed': -25, 'customer trust': -10 }, feedback: 'If the app is down you are finding out an hour late. Fast, shallow checks go first.' }
          ] },
        { text: 'The smoke test shows that login fails for everyone. What now?',
          choices: [
            { label: 'Roll back to the previous version, then investigate calmly', score: 2, effects: { 'customer trust': 15 }, feedback: 'Restore service first, diagnose second. The failing check did its job.' },
            { label: 'Re-run it; it is probably flaky', score: 0, effects: { 'customer trust': -25 }, feedback: 'This is exactly how teams end up ignoring real failures. A smoke test that fails on login is a signal, not an annoyance.' },
            { label: 'Hotfix straight on production without testing', score: 0, effects: { 'customer trust': -20 }, feedback: 'A hurried untested change can make things worse. Roll back to something known to work.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain why a team should have only a few end-to-end tests, and how they would keep those few trustworthy.',
      model: 'End-to-end tests drive the whole system like a user, so they are slow, costly and their failures do not say where the fault is. They also tend to be flaky. I would keep them for the critical journeys, such as sign-up, login and paying, and test rules lower down. To keep them trustworthy I would wait on conditions instead of fixed pauses, give each test its own data, control the clock and third parties, and fix or quarantine any flaky test quickly.',
      keywords: ['slow', 'flaky', 'critical', 'journeys', 'conditions', 'data', 'quarantine'] }
  ],

  flashcards: [
    { q: 'What is a functional test?', a: 'A test that checks behaviour from the outside, as a user would see it, without caring how the code is structured.' },
    { q: 'What is an end-to-end test?', a: 'A test that drives the real, complete system through its real interface, such as a browser, across every layer.' },
    { q: 'What are acceptance criteria?', a: 'Specific, checkable statements, agreed in advance, that say when a feature counts as done.' },
    { q: 'What is a smoke test?', a: 'A tiny, fast check that the system is basically alive, such as the app starts and login works, often run after a deployment.' },
    { q: 'What is a regression test?', a: 'A test kept to ensure a past bug, or previously working behaviour, does not come back.' },
    { q: 'What is a flaky test and why is it dangerous?', a: 'One that passes or fails randomly with no code change. It teaches people to ignore failures, hiding real bugs.' }
  ],

  glossary: [
    { term: 'Functional test', def: 'A test of behaviour from the user’s side, treating the system as a black box.', like: 'A mystery shopper judging the experience, not the stockroom.' },
    { term: 'End-to-end test', def: 'A test that exercises a complete user journey through every layer of the real system.', aka: ['E2E'], like: 'Walking the whole route from front door to destination.' },
    { term: 'Acceptance criteria', def: 'The agreed, checkable conditions that a feature must meet to be considered complete.', like: 'The tick-list the customer signs off.' },
    { term: 'Smoke test', def: 'A small set of quick checks that the system is basically working.', like: 'Switching on a new gadget to see whether smoke comes out.' },
    { term: 'Flaky test', def: 'A test that gives different results on different runs without any change to the code.', like: 'A smoke alarm that sometimes goes off for no reason, so nobody believes it.' }
  ],

  takeaways: [
    'Functional tests check **what the user would experience**; end-to-end tests drive the whole system.',
    '**Acceptance criteria** turn "done" into checkable statements.',
    '**Smoke** tests check it is alive, **regression** tests stop old bugs returning, E2E covers the key journeys.',
    '**Flaky** tests are poison: wait on conditions, isolate data, control time, and fix or quarantine fast.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('test-tdd', {
  eli5: 'In test-driven development you write a failing test first, then just enough code to pass it, then tidy up, and repeat in tiny steps.',

  cards: [
    { kind: 'concept', title: 'Test first, code second',
      body: `Normally you write the code, then (maybe) the tests. **Test-driven development** (TDD) flips that: you write a test for behaviour that **does not exist yet**, watch it fail, and only then write the code to make it pass.

        It sounds backwards. Why test something you know will fail?

        Because the failing test is a precise, runnable statement of what you are about to build. It forces you to decide *what the code should do* before you worry about *how*. And when it goes green you have proof, not a feeling.

        TDD is a rhythm of tiny steps, and the rhythm has a famous name.` },

    { kind: 'sequence', title: 'Red, green, refactor',
      body: 'One lap of the TDD loop. A lap takes minutes, not hours.',
      actors: ['You', 'Test suite'],
      steps: [
        { from: 0, to: 1, label: 'write a failing test', note: '**Red.** Describe one small behaviour you want. Nothing implements it yet.' },
        { from: 1, to: 0, label: 'RED: fails as expected', dashed: true, note: 'You **must** see it fail. A test that has never failed might not be testing anything.' },
        { from: 0, to: 1, label: 'write the simplest code to pass', note: '**Green.** Do the quickest thing that works, even if it is ugly or even hard-coded. Do not build for tomorrow.' },
        { from: 1, to: 0, label: 'GREEN: all pass', dashed: true, note: 'The new test and every old test pass.' },
        { at: 0, label: 'refactor: tidy the code', note: '**Refactor.** Now, with the net in place, improve names and remove duplication. Behaviour must not change.' },
        { from: 0, to: 1, label: 're-run everything', note: 'Still green? Good. Next small behaviour, back to red.' }
      ] },

    { kind: 'metaphor', title: 'Sculpting with a template',
      body: `A woodworker making ten identical chair legs first cuts a **template** from card. Every leg is checked against it. They do not eyeball it and hope.

        The failing test is the template. You make the template first, then you shape the wood until it fits. When it fits, you stop; you do not carve an extra flourish "just in case".

        Then you sand it smooth (refactor), checking against the template as you go so the sanding does not change the shape.

        Where the metaphor stops: your template may itself be mis-cut. A wrong test happily drives you to build the wrong thing, which is why it must come from real requirements.` },

    { kind: 'steps', title: 'A worked lap: a password checker',
      body: 'We want a function that says whether a password is strong enough. Take it one small behaviour at a time.',
      steps: [
        { title: 'Red', body: 'Write `expect(isStrong("abc")).toBe(false)`. There is no `isStrong` yet, so the test fails with an error. Good: the loop has started.' },
        { title: 'Green', body: 'Write `function isStrong(p) { return false; }`. Yes, really. It passes. Silly, but it is the *simplest* thing, and it proves the plumbing works.' },
        { title: 'Red again', body: 'Add `expect(isStrong("correct-horse-battery")).toBe(true)`. Now the hard-coded `false` fails. The test has forced a real rule.' },
        { title: 'Green again', body: 'Change it to `return p.length >= 12;`. Both tests pass.' },
        { title: 'Refactor, then repeat', body: 'Pull `12` into a named constant. Run the tests. Then the next behaviour: "must not be a common password". Each lap adds one small, proven rule.' }
      ] },

    { kind: 'code', title: 'The result, with the tests as a spec',
      body: 'After a few laps, the tests read like a specification of the function. **Tap the lines.**',
      code: { lang: 'js', src: `
        describe('isStrong', () => {
          test('rejects short passwords', () => {
            expect(isStrong('abc')).toBe(false);
          });
          test('accepts a long passphrase', () => {
            expect(isStrong('correct-horse-battery')).toBe(true);
          });
          test('rejects well-known passwords', () => {
            expect(isStrong('passwordpassword')).toBe(false);
          });
        });`,
        notes: {
          1: '`describe` groups related tests under a name. Together the test names are a to-do list and then a spec.',
          2: 'Test names state behaviour. Read just the names and you know what the function promises.',
          8: 'This test was added later, and it forced a **new** rule. Tests pull the design out of the code one behaviour at a time.'
        } } },

    { kind: 'concept', title: 'TDD as a design tool',
      body: `The surprising claim for TDD is not "it finds bugs". It is that **it shapes your design**.

        Writing the test first means you must *use* your code before it exists. If the test is painful (a dozen things to set up, huge arguments, hidden global state), the pain is feedback: **your design is hard to use**.

        Code that is easy to test tends to be small, with few hidden dependencies and clear inputs and outputs, which is much the same list as "good design". Several earlier lessons (SRP, dependency inversion) turn up here: TDD makes you feel why they matter.` },

    { kind: 'compare', title: 'When TDD helps, and when it hurts',
      body: 'TDD is a tool, not a religion. Skilled developers disagree about how often to use it, and that is fine.',
      cols: ['Helps', 'Struggles'],
      rows: [
        ['Business rules', 'Pricing, validation, permissions: clear inputs and outputs', 'Pure exploration where you do not know what you want yet'],
        ['Bug fixes', 'Reproduce first, then fix, and keep the test', 'Throwaway prototypes you will bin tomorrow'],
        ['Design', 'Surfaces awkward, tightly coupled code early', 'Visual design and UI polish, judged by eye'],
        ['Legacy code', 'New code beside it can be built test-first', 'Code with no seams, where first steps need larger restructuring']
      ] },

    { kind: 'concept', title: 'BDD in one breath',
      body: `**Behaviour-driven development** (BDD) is TDD's sociable cousin. Instead of programmer-speak, tests are written as plain-English examples that business people can read and agree with, in a **Given / When / Then** shape:

        - **Given** a basket worth £60 and the code TEN
        - **When** the customer checks out
        - **Then** the total is £54

        Tools such as Cucumber turn those sentences into runnable tests. The real benefit is the conversation: team and stakeholders agree concrete examples *before* anyone codes. If nobody outside the team reads them, plain tests are simpler.` },

    { kind: 'pitfall', title: 'Common TDD traps',
      body: `**Skipping red.** If you never watch a test fail, you do not know it can. A test that cannot fail is decoration.

        **Writing too much at once.** A huge test and a huge change is just "write code then test" in disguise. Keep laps small.

        **Skipping refactor.** Green-green-green with no tidy-up builds a pile of ugly code that merely passes. The third step is where the design improves.

        **Testing implementation.** Tests tied to how the code works, not what it does, make refactoring painful and defeat the loop.` }
  ],

  activities: [
    { type: 'order', after: 1, prompt: 'Put one TDD lap in order.',
      items: ['Write a test for a behaviour that does not exist yet', 'Run it and watch it fail (red)', 'Write the simplest code that makes it pass (green)', 'Tidy the code while keeping the tests green (refactor)'],
      explain: 'Red, green, refactor. Seeing red proves the test can fail; green proves the code works; refactoring improves it safely because the tests guard the behaviour.' },

    { type: 'tf', after: 3, statement: 'In the green step it is acceptable to write simple, even hard-coded code, as long as the tests pass.', answer: true,
      explain: 'The next failing test will force a more general solution. Doing the simplest thing keeps steps small and stops you building features nobody asked for.' },

    { type: 'mcq', after: 5, q: 'Why do TDD fans say it improves design, not just correctness?',
      options: ['Writing the test first makes you use the code, so awkward, hard-to-test designs hurt immediately', 'It makes the compiler produce faster programs', 'It removes the need to think about structure at all', 'It guarantees the code has no bugs'],
      answer: 0,
      why: [null, 'TDD has no effect on how fast compiled code runs.', 'You still design; the tests simply give fast feedback on that design.', 'No technique guarantees that; tests only check what you thought of.'],
      explain: 'If a test is painful to set up, the code is hard to use and probably too coupled. That feedback arrives before the design hardens.' },

    { type: 'spot', prompt: 'This developer says they are "doing TDD". Tap the step that shows they are not following the loop.',
      code: { lang: 'text', src: `
        1. Write the whole discount feature (200 lines)
        2. Write a test that calls it
        3. Run the test: it passes first time
        4. Commit` },
      lines: [1],
      explain: 'The feature came first and the test followed. The test has never been red, so it may not catch anything. TDD starts with a small failing test and grows the code a bit at a time.' },

    { type: 'match', prompt: 'Match each phrase with its place in TDD or BDD.',
      pairs: [['Red', 'A new test that fails'], ['Green', 'The simplest code that passes everything'], ['Refactor', 'Improve the structure without changing behaviour'], ['Given / When / Then', 'A plain-English shape for behaviour examples'], ['Cucumber', 'A tool that runs those sentences as tests']] },

    { type: 'ab', q: 'Which test name is better in a test-first workflow?',
      a: { lang: 'js', label: 'Vague', src: `
        test('discount works', () => {
          /* ... */
        });` },
      b: { lang: 'js', label: 'Behaviour as a sentence', src: `
        test('takes 10% off when the TEN code is used', () => {
          /* ... */
        });` },
      answer: 'b',
      explain: 'Test names become a living specification. A specific sentence says what is promised and tells you exactly what broke when it fails.' },

    { type: 'bucket', prompt: 'TDD or not so useful? Where would you reach for test-first?', buckets: ['Good fit', 'Weaker fit'],
      items: [['A tax calculation with many rules', 0], ['Reproducing and fixing a reported bug', 0], ['Validating form input', 0], ['A throwaway script to rename some files', 1], ['Tweaking the colours and spacing of a page', 1], ['An experiment where you do not know what you want yet', 1]],
      explain: 'TDD shines when you know the behaviour you want and the code has clear inputs and outputs. It is less useful for exploration, throwaways and visual judgement.' },

    { type: 'cloze', text: 'In BDD a scenario is written as {{Given}} a starting situation, {{When}} something happens, {{Then}} an expected outcome. In TDD, the first colour you want to see is {{red}}.',
      distractors: ['green', 'Because', 'blue'],
      explain: 'Given/When/Then is plain English for a behaviour example. Seeing red first proves the test is capable of failing.' },

    { type: 'explain', prompt: 'A colleague says TDD is "writing every test twice and slowing everything down". Give a fair answer, including when you would not use it.',
      model: 'Tests are written once, first, and each failing test is a small spec for the next piece of code. The loop is red, green, refactor, in tiny steps. It often saves time because it catches mistakes within minutes, gives a safety net for refactoring, and pushes code towards simpler, more testable design. It is not for everything: for throwaway code, UI polish or early exploration it can be more cost than benefit. Skilled developers differ on how much to use it.',
      keywords: ['red', 'green', 'refactor', 'spec', 'design', 'safety net', 'exploration'] }
  ],

  flashcards: [
    { q: 'What is the red–green–refactor loop?', a: 'Write a failing test (red), write the simplest code to pass it (green), then clean up the code while keeping tests green (refactor).' },
    { q: 'Why must you see the test fail first?', a: 'It proves the test can fail. A test that has never been red might not be testing anything.' },
    { q: 'How can TDD improve design?', a: 'Writing the test first means you use the code before it exists, so hard-to-use or tightly coupled designs hurt straight away.' },
    { q: 'When is TDD a weaker fit?', a: 'Throwaway prototypes, early exploration when you do not know what you want, and visual polish judged by eye.' },
    { q: 'What is BDD?', a: 'Behaviour-driven development: examples written in plain English as Given/When/Then so non-programmers can agree on behaviour before coding.' }
  ],

  glossary: [
    { term: 'Test-driven development', def: 'A way of working in tiny laps: write a failing test, make it pass, then clean up.', aka: ['TDD'], like: 'Cutting a template first, then shaping the wood to fit it.' },
    { term: 'Red-green-refactor', def: 'The three steps of the TDD loop: failing test, passing code, improved code.', like: 'Draft, finish, polish, in minutes rather than days.' },
    { term: 'Behaviour-driven development', def: 'A cousin of TDD where behaviour is described in plain-English Given/When/Then examples shared with non-programmers.', aka: ['BDD'], like: 'Agreeing exact worked examples with the customer before building.' },
    { term: 'Given/When/Then', def: 'A three-part template for describing behaviour: a starting state, an event, an expected result.', like: 'A recipe card: ingredients, method, what it should look like.' }
  ],

  takeaways: [
    'TDD is **red, green, refactor**: failing test, simplest passing code, then tidy up, in tiny laps.',
    'Always **see it fail** first; a test that cannot fail proves nothing.',
    'Hard-to-test code is a **design smell**; TDD gives that feedback early.',
    'TDD is a tool, not a religion: great for rules and bug fixes, weaker for exploration and UI. **BDD** adds shared Given/When/Then examples.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('test-strategy', {
  eli5: 'Testing is easier when code is built to be tested, and you decide how much to test by risk, not by chasing a coverage number.',

  cards: [
    { kind: 'story', title: 'The function nobody could test',
      body: `A developer writes \`sendReminders()\`. It reads the current time, queries the live database, loops over users and sends real emails through a provider.

        Now someone asks for a test. To run it you would need a real clock set to the right hour, a populated database, and an email account you are happy to spam. So nobody writes one, and the code becomes one of those scary files.

        The code itself is fine. The problem is its **design**: it reaches out and grabs everything it needs, so you cannot hand it stand-ins.

        Testability is a property of design, and you can build it in.` },

    { kind: 'concept', title: 'Dependency injection: hand things in',
      body: `**Dependency injection** (DI) is a fancy name for a plain idea: instead of a piece of code **creating or grabbing** the things it depends on, they are **passed in** from outside.

        Compare "a chef who goes shopping, picks a stove and hires a waiter" with "a chef who is *handed* ingredients and a stove". The second is far easier to put in a test kitchen with a pretend stove.

        In code, that usually just means constructor arguments (or function parameters). The code asks for "something that can send email", and the caller decides which: the real provider in production, a stub or spy in tests.` },

    { kind: 'metaphor', title: 'The test kitchen',
      body: `A chef who goes out shopping, picks a stove and hires a waiter is impossible to put in a test kitchen: they will fetch the real things every time.

        A chef who is **handed** ingredients, a stove and a waiter works anywhere. In the test kitchen you hand over a pretend stove and a notepad instead of a waiter, and you can watch exactly what they do with them.

        Code that grabs its own database, clock and mailer is the first chef. Code that is given them is the second. Where the metaphor stops: a real chef notices a fake stove; code never does, which is exactly why this works.` },

    { kind: 'code', title: 'Before and after',
      body: 'The reminder job rewritten so its collaborators are handed in. **Tap the lines.**',
      code: { lang: 'js', src: `
        class Reminders {
          constructor(clock, users, mailer) {
            this.clock = clock;
            this.users = users;
            this.mailer = mailer;
          }
          run() {
            this.users.dueAt(this.clock.now())
              .forEach(u => this.mailer.send(u.email));
          }
        }`,
        notes: {
          2: 'The class **asks** for a clock, a source of users and a mailer. It no longer knows or cares which ones.',
          8: 'It uses `this.clock`, not `new Date()`. A test passes a clock stuck at 9am, so the answer is the same on every run.',
          9: 'In production the real mailer goes here. In a test a spy goes here, and the test checks who it was asked to email.'
        } } },

    { kind: 'layers', title: 'Make the logic easy, push the mess to the edges',
      body: 'A popular shape for testable code: keep decisions in a pure core, and keep the awkward world-touching bits thin.',
      layers: [
        { label: 'Edges: HTTP, database, email, clock', note: 'Thin adapters. Few decisions. Covered by a handful of integration tests.', tone: 'warn', icon: '🔌' },
        { label: 'Core: rules and decisions', note: 'Plain functions and objects. Input in, output out. Covered by lots of fast unit tests.', tone: 'good', icon: '🧠' }
      ] },

    { kind: 'concept', title: 'Code coverage, and how it lies',
      body: `**Code coverage** measures how much of your code was executed while the tests ran, such as "82% of lines". Tools produce it for free, so it is tempting to treat it as a score.

        Coverage tells you one honest thing: the **uncovered** code is definitely untested. That is useful.

        What it cannot tell you is whether the covered code was *checked*. It counts a line as covered if it ran, whether or not any assertion looked at the result.

        A test that calls a function and asserts nothing gives full coverage and zero protection.` },

    { kind: 'code', title: '100% covered, 0% tested',
      body: 'A test that gives full line coverage and proves nothing. **Tap the lines.**',
      code: { lang: 'js', src: `
        function total(prices) {
          return prices.reduce((a, b) => a - b, 0);   // bug: minus
        }

        test('total runs', () => {
          total([10, 20]);
        });`,
        notes: {
          2: 'The bug: it subtracts instead of adding. Any real check would catch it.',
          5: 'The name only promises that the function **runs**: a clue that nothing is being checked.',
          6: 'This line **runs** the function, so the coverage tool is happy, but there is **no assertion**. The test passes even though the code is wrong. High coverage, no safety.'
        } },
      note: 'A target such as "80%" is a conversation starter, not a goal. When a measure becomes a target, people game it (Goodhart’s law). Some teams use **mutation testing**, which deliberately breaks the code to check that a test notices.' },

    { kind: 'compare', title: 'Other kinds of test, at a glance',
      body: 'Besides "does it work?", teams ask "does it hold up?". Each has its own tools and its own time to run.',
      cols: ['Asks', 'Example'],
      rows: [
        ['Load test', 'How does it behave under realistic or heavy traffic? Where is the limit?', 'Simulate 5,000 shoppers browsing at once and watch the response times'],
        ['Security test', 'Can someone abuse it? Are known holes present?', 'Automated scans for vulnerable libraries; trying injection on forms; penetration testing'],
        ['Chaos test', 'Does it survive real failures?', 'Kill a server on purpose and check the site carries on']
      ],
      note: 'These are specialised and not usually run on every commit. Resilience, observability and web-security later in the course go deeper.' },

    { kind: 'sequence', title: 'Tests in the CI pipeline',
      body: 'Continuous integration (CI) means a server runs your tests automatically every time someone pushes code. Cheap checks go first.',
      actors: ['Developer', 'CI server', 'Team'],
      steps: [
        { from: 0, to: 1, label: 'push a change', note: 'Each push, or pull request, wakes the pipeline up.' },
        { at: 1, label: 'lint + unit tests', note: 'The quickest checks first: seconds to a few minutes. If they fail, stop here.' },
        { at: 1, label: 'integration tests', note: 'Slower. Run only if the first stage passes. Often with containerised databases.' },
        { at: 1, label: 'build + a few E2E / smoke', note: 'The slowest and fewest, covering key journeys.' },
        { from: 1, to: 0, label: 'red or green', dashed: true, note: 'The developer learns within minutes, while the change is still fresh in their head.' },
        { from: 1, to: 2, label: 'safe to merge / deploy', note: 'A green build is a gate: broken code does not reach everyone else. The delivery module covers pipelines in detail.' }
      ] },

    { kind: 'tip', title: 'How much testing is enough?',
      body: `There is no magic number. Decide by **risk**: how bad is it if this breaks, and how likely is it to break?

        - A payment calculation: test thoroughly, at several levels.
        - A settings page nobody visits: a light smoke test may do.
        - A bug that escaped: add a regression test.

        Signs your strategy works: you change code without fear, the suite is quick enough that people run it, a red build means something, and bugs that reach production are rare and get a test when they do.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What does dependency injection mean in practice?',
      options: ['A piece of code is given its collaborators from outside rather than creating them itself', 'The database is injected with test data automatically', 'Dependencies are downloaded at runtime from the internet', 'All code must live in one file so it is easy to find'],
      answer: 0,
      why: [null, 'That describes seeding test data, not the design technique.', 'It is about how objects receive their collaborators, not package downloads.', 'DI does not constrain file layout.'],
      explain: 'Passing the clock, database or mailer in (usually via a constructor) lets a test hand over a stand-in and production hand over the real thing.' },

    { type: 'spot', after: 3, prompt: 'This code is hard to unit test. Tap the line that stops you controlling the time in a test.',
      code: { lang: 'js', src: `
        function isHappyHour() {
          const hour = new Date().getHours();
          return hour >= 17 && hour < 19;
        }` },
      lines: [2],
      explain: 'The function reads the real clock, so the result depends on when you run the test. Pass the time (or a clock) in as an argument and the test controls it.' },

    { type: 'tf', after: 6, statement: 'If your coverage report says 100%, every behaviour of the code has been checked.', answer: false,
      explain: 'Coverage only records that lines ran. A test with no assertions runs the code and checks nothing, so full coverage can sit on top of a broken program.' },

    { type: 'match', prompt: 'Match each kind of test to the question it asks.',
      pairs: [['Load test', 'How does it cope with heavy traffic?'], ['Security test', 'Can someone abuse it?'], ['Chaos test', 'Does it survive a real failure, like a killed server?'], ['Smoke test', 'Is it basically alive after a deploy?'], ['Contract test', 'Do two services still agree on their API?']] },

    { type: 'order', prompt: 'Order the stages of a sensible CI pipeline, cheapest first.',
      items: ['Lint and unit tests', 'Integration tests', 'Build and a few end-to-end or smoke tests', 'Merge or deploy if all green'],
      explain: 'Cheap, fast stages go first so a failure is reported in a minute, and the slow stages only run when it is worth it.' },

    { type: 'bucket', prompt: 'Does this make code easier or harder to test?', buckets: ['Easier to test', 'Harder to test'],
      items: [['Passing the mailer into the constructor', 0], ['Pure functions: same input, same output', 0], ['Taking the time as a parameter', 0], ['Calling `new Date()` deep inside business logic', 1], ['Reading a global variable that many files change', 1], ['Creating a real database connection inside a class', 1]],
      explain: 'Anything that hides a dependency or depends on global state is hard to control. Passing things in and keeping functions pure gives tests handles to grab.' },

    { type: 'multi', q: 'Which are sensible ways to decide how much to test?',
      options: ['Test more where a failure would be costly, such as payments', 'Add a regression test whenever a bug escapes', 'Aim for 100% coverage everywhere regardless of value', 'Keep the pipeline fast enough that people really run it', 'Skip tests for the trickiest code because it is hard'],
      answers: [0, 1, 3],
      explain: 'Risk guides effort, escaped bugs earn tests, and speed keeps the net in use. A blanket coverage target and avoiding hard code both miss the point.' },

    { type: 'scenario', title: 'The coverage mandate', intro: 'Your manager announces: "Every pull request must keep coverage above 90%, or it is rejected." Two weeks later you notice odd new tests appearing.',
      meters: { 'real safety': 50, 'team morale': 60 },
      steps: [
        { text: 'You open one of the new tests. It calls a big function and asserts nothing. What do you do?',
          choices: [
            { label: 'Raise it constructively: coverage shows what ran, not what was checked, and suggest assertions and review as well', score: 2, effects: { 'real safety': 20, 'team morale': 10 }, feedback: 'You name the real issue without blaming anyone. Coverage is a useful smoke signal for untested code but a poor target.' },
            { label: 'Ignore it; the number is green', score: 0, effects: { 'real safety': -20 }, feedback: 'The number is green and the net is full of holes. Hollow tests teach everyone that testing is paperwork.' },
            { label: 'Delete all the new tests and let coverage fall', score: 0, effects: { 'real safety': -10, 'team morale': -25 }, feedback: 'It gets you a fight, not a fix. Better to improve the tests and the incentive.' }
          ] },
        { text: 'The manager asks what to measure instead. Which proposal is best?',
          choices: [
            { label: 'Use coverage to find untested risky areas, review test quality, and track escaped bugs', score: 2, effects: { 'real safety': 20 }, feedback: 'Several signals together give a more honest picture. Escaped bugs show whether the net actually catches things.' },
            { label: 'Raise the target to 100%', score: 0, effects: { 'real safety': -10, 'team morale': -15 }, feedback: 'A tougher target is a stronger incentive to game. You will get more empty tests, faster.' },
            { label: 'Stop measuring anything', score: 1, effects: { 'real safety': -5 }, feedback: 'Better than a gamed target, but you lose the useful signal of which risky code is untested.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain how designing code with dependency injection makes it easier to test, and why a high coverage number can still be misleading.',
      model: 'With dependency injection, code is given its collaborators, such as a clock, database or mailer, rather than creating them. In a test I can hand in stubs or spies, so the test is fast and repeatable and needs no real email or live database. Coverage only measures which lines ran, not whether the results were checked, so a test with no assertions gives high coverage and no protection. I would use coverage to spot untested risky code, not as a score.',
      keywords: ['inject', 'pass in', 'stub', 'repeatable', 'coverage', 'assertions', 'ran', 'risk'] }
  ],

  flashcards: [
    { q: 'What is dependency injection?', a: 'Passing a piece of code the things it depends on (clock, database, mailer) from outside instead of letting it create them.' },
    { q: 'Why does dependency injection help testing?', a: 'A test can hand in stubs, fakes or spies, so the code runs fast and repeatably with no real network, clock or database.' },
    { q: 'What does code coverage measure?', a: 'The proportion of your code that ran during tests. It does not tell you whether the results were checked.' },
    { q: 'What can coverage reliably tell you?', a: 'That uncovered code is definitely untested. It cannot prove the covered code is well tested.' },
    { q: 'Why run cheap tests first in CI?', a: 'A failure is reported in minutes, and slow stages only run when the quick ones pass.' },
    { q: 'What do load, security and chaos tests check?', a: 'Behaviour under heavy traffic, resistance to abuse, and survival of real failures, respectively.' }
  ],

  glossary: [
    { term: 'Dependency injection', def: 'Giving code the collaborators it needs from outside, usually through constructor arguments, instead of having it create them.', aka: ['DI'], like: 'Handing a chef ingredients and a stove rather than sending them shopping.' },
    { term: 'Code coverage', def: 'A measure of how much of the code was executed while tests ran. It shows what was run, not what was checked.', like: 'Proof that the inspector walked past every door, not that they looked inside.' },
    { term: 'Mutation testing', def: 'A technique that makes small deliberate changes to your code and checks whether tests fail. Surviving changes show weak tests.', like: 'Hiding deliberate typos to see whether the proofreader finds them.' },
    { term: 'Continuous integration', def: 'Automatically building and testing code on a shared server every time someone pushes a change.', aka: ['CI'], like: 'An automatic gatekeeper who checks every parcel before it goes on the shelf.' },
    { term: 'Chaos testing', def: 'Deliberately breaking parts of a running system, such as killing a server, to see whether it copes.', like: 'A fire drill held on a random Tuesday.' }
  ],

  takeaways: [
    '**Dependency injection** means passing collaborators in, so tests can hand over stubs and spies.',
    'Keep decisions in a pure core and the world-touching code at thin edges.',
    '**Coverage** shows what ran, not what was checked: useful for finding gaps, poor as a target.',
    'Run **cheap tests first in CI**, and decide how much to test by risk.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('testing', {
  title: 'The Flaky Gremlin',
  intro: 'A gremlin lives in your build server, turning tests red on Tuesdays and green on re-runs. Beat it by choosing the right level of test, naming your doubles correctly and refusing to trust a coverage number.',
  questions: [
    { type: 'mcq', q: 'A suite has 20 unit tests and 600 browser-driven end-to-end tests, and takes ninety minutes. What is the best description and first fix?',
      options: ['An ice-cream cone: push checks down to cheaper unit and integration tests', 'A healthy pyramid: add more end-to-end tests for safety', 'A trophy: delete the unit tests', 'Fine as it is: slow tests are more realistic'],
      answer: 0,
      why: [null, 'A pyramid has many unit tests at the base, not few.', 'Deleting the fast tests makes it worse.', 'Realism costs speed, flakiness and diagnosability; it does not excuse the shape.'],
      explain: 'Most checks can be caught at a lower, cheaper level. Keep a few end-to-end tests for key journeys and move the rest down.' },

    { type: 'match', prompt: 'Match each test double to its job.',
      pairs: [['Stub', 'Returns canned answers'], ['Mock', 'Fails the test if expected calls do not happen'], ['Fake', 'A simplified but working substitute'], ['Spy', 'Records how it was called for later checks']] },

    { type: 'spot', prompt: 'Tap the line that makes this test depend on the real world and so give different results at different times.',
      code: { lang: 'js', src: `
        test('shows a late banner after 6pm', () => {
          const page = new Page();
          const html = page.render();
          expect(html).toContain('late');
        });

        class Page {
          render() {
            return new Date().getHours() >= 18 ? 'late' : 'on time';
          }
        }` },
      lines: [9],
      explain: 'Line 9 reads the real clock. The test passes only after 6pm. Passing the time in (dependency injection) lets the test set it.' },

    { type: 'order', prompt: 'Put one lap of test-driven development in order.',
      items: ['Write a small failing test', 'Watch it fail for the right reason', 'Write the simplest code that passes', 'Refactor with the tests green'],
      explain: 'Red, green, refactor. Watching the failure proves the test can fail; refactoring last is safe because the tests guard the behaviour.' },

    { type: 'bucket', prompt: 'Which level of the pyramid is the right home for each check?', buckets: ['Unit', 'Integration', 'End-to-end'],
      items: [['A refund calculation rounds to the nearest penny', 0], ['SQL in the repository matches the real table columns', 1], ['Another team’s API still returns the fields we read', 1], ['A visitor can search, add to basket and pay', 2], ['A phone-number validator rejects letters', 0], ['The app starts and the login page loads after deploy', 2]],
      explain: 'Logic belongs low, boundaries between real parts in the middle, and whole journeys at the top.' },

    { type: 'tf', statement: 'A test suite with 95% code coverage proves that 95% of the behaviour has been checked.', answer: false,
      explain: 'Coverage records which lines ran, not whether any assertion examined the results. A test with no assertions can give full coverage and no protection.' },

    { type: 'multi', q: 'Which of these help make a flaky end-to-end test reliable?',
      options: ['Wait for a visible condition rather than a fixed pause', 'Give each test its own freshly created data', 'Control the clock and stub third parties you do not own', 'Add automatic retries and ignore the first failure', 'Locate elements by "the third div on the page"'],
      answers: [0, 1, 2],
      explain: 'Flakiness comes from timing, shared state and uncontrolled dependencies. Retries hide it and positional locators create more of it.' },

    { type: 'ab', q: 'Which test is the better check of the behaviour?',
      a: { lang: 'js', label: 'Checks the how', src: `
        test('totals the basket', () => {
          const spy = jest.spyOn(basket, '_add');
          basket.total([5, 5]);
          expect(spy).toHaveBeenCalledTimes(2);
        });` },
      b: { lang: 'js', label: 'Checks the what', src: `
        test('totals the basket', () => {
          expect(basket.total([5, 5])).toBe(10);
        });` },
      answer: 'b',
      explain: 'The second asserts the promise the code makes. The first replays the implementation, so a harmless refactor breaks it.' },

    { type: 'cloze', text: 'In BDD, a scenario is written as {{Given}} a starting state, {{When}} something happens, {{Then}} the expected outcome. A test kept so that an old bug cannot silently return is a {{regression}} test.',
      distractors: ['Because', 'smoke', 'load'],
      explain: 'Given/When/Then is the plain-English shape of BDD. Regression tests lock in the fix for a bug that once got through.' },

    { type: 'short', q: 'Which kind of test, named after hardware that is switched on to see if it catches fire, checks that an app is basically alive after a deploy?', accept: ['smoke', 'smoke test'], hint: 'Something is burning if you see it.',
      explain: 'A smoke test is a tiny, fast set of checks that the app starts and the most basic things work.' },

    { type: 'mcq', q: 'Your service passes all unit tests but fails in production because the SQL names a column that does not exist. What would have caught it?',
      options: ['An integration test against a real (test) database', 'More unit tests with the database stubbed', 'A higher coverage threshold', 'A chaos test that kills a server'],
      answer: 0,
      why: [null, 'A stubbed database accepts any SQL, so it repeats the blind spot.', 'Coverage counted the SQL line as run, not as correct.', 'Chaos tests check resilience to failure, not schema mismatches.'],
      explain: 'Only the real database knows its schema. Integration tests run your SQL against it and reveal the mismatch.' },

    { type: 'order', prompt: 'Order a sensible CI pipeline from the first stage to the last.',
      items: ['Lint and unit tests', 'Integration tests with containerised dependencies', 'A few end-to-end and smoke tests', 'Deploy if everything is green'],
      explain: 'Cheap, quick stages first give fast failure. Slower, broader stages run only when the earlier ones have passed.' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.sheet('testing', {
  title: 'Testing & TDD: cheat sheet',
  sections: [
    { title: 'The pyramid',
      md: `| Level | Checks | Speed | Count |
        |---|---|---|---|
        | Unit | One small piece, in isolation | Milliseconds | Many |
        | Integration | Real pieces together (code + DB, service + service) | Seconds | Some |
        | End-to-end | Whole user journey through every layer | Slow | Few |

        Push each check to the **cheapest level** that can still catch the bug. Ice-cream cone (many E2E, few unit) is the anti-pattern. Some teams prefer a "trophy" shape.` },

    { title: 'Writing a unit test',
      md: `**Arrange** (set up) → **Act** (call it) → **Assert** (check).

        - Name tests as sentences about behaviour.
        - One behaviour per test.
        - **FIRST**: Fast, Isolated, Repeatable, Self-checking, Timely.
        - Test the *what*, not the *how*, or refactors break your tests.
        - Skip: library internals, trivial getters, throwaways.` },

    { title: 'Test doubles',
      md: `| Double | Job |
        |---|---|
        | Stub | Returns canned answers (feeds **in**) |
        | Mock | Expects calls; fails if they do not happen |
        | Spy | Records calls to check afterwards |
        | Fake | Simplified working version (in-memory database) |

        Double the slow, costly and unpredictable edges. **Over-mocking** = brittle tests that replay the implementation.` },

    { title: 'Integration, functional and E2E',
      md: `- **Integration**: real database in a throwaway container; clean state before each test; keep few and focused on joins.
        - **Contract test**: consumer's expectations replayed against the provider (Pact).
        - **Functional / E2E**: user's view, via a browser tool; key journeys only.
        - **Acceptance criteria**: checkable "done" statements.
        - **Smoke**: is it alive after deploy? **Regression**: a bug that cannot return.` },

    { title: 'Taming flaky tests',
      md: `1. Wait for **conditions**, never fixed sleeps.
        2. Fresh data per test; no shared state or order dependence.
        3. Control clock, randomness and third parties.
        4. Stable locators (role, label, test id).
        5. Quarantine with an owner and a deadline, then fix or delete.

        A flaky test teaches the team to **ignore red**, which is the real cost.` },

    { title: 'TDD and BDD',
      md: `**Red** (write a failing test, see it fail) → **Green** (simplest code that passes) → **Refactor** (tidy, tests stay green). Tiny laps.

        - Pulls design out: painful tests mean awkward design.
        - Great for rules and bug fixes; weaker for exploration, throwaways and UI polish.
        - **BDD**: Given / When / Then examples in plain English, shared with non-programmers.` },

    { title: 'Design and strategy',
      md: `- **Dependency injection**: pass clock, DB and mailer in; tests hand over stand-ins.
        - Pure core, thin edges.
        - **Coverage** shows what ran, not what was checked. Uncovered = untested; covered does not mean tested. Mutation testing checks test strength.
        - Also: load, security, chaos testing (specialised, not every commit).
        - **CI**: cheap tests first, green is the gate. Decide effort by **risk**.` }
  ]
});
