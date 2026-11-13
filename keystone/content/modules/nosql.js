/* Module: nosql — NoSQL & Search.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs nosql */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nosql-why', {
  eli5: 'Relational databases store neat tables, which suits a lot of data, but some data is awkwardly shaped or huge, so other kinds of database store it in different shapes instead.',

  cards: [
    { kind: 'story', title: 'The product catalogue that would not fit',
      body: `A shop sells T-shirts, laptops and wine. You set up one \`products\` table in your relational database.

        T-shirts need \`size\` and \`colour\`. Laptops need \`ram\`, \`cpu\` and \`screen_size\`. Wine needs \`vintage\` and \`grape\`. Put them all in one table and every row is mostly empty columns. Split them into three tables and every "show me everything" page needs awkward joins.

        Then the marketing team launches a new category with its own fields, every fortnight. Each time, someone has to change the table's structure and deploy it.

        Nothing is *wrong* here. It is just a poor **fit** between the shape of the data and the shape of a table. NoSQL databases exist for misfits like this.` },

    { kind: 'concept', title: 'What "NoSQL" really means',
      body: `**NoSQL** is an umbrella term for databases that are **not** the classic relational kind (tables, rows, joins, SQL). It is often read as "Not Only SQL".

        It is not one technology. It is a **crowd of very different databases**, each built for a specific shape of data or a specific job. What they share is that each gave something up (often joins, or strict rules) in return for something else: a flexible shape, extreme speed, or the ability to spread across many machines.

        So the useful question is never "SQL or NoSQL?" It is: *what shape is my data, and how will I read and write it?* This module is a tour of the options.` },

    { kind: 'compare', title: 'Where relational databases strain',
      body: 'Relational databases are superb, and Postgres is a sensible default for most projects. But three situations make them strain.',
      cols: ['What hurts', 'What NoSQL offers'],
      rows: [
        ['Shape', 'Data is nested, varied or full of connections; tables need many joins or empty columns', 'Store the shape the data already has: documents, graphs, key-value pairs'],
        ['Change', 'Changing the schema means a coordinated migration', 'Flexible or implicit schema: new fields appear without a migration'],
        ['Volume', 'One machine is eventually not enough for the writes or the data size', 'Designed from the start to spread across many machines'],
        ['Speed', 'Complex queries and strict guarantees cost time', 'Simple lookups served in a very short time, sometimes straight from memory']
      ],
      note: 'Relational databases can scale a long way and many hold JSON too. NoSQL is not "better"; it is **different trade-offs**.' },

    { kind: 'metaphor', title: 'Filing cabinet vs a box of everything',
      body: `A relational database is a **filing cabinet with printed forms**. Every form has the same boxes. It is easy to cross-reference, hard to stuff in something that does not fit a form, and if you want a new box you must reprint every form.

        A NoSQL **document** store is a **shoebox of folders**: each folder holds whatever that item needs. Quick to add something odd, but nobody is checking the contents are consistent.

        A **key-value** store is a **cloakroom**: hand over a ticket, get your coat. Very fast, but you cannot ask "show me every red coat".

        Each is great at *its* job. Where the metaphor stops: real databases can be mixed, and some do several jobs.` },

    { kind: 'concept', title: 'Flexible schemas: freedom with a hangover',
      body: `Many NoSQL databases are **schema-flexible**: two records in the same collection can have different fields, and you do not declare the fields up front.

        That is wonderful when the shape changes often or varies by record: the new wine category simply starts including \`vintage\`.

        The catch is that the schema has not gone away. It has **moved into your application code**. Your code still assumes a product has a \`price\`; if one record lacks it, you find out when something crashes. "Schemaless" really means "**schema-on-read**": the structure is applied when you read, rather than enforced when you write.

        Flexibility is a trade, not a free lunch.` },

    { kind: 'diagram', title: 'Scaling up vs scaling out',
      body: 'The other big motive is size. There are two ways to handle more data and traffic.',
      nodes: [
        { id: 'one', label: 'Scale up: a bigger machine', icon: '🖥️', x: 0, y: 0, tone: 'warn' },
        { id: 'n1', label: 'Scale out: node 1', icon: '🗄️', x: 1, y: 1, tone: 'good' },
        { id: 'n2', label: 'Node 2', icon: '🗄️', x: 2, y: 1, tone: 'good' },
        { id: 'n3', label: 'Node 3', icon: '🗄️', x: 3, y: 1, tone: 'good' },
        { id: 'app', label: 'Your application', icon: '📱', x: 2, y: 0 }
      ],
      edges: [
        { from: 'one', to: 'app', label: 'one big box', dashed: true },
        { from: 'app', to: 'n1' }, { from: 'app', to: 'n2' }, { from: 'app', to: 'n3' }
      ],
      caption: 'Scaling up has a ceiling and a price curve. Scaling out adds ordinary machines, but the data now lives in several places, which is harder. How that works is the next world: Scaling Data.' },

    { kind: 'concept', title: 'ACID versus BASE',
      body: `You met **ACID** earlier: transactions that are atomic, consistent, isolated and durable. It is a strong promise, and it gets harder to keep when data is spread across many machines.

        Many NoSQL systems choose a looser deal, nicknamed **BASE**:

        - **B**asically **A**vailable: it keeps answering, even when parts are failing.
        - **S**oft state: data may still be settling between copies.
        - **E**ventual consistency: given a little time with no new writes, all copies agree.

        The name is a deliberate pun against ACID (acid versus base). The practical meaning: you may briefly read slightly out-of-date data, in exchange for staying fast and available. Later modules cover exactly how.` },

    { kind: 'layers', title: 'The NoSQL families at a glance',
      body: 'Five big families, each answering a different question. This module visits each one, plus search.',
      layers: [
        { label: 'Document', note: 'One JSON-like document per thing. MongoDB, CouchDB.', icon: '📄', tone: 'accent' },
        { label: 'Key-value', note: 'A giant dictionary: key in, value out. Redis, DynamoDB.', icon: '🔑', tone: 'info' },
        { label: 'Wide-column and columnar', note: 'Enormous writes or enormous scans. Cassandra, ClickHouse.', icon: '🏛️', tone: 'good' },
        { label: 'Graph', note: 'Things and their relationships. Neo4j.', icon: '🕸️', tone: 'warn' },
        { label: 'Time-series and search', note: 'Timestamped streams (InfluxDB), and finding words fast (Elasticsearch).', icon: '⏱️', tone: 'muted' }
      ] },

    { kind: 'pitfall', title: 'Choosing NoSQL for the wrong reasons',
      body: `Three popular wrong reasons:

        - **"It is more modern."** Fashion is not a requirement. Relational databases are mature, and what they do well they do very well.
        - **"We might get huge."** Most products never get near the point where one well-run Postgres runs out. Picking a complex database for a problem you do not have costs you every day.
        - **"I do not want to design a schema."** The schema does not vanish; it becomes bugs in your code.

        Good reasons sound like: "our data is a graph", "we need to ingest a million sensor readings a second", "we must search free text". The last lesson, **Choosing a Database**, gives a decision method.` }
  ],

  activities: [
    { type: 'tf', after: 1, statement: '"NoSQL" describes one specific kind of database, in the way "relational" does.', answer: false,
      explain: 'It is an umbrella for many different designs (documents, key-value, graph and more) that mostly share only that they are not classic relational tables.' },

    { type: 'mcq', after: 4, q: 'A team says their NoSQL database is "schemaless", so they never need to think about structure. What is the truth?',
      options: ['The structure moves into application code, which must cope with records of different shapes', 'The database invents a perfect structure automatically', 'Structure only matters in relational databases', 'Records cannot contain more than one field'],
      answer: 0,
      why: [null, 'Nothing invents your structure; code that reads a missing field simply breaks.', 'Every program depends on the shape of its data, whatever stores it.', 'Records can hold many fields, nested, with varying structure.'],
      explain: 'Flexible schemas move the rules from the database to your code ("schema-on-read"). That is freedom when data varies, but the risk of surprises is yours.' },

    { type: 'match', after: 6, prompt: 'Match each ACID or BASE idea to its meaning.',
      pairs: [['Atomic', 'A transaction happens completely or not at all'], ['Basically available', 'It keeps answering even if parts are failing'], ['Soft state', 'Data may still be settling between copies'], ['Eventual consistency', 'Left alone, all copies end up agreeing']] },

    { type: 'bucket', prompt: 'Which problem pushes you towards which option?', buckets: ['Relational is fine', 'Consider a NoSQL family'],
      items: [['Orders, customers and invoices with clear relationships and strict correctness', 0], ['A small internal app used by fifty staff', 0], ['Reports joining many tables with ad-hoc questions', 0], ['A million sensor readings arriving every second', 1], ['Free-text search across ten million articles', 1], ['A social network where "friends of friends" is the main question', 1]],
      explain: 'Relational databases are the right default for structured, interrelated, correctness-critical data. NoSQL families earn their place for a specific shape or scale.' },

    { type: 'order', prompt: 'Put these from "stricter guarantees, harder to spread out" to "looser guarantees, easier to spread out".',
      items: ['A single relational database with full ACID transactions', 'A relational database with a read replica', 'A NoSQL cluster with tunable consistency', 'A NoSQL cluster that is eventually consistent'],
      explain: 'Each step trades guarantees for ease of spreading data around. The exact ordering depends on the product, but the direction of the trade-off is the point.' },

    { type: 'multi', q: 'Which are good reasons to reach for a NoSQL database?',
      options: ['The data is naturally a graph of connections', 'Records vary widely in shape and keep changing', 'Writes must be spread across many machines', 'Everyone says relational databases are outdated', 'You want to avoid ever thinking about your data model'],
      answers: [0, 1, 2],
      explain: 'Shape, variability and scale are real reasons. Fashion and avoiding design are not: the design work does not disappear.' },

    { type: 'cloze', text: 'Scaling {{out}} means adding more ordinary machines, while scaling {{up}} means buying a bigger one. BASE offers {{eventual}} consistency in exchange for staying available.',
      distractors: ['across', 'strong', 'atomic'],
      explain: 'Scale out is many nodes; scale up is one bigger node. BASE loosens consistency so the system can keep answering when parts fail.' },

    { type: 'scenario', title: 'The database debate', intro: 'You are on a three-person start-up building a booking app for dog walkers. The CTO wants "a proper web-scale NoSQL cluster, like the big companies".',
      meters: { 'speed to launch': 60, 'future headroom': 50 },
      steps: [
        { text: 'You expect a few thousand users in year one, with customers, bookings and payments linked together. What do you propose?',
          choices: [
            { label: 'Start with Postgres: related data and strict correctness, and it can scale a long way', score: 2, effects: { 'speed to launch': 15, 'future headroom': 10 }, feedback: 'A boring, well-understood choice that fits relational data. You can add specialised stores later if a real need appears.' },
            { label: 'A NoSQL cluster across three regions, just in case', score: 0, effects: { 'speed to launch': -30 }, feedback: 'You have bought operational complexity for a scale you may never reach, and given up joins and transactions you will miss on day one.' },
            { label: 'A flexible document store, so no one has to design tables', score: 1, effects: { 'speed to launch': 5, 'future headroom': -5 }, feedback: 'Fast to start, but bookings, customers and payments are strongly related. The design work returns later as awkward code and inconsistent data.' }
          ] },
        { text: 'A year on, the app wants a "search walkers by name or bio" box, with typos tolerated. What now?',
          choices: [
            { label: 'Add a search engine alongside Postgres for that one feature', score: 2, effects: { 'future headroom': 20 }, feedback: 'The right tool for a specific job. Postgres stays the source of truth; the search engine is a specialist helper, as the search lesson will show.' },
            { label: 'Migrate everything to a different database to get search', score: 0, effects: { 'speed to launch': -20, 'future headroom': -10 }, feedback: 'A huge migration to solve one feature. Adding one specialised store is far less risky.' },
            { label: 'Do `LIKE \'%word%\'` and hope', score: 1, effects: { 'future headroom': -5 }, feedback: 'Fine for a hundred walkers, painful at a million, and it cannot cope with typos or ranking. Fine to start; plan for better.' }
          ] }
      ],
      outro: 'The pattern to remember: choose from the problem. Boring by default, specialised when there is a real, named need.' },

    { type: 'explain', prompt: 'Explain in your own words why "NoSQL" is not one thing and when you would reach for one of its families.',
      model: 'NoSQL is an umbrella for many different databases, such as document, key-value, wide-column, graph, time-series and search, each built for a particular data shape or job. They usually trade away joins or strict ACID guarantees for flexibility, speed or the ability to spread over many machines. I would reach for one when my data genuinely fits that shape, such as a graph or a stream of sensor readings, or when I need scale one machine cannot give, not just because it is fashionable.',
      keywords: ['different', 'shape', 'trade', 'ACID', 'scale', 'flexible', 'job'] }
  ],

  flashcards: [
    { q: 'What does "NoSQL" mean?', a: 'An umbrella term for databases that are not classic relational tables: documents, key-value, wide-column, graph, time-series, search. Often read as "Not Only SQL".' },
    { q: 'What is a flexible ("schemaless") schema really?', a: 'Schema-on-read: the structure is not enforced by the database but assumed by your application code.' },
    { q: 'What is the difference between scaling up and scaling out?', a: 'Scaling up means a bigger single machine; scaling out means adding more machines and spreading the data across them.' },
    { q: 'What does BASE stand for?', a: 'Basically Available, Soft state, Eventual consistency: a looser alternative to ACID.' },
    { q: 'Name the main NoSQL families.', a: 'Document, key-value, wide-column and columnar, graph, time-series, and search.' }
  ],

  glossary: [
    { term: 'NoSQL', def: 'An umbrella term for non-relational databases built for particular data shapes or scale, often trading joins or strict consistency for flexibility and speed.', like: 'A toolbox of specialist tools rather than one all-purpose spanner.' },
    { term: 'Schema-on-read', def: 'Applying structure when data is read, not enforcing it when it is written. The meaning of "schemaless".', like: 'Nobody checks the form when you hand it in; you find the missing box when you try to process it.' },
    { term: 'Scale out', def: 'Handling more load by adding more machines, rather than buying a bigger one.', aka: ['horizontal scaling'], like: 'Opening more checkout tills instead of training one cashier to be faster.' },
    { term: 'BASE', def: 'Basically Available, Soft state, Eventual consistency: a looser model than ACID, suited to systems spread across machines.', like: 'A busy canteen that keeps serving while updating the menu board a little late.' },
    { term: 'Eventual consistency', def: 'A promise that if no new writes arrive, all copies of the data will eventually agree.', like: 'News spreading round a village: everyone knows soon, but not at the same instant.' }
  ],

  takeaways: [
    '**NoSQL is a family of different databases**, each trading something (often joins or strict ACID) for flexibility, speed or scale.',
    'Flexible schemas move the structure **into your code**: freedom, but not a free lunch.',
    '**BASE** (available, soft state, eventually consistent) is the looser cousin of ACID.',
    'Choose from the **shape of the data and the job**. Relational is a fine default.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nosql-document', {
  eli5: 'A document database stores each thing, such as a whole blog post with its comments, as one self-contained JSON-like document that you can read or write in a single go.',

  cards: [
    { kind: 'concept', title: 'One thing, one document',
      body: `Think about an order. In a relational database it is spread out: an \`orders\` row, several \`order_items\` rows, an address row, a customer row. To show the order page you gather them with joins.

        A **document database** stores the order the way you *think* of it, as **one self-contained document**:

        \`\`\`json
        { "id": 1042, "customer": "Sam",
          "items": [ { "sku": "TEE-RED", "qty": 2 } ],
          "address": { "city": "Leeds" } }
        \`\`\`

        It looks like the JSON you already met in APIs: fields, nested objects, arrays. Documents live in **collections** (like tables), and each has a unique \`_id\`. Read one document and you have everything on the page, in one go.` },

    { kind: 'metaphor', title: 'The patient folder',
      body: `A doctor's surgery keeps a **folder per patient**. Open it and everything is in there: history, allergies, letters, test results. Pulling one patient's folder is one trip to the shelf.

        A relational database is closer to a hospital where the allergies are in one building, letters in another and results in a third, joined by patient number. Superb for questions across *all* patients ("how many have this allergy?"), slower for "tell me about this one patient".

        Where the metaphor stops: documents are not locked inside a folder. You can query across all folders in a collection, and you can index their fields.` },

    { kind: 'code', title: 'Talking to MongoDB',
      body: 'MongoDB is the best-known document database. This shell-style example inserts and queries documents. **Tap the lines.**',
      code: { lang: 'js', src: `
        db.products.insertOne({
          name: 'Red hoodie',
          price: 35,
          sizes: ['S', 'M', 'L']
        });

        db.products.find({ price: { $lt: 50 } });

        db.products.updateOne(
          { name: 'Red hoodie' },
          { $set: { price: 30 } }
        );`,
        notes: {
          1: 'No table to create first: inserting into `products` creates the collection on the fly.',
          4: 'A field can hold an **array**. In a relational database this would need its own table.',
          7: 'A query is itself a JSON-style document. `$lt` means "less than". Instead of SQL, you describe the shape you want back.',
          11: '`$set` changes just one field. Documents are updated in place, not replaced wholesale.'
        } },
      note: 'MongoDB also has an "aggregation pipeline" for grouping and joining-like operations, and supports multi-document transactions, though they are used more carefully than in relational databases.' },

    { kind: 'concept', title: 'Embedding: keep it together',
      body: `The central design question: when two things are related, do you **embed** one inside the other, or keep them in separate documents?

        **Embedding** puts the related data inside the parent:

        \`\`\`json
        { "title": "Why tests matter",
          "comments": [
            { "by": "Alex", "text": "Great post" } ] }
        \`\`\`

        Good when the child data is **always read with the parent** and **belongs to it**, and the list stays **small**. One read gets all of it, and a single document is updated as a unit. A blog post's few comments or an order's line items are classic cases.` },

    { kind: 'concept', title: 'Referencing: store the link',
      body: `**Referencing** keeps the related data in its own document and stores its \`_id\`, like a foreign key:

        \`\`\`json
        { "title": "Why tests matter", "authorId": "u77" }
        \`\`\`

        Good when the related thing is **shared**, **large**, **unbounded**, or **changes independently**. An author appears on a thousand posts; if their name were embedded in every one, changing it means a thousand updates. A famous post with 400,000 comments should not live in one document, which has a size limit and gets slow to rewrite.

        The price: showing the post with its author now takes **two reads**, because most document databases do not join the way SQL does.` },

    { kind: 'compare', title: 'Embed or reference?',
      body: 'A quick rule of thumb. Ask these questions about the relationship.',
      cols: ['Embed', 'Reference'],
      rows: [
        ['Read together?', 'Almost always', 'Often separately'],
        ['How many children?', 'A few, bounded', 'Many or unbounded'],
        ['Shared by many parents?', 'No, belongs to one', 'Yes'],
        ['Changes independently?', 'No', 'Yes'],
        ['Cost', 'Duplicated if copied; document grows', 'Extra read to follow the link']
      ],
      note: 'The usual advice is to design documents around **how you read them**. Contrast that with relational design, which starts from normalising the data.' },

    { kind: 'pitfall', title: 'The schema hangover',
      body: `Flexible schemas feel great for a month. Then:

        - Old documents have \`"phone"\`, newer ones \`"phoneNumber"\`, and a few have both.
        - Some prices are numbers, some are strings like \`"£35"\`.
        - Code is full of \`if (doc.address && doc.address.city)\` checks.

        Nobody enforces the shape, so the data **drifts**. Fixes: agree a shape and write it down; use the database's optional validation rules (MongoDB can validate documents against a schema); and plan **migrations** for old documents when the shape changes, even though the database will not force you to.` },

    { kind: 'realworld', title: 'CouchDB and sync',
      body: `**CouchDB** is another document database with a different personality. It stores JSON documents too, but its party trick is **replication and sync**: two copies of a database, say one on a server and one on a phone, can exchange changes in both directions, even if the phone was offline for a week.

        It keeps a revision history of each document so that it can detect conflicting edits (two copies edited the same document while apart) and let your application decide what to do.

        That makes it a natural fit for "offline-first" apps. (Some mobile and browser libraries speak the same sync protocol.) MongoDB, by contrast, is the general-purpose workhorse with rich queries; most teams meet it first.` },

    { kind: 'tip', title: 'When a document store fits',
      body: `Documents suit data that is **naturally hierarchical**, **varies by record**, and is mostly **read and written as a whole**: content management, product catalogues, user profiles, event payloads.

        They suit less well data that is **highly interconnected** (lots of many-to-many links) or that needs **strong cross-record consistency** all the time, such as double-entry accounting.

        Many teams find that a hybrid works: a relational database for the core, and documents (or a JSON column) for the odd, variable corner. Modern relational databases store JSON too, so "document-ish" is not exclusive to document stores.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What does a document database give you that a plain set of tables does not?',
      options: ['A whole self-contained thing stored and read together, with nested fields and arrays', 'Guaranteed relationships between every record', 'Faster joins across many collections', 'A fixed structure that rejects anything unexpected'],
      answer: 0,
      why: [null, 'Relationships are your job in documents; relational databases enforce them.', 'Most document stores are not built for heavy joins.', 'Flexible shape is the default; strictness is opt-in.'],
      explain: 'A document holds the thing as you think of it, nested data included, so one read returns it all. That is the appeal and the trade.' },

    { type: 'bucket', after: 5, prompt: 'Embed it, or reference it?', buckets: ['Embed', 'Reference'],
      items: [['The line items of an order', 0], ['A blog post’s five most recent comments, shown with it', 0], ['An author shared by a thousand posts', 1], ['A product’s hundreds of thousands of reviews', 1], ['The shipping address copied onto one order', 0], ['A user profile referenced from many teams’ documents', 1]],
      explain: 'Embed small, bounded data that belongs to one parent and is read with it. Reference data that is shared, huge, unbounded or changes by itself.' },

    { type: 'spot', after: 6, prompt: 'This is the “schema hangover”. Tap the document whose shape will break code that expects `price` to be a number.',
      code: { lang: 'json', src: `
        { "name": "Red hoodie", "price": 35 }
        { "name": "Blue hoodie", "price": "£35" }
        { "name": "Green hoodie", "price": 35 }` },
      lines: [2],
      explain: 'The second document stores the price as text with a currency sign. Anything that sorts or adds prices will misbehave. The database allowed it because nobody asked it to check.' },

    { type: 'ab', q: 'Which document design is better for a blog post that may get thousands of comments?',
      a: { lang: 'json', label: 'Embed all comments', src: `
        { "title": "Hello",
          "comments": [ /* thousands of
            objects live in here */ ] }` },
      b: { lang: 'json', label: 'Reference them', src: `
        // posts
        { "_id": "p1", "title": "Hello" }
        // comments
        { "postId": "p1", "text": "Nice" }` },
      answer: 'b',
      explain: 'An unbounded list inside one document makes it huge, slow to rewrite and eventually too big for the limit. Comments in their own collection, linked by `postId`, grow without limit.' },

    { type: 'tf', statement: 'Because a document database has flexible schemas, you never need to plan for changes to the shape of your data.', answer: false,
      explain: 'Old documents keep their old shape. Without validation and planned migrations the data drifts and code fills up with special cases.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Collection', 'A group of documents, like a table'], ['Embedding', 'Nesting related data inside the parent document'], ['Referencing', 'Storing another document’s id as a link'], ['`$set` (MongoDB)', 'Change just one field of a document'], ['CouchDB sync', 'Two copies exchange changes, even after being offline']] },

    { type: 'short', q: 'Which document database, famous for replication between server and offline devices, is the other one named in this lesson besides MongoDB?', accept: ['couchdb', 'couch'], hint: 'Its name starts with a piece of living-room furniture.',
      explain: 'CouchDB keeps revisions of each document so copies can sync both ways and conflicts can be detected.' },

    { type: 'scenario', title: 'Modelling a recipe app', intro: 'You are building a recipe app on a document database. A recipe has a title, steps, ingredients, and an author. Many recipes share one author, and thousands of people leave ratings.',
      meters: { 'read speed': 60, 'data safety': 60 },
      steps: [
        { text: 'How do you store the steps and the ingredients list?',
          choices: [
            { label: 'Embed them inside the recipe document', score: 2, effects: { 'read speed': 15 }, feedback: 'They belong to one recipe, are always read with it, and are a short list. One read gets the whole recipe page.' },
            { label: 'One document per step, referenced from the recipe', score: 0, effects: { 'read speed': -20 }, feedback: 'You would need a dozen reads for every recipe page, and you are rebuilding a relational database by hand.' },
            { label: 'Store everything as one long text string', score: 0, effects: { 'data safety': -20 }, feedback: 'You can no longer query "recipes with eggs", and every edit means rewriting and re-parsing the lot.' }
          ] },
        { text: 'And the author, and the thousands of ratings?',
          choices: [
            { label: 'Reference the author by id; keep ratings in their own collection', score: 2, effects: { 'data safety': 15 }, feedback: 'The author is shared and changes independently; ratings are unbounded. Referencing avoids both duplicated edits and a bloated document.' },
            { label: 'Embed author details and all ratings in every recipe', score: 0, effects: { 'data safety': -20, 'read speed': -10 }, feedback: 'Changing an author’s name now means updating every recipe, and popular recipes balloon in size.' },
            { label: 'Embed the author, reference the ratings', score: 1, effects: { 'data safety': 0 }, feedback: 'Ratings are right. Copying the author works if the name rarely changes, but it will drift when it does. Referencing is safer.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain how you would decide whether to embed or reference related data in a document database, using an example.',
      model: 'I would ask how the data is read and how big it gets. If child data belongs to one parent, is read with it and stays small, like an order\'s line items, I embed it so one read returns everything. If the related data is shared, huge, unbounded or changes independently, like an author on many posts or thousands of comments, I store it separately and reference it by id, accepting an extra read. I design around how I read the data, not around normalising it.',
      keywords: ['embed', 'reference', 'read together', 'shared', 'unbounded', 'extra read', 'order'] }
  ],

  flashcards: [
    { q: 'What is a document database?', a: 'A database that stores each thing as a self-contained JSON-like document, grouped in collections, with nested fields and arrays.' },
    { q: 'When should you embed related data?', a: 'When it belongs to one parent, is read with it and stays small and bounded, such as an order\'s line items.' },
    { q: 'When should you reference instead?', a: 'When the data is shared, large, unbounded or changes independently, at the cost of an extra read.' },
    { q: 'What is the "schema hangover"?', a: 'Because the database does not enforce shape, documents drift over time and application code fills with special cases. Use validation and plan migrations.' },
    { q: 'What is CouchDB known for?', a: 'Replication and sync between copies (server and offline devices), with revisions to detect conflicting edits.' }
  ],

  glossary: [
    { term: 'Document', def: 'A self-contained, JSON-like record with fields, nested objects and arrays, stored and read as a unit.', like: 'A patient folder with everything inside.' },
    { term: 'Collection', def: 'A group of documents of a similar kind in a document database, roughly like a table.', like: 'The filing-cabinet drawer for all the patient folders.' },
    { term: 'Embedding', def: 'Nesting related data inside its parent document so one read returns both.', like: 'Keeping the test results inside the patient’s folder.' },
    { term: 'Referencing', def: 'Storing the id of a related document rather than a copy, and following it with another read.', like: 'A note in the folder saying "see the specialist’s file, number 77".' },
    { term: 'MongoDB', def: 'A widely used general-purpose document database with a rich JSON-style query language.', like: 'The all-rounder of the document world.' }
  ],

  takeaways: [
    'A document store keeps **one thing as one JSON-like document**: one read, nested data included.',
    '**Embed** small data that belongs to one parent; **reference** shared, huge or independently changing data.',
    'Design around **how you read**. Flexible schemas bring a **hangover**: validate and plan migrations.',
    '**MongoDB** is the general workhorse; **CouchDB** shines at syncing copies, even offline.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nosql-keyvalue', {
  eli5: 'A key-value store is a giant dictionary: you hand it a key and it hands back the value, extremely quickly, but you can only look things up by that key.',

  cards: [
    { kind: 'metaphor', title: 'The cloakroom',
      body: `At a theatre cloakroom you hand over a coat and get a **numbered ticket**. Later you hand back the ticket and the attendant fetches your coat in seconds, without looking inside any pockets.

        That is the whole **key-value** model: the ticket is the **key**, the coat is the **value**. Two operations do almost everything: **put** (store this under that key) and **get** (give me what is under that key).

        It is absurdly fast and simple. But the attendant cannot answer "bring me every red coat" or "who has the biggest coat?". There is no looking around, only fetching by ticket.

        You already know this shape: it is a JavaScript object or a Python dictionary, just living in a database.` },

    { kind: 'code', title: 'The simplest possible database',
      body: 'Redis is the best-known key-value store. These are real commands. **Tap the lines.**',
      code: { lang: 'sh', src: `
        SET session:abc123 "user=42"
        GET session:abc123
        SET session:abc123 "user=42" EX 1800
        INCR page:views
        DEL session:abc123`,
        notes: {
          1: '`SET key value`. Keys are just strings; the `session:` prefix is a naming habit, not a feature.',
          2: '`GET key` returns the value. If the key does not exist, you simply get nothing back.',
          3: '`EX 1800` gives the key a **time-to-live**: it deletes itself after 1,800 seconds. Perfect for sessions and caches.',
          4: '`INCR` adds one to a number **atomically**: even if a thousand clients do it at once, none is lost.',
          5: '`DEL` removes the key.'
        } } },

    { kind: 'concept', title: 'Why Redis is so fast',
      body: `Redis keeps its data **in memory** (RAM). RAM is orders of magnitude faster than a disk, so a lookup takes a tiny fraction of the time of a disk-based database.

        The trade-off is obvious: RAM is smaller and pricier than disk, and it is wiped when the power goes. Redis can optionally write snapshots or a log to disk so it can recover, but you choose how much safety you want, and "Redis is the *only* copy of important data" is a design to think about hard.

        That is why Redis is most often used for things that are **fast, temporary or rebuildable**: caches, sessions, rate-limit counters, leaderboards, queues. (Caching gets its own module later.)` },

    { kind: 'layers', title: 'Redis is more than strings',
      body: 'Redis values are not only text. It ships ready-made data structures, each with its own commands, so the server does the work for you.',
      layers: [
        { label: 'String', note: 'A value or a number. Counters with `INCR`. Cached pages.', icon: '🔤', tone: 'accent' },
        { label: 'Hash', note: 'A small record of fields under one key: a user\'s name, email and plan.', icon: '🧾', tone: 'info' },
        { label: 'List', note: 'An ordered list: push to one end, pop from the other. A simple queue.', icon: '📜', tone: 'good' },
        { label: 'Set', note: 'Unique items with no order: who has liked this post?', icon: '🧺', tone: 'warn' },
        { label: 'Sorted set', note: 'Unique items, each with a score, kept in order. Leaderboards.', icon: '🏆', tone: 'accent' }
      ] },

    { kind: 'code', title: 'A leaderboard in three lines',
      body: 'Sorted sets show why structures matter: ranking is built in. **Tap the lines.**',
      code: { lang: 'sh', src: `
        ZADD scores 4200 "sam"
        ZADD scores 5100 "alex"
        ZREVRANGE scores 0 2 WITHSCORES`,
        notes: {
          1: '`ZADD` puts a member in with a score. Adding "sam" again with a new score just updates it.',
          2: 'The set is kept sorted for you as items arrive. No `ORDER BY`, no sort step.',
          3: '"The top three, highest first, with scores". Redis does the sorting; your app just asks.'
        } },
      note: 'Redis is single-threaded for running commands, which keeps each command atomic and simple. Replication and clustering exist for scale and safety; they are covered in Scaling Data.' },

    { kind: 'concept', title: 'DynamoDB: key-value that scales out',
      body: `**DynamoDB** is Amazon's managed key-value and document database. Unlike Redis, it lives on disk, is spread across many machines for you, and aims for steady, predictable speed whether you hold a million items or a billion.

        Its key idea is a two-part primary key:

        - The **partition key** decides *which machine* holds the item. Items with the same partition key live together.
        - The optional **sort key** orders items **within** that partition, so you can fetch ranges.

        An orders table might use \`customerId\` as the partition key and \`orderDate\` as the sort key. "Show Sam's orders from March" is then a quick, targeted read of one partition.` },

    { kind: 'diagram', title: 'Partition key and sort key',
      body: 'The partition key picks the machine; the sort key orders the items inside it.',
      nodes: [
        { id: 'req', label: 'customerId = "sam"', icon: '🔎', x: 1, y: 0, tone: 'accent' },
        { id: 'p1', label: 'Partition A', icon: '🗄️', x: 0, y: 1 },
        { id: 'p2', label: 'Partition B (sam)', icon: '🗄️', x: 1, y: 1, tone: 'good' },
        { id: 'p3', label: 'Partition C', icon: '🗄️', x: 2, y: 1 },
        { id: 'rows', label: 'sam: Jan, Feb, Mar…', x: 1, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'req', to: 'p2', label: 'hash picks one' },
        { from: 'p2', to: 'rows', label: 'sorted by date' }
      ],
      caption: 'One partition holds all of Sam’s orders, kept in date order. A request goes straight to it without searching the rest.' },

    { kind: 'steps', title: 'Design from the access patterns first',
      body: 'This is the biggest mindset shift. A relational design starts from the **data** and asks questions later. With DynamoDB (and key-value stores generally) you start from the **questions**.',
      steps: [
        { title: 'List every question the app will ask', body: '"Orders for a customer, newest first." "One order by id." "All orders placed today." Be concrete.' },
        { title: 'Choose keys so each question is one targeted read', body: 'The partition key should be whatever you always know when asking. The sort key should be what you filter or order by.' },
        { title: 'Accept duplication', body: 'If a second question needs a different key, you store the data a second time (or add a secondary index) arranged for that question.' },
        { title: 'Be wary of questions you did not plan', body: 'Ad-hoc queries ("every order over £100 last year") may mean scanning everything, which is slow and costly. Decide that now, not in production.' }
      ] },

    { kind: 'pitfall', title: 'Hot keys and the full scan',
      body: `Two classic mistakes with key-value designs.

        **A hot key.** If one partition key gets a huge share of traffic (say \`country = "UK"\` when most users are British), one machine does all the work while the others idle. A good partition key spreads requests **evenly**.

        **The accidental scan.** Asking something the keys were not designed for forces the database to read every item. It works fine in testing with a hundred rows and falls over in production with a hundred million.

        Both come from the same root: choosing keys without first writing down the access patterns.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What can a pure key-value store do easily, and what can it not do easily?',
      options: ['Fetch a value by its key; it cannot easily answer "find everything matching a condition"', 'Join any two tables; it cannot store numbers', 'Run any SQL query; it cannot be fast', 'Search the inside of values; it cannot store text'],
      answer: 0,
      why: [null, 'It has no tables to join, and it stores numbers fine.', 'Key-value stores generally do not speak SQL, and they are typically very fast.', 'Looking inside values is exactly what a plain key-value store does not do.'],
      explain: 'Fetching by key is its superpower. Anything that needs looking *around* (conditions, ranges, joins) has to be planned into the keys or handled elsewhere.' },

    { type: 'match', after: 3, prompt: 'Match each Redis structure to a typical use.',
      pairs: [['String', 'A counter or a cached value'], ['Hash', 'The fields of one user record'], ['List', 'A simple queue of jobs'], ['Set', 'Unique people who liked a post'], ['Sorted set', 'A leaderboard']] },

    { type: 'tf', after: 6, statement: 'In DynamoDB, the sort key decides which machine an item is stored on.', answer: false,
      explain: 'The **partition key** picks the machine. The sort key orders items *within* a partition so you can fetch ranges efficiently.' },

    { type: 'short', q: 'Which Redis option makes a key delete itself after a set number of seconds? Give the abbreviation used with SET.', accept: ['ex', 'ttl', 'EX'], hint: 'Two letters, short for "expire".',
      explain: '`SET key value EX 1800` sets a time-to-live of 1,800 seconds, ideal for sessions and caches.' },

    { type: 'ab', q: 'Which is the better design for the question "show a customer’s orders, newest first"?',
      a: { lang: 'text', label: 'Key by order id only', src: `
        partition key: orderId
        (to find a customer's orders,
         scan every order)` },
      b: { lang: 'text', label: 'Key by customer', src: `
        partition key: customerId
        sort key: orderDate
        (one targeted read, newest first)` },
      answer: 'b',
      explain: 'The question gives us the customer id, so it should be the partition key, with the date as the sort key for ordering. The first design forces a scan of everything.' },

    { type: 'bucket', prompt: 'Good fit for a key-value store, or better elsewhere?', buckets: ['Key-value fits', 'Better elsewhere'],
      items: [['Storing a login session by session id', 0], ['A counter of page views per article', 0], ['A cache of rendered pages', 0], ['"Find all customers in Leeds who spent over £500"', 1], ['Reports joining orders, customers and products', 1], ['Free-text search through product descriptions', 1]],
      explain: 'Key-value shines when you always know the key. Ad-hoc conditions, joins and text search need other tools.' },

    { type: 'spot', prompt: 'A DynamoDB table uses `country` as its partition key for a worldwide app where most users are in one country. Tap the line that creates the hot-key problem.',
      code: { lang: 'text', src: `
        Table: users
        partition key: country
        sort key: userId
        99% of traffic is from "UK"` },
      lines: [2],
      explain: 'All UK users share one partition key, so they all land on one machine while the rest sit idle. A key with many evenly used values (like the user id) spreads the load.' },

    { type: 'order', prompt: 'Put the steps of designing a DynamoDB-style table in order.',
      items: ['List every question the application will ask', 'Choose partition and sort keys so each question is a targeted read', 'Accept some duplicated data or add an index for a second question', 'Check that no common question needs a full scan'],
      explain: 'You work from the questions to the keys, not from the data to the questions. Checking for scans at the end catches the questions you forgot to design for.' },

    { type: 'cloze', text: 'Redis is fast because it keeps data in {{memory}}. A key with a {{time-to-live}} deletes itself, and an {{atomic}} INCR never loses a count even when many clients increment at once.',
      distractors: ['a log', 'sorted', 'replicated'],
      explain: 'Memory is far faster than disk; TTLs suit caches and sessions; atomic commands make counters safe without extra locking.' },

    { type: 'explain', prompt: 'Explain what "design from access patterns first" means for a key-value store like DynamoDB, and why it matters.',
      model: 'You write down every question the app will ask, then choose the partition and sort keys so each question is one targeted read, even if that means storing data in more than one arrangement. It matters because these stores cannot flexibly query on anything; a question the keys do not support turns into a scan of everything, which is slow and costly at scale. Relational design starts from the data and asks questions later.',
      keywords: ['questions', 'partition key', 'sort key', 'targeted read', 'scan', 'duplicate', 'access patterns'] }
  ],

  flashcards: [
    { q: 'What are the basic operations of a key-value store?', a: 'Put (store a value under a key) and get (fetch the value for a key), plus delete.' },
    { q: 'Why is Redis so fast?', a: 'It keeps its data in memory. The trade-off is that RAM is smaller and pricier than disk, and the data must be protected if the machine restarts.' },
    { q: 'Name the Redis data structures covered here.', a: 'Strings, hashes, lists, sets and sorted sets.' },
    { q: 'What are DynamoDB\'s partition key and sort key?', a: 'The partition key decides which machine holds the item; the sort key orders items within that partition.' },
    { q: 'What does "design from access patterns" mean?', a: 'List the questions you will ask first, then choose keys so each question is one targeted read.' },
    { q: 'What is a hot key?', a: 'A partition key that receives a disproportionate share of traffic so one machine does most of the work.' }
  ],

  glossary: [
    { term: 'Key-value store', def: 'A database that stores a value under a unique key and retrieves it by that key, with no looking inside values.', like: 'A cloakroom: ticket in, coat out.' },
    { term: 'Redis', def: 'An in-memory data store with built-in structures such as lists, sets and sorted sets, often used for caching, sessions and leaderboards.', like: 'A very fast whiteboard in the middle of the office.' },
    { term: 'Time-to-live', def: 'A lifetime attached to a key, after which the store deletes it automatically.', aka: ['TTL'], like: 'A "use by" date that tidies itself.' },
    { term: 'Partition key', def: 'The part of the primary key that determines which machine stores an item, in stores such as DynamoDB.', like: 'The street name that tells the post office which depot gets the letter.' },
    { term: 'Sort key', def: 'The part of the key that orders items within one partition so ranges can be read efficiently.', like: 'The house number order along the street.' }
  ],

  takeaways: [
    'A key-value store does **get and put by key**, very fast, and little else.',
    '**Redis**: in memory, rich structures (hash, list, set, sorted set), TTLs: caches, sessions, counters, leaderboards.',
    '**DynamoDB**: the partition key picks the machine, the sort key orders items within it.',
    '**Design from access patterns first**, spread load evenly, and avoid questions that need a scan.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nosql-column', {
  eli5: 'Wide-column databases spread huge numbers of writes across many machines by key, while columnar databases store each column together so they can scan billions of rows quickly.',

  cards: [
    { kind: 'concept', title: 'Two ideas with confusingly similar names',
      body: `"Column" gets used for two quite different kinds of database, and the names collide.

        **Wide-column stores** (Cassandra, ScyllaDB) are built to **swallow enormous numbers of writes**, spread across many machines, and read them back by key.

        **Columnar databases** (ClickHouse) are built for **analytics**: scanning billions of rows to answer questions like "total sales per country last year".

        Same word, different jobs. We take them one at a time, then compare **row storage** with **column storage**, which explains the second.` },

    { kind: 'concept', title: 'Wide-column: partitions of sorted rows',
      body: `A wide-column store looks a little like SQL: tables, rows, columns. The twist is how data is **placed**.

        Each row has a **partition key**. The key decides which machines hold that row, and **all rows with the same partition key live together**. Inside a partition, rows are kept in order by a **clustering column**.

        For sensor readings: partition key = \`sensor_id\`, clustering = \`time\`. All of sensor 7's readings sit together, in time order, so "the last hour for sensor 7" is one fast read from one place.

        As with DynamoDB, **you design the table around the query**, and joins are not available.` },

    { kind: 'code', title: 'A table in Cassandra Query Language',
      body: 'Cassandra uses CQL, which looks deliberately like SQL. **Tap the lines.**',
      code: { lang: 'sql', src: `
        CREATE TABLE readings (
          sensor_id  int,
          ts         timestamp,
          temp       double,
          PRIMARY KEY ((sensor_id), ts)
        ) WITH CLUSTERING ORDER BY (ts DESC);

        SELECT * FROM readings
        WHERE sensor_id = 7 AND ts > '2025-03-01';`,
        notes: {
          5: 'The primary key has two parts. `(sensor_id)` is the **partition key**: it picks the machines. `ts` is the **clustering column**: it orders rows inside the partition.',
          6: 'Newest first within each partition, which is what dashboards usually want.',
          9: 'A query must name the partition key. Asking "all readings above 30 degrees" without it would mean visiting every machine, so Cassandra pushes you away from that.'
        } } },

    { kind: 'metaphor', title: 'A warehouse of labelled lockers',
      body: `Imagine a huge locker room, with the lockers divided between many staff. Your **locker number** (partition key) decides which member of staff looks after your stuff.

        Dropping something off is trivially quick: go to the person who owns your number and put it in. No central desk, no queue, no need to ask permission from anyone else. Add more staff and the room just handles more people.

        But "find every locker containing a blue jacket" means asking **every member of staff**. That is why this style handles gigantic write volumes so well, and ad-hoc searching so badly.

        Where the metaphor stops: real clusters keep several copies of each locker for safety.` },

    { kind: 'realworld', title: 'Cassandra and ScyllaDB',
      body: `**Cassandra** (from Facebook's work, now an Apache project) is a wide-column store designed with **no single boss node**: every node is a peer, and the data is automatically spread and copied across them. That makes writes fast and the cluster hard to knock over, including across data centres.

        **ScyllaDB** is a re-implementation that speaks the same CQL and is written for lower overhead per machine. If you learn Cassandra's model, you know Scylla's.

        Typical uses: huge streams of events, messages, activity feeds, sensor data and anywhere "always writable, always up" matters more than rich queries. The price is design discipline, and weaker guarantees than a single SQL database, which the Scaling Data world explains.` },

    { kind: 'sequence', title: 'Why writes are cheap here',
      body: 'A write does not hunt for a spot on disk. It is simply **appended**, then sorted later.',
      actors: ['App', 'Node', 'Disk'],
      steps: [
        { from: 0, to: 1, label: 'INSERT reading', note: 'The app sends the write to whichever node owns that partition key.' },
        { at: 1, label: 'add to memory table', note: 'The node keeps recent writes in a sorted in-memory structure.' },
        { from: 1, to: 2, label: 'append to commit log', note: 'It also appends to a log on disk, so a crash will not lose the write. **Appending is fast**: no random seeking.' },
        { from: 1, to: 0, label: 'OK', dashed: true, note: 'The write is acknowledged quickly.' },
        { from: 1, to: 2, label: 'later: flush sorted file', note: 'In the background, memory is written out as sorted files, which are merged over time. This design is called an LSM tree.' }
      ] },

    { kind: 'compare', title: 'Row storage versus column storage',
      body: 'Now the other meaning. A table is a grid; the question is how that grid is laid out on disk.',
      cols: ['Row storage', 'Column storage'],
      rows: [
        ['Layout on disk', 'All fields of row 1, then all of row 2…', 'All values of column A, then all of column B…'],
        ['Great for', 'Fetch or change a whole record: "load order 42"', 'Scan one or two columns over many rows: "sum of price"'],
        ['Weak at', 'Reading a single column across millions of rows (reads everything)', 'Fetching or updating a single whole row (gathers from many places)'],
        ['Typical use', 'Everyday apps (OLTP): Postgres, MySQL', 'Analytics (OLAP): ClickHouse']
      ],
      note: 'OLTP means online transaction processing: lots of small reads and writes. OLAP means online analytical processing: fewer, huge, question-answering scans. The big-data module returns to both.' },

    { kind: 'concept', title: 'ClickHouse: scanning billions of rows',
      body: `A question like "average order value per country this year" touches only two columns (\`country\`, \`total\`) out of perhaps fifty. A row store must read all fifty for every row. A **column store** reads just the two it needs.

        Columns also compress very well, since a column holds similar values side by side (the same few country names over and over). Less to read from disk means faster scans.

        **ClickHouse** is an open-source columnar database built for exactly this: fast analytical queries over huge volumes of event data, using SQL. It is a poor choice for lots of tiny single-row updates; you would keep your app's main data in an OLTP database and feed ClickHouse a copy for analysis.` },

    { kind: 'pitfall', title: 'Using the wrong "column"',
      body: `Mixing these up causes real pain.

        - Using **Cassandra for analytics**: it has no flexible ad-hoc queries, so "average per country" means reading everything, or maintaining special tables in advance.
        - Using **ClickHouse as the main database for an app**: tiny frequent updates and single-row lookups are not what it is built for, and it lacks the full transactional guarantees you expect from your system of record.
        - Using **either as a general database** "because it scales": both give up flexibility to get that scale.

        Rule of thumb: Cassandra for **write-heavy lookups by key**; ClickHouse for **read-heavy aggregate questions**.` }
  ],

  activities: [
    { type: 'match', after: 0, prompt: 'Match each database to the job it is built for.',
      pairs: [['Cassandra', 'Huge streams of writes, read back by key'], ['ScyllaDB', 'Cassandra-compatible, built for lower overhead per machine'], ['ClickHouse', 'Fast analytics over billions of rows'], ['Postgres', 'General-purpose row storage with joins and transactions']] },

    { type: 'tf', after: 2, statement: 'In Cassandra, a query should normally name the partition key, because the key tells the database which machines to ask.', answer: true,
      explain: 'The partition key is how data is placed. A query without it would have to ask every node, which is what the design steers you away from.' },

    { type: 'order', after: 5, prompt: 'Put what happens to a Cassandra-style write in order.',
      items: ['The write goes to the node that owns the partition key', 'It is added to an in-memory sorted table', 'It is appended to the commit log on disk', 'The node acknowledges the write', 'Later, memory is flushed to sorted files on disk'],
      explain: 'Appending to a log is fast, so the write is acknowledged quickly; the tidying into sorted files happens in the background.' },

    { type: 'mcq', q: 'You must compute "total revenue per month" across five billion event rows. Which kind of storage is the natural fit?',
      options: ['Column storage, since it reads only the columns the query needs', 'Row storage, since it keeps whole records together', 'A key-value store with one key per event', 'A single wide-column partition with all events'],
      answer: 0,
      why: [null, 'Row storage would read every field of every row for a query that needs two.', 'A key-value store cannot aggregate across keys.', 'One giant partition would be a hot spot and still not aggregate flexibly.'],
      explain: 'Aggregates over a few columns across enormous numbers of rows are the textbook job for columnar storage and databases like ClickHouse.' },

    { type: 'bucket', prompt: 'Which kind of storage suits each job best?', buckets: ['Row storage', 'Column storage'],
      items: [['Load order 42 and all its fields for a page', 0], ['Update a customer’s address', 0], ['Insert a new user at checkout', 0], ['Average basket value per country this year', 1], ['Count page views per hour over a year', 1], ['Sum revenue per product across billions of events', 1]],
      explain: 'Whole-record work belongs with row storage; wide scans over a few columns belong with column storage.' },

    { type: 'spot', prompt: 'This Cassandra query is a poor fit for the table design. Tap the line that makes it expensive.',
      code: { lang: 'sql', src: `
        -- table: partition key sensor_id, clustering ts
        SELECT * FROM readings
        WHERE temp > 30
        ALLOW FILTERING;` },
      lines: [3],
      explain: 'Filtering on `temp` does not use the partition key, so the cluster must scan every partition on every node. `ALLOW FILTERING` is the database warning you that it will do so.' },

    { type: 'ab', q: 'You need to answer "how many events did each country send last month?" over a huge event log. Which set-up is better?',
      a: { lang: 'text', label: 'Wide-column', src: `
        Cassandra, partitioned by user_id.
        Count by country: scan all users'
        partitions.` },
      b: { lang: 'text', label: 'Columnar', src: `
        ClickHouse with a country column.
        Read just that column and count.` },
      answer: 'b',
      explain: 'This is an analytical aggregate, not a lookup by key. A columnar engine reads one compressed column, while the wide-column layout would visit every partition.' },

    { type: 'scenario', title: 'Two pipelines, two databases', intro: 'A smart-metering company receives readings from two million meters, one every minute. Engineers also want daily dashboards of average usage per region.',
      meters: { 'write capacity': 60, 'query power': 50, 'simplicity': 60 },
      steps: [
        { text: 'Where do you land the raw stream of readings, queried mostly as "meter 4021 over the last day"?',
          choices: [
            { label: 'A wide-column store partitioned by meter id, clustered by time', score: 2, effects: { 'write capacity': 25, 'simplicity': -5 }, feedback: 'Every query names the meter, so it hits one partition in time order, and the constant stream of appends suits the write path.' },
            { label: 'A single Postgres table with a row per reading and no partitioning', score: 1, effects: { 'write capacity': -15, 'query power': 10 }, feedback: 'Workable at small scale and very friendly to query, but two million writes a minute will eventually outgrow one machine.' },
            { label: 'A columnar analytics database as the primary write target', score: 0, effects: { 'write capacity': -10 }, feedback: 'It is built for batched loads and scans, not a constant trickle of tiny single-row inserts as the system of record.' }
          ] },
        { text: 'The dashboards want average usage per region per day across all history. What do you do?',
          choices: [
            { label: 'Copy data into a columnar store such as ClickHouse for analysis', score: 2, effects: { 'query power': 30, 'simplicity': -10 }, feedback: 'Scans over a couple of columns are exactly its strength. Two stores, each doing the job it is good at.' },
            { label: 'Run the aggregates directly on the wide-column cluster', score: 0, effects: { 'write capacity': -20, 'query power': -10 }, feedback: 'You have not designed for this question, so it scans everything and competes with live writes.' },
            { label: 'Pre-compute a table per possible dashboard in advance', score: 1, effects: { 'query power': 5, 'simplicity': -20 }, feedback: 'It works for fixed questions, but each new dashboard needs a new table and backfill. Flexible analysis is better in an analytics engine.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain the difference between a wide-column store like Cassandra and a columnar database like ClickHouse, and when you would use each.',
      model: 'Cassandra is a wide-column store: it spreads rows across many machines by partition key and keeps rows in order inside each partition, so it handles huge numbers of writes and reads by key, but not flexible queries. ClickHouse is columnar: it stores each column together, so it can scan one or two columns over billions of rows quickly and compress them well, which suits analytics, but it is poor at lots of small single-row updates. I would use Cassandra for write-heavy lookups and ClickHouse for aggregate questions.',
      keywords: ['partition key', 'writes', 'columnar', 'scan', 'analytics', 'compress', 'lookup'] }
  ],

  flashcards: [
    { q: 'What is a wide-column store built for?', a: 'Enormous numbers of writes spread across many machines by partition key, read back by key (Cassandra, ScyllaDB).' },
    { q: 'What do the partition key and clustering column do in Cassandra?', a: 'The partition key picks which nodes hold the row; the clustering column orders rows within the partition.' },
    { q: 'Why are writes cheap in Cassandra?', a: 'Writes are appended to a log and an in-memory table, then sorted into files in the background (an LSM tree), with no random seeking.' },
    { q: 'What is the difference between row storage and column storage?', a: 'Row storage keeps each record\'s fields together (good for whole-row work); column storage keeps each column together (good for scanning a few columns over many rows).' },
    { q: 'What is ClickHouse good for, and bad for?', a: 'Fast analytical SQL over huge datasets; poor for many tiny single-row updates as a system of record.' }
  ],

  glossary: [
    { term: 'Wide-column store', def: 'A database that spreads rows across machines by partition key and orders rows within each partition, built for heavy writes.', like: 'Lockers handed out by number, each looked after by one member of staff.' },
    { term: 'Clustering column', def: 'In Cassandra, the part of the primary key that decides the order of rows inside one partition.', like: 'The order of the pages inside one folder.' },
    { term: 'Columnar database', def: 'A database that stores each column\'s values together on disk, so scanning a few columns across many rows is fast.', like: 'Reading just one column of a spreadsheet by flicking to the page where it is stored.' },
    { term: 'OLAP', def: 'Online analytical processing: a few heavy queries that scan lots of data to answer questions, as opposed to many small transactions.', like: 'Asking the whole census a question, instead of looking up one person.' },
    { term: 'LSM tree', def: 'A write-friendly storage design that buffers writes in memory, appends to a log, and merges sorted files in the background.', like: 'Piling post in a tray, then sorting the whole tray at quiet moments.' }
  ],

  takeaways: [
    '**Wide-column** (Cassandra, ScyllaDB): spread huge write volumes by partition key; design the table around the query.',
    'Writes are **appends** (log and memory first), which is why they are cheap.',
    '**Column storage** keeps each column together, so analytics over a few columns across billions of rows is fast: **ClickHouse**.',
    'Do not mix them up: Cassandra for key lookups under heavy writes, ClickHouse for aggregate questions.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nosql-graph', {
  eli5: 'A graph database stores things and the connections between them as first-class data, so questions like "friends of friends who like jazz" are quick to ask and answer.',

  cards: [
    { kind: 'story', title: 'Friends of friends of friends',
      body: `A social app wants a feature: "People you may know". The rule: people who are friends of your friends, but not yet your friends.

        In SQL you have a \`friendships\` table. Friends: one join. Friends of friends: join it to itself. Friends of friends of friends: another join. By the fourth hop the query is a monster, and the database is grinding through millions of rows to answer it.

        The data is not really a table. It is a **web of connections**, and the connections *are* the interesting part.

        This is the case graph databases were made for.` },

    { kind: 'concept', title: 'Nodes, edges and properties',
      body: `A graph has just three building blocks:

        - **Nodes**: the things. A person, a film, a product.
        - **Edges** (also called relationships): the connections between them, each with a **direction** and a **type**. *Sam* **FOLLOWS** *Alex*. *Alex* **ACTED_IN** *Heat*.
        - **Properties**: key-value details attached to either. A person node has \`name\`; a FOLLOWS edge might have \`since: 2023\`.

        Crucially, the edge is stored **as data**, directly linking two nodes. You do not rebuild the link later by matching ids in a join; it is already there to follow.` },

    { kind: 'diagram', title: 'A tiny social graph',
      body: 'Circles are nodes, labelled arrows are edges. Read it like a sentence: "Sam follows Alex".',
      nodes: [
        { id: 'sam', label: 'Person: Sam', icon: '🧑', x: 0, y: 0, tone: 'accent' },
        { id: 'alex', label: 'Person: Alex', icon: '🧑', x: 1, y: 1 },
        { id: 'priya', label: 'Person: Priya', icon: '🧑', x: 2, y: 0 },
        { id: 'jazz', label: 'Interest: Jazz', icon: '🎷', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'sam', to: 'alex', label: 'FOLLOWS' },
        { from: 'alex', to: 'priya', label: 'FOLLOWS' },
        { from: 'priya', to: 'jazz', label: 'LIKES' },
        { from: 'alex', to: 'jazz', label: 'LIKES' }
      ],
      caption: 'Question: "which people followed by people I follow like jazz?" Follow two arrows from Sam; no tables involved.' },

    { kind: 'metaphor', title: 'A pinboard with string',
      body: `Picture a detective's pinboard: photos pinned up, with **red string** joining them and little labels on the strings ("owes money to", "was seen with").

        To find who is connected to the suspect, the detective does not consult a ledger. They put a finger on the photo and **follow the strings**.

        A graph database does the same: start at one node and walk along edges, however far you like. Asking "who is within three strings of this person?" is natural. Asking "what is the average age of everyone?" is awkward, because that is a ledger question, not a string question.` },

    { kind: 'concept', title: 'Traversals versus joins',
      body: `A relational join **searches**: for each row, look up matching rows in another table, usually through an index. Each extra hop is another search, and the work balloons as the data grows.

        A graph traversal **follows pointers**. Once at a node, its edges are right there. The cost of a hop depends on how many connections that node has, **not on how big the whole database is**.

        That is the graph database's edge: deep, many-hop questions stay fast as the dataset grows, while the same question in tables gets slower and slower. The flip side: for simple "list all the rows" or tidy aggregates, a relational or columnar database is generally a better tool.` },

    { kind: 'code', title: 'Asking in Cypher',
      body: 'Neo4j\'s query language, **Cypher**, draws the pattern in ASCII art: parentheses for nodes, arrows for edges. **Tap the lines.**',
      code: { lang: 'text', src: `
        CREATE (sam:Person {name: 'Sam'})
        CREATE (alex:Person {name: 'Alex'})
        CREATE (sam)-[:FOLLOWS]->(alex)

        MATCH (me:Person {name: 'Sam'})-[:FOLLOWS*2]->(fof:Person)
        WHERE NOT (me)-[:FOLLOWS]->(fof) AND fof <> me
        RETURN DISTINCT fof.name`,
        notes: {
          1: '`(sam:Person {name: \'Sam\'})` reads: a node, called `sam` in this query, with label `Person` and a property `name`.',
          3: '`-[:FOLLOWS]->` is an edge of type FOLLOWS, pointing from Sam to Alex. It looks like the arrow you would draw on a whiteboard.',
          5: '`*2` means "exactly two hops". A single line expresses friends-of-friends, where SQL needed a self-join.',
          6: 'Rule out people Sam already follows, and Sam themself. Patterns can be negated.',
          7: 'The result: the names of "people you may know".'
        } },
      note: 'Neo4j is the best-known graph database and popularised the "property graph" model used here. Cypher inspired the openCypher language, which other databases also support.' },

    { kind: 'realworld', title: 'Neo4j, Neptune and Dgraph',
      body: `**Neo4j**: the best-known graph database, with Cypher. Often the first one people try, and good for learning.

        **Amazon Neptune**: a managed graph service on AWS. It supports more than one way of querying (property graphs through Gremlin or openCypher, and an alternative model called RDF with SPARQL), so it suits teams already on AWS.

        **Dgraph**: a distributed graph database designed to scale across many machines, with a query language built around GraphQL (which you meet in the API styles module).

        All three are different bets on the same idea: the **relationships are first-class data**, not something you rebuild with joins.` },

    { kind: 'compare', title: 'When relationships are the data',
      body: 'Graphs shine when the *connections* are what you ask about.',
      cols: ['Good fit for a graph', 'Better in tables or elsewhere'],
      rows: [
        ['Social networks', 'Friends of friends, mutual connections', 'Average age of all users'],
        ['Recommendations', '"People who bought this also bought..."', 'Total sales per month'],
        ['Fraud rings', 'Accounts sharing devices, cards or addresses', 'Plain order history'],
        ['Knowledge and routes', 'Org charts, dependencies, shortest path', 'A simple customer list']
      ] },

    { kind: 'pitfall', title: 'A graph is not a free upgrade',
      body: `Teams sometimes pick a graph database because "our data has relationships". But **almost all data has relationships**: orders belong to customers, and relational databases handle that beautifully.

        The test is not "are there relationships?" It is "**do my important questions chase relationships through many hops, or across paths of unknown length?**" If your queries are mostly "find the customer, show their last five orders", joins are fine.

        Also: graphs tend to be harder to spread across many machines (the web of links crosses any cut you make), and fewer people know them. Reach for one when the traversal is the product.` }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each graph term to what it is.',
      pairs: [['Node', 'A thing, such as a person or a film'], ['Edge', 'A directed, typed connection between two nodes'], ['Property', 'A key-value detail on a node or an edge'], ['Label', 'A category tag on a node, such as Person'], ['Traversal', 'Walking along edges from node to node']] },

    { type: 'mcq', after: 4, q: 'Why can a deep "friends of friends of friends" query stay fast in a graph database as the data grows?',
      options: ['Each hop follows stored links, so cost tracks its own connections, not database size', 'Graph databases keep every possible query result precomputed in advance', 'They are always run on far bigger and pricier hardware than SQL', 'They skip most of the data and return approximate answers instead'],
      answer: 0,
      why: [null, 'Nothing is precomputed; it walks the links live.', 'Hardware is not the difference; the data layout is.', 'It reads exactly the nodes along the path, not nothing at all.'],
      explain: 'A relational join searches for matches at every hop. A traversal follows links already stored on the node, so growth elsewhere in the data does not slow it.' },

    { type: 'bucket', after: 7, prompt: 'Would you reach for a graph database here?', buckets: ['Graph fits', 'Probably not'],
      items: [['Find accounts that share a phone, card or device', 0], ['"People you may know" up to three hops out', 0], ['Shortest route through a network of dependencies', 0], ['Store a table of customers and show their last five orders', 1], ['Monthly revenue per product category', 1], ['Look up one user\'s profile by id', 1]],
      explain: 'Graphs earn their keep when questions chase connections across several hops. Plain lookups and aggregates are better handled in other stores.' },

    { type: 'spot', prompt: 'Tap the part of this Cypher query that expresses "exactly two hops away".',
      code: { lang: 'text', src: `
        MATCH (me:Person {name: 'Sam'})
              -[:FOLLOWS*2]->(fof:Person)
        RETURN fof.name` },
      lines: [2],
      explain: 'The `*2` inside the relationship brackets means "follow FOLLOWS edges, exactly two times". Change it to `*1..3` and it means one to three hops.' },

    { type: 'tf', statement: 'Because most data contains relationships, a graph database is a sensible default for any application.', answer: false,
      explain: 'Relational databases model relationships well too. A graph database pays off when the important queries traverse many hops or paths of unknown length.' },

    { type: 'cloze', text: 'A graph is made of {{nodes}} joined by {{edges}}, each of which can carry {{properties}}. The query language of Neo4j is called {{Cypher}}.',
      distractors: ['tables', 'SQL', 'documents'],
      explain: 'Nodes are things, edges are the typed, directed links, and properties are the details on either. Cypher draws the pattern in ASCII art.' },

    { type: 'ab', q: 'Which is the better way to answer "who are the friends of friends of Sam?"',
      a: { lang: 'sql', label: 'Relational', src: `
        SELECT DISTINCT f2.friend_id
        FROM friendships f1
        JOIN friendships f2
          ON f1.friend_id = f2.user_id
        WHERE f1.user_id = 1;` },
      b: { lang: 'text', label: 'Graph', src: `
        MATCH (:Person {name:'Sam'})
              -[:FOLLOWS*2]->(p)
        RETURN DISTINCT p` },
      answer: 'b',
      explain: 'At two hops both work, but the graph version stays one short pattern as hops grow and avoids join after join. In a relational schema every extra hop is another self-join.' },

    { type: 'scenario', title: 'The fraud team\'s request', intro: 'A payments company wants to spot **fraud rings**: groups of accounts connected by shared phone numbers, cards, devices and addresses. Analysts want to follow links of any length, and fast.',
      meters: { 'detection power': 40, 'operating cost': 60 },
      steps: [
        { text: 'Customer data, orders and invoices already live safely in Postgres. What do you do for the fraud feature?',
          choices: [
            { label: 'Load accounts and shared attributes into a graph database as a secondary store for this analysis', score: 2, effects: { 'detection power': 35, 'operating cost': -10 }, feedback: 'The system of record stays relational, and the graph answers the traversal questions it is built for. A focused addition.' },
            { label: 'Move everything to a graph database', score: 0, effects: { 'detection power': 20, 'operating cost': -35 }, feedback: 'A risky, expensive migration, and most of your data (orders, invoices) is not graph-shaped. You would lose what you already do well.' },
            { label: 'Write ever-longer self-join queries in Postgres', score: 1, effects: { 'detection power': 10, 'operating cost': -10 }, feedback: 'It works for two or three hops, but analysts want arbitrary depth, and the queries get slow and hard to maintain.' }
          ] },
        { text: 'One analyst asks for "the total spend of all accounts, by month". Where should that run?',
          choices: [
            { label: 'In Postgres or an analytics store; it is an aggregate, not a traversal', score: 2, effects: { 'operating cost': 10 }, feedback: 'Right tool for the job. Plain aggregates belong in tables, not graphs.' },
            { label: 'In the graph database, since it has all the accounts', score: 0, effects: { 'detection power': -5, 'operating cost': -10 }, feedback: 'Graphs are not good at whole-dataset tidy aggregates. You would fight the tool.' },
            { label: 'By hand, in a spreadsheet', score: 0, effects: { 'operating cost': -15 }, feedback: 'Slow, error-prone and not repeatable.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain in your own words why a graph database can beat a relational one for "friends of friends" style questions, and when it would not.',
      model: 'A graph database stores relationships as edges directly between nodes, so a traversal follows stored links from node to node. The cost of each hop depends on how many connections that node has, not on the size of the database, whereas a relational join has to search for matches at every hop and gets slower as tables grow. It is a worse choice for simple lookups and aggregates over everything, and for data without deep relationship questions, where tables are fine.',
      keywords: ['edges', 'nodes', 'traversal', 'join', 'hops', 'links', 'aggregate'] }
  ],

  flashcards: [
    { q: 'What are the three building blocks of a property graph?', a: 'Nodes (things), edges (typed, directed relationships) and properties (key-value details on either).' },
    { q: 'Why can traversals beat joins for deep relationship queries?', a: 'A traversal follows stored links from the current node, so cost depends on its connections, not on total database size. A join searches at each hop.' },
    { q: 'What is Cypher?', a: 'Neo4j\'s query language, which draws graph patterns in ASCII art: (a)-[:KNOWS]->(b).' },
    { q: 'How do Neptune and Dgraph differ from Neo4j?', a: 'Neptune is AWS\'s managed graph service supporting several query languages; Dgraph is a distributed graph database with a GraphQL-based query language.' },
    { q: 'When should you not use a graph database?', a: 'For simple lookups and whole-dataset aggregates, or when your questions do not chase relationships over many hops.' }
  ],

  glossary: [
    { term: 'Graph database', def: 'A database that stores data as nodes and the relationships (edges) between them, optimised for following connections.', like: 'A pinboard with red string between the photos.' },
    { term: 'Node', def: 'A thing in a graph, such as a person, film or product, which can carry a label and properties.', like: 'A photo pinned to the board.' },
    { term: 'Edge', def: 'A directed, typed connection between two nodes in a graph, which can have properties of its own.', aka: ['relationship'], like: 'A piece of string with a label on it.' },
    { term: 'Traversal', def: 'Walking through a graph by following edges from one node to the next.', like: 'Following the string from photo to photo.' },
    { term: 'Cypher', def: 'A declarative query language for graphs that describes patterns using ASCII-art notation, used by Neo4j.', like: 'Sketching the pattern you are looking for and asking the database to find it.' }
  ],

  takeaways: [
    'A graph is **nodes, edges and properties**; the relationships are stored as data.',
    'A **traversal** follows links, so deep many-hop questions stay fast where chains of joins slow down.',
    '**Cypher** (Neo4j), **Neptune** (AWS, several query languages) and **Dgraph** (distributed, GraphQL-flavoured) all bet on this model.',
    'Use a graph when **the traversal is the point**; most data with relationships is fine in tables.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nosql-timeseries', {
  eli5: 'A time-series database is built for data that arrives with a timestamp and never stops, like temperatures every second, and keeps it compact and easy to summarise.',

  cards: [
    { kind: 'concept', title: 'Data with a clock attached',
      body: `Some data is a record of **what happened when**: the temperature every second, a server's CPU load every ten seconds, the price of a share every millisecond, a user's clicks.

        It is **time-series data**: a long stream of values, each stamped with a time.

        It has a distinctive pattern:

        - New data arrives **constantly** and is almost always **appended** (never edited).
        - You mostly ask about **ranges of time**: "the last hour", "this week by day".
        - **Recent** data matters most; old data matters less, in less detail.

        That pattern is regular enough that databases built specially for it can beat a general one.` },

    { kind: 'code', title: 'What a data point looks like',
      body: 'InfluxDB is a well-known time-series database. Its "line protocol" describes one point per line. **Tap the line.**',
      code: { lang: 'text', src: `
        cpu,host=web1,region=eu load=0.64,temp=51.2 1700000000000000000`,
        notes: {
          1: 'Reading left to right: the **measurement** (`cpu`, like a table); the **tags** (`host=web1,region=eu`: labels you filter and group by, and which are indexed); the **fields** (`load`, `temp`: the actual numbers measured); and the **timestamp**, in nanoseconds since 1970.'
        } },
      note: 'The key distinction: **tags** describe *which series* a point belongs to; **fields** hold the readings. Each unique combination of tags is a separate series.' },

    { kind: 'metaphor', title: 'A ship\'s log book',
      body: `A ship's log is a classic time series. Every hour the officer writes a line: time, position, speed, weather. Lines are only ever **added at the bottom**; nobody goes back to edit last Tuesday.

        Questions are about time: "what was our speed over the night watch?", "what is the average daily distance this month?"

        And after a voyage, the detailed hourly pages are summarised into one line per day for the archive. The old pages might be thrown away entirely, after a time.

        A time-series database works the same way: append at the end, ask about time windows, **summarise and discard the old**.` },

    { kind: 'concept', title: 'Append-heavy writes',
      body: `Time-series workloads are write-heavy: thousands or millions of points per second, in time order.

        Because data goes **in at the newest end** and is rarely changed, the database can be organised around **time chunks** (say one chunk per day), keep the newest chunk in a fast, easily appended form, and compress older chunks tightly. Neighbouring readings are often similar (temperature barely moves in a second), so they compress very well.

        Deleting is also easy: dropping a whole old chunk is far cheaper than hunting for individual rows.

        This is the same insight as in the previous lessons: choose a layout that matches how the data is actually written and read.` },

    { kind: 'sequence', title: 'Raw data to a summary: downsampling',
      body: 'Nobody needs per-second detail from last year, but they do want the trend. **Downsampling** keeps summaries instead of the raw points.',
      actors: ['Sensors', 'Database', 'Dashboard'],
      steps: [
        { from: 0, to: 1, label: 'temp every second', note: 'Raw points flow in: 86,400 per sensor per day.' },
        { at: 1, label: 'every hour: average, min, max', note: 'A scheduled job summarises each hour into **one** row.' },
        { from: 2, to: 1, label: 'last 5 minutes?', note: 'A live view asks for recent data.' },
        { from: 1, to: 2, label: 'raw points', dashed: true, note: 'Recent questions use the full-detail data.' },
        { from: 2, to: 1, label: 'last year?', note: 'A trend chart asks for a long range.' },
        { from: 1, to: 2, label: 'hourly summaries', dashed: true, note: 'Old questions use the compact summaries: far less to read, and still shows the shape.' }
      ] },

    { kind: 'concept', title: 'Retention: deciding when to forget',
      body: `Keeping every raw point forever costs ever more disk. A **retention policy** says how long each kind of data is kept.

        A typical plan:

        - raw per-second data: keep for **7 days**
        - hourly summaries: keep for **2 years**
        - daily summaries: keep **forever**

        The database deletes expired chunks automatically. The numbers here are only an example; the right choice depends on your needs, rules and budget. It is the same idea as keeping recent photos at full size but shrinking old ones.

        Decide it deliberately. Otherwise your monitoring system will quietly eat the disk until the day it stops.` },

    { kind: 'realworld', title: 'InfluxDB and TimescaleDB',
      body: `**InfluxDB** is a purpose-built time-series database with the tags-and-fields model above, built-in retention and downsampling, and its own query languages. It is common for monitoring, IoT and metrics, and fits well beside dashboard tools.

        **TimescaleDB** takes a different route: it is an **extension that adds time-series features to Postgres**. You keep SQL, joins, Postgres tools and your existing knowledge, and tables are automatically chopped into time chunks behind the scenes (what it calls hypertables), with compression and retention built in.

        Which is better? Experts differ. A purpose-built engine can be leaner; a Postgres extension lets you join sensor data with your ordinary tables and avoid running another system. Many teams choose TimescaleDB for exactly that reason.`,
      note: 'Specialised tools like Prometheus also store time-series metrics; the observability module covers them.' },

    { kind: 'pitfall', title: 'Not everything with a date is a time series',
      body: `An \`orders\` table has a \`created_at\` column, but you still look up orders by customer, change their status and join them to products. That is ordinary relational data that happens to have a date on it.

        Time-series databases assume data is **appended, rarely updated, mostly queried by time range**, and often **trade away** flexible updates and rich joins for it.

        A second trap is **high cardinality**: if you make something unique (like a user id or a request id) a tag, you create millions of separate series, and many time-series databases slow badly. Tags should be a modest set of labels: host, region, sensor type.` }
  ],

  activities: [
    { type: 'bucket', after: 0, prompt: 'Is this naturally time-series data?', buckets: ['Time series', 'Ordinary data'],
      items: [['A server\'s CPU load every ten seconds', 0], ['A thermostat reading each minute', 0], ['Stock price ticks', 0], ['A customer\'s billing address', 1], ['A product description that editors revise', 1], ['An order whose status changes from paid to shipped', 1]],
      explain: 'Time series are streams of timestamped measurements that are appended and queried by time range. Records that you look up and update in place are ordinary data, even if they have a date column.' },

    { type: 'order', after: 4, prompt: 'Put the life of a data point in a sensible retention plan in order.',
      items: ['Arrives as a raw point with a timestamp', 'Stays at full detail for a short window', 'Is rolled up into an hourly summary', 'The raw point is deleted when its retention expires'],
      explain: 'Detail is kept only while it is useful. Summaries preserve the trend, and expired raw data is dropped automatically to save space.' },

    { type: 'mcq', after: 6, q: 'What is the main attraction of TimescaleDB over a standalone time-series database?',
      options: ['It extends Postgres, so you keep SQL and can join with ordinary tables', 'It stores all of its data in memory only and never writes to disk', 'It removes the need for timestamps by ordering data automatically', 'It is the only database that can store large volumes of numbers'],
      answer: 0,
      why: [null, 'It is not memory-only; it stores to disk like Postgres.', 'Timestamps are central to a time-series database.', 'Every database stores numbers.'],
      explain: 'Because it is a Postgres extension, you get Postgres tooling and SQL joins, plus automatic time chunking, compression and retention. Whether that beats a purpose-built engine is a trade-off.' },

    { type: 'match', prompt: 'Match each term to what it means.',
      pairs: [['Measurement', 'The kind of reading, like a table (e.g. cpu)'], ['Tag', 'A label that identifies which series a point belongs to'], ['Field', 'The actual measured value'], ['Downsampling', 'Replacing raw points with summaries'], ['Retention policy', 'A rule for how long data is kept']] },

    { type: 'tf', statement: 'Using a unique request id as a tag in a time-series database is a good idea because it makes every point easy to find.', answer: false,
      explain: 'Every unique tag combination becomes its own series. A tag with millions of values (high cardinality) creates millions of series and can cripple the database. Tags should be a modest set of labels.' },

    { type: 'ab', q: 'Which retention plan is more sensible for CPU metrics sampled every second?',
      a: { lang: 'text', label: 'Keep it all', src: `
        Keep every per-second point forever.
        Disk grows without limit.` },
      b: { lang: 'text', label: 'Roll up and expire', src: `
        Raw: 7 days. Hourly summaries: 2 years.
        Daily summaries: kept for ever.` },
      answer: 'b',
      explain: 'Old detail is rarely needed, but the trend is. Rolling up and expiring keeps storage bounded while preserving what people actually look at.' },

    { type: 'spot', prompt: 'This line-protocol point will cause a cardinality problem. Tap the tag at fault.',
      code: { lang: 'text', src: `
        requests,host=web1,region=eu,request_id=9f3a21c7 latency=42 1700000000000000000` },
      lines: [1],
      explain: '`request_id` is different for every point, so each point becomes its own series. Put values like that in a field, or leave them out, and keep tags for small sets such as host and region.' },

    { type: 'estimate', q: 'A single sensor sends one reading per second. Roughly how many readings does it produce per day?', answer: 86400, unit: 'readings per day', tolerance: 1.5, min: 1000, max: 10000000,
      explain: 'There are 60 × 60 × 24 = 86,400 seconds in a day. Multiply by a thousand sensors and you are at about 86 million points per day, which is why compact, append-friendly storage matters.' },

    { type: 'explain', prompt: 'Explain what makes time-series data special and how a time-series database takes advantage of it.',
      model: 'Time-series data is a stream of timestamped measurements that are almost always appended, rarely edited, and queried by time range, with recent data mattering most. A time-series database exploits that: it chunks data by time, appends quickly to the newest chunk, compresses older chunks, downsamples raw data into summaries, and applies retention policies to delete old data cheaply. InfluxDB is purpose-built; TimescaleDB adds the same features to Postgres.',
      keywords: ['timestamp', 'append', 'time range', 'downsampling', 'retention', 'compress', 'chunks'] }
  ],

  flashcards: [
    { q: 'What makes time-series data distinctive?', a: 'Timestamped measurements that arrive constantly, are mostly appended and never edited, and are queried by time range.' },
    { q: 'What is downsampling?', a: 'Replacing detailed raw points with summaries such as hourly averages, to keep the trend while saving space.' },
    { q: 'What is a retention policy?', a: 'A rule for how long each level of data is kept before the database deletes it automatically.' },
    { q: 'What are tags and fields in InfluxDB?', a: 'Tags are indexed labels that identify a series (host, region); fields hold the measured values.' },
    { q: 'What is TimescaleDB?', a: 'A Postgres extension that adds automatic time-chunking (hypertables), compression and retention, while keeping SQL and joins.' }
  ],

  glossary: [
    { term: 'Time-series data', def: 'A sequence of timestamped measurements, usually appended in order and queried over time ranges.', like: 'A ship\'s log book.' },
    { term: 'Downsampling', def: 'Reducing the resolution of old data by storing summaries, such as averages per hour, in place of every raw point.', like: 'Replacing hourly log entries with a daily summary line.' },
    { term: 'Retention policy', def: 'A setting that tells the database how long to keep data before deleting it.', like: 'A shredding schedule for old paperwork.' },
    { term: 'Cardinality', def: 'The number of distinct values (or distinct series) in a set. High cardinality means very many, which can overload a time-series database.', like: 'The number of different labels you have to keep track of in the filing room.' },
    { term: 'InfluxDB', def: 'A purpose-built time-series database using measurements, tags, fields and timestamps.', like: 'A log book designed from scratch for log entries.' }
  ],

  takeaways: [
    'Time series is **timestamped, append-only, queried by time range**, and written constantly.',
    '**Downsample** old data into summaries and use **retention policies** so storage stays bounded.',
    '**InfluxDB** is purpose-built (measurement, tags, fields); **TimescaleDB** adds this to Postgres.',
    'Keep tags **low-cardinality**, and remember a date column alone does not make data a time series.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nosql-realtime', {
  eli5: 'A realtime database tells your app the moment data changes, instead of waiting for your app to ask again and again.',

  cards: [
    { kind: 'story', title: 'The shared shopping list',
      body: `You and a flatmate share a shopping-list app. You add "oat milk" in the kitchen. Your flatmate, standing in the supermarket, sees it **appear on their screen** a moment later, without pulling to refresh.

        How? The ordinary way a database works is **ask and answer**: the app asks "what is on the list?" and gets the answer. To notice a change, the app would have to keep asking, every second, "anything new? anything new?" That is wasteful and still laggy.

        A **realtime database** reverses it. The app says once, "tell me whenever this list changes", and the database **pushes** each change to every interested client.` },

    { kind: 'sequence', title: 'Ask-and-answer versus push',
      body: 'Compare the two styles for one change. Step through.',
      actors: ['Phone A', 'Database', 'Phone B'],
      steps: [
        { from: 2, to: 1, label: 'subscribe to "shopping-list"', note: 'Phone B registers interest **once**. The connection stays open.' },
        { from: 0, to: 1, label: 'add "oat milk"', note: 'Phone A writes a new item in the ordinary way.' },
        { at: 1, label: 'stores it, notes who is listening', note: 'The database saves the change and checks who has subscribed to this data.' },
        { from: 1, to: 2, label: 'pushed: "oat milk" added', dashed: true, note: 'It **sends the change down the open connection**. Phone B did not ask this time.' },
        { at: 2, label: 'screen updates', note: 'No polling, no refresh button, and the delay is typically a fraction of a second.' }
      ] },

    { kind: 'metaphor', title: 'The group chat versus checking the post',
      body: `Checking whether something has changed by asking again and again is like **walking to the front door every five minutes to see if the post has come**. Mostly it has not.

        A realtime database is a **doorbell**. You get on with your day; when something arrives, it rings.

        And it is not just one person: everyone looking at the same data hears the doorbell together, which is why the same trick powers shared documents, live dashboards, collaborative whiteboards and chat.

        (The browser-level techniques that make push possible, such as WebSockets, get their own module on realtime.)` },

    { kind: 'code', title: 'Listening for changes in Firestore',
      body: 'Firebase is Google\'s app platform; **Firestore** is its document database. The key call is a **listener**. **Tap the lines.**',
      code: { lang: 'js', src: `
        import { collection, query, where, onSnapshot }
          from 'firebase/firestore';

        const q = query(
          collection(db, 'messages'),
          where('room', '==', 'general'));

        const stop = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            console.log(change.type, change.doc.data());
          });
        });`,
        notes: {
          4: 'A **query** describes the data we care about: messages in the "general" room.',
          8: '`onSnapshot` registers a listener. The callback runs **once now** with current data, and **again every time the query results change**.',
          9: 'Each change is described as `added`, `modified` or `removed`, so your UI updates just that bit.',
          12: 'The call returns `stop`, a function that cancels the listener. Forgetting to call it when leaving a screen is a classic leak.'
        } } },

    { kind: 'concept', title: 'Firebase and Firestore',
      body: `**Firebase** is a Google platform that bundles things apps need: a database, login, file storage and hosting, all called straight from the client app.

        It has two databases. The older **Realtime Database** is one big JSON tree. **Firestore** is the newer one: documents in collections (like the document stores you met), richer queries, and listeners as above. A **security rules** file decides who may read or write what, because phones talk to the database directly.

        The pitch is speed of building: no servers to write for simple apps, and live updates for free.

        The catch comes later: queries are limited (it cannot do arbitrary joins or search), and costs relate to the number of reads and writes, so a chatty screen can surprise you.` },

    { kind: 'concept', title: 'Offline sync',
      body: `Phones go through tunnels. A good app keeps working.

        Firestore (and CouchDB, from earlier) can keep a **local copy of the data on the device**. Reads come from that copy at once. Writes made offline are **queued**, and when the connection returns they are sent up and merged, and changes from others come down.

        What if two people edit the same thing while offline? That is a **conflict**. Simple systems pick a winner (often "last write wins", which silently discards the other edit); more careful ones keep both versions and ask the app to resolve it. Check which behaviour your tool has before you rely on it for something important.

        The local-first feel is one of realtime databases' best features.` },

    { kind: 'realworld', title: 'RethinkDB and changefeeds',
      body: `**RethinkDB** is an open-source document database built around the same idea from the server side. Any query can end with \`.changes()\`, which turns it into a **changefeed**: a never-ending stream of updates to that query's results.

        \`\`\`js
        r.table('messages')
          .filter({ room: 'general' })
          .changes()
        \`\`\`

        Your server code can subscribe to that and push updates on to browsers. Because the feed comes from the database itself, you do not have to bolt on your own notification system.

        The company behind RethinkDB wound down in 2016 and it continues as a community open-source project. Other databases offer similar change streams (MongoDB's change streams, for example), so the *idea* has outlived any one product.` },

    { kind: 'compare', title: 'The trade-offs',
      body: 'Realtime databases are wonderful for the right app, and there are real costs.',
      cols: ['Upside', 'Downside'],
      rows: [
        ['Live updates', 'No polling code; every client stays in step', 'Many open connections to maintain; costs scale with listeners'],
        ['Speed of building', 'Client talks to the database directly; little backend to write', 'Business rules end up in security rules or in the client'],
        ['Querying', 'Simple, fast reads for the app\'s screens', 'Limited joins, aggregation and search'],
        ['Hosting', 'Managed service; no servers to run', 'Lock-in to one vendor\'s API and pricing']
      ] },

    { kind: 'pitfall', title: 'Lock-in and surprise bills',
      body: `Two things catch people out.

        **Lock-in.** Firebase's API, data model and security rules are specific to it. Moving to another database later means rewriting the data layer and the rules, and the data model is shaped by Firestore's limits. Plan for it, or isolate database calls behind your own thin layer.

        **Chatty reads.** If billing is per read, a screen that listens to a large collection and re-reads on every change can cost real money, quickly. Design listeners to watch *narrow* queries, not "everything".

        Neither is a reason to avoid realtime databases. It is a reason to choose with open eyes, as with every database in this module.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the key difference between a realtime database and a normal ask-and-answer database?',
      options: ['Clients subscribe once and the database pushes each change to them', 'It stores data faster on disk', 'It never needs a network connection', 'It uses SQL instead of JSON'],
      answer: 0,
      why: [null, 'Disk speed is not what makes it realtime.', 'The push depends on a live connection; offline sync is a separate feature.', 'The query language is unrelated.'],
      explain: 'Instead of the app polling "anything new?", the database remembers who is listening and sends the change to them as it happens.' },

    { type: 'tf', after: 5, statement: 'If two people edit the same item while offline, a sync system cannot possibly lose either edit.', answer: false,
      explain: 'Some systems use "last write wins", which silently discards one edit. Others keep both and ask the app to resolve the conflict. You must know which your tool does.' },

    { type: 'order', after: 1, prompt: 'Put the steps of a pushed update in order.',
      items: ['Phone B subscribes and the connection stays open', 'Phone A writes a new item', 'The database saves it and finds the subscribers', 'The change is pushed to Phone B, which updates its screen'],
      explain: 'Subscription comes first so the database knows who to tell. The change then flows from writer to database to every listener.' },

    { type: 'match', prompt: 'Match each tool or term to its role.',
      pairs: [['Firestore', 'Google\'s document database with live listeners'], ['onSnapshot', 'A listener called now and on every change'], ['RethinkDB `.changes()`', 'Turns a query into a never-ending stream of updates'], ['Security rules', 'Decide who may read or write which data when clients connect directly'], ['Offline persistence', 'A local copy plus queued writes that sync on reconnect']] },

    { type: 'spot', prompt: 'This listener will run up costs and slow the app. Tap the line that makes it listen to far more than needed.',
      code: { lang: 'js', src: `
        // A screen showing ONE chat room
        const q = collection(db, 'messages');
        onSnapshot(q, (snap) => render(snap));` },
      lines: [2],
      explain: 'The query listens to every message in every room, so each new message anywhere wakes this screen (and counts as reads). Narrow it with `where(\'room\', \'==\', roomId)`.' },

    { type: 'bucket', prompt: 'Which app is a natural fit for a realtime database?', buckets: ['Natural fit', 'Poor fit'],
      items: [['A shared whiteboard many people draw on together', 0], ['A live scoreboard shown on thousands of screens', 0], ['A chat app that must work through tunnels', 0], ['Overnight analytics over five years of sales', 1], ['A banking ledger needing strict multi-record transactions', 1], ['Full-text search across a million articles', 1]],
      explain: 'Realtime databases suit shared, changing state that many users watch together. Heavy analytics, strict transactions and search are better served by other stores.' },

    { type: 'cloze', text: 'A {{changefeed}} streams updates to a query\'s results. When a device is offline, writes are {{queued}} and then synced; if two edits clash, that is a {{conflict}}.',
      distractors: ['index', 'replica', 'shard'],
      explain: 'Changefeeds (RethinkDB) and listeners (Firestore) push changes. Offline writes queue until reconnection, and clashing edits produce conflicts that something has to resolve.' },

    { type: 'scenario', title: 'The launch-week chat bug', intro: 'Your team built a live-polling feature on a managed realtime database. At launch 20,000 people join a quiz, and the bill and the app both start misbehaving.',
      meters: { 'app smoothness': 60, 'monthly bill': 70 },
      steps: [
        { text: 'Every screen listens to the entire "votes" collection and re-reads it on each vote. What do you do?',
          choices: [
            { label: 'Maintain one small "results" document of counts and have screens listen only to that', score: 2, effects: { 'app smoothness': 25, 'monthly bill': 25 }, feedback: 'Clients receive one tiny update instead of thousands of raw votes. Shape the data for the screen that watches it.' },
            { label: 'Poll every second instead of listening', score: 0, effects: { 'app smoothness': -10, 'monthly bill': -20 }, feedback: 'Polling makes the problem worse: 20,000 clients asking every second, mostly for nothing.' },
            { label: 'Do nothing and hope the quiz ends soon', score: 0, effects: { 'app smoothness': -20, 'monthly bill': -25 }, feedback: 'The cost scales with listeners times changes. Waiting only lets the bill grow.' }
          ] },
        { text: 'Six months later the vendor changes its pricing, and finance asks how hard it would be to move. What should you have done?',
          choices: [
            { label: 'Kept database calls behind a thin layer of our own so one module changes', score: 2, effects: { 'monthly bill': 10 }, feedback: 'Isolating the vendor\'s API in one place does not remove lock-in, but it makes the cost of leaving visible and bounded.' },
            { label: 'Called the vendor\'s SDK from every screen throughout the app', score: 0, effects: { 'monthly bill': -15 }, feedback: 'Moving now means touching the whole codebase. It is cheap on day one and expensive on the day you want to leave.' },
            { label: 'Tell finance that moving is impossible', score: 0, effects: {}, feedback: 'Rarely true. It is only costly, and a bounded layer would have made it manageable.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain how a realtime database differs from polling, and name two trade-offs of choosing one like Firestore.',
      model: 'With polling the app repeatedly asks if anything changed. With a realtime database the client subscribes once and the database pushes each change down an open connection, so every client stays in sync with little delay. Firestore also supports offline sync. Trade-offs include limited querying (no joins or search), costs that grow with reads and listeners, business rules ending up in security rules, and lock-in to one vendor\'s API.',
      keywords: ['subscribe', 'push', 'polling', 'offline', 'lock-in', 'queries', 'cost'] }
  ],

  flashcards: [
    { q: 'What does a realtime database do differently from a normal one?', a: 'Clients subscribe to data and the database pushes each change to them over an open connection, so no polling is needed.' },
    { q: 'What is the difference between Firebase Realtime Database and Firestore?', a: 'Realtime Database is one large JSON tree; Firestore is the newer document-and-collection database with richer queries and listeners.' },
    { q: 'What is a changefeed in RethinkDB?', a: 'A never-ending stream of updates to a query\'s results, made by ending the query with .changes().' },
    { q: 'How does offline sync work?', a: 'The device keeps a local copy; offline writes are queued and merged when the connection returns, with a conflict rule if edits clash.' },
    { q: 'What are the main risks of a managed realtime database?', a: 'Vendor lock-in, limited querying, and costs that scale with reads and listeners.' }
  ],

  glossary: [
    { term: 'Realtime database', def: 'A database that pushes changes to subscribed clients as they happen, rather than waiting to be asked.', like: 'A doorbell instead of walking to the door.' },
    { term: 'Listener', def: 'A callback registered with a database that runs whenever the data it watches changes.', aka: ['subscription'], like: 'Asking to be told when the kettle boils.' },
    { term: 'Changefeed', def: 'A continuous stream of changes to the results of a query, as offered by RethinkDB.', like: 'A news ticker for one question.' },
    { term: 'Offline sync', def: 'Keeping a local copy of data on a device, queuing writes while offline and merging them when reconnected.', like: 'Writing in a notebook on the train and copying it into the shared file at the station.' },
    { term: 'Vendor lock-in', def: 'Being so tied to one provider\'s specific API and data model that leaving is costly.', like: 'Having every appliance in your home use one brand\'s special plug.' }
  ],

  takeaways: [
    'A realtime database **pushes changes** to subscribed clients, so nobody has to poll.',
    '**Firestore** and **RethinkDB** show two flavours: client listeners, and server-side changefeeds.',
    '**Offline sync** keeps a local copy and queues writes; know your conflict rule.',
    'Watch **lock-in**, limited queries and per-read costs; keep listeners narrow.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('search-engines', {
  eli5: 'A search engine builds an index of every word and where it appears, like the index at the back of a book, so it can find matches without reading every document.',

  cards: [
    { kind: 'story', title: 'The search box that melted the database',
      body: `A shop has a million product descriptions in a database. The search box runs:

        \`SELECT * FROM products WHERE description LIKE '%waterproof jacket%'\`

        With a hundred products it is instant. With a million it takes seconds, because the database must **read every description from start to finish** looking for those characters. A normal index cannot help, since the pattern starts with \`%\`: it could match anywhere.

        Worse, it is too literal. It misses "jackets", "Waterproof Jacket" with different capitals, "jacket, waterproof", and a typo like "jaket". It cannot say which result is *best*.

        Searching text well needs a database designed for it.` },

    { kind: 'metaphor', title: 'The index at the back of a book',
      body: `To find every mention of "lighthouse" in a thick book, you do not reread it. You turn to the **index** at the back: *lighthouse: pages 12, 87, 203*. Done in seconds.

        Someone built that index in advance, by going through the book once and writing down, **for each word, where it appears**.

        A search engine is a machine that builds that index for millions of documents, keeps it up to date, and then looks up the words in your search the same way you looked up "lighthouse". Searching becomes **looking up a word**, not reading everything.

        Where the metaphor stops: a book index lists topics a human chose; a search index lists *every* word.` },

    { kind: 'diagram', title: 'The inverted index',
      body: 'A normal database goes from **document to words**. A search index is **inverted**: from **word to documents**.',
      nodes: [
        { id: 'd1', label: 'Doc 1: "red waterproof jacket"', x: 0, y: 0 },
        { id: 'd2', label: 'Doc 2: "blue jacket"', x: 1, y: 0 },
        { id: 'd3', label: 'Doc 3: "red scarf"', x: 2, y: 0 },
        { id: 'w1', label: 'waterproof → 1', x: 0, y: 2, tone: 'accent' },
        { id: 'w2', label: 'jacket → 1, 2', x: 1, y: 2, tone: 'accent' },
        { id: 'w3', label: 'red → 1, 3', x: 2, y: 2, tone: 'accent' }
      ],
      edges: [
        { from: 'd1', to: 'w1', dashed: true }, { from: 'd1', to: 'w2', dashed: true }, { from: 'd2', to: 'w2', dashed: true }, { from: 'd1', to: 'w3', dashed: true }, { from: 'd3', to: 'w3', dashed: true }
      ],
      caption: 'Searching "red jacket": look up red → {1, 3}, jacket → {1, 2}, and find the overlap: document 1. No document is read in full.' },

    { kind: 'steps', title: 'Analysis: turning text into good search terms',
      body: 'Before words go into the index, they pass through an **analysis** pipeline. The same pipeline runs on your search query, so both sides speak the same language.',
      steps: [
        { title: 'Tokenise', body: 'Split the text into words (**tokens**): "Waterproof Jackets, size M!" becomes `Waterproof`, `Jackets`, `size`, `M`.' },
        { title: 'Lowercase', body: 'So "Jacket" and "jacket" match: `waterproof`, `jackets`, `size`, `m`.' },
        { title: 'Remove stop words (optionally)', body: 'Drop very common words like "the" and "of", which match everything and say little.' },
        { title: 'Stem', body: 'Reduce words to a root form: "jackets" becomes `jacket`, "running" becomes `run`. Now a search for one finds the other.' },
        { title: 'Index the result', body: 'Each final term is stored with the documents (and positions) where it appears.' }
      ] },

    { kind: 'concept', title: 'Relevance: which result goes first?',
      body: `Finding matches is half the job. With 40,000 matches for "jacket", **order** is everything, because people read the first few.

        Search engines give each match a **relevance score**. The classic intuition (TF-IDF, and its modern relative BM25) has two parts:

        - A word that appears **often in this document** suggests it is about that topic.
        - A word that is **rare across all documents** is more telling than a common one. "Waterproof" says more than "the".

        A match in the **title** can count for more than one in the body, and you can add your own boosts (newer, in stock, popular). Relevance tuning is a craft: a lot of what makes search feel good is not matching but ranking.` },

    { kind: 'code', title: 'Asking Elasticsearch',
      body: 'Elasticsearch speaks JSON over HTTP, so you can try it with `curl`. A search request, in its query language. **Tap the lines.**',
      code: { lang: 'json', src: `
        POST /products/_search
        {
          "query": {
            "multi_match": {
              "query": "waterproof jaket",
              "fields": ["title^3", "description"],
              "fuzziness": "AUTO"
            }
          }
        }`,
        notes: {
          1: 'POST a search to the `products` index. An **index** here means a collection of documents, not just the data structure.',
          5: 'The user\'s raw text. It goes through the same analysis as the stored documents.',
          6: '`title^3` means "matches in the title count three times as much". That is a relevance boost.',
          7: '`fuzziness` allows small typos: "jaket" still finds "jacket".'
        } },
      note: 'The results come back sorted by `_score`, highest relevance first, each with the matching document.' },

    { kind: 'realworld', title: 'Elasticsearch and Solr',
      body: `Both are built on **Lucene**, a long-standing open-source search library, and add what Lucene alone lacks: a server, an HTTP API and the ability to spread an index across many machines.

        **Elasticsearch** is very widely used, with a JSON API, good tooling and a large ecosystem. It is also common for searching **logs** and analysing event data, not just websites. (OpenSearch is a related fork that continues from earlier Elasticsearch code.)

        **Solr** is an Apache project with a long history, strong in classic enterprise search with faceting and highly configurable behaviour.

        Both do the same core job; teams choose by familiarity, hosting options and licensing, rather than by a decisive technical gap.` },

    { kind: 'sequence', title: 'Search as a secondary store',
      body: 'Most teams do **not** make the search engine their main database. They copy data into it.',
      actors: ['App', 'Postgres', 'Search engine'],
      steps: [
        { from: 0, to: 1, label: 'save product (source of truth)', note: 'The write goes to your normal, durable database first.' },
        { from: 0, to: 2, label: 'index the product', note: 'Then (often via a queue or a change feed) a copy is sent to the search engine.' },
        { from: 0, to: 2, label: 'search "waterproof jaket"', note: 'Searches go **only** to the search engine.' },
        { from: 2, to: 0, label: 'ids + scores', dashed: true, note: 'It returns the best matches, often just ids with highlights.' },
        { from: 0, to: 1, label: 'fetch full records by id', note: 'The app may read the real, current records from the main database to render them.' },
        { note: 'If the search index is ever lost or wrong, you rebuild it from Postgres. Nothing precious lived only there.' }
      ] },

    { kind: 'pitfall', title: 'Search is not your source of truth',
      body: `Search engines are tuned for fast, flexible reading, not for being the final word on your data.

        - The index is usually **near-realtime**: a new document may take a moment to become searchable, so they are not meant for read-your-own-write guarantees.
        - They generally lack the **transactions and constraints** you rely on relational databases for.
        - Changing how text is analysed often means **rebuilding the index**.

        So: keep the truth in a database you trust, treat the search index as a **disposable, rebuildable copy** shaped for searching, and design the sync (and the "it is out of date" case) deliberately.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'Why does `LIKE \'%waterproof%\'` get painfully slow on a large table?',
      options: ['A leading wildcard defeats ordinary indexes, so every row is scanned', 'The database cannot store text longer than a few hundred characters', 'LIKE is meant for numbers and falls back to a slow text mode', 'The query result is cached incorrectly after the first search'],
      answer: 0,
      why: [null, 'Databases store long text fine; the problem is searching it.', 'LIKE is a text operator.', 'Caching is not the cause.'],
      explain: 'With a `%` at the start the match could be anywhere in the string, so an ordinary index cannot narrow the candidates and the database reads everything.' },

    { type: 'order', after: 3, prompt: 'Put the analysis pipeline in order.',
      items: ['Split the text into tokens', 'Lowercase the tokens', 'Remove very common stop words', 'Reduce words to their stems', 'Store each term in the index'],
      explain: 'Each step cleans up what the previous one produced. Running the same pipeline on the search query is what makes "Jackets" find "jacket".' },

    { type: 'tf', after: 8, statement: 'It is good practice to treat the search engine as the primary store, with no other copy of the data.', answer: false,
      explain: 'Search indexes are near-realtime, lack strong transactions and often need rebuilding. Keep the source of truth in a database you trust and rebuild the index from it when needed.' },

    { type: 'match', prompt: 'Match each search term to its meaning.',
      pairs: [['Inverted index', 'A map from each word to the documents containing it'], ['Token', 'One word-like piece produced by splitting text'], ['Stemming', 'Reducing "running" and "runs" to a common root'], ['Relevance score', 'How good a match a document is for the query'], ['Lucene', 'The library under both Elasticsearch and Solr']] },

    { type: 'bucket', prompt: 'Which store is the better home for each job?', buckets: ['Relational / source of truth', 'Search engine'],
      items: [['Recording an order and taking payment atomically', 0], ['Enforcing that every order belongs to a real customer', 0], ['The master copy of the product catalogue', 0], ['"Search as you type" over product titles with typo tolerance', 1], ['Ranking articles by how well they match a phrase', 1], ['Searching through millions of log lines for an error message', 1]],
      explain: 'Transactions, constraints and the authoritative copy belong in the database of record. Fuzzy, ranked, free-text search is the search engine\'s speciality.' },

    { type: 'ab', q: 'Which approach better supports a shop\'s search box with a million products?',
      a: { lang: 'sql', label: 'LIKE query', src: `
        SELECT * FROM products
        WHERE description LIKE '%rain coat%';` },
      b: { lang: 'json', label: 'Search engine', src: `
        { "query": { "match": {
            "description": "rain coat" } } }` },
      answer: 'b',
      explain: 'The search engine looks words up in an inverted index, handles case, stems and typos, and ranks results. The LIKE query rescans every row and returns unranked, literal matches only.' },

    { type: 'spot', prompt: 'Tap the setting that lets a search for "jaket" still find "jacket".',
      code: { lang: 'json', src: `
        { "query": { "match": {
            "title": {
              "query": "jaket",
              "fuzziness": "AUTO" } } } }` },
      lines: [4],
      explain: 'Fuzziness allows a small edit distance between the query and indexed terms, so a one-letter typo still matches. Without it, "jaket" would find nothing.' },

    { type: 'scenario', title: 'The stale search results', intro: 'Your shop copies products into a search engine through a queue. A merchandiser updates a price, but for about a minute search shows the old price. Another day the search cluster is lost completely.',
      meters: { 'customer trust': 70, 'recovery ability': 50 },
      steps: [
        { text: 'The price shown in results is a minute stale. How do you handle it?',
          choices: [
            { label: 'Use search to find matching ids, then read the current price from the main database for display', score: 2, effects: { 'customer trust': 20 }, feedback: 'The index finds *which* products; the source of truth supplies facts that must be right, like prices and stock. A tidy split.' },
            { label: 'Stop indexing updates and only add new products', score: 0, effects: { 'customer trust': -25 }, feedback: 'You have made stale results permanent.' },
            { label: 'Tell customers prices may differ', score: 1, effects: { 'customer trust': -5 }, feedback: 'Honest but unsatisfying. A lookup against the database of record avoids the confusion.' }
          ] },
        { text: 'The search cluster is lost and you have no copy of it. What should have made this a small problem?',
          choices: [
            { label: 'The main database holds the truth, so you reindex from it', score: 2, effects: { 'recovery ability': 35 }, feedback: 'That is the point of a secondary store: disposable and rebuildable. Search is down for a while, but nothing is lost.' },
            { label: 'Daily screenshots of the website', score: 0, effects: { 'recovery ability': -10 }, feedback: 'A screenshot is not data you can rebuild an index from.' },
            { label: 'Making the search engine the primary store with replicas', score: 0, effects: { 'recovery ability': -15 }, feedback: 'That bets your only copy of the data on a tool not designed to be the final word on it.' }
          ] }
      ] },

    { type: 'explain', prompt: 'Explain how a search engine can find documents without reading all of them, and why it should not be your only database.',
      model: 'It builds an inverted index in advance, mapping each term to the documents that contain it. Text first goes through analysis: tokenising, lowercasing, removing stop words and stemming, and queries get the same treatment. So searching becomes looking up a few terms and combining the results, then ranking by relevance. It should not be the only store because it is near-realtime, lacks transactions and constraints and often needs rebuilding, so I keep the truth in a database and treat the index as a rebuildable copy.',
      keywords: ['inverted index', 'tokenise', 'stemming', 'relevance', 'secondary', 'rebuild', 'source of truth'] }
  ],

  flashcards: [
    { q: 'Why does LIKE \'%word%\' not scale?', a: 'A leading wildcard stops normal indexes helping, so the database scans every row\'s text; it also ignores typos, stems and ranking.' },
    { q: 'What is an inverted index?', a: 'A map from each word to the list of documents (and positions) that contain it, like the index at the back of a book.' },
    { q: 'What happens in text analysis?', a: 'Text is split into tokens, lowercased, optionally stripped of stop words and stemmed, then indexed; queries go through the same steps.' },
    { q: 'How is relevance scored?', a: 'Roughly: terms frequent in a document and rare across all documents score higher (TF-IDF, BM25), plus boosts such as title matches.' },
    { q: 'Why is a search engine a secondary store?', a: 'It is near-realtime, lacks strong transactions and often needs reindexing, so the truth stays in a database and the index is a rebuildable copy.' }
  ],

  glossary: [
    { term: 'Inverted index', def: 'A data structure mapping each term to the documents that contain it, so searching is a lookup rather than a scan.', like: 'The index at the back of a book.' },
    { term: 'Analysis', def: 'The process of turning text into index terms: tokenising, lowercasing, removing stop words and stemming.', like: 'Tidying and labelling every item before it goes on the shelf.' },
    { term: 'Stemming', def: 'Reducing words to a root form so that different forms of a word match, such as "jackets" to "jacket".', like: 'Treating "run", "runs" and "running" as the same filing label.' },
    { term: 'Relevance score', def: 'A number a search engine assigns to each match to say how well it fits the query, used to order results.', like: 'A librarian ranking books by how closely they answer your question.' },
    { term: 'Elasticsearch', def: 'A widely used search server, built on Lucene, offering a JSON HTTP API and distribution across machines.', like: 'A very fast librarian that has read everything in advance.' }
  ],

  takeaways: [
    '`LIKE \'%word%\'` scans everything; a search engine **looks words up** in an **inverted index**.',
    '**Analysis** (tokenise, lowercase, stem) makes "Jackets" find "jacket"; queries use the same pipeline.',
    '**Relevance scoring** (TF-IDF/BM25 intuition, plus boosts) decides the order, which matters as much as matching.',
    '**Elasticsearch and Solr** (both on Lucene) are **secondary stores**: keep the truth elsewhere and be ready to reindex.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('db-choosing', {
  eli5: 'To choose a database, first write down how your app will read and write its data, then pick the simplest tool that does that well, which is very often plain Postgres.',

  cards: [
    { kind: 'story', title: 'Two teams, one fashionable database',
      body: `Team A reads a conference talk and adopts a trendy database for their new invoicing app. Invoices link to customers, lines, taxes and payments, and the finance team wants reports across all of it. Six months in, they are writing joins by hand in application code, fighting inconsistent data, and wishing for transactions.

        Team B builds a live leaderboard for a game. They store it in the same database. It is slow and awkward, because the job is "keep a ranked list updated thousands of times a second", which a sorted set in a key-value store does in one command.

        Same database, opposite outcomes. Neither team chose wrongly because the database was bad. They chose **before asking what the app actually does**.` },

    { kind: 'concept', title: 'Start from access patterns',
      body: `You have seen the same lesson in every part of this module: **the best data layout depends on how you will read and write**.

        So the first step in choosing is not browsing products. It is writing down, plainly:

        - **What are the main things we store?** (orders, messages, readings)
        - **How will we write them?** Steady trickle, huge bursts, rarely?
        - **How will we read them?** By id, by a range of time, by relationships, by free text, by arbitrary reports?
        - **How wrong can a read be?** Must it be exactly current, or is "a few seconds behind" fine?

        These answers point at databases far better than any list of features.` },

    { kind: 'steps', title: 'A simple way to choose',
      body: 'Work through these in order. Often you stop at step 2.',
      steps: [
        { title: 'Write down the access patterns', body: 'The five or ten most important reads and writes, in plain words, with rough volumes.' },
        { title: 'Try the boring default first', body: 'Could Postgres (or another mainstream relational database) do it, at the scale you honestly expect? If yes, stop. You gain transactions, joins, tooling and hiring ease for free.' },
        { title: 'Find the pattern that genuinely strains it', body: 'Millions of writes per second? Deep relationship queries? Text search? Sub-millisecond lookups? Name the specific strain, with evidence.' },
        { title: 'Add a specialist for that one job', body: 'Match the strain to a family: key-value, wide-column, graph, time-series, search. Keep the rest where it is.' },
        { title: 'Plan the cost', body: 'Every extra store needs syncing, monitoring, backups, upgrades and someone who knows it. Be sure the benefit is worth it.' }
      ] },

    { kind: 'compare', title: 'A decision guide',
      body: 'Not a rulebook, but a map from a dominant need to the family worth considering.',
      cols: ['Look at', 'Because'],
      rows: [
        ['Related, correctness-critical data, ad-hoc questions', 'Relational (Postgres): the default', 'Transactions, joins, constraints, tooling'],
        ['Nested objects whose shape varies', 'Document store, or a JSON column', 'One read returns the whole thing'],
        ['Fast lookups by key, caches, sessions', 'Key-value (Redis; DynamoDB at huge scale)', 'Get and put by key, very quickly'],
        ['Enormous writes, queried by key', 'Wide-column (Cassandra, ScyllaDB)', 'Append-friendly, spreads by partition key'],
        ['Aggregates over billions of rows', 'Columnar (ClickHouse)', 'Reads only the columns needed'],
        ['Many-hop relationship questions', 'Graph (Neo4j, Neptune, Dgraph)', 'Traversals follow stored links'],
        ['Timestamped measurements, live updates', 'Time-series; realtime (Firestore)', 'Time chunks and retention; pushed changes'],
        ['Ranked, typo-tolerant text search', 'Search engine as a secondary store', 'Inverted index and relevance scoring']
      ] },

    { kind: 'metaphor', title: 'The kitchen',
      body: `A kitchen has a sharp knife, a big pan, an oven, a fridge, a toaster. Nobody asks "which one tool should we standardise on?" Each is best at a job.

        But note two things. First, **the knife and the pan come first**. You do not buy a sous-vide machine before you own a decent pan. That is your general-purpose relational database.

        Second, every gadget costs counter space and cleaning. A kitchen with thirty gadgets, most used once a year, is worse than one with six you use daily.

        Where the metaphor stops: gadgets do not have to be kept in sync with each other. Databases do, and that is the real cost of owning many.` },

    { kind: 'diagram', title: 'Polyglot persistence',
      body: '**Polyglot persistence** means using several kinds of database in one system, each for the job it suits. A typical shop might look like this.',
      nodes: [
        { id: 'app', label: 'Shop application', icon: '🖥️', x: 1, y: 0, tone: 'accent' },
        { id: 'pg', label: 'Postgres: orders, users', icon: '🐘', x: 0, y: 1, tone: 'good' },
        { id: 'redis', label: 'Redis: sessions, cache', icon: '⚡', x: 1, y: 1 },
        { id: 'es', label: 'Search engine: products', icon: '🔎', x: 2, y: 1 },
        { id: 'ch', label: 'ClickHouse: analytics', icon: '📊', x: 0, y: 2, tone: 'info' }
      ],
      edges: [
        { from: 'app', to: 'pg', label: 'source of truth' }, { from: 'app', to: 'redis' }, { from: 'app', to: 'es', label: 'search' },
        { from: 'pg', to: 'es', label: 'copy', dashed: true }, { from: 'pg', to: 'ch', label: 'copy', dashed: true }
      ],
      caption: 'One store holds the truth. The others are copies or caches shaped for a job, and can be rebuilt.' },

    { kind: 'concept', title: 'The price of many databases',
      body: `Polyglot sounds elegant. In practice each new store brings:

        - **Syncing**: how does data get from the source of truth to the copy, and what happens when it is late or wrong?
        - **Operations**: backups, upgrades, monitoring, security, on-call, for each one.
        - **Skills**: someone must really understand it, or it becomes a mystery box nobody dares touch.
        - **Consistency puzzles**: the same fact in two places can disagree.

        That is why experienced teams add stores **one at a time, for a named problem**, and keep **one** as the single source of truth. A small team running five different databases is usually a warning sign.` },

    { kind: 'tip', title: 'Default to boring',
      body: `"Boring" technology is proven, widely understood, well documented and easy to hire for. Its failure modes are known and the internet is full of answers.

        A mainstream relational database is the boring choice, and it is far more capable than its reputation among people chasing fashion. It does transactions, joins, constraints, JSON columns, full-text search of a basic kind, and time-series with extensions.

        A good rule: **spend your "novelty budget" on what makes your product special, not on your database.** Choose a specialist only when you can say what specific problem the boring option fails to solve, and show it.`,
      note: 'The next world, Scaling Data, explains what happens when even a well-run single database is not enough: replication, sharding, and the trade-offs behind them.' },

    { kind: 'pitfall', title: 'Common ways to choose badly',
      body: `- **Resume-driven design**: picking a technology because it is exciting to learn or to list.
        - **Premature scale**: designing for a hundred million users when you have a hundred. You pay the complexity now for a benefit that may never come.
        - **Hype**: "everyone is using it" is not a requirement. Ask what they use it *for*.
        - **One-size-fits-all**: forcing the whole system into one database, even a great one, for a job it hates (like search or heavy analytics).
        - **Ignoring consistency needs**: choosing an eventually consistent store for something that needs exact balances, because it was fast in a demo.

        The antidote to all of them is the same: **write down the access patterns, then justify the choice against them.**` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the best first step when choosing a database for a new project?',
      options: ['Write down how the data will be written and read', 'Compare benchmark charts from vendors', 'Pick whichever is most popular on social media', 'Choose the one that scales to the most machines'],
      answer: 0,
      why: [null, 'Benchmarks measure someone else\'s workload, not yours.', 'Popularity says nothing about your access patterns.', 'Scale you do not need is complexity you pay for.'],
      explain: 'Access patterns, volumes and consistency needs are what separate databases. Every other comparison makes sense only against them.' },

    { type: 'order', after: 2, prompt: 'Put the sensible decision process in order.',
      items: ['Write down the main reads and writes', 'Ask whether Postgres can handle them at your real scale', 'Name the specific pattern that strains it', 'Add a specialist store for that one job'],
      explain: 'You need the patterns before you can judge; the boring default comes before specialists; and a specialist is added only for a named strain.' },

    { type: 'match', after: 3, prompt: 'Match each need to the family that suits it.',
      pairs: [['Sessions and counters needing sub-millisecond reads', 'Key-value (Redis)'], ['Billions of rows aggregated for reports', 'Columnar (ClickHouse)'], ['Friends-of-friends recommendations', 'Graph (Neo4j)'], ['Typo-tolerant ranked text search', 'Search engine (Elasticsearch)'], ['Sensor readings by time range', 'Time-series (InfluxDB, TimescaleDB)']] },

    { type: 'bucket', prompt: 'Sort each situation: is Postgres likely enough, or is a specialist justified?', buckets: ['Postgres likely enough', 'Specialist justified'],
      items: [['An internal HR tool for 300 staff', 0], ['A shop with 50,000 orders a month and finance reports', 0], ['A blog platform with JSON article metadata', 0], ['A million sensor writes per second, retained for years', 1], ['Real-time deep-link fraud detection across billions of edges', 1], ['Ranked text search across a hundred million documents', 1]],
      explain: 'Ordinary scale and structure stay comfortably in a relational database, which can also store JSON. Specialists are for named, extreme or oddly shaped needs.' },

    { type: 'tf', statement: 'In a polyglot design it is wise to let each database hold its own independent truth, so none depends on the others.', answer: false,
      explain: 'Facts duplicated across stores with no single source of truth drift apart. Keep one authoritative store and treat the others as rebuildable copies or caches.' },

    { type: 'ab', q: 'A small team of four is building a booking platform. Which plan is wiser?',
      a: { lang: 'text', label: 'Five stores from day one', src: `
        Postgres, MongoDB, Redis,
        Neo4j and Elasticsearch,
        "so we are ready to scale".` },
      b: { lang: 'text', label: 'Postgres first', src: `
        Postgres for everything now.
        Add Redis or search later,
        only when a real need appears.` },
      answer: 'b',
      explain: 'Each extra store costs syncing, operations and expertise. A small team should earn that complexity with a demonstrated need, not pre-pay it.' },

    { type: 'spot', prompt: 'A team writes this "decision record". Tap the line that is a poor reason to choose a database.',
      code: { lang: 'text', src: `
        We choose Database X because:
        1. Writes arrive at up to 30,000 per second
        2. Reads are always by customer id
        3. Everyone on Twitter is raving about it
        4. Stale reads of a few seconds are acceptable` },
      lines: [3],
      explain: 'Lines 1, 2 and 4 are access patterns and consistency needs, the things that should drive the choice. Popularity is hype, not a requirement.' },

    { type: 'scenario', title: 'The startup\'s three database moments', intro: 'You are the lead engineer at a growing food-delivery start-up. Postgres holds everything today. Over the next year three requests land on your desk.',
      meters: { 'speed to ship': 60, 'system stability': 60, 'cost': 60 },
      steps: [
        { text: 'Marketing wants a "search dishes" box with typo tolerance and ranking. Postgres LIKE queries are slow and clumsy. What now?',
          choices: [
            { label: 'Add a search engine fed from Postgres, as a secondary store', score: 2, effects: { 'speed to ship': 10, 'system stability': 5, 'cost': -10 }, feedback: 'A named problem, a fitting specialist, and Postgres stays the source of truth. If the index breaks you rebuild it.' },
            { label: 'Migrate the whole system to a document database that "has search"', score: 0, effects: { 'speed to ship': -30, 'system stability': -20 }, feedback: 'You have put your entire core at risk to solve one feature, and lost joins and transactions on orders.' },
            { label: 'Keep LIKE queries and ask customers to be patient', score: 1, effects: { 'speed to ship': 5, 'system stability': -10 }, feedback: 'Acceptable for a little while, but it hurts as the menu grows and offers no ranking or typo tolerance.' }
          ] },
        { text: 'Courier locations arrive every few seconds from 40,000 phones, and the map needs the latest position instantly. Postgres is struggling with the write rate. What do you do?',
          choices: [
            { label: 'Keep the latest position per courier in Redis; store history elsewhere or in batches', score: 2, effects: { 'system stability': 15, 'speed to ship': 5, 'cost': -5 }, feedback: 'The "current position" is a tiny key-value problem with a short lifetime. Redis suits it, and Postgres is spared the churn.' },
            { label: 'Buy a much bigger Postgres server and hope', score: 1, effects: { 'cost': -25, 'system stability': 5 }, feedback: 'It may buy time, but the pattern, many tiny overwrites, is a poor fit, and costs keep climbing.' },
            { label: 'Switch everything, including orders, to a wide-column store', score: 0, effects: { 'system stability': -25, 'speed to ship': -20 }, feedback: 'Orders need transactions and joins, which you would give up for a problem that belongs only to location data.' }
          ] },
        { text: 'Finance asks for a weekly report joining orders, customers and refunds, nothing extreme. A colleague suggests a new analytics database. What do you say?',
          choices: [
            { label: 'Try a read replica or a plain SQL query first; add analytics only if it really strains', score: 2, effects: { 'cost': 15, 'system stability': 5 }, feedback: 'Boring first. A weekly report over a modest dataset is well within Postgres, and you avoid another system to run.' },
            { label: 'Adopt the analytics database now to be ready for the future', score: 0, effects: { 'cost': -20, 'speed to ship': -10 }, feedback: 'A new store to sync and operate for a problem you have not proved exists. Wait for evidence.' },
            { label: 'Export to a spreadsheet by hand each week', score: 1, effects: { 'speed to ship': -10, 'cost': 5 }, feedback: 'Cheap but fragile and manual. A saved SQL query is just as simple and repeatable.' }
          ] }
      ],
      outro: 'The pattern: boring default, then one specialist for each named, evidenced problem, with one source of truth.' },

    { type: 'explain', prompt: 'You are asked: "Which database should we use?" Describe how you would answer, in your own words.',
      model: 'I would not answer with a product name first. I would ask how the data will be written and read: the main access patterns, volumes, how consistent reads must be and what queries we need. Then I would try the boring default, Postgres, and only add a specialist, such as Redis, a search engine or a time-series database, for a specific named problem it handles badly. I would keep one source of truth, count the operational cost of every extra store, and justify the choice against the access patterns rather than hype.',
      keywords: ['access patterns', 'Postgres', 'boring', 'specialist', 'source of truth', 'consistency', 'cost'] }
  ],

  flashcards: [
    { q: 'What should drive the choice of a database?', a: 'Access patterns: what you store, how you write it, how you read it, how current reads must be and at what scale.' },
    { q: 'What is polyglot persistence?', a: 'Using several kinds of database in one system, each for the job it suits, with one authoritative source of truth.' },
    { q: 'Why default to a boring relational database?', a: 'It is proven, widely understood, transactional and flexible, and it handles most workloads at realistic scale.' },
    { q: 'What are the costs of adding another database?', a: 'Syncing and consistency between stores, operations, skills and more things to fail.' },
    { q: 'Name common ways to choose a database badly.', a: 'Resume-driven design, premature scale, following hype, forcing one tool onto every job, and ignoring consistency needs.' },
    { q: 'When is a specialist store justified?', a: 'When you can name a specific access pattern or scale the boring option demonstrably fails to handle.' }
  ],

  glossary: [
    { term: 'Access pattern', def: 'A specific way your application reads or writes data, such as "latest 20 messages in a room" or "orders by customer".', like: 'The routes people actually walk through a building, which tell you where to put the doors.' },
    { term: 'Polyglot persistence', def: 'Using different kinds of database within one system, each chosen for the job it does best.', like: 'A kitchen with a knife, a pan and an oven, not one tool for everything.' },
    { term: 'Source of truth', def: 'The one authoritative store for a piece of data; copies and caches elsewhere can be rebuilt from it.', aka: ['system of record'], like: 'The master ledger; the notes in other books are copies.' },
    { term: 'Boring technology', def: 'Proven, widely understood technology with well-known failure modes, chosen on purpose to save novelty for what matters.', like: 'A sturdy family saloon rather than a prototype sports car.' }
  ],

  takeaways: [
    '**Start from access patterns**: how you will read, write and how current reads must be.',
    '**Default to boring**: Postgres first; add a specialist only for a named, evidenced problem.',
    '**Polyglot persistence** is powerful but costly: keep **one source of truth**, count the cost of syncing and operating each store.',
    'Avoid resume-driven design, premature scale and hype; justify choices against the patterns.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('nosql', {
  title: 'The Many-Headed Hydra',
  intro: 'Each head of the Hydra speaks a different data model and sneers at the others. Beat it by matching the right database to the job, spotting a weak design, and remembering that boring is often best.',
  questions: [
    { type: 'mcq', q: 'A team says their NoSQL database is "schemaless", so structure no longer matters. What is the best correction?',
      options: ['The structure has moved into application code, which must cope with varying shapes', 'Schemaless databases invent a clean structure automatically', 'Structure matters only for relational databases', 'Records in NoSQL databases cannot contain nested data'],
      answer: 0,
      why: [null, 'Nothing infers a consistent shape for you.', 'Every program depends on the shape of its data.', 'Nested data is a core strength of document stores.'],
      explain: 'Flexible schemas mean schema-on-read: your code assumes the shape, so the data can drift unless you validate and migrate.' },

    { type: 'ab', q: 'A blog post may get tens of thousands of comments. Which design is better in a document database?',
      a: { lang: 'json', label: 'Embed', src: `
        { "title": "Hello",
          "comments": [ /* unbounded list */ ] }` },
      b: { lang: 'json', label: 'Reference', src: `
        { "_id": "p1", "title": "Hello" }
        { "postId": "p1", "text": "Nice" }` },
      answer: 'b',
      explain: 'An unbounded list embedded in one document makes it huge and slow to rewrite. Comments in their own collection, linked by postId, can grow without limit.' },

    { type: 'short', q: 'In DynamoDB, which key decides which machine stores an item: the partition key or the sort key? Give the first word.', accept: ['partition'], hint: 'It is not the one that orders items within a partition.',
      explain: 'The partition key places the item; the sort key orders items inside that partition so you can read ranges.' },

    { type: 'match', prompt: 'Match each database to the job it is built for.',
      pairs: [['Redis', 'In-memory key-value with rich structures'], ['Cassandra', 'Huge write volumes, read by partition key'], ['ClickHouse', 'Fast analytics scanning a few columns of billions of rows'], ['Neo4j', 'Following relationships with Cypher'], ['InfluxDB', 'Timestamped measurements with retention and downsampling']] },

    { type: 'bucket', prompt: 'Row storage or column storage?', buckets: ['Row storage', 'Column storage'],
      items: [['Load one order with all its fields', 0], ['Update a customer\'s email', 0], ['Insert a new user', 0], ['Average basket value per country across billions of rows', 1], ['Count page views per hour over a year', 1], ['Sum revenue per product from an event log', 1]],
      explain: 'Whole-record work belongs with row storage; wide scans over a few columns belong with column storage.' },

    { type: 'spot', prompt: 'This time-series point will create millions of separate series. Tap the offending tag.',
      code: { lang: 'text', src: `
        temps,sensor=a12,site=leeds,reading_id=88231 value=21.4 1700000000000000000` },
      lines: [1],
      explain: '`reading_id` is unique for every point, so each point becomes its own series (high cardinality). Keep tags to a small set of labels like sensor and site.' },

    { type: 'order', prompt: 'Put the steps of building a search index in order.',
      items: ['Split text into tokens', 'Lowercase and remove stop words', 'Stem the words to their roots', 'Store each term with the documents containing it', 'Look up the query\'s terms and rank the matches'],
      explain: 'Analysis happens before indexing, and the same analysis is applied to queries, so lookups and ranking operate on matching terms.' },

    { type: 'tf', statement: 'A search engine such as Elasticsearch is a good choice as the only, primary store for your orders.', answer: false,
      explain: 'Search indexes are near-realtime and lack strong transactions and constraints. Keep orders in a database of record and treat the index as a rebuildable copy.' },

    { type: 'mcq', q: 'Which question is a graph database best suited to answer quickly?',
      options: ['Which accounts are linked to this one through shared devices, up to four hops away?', 'What is the total revenue per month this year?', 'What is the current value stored under session key abc123?', 'Which articles contain the word "lighthouse"?'],
      answer: 0,
      why: [null, 'A tidy aggregate across everything suits a columnar or relational store.', 'A direct lookup by key suits a key-value store.', 'A word lookup suits a search index.'],
      explain: 'Multi-hop traversal across connections is the graph database\'s reason to exist. The other questions each belong to a different family.' },

    { type: 'multi', q: 'Which statements about realtime databases like Firestore are true?',
      options: ['Clients subscribe and the database pushes changes to them', 'They can keep a local copy so apps work offline and sync later', 'Costs can grow with the number of reads and listeners', 'They make vendor lock-in impossible', 'They replace the need for security rules because clients are trusted'],
      answers: [0, 1, 2],
      explain: 'Push, offline sync and usage-based costs are real. Lock-in is a genuine risk, and since clients connect directly, security rules are essential.' },

    { type: 'cloze', text: 'BASE stands for Basically Available, Soft state and {{Eventual}} consistency. Polyglot persistence needs one {{source of truth}}, with other stores acting as copies or {{caches}}.',
      distractors: ['Atomic', 'primary key', 'replicas of replicas'],
      explain: 'BASE trades strict consistency for availability. In a polyglot system the other stores should be rebuildable from the authoritative one.' },

    { type: 'mcq', q: 'A four-person team is starting a booking platform with a few thousand expected users. What is the wisest database plan?',
      options: ['Postgres for everything, adding specialists only when a named need appears', 'Five specialist databases, ready for any future scale', 'A document database, because designing tables is slow', 'A graph database, because bookings have relationships'],
      answer: 0,
      why: [null, 'Each extra store costs syncing, operations and expertise before it is needed.', 'The design work does not vanish; it becomes inconsistent data and code.', 'Almost all data has relationships; deep traversals are the real test.'],
      explain: 'Boring and general first. You gain transactions, joins and tooling, and you add a specialist only with evidence.' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.sheet('nosql', {
  title: 'NoSQL & Search: cheat sheet',
  sections: [
    { title: 'Why NoSQL, and ACID vs BASE',
      md: `NoSQL = **many different non-relational databases**, each trading something (joins, strict ACID) for a flexible shape, speed or scale-out.

        - **Schema-on-read**: structure lives in your code ("schemaless").
        - **Scale up** = bigger box; **scale out** = more machines.
        - **ACID**: atomic, consistent, isolated, durable.
        - **BASE**: basically available, soft state, eventual consistency.

        Relational (Postgres) is a fine default.` },

    { title: 'The families',
      md: `| Family | Examples | Shines at |
        |---|---|---|
        | Document | MongoDB, CouchDB | Nested objects, varying shape; CouchDB syncs |
        | Key-value | Redis, DynamoDB | Fast lookup by key, caches, sessions |
        | Wide-column | Cassandra, ScyllaDB | Huge writes, read by partition key |
        | Columnar | ClickHouse | Analytics over billions of rows |
        | Graph | Neo4j, Neptune, Dgraph | Multi-hop relationships |
        | Time-series | InfluxDB, TimescaleDB | Timestamped streams |
        | Realtime | Firestore, RethinkDB | Pushed changes, offline sync |
        | Search | Elasticsearch, Solr | Ranked free-text search |` },

    { title: 'Documents and key-value',
      md: `**Embed** small, bounded data that belongs to one parent and is read with it. **Reference** shared, huge or independently changing data (extra read).

        Redis: in memory; strings, hashes, lists, sets, sorted sets; \`SET key v EX 60\` for TTL; \`INCR\` is atomic.

        DynamoDB: **partition key** picks the machine, **sort key** orders within it. **Design from access patterns first**; avoid scans and hot keys.` },

    { title: 'Wide-column, columnar, graph',
      md: `- **Cassandra/Scylla**: partition key places data, clustering column orders it. Writes are appends (LSM tree). Always query by partition key.
        - **Row vs column storage**: rows suit whole-record work (OLTP); columns suit scanning a few columns (OLAP: ClickHouse).
        - **Graph**: nodes, edges, properties. Traversals follow links, joins search. Cypher: \`(a)-[:FOLLOWS*2]->(b)\`. Use when the traversal is the point.` },

    { title: 'Time-series and realtime',
      md: `**Time series**: timestamped, appended, queried by range. **Downsample** old data to summaries; **retention policy** deletes expired data. InfluxDB: measurement, **tags** (low-cardinality labels), **fields** (values). TimescaleDB = Postgres extension.

        **Realtime**: subscribe once, changes are pushed. Firestore \`onSnapshot\`; RethinkDB \`.changes()\`. Offline sync queues writes; know your conflict rule. Watch lock-in and per-read costs.` },

    { title: 'Search engines',
      md: `\`LIKE '%word%'\` scans everything and ignores typos and ranking.

        **Inverted index**: word to documents. **Analysis**: tokenise, lowercase, stop words, stem (same pipeline on queries). **Relevance**: TF-IDF/BM25 intuition plus boosts.

        Elasticsearch and Solr (both Lucene) are **secondary stores**: near-realtime, no strong transactions, rebuildable. Keep the truth elsewhere.` },

    { title: 'Choosing a database',
      md: `1. Write down the **access patterns** (reads, writes, volumes, how current reads must be).
        2. Try the **boring default** (Postgres) at your real scale.
        3. Name the specific strain, with evidence.
        4. Add a **specialist for that one job**; keep **one source of truth**.
        5. Count the cost: syncing, operations, skills.

        Avoid resume-driven design, premature scale, hype and one-tool-for-everything.` }
  ]
});
