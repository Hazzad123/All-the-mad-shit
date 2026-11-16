/* Module: enterprise-software — Enterprise Software.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs enterprise-software */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('es-landscape', {
  eli5: 'Big companies run on a handful of giant packaged programs, each the official home for one kind of information: money and stock, customers, documents, or approvals.',

  cards: [
    { kind: 'concept', title: 'Meet Hollis Hardware',
      body: `Hollis Hardware sells tools and paint through 40 shops and a website. It started with one spreadsheet. Now:

        - Finance has its own spreadsheet of invoices
        - The warehouse has another, for stock
        - Sales keeps customer details in a shared notebook
        - Contracts live in someone’s email

        A customer rings to ask where their drill is. Answering takes four people and an afternoon. This is the problem **enterprise software** exists to solve: packaged systems that a whole organisation shares, instead of one-off tools each team invents.` },

    { kind: 'metaphor', title: 'A town hall with departments',
      body: `Think of a town hall. There is a records office, a tax office, a planning department and a permits desk. Each keeps *its own* files and has its own rules, forms and staff.

        You do not ask the planning department about your council tax. Each office is the **official home** for one kind of information.

        A company’s software landscape works the same way. Each big system is one department, and the interesting (and painful) part is how they talk to each other.

        Where it stops being true: a town hall does not usually let a visitor shout "just add a button" at the tax office. Software departments are bought from vendors, who have opinions.` },

    { kind: 'compare', title: 'The four acronyms you will hear daily',
      body: 'Four categories cover most of what big organisations buy. Here is each one at Hollis Hardware.',
      cols: ['What it looks after', 'At Hollis'],
      rows: [
        ['**ERP**: Enterprise Resource Planning', 'Money, stock, buying, payroll', 'Records every sale, supplier invoice and pay slip'],
        ['**CRM**: Customer Relationship Management', 'Who customers are and how we deal with them', 'Tracks a trade customer’s calls, quotes and complaints'],
        ['**DMS**: Document Management System', 'Documents, versions and who may see them', 'Stores signed supplier contracts and safety certificates'],
        ['**BPM**: Business Process Management', 'The *flow* of work between people and systems', 'Routes a new-supplier request through checks and approvals']
      ] },

    { kind: 'concept', title: 'ERP: the back office in one database',
      body: `Before ERP, each department’s data sat in its own program, and people re-typed numbers between them.

        An **ERP** puts finance, stock, purchasing, sales orders and payroll on **one shared database** with one set of rules.

        When a shop sells a drill, a single event does several jobs: stock drops by one, the till money is recorded, the reorder level is checked, and the ledger is updated. Nobody re-types anything.

        ERPs are big, expensive and slow to change, which is why companies tend to keep them for decades. The next lesson looks at SAP, the best-known one.` },

    { kind: 'diagram', title: 'Hollis’s software landscape',
      body: 'This is roughly what a mid-sized company ends up with. Arrows show data flowing between systems.',
      nodes: [
        { id: 'web', label: 'Web shop', icon: '🛒', x: 1, y: 0 },
        { id: 'crm', label: 'CRM', icon: '🤝', x: 0, y: 1, tone: 'info' },
        { id: 'erp', label: 'ERP', icon: '🏭', x: 2, y: 1, tone: 'accent' },
        { id: 'bpm', label: 'BPM (approvals)', icon: '🔀', x: 1, y: 2, tone: 'warn' },
        { id: 'dms', label: 'Document system', icon: '🗄️', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'web', to: 'erp', label: 'orders' },
        { from: 'web', to: 'crm', label: 'new customers' },
        { from: 'crm', to: 'erp', label: 'customer data', both: true },
        { from: 'bpm', to: 'erp', label: 'approved requests' },
        { from: 'bpm', to: 'dms', label: 'contracts' }
      ],
      caption: 'Every arrow is something a developer has to build, run and keep working.' },

    { kind: 'concept', title: 'Systems of record: who is right?',
      body: `Hollis’s customer **Dev Patel** appears in three places: the web shop, the CRM and the ERP. He moves house and updates his address on the website. Which copy is now correct?

        A **system of record** is the one system officially responsible for a kind of data. Its copy wins when there is a disagreement, and other systems either read from it or hold copies that may be stale.

        Hollis might say: the ERP is the system of record for *orders and invoices*, the CRM for *customer contact details*, the DMS for *signed contracts*.

        If nobody decides this, you get three Dev Patels and a lot of returned post.` },

    { kind: 'realworld', title: 'Why an architect must know the vendors',
      body: `You might wonder why a backend course has a module on products you did not build. Because as an architect you will almost never work on an empty field.

        - These systems hold the company’s money, staff and customers, so they cannot be switched off for a rewrite
        - They are built and updated by vendors, so you inherit their rules, their quirks and their release calendar
        - They outlive most code, so your new services will have to *live next to them* for years

        You do not need to be an expert in every product. You need to know what each category does, who the big names are, and where it will hurt when you connect to it.` },

    { kind: 'steps', title: 'Buy, build or integrate?',
      body: 'Whenever Hollis needs a new capability, there are three moves. Ask these in order.',
      steps: [
        { title: 'Is it a commodity?', body: 'Payroll, accounting and HR work the same at almost every company. **Buy** a package. Writing your own payroll is a very expensive way to learn tax law.' },
        { title: 'Is it your edge?', body: 'If it is what makes Hollis different (say, a clever delivery-slot planner), **build** it. Packages give you what your competitors also have.' },
        { title: 'Does it already exist nearby?', body: 'Before buying or building anything, check whether a system you already own can do it. If so, **integrate**: connect to it instead of duplicating it.' },
        { title: 'Count the whole cost', body: 'Buying has licences, consultants and upgrades. Building has maintenance forever. Integrating has glue code to keep alive. None is free.' }
      ] },

    { kind: 'pitfall', title: 'The two classic traps',
      body: `**Trap 1: building what you should have bought.** A team writes an in-house stock system because "ours is a bit special". Five years later, three people maintain it and nobody dares touch it.

        **Trap 2: bending a package until it snaps.** Hollis buys an ERP, then asks consultants to rewrite half of it to match old habits. Every vendor upgrade now breaks something, so they stop upgrading.

        A good question to ask early: *"Can we change our process to fit the product instead?"* Sometimes the answer is yes, and it is the cheapest option on the table.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each system to the question it answers best.',
      pairs: [['ERP', 'How much stock do we have, and what did we sell?'], ['CRM', 'When did we last speak to this customer?'], ['DMS', 'Where is the signed version of this contract?'], ['BPM', 'Who still needs to approve this request?']] },

    { type: 'mcq', after: 5, q: 'Dev Patel changes his address on the Hollis website. The CRM is the system of record for contact details. What should happen?',
      options: ['The new address flows to the CRM, which stays the official copy', 'Each system keeps its own address and they agree by luck', 'The ERP copy wins because it is the biggest system', 'The change is ignored until someone re-types it in the ERP'],
      answer: 0,
      explain: 'A system of record exists so there is one official answer. Changes reach it, and other systems copy from it, rather than every system holding its own truth.' },

    { type: 'tf', statement: 'An ERP is mainly a tool for the sales team to track customer conversations.', answer: false,
      explain: 'That job belongs to a CRM. An ERP covers the back office: money, stock, purchasing and payroll, on one shared database.' },

    { type: 'bucket', prompt: 'Which kind of system is the natural home for each task?', buckets: ['ERP', 'CRM', 'DMS', 'BPM'],
      items: [['Posting a supplier invoice to the ledger', 0], ['Logging a trade customer’s complaint call', 1], ['Keeping version history of a safety certificate', 2], ['Routing a refund over £500 to a manager for sign-off', 3], ['Running monthly payroll', 0], ['Tracking a sales lead through quote stages', 1], ['Restricting who can open staff contracts', 2], ['Escalating a request automatically if nobody answers in 2 days', 3]],
      explain: 'Match the verb to the system: *post and pay* is ERP, *relate* is CRM, *file and protect* is DMS, *route and approve* is BPM.' },

    { type: 'multi', q: 'Which of these are good reasons to **buy** a package instead of building?',
      options: ['The need is common to most companies, such as accounting', 'The vendor has already handled regulations like tax rules', 'It is the feature that makes your company special', 'You want something nobody else in your industry has', 'Maintaining your own version forever would cost more'],
      answers: [0, 1, 4],
      explain: 'Commodity needs and regulation-heavy areas favour buying. Anything that gives you a competitive edge is usually worth building, because a package gives the same thing to your rivals.' },

    { type: 'short', q: 'What do we call the one system officially responsible for a kind of data, whose copy wins in a disagreement? (three words)', accept: ['system of record', 'the system of record', 'systems of record'], hint: 'Its name says what it does with the data.',
      explain: 'The **system of record** is the authoritative owner of that data. Every other copy is a convenience.' },

    { type: 'scenario', title: 'Three requests on one Monday', intro: 'You are the architect at Hollis Hardware. Three requests land on your desk. For each, decide: buy, build or integrate.',
      meters: { 'budget': 70, 'future pain': 20 },
      steps: [
        { text: 'HR wants a system for holiday requests, payslips and contracts of employment.',
          choices: [
            { label: 'Buy a standard HR package or use the ERP’s HR part', score: 2, effects: { 'budget': -10 }, feedback: 'Right. Every company does HR roughly alike, and employment law changes, so let a vendor carry that burden.' },
            { label: 'Build an in-house HR system', score: 0, effects: { 'budget': -30, 'future pain': 25 }, feedback: 'It feels cheap at first. Then the law changes, someone leaves, and you are maintaining a payroll engine nobody understands.' },
            { label: 'Keep using spreadsheets', score: 1, effects: { 'future pain': 15 }, feedback: 'It costs nothing today, and it will not survive an audit or a growing company.' }
          ] },
        { text: 'The head of delivery has an idea: promise customers a two-hour delivery slot by combining van locations, traffic and stock. No product does exactly this.',
          choices: [
            { label: 'Build it as a service, fed by data from the ERP', score: 2, effects: { 'budget': -20, 'future pain': -5 }, feedback: 'This is your edge, so it is worth owning. Notice it still *uses* the ERP’s data instead of replacing it.' },
            { label: 'Ask the ERP vendor to customise the ERP to do it', score: 1, effects: { 'budget': -25, 'future pain': 15 }, feedback: 'Possible, but you will be locked into the vendor’s release cycle for something that differentiates you.' },
            { label: 'Buy the closest package and live with the gap', score: 0, effects: { 'future pain': 15 }, feedback: 'Then Hollis offers the same thing as everyone else, which was the point of avoiding it.' }
          ] },
        { text: 'Sales have started a second customer database because the CRM is awkward. Now two lists disagree.',
          choices: [
            { label: 'Declare one system of record for customers and sync the other from it', score: 2, effects: { 'future pain': -10 }, feedback: 'Yes. Decide who owns the data, then integrate so the copy follows the original.' },
            { label: 'Merge the two lists by hand every month', score: 0, effects: { 'future pain': 15 }, feedback: 'It works until the month someone is on holiday. Manual syncing always drifts.' },
            { label: 'Let both live and trust the newer entry', score: 1, effects: { 'future pain': 10 }, feedback: '"Newest wins" sounds fair, but it silently overwrites correct data with typos.' }
          ] }
      ],
      outro: 'Buy the boring things, build your edge, and **integrate** rather than duplicate.' },

    { type: 'explain', prompt: 'A new colleague asks: "What actually is an ERP, and why can’t each department just use its own program?" Answer in your own words.',
      model: 'An ERP is one big shared system for the back office: money, stock, buying, sales orders and payroll all on one database. If each department used its own program, people would re-type numbers between them, the copies would disagree, and nobody could see the whole picture. One shared system of record avoids that.',
      keywords: ['shared', 'database', 'finance', 'stock', 'system of record', 'one'] }
  ],

  flashcards: [
    { q: 'What does ERP stand for, and what does it cover?', a: 'Enterprise Resource Planning. The back office on one shared database: finance, stock, purchasing, sales orders, payroll.' },
    { q: 'What is the difference between a CRM and an ERP?', a: 'A CRM manages relationships with customers (contacts, leads, cases). An ERP manages internal operations and money (orders, stock, ledger, payroll).' },
    { q: 'What do DMS and BPM systems do?', a: 'A DMS stores and controls documents and their versions. A BPM system models and runs the flow of work and approvals between people and systems.' },
    { q: 'What is a system of record?', a: 'The one system officially responsible for a kind of data. Its copy wins when copies disagree.' },
    { q: 'When should a company buy, build or integrate?', a: 'Buy commodity capabilities, build the things that give you an edge, and integrate with existing systems instead of duplicating them.' }
  ],

  glossary: [
    { term: 'Enterprise software', def: 'Packaged systems shared by a whole organisation to run its operations, usually bought from a vendor and customised a little.', like: 'The town hall’s departments rather than one person’s notebook.' },
    { term: 'ERP', def: 'Enterprise Resource Planning: one shared system for finance, stock, purchasing, sales orders and payroll.', like: 'The company’s master ledger and warehouse book combined.', aka: ['Enterprise Resource Planning'] },
    { term: 'CRM', def: 'Customer Relationship Management: a system tracking customers, leads, conversations and support cases.', like: 'A very good memory for every customer you have ever spoken to.', aka: ['Customer Relationship Management'] },
    { term: 'DMS', def: 'Document Management System: stores documents with version history, permissions and retention rules.', like: 'A fireproof filing cabinet with a librarian who logs every access.', aka: ['Document Management System'] },
    { term: 'BPM', def: 'Business Process Management: modelling, running and monitoring the flow of work, such as approvals, across people and systems.', like: 'A conveyor belt with checkpoints and a supervisor.', aka: ['Business Process Management'] },
    { term: 'System of record', def: 'The system officially responsible for a type of data. When copies disagree, this one is right.', like: 'The land registry: whatever it says, goes.' }
  ],

  takeaways: [
    '**Enterprise software** = shared, packaged systems that run the business, and you will inherit them.',
    '**ERP** runs the back office, **CRM** the customer relationships, **DMS** the documents, **BPM** the flow of work.',
    'Every kind of data needs one **system of record**, or you get several competing truths.',
    '**Buy** commodities, **build** your edge, **integrate** instead of duplicating.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('es-sap', {
  eli5: 'SAP makes the best-known ERP: one giant system where a company’s money, stock, buying and payroll all live, backed by a very fast in-memory database and a reporting tool.',

  cards: [
    { kind: 'concept', title: 'One sale, ten jobs',
      body: `A Hollis shop sells a £60 drill. Behind the till, a surprising number of things must happen:

        - stock of drills goes down by one
        - the shop’s sales figure goes up
        - the money is booked in the ledger
        - if stock is low, a purchase order goes to the supplier
        - the sales rep’s commission is updated

        Each of these used to be a different department’s program. An [[ERP]] does all of them in one transaction against one database, so the numbers can never disagree. **SAP** is a German software company, and its ERP is the one most people name first, especially in large manufacturers and retailers.` },

    { kind: 'metaphor', title: 'One shared ledger, many desks',
      body: `Imagine a huge accounting office with one enormous ledger on a central table. Every desk (sales, purchasing, warehouse, payroll) has its own forms and its own clerk, but **they all write into the same ledger**.

        When the sales clerk records a sale, the warehouse clerk sees stock drop and the finance clerk sees income rise. No phone calls, no re-typing.

        That is an ERP. The desks are **modules**; the ledger is the **database** underneath. The trade-off is that the whole office must agree on how the ledger is laid out, which is why changing it is slow.` },

    { kind: 'compare', title: 'SAP’s modules, at a high level',
      body: 'SAP splits the ERP into modules, each owning one area. You will hear them by their short names. This is the high-level map, not a complete list.',
      cols: ['Short name', 'Looks after'],
      rows: [
        ['Financials', '**FI** / **CO**', 'The ledger, payables, receivables, and cost tracking'],
        ['Materials Management', '**MM**', 'Buying from suppliers and managing stock'],
        ['Sales & Distribution', '**SD**', 'Customer orders, pricing, delivery and invoicing'],
        ['Production Planning', '**PP**', 'What to make, when, and with which parts'],
        ['Human Capital Management', '**HCM**', 'Employees, time off and payroll']
      ],
      },

    { kind: 'sequence', title: 'Order to cash through the modules',
      body: 'One customer order travels through several modules. Step through it.',
      actors: ['Customer', 'Sales (SD)', 'Stock (MM)', 'Finance (FI)'],
      steps: [
        { from: 0, to: 1, label: 'order 10 drills', note: 'A trade customer orders. The sales module checks the price list and creates a **sales order**.' },
        { from: 1, to: 2, label: 'is stock available?', note: 'Sales asks the stock module. It reserves 10 drills so nobody else can sell them.' },
        { from: 2, to: 1, label: 'reserved', dashed: true, note: 'The reservation is confirmed against the *same* database, so there is no waiting for a nightly sync.' },
        { from: 1, to: 0, label: 'delivery + invoice', note: 'Goods leave the warehouse and stock falls. An invoice is produced.' },
        { from: 1, to: 3, label: 'post invoice', note: 'Finance books the invoice as money owed to Hollis, automatically.' },
        { from: 0, to: 3, label: 'payment arrives', note: 'When the customer pays, finance matches it to the invoice and closes the loop. This whole journey is called **order-to-cash**.' }
      ] },

    { kind: 'concept', title: 'HANA: the database that lives in memory',
      body: `A normal database keeps data on disk and pulls pieces into memory when needed. Disks are slow compared with memory, as you saw in the caching world.

        **SAP HANA** is a database designed around a different idea: keep the working data **in RAM** and use disk mainly for safety (so nothing is lost on a power cut). It also stores tables by **column** instead of by row, which is brilliant for questions like "total sales by region", because it only reads the one column it needs.

        The payoff: reports that took hours on old systems can run in seconds, and the same database can handle both day-to-day transactions and big analysis.` },

    { kind: 'compare', title: 'A classic database vs HANA’s approach',
      body: 'Neither is "better" in general. HANA is tuned for a specific mix of workloads.',
      cols: ['Disk-based, row-oriented', 'HANA-style: in-memory, column-oriented'],
      rows: [
        ['Where data is read from', 'Disk, with memory as a cache', 'Memory first; disk for durability'],
        ['Great at', 'Reading or changing one whole record', 'Summing or filtering one field over millions of rows'],
        ['Reporting load', 'Often copied elsewhere to avoid slowing the system', 'Can run on the live data'],
        ['Cost', 'Cheaper per gigabyte', 'Memory is expensive, so the hardware bill is bigger']
      ] },

    { kind: 'concept', title: 'BusinessObjects: asking questions of the data',
      body: `The finance director wants "margin by product line, by region, this quarter". She does not want to write SQL, and you do not want her running a heavy query against the live ERP at month end.

        **SAP BusinessObjects** is a family of **reporting and business-intelligence** tools: designers define a friendly layer over the data ("Region", "Margin") and people then build reports and dashboards by dragging those names around. Well-known pieces include Crystal Reports for pixel-perfect documents like invoices.

        Reporting tools like this usually read from a copy of the data (a warehouse) or a fast engine like HANA, so reports do not slow down the people entering orders.` },

    { kind: 'code', title: 'Integrating: ask SAP through its front door',
      body: 'Your new web service needs an order from SAP. Modern SAP systems expose business data through **APIs** (often REST-style OData). The shape is typically like this. Tap the lines.',
      code: { lang: 'http', src: `
        GET /sap/api/sales-orders/4500123 HTTP/1.1
        Host: erp.hollis.example
        Authorization: Bearer <token>
        Accept: application/json

        HTTP/1.1 200 OK
        {"id": "4500123", "customer": "C-1042", "status": "OPEN"}`,
        notes: {
          1: 'A normal REST-style call, like those in the API world. The path here is illustrative; real systems have their own naming.',
          3: 'The usual authentication applies. Never share one all-powerful login between every integration.',
          7: 'The reply is just business data. Behind it, SAP applied *its own rules* (authorisations, validation) before answering.'
        } },
      note: 'Older SAP integrations use **RFC** and **BAPI** (callable business functions) and **IDoc** (a standard document format for passing business data between systems). You will meet them in legacy estates.' },

    { kind: 'pitfall', title: 'Never write straight into SAP’s tables',
      body: `It is tempting: you can see the database, so why not insert the row yourself? Because the business rules live in SAP’s code, not in the tables.

        A direct write can skip validation, leave related records inconsistent, break audit trails, and may void your support contract. Updates from the vendor can also rearrange the tables with no warning.

        Go through the supported doors: APIs, BAPIs, IDocs, or events published by SAP. Think of SAP as a bank counter: you do not walk into the vault and move money yourself, even if the door is open.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each SAP area to the work it covers.',
      pairs: [['FI / CO', 'The ledger, payables, receivables and cost tracking'], ['MM', 'Buying from suppliers and managing stock'], ['SD', 'Customer orders, pricing, delivery and invoicing'], ['PP', 'Planning what to produce and with which parts'], ['HCM', 'Employees, time off and payroll']] },

    { type: 'order', after: 3, prompt: 'Put the order-to-cash journey in order.',
      items: ['The customer places an order and sales creates a sales order', 'Stock is checked and reserved', 'Goods are delivered and stock goes down', 'An invoice is created and booked by finance', 'The customer’s payment is matched to the invoice'],
      explain: 'You cannot reserve stock without an order, ship before reserving, invoice before shipping, or match a payment before there is an invoice to match it to.' },

    { type: 'mcq', after: 6, q: 'Why is a column-oriented, in-memory database good for "total sales by region over 50 million rows"?',
      options: ['It reads only the columns it needs, straight from fast memory', 'It stores each customer’s whole record together on disk', 'It copies the data to a spreadsheet first', 'It avoids doing any calculation at all'],
      answer: 0,
      why: [null, 'That describes a row store, which is good for fetching one whole record, not summing one field.', 'Nothing is copied to a spreadsheet; it works on the data directly.', 'It still calculates; it is simply much faster at scanning one field.'],
      explain: 'Summing sales per region needs just two columns. A column store reads only those two, and memory is far faster than disk.' },

    { type: 'tf', statement: 'SAP HANA keeps data only in memory, so a power cut would lose everything.', answer: false,
      explain: 'HANA works on data in memory for speed, but it also writes to disk (logs and snapshots) so it can recover after a restart.' },

    { type: 'bucket', prompt: 'Which SAP piece fits each description?', buckets: ['ERP modules', 'HANA', 'BusinessObjects'],
      items: [['Books the supplier invoice to the ledger', 0], ['Keeps working data in RAM and stores by column', 1], ['Lets a manager drag "Margin" and "Region" into a dashboard', 2], ['Reserves stock for a customer order', 0], ['Speeds up analysis over millions of rows', 1], ['Produces a formatted invoice document', 2]],
      explain: 'The modules are the *business logic*, HANA is the *database underneath*, and BusinessObjects is the *reporting layer on top*.' },

    { type: 'spot', prompt: 'A new integration needs to mark an order as shipped in SAP. Tap the line that is a bad idea.',
      code: { lang: 'js', src: `
        async function markShipped(orderId) {
          // 1. our own checks
          if (!orderId) throw new Error('no order');
          // 2. tell SAP
          await sapDb.query(
            "UPDATE sales_orders SET status = 'SHIPPED' WHERE id = ?",
            [orderId]);
        }` },
      lines: [6],
      explain: 'Writing directly into the ERP’s database skips its business rules, stock postings and audit trail. Use the supported API or BAPI so SAP does the update itself.' },

    { type: 'short', q: 'In ERP, what does the final R in "ERP" stand for? (one word: Enterprise ... Planning)', accept: ['resource', 'resources'], hint: 'It is what the company is planning to use well: money, people, stock.',
      explain: 'Enterprise **Resource** Planning: managing the resources a company runs on, in one place.' },

    { type: 'scenario', title: 'Month-end meltdown', intro: 'At Hollis, the finance team runs huge reports on the live SAP ERP at month end. The order desk complains that the system crawls and shop tills time out.',
      meters: { 'system speed': 40, 'finance happiness': 50 },
      steps: [
        { text: 'Where should the heavy reporting go?',
          choices: [
            { label: 'Move reports to a reporting layer fed from a copy or a fast in-memory engine', score: 2, effects: { 'system speed': 35, 'finance happiness': 15 }, feedback: 'Exactly. Heavy analysis should not fight with order entry. Separate the two workloads.' },
            { label: 'Ban finance from running reports at month end', score: 0, effects: { 'finance happiness': -30 }, feedback: 'Month end is when finance needs the numbers most. You have swapped one problem for another.' },
            { label: 'Buy bigger servers and change nothing else', score: 1, effects: { 'system speed': 10 }, feedback: 'It may help for a while, but the two workloads still compete for the same resources.' }
          ] },
        { text: 'A developer proposes a quick fix: copy finance data into another system by querying SAP’s tables directly every night.',
          choices: [
            { label: 'Use supported extraction (APIs, extractors or replication tools) instead', score: 2, effects: { 'system speed': 5, 'finance happiness': 10 }, feedback: 'Supported routes know the data model and survive upgrades. Raw table scraping tends to break at the next patch.' },
            { label: 'Approve it; reading is safe, so there is no risk', score: 1, effects: { 'system speed': -10 }, feedback: 'Reading does not corrupt data, but big raw queries can slow the live system and break when tables change.' },
            { label: 'Let the developer also write corrections back into the tables', score: 0, effects: { 'finance happiness': -20 }, feedback: 'Writing around the ERP’s rules is how ledgers stop balancing.' }
          ] }
      ],
      outro: 'Keep **transactions** and **analysis** apart, and always go through SAP’s supported doors.' },

    { type: 'explain', prompt: 'Explain to a colleague what an ERP like SAP does and why a "module" is not a separate program.',
      model: 'An ERP runs the back office (finance, stock, buying, sales, payroll) on one shared database. Modules are areas of that one system, each with its own screens and rules, but they write to the same data, so a sale in the sales module immediately changes stock and the ledger without anyone re-typing it.',
      keywords: ['shared', 'database', 'modules', 'finance', 'stock', 'one system'] }
  ],

  flashcards: [
    { q: 'What are SAP’s main ERP module areas?', a: 'Financials (FI/CO), Materials Management (MM), Sales & Distribution (SD), Production Planning (PP) and Human Capital Management (HCM), among others.' },
    { q: 'What is HANA and what makes it different?', a: 'SAP’s database. It keeps working data in memory and stores it by column, making analysis over huge tables very fast.' },
    { q: 'What is BusinessObjects for?', a: 'Reporting and business intelligence: friendly reports and dashboards built over the company’s data, such as Crystal Reports and Web Intelligence.' },
    { q: 'What is order-to-cash?', a: 'The journey from a customer order, through stock reservation, delivery and invoicing, to the payment being received and matched.' },
    { q: 'How should you integrate with SAP?', a: 'Through supported interfaces (APIs, BAPIs, IDocs, events), never by writing directly into its database tables.' }
  ],

  glossary: [
    { term: 'SAP', def: 'A software company and the name of its enterprise products, best known for its ERP.', like: 'The name on the biggest filing cabinet in the building.' },
    { term: 'SAP module', def: 'One functional area of the SAP ERP, such as finance or sales, sharing the same underlying data as the others.', like: 'A desk in the accounting office, all writing into one ledger.' },
    { term: 'HANA', def: 'SAP’s in-memory, column-oriented database, used under SAP’s newer ERP and for analytics.', like: 'A chef who keeps every ingredient on the counter instead of walking to the cupboard.', aka: ['SAP HANA'] },
    { term: 'In-memory database', def: 'A database that serves data from RAM rather than reading disk for each query, usually still logging to disk for safety.', like: 'Working from your head instead of looking things up in a book.' },
    { term: 'BusinessObjects', def: 'SAP’s family of reporting and business-intelligence tools for building reports and dashboards.', like: 'A window onto the company’s numbers.', aka: ['SAP BusinessObjects'] },
    { term: 'IDoc', def: 'SAP’s standard document format for passing business data, like orders or invoices, between systems.', like: 'A pre-printed form that every SAP system knows how to read.' }
  ],

  takeaways: [
    'An **ERP** runs many back-office jobs on **one shared database**, so a sale updates stock and the ledger together.',
    'SAP is organised into **modules**: finance, materials, sales, production, HR.',
    '**HANA** is an in-memory, column-oriented database; **BusinessObjects** is the reporting layer.',
    'Integrate with SAP through **APIs, BAPIs and IDocs**, never straight into its tables.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('es-dynamics-salesforce', {
  eli5: 'A CRM remembers every customer for the whole company, and Salesforce and Microsoft Dynamics 365 are rented platforms where you can also build your own apps on top of that memory.',

  cards: [
    { kind: 'concept', title: 'Priya’s sticky notes',
      body: `Priya sells to builders for Hollis Hardware. She has 300 contacts, and her memory is a pile of sticky notes: "Okafor Builders, wants quote for decking, call Thursday".

        Then Priya goes on holiday. A builder rings, nobody knows the history, and the quote goes to a rival.

        A **CRM** (Customer Relationship Management) system fixes this by giving the whole company one shared place for **who the customers are, what has been said to them, and what is in the pipeline**. Nobody’s notes walk out of the door.` },

    { kind: 'diagram', title: 'CRM in one picture',
      body: 'Almost every CRM is built around the same few things. Follow the arrows from left to right.',
      nodes: [
        { id: 'lead', label: 'Lead', icon: '🌱', x: 0, y: 0 },
        { id: 'opp', label: 'Opportunity (a deal)', icon: '💰', x: 1, y: 1, tone: 'accent' },
        { id: 'acc', label: 'Account (the company)', icon: '🏢', x: 1, y: 2, tone: 'good' },
        { id: 'con', label: 'Contact (a person)', icon: '🧑', x: 0, y: 2 },
        { id: 'case', label: 'Case (a problem)', icon: '🎧', x: 2, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'lead', to: 'opp', label: 'qualified' },
        { from: 'opp', to: 'acc', label: 'won' },
        { from: 'con', to: 'acc', label: 'works at', dashed: true },
        { from: 'acc', to: 'case', label: 'raises', dashed: true }
      ],
      caption: 'A lead is a maybe. Once it turns into a real deal and is won, the customer becomes an account with people and support cases attached.' },

    { kind: 'concept', title: 'Salesforce: a CRM that became a platform',
      body: `**Salesforce** began as a CRM that you reach through a web browser, rather than installing on your own servers. That model is **SaaS** (software as a service): you rent it, and the vendor runs it.

        Over time it grew into a **platform**. Data is stored as **objects** (think tables: Account, Contact, Opportunity), each with **fields** (columns) and **records** (rows). You can add your own objects and fields, build screens, automate steps, and write code.

        So a company can buy Salesforce for sales, then end up building a whole claims-handling app inside it. Hollis does this with a "trade-account application" app.` },

    { kind: 'metaphor', title: 'An apartment block, not a house',
      body: `Salesforce is **multi-tenant**: thousands of companies share the same underlying software and servers, each walled off in its own space. It is an apartment block, not a detached house.

        The landlord does the plumbing, security and upgrades, which is great. In exchange there are **house rules**: you cannot knock down walls or hog the lift.

        Salesforce enforces this with **governor limits**: caps on how much work a single piece of your code can do (queries, records changed, run time), so one tenant cannot slow everyone else. If your code is greedy, it simply stops with an error.` },

    { kind: 'compare', title: 'Configuring vs customising',
      body: 'The most important idea in this lesson. Both are ways of making a package fit you, but they cost very different amounts later.',
      cols: ['Configure (clicks)', 'Customise (code)'],
      rows: [
        ['What you do', 'Use admin screens: add fields, layouts, rules, visual automations', 'Write code or scripts that run on the platform'],
        ['Who can do it', 'A trained admin', 'A developer'],
        ['Survives vendor upgrades?', 'Very likely: it uses supported features', 'Usually, but you must test and fix breakage'],
        ['Example', 'Add a "Trade account number" field and make it required', 'Write a trigger that calls an outside credit-check service'],
        ['Rule of thumb', 'Try this first', 'Use when clicks genuinely cannot do it']
      ] },

    { kind: 'concept', title: 'Microsoft Dynamics 365: the other big name',
      body: `**Dynamics 365** is Microsoft’s business-applications suite. It covers the same CRM ground (sales, customer service, marketing) *and* ERP-style areas like finance and supply chain, sold as separate apps you can mix.

        Its data sits in **Dataverse**, Microsoft’s data layer, shared with the **Power Platform**: Power Apps for building screens, Power Automate for workflows.

        The big selling point is how snugly it sits beside the rest of Microsoft’s world: Outlook, Excel, Teams and Azure. A company already run on Microsoft often finds it the natural fit.

        Experts argue about which is better. Honestly it depends on what you already own and who you can hire.` },

    { kind: 'compare', title: 'Salesforce vs Dynamics 365, fairly',
      body: 'Both are mature, capable and widely used. The differences are about fit, not quality.',
      cols: ['Salesforce', 'Dynamics 365'],
      rows: [
        ['Roots', 'CRM, born in the cloud', 'Microsoft’s business suite, CRM and ERP'],
        ['Build on top with', 'Objects, Flow, Apex code, Lightning screens', 'Dataverse, Power Apps, Power Automate'],
        ['Strongest pull', 'A huge ecosystem and add-on marketplace (AppExchange)', 'Fits tightly with Microsoft 365 and Azure'],
        ['Reach it by API', 'REST and other APIs, with limits', 'Web API on Dataverse, OData style']
      ] },

    { kind: 'code', title: 'Connecting to a CRM by API',
      body: 'Your web shop wants to create a **lead** the moment someone fills in a trade-enquiry form. Both platforms expose REST-style APIs. Tap the lines.',
      code: { lang: 'js', src: `
        const res = await fetch(crmUrl + '/sobjects/Lead', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            LastName: 'Okafor',
            Company: 'Okafor Builders'
          })
        });`,
        notes: {
          1: 'An ordinary HTTP POST, just like the API lessons. This path follows Salesforce’s style; Dynamics’ Web API looks different but works the same way.',
          4: 'Logins use OAuth, so your service gets a token rather than a password.',
          8: 'Field names are the CRM’s, not yours. You adapt to *its* data model.'
        } },
      note: 'Both platforms limit how many API calls you may make per day. Batch your work, and never loop a call per record when a bulk call exists.' },

    { kind: 'pitfall', title: 'Customisation debt',
      body: `The CRM works. Then each department asks for "just one little change". Two years later there are 400 custom fields, 60 automations that trigger each other, and code nobody dares touch.

        Upgrades become scary, new staff cannot learn it, and moving to another vendor looks impossible.

        Protect yourself:
        - Ask "can we change the process?" before changing the system
        - Prefer configuration to code
        - Document every custom thing and give it an owner
        - Retire unused fields, like you would delete dead code` }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each CRM word to what it means.',
      pairs: [['Lead', 'A possible customer who has shown interest'], ['Opportunity', 'A real potential deal with a value and a stage'], ['Account', 'The customer organisation'], ['Contact', 'A person at that organisation'], ['Case', 'A customer’s problem or support request']] },

    { type: 'tf', after: 3, statement: 'In a multi-tenant platform like Salesforce, governor limits exist so one customer’s greedy code cannot slow down the others.', answer: true,
      explain: 'Many companies share the same infrastructure. Limits on queries, records and run time keep each tenant’s code from hogging it.' },

    { type: 'mcq', after: 4, q: 'Hollis wants to make the "Trade account number" field mandatory on every new account. What is the best first approach?',
      options: ['Configure it in the admin screens', 'Write custom code that rejects empty values', 'Export all accounts and fix them by hand', 'Build a separate system that checks it'],
      answer: 0,
      why: [null, 'Code works, but costs more to test, maintain and upgrade than a setting.', 'Manual fixes do not stop the next bad record being created.', 'A whole new system is huge overkill for one rule.'],
      explain: 'A required field is a standard setting. Configuring it uses supported features that survive upgrades and can be changed by an admin.' },

    { type: 'bucket', prompt: 'Is each change a configuration or a customisation?', buckets: ['Configure', 'Customise'],
      items: [['Add a "Preferred delivery day" picklist to the Account screen', 0], ['Write code that calls a credit-check service when a deal is created', 1], ['Reorder fields on a page layout', 0], ['Build a custom screen component with its own scripting', 1], ['Set a rule that emails a manager when a deal exceeds £20,000', 0], ['Create a nightly script to recalculate scores using custom logic', 1]],
      explain: 'If an admin can do it with settings and visual tools, it is configuration. If a developer must write and maintain code, it is customisation.' },

    { type: 'ab', q: 'Which approach is wiser to make sure no order over £20,000 is approved without a manager?',
      a: { lang: 'text', label: 'Platform setting', src: `
        Visual approval rule:
        IF amount > 20000
        THEN require manager approval` },
      b: { lang: 'text', label: 'Custom code', src: `
        Write and deploy a code trigger
        that blocks approval when
        amount > 20000 and no manager
        has signed off` },
      answer: 'a',
      explain: 'Both achieve the same result, but the visual rule is supported by the vendor, changeable by an admin and unlikely to break on upgrade. Code should be the fallback.' },

    { type: 'multi', q: 'Which of these are real strengths a company might weigh when picking between Salesforce and Dynamics 365?',
      options: ['Tight fit with Microsoft 365 and Azure (Dynamics)', 'A large marketplace of add-on apps (Salesforce)', 'Dynamics 365 only works for companies with fewer than 50 staff', 'Salesforce can only store contacts and nothing else', 'Both can be reached by API for integration'],
      answers: [0, 1, 4],
      explain: 'Fit with your existing tools, ecosystem and API access are all fair criteria. The other two options are myths.' },

    { type: 'short', q: 'In Salesforce, what is a table-like type of data, such as Account or Contact, called? (one word)', accept: ['object', 'objects', 'sObject', 'standard object'], hint: 'Developers use the same word for an instance of a class.',
      explain: 'Salesforce stores data as **objects**, with fields (columns) and records (rows).' },

    { type: 'scenario', title: 'The request that grows', intro: 'Hollis’s sales director asks for a "quick tweak" to the CRM. You are the architect and the platform is Salesforce.',
      meters: { 'upgrade safety': 80, 'delivery speed': 40 },
      steps: [
        { text: 'She wants salespeople to record which delivery day each customer prefers.',
          choices: [
            { label: 'Add a custom field and put it on the layout', score: 2, effects: { 'upgrade safety': 0, 'delivery speed': 30 }, feedback: 'Ten minutes of clicking. This is exactly what configuration is for.' },
            { label: 'Commission a developer to build a custom screen', score: 0, effects: { 'upgrade safety': -15, 'delivery speed': -20 }, feedback: 'You have built a mountain to store one dropdown.' },
            { label: 'Say no, because "we do not customise"', score: 1, effects: { 'delivery speed': -10 }, feedback: 'Principled, but configuration is not the danger. Saying no to everything just pushes people back to spreadsheets.' }
          ] },
        { text: 'Next she wants a credit check against an outside service whenever a deal is opened, using logic clicks cannot express.',
          choices: [
            { label: 'Write a small, well-documented piece of code, with tests, and name an owner', score: 2, effects: { 'upgrade safety': -5, 'delivery speed': 15 }, feedback: 'Clicks cannot do it, so code is justified. Tests and an owner stop it becoming debt.' },
            { label: 'Write it quickly with no tests; you can tidy up later', score: 0, effects: { 'upgrade safety': -30 }, feedback: '"Later" rarely comes, and the first platform upgrade will break it.' },
            { label: 'Skip it; credit checks are not the CRM’s job', score: 1, effects: { 'delivery speed': -10 }, feedback: 'A fair architectural view, but the business asked for it. A service outside the CRM could do it, at the cost of more integration.' }
          ] },
        { text: 'Finally, the web shop must create leads in the CRM when a visitor submits an enquiry form.',
          choices: [
            { label: 'Call the CRM’s REST API with a proper OAuth token, respecting API limits', score: 2, effects: { 'upgrade safety': 5, 'delivery speed': 10 }, feedback: 'The supported front door. It will keep working across upgrades and is easy to monitor.' },
            { label: 'Give the shop a shared admin password', score: 0, effects: { 'upgrade safety': -20 }, feedback: 'One leaked password would expose every customer. Use scoped credentials.' },
            { label: 'Email the form to sales to type in', score: 1, effects: { 'delivery speed': -15 }, feedback: 'No integration risk, but it is slow and error-prone.' }
          ] }
      ],
      outro: '**Configure first, code when you must, integrate through the supported API.**' },

    { type: 'explain', prompt: 'Explain why "just configure it" is usually better than "just write code" on a platform like Salesforce or Dynamics.',
      model: 'Configuration uses the vendor’s own supported features, so it keeps working through upgrades, admins can change it without developers, and it costs far less to maintain. Custom code is sometimes needed but must be tested, owned and fixed when the platform changes, and too much of it makes upgrades and moving vendor painful.',
      keywords: ['upgrade', 'supported', 'maintain', 'admin', 'code', 'cost'] }
  ],

  flashcards: [
    { q: 'What are the main building blocks of a CRM?', a: 'Leads (maybes), opportunities (deals), accounts (organisations), contacts (people) and cases (support problems).' },
    { q: 'What does multi-tenant mean?', a: 'Many customers share the same running software and infrastructure, each isolated from the others, like flats in a block.' },
    { q: 'What are governor limits?', a: 'Platform caps on how much work one piece of code can do (queries, records changed, run time), protecting other tenants.' },
    { q: 'Configuring vs customising?', a: 'Configuring uses admin settings and visual tools; customising means writing code. Prefer configuring: it is cheaper and survives upgrades.' },
    { q: 'What is Dynamics 365 and what is Dataverse?', a: 'Microsoft’s suite of business apps (CRM and ERP-style). Dataverse is the data layer underneath, shared with the Power Platform.' }
  ],

  glossary: [
    { term: 'SaaS', def: 'Software as a service: software you rent and use over the internet while the vendor runs and updates it.', like: 'Renting a flat instead of building a house.', aka: ['Software as a service'] },
    { term: 'Multi-tenant', def: 'An architecture where many customers share the same running system but their data is kept separate.', like: 'An apartment block with locked doors.' },
    { term: 'Object (Salesforce)', def: 'A table-like type of data in Salesforce, such as Account, holding records made of fields.', like: 'A spreadsheet tab with a fixed set of columns.' },
    { term: 'Governor limits', def: 'Hard caps in Salesforce on what a single transaction of code may do, to keep shared infrastructure fair.', like: 'A building rule saying no one may hog the lift.' },
    { term: 'Dataverse', def: 'Microsoft’s data platform that sits under Dynamics 365 and the Power Platform and stores their tables.', like: 'The shared filing room behind Microsoft’s business apps.' },
    { term: 'Configuration', def: 'Adjusting a package through its supported settings and visual tools, without writing code.', like: 'Moving the furniture, not rebuilding the walls.' }
  ],

  takeaways: [
    'A **CRM** gives the whole company one memory of every customer: leads, deals, accounts, contacts and cases.',
    '**Salesforce** and **Dynamics 365** are rented platforms you can build on, not only products you use.',
    '**Configure first, code when you must.** Customisation debt makes upgrades and exits painful.',
    'Both expose **APIs** for integration, with login by token and limits on call volume.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('es-ibm-emc', {
  eli5: 'A BPM suite runs the steps and approvals of a business process for you, and a document management system is a digital filing cabinet that tracks versions, access and how long to keep things.',

  cards: [
    { kind: 'concept', title: 'The approval that vanished',
      body: `Hollis wants to add a new supplier. The request starts as an email to the buyer, who forwards it to finance for a credit check, who forward it to a manager. A week later the supplier asks what is happening. Nobody knows who is holding it, or whether it was ever approved.

        The work is a **process**: a sequence of steps, decisions and hand-offs. The trouble is that it lives in inboxes, so nobody can see it, measure it or improve it.

        **Business process management (BPM)** software puts the process itself into a system that runs it, tracks it and shows where it is stuck.` },

    { kind: 'metaphor', title: 'A relay race with a referee',
      body: `A process is a relay race. Each person runs their leg, then hands over the baton. Without a referee, runners drop it, hand it to the wrong person or stand about waiting.

        A BPM engine is the referee: it knows the route, hands the baton (the **work item**) to the right runner, reminds slow ones, and records exactly how long each leg took.

        Where it stops being true: a real race has one fixed course. A business process has **decisions** (the track forks) and some legs are done by machines, not people.` },

    { kind: 'diagram', title: 'A supplier-onboarding process',
      body: 'Processes are drawn as flowcharts. Here is Hollis’s, with the fork where a decision is made.',
      nodes: [
        { id: 'req', label: 'Request submitted', icon: '📨', x: 1, y: 0 },
        { id: 'credit', label: 'Credit check (system)', icon: '🤖', x: 1, y: 1, tone: 'info' },
        { id: 'gate', label: 'Over £10,000?', icon: '❓', x: 1, y: 2, tone: 'warn' },
        { id: 'mgr', label: 'Manager approves (person)', icon: '🧑‍💼', x: 0, y: 3, tone: 'accent' },
        { id: 'auto', label: 'Auto-approve', icon: '✅', x: 2, y: 3, tone: 'good' },
        { id: 'erp', label: 'Create in ERP', icon: '🏭', x: 1, y: 4 }
      ],
      edges: [
        { from: 'req', to: 'credit' },
        { from: 'credit', to: 'gate' },
        { from: 'gate', to: 'mgr', label: 'yes' },
        { from: 'gate', to: 'auto', label: 'no' },
        { from: 'mgr', to: 'erp' },
        { from: 'auto', to: 'erp' }
      ],
      caption: 'Some boxes are people, some are systems. The engine runs the whole picture.' },

    { kind: 'concept', title: 'What a BPM suite actually does',
      body: `A BPM suite has three jobs:

        1. **Model.** Business analysts draw the process in a standard notation called **BPMN**, which both business people and developers can read.
        2. **Run.** An engine starts a fresh **process instance** for each request, hands tasks to people (as a to-do list) or calls other systems automatically, and remembers where each instance is.
        3. **Monitor.** Dashboards show how many are waiting, where they stall, and how long the whole thing takes.

        The drawing is not just documentation: it *is* the program the engine executes.` },

    { kind: 'realworld', title: 'IBM BPM and its family',
      body: `IBM offers a long-standing family of BPM products. Their pattern is the classic one: a **designer** tool where analysts and developers draw processes and wire up the steps, a **server** that runs them, and a **portal** where staff pick up their tasks.

        Names and packaging have shifted over the years, as vendors reorganise their catalogues, so do not memorise product titles. The *ideas* stay put.

        IBM’s suites are typically found in large organisations such as banks and insurers, where processes like claims or loan approvals are long, regulated and involve many hand-offs.

        You will often integrate with one by calling its services or by having it call yours.` },

    { kind: 'layers', title: 'What a document system adds to a folder',
      body: 'A **document management system (DMS)** is far more than a shared drive. Read from the top down.',
      layers: [
        { label: 'Retention & audit', note: 'How long to keep it, when to dispose, a log of who touched it', tone: 'bad', icon: '📜' },
        { label: 'Permissions', note: 'Who may read, edit or approve each document', tone: 'warn', icon: '🔐' },
        { label: 'Versions', note: 'Every change saved; check-out stops two people overwriting each other', tone: 'accent', icon: '🕰️' },
        { label: 'Metadata & search', note: 'Type, owner, customer, expiry date: findable without knowing the folder', tone: 'info', icon: '🔎' },
        { label: 'Storage', note: 'The files themselves, often in a repository', tone: 'muted', icon: '🗄️' }
      ] },

    { kind: 'history', title: 'EMC Documentum, and who owns it now',
      body: `**Documentum** is one of the best-known enterprise document systems. It began at a company of the same name, was bought by **EMC** in 2003, and EMC’s enterprise content business later passed (through the Dell EMC era) to **OpenText**, which owns it today. Hence "EMC Documentum" in older notes.

        Its core idea is a **repository** of content with metadata, security and a **lifecycle**: a document moves through states such as *Draft → In review → Approved → Effective → Archived*, and what you may do depends on the state.

        It is common in regulated industries, such as pharmaceuticals and finance, where you must prove which version was in force on a given day.` },

    { kind: 'sequence', title: 'A policy document’s life',
      body: 'Workflow and document system working together. Step through it.',
      actors: ['Author', 'Document system', 'Reviewer'],
      steps: [
        { from: 0, to: 1, label: 'upload draft v0.1', note: 'The author saves a new safety policy. It starts in the **Draft** state.' },
        { from: 1, to: 2, label: 'review task', note: 'A workflow sends the reviewer a task: "approve or reject".' },
        { from: 2, to: 1, label: 'approve', note: 'The reviewer’s decision is recorded against their name and the time.' },
        { at: 1, label: 'state → Effective, locked', note: 'The policy becomes v1.0. Editing is now blocked; changes must make a new version.' },
        { at: 1, label: 'retention clock starts', note: 'A rule says: keep for seven years after it is replaced. The system counts, nobody has to remember.' },
        { from: 1, to: 0, label: 'audit trail on request', dashed: true, note: 'An auditor can ask who changed or opened what, and when. The log answers.' }
      ] },

    { kind: 'concept', title: 'Compliance, retention and legal holds',
      body: `Some records must be **kept** for a minimum time (tax, safety, employment records, depending on country). Others should be **deleted** after a time, because holding data forever is itself a risk.

        A **records retention policy** says how long each type of document lives. Then, when the time is up, the system disposes of it.

        A **legal hold** pauses that: if a dispute is looming, the relevant documents must be frozen and *not* deleted, even if their retention has expired.

        All this is why documents go in a DMS instead of a shared folder, and why the workflow has a log that nobody can quietly edit. (The actual periods depend on law and country, so always ask legal.)` }
  ],

  activities: [
    { type: 'match', after: 3, prompt: 'Match each BPM job to what it covers.',
      pairs: [['Model', 'Drawing the process in a standard notation such as BPMN'], ['Run', 'Starting an instance per request and handing out tasks'], ['Monitor', 'Showing where work is stuck and how long it takes'], ['Process instance', 'One live run of the process, for one request'], ['Work item', 'The task currently waiting for a person or system']] },

    { type: 'tf', after: 3, statement: 'In a BPM suite, the engine runs the process diagram itself, rather than treating it as documentation.', answer: true,
      explain: 'In a BPM suite the diagram is executable: the engine follows it step by step, handing tasks to people and calling systems.' },

    { type: 'mcq', after: 5, q: 'Two people both want to edit the same policy. What does a DMS typically do to stop one overwriting the other?',
      options: ['Check-out locks, and each change creates a new version', 'It emails both a copy and hopes they merge it', 'It deletes the older file', 'It does nothing; the last save wins'],
      answer: 0,
      why: [null, 'That is how folders on email end up with "final_v3_REAL.docx".', 'Deleting history is the opposite of what a DMS is for.', 'Last-save-wins is the shared-drive problem a DMS solves.'],
      explain: 'Locking plus versioning preserves history and prevents silent overwrites, so you can always see what changed.' },

    { type: 'order', prompt: 'Put a document’s lifecycle in the likely order.',
      items: ['Draft', 'In review', 'Approved', 'Effective (locked)', 'Archived, then disposed after retention'],
      explain: 'A document cannot be approved before review, take effect before approval, or be disposed of while still in force.' },

    { type: 'bucket', prompt: 'Does this belong to the BPM suite or the document system?', buckets: ['BPM suite', 'Document system'],
      items: [['Route a request to a manager and escalate after two days', 0], ['Hold version 3 of a contract with its history', 1], ['Show a chart of where requests get stuck', 0], ['Enforce "delete after seven years"', 1], ['Decide which path to take if the amount is over £10,000', 0], ['Record who opened a confidential file', 1]],
      explain: 'BPM is about the *flow* of work and decisions. A DMS is about the *content*: versions, access and retention.' },

    { type: 'spot', prompt: 'This workflow definition has a serious ordering bug. Tap the line.',
      code: { lang: 'yaml', src: `
        process: new-policy
        steps:
          - draft
          - publish_to_staff
          - manager_review
          - approve
          - mark_effective` },
      lines: [4],
      explain: 'The policy is published to everyone *before* anyone reviews or approves it. Publishing should come after approval, as the last step.' },

    { type: 'cloze', text: 'A {{legal hold}} freezes documents so they cannot be deleted, even when their {{retention}} period has ended, while an {{audit trail}} records who did what and when.',
      distractors: ['version', 'metadata', 'check-out'],
      explain: 'Retention says when things may go. A legal hold overrides that, and the audit trail provides the evidence.' },

    { type: 'scenario', title: 'The tax audit', intro: 'An auditor arrives at Hollis and asks for the supplier contracts for the last six years, and proof of who approved each one.',
      meters: { 'audit result': 50, 'stress': 60 },
      steps: [
        { text: 'Where do you find the contracts?',
          choices: [
            { label: 'Search the document system by supplier and contract type', score: 2, effects: { 'audit result': 20, 'stress': -20 }, feedback: 'Metadata makes this a search, not an archaeological dig. Contracts are all in one place.' },
            { label: 'Ask each buyer to look in their email', score: 0, effects: { 'audit result': -25, 'stress': 20 }, feedback: 'Documents scattered across inboxes cannot be proven complete, and some will be gone.' },
            { label: 'Check the shared drive folders', score: 1, effects: { 'audit result': -5, 'stress': 5 }, feedback: 'Better than email, but the drive cannot tell you which version was signed.' }
          ] },
        { text: 'The auditor asks who approved Contract 118 and when.',
          choices: [
            { label: 'Show the workflow history and the audit trail', score: 2, effects: { 'audit result': 25, 'stress': -20 }, feedback: 'Every approval is recorded with a name and timestamp that people cannot quietly edit.' },
            { label: 'Say the manager remembers approving it', score: 0, effects: { 'audit result': -25, 'stress': 20 }, feedback: 'Memory is not evidence.' },
            { label: 'Produce an email chain', score: 1, effects: { 'audit result': -5 }, feedback: 'Better than nothing, but emails are easy to dispute and incomplete.' }
          ] },
        { text: 'Legal warns of a dispute with a supplier. Several of their contracts are due for deletion next month under the records retention policy.',
          choices: [
            { label: 'Apply a legal hold to those contracts', score: 2, effects: { 'audit result': 15, 'stress': -10 }, feedback: 'A hold overrides the normal retention schedule and preserves the evidence.' },
            { label: 'Let retention run; those are the rules', score: 0, effects: { 'audit result': -30, 'stress': 25 }, feedback: 'Destroying documents that are relevant to a dispute can be seriously illegal.' },
            { label: 'Copy them to a USB stick', score: 0, effects: { 'audit result': -20, 'stress': 15 }, feedback: 'You have broken the controls and created an unmanaged copy.' }
          ] }
      ],
      outro: 'Structure now saves panic later: **metadata, workflow history and retention rules** are the audit’s best friends.' },

    { type: 'explain', prompt: 'Explain the difference between a BPM suite and a document management system, and how they work together.',
      model: 'A BPM suite runs the flow of work: the steps, decisions and approvals between people and systems. A document management system looks after the documents: versions, access and retention. They work together when a workflow routes a document for approval and the DMS records its state, history and how long to keep it.',
      keywords: ['workflow', 'approval', 'versions', 'retention', 'documents', 'process'] }
  ],

  flashcards: [
    { q: 'What does a BPM suite do?', a: 'It models, runs and monitors business processes: it hands out tasks, makes decisions along the flow and shows where work is stuck.' },
    { q: 'What is BPMN?', a: 'Business Process Model and Notation: a standard diagram style for processes that both business and technical people can read.' },
    { q: 'What does a document management system add over a shared folder?', a: 'Versions, check-out locking, metadata and search, permissions, audit trail and retention rules.' },
    { q: 'What is Documentum?', a: 'A well-known enterprise content and document management system, originally EMC’s and now owned by OpenText, with repositories and lifecycles.' },
    { q: 'What is a legal hold?', a: 'A freeze on deleting documents relevant to a dispute, overriding the normal retention schedule.' }
  ],

  glossary: [
    { term: 'Process instance', def: 'One live run of a process, for one specific request, tracked by the BPM engine.', like: 'One runner’s journey through the relay course.' },
    { term: 'BPMN', def: 'A standard notation for drawing business processes, readable by both analysts and developers.', like: 'Sheet music for business processes.', aka: ['Business Process Model and Notation'] },
    { term: 'Workflow', def: 'The ordered flow of tasks and decisions that carries work from one person or system to the next.', like: 'The route the baton takes.' },
    { term: 'Records retention policy', def: 'A rule stating how long a type of document must be kept and when it should be destroyed.', like: 'A best-before date for paperwork.' },
    { term: 'Audit trail', def: 'A tamper-resistant log of who did what, and when.', like: 'The CCTV for your records.', aka: ['audit log'] },
    { term: 'Legal hold', def: 'A freeze that stops documents being deleted because they may be needed in a legal matter.', like: 'A police cordon around evidence.' }
  ],

  takeaways: [
    '**BPM** puts a process in a system that runs it, tracks it and shows where it is stuck.',
    'A BPM diagram (**BPMN**) is executable: the engine follows it, mixing human and automatic steps.',
    'A **DMS** adds versions, locking, permissions, audit trail and retention to plain files.',
    '**Documentum** and **IBM’s BPM family** are classic examples; learn the ideas, not the product names.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('es-integration', {
  eli5: 'Companies cannot rewrite their big vendor systems, so they connect them with a hub in the middle and translators at the edges, to stop everything becoming one tangled knot of wires.',

  cards: [
    { kind: 'concept', title: 'The wire-it-up-yourself years',
      body: `Hollis now owns an ERP, a CRM, a document system, a workflow engine, a web shop and a courier’s booking system. Each one needs data from some of the others.

        The first developer wires the web shop straight to the ERP. A year later another wires the CRM to the ERP, and someone else connects the CRM to the document system. Each link uses its own format, its own login and its own error handling.

        Nobody planned the whole picture. It just grew, one reasonable decision at a time. This is **point-to-point integration**, and it ends somewhere ugly.` },

    { kind: 'diagram', title: 'Spaghetti, drawn',
      body: 'Just four systems, each linked to every other directly.',
      nodes: [
        { id: 'shop', label: 'Web shop', icon: '🛒', x: 0, y: 0 },
        { id: 'erp', label: 'ERP', icon: '🏭', x: 2, y: 0, tone: 'accent' },
        { id: 'crm', label: 'CRM', icon: '🤝', x: 0, y: 2, tone: 'info' },
        { id: 'dms', label: 'Documents', icon: '🗄️', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'shop', to: 'erp', both: true },
        { from: 'shop', to: 'crm', both: true },
        { from: 'shop', to: 'dms', both: true },
        { from: 'erp', to: 'crm', both: true },
        { from: 'erp', to: 'dms', both: true },
        { from: 'crm', to: 'dms', both: true }
      ],
      caption: 'Six links for four systems, and each is a separate thing to build, secure and fix.' },

    { kind: 'concept', title: 'Why the knot gets worse faster than you think',
      body: `With **n** systems all linked directly you need up to **n × (n − 1) ÷ 2** connections.

        | Systems | Direct links |
        |---|---|
        | 4 | 6 |
        | 10 | 45 |
        | 20 | 190 |

        Doubling the systems roughly *quadruples* the links. Worse, when the ERP upgrades or changes a field, every connection touching it may break, and nobody has a map of which ones.

        In practice you rarely connect every pair, but it only takes a few dozen links before changing anything feels dangerous.` },

    { kind: 'diagram', title: 'Put a hub in the middle',
      body: 'Instead of every system learning every other system, each connects **once**, to a shared integration layer.',
      nodes: [
        { id: 'shop', label: 'Web shop', icon: '🛒', x: 0, y: 0 },
        { id: 'crm', label: 'CRM', icon: '🤝', x: 2, y: 0, tone: 'info' },
        { id: 'hub', label: 'Integration platform', icon: '🔌', x: 1, y: 1, tone: 'accent' },
        { id: 'erp', label: 'ERP', icon: '🏭', x: 0, y: 2 },
        { id: 'dms', label: 'Documents', icon: '🗄️', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'shop', to: 'hub', both: true },
        { from: 'crm', to: 'hub', both: true },
        { from: 'erp', to: 'hub', both: true },
        { from: 'dms', to: 'hub', both: true }
      ],
      caption: 'Four links instead of six, and adding a fifth system adds one link, not four.' },

    { kind: 'concept', title: 'iPaaS: the hub, rented',
      body: `An **iPaaS** (integration platform as a service) is a hosted hub. It offers ready-made **connectors** for popular products (Salesforce, SAP, Dynamics and many others), tools to **map** one format to another, built-in **retries and error queues**, and dashboards to see what flowed and what failed.

        Names you will meet include MuleSoft, Boomi and the integration services of the big cloud providers. Older on-premises versions of the same idea were called **enterprise service buses**.

        It is not magic. The hub is one more system to pay for, learn and keep up, and if it goes down, everything stops. Many teams pair it with queues or events, as you saw in the messaging world.` },

    { kind: 'metaphor', title: 'The interpreter at the meeting',
      body: `Picture a meeting where the German-speaking ERP, the Spanish-speaking CRM and your English-speaking shop all need to agree an order. If everyone learns everyone else’s language, nobody ever stops studying.

        Hire an interpreter for each side instead. Your shop speaks only *its* language and the interpreter handles the rest. If the ERP changes its dialect, only the interpreter retrains.

        In software this interpreter is an **anti-corruption layer**: a thin translation layer that keeps a legacy system’s odd model from leaking into your clean code. You met the idea in the domain-design world; here it is in a real setting.` },

    { kind: 'code', title: 'An anti-corruption layer in a dozen lines',
      body: 'The legacy system says things in its own way. This one function is the **only** place that knows. Tap the lines.',
      code: { lang: 'js', src: `
        // legacy-adapter.js: the only file that knows the old names
        const STATUS = { A: 'open', B: 'shipped', C: 'closed' };

        export function toOrder(row) {
          return {
            id: row.ORD_NO.trim(),
            customerId: 'C-' + row.CUST_NO,
            status: STATUS[row.STAT_CD] ?? 'unknown',
            total: Number(row.AMT_X100) / 100
          };
        }`,
        notes: {
          1: 'One file owns the translation. Everyone else imports clean `Order` objects.',
          2: 'Cryptic one-letter codes become words your whole team can read.',
          6: 'Stray spaces are common in old systems. Clean them at the border.',
          8: '`?? \'unknown\'` handles a code you did not expect, instead of crashing.',
          9: 'The legacy stores money as whole pence. The adapter converts, so nobody else has to remember.'
        } },
      note: 'If the vendor changes `STAT_CD` next year, you edit this one file, not forty.' },

    { kind: 'pitfall', title: 'Vendor lock-in',
      body: `**Lock-in** means switching away would cost so much that you effectively cannot. It creeps in through:

        - your data in a format only that vendor can export well
        - business rules written in the vendor’s own scripting language
        - workflows drawn in the vendor’s own tool
        - staff whose skills are specific to that product

        It is not always bad: a good package can be worth it. But decide knowingly. Reduce the damage by keeping core business logic in your own code, using standard formats and APIs, insisting on a full data export, putting an anti-corruption layer in front, and writing down a rough exit plan.`,
      note: 'Experts disagree on how hard to fight lock-in. Avoiding it entirely can cost more than it saves.' },

    { kind: 'concept', title: 'Data ownership and master data',
      body: `Back to Dev Patel, who exists in three systems with three different IDs:

        | System | Customer ID | Name shown |
        |---|---|---|
        | ERP | C-1042 | PATEL DEV |
        | CRM | ACC-77 | Dev Patel |
        | Shop | 9031 | dev p. |

        **Master data** is the shared core data (customers, products, suppliers) that many systems need. **Master data management (MDM)** designates one **golden record** and a mapping between all the IDs, so everyone agrees these three rows are one person.

        And it needs an **owner**: a named business person responsible for its quality, not just an IT team keeping the server up.` }
  ],

  activities: [
    { type: 'estimate', after: 2, q: 'A company has 10 systems and connects every pair directly. About how many connections must be built and maintained?', answer: 45, unit: 'connections', min: 1, max: 1000, tolerance: 1.5,
      explain: 'Ten systems have 10 × 9 ÷ 2 = 45 pairs. This growth is the whole reason integration hubs exist.' },

    { type: 'tf', after: 4, statement: 'Putting an integration platform in the middle removes the need to understand each system’s data format.', answer: false,
      explain: 'Someone still has to map each system’s format to the common one. The hub centralises that work and gives it monitoring, retries and reuse; it does not make it vanish.' },

    { type: 'mcq', after: 6, q: 'The legacy system renames its status field from `STAT_CD` to `STATUS_CODE`. With a proper anti-corruption layer, what changes?',
      options: ['Only the adapter file', 'Every service that handles orders', 'The database of the new system', 'Nothing; the new system finds out automatically'],
      answer: 0,
      why: [null, 'That is exactly the ripple an anti-corruption layer is meant to prevent.', 'Your own data model should not depend on the legacy names at all.', 'Software does not guess; the adapter must be updated.'],
      explain: 'Only the adapter knows the legacy names, so only it needs changing. The rest of the code talks to clean `Order` objects.' },

    { type: 'match', prompt: 'Match each integration idea to its purpose.',
      pairs: [['Point-to-point', 'Each system wired directly to each other one'], ['iPaaS', 'A hosted hub with connectors, mapping and monitoring'], ['Anti-corruption layer', 'Translating a legacy model so it does not leak in'], ['Master data management', 'Agreeing one golden record for shared data'], ['Vendor lock-in', 'Switching away becomes prohibitively costly']] },

    { type: 'spot', prompt: 'Your clean order service should not know the legacy system’s oddities. Tap the line that leaks them.',
      code: { lang: 'js', src: `
        // order-service.js
        import { toOrder } from './legacy-adapter.js';

        function describe(row) {
          const order = toOrder(row);
          if (row.STAT_CD === 'B') return 'Order is on its way';
          return 'Order ' + order.id + ' is ' + order.status;
        }` },
      lines: [6],
      explain: 'Line 6 reads the legacy code `STAT_CD` directly, bypassing the adapter. If the legacy codes change, this service breaks. It should use `order.status`.' },

    { type: 'bucket', prompt: 'Does each choice increase or reduce lock-in risk?', buckets: ['Increases lock-in', 'Reduces lock-in'],
      items: [['Writing core pricing rules in the vendor’s own script language', 0], ['Keeping pricing rules in your own code, called by the vendor via API', 1], ['Storing data only in a proprietary format', 0], ['Regularly testing a full export in an open format', 1], ['Putting an anti-corruption layer in front of the vendor', 1], ['Training every team only on that product’s quirks', 0]],
      explain: 'Lock-in grows where your logic, data and skills are *inside* the vendor’s product. It shrinks when you keep them in your own hands behind clear interfaces.' },

    { type: 'short', q: 'What do we call the single agreed, authoritative version of a customer record across all systems? (two words)', accept: ['golden record', 'the golden record', 'master record'], hint: 'It is named after a precious metal.',
      explain: 'The **golden record** is what master data management aims for: one trusted version, with a mapping to each system’s ID.' },

    { type: 'scenario', title: 'The company merger', intro: 'Hollis Hardware has just merged with a rival, Garrity Tools. You now have two ERPs, two CRMs and two customer lists. The board wants a single customer view in six months.',
      meters: { 'risk': 30, 'time left': 80 },
      steps: [
        { text: 'The quickest idea is to replace both ERPs with one new one. What do you say?',
          choices: [
            { label: 'Not first. Connect the existing systems through an integration layer to get a unified customer view, and plan the ERP decision separately', score: 2, effects: { 'risk': -10, 'time left': -15 }, feedback: 'Replacing an ERP takes years. Integration gets the board its customer view in time, and keeps options open.' },
            { label: 'Start a full ERP replacement and promise the view in six months', score: 0, effects: { 'risk': 35, 'time left': -35 }, feedback: 'An ERP replacement in six months is a famous way to fail. The board gets neither.' },
            { label: 'Wire the two CRMs directly to each other', score: 1, effects: { 'risk': 10, 'time left': -10 }, feedback: 'It works for two. But every new system will need its own links, and you are rebuilding the spaghetti.' }
          ] },
        { text: 'Dev Patel shops at both chains and appears in both CRMs with different IDs. How do you create one customer view?',
          choices: [
            { label: 'Build master data: match records, keep a golden record and an ID mapping, and name a data owner', score: 2, effects: { 'risk': -15, 'time left': -10 }, feedback: 'Yes. Matching and mapping IDs is the heart of it, and an owner keeps it accurate.' },
            { label: 'Concatenate both lists into one table', score: 0, effects: { 'risk': 20 }, feedback: 'Now Dev Patel is in the list twice, and the marketing team emails him twice.' },
            { label: 'Delete duplicates by name only', score: 1, effects: { 'risk': 15 }, feedback: 'Two different customers called Dev Patel are now merged into one. Names are not identifiers.' }
          ] },
        { text: 'Garrity’s ERP uses very different field names and codes. How do your new services use its data?',
          choices: [
            { label: 'Add an anti-corruption layer that translates it to your clean model', score: 2, effects: { 'risk': -10 }, feedback: 'The odd names stay in one adapter, and your new code stays clean.' },
            { label: 'Use Garrity’s field names everywhere in the new code', score: 0, effects: { 'risk': 25 }, feedback: 'Your new code is now tied to a system that may soon be retired.' },
            { label: 'Rename the fields inside Garrity’s ERP', score: 1, effects: { 'risk': 20, 'time left': -15 }, feedback: 'You are modifying a system you do not own, and breaking everything that depends on it.' }
          ] }
      ],
      outro: 'When you cannot change the systems, **connect through a hub, translate at the edge and agree who owns the data**.' },

    { type: 'explain', prompt: 'Explain, to a manager, why connecting every system directly to every other is a bad idea, and what you would do instead.',
      model: 'Direct links multiply quickly as systems are added, each with its own format and error handling, and a change in one system can break many links nobody has mapped. Instead each system connects once to an integration platform that maps formats, retries and monitors, with translation layers at the edges to protect new code from legacy models.',
      keywords: ['point-to-point', 'hub', 'integration platform', 'change', 'translate', 'monitor'] }
  ],

  flashcards: [
    { q: 'Why is point-to-point integration a problem at scale?', a: 'Links grow roughly with the square of the systems (n × (n − 1) ÷ 2), each with its own formats and failures, and a change in one system ripples unpredictably.' },
    { q: 'What is an iPaaS?', a: 'An integration platform as a service: a hosted hub with connectors, data mapping, retries and monitoring, so systems connect once to the hub.' },
    { q: 'What is an anti-corruption layer?', a: 'A translation layer that keeps a legacy or external system’s model from leaking into your own code.' },
    { q: 'How does vendor lock-in creep in, and how do you limit it?', a: 'Through proprietary data, logic, workflows and skills inside the product. Limit it by owning your logic and data, using standard formats and APIs, and having an exit plan.' },
    { q: 'What is master data and what is a golden record?', a: 'Master data is shared core data like customers and products. A golden record is the one agreed version, mapped to each system’s IDs.' }
  ],

  glossary: [
    { term: 'Point-to-point integration', def: 'Connecting systems by wiring each pair directly together, which multiplies quickly as systems are added.', like: 'Everyone in a company phoning everyone else directly.', aka: ['spaghetti integration'] },
    { term: 'iPaaS', def: 'Integration platform as a service: a hosted hub with connectors, mapping, retries and monitoring that systems plug into.', like: 'A central telephone exchange.', aka: ['Integration Platform as a Service'] },
    { term: 'Anti-corruption layer', def: 'A thin layer that translates between a legacy system’s model and your own, so the legacy design does not spread.', like: 'An interpreter at the border.', aka: ['ACL'] },
    { term: 'Vendor lock-in', def: 'A situation where moving away from a vendor would cost so much that you are effectively stuck with them.', like: 'A phone contract that is too expensive to leave.' },
    { term: 'Master data', def: 'The core shared records, such as customers, products and suppliers, that many systems rely on.', like: 'The company’s shared address book.', aka: ['MDM'] },
    { term: 'Golden record', def: 'The single, trusted version of a master-data record, with a mapping to the IDs used in each system.', like: 'The original, signed copy.' }
  ],

  takeaways: [
    '**Point-to-point** links multiply quickly and break unpredictably as systems grow.',
    'An **integration platform / iPaaS** gives each system one connection to a shared hub, with mapping, retries and monitoring.',
    'An **anti-corruption layer** keeps a legacy system’s quirks in one translating adapter.',
    'Limit **lock-in** by owning your logic and data, and give shared **master data** a golden record and an owner.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('enterprise-software', {
  title: 'The Legacy Leviathan',
  intro: 'Deep in the server room sleeps a beast made of forty-year-old acronyms and unlabelled cables. Prove you can tell ERP from CRM, configure before you code, and untangle its wiring without waking it.',
  questions: [
    { type: 'mcq', q: 'A customer rings Hollis to say their address has changed. Which kind of system is the natural home for the full history of every call and email with them?',
      options: ['A CRM', 'An ERP', 'A document management system', 'A BPM suite'],
      answer: 0,
      why: [null, 'An ERP holds orders, stock and ledgers, not the relationship history.', 'A DMS stores documents and their versions, not conversations.', 'A BPM suite routes work, it is not the customer’s memory.'],
      explain: 'Relationship history (contacts, calls, cases, deals) is what a CRM exists to keep.' },

    { type: 'tf', statement: 'A system of record is the system whose copy of a piece of data is treated as the official one when copies disagree.', answer: true,
      explain: 'That is the definition. Other copies may be stale, so they read from it or sync from it.' },

    { type: 'order', prompt: 'Put the order-to-cash journey in order.',
      items: ['Sales order created', 'Stock reserved', 'Goods delivered', 'Invoice booked in finance', 'Customer payment matched'],
      explain: 'Each step needs the one before it: no reservation without an order, no invoice before delivery, and no matching payment before there is an invoice.' },

    { type: 'mcq', q: 'Why is a column-oriented, in-memory database like HANA good at "total sales by region over millions of rows"?',
      options: ['It reads only the needed columns, from fast memory', 'It stores every order as one whole row on disk', 'It avoids doing any summing', 'It pauses the ERP while the report runs'],
      answer: 0,
      explain: 'Only region and amount are needed. A column store scans just those, and RAM is far faster than disk.' },

    { type: 'bucket', prompt: 'Sort each item into the right SAP layer.', buckets: ['ERP modules', 'HANA', 'BusinessObjects'],
      items: [['Reserves stock for a sales order', 0], ['Serves working data from memory', 1], ['Dashboard of margin by region', 2], ['Books a supplier invoice to the ledger', 0], ['Stores tables by column', 1], ['Formatted invoice reports', 2]],
      explain: 'The modules hold business logic, HANA is the database beneath, and BusinessObjects is the reporting layer on top.' },

    { type: 'spot', prompt: 'A developer proposes this to mark orders shipped in the ERP. Tap the line that is the problem.',
      code: { lang: 'sql', src: `
        -- nightly job, run directly on the ERP database
        UPDATE sales_orders
        SET status = 'SHIPPED'
        WHERE id IN (SELECT id FROM courier_pickups);` },
      lines: [2, 3],
      explain: 'Writing straight into the ERP’s tables skips its business rules, stock postings and audit trail. Use the ERP’s supported API or business function instead.' },

    { type: 'ab', q: 'Which is the better way to make a field mandatory in Salesforce or Dynamics?',
      a: { lang: 'text', label: 'Admin setting', src: `
        Tick "Required" on the field
        in the admin screen.` },
      b: { lang: 'text', label: 'Custom code', src: `
        Write a code trigger that
        rejects the record if the
        field is empty.` },
      answer: 'a',
      explain: 'Configuration uses supported features, is changeable by an admin and survives upgrades. Custom code costs more to test, own and fix, so keep it for what settings cannot do.' },

    { type: 'multi', q: 'Which are typical features of a document management system, beyond a shared folder?',
      options: ['Version history with check-out locking', 'An audit trail of who opened what', 'Retention rules and legal holds', 'Automatically writing the documents for you', 'Replacing the ledger in finance'],
      answers: [0, 1, 2],
      explain: 'Versions, audit trails and retention are the core of a DMS. It does not author documents or replace an ERP.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['BPMN', 'A standard notation for drawing business processes'], ['Governor limits', 'Caps on one transaction’s work on a shared platform'], ['Legal hold', 'A freeze on deleting documents relevant to a dispute'], ['Dataverse', 'The data layer under Dynamics 365'], ['Process instance', 'One live run of a process for one request']] },

    { type: 'estimate', q: 'A company has 20 systems all wired directly to each other. About how many connections is that?', answer: 190, unit: 'connections', min: 1, max: 1000, tolerance: 1.5,
      explain: '20 × 19 ÷ 2 = 190. This quadratic growth is why a shared hub scales better.' },

    { type: 'cloze', text: 'An {{anti-corruption layer}} translates a legacy system’s model so it does not leak, while a {{golden record}} is the single trusted version of shared {{master data}}.',
      distractors: ['audit trail', 'process instance', 'governor limit'],
      explain: 'The first protects your code from legacy models. The other two deal with agreeing one version of shared customer, product or supplier data.' },

    { type: 'short', q: 'What is it called when leaving a vendor would cost so much that you are effectively stuck? (two words: vendor ...)', accept: ['vendor lock-in', 'vendor lock in', 'lock-in', 'lock in', 'lockin'], hint: 'Think of a door that cannot be opened from your side.',
      explain: '**Lock-in** creeps in through proprietary data, logic and skills. Own your logic and data, use standards and plan an exit.' }
  ]
});

KS.sheet('enterprise-software', {
  title: 'Enterprise software: cheat sheet',
  sections: [
    { title: 'The four acronyms',
      md: `| System | Looks after | Asks |
        |---|---|---|
        | **ERP** | Money, stock, buying, payroll | What did we sell and owe? |
        | **CRM** | Customers, leads, deals, cases | Who is this customer? |
        | **DMS** | Documents, versions, retention | Where is the signed copy? |
        | **BPM** | Flow of work and approvals | Who still has to approve? |

        A **system of record** is the official owner of one kind of data. **Buy** commodities, **build** your edge, **integrate** rather than duplicate.` },

    { title: 'SAP at a glance',
      md: `| Piece | What it is |
        |---|---|
        | **ERP modules** | FI/CO (finance), MM (stock and buying), SD (sales), PP (production), HCM (people) |
        | **HANA** | In-memory, column-oriented database |
        | **BusinessObjects** | Reporting and business intelligence |

        **Order-to-cash:** order, reserve stock, deliver, invoice, payment matched.
        **Integrate through:** APIs, BAPIs/RFC, IDocs, events. **Never** write into its tables.` },

    { title: 'Salesforce vs Dynamics 365',
      md: `| | Salesforce | Dynamics 365 |
        |---|---|---|
        | Roots | CRM, born in the cloud | Microsoft’s CRM and ERP suite |
        | Data model | Objects, fields, records | Tables in Dataverse |
        | Build with | Flow, Apex code, Lightning | Power Apps, Power Automate |
        | Pull | AppExchange ecosystem | Microsoft 365 and Azure fit |

        Both are rented (**SaaS**) and reached by **REST APIs** with limits. Salesforce is **multi-tenant**, with **governor limits**.` },

    { title: 'Configure vs customise',
      md: `- **Configure:** admin settings and visual tools. Supported, upgrade-safe, cheaper.
        - **Customise:** code written on the platform. Needs tests, an owner and upgrade care.

        **Order of attack:** change the process, then configure, then code, then integrate externally.

        **Customisation debt:** hundreds of custom fields and tangled automations make upgrades terrifying and vendor changes impossible. Document everything and delete what is unused.` },

    { title: 'BPM and document management',
      md: `**BPM suite:** model (BPMN), run (instances and tasks), monitor (stuck work).
        **IBM BPM family:** designer, server, task portal. Product names shift over the years; the ideas do not.

        **DMS layers:** storage, metadata and search, versions and check-out, permissions, retention and audit.
        **Documentum:** repository with lifecycles (Draft, Review, Approved, Effective, Archived); EMC's, now OpenText's.

        **Retention** says how long to keep and when to dispose. **Legal hold** freezes deletion. **Audit trail** proves who did what.` },

    { title: 'Integration',
      md: `**Point-to-point** links grow as n × (n − 1) ÷ 2: 4 systems 6, 10 systems 45, 20 systems 190.

        | Idea | Use |
        |---|---|
        | **iPaaS / hub** | One connection per system, with mapping, retries and monitoring |
        | **Anti-corruption layer** | One adapter keeps legacy names and codes out of your code |
        | **Master data + golden record** | One agreed customer, product or supplier, with an ID map |
        | **Data owner** | A named business person, not just IT |

        **Lock-in:** keep logic and data in your hands, use standards, test your exports, have an exit plan.` }
  ]
});

