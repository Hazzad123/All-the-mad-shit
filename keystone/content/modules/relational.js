/* Module: relational — Relational Databases & SQL.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs relational
   One shop schema throughout:
   customers(id, name, email, city) · products(id, name, price, category) · orders(id, customer_id, created_at, status) · order_items(order_id, product_id, quantity) */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-why', {
  eli5: 'A database is a program whose whole job is to store information safely and answer questions about it quickly, so you do not have to build all that yourself on top of a plain file.',

  cards: [
    { kind: 'concept', title: 'The shop that ran on a text file',
      body: `You have just launched a tiny online shop. Day one, orders are easy to store: every time someone buys something, your code adds a line to a file called \`orders.txt\`.

        \`\`\`text
        2025-03-01, Asha Patel, Notebook, 2
        2025-03-02, Ben Cole, Desk lamp, 1
        \`\`\`

        It works. It is simple. You are delighted.

        Then you get busy, and the file turns into the most expensive mistake of your week. This lesson is about **why**, and about the tool that exists precisely because of it: the **database**.` },

    { kind: 'pitfall', title: 'Five ways a file cracks under pressure',
      body: `Watch what happens as the shop grows:

        1. **Two customers at once.** Two requests both open the file and write at the same moment. Lines get tangled, or one order silently vanishes.
        2. **A crash halfway.** The power dies while writing. You are left with half a line, and no way to tell.
        3. **Finding things.** "Show me Asha’s orders" means reading *every line*, every time. A million orders means a million lines.
        4. **No rules.** Nothing stops "Leeds", "leeds" and "Leds" from all appearing, or a price of "banana".
        5. **Sharing.** Ten servers need the same file. Whose copy is the real one?

        None of these are bugs in *your* code. They are what plain files are like.` },

    { kind: 'metaphor', title: 'A pile of paper vs a filing office',
      body: `A text file is a **pile of paper** on a desk. Fine for a shopping list. Hopeless when ten people need it at once.

        A database is a **filing office with staff**. You hand a clerk a request ("all of Asha’s orders from March"). The clerk knows where everything is kept, makes sure nobody scribbles over someone else’s work, refuses forms that are filled in wrongly, and never loses a page, even if the lights go out.

        You never touch the filing cabinets. You just talk to the clerk. That clerk is a **database management system**, or **DBMS**.` },

    { kind: 'layers', title: 'Where the DBMS sits',
      body: 'Your code never reads the data files directly. Everything goes through the DBMS.',
      layers: [
        { label: 'Your application', note: 'The shop’s code: "a customer just bought a mug".', icon: '🛒' },
        { label: 'SQL: the language you speak', note: 'A request such as "give me all orders from Leeds".', icon: '💬', tone: 'accent' },
        { label: 'The DBMS', note: 'Works out the quickest way to answer, shares the data between users fairly, enforces the rules.', icon: '🧑‍💼', tone: 'accent' },
        { label: 'Files on disk', note: 'The actual bytes, stored in a format only the DBMS needs to understand.', icon: '💾', tone: 'muted' }
      ] },

    { kind: 'concept', title: 'What a DBMS gives you for free',
      body: `Everything that cracked in the file is something a DBMS handles for you:

        - **Safe sharing**: many users reading and writing at once without trampling each other.
        - **Durability**: once the database says "saved", it stays saved, even through a crash.
        - **Fast lookups**: finding one row among millions without reading them all.
        - **Rules**: it rejects data that breaks the rules you set.
        - **A query language**: you describe *what* you want, and it works out *how*.

        The first two get a whole module to themselves later (transactions). For now, just notice that this is a lot of hard work you will never have to write.` },

    { kind: 'concept', title: 'The relational idea: everything is a table',
      body: `Most databases you will meet are **relational**: they store everything in **tables**, like very strict spreadsheets. (This idea dates from a 1970 paper by Edgar Codd at IBM, and it has lasted remarkably well.)

        - A **table** holds one kind of thing: customers, say.
        - Each **row** is one customer.
        - Each **column** is one fact about every customer.

        | id | name | email | city |
        |---|---|---|---|
        | 1 | Asha Patel | asha@example.com | Leeds |
        | 2 | Ben Cole | ben@example.com | Bristol |
        | 3 | Chloe Wu | chloe@example.com | Leeds |

        Three rows, four columns. Tables are linked together to describe a whole business; the next lesson shows how.` },

    { kind: 'code', title: 'A schema: the blueprint',
      body: `Unlike a spreadsheet, a table has to be **declared** before you use it. That declaration is the **schema**: the names of the tables, the columns, and what type of value each column holds. **Tap the highlighted lines.** (You will write these yourself in a later lesson.)`,
      code: { lang: 'sql', src: `
        CREATE TABLE customers (
          id    INTEGER,
          name  TEXT,
          email TEXT,
          city  TEXT
        );`,
        notes: {
          1: 'We are asking the database to create a table called `customers`.',
          2: 'Each column has a **name** and a **type**. `INTEGER` means whole numbers only. Try storing "banana" here and the database refuses.',
          3: '`TEXT` means any string of characters. Other common types are for decimals, dates and true/false.'
        } },
      note: 'A schema is a promise: every row in this table will look like this, always. That is what makes the data trustworthy.' },

    { kind: 'code', title: 'Your first SQL',
      body: `You talk to a database in **SQL** (say "sequel" or "S-Q-L"; both are fine). It reads almost like English. This asks for the names of customers in Leeds.`,
      code: { lang: 'sql', src: `
        SELECT name
        FROM customers
        WHERE city = 'Leeds';`,
        notes: {
          1: '`SELECT` says which **columns** you want back.',
          2: '`FROM` says which **table** to look in.',
          3: '`WHERE` keeps only the rows that match. Notice the semicolon: it ends the statement.'
        } },
      note: 'You said *what* you want, not how to loop through the rows. The DBMS decides how.' },

    { kind: 'compare', title: 'File, spreadsheet or database?',
      body: 'Each has its place. The question is what happens when the shop gets busy.',
      cols: ['Text file', 'Database'],
      rows: [
        ['Many users at once', 'Corrupts or loses data', 'Designed for it'],
        ['Power cut mid-write', 'Half-written lines', 'Saved fully or not at all'],
        ['Finding one record', 'Read everything', 'Jump straight to it'],
        ['Bad data', 'Accepts anything', 'Refuses what breaks the rules'],
        ['Asking new questions', 'Write new code each time', 'Write a new query']
      ] }
  ],

  activities: [
    { type: 'multi', after: 1, q: 'Which of these are genuine problems with storing a busy shop’s orders in one plain text file?',
      options: ['Two requests writing at the same moment can tangle the file', 'Finding one customer’s orders means reading every line', 'The file will refuse to open once it has more than ten lines', 'Nothing stops nonsense values being written into it', 'Text files can only be read by one programming language'],
      answers: [0, 1, 3],
      explain: 'Concurrent writes, slow searching and zero validation are the real issues. Files open fine at any size, and any language can read text.' },

    { type: 'tf', after: 3, statement: 'In a typical setup, your application reads and writes the database’s data files directly from disk.', answer: false,
      explain: 'The application talks to the **DBMS** (usually in SQL) and the DBMS handles the files. That middle layer is what provides safe sharing, rules and speed.' },

    { type: 'match', after: 5, prompt: 'Match each database word to its plain meaning.',
      pairs: [['Table', 'One kind of thing, such as customers'], ['Row', 'One single item in a table'], ['Column', 'One fact stored for every item'], ['Schema', 'The blueprint of tables, columns and types'], ['DBMS', 'The software that stores data and answers requests']] },

    { type: 'bucket', prompt: 'Which part of a table is each of these?', buckets: ['A row', 'A column', 'The schema'],
      items: [['Asha, Leeds, asha@example.com', 0], ['The city of every customer', 1], ['"city holds text, id holds whole numbers"', 2], ['One product: Mug, 8.00, home', 0], ['The price of every product', 1], ['"products has four columns: id, name, price, category"', 2]],
      explain: 'A row runs *across* the table (one thing, all its facts). A column runs *down* (one fact, all the things). The schema describes the shape itself, not any particular data.' },

    { type: 'cloze', code: true, text: `SELECT {{name}}
FROM {{customers}}
WHERE city = 'Bristol';`,
      distractors: ['Bristol', 'cities', 'WHERE'],
      explain: '`SELECT` takes the column you want (`name`), and `FROM` takes the table it lives in (`customers`). The filter value `Bristol` is already in the text.' },

    { type: 'order', prompt: 'Put the journey of a request in order, from your code to the answer.',
      items: ['Your code sends a SQL request', 'The DBMS works out the quickest way to answer', 'The DBMS reads the needed data from disk', 'The matching rows are sent back to your code'],
      explain: 'The DBMS sits in the middle: it receives SQL, plans, fetches, and replies. Your code never needs to know where on disk anything lives.' },

    { type: 'scenario', title: 'Outgrowing orders.txt', intro: 'Your shop has had a good week. Now `orders.txt` has 40,000 lines, and strange things are happening.',
      meters: { 'data safety': 50, 'sanity': 70 },
      steps: [
        { text: 'Two customers checked out in the same second. One order is missing from the file, and another is garbled. What is the underlying cause?',
          choices: [
            { label: 'Two requests wrote to the same file at the same time with nothing coordinating them', score: 2, effects: { 'data safety': 10 }, feedback: 'Exactly. A plain file has no idea two writers exist. A DBMS coordinates every writer so that updates never trample each other.' },
            { label: 'The file got too big and the disk could not cope', score: 0, effects: { 'sanity': -10 }, feedback: '40,000 lines is tiny. The problem is not size; it is two writers and no referee.' },
            { label: 'Customers must have typed their orders wrongly', score: 0, effects: { 'data safety': -10 }, feedback: 'Blaming users will not bring the order back. This is a storage problem, not a typing problem.' }
          ] },
        { text: 'Support asks, "Show me everything Asha Patel ordered." Your script now takes 20 seconds. What is going on?',
          choices: [
            { label: 'It reads and checks every one of the 40,000 lines to find hers', score: 2, effects: { 'sanity': 10 }, feedback: 'Right. A file has no way to jump straight to Asha’s lines. A database can keep a lookup structure so it finds her orders without reading everything.' },
            { label: 'The network between you and the file is slow', score: 0, effects: { 'sanity': -10 }, feedback: 'The file is local. The time goes on reading line after line.' },
            { label: 'Asha has too many orders', score: 1, effects: {}, feedback: 'Her orders are a tiny fraction. The cost is in checking all the lines that are *not* hers.' }
          ] },
        { text: 'You decide to move to a real database. What is the biggest thing you gain beyond speed?',
          choices: [
            { label: 'Safe sharing, crash recovery and rules that refuse bad data', score: 2, effects: { 'data safety': 30, 'sanity': 15 }, feedback: 'That is the real prize. The database is the guard, the clerk and the filing system rolled into one.' },
            { label: 'You never have to think about your data again', score: 0, effects: { 'data safety': -5 }, feedback: 'You still design the tables and the rules. The database enforces what you tell it, no more.' },
            { label: 'The data becomes smaller on disk', score: 1, effects: { 'data safety': 5 }, feedback: 'Size is not the point. It might even be larger on disk. The gain is in correctness and speed.' }
          ] }
      ],
      outro: 'Remember the pattern: files are fine until **many users, lots of data or valuable data** show up. Then you want a DBMS.' },

    { type: 'short', q: 'What is the word for the blueprint of a database: its tables, columns and types?', accept: ['schema', 'the schema'], hint: 'Starts with an S, and a table has to be declared in one.',
      explain: 'The **schema** describes the shape of the data. The data itself is the rows that fill that shape.' },

    { type: 'explain', prompt: 'A friend says: "Why use a database? I can just save my app’s data in a file." Give two or three reasons it stops working.',
      model: 'A file is fine for one user and a small amount of data. Once several requests write at once they can corrupt it. A crash mid-write can leave half-saved data. Finding one record means reading everything, and nothing checks that the data is valid. A database manager handles sharing, crash safety, quick lookups and rules for you.',
      keywords: ['at once', 'crash', 'search', 'rules', 'DBMS'] }
  ],

  flashcards: [
    { q: 'Name three things a plain file cannot do well that a DBMS can.', a: 'Let many users read and write safely at once, survive a crash without half-written data, and find a record quickly without reading everything.' },
    { q: 'What is a DBMS?', a: 'A database management system: the software that sits between your app and the data on disk, handling storage, sharing, rules and queries.' },
    { q: 'In a relational database, what are tables, rows and columns?', a: 'A table holds one kind of thing; a row is one item in it; a column is one fact stored for every item.' },
    { q: 'What is a schema?', a: 'The blueprint of a database: which tables exist, what columns they have and what type each column holds.' },
    { q: 'What does SQL let you do that code with loops does not?', a: 'Describe *what* data you want; the database works out *how* to fetch it.' }
  ],

  glossary: [
    { term: 'Database', def: 'An organised collection of data, managed by software that stores it safely and answers questions about it.', like: 'A filing office, not a pile of paper.' },
    { term: 'DBMS', def: 'Database management system: the program (PostgreSQL, SQLite and so on) that stores the data and handles requests.', like: 'The clerk in the filing office.', aka: ['database management system'] },
    { term: 'Relational database', def: 'A database that stores data in tables of rows and columns, and links tables together.', like: 'A set of very strict, connected spreadsheets.' },
    { term: 'Schema', def: 'The blueprint of a database: its tables, columns and the type of each column.', like: 'The floor plan of a building before anyone moves in.' },
    { term: 'SQL', def: 'Structured Query Language: the standard language for asking relational databases questions and changing their data.', like: 'The way you phrase a request to the clerk.' }
  ],

  takeaways: [
    'Plain files break with **many users, big data or valuable data**: tangled writes, half-saved data, slow searches, no rules.',
    'A **DBMS** sits between your code and the disk and gives you safe sharing, durability, fast lookups and rules.',
    'Relational = **tables** of rows and columns, declared up front in a **schema**.',
    'You ask in **SQL** for *what* you want; the database decides *how*.'
  ],

  links: [
    { label: 'PostgreSQL tutorial: concepts', url: 'https://www.postgresql.org/docs/current/tutorial-concepts.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-keys-relationships', {
  eli5: 'Keys are how rows in different tables point at each other: every row gets its own unique ID, and other rows store that ID to say "this one belongs to that one".',

  cards: [
    { kind: 'concept', title: 'Which Asha do you mean?',
      body: `Your shop has two customers called **Asha Patel**. One lives in Leeds, one in Bristol. A support agent says "refund Asha Patel’s order". Which one?

        If rows are identified by name, you are one typo from refunding the wrong person. Names repeat. Emails change. Addresses move.

        What you need is a label that is **different for every row, and never changes**. In a database that label is called a **primary key**.` },

    { kind: 'metaphor', title: 'The deli counter ticket',
      body: `At a busy deli counter you take a numbered ticket. Nobody asks your name. "Number 47!" points at exactly one customer in the room.

        A **primary key** is that ticket number. It has three jobs:

        - it is **unique**: no two rows share it
        - it is **never empty**
        - it **never changes**, so everyone can keep referring to it

        Where the metaphor stops: the database hands out tickets for you, usually counting 1, 2, 3 as rows arrive.` },

    { kind: 'concept', title: 'Picking a primary key',
      body: `Each of our tables gets an \`id\` column as its primary key:

        | id | name | email | city |
        |---|---|---|---|
        | 1 | Asha Patel | asha@example.com | Leeds |
        | 2 | Ben Cole | ben@example.com | Bristol |
        | 3 | Asha Patel | asha.p@example.com | Bristol |

        Rows 1 and 3 have the same name, and that is fine: their ids differ.

        Why not use the email as the key? Because people change email addresses, and everything pointing at it would break. A good key is **meaningless on purpose**: a plain number with no real-world meaning that could ever change.` },

    { kind: 'concept', title: 'Foreign keys: pointing at another row',
      body: `Now orders. An order belongs to a customer, but we do not copy the customer’s name and address into every order. We store just the customer’s **id**.

        | id | customer_id | created_at | status |
        |---|---|---|---|
        | 101 | 1 | 2025-03-01 | shipped |
        | 102 | 2 | 2025-03-02 | pending |
        | 103 | 1 | 2025-03-05 | shipped |

        \`customer_id\` is a **foreign key**: a column holding the primary key of a row in *another* table. Orders 101 and 103 both point to customer 1, Asha. Change her email once in \`customers\` and every order is instantly "up to date".` },

    { kind: 'diagram', title: 'Our shop on one page',
      body: 'This is the schema used for the whole module. An arrow means "has a foreign key pointing at".',
      nodes: [
        { id: 'c', label: 'customers', icon: '🧑', x: 0, y: 0, tone: 'accent' },
        { id: 'o', label: 'orders', icon: '📦', x: 0, y: 1, tone: 'accent' },
        { id: 'oi', label: 'order_items', icon: '🧾', x: 0, y: 2, tone: 'warn' },
        { id: 'p', label: 'products', icon: '🏷️', x: 1, y: 2, tone: 'accent' }
      ],
      edges: [
        { from: 'o', to: 'c', label: 'customer_id' },
        { from: 'oi', to: 'o', label: 'order_id' },
        { from: 'oi', to: 'p', label: 'product_id' }
      ],
      caption: 'order_items sits in the middle: it connects orders to products. That is the next card but one.' },

    { kind: 'compare', title: 'Three shapes of relationship',
      body: 'Whenever two tables are linked, ask: "how many on each side?"',
      cols: ['Example', 'Where the key goes'],
      rows: [
        ['**One-to-one**', 'A customer has one loyalty-card record', 'Foreign key in either table, marked unique'],
        ['**One-to-many**', 'A customer has many orders; an order has one customer', 'Foreign key on the "many" side (`orders.customer_id`)'],
        ['**Many-to-many**', 'An order has many products; a product is in many orders', 'A separate **join table** in the middle']
      ],
      note: 'One-to-many is by far the most common. Remember the rule: the foreign key lives on the "many" side.' },

    { kind: 'example', title: 'Many-to-many needs a join table',
      body: `An order contains several products, and a product appears in many orders. Neither table can hold a single foreign key to the other: order 101 would need *two* product ids.

        So we add a third table, \`order_items\`, with one row per product-in-an-order:

        | order_id | product_id | quantity |
        |---|---|---|
        | 101 | 1 | 2 |
        | 101 | 3 | 1 |
        | 102 | 2 | 1 |

        Order 101 holds two notebooks (product 1) and one mug (product 3). A table that exists only to connect two others is a **join table** (also called a junction or link table). Its primary key is the *pair* (order_id, product_id), a **composite key**.` },

    { kind: 'code', title: 'Constraints: rules the database enforces',
      body: `A **constraint** is a rule on the data that the database checks on every change. **Tap the highlighted lines.**`,
      code: { lang: 'sql', src: `
        CREATE TABLE products (
          id       INTEGER PRIMARY KEY,
          name     TEXT NOT NULL,
          price    NUMERIC NOT NULL CHECK (price >= 0),
          category TEXT
        );

        CREATE TABLE customers (
          id    INTEGER PRIMARY KEY,
          email TEXT NOT NULL UNIQUE
        );`,
        notes: {
          2: '`PRIMARY KEY` means unique and never empty. Every row gets an id.',
          3: '`NOT NULL`: this column can never be left empty. No nameless products.',
          4: '`CHECK` is a custom rule. A negative price is rejected before it is stored.',
          5: 'No rule here, so `category` may be empty. Constraints are a choice, not a default.',
          10: '`UNIQUE`: no two customers may share an email, even though email is not the primary key.'
        } } },

    { kind: 'sequence', title: 'The database says no',
      body: 'A foreign key is also a constraint: it must point at a row that exists. Step through a bad insert.',
      actors: ['App', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'INSERT order for customer 99', note: 'A bug in the app tries to create an order for a customer id that does not exist.' },
        { at: 1, label: 'check foreign key', note: 'The database looks in `customers` for id 99 and finds nothing.' },
        { from: 1, to: 0, label: 'error: no such customer', dashed: true, note: 'The insert is **rejected**. No orphan order is ever stored.' },
        { note: 'The same check works in reverse: by default you cannot delete a customer who still has orders pointing at them.' }
      ] },

    { kind: 'pitfall', title: 'Do not hide a list inside a cell',
      body: `The tempting shortcut for many-to-many: add a \`product_ids\` column to orders and store \`"1,3"\` as text.

        It looks fine until you ask real questions. "Which orders contain the mug?" now means digging through text. Nothing checks that those ids exist. Removing one product means editing a string. The database cannot enforce rules on a list inside a cell.

        **One fact per cell, and one row per relationship.** That is what the join table buys you.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Why is `email` a poor choice of primary key for customers?',
      options: ['People change email addresses, and every row pointing at it would break', 'Emails are too long to store in a table', 'Two customers can never share an email, which is a problem', 'Primary keys must always be numbers'],
      answer: 0,
      why: [null, 'Length is not the issue.', 'Uniqueness is exactly what a key needs. The problem is that the value is not stable.', 'Keys can be text. Numbers are just the usual stable choice.'],
      explain: 'A key must **never change**, because other tables refer to it. Emails and names change in the real world. A meaningless `id` never does. (You can still protect emails with `UNIQUE`.)' },

    { type: 'bucket', after: 5, prompt: 'What kind of relationship is each of these?', buckets: ['One-to-one', 'One-to-many', 'Many-to-many'],
      items: [['A customer and their orders', 1], ['Orders and the products in them', 2], ['A customer and their single loyalty-card record', 0], ['A product category and its products', 1], ['Students and the courses they take', 2], ['A person and their passport', 0]],
      explain: 'Count both directions. If one side has *many* and the other *one*, it is one-to-many. If both sides have many, you need a join table.' },

    { type: 'spot', after: 9, prompt: 'This table design will cause trouble. Tap the line that breaks the "one fact per cell" rule.',
      code: { lang: 'sql', src: `
        CREATE TABLE orders (
          id          INTEGER PRIMARY KEY,
          customer_id INTEGER NOT NULL,
          created_at  TEXT NOT NULL,
          product_ids TEXT    -- stores '1,3,4'
        );` },
      lines: [5],
      explain: 'Line 5 crams a list into one cell, so the database cannot check it, search it well or link it to `products`. The fix is a join table `order_items` with one row per product in the order.' },

    { type: 'tf', statement: 'In a one-to-many relationship, the foreign key goes on the "many" side: each order stores its customer’s id.', answer: true,
      explain: 'Each order has exactly one customer, so one `customer_id` fits in each order row. The reverse (a customer storing a list of order ids) would put a list in one cell.' },

    { type: 'cloze', code: true, text: `CREATE TABLE products (
  id    INTEGER {{PRIMARY KEY}},
  name  TEXT {{NOT NULL}},
  price NUMERIC CHECK (price {{>=}} 0)
);`,
      distractors: ['UNIQUE', 'FOREIGN KEY', '<'],
      explain: '`PRIMARY KEY` identifies each row, `NOT NULL` forces a value, and `CHECK (price >= 0)` rejects negative prices. `UNIQUE` would be wrong for name or id here: it is not what we want to say.' },

    { type: 'ab', q: 'Which design correctly links customers and their orders?',
      a: { lang: 'sql', label: 'Design 1', src: `
        customers(id, name, order_id)
        orders(id, created_at)` },
      b: { lang: 'sql', label: 'Design 2', src: `
        customers(id, name)
        orders(id, customer_id, created_at)` },
      answer: 'b',
      explain: 'A customer has many orders, so the foreign key belongs on the orders side. The other design would let a customer hold only one order, or force a list into a single cell.' },

    { type: 'scenario', title: 'Adding product reviews', intro: 'Marketing wants customers to leave star reviews on products. A customer can review many products; a product can have many reviews. You are designing the table.',
      meters: { 'data quality': 50, 'future pain': 70 },
      steps: [
        { text: 'Where should reviews live?',
          choices: [
            { label: 'A new `reviews` table with `customer_id`, `product_id` and `stars`', score: 2, effects: { 'data quality': 25 }, feedback: 'Exactly. It is a join table with extra facts of its own: one row per customer-reviews-product.' },
            { label: 'A `reviews` text column on `products`, with all the stars comma-separated', score: 0, effects: { 'data quality': -25, 'future pain': -20 }, feedback: 'A list in a cell again. Averaging stars or finding who reviewed what becomes a string-parsing nightmare.' },
            { label: 'A `review_product_id` column on `customers`', score: 0, effects: { 'data quality': -15, 'future pain': -15 }, feedback: 'That allows each customer only one review. A customer reviewing a second product has nowhere to put it.' }
          ] },
        { text: 'Which constraint stops a customer reviewing the same product five times?',
          choices: [
            { label: 'Make the pair (`customer_id`, `product_id`) unique, or the primary key', score: 2, effects: { 'data quality': 20 }, feedback: 'A composite key on the pair means a second review by the same customer for the same product is rejected.' },
            { label: 'Make `stars` unique', score: 0, effects: { 'data quality': -15 }, feedback: 'Then only one review in the whole shop could ever give 5 stars.' },
            { label: 'Trust the website not to show the button twice', score: 1, effects: { 'future pain': -10 }, feedback: 'Apps have bugs and people have scripts. Rules you care about belong in the database too.' }
          ] },
        { text: 'Stars must be between 1 and 5. How do you guarantee it?',
          choices: [
            { label: '`CHECK (stars BETWEEN 1 AND 5)` on the column', score: 2, effects: { 'data quality': 20, 'future pain': 20 }, feedback: 'The database now refuses a 9-star review no matter which app or script tries to insert it.' },
            { label: 'Validate in the website’s form only', score: 1, effects: { 'future pain': -5 }, feedback: 'Good for friendly error messages, but it protects only that one door. Other code can still write bad data.' },
            { label: 'Use `NOT NULL` on the column', score: 0, effects: { 'data quality': -5 }, feedback: '`NOT NULL` only forces *some* value to exist. 9 is not null.' }
          ] }
      ],
      outro: 'Relationship first, then keys, then constraints. That is the order of thought for nearly every table you will design.' },

    { type: 'short', q: 'What do you call the extra table that connects two tables in a many-to-many relationship, such as `order_items`? (one word, before "table")', accept: ['join', 'junction', 'link', 'linking', 'bridge', 'associative'], hint: 'It "joins" the two sides together.',
      explain: 'A **join table** (or junction/link table) holds one row per pairing, with a foreign key to each side.' },

    { type: 'explain', prompt: 'Explain to a friend what a foreign key is and why we store the customer’s id in orders rather than their name.',
      model: 'A foreign key is a column that holds the primary key of a row in another table, so one row can point at another. Orders store the customer’s id, not the name, because names repeat and change. With an id, the customer’s details live in one place, orders always point at the right person, and the database can check the customer exists.',
      keywords: ['primary key', 'another table', 'unique', 'one place', 'exists'] }
  ],

  flashcards: [
    { q: 'What are the three properties of a good primary key?', a: 'Unique, never empty, and never changes.' },
    { q: 'What is a foreign key?', a: 'A column that stores the primary key of a row in another table, creating a link between rows.' },
    { q: 'Where does the foreign key go in a one-to-many relationship?', a: 'On the "many" side. Each order holds a `customer_id`.' },
    { q: 'How do you model a many-to-many relationship?', a: 'With a join table that has a foreign key to each side, one row per pairing (like `order_items`).' },
    { q: 'What do NOT NULL, UNIQUE and CHECK each enforce?', a: 'NOT NULL: a value must be present. UNIQUE: no duplicates in that column. CHECK: a custom condition, such as price >= 0, must hold.' }
  ],

  glossary: [
    { term: 'Primary key', def: 'A column (or set of columns) whose value is unique for every row, never empty and never changes. It identifies the row.', like: 'The numbered ticket at a deli counter.', aka: ['PK'] },
    { term: 'Foreign key', def: 'A column that holds the primary key of a row in another table, linking the two rows.', like: 'Writing someone’s ticket number on your own form.', aka: ['FK'] },
    { term: 'Join table', def: 'A table that exists only to connect two others in a many-to-many relationship, with one row per pairing.', like: 'A guest list matching people to events.', aka: ['junction table', 'link table'] },
    { term: 'Constraint', def: 'A rule on the data (NOT NULL, UNIQUE, CHECK, foreign key) that the database enforces on every change.', like: 'A bouncer who checks every form before it is filed.' },
    { term: 'Composite key', def: 'A primary key made of two or more columns together, such as (order_id, product_id).' }
  ],

  takeaways: [
    'A **primary key** gives every row a unique, unchanging identity. Prefer a meaningless `id`.',
    'A **foreign key** stores another row’s primary key. It lives on the "many" side.',
    'Many-to-many needs a **join table**, never a list crammed into one cell.',
    '**Constraints** (NOT NULL, UNIQUE, CHECK, foreign keys) make the database refuse bad data.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sql-select', {
  eli5: 'SELECT is how you ask a database a question: pick the table, say which rows you care about, say which columns you want, and it hands back a neat little table of answers.',

  cards: [
    { kind: 'concept', title: 'Questions are sentences',
      body: `The shop owner pops her head round the door. "Which of our products are under a tenner? Cheapest first, please."

        You could write a loop that walks every product, checks the price, collects matches and sorts them. Or you can write one sentence that the database understands:

        \`\`\`sql
        SELECT name, price
        FROM products
        WHERE price < 10
        ORDER BY price;
        \`\`\`

        That sentence is a **query**, and \`SELECT\` is by far the most-used statement in all of SQL. This lesson takes it apart, one clause at a time. A **clause** is one labelled part of the sentence, like \`FROM\` or \`WHERE\`.` },

    { kind: 'code', title: 'SELECT and FROM: columns from a table',
      body: 'The smallest useful query names the columns you want and the table they come from. **Tap the highlighted lines.**',
      code: { lang: 'sql', src: `
        SELECT name, price
        FROM products;`,
        notes: {
          1: '`SELECT` lists the **columns** to return, separated by commas. You choose both which columns and in what order.',
          2: '`FROM` names the **table**. With no filter, you get every row.'
        } },
      note: 'The result is itself a small table:\n\n| name | price |\n|---|---|\n| Notebook | 3.50 |\n| Desk lamp | 24.00 |\n| Mug | 8.00 |\n| Pen set | 6.50 |\n\n`SELECT *` means "all columns". Handy for exploring; in real code, name the columns you need.' },

    { kind: 'metaphor', title: 'WHERE is a sieve',
      body: `Imagine pouring the whole \`products\` table through a sieve. Only the rows that fit your condition fall through to the other side.

        - \`FROM\` picks which bucket of rows to pour.
        - \`WHERE\` is the sieve: rows that pass the test stay, the rest are dropped.
        - \`SELECT\` then picks which columns of the survivors to show.

        The sieve checks **one row at a time**. A row either passes or it does not. Nothing in a \`WHERE\` can look at other rows.` },

    { kind: 'code', title: 'WHERE: keep only the rows you want',
      body: 'Conditions compare a column with a value, and can be combined. Here we want home products under £20.',
      code: { lang: 'sql', src: `
        SELECT name, price
        FROM products
        WHERE category = 'home'
          AND price < 20;`,
        notes: {
          3: 'A single `=` means "equals" (not `==` like most programming languages). Text goes in **single quotes**; numbers do not.',
          4: '`AND` needs both conditions true. `OR` needs either. `NOT` flips a condition. Use brackets when mixing AND with OR.'
        } },
      note: 'Result:\n\n| name | price |\n|---|---|\n| Mug | 8.00 |\n\nThe desk lamp is home, but at 24.00 it fails the price test. Useful shortcuts: `<>` (not equal), `IN (\'home\', \'toys\')`, `BETWEEN 5 AND 10`, and `LIKE \'P%\'` (starts with P).' },

    { kind: 'concept', title: 'ORDER BY and LIMIT: sort, then trim',
      body: `Rows in a table have **no guaranteed order**. If order matters, you must ask for it.

        - \`ORDER BY price\` sorts smallest first. Add \`DESC\` for biggest first.
        - \`LIMIT 2\` stops after two rows.

        Together they answer "top N" questions:

        \`\`\`sql
        SELECT name, price
        FROM products
        ORDER BY price DESC
        LIMIT 2;
        \`\`\`

        | name | price |
        |---|---|
        | Desk lamp | 24.00 |
        | Mug | 8.00 |

        Without the \`ORDER BY\`, "the first two rows" would mean whichever two the database happened to find first.` },

    { kind: 'code', title: 'DISTINCT and simple expressions',
      body: 'Two small tools. `DISTINCT` removes duplicate rows. Expressions let you calculate in the query, and `AS` gives the new column a name.',
      code: { lang: 'sql', src: `
        SELECT DISTINCT category
        FROM products;

        SELECT name, price * 1.2 AS price_with_vat
        FROM products;`,
        notes: {
          1: 'Without `DISTINCT`, this would list `stationery` twice. With it, each category appears once.',
          4: 'You can do arithmetic (`+ - * /`) on columns. Here we add 20% VAT to each price. The stored prices do not change; this is just the answer. `AS` is an **alias**: the heading shown on the new column.',
        } },
      note: 'Second query returns:\n\n| name | price_with_vat |\n|---|---|\n| Notebook | 4.20 |\n| Desk lamp | 28.80 |\n| Mug | 9.60 |' },

    { kind: 'concept', title: 'NULL: the value that is not a value',
      body: `Dev signed up but never gave a city. What does the \`city\` cell hold? Not an empty string, and not "unknown" as text. It holds **NULL**: "no value here".

        | id | name | city |
        |---|---|---|
        | 1 | Asha Patel | Leeds |
        | 2 | Ben Cole | Bristol |
        | 3 | Chloe Wu | Leeds |
        | 4 | Dev Rao | NULL |

        NULL is **not zero** and **not empty text**. It means *unknown*. And unknown behaves strangely: asking whether an unknown city equals "Leeds" does not give *yes* or *no*, it gives *unknown*. A \`WHERE\` keeps only rows where the answer is a definite **yes**.` },

    { kind: 'code', title: 'NULL logic: the three-way surprise',
      body: 'Run each of these against the four customers. The third one is the shock.',
      code: { lang: 'sql', src: `
        WHERE city = 'Leeds'     -- Asha, Chloe
        WHERE city <> 'Leeds'    -- Ben only!
        WHERE city IS NULL       -- Dev
        WHERE city = NULL        -- nobody, ever`,
        notes: {
          1: 'Straightforward. Dev’s unknown city is not provably Leeds, so Dev is out.',
          2: 'Surprise: Dev is **missing** here too. We do not know Dev’s city, so we cannot say it is *not* Leeds. Unknown in, unknown out, and `WHERE` drops it.',
          3: 'The right way to find missing values. `IS NULL` (and `IS NOT NULL`) are the only tests that work on NULL.',
          4: 'A classic bug. `= NULL` is never true, not even for rows that are NULL, so this returns nothing.'
        } },
      note: 'Rule of thumb: any comparison with NULL, even `NULL = NULL`, is unknown. Test for it with `IS NULL`.' },

    { kind: 'steps', title: 'Writing a query, one question at a time',
      body: 'When you face a new question, build the query in this order. It is also the order you write the clauses.',
      steps: [
        { title: 'FROM: where is the data?', body: 'Which table holds what you need? `FROM customers`.' },
        { title: 'WHERE: which rows?', body: 'What makes a row relevant? `WHERE city = \'Leeds\'`.' },
        { title: 'SELECT: which columns?', body: 'What should the answer show? `SELECT name, email`.' },
        { title: 'ORDER BY: in what order?', body: 'Does the order matter? `ORDER BY name`.' },
        { title: 'LIMIT: how many?', body: 'Only want the first few? `LIMIT 10`. Then assemble: SELECT, FROM, WHERE, ORDER BY, LIMIT.' }
      ] },

    { kind: 'tip', title: 'Habits worth forming from day one',
      body: `- **Keywords are not case-sensitive**, but writing them in capitals makes queries easier to scan.
        - **Strings use single quotes.** Double quotes mean something different in SQL (a column name).
        - **Put each clause on its own line.** Future you will be grateful.
        - **Always \`ORDER BY\` with \`LIMIT\`**, or the "top N" is arbitrary.
        - **Be wary of \`SELECT *\`** in application code: if someone adds a column, your code now fetches it too.

        In the lab that follows you will type real queries against this very shop and see the rows come back.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What does `SELECT * FROM products;` return?',
      options: ['Every column of every row in `products`', 'Only the first column of every row', 'The number of rows in the table', 'The table’s schema, with no data'],
      answer: 0,
      why: [null, 'The star means all columns, not the first.', 'Counting rows needs `COUNT`, which comes next lesson.', 'That would describe the structure. SELECT returns data.'],
      explain: '`*` is shorthand for "all columns", and with no `WHERE` there is no filter, so every row comes back.' },

    { type: 'mcq', after: 7, q: 'Customers: Asha (Leeds), Ben (Bristol), Chloe (Leeds), Dev (city is NULL). Which customers does `WHERE city <> \'Leeds\'` return?',
      options: ['Ben only', 'Ben and Dev', 'Dev only', 'Nobody'],
      answer: 0,
      why: [null, 'Dev’s city is unknown, so the database cannot say it is different from Leeds.', 'Dev’s comparison is *unknown*, which `WHERE` drops.', 'Ben is definitely not in Leeds, so he passes.'],
      explain: 'Comparing NULL with anything gives *unknown*, and `WHERE` keeps only definite yeses. To include Dev you would add `OR city IS NULL`.' },

    { type: 'order', after: 8, prompt: 'Put the clauses of a query in the order you write them.',
      items: ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'LIMIT'],
      explain: 'SQL has a fixed written order: what you want, from where, which rows, in what order, how many. Getting it out of order is a syntax error.' },

    { type: 'cloze', code: true, text: `SELECT name, price
FROM products
WHERE category = 'home'
ORDER BY price {{DESC}}
{{LIMIT}} 1;`,
      distractors: ['ASC', 'TOP', 'DISTINCT'],
      explain: '`ORDER BY price DESC` puts the dearest first, and `LIMIT 1` keeps just that one row. Together: the most expensive home product.' },

    { type: 'spot', prompt: 'The shop owner wants customers whose city is not on file. One line has a classic bug. Which?',
      code: { lang: 'sql', src: `
        SELECT name, email
        FROM customers
        WHERE city = NULL
        ORDER BY name;` },
      lines: [3],
      explain: '`= NULL` is never true, so this returns no rows even though Dev has no city. It should be `WHERE city IS NULL`.' },

    { type: 'ab', q: 'The owner asks: "What is our cheapest product?" Which query answers it?',
      a: { lang: 'sql', label: 'Query 1', src: `
        SELECT name, price
        FROM products
        ORDER BY price
        LIMIT 1;` },
      b: { lang: 'sql', label: 'Query 2', src: `
        SELECT name, price
        FROM products
        ORDER BY price DESC
        LIMIT 1;` },
      answer: 'a',
      explain: 'Sorting ascending (the default) puts the cheapest first, and `LIMIT 1` keeps it. Adding `DESC` would return the *dearest* product instead.' },

    { type: 'short', q: 'To find rows where a column has no value, you write `WHERE city IS ____`. Which word fills the gap?', accept: ['NULL'], hint: 'It is also the name of the missing-value marker itself.',
      explain: '`IS NULL` is the only reliable test for a missing value. `= NULL` never matches anything.' },

    { type: 'scenario', title: 'Three questions from the shop owner', intro: 'You have your first morning as the shop’s data person. The owner keeps leaning over your shoulder with questions. Pick the query that really answers each one.',
      meters: { 'owner’s trust': 50, 'correctness': 50 },
      steps: [
        { text: `"Which products cost less than £10? Cheapest first."`,
          choices: [
            { label: `\`SELECT name, price FROM products WHERE price < 10 ORDER BY price;\``, score: 2, effects: { 'owner’s trust': 15, 'correctness': 15 }, feedback: 'Filter with `WHERE`, sort ascending. Exactly what she asked.' },
            { label: `\`SELECT name, price FROM products WHERE price > 10 ORDER BY price;\``, score: 0, effects: { 'owner’s trust': -10, 'correctness': -15 }, feedback: 'That is products *over* a tenner. One angle bracket, a completely different answer.' },
            { label: `\`SELECT * FROM products ORDER BY price DESC;\``, score: 1, effects: { 'correctness': -5 }, feedback: 'No filter, and sorted the wrong way round. She would have to do the work herself.' }
          ] },
        { text: `"Which customers haven’t told us their city?"`,
          choices: [
            { label: `\`SELECT name FROM customers WHERE city IS NULL;\``, score: 2, effects: { 'owner’s trust': 15, 'correctness': 20 }, feedback: 'Correct. `IS NULL` is the right test for a missing value.' },
            { label: `\`SELECT name FROM customers WHERE city = NULL;\``, score: 0, effects: { 'owner’s trust': -15, 'correctness': -20 }, feedback: 'Returns nothing at all, and you might wrongly report "everyone gave a city". `= NULL` is never true.' },
            { label: `\`SELECT name FROM customers WHERE city = '';\``, score: 1, effects: { 'correctness': -5 }, feedback: 'That finds an *empty string*, which is a different thing from NULL. Dev’s city is NULL, so Dev is missed.' }
          ] },
        { text: `"Who is *not* in Leeds? I want everyone else, including people with no city."`,
          choices: [
            { label: `\`WHERE city <> 'Leeds' OR city IS NULL\``, score: 2, effects: { 'owner’s trust': 20, 'correctness': 25 }, feedback: 'You handled the NULL trap on purpose. Ben (Bristol) and Dev (no city) both come back.' },
            { label: `\`WHERE city <> 'Leeds'\``, score: 1, effects: { 'correctness': -10 }, feedback: 'Looks right, but Dev silently disappears, because NULL is neither equal nor unequal to Leeds.' },
            { label: `\`WHERE city = 'Bristol'\``, score: 0, effects: { 'owner’s trust': -10, 'correctness': -15 }, feedback: 'That only finds Bristol. A different city appearing tomorrow would be missed.' }
          ] }
      ],
      outro: 'The pattern: say the question in plain English first, then translate each phrase into a clause. And always ask "could any of these columns be NULL?"' },

    { type: 'explain', prompt: 'Explain to a colleague why `WHERE city <> \'Leeds\'` does not return customers whose city is NULL.',
      model: 'NULL means unknown. Comparing an unknown value with Leeds gives unknown, not true or false, and WHERE only keeps rows where the condition is definitely true. So rows with a NULL city are dropped from both = and <>. You have to ask for them with IS NULL.',
      keywords: ['NULL', 'unknown', 'WHERE', 'true', 'IS NULL'] }
  ],

  flashcards: [
    { q: 'What do SELECT, FROM and WHERE each decide?', a: 'SELECT: which columns come back. FROM: which table to read. WHERE: which rows are kept.' },
    { q: 'What order do you write the clauses of a query?', a: 'SELECT, FROM, WHERE, ORDER BY, LIMIT.' },
    { q: 'How do you get the three dearest products?', a: '`SELECT name, price FROM products ORDER BY price DESC LIMIT 3;`' },
    { q: 'What does NULL mean, and how do you test for it?', a: 'NULL means "no value / unknown", not zero or empty text. Test with `IS NULL` or `IS NOT NULL`, never `= NULL`.' },
    { q: 'Why does `WHERE city <> \'Leeds\'` skip rows where city is NULL?', a: 'Comparing NULL with anything gives unknown, and WHERE only keeps rows that are definitely true.' }
  ],

  glossary: [
    { term: 'Query', def: 'A request you send to a database, most often a SELECT statement that returns rows.', like: 'A question put to the clerk.' },
    { term: 'Clause', def: 'One labelled part of a SQL statement, such as FROM, WHERE or ORDER BY.' },
    { term: 'NULL', def: 'A marker meaning "no value" or "unknown". It is not zero and not an empty string, and comparisons with it are never simply true or false.', like: 'A blank on a form: not "none", just "we do not know".' },
    { term: 'Alias', def: 'A temporary name given to a column or table in a query with AS, such as price * 1.2 AS price_with_vat.', like: 'A nickname used for one conversation.' },
    { term: 'Expression', def: 'A calculation inside a query, such as price * 1.2, done on each row.' }
  ],

  takeaways: [
    '`SELECT` columns `FROM` a table `WHERE` rows match; then `ORDER BY` and `LIMIT`.',
    'Rows have **no order** unless you say `ORDER BY`. "Top N" needs both.',
    '`DISTINCT` removes duplicates; expressions and `AS` calculate and rename.',
    '**NULL is unknown.** Use `IS NULL`; `= NULL` and `<>` quietly skip those rows.'
  ],

  links: [
    { label: 'SQLite: SELECT statement syntax', url: 'https://www.sqlite.org/lang_select.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sql-joins-aggregates', {
  eli5: 'A join stitches rows from two tables together by matching ids, and aggregates boil many rows down to one number, like a count, a total or an average.',

  cards: [
    { kind: 'concept', title: 'The answer is in two places',
      body: `The owner asks: "List each order with the name of the customer who placed it."

        But look at \`orders\`: it only stores a \`customer_id\`, a number. The name lives in \`customers\`. Neither table alone can answer.

        | orders.id | customer_id | | customers.id | name |
        |---|---|---|---|---|
        | 101 | 1 | | 1 | Asha Patel |
        | 102 | 2 | | 2 | Ben Cole |
        | 103 | 1 | | 3 | Chloe Wu |

        That was the whole point of keys: store each fact once, point with ids. The price is that to *read* it back together, you must **join** the tables.` },

    { kind: 'metaphor', title: 'Matching name tags',
      body: `Picture two stacks of index cards on a table. One stack is orders, each marked "customer 1", "customer 2". The other is customers, each with a number and a name.

        A **join** is you going through the orders stack and, for each card, finding the customer card with the same number and clipping the two together.

        The rule that decides which cards match is the **join condition**: \`orders.customer_id = customers.id\`. Get that wrong, and you clip the wrong cards together. Leave it out, and you clip *every* order to *every* customer (more on that disaster shortly).` },

    { kind: 'code', title: 'INNER JOIN: only the matches',
      body: 'This is the join you will write most often. **Tap the highlighted lines.**',
      code: { lang: 'sql', src: `
        SELECT orders.id, customers.name
        FROM orders
        INNER JOIN customers
          ON orders.customer_id = customers.id;`,
        notes: {
          1: 'Write `table.column` when two tables might share a column name (both have `id`). It removes any doubt about which you mean.',
          2: 'Start from the `orders` table.',
          3: '`INNER JOIN` brings in `customers`, keeping only rows that find a match on both sides. `JOIN` alone means the same.',
          4: '`ON` is the join condition: an order matches the customer whose `id` equals its `customer_id`.'
        } },
      note: 'Result:\n\n| id | name |\n|---|---|\n| 101 | Asha Patel |\n| 102 | Ben Cole |\n| 103 | Asha Patel |\n| 104 | Chloe Wu |\n\nDev Rao has never ordered, so Dev has no match and does not appear.' },

    { kind: 'code', title: 'LEFT JOIN: keep everyone on the left',
      body: 'What if you want **every customer**, including those who never ordered? Make `customers` the left table and use `LEFT JOIN`.',
      code: { lang: 'sql', src: `
        SELECT customers.name, orders.id AS order_id
        FROM customers
        LEFT JOIN orders
          ON orders.customer_id = customers.id;`,
        notes: {
          3: '`LEFT JOIN` keeps **every** row from the left table (`customers`), matched or not.',
          4: 'Same join condition as before. The only change is which unmatched rows survive.'
        } },
      note: 'Result:\n\n| name | order_id |\n|---|---|\n| Asha Patel | 101 |\n| Asha Patel | 103 |\n| Ben Cole | 102 |\n| Chloe Wu | 104 |\n| Dev Rao | NULL |\n\nDev appears, with `NULL` where the order would be. Asha appears twice, once per order.' },

    { kind: 'concept', title: 'Aggregates: many rows in, one value out',
      body: `So far every query returned rows. An **aggregate function** squashes many rows into a single value:

        | Function | Gives you |
        |---|---|
        | \`COUNT(*)\` | how many rows |
        | \`SUM(col)\` | the total |
        | \`AVG(col)\` | the average |
        | \`MIN(col)\` / \`MAX(col)\` | smallest / largest |

        \`\`\`sql
        SELECT COUNT(*) AS items, MIN(price) AS cheapest,
               MAX(price) AS dearest, AVG(price) AS average
        FROM products;
        \`\`\`

        | items | cheapest | dearest | average |
        |---|---|---|---|
        | 4 | 3.50 | 24.00 | 10.50 |

        \`COUNT(*)\` counts rows. \`COUNT(city)\` counts only rows where city is *not* NULL.` },

    { kind: 'code', title: 'GROUP BY: one answer per pile',
      body: `What if you want the figures *per category*, not for the whole table? Sort the rows into piles, one pile per category, then run the aggregate on each pile, like tallying a drawer full of receipts by shop. That is \`GROUP BY\`.`,
      code: { lang: 'sql', src: `
        SELECT category, COUNT(*) AS items, AVG(price) AS avg_price
        FROM products
        GROUP BY category;`,
        notes: {
          1: 'Each result row represents one **group**. `category` is the pile label; the aggregates are computed per pile.',
          3: 'Rows with the same `category` go in the same pile. Without this line, the aggregates would cover the whole table.'
        } },
      note: 'Result:\n\n| category | items | avg_price |\n|---|---|---|\n| stationery | 2 | 5.00 |\n| home | 2 | 16.00 |\n\nThe rule: every column in `SELECT` must be either in `GROUP BY` or inside an aggregate.' },

    { kind: 'code', title: 'WHERE vs HAVING',
      body: `Both filter, but at different moments. \`WHERE\` filters **rows before** they are grouped. \`HAVING\` filters **groups after** the aggregates are computed.`,
      code: { lang: 'sql', src: `
        SELECT customer_id, COUNT(*) AS orders
        FROM orders
        WHERE status <> 'cancelled'
        GROUP BY customer_id
        HAVING COUNT(*) > 1;`,
        notes: {
          3: '`WHERE` runs first: cancelled orders are thrown away before any counting happens.',
          4: 'Then the remaining rows are grouped by customer.',
          5: '`HAVING` runs last, on the finished counts. You cannot use `COUNT(*)` in a `WHERE`, because at that point there is nothing to count yet.'
        } },
      note: 'Result: just customer 1 (Asha) with 2 orders. Ben and Chloe have one each and fail the `HAVING`.' },

    { kind: 'code', title: 'Joining three tables',
      body: `Joins chain. To get each order’s **total value**, we need \`orders\`, then \`order_items\` for quantities, then \`products\` for prices.`,
      code: { lang: 'sql', src: `
        SELECT orders.id,
               SUM(products.price * order_items.quantity) AS total
        FROM orders
        JOIN order_items ON order_items.order_id = orders.id
        JOIN products    ON products.id = order_items.product_id
        GROUP BY orders.id;`,
        notes: {
          2: 'Price lives in `products`, quantity in `order_items`. Multiply them per line, then `SUM` per order.',
          4: 'First join: each order picks up its line items.',
          5: 'Second join: each line item picks up its product. Each `JOIN` has its own `ON`.',
          6: 'One result row per order.'
        } },
      note: 'Result:\n\n| id | total |\n|---|---|\n| 101 | 15.00 |\n| 102 | 24.00 |\n| 103 | 19.50 |\n| 104 | 16.00 |\n\nOrder 101: 2 notebooks at 3.50, plus 1 mug at 8.00.' },

    { kind: 'deep', title: 'Subqueries at a glance',
      body: `A **subquery** is a query inside a query, wrapped in brackets. The inner one runs first and hands its answer to the outer.

        "Which products cost more than the average?" You need the average before you can compare:`,
      code: { lang: 'sql', src: `
        SELECT name, price
        FROM products
        WHERE price > (SELECT AVG(price) FROM products);`,
        notes: {
          3: 'The bracketed query returns a single number (10.50). The outer `WHERE` compares each price with it.'
        } },
      note: 'Result: only Desk lamp (24.00). A subquery can also return a list, used with `IN`: `WHERE id IN (SELECT customer_id FROM orders)` finds customers who have ordered. Many subqueries can be rewritten as joins; use whichever reads more clearly.' },

    { kind: 'pitfall', title: 'Joins can multiply your rows',
      body: `Two classic traps:

        - **Forgetting the \`ON\`.** Without a join condition, every row pairs with every row. 1,000 customers × 1,000 orders = **one million rows**. It is called a *cartesian product*, and it will make your database very unhappy.
        - **Counting through a join.** \`orders\` has 4 rows, but join it to \`order_items\` and you get 5 (order 101 has two lines). \`COUNT(*)\` now says 5 orders. Use \`COUNT(DISTINCT orders.id)\` to count each order once.

        When a number looks too big after a join, ask: "Is something being repeated?"` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Using `orders INNER JOIN customers`, what happens to Dev Rao, a customer who has never placed an order?',
      options: ['Dev does not appear, because there is no matching order', 'Dev appears with NULL where the order id would be', 'The query fails with an error', 'Dev appears once for every order in the table'],
      answer: 0,
      why: [null, 'That is what a `LEFT JOIN` from customers would do.', 'No error: unmatched rows are simply left out.', 'That would be the missing-`ON` cartesian disaster, not an inner join.'],
      explain: '`INNER JOIN` keeps only rows that have a match on both sides. To keep customers without orders, start from `customers` and use `LEFT JOIN`.' },

    { type: 'match', after: 4, prompt: 'Match each aggregate to the question it answers.',
      pairs: [['COUNT(*)', 'How many rows are there?'], ['SUM(price)', 'What do they come to in total?'], ['AVG(price)', 'What is the typical value?'], ['MIN(price)', 'What is the smallest?'], ['MAX(price)', 'What is the largest?']] },

    { type: 'bucket', after: 6, prompt: 'Does each filter belong in WHERE (before grouping) or HAVING (after)?', buckets: ['WHERE', 'HAVING'],
      items: [['Only orders with status shipped', 0], ['Only customers with more than 3 orders', 1], ['Only products costing over £5', 0], ['Only categories whose average price is over £10', 1], ['Only orders placed in March', 0], ['Only groups where SUM(quantity) > 100', 1]],
      explain: 'If the test is about a **single row**, use `WHERE`. If it is about a computed group result (a count, sum or average), it can only be checked afterwards, so use `HAVING`.' },

    { type: 'cloze', code: true, text: `SELECT customers.name, {{COUNT}}(orders.id) AS orders
FROM customers
{{LEFT JOIN}} orders
  ON orders.customer_id = customers.id
{{GROUP BY}} customers.name;`,
      distractors: ['SUM', 'INNER JOIN', 'HAVING'],
      explain: 'We want every customer (so `LEFT JOIN`), counted per customer (`GROUP BY`). `COUNT(orders.id)` counts only real orders, so Dev gets 0 rather than 1.' },

    { type: 'spot', prompt: 'This query is meant to give the average price per category. Which line makes it invalid?',
      code: { lang: 'sql', src: `
        SELECT category, name, AVG(price)
        FROM products
        GROUP BY category;` },
      lines: [1],
      explain: '`name` is neither in `GROUP BY` nor inside an aggregate. Each category pile holds several names, so there is no single name to show. Remove it, or group by it too.' },

    { type: 'ab', q: 'The owner wants a list of **all** customers with their number of orders, including customers with none. Which query is right?',
      a: { lang: 'sql', label: 'Query 1', src: `
        SELECT c.name, COUNT(o.id)
        FROM customers c
        INNER JOIN orders o ON o.customer_id = c.id
        GROUP BY c.name;` },
      b: { lang: 'sql', label: 'Query 2', src: `
        SELECT c.name, COUNT(o.id)
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id
        GROUP BY c.name;` },
      answer: 'b',
      explain: 'The inner join discards customers with no orders before counting, so Dev vanishes. The left join keeps Dev, and `COUNT(o.id)` correctly gives 0. (Here `c` and `o` are short aliases for the table names.)' },

    { type: 'estimate', q: 'You forget the `ON` clause when joining 1,000 customers to 1,000 orders. Roughly how many rows does the database try to produce?', answer: 1000000, unit: 'rows', min: 100, max: 100000000,
      explain: 'Without a join condition every customer pairs with every order: 1,000 × 1,000 = one million rows. This is a **cartesian product**, and a very common cause of queries that never finish.' },

    { type: 'scenario', title: 'The Monday report', intro: 'The owner wants a few numbers for a Monday meeting. Each one has a trap.',
      meters: { 'report accuracy': 50, 'owner’s confidence': 50 },
      steps: [
        { text: `"How many orders has each customer placed? Include people who never ordered, with 0."`,
          choices: [
            { label: `\`customers LEFT JOIN orders\`, grouped by customer, with \`COUNT(orders.id)\``, score: 2, effects: { 'report accuracy': 25, 'owner’s confidence': 15 }, feedback: 'Spot on. The left join keeps Dev, and counting `orders.id` (not `*`) turns "no order" into 0.' },
            { label: `\`customers LEFT JOIN orders\`, grouped by customer, with \`COUNT(*)\``, score: 1, effects: { 'report accuracy': -10 }, feedback: 'Close, but `COUNT(*)` counts the one NULL-filled row for Dev, so Dev shows 1 order instead of 0.' },
            { label: `\`orders INNER JOIN customers\`, grouped by customer`, score: 0, effects: { 'report accuracy': -20, 'owner’s confidence': -10 }, feedback: 'Dev has no orders, so the inner join drops Dev from the report entirely.' }
          ] },
        { text: `"Now only show customers with at least 2 orders."`,
          choices: [
            { label: `Add \`HAVING COUNT(orders.id) >= 2\` after the \`GROUP BY\``, score: 2, effects: { 'report accuracy': 20, 'owner’s confidence': 10 }, feedback: 'The count only exists after grouping, so a condition on it goes in `HAVING`.' },
            { label: `Add \`WHERE COUNT(orders.id) >= 2\``, score: 0, effects: { 'report accuracy': -15 }, feedback: '`WHERE` runs before grouping, when there are no counts yet, so the database refuses the query.' },
            { label: `Add \`LIMIT 2\``, score: 0, effects: { 'report accuracy': -15, 'owner’s confidence': -10 }, feedback: '`LIMIT 2` keeps the first two result rows, whatever their counts. Different thing entirely.' }
          ] },
        { text: `"Total order count? You said 5, but I count 4 orders in the system."`,
          choices: [
            { label: `The join to \`order_items\` repeats order 101 once per line; use \`COUNT(DISTINCT orders.id)\``, score: 2, effects: { 'report accuracy': 25, 'owner’s confidence': 20 }, feedback: 'Exactly: the join fans one order out into several rows. `DISTINCT` counts each order once.' },
            { label: 'The database must have a bug', score: 0, effects: { 'owner’s confidence': -20 }, feedback: 'The database did exactly what the query asked. When a count looks inflated after a join, look for repeated rows.' },
            { label: 'Subtract one from the answer', score: 0, effects: { 'report accuracy': -20, 'owner’s confidence': -15 }, feedback: 'That would be right today and wrong tomorrow. Fix the query, not the number.' }
          ] }
      ],
      outro: 'Joins and aggregates are where most wrong numbers in the world come from. Always sanity-check a result against a tiny example you can count by hand.' },

    { type: 'explain', prompt: 'Explain the difference between INNER JOIN and LEFT JOIN to someone who has never seen SQL, using customers and orders.',
      model: 'Both connect each order to its customer by matching ids. An inner join only keeps rows that have a match on both sides, so a customer who never ordered disappears. A left join keeps every row from the left table (the customers) and fills in NULL where there is no matching order.',
      keywords: ['match', 'every row', 'left', 'NULL', 'never ordered'] }
  ],

  flashcards: [
    { q: 'What does INNER JOIN keep, and what does LEFT JOIN keep?', a: 'INNER JOIN keeps only rows with a match on both sides. LEFT JOIN keeps every row from the left table, with NULLs where there is no match.' },
    { q: 'What does the ON clause do?', a: 'It states the join condition: which column in one table must equal which column in the other, such as orders.customer_id = customers.id.' },
    { q: 'What does GROUP BY do?', a: 'Sorts rows into piles by a column’s value, so aggregates like COUNT or SUM are computed once per pile.' },
    { q: 'WHERE vs HAVING?', a: 'WHERE filters individual rows before grouping. HAVING filters groups after aggregates are computed.' },
    { q: 'What goes wrong if you forget the ON in a join?', a: 'Every row pairs with every row (a cartesian product): 1,000 × 1,000 rows becomes a million.' },
    { q: 'What is a subquery?', a: 'A query nested in brackets inside another query. The inner one runs first and passes its result to the outer.' }
  ],

  glossary: [
    { term: 'Join', def: 'Combining rows from two tables into one result by matching a column in one with a column in the other.', like: 'Clipping together index cards that carry the same number.' },
    { term: 'Aggregate function', def: 'A function that turns many rows into a single value: COUNT, SUM, AVG, MIN or MAX.', like: 'Adding up a till roll to one total.' },
    { term: 'GROUP BY', def: 'A clause that sorts rows into groups by the value of one or more columns, so aggregates are computed per group.', like: 'Sorting receipts into one pile per shop before totalling each pile.' },
    { term: 'HAVING', def: 'A clause that filters groups after aggregation, as opposed to WHERE, which filters rows before.' },
    { term: 'Subquery', def: 'A SELECT written inside another statement, in brackets, whose result the outer query uses.', like: 'A question you must answer first to be able to ask the next one.' }
  ],

  takeaways: [
    '**INNER JOIN** keeps matches only; **LEFT JOIN** keeps every left-hand row and fills gaps with NULL.',
    'Always write the **ON**. Without it you get every row paired with every row.',
    '**COUNT, SUM, AVG, MIN, MAX** squash rows to a value; **GROUP BY** does it once per group.',
    '**WHERE** filters rows, **HAVING** filters groups. Joins can repeat rows, so sanity-check your counts.'
  ],

  links: [
    { label: 'PostgreSQL tutorial: joins', url: 'https://www.postgresql.org/docs/current/tutorial-join.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sql-writes', {
  eli5: 'INSERT adds rows, UPDATE changes them and DELETE removes them. The one thing to remember: without a WHERE, UPDATE and DELETE hit every single row.',

  cards: [
    { kind: 'story', title: 'The Friday afternoon "small fix"',
      body: `Picture a junior developer, late on a Friday. A customer’s price is wrong, so they open a database console and type:

        \`\`\`sql
        UPDATE products SET price = 9.00;
        \`\`\`

        It runs instantly. "1 row updated", they expect. The console says **4 rows updated**. Every product in the shop now costs £9.00, including the £24 desk lamp.

        They forgot one short clause. This lesson teaches you to **write** data (so far you have only read it), and why the most important word in it is \`WHERE\`.` },

    { kind: 'code', title: 'INSERT: add a row',
      body: 'Name the table, the columns you are filling, then the values in the same order. **Tap the highlighted lines.**',
      code: { lang: 'sql', src: `
        INSERT INTO customers (name, email, city)
        VALUES ('Eve Khan', 'eve@example.com', 'York');

        INSERT INTO products (name, price, category)
        VALUES ('Stapler', 5.00, 'stationery'),
               ('Tape',    2.25, 'stationery');`,
        notes: {
          1: 'List the columns you are supplying. We leave out `id` on purpose: it is normally set up to count upwards automatically.',
          2: '`VALUES` gives one value per column, in the same order. Text in single quotes, numbers bare.',
          5: 'One statement can insert several rows: just separate the groups with commas.'
        } },
      note: 'After the first statement, `customers` gains a row: `5 | Eve Khan | eve@example.com | York`. If a value breaks a constraint (a duplicate email, say), the whole insert is refused.' },

    { kind: 'code', title: 'UPDATE: change existing rows',
      body: `\`UPDATE\` has three parts: which table, what to set, and, crucially, **which rows**.`,
      code: { lang: 'sql', src: `
        UPDATE products
        SET price = 9.00
        WHERE id = 3;

        UPDATE products
        SET price = price * 1.10,
            category = 'homeware'
        WHERE category = 'home';`,
        notes: {
          2: '`SET column = value` lists the changes. Several are separated by commas.',
          3: '`WHERE` picks the rows to change. Filtering by the **primary key** (`id = 3`) guarantees exactly one row.',
          6: 'The new value can use the old one: this raises the price by 10%.',
          8: 'This `WHERE` matches several rows, so all of them change. That is fine when it is what you meant.'
        } },
      note: 'The first statement changes the mug from 8.00 to 9.00 and touches nothing else.' },

    { kind: 'metaphor', title: 'Reply All',
      body: `You know the horror of hitting **Reply All** on a company-wide email, when you meant to reply to one person. The message is not wrong; it just went to everyone.

        \`UPDATE\` and \`DELETE\` without a \`WHERE\` are Reply All. They are perfectly valid SQL, and the database will not ask "are you sure?". It does exactly what you said: to **every row**.

        \`WHERE\` is the "To:" line. Always fill it in first, before you write anything else.` },

    { kind: 'code', title: 'DELETE: remove rows',
      body: 'The same rule applies, only more painfully. Which lines are the dangerous ones? Tap them.',
      code: { lang: 'sql', src: `
        DELETE FROM orders
        WHERE id = 104;

        DELETE FROM orders
        WHERE status = 'cancelled';

        DELETE FROM orders;`,
        notes: {
          1: 'Removes the rows matching the condition. Here: exactly one order, by primary key.',
          4: 'Removes every cancelled order. Fine, if that is the intention.',
          7: '**No `WHERE`: deletes every order.** The table stays, but it is empty. (A foreign key might refuse it if other rows still point at the orders.)'
        } } },

    { kind: 'steps', title: 'A safe way to change data',
      body: 'Professionals follow a small ritual before any `UPDATE` or `DELETE`.',
      steps: [
        { title: 'Write it as a SELECT first', body: 'Turn `UPDATE products SET … WHERE id = 3` into `SELECT * FROM products WHERE id = 3`. Same `WHERE`, but harmless.' },
        { title: 'Check the rows', body: 'Is it one row? Ten? Are they the ones you expected? If you meant one row and see four hundred, stop.' },
        { title: 'Swap in the real statement', body: 'Keep the identical `WHERE` and change only the first words.' },
        { title: 'Look at what it reports', body: 'Most tools print "N rows affected". If N is not what you predicted, find out why immediately.' },
        { title: 'Have a way back', body: 'Take a backup, or run it inside a transaction you can undo (the next module covers transactions). Production data deserves a seat belt.' }
      ] },

    { kind: 'code', title: 'CREATE and ALTER TABLE: changing the shape',
      body: 'So far we changed **rows**. Changing the **schema**, the shape itself, uses different statements.',
      code: { lang: 'sql', src: `
        CREATE TABLE reviews (
          id          INTEGER PRIMARY KEY,
          product_id  INTEGER NOT NULL REFERENCES products(id),
          stars       INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
          comment     TEXT
        );

        ALTER TABLE customers ADD COLUMN phone TEXT;`,
        notes: {
          1: '`CREATE TABLE` makes a new, empty table from your blueprint.',
          3: '`REFERENCES products(id)` declares a **foreign key** to the `products` table.',
          4: 'Constraints from the keys lesson go right here, next to the column.',
          8: '`ALTER TABLE` modifies an existing table. Existing customers get `NULL` in the new column. (You can also drop or rename columns, but be careful: it is destructive.)'
        } } },

    { kind: 'compare', title: 'Choosing data types',
      body: 'Every column has a type, and picking the right one stops bad data at the door.',
      cols: ['Good for', 'Shop example'],
      rows: [
        ['`INTEGER`', 'Whole numbers', '`quantity`, `id`'],
        ['`NUMERIC(10,2)`', 'Exact decimals such as money', '`price`'],
        ['`TEXT` / `VARCHAR(n)`', 'Words, emails, names', '`name`, `email`'],
        ['`BOOLEAN`', 'True or false', '`is_active`'],
        ['`DATE` / `TIMESTAMP`', 'Calendar dates and moments', '`created_at`']
      ],
      note: 'Never store money in floating-point types (`FLOAT`, `REAL`): they cannot represent numbers like 0.10 exactly, so pennies drift. Use `NUMERIC`, or store whole pence as an integer. (Type names vary a little between databases, and SQLite is looser about enforcing them.)' },

    { kind: 'pitfall', title: 'Glue strings together, lose your database',
      body: `Your login form takes an email and your code builds the SQL by gluing text together:

        \`\`\`js
        const sql = "SELECT * FROM customers WHERE email = '" + email + "'";
        \`\`\`

        Now someone types this *as their email*: \`' OR '1'='1\`. The finished SQL becomes:

        \`\`\`sql
        SELECT * FROM customers WHERE email = '' OR '1'='1'
        \`\`\`

        \`'1'='1'\` is always true, so **every customer comes back**. The attacker’s text was treated as part of the *command*, not as data. This is **SQL injection**, one of the most common and damaging attacks on the web.` },

    { kind: 'code', title: 'The fix: placeholders',
      body: 'Never build SQL from user input by joining strings. Send the query and the values **separately**.',
      code: { lang: 'js', src: `
        // Unsafe: input becomes part of the SQL
        db.query("SELECT * FROM customers WHERE email = '" + email + "'");

        // Safe: the database receives the value separately
        db.query('SELECT * FROM customers WHERE email = $1', [email]);`,
        notes: {
          2: 'Whatever the user typed is now *code*. This is the vulnerability.',
          5: '`$1` is a **placeholder** (some libraries use `?`). The database parses the SQL first, then slots the value in as plain data, so quotes and `OR` in it can never change the command.'
        } },
      note: 'These are called **parameterised queries** (or prepared statements). You will see how attackers use injection, and break a login yourself, in the Security world later.' }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What does `UPDATE customers SET city = \'York\';` do?',
      options: ['Sets the city of every customer to York', 'Sets the city of the first customer only', 'Does nothing until you add a WHERE', 'Produces an error, because WHERE is mandatory'],
      answer: 0,
      why: [null, 'There is no "first only" rule. Without a filter, all rows match.', 'The database does not wait for anything. It runs immediately.', 'WHERE is optional, which is exactly what makes this dangerous.'],
      explain: 'With no `WHERE`, every row matches, so every row changes. SQL assumes you meant what you wrote.' },

    { type: 'spot', after: 4, prompt: 'A developer pastes these four statements into a production console. Which one should make you shout "stop"?',
      code: { lang: 'sql', src: `
        INSERT INTO customers (name, email) VALUES ('Fay', 'fay@example.com');
        UPDATE orders SET status = 'shipped';
        DELETE FROM order_items WHERE order_id = 104;
        UPDATE customers SET city = 'York' WHERE id = 5;` },
      lines: [2],
      explain: 'Line 2 has no `WHERE`, so every order in the shop, even the cancelled ones, becomes "shipped". The other three are each restricted to specific rows.' },

    { type: 'order', after: 5, prompt: 'Put the safe-change ritual in order.',
      items: ['Write the change as a SELECT with the same WHERE', 'Check that the right rows come back', 'Swap in the UPDATE or DELETE, keeping the WHERE', 'Compare "rows affected" with what you expected'],
      explain: 'Rehearse with a harmless `SELECT`, confirm the target, then run the real thing and check the count matched your prediction.' },

    { type: 'bucket', prompt: 'Does it change the **rows** (data) or the **shape** (schema)?', buckets: ['Changes data', 'Changes the schema'],
      items: [['Add a new customer', 0], ['Add a phone column to customers', 1], ['Change a product’s price', 0], ['Create the reviews table', 1], ['Remove a cancelled order', 0], ['Restrict stars to 1–5 on a new column', 1]],
      explain: '`INSERT`, `UPDATE` and `DELETE` work on rows. `CREATE` and `ALTER TABLE` change the structure that rows live in.' },

    { type: 'cloze', code: true, text: `{{UPDATE}} products
SET price = 9.00
{{WHERE}} id = 3;

{{INSERT}} INTO customers (name, email)
VALUES ('Gus', 'gus@example.com');`,
      distractors: ['SELECT', 'FROM', 'ALTER'],
      explain: '`UPDATE` … `WHERE` changes the chosen row, and `INSERT INTO … VALUES` adds a new one.' },

    { type: 'ab', q: 'Which way of looking up a customer by the email typed into a website form is safe?',
      a: { lang: 'js', label: 'Version 1', src: `
        db.query(
          "SELECT * FROM customers WHERE email = '" + email + "'"
        );` },
      b: { lang: 'js', label: 'Version 2', src: `
        db.query(
          'SELECT * FROM customers WHERE email = $1',
          [email]
        );` },
      answer: 'b',
      explain: 'The placeholder keeps the SQL and the user’s text apart, so whatever is typed is treated as a plain value. Gluing strings lets the input rewrite the command itself.' },

    { type: 'scenario', title: 'The accidental UPDATE', intro: 'You have just run `UPDATE products SET price = 9.00;` on the live shop by mistake. All four products now cost £9. It is 4:55pm on a Friday. Customers are still ordering.',
      meters: { 'money lost': 20, 'trust': 80 },
      steps: [
        { text: 'The very first thing you do?',
          choices: [
            { label: 'Stop, tell your team straight away, and ask for the checkout to be paused', score: 2, effects: { 'money lost': 5, 'trust': 5 }, feedback: 'Right. Stop the bleeding, and tell people early. A mistake reported in two minutes is a story; one hidden for two hours is a scandal.' },
            { label: 'Quietly run `UPDATE products SET price = 24.00;` to fix it', score: 0, effects: { 'money lost': 30, 'trust': -30 }, feedback: 'You have just made the Notebook cost £24 and still told nobody. Guessing at repairs on live data compounds the damage.' },
            { label: 'Hope nobody noticed', score: 0, effects: { 'money lost': 40, 'trust': -40 }, feedback: 'Every minute, orders are placed at the wrong price.' }
          ] },
        { text: 'How do you get the right prices back?',
          choices: [
            { label: 'Restore the correct prices from the last backup (or a recorded copy of the old values)', score: 2, effects: { 'money lost': -5, 'trust': 15 }, feedback: 'Exactly why backups exist. The old prices were different for each product, so you cannot recompute them with one statement.' },
            { label: 'Set all prices back with a single `UPDATE` and a good guess', score: 0, effects: { 'money lost': 20, 'trust': -20 }, feedback: 'The original prices were 3.50, 24.00, 8.00 and 6.50. One statement cannot recover four different numbers.' },
            { label: 'Delete the products table and recreate it', score: 0, effects: { 'money lost': 30, 'trust': -25 }, feedback: 'Now orders that point at those products are broken too, and the data is still gone.' }
          ] },
        { text: 'The fire is out. What habit prevents a repeat?',
          choices: [
            { label: 'Write every change as a SELECT first, check the row count, and use a transaction or backup', score: 2, effects: { 'trust': 20 }, feedback: 'Rehearsal, verification and a way back. Many teams also stop developers running raw writes on production at all.' },
            { label: 'Promise to be more careful', score: 1, effects: { 'trust': 5 }, feedback: 'Sincere, but tired humans on Fridays make mistakes. Good systems assume it and add safety nets.' },
            { label: 'Never use UPDATE again', score: 0, effects: { 'trust': -5 }, feedback: 'Prices need changing sometimes. The tool is fine; the process was missing.' }
          ] }
      ],
      outro: 'Writes are where databases hurt people. **Rehearse, verify, keep a way back.**' },

    { type: 'short', q: 'Which statement adds a new column to an existing table? Fill the gap: `____ TABLE customers ADD COLUMN phone TEXT;`', accept: ['ALTER'], hint: 'It means "change".',
      explain: '`ALTER TABLE` modifies the structure of a table that already exists. `CREATE TABLE` only makes brand-new ones.' },

    { type: 'explain', prompt: 'Explain what SQL injection is and the one change that prevents it.',
      model: 'If you build SQL by gluing user input into a string, an attacker can type text that is interpreted as part of the command, for example making a condition always true. The fix is parameterised queries: send the SQL with placeholders and the values separately, so input is only ever treated as data.',
      keywords: ['user input', 'string', 'command', 'placeholder', 'parameterised'] }
  ],

  flashcards: [
    { q: 'What happens if you run UPDATE or DELETE without a WHERE?', a: 'It applies to every row in the table. The database will not ask for confirmation.' },
    { q: 'What are the safe steps before changing data?', a: 'Write it as a SELECT with the same WHERE, check the rows, run the real statement, compare "rows affected" with your expectation, and keep a backup or undo.' },
    { q: 'Which statements change rows and which change the schema?', a: 'INSERT, UPDATE, DELETE change rows. CREATE TABLE and ALTER TABLE change structure.' },
    { q: 'Which type should you use for money, and which should you avoid?', a: 'Use NUMERIC (exact decimals) or whole pence as integers. Avoid FLOAT or REAL because they cannot store values like 0.10 exactly.' },
    { q: 'What is SQL injection and how do you prevent it?', a: 'Attacker-supplied text gets interpreted as SQL because the query was built by joining strings. Prevent it with parameterised queries (placeholders).' }
  ],

  glossary: [
    { term: 'INSERT', def: 'The SQL statement that adds new rows to a table.' },
    { term: 'UPDATE', def: 'The SQL statement that changes values in existing rows. Without a WHERE it changes every row.', like: 'Reply All: it goes to everyone unless you restrict it.' },
    { term: 'DELETE', def: 'The SQL statement that removes rows from a table. Without a WHERE it removes all of them.' },
    { term: 'SQL injection', def: 'An attack where user-supplied text is interpreted as part of a SQL command because the query was built by joining strings.', like: 'A form where someone writes extra instructions into the "name" box and the clerk obeys them.' },
    { term: 'Parameterised query', def: 'A query with placeholders where the values are sent separately, so input is always treated as data, never as SQL.', aka: ['prepared statement'], like: 'Handing the clerk a form with a blank, and the answer on a separate slip.' }
  ],

  takeaways: [
    '`INSERT` adds, `UPDATE` changes, `DELETE` removes. `CREATE` / `ALTER TABLE` change the shape.',
    '**No WHERE means every row.** Rehearse with a `SELECT` first and check the row count.',
    'Choose types carefully: `NUMERIC` (not `FLOAT`) for money, and dates as dates.',
    '**Never glue user input into SQL.** Use placeholders.'
  ],

  links: [
    { label: 'SQLite: INSERT, UPDATE and DELETE syntax', url: 'https://www.sqlite.org/lang_update.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-normalization', {
  eli5: 'Normalisation means storing each fact in exactly one place and linking to it, so you never have two copies that can disagree.',

  cards: [
    { kind: 'concept', title: 'The spreadsheet that contradicts itself',
      body: `Before she knew about keys, the shop owner kept everything in one big table, one row per item ordered:

        | order_id | customer | city | product | price |
        |---|---|---|---|---|
        | 101 | Asha Patel | Leeds | Notebook | 3.50 |
        | 101 | Asha Patel | Leeds | Mug | 8.00 |
        | 103 | Asha Patel | Leeds | Pen set | 6.50 |
        | 102 | Ben Cole | Bristol | Desk lamp | 24.00 |

        Look at Asha: her name and city are written **three times**. Every fact about her is repeated for every item she buys. That is not just untidy. It is a **bug waiting to happen**.` },

    { kind: 'metaphor', title: 'One phone number, three sticky notes',
      body: `Imagine your mum’s phone number written on three sticky notes: the fridge, the car, your desk. She changes number. You update two notes and forget the third.

        Now your house contains **two contradictory answers** to "what is Mum’s number?", and nothing can tell you which is true.

        That is what repeated data does. A database where every fact lives in **exactly one place** cannot contradict itself, because there is nothing to disagree with. Getting there is called **normalisation**.` },

    { kind: 'steps', title: 'Three ways repeated data bites',
      body: 'These are called **anomalies**: things that go wrong because of how the table is shaped. Using the big table above:',
      steps: [
        { title: 'Update anomaly', body: 'Asha moves to York. You must change her city in **every** row. Miss one and she lives in Leeds *and* York.' },
        { title: 'Insert anomaly', body: 'The shop stocks a new Stapler. There is nowhere to record it until someone orders it, because a row needs an order. Same for a customer who has not bought yet.' },
        { title: 'Delete anomaly', body: 'Ben cancels his only order and you delete the row. The Desk lamp’s price **and** Ben’s city vanish with it, though neither was meant to go.' }
      ] },

    { kind: 'layers', title: 'The normal forms: a ladder',
      body: 'Normalisation is a checklist with levels. Each level removes one kind of repetition. In practice we aim for **third normal form**.',
      layers: [
        { label: '3rd normal form (3NF)', note: 'Every column depends on the key and nothing but the key.', icon: '🥇', tone: 'good' },
        { label: '2nd normal form (2NF)', note: 'Every column depends on the whole key, not just part of it.', icon: '🥈', tone: 'accent' },
        { label: '1st normal form (1NF)', note: 'One value per cell, and no repeating groups of columns.', icon: '🥉', tone: 'info' },
        { label: 'The messy table', note: 'Everything in one place, with repeated facts.', icon: '🍝', tone: 'bad' }
      ] },

    { kind: 'concept', title: '1NF: one value per cell',
      body: `Our earlier warning: do not put a list in a cell. That is exactly first normal form.

        **Breaks 1NF** (a list in one cell):

        | order_id | customer | products |
        |---|---|---|
        | 101 | Asha Patel | Notebook, Mug |

        **Fixed**: one row per product on the order, as in the big table. (Also forbidden: columns like \`product1\`, \`product2\`, \`product3\`. What about a fourth product?)

        1NF is the entry ticket. Without it you cannot even filter or join cleanly. But it still leaves the repeating names and cities, which is the next problem.` },

    { kind: 'concept', title: '2NF: the whole key',
      body: `In our table the row is identified by the **pair** (order_id, product). Now ask of each other column: does it depend on the *whole* pair, or only on part?

        - \`price\` depends only on the **product**. The Mug costs 8.00 whichever order it is in. Half the key.
        - \`customer\` and \`city\` depend only on the **order**. The other half.

        Those columns do not belong here. The fix is to give them their own tables:

        | products | | order_items |
        |---|---|---|
        | id, name, price | | order_id, product_id, quantity |

        Now the Mug’s price is stored once, in \`products\`. Change it once and every order sees it.` },

    { kind: 'concept', title: '3NF: nothing but the key',
      body: `Our \`orders\` now hold \`(order_id, customer, city)\`. The key is \`order_id\`. But does \`city\` depend on the *order*? No: it depends on the **customer**. The chain is order → customer → city.

        When a non-key column depends on another non-key column, it is a **transitive dependency**, and it causes the same repetition: Asha’s city appears once per order.

        Fix: move customer facts into \`customers\`, and let orders store only \`customer_id\`:

        | orders | | customers |
        |---|---|---|
        | id, customer_id, created_at | | id, name, email, city |

        A handy chant for all three levels: every column must depend on **the key, the whole key, and nothing but the key**.` },

    { kind: 'diagram', title: 'From one table to four',
      body: 'Normalising splits the big table so each fact lives in one place. The keys from earlier link them back together.',
      nodes: [
        { id: 'flat', label: 'One big messy table', icon: '🍝', x: 1, y: 0, tone: 'bad' },
        { id: 'c', label: 'customers', x: 0, y: 1, tone: 'good' },
        { id: 'o', label: 'orders', x: 1, y: 1, tone: 'good' },
        { id: 'oi', label: 'order_items', x: 2, y: 1, tone: 'good' },
        { id: 'p', label: 'products', x: 3, y: 1, tone: 'good' }
      ],
      edges: [
        { from: 'flat', to: 'c', label: 'who' }, { from: 'flat', to: 'o', label: 'when' }, { from: 'flat', to: 'oi', label: 'how many' }, { from: 'flat', to: 'p', label: 'what' },
        { from: 'o', to: 'c', dashed: true }, { from: 'oi', to: 'o', dashed: true }, { from: 'oi', to: 'p', dashed: true }
      ],
      caption: 'Solid arrows: where each kind of fact moved to. Dashed: foreign keys that hold it together.' },

    { kind: 'code', title: 'Splitting without losing anything',
      body: `Worried that splitting loses information? It does not. A join (last lesson) rebuilds the big table whenever you want it, and it is guaranteed to give back exactly what you started with if you split along keys.`,
      code: { lang: 'sql', src: `
        SELECT orders.id AS order_id, customers.name,
               customers.city, products.name AS product,
               products.price
        FROM orders
        JOIN customers   ON customers.id = orders.customer_id
        JOIN order_items ON order_items.order_id = orders.id
        JOIN products    ON products.id = order_items.product_id;`,
        notes: {
          5: 'Each `JOIN` follows a foreign key back to where the fact lives.',
          1: 'The columns look just like the original messy table. The data is simply *assembled on demand* instead of *stored in repetition*.'
        } },
      note: 'Store it split, read it joined. This is the trade at the heart of relational design. In the lab that follows, you will find the anomalies in a messy table and split it step by step.' },

    { kind: 'realworld', title: 'Denormalising on purpose',
      body: `Rules have exceptions. **Denormalising** means deliberately storing a repeated fact because you decided the trade is worth it. Two honest reasons:

        - **History.** A product’s price changes next year. But order 101 must keep the price the customer *actually paid*. So \`order_items\` often stores a \`unit_price\` copy at the moment of sale. It looks like repetition, but it is a different fact: "price at that time".
        - **Speed.** Reporting systems sometimes keep pre-joined or pre-totalled copies so dashboards load quickly, accepting more work to keep them in sync.

        The order of operations matters: **normalise first, denormalise later, with a reason you can name.**` }
  ],

  activities: [
    { type: 'bucket', after: 2, prompt: 'Which anomaly does each situation show?', buckets: ['Update', 'Insert', 'Delete'],
      items: [['Asha’s city is changed in two rows but not the third', 0], ['You cannot record a new product until someone orders it', 1], ['Deleting the only order for the Desk lamp erases the lamp’s price', 2], ['"Leeds" is mistyped as "Leds" in just one of her rows', 0], ['A customer cannot be saved until they place an order', 1], ['Cancelling Ben’s only order wipes Ben’s details', 2]],
      explain: '**Update**: a repeated fact changed in some places only. **Insert**: a fact cannot be stored without an unrelated one. **Delete**: removing one fact accidentally removes another.' },

    { type: 'mcq', after: 6, q: 'A table `orders(id, customer_id, customer_city)` has `id` as its key. Which normal form does `customer_city` break, and why?',
      options: ['Third: city depends on the customer, not on the order key', 'First: it holds more than one value per cell', 'Second: it depends on only part of a composite key', 'None: it is fine because every row has a city'],
      answer: 0,
      why: [null, 'Each cell holds a single value, so 1NF is satisfied.', 'The key is the single column `id`, so there is no "part of a key" to depend on.', 'Having a value in every row is not the test. The test is what the value depends on.'],
      explain: 'The chain is order → customer → city. A column depending on another non-key column is a transitive dependency, a 3NF violation. Move city to `customers`.' },

    { type: 'ab', after: 9, q: 'An order was placed when the mug cost 8.00. The price has since risen to 9.00. Which `order_items` design keeps old receipts correct?',
      a: { lang: 'sql', label: 'Design 1', src: `
        order_items(order_id, product_id, quantity)
        -- price read from products today` },
      b: { lang: 'sql', label: 'Design 2', src: `
        order_items(order_id, product_id, quantity,
                    unit_price)  -- price at time of sale` },
      answer: 'b',
      explain: 'The price *at the time of purchase* is a different fact from the product’s current price, so storing it is not duplication. This is a deliberate, justified denormalisation. Design 1 would silently rewrite history.' },

    { type: 'match', prompt: 'Match each normalisation idea to its short description.',
      pairs: [['1NF', 'One value per cell, no repeating groups'], ['2NF', 'Every column depends on the whole key'], ['3NF', 'Every column depends on nothing but the key'], ['Update anomaly', 'A repeated fact changed in only some places'], ['Denormalising', 'Copying a fact on purpose for a good reason']] },

    { type: 'spot', prompt: 'This table is meant to be in third normal form. Which column does not belong?',
      code: { lang: 'sql', src: `
        CREATE TABLE orders (
          id            INTEGER PRIMARY KEY,
          customer_id   INTEGER NOT NULL REFERENCES customers(id),
          created_at    TEXT NOT NULL,
          customer_name TEXT,
          status        TEXT
        );` },
      lines: [5],
      explain: '`customer_name` depends on `customer_id`, not on the order. It repeats for every order and can fall out of date. Keep it in `customers` and join when you need it.' },

    { type: 'tf', statement: 'Splitting one table into several along keys means you can no longer see the original combined data.', answer: false,
      explain: 'A join rebuilds the combined view whenever you ask. Nothing is lost by splitting along keys; you simply stop storing the repeated copies.' },

    { type: 'cloze', text: 'Every column should depend on the {{key}}, the {{whole}} key, and {{nothing}} but the key.',
      distractors: ['table', 'row', 'index'],
      explain: 'This chant sums up 1NF–3NF: the *key* (each row has one), the *whole key* (2NF) and *nothing but the key* (3NF).' },

    { type: 'scenario', title: 'Clean up the flat table', intro: 'You inherit the shop’s original big table: `order_id, customer, city, product, price`. Normalise it.',
      meters: { 'data integrity': 40, 'sanity': 60 },
      steps: [
        { text: 'Asha has moved and appears in 31 rows. What is the underlying problem?',
          choices: [
            { label: 'Customer facts are stored once per order line, instead of once per customer', score: 2, effects: { 'data integrity': 20 }, feedback: 'Right: a fact about the customer is repeated for every item, so it can drift out of sync. The cure is a `customers` table.' },
            { label: 'The table has too many rows', score: 0, effects: { 'sanity': -10 }, feedback: 'Row count is not the issue. Repetition of the same fact is.' },
            { label: 'City should be uppercase', score: 0, effects: { 'data integrity': -5 }, feedback: 'Formatting does not fix a fact being stored in 31 places.' }
          ] },
        { text: 'Where should the product price live?',
          choices: [
            { label: 'In `products(id, name, price)`, with `order_items` pointing at it', score: 2, effects: { 'data integrity': 25 }, feedback: 'Price depends on the product only, so it belongs with the product. This is the 2NF fix.' },
            { label: 'Stay in the big table: it is simpler', score: 0, effects: { 'data integrity': -15, 'sanity': -10 }, feedback: 'Then a price change means editing every row that mentions that product.' },
            { label: 'In `customers`, since they pay it', score: 0, effects: { 'data integrity': -20 }, feedback: 'A price belongs to a product, not a person. Each customer would need a price column per product.' }
          ] },
        { text: 'Accounting complains that after a price rise, last year’s receipts show the new price. What now?',
          choices: [
            { label: 'Add `unit_price` to `order_items`, recording the price at the time of sale', score: 2, effects: { 'data integrity': 20, 'sanity': 20 }, feedback: 'A deliberate denormalisation: price-at-sale is its own fact. Normalise first, then copy on purpose, with a reason.' },
            { label: 'Never change prices again', score: 0, effects: { 'sanity': -10 }, feedback: 'The shop needs to change prices. The design must cope.' },
            { label: 'Put everything back into one big table', score: 0, effects: { 'data integrity': -25 }, feedback: 'You would reintroduce every anomaly to fix one problem.' }
          ] }
      ],
      outro: 'The rule of thumb: **one fact, one place.** Break it on purpose, only with a reason you can say out loud.' },

    { type: 'explain', prompt: 'Explain to a friend why storing a customer’s city in every order row is a problem, and what you would do instead.',
      model: 'The same fact is repeated in many rows, so if it changes you must edit all of them, and missing one leaves contradictory data (an update anomaly). Instead, put the city once in a customers table and have orders store just the customer id, then join them when you need both.',
      keywords: ['repeated', 'update anomaly', 'customers table', 'customer_id', 'join'] }
  ],

  flashcards: [
    { q: 'What are the three anomalies?', a: 'Update (a repeated fact changed in only some rows), insert (a fact cannot be stored without an unrelated one) and delete (deleting one fact accidentally removes another).' },
    { q: 'What do 1NF, 2NF and 3NF each require?', a: '1NF: one value per cell. 2NF: every column depends on the whole key. 3NF: every column depends on nothing but the key.' },
    { q: 'What is the chant that summarises the normal forms?', a: 'Every column depends on the key, the whole key, and nothing but the key.' },
    { q: 'Does splitting a table lose information?', a: 'No. If you split along keys, a join rebuilds the original combined view.' },
    { q: 'When is denormalising justified?', a: 'When you deliberately copy a fact for a reason: keeping history (price at time of sale) or speed (pre-computed reporting), after normalising first.' }
  ],

  glossary: [
    { term: 'Normalisation', def: 'Organising tables so each fact is stored in exactly one place, removing repetition and the bugs it causes.', like: 'Writing Mum’s number once in an address book, not on three sticky notes.', aka: ['normalization'] },
    { term: 'Anomaly', def: 'A data problem (update, insert or delete) caused by the shape of a table, usually because facts are repeated.' },
    { term: 'Normal form', def: 'A named level of tidiness for tables: first, second and third normal form each remove one kind of repetition.', aka: ['1NF', '2NF', '3NF'] },
    { term: 'Transitive dependency', def: 'When a non-key column depends on another non-key column rather than directly on the key, such as order → customer → city.' },
    { term: 'Denormalisation', def: 'Deliberately storing a repeated fact, for history or speed, after normalising.', like: 'Keeping a photocopy of a receipt because the original price may change.' }
  ],

  takeaways: [
    'Repeated facts cause **update, insert and delete anomalies**.',
    '**1NF** one value per cell · **2NF** the whole key · **3NF** nothing but the key.',
    'Split along keys and **joins** rebuild the full picture: nothing is lost.',
    '**Normalise first**, then denormalise only for a reason such as history or speed.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-engines', {
  eli5: 'SQL is a shared language, but real databases are different programs (PostgreSQL, MySQL, SQLite and others) with different strengths. Postgres is the safe default; SQLite is a whole database in a single file.',

  cards: [
    { kind: 'concept', title: 'You have learned SQL. Now: whose?',
      body: `Time to install a database for the shop. You search and find a long list: PostgreSQL, MySQL, MariaDB, SQL Server, Oracle, SQLite. Which do you pick?

        Good news: everything you have learned so far works on nearly all of them. They all speak **SQL**, the standard language.

        But each is a separate **program** with its own history, price, strengths and small quirks. Choosing one is a real decision you will live with for years, because moving a database later is painful. This lesson is a friendly tour, so the names stop being a blur.` },

    { kind: 'metaphor', title: 'Same steering wheel, different engines',
      body: `Every car has a steering wheel, pedals and gears, so if you can drive one, you can drive most. But under the bonnet, a city runabout, a lorry and a racing car are very different machines.

        SQL is the **steering wheel**. The database engine is what is under the bonnet. Your queries mostly carry over, but the engine decides:

        - how much it costs
        - how it behaves under heavy load
        - which extra features you get
        - where you can run it

        The small differences in how each one speaks SQL are called **dialects**. They matter at the edges, not in everyday SELECTs.` },

    { kind: 'diagram', title: 'Two ways a database can run',
      body: 'The biggest split is not brand, but **shape**. Most engines are servers. One famous exception is a library.',
      nodes: [
        { id: 'app1', label: 'Your app', icon: '🖥️', x: 0, y: 0 },
        { id: 'srv', label: 'Database server process', icon: '🗄️', x: 1, y: 0, tone: 'accent' },
        { id: 'files1', label: 'Data files', icon: '💾', x: 2, y: 0, tone: 'muted' },
        { id: 'app2', label: 'App + SQLite library', icon: '📱', x: 0, y: 1, tone: 'good' },
        { id: 'files2', label: 'One database file', icon: '📄', x: 2, y: 1, tone: 'muted' }
      ],
      edges: [
        { from: 'app1', to: 'srv', label: 'SQL over network', both: true },
        { from: 'srv', to: 'files1' },
        { from: 'app2', to: 'files2', label: 'reads the file directly' }
      ],
      caption: 'Top: a separate server program that many apps can share (PostgreSQL, MySQL, SQL Server, Oracle). Bottom: the database is a library inside your app (SQLite).' },

    { kind: 'concept', title: 'PostgreSQL: the all-rounder',
      body: `**PostgreSQL** (say "post-gress", often just **Postgres**) is free and open source, with roots in a research project at the University of California, Berkeley. It is famous for:

        - sticking closely to the SQL standard
        - a deep feature list: rich data types (including JSON), powerful extensions, careful handling of correctness
        - a long track record: decades of use in serious systems

        It runs as a server, is offered as a managed service by every major cloud provider, and has a huge community. If you ask ten experienced backend developers what to pick for a new project with no special constraints, most say Postgres.` },

    { kind: 'concept', title: 'MySQL and MariaDB: the web’s workhorses',
      body: `**MySQL** is another free, open-source server, and for decades it powered a large share of the web: the classic "LAMP" stack (Linux, Apache, MySQL, PHP) and tools like WordPress run on it. It is known for being fast at simple reads and easy to get started with.

        **MariaDB** is a **fork** of MySQL: a copy taken by MySQL’s original creators after Oracle took over the company that owned it, and developed separately since. They are very similar, and for a long time MariaDB could replace MySQL almost unchanged, though the two have slowly drifted apart.

        Many hosting companies offer one or the other out of the box.` },

    { kind: 'concept', title: 'SQL Server and Oracle: the enterprise pair',
      body: `Two big **commercial** products, paid for by licence, and mostly found inside larger organisations:

        - **Microsoft SQL Server** fits naturally with Microsoft’s world (Windows, .NET, Azure and Excel) and comes with strong tooling for reporting and analysis.
        - **Oracle Database** has a very long history in banks, airlines and big enterprises. It is extremely capable, and famously expensive and complex.

        You will most likely meet them because your employer already runs them. Skills transfer well: it is still tables, keys and SQL. The dialects just differ in details, such as how to say "give me the first 3 rows".` },

    { kind: 'concept', title: 'SQLite: a database in a file',
      body: `**SQLite** is the odd one out, and the most widely deployed database in the world. There is **no server**: the whole database lives in a **single file**, and your program reads and writes it directly through a small library.

        That is why it is inside phones, browsers, cameras and countless desktop apps. It needs no setup, no passwords and no administrator. It is also public domain and free.

        The trade-off: it allows only **one writer at a time**, so it is a poor fit for a busy website with many users writing simultaneously. Great for apps, prototypes, tests and small sites; not for hundreds of servers sharing one database.` },

    { kind: 'compare', title: 'The six at a glance',
      body: 'A rough map. Real life is fuzzier, and every one of these has fans who would say it fits everywhere.',
      cols: ['Shape and cost', 'Typically picked for'],
      rows: [
        ['**PostgreSQL**', 'Server · free, open source', 'New projects; rich features; "just pick this"'],
        ['**MySQL**', 'Server · free (owned by Oracle)', 'Web apps; WordPress-style hosting'],
        ['**MariaDB**', 'Server · free, a MySQL fork', 'MySQL-compatible hosting'],
        ['**SQL Server**', 'Server · commercial', 'Microsoft and .NET shops'],
        ['**Oracle**', 'Server · commercial', 'Large existing enterprises'],
        ['**SQLite**', 'File · free, public domain', 'Apps, prototypes, tests, small sites']
      ] },

    { kind: 'code', title: 'Dialects: same idea, different words',
      body: 'Take "the three cheapest products". The idea is identical. The spelling is not. **Tap the highlighted lines.**',
      code: { lang: 'sql', src: `
        -- PostgreSQL, MySQL, MariaDB, SQLite
        SELECT name, price FROM products
        ORDER BY price LIMIT 3;

        -- Microsoft SQL Server
        SELECT TOP 3 name, price FROM products
        ORDER BY price;`,
        notes: {
          3: '`LIMIT` is how most of them cap the number of rows. Everything you have written in this module runs on Postgres and SQLite as is.',
          6: 'SQL Server says `TOP` instead, at the start of the `SELECT`. Same meaning, different spelling.'
        } },
      note: 'Basic `SELECT`, `JOIN`, `GROUP BY`, `INSERT` and `UPDATE` are almost identical everywhere. Differences cluster in auto-numbering ids, date functions, text functions and advanced features. This is why moving engines later is a chore, not a catastrophe.' },

    { kind: 'tip', title: 'How to choose, and why Postgres is the safe default',
      body: `Ask in this order:

        1. **What does your team already know, and what does your host offer?** A database you can operate beats a theoretically better one you cannot.
        2. **Is it an app or a shared server?** One user, one device, no admin: **SQLite**. Many users, many servers: a server engine.
        3. **Any hard constraint?** An existing Microsoft or Oracle estate, or a licence budget.
        4. **Otherwise, pick PostgreSQL.**

        Why it is the safe default: free, standards-friendly, packed with features you might need later, supported everywhere, and it scales a very long way. Choosing the common, boring option means better answers on forums and more developers who know it.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'You are starting a new web app. No special constraints, and nobody on the team has a database preference. What is the most defensible default?',
      options: ['PostgreSQL: free, standards-friendly, feature-rich and widely supported', 'Oracle, because it is the most expensive and therefore best', 'SQLite, because every server can share one file', 'Whichever one has the shortest name'],
      answer: 0,
      why: [null, 'Price is not a measure of fit. It is a licence cost.', 'SQLite allows only one writer at a time, so it is a poor shared server database.', 'A joke answer, but the instinct to "just pick" is what a default is for.'],
      explain: 'With no constraints, the common, well-supported, feature-rich option is the low-regret pick. That is PostgreSQL.' },

    { type: 'tf', after: 6, statement: 'SQLite needs a separate database server process running before your app can use it.', answer: false,
      explain: 'SQLite is a library that reads and writes a single file directly. There is no server, no network connection and no setup, which is why it appears inside phones and browsers.' },

    { type: 'match', after: 7, prompt: 'Match each database to the line that fits it best.',
      pairs: [['PostgreSQL', 'Free, feature-rich, a safe default'], ['MySQL', 'Long-time web workhorse, owned by Oracle'], ['MariaDB', 'A fork of MySQL by its original creators'], ['SQL Server', 'Microsoft’s commercial engine'], ['SQLite', 'A whole database in a single file']] },

    { type: 'bucket', prompt: 'Which engine is the most natural fit for each situation?', buckets: ['PostgreSQL', 'MySQL / MariaDB', 'SQL Server / Oracle', 'SQLite'],
      items: [['A new startup’s web app, with no special constraints', 0], ['Data stored inside a phone app, offline', 3], ['A WordPress site on cheap shared hosting', 1], ['A bank that already pays for an Oracle licence', 2], ['A company standardised on .NET and Windows servers', 2], ['Local storage for a desktop note-taking app', 3], ['An analytics-heavy product that needs rich data types and extensions', 0], ['A hosting plan that bundles a free MariaDB', 1]],
      explain: 'Match the shape first (file or server), then the existing estate and hosting. With no constraint at all, Postgres is the default.' },

    { type: 'spot', prompt: 'You are moving the shop’s queries from PostgreSQL to Microsoft SQL Server. Which line would need rewriting?',
      code: { lang: 'sql', src: `
        SELECT c.name, COUNT(o.id) AS orders
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id
        GROUP BY c.name
        ORDER BY orders DESC
        LIMIT 5;` },
      lines: [6],
      explain: '`LIMIT` is not understood by SQL Server, which uses `TOP 5` after `SELECT` instead. Joins, grouping and ordering carry across unchanged.' },

    { type: 'multi', q: 'Which are good reasons to describe PostgreSQL as a "safe default" for a new project?',
      options: ['It is free and open source', 'It sticks closely to the SQL standard', 'It is offered as a managed service by major cloud providers', 'It is the only database that supports SQL joins', 'It is the only engine that can run on a laptop'],
      answers: [0, 1, 2],
      explain: 'Cost, standards-compliance and wide hosting support all lower risk. Joins are universal, and several engines (SQLite included) run on laptops.' },

    { type: 'scenario', title: 'Pick the engine', intro: 'Three different clients ask the same question: "Which database should we use?" Each needs a different answer.',
      meters: { 'fit': 50, 'future regret': 50 },
      steps: [
        { text: 'A solo developer is building a small offline-first notes app that will be installed on thousands of phones. Each phone keeps its own data.',
          choices: [
            { label: 'SQLite: one file inside the app, nothing to run or configure', score: 2, effects: { 'fit': 25, 'future regret': 10 }, feedback: 'That is its home turf. Each phone owns its own file and nobody has to run a server on a phone.' },
            { label: 'PostgreSQL on each phone', score: 0, effects: { 'fit': -20, 'future regret': -20 }, feedback: 'Running a server process on every handset is heavy, fragile and unnecessary for one user’s notes.' },
            { label: 'Oracle, because it is the enterprise standard', score: 0, effects: { 'fit': -25, 'future regret': -25 }, feedback: 'Licence costs and complexity with no benefit for this job.' }
          ] },
        { text: 'A seed-stage startup is building a web app with accounts, orders and reporting. Nobody on the team has a strong database preference, and they will host in the cloud.',
          choices: [
            { label: 'PostgreSQL, ideally as a managed cloud service', score: 2, effects: { 'fit': 25, 'future regret': 20 }, feedback: 'The low-regret default: free, capable, widely hosted, and room to grow into JSON, extensions and more.' },
            { label: 'SQLite in a file on the one web server', score: 1, effects: { 'fit': -5, 'future regret': -10 }, feedback: 'It can work for a small site, but one writer at a time and one machine to hold the file will pinch when you add servers or traffic.' },
            { label: 'Whatever the intern used last term', score: 0, effects: { 'fit': -10, 'future regret': -15 }, feedback: 'Familiarity counts, but pick deliberately. Moving engines later is a chore.' }
          ] },
        { text: 'A large retailer’s IT department runs everything on Windows servers with .NET applications and already holds Microsoft licences. A new internal system is needed.',
          choices: [
            { label: 'SQL Server: it fits their existing tools, skills and licences', score: 2, effects: { 'fit': 25, 'future regret': 15 }, feedback: 'Constraints beat defaults. The team’s skills, tooling and support contracts all already point at SQL Server.' },
            { label: 'Rewrite their whole stack so they can use PostgreSQL', score: 0, effects: { 'fit': -15, 'future regret': -20 }, feedback: 'Postgres is a fine engine, but the cost of re-training and migrating dwarfs any benefit here.' },
            { label: 'MySQL, because it is popular for websites', score: 1, effects: { 'fit': -5 }, feedback: 'A perfectly good database, but it ignores the existing estate that would make life easier here.' }
          ] }
      ],
      outro: 'The rule: **constraints first, then shape, then the default.** The best database is the one your team can run well.' },

    { type: 'cloze', text: 'SQLite stores a whole database in a single {{file}}, and unlike PostgreSQL it has no separate {{server}} process. MariaDB began as a {{fork}} of MySQL.',
      distractors: ['table', 'cluster', 'schema'],
      explain: 'SQLite is a library reading a file; Postgres, MySQL, SQL Server and Oracle run as servers. A fork is a copy of a project that is developed separately from then on.' },

    { type: 'explain', prompt: 'A friend asks: "Which database should I use for my first web project, and why?" Give a recommendation with reasons.',
      model: 'For a web app with several users I would pick PostgreSQL. It is free, follows the SQL standard, has lots of features I might need later, and every cloud host supports it. If it were a small app or prototype on one machine, SQLite would be simpler, because the database is just a file. I would only choose something else if the team already used it or the company had a licence.',
      keywords: ['PostgreSQL', 'free', 'SQLite', 'file', 'default', 'constraint'] }
  ],

  flashcards: [
    { q: 'Why is PostgreSQL considered a safe default?', a: 'It is free, close to the SQL standard, feature-rich, battle-tested and offered by every major cloud provider, so it carries little risk for a new project.' },
    { q: 'What is MariaDB?', a: 'A fork of MySQL made by MySQL’s original creators after Oracle took over; highly compatible but developed separately.' },
    { q: 'How is SQLite different from the other engines?', a: 'It has no server: the whole database is a single file read through a library. It is only one writer at a time, so it suits apps and small sites.' },
    { q: 'Which engines are commercial and typically found in large organisations?', a: 'Microsoft SQL Server and Oracle Database.' },
    { q: 'What is a SQL dialect?', a: 'The small differences in how each engine spells SQL, such as LIMIT 3 versus TOP 3. Everyday queries are nearly identical everywhere.' }
  ],

  glossary: [
    { term: 'PostgreSQL', def: 'A free, open-source relational database server known for standards compliance, rich features and reliability.', like: 'The sensible all-rounder.', aka: ['Postgres'] },
    { term: 'MySQL', def: 'A free, open-source relational database server long popular for web applications, owned by Oracle.' },
    { term: 'MariaDB', def: 'A community fork of MySQL, largely compatible with it, started by MySQL’s original developers.' },
    { term: 'SQLite', def: 'A relational database that lives in a single file and runs inside your application with no server.', like: 'A notebook you carry, rather than a library you visit.' },
    { term: 'Fork', def: 'A copy of an open-source project that is then developed independently of the original.' },
    { term: 'SQL dialect', def: 'An engine’s own flavour of SQL: the standard core plus some differences in spelling and extras.' }
  ],

  takeaways: [
    'They all speak **SQL**; the differences are shape, cost, features and **dialect**.',
    '**PostgreSQL** is the safe default; **MySQL / MariaDB** are the web workhorses; **SQL Server / Oracle** are commercial and enterprise.',
    '**SQLite** is a database in one file: perfect for apps and tests, not for many simultaneous writers.',
    'Choose by **constraints first** (skills, hosting, licences), then shape, then default to Postgres.'
  ],

  links: [
    { label: 'About SQLite (sqlite.org)', url: 'https://www.sqlite.org/about.html' },
    { label: 'About PostgreSQL (postgresql.org)', url: 'https://www.postgresql.org/about/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-migrations', {
  eli5: 'A migration is a small, numbered file that describes one change to the database’s shape, so every machine can replay the same changes in the same order, like version control for your tables.',

  cards: [
    { kind: 'story', title: '"But it works on my laptop"',
      body: `A developer adds a \`phone\` column to \`customers\` on their own machine, writes the code that uses it, and everything works. They merge, the code deploys to production, and... the site starts throwing errors:

        > column "phone" does not exist

        Nobody ran the \`ALTER TABLE\` on the live database. It was a change made by hand, remembered by nobody, living in one person’s console history.

        Code lives in git, where every change is tracked and repeatable. The shape of the database needs the same treatment. That is what **migrations** are for.` },

    { kind: 'concept', title: 'Schema changes as versioned code',
      body: `A **migration** is a small file describing exactly one change to the schema. You keep them in the same repository as the code, numbered or time-stamped so they have a clear order:

        \`\`\`text
        migrations/
          0001_create_customers.sql
          0002_create_orders.sql
          0003_add_phone_to_customers.sql
        \`\`\`

        To build a fresh database (for a new developer, a test run, a new server), you replay them **in order** from the top. To update production, you run only the ones it has not seen yet.

        The same code version always produces the same database shape, on every machine.` },

    { kind: 'metaphor', title: 'The accountant’s ledger',
      body: `An accountant never uses correction fluid. If a number is wrong, they add a **new line** that fixes it. The ledger only grows, so anyone can read it top to bottom and reconstruct exactly what happened.

        Migrations work the same way. Mistake in migration 0003? You do **not** go back and edit it, because production may already have run it. You add 0004 that corrects it.

        The rule: **once a migration has been applied anywhere shared, it is history. Never edit it. Add a new one.**` },

    { kind: 'code', title: 'Up and down',
      body: 'Most migrations come in two halves. Formats differ between tools, but the idea is universal. **Tap the highlighted lines.**',
      code: { lang: 'sql', src: `
        -- 0003_add_phone_to_customers.sql

        -- up: apply the change
        ALTER TABLE customers ADD COLUMN phone TEXT;

        -- down: undo it
        ALTER TABLE customers DROP COLUMN phone;`,
        notes: {
          4: 'The **up** migration moves the schema forward. This runs when you deploy.',
          7: 'The **down** migration reverses it, for when you need to roll back.'
        } },
      note: 'Down migrations are a safety net with holes. Undoing "add a column" is easy. Undoing "drop a column" cannot bring back the data that was in it. Many teams write down migrations for development, but rely on backups and new forward migrations in production.' },

    { kind: 'sequence', title: 'What a migration tool does at deploy time',
      body: 'A **migration tool** automates the bookkeeping. It remembers which migrations have run by recording them in a table inside the database itself.',
      actors: ['Deploy', 'Migration tool', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'run migrations', note: 'The deploy script hands control to the migration tool, before the new code starts.' },
        { from: 1, to: 2, label: 'which have been applied?', note: 'The tool reads its own log table in the database.' },
        { from: 2, to: 1, label: 'up to 0003', dashed: true, note: 'This database has seen migrations 1, 2 and 3.' },
        { from: 1, to: 2, label: 'run 0004, 0005', note: 'The tool finds the new files in the repository and applies them in order.' },
        { from: 1, to: 2, label: 'record 0004, 0005', note: 'After each success it writes the version into the log. A re-run later will skip them.' },
        { from: 1, to: 0, label: 'done', dashed: true, note: 'Only now does the deploy continue and start the new code.' }
      ] },

    { kind: 'realworld', title: 'You do not have to build this yourself',
      body: `Every mainstream ecosystem ships a migration tool, and they all follow the same idea:

        - **Flyway** and **Liquibase** in the Java world
        - **Alembic** for Python (with SQLAlchemy), and Django’s built-in migrations
        - **Rails** has migrations built into Active Record
        - **Knex** and **Prisma Migrate** in the JavaScript world
        - **golang-migrate** for Go

        Some write the SQL for you from a description of your models; others have you write raw SQL. Many are bundled with an ORM, which is a tool covered in the next module. Either way you get numbered files, a log table and a command to run it all.` },

    { kind: 'pitfall', title: 'Why changing a live database is scary',
      body: `On your laptop, a schema change is instant and nobody is watching. On a live shop it is different:

        - **Old and new code run at the same time.** During a deploy, some servers run version 1 while others run version 2. A migration that renames \`city\` to \`town\` instantly breaks every server still asking for \`city\`.
        - **Big tables are slow to change.** On a table with millions of rows, some changes lock it for a long time while customers wait. How long depends on the engine and the change, so check its documentation.
        - **Some changes cannot be undone.** Drop a column and the data is gone.

        So you design changes to be **compatible with both versions of the code at once**.` },

    { kind: 'steps', title: 'Expand and contract: renaming without downtime',
      body: 'Never rename in one step. Break it into releases that each keep everything working. Example: rename `customers.city` to `town`.',
      steps: [
        { title: 'Expand: add the new column', body: '`ALTER TABLE customers ADD COLUMN town TEXT;` Old code ignores it. Nothing breaks.' },
        { title: 'Write to both', body: 'Deploy code that saves to **both** `city` and `town` whenever a customer changes. Old rows are still empty in `town`.' },
        { title: 'Backfill the old rows', body: 'Copy existing values across, so `town` is complete. (Next card.)' },
        { title: 'Switch reads to the new column', body: 'Deploy code that reads from `town`. At this point nothing needs `city` any more.' },
        { title: 'Contract: drop the old column', body: 'In a later release, once you are sure no running code uses it: `ALTER TABLE customers DROP COLUMN city;`' }
      ] },

    { kind: 'code', title: 'Backfills: filling in the old rows',
      body: 'A **backfill** gives existing rows a value for a new column. On a big table, do it in small batches, not one giant statement.',
      code: { lang: 'sql', src: `
        -- small table: one statement is fine
        UPDATE customers SET town = city WHERE town IS NULL;

        -- big table: work in slices, repeat until done
        UPDATE customers
        SET town = city
        WHERE town IS NULL
          AND id BETWEEN 1 AND 10000;`,
        notes: {
          2: 'The `WHERE town IS NULL` makes it safe to re-run: rows already done are skipped.',
          5: 'One huge update can lock the table for a long time and strain the database. Slices of a few thousand rows keep the shop responsive. A small script loops over the id ranges.'
        } },
      note: 'Backfills are real work with real risk. Run them off-peak, watch the load, and make them safe to stop and restart.' },

    { kind: 'tip', title: 'Habits that keep migrations boring',
      body: `Good migration hygiene is mostly rules you never break:

        - **Never edit a migration that has run anywhere shared.** Add a new one.
        - **Small and single-purpose.** One change per file.
        - **Rehearse on a copy** of production data (or a similar size) before the real run.
        - **Take a backup first**, especially for anything destructive.
        - **Adding is cheap; removing and renaming are risky.** Prefer expand/contract.
        - **Deploy the migration before the code that needs it**, and make sure the old code still works with the new schema.

        A boring migration is a successful one.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Migration 0003 has already been applied to production when you notice a typo in it. What should you do?',
      options: ['Leave 0003 alone and add a new migration 0004 that fixes it', 'Edit 0003 in place, and every database will pick it up', 'Delete 0003 from the repository', 'Run the fix by hand on production only'],
      answer: 0,
      why: [null, 'Production has already recorded 0003 as done. It will never run it again, so databases drift apart.', 'Fresh databases would now be built differently from production.', 'A hand-made change is exactly what migrations exist to prevent. Nobody else will have it.'],
      explain: 'Applied migrations are history. Fix forward with a new file, so every database ends up in the same state by replaying the same list.' },

    { type: 'tf', after: 3, statement: 'A down migration can always fully restore a database to how it was before the up migration ran.', answer: false,
      explain: 'Down migrations can undo structure, but not destroyed data. If the up migration dropped a column, rolling back recreates an empty column; the old values are gone unless you restored a backup.' },

    { type: 'order', after: 7, prompt: 'Put the expand/contract steps for renaming `city` to `town` in a safe order.',
      items: ['Add the new `town` column', 'Deploy code that writes to both columns', 'Backfill `town` for existing rows', 'Deploy code that reads from `town`', 'Drop the old `city` column'],
      explain: 'Each step keeps both old and new code working. The drop comes last, once nothing reads the old column. Doing it in a different order breaks something for someone.' },

    { type: 'bucket', prompt: 'On a busy live database, is each change generally low-risk or risky?', buckets: ['Low risk', 'Risky'],
      items: [['Add a new, optional (nullable) column', 0], ['Create a brand-new table', 0], ['Rename a column in one step', 1], ['Drop a column that the code still reads', 1], ['Run one giant UPDATE over millions of rows', 1], ['Backfill in batches of a few thousand', 0]],
      explain: 'Additions that old code can ignore are cheap. Renames and drops break code that is still running; giant single statements can lock a table. Batching keeps the load gentle.' },

    { type: 'cloze', code: true, text: `-- up
{{ALTER TABLE}} customers ADD COLUMN phone TEXT;

-- down
ALTER TABLE customers {{DROP COLUMN}} phone;`,
      distractors: ['CREATE TABLE', 'DELETE FROM', 'UPDATE'],
      explain: 'The up half adds the column with `ALTER TABLE … ADD COLUMN`; the down half reverses it with `DROP COLUMN`. `DELETE FROM` removes rows, not columns.' },

    { type: 'spot', prompt: 'This rollout plan for renaming `city` to `town` has one step that can break the live site. Which?',
      code: { lang: 'text', src: `
        Release 1: ALTER TABLE customers ADD COLUMN town TEXT;
        Release 1: app writes to both city and town
        Release 1: backfill town from city, in batches
        Release 1: ALTER TABLE customers DROP COLUMN city;
        Release 2: app reads from town` },
      lines: [4],
      explain: 'Line 4 drops `city` while the running app still reads it (reads only switch in Release 2). Dropping must come last, after nothing uses the old column.' },

    { type: 'scenario', title: 'The Monday rename', intro: 'The shop’s data team wants `orders.status` renamed to `state`, and has asked you to ship it before lunch. Orders are being placed constantly, across four app servers.',
      meters: { 'uptime': 90, 'team confidence': 60 },
      steps: [
        { text: 'The quickest idea is `ALTER TABLE orders RENAME COLUMN status TO state;` followed by a deploy. What is the problem?',
          choices: [
            { label: 'During the deploy, servers still on the old code will ask for `status`, which no longer exists, and fail', score: 2, effects: { 'team confidence': 10 }, feedback: 'Exactly: old and new code overlap for a while, so a one-step rename breaks the old half.' },
            { label: 'There is no problem: renames are instant and harmless', score: 0, effects: { 'uptime': -35, 'team confidence': -20 }, feedback: 'The rename is quick, but every server still on the old version starts throwing errors until it is replaced.' },
            { label: 'Renaming is not possible in SQL', score: 0, effects: { 'team confidence': -10 }, feedback: 'It is possible. The issue is not whether it works, but who is still using the old name.' }
          ] },
        { text: 'So how do you do it?',
          choices: [
            { label: 'Expand/contract: add `state`, write to both, backfill, switch reads, then drop `status` in a later release', score: 2, effects: { 'uptime': 5, 'team confidence': 20 }, feedback: 'Slower, boring and perfectly safe: at every step, old and new code both work.' },
            { label: 'Put up a maintenance page, rename, deploy, and take the downtime', score: 1, effects: { 'uptime': -20, 'team confidence': 0 }, feedback: 'It works, if the business accepts downtime. For a busy shop that is an expensive way to save a few releases.' },
            { label: 'Rename it directly on production and fix the code later', score: 0, effects: { 'uptime': -40, 'team confidence': -25 }, feedback: 'Customers see errors until the code catches up, and you have made a change no migration records.' }
          ] },
        { text: 'The backfill has to copy `status` into `state` for 20 million orders. How do you run it?',
          choices: [
            { label: 'In small batches by id range, off-peak, safe to stop and restart', score: 2, effects: { 'uptime': 5, 'team confidence': 15 }, feedback: 'Gentle on the database and recoverable if it needs pausing.' },
            { label: 'One giant `UPDATE` at lunchtime', score: 0, effects: { 'uptime': -30, 'team confidence': -15 }, feedback: 'A single huge statement can hold locks for a long time, blocking customers at the busiest moment.' },
            { label: 'Skip it: new orders will fill in eventually', score: 0, effects: { 'team confidence': -20 }, feedback: 'Twenty million old orders would then have an empty `state`, and every report on them would be wrong.' }
          ] }
      ],
      outro: '**Make each step compatible with both old and new code.** That is the whole secret of zero-downtime migrations.' },

    { type: 'short', q: 'What is the one-word name for filling a new column with values for the rows that already exist?', accept: ['backfill', 'backfilling', 'a backfill'], hint: 'You fill the column "back" through existing rows.',
      explain: 'A **backfill** gives existing rows a value in a column that was added later. On big tables it is done in batches.' },

    { type: 'explain', prompt: 'Explain to a teammate why we keep schema changes as migration files in git rather than running ALTER TABLE by hand.',
      model: 'A migration file is a repeatable, ordered record of each change, stored with the code. Any machine, whether a new developer’s laptop, a test run or production, can replay them and end up with the same schema, and a tool tracks which have run. Hand-run changes live in someone’s memory, so environments drift apart and deploys break with errors like "column does not exist".',
      keywords: ['repeatable', 'order', 'same schema', 'git', 'environments', 'drift'] }
  ],

  flashcards: [
    { q: 'What is a database migration?', a: 'A small versioned file describing one change to the schema. Migrations are applied in order, so every database reaches the same shape.' },
    { q: 'What are the "up" and "down" parts of a migration?', a: 'Up applies the change; down reverses it. Down cannot restore data that an up step destroyed.' },
    { q: 'Why must you never edit a migration that has already been applied?', a: 'Databases that already ran it will not run it again, so they would differ from fresh ones. Add a new migration to fix it instead.' },
    { q: 'What are the steps of expand/contract for a column rename?', a: 'Add the new column, write to both, backfill old rows, switch reads to the new column, then drop the old one in a later release.' },
    { q: 'What is a backfill, and how should a big one run?', a: 'Filling a new column for existing rows. Run it in small batches, off-peak and safe to stop and restart.' }
  ],

  glossary: [
    { term: 'Migration', def: 'A versioned file describing one change to a database schema, applied in order by a migration tool.', like: 'A new line in the accountant’s ledger.' },
    { term: 'Migration tool', def: 'Software that runs pending migrations and records which have been applied, such as Flyway, Alembic or Rails migrations.' },
    { term: 'Expand/contract', def: 'A zero-downtime pattern: first expand the schema (add the new thing), move the code over, then contract (remove the old thing).', aka: ['parallel change'], like: 'Building the new bridge before closing the old one.' },
    { term: 'Backfill', def: 'Filling a new column with values for rows that already existed.' },
    { term: 'Zero-downtime deploy', def: 'Releasing a change without making the site unavailable, which requires that old and new code both work against the same database.' }
  ],

  takeaways: [
    'Treat schema changes like code: **small, numbered migration files in git**, replayed in order.',
    '**Never edit an applied migration.** Fix forward with a new one.',
    'Old and new code overlap during a deploy, so use **expand/contract**: add, dual-write, backfill, switch reads, then drop.',
    '**Backfill in batches**, rehearse on a copy, and take a backup before anything destructive.'
  ],

  links: []
});

KS.boss('relational', {
  title: 'The Table Hydra',
  intro: 'A many-headed beast guards the data vault, and it speaks only in rows and columns. Slice through tables, keys, queries, normal forms, engines and migrations to reach the treasure.',
  questions: [
    { type: 'mcq', q: 'Which of these is NOT something a database management system does for you?',
      options: ['Guarantee your application’s own business logic has no bugs', 'Let many users read and write at once without corrupting data', 'Refuse rows that break constraints you declared', 'Find one row among millions without reading them all'],
      answer: 0,
      explain: 'A DBMS enforces the rules you declare and handles sharing, durability and fast lookups. It cannot know whether your own logic is right.' },

    { type: 'mcq', q: 'A customer can have many addresses, and each address belongs to exactly one customer. Where does the foreign key go?',
      options: ['In `addresses`, as a `customer_id` column', 'In `customers`, as a comma-separated list of address ids', 'In `customers`, as a single `address_id`', 'In a join table, because every relationship needs one'],
      answer: 0,
      why: [null, 'A list in a cell breaks the one-fact-per-cell rule.', 'That would allow only one address per customer.', 'Join tables are only for many-to-many.'],
      explain: 'One-to-many: the foreign key lives on the "many" side, so each address stores its customer’s id.' },

    { type: 'tf', statement: 'In SQL, `NULL = NULL` evaluates to true.', answer: false,
      explain: 'NULL means unknown, and comparing unknown with unknown gives unknown, not true. Use `IS NULL` to test for it.' },

    { type: 'ab', q: 'Which query lists products that have **never** been ordered?',
      a: { lang: 'sql', label: 'Query 1', src: `
        SELECT p.name
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        WHERE oi.order_id IS NULL;` },
      b: { lang: 'sql', label: 'Query 2', src: `
        SELECT p.name
        FROM products p
        INNER JOIN order_items oi ON oi.product_id = p.id
        WHERE oi.order_id IS NULL;` },
      answer: 'a',
      explain: 'A left join keeps every product and fills the order columns with NULL when nothing matches. Filtering on that NULL leaves the never-ordered ones. An inner join discards unmatched products first, so nothing is left to find.' },

    { type: 'spot', prompt: 'A developer is cleaning up the shop’s data on the live server. Which line could wipe out a whole table?',
      code: { lang: 'sql', src: `
        UPDATE customers SET city = 'York' WHERE id = 5;
        DELETE FROM order_items WHERE order_id = 104;
        DELETE FROM orders;
        INSERT INTO customers (name, email) VALUES ('Hal', 'hal@example.com');` },
      lines: [3],
      explain: '`DELETE FROM orders;` has no `WHERE`, so it targets every row. The other statements are each limited to specific rows or add one.' },

    { type: 'bucket', prompt: 'Sort each statement by what it does.', buckets: ['Reads data', 'Changes rows', 'Changes the schema'],
      items: [['`SELECT name FROM customers`', 0], ['`UPDATE products SET price = 9 WHERE id = 3`', 1], ['`ALTER TABLE customers ADD COLUMN phone TEXT`', 2], ['`INSERT INTO products ...`', 1], ['`CREATE TABLE reviews (...)`', 2], ['`SELECT COUNT(*) FROM orders`', 0]],
      explain: '`SELECT` only reads. `INSERT`, `UPDATE` and `DELETE` change the rows. `CREATE` and `ALTER TABLE` change the shape that rows live in.' },

    { type: 'cloze', code: true, text: `SELECT category, AVG(price) AS avg_price
FROM products
{{GROUP BY}} category
{{HAVING}} AVG(price) > 10;`,
      distractors: ['WHERE', 'ORDER BY', 'DISTINCT'],
      explain: '`GROUP BY` makes one pile per category, then `HAVING` filters the piles by their computed average. `WHERE` would fail because it runs before any averages exist.' },

    { type: 'multi', q: 'Which of these signs suggest a table needs normalising?',
      options: ['A customer’s city is repeated on every order row', 'Changing one fact means editing many rows', 'A product cannot be recorded until someone orders it', 'Every table has a primary key', 'Orders reference customers by `customer_id`'],
      answers: [0, 1, 2],
      explain: 'Repeated facts and the update and insert anomalies they cause are the classic symptoms. Primary keys and foreign keys are exactly what a well-normalised design uses.' },

    { type: 'order', prompt: 'Rename `price` to `price_pence` on a live table, safely. Put the steps in order.',
      items: ['Add the `price_pence` column', 'Deploy code that writes both columns', 'Backfill existing rows in batches', 'Deploy code that reads `price_pence`', 'Drop the old `price` column'],
      explain: 'Expand, dual-write, backfill, switch reads, contract. The drop is last because nothing may still be reading the old column.' },

    { type: 'match', prompt: 'Match each engine or term to its best description.',
      pairs: [['PostgreSQL', 'Free, standards-friendly default for new projects'], ['SQLite', 'A whole database in one file, no server'], ['MariaDB', 'A fork of MySQL'], ['Oracle Database', 'Commercial engine common in large enterprises'], ['Migration', 'A versioned file describing one schema change']] },

    { type: 'mcq', q: 'A login form builds `"... WHERE email = \'" + email + "\'"` by gluing strings. What is the correct fix?',
      options: ['Use a parameterised query so the value is sent separately from the SQL', 'Reject any email containing a quote mark', 'Switch to a different database engine', 'Hide the login form’s error messages'],
      answer: 0,
      why: [null, 'Blocklists miss cases, and apostrophes are legal in real names and emails. Placeholders fix the cause.', 'Every SQL engine is vulnerable to string-built queries.', 'Hiding errors does not stop the injection itself.'],
      explain: 'Placeholders keep the command and the data apart, so user input can never be interpreted as SQL.' },

    { type: 'short', q: 'Which clause filters groups after an aggregate has been computed? (one word)', accept: ['HAVING'], hint: 'It is the group-level cousin of WHERE.',
      explain: '`HAVING` filters groups after `GROUP BY` and the aggregates; `WHERE` filters individual rows before grouping.' }
  ]
});

KS.sheet('relational', {
  title: 'Relational databases & SQL cheat sheet',
  sections: [
    { title: 'Tables, keys and relationships',
      md: `| Term | Means |
|---|---|
| Table / row / column | One kind of thing / one item / one fact |
| Schema | Blueprint: tables, columns, types |
| Primary key | Unique, never empty, never changes |
| Foreign key | Holds another table's primary key |

| Relationship | How to model it |
|---|---|
| One-to-many | Foreign key on the "many" side |
| Many-to-many | Join table (e.g. \`order_items\`) |
| One-to-one | Foreign key marked \`UNIQUE\` |

**One fact per cell.** Never store a list in a column.` },

    { title: 'Constraints and data types',
      md: `| Constraint | Enforces |
|---|---|
| \`PRIMARY KEY\` | Unique row identity |
| \`NOT NULL\` | A value must exist |
| \`UNIQUE\` | No duplicates in the column |
| \`CHECK (price >= 0)\` | A custom rule holds |
| \`REFERENCES t(id)\` | Foreign key must point at a real row |

| Type | Use |
|---|---|
| \`INTEGER\` | Whole numbers |
| \`NUMERIC(10,2)\` | Money. Never \`FLOAT\` |
| \`TEXT\` / \`VARCHAR\` | Words |
| \`DATE\` / \`TIMESTAMP\` | When |` },

    { title: 'SELECT in one glance',
      md: `\`\`\`sql
SELECT name, price        -- columns
FROM products             -- table
WHERE price < 10          -- row filter
ORDER BY price DESC       -- sort
LIMIT 3;                  -- how many
\`\`\`

- Written order: SELECT, FROM, WHERE, ORDER BY, LIMIT.
- \`=\` equals, \`<>\` not equal, \`IN (...)\`, \`BETWEEN a AND b\`, \`LIKE 'P%'\`.
- \`DISTINCT\` removes duplicate rows. \`AS\` renames a column.
- **NULL is unknown**: use \`IS NULL\`. \`= NULL\` and \`<>\` skip NULL rows.
- Text in **single quotes**. Rows have no order unless you \`ORDER BY\`.` },

    { title: 'Joins and aggregates',
      md: `| Join | Keeps |
|---|---|
| \`INNER JOIN\` | Only rows matching on both sides |
| \`LEFT JOIN\` | Every left row; NULLs where no match |

| Function | Gives |
|---|---|
| \`COUNT(*)\` | Rows (\`COUNT(col)\` skips NULLs) |
| \`SUM\` / \`AVG\` | Total / average |
| \`MIN\` / \`MAX\` | Smallest / largest |

- \`GROUP BY\` = one answer per group.
- \`WHERE\` filters rows before grouping; \`HAVING\` filters groups after.
- Always write the \`ON\`. No \`ON\` = every row times every row.
- Joins can repeat rows: use \`COUNT(DISTINCT ...)\`.` },

    { title: 'Changing data and schema, safely',
      md: `| Statement | Does |
|---|---|
| \`INSERT INTO t (cols) VALUES (...)\` | Add rows |
| \`UPDATE t SET col = v WHERE ...\` | Change rows |
| \`DELETE FROM t WHERE ...\` | Remove rows |
| \`CREATE TABLE\` / \`ALTER TABLE\` | Change the shape |

**No WHERE = every row.** Before any write:

1. Run it as a \`SELECT\` with the same \`WHERE\`.
2. Check the rows. 3. Run the real thing.
4. Compare "rows affected" with your guess.
5. Have a backup or undo.

**Never build SQL by joining strings.** Use placeholders (\`$1\` or \`?\`).` },

    { title: 'Normal forms',
      md: `| Form | Rule |
|---|---|
| 1NF | One value per cell, no repeating columns |
| 2NF | Every column depends on the **whole** key |
| 3NF | Every column depends on **nothing but** the key |

Chant: *the key, the whole key, and nothing but the key.*

| Anomaly | Symptom |
|---|---|
| Update | Repeated fact changed in only some rows |
| Insert | Cannot store a fact without an unrelated one |
| Delete | Removing one fact removes another |

Splitting along keys loses nothing: a join rebuilds it. **Denormalise** only for a named reason (history, speed).` },

    { title: 'Engines and migrations',
      md: `| Engine | Remember it as |
|---|---|
| PostgreSQL | Safe default, feature-rich |
| MySQL / MariaDB | Web workhorse; MariaDB is a MySQL fork |
| SQL Server / Oracle | Commercial, enterprise |
| SQLite | One file, no server, one writer |

**Migrations:** numbered files in git, with up and down. Never edit an applied one.

**Rename without downtime (expand/contract):** add new column, write both, backfill in batches, switch reads, drop old column later.` }
  ]
});
