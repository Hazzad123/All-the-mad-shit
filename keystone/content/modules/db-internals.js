/* Module: db-internals — Databases Under the Hood.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs db-internals */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-transactions', {
  eli5: 'A transaction wraps several database changes into one bundle, so that either all of them happen or none of them do, and nobody is left with half a job.',

  cards: [
    { kind: 'concept', title: 'The money that vanished',
      body: `You send £100 to a friend. Behind the scenes the bank does two things:

        1. Take £100 from your account.
        2. Add £100 to your friend's account.

        Now imagine the server loses power **between** step 1 and step 2. Your £100 has left. Your friend's £100 never arrived. The money does not exist anywhere.

        Each step is a perfectly good SQL statement. The disaster is in the **gap** between them. We need a way to say "these two steps are really one job".

        That way is called a **transaction**.` },

    { kind: 'metaphor', title: 'The till at the corner shop',
      body: `At a shop till, your basket is either **bought** or **not bought**. The cashier never rings up half of it, takes your card, then shrugs.

        If your card is declined at the end, the cashier does not keep the first three items on a "partly paid" tab. The whole basket goes back on the shelf, and the till returns to how it was before you arrived.

        A transaction is that till: a bundle of changes that is **paid for as one** or **put back as one**.

        Where the metaphor stops: a till is slow and has a queue. A database handles thousands of baskets at the same time, which is the subject of the next few lessons.` },

    { kind: 'code', title: 'BEGIN, COMMIT and ROLLBACK',
      body: 'A transaction has three keywords. Tap each highlighted line.',
      code: { lang: 'sql', src: `
        BEGIN;
        UPDATE accounts SET balance = balance - 100 WHERE id = 1;
        UPDATE accounts SET balance = balance + 100 WHERE id = 2;
        COMMIT;`,
        notes: {
          1: '`BEGIN` opens the bundle. (MySQL also accepts `START TRANSACTION`.) From here on, the changes are **tentative**.',
          2: 'Take £100 from account 1. Written down, but not yet final.',
          3: 'Add £100 to account 2. If the server dies right now, the database wakes up with *neither* update applied.',
          4: '`COMMIT` makes the whole bundle final in one step. Before this line, nothing is permanent; after it, everything is.'
        } },
      note: 'If anything goes wrong before `COMMIT`, you can type `ROLLBACK;` and the database forgets everything since `BEGIN`.' },

    { kind: 'sequence', title: 'When step two fails',
      body: 'A transfer where the second step hits an error. Step through it.',
      actors: ['App', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'BEGIN', note: 'The app opens a transaction.' },
        { from: 0, to: 1, label: 'debit account 1 by £100', note: 'Accepted, but only tentatively.' },
        { from: 1, to: 0, label: 'ok', dashed: true, note: 'The database says it worked. It has not been made permanent yet.' },
        { from: 0, to: 1, label: 'credit account 2 by £100', note: 'Imagine account 2 was closed last week, or the table is locked and the request times out.' },
        { from: 1, to: 0, label: 'ERROR', dashed: true, note: 'The second statement fails.' },
        { from: 0, to: 1, label: 'ROLLBACK', note: 'The app tells the database to undo everything since `BEGIN`.' },
        { at: 1, label: 'balances restored', note: 'Account 1 has its £100 back. It is as if the transfer never started. No money was lost, and you can simply try again.' }
      ] },

    { kind: 'compare', title: 'With and without a transaction',
      body: 'Same two statements, same crash. Very different mornings.',
      cols: ['No transaction', 'With a transaction'],
      rows: [
        ['Crash after the debit', 'Account 1 is £100 short, account 2 unchanged', 'The debit is discarded on restart'],
        ['Money in the system', 'Total has dropped by £100', 'Total unchanged'],
        ['Who cleans up', 'A human, with a spreadsheet', 'The database, automatically'],
        ['What the app does on error', 'Hope', 'Run `ROLLBACK` and retry']
      ] },

    { kind: 'code', title: 'Savepoints: a bookmark inside a bundle',
      body: 'Sometimes you want to undo only the **last part** of a transaction, not all of it. A savepoint is a bookmark you can roll back to.',
      code: { lang: 'sql', src: `
        BEGIN;
        INSERT INTO orders (customer_id, status) VALUES (7, 'new');
        INSERT INTO order_items VALUES (501, 3, 1);
        SAVEPOINT gift_wrap;
        INSERT INTO order_items VALUES (501, 99, 1);
        ROLLBACK TO SAVEPOINT gift_wrap;
        COMMIT;`,
        notes: {
          4: '`SAVEPOINT` drops a named bookmark. Everything above it is safe from a partial rollback.',
          5: 'Try adding an optional extra, here product 99 (gift wrap).',
          6: 'The gift wrap is out of stock, so we undo **back to the bookmark only**. The order and its first item survive.',
          7: 'The commit saves the order without the gift wrap. A plain `ROLLBACK` here would have thrown the whole order away.'
        } } },

    { kind: 'pitfall', title: 'Do not leave the bundle open',
      body: `While a transaction is open, the rows it has touched are usually **held**, so others must wait. A transaction that stays open for seconds, or minutes, makes everyone else queue.

        The classic mistake is putting something slow **inside** the bundle: sending an email, calling a payment provider over the internet, or waiting for a person to click "Confirm".

        Those steps cannot be rolled back anyway. You cannot un-send an email by typing \`ROLLBACK\`.

        Do the slow, outside-world work **before** \`BEGIN\` or **after** \`COMMIT\`. Keep the bundle to database changes only.` },

    { kind: 'tip', title: 'Short, small, always finished',
      body: `Three habits that keep transactions healthy:

        - **Short.** Open late, close early. Milliseconds, not minutes.
        - **Small.** Only the statements that truly must succeed together.
        - **Always finished.** Every \`BEGIN\` ends in a \`COMMIT\` or a \`ROLLBACK\`, including when your code throws an error.

        One more fact worth knowing: most databases run in **autocommit** mode by default. A lone \`UPDATE\` with no \`BEGIN\` is quietly wrapped as its own tiny one-statement transaction and committed immediately. That is why a single statement is already all-or-nothing, but two statements in a row are not.` },

    { kind: 'realworld', title: 'Placing an order in the shop',
      body: `In our shop schema, one checkout touches several tables:

        - insert a row into \`orders\`
        - insert each line into \`order_items\`
        - reduce the stock count of each product

        Without a transaction, a crash halfway could leave an order with no items, or items with no order, or stock reduced for an order that never existed.

        Wrapped in one transaction, the order is either **fully there** or **not there at all**. Nearly every online shop, bank and booking system relies on exactly this.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'The server crashes after the debit but before the credit, and there is no transaction. What state is the data in?',
      options: ['One account is £100 down and the other unchanged, so money has vanished', 'Both accounts are back to their old balances automatically', 'The credit is applied anyway when the server restarts', 'The database refuses to start until someone fixes it'],
      answer: 0,
      why: [null, 'That only happens if the two steps were wrapped in a transaction.', 'The database has no way to know the credit was ever intended.', 'Databases start happily; they just cannot know the data is wrong.'],
      explain: 'Each statement on its own is complete and permanent. Without a transaction tying them together, a crash in the gap leaves just the first one done.' },

    { type: 'tf', after: 2, statement: '`ROLLBACK` undoes every change made since the matching `BEGIN`.', answer: true,
      explain: 'That is its whole job. The database discards the tentative changes, and it is as if the transaction never happened. After a `COMMIT`, though, it is too late: committed changes are permanent.' },

    { type: 'order', after: 5, prompt: 'Put the savepoint example in order, from the first line to the last.',
      items: ['BEGIN', 'INSERT the order and its first item', 'SAVEPOINT gift_wrap', 'INSERT the optional gift wrap item', 'ROLLBACK TO SAVEPOINT gift_wrap', 'COMMIT'],
      explain: 'The bookmark has to exist before you can return to it, and the final `COMMIT` saves whatever remains. Rolling back to a savepoint keeps the transaction open; only `COMMIT` or a full `ROLLBACK` ends it.' },

    { type: 'cloze', code: true, text: `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- the second update fails with an error
{{ROLLBACK}};

-- all went well? then instead:
{{COMMIT}};`,
      distractors: ['SAVEPOINT', 'END TRANSACTION', 'UNDO'],
      explain: '`ROLLBACK` discards the tentative work after an error; `COMMIT` makes it permanent when everything succeeded. Every transaction must finish with one of the two.' },

    { type: 'ab', q: 'Which checkout transaction is better behaved?',
      a: { lang: 'sql', label: 'Version 1', src: `
        BEGIN;
        UPDATE products SET stock = stock - 1 WHERE id = 3;
        -- call the card provider over the internet (2 seconds)
        -- email the receipt (1 second)
        INSERT INTO orders (customer_id, status) VALUES (7, 'paid');
        COMMIT;` },
      b: { lang: 'sql', label: 'Version 2', src: `
        -- call the card provider first (2 seconds)
        BEGIN;
        UPDATE products SET stock = stock - 1 WHERE id = 3;
        INSERT INTO orders (customer_id, status) VALUES (7, 'paid');
        COMMIT;
        -- email the receipt afterwards (1 second)` },
      answer: 'b',
      explain: 'The slow work happens outside the bundle, so the stock row is held for milliseconds, not seconds. Emails cannot be rolled back anyway, so they belong after the commit.' },

    { type: 'spot', prompt: 'This code opens a transaction around a checkout. Tap the line that does not belong inside it.',
      code: { lang: 'js', src: `
        await db.query('BEGIN');
        await db.query('INSERT INTO orders (customer_id) VALUES ($1)', [id]);
        await sendConfirmationEmail(customer);
        await db.query('UPDATE products SET stock = stock - 1 WHERE id = 3');
        await db.query('COMMIT');` },
      lines: [3],
      explain: 'Sending an email is slow, depends on another system, and cannot be undone by a rollback. Every row locked above stays locked while the email is sent. Move it after the `COMMIT`.' },

    { type: 'bucket', prompt: 'Which steps must succeed or fail **together**, and which can live outside the transaction?', buckets: ['One transaction', 'Outside it'],
      items: [['Debit one account, credit another', 0], ['Insert an order and its `order_items` rows', 0], ['Reduce stock and record the sale', 0], ['Send the confirmation email', 1], ['Render the "thank you" page', 1], ['Generate a PDF invoice', 1]],
      explain: 'Database changes that only make sense as a set go together. Emails, pages and PDFs are slow, outside the database, and can be redone or retried separately.' },

    { type: 'scenario', title: 'Checkout under pressure',
      intro: 'You are writing the checkout code for the shop. A customer buys one product, and three things must happen in the database. Decisions have consequences.',
      meters: { integrity: 70, speed: 70 },
      steps: [
        { text: 'The checkout needs to insert an order, insert its items and reduce the stock. How do you structure it?',
          choices: [
            { label: 'Wrap all three statements in one `BEGIN` … `COMMIT`', feedback: 'Exactly right. The three changes are one job, so they succeed or fail as one.', score: 2, effects: { integrity: 20 } },
            { label: 'Run them as three separate statements and hope for the best', feedback: 'Each is individually safe, but a crash between them leaves an order with no items, or stock taken for nothing.', score: 0, effects: { integrity: -30 } },
            { label: 'Wrap them in a transaction, and also email the receipt inside it', feedback: 'The data is safe, but the email makes the bundle slow, and it cannot be undone on rollback.', score: 1, effects: { integrity: 10, speed: -25 } }
          ] },
        { text: 'The stock update fails because the product is out of stock. Your code catches the error. What now?',
          choices: [
            { label: 'Run `ROLLBACK`, then tell the customer it is out of stock', feedback: 'Clean. No orphan order, no stray items, and the customer gets an honest message.', score: 2, effects: { integrity: 15 } },
            { label: 'Ignore the error and run `COMMIT` anyway', feedback: 'You have just committed an order for something you cannot ship.', score: 0, effects: { integrity: -35 } },
            { label: 'Leave the transaction open while you think about it', feedback: 'The rows stay held and other customers start queueing. An unfinished transaction is a quiet emergency.', score: 0, effects: { speed: -30 } }
          ] },
        { text: 'Marketing want an optional gift-wrap line. If it fails, the order should still go through. What is the neat way?',
          choices: [
            { label: 'Set a `SAVEPOINT` before it and roll back to it if it fails', feedback: 'That undoes only the gift wrap and keeps the order alive in the same transaction.', score: 2, effects: { integrity: 10 } },
            { label: 'Roll back the whole transaction and ask the customer to start again', feedback: 'Safe, but you have thrown away a good order over a ribbon.', score: 1, effects: { speed: -10 } },
            { label: 'Commit the order first, then add gift wrap in a separate untracked step', feedback: 'Now a crash could leave an order that is missing the gift wrap the customer paid for, with nothing to tie them together.', score: 0, effects: { integrity: -20 } }
          ] }
      ],
      outro: 'A good transaction is small and decisive: group what must stand or fall together, keep the slow things outside, and always finish with `COMMIT` or `ROLLBACK`.' },

    { type: 'explain', prompt: 'In your own words: what is a transaction, and why does a bank transfer need one?',
      model: 'A transaction is a bundle of database changes that either all happen or none of them happen. A transfer is two steps, a debit and a credit. Without a transaction, a crash between them leaves money taken but not delivered. With one, BEGIN starts the bundle, COMMIT makes it permanent, and ROLLBACK undoes it on error. It should stay short so it does not hold up other users.',
      keywords: ['all or nothing', 'BEGIN', 'COMMIT', 'ROLLBACK', 'crash', 'short'] }
  ],

  flashcards: [
    { q: 'What is a database transaction?', a: 'A bundle of changes treated as one unit: either every change is applied, or none of them is.' },
    { q: 'What do BEGIN, COMMIT and ROLLBACK do?', a: '`BEGIN` opens a transaction, `COMMIT` makes its changes permanent, and `ROLLBACK` throws them all away.' },
    { q: 'What is a savepoint for?', a: 'A named bookmark inside a transaction, so you can undo only the part after it without cancelling the whole thing.' },
    { q: 'Why should transactions be short?', a: 'Open transactions usually hold rows that other users need, so a long one makes everyone else wait.' },
    { q: 'What is autocommit?', a: 'The default mode where each lone statement is its own tiny transaction, committed immediately.' }
  ],

  glossary: [
    { term: 'Transaction', def: 'A group of database changes treated as a single unit of work: all of them take effect, or none of them do.', like: 'A shop basket that is paid for as a whole or put back as a whole.' },
    { term: 'Commit', def: 'The command that makes a transaction\'s changes permanent and visible to others.', like: 'Pressing "pay" at the till.', aka: ['COMMIT'] },
    { term: 'Rollback', def: 'The command that cancels a transaction and discards every change made since it began.', like: 'Putting the whole basket back on the shelf.', aka: ['ROLLBACK'] },
    { term: 'Savepoint', def: 'A named point inside a transaction that you can roll back to without abandoning the whole transaction.', like: 'A bookmark in a long document.' },
    { term: 'Autocommit', def: 'A mode in which every single statement is committed immediately as its own transaction.', like: 'A till that charges every item the moment it is scanned.' }
  ],

  takeaways: [
    'A transaction bundles statements so they happen **all or nothing**.',
    '`BEGIN` opens it, `COMMIT` makes it permanent, `ROLLBACK` throws it away.',
    'A savepoint lets you undo just part of a transaction.',
    'Keep transactions **short**: database work only, no emails or slow calls inside.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-acid', {
  eli5: 'ACID is a checklist of four promises (all-or-nothing, rules always hold, no trampling, and survives a crash) that make a database safe to trust with important data.',

  cards: [
    { kind: 'concept', title: 'What are you paying a database for?',
      body: `You could store a bank's accounts in a text file. It would even work, until two people used it at once, or the power failed mid-save.

        What a serious database sells you is a set of **promises** about what happens when things go wrong. Computer scientists bundled the four most important ones into a memorable word:

        - **A**tomicity
        - **C**onsistency
        - **I**solation
        - **D**urability

        **ACID**. A database that keeps all four for its transactions is called ACID-compliant. We will take them one at a time, using the bank transfer as our running example.` },

    { kind: 'compare', title: 'The four promises on one page',
      body: 'Keep this table in your head; the rest of the lesson fills it in.',
      cols: ['In plain English', 'It protects against'],
      rows: [
        ['Atomicity', 'All of the transaction happens, or none of it', 'Half-finished jobs'],
        ['Consistency', 'Your rules (constraints) hold before and after', 'Bad data getting in'],
        ['Isolation', 'Simultaneous transactions do not trample each other', 'Users colliding'],
        ['Durability', 'Once committed, it stays committed', 'Losing work in a crash']
      ] },

    { kind: 'concept', title: 'A is for all-or-nothing',
      body: `**Atomicity** is what you met in the last lesson. The word comes from "atom" in its old meaning: something that cannot be split.

        A transfer's debit and credit are welded together. If either fails, the database **rolls back** the other. You never observe the half-way state afterwards.

        How does it undo work? Roughly, the database keeps enough information to reverse a change until the transaction ends. If you \`ROLLBACK\`, or the server dies before \`COMMIT\`, that information is used to put things back.

        So: atomicity protects you from **failures in the middle** of a job.` },

    { kind: 'code', title: 'C is for consistency: your rules hold',
      body: `**Consistency** means the data always obeys the rules you declared. The database enforces them, and a transaction that would break one is refused.`,
      code: { lang: 'sql', src: `
        CREATE TABLE accounts (
          id      INTEGER PRIMARY KEY,
          owner   TEXT NOT NULL,
          balance NUMERIC(12,2) NOT NULL CHECK (balance >= 0)
        );

        BEGIN;
        UPDATE accounts SET balance = balance - 500 WHERE id = 1;
        -- account 1 only has 200: the CHECK fails, the update errors
        ROLLBACK;`,
        notes: {
          4: 'The rule: a balance can never go negative. The database checks it on **every** change.',
          8: 'This would leave –300. The `CHECK` rejects it and the transaction cannot commit.',
          10: 'After the error the transaction must be rolled back. Before and after, the rule held: that is consistency.'
        } },
      note: 'Consistency is a partnership. The database enforces the rules **you wrote down**. If you forgot to declare `CHECK (balance >= 0)`, it will happily allow an overdraft.' },

    { kind: 'metaphor', title: 'The kitchen order ticket',
      body: `A busy kitchen does not cook from memory. When an order comes in, a **ticket** is written first and clipped to the rail. Then the cooking starts.

        If the lights go out halfway through service, nobody panics. When the power returns, the chef reads the tickets and knows exactly what was ordered and what still needs making.

        That is how a database keeps its **durability** promise. The ticket rail is the **write-ahead log**: a file where every change is recorded *before* the main data is touched.

        The metaphor stops here: a kitchen ticket is just a note; the database's log is the real source of truth that it replays itself.` },

    { kind: 'sequence', title: 'D is for durable: the write-ahead log',
      body: 'What happens at the moment you `COMMIT`.',
      actors: ['App', 'Database', 'Log on disk'],
      steps: [
        { from: 0, to: 1, label: 'COMMIT', note: 'The app asks for the transfer to be made permanent.' },
        { from: 1, to: 2, label: 'append the changes to the log', note: 'The database writes a record of what changed, **in order**, at the end of the log.' },
        { from: 2, to: 1, label: 'flushed to disk', dashed: true, note: 'It waits until the operating system confirms the bytes are physically on disk, not just in memory.' },
        { from: 1, to: 0, label: 'COMMIT OK', dashed: true, note: 'Only now does the app hear "done". This is the promise: from here on, the change survives.' },
        { at: 1, label: 'update tables later', note: 'The real table files can be updated a moment later, in the background. That is cheaper because the log is written in one straight line.' },
        { note: 'If the power fails before the tables are updated, the database restarts, reads the log and **replays** the committed changes. Nothing acknowledged is lost.' }
      ] },

    { kind: 'concept', title: 'I is for isolation: pretend you are alone',
      body: `A busy bank has thousands of transactions in flight at once. **Isolation** promises that each one behaves *as if it were running alone*, so another transaction's half-finished work cannot confuse yours.

        Picture two people editing the same spreadsheet cell at the same moment, each reading the old number and writing a new one. One edit silently vanishes. Isolation exists to stop things like that.

        It is the trickiest of the four, because running one at a time is safe but slow, and real databases offer **dials** that trade safety for speed. The next lesson is entirely about those dials.

        In the lab that follows, you will interleave two transfers and watch one of them go wrong.` },

    { kind: 'pitfall', title: 'What ACID does not promise',
      body: `ACID is powerful, and people over-read it. It does **not** promise:

        - **Correct business logic.** If your code transfers £100 to the wrong account, that is a perfectly consistent, durable, wrong transfer.
        - **Backups.** Durable means "survives a crash", not "survives the disk dying or someone running \`DROP TABLE\`". You still need copies.
        - **Speed.** Every promise costs work.
        - **Full isolation by default.** Most engines choose a weaker setting out of the box, for speed.

        ACID protects the *mechanics* of your data. It cannot know what you meant.` },

    { kind: 'realworld', title: 'Who gives you ACID?',
      body: `The mainstream relational engines (**PostgreSQL**, **MySQL** with its InnoDB storage engine, **SQLite**, SQL Server, Oracle) all provide ACID transactions. That is a big part of why banks, shops and booking systems build on them.

        Some other kinds of database, which you will meet in the next module, deliberately relax one or more of the four to scale across many machines or go faster. That is a real engineering trade-off, not a flaw, but it means you must know which promises your database actually makes before trusting it with money.

        A handy memory trick: **A and D** are about *crashes*, **C** is about *your rules*, **I** is about *other users*.` }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each ACID letter to the promise it makes.',
      pairs: [['Atomicity', 'All of a transaction happens, or none of it'], ['Consistency', 'Declared rules (constraints) always hold'], ['Isolation', 'Concurrent transactions do not interfere'], ['Durability', 'A committed change survives a crash']] },

    { type: 'mcq', after: 3, q: 'A table has `CHECK (balance >= 0)`. A transfer would push a balance to –300. Which promise is at work when the database refuses it?',
      options: ['Consistency: the rule you declared must hold', 'Durability: committed data must survive', 'Atomicity: the statement is split into steps', 'Isolation: other users are shielded from the change'],
      answer: 0,
      why: [null, 'Durability is about surviving crashes after a commit, not refusing bad data.', 'Atomicity decides whether a bundle all happens or not; it does not decide what is valid.', 'Isolation is about concurrent users, and nobody else is involved here.'],
      explain: 'Consistency means the data moves from one valid state to another. The `CHECK` is the rule, and the database enforces it for you.' },

    { type: 'order', after: 5, prompt: 'Put the commit sequence in the order it happens.',
      items: ['The app sends COMMIT', 'The changes are appended to the write-ahead log', 'The log is flushed to disk', 'The app is told the commit succeeded', 'The table files are updated later'],
      explain: 'The log goes first, and is on disk, **before** the app is told "done". That ordering is what makes the promise safe. Updating the main tables can lag behind because the log can rebuild them.' },

    { type: 'tf', statement: 'If the server loses power one second after `COMMIT OK` was returned, the committed transfer may be lost.', answer: false,
      explain: 'Once a commit has been acknowledged, the change is in the write-ahead log on disk, and the database will replay it on restart. That is exactly what durability promises.' },

    { type: 'bucket', prompt: 'Something went wrong. Which ACID promise was broken?', buckets: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      items: [['Half a transfer was saved: debited but never credited', 0], ['A balance ended up negative despite a rule saying it must not', 1], ['Two simultaneous updates overwrote one another', 2], ['A committed order vanished after a power cut', 3], ['A crash left an order row with no items', 0], ['A reader saw another user\'s unfinished changes', 2]],
      explain: 'A and D concern crashes, C concerns rules, I concerns concurrency. A useful trick is to ask "what went wrong: a failure midway, a rule broken, a collision between users, or lost-after-commit?"' },

    { type: 'multi', q: 'Which of these does ACID **not** guarantee?',
      options: ['That your application\'s own logic is correct', 'That you have a backup if the disk is destroyed', 'That a query will be fast', 'That a committed change survives a restart', 'That a half-finished transaction leaves no trace'],
      answers: [0, 1, 2],
      explain: 'ACID protects the mechanics of your data: all-or-nothing, rules, no trampling, survives a crash. Correct logic, backups and speed remain your responsibility.' },

    { type: 'short', q: 'The file a database writes changes to before touching the tables is the write-ahead ___ (one word).', accept: ['log'], hint: 'The kitchen order tickets on the rail.',
      explain: 'The write-ahead log (WAL) records every change first, so the database can replay it after a crash.' },

    { type: 'scenario', title: 'The 3 a.m. power cut',
      intro: 'Your shop database loses power at the worst moment. You are checking what the ACID promises mean in practice.',
      meters: { trust: 70, data: 70 },
      steps: [
        { text: 'A customer was told "order confirmed" (the commit was acknowledged) one second before the power failed. After restart, what should you expect?',
          choices: [
            { label: 'The order is there: the database replays the log to restore it', feedback: 'Right. A commit that was acknowledged is durable.', score: 2, effects: { trust: 15 } },
            { label: 'The order might be missing, so email the customer to check', feedback: 'That would suggest durability does not work, which would make databases useless for orders.', score: 0, effects: { trust: -15 } },
            { label: 'The order is there, but only if the table files had been updated already', feedback: 'Close, but the log is exactly what covers the case where the tables were not updated yet.', score: 1 }
          ] },
        { text: 'Another transfer had run its debit but not yet reached `COMMIT` when the power failed. What state is it in after restart?',
          choices: [
            { label: 'Rolled back: it never committed, so none of it counts', feedback: 'Atomicity. Uncommitted work is discarded, so there is no half-transfer.', score: 2, effects: { data: 20 } },
            { label: 'Half done: the debit stays and the credit is missing', feedback: 'That is what atomicity prevents. Uncommitted changes do not survive.', score: 0, effects: { data: -30 } },
            { label: 'Completed automatically, because the database remembers the intent', feedback: 'It never reached `COMMIT`, so the database does not guess what you meant.', score: 0, effects: { data: -20 } }
          ] },
        { text: 'A week later the disk itself fails and is unreadable. Does durability save you?',
          choices: [
            { label: 'No. You need a separate backup; durability covers crashes, not dead disks', feedback: 'Exactly. This is the classic misreading of ACID.', score: 2, effects: { trust: 10 } },
            { label: 'Yes, committed data is durable forever', feedback: 'Durability survives a crash and restart, not the destruction of the storage. Copies are a separate job.', score: 0, effects: { data: -40 } },
            { label: 'Yes, as long as you restart the database first', feedback: 'Restarting replays the log from the disk, and the disk is gone.', score: 0, effects: { data: -25 } }
          ] }
      ],
      outro: 'ACID covers a crash and a restart. For anything bigger, such as hardware dying, you need backups, which a later lesson covers.' },

    { type: 'explain', prompt: 'Explain what the "D" in ACID promises and how the write-ahead log makes it possible. Include one thing it does not protect against.',
      model: 'Durability means that once the database says a transaction is committed, the change survives a crash or power cut. The database first appends the change to the write-ahead log and flushes it to disk, and only then tells the app the commit worked. On restart it replays the log, so committed changes are not lost even if the tables had not been updated yet. It does not protect against a disk being destroyed, so you still need backups.',
      keywords: ['committed', 'crash', 'write-ahead log', 'flushed', 'replay', 'backup'] }
  ],

  flashcards: [
    { q: 'What does ACID stand for?', a: 'Atomicity, Consistency, Isolation, Durability: four promises a database makes about transactions.' },
    { q: 'What does atomicity promise?', a: 'A transaction is all or nothing: either every change is applied or none is.' },
    { q: 'What does consistency mean in ACID?', a: 'The data always obeys the rules (constraints) you declared, before and after every transaction.' },
    { q: 'What does isolation promise?', a: 'Transactions running at the same time do not interfere with each other, as if each ran alone.' },
    { q: 'What is the write-ahead log for?', a: 'Every change is recorded in it, on disk, before the tables are touched, so committed work can be replayed after a crash.' },
    { q: 'Does ACID replace backups?', a: 'No. It covers crashes and restarts, not dead disks, deleted tables or bad application logic.' }
  ],

  glossary: [
    { term: 'ACID', def: 'Four promises about transactions: atomicity, consistency, isolation and durability.', like: 'The safety standards a serious database signs up to.' },
    { term: 'Atomicity', def: 'A transaction is all or nothing: if any part fails, every change is undone.', like: 'An atom, in the old sense: not splittable.' },
    { term: 'Consistency', def: 'Declared rules such as constraints always hold. A transaction that would break one is refused.', like: 'A bouncer who checks every guest against the guest list.' },
    { term: 'Isolation', def: 'Concurrent transactions behave as if they ran one at a time and do not see each other\'s unfinished work.', like: 'Each customer getting a private changing room.' },
    { term: 'Durability', def: 'Once a commit is acknowledged, the change survives a crash or power cut.', like: 'Writing the answer in ink, not pencil.' },
    { term: 'Write-ahead log', def: 'A file recording every change before the main data is updated, used to replay committed work after a crash.', like: 'The kitchen order tickets on the rail.', aka: ['WAL'] }
  ],

  takeaways: [
    '**ACID** = Atomicity, Consistency, Isolation, Durability.',
    'A and D guard against crashes; C enforces your rules; I stops users trampling each other.',
    'Durability comes from the **write-ahead log**, written to disk before the commit is acknowledged.',
    'ACID does not give you correct logic, speed or backups.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-isolation', {
  eli5: 'When two people change the same data at the same moment, isolation levels decide how much each of them is allowed to see of the other, and locking decides who waits.',

  cards: [
    { kind: 'concept', title: 'Two people, one balance',
      body: `Your account holds £100. At the very same moment, your salary arrives (+£50) and a standing order leaves (–£20). Two transactions, one row.

        If the database ran them strictly **one after the other**, there would be no problem: £100 + £50 – £20 = £130, every time.

        But running one at a time is slow, so databases run them **in parallel** and try to keep the result the same *as if* they had been one after the other. How hard they try is a dial, called the **isolation level**.

        Turned down, you get speed and a menagerie of strange bugs, called **anomalies**. Turned up, you get safety and more waiting.` },

    { kind: 'sequence', title: 'The lost update',
      body: 'The anomaly that bites real code the most. The balance starts at £100.',
      actors: ['Transaction A', 'Database', 'Transaction B'],
      steps: [
        { from: 0, to: 1, label: 'read balance', note: 'A (the salary) reads the balance into the app.' },
        { from: 1, to: 0, label: '100', dashed: true, note: 'It sees £100.' },
        { from: 2, to: 1, label: 'read balance', note: 'Before A has finished, B (the standing order) reads it too.' },
        { from: 1, to: 2, label: '100', dashed: true, note: 'B also sees £100. Both are working from the same old number.' },
        { from: 0, to: 1, label: 'write balance = 150', note: 'A adds £50 in the app and writes back 150.' },
        { from: 2, to: 1, label: 'write balance = 80', note: 'B subtracts £20 from *its* copy of 100 and writes back 80.' },
        { at: 1, label: 'final balance: £80', note: 'The correct answer was £130. A\'s £50 was silently overwritten. Nothing failed, nothing errored; money just vanished.' }
      ],
      note: 'The fix starts with writing the change in SQL, `SET balance = balance + 50`, so the database applies it to the **current** value rather than a stale copy from the app.' },

    { kind: 'compare', title: 'The four classic anomalies',
      body: 'Each one is a way parallel transactions can surprise you. Think of the shop schema.',
      cols: ['What goes wrong', 'Shop example'],
      rows: [
        ['Dirty read', 'You read another transaction\'s **uncommitted** change', 'A sets a price to £5, B reads £5, then A rolls back. B used a price that never existed.'],
        ['Non-repeatable read', 'Reading the **same row twice** in one transaction gives different answers', 'You read a stock count of 10, someone commits a sale, you read again and get 9.'],
        ['Phantom read', 'The **same query** returns different **rows** the second time', 'You count today\'s orders as 40, a new order commits, the same count now says 41.'],
        ['Lost update', 'Two read-then-write cycles overwrite each other', 'The salary and standing order from the sequence above.']
      ] },

    { kind: 'compare', title: 'The isolation levels, from loose to strict',
      body: 'The SQL standard defines four levels. Higher means fewer anomalies and more waiting.',
      cols: ['Anomalies it stops', 'Still possible (by the standard)'],
      rows: [
        ['Read uncommitted', 'Nothing', 'Dirty reads, non-repeatable reads, phantoms'],
        ['Read committed', 'Dirty reads', 'Non-repeatable reads, phantoms'],
        ['Repeatable read', 'Dirty and non-repeatable reads', 'Phantoms'],
        ['Serializable', 'All of them', 'None: it behaves as if transactions ran one at a time']
      ],
      note: 'Engines bend this table. PostgreSQL treats read uncommitted as read committed, and its repeatable read also blocks phantoms. Always check your engine\'s documentation. **Defaults differ:** PostgreSQL uses *read committed*; MySQL InnoDB uses *repeatable read*.' },

    { kind: 'metaphor', title: 'The photocopy, not the whiteboard',
      body: `Imagine the data is a **whiteboard** in a busy office. If everyone reads and writes the same board, they must take turns, or they will rub out each other's work.

        Most modern databases do something cleverer, called **MVCC** (multi-version concurrency control). When you start, you get a **photocopy** of the board as it was at that moment. Writers draw on the board; they leave your photocopy alone.

        The old and new versions of each row live side by side until nobody needs the old one.

        The headline benefit: **readers do not block writers, and writers do not block readers.** The metaphor stops at the cleaning: a background job later throws away copies no one needs.` },

    { kind: 'code', title: 'Pessimistic locking: lock first, then think',
      body: 'MVCC does not stop two writers colliding. One answer is to **lock the row** before reading it, assuming the worst.',
      code: { lang: 'sql', src: `
        BEGIN;
        SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
        -- the app checks that balance >= 100
        UPDATE accounts SET balance = balance - 100 WHERE id = 1;
        COMMIT;`,
        notes: {
          2: '`FOR UPDATE` locks the selected row. Any other transaction that wants to change it (or lock it) must **wait** until this one commits or rolls back.',
          3: 'Nobody can change the balance between our check and our update, so our check stays true.',
          5: 'Committing releases the lock, and the next transaction in the queue carries on.'
        } },
      note: 'The word "pessimistic" is the attitude: *someone will collide with me, so I will lock now.* Cheap when collisions are common; wasteful when they are rare.' },

    { kind: 'code', title: 'Optimistic locking: check before you save',
      body: 'The opposite attitude: assume nobody collides, but **detect** it if they do. Add a `version` column to the row and check it when saving.',
      code: { lang: 'sql', src: `
        -- we read: id = 5, balance = 100, version = 3
        UPDATE accounts
           SET balance = 150, version = version + 1
         WHERE id = 5 AND version = 3;
        -- 1 row changed: success.  0 rows: someone beat us, so retry`,
        notes: {
          1: 'No lock was taken when we read. We just remember the version number we saw.',
          4: 'The write only succeeds if the version is **still** 3. If anyone else saved in between, the version is now 4 and this matches nothing.',
          5: 'Check how many rows changed. Zero means a collision, so the app re-reads and tries again, or tells the user.'
        } },
      note: 'Optimistic locking shines in web apps, where a user might stare at an edit form for ten minutes. You cannot hold a database lock for that long.' },

    { kind: 'sequence', title: 'Deadlock: two people, two doors',
      body: 'Locks bring a new danger. Each transaction holds one row and wants the other.',
      actors: ['Transaction A', 'Database', 'Transaction B'],
      steps: [
        { from: 0, to: 1, label: 'UPDATE account 1', note: 'A locks account 1.' },
        { from: 2, to: 1, label: 'UPDATE account 2', note: 'B locks account 2.' },
        { from: 0, to: 1, label: 'UPDATE account 2', note: 'A needs account 2, which B holds. A waits.' },
        { from: 2, to: 1, label: 'UPDATE account 1', note: 'B needs account 1, which A holds. B waits. Each is waiting for the other, forever.' },
        { at: 1, label: 'cycle detected', note: 'The database notices the circle of waiting and picks a **victim**.' },
        { from: 1, to: 2, label: 'ERROR: deadlock detected', dashed: true, note: 'B is rolled back and its locks are released.' },
        { from: 1, to: 0, label: 'proceeds', dashed: true, note: 'A can now get account 2 and finish.' },
        { at: 2, label: 'retry the transaction', note: 'B is not broken, just unlucky. The **application** must catch the error and run the transaction again.' }
      ] },

    { kind: 'tip', title: 'Choosing, and living with it',
      body: `Some rules of thumb:

        - Start with your engine's **default** level. It is a considered compromise, and most apps never change it.
        - Go to **serializable** only for the few places where correctness is critical, and expect the database to occasionally abort a transaction you must retry.
        - To cut deadlocks, always lock rows in the **same order** (say, lowest account id first) and keep transactions short.
        - Always write **retry** logic for deadlock and serialization errors. They are normal events, not bugs.

        In the lab that follows, you will interleave two transfers, watch the lost update happen, and then switch on locks and isolation to stop it.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'In the lost-update sequence, both transactions read £100. A writes 150, then B writes 80. What is the final balance, and what should it have been?',
      options: ['£80, when it should have been £130', '£130, which is correct', '£150, when it should have been £130', '£100, because the database rejects both'],
      answer: 0,
      why: [null, 'That is what you would get if the transactions ran one after the other, but they did not.', '£150 would mean B\'s write was lost, but B wrote last so it wins.', 'No error is raised. The database cannot know the writes were based on stale reads.'],
      explain: 'The last write wins, and it was calculated from an old copy of the balance. A\'s £50 vanished without any error.' },

    { type: 'match', after: 2, prompt: 'Match each anomaly to what it looks like.',
      pairs: [['Dirty read', 'Seeing another transaction\'s uncommitted change'], ['Non-repeatable read', 'The same row, read twice, gives two answers'], ['Phantom read', 'The same query returns a different set of rows'], ['Lost update', 'One write silently overwrites another']] },

    { type: 'tf', after: 4, statement: 'With MVCC, a long-running report has to wait for every in-progress write to finish before it can read.', answer: false,
      explain: 'That is the whole point of MVCC. The report reads its own consistent snapshot of the old versions, so readers do not block writers and writers do not block readers.' },

    { type: 'multi', q: 'Which isolation levels stop **dirty reads**?',
      options: ['Read committed', 'Repeatable read', 'Serializable', 'Read uncommitted', 'None, dirty reads are only prevented by locks'],
      answers: [0, 1, 2],
      explain: 'Read committed is the first level that stops dirty reads, and the stricter levels include that protection. Read uncommitted is the only standard level that allows them.' },

    { type: 'bucket', prompt: 'Which anomaly is each story an example of?', buckets: ['Dirty read', 'Non-repeatable read', 'Phantom read', 'Lost update'],
      items: [['You read a price that was later rolled back', 0], ['Your report reads stock = 10, then stock = 9 a moment later, same row', 1], ['`COUNT(*)` of today\'s orders changes between two runs', 2], ['Two admins edit a product and one edit disappears', 3], ['A new row appears in the middle of your `WHERE` range', 2], ['An address you checked changed while you were still validating it', 1]],
      explain: 'Dirty means uncommitted data; non-repeatable means a **row** changed under you; phantom means the **set of rows** changed; lost update means two writes collided.' },

    { type: 'ab', q: 'Both versions subtract £100 from account 1. Which is safe when many transactions run at once?',
      a: { lang: 'js', label: 'Version 1', src: `
        const row = await db.query('SELECT balance FROM accounts WHERE id = 1');
        const newBalance = row.balance - 100;
        await db.query('UPDATE accounts SET balance = $1 WHERE id = 1', [newBalance]);` },
      b: { lang: 'js', label: 'Version 2', src: `
        await db.query(
          'UPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100'
        );` },
      answer: 'b',
      explain: 'The single statement is applied by the database to the current value, with the check built in. The other reads, calculates in the app and writes back an old value, which is the lost-update recipe.' },

    { type: 'cloze', text: 'With {{pessimistic}} locking you lock the row first using `SELECT … FOR UPDATE`. With {{optimistic}} locking you save a number in a {{version}} column and check it when writing.',
      distractors: ['serial', 'dirty', 'phantom'],
      explain: 'Pessimistic assumes a collision and prevents it with a lock. Optimistic assumes none and detects one when the version no longer matches.' },

    { type: 'scenario', title: 'The last seat',
      intro: 'You are building the booking page for a theatre. Seat 14C is the last one left, and two customers click "Book" at the same instant.',
      meters: { fairness: 60, speed: 70 },
      steps: [
        { text: 'The naive code does `SELECT` to see the seat is free, then `UPDATE` to book it. What can go wrong?',
          choices: [
            { label: 'Both see it free and both book it: the second overwrites the first', feedback: 'Exactly the lost-update pattern. Two happy customers, one seat, and a very awkward evening.', score: 2, effects: { fairness: 10 } },
            { label: 'The database stops the second customer automatically', feedback: 'Not at a loose isolation level. The database does not know the two statements are connected.', score: 0, effects: { fairness: -20 } },
            { label: 'Nothing, SQL is single-threaded', feedback: 'Databases serve many connections in parallel. That is exactly why isolation exists.', score: 0, effects: { fairness: -20 } }
          ] },
        { text: 'You want a robust fix. Which approach works?',
          choices: [
            { label: '`UPDATE seats SET taken = true WHERE id = 14 AND taken = false`, checking that one row changed', feedback: 'One atomic statement with the check inside it. The loser gets zero rows changed and can be told the seat has gone.', score: 2, effects: { fairness: 25 } },
            { label: 'Lock the whole seats table while booking', feedback: 'It is safe, but every other customer now queues behind each booking. Far too heavy.', score: 1, effects: { fairness: 15, speed: -30 } },
            { label: 'Add a short pause before booking so the clicks do not overlap', feedback: 'A delay shrinks the window but never closes it. This is hope, not a fix.', score: 0, effects: { fairness: -15 } }
          ] },
        { text: 'During a big sale, the database occasionally aborts a booking with "deadlock detected". What should the code do?',
          choices: [
            { label: 'Catch the error and retry the transaction a few times', feedback: 'Deadlocks are an expected cost of locking. The victim is rolled back cleanly, so retrying is safe.', score: 2, effects: { speed: 10 } },
            { label: 'Show the customer a generic error and give up', feedback: 'It works, but you throw away good bookings that a simple retry would have saved.', score: 1, effects: { fairness: -10 } },
            { label: 'Remove all locks so deadlocks cannot happen', feedback: 'You have swapped a clean, retryable error for silent double bookings.', score: 0, effects: { fairness: -30 } }
          ] }
      ],
      outro: 'Concurrency bugs rarely crash anything. They produce wrong answers quietly, so make the database do the check and retry on conflicts.' },

    { type: 'explain', prompt: 'Explain the difference between pessimistic and optimistic locking, and give one situation where you would choose each.',
      model: 'Pessimistic locking assumes collisions will happen, so it locks the row first (SELECT ... FOR UPDATE) and others wait. It suits short transactions on hot rows. Optimistic locking assumes collisions are rare: it keeps a version column and updates only if the version is unchanged, retrying if not. It suits long gaps between read and write, like a user editing a form for minutes, where holding a lock would be impractical.',
      keywords: ['lock', 'FOR UPDATE', 'version', 'retry', 'collision', 'wait'] }
  ],

  flashcards: [
    { q: 'What is a lost update?', a: 'Two transactions read the same value, each write back a result based on it, and the later write overwrites the earlier one.' },
    { q: 'Name the four SQL standard isolation levels, loosest first.', a: 'Read uncommitted, read committed, repeatable read, serializable.' },
    { q: 'What do PostgreSQL and MySQL InnoDB use by default?', a: 'PostgreSQL: read committed. MySQL InnoDB: repeatable read.' },
    { q: 'What is the advantage of MVCC?', a: 'Each transaction reads a consistent snapshot, so readers do not block writers and writers do not block readers.' },
    { q: 'Pessimistic vs optimistic locking?', a: 'Pessimistic locks the row first (`SELECT … FOR UPDATE`). Optimistic checks a version column when saving and retries on mismatch.' },
    { q: 'What must an application do after a deadlock error?', a: 'Retry the transaction. The database already rolled back the victim.' }
  ],

  glossary: [
    { term: 'Isolation level', def: 'A setting that decides how much one transaction can see of others running at the same time. Higher means safer and slower.', like: 'A dial from "open-plan office" to "private room".' },
    { term: 'Dirty read', def: 'Reading data that another transaction has changed but not yet committed, and which may be rolled back.', like: 'Reading a colleague\'s draft that they later delete.' },
    { term: 'Phantom read', def: 'Running the same query twice in a transaction and getting a different set of rows because another transaction added or removed some.', like: 'A guest who appears in the room after you counted everyone.' },
    { term: 'MVCC', def: 'Multi-version concurrency control: the database keeps several versions of a row so readers see a snapshot and do not block writers.', like: 'A photocopy of the whiteboard for each reader.' },
    { term: 'Deadlock', def: 'Two or more transactions each hold a lock the other needs, so none can proceed. The database aborts one of them.', like: 'Two cars nose to nose on a one-lane bridge.' },
    { term: 'Optimistic locking', def: 'Allowing parallel work and detecting conflicts at save time, usually with a version column.', like: 'Editing a shared document and being told "it changed since you opened it".' }
  ],

  takeaways: [
    'Parallel transactions cause **anomalies**: dirty reads, non-repeatable reads, phantoms and lost updates.',
    'Higher isolation levels prevent more anomalies but cost more waiting. Know your engine\'s default.',
    '**MVCC** gives readers a snapshot; **locks** make writers take turns.',
    'Pessimistic = `FOR UPDATE`. Optimistic = version column. Either way, **retry** on conflict or deadlock.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-indexes', {
  eli5: 'An index is a sorted shortcut the database keeps beside a table, like the index at the back of a book, so it can jump straight to the rows you want instead of reading everything.',

  cards: [
    { kind: 'concept', title: 'Finding Maria among ten million',
      body: `Your \`customers\` table has ten million rows and you run:

        \`SELECT * FROM customers WHERE email = 'maria@example.com';\`

        With nothing to help it, the database does the only thing it can: it opens the table and checks **every row, one by one**, until it has looked at all ten million. This is a **full table scan**.

        That is fine for a hundred rows. At ten million, a query that should feel instant takes seconds, and when a hundred users do it at once, the database falls over.

        The cure is the same one books use: an **index**.` },

    { kind: 'metaphor', title: 'The index at the back of the book',
      body: `Want every mention of "photosynthesis" in a thick biology textbook? You do not read the whole book. You flip to the **index**, find *photosynthesis* in alphabetical order, and read off the page numbers.

        A database index is the same: a separate, **sorted** list of values from one column, each pointing at where the full row lives.

        Because it is sorted, finding a value is quick. Searching a sorted list is like guessing a number from 1 to 1,000,000 by halving: about twenty guesses, not a million.

        Where the metaphor stops: a book's index never changes, but a database's index must be updated every time the table changes. Remember that for later.` },

    { kind: 'diagram', title: 'A B-tree lookup',
      body: 'Most indexes are **B-trees**: a shallow, sorted tree. Looking up `maria@…` takes one hop per level.',
      nodes: [
        { id: 'root', label: 'Root: A–M | N–Z', icon: '🌳', x: 1, y: 0, tone: 'accent' },
        { id: 'left', label: 'Branch: A–F | G–M', x: 0, y: 1 },
        { id: 'right', label: 'Branch: N–S | T–Z', x: 2, y: 1 },
        { id: 'leaf', label: 'Leaf: Maria → row 4,512', x: 0, y: 2, tone: 'good' },
        { id: 'row', label: 'Table row 4,512', icon: '🗄️', x: 0, y: 3, tone: 'info' }
      ],
      edges: [
        { from: 'root', to: 'left', label: 'M ≤ M, go left' },
        { from: 'root', to: 'right', dashed: true },
        { from: 'left', to: 'leaf', label: 'G–M' },
        { from: 'leaf', to: 'row', label: 'jump to the row' }
      ],
      caption: 'Each box is one page on disk. Even with millions of rows, a B-tree typically has only a handful of levels, so a lookup reads a handful of pages.' },

    { kind: 'code', title: 'Creating one',
      body: 'Indexes are created with one line, and the database keeps them current for you.',
      code: { lang: 'sql', src: `
        CREATE INDEX idx_customers_email
          ON customers (email);

        SELECT * FROM customers
         WHERE email = 'maria@example.com';`,
        notes: {
          1: 'A name for the index (convention: \`idx_table_column\`), then the table and column it sorts by.',
          2: 'Primary keys and \`UNIQUE\` columns get an index automatically in most engines, which is why lookups by id are already fast.',
          4: 'You do **not** change your queries. The database planner notices the index and chooses to use it.'
        } },
      note: 'B-trees are sorted, so they help `=`, ranges like `price BETWEEN 5 AND 10`, and `ORDER BY` on the indexed column.' },

    { kind: 'compare', title: 'Composite indexes: column order matters',
      body: 'An index can cover several columns, say `(city, name)`. It is sorted by city first, then by name within each city, like a phone book sorted by surname, then first name.',
      cols: ['Can use the index?', 'Why'],
      rows: [
        ['`WHERE city = \'York\'`', 'Yes', 'The leading column alone is enough.'],
        ['`WHERE city = \'York\' AND name = \'Ann\'`', 'Yes, best case', 'Both columns, in order.'],
        ['`WHERE name = \'Ann\'`', 'No (usually)', 'Names are scattered across every city, so there is no sorted run to follow.'],
        ['`WHERE name = \'Ann\' AND city = \'York\'`', 'Yes', 'The order you write it in does not matter, only the order of the index.']
      ],
      note: 'This is the **leftmost prefix** rule: an index helps queries that use its first column, then its first two, and so on.' },

    { kind: 'code', title: 'Covering indexes: never visit the table',
      body: 'If the index already contains every column the query needs, the database can answer from the index alone and skip the table. That is a **covering** index.',
      code: { lang: 'sql', src: `
        CREATE INDEX idx_orders_customer_status
          ON orders (customer_id, status);

        SELECT status FROM orders
         WHERE customer_id = 7;`,
        notes: {
          2: 'Two columns: the filter column first, then the one we want back.',
          4: 'The query only needs \`status\`, and \`customer_id\` to find it. Both live in the index, so the table is never opened. Plans call this an **index-only scan**.'
        } },
      note: 'A covering index is fast but fat. Add columns only for your hottest queries.' },

    { kind: 'pitfall', title: 'Every index has a price',
      body: `It is tempting to index everything. Do not. Each index is a **second copy** of some columns, kept sorted, and the database must update it on every change:

        | Operation | Cost with 5 indexes |
        |---|---|
        | \`INSERT\` | The row, plus 5 index entries |
        | \`UPDATE\` of an indexed column | The row, plus moving its entries |
        | \`DELETE\` | The row, plus 5 index removals |

        Indexes also take disk space and memory. So the trade is clear: **indexes speed up reads and slow down writes.** A table that is written constantly and read rarely wants very few of them.` },

    { kind: 'pitfall', title: 'When the database ignores your index',
      body: `You added the index and the query is still slow. Common reasons:

        | Query | Why the index is skipped |
        |---|---|
        | \`WHERE lower(email) = 'maria@…'\` | A function is applied to the column, so the sorted order no longer matches |
        | \`WHERE name LIKE '%son'\` | A leading wildcard cannot use sorted order: names ending in "son" are everywhere |
        | \`WHERE status = 'shipped'\` (90% of rows) | **Low selectivity**: reading most of the table anyway, a plain scan is cheaper |
        | A tiny table | A scan of a few pages beats an index lookup |

        Many engines let you index the expression itself, such as \`lower(email)\`, which fixes the first case.` },

    { kind: 'tip', title: 'What to index, and how to know',
      body: `A sensible starting list:

        - Columns you often filter on in \`WHERE\`.
        - **Foreign keys** used in joins, like \`orders.customer_id\`.
        - Columns you sort by on big result sets.

        Then **check**, rather than guess: ask the database how it plans to run the query. The next lesson shows you how with \`EXPLAIN\`.

        In the lab that follows, you will race a full table scan against an index lookup, then watch what the extra index does to writes.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'A table has ten million rows and no index on `email`. How does the database find one email?',
      options: ['It reads every row until it has checked them all (a full table scan)', 'It jumps straight to the row because emails are unique', 'It guesses a row and works outwards', 'It builds a temporary index first, then discards it'],
      answer: 0,
      why: [null, 'Uniqueness is only a rule. Without an index (and unique constraints normally create one) there is no jump.', 'Databases do not guess; without a sorted structure they must look.', 'Engines do not build an index just for one query.'],
      explain: 'With no index there is no order to exploit. The only choice is to check each row, which is a full table scan.' },

    { type: 'estimate', after: 2, q: 'Roughly how many pages does a B-tree lookup read to find one row among 10 million?', answer: 4, unit: 'page reads', min: 1, max: 100000, tolerance: 3,
      explain: 'B-trees are wide and shallow: each page fans out into hundreds of children, so ten million rows need only about three to four levels. A full scan of the same table would read many thousands of pages.' },

    { type: 'tf', after: 6, statement: 'Adding more indexes to a table never slows anything down, because indexes only help.', answer: false,
      explain: 'Every insert, update of an indexed column and delete must also maintain each index. Indexes speed up reads at the price of slower writes, extra disk and extra memory.' },

    { type: 'mcq', q: 'You have an index on `(city, name)`. Which query will it help **least**?',
      options: ['`WHERE name = \'Ann\'`', '`WHERE city = \'York\'`', '`WHERE city = \'York\' AND name = \'Ann\'`', '`WHERE city = \'York\' ORDER BY name`'],
      answer: 0,
      why: [null, 'The leading column is used, so this works.', 'Both columns are used in index order, the ideal case.', 'The index is already sorted by name inside each city, so it even saves the sort.'],
      explain: 'The leftmost prefix rule: without `city`, there is no sorted run of names to follow, because names are scattered across every city.' },

    { type: 'spot', prompt: 'There is a normal index on `customers(email)`. Tap the queries that **cannot** use it well. (Two lines.)',
      code: { lang: 'sql', src: `
        SELECT * FROM customers WHERE email = 'ann@example.com';
        SELECT * FROM customers WHERE email >= 'a' AND email < 'b';
        SELECT * FROM customers WHERE lower(email) = 'ann@example.com';
        SELECT * FROM customers WHERE email LIKE '%@gmail.com';` },
      lines: [3, 4],
      explain: 'Wrapping the column in a function (`lower(email)`) breaks the sorted order the index relies on, and a leading `%` means any value could match. The first two are an exact match and a range, which B-trees handle well.' },

    { type: 'multi', q: 'Which of these are likely reasons the planner ignores an index?',
      options: ['A function is applied to the indexed column', 'The query matches most of the table (low selectivity)', 'The `LIKE` pattern starts with a wildcard', 'The table has a primary key', 'The query uses `ORDER BY`'],
      answers: [0, 1, 2],
      explain: 'Functions, low selectivity and leading wildcards all stop an index from narrowing the search. A primary key and `ORDER BY` do not prevent index use; sorting can actually benefit from an index.' },

    { type: 'bucket', prompt: 'Is each column worth indexing for the shop?', buckets: ['Worth indexing', 'Probably not'],
      items: [['`orders.customer_id`, used in joins on millions of rows', 0], ['`customers.email`, used for every login lookup', 0], ['`orders.created_at`, used to fetch the latest orders', 0], ['`orders.status` where 95% of rows are \'shipped\'', 1], ['A 12-row lookup table of countries', 1], ['A log column written constantly and never searched', 1]],
      explain: 'Index the columns that narrow big tables for hot queries. Skip low-selectivity columns, tiny tables and write-heavy columns that no query reads.' },

    { type: 'cloze', text: 'A B-tree keeps values {{sorted}}, so lookups are quick. The trade-off is that an index speeds up {{reads}} but slows down {{writes}}.',
      distractors: ['deleted', 'copied', 'hashed'],
      explain: 'Sorted order is what makes searching fast, and keeping that order up to date is what makes every write more expensive.' },

    { type: 'scenario', title: 'The slow customer page',
      intro: 'The "My orders" page takes four seconds. It runs `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC` on a table of twenty million rows.',
      meters: { speed: 20, writes: 80 },
      steps: [
        { text: 'There is no index on `customer_id`. What is the best first move?',
          choices: [
            { label: 'Create an index on `orders (customer_id, created_at)`', feedback: 'It narrows by customer, and rows come out already sorted by date. Excellent fit.', score: 2, effects: { speed: 60, writes: -10 } },
            { label: 'Index every column of `orders` to be safe', feedback: 'Reads improve, but each insert now updates a dozen indexes, and most will never be used.', score: 0, effects: { speed: 40, writes: -45 } },
            { label: 'Buy a bigger server', feedback: 'It may help a little, but you are still scanning twenty million rows to find a few.', score: 0, effects: { speed: 10 } }
          ] },
        { text: 'The page is fast now. Next week the data team asks you to index six more columns "just in case". What do you say?',
          choices: [
            { label: 'Only if a real query needs each one, and I will measure the write cost', feedback: 'Sensible. Every index must pay for itself in faster reads.', score: 2, effects: { writes: 10 } },
            { label: 'Yes, indexes are free', feedback: 'They are not: each costs write time, memory and disk.', score: 0, effects: { writes: -30 } },
            { label: 'No indexes ever again', feedback: 'Too far the other way. The first index clearly earned its place.', score: 1 }
          ] },
        { text: 'A new search uses `WHERE lower(email) = ?` and is slow despite an index on `email`. What now?',
          choices: [
            { label: 'Index the expression `lower(email)`, or store emails lower-cased', feedback: 'The index must match what the query actually computes.', score: 2, effects: { speed: 20 } },
            { label: 'Drop the old index and re-create it with the same definition', feedback: 'The same index will be skipped for the same reason.', score: 0 },
            { label: 'Add a second index on the same column', feedback: 'Another plain copy still cannot answer a query that wraps the column in a function.', score: 0, effects: { writes: -15 } }
          ] }
      ],
      outro: 'Good indexing is targeted: the right few indexes, shaped like your real queries, checked rather than assumed.' },

    { type: 'explain', prompt: 'Explain how a B-tree index speeds up a lookup, and the downside of adding many of them.',
      model: 'An index keeps a column\'s values in sorted order in a shallow tree, each leaf pointing at its table row. The database walks down a handful of levels instead of scanning every row, like using the index of a book. The downside is that every insert, update and delete must also update every index, so too many indexes slow writes and use extra disk and memory.',
      keywords: ['sorted', 'tree', 'full table scan', 'writes', 'slower', 'pointer'] }
  ],

  flashcards: [
    { q: 'What is a full table scan?', a: 'The database reads every row of a table to find matches, because it has no faster way.' },
    { q: 'What is the default index type, and what does it give you?', a: 'A B-tree: a sorted, shallow tree that makes equality, range and sorted lookups fast.' },
    { q: 'What is the leftmost prefix rule?', a: 'A composite index `(a, b)` helps queries that filter on `a`, or on `a` and `b`, but not on `b` alone.' },
    { q: 'What is a covering index?', a: 'An index that holds every column a query needs, so the database never has to read the table.' },
    { q: 'What do indexes cost?', a: 'Slower inserts, updates and deletes, plus extra disk and memory.' },
    { q: 'Name three reasons the planner skips an index.', a: 'A function on the column, a leading wildcard in `LIKE`, or low selectivity (the query matches most rows).' }
  ],

  glossary: [
    { term: 'Index', def: 'A separate sorted structure kept beside a table that lets the database find rows without scanning everything.', like: 'The index at the back of a book.' },
    { term: 'Full table scan', def: 'Reading every row of a table to answer a query.', like: 'Reading the whole book to find one word.', aka: ['sequential scan'] },
    { term: 'B-tree', def: 'A balanced, sorted tree structure, the default index type in most relational databases.', like: 'A filing cabinet with labelled drawers, folders and dividers.' },
    { term: 'Composite index', def: 'An index on more than one column, sorted by the first, then the second, and so on.', like: 'A phone book sorted by surname, then first name.' },
    { term: 'Covering index', def: 'An index that contains all the columns a query needs, so the table itself is never touched.', like: 'A menu that lists the prices, so you never ask the waiter.' },
    { term: 'Selectivity', def: 'How much a condition narrows down the rows. A highly selective filter matches very few rows.', like: 'Asking for one named person versus "everyone aged over ten".' }
  ],

  takeaways: [
    'Without an index, a query is a **full table scan**: every row, every time.',
    'A **B-tree** keeps values sorted, so lookups take a handful of steps.',
    'Composite index order matters: **leftmost prefix** first. A **covering** index skips the table.',
    'Indexes speed reads and **slow writes**; the planner ignores them for functions, leading wildcards and low selectivity.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-profiling', {
  eli5: 'Profiling means measuring which queries are slow and asking the database how it runs them, so you fix the real problem and can prove the fix worked.',

  cards: [
    { kind: 'concept', title: 'The page is slow. Now what?',
      body: `Customers say the shop "feels sluggish". You have a hundred queries in the code. Which one is guilty?

        The tempting move is to **guess**: add an index here, rewrite a query there. Sometimes you get lucky. More often you spend a week speeding up something that took two milliseconds, while the real culprit carries on.

        Performance work has one golden rule: **measure first**. Find the query that is actually slow, ask the database *how* it is running it, change one thing, and measure again.

        That discipline is called **profiling**, and it turns performance from folklore into detective work.` },

    { kind: 'metaphor', title: 'The mechanic with a diagnostic plug',
      body: `A good mechanic does not replace the tyres because the car "feels odd". They plug in a diagnostic reader, look at the numbers, find the faulty part, fix **that**, and run the test again to see the fault gone.

        A bad mechanic changes five parts at once. The car now works, and nobody knows which part mattered, or whether the other four were a waste of money.

        Your database has its own diagnostic plug. It will tell you what it did, how much work it expected, and, if you ask nicely, how long each step really took.

        The metaphor stops at one point: unlike a car, a database's behaviour can change as its data grows, so check again from time to time.` },

    { kind: 'steps', title: 'The profiling loop',
      body: 'The same four moves, every time.',
      steps: [
        { title: 'Find the slow query', body: 'Do not guess. Most databases can **log queries slower than a threshold** (a slow query log), and tools such as PostgreSQL\'s `pg_stat_statements` rank queries by total time. Application monitoring helps too.' },
        { title: 'Ask for the plan', body: 'Put `EXPLAIN` in front of the query. The database describes how it intends to run it, without running it.' },
        { title: 'Change one thing', body: 'Add an index, rewrite the query, trim the columns. **One** change, so you know what worked.' },
        { title: 'Measure again', body: 'Compare the plan and the timings **before and after**. If the number did not improve, the change did not help. Revert it.' }
      ] },

    { kind: 'code', title: 'Reading a query plan',
      body: 'Here is a plan for a slow query. The numbers are made up for illustration, and your engine\'s layout will differ in detail, but the shape is real.',
      code: { lang: 'text', src: `
        EXPLAIN SELECT * FROM orders WHERE customer_id = 7;

        Seq Scan on orders  (cost=0.00..18334.00 rows=52 width=40)
          Filter: (customer_id = 7)`,
        notes: {
          3: '**Seq Scan** (sequential scan) means "reading the whole table". For twenty million rows, that is the red flag.',
          4: 'The `Filter` is applied to each row **after** reading it. Rows are thrown away one by one.',
          2: 'To get a plan, put `EXPLAIN` before the query. Nothing is changed, and no results are returned.'
        } },
      note: '`cost` is the planner\'s own estimate in made-up units: only compare costs of plans for the **same** query. `rows` is how many rows it expects to match.' },

    { kind: 'code', title: 'After adding an index',
      body: 'We create an index on `customer_id` and ask again.',
      code: { lang: 'text', src: `
        CREATE INDEX idx_orders_customer ON orders (customer_id);

        EXPLAIN SELECT * FROM orders WHERE customer_id = 7;

        Index Scan using idx_orders_customer on orders
                                    (cost=0.43..8.45 rows=52 width=40)
          Index Cond: (customer_id = 7)`,
        notes: {
          5: '**Index Scan** means it walked the B-tree to the matching rows instead of reading everything.',
          7: '`Index Cond` is applied **during** the lookup, so only the right rows are fetched. Compare the cost: from thousands down to single digits.'
        } } },

    { kind: 'compare', title: 'Sequential scan vs index scan',
      body: 'Neither is "good" or "bad". Each is right in the right place.',
      cols: ['Sequential scan', 'Index scan'],
      rows: [
        ['How it works', 'Reads the table from start to finish', 'Walks the index, then fetches matching rows'],
        ['Best when', 'The query needs a big share of the table, or the table is small', 'The query needs a small share of a big table'],
        ['Cost grows with', 'The size of the table', 'Roughly the number of matching rows'],
        ['Warning sign', 'On a huge table, for a query that returns a handful of rows', 'On a query that returns most of the table']
      ] },

    { kind: 'concept', title: 'EXPLAIN versus EXPLAIN ANALYZE',
      body: `Plain \`EXPLAIN\` shows the plan and **estimates**. Adding **\`ANALYZE\`** (in PostgreSQL, and similar options elsewhere) actually **runs** the query and reports what really happened: real time per step and the real row counts next to the estimates.

        Two things to remember:

        - **Big gap between estimated and actual rows?** The planner's statistics are probably stale. Refreshing them (PostgreSQL: the \`ANALYZE\` command) often fixes odd plans.
        - **\`EXPLAIN ANALYZE\` really executes** the statement. On an \`UPDATE\` or \`DELETE\` it will change your data. Wrap it in a transaction and \`ROLLBACK\` afterwards, or test on a copy.` },

    { kind: 'tip', title: 'The common fixes',
      body: `Once the plan shows you the culprit, the cure is usually one of these:

        - **Add or reshape an index** to match the \`WHERE\`, join or \`ORDER BY\`.
        - **Stop wrapping columns in functions** in the filter, so indexes can be used.
        - **Select only the columns you need** instead of \`SELECT *\`, which can even allow a covering index.
        - **Add a \`LIMIT\`** if you only show ten rows.
        - **Refresh the planner's statistics** if its estimates are far off.
        - **Cut the number of queries.** Sometimes the slow thing is a hundred fast queries, which the lesson on N+1 will show.` },

    { kind: 'pitfall', title: 'Measuring badly is worse than not measuring',
      body: `A few traps that produce convincing, wrong answers:

        - **Tiny test data.** On fifty rows, a scan beats an index and everything is fast. Test on realistic volumes.
        - **One run only.** The first run may be slow because nothing is in memory yet (a "cold cache"). Run it several times and look at the pattern.
        - **Changing several things at once.** You will never know which one helped.
        - **Not saving the "before".** Record the plan and the timing first. Without a baseline, "it feels faster" is a feeling, not a result.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'The shop feels slow and you have a hundred queries. What is the right first step?',
      options: ['Find which queries are actually slow, using logs or monitoring', 'Add an index to every foreign key straight away', 'Rewrite the biggest query in the codebase', 'Upgrade the database server'],
      answer: 0,
      why: [null, 'Indexes cost write speed, and without evidence you may index the wrong things.', 'Size is not the same as slowness. You may rewrite something that was already fast.', 'You may pay for hardware and still be scanning millions of rows needlessly.'],
      explain: 'Measure first. The slow query is often not where you expect, and fixing the wrong one wastes effort and can make other things worse.' },

    { type: 'order', after: 2, prompt: 'Put the profiling loop in order.',
      items: ['Find the slow query', 'Run EXPLAIN to see its plan', 'Change one thing', 'Measure again and compare with before'],
      explain: 'You cannot read a plan until you know which query to read, you must read it before changing anything, and you must re-measure afterwards to prove the change helped.' },

    { type: 'spot', prompt: 'Tap the line that tells you this query is reading the whole table.',
      code: { lang: 'text', src: `
        EXPLAIN SELECT * FROM orders WHERE status = 'new';

        Seq Scan on orders  (cost=0.00..18334.00 rows=52 width=40)
          Filter: (status = 'new')` },
      lines: [3],
      explain: '`Seq Scan` is the sequential scan: it reads every row of the table and filters afterwards. With an index in use, you would see an index scan instead.' },

    { type: 'tf', after: 6, statement: '`EXPLAIN ANALYZE` on a `DELETE` statement is harmless because it only describes the plan.', answer: false,
      explain: '`EXPLAIN ANALYZE` actually executes the statement to get real timings, so a `DELETE` really deletes. Use plain `EXPLAIN`, or wrap the experiment in a transaction and roll it back.' },

    { type: 'ab', q: 'Both queries find a customer by email, and there is an index on `email`. Which one will the planner be able to use the index for?',
      a: { lang: 'sql', label: 'Version 1', src: `
        SELECT id, name FROM customers
        WHERE lower(email) = 'maria@example.com';` },
      b: { lang: 'sql', label: 'Version 2', src: `
        SELECT id, name FROM customers
        WHERE email = 'maria@example.com';` },
      answer: 'b',
      explain: 'The bare column matches the sorted order of the index. Applying a function to the column hides that order, so the plan falls back to scanning.' },

    { type: 'short', q: 'Which keyword do you put in front of a query to see its plan? (one word)', accept: ['EXPLAIN'], hint: 'It "explains" what the database will do.',
      explain: '`EXPLAIN` asks the database to describe its plan for the query, without returning the rows.' },

    { type: 'multi', q: 'Which of these are common fixes once a plan shows a slow sequential scan?',
      options: ['Add an index that matches the filter', 'Stop applying a function to the filtered column', 'Select only the columns you need', 'Add `SELECT *` so the planner has more to work with', 'Run the query more times to warm it up'],
      answers: [0, 1, 2],
      explain: 'Matching indexes, plain column filters and narrower selects all reduce work. `SELECT *` does the opposite, and re-running only warms a cache without changing the plan.' },

    { type: 'scenario', title: 'The Monday morning crawl',
      intro: 'The dashboard timed out three times this morning. You have been asked to fix it, and you want to prove the fix worked.',
      meters: { confidence: 40, time: 80 },
      steps: [
        { text: 'You have a suspect query. What do you do before touching anything?',
          choices: [
            { label: 'Run `EXPLAIN` and save the plan and timing as a baseline', feedback: 'Now you can show, with numbers, whether the change helped.', score: 2, effects: { confidence: 25 } },
            { label: 'Add an index straight away and see if it feels faster', feedback: 'It might work, but you cannot prove it, and you do not know why.', score: 0, effects: { confidence: -10 } },
            { label: 'Ask the team which table is biggest and index that one', feedback: 'Table size is a hint, not evidence that this table is the problem.', score: 0, effects: { time: -15 } }
          ] },
        { text: 'The plan shows a sequential scan on a 20-million-row table, returning 40 rows. What is your fix?',
          choices: [
            { label: 'Create an index on the filtered column, nothing else', feedback: 'One targeted change that directly addresses what the plan shows.', score: 2, effects: { confidence: 25 } },
            { label: 'Create the index, rewrite three other queries and change the server settings', feedback: 'It may work, but with four changes you will never know which one mattered.', score: 1, effects: { confidence: -5, time: -20 } },
            { label: 'Do nothing, since sequential scans are normal', feedback: 'They are normal for small tables or big result sets. Not for 40 rows out of 20 million.', score: 0, effects: { confidence: -20 } }
          ] },
        { text: 'After the change, the plan shows an index scan and the query is far quicker. What is your last step?',
          choices: [
            { label: 'Compare against the baseline on realistic data, and note the result', feedback: 'Measuring again closes the loop and gives you something concrete to share.', score: 2, effects: { confidence: 30 } },
            { label: 'Announce it is fixed because it feels faster', feedback: 'Feelings are not data. A baseline comparison takes a minute.', score: 0, effects: { confidence: -10 } },
            { label: 'Test only on your tiny development database', feedback: 'On a few rows, everything is fast, so it proves nothing about production.', score: 0, effects: { confidence: -15 } }
          ] }
      ],
      outro: 'Baseline, one change, re-measure. That small routine is what separates profiling from guessing.' },

    { type: 'explain', prompt: 'Describe how you would find and fix a slow query, and how you would prove the fix worked.',
      model: 'First find the slow query with the slow query log or monitoring rather than guessing. Run EXPLAIN to read its plan and spot something like a sequential scan on a big table. Change one thing, such as adding an index, then measure again on realistic data and compare against the saved before numbers. If it did not improve, revert it.',
      keywords: ['slow query', 'EXPLAIN', 'plan', 'one change', 'measure', 'before and after'] }
  ],

  flashcards: [
    { q: 'What is the golden rule of performance work?', a: 'Measure first: find the actually slow query, change one thing, and measure again.' },
    { q: 'How do you find slow queries?', a: 'A slow query log, a tool that ranks queries by time (like `pg_stat_statements`), or application monitoring.' },
    { q: 'What does EXPLAIN do?', a: 'It shows the plan the database intends to use for a query, without returning the rows.' },
    { q: 'Sequential scan vs index scan?', a: 'A sequential scan reads the whole table; an index scan uses an index to jump to the matching rows.' },
    { q: 'Why be careful with EXPLAIN ANALYZE?', a: 'It actually runs the statement, so an `UPDATE` or `DELETE` will really change data.' }
  ],

  glossary: [
    { term: 'Profiling', def: 'Measuring where time is really spent, so that you fix the actual bottleneck rather than guess.', like: 'A mechanic\'s diagnostic reader.' },
    { term: 'Query plan', def: 'The database\'s chosen step-by-step strategy for running a query, shown by `EXPLAIN`.', like: 'A satnav route before you set off.', aka: ['execution plan'] },
    { term: 'EXPLAIN', def: 'A command that prints the query plan. With the `ANALYZE` option (PostgreSQL) it also runs the query and reports real timings.', like: 'Asking the satnav for the route (and, with ANALYZE, driving it).' },
    { term: 'Slow query log', def: 'A log where the database records every query that took longer than a chosen threshold.', like: 'A visitors\' book for the slowest customers.' },
    { term: 'Baseline', def: 'The recorded "before" measurement that later results are compared against.', like: 'Weighing yourself before starting the diet.' }
  ],

  takeaways: [
    '**Measure first**: find the slow query, don\'t guess.',
    '`EXPLAIN` shows the plan: look for sequential scans on big tables for small results.',
    'Change **one thing**, then compare before and after on realistic data.',
    '`EXPLAIN ANALYZE` really runs the statement.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-orms', {
  eli5: 'An ORM is a translator that lets your code work with ordinary objects, like a Customer, while it quietly writes the SQL and talks to the database tables for you.',

  cards: [
    { kind: 'concept', title: 'Objects in code, rows in tables',
      body: `In your code, a customer is an **object**: \`customer.name\`, \`customer.city\`, maybe a list of their orders. In the database, a customer is a **row** in a table, and their orders are rows in another table.

        Without help, every save and load means writing SQL by hand, copying columns into object fields, and back again. Hundreds of times. It is dull, and every copy is a place for a typo.

        An **ORM** (object–relational mapper) does the copying for you. You work with objects; it translates to SQL and tables.

        Well-known examples: **Hibernate** (Java), **Entity Framework** (.NET), the **Django ORM** and **SQLAlchemy** (Python), **Active Record** (Ruby on Rails) and **Prisma** (JavaScript/TypeScript).` },

    { kind: 'metaphor', title: 'The interpreter at the meeting',
      body: `Picture a meeting between a French-speaking supplier and an English-speaking buyer. An interpreter sits between them. Each side speaks their own language and the interpreter handles the rest.

        Your code speaks **objects**. The database speaks **tables and SQL**. The ORM is the interpreter.

        Interpreters are brilliant, until a joke or an idiom does not translate cleanly. Then you need to know both languages well enough to see what went wrong.

        Hold on to that: an ORM does not let you skip learning SQL. It lets you skip *typing* the boring parts.` },

    { kind: 'diagram', title: 'Where the ORM sits',
      body: 'Your code never talks to the tables directly. The ORM is in the middle.',
      nodes: [
        { id: 'code', label: 'Your code: Customer', icon: '👩‍💻', x: 1, y: 0 },
        { id: 'orm', label: 'ORM (the translator)', icon: '🔄', x: 1, y: 1, tone: 'accent' },
        { id: 'sql', label: 'SQL statements', x: 1, y: 2, tone: 'info' },
        { id: 'db', label: 'Tables: customers', icon: '🗄️', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'code', to: 'orm', label: 'objects', both: true },
        { from: 'orm', to: 'sql', label: 'generates' },
        { from: 'sql', to: 'db', label: 'runs against' }
      ],
      caption: 'Rows come back up the same path and are turned into objects again.' },

    { kind: 'code', title: 'What using an ORM feels like',
      body: 'Pseudo-code in the style most ORMs share. Tap a line to see the SQL it becomes.',
      code: { lang: 'js', src: `
        const ann = await Customer.find(5);
        ann.city = 'York';
        await ann.save();

        const leeds = await Customer.where({ city: 'Leeds' });`,
        notes: {
          1: 'Becomes roughly `SELECT * FROM customers WHERE id = 5`. A row is turned into a \`Customer\` object.',
          2: 'Just a normal field change. The ORM notices the object is now "dirty".',
          3: 'Becomes roughly `UPDATE customers SET city = \'York\' WHERE id = 5`.',
          5: 'Becomes roughly `SELECT * FROM customers WHERE city = \'Leeds\'`. Values are passed as parameters, which protects against SQL injection.'
        } } },

    { kind: 'concept', title: 'What an ORM gives you',
      body: `Beyond the typing you save, a good ORM usually provides:

        - **Mapping**: classes to tables, fields to columns.
        - **Safe queries**: values are sent as parameters, not glued into strings.
        - **Relationships**: \`order.items\` or \`customer.orders\` without writing the join by hand.
        - **Migrations**: many ORMs generate and track schema changes.
        - **Portability**: the same code can often run on different database engines.

        It is a lot of value for everyday create, read, update and delete work, which is most of what most applications do.` },

    { kind: 'compare', title: 'The impedance mismatch',
      body: 'Objects and tables are built on different ideas. The awkward gap between them has a fancy name: the **object–relational impedance mismatch**.',
      cols: ['In your code (objects)', 'In the database (tables)'],
      rows: [
        ['Nesting', 'An `Order` holds a list of `Item` objects', 'Items are separate rows pointing back by a foreign key'],
        ['Links', 'Direct references: `item.product`', 'Ids to be looked up with a join'],
        ['Inheritance', '`Admin` extends `User`', 'No such thing; needs a table design to imitate it'],
        ['Identity', 'Two objects are the same if they are the same object', 'Two rows are the same if they share a primary key']
      ],
      note: 'No ORM removes the mismatch. Each one picks a way to hide it, and sometimes the seams show.' },

    { kind: 'compare', title: 'Active record vs data mapper',
      body: 'Two classic designs for **who knows how to save an object**.',
      cols: ['Active record', 'Data mapper'],
      rows: [
        ['The idea', 'The object saves itself: `customer.save()`', 'A separate mapper or repository saves it: `repo.save(customer)`'],
        ['Your classes', 'Carry database knowledge as well as business rules', 'Plain objects that know nothing about the database'],
        ['Feels like', 'Simple and quick; great for CRUD apps', 'More set-up; keeps business logic cleaner and easier to test'],
        ['Leans this way', 'Active Record (Rails), Django ORM', 'Hibernate, Entity Framework, SQLAlchemy']
      ],
      note: 'These are tendencies, not strict camps, and many ORMs blend them. Developers disagree about which is better; a small app rarely suffers from either.' },

    { kind: 'pitfall', title: 'The hidden cost of "free" queries',
      body: `Because the ORM hides the SQL, it is easy to forget it exists. \`customer.orders\` looks like reading a field. It may be a **database query**. Put it in a loop and you may be running hundreds without noticing. The next lesson is entirely about that trap.

        Other classic surprises:

        - A "simple" call that generates a big, slow join.
        - Loading whole objects when you only needed one column.
        - Writing code that works fine on test data and crawls in production.

        The cure is not to avoid ORMs. It is to **look at the SQL they generate**, using the techniques from the profiling lesson.` },

    { kind: 'tip', title: 'When to drop down to raw SQL',
      body: `Almost every ORM lets you write SQL by hand when the abstraction gets in the way. Good moments to do it:

        - **Reports and analytics** with grouping, window functions or several joins.
        - **Bulk operations**, such as updating a million rows in one statement.
        - A **hot path** where you have measured and the generated SQL is the bottleneck.
        - Using an engine feature the ORM does not know about.

        Even then, pass values as **parameters**, never by joining strings. The sensible default is: ORM for everyday work, raw SQL for the awkward 10%.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the main job of an ORM?',
      options: ['To translate between objects in your code and rows in database tables', 'To make the database faster by caching everything', 'To replace the need to understand SQL entirely', 'To store objects in a format that is not a table'],
      answer: 0,
      why: [null, 'An ORM may add a little caching, but speed is not its purpose and it can make some things slower.', 'It writes the SQL for you, but you still need to understand it when things go wrong.', 'ORMs sit on top of relational databases and still use tables.'],
      explain: 'ORM stands for object–relational mapper. It maps classes to tables and fields to columns, and generates the SQL in between.' },

    { type: 'tf', after: 4, statement: 'Using an ORM means you never have to think about SQL.', answer: false,
      explain: 'The ORM writes the SQL, but you are still responsible for its performance and correctness. You need to read the generated queries when something is slow or odd.' },

    { type: 'match', after: 6, prompt: 'Match each ORM idea to its description.',
      pairs: [['Active record', 'The object knows how to save itself'], ['Data mapper', 'A separate mapper moves plain objects in and out of tables'], ['Impedance mismatch', 'Objects and tables model data in different ways'], ['Raw SQL', 'Hand-written SQL for jobs the ORM handles badly']] },

    { type: 'ab', q: 'Which version keeps the `Customer` class free of any database knowledge (the data mapper style)?',
      a: { lang: 'js', label: 'Version 1', src: `
        class Customer extends Model {
          save() { /* writes this row */ }
        }
        customer.save();` },
      b: { lang: 'js', label: 'Version 2', src: `
        class Customer { constructor(name, city) { /* data only */ } }
        const repo = new CustomerRepository(db);
        repo.save(customer);` },
      answer: 'b',
      explain: 'The customer is a plain object here, and a separate repository does the saving. In the other version the class inherits database behaviour and saves itself, which is the active record style.' },

    { type: 'spot', prompt: 'This code drops down to raw SQL for a search. Tap the dangerous line.',
      code: { lang: 'js', src: `
        async function findCustomers(city) {
          const sql = "SELECT * FROM customers WHERE city = '" + city + "'";
          return db.raw(sql);
        }
        // safer: db.raw('... WHERE city = ?', [city])` },
      lines: [2],
      explain: 'Gluing user input into the SQL string invites SQL injection. A parameter placeholder keeps the value separate from the command, even when you write raw SQL.' },

    { type: 'bucket', prompt: 'Does each job suit the ORM, or raw SQL?', buckets: ['ORM is a good fit', 'Raw SQL is a good fit'],
      items: [['Create a new customer and save it', 0], ['Load an order with its items to show on a page', 0], ['Update one product\'s price', 0], ['A monthly sales report with grouping and window functions', 1], ['Increase every price by 5% across a million rows at once', 1], ['A hand-tuned query that profiling showed is the bottleneck', 1]],
      explain: 'Everyday create, read, update and delete work is what ORMs are for. Reports, bulk operations and measured hot spots are where hand-written SQL earns its keep.' },

    { type: 'cloze', text: 'The awkward gap between objects and tables is called the object–relational {{impedance}} mismatch. In the {{active record}} pattern an object saves itself, while a {{data mapper}} keeps objects free of database code.',
      distractors: ['decorator', 'singleton', 'migration'],
      explain: 'These are the standard names. Impedance mismatch is the gap; active record and data mapper are the two classic ways of bridging it.' },

    { type: 'scenario', title: 'Choosing your tools',
      intro: 'You are the new lead on a small shop app. The team is split on whether to use an ORM.',
      meters: { velocity: 50, control: 50 },
      steps: [
        { text: 'Most of the app is forms: create, edit, list, delete. How do you approach the database layer?',
          choices: [
            { label: 'Use the ORM for the everyday work', feedback: 'It will save a lot of repetitive code and prevents injection mistakes.', score: 2, effects: { velocity: 25 } },
            { label: 'Hand-write every query to keep full control', feedback: 'Total control, but a lot of repetitive, error-prone code for simple tasks.', score: 1, effects: { velocity: -20, control: 20 } },
            { label: 'Use the ORM and never look at the SQL it produces', feedback: 'You will meet slow queries in production and have nothing to debug with.', score: 0, effects: { control: -25 } }
          ] },
        { text: 'The finance team wants a monthly report with multiple joins and grouping. The ORM version is a tangle. What do you do?',
          choices: [
            { label: 'Write that one report in raw, parameterised SQL', feedback: 'The right escape hatch for a complex, read-only report.', score: 2, effects: { control: 20 } },
            { label: 'Force it through the ORM however ugly it gets', feedback: 'You may end up with code nobody understands and a poor query.', score: 0, effects: { velocity: -15 } },
            { label: 'Stop using the ORM across the whole app', feedback: 'One awkward report is not a reason to give up the benefits everywhere.', score: 0, effects: { velocity: -25 } }
          ] },
        { text: 'A product page is slow in production but fast on your laptop. What now?',
          choices: [
            { label: 'Log the SQL the ORM generates and read the plans', feedback: 'That is the profiling loop applied to ORM code.', score: 2, effects: { control: 25 } },
            { label: 'Blame the ORM and rewrite the app', feedback: 'The ORM is rarely the whole story. Without evidence a rewrite repeats the problem.', score: 0, effects: { velocity: -30 } },
            { label: 'Hope that production will warm up', feedback: 'Slowness that appears with real data rarely goes away by itself.', score: 0 }
          ] }
      ],
      outro: 'ORM for the everyday, raw SQL for the awkward, and always keep an eye on the SQL being generated.' },

    { type: 'explain', prompt: 'What is the object–relational impedance mismatch, and how should you use an ORM sensibly in light of it?',
      model: 'Objects and relational tables model data differently: objects nest and reference each other and can inherit, while tables are flat rows linked by foreign keys. The ORM hides this gap by mapping classes to tables, but the seams show in surprising queries. So use the ORM for everyday CRUD, look at the SQL it generates, and drop down to parameterised raw SQL for complex reports, bulk jobs and measured hot spots.',
      keywords: ['objects', 'tables', 'mapping', 'generated SQL', 'raw SQL', 'parameters'] }
  ],

  flashcards: [
    { q: 'What does ORM stand for?', a: 'Object–relational mapper: a library that translates between objects in code and rows in tables.' },
    { q: 'What is the object–relational impedance mismatch?', a: 'The friction between the object model (nesting, references, inheritance) and the relational model (flat tables joined by keys).' },
    { q: 'Active record vs data mapper?', a: 'Active record: the object saves itself. Data mapper: a separate mapper or repository saves plain objects.' },
    { q: 'Name three things an ORM gives you.', a: 'Class-to-table mapping, parameterised (injection-safe) queries and relationships without hand-written joins. Often migrations too.' },
    { q: 'When should you drop down to raw SQL?', a: 'For complex reports, bulk operations, measured hot spots or engine-specific features, always with parameters.' }
  ],

  glossary: [
    { term: 'ORM', def: 'Object–relational mapper: a library that maps classes to tables and generates SQL, so code works with objects.', like: 'An interpreter between two languages.', aka: ['object-relational mapper'] },
    { term: 'Impedance mismatch', def: 'The awkward difference between how objects model data (nested, linked, inherited) and how relational tables do (flat rows joined by keys).', like: 'Trying to plug a three-pin plug into a two-pin socket.' },
    { term: 'Active record', def: 'A pattern where each object knows how to load and save itself, so database code lives in the same class as the data.', like: 'A worker who also does their own payroll.' },
    { term: 'Data mapper', def: 'A pattern where a separate mapper or repository moves plain objects to and from the database, which they know nothing about.', like: 'A dedicated postal clerk who handles the parcels.' },
    { term: 'Raw SQL', def: 'SQL written by hand instead of generated by an ORM, used for jobs the ORM handles badly.', like: 'Taking the manual controls from autopilot.' }
  ],

  takeaways: [
    'An **ORM** maps classes to tables and generates SQL, saving boilerplate and giving safe, parameterised queries.',
    'The **impedance mismatch** between objects and tables never fully goes away.',
    '**Active record**: objects save themselves. **Data mapper**: a separate mapper does it.',
    'Use the ORM for everyday work, read the SQL it makes, and drop to raw (parameterised) SQL when needed.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-nplus1', {
  eli5: 'The N+1 problem is when code asks the database for a list, then asks again separately for every item in it, so a list of 100 things costs 101 trips instead of 1 or 2.',

  cards: [
    { kind: 'concept', title: 'The innocent loop',
      body: `You are building the "Recent orders" page for the shop's admin. Show the last 100 orders, each with the **customer's name**. The code looks perfectly reasonable: fetch the orders, then for each one, show its customer.

        On your laptop with five orders, the page loads instantly. In production with 100 orders, it takes a second and a half. With a thousand, the database team is calling you.

        Nothing is broken. The code is just quietly making **101 database queries** where one would do. That trap is so common it has a name: the **N+1 problem**.` },

    { kind: 'code', title: 'Spot the hidden queries',
      body: 'Pseudo-code in the style of most ORMs. It reads like plain objects. Tap the lines to see what the database really does.',
      code: { lang: 'js', src: `
        const orders = await Order.latest(100);

        for (const order of orders) {
          console.log(order.id, order.customer.name);
        }`,
        notes: {
          1: 'This is the **"1"**: one query for the list, roughly `SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`.',
          3: 'The loop runs once per order. That is the **N**: 100 times.',
          4: '`order.customer` *looks* like reading a field. With lazy loading it is really `SELECT * FROM customers WHERE id = ?`, fired **every time round the loop**.'
        } } },

    { kind: 'sequence', title: 'What the database sees',
      body: 'A list of 100 orders. Watch the conversation.',
      actors: ['App', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'SELECT … FROM orders LIMIT 100', note: 'Query number 1: the list.' },
        { from: 1, to: 0, label: '100 orders', dashed: true, note: 'Each order carries only a `customer_id`, not the name.' },
        { from: 0, to: 1, label: 'SELECT … FROM customers WHERE id = 12', note: 'Order 1 needs its customer. Query number 2.' },
        { from: 0, to: 1, label: 'SELECT … FROM customers WHERE id = 7', note: 'Order 2. Query number 3.' },
        { from: 0, to: 1, label: 'SELECT … FROM customers WHERE id = 12', note: 'Order 3 has the same customer as order 1, so we ask for the same row again.' },
        { note: '…and so on for all 100 orders: **1 + 100 = 101 queries.** Each one is fast, but each is a separate round trip over the network, with its own overhead.' }
      ] },

    { kind: 'metaphor', title: 'A hundred trips to the shop',
      body: `Imagine you need a hundred items from the supermarket. One way: write a list and make **one trip**. The other way: walk to the shop, buy one item, walk home, realise you need another, walk back… a hundred times.

        Each individual trip is quick. The total is ridiculous, because most of the time is spent **walking**, not shopping.

        Queries are the same. Fetching a row is fast; the round trip to the database is the expensive part. The N+1 problem is a hundred and one trips when one or two would have done.

        The metaphor stops at one point: the shop does not get slower because you are making so many trips. A busy database does.` },

    { kind: 'concept', title: 'Lazy loading versus eager loading',
      body: `Why does the ORM do this? Because it is trying to be helpful. **Lazy loading** means related data is fetched **only when you touch it**. If you never read \`order.customer\`, the ORM never wastes a query on it.

        That is a good default for a single order. It is a disaster inside a loop.

        **Eager loading** is the opposite: you tell the ORM up front, "I will need the customers too", and it fetches them **in advance, together with the list**.

        Neither is "right". Lazy suits "maybe I will need it". Eager suits "I know I will need it for every row".` },

    { kind: 'code', title: 'Fix 1: join in one query',
      body: 'Ask for the orders and their customers together, so each row arrives with everything the page needs.',
      code: { lang: 'sql', src: `
        SELECT o.id, o.created_at, c.name
          FROM orders o
          JOIN customers c ON c.id = o.customer_id
         ORDER BY o.created_at DESC
         LIMIT 100;`,
        notes: {
          3: 'The `JOIN` glues each order to its customer inside the database, which is built for exactly this.',
          5: 'Now the whole page costs **one** query, whatever the number of orders.'
        } },
      note: 'In ORMs this is eager loading with a join: Django\'s `select_related`, Hibernate\'s `join fetch`, and Entity Framework\'s `Include`, for example.' },

    { kind: 'code', title: 'Fix 2: batch with IN',
      body: 'Or fetch the list first, collect the ids, and ask for **all the customers at once**. Two queries in total, however long the list.',
      code: { lang: 'sql', src: `
        SELECT * FROM orders
         ORDER BY created_at DESC LIMIT 100;

        SELECT * FROM customers
         WHERE id IN (12, 7, 31, 4, 19);`,
        notes: {
          1: 'Query 1: the list of orders.',
          4: 'Query 2: one lookup for every distinct customer id seen in the list. Repeats (like customer 12) are fetched once.'
        } },
      note: 'ORMs offer this too, often under names like `prefetch_related` (Django) or `includes` (Active Record). Batching beats a join when the related data would be duplicated across many rows.' },

    { kind: 'pitfall', title: 'Do not just eager-load everything',
      body: `Once bitten, it is tempting to switch on eager loading globally. Do not.

        - Joining several related tables can produce **huge result sets** with the same data repeated on every row.
        - You may load whole objects (with big text fields) when the page needs one column.
        - If a page never uses the related data, you have paid for it for nothing.

        The aim is not "as few queries as possible". It is **the right queries for this page**. Load what each screen needs, and no more.` },

    { kind: 'tip', title: 'Spotting N+1 in your logs',
      body: `The giveaway is a **repeating pattern**: the same statement, again and again, differing only in an id.

        \`\`\`text
        SELECT * FROM orders ORDER BY created_at DESC LIMIT 100
        SELECT * FROM customers WHERE id = 12
        SELECT * FROM customers WHERE id = 7
        SELECT * FROM customers WHERE id = 12
        … (97 more)
        \`\`\`

        To catch it: turn on **query logging** in development, **count queries per request**, and treat a count that grows with the size of the list as a smell. Many frameworks have tools or plug-ins that warn you automatically.

        In the lab that follows, you will load a list of posts lazily and eagerly, and count the queries each way.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A page lists 100 orders and shows each customer\'s name using lazy loading in a loop. How many queries run?',
      options: ['101: one for the list, then one per order', '2: one for orders and one for customers', '1: the ORM joins automatically', '100: one per order, and the list is free'],
      answer: 0,
      why: [null, 'That is what eager loading with batching would do, not lazy loading.', 'Lazy loading never joins ahead of time; it waits until each customer is touched.', 'The list itself needs a query too.'],
      explain: 'One query fetches the list (the 1), and each loop iteration triggers another lookup (the N). With N = 100, that is 101.' },

    { type: 'estimate', q: 'A page lists 50 orders with an N+1 problem. Each query takes about 2 ms including the network round trip. About how long do the queries take in total?', answer: 100, unit: 'ms', min: 1, max: 100000, tolerance: 2,
      explain: '1 + 50 = 51 queries at around 2 ms each is roughly 100 ms. Double the list and the time doubles, which is the telltale sign: it grows with the length of the list.' },

    { type: 'tf', after: 4, statement: 'Lazy loading is always a mistake and should be switched off.', answer: false,
      explain: 'Lazy loading is a sensible default: you pay only for what you touch. It becomes a problem when you touch related data inside a loop. In that case, load it eagerly.' },

    { type: 'spot', prompt: 'This code is slow with long lists. Tap the line hiding the repeated query.',
      code: { lang: 'js', src: `
        const posts = await Post.recent(50);
        const rows = [];
        for (const post of posts) {
          rows.push({ title: post.title, author: post.author.name });
        }` },
      lines: [4],
      explain: '`post.author` is a lazily loaded relation, so every pass of the loop fires another `SELECT … FROM authors WHERE id = ?`. Load the authors eagerly with the posts.' },

    { type: 'ab', q: 'Which version avoids the N+1 problem?',
      a: { lang: 'js', label: 'Version 1', src: `
        const ids = orders.map(o => o.customerId);
        const customers = await db.query(
          'SELECT * FROM customers WHERE id IN (...)', [ids]);` },
      b: { lang: 'js', label: 'Version 2', src: `
        for (const o of orders) {
          o.customer = await db.query(
            'SELECT * FROM customers WHERE id = $1', [o.customerId]);
        }` },
      answer: 'a',
      explain: 'Collecting the ids and asking once with `IN` costs a single extra query however long the list is. The loop version pays one round trip per order.' },

    { type: 'multi', q: 'Which of these are real ways to fix an N+1 problem?',
      options: ['Fetch the related rows in the same query with a JOIN', 'Collect the ids and fetch related rows in one batch with `IN (…)`', 'Tell the ORM to eager-load the relation', 'Add an index on every column', 'Run the loop on a faster server'],
      answers: [0, 1, 2],
      explain: 'All three cut the number of round trips. Indexes make each query faster but there are still 101 of them, and a faster server just gets you to the same wasteful pattern sooner.' },

    { type: 'cloze', text: 'The N+1 problem is one query for the {{list}} plus {{N}} more for the details. Fetching related data only when it is touched is called {{lazy}} loading; fetching it up front is {{eager}} loading.',
      distractors: ['binary', 'cached'],
      explain: 'Lazy loading defers the query until the data is touched, which is exactly what multiplies queries inside a loop. Eager loading fetches it with the list.' },

    { type: 'scenario', title: 'The slow admin page',
      intro: 'The admin "Recent orders" page got slower week by week as the shop grew. Your manager wants it fixed today.',
      meters: { speed: 25, risk: 20 },
      steps: [
        { text: 'You open the query log for one page load. You see hundreds of nearly identical `SELECT … FROM customers WHERE id = ?` lines. What is your diagnosis?',
          choices: [
            { label: 'N+1: a lazy relation is being loaded inside a loop', feedback: 'Spot on. The repeating statement differing only by id is the classic signature.', score: 2, effects: { speed: 5 } },
            { label: 'The `customers` table needs a bigger server', feedback: 'Each of those queries is already fast. The volume of them is the problem.', score: 0, effects: { risk: 15 } },
            { label: 'The database is corrupted', feedback: 'Nothing here suggests corruption. It is a code pattern, not a fault.', score: 0, effects: { risk: 15 } }
          ] },
        { text: 'How do you fix it?',
          choices: [
            { label: 'Eager-load customers with the orders (a join, or one batched `IN` query)', feedback: 'The page drops from 101 queries to one or two.', score: 2, effects: { speed: 60 } },
            { label: 'Turn on eager loading of every relation everywhere', feedback: 'It may fix this page, but it will bloat others that never need those relations.', score: 1, effects: { speed: 30, risk: 25 } },
            { label: 'Cache the page for an hour and leave the loop as it is', feedback: 'It hides the symptom, and the first visitor each hour still waits. The cause remains.', score: 0, effects: { speed: 15, risk: 15 } }
          ] },
        { text: 'How do you stop it coming back?',
          choices: [
            { label: 'Log queries in development and add a test asserting a maximum query count for the page', feedback: 'A guard that fails loudly when a loop sneaks back in.', score: 2, effects: { risk: -20 } },
            { label: 'Tell the team to be careful', feedback: 'Good intentions do not scale. An automated check does.', score: 0, effects: { risk: 10 } },
            { label: 'Nothing; it is fixed now', feedback: 'The same mistake is easy to reintroduce on the next page.', score: 0, effects: { risk: 20 } }
          ] }
      ],
      outro: 'Diagnose from the log pattern, fix with the right amount of eager loading, and add a query-count check so it stays fixed.' },

    { type: 'explain', prompt: 'Explain the N+1 problem to a colleague: what causes it, how to recognise it and two ways to fix it.',
      model: 'N+1 happens when code runs one query to fetch a list, then another query for each item in the list to fetch related data, usually because of lazy loading inside a loop. For 100 items that is 101 queries. You can spot it in the logs as the same statement repeated with different ids. Fix it by eager loading with a JOIN or by batching the related lookups into one query with IN.',
      keywords: ['one query', 'lazy loading', 'loop', 'log', 'JOIN', 'IN', 'eager'] }
  ],

  flashcards: [
    { q: 'What is the N+1 problem?', a: 'One query for a list plus one extra query for each of its N items, often caused by lazy loading inside a loop.' },
    { q: 'Lazy vs eager loading?', a: 'Lazy fetches related data only when touched. Eager fetches it in advance, together with the main query.' },
    { q: 'Two ways to fix N+1?', a: 'Join the related table in one query, or batch the related lookups into one `IN (…)` query.' },
    { q: 'How do you recognise N+1 in a log?', a: 'The same statement repeated many times, differing only in an id, with a count that grows with the list size.' },
    { q: 'Why not eager-load everything?', a: 'It can fetch huge or unused data and bloat result sets. Load what each page actually needs.' }
  ],

  glossary: [
    { term: 'N+1 problem', def: 'Running one query for a list and then N more, one per item, to fetch related data.', like: 'A hundred separate trips to the shop instead of one with a list.', aka: ['N+1 queries'] },
    { term: 'Lazy loading', def: 'Fetching related data only at the moment your code touches it.', like: 'Looking things up only when someone asks.' },
    { term: 'Eager loading', def: 'Fetching related data up front, together with the main query, because you know you will need it.', like: 'Packing everything for the trip before leaving.' },
    { term: 'Round trip', def: 'One request to the database and its reply. Each carries a fixed cost, however small the query.', like: 'One walk to the shop and back.' }
  ],

  takeaways: [
    '**N+1** = one query for the list, then one per item: 100 items, 101 queries.',
    'It usually comes from **lazy loading** inside a loop; each query is fast, the round trips add up.',
    'Fix with a **JOIN**, an `IN (…)` batch, or the ORM\'s **eager loading**.',
    'Spot it in logs: the same statement repeating with different ids.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-failure-modes', {
  eli5: 'Databases rarely die in dramatic ways. They run out of disk, run out of connections, get blocked by one slow transaction, or lose data nobody ever practised restoring, so you plan for each.',

  cards: [
    { kind: 'concept', title: 'Boring ways to die',
      body: `When people imagine a database failing, they picture an explosion. Real failures are far more mundane, and nearly all are **predictable**:

        - the server **crashes** or loses power
        - the disk **fills up**
        - the app opens **too many connections**
        - one slow **transaction** blocks everyone
        - someone needs a **backup**, and it does not work

        The good news is that each has a known defence. Good engineers do not hope these never happen. They ask, for each one, "what will we see, and what is our plan?"` },

    { kind: 'compare', title: 'Five failures at a glance',
      body: 'What you see, and the usual defence.',
      cols: ['What you see', 'The usual defence'],
      rows: [
        ['Crash', 'Restart; briefly unavailable', 'Write-ahead log replays committed work'],
        ['Disk full', 'Writes start failing, database may stop', 'Monitoring and alerts; log and data retention'],
        ['Too many connections', '"Sorry, too many clients" errors', 'A connection pool'],
        ['Long transaction', 'Queries pile up behind a lock', 'Short transactions; timeouts'],
        ['Lost or corrupt data', 'Wrong or missing rows', 'Tested backups']
      ] },

    { kind: 'concept', title: 'Crashes and corruption',
      body: `You met this in the lesson on ACID. After a **crash or power cut**, the database restarts and **replays its write-ahead log**: committed work is reapplied, unfinished work is discarded. Usually this takes seconds to minutes, and nobody loses anything.

        **Corruption** is nastier. It means the stored data itself is wrong: a failing disk, faulty memory, a bug, or someone deleting files they should not. The log cannot fix that.

        Some engines add **checksums** that detect damaged pages, so you find out early. But detection is not a cure. For genuine corruption or a destroyed disk, the answer is a **restore from backup**.` },

    { kind: 'pitfall', title: 'The disk that quietly fills',
      body: `A very common outage: the disk reaches 100%. The database needs room to write its log and its data, so **writes fail**, and some engines stop entirely. The cruel part is how ordinary the causes are: logs nobody rotated, a table that grew faster than planned, a forgotten backup file stored on the same disk.

        Defences are dull, which is why they work:

        - **Alert early** (say at 70–80% used), not at 100%.
        - Keep an eye on the growth *trend*, not just today's figure.
        - Set **retention** for logs and old data.
        - Never keep your only backup on the same disk as the database.` },

    { kind: 'metaphor', title: 'The restaurant with twelve tables',
      body: `A restaurant has twelve tables. Each customer who sits down occupies one, **even while they read the menu and do nothing**. If five hundred people turn up, they do not all get a table. The rest are turned away, or queue.

        A database is the same. Each **connection** uses memory and a slot, and the server allows only a limited number at once. If every request from your app opens a fresh connection, a busy moment can exhaust them all, and new users see "too many connections" errors, even though the database itself is barely working.

        The fix is not more tables. It is **sharing the tables**: seating people only when they are actually eating.` },

    { kind: 'diagram', title: 'A connection pool in the middle',
      body: 'Thousands of requests share a small, steady set of real database connections.',
      nodes: [
        { id: 'a1', label: 'App server 1', icon: '🖥️', x: 0, y: 0 },
        { id: 'a2', label: 'App server 2', icon: '🖥️', x: 1, y: 0 },
        { id: 'a3', label: 'App server 3', icon: '🖥️', x: 2, y: 0 },
        { id: 'pool', label: 'Pooler, e.g. PgBouncer', icon: '🔀', x: 1, y: 1, tone: 'accent' },
        { id: 'db', label: 'Database (limited slots)', icon: '🗄️', x: 1, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'a1', to: 'pool', label: 'many requests' },
        { from: 'a2', to: 'pool' },
        { from: 'a3', to: 'pool' },
        { from: 'pool', to: 'db', label: 'few connections' }
      ],
      caption: 'Connections are opened once and lent out, instead of opened and thrown away per request. Application frameworks have built-in pools; PgBouncer is a separate pooler for PostgreSQL.' },

    { kind: 'steps', title: 'How one slow transaction stops the site',
      body: 'Lock contention is a chain reaction. Here is how it unfolds.',
      steps: [
        { title: 'A transaction opens and stalls', body: 'It updates a popular row, say a product, then waits on a slow outside call or an idle user. Its lock on that row stays held.' },
        { title: 'Others queue behind it', body: 'Every other transaction that wants the same row must **wait**. Waiting requests pile up.' },
        { title: 'Connections run out', body: 'Each waiting request still holds a connection. Soon the pool or the server is full.' },
        { title: 'The whole app freezes', body: 'Even requests for unrelated pages cannot get a connection. A small problem has become an outage.' },
        { title: 'Defence', body: 'Keep transactions short, set **timeouts** so nothing waits forever, and find long-running transactions in the database\'s monitoring views.' }
      ] },

    { kind: 'concept', title: 'A backup you never restored is a hope',
      body: `Everyone has backups. Fewer people have **restores**. The classic horror story: disaster strikes, the team reaches for the backup, and discovers it is empty, corrupted, incomplete, encrypted with a lost key, or takes three days to load.

        A backup only proves itself when you **restore from it**. So test it:

        1. Restore the latest backup onto a scratch server.
        2. Check the data looks right.
        3. **Time it.**
        4. Do it regularly, not once.

        Also keep copies **somewhere else**, not on the same machine or in the same building as the database, so one fire or one mistaken command cannot take both.` },

    { kind: 'compare', title: 'RPO and RTO: two questions to answer in advance',
      body: 'Two numbers every business must choose before disaster, not during it.',
      cols: ['RPO', 'RTO'],
      rows: [
        ['Stands for', 'Recovery Point Objective', 'Recovery Time Objective'],
        ['Asks', 'How much **data** can we afford to lose?', 'How long can we afford to be **down**?'],
        ['Measured as', 'Time between the last safe copy and the failure', 'Time from failure to working again'],
        ['Example', 'Nightly backups mean up to ~24 hours of data at risk', 'A restore that takes 6 hours means 6 hours offline'],
        ['Lower costs', 'More frequent backups or a live copy', 'Rehearsed restores or a standby ready to take over']
      ],
      note: 'Keeping a live copy on another server (replication) shrinks both numbers, but copies can lag behind the original. The "Scaling Data" module covers that.' },

    { kind: 'tip', title: 'A small resilience checklist',
      body: `A solid minimum for any database that matters:

        - **Monitor** disk space, connections and long-running transactions, and alert before they hit the limit.
        - Use a **connection pool**, and size it deliberately.
        - Set **timeouts** on statements and lock waits.
        - Take **automatic backups**, store them elsewhere, and **test-restore** them on a schedule.
        - Write down your **RPO and RTO**, and check that your backup plan can actually meet them.

        Boring, yes. But a team with this list rarely has dramatic outages.` }
  ],

  activities: [
    { type: 'match', prompt: 'Match each failure term to what it means.',
      pairs: [['Connection exhaustion', 'All the database\'s connection slots are in use'], ['Lock contention', 'Transactions wait for rows held by another'], ['RPO', 'How much data you can afford to lose'], ['RTO', 'How long you can afford to be down'], ['Connection pool', 'A shared set of connections lent out to requests']] },

    { type: 'mcq', after: 2, q: 'The power fails mid-write. On restart, how does a database like PostgreSQL protect committed work?',
      options: ['It replays the write-ahead log, reapplying committed changes', 'It restores the most recent backup automatically', 'It asks the application to resend recent requests', 'It discards everything since midnight'],
      answer: 0,
      why: [null, 'Backups are for disasters like a lost disk, not for ordinary crashes.', 'The database is responsible for its own committed data.', 'It does not throw away committed work; that would break durability.'],
      explain: 'The write-ahead log is written to disk before commits are acknowledged, so crash recovery can replay it. Backups are the answer to different failures, like corruption or a destroyed disk.' },

    { type: 'tf', after: 7, statement: 'If your backups run every night without errors, you know you can restore from them.', answer: false,
      explain: 'A backup job succeeding only proves a file was written. Only a test restore proves the data is complete, usable and fast enough to restore within your RTO.' },

    { type: 'estimate', after: 8, q: 'Backups run once a night. In the worst case, roughly how many hours of data could you lose (your RPO)?', answer: 24, unit: 'hours', min: 1, max: 1000, tolerance: 1.5,
      explain: 'If the failure strikes just before the next backup, everything since the last one is gone: close to a full day. A lower RPO needs more frequent backups or a continuously updated copy.' },

    { type: 'spot', prompt: 'This web handler works in testing but fails under load with "too many connections". Tap the line responsible.',
      code: { lang: 'js', src: `
        app.get('/products', async (req, res) => {
          const db = await connectToDatabase();
          const rows = await db.query('SELECT * FROM products');
          res.json(rows);
        });` },
      lines: [2],
      explain: 'Opening a new database connection on every request means a traffic spike opens hundreds at once and exhausts the slots. Borrow connections from a shared pool instead, and return them when finished.' },

    { type: 'bucket', prompt: 'Which problem does each defence mainly address?', buckets: ['Disk full', 'Connection exhaustion', 'Long transactions', 'Lost data'],
      items: [['Alert when disk usage passes 80%', 0], ['Put a pooler such as PgBouncer in front', 1], ['Set statement and lock-wait timeouts', 2], ['Test-restore backups on a schedule', 3], ['Set log retention so old logs are removed', 0], ['Keep transactions short, with no slow calls inside', 2]],
      explain: 'Each failure has its own defence. Capacity needs monitoring and retention; connections need pooling; blocking needs short transactions and timeouts; lost data needs tested backups.' },

    { type: 'order', prompt: 'Put a sensible backup-test drill in order.',
      items: ['Take the latest backup from the offsite copy', 'Restore it onto a scratch server', 'Check that the data is complete and sensible', 'Record how long the restore took', 'Fix the plan if it missed the RTO'],
      explain: 'You restore from the real offsite copy to prove it works, check the result, and time it, because the time is what you compare with your RTO. Then you fix any gaps.' },

    { type: 'scenario', title: 'Friday, 4.55 p.m.',
      intro: 'You are on call for the shop. Things start going wrong one after another, and you have to choose well.',
      meters: { uptime: 80, data: 90 },
      steps: [
        { text: 'Customers see "too many connections" errors. The database server itself is nearly idle. What is most likely wrong?',
          choices: [
            { label: 'The app opens connections without pooling and has used every slot', feedback: 'An idle server with no free connections is the classic signature. Add a pool.', score: 2, effects: { uptime: 5 } },
            { label: 'The database has run out of CPU', feedback: 'An almost idle server is not short of CPU. The slots are the bottleneck.', score: 0, effects: { uptime: -15 } },
            { label: 'The disk is corrupted', feedback: 'Nothing in the symptoms suggests damaged data.', score: 0, effects: { uptime: -15 } }
          ] },
        { text: 'You find one transaction that has been open for forty minutes, holding a lock on a popular product row. What do you do?',
          choices: [
            { label: 'End that session, then add transaction and lock timeouts', feedback: 'Releases the queue right away, and stops it recurring.', score: 2, effects: { uptime: 20 } },
            { label: 'Restart the whole database', feedback: 'It clears the lock but also drops every other connection and causes a bigger outage than you had.', score: 1, effects: { uptime: -15 } },
            { label: 'Wait; it will probably finish by itself', feedback: 'Every minute the queue grows and more of the site freezes.', score: 0, effects: { uptime: -25 } }
          ] },
        { text: 'Later, someone mistakenly drops a table. A nightly backup exists, but nobody has ever restored one. What now?',
          choices: [
            { label: 'Restore into a scratch server first, check it, then recover the table from it', feedback: 'You avoid a second disaster on the live system and learn how long it takes.', score: 2, effects: { data: 5 } },
            { label: 'Restore straight over the live database', feedback: 'If the backup is bad you could overwrite whatever data still exists.', score: 0, effects: { data: -40 } },
            { label: 'Rebuild the table from memory', feedback: 'There is a backup for exactly this purpose.', score: 0, effects: { data: -30 } }
          ] }
      ],
      outro: 'Calm diagnosis, small targeted fixes and tested backups turn a scary afternoon into a short incident.' },

    { type: 'explain', prompt: 'Explain RPO and RTO, and why untested backups are risky.',
      model: 'RPO, the recovery point objective, is how much data you can afford to lose, measured as time since the last safe copy. RTO, the recovery time objective, is how long you can afford to be down. A backup that was never test-restored might be incomplete, corrupt or too slow to load, so you only find out in the disaster. Regular test restores, with timing, prove the plan can meet your RPO and RTO.',
      keywords: ['RPO', 'RTO', 'data loss', 'downtime', 'test restore', 'timing'] }
  ],

  flashcards: [
    { q: 'How does a database recover from a crash?', a: 'It restarts and replays its write-ahead log: committed work is reapplied and unfinished work is discarded.' },
    { q: 'What is connection pooling?', a: 'Keeping a small set of open database connections and lending them to requests, instead of opening one per request.' },
    { q: 'How does one long transaction cause an outage?', a: 'It holds locks, other requests queue behind it, they hold connections while waiting, and soon nothing can connect.' },
    { q: 'What do RPO and RTO mean?', a: 'RPO: how much data you can afford to lose. RTO: how long you can afford to be down.' },
    { q: 'Why test-restore backups?', a: 'Only a restore proves the backup is complete and usable, and shows how long recovery really takes.' },
    { q: 'What should you alert on before the disk is full?', a: 'Disk usage and its growth trend, with an alert well before 100% (for example 70-80%).' }
  ],

  glossary: [
    { term: 'Connection pool', def: 'A shared set of open database connections lent out to requests and returned afterwards.', like: 'A taxi rank: a few cars shared by many passengers.', aka: ['PgBouncer'] },
    { term: 'Lock contention', def: 'Many transactions waiting for the same locked rows, so work queues up.', like: 'A queue at the one open till.' },
    { term: 'RPO', def: 'Recovery Point Objective: the most data, measured in time, you can afford to lose in a disaster.', like: 'How far back you are willing to rewind.', aka: ['recovery point objective'] },
    { term: 'RTO', def: 'Recovery Time Objective: the longest you can afford to be down before service is restored.', like: 'How long the shop can stay shut.', aka: ['recovery time objective'] },
    { term: 'Test restore', def: 'Actually restoring a backup somewhere safe to prove it works and to time the process.', like: 'A fire drill, rather than just owning a fire extinguisher.' }
  ],

  takeaways: [
    'Crashes are handled by the **write-ahead log**; corruption and lost disks need **backups**.',
    'Watch **disk space**, **connections** and **long transactions**, and alert early.',
    'A **connection pool** shares a few real connections among many requests.',
    'Choose **RPO** and **RTO**, and **test-restore** backups to prove you can meet them.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('db-internals', {
  title: 'The Deadlock Kraken',
  intro: 'Beneath the data vault lurks a many-armed beast that holds one lock with each tentacle and waits for the others to let go. Prove you understand transactions, isolation, indexes, plans, ORMs and outages to cut yourself free.',
  questions: [
    { type: 'mcq', q: 'A transfer debits one account, then the server crashes before the credit. The two statements were inside one transaction that had not committed. What state is the data in after restart?',
      options: ['Neither update applied: the uncommitted transaction is discarded', 'The debit applied and the credit missing', 'Both updates applied by replaying the intent', 'The database refuses to open until it is repaired'],
      answer: 0,
      why: [null, 'That would break atomicity, which is exactly what transactions prevent.', 'Only committed work is replayed. The database does not guess intent.', 'Crash recovery is automatic and routine.'],
      explain: 'Atomicity: uncommitted work disappears on recovery, so the transfer never half-happens.' },

    { type: 'bucket', prompt: 'Which ACID promise is each statement about?', buckets: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      items: [['A `CHECK (balance >= 0)` rule refuses a bad update', 1], ['A commit acknowledged a second before a power cut is still there afterwards', 3], ['A failed second step rolls back the first', 0], ['Two transactions do not see each other\'s unfinished work', 2], ['The write-ahead log is flushed before "COMMIT OK"', 3], ['Either every row of an order is saved or none', 0]],
      explain: 'A is all-or-nothing, C is declared rules, I is concurrency, D is surviving a crash after commit.' },

    { type: 'tf', statement: 'In a lost update, the database reports an error so you know that one write was overwritten.', answer: false,
      explain: 'Nothing fails. Both writes succeed and the later one silently replaces the earlier, based on a stale read. That is why it is dangerous.' },

    { type: 'match', prompt: 'Match each concurrency bug to its description.',
      pairs: [['Dirty read', 'Reading another transaction\'s uncommitted change'], ['Non-repeatable read', 'The same row read twice gives different values'], ['Phantom read', 'The same query returns a different set of rows'], ['Deadlock', 'Two transactions each wait for a lock the other holds']] },

    { type: 'ab', q: 'Which update is safe when many transactions run at once?',
      a: { lang: 'sql', label: 'Query 1', src: `
        -- the app already read balance = 100
        UPDATE accounts SET balance = 50 WHERE id = 1;` },
      b: { lang: 'sql', label: 'Query 2', src: `
        UPDATE accounts SET balance = balance - 50
         WHERE id = 1 AND balance >= 50;` },
      answer: 'b',
      explain: 'The database applies the change to the current value and checks the rule in the same statement. Writing back a number computed from an earlier read can overwrite someone else\'s change.' },

    { type: 'mcq', q: 'A user opens an edit form and may stare at it for ten minutes before saving. Which locking style suits this?',
      options: ['Optimistic: a version column checked when saving', 'Pessimistic: `SELECT … FOR UPDATE` held while they type', 'Serializable isolation held open for the whole session', 'No protection; last save wins'],
      answer: 0,
      why: [null, 'A database lock held for ten minutes would block everyone else and tie up a connection.', 'Holding any transaction open that long causes the contention seen in the failure lessons.', 'That is the lost update, silently losing one person\'s work.'],
      explain: 'Optimistic locking takes no lock while the user thinks. If someone else saved first, the version no longer matches, and the app can tell the user.' },

    { type: 'multi', q: 'Which of these make a database ignore a normal index on `customers(email)`?',
      options: ['`WHERE lower(email) = \'a@b.com\'`', '`WHERE email LIKE \'%@gmail.com\'`', 'A filter that matches 90% of the table', '`WHERE email = \'a@b.com\'`', 'The table having a primary key'],
      answers: [0, 1, 2],
      explain: 'A function on the column, a leading wildcard and low selectivity all stop an index narrowing the search. An exact match is the ideal case.' },

    { type: 'spot', prompt: 'An index exists on `orders(customer_id, status)`. Which query cannot use it effectively?',
      code: { lang: 'sql', src: `
        SELECT * FROM orders WHERE customer_id = 7;
        SELECT * FROM orders WHERE customer_id = 7 AND status = 'new';
        SELECT * FROM orders WHERE status = 'new';
        SELECT status FROM orders WHERE customer_id = 7;` },
      lines: [3],
      explain: 'The leftmost prefix rule: the index is sorted by `customer_id` first, so a query on `status` alone has no sorted run to follow. The last query is even covered by the index.' },

    { type: 'order', prompt: 'Put the performance-fixing loop in order.',
      items: ['Find the slow query', 'Run EXPLAIN to read its plan', 'Change one thing (such as an index)', 'Measure again against the baseline'],
      explain: 'Find it, understand it, change it, then prove it. Changing several things at once, or skipping the re-measure, leaves you guessing.' },

    { type: 'cloze', code: true, text: `-- 1 query for the list
SELECT * FROM orders LIMIT 100;
-- then, in a loop, 100 more:
SELECT * FROM customers {{WHERE}} id = 12;
-- the fix: batch them
SELECT * FROM customers WHERE id {{IN}} (12, 7, 31);`,
      distractors: ['HAVING', 'BETWEEN', 'ANY'],
      explain: 'The loop issues one lookup per order (N). Batching the ids into one `IN (…)` query replaces N round trips with one.' },

    { type: 'short', q: 'What is the name of the problem where one list query is followed by one extra query per item? (write it as N plus a number)', accept: ['N+1', 'Nplus1', 'N+1 problem'], hint: 'Eager loading fixes it.',
      explain: 'The N+1 problem: one query for the list plus N queries for the details. Joins, `IN` batches or eager loading fix it.' },

    { type: 'estimate', q: 'A restore of your database takes about 6 hours. If you declared an RTO of 1 hour, roughly by what factor are you missing it?', answer: 6, unit: '× over the RTO', min: 1, max: 100, tolerance: 1.5,
      explain: 'RTO is how long you can afford to be down. A 6-hour restore against a 1-hour target misses it six times over. You would need a faster restore or a standby copy.' }
  ]
});

KS.sheet('db-internals', {
  title: 'Databases under the hood cheat sheet',
  sections: [
    { title: 'Transactions and ACID',
      md: `\`\`\`sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;      -- or ROLLBACK;
\`\`\`

| Letter | Promise |
|---|---|
| **A**tomicity | All or nothing |
| **C**onsistency | Declared rules always hold |
| **I**solation | Concurrent transactions do not trample |
| **D**urability | Committed = survives a crash (write-ahead log) |

\`SAVEPOINT x\` / \`ROLLBACK TO x\` undoes part. Keep transactions **short**; no emails or slow calls inside.
ACID is not backups, speed or correct logic.` },

    { title: 'Isolation levels and anomalies',
      md: `| Level | Stops |
|---|---|
| Read uncommitted | nothing |
| Read committed | dirty reads |
| Repeatable read | + non-repeatable reads |
| Serializable | + phantoms (everything) |

Defaults: **PostgreSQL** read committed; **MySQL InnoDB** repeatable read.

- **Dirty read**: sees uncommitted data
- **Non-repeatable read**: same row, new value
- **Phantom**: same query, new rows
- **Lost update**: two writes collide silently

**MVCC**: readers see a snapshot, so readers and writers do not block each other.` },

    { title: 'Locking and deadlocks',
      md: `| Style | How | Good for |
|---|---|---|
| Pessimistic | \`SELECT … FOR UPDATE\`, others wait | Short transactions, hot rows |
| Optimistic | \`version\` column: \`UPDATE … WHERE version = ?\` | Long think-time, rare conflicts |

Safest single-step form: \`SET balance = balance - 50 WHERE … AND balance >= 50\`.

**Deadlock**: A waits for B, B waits for A. The database aborts one. **Always retry.** Lock rows in a consistent order.` },

    { title: 'Indexes',
      md: `- **B-tree**: sorted tree; default; helps \`=\`, ranges, \`ORDER BY\`
- **Composite** \`(a, b)\`: leftmost prefix; helps \`a\` and \`a,b\`, not \`b\` alone
- **Covering**: holds all needed columns, so no table visit
- Cost: slower writes, more disk and memory

| Planner ignores the index when… |
|---|
| a function wraps the column: \`lower(email)\` |
| \`LIKE '%text'\` leading wildcard |
| low selectivity (matches most rows) |
| the table is tiny |

Index: filters, join keys, big sorts. Not: write-heavy, never-searched columns.` },

    { title: 'Profiling queries',
      md: `**Loop:** find slow query → \`EXPLAIN\` → change **one** thing → measure again.

| Plan node | Meaning |
|---|---|
| Seq Scan | Reads the whole table |
| Index Scan | Walks the index to matching rows |
| Index-only scan | Answered from the index alone |

- \`EXPLAIN\` = plan only. \`EXPLAIN ANALYZE\` = **runs it**, real timings (careful with writes).
- Estimates far from actuals? Refresh statistics.
- Fixes: matching index, no functions on columns, select fewer columns, \`LIMIT\`.
- Test on realistic data; keep a baseline.` },

    { title: 'ORMs and N+1',
      md: `**ORM** = objects ⇄ tables (Hibernate, Entity Framework, Django ORM, Active Record, SQLAlchemy, Prisma).

| | Active record | Data mapper |
|---|---|---|
| Saving | \`obj.save()\` | \`repo.save(obj)\` |
| Class | Knows the DB | Plain object |

Impedance mismatch: nesting, references and inheritance vs flat rows.
Drop to **parameterised** raw SQL for reports, bulk jobs, measured hot spots.

**N+1**: 1 list query + N detail queries (lazy loading in a loop). Fix: JOIN, \`IN (…)\` batch, eager loading. Spot: same statement repeating with different ids.` },

    { title: 'When databases fail',
      md: `| Failure | Defence |
|---|---|
| Crash | Write-ahead log replay |
| Disk full | Alert at 70–80%, retention |
| Too many connections | Connection pool (e.g. PgBouncer) |
| Long transaction / lock contention | Short transactions, timeouts |
| Corruption / lost disk | Backups, offsite |

**RPO** = how much data you can lose. **RTO** = how long you can be down.
A backup never test-restored is a hope. Restore, check, **time it**.
Replication shrinks RPO/RTO but can lag (see the "Scaling Data" module).` }
  ]
});
