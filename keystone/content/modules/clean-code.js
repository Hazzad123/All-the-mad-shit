/* Module: clean-code — Clean Code.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs clean-code */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-why', {
  eli5: 'Code is read many more times than it is written, so every shortcut that makes it harder to read is a loan: you get speed today and pay interest on every change afterwards.',

  cards: [
    { kind: 'concept', title: 'The one-line change that took three days',
      body: `Picture this. Your manager says: *"Customers on the Gold plan should get free delivery. Quick job, one line."*

        You open the file. It is 900 lines long. The function you need is called \`doStuff2\`. Nobody on the team knows why it checks \`if (x === 7)\`. You change the line, and something unrelated in the invoice emails breaks.

        Three days later the "one line" is live.

        The slow part was never typing. It was **reading**: working out what the code does before you dare touch it. Developers spend far more of their time reading code than writing it, so the cost of code is mostly the cost of *understanding* it.` },

    { kind: 'metaphor', title: 'A kitchen after a busy night',
      body: `Think of a restaurant kitchen. On a rush, a cook can save ten seconds by leaving the knife on the counter, the pan in the sink and the spilled oil where it is.

        Tonight that is fine. Tomorrow, the next cook arrives and spends twenty minutes finding a clean pan, and slips on the oil.

        Shortcuts feel free **to the person taking them**. The bill goes to whoever works there next, and that is often *you, in three months*, with no memory of why you did it.

        Clean code is the habit of wiping down as you go. It is not about being tidy for its own sake; it is about the next person being able to cook.` },

    { kind: 'concept', title: 'Technical debt: a loan with interest',
      body: `Ward Cunningham, an early developer who worked on agile methods, described shortcuts as **technical debt**.

        You take a loan: ship faster now by writing something rough. That is sometimes a perfectly sensible deal.

        But the loan has **interest**. Every time anyone touches that code, they pay a little extra: more reading, more care, more bugs. If you never pay back the **principal** (by tidying the code), the interest grows until nearly all your time goes on paying it, and new features crawl.

        Like real debt, **small amounts, taken on purpose, with a plan to repay, can be fine.** The dangerous kind is the debt nobody knows they have.` },

    { kind: 'code', title: 'Same logic, two readers',
      body: 'Both versions do exactly the same thing. Tap the highlighted lines in the first one and ask: how long would you hesitate before changing it?',
      code: { lang: 'js', src: `
        function p(o) {
          let t = 0;
          for (let i = 0; i < o.length; i++) {
            t += o[i].q * o[i].p;
          }
          if (t > 100) t = t * 0.9;
          return t;
        }`,
        notes: {
          1: 'The name tells you nothing. You have to read the body, and every caller, to learn what `p` does.',
          2: '`t` could be total, tax, time or temperature. The reader must guess.',
          4: '`q` and `p` are quantity and price, if you are lucky. If not, you are debugging.',
          6: 'Why 100? Why 0.9? These **magic numbers** carry a business rule with no explanation.'
        } } },

    { kind: 'code', title: 'The tidied version',
      body: 'Nothing clever happened. Names say what things are, and the two business rules now have names too.',
      code: { lang: 'js', src: `
        const BULK_THRESHOLD = 100;
        const BULK_DISCOUNT = 0.9;   // 10% off big orders

        function orderTotal(lineItems) {
          let total = 0;
          for (const item of lineItems) {
            total += item.quantity * item.unitPrice;
          }
          if (total > BULK_THRESHOLD) total = total * BULK_DISCOUNT;
          return total;
        }`,
        notes: {
          5: 'A noun-phrase for what you get back. The name now answers "what does this do?" before you read a line.',
          7: '`quantity * unitPrice` reads like the sentence a human would say.',
          9: 'When the discount rule changes, there is one obvious place to change it.'
        } },
      note: 'It is not shorter. Clean code is optimised for the reader, not for the number of characters.' },

    { kind: 'diagram', title: 'How a codebase slides downhill',
      body: 'Debt rarely arrives in one go. It compounds, and it feeds itself.',
      nodes: [
        { id: 'rush', label: 'Rush a shortcut', icon: '⏱️', x: 0, y: 0, tone: 'warn' },
        { id: 'mess', label: 'Code gets harder to read', icon: '🍝', x: 1, y: 1, tone: 'bad' },
        { id: 'slow', label: 'Changes get slower', icon: '🐌', x: 1, y: 2, tone: 'bad' },
        { id: 'press', label: 'More deadline pressure', icon: '🔥', x: 0, y: 3, tone: 'warn' }
      ],
      edges: [
        { from: 'rush', to: 'mess' }, { from: 'mess', to: 'slow' },
        { from: 'slow', to: 'press' }, { from: 'press', to: 'rush', label: 'so, another shortcut', dashed: true }
      ],
      caption: 'The loop is the problem: slow code causes pressure, and pressure causes more shortcuts.' },

    { kind: 'tip', title: 'The boy scout rule',
      body: `Scouts have a rule: **leave the campsite cleaner than you found it.** Robert C. Martin, who wrote the book *Clean Code*, applies it to software:

        > Leave the code a little cleaner than you found it.

        You do not need a grand clean-up project. When you open a file to fix something, also rename one confusing variable, delete one dead line, or split one monster function.

        Ten tiny improvements a week beat one "big refactor" that never gets approved. Small enough that nobody needs permission, regular enough that the codebase gets better instead of worse.`,
      note: 'Keep tidy-ups small and separate from the real change, so a reviewer can tell them apart.' },

    { kind: 'realworld', title: 'Signs a codebase is in trouble',
      body: `You do not need to read every file to smell trouble. Look for what the *team* does:

        - Simple changes take much longer than anyone predicted.
        - Fixing one bug creates another somewhere unrelated.
        - Developers say "don't touch that, nobody knows how it works".
        - New joiners need weeks before they dare to change anything.
        - Code is copy-pasted because changing the original feels too risky.
        - Fixes arrive as comments like \`// hack, fix later\` (later never comes).

        Any one of these is normal. A pile of them is a bill arriving.` },

    { kind: 'pitfall', title: 'Clean is not the same as clever',
      body: `Developers love a neat trick: a dense one-liner, a chain of five operators, a regex that does everything. It feels brilliant to write.

        \`\`\`js
        const n = a.reduce((s, x) => s + (x.p > 9 ? x.p * .8 : x.p), 0);
        \`\`\`

        The test is not *"could I write this?"* but *"could a tired colleague understand this at 5pm on a Friday?"*

        Clean code is usually **plain and a bit boring** on purpose. Boring code is cheap to read. Clever code is a puzzle that every future reader must solve again.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'A developer says the "one-line change" took three days. According to the lesson, where did most of the time go?',
      options: ['Understanding the surrounding code well enough to change it safely', 'Typing the new line, which is slow in a large file', 'Waiting for the computer to compile the change', 'Arguing about which programming language to use'],
      answer: 0,
      why: [null, 'Typing one line takes seconds, whatever the file size.', 'Build time can matter, but it is not what makes unclear code costly.', 'The language was not in question here.'],
      explain: 'Most of a developer’s time goes on reading and understanding. That is why unclear code is expensive: every change begins with decoding it.' },

    { type: 'tf', after: 2, statement: 'All technical debt is a sign of sloppy, careless developers.', answer: false,
      explain: 'Taking on a small, deliberate shortcut to hit a launch date, and repaying it afterwards, can be a sensible trade. The harmful kind is the debt nobody notices or plans to repay.' },

    { type: 'bucket', prompt: 'Is this a sign of a healthy codebase, or a codebase in trouble?', buckets: ['Healthy', 'In trouble'],
      items: [['A new joiner fixes a small bug on day two', 0], ['"Don’t touch that file, nobody knows how it works"', 1], ['Fixing a bug in invoices breaks email sending', 1], ['Estimates for small changes are usually right', 0], ['Logic is copy-pasted because editing the original feels risky', 1], ['Small tidy-ups happen alongside every feature', 0]],
      explain: 'Healthy code can be changed with confidence. Fear of touching things, surprise breakages and copy-paste-to-avoid-risk are all interest payments on debt.' },

    { type: 'ab', q: 'Which version would you rather inherit?',
      a: { lang: 'js', label: 'Compact', src: `
        const n = a.reduce(
          (s, x) => s + (x.p > 9 ? x.p * .8 : x.p), 0);` },
      b: { lang: 'js', label: 'Plain', src: `
        let total = 0;
        for (const item of items) {
          const onSale = item.price > 9;
          total += onSale ? item.price * 0.8 : item.price;
        }` },
      answer: 'b',
      explain: 'Both behave the same. The plain one names its pieces and reads top to bottom, so the next developer can change the rule without first decoding a trick. Fewer characters is not the goal.' },

    { type: 'spot', prompt: 'Tap the line that most clearly signals a codebase running up debt.',
      code: { lang: 'js', src: `
        function shippingCost(order) {
          if (order.total > 50) return 0;
          if (order.country === 'UK') return 3.99;
          // HACK: don't remove, breaks Fridays. Nobody knows why.
          if (new Date().getDay() === 5) return 4.99;
          return 9.99;
        }` },
      lines: [4],
      explain: 'A comment admitting nobody understands a rule is debt in plain sight: the next person must either leave it forever or risk breaking something. It deserves investigation, a test or a proper explanation.' },

    { type: 'order', prompt: 'Put the debt spiral in the order it usually unfolds.',
      items: ['A deadline appears, so a shortcut is taken', 'The code becomes harder to understand', 'Each new change takes longer than it should', 'Pressure rises because the team is slow', 'Another shortcut is taken to catch up'],
      explain: 'It is a loop, not a line. That is why a team that never tidies feels permanently behind: slowness creates the very pressure that produces more mess.' },

    { type: 'scenario', title: 'Friday hotfix', intro: 'A checkout bug is costing money. You find the cause in a 200-line function with confusing names. Your boss wants it fixed **today**.',
      meters: { 'speed': 60, 'code health': 50 },
      steps: [
        { text: 'You spot the one-line fix. While you are in there, you notice three badly named variables near it. What do you do?',
          choices: [
            { label: 'Fix the bug, then rename those three variables in a separate small commit', score: 2, effects: { 'speed': -5, 'code health': 15 }, feedback: 'The boy scout rule in action. The fix ships quickly and the reviewer can see the rename is separate and safe.' },
            { label: 'Fix only the bug and leave the rest exactly alone', score: 1, effects: { 'speed': 5 }, feedback: 'Defensible under pressure, but you passed up a cheap improvement while the file was open. Interest keeps accruing.' },
            { label: 'Rewrite the whole function now, since you are here', score: 0, effects: { 'speed': -35, 'code health': 5 }, feedback: 'A big rewrite on a hotfix day is risky and slow. If it goes wrong, you have made a second bug while fixing the first.' }
          ] },
        { text: 'The fix is live. Your lead asks what to do about the rest of the 200-line function.',
          choices: [
            { label: 'Log it as known debt and tidy it in small steps whenever the team touches it', score: 2, effects: { 'code health': 15 }, feedback: 'Debt you have written down and are paying off gradually is manageable. It stops being a nasty surprise.' },
            { label: 'Say nothing; it works now', score: 0, effects: { 'code health': -15, 'speed': 5 }, feedback: 'Unnoticed debt is the dangerous kind. The next person to meet this function pays the interest with no warning.' },
            { label: 'Ask for a six-month freeze on features to clean up', score: 1, effects: { 'speed': -25, 'code health': 10 }, feedback: 'Well meant, but it is rarely approved and it is not needed. Steady small payments beat one heroic one.' }
          ] }
      ],
      outro: 'Pattern to keep: **fix the problem, leave a little tidier, and be honest about the debt that remains.**' },

    { type: 'explain', prompt: 'A manager says: "Messy code is fine as long as it works. Customers cannot see it." Explain why that is shaky, using the idea of technical debt.',
      model: 'Messy code works today but costs more every time someone has to change it, because they must work out what it does first. That is like interest on a loan. Left alone it makes every feature slower and riskier, and the team gets pressured into more shortcuts. Customers will not see the code, but they will feel the slower features and the new bugs.',
      keywords: ['read', 'interest', 'debt', 'slower', 'change', 'bugs'] }
  ],

  flashcards: [
    { q: 'Why does code readability matter so much?', a: 'Code is read far more often than it is written, so most of the cost of software is in understanding it before changing it.' },
    { q: 'What is technical debt?', a: 'The extra future cost of a shortcut taken today. Like a loan, it accrues interest each time someone has to work around the mess.' },
    { q: 'What is the boy scout rule for code?', a: 'Leave the code a little cleaner than you found it, with small improvements every time you touch it.' },
    { q: 'Name three signs a codebase is in trouble.', a: 'Simple changes take ages, fixes cause unrelated bugs, and people say "don’t touch that, nobody knows how it works".' },
    { q: 'Is clean code the same as clever code?', a: 'No. Clean code is plain and easy to read for the next person. Clever tricks are puzzles every reader must solve again.' }
  ],

  glossary: [
    { term: 'Clean code', def: 'Code that other people (and future you) can read, understand and change with confidence.', like: 'A kitchen wiped down as you go, so the next cook can start straight away.' },
    { term: 'Technical debt', def: 'The future cost created by a shortcut or messy design. It slows every later change until it is paid back.', like: 'A credit-card balance: the longer you leave it, the more it costs.', aka: ['tech debt'] },
    { term: 'Boy scout rule', def: 'The habit of leaving code slightly cleaner than you found it, in small improvements that accumulate.', like: 'Picking up one bit of litter on every walk.' },
    { term: 'Magic number', def: 'A bare number in code whose meaning is not obvious, such as `0.9` for a discount.', like: 'A locker combination written with no label on the locker.' }
  ],

  takeaways: [
    'Code is read far more than it is written, so **optimise for the reader**.',
    'Shortcuts are loans: **small and deliberate can be fine; unnoticed is dangerous.**',
    'Boy scout rule: leave it a little cleaner every time you touch it.',
    'Clean means *plain and clear*, not clever or short.'
  ],

  links: [
    { label: 'Martin Fowler: Technical Debt', url: 'https://martinfowler.com/bliki/TechnicalDebt.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-naming', {
  eli5: 'A good name tells the reader what something is or does, so they do not need a comment to explain it, and a comment that goes out of date cannot lie to them.',

  cards: [
    { kind: 'concept', title: 'What does process(data) do?',
      body: `Imagine finding this line in a codebase:

        \`\`\`js
        const result = process(data, true);
        \`\`\`

        Process what? What kind of data? What does \`true\` switch on? You must open the function, read it, and perhaps its callers, just to learn what the line means.

        A name is a tiny promise to the reader. A good one answers three questions without making them dig: **why does this exist, what does it do, how is it used?** That is called an **intention-revealing name**.

        Naming is the cheapest clean-code skill there is, and the one with the biggest payoff.` },

    { kind: 'metaphor', title: 'Moving boxes marked "STUFF"',
      body: `When you move house, you can label a box **STUFF**. Quick! Then you arrive and every box must be opened to find the kettle.

        Or you can write **KITCHEN: kettle, mugs, tea**. That takes five extra seconds, and saves an hour.

        Names in code are labels on boxes. \`data\`, \`info\`, \`temp\` and \`obj\` are all "STUFF". The label costs you almost nothing at the time, and the cost lands on everyone who opens the box later.

        The longer a box will sit in the loft (the longer the code will live), the more worth it a good label is.` },

    { kind: 'code', title: 'Before and after, names only',
      body: 'Not one line of logic changed in the second version, only the names. Tap the lines to see what each change buys.',
      code: { lang: 'js', src: `
        // before
        function calc(l, d) {
          const r = [];
          for (const x of l) {
            if (x.dt < d) r.push(x);
          }
          return r;
        }

        // after
        function findOverdueInvoices(invoices, today) {
          const overdue = [];
          for (const invoice of invoices) {
            if (invoice.dueDate < today) overdue.push(invoice);
          }
          return overdue;
        }`,
        notes: {
          2: '`calc` says nothing, and `l` looks like the number 1 in many fonts.',
          5: 'What is `dt`? Date? Datetime? Delta? You cannot tell without finding where it was set.',
          11: 'The function name tells you **what it returns**. The comment that used to be needed is gone.',
          14: '`invoice.dueDate < today` reads almost like an English sentence.'
        } } },

    { kind: 'compare', title: 'Names that waste the reader’s time',
      body: 'Three common ways names let you down, and what to do instead.',
      cols: ['Murky', 'Clear'],
      rows: [
        ['Vague', '`data`, `info`, `temp`, `thing`', '`customerEmails`, `unpaidInvoices`'],
        ['Abbreviated', '`usrLst`, `calcTtl`, `custAddr`', '`userList`, `calculateTotal`, `customerAddress`'],
        ['Noise word', '`UserData`, `OrderInfo`, `theAccount`', '`User`, `Order`, `account`'],
        ['Misleading', '`accountList` (really a Map)', '`accounts` or `accountsById`'],
        ['Only differs by number', '`file1`, `file2`', '`sourceFile`, `targetFile`']
      ] },

    { kind: 'concept', title: 'Verbs for actions, nouns for things',
      body: `A tidy rule of thumb that makes code read like prose:

        - **Functions do things, so name them with verbs:** \`sendReceipt\`, \`calculateTax\`, \`findUser\`.
        - **Classes and variables are things, so use nouns:** \`Invoice\`, \`ShoppingCart\`, \`overdueInvoices\`.
        - **Yes/no values read as questions:** \`isActive\`, \`hasPaid\`, \`canRefund\`.

        Compare \`if (user.active)\` with \`if (user.isActive)\`. And \`order.cancel()\` is obviously an action, while \`order.cancelled\` looks like a fact about it.

        When the grammar fits, code can almost be read aloud: *if the user has paid, send the receipt.*` },

    { kind: 'tip', title: 'Name length follows scope',
      body: `Does clear always mean long? No. Match the name to how far it travels.

        - A loop counter that lives for three lines can be \`i\`. Everyone understands it.
        - A variable used across a whole function deserves a real word.
        - A function called from fifty places needs a name that is **precise and complete**, because a reader will meet it without any context.

        The wider the audience, the more descriptive the name. Aim for **the shortest name that is still unambiguous**, and keep one word per idea: if you use \`fetch\` in one place, do not call the same thing \`get\`, \`retrieve\` and \`load\` elsewhere.` },

    { kind: 'code', title: 'A comment that lies',
      body: 'Comments are not checked by the computer. Code changes; comments quietly stay behind. Tap the highlights.',
      code: { lang: 'js', src: `
        // Returns the price including 20% VAT
        function priceForCustomer(basePrice, customer) {
          const rate = customer.isBusiness ? 0 : 0.2;
          return basePrice * (1 + rate);
        }`,
        notes: {
          1: 'Written when every customer paid 20%. True once.',
          3: 'Later, someone added a business exemption. They fixed the code and did not see the comment.',
          4: 'Now the comment is **wrong**, and wrong documentation is worse than none because people trust it.'
        } } },

    { kind: 'steps', title: 'Replacing a comment with a name',
      body: 'When you want to write a comment explaining a chunk of code, try this first.',
      steps: [
        { title: 'Notice the comment', body: 'For example: `// check the customer is allowed to buy alcohol`, above `if (c.age >= 18 && c.idChecked)`.' },
        { title: 'Ask what the comment is really naming', body: 'It is naming a **question**: "can this customer buy alcohol?"' },
        { title: 'Move the condition into a function with that name', body: '`function canBuyAlcohol(customer) { return customer.age >= 18 && customer.idChecked; }`' },
        { title: 'Call it', body: '`if (canBuyAlcohol(customer))` now says the same thing as the comment did.' },
        { title: 'Delete the comment', body: 'The code is **self-documenting**: it explains itself, and because the explanation is the code, it cannot go out of date.' }
      ] },

    { kind: 'concept', title: 'When comments genuinely help',
      body: `Be honest: experts disagree on how many comments is right. Some say "almost none"; others value a lot of documentation. The common ground is this: **code can say *what*, but only a comment can say *why*.**

        Good comments:

        - **Why** a surprising choice was made: \`// the API rejects dates before 2000, so clamp\`
        - A **warning**: \`// slow, do not call in a loop\`
        - A public function's contract, when others will use it without reading the body
        - A reminder note with a reason (\`remove once the old billing system is gone\`), ideally linked to a ticket

        Bad comments restate the code (\`i++ // add one to i\`), apologise for it, or sit there as dead code "just in case". Version control already remembers the old version.` },

    { kind: 'pitfall', title: 'Renaming safely, and not over-doing it',
      body: `A name is only good if it is **true**. Rename when the code changes meaning, not only when it is first written.

        Two traps to avoid:

        - **Over-long names.** \`calculateTheTotalPriceOfAllItemsInTheShoppingBasket\` is a comment pretending to be a name. If it takes a sentence, the function may be doing too much (a later lesson).
        - **Cute names.** \`nukeIt()\` and \`doTheThing()\` get a smile once and a groan forever.

        Use your editor’s **rename** feature, not find-and-replace. It updates every use and leaves unrelated words alone.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'Which of these names best follows the idea of an "intention-revealing" name?',
      options: ['`unpaidInvoices`', '`list2`', '`data`', '`theInvoiceInfoObject`'],
      answer: 0,
      why: [null, 'The `2` only says it came after `list`. It says nothing about what it holds.', 'Almost everything in a program is data, so the word adds nothing.', 'The extra words are noise. They do not say anything about what is in it.'],
      explain: '`unpaidInvoices` tells you what it holds and why you would use it, without you reading any of the code that fills it.' },

    { type: 'match', after: 4, prompt: 'Match each name to the kind of thing it should be.',
      pairs: [['`sendReceipt`', 'A function (a verb)'], ['`ShoppingCart`', 'A class (a noun)'], ['`hasPaid`', 'A yes/no value (a question)'], ['`overdueInvoices`', 'A variable holding a collection'], ['`i`', 'A loop counter, fine in a tiny scope']] },

    { type: 'spot', after: 6, prompt: 'This comment has stopped telling the truth. Tap the line that now contradicts it.',
      code: { lang: 'js', src: `
        // Free delivery for orders over £50
        function deliveryFee(order) {
          if (order.total > 75) return 0;
          return 4.99;
        }` },
      lines: [3],
      explain: 'The comment says £50, the code says £75. Nobody knows which is intended. When code and comment disagree, the reader cannot trust either, so a clearer function name or a named constant is safer than a comment.' },

    { type: 'ab', q: 'Which version is more self-documenting?',
      a: { lang: 'js', label: 'Commented', src: `
        // is the user allowed in the admin area?
        if (u.r === 3 || u.r === 4) {
          showAdmin();
        }` },
      b: { lang: 'js', label: 'Named', src: `
        if (user.canAccessAdminArea()) {
          showAdmin();
        }` },
      answer: 'b',
      explain: 'The name says what the condition means and the number codes are hidden in one place. The commented version needs the comment to be read, believed and kept in sync with `3` and `4`.' },

    { type: 'bucket', prompt: 'Would a good reviewer keep this comment or ask for a better name?', buckets: ['Keep the comment', 'Fix the code instead'],
      items: [['`// the supplier API rejects dates before 2000, so we clamp`', 0], ['`// loop through the users`', 1], ['`// WARNING: slow, never call inside a loop`', 0], ['`// d = days since last login`', 1], ['`// remove once the old billing system is gone (#412)`', 0], ['`i++ // add one to i`', 1]],
      explain: 'Keep comments that explain **why** or warn about something the code cannot say. Comments that translate the code, or decode a cryptic name, are signs the code should speak for itself.' },

    { type: 'cloze', code: true, text: 'function {{isOverdue}}(invoice, today) {\n  return invoice.dueDate < today;\n}\n\nconst {{customers}} = loadAllCustomers();',
      distractors: ['overdue', 'data', 'doOverdue'],
      explain: 'A function that answers yes/no reads best as a question (`isOverdue`). A variable holding many things reads best as a plural noun (`customers`).' },

    { type: 'order', prompt: 'Put the steps for replacing a comment with a well-named function in order.',
      items: ['Notice a comment explaining a condition', 'Work out what question or action it describes', 'Move the code into a function with that name', 'Call the new function where the code was', 'Delete the now-pointless comment'],
      explain: 'You cannot name the function until you know what the comment is describing, and you should delete the comment last, once the name carries the meaning.' },

    { type: 'scenario', title: 'The code review', intro: 'A teammate has asked you to review their pull request (a proposed change to the shared code). You are leaving comments on the **names** in a small order-processing function.',
      meters: { 'team mood': 70, 'code clarity': 40 },
      steps: [
        { text: 'You see `const d = getD(o);` with the comment `// get delivery date`. What do you write?',
          choices: [
            { label: 'Suggest `const deliveryDate = findDeliveryDate(order);` and drop the comment', score: 2, effects: { 'code clarity': 25, 'team mood': 5 }, feedback: 'The name now carries the meaning, and there is no comment to go stale. It is a small, specific, kind suggestion.' },
            { label: 'Say "this is unreadable, please rewrite it"', score: 0, effects: { 'team mood': -25, 'code clarity': 5 }, feedback: 'Rude and vague. Your teammate does not know what to change, and they will dread your reviews.' },
            { label: 'Approve it; there is a comment, after all', score: 1, effects: { 'code clarity': -5 }, feedback: 'The comment helps today but it duplicates a name that should have said it. Every future reader still sees `d` and `getD`.' }
          ] },
        { text: 'Further down: `function handleOrder(data, flag)`. It validates, saves and emails. What is the most useful naming point?',
          choices: [
            { label: 'Point out that `handleOrder` is vague, and that "validate, save and email" is three jobs', score: 2, effects: { 'code clarity': 20 }, feedback: 'Spot on. A name that is hard to make precise often means the function is doing too much, which the lessons ahead will tackle.' },
            { label: 'Ask them to make it longer: `handleTheOrderDataWithFlag`', score: 0, effects: { 'code clarity': -10 }, feedback: 'Longer and not clearer. Noise words and the mystery `flag` are still there.' },
            { label: 'Only mention that `data` could be called `orderData`', score: 1, effects: { 'code clarity': 8 }, feedback: 'A fair tweak, but it misses the bigger signal: a vague name usually hides a function with a vague purpose.' }
          ] }
      ],
      outro: 'Good naming feedback is **specific, kind and offers an alternative.** And a name that is hard to choose is often a design warning.' },

    { type: 'tf', statement: 'Even in self-documenting code, a comment explaining *why* something was done can still earn its place.', answer: true,
      explain: 'The aim is to let the code say *what* it does. Comments are still the right place for **why**: surprising constraints, warnings and context the code cannot express.' }
  ],

  flashcards: [
    { q: 'What three questions should a good name answer?', a: 'Why does it exist, what does it do, and how is it used?' },
    { q: 'How should functions, classes and yes/no values be named?', a: 'Functions as verbs (`sendReceipt`), classes and variables as nouns (`Invoice`), booleans as questions (`isActive`, `hasPaid`).' },
    { q: 'Why can a comment be worse than no comment?', a: 'Comments are not checked by the computer. When the code changes and the comment does not, it becomes wrong, and people trust it.' },
    { q: 'What can a comment say that code cannot?', a: 'Why: the reason for a surprising decision, a warning, or the contract of a public function.' },
    { q: 'What is "self-documenting code"?', a: 'Code whose names and structure explain what it does, so no comment is needed for the *what*.' }
  ],

  glossary: [
    { term: 'Intention-revealing name', def: 'A name that tells the reader why something exists, what it does and how to use it.', like: 'A box labelled "KITCHEN: kettle, mugs, tea" instead of "STUFF".' },
    { term: 'Noise word', def: 'A word added to a name that carries no extra meaning, such as `Info`, `Data` or `the`.', like: 'Calling a dog "Dog the Animal".' },
    { term: 'Self-documenting code', def: 'Code written with such clear names and structure that it explains itself without comments describing what it does.', like: 'A road sign you understand without a manual.' },
    { term: 'Magic number', def: 'A bare literal in code whose meaning is not obvious. Giving it a named constant explains it.', like: 'A locker code with no label.' }
  ],

  takeaways: [
    'A name should answer **why it exists, what it does and how it is used**.',
    'Verbs for functions, nouns for things, questions for yes/no values.',
    'Comments explain **why**; names and structure explain **what**.',
    'A comment that is out of date is worse than no comment.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-consistency-style', {
  eli5: 'A team should write code in one agreed style and let a tool enforce it automatically, so nobody wastes time arguing about spaces and brackets and everybody can read everybody’s code.',

  cards: [
    { kind: 'concept', title: 'The pull request with 400 changed lines',
      body: `A teammate fixes a typo in one function and opens a pull request. The diff shows **400 changed lines**.

        What happened? Their editor was set to use four spaces for indentation. The file used two. Saving re-indented everything, and the one real change is now buried somewhere in the noise.

        The review turns into a debate: tabs or spaces, single or double quotes, brackets on the same line or the next. Forty comments later, nobody has looked at whether the fix is right.

        This is what happens when a team has no shared style. **Consistency** means everyone writes code that looks the same, so the *differences* you see in a diff are real ones.` },

    { kind: 'metaphor', title: 'Which side of the road?',
      body: `Does it matter whether a country drives on the left or the right? Not at all. Both work perfectly well.

        What matters enormously is that **everybody picks the same one**. A road where half the drivers choose left and half choose right is a disaster, however good each individual driver's reasoning is.

        Code style is the same. Tabs and spaces are equally good. Two-space or four-space indentation is a coin toss. The value is not in the choice; it is in the **agreement**.

        So when you join a team, you do not "improve" the convention. You drive on their side of the road.` },

    { kind: 'code', title: 'A file that cannot make up its mind',
      body: 'Every line works. Together they make you slow down and re-check what you are reading. Tap the highlights.',
      code: { lang: 'js', src: `
        function get_user_orders(userId) {
          const Orders = db.query("SELECT * FROM orders WHERE user = ?", [userId])
          if(Orders.length == 0){
              return []
          }
          return Orders.map(o => formatOrder(o));
        }`,
        notes: {
          1: 'Snake_case here, but the rest of the project uses camelCase (`getUserOrders`).',
          2: 'A capital letter on a plain variable, double quotes, and no semicolon. Three habits in one line.',
          3: 'No space after `if`, none before the brace, and `==` where the rest of the codebase uses `===`.',
          4: 'Four spaces, while the line above used two. Your eye catches on this, even if you cannot say why.',
          6: 'Back to a semicolon. A reader now wonders: does the missing one earlier mean something?'
        } } },

    { kind: 'code', title: 'Layout is part of the message',
      body: 'Indentation and blank lines are not decoration. They tell the reader how the code is organised before they read a word.',
      code: { lang: 'js', src: `
        function placeOrder(cart, customer) {
          const items = cart.items;
          const total = sumPrices(items);

          if (total === 0) {
            throw new Error('Nothing to order');
          }

          const order = createOrder(customer, items, total);
          sendReceipt(customer, order);
          return order;
        }`,
        notes: {
          3: 'The **blank line** below works like a paragraph break: these first lines are "gather the inputs".',
          5: 'The **indent** shows what belongs inside the `if`. Misleading indentation makes bugs look like they are not there.',
          9: 'Another paragraph: "do the work". Related lines stay together, unrelated ones are separated.'
        } },
      note: 'Rule of thumb: code reads like a newspaper. The important headline first, the detail below it.' },

    { kind: 'concept', title: 'Style guides: deciding once',
      body: `A **style guide** is a written list of the team's conventions: how to name things, how to indent, how long a line may be, where brackets go.

        You rarely need to write one from scratch. Many are public and widely used. Python has **PEP 8**, the official style guide. Google publishes style guides for several languages. JavaScript has popular community ones such as Airbnb's. Go goes further: its standard tool, \`gofmt\`, formats code one way, so Go programmers hardly argue at all.

        Pick one, tweak only what you must, and write down the exceptions. Starting from a respected guide beats a week of meetings in which everyone's favourite rules are discussed.` },

    { kind: 'compare', title: 'Linter vs formatter',
      body: 'Two kinds of tool do the enforcing. They sound alike and do different jobs.',
      cols: ['Linter', 'Formatter'],
      rows: [
        ['Job', 'Reads code and **flags likely mistakes and rule breaks**', 'Rewrites code into **one consistent layout**'],
        ['Catches', 'Unused variables, `==` instead of `===`, unreachable code', 'Indentation, quotes, spacing, line breaks'],
        ['Fixes it?', 'Sometimes; often tells you and lets you decide', 'Always, automatically, on save'],
        ['Examples', 'ESLint (JavaScript), Pylint and Ruff (Python)', 'Prettier (JavaScript), Black (Python), `gofmt` (Go)']
      ] },

    { kind: 'sequence', title: 'Where the robots step in',
      body: 'The trick is to run the checks automatically at several points, so a human never has to say "please fix your formatting".',
      actors: ['Developer', 'Git hook', 'CI server'],
      steps: [
        { at: 0, label: 'saves a file', note: 'The editor runs the **formatter** on save. Spacing and quotes fix themselves. The developer does nothing.' },
        { from: 0, to: 1, label: 'git commit', note: 'A **pre-commit hook** (a small script git runs before every commit) runs the linter on changed files.' },
        { from: 1, to: 0, label: 'error: unused variable', dashed: true, note: 'It spots a leftover variable and refuses the commit. The developer fixes it in ten seconds.' },
        { from: 0, to: 2, label: 'git push', note: 'The commit goes to the shared repository. The server starts its **automated checks** (CI, later in the course).' },
        { from: 2, to: 0, label: 'style check passed', dashed: true, note: 'The same rules run on the server, because hooks can be skipped on a laptop. The server is the final word.' },
        { note: 'By the time a human reviews the code, style is already settled. They can spend their attention on **logic and design**.' }
      ] },

    { kind: 'steps', title: 'Ending the argument in an afternoon',
      body: 'Getting a team to a consistent style is a small, one-off job.',
      steps: [
        { title: 'Choose a base', body: 'Take a well-known style guide for your language. Do not invent one.' },
        { title: 'Add a formatter and a linter', body: 'Put their settings **in the repository**, so every machine uses the same rules.' },
        { title: 'Reformat everything once', body: 'Do this in a **single commit with no other changes**, so the huge diff is easy to ignore later.' },
        { title: 'Run it on save and on commit', body: 'Editor integration plus a pre-commit hook mean nobody has to remember.' },
        { title: 'Make CI fail on violations', body: 'The server check is the backstop that makes the rules stick.' }
      ] },

    { kind: 'pitfall', title: 'What style cannot do',
      body: `A formatter makes code **look** consistent. It cannot make it **clean**. A badly named, 300-line function formatted perfectly is still a badly named, 300-line function.

        Two more things to avoid:

        - **Mixing a reformat with a real change.** Keep them in separate commits, or reviewers cannot see what actually changed.
        - **Arguing about the rules in every review.** If the tool does not enforce it, it is a preference. If you really want to change a rule, change the tool's settings once, for everyone.

        And when you work in an existing codebase, follow its conventions, even if you would do it differently.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A team is split evenly on tabs versus spaces. According to the lesson, what matters most?',
      options: ['That everyone agrees on one, whichever it is', 'That they pick the option most professional developers prefer', 'That each developer uses whichever they find most comfortable', 'That the choice is made by the most experienced person'],
      answer: 0,
      why: [null, 'There is no proven winner. Teams succeed with either.', 'This is exactly how you get noisy diffs and mixed files.', 'Seniority is not the point. Agreement is.'],
      explain: 'Like driving on the left or the right, the benefit comes from everybody doing the same thing. Neither choice is technically better.' },

    { type: 'spot', after: 3, prompt: 'This function breaks the style used by the rest of its file (camelCase names, `===`, semicolons). Tap the line that breaks it most.',
      code: { lang: 'js', src: `
        const taxRate = 0.2;

        function addVat(price) {
          return price * (1 + taxRate);
        }

        function Total_With_Delivery(price, fee) {
          return addVat(price) + fee;
        }` },
      lines: [7],
      explain: 'Everything else is camelCase; `Total_With_Delivery` uses a different convention entirely. A reader has to wonder whether it is a different kind of thing, such as a class or an imported function.' },

    { type: 'match', after: 5, prompt: 'Match each tool or term to what it does.',
      pairs: [['Linter', 'Flags likely mistakes and rule breaks'], ['Formatter', 'Rewrites code into one consistent layout'], ['Style guide', 'A written list of the team’s conventions'], ['Pre-commit hook', 'A script git runs before each commit'], ['`gofmt`', 'Go’s official, one-way formatter']] },

    { type: 'bucket', prompt: 'Who should handle each of these: a tool or a human reviewer?', buckets: ['Automated tool', 'Human reviewer'],
      items: [['Two-space versus four-space indentation', 0], ['An unused variable left in the file', 0], ['Whether `process` is a clear name for this function', 1], ['Missing space after `if`', 0], ['Whether this logic handles refunds correctly', 1], ['Single or double quotes', 0], ['Whether the feature belongs in this module at all', 1]],
      explain: 'Anything that can be written as a rule belongs to a machine: it is faster, tireless and never offended. Humans should spend their attention on meaning, correctness and design.' },

    { type: 'ab', q: 'Which pull request is easier to review?',
      a: { lang: 'text', label: 'One mixed commit', src: `
        fix: handle empty carts
        - 412 lines changed in 9 files
        - re-indented every file
        - 3 lines of real logic` },
      b: { lang: 'text', label: 'Two commits', src: `
        1. style: reformat with Prettier (no logic)
        2. fix: handle empty carts
           - 3 lines changed in 1 file` },
      answer: 'b',
      explain: 'Separating the mechanical reformat from the real change lets the reviewer skip the reformat commit and read the real change properly. Mixed commits hide bugs among hundreds of whitespace edits.' },

    { type: 'order', prompt: 'Put the steps for adopting a team style in a sensible order.',
      items: ['Pick a well-known style guide as a base', 'Add a formatter and linter with settings in the repository', 'Reformat the whole codebase in one commit', 'Run the tools on save and on commit', 'Make the CI server fail on violations'],
      explain: 'Settings must exist before the tools run, and the one-off reformat comes before enforcement. Otherwise the first CI run would fail on thousands of old lines.' },

    { type: 'cloze', code: true, text: '{{if}} (total {{===}} 0) {\n  throw new Error(\'Nothing to order\');\n}\n// a good {{linter}} warns you if you wrote == here instead',
      distractors: ['for', '=', 'formatter'],
      explain: 'The strict comparison `===` avoids surprising conversions that `==` does. Spotting that kind of risky habit is the linter’s job, while the formatter only adjusts layout.' },

    { type: 'scenario', title: 'The never-ending review', intro: 'You join a team of five. Every pull request attracts a pile of comments about brackets, quotes and spacing. Reviews take days, and tempers are fraying.',
      meters: { 'team mood': 40, 'review speed': 30 },
      steps: [
        { text: 'At the retro (a regular team meeting about how work is going), what do you propose?',
          choices: [
            { label: 'Adopt a standard style guide and let a formatter enforce it automatically', score: 2, effects: { 'team mood': 25, 'review speed': 30 }, feedback: 'The argument disappears because there is nothing left to argue about: the tool decides, and it is never wrong, only consistent.' },
            { label: 'Vote on every rule at a two-hour meeting', score: 1, effects: { 'team mood': -5, 'review speed': 5 }, feedback: 'You will get a style, but you have also handed the team a two-hour debate and no enforcement. Rules nobody checks fade away.' },
            { label: 'Let each developer format their own code however they like', score: 0, effects: { 'team mood': -10, 'review speed': -15 }, feedback: 'The files become a patchwork, and every diff is full of one person’s habits fighting another’s.' }
          ] },
        { text: 'The formatter is installed. Running it will touch 80 files. How do you roll it out?',
          choices: [
            { label: 'Reformat everything in one commit with no logic changes, then enforce it in CI', score: 2, effects: { 'team mood': 10, 'review speed': 15 }, feedback: 'One noisy but harmless commit, clearly labelled. From then on every diff only shows real changes.' },
            { label: 'Reformat each file whenever someone happens to edit it', score: 1, effects: { 'review speed': -5 }, feedback: 'It avoids a big commit, but every pull request gets surprise formatting noise and the codebase stays inconsistent for months.' },
            { label: 'Mix the reformatting into a feature pull request', score: 0, effects: { 'team mood': -15, 'review speed': -20 }, feedback: 'The reviewer cannot find the real feature in 80 files of whitespace. Never mix mechanical and meaningful changes.' }
          ] }
      ],
      outro: 'Style is a **solved problem** once you automate it: decide once, enforce by machine, spend human attention elsewhere.' },

    { type: 'tf', statement: 'If a formatter has made all the code in a file look consistent, the file is now clean code.', answer: false,
      explain: 'Formatting only affects layout. Unclear names, huge functions and tangled logic are untouched. Consistent style is a foundation for clean code, not the whole of it.' }
  ],

  flashcards: [
    { q: 'Why does consistency matter more than which style you pick?', a: 'Mixed styles slow readers down and fill diffs with noise. The value comes from everyone agreeing, as with driving on one side of the road.' },
    { q: 'What is the difference between a linter and a formatter?', a: 'A linter flags likely mistakes and rule breaks; a formatter rewrites code into one consistent layout automatically.' },
    { q: 'What is a style guide, and should you write your own?', a: 'A written list of coding conventions. Usually start from a respected public one (PEP 8, Google’s, Airbnb’s) rather than inventing one.' },
    { q: 'Why run the style check in CI as well as locally?', a: 'Local hooks can be skipped. The server check is the backstop that makes the rules apply to everyone.' },
    { q: 'Why should a mass reformat be its own commit?', a: 'So reviewers can ignore the mechanical changes and see the real logic changes clearly.' }
  ],

  glossary: [
    { term: 'Style guide', def: 'A written set of conventions for naming, layout and structure that a team agrees to follow.', like: 'The rules of the road: nobody loves them, everyone needs them.' },
    { term: 'Linter', def: 'A tool that scans code for probable mistakes and rule violations without running it.', like: 'A spell-checker for your code.' },
    { term: 'Formatter', def: 'A tool that automatically rewrites code into one consistent layout, such as Prettier, Black or `gofmt`.', like: 'A printer that sets everyone’s notes in the same typeface.' },
    { term: 'Pre-commit hook', def: 'A script that git runs automatically just before a commit is made, often used to run a formatter or linter.', like: 'A bouncer who checks your shoes before you come in.' }
  ],

  takeaways: [
    'Consistency beats personal taste: **agree once, then follow.**',
    'Layout is communication: indentation and blank lines show structure.',
    'Start from a standard style guide; do not invent one.',
    'Let a formatter and linter do the arguing, in the editor, on commit and in CI.'
  ],

  links: [
    { label: 'PEP 8: Style Guide for Python Code', url: 'https://peps.python.org/pep-0008/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-small', {
  eli5: 'Small functions and classes that each do one thing are easier to name, test and reuse, as long as you do not chop things into pieces so tiny that nobody can follow the story.',

  cards: [
    { kind: 'concept', title: 'The function you have to scroll',
      body: `You open \`processOrder\`. It starts at line 40 and ends at line 360. Halfway down is a loop with an \`if\` inside a \`for\` inside another \`if\`. Somewhere in there it sends an email.

        To change the receipt wording you must read all 320 lines, because you cannot tell which parts depend on which. Variables declared at the top are quietly modified at the bottom.

        Big units are hard to **name** (what do you call something that does nine things?), hard to **test** (you must set up everything at once) and hard to **reuse** (you cannot borrow one step without taking all nine).

        The fix is to make things small. But "small" needs a sharper meaning than "short".` },

    { kind: 'metaphor', title: 'The recipe that stays at one level',
      body: `A good recipe reads: *make the sauce, cook the pasta, combine, serve.* Each line is a step you could expand if you needed to.

        A bad recipe reads: *make the sauce, **finely dice exactly 3mm cubes of onion**, cook the pasta, **sprinkle 4g of salt**, serve.* The big steps and the tiny details are jumbled together, so you cannot skim it.

        That is **one level of abstraction per function**. A function should either say *what happens, at a high level*, or deal with *the fiddly detail*, not both at once. High-level code calls the detail code by name.` },

    { kind: 'code', title: 'Before: two levels in one function',
      body: 'Tap the lines to see the levels jumbled together.',
      code: { lang: 'js', src: `
        function checkout(cart, customer) {
          if (cart.items.length === 0) throw new Error('Empty cart');
          let total = 0;
          for (const item of cart.items) {
            total += item.price * item.qty;
          }
          if (customer.isMember) total = total * 0.95;
          const order = { customerId: customer.id, total: total };
          db.insert('orders', order);
          const body = 'Thanks ' + customer.name + ', you paid £' + total;
          mailer.send(customer.email, 'Your receipt', body);
          return order;
        }`,
        notes: {
          2: 'High level: "an empty cart is not allowed".',
          4: 'Low level: how to add up prices with a loop.',
          7: 'A business rule (member discount) buried in the arithmetic.',
          9: 'Low level again: a database call.',
          10: 'The wording of an email, built by hand, in the middle of an order function.'
        } } },

    { kind: 'steps', title: 'Extract method, step by step',
      body: 'The main tool for shrinking functions is **extracting** a block of code into a function of its own.',
      steps: [
        { title: 'Pick a block that does one nameable thing', body: 'The loop that adds up prices is "calculate the cart total". If you cannot name it, choose a different block.' },
        { title: 'Copy it into a new function', body: 'Anything the block reads from outside becomes a **parameter**. Whatever it produces becomes the **return value**.' },
        { title: 'Replace the original with a call', body: '`const subtotal = cartTotal(cart);` takes the place of the loop.' },
        { title: 'Run the tests', body: 'Nothing should have changed. If something did, undo and take a smaller step.' },
        { title: 'Repeat for the next block', body: 'Stop when the original function reads like a short summary of the steps.' }
      ] },

    { kind: 'code', title: 'After: the function tells the story',
      body: 'Every line is now at the same level. The detail lives in the helpers, one hop away.',
      code: { lang: 'js', src: `
        function checkout(cart, customer) {
          requireItems(cart);
          const total = applyMemberDiscount(cartTotal(cart), customer);
          const order = saveOrder(customer, total);
          sendReceipt(customer, total);
          return order;
        }`,
        notes: {
          2: 'The empty-cart rule has a name. If it grows, only `requireItems` changes.',
          3: 'The discount rule is findable by name, and testable on its own.',
          5: 'Changing the email wording now means opening `sendReceipt`, not scrolling through checkout.'
        } },
      note: 'Read the five lines aloud: it is a summary a new joiner could follow.' },

    { kind: 'concept', title: 'The "and" test for classes and files',
      body: `The same idea works for bigger units. Describe a class in one sentence. If you need an **"and"**, it is probably two classes:

        - "\`InvoiceCalculator\` works out totals **and** prints PDFs" is two jobs.
        - "\`InvoiceCalculator\` works out totals and discounts" is one job with two details.

        Files follow the same rule. A \`utils.js\` file with 2,000 lines of unrelated functions is a junk drawer. If you must scroll to find things, or two people constantly edit it at once, split it by topic.

        Size is a *symptom*; the real question is **"does this have one clear purpose?"**` },

    { kind: 'code', title: 'Too many parameters',
      body: 'A function with a long argument list is another way of being too big. Tap the lines.',
      code: { lang: 'js', src: `
        // before
        createUser('Sam', 'sam@example.com', 34, 'UK', 'en', 'Europe/London');

        // after
        createUser({
          name: 'Sam',
          email: 'sam@example.com',
          age: 34,
          country: 'UK'
        });`,
        notes: {
          2: 'Six values in a fixed order. Is 34 the age or the postcode area? You must open the function to find out, and swapping two strings fails silently.',
          5: 'One **parameter object**: every value carries its own label, order no longer matters, and optional ones can simply be left out.'
        } },
      note: 'A common rule of thumb: zero to two arguments is lovely, three needs a reason, four or more is a signal. Parameters that always travel together often belong in one object.' },

    { kind: 'pitfall', title: 'When small goes too far',
      body: `Some people take "small functions" to an extreme: five-line classes, one-line functions, a feature spread across thirty files. Reading it feels like a **treasure hunt** where every clue says "see another file".

        Experts honestly disagree about how small is small enough. Some advocate functions of a few lines; others warn that too many shallow pieces just *move* the complexity into the gaps between them.

        A sensible test: **does splitting make the code easier to read?** If you need to jump around to follow a simple idea, you have gone too far. Extract when the new name explains something. Do not extract just to hit a line count.` },

    { kind: 'tip', title: 'Rules of thumb that hold up',
      body: `Not laws, just good starting points:

        - A function **fits on one screen** and has a name without "and".
        - It does either "decide what happens" or "do the detail", not both.
        - Prefer **few parameters**; group the ones that travel together.
        - Deeply nested code (a loop inside an if inside a loop) is a cue to extract.
        - Things that **change together** stay together; things that change separately split apart.

        When in doubt, make the change **small and reversible**, and check whether the code got easier to read.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What does "one level of abstraction per function" mean?',
      options: ['It either tells the big story or handles detail, not both', 'A function may only ever call one other function', 'Every function must be under five lines long', 'A function should never contain a loop of its own'],
      answer: 0,
      why: [null, 'It can call as many as it needs, as long as they sit at the same level.', 'Length is a symptom. The rule is about the mix of big steps and tiny details.', 'Loops are fine. They just belong in a function whose job is the loop.'],
      explain: 'Mixing "send the receipt" with "sprinkle exactly 4g of salt" makes a function impossible to skim. Keep each function at one level and let it call the detail by name.' },

    { type: 'spot', after: 2, prompt: 'This `checkout` function mixes levels. Tap the line that is **low-level detail** in a function otherwise made of high-level steps.',
      code: { lang: 'js', src: `
        function checkout(cart, customer) {
          requireItems(cart);
          const total = cartTotal(cart);
          const body = 'Thanks ' + customer.name + ', you paid £' + total;
          mailer.send(customer.email, 'Your receipt', body);
          saveOrder(customer, total);
        }` },
      lines: [4, 5],
      explain: 'Everything else is a named step. Lines 4 and 5 build the email text by hand, which is detail that belongs inside `sendReceipt`.' },

    { type: 'ab', after: 6, q: 'Which call is easier to read and harder to get wrong?',
      a: { lang: 'js', label: 'Positional', src: `
        scheduleDelivery(42, '2025-03-01', 'AM', true, 'Leave in porch');` },
      b: { lang: 'js', label: 'Parameter object', src: `
        scheduleDelivery({
          orderId: 42,
          date: '2025-03-01',
          window: 'AM',
          note: 'Leave in porch'
        });` },
      answer: 'b',
      explain: 'Labelled values explain themselves and cannot be swapped by accident. With five positional arguments the reader has to open the function just to learn what `true` means.' },

    { type: 'bucket', prompt: 'In a `checkout` function, is each step high-level or detail?', buckets: ['High-level step', 'Low-level detail'],
      items: [['Check the cart is not empty', 0], ['Loop over items adding `price * qty`', 1], ['Save the order', 0], ['Join strings to build the email body', 1], ['Send the receipt', 0], ['Multiply the total by 0.95', 1]],
      explain: 'High-level steps say *what* happens in the vocabulary of the business. Detail says *how*. A tidy function lists the first and hands the second to helpers.' },

    { type: 'order', prompt: 'Put the steps of extracting a method in order.',
      items: ['Pick a block that does one nameable thing', 'Copy it into a new function, with parameters and a return value', 'Replace the original block with a call to it', 'Run the tests to check behaviour is unchanged', 'Repeat for the next block'],
      explain: 'Choose and name first, then move, then swap in the call, and only then confirm nothing broke. Small steps with a check after each keep refactoring safe.' },

    { type: 'multi', q: 'Which of these suggest a class is doing too much?',
      options: ['Describing it needs the word "and"', 'Two teammates constantly edit it at the same time', 'It has a name like `Utils` and 2,000 lines', 'It has a single constructor', 'Every method relates to calculating one invoice'],
      answers: [0, 1, 2],
      explain: 'An "and" in the description, constant edit collisions and a junk-drawer name all hint at several jobs. A constructor, or methods that all serve one purpose, are normal.' },

    { type: 'cloze', code: true, text: 'function checkout(cart, customer) {\n  {{requireItems}}(cart);\n  const total = {{cartTotal}}(cart);\n  return saveOrder(customer, total);\n}',
      distractors: ['loop', 'doStuff', 'for'],
      explain: 'Good extracted names describe a step in the business story: *require items*, *work out the total*. The function now reads as a summary.' },

    { type: 'scenario', title: 'The 120-line function', intro: 'You are reviewing a pull request that adds 40 lines to `generateReport`, already 120 lines long. It builds a customer report, formats it as HTML and emails it. Tests exist but are slow and hard to set up.',
      meters: { 'readability': 30, 'risk': 50 },
      steps: [
        { text: 'You want to help without blocking the feature. What do you suggest?',
          choices: [
            { label: 'Extract the new logic into its own well-named function, and note the others as follow-up tidy-ups', score: 2, effects: { 'readability': 25, 'risk': -10 }, feedback: 'The new code starts clean and the old code can improve gradually. That follows the boy scout rule without stalling the work.' },
            { label: 'Refuse to approve until the entire function has been rewritten', score: 0, effects: { 'readability': 10, 'risk': 20 }, feedback: 'A big-bang rewrite of untested-in-isolation code is high risk, and the feature stalls for weeks.' },
            { label: 'Approve it unchanged; it is already long, what is 40 more lines?', score: 0, effects: { 'readability': -15, 'risk': 10 }, feedback: 'This is exactly how a 120-line function becomes a 400-line one. Each addition seems small.' }
          ] },
        { text: 'The author extracts `formatAsHtml` and `sendReport` as two functions of three lines each. A colleague says "too many tiny functions!". What is your view?',
          choices: [
            { label: 'They are fine: each has a clear name, one purpose and can be tested alone', score: 2, effects: { 'readability': 15, 'risk': -10 }, feedback: 'The test is whether splitting helped the reader. Named steps that can be tested alone usually pass it.' },
            { label: 'Merge them back; short functions are always a nuisance', score: 0, effects: { 'readability': -15 }, feedback: 'That undoes a real improvement because of a slogan. Size alone is not the rule.' },
            { label: 'Split further, so every function is one line', score: 1, effects: { 'readability': -5, 'risk': 5 }, feedback: 'Past a point you are just moving complexity between files. Stop when the next split would not add an explanatory name.' }
          ] }
      ],
      outro: 'Aim for code that is **easy to follow**, not code that hits a number. Extract when the new name adds meaning.' },

    { type: 'tf', statement: 'The best way to make code clean is to split it into as many tiny functions as possible.', answer: false,
      explain: 'Over-splitting scatters the story across many files and makes readers jump around. Split when it makes the code easier to read, and stop when it no longer does.' }
  ],

  flashcards: [
    { q: 'What is "one level of abstraction per function"?', a: 'A function either states what happens at a high level or handles the detail, not both. High-level code calls the detail code by name.' },
    { q: 'What is the "extract method" refactoring?', a: 'Moving a block of code into a new, well-named function and replacing the block with a call to it.' },
    { q: 'What is the "and" test?', a: 'Describe a class or function in one sentence. If it needs an "and" joining two different jobs, it probably should be split.' },
    { q: 'How do you fix a long parameter list?', a: 'Group values that travel together into one parameter object, so each value has a label and order stops mattering.' },
    { q: 'How do you know you have split code too far?', a: 'When you have to jump between many tiny pieces to follow one simple idea. Splitting should make code easier to read, not harder.' }
  ],

  glossary: [
    { term: 'Level of abstraction', def: 'How close code is to the high-level goal ("send a receipt") versus the low-level detail ("join these strings").', like: 'The difference between "make dinner" and "dice an onion to 3mm".' },
    { term: 'Extract method', def: 'A refactoring that moves a block of code into its own named function and calls it from the original place.', like: 'Turning a paragraph of a recipe into a named sub-recipe.', aka: ['extract function'] },
    { term: 'Parameter object', def: 'A single object that carries several related arguments, so each value is labelled and order does not matter.', like: 'Filling in a form with labelled boxes instead of reading out numbers in a fixed order.' },
    { term: 'Refactoring', def: 'Changing the internal structure of code without changing what it does.', like: 'Reorganising a kitchen without changing the menu.' }
  ],

  takeaways: [
    'One level of abstraction per function: either the story or the detail.',
    'Extract a block when you can give it a name that explains something.',
    'The "and" test: if the description needs an "and", split it.',
    'Small is a means, not a goal. Stop when splitting stops helping the reader.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-pure-functions', {
  eli5: 'A pure function is like a calculator: give it the same numbers and it always gives the same answer, and it changes nothing else along the way.',

  cards: [
    { kind: 'concept', title: 'The test that passed on Monday',
      body: `A developer writes a function that adds the right tax to a price, and a test that checks it. Green on Monday. On Tuesday the test fails. Nobody touched the code.

        Why? The function quietly looked up the **current date** to decide which tax rate applied, and the rate changed over the weekend. The same call gave a different answer, because something the function depended on was **not in its arguments**.

        This lesson is about a simple discipline that prevents a whole family of these bugs: functions whose result depends **only on what you hand them**, and which touch **nothing else**. They are called **pure functions**.` },

    { kind: 'metaphor', title: 'A calculator and a moody friend',
      body: `Type \`12 × 3\` into a calculator and you get 36. Today, tomorrow, upside down, on a train: **always 36**. And it does nothing else: no emails sent, no files changed.

        Now ask a moody friend, "should I take the job?" The answer depends on their mood, the weather, whether they've eaten. Ask again tomorrow and it may change. They might also tell your boss.

        A **pure function** is the calculator: same input, same output, no side trips. An **impure function** is the friend: answers depend on things you cannot see, and they act on the world.

        Both are useful in life. But you want to know which one you are talking to.` },

    { kind: 'code', title: 'Spotting the two kinds of impurity',
      body: 'Both functions look harmless. Tap the highlighted lines to see what makes them impure.',
      code: { lang: 'js', src: `
        let taxRate = 0.2;

        function priceWithTax(price) {
          return price * (1 + taxRate);
        }

        function addToBasket(basket, item) {
          basket.items.push(item);
          console.log('added', item.name);
          return basket;
        }`,
        notes: {
          4: 'A **hidden input**: `taxRate` is not an argument. If anything changes it, the same `price` gives a different answer.',
          8: 'A **side effect**: it changes the object that was passed in. Whoever else holds that `basket` just had it altered under them.',
          9: 'Another side effect: it writes to the console. Anything that affects the outside world, such as a file, database, network call or screen, counts.'
        } } },

    { kind: 'compare', title: 'Pure versus impure',
      body: 'A function is pure when it passes both of these tests.',
      cols: ['Pure', 'Impure'],
      rows: [
        ['Result depends on', 'Only its arguments', 'Arguments **and** hidden things: globals, the clock, a database, randomness'],
        ['Changes things outside?', 'No', 'Yes: edits its arguments, writes to a file, sends an email'],
        ['Call it twice', 'Same answer, nothing extra happens', 'Might differ, or do the thing twice'],
        ['Easy to test?', 'Very: just check input against output', 'Harder: you must set up and inspect the outside world'],
        ['Example', '`Math.max(3, 7)`, `price * quantity`', '`Math.random()`, `new Date()`, `db.save(order)`']
      ] },

    { kind: 'code', title: 'Why pure code is easy to test',
      body: 'A test of a pure function needs no setup, no clean-up and no clock. You hand it a value and check what comes back.',
      code: { lang: 'js', src: `
        function discountedTotal(total, tier) {
          if (tier === 'GOLD') return total * 0.9;
          return total;
        }

        console.assert(discountedTotal(100, 'GOLD') === 90);
        console.assert(discountedTotal(100, 'BASIC') === 100);`,
        notes: {
          6: 'No database, no fake clock, no special set-up. Run it a million times and it never flakes.',
          7: 'Each example is just a line. Adding another case takes ten seconds, so people actually write them.'
        } },
      note: 'Testing gets its own module. For now: the less a function touches, the less you need to arrange before checking it.' },

    { kind: 'concept', title: 'Hidden inputs hurt in a second way',
      body: `Impurity does not only make tests awkward. It makes **reading** harder too.

        When you see \`priceWithTax(50)\`, you assume the answer depends on 50. If it secretly depends on a global, on today's date or on the last order, you cannot reason about the call from the line alone. You have to go hunting.

        It also hurts when two parts of the program change the same shared thing. Function A edits the basket and function B, called later, sees a basket it did not expect. The bug appears far from its cause, which is the worst kind to debug.

        A pure function can be understood **by looking at it**, with nothing else in the world to check.` },

    { kind: 'diagram', title: 'Push the messy parts to the edges',
      body: 'A program cannot be pure all the way down: it must read data and write results. The trick is to keep that messiness in a **thin shell** and make the middle pure.',
      nodes: [
        { id: 'in', label: 'Read the world', icon: '📥', x: 1, y: 0, tone: 'warn' },
        { id: 'core', label: 'Pure core: decide', icon: '🧮', x: 1, y: 1, tone: 'good' },
        { id: 'out', label: 'Write to the world', icon: '📤', x: 1, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'in', to: 'core', label: 'plain values' }, { from: 'core', to: 'out', label: 'plain result' }
      ],
      caption: 'Edges: database, clock, network, screen. Middle: your business rules, as pure functions that are easy to test.' },

    { kind: 'code', title: 'Before and after: moving the effects out',
      body: 'The first version mixes the business rule with the clock and the database. The second keeps the rule pure.',
      code: { lang: 'js', src: `
        // before: decision and effects tangled together
        function applyLateFee(invoice) {
          if (new Date() > invoice.dueDate) {
            invoice.total += 5;
            db.save(invoice);
          }
        }

        // after: pure core, effects at the edge
        function lateFee(invoice, today) {
          return today > invoice.dueDate ? 5 : 0;
        }

        // the edge (the only impure part)
        const fee = lateFee(invoice, new Date());
        db.save({ ...invoice, total: invoice.total + fee });`,
        notes: {
          3: 'The clock is a hidden input. Testing "is it late?" means faking the date.',
          4: 'Mutates the argument, and the next line saves it. Two side effects in the middle of the rule.',
          10: '`today` is now an **argument**. Tests simply pass any date they like.',
          15: 'The impure bits (reading the clock, saving) live in one thin place, and the rule is one pure line.'
        } } },

    { kind: 'concept', title: 'Immutability: do not change, make a new one',
      body: `The simplest way to avoid side effects on your arguments is **immutability**: once a value is made, you do not change it. If you need a different version, you make a **copy**.

        \`\`\`js
        // changes the original (a side effect)
        basket.items.push(item);

        // makes a new basket and leaves the original alone
        const newBasket = { ...basket, items: [...basket.items, item] };
        \`\`\`

        The \`...\` copies everything across so you can override one part. A common surprise: \`const\` does **not** make an object immutable. It only stops the *variable* being re-pointed; the object's insides can still change.` },

    { kind: 'pitfall', title: 'Purity is a tool, not a religion',
      body: `A program with no side effects would do nothing: no input, no output, no saved orders. Real software exists to *cause effects*.

        The goal is not to ban them. It is to know **where they live** and keep them away from your decisions.

        A few sneaky impurities worth remembering: \`Math.random()\`, \`new Date()\`, reading a file or environment setting, and modifying an argument. Some teams also say logging is impure, but few worry about it in practice; this is a judgement call.

        The next module, on programming paradigms, goes much deeper into this style. For now: **prefer pure, and contain the rest.**` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Which of these is a pure function?',
      options: ['`function area(w, h) { return w * h; }`', '`function stamp(note) { return note + new Date(); }`', '`function roll() { return Math.ceil(Math.random() * 6); }`', '`function save(o) { db.insert(o); return o; }`'],
      answer: 0,
      why: [null, 'It reads the clock, a hidden input. The same note gives a different answer every time.', 'It depends on randomness, which is not in the arguments.', 'It writes to a database, which is a side effect.'],
      explain: '`area` depends only on its arguments and affects nothing else. The others read the clock, use randomness or change the outside world.' },

    { type: 'bucket', after: 3, prompt: 'Pure or impure?', buckets: ['Pure', 'Impure'],
      items: [['`price * quantity`', 0], ['`new Date()`', 1], ['`Math.max(a, b)`', 0], ['`list.push(x)` on a list passed in', 1], ['`fs.writeFile(path, data)`', 1], ['`name.toUpperCase()`', 0], ['`fetch(url)`', 1]],
      explain: 'Ask two questions: does the answer depend on anything that is not an argument? Does the call change anything outside itself? One "yes" makes it impure.' },

    { type: 'spot', prompt: 'Tap the line that makes `isExpired` impure.',
      code: { lang: 'js', src: `
        function isExpired(coupon) {
          const now = new Date();
          return coupon.expiresAt < now;
        }` },
      lines: [2, 3],
      explain: 'Reading the clock inside the function is a hidden input: the same coupon gives different answers over time and tests need a fake date. Taking `now` as an argument fixes it.' },

    { type: 'ab', after: 7, q: 'Which version is easier to test?',
      a: { lang: 'js', label: 'Reads the clock', src: `
        function isLate(invoice) {
          return new Date() > invoice.dueDate;
        }` },
      b: { lang: 'js', label: 'Takes the date', src: `
        function isLate(invoice, today) {
          return today > invoice.dueDate;
        }` },
      answer: 'b',
      explain: 'With the date as an argument, a test can pass any day it likes, in any order, at any time. The other version gives different answers depending on when the test runs.' },

    { type: 'tf', statement: 'You can still change the fields of an object declared with `const`.', answer: true,
      explain: '`const` only stops the variable being pointed at something else. You can still push to a `const` array or edit a `const` object’s fields. Immutability needs copying instead of editing.' },

    { type: 'cloze', code: true, text: 'function addItem(basket, item) {\n  return { ...basket, items: [...basket.items, {{item}}] };\n}\n// the original basket is {{unchanged}}',
      distractors: ['basket', 'deleted', 'mutated'],
      explain: 'Spreading builds a **new** basket with the extra item on the end. The original is untouched, so nobody else holding it is surprised.' },

    { type: 'order', prompt: 'Put the steps for pulling a side effect out of a function in order.',
      items: ['Find the hidden input or side effect inside the rule', 'Turn the hidden input into an argument', 'Make the function return a result instead of changing things', 'Do the reading and writing at the edge, around the call', 'Check the pure function with a few quick examples'],
      explain: 'First locate the impurity, then make inputs explicit and outputs returned. The edge code ties it back to the real world, and the new function is now trivial to check.' },

    { type: 'multi', q: 'Which are good reasons to prefer pure functions?',
      options: ['Their tests need almost no set-up', 'You can understand a call by looking at its arguments', 'Calling one twice gives the same result and does nothing extra', 'They run faster than impure functions', 'They remove the need for databases'],
      answers: [0, 1, 2],
      explain: 'Purity is about predictability, not speed. And you still need a database; you just keep the database calls at the edges, away from your decisions.' },

    { type: 'scenario', title: 'The test that fails on weekends', intro: 'Your team’s `discountFor(customer)` function reads `new Date()` to give a weekend discount. The tests fail every Saturday and nobody can work out why.',
      meters: { 'confidence in tests': 30, 'effort': 80 },
      steps: [
        { text: 'You have spotted the cause. What is the best fix?',
          choices: [
            { label: 'Pass `today` in as an argument; the caller supplies `new Date()`', score: 2, effects: { 'confidence in tests': 35, 'effort': -10 }, feedback: 'The hidden input is now visible. Tests can try any Saturday, Monday or leap day they like, deterministically.' },
            { label: 'Skip the weekend tests with a note: "flaky"', score: 0, effects: { 'confidence in tests': -20, 'effort': 5 }, feedback: 'Skipped tests are hidden bugs. The real problem, a hidden input, remains.' },
            { label: 'Change the test machine’s clock before each run', score: 1, effects: { 'confidence in tests': 5, 'effort': -5 }, feedback: 'It can work, but it is fragile and affects everything else on the machine. Fix the cause, not the symptom.' }
          ] },
        { text: 'The same function also calls `db.save(customer)` to record the discount. Where should that go?',
          choices: [
            { label: 'Out to the caller: the function returns the discount and the edge code saves it', score: 2, effects: { 'confidence in tests': 25 }, feedback: 'Now the rule is pure and the single impure step sits in one visible place.' },
            { label: 'Leave it; saving the result is part of "discounting"', score: 0, effects: { 'confidence in tests': -15 }, feedback: 'Then every test needs a database or a fake one, and calling it twice saves twice.' },
            { label: 'Replace `db.save` with `console.log` to see what happens', score: 0, effects: { 'confidence in tests': -10 }, feedback: 'That swaps one side effect for another and removes the real behaviour.' }
          ] }
      ],
      outro: 'Pattern: **make hidden inputs explicit, return results instead of acting, and let the edge do the touching.**' }
  ],

  flashcards: [
    { q: 'What makes a function pure?', a: 'Its result depends only on its arguments, and it changes nothing outside itself.' },
    { q: 'Name two kinds of impurity.', a: 'Hidden inputs (globals, the clock, randomness, a database) and side effects (changing arguments, writing files, sending emails).' },
    { q: 'Why is pure code easy to test?', a: 'You only pass values in and check the value that comes out. There is no set-up of the outside world.' },
    { q: 'What does "push side effects to the edges" mean?', a: 'Keep reading and writing (database, clock, network) in a thin outer layer, and keep the business rules in the middle as pure functions.' },
    { q: 'Does `const` make an object immutable?', a: 'No. It only stops the variable being reassigned; the object’s contents can still change.' }
  ],

  glossary: [
    { term: 'Pure function', def: 'A function whose output depends only on its inputs and which changes nothing outside itself.', like: 'A calculator.' },
    { term: 'Side effect', def: 'Anything a function does beyond returning a value: changing an argument, writing to a file, sending a message.', like: 'A waiter who answers your question and also rearranges the tables.' },
    { term: 'Hidden input', def: 'Something a function depends on that is not passed in as an argument, such as a global variable or the current time.', like: 'A recipe that says "bake until it is done" with no time or temperature.' },
    { term: 'Immutability', def: 'Not changing values after they are created. To "change" something you make an updated copy.', like: 'Photocopying a form and filling in the copy, rather than writing on the original.', aka: ['immutable'] }
  ],

  takeaways: [
    'Pure: **same input, same output, nothing else touched.**',
    'Hidden inputs and side effects are what make code surprising.',
    'Keep decisions pure; keep reading and writing at the edges.',
    'Copy instead of editing: `{ ...basket, items: [...] }`.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-complexity', {
  eli5: 'Every if and loop in a function is a fork in the road, and the more forks there are, the more routes a bug can hide on and the more tests you need to cover them.',

  cards: [
    { kind: 'concept', title: 'How many tests does this function need?',
      body: `A shipping function has an \`if\` for country, another for weight, another for express delivery, and one for gift wrapping. Four little questions, and each reads fine on its own.

        But a customer's order can answer them in different combinations: UK or not, heavy or light, express or standard, wrapped or plain. Sixteen combinations, at most. Did anyone ever try the *wrapped, heavy, express, abroad* one?

        Each branch is another way for the code to behave. **Cyclomatic complexity** is simply a way of counting those ways, so you can see a tangle coming before it bites.` },

    { kind: 'metaphor', title: 'Junctions on a walking route',
      body: `Imagine a walk with no junctions: one path, one way to go. Easy to describe, impossible to get lost.

        Now add a fork. Then another. Then a fork inside one of the branches. Soon you need a **map** to describe every possible route, and someone will always take the one you did not expect.

        Code has the same shape. Every \`if\`, \`else if\`, loop and \`case\` is a junction. The more junctions, the more routes, the more places for a bug to be waiting, and the harder it is to say "I have checked everything".` },

    { kind: 'code', title: 'Counting the paths',
      body: 'The usual quick count: **start at 1, then add 1 for every decision point.** Tap the highlighted lines.',
      code: { lang: 'js', src: `
        function shippingCost(order) {
          let cost = 5;
          if (order.country !== 'UK') cost += 10;
          if (order.weightKg > 20) cost += 8;
          for (const item of order.items) {
            if (item.fragile) cost += 2;
          }
          return cost;
        }`,
        notes: {
          1: 'Start: **1** (the straight line through the function).',
          3: 'First decision: **+1** → 2.',
          4: 'Second decision: **+1** → 3.',
          5: 'A loop is also a decision (go round again, or stop): **+1** → 4.',
          6: 'An `if` inside the loop: **+1** → 5. The complexity of this function is **5**.'
        } },
      note: 'Most tools also count `else if`, `case`, `&&`, `||` and `catch` as decisions. Exact rules vary a little between tools, but the idea is the same.' },

    { kind: 'concept', title: 'Complexity and the number of tests',
      body: `Complexity tells you roughly **how many tests it takes to walk every route**: a function with a score of 5 has five independent routes through it, so walking each one takes five tests. (Just making every branch run once can take fewer.)

        That is why high scores hurt twice:

        - The function is harder to read and hold in your head.
        - It needs more tests, and the combinations multiply, so in practice nobody writes them all.

        Teams often set a warning threshold, commonly somewhere around 10, and let their linter flag functions that go over. It is a guide, not a law, and the right number is partly taste.` },

    { kind: 'code', title: 'The arrow anti-pattern',
      body: 'When ifs nest inside ifs, the code drifts to the right in a shape like an arrowhead. Tap the lines.',
      code: { lang: 'js', src: `
        function refund(order, user) {
          if (order) {
            if (user) {
              if (user.isActive) {
                if (order.paid) {
                  issueRefund(order);
                  return 'refunded';
                }
              }
            }
          }
          return 'not refunded';
        }`,
        notes: {
          2: 'Every `if` adds a level of indentation to hold in your head.',
          6: 'The actual work is buried five levels deep, at the far right.',
          12: 'And the "else" cases are all lumped into one return, so you cannot tell *why* it was refused.'
        } } },

    { kind: 'code', title: 'Guard clauses: flatten it',
      body: 'A **guard clause** handles the unusual case first and returns straight away, so the main path reads in a straight line.',
      code: { lang: 'js', src: `
        function refund(order, user) {
          if (!order) return 'no order';
          if (!user || !user.isActive) return 'inactive user';
          if (!order.paid) return 'not paid';

          issueRefund(order);
          return 'refunded';
        }`,
        notes: {
          2: 'Check the problem, bail out early, move on. The reader can forget this case from here down.',
          4: 'Each refusal also gets its own reason, which the nested version could not give.',
          6: 'The **happy path** comes after a blank line, with no indentation at all.'
        } },
      note: 'Same decisions, so similar complexity. What dropped is the **nesting**, and that is what hurts a reader.' },

    { kind: 'code', title: 'Replace a conditional chain with a lookup',
      body: 'Long chains of `if`/`else if` that pick a value are often just a table in disguise.',
      code: { lang: 'js', src: `
        // before: a branch for every plan
        function monthlyPrice(plan) {
          if (plan === 'basic') return 5;
          else if (plan === 'plus') return 12;
          else if (plan === 'pro') return 30;
          else throw new Error('Unknown plan: ' + plan);
        }

        // after: data, not branches
        const PRICES = { basic: 5, plus: 12, pro: 30 };

        function monthlyPrice(plan) {
          if (!(plan in PRICES)) throw new Error('Unknown plan: ' + plan);
          return PRICES[plan];
        }`,
        notes: {
          3: 'Each new plan means another branch to read, and another test.',
          10: 'The rule becomes **data**. Adding a plan is one extra line in the table.',
          13: 'One guard clause covers every unknown plan, however many plans there are.'
        } } },

    { kind: 'code', title: 'Replace a conditional with polymorphism',
      body: 'When each branch does different *behaviour* (not just a value), let each kind carry its own. (Object-oriented programming gets a full lesson in the next module; here is a taste.)',
      code: { lang: 'js', src: `
        // before: every new method adds a branch
        function shippingFee(order) {
          if (order.method === 'standard') return 3.99;
          if (order.method === 'express') return 8.99 + order.weightKg;
          if (order.method === 'pickup') return 0;
        }

        // after: each kind knows its own answer
        class Standard { fee(order) { return 3.99; } }
        class Express  { fee(order) { return 8.99 + order.weightKg; } }
        class Pickup   { fee(order) { return 0; } }

        const fee = order.shipping.fee(order);`,
        notes: {
          3: 'The function has to know every kind of shipping that exists.',
          9: 'Each class is small and has exactly one rule. A new method is a new class, with no existing code edited.',
          13: 'The caller no longer asks "which kind?". It just asks for the fee.'
        } },
      note: 'Do not reach for classes for a three-way `if`. A plain lookup or a few branches is fine. Polymorphism pays off when the branches multiply and keep repeating in several places.' },

    { kind: 'pitfall', title: 'Do not golf the score',
      body: `Complexity is a **smell detector**, not a score to win. You can lower the number without making code clearer: cramming three decisions into one dense expression, or hiding branches inside a table nobody can follow.

        \`\`\`js
        // the same decisions, harder to read
        return a ? b ? c : d : e ? f : g;
        \`\`\`

        The aim is code a reader can follow. When a function scores high, ask *why* there are so many branches and whether they could be named, split or turned into data. Use the number to find the problem, then use your judgement to solve it.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What is the cyclomatic complexity of this function, using "start at 1, add 1 per decision"?',
      code: { lang: 'js', src: `
        function discount(order) {
          let d = 0;
          if (order.isMember) d += 5;
          if (order.total > 100) d += 10;
          return d;
        }` },
      options: ['3', '2', '4', '1'],
      answer: 0,
      why: [null, 'You have counted the decisions but forgotten the starting 1.', 'There are only two `if`s, so 1 + 2 = 3.', 'That would be a function with no decisions at all.'],
      explain: 'Start at 1 for the straight line, then add 1 for each of the two `if`s: 1 + 2 = 3. So walking each independent route takes three tests.' },

    { type: 'spot', after: 4, prompt: 'This is the arrow anti-pattern. Tap the line where the real work is buried deepest.',
      code: { lang: 'js', src: `
        function ship(order) {
          if (order) {
            if (order.paid) {
              if (order.address) {
                dispatch(order);
              }
            }
          }
        }` },
      lines: [5],
      explain: 'The only line that actually does anything is `dispatch(order)`, buried under three checks. Guard clauses (`if (!order) return;` and so on) would pull it back to the left margin.' },

    { type: 'ab', after: 5, q: 'Which version is easier to follow?',
      a: { lang: 'js', label: 'Nested', src: `
        function signup(user) {
          if (user.email) {
            if (user.age >= 18) {
              createAccount(user);
            }
          }
        }` },
      b: { lang: 'js', label: 'Guard clauses', src: `
        function signup(user) {
          if (!user.email) return;
          if (user.age < 18) return;

          createAccount(user);
        }` },
      answer: 'b',
      explain: 'Both make the same two checks. Dealing with the unusual cases first and leaving, so the main path has no indentation, means the reader can stop worrying about them straight away.' },

    { type: 'bucket', prompt: 'Which technique best removes this kind of complexity?', buckets: ['Guard clauses', 'Lookup table', 'Polymorphism'],
      items: [['Five levels of nested `if` checks on the same input', 0], ['Mapping country codes to tax rates in an `if` chain', 1], ['Each payment type needs different logic, and `switch` appears in six places', 2], ['Repeated `if (!x) { ... }` wrapping the whole function', 0], ['Mapping weekday numbers to names', 1], ['Each shape has its own way to calculate area', 2]],
      explain: 'Guard clauses flatten nesting. Lookups turn "pick a value" chains into data. Polymorphism helps when each branch is genuinely different *behaviour* that keeps reappearing.' },

    { type: 'cloze', code: true, text: 'function pay(order) {\n  if (!order.address) {{return}} \'no address\';\n  if (!order.paid) return \'unpaid\';\n\n  dispatch(order);\n}\n// these early exits are called {{guard}} clauses',
      distractors: ['throws', 'else', 'branch'],
      explain: 'Returning early on the problem cases means the happy path below sits at the left margin, uncluttered. That pattern is a guard clause.' },

    { type: 'tf', statement: 'A function with a cyclomatic complexity of 8 needs at least eight tests to cover every independent path.', answer: true,
      explain: 'The score counts the independent routes through the function, so walking each one takes that many tests. (Merely making every branch run once can need fewer.) High scores quietly demand a lot of testing.' },

    { type: 'multi', q: 'Which of these usually add to a function’s cyclomatic complexity?',
      options: ['An `if` statement', 'A `for` loop', 'A `case` in a `switch`', 'A comment', 'A variable declaration'],
      answers: [0, 1, 2],
      explain: 'Decisions and loops create new routes. Comments and plain declarations do not change how many ways the code can run.' },

    { type: 'order', prompt: 'Put the steps for flattening an arrow-shaped function in order.',
      items: ['Find the outermost `if` wrapping the whole function', 'Invert it: return early when the condition is false', 'Repeat for the next level of nesting', 'Leave the main work at the left margin', 'Run the tests to confirm nothing changed'],
      explain: 'Peel off one layer at a time from the outside in. Each step is small and checkable, and the happy path emerges un-indented at the end.' },

    { type: 'scenario', title: 'The linter says 23', intro: 'Your linter has started warning about `calculatePrice`, which has a complexity of 23. It is full of `if (customer.type === ...)` branches, and every new customer type adds more.',
      meters: { 'risk of bugs': 70, 'readability': 25 },
      steps: [
        { text: 'You are about to touch it to add a new customer type. What first?',
          choices: [
            { label: 'Make sure there are tests for the current behaviour, then refactor in small steps', score: 2, effects: { 'risk of bugs': -20, 'readability': 10 }, feedback: 'Refactoring must not change behaviour, and tests are how you know. Without them you are guessing.' },
            { label: 'Just add the extra branch and move on', score: 0, effects: { 'risk of bugs': 15, 'readability': -10 }, feedback: 'The 24th path joins the other 23. Every branch is another place for a bug to hide.' },
            { label: 'Rewrite the whole function from scratch tonight', score: 0, effects: { 'risk of bugs': 25, 'readability': 10 }, feedback: 'A rewrite without a safety net trades 23 known paths for unknown new bugs.' }
          ] },
        { text: 'The branches only differ in a few numbers: a rate per customer type. Which refactor fits?',
          choices: [
            { label: 'A lookup table of rates by customer type, plus one guard for unknown types', score: 2, effects: { 'risk of bugs': -25, 'readability': 30 }, feedback: 'The branches were data in disguise. Now a new type is one line and the function has almost no decisions.' },
            { label: 'Squeeze the conditions into nested ternaries to cut the count', score: 0, effects: { 'readability': -20 }, feedback: 'The score drops but the code gets worse. That is gaming the metric.' },
            { label: 'Turn every branch into its own class', score: 1, effects: { 'readability': 5, 'risk of bugs': -5 }, feedback: 'It works, but classes are overkill when the branches only differ by a number. Pick the lightest tool that fits.' }
          ] }
      ],
      outro: 'Use the number to **find** the problem, then choose the lightest fix that makes the code clearer.' }
  ],

  flashcards: [
    { q: 'How do you quickly count cyclomatic complexity?', a: 'Start at 1 and add 1 for each decision point: `if`, loop, `case`, and in most tools `&&`, `||` and `catch`.' },
    { q: 'What does complexity tell you about testing?', a: 'It is roughly the number of tests needed to walk every independent path. Just running every branch once can take fewer.' },
    { q: 'What is the arrow anti-pattern?', a: 'Deeply nested ifs that push the real work to the far right, in the shape of an arrowhead.' },
    { q: 'What is a guard clause?', a: 'An early return that handles an unusual or invalid case first, so the main path is not nested.' },
    { q: 'When can you replace a conditional with a lookup table?', a: 'When the branches just pick a value, such as a price per plan. The rule becomes data instead of code.' }
  ],

  glossary: [
    { term: 'Cyclomatic complexity', def: 'A count of the independent paths through a piece of code: start at 1 and add 1 for each decision point.', like: 'Counting the junctions on a walking route.' },
    { term: 'Arrow anti-pattern', def: 'Code with so many nested conditions that its indentation forms an arrowhead pointing right.', like: 'A set of Russian dolls where the interesting one is the smallest.' },
    { term: 'Guard clause', def: 'A check at the top of a function that deals with an unusual case and returns early.', like: 'A ticket check at the door: the wrong people are turned away, and everyone inside can relax.', aka: ['early return'] },
    { term: 'Polymorphism', def: 'Letting different kinds of object respond to the same call in their own way, instead of branching on the kind.', like: 'Saying "dinner’s ready" and each person coming in their own way.' }
  ],

  takeaways: [
    'Complexity = **1 + decisions**: each branch is another path a bug can hide on.',
    'More paths mean more tests, and the combinations multiply quickly.',
    'Flatten arrows with **guard clauses**: handle problems first, then the happy path.',
    'Branches that only pick a value are data: use a lookup table.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-nulls-booleans', {
  eli5: 'Passing null around means "nothing" can sneak into any function and crash it, and passing true or false to switch behaviour hides two different functions inside one name.',

  cards: [
    { kind: 'concept', title: 'Cannot read properties of undefined',
      body: `If you write JavaScript for long enough, you meet this error. It is probably the most common crash in the language:

        \`TypeError: Cannot read properties of undefined (reading 'name')\`

        Here is how it happens. A function looks up a user. Sometimes there is no such user, so it returns \`null\` to mean "nobody". The caller, who never thought of that, writes \`findUser(id).name\`. And boom.

        Nothing in the code warned either of them. \`null\` is a value that fits **everywhere**, silently, and explodes only when someone finally uses it. Two tiny things, **null** and **true/false flags**, cause a surprising share of everyday pain.` },

    { kind: 'history', title: 'The billion-dollar mistake',
      body: `The idea of a **null reference** (a variable that points at "nothing") was added to a programming language called ALGOL W in 1965 by the computer scientist **Tony Hoare**. It was easy to add, so he did.

        Decades later, he called it his **"billion-dollar mistake"**, saying it had probably caused countless errors, vulnerabilities and crashes over the years. He was not giving a precise figure; it was his way of saying the cost was enormous.

        Many newer languages respond by making "might be nothing" something the language **forces you to handle**. Rust has \`Option\`, Java has \`Optional\`, and TypeScript can check for it. The lesson for everyone: *absence is a real case, so say so openly.*` },

    { kind: 'metaphor', title: 'The vending machine slot',
      body: `Picture a vending machine. You press B4, reach into the slot and **grab**. Usually a crisp packet is there. Sometimes the machine is empty, and your hand closes on air.

        What goes wrong is not the empty slot. It is that nothing **told you** it was empty. You reached in on trust.

        A function that might return \`null\` is that machine with no "SOLD OUT" light. Every caller has to remember to check, and the one who forgets finds out in front of a customer.

        Good designs either **always put something in the slot** (a sensible default) or **light the sign** (make "nothing" impossible to ignore).` },

    { kind: 'pitfall', title: 'Null checks everywhere',
      body: 'When any value might be null, defensive checks spread through the codebase like damp. Tap the lines.',
      code: { lang: 'js', src: `
        function greeting(user) {
          if (user !== null && user !== undefined) {
            if (user.profile !== null && user.profile !== undefined) {
              if (user.profile.name) {
                return 'Hello, ' + user.profile.name;
              }
            }
          }
          return 'Hello';
        }`,
        notes: {
          2: 'The check is needed because *someone, somewhere* might pass nothing. And so it is repeated in every function.',
          3: 'Nested again, and the arrow shape from the complexity lesson is back.',
          9: 'The actual behaviour (a plain greeting) is hidden among the guarding. And nobody knows whether `null` here means "guest" or "bug".'
        } } },

    { kind: 'code', title: 'Better: never hand out nothing',
      body: 'Instead of returning null, return something the caller can use safely.',
      code: { lang: 'js', src: `
        // 1. A collection: return an empty one, never null
        function findOrdersFor(userId) {
          return db.query('...', [userId]) || [];
        }

        // 2. A null object: a stand-in that behaves sensibly
        const GUEST = { name: 'Guest', isLoggedIn: false };

        function currentUser(session) {
          return session.user ? session.user : GUEST;
        }

        console.log('Hello, ' + currentUser(session).name);`,
        notes: {
          3: 'The caller can loop over the result without a check. An empty list simply does nothing.',
          7: 'A **null object**: a real object that stands in for "nobody", with safe, boring behaviour.',
          10: 'Callers just use the result. The special case is dealt with once, here.',
          13: 'No `if`, no crash. A guest simply gets "Hello, Guest".'
        } } },

    { kind: 'compare', title: 'Ways to say "nothing here"',
      body: 'There is no single best answer. It depends what "nothing" means in this case.',
      cols: ['What it looks like', 'Good when'],
      rows: [
        ['Empty collection', '`[]`, `{}`', 'The answer is "zero things". Callers can loop freely.'],
        ['Null object', 'A `GUEST` user, a `NoDiscount`', '"None" has a sensible default behaviour.'],
        ['Optional type', 'Java `Optional`, Rust `Option`, TypeScript `User | undefined`', 'The caller **must** decide what to do. The language checks they did.'],
        ['Throw an error', '`throw new NotFoundError(id)`', 'Absence means something is wrong, not just empty.'],
        ['Plain `null`', '`return null;`', 'Last resort. Document it, and expect callers to forget.']
      ],
      },

    { kind: 'code', title: 'Flag arguments: two functions in a trench coat',
      body: 'A boolean argument usually means the function does **one thing if true and another if false**. Tap the lines.',
      code: { lang: 'js', src: `
        // before
        sendEmail(user, true);
        sendEmail(order, false);

        function sendEmail(target, isReceipt) {
          if (isReceipt) { /* build receipt */ }
          else { /* build reminder */ }
        }

        // after
        sendReceipt(order);
        sendPaymentReminder(user);`,
        notes: {
          2: 'What does `true` mean? The reader cannot tell without opening the function.',
          6: 'The function is two functions sharing a name. Its body begins with a fork.',
          11: 'Each call now says exactly what it does, and each function has one job.'
        } },
      note: 'A flag is not always wrong. But if you pass `true` or `false` straight into a call, ask whether it should be two named functions.' },

    { kind: 'code', title: 'Defaults and overloads',
      body: 'Often the flag or null is only standing in for "the caller did not say". A default value handles that cleanly.',
      code: { lang: 'js', src: `
        // default parameter: the usual case needs no argument
        function paginate(items, pageSize = 20) {
          return items.slice(0, pageSize);
        }

        paginate(orders);        // 20 per page
        paginate(orders, 50);    // 50 per page

        // an options object: callers name only what they change
        function exportReport(data, { format = 'pdf', landscape = false } = {}) {
          /* ... */
        }
        exportReport(data, { landscape: true });`,
        notes: {
          2: 'The default is written in the signature, so nobody passes `null` to mean "use the usual".',
          10: 'Named options with defaults replace a trail of positional booleans.',
          13: 'Reads like a sentence: export the data, landscape.'
        } },
      note: 'In Java and C# you can also write several **overloads** of one name with different parameters (`print(doc)` and `print(doc, copies)`). JavaScript has no overloads, so defaults and options objects do the same job.' },

    { kind: 'sequence', title: 'Fail fast at the boundary',
      body: 'Do not let bad values wander deep into the system. Check them **once, at the door**, and fail loudly.',
      actors: ['Browser', 'Entry point', 'Order logic'],
      steps: [
        { from: 0, to: 1, label: 'POST /orders (no customerId)', note: 'A request arrives with a vital field missing.' },
        { at: 1, label: 'validate input', note: 'The entry point checks everything it needs, **right away**, before doing any work.' },
        { from: 1, to: 0, label: '400: customerId is required', dashed: true, note: 'It refuses with a clear message. The mistake is reported where it was made, and nothing has been touched.' },
        { from: 0, to: 1, label: 'POST /orders (valid)', note: 'The caller fixes it and tries again.' },
        { from: 1, to: 2, label: 'placeOrder(customerId, items)', note: 'Only checked, complete values go past the door.' },
        { note: 'Inside, the logic can **trust its inputs** and drop the defensive `if (x == null)` clutter. One guard at the edge replaces fifty scattered ones.' }
      ] }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What was the main idea behind modern designs such as Rust’s `Option` or Java’s `Optional`?',
      options: ['Make "might be nothing" visible, so the caller is forced to handle it', 'Make nulls run faster in the compiler', 'Allow programmers to hide missing values more easily', 'Remove the need to ever write an `if` statement'],
      answer: 0,
      why: [null, 'Speed was not the issue. Surprise crashes were.', 'The opposite: they make missing values harder to ignore.', 'You still make decisions. The point is that you cannot forget to.'],
      explain: 'The problem with null is that it hides. An optional type puts absence in the open, so the caller must say what happens when there is nothing.' },

    { type: 'ab', after: 4, q: 'Which version of `findOrders` is safer for callers?',
      a: { lang: 'js', label: 'Returns null', src: `
        function findOrders(userId) {
          const rows = db.query('...', [userId]);
          return rows.length ? rows : null;
        }` },
      b: { lang: 'js', label: 'Returns a list', src: `
        function findOrders(userId) {
          return db.query('...', [userId]);   // [] if none
        }` },
      answer: 'b',
      explain: '"No orders" is just a list with zero items. Callers can loop over it without a check, while a possible `null` means every caller must remember to test for it.' },

    { type: 'spot', after: 5, prompt: 'Tap the line where a boolean flag hides what the call is doing.',
      code: { lang: 'js', src: `
        const order = loadOrder(42);
        const total = calculateTotal(order);
        notifyCustomer(order, true);
        archive(order);` },
      lines: [3],
      explain: 'What does `true` mean: urgent? Silent? By email? A reader cannot tell without opening `notifyCustomer`. Separate named functions, or a named option, would say it for them.' },

    { type: 'bucket', prompt: 'Which approach fits each situation best?', buckets: ['Empty collection', 'Null object', 'Optional / error'],
      items: [['A customer has placed no orders yet', 0], ['A visitor who is not logged in needs a name to display', 1], ['A payment lookup by ID that must exist, but does not', 2], ['A search that matches nothing', 0], ['No discount applies, so the price should not change', 1], ['A caller must decide what to do if the user is missing', 2]],
      explain: '"Zero things" is an empty collection. "None, but still behaves sensibly" is a null object. When absence is meaningful, or an error, make the caller deal with it explicitly.' },

    { type: 'cloze', code: true, text: 'function paginate(items, pageSize {{=}} 20) {\n  return items.slice(0, pageSize);\n}\n\npaginate(orders);   // uses the {{default}}',
      distractors: ['null', '==', 'optional'],
      explain: 'A default parameter handles "the caller did not say" without anyone passing `null` or a magic flag to mean the usual behaviour.' },

    { type: 'tf', statement: 'Passing `true` or `false` into a function is always bad practice and should never be done.', answer: false,
      explain: 'A flag is a smell, not a crime. Setting a simple property like `setVisible(true)` is fine. The warning is for flags that choose between two different behaviours, which usually want two functions.' },

    { type: 'match', prompt: 'Match each technique to the problem it solves.',
      pairs: [['Return an empty list', 'Callers can loop without checking for null'], ['Null object', 'A safe stand-in for "nobody" with default behaviour'], ['Split into two functions', 'A boolean flag was choosing the behaviour'], ['Default parameter', 'The caller often does not supply a value'], ['Validate at the entry point', 'Bad values are rejected once, near their source']] },

    { type: 'scenario', title: 'The crash at checkout', intro: 'Production logs show `Cannot read properties of null (reading \'email\')` at checkout. It happens when a guest customer, with no account, pays.',
      meters: { 'customer impact': 70, 'code health': 40 },
      steps: [
        { text: 'You trace it to `order.customer.email` where `customer` is `null` for guests. What is the best first fix?',
          choices: [
            { label: 'Give guest orders an explicit guest customer object with a clear `email` field, and fix the source of the null', score: 2, effects: { 'customer impact': -40, 'code health': 25 }, feedback: 'It removes the cause: nothing is passed around as "maybe nothing". Every other place that reads `customer` is protected too.' },
            { label: 'Add `if (order.customer) { ... }` just at this one line', score: 1, effects: { 'customer impact': -30, 'code health': 0 }, feedback: 'It stops the crash here. But `customer` is still null in a dozen other places, waiting for the next unlucky line.' },
            { label: 'Wrap the whole checkout in a `try/catch` that swallows the error', score: 0, effects: { 'customer impact': 10, 'code health': -25 }, feedback: 'Now guests pay and no receipt is ever sent, and nobody knows why. Silent failure is worse than a crash.' }
          ] },
        { text: 'The same function is `sendReceipt(order, true)`, where `true` means "send the PDF". What do you do while you are here?',
          choices: [
            { label: 'Replace the flag with `sendReceiptWithPdf(order)` and `sendReceipt(order)`', score: 2, effects: { 'code health': 20 }, feedback: 'Callers now say what they mean, and each function has one job. A good, small boy-scout fix.' },
            { label: 'Leave it. It works today', score: 1, effects: { 'code health': 0 }, feedback: 'Fair under pressure, but you will meet the next `true` and not know what it does.' },
            { label: 'Add a second flag for the email format', score: 0, effects: { 'code health': -20 }, feedback: 'Flags multiply. Two booleans mean four behaviours, and every call site becomes a puzzle.' }
          ] }
      ],
      outro: 'Fix the **source** of a null, not each symptom. And whenever a boolean picks between two behaviours, give each behaviour its own name.' },

    { type: 'multi', q: 'Which of these are good ways to avoid passing `null` around?',
      options: ['Return an empty list for "no results"', 'Use a null object with safe default behaviour', 'Reject bad input at the entry point with a clear error', 'Add `!== null` checks to every function', 'Use `null` to mean "unknown", "empty" and "error" interchangeably'],
      answers: [0, 1, 2],
      explain: 'The good options remove or contain the null. Checks in every function are a symptom of the problem, and one value meaning three things guarantees confusion.' }
  ],

  flashcards: [
    { q: 'What was the "billion-dollar mistake"?', a: 'Tony Hoare’s name for inventing the null reference in 1965: a value that fits everywhere and causes crashes when used.' },
    { q: 'What is a flag argument, and why is it a smell?', a: 'A boolean parameter that switches behaviour. The function is really two functions, and the call site (`send(x, true)`) hides what it does.' },
    { q: 'What is a null object?', a: 'A real object that stands in for "nothing" and behaves sensibly (like a `GUEST` user), so callers need no null checks.' },
    { q: 'What should you return instead of null for "no results"?', a: 'An empty collection. Callers can loop over it without checking.' },
    { q: 'What does "fail fast at the boundary" mean?', a: 'Validate input once, where it enters the system, and reject bad values with a clear error so the inner code can trust what it receives.' }
  ],

  glossary: [
    { term: 'Null', def: 'A value meaning "nothing here". It can be assigned anywhere, which is why it causes so many surprise crashes.', like: 'A vending-machine slot with no "sold out" light.', aka: ['null reference', 'undefined'] },
    { term: 'Null object', def: 'A stand-in object that represents "nothing" but still behaves safely, so callers do not need to check for null.', like: 'A guest badge at reception: a real badge, just for nobody in particular.' },
    { term: 'Optional type', def: 'A wrapper that says "there may or may not be a value here" and forces the caller to handle both cases.', like: 'A parcel notice that says either "delivered" or "nothing today", never a blank.', aka: ['Option', 'Maybe'] },
    { term: 'Flag argument', def: 'A boolean parameter used to switch a function between two behaviours.', like: 'A button that does one thing when pressed and another when pressed upside down.' },
    { term: 'Fail fast', def: 'Detect problems as early as possible and stop with a clear error, rather than carrying bad data deeper into the system.', like: 'Checking your passport at the airport entrance, not at the aircraft door.' }
  ],

  takeaways: [
    'Absence is a real case: **make it visible, or never hand it out.**',
    'Return empty lists and null objects instead of `null`.',
    'A boolean flag usually hides two functions. **Name each one.**',
    'Validate at the boundary, then trust the inside.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-constructs-frameworks', {
  eli5: 'Use the right tool the language gives you for each job, and keep your own business logic free of any one framework so you can change it later without rewriting everything.',

  cards: [
    { kind: 'concept', title: 'Using a sledgehammer for a screw',
      body: `Every language gives you many ways to do the same thing: several kinds of loop, several data structures, plenty of built-in helpers. A beginner picks whatever they learned first and uses it for everything. It works, and it says nothing about what you meant.

        A \`for\` loop with an index, a counter and a \`push\` could be doing **any** of: filtering, transforming, searching, counting. The reader must read the body to find out which.

        Choosing the **right construct** lets the code announce its intention before anyone reads the details. The same goes for choosing the right type and data structure.` },

    { kind: 'code', title: 'One loop, many meanings',
      body: 'The language has named tools for the common jobs. Tap the lines to see what the name tells you.',
      code: { lang: 'js', src: `
        // a hand-rolled loop: what is it for?
        const paid = [];
        for (let i = 0; i < orders.length; i++) {
          if (orders[i].paid) paid.push(orders[i]);
        }

        // the right tool, with intent in the name
        const paid = orders.filter(order => order.paid);
        const totals = orders.map(order => order.total);
        const first = orders.find(order => order.id === 42);
        const anyLate = orders.some(order => order.isLate);`,
        notes: {
          3: 'A manual index and counter, just to say "keep the paid ones".',
          8: '`filter` says *keep some*. You know what comes out before reading the condition.',
          9: '`map` says *transform each one*.',
          10: '`find` says *the first match*, and stops looking when it finds it.',
          11: '`some` answers a yes/no question and also stops early.'
        } },
      note: 'A plain `for...of` loop is still the right tool when you need to do something for each item, or exit early. Choose on meaning, not fashion.' },

    { kind: 'compare', title: 'Picking a data structure',
      body: 'The shape you store data in decides how simple the code is. A few common choices in JavaScript:',
      cols: ['Choose', 'Because'],
      rows: [
        ['Ordered list of things', '`Array`', 'Order matters; you loop over everything'],
        ['Look something up by key', '`Map` or a plain object', 'Direct access, with no looping to find it'],
        ['"Have I seen this before?"', '`Set`', 'Membership checks are quick and duplicates vanish'],
        ['A fixed group of options', '`const` object or enum', 'The names stop typos like `\'shiped\'`'],
        ['A record with named fields', 'An object', '`order.total` explains itself; `order[3]` does not']
      ] },

    { kind: 'code', title: 'The right type for the job',
      body: 'Types are constructs too. Use the one that matches what the value *is*.',
      code: { lang: 'js', src: `
        // money in floating point: a classic trap
        console.log(0.1 + 0.2);      // 0.30000000000000004

        // keep money as whole pennies
        const priceInPence = 1999;
        const total = priceInPence * 3;   // 5997, exactly

        // a status as a name, not a magic string or number
        const Status = { PAID: 'paid', SHIPPED: 'shipped' };
        if (order.status === Status.PAID) { /* ... */ }`,
        notes: {
          2: 'Floating-point numbers cannot represent most decimals exactly. For money, the tiny errors add up.',
          5: 'Whole numbers of the smallest unit are exact, and you convert to pounds only for display.',
          9: 'Compare against a named constant. A typo like `Status.PAIDD` is caught at once, while `\'piad\'` just silently never matches.'
        } } },

    { kind: 'code', title: 'Write like a local',
      body: 'Every language has idioms: the way experienced users of that language usually say things. Following them makes code easier for the next reader.',
      code: { lang: 'py', src: `
        # works, but reads like translated Java
        for i in range(len(names)):
            print(names[i])

        # the Python way
        for name in names:
            print(name)

        # and for building a list
        paid = [o for o in orders if o.paid]`,
        notes: {
          2: 'Counting indexes by hand to walk a list. Python can hand you the items directly.',
          6: 'This is the idiom every Python reader expects.',
          10: 'A list comprehension: Python’s compact, readable way to filter and build a list.'
        } },
      note: 'Idioms differ: Go prefers explicit error returns, JavaScript leans on `map` and `filter`, Python on comprehensions. When in Rome, write like the Romans.' },

    { kind: 'metaphor', title: 'The travel adaptor',
      body: `You fly abroad with a hairdryer. The wall sockets are the wrong shape, so you buy a **travel adaptor**. Your hairdryer does not change; only the little adaptor knows about the foreign socket.

        Now imagine you had instead soldered the hairdryer's wires straight into the hotel wall. Fine for that hotel. Disastrous when you move.

        A **framework** is the wall socket: someone else's structure that your code plugs into. **Third-party libraries** are the same. Your business rules (how to price an order, who may refund it) are the hairdryer. Keep them in plain code with an adaptor in between, and you can change the wall without rewiring the dryer.` },

    { kind: 'layers', title: 'Keep the framework at arm’s length',
      body: 'A healthy shape puts the framework on the outside and your own rules in the middle.',
      layers: [
        { label: 'Web framework', note: 'Routes, requests, responses. Replaceable.', tone: 'warn', icon: '🌐' },
        { label: 'Thin adaptors', note: 'Turn framework objects into plain values, and back.', tone: 'info', icon: '🔌' },
        { label: 'Your business rules', note: 'Plain code. No imports from the framework.', tone: 'good', icon: '💼' },
        { label: 'Thin adaptors', note: 'Wrap the database library, the email service, the payment API.', tone: 'info', icon: '🔌' },
        { label: 'Third-party libraries', note: 'Databases, email, payments. Replaceable.', tone: 'warn', icon: '📦' }
      ] },

    { kind: 'code', title: 'Wrapping a third-party library',
      body: 'Do not scatter a vendor’s API across your codebase. Wrap it once, in your own words.',
      code: { lang: 'js', src: `
        // before: vendor details everywhere
        sendFast.client(KEY).deliver({
          to_addr: order.email, tmpl_id: 'T-17', vars: { n: order.id }
        });

        // after: one wrapper, in our own vocabulary
        class ReceiptMailer {
          send(order) {
            sendFast.client(KEY).deliver({
              to_addr: order.email, tmpl_id: 'T-17', vars: { n: order.id }
            });
          }
        }

        receiptMailer.send(order);`,
        notes: {
          2: 'Imagine this call in forty files. Changing provider means forty edits, and forty chances to miss one.',
          7: 'The only class that knows the vendor. If `sendFast` is replaced, **this is the only place that changes**.',
          15: 'The rest of the app speaks our language: `receiptMailer.send(order)`.'
        } },
      note: '`sendFast` is a made-up service, so the example does not depend on any real product.' },

    { kind: 'pitfall', title: 'Lock-in, and not overdoing the wrapping',
      body: `The cost of **lock-in** appears on the day you want to leave: a licence price rises, a library is abandoned, a framework changes direction. If its types and calls are woven through every file, leaving means rewriting the product.

        But wrapping everything is its own mistake. Adaptors cost effort, and some teams sensibly decide to use their framework's own tools all over a small app. Experienced developers disagree on how far to go.

        A fair rule: **wrap the things that are likely to change, hard to replace, or hard to test**: payments, email, storage. Do not bother wrapping basic language features. And keep your business rules free of framework imports, so they survive whatever happens around them.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'You want to know whether any order in a list is late, and stop as soon as you find one. Which construct says that best?',
      options: ['`orders.some(order => order.isLate)`', '`orders.map(order => order.isLate)`', 'A `for` loop with an index and a counter', '`orders.filter(order => order.isLate).length`'],
      answer: 0,
      why: [null, '`map` builds a whole new list of true/false values, which is not what you asked for.', 'It can work, but the reader has to decode the body to see the intention.', 'It builds a whole new list just to count it, and never stops early.'],
      explain: '`some` asks a yes/no question and stops at the first match. The name states your intention, so no one has to read a loop body to find it.' },

    { type: 'tf', after: 3, statement: 'Storing money in floating-point numbers (like `19.99`) is a safe, exact choice for financial code.', answer: false,
      explain: 'Floating-point cannot represent many decimals exactly (`0.1 + 0.2` is `0.30000000000000004`). Many teams store money as whole pennies or use a dedicated decimal type.' },

    { type: 'bucket', prompt: 'Which data structure suits each job?', buckets: ['Array', 'Map or object', 'Set'],
      items: [['Show orders in the order they were placed', 0], ['Find a customer by their ID', 1], ['Check whether an email was already used', 2], ['Count how many of each product were sold', 1], ['Remove duplicate tags from a list', 2], ['Loop through every item exactly once, in order', 0]],
      explain: 'Arrays suit ordered lists. Maps and objects suit lookup by key. Sets suit "have I seen this?" and de-duplicating. The right structure removes loops the code would otherwise need.' },

    { type: 'spot', after: 7, prompt: 'A pricing rule has crept into a web route. Tap a line where the framework and the business rule are tangled together.',
      code: { lang: 'js', src: `
        app.post('/orders', (req, res) => {
          let total = req.body.items.reduce((s, i) => s + i.price, 0);
          if (req.body.isMember) total = total * 0.95;
          res.json({ total: total });
        });` },
      lines: [2, 3],
      explain: 'The discount rule lives inside the route handler and reads framework objects directly. To test or reuse it, you need the framework. A plain `orderTotal(items, isMember)` function would keep the rule independent.' },

    { type: 'ab', q: 'Which version keeps the third-party library at arm’s length?',
      a: { lang: 'js', label: 'Direct calls', src: `
        // in 40 files
        sendFast.client(KEY).deliver({
          to_addr: o.email, tmpl_id: 'T-17'
        });` },
      b: { lang: 'js', label: 'Wrapped', src: `
        // in 40 files
        receiptMailer.send(order);
        // the vendor appears in one file only` },
      answer: 'b',
      explain: 'With the wrapper, switching email provider means changing one class. Calling the vendor directly spreads its API through the code, so changing it means editing every call site.' },

    { type: 'match', prompt: 'Match each situation to the better choice.',
      pairs: [['Keep only the paid orders', '`filter`'], ['Turn each order into its total', '`map`'], ['Get the first order with a given ID', '`find`'], ['Check "has this email been used?" quickly', '`Set`'], ['Name the allowed order states', 'A `const` object or enum']] },

    { type: 'cloze', code: true, text: 'const emails = orders.{{map}}(order => order.email);\nconst late = orders.{{filter}}(order => order.isLate);\nconst seen = new {{Set}}(emails);',
      distractors: ['push', 'find', 'Array'],
      explain: '`map` transforms every item, `filter` keeps some, and a `Set` stores unique values and answers "have I seen it?" quickly. Each name states what the line is for.' },

    { type: 'scenario', title: 'The email provider doubles its prices', intro: 'You maintain a shop built with a popular web framework and an email service called SendFast. SendFast announces a big price rise. Your boss asks: "How long to switch to a cheaper provider?"',
      meters: { 'switching cost': 60, 'risk': 50 },
      steps: [
        { text: 'You search the codebase and find SendFast calls in only two places: a `ReceiptMailer` class and a test. What does that tell you?',
          choices: [
            { label: 'Switching is a small, contained job: write a new `ReceiptMailer` and change its internals', score: 2, effects: { 'switching cost': -45, 'risk': -25 }, feedback: 'This is what the wrapper was for. The vendor knowledge lives in one place, so the rest of the app never notices the change.' },
            { label: 'You still need to read every file in case it is used elsewhere', score: 0, effects: { 'switching cost': 15 }, feedback: 'Searching is quick and conclusive here. Being able to trust that search is exactly the benefit of keeping the vendor behind a single door.' },
            { label: 'It is a sign the code is over-engineered', score: 0, effects: { 'risk': 15 }, feedback: 'A wrapper for an external service that is likely to change is a sensible, cheap protection, not over-engineering.' }
          ] },
        { text: 'Meanwhile, a teammate proposes wrapping `Array.map` and `Math.max` in your own helper classes "in case the language changes". Your reaction?',
          choices: [
            { label: 'Decline: wrap risky, replaceable things, not basic language features', score: 2, effects: { 'risk': -10 }, feedback: 'Wrapping has a cost. Spend it on payments, email and storage, which are likely to change, rather than on parts of the language itself.' },
            { label: 'Agree: everything should be wrapped, to be safe', score: 0, effects: { 'switching cost': 20, 'risk': 15 }, feedback: 'You would create a layer nobody understands, to defend against a change that will almost never happen.' },
            { label: 'Say wrapping is never worth it', score: 1, effects: { 'risk': 10 }, feedback: 'The email episode shows otherwise. The skill is judging *what* is worth wrapping.' }
          ] }
      ],
      outro: 'Wrap what is **likely to change, hard to replace or hard to test**. Leave the basics alone.' },

    { type: 'multi', q: 'Which of these are good habits from this lesson?',
      options: ['Use `filter`, `map` and `find` when they say what you mean', 'Keep business rules free of framework imports', 'Store identifiers like order states as named constants', 'Always write loops with a manual index, to be explicit', 'Spread a vendor’s API calls through every file for speed'],
      answers: [0, 1, 2],
      explain: 'Intent-revealing constructs, framework-free rules and named constants all make code clearer and easier to change. The last two make it harder to read and costly to move.' }
  ],

  flashcards: [
    { q: 'Why choose `filter`, `map` or `find` over a hand-rolled loop?', a: 'The name tells the reader your intention (keep some, transform each, first match) before they read the body.' },
    { q: 'Why should money not be stored as floating-point decimals?', a: 'Floats cannot represent many decimals exactly (`0.1 + 0.2` is not `0.3`). Use whole pennies or a decimal type.' },
    { q: 'What does it mean to keep a framework "at arm’s length"?', a: 'Keep business rules in plain code and confine framework-specific code to thin adaptors at the edges.' },
    { q: 'Why wrap a third-party library?', a: 'So the vendor’s API lives in one place. If you switch vendors, only the wrapper changes.' },
    { q: 'What is framework lock-in?', a: 'When a framework or library is woven so deeply through your code that leaving it means rewriting most of the product.' }
  ],

  glossary: [
    { term: 'Idiom', def: 'The usual, natural way an experienced user of a language expresses something.', like: 'A local phrase that sounds natural, where a literal translation sounds odd.' },
    { term: 'Framework', def: 'A ready-made structure for building an app, which calls your code at the right moments (for example, a web framework that routes requests).', like: 'A hotel wall socket: you plug into its shape.' },
    { term: 'Adaptor', def: 'A thin piece of code that translates between your own code and an outside framework or library.', like: 'A travel plug adaptor.', aka: ['wrapper'] },
    { term: 'Lock-in', def: 'Being so tied to one vendor or framework that moving away is very expensive.', like: 'A phone contract that costs more to leave than to keep.' }
  ],

  takeaways: [
    'Pick the construct that **states your intention**: `filter`, `map`, `find`, `Set`.',
    'Use the right type: whole pennies for money, named constants for states.',
    'Business rules stay plain; frameworks and libraries live behind thin adaptors.',
    'Wrap what is likely to change or hard to replace, not everything.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-cqs', {
  eli5: 'Command Query Separation says a function should either do something (and return nothing) or answer something (and change nothing), so that merely asking a question never alters the answer.',

  cards: [
    { kind: 'concept', title: 'The balance that kept changing',
      body: `A bank app shows your balance: £100. You glance away, glance back, and it says £98. Nobody paid anything.

        The developers had written \`account.getBalance()\`. It looked like a harmless question. But inside, it also checked whether this month's fee was due, and if so, **took it**. Every screen refresh that happened to call it moved your money.

        Nobody calling \`getBalance\` expected that. A name that sounds like a question should behave like one.

        That expectation is a principle with a name: **Command Query Separation** (CQS), coined by Bertrand Meyer. *Asking a question should not change the answer.*` },

    { kind: 'metaphor', title: 'The librarian’s two kinds of request',
      body: `At a library desk you can say two quite different things.

        **A question:** "Is this book in?" The librarian looks and tells you. Ask a hundred times, and the shelves are exactly as they were.

        **An order:** "Please reserve this book for me." The librarian goes away and changes something. They say "done", and not much else.

        Now imagine a librarian who, when you ask "is it in?", also quietly lends it to you and charges a late fee. You would stop asking questions.

        Code has the same two kinds of request. Mixing them in one call is the librarian who answers a question by rearranging the library.` },

    { kind: 'code', title: 'A question that changes things',
      body: 'This looks like a plain lookup. Tap the lines to see what else it does.',
      code: { lang: 'js', src: `
        class Account {
          getBalance() {
            if (this.feeDue()) {
              this.balance -= 2;
              this.lastFeeDate = new Date();
            }
            return this.balance;
          }
        }`,
        notes: {
          2: 'The name says "get". Everyone reading a call to it assumes it only reads.',
          4: 'A **change of state**, hidden inside a query. This is the surprise.',
          7: 'And only *now* does it answer, so the answer depends on whether something happened first.'
        } } },

    { kind: 'code', title: 'Split them apart',
      body: 'Each method now does one kind of thing, and its name is honest about which.',
      code: { lang: 'js', src: `
        class Account {
          // command: changes state, returns nothing
          chargeMonthlyFee() {
            if (this.feeDue()) {
              this.balance -= 2;
              this.lastFeeDate = new Date();
            }
          }

          // query: returns data, changes nothing
          currentBalance() {
            return this.balance;
          }
        }`,
        notes: {
          3: 'A **command** is named as an order: "charge the fee". Called once, by something that is meant to do it, such as a monthly job.',
          11: 'A **query** is named as a fact: "current balance". It is safe to call from anywhere, any number of times.'
        } } },

    { kind: 'compare', title: 'Commands and queries',
      body: 'Two clear categories, and every method should fall in one.',
      cols: ['Command', 'Query'],
      rows: [
        ['Does what?', 'Changes state: saves, sends, deletes, updates', 'Reads and returns data'],
        ['Returns?', 'Nothing (or only a success/failure signal)', 'The answer'],
        ['Call it twice?', 'Might do the thing twice', 'Always the same, nothing changes'],
        ['Name sounds like', 'An instruction: `cancelOrder`, `sendReceipt`', 'A fact or question: `total`, `isPaid`, `findUser`']
      ] },

    { kind: 'sequence', title: 'Why mixing them is dangerous',
      body: 'Queries get called casually: in a screen redraw, a log line, a debugger watch. Step through what that does to a query with a side effect.',
      actors: ['Screen', 'Account'],
      steps: [
        { from: 0, to: 1, label: 'getBalance()', note: 'The screen draws the balance for the first time.' },
        { from: 1, to: 0, label: '£100', dashed: true, note: 'The fee was not due yet, so nothing changes.' },
        { from: 0, to: 1, label: 'getBalance()', note: 'A new month starts. The screen redraws, which asks again.' },
        { from: 1, to: 0, label: '£98', dashed: true, note: 'This call quietly took the monthly fee. The balance changed **because someone looked at it**.' },
        { from: 0, to: 1, label: 'getBalance() in a log line', note: 'A developer adds a debug log that prints the balance. It looks harmless.' },
        { note: 'If the fee code ran on a *different* call it would charge twice or never. **You cannot reason about a program when looking changes things.**' }
      ] },

    { kind: 'code', title: 'Sensible exceptions: pop and counters',
      body: 'CQS is a guideline, not a law. Some operations are naturally both, and splitting them would be worse.',
      code: { lang: 'js', src: `
        const stack = ['a', 'b', 'c'];

        const top = stack.pop();    // removes 'c' AND returns it

        const id = counter.next();  // bumps the counter AND returns it`,
        notes: {
          3: '`pop` changes the stack and hands you the item. Splitting it into "peek, then remove" would work, but is clumsier.',
          5: 'An ID generator must give each caller a unique number. If "read" and "increment" were separate steps, programs doing several things at once could both read the same number.'
        } },
      note: 'Rule of thumb: keep them separate by default. Combine them only when the combination is the natural, well-known behaviour of the thing, and its name makes that clear.' },

    { kind: 'diagram', title: 'CQS and its big cousin, CQRS',
      body: 'Some teams take the idea from single methods to a whole system: **CQRS** (Command Query Responsibility Segregation) keeps one path for changes and a separate path for reads.',
      nodes: [
        { id: 'c', label: 'Client', icon: '👤', x: 1, y: 0 },
        { id: 'cmd', label: 'Command side', x: 0, y: 1, tone: 'warn' },
        { id: 'qry', label: 'Query side', x: 2, y: 1, tone: 'good' },
        { id: 'w', label: 'Write store', icon: '🗄️', x: 0, y: 2, tone: 'warn' },
        { id: 'r', label: 'Read store', icon: '🗄️', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'c', to: 'cmd', label: 'change' }, { from: 'c', to: 'qry', label: 'ask' },
        { from: 'cmd', to: 'w' }, { from: 'qry', to: 'r' },
        { from: 'w', to: 'r', label: 'copied across', dashed: true }
      ],
      caption: 'CQS is a habit for single methods. CQRS is an architecture, often with separate read and write databases, and a much bigger commitment.' },

    { kind: 'pitfall', title: 'Do not be a purist about it',
      body: `Three things that are **not** violations:

        - A command that returns a **success or failure** signal, or the ID of what it created. Callers need that.
        - A query that **caches** its answer or writes a log line. The visible result is unchanged and nobody can tell.
        - Methods like \`pop\` where the pair is a standard, well-known idiom.

        And remember CQS is about *surprise*. If a method's name, return value and effects all say the same thing, you are fine.

        CQRS is a separate decision. It solves real scaling problems for some systems and adds a lot of moving parts. Most apps never need it, and you can follow CQS without it.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A function called `getTotal()` quietly applies a discount and saves the order each time it is called. What is the problem?',
      options: ['A query is changing state, so repeat calls can differ', 'It is too short to be a useful function', 'It should take the discount as a parameter', 'It should return nothing, like a command'],
      answer: 0,
      why: [null, 'Length has nothing to do with it.', 'Where the discount comes from is not the issue. The hidden change is.', 'It is a query, so returning the answer is correct. It is the *saving* that does not belong.'],
      explain: 'A name like `getTotal` promises a read. Changing state inside it means callers cannot safely ask, and the result depends on how often and when it was called.' },

    { type: 'bucket', after: 4, prompt: 'Is each method a command or a query?', buckets: ['Command', 'Query'],
      items: [['`cancelOrder(id)`', 0], ['`isPaid(order)`', 1], ['`sendReceipt(order)`', 0], ['`findCustomer(email)`', 1], ['`deleteAccount(id)`', 0], ['`totalWithTax(order)`', 1]],
      explain: 'Commands do something and are named like instructions. Queries return data and are named like questions or facts. A method that is both is where the surprises start.' },

    { type: 'tf', after: 6, statement: 'Under Command Query Separation, an idiom like `stack.pop()`, which changes state and returns a value, is an accepted exception.', answer: true,
      explain: 'CQS is a guideline. Well-known idioms such as `stack.pop()` or an ID generator’s `next()` both change and return, and splitting them would be worse. The aim is to avoid surprising callers.' },

    { type: 'spot', prompt: 'One line in this `Cart` class breaks Command Query Separation. Tap it.',
      code: { lang: 'js', src: `
        class Cart {
          total() {
            return this.items.reduce((s, i) => s + i.price, 0);
          }
          itemCount() {
            this.lastViewed = new Date();
            return this.items.length;
          }
        }` },
      lines: [6],
      explain: '`itemCount` looks like a pure question, but it also writes `lastViewed`. Something somewhere will now depend on how often the count is asked for. That belongs in its own command, such as `markViewed()`.' },

    { type: 'ab', q: 'Which design follows Command Query Separation?',
      a: { lang: 'js', label: 'Mixed', src: `
        function getNextInvoiceNumber() {
          lastInvoice.number += 1;
          saveToDatabase(lastInvoice);
          return lastInvoice.number;
        }
        // called while previewing a draft` },
      b: { lang: 'js', label: 'Separated', src: `
        function currentInvoiceNumber() {
          return lastInvoice.number;
        }
        function issueNextInvoiceNumber() {
          lastInvoice.number += 1;
          saveToDatabase(lastInvoice);
        }` },
      answer: 'b',
      explain: 'Previewing a draft only needs to *read* the number. With the mixed version, each preview burns a number and leaves gaps. Splitting makes reading safe and issuing deliberate.' },

    { type: 'cloze', code: true, text: '// a {{command}} changes state\nfunction cancelOrder(id) { /* ... */ }\n\n// a {{query}} returns data and changes nothing\nfunction isPaid(order) { return order.paid; }',
      distractors: ['callback', 'constructor', 'loop'],
      explain: 'Commands are instructions that do something; queries are questions that report. Naming each to match, `cancelOrder` and `isPaid`, tells callers what to expect.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Command', 'Changes state and returns nothing useful'], ['Query', 'Returns data and changes nothing'], ['CQS', 'A rule for individual methods'], ['CQRS', 'An architecture with separate read and write paths'], ['`stack.pop()`', 'A well-known, sensible exception to the rule']] },

    { type: 'scenario', title: 'The invoice that skips numbers', intro: 'Finance reports that invoice numbers have gaps: 1041, 1042, 1045. Every invoice must be numbered in an unbroken sequence by law. You find `getNextInvoiceNumber()`, which increments and saves the counter each time it is called.',
      meters: { 'compliance': 30, 'confidence': 40 },
      steps: [
        { text: 'You discover the invoice preview screen calls `getNextInvoiceNumber()` to show a "draft number". What is the root cause?',
          choices: [
            { label: 'A query-shaped name that is really a command: asking for the number uses one up', score: 2, effects: { 'confidence': 25 }, feedback: 'Exactly. Every preview and every retry burned a number, because "what is the next number?" changed the answer.' },
            { label: 'The database is losing writes', score: 0, effects: { 'confidence': -15 }, feedback: 'The database did exactly what it was told. The code asked it to increment on every call.' },
            { label: 'The preview screen is the bug and should be removed', score: 1, effects: { 'confidence': 5 }, feedback: 'Removing the screen hides the symptom. Any future code that peeks at the number would burn one again.' }
          ] },
        { text: 'How do you fix it?',
          choices: [
            { label: 'Split it: `peekNextInvoiceNumber()` (a query) and `issueInvoiceNumber()` (a command) used only when the invoice is final', score: 2, effects: { 'compliance': 50, 'confidence': 25 }, feedback: 'The preview can look as often as it likes, and the number is consumed exactly once, when the invoice is issued.' },
            { label: 'Keep one function and tell developers to be careful', score: 0, effects: { 'compliance': -10, 'confidence': -20 }, feedback: 'The next developer will not have read the memo. The type of mistake must be made hard to make.' },
            { label: 'Cache the result so repeated calls return the same number', score: 1, effects: { 'compliance': 15 }, feedback: 'It reduces the gaps but hides a state change behind caching, and it is still unclear which call really reserves the number.' }
          ] }
      ],
      outro: 'When a "question" can change the world, callers cannot be careful enough. **Separate the asking from the doing.**' },

    { type: 'multi', q: 'Which of these are acceptable under a sensible reading of CQS?',
      options: ['A command that returns an error code if it failed', 'A query that caches its result for speed', 'A `getStatus()` that also sends a reminder email', 'A `pop()` on a stack that removes and returns the top item', 'A `total()` that adds a charge to the order'],
      answers: [0, 1, 3],
      explain: 'A success signal, a cache nobody can observe and a well-known idiom do not surprise callers. Sending emails or adding charges inside a "getter" certainly does.' }
  ],

  flashcards: [
    { q: 'What is Command Query Separation?', a: 'A method should either change state (a command) or return data (a query), not both. Asking a question should not change the answer.' },
    { q: 'Who coined CQS?', a: 'Bertrand Meyer, in the context of object-oriented design.' },
    { q: 'Why is a query with side effects dangerous?', a: 'Queries get called casually (redraws, logs, debuggers). If asking changes things, behaviour depends on how often and when it was asked.' },
    { q: 'Name sensible exceptions to CQS.', a: 'Well-known idioms like `stack.pop()` or an ID generator’s `next()`, and commands that return a success flag or a new ID.' },
    { q: 'How does CQRS differ from CQS?', a: 'CQS is a rule for single methods. CQRS is an architecture that separates the read side from the write side, often with different data stores.' }
  ],

  glossary: [
    { term: 'Command', def: 'A method that changes state and returns nothing useful. Named like an instruction.', like: '"Please reserve this book for me."' },
    { term: 'Query', def: 'A method that returns data and changes nothing, so it is safe to call as often as you like.', like: '"Is this book in?"' },
    { term: 'CQS', def: 'Command Query Separation: every method is either a command or a query, never both.', like: 'A librarian who answers questions without rearranging the shelves.', aka: ['Command Query Separation'] },
    { term: 'CQRS', def: 'Command Query Responsibility Segregation: an architecture with separate models, and often separate stores, for writing and reading.', like: 'A restaurant with separate doors for ordering and collecting.' }
  ],

  takeaways: [
    '**Commands change things; queries return things.** Do not mix them.',
    'A question-shaped name must not change state. Surprises live there.',
    'Sensible exceptions exist (`pop`, counters, success flags). Mind the surprise.',
    'CQS is a habit for methods; CQRS is a much bigger architecture decision.'
  ],

  links: [
    { label: 'Martin Fowler: CommandQuerySeparation', url: 'https://martinfowler.com/bliki/CommandQuerySeparation.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-actors', {
  eli5: 'Keep the code that one group of people asks you to change together in one place, instead of splitting it across technical folders, so their changes stay in their own corner.',

  cards: [
    { kind: 'concept', title: 'One feature, four folders',
      body: `Marketing asks for a feature: *"Customers can enter a promo code at checkout."*

        You start working and realise the change lives in **four different folders**: a model in \`models/\`, the rules in \`services/\`, the web endpoint in \`controllers/\`, and the page in \`views/\`. Each folder is also full of files for completely unrelated things: invoices, shipping, accounts.

        This is the most common way to organise a project: **by technical layer**. It looks tidy. But it means that every feature is smeared across the whole codebase, and every folder is a crowd of strangers.

        There is another way to draw the lines, and it begins with a question.` },

    { kind: 'code', title: 'Organised by layer',
      body: 'Every kind of file lives with others of its kind. Which files serve the promo-code feature? All the ones marked with an arrow below, scattered through four folders.',
      code: { lang: 'text', src: `
        src/
          controllers/
            promoController.js      <-- promo code
            invoiceController.js
            shippingController.js
          services/
            promoService.js         <-- promo code
            invoiceService.js
            shippingService.js
          models/
            promo.js                <-- promo code
            invoice.js
            shipment.js
          views/
            promoForm.html          <-- promo code
            invoicePage.html`,
        notes: {
          3: 'The web layer for **promo codes**.',
          7: 'The rules for promo codes, in a different folder.',
          11: 'The data shape for promos, in yet another.',
          15: 'And the page, in the fourth. One feature, four places to open, edit and keep in sync.'
        } } },

    { kind: 'metaphor', title: 'Seating by job title',
      body: `Imagine a company that seats everyone **by job title**. All designers on floor one, all developers on floor two, all testers on floor three.

        To ship a feature, three people must meet in a stairwell. When Marketing's project changes, the designers, developers *and* testers are all pulled away from other projects.

        Now imagine seating by **project team**: a small group with a designer, developer and tester together, working for one set of stakeholders.

        Folders by technical layer are the first office. Folders by **feature** are the second. The work that changes together sits together.` },

    { kind: 'concept', title: 'Ask: who asks for changes to this code?',
      body: `Here is the sharper question to organise by. For any piece of code, ask: **who would ask for it to change?**

        - The promo-code rules? **Marketing.**
        - How tax is shown on invoices? **Finance.**
        - Which carriers are available? **The warehouse team.**

        These groups of people are the code's **actors**. They want different things, at different times, for different reasons.

        If you group code by actor (or by feature, which usually lines up with one), a request from one group lands in **one folder**. Later in the course, the SOLID principles give this idea a formal name; for now, the question is enough.` },

    { kind: 'code', title: 'Organised by feature',
      body: 'Same files, regrouped. Everything the promo-code feature needs is in one folder.',
      code: { lang: 'text', src: `
        src/
          promotions/             (Marketing)
            promoController.js
            promoService.js
            promo.js
            promoForm.html
          invoicing/              (Finance)
            invoiceController.js
            invoiceService.js
            invoice.js
            invoicePage.html
          shipping/               (Warehouse)
            shipmentController.js
            shipmentService.js
            shipment.js
          shared/
            money.js`,
        notes: {
          2: 'The folder is named after the **feature**, so the name says what the code is for, instead of what *kind* of file it is.',
          7: 'Finance’s whole world is here. A tax rule change opens one folder.',
          16: 'A small `shared` folder for genuinely common things, such as how money is formatted.'
        } },
      note: 'This is called **package by feature** (also "vertical slices"). The layered way is **package by layer**. Both split code into pieces; they just disagree on which axis.' },

    { kind: 'compare', title: 'By layer versus by feature',
      body: 'Neither is "right". They trade off different pains.',
      cols: ['By layer', 'By feature / actor'],
      rows: [
        ['Folder names say', 'What kind of file it is (`controllers`, `models`)', 'What the code is **for** (`invoicing`, `promotions`)'],
        ['Adding a feature touches', 'Every layer folder', 'Mostly one folder'],
        ['Two teams working at once', 'Both edit the same big folders: merge conflicts', 'Each stays in their own folder'],
        ['Deleting a feature', 'Hunt through every layer', 'Delete a folder'],
        ['Shared code', 'Easy: it is all together already', 'Needs a deliberate `shared` area']
      ] },

    { kind: 'story', title: 'The Tuesday merge conflict',
      body: `Priya works for Marketing's checkout changes. Tom works on Finance's tax rules. The project is organised by layer.

        Both of them need \`orderService.js\`: it holds the promo logic *and* the tax logic, since both are "order things". Both edit it on Tuesday. Git reports a merge conflict, they resolve it hastily, and a line of Tom's tax calculation goes missing.

        Nobody notices until an invoice goes out with the wrong VAT.

        Neither of them did anything wrong. The structure **forced two groups with different goals into one file**. With separate \`promotions/\` and \`invoicing/\` folders, they would never have touched the same lines.` },

    { kind: 'diagram', title: 'Each actor, its own corner',
      body: 'After the split, a change request from one group can only land in one place.',
      nodes: [
        { id: 'm', label: 'Marketing', icon: '📣', x: 0, y: 0, tone: 'warn' },
        { id: 'f', label: 'Finance', icon: '💷', x: 1, y: 0, tone: 'warn' },
        { id: 'w', label: 'Warehouse', icon: '📦', x: 2, y: 0, tone: 'warn' },
        { id: 'p', label: 'promotions/', x: 0, y: 1, tone: 'accent' },
        { id: 'i', label: 'invoicing/', x: 1, y: 1, tone: 'accent' },
        { id: 's', label: 'shipping/', x: 2, y: 1, tone: 'accent' },
        { id: 'sh', label: 'shared/', x: 1, y: 2 }
      ],
      edges: [
        { from: 'm', to: 'p' }, { from: 'f', to: 'i' }, { from: 'w', to: 's' },
        { from: 'p', to: 'sh', dashed: true }, { from: 'i', to: 'sh', dashed: true }, { from: 's', to: 'sh', dashed: true }
      ],
      caption: 'Solid: who asks for changes. Dashed: small things everyone genuinely shares.' },

    { kind: 'pitfall', title: 'The traps on the way',
      body: `**Shared code is the tricky bit.** If promotions and invoicing both need "round to the penny", it belongs in \`shared/\`. But if you share something *only because it looks similar today* (say, two slightly different discount rules), you have tied two actors together. When Marketing changes theirs, Finance breaks. A little duplication between actors is often cheaper than a wrong shared piece.

        Two more cautions:

        - Do not make a folder per tiny thing. Group by **meaningful** area, not one folder per file.
        - Small projects are fine by layer. Frameworks such as Rails default to it, and it works well until several teams and many features arrive.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'You are deciding where a piece of code belongs. Which question does this lesson suggest asking?',
      options: ['Who would ask for this code to change?', 'What kind of file is it?', 'Which file is shortest?', 'Which developer wrote it first?'],
      answer: 0,
      why: [null, 'That is the question that produces "by layer" folders, the thing we are moving away from.', 'Length does not tell you who it serves.', 'Authorship has nothing to do with who asks for changes.'],
      explain: 'Code that changes for the same people, at the same time, belongs together. "Who asks for changes?" points you to the right folder.' },

    { type: 'bucket', after: 4, prompt: 'Which feature folder would each change request land in?', buckets: ['promotions', 'invoicing', 'shipping'],
      items: [['Add a "10% off first order" code', 0], ['Show VAT as a separate line on invoices', 1], ['Add a new courier option', 2], ['Limit each promo code to one use per customer', 0], ['Send invoices as PDF attachments', 1], ['Print parcel labels at 4x6 inches', 2]],
      explain: 'Each request comes from a different group. When the folders match the groups, the answer to "where do I change this?" is immediate.' },

    { type: 'ab', q: 'A new "gift wrapping" feature is being added. Which structure makes that easiest to build and remove?',
      a: { lang: 'text', label: 'By layer', src: `
        controllers/giftController.js
        services/giftService.js
        models/gift.js
        views/giftForm.html
        (4 folders, mixed with everything else)` },
      b: { lang: 'text', label: 'By feature', src: `
        gift-wrapping/
          giftController.js
          giftService.js
          gift.js
          giftForm.html` },
      answer: 'b',
      explain: 'Everything for gift wrapping sits in one folder, so it is easy to find, easy to change as a unit and easy to delete if the feature is dropped.' },

    { type: 'spot', prompt: 'This file sits in the `invoicing` folder (owned by Finance). Tap the line that belongs to a different actor.',
      code: { lang: 'js', src: `
        // invoicing/invoiceService.js
        function calculateTax(invoice) { /* ... */ }
        function formatInvoicePdf(invoice) { /* ... */ }
        function applyPromoCode(invoice, code) { /* ... */ }
        function nextInvoiceNumber() { /* ... */ }` },
      lines: [4],
      explain: 'Promo codes are Marketing’s territory. When Marketing changes their rules, they now have to edit Finance’s file, and a mistake could break tax calculation.' },

    { type: 'order', prompt: 'Put the steps for moving to package-by-feature in a sensible order.',
      items: ['List the groups of people who ask for changes', 'Name a folder for each feature or actor', 'Move each file into the folder it belongs to', 'Move truly shared code into a small shared folder', 'Run the tests and fix the imports'],
      explain: 'Start with who and what, so the folders reflect real needs. Shared code comes last, once you can see what really is shared. Moving files changes imports, so tests confirm nothing broke.' },

    { type: 'tf', statement: 'On a small project, packaging by layer can work perfectly well.', answer: true,
      explain: 'Small projects do fine by layer, and it is the default in several frameworks. Grouping by feature starts to pay off as features, and the teams working on them, multiply.' },

    { type: 'cloze', text: 'Folders named after what the code is {{for}} (like `invoicing`) are organised by {{feature}}, while folders named after the kind of file (like `controllers`) are organised by {{layer}}.',
      distractors: ['size', 'author', 'language'],
      explain: 'The question to ask is who would ask for the change, not what type of file it is. Feature folders reflect the former; layer folders the latter.' },

    { type: 'scenario', title: 'Two teams, one service file', intro: 'You have joined a company with 12 developers. Marketing and Finance each have a team, and both keep editing `services/orderService.js` (900 lines). Merge conflicts are weekly and bugs are creeping into both areas.',
      meters: { 'merge pain': 80, 'risk': 60 },
      steps: [
        { text: 'You are asked to propose a plan. What do you suggest?',
          choices: [
            { label: 'Split the file by actor: move promo logic to `promotions/` and tax logic to `invoicing/`, one feature at a time', score: 2, effects: { 'merge pain': -45, 'risk': -25 }, feedback: 'Each team now works in its own folder. Moving one feature at a time keeps every step small and testable.' },
            { label: 'Ask both teams to coordinate their edits with a shared calendar', score: 0, effects: { 'merge pain': -10, 'risk': 5 }, feedback: 'A process fix for a structural problem. It will slow both teams and still fail when someone forgets.' },
            { label: 'Rewrite the whole project in a new structure in one big branch', score: 1, effects: { 'merge pain': 10, 'risk': 25 }, feedback: 'The goal is right and the method is risky. A giant branch will conflict with everyone’s daily work for weeks.' }
          ] },
        { text: 'While splitting, you find a `roundToPenny()` helper used by both. Where does it go?',
          choices: [
            { label: 'A small `shared/money.js`: it is a genuinely common utility, not a business rule', score: 2, effects: { 'merge pain': -10, 'risk': -10 }, feedback: 'Rounding to the penny is stable and neither actor owns it. A small shared area is the right home.' },
            { label: 'Copy it into both folders and forget about it', score: 1, effects: { 'risk': 5 }, feedback: 'Not terrible for a one-liner, but for something this stable, copies can drift apart. A shared helper is cleaner.' },
            { label: 'Also share the *discount rules*, since they look similar', score: 0, effects: { 'risk': 25 }, feedback: 'Looking alike is not the same as changing together. This would couple Marketing and Finance again.' }
          ] }
      ],
      outro: 'Share what is **genuinely common and stable**. Keep what different people own apart, even if it looks similar today.' },

    { type: 'multi', q: 'Which of these are real benefits of grouping code by feature or actor?',
      options: ['A request from one group lands in one folder', 'Fewer merge conflicts between teams', 'Deleting a feature means deleting a folder', 'It removes the need for any shared code', 'It makes every file shorter'],
      answers: [0, 1, 2],
      explain: 'Features and their changes stay together, so teams collide less and removal is easy. Shared code still exists (in a small shared area) and file length is unaffected.' }
  ],

  flashcards: [
    { q: 'What is the key question for organising code by actor?', a: 'Who would ask for this code to change? Keep what one group asks for together, and what different groups ask for apart.' },
    { q: 'What is package by layer?', a: 'Grouping files by technical type: `controllers/`, `services/`, `models/`. Every feature is spread across all of them.' },
    { q: 'What is package by feature?', a: 'Grouping everything a feature needs in one folder, such as `invoicing/` or `promotions/`.' },
    { q: 'Name two practical benefits of package by feature.', a: 'Changes from one group land in one place, and there are fewer merge conflicts and accidental breakages between teams.' },
    { q: 'Why be careful about shared code between actors?', a: 'Code shared only because it looks similar ties two actors together, so a change for one can break the other.' }
  ],

  glossary: [
    { term: 'Actor', def: 'A group of people who might ask for a part of the code to change, such as Marketing or Finance.', like: 'A department that sends you requests.' },
    { term: 'Package by layer', def: 'Organising code into folders by technical type, such as controllers, services and models.', like: 'Seating staff by job title.', aka: ['horizontal slicing'] },
    { term: 'Package by feature', def: 'Organising code into folders by the feature or business area it serves, with all its layers together.', like: 'Seating staff by project team.', aka: ['vertical slices'] },
    { term: 'Merge conflict', def: 'What git reports when two people changed the same lines and it cannot combine the edits on its own.', like: 'Two people editing the same sentence of a shared document.' }
  ],

  takeaways: [
    'Ask: **who asks for changes to this code?** Group by the answer.',
    'Package by feature keeps a request in one folder; package by layer scatters it.',
    'Separate actors means fewer merge conflicts and accidental breakages.',
    'Share only what is truly common and stable.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-tests', {
  eli5: 'Tests are small programs that check your code still works, and they only help if they run in seconds and never depend on each other, because slow or tangled tests are the ones people stop running.',

  cards: [
    { kind: 'concept', title: 'The 40-minute test suite',
      body: `A **test** is a small program that runs a piece of your code and checks it did the right thing, reporting *pass* or *fail*. A project has hundreds or thousands, called a **test suite**. (Testing gets a whole module of its own later; this lesson is only about what makes tests *useful to run*.)

        Now picture a team whose suite takes **forty minutes**. Nobody runs it before committing. They push, go for lunch, come back to a red build, and have forgotten what they changed.

        Within a few months the habit is "push and pray". The tests still exist. They just no longer protect anyone, because **tests nobody runs catch nothing**.` },

    { kind: 'metaphor', title: 'A smoke alarm that beeps an hour late',
      body: `A smoke alarm is useful because it is **fast**: smoke appears, it screams, you act. Imagine one that sampled the air once an hour. It would still be "an alarm". It would also be useless.

        Now imagine an alarm that goes off whenever your neighbour's alarm does, or only when the washing machine is off. You would soon stop believing it.

        Good tests are the first alarm: **quick** and **trustworthy**. Slow tests are the hourly alarm. Tests that depend on each other or on luck are the one that cries wolf.` },

    { kind: 'compare', title: 'F.I.R.S.T.: five properties of a good test',
      body: 'A handy acronym from the *Clean Code* book. Today we focus on **F** and **I**, but here are all five.',
      cols: ['A good test is…', 'It breaks down when…'],
      rows: [
        ['**F**ast', 'Quick enough to run after every small change', 'It waits on a network, a disk or a `sleep`'],
        ['**I**ndependent', 'Does not need any other test to run first', 'It reads data another test left behind'],
        ['**R**epeatable', 'Gives the same result anywhere, any day', 'It depends on the clock, randomness or one laptop'],
        ['**S**elf-validating', 'Says plainly pass or fail', 'A human must read a log and decide'],
        ['**T**imely', 'Written close to the code it checks', 'Written months later, if ever']
      ] },

    { kind: 'code', title: 'What a test looks like',
      body: 'A typical test has three parts: set things up, do the thing, check the result. Tap the lines.',
      code: { lang: 'js', src: `
        test('gold members get 10% off', () => {
          const order = { total: 100, member: 'GOLD' };

          const price = discountedTotal(order);

          expect(price).toBe(90);
        });`,
        notes: {
          1: 'A name that reads as a sentence. When it fails, the name tells you what broke.',
          2: '**Arrange**: build exactly the data this test needs, right here, inside the test.',
          4: '**Act**: run the one thing being tested.',
          6: '**Assert**: state what must be true. If it is not, the test fails loudly.'
        } },
      note: 'The `test` and `expect` words come from a testing framework (Jest is a popular one in JavaScript). Other languages have their own, with the same three parts.' },

    { kind: 'code', title: 'Fast: what makes a test slow',
      body: 'Tests get slow when they touch the **outside world**: networks, databases, files, clocks. Tap the lines.',
      code: { lang: 'js', src: `
        // slow: a real network call and a real wait
        test('charges the card', async () => {
          await paymentApi.charge(realCard, 500);
          await sleep(3000);
          expect(await bank.balance()).toBe(9500);
        });

        // fast: a stand-in that lives in memory
        test('charges the card', () => {
          const fakePayments = new FakePayments();
          checkout(order, fakePayments);
          expect(fakePayments.charged).toEqual([500]);
        });`,
        notes: {
          3: 'A real HTTP request to a real service. Could take a second, and fails if the network is down.',
          4: 'Waiting for something else to catch up. Three seconds, per test, times hundreds of tests.',
          10: 'A **fake**: a simple stand-in object that records what happened. Nothing leaves the computer.',
          12: 'The check is instant. A thousand of these run in the blink of an eye.'
        } },
      note: 'Stand-ins like this have names and techniques of their own (mocks, stubs, fakes), covered properly in the testing module.' },

    { kind: 'code', title: 'Independent: the shared-state trap',
      body: 'Two tests that quietly share a variable. Each passes alone. Together, the result depends on the order. Tap the lines.',
      code: { lang: 'js', src: `
        const cart = [];                 // shared by every test

        test('adds an item', () => {
          cart.push({ name: 'Tea', price: 3 });
          expect(cart.length).toBe(1);
        });

        test('starts empty', () => {
          expect(cart.length).toBe(0);
        });`,
        notes: {
          1: 'One array, created once, visible to every test in the file. This is **shared mutable state**.',
          4: 'The first test changes it and leaves it changed.',
          9: 'This test passes if it runs first, and **fails if it runs second**. And test runners may run tests in any order, or in parallel.'
        } } },

    { kind: 'steps', title: 'Arranging isolated test data',
      body: 'The cure for tangled tests is to give each test a **fresh, private set of data**.',
      steps: [
        { title: 'Build the data inside each test', body: 'Each test creates what it needs. Nothing is inherited from a previous test.' },
        { title: 'Use small helper functions', body: 'A helper such as `makeOrder({ total: 100 })` creates a fresh, valid order with sensible defaults. Only the detail that matters to the test is spelled out.' },
        { title: 'Reset before every test', body: 'Test frameworks offer a hook, often called `beforeEach`, that runs before each test and builds a clean starting point.' },
        { title: 'Never let a test depend on another', body: 'If test B needs test A to run first, merge them or make B build its own data.' },
        { title: 'Clean up what you touch', body: 'If a test writes a file or a database row, it removes it afterwards, or uses a throwaway copy that is thrown away.' }
      ] },

    { kind: 'pitfall', title: 'Flaky tests: the boy who cried wolf',
      body: `A **flaky** test sometimes passes and sometimes fails, with no change to the code. Common causes are the ones you have just seen: shared state, test order, the clock, randomness, real network calls, and waiting a fixed time for something that sometimes takes longer.

        The damage is not the failure itself. It is what the team learns: *"oh, that one is just flaky, re-run it."* After that, a **real** failure arrives dressed as a flaky one, and gets re-run and ignored.

        When a test goes flaky, treat it as a real bug in the test. Fix it, or delete it. Do not teach everyone that red means nothing.` },

    { kind: 'realworld', title: 'How teams keep the loop tight',
      body: `Teams that stay healthy treat test speed as a feature:

        - Most tests run **in memory**, in milliseconds; only a handful touch real databases or networks.
        - Tests run **on every save** in the editor, or before every commit.
        - The server runs the whole suite on every push (that is the CI you will meet in the DevOps world).
        - Someone is allowed to **delete or fix** a slow or flaky test on sight.

        The aim is a feedback loop of **seconds**, so that when a test fails you still remember the line you just changed.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Why does a slow test suite cause quality to drop, even though the tests still exist?',
      options: ['People stop running it, so the tests catch nothing', 'Slow tests give wrong answers more often', 'Slow tests are harder to write', 'The computer wears out'],
      answer: 0,
      why: [null, 'A slow test is not less correct. It is just rarely run.', 'Writing them is no harder. The cost comes later.', 'Speed has no effect on correctness.'],
      explain: 'Tests only protect you when they run. If the suite takes forty minutes, people skip it, and a test nobody runs is as good as no test.' },

    { type: 'match', after: 2, prompt: 'Match each F.I.R.S.T. letter to what it asks of a test.',
      pairs: [['**F**ast', 'Quick enough to run after every small change'], ['**I**ndependent', 'Does not rely on another test having run first'], ['**R**epeatable', 'Same result on any machine, on any day'], ['**S**elf-validating', 'Clearly reports pass or fail by itself'], ['**T**imely', 'Written close to the time the code is written']] },

    { type: 'spot', prompt: 'These tests pass alone but one fails in a full run. Tap the line that makes them dependent.',
      code: { lang: 'js', src: `
        let nextId = 1;

        test('creates order 1', () => {
          expect(createOrder().id).toBe(nextId++);
        });
        test('creates order 2', () => {
          expect(createOrder().id).toBe(nextId++);
        });` },
      lines: [1],
      explain: 'The counter lives outside both tests and changes as they run, so each test’s result depends on how many ran before it. Each test should set up its own data instead.' },

    { type: 'ab', q: 'Which test is better arranged?',
      a: { lang: 'js', label: 'Shared data', src: `
        const order = makeOrder();   // top of file

        test('applies discount', () => {
          order.member = 'GOLD';
          expect(price(order)).toBe(90);
        });` },
      b: { lang: 'js', label: 'Own data', src: `
        test('applies discount', () => {
          const order = makeOrder({ member: 'GOLD' });
          expect(price(order)).toBe(90);
        });` },
      answer: 'b',
      explain: 'The second builds a fresh order inside the test, so nothing another test did can affect it. The first edits an object shared by the whole file, and leaves it changed for whoever runs next.' },

    { type: 'tf', after: 5, statement: 'If a test passes when run on its own, it is independent and safe.', answer: false,
      explain: 'Independence means it passes in **any order and alongside others**. A test that only passes alone, or only after another, secretly depends on shared state.' },

    { type: 'cloze', text: 'A test that sometimes passes and sometimes fails without any code change is called {{flaky}}. A good test should be {{fast}} and {{independent}} of the others.',
      distractors: ['atomic', 'static', 'recursive'],
      explain: 'Flakiness usually comes from shared state, time, randomness or real network calls. Fast and independent tests keep the feedback loop short and trustworthy.' },

    { type: 'estimate', q: 'A suite has 2,000 tests that each use a real database and take about 0.3 seconds. Roughly how many minutes does one run take?', answer: 10, unit: 'minutes', tolerance: 2,
      explain: '2,000 × 0.3 s = 600 s, which is 10 minutes. And that is on every change. Small delays per test add up quickly, which is why in-memory tests matter.' },

    { type: 'scenario', title: 'Rescuing the slow suite', intro: 'You inherit a project whose tests take 25 minutes and fail "randomly" about once a day. The team re-runs the build until it goes green. A real bug has just slipped into production.',
      meters: { 'trust in tests': 20, 'feedback speed': 15 },
      steps: [
        { text: 'You look at the failures. A pattern appears: they involve tests that share a database and wait with `sleep`. What do you tackle first?',
          choices: [
            { label: 'Give each test its own fresh data, and replace fixed sleeps with in-memory stand-ins', score: 2, effects: { 'trust in tests': 40, 'feedback speed': 45 }, feedback: 'Independent, in-memory tests are both faster and deterministic. The random failures stop because their causes are gone.' },
            { label: 'Add an automatic "retry three times" to the build', score: 0, effects: { 'trust in tests': -20, 'feedback speed': -10 }, feedback: 'It hides flakiness rather than fixing it, makes the build slower, and teaches everyone that failures can be ignored.' },
            { label: 'Delete every test that ever failed', score: 1, effects: { 'trust in tests': -5, 'feedback speed': 20 }, feedback: 'It is quicker, but you have thrown away the very protection tests give. Fix them, and delete only the ones that cannot be saved.' }
          ] },
        { text: 'The suite is now two minutes. How do you keep it healthy?',
          choices: [
            { label: 'Run it in CI on every push and treat a new flaky or slow test as a bug to fix straight away', score: 2, effects: { 'trust in tests': 30, 'feedback speed': 20 }, feedback: 'Fast, trusted tests stay that way when the team defends them. A broken window is fixed, not tolerated.' },
            { label: 'Run it once a week', score: 0, effects: { 'trust in tests': -15, 'feedback speed': -20 }, feedback: 'By the time a failure shows, nobody remembers which change caused it.' },
            { label: 'Tell people to run it when they remember', score: 1, effects: { 'trust in tests': -5 }, feedback: 'Good intentions fade. An automatic run on every push does not forget.' }
          ] }
      ],
      outro: 'Make tests **fast and independent**, and make the build automatic. Then red means something again.' },

    { type: 'multi', q: 'Which of these commonly make a test flaky?',
      options: ['Depending on the current time or date', 'Sharing data with other tests that run in a different order', 'Waiting a fixed three seconds for a network call', 'Building its own fresh data inside the test', 'Giving the test a clear, descriptive name'],
      answers: [0, 1, 2],
      explain: 'Time, shared state and fixed waits all let the outcome change without the code changing. Fresh private data and good names make tests more reliable, not less.' }
  ],

  flashcards: [
    { q: 'What does F.I.R.S.T. stand for?', a: 'Fast, Independent, Repeatable, Self-validating, Timely: five properties of a good test.' },
    { q: 'Why do slow tests do harm?', a: 'People stop running them, so bugs get through. A test nobody runs protects nothing.' },
    { q: 'What makes tests dependent on each other?', a: 'Shared mutable state, such as a variable or database rows one test changes and another reads, so the result depends on the order.' },
    { q: 'What is a flaky test, and why is it dangerous?', a: 'One that sometimes passes and sometimes fails with no code change. Teams learn to ignore red builds, and real failures get ignored too.' },
    { q: 'How do you arrange isolated test data?', a: 'Build fresh data inside each test (using small helper functions), reset before each one, and never rely on another test’s leftovers.' }
  ],

  glossary: [
    { term: 'Test suite', def: 'The whole collection of automated tests for a project.', like: 'The full pre-flight checklist for an aircraft.' },
    { term: 'F.I.R.S.T.', def: 'A checklist for good tests: Fast, Independent, Repeatable, Self-validating, Timely.', like: 'A smoke alarm should be quick, trustworthy and independent of the neighbours’.' },
    { term: 'Shared mutable state', def: 'Data that several parts of the program can change, so one part’s changes affect another’s results.', like: 'A communal whiteboard that anyone can wipe.' },
    { term: 'Flaky test', def: 'A test that sometimes passes and sometimes fails without any change to the code.', like: 'The boy who cried wolf: so unreliable that you ignore the real alarm.' }
  ],

  takeaways: [
    '**Tests nobody runs catch nothing**, so make them fast.',
    'Each test builds its own data. Order must never matter.',
    'Fast comes from staying in memory: avoid real networks, disks and sleeps.',
    'A flaky test is a bug in the test. Fix or delete it, never shrug it off.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cc-kiss-refactor', {
  eli5: 'Do the simplest thing that works, and then keep tidying the code in tiny, safe steps that change how it is built without changing what it does.',

  cards: [
    { kind: 'concept', title: 'The plugin system for one customer',
      body: `A team is asked to let customers choose between two email greetings. A keen developer designs a **greeting framework**: a factory, a registry, configuration files and a plug-in interface, "so we can add any kind of greeting in future".

        A month later there are still exactly two greetings. New joiners need a diagram to find where "Hello" is printed. The whole thing could have been:

        \`\`\`js
        const greeting = customer.formal ? 'Dear ' : 'Hi ';
        \`\`\`

        This is why engineers have an old motto, **KISS: Keep It Simple**. Build the simplest thing that solves today's problem. A closely related slogan is **YAGNI** (*You Aren't Gonna Need It*): do not build for a future that may never arrive.` },

    { kind: 'metaphor', title: 'The 40-ingredient toast',
      body: `Imagine a recipe for toast with forty ingredients and nine appliances, "in case you ever want to make croissants".

        You came for toast. The recipe is now harder to follow, slower to make, easier to get wrong, and the croissant day never comes.

        Simple is not the same as **easy** or **primitive**. It takes skill to find the plain solution, and judgement to leave the clever one unbuilt.

        Complexity you add on spec is a loan, just like the shortcuts in the first lesson. You pay interest on it, every day, in exchange for something you may never use.` },

    { kind: 'code', title: 'Over-built versus simple',
      body: 'Both print a price with the right discount. Tap the lines in the first one.',
      code: { lang: 'js', src: `
        // over-built
        class DiscountStrategyFactory {
          create(type) { return registry.get(type).instantiate(); }
        }
        class MemberDiscountStrategy {
          apply(price) { return price * 0.9; }
        }

        // simple
        function memberPrice(price) {
          return price * 0.9;
        }`,
        notes: {
          2: 'A factory, to choose between strategies, when there is only one so far.',
          3: 'A registry lookup and an instantiate step. Every call now has to run through machinery.',
          6: 'The real rule is one line, hiding behind two classes.',
          10: 'One function says the same thing. If a second discount ever arrives, *then* split it, with real examples to guide you.'
        } },
      note: 'Patterns like these have their place, and a later module covers them. The point here is: reach for them when a real problem asks, not in advance.' },

    { kind: 'compare', title: 'What does each kind of change touch?',
      body: '**Refactoring** means changing the *structure* of code without changing its *behaviour*. This is the definition Martin Fowler gives in his book *Refactoring*. Compare it with the other things we do to code.',
      cols: ['Structure', 'Behaviour'],
      rows: [
        ['Refactoring', 'Changes (cleaner, clearer)', '**Stays exactly the same**'],
        ['Adding a feature', 'May change', 'Changes: new things are possible'],
        ['Fixing a bug', 'Usually a small change', 'Changes: wrong becomes right'],
        ['Rewriting from scratch', 'Replaced entirely', 'Hopefully the same, but risky']
      ] },

    { kind: 'compare', title: 'Common code smells',
      body: 'A **code smell** is a surface sign that something deeper may be wrong. You have already met most of these and their cures.',
      cols: ['Usual fix', 'Seen in'],
      rows: [
        ['Long function', 'Extract methods', 'Small'],
        ['Vague or cryptic names', 'Rename', 'Naming'],
        ['Duplicated code', 'Pull into one function', 'This lesson'],
        ['Deeply nested ifs', 'Guard clauses', 'Complexity'],
        ['Long parameter list', 'Parameter object', 'Small'],
        ['Null checks everywhere', 'Null object, empty list', 'Nulls & booleans'],
        ['A magic number', 'Named constant', 'Why clean code']
      ] },

    { kind: 'steps', title: 'The safe refactoring loop',
      body: 'Refactoring is a rhythm of tiny steps, each one checked. Never a big leap.',
      steps: [
        { title: 'Check you have tests, and that they pass', body: 'They are your safety net. If there are none, write a few for the behaviour you are about to touch.' },
        { title: 'Make one small change', body: 'Rename a variable. Extract one function. Not both at once.' },
        { title: 'Run the tests', body: 'Quick tests (last lesson!) make this take seconds.' },
        { title: 'Green? Save it. Red? Undo.', body: 'If a test fails, you know the last tiny step caused it, so undoing is easy. Commit each green step.' },
        { title: 'Repeat', body: 'Dozens of small safe steps add up to a big improvement, without ever having a "broken" afternoon.' }
      ] },

    { kind: 'code', title: 'One smell, one small step',
      body: 'Duplication is the classic. Tap the lines to see the change, and what it buys.',
      code: { lang: 'js', src: `
        // before
        function weeklyReport(orders) {
          let total = 0;
          for (const o of orders) total += o.total;
          return 'Weekly: £' + total.toFixed(2);
        }
        function monthlyReport(orders) {
          let total = 0;
          for (const o of orders) total += o.total;
          return 'Monthly: £' + total.toFixed(2);
        }

        // after
        function sumTotals(orders) {
          return orders.reduce((sum, o) => sum + o.total, 0);
        }
        function weeklyReport(orders) {
          return 'Weekly: £' + sumTotals(orders).toFixed(2);
        }
        function monthlyReport(orders) {
          return 'Monthly: £' + sumTotals(orders).toFixed(2);
        }`,
        notes: {
          3: 'The same three lines, copied. If the rule for totals changes, will someone remember both?',
          8: 'There is the copy. A bug fixed in one place stays in the other.',
          14: 'The rule now lives in **one** place, with a name.',
          17: 'The report functions say what they do and nothing else. Same output as before, which is the whole point of a refactor.'
        } } },

    { kind: 'sequence', title: 'What a red test looks like mid-refactor',
      body: 'The tests are what let you move quickly without fear.',
      actors: ['Developer', 'Tests'],
      steps: [
        { at: 0, label: 'rename `o` to `order`', note: 'A tiny change, no behaviour affected.' },
        { from: 0, to: 1, label: 'run', note: 'Takes two seconds.' },
        { from: 1, to: 0, label: 'all green', dashed: true, note: 'Commit. Next step.' },
        { at: 0, label: 'extract `sumTotals`', note: 'Another small move.' },
        { from: 0, to: 1, label: 'run', note: 'Check again.' },
        { from: 1, to: 0, label: '1 failed: monthlyReport', dashed: true, note: 'The extracted code forgot the empty-list case. You know exactly which step broke it: the last one.' },
        { at: 0, label: 'undo, retry smaller', note: 'A small step means a cheap undo. Large refactors without tests do not have that luxury.' }
      ] },

    { kind: 'pitfall', title: 'When not to refactor',
      body: `Refactoring is a means, not a goal. Hold off when:

        - **There are no tests** and you cannot easily write any. You would be changing code blindly. Add tests first.
        - **The code works and nobody needs to touch it.** Ugly but stable code that never changes is costing nothing.
        - **It is about to be deleted** or replaced.
        - **You do not yet understand it.** Learn what it does before reshaping it.
        - **It is a big rewrite in disguise.** Refactoring is small steps, always releasable. A rewrite is a different, riskier decision.

        A useful rule of thumb is the **rule of three**: the first time, just do it; the second, wince and copy; the third, refactor. By then you can see the real shape of the duplication.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'A teammate wants to build a flexible plug-in system "in case" you need more email greetings in future. You have two greetings. What does KISS suggest?',
      options: ['Write the simple version; add flexibility when it’s needed', 'Build the plug-in system now to save time later on', 'Write nothing until the requirements are final', 'Copy the greeting code into every file that needs it'],
      answer: 0,
      why: [null, 'You pay for the complexity every day, for a future that may never come.', 'Waiting for final requirements means never starting. Build the simple thing.', 'Copying everywhere is a different mess, not simplicity.'],
      explain: 'Solve today’s problem plainly. If a third greeting arrives, you will know what the real variation is, and refactoring then will be cheaper and better aimed.' },

    { type: 'tf', after: 3, statement: 'A refactoring changes the structure of code without changing what the program does.', answer: true,
      explain: 'Refactoring changes only the **structure** (names, layout, how it is split up). Behaviour stays the same. If behaviour changes, that is a feature or a bug fix, which should be done separately.' },

    { type: 'bucket', prompt: 'Is each of these a refactoring, or a different kind of change?', buckets: ['Refactoring', 'Something else'],
      items: [['Rename `t` to `total` everywhere', 0], ['Add a promo-code field to checkout', 1], ['Extract the loop into `sumTotals()`', 0], ['Fix the crash when the cart is empty', 1], ['Turn five nested ifs into guard clauses', 0], ['Change the price format from `£5` to `5.00 GBP`', 1]],
      explain: 'If the program does exactly the same thing afterwards, it is a refactoring. New features, bug fixes and output changes alter behaviour, so they are different changes and should be made separately.' },

    { type: 'spot', after: 6, prompt: 'Tap one of the two lines that are exact copies of each other.',
      code: { lang: 'js', src: `
        function weeklyTotal(orders) {
          let total = 0;
          for (const o of orders) total += o.total;
          return total;
        }
        function monthlyTotal(orders) {
          let total = 0;
          for (const o of orders) total += o.total;
          return total;
        }` },
      lines: [3, 8],
      explain: 'The same logic appears twice. A fix to one copy will silently be missing from the other. Extracting one shared function means the rule lives, and changes, in a single place.' },

    { type: 'ab', q: 'Which is the better answer to "double the price for non-members"?',
      a: { lang: 'js', label: 'Simple', src: `
        const price = member ? base : base * 2;` },
      b: { lang: 'js', label: 'Prepared for anything', src: `
        const price = PricingEngine
          .forCustomer(customer)
          .withStrategy(StrategyRegistry.get('default'))
          .compute(base);` },
      answer: 'a',
      explain: 'One line states the actual rule. The second builds machinery for pricing rules that do not exist yet. Add structure when the second or third real case turns up.' },

    { type: 'order', prompt: 'Put the safe refactoring loop in order.',
      items: ['Make sure tests exist and pass', 'Make one small change', 'Run the tests', 'Commit if green, undo if red', 'Repeat with the next small change'],
      explain: 'Tests first give you a safety net. Then one tiny change and a check at a time, so any failure is traceable to the last step.' },

    { type: 'match', prompt: 'Match each code smell to its usual cure.',
      pairs: [['Long function', 'Extract methods'], ['Duplicated code', 'Pull it into one shared function'], ['Deeply nested ifs', 'Guard clauses'], ['Cryptic names', 'Rename'], ['Long parameter list', 'Group into a parameter object']] },

    { type: 'scenario', title: 'The tempting clean-up', intro: 'You are fixing a small bug in `calculateInvoice`, a 200-line function with no tests. It is ugly, and you are itching to reorganise it before the Friday release.',
      meters: { 'risk': 50, 'code health': 30 },
      steps: [
        { text: 'What do you do first?',
          choices: [
            { label: 'Write a few tests that pin down what it does now, then fix the bug', score: 2, effects: { 'risk': -20, 'code health': 15 }, feedback: 'The tests are your safety net: they record current behaviour, so you can fix the bug and refactor later without guessing.' },
            { label: 'Reorganise it all now, then fix the bug while you are in there', score: 0, effects: { 'risk': 30, 'code health': 5 }, feedback: 'A big untested restructure just before a release. If something breaks you will not know if the cause is the clean-up or the fix.' },
            { label: 'Fix the bug and leave everything else untouched', score: 1, effects: { 'risk': -5 }, feedback: 'Sensible given the deadline. But adding even a couple of tests first would have made future clean-ups possible.' }
          ] },
        { text: 'With the tests in place and the bug fixed, there is time before Friday. What next?',
          choices: [
            { label: 'Do one or two small, safe refactorings (rename, extract), running the tests each time', score: 2, effects: { 'risk': -10, 'code health': 25 }, feedback: 'The boy scout rule plus the safe loop. The code is better and the release is not in danger.' },
            { label: 'Start the full rewrite as a new function', score: 0, effects: { 'risk': 25, 'code health': -5 }, feedback: 'A rewrite is a different, much riskier project. It does not belong in a release week.' },
            { label: 'Leave it; the bug is fixed', score: 1, effects: { 'code health': 0 }, feedback: 'Fine, but small steps cost almost nothing now and pay back every later visit.' }
          ] }
      ],
      outro: 'Tests first, then **small, reversible steps**, each one checked. That is how refactoring stays safe.' },

    { type: 'explain', prompt: 'Explain to a teammate the difference between refactoring and rewriting, and why tests matter for the first.',
      model: 'Refactoring changes the structure of code in small steps while keeping behaviour exactly the same, such as renaming or extracting a function. A rewrite replaces it wholesale and risks changing behaviour. Tests are what prove that behaviour stayed the same after each small step, so a failure points at the last change and can be undone.',
      keywords: ['structure', 'behaviour', 'small steps', 'tests', 'undo', 'rewrite'] }
  ],

  flashcards: [
    { q: 'What does KISS mean, and what is YAGNI?', a: 'KISS: keep it simple; build the simplest thing that solves today’s problem. YAGNI: You Aren’t Gonna Need It; do not build for a future that may not come.' },
    { q: 'What is refactoring?', a: 'Changing the internal structure of code without changing what it does.' },
    { q: 'What is a code smell?', a: 'A surface sign, such as duplication, a huge function or magic numbers, that something deeper may be wrong.' },
    { q: 'Why should refactoring be done in small steps backed by tests?', a: 'Tests prove behaviour is unchanged. After a tiny step, a failure points at the last change and is easy to undo.' },
    { q: 'Name two times you should not refactor.', a: 'When there are no tests and you cannot add any; when the code is stable and nobody needs to touch it; or when it is about to be deleted.' }
  ],

  glossary: [
    { term: 'KISS', def: 'Keep It Simple: choose the simplest solution that works for the problem you actually have.', like: 'Making toast, not a 40-ingredient recipe.', aka: ['Keep It Simple'] },
    { term: 'YAGNI', def: 'You Aren’t Gonna Need It: do not add features or flexibility for needs that have not appeared yet.', like: 'Not buying a boat because you might one day live by a lake.' },
    { term: 'Refactoring', def: 'Improving the structure of code in small steps without changing its behaviour.', like: 'Tidying a workshop without changing what it makes.' },
    { term: 'Code smell', def: 'A recognisable surface symptom in code, such as duplication or very long functions, that hints at a deeper design problem.', like: 'A funny smell in the fridge: not proof of rot, but worth a look.' }
  ],

  takeaways: [
    '**Simplest thing that works.** Add flexibility when a real need appears.',
    'Refactoring changes structure, **not** behaviour.',
    'Tests first, then tiny steps: green means keep, red means undo.',
    'Skip refactoring when there are no tests, no need, or no future for the code.'
  ],

  links: [
    { label: 'Refactoring.com: What is refactoring? (Martin Fowler)', url: 'https://refactoring.com/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('clean-code', {
  title: 'The Spaghetti Hydra',
  intro: 'A many-headed tangle of nested ifs, mystery names and flaky tests blocks the road to the next module. Cut off each head with the right clean-code move, and think carefully: some of them grow back if you pick the cheap fix.',
  questions: [
    { type: 'mcq', q: 'A team ships quickly for six months with no tidying. Estimates for small changes have now tripled, and developers are afraid to touch some files. What is the best description of what has happened?',
      options: ['Technical debt is charging interest: each change costs extra to work around the mess', 'The developers have lost their skills after six months of pressure', 'The language they chose is too slow for a codebase this size', 'Tests were written too early and now block every change'],
      answer: 0,
      why: [null, 'The same developers were fast at the start. The code changed, not them.', 'Language speed is a runtime matter, not what makes changes slow to write.', 'Tests are not what slows the changes. The tangled code is.'],
      explain: 'Shortcuts are loans. Without paying them back, each later change costs more (the interest), and the slowdown creates pressure for yet more shortcuts.' },

    { type: 'tf', statement: 'The cleanest long-term fix for a flaky test is to make the build retry it automatically until it goes green.', answer: false,
      explain: 'Retries hide the flakiness and slow the build, and they teach the team to ignore red. The real fix is to remove the cause: shared state, hidden time or randomness, or real network calls.' },

    { type: 'ab', q: 'Which function follows more of this module’s advice?',
      a: { lang: 'js', label: 'Edits its argument', src: `
        function addVat(order) {
          order.total = order.total * 1.2;
          console.log('vat added');
        }` },
      b: { lang: 'js', label: 'Returns a result', src: `
        const VAT_RATE = 0.2;

        function totalWithVat(total) {
          return total * (1 + VAT_RATE);
        }` },
      answer: 'b',
      explain: 'The second is pure (same input, same output, nothing else touched), the rate has a name, and its name is a noun-phrase describing the result. The first mutates its argument and writes to the console.' },

    { type: 'spot', prompt: 'Tap the line where a pair of booleans hides what the call really does.',
      code: { lang: 'js', src: `
        const invoice = loadInvoice(id);
        const pdf = renderInvoice(invoice, true, false);
        upload(pdf);
        notify(invoice.customer);` },
      lines: [2],
      explain: 'What do `true` and `false` mean: landscape? watermark? draft? Nobody can tell without opening `renderInvoice`. Named functions or an options object (`{ landscape: true }`) would make the call readable.' },

    { type: 'multi', q: 'Which of these are genuine refactorings?',
      options: ['Renaming `t` to `total` throughout a function', 'Extracting a block of code into a named function', 'Replacing nested ifs with guard clauses, with identical results', 'Adding a promo-code field to checkout', 'Fixing a crash when the cart is empty'],
      answers: [0, 1, 2],
      explain: 'A refactoring changes structure but not behaviour. Adding a feature or fixing a bug changes what the program does, so those are different kinds of change.' },

    { type: 'order', prompt: 'Put these in order to move a side effect to the edge of the program.',
      items: ['Read the order and the date from the database and clock', 'Pass plain values into the pure business rule', 'Get the decision back as a plain value', 'Save the result and send the email'],
      explain: 'Messy reading happens first, at the edge. The middle only transforms values, and the final step performs the effects. That keeps all the decision logic easy to test.' },

    { type: 'bucket', prompt: 'Which lesson’s idea fixes each problem?', buckets: ['Naming', 'Small functions', 'Pure functions', 'Nulls & flags'],
      items: [['A variable called `d` that nobody can decode', 0], ['A 300-line `checkout` function', 1], ['A test that fails on Saturdays because it reads the clock', 2], ['`send(user, true)` with no idea what `true` does', 3], ['A function with seven positional parameters', 1], ['`findOrders` returns `null` when there are none', 3], ['A discount function that edits the order it was given', 2], ['`isOk` that means "is overdue"', 0]],
      explain: 'Each smell has a home: names reveal intention, small functions keep one level of abstraction, pure functions remove hidden inputs and effects, and avoiding nulls and flags removes hidden cases.' },

    { type: 'cloze', code: true, text: '// a {{query}} returns data and changes nothing\nfunction total(order) { return order.total; }\n\n// an early exit that handles a problem first is a {{guard}} clause\nif (!order) {{return}} \'no order\';',
      distractors: ['command', 'loop', 'throws'],
      explain: 'Command Query Separation names the first idea: a question that does not change anything. Guard clauses handle odd cases first so the main path stays flat.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Cyclomatic complexity', 'A count of independent paths: 1 plus the decisions'], ['Package by feature', 'Folders named for what the code is for'], ['Magic number', 'A bare value with no explanation of its meaning'], ['Flaky test', 'Sometimes passes, sometimes fails, with no code change'], ['YAGNI', 'Do not build for needs that have not appeared']] },

    { type: 'estimate', q: 'A function has four separate `if` statements, none nested, and each can be true or false independently. At most how many different combinations of outcomes could an order trigger?', answer: 16, unit: 'combinations', tolerance: 1.5,
      explain: 'Each independent yes/no doubles the possibilities: 2 × 2 × 2 × 2 = 16. That is why testing every combination quickly becomes impractical, and why fewer branches help. (The complexity score, 5, is how many tests it takes to walk each independent path. Running every branch once could take just 2: all true, then all false.)' },

    { type: 'short', q: 'What name is given to an early `return` that handles an unusual case first, so the main path is not nested?', accept: ['guard clause', 'guard', 'guard clauses'], hint: 'It stands at the door and turns problems away.',
      explain: 'A guard clause deals with the problem case and exits, so the happy path below has no extra indentation.' },

    { type: 'mcq', q: 'Marketing and Finance teams keep colliding in `services/orderService.js`, and a Finance bug appeared after a Marketing change. What structural change best fits this module?',
      options: ['Split promotions and invoicing into separate folders', 'Merge more rules into the file so all logic is in one place', 'Rename the file to `utils.js` so anyone can add to it', 'Ask the two teams to avoid editing on the same day'],
      answer: 0,
      why: [null, 'Putting more rules in one file increases the number of people who collide in it.', 'A vaguer name makes it a junk drawer and does nothing for the collisions.', 'A process workaround for a structural problem. It fails the day someone forgets.'],
      explain: 'Different actors need different corners of the code. Package by feature or actor means a change from one group lands in one folder, so there are fewer collisions and accidental breakages.' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.sheet('clean-code', {
  title: 'Clean Code cheat sheet',
  sections: [
    { title: 'The mindset',
      md: `- Code is **read far more than written**: optimise for the reader.
        - Shortcuts are **technical debt**: a loan with interest. Small and deliberate can be fine; unnoticed is dangerous.
        - **Boy scout rule:** leave code a little cleaner than you found it.
        - Clean means plain, not clever.
        - **KISS / YAGNI:** the simplest thing that works; do not build for needs that have not appeared.
        - Trouble signs: simple changes take ages, fixes cause unrelated bugs, "don't touch that".` },

    { title: 'Names, comments, style',
      md: `| Do | Avoid |
        |---|---|
        | \`unpaidInvoices\`, \`calculateTax\`, \`isActive\` | \`data\`, \`temp\`, \`usrLst\`, \`doStuff\` |
        | Verbs for functions, nouns for classes, questions for booleans | Noise words (\`UserInfo\`), misleading names |
        | Comments that explain **why** | Comments that restate **what** (they go stale) |

        **Style:** consistency beats taste. Pick a guide (PEP 8, Google, Airbnb), then let a **formatter** (Prettier, Black, \`gofmt\`) and **linter** (ESLint, Ruff) enforce it on save, on commit and in CI.` },

    { title: 'Size, purity, complexity',
      md: `- **One level of abstraction** per function. Extract method until the top reads like a summary.
        - **"And" test:** needing "and" to describe a class means two jobs.
        - Long parameter list? Use a **parameter object**. Do not over-split.
        - **Pure function:** same input, same output, no side effects. Push effects to the edges; copy, do not mutate.
        - **Complexity = 1 + decisions.** More paths means more tests.
        - Fix arrows with **guard clauses**; fix value-picking chains with a **lookup table**; fix repeated type-switching with **polymorphism**.` },

    { title: 'Nulls, flags, commands and queries',
      md: `| Smell | Fix |
        |---|---|
        | Returning \`null\` for "none" | Empty list, null object, Optional type |
        | \`send(x, true)\` | Two named functions, or a named option |
        | Missing argument | Default parameter or options object |
        | Bad input deep inside | **Fail fast** at the boundary |

        **CQS:** a method either **changes** state (command) or **returns** data (query), not both. Exceptions: \`pop()\`, counters. **CQRS** is the large-scale architecture version.` },

    { title: 'Constructs, frameworks, structure',
      md: `- Choose by intent: \`filter\` / \`map\` / \`find\` / \`some\`; **Set** for "seen it?", **Map** for lookups.
        - Right types: money as whole pennies, states as named constants.
        - Follow the language's **idioms**.
        - Keep business rules **free of framework code**; put frameworks and vendors behind thin adaptors. Wrap what is likely to change, not everything.
        - Organise by **who asks for changes**: package by **feature** over package by **layer** as teams grow.
        - Share only what is truly common and stable.` },

    { title: 'Tests and refactoring',
      md: `**F.I.R.S.T.:** **F**ast, **I**ndependent, **R**epeatable, **S**elf-validating, **T**imely.

        - Slow tests do not get run. Stay in memory.
        - Each test builds its **own data**; order must never matter.
        - Flaky tests are bugs: fix or delete, never ignore.

        **Refactoring** = change structure, not behaviour.

        1. Tests pass.
        2. One small change.
        3. Run tests.
        4. Green: commit. Red: undo.
        5. Repeat.

        Skip it when there are no tests, no need, or no future for the code.` },

    { title: 'Common smells at a glance',
      md: `| Smell | Usual cure |
        |---|---|
        | Long function | Extract methods |
        | Cryptic name | Rename |
        | Duplicated code | One shared function (rule of three) |
        | Nested ifs | Guard clauses |
        | Magic number | Named constant |
        | God class, junk-drawer file | Split by actor |
        | Null checks everywhere | Null object, empty list |
        | Flag arguments | Separate functions |` }
  ]
});

